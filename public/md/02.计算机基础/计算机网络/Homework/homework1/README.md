# webget 命令行工具

webget是一个简单的命令行工具，用于通过HTTP协议下载文件。它不依赖任何第三方网络库，而是直接使用socket系统调用来实现HTTP客户端功能。

## 功能特点

- 支持HTTP协议下载文件
- 处理URL无路径的情况（默认使用/）
- 支持处理分块传输编码(Chunked Transfer Encoding)
- 自动从URL或响应头中确定保存的文件名

## 编译方法

1. 创建构建目录并进入：
   ```bash
   mkdir build && cd build
   ```

2. 生成Makefile：
   ```bash
   cmake ..
   ```

3. 编译：
   ```bash
   make
   ```

4. 编译成功后，在build目录下会生成webget可执行文件。

## 使用方法
./webget <URL>
### 示例

下载cs144课程的index.html：./webget http://cs144.keithw.org/index.html
下载指定端口的资源：./webget http://example.com:8080/path/to/file
下载根路径资源：./webget http://example.com（会自动使用路径/）

## 实现说明

webget的工作流程如下：

1. 解析输入的URL，提取主机名、端口和路径
2. 创建socket并连接到目标服务器
3. 发送HTTP GET请求
4. 接收并解析HTTP响应
5. 根据响应头判断是否使用分块传输编码
6. 处理响应内容（分块或普通传输）
7. 将内容保存到文件中

程序使用C++标准库和系统调用实现，不依赖任何第三方网络库。


这段代码实现了一个基于 `socket` 系统调用的轻量级 HTTP 下载工具 `webget`，核心功能是通过命令行输入 HTTP URL 并下载文件到本地。整体逻辑清晰，分为「URL 解析」「HTTP 通信」「响应处理」「文件保存」四个核心环节，完全不依赖第三方网络库（如 `libcurl`），直接使用操作系统的 `socket` 接口完成网络通信。


### 一、整体结构
代码包含 6 个主要函数和 1 个主函数 `main`，各部分职责如下：
```
webget.cc
├─ parse_url：解析 URL，提取主机名、端口、路径
├─ get_filename：确定下载文件的本地保存名称
├─ handle_chunked_transfer：处理 HTTP 分块传输编码的响应
├─ handle_normal_transfer：处理普通（非分块）传输的响应
├─ download_file：核心下载逻辑（建立连接、发送请求、接收响应、保存文件）
└─ main：解析命令行参数，触发下载流程
```


### 二、核心函数详解

#### 1. `parse_url`：解析 URL 信息
作用：从输入的 URL 中提取 **主机名（host）**、**端口（port）**、**路径（path）**，处理各种 URL 格式（如带端口、无路径等）。

关键逻辑：
- 先检查 URL 是否以 `http://` 开头（只支持 HTTP 协议）；
- 区分「带端口」和「默认端口（80）」的情况：
   - 若 URL 中存在 `:`（如 `http://example.com:8080/path`），则提取 `:` 后的端口号；
   - 若无 `:`，默认端口为 80；
- 处理「无路径」的情况（如 `http://example.com`），默认路径为 `/`。

示例：
- 输入 `http://cs144.keithw.org/index.html` → 主机 `cs144.keithw.org`，端口 80，路径 `/index.html`；
- 输入 `http://example.com:8080` → 主机 `example.com`，端口 8080，路径 `/`。


#### 2. `download_file`：核心下载逻辑（最关键）
这是整个工具的核心函数，完整实现了「建立连接 → 发送请求 → 接收响应 → 处理响应 → 保存文件」的全流程。

##### 步骤 1：创建 socket 并连接服务器
- `socket(AF_INET, SOCK_STREAM, 0)`：创建 TCP 套接字（`SOCK_STREAM` 表示 TCP 协议）；
- `gethostbyname(host.c_str())`：将主机名（如 `cs144.keithw.org`）解析为 IP 地址；
- `connect(sockfd, ...)`：通过 socket 连接到服务器的 IP 和端口。

##### 步骤 2：发送 HTTP GET 请求
构造符合 HTTP 协议的请求报文，格式如下：
```http
GET /path HTTP/1.1          # 请求行：方法（GET）、路径、协议版本
Host: cs144.keithw.org      # 主机名（必须，HTTP 1.1 要求）
Connection: close           # 告诉服务器响应后关闭连接
User-Agent: webget/1.0      # 标识客户端类型
（空行，表示请求头结束）
```
通过 `send(sockfd, ...)` 将请求发送到服务器。

##### 步骤 3：接收服务器响应
- 用 `recv(sockfd, buffer, ...)` 循环接收数据（每次最多 4096 字节），拼接成完整响应；
- 响应包含「响应头」和「响应体」，中间用 `\r\n\r\n` 分隔。

##### 步骤 4：解析响应状态
- 检查响应首行（如 `HTTP/1.1 200 OK`），提取状态码（中间的 3 位数字）；
- 仅处理状态码为 `200` 的成功响应，其他状态码（如 404、500）直接报错。

##### 步骤 5：处理响应体并保存
- 根据响应头中的 `Transfer-Encoding: chunked` 判断是否为「分块传输」：
   - 分块传输：调用 `handle_chunked_transfer` 解析分块数据；
   - 普通传输：调用 `handle_normal_transfer` 直接保存响应体；
- 调用 `get_filename` 确定保存的文件名，用二进制模式（`std::ios::binary`）写入文件（避免文本模式导致的换行符转换问题）。


#### 3. `handle_chunked_transfer`：处理分块传输
HTTP 分块传输是一种动态生成内容的传输方式（服务器不知道总长度时使用），格式为：
```
[块大小（十六进制）]\r\n
[块数据]\r\n
...
0\r\n
\r\n  # 结束
```
函数逻辑：
- 从响应体中循环解析每个块：
   1. 读取块大小（十六进制字符串），转换为十进制；
   2. 读取对应大小的块数据并写入文件；
   3. 跳过块后的 `\r\n`；
   4. 当块大小为 `0` 时，结束处理。


#### 4. `handle_normal_transfer`：处理普通传输
非分块传输时，响应体是连续的字节流，直接从 `\r\n\r\n` 之后的位置提取所有内容，写入文件即可。


#### 5. `get_filename`：确定保存的文件名
优先级：
1. 优先从响应头的 `Content-Disposition: filename="xxx"` 中提取；
2. 若没有，则从 URL 中提取（如 `http://xxx/abc.html` → 文件名 `abc.html`）；
3. 若 URL 无文件名（如 `http://xxx/`），默认用 `index.html`。


#### 6. `main`：入口函数
- 检查命令行参数：必须传入 1 个 URL（如 `./webget http://xxx`）；
- 调用 `download_file` 执行下载，根据返回值判断成功与否。


### 三、关键技术点
1. **socket 编程**：直接使用操作系统的 `socket`、`connect`、`send`、`recv` 等系统调用，实现 TCP 连接和数据传输；
2. **HTTP 协议**：严格遵循 HTTP 1.1 规范构造请求、解析响应（状态码、请求头、分块传输等）；
3. **错误处理**：每个系统调用（如 `socket`、`connect`）都检查返回值，出错时输出具体错误信息（如 `strerror(errno)`）；
4. **资源清理**：无论成功与否，都会关闭 socket、删除不完整的文件，避免资源泄露。


### 四、使用场景
编译后，通过命令行下载 HTTP 资源：
```bash
# 下载 cs144 的 index.html
./webget http://cs144.keithw.org/index.html

# 下载带端口的资源
./webget http://example.com:8080/data.txt
```


总结：这段代码是一个精简但完整的 HTTP 客户端实现，通过手动处理 socket 和 HTTP 协议细节，展示了网络通信的底层逻辑，适合理解「从 URL 到本地文件」的完整流程。