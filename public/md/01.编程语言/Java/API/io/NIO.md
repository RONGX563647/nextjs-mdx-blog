### Java NIO 全面解析：原理、API 及实战题目

#### 一、Java NIO 核心原理与设计思想

Java NIO（New I/O，非阻塞 I/O）是 JDK 1.4 引入的全新 I/O 模型，旨在解决 BIO（阻塞 I/O）在高并发场景下的性能瓶颈。其核心特点是**同步非阻塞**和**多路复用**，通过三个核心组件（通道、缓冲区、选择器）实现高效 I/O 操作。

**核心原理**：

- **同步非阻塞**：I/O 操作的发起者需主动检查操作状态，但操作未就绪时不会阻塞线程，线程可处理其他任务。
- **多路复用**：通过选择器（Selector）实现单个线程监听多个 I/O 通道（Channel）的事件（如连接就绪、数据可读），大幅提升线程利用率。

**工作流程**：

1. 服务器创建`ServerSocketChannel`并绑定端口，设置为非阻塞模式。
2. 创建`Selector`（选择器），将`ServerSocketChannel`注册到选择器，关注`OP_ACCEPT`（连接就绪）事件。
3. 选择器调用`select()`方法阻塞等待事件（或设置超时），当事件就绪时返回就绪的通道数量。
4. 遍历就绪通道，处理对应事件（如`OP_ACCEPT`建立新连接，`OP_READ`读取数据）。
5. 处理完成后，通道可继续注册到选择器，等待下一次事件，实现单线程处理多连接。

#### 二、核心组件与 API 详解

Java NIO 的核心组件包括**缓冲区（Buffer）**、**通道（Channel）**、**选择器（Selector）**，三者协同工作实现非阻塞 I/O。

##### 1. 缓冲区（Buffer）：数据容器

Buffer 是存储数据的容器，本质是一块可读写的内存区域，所有 NIO 操作都通过缓冲区进行。其核心属性包括：

- `capacity`：缓冲区容量（创建后固定）。
- `position`：当前读写位置（初始为 0，随操作移动）。
- `limit`：读写上限（初始等于 capacity，`flip()`后等于 position）。

**核心方法**：

- `put()`：写入数据到缓冲区（position 递增）。
- `get()`：从缓冲区读取数据（position 递增）。
- `flip()`：切换为读模式（limit=position，position=0）。
- `clear()`：清空缓冲区（position=0，limit=capacity，数据未实际删除）。
- `rewind()`：重置读位置（position=0，limit 不变）。

**常用 Buffer 子类**：
`ByteBuffer`（最常用，字节缓冲区）、`CharBuffer`、`IntBuffer`等，其中`ByteBuffer`支持直接内存（`allocateDirect()`），减少 JVM 堆内存拷贝，适合大文件操作。

java

```java
// Buffer使用示例
ByteBuffer buffer = ByteBuffer.allocate(1024); // 分配1KB缓冲区（堆内存）
buffer.put("Hello NIO".getBytes()); // 写入数据
buffer.flip(); // 切换为读模式

byte[] data = new byte[buffer.limit()];
buffer.get(data); // 读取数据到字节数组
System.out.println(new String(data)); // 输出：Hello NIO
```

##### 2. 通道（Channel）：双向 I/O 通道

Channel 是数据传输的通道，与 BIO 的流（Stream）相比，具有**双向性**（可读可写）和**非阻塞性**（部分通道支持）。

**核心 Channel 实现类**：

- `ServerSocketChannel`：服务器端通道，监听客户端连接（对应 BIO 的`ServerSocket`）。
- `SocketChannel`：客户端 / 连接通道，用于数据传输（对应 BIO 的`Socket`）。
- `FileChannel`：文件通道，用于文件读写（支持阻塞模式）。

**核心方法**：

- `open()`：打开通道。
- `configureBlocking(boolean)`：设置是否为非阻塞模式（`ServerSocketChannel`和`SocketChannel`支持）。
- `register(Selector, int)`：将通道注册到选择器，指定关注的事件（如`SelectionKey.OP_ACCEPT`）。
- `read(Buffer)`/`write(Buffer)`：读写数据（非阻塞模式下，若操作未就绪返回 0 或 - 1）。

java

```java
// ServerSocketChannel示例（服务器端）
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.socket().bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false); // 设置为非阻塞模式
```

java

```java
// SocketChannel示例（客户端）
SocketChannel clientChannel = SocketChannel.open(new InetSocketAddress("localhost", 8080));
clientChannel.configureBlocking(false); // 非阻塞模式
```

##### 3. 选择器（Selector）：多路复用器

Selector 是 NIO 实现多路复用的核心，允许单个线程监听多个 Channel 的事件，大幅减少线程数量。

**核心概念**：

- `SelectionKey`：通道注册到选择器后返回的键，包含通道、选择器、关注的事件（`OP_ACCEPT`/`OP_READ`/`OP_WRITE`等）。
- 事件类型：
  - `OP_ACCEPT`：服务器通道准备接收新连接（仅`ServerSocketChannel`）。
  - `OP_READ`：通道可读（数据已就绪）。
  - `OP_WRITE`：通道可写（缓冲区未满）。

**核心方法**：

- `open()`：创建选择器。
- `select()`：阻塞等待事件就绪（返回就绪通道数）。
- `select(long timeout)`：超时等待事件就绪。
- `selectedKeys()`：返回就绪事件的`SelectionKey`集合。
- `wakeup()`：唤醒阻塞在`select()`上的线程。

java

```java
// Selector使用示例
Selector selector = Selector.open();
// 将服务器通道注册到选择器，关注OP_ACCEPT事件
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    int readyChannels = selector.select(); // 阻塞等待事件
    if (readyChannels == 0) continue;

    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

    while (keyIterator.hasNext()) {
        SelectionKey key = keyIterator.next();
        if (key.isAcceptable()) {
            // 处理连接就绪事件
        } else if (key.isReadable()) {
            // 处理数据可读事件
        }
        keyIterator.remove(); // 必须移除，避免重复处理
    }
}
```

#### 三、NIO vs BIO：核心差异

| 特性     | BIO（阻塞 I/O）    | NIO（非阻塞 I/O）                                     |
| -------- | ------------------ | ----------------------------------------------------- |
| 处理方式 | 一个连接一个线程   | 单线程处理多连接（多路复用）                          |
| 阻塞性   | 所有 I/O 操作阻塞  | 非阻塞（操作未就绪时返回）                            |
| 核心组件 | 流（Stream）       | 通道（Channel）+ 缓冲区（Buffer）+ 选择器（Selector） |
| 并发能力 | 低（线程资源有限） | 高（单线程处理多连接）                                |
| 适用场景 | 低并发、短连接     | 高并发、长连接（如服务器）                            |

#### 四、八股文题目（难度递增）

##### 1. 基础题：Java NIO 与 BIO 的核心区别是什么？NIO 为什么更适合高并发场景？

**答案**：

- 核心区别

  ：

  - 模型：BIO 是 “一个连接一个线程” 的同步阻塞模型；NIO 是 “单线程处理多连接” 的同步非阻塞模型（多路复用）。
  - 数据传输：BIO 基于流（单向），NIO 基于通道（双向）和缓冲区。
  - 阻塞性：BIO 的`accept()`/`read()`会阻塞线程；NIO 的非阻塞模式下，这些操作未就绪时返回，不阻塞线程。

- **高并发优势**：
  NIO 通过 Selector 实现多路复用，单个线程可监听多个连接的事件，避免了 BIO 中线程数量爆炸的问题，减少线程切换开销，因此更适合高并发场景（如 10k + 连接）。

##### 2. 原理题：解释 NIO 中 Selector 的工作机制，以及 SelectionKey 的作用。

**答案**：

- **Selector 工作机制**：
  1. 通道（如`ServerSocketChannel`）注册到 Selector 时，需指定关注的事件（如`OP_ACCEPT`），返回`SelectionKey`。
  2. 调用`selector.select()`阻塞等待事件，底层依赖操作系统的多路复用机制（如 Linux 的`epoll`、Windows 的`IOCP`）。
  3. 当事件就绪（如客户端连接、数据可读），`select()`返回就绪通道数，通过`selectedKeys()`获取就绪的`SelectionKey`。
  4. 遍历`SelectionKey`，根据事件类型处理（如接收连接、读取数据），处理后需移除`SelectionKey`避免重复处理。
- **SelectionKey 的作用**：
  1. 关联通道与选择器（`key.channel()`/`key.selector()`）。
  2. 标识关注的事件（`key.interestOps()`）和就绪的事件（`key.readyOps()`）。
  3. 存储附加对象（`key.attach()`/`key.attachment()`），用于传递上下文信息（如缓冲区）。

##### 3. 进阶题：Buffer 的`flip()`、`clear()`、`rewind()`方法的区别是什么？分别在什么场景下使用？

**答案**：
三者均用于调整 Buffer 的`position`和`limit`，区别如下：

| 方法       | 作用（position/limit 变化）              | 适用场景                                           |
| ---------- | ---------------------------------------- | -------------------------------------------------- |
| `flip()`   | limit=position，position=0               | 写入数据后切换为读模式（如写完数据准备读取）。     |
| `clear()`  | position=0，limit=capacity（数据未删除） | 读完数据后清空缓冲区，准备重新写入（如循环读写）。 |
| `rewind()` | position=0，limit 不变                   | 重新读取已有的数据（如重复读取缓冲区内容）。       |

**示例场景**：

- 写入数据到 Buffer 后，调用`flip()`切换为读模式，才能正确读取数据。
- 读取完 Buffer 后，调用`clear()`重置指针，准备下一次写入。
- 若需重复读取已读取的数据（如校验），调用`rewind()`将 position 重置为 0。

##### 4. 深入题：NIO 中`SocketChannel`的非阻塞`read()`方法返回值有哪些情况？分别表示什么含义？如何处理 “读半包” 问题？

**答案**：

- **`read()`返回值含义**：
  1. **正数**：实际读取的字节数（数据已部分或全部读取）。
  2. **0**：非阻塞模式下，当前无数据可读（需再次尝试）。
  3. **-1**：通道已关闭（客户端断开连接）。
- **“读半包” 问题**：
  指一次`read()`未读取完整消息（如客户端发送 1000 字节，一次仅读取 500 字节）。
  **处理方案**：
  1. 固定消息长度：约定消息前 N 字节表示长度，读取时先解析长度，再循环读取至完整。
  2. 分隔符：用特定字符（如`\n`）分隔消息，读取到分隔符视为消息结束。
  3. 状态机：维护读取状态（如 “正在读取头部”“正在读取 body”），分阶段处理。

##### 5. 综合题：NIO 在高并发场景下可能遇到哪些问题？如何优化？

**答案**：

- **潜在问题**：
  1. **Selector 空轮询**：`select()`返回 0 但无就绪事件，导致 CPU 占用 100%（JDK bug，已在高版本修复）。
  2. **单线程瓶颈**：所有事件由单个线程处理，若某操作耗时过长，会阻塞其他事件。
  3. **缓冲区分配不当**：缓冲区过小导致频繁读写，过大浪费内存。
  4. **连接数限制**：单个 Selector 能高效处理的连接数有限（通常建议 1w-10w）。
- **优化方案**：
  1. **解决空轮询**：升级 JDK 版本；设置`select(timeout)`超时时间，避免无限阻塞。
  2. **多线程模型**：用 “Selector 线程 + 工作线程池”，Selector 仅负责事件分发，业务处理交给线程池。
  3. **缓冲区复用**：使用对象池缓存 Buffer，避免频繁创建 / 销毁。
  4. **多 Selector 拆分**：按 CPU 核心数创建多个 Selector，分摊连接压力（如奇数端口用 Selector1，偶数用 Selector2）。

#### 五、场景题（含实现思路）

##### 1. 基础场景：用 NIO 实现一个简单的回声服务器（客户端发送消息，服务器原样返回）

**题目**：实现 NIO 服务器，接收客户端消息并原样返回，支持非阻塞处理多个客户端。

**答案**：
核心思路：用`ServerSocketChannel`监听连接，`Selector`处理事件，`SocketChannel`传输数据。

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.Iterator;
import java.util.Set;

public class NioEchoServer {
    public static void main(String[] args) throws IOException {
        // 1. 创建服务器通道并设置非阻塞
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.socket().bind(new InetSocketAddress(8080));
        serverChannel.configureBlocking(false);

        // 2. 创建选择器并注册服务器通道（关注OP_ACCEPT事件）
        Selector selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);
        System.out.println("服务器启动，监听端口8080...");

        while (true) {
            // 3. 等待事件就绪（阻塞，可设置超时）
            int readyChannels = selector.select();
            if (readyChannels == 0) continue;

            // 4. 处理就绪事件
            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = selectedKeys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();
                iterator.remove(); // 移除键，避免重复处理

                if (key.isAcceptable()) {
                    // 处理连接就绪：接收客户端连接
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();
                    SocketChannel clientChannel = server.accept();
                    clientChannel.configureBlocking(false);
                    // 注册客户端通道到选择器，关注OP_READ事件
                    clientChannel.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));
                    System.out.println("新客户端连接：" + clientChannel.getRemoteAddress());
                } else if (key.isReadable()) {
                    // 处理数据可读：读取并回声
                    SocketChannel clientChannel = (SocketChannel) key.channel();
                    ByteBuffer buffer = (ByteBuffer) key.attachment(); // 获取附加的缓冲区

                    int bytesRead = clientChannel.read(buffer);
                    if (bytesRead == -1) {
                        // 客户端断开连接
                        clientChannel.close();
                        System.out.println("客户端断开连接");
                        continue;
                    }

                    buffer.flip(); // 切换为读模式
                    byte[] data = new byte[buffer.remaining()];
                    buffer.get(data);
                    String message = new String(data);
                    System.out.println("收到消息：" + message);

                    // 回声返回
                    buffer.rewind(); // 重置读位置
                    clientChannel.write(buffer);
                    buffer.clear(); // 清空缓冲区，准备下次读取
                }
            }
        }
    }
}
```

##### 2. 文件场景：用 NIO 的 FileChannel 实现大文件复制（如 1GB 文件）

**题目**：利用 NIO 的`FileChannel`复制大文件，要求效率高于 BIO 的流复制。

**答案**：
核心思路：`FileChannel`的`transferTo()`方法直接在通道间传输数据（减少用户态与内核态拷贝），效率更高。

java

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

public class NioFileCopy {
    public static void main(String[] args) throws Exception {
        String sourcePath = "large_file.txt"; // 源文件
        String destPath = "copied_file.txt"; // 目标文件

        try (FileInputStream fis = new FileInputStream(sourcePath);
             FileOutputStream fos = new FileOutputStream(destPath);
             FileChannel sourceChannel = fis.getChannel();
             FileChannel destChannel = fos.getChannel()) {

            long position = 0;
            long remaining = sourceChannel.size();
            // 分段传输（避免单次传输过大）
            while (remaining > 0) {
                long transferred = sourceChannel.transferTo(position, remaining, destChannel);
                if (transferred <= 0) break; // 传输结束
                position += transferred;
                remaining -= transferred;
                System.out.println("已复制：" + (position * 100 / sourceChannel.size()) + "%");
            }
            System.out.println("文件复制完成");
        }
    }
}
```

**优势**：`transferTo()`利用操作系统的 “零拷贝” 机制，数据直接从源通道传输到目标通道，无需经过用户态缓冲区，效率远高于 BIO 的流复制。

##### 3. 多客户端场景：用 NIO 实现支持 1000 个并发客户端的服务器，统计在线人数

**题目**：服务器需支持 1000 个并发客户端连接，客户端连接后发送 “在线” 消息，服务器返回当前在线人数。

**答案**：
核心思路：用`AtomicInteger`统计在线人数，`Selector`处理连接和消息，线程池处理业务逻辑（避免阻塞 Selector 线程）。

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class NioConcurrentServer {
    private static final AtomicInteger onlineCount = new AtomicInteger(0); // 在线人数
    private static final ExecutorService workerPool = Executors.newFixedThreadPool(10); // 工作线程池

    public static void main(String[] args) throws IOException {
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.socket().bind(new InetSocketAddress(8080));
        serverChannel.configureBlocking(false);

        Selector selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);
        System.out.println("服务器启动，支持高并发连接...");

        while (true) {
            selector.select();
            Set<SelectionKey> keys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = keys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();
                iterator.remove();

                if (key.isAcceptable()) {
                    // 处理新连接：在线人数+1
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();
                    SocketChannel client = server.accept();
                    client.configureBlocking(false);
                    client.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));
                    onlineCount.incrementAndGet(); // 人数+1
                    System.out.println("新客户端连接，当前在线：" + onlineCount.get());
                } else if (key.isReadable()) {
                    // 提交到线程池处理，避免阻塞Selector
                    workerPool.submit(() -> handleClient(key));
                }
            }
        }
    }

    private static void handleClient(SelectionKey key) {
        try {
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = (ByteBuffer) key.attachment();

            int bytesRead = client.read(buffer);
            if (bytesRead == -1) {
                // 客户端断开：在线人数-1
                client.close();
                onlineCount.decrementAndGet();
                System.out.println("客户端断开，当前在线：" + onlineCount.get());
                return;
            }

            buffer.flip();
            byte[] data = new byte[buffer.remaining()];
            buffer.get(data);
            String message = new String(data).trim();

            if ("在线".equals(message)) {
                // 返回当前在线人数
                String response = "当前在线人数：" + onlineCount.get();
                buffer.clear();
                buffer.put(response.getBytes());
                buffer.flip();
                client.write(buffer);
            }
            buffer.clear();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

##### 4. 超时场景：NIO 服务器如何处理客户端连接超时（如 30 秒无数据则断开）

**题目**：实现 NIO 服务器，对 30 秒内无数据交互的客户端自动断开连接。

**答案**：
核心思路：为每个`SelectionKey`附加最后活动时间，定期检查超时连接并关闭。

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class NioTimeoutServer {
    private static final long TIMEOUT_MS = 30000; // 超时时间：30秒
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public static void main(String[] args) throws IOException {
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.socket().bind(new InetSocketAddress(8080));
        serverChannel.configureBlocking(false);

        Selector selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        // 定时检查超时连接（每5秒一次）
        scheduler.scheduleAtFixedRate(() -> checkTimeout(selector), 5, 5, TimeUnit.SECONDS);

        System.out.println("服务器启动，30秒无数据自动断开...");

        while (true) {
            selector.select();
            Set<SelectionKey> keys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = keys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();
                iterator.remove();

                if (key.isAcceptable()) {
                    SocketChannel client = ((ServerSocketChannel) key.channel()).accept();
                    client.configureBlocking(false);
                    // 附加最后活动时间（当前时间）
                    SelectionKey clientKey = client.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));
                    clientKey.attach(System.currentTimeMillis()); // 存储最后活动时间
                    System.out.println("新客户端连接");
                } else if (key.isReadable()) {
                    // 读取数据时更新最后活动时间
                    key.attach(System.currentTimeMillis());
                    // 处理数据（省略具体逻辑）
                    SocketChannel client = (SocketChannel) key.channel();
                    ByteBuffer buffer = (ByteBuffer) key.attachment();
                    client.read(buffer);
                    // ... 业务处理 ...
                }
            }
        }
    }

    // 检查超时连接并关闭
    private static void checkTimeout(Selector selector) {
        long now = System.currentTimeMillis();
        for (SelectionKey key : selector.keys()) {
            if (key.channel() instanceof SocketChannel && key.isValid()) {
                // 获取最后活动时间
                Long lastActive = (Long) key.attachment();
                if (lastActive != null && now - lastActive > TIMEOUT_MS) {
                    try {
                        System.out.println("客户端超时，关闭连接");
                        key.channel().close();
                        key.cancel();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
```

##### 5. 综合场景：用 NIO 实现简单的 HTTP 服务器，支持返回静态 HTML 页面

**题目**：实现 NIO 服务器，接收 HTTP 请求后返回指定的 HTML 页面（如`index.html`）。

**答案**：
核心思路：解析 HTTP 请求的资源路径，读取对应 HTML 文件，通过`SocketChannel`返回 HTTP 响应。

java

```java
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Set;

public class NioHttpServer {
    private static final String WEB_ROOT = "web"; // HTML文件存放目录

    public static void main(String[] args) throws IOException {
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.socket().bind(new InetSocketAddress(8080));
        serverChannel.configureBlocking(false);

        Selector selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);
        System.out.println("HTTP服务器启动，访问 http://localhost:8080");

        while (true) {
            selector.select();
            Set<SelectionKey> keys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = keys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();
                iterator.remove();

                if (key.isAcceptable()) {
                    SocketChannel client = ((ServerSocketChannel) key.channel()).accept();
                    client.configureBlocking(false);
                    client.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));
                } else if (key.isReadable()) {
                    handleHttpRequest((SocketChannel) key.channel(), (ByteBuffer) key.attachment());
                    key.cancel(); // 处理完后关闭连接（HTTP 1.0短连接）
                }
            }
        }
    }

    // 处理HTTP请求并返回响应
    private static void handleHttpRequest(SocketChannel client, ByteBuffer buffer) throws IOException {
        // 1. 读取HTTP请求
        int bytesRead = client.read(buffer);
        if (bytesRead <= 0) return;

        buffer.flip();
        String request = new String(buffer.array(), 0, buffer.limit());
        System.out.println("HTTP请求：\n" + request);

        // 2. 解析请求路径（如GET /index.html HTTP/1.1）
        String[] lines = request.split("\r\n");
        String[] firstLine = lines[0].split(" ");
        String path = firstLine.length > 1 ? firstLine[1] : "/";
        if (path.equals("/")) path = "/index.html"; // 默认首页

        // 3. 读取HTML文件
        File file = new File(WEB_ROOT + path);
        byte[] content;
        String statusLine;

        if (file.exists() && file.isFile()) {
            content = Files.readAllBytes(Paths.get(file.getPath()));
            statusLine = "HTTP/1.1 200 OK\r\n"; // 成功响应
        } else {
            content = "<h1>404 Not Found</h1>".getBytes();
            statusLine = "HTTP/1.1 404 Not Found\r\n"; // 未找到
        }

        // 4. 构建HTTP响应（状态行+头信息+空行+内容）
        String headers = "Content-Type: text/html\r\n" +
                         "Content-Length: " + content.length + "\r\n" +
                         "\r\n"; // 空行分隔头和内容

        ByteBuffer responseBuffer = ByteBuffer.allocate(statusLine.length() + headers.length() + content.length);
        responseBuffer.put(statusLine.getBytes());
        responseBuffer.put(headers.getBytes());
        responseBuffer.put(content);
        responseBuffer.flip();

        // 5. 发送响应并关闭连接
        client.write(responseBuffer);
        client.close();
    }
}
```



**使用说明**：

1. 创建`web`目录，放入`index.html`文件。
2. 启动服务器后，通过浏览器访问`http://localhost:8080`即可查看页面。

### 总结

Java NIO 通过通道、缓冲区和选择器实现了非阻塞 I/O 和多路复用，大幅提升了高并发场景下的性能。其核心优势在于单线程处理多连接，减少线程资源消耗。实际开发中，NIO 是 Netty 等高性能框架的基础，掌握 NIO 原理与 API 对于理解分布式系统通信至关重要。