### Go 语言`log`标准库深入讲解与示例

#### 一、`log`包核心功能概述

`log`包是 Go 语言标准库中用于日志输出的基础包，提供了简单的日志记录功能，支持**日志格式化**、**输出控制**、**前缀设置**和**级别区分**（通过`Fatal`/`Panic`间接实现）。其设计简洁，适合基础日志需求，复杂场景可基于此扩展。

### 二、核心功能与示例代码（50+）

#### 1. 基本日志输出（`Print`系列）

`Print`/`Printf`/`Println`是最基础的日志输出函数，输出内容后不影响程序执行。

go

```go
package main

import "log"

func main() {
	// Print：直接输出参数
	log.Print("基本日志输出\n")

	// Printf：格式化输出
	log.Printf("格式化日志：%s, %d\n", "消息", 123)

	// Println：自动添加空格和换行
	log.Println("自动换行日志", "多参数")
}
```

#### 2. 终止程序日志（`Fatal`系列）

`Fatal`/`Fatalf`/`Fatalln`输出日志后会调用`os.Exit(1)`终止程序，常用于严重错误。

go

```go
package main

import "log"

func main() {
	// Fatal：输出后退出
	// log.Fatal("严重错误，程序退出")

	// Fatalf：格式化输出后退出
	// log.Fatalf("格式化严重错误：%s", "配置文件缺失")

	// Fatalln：自动换行后退出
	// log.Fatalln("自动换行的严重错误")

	log.Println("如果上面的Fatal注释掉，会执行到这里")
}
```

#### 3. 触发恐慌日志（`Panic`系列）

`Panic`/`Panicf`/`Panicln`输出日志后会触发`panic`，可被`recover`捕获，常用于需要堆栈跟踪的错误。

go

```go
package main

import "log"

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Println("捕获到恐慌：", err)
		}
	}()

	// Panic：输出后触发恐慌
	// log.Panic("普通错误，触发恐慌")

	// Panicf：格式化输出后触发恐慌
	// log.Panicf("格式化错误：%d", 500)

	// Panicln：自动换行后触发恐慌
	// log.Panicln("自动换行的恐慌日志")

	log.Println("如果上面的Panic注释掉，会执行到这里")
}
```

#### 4. 日志格式控制（`Flags`）

`log`包通过`Flags`控制日志前缀格式，支持多种组合（如时间、文件名、行号等）。

go

```go
package main

import "log"

func main() {
	// 重置默认Flags（默认仅Ldate|Ltime）
	log.SetFlags(0)
	log.Println("无任何前缀")

	// Ldate：添加日期（2009/01/23）
	log.SetFlags(log.Ldate)
	log.Println("带日期的日志")

	// Ltime：添加时间（01:23:45）
	log.SetFlags(log.Ltime)
	log.Println("带时间的日志")

	// Lmicroseconds：添加微秒级时间（01:23:45.678901）
	log.SetFlags(log.Ltime | log.Lmicroseconds)
	log.Println("带微秒时间的日志")

	// Llongfile：显示完整文件名和行号（/a/b/c.go:23）
	log.SetFlags(log.Llongfile)
	log.Println("带完整文件路径的日志")

	// Lshortfile：显示短文件名和行号（c.go:23）
	log.SetFlags(log.Lshortfile)
	log.Println("带短文件名的日志")

	// LUTC：时间使用UTC时区
	log.SetFlags(log.Ldate | log.Ltime | log.LUTC)
	log.Println("UTC时区的日志")

	// Lmsgprefix：前缀放在消息前（默认前缀在最前）
	log.SetFlags(log.Lmsgprefix | log.Ldate)
	log.SetPrefix("[前缀]")
	log.Println("前缀在消息前的日志")

	// 组合示例：日期+时间+短文件名
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("组合格式的日志")
}
```

#### 5. 日志前缀（`Prefix`）

通过`SetPrefix`设置日志前缀，用于区分不同模块或日志类型。

go

```go
package main

import "log"

func main() {
	// 设置普通前缀
	log.SetPrefix("[INFO] ")
	log.Println("这是信息日志")

	// 结合Flags使用
	log.SetFlags(log.Ltime | log.Lshortfile)
	log.SetPrefix("[DEBUG] ")
	log.Println("调试日志，带时间和行号")

	// 动态修改前缀
	log.SetPrefix("[WARN] ")
	log.Println("警告日志")

	log.SetPrefix("[ERROR] ")
	log.Println("错误日志")
}
```

#### 6. 输出目的地（`SetOutput`）

默认日志输出到`os.Stderr`，可通过`SetOutput`重定向到文件或其他`io.Writer`。

go

```go
package main

import (
	"log"
	"os"
)

func main() {
	// 输出到文件
	file, err := os.Create("app.log")
	if err != nil {
		log.Fatal("创建日志文件失败：", err)
	}
	defer file.Close()

	// 重定向输出到文件
	log.SetOutput(file)
	log.Println("这条日志会写入文件")

	// 同时输出到控制台和文件（使用io.MultiWriter）
	multi := io.MultiWriter(os.Stdout, file)
	log.SetOutput(multi)
	log.Println("这条日志同时输出到控制台和文件")
}
```

#### 7. 自定义`Logger`实例

通过`log.New`创建自定义日志器，支持不同配置（前缀、Flags、输出目的地）。

go

```go
package main

import (
	"log"
	"os"
)

func main() {
	// 创建文件输出的日志器
	file, _ := os.Create("custom.log")
	defer file.Close()

	// 自定义日志器：前缀+日期时间+输出到文件
	customLogger := log.New(file, "[CUSTOM] ", log.Ldate|log.Ltime)
	customLogger.Println("自定义日志器的第一条日志")
	customLogger.Printf("自定义格式化日志：%d\n", 100)

	// 控制台输出的调试日志器
	debugLogger := log.New(os.Stdout, "[DEBUG] ", log.Ltime|log.Lshortfile)
	debugLogger.Println("调试信息")

	// 错误日志器
	errorLogger := log.New(os.Stderr, "[ERROR] ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLogger.Println("发生错误")
}
```

#### 8. 日志分级示例（基于自定义`Logger`）

`log`包本身不直接支持`DEBUG`/`INFO`/`ERROR`等级别，可通过多个`Logger`模拟。

go

```go
package main

import (
	"log"
	"os"
)

// 定义不同级别的日志器
var (
	DebugLogger *log.Logger
	InfoLogger  *log.Logger
	WarnLogger  *log.Logger
	ErrorLogger *log.Logger
)

func init() {
	// 输出到控制台
	stdout := os.Stdout
	stderr := os.Stderr

	// 通用Flags：日期+时间+短文件名
	flags := log.Ldate | log.Ltime | log.Lshortfile

	// 初始化各级日志器
	DebugLogger = log.New(stdout, "[DEBUG] ", flags)
	InfoLogger = log.New(stdout, "[INFO] ", flags)
	WarnLogger = log.New(stdout, "[WARN] ", flags)
	ErrorLogger = log.New(stderr, "[ERROR] ", flags)
}

func main() {
	DebugLogger.Println("调试：进入main函数")
	InfoLogger.Println("信息：程序启动")
	WarnLogger.Println("警告：内存使用过高")
	ErrorLogger.Println("错误：数据库连接失败")
}
```

#### 9. 带锁的线程安全日志

`log`包的`Logger`默认是线程安全的（通过互斥锁），可在多协程中安全使用。

go

```go
package main

import (
	"log"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	// 10个协程同时输出日志
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			log.Printf("协程%d：输出日志\n", id)
		}(i)
	}

	wg.Wait()
	log.Println("所有协程日志输出完成")
}
```

#### 10. 日志轮转简单实现（按文件大小）

通过自定义`io.Writer`实现简单的日志轮转（当日志文件达到指定大小时创建新文件）。

go

```go
package main

import (
	"io"
	"log"
	"os"
	"path/filepath"
)

// 自定义轮转Writer
type RotatingFileWriter struct {
	filename string  // 基础文件名
	maxSize  int64   // 最大文件大小（字节）
	current  *os.File // 当前文件句柄
}

func NewRotatingFileWriter(filename string, maxSize int64) (*RotatingFileWriter, error) {
	f, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, err
	}
	return &RotatingFileWriter{
		filename: filename,
		maxSize:  maxSize,
		current:  f,
	}, nil
}

// Write实现io.Writer接口
func (w *RotatingFileWriter) Write(p []byte) (int, error) {
	// 检查当前文件大小
	info, err := w.current.Stat()
	if err != nil {
		return 0, err
	}

	// 如果超过最大大小，轮转
	if info.Size()+int64(len(p)) > w.maxSize {
		w.current.Close()

		// 重命名当前文件（加后缀）
		ext := filepath.Ext(w.filename)
		prefix := w.filename[:len(w.filename)-len(ext)]
		newName := prefix + ".1" + ext
		os.Rename(w.filename, newName)

		// 创建新文件
		w.current, err = os.OpenFile(w.filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return 0, err
		}
	}

	return w.current.Write(p)
}

func main() {
	// 创建最大1KB的轮转日志
	writer, err := NewRotatingFileWriter("rotate.log", 1024)
	if err != nil {
		log.Fatal(err)
	}
	defer writer.current.Close()

	// 设置日志输出到轮转Writer
	log.SetOutput(writer)
	log.SetFlags(log.Ldate | log.Ltime)

	// 写入大量日志触发轮转
	for i := 0; i < 200; i++ {
		log.Printf("这是第%d条日志，用于测试轮转功能\n", i)
	}
}
```

### 三、`log`包源码分析

`log`包源码位于`src/log/log.go`，核心逻辑围绕`Logger`结构体展开，以下是关键实现分析：

#### 1. 核心结构体`Logger`

go

```go
// src/log/log.go
type Logger struct {
	mu     sync.Mutex // 互斥锁，保证线程安全
	prefix string     // 日志前缀
	flag   int        // 格式控制标志（Ldate、Ltime等）
	out    io.Writer  // 输出目的地
	buf    []byte     // 临时缓冲区，用于拼接日志内容
}
```

- `mu`：确保多协程并发写日志时的安全性。
- `prefix`：日志前缀，输出时会添加到每条日志的开头。
- `flag`：控制日志格式的标志位（如是否包含时间、文件名等）。
- `out`：日志输出的目标（默认`os.Stderr`）。
- `buf`：临时缓冲区，用于高效拼接日志内容（减少内存分配）。

#### 2. 标准日志器`std`

`log`包提供了一个默认的全局日志器`std`，所有全局函数（如`Print`/`Fatal`）均基于此实现：

go

```go
// src/log/log.go
var std = New(os.Stderr, "", LstdFlags)

// LstdFlags是默认的标志组合：日期+时间
const LstdFlags = Ldate | Ltime
```

全局函数本质上是调用`std`的对应方法：

go

```go
func Printf(format string, v ...interface{}) {
	std.Printf(format, v...)
}
```

#### 3. 日志输出核心方法`Output`

`Output`是`Logger`的核心方法，负责处理日志格式并写入`out`：

go

```go
// src/log/log.go
func (l *Logger) Output(calldepth int, s string) error {
	now := time.Now() // 获取当前时间（如果需要）
	l.mu.Lock()       // 加锁，保证线程安全
	defer l.mu.Unlock()

	// 重置缓冲区
	l.buf = l.buf[:0]

	// 处理格式标志（根据flag添加时间、文件名等）
	l.formatHeader(&l.buf, now, calldepth)

	// 添加日志消息
	l.buf = append(l.buf, s...)

	// 确保日志以换行结尾
	if len(s) == 0 || s[len(s)-1] != '\n' {
		l.buf = append(l.buf, '\n')
	}

	// 写入输出目的地
	_, err := l.out.Write(l.buf)
	return err
}
```

流程解析：

1. **加锁**：通过`mu.Lock()`确保并发安全。
2. **格式化头部**：根据`flag`拼接时间、文件名等前缀（调用`formatHeader`）。
3. **拼接消息**：将日志内容添加到缓冲区。
4. **保证换行**：确保每条日志以换行符结尾。
5. **写入输出**：将缓冲区内容写入`out`（如文件或控制台）。

#### 4. 格式头部生成`formatHeader`

`formatHeader`根据`flag`生成日志前缀（时间、文件名等）：

go

```go
// src/log/log.go
func (l *Logger) formatHeader(buf *[]byte, t time.Time, calldepth int) {
	// 处理时间相关标志
	if l.flag&(Ldate|Ltime|Lmicroseconds) != 0 {
		if l.flag&LUTC != 0 {
			t = t.UTC() // 如果需要UTC时区，转换时间
		}
		// 处理日期（2009/01/23）
		if l.flag&Ldate != 0 {
			year, month, day := t.Date()
			itoa(buf, year, 4)
			*buf = append(*buf, '/')
			itoa(buf, int(month), 2)
			*buf = append(*buf, '/')
			itoa(buf, day, 2)
			*buf = append(*buf, ' ')
		}
		// 处理时间（01:23:45）
		if l.flag&(Ltime|Lmicroseconds) != 0 {
			hour, min, sec := t.Clock()
			itoa(buf, hour, 2)
			*buf = append(*buf, ':')
			itoa(buf, min, 2)
			*buf = append(*buf, ':')
			itoa(buf, sec, 2)
			// 处理微秒（.678901）
			if l.flag&Lmicroseconds != 0 {
				*buf = append(*buf, '.')
				itoa(buf, t.Nanosecond()/1000, 6)
			}
			*buf = append(*buf, ' ')
		}
	}

	// 处理文件名和行号
	if l.flag&(Llongfile|Lshortfile) != 0 {
		// 获取调用栈信息（calldepth控制跳过的栈帧）
		_, file, line, ok := runtime.Caller(calldepth)
		if !ok {
			file = "???"
			line = 0
		}
		// 处理短文件名（只保留最后一个路径分量）
		if l.flag&Lshortfile != 0 {
			short := file
			for i := len(file) - 1; i > 0; i-- {
				if file[i] == '/' {
					short = file[i+1:]
					break
				}
			}
			file = short
		}
		*buf = append(*buf, file...)
		*buf = append(*buf, ':')
		itoa(buf, line, 0)
		*buf = append(*buf, ": "...)
	}

	// 处理前缀（根据Lmsgprefix决定前缀位置）
	if l.flag&Lmsgprefix == 0 {
		*buf = append(*buf, l.prefix...)
	}
}
```

- **时间处理**：根据`Ldate`/`Ltime`/`Lmicroseconds`生成对应格式的时间字符串。
- **文件名处理**：通过`runtime.Caller`获取调用栈信息，根据`Llongfile`/`Lshortfile`生成完整或简短的文件名 + 行号。
- **前缀位置**：`Lmsgprefix`标志控制前缀是在头部（默认）还是在消息前。

#### 5. `Fatal`和`Panic`的实现

`Fatal`系列函数在输出日志后调用`os.Exit(1)`：

go

```go
// src/log/log.go
func (l *Logger) Fatal(v ...interface{}) {
	l.Output(2, fmt.Sprint(v...))
	os.Exit(1)
}
```

`Panic`系列函数在输出日志后触发`panic`：

go

```go
// src/log/log.go
func (l *Logger) Panic(v ...interface{}) {
	s := fmt.Sprint(v...)
	l.Output(2, s)
	panic(s)
}
```

### 四、总结

`log`包提供了轻量、线程安全的日志功能，核心通过`Logger`结构体实现，支持自定义前缀、格式和输出目的地。其源码设计简洁，通过互斥锁保证并发安全，通过标志位控制日志格式，适合基础日志需求。

**使用建议**：

- 简单场景直接使用全局函数（`log.Print`等）。
- 复杂场景（如多模块日志、分级日志）使用`log.New`创建多个`Logger`实例。
- 需日志轮转、结构化日志等高级功能时，可基于`log`包扩展或使用第三方库（如`zap`、`logrus`）。

掌握`log`包的使用和原理，是 Go 语言日志处理的基础。



# 问答

以下是基于`log`包内容设计的 7 道八股文（含答案）和 3 道场景题（含答案），覆盖核心知识点与实践应用：

### 一、八股文题目与答案（难度递增）

#### 1. 基础函数辨析题

**题目**：`log`包中的`Print`、`Fatal`、`Panic`三大系列函数（如`Println`/`Fatalln`/`Panicln`）的核心区别是什么？分别适用于什么场景？

**答案**：
三大系列函数的核心区别在于**输出日志后的行为**：

- `Print`系列（`Print`/`Printf`/`Println`）：仅输出日志，不影响程序执行，适用于普通日志记录（如运行状态、调试信息）；
- `Fatal`系列（`Fatal`/`Fatalf`/`Fatalln`）：输出日志后调用`os.Exit(1)`终止程序，适用于**不可恢复的严重错误**（如配置文件缺失导致程序无法启动）；
- `Panic`系列（`Panic`/`Panicf`/`Panicln`）：输出日志后触发`panic`（可被`recover`捕获），适用于**需要堆栈跟踪的错误**（如逻辑异常但可能局部恢复的场景）。

**场景总结**：普通信息用`Print`，致命错误用`Fatal`，需捕获的异常用`Panic`。

#### 2. 日志格式控制题

**题目**：`log`包的`Flags()`和`SetFlags(flag int)`用于控制日志格式，常见的标志位（如`Ldate`、`Ltime`、`Lshortfile`）有哪些？默认的标志组合是什么？如何自定义一个包含 “日期 + 时间 + 短文件名” 的日志格式？

**答案**：

- **常见标志位**：

  - `Ldate`：添加日期（格式：`2009/01/23`）；
  - `Ltime`：添加时间（格式：`01:23:45`）；
  - `Lmicroseconds`：添加微秒级时间（格式：`01:23:45.678901`）；
  - `Llongfile`：显示完整文件名和行号（如`/a/b/c.go:23`）；
  - `Lshortfile`：显示短文件名和行号（如`c.go:23`）；
  - `LUTC`：时间使用 UTC 时区；
  - `Lmsgprefix`：前缀（`Prefix`）放在日志消息前（默认前缀在最前面）。

- **默认标志组合**：`LstdFlags = Ldate | Ltime`（即默认日志包含日期和时间）。

- **自定义 “日期 + 时间 + 短文件名” 格式**：

  go

  ```go
  log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
  ```

#### 3. 日志前缀与输出目的地题

**题目**：如何为日志设置前缀？如何将日志输出从默认的`os.Stderr`重定向到文件？若需同时输出到控制台和文件，该如何实现？

**答案**：

- **设置日志前缀**：通过`log.SetPrefix(prefix string)`方法，前缀会添加到每条日志的开头（位置受`Lmsgprefix`标志影响）。
  示例：

  go

  ```go
  log.SetPrefix("[INFO] ")
  log.Println("这是一条带前缀的日志") // 输出：[INFO] 2024/09/08 12:34:56 这是一条带前缀的日志
  ```

- **重定向到文件**：通过`log.SetOutput(w io.Writer)`方法，传入文件句柄即可。
  示例：

  go

  ```go
  file, _ := os.Create("app.log")
  defer file.Close()
  log.SetOutput(file) // 后续日志将写入app.log
  ```

- **同时输出到控制台和文件**：使用`io.MultiWriter`包装多个`io.Writer`（如`os.Stdout`和文件）。
  示例：

  go

  ```go
  file, _ := os.Create("app.log")
  multiWriter := io.MultiWriter(os.Stdout, file) // 同时输出到控制台和文件
  log.SetOutput(multiWriter)
  ```

#### 4. 自定义 Logger 实例题

**题目**：`log.New(out io.Writer, prefix string, flag int)`的作用是什么？为什么需要创建多个自定义`Logger`实例？请举例说明不同实例的典型配置。

**答案**：

- **`log.New`的作用**：创建一个自定义`Logger`实例，可独立配置输出目的地（`out`）、前缀（`prefix`）和格式标志（`flag`），与全局日志器（`std`）隔离。

- **需要多个实例的原因**：不同模块 / 场景的日志需求不同（如调试日志需详细格式，错误日志需输出到文件），多个实例可避免配置冲突。

- **典型配置示例**：

  go

  ```go
  import (
      "log"
      "os"
  )
  
  // 调试日志：输出到控制台，带时间+短文件名+[DEBUG]前缀
  debugLogger := log.New(os.Stdout, "[DEBUG] ", log.Ltime|log.Lshortfile)
  
  // 错误日志：输出到文件，带日期+时间+完整文件名+[ERROR]前缀
  errFile, _ := os.Create("errors.log")
  errorLogger := log.New(errFile, "[ERROR] ", log.Ldate|log.Ltime|log.Llongfile)
  
  // 使用
  debugLogger.Println("进入函数")
  errorLogger.Println("数据库连接失败")
  ```

#### 5. 线程安全性题

**题目**：`log`包的日志输出是否线程安全？其内部如何保证多协程并发写日志时的安全性？为什么自定义`io.Writer`时需注意线程安全？

**答案**：

- **线程安全性**：`log`包的`Logger`默认是线程安全的，多协程并发调用日志方法（如`Println`）不会导致日志内容错乱。
- **实现原理**：`Logger`结构体包含`mu sync.Mutex`互斥锁，所有日志输出操作（如`Output`方法）都会先加锁（`mu.Lock()`），完成后解锁（`mu.Unlock()`），确保同一时间只有一个协程写入日志。
- **自定义`io.Writer`的注意事项**：若`io.Writer`本身不是线程安全的（如自定义的网络写入器），即使`Logger`加锁，也可能因`Writer`内部状态竞争导致问题。因此，自定义`Writer`需自行保证线程安全（如内部加锁）。

#### 6. `Fatal`与`Panic`深入题

**题目**：`log.Fatal`会调用`os.Exit(1)`，`log.Panic`会触发`panic`，二者在程序退出流程上有何区别？使用`Fatal`时需注意什么？

**答案**：

- **退出流程区别**：

  - `log.Fatal`：输出日志后直接调用`os.Exit(1)`，**不会执行后续的`defer`语句**，程序立即终止；
  - `log.Panic`：输出日志后触发`panic`，会**执行当前协程中已注册的`defer`语句**，然后终止程序（若未被`recover`捕获）。

- **`Fatal`的注意事项**：

  1. 避免在需要释放资源的场景使用（如文件未关闭、连接未断开），因`defer`不会执行；

  2. 若需在退出前释放资源，应先手动处理（如关闭文件），再调用`Fatal`；

  3. 示例：

     go

     ```go
     func main() {
         file, _ := os.Create("temp.log")
         defer file.Close() // 调用Fatal时，此defer不会执行！
         log.Fatal("致命错误") // 直接exit，文件未关闭
     }
     ```

#### 7. 源码与最佳实践题

**题目**：`Logger`结构体的`Output(calldepth int, s string)`方法是日志输出的核心，请简述其执行流程。在实际开发中，使用`log`包有哪些最佳实践？

**答案**：

- **`Output`方法执行流程**：
  1. **加锁**：通过`mu.Lock()`获取互斥锁，保证并发安全；
  2. **格式化头部**：根据`flag`生成日志前缀（如时间、文件名），调用`formatHeader`方法拼接；
  3. **拼接日志内容**：将日志消息`s`添加到缓冲区`buf`，确保以换行符结尾；
  4. **写入输出**：将缓冲区内容写入`out`（输出目的地）；
  5. **解锁**：通过`mu.Unlock()`释放锁。
- **最佳实践**：
  1. 复杂场景使用自定义`Logger`实例，避免全局日志器配置冲突；
  2. 重要日志（如错误）输出到文件，调试日志输出到控制台；
  3. 日志格式包含足够上下文（如时间、文件名），便于问题定位；
  4. 避免在高频场景中过度使用`Fatal`（可能导致资源泄漏）；
  5. 自定义`io.Writer`时确保线程安全；
  6. 需高级功能（如日志轮转、结构化日志）时，基于`log`包扩展或使用第三方库（如`zap`）。

### 二、场景题与答案（结合实际开发）

#### 1. 多目的地日志输出

**题目**：设计一个日志系统，要求：

- 普通信息日志（`INFO`）同时输出到控制台和`info.log`文件；
- 错误日志（`ERROR`）同时输出到控制台和`error.log`文件；
- 所有日志需包含 “时间（精确到秒）+ 短文件名” 格式。

请编写核心代码实现。

**答案**：
通过创建两个自定义`Logger`实例，分别配置输出目的地和格式：

go

```go
package main

import (
	"io"
	"log"
	"os"
)

func main() {
	// 创建日志文件
	infoFile, err := os.Create("info.log")
	if err != nil {
		log.Fatal("创建info.log失败：", err)
	}
	defer infoFile.Close()

	errorFile, err := os.Create("error.log")
	if err != nil {
		log.Fatal("创建error.log失败：", err)
	}
	defer errorFile.Close()

	// 通用格式：时间（秒）+ 短文件名
	flags := log.Ltime | log.Lshortfile

	// INFO日志：输出到控制台+info.log，前缀[INFO]
	infoLogger := log.New(
		io.MultiWriter(os.Stdout, infoFile), // 多目的地
		"[INFO] ",
		flags,
	)

	// ERROR日志：输出到控制台+error.log，前缀[ERROR]
	errorLogger := log.New(
		io.MultiWriter(os.Stdout, errorFile),
		"[ERROR] ",
		flags,
	)

	// 测试日志
	infoLogger.Println("程序启动成功")
	infoLogger.Printf("当前用户：%s\n", "admin")
	errorLogger.Println("数据库连接超时")
	errorLogger.Printf("错误码：%d\n", 500)
}
```

**关键逻辑**：

- 用`io.MultiWriter`实现多目的地输出；
- 自定义`Logger`实例隔离`INFO`和`ERROR`日志的配置；
- 统一`flags`确保日志格式一致。

#### 2. 带级别控制的日志系统

**题目**：实现一个支持日志级别的系统（`DEBUG`/`INFO`/`WARN`/`ERROR`），要求：

- 可通过全局开关关闭`DEBUG`级日志（生产环境禁用）；
- 各级日志使用不同前缀和输出目的地（`DEBUG`/`INFO`到控制台，`WARN`/`ERROR`到文件）；
- 所有日志包含 “日期 + 时间 + 微秒 + 短文件名”。

请编写核心代码实现。

**答案**：
通过全局变量控制级别，创建四个`Logger`实例分别处理不同级别：

go

```go
package main

import (
	"log"
	"os"
)

// 日志级别控制开关
var EnableDebug = false // 生产环境可设为false

// 定义各级别日志器
var (
	DebugLogger *log.Logger
	InfoLogger  *log.Logger
	WarnLogger  *log.Logger
	ErrorLogger *log.Logger
)

func init() {
	// 通用格式：日期+时间+微秒+短文件名
	flags := log.Ldate | log.Ltime | log.Lmicroseconds | log.Lshortfile

	// 输出目的地：控制台和文件
	stdout := os.Stdout
	logFile, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Fatal("创建日志文件失败：", err)
	}

	// 初始化日志器
	DebugLogger = log.New(stdout, "[DEBUG] ", flags)
	InfoLogger = log.New(stdout, "[INFO] ", flags)
	WarnLogger = log.New(logFile, "[WARN] ", flags)
	ErrorLogger = log.New(logFile, "[ERROR] ", flags)
}

// 封装DEBUG日志（带开关控制）
func Debug(v ...interface{}) {
	if EnableDebug {
		DebugLogger.Println(v...)
	}
}

func main() {
	// 测试日志（开发环境）
	EnableDebug = true
	Debug("进入main函数")
	InfoLogger.Println("程序启动")
	WarnLogger.Println("内存使用率过高")
	ErrorLogger.Println("配置文件解析失败")

	// 生产环境禁用DEBUG
	EnableDebug = false
	Debug("这条日志不会输出") // 被禁用
}
```

**关键逻辑**：

- 用`EnableDebug`控制`DEBUG`日志的输出；
- 不同级别日志器使用不同前缀和输出目的地；
- 封装`Debug`函数实现开关控制，不影响其他级别。

#### 3. 日志轮转改进

**题目**：改进 “按文件大小轮转” 的日志功能，要求：

- 日志文件达到 1MB 时轮转，最多保留 5 个备份文件（`app.log.1`到`app.log.5`）；
- 轮转时旧文件按序号递增（如`app.log`→`app.log.1`，原`app.log.1`→`app.log.2`，以此类推）；
- 超过 5 个备份时删除最旧的文件。

请基于`log`包实现核心逻辑。

**答案**：
自定义`RotatingWriter`实现`io.Writer`接口，在写入时检查大小并处理轮转：

go

```go
package main

import (
	"log"
	"os"
	"path/filepath"
)

const (
	maxSize    = 1 << 20 // 1MB
	maxBackups = 5       // 最多5个备份
)

type RotatingWriter struct {
	filename string
	current  *os.File
}

func NewRotatingWriter(filename string) (*RotatingWriter, error) {
	f, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, err
	}
	return &RotatingWriter{filename: filename, current: f}, nil
}

// 轮转文件：重命名现有文件，创建新文件
func (w *RotatingWriter) rotate() error {
	// 关闭当前文件
	if err := w.current.Close(); err != nil {
		return err
	}

	// 备份文件序号递增（app.log.5 → 删除，app.log.4→app.log.5，...）
	for i := maxBackups; i > 0; i-- {
		oldName := w.filename + "." + string(rune('0'+i))
		newName := w.filename + "." + string(rune('0'+i+1))
		if i == maxBackups {
			os.Remove(oldName) // 删除最旧的备份
		} else if _, err := os.Stat(oldName); err == nil {
			os.Rename(oldName, newName) // 序号递增
		}
	}

	// 重命名当前文件为app.log.1
	os.Rename(w.filename, w.filename+".1")

	// 创建新的当前文件
	f, err := os.OpenFile(w.filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	w.current = f
	return nil
}

// Write实现io.Writer接口
func (w *RotatingWriter) Write(p []byte) (int, error) {
	// 检查当前文件大小
	info, err := w.current.Stat()
	if err != nil {
		return 0, err
	}

	// 若写入后超过maxSize，触发轮转
	if info.Size()+int64(len(p)) > maxSize {
		if err := w.rotate(); err != nil {
			return 0, err
		}
	}

	return w.current.Write(p)
}

func main() {
	// 创建轮转日志写入器
	writer, err := NewRotatingWriter("app.log")
	if err != nil {
		log.Fatal(err)
	}
	defer writer.current.Close()

	// 配置日志
	log.SetOutput(writer)
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds)

	// 写入大量日志触发轮转
	for i := 0; i < 10000; i++ {
		log.Printf("这是第%d条日志，用于测试轮转功能...\n", i)
	}
}
```

**关键逻辑**：

- `RotatingWriter`实现`io.Writer`接口，在`Write`方法中检查文件大小；
- 轮转时通过重命名实现备份文件序号递增，超过最大备份数时删除最旧文件；
- 结合`log.SetOutput`将日志输出到自定义轮转写入器。