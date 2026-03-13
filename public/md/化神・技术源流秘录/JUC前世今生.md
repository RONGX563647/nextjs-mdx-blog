## 从“大师杰作”到“并发基石”：JUC（java.util.concurrent）发展历程与核心知识点详解（超详细·最终补全版）

### 引言

在Java诞生的早期，并发编程主要依赖`synchronized`关键字、`wait()/notify()`机制以及`Thread`类。这些原语虽然能够解决基础的线程同步问题，但面对复杂的并发场景时显得力不从心：锁的粒度难以控制、缺乏灵活的锁获取机制、线程间协作方式单一、高性能并发容器缺失……开发者往往需要自己封装复杂的同步逻辑，代码易错且难以维护。

这种局面的终结，始于2004年JDK 5的一个重量级新成员——**`java.util.concurrent`包**（简称JUC）。这个由并发领域泰斗Doug Lea主导设计的包，为Java带来了工业级的高性能并发工具集，彻底改变了Java并发编程的面貌。

此后近二十年，JUC伴随着Java语言的演进，不断优化、扩充，从最初的核心组件逐步发展成为一个涵盖原子操作、锁机制、线程池、并发容器、同步工具、Fork/Join框架等全方位能力的并发编程基石。今天，我们顺着时间线，用最详尽的笔触，还原JUC从诞生到2026年的完整发展历程。


## 第一章：前JUC时代——并发编程的混沌期（1996-2004）

### 1.1 早期Java并发原语

在JDK 5之前，Java开发者进行并发编程主要依赖以下几个原语：

| 并发原语 | 引入版本 | 功能与局限 |
|---------|---------|-----------|
| **`synchronized`关键字** | JDK 1.0 | 内置锁，使用简单，但锁的获取释放不灵活，无法中断，缺乏超时机制 |
| **`wait()/notify()/notifyAll()`** | JDK 1.0 | 线程间协作机制，但必须配合`synchronized`使用，唤醒是随机的 |
| **`Thread`类** | JDK 1.0 | 基础线程操作，但线程创建销毁开销大，缺乏线程池管理 |
| **`ThreadLocal`** | JDK 1.2 | 线程局部变量，用于避免共享 |
| **`volatile`关键字** | JDK 1.0 | 保证可见性，但不保证原子性 |

这些原语存在几个核心痛点：
- **锁机制不够灵活**：无法尝试获取锁、无法设置超时、无法响应中断
- **线程管理成本高**：每次需要线程都`new Thread()`，缺乏复用机制
- **并发容器缺失**：`Vector`、`Hashtable`虽然是线程安全的，但性能低下；而`ArrayList`、`HashMap`等又不安全
- **复杂同步场景难以实现**：信号量、栅栏、读写锁等都需要开发者自己实现

### 1.2 Doug Lea的`util.concurrent`包

在官方JUC包诞生之前，并发领域的泰斗**Doug Lea**已经在1990年代末开发了一个广为流传的并发工具库——`util.concurrent`。这个包包含了线程池、锁、同步器、并发容器等实现，被许多早期的高并发应用所采用。

Doug Lea后来成为JSR 166（Java并发工具包规范）的规范领导者，他将`util.concurrent`的经验和设计带入了Java官方标准库。JDK 5中的JUC包，正是以Doug Lea的工作为基础，经过标准化和优化后诞生的。


## 第二章：JUC的诞生——JDK 5（2004年）【里程碑】

**2004年9月30日**，随着JDK 5的发布，`java.util.concurrent`包正式成为Java标准库的一部分。这是Java并发编程史上最重要的里程碑，由Doug Lea领导实现，为Java带来了工业级的高并发工具集。

### 2.1 诞生的背景与意义

JUC包的设计目标非常明确：
1. **弥补`synchronized`的不足**：提供更灵活的锁机制
2. **提供高性能并发容器**：替代线程不安全的集合类
3. **实现线程池化**：降低线程创建销毁开销
4. **提供标准同步工具**：信号量、栅栏、倒计时锁等
5. **无锁并发支持**：基于CAS的原子操作

### 2.2 JSR-166与Java社区进程

JUC包的诞生是Java社区进程（JCP）的重要成果。**JSR-166**（Java Specification Request 166）是由Doug Lea提出的规范提案，旨在增强Java在多线程编程方面的能力。

JSR-166提案不仅包含了对Java内存模型的改进，还包含了一系列新的并发工具和类，如Lock接口、Condition接口、Semaphore、CountDownLatch等。这一提案的通过和执行，标志着Java并发编程进入了一个全新的时代。

### 2.3 JDK 5首次引入的核心组件

| 组件分类 | 核心类/接口 | 作用 |
|---------|------------|------|
| **锁机制** | `Lock`接口、`ReentrantLock`、`ReadWriteLock` | 提供比`synchronized`更灵活的锁操作 |
| **原子类** | `AtomicInteger`、`AtomicLong`、`AtomicReference` | 基于CAS的无锁原子操作 |
| **线程池** | `Executor`接口、`ThreadPoolExecutor`、`Executors` | 线程生命周期管理、任务提交执行 |
| **并发容器** | `ConcurrentHashMap`、`CopyOnWriteArrayList`、`ConcurrentLinkedQueue` | 高性能线程安全集合 |
| **阻塞队列** | `BlockingQueue`接口、`ArrayBlockingQueue`、`LinkedBlockingQueue` | 支持阻塞的生产者-消费者模式 |
| **同步工具** | `CountDownLatch`、`Semaphore`、`CyclicBarrier`、`Exchanger` | 线程协调同步 |
| **Future模式** | `Future`接口、`Callable`接口 | 支持有返回值的异步任务 |

### 2.4 设计哲学：分离与抽象

JUC的设计体现了三大核心理念：
- **分离锁与同步机制**：将锁（Lock）、条件（Condition）、原子操作（Atomic）、并发容器等组件解耦，按需使用
- **CAS无锁优化**：基于CPU原语的CAS（Compare-And-Swap）实现无锁并发，减少线程阻塞开销
- **线程池化**：通过线程池管理线程生命周期，避免频繁创建/销毁线程的性能损耗


## 第三章：JUC的演进之路——JDK 6到21

### 3.1 JDK 6（2006年）：基础优化与Fork/Join雏形

JDK 6的主要贡献在于巩固和完善：

- **锁优化**：对`ReentrantLock`内部实现进行优化，性能提升
- **并发容器增强**：优化`ConcurrentHashMap`的迭代器，支持更高效的遍历
- **Fork/Join框架雏形**：引入`ForkJoinPool`和`ForkJoinTask`的早期版本（JSR 166y）
- **`Deque`双端队列**：与JUC容器结合，提供`ConcurrentLinkedDeque`

### 3.2 JDK 7（2011年）：Fork/Join框架完善与Phaser登场

JDK 7为JUC带来了重要增强：

| 新增组件 | 作用 |
|---------|------|
| **`ForkJoinPool`正式发布** | 作为`ExecutorService`的实现，支持工作窃取（work-stealing）算法，极大提升了并行计算效率 |
| **`ConcurrentHashMap`分段锁优化** | 改进并发控制机制 |
| **`TransferQueue`接口** | `LinkedTransferQueue`实现，支持生产者等待消费者消费 |
| **`Phaser`同步器** | 多阶段栅栏，相当于`CyclicBarrier`的升级版，可用于分阶段任务的并发控制执行 |

**Fork/Join框架的核心思想**：将大任务拆分为小任务，并行执行，最后合并结果。工作窃取机制让空闲线程主动从繁忙线程的队列尾部窃取任务，实现负载均衡。

**Phaser的特点**：支持树形结构以减少并发带来的竞争，可以动态增减参与者，适用于分阶段任务。

### 3.3 JDK 8（2014年）：性能革命与函数式增强【里程碑】

JDK 8为JUC带来了大量重要更新，是继JDK 5之后最重要的版本：

#### 3.3.1 `ConcurrentHashMap`的重构
- **放弃分段锁**：JDK 7及之前使用Segment分段锁数组，JDK 8改用**CAS + `synchronized`锁桶**的方式
- **链表转红黑树**：当链表长度超过阈值（默认为8）且数组长度大于64时，链表转换为红黑树，最坏情况查询效率从O(n)优化为O(log n)
- **读操作无锁**：读操作完全不加锁，通过`volatile`保证可见性

#### 3.3.2 原子类增强
- **`LongAdder`**：针对高并发计数场景优化，采用分段累加策略，最后汇总，性能远超`AtomicLong`
- **`LongAccumulator`**：支持自定义累加函数的原子累加器
- **`DoubleAdder`**、`DoubleAccumulator`

#### 3.3.3 `CompletableFuture`的引入
- 提供了**异步回调**能力，支持函数式编程风格
- 可以组合多个异步任务（`thenApply`、`thenCombine`、`thenCompose`）
- 支持异常处理（`exceptionally`、`handle`）

#### 3.3.4 `StampedLock`的引入
- **三种锁模式**：写锁、悲观读锁、乐观读锁
- **乐观读**：无锁读取，通过版本戳校验数据一致性，性能远超读写锁

#### 3.3.5 `ConcurrentHashMap`新方法
- **`forEach`系列**：`forEach`、`forEachKey`、`forEachValue`
- **`search`系列**：`search`、`searchKeys`、`searchValues`
- **`reduce`系列**：`reduce`、`reduceKeys`、`reduceValues`

### 3.4 JDK 9（2017年）：响应式流支持

JDK 9为JUC引入了响应式编程的支持：

- **`Flow` API**：实现了响应式流规范（Reactive Streams），包含`Publisher`、`Subscriber`、`Subscription`、`Processor`四个核心接口
- **线程池增强**：优化`ForkJoinPool`的并发管理
- **并发容器优化**：`ConcurrentHashMap`的`mappingCount()`等方法改进

### 3.5 JDK 10-16：持续优化

| 版本 | 主要改进 |
|------|---------------------|
| **JDK 10** | 性能调优，改进线程池管理 |
| **JDK 11（LTS）** | 优化原子类性能，废弃部分过时API |
| **JDK 12-15** | 持续的性能优化和微调 |
| **JDK 16** | `Stream.toList()`简化收集操作 |

### 3.6 JDK 17（2021年）：LTS性能优化

JDK 17作为另一个LTS版本，进一步优化了JUC的性能：

- **并发性能提升**：优化`ConcurrentHashMap`的迭代器实现
- **内存分配优化**：减少对象创建时的内存碎片，提高GC效率
- **`ForkJoinPool`增强**：支持更高效的并行计算
- **`java.util.concurrent`包优化**：进一步提升了高并发环境下的吞吐量

### 3.7 JDK 19-21：虚拟线程适配【里程碑】

**JDK 19**（2022年）：
- **虚拟线程预览**：Project Loom成果，轻量级线程
- **JUC组件适配**：`ExecutorService`、`Lock`、`Semaphore`等适配虚拟线程

**JDK 21**（2023年）：
- **虚拟线程正式发布**：JUC包全面适配虚拟线程
- **结构化并发（预览）**：`StructuredTaskScope`，将相关任务组织成整体


## 第四章：JUC演进全景图

### 4.1 发展时间线

| 年份 | JDK版本 | 核心演进 | 关键特性 |
|------|---------|---------|---------|
| **1990s** | - | Doug Lea开发`util.concurrent` | 并发工具库雏形 |
| **2004** | **5** | **JUC诞生【里程碑】** | `ReentrantLock`、`ConcurrentHashMap`、原子类、线程池、`BlockingQueue`、`CountDownLatch` |
| **2006** | 6 | 基础优化 | `Fork/Join`雏形、`ConcurrentLinkedDeque` |
| **2011** | 7 | Fork/Join完善 | `ForkJoinPool`正式发布、`TransferQueue`、`Phaser` |
| **2014** | **8** | **性能革命【里程碑】** | `ConcurrentHashMap`重构、`LongAdder`、`CompletableFuture`、`StampedLock`、`reduce`系列方法 |
| **2017** | 9 | 响应式流 | `Flow` API（响应式流） |
| **2021** | **17** | **LTS性能优化** | 并发性能提升、内存分配优化 |
| **2023** | **21** | **虚拟线程适配【里程碑】** | 虚拟线程正式发布、结构化并发预览 |

### 4.2 版本特性速查表

| 版本 | 新增特性 |
|------|--------------------------------|
| JDK 5 | JUC诞生，核心组件全部引入 |
| JDK 6 | `Fork/Join`雏形，性能优化 |
| JDK 7 | `ForkJoinPool`、`TransferQueue`、`Phaser`、`ConcurrentLinkedDeque` |
| JDK 8 | `LongAdder`、`CompletableFuture`、`StampedLock`、`ConcurrentHashMap`重写 |
| JDK 9 | `Flow` API（响应式流） |
| JDK 21 | 虚拟线程适配、结构化并发预览 |


## 第五章：JUC核心组件全景图

### 5.1 JUC包组织结构

| 包路径 | 主要内容 | 典型类型 |
|--------|---------|------------------------------|
| `java.util.concurrent` | 并发工具类、线程池、并发容器、同步工具 | `ThreadPoolExecutor`、`ConcurrentHashMap`、`CountDownLatch`、`CyclicBarrier`、`Semaphore`、`Exchanger`、`Phaser`、`BlockingQueue`系列、`ForkJoinPool` |
| `java.util.concurrent.atomic` | 原子操作工具类 | `AtomicInteger`、`AtomicLong`、`AtomicReference`、`LongAdder`、`DoubleAdder`、`LongAccumulator`、`AtomicStampedReference` |
| `java.util.concurrent.locks` | 锁机制工具类 | `Lock`、`ReentrantLock`、`ReadWriteLock`、`ReentrantReadWriteLock`、`StampedLock`、`Condition` |

### 5.2 核心设计：AQS（AbstractQueuedSynchronizer）

AQS是JUC的基石，为锁和同步器提供了底层支持：

**核心组成**：
- **`volatile int state`**：表示同步状态（如锁的占有次数、剩余许可数）
- **CLH队列变体**：FIFO等待队列，存储等待获取同步状态的线程
- **独占/共享模式**：支持独占（如`ReentrantLock`）和共享（如`Semaphore`）两种模式

**工作机制**：
- 子类通过重写`tryAcquire`、`tryRelease`等方法实现自定义同步逻辑
- AQS提供了`acquire`、`release`模板方法，包含线程排队、阻塞唤醒等通用逻辑

**基于AQS的同步器**：
| 同步器 | 使用模式 | 作用 |
|--------|---------|------|
| `ReentrantLock` | 独占 | 可重入互斥锁，state表示锁的重入次数 |
| `Semaphore` | 共享 | 信号量，state表示剩余许可数 |
| `CountDownLatch` | 共享 | 倒计时门闩，state表示倒计数 |
| `ReentrantReadWriteLock` | 独占+共享 | 读写锁，高16位读锁，低16位写锁 |
| `ThreadPoolExecutor` | - | 内部Worker基于AQS实现 |

### 5.3 锁机制（Locks）

| 锁类型 | 特点 | 适用场景 |
|--------|------|---------|
| **`ReentrantLock`** | 可重入、可中断、可设置公平/非公平、支持超时 | 需要灵活锁控制的场景 |
| **`ReentrantReadWriteLock`** | 读读共享、读写互斥、写写互斥 | 读多写少的缓存场景 |
| **`StampedLock`** | JDK 8新增，支持乐观读，性能优于读写锁 | 超高并发读、写相对较少的场景 |

**ReentrantLock的核心特性**：
- **可重入**：允许线程多次获得同一个锁
- **可中断**：可以在等待锁时响应中断
- **公平性控制**：公平锁保证锁的获取顺序按照请求顺序分配，避免线程“饥饿”

### 5.4 原子操作类（Atomic）

基于CAS（Compare-And-Swap）实现的无锁原子操作：

| 类名 | 作用 | 核心方法 |
|------|------|---------|
| `AtomicInteger` | 原子更新int | `incrementAndGet()`、`compareAndSet()` |
| `AtomicLong` | 原子更新long | 同上 |
| `AtomicBoolean` | 原子更新boolean | `compareAndSet()` |
| `AtomicReference<V>` | 原子更新对象引用 | `compareAndSet()`、`getAndSet()` |
| `AtomicStampedReference<V>` | 解决CAS ABA问题 | 带版本戳的引用更新 |
| `LongAdder` | JDK 8，高并发累加器 | `increment()`、`sum()` |

**CAS原理**：依托CPU原子指令实现的无锁原子操作，通过对比共享变量的预期值与内存值，仅在相等时更新为新值。

### 5.5 线程池（Executor）

线程池的核心是`ThreadPoolExecutor`，它的构造函数包含7个核心参数：

```java
public ThreadPoolExecutor(
    int corePoolSize,           // 核心线程数（常驻）
    int maximumPoolSize,        // 最大线程数
    long keepAliveTime,         // 非核心线程空闲超时时间
    TimeUnit unit,              // 时间单位
    BlockingQueue<Runnable> workQueue, // 任务队列
    ThreadFactory threadFactory,        // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

**工作流程**：
1. **提交任务**：调用`execute()`或`submit()`
2. **判断核心线程池**：如果当前线程数 < `corePoolSize`，创建新线程执行任务
3. **进入队列**：如果当前线程数 ≥ `corePoolSize`，尝试将任务放入`workQueue`
4. **扩容**：如果队列已满且当前线程数 < `maximumPoolSize`，创建新线程执行任务
5. **拒绝策略**：如果队列已满且线程数已达`maximumPoolSize`，执行拒绝策略

**`Executors`工厂类提供的快捷创建方式**：

| 线程池类型 | 特点 | 适用场景 |
|-----------|------|---------|
| `newFixedThreadPool(n)` | 固定线程数，无界队列 | 任务量稳定的场景 |
| `newCachedThreadPool()` | 动态扩容，60秒超时 | 短期、高频任务 |
| `newSingleThreadExecutor()` | 单线程，串行执行 | 任务需顺序执行 |
| `newScheduledThreadPool(n)` | 定时/周期性任务 | 延迟执行、定时任务 |

### 5.6 并发容器（Collections）

| 容器类 | 线程安全机制 | 特点 | 适用场景 |
|--------|------------|------|---------|
| **`ConcurrentHashMap`** | CAS + `synchronized`锁桶 | 高并发读写，JDK 8红黑树优化 | 高性能并发映射 |
| **`CopyOnWriteArrayList`** | 写时复制 | 读无锁，写创建新副本 | 读多写少（如监听器列表） |
| **`CopyOnWriteArraySet`** | 基于`CopyOnWriteArrayList` | 同左 | 读多写少的Set |
| **`ConcurrentLinkedQueue`** | CAS无锁 | 无界、非阻塞、高效 | 高并发生产消费 |
| **`ConcurrentLinkedDeque`** | CAS无锁 | 支持双端操作 | 双端队列场景 |
| **`BlockingQueue`**实现 | 锁+条件等待 | 支持阻塞的`put`/`take` | 线程池、生产者-消费者 |

**阻塞队列的主要实现**：
| 队列实现 | 特点 |
|---------|------|
| `ArrayBlockingQueue` | 有界数组阻塞队列 |
| `LinkedBlockingQueue` | 无界（默认）链表阻塞队列，读写锁分离 |
| `PriorityBlockingQueue` | 无界优先队列 |
| `SynchronousQueue` | 无容量，直接传递 |
| `DelayQueue` | 延迟元素队列 |
| `LinkedTransferQueue` | 支持生产者等待消费者消费 |

### 5.7 同步工具类（Tools）

| 工具类 | 作用 | 典型用法 |
|--------|------|---------|
| **`CountDownLatch`** | 计数器，等待多个线程完成 | 主线程等待所有子线程初始化 |
| **`CyclicBarrier`** | 循环屏障，等待线程达到阈值后一起执行 | 多线程分阶段计算 |
| **`Semaphore`** | 信号量，控制并发访问数 | 限流（同时最多N个线程访问） |
| **`Exchanger<V>`** | 线程间数据交换 | 两个线程交换数据 |
| **`Phaser`** | 多阶段栅栏 | 替代`CountDownLatch`+`CyclicBarrier` |

### 5.8 线程协作：Condition

`Condition`是`Lock`的配套工具，替代`Object.wait()/notify()`，支持**多条件等待**：

```java
ReentrantLock lock = new ReentrantLock();
Condition notEmpty = lock.newCondition(); // 非空条件
Condition notFull = lock.newCondition();  // 非满条件

// 生产者
lock.lock();
try {
    while (队列满) {
        notFull.await(); // 等待非满
    }
    入队();
    notEmpty.signal(); // 唤醒非空等待的消费者
} finally {
    lock.unlock();
}
```

### 5.9 Future与CompletableFuture

- **`Callable<V>`**：有返回值的任务，与`Runnable`并列
- **`Future<V>`**：代表异步任务的结果，支持`get()`阻塞获取、`cancel()`取消
- **`CompletableFuture`**：JDK 8引入，支持**异步回调**、任务组合、异常处理


## 第六章：设计哲学与实现原理

### 6.1 CAS（Compare-And-Swap）原理

CAS是JUC的底层基石，依托CPU原子指令实现的无锁原子操作。其核心逻辑是：

```java
boolean compareAndSet(expectedValue, updateValue);
```

当希望修改的值与`expectedValue`相同时，则尝试将值更新为`updateValue`，更新成功返回`true`，否则返回`false`。

**CAS的优势**：无锁并发，减少线程阻塞开销
**CAS的局限**：ABA问题，可通过`AtomicStampedReference`解决

### 6.2 AQS的设计模式

AQS采用了**模板方法设计模式**：
- 顶层定义了同步器的基本骨架：状态管理、线程排队、阻塞唤醒
- 子类通过实现`tryAcquire`、`tryRelease`等方法定制具体同步逻辑

这种设计使得开发者可以基于AQS快速实现各种自定义同步器，极大地提高了框架的可扩展性。

### 6.3 并发容器的演进

| 版本 | ConcurrentHashMap演进 |
|------|----------------------|
| JDK 5 | Segment分段锁（默认16段） |
| JDK 7 | 优化分段锁，性能提升 |
| JDK 8 | CAS + `synchronized`锁桶，红黑树优化，读操作无锁 |


## 第七章：面试题库

### 5道难度递增的基础面试题

#### 第1题：JUC是什么？它在哪个JDK版本中引入？(难度⭐)

**参考答案**：
JUC是`java.util.concurrent`包的简称，是Java专门用于并发编程的工具包。它包含了锁、原子类、线程池、并发容器、同步工具等核心组件。

它在**JDK 5**中正式引入，由并发领域泰斗Doug Lea主导设计和实现，是JSR 166规范的具体实现。

#### 第2题：`synchronized`和`ReentrantLock`有什么区别？(难度⭐⭐)

**参考答案**：

| 维度 | `synchronized` | `ReentrantLock` |
|------|----------------|-----------------|
| **实现层面** | JVM内置关键字 | Java类库实现 |
| **锁释放** | 自动释放 | 必须手动`unlock()` |
| **锁获取灵活性** | 只能阻塞获取 | 支持`tryLock()`尝试获取、超时获取 |
| **中断响应** | 无法响应中断 | 支持`lockInterruptibly()`响应中断 |
| **公平性** | 非公平 | 可配置公平/非公平 |
| **条件等待** | `wait()/notify()` | `Condition`，支持多条件 |
| **适用场景** | 锁竞争不激烈时简单易用 | 需要灵活控制、超时、公平锁时 |

#### 第3题：`ConcurrentHashMap`在JDK 8中做了哪些重要改进？(难度⭐⭐⭐)

**参考答案**：
JDK 8对`ConcurrentHashMap`进行了重大重构：

1. **放弃分段锁**：JDK 7使用Segment数组分段锁，JDK 8改为使用**CAS + `synchronized`锁桶**的方式，降低锁粒度
2. **链表转红黑树**：当链表长度超过8且数组长度大于64时，链表转换为红黑树，查询效率从O(n)优化为O(log n)
3. **读操作无锁**：读操作完全不加锁，通过`volatile`保证可见性
4. **支持新的函数式方法**：`forEach`、`search`、`reduce`系列方法
5. **原子复合操作**：`computeIfAbsent`、`computeIfPresent`、`merge`等

#### 第4题：AQS是什么？它如何支撑JUC的同步器？(难度⭐⭐⭐⭐)

**参考答案**：
AQS（AbstractQueuedSynchronizer）是**JUC的基石**，为锁和同步器提供了底层支持。

**核心组成**：
- **`volatile int state`**：表示同步状态（如锁的占有次数、剩余许可数）
- **CLH队列变体**：FIFO等待队列，存储等待获取同步状态的线程
- **独占/共享模式**：支持独占（如`ReentrantLock`）和共享（如`Semaphore`）两种模式

**工作机制**：
- 子类通过重写`tryAcquire`、`tryRelease`等方法实现自定义同步逻辑
- AQS提供了`acquire`、`release`模板方法，包含线程排队、阻塞唤醒等通用逻辑

**基于AQS的同步器**：
- `ReentrantLock`：独占模式，state表示锁的重入次数
- `Semaphore`：共享模式，state表示剩余许可数
- `CountDownLatch`：共享模式，state表示倒计数
- `ReentrantReadWriteLock`：混合模式，高16位读锁，低16位写锁

#### 第5题：`ThreadPoolExecutor`的核心参数有哪些？线程池的工作流程是怎样的？(难度⭐⭐⭐⭐)

**参考答案**：

```java
public ThreadPoolExecutor(
    int corePoolSize,      // 核心线程数（常驻）
    int maximumPoolSize,   // 最大线程数
    long keepAliveTime,    // 非核心线程空闲超时时间
    TimeUnit unit,         // 时间单位
    BlockingQueue<Runnable> workQueue, // 任务队列
    ThreadFactory threadFactory,       // 线程工厂
    RejectedExecutionHandler handler   // 拒绝策略
)
```

**工作流程**：
1. **提交任务**：调用`execute()`或`submit()`
2. **判断核心线程池**：如果当前线程数 < `corePoolSize`，创建新线程执行任务
3. **进入队列**：如果当前线程数 ≥ `corePoolSize`，尝试将任务放入`workQueue`
4. **扩容**：如果队列已满且当前线程数 < `maximumPoolSize`，创建新线程执行任务
5. **拒绝策略**：如果队列已满且线程数已达`maximumPoolSize`，执行拒绝策略

**拒绝策略**：
- `AbortPolicy`（默认）：抛出`RejectedExecutionException`
- `CallerRunsPolicy`：调用者线程自己执行任务
- `DiscardPolicy`：直接丢弃，不抛出异常
- `DiscardOldestPolicy`：丢弃队列中最老的任务，重新提交新任务

### 3道实战场景题

#### 场景1：实现一个限流器，最多允许10个线程同时访问

**问题**：你需要实现一个服务接口，要求最多允许10个线程同时访问，超出限制的线程需要等待，直到有线程释放资源。你会如何用JUC实现？

**考察点**：`Semaphore`的应用

**参考思路**：

```java
@Service
public class RateLimitedService {
    private final Semaphore semaphore = new Semaphore(10); // 最多10个许可
    
    public void processRequest(Request request) {
        try {
            // 尝试获取许可，可设置超时
            if (!semaphore.tryAcquire(5, TimeUnit.SECONDS)) {
                throw new RuntimeException("系统繁忙，请稍后重试");
            }
            try {
                // 执行业务逻辑
                doProcess(request);
            } finally {
                semaphore.release(); // 释放许可
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("被中断", e);
        }
    }
}
```

#### 场景2：多线程分批处理数据

**问题**：你有100万个数据需要处理，每个数据处理耗时约1秒。为了提高效率，你决定使用10个线程并行处理。需要等所有线程都完成一批数据的准备后，再同时开始处理，然后继续下一批。如何实现？

**考察点**：`CyclicBarrier`的应用

**参考思路**：

```java
public class BatchProcessor {
    private static final int THREAD_COUNT = 10;
    private static final int BATCH_SIZE = 10;
    private final CyclicBarrier barrier;
    private final List<List<Data>> batches;
    
    public BatchProcessor(List<Data> allData) {
        // 将数据分批
        batches = new ArrayList<>();
        for (int i = 0; i < allData.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, allData.size());
            batches.add(allData.subList(i, end));
        }
        
        // 初始化屏障：所有线程都准备好后执行屏障动作
        barrier = new CyclicBarrier(THREAD_COUNT, () -> {
            System.out.println("所有线程准备就绪，开始处理第 " + (currentBatchIndex + 1) + " 批");
        });
    }
    
    public void process() {
        for (int i = 0; i < THREAD_COUNT; i++) {
            int threadId = i;
            new Thread(() -> {
                for (int batchIdx = threadId; batchIdx < batches.size(); batchIdx += THREAD_COUNT) {
                    // 获取当前线程要处理的数据批
                    List<Data> batch = batches.get(batchIdx);
                    
                    // 准备数据（如预处理）
                    prepareData(batch);
                    
                    try {
                        // 等待所有线程准备就绪
                        barrier.await();
                        
                        // 同时开始处理
                        processBatch(batch);
                        
                        // 等待所有线程完成当前批处理，再进入下一批
                        barrier.await();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }).start();
        }
    }
}
```

#### 场景3：高性能计数器，支持千万级并发

**问题**：你需要实现一个PV/UV统计计数器，要求在高并发下性能极高，能够支撑千万级QPS的递增操作。你会选择哪种JUC类？为什么？

**考察点**：`LongAdder`的优势、与`AtomicLong`的对比

**参考思路**：

```java
public class HighConcurrencyCounter {
    // 使用LongAdder替代AtomicLong
    private final LongAdder counter = new LongAdder();
    
    public void increment() {
        counter.increment(); // 性能极高，内部采用分段累加
    }
    
    public long getCount() {
        return counter.sum(); // 汇总所有分段的值
    }
}
```

**为什么选择`LongAdder`**：
- **`AtomicLong`的瓶颈**：在高并发下，大量线程同时CAS更新同一个变量，会导致严重的自旋竞争和缓存行失效
- **`LongAdder`的设计**：
  - 内部维护一个`Cell`数组（分段累加器）
  - 每个线程映射到不同的`Cell`进行累加，减少竞争
  - 最后通过`sum()`汇总所有`Cell`的值
- **性能对比**：在超高并发下，`LongAdder`的性能可以是`AtomicLong`的数倍甚至数十倍


## 结语

从JDK 5的初生牛犊，到如今JDK 21的成熟稳健，JUC已经走过了二十年的辉煌历程。它始于并发大师Doug Lea的杰作，在泛型与函数式编程的浪潮中不断进化，在多核时代开疆拓土，在虚拟线程革命中焕发新颜。它不仅是Java并发编程的基石，更是无数高并发系统的技术支柱。

理解JUC的历史与核心原理，不仅能让你在面试中游刃有余，更能让你在面对复杂的并发场景时，做出最恰当的技术选择，写出高性能、高可靠的多线程代码。


**参考资料**：
1. 百度智能云：J.U.C并发包背后的故事：从JCP到Lock接口的实现 
2. CSDN博客：从入门到实战：Java JUC 并发工具包完全指南 
3. UCloud：Java多线程进阶（一）—— J.U.C并发包概述 
4. 华为云社区：JUC 核心组件全景：Lock、Atomic、AQS！ 
5. 清华大学出版社：《Java高并发核心编程》前言 
6. 51CTO博客：java的基本操作 java的juc 
7. 阿里云开发者社区：【多线程面试题二十四】说说你对JUC的了解 