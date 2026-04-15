### Java AIO 全面解析：原理、API 及实战题型

#### 一、Java AIO 核心原理与设计思想

Java AIO（Asynchronous I/O，异步非阻塞 I/O）是 JDK 1.7 引入的 I/O 模型，核心特点是**异步非阻塞**：

- **异步**：I/O 操作的发起者无需主动等待结果，操作完成后由操作系统通过回调或通知机制告知应用程序。
- **非阻塞**：发起 I/O 操作后，线程不会被阻塞，可立即返回处理其他任务。

AIO 彻底解决了 BIO 的线程阻塞问题和 NIO 的主动轮询开销，更适合高并发、低延迟的场景。

##### 1. 核心工作机制

AIO 的工作流程基于**操作系统异步 I/O 支持**（如 Windows 的 IOCP、Linux 的`io_uring`）：

1. 应用程序发起异步 I/O 操作（如读取数据），并指定操作完成后的回调函数。
2. 操作系统接管 I/O 操作，应用程序线程立即返回，可执行其他任务。
3. 当 I/O 操作完成（如数据就绪），操作系统将结果放入缓冲区，并通知应用程序。
4. 应用程序通过回调函数或 Future 对象获取结果，处理数据。

##### 2. 与其他 I/O 模型的区别

| 模型 | 核心特点                  | 线程状态       | 适用场景                       |
| ---- | ------------------------- | -------------- | ------------------------------ |
| BIO  | 同步阻塞                  | 操作时阻塞     | 低并发、短连接（如内部系统）   |
| NIO  | 同步非阻塞（多路复用）    | 需主动轮询检查 | 中高并发（如服务端通信）       |
| AIO  | 异步非阻塞（回调 / 通知） | 完全不阻塞     | 高并发、低延迟（如分布式系统） |

#### 二、核心 API 详解

Java AIO 的核心类位于`java.nio.channels`包，主要包括异步通道和回调处理类。

##### 1. 异步通道（AsynchronousChannel）

异步通道是 AIO 的核心，负责发起异步 I/O 操作，主要实现类：

| 通道类型                          | 作用                          | 核心方法                                                     |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| `AsynchronousServerSocketChannel` | 服务器端监听连接              | `bind()`：绑定端口；`accept()`：异步接受连接（返回`Future`或使用`CompletionHandler`）。 |
| `AsynchronousSocketChannel`       | 客户端 / 连接通道（数据传输） | `connect()`：异步连接服务器；`read()`/`write()`：异步读写数据。 |
| `AsynchronousFileChannel`         | 异步文件通道（文件读写）      | `read()`/`write()`：异步读写文件；`open()`：打开文件通道。   |

##### 2. 异步结果处理

AIO 提供两种方式处理异步操作结果：

- **`Future`模式**：异步操作返回`Future`对象，通过`get()`方法获取结果（阻塞直到完成，不推荐）。
- **`CompletionHandler`回调模式**：操作完成后自动调用`completed()`（成功）或`failed()`（失败）方法，非阻塞，推荐使用。

**`CompletionHandler`接口定义**：

java

```java
public interface CompletionHandler<V, A> {
    // 操作成功完成时调用
    void completed(V result, A attachment);
    // 操作失败时调用
    void failed(Throwable exc, A attachment);
}
```

- `V`：操作结果类型（如`Integer`表示读取的字节数）。
- `A`：附加对象类型（传递上下文信息，如缓冲区、通道）。

##### 3. 核心 API 使用示例

###### （1）服务器端：`AsynchronousServerSocketChannel`

java

```java
// 1. 打开服务器通道
AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open();
// 2. 绑定端口
serverChannel.bind(new InetSocketAddress(8080));
// 3. 异步接受连接（使用CompletionHandler）
serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
    @Override
    public void completed(AsynchronousSocketChannel clientChannel, Void attachment) {
        // 接收下一个连接（必须手动再次调用accept，否则只处理一次）
        serverChannel.accept(null, this);
        
        // 处理当前连接（如读取数据）
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        clientChannel.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer bytesRead, ByteBuffer buf) {
                if (bytesRead > 0) {
                    buf.flip();
                    byte[] data = new byte[buf.remaining()];
                    buf.get(data);
                    System.out.println("收到数据：" + new String(data));
                    // 可继续读写...
                }
            }
            
            @Override
            public void failed(Throwable exc, ByteBuffer buf) {
                exc.printStackTrace();
            }
        });
    }
    
    @Override
    public void failed(Throwable exc, Void attachment) {
        exc.printStackTrace();
    }
});
```

###### （2）客户端：`AsynchronousSocketChannel`

java

```java
// 1. 打开客户端通道
AsynchronousSocketChannel clientChannel = AsynchronousSocketChannel.open();
// 2. 异步连接服务器
clientChannel.connect(new InetSocketAddress("localhost", 8080), null, 
    new CompletionHandler<Void, Void>() {
        @Override
        public void completed(Void result, Void attachment) {
            // 连接成功，发送数据
            ByteBuffer buffer = ByteBuffer.wrap("Hello AIO".getBytes());
            clientChannel.write(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
                @Override
                public void completed(Integer bytesWritten, ByteBuffer buf) {
                    System.out.println("发送成功，字节数：" + bytesWritten);
                }
                
                @Override
                public void failed(Throwable exc, ByteBuffer buf) {
                    exc.printStackTrace();
                }
            });
        }
        
        @Override
        public void failed(Throwable exc, Void attachment) {
            exc.printStackTrace();
        }
    });
```

#### 三、AIO 的优缺点与适用场景

| 维度         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| **优点**     | 完全非阻塞，线程利用率极高；无需主动轮询，减少 CPU 消耗；适合高并发、低延迟场景。 |
| **缺点**     | 编程模型复杂（回调嵌套）；底层依赖操作系统支持（Linux 早期支持有限）；调试难度大。 |
| **适用场景** | 高并发服务器（如分布式通信）；大文件异步传输；对延迟敏感的实时系统。 |

#### 四、八股文题目（难度递增）

##### 1. 基础题：Java AIO 与 NIO 的核心区别是什么？AIO 的 “异步” 体现在哪里？

**答案**：

- **核心区别**：
  - 同步性：NIO 是**同步非阻塞**（需主动轮询`Selector`检查事件）；AIO 是**异步非阻塞**（无需轮询，操作完成后由系统通知）。
  - 线程模型：NIO 需一个线程处理事件分发；AIO 的线程仅在操作完成后处理结果，无等待开销。
  - 编程复杂度：NIO 基于`Selector`和`SelectionKey`；AIO 基于回调（`CompletionHandler`）或`Future`。
- **AIO 的 “异步” 体现**：
  应用程序发起 I/O 操作后，无需阻塞或主动检查结果，操作系统会在操作完成后通过回调函数或通知机制告知应用，实现 “发起即忘”。

##### 2. 原理题：解释 AIO 中`CompletionHandler`的工作机制，以及`completed()`和`failed()`方法的调用时机。

**答案**：

- **`CompletionHandler`工作机制**：
  1. 发起异步操作（如`accept()`/`read()`）时，传入`CompletionHandler`对象作为参数。
  2. 操作系统接管 I/O 操作，应用程序线程立即返回。
  3. 当操作完成（成功或失败），操作系统会从线程池（如`AsynchronousChannelGroup`的线程池）中分配一个线程，调用对应的回调方法。
- **方法调用时机**：
  - `completed(V result, A attachment)`：I/O 操作成功完成时调用，`result`为操作结果（如读取的字节数），`attachment`为发起操作时传入的上下文对象（如缓冲区）。
  - `failed(Throwable exc, A attachment)`：I/O 操作失败（如连接超时、读取错误）时调用，`exc`为异常信息，`attachment`为上下文对象。

##### 3. 进阶题：AIO 中`Future`模式与`CompletionHandler`模式的区别？各自适用场景是什么？

**答案**：

- **区别**：

  | 特性         | `Future`模式                         | `CompletionHandler`模式                    |
  | ------------ | ------------------------------------ | ------------------------------------------ |
  | 结果获取方式 | 需主动调用`future.get()`（可能阻塞） | 操作完成后自动回调`completed()`/`failed()` |
  | 阻塞性       | `get()`方法会阻塞直到结果就绪        | 完全非阻塞，回调在独立线程执行             |
  | 编程复杂度   | 简单（线性代码）                     | 复杂（可能嵌套回调）                       |

- **适用场景**：

  - `Future`模式：适合简单场景，且能接受`get()`方法阻塞的情况（如单线程异步操作）。
  - `CompletionHandler`模式：适合高并发场景，需非阻塞处理结果，避免线程阻塞（如服务器处理多客户端连接）。

##### 4. 深入题：AIO 的底层实现依赖操作系统哪些机制？为什么在 Linux 系统上早期 AIO 性能不如 NIO？

**答案**：

- **底层依赖**：
  AIO 的实现高度依赖操作系统的异步 I/O 支持：
  - Windows：基于**IOCP（I/O Completion Port）**，原生支持异步 I/O，性能优异。
  - Linux：早期（内核 2.6 及以下）无原生异步网络 I/O 支持，Java AIO 通过`epoll`模拟实现（同步非阻塞模拟异步），性能受限；内核 5.1 + 引入`io_uring`，原生支持异步 I/O，性能提升明显。
- **Linux 早期 AIO 性能问题**：
  1. 无原生异步网络 I/O，Java AIO 基于`epoll`模拟，本质仍是同步非阻塞，存在轮询开销。
  2. 模拟实现复杂，回调线程调度效率低，导致高并发下性能不如 NIO 的`Selector`模型。
  3. JDK 对 Linux AIO 的优化不足，未充分利用内核新特性（如`io_uring`）。

##### 5. 综合题：在高并发场景下使用 AIO 可能遇到哪些问题？如何优化？

**答案**：

- **潜在问题**：

  1. **回调嵌套地狱**：多层异步操作（如 “连接→读取→处理→写入”）导致回调嵌套过深，代码可读性和维护性差。
  2. **线程池管理不当**：默认线程池（`AsynchronousChannelGroup`）线程数不足或过多，导致性能瓶颈或资源浪费。
  3. **缓冲区复用问题**：频繁创建`ByteBuffer`导致 GC 压力，影响性能。
  4. **操作系统兼容性**：Linux 早期版本不支持原生异步 I/O，性能不如预期。

- **优化方案**：

  1. **解决回调嵌套**：使用`CompletableFuture`封装 AIO 操作，通过链式调用替代嵌套（如`thenAccept()`/`thenApply()`）。

  2. 自定义线程池

     ：创建

     ```
     AsynchronousChannelGroup
     ```

     时指定合理的线程数（如 CPU 核心数 * 2），避免默认线程池瓶颈。

     java

     

     ```java
     // 自定义线程池
     ExecutorService executor = Executors.newFixedThreadPool(10);
     AsynchronousChannelGroup group = AsynchronousChannelGroup.withThreadPool(executor);
     AsynchronousServerSocketChannel server = AsynchronousServerSocketChannel.open(group);
     ```

  3. **缓冲区对象池**：使用对象池（如 Apache Commons Pool）缓存`ByteBuffer`，减少创建 / 销毁开销。

  4. **适配操作系统**：在 Linux 上优先使用内核 5.1+（支持`io_uring`），或在低版本内核切换为 NIO 模型。

#### 五、场景题（含实现思路）

##### 1. 基础场景：用 AIO 实现回声服务器（客户端发送消息，服务器原样返回）

**题目**：实现 AIO 服务器，接收客户端消息后原样返回，支持异步处理多个连接。

**答案**：
核心思路：服务器用`AsynchronousServerSocketChannel`异步接受连接，客户端连接后通过`read()`/`write()`异步读写数据，使用`CompletionHandler`处理结果。

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;

public class AioEchoServer {
    public static void main(String[] args) throws IOException {
        // 打开服务器通道并绑定端口
        AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open();
        serverChannel.bind(new InetSocketAddress(8080));
        System.out.println("AIO回声服务器启动，端口8080");

        // 异步接受连接
        acceptConnection(serverChannel);

        // 防止主线程退出（实际应用需保持运行）
        synchronized (AioEchoServer.class) {
            try {
                AioEchoServer.class.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    // 异步接受连接（递归调用，持续接受新连接）
    private static void acceptConnection(AsynchronousServerSocketChannel serverChannel) {
        serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
            @Override
            public void completed(AsynchronousSocketChannel clientChannel, Void attachment) {
                // 继续接受下一个连接
                acceptConnection(serverChannel);
                System.out.println("新客户端连接：" + clientChannel);

                // 读取客户端消息
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                readData(clientChannel, buffer);
            }

            @Override
            public void failed(Throwable exc, Void attachment) {
                System.err.println("接受连接失败：" + exc.getMessage());
            }
        });
    }

    // 异步读取数据
    private static void readData(AsynchronousSocketChannel clientChannel, ByteBuffer buffer) {
        clientChannel.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer bytesRead, ByteBuffer buf) {
                if (bytesRead > 0) {
                    buf.flip();
                    byte[] data = new byte[buf.remaining()];
                    buf.get(data);
                    String message = new String(data);
                    System.out.println("收到消息：" + message);

                    // 回声返回（写入数据）
                    buf.rewind(); // 重置缓冲区
                    writeData(clientChannel, buf);
                } else if (bytesRead == -1) {
                    // 客户端断开连接
                    try {
                        clientChannel.close();
                        System.out.println("客户端断开");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void failed(Throwable exc, ByteBuffer buf) {
                System.err.println("读取失败：" + exc.getMessage());
                try {
                    clientChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    // 异步写入数据（回声）
    private static void writeData(AsynchronousSocketChannel clientChannel, ByteBuffer buffer) {
        clientChannel.write(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer bytesWritten, ByteBuffer buf) {
                if (buf.hasRemaining()) {
                    // 未写完，继续写入
                    clientChannel.write(buf, buf, this);
                } else {
                    // 写入完成，准备下一次读取
                    buf.clear();
                    readData(clientChannel, buf);
                }
            }

            @Override
            public void failed(Throwable exc, ByteBuffer buf) {
                System.err.println("写入失败：" + exc.getMessage());
                try {
                    clientChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
```

##### 2. 文件场景：用`AsynchronousFileChannel`实现大文件异步复制

**题目**：使用 AIO 的`AsynchronousFileChannel`异步复制大文件（如 2GB），要求不阻塞主线程。

**答案**：
核心思路：异步读取源文件，读取完成后异步写入目标文件，通过`CompletionHandler`链式处理读写操作。

java

```java
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousFileChannel;
import java.nio.channels.CompletionHandler;
import java.nio.file.*;
import java.util.concurrent.atomic.AtomicLong;

public class AioFileCopy {
    private static final int BUFFER_SIZE = 8 * 1024 * 1024; // 8MB缓冲区
    private static final AtomicLong totalCopied = new AtomicLong(0); // 已复制字节数

    public static void main(String[] args) throws IOException {
        Path sourcePath = Paths.get("large_file.bin");
        Path destPath = Paths.get("copied_file.bin");

        // 创建目标文件（若存在则覆盖）
        if (Files.exists(destPath)) {
            Files.delete(destPath);
        }
        Files.createFile(destPath);

        // 打开异步文件通道（源文件读，目标文件写）
        AsynchronousFileChannel sourceChannel = AsynchronousFileChannel.open(
            sourcePath, StandardOpenOption.READ);
        AsynchronousFileChannel destChannel = AsynchronousFileChannel.open(
            destPath, StandardOpenOption.WRITE);

        long fileSize = sourceChannel.size();
        System.out.println("文件大小：" + fileSize + "字节，开始复制...");

        // 开始异步复制（从位置0开始）
        copyFile(sourceChannel, destChannel, 0, fileSize);

        // 防止主线程退出
        synchronized (AioFileCopy.class) {
            try {
                AioFileCopy.class.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    // 异步复制文件（递归处理，直到完成）
    private static void copyFile(AsynchronousFileChannel source, AsynchronousFileChannel dest,
                                long position, long fileSize) {
        if (position >= fileSize) {
            System.out.println("复制完成，总字节数：" + totalCopied.get());
            try {
                source.close();
                dest.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            // 唤醒主线程
            synchronized (AioFileCopy.class) {
                AioFileCopy.class.notify();
            }
            return;
        }

        // 计算本次读取的字节数（不超过缓冲区和剩余大小）
        long remaining = fileSize - position;
        int bytesToRead = (int) Math.min(remaining, BUFFER_SIZE);
        ByteBuffer buffer = ByteBuffer.allocateDirect(bytesToRead); // 直接内存缓冲区

        // 异步读取
        source.read(buffer, position, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer bytesRead, ByteBuffer buf) {
                if (bytesRead <= 0) {
                    copyFile(source, dest, position, fileSize); // 继续下一次读取
                    return;
                }

                // 切换为写模式
                buf.flip();
                totalCopied.addAndGet(bytesRead);

                // 异步写入
                dest.write(buf, position, buf, new CompletionHandler<Integer, ByteBuffer>() {
                    @Override
                    public void completed(Integer bytesWritten, ByteBuffer buf) {
                        // 继续复制下一段
                        copyFile(source, dest, position + bytesWritten, fileSize);
                    }

                    @Override
                    public void failed(Throwable exc, ByteBuffer buf) {
                        System.err.println("写入失败：" + exc.getMessage());
                    }
                });
            }

            @Override
            public void failed(Throwable exc, ByteBuffer buf) {
                System.err.println("读取失败：" + exc.getMessage());
            }
        });
    }
}
```

##### 3. 超时场景：AIO 客户端实现连接超时控制（如 5 秒超时）

**题目**：实现 AIO 客户端，若 5 秒内未成功连接服务器，则触发超时处理。

**答案**：
核心思路：利用`Future`模式的`get(timeout, unit)`方法设置超时，结合`CompletionHandler`处理连接结果。

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class AioTimeoutClient {
    public static void main(String[] args) {
        try {
            AsynchronousSocketChannel clientChannel = AsynchronousSocketChannel.open();
            System.out.println("尝试连接服务器...");

            // 发起异步连接（返回Future对象）
            Future<Void> future = clientChannel.connect(new InetSocketAddress("localhost", 8080));

            try {
                // 等待连接完成，设置5秒超时
                future.get(5, TimeUnit.SECONDS);
                System.out.println("连接成功！");
                // 连接成功后的操作...
                clientChannel.close();
            } catch (TimeoutException e) {
                // 超时处理：取消连接并关闭通道
                future.cancel(true);
                clientChannel.close();
                System.err.println("连接超时（5秒）");
            } catch (InterruptedException | ExecutionException e) {
                System.err.println("连接失败：" + e.getMessage());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

##### 4. 高并发场景：AIO 服务器限制最大并发连接数（如 1000）

**题目**：实现 AIO 服务器，当并发连接数达到 1000 时，拒绝新连接并返回 “服务繁忙”。

**答案**：
核心思路：用`AtomicInteger`统计当前连接数，接受新连接前检查是否超过阈值，超过则拒绝。

java



运行









```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.concurrent.atomic.AtomicInteger;

public class AioLimitServer {
    private static final int MAX_CONNECTIONS = 1000; // 最大并发连接数
    private static final AtomicInteger currentConnections = new AtomicInteger(0); // 当前连接数

    public static void main(String[] args) throws IOException {
        AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open();
        serverChannel.bind(new InetSocketAddress(8080));
        System.out.println("AIO限流服务器启动，最大连接数：" + MAX_CONNECTIONS);

        acceptConnection(serverChannel);

        // 保持主线程运行
        synchronized (AioLimitServer.class) {
            try {
                AioLimitServer.class.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private static void acceptConnection(AsynchronousServerSocketChannel serverChannel) {
        serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
            @Override
            public void completed(AsynchronousSocketChannel clientChannel, Void attachment) {
                // 继续接受下一个连接
                acceptConnection(serverChannel);

                // 检查连接数是否超过阈值
                if (currentConnections.get() >= MAX_CONNECTIONS) {
                    // 拒绝连接：发送“服务繁忙”并关闭
                    try {
                        ByteBuffer buffer = ByteBuffer.wrap("服务繁忙，请稍后再试".getBytes());
                        clientChannel.write(buffer).get(); // 同步等待写入完成
                        clientChannel.close();
                        System.out.println("连接数已满，拒绝新连接");
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return;
                }

                // 连接数+1
                currentConnections.incrementAndGet();
                System.out.println("新连接，当前连接数：" + currentConnections.get());

                // 处理连接（读取数据）
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                readData(clientChannel, buffer);
            }

            @Override
            public void failed(Throwable exc, Void attachment) {
                System.err.println("接受连接失败：" + exc.getMessage());
                acceptConnection(serverChannel); // 重试接受连接
            }
        });
    }

    private static void readData(AsynchronousSocketChannel clientChannel, ByteBuffer buffer) {
        clientChannel.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer bytesRead, ByteBuffer buf) {
                if (bytesRead == -1) {
                    // 客户端断开，连接数-1
                    currentConnections.decrementAndGet();
                    System.out.println("客户端断开，当前连接数：" + currentConnections.get());
                    try {
                        clientChannel.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    return;
                }
                // 继续读取（实际应用需处理数据）
                buf.clear();
                readData(clientChannel, buf);
            }

            @Override
            public void failed(Throwable exc, ByteBuffer buf) {
                // 异常断开，连接数-1
                currentConnections.decrementAndGet();
                System.err.println("连接异常：" + exc.getMessage());
                try {
                    clientChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
```

##### 5. 综合场景：AIO 实现简单聊天服务器，支持消息广播

**题目**：实现 AIO 聊天服务器，支持多客户端连接，客户端发送的消息需广播给所有在线客户端。

**答案**：
核心思路：用线程安全的集合保存所有在线客户端通道，收到消息后遍历集合异步广播。

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

public class AioChatServer {
    // 线程安全的集合，保存所有在线客户端
    private static final Set<AsynchronousSocketChannel> clients = 
        Collections.newSetFromMap(new ConcurrentHashMap<>());

    public static void main(String[] args) throws IOException {
        AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open();
        serverChannel.bind(new InetSocketAddress(8080));
        System.out.println("AIO聊天服务器启动，等待客户端连接...");

        acceptConnections(serverChannel);

        // 保持主线程运行
        synchronized (AioChatServer.class) {
            try {
                AioChatServer.class.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    // 持续接受客户端连接
    private static void acceptConnections(AsynchronousServerSocketChannel serverChannel) {
        serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
            @Override
            public void completed(AsynchronousSocketChannel clientChannel, Void attachment) {
                // 继续接受下一个连接
                acceptConnections(serverChannel);

                // 添加客户端到在线列表
                clients.add(clientChannel);
                System.out.println("新客户端加入，当前在线：" + clients.size());

                // 读取客户端消息
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                readMessage(clientChannel, buffer);
            }

            @Override
            public void failed(Throwable exc, Void attachment) {
                System.err.println("接受连接失败：" + exc.getMessage());
                acceptConnections(serverChannel);
            }
        });
    }

    // 读取客户端消息
    private static void readMessage(AsynchronousSocketChannel client, ByteBuffer buffer) {
        client.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer bytesRead, ByteBuffer buf) {
                if (bytesRead == -1) {
                    // 客户端退出
                    clients.remove(client);
                    System.out.println("客户端退出，当前在线：" + clients.size());
                    try {
                        client.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    return;
                }

                // 解析消息
                buf.flip();
                byte[] data = new byte[buf.remaining()];
                buf.get(data);
                String message = new String(data);
                System.out.println("收到消息：" + message);

                // 广播消息给所有客户端
                broadcastMessage(message, client);

                // 继续读取下一条消息
                buf.clear();
                readMessage(client, buf);
            }

            @Override
            public void failed(Throwable exc, ByteBuffer buf) {
                // 客户端异常
                clients.remove(client);
                System.err.println("客户端异常：" + exc.getMessage());
                try {
                    client.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    // 广播消息给所有客户端（排除发送者）
    private static void broadcastMessage(String message, AsynchronousSocketChannel sender) {
        byte[] data = message.getBytes();
        for (AsynchronousSocketChannel client : clients) {
            if (client != sender && client.isOpen()) {
                ByteBuffer buffer = ByteBuffer.wrap(data);
                // 异步发送消息，不处理结果（实际应用需处理失败）
                client.write(buffer, null, new CompletionHandler<Integer, Void>() {
                    @Override
                    public void completed(Integer bytesWritten, Void attachment) {}

                    @Override
                    public void failed(Throwable exc, Void attachment) {
                        System.err.println("广播失败：" + exc.getMessage());
                    }
                });
            }
        }
    }
}
```

#### 总结

Java AIO 通过异步非阻塞机制和回调模式，实现了更高效率的 I/O 操作，特别适合高并发、低延迟场景。但其编程复杂度较高，且性能依赖操作系统支持。实际开发中，AIO 常被封装到 Netty 等框架中（Netty 对 AIO 支持有限，主要用 NIO），但理解 AIO 的原理和 API 对深入掌握 Java I/O 模型至关重要。