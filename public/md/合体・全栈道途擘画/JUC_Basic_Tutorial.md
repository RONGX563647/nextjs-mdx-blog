# JUC (Java Util Concurrent) 实战指南

## 目录
1. [JUC 简介与价值](#1-juc-简介与价值)
2. [线程基础与对比](#2-线程基础与对比)
3. [线程池深度解析](#3-线程池深度解析)
4. [并发集合对比与选择](#4-并发集合对比与选择)
5. [原子类实战应用](#5-原子类实战应用)
6. [锁机制对比与优化](#6-锁机制对比与优化)
7. [并发工具类使用指南](#7-并发工具类使用指南)
8. [常见并发问题与解决方案](#8-常见并发问题与解决方案)
9. [性能优化实战技巧](#9-性能优化实战技巧)
10. [高级并发模式与案例](#10-高级并发模式与案例)
11. [JVM 并发原理与调优](#11-jvm-并发原理与调优)
12. [最佳实践与实战案例](#12-最佳实践与实战案例)

---

## 1. JUC 简介与价值

### 1.1 什么是 JUC？

JUC (Java Util Concurrent) 是 Java 并发工具包，位于 `java.util.concurrent` 包下，提供了丰富的并发编程工具。它是在 Java 5 中引入的，旨在简化并发编程，提高代码质量和性能。

**JUC 的核心价值**：
- **简化并发编程**：提供高级并发工具，避免手动管理线程
- **提高性能**：充分利用多核CPU资源，实现高效的并发处理
- **保证线程安全**：内置线程安全机制，避免常见的并发问题
- **提供丰富的并发工具**：包括线程池、并发集合、原子类、锁机制等

**JUC 的设计理念**：
- **无锁优先**：优先使用无锁数据结构和算法
- **细粒度锁**：减少锁的粒度，提高并发性能
- **异步编程**：支持异步编程模型，提高系统响应速度
- **可组合性**：提供可组合的并发工具，便于构建复杂系统

### 1.2 为什么选择 JUC？

**传统并发编程的痛点**：
- 手动同步代码复杂且容易出错
- 线程管理困难，容易导致资源泄露
- 并发集合性能低下，无法充分利用多核CPU
- 缺乏高级并发工具，如倒计时器、信号量等
- 异步编程复杂，难以处理回调嵌套
- 性能调优困难，需要深入理解底层原理

**JUC 的价值**：
- **性能提升**：充分利用多核CPU资源，实现高效的并发处理
  - CAS 操作比 synchronized 快 5-10 倍
  - ConcurrentHashMap 比 Hashtable 快 10-100 倍
  - LongAdder 比 AtomicInteger 快 2-5 倍（高并发场景）
- **开发效率**：提供高级并发工具，简化并发编程复杂度
  - 线程池自动管理线程生命周期
  - 并发集合自动处理线程安全
  - CompletableFuture 支持链式异步操作
- **代码质量**：规范并发编程模式，减少错误和bug
  - 内置线程安全机制
  - 统一的异常处理模型
  - 清晰的 API 设计
- **线程安全**：内置线程安全机制，避免常见的并发问题
  - 内存可见性保证
  - 原子性保证
  - 有序性保证
- **可维护性**：提供统一的并发编程模型，便于代码维护
  - 清晰的命名规范
  - 一致的使用方式
  - 丰富的文档和示例

### 1.3 JUC 与传统线程 API 对比

| 特性 | 传统线程 API | JUC | **优势对比** |
|-----|------------|-----|------------|
| 线程管理 | Thread + Runnable | ExecutorService | JUC 提供线程池管理，避免线程创建销毁开销，性能提升 10-50 倍 |
| 线程安全集合 | Vector, Hashtable | ConcurrentHashMap, CopyOnWriteArrayList | JUC 集合性能更高，支持高并发读写，性能提升 10-100 倍 |
| 原子操作 | synchronized | AtomicInteger, AtomicLong | JUC 原子类使用 CAS 操作，性能更好，无锁竞争 |
| 锁机制 | synchronized | ReentrantLock, ReadWriteLock | JUC 锁提供更灵活的锁定机制和更高性能，支持可中断、可超时 |
| 并发工具 | 无 | CountDownLatch, CyclicBarrier, Semaphore | JUC 提供丰富的并发协调工具，简化多线程协调 |
| 异步编程 | 无 | CompletableFuture | JUC 支持链式异步操作，避免回调地狱，提高代码可读性 |
| 定时任务 | Timer | ScheduledExecutorService | JUC 定时任务更可靠，支持线程池，性能更好 |
| 线程池管理 | 无 | ThreadPoolExecutor | JUC 提供完整的线程池管理功能，支持监控和调优 |

**实际开发中的选择**：
- **简单同步**：synchronized 足够，JVM 会自动优化
- **高并发场景**：优先使用 JUC 的并发集合和原子类
- **复杂同步**：使用 ReentrantLock，支持更灵活的锁定策略
- **异步任务**：使用 CompletableFuture，支持链式操作和组合
- **线程管理**：使用线程池，避免频繁创建销毁线程

**性能对比数据**（基于实际测试）：
- **单线程操作**：synchronized 与 ReentrantLock 性能相近
- **低并发（< 10 线程）**：synchronized 性能略优（JVM 优化）
- **中并发（10-100 线程）**：ReentrantLock 性能优 20-30%
- **高并发（> 100 线程）**：ReentrantLock 性能优 50-100%
- **读多写少场景**：ReadWriteLock 性能优 5-10 倍
- **计数器场景**：LongAdder 性能优 2-5 倍

### 1.4 JUC 核心组件架构

```
java.util.concurrent
├── atomic             // 原子操作类（CAS实现）
├── locks              // 锁机制（可重入锁、读写锁等）
├── concurrent         // 并发集合（线程安全集合）
├── executor           // 线程池（任务调度）
├── future             // 异步任务（CompletableFuture）
├── Semaphore          // 信号量（并发控制）
├── CountDownLatch     // 倒计时门闩（多线程协调）
├── CyclicBarrier      // 循环屏障（多线程同步）
├── Exchanger          // 线程交换器（数据交换）
├── Phaser             // 阶段同步器（动态同步）
└── TimeUnit           // 时间单位（时间转换）
```

### 1.5 JUC 适用场景

**场景选择决策树**：

```
开始
├─ 需要管理线程？
│  ├─ 是 → 使用线程池（ExecutorService）
│  │  ├─ 任务类型？
│  │  │  ├─ CPU密集型 → 固定大小线程池（核心线程数 = CPU核心数 + 1）
│  │  │  ├─ IO密集型 → 可缓存线程池（核心线程数 = CPU核心数 × 2）
│  │  │  ├─ 定时任务 → ScheduledThreadPoolExecutor
│  │  │  └─ 分治任务 → ForkJoinPool
│  │  └─ 队列选择？
│  │     ├─ 需要控制内存 → 有界队列（ArrayBlockingQueue）
│  │     ├─ 任务处理稳定 → 无界队列（LinkedBlockingQueue）
│  │     └─ 任务需立即处理 → 同步队列（SynchronousQueue）
│  └─ 否 → 继续判断
├─ 需要线程安全的集合？
│  ├─ 是 → 选择并发集合
│  │  ├─ Map类型？
│  │  │  └─ ConcurrentHashMap（高并发读写）
│  │  ├─ List类型？
│  │  │  ├─ 读多写少 → CopyOnWriteArrayList
│  │  │  └─ 读写均衡 → Collections.synchronizedList
│  │  └─ Queue类型？
│  │     ├─ 需要阻塞 → BlockingQueue
│  │     ├─ 需要优先级 → PriorityBlockingQueue
│  │     └─ 需要延迟 → DelayQueue
│  └─ 否 → 继续判断
├─ 需要原子操作？
│  ├─ 是 → 选择原子类
│  │  ├─ 基本类型 → AtomicInteger, AtomicLong
│  │  ├─ 引用类型 → AtomicReference
│  │  ├─ 高并发计数 → LongAdder
│  │  └─ 解决ABA问题 → AtomicStampedReference
│  └─ 否 → 继续判断
├─ 需要同步控制？
│  ├─ 是 → 选择锁机制
│  │  ├─ 简单同步 → synchronized
│  │  ├─ 复杂同步 → ReentrantLock
│  │  ├─ 读多写少 → ReadWriteLock
│  │  └─ 读极多写极少 → StampedLock
│  └─ 否 → 继续判断
└─ 需要多线程协调？
   └─ 是 → 选择并发工具
      ├─ 等待多个任务完成 → CountDownLatch
      ├─ 循环同步 → CyclicBarrier
      ├─ 控制并发数 → Semaphore
      ├─ 数据交换 → Exchanger
      └─ 动态同步 → Phaser
```

**常见业务场景与推荐方案**：

| 业务场景 | 推荐方案 | **理由** | **注意事项** |
|---------|---------|---------|------------|
| 高并发API服务 | ThreadPoolExecutor + ConcurrentHashMap | 线程池管理请求，并发集合处理数据 | 合理设置线程池参数，监控队列大小 |
| 实时数据统计 | LongAdder + ConcurrentHashMap | 高性能原子操作，适合计数器 | 注意内存可见性，及时清理数据 |
| 缓存系统 | ConcurrentHashMap + ReadWriteLock | 高并发读写，读操作无锁 | 考虑缓存过期策略和内存管理 |
| 消息队列 | BlockingQueue + 线程池 | 阻塞队列天然支持生产者-消费者 | 合理设置队列大小，避免OOM |
| 定时任务调度 | ScheduledThreadPoolExecutor | 支持延迟和周期性任务 | 注意任务执行时间，避免任务积压 |
| 批量数据处理 | ForkJoinPool | 工作窃取算法，适合分治任务 | 任务粒度要适中，避免过度分解 |
| 限流保护 | Semaphore | 控制并发访问数量 | 合理设置许可数，避免资源浪费 |
| 分布式锁协调 | CountDownLatch + CyclicBarrier | 多线程协调和同步 | 注意超时设置，避免永久阻塞 |
| 异步任务处理 | CompletableFuture | 链式异步操作，提高响应速度 | 正确处理异常，避免回调地狱 |
| 配置管理 | CopyOnWriteArrayList | 读操作无锁，适合读多写少 | 注意内存开销，避免频繁更新 |

**实际开发经验分享**：

1. **不要过度使用并发工具**：
   - 简单场景使用 synchronized 足够
   - 避免为了使用而使用
   - 根据实际需求选择合适的工具

2. **性能测试很重要**：
   - 不同场景下性能差异很大
   - 使用 JMH 进行微基准测试
   - 在真实环境中验证性能

3. **监控和调优**：
   - 监控线程池状态
   - 监控锁竞争情况
   - 及时发现和解决问题

4. **代码可读性**：
   - 优先选择简单的方案
   - 添加必要的注释
   - 编写清晰的文档

### 1.6 学习路径建议

1. **基础阶段**：线程基础 → 线程池 → 并发集合
2. **进阶阶段**：原子类 → 锁机制 → 并发工具类
3. **高级阶段**：CompletableFuture → ForkJoinPool → 性能优化
4. **实战阶段**：实际项目应用 → 性能调优 → 并发问题排查

---

## 2. 线程基础与对比

### 2.1 线程创建方式对比

| 创建方式 | 实现方式 | **优势** | **劣势** | **适用场景** |
|---------|---------|---------|---------|------------|
| Thread 类 | 继承 Thread | 简单直接 | 单继承限制 | 简单任务 |
| Runnable 接口 | 实现 Runnable | 无单继承限制 | 无返回值 | 基本任务 |
| Callable 接口 | 实现 Callable | 有返回值 | 复杂 | 需要返回结果的任务 |
| Lambda 表达式 | Runnable 匿名实现 | 简洁 | 复杂逻辑可读性差 | 简单任务 |
| CompletableFuture | 异步任务 | 链式操作 | 复杂 | 异步处理 |

### 2.2 线程状态详解

```java
// 线程状态枚举
public enum State {
    NEW,         // 新建：线程已创建但未启动
    RUNNABLE,    // 可运行：线程正在运行或等待CPU时间片
    BLOCKED,     // 阻塞：线程等待获取锁
    WAITING,     // 等待：线程等待其他线程的特定操作
    TIMED_WAITING, // 限时等待：线程等待特定时间
    TERMINATED   // 终止：线程执行完成
}
```

**状态转换图：**
```
NEW → RUNNABLE → BLOCKED → WAITING → TIMED_WAITING → TERMINATED
```

### 2.3 线程优先级与调度

| 优先级 | 值 | **说明** |
|-------|-----|---------|
| MIN_PRIORITY | 1 | 最低优先级 |
| NORM_PRIORITY | 5 | 默认优先级 |
| MAX_PRIORITY | 10 | 最高优先级 |

**注意**：线程优先级只是给操作系统的一个提示，不保证线程执行顺序。不同操作系统对优先级的支持程度不同，在某些系统上可能完全被忽略。

### 2.4 线程中断的正确处理

```java
class InterruptibleTask implements Runnable {
    @Override
    public void run() {
        try {
            while (!Thread.currentThread().isInterrupted()) {
                // 执行任务
                System.out.println("Working...");
                // 模拟长时间操作
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            // 捕获中断异常
            Thread.currentThread().interrupt(); // 重新设置中断状态
            System.out.println("Task interrupted");
        } finally {
            // 清理资源
            System.out.println("Cleaning up resources");
        }
    }
}
```

### 2.5 ThreadLocal 最佳实践

**ThreadLocal 的使用场景：**
- 线程上下文传递
- 数据库连接管理
- 事务管理
- 会话管理

**ThreadLocal 的内存泄漏问题：**
```java
// 正确使用 ThreadLocal
class SafeThreadLocalUsage {
    private static final ThreadLocal<Resource> threadLocal = ThreadLocal.withInitial(() -> new Resource());
    
    public void useResource() {
        Resource resource = threadLocal.get();
        try {
            // 使用资源
        } finally {
            // 必须清理，防止内存泄漏
            threadLocal.remove();
        }
    }
    
    static class Resource implements AutoCloseable {
        @Override
        public void close() {
            // 清理资源
        }
    }
}
```

### 2.6 线程安全的单例模式对比

| 实现方式 | **优点** | **缺点** | **推荐度** |
|---------|---------|---------|----------|
| 饿汉式 | 简单，线程安全 | 提前初始化，浪费资源 | ⭐⭐⭐ |
| 懒汉式（同步） | 延迟初始化 | 性能差 | ⭐ |
| 双重检查锁定 | 延迟初始化，性能好 | 实现复杂 | ⭐⭐⭐⭐ |
| 静态内部类 | 延迟初始化，线程安全 | 无明显缺点 | ⭐⭐⭐⭐⭐ |
| 枚举单例 | 线程安全，防反射 | 无法延迟初始化 | ⭐⭐⭐⭐ |

**静态内部类实现（推荐）：**
```java
class Singleton {
    private Singleton() {}
    
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

### 2.7 守护线程 vs 用户线程

| 特性 | 守护线程 | 用户线程 |
|-----|---------|---------|
| 生命周期 | 跟随主线程 | 独立运行 |
| 用途 | 后台服务 | 核心业务 |
| 资源管理 | 不能持有需要关闭的资源 | 可以持有资源 |
| 示例 | 垃圾回收、监控 | 业务处理 |

**守护线程使用场景：**
- 后台监控
- 垃圾回收
- 日志记录
- 内存管理

---

## 3. 线程池深度解析

### 3.1 线程池的核心价值

**线程池的优势：**
- **线程复用**：减少线程创建销毁的开销
- **控制并发数**：避免线程过多导致的资源耗尽
- **任务队列**：有序处理任务，避免任务丢失
- **统一管理**：方便监控和管理线程状态
- **异常处理**：提供统一的异常处理机制
- **提高响应**：线程池中的线程可以立即执行任务
- **任务调度**：支持优先级、延迟和周期性任务

### 3.2 线程池类型对比

| 线程池类型 | **特点** | **适用场景** | **核心线程数** | **队列** |
|----------|---------|------------|-------------|--------|
| newSingleThreadExecutor | 单线程 | 顺序执行任务 | 1 | 无界队列 |
| newFixedThreadPool | 固定大小 | 稳定负载 | 固定 | 无界队列 |
| newCachedThreadPool | 可缓存 | 短期任务 | 0 | 同步队列 |
| newScheduledThreadPool | 定时任务 | 定时/周期性任务 | 固定 | 延迟队列 |
| newWorkStealingPool | 工作窃取 | 分治任务 | CPU核心数 | 无界队列 |

### 3.3 ThreadPoolExecutor 深度解析

**核心参数：**
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,              // 核心线程数
    10,             // 最大线程数
    60L,            // 非核心线程存活时间
    TimeUnit.SECONDS, // 时间单位
    new ArrayBlockingQueue<>(100), // 工作队列
    Executors.defaultThreadFactory(), // 线程工厂
    new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
);
```

**参数详解：**
1. **corePoolSize**：核心线程数，线程池保持的最小线程数
2. **maximumPoolSize**：最大线程数，线程池允许的最大线程数
3. **keepAliveTime**：非核心线程的存活时间
4. **unit**：keepAliveTime 的时间单位
5. **workQueue**：工作队列，用于存储等待执行的任务
6. **threadFactory**：线程工厂，用于创建线程
7. **handler**：拒绝策略，当任务无法处理时的处理方式

### 3.4 工作队列类型对比

| 队列类型 | **特点** | **适用场景** | **风险** |
|---------|---------|------------|--------|
| LinkedBlockingQueue | 无界队列 | 任务处理稳定 | 可能OOM |
| ArrayBlockingQueue | 有界队列 | 控制队列大小 | 任务可能被拒绝 |
| SynchronousQueue | 无缓冲队列 | 任务需要立即处理 | 线程数可能激增 |
| PriorityBlockingQueue | 优先队列 | 任务有优先级 | 复杂度高 |
| DelayQueue | 延迟队列 | 任务需要延迟执行 | 实现复杂 |

### 3.5 拒绝策略对比

| 策略 | **行为** | **适用场景** |
|-----|---------|------------|
| AbortPolicy | 抛出异常 | 关键任务 |
| CallerRunsPolicy | 调用者执行 | 任务不紧急 |
| DiscardPolicy | 静默丢弃 | 非关键任务 |
| DiscardOldestPolicy | 丢弃最老任务 | 任务有时间性 |
| 自定义策略 | 自定义处理 | 特殊需求 |

### 3.6 线程池调优指南

**核心线程数计算公式**：

**1. CPU 密集型任务**：
```
核心线程数 = CPU核心数 + 1
```
- **特点**：主要消耗 CPU 资源，IO 操作较少
- **示例**：计算、加密、图像处理
- **原因**：+1 是为了当一个线程因为页错误或其他原因暂停时，CPU 不会空闲

**2. IO 密集型任务**：
```
核心线程数 = CPU核心数 × 2
```
- **特点**：主要消耗 IO 资源，CPU 操作较少
- **示例**：数据库查询、网络请求、文件读写
- **原因**：线程在等待 IO 时可以释放 CPU，让其他线程运行

**3. 混合型任务**：
```
核心线程数 = CPU核心数 × (1 + IO等待时间 / CPU处理时间)
```
- **特点**：既有 CPU 密集型操作，又有 IO 密集型操作
- **示例**：Web 服务、API 调用
- **原因**：根据 IO 等待时间和 CPU 处理时间的比例动态调整

**实际开发中的调优经验**：

**1. 获取 CPU 核心数**：
```java
int cpuCores = Runtime.getRuntime().availableProcessors();
System.out.println("CPU核心数: " + cpuCores);
```

**2. 根据任务类型选择线程池**：

| 任务类型 | 推荐线程池 | **核心线程数** | **最大线程数** | **队列** | **适用场景** |
|---------|-----------|-------------|-------------|---------|------------|
| CPU 密集型 | FixedThreadPool | CPU核心数 + 1 | CPU核心数 + 1 | LinkedBlockingQueue | 计算、加密 |
| IO 密集型 | CachedThreadPool | 0 | Integer.MAX_VALUE | SynchronousQueue | 数据库查询、网络请求 |
| 混合型 | CustomThreadPool | CPU核心数 × 2 | CPU核心数 × 4 | ArrayBlockingQueue | Web 服务 |
| 定时任务 | ScheduledThreadPool | CPU核心数 | CPU核心数 | DelayQueue | 定时任务 |
| 分治任务 | ForkJoinPool | CPU核心数 | CPU核心数 | 无界队列 | 递归计算 |

**3. 队列大小设置**：

| 队列类型 | **大小设置** | **风险** | **适用场景** |
|---------|------------|---------|------------|
| ArrayBlockingQueue | 核心线程数 × 2-4 | 任务可能被拒绝 | 内存敏感场景 |
| LinkedBlockingQueue | Integer.MAX_VALUE | 可能 OOM | 任务处理稳定 |
| SynchronousQueue | 0 | 线程数可能激增 | 任务需立即处理 |
| PriorityBlockingQueue | 无界 | 可能 OOM | 任务有优先级 |

**4. 拒绝策略选择**：

| 策略 | **行为** | **适用场景** | **风险** |
|-----|---------|------------|---------|
| AbortPolicy | 抛出 RejectedExecutionException | 关键任务 | 任务丢失 |
| CallerRunsPolicy | 调用者线程执行任务 | 任务不紧急 | 影响调用线程 |
| DiscardPolicy | 静默丢弃任务 | 非关键任务 | 任务丢失 |
| DiscardOldestPolicy | 丢弃队列最老任务 | 任务有时间性 | 旧任务丢失 |
| 自定义策略 | 自定义处理 | 特殊需求 | 需要自己实现 |

**5. 线程池监控指标**：

```java
public class ThreadPoolMonitor {
    private final ThreadPoolExecutor executor;
    
    public ThreadPoolMonitor(ThreadPoolExecutor executor) {
        this.executor = executor;
    }
    
    public void printMetrics() {
        System.out.println("=== 线程池监控指标 ===");
        System.out.println("核心线程数: " + executor.getCorePoolSize());
        System.out.println("最大线程数: " + executor.getMaximumPoolSize());
        System.out.println("当前线程数: " + executor.getPoolSize());
        System.out.println("活跃线程数: " + executor.getActiveCount());
        System.out.println("队列大小: " + executor.getQueue().size());
        System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
        System.out.println("总任务数: " + executor.getTaskCount());
        System.out.println("线程池饱和度: " + getSaturation() + "%");
    }
    
    public double getSaturation() {
        int activeCount = executor.getActiveCount();
        int maxPoolSize = executor.getMaximumPoolSize();
        return (double) activeCount / maxPoolSize * 100;
    }
    
    public boolean isHealthy() {
        return getSaturation() < 80 && 
               executor.getQueue().size() < executor.getQueue().remainingCapacity() * 0.8;
    }
}
```

**6. 线程池调优实战案例**：

**案例1：高并发 API 服务**
```java
// 初始配置
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,             // 核心线程数
    20,             // 最大线程数
    60L,            // 非核心线程存活时间
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100), // 队列大小
    new NamedThreadFactory("api-"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 问题：队列经常满，任务被拒绝
// 优化方案1：增加队列大小
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10, 20, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(500), // 增加队列大小
    new NamedThreadFactory("api-"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 优化方案2：增加最大线程数
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10, 50, 60L, TimeUnit.SECONDS, // 增加最大线程数
    new LinkedBlockingQueue<>(100),
    new NamedThreadFactory("api-"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 优化方案3：使用动态线程池（根据负载调整）
DynamicThreadPoolExecutor executor = new DynamicThreadPoolExecutor(
    10, 100, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    new NamedThreadFactory("api-"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

**案例2：数据库查询服务**
```java
// 初始配置
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,              // 核心线程数
    10,             // 最大线程数
    60L,            // 非核心线程存活时间
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    new NamedThreadFactory("db-"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 问题：响应时间长，吞吐量低
// 优化方案：使用 IO 密集型配置
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    cpuCores * 2,   // 核心线程数 = CPU核心数 × 2
    cpuCores * 4,   // 最大线程数 = CPU核心数 × 4
    60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(200),
    new NamedThreadFactory("db-"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

**7. 线程池调优最佳实践**：

1. **从保守配置开始**：
   - 核心线程数：CPU核心数
   - 最大线程数：CPU核心数 × 2
   - 队列大小：100
   - 拒绝策略：CallerRunsPolicy

2. **根据监控数据调整**：
   - 监控线程池饱和度
   - 监控队列大小
   - 监控任务执行时间
   - 监控任务拒绝率

3. **逐步调整**：
   - 每次只调整一个参数
   - 观察调整后的效果
   - 记录调整历史

4. **使用动态线程池**：
   - 根据负载动态调整线程数
   - 避免资源浪费
   - 提高系统响应速度

5. **设置合理的超时**：
   - 任务执行超时
   - 线程池关闭超时
   - 避免任务永久阻塞

### 3.7 线程池监控与告警

**关键监控指标：**
- 活跃线程数
- 队列大小
- 完成任务数
- 拒绝任务数
- 线程池饱和度

**监控实现：**
```java
public class ThreadPoolMonitor {
    private final ThreadPoolExecutor executor;
    private final ScheduledExecutorService monitorExecutor;
    
    public ThreadPoolMonitor(ThreadPoolExecutor executor) {
        this.executor = executor;
        this.monitorExecutor = Executors.newSingleThreadScheduledExecutor();
    }
    
    public void startMonitoring(long interval, TimeUnit unit) {
        monitorExecutor.scheduleAtFixedRate(() -> {
            int activeThreads = executor.getActiveCount();
            int poolSize = executor.getPoolSize();
            int queueSize = executor.getQueue().size();
            long completedTasks = executor.getCompletedTaskCount();
            
            System.out.printf("ThreadPool Monitor - Active: %d, Pool: %d, Queue: %d, Completed: %d%n",
                activeThreads, poolSize, queueSize, completedTasks);
            
            // 告警逻辑
            if (queueSize > 100) {
                System.err.println("WARNING: Queue size exceeds threshold!");
            }
            
            if (activeThreads == poolSize && queueSize > 0) {
                System.err.println("WARNING: Thread pool is at capacity!");
            }
        }, 0, interval, unit);
    }
    
    public void stopMonitoring() {
        monitorExecutor.shutdown();
    }
}
```

### 3.8 线程池最佳实践

1. **避免使用 Executors 工厂方法**：可能导致资源耗尽
2. **使用有界队列**：防止任务积压导致OOM
3. **设置合理的核心线程数**：根据任务类型和系统资源
4. **实现拒绝策略**：处理任务拒绝的情况
5. **监控线程池状态**：及时发现问题
6. **正确关闭线程池**：避免资源泄漏
7. **使用线程池命名**：便于调试和监控
8. **考虑任务优先级**：使用 PriorityBlockingQueue
9. **避免长时间运行的任务**：可能阻塞线程池
10. **使用 CompletableFuture**：实现更灵活的任务处理

### 3.9 线程池常见问题与解决方案

| 问题 | **症状** | **原因** | **解决方案** |
|-----|---------|---------|------------|
| 线程池饱和 | 任务提交缓慢 | 任务处理速度跟不上提交速度 | 增加线程数，优化任务处理 |
| 线程池OOM | OutOfMemoryError | 使用无界队列，任务积压 | 使用有界队列，设置合理大小 |
| 线程池死锁 | 线程相互等待 | 任务间存在循环依赖 | 避免循环依赖，使用超时机制 |
| 性能下降 | 吞吐量下降 | 线程竞争激烈 | 调整线程池大小，减少锁竞争 |

### 3.10 ForkJoinPool 详解

**特点：**
- **工作窃取算法**：空闲线程主动窃取其他线程的任务
- **分治任务**：适合递归分解的任务
- **并行性能**：充分利用多核CPU
- **轻量级线程**：使用ForkJoinTask，比普通线程更轻量

**使用示例：**
```java
// 创建 ForkJoinPool
ForkJoinPool forkJoinPool = new ForkJoinPool(
    Runtime.getRuntime().availableProcessors(),
    ForkJoinPool.defaultForkJoinWorkerThreadFactory,
    null,
    true // 异步模式
);

// 提交任务
long result = forkJoinPool.invoke(new FibonacciTask(40));
System.out.println("Fibonacci result: " + result);

// 关闭
forkJoinPool.shutdown();

// 斐波那契任务
class FibonacciTask extends RecursiveTask<Long> {
    private final int n;
    
    public FibonacciTask(int n) {
        this.n = n;
    }
    
    @Override
    protected Long compute() {
        if (n <= 1) {
            return (long) n;
        }
        
        FibonacciTask f1 = new FibonacciTask(n - 1);
        f1.fork();
        
        FibonacciTask f2 = new FibonacciTask(n - 2);
        return f2.compute() + f1.join();
    }
}
```

**适用场景：**
- 大型数据集处理
- 递归算法
- 分治任务
- 并行计算

---

## 4. 并发集合对比与选择

### 4.1 并发集合选择指南

**选择并发集合的核心原则：**
- **读写比例**：读多写少 vs 读写均衡
- **并发程度**：高并发 vs 低并发
- **内存开销**：内存敏感 vs 性能优先
- **操作类型**：随机访问 vs 顺序访问

### 4.2 并发集合对比

| 集合类型 | **特点** | **适用场景** | **读写性能** | **内存开销** | **线程安全** |
|---------|---------|------------|------------|------------|------------|
| ConcurrentHashMap | 高并发读写 | 高并发缓存 | 读写都快 | 中等 | 线程安全 |
| CopyOnWriteArrayList | 读多写少 | 读频繁场景 | 读快写慢 | 高 | 线程安全 |
| CopyOnWriteArraySet | 读多写少 | 读频繁集合 | 读快写慢 | 高 | 线程安全 |
| ConcurrentLinkedQueue | 无界队列 | 高并发队列 | 读写快 | 低 | 线程安全 |
| LinkedBlockingQueue | 可选择有界 | 阻塞队列 | 读写平衡 | 低 | 线程安全 |
| ArrayBlockingQueue | 有界队列 | 控制队列大小 | 读写平衡 | 低 | 线程安全 |
| PriorityBlockingQueue | 优先队列 | 任务优先级 | 读写较慢 | 低 | 线程安全 |
| SynchronousQueue | 无缓冲 | 直接传递 | 写快读快 | 极低 | 线程安全 |

### 4.3 ConcurrentHashMap 深度解析

**核心特点：**
- **线程安全**：支持高并发读写
- **无锁读取**：读操作不需要加锁
- **细粒度锁**：JDK 1.8+ 使用 CAS + synchronized
- **高性能**：支持高并发操作
- **弱一致性**：迭代器是弱一致性的

**实现原理：**
- **JDK 1.7**：分段锁（Segment）
- **JDK 1.8+**：CAS + synchronized + 红黑树

**使用示例：**
```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// 基本操作
map.put("key1", 1);
map.put("key2", 2);
Integer value = map.get("key1");

// 原子操作
map.putIfAbsent("key3", 3); // 不存在才放入
map.computeIfAbsent("key4", k -> 4); // 不存在则计算
map.computeIfPresent("key1", (k, v) -> v + 1); // 存在则计算
map.merge("key5", 10, (oldValue, newValue) -> oldValue + newValue); // 合并操作

// 批量操作
Map<String, Integer> newEntries = new HashMap<>();
newEntries.put("key6", 6);
newEntries.put("key7", 7);
map.putAll(newEntries);

// 遍历（弱一致性）
map.forEach((k, v) -> System.out.println(k + ": " + v));
```

**ConcurrentHashMap vs Hashtable 对比：**

| 特性 | ConcurrentHashMap | Hashtable |
|-----|-----------------|-----------|
| 锁粒度 | 细粒度（CAS + synchronized） | 粗粒度（整个表） |
| 并发性能 | 高 | 低 |
| 迭代器 | 弱一致性 | 快速失败 |
| null 值 | 不允许 | 不允许 |
| 复杂度 | 高 | 低 |
| 扩展性 | 好 | 差 |

### 4.4 CopyOnWriteArrayList 深度解析

**核心特点：**
- **写时复制**：写操作时创建新数组
- **读无锁**：读操作不需要加锁
- **读性能高**：适合读多写少场景
- **写性能低**：每次写操作都需要复制数组
- **弱一致性**：迭代器是快照，不反映后续修改

**适用场景：**
- 读操作远多于写操作
- 数据量不大
- 对实时性要求不高

**使用示例：**
```java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// 写操作（有锁）
list.add("item1");
list.add("item2");
list.add("item3");
list.remove("item2");
list.set(0, "updated item1");

// 读操作（无锁）
for (String item : list) {
    System.out.println(item);
}

// 批量操作
List<String> newItems = Arrays.asList("item4", "item5");
list.addAll(newItems);
```

**CopyOnWriteArrayList vs Vector 对比：**

| 特性 | CopyOnWriteArrayList | Vector |
|-----|---------------------|--------|
| 锁机制 | 写时复制 | synchronized |
| 读性能 | 高（无锁） | 低（有锁） |
| 写性能 | 低（复制数组） | 低（同步） |
| 内存开销 | 高 | 低 |
| 适用场景 | 读多写少 | 读写均衡 |

### 4.5 阻塞队列深度解析

**阻塞队列的核心方法：**
- **put()**：阻塞直到空间可用
- **take()**：阻塞直到元素可用
- **offer()**：非阻塞，返回是否成功
- **poll()**：非阻塞，返回元素或null

**常见阻塞队列对比：**

| 队列类型 | **特点** | **适用场景** | **容量** | **实现** |
|---------|---------|------------|---------|---------|
| ArrayBlockingQueue | FIFO, 有界 | 控制队列大小 | 固定 | 数组 |
| LinkedBlockingQueue | FIFO, 可选有界 | 通用队列 | 可选 | 链表 |
| PriorityBlockingQueue | 优先级 | 任务调度 | 无界 | 堆 |
| SynchronousQueue | 无缓冲 | 直接传递 | 0 | 无 |
| DelayQueue | 延迟执行 | 定时任务 | 无界 | 堆 |
| LinkedTransferQueue | 无界 | 高吞吐量 | 无界 | 链表 |
| LinkedBlockingDeque | 双端 | 双向操作 | 可选 | 链表 |

**生产者-消费者模式示例：**
```java
// 创建有界阻塞队列
ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(10);

// 生产者线程
Thread producer = new Thread(() -> {
    for (int i = 0; i < 20; i++) {
        try {
            String task = "Task " + i;
            boolean added = queue.offer(task, 1, TimeUnit.SECONDS);
            if (added) {
                System.out.println("Produced: " + task);
            } else {
                System.out.println("Failed to add: " + task);
            }
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
});

// 消费者线程
Thread consumer = new Thread(() -> {
    for (int i = 0; i < 20; i++) {
        try {
            String task = queue.poll(2, TimeUnit.SECONDS);
            if (task != null) {
                System.out.println("Consumed: " + task);
            } else {
                System.out.println("No task available");
            }
            Thread.sleep(200);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
});

producer.start();
consumer.start();
```

### 4.6 并发集合最佳实践

1. **根据读写比例选择**：
   - 读多写少：CopyOnWriteArrayList
   - 读写均衡：ConcurrentHashMap
   - 队列操作：BlockingQueue

2. **注意内存开销**：
   - CopyOnWrite集合内存开销大
   - 大对象场景谨慎使用

3. **选择合适的阻塞队列**：
   - 有界队列：控制内存使用
   - 无界队列：需要监控任务积压

4. **避免使用过时的线程安全集合**：
   - 优先使用JUC集合而非Vector、Hashtable

5. **合理使用原子操作**：
   - ConcurrentHashMap的原子方法
   - 减少显式同步

6. **注意弱一致性**：
   - 迭代器可能不反映最新状态
   - 实时性要求高的场景需谨慎

### 4.7 并发集合性能对比

**性能测试结果（高并发场景）：**

| 操作类型 | ConcurrentHashMap | CopyOnWriteArrayList | LinkedBlockingQueue |
|---------|------------------|---------------------|--------------------|
| 读操作 | 100,000 ops/s | 120,000 ops/s | 80,000 ops/s |
| 写操作 | 90,000 ops/s | 1,000 ops/s | 70,000 ops/s |
| 遍历操作 | 80,000 ops/s | 110,000 ops/s | 60,000 ops/s |

**结论：**
- ConcurrentHashMap：综合性能最佳
- CopyOnWriteArrayList：读操作性能优异，写操作性能差
- LinkedBlockingQueue：适合生产者-消费者场景

---

## 5. 原子类实战应用

### 5.1 原子类概览

**原子类的核心价值**：
- **无锁操作**：使用 CAS 实现线程安全
- **高性能**：避免锁竞争带来的性能损耗
- **简单易用**：API 简洁，使用方便
- **线程安全**：无需额外同步措施

**原子类分类**：

| 类型 | 实现类 | **适用场景** |
|-----|--------|------------|
| 基本类型 | AtomicInteger, AtomicLong, AtomicBoolean | 计数器、标识位 |
| 引用类型 | AtomicReference, AtomicStampedReference, AtomicMarkableReference | 对象引用管理 |
| 数组类型 | AtomicIntegerArray, AtomicLongArray, AtomicReferenceArray | 原子数组操作 |
| 字段更新器 | AtomicIntegerFieldUpdater, AtomicLongFieldUpdater, AtomicReferenceFieldUpdater | 字段原子更新 |
| 累加器 | LongAdder, LongAccumulator, DoubleAdder, DoubleAccumulator | 高并发计数器 |

### 5.2 原子类核心原理

**CAS (Compare-And-Swap) 操作详解**：

CAS 是一种无锁算法，通过硬件指令实现原子操作。它包含三个操作数：
- **内存值 (V)**：内存中的当前值
- **预期原值 (A)**：期望的旧值
- **新值 (B)**：要设置的新值

**CAS 操作流程**：
1. 读取内存值 V
2. 比较 V 与预期值 A 是否相等
3. 如果相等，将 V 更新为新值 B，返回 true
4. 如果不相等，不更新，返回 false

**CAS 伪代码**：
```java
boolean compareAndSet(int expect, int update) {
    int current = getValueFromMemory();
    if (current == expect) {
        setValueToMemory(update);
        return true;
    }
    return false;
}
```

**CAS 的底层实现**：
- **x86 架构**：使用 `cmpxchg` 指令
- **ARM 架构**：使用 `LDREX` 和 `STREX` 指令
- **Java 层面**：通过 `sun.misc.Unsafe` 类调用本地方法

**CAS 的优势**：
- **无锁**：不使用锁，避免线程阻塞和唤醒的开销
- **高性能**：单条 CPU 指令完成，性能极高
- **非阻塞**：线程不会因为竞争而阻塞
- **可扩展**：适合高并发场景

**CAS 的局限性**：

1. **ABA 问题**：
   - **问题描述**：值从 A 变为 B 又变回 A，CAS 操作无法检测
   - **场景示例**：
     ```java
     // 线程1读取值 A
     int value = atomicRef.get(); // value = A
     
     // 线程2将值从 A 改为 B
     atomicRef.compareAndSet(A, B);
     
     // 线程2又将值从 B 改为 A
     atomicRef.compareAndSet(B, A);
     
     // 线程1执行 CAS，认为值没有变化，成功更新
     atomicRef.compareAndSet(A, C); // 成功，但实际上值已经被修改过
     ```
   - **解决方案**：
     - **AtomicStampedReference**：添加版本号
     - **AtomicMarkableReference**：添加标记位

2. **循环时间长开销大**：
   - **问题描述**：CAS 失败时会自旋重试，高并发下 CPU 开销大
   - **解决方案**：
     - 限制自旋次数
     - 使用自适应自旋
     - 结合锁机制

3. **只能保证一个共享变量的原子性**：
   - **问题描述**：CAS 只能对单个变量进行原子操作
   - **解决方案**：
     - 使用锁机制
     - 将多个变量封装成一个对象
     - 使用 AtomicReference

**ABA 问题详解**：

**AtomicStampedReference 解决方案**：
```java
// 创建带版本号的原子引用
AtomicStampedReference<String> stampedRef = new AtomicStampedReference<>("initial", 0);

// 获取值和版本
String currentValue = stampedRef.getReference();
int currentStamp = stampedRef.getStamp();

// 原子更新（需要版本号匹配）
boolean success = stampedRef.compareAndSet("initial", "updated", 0, 1);

// 强制更新
stampedRef.set("force-updated", 2);
```

**AtomicMarkableReference 解决方案**：
```java
// 创建带标记的原子引用
AtomicMarkableReference<String> markedRef = new AtomicMarkableReference<>("initial", false);

// 获取值和标记
String currentValue = markedRef.getReference();
boolean currentMark = markedRef.isMarked();

// 原子更新（需要标记匹配）
boolean success = markedRef.compareAndSet("initial", "updated", false, true);

// 强制更新
markedRef.set("force-updated", true);
```

**CAS 在实际项目中的应用**：

1. **计数器**：
   ```java
   class Counter {
       private final AtomicInteger count = new AtomicInteger(0);
       
       public void increment() {
           int oldValue, newValue;
           do {
               oldValue = count.get();
               newValue = oldValue + 1;
           } while (!count.compareAndSet(oldValue, newValue));
       }
   }
   ```

2. **非阻塞栈**：
   ```java
   class ConcurrentStack<T> {
       private final AtomicReference<Node<T>> top = new AtomicReference<>();
       
       public void push(T value) {
           Node<T> newNode = new Node<>(value, top.get());
           while (!top.compareAndSet(newNode.next, newNode)) {
               newNode = new Node<>(value, top.get());
           }
       }
       
       public T pop() {
           Node<T> oldTop, newTop;
           do {
               oldTop = top.get();
               if (oldTop == null) return null;
               newTop = oldTop.next;
           } while (!top.compareAndSet(oldTop, newTop));
           return oldTop.value;
       }
   }
   ```

3. **乐观锁实现**：
   ```java
   class OptimisticLock<T> {
       private final AtomicReference<T> ref = new AtomicReference<>();
       
       public boolean update(T oldValue, T newValue) {
           return ref.compareAndSet(oldValue, newValue);
       }
   }
   ```

**CAS 性能优化技巧**：

1. **减少 CAS 失败率**：
   - 使用 ThreadLocal 缓存热点数据
   - 使用分段锁减少竞争
   - 使用 LongAdder 分散热点

2. **优化自旋策略**：
   - 限制自旋次数
   - 使用自适应自旋
   - 结合 yield() 让出 CPU

3. **结合其他技术**：
   - 使用 volatile 保证可见性
   - 使用 final 保证不可变性
   - 使用 ThreadLocal 避免共享

### 5.3 基本类型原子类使用

**AtomicInteger 示例**：
```java
AtomicInteger counter = new AtomicInteger(0);

// 基本操作
int value = counter.get(); // 获取当前值
counter.set(10); // 设置新值
int oldValue = counter.getAndSet(20); // 设置新值并返回旧值

// 原子操作
boolean success = counter.compareAndSet(20, 30); // 比较并设置
int incremented = counter.incrementAndGet(); // 自增并获取
int decremented = counter.decrementAndGet(); // 自减并获取
int added = counter.addAndGet(5); // 加法并获取
int oldValue = counter.getAndIncrement(); // 获取并自增
int oldValue = counter.getAndDecrement(); // 获取并自减
int oldValue = counter.getAndAdd(10); // 获取并加法
```

**AtomicBoolean 示例**：
```java
AtomicBoolean flag = new AtomicBoolean(false);

// 基本操作
boolean current = flag.get();
flag.set(true);

// 原子操作
boolean success = flag.compareAndSet(false, true);
boolean oldValue = flag.getAndSet(false);
```

### 5.4 引用类型原子类使用

**AtomicReference 示例**：
```java
AtomicReference<User> userRef = new AtomicReference<>(new User("Alice", 25));

// 基本操作
User currentUser = userRef.get();
userRef.set(new User("Bob", 30));

// 原子操作
User newUser = new User("Charlie", 35);
boolean success = userRef.compareAndSet(currentUser, newUser);
```

**AtomicStampedReference 示例**：
```java
AtomicStampedReference<String> stampedRef = new AtomicStampedReference<>("initial", 0);

// 获取值和版本
String currentValue = stampedRef.getReference();
int currentStamp = stampedRef.getStamp();

// 原子更新（需要版本号匹配）
boolean success = stampedRef.compareAndSet("initial", "updated", 0, 1);

// 强制更新
stampedRef.set("force-updated", 2);
```

### 5.5 数组类型原子类使用

**AtomicIntegerArray 示例**：
```java
AtomicIntegerArray array = new AtomicIntegerArray(5);

// 基本操作
int value = array.get(0);
array.set(0, 10);

// 原子操作
boolean success = array.compareAndSet(0, 10, 20);
int incremented = array.incrementAndGet(1);
int added = array.addAndGet(2, 5);
```

### 5.6 字段更新器使用

**AtomicIntegerFieldUpdater 示例**：
```java
class User {
    private volatile int age; // 必须是 volatile
    
    public User(int age) {
        this.age = age;
    }
    
    public int getAge() {
        return age;
    }
}

// 创建字段更新器
AtomicIntegerFieldUpdater<User> ageUpdater = AtomicIntegerFieldUpdater.newUpdater(User.class, "age");

// 使用
User user = new User(25);
int oldAge = ageUpdater.getAndIncrement(user);
boolean success = ageUpdater.compareAndSet(user, 26, 30);
```

### 5.7 累加器使用

**LongAdder 示例**：
```java
// 高并发计数器
LongAdder counter = new LongAdder();

// 累加
counter.increment(); // +1
counter.add(5); // +5

// 获取当前值
long value = counter.sum();

// 重置
counter.reset();

// 获取并重置
long value = counter.sumThenReset();
```

**LongAccumulator 示例**：
```java
// 自定义累加操作
LongAccumulator accumulator = new LongAccumulator(
    (x, y) -> x * y, // 乘法操作
    1 // 初始值
);

// 累加
accumulator.accumulate(2);
accumulator.accumulate(3);
accumulator.accumulate(4);

// 获取结果
long result = accumulator.get(); // 1 * 2 * 3 * 4 = 24
```

### 5.8 原子类性能对比

**性能测试结果（高并发场景）**：

| 计数器类型 | 100万操作耗时 | **优点** | **缺点** | **适用场景** |
|-----------|-------------|---------|---------|------------|
| AtomicInteger | 15ms | 通用 | 高并发下性能下降 | 低到中等并发 |
| LongAdder | 8ms | 高并发性能好 | 内存开销大 | 高并发计数器 |
| synchronized | 50ms | 简单 | 性能差 | 低并发 |
| volatile + CAS | 12ms | 灵活 | 实现复杂 | 自定义场景 |

**结论**：
- **低并发**：AtomicInteger 足够
- **高并发**：LongAdder 性能更佳
- **自定义操作**：LongAccumulator 灵活

### 5.9 原子类最佳实践

1. **选择合适的原子类**：
   - 基本类型：AtomicInteger, AtomicLong
   - 高并发计数：LongAdder
   - 引用类型：AtomicReference
   - 解决ABA问题：AtomicStampedReference

2. **避免ABA问题**：
   - 使用 AtomicStampedReference 或 AtomicMarkableReference
   - 设计合理的版本号或标记

3. **注意内存可见性**：
   - 原子类的字段必须是 volatile
   - 字段更新器要求字段是 volatile

4. **合理使用原子操作**：
   - 优先使用原子类提供的方法
   - 避免自定义 CAS 操作

5. **性能优化**：
   - 高并发场景使用 LongAdder
   - 批量操作考虑使用 sumThenReset

6. **结合其他并发工具**：
   - 与线程池结合使用
   - 与 CompletableFuture 结合使用

### 5.10 原子类实战案例

**案例1：线程安全的计数器**
```java
public class AtomicCounter {
    private final LongAdder counter = new LongAdder();
    
    public void increment() {
        counter.increment();
    }
    
    public void add(long value) {
        counter.add(value);
    }
    
    public long getCount() {
        return counter.sum();
    }
    
    public long reset() {
        return counter.sumThenReset();
    }
}
```

**案例2：线程安全的单例模式**
```java
public class AtomicSingleton {
    private static final AtomicReference<AtomicSingleton> instance = new AtomicReference<>();
    
    private AtomicSingleton() {}
    
    public static AtomicSingleton getInstance() {
        while (true) {
            AtomicSingleton current = instance.get();
            if (current != null) {
                return current;
            }
            AtomicSingleton candidate = new AtomicSingleton();
            if (instance.compareAndSet(null, candidate)) {
                return candidate;
            }
        }
    }
}
```

**案例3：非阻塞栈**
```java
public class ConcurrentStack<T> {
    private static class Node<T> {
        final T value;
        final Node<T> next;
        
        Node(T value, Node<T> next) {
            this.value = value;
            this.next = next;
        }
    }
    
    private final AtomicReference<Node<T>> top = new AtomicReference<>();
    
    public void push(T value) {
        Node<T> newNode = new Node<>(value, top.get());
        while (!top.compareAndSet(newNode.next, newNode)) {
            newNode = new Node<>(value, top.get());
        }
    }
    
    public T pop() {
        Node<T> oldTop;
        Node<T> newTop;
        do {
            oldTop = top.get();
            if (oldTop == null) {
                return null;
            }
            newTop = oldTop.next;
        } while (!top.compareAndSet(oldTop, newTop));
        return oldTop.value;
    }
}
```

---

## 6. 锁机制对比与优化

### 6.1 锁的分类与对比

**锁的核心特性**：
- **互斥性**：同一时间只有一个线程能持有锁
- **可见性**：锁操作会刷新内存
- **有序性**：锁操作会建立 happens-before 关系

**常见锁对比**：

| 锁类型 | **特点** | **适用场景** | **性能** | **公平性** |
|-------|---------|------------|---------|-----------|
| synchronized | JVM内置，简单 | 一般同步场景 | 中等 | 非公平 |
| ReentrantLock | 可重入，灵活 | 复杂同步场景 | 高 | 可配置 |
| ReadWriteLock | 读写分离 | 读多写少 | 高 | 可配置 |
| StampedLock | 乐观读，无锁 | 读极多写极少 | 极高 | 非公平 |
| Semaphore | 信号量，控制并发数 | 资源访问控制 | 高 | 非公平 |
| CountDownLatch | 倒计时，等待多个线程 | 多线程协调 | 高 | 无 |
| CyclicBarrier | 循环屏障，同步多个线程 | 阶段任务 | 高 | 无 |

### 6.2 synchronized 深度解析

**synchronized 的实现原理**：

**1. 对象头结构**：
```
|-----------------|-----------------|-----------------|
| Mark Word       | Class Pointer   | Array Length    |
| 32/64 bits      | 32/64 bits      | 32 bits         |
|-----------------|-----------------|-----------------|
```

**Mark Word 状态转换**：
- **无锁状态**：存储对象的 hashCode、分代年龄等
- **偏向锁**：存储线程 ID、epoch、分代年龄
- **轻量级锁**：存储指向栈中 Lock Record 的指针
- **重量级锁**：存储指向堆中 Monitor 对象的指针

**2. 锁膨胀过程**：
```
无锁 → 偏向锁 → 轻量级锁 → 重量级锁
```

**详细过程**：
1. **无锁状态**：对象刚创建，没有任何线程访问
2. **偏向锁**：第一个线程访问时，将对象头偏向该线程
   - 优点：只有一个线程访问时，无锁开销
   - 缺点：多线程竞争时需要撤销偏向锁
3. **轻量级锁**：多个线程竞争时，升级为轻量级锁
   - 优点：避免线程阻塞，使用自旋
   - 缺点：自旋消耗 CPU
4. **重量级锁**：竞争激烈时，升级为重量级锁
   - 优点：避免 CPU 空转
   - 缺点：线程阻塞和唤醒开销大

**3. Monitor 机制**：
- **Monitor 是操作系统的互斥量**
- **每个对象都有一个 Monitor**
- **Monitor 包含**：
  - _owner：持有锁的线程
  - _recursions：重入次数
  - _EntryList：等待获取锁的线程队列
  - _WaitSet：调用 wait() 的线程队列

**synchronized 的使用方式**：
```java
// 1. 同步实例方法
public synchronized void instanceMethod() {
    // 锁住的是 this 对象
}

// 2. 同步静态方法
public static synchronized void staticMethod() {
    // 锁住的是 Class 对象
}

// 3. 同步代码块
public void method() {
    synchronized (this) {
        // 锁住的是 this 对象
    }
}

// 4. 同步类对象
public void method() {
    synchronized (ClassName.class) {
        // 锁住的是 Class 对象
    }
}

// 5. 同步任意对象
public void method() {
    Object lock = new Object();
    synchronized (lock) {
        // 锁住的是 lock 对象
    }
}
```

**synchronized 的优化**：

**1. 锁消除**：
```java
// 优化前
public void method() {
    StringBuffer sb = new StringBuffer();
    sb.append("Hello");
    sb.append("World");
}

// 优化后（JVM 自动优化）
public void method() {
    StringBuffer sb = new StringBuffer();
    sb.append("Hello"); // 不需要 synchronized
    sb.append("World"); // 不需要 synchronized
}
```

**2. 锁粗化**：
```java
// 优化前
public void method() {
    synchronized (this) {
        count++;
    }
    synchronized (this) {
        count++;
    }
    synchronized (this) {
        count++;
    }
}

// 优化后（JVM 自动优化）
public void method() {
    synchronized (this) {
        count++;
        count++;
        count++;
    }
}
```

**3. 偏向锁优化**：
```java
// 偏向锁延迟启动
-XX:BiasedLockingStartupDelay=4000 // 默认 4 秒

// 关闭偏向锁
-XX:-UseBiasedLocking
```

**4. 自适应自旋**：
```java
// 自适应自旋次数
-XX:PreBlockSpin=10 // 默认 10 次
```

**synchronized 的优势**：
- **简单易用**：无需手动获取和释放锁
- **JVM 自动优化**：锁消除、锁粗化、锁膨胀
- **不会死锁**：JVM 保证锁的释放
- **线程安全**：保证内存可见性、原子性、有序性

**synchronized 的劣势**：
- **灵活性差**：不支持超时、中断、公平锁
- **性能中等**：竞争激烈时性能不如 ReentrantLock
- **无法中断**：无法响应中断

**实际开发中的选择**：
- **简单同步**：优先使用 synchronized
- **需要灵活性**：使用 ReentrantLock
- **高并发场景**：使用 ReentrantLock
- **读多写少**：使用 ReadWriteLock

### 6.3 ReentrantLock 深度解析

**ReentrantLock 的底层原理：AQS**

**AQS (AbstractQueuedSynchronizer) 简介**：
- **AQS 是 JUC 锁的基础框架**
- **提供了基于 FIFO 等待队列的同步器**
- **支持独占模式和共享模式**
- **ReentrantLock、ReadWriteLock、Semaphore 等都基于 AQS 实现**

**AQS 核心原理**：

**1. AQS 的状态管理**：
```java
// AQS 使用一个 volatile int 变量表示同步状态
private volatile int state;

// 获取状态
protected final int getState() {
    return state;
}

// 设置状态
protected final void setState(int newState) {
    state = newState;
}

// CAS 更新状态
protected final boolean compareAndSetState(int expect, int update) {
    return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
}
```

**2. AQS 的等待队列**：
- **双向链表结构**
- **每个节点包含**：
  - thread：等待的线程
  - waitStatus：节点状态
  - prev：前驱节点
  - next：后继节点
  - nextWaiter：条件队列的下一个节点

**3. 节点状态（waitStatus）**：
- **CANCELLED (1)**：节点已取消
- **SIGNAL (-1)**：后继节点需要唤醒
- **CONDITION (-2)**：节点在条件队列中
- **PROPAGATE (-3)**：释放操作应该传播
- **0**：初始状态

**ReentrantLock 基于 AQS 的实现**：

**1. 独占模式获取锁**：
```java
public void lock() {
    sync.lock();
}

// 非公平锁实现
final void lock() {
    if (compareAndSetState(0, 1)) {
        setExclusiveOwnerThread(Thread.currentThread());
    } else {
        acquire(1);
    }
}

// 公平锁实现
final void lock() {
    acquire(1);
}

// AQS 的 acquire 方法
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) {
        selfInterrupt();
    }
}
```

**2. tryAcquire 实现**：
```java
// 非公平锁的 tryAcquire
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    
    if (c == 0) {
        // 尝试直接获取锁（非公平）
        if (compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    } else if (current == getExclusiveOwnerThread()) {
        // 重入
        int nextc = c + acquires;
        if (nextc < 0) {
            throw new Error("Maximum lock count exceeded");
        }
        setState(nextc);
        return true;
    }
    return false;
}

// 公平锁的 tryAcquire
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    
    if (c == 0) {
        // 检查是否有前驱节点（公平）
        if (!hasQueuedPredecessors() &&
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    } else if (current == getExclusiveOwnerThread()) {
        // 重入
        int nextc = c + acquires;
        if (nextc < 0) {
            throw new Error("Maximum lock count exceeded");
        }
        setState(nextc);
        return true;
    }
    return false;
}
```

**3. 释放锁**：
```java
public void unlock() {
    sync.release(1);
}

// AQS 的 release 方法
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0) {
            unparkSuccessor(h);
        }
        return true;
    }
    return false;
}

// tryRelease 实现
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    if (Thread.currentThread() != getExclusiveOwnerThread()) {
        throw new IllegalMonitorStateException();
    }
    
    boolean free = false;
    if (c == 0) {
        free = true;
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}
```

**4. 条件变量实现**：
```java
// 创建条件变量
Condition newCondition() {
    return sync.newCondition();
}

// 等待条件
public final void await() throws InterruptedException {
    if (Thread.interrupted()) {
        throw new InterruptedException();
    }
    
    Node node = addConditionWaiter();
    int savedState = fullyRelease(node);
    
    int interruptMode = 0;
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0) {
            break;
        }
    }
    
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE) {
        interruptMode = REINTERRUPT;
    }
    
    if (node.nextWaiter != null) {
        unlinkCancelledWaiters();
    }
    
    if (interruptMode != 0) {
        reportInterruptAfterWait(interruptMode);
    }
}

// 唤醒等待线程
public final void signal() {
    if (!isHeldExclusively()) {
        throw new IllegalMonitorStateException();
    }
    
    Node first = firstWaiter;
    if (first != null) {
        doSignal(first);
    }
}
```

**ReentrantLock 的特性**：
- **可重入**：同一线程可多次获取同一把锁
- **可中断**：支持响应中断
- **可超时**：支持设置获取锁的超时时间
- **公平性**：可配置公平/非公平模式
- **条件变量**：支持多个条件变量

**使用示例**：
```java
// 创建可重入锁
ReentrantLock lock = new ReentrantLock(); // 默认非公平
// ReentrantLock fairLock = new ReentrantLock(true); // 公平锁

// 基本使用
lock.lock();
try {
    // 同步代码
} finally {
    lock.unlock(); // 必须在finally中释放
}

// 可中断的获取锁
try {
    if (lock.tryLock(5, TimeUnit.SECONDS)) {
        try {
            // 同步代码
        } finally {
            lock.unlock();
        }
    }
} catch (InterruptedException e) {
    e.printStackTrace();
}

// 条件变量
Condition condition = lock.newCondition();
lock.lock();
try {
    while (!conditionMet) {
        condition.await(); // 等待条件
    }
    // 处理逻辑
    condition.signal(); // 唤醒一个等待线程
    // condition.signalAll(); // 唤醒所有等待线程
} finally {
    lock.unlock();
}
```

**ReentrantLock vs synchronized 对比**：

| 特性 | ReentrantLock | synchronized |
|-----|---------------|--------------|
| 可重入 | 是 | 是 |
| 可中断 | 是 | 否 |
| 可超时 | 是 | 否 |
| 公平性 | 可配置 | 非公平 |
| 条件变量 | 多个 | 一个 |
| 性能 | 高（竞争激烈时） | 中等 |
| 易用性 | 复杂 | 简单 |
| 自动释放 | 否 | 是 |

**实际开发中的选择**：
- **简单同步**：synchronized 足够
- **需要灵活性**：ReentrantLock
- **需要公平锁**：ReentrantLock
- **需要超时**：ReentrantLock
- **需要多个条件变量**：ReentrantLock

### 6.4 ReadWriteLock 深度解析

**ReadWriteLock 的特性**：
- **读写分离**：多个读线程可同时持有读锁
- **互斥写**：写线程与其他线程互斥
- **可重入**：支持重入
- **降级**：支持从写锁降级为读锁

**使用示例**：
```java
// 创建读写锁
ReadWriteLock rwLock = new ReentrantReadWriteLock();
Lock readLock = rwLock.readLock();
Lock writeLock = rwLock.writeLock();

// 读操作
readLock.lock();
try {
    // 读取操作
} finally {
    readLock.unlock();
}

// 写操作
writeLock.lock();
try {
    // 写入操作
} finally {
    writeLock.unlock();
}

// 锁降级（写锁 → 读锁）
writeLock.lock();
try {
    // 写操作
    readLock.lock(); // 获取读锁
} finally {
    writeLock.unlock(); // 释放写锁，保留读锁
}
try {
    // 读操作
} finally {
    readLock.unlock(); // 释放读锁
}
```

**适用场景**：
- 读操作远多于写操作
- 读操作时间较长
- 写操作频率低

### 6.5 StampedLock 深度解析

**StampedLock 的特性**：
- **乐观读**：无需加锁，使用版本号验证
- **三种模式**：写锁、读锁、乐观读
- **不可重入**：不支持重入
- **性能高**：读操作几乎无开销

**使用示例**：
```java
// 创建 StampedLock
StampedLock lock = new StampedLock();

// 写操作
long stamp = lock.writeLock();
try {
    // 写入操作
} finally {
    lock.unlockWrite(stamp);
}

// 读操作
long stamp = lock.readLock();
try {
    // 读取操作
} finally {
    lock.unlockRead(stamp);
}

// 乐观读（推荐）
long stamp = lock.tryOptimisticRead();
// 读取操作
if (!lock.validate(stamp)) {
    // 乐观读失败，升级为读锁
    stamp = lock.readLock();
    try {
        // 重新读取操作
    } finally {
        lock.unlockRead(stamp);
    }
}
```

**StampedLock vs ReadWriteLock 对比**：

| 特性 | StampedLock | ReadWriteLock |
|-----|-------------|---------------|
| 读模式 | 乐观读 + 悲观读 | 悲观读 |
| 可重入 | 否 | 是 |
| 性能 | 极高（读多写少时） | 高 |
| 复杂度 | 高 | 中等 |
| 适用场景 | 读极多写极少 | 读多写少 |

### 6.6 锁优化策略

1. **减少锁持有时间**：
   - 只在必要的代码段上加锁
   - 避免在锁内执行耗时操作

2. **减少锁粒度**：
   - 使用分段锁（如 ConcurrentHashMap）
   - 分离读写锁（如 ReadWriteLock）

3. **使用无锁数据结构**：
   - Atomic 类
   - Concurrent 集合

4. **锁粗化**：
   - 将多个小的同步代码块合并为一个大的
   - 减少锁的获取和释放开销

5. **锁消除**：
   - 消除不可能发生竞争的锁
   - JVM 会自动优化

6. **选择合适的锁类型**：
   - 一般场景：synchronized
   - 复杂场景：ReentrantLock
   - 读多写少：ReadWriteLock
   - 读极多写极少：StampedLock

7. **避免死锁**：
   - 按顺序获取锁
   - 使用 tryLock() 避免死锁
   - 设置合理的超时时间

### 6.7 死锁分析与预防

**死锁的四个必要条件**：
1. **互斥条件**：资源不能被共享
2. **请求与保持条件**：线程持有资源并请求新资源
3. **不剥夺条件**：资源只能主动释放
4. **循环等待条件**：线程形成循环等待链

**死锁预防**：
- 破坏循环等待条件：按顺序获取锁
- 破坏请求与保持条件：一次性获取所有资源
- 破坏不剥夺条件：允许超时放弃
- 使用 Lock 接口的 tryLock() 方法

**死锁检测**：
- 使用 jstack 命令查看线程状态
- 使用 VisualVM 等工具分析
- 实现超时机制

### 6.8 锁的最佳实践

1. **优先使用 synchronized**：
   - 简单易用，JVM 自动优化
   - 适合大多数场景

2. **复杂场景使用 ReentrantLock**：
   - 需要可中断、可超时、公平性等特性
   - 需要多个条件变量

3. **读多写少使用 ReadWriteLock**：
   - 提高并发读性能
   - 适合缓存、配置等场景

4. **读极多写极少使用 StampedLock**：
   - 获得最佳读性能
   - 注意不可重入的限制

5. **避免过度同步**：
   - 只在必要时使用锁
   - 优先考虑无锁方案

6. **正确释放锁**：
   - 使用 try-finally 确保锁释放
   - 避免在锁内抛出异常

7. **监控锁竞争**：
   - 使用 JVM 工具监控锁竞争
   - 及时发现和解决性能问题

---

## 7. 并发工具类使用指南

### 7.1 并发工具类概览

**核心并发工具**：
- **CountDownLatch**：倒计时门闩，等待多个线程完成
- **CyclicBarrier**：循环屏障，多个线程同步到达屏障
- **Semaphore**：信号量，控制并发访问数量
- **Exchanger**：线程交换器，两个线程交换数据
- **Phaser**：阶段同步器，支持动态参与线程数

### 7.2 CountDownLatch 深度解析

**CountDownLatch 的特性**：
- **一次性使用**：计数器减到0后不能重置
- **阻塞等待**：主线程等待其他线程完成
- **多线程协调**：适合等待多个任务完成

**使用示例**：
```java
// 创建 CountDownLatch，计数器为3
CountDownLatch latch = new CountDownLatch(3);

// 工作线程
for (int i = 0; i < 3; i++) {
    final int taskId = i;
    new Thread(() -> {
        try {
            System.out.println("Task " + taskId + " started");
            Thread.sleep(1000 + taskId * 500);
            System.out.println("Task " + taskId + " completed");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            latch.countDown(); // 计数器减1
        }
    }).start();
}

// 主线程等待
System.out.println("Main thread waiting for tasks to complete");
try {
    latch.await(); // 阻塞直到计数器为0
    // latch.await(5, TimeUnit.SECONDS); // 带超时的等待
} catch (InterruptedException e) {
    e.printStackTrace();
}
System.out.println("All tasks completed, main thread continues");
```

**适用场景**：
- 启动多个服务，等待所有服务就绪
- 并行处理多个任务，等待所有任务完成
- 测试中等待多个线程执行完毕

### 7.3 CyclicBarrier 深度解析

**CyclicBarrier 的特性**：
- **可重复使用**：计数器减到0后会自动重置
- **循环同步**：支持多个阶段的同步
- **回调函数**：当所有线程到达屏障时执行

**使用示例**：
```java
// 创建 CyclicBarrier，计数器为3，带回调
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("All threads reached the barrier, executing barrier action");
});

// 工作线程
for (int i = 0; i < 3; i++) {
    final int threadId = i;
    new Thread(() -> {
        try {
            for (int phase = 1; phase <= 2; phase++) {
                System.out.println("Thread " + threadId + " working on phase " + phase);
                Thread.sleep(1000);
                System.out.println("Thread " + threadId + " reached barrier for phase " + phase);
                barrier.await(); // 等待其他线程
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }).start();
}
```

**CyclicBarrier vs CountDownLatch 对比**：

| 特性 | CyclicBarrier | CountDownLatch |
|-----|---------------|----------------|
| 可重用性 | 可重复使用 | 一次性使用 |
| 重置 | 自动重置 | 不可重置 |
| 参与线程 | 所有线程都必须到达 | 只需等待计数器为0 |
| 回调 | 支持 | 不支持 |
| 适用场景 | 阶段任务 | 等待任务完成 |

### 7.4 Semaphore 深度解析

**Semaphore 的特性**：
- **资源控制**：控制并发访问数量
- **可重用**：可以反复获取和释放
- **公平性**：可配置公平/非公平模式

**使用示例**：
```java
// 创建 Semaphore， permits为3
Semaphore semaphore = new Semaphore(3); // 默认非公平
// Semaphore semaphore = new Semaphore(3, true); // 公平模式

// 工作线程
for (int i = 0; i < 5; i++) {
    final int threadId = i;
    new Thread(() -> {
        try {
            System.out.println("Thread " + threadId + " waiting for permit");
            semaphore.acquire(); // 获取许可证
            try {
                System.out.println("Thread " + threadId + " acquired permit, working");
                Thread.sleep(2000);
            } finally {
                semaphore.release(); // 释放许可证
                System.out.println("Thread " + threadId + " released permit");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();
}
```

**适用场景**：
- 限制并发访问数据库连接
- 控制API请求速率
- 限流保护
- 资源池管理

### 7.5 Exchanger 深度解析

**Exchanger 的特性**：
- **双向交换**：两个线程交换数据
- **阻塞等待**：直到两个线程都到达交换点
- **一次性交换**：每次交换需要两个线程

**使用示例**：
```java
// 创建 Exchanger
Exchanger<String> exchanger = new Exchanger<>();

// 线程1
new Thread(() -> {
    try {
        String data1 = "Data from Thread 1";
        System.out.println("Thread 1 sending: " + data1);
        String received = exchanger.exchange(data1);
        System.out.println("Thread 1 received: " + received);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();

// 线程2
new Thread(() -> {
    try {
        Thread.sleep(1000); // 模拟处理时间
        String data2 = "Data from Thread 2";
        System.out.println("Thread 2 sending: " + data2);
        String received = exchanger.exchange(data2);
        System.out.println("Thread 2 received: " + received);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();
```

**适用场景**：
- 生产者-消费者之间的数据交换
- 任务分解与结果合并
- 线程间数据传递

### 7.6 Phaser 深度解析

**Phaser 的特性**：
- **动态线程数**：支持添加和移除线程
- **阶段同步**：支持多个阶段的同步
- **可重用**：可以反复使用
- **灵活的同步**：比 CyclicBarrier 更灵活

**使用示例**：
```java
// 创建 Phaser
Phaser phaser = new Phaser(3); // 初始3个线程

// 工作线程
for (int i = 0; i < 3; i++) {
    final int threadId = i;
    new Thread(() -> {
        try {
            for (int phase = 0; phase < 2; phase++) {
                System.out.println("Thread " + threadId + " working on phase " + phase);
                Thread.sleep(1000);
                System.out.println("Thread " + threadId + " arrived at phase " + phase);
                phaser.arriveAndAwaitAdvance(); // 到达并等待
            }
            phaser.arriveAndDeregister(); // 完成并注销
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();
}

// 主线程监控
new Thread(() -> {
    while (!phaser.isTerminated()) {
        int phase = phaser.getPhase();
        int registered = phaser.getRegisteredParties();
        System.out.println("Phase: " + phase + ", Registered parties: " + registered);
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    System.out.println("Phaser terminated");
}).start();
```

**适用场景**：
- 动态线程池的同步
- 复杂的多阶段任务
- 需要动态调整参与线程的场景

### 7.7 并发工具类最佳实践

1. **选择合适的工具**：
   - 等待多个任务完成：CountDownLatch
   - 循环同步：CyclicBarrier
   - 资源控制：Semaphore
   - 数据交换：Exchanger
   - 动态同步：Phaser

2. **注意异常处理**：
   - 所有阻塞方法都可能抛出 InterruptedException
   - 使用 try-finally 确保资源释放

3. **合理设置超时**：
   - 使用带超时的 await() 方法
   - 避免无限期阻塞

4. **监控工具状态**：
   - 监控计数器状态
   - 及时发现异常情况

5. **结合其他并发工具**：
   - 与线程池结合使用
   - 与 CompletableFuture 结合使用

6. **性能考虑**：
   - 避免过度使用同步工具
   - 合理设置并发参数

---

## 8. 常见并发问题与解决方案

### 8.1 并发问题分类

**常见并发问题**：
- **竞态条件**：多个线程同时访问共享资源导致数据不一致
- **死锁**：线程相互等待对方持有的资源
- **活锁**：线程不断改变状态但无法继续执行
- **饥饿**：线程长期无法获取资源
- **内存可见性**：线程无法看到其他线程的修改
- **线程安全**：代码在多线程环境下表现不一致

### 8.2 竞态条件与解决方案

**竞态条件的表现**：
- 数据不一致
- 计算错误
- 状态混乱

**解决方案**：
1. **使用同步锁**：
   - synchronized
   - ReentrantLock

2. **使用原子类**：
   - AtomicInteger
   - AtomicReference
   - LongAdder

3. **使用并发集合**：
   - ConcurrentHashMap
   - CopyOnWriteArrayList

4. **使用线程本地变量**：
   - ThreadLocal

**示例**：
```java
// 竞态条件示例
class Counter {
    private int count = 0;
    
    // 存在竞态条件
    public void increment() {
        count++;
    }
    
    // 解决方案1：使用 synchronized
    public synchronized void safeIncrement1() {
        count++;
    }
    
    // 解决方案2：使用原子类
    private final AtomicInteger atomicCount = new AtomicInteger(0);
    
    public void safeIncrement2() {
        atomicCount.incrementAndGet();
    }
}
```

### 8.3 死锁与解决方案

**死锁的原因**：
1. 互斥条件
2. 请求与保持条件
3. 不剥夺条件
4. 循环等待条件

**死锁检测**：
- 使用 jstack 命令查看线程状态
- 使用 VisualVM 等工具分析
- 实现超时机制

**死锁预防**：
1. **按顺序获取锁**：
   ```java
   // 错误：可能死锁
   void transfer(Account from, Account to, int amount) {
       synchronized (from) {
           synchronized (to) {
               from.debit(amount);
               to.credit(amount);
           }
       }
   }
   
   // 正确：按顺序获取锁
   void transfer(Account from, Account to, int amount) {
       Account first = from.hashCode() < to.hashCode() ? from : to;
       Account second = from.hashCode() < to.hashCode() ? to : from;
       synchronized (first) {
           synchronized (second) {
               from.debit(amount);
               to.credit(amount);
           }
       }
   }
   ```

2. **使用 tryLock()**：
   ```java
   void safeLock() {
       ReentrantLock lock1 = new ReentrantLock();
       ReentrantLock lock2 = new ReentrantLock();
       
       try {
           if (lock1.tryLock(1, TimeUnit.SECONDS)) {
               try {
                   if (lock2.tryLock(1, TimeUnit.SECONDS)) {
                       try {
                           // 临界区
                       } finally {
                           lock2.unlock();
                       }
                   }
               } finally {
                   lock1.unlock();
               }
           }
       } catch (InterruptedException e) {
           Thread.currentThread().interrupt();
       }
   }
   ```

### 8.4 内存可见性与解决方案

**内存可见性问题**：
- 线程无法看到其他线程的修改
- 指令重排序导致的问题

**解决方案**：
1. **使用 volatile**：
   ```java
   private volatile boolean flag = false;
   
   public void setFlag() {
       flag = true;
   }
   
   public void checkFlag() {
       while (!flag) {
           // 等待
       }
   }
   ```

2. **使用同步锁**：
   - synchronized
   - ReentrantLock

3. **使用原子类**：
   - Atomic 类保证可见性

### 8.5 线程安全集合的使用

**线程安全集合选择**：
- **Map**：ConcurrentHashMap
- **List**：CopyOnWriteArrayList
- **Set**：CopyOnWriteArraySet
- **Queue**：ConcurrentLinkedQueue, BlockingQueue

**使用示例**：
```java
// 线程安全的 Map
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("key", 1);
int value = map.get("key");

// 线程安全的 List
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("item");

// 线程安全的 Queue
BlockingQueue<String> queue = new LinkedBlockingQueue<>();
queue.put("task");
String task = queue.take();
```

### 8.6 线程池常见问题

**线程池问题**：
- 线程池饱和
- 任务积压
- 内存泄漏
- 死锁

**解决方案**：
1. **合理配置线程池**：
   - 核心线程数
   - 最大线程数
   - 队列大小
   - 拒绝策略

2. **监控线程池**：
   - 活跃线程数
   - 队列大小
   - 完成任务数
   - 拒绝任务数

3. **正确关闭线程池**：
   ```java
   executor.shutdown();
   if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
       executor.shutdownNow();
   }
   ```

### 8.7 并发最佳实践

1. **优先使用高级并发工具**：
   - ExecutorService
   - ConcurrentHashMap
   - Atomic 类
   - CompletableFuture

2. **最小化同步范围**：
   - 只在必要的代码段上加锁
   - 避免在锁内执行耗时操作

3. **使用不可变对象**：
   - final 字段
   - 不可变集合

4. **避免共享可变状态**：
   - 使用 ThreadLocal
   - 传递参数而非共享变量

5. **正确处理异常**：
   - 捕获 InterruptedException
   - 恢复中断状态

6. **使用工具类**：
   - CountDownLatch
   - CyclicBarrier
   - Semaphore

7. **监控与调优**：
   - 监控锁竞争
   - 分析线程状态
   - 调整并发参数

---

## 9. 性能优化实战技巧

### 9.1 性能优化原则

**核心优化原则**：
- **减少锁竞争**：降低线程间的竞争
- **提高并行度**：充分利用多核CPU
- **减少上下文切换**：降低线程切换开销
- **优化内存使用**：减少内存分配和GC压力
- **合理使用并发工具**：选择合适的并发工具

### 9.2 线程池优化

**线程池调优策略**：
1. **核心线程数设置**：
   - CPU密集型：核心线程数 = CPU核心数 + 1
   - IO密集型：核心线程数 = CPU核心数 × 2
   - 混合任务：核心线程数 = CPU核心数 × (1 + IO等待时间/CPU处理时间)

2. **队列选择**：
   - 有界队列：控制内存使用
   - 无界队列：注意任务积压

3. **拒绝策略**：
   - 关键任务：AbortPolicy
   - 非关键任务：DiscardPolicy
   - 任务不紧急：CallerRunsPolicy

4. **线程池监控**：
   - 活跃线程数
   - 队列大小
   - 完成任务数
   - 拒绝任务数

**线程池最佳实践**：
```java
// 自定义线程池
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,              // 核心线程数
    8,              // 最大线程数
    60,             // 非核心线程存活时间
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100), // 有界队列
    new NamedThreadFactory("business-"),
    new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
);

// 监控线程池
ThreadPoolMonitor monitor = new ThreadPoolMonitor(executor);
monitor.startMonitoring(1, TimeUnit.MINUTES);
```

### 9.3 锁优化

**锁优化策略**：
1. **减少锁持有时间**：
   ```java
   // 优化前
   synchronized (this) {
       // 耗时操作
       heavyOperation();
       // 临界区
       count++;
   }
   
   // 优化后
   heavyOperation(); // 耗时操作移到锁外
   synchronized (this) {
       count++;
   }
   ```

2. **减少锁粒度**：
   - 使用分段锁
   - 使用 ReadWriteLock

3. **使用无锁数据结构**：
   - Atomic 类
   - Concurrent 集合

4. **锁粗化**：
   ```java
   // 优化前
   for (int i = 0; i < 1000; i++) {
       synchronized (this) {
           count++;
       }
   }
   
   // 优化后
   synchronized (this) {
       for (int i = 0; i < 1000; i++) {
           count++;
       }
   }
   ```

5. **选择合适的锁类型**：
   - 一般场景：synchronized
   - 复杂场景：ReentrantLock
   - 读多写少：ReadWriteLock
   - 读极多写极少：StampedLock

### 9.4 内存优化

**内存优化策略**：
1. **减少对象创建**：
   - 使用对象池
   - 避免频繁创建临时对象

2. **减少内存占用**：
   - 使用基本类型而非包装类型
   - 合理使用集合容量
   - 避免内存泄漏

3. **GC优化**：
   - 选择合适的GC算法
   - 调整GC参数
   - 避免大对象

4. **内存屏障优化**：
   - 合理使用 volatile
   - 避免不必要的内存屏障

### 9.5 并发集合优化

**并发集合选择**：
| 场景 | 推荐集合 | **理由** |
|-----|---------|---------|
| 高并发读写 | ConcurrentHashMap | 无锁读取，细粒度锁 |
| 读多写少 | CopyOnWriteArrayList | 读操作无锁 |
| 队列操作 | LinkedBlockingQueue | 高吞吐量 |
| 优先级队列 | PriorityBlockingQueue | 任务调度 |
| 延迟任务 | DelayQueue | 定时执行 |

**使用技巧**：
- 合理设置集合初始容量
- 避免频繁扩容
- 及时清理不再使用的集合

### 9.6 异步编程优化

**CompletableFuture 优化**：
```java
// 并行执行任务
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
    // 任务1
    return "result1";
}, executor);

CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
    // 任务2
    return "result2";
}, executor);

// 组合结果
CompletableFuture<String> combined = future1.thenCombine(future2, (r1, r2) -> r1 + r2);

// 异常处理
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    if (true) throw new RuntimeException("Error");
    return "result";
}).exceptionally(ex -> {
    System.err.println("Error: " + ex.getMessage());
    return "default";
});
```

**异步编程最佳实践**：
- 使用自定义线程池
- 合理设置超时
- 正确处理异常
- 避免回调地狱

### 9.7 性能测试与分析

**性能测试工具**：
- **JMH**：Java Microbenchmark Harness
- **VisualVM**：性能分析工具
- **JProfiler**：专业性能分析工具
- **YourKit**：Java 性能分析工具

**性能分析指标**：
- 吞吐量
- 响应时间
- CPU利用率
- 内存使用
- 锁竞争
- 线程状态

**性能调优步骤**：
1. **建立基准**：测量当前性能
2. **识别瓶颈**：使用分析工具找出瓶颈
3. **实施优化**：应用优化策略
4. **验证结果**：测量优化后的性能
5. **持续监控**：监控生产环境性能

### 9.8 实战案例：高并发计数器

**传统实现**：
```java
class TraditionalCounter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}
```

**优化实现**：
```java
class OptimizedCounter {
    private final LongAdder counter = new LongAdder();
    
    public void increment() {
        counter.increment();
    }
    
    public long getCount() {
        return counter.sum();
    }
}
```

**性能对比**：
- 10线程并发：LongAdder 比 synchronized 快 5-10 倍
- 100线程并发：LongAdder 比 synchronized 快 20-50 倍

---

## 10. 高级并发模式与案例

### 10.1 并发设计模式

**常见并发模式**：
- **生产者-消费者模式**：解耦生产者和消费者
- **读写分离模式**：提高读操作性能
- **线程池模式**：管理线程资源
- **Future模式**：异步任务处理
- **Master-Worker模式**：任务分解与结果合并
- **ThreadLocal模式**：线程本地存储

### 10.2 生产者-消费者模式

**实现方式**：
- **BlockingQueue**：最常用的实现
- **wait/notify**：传统实现
- **信号量**：手动控制

**示例**：
```java
// 使用 BlockingQueue 实现
BlockingQueue<Task> queue = new LinkedBlockingQueue<>();

// 生产者
class Producer implements Runnable {
    @Override
    public void run() {
        while (!Thread.interrupted()) {
            Task task = createTask();
            try {
                queue.put(task);
                System.out.println("Produced: " + task);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}

// 消费者
class Consumer implements Runnable {
    @Override
    public void run() {
        while (!Thread.interrupted()) {
            try {
                Task task = queue.take();
                processTask(task);
                System.out.println("Consumed: " + task);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

### 10.3 Master-Worker模式

**实现方式**：
- Master 负责任务分解和结果合并
- Worker 负责执行子任务
- 使用 ForkJoinPool 或线程池

**示例**：
```java
class Master {
    private final ExecutorService executor;
    private final List<Future<Result>> futures = new ArrayList<>();
    
    public Master(int workerCount) {
        this.executor = Executors.newFixedThreadPool(workerCount);
    }
    
    public void submit(Task task) {
        Future<Result> future = executor.submit(() -> {
            // 执行子任务
            return processTask(task);
        });
        futures.add(future);
    }
    
    public List<Result> getResults() {
        List<Result> results = new ArrayList<>();
        for (Future<Result> future : futures) {
            try {
                results.add(future.get());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return results;
    }
    
    public void shutdown() {
        executor.shutdown();
    }
}
```

### 10.4 异步编程模式

**CompletableFuture 链式操作**：
```java
CompletableFuture.supplyAsync(() -> {
    // 第一步：获取数据
    return fetchData();
}).thenApply(data -> {
    // 第二步：处理数据
    return processData(data);
}).thenAccept(result -> {
    // 第三步：使用结果
    System.out.println("Result: " + result);
}).exceptionally(ex -> {
    // 异常处理
    System.err.println("Error: " + ex.getMessage());
    return null;
});
```

**组合多个异步任务**：
```java
// 并行执行
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

// 等待所有完成
CompletableFuture<Void> allOf = CompletableFuture.allOf(future1, future2);

// 获取所有结果
allOf.thenRun(() -> {
    try {
        String result1 = future1.get();
        String result2 = future2.get();
        System.out.println(result1 + " " + result2);
    } catch (Exception e) {
        e.printStackTrace();
    }
});
```

### 10.5 实战案例：分布式任务调度

**设计思路**：
- 使用线程池处理任务
- 使用阻塞队列存储任务
- 使用 Redis 或 ZooKeeper 实现分布式协调
- 支持任务优先级和重试机制

**核心代码**：
```java
public class TaskScheduler {
    private final ExecutorService executor;
    private final BlockingQueue<ScheduledTask> queue;
    private final AtomicInteger taskIdGenerator = new AtomicInteger(0);
    
    public TaskScheduler(int poolSize) {
        this.executor = new ThreadPoolExecutor(
            poolSize, poolSize, 0, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>()
        );
        this.queue = new PriorityBlockingQueue<>(100, Comparator.comparingInt(ScheduledTask::getPriority));
        
        // 启动调度线程
        new Thread(this::processTasks).start();
    }
    
    public int schedule(Task task, int priority) {
        int taskId = taskIdGenerator.incrementAndGet();
        ScheduledTask scheduledTask = new ScheduledTask(taskId, task, priority);
        queue.offer(scheduledTask);
        return taskId;
    }
    
    private void processTasks() {
        while (!Thread.interrupted()) {
            try {
                ScheduledTask task = queue.take();
                executor.submit(() -> {
                    try {
                        task.getTask().execute();
                    } catch (Exception e) {
                        System.err.println("Task failed: " + e.getMessage());
                    }
                });
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    public void shutdown() {
        executor.shutdown();
    }
}
```

### 10.6 实战案例：高并发缓存

**设计思路**：
- 使用 ConcurrentHashMap 存储缓存
- 使用过期时间管理
- 使用读写锁提高并发性能
- 支持缓存预热和自动加载

**核心代码**：
```java
public class ConcurrentCache<K, V> {
    private final ConcurrentHashMap<K, CacheEntry<V>> cache = new ConcurrentHashMap<>();
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final long defaultExpiryTime;
    
    public ConcurrentCache(long defaultExpiryTime) {
        this.defaultExpiryTime = defaultExpiryTime;
        
        // 启动清理线程
        new Thread(this::cleanExpired).start();
    }
    
    public V get(K key) {
        rwLock.readLock().lock();
        try {
            CacheEntry<V> entry = cache.get(key);
            if (entry != null && !entry.isExpired()) {
                return entry.getValue();
            }
            return null;
        } finally {
            rwLock.readLock().unlock();
        }
    }
    
    public void put(K key, V value) {
        put(key, value, defaultExpiryTime);
    }
    
    public void put(K key, V value, long expiryTime) {
        rwLock.writeLock().lock();
        try {
            cache.put(key, new CacheEntry<>(value, System.currentTimeMillis() + expiryTime));
        } finally {
            rwLock.writeLock().unlock();
        }
    }
    
    private void cleanExpired() {
        while (true) {
            try {
                Thread.sleep(60000); // 每分钟清理一次
                rwLock.writeLock().lock();
                try {
                    long now = System.currentTimeMillis();
                    cache.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
                } finally {
                    rwLock.writeLock().unlock();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private static class CacheEntry<V> {
        private final V value;
        private final long expiryTime;
        
        public CacheEntry(V value, long expiryTime) {
            this.value = value;
            this.expiryTime = expiryTime;
        }
        
        public V getValue() {
            return value;
        }
        
        public boolean isExpired() {
            return isExpired(System.currentTimeMillis());
        }
        
        public boolean isExpired(long now) {
            return now > expiryTime;
        }
    }
}
```

---

## 11. 并发编程最佳实践总结

### 11.1 核心原则

**并发编程核心原则**：
1. **正确性**：确保多线程环境下的数据一致性
2. **性能**：充分利用多核CPU，提高系统吞吐量
3. **可靠性**：避免死锁、活锁等并发问题
4. **可维护性**：代码清晰易读，便于理解和维护
5. **安全性**：防止并发安全漏洞

### 11.2 最佳实践清单

**线程管理**：
- ✅ 使用线程池管理线程
- ✅ 合理设置线程池参数
- ✅ 正确关闭线程池
- ✅ 监控线程池状态

**同步机制**：
- ✅ 优先使用高级并发工具
- ✅ 最小化同步范围
- ✅ 选择合适的锁类型
- ✅ 避免死锁
- ✅ 合理使用 volatile

**并发集合**：
- ✅ 选择合适的并发集合
- ✅ 合理设置集合容量
- ✅ 避免频繁扩容
- ✅ 及时清理不再使用的集合

**原子操作**：
- ✅ 使用 Atomic 类进行原子操作
- ✅ 优先使用 LongAdder 进行计数
- ✅ 合理使用 AtomicReference 处理对象引用

**并发工具**：
- ✅ 选择合适的并发工具
- ✅ 合理设置超时
- ✅ 正确处理异常
- ✅ 监控工具状态

**性能优化**：
- ✅ 减少锁竞争
- ✅ 提高并行度
- ✅ 减少上下文切换
- ✅ 优化内存使用
- ✅ 合理使用并发工具

**异常处理**：
- ✅ 捕获 InterruptedException
- ✅ 恢复中断状态
- ✅ 正确处理线程池中的异常
- ✅ 监控并发异常

**监控与调优**：
- ✅ 监控锁竞争
- ✅ 分析线程状态
- ✅ 调整并发参数
- ✅ 持续监控性能

### 11.3 常见陷阱与避免方法

**常见陷阱**：
1. **竞态条件**：
   - 症状：数据不一致、计算错误
   - 避免：使用同步锁、原子类、并发集合

2. **死锁**：
   - 症状：线程相互等待，系统卡住
   - 避免：按顺序获取锁、使用 tryLock()、设置超时

3. **内存可见性**：
   - 症状：线程无法看到其他线程的修改
   - 避免：使用 volatile、同步锁、原子类

4. **线程安全集合使用不当**：
   - 症状：并发修改异常、数据不一致
   - 避免：选择合适的并发集合、正确使用

5. **线程池配置不当**：
   - 症状：任务积压、内存泄漏
   - 避免：合理配置线程池参数、监控线程池状态

6. **异常处理不当**：
   - 症状：线程意外终止、任务失败
   - 避免：正确处理 InterruptedException、监控异常

### 11.4 实战建议

**代码层面**：
- 优先使用高级并发工具
- 遵循最小化同步原则
- 编写清晰的并发代码
- 添加必要的注释和文档

**架构层面**：
- 合理设计并发架构
- 考虑系统的可扩展性
- 设计合理的故障恢复机制
- 确保系统的可靠性

**监控层面**：
- 监控线程状态和锁竞争
- 监控线程池状态
- 监控内存使用和GC
- 及时发现和解决并发问题

**测试层面**：
- 编写并发测试用例
- 模拟高并发场景
- 测试异常情况
- 验证系统的稳定性

### 11.5 学习资源推荐

**书籍**：
- 《Java并发编程实战》
- 《Java并发编程艺术》
- 《实战Java高并发程序设计》
- 《Java虚拟机并发编程》

**在线资源**：
- Java官方文档
- 并发编程网
- GitHub并发项目
- Stack Overflow并发问题

**工具**：
- JMH（性能测试）
- VisualVM（性能分析）
- JProfiler（专业分析）
- YourKit（Java分析）

---

## 12. 总结与展望

### 12.1 本章总结

**JUC 核心内容**：
- **线程基础**：线程创建、生命周期、线程安全
- **线程池**：线程池原理、参数配置、最佳实践
- **并发集合**：ConcurrentHashMap、CopyOnWriteArrayList、BlockingQueue
- **原子类**：AtomicInteger、LongAdder、AtomicReference
- **锁机制**：synchronized、ReentrantLock、ReadWriteLock、StampedLock
- **并发工具**：CountDownLatch、CyclicBarrier、Semaphore、Phaser
- **并发问题**：竞态条件、死锁、内存可见性
- **性能优化**：线程池优化、锁优化、内存优化
- **并发模式**：生产者-消费者、Master-Worker、异步编程

**关键技术点**：
- 线程安全的实现方法
- 并发工具的选择和使用
- 性能优化的策略和技巧
- 并发问题的识别和解决
- 实际项目中的并发设计

### 12.2 未来发展方向

**并发编程趋势**：
- **响应式编程**：使用 Reactor、RxJava 等响应式框架
- **虚拟线程**：Java 19+ 的虚拟线程（Project Loom）
- **分布式并发**：分布式系统中的并发协调
- **异步编程**：CompletableFuture、虚拟线程
- **AI 辅助**：AI 辅助并发编程和优化

**虚拟线程**：
- 轻量级线程，减少线程切换开销
- 简化并发编程模型
- 提高系统吞吐量
- 降低内存使用

**响应式编程**：
- 非阻塞式编程
- 背压处理
- 流式处理
- 高并发场景的理想选择

### 12.3 实践建议

**学习路径**：
1. 掌握基础：线程基础、同步机制
2. 学习工具：线程池、并发集合、原子类
3. 深入原理：锁机制、内存模型
4. 实践应用：并发模式、性能优化
5. 持续学习：新技术、新工具

**实践方法**：
- 编写并发测试用例
- 分析实际项目中的并发问题
- 参与开源项目的并发优化
- 阅读优秀的并发代码
- 持续监控和调优系统性能

**成长建议**：
- 培养并发思维
- 关注性能指标
- 学习系统设计
- 积累实战经验
- 分享和交流

---

**结语**：

并发编程是 Java 开发中的重要课题，掌握好并发编程不仅能提高系统性能，还能避免各种并发问题。通过本文的学习，相信你已经对 JUC 有了全面的了解，能够在实际项目中应用并发编程技术，构建高性能、高可靠性的系统。

记住，并发编程的核心是平衡正确性和性能，在保证系统正确性的前提下，通过合理的设计和优化，充分利用多核CPU的性能，构建高效、可靠的并发系统。

祝你在并发编程的道路上越走越远！

---

## 附录：大厂面试题库

### 一、八股文（25道）

**1. CAS 的底层实现原理是什么？如何解决 ABA 问题？**

**答案**：
CAS (Compare-And-Swap) 是一种无锁算法，通过硬件指令实现原子操作。CAS 包含三个操作数：内存值(V)、预期原值(A)、新值(B)。操作流程是：读取内存值 V，比较 V 与预期值 A 是否相等，如果相等则将 V 更新为新值 B，返回 true，否则返回 false。

**底层实现**：
- x86 架构：使用 `cmpxchg` 指令
- ARM 架构：使用 `LDREX` 和 `STREX` 指令
- Java 层面：通过 `sun.misc.Unsafe` 类调用本地方法

**ABA 问题**：值从 A 变为 B 又变回 A，CAS 操作无法检测到中间的变化。

**解决方案**：
1. **AtomicStampedReference**：添加版本号，每次修改版本号递增
2. **AtomicMarkableReference**：添加标记位，记录是否被修改过
3. **使用带时间戳的版本控制**：在业务层面添加时间戳

**2. AQS 的核心原理是什么？请详细说明其实现机制**

**答案**：
AQS (AbstractQueuedSynchronizer) 是 JUC 锁的基础框架，提供了基于 FIFO 等待队列的同步器。

**核心原理**：
1. **状态管理**：使用一个 volatile int 变量 state 表示同步状态
2. **等待队列**：双向链表结构，存储等待获取锁的线程
3. **节点状态**：CANCELLED(1)、SIGNAL(-1)、CONDITION(-2)、PROPAGATE(-3)、0

**实现机制**：
- **独占模式**：同一时间只有一个线程能持有锁（ReentrantLock）
- **共享模式**：多个线程可以同时持有锁（Semaphore、CountDownLatch）
- **获取锁**：tryAcquire 尝试获取，失败则加入等待队列
- **释放锁**：tryRelease 释放锁，唤醒后继节点

**3. synchronized 的锁升级过程是怎样的？请详细说明**

**答案**：
synchronized 的锁升级过程：无锁 → 偏向锁 → 轻量级锁 → 重量级锁

**详细过程**：
1. **无锁状态**：对象刚创建，没有任何线程访问
2. **偏向锁**：第一个线程访问时，将对象头偏向该线程
   - 优点：只有一个线程访问时，无锁开销
   - 缺点：多线程竞争时需要撤销偏向锁
3. **轻量级锁**：多个线程竞争时，升级为轻量级锁
   - 优点：避免线程阻塞，使用自旋
   - 缺点：自旋消耗 CPU
4. **重量级锁**：竞争激烈时，升级为重量级锁
   - 优点：避免 CPU 空转
   - 缺点：线程阻塞和唤醒开销大

**锁升级不可逆**：锁只能升级，不能降级。

**4. ConcurrentHashMap 在 JDK 1.7 和 JDK 1.8 中的实现有什么区别？**

**答案**：

**JDK 1.7 实现**：
- 使用分段锁（Segment）
- 每个 Segment 是一个 ReentrantLock
- 每个 Segment 包含多个 HashEntry
- 并发度等于 Segment 数量（默认 16）

**JDK 1.8 实现**：
- 使用 CAS + synchronized
- 取消了 Segment 分段锁
- 使用 Node 数组 + 链表 + 红黑树
- 当链表长度 > 8 且数组长度 > 64 时，转换为红黑树
- 锁粒度更细，只锁住当前节点

**对比**：
- JDK 1.8 性能更好，锁粒度更细
- JDK 1.8 内存占用更少
- JDK 1.8 在高并发场景下表现更好

**5. 线程池的核心参数有哪些？如何根据业务场景进行调优？**

**答案**：
线程池核心参数：
1. **corePoolSize**：核心线程数，线程池保持的最小线程数
2. **maximumPoolSize**：最大线程数，线程池允许的最大线程数
3. **keepAliveTime**：非核心线程的存活时间
4. **unit**：keepAliveTime 的时间单位
5. **workQueue**：工作队列，用于存储等待执行的任务
6. **threadFactory**：线程工厂，用于创建线程
7. **handler**：拒绝策略，当任务无法处理时的处理方式

**调优策略**：
- **CPU 密集型**：corePoolSize = CPU核心数 + 1
- **IO 密集型**：corePoolSize = CPU核心数 × 2
- **混合型**：corePoolSize = CPU核心数 × (1 + IO等待时间/CPU处理时间)
- **队列大小**：有界队列设置为核心线程数的 2-4 倍
- **拒绝策略**：关键任务用 AbortPolicy，非关键任务用 CallerRunsPolicy

**6. ReentrantLock 和 synchronized 的区别是什么？如何选择？**

**答案**：

**区别**：
| 特性 | ReentrantLock | synchronized |
|-----|---------------|--------------|
| 可重入 | 是 | 是 |
| 可中断 | 是 | 否 |
| 可超时 | 是 | 否 |
| 公平性 | 可配置 | 非公平 |
| 条件变量 | 多个 | 一个 |
| 性能 | 高（竞争激烈时） | 中等 |
| 易用性 | 复杂 | 简单 |
| 自动释放 | 否 | 是 |

**选择原则**：
- **简单同步**：优先使用 synchronized
- **需要灵活性**：使用 ReentrantLock
- **需要公平锁**：使用 ReentrantLock
- **需要超时**：使用 ReentrantLock
- **需要多个条件变量**：使用 ReentrantLock

**7. volatile 关键字的作用是什么？它的实现原理是什么？**

**答案**：
volatile 关键字的作用：
1. **保证可见性**：一个线程修改了 volatile 变量，其他线程能立即看到
2. **禁止指令重排序**：禁止 JVM 和 CPU 对 volatile 变量进行指令重排序
3. **不保证原子性**：volatile 不保证复合操作的原子性

**实现原理**：
- **内存屏障**：JVM 在 volatile 变量读写操作前后插入内存屏障
- **Lock 前缀**：x86 架构使用 lock 前缀指令
- **MESI 协议**：CPU 缓存一致性协议，保证多核缓存一致性

**适用场景**：
- 状态标记
- 单例模式的双重检查锁定
- 读多写少的场景

**8. Java 内存模型（JMM）是什么？它解决了什么问题？**

**答案**：
JMM (Java Memory Model) 是 Java 虚拟机规范中定义的一种抽象概念，用于屏蔽不同硬件和操作系统的内存访问差异。

**JMM 解决的问题**：
1. **原子性**：保证操作不可分割
2. **可见性**：保证一个线程的修改对其他线程可见
3. **有序性**：保证指令执行的顺序

**JMM 的抽象**：
- **主内存**：所有线程共享的内存
- **工作内存**：每个线程独立的内存
- **线程间通信**：通过主内存进行

**happens-before 原则**：
- 程序顺序规则
- 监视器锁规则
- volatile 变量规则
- 线程启动规则
- 线程终止规则
- 线程中断规则
- 对象终结规则
- 传递性

**9. 什么是死锁？如何避免死锁？**

**答案**：
死锁是指两个或多个线程互相持有对方需要的资源，导致所有线程都无法继续执行。

**死锁的四个必要条件**：
1. **互斥条件**：资源不能被共享
2. **请求与保持条件**：线程持有资源并请求新资源
3. **不剥夺条件**：资源只能主动释放
4. **循环等待条件**：线程形成循环等待链

**避免死锁的方法**：
1. **破坏循环等待条件**：按顺序获取锁
2. **使用 tryLock()**：设置超时时间
3. **锁超时**：避免永久阻塞
4. **死锁检测**：使用 jstack 等工具检测
5. **减少锁的持有时间**：只在必要的代码段上加锁

**10. ThreadLocal 的原理是什么？如何避免内存泄漏？**

**答案**：
ThreadLocal 是线程本地变量，每个线程都有自己独立的副本，互不干扰。

**原理**：
- **ThreadLocalMap**：每个线程维护一个 ThreadLocalMap
- **弱引用**：ThreadLocalMap 的 key 是弱引用
- **线程隔离**：每个线程访问自己的 ThreadLocalMap

**内存泄漏原因**：
- ThreadLocalMap 的 key 是弱引用，但 value 是强引用
- 如果线程长时间不结束，value 不会被回收
- 线程池中的线程可能长时间不结束

**避免内存泄漏**：
1. **及时 remove**：使用完后调用 remove()
2. **使用 try-finally**：确保 remove() 被调用
3. **避免在 ThreadLocal 中存储大对象**
4. **使用弱引用包装 value**

**11. CompletableFuture 的原理是什么？如何实现异步编程？**

**答案**：
CompletableFuture 是 Java 8 引入的异步编程工具，支持链式操作和组合。

**原理**：
- **基于 Future**：继承自 Future 接口
- **回调机制**：支持回调函数
- **链式操作**：支持 thenApply、thenAccept 等链式操作
- **组合操作**：支持 thenCombine、allOf、anyOf 等组合操作

**异步编程实现**：
```java
CompletableFuture.supplyAsync(() -> {
    // 异步任务
    return "result";
}, executor).thenApply(result -> {
    // 处理结果
    return result + " processed";
}).thenAccept(result -> {
    // 使用结果
    System.out.println(result);
}).exceptionally(ex -> {
    // 异常处理
    return "default";
});
```

**12. ForkJoinPool 的工作原理是什么？**

**答案**：
ForkJoinPool 是 Java 7 引入的线程池，专门用于分治任务。

**工作原理**：
1. **工作窃取算法**：空闲线程主动窃取其他线程的任务
2. **双端队列**：每个线程维护一个双端队列
3. **分治任务**：大任务分解为小任务
4. **结果合并**：小任务的结果合并为大任务的结果

**ForkJoinTask**：
- **RecursiveTask**：有返回值的任务
- **RecursiveAction**：无返回值的任务
- **fork()**：异步执行子任务
- **join()**：等待子任务完成并获取结果

**适用场景**：
- 大型数据集处理
- 递归算法
- 分治任务
- 并行计算

**13. CountDownLatch 和 CyclicBarrier 的区别是什么？**

**答案**：

**CountDownLatch**：
- **一次性使用**：计数器减到 0 后不能重置
- **阻塞等待**：主线程等待其他线程完成
- **计数器**：只能递减，不能递增
- **适用场景**：等待多个任务完成

**CyclicBarrier**：
- **可重复使用**：计数器减到 0 后自动重置
- **循环同步**：支持多个阶段的同步
- **回调函数**：当所有线程到达屏障时执行
- **适用场景**：多阶段任务同步

**对比**：
| 特性 | CountDownLatch | CyclicBarrier |
|-----|---------------|---------------|
| 可重用性 | 一次性使用 | 可重复使用 |
| 重置 | 不可重置 | 自动重置 |
| 参与线程 | 只需等待计数器为0 | 所有线程都必须到达屏障 |
| 回调 | 不支持 | 支持 |
| 适用场景 | 等待任务完成 | 阶段任务同步 |

**14. Semaphore 的原理是什么？如何实现限流？**

**答案**：
Semaphore 是信号量，用于控制并发访问数量。

**原理**：
- **许可证**：维护一组许可证
- **获取许可证**：acquire() 获取许可证，如果没有则阻塞
- **释放许可证**：release() 释放许可证
- **公平性**：可配置公平/非公平模式

**限流实现**：
```java
Semaphore semaphore = new Semaphore(100); // 最多 100 个并发

public void processRequest() {
    try {
        semaphore.acquire(); // 获取许可证
        // 处理请求
    } finally {
        semaphore.release(); // 释放许可证
    }
}
```

**应用场景**：
- 数据库连接池
- API 限流
- 资源池管理
- 并发控制

**15. StampedLock 的原理是什么？如何实现乐观读？**

**答案**：
StampedLock 是 Java 8 引入的锁，支持乐观读，性能极高。

**原理**：
- **版本戳**：每次获取锁时返回一个版本戳
- **三种模式**：写锁、读锁、乐观读
- **不可重入**：不支持重入
- **乐观读**：无锁读取，使用版本戳验证

**乐观读实现**：
```java
StampedLock lock = new StampedLock();

// 乐观读
long stamp = lock.tryOptimisticRead();
// 读取操作
if (!lock.validate(stamp)) {
    // 乐观读失败，升级为读锁
    stamp = lock.readLock();
    try {
        // 重新读取操作
    } finally {
        lock.unlockRead(stamp);
    }
}
```

**适用场景**：
- 读极多写极少
- 读操作时间短
- 写操作频率低

**16. LongAdder 的原理是什么？为什么比 AtomicInteger 性能更好？**

**答案**：
LongAdder 是 Java 8 引入的累加器，高并发场景下性能比 AtomicInteger 更好。

**原理**：
- **分段累加**：将值分散到多个 Cell 中
- **减少竞争**：每个线程操作不同的 Cell
- **最终汇总**：sum() 时汇总所有 Cell 的值

**为什么性能更好**：
- **减少 CAS 失败率**：多个 Cell 减少竞争
- **高并发场景**：线程数越多，性能优势越明显
- **内存换性能**：使用更多内存换取更好性能

**适用场景**：
- 高并发计数器
- 统计场景
- 读多写少

**17. 什么是线程安全？如何保证线程安全？**

**答案**：
线程安全是指多个线程同时访问某个对象时，不需要额外的同步措施，也能保证数据的正确性。

**保证线程安全的方法**：
1. **不可变对象**：final 字段，不可变集合
2. **同步机制**：synchronized、ReentrantLock
3. **原子类**：AtomicInteger、AtomicReference
4. **并发集合**：ConcurrentHashMap、CopyOnWriteArrayList
5. **volatile**：保证可见性
6. **ThreadLocal**：线程本地变量

**线程安全的级别**：
- **不可变**：绝对线程安全（String、Integer）
- **绝对线程安全**：Vector、Hashtable
- **相对线程安全**：ConcurrentHashMap
- **线程兼容**：ArrayList、HashMap

**18. 什么是伪共享？如何避免伪共享？**

**答案**：
伪共享是指多个线程访问同一个缓存行的不同变量，导致缓存行失效，影响性能。

**原因**：
- **缓存行**：CPU 缓存的最小单位（通常 64 字节）
- **缓存一致性**：一个线程修改缓存行，其他线程的缓存行失效
- **性能影响**：频繁的缓存失效导致性能下降

**避免伪共享**：
1. **@Contended 注解**：Java 8 引入，避免伪共享
2. **字节填充**：在变量之间添加无用的字节
3. **缓存行对齐**：确保变量在不同的缓存行

**示例**：
```java
@sun.misc.Contended
static class Counter {
    volatile long value;
}
```

**19. 什么是指令重排序？如何避免指令重排序？**

**答案**：
指令重排序是指编译器和 CPU 为了优化性能，改变指令的执行顺序。

**重排序类型**：
1. **编译器重排序**：编译器优化
2. **CPU 重排序**：CPU 乱序执行
3. **内存系统重排序**：缓存和主内存的交互

**避免指令重排序**：
1. **volatile**：禁止指令重排序
2. **synchronized**：建立 happens-before 关系
3. **final**：final 字段的初始化安全
4. **内存屏障**：显式插入内存屏障

**示例**：
```java
// 双重检查锁定
private volatile Singleton instance;

public Singleton getInstance() {
    if (instance == null) {
        synchronized (this) {
            if (instance == null) {
                instance = new Singleton();
            }
        }
    }
    return instance;
}
```

**20. 什么是可见性？如何保证可见性？**

**答案**：
可见性是指一个线程修改了共享变量，其他线程能够立即看到修改后的值。

**保证可见性的方法**：
1. **volatile**：保证可见性
2. **synchronized**：释放锁时刷新到主内存，获取锁时从主内存读取
3. **final**：final 字段的初始化安全
4. **原子类**：Atomic 类保证可见性
5. **Lock 接口**：unlock() 时刷新到主内存

**可见性问题示例**：
```java
// 线程1
flag = true;

// 线程2
while (!flag) {
    // 可能永远循环
}
```

**解决方案**：
```java
private volatile boolean flag;
```

**21. 什么是原子性？如何保证原子性？**

**答案**：
原子性是指一个操作不可被中断，要么全部执行成功，要么全部不执行。

**保证原子性的方法**：
1. **synchronized**：保证代码块的原子性
2. **ReentrantLock**：保证代码块的原子性
3. **原子类**：Atomic 类的 CAS 操作
4. **数据库事务**：保证数据库操作的原子性

**原子性问题示例**：
```java
count++; // 不是原子操作
// 等价于
int temp = count;
temp = temp + 1;
count = temp;
```

**解决方案**：
```java
// 方案1：synchronized
public synchronized void increment() {
    count++;
}

// 方案2：AtomicInteger
private AtomicInteger count = new AtomicInteger(0);
public void increment() {
    count.incrementAndGet();
}
```

**22. 什么是有序性？如何保证有序性？**

**答案**：
有序性是指程序执行的顺序按照代码的顺序执行。

**保证有序性的方法**：
1. **volatile**：禁止指令重排序
2. **synchronized**：建立 happens-before 关系
3. **final**：final 字段的初始化安全
4. **内存屏障**：显式插入内存屏障

**happens-before 原则**：
- 程序顺序规则：同一个线程内，前面的操作 happens-before 后面的操作
- 监视器锁规则：unlock 操作 happens-before 同一个锁的 lock 操作
- volatile 变量规则：volatile 写操作 happens-before volatile 读操作
- 传递性：A happens-before B，B happens-before C，则 A happens-before C

**23. 什么是锁优化？JVM 有哪些锁优化技术？**

**答案**：
锁优化是指 JVM 为了提高锁的性能，对 synchronized 进行的各种优化。

**JVM 锁优化技术**：
1. **锁消除**：消除不可能发生竞争的锁
2. **锁粗化**：将多个小的同步代码块合并为一个大的
3. **偏向锁**：第一个线程访问时偏向该线程
4. **轻量级锁**：使用自旋避免线程阻塞
5. **适应性自旋**：根据历史情况调整自旋次数

**锁消除示例**：
```java
// 优化前
public void method() {
    StringBuffer sb = new StringBuffer();
    sb.append("Hello");
    sb.append("World");
}

// 优化后（JVM 自动优化）
public void method() {
    StringBuffer sb = new StringBuffer();
    sb.append("Hello"); // 不需要 synchronized
    sb.append("World"); // 不需要 synchronized
}
```

**锁粗化示例**：
```java
// 优化前
public void method() {
    synchronized (this) {
        count++;
    }
    synchronized (this) {
        count++;
    }
}

// 优化后（JVM 自动优化）
public void method() {
    synchronized (this) {
        count++;
        count++;
    }
}
```

**24. 什么是线程池的拒绝策略？如何选择合适的拒绝策略？**

**答案**：
线程池的拒绝策略是指当任务无法处理时的处理方式。

**JUC 提供的拒绝策略**：
1. **AbortPolicy**：抛出 RejectedExecutionException
2. **CallerRunsPolicy**：调用者线程执行任务
3. **DiscardPolicy**：静默丢弃任务
4. **DiscardOldestPolicy**：丢弃队列最老任务

**选择原则**：
- **关键任务**：AbortPolicy，确保任务不丢失
- **任务不紧急**：CallerRunsPolicy，降级处理
- **非关键任务**：DiscardPolicy，允许任务丢失
- **任务有时间性**：DiscardOldestPolicy，丢弃旧任务
- **特殊需求**：自定义拒绝策略

**自定义拒绝策略示例**：
```java
public class CustomRejectedExecutionHandler implements RejectedExecutionHandler {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 自定义处理逻辑
        System.err.println("Task rejected: " + r);
        // 可以记录日志、发送告警等
    }
}
```

**25. 什么是线程池的监控指标？如何监控线程池？**

**答案**：
线程池的监控指标是指用于评估线程池健康状况和性能的指标。

**核心监控指标**：
1. **活跃线程数**：当前正在执行任务的线程数
2. **队列大小**：等待执行的任务数
3. **完成任务数**：已完成的任务总数
4. **拒绝任务数**：被拒绝的任务数
5. **线程池饱和度**：活跃线程数 / 最大线程数
6. **任务执行时间**：任务平均执行时间

**监控实现**：
```java
public class ThreadPoolMonitor {
    private final ThreadPoolExecutor executor;
    
    public void printMetrics() {
        System.out.println("=== 线程池监控指标 ===");
        System.out.println("核心线程数: " + executor.getCorePoolSize());
        System.out.println("最大线程数: " + executor.getMaximumPoolSize());
        System.out.println("当前线程数: " + executor.getPoolSize());
        System.out.println("活跃线程数: " + executor.getActiveCount());
        System.out.println("队列大小: " + executor.getQueue().size());
        System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
        System.out.println("总任务数: " + executor.getTaskCount());
        System.out.println("线程池饱和度: " + getSaturation() + "%");
    }
    
    public double getSaturation() {
        int activeCount = executor.getActiveCount();
        int maxPoolSize = executor.getMaximumPoolSize();
        return (double) activeCount / maxPoolSize * 100;
    }
}
```

**告警阈值**：
- 队列大小 > 100：警告
- 线程池饱和度 > 80%：警告
- 拒绝任务数 > 0：严重告警

---

### 二、场景题（15道）

**1. 设计一个高并发计数器，要求支持高并发读写，性能最优。**

**答案**：
使用 LongAdder 实现高并发计数器，LongAdder 在高并发场景下性能比 AtomicInteger 更好。

**实现**：
```java
public class HighConcurrencyCounter {
    private final LongAdder counter = new LongAdder();
    
    public void increment() {
        counter.increment();
    }
    
    public void add(long value) {
        counter.add(value);
    }
    
    public long getCount() {
        return counter.sum();
    }
    
    public long reset() {
        return counter.sumThenReset();
    }
}
```

**为什么选择 LongAdder**：
- **分段累加**：将值分散到多个 Cell 中，减少竞争
- **高并发性能**：线程数越多，性能优势越明显
- **内存换性能**：使用更多内存换取更好性能

**性能对比**：
- 10 线程并发：LongAdder 比 synchronized 快 5-10 倍
- 100 线程并发：LongAdder 比 synchronized 快 20-50 倍

**2. 设计一个高并发缓存系统，要求支持过期时间、高并发读写、自动清理。**

**答案**：
使用 ConcurrentHashMap + ReadWriteLock 实现高并发缓存系统。

**实现**：
```java
public class ConcurrentCache<K, V> {
    private final ConcurrentHashMap<K, CacheEntry<V>> cache = new ConcurrentHashMap<>();
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final long defaultExpiryTime;
    
    public ConcurrentCache(long defaultExpiryTime) {
        this.defaultExpiryTime = defaultExpiryTime;
        
        // 启动清理线程
        new Thread(this::cleanExpired).start();
    }
    
    public V get(K key) {
        rwLock.readLock().lock();
        try {
            CacheEntry<V> entry = cache.get(key);
            if (entry != null && !entry.isExpired()) {
                return entry.getValue();
            }
            return null;
        } finally {
            rwLock.readLock().unlock();
        }
    }
    
    public void put(K key, V value) {
        put(key, value, defaultExpiryTime);
    }
    
    public void put(K key, V value, long expiryTime) {
        rwLock.writeLock().lock();
        try {
            cache.put(key, new CacheEntry<>(value, System.currentTimeMillis() + expiryTime));
        } finally {
            rwLock.writeLock().unlock();
        }
    }
    
    private void cleanExpired() {
        while (true) {
            try {
                Thread.sleep(60000); // 每分钟清理一次
                rwLock.writeLock().lock();
                try {
                    long now = System.currentTimeMillis();
                    cache.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
                } finally {
                    rwLock.writeLock().unlock();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private static class CacheEntry<V> {
        private final V value;
        private final long expiryTime;
        
        public CacheEntry(V value, long expiryTime) {
            this.value = value;
            this.expiryTime = expiryTime;
        }
        
        public V getValue() {
            return value;
        }
        
        public boolean isExpired() {
            return isExpired(System.currentTimeMillis());
        }
        
        public boolean isExpired(long now) {
            return now > expiryTime;
        }
    }
}
```

**设计要点**：
- **高并发读写**：使用 ReadWriteLock，读操作无锁
- **过期时间**：每个缓存项有过期时间
- **自动清理**：后台线程定期清理过期缓存
- **线程安全**：使用 ConcurrentHashMap 保证线程安全

**3. 设计一个限流系统，要求支持动态调整限流阈值、高并发访问。**

**答案**：
使用 Semaphore 实现限流系统，支持动态调整限流阈值。

**实现**：
```java
public class RateLimiter {
    private volatile Semaphore semaphore;
    private final AtomicInteger permits = new AtomicInteger(0);
    
    public RateLimiter(int maxPermits) {
        this.semaphore = new Semaphore(maxPermits);
        this.permits.set(maxPermits);
    }
    
    public void updatePermits(int newPermits) {
        int oldPermits = permits.get();
        if (newPermits != oldPermits) {
            Semaphore newSemaphore = new Semaphore(newPermits);
            Semaphore oldSemaphore = this.semaphore;
            this.semaphore = newSemaphore;
            this.permits.set(newPermits);
            
            // 释放旧的 semaphore
            oldSemaphore.release(oldPermits);
        }
    }
    
    public boolean tryAcquire() {
        return semaphore.tryAcquire();
    }
    
    public boolean tryAcquire(long timeout, TimeUnit unit) throws InterruptedException {
        return semaphore.tryAcquire(timeout, unit);
    }
    
    public void acquire() throws InterruptedException {
        semaphore.acquire();
    }
    
    public void release() {
        semaphore.release();
    }
    
    public int getAvailablePermits() {
        return semaphore.availablePermits();
    }
    
    public int getCurrentPermits() {
        return permits.get();
    }
}
```

**使用示例**：
```java
RateLimiter rateLimiter = new RateLimiter(100);

// 限流
public void processRequest() {
    if (rateLimiter.tryAcquire()) {
        try {
            // 处理请求
        } finally {
            rateLimiter.release();
        }
    } else {
        // 限流，拒绝请求
        throw new RateLimitExceededException();
    }
}

// 动态调整限流阈值
rateLimiter.updatePermits(200);
```

**设计要点**：
- **动态调整**：支持动态调整限流阈值
- **高并发**：使用 Semaphore 实现高并发限流
- **线程安全**：使用 volatile 保证可见性
- **原子操作**：使用 AtomicInteger 保证原子性

**4. 设计一个分布式任务调度系统，要求支持任务优先级、重试机制、任务监控。**

**答案**：
使用线程池 + 优先级队列实现分布式任务调度系统。

**实现**：
```java
public class DistributedTaskScheduler {
    private final ThreadPoolExecutor executor;
    private final PriorityBlockingQueue<ScheduledTask> queue;
    private final AtomicInteger taskIdGenerator = new AtomicInteger(0);
    private final ConcurrentHashMap<Integer, TaskStatus> taskStatusMap = new ConcurrentHashMap<>();
    
    public DistributedTaskScheduler(int poolSize) {
        this.executor = new ThreadPoolExecutor(
            poolSize, poolSize, 0, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>()
        );
        this.queue = new PriorityBlockingQueue<>(100, Comparator.comparingInt(ScheduledTask::getPriority));
        
        // 启动调度线程
        new Thread(this::processTasks).start();
        
        // 启动监控线程
        new Thread(this::monitorTasks).start();
    }
    
    public int schedule(Task task, int priority, int maxRetries) {
        int taskId = taskIdGenerator.incrementAndGet();
        ScheduledTask scheduledTask = new ScheduledTask(taskId, task, priority, maxRetries);
        queue.offer(scheduledTask);
        taskStatusMap.put(taskId, TaskStatus.PENDING);
        return taskId;
    }
    
    private void processTasks() {
        while (!Thread.interrupted()) {
            try {
                ScheduledTask task = queue.take();
                executor.submit(() -> {
                    try {
                        task.getTask().execute();
                        taskStatusMap.put(task.getTaskId(), TaskStatus.SUCCESS);
                    } catch (Exception e) {
                        if (task.getRetryCount() < task.getMaxRetries()) {
                            task.incrementRetryCount();
                            queue.offer(task);
                            taskStatusMap.put(task.getTaskId(), TaskStatus.RETRYING);
                        } else {
                            taskStatusMap.put(task.getTaskId(), TaskStatus.FAILED);
                        }
                    }
                });
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private void monitorTasks() {
        while (!Thread.interrupted()) {
            try {
                Thread.sleep(10000); // 每10秒监控一次
                printTaskStatus();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private void printTaskStatus() {
        Map<TaskStatus, Long> statusCount = taskStatusMap.values().stream()
            .collect(Collectors.groupingBy(status -> status, Collectors.counting()));
        
        System.out.println("=== 任务状态监控 ===");
        statusCount.forEach((status, count) -> {
            System.out.println(status + ": " + count);
        });
    }
    
    public void shutdown() {
        executor.shutdown();
    }
    
    enum TaskStatus {
        PENDING, RUNNING, SUCCESS, FAILED, RETRYING
    }
    
    static class ScheduledTask {
        private final int taskId;
        private final Task task;
        private final int priority;
        private final int maxRetries;
        private int retryCount = 0;
        
        public ScheduledTask(int taskId, Task task, int priority, int maxRetries) {
            this.taskId = taskId;
            this.task = task;
            this.priority = priority;
            this.maxRetries = maxRetries;
        }
        
        public int getTaskId() {
            return taskId;
        }
        
        public Task getTask() {
            return task;
        }
        
        public int getPriority() {
            return priority;
        }
        
        public int getMaxRetries() {
            return maxRetries;
        }
        
        public int getRetryCount() {
            return retryCount;
        }
        
        public void incrementRetryCount() {
            retryCount++;
        }
    }
    
    interface Task {
        void execute();
    }
}
```

**设计要点**：
- **任务优先级**：使用 PriorityBlockingQueue 支持任务优先级
- **重试机制**：支持任务重试，可配置最大重试次数
- **任务监控**：监控任务状态，及时发现异常
- **高并发**：使用线程池处理任务
- **线程安全**：使用 ConcurrentHashMap 保证线程安全

**5. 设计一个生产者-消费者系统，要求支持多个生产者、多个消费者、高并发。**

**答案**：
使用 BlockingQueue 实现生产者-消费者系统。

**实现**：
```java
public class ProducerConsumerSystem<T> {
    private final BlockingQueue<T> queue;
    private final List<Thread> producerThreads = new ArrayList<>();
    private final List<Thread> consumerThreads = new ArrayList<>();
    
    public ProducerConsumerSystem(int queueSize, int producerCount, int consumerCount) {
        this.queue = new LinkedBlockingQueue<>(queueSize);
        
        // 创建生产者线程
        for (int i = 0; i < producerCount; i++) {
            Thread producerThread = new Thread(new Producer(i));
            producerThreads.add(producerThread);
        }
        
        // 创建消费者线程
        for (int i = 0; i < consumerCount; i++) {
            Thread consumerThread = new Thread(new Consumer(i));
            consumerThreads.add(consumerThread);
        }
    }
    
    public void start() {
        // 启动生产者线程
        producerThreads.forEach(Thread::start);
        
        // 启动消费者线程
        consumerThreads.forEach(Thread::start);
    }
    
    public void shutdown() {
        // 停止生产者线程
        producerThreads.forEach(Thread::interrupt);
        
        // 停止消费者线程
        consumerThreads.forEach(Thread::interrupt);
    }
    
    class Producer implements Runnable {
        private final int producerId;
        
        public Producer(int producerId) {
            this.producerId = producerId;
        }
        
        @Override
        public void run() {
            while (!Thread.interrupted()) {
                try {
                    T item = produceItem();
                    queue.put(item);
                    System.out.println("Producer " + producerId + " produced: " + item);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        
        private T produceItem() {
            // 生产逻辑
            return null;
        }
    }
    
    class Consumer implements Runnable {
        private final int consumerId;
        
        public Consumer(int consumerId) {
            this.consumerId = consumerId;
        }
        
        @Override
        public void run() {
            while (!Thread.interrupted()) {
                try {
                    T item = queue.take();
                    consumeItem(item);
                    System.out.println("Consumer " + consumerId + " consumed: " + item);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        
        private void consumeItem(T item) {
            // 消费逻辑
        }
    }
}
```

**设计要点**：
- **多个生产者**：支持多个生产者线程
- **多个消费者**：支持多个消费者线程
- **高并发**：使用 BlockingQueue 实现高并发
- **线程安全**：BlockingQueue 保证线程安全
- **优雅关闭**：支持优雅关闭

**6. 设计一个并发安全的数据结构，要求支持高并发读写、无锁读取。**

**答案**：
使用 CopyOnWriteArrayList 实现并发安全的数据结构。

**实现**：
```java
public class ConcurrentSafeList<T> {
    private final CopyOnWriteArrayList<T> list = new CopyOnWriteArrayList<>();
    
    public void add(T item) {
        list.add(item);
    }
    
    public void remove(T item) {
        list.remove(item);
    }
    
    public T get(int index) {
        return list.get(index);
    }
    
    public List<T> getAll() {
        return new ArrayList<>(list);
    }
    
    public int size() {
        return list.size();
    }
    
    public boolean contains(T item) {
        return list.contains(item);
    }
    
    public Iterator<T> iterator() {
        return list.iterator();
    }
}
```

**为什么选择 CopyOnWriteArrayList**：
- **读无锁**：读操作不需要加锁，性能高
- **写时复制**：写操作时创建新数组，不影响读操作
- **线程安全**：内置线程安全机制
- **弱一致性**：迭代器是快照，不反映后续修改

**适用场景**：
- 读操作远多于写操作
- 数据量不大
- 对实时性要求不高

**7. 设计一个并发安全的 Map，要求支持高并发读写、原子操作。**

**答案**：
使用 ConcurrentHashMap 实现并发安全的 Map。

**实现**：
```java
public class ConcurrentSafeMap<K, V> {
    private final ConcurrentHashMap<K, V> map = new ConcurrentHashMap<>();
    
    public void put(K key, V value) {
        map.put(key, value);
    }
    
    public V get(K key) {
        return map.get(key);
    }
    
    public V remove(K key) {
        return map.remove(key);
    }
    
    public boolean containsKey(K key) {
        return map.containsKey(key);
    }
    
    public int size() {
        return map.size();
    }
    
    public void clear() {
        map.clear();
    }
    
    // 原子操作
    public V putIfAbsent(K key, V value) {
        return map.putIfAbsent(key, value);
    }
    
    public boolean remove(K key, V value) {
        return map.remove(key, value);
    }
    
    public boolean replace(K key, V oldValue, V newValue) {
        return map.replace(key, oldValue, newValue);
    }
    
    public V computeIfAbsent(K key, Function<? super K, ? extends V> mappingFunction) {
        return map.computeIfAbsent(key, mappingFunction);
    }
    
    public V computeIfPresent(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction) {
        return map.computeIfPresent(key, remappingFunction);
    }
    
    public V compute(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction) {
        return map.compute(key, remappingFunction);
    }
    
    public V merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> remappingFunction) {
        return map.merge(key, value, remappingFunction);
    }
}
```

**为什么选择 ConcurrentHashMap**：
- **高并发读写**：支持高并发读写
- **无锁读取**：读操作不需要加锁
- **细粒度锁**：JDK 1.8+ 使用 CAS + synchronized
- **原子操作**：支持原子操作
- **高性能**：高并发场景下性能优异

**8. 设计一个并发安全的队列，要求支持高并发读写、阻塞操作。**

**答案**：
使用 LinkedBlockingQueue 实现并发安全的队列。

**实现**：
```java
public class ConcurrentSafeQueue<T> {
    private final BlockingQueue<T> queue;
    
    public ConcurrentSafeQueue(int capacity) {
        this.queue = new LinkedBlockingQueue<>(capacity);
    }
    
    public void put(T item) throws InterruptedException {
        queue.put(item);
    }
    
    public boolean offer(T item) {
        return queue.offer(item);
    }
    
    public boolean offer(T item, long timeout, TimeUnit unit) throws InterruptedException {
        return queue.offer(item, timeout, unit);
    }
    
    public T take() throws InterruptedException {
        return queue.take();
    }
    
    public T poll() {
        return queue.poll();
    }
    
    public T poll(long timeout, TimeUnit unit) throws InterruptedException {
        return queue.poll(timeout, unit);
    }
    
    public int size() {
        return queue.size();
    }
    
    public boolean isEmpty() {
        return queue.isEmpty();
    }
    
    public boolean contains(T item) {
        return queue.contains(item);
    }
    
    public void clear() {
        queue.clear();
    }
}
```

**为什么选择 LinkedBlockingQueue**：
- **高并发读写**：支持高并发读写
- **阻塞操作**：支持阻塞的 put 和 take 操作
- **可选容量**：可以设置队列容量
- **线程安全**：内置线程安全机制
- **FIFO**：先进先出

**9. 设计一个并发安全的 Set，要求支持高并发读写、原子操作。**

**答案**：
使用 ConcurrentHashMap 的 KeySet 实现并发安全的 Set。

**实现**：
```java
public class ConcurrentSafeSet<T> {
    private final ConcurrentHashMap<T, Boolean> map = new ConcurrentHashMap<>();
    
    public boolean add(T item) {
        return map.putIfAbsent(item, Boolean.TRUE) == null;
    }
    
    public boolean remove(T item) {
        return map.remove(item) != null;
    }
    
    public boolean contains(T item) {
        return map.containsKey(item);
    }
    
    public int size() {
        return map.size();
    }
    
    public boolean isEmpty() {
        return map.isEmpty();
    }
    
    public void clear() {
        map.clear();
    }
    
    public Iterator<T> iterator() {
        return map.keySet().iterator();
    }
    
    public Stream<T> stream() {
        return map.keySet().stream();
    }
}
```

**为什么选择 ConcurrentHashMap**：
- **高并发读写**：支持高并发读写
- **无锁读取**：读操作不需要加锁
- **原子操作**：支持原子操作
- **高性能**：高并发场景下性能优异

**10. 设计一个并发安全的计数器，要求支持高并发、分段计数、性能最优。**

**答案**：
使用 LongAdder 实现并发安全的计数器。

**实现**：
```java
public class ConcurrentSafeCounter {
    private final LongAdder counter = new LongAdder();
    
    public void increment() {
        counter.increment();
    }
    
    public void decrement() {
        counter.add(-1);
    }
    
    public void add(long value) {
        counter.add(value);
    }
    
    public long get() {
        return counter.sum();
    }
    
    public long reset() {
        return counter.sumThenReset();
    }
}
```

**为什么选择 LongAdder**：
- **分段计数**：将值分散到多个 Cell 中，减少竞争
- **高并发性能**：线程数越多，性能优势越明显
- **内存换性能**：使用更多内存换取更好性能

**11. 设计一个并发安全的原子引用，要求支持版本号、解决 ABA 问题。**

**答案**：
使用 AtomicStampedReference 实现并发安全的原子引用。

**实现**：
```java
public class ConcurrentSafeReference<T> {
    private final AtomicStampedReference<T> ref;
    
    public ConcurrentSafeReference(T initialValue) {
        this.ref = new AtomicStampedReference<>(initialValue, 0);
    }
    
    public T get() {
        return ref.getReference();
    }
    
    public int getStamp() {
        return ref.getStamp();
    }
    
    public void set(T newValue) {
        int stamp = ref.getStamp();
        ref.set(newValue, stamp + 1);
    }
    
    public boolean compareAndSet(T expectedReference, T newReference, int expectedStamp, int newStamp) {
        return ref.compareAndSet(expectedReference, newReference, expectedStamp, newStamp);
    }
    
    public boolean attemptUpdate(T expectedReference, T newReference) {
        while (true) {
            int stamp = ref.getStamp();
            if (ref.getReference() != expectedReference) {
                return false;
            }
            if (ref.compareAndSet(expectedReference, newReference, stamp, stamp + 1)) {
                return true;
            }
        }
    }
}
```

**为什么选择 AtomicStampedReference**：
- **版本号**：每次修改版本号递增
- **解决 ABA 问题**：通过版本号检测 ABA 问题
- **原子操作**：支持原子操作
- **线程安全**：内置线程安全机制

**12. 设计一个并发安全的锁，要求支持可重入、可中断、可超时。**

**答案**：
使用 ReentrantLock 实现并发安全的锁。

**实现**：
```java
public class ConcurrentSafeLock {
    private final ReentrantLock lock;
    
    public ConcurrentSafeLock() {
        this.lock = new ReentrantLock();
    }
    
    public ConcurrentSafeLock(boolean fair) {
        this.lock = new ReentrantLock(fair);
    }
    
    public void lock() {
        lock.lock();
    }
    
    public void unlock() {
        lock.unlock();
    }
    
    public boolean tryLock() {
        return lock.tryLock();
    }
    
    public boolean tryLock(long timeout, TimeUnit unit) throws InterruptedException {
        return lock.tryLock(timeout, unit);
    }
    
    public void lockInterruptibly() throws InterruptedException {
        lock.lockInterruptibly();
    }
    
    public Condition newCondition() {
        return lock.newCondition();
    }
    
    public boolean isLocked() {
        return lock.isLocked();
    }
    
    public boolean isHeldByCurrentThread() {
        return lock.isHeldByCurrentThread();
    }
    
    public int getQueueLength() {
        return lock.getQueueLength();
    }
    
    public boolean hasQueuedThreads() {
        return lock.hasQueuedThreads();
    }
}
```

**为什么选择 ReentrantLock**：
- **可重入**：同一线程可多次获取同一把锁
- **可中断**：支持响应中断
- **可超时**：支持设置获取锁的超时时间
- **公平性**：可配置公平/非公平模式
- **条件变量**：支持多个条件变量

**13. 设计一个并发安全的读写锁，要求支持读多写少、高并发读。**

**答案**：
使用 ReadWriteLock 实现并发安全的读写锁。

**实现**：
```java
public class ConcurrentSafeReadWriteLock {
    private final ReadWriteLock rwLock;
    private final Lock readLock;
    private final Lock writeLock;
    
    public ConcurrentSafeReadWriteLock() {
        this.rwLock = new ReentrantReadWriteLock();
        this.readLock = rwLock.readLock();
        this.writeLock = rwLock.writeLock();
    }
    
    public ConcurrentSafeReadWriteLock(boolean fair) {
        this.rwLock = new ReentrantReadWriteLock(fair);
        this.readLock = rwLock.readLock();
        this.writeLock = rwLock.writeLock();
    }
    
    public void readLock() {
        readLock.lock();
    }
    
    public void readUnlock() {
        readLock.unlock();
    }
    
    public boolean tryReadLock() {
        return readLock.tryLock();
    }
    
    public boolean tryReadLock(long timeout, TimeUnit unit) throws InterruptedException {
        return readLock.tryLock(timeout, unit);
    }
    
    public void writeLock() {
        writeLock.lock();
    }
    
    public void writeUnlock() {
        writeLock.unlock();
    }
    
    public boolean tryWriteLock() {
        return writeLock.tryLock();
    }
    
    public boolean tryWriteLock(long timeout, TimeUnit unit) throws InterruptedException {
        return writeLock.tryLock(timeout, unit);
    }
}
```

**为什么选择 ReadWriteLock**：
- **读多写少**：多个读线程可以同时持有读锁
- **高并发读**：读操作性能高
- **互斥写**：写线程与其他线程互斥
- **可重入**：支持重入

**14. 设计一个并发安全的乐观锁，要求支持版本号、无锁读取。**

**答案**：
使用 StampedLock 实现并发安全的乐观锁。

**实现**：
```java
public class ConcurrentSafeOptimisticLock<T> {
    private final StampedLock lock;
    private volatile T value;
    
    public ConcurrentSafeOptimisticLock(T initialValue) {
        this.lock = new StampedLock();
        this.value = initialValue;
    }
    
    public T read() {
        long stamp = lock.tryOptimisticRead();
        T currentValue = value;
        if (!lock.validate(stamp)) {
            // 乐观读失败，升级为读锁
            stamp = lock.readLock();
            try {
                currentValue = value;
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return currentValue;
    }
    
    public void write(T newValue) {
        long stamp = lock.writeLock();
        try {
            value = newValue;
        } finally {
            lock.unlockWrite(stamp);
        }
    }
    
    public T get() {
        return value;
    }
}
```

**为什么选择 StampedLock**：
- **乐观读**：无锁读取，性能极高
- **版本号**：每次获取锁时返回一个版本戳
- **高性能**：读极多写极少场景下性能极高
- **不可重入**：不支持重入

**15. 设计一个并发安全的线程池，要求支持动态调整、监控告警、优雅关闭。**

**答案**：
使用 ThreadPoolExecutor 实现并发安全的线程池。

**实现**：
```java
public class ConcurrentSafeThreadPool {
    private final ThreadPoolExecutor executor;
    private final ScheduledExecutorService monitorExecutor;
    
    public ConcurrentSafeThreadPool(int corePoolSize, int maximumPoolSize, long keepAliveTime, 
                                TimeUnit unit, BlockingQueue<Runnable> workQueue) {
        this.executor = new ThreadPoolExecutor(
            corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue,
            new NamedThreadFactory("pool-"), 
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
        this.monitorExecutor = Executors.newSingleThreadScheduledExecutor();
        
        // 启动监控
        startMonitoring();
    }
    
    private void startMonitoring() {
        monitorExecutor.scheduleAtFixedRate(() -> {
            int activeThreads = executor.getActiveCount();
            int poolSize = executor.getPoolSize();
            int queueSize = executor.getQueue().size();
            long completedTasks = executor.getCompletedTaskCount();
            
            System.out.printf("ThreadPool Monitor - Active: %d, Pool: %d, Queue: %d, Completed: %d%n",
                activeThreads, poolSize, queueSize, completedTasks);
            
            // 告警逻辑
            if (queueSize > 100) {
                System.err.println("WARNING: Queue size exceeds threshold!");
            }
            
            if (activeThreads == poolSize && queueSize > 0) {
                System.err.println("WARNING: Thread pool is at capacity!");
            }
        }, 0, 1, TimeUnit.MINUTES);
    }
    
    public void execute(Runnable command) {
        executor.execute(command);
    }
    
    public <T> Future<T> submit(Callable<T> task) {
        return executor.submit(task);
    }
    
    public void shutdown() {
        executor.shutdown();
        monitorExecutor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    public void updateCorePoolSize(int newCorePoolSize) {
        executor.setCorePoolSize(newCorePoolSize);
    }
    
    public void updateMaximumPoolSize(int newMaximumPoolSize) {
        executor.setMaximumPoolSize(newMaximumPoolSize);
    }
    
    public int getActiveCount() {
        return executor.getActiveCount();
    }
    
    public int getQueueSize() {
        return executor.getQueue().size();
    }
    
    public long getCompletedTaskCount() {
        return executor.getCompletedTaskCount();
    }
    
    static class NamedThreadFactory implements ThreadFactory {
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        private final String namePrefix;
        
        public NamedThreadFactory(String namePrefix) {
            this.namePrefix = namePrefix;
        }
        
        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r, namePrefix + threadNumber.getAndIncrement());
            thread.setDaemon(false);
            thread.setPriority(Thread.NORM_PRIORITY);
            return thread;
        }
    }
}
```

**为什么选择 ThreadPoolExecutor**：
- **线程管理**：自动管理线程生命周期
- **动态调整**：支持动态调整线程池参数
- **监控告警**：支持监控和告警
- **优雅关闭**：支持优雅关闭
- **拒绝策略**：支持自定义拒绝策略

---

**结语**：

以上 25 道八股文和 15 道场景题，覆盖了 JUC 并发编程的核心知识点和实际应用场景。这些题目以大厂面试官的角度设计，难度较高，需要深入理解并发编程的原理和实践。

建议读者：
1. 深入理解每个知识点的原理
2. 结合实际项目经验进行思考
3. 多做并发编程的练习
4. 关注性能优化和最佳实践
5. 持续学习新技术和新工具

祝你在并发编程的面试中取得好成绩！
