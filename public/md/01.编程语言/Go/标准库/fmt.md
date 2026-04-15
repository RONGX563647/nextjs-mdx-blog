### Go 语言标准库`fmt`包示例展示

#### 1. 普通占位符示例

go

```go
package main

import "fmt"

type Website struct {
    Name string
}

func main() {
    site := Website{Name: "studygolang"}
    fmt.Printf("%v\n", site)   // 默认格式：{studygolang}
    fmt.Printf("%+v\n", site)  // 带字段名：{Name:studygolang}
    fmt.Printf("%#v\n", site)  // Go语法表示：main.Website{Name:"studygolang"}
    fmt.Printf("%T\n", site)   // 类型表示：main.Website
    fmt.Printf("%%\n")         // 输出百分号：%
}
```

#### 2. 布尔占位符示例

go



运行









```go
package main

import "fmt"

func main() {
    fmt.Printf("%t\n", true)   // 输出：true
    fmt.Printf("%t\n", false)  // 输出：false
}
```

#### 3. 整数占位符示例

go



运行









```go
package main

import "fmt"

func main() {
    fmt.Printf("%b\n", 5)      // 二进制：101
    fmt.Printf("%c\n", 0x4E2D) // Unicode字符：中
    fmt.Printf("%d\n", 0x12)   // 十进制：18
    fmt.Printf("%o\n", 10)     // 八进制：12
    fmt.Printf("%q\n", 0x4E2D) // 带单引号字符：'中'
    fmt.Printf("%x\n", 13)     // 十六进制小写：d
    fmt.Printf("%X\n", 13)     // 十六进制大写：D
    fmt.Printf("%U\n", 0x4E2D) // Unicode格式：U+4E2D
}
```

#### 4. 浮点数占位符示例

go



运行









```go
package main

import "fmt"

func main() {
    fmt.Printf("%e\n", 10.2)   // 科学计数法(e)：1.020000e+01
    fmt.Printf("%E\n", 10.2)   // 科学计数法(E)：1.020000E+01
    fmt.Printf("%f\n", 10.2)   // 小数形式：10.200000
    fmt.Printf("%g\n", 10.20)  // 紧凑格式：10.2
    fmt.Printf("%G\n", 10.20+2i) // 复数格式：(10.2+2i)
}
```

#### 5. 字符串与字节切片示例

go



运行









```go
package main

import "fmt"

func main() {
    str := "golang"
    fmt.Printf("%s\n", str)    // 直接输出：golang
    fmt.Printf("%q\n", str)    // 带双引号："golang"
    fmt.Printf("%x\n", str)    // 十六进制小写：676f6c616e67
    fmt.Printf("%X\n", str)    // 十六进制大写：676F6C616E67
}
```

#### 6. 指针占位符示例

go



运行









```go
package main

import "fmt"

func main() {
    num := 100
    fmt.Printf("%p\n", &num)   // 指针地址：0xc00001a0a8（地址值可能不同）
}
```

#### 7. Stringer 接口示例

go



运行









```go
package main

import (
    "bytes"
    "fmt"
    "strconv"
)

type Person struct {
    Name string
    Age  int
    Sex  int // 0:男, 1:女
}

// 实现Stringer接口
func (p *Person) String() string {
    buf := bytes.NewBufferString("This is ")
    buf.WriteString(p.Name + ", ")
    if p.Sex == 0 {
        buf.WriteString("He ")
    } else {
        buf.WriteString("She ")
    }
    buf.WriteString("is " + strconv.Itoa(p.Age) + " years old.")
    return buf.String()
}

func main() {
    p := &Person{"Alice", 25, 1}
    fmt.Println(p) // 调用String()：This is Alice, She is 25 years old.
}
```

#### 8. Formatter 接口示例

go



运行









```go
package main

import (
    "bytes"
    "fmt"
    "strconv"
)

type Person struct {
    Name string
    Age  int
    Sex  int
}

func (p *Person) String() string {
    return fmt.Sprintf("%s(%d岁)", p.Name, p.Age)
}

// 实现Formatter接口
func (p *Person) Format(f fmt.State, c rune) {
    switch c {
    case 'L': // 自定义占位符%L
        f.Write([]byte(fmt.Sprintf("Person: %s, 年龄: %d", p.Name, p.Age)))
    default:
        f.Write([]byte(p.String())) // 其他占位符使用默认String()
    }
}

func main() {
    p := &Person{"Bob", 30, 0}
    fmt.Printf("%v\n", p)  // 调用Format默认逻辑：Bob(30岁)
    fmt.Printf("%L\n", p)  // 调用自定义逻辑：Person: Bob, 年龄: 30
}
```

#### 9. GoStringer 接口示例

go



运行









```go
package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

// 实现GoStringer接口
func (p *Person) GoString() string {
    return fmt.Sprintf("&Person{Name: %q, Age: %d}", p.Name, p.Age)
}

func main() {
    p := &Person{"Charlie", 28}
    fmt.Printf("%#v\n", p) // 调用GoString()：&Person{Name: "Charlie", Age: 28}
}
```

#### 10. Scan 序列函数示例

go



运行









```go
package main

import "fmt"

func main() {
    // Sscan示例
    var name string
    var age int
    n, _ := fmt.Sscan("David 35", &name, &age)
    fmt.Printf("Sscan: %d个值 -> %s, %d\n", n, name, age) // 2个值 -> David, 35

    // Sscanf示例
    n, _ = fmt.Sscanf("Eve,28", "%s,%d", &name, &age)
    fmt.Printf("Sscanf: %d个值 -> %s, %d\n", n, name, age) // 2个值 -> Eve, 28

    // Sscanln示例
    n, _ = fmt.Sscanln("Frank 40", &name, &age)
    fmt.Printf("Sscanln: %d个值 -> %s, %d\n", n, name, age) // 2个值 -> Frank, 40
}
```

#### 11. 综合示例

go



运行









```go
package main

import (
    "fmt"
    "os"
)

// 定义自定义类型并实现多个接口
type Book struct {
    Title  string
    Author string
    Pages  int
}

// 实现Stringer接口
func (b Book) String() string {
    return fmt.Sprintf("%s by %s", b.Title, b.Author)
}

// 实现Formatter接口
func (b Book) Format(f fmt.State, c rune) {
    switch c {
    case 'D': // 详细信息格式
        f.Write([]byte(fmt.Sprintf("%s (%d页) - %s", b.Title, b.Pages, b.Author)))
    default:
        f.Write([]byte(b.String()))
    }
}

// 实现GoStringer接口
func (b Book) GoString() string {
    return fmt.Sprintf("Book{Title: %q, Author: %q, Pages: %d}", b.Title, b.Author, b.Pages)
}

func main() {
    book := Book{"Go Programming", "John Doe", 350}

    // 1. 打印基础信息
    fmt.Println("=== 基础打印 ===")
    fmt.Printf("%%v: %v\n", book)    // Go Programming by John Doe
    fmt.Printf("%%+v: %+v\n", book)  // {Title:Go Programming Author:John Doe Pages:350}
    fmt.Printf("%%#v: %#v\n", book)  // Book{Title: "Go Programming", Author: "John Doe", Pages: 350}
    fmt.Printf("%%T: %T\n", book)    // main.Book

    // 2. 自定义Formatter使用
    fmt.Println("\n=== 自定义格式 ===")
    fmt.Printf("%%D: %D\n", book)    // Go Programming (350页) - John Doe

    // 3. 输出到文件（Fprint示例）
    fmt.Println("\n=== 文件输出 ===")
    file, _ := os.Create("book.txt")
    defer file.Close()
    fmt.Fprintf(file, "Book Info: %s (Pages: %d)\n", book.Title, book.Pages)
    fmt.Println("已将书籍信息写入book.txt")

    // 4. 字符串格式化（Sprint示例）
    fmt.Println("\n=== 字符串格式化 ===")
    str := fmt.Sprintf("Summary: %s has %d pages", book.Title, book.Pages)
    fmt.Println(str) // Summary: Go Programming has 350 pages

    // 5. 扫描示例
    fmt.Println("\n=== 扫描示例 ===")
    var title string
    var author string
    var pages int
    fmt.Sscanf("The Go Bible,Alice Smith,420", "%s,%s,%d", &title, &author, &pages)
    fmt.Printf("扫描结果: %s by %s, %d页\n", title, author, pages)
}
```







![img](data:image/png;base64,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)

**综合示例说明**：
该示例展示了`fmt`包的核心功能，包括占位符使用、自定义接口（`Stringer`/`Formatter`/`GoStringer`）实现、输出到文件（`Fprint`）、字符串格式化（`Sprint`）及扫描功能（`Sscanf`），覆盖了`fmt`包的主要使用场景。

### 12. 宽度与精度控制示例

go



运行









```go
package main

import "fmt"

func main() {
    // 整数宽度控制
    fmt.Printf("|%5d|\n", 123)   // 右对齐，宽度5：|  123|
    fmt.Printf("|%-5d|\n", 123)  // 左对齐，宽度5：|123  |
    
    // 浮点数精度控制
    fmt.Printf("|%6.2f|\n", 3.1415) // 宽度6，保留2位小数：|  3.14|
    fmt.Printf("|%g|\n", 3.1400)    // 自动去除末尾0：3.14
    
    // 字符串宽度与精度
    fmt.Printf("|%10s|\n", "hello")  // 宽度10，右对齐：|     hello|
    fmt.Printf("|%.3s|\n", "hello")  // 精度3，截断：|hel|
}
```

### 13. 标记用法示例

go



运行









```go
package main

import "fmt"

func main() {
    // +标记：显示正负号
    fmt.Printf("%+d\n", 123)  // +123
    fmt.Printf("%+d\n", -123) // -123
    
    // #标记：备用格式
    fmt.Printf("%#o\n", 8)    // 010（八进制前缀）
    fmt.Printf("%#x\n", 16)   // 0x10（十六进制前缀）
    fmt.Printf("%#q\n", "a")  // 'a'（单引号包裹）
    
    // 0标记：前导0填充
    fmt.Printf("%05d\n", 123) // 00123
    fmt.Printf("%08.2f\n", 3.14) // 0003.14
    
    // 空格标记：正负号位置留空
    fmt.Printf("% d\n", 123)  //  123（正数前加空格）
    fmt.Printf("% d\n", -123) // -123
}
```

### 14. 复数格式化示例

go



运行









```go
package main

import "fmt"

func main() {
    c := 3 + 4i
    fmt.Printf("%v\n", c)   // (3+4i)
    fmt.Printf("%+v\n", c)  // (3+4i)
    fmt.Printf("%T\n", c)   // complex128
    fmt.Printf("%g\n", c)   // (3+4i)
    fmt.Printf("%e\n", c)   // (3.000000e+00+4.000000e+00i)
}
```

### 15. 切片与数组格式化示例

go



运行









```go
package main

import "fmt"

func main() {
    arr := [3]int{1, 2, 3}
    slice := []string{"a", "b", "c"}
    
    fmt.Printf("%v\n", arr)    // [1 2 3]
    fmt.Printf("%+v\n", slice) // [a b c]
    fmt.Printf("%#v\n", arr)   // [3]int{1, 2, 3}
    fmt.Printf("%T\n", slice)  // []string
}
```

### 16. 映射（map）格式化示例

go



运行









```go
package main

import "fmt"

func main() {
    m := map[string]int{"a": 1, "b": 2}
    fmt.Printf("%v\n", m)    // map[a:1 b:2]
    fmt.Printf("%+v\n", m)   // map[a:1 b:2]
    fmt.Printf("%#v\n", m)   // map[string]int{"a":1, "b":2}（顺序可能不同）
    fmt.Printf("%T\n", m)    // map[string]int
}
```

### 17. 指针与接口格式化示例

go



运行









```go
package main

import "fmt"

func main() {
    num := 100
    ptr := &num
    var i interface{} = "hello"
    
    fmt.Printf("%v\n", ptr)   // 0xc00001a0a8（指针地址）
    fmt.Printf("%p\n", ptr)   // 0xc00001a0a8（同%v）
    fmt.Printf("%T\n", ptr)   // *int
    fmt.Printf("%v\n", i)     // hello（接口内部值）
    fmt.Printf("%T\n", i)     // string（接口内部类型）
}
```

### 18. Println 自动添加空格示例

go



运行









```go
package main

import "fmt"

func main() {
    fmt.Println("a", "b", "c") // a b c（自动添加空格）
    fmt.Println(1, 2, 3)       // 1 2 3
    fmt.Println("x", 10, true) // x 10 true
}
```

### 19. Sprint 系列函数示例

go



运行









```go
package main

import "fmt"

func main() {
    s1 := fmt.Sprint("a", 1, true)   // 拼接：a1true
    s2 := fmt.Sprintln("a", 1, true) // 带空格和换行：a 1 true（返回字符串不含换行符）
    s3 := fmt.Sprintf("name: %s, age: %d", "Tom", 20) // 格式化：name: Tom, age: 20
    
    fmt.Println(s1)
    fmt.Println(s2)
    fmt.Println(s3)
}
```

### 20. Fprint 输出到文件示例

go



运行









```go
package main

import (
    "fmt"
    "os"
)

func main() {
    file, _ := os.Create("output.txt")
    defer file.Close()
    
    // 输出到文件
    fmt.Fprint(file, "直接输出内容")
    fmt.Fprintln(file, " 带换行")
    fmt.Fprintf(file, "格式化输出：%d + %d = %d", 2, 3, 5)
}
```

### 21. 错误处理示例（格式化错误）

go



运行









```go
package main

import "fmt"

func main() {
    // 类型不匹配
    fmt.Printf("%d\n", "not a number") // %!d(string=not a number)
    
    // 参数数量不匹配
    fmt.Printf("hello %s\n", "a", "b") // hello a%!(EXTRA string=b)
    fmt.Printf("hello %s %d\n", "a")   // hello a %!d(MISSING)
}
```

### 22. 扫描多行输入示例

go



运行









```go
package main

import "fmt"

func main() {
    var name string
    var age int
    fmt.Println("请输入姓名和年龄（空格分隔）：")
    n, err := fmt.Scan(&name, &age) // 从标准输入读取
    if err != nil {
        fmt.Println("扫描错误：", err)
    } else {
        fmt.Printf("读取了%d个值：%s, %d\n", n, name, age)
    }
}
```

### 23. Scanf 格式匹配示例

go



运行









```go
package main

import "fmt"

func main() {
    var year, month, day int
    // 匹配格式：年-月-日
    n, _ := fmt.Sscanf("2024-05-20", "%d-%d-%d", &year, &month, &day)
    fmt.Printf("解析日期：%d年%d月%d日（共%d个值）\n", year, month, day, n) // 2024年5月20日（共3个值）
}
```

### 24. 扫描布尔值示例

go



运行









```go
package main

import "fmt"

func main() {
    var b bool
    fmt.Sscanf("true", "%t", &b)
    fmt.Println(b) // true
    
    fmt.Sscanf("false", "%t", &b)
    fmt.Println(b) // false
}
```

### 25. 扫描浮点数示例

go



运行









```go
package main

import "fmt"

func main() {
    var f float64
    fmt.Sscanf("3.1415", "%f", &f)
    fmt.Println(f) // 3.1415
    
    fmt.Sscanf("1e3", "%e", &f)
    fmt.Println(f) // 1000
}
```

### 26. 扫描十六进制与八进制示例

go



运行









```go
package main

import "fmt"

func main() {
    var x, o int
    fmt.Sscanf("0x1f", "%x", &x) // 十六进制
    fmt.Println(x) // 31
    
    fmt.Sscanf("077", "%o", &o) // 八进制
    fmt.Println(o) // 63
}
```

### 27. 自定义 Scanner 接口示例

go



运行









```go
package main

import (
    "fmt"
    "strconv"
    "strings"
)

// 自定义类型实现Scanner接口
type Age int

func (a *Age) Scan(state fmt.ScanState, verb rune) error {
    // 读取输入的字符串
    str, err := state.Token(true, nil)
    if err != nil {
        return err
    }
    // 去除"岁"字并转换为整数
    num, err := strconv.Atoi(strings.TrimSuffix(string(str), "岁"))
    *a = Age(num)
    return err
}

func main() {
    var age Age
    fmt.Sscanf("25岁", "%v", &age)
    fmt.Println(age) // 25
}
```

### 28. 宽度作为参数示例（* 标记）

go



运行









```go
package main

import "fmt"

func main() {
    // 宽度由参数指定
    fmt.Printf("%*d\n", 5, 123)  //  123（宽度5）
    // 精度由参数指定
    fmt.Printf("%.*f\n", 3, 3.14) // 3.140（精度3）
    // 宽度和精度都由参数指定
    fmt.Printf("%*.*f\n", 8, 2, 3.14) //   3.14（宽度8，精度2）
}
```

### 29. Unicode 字符与字符串示例

go



运行









```go
package main

import "fmt"

func main() {
    // Unicode字符
    fmt.Printf("%c\n", 0x1F60A) // 😊（笑脸emoji）
    fmt.Printf("%U\n", 0x1F60A) // U+1F60A
    
    // 带转义的字符串
    fmt.Printf("%+q\n", "中文😊") // "\u4e2d\u6587\U0001f60a"
}
```

### 30. 字节切片十六进制输出示例

go



运行









```go
package main

import "fmt"

func main() {
    data := []byte("golang")
    fmt.Printf("%x\n", data)  // 676f6c616e67
    fmt.Printf("%X\n", data)  // 676F6C616E67
    fmt.Printf("% x\n", data) // 67 6f 6c 61 6e 67（带空格分隔）
}
```

### 31. 嵌套结构体格式化示例

go



运行









```go
package main

import "fmt"

type Address struct {
    City  string
    Street string
}

type User struct {
    Name    string
    Age     int
    Address Address
}

func main() {
    u := User{
        Name: "Alice",
        Age:  30,
        Address: Address{
            City:   "Beijing",
            Street: "Main St",
        },
    }
    fmt.Printf("%+v\n", u)
    // 输出：
    // {Name:Alice Age:30 Address:{City:Beijing Street:Main St}}
}
```







![img](data:image/png;base64,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)

### 32. 空接口与 nil 格式化示例

go



运行









```go
package main

import "fmt"

func main() {
    var i interface{} = nil
    var s *string = nil
    
    fmt.Printf("%v\n", i)  // <nil>
    fmt.Printf("%v\n", s)  // <nil>
    fmt.Printf("%T\n", i)  // <nil>
    fmt.Printf("%T\n", s)  // *string
}
```







![img](data:image/png;base64,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)

这些示例覆盖了`fmt`包的占位符、格式化控制、输入输出函数、自定义接口实现等核心内容，基本满足日常开发中对格式化 IO 的需求。

编辑分享







### Go 语言`fmt`包深入讲解与源码分析

#### 一、`fmt`包核心功能概述

`fmt`包是 Go 语言标准库中用于格式化输入输出的核心包，提供了类似 C 语言`printf`/`scanf`的功能，但语法更简洁、类型安全。其核心能力包括：

- **格式化输出**：通过`Print`/`Fprint`/`Sprint`系列函数输出到控制台、文件或字符串。
- **格式化输入**：通过`Scan`/`Fscan`/`Sscan`系列函数从控制台、文件或字符串读取数据。
- **自定义格式化**：通过`Stringer`/`Formatter`等接口支持自定义类型的格式化逻辑。

#### 二、核心函数与占位符示例（50+）

##### 1. 基础占位符（10 个）

go

```go
package main

import "fmt"

func main() {
    // %v：默认格式
    fmt.Printf("%v\n", 123)        // 123
    fmt.Printf("%v\n", "hello")    // hello
    
    // %+v：结构体带字段名
    type S struct{ A int }
    fmt.Printf("%+v\n", S{10})     // {A:10}
    
    // %#v：Go语法表示
    fmt.Printf("%#v\n", []int{1,2})// []int{1, 2}
    
    // %T：类型
    fmt.Printf("%T\n", 3.14)       // float64
    
    // %%：百分号
    fmt.Printf("%%\n")             // %
    
    // %t：布尔值
    fmt.Printf("%t\n", true)       // true
    
    // %b：二进制
    fmt.Printf("%b\n", 8)          // 1000
    
    // %d：十进制
    fmt.Printf("%d\n", 0x10)       // 16
    
    // %x：十六进制（小写）
    fmt.Printf("%x\n", 255)        // ff
}
```

##### 2. 整数相关占位符（8 个）

go

```go
package main

import "fmt"

func main() {
    // %o：八进制
    fmt.Printf("%o\n", 10)         // 12
    
    // %q：带单引号字符
    fmt.Printf("%q\n", 65)         // 'A'
    
    // %X：十六进制（大写）
    fmt.Printf("%X\n", 255)        // FF
    
    // %U：Unicode编码
    fmt.Printf("%U\n", '中')       // U+4E2D
    
    // %c：Unicode字符
    fmt.Printf("%c\n", 0x4E2D)     // 中
    
    // 带符号整数
    fmt.Printf("%+d\n", 10)        // +10
    fmt.Printf("%+d\n", -10)       // -10
    
    // 宽度控制
    fmt.Printf("%5d\n", 123)       //  123（右对齐）
}
```

##### 3. 浮点数与复数（8 个）

go

```go
package main

import "fmt"

func main() {
    // %e：科学计数法（小写e）
    fmt.Printf("%e\n", 123.45)     // 1.234500e+02
    
    // %E：科学计数法（大写E）
    fmt.Printf("%E\n", 123.45)     // 1.234500E+02
    
    // %f：小数形式
    fmt.Printf("%f\n", 123.45)     // 123.450000
    
    // %g：自动选择%e/%f
    fmt.Printf("%g\n", 123.4500)   // 123.45
    
    // %G：自动选择%E/%f
    fmt.Printf("%G\n", 123.4500)   // 123.45
    
    // 精度控制
    fmt.Printf("%.2f\n", 3.1415)   // 3.14
    
    // 复数
    fmt.Printf("%v\n", 2+3i)       // (2+3i)
    fmt.Printf("%g\n", 2+3i)       // (2+3i)
}
```

##### 4. 字符串与字节切片（7 个）

go

```go
package main

import "fmt"

func main() {
    // %s：字符串
    fmt.Printf("%s\n", "hello")    // hello
    
    // %q：带双引号字符串
    fmt.Printf("%q\n", "hello")    // "hello"
    
    // %x：字节十六进制（小写）
    fmt.Printf("%x\n", "ab")       // 6162
    
    // %X：字节十六进制（大写）
    fmt.Printf("%X\n", "ab")       // 6162
    
    // 宽度与精度
    fmt.Printf("%10s\n", "hi")     //        hi
    fmt.Printf("%.2s\n", "hello")  // he
    
    // 空格分隔字节
    fmt.Printf("% x\n", "abc")     // 61 62 63
}
```

##### 5. 指针与复合类型（6 个）

go

```go
package main

import "fmt"

func main() {
    // %p：指针地址
    x := 10
    fmt.Printf("%p\n", &x)         // 0xc00001a0a8（地址可变）
    
    // 数组
    arr := [2]int{1, 2}
    fmt.Printf("%v\n", arr)        // [1 2]
    
    // 切片
    slice := []string{"a", "b"}
    fmt.Printf("%#v\n", slice)     // []string{"a", "b"}
    
    // 映射
    m := map[int]string{1: "one"}
    fmt.Printf("%v\n", m)          // map[1:one]
    
    // 通道
    ch := make(chan int)
    fmt.Printf("%v\n", ch)         // 0xc000078060
    
    // 函数
    fmt.Printf("%T\n", fmt.Println)// func(...interface {}) (int, error)
}
```

##### 6. 格式化标记（7 个）

go

```go
package main

import "fmt"

func main() {
    // -：左对齐
    fmt.Printf("|%-5d|\n", 123)    // |123  |
    
    // 0：前导零
    fmt.Printf("%05d\n", 123)      // 00123
    
    // #：备用格式
    fmt.Printf("%#o\n", 8)         // 010
    fmt.Printf("%#x\n", 16)        // 0x10
    
    // +：强制符号
    fmt.Printf("%+f\n", 3.14)      // +3.140000
    
    // 空格：符号位留空
    fmt.Printf("% d\n", 123)       //  123
    fmt.Printf("% d\n", -123)      // -123
}
```

##### 7. 输入函数（7 个）

go

```go
package main

import "fmt"

func main() {
    // Scan：从标准输入读取
    var a, b int
    fmt.Scan(&a, &b)               // 输入：3 5
    fmt.Println(a + b)             // 8
    
    // Scanf：格式匹配
    var name string
    var age int
    fmt.Scanf("%s %d", &name, &age)// 输入：Bob 20
    fmt.Println(name, age)         // Bob 20
    
    // Scanln：换行终止
    var x, y string
    fmt.Scanln(&x, &y)             // 输入：hello world
    fmt.Println(x, y)              // hello world
    
    // Sscan：从字符串读取
    fmt.Sscan("10 20", &a, &b)
    fmt.Println(a, b)              // 10 20
    
    // Sscanf：字符串格式匹配
    fmt.Sscanf("id:123", "id:%d", &a)
    fmt.Println(a)                 // 123
    
    // Fscan：从文件读取（示例略，需结合os.File）
    // Fscanf：文件格式匹配（示例略）
}
```

##### 8. 输出函数（7 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // Print：标准输出
    fmt.Print("hello ")
    fmt.Println("world")           // hello world
    
    // Printf：格式化输出
    fmt.Printf("name: %s\n", "Alice")// name: Alice
    
    // Sprint：返回字符串
    s := fmt.Sprint("a", 1, true)
    fmt.Println(s)                 // a1true
    
    // Sprintf：格式化字符串
    s = fmt.Sprintf("%.2f", 3.1415)
    fmt.Println(s)                 // 3.14
    
    // Fprint：输出到文件
    f, _ := os.Create("test.txt")
    defer f.Close()
    fmt.Fprintln(f, "写入文件")      // 文件内容：写入文件
    
    // Fprintf：格式化写入文件
    fmt.Fprintf(f, "num: %d", 100)  // 文件追加：num: 100
}
```

#### 三、自定义接口示例（3 个）

##### 1. `Stringer`接口

go

```go
package main

import "fmt"

type User struct {
    Name string
    Age  int
}

// 实现Stringer接口
func (u User) String() string {
    return fmt.Sprintf("%s(%d岁)", u.Name, u.Age)
}

func main() {
    u := User{"Tom", 20}
    fmt.Println(u) // Tom(20岁)
}
```

##### 2. `Formatter`接口

go

```go
package main

import "fmt"

type Data int

// 实现Formatter接口
func (d Data) Format(f fmt.State, c rune) {
    switch c {
    case 'b': // 自定义%b格式
        f.Write([]byte(fmt.Sprintf("0b%b", d)))
    default:
        f.Write([]byte(fmt.Sprint(d)))
    }
}

func main() {
    var d Data = 5
    fmt.Printf("%b\n", d) // 0b101
    fmt.Printf("%d\n", d) // 5
}
```

##### 3. `GoStringer`接口

go

```go
package main

import "fmt"

type Point struct {
    X, Y int
}

// 实现GoStringer接口
func (p Point) GoString() string {
    return fmt.Sprintf("Point{X:%d, Y:%d}", p.X, p.Y)
}

func main() {
    p := Point{3, 4}
    fmt.Printf("%#v\n", p) // Point{X:3, Y:4}
}
```

#### 四、`fmt`包源码分析

`fmt`包的核心源码集中在`print.go`和`scan.go`，以下是关键实现分析：

##### 1. 核心结构体`pp`（`print.go`）

go

```go
// 用于格式化输出的状态结构体
type pp struct {
    buf     buffer   // 输出缓冲区
    arg     interface{}// 当前处理的参数
    value   reflect.Value // 参数的反射值
    fmt     fmt      // 格式化状态
    // 省略其他字段...
}
```

`pp`是格式化输出的核心载体，负责缓冲输出内容、处理反射类型和格式化逻辑。

##### 2. `newPrinter()`函数

go

```go
var ppFree = sync.Pool{
    New: func() interface{} { return new(pp) },
}

// 从对象池获取pp实例，避免频繁创建销毁
func newPrinter() *pp {
    p := ppFree.Get().(*pp)
    p.reset() // 重置状态
    return p
}
```

通过`sync.Pool`复用`pp`对象，减少 GC 压力，提升性能。

##### 3. `printArg()`函数（核心格式化逻辑）

```go
func (p *pp) printArg(arg interface{}, verb rune) {
    // 处理nil
    if arg == nil {
        // 省略处理...
        return
    }

    // 根据类型分发处理
    switch f := arg.(type) {
    case bool:
        p.fmtBool(f, verb)
    case int:
        p.fmtInteger(uint64(f), signed, verb)
    case string:
        p.fmtString(f, verb)
    // 省略其他基本类型...
    default:
        // 处理自定义类型（反射+接口检测）
        if !p.handleMethods(verb) {
            p.printValue(reflect.ValueOf(f), verb, 0)
        }
    }
}
```

`printArg`是格式化的入口，通过类型断言分发不同类型的处理逻辑，优先调用自定义接口（如`Formatter`/`Stringer`），否则通过反射处理。

##### 4. `handleMethods()`函数（接口检测）

go

```go
func (p *pp) handleMethods(verb rune) bool {
    // 检测是否实现Formatter接口
    if f, ok := p.arg.(Formatter); ok {
        f.Format(p, verb)
        return true
    }
    // 检测是否实现error接口（用于%v等字符串格式）
    if verb == 'v' || verb == 's' || verb == 'q' {
        if e, ok := p.arg.(error); ok {
            p.fmtString(e.Error(), verb)
            return true
        }
    }
    // 检测是否实现Stringer接口
    if verb == 'v' || verb == 's' || verb == 'q' {
        if s, ok := p.arg.(Stringer); ok {
            p.fmtString(s.String(), verb)
            return true
        }
    }
    return false
}
```







![img](data:image/png;base64,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)

该函数决定了格式化的优先级：`Formatter` > `error` > `Stringer` > 反射默认处理。

##### 5. `Scan`系列函数核心（`scan.go`）

go

```go
// 扫描函数的核心逻辑
func (s *ss) doScan(a []interface{}) (n int, err error) {
    for len(a) > 0 {
        // 跳过空白
        s.skipSpace()
        // 读取token并赋值给参数
        if err := s.scanOne(a[0]); err != nil {
            return n, err
        }
        n++
        a = a[1:]
    }
    return n, nil
}
```







![img](data:image/png;base64,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)

扫描函数通过循环读取输入的 token（分隔符为空白），并根据参数类型解析赋值。

#### 五、总结

`fmt`包通过灵活的占位符、类型分发和接口扩展，实现了强大的格式化功能。其源码设计中，通过对象池复用提升性能，通过反射处理未知类型，通过接口机制支持自定义逻辑，兼顾了易用性和扩展性。掌握`fmt`包的使用和原理，是 Go 语言开发的基础技能。

编辑分享