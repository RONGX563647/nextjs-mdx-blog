在 Go 语言的 Web 开发中，标准库提供了强大的基础支持，无需依赖第三方库即可构建完整的 Web 应用。以下是常用的标准库及其核心用途：

### 1. `net/http`：Web 开发核心库

Go Web 开发的基石，提供了 HTTP 服务器、客户端实现，以及请求 / 响应处理的全套功能。

**核心功能**：

- 启动 HTTP 服务器
- 注册路由与处理器
- 处理 HTTP 请求（GET/POST 等）
- 构建 HTTP 响应

**常用组件**：

- `http.HandleFunc(pattern, handler)`：注册路由与处理函数
- `http.ListenAndServe(addr, handler)`：启动服务器
- `http.Request`：封装请求信息（URL、Header、Body 等）
- `http.ResponseWriter`：用于构建响应

**示例**：简单的 HTTP 服务器

go

```go
package main

import (
    "fmt"
    "net/http"
)

// 处理GET请求的处理器函数
func helloHandler(w http.ResponseWriter, r *http.Request) {
    // 只允许GET方法
    if r.Method != http.MethodGet {
        http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
        return
    }
    fmt.Fprintf(w, "Hello, Web!") // 写入响应
}

func main() {
    http.HandleFunc("/hello", helloHandler) // 注册路由
    // 启动服务器，监听8080端口
    if err := http.ListenAndServe(":8080", nil); err != nil {
        fmt.Printf("服务器启动失败: %v\n", err)
    }
}
```

### 2. `encoding/json`：JSON 数据处理

Web 开发中最常用的数据交换格式处理库，用于 JSON 序列化（结构体→JSON）和反序列化（JSON→结构体）。

**核心方法**：

- `json.Marshal(v interface{}) ([]byte, error)`：序列化（结构体→JSON 字节）
- `json.Unmarshal(data []byte, v interface{}) error`：反序列化（JSON 字节→结构体）

**示例**：处理 JSON 请求与响应

go

```go
package main

import (
    "encoding/json"
    "net/http"
)

// 定义数据结构
type User struct {
    Name string `json:"name"` // 字段标签指定JSON键名
    Age  int    `json:"age"`
}

func userHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == http.MethodPost {
        // 反序列化：解析请求体JSON到User结构体
        var u User
        if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
            http.Error(w, "解析请求失败", http.StatusBadRequest)
            return
        }
        
        // 序列化：将结构体转为JSON响应
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(u)
    }
}

func main() {
    http.HandleFunc("/user", userHandler)
    http.ListenAndServe(":8080", nil)
}
```

### 3. `html/template`：HTML 模板渲染

用于动态生成 HTML 页面，内置 XSS 防护（自动转义特殊字符），比`text/template`更适合 Web 场景。

**核心功能**：

- 解析模板文件或字符串
- 向模板传递数据（结构体、map 等）
- 模板嵌套、条件判断、循环等语法

**示例**：渲染 HTML 模板

go

```go
package main

import (
    "html/template"
    "net/http"
)

type Article struct {
    Title   string
    Content string
}

func articleHandler(w http.ResponseWriter, r *http.Request) {
    // 定义模板内容
    tpl := `
    <html>
        <body>
            <h1>{{.Title}}</h1>
            <p>{{.Content}}</p>
        </body>
    </html>
    `
    // 解析模板
    tmpl, err := template.New("article").Parse(tpl)
    if err != nil {
        http.Error(w, "模板解析失败", http.StatusInternalServerError)
        return
    }
    // 传递数据并渲染
    data := Article{Title: "Go Web开发", Content: "使用标准库构建应用"}
    tmpl.Execute(w, data)
}

func main() {
    http.HandleFunc("/article", articleHandler)
    http.ListenAndServe(":8080", nil)
}
```

### 4. `log`：日志记录

用于记录 Web 应用的运行信息、错误日志等，支持输出到控制台、文件或自定义 Writer。

**常用方法**：

- `log.Println(v...)`：输出日志并换行
- `log.Printf(format string, v...)`：格式化输出
- `log.SetOutput(w io.Writer)`：设置日志输出目的地（如文件）

**示例**：记录请求日志

go

```go
package main

import (
    "log"
    "net/http"
    "os"
)

func main() {
    // 将日志输出到文件
    f, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
    if err != nil {
        log.Fatal(err)
    }
    defer f.Close()
    log.SetOutput(f)

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // 记录请求信息
        log.Printf("收到请求: %s %s", r.Method, r.URL.Path)
        w.Write([]byte("Hello"))
    })

    log.Println("服务器启动在:8080")
    http.ListenAndServe(":8080", nil)
}
```

### 5. `os`：系统交互

用于处理环境变量（如配置端口）、文件操作（如静态资源）等。

**Web 开发常用功能**：

- `os.Getenv(key string)`：读取环境变量（如端口号）
- `os.MkdirAll(path string, perm os.FileMode)`：创建目录（如上传文件目录）
- `os.Open(name string)`：打开文件（如读取静态资源）

**示例**：从环境变量获取端口

go

```go
package main

import (
    "net/http"
    "os"
    "strconv"
)

func main() {
    // 从环境变量读取端口，默认8080
    portStr := os.Getenv("PORT")
    if portStr == "" {
        portStr = "8080"
    }
    port, _ := strconv.Atoi(portStr)

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello"))
    })

    http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
}
```

### 6. `strconv`：字符串转换

Web 开发中频繁需要在字符串与基本类型（int、bool 等）之间转换（如解析 URL 参数）。

**核心方法**：

- `strconv.Atoi(s string) (int, error)`：字符串→int
- `strconv.ParseBool(s string) (bool, error)`：字符串→bool
- `strconv.Itoa(i int) string`：int→字符串

**示例**：解析 URL 参数

go

```go
package main

import (
    "net/http"
    "strconv"
)

func userHandler(w http.ResponseWriter, r *http.Request) {
    // 获取URL查询参数?id=123
    idStr := r.URL.Query().Get("id")
    id, err := strconv.Atoi(idStr) // 字符串转int
    if err != nil {
        http.Error(w, "无效的id", http.StatusBadRequest)
        return
    }
    w.Write([]byte(fmt.Sprintf("用户ID: %d", id)))
}

func main() {
    http.HandleFunc("/user", userHandler)
    http.ListenAndServe(":8080", nil)
}
```

### 7. `context`：上下文管理

用于在请求处理链路中传递超时控制、取消信号或共享数据（如用户认证信息），与`net/http`结合紧密。

**常用功能**：

- `context.Background()`：创建根上下文
- `context.WithTimeout(parent Context, timeout time.Duration)`：设置超时
- `r.Context()`：获取 HTTP 请求的上下文

**示例**：请求超时控制

go

```go
package main

import (
    "context"
    "net/http"
    "time"
)

func slowHandler(w http.ResponseWriter, r *http.Request) {
    // 创建5秒超时的上下文
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    // 模拟耗时操作
    select {
    case <-time.After(6 * time.Second): // 超过超时时间
        w.Write([]byte("操作完成"))
    case <-ctx.Done(): // 超时触发
        http.Error(w, "操作超时", http.StatusRequestTimeout)
    }
}

func main() {
    http.HandleFunc("/slow", slowHandler)
    http.ListenAndServe(":8080", nil)
}
```

### 总结

Go 标准库通过`net/http`提供了 Web 开发的核心能力，配合`encoding/json`、`html/template`等库，可快速构建功能完善的 Web 应用。这些库设计简洁、性能优异，是 Go Web 开发的基础。对于复杂场景（如路由嵌套、中间件），可基于标准库扩展，或选择成熟的第三方框架（如 Gin、Echo），但理解标准库是用好 Go Web 开发的前提。

# 问答

以下是 20 道八股文题目 + 答案和 15 道场景题 + 答案，基于 Go Web 开发标准库，按难度递增排列：

### 一、八股文题目与答案

#### 基础层（1-5 题）

1. **题目**：简述`net/http`包在 Go Web 开发中的核心作用，列举 3 个最常用的函数或类型。
   **答案**：`net/http`是 Go Web 开发的核心包，提供 HTTP 服务器、客户端实现及请求 / 响应处理能力。常用函数 / 类型：
   - `http.HandleFunc(pattern, handler)`：注册路由与处理函数
   - `http.ListenAndServe(addr, handler)`：启动 HTTP 服务器
   - `http.Request`：封装 HTTP 请求信息（如 URL、方法、头部）
2. **题目**：`http.HandleFunc`与`http.Handle`的区别是什么？分别适用于什么场景？
   **答案**：
   - `http.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request))`：直接接收函数作为处理器，适用于简单逻辑（无需自定义类型）。
   - `http.Handle(pattern, http.Handler)`：接收实现`Handler`接口（含`ServeHTTP`方法）的类型，适用于复杂逻辑（需封装状态或复用逻辑）。
3. **题目**：`http.Request`结构体中包含哪些关键字段？如何获取 URL 中的查询参数？
   **答案**：关键字段包括`Method`（请求方法）、`URL`（请求 URL）、`Header`（请求头）、`Body`（请求体）等。
   获取查询参数：通过`r.URL.Query().Get("key")`，如`id := r.URL.Query().Get("id")`。
4. **题目**：`encoding/json`包中，`json.Marshal`和`json.Unmarshal`的作用是什么？使用时需要注意什么（如字段可见性）？
   **答案**：
   - `json.Marshal(v)`：将 Go 数据结构序列化为 JSON 字节流。
   - `json.Unmarshal(data, v)`：将 JSON 字节流反序列化为 Go 数据结构。
     注意：结构体字段必须导出（首字母大写）才能被序列化 / 反序列化；可通过`json:"key"`标签指定 JSON 键名。
5. **题目**：简述`html/template`相比`text/template`的核心优势，为什么在 Web 开发中更推荐使用前者？
   **答案**：核心优势是内置**XSS 防护**，会根据上下文自动转义 HTML 特殊字符（如`<`转为`<`），避免跨站脚本攻击。Web 开发中用户输入可能包含恶意代码，因此推荐使用`html/template`。

#### 进阶层（6-10 题）

1. **题目**：`http.ListenAndServe(addr, handler)`中，第二个参数`handler`的作用是什么？如果传入`nil`，实际使用的是哪个默认处理器？
   **答案**：`handler`是根处理器，用于处理所有未被路由匹配的请求。若传入`nil`，默认使用`http.DefaultServeMux`（全局路由 multiplexer）。

2. **题目**：如何在`net/http`中限制请求方法（如只允许 POST）？若方法不匹配，应返回什么 HTTP 状态码？
   **答案**：在处理器函数中通过`r.Method`判断，如：

   go

   ```go
   if r.Method != http.MethodPost {
       http.Error(w, "方法不允许", http.StatusMethodNotAllowed) // 405状态码
       return
   }
   ```

   不匹配时应返回`405 Method Not Allowed`。

3. **题目**：结构体字段的`json:"name"`标签有什么作用？如果字段是未导出的（首字母小写），`json.Marshal`会如何处理？
   **答案**：`json:"name"`指定该字段在 JSON 中的键名为`name`（覆盖结构体字段名）。未导出字段（首字母小写）会被`json.Marshal`忽略，不参与序列化。

4. **题目**：`html/template`中`{{.}}`的含义是什么？如何访问嵌套结构体的字段（如`User.Profile.Age`）？
   **答案**：`{{.}}`代表传入模板的根数据（上下文）。访问嵌套结构体字段使用点语法：`{{.User.Profile.Age}}`（需确保所有字段均为导出字段）。

5. **题目**：如何使用`log`包将日志输出到文件而非控制台？需要注意哪些文件操作的权限问题？
   **答案**：通过`log.SetOutput(w io.Writer)`设置输出目的地，示例：

   go

   ```go
   f, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
   if err != nil { /* 处理错误 */ }
   log.SetOutput(f)
   ```

   权限需确保进程可读写文件（如`0666`允许所有用户读写），避免因权限不足导致日志写入失败。

#### 中高层（11-15 题）

1. **题目**：解释`net/http`服务器的并发模型：默认情况下，每个请求是如何被处理的？如何自定义并发控制（如限制最大连接数）？
   **答案**：默认模型：服务器启动后创建监听 socket，每个新连接由独立的 goroutine 处理（无固定线程池，依赖 Go 调度器）。
   自定义并发控制：通过`http.Server`结构体配置，如：

   go

   ```go
   srv := &http.Server{
       Addr:        ":8080",
       MaxHeaderBytes: 1 << 20, // 限制请求头大小
       ConnState:   func(c net.Conn, state http.ConnState) { /* 跟踪连接状态 */ },
       // 结合第三方库（如golang.org/x/net/netutil）限制最大连接数
       Listener:    netutil.LimitListener(l, 1000), // 最大1000个连接
   }
   ```

2. **题目**：什么是 HTTP 中间件？基于`net/http`如何实现一个简单的中间件（如记录请求耗时）？
   **答案**：中间件是位于请求与处理器之间的函数，用于统一处理通用逻辑（如日志、认证）。实现示例：

   go

   ```go
   // 中间件：记录请求耗时
   func loggingMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           start := time.Now()
           next.ServeHTTP(w, r) // 调用下一个处理器
           log.Printf("耗时: %v", time.Since(start))
       })
   }
   
   // 使用：http.Handle("/", loggingMiddleware(handler))
   ```

3. **题目**：`html/template`的自动转义机制是如何工作的？在什么场景下需要手动关闭转义（请举例）？可能带来什么风险？
   **答案**：自动转义根据变量所处上下文（HTML 文本、JS、CSS 等）识别并转义特殊字符（如`<`→`<`）。
   需手动关闭转义的场景：输出可信的 HTML 片段（如富文本），通过`template.HTML`类型声明：

   go

   ```go
   data := map[string]interface{}{
       "SafeHTML": template.HTML("<h1>可信内容</h1>"),
   }
   ```

   风险：若内容不可信，可能引入 XSS 攻击。

4. **题目**：使用`context`包时，`r.Context()`与`context.Background()`的区别是什么？如何在请求链路中传递超时控制？
   **答案**：

   - `r.Context()`：返回与当前请求绑定的上下文，随请求结束（如客户端断开连接）而取消。
   - `context.Background()`：返回根上下文，无取消信号，通常作为所有上下文的起点。
     传递超时控制示例：

   go

   ```go
   func handler(w http.ResponseWriter, r *http.Request) {
       // 基于请求上下文创建5秒超时的子上下文
       ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
       defer cancel()
       // 将ctx传入后续操作（如数据库查询）
   }
   ```

5. **题目**：如何通过`os`包读取环境变量配置（如数据库地址）？若环境变量不存在，应如何处理以保证程序健壮性？
   **答案**：通过`os.Getenv(key)`读取，不存在时使用默认值：

   go

   ```go
   dbAddr := os.Getenv("DB_ADDR")
   if dbAddr == "" {
       dbAddr = "localhost:5432" // 默认值
   }
   ```

   健壮性处理：关键配置缺失时可终止程序（`log.Fatal`），或通过命令行参数覆盖默认值。

#### 高层（16-20 题）

1. **题目**：深入分析`http.Server`结构体的`ReadTimeout`、`WriteTimeout`和`IdleTimeout`的作用，设置不当可能导致什么问题？
   **答案**：

   - `ReadTimeout`：从连接建立到读取完请求的超时时间（防止客户端发送请求过慢）。
   - `WriteTimeout`：从读取完请求到发送完响应的超时时间（防止响应处理过慢）。
   - `IdleTimeout`：keep-alive 连接的空闲超时时间（释放长期空闲连接）。
     设置不当的问题：过短可能频繁超时（如大文件上传）；过长可能导致连接泄露或资源耗尽。

2. **题目**：`encoding/json`处理嵌套 JSON 时，若结构体字段类型与 JSON 不匹配（如 int vs string），会返回什么错误？如何优雅处理这类错误？
   **答案**：会返回`json: cannot unmarshal string into Go struct field XXX of type int`错误。
   优雅处理：使用`json.Number`类型接收不确定类型的字段，或自定义`UnmarshalJSON`方法：

   go

   ```go
   type Data struct {
       Value int `json:"value"`
   }
   
   func (d *Data) UnmarshalJSON(data []byte) error {
       var temp struct {
           Value interface{} `json:"value"`
       }
       if err := json.Unmarshal(data, &temp); err != nil {
           return err
       }
       // 处理int或string类型的value
       switch v := temp.Value.(type) {
       case float64:
           d.Value = int(v)
       case string:
           d.Value, _ = strconv.Atoi(v)
       }
       return nil
   }
   ```

3. **题目**：如何实现`html/template`的模板继承（使用`block`和`define`）？相比模板包含（`template`），继承的优势是什么？
   **答案**：实现步骤：

   1. 基础模板（base.html）用

      ```
      block
      ```

      定义可重写块：

      html

      ```html
      {{block "title" .}}默认标题{{end}}
      {{block "content" .}}默认内容{{end}}
      ```

   2. 子模板（home.html）用

      ```
      define
      ```

      重写块：

      html

      ```html
      {{template "base.html" .}}
      {{define "title"}}首页{{end}}
      {{define "content"}}首页内容{{end}}
      ```

   优势：子模板只需关注差异部分，减少重复代码；结构更清晰（单继承关系）。

4. **题目**：基于`net/http`设计一个支持路由参数（如`/user/:id`）的简易路由，需要处理哪些核心问题（如路由匹配、参数提取）？
   **答案**：核心问题及解决方案：

   - 路由匹配：解析路径参数（如`:id`），使用前缀树或正则匹配 URL。
   - 参数提取：匹配成功后将参数（如`id=123`）存入`http.Request`上下文（`context`）。
     简易实现示例：

   go

   ```go
   type Router struct {
       routes map[string]http.HandlerFunc
   }
   
   func (r *Router) Handle(pattern string, handler http.HandlerFunc) {
       r.routes[pattern] = handler
   }
   
   func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
       for pattern, handler := range r.routes {
           // 简化的参数匹配（实际需用正则）
           if strings.HasPrefix(req.URL.Path, pattern[:len(pattern)-3]) {
               // 提取参数（如从/user/123中提取id=123）
               id := strings.TrimPrefix(req.URL.Path, "/user/")
               // 将参数存入上下文
               ctx := context.WithValue(req.Context(), "id", id)
               handler(w, req.WithContext(ctx))
               return
           }
       }
       http.NotFound(w, req)
   }
   ```

5. **题目**：结合`context`、`net/http`和`log`，设计一个请求链路追踪方案：如何在日志中关联同一请求的所有操作（如请求 ID）？
   **答案**：方案步骤：

   1. 中间件生成唯一请求 ID（如 UUID），存入

      ```
      context
      ```

      和响应头：

      go

      ```go
      func traceMiddleware(next http.Handler) http.Handler {
          return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
              reqID := uuid.New().String() // 需引入UUID库
              ctx := context.WithValue(r.Context(), "reqID", reqID)
              w.Header().Set("X-Request-ID", reqID)
              next.ServeHTTP(w, r.WithContext(ctx))
          })
      }
      ```

   2. 封装日志函数，从

      ```
      context
      ```

      中获取请求 ID 并输出：

      go

      ```go
      func logWithReqID(ctx context.Context, msg string) {
          reqID, _ := ctx.Value("reqID").(string)
          log.Printf("[%s] %s", reqID, msg)
      }
      ```

   3. 在所有处理器和子函数中传递`context`，使用`logWithReqID`记录日志，实现链路关联。

### 二、场景题与答案

#### 基础场景（1-5 题）

1. **题目**：使用`net/http`实现一个简单的 GET 接口`/hello`，返回 "Hello, [name]"（其中`name`为 URL 查询参数，默认值为 "Guest"）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "fmt"
       "net/http"
   )
   
   func helloHandler(w http.ResponseWriter, r *http.Request) {
       if r.Method != http.MethodGet {
           http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           return
       }
       name := r.URL.Query().Get("name")
       if name == "" {
           name = "Guest"
       }
       fmt.Fprintf(w, "Hello, %s", name)
   }
   
   func main() {
       http.HandleFunc("/hello", helloHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

2. **题目**：编写一个接口`/user`，接收 POST 请求的 JSON 数据（包含`Name`和`Age`字段），并返回同样的 JSON 数据（使用`encoding/json`）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "encoding/json"
       "net/http"
   )
   
   type User struct {
       Name string `json:"name"`
       Age  int    `json:"age"`
   }
   
   func userHandler(w http.ResponseWriter, r *http.Request) {
       if r.Method != http.MethodPost {
           http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           return
       }
       var u User
       if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
           http.Error(w, "解析失败: "+err.Error(), http.StatusBadRequest)
           return
       }
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(u)
   }
   
   func main() {
       http.HandleFunc("/user", userHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

3. **题目**：用`html/template`渲染一个动态页面`/articles`，展示包含标题和内容的文章列表（数据为硬编码的切片）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "html/template"
       "net/http"
   )
   
   type Article struct {
       Title   string
       Content string
   }
   
   func articlesHandler(w http.ResponseWriter, r *http.Request) {
       articles := []Article{
           {Title: "Go入门", Content: "Go是一门简洁的语言"},
           {Title: "Web开发", Content: "使用net/http构建服务"},
       }
       tpl := `
       <html>
           <body>
               <h1>文章列表</h1>
               {{range .}}
                   <h3>{{.Title}}</h3>
                   <p>{{.Content}}</p>
               {{end}}
           </body>
       </html>
       `
       tmpl, err := template.New("articles").Parse(tpl)
       if err != nil {
           http.Error(w, "模板错误", http.StatusInternalServerError)
           return
       }
       tmpl.Execute(w, articles)
   }
   
   func main() {
       http.HandleFunc("/articles", articlesHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

4. **题目**：实现一个接口`/sum`，接收 URL 参数`a`和`b`（整数），返回两数之和（使用`strconv`处理参数转换）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "fmt"
       "net/http"
       "strconv"
   )
   
   func sumHandler(w http.ResponseWriter, r *http.Request) {
       aStr := r.URL.Query().Get("a")
       bStr := r.URL.Query().Get("b")
       a, err1 := strconv.Atoi(aStr)
       b, err2 := strconv.Atoi(bStr)
       if err1 != nil || err2 != nil {
           http.Error(w, "参数必须为整数", http.StatusBadRequest)
           return
       }
       fmt.Fprintf(w, "%d", a+b)
   }
   
   func main() {
       http.HandleFunc("/sum", sumHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

5. **题目**：使用`log`包记录所有请求的方法、路径和响应状态码，日志同时输出到控制台和文件`access.log`。
   **答案**：

   go

   ```go
   package main
   
   import (
       "log"
       "net/http"
       "os"
   )
   
   type responseRecorder struct {
       http.ResponseWriter
       statusCode int
   }
   
   func (r *responseRecorder) WriteHeader(code int) {
       r.statusCode = code
       r.ResponseWriter.WriteHeader(code)
   }
   
   func loggingMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           rr := &responseRecorder{w, http.StatusOK}
           next.ServeHTTP(rr, r)
           log.Printf("%s %s %d", r.Method, r.URL.Path, rr.statusCode)
       })
   }
   
   func main() {
       // 同时输出到控制台和文件
       file, err := os.OpenFile("access.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
       if err != nil {
           log.Fatal(err)
       }
       defer file.Close()
       log.SetOutput(io.MultiWriter(os.Stdout, file)) // 需导入"io"
   
       http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
           w.Write([]byte("Hello"))
       })
       http.ListenAndServe(":8080", loggingMiddleware(http.DefaultServeMux))
   }
   ```

#### 进阶层场景（6-10 题）

1. **题目**：实现一个静态文件服务器：访问`/static/[filename]`时，返回`./static`目录下对应的文件（如 CSS、JS），需处理文件不存在的情况。
   **答案**：

   go

   ```go
   package main
   
   import (
       "net/http"
       "os"
   )
   
   func staticHandler(w http.ResponseWriter, r *http.Request) {
       // 提取文件名（如从/static/style.css中获取style.css）
       filename := r.URL.Path[len("/static/"):]
       if filename == "" {
           http.Error(w, "文件路径不能为空", http.StatusBadRequest)
           return
       }
       // 读取文件
       data, err := os.ReadFile("./static/" + filename)
       if err != nil {
           http.Error(w, "文件不存在", http.StatusNotFound)
           return
       }
       // 根据文件后缀设置Content-Type（简化版）
       if ext := filepath.Ext(filename); ext == ".css" { // 需导入"path/filepath"
           w.Header().Set("Content-Type", "text/css")
       } else if ext == ".js" {
           w.Header().Set("Content-Type", "application/javascript")
       }
       w.Write(data)
   }
   
   func main() {
       http.HandleFunc("/static/", staticHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

2. **题目**：设计一个用户注册接口`/register`，接收表单数据（`username`、`password`），验证密码长度（至少 6 位），若验证通过返回成功 JSON，否则返回错误信息。
   **答案**：

   go

   ```go
   package main
   
   import (
       "encoding/json"
       "net/http"
   )
   
   func registerHandler(w http.ResponseWriter, r *http.Request) {
       if r.Method != http.MethodPost {
           http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           return
       }
       // 解析表单
       if err := r.ParseForm(); err != nil {
           http.Error(w, "解析失败", http.StatusBadRequest)
           return
       }
       username := r.PostForm.Get("username")
       password := r.PostForm.Get("password")
       // 验证
       if len(password) < 6 {
           w.Header().Set("Content-Type", "application/json")
           w.WriteHeader(http.StatusBadRequest)
           json.NewEncoder(w).Encode(map[string]string{"error": "密码至少6位"})
           return
       }
       // 模拟注册成功
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(map[string]string{"success": "注册成功", "username": username})
   }
   
   func main() {
       http.HandleFunc("/register", registerHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

3. **题目**：使用`html/template`实现模板继承：创建基础模板（包含头部导航），并让`/home`和`/about`页面继承该模板，分别显示不同内容。
   **答案**：
   （1）基础模板（templates/base.html）：

   html

   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>{{block "title" .}}我的网站{{end}}</title>
   </head>
   <body>
       <nav>
           <a href="/home">首页</a>
           <a href="/about">关于</a>
       </nav>
       {{block "content" .}}默认内容{{end}}
   </body>
   </html>
   ```

   （2）首页模板（templates/home.html）：

   html

   ```html
   {{template "base.html" .}}
   {{define "title"}}首页{{end}}
   {{define "content"}}
       <h2>欢迎来到首页</h2>
   {{end}}
   ```

   （3）关于页模板（templates/about.html）：

   html

   ```html
   {{template "base.html" .}}
   {{define "title"}}关于我们{{end}}
   {{define "content"}}
       <h2>关于我们的网站</h2>
   {{end}}
   ```

   （4）Go 代码：

   go

   ```go
   package main
   
   import (
       "html/template"
       "net/http"
   )
   
   var tmpl *template.Template
   
   func init() {
       var err error
       tmpl, err = template.ParseGlob("templates/*.html")
       if err != nil {
           panic(err)
       }
   }
   
   func homeHandler(w http.ResponseWriter, r *http.Request) {
       tmpl.ExecuteTemplate(w, "home.html", nil)
   }
   
   func aboutHandler(w http.ResponseWriter, r *http.Request) {
       tmpl.ExecuteTemplate(w, "about.html", nil)
   }
   
   func main() {
       http.HandleFunc("/home", homeHandler)
       http.HandleFunc("/about", aboutHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

4. **题目**：实现一个带超时控制的接口`/fetch`，接收 URL 参数`url`，使用`http.Client`请求该 URL 并返回结果，若请求超过 3 秒则返回超时错误（结合`context`）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "context"
       "io/ioutil"
       "net/http"
       "time"
   )
   
   func fetchHandler(w http.ResponseWriter, r *http.Request) {
       targetURL := r.URL.Query().Get("url")
       if targetURL == "" {
           http.Error(w, "缺少url参数", http.StatusBadRequest)
           return
       }
       // 创建3秒超时的上下文
       ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
       defer cancel()
       // 基于上下文创建HTTP请求
       req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
       if err != nil {
           http.Error(w, "请求创建失败", http.StatusInternalServerError)
           return
       }
       // 发送请求
       client := &http.Client{}
       resp, err := client.Do(req)
       if err != nil {
           http.Error(w, "请求超时或失败: "+err.Error(), http.StatusRequestTimeout)
           return
       }
       defer resp.Body.Close()
       // 读取并返回结果
       body, err := ioutil.ReadAll(resp.Body)
       if err != nil {
           http.Error(w, "读取响应失败", http.StatusInternalServerError)
           return
       }
       w.Write(body)
   }
   
   func main() {
       http.HandleFunc("/fetch", fetchHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

5. **题目**：编写一个中间件，为所有请求添加`X-Request-ID`响应头（值为随机字符串），并在日志中记录该 ID，实现请求追踪。
   **答案**：

   go

   ```go
   package main
   
   import (
       "log"
       "net/http"
       "github.com/google/uuid" // 需安装：go get github.com/google/uuid
   )
   
   func requestIDMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           // 生成UUID作为请求ID
           reqID := uuid.New().String()
           // 添加响应头
           w.Header().Set("X-Request-ID", reqID)
           // 存入上下文
           ctx := context.WithValue(r.Context(), "reqID", reqID) // 需导入"context"
           // 记录日志
           log.Printf("[%s] %s %s", reqID, r.Method, r.URL.Path)
           // 调用下一个处理器
           next.ServeHTTP(w, r.WithContext(ctx))
       })
   }
   
   func main() {
       http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
           w.Write([]byte("Hello"))
       })
       // 应用中间件
       server := &http.Server{
           Addr:    ":8080",
           Handler: requestIDMiddleware(http.DefaultServeMux),
       }
       server.ListenAndServe()
   }
   ```

#### 高阶层场景（11-15 题）

1. **题目**：设计一个简易的 RESTful API：包含`GET /users`（列表）、`GET /users/:id`（详情）、`POST /users`（创建）、`PUT /users/:id`（更新），使用内存 map 存储数据，需处理各种错误（如用户不存在）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "encoding/json"
       "net/http"
       "strconv"
       "sync"
   )
   
   type User struct {
       ID   int    `json:"id"`
       Name string `json:"name"`
       Age  int    `json:"age"`
   }
   
   var (
       users  = make(map[int]User)
       nextID = 1
       mu     sync.Mutex // 保证并发安全
   )
   
   // GET /users：列表
   func listUsers(w http.ResponseWriter, r *http.Request) {
       mu.Lock()
       defer mu.Unlock()
       userList := make([]User, 0, len(users))
       for _, u := range users {
           userList = append(userList, u)
       }
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(userList)
   }
   
   // GET /users/:id：详情
   func getUser(w http.ResponseWriter, r *http.Request) {
       idStr := r.URL.Path[len("/users/"):]
       id, err := strconv.Atoi(idStr)
       if err != nil {
           http.Error(w, "无效的ID", http.StatusBadRequest)
           return
       }
       mu.Lock()
       u, ok := users[id]
       mu.Unlock()
       if !ok {
           http.Error(w, "用户不存在", http.StatusNotFound)
           return
       }
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(u)
   }
   
   // POST /users：创建
   func createUser(w http.ResponseWriter, r *http.Request) {
       var u User
       if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
           http.Error(w, "解析失败", http.StatusBadRequest)
           return
       }
       mu.Lock()
       u.ID = nextID
       nextID++
       users[u.ID] = u
       mu.Unlock()
       w.Header().Set("Content-Type", "application/json")
       w.WriteHeader(http.StatusCreated)
       json.NewEncoder(w).Encode(u)
   }
   
   // PUT /users/:id：更新
   func updateUser(w http.ResponseWriter, r *http.Request) {
       idStr := r.URL.Path[len("/users/"):]
       id, err := strconv.Atoi(idStr)
       if err != nil {
           http.Error(w, "无效的ID", http.StatusBadRequest)
           return
       }
       var update User
       if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
           http.Error(w, "解析失败", http.StatusBadRequest)
           return
       }
       mu.Lock()
       defer mu.Unlock()
       u, ok := users[id]
       if !ok {
           http.Error(w, "用户不存在", http.StatusNotFound)
           return
       }
       if update.Name != "" {
           u.Name = update.Name
       }
       if update.Age != 0 {
           u.Age = update.Age
       }
       users[id] = u
       json.NewEncoder(w).Encode(u)
   }
   
   func main() {
       http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
           switch r.Method {
           case http.MethodGet:
               listUsers(w, r)
           case http.MethodPost:
               createUser(w, r)
           default:
               http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           }
       })
       http.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
           if r.Method == http.MethodGet {
               getUser(w, r)
           } else if r.Method == http.MethodPut {
               updateUser(w, r)
           } else {
               http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           }
       })
       http.ListenAndServe(":8080", nil)
   }
   ```

2. **题目**：实现一个文件上传接口`/upload`，支持单文件上传（限制类型为图片，大小不超过 2MB），保存到`./uploads`目录，并返回文件访问 URL。
   **答案**：

   go

   ```go
   package main
   
   import (
       "net/http"
       "os"
       "path/filepath"
       "strings"
   )
   
   func uploadHandler(w http.ResponseWriter, r *http.Request) {
       if r.Method != http.MethodPost {
           http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           return
       }
       // 限制上传大小（2MB）
       r.ParseMultipartForm(2 << 20) // 2*1024*1024
       // 获取文件
       file, handler, err := r.FormFile("file")
       if err != nil {
           http.Error(w, "获取文件失败", http.StatusBadRequest)
           return
       }
       defer file.Close()
       // 验证文件类型（图片）
       ext := strings.ToLower(filepath.Ext(handler.Filename))
       allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true}
       if !allowedExts[ext] {
           http.Error(w, "仅支持图片类型（jpg、jpeg、png、gif）", http.StatusBadRequest)
           return
       }
       // 创建上传目录
       if err := os.MkdirAll("./uploads", 0755); err != nil {
           http.Error(w, "创建目录失败", http.StatusInternalServerError)
           return
       }
       // 保存文件
       filename := filepath.Base(handler.Filename)
       savePath := filepath.Join("./uploads", filename)
       dst, err := os.Create(savePath)
       if err != nil {
           http.Error(w, "创建文件失败", http.StatusInternalServerError)
           return
       }
       defer dst.Close()
       // 复制文件内容
       if _, err := io.Copy(dst, file); err != nil { // 需导入"io"
           http.Error(w, "保存文件失败", http.StatusInternalServerError)
           return
       }
       // 返回访问URL
       w.Write([]byte("http://localhost:8080/uploads/" + filename))
   }
   
   func main() {
       // 提供上传文件的访问
       http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))
       http.HandleFunc("/upload", uploadHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

3. **题目**：使用`html/template`和`encoding/json`实现一个动态页面：前端通过 AJAX 请求`/api/news`获取 JSON 数据，后端渲染包含新闻列表的页面，同时支持前端动态加载更多。
   **答案**：
   （1）模板文件（templates/index.html）：

   html

   ```html
   <html>
   <body>
       <h1>新闻列表</h1>
       <div id="news-list"></div>
       <button onclick="loadMore()">加载更多</button>
       <script>
           let page = 1;
           // 初始加载
           loadMore();
           // 加载更多函数
           function loadMore() {
               fetch(`/api/news?page=${page}`)
                   .then(res => res.json())
                   .then(data => {
                       const list = document.getElementById('news-list');
                       data.forEach(news => {
                           const div = document.createElement('div');
                           div.innerHTML = `<h3>${news.Title}</h3><p>${news.Content}</p>`;
                           list.appendChild(div);
                       });
                       page++;
                   });
           }
       </script>
   </body>
   </html>
   ```

   （2）Go 代码：

   go

   

   运行

   

   

   

   

   ```go
   package main
   
   import (
       "encoding/json"
       "html/template"
       "net/http"
       "strconv"
   )
   
   type News struct {
       Title   string `json:"title"`
       Content string `json:"content"`
   }
   
   // 模拟新闻数据
   var allNews = []News{
       {Title: "新闻1", Content: "内容1"},
       {Title: "新闻2", Content: "内容2"},
       {Title: "新闻3", Content: "内容3"},
       {Title: "新闻4", Content: "内容4"},
       {Title: "新闻5", Content: "内容5"},
   }
   
   // 渲染页面
   func indexHandler(w http.ResponseWriter, r *http.Request) {
       tmpl, _ := template.ParseFiles("templates/index.html")
       tmpl.Execute(w, nil)
   }
   
   // 提供JSON接口
   func newsAPIHandler(w http.ResponseWriter, r *http.Request) {
       pageStr := r.URL.Query().Get("page")
       page, err := strconv.Atoi(pageStr)
       if err != nil || page < 1 {
           page = 1
       }
       // 分页逻辑（每页2条）
       start := (page - 1) * 2
       end := start + 2
       if start >= len(allNews) {
           w.Header().Set("Content-Type", "application/json")
           w.Write([]byte("[]"))
           return
       }
       if end > len(allNews) {
           end = len(allNews)
       }
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(allNews[start:end])
   }
   
   func main() {
       http.HandleFunc("/", indexHandler)
       http.HandleFunc("/api/news", newsAPIHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

4. **题目**：设计一个带缓存的接口`/products`，首次请求从内存获取数据（模拟数据库查询），并缓存结果 5 分钟，后续请求直接返回缓存（使用`context`控制缓存过期）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "context"
       "encoding/json"
       "net/http"
       "sync"
       "time"
   )
   
   type Product struct {
       ID   int    `json:"id"`
       Name string `json:"name"`
   }
   
   var (
       cache       []Product
       cacheExpiry time.Time
       mu          sync.RWMutex
   )
   
   // 模拟数据库查询
   func fetchProducts() []Product {
       time.Sleep(1 * time.Second) // 模拟耗时
       return []Product{
           {ID: 1, Name: "商品1"},
           {ID: 2, Name: "商品2"},
       }
   }
   
   func productsHandler(w http.ResponseWriter, r *http.Request) {
       mu.RLock()
       // 检查缓存是否有效（未过期且存在）
       if time.Now().Before(cacheExpiry) && len(cache) > 0 {
           w.Header().Set("Content-Type", "application/json")
           json.NewEncoder(w).Encode(cache)
           mu.RUnlock()
           return
       }
       mu.RUnlock()
   
       // 缓存无效，重新获取并更新缓存
       mu.Lock()
       defer mu.Unlock()
       // 双重检查（防止并发重复查询）
       if time.Now().Before(cacheExpiry) && len(cache) > 0 {
           json.NewEncoder(w).Encode(cache)
           return
       }
       // 模拟查询
       products := fetchProducts()
       // 更新缓存（5分钟过期）
       cache = products
       cacheExpiry = time.Now().Add(5 * time.Minute)
       // 返回结果
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(products)
   }
   
   func main() {
       http.HandleFunc("/products", productsHandler)
       http.ListenAndServe(":8080", nil)
   }
   ```

5. **题目**：实现一个简易的认证中间件：访问`/admin`时，检查请求头`Authorization`是否为`Bearer [token]`，验证通过则允许访问，否则返回 401；同时实现`/login`接口用于获取 token（token 有效期 1 小时）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "encoding/json"
       "net/http"
       "strings"
       "time"
   
       "github.com/golang-jwt/jwt/v5" // 需安装：go get github.com/golang-jwt/jwt/v5
   )
   
   const secretKey = "my-secret-key" // 实际应使用环境变量
   
   // 生成JWT token
   func generateToken() (string, error) {
       claims := jwt.MapClaims{
           "exp": time.Now().Add(1 * time.Hour).Unix(), // 1小时过期
       }
       token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
       return token.SignedString([]byte(secretKey))
   }
   
   // 认证中间件
   func authMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           authHeader := r.Header.Get("Authorization")
           if authHeader == "" {
               http.Error(w, "未提供token", http.StatusUnauthorized)
               return
           }
           // 解析Bearer token
           parts := strings.Split(authHeader, " ")
           if len(parts) != 2 || parts[0] != "Bearer" {
               http.Error(w, "invalid authorization format", http.StatusUnauthorized)
               return
           }
           // 验证token
           token, err := jwt.Parse(parts[1], func(t *jwt.Token) (interface{}, error) {
               return []byte(secretKey), nil
           })
           if err != nil || !token.Valid {
               http.Error(w, "无效的token", http.StatusUnauthorized)
               return
           }
           // 验证通过，调用下一个处理器
           next.ServeHTTP(w, r)
       })
   }
   
   // 登录接口：获取token
   func loginHandler(w http.ResponseWriter, r *http.Request) {
       if r.Method != http.MethodPost {
           http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
           return
       }
       // 简化：不验证用户名密码，直接返回token
       token, err := generateToken()
       if err != nil {
           http.Error(w, "生成token失败", http.StatusInternalServerError)
           return
       }
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(map[string]string{"token": token})
   }
   
   // 受保护的admin接口
   func adminHandler(w http.ResponseWriter, r *http.Request) {
       w.Write([]byte("欢迎访问管理员页面"))
   }
   
   func main() {
       http.HandleFunc("/login", loginHandler)
       http.Handle("/admin", authMiddleware(http.HandlerFunc(adminHandler)))
       http.ListenAndServe(":8080", nil)
   }
   ```

以上题目和答案覆盖了 Go Web 标准库的核心知识点与实战场景，从基础到高级逐步深入，可用于学习巩固或面试准备。