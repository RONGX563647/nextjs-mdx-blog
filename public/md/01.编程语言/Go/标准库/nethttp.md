在 Go 语言中，`net/http` 是标准库中用于处理 HTTP 协议的核心包，它提供了完整的 HTTP 客户端和服务器实现，无需依赖第三方库即可快速构建 Web 应用、API 服务或发送 HTTP 请求。其设计简洁而强大，遵循 Go 的 “最小接口” 哲学，核心功能通过少数几个接口和函数实现，同时支持高度定制。

### 一、核心概念：HTTP 服务器基础

`net/http` 最常用的场景是构建 HTTP 服务器，其核心是 **“处理器（Handler）”** 和 **“服务器（Server）”** 两大组件。

#### 1. 处理器（Handler）：处理 HTTP 请求的核心

HTTP 服务器的核心工作是 “接收请求→处理请求→返回响应”，而 “处理请求” 的逻辑由 **`http.Handler` 接口**定义。该接口仅包含一个方法：

go

```go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}
```

- **`ResponseWriter`**：用于构建并发送响应给客户端（如设置状态码、响应头、响应体）。
- **`\*Request`**：封装了客户端发送的 HTTP 请求细节（如 URL、方法、头信息、请求体等）。

任何实现了 `ServeHTTP` 方法的类型，都可以作为 HTTP 请求的处理器。

#### 2. 便捷函数：`HandleFunc` 简化处理器定义

直接实现 `Handler` 接口需要定义一个结构体并实现 `ServeHTTP` 方法，略显繁琐。`net/http` 提供了 **`http.HandleFunc`** 函数，允许将一个普通函数（签名为 `func(http.ResponseWriter, *http.Request)`）转换为 `Handler`，大幅简化代码：

go

```go
// 定义一个处理函数：接收请求并返回"Hello World"
func helloHandler(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello World")) // 向客户端写入响应体
}

func main() {
    // 注册路由：将路径"/hello"与helloHandler绑定
    http.HandleFunc("/hello", helloHandler)
    
    // 启动服务器，监听8080端口
    // 第二个参数为nil，表示使用默认的DefaultServeMux（路由多路复用器）
    http.ListenAndServe(":8080", nil)
}
```

运行后，访问 `http://localhost:8080/hello` 会收到 `Hello World` 响应。

#### 3. 路由多路复用器（ServeMux）：分发请求

当服务器收到请求时，需要根据请求的 URL 路径将其转发到对应的处理器，这个工作由 **`ServeMux`**（路由多路复用器）完成。`net/http` 提供了一个默认的全局多路复用器 `http.DefaultServeMux`（`http.HandleFunc` 默认使用它），也可以创建自定义的 `ServeMux`：

go

```go
func main() {
    // 创建自定义多路复用器
    mux := http.NewServeMux()
    
    // 向自定义mux注册路由
    mux.HandleFunc("/", homeHandler)       // 根路径
    mux.HandleFunc("/user", userHandler)   // /user路径
    
    // 启动服务器时指定自定义mux
    http.ListenAndServe(":8080", mux)
}
```

`ServeMux` 的路由匹配规则：

- 优先精确匹配（如 `/user` 匹配 `GET /user`）；
- 若没有精确匹配，尝试最长前缀匹配（如 `/user/123` 会匹配 `/user/` 前缀的处理器）；
- 路径末尾的 `/` 是有意义的（`/user` 和 `/user/` 是两个不同的路径）。

### 二、HTTP 服务器进阶功能

除了基础的请求处理，`net/http` 还支持丰富的服务器特性，满足生产级需求。

#### 1. 处理 HTTP 方法（GET/POST/PUT 等）

通过 `*Request.Method` 可判断请求方法，从而在一个处理器中处理不同的 HTTP 动作：

go

```go
func userHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        w.Write([]byte("获取用户信息"))
    case http.MethodPost:
        w.Write([]byte("创建用户"))
    case http.MethodPut:
        w.Write([]byte("更新用户"))
    default:
        // 若不支持该方法，返回405 Method Not Allowed
        w.WriteHeader(http.StatusMethodNotAllowed)
        w.Write([]byte("不支持的方法"))
    }
}
```

#### 2. 读取请求参数

- **URL 查询参数（Query Parameters）**：如 `GET /user?id=123`，通过 `r.URL.Query()` 获取：

  go

  ```go
  func userHandler(w http.ResponseWriter, r *http.Request) {
      id := r.URL.Query().Get("id") // 获取?id=123中的id值
      if id == "" {
          w.WriteHeader(http.StatusBadRequest)
          w.Write([]byte("缺少id参数"))
          return
      }
      w.Write([]byte("用户ID: " + id))
  }
  ```

- **表单数据（POST 表单）**：如表单提交，需先调用 `r.ParseForm()` 解析：

  go

  ```go
  func loginHandler(w http.ResponseWriter, r *http.Request) {
      if r.Method != http.MethodPost {
          w.WriteHeader(http.StatusMethodNotAllowed)
          return
      }
      // 解析表单数据（支持application/x-www-form-urlencoded）
      if err := r.ParseForm(); err != nil {
          w.WriteHeader(http.StatusBadRequest)
          w.Write([]byte("解析表单失败: " + err.Error()))
          return
      }
      username := r.PostForm.Get("username") // 获取表单字段
      password := r.PostForm.Get("password")
      w.Write([]byte("登录信息: " + username + "," + password))
  }
  ```

- **JSON 请求体**：对于 API 接口，客户端常发送 JSON 数据，需通过 `r.Body` 读取并解析：

  go

  ```go
  import "encoding/json"
  
  type User struct {
      Name  string `json:"name"`
      Age   int    `json:"age"`
  }
  
  func createUserHandler(w http.ResponseWriter, r *http.Request) {
      if r.Method != http.MethodPost {
          w.WriteHeader(http.StatusMethodNotAllowed)
          return
      }
      // 解析JSON请求体
      var u User
      decoder := json.NewDecoder(r.Body)
      if err := decoder.Decode(&u); err != nil {
          w.WriteHeader(http.StatusBadRequest)
          w.Write([]byte("解析JSON失败: " + err.Error()))
          return
      }
      defer r.Body.Close() // 务必关闭Body，避免资源泄漏
      
      w.Write([]byte("创建用户: " + u.Name))
  }
  ```

#### 3. 中间件（Middleware）：增强处理器功能

中间件是一种 “包装处理器” 的设计模式，用于在请求到达处理器前 / 后执行通用逻辑（如日志、认证、限流等）。其本质是一个函数，接收一个 `Handler` 并返回一个新的 `Handler`：

go

```go
// 日志中间件：打印请求方法、路径和处理时间
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 请求处理前：记录开始时间
        start := time.Now()
        
        // 调用下一个处理器（核心业务逻辑）
        next.ServeHTTP(w, r)
        
        // 请求处理后：打印日志
        log.Printf(
            "method=%s path=%s duration=%v",
            r.Method,
            r.URL.Path,
            time.Since(start),
        )
    })
}

// 使用中间件：包装helloHandler
func main() {
    // 将helloHandler用loggingMiddleware包装
    http.HandleFunc("/hello", loggingMiddleware(helloHandler))
    http.ListenAndServe(":8080", nil)
}
```

访问 `/hello` 后，控制台会输出类似日志：`method=GET path=/hello duration=123.4µs`。

#### 4. 自定义服务器配置（`http.Server`）

`http.ListenAndServe` 是简化的服务器启动函数，实际生产中通常使用 `http.Server` 结构体自定义配置（如超时时间、TLS 证书等）：

go

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", homeHandler)
    
    // 自定义服务器配置
    server := &http.Server{
        Addr:           ":8080",        // 监听地址
        Handler:        mux,            // 处理器
        ReadTimeout:    10 * time.Second, // 读取请求超时
        WriteTimeout:   10 * time.Second, // 写入响应超时
        MaxHeaderBytes: 1 << 20,        // 最大请求头大小（1MB）
    }
    
    // 启动服务器（若失败，返回错误）
    if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatalf("服务器启动失败: %v", err)
    }
}
```

#### 5. 支持 HTTPS

`net/http` 内置对 HTTPS 的支持，通过 `ListenAndServeTLS` 启动 HTTPS 服务器（需提供证书和密钥文件）：

go

```go
// 启动HTTPS服务器（需要cert.pem证书和key.pem密钥）
func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("HTTPS 安全连接"))
    })
    // 第一个参数：监听地址；第二个参数：证书文件路径；第三个参数：密钥文件路径
    err := http.ListenAndServeTLS(":443", "cert.pem", "key.pem", nil)
    if err != nil {
        log.Fatal(err)
    }
}
```

### 三、HTTP 客户端：发送 HTTP 请求

`net/http` 不仅能做服务器，还能作为客户端发送 HTTP 请求（如调用第三方 API），核心是 `http.Client` 结构体和一系列便捷函数。

#### 1. 便捷函数：快速发送请求

- **`http.Get`**：发送 GET 请求；
- **`http.Post`**：发送 POST 请求（支持表单数据）；
- **`http.PostForm`**：发送表单编码的 POST 请求。

示例：用 `http.Get` 获取网页内容：

go

```go
func main() {
    // 发送GET请求
    resp, err := http.Get("https://example.com")
    if err != nil {
        log.Fatalf("请求失败: %v", err)
    }
    defer resp.Body.Close() // 务必关闭响应体，避免资源泄漏
    
    // 检查响应状态码（200表示成功）
    if resp.StatusCode != http.StatusOK {
        log.Fatalf("响应失败: 状态码=%d", resp.StatusCode)
    }
    
    // 读取响应体
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Fatalf("读取响应失败: %v", err)
    }
    
    fmt.Printf("响应内容: %s\n", body)
}
```

#### 2. 自定义请求：`http.NewRequest`

便捷函数无法满足复杂需求（如设置请求头、自定义方法、携带 JSON 体）时，可使用 `http.NewRequest` 构建请求：

go

```go
func main() {
    // 1. 创建请求（方法、URL、请求体）
    jsonData := `{"name": "张三", "age": 20}`
    req, err := http.NewRequest(
        http.MethodPost,          // 方法
        "https://api.example.com/user", // URL
        strings.NewReader(jsonData),    // 请求体（io.Reader类型）
    )
    if err != nil {
        log.Fatal(err)
    }
    
    // 2. 设置请求头（如Content-Type）
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer token123") // 认证令牌
    
    // 3. 创建客户端并发送请求
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
    
    // 4. 处理响应
    fmt.Printf("状态码: %d\n", resp.StatusCode)
}
```

#### 3. 客户端配置：`http.Client`

`http.Client` 支持自定义超时、代理、重定向策略等：

go

```go
client := &http.Client{
    Timeout: 10 * time.Second, // 整个请求的超时时间（连接+读取）
    CheckRedirect: func(req *http.Request, via []*http.Request) error {
        // 禁止重定向
        return http.ErrUseLastResponse
    },
    // 自定义Transport（控制底层TCP连接，如代理、TLS配置等）
    Transport: &http.Transport{
        Proxy: http.ProxyFromEnvironment, // 从环境变量读取代理
        TLSHandshakeTimeout: 5 * time.Second, // TLS握手超时
    },
}
```

### 四、`net/http` 的局限性与补充

`net/http` 作为标准库，设计简洁但并非全能，复杂场景需配合第三方库：

- **路由功能有限**：默认 `ServeMux` 不支持参数路由（如 `/user/:id`）、正则路由等，需用 `gorilla/mux` 等第三方路由库；
- **模板引擎**：`net/http` 内置 `html/template` 处理 HTML 模板，但需单独学习；
- **高级功能**：如 WebSocket、GraphQL 等，需结合 `golang.org/x/net/websocket` 等扩展库。

### 总结

`net/http` 是 Go 语言 Web 开发的基石，其核心优势在于：

1. **零依赖**：标准库内置，无需额外引入第三方包即可构建完整 Web 服务；
2. **简洁接口**：通过 `Handler` 接口和少量函数实现核心功能，易于理解和扩展；
3. **高性能**：基于 Go 的并发模型（goroutine），天然支持高并发请求处理。

无论是开发简单的 API 服务、静态文件服务器，还是作为客户端调用外部接口，`net/http` 都是 Go 开发者必须掌握的核心库。

以下是基于`net/http`包内容设计的 7 道八股文（含答案）和 3 道场景题（含答案），覆盖核心知识点与实践应用：

### 一、八股文题目与答案（难度递增）

#### 1. 核心接口与处理器题

**题目**：`http.Handler`接口的定义是什么？`http.HandleFunc`的作用是什么？请简述 “处理器（Handler）” 在 HTTP 服务器中的核心作用。

**答案**：

- **`http.Handler`接口定义**：

  go

  ```go
  type Handler interface {
      ServeHTTP(ResponseWriter, *Request)
  }
  ```

  该接口仅包含`ServeHTTP`方法，接收`ResponseWriter`（用于构建响应）和`*Request`（封装请求信息），负责处理 HTTP 请求并生成响应。

- **`http.HandleFunc`的作用**：
  是一个适配器函数，将 “普通函数”（签名为`func(http.ResponseWriter, *http.Request)`）转换为`http.Handler`接口类型，简化处理器的定义。例如：

  go

  ```go
  func hello(w http.ResponseWriter, r *http.Request) {
      w.Write([]byte("hello"))
  }
  http.HandleFunc("/hello", hello) // 等价于注册一个实现Handler的类型
  ```

- **处理器的核心作用**：
  是 HTTP 服务器处理请求的 “业务逻辑载体”，负责解析请求（如 URL、参数、请求体）、执行业务逻辑（如查询数据库、计算结果）、生成响应（如设置状态码、响应头、响应体），是 “接收请求→处理→返回响应” 流程的核心环节。

#### 2. 路由多路复用器题

**题目**：`http.ServeMux`（路由多路复用器）的作用是什么？默认的`http.DefaultServeMux`与自定义`ServeMux`有何区别？请简述`ServeMux`的路由匹配规则。

**答案**：

- **`ServeMux`的作用**：
  负责根据 HTTP 请求的 URL 路径，将请求分发到对应的`Handler`处理器，是 HTTP 服务器的 “路由分发器”。

- **默认与自定义`ServeMux`的区别**：

  - `http.DefaultServeMux`：全局默认的多路复用器，`http.HandleFunc`等函数默认使用它。缺点是全局共享，若第三方库也使用可能导致路由冲突。

  - 自定义

    ```
    ServeMux
    ```

    ：通过

    ```
    http.NewServeMux()
    ```

    创建，独立于全局，可避免路由冲突，更适合复杂应用。需在

    ```
    http.ListenAndServe
    ```

    中显式指定：

    go

    ```go
    mux := http.NewServeMux()
    mux.HandleFunc("/", home)
    http.ListenAndServe(":8080", mux) // 使用自定义mux
    ```

- **路由匹配规则**：

  1. 优先**精确匹配**（如`/user`精确匹配`GET /user`）；
  2. 若无精确匹配，尝试**最长前缀匹配**（前缀需以`/`结尾），如`/user/123`匹配`/user/`对应的处理器；
  3. 路径末尾的`/`有意义（`/user`与`/user/`是不同路径）；
  4. 特殊路径`/`匹配所有未被其他路由匹配的请求（类似 “默认路由”）。

#### 3. 中间件设计题

**题目**：什么是 “中间件（Middleware）”？在`net/http`中如何实现中间件？请举例说明中间件的典型应用场景（至少 3 个）。

**答案**：

- **中间件的定义**：
  是一种 “包装处理器” 的设计模式，用于在请求到达目标处理器前（前置处理）或响应返回客户端前（后置处理）执行通用逻辑，不侵入核心业务代码。

- **中间件的实现方式**：
  本质是一个函数，接收`http.Handler`作为参数，返回一个新的`http.Handler`。示例：

  go

  ```go
  // 日志中间件：记录请求方法、路径和处理时间
  func loggingMiddleware(next http.Handler) http.Handler {
      return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
          start := time.Now()
          // 前置处理：可修改请求（如添加头信息）
          
          next.ServeHTTP(w, r) // 调用下一个处理器（核心业务）
          
          // 后置处理：可处理响应（如记录耗时）
          log.Printf("method=%s path=%s duration=%v", 
              r.Method, r.URL.Path, time.Since(start))
      })
  }
  
  // 使用：包装目标处理器
  http.HandleFunc("/hello", loggingMiddleware(helloHandler))
  ```

- **典型应用场景**：

  1. 日志记录：记录请求方法、路径、耗时、状态码等；
  2. 认证授权：验证请求中的令牌（如 JWT），未通过则返回 401；
  3. 限流：限制单位时间内的请求数，防止过载；
  4. 跨域处理：设置`Access-Control-Allow-*`等响应头；
  5. 错误恢复：捕获处理器中的`panic`，返回 500 错误而非崩溃。

#### 4. 请求处理细节题

**题目**：在处理器中，如何区分 HTTP 请求方法（GET/POST/PUT 等）？如何读取 URL 查询参数、表单数据和 JSON 请求体？请分别举例说明。

**答案**：

- **区分 HTTP 请求方法**：
  通过`*http.Request`的`Method`字段判断，示例：

  go

  ```go
  func handler(w http.ResponseWriter, r *http.Request) {
      switch r.Method {
      case http.MethodGet:
          w.Write([]byte("处理GET请求"))
      case http.MethodPost:
          w.Write([]byte("处理POST请求"))
      default:
          w.WriteHeader(http.StatusMethodNotAllowed) // 405
      }
  }
  ```

- **读取 URL 查询参数**（如`GET /user?id=123`）：
  通过`r.URL.Query()`获取，返回`url.Values`（类似 map）：

  go

  ```go
  func getUser(w http.ResponseWriter, r *http.Request) {
      id := r.URL.Query().Get("id") // 获取"id"参数
      if id == "" {
          w.WriteHeader(http.StatusBadRequest) // 400
          w.Write([]byte("缺少id参数"))
          return
      }
      w.Write([]byte("用户ID: " + id))
  }
  ```

- **读取表单数据**（如`POST`表单，`Content-Type: application/x-www-form-urlencoded`）：
  需先调用`r.ParseForm()`解析，再通过`r.PostForm`获取：

  go

  ```go
  func login(w http.ResponseWriter, r *http.Request) {
      if r.Method != http.MethodPost {
          w.WriteHeader(http.StatusMethodNotAllowed)
          return
      }
      if err := r.ParseForm(); err != nil { // 解析表单
          w.WriteHeader(http.StatusBadRequest)
          return
      }
      username := r.PostForm.Get("username") // 获取表单字段
      password := r.PostForm.Get("password")
      w.Write([]byte("登录用户: " + username))
  }
  ```

- **读取 JSON 请求体**（`Content-Type: application/json`）：
  通过`json.NewDecoder(r.Body)`解析到结构体：

  go

  ```go
  type User struct {
      Name string `json:"name"`
      Age  int    `json:"age"`
  }
  
  func createUser(w http.ResponseWriter, r *http.Request) {
      var u User
      if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
          w.WriteHeader(http.StatusBadRequest)
          return
      }
      defer r.Body.Close() // 务必关闭Body，避免资源泄漏
      w.Write([]byte("创建用户: " + u.Name))
  }
  ```

#### 5. 服务器配置题

**题目**：`http.ListenAndServe`与`http.Server`结构体的关系是什么？`http.Server`的核心配置参数有哪些（至少 5 个）？为什么生产环境推荐使用`http.Server`而非`ListenAndServe`？

**答案**：

- **两者关系**：
  `http.ListenAndServe(addr string, handler Handler) error`是简化的服务器启动函数，内部会创建一个默认的`http.Server`结构体并调用其`ListenAndServe`方法。例如：

  go

  ```go
  // http.ListenAndServe的等效实现
  func ListenAndServe(addr string, handler Handler) error {
      s := &Server{Addr: addr, Handler: handler}
      return s.ListenAndServe()
  }
  ```

- **`http.Server`核心配置参数**：

  go

  ```go
  type Server struct {
      Addr           string        // 监听地址（如":8080"）
      Handler        Handler       // 根处理器（默认使用DefaultServeMux）
      ReadTimeout    time.Duration // 读取请求的超时时间（连接+请求头+请求体）
      WriteTimeout   time.Duration // 写入响应的超时时间
      IdleTimeout    time.Duration // 空闲连接的超时时间（适用于Keep-Alive）
      MaxHeaderBytes int           // 最大请求头大小（默认1MB）
      TLSConfig      *tls.Config   // TLS配置（用于HTTPS）
  }
  ```

- **生产环境推荐`http.Server`的原因**：

  1. 可配置超时时间（`ReadTimeout`/`WriteTimeout`），避免恶意请求导致连接长期占用；
  2. 可设置`MaxHeaderBytes`防止请求头过大的攻击；
  3. 支持优雅关闭（通过`Shutdown`方法），避免重启时丢失请求；
  4. 可自定义 TLS 配置，支持 HTTPS 的高级特性（如证书轮换）；
  5. 便于监控和扩展（如注册钩子函数）。

#### 6. HTTP 客户端题

**题目**：`http.Get`、`http.Post`与`http.Client`的关系是什么？如何发送带自定义请求头、超时控制的 HTTP 请求？请举例说明。

**答案**：

- **三者关系**：
  `http.Get`、`http.Post`是基于`http.Client`的便捷函数，内部使用默认的`http.DefaultClient`（全局客户端实例）。例如，`http.Get`的实现类似：

  go

  ```go
  func Get(url string) (resp *Response, err error) {
      return DefaultClient.Get(url)
  }
  ```

  当需要自定义配置（如超时、请求头）时，需显式创建`http.Client`。

- **发送带自定义请求头和超时的请求**：
  步骤：1. 用`http.NewRequest`创建请求；2. 设置请求头；3. 配置`http.Client`的超时；4. 发送请求。示例：

  go

  ```go
  func main() {
      // 1. 创建请求（方法、URL、请求体）
      req, err := http.NewRequest(http.MethodPost, "https://api.example.com", 
          strings.NewReader(`{"key":"value"}`))
      if err != nil {
          log.Fatal(err)
      }
      
      // 2. 设置自定义请求头
      req.Header.Set("Content-Type", "application/json")
      req.Header.Set("Authorization", "Bearer token123")
      
      // 3. 配置客户端（超时10秒）
      client := &http.Client{
          Timeout: 10 * time.Second,
      }
      
      // 4. 发送请求
      resp, err := client.Do(req)
      if err != nil {
          log.Fatal(err)
      }
      defer resp.Body.Close()
      
      // 处理响应
      fmt.Println("状态码:", resp.StatusCode)
  }
  ```

#### 7. HTTPS 与安全题

**题目**：`net/http`如何实现 HTTPS 服务器？`http.ListenAndServeTLS`的参数有哪些？使用 HTTPS 时需注意哪些证书相关的问题？

**答案**：

- **HTTPS 服务器实现**：
  通过`http.ListenAndServeTLS`函数或`http.Server`的`ListenAndServeTLS`方法，需提供 TLS 证书和密钥文件。示例：

  go

  ```go
  func main() {
      http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
          w.Write([]byte("HTTPS 安全连接"))
      })
      // 启动HTTPS服务器（监听443端口，默认HTTPS端口）
      err := http.ListenAndServeTLS(":443", "server.crt", "server.key", nil)
      if err != nil {
          log.Fatal(err)
      }
  }
  ```

- **`ListenAndServeTLS`参数**：

  go

  ```go
  func ListenAndServeTLS(addr, certFile, keyFile string, handler Handler) error
  ```

  - `addr`：监听地址（如 ":443"）；
  - `certFile`：PEM 格式的服务器证书文件路径；
  - `keyFile`：PEM 格式的服务器私钥文件路径（需与证书匹配）；
  - `handler`：根处理器（默认`DefaultServeMux`）。

- **证书相关注意事项**：

  1. 证书需由可信 CA（证书颁发机构）签名，否则客户端会提示 “不安全”；

  2. 证书和私钥必须匹配，否则服务器启动失败；

  3. 证书有有效期，需及时更新；

  4. 生产环境需配置

     ```
     TLSConfig
     ```

     强化安全性（如禁用旧版 TLS 协议、限制加密套件）：

     go

     ```go
     tlsConfig := &tls.Config{
         MinVersion: tls.VersionTLS12, // 禁用TLS1.0/1.1
     }
     server := &http.Server{
         Addr:      ":443",
         TLSConfig: tlsConfig,
     }
     server.ListenAndServeTLS("cert.pem", "key.pem")
     ```

### 二、场景题与答案（结合实际开发）

#### 1. 带中间件的 RESTful API 服务

**题目**：实现一个简单的用户管理 RESTful API，要求：

- 支持`GET /users`（查询所有用户）、`POST /users`（创建用户）、`GET /users/{id}`（查询单个用户）；
- 集成 3 个中间件：日志记录（请求方法、路径、耗时）、认证（检查`Authorization`头）、跨域处理（允许所有来源）；
- 对无效路由返回 404，对不支持的方法返回 405。

**答案**：

go

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"
)

// 数据模型
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

var users = []User{{ID: 1, Name: "Alice", Age: 30}} // 模拟数据库

// 处理器实现
func listUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func createUser(w http.ResponseWriter, r *http.Request) {
	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	u.ID = len(users) + 1
	users = append(users, u)
	w.WriteHeader(http.StatusCreated) // 201
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func getUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id") // 获取路径参数（Go 1.22+支持）
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	for _, u := range users {
		if u.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(u)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound) // 404
}

// 中间件实现
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("method=%s path=%s duration=%v",
			r.Method, r.URL.Path, time.Since(start))
	})
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token != "Bearer secret" { // 简化的认证逻辑
			w.WriteHeader(http.StatusUnauthorized) // 401
			return
		}
		next.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	// 注册路由（按RESTful设计）
	mux.HandleFunc("GET /users", listUsers)
	mux.HandleFunc("POST /users", createUser)
	mux.HandleFunc("GET /users/{id}", getUser)

	// 组合中间件（顺序：cors → auth → logging → 业务处理器）
	handler := corsMiddleware(authMiddleware(loggingMiddleware(mux)))

	// 配置服务器
	server := &http.Server{
		Addr:         ":8080",
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Println("服务器启动于:8080")
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
```

**关键逻辑**：

- 用`http.NewServeMux`注册 RESTful 路由，Go 1.22 + 支持路径参数（`/users/{id}`）；
- 中间件按 “洋葱模型” 组合：请求先经过`cors`→`auth`→`logging`，再到业务处理器；
- 认证中间件检查`Authorization`头，跨域中间件设置 CORS 响应头，日志中间件记录请求详情；
- 服务器配置超时时间，符合生产环境要求。

#### 2. 文件上传服务器

**题目**：实现一个支持单文件上传的 HTTP 服务器，要求：

- 客户端通过`POST /upload`上传文件（`multipart/form-data`格式）；
- 限制文件大小不超过 10MB，仅允许上传图片（`image/jpeg`、`image/png`）；
- 将上传的文件保存到`./uploads`目录（不存在则创建）；
- 返回上传结果（成功 / 失败原因、文件路径）。

**答案**：

go

```go
package main

import (
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const (
	maxFileSize = 10 * 1024 * 1024 // 10MB
	uploadDir   = "./uploads"
)

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	// 检查方法
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		jsonResponse(w, http.StatusMethodNotAllowed, map[string]string{
			"error": "仅支持POST方法",
		})
		return
	}

	// 创建上传目录（若不存在）
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{
			"error": "创建目录失败: " + err.Error(),
		})
		return
	}

	// 限制请求体大小
	r.ParseMultipartForm(maxFileSize)
	file, handler, err := r.FormFile("file") // 获取表单中"file"字段
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		jsonResponse(w, http.StatusBadRequest, map[string]string{
			"error": "获取文件失败: " + err.Error(),
		})
		return
	}
	defer file.Close()

	// 检查文件大小
	if handler.Size > maxFileSize {
		w.WriteHeader(http.StatusRequestEntityTooLarge)
		jsonResponse(w, http.StatusRequestEntityTooLarge, map[string]string{
			"error": "文件过大（最大10MB）",
		})
		return
	}

	// 检查文件类型
	contentType := handler.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" {
		w.WriteHeader(http.StatusUnsupportedMediaType)
		jsonResponse(w, http.StatusUnsupportedMediaType, map[string]string{
			"error": "仅支持JPG和PNG图片",
		})
		return
	}

	// 生成唯一文件名（避免冲突）
	filename := filepath.Base(handler.Filename)
	ext := filepath.Ext(filename)
	newFilename := time.Now().Format("20060102150405") + ext
	savePath := filepath.Join(uploadDir, newFilename)

	// 创建目标文件
	dst, err := os.Create(savePath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{
			"error": "创建文件失败: " + err.Error(),
		})
		return
	}
	defer dst.Close()

	// 复制文件内容
	if _, err := io.Copy(dst, file); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{
			"error": "保存文件失败: " + err.Error(),
		})
		os.Remove(savePath) // 清理不完整文件
		return
	}

	// 返回成功结果
	jsonResponse(w, http.StatusOK, map[string]string{
		"message": "上传成功",
		"path":    savePath,
	})
}

// 辅助函数：返回JSON响应
func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func main() {
	http.HandleFunc("/upload", uploadHandler)
	server := &http.Server{
		Addr:         ":8080",
		ReadTimeout:  30 * time.Second, // 上传可能较慢，超时设长一些
		WriteTimeout: 10 * time.Second,
	}
	log.Println("文件上传服务器启动于:8080")
	log.Fatal(server.ListenAndServe())
}
```

**关键逻辑**：

- 用`r.ParseMultipartForm`解析 multipart 表单，`r.FormFile`获取上传文件；
- 限制文件大小（`maxFileSize`）和类型（仅图片），提前拦截无效文件；
- 生成带时间戳的文件名，避免覆盖已有文件；
- 出错时清理不完整文件（`os.Remove`），确保目录整洁；
- 统一返回 JSON 格式响应，便于客户端解析。

#### 3. 带重试机制的 HTTP 客户端

**题目**：实现一个 HTTP 客户端函数`GetWithRetry(url string, maxRetries int, retryDelay time.Duration) (*http.Response, error)`，要求：

- 当请求失败（如网络超时、5xx 状态码）时自动重试，最多重试`maxRetries`次；
- 每次重试前等待`retryDelay`时间；
- 仅重试 “可重试” 错误（如临时网络错误、服务器内部错误），对 4xx 错误（如 404、401）不重试。

**答案**：

go

```go
package main

import (
	"errors"
	"fmt"
	"net/http"
	"time"
)

// GetWithRetry 带重试机制的GET请求
func GetWithRetry(url string, maxRetries int, retryDelay time.Duration) (*http.Response, error) {
	client := &http.Client{
		Timeout: 10 * time.Second, // 单次请求超时
	}

	for attempt := 0; attempt <= maxRetries; attempt++ {
		resp, err := client.Get(url)

		// 无错误且状态码正常（2xx），直接返回
		if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return resp, nil
		}

		// 处理错误或非成功状态码
		var shouldRetry bool
		if err != nil {
			// 网络错误（如超时、连接失败）通常可重试
			shouldRetry = true
			fmt.Printf("请求失败（尝试%d/%d）: %v，将重试\n", attempt+1, maxRetries+1, err)
		} else {
			// 状态码处理：5xx（服务器错误）可重试，4xx（客户端错误）不重试
			if resp.StatusCode >= 500 && resp.StatusCode < 600 {
				shouldRetry = true
				fmt.Printf("请求失败（尝试%d/%d）: 状态码%d，将重试\n", 
					attempt+1, maxRetries+1, resp.StatusCode)
				resp.Body.Close() // 关闭当前响应体
			} else {
				// 4xx错误（如404、401）不重试，直接返回
				return resp, fmt.Errorf("非重试状态码: %d", resp.StatusCode)
			}
		}

		// 达到最大重试次数，返回最后一次错误
		if attempt == maxRetries {
			if err != nil {
				return nil, fmt.Errorf("达到最大重试次数: %w", err)
			}
			return nil, fmt.Errorf("达到最大重试次数，最后状态码: %d", resp.StatusCode)
		}

		// 等待重试延迟
		time.Sleep(retryDelay)
	}

	return nil, errors.New("未执行任何请求")
}

func main() {
	resp, err := GetWithRetry("https://api.example.com", 3, 2*time.Second)
	if err != nil {
		fmt.Printf("最终失败: %v\n", err)
		return
	}
	defer resp.Body.Close()
	fmt.Printf("请求成功，状态码: %d\n", resp.StatusCode)
}
```

**关键逻辑**：

- 循环最多执行`maxRetries+1`次请求（初始 1 次 + 重试 maxRetries 次）；
- 区分 “可重试错误”：网络错误（如超时）和 5xx 状态码（服务器临时故障）可重试；4xx 状态码（客户端错误）不重试；
- 每次重试前等待`retryDelay`，避免频繁请求加重服务器负担；
- 重试过程中及时关闭非成功响应的`Body`，避免资源泄漏；
- 最终返回成功响应或包含重试信息的错误，便于调试。