[go基础知识_持续更新 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/627df78a1efad40df03d17d2)

[语雀文档](https://www.yuque.com/aceld/mo95lb/zwukev)

# ///

# Go 语言基础语法全面总结

Go 基础语法以 “简洁、明确、无冗余” 为核心设计，避免复杂语法糖，同时通过原生特性（如短变量声明、多返回值）提升开发效率。以下按 “程序结构→核心语法模块→特色特性” 的逻辑，系统梳理 Go 基础语法，附关键代码示例。

## 一、程序入口与包管理（Go 程序的 “骨架”）

任何 Go 程序都以 **`package main`** 和 **`main()` 函数**为入口，配合 `import` 导入依赖包，构成基本结构。

### 1. 包声明（Package Declaration）

- 规则

  ：每个 Go 文件开头必须声明所属包，包名通常与文件所在目录名一致（非强制，但推荐）。

  - `package main`：特殊包，表明该程序是**可执行程序**（而非库），必须包含 `main()` 函数作为入口。
  - `package 包名`：库包（如 `package utils`），用于被其他包导入调用，无 `main()` 函数。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  // 可执行程序（main包）
  package main
  
  // 库包（utils包，供其他包导入）
  package utils
  ```

  

### 2. 导入包（Import）

- 规则

  ：通过

   

  ```
  import
  ```

   

  导入依赖的包，支持标准库包（如

   

  ```
  fmt
  ```

  ）、第三方包（如

   

  ```
  github.com/gin-gonic/gin
  ```

  ）、自定义包。

  - 多个包可合并为 “导入块”，避免重复 `import`。
  - 支持**别名导入**（包名冲突时用，如 `import f "fmt"`）和**空白导入**（仅执行包初始化函数，如 `import _ "database/sql/driver/mysql"`）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  // 导入单个包
  import "fmt"
  
  // 导入多个包（推荐用块级导入）
  import (
      "fmt"
      "time"                // 标准库包
      f "fmt"               // 别名导入（用f代替fmt）
      _ "github.com/lib/pq" // 空白导入（初始化PostgreSQL驱动）
  )
  
  func main() {
      fmt.Println("Hello") // 正常使用
      f.Println("Hi")      // 用别名调用
  }
  ```

  

### 3. 入口函数 `main()`

- **规则**：`main()` 是可执行程序的唯一入口，无参数、无返回值，必须在 `main` 包中。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      fmt.Println("Go program starts here") // 程序入口执行逻辑
  }
  ```

  

## 二、变量与常量（数据的 “容器”）

Go 变量强调 “类型明确”，支持显式声明与类型推断；常量则支持编译期求值与枚举。

### 1. 变量声明与初始化

Go 变量声明有 3 种核心方式，优先级：**短变量声明（函数内）> 显式类型声明 > 类型省略声明**。

| 声明方式            | 语法格式                     | 适用场景                          | 示例                                  |
| ------------------- | ---------------------------- | --------------------------------- | ------------------------------------- |
| 短变量声明（:=）    | `变量名 := 值`               | 函数内，需同时初始化              | `name := "Alice"; age := 25`          |
| 显式类型声明（var） | `var 变量名 类型 = 值`       | 包级变量 / 需明确类型时           | `var pi float64 = 3.14159`            |
| 类型省略声明（var） | `var 变量名 = 值`            | 包级变量 / 类型可推导时           | `var isActive = true`                 |
| 批量声明（var 块）  | `var (变量1 类型; 变量2 值)` | 多个变量批量声明（包级 / 函数内） | `var (x int = 10; y string = "test")` |

- 关键特性

  ：

  - 变量零值：未初始化的变量会被赋予 “零值”（如 `int` 零值 `0`，`string` 零值 `""`，`bool` 零值 `false`）。
  - 作用域：包级变量（整个包可见）、函数级变量（函数内可见）、块级变量（`if`/`for` 等块内可见）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 包级变量（零值初始化）
  var globalInt int          // 零值 0
  var globalStr string       // 零值 ""
  
  func main() {
      // 短变量声明（函数内）
      localVar := "local"
      fmt.Println(localVar) // 输出 "local"
  
      // 批量声明
      var (
          a int     = 100
          b float64 = 3.14
          c bool    = true
      )
      fmt.Println(a, b, c) // 输出 100 3.14 true
  }
  ```

  

### 2. 常量声明（const）

- 规则

  ：常量值必须是

  编译期可确定的表达式

  （如字面量、常量运算结果），不可修改。

  - 支持批量声明，且可通过 `iota` 实现枚举（`iota` 是常量计数器，每次 const 块内递增 1，默认从 0 开始）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 单个常量
  const Pi = 3.14159
  
  // 批量常量 + iota 枚举
  const (
      Sunday    = iota // 0（iota 初始化为 0）
      Monday           // 1（iota 自动递增 1）
      Tuesday          // 2
      Wednesday        // 3
  )
  
  // iota 重置与插队
  const (
      _  = iota             // 跳过 0
      KB = 1 << (10 * iota) // 1 << 10 = 1024（iota=1）
      MB = 1 << (10 * iota) // 1 << 20 = 1048576（iota=2）
      GB = 1 << (10 * iota) // 1 << 30（iota=3）
  )
  
  func main() {
      fmt.Println(Pi)       // 输出 3.14159
      fmt.Println(Monday)   // 输出 1
      fmt.Println(MB)       // 输出 1048576
  }
  ```

  

## 三、数据类型（Go 的 “数据原子”）

Go 是静态类型语言，数据类型分为 **基础类型** 和 **复合类型**，无 “隐式类型转换”（必须显式转换）。

### 1. 基础类型

覆盖数值、字符串、布尔，类型明确且无冗余。

| 类型大类 | 具体类型                       | 说明                                    | 示例                              |
| -------- | ------------------------------ | --------------------------------------- | --------------------------------- |
| 整数类型 | `int`/`uint`                   | 随平台位数（32/64 位），`uint` 无符号   | `var x int = 10; var y uint = 20` |
|          | `int8`/`int16`/`int32`/`int64` | 固定位数有符号整数（范围明确）          | `var z int64 = 10000000000`       |
|          | `uint8`/`uint16`/...           | 固定位数无符号整数，`uint8` 别名 `byte` | `var b byte = 'a'`                |
| 浮点类型 | `float32`/`float64`            | 单精度 / 双精度浮点数，默认用 `float64` | `var pi float64 = 3.14`           |
| 复数类型 | `complex64`/`complex128`       | 单精度 / 双精度复数（实部 + 虚部）      | `var c complex64 = 3 + 4i`        |
| 字符串   | `string`                       | UTF-8 编码，不可修改（修改需转切片）    | `var s string = "Hello, 世界"`    |
| 布尔类型 | `bool`                         | 仅 `true`/`false`，不可用 0/1 替代      | `var isOk bool = true`            |
| 字符类型 | `rune`                         | `int32` 别名，存储 Unicode 码点         | `var ch rune = '中'`              |

- 关键特性

  ：

  - 字符串不可修改：`s := "abc"; s[0] = 'A'` 编译报错，需转 `[]byte` 或 `[]rune` 修改后重新赋值。
  - 显式类型转换：不同类型不能直接运算，需用 `类型(值)` 转换（如 `int(3.14)` 取整为 3）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 字符串操作
      s := "Hello, 世界"
      fmt.Println(len(s))        // 输出 13（len 统计字节数，"世界"占6字节）
      fmt.Println(len([]rune(s)))// 输出 9（转 rune 统计 Unicode 字符数）
  
      // 显式类型转换
      var x int = 10
      var y float64 = float64(x) // int 转 float64
      fmt.Println(x + int(y))    // 输出 20（float64 转 int）
  }
  ```

  

### 2. 复合类型

由基础类型组合而成，是 Go 处理复杂数据的核心，包括数组、切片、映射、结构体、通道。

#### （1）数组（Array）：固定长度的同类型集合

- **规则**：长度是数组类型的一部分（如 `[3]int` 与 `[5]int` 是不同类型），长度不可变，内存连续。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 数组声明
      var arr1 [3]int          // 零值初始化：[0 0 0]
      arr2 := [3]int{1, 2, 3}  // 显式初始化
      arr3 := [...]int{4, 5, 6}// 长度自动推导（... 表示让编译器计算长度）
  
      // 访问与修改
      arr2[1] = 10             // 修改索引1的值
      fmt.Println(arr2)        // 输出 [1 10 3]
  
      // 数组遍历（for 循环）
      for i := 0; i < len(arr3); i++ {
          fmt.Printf("arr3[%d] = %d\n", i, arr3[i])
      }
      // for-range 遍历（更简洁）
      for idx, val := range arr3 {
          fmt.Printf("arr3[%d] = %d\n", idx, val)
      }
  }
  ```

  

#### （2）切片（Slice）：动态长度的 “数组视图”

- **本质**：切片不是独立数据结构，而是 “数组的引用”，包含 3 个字段：`指针（指向底层数组）`、`长度（len，当前元素数）`、`容量（cap，底层数组最大可容纳元素数）`。

- 规则

  ：

  - 初始化：用 `make([]类型, 长度, 容量)` 或字面量 `[]类型{元素1, 元素2}`。
  - 扩容：当 `len == cap` 时，`append` 会触发扩容（容量 < 1024 时翻倍，≥1024 时扩 1.25 倍）。
  - 切片操作：`s[low:high]`（左闭右开，取索引 low 到 high-1 的元素，新切片与原切片共享底层数组）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 切片初始化
      s1 := make([]int, 3, 5)  // 长度3，容量5：[0 0 0]
      s2 := []int{1, 2, 3}     // 长度3，容量3：[1 2 3]
  
      // append 追加元素
      s2 = append(s2, 4)       // 扩容为6，s2变为 [1 2 3 4]
      fmt.Println(len(s2), cap(s2)) // 输出 4 6
  
      // 切片操作（共享底层数组）
      s3 := s2[1:3]            // s3 = [2 3]，len=2，cap=5（复用s2的底层数组）
      s3[0] = 20               // 修改s3，s2也会变（共享数组）
      fmt.Println(s2)          // 输出 [1 20 3 4]
  
      // 切片拷贝（避免共享，用 copy 函数）
      s4 := make([]int, len(s2))
      copy(s4, s2)             // s4 是 s2 的独立拷贝
      s4[1] = 100
      fmt.Println(s2, s4)      // 输出 [1 20 3 4] [1 100 3 4]
  }
  ```

  

#### （3）映射（Map）：键值对（Key-Value）集合

- **本质**：哈希表（Hash Table），键（Key）必须是 “可比较类型”（如 `int`/`string`/`struct`，不可为 `slice`/`map`/`function`），值（Value）可任意类型。

- 规则

  ：

  - 初始化：必须用 `make(map[键类型]值类型, 初始容量)` 或字面量 `map[键类型]值类型{键1:值1, 键2:值2}`，不可直接声明 `var m map[int]string`（此时 m 是 nil，无法直接赋值）。
  - 访问：`v, ok := m[key]`（用 ok 判断键是否存在，避免 “零值混淆”）。
  - 并发安全：默认 map 非并发安全，并发场景需用 `sync.Map`。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // map 初始化（字面量）
      m1 := map[string]int{"Alice": 25, "Bob": 30}
  
      // map 初始化（make）
      m2 := make(map[string]string, 10) // 初始容量10（非必须，仅优化性能）
      m2["name"] = "Charlie"
      m2["city"] = "Beijing"
  
      // 访问键（判断是否存在）
      age, ok := m1["Alice"]
      if ok {
          fmt.Println("Alice's age:", age) // 输出 25
      }
  
      // 删除键
      delete(m1, "Bob")
      fmt.Println(m1) // 输出 map[Alice:25]
  
      // 遍历 map（for-range，顺序不固定）
      for k, v := range m2 {
          fmt.Printf("%s: %s\n", k, v)
      }
  }
  ```

  

#### （4）结构体（Struct）：自定义复合类型

- **本质**：将多个不同类型的字段组合成一个新类型，类似其他语言的 “类”（但无继承，靠组合实现复用）。

- 规则

  ：

  - 字段访问：用 `结构体变量.字段名`，字段首字母大写表示 “导出”（包外可见），小写表示 “私有”（仅包内可见）。
  - 结构体嵌套：支持 “匿名嵌套”（如 `type Person struct { Name string; Address }`，可直接访问 `p.City`）和 “命名嵌套”。
  - 结构体方法：为结构体绑定函数（用 “接收者” 实现，类似类的成员方法）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 定义结构体（Address）
  type Address struct {
      City  string
      Street string
  }
  
  // 定义结构体（Person，嵌套 Address）
  type Person struct {
      Name    string // 导出字段（首字母大写）
      age     int    // 私有字段（首字母小写，仅包内可见）
      Address        // 匿名嵌套（可直接访问 Address 的字段）
  }
  
  // 为 Person 绑定方法（值接收者：不修改原结构体）
  func (p Person) GetName() string {
      return p.Name
  }
  
  // 为 Person 绑定方法（指针接收者：修改原结构体）
  func (p *Person) SetAge(newAge int) {
      p.age = newAge
  }
  
  func main() {
      // 结构体初始化
      p := Person{
          Name: "Alice",
          Address: Address{
              City:  "Beijing",
              Street: "Main Street",
          },
      }
  
      // 访问字段（嵌套字段可直接访问）
      fmt.Println(p.Name)    // 输出 "Alice"
      fmt.Println(p.City)    // 输出 "Beijing"（匿名嵌套，等价于 p.Address.City）
  
      // 调用方法
      p.SetAge(25)
      fmt.Println(p.GetName()) // 输出 "Alice"
  }
  ```

  

#### （5）通道（Channel）：Goroutine 间通信的 “管道”

- **本质**：用于 Goroutine 间同步与通信，遵循 “通过通信共享内存，而非通过共享内存通信”（CSP 理论）。

- 规则

  ：

  - 初始化：必须用 `make(chan 类型, 缓冲大小)`，缓冲大小为 0 时是 “无缓冲通道”（同步），>0 时是 “有缓冲通道”（异步）。
  - 操作：`ch <- val`（发送值到通道）、`val := <-ch`（从通道接收值）、`close(ch)`（关闭通道，接收方可用 `val, ok := <-ch` 判断是否关闭）。
  - 并发安全：通道本身是并发安全的，无需额外加锁。

- 示例

  （简单通信）：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func sendData(ch chan<- int) { // chan<- 表示仅发送通道
      ch <- 100 // 发送 100 到通道
      close(ch) // 关闭通道
  }
  
  func main() {
      // 初始化无缓冲通道
      ch := make(chan int)
  
      // 启动 Goroutine 发送数据
      go sendData(ch)
  
      // 接收通道数据（阻塞直到有数据或通道关闭）
      val, ok := <-ch
      if ok {
          fmt.Println("Received:", val) // 输出 100
      }
  
      // 通道关闭后接收，ok 为 false
      val, ok = <-ch
      fmt.Println("Received after close:", val, ok) // 输出 0 false
  }
  ```

  

## 四、流程控制（程序的 “执行逻辑”）

Go 流程控制仅保留 **`if`、`for`、`switch`、`goto`** 四种，无 `while`/`do-while`（用 `for` 替代），语法简洁且无歧义。

### 1. `if` 条件语句

- 规则

  ：

  - 条件表达式无需括号（`()`），但代码块必须用大括号（`{}`），且左括号 `{` 必须与 `if` 同行。
  - 支持 “初始化语句”（在条件前声明变量，作用域仅在 `if` 块内），常用于错误处理（如 `if err != nil`）。

- 示例

  ：

  go

  

  

  ```go
  package main
  import "fmt"
  
  func divide(a, b int) (int, error) {
      if b == 0 {
          return 0, fmt.Errorf("division by zero")
      }
      return a / b, nil
  }
  
  func main() {
      // if 带初始化语句（常见于错误处理）
      if res, err := divide(10, 2); err != nil {
          fmt.Println("Error:", err)
      } else {
          fmt.Println("Result:", res) // 输出 5
      }
  
      // 普通 if-else
      age := 18
      if age >= 18 {
          fmt.Println("Adult")
      } else {
          fmt.Println("Minor")
      }
  }
  ```

  

### 2. `for` 循环语句

Go 唯一的循环语句，覆盖 `for`、`while`、`do-while` 所有场景。

| 循环类型       | 语法格式                     | 示例                                         |
| -------------- | ---------------------------- | -------------------------------------------- |
| 普通 for 循环  | `for 初始化; 条件; 增量`     | `for i := 0; i < 5; i++ { ... }`             |
| while 循环     | `for 条件`                   | `i := 0; for i < 5 { i++; ... }`             |
| 无限循环       | `for { ... }`                | `for { fmt.Println("loop"); }`               |
| for-range 循环 | `for 索引, 值 := range 集合` | `for idx, val := range []int{1,2,3} { ... }` |

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 普通 for 循环
      for i := 0; i < 3; i++ {
          fmt.Println(i) // 输出 0 1 2
      }
  
      // while 循环（判断条件）
      j := 0
      for j < 3 {
          fmt.Println(j) // 输出 0 1 2
          j++
      }
  
      // for-range 遍历切片
      s := []string{"a", "b", "c"}
      for idx, val := range s {
          fmt.Printf("idx: %d, val: %s\n", idx, val)
      }
  
      // 无限循环（需手动 break 退出）
      k := 0
      for {
          if k >= 2 {
              break // 退出循环
          }
          fmt.Println(k) // 输出 0 1
          k++
      }
  }
  ```

  

### 3. `switch` 分支语句

Go `switch` 灵活性远超其他语言，支持任意类型、默认 break、多条件匹配。

- 规则

  ：

  - 条件表达式无需是整数，可是 `string`/`bool` 等任意类型。
  - 每个 `case` 默认自带 `break`（执行完一个 `case` 后自动退出 `switch`），需穿透时用 `fallthrough`。
  - 支持 “表达式省略”（类似 `if-else if`）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 普通 switch（string 类型条件）
      fruit := "apple"
      switch fruit {
      case "apple":
          fmt.Println("Red fruit")
      case "banana":
          fmt.Println("Yellow fruit")
      default:
          fmt.Println("Unknown fruit")
      }
  
      // switch 穿透（fallthrough）
      num := 2
      switch num {
      case 1:
          fmt.Println("1")
          fallthrough // 穿透到下一个 case
      case 2:
          fmt.Println("2")
          fallthrough
      case 3:
          fmt.Println("3")
      }
      // 输出：2 3
  
      // 省略表达式的 switch（类似 if-else if）
      age := 25
      switch {
      case age < 18:
          fmt.Println("Minor")
      case age >= 18 && age < 60:
          fmt.Println("Adult")
      default:
          fmt.Println("Senior")
      }
      // 输出：Adult
  }
  ```

  

### 4. `goto` 跳转语句

- **规则**：`goto` 用于在函数内跳转到指定 “标签”（标签名大写或小写均可，需在函数内定义），但不推荐滥用（易破坏代码逻辑连贯性），仅在 “跳出多层循环” 等场景使用。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 多层循环，用 goto 跳出
      for i := 0; i < 3; i++ {
          for j := 0; j < 3; j++ {
              if j == 1 {
                  goto exitLoop // 跳转到 exitLoop 标签
              }
              fmt.Printf("i=%d, j=%d\n", i, j)
          }
      }
  
  exitLoop: // 标签定义（需在 goto 之前或之后，且在同一函数内）
      fmt.Println("Exited loops")
  }
  // 输出：i=0, j=0; Exited loops
  ```

  

## 五、函数（代码的 “复用单元”）

Go 函数支持多返回值、函数值、匿名函数、闭包，是代码复用与逻辑封装的核心。

### 1. 函数声明与调用

- 规则

  ：

  - 语法：`func 函数名(参数列表) (返回值列表) { 函数体 }`。
  - 参数列表：`参数名 类型`，多个参数同类型可简写（如 `func add(a, b int) int`）。
  - 返回值列表：支持单返回值（`func add(a, b int) int`）和多返回值（`func divide(a, b int) (int, error)`），多返回值可命名（类似变量，直接 `return` 即可）。

- 示例

  （多返回值与命名返回值）：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 多返回值（未命名）
  func divide(a, b int) (int, error) {
      if b == 0 {
          return 0, fmt.Errorf("division by zero")
      }
      return a / b, nil
  }
  
  // 多返回值（命名返回值，推荐用于返回值语义明确时）
  func calc(a, b int) (sum, product int) {
      sum = a + b
      product = a * b
      return // 直接返回命名返回值，无需显式写 sum, product
  }
  
  func main() {
      // 调用多返回值函数
      res, err := divide(10, 2)
      if err != nil {
          fmt.Println("Error:", err)
      } else {
          fmt.Println("Divide result:", res) // 输出 5
      }
  
      // 调用命名返回值函数
      sum, product := calc(3, 4)
      fmt.Println("Sum:", sum, "Product:", product) // 输出 7 12
  }
  ```

  

### 2. 函数值与匿名函数

- **函数值**：函数可作为变量存储（类型为 “函数类型”），支持传递给其他函数或作为返回值。

- **匿名函数**：无函数名的函数，常用于 “临时逻辑封装”（如作为 `sort.Slice` 的排序函数）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 函数作为参数（高阶函数）
  func apply(a, b int, op func(int, int) int) int {
      return op(a, b)
  }
  
  func main() {
      // 定义函数值（变量存储函数）
      add := func(a, b int) int {
          return a + b
      }
  
      // 调用高阶函数（传递函数值）
      res := apply(3, 4, add)
      fmt.Println("Add result:", res) // 输出 7
  
      // 匿名函数直接调用（立即执行函数）
      res2 := func(x, y int) int {
          return x * y
      }(5, 6)
      fmt.Println("Multiply result:", res2) // 输出 30
  }
  ```

  

### 3. 闭包（Closure）

- **本质**：引用了 “外部变量” 的匿名函数，外部变量的生命周期会随闭包延长（即使外部变量所在函数已执行完毕）。

- **关键特性**：闭包会 “捕获” 外部变量的引用，而非值（修改闭包内的外部变量会影响原变量）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 返回一个闭包（计数器函数）
  func counter() func() int {
      count := 0 // 外部变量（被闭包捕获）
      return func() int {
          count++ // 闭包内修改外部变量
          return count
      }
  }
  
  func main() {
      c1 := counter() // 闭包1，捕获独立的 count
      fmt.Println(c1()) // 输出 1
      fmt.Println(c1()) // 输出 2
  
      c2 := counter() // 闭包2，捕获新的 count
      fmt.Println(c2()) // 输出 1
      fmt.Println(c1()) // 输出 3（c1 的 count 独立）
  }
  ```

  

### 4. `defer` 语句

- **规则**：`defer` 用于 “延迟执行函数”，函数退出前（无论正常返回还是 panic）会执行 `defer` 后的语句，常用于 “资源释放”（如关闭文件、释放锁）。

- 关键特性

  ：

  - 延迟执行：`defer` 后的函数不会立即执行，会加入 “延迟函数栈”，函数退出时按 “后进先出”（LIFO）顺序执行。
  - 参数预计算：`defer` 函数的参数在声明时就会计算，而非执行时。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func main() {
      // 延迟函数栈（后进先出）
      defer fmt.Println("First defer")
      defer fmt.Println("Second defer")
      fmt.Println("Main logic")
      // 执行顺序：Main logic → Second defer → First defer
  
      // 参数预计算（i 的值在 defer 声明时是 1，执行时仍为 1）
      i := 1
      defer fmt.Println("i =", i)
      i = 2
      fmt.Println("Current i =", i)
      // 输出：Current i = 2 → i = 1
  }
  ```

  

## 六、接口（行为的 “契约”）

Go 接口是 “非侵入式” 的，无需显式声明 “实现接口”，只要结构体实现了接口的所有方法，就自动成为该接口的实现类型。

### 1. 接口声明与实现

- 规则

  ：

  - 接口声明：`type 接口名 interface { 方法1(参数列表) 返回值列表; 方法2... }`。
  - 自动实现：结构体只要实现接口的所有方法（方法名、参数列表、返回值列表完全一致），就默认实现该接口，无需 `implements` 关键字。
  - 接口调用：接口变量可存储所有实现该接口的结构体实例，调用接口方法时会 “动态派发”（执行结构体的具体实现）。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 定义接口（行为契约：发声）
  type Sayer interface {
      Say() string
  }
  
  // 定义结构体（Dog）
  type Dog struct {
      Name string
  }
  
  // Dog 实现 Sayer 接口的 Say 方法
  func (d Dog) Say() string {
      return fmt.Sprintf("Dog %s says: Wang Wang", d.Name)
  }
  
  // 定义结构体（Cat）
  type Cat struct {
      Name string
  }
  
  // Cat 实现 Sayer 接口的 Say 方法
  func (c Cat) Say() string {
      return fmt.Sprintf("Cat %s says: Miao Miao", c.Name)
  }
  
  // 接口作为参数（多态调用）
  func MakeSound(s Sayer) {
      fmt.Println(s.Say())
  }
  
  func main() {
      // 接口变量存储不同实现
      var s Sayer
      s = Dog{Name: "大黄"}
      MakeSound(s) // 输出 Dog 大黄 says: Wang Wang
  
      s = Cat{Name: "小白"}
      MakeSound(s) // 输出 Cat 小白 says: Miao Miao
  }
  ```

  

### 2. 空接口（`interface{}`）

- **规则**：空接口不包含任何方法，因此**所有类型都自动实现空接口**，可用于 “接收任意类型的参数”（如 `fmt.Println` 的参数类型是 `...interface{}`）。

- **类型断言**：通过 `val, ok := 空接口变量.(目标类型)` 判断空接口变量的实际类型，避免类型错误。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  // 接收任意类型的函数
  func printAny(v interface{}) {
      // 类型断言（判断实际类型）
      switch val := v.(type) {
      case int:
          fmt.Printf("Type: int, Value: %d\n", val)
      case string:
          fmt.Printf("Type: string, Value: %s\n", val)
      case bool:
          fmt.Printf("Type: bool, Value: %t\n", val)
      default:
          fmt.Printf("Unknown type: %T\n", val)
      }
  }
  
  func main() {
      printAny(100)      // 输出 Type: int, Value: 100
      printAny("hello")   // 输出 Type: string, Value: hello
      printAny(true)     // 输出 Type: bool, Value: true
      printAny(3.14)     // 输出 Unknown type: float64
  }
  ```

  

## 七、错误处理（程序的 “异常防护”）

Go 不支持 `try-catch` 异常机制，而是通过 **`error` 接口** 和 **`panic`/`recover`** 实现错误处理，强调 “显式错误处理”。

### 1. `error` 接口（预期错误）

- **本质**：`error` 是一个简单接口，定义为 `type error interface { Error() string }`，任何实现 `Error() string` 方法的类型都可作为错误。

- **使用场景**：处理 “预期错误”（如文件不存在、参数非法），通过函数返回值传递错误，调用方需显式判断 `err != nil`。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import (
      "errors"
      "fmt"
  )
  
  // 自定义错误（实现 error 接口）
  type MyError struct {
      Code    int
      Message string
  }
  
  func (e *MyError) Error() string {
      return fmt.Sprintf("Code: %d, Message: %s", e.Code, e.Message)
  }
  
  // 函数返回错误
  func validateAge(age int) error {
      if age < 0 {
          // 返回自定义错误
          return &MyError{Code: 400, Message: "age cannot be negative"}
      }
      if age > 150 {
          // 返回标准库错误（errors.New）
          return errors.New("age exceeds maximum limit")
      }
      return nil // 无错误返回 nil
  }
  
  func main() {
      err := validateAge(-5)
      if err != nil {
          // 判断错误类型（类型断言）
          if myErr, ok := err.(*MyError); ok {
              fmt.Println("Custom error:", myErr) // 输出 Code: 400...
          } else {
              fmt.Println("Standard error:", err)
          }
          return
      }
      fmt.Println("Age is valid")
  }
  ```

  

### 2. `panic`/`recover`（非预期错误）

- **`panic`**：用于触发 “运行时恐慌”（非预期错误，如空指针解引用、数组越界），会中断当前 Goroutine 的执行，沿调用栈向上传播，直到被 `recover` 捕获或程序崩溃。

- **`recover`**：用于捕获 `panic`，仅在 `defer` 函数中有效，返回 `panic` 传递的值，若未发生 `panic` 则返回 `nil`。

- **使用场景**：处理 “非预期错误”（如程序 Bug），避免程序直接崩溃，常用于服务启动初始化、Goroutine 异常捕获。

- 示例

  ：

  go

  

  

  

  

  

  ```go
  package main
  import "fmt"
  
  func riskyOperation() {
      // 模拟 panic（空指针解引用）
      var p *int = nil
      *p = 10 // 触发 panic
  }
  
  func safeOperation() {
      // defer 中用 recover 捕获 panic
      defer func() {
          if err := recover(); err != nil {
              fmt.Println("Recovered from panic:", err) // 捕获 panic 信息
          }
      }()
  
      riskyOperation() // 调用可能 panic 的函数
      fmt.Println("This line will not be executed") // panic 后不会执行
  }
  
  func main() {
      safeOperation()
      fmt.Println("Main function continues") // 程序不会崩溃，正常执行
  }
  ```

  

## 八、Go 基础语法特色总结

1. **简洁无冗余**：无分号自动补全、`for` 统一循环、无继承靠组合、非侵入式接口，减少语法糖。
2. **类型安全**：静态类型、显式类型转换、零值初始化，避免运行时类型错误。
3. **开发高效**：短变量声明、多返回值、`defer` 资源释放、`error` 显式处理，提升编码效率。
4. **并发友好**：Goroutine 轻量并发、Channel 安全通信、`sync` 包辅助控制，原生支持高并发。

掌握以上基础语法，即可完成 Go 常规开发（如工具脚本、API 接口、简单微服务），后续可深入并发模型、内存管理、生态框架（如 Gin、GORM）等进阶内容。