# DormPower JUC 并发实现深度分析报告

## 目录

1. [项目并发架构概述](#1-项目并发架构概述)
2. [虚拟线程机制深度解析](#2-虚拟线程机制深度解析)
3. [线程池配置与原理](#3-线程池配置与原理)
4. [ConcurrentHashMap 实现原理](#4-concurrenthashmap-实现原理)
5. [CopyOnWrite 集合原理](#5-copyonwrite-集合原理)
6. [原子类与 CAS 机制](#6-原子类与-cas-机制)
7. [锁机制与虚拟线程](#7-锁机制与虚拟线程)
8. [定时任务调度原理](#8-定时任务调度原理)
9. [开发经验与最佳实践总结](#9-开发经验与最佳实践总结)
10. [面试题与实战问答](#10-面试题与实战问答大厂面试官视角)

---

## 1. 项目并发架构概述

### 1.1 并发需求分析

DormPower 是基于 Java 21 + Spring Boot 3.2 的 IoT 宿舍电力管理平台，部署在 2 核 2GB 服务器上。系统需要处理以下并发场景：

```
┌─────────────────────────────────────────────────────────────────┐
│                        并发请求入口                              │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│ MQTT 设备   │ WebSocket   │ HTTP API    │ 定时任务              │
│ 10,000+     │ 实时推送    │ REST 请求   │ 缓存清理/监控         │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬────────────────┘
       │             │             │             │
       ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    线程池层 (DynamicThreadPoolConfig)            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ mqttExecutor    │ websocketExec   │ dynamicExecutor             │
│ (虚拟线程)       │ (虚拟线程)       │ (平台线程池)                │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    并发数据结构层                                │
├──────────────────┬──────────────────┬──────────────────────────┤
│ ConcurrentHashMap│ CopyOnWriteSet   │ AtomicInteger/Long       │
│ 设备/会话映射    │ WebSocket 会话   │ 消息计数/统计            │
└──────────────────┴──────────────────┴──────────────────────────┘
```

### 1.2 JUC 组件应用总览

| 组件                                 | 使用位置              | 核心作用       | 选择原因           |
| ------------------------------------ | --------------------- | -------------- | ------------------ |
| `Executors.newThreadPerTaskExecutor` | MQTT/WebSocket 执行器 | 虚拟线程执行   | I/O 密集型，高并发 |
| `ThreadPoolExecutor`                 | 动态线程池            | CPU 密集型任务 | 可控资源消耗       |
| `ConcurrentHashMap`                  | 设备管理、缓存        | 高并发读写     | 细粒度锁，高性能   |
| `CopyOnWriteArraySet`                | WebSocket 会话        | 读多写少       | 无锁读，线程安全   |
| `CopyOnWriteArrayList`               | 历史任务记录          | 读多写少       | 迭代安全           |
| `AtomicInteger/Long`                 | 消息计数器            | 原子操作       | 无锁计数           |
| `ReentrantLock`                      | 订阅操作              | 互斥访问       | 虚拟线程友好       |
| `volatile`                           | 状态标志              | 可见性保证     | 轻量级同步         |
| `ScheduledExecutorService`           | 缓存清理              | 定时任务       | 灵活调度           |

---

## 2. 虚拟线程机制深度解析	

### 2.1 为什么选择虚拟线程

项目采用 Java 21 虚拟线程处理 MQTT 和 WebSocket 的 I/O 密集型任务。

**平台线程 vs 虚拟线程对比**：

| 特性     | 平台线程 (Platform Thread) | 虚拟线程 (Virtual Thread)                  |
| -------- | -------------------------- | ------------------------------------------ |
| 映射关系 | 1:1 映射到 OS 线程         | M:N 映射（多个虚拟线程映射到少数载体线程） |
| 内存占用 | ~1MB 栈空间                | ~2KB 栈空间（按需增长）                    |
| 创建开销 | 系统调用，昂贵             | 普通 Java 对象，廉价                       |
| 阻塞行为 | 阻塞 OS 线程               | 仅阻塞虚拟线程，释放载体线程               |
| 最大数量 | 数千（受限于内存）         | 数百万                                     |
| 适用场景 | CPU 密集型                 | I/O 密集型                                 |

### 2.2 虚拟线程实现原理

```
┌─────────────────────────────────────────────────────────────┐
│                    JVM 虚拟线程调度模型                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   虚拟线程 VT1 ──┐                                          │
│   虚拟线程 VT2 ──┼──→ 载体线程 CT1 ──→ OS 线程 1            │
│   虚拟线程 VT3 ──┤       (ForkJoinPool)                     │
│   ...           │                                          │
│   虚拟线程 VTN ──┼──→ 载体线程 CT2 ──→ OS 线程 2            │
│                 │                                          │
└─────────────────┴───────────────────────────────────────────┘

关键机制：
1. 虚拟线程在 I/O 阻塞时会自动卸载（unmount）
2. 载体线程被释放，可执行其他虚拟线程
3. I/O 完成后，虚拟线程重新挂载（mount）到载体线程
```

**核心源码分析**：

```java
// 虚拟线程创建入口（Java 21）
Thread.ofVirtual()
    .name("mqtt-vt-", 0)
    .uncaughtExceptionHandler((t, e) -> logger.error("异常", e))
    .factory();

// 内部实现简化逻辑
public Thread newThread(Runnable task) {
    // 创建虚拟线程，继承 VirtualThread 类
    return new VirtualThread(
        scheduler,           // ForkJoinPool 调度器
        name,                // 线程名称
        characteristics,     // 线程特性
        task                 // 要执行的任务
    );
}
```

**虚拟线程生命周期**：

```
┌──────────┐     start()     ┌──────────┐     run()完成     ┌──────────┐
│   NEW    │ ──────────────→ │  STARTED │ ────────────────→ │ TERMINATED│
└──────────┘                 └──────────┘                   └──────────┘
                                  │
                                  │ 遇到阻塞操作
                                  ▼
                             ┌──────────┐
                             │  PARKED  │ ← 阻塞状态，已卸载
                             └──────────┘
                                  │
                                  │ 阻塞结束
                                  ▼
                             ┌──────────┐
                             │  RUNNABLE│ ← 重新挂载，等待调度
                             └──────────┘
```

### 2.3 项目中的应用

[DynamicThreadPoolConfig.java](backend/src/main/java/com/dormpower/config/DynamicThreadPoolConfig.java):

```java
@Bean(name = "mqttExecutor")
public ExecutorService mqttExecutor() {
    // 创建虚拟线程工厂
    ThreadFactory mqttThreadFactory = Thread.ofVirtual()
            .name("mqtt-vt-", 0)  // 线程名: mqtt-vt-0, mqtt-vt-1, ...
            .uncaughtExceptionHandler((t, e) ->
                logger.error("MQTT线程异常 [{}]: {}", t.getName(), e.getMessage(), e))
            .factory();

    // 每个任务创建一个虚拟线程
    return Executors.newThreadPerTaskExecutor(mqttThreadFactory);
}
```

**设计决策分析**：

1. **为什么不使用线程池？**
   - 虚拟线程创建成本极低，无需复用
   - 池化反而限制了并发能力
   - `newThreadPerTaskExecutor` 每任务一线程，最大化并发

2. **为什么适合 MQTT 场景？**
   - MQTT 消息处理主要是 I/O 操作（网络、数据库）
   - 10,000+ 设备连接，平台线程池无法支撑
   - 虚拟线程阻塞时不消耗载体线程资源

### 2.4 载体线程钉住问题

**什么是钉住（Pinning）？**

当虚拟线程在 `synchronized` 块内执行阻塞操作时，载体线程无法释放，导致"钉住"。

```java
// ❌ 错误：synchronized 块会导致载体线程钉住
synchronized (lock) {
    // 执行 I/O 操作时，载体线程无法释放
    // 相当于退化为平台线程的行为
    socket.read();  // 阻塞操作
}

// ✅ 正确：使用 ReentrantLock
lock.lock();
try {
    socket.read();  // 虚拟线程正常卸载，载体线程释放
} finally {
    lock.unlock();
}
```

**项目中的正确实践**（WebSocketManager.java）：

```java
// 使用 ReentrantLock 替代 synchronized，避免钉住问题
private final ReentrantLock subscriptionLock = new ReentrantLock();

public void subscribeDevice(WebSocketSession session, String deviceId) {
    subscriptionLock.lock();
    try {
        // 订阅逻辑
    } finally {
        subscriptionLock.unlock();
    }
}
```

---

## 3. 线程池配置与原理

### 3.1 线程池架构设计

项目采用混合线程池策略：I/O 密集型使用虚拟线程，CPU 密集型使用平台线程池。

```
┌─────────────────────────────────────────────────────────────────┐
│                      线程池架构                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  I/O 密集型任务                  CPU 密集型任务                  │
│  ┌─────────────────┐            ┌─────────────────┐            │
│  │ mqttExecutor    │            │ dynamicExecutor │            │
│  │ websocketExecutor│           │ (ThreadPoolExecutor)│         │
│  │ (虚拟线程)       │            │ (平台线程池)      │            │
│  └────────┬────────┘            └────────┬────────┘            │
│           │                              │                      │
│           │ 无池化，每任务一虚拟线程        │ 有池化，复用线程    │
│           │ 适合: MQTT/WebSocket         │ 适合: 计算/加密      │
│           │                              │                      │
│  ┌────────┴────────┐            ┌────────┴────────┐            │
│  │ mqtt-vt-0       │            │ platform-cpu-1  │            │
│  │ mqtt-vt-1       │            │ platform-cpu-2  │            │
│  │ ...             │            │ ... (最多10个)   │            │
│  │ mqtt-vt-N       │            │                 │            │
│  └─────────────────┘            └─────────────────┘            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ scheduledExecutor (平台线程，定时任务)                        ││
│  │ - 缓存清理                                                   ││
│  │ - 监控任务                                                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 ThreadPoolExecutor 核心原理

**参数详解**：

```java
@Bean(name = "dynamicExecutor")
public ThreadPoolExecutor dynamicExecutor() {
    return new ThreadPoolExecutor(
        corePoolSize,           // 核心线程数（常驻）
        maxPoolSize,            // 最大线程数（峰值）
        keepAliveSeconds,       // 非核心线程存活时间
        TimeUnit.SECONDS,       // 时间单位
        new LinkedBlockingQueue<>(queueCapacity),  // 工作队列
        new NamedThreadFactory("platform-cpu"),    // 线程工厂
        new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
    );
}
```

**任务执行流程**：

```
                        提交任务
                           │
                           ▼
              ┌────────────────────────┐
              │ 当前线程数 < corePoolSize? │
              └────────────┬───────────┘
                     │ 是          │ 否
                     ▼             ▼
              创建核心线程    ┌──────────────────┐
                              │ 队列是否未满?     │
                              └────────┬─────────┘
                                  │ 是      │ 否
                                  ▼         ▼
                            加入队列等待   ┌─────────────────────┐
                                          │ 当前线程数 < maxPoolSize?│
                                          └──────────┬──────────┘
                                                │ 是        │ 否
                                                ▼           ▼
                                          创建非核心线程  执行拒绝策略
```

**线程池状态管理**：

```java
// 线程池使用 AtomicInteger 的 ctl 字段同时维护状态和线程数
// 高 3 位存储状态，低 29 位存储线程数

private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

// 状态流转
RUNNING    (-1) → 接受新任务，处理队列任务
SHUTDOWN   (0)  → 不接受新任务，但处理队列任务（调用 shutdown()）
STOP       (1)  → 不接受新任务，不处理队列任务，中断正在执行任务（调用 shutdownNow()）
TIDYING    (2)  → 所有任务已终止，workerCount 为 0
TERMINATED (3)  → terminated() 方法完成
```

### 3.3 拒绝策略对比

| 策略                | 行为                            | 适用场景                 | 项目使用          |
| ------------------- | ------------------------------- | ------------------------ | ----------------- |
| AbortPolicy         | 抛出 RejectedExecutionException | 需要感知失败             | ❌                 |
| CallerRunsPolicy    | 调用者线程执行                  | 任务不能丢失，可接受降速 | ✅ dynamicExecutor |
| DiscardPolicy       | 静默丢弃                        | 非关键任务               | ❌                 |
| DiscardOldestPolicy | 丢弃最老任务，重试提交          | 优先新任务               | ❌                 |

**项目选择 CallerRunsPolicy 原因**：

- 任务不丢失（重要业务逻辑）
- 自动降速（调用者线程忙于执行任务时无法提交新任务）
- 避免异常传播

### 3.4 线程池参数计算公式

```java
// CPU 密集型任务
核心线程数 = CPU 核心数 + 1

// I/O 密集型任务（如果不用虚拟线程）
核心线程数 = CPU 核心数 × (1 + 等待时间/计算时间)
// 或简化为
核心线程数 = CPU 核心数 × 2

// 项目配置（2核服务器）
@Bean(name = "dynamicExecutor")
public ThreadPoolExecutor dynamicExecutor() {
    // CPU 密集型：2 + 1 = 3，实际配置 2
    // 最大线程数：考虑突发流量，配置 10
    // 队列：100，防止 OOM
}
```

---

## 4. ConcurrentHashMap 实现原理

### 4.1 项目中的应用场景

| 位置                 | 数据结构                             | 用途                 |
| -------------------- | ------------------------------------ | -------------------- |
| WebSocketManager     | `Map<WebSocketSession, Set<String>>` | 会话到设备订阅的映射 |
| WebSocketManager     | `Map<String, Set<WebSocketSession>>` | 设备到订阅者的映射   |
| MqttSimulatorService | `Map<String, SimulatorTask>`         | 模拟器任务管理       |
| SimpleCacheService   | `Map<String, CacheEntry>`            | 内存缓存存储         |

### 4.2 JDK 8+ 实现原理

**核心数据结构**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    ConcurrentHashMap 结构                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   table (Node<K,V>[] 数组)                                      │
│   ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐           │
│   │  0  │  1  │  2  │  3  │ ... │ n-2 │ n-1 │     │           │
│   └──┬──┴──┬──┴─────┴─────┴─────┴─────┴─────┴─────┘           │
│      │     │                                                     │
│      │     ▼                                                     │
│      │   Node(K2,V2) → Node(K5,V5) → null (链表)                │
│      │                                                           │
│      ▼                                                           │
│    TreeBin(红黑树，当链表长度 ≥ 8 时转换)                         │
│      │                                                           │
│      ▼                                                           │
│    TreeNode(K1,V1)                                               │
│           ╱    \                                                 │
│      TreeNode   TreeNode                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**关键设计**：

1. **取消分段锁（Segment）**：JDK 8 放弃了 JDK 7 的分段锁设计，改为对每个桶的头节点加锁
2. **CAS + synchronized**：使用 CAS 进行无锁插入，synchronized 锁住链表头节点
3. **红黑树优化**：链表长度 ≥ 8 时转换为红黑树，查找从 O(n) 优化到 O(log n)

### 4.3 put 操作源码分析

```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // 1. 空值检查
    if (key == null || value == null) throw new NullPointerException();

    // 2. 计算哈希值（扰动函数减少冲突）
    int hash = spread(key.hashCode());

    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;

        // 3. 延迟初始化表
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();

        // 4. 目标桶为空，CAS 插入新节点（无锁）
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value, null)))
                break;
        }

        // 5. 正在扩容，帮助迁移
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);

        // 6. 目标桶不为空，加锁处理
        else {
            V oldVal = null;
            synchronized (f) {  // 锁住链表头节点
                if (tabAt(tab, i) == f) {
                    // 链表处理
                    if (fh >= 0) {
                        // 遍历链表，更新或追加
                    }
                    // 红黑树处理
                    else if (f instanceof TreeBin) {
                        // 红黑树插入
                    }
                }
            }
            // 7. 检查是否需要树化
            if (binCount >= TREEIFY_THRESHOLD)
                treeifyBin(tab, i);
        }
    }
    // 8. 更新计数，检查是否需要扩容
    addCount(1L, binCount);
    return null;
}
```

**流程图**：

```
put(key, value)
      │
      ▼
┌───────────────┐
│ 计算哈希值     │
└───────┬───────┘
        │
        ▼
┌───────────────┐     是
│ 表是否为空?   │────────→ initTable() 初始化
└───────┬───────┘
        │ 否
        ▼
┌───────────────┐     是
│ 桶是否为空?   │────────→ CAS 插入新节点（无锁）
└───────┬───────┘
        │ 否
        ▼
┌───────────────┐     是
│ 是否在扩容?   │────────→ helpTransfer() 帮助迁移
└───────┬───────┘
        │ 否
        ▼
┌───────────────────────┐
│ synchronized 锁头节点  │
│ 遍历链表/树           │
│ 更新或追加节点        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 链表长度 ≥ 8?         │
│ 是 → 转换为红黑树     │
└───────────────────────┘
```

### 4.4 扩容机制

**多线程协助扩容**：

```
扩容触发条件：元素数量 > 容量 × 负载因子(0.75)

原数组 (size=16)                新数组 (size=32)
┌─────────────────┐            ┌─────────────────────────────┐
│ 0 │ A → B → C   │ ──────→   │ 0 │ A → C                   │
├─────────────────┤            │ 16│ B                       │
│ 1 │ D → E       │ ──────→   │ 1 │ D                       │
├─────────────────┤            │ 17│ E                       │
│ ...             │            │ ...                         │
└─────────────────┘            └─────────────────────────────┘

迁移规则：节点新位置 = 原位置 或 原位置 + 原容量
```

### 4.5 项目中的最佳实践

```java
// WebSocketManager - computeIfAbsent 原子操作
public void subscribeDevice(WebSocketSession session, String deviceId) {
    // computeIfAbsent: 原子的"不存在则创建"
    sessionDeviceSubscriptions.computeIfAbsent(session, k -> ConcurrentHashMap.newKeySet())
                              .add(deviceId);

    deviceSubscribers.computeIfAbsent(deviceId, k -> ConcurrentHashMap.newKeySet())
                     .add(session);
}

// SimpleCacheService - 带容量检查的写入
public void put(String key, Object value, long expireMs) {
    if (cache.size() >= MAX_SIZE) {
        cleanExpired();
        if (cache.size() >= MAX_SIZE) {
            return;  // 达到上限，拒绝写入
        }
    }
    cache.put(key, new CacheEntry(value, System.currentTimeMillis() + expireMs));
}
```

---

## 5. CopyOnWrite 集合原理

### 5.1 项目中的应用

| 类                   | 使用位置             | 用途                    |
| -------------------- | -------------------- | ----------------------- |
| CopyOnWriteArraySet  | WebSocketManager     | 存储所有 WebSocket 会话 |
| CopyOnWriteArrayList | MqttSimulatorService | 存储历史任务记录        |

### 5.2 写时复制原理

```java
// CopyOnWriteArrayList 核心实现
public class CopyOnWriteArrayList<E> {
    // volatile 保证数组引用的可见性
    private transient volatile Object[] array;

    // 读操作：直接访问数组，无锁
    @SuppressWarnings("unchecked")
    private E get(Object[] a, int index) {
        return (E) a[index];
    }

    // 写操作：复制数组
    public boolean add(E e) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            Object[] elements = getArray();
            int len = elements.length;
            // 复制新数组
            Object[] newElements = Arrays.copyOf(elements, len + 1);
            newElements[len] = e;
            // 替换引用（volatile 写）
            setArray(newElements);
            return true;
        } finally {
            lock.unlock();
        }
    }
}
```

**内存模型分析**：

```
写操作过程：
线程 1 (写操作)                   线程 2 (读操作)
─────────────────────────────────────────────────────
1. 获取锁
2. 读取旧数组引用 ──────────────→ 读取旧数组（并发安全）
3. 复制新数组 [A,B,C,D]
4. 添加元素 [A,B,C,D,E]
5. 设置 array = 新数组 ─────────→ 读取新数组（volatile读）
6. 释放锁
```

### 5.3 迭代器弱一致性

```java
// 迭代器创建时获取数组快照
public Iterator<E> iterator() {
    return new COWIterator<E>(getArray(), 0);
}

// 迭代器内部持有快照引用
private static class COWIterator<E> implements ListIterator<E> {
    private final Object[] snapshot;  // 创建时的数组快照

    // 迭代过程中，即使原数组被修改，迭代器仍然遍历快照
    public boolean hasNext() {
        return cursor < snapshot.length;
    }

    // 不支持修改操作
    public void remove() {
        throw new UnsupportedOperationException();
    }
}
```

**弱一致性含义**：

- 迭代器遍历的是创建时的快照
- 迭代过程中其他线程的修改不会反映到迭代器
- 不会抛出 ConcurrentModificationException

### 5.4 性能分析与选择依据

**时间复杂度**：

| 操作        | 时间复杂度 | 说明         |
| ----------- | ---------- | ------------ |
| get(i)      | O(1)       | 直接数组访问 |
| contains(e) | O(n)       | 遍历数组     |
| add(e)      | O(n)       | 复制数组     |
| remove(i)   | O(n)       | 复制数组     |
| iterator()  | O(1)       | 创建快照引用 |

**适用场景判断**：

```
读取频率          写入频率          推荐集合
───────────────────────────────────────────────
    高              很低         CopyOnWriteArrayList
    高              低          CopyOnWriteArrayList
    中              中          ConcurrentHashMap
    低              高          synchronized List
    中              很高        ConcurrentHashMap
```

---

## 6. 原子类与 CAS 机制

### 6.1 项目中的应用

MqttSimulatorService 中大量使用原子类进行统计：

```java
private class SimulatorTask implements Runnable {
    // 消息计数
    private final AtomicInteger totalMessages = new AtomicInteger(0);
    private final AtomicInteger successMessages = new AtomicInteger(0);

    // 时间统计
    private final AtomicLong startTime = new AtomicLong(0);
    private final AtomicLong totalSendTime = new AtomicLong(0);
    private final AtomicLong maxSendInterval = new AtomicLong(0);

    // 功率统计
    private final AtomicLong totalPower = new AtomicLong(0);
    private final AtomicLong maxPowerObserved = new AtomicLong(0);
}
```

### 6.2 CAS 原理深度解析

**Compare-And-Swap 操作**：

```
CAS(V, E, N)
├── V: 内存地址（要更新的变量）
├── E: 期望值（当前线程认为的值）
└── N: 新值（要设置的新值）

执行过程：
if (V 的当前值 == E) {
    V = N;  // 更新成功
    return true;
} else {
    return false;  // 更新失败，其他线程已修改
}
```

**AtomicInteger 源码分析**：

```java
public class AtomicInteger extends Number implements java.io.Serializable {
    // 使用 Unsafe 进行底层操作
    private static final jdk.internal.misc.Unsafe U = jdk.internal.misc.Unsafe.getUnsafe();

    // value 字段的内存偏移量
    private static final long VALUE = U.objectFieldOffset(AtomicInteger.class, "value");

    // 使用 volatile 保证可见性
    private volatile int value;

    // 自增操作
    public final int incrementAndGet() {
        return U.getAndAddInt(this, VALUE, 1) + 1;
    }

    // Unsafe 的实现 - CAS 循环
    public final int getAndAddInt(Object o, long offset, int delta) {
        int v;
        do {
            v = getIntVolatile(o, offset);  // 读取当前值
        } while (!weakCompareAndSetInt(o, offset, v, v + delta));  // CAS 循环
        return v;
    }
}
```

### 6.3 CAS 三大问题及解决方案

#### 问题一：ABA 问题

```
初始状态：V = A

线程1: 读取 V = A，准备 CAS(A, B)
线程2: CAS(A, C) → V = C
线程2: CAS(C, A) → V = A

线程1: CAS(A, B) 成功！

问题：线程1 不知道 V 被修改过
```

**解决方案**：

```java
// 使用 AtomicStampedReference 携带版本号
AtomicStampedReference<Integer> ref = new AtomicStampedReference<>(100, 0);

int[] stampHolder = new int[1];
Integer value = ref.get(stampHolder);  // 获取值和版本号

// 更新时同时检查值和版本号
ref.compareAndSet(value, 101, stampHolder[0], stampHolder[0] + 1);
```

#### 问题二：循环开销大

**解决方案：LongAdder 分散热点**

```
┌─────────────────────────────────────────────────────────────────┐
│                        LongAdder 结构                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   base (基础值)                                                 │
│      │                                                          │
│   Cell[] cells (分散数组)                                       │
│   ┌─────┬─────┬─────┬─────┐                                    │
│   │ C0  │ C1  │ C2  │ C3  │                                    │
│   │ +1  │ +2  │ +1  │ +3  │  ← 不同线程更新不同 Cell            │
│   └─────┴─────┴─────┴─────┘                                    │
│                                                                 │
│   sum() = base + C0 + C1 + C2 + C3                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 问题三：只能保证单变量原子性

```java
// ❌ 错误：多个原子操作组合不保证原子性
public void transfer(AtomicInteger from, AtomicInteger to, int amount) {
    from.decrementAndGet(amount);
    to.incrementAndGet(amount);  // 两步操作非原子
}

// ✅ 解决方案：使用锁或合并为一个原子对象
```

### 6.4 项目中的最佳实践

```java
// 简单计数 - AtomicInteger
totalMessages.incrementAndGet();

// 更新最大值 - 使用 CAS 方法保证原子性
// ❌ 错误：非原子操作
maxPowerObserved.set(Math.max(maxPowerObserved.get(), newValue));

// ✅ 正确：使用 updateAndGet
maxPowerObserved.updateAndGet(current -> Math.max(current, newValue));

// 更优：使用 LongAccumulator（高并发场景）
LongAccumulator maxAccumulator = new LongAccumulator(Math::max, Long.MIN_VALUE);
maxAccumulator.accumulate(newValue);
```

---

## 7. 锁机制与虚拟线程

### 7.1 synchronized vs ReentrantLock

**项目中的选择**：

| 场景                          | 选择          | 原因                       |
| ----------------------------- | ------------- | -------------------------- |
| WebSocketManager 订阅操作     | ReentrantLock | 虚拟线程友好，避免钉住     |
| MqttSimulatorService 历史记录 | synchronized  | 简单同步，不在虚拟线程路径 |

### 7.2 synchronized 实现原理

**对象头结构（64位 JVM）**：

```
Object Header Mark Word (64 bits)

无锁状态：
unused:25 | hashcode:31 | unused:1 | age:4 | biased_lock:1 | 01

偏向锁状态：
thread:54 | epoch:2     | unused:1 | age:4 | biased_lock:1 | 01

轻量级锁状态：
ptr_to_lock_record:62                                   | 00

重量级锁状态：
ptr_to_heavyweight_monitor:62                           | 10
```

**锁升级过程**：

```
┌─────────┐     无竞争      ┌─────────┐     单线程重入    ┌─────────┐
│   无锁   │ ────────────→  │  偏向锁  │ ──────────────→ │  轻量锁  │
└─────────┘                 └─────────┘                  └────┬────┘
                                                             │
                                                        多线程竞争
                                                             │
                                                             ▼
                                                        ┌─────────┐
                                                        │  重量锁  │
                                                        └─────────┘

升级过程不可逆（JDK 8），JDK 15+ 支持降级
```

### 7.3 ReentrantLock 原理

**AQS (AbstractQueuedSynchronizer) 核心结构**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    ReentrantLock + AQS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  state (volatile int)                                           │
│    0 = 未锁定                                                   │
│    1 = 已锁定                                                   │
│    >1 = 重入次数                                                │
│                                                                 │
│  exclusiveOwnerThread                                           │
│    当前持有锁的线程                                              │
│                                                                 │
│  CLH 队列 (双向链表)                                            │
│  ┌────────┐    ┌────────┐    ┌────────┐                        │
│  │ Node 1 │ ←─ │ Node 2 │ ←─ │ Node 3 │                        │
│  │Thread A│    │Thread B│    │Thread C│                        │
│  └────────┘    └────────┘    └────────┘                        │
│     ↑                                                           │
│   head                                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**加锁流程**：

```java
// AQS.acquire()
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&                    // 1. 尝试获取锁
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))  // 2. 入队等待
        selfInterrupt();                       // 3. 响应中断
}

// 非公平锁 tryAcquire
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {  // 未锁定
        if (compareAndSetState(0, acquires)) {  // CAS 获取锁
            setExclusiveOwnerThread(current);
            return true;
        }
    } else if (current == getExclusiveOwnerThread()) {  // 重入
        int nextc = c + acquires;
        setState(nextc);
        return true;
    }
    return false;
}
```

### 7.4 虚拟线程与锁的交互

**载体线程钉住问题**：

```
使用 synchronized：

虚拟线程 VT1 ──┐
虚拟线程 VT2 ──┼──→ 载体线程 CT1
                │      │
                │      │ 进入 synchronized 块
                │      │ 遇到 I/O 阻塞
                │      │ ❌ 载体线程被钉住，无法执行 VT2

使用 ReentrantLock：

虚拟线程 VT1 ──┐
虚拟线程 VT2 ──┼──→ 载体线程 CT1
                │      │
                │      │ lock.lock()
                │      │ 遇到 I/O 阻塞
                │      │ ✅ VT1 卸载，CT1 可以执行 VT2
```

### 7.5 volatile 关键字

**内存语义**：

```
写 volatile：
┌──────────────────┐
│ StoreStore屏障   │ ← 禁止上面的普通写与下面的volatile写重排序
├──────────────────┤
│ volatile 写操作   │
├──────────────────┤
│ StoreLoad屏障    │ ← 禁止上面的volatile写与下面的读写重排序
└──────────────────┘

读 volatile：
┌──────────────────┐
│ LoadLoad屏障     │ ← 禁止下面的普通读与上面的volatile读重排序
├──────────────────┤
│ volatile 读操作   │
├──────────────────┤
│ LoadStore屏障    │ ← 禁止下面的普通写与上面的volatile读重排序
└──────────────────┘
```

**项目中的应用**：

```java
// MqttSimulatorService.SimulatorTask
private volatile boolean running = true;  // 状态标志

// 停止任务（由其他线程调用）
public void stop() {
    running = false;  // 立即可见
}

// 任务执行中检查（在虚拟线程中）
while (running && System.currentTimeMillis() < endTimeMillis) {
    // ...
}
```

---

## 8. 定时任务调度原理

### 8.1 项目中的应用

[SimpleCacheService.java](backend/src/main/java/com/dormpower/service/SimpleCacheService.java):

```java
private final ScheduledExecutorService cleaner = new ScheduledThreadPoolExecutor(1,
        r -> {
            Thread t = new Thread(r, "cache-cleaner");
            t.setDaemon(true);  // 守护线程
            return t;
        });

public SimpleCacheService() {
    // 每 5 分钟清理一次过期缓存
    cleaner.scheduleAtFixedRate(this::cleanExpired, 5, 5, TimeUnit.MINUTES);
}
```

### 8.2 ScheduledThreadPoolExecutor 原理

**DelayedWorkQueue 最小堆**：

```
                    ┌─────────────┐
                    │ 任务1 (t=1s)│ ← 堆顶，最近执行
                    └──────┬──────┘
                     ┌─────┴─────┐
                     │           │
              ┌──────┴───┐  ┌────┴────┐
              │任务2(t=3s)│  │任务3(t=5s)│
              └──────────┘  └─────────┘

工作线程：
1. 从队列取出堆顶任务
2. 如果未到期，等待
3. 到期后执行任务
4. 对于周期任务，重新计算下次执行时间，放回队列
```

### 8.3 三种调度方式对比

```java
// 1. 单次延迟执行
scheduler.schedule(() -> task(), 5, TimeUnit.SECONDS);

// 2. 固定频率执行（不考虑执行时间）
// 执行时间点：T, T+period, T+2*period, ...
scheduler.scheduleAtFixedRate(() -> task(), 0, 5, TimeUnit.SECONDS);

// 3. 固定延迟执行（考虑执行时间）
// 执行时间点：上次执行完成 + delay
scheduler.scheduleWithFixedDelay(() -> task(), 0, 5, TimeUnit.SECONDS);
```

**执行时间对比**：

```
任务执行时间 = 2s，调度周期 = 5s

scheduleAtFixedRate:
执行: [====2s====]     [====2s====]     [====2s====]
时间: 0          5s           10s           15s

scheduleWithFixedDelay:
执行: [====2s====]               [====2s====]
时间: 0    2s      5s(延迟) 7s   9s      12s(延迟)
```

### 8.4 异常处理注意事项

```java
// ❌ 错误：异常会导致任务停止
cleaner.scheduleAtFixedRate(() -> {
    process();  // 如果抛出异常，后续任务停止
}, 0, 5, TimeUnit.MINUTES);

// ✅ 正确：捕获异常
cleaner.scheduleAtFixedRate(() -> {
    try {
        process();
    } catch (Exception e) {
        logger.error("定时任务异常", e);
    }
}, 0, 5, TimeUnit.MINUTES);
```

---

## 9. 开发经验与最佳实践总结

### 9.1 线程池选择决策树

```
                         任务类型？
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          I/O 密集型      CPU 密集型       混合型
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ 虚拟线程  │   │ 平台线程池│   │ 分离任务  │
        │ 执行器    │   │          │   │          │
        └──────────┘   └──────────┘   └──────────┘
              │              │              │
              ▼              ▼              ▼
        newThreadPer    ThreadPoolExecutor  I/O用虚拟线程
        TaskExecutor    core=CPU核数       CPU用平台线程
```

### 9.2 并发集合选择指南

| 场景           | 读频率 | 写频率 | 推荐集合             | 原因              |
| -------------- | ------ | ------ | -------------------- | ----------------- |
| 设备状态映射   | 高     | 高     | ConcurrentHashMap    | 细粒度锁，高性能  |
| WebSocket 会话 | 高     | 低     | CopyOnWriteArraySet  | 读无锁，迭代安全  |
| 任务历史记录   | 中     | 低     | CopyOnWriteArrayList | 弱一致性可接受    |
| 消息队列       | -      | -      | LinkedBlockingQueue  | 生产者-消费者模式 |

### 9.3 虚拟线程开发规范

```java
// ✅ 推荐做法
// 1. I/O 密集型任务使用虚拟线程
ExecutorService executor = Executors.newThreadPerTaskExecutor(
    Thread.ofVirtual().name("io-vt-").factory()
);

// 2. 使用 ReentrantLock 替代 synchronized
private final ReentrantLock lock = new ReentrantLock();

// 3. 设置异常处理器
Thread.ofVirtual()
    .uncaughtExceptionHandler((t, e) -> logger.error("异常", e))
    .factory();

// ❌ 避免做法
// 1. CPU 密集型任务使用虚拟线程（会阻塞载体线程）
// 2. 在 synchronized 块内执行 I/O 操作（导致钉住）
// 3. ThreadLocal 存储大对象（每个虚拟线程一份）
```

### 9.4 原子类使用规范

```java
// ✅ 正确用法
// 简单计数
counter.incrementAndGet();

// 条件更新
value.updateAndGet(v -> Math.max(v, newValue));

// 高并发计数
LongAdder adder = new LongAdder();
adder.increment();

// ❌ 常见错误
// 非原子的复合操作
max.set(Math.max(max.get(), newValue));  // 错误！

// volatile 复合操作
volatile int count;
count++;  // 非原子！
```

### 9.5 线程安全检查清单

开发完成后，按以下清单检查线程安全：

```
□ 共享变量是否使用正确的并发容器？
  - 高并发读写 → ConcurrentHashMap
  - 读多写少 → CopyOnWrite 系列
  - 计数统计 → AtomicInteger/LongAdder

□ 锁的选择是否正确？
  - 虚拟线程环境 → ReentrantLock
  - 简单同步（非虚拟线程）→ synchronized

□ 状态标志是否使用 volatile？
  - 跨线程可见性要求 → volatile
  - 原子性要求 → Atomic 类

□ 定时任务是否处理异常？
  - 捕获所有异常，防止任务停止

□ 线程池是否正确关闭？
  - shutdown() + awaitTermination()
  - 处理 InterruptedException
```

### 9.6 性能优化经验

#### 9.6.1 线程池监控

```java
// 监控关键指标
public void monitorThreadPool(ThreadPoolExecutor executor) {
    // 活跃线程数接近最大值 → 考虑扩容
    int activeCount = executor.getActiveCount();

    // 队列积压 → 考虑扩容或优化处理速度
    int queueSize = executor.getQueue().size();

    // 完成任务数 → 评估吞吐量
    long completedTasks = executor.getCompletedTaskCount();
}
```

#### 9.6.2 ConcurrentHashMap 优化

```java
// 避免 computeIfAbsent 中执行耗时操作
// ❌ 错误
map.computeIfAbsent(key, k -> {
    // 耗时操作，持有锁时间长
    return expensiveOperation();
});

// ✅ 正确
Value value = map.get(key);
if (value == null) {
    value = expensiveOperation();
    map.putIfAbsent(key, value);
}
```

#### 9.6.3 减少锁竞争

```java
// ❌ 锁粒度太大
synchronized (this) {
    processA();
    processB();
    processC();
}

// ✅ 细粒度锁
lockA.lock();
try { processA(); } finally { lockA.unlock(); }

lockB.lock();
try { processB(); } finally { lockB.unlock(); }
```

### 9.7 常见问题排查

| 现象     | 可能原因           | 排查方法                 |
| -------- | ------------------ | ------------------------ |
| CPU 飙高 | 无限循环、死锁     | 线程 dump 分析           |
| 内存溢出 | 队列无界、线程泄漏 | 堆内存分析               |
| 响应慢   | 锁竞争、线程池满   | 监控活跃线程数、队列大小 |
| 任务丢失 | 拒绝策略不当       | 检查拒绝策略日志         |

### 9.8 项目代码示例

**完整的线程安全组件示例**：

```java
@Service
public class DeviceStateManager {

    // 线程安全的设备状态存储
    private final ConcurrentHashMap<String, DeviceState> deviceStates = new ConcurrentHashMap<>();

    // 虚拟线程友好的锁
    private final ReentrantLock updateLock = new ReentrantLock();

    // 统计计数
    private final LongAdder updateCounter = new LongAdder();

    /**
     * 更新设备状态（线程安全）
     */
    public void updateState(String deviceId, DeviceState newState) {
        deviceStates.compute(deviceId, (key, oldState) -> {
            if (oldState == null) {
                return newState;
            }
            // 合并状态
            oldState.merge(newState);
            return oldState;
        });
        updateCounter.increment();
    }

    /**
     * 获取设备状态（无锁读取）
     */
    public DeviceState getState(String deviceId) {
        return deviceStates.get(deviceId);
    }

    /**
     * 批量更新（减少锁竞争）
     */
    public void batchUpdate(Map<String, DeviceState> updates) {
        updates.forEach(this::updateState);
    }

    /**
     * 获取统计信息
     */
    public long getUpdateCount() {
        return updateCounter.sum();
    }
}
```

---

## 10. 面试题与实战问答（大厂面试官视角）

> 本章节所有题目均基于项目实际代码和业务场景，结合具体文件路径和方法进行分析。

### 10.1 虚拟线程专题（基于 DynamicThreadPoolConfig.java）

#### Q1: 我看到你们项目用了 Java 21 虚拟线程，能结合具体代码讲讲为什么这么选吗？

**项目背景**：DormPower 是一个 IoT 宿舍电力管理平台，需要处理 10,000+ MQTT 设备的实时数据上报。

**参考答案**：

**项目实际代码**（[DynamicThreadPoolConfig.java:91-101](backend/src/main/java/com/dormpower/config/DynamicThreadPoolConfig.java#L91-L101)）：

```java
@Bean(name = "mqttExecutor")
public ExecutorService mqttExecutor() {
    ThreadFactory mqttThreadFactory = Thread.ofVirtual()
            .name("mqtt-vt-", 0)
            .uncaughtExceptionHandler((t, e) ->
                logger.error("MQTT线程异常 [{}]: {}", t.getName(), e.getMessage(), e))
            .factory();

    return Executors.newThreadPerTaskExecutor(mqttThreadFactory);
}
```

**选型决策过程**：

```
业务场景分析：
- 10,000+ MQTT 设备同时在线
- 每个设备每 1-5 秒上报一次数据
- 处理流程：接收消息 → 解析 → 存数据库 → 通知 WebSocket
- 主要是 I/O 操作，CPU 计算很少

传统方案的问题：
┌─────────────────────────────────────────────────────────────┐
│ ThreadPoolExecutor(200, 400, 60s, LinkedQueue(1000))        │
│                                                             │
│ 问题1：200 线程处理 10,000 设备 = 每线程处理 50 设备         │
│        队列堆积严重，响应延迟高                              │
│                                                             │
│ 问题2：增加线程数到 1000？                                   │
│        内存占用：1000 × 1MB = 1GB（服务器总共 2GB）          │
│                                                             │
│ 问题3：线程阻塞在 I/O 时，OS 线程被占用，无法执行其他任务    │
└─────────────────────────────────────────────────────────────┘

虚拟线程方案优势：
┌─────────────────────────────────────────────────────────────┐
│ mqttExecutor = newThreadPerTaskExecutor(虚拟线程工厂)        │
│                                                             │
│ 优势1：每条消息一个虚拟线程，无队列等待                       │
│ 优势2：内存占用：10,000 × 2KB = 20MB（可接受）              │
│ 优势3：I/O 阻塞时虚拟线程自动卸载，载体线程释放              │
│ 优势4：代码无需修改，JVM 自动调度                           │
└─────────────────────────────────────────────────────────────┘
```

**关键对比数据**：

| 指标         | 平台线程池(400线程) | 虚拟线程 |
| ------------ | ------------------- | -------- |
| 最大并发任务 | 400 + 队列1000      | 无限制   |
| 内存占用     | 400MB               | 按需增长 |
| I/O 阻塞影响 | 阻塞 OS 线程        | 自动卸载 |
| 配置复杂度   | 需调优参数          | 无需配置 |

---

#### Q2: 你们项目中 WebSocketManager 用了 ReentrantLock，为什么不用 synchronized？

**项目背景**：WebSocket 需要处理设备订阅操作，这个操作可能在虚拟线程中执行。

**参考答案**：

**项目实际代码**（[WebSocketManager.java:44](backend/src/main/java/com/dormpower/websocket/WebSocketManager.java#L44)）：

```java
// 使用 ReentrantLock 替代 synchronized
private final ReentrantLock subscriptionLock = new ReentrantLock();

public void subscribeDevice(WebSocketSession session, String deviceId) {
    subscriptionLock.lock();
    try {
        sessionDeviceSubscriptions.computeIfAbsent(session, k -> ConcurrentHashMap.newKeySet())
                                  .add(deviceId);
        deviceSubscribers.computeIfAbsent(deviceId, k -> ConcurrentHashMap.newKeySet())
                         .add(session);
    } finally {
        subscriptionLock.unlock();
    }
}
```

**踩坑经历**：

```java
// ❌ 最初使用 synchronized
public void subscribeDevice(WebSocketSession session, String deviceId) {
    synchronized (this) {  // 在虚拟线程中执行到这里...
        sessionDeviceSubscriptions.computeIfAbsent(...);
        // 如果后续有数据库查询等 I/O 操作
        deviceRepository.findById(deviceId);  // 钉住！
    }
}
```

**载体线程钉住问题分析**：

```
虚拟线程执行流程：
┌─────────────────────────────────────────────────────────────┐
│ VT-1 (虚拟线程)                                              │
│   │                                                          │
│   ├─→ 进入 synchronized 块                                   │
│   │   │                                                      │
│   │   └─→ 执行 I/O 操作 (数据库查询)                         │
│   │       │                                                  │
│   │       └─→ 虚拟线程想要卸载...                            │
│   │           │                                              │
│   │           └─→ ❌ 被 synchronized 钉住！                  │
│   │               载体线程无法释放                           │
│   │                                                          │
│   └─→ 其他虚拟线程无法使用这个载体线程                        │
└─────────────────────────────────────────────────────────────┘

使用 ReentrantLock 后：
┌─────────────────────────────────────────────────────────────┐
│ VT-1 (虚拟线程)                                              │
│   │                                                          │
│   ├─→ lock.lock()                                            │
│   │   │                                                      │
│   │   └─→ 执行 I/O 操作                                      │
│   │       │                                                  │
│   │       └─→ ✅ 虚拟线程正常卸载                            │
│   │           载体线程释放，执行其他虚拟线程                  │
│   │                                                          │
│   └─→ I/O 完成后重新挂载，继续执行                           │
└─────────────────────────────────────────────────────────────┘
```

**检测钉住的方法**：

```bash
# 启动参数
java -Djdk.tracePinnedThreads=full -jar app.jar

# 输出示例
Thread[#45,mqtt-vt-0] pinned due to: synchronized
    at com.dormpower.websocket.WebSocketManager.subscribeDevice
```

---

#### Q3: 你们项目为什么 mqttExecutor 用 newThreadPerTaskExecutor，而不是线程池？

**项目背景**：MQTT 消息处理使用虚拟线程执行器。

**参考答案**：

**项目实际代码对比**：

```java
// mqttExecutor - I/O 密集型，使用虚拟线程（无需池化）
@Bean(name = "mqttExecutor")
public ExecutorService mqttExecutor() {
    return Executors.newThreadPerTaskExecutor(
        Thread.ofVirtual().name("mqtt-vt-", 0).factory()
    );
}

// dynamicExecutor - CPU 密集型，使用平台线程池
@Bean(name = "dynamicExecutor")
public ThreadPoolExecutor dynamicExecutor() {
    return new ThreadPoolExecutor(
        2, 10, 60, TimeUnit.SECONDS,
        new LinkedBlockingQueue<>(100),
        new NamedThreadFactory("platform-cpu")
    );
}
```

**设计决策分析**：

```
为什么虚拟线程不需要池化？

传统线程池解决的问题：
┌─────────────────────────────────────────────────────────────┐
│ 1. 线程创建开销大                                           │
│    平台线程：系统调用 + 1MB 栈空间                           │
│    解决：预先创建，复用                                      │
│                                                             │
│ 2. 线程数量有限                                             │
│    2GB 服务器最多 ~2000 线程                                 │
│    解决：限制最大数量                                        │
│                                                             │
│ 3. 线程销毁开销大                                           │
│    解决：保持存活，复用                                      │
└─────────────────────────────────────────────────────────────┘

虚拟线程的特性：
┌─────────────────────────────────────────────────────────────┐
│ 1. 创建开销极低                                             │
│    虚拟线程：普通 Java 对象 + ~2KB 栈                        │
│    创建成本 ≈ 创建一个 HashMap                              │
│                                                             │
│ 2. 数量几乎无限制                                           │
│    可以创建数百万个                                          │
│                                                             │
│ 3. 销毁无开销                                               │
│    GC 自动回收                                               │
│                                                             │
│ 结论：池化虚拟线程 = 池化 ArrayList，毫无意义               │
└─────────────────────────────────────────────────────────────┘
```

**项目中的实际应用**：

```java
// MqttSimulatorService.java:91-104
mqttExecutor.execute(() -> {
    try {
        threadPoolStats.incrementMqttTask();
        task.run();  // 每个任务一个虚拟线程
    } catch (Exception e) {
        log.error("模拟器任务执行异常: taskId={}", taskId, e);
    } finally {
        simulatorTasks.remove(taskId);
        saveToHistory(task);
    }
});
// 任务执行完，虚拟线程自动销毁，无复用开销
```

---

### 10.2 线程池专题（基于 DynamicThreadPoolConfig.java）

#### Q4: 你们项目同时配置了虚拟线程执行器和平台线程池，怎么决定用哪个？

**项目背景**：项目中有多个执行器配置，需要根据任务类型选择合适的执行器。

**参考答案**：

**项目实际配置**（[DynamicThreadPoolConfig.java](backend/src/main/java/com/dormpower/config/DynamicThreadPoolConfig.java)）：

```java
// I/O 密集型 - 虚拟线程
@Bean(name = "mqttExecutor")
public ExecutorService mqttExecutor() { /* 虚拟线程 */ }

@Bean(name = "websocketExecutor")
public ExecutorService websocketExecutor() { /* 虚拟线程 */ }

// CPU 密集型 - 平台线程池
@Bean(name = "dynamicExecutor")
public ThreadPoolExecutor dynamicExecutor() {
    return new ThreadPoolExecutor(2, 10, 60, SECONDS, ...);
}

// 定时任务 - 平台线程
@Bean(name = "scheduledExecutor")
public ScheduledExecutorService scheduledExecutor() {
    return Executors.newScheduledThreadPool(2, ...);
}
```

**选择决策树**：

```
任务提交
    │
    ├─ 任务类型判断
    │
    ├─ I/O 密集型？
    │   │
    │   ├─ 网络请求（MQTT、HTTP）→ mqttExecutor（虚拟线程）
    │   ├─ WebSocket 推送         → websocketExecutor（虚拟线程）
    │   ├─ 数据库查询             → virtualThreadExecutor
    │   └─ 文件读写               → virtualThreadExecutor
    │
    ├─ CPU 密集型？
    │   │
    │   ├─ 数据加密/解密          → dynamicExecutor（平台线程池）
    │   ├─ 图片处理               → dynamicExecutor
    │   └─ 复杂计算               → dynamicExecutor
    │
    └─ 定时任务？
        │
        └─ scheduledExecutor（平台线程）
```

**项目中的实际应用**：

```java
// TelemetryService.java:43-44 - I/O 密集型用虚拟线程
@Autowired
@Qualifier("virtualThreadExecutor")
private Executor virtualThreadExecutor;

public CompletableFuture<Void> saveTelemetryAsync(...) {
    return CompletableFuture.runAsync(() -> {
        saveTelemetry(deviceId, ts, powerW, voltageV, currentA);
    }, virtualThreadExecutor);  // 数据库 I/O，用虚拟线程
}

// ThreadPoolAutoTuner.java:37-38 - 监控平台线程池
@Autowired
@Qualifier("dynamicExecutor")
private ThreadPoolExecutor executor;  // CPU 密集型任务用平台线程
```

---

#### Q5: 你们配置 dynamicExecutor 时，corePoolSize=2，maxPoolSize=10，这个参数是怎么算出来的？

**项目背景**：服务器是 2 核 2GB 配置，需要合理配置线程池参数。

**参考答案**：

**项目实际配置**（[DynamicThreadPoolConfig.java:63-80](backend/src/main/java/com/dormpower/config/DynamicThreadPoolConfig.java#L63-L80)）：

```java
@Bean(name = "dynamicExecutor")
public ThreadPoolExecutor dynamicExecutor() {
    return new ThreadPoolExecutor(
        2,    // corePoolSize = CPU 核心数
        10,   // maxPoolSize = CPU × 5（应对突发流量）
        60,   // keepAliveTime（非核心线程存活时间）
        TimeUnit.SECONDS,
        new LinkedBlockingQueue<>(100),  // 有界队列
        new NamedThreadFactory("platform-cpu"),
        new ThreadPoolExecutor.CallerRunsPolicy()
    );
}
```

**参数计算依据**：

```
服务器配置：2 核 2GB

CPU 密集型任务公式：
  核心线程数 = CPU 核心数 + 1 = 3
  实际配置 = 2（保守配置，避免上下文切换开销）

最大线程数决策：
  理论值 = CPU × (1 + 等待时间/计算时间)
  对于计算密集型：等待时间≈0
  但考虑突发流量，设置为 10

队列容量决策：
  太小：频繁触发拒绝策略
  太大：任务堆积，响应延迟
  项目选择：100（平衡内存和响应）

最终参数：
┌─────────────────────────────────────────────────────────────┐
│ 参数           │ 值  │ 理由                                │
├───────────────┼─────┼─────────────────────────────────────┤
│ corePoolSize  │ 2   │ CPU 核心数，常驻线程               │
│ maxPoolSize   │ 10  │ 应对突发，不会太大避免上下文切换   │
│ queueCapacity │ 100 │ 有界队列防止 OOM                   │
│ keepAlive     │ 60s │ 空闲线程及时释放                   │
│ rejectPolicy  │ 调用者执行 │ 任务不丢失，自动降速          │
└─────────────────────────────────────────────────────────────┘
```

**动态调优机制**（[ThreadPoolAutoTuner.java:67-116](backend/src/main/java/com/dormpower/scheduler/ThreadPoolAutoTuner.java#L67-L116)）：

```java
// 项目实现了自动调优
@Scheduled(fixedRate = 30000)
public void autoTune() {
    double cpuUsage = getCpuUsage();
    double poolUtilization = (double) activeCount / maxPoolSize;
    double queueUsage = (double) queueSize / queueCapacity;

    // 扩容条件：CPU高 + 线程池利用率高 OR 队列快满
    if (shouldScaleUp(cpuUsage, poolUtilization, queueUsage)) {
        int newMax = Math.min(currentMax + 2, 20);
        executor.setMaximumPoolSize(newMax);
    }

    // 缩容条件：CPU低 + 线程池利用率低 + 队列空闲
    if (shouldScaleDown(...)) {
        int newCore = Math.max(currentCore - 2, 2);
        executor.setCorePoolSize(newCore);
    }
}
```

---

#### Q6: 我看你们用了 CallerRunsPolicy 拒绝策略，能结合项目讲讲吗？

**项目背景**：设备控制命令、数据上报都是关键业务，任务不能丢失。

**参考答案**：

**项目实际代码**：

```java
// DynamicThreadPoolConfig.java:71
new ThreadPoolExecutor.CallerRunsPolicy()
```

**四种策略对比**：

```java
// 假设线程池已满，队列已满，新任务来了

// 1. AbortPolicy（默认）- 抛异常
throw new RejectedExecutionException("Task rejected");
// 问题：设备控制命令丢失，用户操作失败

// 2. DiscardPolicy - 静默丢弃
// 什么都不做
// 问题：数据上报丢失，没有日志，难以排查

// 3. DiscardOldestPolicy - 丢弃最老的
queue.poll();  // 丢弃队列头部
executor.execute(task);  // 重新提交
// 问题：老任务可能是重要的控制命令

// 4. CallerRunsPolicy（项目选择）- 调用者执行
if (!executor.isShutdown()) {
    task.run();  // 在提交任务的线程中执行
}
// 优点：
// 1. 任务不丢失
// 2. 调用者线程忙于执行任务，无法继续提交新任务 → 自动降速
// 3. 不抛异常，不影响调用方
```

**项目中的实际场景**：

```java
// 设备控制命令提交
@PostMapping("/devices/{id}/cmd")
public ResponseEntity<?> sendCommand(@PathVariable String id, @RequestBody Command cmd) {
    // 如果线程池满，CallerRunsPolicy 会在这里执行任务
    // 效果：响应变慢，但命令不会丢失
    executor.submit(() -> {
        mqttBridge.sendCommand(id, cmd);
    });
    return ResponseEntity.ok().build();
}

// 自动降速效果
// 正常：T1 提交任务 → 立即返回 → T2 提交任务 → 立即返回
// 过载：T1 提交任务 → 执行任务(2s) → 返回 → T2 提交任务
//       ↑ 提交速度被迫降低
```

---

### 10.3 ConcurrentHashMap 专题（基于 WebSocketManager.java）

#### Q7: 你们项目中 WebSocketManager 大量使用了 ConcurrentHashMap，能讲讲具体怎么用的吗？

**项目背景**：WebSocket 需要管理会话和设备订阅关系，高并发读写。

**参考答案**：

**项目实际代码**（[WebSocketManager.java:35-42](backend/src/main/java/com/dormpower/websocket/WebSocketManager.java#L35-L42)）：

```java
// WebSocket 会话集合（线程安全）
private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

// 会话 -> 订阅的设备ID集合
private final Map<WebSocketSession, Set<String>> sessionDeviceSubscriptions = new ConcurrentHashMap<>();

// 设备ID -> 订阅的会话集合
private final Map<String, Set<WebSocketSession>> deviceSubscribers = new ConcurrentHashMap<>();
```

**为什么用 ConcurrentHashMap？**

```
业务场景分析：
- 10,000+ 设备同时在线
- 设备状态变化时需要通知所有订阅的 WebSocket 会话
- 用户可以随时订阅/取消订阅设备

访问模式：
┌─────────────────────────────────────────────────────────────┐
│ 操作                          │ 频率   │ 线程安全要求       │
├──────────────────────────────┼────────┼────────────────────┤
│ 查询设备订阅者（广播）        │ 极高   │ 必须线程安全       │
│ 添加订阅                     │ 中     │ 必须线程安全       │
│ 取消订阅                     │ 中     │ 必须线程安全       │
│ 会话断开，清理订阅           │ 低     │ 必须线程安全       │
└─────────────────────────────────────────────────────────────┘

ConcurrentHashMap 优势：
1. 读操作完全无锁 → 广播消息时性能极高
2. 写操作细粒度锁 → 只锁单个桶，并发度高
3. 原子方法支持 → computeIfAbsent 等方法原子执行
```

**项目中的具体用法**：

```java
// WebSocketManager.java:88-91 - 原子操作
public void subscribeDevice(WebSocketSession session, String deviceId) {
    // computeIfAbsent：原子操作，不存在则创建
    sessionDeviceSubscriptions.computeIfAbsent(session, k -> ConcurrentHashMap.newKeySet())
                              .add(deviceId);
    deviceSubscribers.computeIfAbsent(deviceId, k -> ConcurrentHashMap.newKeySet())
                     .add(session);
}

// WebSocketManager.java:142-156 - 无锁读取
public void sendToDeviceSubscribers(String deviceId, String message) {
    Set<WebSocketSession> subscribers = deviceSubscribers.get(deviceId);  // 无锁读
    if (subscribers != null) {
        subscribers.forEach(session -> {
            // 广播消息
        });
    }
}
```

**为什么 value 用 Set 而不是 List？**

```java
// Set 自动去重，避免重复订阅
sessionDeviceSubscriptions.computeIfAbsent(session, k -> ConcurrentHashMap.newKeySet())
                          .add(deviceId);  // 重复调用不会重复添加

// 如果用 List，需要手动去重
if (!list.contains(deviceId)) {  // O(n) 查找
    list.add(deviceId);
}
```

---

#### Q8: ConcurrentHashMap 的 computeIfAbsent 方法是线程安全的吗？项目中怎么用的？

**项目背景**：设备订阅需要原子操作，避免并发问题。

**参考答案**：

**项目实际代码**（[WebSocketManager.java:88-91](backend/src/main/java/com/dormpower/websocket/WebSocket.java#L88-L91)）：

```java
public void subscribeDevice(WebSocketSession session, String deviceId) {
    sessionDeviceSubscriptions.computeIfAbsent(session, k -> ConcurrentHashMap.newKeySet())
                              .add(deviceId);
}
```

**computeIfAbsent 的线程安全保证**：

```
源码分析（简化）：
public V computeIfAbsent(K key, Function<? super K, ? extends V> mappingFunction) {
    // 1. 检查 key 是否存在
    Node<K,V>[] tab = table;
    int n = tab.length;
    int i = (n - 1) & hash;
    Node<K,V> f = tabAt(tab, i);

    if (f == null) {
        // 2. 桶为空，CAS 插入新节点（无锁）
        if (casTabAt(tab, i, null, new Node<>(hash, key, value, null)))
            return value;
    } else {
        // 3. 桶不为空，synchronized 锁头节点
        synchronized (f) {
            // 执行 mappingFunction，原子更新
        }
    }
}
```

**为什么不用 get + put？**

```java
// ❌ 错误写法：非原子操作
Set<String> set = sessionDeviceSubscriptions.get(session);
if (set == null) {
    set = ConcurrentHashMap.newKeySet();
    sessionDeviceSubscriptions.put(session, set);  // 可能其他线程已经 put 了
}
set.add(deviceId);

// 问题：两个线程同时执行，可能创建两个 Set，丢失数据

// ✅ 正确写法：原子操作
sessionDeviceSubscriptions.computeIfAbsent(session, k -> ConcurrentHashMap.newKeySet())
                          .add(deviceId);
// 保证：只有一个线程能创建 Set，其他线程使用已创建的 Set
```

**项目中的另一个应用**（SimpleCacheService.java）：

```java
// 缓存查询 - 原子操作
public void put(String key, Object value, long expireMs) {
    cache.put(key, new CacheEntry(value, System.currentTimeMillis() + expireMs));
}

// 如果需要"不存在则创建"：
cache.computeIfAbsent(key, k -> loadFromDB(k));
```

---

### 10.4 CompletableFuture 专题（基于 TelemetryService.java）

#### Q9: 你们项目中 TelemetryService 用了 CompletableFuture，能结合代码讲讲吗？

**项目背景**：遥测数据需要异步保存并通知 WebSocket 订阅者。

**参考答案**：

**项目实际代码**（[TelemetryService.java:213-236](backend/src/main/java/com/dormpower/service/TelemetryService.java#L213-L236)）：

```java
/**
 * 批量保存并通知 WebSocket 订阅者
 */
public CompletableFuture<BulkResult> saveAndNotify(List<Telemetry> telemetries) {
    return saveAllAsync(telemetries)  // 1. 异步保存
            .thenAccept(result -> {
                if (result.success > 0) {
                    // 按设备分组通知 WebSocket 订阅者
                    Map<String, List<Telemetry>> byDevice = telemetries.stream()
                            .collect(Collectors.groupingBy(Telemetry::getDeviceId));

                    byDevice.forEach((deviceId, deviceTelemetries) -> {
                        String message = buildTelemetryMessage(deviceId, deviceTelemetries);
                        webSocketManager.sendToDeviceSubscribers(deviceId, message);
                    });
                }
            })
            .thenApply(v -> new BulkResult(telemetries.size(), 0))
            .exceptionally(ex -> {
                logger.error("批量保存并通知失败", ex);
                return new BulkResult(0, telemetries.size());
            });
}
```

**设计分析**：

```
执行流程：
┌─────────────────────────────────────────────────────────────┐
│ 调用线程                                                     │
│   │                                                          │
│   └─→ saveAndNotify(telemetries)                             │
│           │                                                  │
│           └─→ 立即返回 CompletableFuture                     │
│                                                              │
│ 虚拟线程（异步执行）                                         │
│   │                                                          │
│   ├─→ saveAllAsync() → 数据库保存                            │
│   │       │                                                  │
│   │       └─→ thenAccept() → WebSocket 通知                  │
│   │               │                                          │
│   │               └─→ thenApply() → 返回结果                 │
│   │                                                          │
│   └─→ exceptionally() → 异常处理                             │
└─────────────────────────────────────────────────────────────┘

优点：
1. 调用线程不阻塞，快速响应
2. 数据库 I/O 在虚拟线程中执行
3. 异常不影响调用方，有 exceptionally 兜底
```

**为什么用虚拟线程执行器？**

```java
// TelemetryService.java:177-186
public CompletableFuture<Void> saveTelemetryAsync(...) {
    return CompletableFuture.runAsync(() -> {
        saveTelemetry(deviceId, ts, powerW, voltageV, currentA);
    }, virtualThreadExecutor);  // 数据库 I/O，用虚拟线程
}
```

**与传统线程池对比**：

| 场景            | 传统线程池(10线程) | 虚拟线程       |
| --------------- | ------------------ | -------------- |
| 100 个并发保存  | 90 个排队等待      | 100 个并发执行 |
| 数据库 I/O 阻塞 | 阻塞 OS 线程       | 自动卸载       |
| 内存占用        | 10MB               | ~200KB         |

---

#### Q10: DeviceAggregateService 的 getDeviceFullInfoAsync 方法为什么要并行查询三个数据源？

**项目背景**：设备详情页面需要同时展示设备信息、状态、遥测数据。

**参考答案**：

**项目实际代码**（[DeviceAggregateService.java:71-113](backend/src/main/java/com/dormpower/service/DeviceAggregateService.java#L71-L113)）：

```java
public CompletableFuture<DeviceFullInfo> getDeviceFullInfoAsync(String deviceId) {
    // 并行查询三个数据源
    CompletableFuture<Optional<Device>> deviceFuture = CompletableFuture.supplyAsync(
            () -> deviceRepository.findById(deviceId),
            virtualThreadExecutor);

    CompletableFuture<StripStatus> statusFuture = CompletableFuture.supplyAsync(
            () -> stripStatusRepository.findByDeviceId(deviceId),
            virtualThreadExecutor);

    CompletableFuture<List<Telemetry>> telemetryFuture = CompletableFuture.supplyAsync(
            () -> telemetryRepository.findByDeviceIdOrderByTsDesc(deviceId),
            virtualThreadExecutor);

    // 等待所有查询完成并聚合
    return CompletableFuture.allOf(deviceFuture, statusFuture, telemetryFuture)
            .thenApply(v -> {
                Optional<Device> device = deviceFuture.join();
                StripStatus status = statusFuture.join();
                List<Telemetry> telemetries = telemetryFuture.join();
                return DeviceFullInfo.builder()
                        .device(device.get())
                        .status(status)
                        .telemetries(telemetries)
                        .build();
            })
            .orTimeout(3000, TimeUnit.MILLISECONDS)  // 超时控制
            .exceptionally(ex -> DeviceFullInfo.error(deviceId, ex.getMessage()));
}
```

**性能对比**：

```
串行查询（传统方式）：
┌─────────────────────────────────────────────────────────────┐
│ 查询设备信息     │ 100ms                                     │
│                  ├──────────────────────────────────────────┤
│                  │ 查询设备状态     │ 80ms                   │
│                  │                  ├───────────────────────┤
│                  │                  │ 查询遥测数据 │ 150ms   │
└─────────────────────────────────────────────────────────────┘
总耗时：100 + 80 + 150 = 330ms

并行查询（CompletableFuture）：
┌─────────────────────────────────────────────────────────────┐
│ 查询设备信息     │ 100ms                                     │
│ 查询设备状态     │ 80ms                                       │
│ 查询遥测数据     │ 150ms                                      │
└─────────────────────────────────────────────────────────────┘
总耗时：max(100, 80, 150) = 150ms（节省 55%）
```

**为什么用虚拟线程？**

```
传统线程池问题：
- 3 个并行查询 = 3 个线程
- 每个线程等待数据库响应时被阻塞
- 线程池可能被耗尽

虚拟线程方案：
- 3 个虚拟线程
- 数据库 I/O 阻塞时自动卸载
- 资源占用极低
```

---

#### Q11: 你们项目中的 CompletableFutureUtils 工具类提供了哪些实用方法？为什么要封装？

**项目背景**：项目中有多处异步操作需要超时控制、重试机制等功能。

**参考答案**：

**项目实际代码**（[CompletableFutureUtils.java](backend/src/main/java/com/dormpower/util/CompletableFutureUtils.java)）：

```java
public final class CompletableFutureUtils {

    // 1. 带超时的异步操作
    public static <T> CompletableFuture<T> supplyAsyncWithTimeout(
            Supplier<T> supplier, Executor executor, long timeoutMs) {
        return CompletableFuture.supplyAsync(supplier, executor)
                .orTimeout(timeoutMs, TimeUnit.MILLISECONDS);
    }

    // 2. 带超时和默认值的异步操作
    public static <T> CompletableFuture<T> supplyAsyncWithFallback(
            Supplier<T> supplier, Executor executor, long timeoutMs, T defaultValue) {
        return CompletableFuture.supplyAsync(supplier, executor)
                .orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .exceptionally(ex -> defaultValue);
    }

    // 3. 带重试机制的异步操作
    public static <T> CompletableFuture<T> supplyAsyncWithRetry(
            Supplier<T> supplier, Executor executor, int maxRetries, long delayMs);

    // 4. 并行执行多个任务并收集结果
    public static <T> CompletableFuture<List<T>> allOf(
            List<Supplier<T>> tasks, Executor executor);

    // 5. 竞争执行，返回最快完成的结果
    public static <T> CompletableFuture<T> anyOf(
            List<Supplier<T>> tasks, Executor executor);
}
```

**封装的价值**：

```
不封装的问题：
┌─────────────────────────────────────────────────────────────┐
│ // 每次都要写这样的代码                                       │
│ CompletableFuture.supplyAsync(() -> {...}, executor)         │
│     .orTimeout(5000, TimeUnit.MILLISECONDS)                  │
│     .exceptionally(ex -> {                                   │
│         logger.error("操作失败", ex);                        │
│         return defaultValue;                                 │
│     });                                                      │
│                                                              │
│ // 问题：                                                     │
│ // 1. 代码重复，维护困难                                      │
│ // 2. 超时时间、异常处理逻辑分散                               │
│ // 3. 日志格式不一致                                          │
└─────────────────────────────────────────────────────────────┘

封装后：
┌─────────────────────────────────────────────────────────────┐
│ // 简洁、统一、易维护                                        │
│ CompletableFutureUtils.supplyAsyncWithFallback(              │
│     () -> deviceRepository.findById(id),                     │
│     virtualThreadExecutor,                                   │
│     5000,                                                    │
│     Optional.empty()                                         │
│ );                                                           │
└─────────────────────────────────────────────────────────────┘
```

**重试机制的实现**：

```java
// CompletableFutureUtils.java:64-96
private static <T> void executeWithRetry(
        Supplier<T> supplier, Executor executor,
        int maxRetries, long delayMs, int attempt,
        CompletableFuture<T> result) {

    CompletableFuture.supplyAsync(supplier, executor)
            .whenComplete((value, ex) -> {
                if (ex == null) {
                    result.complete(value);  // 成功，完成
                } else if (attempt < maxRetries) {
                    // 重试：使用 delayedExecutor 延迟执行
                    scheduleRetry(() -> executeWithRetry(
                        supplier, executor, maxRetries, delayMs, attempt + 1, result),
                        delayMs, executor);
                } else {
                    result.completeExceptionally(ex);  // 重试耗尽，失败
                }
            });
}

// Java 9+ 的延迟执行器
private static void scheduleRetry(Runnable retryTask, long delayMs, Executor executor) {
    CompletableFuture.delayedExecutor(delayMs, TimeUnit.MILLISECONDS, executor)
            .execute(retryTask);
}
```

**项目中的实际使用场景**：

| 场景          | 使用方法                 | 原因                |
| ------------- | ------------------------ | ------------------- |
| 设备遥测查询  | `supplyAsyncWithTimeout` | 防止慢查询阻塞      |
| 批量设备查询  | `allOfWithTimeout`       | 并行查询 + 超时控制 |
| MQTT 命令发送 | `supplyAsyncWithRetry`   | 网络不稳定需要重试  |
| 多数据源查询  | `anyOf`                  | 取最快响应          |

---

#### Q12: MqttService 的 sendCommandAndWaitAck 方法如何实现命令发送和响应等待？

**项目背景**：设备控制需要发送命令并等待设备确认（ACK），支持超时控制。

**参考答案**：

**项目实际代码**（[MqttService.java:167-194](backend/src/main/java/com/dormpower/service/MqttService.java#L167-L194)）：

```java
// 等待响应的 Future 映射（correlationId -> CompletableFuture）
private final Map<String, CompletableFuture<MqttResponse>> pendingResponses = new ConcurrentHashMap<>();

/**
 * 发送命令并等待响应（ACK）
 */
public CompletableFuture<MqttResponse> sendCommandAndWaitAck(
        String deviceId, String command, long timeoutMs) {

    String correlationId = generateCorrelationId(deviceId);
    CompletableFuture<MqttResponse> future = new CompletableFuture<>();

    // 1. 注册等待响应
    pendingResponses.put(correlationId, future);

    // 2. 发送命令
    String topic = "dorm/cmd/" + deviceId;
    String payload = buildCommandPayload(correlationId, command);

    return sendMessageAsync(topic, payload)
            .thenCompose(v -> future
                    .orTimeout(timeoutMs, TimeUnit.MILLISECONDS)  // 超时控制
                    .whenComplete((response, ex) -> {
                        pendingResponses.remove(correlationId);  // 清理
                    }))
            .exceptionally(ex -> {
                pendingResponses.remove(correlationId);
                return new MqttResponse(deviceId, false, "发送失败: " + ex.getMessage());
            });
}

/**
 * 处理收到的 ACK 响应（由 MqttBridge 调用）
 */
public void handleAckResponse(String correlationId, String deviceId, boolean success, String message) {
    CompletableFuture<MqttResponse> future = pendingResponses.remove(correlationId);
    if (future != null) {
        future.complete(new MqttResponse(deviceId, success, message));  // 完成等待
    }
}
```

**设计分析**：

```
执行流程：
┌─────────────────────────────────────────────────────────────┐
│ HTTP 线程                                                    │
│   │                                                          │
│   └─→ sendCommandAndWaitAck(deviceId, "turn_on")             │
│           │                                                  │
│           ├─→ 生成 correlationId = "dev123_1234567890_5678"  │
│           │                                                  │
│           ├─→ 创建 CompletableFuture<MqttResponse>           │
│           │                                                  │
│           ├─→ pendingResponses.put(correlationId, future)   │
│           │                                                  │
│           └─→ 返回 CompletableFuture（立即返回）              │
│                                                              │
│ MQTT 虚拟线程                                               │
│   │                                                          │
│   └─→ 发送命令到 MQTT Broker                                 │
│                                                              │
│ 设备 ACK（几秒后）                                           │
│   │                                                          │
│   └─→ MqttBridge 收到 ACK                                    │
│           │                                                  │
│           └─→ handleAckResponse(correlationId, ...)          │
│                   │                                          │
│                   └─→ future.complete(response)              │
│                       ↑                                      │
│                       │                                      │
│           HTTP 响应返回给客户端                              │
└─────────────────────────────────────────────────────────────┘
```

**为什么用 ConcurrentHashMap 存储 pendingResponses？**

```
并发访问场景：
- 多个 HTTP 请求同时发送命令 → 写入 pendingResponses
- 多个设备同时响应 ACK → 读取并删除 pendingResponses
- 超时清理 → 删除 pendingResponses

ConcurrentHashMap 优势：
1. computeIfAbsent 原子操作
2. remove 返回旧值，避免并发问题
3. 高并发读写性能
```

**超时处理机制**：

```java
// Java 9+ 的 orTimeout 方法
future.orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
      .exceptionally(ex -> {
          if (ex instanceof TimeoutException) {
              logger.warn("等待设备响应超时: deviceId={}", deviceId);
          }
          return new MqttResponse(deviceId, false, "Timeout");
      });

// 内部实现：使用 ScheduledExecutorService
// 超时后抛出 TimeoutException，触发 exceptionally
```

---

#### Q13: AiReportService 的 getAiReportAsync 方法如何实现多设备并行查询？

**项目背景**：AI 报告需要查询房间内所有设备的遥测数据，设备数量可能很多。

**参考答案**：

**项目实际代码**（[AiReportService.java:69-96](backend/src/main/java/com/dormpower/service/AiReportService.java#L69-L96)）：

```java
public CompletableFuture<Map<String, Object>> getAiReportAsync(String roomId, String period) {
    return CompletableFuture.supplyAsync(
            () -> deviceRepository.findByRoom(roomId), virtualThreadExecutor)
        .thenComposeAsync(devices -> {
            if (devices.isEmpty()) {
                return CompletableFuture.completedFuture(createEmptyReport(...));
            }

            final int days = "7d".equals(period) ? 7 : 30;
            final long nowTs = System.currentTimeMillis() / 1000;
            final long startTs = nowTs - days * 24 * 3600L;

            // 并行查询所有设备的遥测数据
            return fetchAllTelemetryAsync(devices, startTs, nowTs)
                    .thenApply(allData -> {
                        if (allData.isEmpty()) {
                            return createEmptyReport(...);
                        }
                        return analyzeData(roomId, allData);
                    });
        }, virtualThreadExecutor)
        .exceptionally(ex -> createEmptyReport(roomId, "Error: " + ex.getMessage(), ...));
}

/**
 * 并行获取所有设备的遥测数据
 */
private CompletableFuture<List<Telemetry>> fetchAllTelemetryAsync(
        List<Device> devices, long startTs, long endTs) {

    // 创建所有设备的查询任务
    List<CompletableFuture<List<Telemetry>>> futures = devices.stream()
            .map(device -> CompletableFuture.supplyAsync(
                    () -> telemetryRepository.findByDeviceIdAndTsBetweenOrderByTsAsc(
                            device.getId(), startTs, endTs),
                    virtualThreadExecutor)
                    .orTimeout(QUERY_TIMEOUT_MS, TimeUnit.MILLISECONDS)  // 单个查询超时
                    .exceptionally(ex -> Collections.emptyList()))  // 失败返回空列表
            .toList();

    // 等待所有查询完成并合并结果
    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .collect(Collectors.toList()));
}
```

**性能优化分析**：

```
假设房间有 10 个设备，每个设备查询耗时 200ms：

串行查询：
┌─────────────────────────────────────────────────────────────┐
│ 设备1 │ 200ms                                                │
│       ├───────┼───────┼───────┼───────┼───────┼───────┼─────│
│       │ 设备2 │ 设备3 │ 设备4 │ ...   │ 设备10│       │     │
└─────────────────────────────────────────────────────────────┘
总耗时：10 × 200ms = 2000ms

并行查询（虚拟线程）：
┌─────────────────────────────────────────────────────────────┐
│ 设备1 │ 200ms                                                │
│ 设备2 │ 200ms                                                │
│ 设备3 │ 200ms                                                │
│ ...                                                         │
│ 设备10│ 200ms                                                │
└─────────────────────────────────────────────────────────────┘
总耗时：max(200ms) = 200ms（节省 90%）
```

**异常容错设计**：

```java
// 单个设备查询失败不影响整体
.orTimeout(QUERY_TIMEOUT_MS, TimeUnit.MILLISECONDS)
.exceptionally(ex -> {
    logger.warn("查询设备遥测数据失败: deviceId={}", device.getId());
    return Collections.emptyList();  // 返回空列表，不影响其他设备
})

// 整体异常处理
.exceptionally(ex -> createEmptyReport(roomId, "Error: " + ex.getMessage(), ...))
```

**thenCompose vs thenApply 的区别**：

```java
// thenApply：同步转换结果
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "hello");
CompletableFuture<String> future2 = future1.thenApply(s -> s.toUpperCase());  // 返回 String

// thenCompose：异步链式调用（flatMap）
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "hello");
CompletableFuture<String> future2 = future1.thenCompose(s ->
    CompletableFuture.supplyAsync(() -> s.toUpperCase()));  // 返回 CompletableFuture<String>

// 项目中的使用：
// thenCompose 用于 fetchAllTelemetryAsync 返回的 CompletableFuture
return CompletableFuture.supplyAsync(() -> deviceRepository.findByRoom(roomId))
    .thenComposeAsync(devices -> fetchAllTelemetryAsync(devices, ...));  // 链式异步
```

---

#### Q14: ThreadPoolMonitorService 如何同时监控平台线程池和虚拟线程？

**项目背景**：项目混合使用平台线程池和虚拟线程，需要统一的监控方案。

**参考答案**：

**项目实际代码**（[ThreadPoolMonitorService.java:59-78](backend/src/main/java/com/dormpower/service/ThreadPoolMonitorService.java#L59-L78)）：

```java
/**
 * 获取完整的线程池指标
 */
public Map<String, Object> getMetrics() {
    Map<String, Object> metrics = new HashMap<>();

    // 平台线程池指标
    metrics.putAll(getPlatformThreadPoolMetrics());

    // 虚拟线程统计
    metrics.putAll(getVirtualThreadMetrics());

    // JVM 线程统计
    metrics.putAll(getJvmThreadMetrics());

    // 任务统计
    metrics.putAll(getTaskMetrics());

    // 健康状态
    metrics.put("healthStatus", getHealthStatus());

    return metrics;
}
```

**平台线程池监控**：

```java
// ThreadPoolMonitorService.java:83-117
private Map<String, Object> getPlatformThreadPoolMetrics() {
    Map<String, Object> metrics = new HashMap<>();

    // 基本信息
    metrics.put("platform.corePoolSize", executor.getCorePoolSize());
    metrics.put("platform.maximumPoolSize", executor.getMaximumPoolSize());
    metrics.put("platform.keepAliveTime", executor.getKeepAliveTime(TimeUnit.SECONDS));

    // 运行状态
    metrics.put("platform.activeCount", executor.getActiveCount());
    metrics.put("platform.poolSize", executor.getPoolSize());
    metrics.put("platform.queueSize", executor.getQueue().size());

    // 计算派生指标
    double utilizationRate = (double) executor.getActiveCount() / executor.getMaximumPoolSize() * 100;
    metrics.put("platform.utilizationRate", String.format("%.2f%%", utilizationRate));

    // 状态判断
    metrics.put("platform.status", getPoolStatus(utilizationRate, queueUsageRate));

    return metrics;
}
```

**虚拟线程监控的挑战与解决方案**：

```
挑战：
┌─────────────────────────────────────────────────────────────┐
│ 1. 虚拟线程由 JVM 管理，没有传统的线程池 API                 │
│ 2. newThreadPerTaskExecutor 不暴露内部状态                   │
│ 3. 虚拟线程数量可能非常大（数百万），不能直接计数            │
└─────────────────────────────────────────────────────────────┘

解决方案：自定义计数器
┌─────────────────────────────────────────────────────────────┐
│ // DynamicThreadPoolConfig.java - 自定义统计类              │
│ @Component                                                   │
│ public static class ThreadPoolStats {                        │
│     private final AtomicLong virtualThreadCount = new AtomicLong();│
│     private final AtomicInteger mqttTaskCount = new AtomicInteger();│
│     private final AtomicInteger websocketTaskCount = new AtomicInteger();│
│                                                              │
│     public void incrementVirtualThread() {                   │
│         virtualThreadCount.incrementAndGet();                │
│     }                                                        │
│                                                              │
│     public void incrementMqttTask() {                        │
│         mqttTaskCount.incrementAndGet();                     │
│     }                                                        │
│ }                                                            │
│                                                              │
│ // 在任务执行时调用                                          │
│ mqttExecutor.execute(() -> {                                 │
│     threadPoolStats.incrementMqttTask();                     │
│     // 执行任务...                                           │
│ });                                                          │
└─────────────────────────────────────────────────────────────┘
```

**健康状态判断**：

```java
// ThreadPoolMonitorService.java:263-274
public String getHealthStatus() {
    double utilizationRate = (double) executor.getActiveCount() / executor.getMaximumPoolSize();
    int queueSize = executor.getQueue().size();

    if (utilizationRate > 0.9 && queueSize > 80) {
        return "CRITICAL";  // 危险：利用率高 + 队列堆积
    } else if (utilizationRate > 0.7 || queueSize > 50) {
        return "WARNING";   // 警告：利用率较高或队列有堆积
    } else {
        return "HEALTHY";   // 健康
    }
}
```

**监控指标输出示例**：

```json
{
  "platform.corePoolSize": 2,
  "platform.maximumPoolSize": 10,
  "platform.activeCount": 3,
  "platform.queueSize": 15,
  "platform.utilizationRate": "30.00%",
  "platform.status": "NORMAL",
  "virtual.type": "VirtualThreadPerTaskExecutor",
  "virtual.taskCount": 1523,
  "virtual.mqttTaskCount": 856,
  "virtual.websocketTaskCount": 667,
  "jvm.threadCount": 45,
  "jvm.virtualThreadEstimate": 1523,
  "healthStatus": "HEALTHY"
}
```

---

### 10.5 锁与 volatile 专题（基于 MqttSimulatorService.java）

#### Q15: 你们项目中 MqttSimulatorService 用了 volatile 修饰 running 和 status，能讲讲原因吗？

**项目背景**：模拟器任务需要在运行时被外部停止，必须保证状态可见性。

**参考答案**：

**项目实际代码**（[MqttSimulatorService.java:336-338](backend/src/main/java/com/dormpower/service/MqttSimulatorService.java#L336-L338)）：

```java
private class SimulatorTask implements Runnable {
    private volatile boolean running = true;
    private volatile String status = "RUNNING";

    public void stop() {
        running = false;
        status = "STOPPED";
    }

    @Override
    public void run() {
        while (running && System.currentTimeMillis() < endTimeMillis) {
            // 执行任务...
        }
    }
}
```

**为什么必须用 volatile？**

```
场景：一个线程执行任务，另一个线程调用 stop()

不用 volatile：
┌─────────────────────────────────────────────────────────────┐
│ 线程1 (执行任务)                                             │
│   while (running) { ... }  // 读取 CPU 缓存中的 running=true│
│                                                             │
│ 线程2 (停止任务)                                             │
│   running = false;  // 写入主内存                           │
│                                                             │
│ 问题：线程1 可能一直读取缓存中的 true，不会停止              │
└─────────────────────────────────────────────────────────────┘

使用 volatile：
┌─────────────────────────────────────────────────────────────┐
│ 线程1 (执行任务)                                             │
│   while (running) { ... }  // 强制从主内存读取              │
│                                                             │
│ 线程2 (停止任务)                                             │
│   running = false;  // 立即写入主内存 + 刷新其他 CPU 缓存    │
│                                                             │
│ 效果：线程1 立即看到 running=false，退出循环                 │
└─────────────────────────────────────────────────────────────┘
```

**volatile 的内存语义**：

```
写 volatile：
  StoreStore 屏障 → 阻止上面的普通写与下面的 volatile 写重排序
  volatile 写
  StoreLoad 屏障 → 阻止上面的 volatile 写与下面的读写重排序

读 volatile：
  LoadLoad 屏障 → 阻止下面的普通读与上面的 volatile 读重排序
  volatile 读
  LoadStore 屏障 → 阻止下面的普通写与上面的 volatile 读重排序
```

**volatile 不能保证原子性**：

```java
// ❌ 错误：volatile 不能保证 count++ 的原子性
private volatile int count = 0;

public void increment() {
    count++;  // 实际是 3 步：读取 → 加1 → 写回
}

// 项目中的正确做法
private final AtomicInteger totalMessages = new AtomicInteger(0);
totalMessages.incrementAndGet();  // 原子操作
```

---

#### Q16: 项目中 MqttSimulatorService 的 saveToHistory 方法为什么用 synchronized？

**项目背景**：历史任务记录需要保护，但这个方法不在虚拟线程路径上。

**参考答案**：

**项目实际代码**（[MqttSimulatorService.java:277-285](backend/src/main/java/com/dormpower/service/MqttSimulatorService.java#L277-L285)）：

```java
private synchronized void saveToHistory(SimulatorTask task) {
    MqttSimulatorStatus status = task.getStatusInfo();
    historyTasks.add(status);

    if (historyTasks.size() > 100) {
        historyTasks.remove(0);
    }
}
```

**为什么这里用 synchronized 而不是 ReentrantLock？**

```
分析调用链：
┌─────────────────────────────────────────────────────────────┐
│ HTTP 请求 → Controller → MqttSimulatorService.saveToHistory │
│                                                             │
│ 这个方法在 HTTP 请求线程中执行，不是在虚拟线程中             │
│                                                             │
│ HTTP 线程是平台线程，不会触发载体线程钉住问题               │
└─────────────────────────────────────────────────────────────┘

选择依据：
┌─────────────────────────────────────────────────────────────┐
│ 场景                          │ 推荐锁      │ 原因          │
├──────────────────────────────┼─────────────┼────────────────┤
│ 在虚拟线程中执行 + 有 I/O     │ ReentrantLock │ 避免钉住     │
│ 在平台线程中执行 + 简单操作   │ synchronized │ 简洁方便     │
│ 需要超时/中断                 │ ReentrantLock │ 功能支持     │
│ 需要公平锁                    │ ReentrantLock │ 可配置公平   │
└─────────────────────────────────────────────────────────────┘

项目中的对比：
// WebSocketManager.subscribeDevice - 在虚拟线程中执行
// 使用 ReentrantLock
private final ReentrantLock subscriptionLock = new ReentrantLock();

// MqttSimulatorService.saveToHistory - 在平台线程中执行
// 使用 synchronized
private synchronized void saveToHistory(SimulatorTask task) { ... }
```

---

### 10.6 CopyOnWrite 集合专题（基于 WebSocketManager.java）

#### Q17: 为什么 WebSocketManager 用 CopyOnWriteArraySet 存储会话？

**项目背景**：WebSocket 需要频繁广播消息给所有会话，会话增删频率低。

**参考答案**：

**项目实际代码**（[WebSocketManager.java:35](backend/src/main/java/com/dormpower/websocket/WebSocketManager.java#L35)）：

```java
private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
```

**业务场景分析**：

```
操作频率统计（10,000 个设备在线）：

读操作（广播消息）：
- 每秒 100+ 次消息推送
- 每次推送需要遍历所有订阅的会话
- 读频率：极高

写操作（连接/断开）：
- 设备连接建立：每分钟 10-20 次
- 设备断开：每分钟 10-20 次
- 写频率：低

读写比例：1000:1
```

**CopyOnWriteArraySet 原理**：

```
读操作：
┌─────────────────────────────────────────────────────────────┐
│ public boolean contains(Object o) {                          │
│     return indexOf(o) >= 0;  // 无锁，直接读数组            │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

写操作：
┌─────────────────────────────────────────────────────────────┐
│ public boolean add(E e) {                                    │
│     synchronized (lock) {                                    │
│         Object[] elements = getArray();                      │
│         int len = elements.length;                           │
│         Object[] newElements = Arrays.copyOf(elements, len+1);│
│         newElements[len] = e;                                │
│         setArray(newElements);  // volatile 写               │
│         return true;                                         │
│     }                                                        │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

**项目中的实际应用**：

```java
// WebSocketManager.java:127-137 - 广播消息（读操作）
public void broadcast(String message) {
    sessions.forEach(session -> {  // 无锁遍历
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message));
            }
        } catch (Exception e) {
            logger.error("广播消息失败: {}", e.getMessage());
        }
    });
}

// 特点：
// 1. 遍历时不加锁，性能极高
// 2. 即使有新会话加入，也不影响当前遍历
// 3. 迭代器是快照，不会抛 ConcurrentModificationException
```

**如果用 HashSet 会怎样？**

```java
// ❌ 错误：HashSet 线程不安全
private final Set<WebSocketSession> sessions = new HashSet<>();

// 广播时遍历
sessions.forEach(session -> {  // 如果此时有新连接加入
    // 抛出 ConcurrentModificationException！
});
```

---

### 10.7 定时任务专题（基于 SimpleCacheService.java）

#### Q18: 你们项目中的 SimpleCacheService 用 ScheduledExecutorService 做缓存清理，有什么注意事项？

**项目背景**：内存缓存需要定期清理过期数据。

**参考答案**：

**项目实际代码**（[SimpleCacheService.java:31-40](backend/src/main/java/com/dormpower/service/SimpleCacheService.java#L31-L40)）：

```java
private final ScheduledExecutorService cleaner = new ScheduledThreadPoolExecutor(1,
        r -> {
            Thread t = new Thread(r, "cache-cleaner");
            t.setDaemon(true);  // 守护线程
            return t;
        });

public SimpleCacheService() {
    cleaner.scheduleAtFixedRate(this::cleanExpired, 5, 5, TimeUnit.MINUTES);
}
```

**关键设计点**：

```
1. 为什么用守护线程？
┌─────────────────────────────────────────────────────────────┐
│ 守护线程 vs 用户线程                                        │
│                                                             │
│ 用户线程：JVM 会等待所有用户线程执行完毕才退出               │
│ 守护线程：JVM 退出时，守护线程会被强制终止                  │
│                                                             │
│ 缓存清理是后台任务，应用退出时应该随之停止                   │
│ 如果是用户线程，应用会一直等待，无法正常关闭                │
└─────────────────────────────────────────────────────────────┘

2. 为什么自定义线程名？
┌─────────────────────────────────────────────────────────────┐
│ "cache-cleaner" - 便于日志排查和监控                        │
│                                                             │
│ 线程 dump 时可以看到：                                      │
│ "cache-cleaner" - 正在执行缓存清理                          │
│ vs                                                          │
│ "pool-1-thread-1" - 不知道是什么线程                        │
└─────────────────────────────────────────────────────────────┘
```

**定时任务异常处理陷阱**：

```java
// ❌ 错误：任务抛异常后不再执行
cleaner.scheduleAtFixedRate(() -> {
    cleanExpired();  // 如果抛异常，后续任务停止
}, 5, 5, TimeUnit.MINUTES);

// ✅ 正确：捕获所有异常
cleaner.scheduleAtFixedRate(() -> {
    try {
        cleanExpired();
    } catch (Exception e) {
        logger.error("缓存清理异常", e);
        // 不影响下次调度
    }
}, 5, 5, TimeUnit.MINUTES);
```

**优雅关闭**（[SimpleCacheService.java:146-157](backend/src/main/java/com/dormpower/service/SimpleCacheService.java#L146-L157)）：

```java
public void shutdown() {
    cleaner.shutdown();  // 不再接受新任务
    try {
        if (!cleaner.awaitTermination(5, TimeUnit.SECONDS)) {
            cleaner.shutdownNow();  // 超时强制关闭
        }
    } catch (InterruptedException e) {
        cleaner.shutdownNow();
        Thread.currentThread().interrupt();  // 恢复中断状态
    }
}
```

---

### 10.8 综合实战题

#### Q19: 你们项目的 ThreadPoolAutoTuner 实现了自动调优，能详细讲讲设计思路吗？

**项目背景**：服务器资源有限（2核2GB），需要动态调整线程池参数。

**参考答案**：

**项目实际代码**（[ThreadPoolAutoTuner.java:67-116](backend/src/main/java/com/dormpower/scheduler/ThreadPoolAutoTuner.java#L67-L116)）：

```java
@Scheduled(fixedRate = 30000)
public void autoTune() {
    double cpuUsage = getCpuUsage();
    double poolUtilization = (double) activeCount / maxPoolSize;
    double queueUsage = (double) queueSize / queueCapacity;

    // 扩容条件
    if (shouldScaleUp(cpuUsage, poolUtilization, queueUsage)) {
        int newMax = Math.min(currentMax + 2, 20);
        executor.setMaximumPoolSize(newMax);
    }

    // 缩容条件
    if (shouldScaleDown(cpuUsage, poolUtilization, queueUsage)) {
        int newCore = Math.max(currentCore - 2, 2);
        executor.setCorePoolSize(newCore);
    }
}
```

**调优策略**：

```
决策矩阵：
┌─────────────────────────────────────────────────────────────┐
│ 场景                          │ 操作   │ 原因              │
├──────────────────────────────┼────────┼────────────────────┤
│ CPU > 80% + 池利用率 > 80%   │ 扩容   │ 资源紧张，增加线程 │
│ 队列使用率 > 80%            │ 扩容   │ 任务堆积           │
│ 池利用率 > 90% + 队列 > 50% │ 扩容   │ 系统过载           │
├──────────────────────────────┼────────┼────────────────────┤
│ CPU < 30% + 池利用率 < 30%  │ 缩容   │ 资源空闲           │
│ + 队列使用率 < 20%          │        │                    │
└─────────────────────────────────────────────────────────────┘

防抖设计：
- 调整间隔 >= 30 秒
- 防止频繁调整导致系统震荡
```

**调优建议功能**（[ThreadPoolAutoTuner.java:231-260](backend/src/main/java/com/dormpower/scheduler/ThreadPoolAutoTuner.java#L231-L260)）：

```java
public String getTuningAdvice() {
    if (cpuUsage > 80) {
        if (poolUtilization > 0.8) {
            return "建议将 I/O 任务迁移到虚拟线程";
        }
    } else if (poolUtilization > 0.9 && queueSize > 50) {
        return "适合使用虚拟线程处理 I/O 任务";
    }

    if (virtualCount == 0) {
        return "建议将 I/O 密集型任务迁移到虚拟线程执行器";
    }
}
```

---

#### Q20: 如果让你设计一个设备状态管理器，支持高并发读写，你会怎么设计？

**项目背景**：10,000+ 设备实时状态管理。

**参考答案**：

**设计思路**：

```java
@Service
public class DeviceStateManager {

    // 1. 核心存储 - ConcurrentHashMap
    private final ConcurrentHashMap<String, DeviceState> deviceStates = new ConcurrentHashMap<>();

    // 2. 统计计数 - LongAdder（高并发场景）
    private final LongAdder updateCounter = new LongAdder();

    // 3. 复合操作锁 - ReentrantLock（虚拟线程友好）
    private final ReentrantLock registrationLock = new ReentrantLock();

    /**
     * 更新设备状态 - 使用 compute 原子操作
     */
    public void updateState(String deviceId, DeviceState newState) {
        deviceStates.compute(deviceId, (id, oldState) -> {
            if (oldState == null) {
                return newState;
            }
            oldState.merge(newState);
            return oldState;
        });
        updateCounter.increment();
    }

    /**
     * 获取设备状态 - 无锁读
     */
    public DeviceState getState(String deviceId) {
        return deviceStates.get(deviceId);
    }

    /**
     * 批量更新 - 并行处理
     */
    @Autowired
    @Qualifier("virtualThreadExecutor")
    private Executor virtualThreadExecutor;

    public CompletableFuture<Void> batchUpdate(Map<String, DeviceState> updates) {
        return CompletableFuture.allOf(
            updates.entrySet().stream()
                .map(e -> CompletableFuture.runAsync(
                    () -> updateState(e.getKey(), e.getValue()),
                    virtualThreadExecutor))
                .toArray(CompletableFuture[]::new)
        );
    }

    /**
     * 清理离线设备 - 使用 removeIf 原子删除
     */
    public int cleanOfflineDevices(long offlineThresholdMs) {
        long now = System.currentTimeMillis();
        AtomicInteger removed = new AtomicInteger(0);

        deviceStates.entrySet().removeIf(entry -> {
            if (now - entry.getValue().getLastUpdateTs() > offlineThresholdMs) {
                removed.incrementAndGet();
                return true;
            }
            return false;
        });

        return removed.get();
    }
}
```

**设计要点总结**：

| 需求       | 方案                         | 原因             |
| ---------- | ---------------------------- | ---------------- |
| 高并发读写 | ConcurrentHashMap            | 细粒度锁，读无锁 |
| 计数统计   | LongAdder                    | 分散热点，高性能 |
| 复合操作   | ReentrantLock                | 虚拟线程友好     |
| 批量操作   | CompletableFuture + 虚拟线程 | 并行处理         |
| 条件删除   | removeIf                     | 原子操作         |

---

#### Q21: 你们项目中如果有线程池队列满了，会有什么表现？怎么排查？

**参考答案**：

**问题表现**：

```
业务层面：
1. HTTP 接口响应变慢
2. 设备控制命令延迟
3. 数据上报处理延迟

系统层面：
1. CPU 使用率低（线程都在等待）
2. 线程池队列持续满
3. 拒绝策略触发日志
```

**排查步骤**：

```java
// 1. 添加监控日志
@Scheduled(fixedRate = 60000)
public void monitorThreadPool() {
    int active = executor.getActiveCount();
    int queue = executor.getQueue().size();
    int max = executor.getMaximumPoolSize();

    if (queue > 80) {
        logger.warn("线程池队列告警: queue={}/{}, active={}/{}",
            queue, queueCapacity, active, max);
    }
}

// 2. 线程 dump 分析
// jstack <pid> | grep "BLOCKED\|WAITING" -A 10

// 3. 分析任务执行时间
executor.submit(() -> {
    long start = System.currentTimeMillis();
    try {
        // 业务逻辑
    } finally {
        long duration = System.currentTimeMillis() - start;
        if (duration > 1000) {
            logger.warn("任务执行慢: {}ms", duration);
        }
    }
});
```

**解决方案**：

```java
// 方案1：使用虚拟线程（I/O 阻塞场景）
ExecutorService vt = Executors.newThreadPerTaskExecutor(
    Thread.ofVirtual().factory()
);

// 方案2：动态扩容
if (queueSize > 80) {
    executor.setCorePoolSize(executor.getCorePoolSize() + 2);
}

// 方案3：任务拆分
// 大任务拆成小任务，减少单个任务执行时间
```

---

#### Q22: 你们项目中 MqttService 的批量命令发送如何实现？有什么优化点？

**项目背景**：需要向多个设备发送控制命令，支持并行发送和结果汇总。

**参考答案**：

**项目实际代码**（[MqttService.java:211-236](backend/src/main/java/com/dormpower/service/MqttService.java#L211-L236)）：

```java
/**
 * 批量发送命令到多个设备
 */
public CompletableFuture<BatchCommandResult> sendCommandToDevices(
        List<String> deviceIds, String command, long timeoutMs) {

    // 1. 创建所有设备的发送任务
    List<CompletableFuture<MqttResponse>> futures = deviceIds.stream()
            .map(deviceId -> sendCommandAndWaitAck(deviceId, command, timeoutMs))
            .toList();

    // 2. 等待所有命令完成
    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> {
                // 3. 统计成功/失败数量
                int success = 0;
                int failed = 0;
                List<String> failedDevices = new ArrayList<>();

                for (int i = 0; i < futures.size(); i++) {
                    MqttResponse response = futures.get(i).join();
                    if (response.success) {
                        success++;
                    } else {
                        failed++;
                        failedDevices.add(deviceIds.get(i));
                    }
                }

                return new BatchCommandResult(success, failed, failedDevices);
            });
}

/**
 * 批量命令执行结果
 */
public static class BatchCommandResult {
    public final int successCount;
    public final int failedCount;
    public final List<String> failedDevices;

    public boolean isAllSuccess() {
        return failedCount == 0;
    }

    public double getSuccessRate() {
        int total = successCount + failedCount;
        return total > 0 ? (double) successCount / total * 100 : 0;
    }
}
```

**设计优化点**：

```
1. 并行发送
┌─────────────────────────────────────────────────────────────┐
│ 串行发送 10 个设备（每个 500ms）：                           │
│ 总耗时 = 10 × 500ms = 5000ms                               │
│                                                              │
│ 并行发送（虚拟线程）：                                       │
│ 总耗时 = max(500ms) ≈ 500ms（节省 90%）                    │
└─────────────────────────────────────────────────────────────┘

2. 结果汇总
┌─────────────────────────────────────────────────────────────┐
│ 不需要等待每个结果逐个返回                                   │
│ allOf + join 一次性获取所有结果                             │
│ 自动统计成功率和失败设备                                     │
└─────────────────────────────────────────────────────────────┘

3. 容错处理
┌─────────────────────────────────────────────────────────────┐
│ 单个设备失败不影响其他设备                                   │
│ 失败设备列表可用于重试                                       │
│ 提供成功率指标供监控告警                                     │
└─────────────────────────────────────────────────────────────┘
```

**如果需要限制并发数量？**

```java
// 使用 Semaphore 限制并发
private final Semaphore concurrencyLimit = new Semaphore(10);  // 最多 10 个并发

public CompletableFuture<BatchCommandResult> sendCommandToDevices(
        List<String> deviceIds, String command, long timeoutMs) {

    List<CompletableFuture<MqttResponse>> futures = deviceIds.stream()
            .map(deviceId -> CompletableFuture.supplyAsync(() -> {
                try {
                    concurrencyLimit.acquire();  // 获取许可
                    return sendCommandAndWaitAck(deviceId, command, timeoutMs).join();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return new MqttResponse(deviceId, false, "Interrupted");
                } finally {
                    concurrencyLimit.release();  // 释放许可
                }
            }, mqttExecutor))
            .toList();

    // ... 后续处理
}
```

---

#### Q23: 你们项目如何保证线程池的优雅关闭？

**项目背景**：应用关闭时，正在执行的任务不能丢失，需要等待完成或记录状态。

**参考答案**：

**优雅关闭的标准流程**：

```java
// 1. 标准的优雅关闭模式
@PreDestroy
public void shutdown() {
    // 第一步：不再接受新任务
    executor.shutdown();

    try {
        // 第二步：等待已提交任务完成
        if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
            // 第三步：超时后强制关闭
            List<Runnable> unfinished = executor.shutdownNow();

            // 第四步：记录未完成任务（可选）
            logger.warn("线程池强制关闭，{} 个任务未完成", unfinished.size());
            for (Runnable task : unfinished) {
                // 持久化未完成任务，重启后恢复
                saveUnfinishedTask(task);
            }

            // 第五步：再次等待
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                logger.error("线程池无法完全关闭");
            }
        }
    } catch (InterruptedException e) {
        // 第六步：处理中断
        executor.shutdownNow();
        Thread.currentThread().interrupt();
    }
}
```

**项目中的实际应用**（[SimpleCacheService.java:146-157](backend/src/main/java/com/dormpower/service/SimpleCacheService.java#L146-L157)）：

```java
public void shutdown() {
    cleaner.shutdown();  // 停止接受新任务
    try {
        if (!cleaner.awaitTermination(5, TimeUnit.SECONDS)) {
            cleaner.shutdownNow();  // 超时强制关闭
        }
    } catch (InterruptedException e) {
        cleaner.shutdownNow();
        Thread.currentThread().interrupt();  // 恢复中断状态
    }
}
```

**Spring Boot 的优雅关闭**：

```yaml
# application.yml
server:
  shutdown: graceful  # 启用优雅关闭

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s  # 优雅关闭超时时间
```

```java
// 配合 @PreDestroy 使用
@PreDestroy
public void onShutdown() {
    // Spring 会在优雅关闭期间调用
    // 此时不再接受新请求，等待现有请求完成
    logger.info("开始优雅关闭...");
}
```

**虚拟线程执行器的关闭**：

```java
// 虚拟线程执行器关闭特性
ExecutorService vt = Executors.newThreadPerTaskExecutor(
    Thread.ofVirtual().factory()
);

// shutdown() 会等待所有虚拟线程完成
// 注意：虚拟线程可能数量巨大，关闭时间可能很长
vt.shutdown();
vt.awaitTermination(60, TimeUnit.SECONDS);

// 如果需要快速关闭，使用 shutdownNow()
// 但会中断所有正在执行的虚拟线程
```

---

#### Q24: 你们项目中如何处理异步任务的异常？有哪些最佳实践？

**项目背景**：异步任务的异常不会直接抛出，需要特殊处理。

**参考答案**：

**异步任务异常的特点**：

```
同步代码异常：
┌─────────────────────────────────────────────────────────────┐
│ public void doSomething() {                                  │
│     throw new RuntimeException("Error");  // 直接抛出        │
│ }                                                            │
│                                                              │
│ 调用方可以直接捕获：                                         │
│ try { doSomething(); } catch (Exception e) { ... }          │
└─────────────────────────────────────────────────────────────┘

异步代码异常：
┌─────────────────────────────────────────────────────────────┐
│ CompletableFuture.runAsync(() -> {                           │
│     throw new RuntimeException("Error");  // 在另一个线程   │
│ });                                                          │
│                                                              │
│ 调用方无法直接捕获！异常被存储在 Future 中                   │
└─────────────────────────────────────────────────────────────┘
```

**项目中的异常处理方式**：

```java
// 方式1：exceptionally（提供默认值）
public CompletableFuture<Device> getDeviceAsync(String id) {
    return CompletableFuture.supplyAsync(() -> deviceRepository.findById(id))
            .exceptionally(ex -> {
                logger.error("查询设备失败: id={}", id, ex);
                return null;  // 返回默认值
            });
}

// 方式2：handle（统一处理成功和失败）
public CompletableFuture<String> handleAsync() {
    return CompletableFuture.supplyAsync(() -> doSomething())
            .handle((result, ex) -> {
                if (ex != null) {
                    logger.error("操作失败", ex);
                    return "fallback-value";
                }
                return result;
            });
}

// 方式3：whenComplete（记录日志，不改变结果）
public CompletableFuture<Device> logAsync(String id) {
    return CompletableFuture.supplyAsync(() -> deviceRepository.findById(id))
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    logger.error("查询设备失败: id={}", id, ex);
                } else {
                    logger.debug("查询设备成功: id={}", id);
                }
            });
}

// 方式4：项目中的完整示例（TelemetryService.java）
public CompletableFuture<BulkResult> saveAndNotify(List<Telemetry> telemetries) {
    return saveAllAsync(telemetries)
            .thenAccept(result -> { /* ... */ })
            .thenApply(v -> new BulkResult(telemetries.size(), 0))
            .exceptionally(ex -> {
                logger.error("批量保存并通知失败", ex);
                return new BulkResult(0, telemetries.size());  // 返回失败结果
            });
}
```

**异常处理最佳实践**：

```
1. 不要吞掉异常
┌─────────────────────────────────────────────────────────────┐
│ ❌ 错误：异常被忽略                                         │
│ .exceptionally(ex -> null)                                  │
│                                                              │
│ ✅ 正确：记录日志 + 返回默认值                              │
│ .exceptionally(ex -> {                                       │
│     logger.error("操作失败", ex);                           │
│     return defaultValue;                                     │
│ })                                                           │
└─────────────────────────────────────────────────────────────┘

2. 区分异常类型
┌─────────────────────────────────────────────────────────────┐
│ .exceptionally(ex -> {                                       │
│     if (ex instanceof TimeoutException) {                   │
│         logger.warn("操作超时");                            │
│         return timeoutFallback;                             │
│     } else if (ex instanceof BusinessException) {           │
│         logger.warn("业务异常: {}", ex.getMessage());       │
│         return businessFallback;                            │
│     } else {                                                 │
│         logger.error("系统异常", ex);                       │
│         return defaultFallback;                             │
│     }                                                        │
│ })                                                           │
└─────────────────────────────────────────────────────────────┘

3. 传播异常给调用方
┌─────────────────────────────────────────────────────────────┐
│ // 如果调用方需要处理异常，不要在这里处理                   │
│ public CompletableFuture<Device> getDeviceAsync(String id) {│
│     return CompletableFuture.supplyAsync(() -> {             │
│         return deviceRepository.findById(id);                │
│     });  // 不加 exceptionally，让调用方处理                │
│ }                                                            │
│                                                              │
│ // 调用方                                                    │
│ getDeviceAsync(id)                                           │
│     .exceptionally(ex -> { ... })  // 调用方处理            │
│     .join();                                                 │
└─────────────────────────────────────────────────────────────┘

4. 组合多个异步操作的异常处理
┌─────────────────────────────────────────────────────────────┐
│ CompletableFuture.allOf(future1, future2, future3)          │
│     .exceptionally(ex -> {                                   │
│         // 任何一个失败都会触发这里                         │
│         logger.error("批量操作失败", ex);                   │
│         return null;                                         │
│     });                                                      │
│                                                              │
│ // 注意：单个 Future 的异常需要单独处理                     │
│ future1.exceptionally(ex -> fallback1);                     │
│ future2.exceptionally(ex -> fallback2);                     │
│ future3.exceptionally(ex -> fallback3);                     │
└─────────────────────────────────────────────────────────────┘
```

**项目中的全局异常处理**：

```java
// GlobalExceptionHandler.java - 处理同步异常
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        logger.error("全局异常", e);
        return ResponseEntity.status(500)
                .body(new ErrorResponse("INTERNAL_ERROR", e.getMessage()));
    }
}

// 异步任务的异常需要通过 exceptionally/whenComplete 处理
// 或者在 CompletableFuture 中主动抛出，让调用方处理
```

---

## 附录：项目文件索引

| 文件                                                         | 主要 JUC 组件                                                | 核心用途                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------- |
| [DynamicThreadPoolConfig.java](backend/src/main/java/com/dormpower/config/DynamicThreadPoolConfig.java) | `Executors.newThreadPerTaskExecutor`, `ThreadPoolExecutor`, `AtomicLong/Integer` | 虚拟线程执行器、平台线程池配置、统计计数 |
| [AsyncConfig.java](backend/src/main/java/com/dormpower/config/AsyncConfig.java) | `ThreadPoolTaskExecutor`                                     | Spring 异步任务执行器                    |
| [WebSocketManager.java](backend/src/main/java/com/dormpower/websocket/WebSocketManager.java) | `ConcurrentHashMap`, `CopyOnWriteArraySet`, `ReentrantLock`  | WebSocket 会话管理、设备订阅             |
| [MqttSimulatorService.java](backend/src/main/java/com/dormpower/service/MqttSimulatorService.java) | `ConcurrentHashMap`, `CopyOnWriteArrayList`, `AtomicInteger/Long`, `volatile` | MQTT 模拟器任务管理、统计计数、状态控制  |
| [SimpleCacheService.java](backend/src/main/java/com/dormpower/service/SimpleCacheService.java) | `ConcurrentHashMap`, `ScheduledThreadPoolExecutor`           | 内存缓存、定时清理                       |
| [TelemetryService.java](backend/src/main/java/com/dormpower/service/TelemetryService.java) | `CompletableFuture`, `Executor`                              | 遥测数据异步保存、WebSocket 通知         |
| [DeviceAggregateService.java](backend/src/main/java/com/dormpower/service/DeviceAggregateService.java) | `CompletableFuture.allOf`, `orTimeout`                       | 多数据源并行查询、聚合结果               |
| [MqttService.java](backend/src/main/java/com/dormpower/service/MqttService.java) | `CompletableFuture`, `ConcurrentHashMap`, `orTimeout`        | MQTT 异步通信、命令发送与 ACK 等待       |
| [AiReportService.java](backend/src/main/java/com/dormpower/service/AiReportService.java) | `CompletableFuture`, `thenComposeAsync`, `orTimeout`         | AI 报告异步生成、多设备并行查询          |
| [ThreadPoolMonitorService.java](backend/src/main/java/com/dormpower/service/ThreadPoolMonitorService.java) | `ThreadPoolExecutor`, `ThreadMXBean`                         | 线程池监控、健康检查、动态调整           |
| [ThreadPoolAutoTuner.java](backend/src/main/java/com/dormpower/scheduler/ThreadPoolAutoTuner.java) | `@Scheduled`, `ThreadPoolExecutor`                           | 线程池自动调优                           |
| [CompletableFutureUtils.java](backend/src/main/java/com/dormpower/util/CompletableFutureUtils.java) | `CompletableFuture`, `orTimeout`, `delayedExecutor`          | 异步操作工具类（超时、重试、并行）       |