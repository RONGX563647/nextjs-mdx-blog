在 Java 多线程高并发场景中，常用的 API 主要集中在`java.lang`包（基础线程类）和`java.util.concurrent`（JUC，并发工具包）中。以下是核心 API 的分类整理：

### 一、线程基础 API（`java.lang`包）

1. **`Thread`类**
   线程的核心类，用于创建和控制线程。

   - 关键方法：
     - `start()`：启动线程（调用`run()`方法，非直接调用`run()`）。
     - `run()`：线程执行的核心逻辑（需重写或通过`Runnable`传入）。
     - `sleep(long millis)`：让当前线程休眠指定毫秒数（持有锁时不会释放锁）。
     - `join()`：等待该线程执行完毕后再继续当前线程。
     - `yield()`：当前线程让出 CPU 资源，进入就绪状态（可能立即再次获取 CPU）。
     - `setDaemon(boolean on)`：设置为守护线程（如 GC 线程，主线程结束后自动退出）。

2. **`Runnable`接口**
   线程任务的抽象，仅含`run()`方法（无返回值，不能抛受检异常）。
   通常作为参数传入`Thread`构造器：

   java

   ```java
   Thread thread = new Thread(() -> { /* 任务逻辑 */ });
   ```

3. **`Object`类的线程通信方法**
   用于线程间协作（需在`synchronized`代码块 / 方法中使用）：

   - `wait()`：让当前线程释放锁并进入等待状态，直到被`notify()`/`notifyAll()`唤醒。
   - `notify()`：随机唤醒一个等待该对象锁的线程。
   - `notifyAll()`：唤醒所有等待该对象锁的线程。

### 二、JUC 核心并发工具（`java.util.concurrent`包）

#### 1. 线程池相关（高并发下控制线程资源的核心）

- **`Executor` & `ExecutorService`接口**：线程池的顶层接口，定义了线程池的执行能力。

- `ThreadPoolExecutor`类

  ：线程池的核心实现类（推荐直接使用，而非

  ```
  Executors
  ```

  工具类），可灵活配置核心参数：

  java

  ```java
  // 示例：创建线程池
  ThreadPoolExecutor executor = new ThreadPoolExecutor(
      5,                  // 核心线程数
      10,                 // 最大线程数
      60L,                // 空闲线程存活时间
      TimeUnit.SECONDS,   // 时间单位
      new LinkedBlockingQueue<>(),  // 任务队列
      Executors.defaultThreadFactory(),  // 线程工厂
      new ThreadPoolExecutor.AbortPolicy()  // 拒绝策略
  );
  ```

- `Executors`工具类

  ：提供简化的线程池创建方法（但生产环境慎用，可能导致资源耗尽）：

  - `newFixedThreadPool(n)`：固定大小的线程池。
  - `newCachedThreadPool()`：可缓存的线程池（按需创建线程，空闲即回收）。
  - `newScheduledThreadPool(n)`：支持定时 / 周期性任务的线程池。

#### 2. 任务执行与结果获取

- **`Callable<V>`接口**：带返回值的线程任务（可抛受检异常），与`Runnable`的区别是有返回值。

- `Future<V>`接口

  ：用于获取

  ```
  Callable
  ```

  任务的执行结果，关键方法：

  - `get()`：阻塞等待任务完成并获取结果。
  - `get(long timeout, TimeUnit unit)`：超时等待结果。

- **`FutureTask`类**：`Future`的实现类，可包装`Callable`或`Runnable`，作为线程任务提交给线程池。

#### 3. 锁机制（比`synchronized`更灵活的同步控制）

- `Lock`接口

  ：替代

  ```
  synchronized
  ```

  的锁机制，核心方法：

  - `lock()`：获取锁（阻塞）。
  - `tryLock()`：尝试获取锁（非阻塞，返回是否成功）。
  - `unlock()`：释放锁（需在`finally`中调用，避免死锁）。

- **`ReentrantLock`类**：`Lock`的实现类，支持可重入锁（同一线程可多次获取锁）、公平锁（按请求顺序获取锁）等特性。

- `ReadWriteLock`接口

  ：读写分离锁，适合 “读多写少” 场景：

  - `readLock()`：读锁（共享锁，多线程可同时读）。
  - `writeLock()`：写锁（排他锁，仅单线程可写）。
  - 实现类：`ReentrantReadWriteLock`。

#### 4. 原子操作类（`java.util.concurrent.atomic`包）

提供无锁的原子操作（基于 CAS 机制），避免锁开销，适合简单计数器等场景：

- `AtomicInteger`/`AtomicLong`：原子整数 / 长整数（支持`getAndIncrement()`等操作）。
- `AtomicReference<V>`：原子引用（对对象的原子操作）。
- `AtomicStampedReference<V>`：带版本号的原子引用（解决 ABA 问题）。

#### 5. 并发容器（线程安全的集合）

- **`ConcurrentHashMap`**：线程安全的`HashMap`，Java 8 后基于 CAS+synchronized 实现（替代`Hashtable`，效率更高）。

- **`CopyOnWriteArrayList`**：写时复制的 ArrayList，读操作无锁（适合读多写少场景）。

- **`ConcurrentLinkedQueue`**：线程安全的无界队列（基于链表，高效的生产者 - 消费者模型）。

- `BlockingQueue`接口

  ：阻塞队列（关键特性：当队列满 / 空时，

  ```
  put()
  ```

  /

  ```
  take()
  ```

  会阻塞），实现类：

  - `ArrayBlockingQueue`：有界数组队列。
  - `LinkedBlockingQueue`：可配置有界 / 无界的链表队列。
  - `SynchronousQueue`：无缓冲队列（生产者直接将元素交给消费者）。

#### 6. 同步辅助工具

- `CountDownLatch`

  ：倒计时器，让 1 个或多个线程等待其他线程完成操作：

  java

  ```java
  CountDownLatch latch = new CountDownLatch(3); // 计数3
  // 其他线程执行完后调用 latch.countDown();（计数-1）
  latch.await(); // 主线程等待计数到0后继续
  ```

- `CyclicBarrier`

  ：循环屏障，让一组线程到达屏障后再一起执行（可重复使用）：

  java

  ```java
  CyclicBarrier barrier = new CyclicBarrier(3, () -> { /* 所有线程到达后执行 */ });
  // 每个线程执行到 barrier.await(); 时等待，直到3个线程都到达
  ```

- `Semaphore`

  ：信号量，控制同时访问资源的线程数量（限流场景常用）：

  java

  ```java
  Semaphore semaphore = new Semaphore(5); // 允许5个线程同时访问
  semaphore.acquire(); // 获取许可（不够则阻塞）
  // 访问资源
  semaphore.release(); // 释放许可
  ```

- **`Exchanger<V>`**：用于两个线程交换数据（如生产者和消费者交换缓冲区）。

#### 7. 线程本地存储

- `ThreadLocal<T>`

  ：为每个线程提供独立的变量副本，避免线程安全问题（如 Web 开发中存储用户会话）：

  java

  ```java
  ThreadLocal<String> threadLocal = new ThreadLocal<>();
  threadLocal.set("线程私有数据"); // 当前线程设置值
  threadLocal.get(); // 当前线程获取值
  threadLocal.remove(); // 清理值（避免内存泄漏）
  ```

### 总结

高并发场景中，核心 API 围绕 “线程管理（线程池）、同步控制（锁 / 原子类）、并发容器、线程协作（辅助工具）” 展开。实际开发中，需根据场景选择合适的工具（如用`ThreadPoolExecutor`控制线程数，`ConcurrentHashMap`处理并发读写，`Semaphore`实现限流等）。