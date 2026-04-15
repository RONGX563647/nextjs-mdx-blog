

## 思维导图

[分布式RPC框架 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/60e9622ef346fb6bcd256e42)

# rpc 源码

# net包

要全面掌握 `net/rpc` 包，需要从**包定位、核心规则细节、服务端 / 客户端深度原理、编解码机制、错误处理、进阶场景**等维度展开，以下结合源码和实践案例，进行完整拆解：

# 一、包定位与版本说明

`net/rpc` 是 Go 标准库提供的**轻量级远程过程调用（RPC）框架**，核心目标是 “让跨网络调用远程对象的方法，像调用本地方法一样简单”。

- **适用场景**：简单的 Go 语言间 RPC 通信（如单机多进程、小规模服务间调用）。

- 局限性

  ：

  1. 仅支持 Go 语言（依赖 `encoding/gob` 序列化，默认不兼容其他语言）；
  2. 功能冻结（官方文档明确 “不再接受新特性”），复杂场景（如微服务、流量控制）需用 `gRPC` 等替代；
  3. 默认无超时控制（需手动实现）、无负载均衡。

# 二、远程方法的 “严格规则”（含细节补充）

`net/rpc` 仅导出满足以下所有条件的方法，任何一条不满足都会被忽略，这是使用的核心前提：

| 规则编号 | 规则描述                  | 细节说明                                                     | 反例（不满足的情况）                                         |
| -------- | ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1        | 方法接收者类型必须导出    | 接收者类型首字母大写（如 `type Arith int` 合法，`type arith int` 不合法） | `func (t *arith) Multiply(...) error`（接收者类型小写）      |
| 2        | 方法本身必须导出          | 方法名首字母大写（如 `Multiply` 合法，`multiply` 不合法）    | `func (t *Arith) multiply(...) error`（方法名小写）          |
| 3        | 方法必须有且仅有 2 个参数 | 第一个参数：客户端传入的 “请求参数”；第二个参数：服务端返回的 “响应结果”（必须是指针） | `func (t *Arith) Multiply(a int) error`（仅 1 个参数）       |
| 4        | 两个参数类型必须可序列化  | 类型需是 “导出类型”（首字母大写）或 “内置类型”（如 `int`、`string`、`[]byte`），且支持 `encoding/gob` 序列化 | `func (t *Arith) Multiply(a unexportedType, b *int) error`（参数 1 是未导出类型） |
| 5        | 第二个参数必须是指针      | 因为服务端需要通过指针修改值，将结果回传给客户端             | `func (t *Arith) Multiply(a *Args, b Quotient) error`（参数 2 不是指针） |
| 6        | 方法返回值必须是 `error`  | 用于传递调用错误（如参数非法、业务异常），无错误则返回 `nil` | `func (t *Arith) Multiply(a *Args, b *int) int`（返回值不是 `error`） |

**合规方法示例**：

go

```go
// 完全符合规则：接收者导出、方法导出、2个参数（第二个是指针）、返回error
func (t *Arith) Divide(args *Args, quo *Quotient) error {
    if args.B == 0 {
        return errors.New("divide by zero") // 错误会回传给客户端
    }
    quo.Quo = args.A / args.B // 通过指针修改响应结果
    quo.Rem = args.A % args.B
    return nil // 无错误
}
```

# 三、服务端核心机制与配置

服务端的核心职责是 “注册服务 → 监听连接 → 解析请求 → 调用方法 → 返回结果”，以下拆解关键组件和流程：

## 1. 核心结构：`Server`

`Server` 是服务端的 “总控制器”，管理服务注册、请求分发和连接处理，源码中核心字段：

go

```go
type Server struct {
    serviceMap sync.Map   // 存储已注册的服务：key=服务名，value=*service
    reqLock    sync.Mutex // 保护请求对象的复用（freeReq链表）
    freeReq    *Request   // 空闲的Request对象（复用，减少内存分配）
    respLock   sync.Mutex // 保护响应对象的复用（freeResp链表）
    freeResp   *Response  // 空闲的Response对象（复用）
}
```

- **默认实例**：`DefaultServer`（包级变量），大部分场景下无需手动创建 `Server`，直接用 `rpc.Register`（底层调用 `DefaultServer.Register`）即可。

## 2. 服务注册：`Register` 与 `RegisterName`

### （1）`Register(rcvr any) error`

- 功能：将 `rcvr` 对象注册为 “RPC 服务”，服务名默认是 `rcvr` 的**具体类型名**（如 `rcvr` 是 `*Arith`，服务名是 `Arith`）。
- 限制：同一服务名只能注册一次，重复注册会返回 `rpc: service already defined` 错误。

**示例**：

go

```go
arith := new(Arith) // Arith是导出类型
err := rpc.Register(arith) // 服务名默认是 "Arith"
if err != nil {
    log.Fatal(err)
}
```

### （2）`RegisterName(name string, rcvr any) error`

- 功能：手动指定服务名（避免默认类型名冲突），其他逻辑与 `Register` 一致。

**示例**：

go

```go
// 手动指定服务名为 "MathService"，而非默认的 "Arith"
err := rpc.RegisterName("MathService", arith)
```

### （3）注册背后的 “方法筛选”

注册时，`Server` 会调用 `suitableMethods` 函数，筛选出符合 “远程方法规则” 的方法，存入 `service.method` 字典（key = 方法名，value=*methodType）。
`methodType` 结构存储方法的元信息：

go

```go
type methodType struct {
    sync.Mutex // 保护调用次数统计
    method     reflect.Method // 反射得到的方法对象
    ArgType    reflect.Type   // 第一个参数（请求）的类型
    ReplyType  reflect.Type   // 第二个参数（响应）的类型
    numCalls   uint           // 方法被调用的次数（可通过 NumCalls() 查看）
}
```

## 3. 服务启动：3 种常见方式

服务端启动后，会监听连接并处理请求，常见 3 种启动方式：

### （1）基于 TCP 直接监听（纯 RPC 协议）

go

```go
func main() {
    arith := new(Arith)
    rpc.Register(arith)

    // 1. 监听 TCP 端口
    lis, err := net.Listen("tcp", ":1234")
    if err != nil {
        log.Fatal("listen error:", err)
    }

    // 2. 接受连接并处理（循环阻塞）
    // Accept() 会为每个新连接启动一个 goroutine 执行 ServeConn()
    rpc.Accept(lis)
}
```

- **流程**：`Accept` 循环接收新连接 → 对每个连接启动 `ServeConn` → `ServeConn` 用 `gob` 编解码处理请求。

### （2）基于 HTTP 监听（RPC over HTTP）

适合需要通过 HTTP 协议传输 RPC 请求的场景（如穿透某些只允许 HTTP 的网关）：

go

```go
func main() {
    arith := new(Arith)
    rpc.Register(arith)

    // 1. 注册 HTTP 处理器：
    // - RPC 请求路径：默认 "/_goRPC_"（可自定义）
    // - 调试路径：默认 "/debug/rpc"（可查看已注册的服务和方法）
    rpc.HandleHTTP()

    // 2. 监听 HTTP 端口
    lis, err := net.Listen("tcp", ":1234")
    if err != nil {
        log.Fatal("listen error:", err)
    }

    // 3. 启动 HTTP 服务
    http.Serve(lis, nil)
}
```

- **调试路径**：访问 `http://服务端IP:1234/debug/rpc`，可查看已注册的服务和方法（如 `Arith.Multiply`、`Arith.Divide`）。
- **HTTP 请求方式**：客户端需用 `CONNECT` 方法（而非 `GET`/`POST`），因为 RPC 需要双向通信。

### （3）处理单个连接（`ServeConn`）

适合自定义连接来源（如 Unix 域套接字、加密连接）：

go

```go
// 示例：处理 Unix 域套接字连接
func main() {
    arith := new(Arith)
    rpc.Register(arith)

    // 监听 Unix 域套接字
    lis, err := net.Listen("unix", "/tmp/rpc.sock")
    if err != nil {
        log.Fatal(err)
    }

    for {
        conn, err := lis.Accept()
        if err != nil {
            log.Println(err)
            continue
        }
        // 处理单个连接（通常启动 goroutine，避免阻塞）
        go rpc.ServeConn(conn)
    }
}
```

## 4. 服务端请求处理流程（底层逻辑）

当客户端发起请求时，服务端 `ServeConn` 会按以下步骤处理：

1. **编解码初始化**：默认用 `gobServerCodec`（基于 `encoding/gob`），初始化解码器（`dec`）和编码器（`enc`）。

2. 循环读取请求

   ：

   - 调用 `ReadRequestHeader`：解码请求头（`Request` 结构，含 `ServiceMethod` 服务方法名、`Seq` 序列号）。
   - 调用 `ReadRequestBody`：解码请求体（客户端传入的参数）。

3. 查找服务和方法

   ：

   - 从 `ServiceMethod`（如 `Arith.Multiply`）中拆分 “服务名”（`Arith`）和 “方法名”（`Multiply`）。
   - 从 `serviceMap` 中查找服务 → 从服务的 `method` 字典中查找方法。

4. 反射调用方法

   ：

   - 用 `reflect` 创建参数对象（`argv`）和响应对象（`replyv`）。
   - 调用 `method.Func.Call`（反射调用方法），传入接收者、参数、响应指针。

5. 返回结果

   ：

   - 若方法返回 `error`，则响应头 `Response.Error` 设为错误信息，不返回响应体。
   - 若无错误，编码响应头和响应体，回传给客户端。

6. **资源复用**：请求处理完成后，`Request` 和 `Response` 对象会被放回 `freeReq`/`freeResp` 链表，复用减少内存分配。

# 四、客户端核心机制与配置

客户端的核心职责是 “建立连接 → 构造请求 → 发送请求 → 解析响应”，以下拆解关键组件和流程：

## 1. 核心结构：`Client`

`Client` 是客户端的 “请求发起器”，管理连接、请求序列号和异步调用，源码中核心字段：

go

```go
type Client struct {
    conn            io.ReadWriteCloser // 与服务端的连接
    dec             *gob.Decoder       // 解码器
    enc             *gob.Encoder       // 编码器
    encBuf          *bufio.Writer      // 编码缓冲区（提升性能）
    seq             uint64             // 请求序列号（自增，用于匹配请求和响应）
    pending         map[uint64]*Call   // 未完成的异步调用：key=seq，value=*Call
    mu              sync.Mutex         // 保护 pending 和 seq
    closing         bool               // 是否正在关闭
    shutdown        bool               // 是否已关闭
    done            chan struct{}      // 关闭通知通道
}
```

## 2. 建立连接：`Dial` 与 `DialHTTP`

### （1）`Dial(network, address string) (*Client, error)`

- 功能：基于纯 RPC 协议（`gob` 编解码）建立连接，适用于服务端用 `Accept` 启动的场景。
- 参数：`network` 是网络类型（如 `tcp`、`unix`），`address` 是服务端地址（如 `127.0.0.1:1234`、`/tmp/rpc.sock`）。

**示例**：

go

```go
client, err := rpc.Dial("tcp", "127.0.0.1:1234")
if err != nil {
    log.Fatal("dial error:", err)
}
defer client.Close() // 关闭连接
```

### （2）`DialHTTP(network, address string) (*Client, error)`

- 功能：基于 HTTP 协议建立 RPC 连接，适用于服务端用 `HandleHTTP` 启动的场景。
- 底层逻辑：发送 `CONNECT` 请求到服务端的 `/__goRPC__` 路径，建立双向通信通道。

**示例**：

go

```go
client, err := rpc.DialHTTP("tcp", "127.0.0.1:1234")
if err != nil {
    log.Fatal("dial http error:", err)
}
defer client.Close()
```

### （3）自定义连接（`NewClient`）

若需要自定义连接（如加密连接、自定义编解码器），可手动创建连接后调用 `NewClient`：

go



运行









```go
// 示例：基于 TLS 加密连接创建客户端
conn, err := tls.Dial("tcp", "127.0.0.1:1234", &tls.Config{InsecureSkipVerify: true})
if err != nil {
    log.Fatal(err)
}
client := rpc.NewClient(conn) // 用自定义连接创建 Client
defer client.Close()
```

## 3. 发起调用：同步（`Call`）与异步（`Go`）

### （1）同步调用：`Call(serviceMethod string, args any, reply any) error`

- 功能：阻塞等待调用完成，直接返回结果或错误。
- 参数：
  - `serviceMethod`：服务方法名（如 `Arith.Multiply`）。
  - `args`：请求参数（必须是导出类型，且与服务端方法的第一个参数类型一致）。
  - `reply`：响应结果指针（必须是导出类型指针，且与服务端方法的第二个参数类型一致）。

**示例**：

go



运行









```go
// 1. 构造请求参数
args := &Args{A: 7, B: 8}
// 2. 准备响应结果指针（必须是指针）
var reply int
// 3. 同步调用
err := client.Call("Arith.Multiply", args, &reply)
if err != nil {
    log.Fatal("call error:", err)
}
fmt.Printf("7 * 8 = %d\n", reply) // 输出：7 * 8 = 56
```

### （2）异步调用：`Go(serviceMethod string, args any, reply any, done chan *Call) *Call`

- 功能：不阻塞，立即返回 `*Call` 结构，通过 `done` 通道（或 `Call.Done` 通道）通知调用完成。
- 适用场景：需要并发发起多个 RPC 调用，提高效率。

**示例**：

go



运行









```go
// 1. 构造参数和响应指针
args := &Args{A: 10, B: 3}
quo := new(Quotient)
// 2. 异步调用（done 通道可选，若为 nil，默认用 Call.Done）
done := make(chan *Call, 1)
call := client.Go("Arith.Divide", args, quo, done)

// 3. 处理其他逻辑（不阻塞）
fmt.Println("等待除法调用完成...")

// 4. 等待调用完成（两种方式选一种）
// 方式1：通过 done 通道
<-done
// 方式2：通过 call.Done 通道
// <-call.Done

// 5. 检查错误和结果
if call.Error != nil {
    log.Fatal("async call error:", call.Error)
}
fmt.Printf("10 / 3 = %d, 余数 = %d\n", quo.Quo, quo.Rem) // 输出：10 / 3 = 3, 余数 = 1
```

### （3）`Call` 结构详解

`Call` 结构存储异步调用的状态和结果：

go



运行









```go
type Call struct {
    ServiceMethod string  // 服务方法名（如 "Arith.Divide"）
    Args          any     // 请求参数
    Reply         any     // 响应结果
    Error         error   // 调用错误（nil 表示成功）
    Done          chan *Call // 调用完成通知通道（缓冲大小 1）
}
```

- 调用完成后，`Done` 通道会发送 `*Call` 自身，可通过 `call.Error` 查看错误，`call.Reply` 查看结果。

## 4. 客户端超时控制（关键补充）

`net/rpc` 默认**没有超时控制**，若服务端无响应，客户端会一直阻塞。需手动实现超时，常见两种方式：

### （1）同步调用超时：用 `time.After` 结合 `select`

go



运行









```go
args := &Args{A: 7, B: 8}
var reply int

// 启动 goroutine 执行同步调用
ch := make(chan error, 1)
go func() {
    ch <- client.Call("Arith.Multiply", args, &reply)
}()

// 超时控制：3秒内未完成则返回超时错误
select {
case err := <-ch:
    if err != nil {
        log.Fatal("call error:", err)
    }
    fmt.Println("结果:", reply)
case <-time.After(3 * time.Second):
    log.Fatal("call timeout")
}
```

### （2）异步调用超时：同样用 `select` 监听 `Done` 和超时

go



运行









```go
args := &Args{A: 10, B: 3}
quo := new(Quotient)
call := client.Go("Arith.Divide", args, quo, nil)

select {
case <-call.Done:
    if call.Error != nil {
        log.Fatal("async call error:", call.Error)
    }
    fmt.Println("结果:", quo)
case <-time.After(3 * time.Second):
    log.Fatal("async call timeout")
}
```

# 五、编解码机制：默认 `gob` 与自定义

`net/rpc` 的编解码通过 `ServerCodec`（服务端）和 `ClientCodec`（客户端）接口实现，默认用 `encoding/gob`，也支持自定义。

## 1. 默认编解码：`gob`

- **优点**：Go 原生支持，无需额外依赖，支持复杂类型（如结构体、切片、映射），序列化效率高。

- **缺点**：仅支持 Go 语言，不兼容其他语言（如 Java、Python）。

- 注意事项

  ：

  1. 结构体字段必须导出（首字母大写），否则无法序列化。
  2. 若结构体有嵌套类型，嵌套类型也需导出。
  3. 可通过 `gob.Register` 注册自定义类型（如接口类型），避免序列化失败。

**示例：注册自定义类型**

go



运行









```go
// 自定义导出类型
type MyStruct struct {
    Name string
    Age  int
}

func main() {
    // 注册类型（服务端和客户端都需注册，否则序列化失败）
    gob.Register(MyStruct{})

    // 后续的 RPC 调用可使用 MyStruct 作为参数或响应类型
    // ...
}
```

## 2. 自定义编解码（以 JSON 为例）

若需要跨语言兼容（如与 Java 客户端通信），可自定义 JSON 编解码器。需实现 `ServerCodec` 和 `ClientCodec` 接口。

### （1）自定义 JSON 服务端编解码器（`jsonServerCodec`）

go



运行









```go
type jsonServerCodec struct {
    rwc    io.ReadWriteCloser
    dec    *json.Decoder
    enc    *json.Encoder
    encBuf *bufio.Writer
    closed bool
}

// 实现 ServerCodec 接口的 ReadRequestHeader 方法
func (c *jsonServerCodec) ReadRequestHeader(r *Request) error {
    return c.dec.Decode(r)
}

// 实现 ServerCodec 接口的 ReadRequestBody 方法
func (c *jsonServerCodec) ReadRequestBody(body any) error {
    return c.dec.Decode(body)
}

// 实现 ServerCodec 接口的 WriteResponse 方法
func (c *jsonServerCodec) WriteResponse(r *Response, body any) error {
    if err := c.enc.Encode(r); err != nil {
        return err
    }
    if err := c.enc.Encode(body); err != nil {
        return err
    }
    return c.encBuf.Flush()
}

// 实现 ServerCodec 接口的 Close 方法
func (c *jsonServerCodec) Close() error {
    if c.closed {
        return nil
    }
    c.closed = true
    return c.rwc.Close()
}

// 辅助函数：创建 JSON 服务端编解码器
func NewJSONServerCodec(conn io.ReadWriteCloser) ServerCodec {
    buf := bufio.NewWriter(conn)
    return &jsonServerCodec{
        rwc:    conn,
        dec:    json.NewDecoder(conn),
        enc:    json.NewEncoder(buf),
        encBuf: buf,
    }
}
```

### （2）服务端使用自定义编解码器

go



运行









```go
func main() {
    arith := new(Arith)
    rpc.Register(arith)

    lis, err := net.Listen("tcp", ":1234")
    if err != nil {
        log.Fatal(err)
    }

    for {
        conn, err := lis.Accept()
        if err != nil {
            log.Println(err)
            continue
        }
        // 使用 JSON 编解码器处理连接（替代默认的 gob）
        codec := NewJSONServerCodec(conn)
        go rpc.ServeCodec(codec)
    }
}
```

### （3）客户端自定义 JSON 编解码器（类似服务端）

需实现 `ClientCodec` 接口，流程与服务端类似，最终通过 `rpc.NewClientWithCodec` 创建客户端。

# 六、错误处理与调试

## 1. 常见错误类型及原因

| 错误信息                                      | 原因                                                         | 解决方案                                                     |
| --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `rpc: service/method request ill-formed: xxx` | 请求的服务方法名格式错误（如缺少 `.`，应为 `服务名.方法名`） | 检查 `serviceMethod` 参数，确保格式正确（如 `Arith.Multiply`） |
| `rpc: can't find service xxx`                 | 服务名不存在（服务未注册或服务名拼写错误）                   | 确认服务已注册，且服务名与客户端调用时一致                   |
| `rpc: can't find method xxx`                  | 方法名不存在（方法未导出或拼写错误）                         | 确认方法符合 “远程方法规则”，且方法名与客户端调用时一致      |
| `rpc: server cannot decode request: xxx`      | 编解码错误（参数类型不匹配、未注册自定义类型）               | 确认客户端和服务端的参数 / 响应类型一致，自定义类型已用 `gob.Register` 注册 |
| `Unauthorized`/`connection refused`           | 网络问题或服务端未启动                                       | 检查服务端是否正常运行，网络是否通畅（端口、防火墙）         |

## 2. 调试技巧

- **开启 debug 日志**：`net/rpc` 包有一个 `debugLog` 变量（默认 false），编译时可通过 `-tags debug` 开启，输出请求 / 响应的详细日志。
  编译命令：`go build -tags debug main.go`。
- **查看已注册的服务和方法**：服务端用 `HandleHTTP` 启动后，访问 `http://服务端IP:1234/debug/rpc`，可查看所有注册的服务和方法。
- **统计方法调用次数**：通过 `methodType.NumCalls()` 查看某个方法被调用的次数（需通过反射获取 `methodType` 对象）。

# 七、局限性与替代方案

## 1. `net/rpc` 的局限性

- **语言绑定**：默认仅支持 Go 语言（依赖 `gob`），跨语言场景需自定义编解码（如 JSON、Protobuf），成本高。
- **功能简单**：无负载均衡、服务发现、流量控制、熔断降级等微服务必需功能。
- **性能一般**：`gob` 序列化性能不如 Protobuf，且默认无连接池，高并发场景需手动优化。
- **无官方维护**：已处于 “功能冻结” 状态，不会添加新特性，仅修复严重 bug。

## 2. 替代方案

- **跨语言 / 微服务场景**：`gRPC`（基于 HTTP/2 和 Protobuf，支持多语言、流处理、负载均衡）。
- **Go 语言内部高性能场景**：`go-micro`（Go 微服务框架，封装了服务发现、配置中心等）、`rpcx`（高性能 Go RPC 框架，支持多种编解码和注册中心）。

# 总结

`net/rpc` 是 Go 标准库中轻量级的 RPC 实现，核心优势是 “简单易用、无需依赖第三方库”，适合 Go 语言内部的简单远程调用场景。掌握其 “远程方法规则”、“服务端 / 客户端启动流程” 和 “编解码机制” 是关键，同时需注意手动实现超时控制和错误处理。若场景复杂（如跨语言、微服务），建议选择 `gRPC` 等更现代的框架。







### server.go

```go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*
Package rpc provides access to the exported methods of an object across a
network or other I/O connection.  A server registers an object, making it visible
as a service with the name of the type of the object.  After registration, exported
methods of the object will be accessible remotely.  A server may register multiple
objects (services) of different types but it is an error to register multiple
objects of the same type.

Only methods that satisfy these criteria will be made available for remote access;
other methods will be ignored:

  - the method's type is exported.
  - the method is exported.
  - the method has two arguments, both exported (or builtin) types.
  - the method's second argument is a pointer.
  - the method has return type error.

In effect, the method must look schematically like

	func (t *T) MethodName(argType T1, replyType *T2) error

where T1 and T2 can be marshaled by encoding/gob.
These requirements apply even if a different codec is used.
(In the future, these requirements may soften for custom codecs.)

The method's first argument represents the arguments provided by the caller; the
second argument represents the result parameters to be returned to the caller.
The method's return value, if non-nil, is passed back as a string that the client
sees as if created by [errors.New].  If an error is returned, the reply parameter
will not be sent back to the client.

The server may handle requests on a single connection by calling [ServeConn].  More
typically it will create a network listener and call [Accept] or, for an HTTP
listener, [HandleHTTP] and [http.Serve].

A client wishing to use the service establishes a connection and then invokes
[NewClient] on the connection.  The convenience function [Dial] ([DialHTTP]) performs
both steps for a raw network connection (an HTTP connection).  The resulting
[Client] object has two methods, [Call] and Go, that specify the service and method to
call, a pointer containing the arguments, and a pointer to receive the result
parameters.

The Call method waits for the remote call to complete while the Go method
launches the call asynchronously and signals completion using the Call
structure's Done channel.

Unless an explicit codec is set up, package [encoding/gob] is used to
transport the data.

Here is a simple example.  A server wishes to export an object of type Arith:

	package server

	import "errors"

	type Args struct {
		A, B int
	}

	type Quotient struct {
		Quo, Rem int
	}

	type Arith int

	func (t *Arith) Multiply(args *Args, reply *int) error {
		*reply = args.A * args.B
		return nil
	}

	func (t *Arith) Divide(args *Args, quo *Quotient) error {
		if args.B == 0 {
			return errors.New("divide by zero")
		}
		quo.Quo = args.A / args.B
		quo.Rem = args.A % args.B
		return nil
	}

The server calls (for HTTP service):

	arith := new(Arith)
	rpc.Register(arith)
	rpc.HandleHTTP()
	l, err := net.Listen("tcp", ":1234")
	if err != nil {
		log.Fatal("listen error:", err)
	}
	go http.Serve(l, nil)

At this point, clients can see a service "Arith" with methods "Arith.Multiply" and
"Arith.Divide".  To invoke one, a client first dials the server:

	client, err := rpc.DialHTTP("tcp", serverAddress + ":1234")
	if err != nil {
		log.Fatal("dialing:", err)
	}

Then it can make a remote call:

	// Synchronous call
	args := &server.Args{7,8}
	var reply int
	err = client.Call("Arith.Multiply", args, &reply)
	if err != nil {
		log.Fatal("arith error:", err)
	}
	fmt.Printf("Arith: %d*%d=%d", args.A, args.B, reply)

or

	// Asynchronous call
	quotient := new(Quotient)
	divCall := client.Go("Arith.Divide", args, quotient, nil)
	replyCall := <-divCall.Done	// will be equal to divCall
	// check errors, print, etc.

A server implementation will often provide a simple, type-safe wrapper for the
client.

The net/rpc package is frozen and is not accepting new features.
*/
package rpc

import (
	"bufio"
	"encoding/gob"
	"errors"
	"go/token"
	"io"
	"log"
	"net"
	"net/http"
	"reflect"
	"strings"
	"sync"
)

const (
	// Defaults used by HandleHTTP
	DefaultRPCPath   = "/_goRPC_"
	DefaultDebugPath = "/debug/rpc"
)

// Precompute the reflect type for error.
var typeOfError = reflect.TypeFor[error]()

type methodType struct {
	sync.Mutex // protects counters
	method     reflect.Method
	ArgType    reflect.Type
	ReplyType  reflect.Type
	numCalls   uint
}

type service struct {
	name   string                 // name of service
	rcvr   reflect.Value          // receiver of methods for the service
	typ    reflect.Type           // type of the receiver
	method map[string]*methodType // registered methods
}

// Request is a header written before every RPC call. It is used internally
// but documented here as an aid to debugging, such as when analyzing
// network traffic.
type Request struct {
	ServiceMethod string   // format: "Service.Method"
	Seq           uint64   // sequence number chosen by client
	next          *Request // for free list in Server
}

// Response is a header written before every RPC return. It is used internally
// but documented here as an aid to debugging, such as when analyzing
// network traffic.
type Response struct {
	ServiceMethod string    // echoes that of the Request
	Seq           uint64    // echoes that of the request
	Error         string    // error, if any.
	next          *Response // for free list in Server
}

// Server represents an RPC Server.
type Server struct {
	serviceMap sync.Map   // map[string]*service
	reqLock    sync.Mutex // protects freeReq
	freeReq    *Request
	respLock   sync.Mutex // protects freeResp
	freeResp   *Response
}

// NewServer returns a new [Server].
func NewServer() *Server {
	return &Server{}
}

// DefaultServer is the default instance of [*Server].
var DefaultServer = NewServer()

// Is this type exported or a builtin?
func isExportedOrBuiltinType(t reflect.Type) bool {
	for t.Kind() == reflect.Pointer {
		t = t.Elem()
	}
	// PkgPath will be non-empty even for an exported type,
	// so we need to check the type name as well.
	return token.IsExported(t.Name()) || t.PkgPath() == ""
}

// Register publishes in the server the set of methods of the
// receiver value that satisfy the following conditions:
//   - exported method of exported type
//   - two arguments, both of exported type
//   - the second argument is a pointer
//   - one return value, of type error
//
// It returns an error if the receiver is not an exported type or has
// no suitable methods. It also logs the error using package log.
// The client accesses each method using a string of the form "Type.Method",
// where Type is the receiver's concrete type.
func (server *Server) Register(rcvr any) error {
	return server.register(rcvr, "", false)
}

// RegisterName is like [Register] but uses the provided name for the type
// instead of the receiver's concrete type.
func (server *Server) RegisterName(name string, rcvr any) error {
	return server.register(rcvr, name, true)
}

// logRegisterError specifies whether to log problems during method registration.
// To debug registration, recompile the package with this set to true.
const logRegisterError = false

func (server *Server) register(rcvr any, name string, useName bool) error {
	s := new(service)
	s.typ = reflect.TypeOf(rcvr)
	s.rcvr = reflect.ValueOf(rcvr)
	sname := name
	if !useName {
		sname = reflect.Indirect(s.rcvr).Type().Name()
	}
	if sname == "" {
		s := "rpc.Register: no service name for type " + s.typ.String()
		log.Print(s)
		return errors.New(s)
	}
	if !useName && !token.IsExported(sname) {
		s := "rpc.Register: type " + sname + " is not exported"
		log.Print(s)
		return errors.New(s)
	}
	s.name = sname

	// Install the methods
	s.method = suitableMethods(s.typ, logRegisterError)

	if len(s.method) == 0 {
		str := ""

		// To help the user, see if a pointer receiver would work.
		method := suitableMethods(reflect.PointerTo(s.typ), false)
		if len(method) != 0 {
			str = "rpc.Register: type " + sname + " has no exported methods of suitable type (hint: pass a pointer to value of that type)"
		} else {
			str = "rpc.Register: type " + sname + " has no exported methods of suitable type"
		}
		log.Print(str)
		return errors.New(str)
	}

	if _, dup := server.serviceMap.LoadOrStore(sname, s); dup {
		return errors.New("rpc: service already defined: " + sname)
	}
	return nil
}

// suitableMethods returns suitable Rpc methods of typ. It will log
// errors if logErr is true.
func suitableMethods(typ reflect.Type, logErr bool) map[string]*methodType {
	methods := make(map[string]*methodType)
	for m := 0; m < typ.NumMethod(); m++ {
		method := typ.Method(m)
		mtype := method.Type
		mname := method.Name
		// Method must be exported.
		if !method.IsExported() {
			continue
		}
		// Method needs three ins: receiver, *args, *reply.
		if mtype.NumIn() != 3 {
			if logErr {
				log.Printf("rpc.Register: method %q has %d input parameters; needs exactly three\n", mname, mtype.NumIn())
			}
			continue
		}
		// First arg need not be a pointer.
		argType := mtype.In(1)
		if !isExportedOrBuiltinType(argType) {
			if logErr {
				log.Printf("rpc.Register: argument type of method %q is not exported: %q\n", mname, argType)
			}
			continue
		}
		// Second arg must be a pointer.
		replyType := mtype.In(2)
		if replyType.Kind() != reflect.Pointer {
			if logErr {
				log.Printf("rpc.Register: reply type of method %q is not a pointer: %q\n", mname, replyType)
			}
			continue
		}
		// Reply type must be exported.
		if !isExportedOrBuiltinType(replyType) {
			if logErr {
				log.Printf("rpc.Register: reply type of method %q is not exported: %q\n", mname, replyType)
			}
			continue
		}
		// Method needs one out.
		if mtype.NumOut() != 1 {
			if logErr {
				log.Printf("rpc.Register: method %q has %d output parameters; needs exactly one\n", mname, mtype.NumOut())
			}
			continue
		}
		// The return type of the method must be error.
		if returnType := mtype.Out(0); returnType != typeOfError {
			if logErr {
				log.Printf("rpc.Register: return type of method %q is %q, must be error\n", mname, returnType)
			}
			continue
		}
		methods[mname] = &methodType{method: method, ArgType: argType, ReplyType: replyType}
	}
	return methods
}

// A value sent as a placeholder for the server's response value when the server
// receives an invalid request. It is never decoded by the client since the Response
// contains an error when it is used.
var invalidRequest = struct{}{}

func (server *Server) sendResponse(sending *sync.Mutex, req *Request, reply any, codec ServerCodec, errmsg string) {
	resp := server.getResponse()
	// Encode the response header
	resp.ServiceMethod = req.ServiceMethod
	if errmsg != "" {
		resp.Error = errmsg
		reply = invalidRequest
	}
	resp.Seq = req.Seq
	sending.Lock()
	err := codec.WriteResponse(resp, reply)
	if debugLog && err != nil {
		log.Println("rpc: writing response:", err)
	}
	sending.Unlock()
	server.freeResponse(resp)
}

func (m *methodType) NumCalls() (n uint) {
	m.Lock()
	n = m.numCalls
	m.Unlock()
	return n
}

func (s *service) call(server *Server, sending *sync.Mutex, wg *sync.WaitGroup, mtype *methodType, req *Request, argv, replyv reflect.Value, codec ServerCodec) {
	if wg != nil {
		defer wg.Done()
	}
	mtype.Lock()
	mtype.numCalls++
	mtype.Unlock()
	function := mtype.method.Func
	// Invoke the method, providing a new value for the reply.
	returnValues := function.Call([]reflect.Value{s.rcvr, argv, replyv})
	// The return value for the method is an error.
	errInter := returnValues[0].Interface()
	errmsg := ""
	if errInter != nil {
		errmsg = errInter.(error).Error()
	}
	server.sendResponse(sending, req, replyv.Interface(), codec, errmsg)
	server.freeRequest(req)
}

type gobServerCodec struct {
	rwc    io.ReadWriteCloser
	dec    *gob.Decoder
	enc    *gob.Encoder
	encBuf *bufio.Writer
	closed bool
}

func (c *gobServerCodec) ReadRequestHeader(r *Request) error {
	return c.dec.Decode(r)
}

func (c *gobServerCodec) ReadRequestBody(body any) error {
	return c.dec.Decode(body)
}

func (c *gobServerCodec) WriteResponse(r *Response, body any) (err error) {
	if err = c.enc.Encode(r); err != nil {
		if c.encBuf.Flush() == nil {
			// Gob couldn't encode the header. Should not happen, so if it does,
			// shut down the connection to signal that the connection is broken.
			log.Println("rpc: gob error encoding response:", err)
			c.Close()
		}
		return
	}
	if err = c.enc.Encode(body); err != nil {
		if c.encBuf.Flush() == nil {
			// Was a gob problem encoding the body but the header has been written.
			// Shut down the connection to signal that the connection is broken.
			log.Println("rpc: gob error encoding body:", err)
			c.Close()
		}
		return
	}
	return c.encBuf.Flush()
}

func (c *gobServerCodec) Close() error {
	if c.closed {
		// Only call c.rwc.Close once; otherwise the semantics are undefined.
		return nil
	}
	c.closed = true
	return c.rwc.Close()
}

// ServeConn runs the server on a single connection.
// ServeConn blocks, serving the connection until the client hangs up.
// The caller typically invokes ServeConn in a go statement.
// ServeConn uses the gob wire format (see package gob) on the
// connection. To use an alternate codec, use [ServeCodec].
// See [NewClient]'s comment for information about concurrent access.
func (server *Server) ServeConn(conn io.ReadWriteCloser) {
	buf := bufio.NewWriter(conn)
	srv := &gobServerCodec{
		rwc:    conn,
		dec:    gob.NewDecoder(conn),
		enc:    gob.NewEncoder(buf),
		encBuf: buf,
	}
	server.ServeCodec(srv)
}

// ServeCodec is like [ServeConn] but uses the specified codec to
// decode requests and encode responses.
func (server *Server) ServeCodec(codec ServerCodec) {
	sending := new(sync.Mutex)
	wg := new(sync.WaitGroup)
	for {
		service, mtype, req, argv, replyv, keepReading, err := server.readRequest(codec)
		if err != nil {
			if debugLog && err != io.EOF {
				log.Println("rpc:", err)
			}
			if !keepReading {
				break
			}
			// send a response if we actually managed to read a header.
			if req != nil {
				server.sendResponse(sending, req, invalidRequest, codec, err.Error())
				server.freeRequest(req)
			}
			continue
		}
		wg.Add(1)
		go service.call(server, sending, wg, mtype, req, argv, replyv, codec)
	}
	// We've seen that there are no more requests.
	// Wait for responses to be sent before closing codec.
	wg.Wait()
	codec.Close()
}

// ServeRequest is like [ServeCodec] but synchronously serves a single request.
// It does not close the codec upon completion.
func (server *Server) ServeRequest(codec ServerCodec) error {
	sending := new(sync.Mutex)
	service, mtype, req, argv, replyv, keepReading, err := server.readRequest(codec)
	if err != nil {
		if !keepReading {
			return err
		}
		// send a response if we actually managed to read a header.
		if req != nil {
			server.sendResponse(sending, req, invalidRequest, codec, err.Error())
			server.freeRequest(req)
		}
		return err
	}
	service.call(server, sending, nil, mtype, req, argv, replyv, codec)
	return nil
}

func (server *Server) getRequest() *Request {
	server.reqLock.Lock()
	req := server.freeReq
	if req == nil {
		req = new(Request)
	} else {
		server.freeReq = req.next
		*req = Request{}
	}
	server.reqLock.Unlock()
	return req
}

func (server *Server) freeRequest(req *Request) {
	server.reqLock.Lock()
	req.next = server.freeReq
	server.freeReq = req
	server.reqLock.Unlock()
}

func (server *Server) getResponse() *Response {
	server.respLock.Lock()
	resp := server.freeResp
	if resp == nil {
		resp = new(Response)
	} else {
		server.freeResp = resp.next
		*resp = Response{}
	}
	server.respLock.Unlock()
	return resp
}

func (server *Server) freeResponse(resp *Response) {
	server.respLock.Lock()
	resp.next = server.freeResp
	server.freeResp = resp
	server.respLock.Unlock()
}

func (server *Server) readRequest(codec ServerCodec) (service *service, mtype *methodType, req *Request, argv, replyv reflect.Value, keepReading bool, err error) {
	service, mtype, req, keepReading, err = server.readRequestHeader(codec)
	if err != nil {
		if !keepReading {
			return
		}
		// discard body
		codec.ReadRequestBody(nil)
		return
	}

	// Decode the argument value.
	argIsValue := false // if true, need to indirect before calling.
	if mtype.ArgType.Kind() == reflect.Pointer {
		argv = reflect.New(mtype.ArgType.Elem())
	} else {
		argv = reflect.New(mtype.ArgType)
		argIsValue = true
	}
	// argv guaranteed to be a pointer now.
	if err = codec.ReadRequestBody(argv.Interface()); err != nil {
		return
	}
	if argIsValue {
		argv = argv.Elem()
	}

	replyv = reflect.New(mtype.ReplyType.Elem())

	switch mtype.ReplyType.Elem().Kind() {
	case reflect.Map:
		replyv.Elem().Set(reflect.MakeMap(mtype.ReplyType.Elem()))
	case reflect.Slice:
		replyv.Elem().Set(reflect.MakeSlice(mtype.ReplyType.Elem(), 0, 0))
	}
	return
}

func (server *Server) readRequestHeader(codec ServerCodec) (svc *service, mtype *methodType, req *Request, keepReading bool, err error) {
	// Grab the request header.
	req = server.getRequest()
	err = codec.ReadRequestHeader(req)
	if err != nil {
		req = nil
		if err == io.EOF || err == io.ErrUnexpectedEOF {
			return
		}
		err = errors.New("rpc: server cannot decode request: " + err.Error())
		return
	}

	// We read the header successfully. If we see an error now,
	// we can still recover and move on to the next request.
	keepReading = true

	dot := strings.LastIndex(req.ServiceMethod, ".")
	if dot < 0 {
		err = errors.New("rpc: service/method request ill-formed: " + req.ServiceMethod)
		return
	}
	serviceName := req.ServiceMethod[:dot]
	methodName := req.ServiceMethod[dot+1:]

	// Look up the request.
	svci, ok := server.serviceMap.Load(serviceName)
	if !ok {
		err = errors.New("rpc: can't find service " + req.ServiceMethod)
		return
	}
	svc = svci.(*service)
	mtype = svc.method[methodName]
	if mtype == nil {
		err = errors.New("rpc: can't find method " + req.ServiceMethod)
	}
	return
}

// Accept accepts connections on the listener and serves requests
// for each incoming connection. Accept blocks until the listener
// returns a non-nil error. The caller typically invokes Accept in a
// go statement.
func (server *Server) Accept(lis net.Listener) {
	for {
		conn, err := lis.Accept()
		if err != nil {
			log.Print("rpc.Serve: accept:", err.Error())
			return
		}
		go server.ServeConn(conn)
	}
}

// Register publishes the receiver's methods in the [DefaultServer].
func Register(rcvr any) error { return DefaultServer.Register(rcvr) }

// RegisterName is like [Register] but uses the provided name for the type
// instead of the receiver's concrete type.
func RegisterName(name string, rcvr any) error {
	return DefaultServer.RegisterName(name, rcvr)
}

// A ServerCodec implements reading of RPC requests and writing of
// RPC responses for the server side of an RPC session.
// The server calls [ServerCodec.ReadRequestHeader] and [ServerCodec.ReadRequestBody] in pairs
// to read requests from the connection, and it calls [ServerCodec.WriteResponse] to
// write a response back. The server calls [ServerCodec.Close] when finished with the
// connection. ReadRequestBody may be called with a nil
// argument to force the body of the request to be read and discarded.
// See [NewClient]'s comment for information about concurrent access.
type ServerCodec interface {
	ReadRequestHeader(*Request) error
	ReadRequestBody(any) error
	WriteResponse(*Response, any) error

	// Close can be called multiple times and must be idempotent.
	Close() error
}

// ServeConn runs the [DefaultServer] on a single connection.
// ServeConn blocks, serving the connection until the client hangs up.
// The caller typically invokes ServeConn in a go statement.
// ServeConn uses the gob wire format (see package gob) on the
// connection. To use an alternate codec, use [ServeCodec].
// See [NewClient]'s comment for information about concurrent access.
func ServeConn(conn io.ReadWriteCloser) {
	DefaultServer.ServeConn(conn)
}

// ServeCodec is like [ServeConn] but uses the specified codec to
// decode requests and encode responses.
func ServeCodec(codec ServerCodec) {
	DefaultServer.ServeCodec(codec)
}

// ServeRequest is like [ServeCodec] but synchronously serves a single request.
// It does not close the codec upon completion.
func ServeRequest(codec ServerCodec) error {
	return DefaultServer.ServeRequest(codec)
}

// Accept accepts connections on the listener and serves requests
// to [DefaultServer] for each incoming connection.
// Accept blocks; the caller typically invokes it in a go statement.
func Accept(lis net.Listener) { DefaultServer.Accept(lis) }

// Can connect to RPC service using HTTP CONNECT to rpcPath.
var connected = "200 Connected to Go RPC"

// ServeHTTP implements an [http.Handler] that answers RPC requests.
func (server *Server) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	if req.Method != "CONNECT" {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusMethodNotAllowed)
		io.WriteString(w, "405 must CONNECT\n")
		return
	}
	conn, _, err := w.(http.Hijacker).Hijack()
	if err != nil {
		log.Print("rpc hijacking ", req.RemoteAddr, ": ", err.Error())
		return
	}
	io.WriteString(conn, "HTTP/1.0 "+connected+"\n\n")
	server.ServeConn(conn)
}

// HandleHTTP registers an HTTP handler for RPC messages on rpcPath,
// and a debugging handler on debugPath.
// It is still necessary to invoke [http.Serve](), typically in a go statement.
func (server *Server) HandleHTTP(rpcPath, debugPath string) {
	http.Handle(rpcPath, server)
	http.Handle(debugPath, debugHTTP{server})
}

// HandleHTTP registers an HTTP handler for RPC messages to [DefaultServer]
// on [DefaultRPCPath] and a debugging handler on [DefaultDebugPath].
// It is still necessary to invoke [http.Serve](), typically in a go statement.
func HandleHTTP() {
	DefaultServer.HandleHTTP(DefaultRPCPath, DefaultDebugPath)
}

```

### client.go

```go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package rpc

import (
	"bufio"
	"encoding/gob"
	"errors"
	"io"
	"log"
	"net"
	"net/http"
	"sync"
)

// ServerError represents an error that has been returned from
// the remote side of the RPC connection.
type ServerError string

func (e ServerError) Error() string {
	return string(e)
}

var ErrShutdown = errors.New("connection is shut down")

// Call represents an active RPC.
type Call struct {
	ServiceMethod string     // The name of the service and method to call.
	Args          any        // The argument to the function (*struct).
	Reply         any        // The reply from the function (*struct).
	Error         error      // After completion, the error status.
	Done          chan *Call // Receives *Call when Go is complete.
}

// Client represents an RPC Client.
// There may be multiple outstanding Calls associated
// with a single Client, and a Client may be used by
// multiple goroutines simultaneously.
type Client struct {
	codec ClientCodec

	reqMutex sync.Mutex // protects following
	request  Request

	mutex    sync.Mutex // protects following
	seq      uint64
	pending  map[uint64]*Call
	closing  bool // user has called Close
	shutdown bool // server has told us to stop
}

// A ClientCodec implements writing of RPC requests and
// reading of RPC responses for the client side of an RPC session.
// The client calls [ClientCodec.WriteRequest] to write a request to the connection
// and calls [ClientCodec.ReadResponseHeader] and [ClientCodec.ReadResponseBody] in pairs
// to read responses. The client calls [ClientCodec.Close] when finished with the
// connection. ReadResponseBody may be called with a nil
// argument to force the body of the response to be read and then
// discarded.
// See [NewClient]'s comment for information about concurrent access.
type ClientCodec interface {
	WriteRequest(*Request, any) error
	ReadResponseHeader(*Response) error
	ReadResponseBody(any) error

	Close() error
}

func (client *Client) send(call *Call) {
	client.reqMutex.Lock()
	defer client.reqMutex.Unlock()

	// Register this call.
	client.mutex.Lock()
	if client.shutdown || client.closing {
		client.mutex.Unlock()
		call.Error = ErrShutdown
		call.done()
		return
	}
	seq := client.seq
	client.seq++
	client.pending[seq] = call
	client.mutex.Unlock()

	// Encode and send the request.
	client.request.Seq = seq
	client.request.ServiceMethod = call.ServiceMethod
	err := client.codec.WriteRequest(&client.request, call.Args)
	if err != nil {
		client.mutex.Lock()
		call = client.pending[seq]
		delete(client.pending, seq)
		client.mutex.Unlock()
		if call != nil {
			call.Error = err
			call.done()
		}
	}
}

func (client *Client) input() {
	var err error
	var response Response
	for err == nil {
		response = Response{}
		err = client.codec.ReadResponseHeader(&response)
		if err != nil {
			break
		}
		seq := response.Seq
		client.mutex.Lock()
		call := client.pending[seq]
		delete(client.pending, seq)
		client.mutex.Unlock()

		switch {
		case call == nil:
			// We've got no pending call. That usually means that
			// WriteRequest partially failed, and call was already
			// removed; response is a server telling us about an
			// error reading request body. We should still attempt
			// to read error body, but there's no one to give it to.
			err = client.codec.ReadResponseBody(nil)
			if err != nil {
				err = errors.New("reading error body: " + err.Error())
			}
		case response.Error != "":
			// We've got an error response. Give this to the request;
			// any subsequent requests will get the ReadResponseBody
			// error if there is one.
			call.Error = ServerError(response.Error)
			err = client.codec.ReadResponseBody(nil)
			if err != nil {
				err = errors.New("reading error body: " + err.Error())
			}
			call.done()
		default:
			err = client.codec.ReadResponseBody(call.Reply)
			if err != nil {
				call.Error = errors.New("reading body " + err.Error())
			}
			call.done()
		}
	}
	// Terminate pending calls.
	client.reqMutex.Lock()
	client.mutex.Lock()
	client.shutdown = true
	closing := client.closing
	if err == io.EOF {
		if closing {
			err = ErrShutdown
		} else {
			err = io.ErrUnexpectedEOF
		}
	}
	for _, call := range client.pending {
		call.Error = err
		call.done()
	}
	client.mutex.Unlock()
	client.reqMutex.Unlock()
	if debugLog && err != io.EOF && !closing {
		log.Println("rpc: client protocol error:", err)
	}
}

func (call *Call) done() {
	select {
	case call.Done <- call:
		// ok
	default:
		// We don't want to block here. It is the caller's responsibility to make
		// sure the channel has enough buffer space. See comment in Go().
		if debugLog {
			log.Println("rpc: discarding Call reply due to insufficient Done chan capacity")
		}
	}
}

// NewClient returns a new [Client] to handle requests to the
// set of services at the other end of the connection.
// It adds a buffer to the write side of the connection so
// the header and payload are sent as a unit.
//
// The read and write halves of the connection are serialized independently,
// so no interlocking is required. However each half may be accessed
// concurrently so the implementation of conn should protect against
// concurrent reads or concurrent writes.
func NewClient(conn io.ReadWriteCloser) *Client {
	encBuf := bufio.NewWriter(conn)
	client := &gobClientCodec{conn, gob.NewDecoder(conn), gob.NewEncoder(encBuf), encBuf}
	return NewClientWithCodec(client)
}

// NewClientWithCodec is like [NewClient] but uses the specified
// codec to encode requests and decode responses.
func NewClientWithCodec(codec ClientCodec) *Client {
	client := &Client{
		codec:   codec,
		pending: make(map[uint64]*Call),
	}
	go client.input()
	return client
}

type gobClientCodec struct {
	rwc    io.ReadWriteCloser
	dec    *gob.Decoder
	enc    *gob.Encoder
	encBuf *bufio.Writer
}

func (c *gobClientCodec) WriteRequest(r *Request, body any) (err error) {
	if err = c.enc.Encode(r); err != nil {
		return
	}
	if err = c.enc.Encode(body); err != nil {
		return
	}
	return c.encBuf.Flush()
}

func (c *gobClientCodec) ReadResponseHeader(r *Response) error {
	return c.dec.Decode(r)
}

func (c *gobClientCodec) ReadResponseBody(body any) error {
	return c.dec.Decode(body)
}

func (c *gobClientCodec) Close() error {
	return c.rwc.Close()
}

// DialHTTP connects to an HTTP RPC server at the specified network address
// listening on the default HTTP RPC path.
func DialHTTP(network, address string) (*Client, error) {
	return DialHTTPPath(network, address, DefaultRPCPath)
}

// DialHTTPPath connects to an HTTP RPC server
// at the specified network address and path.
func DialHTTPPath(network, address, path string) (*Client, error) {
	conn, err := net.Dial(network, address)
	if err != nil {
		return nil, err
	}
	io.WriteString(conn, "CONNECT "+path+" HTTP/1.0\n\n")

	// Require successful HTTP response
	// before switching to RPC protocol.
	resp, err := http.ReadResponse(bufio.NewReader(conn), &http.Request{Method: "CONNECT"})
	if err == nil && resp.Status == connected {
		return NewClient(conn), nil
	}
	if err == nil {
		err = errors.New("unexpected HTTP response: " + resp.Status)
	}
	conn.Close()
	return nil, &net.OpError{
		Op:   "dial-http",
		Net:  network + " " + address,
		Addr: nil,
		Err:  err,
	}
}

// Dial connects to an RPC server at the specified network address.
func Dial(network, address string) (*Client, error) {
	conn, err := net.Dial(network, address)
	if err != nil {
		return nil, err
	}
	return NewClient(conn), nil
}

// Close calls the underlying codec's Close method. If the connection is already
// shutting down, [ErrShutdown] is returned.
func (client *Client) Close() error {
	client.mutex.Lock()
	if client.closing {
		client.mutex.Unlock()
		return ErrShutdown
	}
	client.closing = true
	client.mutex.Unlock()
	return client.codec.Close()
}

// Go invokes the function asynchronously. It returns the [Call] structure representing
// the invocation. The done channel will signal when the call is complete by returning
// the same Call object. If done is nil, Go will allocate a new channel.
// If non-nil, done must be buffered or Go will deliberately crash.
func (client *Client) Go(serviceMethod string, args any, reply any, done chan *Call) *Call {
	call := new(Call)
	call.ServiceMethod = serviceMethod
	call.Args = args
	call.Reply = reply
	if done == nil {
		done = make(chan *Call, 10) // buffered.
	} else {
		// If caller passes done != nil, it must arrange that
		// done has enough buffer for the number of simultaneous
		// RPCs that will be using that channel. If the channel
		// is totally unbuffered, it's best not to run at all.
		if cap(done) == 0 {
			log.Panic("rpc: done channel is unbuffered")
		}
	}
	call.Done = done
	client.send(call)
	return call
}

// Call invokes the named function, waits for it to complete, and returns its error status.
func (client *Client) Call(serviceMethod string, args any, reply any) error {
	call := <-client.Go(serviceMethod, args, reply, make(chan *Call, 1)).Done
	return call.Error
}

```





# 问答

# 一、八股文题目（10 道，难度递增）

## 1. 基础题：Go 标准库 `net/rpc` 中，远程方法必须满足哪些核心规则才能被导出调用？（至少答出 4 条）

### 答案：

远程方法需满足以下 6 条严格规则，否则会被服务端过滤：

1. 方法接收者类型必须导出（首字母大写，如 `type Arith int` 合法，`type arith int` 不合法）；
2. 方法本身必须导出（方法名首字母大写，如 `Multiply` 合法，`multiply` 不合法）；
3. 方法必须有且仅有 2 个参数（第一个为客户端请求参数，第二个为服务端响应结果，且必须是指针）；
4. 两个参数类型必须可序列化（导出类型或内置类型，支持 `encoding/gob` 序列化）；
5. 第二个参数（响应）必须是指针（服务端需通过指针修改值回传）；
6. 方法返回值必须是 `error` 类型（用于传递调用错误，无错误返回 `nil`）。

## 2. 基础进阶题：`net/rpc` 服务端的 `Register` 和 `RegisterName` 函数有什么核心区别？使用场景分别是什么？

### 答案：

#### 核心区别：服务名的来源不同

- `Register(rcvr any) error`：服务名默认是**接收者（rcvr）的具体类型名**（如 `rcvr` 是 `*Arith` 类型，服务名自动设为 `Arith`）；
- `RegisterName(name string, rcvr any) error`：允许**手动指定服务名**（不受接收者类型名限制）。

#### 使用场景：

- `Register`：简单场景，服务名与接收者类型名一致即可（如单服务、无命名冲突）；
- `RegisterName`：需解决服务名冲突（如同一类型的不同实例需注册为不同服务）、自定义语义化服务名（如将 `Arith` 注册为 `MathService`）。

## 3. 流程题：`net/rpc` 服务端通过 `ServeConn` 处理一个客户端请求的完整核心流程是什么？（从连接建立到方法调用返回）

### 答案：

1. **编解码初始化**：`ServeConn` 会创建 `gobServerCodec`（默认），封装 `conn` 为 `dec`（解码器）、`enc`（编码器）和 `encBuf`（缓冲）；
2. **循环接收请求**：调用 `ServeCodec` 进入循环，每次循环通过 `readRequestHeader` 解码请求头（`Request`，含 `ServiceMethod` 和 `Seq`）；
3. **解析服务与方法**：从 `ServiceMethod`（如 `Arith.Multiply`）拆分服务名和方法名，通过 `server.serviceMap` 查找注册的 `service`，再从 `service.method` 查找 `methodType`；
4. **反射准备参数**：通过 `reflect` 创建请求参数对象（`argv`）和响应对象（`replyv`），调用 `ReadRequestBody` 解码请求体到 `argv`；
5. **并发调用方法**：启动 goroutine 执行 `service.call`，通过 `method.Func.Call` 反射调用远程方法，传入接收者、`argv` 和 `replyv`；
6. **返回响应结果**：方法调用完成后，`sendResponse` 编码响应头（`Response`，含 `Seq` 和错误信息）和响应体（`replyv`），回传客户端；
7. **资源复用**：将 `Request` 和 `Response` 对象放回 `freeReq`/`freeResp` 链表，减少内存分配。

## 4. 扩展题：`net/rpc` 默认使用 `gob` 编解码，其特点是什么？若需支持跨语言调用，如何自定义编解码？

### 答案：

#### 一、`gob` 编解码的特点

1. **优点**：Go 原生支持，无需依赖；支持复杂类型（结构体、切片、映射）；序列化效率高；支持类型注册（`gob.Register`）；
2. **缺点**：仅支持 Go 语言（二进制格式不兼容其他语言）；结构体字段必须导出（首字母大写）。

#### 二、自定义编解码实现跨语言（以 JSON 为例）

需实现 `ServerCodec`（服务端）和 `ClientCodec`（客户端）接口，核心步骤：

1. **定义编解码结构体**：封装 `conn`、`json.Decoder`、`json.Encoder` 和缓冲（如 `jsonServerCodec`）；

2. 实现 ServerCodec 接口

   ：

   - `ReadRequestHeader`：用 `json.Decoder` 解码 `Request`；
   - `ReadRequestBody`：解码请求体到参数对象；
   - `WriteResponse`：用 `json.Encoder` 编码 `Response` 和响应体，刷新缓冲；
   - `Close`：关闭连接；

3. **服务端使用**：通过 `rpc.ServeCodec(codec)` 替代默认 `ServeConn`，传入自定义 codec；

4. **客户端使用**：实现 `ClientCodec` 后，通过 `rpc.NewClientWithCodec(codec)` 创建客户端。

## 5. 客户端题：`net/rpc` 客户端的 `Call` 和 `Go` 方法有什么区别？分别适用于什么场景？

### 答案：

#### 核心区别（表格对比）

| 维度     | `Call` 方法                         | `Go` 方法                                       |
| -------- | ----------------------------------- | ----------------------------------------------- |
| 调用方式 | 同步                                | 异步                                            |
| 返回值   | 仅返回 `error`（调用完成后返回）    | 返回 `*Call` 结构体（立即返回）                 |
| 阻塞行为 | 阻塞当前 goroutine 直到调用完成     | 不阻塞，通过 `Call.Done` 通道通知完成           |
| 结果获取 | 直接通过传入的 `reply` 指针获取结果 | 从 `Call.Reply` 获取结果，`Call.Error` 获取错误 |

#### 适用场景

- `Call`：简单同步场景，需等待结果后再执行后续逻辑（如单步远程调用、依赖返回结果的流程）；
- `Go`：高并发场景，需同时发起多个远程调用（如批量查询数据），通过 `select` 监听多个 `Call.Done` 通道，提高效率。

## 6. 源码细节题：`net/rpc` 源码中，`Server` 结构体的 `freeReq` 和 `freeResp` 字段是什么？为什么要设计这两个字段？

### 答案：

#### 一、字段定义

- `freeReq *Request`：空闲的 `Request` 对象链表（通过 `next` 字段串联）；
- `freeResp *Response`：空闲的 `Response` 对象链表；
- 配套 `reqLock` 和 `respLock` 两个 `sync.Mutex`，保护链表的并发访问。

#### 二、设计目的：对象复用，减少内存分配与 GC 压力

1. **问题背景**：服务端每处理一个请求，都需要创建 `Request` 和 `Response` 对象，高并发下频繁创建 / 销毁会导致大量内存分配，触发 GC，影响性能；

2. 解决逻辑

   ：

   - 当需要新对象时，先从 `freeReq`/`freeResp` 链表取空闲对象（通过 `getRequest`/`getResponse`），若链表为空再新建；
   - 当对象使用完成后，重置对象字段，放回链表（通过 `freeRequest`/`freeResponse`），供后续请求复用；

3. **效果**：减少对象创建次数，降低 GC 频率，提升高并发场景下的服务端性能。

## 7. 并发题：`net/rpc` 服务端如何保证多客户端并发请求的安全性？请结合源码中的同步机制说明。

### 答案：

服务端通过 **锁、goroutine 隔离、等待组** 三重机制保证并发安全，核心源码细节如下：

1. **服务注册与查找的安全**：`Server.serviceMap` 使用 `sync.Map`，支持并发的键值对存储（注册 `LoadOrStore`、查找 `Load`），无需额外加锁；
2. **请求对象复用的安全**：`freeReq` 和 `freeResp` 链表分别用 `reqLock` 和 `respLock` 保护，避免并发读写冲突（如 `getRequest` 取对象时加锁，`freeRequest` 放对象时加锁）；
3. **方法调用计数的安全**：`methodType` 结构体嵌入 `sync.Mutex`，统计调用次数（`numCalls`）时加锁（`mtype.Lock()`/`mtype.Unlock()`），避免并发计数错误；
4. **响应发送的安全**：`ServeCodec` 中创建 `sending` 锁（`sync.Mutex`），调用 `WriteResponse` 发送响应时加锁，确保同一连接的响应不会并发写入，避免数据错乱；
5. **并发请求隔离**：每接收一个客户端连接（`lis.Accept()`），启动一个 goroutine 执行 `ServeConn`；每个请求解析完成后，再启动一个 goroutine 执行 `service.call`，实现请求级别的隔离；
6. **资源释放的安全**：`ServeCodec` 中创建 `wg`（`sync.WaitGroup`），每个请求的 `call` 函数执行前 `wg.Add(1)`，完成后 `wg.Done()`，确保所有请求处理完成后再关闭 codec（`wg.Wait()` 后调用 `codec.Close()`）。

## 8. 客户端源码题：`Client` 结构体中的 `pending` map 和 `seq` 字段的作用是什么？`input` goroutine 如何配合它们处理响应？

### 答案：

#### 一、字段作用

1. `seq uint64`：请求序列号，自增生成，确保每个客户端请求的 `Seq` 唯一，用于匹配请求与响应；
2. `pending map[uint64]*Call`：未完成的异步调用映射，`key` 为 `seq`，`value` 为对应的 `*Call` 结构体，用于追踪每个请求的状态。

#### 二、`input` goroutine 的配合逻辑

`input` 是客户端启动时创建的专属 goroutine（`NewClient` 中 `go client.input()`），负责读取服务端响应并匹配请求，流程如下：

1. **循环读取响应**：通过 `codec.ReadResponseHeader` 持续读取服务端的 `Response`（含 `Seq` 和 `Error`）；

2. **匹配请求**：根据 `Response.Seq` 从 `pending` map 中查找对应的 `*Call`（加锁保护 `pending`，避免并发修改），找到后从 map 中删除；

3. 处理响应结果

   ：

   - 若 `Response.Error` 非空：设置 `call.Error = ServerError(response.Error)`，读取响应体并丢弃；
   - 若 `Response.Error` 为空：通过 `codec.ReadResponseBody(call.Reply)` 解码响应体到 `call.Reply`；

4. **通知完成**：调用 `call.done()`，向 `call.Done` 通道发送 `*Call`，通知客户端调用完成；

5. **异常处理**：若读取响应出错（如连接断开），遍历 `pending` map 中所有未完成的 `Call`，设置 `call.Error` 为错误信息，调用 `call.done()`，确保所有请求都能收到结果。

## 9. 综合题：`net/rpc` 有哪些局限性？为什么在微服务场景下通常不推荐使用？

### 答案：

#### 一、核心局限性

1. **语言绑定严重**：默认依赖 `gob` 编解码，仅支持 Go 语言；虽可自定义编解码（如 JSON），但需手动实现接口，跨语言成本高；

2. **功能冻结**：官方文档明确 “不再接受新特性”，仅修复严重 bug，无迭代升级（如无官方超时、负载均衡支持）；

3. **缺少微服务核心能力**：无服务发现、流量控制、熔断降级、监控告警等微服务必需功能，需手动实现，开发成本高；

4. 性能一般

   ：

   - 无连接池，客户端频繁 `Dial` 会创建大量连接，高并发下性能下降；
   - `gob` 序列化虽高效，但相比 Protobuf 等二进制协议，在跨语言场景下性能无优势；

5. **调试与可观测性弱**：仅支持 `/debug/rpc` 查看服务列表，无详细的请求日志、调用链追踪等能力，问题排查困难。

#### 二、微服务场景不推荐的原因

微服务需满足 **跨语言、高可用、可观测、易扩展** 等需求，而 `net/rpc` 的局限性恰好命中这些痛点：

- 跨语言：无法满足微服务中多语言服务间的调用（如 Go 服务调用 Java 服务）；
- 高可用：无熔断降级，单个服务故障可能导致调用端雪崩；
- 可扩展：无服务发现和负载均衡，无法动态扩容缩容；
- 维护成本：需手动实现超时、连接池、监控等功能，开发和维护效率低。

## 10. 源码深度题：`net/rpc` 服务端通过反射调用远程方法时，如何处理请求参数（`argv`）和响应参数（`replyv`）的类型匹配？请结合 `readRequest` 函数的源码逻辑说明。

### 答案：

服务端在 `readRequest` 函数中，通过 `reflect` 包严格匹配参数类型，确保与远程方法的参数类型一致，核心逻辑如下：

1. **获取方法参数类型**：从 `methodType` 结构体中获取预存的 `ArgType`（请求参数类型）和 `ReplyType`（响应参数类型）（这两个字段在服务注册时通过 `suitableMethods` 函数解析 `reflect.Method` 生成）；

2. 创建请求参数对象（`argv`）

   ：

   - 若 `ArgType` 是指针类型（如 `*Args`）：调用 `reflect.New(mtype.ArgType.Elem())` 创建指针指向的元素类型的实例（如 `Args{}`），此时 `argv` 是指针类型，与方法参数类型匹配；
   - 若 `ArgType` 是非指针类型（如 `Args`）：先调用 `reflect.New(mtype.ArgType)` 创建指针（如 `*Args`），再通过 `argIsValue = true` 标记，后续解码完成后调用 `argv = argv.Elem()` 转为非指针类型，确保与方法参数类型一致；
   - 最终 `argv` 的类型必须与远程方法的第一个参数类型完全匹配（否则解码失败）；

3. **解码请求体到 `argv`**：调用 `codec.ReadRequestBody(argv.Interface())`，将客户端发送的请求体解码到 `argv` 指向的对象（依赖编解码器的类型匹配能力，如 `gob` 会校验类型）；

4. 创建响应参数对象（`replyv`）

   ：

   - 因 `ReplyType` 必然是指针类型（服务注册时 `suitableMethods` 已校验 “第二个参数必须是指针”），直接调用 `reflect.New(mtype.ReplyType.Elem())` 创建指针类型的实例（如 `*Quotient`）；
   - 若响应类型是映射（`map`）或切片（`slice`）：额外通过 `reflect.MakeMap` 或 `reflect.MakeSlice` 初始化空实例，避免解码时因 nil 指针导致 panic；

5. **反射调用方法**：在 `service.call` 函数中，调用 `function.Call([]reflect.Value{s.rcvr, argv, replyv})`，将接收者、`argv`、`replyv` 转为 `reflect.Value` 切片传入，完成方法调用；

6. **类型不匹配的处理**：若解码时类型不匹配（如客户端传 `int` 而服务端期望 `string`），`ReadRequestBody` 会返回错误，服务端会向客户端发送 “解码错误” 的响应，不执行方法调用。

   

# 二、场景题（5 道，贴合实际开发）

## 1. 场景题：在使用 `net/rpc` 客户端调用远程方法时，若服务端因网络延迟或业务阻塞未及时响应，会导致客户端永久阻塞。如何手动实现客户端调用的超时控制？请写出核心代码。

### 答案：

核心思路：通过 `time.After` 生成超时信号，结合 `select` 监听 “调用完成” 和 “超时” 两个事件，实现超时控制。分两种调用方式实现：

#### 一、同步调用（`Call` 方法）超时控制

go



运行

```go
import (
    "log"
    "net/rpc"
    "time"
)

// 假设远程服务的请求/响应类型
type Args struct {
    A, B int
}
type Reply int

func syncCallWithTimeout(client *rpc.Client, serviceMethod string, args *Args, reply *Reply, timeout time.Duration) error {
    // 启动 goroutine 执行同步调用，将结果通过通道返回
    errChan := make(chan error, 1)
    go func() {
        // 同步调用，阻塞直到完成
        errChan <- client.Call(serviceMethod, args, reply)
    }()

    // 监听超时和调用完成
    select {
    case err := <-errChan:
        // 调用完成，返回结果
        return err
    case <-time.After(timeout):
        // 超时，返回自定义超时错误
        return errors.New("rpc call timeout: " + timeout.String())
    }
}

// 使用示例
func main() {
    client, err := rpc.Dial("tcp", "127.0.0.1:1234")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    args := &Args{A: 10, B: 5}
    var reply Reply
    // 3秒超时
    if err := syncCallWithTimeout(client, "Arith.Multiply", args, &reply, 3*time.Second); err != nil {
        log.Fatal(err)
    }
    log.Println("结果:", reply)
}
```

#### 二、异步调用（`Go` 方法）超时控制

go



运行

```go
func asyncCallWithTimeout(client *rpc.Client, serviceMethod string, args *Args, reply *Reply, timeout time.Duration) error {
    // 异步调用，立即返回 *Call
    call := client.Go(serviceMethod, args, reply, nil)

    // 监听超时和调用完成（通过 call.Done 通道）
    select {
    case <-call.Done:
        // 调用完成，返回错误（可能为 nil）
        return call.Error
    case <-time.After(timeout):
        return errors.New("rpc async call timeout: " + timeout.String())
    }
}
```

## 2. 场景题：某团队使用 `net/rpc` 开发 Go 服务，但因业务扩展，需要让 Python 服务调用该 Go 服务的远程方法。请设计解决方案，确保跨语言调用正常，并写出核心代码（Go 服务端 + Python 客户端）。

### 答案：

核心方案：自定义 JSON 编解码（`net/rpc` 默认 `gob` 不支持 Python），服务端实现 `ServerCodec`，Python 客户端通过 HTTP 发送 JSON 格式的 RPC 请求（模拟 `net/rpc` 的请求响应格式）。

#### 一、Go 服务端（自定义 JSON 编解码）

1. **实现 JSON ServerCodec**

go

```go
package main

import (
    "encoding/json"
    "io"
    "log"
    "net"
    "net/rpc"
    "bufio"
)

// 1. 自定义 JSON 服务端编解码器
type JSONServerCodec struct {
    rwc    io.ReadWriteCloser
    dec    *json.Decoder
    enc    *json.Encoder
    encBuf *bufio.Writer
    closed bool
}

func (c *JSONServerCodec) ReadRequestHeader(r *rpc.Request) error {
    return c.dec.Decode(r)
}

func (c *JSONServerCodec) ReadRequestBody(body any) error {
    return c.dec.Decode(body)
}

func (c *JSONServerCodec) WriteResponse(r *rpc.Response, body any) error {
    if err := c.enc.Encode(r); err != nil {
        return err
    }
    if err := c.enc.Encode(body); err != nil {
        return err
    }
    return c.encBuf.Flush()
}

func (c *JSONServerCodec) Close() error {
    if c.closed {
        return nil
    }
    c.closed = true
    return c.rwc.Close()
}

func NewJSONServerCodec(conn io.ReadWriteCloser) rpc.ServerCodec {
    buf := bufio.NewWriter(conn)
    return &JSONServerCodec{
        rwc:    conn,
        dec:    json.NewDecoder(conn),
        enc:    json.NewEncoder(buf),
        encBuf: buf,
    }
}

// 2. 定义远程服务
type Arith int
type Args struct {
    A, B int `json:"a"`
}
type Quotient struct {
    Quo, Rem int `json:"quo",json:"rem"`
}

func (a *Arith) Divide(args *Args, quo *Quotient) error {
    if args.B == 0 {
        return errors.New("divide by zero")
    }
    quo.Quo = args.A / args.B
    quo.Rem = args.A % args.B
    return nil
}

// 3. 启动服务端（使用 JSON 编解码）
func main() {
    arith := new(Arith)
    if err := rpc.Register(arith); err != nil {
        log.Fatal(err)
    }

    lis, err := net.Listen("tcp", ":1234")
    if err != nil {
        log.Fatal(err)
    }
    log.Println("服务端启动：127.0.0.1:1234")

    for {
        conn, err := lis.Accept()
        if err != nil {
            log.Println(err)
            continue
        }
        // 使用自定义 JSON 编解码
        codec := NewJSONServerCodec(conn)
        go rpc.ServeCodec(codec)
    }
}
```

#### 二、Python 客户端（发送 JSON 请求）

python

```python
import json
import socket

class RPClient:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect((host, port))
        self.decoder = json.JSONDecoder()
        self.encoder = json.JSONEncoder()

    def call(self, service_method, args, reply_type):
        # 1. 构造 RPC 请求（符合 net/rpc 的 Request 格式）
        request = {
            "ServiceMethod": service_method,
            "Seq": 1  # 客户端序列号，简单设为1（单请求场景）
        }
        # 2. 发送请求头和请求体（JSON 格式，分两次编码）
        self.socket.sendall(self.encoder.encode(request).encode("utf-8") + b"\n")
        self.socket.sendall(self.encoder.encode(args).encode("utf-8") + b"\n")
        
        # 3. 读取响应头和响应体
        response_header = self.decoder.decode(self.socket.recv(1024).decode("utf-8"))
        if response_header.get("Error"):
            raise Exception(f"RPC Error: {response_header['Error']}")
        
        response_body = self.decoder.decode(self.socket.recv(1024).decode("utf-8"))
        return response_body

    def close(self):
        self.socket.close()

# 使用示例
if __name__ == "__main__":
    client = RPClient("127.0.0.1", 1234)
    try:
        # 调用 Go 服务的 Arith.Divide 方法
        args = {"a": 10, "b": 3}
        result = client.call("Arith.Divide", args, dict)
        print(f"10 / 3 = {result['quo']}, 余数 = {result['rem']}")  # 输出：10 / 3 = 3, 余数 = 1
    except Exception as e:
        print(e)
    finally:
        client.close()
```

## 3. 场景题：某 `net/rpc` 服务端启动时，调用 `rpc.Register(arith)` 报错 “rpc: service already defined: Arith”。请分析可能的原因，并给出排查和解决步骤。

### 答案：

#### 一、可能的原因

1. **重复注册同一服务**：同一进程中多次调用 `rpc.Register(arith)`（或 `RegisterName("Arith", arith)`），注册相同服务名（`Arith`）的服务；
2. **服务名冲突**：通过 `RegisterName` 手动注册了其他接收者，但指定服务名为 `Arith`（与默认注册的 `Arith` 冲突）；
3. **代码热重载 / 重复初始化**：框架或自定义逻辑导致服务注册逻辑被重复执行（如 Gin 等框架的路由初始化被多次调用）；
4. **接收者类型重复**：不同接收者实例但类型相同（如 `arith1 := new(Arith)` 和 `arith2 := new(Arith)`），调用 `Register(arith1)` 后再调用 `Register(arith2)`，默认服务名均为 `Arith`，导致冲突。

#### 二、排查步骤

1. **定位注册代码**：搜索项目中所有 `rpc.Register` 和 `rpc.RegisterName` 调用，查看是否有注册 `Arith` 服务名的代码；
2. **检查服务名**：确认所有注册调用的服务名（默认是接收者类型名，手动注册是指定的 `name`），是否存在重复的 `Arith`；
3. **查看调用时机**：通过日志或调试，确认注册代码是否被多次执行（如在循环、热重载钩子中）；
4. **验证接收者类型**：若注册不同实例，检查实例的类型是否相同（如 `reflect.TypeOf(arith1)` 和 `reflect.TypeOf(arith2)` 是否均为 `*Arith`）。

#### 三、解决步骤

1. **避免重复注册**：将服务注册逻辑放在进程启动时的初始化函数中（如 `main` 函数），确保只执行一次；
2. **自定义服务名**：若需注册同一类型的多个实例，使用 `RegisterName` 手动指定不同服务名（如 `RegisterName("Arith1", arith1)` 和 `RegisterName("Arith2", arith2)`）；
3. **单例模式**：确保接收者实例是单例（如通过 `sync.Once` 初始化），避免创建多个相同类型的实例导致重复注册；
4. **注册前检查**：通过 `Server.serviceMap` 手动检查服务是否已注册（需反射或修改源码，不推荐），或捕获注册错误并忽略（仅在确认重复注册无害时）：

go

```go
arith := new(Arith)
if err := rpc.Register(arith); err != nil {
    if !strings.Contains(err.Error(), "service already defined") {
        // 仅处理非重复注册的错误
        log.Fatal(err)
    }
    log.Println("服务已注册，忽略重复注册")
}
```

## 4. 场景题：某高并发场景下，`net/rpc` 客户端频繁发起远程调用（每秒数千次），出现 “too many open files” 错误。请分析原因，并设计解决方案。

### 答案：

#### 一、错误原因

“too many open files” 是 Linux 系统的文件句柄数限制错误，根源是 `net/rpc` 客户端默认无连接池，每次调用 `Dial` 会创建一个新的 TCP 连接（对应一个文件句柄），高并发下连接未及时关闭，导致文件句柄耗尽。

具体逻辑：

- 客户端每次 `Dial("tcp", addr)` 会新建一个 TCP 连接，创建 `Client` 对象；
- 调用完成后若未调用 `client.Close()`，连接会保持打开状态；
- 系统默认的进程最大文件句柄数（`ulimit -n`）通常为 1024 或 65535，高并发下很快耗尽。

#### 二、解决方案：实现 `net/rpc` 客户端连接池

核心思路：预先创建一批 `Client` 对象（对应 TCP 连接），客户端调用时从池中获取 `Client`，调用完成后归还，避免频繁创建 / 关闭连接。

#### 三、核心代码（连接池实现）

go

```go
package main

import (
    "errors"
    "log"
    "net/rpc"
    "sync"
    "sync/atomic"
)

// 1. 定义连接池结构体
type RPCConnPool struct {
    addr     string          // 服务端地址
    size     int             // 池大小
    freeConn chan *rpc.Client // 空闲连接通道
    closed   atomic.Bool     // 池是否关闭（原子操作）
    mu       sync.Mutex      // 保护连接创建
}

// 2. 创建连接池
func NewRPCConnPool(addr string, size int) (*RPCConnPool, error) {
    if size <= 0 {
        return nil, errors.New("pool size must be positive")
    }
    pool := &RPCConnPool{
        addr:     addr,
        size:     size,
        freeConn: make(chan *rpc.Client, size),
    }
    // 预先创建初始连接
    for i := 0; i < size; i++ {
        client, err := rpc.Dial("tcp", addr)
        if err != nil {
            // 关闭已创建的连接，避免泄漏
            pool.Close()
            return nil, err
        }
        pool.freeConn <- client
    }
    return pool, nil
}

// 3. 从池中获取连接
func (p *RPCConnPool) Get() (*rpc.Client, error) {
    if p.closed.Load() {
        return nil, errors.New("pool is closed")
    }
    // 从空闲通道获取连接（阻塞直到有空闲连接）
    client := <-p.freeConn
    // 检查连接是否有效（发送一个空请求或 ping 方法）
    if err := p.checkConn(client); err != nil {
        // 连接无效，创建新连接替换
        newClient, err := rpc.Dial("tcp", p.addr)
        if err != nil {
            return nil, err
        }
        client = newClient
    }
    return client, nil
}

// 4. 检查连接有效性（需服务端提供 ping 方法，或用反射调用空方法）
func (p *RPCConnPool) checkConn(client *rpc.Client) error {
    // 假设服务端有 Arith.Ping 方法（无参数无返回值，仅用于检测连接）
    type PingReq struct{}
    type PingResp struct{}
    req := &PingReq{}
    resp := &PingResp{}
    return client.Call("Arith.Ping", req, resp)
}

// 5. 归还连接到池
func (p *RPCConnPool) Put(client *rpc.Client) {
    if p.closed.Load() || client == nil {
        client.Close()
        return
    }
    // 检查连接是否有效，无效则关闭不归还
    if err := p.checkConn(client); err != nil {
        client.Close()
        return
    }
    select {
    case p.freeConn <- client:
        // 归还成功
    default:
        // 池已满，关闭多余连接
        client.Close()
    }
}

// 6. 关闭连接池
func (p *RPCConnPool) Close() {
    if p.closed.CompareAndSwap(false, true) {
        close(p.freeConn)
        // 关闭所有空闲连接
        for client := range p.freeConn {
            client.Close()
        }
    }
}

// 7. 使用示例（高并发调用）
func main() {
    pool, err := NewRPCConnPool("127.0.0.1:1234", 100) // 池大小100
    if err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    // 模拟高并发调用（1000个goroutine）
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func(idx int) {
            defer wg.Done()
            // 从池获取连接
            client, err := pool.Get()
            if err != nil {
                log.Println("获取连接失败:", err)
                return
            }
            defer pool.Put(client) // 归还连接

            // 执行远程调用
            args := &Args{A: idx, B: 2}
            var reply Reply
            if err := client.Call("Arith.Multiply", args, &reply); err != nil {
                log.Println("调用失败:", err)
                return
            }
            log.Printf("第%d次调用：%d*2=%d", idx, idx, reply)
        }(i)
    }
    wg.Wait()
}
```

#### 四、辅助优化

1. **调整系统文件句柄限制**：临时调整 `ulimit -n 65535`，或永久修改 `/etc/security/limits.conf`；
2. **服务端优化**：服务端增加连接超时（如 `SetDeadline`），避免客户端连接泄漏导致服务端句柄耗尽；
3. **连接池监控**：增加池的监控指标（如空闲连接数、活跃连接数），便于排查问题。

## 5. 场景题：某 `net/rpc` 服务端的远程方法 `GetUser` 中，若查询到用户则返回用户信息，否则返回 `errors.New("用户不存在")`。客户端调用该方法时，如何区分 “网络错误” 和 “业务错误（用户不存在）”？请写出客户端的处理代码。

### 答案：

#### 一、核心原理

`net/rpc` 客户端调用远程方法时，错误分为两类：

1. **网络错误**：客户端与服务端的通信错误（如连接超时、断开、编解码失败），返回的 `error` 是原生错误（如 `net.OpError`、`json.SyntaxError`）；
2. **业务错误**：服务端远程方法返回的 `error`（如 “用户不存在”），客户端会收到 `rpc.ServerError` 类型的错误（源码中 `response.Error` 非空时，客户端将其转为 `ServerError`）。

通过 **类型断言** 可区分两种错误：`ServerError` 是业务错误，其他错误是网络错误。

#### 二、客户端处理代码

go

```go
package main

import (
    "errors"
    "log"
    "net/rpc"
)

// 1. 定义与服务端一致的请求/响应类型
type GetUserReq struct {
    Id string `json:"id"`
}

type GetUserResp struct {
    Id    string `json:"id"`
    Name  string `json:"name"`
    Phone string `json:"phone"`
}

// 2. 区分错误类型的调用函数
func getUser(client *rpc.Client, userId string) (*GetUserResp, error) {
    req := &GetUserReq{Id: userId}
    var resp GetUserResp

    // 调用远程方法
    err := client.Call("UserServer.GetUser", req, &resp)
    if err != nil {
        // 类型断言：判断是否为服务端返回的业务错误（ServerError）
        var serverErr rpc.ServerError
        if errors.As(err, &serverErr) {
            // 业务错误：返回业务错误信息（如“用户不存在”）
            return nil, errors.New("业务错误: " + string(serverErr))
        }
        // 非ServerError：网络错误或编解码错误
        return nil, errors.New("网络错误: " + err.Error())
    }

    // 无错误，返回用户信息
    return &resp, nil
}

// 3. 使用示例
func main() {
    // 建立连接（实际使用中建议用连接池）
    client, err := rpc.Dial("tcp", "127.0.0.1:1234")
    if err != nil {
        log.Fatal("连接服务端失败:", err)
    }
    defer client.Close()

    // 测试1：查询存在的用户（id=1）
    user1, err := getUser(client, "1")
    if err != nil {
        log.Println("查询用户1失败:", err)
    } else {
        log.Println("查询用户1成功:", user1) // 输出：{1 木兮 13800001111}
    }

    // 测试2：查询不存在的用户（id=999）
    user2, err := getUser(client, "999")
    if err != nil {
        log.Println("查询用户999失败:", err) // 输出：业务错误: 没有找到用户
    } else {
        log.Println("查询用户999成功:", user2)
    }

    // 测试3：模拟网络错误（断开服务端后调用）
    // client.Close() // 手动关闭连接
    // user3, err := getUser(client, "1")
    // if err != nil {
    //     log.Println("查询用户1失败:", err) // 输出：网络错误: write tcp ...: broken pipe
    // }
}
```

#### 三、关键代码说明

1. **错误类型断言**：使用 `errors.As(err, &serverErr)` 替代直接类型断言（`serverErr, ok := err.(rpc.ServerError)`），支持错误链（若服务端返回的错误被包装过，仍能识别）；
2. **错误分类处理**：业务错误返回用户可理解的信息（如 “用户不存在”），网络错误返回技术细节（便于排查）；
3. **兼容性**：无论服务端返回何种业务错误，客户端都能通过 `ServerError` 类型断言捕获，确保错误分类的准确性。