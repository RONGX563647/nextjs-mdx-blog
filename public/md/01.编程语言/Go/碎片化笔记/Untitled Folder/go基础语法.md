根据图片中视频文件的排列顺序，以下是Go语言基础语法的按序讲解：

1. **变量定义（2-1）**

   - Go使用`var`关键字声明变量，支持显式类型声明或类型推断（`:=`）。

   - 示例：

     ```
     var a int = 10  // 显式类型
     b := "hello"    // 类型推断
     ```

2. **内建变量类型（2-2）**

   - 基本类型：`int`, `float64`, `bool`, `string`等。
   - 派生类型：数组、切片、结构体、指针等。
   - 特殊类型：`byte`（uint8别名）、`rune`（int32别名，表示Unicode字符）。

3. **常量与枚举（2-3）**

   - 常量用`const`声明，枚举通过`iota`实现。

   - 示例：

     ```
     const Pi = 3.14
     const (
         Red = iota  // 0
         Blue        // 1
     )
     ```

4. **条件语句（2-4）**

   - `if-else`语句：条件无需括号，必须带花括号。

   - `switch-case`：支持多条件匹配，默认`break`。

   - 示例：

     ```
     if x > 0 {
         fmt.Println("Positive")
     }
     ```

5. **循环（2-5）**

   - Go只有`for`循环，无`while`关键字。

   - 三种形式：

     ```
     for i := 0; i < 10; i++ {}  // 传统for
     for i < 10 {}               // while替代
     for range arr {}            // 迭代器
     ```

6. **函数（2-6）**

   - 用`func`定义，支持多返回值、匿名函数和闭包。

   - 示例：

     ```
     func add(a, b int) (sum int) {
         sum = a + b
         return
     }
     ```

7. **指针（2-7）**

   - 指针类型用`*`声明，`&`取地址，`*`解引用。

   - 示例：

     ```
     var p *int
     x := 42
     p = &x
     fmt.Println(*p)  // 输出42
     ```

这个顺序从基础到进阶，适合逐步掌握Go的核心语法。





### Go 语言基础基础语法深入讲解

#### 一、变量定义（2-1）

Go 语言的变量声明具有简洁性和灵活性，支持多种声明方式：

1. **标准变量声明**

   go

   

   ```go
   var a int         // 声明变量但不初始化，默认值为0
   var b string = "hello"  // 声明并初始化
   var c, d float64 = 3.14, 2.71  // 同时变量声明
   ```

2. **类型推断声明（:=）**
   这是 Go 中最常用的声明方式，只能在函数内部使用

   go

   

   ```go
   name := "Alice"   // 自动推断为string类型
   age := 30         // 自动推断为int类型
   height, weight := 1.75, 65.5  // 多变量同时声明
   ```

3. **零值特性**
   未初始化的变量会被赋予默认零值：

   - 数值类型：0
   - 布尔类型：false
   - 字符串：""
   - 指针：nil

4. **变量作用域**

   - 函数内声明的变量为局部变量
   - 函数外声明的变量为包级变量
   - 首字母大写的变量可被其他包访问

#### 二、内建变量类型（2-2）

Go 语言是静态类型语言，所有变量必须有明确类型：

1. **基本类型**

   - 整数类型：int（根据系统位数决定 32/64 位）、int8、int16、int32、int64、uint 系列
   - 浮点类型：float32（精度约 6 位小数）、float64（精度约 15 位小数，默认）
   - 复数类型：complex64、complex128
   - 布尔类型：bool（值为 true 或 false，不可用 0/1 替代）
   - 字符串：string（不可变序列，使用 UTF-8 编码）

2. **派生类型**

   - 数组：固定长度的相同类型元素集合 `[5]int{1,2,3,4,5}`
   - 切片：动态长度的序列 `[]int{1,2,3}` 或使用 make 创建
   - 映射：键值对集合 `map[string]int{"a":1, "b":2}`
   - 结构体：自定义复合类型
   - 指针：指向变量内存地址
   - 函数：可作为参数和返回值

3. **特殊类型**

   - byte：uint8 的别名，用于表示 ASCII 字符
   - rune：int32 的别名，用于表示 Unicode 码点（支持中文等多字节字符）

   go

   ```go
   s := "Hello 世界"
   fmt.Println(len(s))         // 输出11（字节长度）
   fmt.Println(utf8.RuneCountInString(s))  // 输出7（字符数）
   ```

#### 三、常量与枚举（2-3）

1. **常量声明**
   使用`const`关键字，值在编译期确定，不能修改

   go

   ```go
   const Pi float64 = 3.1415926
   const MaxSize = 1024  // 自动推断类型
   const (
       StatusOK = 200
       StatusNotFound = 404
   )
   ```

2. **枚举实现**
   使用`iota`关键字创建自增枚举值，从 0 开始

   go

   ```go
   const (
       Sunday = iota    // 0
       Monday           // 1
       Tuesday          // 2
       Wednesday        // 3
       Thursday         // 4
       Friday           // 5
       Saturday         // 6
   )
   
   // 复杂用法
   const (
       _ = iota         // 跳过0
       KB = 1 << (10 * iota)  // 1 << 10 = 1024
       MB                     // 1 << 20 = 1048576
       GB                     // 1 << 30 = 1073741824
   )
   ```

#### 四、条件语句（2-4）

1. **if-else 语句**

   - 条件表达式不需要括号
   - 必须使用花括号，即使只有一行代码
   - 支持在条件中声明变量

   go

   ```go
   if score := 85; score >= 90 {
       fmt.Println("优秀")
   } else if score >= 60 {
       fmt.Println("及格")
   } else {
       fmt.Println("不及格")
   }
   ```

2. **switch-case 语句**

   - 不需要显式 break，默认自动跳出
   - 支持任意类型比较
   - 可以没有 default 分支

   go

   ```go
   day := 3
   switch day {
   case 1:
       fmt.Println("星期一")
   case 2, 3, 4, 5:  // 多值匹配
       fmt.Println("工作日")
   case 6, 7:
       fmt.Println("周末")
   }
   
   // 无表达式switch（类似if-else链）
   switch {
   case x < 0:
       fmt.Println("负数")
   case x == 0:
       fmt.Println("零")
   default:
       fmt.Println("正数")
   }
   ```

#### 五、循环（2-5）

Go 语言只有`for`一种循环结构，但可以实现多种循环方式：

1. **传统 for 循环**

   go

   ```go
   for i := 0; i < 10; i++ {
       fmt.Println(i)
   }
   ```

2. **while 循环替代**
   省略初始化和增量部分，只剩条件判断

   go

   ```go
   count := 0
   for count < 5 {
       fmt.Println(count)
       count++
   }
   ```

3. **无限循环**
   省略所有条件，需使用 break 终止

   go

   ```go
   for {
       fmt.Println("循环中")
       if someCondition {
           break
       }
   }
   ```

4. **range 循环（迭代）**
   用于遍历数组、切片、字符串、映射等

   go

   ```go
   // 遍历字符串
   str := "hello"
   for index, char := range str {
       fmt.Printf("索引：%d，字符：%c\n", index, char)
   }
   
   // 遍历切片
   nums := []int{1, 2, 3}
   for _, num := range nums {  // 使用_忽略索引
       fmt.Println(num)
   }
   ```

#### 六、函数（2-6）

Go 函数具有灵活的特性，支持多返回值等高级功能：

1. **基本函数定义**

   go

   ```go
   // 函数声明：func 函数名(参数列表) 返回值类型 { ... }
   func add(a int, b int) int {
       return a + b
   }
   
   // 参数类型简写（相同类型）
   func multiply(x, y float64) float64 {
       return x * y
   }
   ```

2. **多返回值**
   Go 的特色功能，常用于返回结果和错误信息

   go

   ```go
   func divide(a, b float64) (float64, error) {
       if b == 0 {
           return 0, fmt.Errorf("除数不能为零")
       }
       return a / b, nil
   }
   
   // 调用
   result, err := divide(10, 2)
   if err != nil {
       fmt.Println("错误：", err)
   } else {
       fmt.Println("结果：", result)
   }
   ```

3. **命名返回值**
   可以给返回值命名，直接 return 即可

   go

   

   ```go
   func calculate(a, b int) (sum, product int) {
       sum = a + b
       product = a * b
       return  // 无需指定返回值，自动返回sum和product
   }
   ```

4. **匿名函数与闭包**

   go

   

   ```go
   // 匿名函数
   add := func(a, b int) int {
       return a + b
   }
   fmt.Println(add(2, 3))  // 输出5
   
   // 闭包：捕获外部变量
   counter := func() func() int {
       count := 0
       return func() int {
           count++
           return count
       }
   }()
   
   fmt.Println(counter())  // 1
   fmt.Println(counter())  // 2
   ```

#### 七、指针（2-7）

指针是存储变量内存地址的变量，Go 语言支持指针但不支持指针运算：

1. **指针声明与使用**

   go

   

   ```go
   var x int = 10
   var p *int  // 声明int类型指针
   
   p = &x      // &取x的地址赋值给p
   fmt.Println(p)   // 输出内存地址，如0xc00001a0a8
   fmt.Println(*p)  // *解引用，输出10
   
   *p = 20     // 通过指针修改x的值
   fmt.Println(x)   // 输出20
   ```

2. **函数指针参数**
   传递指针可以避免值拷贝，并且能修改原始值

   go

   ```go
   func increment(num *int) {
       *num++
   }
   
   func main() {
       a := 5
       increment(&a)
       fmt.Println(a)  // 输出6
   }
   ```

3. **指针与值的区别**

   - 值传递：函数接收变量的副本，修改不影响原始值
   - 指针传递：函数接收变量地址，修改会影响原始值

4. **nil 指针**
   未初始化的指针值为 nil，对 nil 指针解引用会导致运行时错误

   go

   

   ```go
   var p *int
   if p == nil {
       fmt.Println("指针未初始化")
   }
   ```

   

这些基础语法是 Go 语言的核心，掌握它们可以帮助你构建更复杂的 Go 程序。Go 语言注重简洁性和实用性，这些语法设计都体现了这一特点，例如只有一种循环结构、多返回值特性等，都是为了提高开发效率和代码可读性。

# 2.1



#### 一、Go语言基本语法 ﻿00:00﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684045&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-rZRpsaPURQd2yQVp65Uxb4d1iJM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-c1d288069fd12fc61358f2e5fe9df52d51735e4847afea29cf5c72495d51309f6009af052aca9a76ef8eacf6365fc6d6a8115f0287061dcd305a5e1275657320&expires=8h&r=475276683&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-1&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-1&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=2a0349c66f068e0f468a3c1bb25e22033f576b8ce568a1f7&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 基本结构：Go程序必须包含package main和func main()入口函数
- 打印输出：使用fmt包的Println函数实现控制台输出

##### 1. 变量定义 ﻿01:08﻿

###### 1）使用var关键字 ﻿01:20﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684045&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-qtb13BoBKqhaI0kVolTtrwGXXwQ%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e8ebbf3c31296c5fbe5470192edb92579c27e4e588435be17491cb6f2ef4678e25cbdbda0a074872959428c897e31341f1f50535692f3785305a5e1275657320&expires=8h&r=504975514&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-2&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-2&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=12146e4ffd7df3c94e5e41521d9dd88833e588539077ab07&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 声明格式：var 变量名 类型，如var a int，变量名在前类型在后
- 零值机制：未赋初值的变量会自动初始化为零值（int为0，string为空串）
- 打印技巧：使用fmt.Printf("%d %q\n",a,s)可显示空字符串的引号形式
- 强制使用：定义的变量必须被使用，否则会编译报错

###### 2）变量赋初值 ﻿03:04﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684045&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2FNrZVGcgpvT8yh%2FTQpfbWsuozFU%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-7a63913e90186cc7edcc9b77e6a1b9b0d19e483312ad4695030f39c0b02d6bdd97275bc3c9ee3990004d26bf104ec7cf6c5c1520dece9c4f305a5e1275657320&expires=8h&r=165873881&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-3&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-3&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=12146e4ffd7df3c9949061e60c62bb0033e588539077ab07&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 多变量赋值：可同时定义多个同类型变量var a,b int = 3,4
- 类型混合：不同类型变量需要分开定义，不能写在同一行
- 初始值要求：Go要求变量必须有合理初始值，不同于C的随机值或Java的null

###### 3）类型推断 ﻿05:26﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684045&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-QqicIoTS2RVc4xbUG8Tm4T5ffGE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b9498e8d19ba46f43a1314ecde2b712e9f68b13f1132d6ef087008c9a4340d1c2c602e94655f8baa3e7d32ba4b07afe8b2ade146f1ee297d305a5e1275657320&expires=8h&r=980956172&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-4&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-4&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=cf87eda222dfadb7bf6ab94b2c8c15dd3f576b8ce568a1f7&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 省略类型：可省略类型声明var a,b = 3,4，编译器自动推断
- 混合类型：支持不同类型变量一起定义var a,b,c,s = 3,4,true,"def"
- 设计优势：变量名在前更符合编程时先想到变量名的思维习惯

###### 4）简短声明 ﻿06:42﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684046&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-6pRxswoN9bUskWlxRVfqmx%2BPeak%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4dfc1fe6f6cc564aa7e00fb5a89d1ccb06b5c1ec22baf40216e35c8d808f301dec17e97da31956b567652a0ecdebfcdcb850645351a3c7de305a5e1275657320&expires=8h&r=878502151&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-5&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-5&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=66239664855e8068c32f23017ea016b086ce9e7d89cee162978956776b5d738c&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 冒号等于：首次定义变量可用a,b := 3,4代替var
- 后续赋值：已定义变量只需用等号b=5，不能重复使用冒号
- 推荐用法：函数内部优先使用简短声明使代码更简洁

###### 5）包级变量 ﻿08:10﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684046&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-yMaRF%2FaBbs94aiXWEUj7WrB3kdk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-65f2bd7d45f1cd7d62f0d50b0806febd5c7f50379bf2d64b10b1e5579af6f0f3a7c29bb61ec2660405aab311a2eabd8905bfb1122ba2ce60305a5e1275657320&expires=8h&r=588924513&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-6&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-6&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=1524a5cd531d02e5d5c5445e5877de9e750d2a998dc8a8e8305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 作用域：函数外定义的变量是包内可见，不是真正的全局变量
- 语法限制：包级变量必须用var声明，不能使用:=简短形式
- 安全特性：包级变量比全局变量更安全，便于状态管理

###### 6）集中定义 ﻿09:20﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b8e862ee998574df1b336876c08e6b68-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684046&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-dfRri%2FvZcL2MDLdIMxy8vpe8Dk0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-81c8e16bd2216f22a9baf89daabfc644fa15abd9acc17b175b39dc9f63f0565d21ee4b5594704cda7a1ef0c4c228c10c886f33eaa12e19bf305a5e1275657320&expires=8h&r=145614616&vbdid=-&fin=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-7&fn=p-b8e862ee998574df1b336876c08e6b68-40-2025042100-7&rtype=1&dp-logid=226392100190308496&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=66239664855e8068230408e99c62dfff750d2a998dc8a8e8305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 括号分组：可用var()块集中定义多个包级变量
- 格式规范：每行一个变量定义，保持代码整洁
- 应用场景：适用于需要定义多个相关变量的情况

#### 二、知识小结

| 知识点           | 核心内容                                                   | 考试重点/易混淆点                               | 难度系数 |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------- | -------- |
| 狗语言基本语法   | 介绍狗语言的基本语法规则，包括变量定义、类型推断、作用域等 | 变量名在前，类型在后（与其他语言相反）          | ⭐⭐       |
| Hello World程序  | 演示如何用狗语言编写并运行简单的Hello World程序            | fmt库的使用（Print vs Printf vs Println）       | ⭐        |
| 变量定义与初始化 | 使用var关键字定义变量，支持多变量同时定义                  | var vs :=（冒号等于仅限函数内使用）             | ⭐⭐       |
| 类型推断         | 编译器自动推断变量类型（如var a = 3推断为int）             | 混合类型变量定义（如a, s, b := 3, "abc", true） | ⭐⭐       |
| 变量作用域       | 函数内 vs 包内变量（包内变量非全局，仅限包内访问）         | 包内变量必须用var定义（不可用:=）               | ⭐⭐⭐      |
| Zero Value机制   | 变量未显式初始化时自动赋零值（如int为0，string为空）       | 与C/JAVA的区别（C未初始化值不确定，JAVA为null） | ⭐⭐       |
| 变量使用强制规则 | 定义的变量必须使用，否则编译报错                           | 避免无用变量（项目开发优势 vs 练习时束缚）      | ⭐⭐       |
| 多变量定义优化   | 使用括号()集中定义多个变量（减少重复var关键字）            | 混合类型变量分组定义                            | ⭐        |
| Print格式化技巧  | Printf的%q输出带引号的字符串（空字符串可视化）             | %s vs %q                                        | ⭐        |



# 2.2

#### 一、内建变量类型 ﻿00:05﻿

- ![img](https://bdcm01.baidupcs.com/file/p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684311&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ajaRnfyBcV7ph1i019IDI1wZT9w%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-1b2e95f5139abf5e648ecc899058b8d34e056d4bcce72522b5feb0135b988a3220f72fcef711b1405fa55ba318fb33147061619ee1cc58f0305a5e1275657320&expires=8h&r=223540473&vbdid=-&fin=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-1&fn=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-1&rtype=1&dp-logid=226463463581384782&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=718800a01e5121ca56afef5411c6cb2581588b8447c1a65a305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 基本类型

  ：

  - 布尔型：bool
  - 字符串：string
  - 整数：(u)int、(u)int8、(u)int16、(u)int32、(u)int64
  - 指针：uintptr
  - 字节：byte（8位）
  - 字符：rune（32位）
  - 浮点数：float32、float64
  - 复数：complex64、complex128

- 整数类型特点

  ：

  - 带u前缀表示无符号整数，不带表示有符号整数
  - 长度可指定（如int8）或不指定（随操作系统变化，32位系统为32位，64位系统为64位）
  - 没有long类型，需要长整数直接使用int64

- 指针特点

  ：

  - 比C语言指针更安全易用
  - 长度随操作系统变化

- 字符类型特点

  ：

  - 使用rune而非char，因为char（1字节）在多语言环境下问题多
  - rune长度为32位，可处理UTF-8编码（通常3字节）的字符
  - byte和rune本质上是整数的别名

- 复数类型特点

  ：

  - complex64：实部和虚部各为float32
  - complex128：实部和虚部各为float64
  - Go是少数将复数作为内建类型的通用编程语言

##### 1. 复数回顾 ﻿03:31﻿

- ![img](https://bdcm01.baidupcs.com/file/p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684311&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-eeIOeOwuIeYrUYsYUq%2BN8NQVo10%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-2d65895e9d2abec4847f0971407e2378bfcfb275419313df11db9de7232c6be4185d990322e5d66dcbd6a2a109e57768b7b4f724a5daf2b6305a5e1275657320&expires=8h&r=275312646&vbdid=-&fin=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-2&fn=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-2&rtype=1&dp-logid=226463463581384782&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=738aa28698fb94aa59f51a2fc73b02481512bccedd4b8ba3&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 定义

  ：

  - 虚数单位：

    ﻿i=−1i = \sqrt{-1}i=−1﻿

  - 复数形式：

    ﻿a+bia + bia+bi﻿

    （实部a，虚部bi）

  - 几何表示：在二维平面中，实部对应x轴，虚部对应y轴

- 模的计算

  ：

  - ﻿∣a+bi∣=a2+b2|a + bi| = \sqrt{a^2 + b^2}∣a+bi∣=a2+b2﻿

  - 例如：

    ﻿∣3+4i∣=5|3 + 4i| = 5∣3+4i∣=5﻿

- 虚数单位性质

  ：

  - ﻿i2=−1i^2 = -1i2=−1﻿
  - ﻿i3=−ii^3 = -ii3=−i﻿
  - ﻿i4=1i^4 = 1i4=1﻿
  - 每乘一次i相当于逆时针旋转90度
  - ![img](https://bdcm01.baidupcs.com/file/p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684311&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-noYgEI2a%2BYxPpiCV2aYE3ZfG%2BU0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b57ea108639858595a2fe01d442543dc56dc8a1ec2b9e750c3aefbc205b441fdb8ae1107ca1d265edbe3fc8a63ba143cd9c4d8e39487e356305a5e1275657320&expires=8h&r=597711159&vbdid=-&fin=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-3&fn=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-3&rtype=1&dp-logid=226463463581384782&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=b3434a369726e9249598d5fd59392989ee41d7323011768580d4af97bfb69cf0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 欧拉公式

  ：

  - ﻿eiθ=cos⁡θ+isin⁡θe^{iθ} = \cosθ + i\sinθeiθ=cosθ+isinθ﻿
  - 模为1，表示单位圆上的点
  - 特殊值：
    - ﻿ei0=1e^{i0} = 1ei0=1﻿
    - ﻿eiπ/2=ie^{iπ/2} = ieiπ/2=i﻿
    - ﻿eiπ=−1e^{iπ} = -1eiπ=−1﻿
    - ﻿ei3π/2=−ie^{i3π/2} = -iei3π/2=−i﻿
    - ﻿ei2π=1e^{i2π} = 1ei2π=1﻿
    - ![img](https://bdcm01.baidupcs.com/file/p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684311&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-X3FC683Xe3oeGS8JQ4NCkY4KA6E%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-60b151f67107f2a1a14501719575ba45363813074a1e5c441e8df4caaeb653145e3197e5c34ef03c9aeae254cfcad209dea91af56dfef0f2305a5e1275657320&expires=8h&r=874886464&vbdid=-&fin=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-4&fn=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-4&rtype=1&dp-logid=226463463581384782&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=66239664855e8068f193165a1eaeeb4381588b8447c1a65a305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 欧拉恒等式

  ：

  - ﻿eiπ+1=0e^{iπ} + 1 = 0eiπ+1=0﻿
  - 结合了数学中最重要的5个常数：e、i、π、1、0

###### 1）例题:欧拉公式验证 ﻿08:33﻿

- ![img](https://bdcm01.baidupcs.com/file/p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684312&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-JGRliLnQWpfPYslF%2FQVg2POWFR4%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-19261b6b26042b02eb39128439b9892b58dbac9d4197145f8a7c9928648cdbce7c0e9840f65fd36183c415c33c5e06c2d22ab8c9a0f0ee3e305a5e1275657320&expires=8h&r=679797122&vbdid=-&fin=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-5&fn=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-5&rtype=1&dp-logid=226463463581384782&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=e83ff6a1394898305c92c18ca9f96aba2249514f62af1ff3&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 实现要点

  ：

  - Go中复数表示：3+4i（注意i必须紧接数字）

  - 取模函数：cmplx.Abs()

  - 指数函数：cmplx.Exp()或cmplx.Pow(math.E, ...)

  - 由于浮点数精度限制，结果可能不是精确的0，而是接近0的值（如

    ﻿1.22×10−16i1.22×10^{-16}i1.22×10−16i﻿

    ）

  - 使用Printf("%.3f\n", ...)格式化输出可显示为0

- 浮点数精度说明

  ：

  - complex64：实部和虚部各为float32
  - complex128：实部和虚部各为float64
  - 所有语言的浮点数计算都存在精度问题

###### 2）例题:强制类型转换 ﻿14:13﻿

- ![img](https://bdcm01.baidupcs.com/file/p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684312&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-OdKr9DmJ8b3cZpbOQIIov8hJ8K4%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-1d17e12e47a4038cd35b2dbcf698673b9f5a1cb13f5043bd07db883d8dfbf522cab923a99d5a7fdb8c0c84fde2a589aad091ac84de50facd305a5e1275657320&expires=8h&r=789770975&vbdid=-&fin=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-6&fn=p-a10410abbebeccd5e7d6932a79eccb52-40-2025042100-6&rtype=1&dp-logid=226463463581384782&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=5eee304bbb22b9c2b94d4c3788c069c5ee41d7323011768560f1fd2882e1895f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 关键特性

  ：

  - Go只有强制类型转换，没有隐式类型转换
  - 语法：类型(表达式)，如float64(3)

- 示例问题

  ：

  - 计算直角三角形斜边（3,4,5）
  - 错误写法：math.Sqrt(a*a + b*b)（参数需为float64）
  - 正确写法：int(math.Sqrt(float64(a*a + b*b)))

- 注意事项

  ：

  - 浮点数转整数可能因精度损失导致错误（如4.999转成4）
  - 大型系统中显式类型转换更安全，可避免隐式转换带来的问题

#### 二、知识小结

| 知识点         | 核心内容                                                     | 考试重点/易混淆点                                            | 难度系数 |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| Go语言变量类型 | 布尔型、整数类型(有符号/无符号)、浮点数类型(float32/float64)、复数类型(complex64/complex128)、字节型(byte)、字符型(rune) | 无符号整数(u前缀)与有符号整数的区别rune与byte的存储差异(32位vs8位) | ⭐⭐       |
| 整数类型细分   | int8/int16/int32/int64等固定长度类型uintptr指针类型(长度随系统变化) | 操作系统位数对默认int长度的影响(32/64位系统)指针类型与C语言指针的差异 | ⭐⭐⭐      |
| 特殊字符类型   | rune作为Unicode字符类型(替代char)采用32位存储解决多语言编码问题 | UTF-8编码中三字节字符的处理与整数的隐式类型转换关系          | ⭐⭐       |
| 复数类型       | complex64(实部虚部各32位)complex128(实部虚部各64位)          | 复数的数学表示(实部+虚部i)模的计算公式(勾股定理)             | ⭐⭐⭐⭐     |
| 类型转换机制   | 仅支持显式强制类型转换禁止隐式类型转换                       | 浮点数转整数的精度丢失风险sqrt函数必须显式转换参数类型       | ⭐⭐⭐      |
| 欧拉公式验证   | 通过complex.Exp()函数验证e^(iπ)+1=0浮点数精度导致微小误差    | 复数运算的实际精度限制与Python复数实现的对比(j代替i)         | ⭐⭐⭐⭐     |





# 2.3

#### 一、常量 ﻿00:02﻿

##### 1. 常量的定义 ﻿00:15﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0dd78b6a07386a68e77757be083d9807-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684795&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-XVYdNDhgUFF7h9fs7JWtaikfFDE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-63e67dc146d3f0721a466c51725045edad51dfa3e8afc3ad3ab4b665e33a63ae0ba1e3617d741dcb4e88d833ab5fe998721cb3ac04929087305a5e1275657320&expires=8h&r=348189951&vbdid=-&fin=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-1&fn=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-1&rtype=1&dp-logid=226593284989309342&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=6a9088c7620f7a1736564e37f877fcb0c1a0855ce2d51dc3&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 基本语法：使用const关键字定义，格式为const 名称 = 值或const 名称 类型 = 值

- 多常量定义：可以同时定义多个常量，如const a, b = 3, 4

- 类型特性

  ：

  - 可以不指定类型，此时常量可作为多种类型使用（如int或float）
  - 指定类型后必须按该类型使用，如const a int = 3必须作为int使用

- 编译特性：常量在编译时会被直接替换，类似于文本替换

- ![img](https://bdcm01.baidupcs.com/file/p-0dd78b6a07386a68e77757be083d9807-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684795&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-TB6PvipSdfrQByDKU%2FdcDxs8VhM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-434131e1716e0a1c8583f0859c98d6b875fd5af64ee39142df51e98ef9da32b5aee573fb0e0885057d74c704f1843c3a396f3802bab71f63305a5e1275657320&expires=8h&r=159307262&vbdid=-&fin=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-2&fn=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-2&rtype=1&dp-logid=226593284989309342&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=0cce998314b34a67ed56b6d4c779d6bff114d8ff75658a9b&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 示例1：const filename = "abc.txt"

- 示例2：const a, b = 3, 4（未指定类型）

- 计算示例：c = int(math.Sqrt(a*a + b*b))中a,b可自动作为float使用

- 命名规范：与变量命名规则相同，不需要全部大写（与某些语言不同）

##### 2. 使用常量定义枚举类型 ﻿03:09﻿

###### 1）普通枚举类型 ﻿03:15﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0dd78b6a07386a68e77757be083d9807-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684795&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-UdwohYJXZpHWMRNQ%2BsiAFoimZfI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-ca41de5cd7822811153e9ee063dddaf7471a7131557716a95c0d860b4a4d991609b26d687cfc496bcc7c54cc179b6c0609e10af3dc64d9b2305a5e1275657320&expires=8h&r=140992832&vbdid=-&fin=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-3&fn=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-3&rtype=1&dp-logid=226593284989309342&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=e83ff6a1394898305c92c18ca9f96abac1a0855ce2d51dc3&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 定义方式：使用const块定义一组相关常量
- 示例：
- 特点：需要为每个常量显式赋值

###### 2）自增值枚举类型 ﻿04:16﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0dd78b6a07386a68e77757be083d9807-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753684795&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-nyvirbw5Yj%2FavScQDh%2FS645xk40%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-6f4641613e3ed6aec818604604d08d033d8f8ec626e4f6222fa7fde9b915e20c9788f17bcef6b8fa05dcc207ce0881254fa4e1aa4f8bb5ef305a5e1275657320&expires=8h&r=314028090&vbdid=-&fin=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-4&fn=p-0dd78b6a07386a68e77757be083d9807-40-2025042100-4&rtype=1&dp-logid=226593284989309342&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=5eee304bbb22b9c27a377af76334b882f34784f219ce531d305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- iota关键字：表示自增值种子，从0开始
- 基本用法：
- 跳值特性：如果中间有常量被省略，iota仍会自增
- 表达式用法：可以与运算符结合使用，如位运算
- 应用场景：适合定义有规律递增的常量组，如存储单位换算

#### 二、知识小结

| 知识点       | 核心内容                                                     | 考试重点/易混淆点                                      | 难度系数 |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------ | -------- |
| 常量定义     | 使用const关键字定义常量，支持单值和多值定义（如const a,b = 3,4），类型可显式声明或自动推断 | 常量在编译时进行文本替换，未声明类型的常量可跨类型使用 | ⭐⭐       |
| 常量分组     | 可用括号将相关常量分组定义，节省代码量（如const ( filename="abc.txt" c=5 )） | 分组常量共享相同作用域规则                             | ⭐        |
| 命名规范     | 常量命名不强制全大写，遵循普通变量命名规则（首字母大小写决定可见性） | 与其他语言全大写惯例的显著差异                         | ⭐⭐       |
| 枚举实现     | 通过const块模拟枚举，配合iota实现自增（如const ( Cpp=iota Python Go )） | iota重置规则（每遇到新const重置为0）和跳值技巧         | ⭐⭐⭐      |
| 高级iota用法 | iota可参与位运算（如1<<(10*iota)）生成KB/MB/GB等存储单位常量 | 表达式复用机制和位运算逻辑                             | ⭐⭐⭐⭐     |
| 类型系统特点 | 变量名在前、类型在后；无char类型；原生支持复数类型；rune为32位字符类型 | 类型声明位置与其他语言的对比                           | ⭐⭐       |



# 2.4

#### 一、条件语句 ﻿00:00﻿

##### 1. if语句 ﻿00:05﻿

- ![img](https://bdcm01.baidupcs.com/file/p-2f929af04aa65246f317f79d5011bb44-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685027&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-A3vYyiVU8E9g1tY1no9d3yfNM1s%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-1d8fc9edccffb7c4b5d60beacfeae95001ce1beb9aa143b58c80808ecc27354809444c1865616adfd668ee7dcdb92fd494f950c1b03515b5305a5e1275657320&expires=8h&r=563645455&vbdid=-&fin=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-1&fn=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-1&rtype=1&dp-logid=226655750305278417&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=3612dd02eb4608abe9222b7daae28615ac9b565cf010848f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 语法结构：Go语言的if语句不需要括号，基本形式为：
- 边界检查示例：演示了如何将输入值v限制在0到100之间，大于100返回100，小于0返回0，否则返回原值。

###### 1）if语句操作示例 ﻿00:29﻿

- ![img](https://bdcm01.baidupcs.com/file/p-2f929af04aa65246f317f79d5011bb44-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685027&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-v09SBZuQhrtqwq6amU%2BscE7S6c0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-37181638497c1cc9c5c918f3ef8874c298550354818d0a5f3863e755a72b2c409568fb60d39e6f9c92429130b81e95ef82ee215915cc361b305a5e1275657320&expires=8h&r=521369080&vbdid=-&fin=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-2&fn=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-2&rtype=1&dp-logid=226655750305278417&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=718800a01e5121ca56afef5411c6cb25d1772a2f8419f418305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 多返回值处理：Go函数可以返回多个值，如ioutil.ReadFile()返回文件内容([]byte)和错误信息(error)。
- 错误处理模式：典型模式是先检查错误是否为nil，不为nil则处理错误，否则处理正常结果。
- 作用域限制：在if条件中定义的变量（如contents和err）作用域仅限于该if语句块内。

###### 2）if语句的简化形式 ﻿02:55﻿

- ![img](https://bdcm01.baidupcs.com/file/p-2f929af04aa65246f317f79d5011bb44-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685027&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ER23ASVxo5Bbdv%2B5xyaKilr5bzw%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b6b36cf3322754d96657943cbf75494d9ee16e8059a8604dab66041db65249246cd336e2e2e7762fdc021c2864430f5d31a8fe4711655e52305a5e1275657320&expires=8h&r=310658401&vbdid=-&fin=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-3&fn=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-3&rtype=1&dp-logid=226655750305278417&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=3612dd02eb4608ab9699deb7b7a92d9aac9b565cf010848f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 条件赋值：可以在if条件前执行赋值语句，用分号分隔，如：
- 执行顺序：先执行赋值语句，再判断条件，这种写法更简洁且作用域清晰。

##### 2. switch语句 ﻿04:38﻿

###### 1）例题:switch运算 ﻿04:39﻿

- ![img](https://bdcm01.baidupcs.com/file/p-2f929af04aa65246f317f79d5011bb44-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685028&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-kOfZ%2Bo5zpPL%2BmtadZvvgi9d7n34%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-a039004ae330dd2d669e15953fe9c2eb59400ae6a5458948566a58d554dded12a5d0b4da9bcb266dc56a4a09a3a1f2257f8a93e912d65662305a5e1275657320&expires=8h&r=940253929&vbdid=-&fin=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-4&fn=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-4&rtype=1&dp-logid=226655750305278417&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=718800a01e5121caae339351eea0af8e4a2fead431085167&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 自动break特性：Go的switch每个case默认break，不需要显式写break语句。
- panic使用：遇到不支持的操作符时，用panic()报错并终止程序执行。
- 语法特点：case后面直接跟值比较，不需要像C语言那样每个case后加break。

###### 2）例题:分数判断 ﻿05:45﻿

- ![img](https://bdcm01.baidupcs.com/file/p-2f929af04aa65246f317f79d5011bb44-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685028&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-GseJDSNpR4Ds4ec5LA%2FahawPiW4%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-25075cd6755501798381ef98459fd91a8d150e5ab69915e84473cabef1100960d38c1e99487ddacf69ed64b61b5318854cb83e8f4087c283305a5e1275657320&expires=8h&r=756273261&vbdid=-&fin=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-5&fn=p-2f929af04aa65246f317f79d5011bb44-40-2025042100-5&rtype=1&dp-logid=226655750305278417&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=12146e4ffd7df3c94e5e41521d9dd888575225020243601e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 无表达式switch：可以省略switch后的表达式，直接在case中写条件判断：

- 边界处理：通过panic(fmt.Sprintf())处理非法分数（如负数或超过100分）。

- 评级规则

  ：

  - 小于60分：F
  - 60-79分：C
  - 80-89分：B
  - 90-100分：A

###### 3）switch后表达式作用 ﻿09:24﻿

- 灵活性：switch后可以没有表达式，此时case条件可以是任意布尔表达式。
- 与if对比：这种形式比多个if-else更清晰，特别适合多条件分支场景。

#### 二、知识小结

| 知识点         | 核心内容                                                     | 考试重点/易混淆点                    | 难度系数 |
| -------------- | ------------------------------------------------------------ | ------------------------------------ | -------- |
| 条件语句(if)   | - 语法特点：条件不需要括号- 支持多返回值处理- 变量作用域限定在if块内 | - 变量作用域规则- 多返回值处理方式   | ⭐⭐       |
| if语句特殊写法 | - 支持在条件中赋值：if x := f(); x > 0 {...}- 赋值变量的生命周期仅限于if块 | - 复合条件写法- 与常规语言语法差异   | ⭐⭐⭐      |
| switch语句     | - 默认自动break- 需要连续执行时使用fallthrough- 支持无表达式形式 | - 无break设计- fallthrough关键字用法 | ⭐⭐       |
| 文件读取操作   | - ioutil.ReadFile返回(内容,错误)- 错误处理模式：if err != nil | - 多返回值处理- 错误检查范式         | ⭐⭐⭐      |
| panic机制      | - 异常终止程序执行- 用于处理不可恢复错误                     | - 与try-catch机制区别- 使用场景判断  | ⭐⭐⭐⭐     |
| 类型转换       | - byte数组转字符串显示- fmt.Printf格式化输出                 | - %s格式化符用法- 二进制数据展示     | ⭐⭐       |



# 2.5

#### 一、循环 ﻿00:01﻿

##### 1. 示例分析 ﻿00:27﻿

###### 1）例题:循环计算

- ![img](https://bdcm01.baidupcs.com/file/p-d63546307d35ef175354b06fe3814451-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685304&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-GEX0inrPmIfbqLvoTzP0%2BxCaDA0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-3fe2678e4a271d8bd0db9bdd21fc626f04d40a74ab62799f08f9459cd5ec1ca3a96411bbfd5a68ae09e3c35943356cd9c30bdeb212dc69dc305a5e1275657320&expires=8h&r=639455019&vbdid=-&fin=p-d63546307d35ef175354b06fe3814451-40-2025042100-1&fn=p-d63546307d35ef175354b06fe3814451-40-2025042100-1&rtype=1&dp-logid=226730136438952068&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=718800a01e5121ca44342240fa99746f271bdfb9907309d5305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 语法特点：Go语言的for循环条件不需要括号，直接写条件表达式即可
- 省略规则：可以省略初始条件、结束条件和递增表达式三个部分中的任意部分
- 经典示例：计算1到100的和，结果为5050

###### 2）例题:循环转二进制 ﻿00:38﻿

- ![img](https://bdcm01.baidupcs.com/file/p-d63546307d35ef175354b06fe3814451-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685305&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-yL0yXHFEfzPoTk7Oe3Ki5ERWLcI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b04aa1967d9b0b66dc936ab549bb8dc34cadda2805665614dfce25a055d03390ca82d12c2667c94a8e27dcc84aa214b1176a75287510b7ee305a5e1275657320&expires=8h&r=620191395&vbdid=-&fin=p-d63546307d35ef175354b06fe3814451-40-2025042100-2&fn=p-d63546307d35ef175354b06fe3814451-40-2025042100-2&rtype=1&dp-logid=226730136438952068&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=718800a01e5121caae339351eea0af8ea8a57be005a34548&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 算法原理：通过不断对2取模和除以2来获取二进制各位数字
- 实现步骤：

1. 1. 1. 对2取模得到最低位数字
      2. 将数字除以2
      3. 重复上述步骤直到数字为0
      4. 将得到的各位数字倒序排列

- 特殊处理：需要对0进行特殊处理，否则会返回空字符串
- 代码技巧：使用strconv.Itoa()将数字转换为字符串进行拼接

###### 3）例题:循环条件省略 ﻿04:55﻿

- ![img](https://bdcm01.baidupcs.com/file/p-d63546307d35ef175354b06fe3814451-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685305&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-DSdQhlgk7d4%2BlhTH7BeU4eqnHvo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-1ba9ebb72dfe0420abd8386376520b70afaf5e33753f29f66a47ae6fb4cc27562fba447a5b6fb5c416931d26c2e2bfecb8f9dff2a677239f305a5e1275657320&expires=8h&r=706280239&vbdid=-&fin=p-d63546307d35ef175354b06fe3814451-40-2025042100-3&fn=p-d63546307d35ef175354b06fe3814451-40-2025042100-3&rtype=1&dp-logid=226730136438952068&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=12146e4ffd7df3c9949061e60c62bb00319d9cbc2911d561&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 条件省略：可以只保留循环条件，相当于其他语言的while循环

- 文件读取

  ：

  - 使用os.Open打开文件
  - 使用bufio.NewScanner创建扫描器
  - 通过scanner.Scan()循环读取每一行

- 错误处理：使用panic处理文件打开错误

###### 4）例题:循环死循环 ﻿07:04﻿

- ![img](https://bdcm01.baidupcs.com/file/p-d63546307d35ef175354b06fe3814451-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685305&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-Uc2Xakjkm0ynvmdZ%2F433%2B85XzgQ%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-65f33064744e790aa193b317b11c05b0b39b8d470a7690b3189e1fb0ab3b23bd3a326ebfc6350e72604575ea5eff18e9d63d08c4bd13ad72305a5e1275657320&expires=8h&r=393417543&vbdid=-&fin=p-d63546307d35ef175354b06fe3814451-40-2025042100-4&fn=p-d63546307d35ef175354b06fe3814451-40-2025042100-4&rtype=1&dp-logid=226730136438952068&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=cf87eda222dfadb7bf6ab94b2c8c15ddcc5ef57b93965c54&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 实现方式：完全省略所有条件，只写for{}即可实现死循环
- 应用场景：在Go的并发编程中goroutine经常使用死循环
- 中断方法：可以通过信号(SIGINT)中断死循环程序
- 设计理念：Go语言简化了死循环的写法，因为并发编程中经常需要使用

#### 二、知识小结

| 知识点           | 核心内容                                    | 考试重点/易混淆点                            | 难度系数 |
| ---------------- | ------------------------------------------- | -------------------------------------------- | -------- |
| 循环结构         | 演示1到100累加和计算(5050)                  | 循环条件不需要括号、可省略初始/结束/递增条件 | ⭐⭐       |
| 整数转二进制算法 | 通过连续除2取余法实现(以13为例演示)         | 余数顺序需要反转、零值特殊处理               | ⭐⭐⭐      |
| 文件读取操作     | 使用os.Open和scanner实现行读取              | 错误处理(panic)、换行语法敏感                | ⭐⭐       |
| 死循环写法       | 空for循环实现无限循环                       | 与并发编程goroutine的关联                    | ⭐        |
| 语法特性总结     | if/for无括号、switch免break、case多条件支持 | while被for替代、变量定义位置灵活             | ⭐        |





# 2.6

#### 一、函数 ﻿00:01﻿

##### 1. 函数定义示例 ﻿00:24﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685672&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-x%2Bswbdy8FvmfysB4X5XFqu1jmgY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-c9f7b549f830961056992d8d5ec3655d2a05d1db26c89a1ce1f8efaa8e9fd56c0d5b7da55f41ec6d6108e1c9acc6c151ea37b008576a66df305a5e1275657320&expires=8h&r=251199394&vbdid=-&fin=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-1&fn=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-1&rtype=1&dp-logid=226828896253803432&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=eae2efe893f98aaca3b9ff4a91798660302a7504ed431cbe&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 定义格式: 函数名在前，类型在后，参数名在前，类型在后。同类型参数可用逗号分隔，如 func eval(a, b int, op string) int
- 参数处理: 使用switch-case处理不同操作符，default分支用panic报错并包含错误操作符信息
- 示例实现:

```
func eval(a, b int, op string) int {
    switch op {
    case "+": return a + b
    case "-": return a - b  
    case "*": return a * b
    case "/": return a / b
    default: panic("unsupported operation: " + op)
    }
}
```

##### 2. 返回多个值 ﻿01:44﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685673&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-lspjgm5kPh1jr6Rq8MeqhSL1Hag%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-3c532874f457a23addbaac0130b61b222972a2879ff49174c36536f60b1cd546fe8fed405e1fc240e603e2c0f47ea38b32d24adacc3219c6305a5e1275657320&expires=8h&r=789991073&vbdid=-&fin=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-2&fn=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-2&rtype=1&dp-logid=226828896253803432&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=0cce998314b34a67ed56b6d4c779d6bf961dc3bab2a214e5&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 基本语法: 返回值类型用括号括起，如 func div(a, b int) (int, int)
- 命名返回值: 可为返回值命名，如 (q, r int)，但仅适用于简单函数
- 实现示例:

```
// 带余除法返回商和余数
func div(a, b int) (q, r int) {
    q = a / b
    r = a % b
    return  // 等价于 return q, r
}
```

- 注意事项: 命名返回值会使长函数难以理解，建议仅在简单函数中使用

##### 3. 应用案例 ﻿06:16﻿

###### 1）例题:返回错误示例

- ![img](https://bdcm01.baidupcs.com/file/p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685673&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-hJsPYGq51dFDRD9fVurRG7EC8fE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-0d3843ec85c5807606d10b63fb03daf2a7161dde2dabe458e6b0bc5398597679a5aeb7ca43016c3e31f7989aba857c3358b22cfcd3dc9161305a5e1275657320&expires=8h&r=709907058&vbdid=-&fin=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-3&fn=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-3&rtype=1&dp-logid=226828896253803432&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=e83ff6a1394898305c92c18ca9f96aba858cf8f5c693bf8a&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 问题分析: panic会中断程序执行，输出不友好
- 改进方案: 使用多返回值返回错误信息
- 实现代码:

```
func eval(a, b int, op string) (int, error) {
    switch op {
    case "+": return a + b, nil
    case "-": return a - b, nil
    case "*": return a * b, nil 
    case "/": 
        q, _ := div(a, b)
        return q, nil
    default: 
        return 0, fmt.Errorf("unsupported operation: %s", op)
    }
}
```

###### 2）例题:返回值error示例 ﻿07:00﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685673&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-lhwCCv8Wp8%2FWx3MH%2B%2B6A%2FIvsTnQ%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-f1af45bcfefa6693fc6c54a69e66de3c1c157aa97f49e0da92752300ddf2d04c2e642b982f4865ecd958efd629a003131ba84b498ebc7b8b305a5e1275657320&expires=8h&r=562171509&vbdid=-&fin=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-4&fn=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-4&rtype=1&dp-logid=226828896253803432&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=e83ff6a1394898307b01f8311a6d0192858cf8f5c693bf8a&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 调用方式: 使用if判断错误

```
if result, err := eval(3, 4, "x"); err != nil {
    fmt.Println("Error:", err)
} else {
    fmt.Println(result)
}
```

##### 4. 返回多个值的常见用法 ﻿09:50﻿

- 典型模式: 返回结果+error组合
- 标准库示例: 如os.Open返回(*File, error)
- 使用建议: 不要滥用多返回值，主要用于错误处理场景

###### 1）例题:函数式编程法 ﻿10:06﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685673&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-rpAxtAcIOz6AouFnJZtiD%2BjWiw4%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-c20a18836e697d831b5aaf361c60787a7887bb0e4054dd8f8ad445bc6f9fe41e7b81c109544ffd3fc88a4ae36d55722ba1d1ee809b13f723305a5e1275657320&expires=8h&r=674580485&vbdid=-&fin=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-5&fn=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-5&rtype=1&dp-logid=226828896253803432&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=7717645f262844cad63a337261ba09ef858cf8f5c693bf8a&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 高阶函数: 函数可作为参数传递

```
func apply(op func(int, int) int, a, b int) int {
    p := reflect.ValueOf(op).Pointer()
    opName := runtime.FuncForPC(p).Name()
    fmt.Printf("Calling function %s with args (%d, %d)\n", opName, a, b)
    return op(a, b)
}
```

- 匿名函数: 可定义临时函数

```
fmt.Println(apply(
    func(a int, b int) int {
        return int(math.Pow(float64(a), float64(b)))
    }, 3, 4))  // 输出81
```

##### 5. 获取函数名称 ﻿12:01﻿

- 实现方法: 使用reflect和runtime包

```
p := reflect.ValueOf(op).Pointer()
opName := runtime.FuncForPC(p).Name()
```

##### 6. 可变参数列表 ﻿16:07﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753685673&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2BQ35UbAI2SSJfDaijrEZ3q4BBYM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-afc2d2410276d568c44fb32a324100c0ab59014d758abf005538b5e733efc6731d037ab645c5753fe98127b07817b49f4e73b6f0c82a307c305a5e1275657320&expires=8h&r=306427073&vbdid=-&fin=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-6&fn=p-0b9fb40aa18c086c5338f555abf00ba3-40-2025042100-6&rtype=1&dp-logid=226828896253803432&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=718800a01e5121ca44342240fa99746f16b049d3c3ba68d2305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 语法: 使用...表示可变参数

```
func sum(numbers ...int) int {
    s := 0
    for i := range numbers {
        s += numbers[i]
    }
    return s
}
```

- 调用方式: 可传入任意数量参数

```
fmt.Println(sum(1, 2, 3, 4, 5))  // 输出15
```

##### 7. 函数语法要点回顾 ﻿17:21﻿

- 返回值位置: 类型写在最后
- 多返回值: 支持但不要滥用
- 函数参数: 函数可作为参数
- 特性限制: 无默认参数、函数重载等复杂特性
- 可变参数: 唯一支持的参数灵活性特性

#### 二、知识小结

| 知识点         | 核心内容                                      | 考试重点/易混淆点                                     | 难度系数 |
| -------------- | --------------------------------------------- | ----------------------------------------------------- | -------- |
| 狗语言函数定义 | 函数名在前，返回类型在后；参数同样名前类型后  | 同类型参数用逗号分隔的语法特性                        | ⭐⭐       |
| 多返回值机制   | 支持返回多个值，可命名返回值(如商q/余数r)     | 命名返回值仅起提示作用，调用时可任意命名接收          | ⭐⭐⭐      |
| 错误处理范式   | 常用多返回值返回(error类型)，调用方需显式检查 | 下划线忽略不需要的返回值 vs panic中断的对比           | ⭐⭐⭐⭐     |
| 函数式编程特性 | 函数作为一等公民，支持高阶函数和匿名函数      | 反射获取函数名(reflect.ValueOf().Pointer())的复杂用法 | ⭐⭐⭐⭐     |
| 可变参数列表   | 使用...int语法定义，函数内按数组处理          | 与固定参数的混合使用规则                              | ⭐⭐       |
| 类型严格性     | 未使用变量编译报错，必须显式用下划线忽略      | 多返回值必须完整接收或显式忽略                        | ⭐⭐⭐      |
| 设计哲学       | 无默认参数/函数重载/操作符重载等复杂特性      | 通过不同函数名实现类似重载功能                        | ⭐        |



# 2.7

#### 一、指针 ﻿00:04﻿

- Go指针特点：比C语言简单，不支持指针运算（如不能做加法操作）

- 语法对比

  ：

  - C语言：int*表示指针
  - Go语言：*int表示指针

- 示例操作

  ：

  - var a int = 2
  - var pa *int = &a（获取a的地址）
  - *pa = 3（通过指针修改a的值）

##### 1. 例题：指针函数定义 ﻿00:19﻿

- ![img](https://bdcm01.baidupcs.com/file/p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753686207&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-lApmxhFqwSJ21GbZUPLwJcIYKoo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-277fe4481b9a4f34ba669ac57a540213ded53cbbc9d4b9d3250a98f26c958db45b604f5c7fb62309c7337a53815859b3f63e7b56c3a59e04305a5e1275657320&expires=8h&r=964789060&vbdid=-&fin=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-1&fn=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-1&rtype=1&dp-logid=226972516251693474&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=4126a8bea2f5ff03d442d91ff8c6edeff3e71b4e8040557a&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 典型操作

  ：

  - 定义指针变量：var pa *int = &a
  - 通过指针修改变量值：*pa = 3
  - 输出结果验证：fmt.Println(a)将输出3

##### 2. 参数传递 ﻿01:11﻿

###### 1）值传递 ﻿01:38﻿

- 定义：函数调用时创建参数的完整副本

- 特点

  ：

  - 函数内修改不影响原始变量
  - 示例：pass_by_val(a)调用后a仍为3
  - 内存开销：需要复制整个参数值

- 实现方式

  ：

  - Go语言默认采用值传递
  - C++中显式声明：void func(int a)

###### 2）引用传递 ﻿03:25﻿

- ![img](https://bdcm01.baidupcs.com/file/p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753686207&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-HUzyNnNIDiBa8WBtk9PyXM0NK74%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-ed4aa750782b61bb04f57188897a5db8cae4c457a96875ac0f21a7b5e394f819828eb47ad28a6c26b5d02ac3cb5687cec083e5d4fc176813305a5e1275657320&expires=8h&r=816276071&vbdid=-&fin=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-2&fn=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-2&rtype=1&dp-logid=226972516251693474&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=eae2efe893f98aaca3b9ff4a91798660f3e71b4e8040557a&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 定义：传递变量的引用（内存地址）

- 特点

  ：

  - 函数内修改会影响原始变量
  - 示例：pass_by_ref(a)调用后a变为4
  - 无内存复制开销

- 实现方式

  ：

  - C++语法：void func(int &a)
  - Java/Python：对象类型默认引用传递

- 注意事项：可能产生副作用（side effect）

###### 3）Go语言使用值传递 ﻿04:10﻿

- ![img](https://bdcm01.baidupcs.com/file/p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753686208&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-o4YNH2ISy8GmTc%2BWogls5KhU5YM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e6cd66e63904d4a8750334bba4a841b9553f7432b547e7f58154b602d32585f340b163a7fe7d2210d288a32a9d9c99838665b540ea6b3881305a5e1275657320&expires=8h&r=198364491&vbdid=-&fin=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-3&fn=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-3&rtype=1&dp-logid=226972516251693474&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=5eee304bbb22b9c27a377af76334b882824f68b876faa256305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 核心原则：只有值传递一种方式

- 性能考虑：通过指针实现类似引用传递的效果

- 设计优势：避免意外的副作用，保证函数纯洁性

- 值传递和指针示例 

  05:05

  - 基本值传递：
  - 指针传递：
  - 对象传递：

- 应用案例 

  09:05

  - 例题：交换变量值

    - ![img](https://bdcm01.baidupcs.com/file/p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1753686208&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-qKhJuAPuF8F4nNz9YXPQudst8Pk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-047627de0963efaeb175eb4267f6421ecdeae7729f78143547af35cb08ee2068f9a62585374089499f240a0bb7c234fb9bbd82121064ed72305a5e1275657320&expires=8h&r=339334740&vbdid=-&fin=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-4&fn=p-4fd5bc77acf3604b3f53ec034f297fc0-40-2025042100-4&rtype=1&dp-logid=226972516251693474&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=520706183&ti=7717645f262844ca5d56a4409b209f55da882bc313ca43cf&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

    - 错误实现：

    - 指针方案：

    - 返回值方案（推荐）：

    - 设计原则

      ：

      - 优先使用返回值方案（更安全）
      - 指针方案需要显式取地址操作
      - 返回值方案符合不可变编程思想

#### 二、知识小结

| 知识点       | 核心内容                                                     | 考试重点/易混淆点                                 | 难度系数 |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------- | -------- |
| 指针概念     | Go语言指针比C语言简单，不支持运算（如指针加减），仅用于引用传递模拟 | 指针声明语法：*int（Go）vs int*（C）              | ⭐⭐       |
| 参数传递机制 | Go语言仅支持值传递，但可通过指针实现引用传递效果             | 值传递（拷贝）vs 引用传递（共享内存）的副作用差异 | ⭐⭐⭐      |
| 值传递示例   | 函数内修改参数不影响原始变量（如passByValue函数）            | C++中&符号实现引用传递，Go需手动取地址&a          | ⭐⭐       |
| 指针传递示例 | 通过*pa=3修改指针指向的值，影响原始变量                      | 易错点：未取地址导致编译错误（如swap函数需&a）    | ⭐⭐⭐      |
| 对象传递优化 | 结构体含指针字段时，值传递仅拷贝指针（如cache对象共享pdata） | 需区分值类型与指针类型的设计意图                  | ⭐⭐⭐⭐     |
| 变量交换实现 | 无效的swap(a,b)（值传递）vs 有效的swap(*a,*b)（指针传递）    | 推荐方案：返回多值（如a,b = b,a）避免指针操作     | ⭐⭐⭐      |