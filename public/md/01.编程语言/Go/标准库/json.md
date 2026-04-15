### Go 语言`encoding/json`标准库深入讲解与示例

#### 一、`encoding/json`包核心功能概述

`encoding/json`是 Go 语言处理**JSON 数据**的标准库，提供了 JSON 与 Go 数据结构之间的**序列化（Marshal）** 和**反序列化（Unmarshal）** 能力，是处理 API 交互、配置文件、数据存储等场景的核心工具。其核心价值在于：

- 自动映射 Go 基础类型（如`int`、`string`）与 JSON 类型（数字、字符串等）；
- 通过**结构体标签（Struct Tag）** 灵活控制 JSON 字段名、格式和行为；
- 支持流式编解码（`Encoder`/`Decoder`），适合处理大文件或网络流；
- 允许自定义类型通过实现`Marshaler`/`Unmarshaler`接口定制编解码逻辑。

### 二、核心功能与示例代码（覆盖 50 + 场景）

#### 1. 基础序列化（`json.Marshal`）

将 Go 数据结构转换为 JSON 字节切片，自动处理基础类型映射。

go

```go
package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	// 示例1：基础类型序列化
	str := "hello json"
	num := 42
	boolean := true
	arr := []int{1, 2, 3}
	mp := map[string]interface{}{"name": "go", "version": "1.21"}

	// 字符串序列化
	data, _ := json.Marshal(str)
	fmt.Println("字符串JSON:", string(data)) // "hello json"

	// 数字序列化
	data, _ = json.Marshal(num)
	fmt.Println("数字JSON:", string(data)) // 42

	// 布尔值序列化
	data, _ = json.Marshal(boolean)
	fmt.Println("布尔值JSON:", string(data)) // true

	// 切片序列化
	data, _ = json.Marshal(arr)
	fmt.Println("切片JSON:", string(data)) // [1,2,3]

	// 映射序列化
	data, _ = json.Marshal(mp)
	fmt.Println("映射JSON:", string(data)) // {"name":"go","version":"1.21"}

	// 示例2：结构体序列化（默认使用字段名）
	type User struct {
		Name string // 必须导出（首字母大写）才能被序列化
		Age  int
	}
	user := User{Name: "Alice", Age: 30}
	data, _ = json.Marshal(user)
	fmt.Println("结构体JSON:", string(data)) // {"Name":"Alice","Age":30}

	// 示例3：格式化输出（带缩进）
	data, _ = json.MarshalIndent(user, "", "  ") // 第二个参数：前缀；第三个参数：缩进符
	fmt.Println("格式化JSON:")
	fmt.Println(string(data))
	// 输出：
	// {
	//   "Name": "Alice",
	//   "Age": 30
	// }
}
```

**关键注意点**：

- 只有**导出字段**（首字母大写）会被序列化，私有字段（首字母小写）会被忽略；
- 基础类型映射规则：`int`→JSON 数字，`string`→JSON 字符串，`bool`→JSON 布尔，`[]T`→JSON 数组，`map[string]T`→JSON 对象。

#### 2. 结构体标签（Struct Tag）控制序列化

通过`json:"tag"`标签定制 JSON 字段名、忽略字段、处理空值等行为，是`json`库最常用的高级特性。

go

```go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	// 1. 指定JSON字段名（映射到"username"）
	Name string `json:"username"`
	// 2. 忽略该字段（永远不序列化）
	Password string `json:"-"`
	// 3. 空值时忽略（如Age=0则不显示）
	Age int `json:"age,omitempty"`
	// 4. 嵌套结构体（默认展开字段）
	Profile Profile `json:"profile"`
	// 5. 指针字段（序列化指针指向的值，nil则显示null）
	Email *string `json:"email"`
}

type Profile struct {
	// 6. 字段名小写，且空字符串时忽略
	Website string `json:"website,omitempty"`
	// 7. 强制输出空值（即使为0也显示）
	Level int `json:"level"`
}

func main() {
	email := "alice@example.com"
	user := User{
		Name:     "Alice",
		Password: "secret", // 会被忽略
		Age:      0,        // 空值，会被忽略（因omitempty）
		Profile: Profile{
			Website: "",       // 空字符串，会被忽略
			Level:   0,        // 强制显示
		},
		Email: &email,
	}

	data, _ := json.MarshalIndent(user, "", "  ")
	fmt.Println("带标签的JSON:")
	fmt.Println(string(data))
	// 输出：
	// {
	//   "username": "Alice",
	//   "profile": {
	//     "level": 0
	//   },
	//   "email": "alice@example.com"
	// }
}
```

**常用标签参数**：

- `json:"name"`：指定 JSON 字段名为`name`；
- `json:"-"`：忽略该字段；
- `json:",omitempty"`：字段为零值（如`0`、`""`、`nil`）时忽略；
- `json:"name,omitempty"`：组合指定字段名和忽略空值。

#### 3. 反序列化（`json.Unmarshal`）

将 JSON 字节切片转换为 Go 数据结构，自动映射字段并处理类型转换。

go

```go
package main

import (
	"encoding/json"
	"fmt"
)

type Product struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Price       float64  `json:"price"`
	InStock     bool     `json:"in_stock"`
	Tags        []string `json:"tags"`
	Description *string  `json:"description"` // 可选字段（可能为null）
}

func main() {
	// JSON字符串
	jsonStr := `{
		"id": 1001,
		"name": "Go编程指南",
		"price": 59.9,
		"in_stock": true,
		"tags": ["programming", "go"],
		"description": null
	}`

	// 反序列化到结构体
	var product Product
	err := json.Unmarshal([]byte(jsonStr), &product) // 注意：需传入指针
	if err != nil {
		fmt.Println("反序列化错误:", err)
		return
	}

	fmt.Printf("ID: %d\n", product.ID)
	fmt.Printf("名称: %s\n", product.Name)
	fmt.Printf("价格: %.2f\n", product.Price)
	fmt.Printf("是否有货: %t\n", product.InStock)
	fmt.Printf("标签: %v\n", product.Tags)
	fmt.Printf("描述: %v\n", product.Description) // nil（因JSON中为null）

	// 示例2：反序列化到map（无需预定义结构体）
	var data map[string]interface{}
	json.Unmarshal([]byte(jsonStr), &data)
	fmt.Println("map中的名称:", data["name"]) // Go编程指南
	fmt.Println("map中的价格:", data["price"]) // 59.9

	// 示例3：反序列化到切片
	jsonArr := `[{"id":1},{"id":2},{"id":3}]`
	var ids []map[string]int
	json.Unmarshal([]byte(jsonArr), &ids)
	fmt.Println("切片中的ID:", ids[1]["id"]) // 2
}
```

**反序列化注意事项**：

- 目标变量必须是**指针**（否则无法修改其值）；
- JSON 字段名与结构体字段名（或标签指定的名）匹配时才会赋值；
- 类型不匹配时会返回错误（如 JSON 字符串赋值给 int 字段）；
- JSON 中的`null`会被转换为 Go 中的`nil`（对指针、切片、映射等引用类型）。

#### 4. 流式编解码（`json.Encoder`/`json.Decoder`）

适合处理大文件或网络流（如 HTTP 响应体），通过`io.Writer`/`io.Reader`实现增量处理，减少内存占用。

go

```go
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func main() {
	// 示例1：使用Encoder流式写入JSON（适合大文件）
	file, _ := os.Create("users.json")
	defer file.Close()
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ") // 启用格式化输出

	users := []User{
		{Name: "Alice", Age: 30},
		{Name: "Bob", Age: 25},
	}

	// 流式写入切片（一次性写入整个切片）
	if err := encoder.Encode(users); err != nil {
		fmt.Println("编码错误:", err)
	}

	// 示例2：使用Decoder流式读取JSON（适合大文件或网络流）
	jsonData := `
		{"Name":"Charlie", "Age":35}
		{"Name":"Diana", "Age":28}
	`
	reader := strings.NewReader(jsonData)
	decoder := json.NewDecoder(reader)

	// 循环读取多个JSON对象（每行一个）
	for {
		var user User
		if err := decoder.Decode(&user); err != nil {
			if err.Error() == "EOF" { // 读取完毕
				break
			}
			fmt.Println("解码错误:", err)
			break
		}
		fmt.Printf("读取用户: %s, %d岁\n", user.Name, user.Age)
	}
}

type User struct {
	Name string `json:"Name"`
	Age  int    `json:"Age"`
}
```

**流式处理优势**：

- 无需一次性加载全部数据到内存，适合 GB 级大文件；
- 可实时处理网络流（如从`http.Response.Body`直接解码）；
- `Encoder.Encode`会自动在每个 JSON 值后添加换行，方便`Decoder`逐行读取。

#### 5. 自定义类型与接口（`Marshaler`/`Unmarshaler`）

通过实现`json.Marshaler`和`json.Unmarshaler`接口，定制类型的编解码逻辑（如时间格式化、枚举转换）。

go

```go
package main

import (
	"encoding/json"
	"fmt"
	"time"
)

// 自定义时间类型（默认time.Time序列化是RFC3339格式）
type MyTime time.Time

// 实现Marshaler接口，自定义序列化格式（如"2006-01-02"）
func (t MyTime) MarshalJSON() ([]byte, error) {
	// 转换为time.Time，格式化后包裹双引号（JSON字符串要求）
	return []byte(fmt.Sprintf("%q", time.Time(t).Format("2006-01-02"))), nil
}

// 实现Unmarshaler接口，自定义反序列化逻辑
func (t *MyTime) UnmarshalJSON(data []byte) error {
	// 去除双引号，解析为time.Time
	str := string(data)
	str = str[1 : len(str)-1] // 移除前后的引号
	parsed, err := time.Parse("2006-01-02", str)
	if err != nil {
		return err
	}
	*t = MyTime(parsed)
	return nil
}

type Event struct {
	Title string  `json:"title"`
	Date  MyTime `json:"date"`
}

func main() {
	// 序列化（使用自定义格式）
	event := Event{
		Title: "Go大会",
		Date:  MyTime(time.Date(2024, 10, 1, 0, 0, 0, 0, time.UTC)),
	}
	data, _ := json.MarshalIndent(event, "", "  ")
	fmt.Println("自定义时间序列化:")
	fmt.Println(string(data))
	// 输出：
	// {
	//   "title": "Go大会",
	//   "date": "2024-10-01"
	// }

	// 反序列化（解析自定义格式）
	jsonStr := `{"title":"前端大会", "date":"2024-11-05"}`
	var event2 Event
	json.Unmarshal([]byte(jsonStr), &event2)
	fmt.Printf("反序列化日期: %v\n", time.Time(event2.Date).Format("2006年01月02日")) // 2024年11月05日
}
```

**接口定义**：

go

```go
// 自定义序列化接口
type Marshaler interface {
	MarshalJSON() ([]byte, error)
}

// 自定义反序列化接口
type Unmarshaler interface {
	UnmarshalJSON([]byte) error
}
```

- 实现接口后，`json.Marshal`/`json.Unmarshal`会优先调用自定义方法，覆盖默认行为。

#### 6. 其他实用功能

go

```go
package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	// 示例1：检查JSON是否有效
	validJSON := `{"name":"go"}`
	invalidJSON := `{"name":go}` // 字符串缺少引号
	if err := json.Valid([]byte(validJSON)); err == nil {
		fmt.Println("validJSON是有效的JSON")
	}
	if err := json.Valid([]byte(invalidJSON)); err != nil {
		fmt.Println("invalidJSON无效:", err)
	}

	// 示例2：处理未知字段（使用map[string]interface{}）
	jsonStr := `{"name":"Alice", "age":30, "extra":"未知字段"}`
	var data map[string]interface{}
	json.Unmarshal([]byte(jsonStr), &data)
	fmt.Println("未知字段:", data["extra"]) // 未知字段

	// 示例3：使用json.Number保留数字原始类型（避免float64精度问题）
	var numData map[string]json.Number
	json.Unmarshal([]byte(`{"id": "1234567890123456789"}`), &numData)
	id, _ := numData["id"].Int64() // 直接转换为int64，避免精度丢失
	fmt.Println("大整数ID:", id) // 1234567890123456789
}
```

### 三、`encoding/json`源码核心逻辑分析

`encoding/json`源码位于`src/encoding/json/json.go`，核心围绕**类型映射**和**递归处理**展开，以下解析关键逻辑：

#### 1. `json.Marshal`核心流程

go

```go
// src/encoding/json/encode.go
func Marshal(v interface{}) ([]byte, error) {
	e := &encodeState{}
	err := e.marshal(v, encOpts{escapeHTML: true})
	if err != nil {
		return nil, err
	}
	return e.Bytes(), nil
}

func (e *encodeState) marshal(v interface{}, opts encOpts) error {
	rv := reflect.ValueOf(v)
	return e.reflectValue(rv, opts)
}
```

- **反射驱动**：`Marshal`通过反射（`reflect`包）分析输入值的类型，递归处理每个字段；
- **类型分发**：`reflectValue`函数根据值的类型（基础类型、结构体、切片等）调用不同的编码函数（如`encodeString`、`encodeStruct`）；
- **结构体处理**：对结构体，遍历所有导出字段，解析`json`标签，生成 JSON 键值对。

#### 2. 结构体标签解析

go	

```go
// src/encoding/json/encode.go
func typeFields(t reflect.Type) []field {
	// 递归解析结构体字段（包括嵌套结构体）
	// ...
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		if f.PkgPath != "" { // 非导出字段（首字母小写），跳过
			continue
		}
		// 解析json标签
		tag := f.Tag.Get("json")
		// 解析标签内容（字段名、omitempty等）
		name, opts := parseTag(tag)
		// ...
	}
	// ...
}
```

- 标签解析通过`parseTag`函数提取字段名和选项（如`omitempty`）；
- 非导出字段（`f.PkgPath != ""`）会被直接跳过，这也是私有字段无法序列化的原因。

#### 3. `json.Unmarshal`核心流程

go

```go
// src/encoding/json/decode.go
func Unmarshal(data []byte, v interface{}) error {
	// 检查目标是否为指针
	rv := reflect.ValueOf(v)
	if rv.Kind() != reflect.Ptr || rv.IsNil() {
		return &InvalidUnmarshalError{Type: reflect.TypeOf(v)}
	}
	// 解析JSON并填充目标
	d := newDecoder(bytes.NewReader(data))
	return d.Decode(v)
}
```

- **指针检查**：`Unmarshal`要求目标必须是指针，否则无法修改其值，会返回`InvalidUnmarshalError`；
- **JSON 解析**：内部使用`decoder`解析 JSON 语法树，再根据目标类型递归赋值（如结构体字段匹配、类型转换）。

### 四、总结与最佳实践

`encoding/json`是 Go 处理 JSON 的核心工具，掌握其用法能显著提升数据交互场景的开发效率。核心要点：

1. **字段可见性**：只有导出字段（首字母大写）会被处理，私有字段完全忽略；
2. **结构体标签**：灵活使用`json:"name,omitempty"`等标签控制 JSON 输出，避免冗余字段；
3. **大文件处理**：优先使用`Encoder`/`Decoder`进行流式处理，减少内存占用；
4. **自定义类型**：通过`Marshaler`/`Unmarshaler`接口解决特殊类型（如时间、枚举）的编解码需求；
5. **类型安全**：反序列化时尽量使用结构体而非`map`，利用编译期类型检查减少错误。

常见问题解决方案：

- JSON 字段名与 Go 结构体字段名不一致：用`json:"field_name"`标签映射；
- 空值处理：用`omitempty`忽略零值，或用指针类型保留`null`；
- 大整数精度丢失：用`json.Number`类型接收，再转换为`int64`；
- 嵌套 JSON：用嵌套结构体或`map[string]interface{}`接收。

`encoding/json`的设计体现了 Go “简单而强大” 的哲学，通过反射实现自动映射，同时允许通过接口定制行为，平衡了易用性和灵活性。



# 问答

以下是基于`encoding/json`包内容设计的 7 道八股文（含答案）和 3 道场景题（含答案），覆盖核心知识点与实践应用：

### 一、八股文题目与答案（难度递增）

#### 1. 基础概念题

**题目**：`encoding/json`包中的`json.Marshal`和`json.Unmarshal`分别实现什么功能？请简述其基本使用流程。

**答案**：

- `json.Marshal(v interface{}) ([]byte, error)`：将 Go 数据结构（如结构体、切片、映射等）**序列化**为 JSON 格式的字节切片。
- `json.Unmarshal(data []byte, v interface{}) error`：将 JSON 格式的字节切片**反序列化**为 Go 数据结构（需传入目标变量的指针）。

**基本使用流程**：

- 序列化：定义 Go 数据结构（如`type User struct { Name string; Age int }`），调用`Marshal`传入实例，得到 JSON 字节切片，可转换为字符串查看。
- 反序列化：准备 JSON 字节切片，定义目标 Go 类型（结构体或映射），调用`Unmarshal`传入 JSON 数据和目标指针，完成后目标变量即被填充 JSON 数据。

#### 2. 结构体标签细节题

**题目**：结构体字段的`json`标签（如`json:"name,omitempty"`）中，`name`和`omitempty`的作用分别是什么？若字段为私有（首字母小写），标签是否生效？为什么？

**答案**：

- `name`的作用：指定该字段在 JSON 中对应的键名（如`json:"username"`表示结构体字段`Name`在 JSON 中显示为`"username"`）。
- `omitempty`的作用：当字段值为 “零值”（如`0`、`""`、`false`、`nil`等）时，序列化时**忽略该字段**（不生成对应的 JSON 键值对）。
- 私有字段（首字母小写）的标签**不生效**：
  原因是`encoding/json`包通过反射处理字段，而反射无法访问私有字段（Go 语言的访问控制机制），因此私有字段会被直接忽略，无论是否设置标签。

#### 3. 类型映射与转换题

**题目**：Go 中的基础类型（`int`、`string`、`bool`、`[]T`、`map[string]T`）与 JSON 类型如何映射？反序列化时，若 JSON 字段类型与 Go 结构体字段类型不匹配（如 JSON 字符串赋值给`int`字段），会发生什么？

**答案**：

- **基础类型映射关系**：

  | Go 类型                     | JSON 类型                |
  | --------------------------- | ------------------------ |
  | `int`/`int64`/`float64`等   | 数字（`123`、`3.14`）    |
  | `string`                    | 字符串（`"hello"`）      |
  | `bool`                      | 布尔值（`true`/`false`） |
  | `[]T`（切片）               | 数组（`[1,2,3]`）        |
  | `map[string]T`              | 对象（`{"k":"v"}`）      |
  | 结构体                      | 对象（字段映射为键值对） |
  | `nil`（指针 / 切片 / 映射） | `null`                   |

- **类型不匹配的后果**：反序列化时会返回`json: cannot unmarshal string into Go struct field X of type int`类错误，目标字段不会被赋值（保持零值）。

#### 4. 自定义编解码接口题

**题目**：`json.Marshaler`和`json.Unmarshaler`接口的定义是什么？实现这两个接口有什么作用？请举例说明如何自定义时间类型的序列化格式（如将`time.Time`序列化为`"2006-01-02"`）。

**答案**：

- **接口定义**：

  ```go
  // 自定义序列化接口
  type Marshaler interface {
      MarshalJSON() ([]byte, error)
  }
  
  // 自定义反序列化接口
  type Unmarshaler interface {
      UnmarshalJSON(data []byte) error
  }
  ```

- **作用**：当默认编解码逻辑不满足需求（如特殊格式的时间、枚举类型）时，实现接口可**覆盖默认行为**，定制类型与 JSON 的转换规则。

- **自定义时间序列化示例**：

  go

  ```go
  import (
      "encoding/json"
      "time"
  )
  
  // 自定义时间类型
  type MyDate time.Time
  
  // 实现Marshaler：序列化为"2006-01-02"
  func (d MyDate) MarshalJSON() ([]byte, error) {
      // 转换为time.Time，格式化后用双引号包裹（JSON字符串要求）
      return []byte(time.Time(d).Format(`"2006-01-02"`)), nil
  }
  
  // 使用示例
  type Event struct {
      Title string  `json:"title"`
      Date  MyDate `json:"date"`
  }
  
  func main() {
      event := Event{
          Title: "会议",
          Date:  MyDate(time.Date(2024, 5, 1, 0, 0, 0, 0, time.UTC)),
      }
      data, _ := json.Marshal(event)
      // 输出：{"title":"会议","date":"2024-05-01"}
  }
  ```

#### 5. 流式编解码优势题

**题目**：`json.Encoder`和`json.Decoder`与`json.Marshal`/`json.Unmarshal`相比，核心区别是什么？在什么场景下更适合使用流式编解码？

**答案**：

- **核心区别**：
  - `Marshal`/`Unmarshal`是**一次性处理**：将整个数据加载到内存，完成编解码后返回结果；
  - `Encoder`/`Decoder`是**流式处理**：通过`io.Writer`（如文件、网络连接）和`io.Reader`增量处理数据，无需一次性加载全部内容到内存。
- **适合流式处理的场景**：
  1. 处理**大型 JSON 文件**（如 GB 级）：避免一次性占用大量内存；
  2. 处理**网络流数据**（如 HTTP 响应体、TCP 连接）：实时增量编解码；
  3. 生成 / 读取**多行 JSON**（每行一个 JSON 对象）：通过`Encoder.Encode`和`Decoder.Decode`逐行处理。

#### 6. 常见问题与解决方案题

**题目**：反序列化时，若 JSON 中存在结构体未定义的字段（未知字段），默认会如何处理？如何忽略未知字段或捕获未知字段？另外，大整数（如超过`float64`精度的`1234567890123456789`）反序列化时可能出现精度丢失，如何解决？

**答案**：

- **未知字段的默认处理**：默认会被忽略（不影响已知字段的反序列化）。

- **处理未知字段的方法**：

  1. 忽略未知字段：默认行为，无需额外配置；
  2. 捕获未知字段：使用`map[string]interface{}`接收（所有字段都会被保留），或通过自定义结构体实现`json.Unmarshaler`接口手动解析。

- **大整数精度丢失的解决方案**：
  用`json.Number`类型接收（而非`int`或`float64`），`json.Number`本质是字符串，可安全转换为`int64`或`string`：

  go

  ```go
  var data map[string]json.Number
  json.Unmarshal([]byte(`{"id": "1234567890123456789"}`), &data)
  id, _ := data["id"].Int64() // 正确转换为int64，无精度丢失
  ```

#### 7. 源码与反射机制题

**题目**：`json.Marshal`内部通过反射（`reflect`包）处理数据，请简述其核心流程。为什么序列化结构体时，嵌套结构体的导出字段会被展开为 JSON 对象的字段？

**答案**：

- **`json.Marshal`反射核心流程**：

  1. 调用`reflect.ValueOf(v)`获取输入值的反射值；
  2. 根据反射值的类型（`Kind`）分发到对应的编码函数（如`encodeStruct`处理结构体，`encodeSlice`处理切片）；
  3. 对结构体：遍历所有导出字段（首字母大写），解析`json`标签获取 JSON 键名，递归编码字段值，拼接为 JSON 对象；
  4. 对其他类型（如基础类型、映射）：直接按类型映射规则编码，最终拼接为 JSON 字节切片。

- **嵌套结构体字段被展开的原因**：
  序列化嵌套结构体时，`encodeStruct`函数会递归处理嵌套结构体的导出字段，将其视为当前 JSON 对象的子字段，因此会展开（而非作为嵌套对象的键）。例如：

  go

  ```go
  type A struct { X int }
  type B struct { A; Y string } // 嵌套A
  // 序列化B{X:1, Y:"a"}会得到{"X":1, "Y":"a"}（A的字段被展开）
  ```

### 二、场景题与答案（结合实际开发）

#### 1. API 响应的序列化与反序列化

**题目**：设计一个处理用户 API 的程序，要求：

- 定义`User`结构体，包含`ID`（整数）、`用户名`（映射 JSON 的`username`）、`邮箱`（可选，JSON 为`email`，空值时忽略）、`注册时间`（`time.Time`，序列化格式为`"2006-01-02 15:04:05"`）；
- 将`User`实例序列化为 JSON，确保格式正确；
- 从 JSON 字符串反序列化回`User`实例，验证数据正确性。

请编写核心代码实现。

**答案**：

go

```go
package main

import (
	"encoding/json"
	"fmt"
	"time"
)

// 自定义时间类型，实现Marshaler和Unmarshaler
type CustomTime time.Time

// 序列化：格式化为"2006-01-02 15:04:05"
func (t CustomTime) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf(`"%s"`, time.Time(t).Format("2006-01-02 15:04:05"))), nil
}

// 反序列化：解析"2006-01-02 15:04:05"格式
func (t *CustomTime) UnmarshalJSON(data []byte) error {
	str := string(data[1 : len(data)-1]) // 去除双引号
	parsed, err := time.Parse("2006-01-02 15:04:05", str)
	if err != nil {
		return err
	}
	*t = CustomTime(parsed)
	return nil
}

// User结构体：映射API的JSON结构
type User struct {
	ID         int        `json:"id"`
	Username   string     `json:"username"`   // 映射JSON的username
	Email      *string    `json:"email,omitempty"` // 可选，空值忽略
	RegisterAt CustomTime `json:"register_at"`     // 注册时间
}

func main() {
	// 构建User实例
	email := "user@example.com"
	user := User{
		ID:         1001,
		Username:   "golang",
		Email:      &email,
		RegisterAt: CustomTime(time.Date(2024, 1, 1, 10, 30, 0, 0, time.UTC)),
	}

	// 序列化
	data, err := json.MarshalIndent(user, "", "  ")
	if err != nil {
		fmt.Println("序列化错误:", err)
		return
	}
	fmt.Println("序列化结果:")
	fmt.Println(string(data))
	// 输出：
	// {
	//   "id": 1001,
	//   "username": "golang",
	//   "email": "user@example.com",
	//   "register_at": "2024-01-01 10:30:00"
	// }

	// 反序列化
	jsonStr := `{
		"id": 1002,
		"username": "json",
		"register_at": "2024-02-01 14:20:00"
	}`
	var user2 User
	if err := json.Unmarshal([]byte(jsonStr), &user2); err != nil {
		fmt.Println("反序列化错误:", err)
		return
	}
	fmt.Printf("反序列化结果: ID=%d, 用户名=%s, 注册时间=%v\n",
		user2.ID,
		user2.Username,
		time.Time(user2.RegisterAt).Format("2006-01-02 15:04:05"),
	)
	// 输出：ID=1002, 用户名=json, 注册时间=2024-02-01 14:20:00
}
```

#### 2. 流式处理大型 JSON 数组

**题目**：有一个大型 JSON 文件`users.json`，内容为用户对象数组（格式：`[{"id":1,"name":"A"},{"id":2,"name":"B"},...]`），大小超过 1GB。请实现程序，读取该文件并统计所有用户的数量，要求内存占用控制在 100MB 以内。

**答案**：
使用`json.Decoder`流式读取，避免一次性加载整个文件到内存：

go

```go
package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// User结构体：仅包含需要的字段
type User struct {
	ID int `json:"id"`
}

func main() {
	// 打开大型JSON文件
	file, err := os.Open("users.json")
	if err != nil {
		fmt.Println("打开文件失败:", err)
		return
	}
	defer file.Close()

	// 创建流式解码器
	decoder := json.NewDecoder(file)

	// 读取JSON数组的开始符'['
	token, err := decoder.Token()
	if err != nil {
		fmt.Println("读取开始符失败:", err)
		return
	}
	if token != json.Delim('[') {
		fmt.Println("文件不是JSON数组")
		return
	}

	// 流式读取数组中的每个用户对象
	count := 0
	for decoder.More() { // 检查是否还有元素
		var user User
		// 解码单个用户（仅加载当前对象到内存）
		if err := decoder.Decode(&user); err != nil {
			fmt.Println("解码用户失败:", err)
			break
		}
		count++
	}

	// 读取JSON数组的结束符']'
	if _, err := decoder.Token(); err != nil {
		fmt.Println("读取结束符失败:", err)
		return
	}

	fmt.Printf("总用户数量: %d\n", count)
}
```

**关键逻辑**：

- 用`decoder.Token()`解析 JSON 数组的开始和结束符；
- 用`decoder.More()`判断是否还有元素，`decoder.Decode`逐个解码用户对象，每次仅加载一个对象到内存，控制总内存占用。

#### 3. 处理动态 JSON 结构（含未知字段）

**题目**：调用第三方 API 返回的 JSON 结构不稳定，除固定字段`code`（状态码）和`message`（消息）外，还可能包含多个未知字段（如`data`、`extra`等，结构不固定）。请实现程序，解析该 JSON，提取固定字段，并将所有未知字段以`map[string]interface{}`形式保留。

**答案**：
使用`map[string]interface{}`接收所有字段，再提取固定字段：

go

```go
package main

import (
	"encoding/json"
	"fmt"
)

// API响应的固定结构
type APIResponse struct {
	Code    int               `json:"code"`
	Message string            `json:"message"`
	Unknown map[string]interface{} // 存储未知字段
}

// 实现Unmarshaler接口，自定义反序列化逻辑
func (r *APIResponse) UnmarshalJSON(data []byte) error {
	// 先用map接收所有字段
	var tempMap map[string]interface{}
	if err := json.Unmarshal(data, &tempMap); err != nil {
		return err
	}

	// 提取固定字段
	if code, ok := tempMap["code"].(float64); ok { // JSON数字默认解析为float64
		r.Code = int(code)
		delete(tempMap, "code") // 从map中移除，避免重复
	}
	if msg, ok := tempMap["message"].(string); ok {
		r.Message = msg
		delete(tempMap, "message")
	}

	// 剩余字段作为未知字段
	r.Unknown = tempMap
	return nil
}

func main() {
	// 第三方API返回的JSON（含未知字段data和extra）
	jsonStr := `{
		"code": 200,
		"message": "success",
		"data": {"id": 1, "name": "test"},
		"extra": ["a", "b"]
	}`

	var resp APIResponse
	if err := json.Unmarshal([]byte(jsonStr), &resp); err != nil {
		fmt.Println("反序列化失败:", err)
		return
	}

	// 输出结果
	fmt.Printf("状态码: %d\n", resp.Code)
	fmt.Printf("消息: %s\n", resp.Message)
	fmt.Printf("未知字段: %+v\n", resp.Unknown)
	// 输出：
	// 状态码: 200
	// 消息: success
	// 未知字段: map[data:map[id:1 name:test] extra:[a b]]
}
```

**关键逻辑**：

- 自定义`APIResponse`的`UnmarshalJSON`方法，先用`map`接收所有字段；
- 从`map`中提取固定字段`code`和`message`，剩余字段存入`Unknown` map，灵活处理动态结构。