# 【Java +AI ｜基础加强篇day13 多线程】

## 一、多线程核心基础 —— 从概念到应用

### 1. 线程与多线程的本质

- **线程（Thread）**：程序内部的一条执行流程，是 CPU 调度的最小单位。一个程序默认只有一条执行流程（主线程，`main`方法启动），即为单线程程序。

- **多线程**：通过软硬件实现多条执行流程的技术，多条线程由 CPU 调度执行，可同时处理多个任务。

- 核心价值

  ：

  - 提高程序效率（如文件下载时同时下载多个分片、服务器同时处理多个用户请求）。
  - 提升用户体验（如软件界面操作时，后台线程处理数据，界面不卡顿）。

- 典型应用场景

  ：

  - 互联网系统（淘宝、京东）：同时处理海量用户的下单、支付请求。
  - 工具类（百度网盘）：多线程上传 / 下载文件。
  - 消息通信（微信）：后台线程监听消息推送。

### 2. 并发与并行的区别（CPU 调度视角）

- 并发（Concurrency）

  ：CPU 分时轮询执行多个线程，同一时刻只有一个线程在执行，但切换速度极快，给人 “同时执行” 的错觉（适用于单核 CPU）。

  - 示例：单核 CPU 同时运行浏览器、IDE、微信，CPU 快速切换为每个线程分配时间片。

- 并行（Parallelism）

  ：同一时刻多个线程被多个 CPU 核心同时调度执行（适用于多核 CPU）。

  - 示例：四核 CPU 同时运行四个线程，每个核心负责一个线程，真正意义上的 “同时执行”。

- **核心结论**：多线程程序在多核 CPU 上是 “并发 + 并行” 结合 —— 部分线程并行执行，部分线程并发切换。

------

## 二、线程创建的三种方式 —— 原理、对比与场景

Java 提供三种线程创建方式，核心差异在于 “扩展性” 和 “是否能返回执行结果”，底层均依赖`Thread`类的调度。

### 1. 方式一：继承 Thread 类

#### （1）实现步骤

1. 定义子类继承`java.lang.Thread`类。
2. 重写`run()`方法（线程任务方法，封装线程要执行的逻辑）。
3. 创建子类对象。
4. 调用`start()`方法启动线程（而非直接调用`run()`）。

#### （2）核心示例

java

```java
// 1. 定义线程类
class MyThread extends Thread {
    @Override
    public void run() {
        // 线程任务：打印1-10
        for (int i = 1; i <= 10; i++) {
            System.out.println(Thread.currentThread().getName() + ":" + i);
        }
    }
}

// 2. 启动线程
public class ThreadDemo {
    public static void main(String[] args) {
        MyThread t1 = new MyThread();
        MyThread t2 = new MyThread();
        t1.setName("线程1");
        t2.setName("线程2");
        t1.start(); // 启动线程，JVM调用run()
        t2.start();
    }
}
```

#### （3）底层原理

- `start()`方法：向 JVM 注册线程，JVM 调用操作系统创建线程，线程状态变为就绪态，等待 CPU 调度，调度后执行`run()`方法。
- 直接调用`run()`：仅作为普通方法执行，不会创建新线程，仍在主线程中运行（单线程效果）。

#### （4）优缺点

- 优点：编码简单，可直接使用`Thread`类的方法（如`getName()`、`sleep()`）。
- 缺点：存在单继承局限性，线程类继承`Thread`后无法继承其他类，不利于功能扩展。

### 2. 方式二：实现 Runnable 接口

#### （1）实现步骤

1. 定义任务类实现`java.lang.Runnable`接口。
2. 重写`run()`方法（封装线程任务）。
3. 创建任务对象。
4. 将任务对象交给`Thread`类（`Thread`是线程载体，任务是线程要执行的逻辑）。
5. 调用`start()`方法启动线程。

#### （2）核心示例

java

```java
// 1. 定义任务类
class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 1; i <= 10; i++) {
            System.out.println(Thread.currentThread().getName() + ":" + i);
        }
    }
}

// 2. 启动线程
public class RunnableDemo {
    public static void main(String[] args) {
        // 创建任务对象
        MyRunnable task = new MyRunnable();
        // 任务交给Thread
        Thread t1 = new Thread(task, "线程A");
        Thread t2 = new Thread(task, "线程B");
        t1.start();
        t2.start();
    }
}
```

#### （3）简化写法：匿名内部类

java

```java
public class RunnableAnonymousDemo {
    public static void main(String[] args) {
        // 匿名内部类实现Runnable
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类线程执行");
            }
        });
        t.start();
    }
}
```

#### （4）优缺点

- 优点：扩展性强，任务类仅实现接口，可继续继承其他类、实现其他接口。
- 缺点：无法直接返回线程执行结果，需通过共享变量间接获取。

### 3. 方式三：实现 Callable 接口（JDK5+）

#### （1）核心解决问题

前两种方式的`run()`方法无返回值，若线程执行后需返回结果（如计算结果、任务状态），需使用`Callable`接口。

#### （2）实现步骤

1. 定义任务类实现`java.util.concurrent.Callable`接口（`V`是返回值类型）。
2. 重写`call()`方法（线程任务，有返回值，可抛出异常）。
3. 将`Callable`任务封装为`FutureTask`对象（用于接收返回值）。
4. 将`FutureTask`交给`Thread`启动线程。
5. 调用`FutureTask.get()`方法获取返回值（会阻塞当前线程，直到任务执行完毕）。

#### （3）核心示例

java

```java
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

// 1. 定义Callable任务
class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        // 任务：计算1-100的和
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
        return sum;
    }
}

// 2. 启动线程并获取结果
public class CallableDemo {
    public static void main(String[] args) throws Exception {
        // 封装任务
        FutureTask<Integer> futureTask = new FutureTask<>(new MyCallable());
        // 启动线程
        new Thread(futureTask, "计算线程").start();
        // 获取返回值（阻塞主线程，直到任务完成）
        Integer result = futureTask.get();
        System.out.println("1-100的和：" + result); // 输出5050
    }
}
```

#### （4）优缺点

- 优点：扩展性强（可继承其他类）；支持返回执行结果；`call()`方法可抛出异常，便于异常处理。
- 缺点：编码复杂，需借助`FutureTask`封装，获取结果时可能阻塞。

### 4. 三种创建方式对比

| 方式               | 优点                           | 缺点                       | 适用场景                       |
| ------------------ | ------------------------------ | -------------------------- | ------------------------------ |
| 继承 Thread 类     | 编码简单，直接使用 Thread 方法 | 单继承局限性，无返回值     | 简单任务，无需扩展其他类       |
| 实现 Runnable 接口 | 扩展性强，可继承其他类         | 无返回值，异常需内部处理   | 多线程共享资源，需扩展其他功能 |
| 实现 Callable 接口 | 扩展性强，支持返回值和异常抛出 | 编码复杂，获取结果可能阻塞 | 有返回值的任务（如计算、查询） |

------

## 三、线程常用方法 —— 原理与场景应用

`Thread`类提供核心方法用于线程控制，底层依赖操作系统的线程调度机制，关键要区分 “是否释放 CPU”“是否释放锁”。

### 1. 核心方法分类与解析

#### （1）线程启动与任务方法

| 方法名         | 作用                          | 底层原理与注意事项                                           |
| -------------- | ----------------------------- | ------------------------------------------------------------ |
| `void start()` | 启动线程，触发`run()`方法执行 | 向 JVM 注册线程，创建操作系统线程，就绪态等待调度；不可重复调用（否则抛`IllegalThreadStateException`） |
| `void run()`   | 线程任务方法，封装执行逻辑    | 直接调用仅为普通方法，不创建新线程                           |

#### （2）线程命名与获取

| 方法名                          | 作用                              | 应用场景                                 |
| ------------------------------- | --------------------------------- | ---------------------------------------- |
| `String getName()`              | 获取线程名称（默认`Thread-索引`） | 日志打印、线程调试                       |
| `void setName(String name)`     | 设置线程名称                      | 区分多线程，便于问题定位                 |
| `static Thread currentThread()` | 获取当前执行的线程对象            | 多线程中获取当前线程信息（如名称、状态） |

#### （3）线程休眠与等待

| 方法名                       | 作用                                         | 底层原理与注意事项                                           |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `static void sleep(long ms)` | 让当前线程休眠指定毫秒，释放 CPU 资源        | 不释放锁；休眠期间可被`interrupt()`唤醒，抛`InterruptedException` |
| `final void join()`          | 让调用该方法的线程先执行完毕，其他线程再执行 | 如主线程调用`t.join()`，主线程等待`t`完成；可设置超时时间（`join(long ms)`） |

#### （4）其他常用方法

| 方法名                | 作用                                     | 适用场景                                |
| --------------------- | ---------------------------------------- | --------------------------------------- |
| `static void yield()` | 当前线程礼让 CPU，回到就绪态，不释放锁   | 优先级低的线程礼让高优先级线程          |
| `void interrupt()`    | 中断线程（如唤醒休眠的线程）             | 终止阻塞状态的线程（如`sleep`、`wait`） |
| `boolean isAlive()`   | 判断线程是否存活（就绪 / 运行态为 true） | 线程状态监控                            |

### 2. 关键方法使用场景示例

#### （1）sleep ()：模拟任务耗时

java

```java
// 模拟下载文件，每个分片下载耗时1秒
public class SleepDemo {
    public static void main(String[] args) {
        new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("下载分片" + i + "...");
                try {
                    Thread.sleep(1000); // 模拟耗时1秒
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("下载完成！");
        }, "下载线程").start();
    }
}
```

#### （2）join ()：等待子线程完成

java

```java
// 主线程等待计算线程完成后，打印结果
public class JoinDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread calcThread = new Thread(() -> {
            int sum = 0;
            for (int i = 1; i <= 100; i++) {
                sum += i;
            }
            System.out.println("计算结果：" + sum);
        });
        calcThread.start();
        calcThread.join(); // 主线程等待calcThread完成
        System.out.println("主线程继续执行");
    }
}
```

------

## 四、线程安全 —— 问题根源与解决方案

### 1. 线程安全问题的核心原因

当**多个线程同时操作同一个共享资源，且存在修改操作**时，会导致数据不一致、业务逻辑错误，即线程安全问题。

#### （1）经典场景：银行取钱案例

- 共享资源：夫妻共同账户（余额 10 万元）。
- 线程：小明线程、小红线程（均要取 10 万元）。
- 问题过程：
  1. 小明线程判断余额≥10 万 → 小红线程判断余额≥10 万（此时均未扣减余额）。
  2. 小明线程吐出 10 万 → 余额 0 万。
  3. 小红线程吐出 10 万 → 余额 - 10 万（银行亏损）。
- 本质：“判断余额” 和 “扣减余额” 是两步操作，未被原子化，多线程穿插执行导致逻辑错误。

#### （2）代码模拟线程安全问题

java

```java
// 共享账户类
class Account {
    private int balance; // 余额

    public Account(int balance) {
        this.balance = balance;
    }

    // 取钱方法（未加锁，线程不安全）
    public void withdraw(int money) {
        if (balance >= money) {
            System.out.println(Thread.currentThread().getName() + "准备取钱...");
            try {
                Thread.sleep(100); // 模拟耗时操作，放大问题
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            balance -= money;
            System.out.println(Thread.currentThread().getName() + "取钱成功，余额：" + balance);
        } else {
            System.out.println(Thread.currentThread().getName() + "取钱失败，余额不足");
        }
    }
}

// 测试类
public class ThreadSafeDemo {
    public static void main(String[] args) {
        Account account = new Account(100000); // 共享账户，余额10万
        // 小明和小红同时取钱
        new Thread(() -> account.withdraw(100000), "小明").start();
        new Thread(() -> account.withdraw(100000), "小红").start();
    }
}
// 可能输出：小明准备取钱... 小红准备取钱... 小明取钱成功，余额：0 小红取钱成功，余额：-100000
```

### 2. 线程同步 —— 解决方案（让线程有序访问资源）

线程同步的核心思想：**让多个线程先后依次访问共享资源**，通过 “加锁” 实现原子操作（不可分割的操作）。

#### （1）方案一：同步代码块（灵活控制锁范围）

##### 原理

通过`synchronized`关键字包裹核心代码，指定 “锁对象”，每次仅允许一个线程获取锁进入代码块，执行完毕自动释放锁。

##### 语法格式

java

```java
synchronized (锁对象) {
    // 访问共享资源的核心代码（原子操作）
}
```

##### 关键规则

- 锁对象必须是**同一个对象**（多线程共享），否则锁无效。
- 推荐锁对象：共享资源本身（如`this`代表当前账户对象）、类字节码对象（`Account.class`，适用于静态方法）。

##### 修复取钱案例（同步代码块）

java

```java
// 取钱方法（加同步代码块，线程安全）
public void withdraw(int money) {
    synchronized (this) { // 锁对象为当前账户（共享资源）
        if (balance >= money) {
            System.out.println(Thread.currentThread().getName() + "准备取钱...");
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            balance -= money;
            System.out.println(Thread.currentThread().getName() + "取钱成功，余额：" + balance);
        } else {
            System.out.println(Thread.currentThread().getName() + "取钱失败，余额不足");
        }
    }
}
// 输出：小明准备取钱... 小明取钱成功，余额：0 小红取钱失败，余额不足
```

#### （2）方案二：同步方法（锁范围为整个方法）

##### 原理

`synchronized`修饰方法，底层隐式指定锁对象，核心代码为整个方法体，简化编码。

##### 语法格式

java

```java
修饰符 synchronized 返回值类型 方法名(参数) {
    // 访问共享资源的代码
}
```

##### 隐式锁对象

- 实例方法：锁对象为`this`（当前对象）。
- 静态方法：锁对象为`类名.class`（类字节码对象）。

##### 修复取钱案例（同步方法）

java

```java
// 同步方法，线程安全
public synchronized void withdraw(int money) {
    if (balance >= money) {
        System.out.println(Thread.currentThread().getName() + "准备取钱...");
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        balance -= money;
        System.out.println(Thread.currentThread().getName() + "取钱成功，余额：" + balance);
    } else {
        System.out.println(Thread.currentThread().getName() + "取钱失败，余额不足");
    }
}
```

##### 同步代码块 vs 同步方法

| 对比维度 | 同步代码块                   | 同步方法                     |
| -------- | ---------------------------- | ---------------------------- |
| 锁范围   | 灵活，可包裹部分核心代码     | 固定，整个方法体             |
| 可读性   | 较差                         | 较好                         |
| 性能     | 较高（锁范围小，竞争少）     | 较低（锁范围大，竞争多）     |
| 适用场景 | 核心代码少，需灵活控制锁范围 | 核心代码占整个方法，编码简化 |

#### （3）方案三：Lock 锁（JDK5+，灵活可控）

##### 核心优势

`synchronized`是隐式锁（自动加锁 / 释放），`Lock`是显式锁，支持手动加锁 / 释放，提供更灵活的 API（如超时锁、公平锁）。

##### 核心 API（`java.util.concurrent.locks.Lock`）

| 方法名              | 作用                                     |
| ------------------- | ---------------------------------------- |
| `void lock()`       | 获取锁（阻塞等待，直到获取成功）         |
| `void unlock()`     | 释放锁（必须手动调用，建议放在 finally） |
| `boolean tryLock()` | 尝试获取锁（非阻塞，获取成功返回 true）  |

##### 实现类：`ReentrantLock`（可重入锁）

- 可重入：同一线程可多次获取同一把锁，不会死锁。
- 公平锁：通过构造器`new ReentrantLock(true)`创建，按线程等待顺序分配锁（默认非公平锁）。

##### 修复取钱案例（Lock 锁）

java

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

class Account {
    private int balance;
    private final Lock lock = new ReentrantLock(); // 锁对象，final避免被篡改

    public Account(int balance) {
        this.balance = balance;
    }

    public void withdraw(int money) {
        lock.lock(); // 加锁
        try {
            if (balance >= money) {
                System.out.println(Thread.currentThread().getName() + "准备取钱...");
                Thread.sleep(100);
                balance -= money;
                System.out.println(Thread.currentThread().getName() + "取钱成功，余额：" + balance);
            } else {
                System.out.println(Thread.currentThread().getName() + "取钱失败，余额不足");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock(); // 释放锁，确保一定执行
        }
    }
}
```

##### `synchronized` vs `Lock`

| 对比维度 | synchronized                     | Lock（ReentrantLock）               |
| -------- | -------------------------------- | ----------------------------------- |
| 锁类型   | 隐式锁（自动加锁 / 释放）        | 显式锁（手动加锁 / 释放）           |
| 灵活性   | 低（仅支持非公平锁，无超时）     | 高（支持公平锁、超时锁、尝试锁）    |
| 可重入性 | 支持                             | 支持                                |
| 异常处理 | 自动释放锁                       | 需在 finally 中手动释放，否则锁泄漏 |
| 性能     | JDK8 后优化，与 Lock 接近        | 高并发下略优于 synchronized         |
| 适用场景 | 简单场景（如单线程访问共享资源） | 复杂场景（如超时控制、公平锁需求）  |

------

## 五、线程池 —— 高并发场景的核心优化

### 1. 线程池的核心价值

- 问题：频繁创建 / 销毁线程开销大（线程是重量级资源，涉及操作系统内核态切换），高并发下大量线程会导致 CPU 过载、内存溢出。
- 解决方案：线程池是 “线程复用技术”，提前创建一定数量的线程，任务完成后不销毁，复用处理新任务。
- 核心优势：
  - 降低线程创建 / 销毁开销，提高响应速度。
  - 控制最大线程数，避免资源耗尽。
  - 统一管理线程，便于监控和调度。

### 2. 线程池的工作原理

#### （1）核心组件

- **核心线程（Core Thread）**：线程池长期保留的线程（正式工），即使空闲也不销毁。
- **临时线程（Temporary Thread）**：核心线程忙且任务队列满时，临时创建的线程（临时工），空闲超过指定时间会被销毁。
- **任务队列（Work Queue）**：存放等待执行的任务（如`LinkedBlockingQueue`）。
- **拒绝策略（Rejected Execution Handler）**：线程和队列都满时，新任务的处理策略。

#### （2）工作流程（以`ThreadPoolExecutor`为例）

1. 新任务提交，先判断核心线程是否空闲：空闲则核心线程执行任务；否则进入步骤 2。
2. 判断任务队列是否已满：未满则任务入队等待；否则进入步骤 3。
3. 判断当前线程数是否达到最大线程数：未达到则创建临时线程执行任务；否则执行拒绝策略。

### 3. 线程池的核心参数（7 个）

`ThreadPoolExecutor`是线程池的核心实现类，构造器 7 个参数决定线程池行为：

java

```java
public ThreadPoolExecutor(
    int corePoolSize,        // 核心线程数（正式工数量）
    int maximumPoolSize,     // 最大线程数（正式工+临时工总数）
    long keepAliveTime,      // 临时线程空闲时间
    TimeUnit unit,           // 空闲时间单位（如TimeUnit.SECONDS）
    BlockingQueue<Runnable> workQueue, // 任务队列
    ThreadFactory threadFactory,       // 线程工厂（创建线程的方式）
    RejectedExecutionHandler handler  // 拒绝策略
) {}
```

#### 参数示例（电商订单处理线程池）

java

```java
// 核心线程5，最大线程10，临时线程空闲30秒销毁，队列容量100
ExecutorService executor = new ThreadPoolExecutor(
    5,                      // 核心线程5（日常处理订单）
    10,                     // 最大线程10（高峰期临时加5个线程）
    30,                     // 临时线程空闲30秒销毁
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100), // 队列最多存100个待处理订单
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.AbortPolicy() // 拒绝策略：抛异常
);
```

### 4. 线程池的创建方式

#### （1）方式一：`ThreadPoolExecutor`（推荐，阿里开发手册要求）

- 优势：明确线程池参数，规避资源耗尽风险，适用于生产环境。
- 示例：处理 Runnable 任务

java

```java
// 处理Runnable任务（无返回值）
executor.execute(() -> {
    System.out.println("处理订单：" + Thread.currentThread().getName());
});

// 处理Callable任务（有返回值）
Future<Integer> future = executor.submit(() -> {
    // 计算订单金额总和
    return 1000;
});
Integer total = future.get(); // 获取返回值
```

#### （2）方式二：`Executors`工具类（不推荐生产环境）

`Executors`提供静态方法快速创建线程池，但存在资源耗尽风险：

| 方法名                          | 特点                       | 风险点                                                  |
| ------------------------------- | -------------------------- | ------------------------------------------------------- |
| `newFixedThreadPool(int n)`     | 固定核心线程数，无临时线程 | 队列容量为`Integer.MAX_VALUE`，可能堆积大量任务导致 OOM |
| `newSingleThreadExecutor()`     | 单核心线程                 | 队列容量过大，OOM 风险                                  |
| `newCachedThreadPool()`         | 无核心线程，临时线程无上限 | 临时线程数可达`Integer.MAX_VALUE`，创建大量线程导致 OOM |
| `newScheduledThreadPool(int n)` | 定时 / 周期性执行任务      | 核心线程无上限风险                                      |

### 5. 线程池的拒绝策略

当线程数达最大且队列满时，新任务的处理方式：

| 拒绝策略              | 行为                                     | 适用场景                     |
| --------------------- | ---------------------------------------- | ---------------------------- |
| `AbortPolicy`（默认） | 丢弃任务并抛`RejectedExecutionException` | 核心业务，不允许任务丢失     |
| `DiscardPolicy`       | 丢弃任务，不抛异常                       | 非核心业务，允许任务丢失     |
| `DiscardOldestPolicy` | 丢弃队列中最久的任务，加入新任务         | 任务无优先级，允许丢弃旧任务 |
| `CallerRunsPolicy`    | 由提交任务的线程（如主线程）执行         | 避免任务丢失，容忍主线程阻塞 |

### 6. 线程池的关闭

- `void shutdown()`：等待所有任务执行完毕后关闭线程池（优雅关闭）。
- `List shutdownNow()`：立即关闭，停止正在执行的任务，返回未执行的任务（强制关闭）。

------

## 六、核心总结与面试重点

### 1. 核心知识点梳理

| 模块     | 核心重点                                      | 底层原理 / 场景                                           |
| -------- | --------------------------------------------- | --------------------------------------------------------- |
| 线程创建 | 三种方式对比、start () 与 run () 的区别       | start () 启动线程，run () 是任务方法；Callable 支持返回值 |
| 线程安全 | 问题原因（共享资源 + 修改）、三种同步方案对比 | synchronized 隐式锁，Lock 显式锁；银行转账、库存扣减场景  |
| 线程池   | 7 个核心参数、工作流程、拒绝策略              | 高并发请求处理（电商秒杀、接口调用）                      |
| 并发并行 | 单核并发（轮询）、多核并行（同时执行）        | CPU 调度机制                                              |

### 2. 实战场景对应技术选择

| 业务场景                       | 推荐技术                    | 原因                               |
| ------------------------------ | --------------------------- | ---------------------------------- |
| 简单无返回值任务               | 继承 Thread / 实现 Runnable | 编码简单                           |
| 有返回值的计算任务             | 实现 Callable+FutureTask    | 支持返回值和异常处理               |
| 银行转账、库存扣减（线程安全） | synchronized/Lock           | 保证原子操作，避免数据不一致       |
| 高并发接口请求（如电商秒杀）   | ThreadPoolExecutor          | 线程复用，控制最大线程数，避免 OOM |
| 定时任务（如定时对账）         | ScheduledThreadPoolExecutor | 支持定时 / 周期性执行              |

------

# 5 道 Java 多线程中大厂面试题

## 面试题 1

请详细对比 Java 中三种线程创建方式（继承 Thread 类、实现 Runnable 接口、实现 Callable 接口）的核心差异，包括底层原理、扩展性、返回值支持及适用场景。同时说明：为什么调用`start()`方法能启动新线程，而直接调用`run()`方法不行？JVM 在`start()`方法中做了哪些关键操作？

## 面试题 2

线程安全问题的核心产生条件是什么？请从 “原子性、可见性、有序性” 三个维度分析线程安全问题的本质。并对比`synchronized`与`Lock`（ReentrantLock）的核心差异（锁类型、灵活性、异常处理、性能优化），说明在高并发场景下如何选择这两种同步方案？

## 面试题 3

ThreadPoolExecutor 的 7 个核心参数分别是什么？请结合 “电商秒杀场景” 说明每个参数的设置逻辑（如核心线程数、最大线程数、任务队列、拒绝策略的选择）。为什么阿里巴巴开发手册禁止使用 Executors 创建线程池？请分析`newCachedThreadPool()`和`newFixedThreadPool()`的潜在风险。

## 面试题 4

Java 线程的生命周期包含哪些状态？请说明状态之间的转换触发条件。同时对比`Thread.sleep(long ms)`、`Object.wait()`、`Thread.yield()`、`Thread.join()`的核心差异（是否释放 CPU、是否释放锁、适用场景），并举例说明`wait()`和`notify()`的协作流程。

## 面试题 5

什么是线程的可见性问题？`volatile`关键字如何保证可见性和有序性？其底层的内存屏障机制是怎样的？另外，`ThreadLocal`的核心作用是什么？使用`ThreadLocal`时可能出现内存泄漏的原因是什么？如何避免？

------

# 面试题答案

## 面试题 1 答案

### 1. 三种线程创建方式的核心差异

| 对比维度       | 继承 Thread 类                                           | 实现 Runnable 接口                                     | 实现 Callable 接口                                    |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| **底层原理**   | 子类继承 Thread，重写`run()`作为任务方法；线程与任务绑定 | 任务与线程分离：Runnable 封装任务，Thread 作为线程载体 | 任务与线程分离，通过`FutureTask`封装任务，支持返回值  |
| **扩展性**     | 单继承局限性（无法继承其他类）                           | 可继承其他类、实现其他接口，扩展性强                   | 可继承其他类、实现其他接口，扩展性强                  |
| **返回值支持** | 无（`run()`返回 void）                                   | 无（`run()`返回 void）                                 | 有（`call()`返回泛型`V`，通过`FutureTask.get()`获取） |
| **异常处理**   | `run()`无法抛出 checked 异常，需内部捕获                 | `run()`无法抛出 checked 异常，需内部捕获               | `call()`可抛出 checked 异常，外部通过`get()`捕获      |
| **适用场景**   | 简单无返回值任务（如日志打印）                           | 多线程共享资源（如共享账户取钱）                       | 有返回值的任务（如计算订单金额、数据库查询）          |

### 2. `start()`与`run()`的核心差异

#### （1）`start()`能启动新线程的原因

`start()`方法是线程启动的 “入口”，JVM 在`start()`中完成以下关键操作：

1. **注册线程**：向 JVM 的线程调度器注册当前线程，申请操作系统资源（如线程 ID、栈空间）。
2. **创建操作系统线程**：JVM 调用操作系统的`pthread_create`（Linux）或`CreateThread`（Windows）接口，创建内核级线程。
3. **设置线程状态**：将线程状态从`NEW`（新建态）转为`RUNNABLE`（就绪态），等待 CPU 调度。
4. **触发`run()`执行**：CPU 调度到该线程时，JVM 自动调用`run()`方法（任务逻辑），此时执行流程与主线程并行。

#### （2）直接调用`run()`不行的原因

直接调用`run()`时，`run()`仅作为普通方法执行，不会触发 JVM 的线程注册和内核线程创建，代码仍在当前线程（如主线程）中执行，无新线程启动，本质是单线程逻辑。

## 面试题 2 答案

### 1. 线程安全问题的核心产生条件

线程安全问题需同时满足三个条件：

1. **多线程并发执行**：至少两个线程同时运行。
2. **共享资源**：线程操作同一个可修改的资源（如共享变量、数据库记录）。
3. **非原子操作**：对共享资源的操作无法一次性完成（如 “判断余额 + 扣减余额” 是两步操作）。

从并发三大特性角度分析本质：

- **原子性缺失**：非原子操作被多线程穿插执行（如取钱时 “判断” 和 “扣减” 分离）。
- **可见性缺失**：线程修改共享变量后，其他线程无法立即感知（如未加锁的共享变量）。
- **有序性缺失**：JVM 指令重排序导致代码执行顺序与预期不一致（如单例模式的 DCL 问题）。

### 2. `synchronized`与`Lock`的核心差异

| 对比维度     | synchronized                                                 | Lock（ReentrantLock）                                        |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **锁类型**   | 隐式锁（自动加锁 / 释放）：进入同步块自动加锁，退出同步块（正常 / 异常）自动释放 | 显式锁（手动加锁 / 释放）：需调用`lock()`加锁，`unlock()`释放（必须在 finally 中调用） |
| **灵活性**   | 低：仅支持非公平锁，无超时 / 尝试锁机制                      | 高：支持公平锁（构造器`new ReentrantLock(true)`）、超时锁（`tryLock(long ms)`）、尝试锁（`tryLock()`） |
| **可重入性** | 支持（同一线程可多次获取同一锁）                             | 支持（默认可重入，`getHoldCount()`查看重入次数）             |
| **异常处理** | 异常时自动释放锁，无锁泄漏风险                               | 异常时需手动释放锁（否则锁泄漏），需在 finally 中调用`unlock()` |
| **性能优化** | JDK8 后优化（偏向锁→轻量级锁→重量级锁升级），高并发下性能接近 Lock | 高并发下性能略优，支持锁中断（`lockInterruptibly()`）        |
| **适用场景** | 简单同步场景（如单线程修改共享变量）                         | 复杂场景（如超时控制、公平锁需求、锁中断）                   |

### 3. 高并发场景选择策略

- 若场景简单（无特殊需求）：优先用`synchronized`，编码简单且无锁泄漏风险。
- 若需公平锁、超时控制、锁中断：必须用`Lock`（如秒杀场景中防止线程无限等待锁）。
- 若需统计锁信息（如重入次数）：用`Lock`的`getHoldCount()`、`isLocked()`等方法。

## 面试题 3 答案

### 1. ThreadPoolExecutor 的 7 个核心参数

| 参数名            | 含义                                  | 电商秒杀场景设置逻辑                                         |
| ----------------- | ------------------------------------- | ------------------------------------------------------------ |
| `corePoolSize`    | 核心线程数（长期保留的线程）          | 设为 CPU 核心数 ×2（如 8 核 CPU 设 16），应对日常秒杀流量    |
| `maximumPoolSize` | 最大线程数（核心 + 临时线程）         | 设为 CPU 核心数 ×4（如 32），应对秒杀峰值流量，避免线程过多导致 CPU 过载 |
| `keepAliveTime`   | 临时线程空闲时间                      | 设为 60 秒，峰值过后销毁临时线程，节省资源                   |
| `unit`            | 空闲时间单位                          | 设为`TimeUnit.SECONDS`                                       |
| `workQueue`       | 任务队列（存放待执行任务）            | 用`ArrayBlockingQueue`，容量设 1000（避免 OOM，同时缓冲峰值任务） |
| `threadFactory`   | 线程工厂（创建线程的方式）            | 用自定义工厂，设置线程名（如 “seckill-thread-1”），便于排查问题 |
| `handler`         | 拒绝策略（线程 + 队列满时处理新任务） | 用`CallerRunsPolicy`，让主线程执行任务，避免秒杀任务丢失     |

### 2. 阿里开发手册禁止 Executors 的原因

Executors 创建的线程池存在**资源耗尽风险**，底层是因为参数设计不合理：

- `newFixedThreadPool(int n)`/`newSingleThreadExecutor()`

  ：

  - 队列用`LinkedBlockingQueue`，容量为`Integer.MAX_VALUE`（约 21 亿）。
  - 风险：秒杀场景中任务大量堆积，导致堆内存溢出（OOM）。

- `newCachedThreadPool()`

  ：

  - 核心线程数 0，临时线程无上限（`Integer.MAX_VALUE`）。
  - 风险：秒杀峰值时创建大量临时线程，导致 CPU 过载或线程栈内存溢出。

- `newScheduledThreadPool(int n)`

  ：

  - 核心线程数无上限，任务队列容量过大。
  - 风险：定时任务堆积，导致 OOM。

### 3. 电商秒杀场景线程池配置示例

java

运行

```java
// 秒杀线程池配置
ExecutorService seckillPool = new ThreadPoolExecutor(
    16,                      // 核心线程数（8核CPU×2）
    32,                      // 最大线程数（8核CPU×4）
    60,                      // 临时线程空闲60秒销毁
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000), // 队列容量1000，避免OOM
    new ThreadFactory() {    // 自定义线程工厂
        private final AtomicInteger count = new AtomicInteger(1);
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r);
            t.setName("seckill-thread-" + count.getAndIncrement());
            return t;
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略：主线程执行
);
```

## 面试题 4 答案

### 1. 线程的生命周期与状态转换

Java 线程生命周期包含 6 个状态（JDK 定义）：

| 状态名称                      | 含义                                   | 转换触发条件                              |
| ----------------------------- | -------------------------------------- | ----------------------------------------- |
| `NEW`（新建态）               | 线程已创建，未启动                     | `new Thread()`后，未调用`start()`         |
| `RUNNABLE`（就绪态）          | 线程已启动，等待 CPU 调度              | 调用`start()`、`yield()`、唤醒阻塞线程    |
| `BLOCKED`（阻塞态）           | 线程等待锁（如`synchronized`未获取锁） | 线程竞争锁失败                            |
| `WAITING`（等待态）           | 线程无超时等待唤醒（如`wait()`）       | 调用`Object.wait()`、`Thread.join()`      |
| `TIMED_WAITING`（超时等待态） | 线程有超时等待唤醒（如`sleep(1000)`）  | 调用`Thread.sleep(ms)`、`Object.wait(ms)` |
| `TERMINATED`（终止态）        | 线程执行完毕或异常终止                 | `run()`执行完毕、线程抛未捕获异常         |

### 2. 线程调度方法的核心差异

| 方法名                  | 是否释放 CPU             | 是否释放锁               | 核心作用                                     | 适用场景                        |
| ----------------------- | ------------------------ | ------------------------ | -------------------------------------------- | ------------------------------- |
| `Thread.sleep(long ms)` | 是（让出时间片）         | 否（持有锁时不释放）     | 让线程休眠指定时间，休眠后回到就绪态         | 模拟耗时操作（如下载分片）      |
| `Object.wait()`         | 是                       | 是（必须在同步块中调用） | 线程等待唤醒，无超时，需`notify()`唤醒       | 线程间协作（如生产者 - 消费者） |
| `Thread.yield()`        | 是（礼让给同优先级线程） | 否                       | 线程主动礼让 CPU，回到就绪态，可能立即被调度 | 低优先级线程礼让高优先级线程    |
| `Thread.join()`         | 是（调用线程等待）       | 否                       | 让调用线程等待当前线程执行完毕               | 主线程等待子线程计算结果        |

### 3. `wait()`与`notify()`的协作流程（生产者 - 消费者示例）

java



```java
// 共享队列（生产者-消费者模型）
class SharedQueue {
    private Queue<String> queue = new LinkedList<>();
    private final int MAX_SIZE = 5;

    // 生产者添加任务
    public synchronized void produce(String task) throws InterruptedException {
        while (queue.size() == MAX_SIZE) {
            wait(); // 队列满，生产者等待，释放锁
        }
        queue.add(task);
        System.out.println("生产者添加任务：" + task);
        notify(); // 唤醒消费者
    }

    // 消费者获取任务
    public synchronized String consume() throws InterruptedException {
        while (queue.isEmpty()) {
            wait(); // 队列空，消费者等待，释放锁
        }
        String task = queue.poll();
        System.out.println("消费者获取任务：" + task);
        notify(); // 唤醒生产者
        return task;
    }
}

// 协作流程：
// 1. 队列满时，生产者调用wait()释放锁，进入WAITING态。
// 2. 消费者获取锁，消费任务后调用notify()，唤醒生产者。
// 3. 生产者被唤醒，重新判断队列是否满，未满则添加任务。
```

## 面试题 5 答案

### 1. 线程可见性问题

可见性问题是指：**线程 A 修改共享变量后，线程 B 无法立即读取到最新值**，根源是 CPU 缓存和指令重排序：

- CPU 缓存：线程操作共享变量时，先读写 CPU 缓存，再同步到主内存，其他线程读取的是旧缓存值。
- 指令重排序：JVM 为优化性能，调整指令执行顺序，导致线程读取到未同步的变量值。

### 2. `volatile`保证可见性和有序性的原理

#### （1）保证可见性

- 写操作：线程修改`volatile`变量时，JVM 强制将变量从 CPU 缓存同步到主内存，并标记其他线程的 CPU 缓存中该变量为 “无效”。
- 读操作：线程读取`volatile`变量时，JVM 强制从主内存读取，而非 CPU 缓存，确保获取最新值。

#### （2）保证有序性：内存屏障

`volatile`通过插入内存屏障（禁止指令重排序）实现有序性，JVM 在`volatile`变量的读写前后插入 4 种屏障：

| 屏障类型        | 作用                       | 插入位置                                 |
| --------------- | -------------------------- | ---------------------------------------- |
| LoadLoad 屏障   | 禁止读操作重排序           | `volatile`读操作前                       |
| StoreStore 屏障 | 禁止写操作重排序           | `volatile`写操作前                       |
| LoadStore 屏障  | 禁止读操作后重排序为写操作 | `volatile`读操作后                       |
| StoreLoad 屏障  | 禁止写操作后重排序为读操作 | `volatile`写操作后（最核心，保证可见性） |

#### （3）局限性

`volatile`仅保证可见性和有序性，**不保证原子性**（如`volatile int i=0; i++`仍存在线程安全问题，需配合`synchronized`或`AtomicInteger`）。

### 3. `ThreadLocal`的核心作用与内存泄漏

#### （1）核心作用

`ThreadLocal`是 “线程局部变量”，为每个线程创建独立的变量副本，实现**线程隔离**，避免多线程共享变量的安全问题。

- 应用场景：Spring 事务管理（存储当前线程的数据库连接）、Web 开发（存储当前请求的用户信息）。

#### （2）内存泄漏原因

`ThreadLocal`的底层是`Thread`类的`threadLocals`（`ThreadLocalMap`），键是`ThreadLocal`的弱引用，值是变量副本（强引用）：

- 当`ThreadLocal`对象被回收（无强引用），键（弱引用）会被 GC 回收，但值（强引用）仍被`Thread`持有。
- 若`Thread`长期存活（如线程池核心线程），值无法被 GC 回收，导致内存泄漏。

#### （3）避免方案

1. 手动移除

   ：使用完

   ```
   ThreadLocal
   ```

   后，调用

   ```
   remove()
   ```

   方法删除值（

   ```
   threadLocals.remove(this)
   ```

   ），避免值长期持有。

   java

   

   运行

   

   ```java
   ThreadLocal<String> userLocal = new ThreadLocal<>();
   try {
       userLocal.set("admin"); // 设置值
       // 业务逻辑
   } finally {
       userLocal.remove(); // 手动移除，避免内存泄漏
   }
   ```

   

2. **使用弱引用`ThreadLocal`**：避免`ThreadLocal`对象被强引用长期持有（如不定义为静态变量）。

3. **控制线程生命周期**：线程池核心线程需定期清理`ThreadLocal`，避免长期存活线程导致泄漏。



