### ??Go 语言`context`标准库深入讲解与示例

#### 一、`context`包核心功能概述

`context`（上下文）是 Go 语言处理**goroutine 生命周期与元数据传递**的标准库，核心作用是在多个 goroutine 之间传递**取消信号**、**超时时间**和**请求范围的元数据**，实现并发控制与协作。其核心价值在于：

- 统一的 goroutine 取消机制：通过`Done()`通道广播取消信号，协调多个关联 goroutine 同时退出；
- 超时与截止时间控制：避免 goroutine 无限阻塞，防止资源泄漏；
- 请求范围的元数据传递：在函数调用链和 goroutine 间安全传递上下文信息（如请求 ID、用户认证信息）。

`context`是 Go 并发编程的 “协调者”，尤其在分布式系统、HTTP 服务等场景中不可或缺。

### 二、核心接口与基础类型

`context`包的核心是`Context`接口，所有上下文类型都实现了该接口。

#### 1. `Context`接口定义

go

```go
type Context interface {
    // 返回上下文的截止时间（若存在），ok为true表示有截止时间
    Deadline() (deadline time.Time, ok bool)

    // 返回一个通道，当上下文被取消或超时，该通道会关闭
    Done() <-chan struct{}

    // 返回上下文取消的原因（仅在Done()通道关闭后有效）
    Err() error

    // 获取上下文存储的键值对（key为接口类型）
    Value(key interface{}) interface{}
}
```

**接口方法说明**：

- `Deadline()`：用于判断上下文是否有超时时间，帮助提前规划操作；
- `Done()`：核心取消信号通道，通常配合`select`监听，一旦关闭表示需终止操作；
- `Err()`：解释取消原因（如`context.Canceled`表示主动取消，`context.DeadlineExceeded`表示超时）；
- `Value()`：用于传递请求范围的元数据（如_trace_id_、*user_token*）。

#### 2. 基础上下文（根上下文）

`context`包提供了两个最基础的上下文（作为所有派生上下文的根节点）：

go

```go
package main

import (
	"context"
	"fmt"
)

func main() {
	// 1. Background：主要用于main函数、初始化和测试，作为根上下文
	bg := context.Background()
	fmt.Println("Background是否有截止时间:", bg.Deadline()) // (0001-01-01 00:00:00 +0000 UTC, false)
	fmt.Println("Background的Done通道是否为nil:", bg.Done() == nil) // true（永不关闭）

	// 2. TODO：当不确定使用哪个上下文时使用（通常用于重构或临时场景）
	todo := context.TODO()
	fmt.Println("TODO是否有截止时间:", todo.Deadline()) // 同Background，无截止时间
}
```

**使用原则**：

- `Background`是 “根” 上下文，所有其他上下文都从它派生；
- `TODO`仅作为 “占位符”，表示需要后续替换为更具体的上下文。

### 三、核心功能与示例代码

#### 1. 取消信号（`WithCancel`）

`context.WithCancel`创建一个可手动取消的上下文，通过调用返回的`cancel`函数触发取消信号，所有基于该上下文的 goroutine 会收到通知。

go

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 模拟一个需要被取消的任务
func task(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			// 收到取消信号，退出任务
			fmt.Printf("任务%d: 收到取消信号，原因: %v\n", id, ctx.Err())
			return
		default:
			// 正常执行任务
			fmt.Printf("任务%d: 正在执行...\n", id)
			time.Sleep(500 * time.Millisecond)
		}
	}
}

func main() {
	// 创建可取消的上下文（父上下文为Background）
	ctx, cancel := context.WithCancel(context.Background())

	// 启动3个任务（基于同一个ctx）
	for i := 1; i <= 3; i++ {
		go task(ctx, i)
	}

	// 运行3秒后取消所有任务
	time.Sleep(3 * time.Second)
	fmt.Println("主程序: 开始取消所有任务")
	cancel() // 触发取消信号

	// 等待任务退出（实际应使用sync.WaitGroup，此处简化）
	time.Sleep(1 * time.Second)
	fmt.Println("主程序: 所有任务已退出")
}
```

**运行输出**：

plaintext

```plaintext
任务1: 正在执行...
任务2: 正在执行...
任务3: 正在执行...
...（重复执行3秒）...
主程序: 开始取消所有任务
任务1: 收到取消信号，原因: context canceled
任务2: 收到取消信号，原因: context canceled
任务3: 收到取消信号，原因: context canceled
主程序: 所有任务已退出
```

**关键逻辑**：

- `WithCancel(parent)`返回子上下文`ctx`和取消函数`cancel`；
- 调用`cancel()`后，`ctx.Done()`通道关闭，所有监听该通道的 goroutine 会收到信号；
- 取消是 “级联的”：子上下文被取消后，其派生的所有子上下文也会被取消。

#### 2. 超时控制（`WithTimeout`与`WithDeadline`）

`WithTimeout`和`WithDeadline`用于创建带超时的上下文，自动在超时或到达截止时间时触发取消，避免 goroutine 无限阻塞。

go

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 模拟一个可能耗时的操作
func fetchData(ctx context.Context, url string) {
	fmt.Printf("开始请求: %s\n", url)
	
	select {
	case <-ctx.Done():
		// 超时或被取消
		fmt.Printf("请求%s失败: %v\n", url, ctx.Err())
		return
	case <-time.After(3 * time.Second): // 模拟请求耗时3秒
		fmt.Printf("请求%s成功: 数据返回\n", url)
	}
}

func main() {
	// 1. WithTimeout：设置超时时间（从当前时间开始计算）
	// 此处设置2秒超时（小于请求耗时3秒，会触发超时）
	ctx1, cancel1 := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel1() // 及时释放资源（即使超时也建议调用）
	go fetchData(ctx1, "https://api.example.com/data1")

	// 2. WithDeadline：设置具体截止时间（绝对时间）
	deadline := time.Now().Add(2 * time.Second) // 2秒后截止
	ctx2, cancel2 := context.WithDeadline(context.Background(), deadline)
	defer cancel2()
	go fetchData(ctx2, "https://api.example.com/data2")

	// 等待结果
	time.Sleep(4 * time.Second)
}
```

**运行输出**：

plaintex

```plaintext
开始请求: https://api.example.com/data1
开始请求: https://api.example.com/data2
请求https://api.example.com/data1失败: context deadline exceeded
请求https://api.example.com/data2失败: context deadline exceeded
```

**区别与使用场景**：

- `WithTimeout(parent, timeout)`：相对时间（如 “3 秒后超时”），适合临时操作；
- `WithDeadline(parent, deadline)`：绝对时间（如 “2024-01-01 12:00:00” 超时），适合需要精确控制截止时间的场景；
- 两者都会在超时后自动调用`cancel`，但仍建议使用`defer`手动调用`cancel`，确保资源及时释放。

#### 3. 元数据传递（`WithValue`）

`WithValue`用于在上下文中存储键值对，实现请求范围的元数据传递（如用户 ID、跟踪 ID 等），避免在函数参数中显式传递这些参数。

go

```go
package main

import (
	"context"
	"fmt"
)

// 定义类型化的键（避免键冲突，最佳实践）
type ctxKey string
const (
	KeyUserID ctxKey = "user_id"
	KeyTraceID ctxKey = "trace_id"
)

// 模拟中间件：添加元数据到上下文
func middleware(ctx context.Context) context.Context {
	// 往上下文添加用户ID和跟踪ID
	ctx = context.WithValue(ctx, KeyUserID, "12345")
	ctx = context.WithValue(ctx, KeyTraceID, "trace-789")
	return ctx
}

// 模拟业务函数：从上下文获取元数据
func businessLogic(ctx context.Context) {
	// 获取元数据（需类型断言）
	userID, ok := ctx.Value(KeyUserID).(string)
	if ok {
		fmt.Printf("处理用户: %s 的请求\n", userID)
	}

	traceID, ok := ctx.Value(KeyTraceID).(string)
	if ok {
		fmt.Printf("跟踪ID: %s\n", traceID)
	}
}

func main() {
	// 根上下文
	ctx := context.Background()
	// 中间件添加元数据
	ctx = middleware(ctx)
	// 业务逻辑使用元数据
	businessLogic(ctx)
}
```

**运行输出**：

plaintext

```plaintext
处理用户: 12345 的请求
跟踪ID: trace-789
```

**最佳实践**：

- **键的类型化**：使用自定义类型（如`type ctxKey string`）作为键，避免不同包之间的键冲突；
- **轻量使用**：`WithValue`仅用于传递**请求范围的元数据**（如认证信息、日志 ID），不适合传递大量数据或频繁修改的值；
- **不可变**：上下文的元数据是只读的，修改需创建新的上下文（`WithValue`返回新上下文，不影响父上下文）。

#### 4. 上下文的继承与级联取消

上下文形成 “树状结构”：子上下文继承父上下文的特性（取消信号、超时、元数据），且子上下文的取消不会影响父上下文，但父上下文取消会级联取消所有子上下文。

go

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func printCancel(ctx context.Context, name string) {
	<-ctx.Done()
	fmt.Printf("上下文%s被取消，原因: %v\n", name, ctx.Err())
}

func main() {
	// 根上下文（永不取消）
	root := context.Background()

	// 父上下文：10秒后超时
	parent, cancelParent := context.WithTimeout(root, 10*time.Second)
	defer cancelParent()
	go printCancel(parent, "parent")

	// 子上下文：基于parent，5秒后超时（早于父上下文）
	child, cancelChild := context.WithTimeout(parent, 5*time.Second)
	defer cancelChild()
	go printCancel(child, "child")

	// 孙上下文：基于child，仅可手动取消
	grandchild, cancelGrandchild := context.WithCancel(child)
	defer cancelGrandchild()
	go printCancel(grandchild, "grandchild")

	// 等待5秒，child和grandchild超时
	time.Sleep(6 * time.Second)
	fmt.Println("5秒后：child和grandchild应已取消")

	// 手动取消parent（即使未到10秒超时）
	cancelParent()
	time.Sleep(1 * time.Second)
	fmt.Println("手动取消parent后：parent应已取消")
}
```

**运行输出**：

plaintext

```plaintext
上下文child被取消，原因: context deadline exceeded
上下文grandchild被取消，原因: context deadline exceeded
5秒后：child和grandchild应已取消
上下文parent被取消，原因: context canceled
手动取消parent后：parent应已取消
```

**继承规则**：

- 子上下文的截止时间**不能晚于**父上下文（`WithDeadline`会自动取较早的时间）；
- 父上下文取消→所有子上下文**自动取消**；
- 子上下文取消→不影响父上下文和其他兄弟上下文。

### 四、实际应用场景

`context`在 Go 开发中应用广泛，以下是典型场景：

#### 1. HTTP 服务中的请求上下文

Go 的`net/http`包中，每个请求`*http.Request`都包含一个`Context`，用于控制请求生命周期内的 goroutine。

go

```go
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

func handler(w http.ResponseWriter, r *http.Request) {
	// 从请求中获取上下文（会随请求结束自动取消）
	ctx := r.Context()
	fmt.Println("请求开始")

	// 模拟耗时操作（5秒），但请求上下文可能提前取消（如客户端断开连接）
	select {
	case <-ctx.Done():
		// 客户端断开连接或请求超时
		fmt.Printf("请求被取消: %v\n", ctx.Err())
		return
	case <-time.After(5 * time.Second):
		// 操作完成
		fmt.Fprintf(w, "请求处理完成")
		fmt.Println("请求完成")
	}
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("服务器启动在:8080")
	http.ListenAndServe(":8080", nil)
}
```

**说明**：当客户端提前关闭连接，`r.Context().Done()`会触发，此时可终止后端操作，避免资源浪费。

#### 2. 分布式任务协调

多个 goroutine 协作完成一个任务时，用`context`统一控制取消或超时。

go

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// 模拟分布式任务：多个子任务并行执行
func subTask(ctx context.Context, id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("子任务%d: 开始执行\n", id)

	select {
	case <-ctx.Done():
		fmt.Printf("子任务%d: 被取消，原因: %v\n", id, ctx.Err())
		return
	case <-time.After(time.Duration(id) * time.Second): // 子任务耗时随id递增
		fmt.Printf("子任务%d: 执行完成\n", id)
	}
}

func main() {
	var wg sync.WaitGroup
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second) // 3秒超时
	defer cancel()

	// 启动3个子任务
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go subTask(ctx, i, &wg)
	}

	wg.Wait()
	fmt.Println("所有子任务处理完毕")
}
```

**运行输出**：

plaintext

```plaintext
子任务1: 开始执行
子任务2: 开始执行
子任务3: 开始执行
子任务1: 执行完成（耗时1秒，未超时）
子任务2: 执行完成（耗时2秒，未超时）
子任务3: 被取消，原因: context deadline exceeded（耗时3秒，刚好超时）
所有子任务处理完毕
```

### 五、`context`包源码核心逻辑

`context`包的实现简洁，核心是通过 “上下文树” 传递信号，所有上下文类型都围绕`Context`接口展开：

#### 1. 上下文类型

- `emptyCtx`：`Background`和`TODO`的底层实现，不包含任何信息（`Done()`返回`nil`，`Err()`返回`nil`）；
- `cancelCtx`：支持取消的上下文，包含`Done`通道、取消函数、子上下文列表等；
- `timerCtx`：继承`cancelCtx`，增加超时计时器（`WithTimeout`和`WithDeadline`的底层实现）；
- `valueCtx`：存储键值对的上下文，包含父上下文和`key-value`对。

#### 2. 取消机制核心（`cancelCtx`）

go

```go
// src/context/context.go
type cancelCtx struct {
	Context            // 父上下文
	mu       sync.Mutex
	done     chan struct{} // 关闭时触发取消
	err      error         // 取消原因
	children map[canceler]struct{} // 子上下文（需级联取消）
}

// 取消时关闭done通道，并级联取消所有子上下文
func (c *cancelCtx) cancel(removeFromParent bool, err error) {
	c.mu.Lock()
	if c.err != nil {
		c.mu.Unlock()
		return // 已取消
	}
	c.err = err
	close(c.done) // 广播取消信号
	// 取消所有子上下文
	for child := range c.children {
		child.cancel(false, err)
	}
	c.children = nil
	c.mu.Unlock()

	if removeFromParent {
		// 从父上下文移除自己
		removeChild(c.Context, c)
	}
}
```

- 取消信号通过关闭`done`通道传递（关闭操作是并发安全的，且可被多个 goroutine 同时监听）；
- 子上下文注册到父上下文的`children`中，父上下文取消时会遍历子上下文并触发取消，实现级联效果。

### 六、总结与最佳实践

`context`是 Go 并发控制的核心工具，使用时需遵循以下原则：

1. **传递而非存储**：上下文应作为函数的第一个参数传递（`func doSomething(ctx context.Context, ...)`），而非存储在结构体中；
2. **根上下文选择**：使用`context.Background()`作为所有上下文的根，仅在不确定时使用`context.TODO()`；
3. **不传递`nil`**：即使函数不使用上下文，也应传递`context.Background()`，而非`nil`；
4. **取消函数的责任**：调用`WithCancel`/`WithTimeout`等函数后，必须在合适时机调用`cancel`（通常用`defer`），避免资源泄漏；
5. **值传递限制**：`WithValue`仅用于传递轻量、请求范围的元数据，不适合传递大量数据或作为函数参数的替代；
6. **避免上下文嵌套过深**：过多的上下文嵌套会增加复杂度，合理设计上下文的作用范围。

掌握`context`能有效解决 goroutine 的协调问题，避免资源泄漏，是编写健壮 Go 程序的必备技能



# 问答

以下是 7 道八股文（含答案）和 3 道场景题（含答案），基于`context`包核心知识点与实践应用：

### 一、八股文题目与答案（难度递增）

#### 1. 基础概念题

**题目**：Go 语言`context.Context`接口定义了哪些方法？请简述每个方法的作用。

**答案**：
`context.Context`接口定义了 4 个核心方法：

- `Deadline() (deadline time.Time, ok bool)`：返回上下文的截止时间（若存在）。`ok`为`true`表示有截止时间，可用于提前规划操作；
- `Done() <-chan struct{}`：返回一个只读通道，当上下文被取消（手动或超时）时，该通道会关闭，用于监听取消信号；
- `Err() error`：返回上下文取消的原因（仅在`Done()`通道关闭后有效）。常见原因：`context.Canceled`（手动取消）、`context.DeadlineExceeded`（超时）；
- `Value(key interface{}) interface{}`：根据`key`获取上下文存储的元数据（如请求 ID、用户信息），用于在函数 /goroutine 间传递轻量数据。

#### 2. 根上下文辨析题

**题目**：`context.Background()`与`context.TODO()`的区别是什么？分别在什么场景下使用？

**答案**：
两者均为 “根上下文”（无父上下文，永不主动取消，`Done()`返回`nil`），核心区别在于**语义和使用场景**：

- `context.Background()`：作为所有上下文的 “根节点”，用于明确的初始化场景（如`main`函数、启动服务、测试用例），表示 “已知且确定的根上下文”；
- `context.TODO()`：作为 “占位符”，用于暂时不确定使用哪种上下文的场景（如代码重构、临时逻辑），表示 “需要后续替换为更具体的上下文”。

**使用原则**：优先用`Background()`作为根上下文，仅在上下文类型暂不明确时用`TODO()`。

#### 3. 取消机制题

**题目**：使用`context.WithCancel(parent)`创建的上下文，当调用返回的`cancel`函数后，会触发哪些连锁反应？子上下文（基于该上下文派生的）会受到影响吗？

**答案**：
调用`cancel`函数后会触发以下连锁反应：

1. 当前上下文的`Done()`通道被关闭（广播取消信号）；
2. 上下文的`Err()`返回`context.Canceled`（标记取消原因）；
3. 级联取消所有基于该上下文派生的子上下文（通过遍历子上下文列表，调用其`cancel`方法）。

**子上下文会受到影响**：因为上下文形成树状结构，子上下文会注册到父上下文的 “子节点列表” 中，父上下文取消时会递归取消所有子节点，确保相关 goroutine 统一退出。

#### 4. 超时控制细节题

**题目**：`context.WithTimeout`与`context.WithDeadline`的核心区别是什么？若父上下文的截止时间早于子上下文通过`WithDeadline`设置的时间，子上下文的实际截止时间会如何变化？为什么？

**答案**：

- **核心区别**：
  `WithTimeout(parent, timeout)`：基于 “相对时间” 设置超时（如 “3 秒后超时”），内部通过`time.Now().Add(timeout)`转换为绝对时间，本质是`WithDeadline`的封装；
  `WithDeadline(parent, deadline)`：基于 “绝对时间” 设置截止点（如 “2024-12-31 23:59:59”），直接指定超时的具体时刻。
- **子上下文截止时间的变化**：
  若父上下文的截止时间早于子上下文通过`WithDeadline`设置的时间，**子上下文的实际截止时间会被修正为父上下文的截止时间**。
  原因：上下文树中，子上下文的生命周期不能超过父上下文（避免父已取消但子仍运行），`WithDeadline`会自动取 “父截止时间” 与 “子设置的截止时间” 中的较小值作为实际截止时间。

#### 5. 元数据传递最佳实践题

**题目**：使用`context.WithValue`传递元数据时，为什么推荐用自定义类型（如`type ctxKey string`）作为键，而非直接使用字符串？请举例说明可能的问题。

**答案**：
推荐用自定义类型作为键的核心原因是**避免键冲突**：
`context.WithValue`的键是`interface{}`类型，若不同包 / 模块使用相同字符串（如`"user_id"`）作为键，会导致元数据被意外覆盖（后设置的值覆盖先设置的值）。

**举例**：

go

```go
// 包A
func setA(ctx context.Context) context.Context {
    return context.WithValue(ctx, "user_id", "1001") // 用字符串键
}

// 包B
func setB(ctx context.Context) context.Context {
    return context.WithValue(ctx, "user_id", "2002") // 同字符串键，覆盖包A的值
}

// 调用时
ctx := context.Background()
ctx = setA(ctx)
ctx = setB(ctx)
fmt.Println(ctx.Value("user_id")) // 输出"2002"，包A的"1001"被覆盖
```

**解决方案**：用自定义类型作为键，确保唯一性：

go

```go
type ctxKey string
const UserIDKey ctxKey = "user_id" // 包内定义的自定义类型键

// 不同包即使键名相同，类型不同，不会冲突
```

#### 6. 上下文继承与级联题

**题目**：上下文形成的 "树状结构" 中，父上下文与子上下文的取消关系是怎样的？若子上下文先被取消，会对父上下文及其他兄弟上下文产生影响吗？请结合原理说明。

**答案**：
上下文树的取消关系遵循 “单向级联” 原则：

1. **父上下文取消→所有子上下文被级联取消**：
   父上下文维护一个 “子上下文列表”（如`cancelCtx`的`children`字段），当父取消时，会遍历列表调用所有子上下文的`cancel`方法，确保子上下文同步取消。
2. **子上下文取消→不影响父上下文及兄弟上下文**：
   子上下文取消时，仅会从父上下文的 “子上下文列表” 中移除自身（避免父取消时重复处理），但不会触发父上下文或其他兄弟上下文的取消。

**原理**：上下文的取消逻辑通过 “父维护子引用” 实现，子对父无反向引用，因此子取消不会向上传播。

#### 7. 源码与最佳实践深入题

**题目**：在函数中传递`context`时，为什么官方推荐 "作为第一个参数传递" 而非 "存储在结构体中"？另外，即使函数暂时用不到`context`，也不建议传递`nil`，原因是什么？

**答案**：

- **推荐作为第一个参数传递的原因**：
  `context`是 “请求范围” 的临时对象（生命周期与单次请求 / 任务绑定），而结构体通常是 “长期存在” 的（如服务实例、工具类）。若将`context`存储在结构体中，可能导致：
  - 上下文过期后仍被使用（如请求已结束，但结构体持有的上下文已取消）；
  - 同一结构体实例被多个请求共享，上下文混乱（不同请求的取消信号、元数据冲突）。
- **不建议传递`nil`的原因**：
  1. 兼容性问题：若后续函数扩展需要上下文（如添加超时控制、传递元数据），传递`nil`会导致代码需大规模修改；
  2. 潜在 panic 风险：部分库（如`net/http`、`database/sql`）对`nil`上下文处理不友好，可能直接 panic；
  3. 语义不明确：`nil`无法表示 “无特殊上下文”，而`context.Background()`明确表示根上下文，语义更清晰。

### 二、场景题与答案（结合实际开发）

#### 1. HTTP 服务中的上下文应用

**题目**：在一个 HTTP 服务中，处理请求的 handler 会启动一个 goroutine 执行耗时任务（如下载大文件）。若客户端在任务完成前断开连接，如何确保这个 goroutine 能及时退出，避免资源泄漏？请编写核心代码实现。

**答案**：
利用`*http.Request`自带的`Context`（随请求生命周期绑定），在 goroutine 中监听`ctx.Done()`通道，客户端断开连接时该通道会关闭，从而终止任务。

**核心代码**：

go

```go
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

func downloadHandler(w http.ResponseWriter, r *http.Request) {
	// 获取请求上下文（客户端断开时自动取消）
	ctx := r.Context()
	fmt.Println("开始下载任务...")

	// 启动goroutine执行耗时任务
	go func(ctx context.Context) {
		// 模拟下载（10秒）
		downloadChan := make(chan struct{})
		go func() {
			time.Sleep(10 * time.Second) // 模拟下载耗时
			close(downloadChan)
		}()

		select {
		case <-ctx.Done():
			// 客户端断开连接，终止任务
			fmt.Printf("客户端断开，下载终止：%v\n", ctx.Err())
			return
		case <-downloadChan:
			// 下载完成
			fmt.Println("下载成功")
		}
	}(ctx)

	w.Write([]byte("下载任务已启动，请等待结果"))
}

func main() {
	http.HandleFunc("/download", downloadHandler)
	fmt.Println("服务启动：http://localhost:8080/download")
	http.ListenAndServe(":8080", nil)
}
```

**关键逻辑**：

- `r.Context()`与请求绑定，客户端断开时`ctx.Done()`触发；
- 通过`select`同时监听任务完成和上下文取消，确保及时响应客户端断开事件。

#### 2. 分布式任务的超时控制

**题目**：设计一个程序，需并行执行 3 个独立的子任务（如调用 3 个不同的 API），要求：

- 所有子任务必须在 10 秒内完成，超时则取消所有任务；
- 若任意子任务失败（返回错误），立即取消所有任务；
- 需等待所有子任务退出后，主程序再结束。
  请用`context`实现并说明关键逻辑。

**答案**：
结合`WithTimeout`（控制总超时）和`WithCancel`（处理子任务错误取消），用`WaitGroup`等待所有子任务退出。

**核心代码**：

go

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

// 子任务：模拟API调用，可能失败或超时
func subTask(ctx context.Context, taskID int, errChan chan<- error, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("子任务%d：开始执行\n", taskID)

	// 模拟任务耗时（1-5秒）
	taskDuration := time.Duration(taskID) * time.Second
	select {
	case <-ctx.Done():
		// 被取消（超时或其他任务失败）
		fmt.Printf("子任务%d：被取消，原因：%v\n", taskID, ctx.Err())
		return
	case <-time.After(taskDuration):
		// 模拟任务2失败
		if taskID == 2 {
			errChan <- errors.New(fmt.Sprintf("子任务%d执行失败", taskID))
			return
		}
		fmt.Printf("子任务%d：执行成功\n", taskID)
	}
}

func main() {
	var wg sync.WaitGroup
	// 10秒超时的根上下文
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 用于传递子任务错误
	errChan := make(chan error, 1) // 缓冲避免阻塞

	// 启动3个子任务
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go subTask(ctx, i, errChan, &wg)
	}

	// 监听错误或超时，触发取消
	go func() {
		select {
		case <-ctx.Done():
			// 超时自动取消
			return
		case err := <-errChan:
			// 子任务失败，手动取消所有任务
			fmt.Printf("收到错误：%v，取消所有任务\n", err)
			cancel()
		}
	}()

	// 等待所有子任务退出
	wg.Wait()
	fmt.Println("所有子任务已处理完毕")
}
```

**关键逻辑**：

- `WithTimeout`确保总耗时不超过 10 秒；
- `errChan`传递子任务错误，一旦收到错误立即调用`cancel`终止所有任务；
- `WaitGroup`等待所有子任务退出，避免主程序提前结束。

#### 3. 上下文泄漏修复

**题目**：以下代码存在 goroutine 泄漏风险，请分析原因并修改：

go

```go
func leakyFunc() {
    ctx := context.Background()
    go func() {
        for {
            select {
            case <-time.After(1 * time.Second):
                fmt.Println("执行任务...")
            }
        }
    }()
}
```

要求：确保`leakyFunc`返回后，内部的 goroutine 能在 5 秒内退出。

**答案**：

- **泄漏原因**：goroutine 中的`for`循环是无限的，且无退出条件（`time.After`仅触发任务执行，不控制退出），`leakyFunc`返回后 goroutine 仍会持续运行，导致泄漏。
- **修复方案**：使用可取消上下文（`WithCancel`），在`leakyFunc`返回时触发取消，使 goroutine 退出。

**修改后代码**：

go

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func fixedFunc() {
	// 创建可取消上下文，函数返回时触发取消
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // 关键：函数退出时调用cancel

	go func(ctx context.Context) {
		for {
			select {
			case <-ctx.Done():
				// 收到取消信号，退出goroutine
				fmt.Println("goroutine退出")
				return
			case <-time.After(1 * time.Second):
				fmt.Println("执行任务...")
			}
		}
	}(ctx)

	// 函数运行5秒后返回（模拟业务逻辑）
	time.Sleep(5 * time.Second)
	fmt.Println("fixedFunc返回")
}

func main() {
	fixedFunc()
	// 等待1秒，确认goroutine已退出
	time.Sleep(1 * time.Second)
}
```

**运行输出**：

plaintext

```plaintext
执行任务...
执行任务...
执行任务...
执行任务...
执行任务...
fixedFunc返回
goroutine退出
```

**关键逻辑**：

- `defer cancel()`确保`fixedFunc`返回时触发上下文取消；
- goroutine 中通过`select`监听`ctx.Done()`，收到信号后立即退出，避免泄漏。

