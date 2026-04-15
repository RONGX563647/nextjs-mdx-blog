### Go 语言`os`包深入讲解与源码分析

#### 一、`os`包核心功能概述

`os`包是 Go 语言标准库中用于与操作系统交互的核心包，提供了文件操作、目录管理、环境变量、进程控制等底层功能。其设计兼顾跨平台性，封装了不同操作系统（Linux/macOS/Windows）的差异，为开发者提供统一的接口。

#### 二、核心功能与示例代码（50+）

##### 1. 文件基本操作（10 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 创建文件（os.O_CREATE|os.O_WRONLY）
    f, err := os.Create("test.txt")
    if err != nil {
        panic(err)
    }
    defer f.Close()

    // 写入数据
    n, err := f.Write([]byte("hello os package"))
    fmt.Printf("写入%d字节\n", n) // 写入16字节

    // 追加写入
    n, err = f.WriteString("\nappend content")
    fmt.Printf("追加%d字节\n", n) // 追加14字节

    // 读取文件（一次性读取）
    data, err := os.ReadFile("test.txt")
    fmt.Println("文件内容：", string(data))

    // 打开文件（只读模式）
    f, err = os.Open("test.txt")
    if err != nil {
        panic(err)
    }
    defer f.Close()

    // 读取部分内容
    buf := make([]byte, 10)
    n, err = f.Read(buf)
    fmt.Println("部分内容：", string(buf[:n])) // 部分内容：hello os 

    // 移动文件指针
    _, err = f.Seek(6, 0) // 从开头偏移6字节
    n, _ = f.Read(buf)
    fmt.Println("偏移后内容：", string(buf[:n])) // 偏移后内容：os packa

    // 重命名文件
    err = os.Rename("test.txt", "new_test.txt")

    // 复制文件（需手动实现）
    data, _ = os.ReadFile("new_test.txt")
    os.WriteFile("copy_test.txt", data, 0644)

    // 删除文件
    os.Remove("copy_test.txt")
}
```

##### 2. 目录操作（8 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 创建目录
    err := os.Mkdir("testdir", 0755)
    if err != nil {
        fmt.Println(err)
    }

    // 创建多级目录
    err = os.MkdirAll("a/b/c", 0755)
    if err != nil {
        fmt.Println(err)
    }

    // 读取目录内容
    entries, err := os.ReadDir("a/b")
    if err != nil {
        fmt.Println(err)
    }
    for _, e := range entries {
        fmt.Println(e.Name(), e.IsDir()) // c true
    }

    // 获取当前工作目录
    cwd, err := os.Getwd()
    fmt.Println("当前目录：", cwd)

    // 切换工作目录
    err = os.Chdir("testdir")
    if err != nil {
        fmt.Println(err)
    }

    // 目录重命名
    err = os.Rename("testdir", "newdir")

    // 删除空目录
    err = os.Remove("newdir")

    // 删除多级目录（包括内容）
    err = os.RemoveAll("a")
}
```

##### 3. 文件信息与权限（7 个）

go

```go
package main

import (
    "fmt"
    "os"
    "time"
)

func main() {
    // 获取文件信息
    fi, err := os.Stat("new_test.txt")
    if err != nil {
        panic(err)
    }

    fmt.Println("文件名：", fi.Name())
    fmt.Println("大小：", fi.Size())
    fmt.Println("修改时间：", fi.ModTime())
    fmt.Println("是否为目录：", fi.IsDir())
    fmt.Println("权限：", fi.Mode()) // -rw-r--r--

    // 修改文件权限
    err = os.Chmod("new_test.txt", 0600)

    // 修改文件所有者（Windows可能需要管理员权限）
    // err = os.Chown("new_test.txt", 1000, 1000)

    // 检查文件是否存在
    _, err = os.Stat("nonexistent.txt")
    if os.IsNotExist(err) {
        fmt.Println("文件不存在")
    }

    // 更改文件修改时间
    now := time.Now()
    err = os.Chtimes("new_test.txt", now, now)
}
```

##### 4. 环境变量操作（6 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 获取环境变量
    path := os.Getenv("PATH")
    fmt.Println("PATH长度：", len(path))

    // 设置环境变量
    err := os.Setenv("MY_VAR", "hello")
    if err != nil {
        fmt.Println(err)
    }

    // 获取所有环境变量
    envs := os.Environ()
    fmt.Println("环境变量数量：", len(envs))

    // 检查环境变量是否存在
    if val, ok := os.LookupEnv("MY_VAR"); ok {
        fmt.Println("MY_VAR:", val) // MY_VAR: hello
    }

    // 取消环境变量
    err = os.Unsetenv("MY_VAR")

    // 清空环境变量（仅当前进程）
    // os.Clearenv()
}
```

##### 5. 进程相关（7 个）

go

```go
package main

import (
    "fmt"
    "os"
    "strconv"
)

func main() {
    // 获取当前进程ID
    pid := os.Getpid()
    fmt.Println("当前进程ID：", pid)

    // 获取父进程ID
    ppid := os.Getppid()
    fmt.Println("父进程ID：", ppid)

    // 退出当前进程
    // os.Exit(0) // 0表示正常退出

    // 获取进程用户ID（Unix-like）
    // uid := os.Getuid()
    // fmt.Println("用户ID：", uid)

    // 启动新进程（简单方式）
    // cmd := exec.Command("echo", "hello from child")
    // cmd.Output()

    // 进程工作目录
    cwd, _ := os.Getwd()
    fmt.Println("进程工作目录：", cwd)

    // 信号处理（示例：捕获中断信号）
    // sigChan := make(chan os.Signal, 1)
    // signal.Notify(sigChan, os.Interrupt)
    // go func() {
    //     <-sigChan
    //     fmt.Println("收到中断信号，退出")
    //     os.Exit(0)
    // }()
    // time.Sleep(10 * time.Second)
}
```

##### 6. 临时文件与目录（5 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 创建临时文件
    f, err := os.CreateTemp("", "prefix-*.txt")
    if err != nil {
        panic(err)
    }
    defer os.Remove(f.Name()) // 确保删除
    fmt.Println("临时文件：", f.Name())

    // 写入临时数据
    f.WriteString("temporary data")

    // 创建临时目录
    dir, err := os.MkdirTemp("", "prefix-*")
    if err != nil {
        panic(err)
    }
    defer os.RemoveAll(dir)
    fmt.Println("临时目录：", dir)

    // 在临时目录创建文件
    tf, _ := os.CreateTemp(dir, "temp-*.dat")
    tf.Write([]byte("data in temp dir"))
    tf.Close()
}
```

##### 7. 设备与系统信息（5 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 查看标准输入是否为终端
    fmt.Println("stdin is terminal:", isTerminal(os.Stdin.Fd()))

    // 查看标准输出是否为终端
    fmt.Println("stdout is terminal:", isTerminal(os.Stdout.Fd()))

    // 获取操作系统类型
    fmt.Println("操作系统：", os.GOOS) // linux/darwin/windows

    // 读取设备信息（示例：null设备）
    null, err := os.Open("/dev/null") // Windows为"NUL"
    if err == nil {
        fmt.Println("null设备已打开")
        null.Close()
    }

    // 获取主机名
    hostname, err := os.Hostname()
    fmt.Println("主机名：", hostname)
}

// 辅助函数：判断文件描述符是否为终端
func isTerminal(fd uintptr) bool {
    // 实际实现需调用系统特定函数，此处简化
    return true
}
```

##### 8. 符号链接（5 个）

go

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 创建符号链接（指向文件）
    err := os.Symlink("new_test.txt", "link.txt")
    if err != nil {
        fmt.Println(err)
    }

    // 读取符号链接指向的目标
    target, err := os.Readlink("link.txt")
    if err != nil {
        fmt.Println(err)
    }
    fmt.Println("链接指向：", target) // 链接指向：new_test.txt

    // 创建目录符号链接
    err = os.Symlink("a", "linkdir") // 假设a是目录

    // 判断是否为符号链接
    fi, err := os.Lstat("link.txt") // 注意用Lstat而非Stat
    if err == nil && fi.Mode()&os.ModeSymlink != 0 {
        fmt.Println("link.txt是符号链接")
    }

    // 删除符号链接
    err = os.Remove("link.txt")
}
```

#### 三、`os`包源码分析

`os`包的核心实现与操作系统紧密相关，源码分为跨平台通用逻辑（`os/file.go`等）和平台特定实现（`os/file_linux.go`、`os/file_windows.go`等）。

##### 1. 核心结构体`File`

go

```go
// os/file.go
type File struct {
    pfd     poll.FD      // 平台相关的文件描述符
    name    string       // 文件名
    dirinfo *dirInfo     // 目录信息（如果是目录）
    appendMode bool      // 是否为追加模式
}
```

`File`结构体封装了操作系统的文件描述符（`poll.FD`），通过`pfd`与底层系统交互。`poll.FD`是跨平台的文件描述符抽象，不同系统有不同实现（如 Linux 的`int`型 fd，Windows 的`Handle`）。

##### 2. 文件打开逻辑（`Open`函数）

go

```go
// os/file.go
func Open(name string) (*File, error) {
    return OpenFile(name, O_RDONLY, 0)
}

func OpenFile(name string, flag int, perm FileMode) (*File, error) {
    // 解析路径（处理相对路径、符号链接等）
    name = fixLongPath(name)
    // 调用平台特定的打开函数
    f, err := openFileNolog(name, flag, perm)
    if err != nil {
        return nil, err
    }
    return f, nil
}
```

`OpenFile`是文件打开的核心函数，通过`flag`（打开模式）和`perm`（权限）控制文件行为，最终调用平台特定的`openFileNolog`实现。

##### 3. 平台特定实现（以 Linux 为例）

go

```go
// os/file_linux.go
func openFileNolog(name string, flag int, perm FileMode) (*File, error) {
    // 转换Go的flag为Linux系统调用的flag
    syscallFlag := syscall.O_RDONLY
    switch flag {
    case O_RDONLY:
        syscallFlag = syscall.O_RDONLY
    case O_WRONLY:
        syscallFlag = syscall.O_WRONLY
    case O_RDWR:
        syscallFlag = syscall.O_RDWR
    // 处理其他模式（O_CREATE、O_APPEND等）
    }

    // 调用Linux系统调用openat
    fd, err := syscall.Openat(syscall.AT_FDCWD, name, syscallFlag, uint32(perm))
    if err != nil {
        return nil, err
    }

    // 封装为File结构体
    return newFile(fd, name, kindOpenFile), nil
}
```

Linux 平台通过`syscall.Openat`系统调用打开文件，将返回的文件描述符（`fd`）封装为`File`对象。

##### 4. 读操作实现（`Read`方法）

go



```go
// os/file.go
func (f *File) Read(b []byte) (n int, err error) {
    if len(b) == 0 {
        return 0, nil
    }
    // 调用poll.FD的Read方法
    n, err = f.pfd.Read(b)
    if err != nil && err != io.EOF {
        err = &PathError{Op: "read", Path: f.name, Err: err}
    }
    return
}

// internal/poll/fd_unix.go（Linux实现）
func (fd *FD) Read(b []byte) (int, error) {
    // 检查文件描述符状态
    if err := fd.readLock(); err != nil {
        return 0, err
    }
    defer fd.readUnlock()

    // 调用系统调用read
    for {
        n, err := syscall.Read(fd.Sysfd, b)
        if err != nil {
            // 处理中断等错误
            if err == syscall.EINTR {
                continue
            }
            return n, err
        }
        return n, nil
    }
}
```

`Read`方法最终通过`syscall.Read`系统调用从文件描述符读取数据，处理了中断重试等细节。

##### 5. 错误处理机制

`os`包定义了特定的错误类型，如`PathError`（路径相关错误）、`LinkError`（链接相关错误）等：

go

```go
// os/error.go
type PathError struct {
    Op   string // 操作（"open", "read", etc.）
    Path string // 路径
    Err  error  // 底层错误
}

func (e *PathError) Error() string {
    return e.Op + " " + e.Path + ": " + e.Err.Error()
}
```

这些错误类型包装了底层系统错误，提供更丰富的上下文信息。

#### 四、跨平台兼容性设计

`os`包通过以下方式实现跨平台兼容：

1. **条件编译**：使用`// +build linux windows darwin`等标签区分不同平台的代码。
2. **接口抽象**：通过`poll.FD`等接口封装平台差异，上层代码无需关心具体实现。
3. **路径处理**：提供`filepath`包处理不同系统的路径分隔符（`/` vs `\`）。
4. **权限映射**：将 Unix 的权限位（如 0644）映射到 Windows 的文件属性。

#### 五、总结

`os`包是 Go 语言与操作系统交互的桥梁，通过封装系统调用提供了统一的文件、目录、环境变量等操作接口。其源码设计体现了跨平台兼容性和资源安全管理的考量，核心是通过`File`结构体和平台特定实现连接上层 Go 代码与底层系统。使用`os`包时需注意：

- 及时关闭文件（使用`defer f.Close()`）。
- 妥善处理错误（尤其是`os.IsNotExist`等判断）。
- 注意不同平台的差异（如路径、权限、换行符）。

掌握`os`包的使用和原理，是进行系统级编程和文件处理的基础。



# 问答

以下是基于`os`包内容设计的 7 道八股文（含答案）和 3 道场景题（含答案），覆盖核心知识点与实践应用：

### 一、八股文题目与答案（难度递增）

#### 1. 基础文件操作题

**题目**：`os.Open`、`os.Create`、`os.OpenFile`三个函数的核心区别是什么？分别适用于什么场景？请说明`os.OpenFile`的`flag`参数（如`os.O_RDONLY`、`os.O_WRONLY`、`os.O_CREATE`）的作用。

**答案**：

- **函数区别与适用场景**：
  - `os.Open(name string) (*os.File, error)`：以**只读模式**（`os.O_RDONLY`）打开文件，适用于仅读取文件内容的场景（如配置文件读取）。
  - `os.Create(name string) (*os.File, error)`：以**读写模式**（`os.O_RDWR|os.O_CREATE|os.O_TRUNC`）创建文件，若文件已存在则截断（清空内容），适用于创建新文件或覆盖已有文件（如日志文件初始化）。
  - `os.OpenFile(name string, flag int, perm os.FileMode) (*os.File, error)`：最灵活的文件打开函数，通过`flag`指定打开模式，`perm`指定文件权限（仅创建新文件时有效），适用于复杂场景（如追加写入、读写不截断等）。
- **`flag`参数作用**：
  - `os.O_RDONLY`：只读模式；
  - `os.O_WRONLY`：只写模式；
  - `os.O_RDWR`：读写模式；
  - `os.O_CREATE`：若文件不存在则创建；
  - `os.O_TRUNC`：打开时截断文件（清空内容）；
  - `os.O_APPEND`：写入时追加到文件末尾；
  - `os.O_EXCL`：与`O_CREATE`配合使用，若文件已存在则返回错误（避免覆盖）。

#### 2. 目录操作辨析题

**题目**：`os.Mkdir`与`os.MkdirAll`的区别是什么？`os.Remove`与`os.RemoveAll`在删除目录时有何不同？请举例说明各自的使用场景。

**答案**：

- **`os.Mkdir`与`os.MkdirAll`的区别**：
  - `os.Mkdir(name string, perm os.FileMode) error`：仅创建**单级目录**，若父目录不存在则返回错误（如创建`a/b`时，若`a`不存在则失败）。
  - `os.MkdirAll(name string, perm os.FileMode) error`：创建**多级目录**（递归创建所有不存在的父目录），适用于需要一次性创建嵌套目录的场景（如`a/b/c`）。
- **`os.Remove`与`os.RemoveAll`删除目录的区别**：
  - `os.Remove(name string) error`：仅能删除**空目录**，若目录非空则返回错误；也可删除文件。
  - `os.RemoveAll(name string) error`：递归删除目录及其所有内容（包括子目录和文件），无论目录是否为空。
- **使用场景示例**：
  - 创建单级临时目录用`os.Mkdir("temp", 0755)`；
  - 创建项目目录结构（如`logs/2024/09`）用`os.MkdirAll("logs/2024/09", 0755)`；
  - 删除空的临时目录用`os.Remove("temp")`；
  - 清理测试生成的多级目录用`os.RemoveAll("testdata")`。

#### 3. 文件权限与信息题

**题目**：`os.FileMode`表示文件权限，如`0644`在 Unix 系统中代表什么含义？`os.Stat`与`os.Lstat`的区别是什么？如何通过`os.FileInfo`判断一个路径是文件还是目录？

**答案**：

- **`0644`的含义（Unix 系统）**：
  `os.FileMode`采用八进制表示，每位分别对应**文件类型**和**用户 / 组 / 其他权限**。`0644`中：
  - 第一位`0`是前缀；
  - 第二位`6`：文件所有者权限（`6=4+2`，即读`r`+ 写`w`）；
  - 第三位`4`：同组用户权限（`4`，即读`r`）；
  - 第四位`4`：其他用户权限（`4`，即读`r`）；
    整体表示 “所有者可读写，同组和其他用户仅可读” 的普通文件。
- **`os.Stat`与`os.Lstat`的区别**：
  - `os.Stat(name string) (os.FileInfo, error)`：获取路径的信息，若路径是**符号链接**，则返回链接指向的**目标文件 / 目录**的信息；
  - `os.Lstat(name string) (os.FileInfo, error)`：获取路径本身的信息，若路径是符号链接，则返回**链接自身**的信息（而非目标）。
- **判断文件 / 目录**：
  通过`os.FileInfo`的`IsDir()`方法：`fi.IsDir()`返回`true`表示目录，`false`表示文件。

#### 4. 环境变量操作题

**题目**：`os.Getenv`、`os.LookupEnv`、`os.Setenv`、`os.Unsetenv`分别实现什么功能？`os.Environ`返回的环境变量格式是什么？为什么修改环境变量仅对当前进程有效？

**答案**：

- **函数功能**：
  - `os.Getenv(key string) string`：获取环境变量`key`的值，若不存在则返回空字符串；
  - `os.LookupEnv(key string) (string, bool)`：获取环境变量`key`的值，同时返回`bool`表示变量是否存在（解决空值与不存在的歧义）；
  - `os.Setenv(key, value string) error`：设置环境变量`key`的值为`value`；
  - `os.Unsetenv(key string) error`：删除环境变量`key`。
- **`os.Environ()`返回格式**：返回`[]string`，每个元素为`"key=value"`格式的字符串（如`["PATH=/usr/bin", "HOME=/root"]`）。
- **环境变量修改的作用范围**：
  环境变量是**进程私有**的（存储在进程地址空间中），`os`包的操作仅修改当前进程的环境变量副本，不会影响父进程或其他进程，因此修改仅对当前进程及其子进程（创建时继承环境）有效。

#### 5. 进程控制深入题

**题目**：`os.Getpid`、`os.Getppid`、`os.Exit`的作用是什么？`os.Exit(0)`与`panic`在程序退出时有何本质区别？为什么`os.Exit`前的`defer`语句不会执行？

**答案**：

- **函数作用**：
  - `os.Getpid() int`：返回当前进程的 ID（PID）；
  - `os.Getppid() int`：返回当前进程的父进程 ID（PPID）；
  - `os.Exit(code int)`：立即终止当前进程，`code`为退出码（`0`表示正常退出，非`0`表示异常）。
- **`os.Exit`与`panic`的区别**：
  - `os.Exit`：直接调用系统调用终止进程，**不会执行任何`defer`语句**，也不会输出堆栈信息；
  - `panic`：触发恐慌机制，会**执行当前 goroutine 中已注册的`defer`语句**，然后输出堆栈信息并终止进程（退出码为非 0）。
- **`os.Exit`前`defer`不执行的原因**：
  `defer`语句的执行时机是 “函数返回前”（正常流程）或 “`panic`时”，而`os.Exit`直接终止进程，绕过了 Go 的函数退出流程，因此`defer`无法执行。

#### 6. 跨平台兼容性题

**题目**：`os`包如何处理不同操作系统（如 Linux、Windows）的差异？请举例说明路径处理、文件权限、换行符在跨平台时的区别及`os`包的应对措施。

**答案**：
`os`包通过**条件编译**、**接口抽象**和**平台适配层**处理跨平台差异，核心措施如下：

- **路径处理**：
  - 差异：Linux/macOS 使用`/`作为路径分隔符，Windows 使用`\`；
  - 应对：`os`包配合`path/filepath`包（如`filepath.Join`）自动转换分隔符，`os`的`Open`等函数接受任意分隔符的路径（内部自动适配）。
- **文件权限**：
  - 差异：Unix 系统使用用户 / 组 / 其他权限位（如`0644`），Windows 使用 ACL（访问控制列表），权限位映射不完全一致；
  - 应对：`os`包在 Windows 上忽略部分权限位（如执行权限），仅保留读写权限的映射，确保基本操作兼容。
- **换行符与文本模式**：
  - 差异：Linux/macOS 文本文件使用`\n`，Windows 使用`\r\n`；
  - 应对：`os`包的文件操作默认以二进制模式处理（不自动转换换行符），如需转换需手动处理或使用`bufio`包的`Scanner`。
- **实现方式**：
  通过`// +build linux windows`等条件编译标签分离平台特定代码（如`os/file_linux.go`、`os/file_windows.go`），上层提供统一接口（如`os.Open`）。

#### 7. 源码与资源管理题

**题目**：`os.File`结构体的核心字段有哪些？其`Close`方法的作用是什么？为什么必须确保文件被关闭（如用`defer f.Close()`）？未关闭的文件可能导致什么问题？

**答案**：

- **`os.File`核心字段**：
  - `pfd poll.FD`：封装平台相关的文件描述符（如 Linux 的`int`型 fd，Windows 的`Handle`），是与底层系统交互的核心；
  - `name string`：文件路径名；
  - `dirinfo *dirInfo`：目录信息（仅当文件是目录时有效）；
  - `appendMode bool`：是否为追加模式（影响写入位置）。
- **`Close`方法的作用**：
  释放文件描述符（调用底层系统的`close`系统调用），关闭与文件的关联，释放操作系统分配的资源。
- **必须关闭文件的原因**：
  操作系统对进程可打开的文件描述符数量有限制（如 Linux 默认`ulimit -n`为 1024），若不关闭文件，会导致：
  1. **文件描述符泄漏**：进程可用的文件描述符耗尽，后续无法打开新文件；
  2. **资源未释放**：操作系统仍维护文件的缓存和锁，可能导致数据未及时刷新到磁盘；
  3. **进程退出后残留**：虽然进程退出会自动释放资源，但长期运行的服务（如服务器）会因泄漏崩溃。
- **最佳实践**：使用`defer f.Close()`在函数退出前自动关闭文件，确保资源释放。

### 二、场景题与答案（结合实际开发）

#### 1. 安全的大文件复制工具

**题目**：实现一个工具函数`CopyFile(src, dst string)`，要求：

- 复制大文件（GB 级）时低内存占用；
- 若目标文件已存在则返回错误（避免覆盖）；
- 复制过程中若发生错误，需删除可能产生的不完整目标文件；
- 保留源文件的权限（Unix 系统）。

**答案**：

go

```go
package main

import (
	"os"
	"path/filepath"
)

// CopyFile 安全复制文件，低内存占用且避免覆盖
func CopyFile(src, dst string) error {
	// 打开源文件（只读）
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	// 获取源文件信息（用于权限和判断是否为目录）
	srcInfo, err := srcFile.Stat()
	if err != nil {
		return err
	}
	if srcInfo.IsDir() {
		return &os.PathError{Op: "copy", Path: src, Err: os.ErrIsDir}
	}

	// 检查目标文件是否存在
	if _, err := os.Stat(dst); err == nil {
		return &os.PathError{Op: "copy", Path: dst, Err: os.ErrExist}
	} else if !os.IsNotExist(err) {
		// 其他错误（如权限问题）
		return err
	}

	// 创建目标文件（只写+创建+排他，避免覆盖）
	dstFile, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_EXCL, srcInfo.Mode())
	if err != nil {
		return err
	}
	// 若复制失败，删除不完整的目标文件
	defer func() {
		if err != nil {
			dstFile.Close()
			os.Remove(dst)
		}
	}()

	// 流式复制（低内存占用）
	buf := make([]byte, 1024*1024) // 1MB缓冲区
	for {
		n, err := srcFile.Read(buf)
		if err != nil {
			if err.Error() == "EOF" {
				break // 读取完毕
			}
			return err // 读取错误
		}
		if n > 0 {
			if _, err := dstFile.Write(buf[:n]); err != nil {
				return err // 写入错误
			}
		}
	}

	// 确保数据刷新到磁盘
	if err := dstFile.Sync(); err != nil {
		return err
	}

	// 关闭目标文件（无错误时）
	return dstFile.Close()
}

func main() {
	if err := CopyFile("large_file.dat", "copied_file.dat"); err != nil {
		panic(err)
	}
}
```

**关键逻辑**：

- 用`os.O_EXCL`确保目标文件不存在时才创建；
- 1MB 缓冲区流式读写，避免加载整个文件到内存；
- `defer`语句在出错时删除不完整目标文件；
- 复制源文件权限，调用`Sync()`确保数据落盘。

#### 2. 目录文件统计工具

**题目**：实现一个函数`DirStats(root string) (map[string]int, int64, error)`，返回：

- 按文件扩展名分组的数量统计（如`{".txt": 5, ".go": 3}`）；
- 目录下所有文件的总大小（字节）；
- 忽略符号链接（不跟随）和空目录。

**答案**：

go

```go
package main

import (
	"os"
	"path/filepath"
	"strings"
)

// DirStats 统计目录下文件扩展名数量和总大小
func DirStats(root string) (extCount map[string]int, totalSize int64, err error) {
	extCount = make(map[string]int)

	// 遍历目录（不跟随符号链接）
	err = filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err // 处理访问错误（如权限不足）
		}

		// 忽略符号链接
		if d.Type()&os.ModeSymlink != 0 {
			return nil
		}

		// 忽略目录（只处理文件）
		if d.IsDir() {
			return nil
		}

		// 获取文件信息（大小）
		fi, err := d.Info()
		if err != nil {
			return err
		}
		totalSize += fi.Size()

		// 提取扩展名（统一转为小写）
		ext := strings.ToLower(filepath.Ext(path))
		extCount[ext]++ // 统计数量（无扩展名的文件用""键）

		return nil
	})

	return extCount, totalSize, err
}

func main() {
	extCount, totalSize, err := DirStats(".")
	if err != nil {
		panic(err)
	}

	println("文件扩展名统计：")
	for ext, count := range extCount {
		println(ext, ":", count)
	}
	println("总大小（字节）：", totalSize)
}
```

**关键逻辑**：

- 用`filepath.WalkDir`递归遍历目录，简化遍历逻辑；
- 通过`d.Type()&os.ModeSymlink`判断并忽略符号链接；
- 用`filepath.Ext`提取扩展名，统一转为小写避免`".TXT"`和`".txt"`统计偏差；
- 累加文件大小到`totalSize`，实现总大小统计。

#### 3. 进程存活监控工具

**题目**：实现一个函数`MonitorProcess(pid int, interval int)`，每隔`interval`秒检查指定 PID 的进程是否存活，若进程退出则打印退出信息并返回。需处理信号（如`SIGINT`）让监控工具优雅退出。

**答案**：

go

```go
package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// MonitorProcess 监控进程存活状态
func MonitorProcess(pid int, interval int) error {
	// 检查进程是否初始存在
	proc, err := os.FindProcess(pid)
	if err != nil {
		return fmt.Errorf("进程%d不存在: %v", pid, err)
	}

	// 处理中断信号（优雅退出）
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// 监控循环
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	defer ticker.Stop()

	fmt.Printf("开始监控进程%d（间隔%d秒）...\n", pid, interval)
	for {
		select {
		case <-ticker.C:
			// 检查进程是否存活（向进程发送0信号，无实际作用，仅用于检查）
			if err := proc.Signal(syscall.Signal(0)); err != nil {
				// 信号发送失败，进程已退出
				return fmt.Errorf("进程%d已退出: %v", pid, err)
			}
			fmt.Printf("进程%d存活\n", pid)
		case sig := <-sigChan:
			// 收到退出信号
			return fmt.Errorf("监控被信号%d中断", sig)
		}
	}
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("用法: go run monitor.go <pid> [interval]")
		os.Exit(1)
	}
	pid, err := os.Atoi(os.Args[1])
	if err != nil {
		panic(err)
	}
	interval := 5
	if len(os.Args) > 2 {
		interval, _ = os.Atoi(os.Args[2])
	}

	if err := MonitorProcess(pid, interval); err != nil {
		fmt.Println("监控结束:", err)
	}
}
```

**关键逻辑**：

- 用`os.FindProcess`获取进程句柄，`proc.Signal(syscall.Signal(0))`检查进程存活（发送 0 信号不影响进程，仅判断是否存在）；
- 用`time.Ticker`实现定时检查；
- 用`signal.Notify`捕获`SIGINT`（Ctrl+C）等信号，实现优雅退出；
- 适用于 Unix-like 系统（Windows 的`os.FindProcess`行为不同，需调整信号处理）。