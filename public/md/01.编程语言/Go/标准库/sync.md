### Go 语言`sync`标准库深入讲解与示例

#### 一、`sync`包核心功能概述

`sync`是 Go 语言处理**并发同步**的标准库，提供了一系列原语用于协调多个 Goroutine 的执行，避免竞态条件（Race Condition）。其核心价值在于：

- **互斥访问**：通过锁机制（如`Mutex`）保证临界区资源的原子操作；
- **同步协作**：使用`WaitGroup`、`Cond`等实现 Goroutine 间的等待与通知；
- **原子操作**：通过`sync/atomic`子包提供低级别内存原子操作（如增减、比较交换）；
- **并发安全数据结构**：如`Map`（并发安全的映射）、`Pool`（临时对象池）。

`sync`是 Go 并发编程的基石，正确使用可确保多 Goroutine 环境下的数据一致性和执行顺序。

### 二、核心类型与功能解析

#### 1. 互斥锁（`Mutex`与`RWMutex`）

互斥锁用于保护临界区，防止多个 Goroutine 同时修改共享资源。

| 类型           | 特点                                    | 适用场景                                 |
| -------------- | --------------------------------------- | ---------------------------------------- |
| `sync.Mutex`   | 排他锁：同一时间仅一个 Goroutine 可持有 | 读写操作均需独占资源（如写多、读写频繁） |
| `sync.RWMutex` | 读写锁：多个读锁可共存，写锁排他        | 读多写少场景（如缓存、配置读取）         |

**`Mutex`示例**：

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	count int
	mu    sync.Mutex // 保护count的互斥锁
)

// 对count执行加1操作（临界区）
func increment() {
	mu.Lock()         // 加锁
	defer mu.Unlock() // 确保解锁（即使函数 panic 也会执行）
	count++
}

func main() {
	var wg sync.WaitGroup // 用于等待所有Goroutine完成

	// 启动1000个Goroutine并发执行increment
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			increment()
			time.Sleep(10 * time.Microsecond) // 模拟其他操作
		}()
	}

	wg.Wait() // 等待所有Goroutine完成
	fmt.Printf("最终count值: %d\n", count) // 若不加锁，结果可能小于1000；加锁后稳定为1000
}
```

**`RWMutex`示例**：

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	data  = "初始数据"
	rwmu  sync.RWMutex // 读写锁
)

// 读操作：可并发执行
func readData(id int) {
	rwmu.RLock()         // 获取读锁
	defer rwmu.RUnlock() // 释放读锁
	fmt.Printf("读Goroutine %d 读取到: %s\n", id, data)
	time.Sleep(100 * time.Millisecond) // 模拟读耗时
}

// 写操作：排他执行
func writeData(newData string) {
	rwmu.Lock()         // 获取写锁
	defer rwmu.Unlock() // 释放写锁
	fmt.Printf("写入新数据: %s\n", newData)
	data = newData
	time.Sleep(200 * time.Millisecond) // 模拟写耗时
}

func main() {
	var wg sync.WaitGroup

	// 启动5个读Goroutine（可同时执行）
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			readData(id)
		}(i)
	}

	// 启动1个写Goroutine（会阻塞读，直到写完成）
	wg.Add(1)
	go func() {
		defer wg.Done()
		writeData("更新后的数据")
	}()

	// 再启动5个读Goroutine（会等待写完成后执行）
	for i := 5; i < 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			readData(id)
		}(i)
	}

	wg.Wait()
}
```

**输出规律**：

- 前 5 个读 Goroutine 同时读取 “初始数据”；
- 写 Goroutine 启动后，会等待所有读锁释放，然后执行写入；
- 后 5 个读 Goroutine 需等待写锁释放，最终读取 “更新后的数据”。

#### 2. 等待组（`WaitGroup`）

`WaitGroup`用于等待一组 Goroutine 完成，避免主线程提前退出。其核心方法：

- `Add(n int)`：添加需要等待的 Goroutine 数量；
- `Done()`：标记一个 Goroutine 完成（等价于`Add(-1)`）；
- `Wait()`：阻塞当前 Goroutine，直到所有等待的 Goroutine 完成。

**示例**：

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done() // 完成后通知WaitGroup
	fmt.Printf("工作Goroutine %d 开始\n", id)
	time.Sleep(time.Duration(id) * 100 * time.Millisecond) // 模拟不同耗时
	fmt.Printf("工作Goroutine %d 结束\n", id)
}

func main() {
	var wg sync.WaitGroup

	// 启动3个工作Goroutine
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go worker(i, &wg) // 注意：WaitGroup必须传指针，否则会复制
	}

	fmt.Println("等待所有工作完成...")
	wg.Wait() // 阻塞，直到所有worker调用Done()
	fmt.Println("所有工作已完成")
}
```

**注意**：

- `WaitGroup`是值类型，传递时必须使用指针（否则每个 Goroutine 操作的是副本）；
- 不可在`Wait()`之后调用`Add()`，否则可能导致恐慌（panic）。

#### 3. 条件变量（`Cond`）

`Cond`用于协调多个 Goroutine 的执行顺序，实现 “等待 - 通知” 模式（如生产者 - 消费者模型）。核心方法：

- `Wait()`：释放锁并阻塞等待，被唤醒时重新获取锁；
- `Signal()`：唤醒一个等待的 Goroutine；
- `Broadcast()`：唤醒所有等待的 Goroutine。

**生产者 - 消费者示例**：

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	queue  []int      // 共享队列（缓冲区）
	mu     sync.Mutex // 保护队列的锁
	cond   *sync.Cond // 条件变量（依赖mu作为底层锁）
	cap    = 3        // 队列容量
)

func init() {
	cond = sync.NewCond(&mu) // 初始化条件变量，绑定互斥锁
}

// 生产者：向队列添加数据
func producer(id int) {
	for i := 0; i < 5; i++ { // 生产5个数据
		mu.Lock()
		// 等待队列有空闲位置（缓冲区未满）
		for len(queue) == cap {
			fmt.Printf("生产者 %d 等待：队列已满\n", id)
			cond.Wait() // 释放锁并等待，被唤醒后重新获取锁
		}
		// 生产数据
		data := id*10 + i
		queue = append(queue, data)
		fmt.Printf("生产者 %d 生产：%d，队列：%v\n", id, data, queue)
		mu.Unlock()
		cond.Signal() // 通知一个消费者
		time.Sleep(100 * time.Millisecond) // 模拟生产耗时
	}
}

// 消费者：从队列获取数据
func consumer(id int) {
	for i := 0; i < 5; i++ { // 消费5个数据
		mu.Lock()
		// 等待队列有数据（缓冲区非空）
		for len(queue) == 0 {
			fmt.Printf("消费者 %d 等待：队列空\n", id)
			cond.Wait() // 释放锁并等待
		}
		// 消费数据
		data := queue[0]
		queue = queue[1:]
		fmt.Printf("消费者 %d 消费：%d，队列：%v\n", id, data, queue)
		mu.Unlock()
		cond.Signal() // 通知一个生产者
		time.Sleep(200 * time.Millisecond) // 模拟消费耗时
	}
}

func main() {
	var wg sync.WaitGroup
	wg.Add(2 + 2) // 2个生产者 + 2个消费者

	// 启动生产者
	go func() {
		defer wg.Done()
		producer(1)
	}()
	go func() {
		defer wg.Done()
		producer(2)
	}()

	// 启动消费者
	go func() {
		defer wg.Done()
		consumer(1)
	}()
	go func() {
		defer wg.Done()
		consumer(2)
	}()

	wg.Wait()
	fmt.Println("所有生产消费完成")
}
```

**关键逻辑**：

- 生产者满队列时调用`Wait()`阻塞，消费者取走数据后通过`Signal()`唤醒；
- 消费者空队列时调用`Wait()`阻塞，生产者添加数据后通过`Signal()`唤醒；
- `Wait()`必须在锁保护下调用，且需用`for`循环检查条件（防止虚假唤醒）。

#### 4. 并发安全映射（`Map`）

`sync.Map`是 Go 1.9 + 引入的并发安全映射，适用于 “读多写少” 或 “键值对动态增减” 场景，性能优于`RWMutex + map`。核心方法：

- `Store(key, value interface{})`：存储键值对；
- `Load(key interface{}) (value interface{}, ok bool)`：读取键值；
- `Delete(key interface{})`：删除键；
- `Range(f func(key, value interface{}) bool)`：遍历所有键值对（需注意遍历期间的修改可能不被反映）。

**示例**：

go

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var m sync.Map
	var wg sync.WaitGroup

	// 启动5个Goroutine写入数据
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			m.Store(id, fmt.Sprintf("value%d", id))
		}(i)
	}

	// 启动5个Goroutine读取数据
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			if val, ok := m.Load(id); ok {
				fmt.Printf("读取键 %d: %v\n", id, val)
			} else {
				fmt.Printf("键 %d 不存在\n", id)
			}
		}(i)
	}

	wg.Wait()

	// 遍历所有键值对
	fmt.Println("遍历所有键值对：")
	m.Range(func(key, value interface{}) bool {
		fmt.Printf("key: %v, value: %v\n", key, value)
		return true // 继续遍历
	})
}
```

**适用场景**：

- 缓存系统（频繁读取，偶尔更新）；
- 临时数据存储（键值对动态添加 / 删除）；
- 不适合需要严格排序或复杂查询的场景（此时建议用`RWMutex + map`）。

#### 5. 临时对象池（`Pool`）

`Pool`用于缓存临时对象，减少内存分配和 GC 压力，适用于 “创建成本高、可复用” 的对象（如缓冲区、解析器）。核心方法：

- `Get() interface{}`：从池获取一个对象（若没有则返回`nil`）；
- `Put(x interface{})`：将对象放回池（对象需处于可复用状态）。

**示例**：

go

```go
package main

import (
	"bytes"
	"fmt"
	"sync"
)

var bufPool = sync.Pool{
	New: func() interface{} { // 当池为空时，创建新对象的函数
		return new(bytes.Buffer)
	},
}

// 处理数据：使用Pool复用缓冲区
func processData(data string) string {
	buf := bufPool.Get().(*bytes.Buffer) // 从池获取
	buf.Reset()                         // 重置缓冲区（关键：确保对象状态干净）
	buf.WriteString("处理后：")
	buf.WriteString(data)
	result := buf.String()
	bufPool.Put(buf) // 放回池
	return result
}

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			data := fmt.Sprintf("原始数据%d", id)
			result := processData(data)
			if id%100 == 0 { // 打印部分结果
				fmt.Println(result)
			}
		}(i)
	}
	wg.Wait()
}
```

**注意**：

- `Pool`中的对象可能被 GC 回收（无强引用），`Get()`可能返回`nil`（需通过`New`函数兜底）；
- 放入池的对象必须重置状态（如`buf.Reset()`），避免数据污染；
- 适用于临时对象（如请求级别的缓冲区），不适合长期持有状态的对象。

#### 6. 原子操作（`sync/atomic`）

`sync/atomic`提供底层内存原子操作，比锁更高效，适合简单的计数、标志位等场景。常用函数：

- `AddInt64`/`AddUint64`：原子增减；
- `LoadInt64`/`StoreInt64`：原子读取 / 写入；
- `CompareAndSwapInt64`（CAS）：比较并交换（乐观锁核心）。

**示例**：

go



```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var count int64 = 0 // 必须用int64等支持原子操作的类型
	var wg sync.WaitGroup

	// 1000个Goroutine并发加1
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			atomic.AddInt64(&count, 1) // 原子加1
		}()
	}

	wg.Wait()
	fmt.Printf("原子操作结果: %d\n", atomic.LoadInt64(&count)) // 稳定为1000

	// 比较并交换（CAS）示例
	var value int64 = 5
	// 尝试将value从5改为10（成功）
	swapped := atomic.CompareAndSwapInt64(&value, 5, 10)
	fmt.Printf("第一次CAS: %v, value=%d\n", swapped, value) // true, 10

	// 尝试将value从5改为20（失败，因当前value是10）
	swapped = atomic.CompareAndSwapInt64(&value, 5, 20)
	fmt.Printf("第二次CAS: %v, value=%d\n", swapped, value) // false, 10
}
```

**优势与局限**：

- 性能优于锁（无上下文切换开销）；
- 仅支持基本类型（`int32`/`int64`/`uintptr`等），复杂操作仍需锁；
- CAS 操作可能失败（需循环重试），适合冲突率低的场景。

### 三、最佳实践与常见问题

1. **锁的粒度控制**：
   - 减少锁持有时间（如将非临界区代码移出`Lock()`/`Unlock()`）；
   - 拆分大锁为多个小锁（如对数组的不同元素使用不同锁）。
2. **避免死锁**：
   - 按固定顺序获取多个锁（如总是先锁 A 后锁 B）；
   - 使用`Mutex.TryLock()`（扩展库支持）或超时机制检测死锁；
   - 避免在持有锁时调用未知函数（可能再次加锁）。
3. **`WaitGroup`使用规范**：
   - 确保`Add()`的数量与`Done()`一致，避免`Wait()`永久阻塞；
   - 不在

### Go 语言`sync`包深入讲解与示例

#### 一、`sync`包核心功能概述

`sync`是 Go 语言处理**并发同步**的标准库，提供了一系列原语用于协调多个 goroutine 的执行，避免竞态条件（race condition）。其核心价值在于：

- **同步原语**：提供互斥锁、读写锁、条件变量等基础同步工具；
- **并发控制**：支持等待组、一次性初始化等高级模式；
- **安全通信**：辅助 goroutine 间的数据共享与协作；
- **性能优化**：原语设计兼顾安全性和效率，适配 Go 的并发模型。

`sync`是编写正确并发程序的基础，理解其原语的工作原理和适用场景是 Go 并发编程的核心技能。

### 二、核心原语与示例

#### 1. 互斥锁（`sync.Mutex`）

`Mutex`是最基础的同步原语，保证同一时间只有一个 goroutine 能访问共享资源，实现 “互斥” 访问。

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// 共享资源：计数器
var count int
var mu sync.Mutex // 保护count的互斥锁

// 对计数器执行加1操作
func increment(wg *sync.WaitGroup) {
	defer wg.Done()

	// 加锁：确保同一时间只有一个goroutine执行临界区
	mu.Lock()
	defer mu.Unlock() // 函数退出时自动解锁

	count++
	fmt.Printf("计数: %d (goroutine: %p)\n", count, &count)
	time.Sleep(100 * time.Millisecond) // 模拟耗时操作
}

func main() {
	var wg sync.WaitGroup

	// 启动10个goroutine并发执行increment
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go increment(&wg)
	}

	wg.Wait() // 等待所有goroutine完成
	fmt.Printf("最终计数: %d\n", count) // 预期输出10
}
```

**关键方法**：

- `Lock()`：获取锁，若已被其他 goroutine 持有，则阻塞等待；
- `Unlock()`：释放锁，唤醒等待的 goroutine；
- 必须保证`Lock()`和`Unlock()`成对出现（通常用`defer`确保解锁）。

**适用场景**：

- 保护读写频率相当的共享资源；
- 临界区操作耗时较短的场景。

#### 2. 读写锁（`sync.RWMutex`）

`RWMutex`是对`Mutex`的优化，区分 “读锁” 和 “写锁”，允许多个读操作并发执行，但读写、写写操作互斥。

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	data  = "初始数据"
	rwmu  sync.RWMutex // 读写锁
	count int          // 记录读取次数
)

// 读操作：可以并发执行
func readData(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	rwmu.RLock()         // 获取读锁
	defer rwmu.RUnlock() // 释放读锁

	// 模拟读取操作
	time.Sleep(50 * time.Millisecond)
	count++
	fmt.Printf("读goroutine %d: 数据=%s, 读取次数=%d\n", id, data, count)
}

// 写操作：独占访问
func writeData(newData string, wg *sync.WaitGroup) {
	defer wg.Done()

	rwmu.Lock()         // 获取写锁
	defer rwmu.Unlock() // 释放写锁

	// 模拟写入操作
	time.Sleep(100 * time.Millisecond)
	data = newData
	fmt.Printf("写操作: 数据更新为=%s\n", data)
}

func main() {
	var wg sync.WaitGroup

	// 启动5个读goroutine（可并发）
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go readData(i, &wg)
	}

	// 启动1个写goroutine（会阻塞读操作）
	wg.Add(1)
	go writeData("更新后的数据", &wg)

	// 再启动5个读goroutine
	for i := 5; i < 10; i++ {
		wg.Add(1)
		go readData(i, &wg)
	}

	wg.Wait()
	fmt.Println("所有操作完成")
}
```

**关键方法**：

- 读锁：`RLock()`（获取）、`RUnlock()`（释放），多个 goroutine 可同时持有；
- 写锁：`Lock()`（获取）、`Unlock()`（释放），排他性持有，与读锁、其他写锁互斥。

**适用场景**：

- 读操作远多于写操作的场景（如缓存、配置读取）；
- 读操作耗时较长，希望并发执行以提高效率。

#### 3. 等待组（`sync.WaitGroup`）

`WaitGroup`用于等待一组 goroutine 完成，避免使用`time.Sleep`等不可靠的同步方式。

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func task(id int, wg *sync.WaitGroup) {
	defer wg.Done() // 任务完成时通知WaitGroup
	fmt.Printf("任务 %d 开始\n", id)
	time.Sleep(time.Duration(id) * 100 * time.Millisecond) // 模拟不同耗时
	fmt.Printf("任务 %d 完成\n", id)
}

func main() {
	var wg sync.WaitGroup

	// 启动3个任务
	for i := 1; i <= 3; i++ {
		wg.Add(1) // 增加等待计数
		go task(i, &wg)
	}

	fmt.Println("等待所有任务完成...")
	wg.Wait() // 阻塞直到所有任务完成
	fmt.Println("所有任务已完成")
}
```

**关键方法**：

- `Add(n int)`：增加等待的 goroutine 数量（`n`为正）；
- `Done()`：减少等待计数（等价于`Add(-1)`）；
- `Wait()`：阻塞当前 goroutine，直到等待计数归 0。

**注意事项**：

- `Add`必须在启动 goroutine 前调用，避免`Wait`提前返回；
- 不可复制`WaitGroup`（其内部状态为指针类型）。

#### 4. 条件变量（`sync.Cond`）

`Cond`用于协调多个 goroutine 的执行顺序，实现 “等待 - 通知” 模式（如生产者 - 消费者模型）。

go

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	queue  []int      // 共享队列
	mu     sync.Mutex // 保护队列的锁
	cond   *sync.Cond // 条件变量
	cap    = 5        // 队列容量
	closed = false    // 队列是否关闭
)

func init() {
	cond = sync.NewCond(&mu) // 基于互斥锁创建条件变量
}

// 生产者：向队列添加数据
func producer(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	for i := 0; i < 3; i++ { // 每个生产者生产3个数据
		mu.Lock()

		// 等待队列有空闲空间
		for len(queue) == cap {
			cond.Wait() // 释放锁并阻塞等待，被唤醒时重新获取锁
		}

		// 生产数据
		data := id*10 + i
		queue = append(queue, data)
		fmt.Printf("生产者 %d: 生产数据 %d, 队列长度=%d\n", id, data, len(queue))

		mu.Unlock()
		cond.Signal() // 通知一个等待的消费者
		time.Sleep(100 * time.Millisecond)
	}
}

// 消费者：从队列获取数据
func consumer(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		mu.Lock()

		// 等待队列有数据或已关闭
		for len(queue) == 0 && !closed {
			cond.Wait()
		}

		// 检查退出条件
		if len(queue) == 0 && closed {
			mu.Unlock()
			break
		}

		// 消费数据
		data := queue[0]
		queue = queue[1:]
		fmt.Printf("消费者 %d: 消费数据 %d, 队列长度=%d\n", id, data, len(queue))

		mu.Unlock()
		cond.Signal() // 通知一个等待的生产者
		time.Sleep(150 * time.Millisecond)
	}
	fmt.Printf("消费者 %d: 退出\n", id)
}

func main() {
	var wg sync.WaitGroup

	// 启动2个生产者
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go producer(i, &wg)
	}

	// 启动3个消费者
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go consumer(i, &wg)
	}

	// 等待生产者完成
	wg.Wait()

	// 关闭队列，通知消费者退出
	mu.Lock()
	closed = true
	mu.Unlock()
	cond.Broadcast() // 唤醒所有等待的消费者

	// 等待消费者退出（重新计数）
	var consumerWg sync.WaitGroup
	consumerWg.Add(3)
	for i := 0; i < 3; i++ {
		go func() {
			defer consumerWg.Done()
			// 实际中应通过channel等方式等待，此处简化
		}()
	}
	consumerWg.Wait()

	fmt.Println("所有操作完成")
}
```

**关键方法**：

- `Wait()`：释放关联的锁并阻塞等待，被唤醒时重新获取锁（必须在持有锁时调用）；
- `Signal()`：唤醒一个等待的 goroutine；
- `Broadcast()`：唤醒所有等待的 goroutine。

**适用场景**：

- 生产者 - 消费者模型；
- 多个 goroutine 等待某个条件满足（如资源就绪、状态变化）。

#### 5. 一次性初始化（`sync.Once`）

`Once`保证某个函数仅被执行一次，无论多少 goroutine 同时调用，适合初始化全局资源。

go

```go
package main

import (
	"fmt"
	"sync"
)

var (
	config  string
	once    sync.Once
	initErr error
)

// 初始化函数：仅需执行一次
func initConfig() error {
	fmt.Println("执行初始化配置...")
	// 模拟配置加载（如从文件、数据库读取）
	config = "database=test;port=3306"
	return nil
}

// 获取配置：确保初始化只执行一次
func getConfig() (string, error) {
	once.Do(func() {
		// once.Do的函数参数中执行初始化
		initErr = initConfig()
	})
	return config, initErr
}

func main() {
	var wg sync.WaitGroup

	// 10个goroutine同时获取配置
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			cfg, err := getConfig()
			if err != nil {
				fmt.Printf("goroutine %d: 初始化失败: %v\n", id, err)
				return
			}
			fmt.Printf("goroutine %d: 获取配置: %s\n", id, cfg)
		}(i)
	}

	wg.Wait()
}
```

**关键方法**：

- `Do(f func())`：执行函数`f`，确保无论被调用多少次，`f`仅执行一次；
- 若`f` panic，`Do`会将 panic 传播给调用者，且后续调用`Do`会直接返回（不会再次执行`f`）。

**适用场景**：

- 全局资源初始化（如数据库连接、配置加载）；
- 单例模式实现。

#### 6. 并发映射（`sync.Map`）

`sync.Map`是 Go 1.9 + 引入的并发安全映射，专为 “读多写少” 场景优化，无需手动加锁。

go

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var m sync.Map
	var wg sync.WaitGroup

	// 写入数据（3个goroutine）
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func(key, value int) {
			defer wg.Done()
			m.Store(key, value) // 存储键值对
			fmt.Printf("写入: %d -> %d\n", key, value)
		}(i, i*10)
	}

	wg.Wait()

	// 读取数据（5个goroutine）
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(key int) {
			defer wg.Done()
			if value, ok := m.Load(key); ok { // 加载键值对
				fmt.Printf("读取: %d -> %v\n", key, value)
			} else {
				fmt.Printf("读取: %d 不存在\n", key)
			}
		}(i)
	}

	wg.Wait()

	// 遍历所有键值对
	m.Range(func(key, value interface{}) bool {
		fmt.Printf("遍历: %v -> %v\n", key, value)
		return true // 继续遍历
	})
}
```

**关键方法**：

- `Store(key, value interface{})`：存储键值对；
- `Load(key interface{}) (value interface{}, ok bool)`：读取键值对；
- `LoadOrStore(key, value interface{}) (actual interface{}, loaded bool)`：若键存在则返回现有值，否则存储并返回新值；
- `Delete(key interface{})`：删除键值对；
- `Range(f func(key, value interface{}) bool)`：遍历所有键值对（`f`返回`false`时停止）。

**适用场景**：

- 读操作远多于写操作的并发场景；
- 需动态增删键的场景（避免手动管理`map`+`Mutex`的复杂性）。

### 三、其他同步工具

#### 1. 池（`sync.Pool`）

`Pool`是一个临时对象池，用于缓存临时对象以减少内存分配和 GC 压力，适用于高频创建和销毁的对象（如缓冲区）。

go

```go
package main

import (
	"bytes"
	"fmt"
	"sync"
)

var bufferPool = sync.Pool{
	// 当池为空时，创建新对象的函数
	New: func() interface{} {
		return new(bytes.Buffer)
	},
}

func main() {
	var wg sync.WaitGroup

	// 10个goroutine复用缓冲区
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			// 从池获取对象
			buf := bufferPool.Get().(*bytes.Buffer)
			defer func() {
				buf.Reset()       // 重置对象状态
				bufferPool.Put(buf) // 归还对象到池
			}()

			// 使用缓冲区
			buf.WriteString(fmt.Sprintf("goroutine %d: 临时数据", id))
			fmt.Println(buf.String())
		}(i)
	}

	wg.Wait()
}
```

**注意事项**：

- `Pool`中的对象可能被 GC 回收，不能保证数据持久化；
- 适用于无状态或可重置状态的临时对象；
- 是并发安全的，但不同 P（处理器）可能有本地池，性能优化依赖 Go 调度器。

### 四、最佳实践与注意事项

1. **最小锁范围**：
   临界区（`Lock`与`Unlock`之间的代码）应尽可能小，减少 goroutine 阻塞时间。
2. **避免死锁**：
   - 多个锁的获取顺序需一致（如总是先获取 A 锁再获取 B 锁）；
   - 避免在持有锁时调用外部函数（可能导致重入锁或锁顺序反转）。
3. **优先使用信道（channel）**：
   Go 鼓励通过 “通信共享内存” 而非 “共享内存通信”，简单的同步场景（如生产者 - 消费者）用 channel 更简洁安全。
4. **性能考量**：
   - 读多写少用`RWMutex`，读写均衡用`Mutex`；
   - 高频临时对象用`sync.Pool`减少分配；
   - 简单的并发映射需求用`sync.Map`，复杂场景考虑第三方库（如`github.com/orcaman/concurrent-map`）。
5. **避免复制同步原语**：
   `Mutex`、`RWMutex`、`WaitGroup`等包含不可复制的内部状态，复制后使用会导致未定义行为（可通过`go vet`检测）。

### 五、总结

`sync`包提供了 Go 并发编程的基础同步原语，涵盖了互斥、等待、条件通知等核心需求。选择合适的原语需结合场景：

- 简单互斥用`Mutex`；
- 读多写少用`RWMutex`；
- 等待一组任务用`WaitGroup`；
- 条件等待用`Cond`；
- 一次性初始化用`Once`；
- 并发映射用`sync.Map`；
- 临时对象复用用`sync.Pool`。

理解这些原语的工作原理和局限性，结合 Go 的 goroutine 和 channel，才能编写高效、安全的并发程序。实际开发中，应优先考虑代码可读性和安全性，避免过度优化。