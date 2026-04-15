### Go 语言`strconv`标准库深入讲解与示例

#### 一、`strconv`包核心功能概述

`strconv`是 Go 语言处理**字符串与基本数据类型转换**的标准库，提供了字符串与整数（`int`、`int64`等）、浮点数（`float64`）、布尔值（`bool`）之间的相互转换功能。其核心价值在于：

- 支持多种进制（2-36 进制）的整数转换；
- 提供精确的浮点数解析与格式化（控制精度、科学计数法等）；
- 严格的错误处理（转换失败时返回详细错误信息）；
- 覆盖常见数据类型转换场景（如配置解析、命令行参数处理、JSON 序列化等）。

`strconv`是数据交互场景的基础工具，例如将用户输入的字符串转换为数字进行计算，或把计算结果格式化为字符串展示。

### 二、核心功能与示例代码

#### 1. 字符串与整数转换（最常用场景）

`Atoi`（字符串转整数）和`Itoa`（整数转字符串）是最基础的转换函数，对应`ParseInt`和`FormatInt`的简化版。

go

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 1. 字符串转整数（Atoi = ParseInt(s, 10, 0) + 转换为int）
	str := "123"
	num, err := strconv.Atoi(str)
	if err != nil {
		fmt.Printf("Atoi失败: %v\n", err)
	} else {
		fmt.Printf("Atoi转换: %s → %d (类型: %T)\n", str, num, num) // 123 → 123 (类型: int)
	}

	// 转换失败示例（非数字字符串）
	_, err = strconv.Atoi("12a3")
	fmt.Printf("Atoi错误示例: %v\n", err) // strconv.Atoi: parsing "12a3": invalid syntax

	// 2. 整数转字符串（Itoa = FormatInt(int64(n), 10)）
	num2 := 456
	str2 := strconv.Itoa(num2)
	fmt.Printf("Itoa转换: %d → %s (类型: %T)\n", num2, str2, str2) // 456 → "456" (类型: string)

	// 3. 更灵活的整数转换（支持任意进制）
	// ParseInt(s, 进制, 位数) → 转换为int64
	// 进制范围：2-36，0表示自动判断（0x开头为16进制，0开头为8进制，否则10进制）
	hexNum, err := strconv.ParseInt("1a", 16, 64) // 16进制"1a" → 26
	if err == nil {
		fmt.Printf("16进制转换: 1a → %d\n", hexNum) // 26
	}

	octNum, err := strconv.ParseInt("077", 8, 64) // 8进制"077" → 63
	if err == nil {
		fmt.Printf("8进制转换: 077 → %d\n", octNum) // 63
	}

	// FormatInt(n, 进制) → 整数转指定进制字符串
	binStr := strconv.FormatInt(10, 2) // 10进制10 → 二进制"1010"
	fmt.Printf("二进制转换: 10 → %s\n", binStr) // 1010
}
```

**关键函数解析**：

- `Atoi(s string) (int, error)`：简化版的 10 进制字符串转`int`，内部调用`ParseInt(s, 10, 0)`；

- `Itoa(n int) string`：简化版的 10 进制整数转字符串，内部调用`FormatInt(int64(n), 10)`；

- ```
  ParseInt(s string, base int, bitSize int) (int64, error)
  ```

  ：

  - `base`：进制（2-36，0 自动识别）；
  - `bitSize`：目标整数位数（0=`int`，8=`int8`，16=`int16`等），超出范围返回错误；

- `FormatInt(n int64, base int) string`：将`int64`转换为`base`进制的字符串（base=10 时与`Itoa`等效）。

#### 2. 字符串与浮点数转换

`ParseFloat`（字符串转浮点数）和`FormatFloat`（浮点数转字符串）支持精度控制和科学计数法。

go

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 1. 字符串转浮点数（ParseFloat）
	// ParseFloat(s, bitSize) → 转换为float64（bitSize=64）或float32（bitSize=32）
	f1, err := strconv.ParseFloat("3.1415", 64)
	if err == nil {
		fmt.Printf("ParseFloat: 3.1415 → %.4f (类型: %T)\n", f1, f1) // 3.1415 (float64)
	}

	// 支持科学计数法
	f2, err := strconv.ParseFloat("1.23e-4", 64) // 1.23×10^-4 = 0.000123
	if err == nil {
		fmt.Printf("科学计数法转换: 1.23e-4 → %.6f\n", f2) // 0.000123
	}

	// 转换失败示例（无效格式）
	_, err = strconv.ParseFloat("3.14.15", 64)
	fmt.Printf("ParseFloat错误示例: %v\n", err) // strconv.ParseFloat: parsing "3.14.15": invalid syntax

	// 2. 浮点数转字符串（FormatFloat）
	// FormatFloat(f, 格式, 精度, bitSize)
	// 格式：'f'（普通）、'e'（科学计数）、'g'（自动选择）、'b'（二进制指数）等
	f := 123.456789

	// 'f'格式：保留2位小数
	s1 := strconv.FormatFloat(f, 'f', 2, 64)
	fmt.Printf("FormatFloat(f, 'f', 2): %.2f → %s\n", f, s1) // 123.46

	// 'e'格式：科学计数法，保留3位小数
	s2 := strconv.FormatFloat(f, 'e', 3, 64)
	fmt.Printf("FormatFloat(f, 'e', 3): %.6f → %s\n", f, s2) // 1.235e+02

	// 'g'格式：自动选择最简洁的表示（去除末尾0）
	s3 := strconv.FormatFloat(123.400, 'g', -1, 64) // 精度-1表示自动
	fmt.Printf("FormatFloat(g): 123.400 → %s\n", s3) // 123.4
}
```

**格式参数说明**：

- ```
  fmt
  ```

  （格式标记）：

  - `'f'`：`-ddd.dddd`（普通小数格式）；
  - `'e'`：`-d.dddde±dd`（科学计数法）；
  - `'g'`：自动选择`f`或`e`中更简洁的形式（去除无意义的 0）；

- ```
  prec
  ```

  （精度）：

  - 对`'f'`/`'e'`：表示小数点后保留的位数；
  - 对`'g'`：表示有效数字的最大数量；
  - 负数表示使用默认精度（`'f'`/`'e'`默认 6 位，`'g'`默认所有有效数字）。

#### 3. 字符串与布尔值转换

`ParseBool`（字符串转布尔值）和`FormatBool`（布尔值转字符串）规则明确，仅支持特定字符串。

go

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 1. 字符串转布尔值（ParseBool）
	// 仅支持"true"（1）、"false"（0）、"1"、"0"，不区分大小写？不，严格区分！
	b1, err := strconv.ParseBool("true")
	fmt.Printf("ParseBool(true): %v (错误: %v)\n", b1, err) // true (错误: <nil>)

	b2, err := strconv.ParseBool("1")
	fmt.Printf("ParseBool(1): %v\n", b2) // true

	b3, err := strconv.ParseBool("false")
	fmt.Printf("ParseBool(false): %v\n", b3) // false

	b4, err := strconv.ParseBool("0")
	fmt.Printf("ParseBool(0): %v\n", b4) // false

	// 转换失败示例（不支持的字符串）
	_, err = strconv.ParseBool("yes")
	fmt.Printf("ParseBool错误示例: %v\n", err) // strconv.ParseBool: parsing "yes": invalid syntax

	// 2. 布尔值转字符串（FormatBool）
	s1 := strconv.FormatBool(true)
	fmt.Printf("FormatBool(true): %s\n", s1) // "true"

	s2 := strconv.FormatBool(false)
	fmt.Printf("FormatBool(false): %s\n", s2) // "false"
}
```

**转换规则**：

- `ParseBool`仅接受`"true"`、`"false"`、`"1"`、`"0"`四个字符串（严格区分大小写），其他字符串返回错误；
- `FormatBool`仅返回`"true"`或`"false"`，无其他格式。

#### 4. 其他实用功能（解析无符号整数、判断合法性）

`strconv`还提供无符号整数转换、字符串是否为数字的判断等功能。

go

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 1. 无符号整数转换（ParseUint/FormatUint）
	// ParseUint与ParseInt类似，但返回uint64
	u, err := strconv.ParseUint("18446744073709551615", 10, 64) // uint64最大值
	if err == nil {
		fmt.Printf("ParseUint: 最大uint64 → %d\n", u) // 18446744073709551615
	}

	// FormatUint将uint64转换为指定进制字符串
	uStr := strconv.FormatUint(42, 16) // 42的16进制是"2a"
	fmt.Printf("FormatUint(42, 16): %s\n", uStr) // 2a

	// 2. 判断字符串是否为合法整数（配合错误处理）
	isValidInt := func(s string) bool {
		_, err := strconv.ParseInt(s, 10, 64)
		return err == nil
	}
	fmt.Println("'123'是合法整数:", isValidInt("123"))   // true
	fmt.Println("'12a3'是合法整数:", isValidInt("12a3")) // false

	// 3. 字符串转整数（忽略错误的简化写法，需确保字符串合法）
	// 仅在明确字符串格式正确时使用（如配置文件中的固定值）
	num := int(strconv.ParseInt("456", 10, 0)) // 风险：转换失败会panic
	fmt.Println("忽略错误的转换:", num) // 456
}
```

**注意**：

- `ParseUint`与`ParseInt`的区别在于返回值类型（`uint64` vs `int64`），且`ParseUint`不支持负数；
- 忽略错误直接转换（如`int(strconv.ParseInt(...))`）在字符串非法时会触发`panic`，仅适合已知安全的场景（如硬编码的字符串）。

### 三、`strconv`包源码核心逻辑

`strconv`的转换函数核心是**字符串解析**和**格式生成**，以整数转换为例，其流程如下：

#### 1. 字符串转整数（`ParseInt`）

go

```go
// 简化逻辑：
func ParseInt(s string, base int, bitSize int) (int64, error) {
	// 1. 校验参数（base范围、字符串非空）
	// 2. 处理正负号（记录符号，截取数字部分）
	// 3. 解析数字（按base进制逐字符转换）
	// 4. 检查范围（是否超出bitSize对应的整数范围）
	// 5. 返回结果（应用符号）
}
```

- 数字解析时，每个字符（0-9、a-z、A-Z）对应的值为其 ASCII 码减去基准值（如`'0'`→0，`'a'`→10）；
- 范围检查通过与目标类型的最大 / 最小值比较实现（如`int8`的范围是 - 128~127）。

#### 2. 浮点数转字符串（`FormatFloat`）

go

```go
// 简化逻辑：
func FormatFloat(f float64, fmt byte, prec, bitSize int) string {
	// 1. 处理特殊值（NaN、Inf）
	// 2. 根据格式标记（f/e/g）选择转换模式
	// 3. 按精度截取小数部分（四舍五入）
	// 4. 生成最终字符串（添加符号、小数点、指数等）
}
```

- 对`NaN`返回`"NaN"`，对正负无穷返回`"Inf"`/`"-Inf"`；
- 四舍五入采用 “银行家舍入法”（对.5 的情况向偶数取整）。

### 四、总结与最佳实践

`strconv`是数据类型转换的核心工具，使用时需注意：

1. **错误处理**：转换函数返回的`error`必须处理（除非明确字符串格式合法），常见错误包括：
   - 字符串包含非数字字符（如`"12a3"`）；
   - 数值超出目标类型范围（如`"128"`转`int8`）；
   - 格式不合法（如浮点数多小数点`"3.14.15"`）。
2. **精度控制**：
   - 浮点数转换时，`prec`参数控制精度，需根据业务场景设置（如金额保留 2 位小数）；
   - 整数转换注意`bitSize`参数，避免溢出（如`int`在 32 位系统是 4 字节，64 位系统是 8 字节，建议明确指定`bitSize`）。
3. **性能考量**：
   - 频繁转换时，避免重复创建临时变量；
   - 已知格式的字符串（如固定长度数字）可考虑手动解析提升性能，但通常`strconv`的效率已足够。
4. **特殊值处理**：
   - 浮点数转换需考虑`NaN`、`Inf`等特殊值（如`ParseFloat("NaN", 64)`返回`NaN`，无错误）；
   - 布尔值转换仅支持特定字符串，需提前验证输入。

掌握`strconv`能可靠处理字符串与基本类型的转换，是数据解析、用户输入处理、日志格式化等场景的必备技能。



以下是基于`strconv`包内容设计的 7 道八股文（含答案）和 3 道场景题（含答案），覆盖核心知识点与实践应用：

### 一、八股文题目与答案（难度递增）

#### 1. 基础转换函数题

**题目**：`strconv.Atoi`和`strconv.Itoa`的作用是什么？它们与`strconv.ParseInt`和`strconv.FormatInt`有什么关系？请举例说明其使用场景。

**答案**：

- **`Atoi`与`Itoa`的作用**：
  - `strconv.Atoi(s string) (int, error)`：将 10 进制字符串转换为`int`类型（如`"123"`→`123`）；
  - `strconv.Itoa(n int) string`：将`int`类型整数转换为 10 进制字符串（如`123`→`"123"`）。
- **与`ParseInt`/`FormatInt`的关系**：
  `Atoi`和`Itoa`是简化版函数：
  - `Atoi(s)`等价于`ParseInt(s, 10, 0)`后转换为`int`；
  - `Itoa(n)`等价于`FormatInt(int64(n), 10)`。
- **使用场景**：
  适用于简单的 10 进制字符串与整数转换，如解析用户输入的数字字符串（`"456"`→`456`）、将计算结果格式化为字符串展示（`789`→`"789"`）。

#### 2. 整数转换参数题

**题目**：`strconv.ParseInt(s string, base int, bitSize int) (int64, error)`中，`base`和`bitSize`参数的含义是什么？`base`的取值范围是多少？`bitSize`为 0、8、64 时分别表示什么？

**答案**：

- **`base`参数**：指定字符串`s`的进制（如 2 表示二进制、10 表示十进制），取值范围为**2-36**，特殊值 0 表示 “自动判断”（`0x`开头为 16 进制，`0`开头为 8 进制，否则为 10 进制）。

- **`bitSize`参数**：指定目标整数的位数，用于限制转换结果的范围：

  - `bitSize=0`：转换为`int`类型（取决于系统位数，32 位系统为 4 字节，64 位为 8 字节）；
  - `bitSize=8`：转换为`int8`类型（范围 - 128~127）；
  - `bitSize=16`：转换为`int16`类型；
  - `bitSize=32`：转换为`int32`类型；
  - `bitSize=64`：转换为`int64`类型。

  若转换结果超出目标类型范围，会返回`strconv.OutOfRangeError`。

#### 3. 浮点数转换格式题

**题目**：`strconv.FormatFloat(f float64, fmt byte, prec int, bitSize int) string`中，`fmt`（格式标记）和`prec`（精度）参数的作用是什么？请分别说明`'f'`、`'e'`、`'g'`三种格式的特点。

**答案**：

- **`fmt`（格式标记）**：控制浮点数的字符串表示形式，常用取值：

  - `'f'`：普通小数格式（如`-123.456`）；
  - `'e'`：科学计数法格式（如`-1.23456e+02`）；
  - `'g'`：自动选择`'f'`或`'e'`中更简洁的形式（去除无意义的 0）。

- **`prec`（精度）**：控制数字的显示精度：

  - 对`'f'`/`'e'`：表示小数点后保留的位数（如`prec=2`时，`123.456`→`"123.46"`）；
  - 对`'g'`：表示有效数字的最大数量（如`prec=3`时，`123.456`→`"123"`）；
  - 负数表示使用默认精度（`'f'`/`'e'`默认 6 位，`'g'`默认所有有效数字）。

- **示例**：

  go

  

  

  

  

  

  ```go
  f := 123.4567
  fmt.Println(FormatFloat(f, 'f', 2, 64)) // "123.46"（保留2位小数）
  fmt.Println(FormatFloat(f, 'e', 2, 64)) // "1.23e+02"（科学计数法，2位小数）
  fmt.Println(FormatFloat(f, 'g', 3, 64)) // "123"（3位有效数字）
  ```

#### 4. 布尔值转换规则题

**题目**：`strconv.ParseBool(s string) (bool, error)`支持哪些输入字符串？转换结果是什么？`strconv.FormatBool(b bool) string`的返回值有哪些？为什么布尔值转换不支持大小写不敏感？

**答案**：

- **`ParseBool`支持的输入及结果**：
  仅支持 4 种字符串，转换规则严格：
  - `"true"` → `true`；
  - `"1"` → `true`；
  - `"false"` → `false`；
  - `"0"` → `false`。
    其他字符串（如`"yes"`、`"TRUE"`、`"False"`）均返回`strconv.InvalidSyntaxError`。
- **`FormatBool`的返回值**：
  仅两种可能：`"true"`（输入`true`时）或`"false"`（输入`false`时）。
- **不支持大小写不敏感的原因**：
  设计上追求严格性，避免歧义（如`"TRUE"`与`"true"`在不同场景可能有不同含义），同时简化解析逻辑（无需额外处理大小写转换）。

#### 5. 错误处理类型题

**题目**：`strconv`包在转换失败时返回哪些常见错误类型？请举例说明每种错误的触发场景。

**答案**：
`strconv`的错误主要分为两类：语法错误和范围错误，具体包括：

1. **`\*strconv.SyntaxError`**：字符串格式不合法，无法解析。
   触发场景：

   - 整数转换时包含非数字字符（如`"12a3"`、`"0xG"`）；
   - 浮点数转换时格式错误（如`"3.14.15"`、`"1.2e"`）；
   - 布尔值转换时输入非支持字符串（如`"yes"`、`"t"`）。

2. **`\*strconv.NumError`**：包含两种子错误：

   - `ErrSyntax`：同`SyntaxError`（历史兼容，本质一致）；

   - ```
     ErrRange
     ```

     ：转换结果超出目标类型的范围。

     触发场景：

     - 整数转换时数值超出`bitSize`指定的类型范围（如`"128"`转`int8`）；
     - 浮点数转换为整数时超出`int64`范围（如`"1e309"`转`int64`）。

示例：

go











```go
_, err := strconv.ParseInt("256", 10, 8) // 256超出int8范围（-128~127）
fmt.Println(err) // strconv.ParseInt: parsing "256": value out of range
```

#### 6. 无符号整数转换题

**题目**：`strconv.ParseUint`与`strconv.ParseInt`的区别是什么？`strconv.FormatUint`的使用场景是什么？请举例说明如何将无符号整数转换为 16 进制字符串。

**答案**：

- **`ParseUint`与`ParseInt`的区别**：

  - 返回值类型：`ParseUint`返回`uint64`（无符号），`ParseInt`返回`int64`（有符号）；
  - 处理负数：`ParseUint`不支持负数字符串（如`"-123"`会返回语法错误），`ParseInt`支持；
  - 参数相同：均为`(s string, base int, bitSize int)`，`bitSize`对`ParseUint`表示`uint`类型（如`8`对应`uint8`）。

- **`FormatUint`的使用场景**：将`uint64`类型无符号整数转换为指定进制的字符串，适用于处理非负整数（如 ID、哈希值）的格式化。

- **无符号整数转 16 进制字符串示例**：

  go

  

  

  

  

  

  ```go
  // 将uint64值转换为16进制字符串（小写）
  num := uint64(255)
  hexStr := strconv.FormatUint(num, 16)
  fmt.Println(hexStr) // "ff"
  
  // 转换为大写16进制（需手动处理）
  import "strings"
  hexStrUpper := strings.ToUpper(hexStr)
  fmt.Println(hexStrUpper) // "FF"
  ```

#### 7. 最佳实践与性能题

**题目**：在使用`strconv`进行转换时，有哪些最佳实践？为什么不建议忽略转换错误（如`int(strconv.ParseInt(s, 10, 0))`）？频繁转换时如何提升性能？

**答案**：

- **最佳实践**：
  1. **必须处理错误**：转换失败是常见场景（如用户输入错误），忽略错误可能导致`panic`；
  2. **明确`bitSize`**：避免依赖`int`的系统位数（如用`bitSize=32`确保在 64 位系统上仍为 32 位整数）；
  3. **浮点数精度控制**：根据业务场景设置`prec`（如金额保留 2 位小数）；
  4. **特殊值处理**：浮点数转换需考虑`NaN`、`Inf`（如`ParseFloat("NaN", 64)`返回`NaN`，无错误）。
- **不建议忽略错误的原因**：
  `strconv.ParseInt`等函数在转换失败时返回非`nil`错误，此时返回的数值为 “零值”（如`0`），直接转换为`int`会导致逻辑错误（无法区分 “有效 0” 和 “转换失败”）；若字符串格式严重错误（如`"abc"`），甚至可能触发`panic`。
- **提升频繁转换性能的方法**：
  1. 复用缓冲区：对`Format`类函数，可使用`strconv.AppendInt`等`Append`系列函数（直接写入`[]byte`缓冲区，减少内存分配）；
  2. 预校验格式：对已知格式的字符串（如固定长度数字），可提前验证减少重复解析；
  3. 避免不必要转换：如已确定字符串为数字，可缓存转换结果。

### 二、场景题与答案（结合实际开发）

#### 1. 命令行参数解析

**题目**：实现一个程序，从命令行接收 3 个参数（整数、浮点数、布尔值的字符串表示），将其转换为对应类型后打印。要求：

- 若参数无法转换，打印错误信息（如 “无效整数: 12a”）；
- 整数参数支持 10 进制和 16 进制（`0x`开头）；
- 浮点数参数保留 2 位小数后打印；
- 布尔值参数仅接受`"true"`/`"false"`/`"1"`/`"0"`。

**答案**：

go

```go
package main

import (
	"fmt"
	"os"
	"strconv"
)

func main() {
	// 检查参数数量
	if len(os.Args) != 4 {
		fmt.Println("用法: go run main.go <整数> <浮点数> <布尔值>")
		os.Exit(1)
	}

	// 解析整数（支持10进制和16进制）
	intStr := os.Args[1]
	num, err := strconv.ParseInt(intStr, 0, 64) // base=0自动识别进制
	if err != nil {
		fmt.Printf("无效整数: %s, 错误: %v\n", intStr, err)
	} else {
		fmt.Printf("整数: %d\n", num)
	}

	// 解析浮点数（保留2位小数）
	floatStr := os.Args[2]
	f, err := strconv.ParseFloat(floatStr, 64)
	if err != nil {
		fmt.Printf("无效浮点数: %s, 错误: %v\n", floatStr, err)
	} else {
		// 格式化保留2位小数
		fmt.Printf("浮点数: %.2f\n", f)
	}

	// 解析布尔值
	boolStr := os.Args[3]
	b, err := strconv.ParseBool(boolStr)
	if err != nil {
		fmt.Printf("无效布尔值: %s, 错误: %v\n", boolStr, err)
	} else {
		fmt.Printf("布尔值: %v\n", b)
	}
}
```

**运行示例**：

bash

```bash
# 正确输入
go run main.go 0x1a 3.1415 true
# 输出：
# 整数: 26
# 浮点数: 3.14
# 布尔值: true

# 错误输入
go run main.go 12a 3.14.15 yes
# 输出：
# 无效整数: 12a, 错误: strconv.ParseInt: parsing "12a": invalid syntax
# 无效浮点数: 3.14.15, 错误: strconv.ParseFloat: parsing "3.14.15": invalid syntax
# 无效布尔值: yes, 错误: strconv.ParseBool: parsing "yes": invalid syntax
```

#### 2. 配置文件数值转换

**题目**：一个配置文件中包含以下字符串配置项，需解析为对应类型：

- `max_connections: "1000"` → `int`；
- `timeout_seconds: "3.5"` → `float64`（保留 1 位小数）；
- `enable_feature: "1"` → `bool`；
- `memory_limit_mb: "0x400"` → `uint64`（16 进制，转换为 10 进制）。

请编写代码解析这些配置项，处理可能的错误，并打印结果。

**答案**：

go

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 模拟配置文件中的字符串
	configs := map[string]string{
		"max_connections":  "1000",
		"timeout_seconds":  "3.5",
		"enable_feature":   "1",
		"memory_limit_mb":  "0x400", // 16进制，对应1024
	}

	// 解析max_connections（int）
	maxConns, err := strconv.Atoi(configs["max_connections"])
	if err != nil {
		fmt.Printf("解析max_connections失败: %v\n", err)
	} else {
		fmt.Printf("最大连接数: %d (类型: %T)\n", maxConns, maxConns)
	}

	// 解析timeout_seconds（float64，保留1位小数）
	timeout, err := strconv.ParseFloat(configs["timeout_seconds"], 64)
	if err != nil {
		fmt.Printf("解析timeout_seconds失败: %v\n", err)
	} else {
		// 格式化保留1位小数
		timeoutStr := strconv.FormatFloat(timeout, 'f', 1, 64)
		fmt.Printf("超时时间: %s秒 (原始值: %.2f)\n", timeoutStr, timeout)
	}

	// 解析enable_feature（bool）
	enable, err := strconv.ParseBool(configs["enable_feature"])
	if err != nil {
		fmt.Printf("解析enable_feature失败: %v\n", err)
	} else {
		fmt.Printf("功能启用: %v (类型: %T)\n", enable, enable)
	}

	// 解析memory_limit_mb（16进制→uint64）
	memLimit, err := strconv.ParseUint(configs["memory_limit_mb"], 0, 64) // base=0自动识别16进制
	if err != nil {
		fmt.Printf("解析memory_limit_mb失败: %v\n", err)
	} else {
		fmt.Printf("内存限制: %d MB (16进制原值: %s)\n", memLimit, configs["memory_limit_mb"])
	}
}
```

**输出**：

plaintext

```plaintext
最大连接数: 1000 (类型: int)
超时时间: 3.5秒 (原始值: 3.50)
功能启用: true (类型: bool)
内存限制: 1024 MB (16进制原值: 0x400)
```

#### 3. 用户输入验证与转换

**题目**：实现一个函数`ParseInput(input string) (interface{}, error)`，功能如下：

- 若`input`是合法整数（支持 10/16/8 进制），返回`int64`；
- 若`input`是合法浮点数（支持科学计数法），返回`float64`；
- 若`input`是合法布尔值（`"true"`/`"false"`/`"1"`/`"0"`），返回`bool`；
- 否则返回错误信息（如 “无法解析输入: abc”）。

**答案**：

go

```go
package main

import (
	"errors"
	"fmt"
	"strconv"
)

// ParseInput 解析输入字符串为对应类型（int64/float64/bool）
func ParseInput(input string) (interface{}, error) {
	// 尝试解析为布尔值
	if b, err := strconv.ParseBool(input); err == nil {
		return b, nil
	}

	// 尝试解析为整数（支持多进制）
	if num, err := strconv.ParseInt(input, 0, 64); err == nil {
		return num, nil
	}

	// 尝试解析为浮点数（支持科学计数法）
	if f, err := strconv.ParseFloat(input, 64); err == nil {
		return f, nil
	}

	// 所有尝试失败
	return nil, errors.New("无法解析输入: " + input)
}

func main() {
	// 测试用例
	testCases := []string{
		"123",    // 整数
		"0x1a",   // 16进制整数
		"3.14",   // 浮点数
		"1.2e-3", // 科学计数法浮点数
		"true",   // 布尔值
		"0",      // 布尔值
		"abc",    // 无效输入
	}

	for _, input := range testCases {
		result, err := ParseInput(input)
		if err != nil {
			fmt.Printf("输入: %-8s 错误: %v\n", input, err)
		} else {
			fmt.Printf("输入: %-8s 类型: %T   值: %v\n", input, result, result)
		}
	}
}
```

**输出**：

plaintext

```plaintext
输入: 123      类型: int64   值: 123
输入: 0x1a     类型: int64   值: 26
输入: 3.14     类型: float64   值: 3.14
输入: 1.2e-3   类型: float64   值: 0.0012
输入: true     类型: bool   值: true
输入: 0        类型: bool   值: false
输入: abc      错误: 无法解析输入: abc
```

**关键逻辑**：

- 按 “布尔值→整数→浮点数” 的顺序尝试解析（优先级从高到低，避免 “1” 被解析为整数而非布尔值）；
- 整数解析使用`base=0`支持多进制，浮点数解析支持科学计数法；
- 所有解析失败时返回统一错误，明确提示输入无效。