# 重走我的Java Day13:那个让系统瘫痪的并发bug：我是如何从一个死锁问题中学会多线程的

> 2018年，我在一个电商大促活动中，写了一段"完美"的库存扣减代码。上线5分钟后，系统完全卡死。当我把线程转储拿给资深架构师看时，他指着一个死锁图说："你同时锁住了库存表和订单表，但顺序是反的。" 那一刻，我明白了多线程不是语法糖，而是分布式系统的心跳。

## 开篇：那个5分钟瘫痪系统的"完美代码"

### 事故现场

![image-20260201224038103](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201224038103.png)

java

```java
public class InventoryService {
    private final Map<String, Integer> inventory = new ConcurrentHashMap<>();
    private final Map<String, Object> locks = new ConcurrentHashMap<>();
    
    public boolean deductInventory(String sku, int quantity) {
        synchronized (locks.computeIfAbsent(sku, k -> new Object())) {
            Integer current = inventory.get(sku);
            if (current == null || current < quantity) {
                return false;
            }
            inventory.put(sku, current - quantity);
            return true;
        }
    }
}

public class OrderService {
    private final Object orderLock = new Object();
    private final InventoryService inventoryService;
    
    public boolean createOrder(String userId, Map<String, Integer> items) {
        synchronized (orderLock) {
            // 第一步：预扣库存
            for (Map.Entry<String, Integer> entry : items.entrySet()) {
                if (!inventoryService.deductInventory(entry.getKey(), entry.getValue())) {
                    return false;
                }
            }
            
            // 第二步：创建订单（假设这里需要一段时间）
            try {
                Thread.sleep(100); // 模拟数据库操作
                createOrderInDatabase(userId, items);
            } catch (InterruptedException e) {
                // 恢复库存？但这里没有回滚逻辑！
                Thread.currentThread().interrupt();
                return false;
            }
            
            return true;
        }
    }
}

// 问题来了：如果两个线程同时创建订单，但包含相同的商品呢？
// 线程A：创建订单1，包含商品X和Y
// 线程B：创建订单2，包含商品Y和X
// 
// 执行顺序：
// 线程A：锁住orderLock → 锁住商品X → 尝试锁商品Y（但被线程B锁着）
// 线程B：锁住orderLock → 锁住商品Y → 尝试锁商品X（但被线程A锁着）
// 
// 经典死锁！而且没有任何超时机制，系统永远卡住。
```



### 损失

- 大促开始5分钟后，系统完全无响应
- 每分钟损失订单约1000笔
- 用户投诉电话被打爆
- 需要重启所有服务节点

## 一、线程基础：从"new Thread().start()"到"结构化并发"

### 1.1 线程创建的进化史

![image-20260201224103792](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201224103792.png)

**第一代：直接继承Thread（初学者之选）**

java

```java
// 问题：Java单继承限制，不利于扩展
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("我在线程里！");
    }
}

// 使用
MyThread t = new MyThread();
t.start();
```



**第二代：实现Runnable接口（工业级选择）**

java

```
// 更好的分离关注点：任务与线程执行分离
class MyTask implements Runnable {
    private final String taskName;
    
    MyTask(String name) {
        this.taskName = name;
    }
    
    @Override
    public void run() {
        System.out.println("执行任务: " + taskName);
    }
}

// 使用：可以复用同一个任务对象
MyTask task = new MyTask("数据处理");
new Thread(task).start();
new Thread(task).start(); // 多个线程执行同一任务
```



**第三代：实现Callable + Future（带返回值）**

java

```java
class DataProcessor implements Callable<Result> {
    private final Data data;
    
    DataProcessor(Data data) {
        this.data = data;
    }
    
    @Override
    public Result call() throws Exception {
        // 处理数据，可能抛出异常
        return processData(data);
    }
}

// 使用：获取异步结果
ExecutorService executor = Executors.newSingleThreadExecutor();
Future<Result> future = executor.submit(new DataProcessor(data));

// 阻塞等待结果，最多等2秒
Result result = future.get(2, TimeUnit.SECONDS);
```



**第四代：CompletableFuture（响应式编程）**

java

```java
// Java 8引入，支持函数式编程
public CompletableFuture<Order> createOrderAsync(OrderRequest request) {
    return CompletableFuture.supplyAsync(() -> {
        // 验证请求
        validateRequest(request);
        return request;
    })
    .thenApplyAsync(validatedRequest -> {
        // 检查库存
        return checkInventory(validatedRequest);
    })
    .thenApplyAsync(inventoryChecked -> {
        // 扣减库存
        return deductInventory(inventoryChecked);
    })
    .thenApplyAsync(inventoryDeducted -> {
        // 创建订单
        return saveOrder(inventoryDeducted);
    })
    .exceptionally(ex -> {
        // 异常处理：恢复库存
        recoverInventory(request);
        throw new OrderException("创建订单失败", ex);
    });
}
```



**第五代：虚拟线程（Java 21+，革命性变化）**

java

```java
// 传统平台线程 vs 虚拟线程
public void compareThreads() {
    // 平台线程：1:1映射到操作系统线程，创建成本高（约1MB栈内存）
    Thread platformThread = Thread.ofPlatform()
        .name("platform-", 0)
        .start(() -> {
            System.out.println("我是平台线程: " + Thread.currentThread());
        });
    
    // 虚拟线程：M:N映射到平台线程，创建成本极低（约几百字节）
    Thread virtualThread = Thread.ofVirtual()
        .name("virtual-", 0)
        .start(() -> {
            System.out.println("我是虚拟线程: " + Thread.currentThread());
        });
    
    // 批量创建虚拟线程（传统方式创建百万线程是不可能的）
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        for (int i = 0; i < 1_000_000; i++) {
            executor.submit(() -> {
                Thread.sleep(Duration.ofSeconds(1));
                return i;
            });
        }
    }
}
```



### 1.2 线程状态：从JVM源码看真相

我通过阅读OpenJDK源码，理解了线程状态的本质：

java

```java
// Thread.State枚举的实际含义
public enum State {
    // NEW: 已创建但未启动（start()未调用）
    NEW,
    
    // RUNNABLE: 可运行状态（可能在运行，也可能在等待CPU）
    // 注意：Java把就绪(ready)和运行(running)都归为RUNNABLE
    RUNNABLE,
    
    // BLOCKED: 等待监视器锁（synchronized）
    // 只有在synchronized块外等待锁时才是BLOCKED
    BLOCKED,
    
    // WAITING: 无限期等待（wait()、join()、LockSupport.park()）
    WAITING,
    
    // TIMED_WAITING: 限期等待（sleep()、wait(timeout)、join(timeout)）
    TIMED_WAITING,
    
    // TERMINATED: 线程结束
    TERMINATED
}

// 实战：监控线程状态
public class ThreadMonitor {
    public static void analyzeThreadStates() {
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        
        // 获取所有线程ID
        long[] threadIds = threadBean.getAllThreadIds();
        
        for (long threadId : threadIds) {
            ThreadInfo info = threadBean.getThreadInfo(threadId);
            if (info != null) {
                System.out.printf("线程: %s (%d)%n", 
                    info.getThreadName(), threadId);
                System.out.printf("  状态: %s%n", 
                    info.getThreadState());
                
                // 如果是BLOCKED状态，打印锁信息
                if (info.getThreadState() == Thread.State.BLOCKED) {
                    System.out.printf("  正在等待锁: %s%n", 
                        info.getLockName());
                    System.out.printf("  被线程 %d 持有%n", 
                        info.getLockOwnerId());
                }
                
                // 打印堆栈跟踪
                System.out.println("  堆栈:");
                for (StackTraceElement element : info.getStackTrace()) {
                    System.out.printf("    %s%n", element);
                }
            }
        }
    }
}
```



## 二、线程同步：从"synchronized everywhere"到"精细锁控制"

![image-20260201224121354](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201224121354.png)

### 2.1 synchronized的误解与真相

**误解1：synchronized方法锁的是对象**

java

```java
class Counter {
    // 这个synchronized锁的是Counter实例（this）
    public synchronized void increment() {
        count++;
    }
    
    // 这个synchronized也锁Counter实例
    public synchronized void decrement() {
        count--;
    }
    
    // 问题：这两个方法互斥！一个线程increment时，另一个不能decrement
}

// 解决方案：使用不同的锁对象
class BetterCounter {
    private final Object incLock = new Object();
    private final Object decLock = new Object();
    
    public void increment() {
        synchronized (incLock) {
            count++;
        }
    }
    
    public void decrement() {
        synchronized (decLock) {
            count--;
        }
    }
}
```



**误解2：synchronized静态方法锁的是类对象**

java

```java
class GlobalConfig {
    private static Map<String, String> config = new HashMap<>();
    
    // 这个锁的是GlobalConfig.class对象
    public static synchronized void update(String key, String value) {
        config.put(key, value);
    }
    
    // 问题：所有静态同步方法共用一把锁，可能成为瓶颈
}

// 真相：静态同步方法等效于
public static void update(String key, String value) {
    synchronized (GlobalConfig.class) {
        config.put(key, value);
    }
}
```



### 2.2 Lock接口：比synchronized更强大，也更危险

**ReentrantLock的基本使用**

java

```java
public class Account {
    private final Lock lock = new ReentrantLock();
    private BigDecimal balance;
    
    public void transfer(Account to, BigDecimal amount) {
        // 错误：可能死锁
        this.lock.lock();
        try {
            to.lock.lock();
            try {
                this.balance = this.balance.subtract(amount);
                to.balance = to.balance.add(amount);
            } finally {
                to.lock.unlock();
            }
        } finally {
            this.lock.unlock();
        }
    }
}
```



**死锁解决方案1：顺序加锁**

java

```java
public class Account {
    private final long id; // 唯一ID用于排序
    private final Lock lock = new ReentrantLock();
    private BigDecimal balance;
    
    public void transfer(Account to, BigDecimal amount) {
        // 按照ID顺序获取锁，避免死锁
        Account first = this.id < to.id ? this : to;
        Account second = this.id < to.id ? to : this;
        
        first.lock.lock();
        try {
            second.lock.lock();
            try {
                if (this.balance.compareTo(amount) < 0) {
                    throw new InsufficientBalanceException();
                }
                this.balance = this.balance.subtract(amount);
                to.balance = to.balance.add(amount);
            } finally {
                second.lock.unlock();
            }
        } finally {
            first.lock.unlock();
        }
    }
}
```



**死锁解决方案2：尝试锁+超时**

java

```java
public class Account {
    private final Lock lock = new ReentrantLock();
    
    public boolean tryTransfer(Account to, BigDecimal amount, long timeout, TimeUnit unit) {
        long stopTime = System.nanoTime() + unit.toNanos(timeout);
        
        while (true) {
            if (this.lock.tryLock()) {
                try {
                    if (to.lock.tryLock()) {
                        try {
                            // 检查余额
                            if (this.balance.compareTo(amount) < 0) {
                                return false;
                            }
                            // 执行转账
                            this.balance = this.balance.subtract(amount);
                            to.balance = to.balance.add(amount);
                            return true;
                        } finally {
                            to.lock.unlock();
                        }
                    }
                } finally {
                    this.lock.unlock();
                }
            }
            
            // 检查是否超时
            if (System.nanoTime() > stopTime) {
                return false;
            }
            
            // 随机休眠避免活锁
            try {
                Thread.sleep(10 + (long)(Math.random() * 10));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
    }
}
```



### 2.3 读写锁：读多写少的性能利器

java

```java
public class PriceCache {
    private final Map<String, BigDecimal> cache = new HashMap<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    
    // 读操作：多个线程可以同时读
    public BigDecimal getPrice(String productId) {
        readLock.lock();
        try {
            return cache.get(productId);
        } finally {
            readLock.unlock();
        }
    }
    
    // 写操作：一次只有一个线程可以写
    public void updatePrice(String productId, BigDecimal price) {
        writeLock.lock();
        try {
            cache.put(productId, price);
        } finally {
            writeLock.unlock();
        }
    }
    
    // 特殊场景：读锁升级为写锁（容易死锁，要小心）
    public BigDecimal updateIfPresent(String productId, Function<BigDecimal, BigDecimal> updater) {
        readLock.lock();
        try {
            BigDecimal current = cache.get(productId);
            if (current == null) {
                return null;
            }
            
            // 这里不能直接升级锁！需要释放读锁再获取写锁
            readLock.unlock();
            
            writeLock.lock();
            try {
                // 重新检查，因为可能被其他线程修改了
                current = cache.get(productId);
                if (current == null) {
                    return null;
                }
                
                BigDecimal updated = updater.apply(current);
                cache.put(productId, updated);
                return updated;
            } finally {
                // 注意：这里要重新获取读锁，保持锁的对称性
                readLock.lock();
                writeLock.unlock();
            }
        } finally {
            readLock.unlock();
        }
    }
}
```



### 2.4 StampedLock：Java 8的性能怪兽

java

```java
public class Point {
    private double x, y;
    private final StampedLock lock = new StampedLock();
    
    // 乐观读：性能最好，但不保证一致性
    public double distanceFromOrigin() {
        // 1. 尝试乐观读
        long stamp = lock.tryOptimisticRead();
        double currentX = x, currentY = y;
        
        // 2. 检查读期间是否有写操作
        if (!lock.validate(stamp)) {
            // 3. 如果有写操作，升级为悲观读锁
            stamp = lock.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                lock.unlockRead(stamp);
            }
        }
        
        return Math.sqrt(currentX * currentX + currentY * currentY);
    }
    
    // 写操作
    public void move(double deltaX, double deltaY) {
        long stamp = lock.writeLock();
        try {
            x += deltaX;
            y += deltaY;
        } finally {
            lock.unlockWrite(stamp);
        }
    }
    
    // 读锁升级为写锁
    public void moveIfAt(double oldX, double oldY, double newX, double newY) {
        // 获取悲观读锁
        long stamp = lock.readLock();
        try {
            while (x == oldX && y == oldY) {
                // 尝试转换为写锁
                long ws = lock.tryConvertToWriteLock(stamp);
                if (ws != 0L) {
                    stamp = ws; // 转换成功，更新戳记
                    x = newX;
                    y = newY;
                    break;
                } else {
                    // 转换失败，释放读锁，获取写锁
                    lock.unlockRead(stamp);
                    stamp = lock.writeLock();
                }
            }
        } finally {
            lock.unlock(stamp); // 释放当前持有的锁（可能是读锁或写锁）
        }
    }
}
```



## 三、线程间通信：从"wait/notify"到"消息队列"

### 3.1 传统的wait/notify模式

java

```java
// 生产者-消费者模式的传统实现
public class BlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    
    public BlockingQueue(int capacity) {
        this.capacity = capacity;
    }
    
    public synchronized void put(T item) throws InterruptedException {
        while (queue.size() == capacity) {
            wait(); // 队列满，等待
        }
        
        queue.add(item);
        notifyAll(); // 通知消费者可能有数据了
    }
    
    public synchronized T take() throws InterruptedException {
        while (queue.isEmpty()) {
            wait(); // 队列空，等待
        }
        
        T item = queue.remove();
        notifyAll(); // 通知生产者可能有空间了
        return item;
    }
}

// 问题：notifyAll()会唤醒所有等待线程，造成"惊群效应"
```



### 3.2 Condition接口：更精确的线程通信

java

```java
public class ConditionBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();  // 队列不满条件
    private final Condition notEmpty = lock.newCondition(); // 队列不空条件
    
    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (queue.size() == capacity) {
                notFull.await(); // 等待"不满"条件
            }
            
            queue.add(item);
            notEmpty.signal(); // 只唤醒一个等待"不空"的消费者
        } finally {
            lock.unlock();
        }
    }
    
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                notEmpty.await(); // 等待"不空"条件
            }
            
            T item = queue.remove();
            notFull.signal(); // 只唤醒一个等待"不满"的生产者
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```



### 3.3 使用BlockingQueue：Java并发库的礼物

java

```java
// 大多数情况下，你应该直接使用Java内置的并发容器
public class ProducerConsumer {
    private final BlockingQueue<Task> taskQueue = new LinkedBlockingQueue<>(100);
    private final ExecutorService executor = Executors.newFixedThreadPool(10);
    
    // 生产者
    public void produce(Task task) throws InterruptedException {
        // 如果队列满，会阻塞直到有空间
        taskQueue.put(task);
    }
    
    // 消费者
    public void startConsumers() {
        for (int i = 0; i < 10; i++) {
            executor.submit(() -> {
                while (!Thread.currentThread().isInterrupted()) {
                    try {
                        // 如果队列空，会阻塞直到有任务
                        Task task = taskQueue.take();
                        processTask(task);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
        }
    }
}
```



## 四、线程池：从"new Thread()"到"生产级并发"

### 4.1 线程池的7个核心参数

![image-20260201224148266](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201224148266.png)

java

```java
public class ThreadPoolConfig {
    // 正确的线程池配置
    public ThreadPoolExecutor createOrderProcessingPool() {
        int corePoolSize = Runtime.getRuntime().availableProcessors(); // CPU核心数
        int maxPoolSize = corePoolSize * 4; // IO密集型，可以多配
        
        return new ThreadPoolExecutor(
            corePoolSize,      // 核心线程数：即使空闲也保留
            maxPoolSize,       // 最大线程数
            60L,               // 空闲线程存活时间
            TimeUnit.SECONDS,  // 时间单位
            new LinkedBlockingQueue<>(1000), // 工作队列：有界队列防止OOM
            new NamedThreadFactory("order-processor"), // 线程工厂：命名线程
            new OrderRejectionHandler()      // 拒绝策略：自定义处理
        );
    }
    
    // 命名的线程工厂（便于监控和调试）
    static class NamedThreadFactory implements ThreadFactory {
        private final String namePrefix;
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        
        NamedThreadFactory(String namePrefix) {
            this.namePrefix = namePrefix + "-";
        }
        
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, namePrefix + threadNumber.getAndIncrement());
            t.setDaemon(false); // 非守护线程
            t.setPriority(Thread.NORM_PRIORITY); // 正常优先级
            return t;
        }
    }
    
    // 自定义拒绝策略
    static class OrderRejectionHandler implements RejectedExecutionHandler {
        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            if (r instanceof OrderTask) {
                OrderTask task = (OrderTask) r;
                // 1. 记录日志
                log.warn("订单任务被拒绝: {}", task.getOrderId());
                
                // 2. 尝试重新加入队列（等待1秒）
                try {
                    boolean offered = executor.getQueue().offer(r, 1, TimeUnit.SECONDS);
                    if (!offered) {
                        // 3. 如果还是加不进去，执行降级策略
                        executeFallback(task);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    executeFallback(task);
                }
            } else {
                // 默认策略：抛出异常
                throw new RejectedExecutionException("任务被拒绝");
            }
        }
        
        private void executeFallback(OrderTask task) {
            // 降级策略：比如同步执行、记录到数据库稍后重试等
            log.error("订单任务执行降级: {}", task.getOrderId());
            task.run(); // 直接在当前线程执行（注意：会阻塞当前线程！）
        }
    }
}
```



### 4.2 不同场景的线程池选择

java

```java
public class ThreadPoolSelector {
    
    // 场景1：快速响应的Web服务（Tomcat风格）
    public ExecutorService createWebServerPool() {
        return new ThreadPoolExecutor(
            100,        // 核心线程数较大，应对突发请求
            200,        // 最大线程数也较大
            60L,        // 空闲线程存活时间较短
            TimeUnit.SECONDS,
            new SynchronousQueue<>(), // 直接传递，不排队
            new NamedThreadFactory("web-worker"),
            new ThreadPoolExecutor.AbortPolicy() // 直接拒绝，快速失败
        );
    }
    
    // 场景2：批量数据处理
    public ExecutorService createBatchProcessingPool() {
        int processors = Runtime.getRuntime().availableProcessors();
        
        return new ThreadPoolExecutor(
            processors,     // 核心线程数 = CPU核心数
            processors * 2, // 最大线程数 = 2倍核心数（考虑IO等待）
            0L,            // 核心线程也允许回收
            TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>(), // 无界队列，积累任务
            new NamedThreadFactory("batch-worker"),
            new ThreadPoolExecutor.CallerRunsPolicy() // 调用者执行
        );
    }
    
    // 场景3：定时任务调度
    public ScheduledExecutorService createScheduledPool() {
        return new ScheduledThreadPoolExecutor(
            4,  // 核心线程数
            new NamedThreadFactory("scheduler"),
            new ThreadPoolExecutor.AbortPolicy()
        );
    }
    
    // 场景4：CPU密集型计算
    public ExecutorService createComputePool() {
        int processors = Runtime.getRuntime().availableProcessors();
        
        return new ThreadPoolExecutor(
            processors,     // 核心线程数 = CPU核心数
            processors,     // 最大线程数 = CPU核心数（避免过多线程切换）
            0L,
            TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>(1000), // 有界队列，防止任务堆积
            new NamedThreadFactory("compute-worker"),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
}
```



### 4.3 线程池监控与调优

java

```java
public class ThreadPoolMonitor {
    private final ThreadPoolExecutor executor;
    private final ScheduledExecutorService monitor;
    
    public ThreadPoolMonitor(ThreadPoolExecutor executor) {
        this.executor = executor;
        this.monitor = Executors.newSingleThreadScheduledExecutor();
    }
    
    public void startMonitoring() {
        // 每5秒收集一次指标
        monitor.scheduleAtFixedRate(this::collectMetrics, 0, 5, TimeUnit.SECONDS);
    }
    
    private void collectMetrics() {
        int poolSize = executor.getPoolSize();
        int activeCount = executor.getActiveCount();
        long completedTaskCount = executor.getCompletedTaskCount();
        int queueSize = executor.getQueue().size();
        int largestPoolSize = executor.getLargestPoolSize();
        
        // 计算关键指标
        double utilization = poolSize > 0 ? (double) activeCount / poolSize : 0;
        double queueLoad = queueSize / 1000.0; // 假设队列容量1000
        
        // 记录到监控系统
        recordMetric("threadpool.pool_size", poolSize);
        recordMetric("threadpool.active_threads", activeCount);
        recordMetric("threadpool.utilization", utilization);
        recordMetric("threadpool.queue_size", queueSize);
        recordMetric("threadpool.queue_load", queueLoad);
        recordMetric("threadpool.completed_tasks", completedTaskCount);
        
        // 动态调整线程池（谨慎使用！）
        if (queueLoad > 0.8 && utilization > 0.9) {
            // 队列快满了，且线程很忙，考虑扩容
            int newMax = Math.min(executor.getMaximumPoolSize(), poolSize * 2);
            if (newMax > poolSize) {
                executor.setMaximumPoolSize(newMax);
                log.info("线程池扩容到: {}", newMax);
            }
        } else if (queueLoad < 0.2 && utilization < 0.3) {
            // 队列很空，线程很闲，考虑缩容
            int newCore = Math.max(1, poolSize / 2);
            if (newCore < executor.getCorePoolSize()) {
                executor.setCorePoolSize(newCore);
                log.info("线程池缩容到: {}", newCore);
            }
        }
    }
    
    // 线程池健康检查
    public HealthCheckResponse healthCheck() {
        boolean isShutdown = executor.isShutdown();
        boolean isTerminated = executor.isTerminated();
        boolean isTerminating = executor.isTerminating();
        int queueSize = executor.getQueue().size();
        
        if (isShutdown || isTerminated || isTerminating) {
            return HealthCheckResponse.unhealthy("线程池已关闭或正在关闭");
        }
        
        if (queueSize > 1000) { // 假设阈值1000
            return HealthCheckResponse.unhealthy("任务队列堆积: " + queueSize);
        }
        
        // 检查是否有死锁（简化版）
        long activeCount = executor.getActiveCount();
        if (activeCount > 0) {
            // 检查活跃线程是否长时间不变化（可能是死锁）
            // 实际需要更复杂的检测逻辑
        }
        
        return HealthCheckResponse.healthy();
    }
}
```



## 五、实战：重构库存扣减系统

基于开头的死锁问题，我重构了整个库存系统：

![image-20260201224209606](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201224209606.png)

java

```java
public class InventoryManager {
    // 使用StripedLock：将大量锁分散到多个桶中，减少锁竞争
    private final Striped<Lock> locks = Striped.lock(64); // 64个锁
    
    // 使用ConcurrentHashMap + AtomicInteger保证原子性
    private final ConcurrentHashMap<String, AtomicInteger> inventory = new ConcurrentHashMap<>();
    
    // 使用限流器防止突发流量
    private final RateLimiter rateLimiter = RateLimiter.create(1000); // 每秒1000次
    
    // 使用线程池执行库存操作
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
    
    public CompletableFuture<Boolean> deductInventoryAsync(String sku, int quantity) {
        return CompletableFuture.supplyAsync(() -> {
            // 限流
            if (!rateLimiter.tryAcquire(1, 10, TimeUnit.MILLISECONDS)) {
                throw new RateLimitException("请求过于频繁");
            }
            
            // 获取分段锁
            Lock lock = locks.get(sku);
            if (!lock.tryLock(50, TimeUnit.MILLISECONDS)) {
                throw new LockTimeoutException("获取库存锁超时");
            }
            
            try {
                AtomicInteger stock = inventory.computeIfAbsent(sku, k -> new AtomicInteger(1000));
                
                // 使用CAS操作更新库存
                while (true) {
                    int current = stock.get();
                    if (current < quantity) {
                        return false; // 库存不足
                    }
                    
                    if (stock.compareAndSet(current, current - quantity)) {
                        // 成功扣减
                        return true;
                    }
                    // CAS失败，重试
                }
            } finally {
                lock.unlock();
            }
        }, executor);
    }
    
    // 批量扣减（避免死锁的关键）
    public CompletableFuture<Boolean> batchDeduct(Map<String, Integer> items) {
        return CompletableFuture.supplyAsync(() -> {
            // 1. 按照商品ID排序，保证获取锁的顺序一致
            List<String> sortedSkus = items.keySet().stream()
                .sorted()
                .collect(Collectors.toList());
            
            // 2. 按顺序获取所有锁
            List<Lock> acquiredLocks = new ArrayList<>();
            try {
                for (String sku : sortedSkus) {
                    Lock lock = locks.get(sku);
                    if (!lock.tryLock(100, TimeUnit.MILLISECONDS)) {
                        // 获取锁失败，释放所有已获得的锁
                        releaseLocks(acquiredLocks);
                        throw new LockTimeoutException("获取库存锁超时");
                    }
                    acquiredLocks.add(lock);
                }
                
                // 3. 检查所有商品的库存是否足够
                for (String sku : sortedSkus) {
                    int required = items.get(sku);
                    int available = inventory.getOrDefault(sku, new AtomicInteger(0)).get();
                    if (available < required) {
                        return false; // 库存不足
                    }
                }
                
                // 4. 扣减所有商品的库存
                for (String sku : sortedSkus) {
                    int required = items.get(sku);
                    AtomicInteger stock = inventory.computeIfAbsent(sku, k -> new AtomicInteger(1000));
                    stock.addAndGet(-required);
                }
                
                return true;
            } finally {
                // 5. 释放所有锁（按相反顺序释放，虽然不是必须的，但是个好习惯）
                Collections.reverse(acquiredLocks);
                releaseLocks(acquiredLocks);
            }
        }, executor);
    }
    
    private void releaseLocks(List<Lock> locksToRelease) {
        for (Lock lock : locksToRelease) {
            lock.unlock();
        }
    }
}
```



## 经验总结：我的多线程检查清单

### 安全性检查清单

- 是否避免了死锁？（锁顺序、超时机制）
- 是否处理了锁的可重入性？
- 是否在finally块中释放锁？
- 是否考虑了线程中断？
- 共享变量是否有正确的可见性保证？（volatile/原子类）

### 性能检查清单

- 锁的粒度是否足够细？（不要锁整个方法）
- 是否使用了读写锁优化读多写少场景？
- 线程池配置是否合理？（核心数、队列大小、拒绝策略）
- 是否有锁竞争监控？
- 是否考虑了CPU缓存行伪共享？

### 健壮性检查清单

- 是否有超时机制防止永久阻塞？
- 异常处理是否完善？（线程池任务异常、中断异常）
- 资源清理是否可靠？（线程池关闭、连接释放）
- 是否有降级策略？（拒绝任务时的处理）

### 可维护性检查清单

- 线程是否有有意义的名称？（便于调试）
- 是否有足够的日志记录关键操作？
- 是否有监控和告警机制？
- 代码是否易于测试？（可注入、可模拟）

## 最后的真相

那个死锁事故让我明白：

**多线程编程不是关于让代码跑得更快，而是关于让系统在并发环境下正确工作。**

我现在遵循的原则：

1. **优先使用高级并发工具**：BlockingQueue、ConcurrentHashMap、CompletableFuture
2. **避免手动创建线程**：使用线程池，不要new Thread()
3. **锁的范围要最小化**：只锁必要的部分，尽快释放
4. **总是考虑超时**：没有超时的等待是危险的
5. **监控比优化更重要**：先知道发生了什么，再考虑怎么优化

记住：**在并发世界里，正确性永远比性能更重要**。一个快的bug依然是bug，而一个正确但慢的系统至少可以工作。先让它正确，再让它变快。