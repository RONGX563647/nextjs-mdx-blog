`html/template` 是 Go 标准库中用于动态生成 HTML 页面的核心包，专为 Web 场景设计，相比通用的 `text/template`，它内置了 **XSS 防护机制**（自动转义特殊字符），能有效避免跨站脚本攻击，是 Go Web 开发中渲染 HTML 的首选工具。

### 一、核心特性与优势

1. **自动转义**：对输出的变量自动转义 HTML 特殊字符（如 `<` 转为 `<`、`>` 转为 `>` 等），防止 XSS 攻击。
2. **模板嵌套**：支持模板包含（`{{template}}`）、继承（`{{define}}` + `{{block}}`），便于复用公共组件（如头部、尾部）。
3. **数据绑定**：可将 Go 中的数据结构（结构体、map、切片等）传入模板，动态生成内容。
4. **丰富语法**：支持变量、条件判断、循环、管道、自定义函数等，满足复杂页面逻辑。

### 二、基本用法：从解析到渲染

`html/template` 的使用流程可概括为：**定义模板内容** → **解析模板** → **传入数据执行渲染**。

#### 1. 模板解析：`Parse` 与 `ParseFiles`

模板需要先被解析为内部可执行的结构，常用解析方法：

- `template.New(name).Parse(tplString)`：从字符串解析模板。
- `template.ParseFiles(file1, file2...)`：从文件解析模板（支持多个文件）。
- `template.ParseGlob(pattern)`：通过通配符批量解析模板文件（如 `templates/*.html`）。

#### 2. 执行渲染：`Execute` 与 `ExecuteTemplate`

解析完成后，通过 `Execute`（渲染默认模板）或 `ExecuteTemplate`（渲染指定名称的模板）将数据注入模板，输出到 `io.Writer`（通常是 `http.ResponseWriter`）。

**示例：基础渲染流程**

go

```go
package main

import (
    "html/template"
    "net/http"
)

// 定义要传递给模板的数据结构
type User struct {
    Name  string
    Age   int
    IsVIP bool
}

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // 1. 定义模板内容（可替换为从文件解析：template.ParseFiles("user.html")）
        tplContent := `
        <html>
            <body>
                <h1>用户信息</h1>
                <p>姓名：{{.Name}}</p>
                <p>年龄：{{.Age}}</p>
                <p>会员状态：{{if .IsVIP}}是{{else}}否{{end}}</p>
            </body>
        </html>
        `
        
        // 2. 解析模板
        tmpl, err := template.New("user").Parse(tplContent)
        if err != nil {
            http.Error(w, "模板解析失败: "+err.Error(), http.StatusInternalServerError)
            return
        }
        
        // 3. 准备数据
        user := User{Name: "张三", Age: 28, IsVIP: true}
        
        // 4. 执行渲染（将数据注入模板，输出到w）
        if err := tmpl.Execute(w, user); err != nil {
            http.Error(w, "模板渲染失败: "+err.Error(), http.StatusInternalServerError)
        }
    })

    http.ListenAndServe(":8080", nil)
}
```

### 三、模板语法详解

模板语法以 `{{` 和 `}}` 为分隔符，内部支持多种操作，核心语法如下：

#### 1. 变量引用：`{{.}}`

- `.` 代表当前上下文（传入模板的根数据），类似 JavaScript 中的 `this`。
- 访问结构体字段：`{{.FieldName}}`（字段必须为导出字段，首字母大写）。
- 访问 map 键值：`{{.MapKey}}`。
- 访问切片 / 数组元素：`{{.SliceIndex}}`（如 `{{.Users.0.Name}}`）。

**示例**：

go

```go
data := map[string]interface{}{
    "Title": "首页",
    "Items": []string{"苹果", "香蕉", "橙子"},
}
```

模板中使用：

```html
<h1>{{.Title}}</h1>
<p>第一个水果：{{.Items.0}}</p>
```

#### 2. 管道（Pipelines）：`|`

类似 Unix 管道，将前一个操作的结果作为后一个操作的输入，可串联多个函数。

**示例**：

html

```html
<!-- 将字符串转为大写（使用内置函数upper） -->
<p>{{.Name | upper}}</p>

<!-- 先取长度，再格式化 -->
<p>名称长度：{{.Name | len | printf "共%d个字符"}}</p>
```

#### 3. 条件判断：`if-else`

语法：

html

```html
{{if 条件}}
    条件为真时显示
{{else if 另一个条件}}
    另一个条件为真时显示
{{else}}
    所有条件为假时显示
{{end}}
```

**示例**：

html

```html
{{if .IsVIP}}
    <p>尊贵的会员您好！</p>
{{else if .Age >= 18}}
    <p>成年用户您好！</p>
{{else}}
    <p>未成年用户请在监护人陪同下使用</p>
{{end}}
```

> 注意：条件为 **false** 的情况包括：`false`、`0`、`""`、`nil`、空切片 / 映射等。

#### 4. 循环：`range`

用于遍历切片、数组、map 或通道，语法：

html

```html
{{range 集合}}
    {{.}} <!-- 遍历的当前元素 -->
{{end}}
```

**进阶用法**（获取索引和元素）：

html

```html
{{range $index, $item := .Items}}
    <p>{{$index}}: {{$item}}</p> <!-- $index是索引，$item是元素 -->
{{end}}
```

**处理空集合**：

html

```html
{{range .Items}}
    <p>{{.}}</p>
{{else}}
    <p>集合为空</p> <!-- 当.Items为空时执行 -->
{{end}}
```

#### 5. 模板复用：`template` 与 `define`

通过 `{{define "模板名"}}` 定义可复用的模板片段，再通过 `{{template "模板名" 数据}}` 引入。

**示例**：公共头部模板

html

```html
<!-- 定义头部模板（可放在单独文件 header.html 中） -->
{{define "header"}}
    <header>
        <h1>我的网站</h1>
        <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
        </nav>
    </header>
{{end}}

<!-- 在其他模板中引入 -->
{{template "header" .}} <!-- . 表示将当前数据传递给header模板 -->
```

#### 6. 模板继承：`block`

`{{block "块名" 数据}}默认内容{{end}}` 定义一个可被重写的模板块，子模板可通过 `{{define "块名"}}` 重写内容，实现模板继承（类似其他框架的 `extends`）。

**示例**：基础模板（base.html）

html

```html
<!-- base.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{{block "title" .}}默认标题{{end}}</title>
</head>
<body>
    {{block "content" .}}
        默认内容
    {{end}}
</body>
</html>
```

**子模板（home.html）继承并重写**：

html

```html
<!-- home.html -->
{{template "base.html" .}} <!-- 继承基础模板 -->

{{define "title"}}首页{{end}} <!-- 重写title块 -->

{{define "content"}} <!-- 重写content块 -->
    <h2>欢迎来到首页</h2>
    <p>{{.Message}}</p>
{{end}}
```

解析与使用：

go

```go
// 解析基础模板和子模板（注意顺序：先解析被继承的模板）
tmpl, err := template.ParseFiles("base.html", "home.html")
if err != nil { /* 处理错误 */ }

// 渲染子模板（实际会使用重写后的块）
tmpl.ExecuteTemplate(w, "home.html", map[string]string{"Message": "Hello World"})
```

#### 7. 注释：`{{/* 注释内容 */}}`

模板中的注释，不会被渲染到输出结果中：

html

```html
{{/* 这是一段模板注释，浏览器不会显示 */}}
<p>可见内容</p>
```

### 四、安全与转义机制

`html/template` 的核心安全特性是 **上下文感知的自动转义**：根据变量所在的位置（HTML 文本、属性、JS、CSS 等），自动转义特殊字符，防止 XSS 攻击。

#### 1. 自动转义示例

当变量包含 HTML 标签时，默认会被转义：

go

```go
data := map[string]string{
    "Content": "<script>alert('xss')</script>",
}
```

模板中直接使用：

html

```html
<p>{{.Content}}</p>
```

渲染结果（自动转义后）：

html

```html
<p>&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</p>
```

浏览器会显示原始文本，而非执行脚本，避免 XSS。

#### 2. 手动关闭转义：`template.HTML`

若需在模板中输出原始 HTML（如可信的富文本），需将变量类型声明为 `template.HTML`（明确告知模板引擎内容安全）：

go

```go
import "html/template"

data := map[string]interface{}{
    "SafeContent": template.HTML("<h3>安全的HTML</h3>"), // 声明为安全HTML
}
```

模板中使用：

html

```html
<p>{{.SafeContent}}</p>
```

渲染结果（不转义）：

html

```html
<p><h3>安全的HTML</h3></p>
```

> 警告：仅对完全可信的内容使用 `template.HTML`，否则会引入 XSS 风险。

### 五、自定义函数

模板支持注册自定义函数，扩展模板能力（如格式化日期、计算等），通过 `Funcs` 方法注册。

**示例：注册自定义函数**

go



```go
package main

import (
    "html/template"
    "net/http"
    "strings"
)

func main() {
    // 1. 定义自定义函数：将字符串转为小写
    lowerFunc := func(s string) string {
        return strings.ToLower(s)
    }

    // 2. 注册函数（注意：需在解析模板前注册）
    tmpl := template.New("test").Funcs(template.FuncMap{
        "lower": lowerFunc, // 键为模板中使用的函数名，值为函数
    })

    // 3. 解析模板
    tmpl, err := tmpl.Parse(`<p>{{.Name | lower}}</p>`)
    if err != nil { /* 处理错误 */ }

    // 4. 渲染
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        data := map[string]string{"Name": "GO WEB"}
        tmpl.Execute(w, data) // 输出: <p>go web</p>
    })

    http.ListenAndServe(":8080", nil)
}
```

### 六、最佳实践

1. **模板文件组织**：

   - 将公共组件（头部、尾部、导航）放在 `templates/layout` 目录。
   - 页面模板放在 `templates/pages` 目录。
   - 用 `ParseGlob` 批量解析：`template.ParseGlob("templates/**/*.html")`。

2. **错误处理**：

   - 解析模板时必须检查错误（避免语法错误导致运行时失败）。
   - 执行渲染时也需检查错误（如数据类型不匹配）。

3. **性能优化**：

   - 模板解析耗性能，建议程序启动时一次性解析所有模板，缓存复用。

   - 示例：

     go

     ```go
     var globalTmpl *template.Template
     
     func init() {
         // 程序启动时解析所有模板
         var err error
         globalTmpl, err = template.ParseGlob("templates/*.html")
         if err != nil {
             log.Fatal("模板解析失败:", err)
         }
     }
     ```

4. **安全注意**：

   - 避免在模板中使用 `template.HTML` 处理不可信内容。
   - 敏感操作（如权限判断）尽量在 Go 代码中完成，而非模板中。

### 总结

`html/template` 是 Go Web 开发中生成动态 HTML 的强大工具，其自动转义机制保障了 Web 安全，而模板复用、继承等特性提升了开发效率。掌握其语法和最佳实践，能高效构建可维护、安全的 Web 页面。实际开发中，建议结合文件组织和缓存策略，进一步提升性能和可扩展性。