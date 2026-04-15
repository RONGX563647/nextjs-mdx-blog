Java 的 `java.net` 包是 **网络编程的核心 API**，它封装了 TCP/IP、UDP、HTTP 等底层网络协议的细节，提供了阻塞式（BIO）和非阻塞式（NIO）两种编程模型，支持客户端 - 服务器通信、URL 资源访问、网络地址管理等核心能力。

## 一、`java.net` 核心定位与子包

`java.net` 是基础网络包，其核心目标是 **“让开发者无需关注底层协议细节，即可实现跨网络通信”**。与之配合的扩展包包括：

- `javax.net`：网络扩展（如 SSL/TLS 安全通信、服务器 Socket 工厂）；
- `javax.net.ssl`：HTTPS 等安全通信的实现（如 `SSLSocket`、`SSLContext`）；
- `java.nio.channels`：NIO 非阻塞网络编程（如 `SocketChannel`、`Selector`），虽属 `nio` 包，但与 `java.net` 紧密关联。

## 二、核心模块与常用 API（按功能分类）

### 模块 1：TCP 编程（面向连接、可靠传输）

TCP 是 “三次握手建立连接、四次挥手关闭连接” 的可靠协议，适用于文件传输、登录验证等需确保数据不丢失的场景。核心类是 `Socket`（客户端）和 `ServerSocket`（服务器端）。

#### 1. `ServerSocket`（服务器端监听）

- **作用**：绑定端口、监听客户端连接请求，本质是 “被动连接的端点”。

- 核心方法

  ：

  - `ServerSocket(int port)`：绑定指定端口（端口范围 0-65535，0 表示随机分配）；
  - `Socket accept()`：**阻塞等待**客户端连接，返回与客户端通信的 `Socket` 对象；
  - `void bind(SocketAddress endpoint)`：绑定具体的 IP + 端口（如多网卡场景指定网卡）；
  - `void close()`：关闭服务器 Socket，释放端口。

#### 2. `Socket`（客户端 - 服务器通信通道）

- **作用**：代表 “客户端与服务器的双向通信端点”，建立连接后通过流传输数据。

- 核心方法

  ：

  - `Socket(String host, int port)`：通过主机名（或 IP）和端口连接服务器；
  - `InputStream getInputStream()`：获取从服务器接收数据的输入流；
  - `OutputStream getOutputStream()`：获取向服务器发送数据的输出流；
  - `InetAddress getInetAddress()`：获取对方（服务器 / 客户端）的 IP 地址；
  - `void shutdownInput()`/`shutdownOutput()`：单向关闭输入 / 输出流（避免 “半关闭” 问题）；
  - `void close()`：关闭 Socket，释放连接。

#### TCP 编程流程（示例）：

java

```java
// 服务器端
ServerSocket serverSocket = new ServerSocket(8080);
Socket clientSocket = serverSocket.accept(); // 阻塞等待客户端连接
// 通过流读写数据
BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
String msg = in.readLine(); // 读客户端消息
out.println("收到：" + msg); // 回送消息
// 关闭资源
in.close(); out.close(); clientSocket.close(); serverSocket.close();

// 客户端
Socket socket = new Socket("localhost", 8080);
PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
out.println("Hello TCP"); // 发消息
System.out.println(in.readLine()); // 收消息
// 关闭资源
out.close(); in.close(); socket.close();
```

### 模块 2：UDP 编程（无连接、不可靠传输）

UDP 是 “无连接、面向数据报” 的协议，不保证数据到达顺序和完整性，但速度快、开销小，适用于实时通信（如语音、视频、DNS 查询）。核心类是 `DatagramSocket` 和 `DatagramPacket`。

#### 1. `DatagramSocket`（UDP 通信端点）

- **作用**：发送和接收 UDP 数据报（无连接，无需提前建立连接）。

- 核心方法

  ：

  - `DatagramSocket()`：创建客户端 UDP 端点（随机端口）；
  - `DatagramSocket(int port)`：创建服务器端 UDP 端点（绑定指定端口）；
  - `void send(DatagramPacket p)`：发送数据报；
  - `void receive(DatagramPacket p)`：**阻塞等待**接收数据报（数据存入 `DatagramPacket`）；
  - `void close()`：关闭端点。

#### 2. `DatagramPacket`（UDP 数据载体）

- **作用**：封装 UDP 数据（字节数组）、发送方 / 接收方的 IP 和端口。

- 核心构造

  ：

  - 接收用：`DatagramPacket(byte[] buf, int length)`（指定接收缓冲区和长度）；
  - 发送用：`DatagramPacket(byte[] buf, int length, InetAddress address, int port)`（指定数据、目标地址和端口）；

- 核心方法

  ：

  - `byte[] getData()`：获取接收的数据；
  - `int getLength()`：获取实际接收的数据长度；
  - `InetAddress getAddress()`：获取发送方的 IP 地址。

#### UDP 编程流程（示例）：

java

```java
// 服务器端（接收）
DatagramSocket serverSocket = new DatagramSocket(8080);
byte[] buf = new byte[1024];
DatagramPacket packet = new DatagramPacket(buf, buf.length);
serverSocket.receive(packet); // 阻塞接收
String msg = new String(packet.getData(), 0, packet.getLength());
System.out.println("收到：" + msg);

// 客户端（发送）
DatagramSocket clientSocket = new DatagramSocket();
byte[] data = "Hello UDP".getBytes();
InetAddress serverAddr = InetAddress.getByName("localhost");
DatagramPacket packet = new DatagramPacket(data, data.length, serverAddr, 8080);
clientSocket.send(packet);
// 关闭资源
clientSocket.close(); serverSocket.close();
```

### 模块 3：URL 与 URLConnection（URL 资源访问）

用于访问 HTTP、HTTPS、FTP 等 URL 对应的网络资源（如网页内容、接口数据），核心是 `URL`（封装 URL 地址）和 `URLConnection`（建立连接并读写资源）。

#### 1. `URL`（统一资源定位符）

- **作用**：解析 URL 地址（如 `https://www.baidu.com:80/index.html?name=test#top`），拆分协议、主机、端口、路径、参数、锚点。

- 核心方法

  ：

  - `URL(String spec)`：通过 URL 字符串创建对象（需处理 `MalformedURLException`）；
  - `String getProtocol()`：获取协议（如 `http`、`https`）；
  - `String getHost()`：获取主机名（如 `www.baidu.com`）；
  - `int getPort()`：获取端口（无指定则返回 -1，如 HTTP 默认 80、HTTPS 默认 443）；
  - `URLConnection openConnection()`：创建与 URL 对应的连接对象（`URLConnection`）。

#### 2. `URLConnection`（URL 连接抽象类）

- **作用**：建立与 URL 的连接，设置请求头、发送请求、读取响应。其子类 `HttpURLConnection` 是 HTTP 协议的具体实现。

- 核心方法

  ：

  - `void connect()`：主动建立连接（若未调用，读写时会自动触发）；
  - `InputStream getInputStream()`：获取响应的输入流（读服务器返回的数据）；
  - `OutputStream getOutputStream()`：获取请求的输出流（向服务器发 POST 数据）；
  - `void setRequestMethod(String method)`：设置请求方法（如 `GET`、`POST`，仅 `HttpURLConnection` 支持）；
  - `void setRequestProperty(String key, String value)`：设置请求头（如 `User-Agent`、`Content-Type`）；
  - `int getResponseCode()`：获取 HTTP 响应码（如 200 成功、404 未找到，仅 `HttpURLConnection` 支持）。

#### URL 访问示例（HTTP GET 请求）：

java

```java
URL url = new URL("https://www.baidu.com");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setRequestMethod("GET");
conn.setRequestProperty("User-Agent", "Mozilla/5.0");

// 读取响应
if (conn.getResponseCode() == 200) {
    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
    String line;
    while ((line = in.readLine()) != null) {
        System.out.println(line); // 打印网页内容
    }
    in.close();
}
conn.disconnect(); // 关闭连接
```

### 模块 4：网络地址与接口（IP 与网卡管理）

用于封装 IP 地址、管理网络接口（网卡），核心类是 `InetAddress` 和 `NetworkInterface`。

#### 1. `InetAddress`（IP 地址抽象类）

- **作用**：封装 IPv4 或 IPv6 地址，提供主机名与 IP 的转换。

- 子类

  ：

  - `Inet4Address`：IPv4 地址（如 `192.168.1.1`）；
  - `Inet6Address`：IPv6 地址（如 `2001:0db8:85a3:0000:0000:8a2e:0370:7334`）。

- 核心方法

  ：

  - `static InetAddress getByName(String host)`：通过主机名（如 `localhost`）或 IP 字符串获取对象；
  - `static InetAddress[] getAllByName(String host)`：获取所有 IP（支持多网卡 / 多 IP 主机）；
  - `static InetAddress getLocalHost()`：获取本地主机的 IP 地址；
  - `String getHostAddress()`：获取 IP 字符串（如 `127.0.0.1`）；
  - `String getHostName()`：获取主机名（如 `localhost`）。

#### 2. `NetworkInterface`（网络接口 / 网卡）

- **作用**：获取本地网络接口（网卡）信息，如名称、IP 地址、MAC 地址。

- 核心方法

  ：

  - `static NetworkInterface getByName(String name)`：通过网卡名（如 `eth0`、`wlan0`）获取对象；
  - `static Enumeration<NetworkInterface> getNetworkInterfaces()`：获取所有网卡；
  - `Enumeration<InetAddress> getInetAddresses()`：获取网卡绑定的所有 IP 地址；
  - `byte[] getHardwareAddress()`：获取 MAC 地址（需处理权限问题）。

### 模块 5：NIO 网络编程（非阻塞、多路复用）

传统 TCP/UDP 是 **阻塞式（BIO）**：一个连接对应一个线程，线程等待数据时会阻塞，并发量低。`java.nio.channels` 提供 **非阻塞（NIO）** 模型，通过 `Selector` 实现 “一个线程管理多个连接”，核心类是 `SocketChannel`、`ServerSocketChannel` 和 `Selector`。

#### 1. `ServerSocketChannel`（非阻塞服务器端通道）

- **作用**：替代 `ServerSocket`，支持非阻塞模式，绑定端口并监听连接。

- 核心方法

  ：

  - `static ServerSocketChannel open()`：打开通道；
  - `ServerSocketChannel bind(SocketAddress addr)`：绑定地址；
  - `SocketChannel accept()`：非阻塞接收连接（若无连接则返回 `null`，不会阻塞）；
  - `ServerSocketChannel configureBlocking(boolean block)`：设置是否非阻塞（`false` 为非阻塞）。

#### 2. `SocketChannel`（非阻塞客户端 / 服务器通道）

- **作用**：替代 `Socket`，支持非阻塞读写数据，通过 `ByteBuffer` 传输数据（而非流）。

- 核心方法

  ：

  - `static SocketChannel open()`：打开通道；
  - `SocketChannel connect(SocketAddress addr)`：非阻塞连接（返回 `false` 表示连接未完成，需通过 `finishConnect()` 确认）；
  - `int read(ByteBuffer buf)`：非阻塞读数据（返回读取的字节数，`-1` 表示连接关闭）；
  - `int write(ByteBuffer buf)`：非阻塞写数据；
  - `SocketChannel configureBlocking(boolean block)`：设置非阻塞模式。

#### 3. `Selector`（多路复用器）

- **作用**：监听多个 `Channel` 的事件（如 “连接就绪”“读就绪”“写就绪”），实现 “一个线程管理多个连接”。

- 核心方法

  ：

  - `static Selector open()`：打开选择器；
  - `SelectionKey register(Channel ch, int ops)`：将 `Channel` 注册到 `Selector`，并指定监听的事件（如 `SelectionKey.OP_ACCEPT` 连接就绪、`OP_READ` 读就绪）；
  - `int select()`：阻塞等待事件就绪（返回就绪的事件数）；
  - `Set<SelectionKey> selectedKeys()`：获取所有就绪的事件键（`SelectionKey`）。

#### NIO 非阻塞服务器示例（核心逻辑）：

java

```java
// 1. 打开通道和选择器
ServerSocketChannel serverChannel = ServerSocketChannel.open();
Selector selector = Selector.open();
// 2. 设置非阻塞并绑定端口
serverChannel.configureBlocking(false);
serverChannel.bind(new InetSocketAddress(8080));
// 3. 注册“连接就绪”事件到选择器
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select(); // 阻塞等待事件
    Set<SelectionKey> keys = selector.selectedKeys();
    Iterator<SelectionKey> iter = keys.iterator();
    while (iter.hasNext()) {
        SelectionKey key = iter.next();
        iter.remove(); // 避免重复处理
        
        if (key.isAcceptable()) { // 连接就绪事件
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel clientChannel = server.accept(); // 非阻塞接收
            clientChannel.configureBlocking(false);
            // 注册“读就绪”事件到选择器
            clientChannel.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) { // 读就绪事件
            SocketChannel clientChannel = (SocketChannel) key.channel();
            ByteBuffer buf = ByteBuffer.allocate(1024);
            int len = clientChannel.read(buf); // 非阻塞读
            if (len > 0) {
                System.out.println("收到：" + new String(buf.array(), 0, len));
                // 回送数据（简化）
                clientChannel.write(ByteBuffer.wrap(("已收：" + new String(buf.array(), 0, len)).getBytes()));
            } else if (len == -1) { // 连接关闭
                clientChannel.close();
            }
        }
    }
}
```

### 模块 6：扩展与辅助类

- **`Proxy` 与 `ProxySelector`**：设置网络代理（如 HTTP 代理、SOCKS 代理），支持通过代理访问网络。
- **`CookieHandler`**：管理 HTTP Cookie，实现 Cookie 的存储和读取（如会话保持）。
- **`SocketTimeoutException`**：Socket 超时异常（如 `Socket.setSoTimeout(int timeout)` 设置读取超时）。
- **`javax.net.ssl.SSLSocket`**：HTTPS 安全通信的 Socket，基于 SSL/TLS 协议，替代普通 `Socket` 实现加密传输。

## 三、核心对比与应用场景

| 技术          | 模型       | 核心类                            | 优势               | 适用场景                    |
| ------------- | ---------- | --------------------------------- | ------------------ | --------------------------- |
| TCP（BIO）    | 阻塞式     | `Socket`/`ServerSocket`           | 简单可靠           | 低并发场景（如小型服务）    |
| TCP（NIO）    | 非阻塞式   | `SocketChannel`/`Selector`        | 高并发、低开销     | 高并发服务（如网关、IM）    |
| UDP           | 无连接     | `DatagramSocket`/`DatagramPacket` | 速度快、开销小     | 实时通信（语音、视频、DNS） |
| URLConnection | 应用层协议 | `URL`/`HttpURLConnection`         | 简化 HTTP/FTP 访问 | 接口调用、网页爬取          |

## 四、关键注意事项

1. **资源关闭**：`Socket`、`ServerSocket`、`Channel` 等实现 `AutoCloseable`，需用 `try-with-resources` 确保关闭，避免资源泄漏。
2. **异常处理**：网络操作可能抛出 `IOException`（连接超时、断开）、`MalformedURLException`（URL 非法）等，需强制捕获。
3. **阻塞与非阻塞**：BIO 适合简单场景，NIO 适合高并发，但编程复杂度高（可借助 Netty 等框架简化）。
4. **端口占用**：`BindException` 表示端口被占用，需更换端口或杀死占用进程（如 `netstat -ano | findstr 8080` 查看 Windows 端口占用）。

通过 `java.net` 包，Java 实现了从 “底层协议封装” 到 “高层应用访问” 的全链路网络能力，是分布式系统、客户端 - 服务器通信、接口调用的基础。实际开发中，除了原生 API，还会结合 Netty（NIO 框架）、OkHttp（HTTP 客户端）等工具简化开发，但理解 `java.net` 的核心原理是掌握网络编程的关键。





# 问答

### 一、[java.net](https://java.net/) 包八股文（15 题，难度递增）

#### 基础篇（1-5 题）

1. **TCP 和 UDP 协议的核心区别是什么？分别对应 [java.net](https://java.net/) 中的哪些核心类？**
   答案：

   | 维度                                   | TCP                              | UDP                          |
   | -------------------------------------- | -------------------------------- | ---------------------------- |
   | 连接性                                 | 面向连接（三次握手建立连接）     | 无连接（直接发送数据）       |
   | 可靠性                                 | 可靠传输（重传、排序、流量控制） | 不可靠（数据可能丢失、乱序） |
   | 数据单位                               | 字节流                           | 数据报（Datagram）           |
   | 适用场景                               | 文件传输、登录验证               | 实时通信（语音、视频、DNS）  |
   | [java.net](https://java.net/) 对应类： |                                  |                              |

   - TCP：`Socket`（客户端）、`ServerSocket`（服务器端）；
   - UDP：`DatagramSocket`（通信端点）、`DatagramPacket`（数据载体）。

2. **`Socket` 类的核心作用是什么？简述 TCP 客户端用 `Socket` 连接服务器的流程。**
   答案：`Socket` 是 TCP 客户端与服务器的**双向通信端点**，封装了 IP 地址和端口，提供流（InputStream/OutputStream）用于数据传输。
   连接流程：

   1. 创建 `Socket` 对象：`new Socket(host, port)`（传入服务器主机名 / IP 和端口）；
   2. 获取流：`getInputStream()` 读服务器数据，`getOutputStream()` 向服务器发数据；
   3. 读写数据：通过流的 `read()`/`write()` 或包装为缓冲流（如 `BufferedReader`）处理；
   4. 关闭资源：用 `try-with-resources` 关闭 `Socket` 和流，释放连接。

3. **`URL` 类的作用是什么？一个完整的 URL 包含哪些部分？如何通过 `URL` 访问网络资源？**
   答案：`URL` 是 “统一资源定位符”，用于解析和封装 URL 地址（如 `https://www.baidu.com:80/index.html?name=test#top`）。
   完整 URL 组成：协议（`https`）、主机名（`www.baidu.com`）、端口（`80`）、路径（`/index.html`）、查询参数（`name=test`）、锚点（`top`）。
   访问资源流程：

   1. 创建 `URL` 对象：`URL url = new URL("https://www.baidu.com")`；
   2. 打开连接：`URLConnection conn = url.openConnection()`（返回 `HttpURLConnection` 等子类）；
   3. 读写资源：`conn.getInputStream()` 读响应数据，`conn.getOutputStream()` 发请求数据；
   4. 关闭连接：`conn.disconnect()`。

4. **`InetAddress` 类的核心功能是什么？如何通过主机名获取 IP 地址？如何获取本地主机的 IP 地址？**
   答案：`InetAddress` 是 IP 地址的抽象类，封装 IPv4/IPv6 地址，提供主机名与 IP 的转换。

   - 通过主机名获取 IP：`InetAddress addr = InetAddress.getByName("www.baidu.com")`（返回该主机的一个 IP）；
   - 获取所有 IP：`InetAddress[] addrs = InetAddress.getAllByName("www.baidu.com")`（多 IP 主机返回所有地址）；
   - 获取本地主机 IP：`InetAddress local = InetAddress.getLocalHost()`（返回本地主机的 IP 和主机名）。

5. **`ServerSocket` 的 `accept()` 方法有什么特点？为什么 TCP 服务器需要多线程处理客户端连接？**
   答案：`accept()` 是**阻塞方法**：调用后会暂停线程，直到有客户端连接请求，返回与该客户端通信的 `Socket` 对象。
   多线程处理原因：传统 TCP 服务器（BIO 模型）中，一个 `accept()` 对应一个客户端，若单线程处理，同一时间只能响应一个客户端，其他客户端需排队等待；多线程可让每个客户端连接对应一个线程（或线程池），实现并发处理多个客户端。

#### 进阶篇（6-10 题）

1. **`DatagramSocket` 和 `DatagramPacket` 的区别与协作流程？UDP 发送数据时为什么不需要建立连接？**
   答案：

   - 区别：`DatagramSocket` 是 UDP 通信的**端点**（负责发送 / 接收数据报）；`DatagramPacket` 是 UDP 数据的**载体**（封装字节数组、目标地址和端口）。
   - 协作流程：
     1. 发送方：创建 `DatagramSocket` → 封装 `DatagramPacket`（数据 + 目标地址）→ `send(packet)` 发送；
     2. 接收方：创建 `DatagramSocket`（绑定端口）→ 封装空 `DatagramPacket`（接收缓冲区）→ `receive(packet)` 接收（数据存入缓冲区）。
        UDP 无需建立连接：UDP 是 “无连接协议”，每个数据报都包含完整的目标地址，发送方直接将数据报投递给网络，接收方监听端口等待数据报，无需三次握手建立连接，因此速度快但不可靠。

2. **`URLConnection` 和 `HttpURLConnection` 的关系？`HttpURLConnection` 如何设置请求方法和请求头？**
   答案：`URLConnection` 是 URL 连接的**抽象基类**，`HttpURLConnection` 是其**子类**，专门实现 HTTP/HTTPS 协议的连接。
   设置请求方法和请求头：

   java

   ```java
   URL url = new URL("https://api.example.com");
   HttpURLConnection conn = (HttpURLConnection) url.openConnection();
   // 1. 设置请求方法（GET/POST/PUT/DELETE，默认 GET）
   conn.setRequestMethod("POST");
   // 2. 设置请求头（如 Content-Type、User-Agent）
   conn.setRequestProperty("Content-Type", "application/json");
   conn.setRequestProperty("User-Agent", "Mozilla/5.0");
   ```

3. **TCP 通信中，`Socket` 的 `shutdownInput()` 和 `close()` 有什么区别？什么是 “半关闭” 问题？**
   答案：

   - 区别：`shutdownInput()` 仅**单向关闭输入流**（不能再读数据），输出流仍可写；`close()` 关闭整个 `Socket`（输入流和输出流均关闭，释放连接）。
   - “半关闭” 问题：若客户端仅调用 `close()`，服务器可能因未读取完客户端发送的数据而阻塞在 `read()` 方法；若客户端先调用 `shutdownOutput()`（关闭输出流，发送 FIN 包），服务器读取到 `-1` 就知道客户端已写完，可正常关闭，避免阻塞。

4. **BIO 模型（传统 TCP 编程）的缺点是什么？NIO 模型如何解决这些缺点？`java.nio.channels` 中的核心类有哪些？**
   答案：

   - BIO 缺点：一个连接对应一个线程，线程等待数据时会**阻塞**（如 `accept()`、`read()`），并发量高时线程数暴增，线程切换开销大，性能瓶颈明显。
   - NIO 解决思路：基于 “**通道（Channel）+ 缓冲区（Buffer）+ 选择器（Selector）** ” 的非阻塞模型，一个线程通过 `Selector` 管理多个连接，仅处理 “就绪” 事件（如连接就绪、读就绪），减少线程数和阻塞。
   - NIO 核心类：`SocketChannel`（非阻塞客户端通道）、`ServerSocketChannel`（非阻塞服务器通道）、`Selector`（多路复用器）、`ByteBuffer`（数据缓冲区）。

5. **`NetworkInterface` 类的作用是什么？如何获取本地所有网卡的 IP 地址和 MAC 地址？**
   答案：`NetworkInterface` 封装**本地网络接口（网卡）** 信息，用于获取网卡名称、绑定的 IP 地址、MAC 地址等。
   获取所有网卡信息示例：

   java

   ```java
   Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
   while (interfaces.hasMoreElements()) {
       NetworkInterface ni = interfaces.nextElement();
       System.out.println("网卡名：" + ni.getName());
       // 获取 MAC 地址
       byte[] mac = ni.getHardwareAddress();
       if (mac != null) {
           StringBuilder macStr = new StringBuilder();
           for (byte b : mac) {
               macStr.append(String.format("%02X:", b));
           }
           System.out.println("MAC 地址：" + macStr.substring(0, macStr.length() - 1));
       }
       // 获取绑定的 IP 地址
       Enumeration<InetAddress> addrs = ni.getInetAddresses();
       while (addrs.hasMoreElements()) {
           InetAddress addr = addrs.nextElement();
           System.out.println("IP 地址：" + addr.getHostAddress());
       }
   }
   ```

#### 深入篇（11-15 题）

1. **`Selector` 的 “多路复用” 机制是什么？`SelectionKey` 包含哪些核心事件类型？如何通过 `Selector` 管理多个 `Channel`？**
   答案：

   - 多路复用机制：`Selector` 是 “事件监听器”，可同时监听多个 `Channel` 的事件，当 `Channel` 触发事件（如连接就绪、读就绪），`Selector` 会将事件标记为 “就绪”，线程仅需处理就绪事件，无需阻塞等待每个 `Channel`。

   - ```
     SelectionKey
     ```

      

     核心事件：

     - `OP_ACCEPT`：服务器通道（`ServerSocketChannel`）的连接就绪事件；
     - `OP_READ`：通道的读就绪事件（有数据可读）；
     - `OP_WRITE`：通道的写就绪事件（可写入数据）；
     - `OP_CONNECT`：客户端通道（`SocketChannel`）的连接就绪事件。

   - 管理流程：

     1. 打开 `Selector`：`Selector selector = Selector.open()`；
     2. 通道设置非阻塞：`channel.configureBlocking(false)`；
     3. 通道注册到 `Selector`：`channel.register(selector, OP_READ)`（指定监听事件）；
     4. 阻塞等待事件：`selector.select()`；
     5. 处理就绪事件：遍历 `selector.selectedKeys()`，根据事件类型处理（如读、写）。

2. **HTTPS 通信在 [java.net](https://java.net/) 中如何实现？`SSLSocket` 和普通 `Socket` 的区别是什么？**
   答案：HTTPS 基于 “HTTP + SSL/TLS”，[java.net](https://java.net/) 通过 `javax.net.ssl.SSLSocket` 实现加密通信，核心是证书验证和数据加密。

   - ```
     SSLSocket
     ```

      

     与普通

      

     ```
     Socket
     ```

      

     区别：

     1. 协议层：`SSLSocket` 基于 SSL/TLS 协议，普通 `Socket` 基于 TCP 协议；

     2. 安全性：`SSLSocket` 会对数据加密（对称加密）和身份验证（证书），普通 `Socket` 数据明文传输；

     3. 创建方式：普通

         

        ```
        Socket
        ```

         

        直接

         

        ```
        new Socket()
        ```

        ，

        ```
        SSLSocket
        ```

         

        通过

         

        ```
        SSLContext
        ```

         

        创建：

        java

        

        运行

        

        

        

        

        ```java
        SSLContext context = SSLContext.getDefault();
        SSLSocketFactory factory = context.getSocketFactory();
        SSLSocket sslSocket = (SSLSocket) factory.createSocket("www.baidu.com", 443);
        ```

3. **`Proxy` 类的作用是什么？如何通过代理访问网络（如 HTTP 代理）？**
   答案：`Proxy` 封装网络代理信息，用于通过代理服务器访问网络（如突破防火墙、隐藏真实 IP）。
   通过 HTTP 代理访问网络示例：

   java

   ```java
   // 1. 创建代理对象（代理服务器 IP、端口）
   Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 8888));
   // 2. 通过代理打开 URL 连接
   URL url = new URL("https://www.baidu.com");
   URLConnection conn = url.openConnection(proxy); // 传入代理
   // 3. 读写数据（同普通连接）
   BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
   String line = in.readLine();
   ```
   
4. **TCP 粘包 / 拆包问题是什么？如何通过 [java.net](https://java.net/) 解决？**
   答案：TCP 是字节流，数据会按 “缓冲区大小” 拆分或合并，导致接收方无法确定数据边界（粘包：多个数据包合并；拆包：一个数据包拆分）。
   解决方式（核心是 “定义数据边界”）：

   1. 固定长度：每个数据包固定长度（如 1024 字节），接收方按固定长度读取；
   2. 分隔符：数据包末尾加特殊分隔符（如 `\n`），接收方按分隔符拆分；
   3. 长度字段：数据包开头加 2/4 字节的长度字段（表示数据长度），接收方先读长度，再读对应字节的数据。
      示例（长度字段方式）：

   java

   ```java
   // 发送方：先写长度（4字节），再写数据
   DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
   String data = "Hello TCP";
   byte[] bytes = data.getBytes();
   dos.writeInt(bytes.length); // 写长度
   dos.write(bytes); // 写数据
   
   // 接收方：先读长度，再读对应字节
   DataInputStream dis = new DataInputStream(socket.getInputStream());
   int len = dis.readInt(); // 读长度
   byte[] buf = new byte[len];
   dis.readFully(buf); // 读指定长度的数据
   ```
   
5. **NIO 模型中，`ByteBuffer` 的 `flip()`、`clear()`、`compact()` 方法分别有什么作用？**
   答案：`ByteBuffer` 是 NIO 的核心缓冲区，通过 “读写模式切换” 管理数据，三个方法用于模式切换和数据清理：

   - `flip()`：**从写模式切换到读模式**，将 `limit` 设为当前 `position`，`position` 重置为 0，`mark` 置为 -1（读数据前必须调用）；
   - `clear()`：**清空缓冲区，切换到写模式**，将 `position` 设为 0，`limit` 设为 `capacity`，`mark` 置为 -1（不实际删除数据，仅重置指针，适合 “全部数据已读完” 场景）；
   - `compact()`：**压缩缓冲区，切换到写模式**，将未读完的数据（`position` 到 `limit`）复制到缓冲区开头，`position` 设为未读数据长度，`limit` 设为 `capacity`（适合 “部分数据未读完，需继续写” 场景）。

### 二、[java.net](https://java.net/) 场景题（5 题，难度递增）

#### 场景 1：基础 TCP 客户端 - 服务器通信（BIO）

**需求**：实现一个简单的 TCP 服务器，接收客户端发送的字符串，在字符串前添加 “服务器回复：” 后回送客户端；客户端发送字符串并打印服务器回复。
**答案**：

java

```java
// 1. TCP 服务器（多线程处理多客户端）
public class TcpServer {
    public static void main(String[] args) throws IOException {
        ServerSocket serverSocket = new ServerSocket(8080);
        System.out.println("服务器启动，监听端口 8080...");
        while (true) {
            Socket clientSocket = serverSocket.accept(); // 阻塞等待客户端连接
            // 启动线程处理客户端（避免单线程阻塞）
            new Thread(() -> {
                try (// try-with-resources 自动关闭流和 Socket
                     BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                     PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) { // autoFlush=true
                    String clientMsg = in.readLine(); // 读客户端消息
                    System.out.println("收到客户端消息：" + clientMsg);
                    out.println("服务器回复：" + clientMsg); // 回送消息
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}

// 2. TCP 客户端
public class TcpClient {
    public static void main(String[] args) throws IOException {
        try (Socket socket = new Socket("localhost", 8080);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
            // 发送消息
            String msg = "Hello TCP Server!";
            out.println(msg);
            // 接收服务器回复
            String serverReply = in.readLine();
            System.out.println("服务器回复：" + serverReply);
        }
    }
}
```

#### 场景 2：UDP 数据报发送与接收

**需求**：实现 UDP 客户端发送 “Hello UDP” 到服务器，服务器接收后打印消息，并回复 “收到：Hello UDP” 给客户端。
**答案**：

java

```java
// 1. UDP 服务器（接收并回复）
public class UdpServer {
    public static void main(String[] args) throws IOException {
        // 绑定 8080 端口
        DatagramSocket serverSocket = new DatagramSocket(8080);
        byte[] receiveBuf = new byte[1024];
        DatagramPacket receivePacket = new DatagramPacket(receiveBuf, receiveBuf.length);
        System.out.println("UDP 服务器启动，监听端口 8080...");

        // 接收客户端消息
        serverSocket.receive(receivePacket); // 阻塞接收
        String clientMsg = new String(receivePacket.getData(), 0, receivePacket.getLength());
        System.out.println("收到客户端消息：" + clientMsg);

        // 回复客户端（获取客户端地址和端口）
        InetAddress clientAddr = receivePacket.getAddress();
        int clientPort = receivePacket.getPort();
        String replyMsg = "收到：" + clientMsg;
        byte[] replyBuf = replyMsg.getBytes();
        DatagramPacket replyPacket = new DatagramPacket(replyBuf, replyBuf.length, clientAddr, clientPort);
        serverSocket.send(replyPacket);

        serverSocket.close();
    }
}

// 2. UDP 客户端（发送并接收回复）
public class UdpClient {
    public static void main(String[] args) throws IOException {
        DatagramSocket clientSocket = new DatagramSocket(); // 随机端口
        InetAddress serverAddr = InetAddress.getByName("localhost");
        int serverPort = 8080;

        // 发送消息
        String msg = "Hello UDP";
        byte[] sendBuf = msg.getBytes();
        DatagramPacket sendPacket = new DatagramPacket(sendBuf, sendBuf.length, serverAddr, serverPort);
        clientSocket.send(sendPacket);

        // 接收服务器回复
        byte[] receiveBuf = new byte[1024];
        DatagramPacket receivePacket = new DatagramPacket(receiveBuf, receiveBuf.length);
        clientSocket.receive(receivePacket);
        String serverReply = new String(receivePacket.getData(), 0, receivePacket.getLength());
        System.out.println("服务器回复：" + serverReply);

        clientSocket.close();
    }
}
```

#### 场景 3：URL 爬取网页内容（HTTP GET 请求）

**需求**：通过 `URL` 和 `HttpURLConnection` 发送 HTTP GET 请求，爬取 `https://www.baidu.com` 的首页内容，并打印前 1000 个字符。
**答案**：

java

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class UrlCrawler {
    public static void main(String[] args) throws IOException {
        // 1. 创建 URL 对象
        URL url = new URL("https://www.baidu.com");
        // 2. 打开 HTTP 连接
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        // 3. 设置请求参数
        conn.setRequestMethod("GET"); // 请求方法
        conn.setConnectTimeout(5000); // 连接超时（5秒）
        conn.setReadTimeout(5000);    // 读取超时（5秒）
        // 设置请求头，模拟浏览器（避免被服务器拦截）
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0");

        // 4. 处理响应（判断响应码，200 表示成功）
        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
            // 5. 读取响应内容（指定 UTF-8 编码，避免乱码）
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder content = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    content.append(line).append("\n");
                }
                // 打印前 1000 个字符
                String result = content.toString();
                System.out.println(result.length() > 1000 ? result.substring(0, 1000) : result);
            }
        } else {
            System.out.println("请求失败，响应码：" + conn.getResponseCode());
        }

        // 6. 关闭连接
        conn.disconnect();
    }
}
```

#### 场景 4：NIO 非阻塞 TCP 服务器（单线程管理多客户端）

**需求**：实现一个 NIO 非阻塞 TCP 服务器，支持同时处理多个客户端连接，接收客户端发送的消息并回送 “NIO 服务器收到：”+ 消息。
**答案**：

java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

public class NioTcpServer {
    public static void main(String[] args) throws IOException {
        // 1. 打开服务器通道和选择器
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        Selector selector = Selector.open();
        // 2. 设置非阻塞并绑定端口
        serverChannel.configureBlocking(false);
        serverChannel.bind(new InetSocketAddress(8080));
        // 3. 注册“连接就绪”事件到选择器
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);
        System.out.println("NIO 服务器启动，监听端口 8080...");

        while (true) {
            // 4. 阻塞等待事件就绪（返回就绪事件数）
            int readyCount = selector.select();
            if (readyCount == 0) continue;

            // 5. 处理就绪事件
            Set<SelectionKey> readyKeys = selector.selectedKeys();
            Iterator<SelectionKey> iter = readyKeys.iterator();
            while (iter.hasNext()) {
                SelectionKey key = iter.next();
                iter.remove(); // 移除，避免重复处理

                if (key.isAcceptable()) { // 连接就绪事件
                    handleAccept(key, selector);
                } else if (key.isReadable()) { // 读就绪事件
                    handleRead(key);
                }
            }
        }
    }

    // 处理连接就绪：接收客户端连接，注册读事件
    private static void handleAccept(SelectionKey key, Selector selector) throws IOException {
        ServerSocketChannel serverChannel = (ServerSocketChannel) key.channel();
        SocketChannel clientChannel = serverChannel.accept(); // 非阻塞接收
        clientChannel.configureBlocking(false); // 设置非阻塞
        // 注册“读就绪”事件，附加 ByteBuffer 用于存储数据
        clientChannel.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));
        System.out.println("新客户端连接：" + clientChannel.getRemoteAddress());
    }

    // 处理读就绪：读取客户端消息，回送响应
    private static void handleRead(SelectionKey key) throws IOException {
        SocketChannel clientChannel = (SocketChannel) key.channel();
        ByteBuffer buf = (ByteBuffer) key.attachment(); // 获取附加的缓冲区

        int readLen = clientChannel.read(buf); // 非阻塞读
        if (readLen > 0) {
            buf.flip(); // 切换到读模式
            byte[] data = new byte[buf.remaining()];
            buf.get(data);
            String clientMsg = new String(data);
            System.out.println("收到客户端消息：" + clientMsg);

            // 回送响应
            String reply = "NIO 服务器收到：" + clientMsg;
            ByteBuffer replyBuf = ByteBuffer.wrap(reply.getBytes());
            clientChannel.write(replyBuf);

            buf.clear(); // 切换到写模式，准备下次读
        } else if (readLen == -1) { // 客户端关闭连接
            System.out.println("客户端断开连接：" + clientChannel.getRemoteAddress());
            clientChannel.close();
            key.cancel(); // 取消选择键
        }
    }
}
```

#### 场景 5：带 HTTP 代理的 URL 请求

**需求**：通过本地 HTTP 代理（地址 `127.0.0.1`，端口 `8888`）访问 `https://httpbin.org/ip`（该接口返回客户端 IP），验证代理是否生效（返回代理 IP 而非真实 IP）。
**答案**：

java

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class ProxyUrlRequest {
    public static void main(String[] args) throws IOException {
        // 1. 配置代理信息（代理类型：HTTP，代理地址：127.0.0.1，端口：8888）
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 8888));

        // 2. 创建 URL 对象（目标接口：返回客户端 IP）
        URL url = new URL("https://httpbin.org/ip");

        // 3. 通过代理打开连接
        HttpURLConnection conn = (HttpURLConnection) url.openConnection(proxy);
        // 4. 设置请求参数
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");

        // 5. 处理响应
        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                StringBuilder response = new StringBuilder();
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                System.out.println("接口返回（代理 IP）：" + response);
                // 若返回的 IP 是代理服务器 IP，说明代理生效
            }
        } else {
            System.out.println("请求失败，响应码：" + conn.getResponseCode());
        }

        // 6. 关闭连接
        conn.disconnect();
    }
}
```