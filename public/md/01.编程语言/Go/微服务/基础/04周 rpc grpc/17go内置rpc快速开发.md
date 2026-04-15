- 在分布式系统中，不同服务或进程之间的通信是核心需求，**RPC（Remote Procedure Call，远程过程调用）** 是解决这一问题的重要技术：它允许程序像调用本地函数一样调用远程服务器上的函数，屏蔽了网络通信的细节（如 socket 连接、数据序列化 / 反序列化等）。

  Go 语言通过标准库 `net/rpc` 提供了原生 RPC 支持，同时生态中还有 gRPC 等更强大的框架。下面从 **Go 标准库 RPC** 入手，深入讲解其原理、使用方式及特性。

  ### 一、Go 标准库 RPC 的核心原理

  Go 标准库 `net/rpc` 的设计遵循 “简洁性” 原则，核心目标是让开发者用最少的代码实现远程调用。其底层工作流程可概括为：

  1. **服务注册**：服务端将一个对象（结构体）注册为 RPC 服务，该对象的方法将作为可被远程调用的函数。
  2. **协议约定**：远程方法需满足特定签名（参数、返回值格式），确保客户端能正确调用。
  3. **数据传输**：基于网络协议（TCP 或 HTTP）传输数据，默认使用 Go 内置的 `encoding/gob` 进行序列化（高效但仅支持 Go 语言）。
  4. **客户端调用**：客户端通过代理对象（Client）发起调用，底层自动完成网络通信和数据解析。

  ### 二、Go 标准库 RPC 的关键特性

  1. **方法签名约束**
     并非所有函数都能作为 RPC 方法，必须满足以下条件（否则注册失败）：

     - 方法必须是**导出的**（首字母大写，如 `Add` 而非 `add`）。
     - 方法必须有**两个参数**（第一个为输入参数，第二个为输出参数，且必须是指针类型）。
     - 方法必须返回一个 `error` 类型。

     示例：

     go

     ```go
     // 合法的 RPC 方法：输入 a, 输出 result（指针），返回 error
     func (s *MathService) Add(a int, result *int) error {
         *result = a + 10 // 示例逻辑：加 10
         return nil
     }
     ```

  2. **传输协议**
     支持两种底层传输方式：

     - **TCP**：直接基于 TCP 协议传输，效率更高（推荐用于内部服务通信）。
     - **HTTP**：基于 HTTP 协议传输，可利用 HTTP 生态（如反向代理），但性能略低。

  3. **序列化方式**
     默认使用 `encoding/gob`（Go 专属序列化格式），优势是：

     - 支持 Go 语言的所有数据类型（包括结构体、切片、接口等）。
     - 序列化效率高，体积小。
       缺点是**不支持跨语言**（其他语言无法解析 gob 格式）。若需跨语言，可使用 `net/rpc/jsonrpc` 包（基于 JSON 序列化）。

  ### 三、Go 标准库 RPC 实战：实现一个简单的远程计算服务

  下面通过 “远程加法服务” 示例，演示服务端和客户端的实现流程。

  #### 1. 服务端实现（TCP 协议）

  服务端需完成：定义服务结构体 → 实现 RPC 方法 → 注册服务 → 启动监听。

  go

  ```go
  package main
  
  import (
  	"net"
  	"net/rpc"
  )
  
  // 1. 定义服务结构体（承载 RPC 方法）
  type MathService struct{}
  
  // 2. 实现 RPC 方法（必须满足签名约束）
  // 功能：计算 a + b，结果通过 result 指针返回
  func (m *MathService) Add(args struct{ A, B int }, result *int) error {
  	*result = args.A + args.B
  	return nil
  }
  
  func main() {
  	// 3. 注册服务：将 MathService 实例注册为 "Math" 服务
  	// 客户端将通过 "Math.Add" 调用该方法
  	err := rpc.RegisterName("Math", new(MathService))
  	if err != nil {
  		panic(err)
  	}
  
  	// 4. 启动 TCP 监听（端口 1234）
  	listener, err := net.Listen("tcp", ":1234")
  	if err != nil {
  		panic(err)
  	}
  	defer listener.Close()
  
  	// 5. 循环接收客户端连接，处理 RPC 请求
  	for {
  		conn, err := listener.Accept()
  		if err != nil {
  			continue // 忽略错误连接
  		}
  		// 为每个连接启动 RPC 服务（非阻塞，可并发处理多个客户端）
  		go rpc.ServeConn(conn)
  	}
  }
  ```

  #### 2. 客户端实现（调用远程服务）

  客户端需完成：连接服务端 → 创建 RPC 客户端 → 调用远程方法。

  go

  ```go
  package main
  
  import (
  	"fmt"
  	"net/rpc"
  )
  
  func main() {
  	// 1. 连接服务端（TCP 协议）
  	client, err := rpc.Dial("tcp", "localhost:1234")
  	if err != nil {
  		panic(err)
  	}
  	defer client.Close()
  
  	// 2. 准备输入参数和输出变量
  	args := struct{ A, B int }{10, 20} // 输入：10 + 20
  	var result int                     // 用于接收结果
  
  	// 3. 调用远程方法：格式为 "服务名.方法名"
  	err = client.Call("Math.Add", args, &result)
  	if err != nil {
  		panic(err)
  	}
  
  	// 4. 输出结果
  	fmt.Printf("10 + 20 = %d\n", result) // 输出：10 + 20 = 30
  }
  ```

  #### 3. 运行效果

  1. 先启动服务端：`go run server.go`
  2. 再启动客户端：`go run client.go`
  3. 客户端控制台输出：`10 + 20 = 30`，表示远程调用成功。

  ### 四、进阶：使用 HTTP 协议和 JSON 序列化

  #### 1. HTTP 协议的服务端与客户端

  只需修改服务端的 “启动监听” 部分，客户端连接方式对应调整：

  go

  ```go
  // 服务端（HTTP 协议）
  func main() {
  	rpc.RegisterName("Math", new(MathService))
  	// 将 RPC 服务绑定到 HTTP 协议（通过 /rpc 路径访问）
  	rpc.HandleHTTP()
  	// 启动 HTTP 监听（端口 8080）
  	err := http.ListenAndServe(":8080", nil)
  	if err != nil {
  		panic(err)
  	}
  }
  
  // 客户端（HTTP 协议）
  func main() {
  	// 连接 HTTP 服务端
  	client, err := rpc.DialHTTP("tcp", "localhost:8080")
  	// 后续调用逻辑与 TCP 客户端一致...
  }
  ```

  #### 2. JSON 序列化（跨语言支持）

  `net/rpc/jsonrpc` 包提供 JSON 格式的 RPC 支持，可实现跨语言调用（如 Go 服务端 → Python 客户端）。

  go

  运行

  ```go
  // 服务端（JSON-RPC + TCP）
  func main() {
  	rpc.RegisterName("Math", new(MathService))
  	listener, _ := net.Listen("tcp", ":1234")
  	for {
  		conn, _ := listener.Accept()
  		// 使用 jsonrpc 处理连接（替换默认的 gob 序列化）
  		go jsonrpc.ServeConn(conn)
  	}
  }
  
  // 客户端（JSON-RPC + TCP）
  func main() {
  	// 使用 jsonrpc 拨号（而非默认的 rpc.Dial）
  	client, _ := jsonrpc.Dial("tcp", "localhost:1234")
  	// 调用逻辑不变...
  }
  ```

  

  

  

  ![img](data:image/png;base64,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)

  ### 五、Go RPC 的局限性与替代方案

  标准库 `net/rpc` 适合简单场景，但存在明显局限：

  - **跨语言支持弱**：默认 gob 序列化仅支持 Go，JSON-RPC 功能有限。
  - **无内置负载均衡、服务发现**：需手动实现。
  - **性能一般**：不支持 HTTP/2、流式传输等高级特性。

  **更优选择**：

  - **gRPC**：Google 开源的高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers，支持跨语言、流式调用、服务发现等，是分布式系统的首选。
  - **Kitex**：字节跳动开源的 Go 微服务 RPC 框架，性能优异，支持多种协议。

  ### 六、总结

  Go 标准库 `net/rpc` 以简洁的 API 实现了 RPC 核心功能，适合快速开发内部非跨语言的简单服务。其核心是 “服务注册 - 方法调用” 模型，通过严格的方法签名约束和内置序列化机制简化远程通信。

  若需构建复杂分布式系统（跨语言、高性能、高可用），建议使用 gRPC 等更专业的框架，但理解标准库 RPC 的原理是掌握分布式通信的基础。

- 

- 摘要

  该视频主要讲述了使用Go语言内置的RPC框架进行入门级的hello world程序开发。内容涵盖RPC基础回顾、内置RPC包的使用、如何定义RPC服务接口及封装方法、参数传递（特别是使用指针类型参数）、返回值处理（通过修改指针参数返回结果），以及如何将服务注册到RPC框架中。通过构建server和client端，展示了RPC通信的基本流程。

- 分段总结

  折叠

  00:01rpc基础讲解

  1.上一章节讲解了rpc的基础概念，并基于内置库实现了简单的rpc过程。 2.本章节将使用go语言内置的rpc框架进行讲解，以深入理解rpc。 3.项目命名为hello world，并分为server和client端进行测试。

  01:02go语言内置rpc包

  1.go语言内置的rpc包位于net/rpc包下，使用上相对麻烦但更灵活。 2.需要注册接口到rpc中，并处理函数签名、序列化和反序列化等问题。 3.示例中使用了hello service struct，封装了一个简单的sayHello方法。

  05:12注册rpc服务

  1.使用rpc.RegisterName注册service到rpc中，指定服务名和接口。 2.注册时传入service的实例化对象，处理函数签名和序列化等问题。 3.示例中注册了hello service，并实例化了该对象。

  06:56启动rpc服务

  1.启动rpc服务的经典三步走策略：实例化service、注册服务、启动监听。 2.使用net.Listen函数监听TCP端口，并传入地址和端口号。 3.使用rpc.ServeConnection函数处理连接请求，并将socket传递给rpc。

  11:45客户端连接与调用

  1.客户端首先建立连接，使用rpc.Dial函数拨号连接到服务器。 2.调用服务器端的方法时，需要指定服务名和函数名。 3.示例中使用了hello service的sayHello方法，并传递了参数和reply指针。 4.检查错误并打印返回值。

  17:21指针变量的使用

  1.指针变量在rpc调用中必须初始化，避免传递无效地址。 2.使用new函数在内存中分配空间并返回指针。 3.示例中通过new初始化reply指针，确保服务器能够正确赋值。

  21:21本地函数调用体验

  1.客户端调用远程过程时，希望有本地函数调用的体验。 2.需要知道服务名和函数名，无法实现完全透明的本地函数调用。 3.后续章节将介绍如何封装rpc调用，提供更友好的本地函数调用体验。

- 重点

  本视频暂不支持提取重点

#### 一、rpc开发 ﻿00:00﻿

##### 1. RPC入门实践 ﻿00:27﻿

###### 1）项目结构搭建

- ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433840&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-lvgrBHpJRjgtmEP%2FM2Vh%2BqAUEpo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-2a6a581e02ecd1a39cd0e9a45e3bb5a63accd64cd8f19135746c525219c364d2b42012975f644e96bcfca33f80fbcfb475693437f4148085305a5e1275657320&expires=8h&r=839215476&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-1&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-1&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=875e0ff32ac7bd89b7db44095cce31dd72098eb49f28efe0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 基础结构

  ：演示了使用Go语言实现的HTTP客户端代码结构，包含

  ﻿ResponseDataResponseDataResponseData﻿

  结构体和

  ﻿AddAddAdd﻿

  函数

- 传输协议

  ：明确使用HTTP作为通信协议，通过

  ﻿HttpRequest.NewRequest()HttpRequest.NewRequest()HttpRequest.NewRequest()﻿

  发起请求

- 数据解析

  ：展示了JSON数据的解析过程，使用

  ﻿json.Unmarshaljson.Unmarshaljson.Unmarshal﻿

  将响应体解析到结构体

###### 2）项目命名与初始化

- ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433840&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-gihO1oc%2FIBJW9if%2FW6twMlo%2FdrM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-47717546bb4eb2ea536ae4178351993c18cf23035ed3b478e6deb0cec73acc4c6dba1bc0ad9c49ebbc436eaf939c3226ec23505d39462281305a5e1275657320&expires=8h&r=538001865&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-2&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-2&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068c32f23017ea016b05c67d8d55d84419136d137a8fa615318&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 项目命名：将入门级RPC项目命名为"helloworld"，作为基础实践案例
- 目录创建：演示了在IDE中创建新目录的过程，输入目录名称为"helloworld"

###### 3）服务端与客户端分离

- ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-AUoe6sXOAekGhHsydUxH1AxEKUc%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-609d55d694d9a7a2d188fff1ddb71c10183dc56a7c67023ef82999a3840663b5b958955834292bf189fb30c9cffb3e1d845550a399c7795f305a5e1275657320&expires=8h&r=573297481&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-3&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-3&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=b3434a369726e9249598d5fd593929895c67d8d55d84419136d137a8fa615318&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 模块划分：明确需要分别实现server端和client端进行测试
- 文件创建：展示了在项目中创建server.go文件的过程，开始构建服务端代码

###### 4）服务端实现

- ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-zYkqcqTckilg%2FWndQLwE6GWTflo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b9c7c01e88bd0ae0ecc6b6f176f8d05ab635260c72d09058e10346498dc5a9247d8940aebe240a893450acbec71df1c7bc30d3ab155fbb48305a5e1275657320&expires=8h&r=148366143&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-4&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-4&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068b85158c4a6b0835185de8c56d5e93494305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 包声明

  ：服务端代码以

  ﻿packageserverpackage serverpackageserver﻿

  开头，建立独立模块

- 目录结构：创建了server和client两个子目录，分别存放服务端和客户端代码

###### 5）客户端实现

- ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ToYt%2FnM%2BI3Xujpua0RfVtXnzz6I%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-08d4edac48316683e4362b998490dcee8822a37cf893335f42e71e6f5286f93ac1fe9b75970c8f92b2b9234eb9cc22c31ac60560f1929b09305a5e1275657320&expires=8h&r=604141918&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-5&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-5&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=12146e4ffd7df3c9949061e60c62bb0002541ba8a634e414&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 模块对应：在helloworld目录下建立了server和client两个子模块
- 代码组织：展示了完整的项目结构，包含go.mod文件和外部库依赖

##### 2. 内置rpc包开发 ﻿01:08﻿

###### 1）服务器代码开发

- Go语言内置RPC包 

  01:19

  - ![img](https://xacm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-a45M20c3jnXXORvJ4ow8eDd0sas%3D&to=131&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CXian%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-640044faea3d2d12496a383c49d196cfeedcc3e21b17db764e2f0163cddcc407959b1a22a5f768cfa0d2e1a2bb6013e72cd0beb4f4f160a0305a5e1275657320&expires=8h&r=411782769&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-6&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-6&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=4d291be9b9421959bfcd971e5877805e00214a5d83f761b0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 内置特性: Go语言内置了RPC包，位于net/rpc路径下

  - 使用特点

    :

    - 灵活性: 虽然使用相对麻烦，但提供了更高的灵活性
    - 开发方式: 可以直接基于该包进行RPC开发

- RPC包的位置与导入 

  01:32

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2FPvP%2BSR3yezCU33nJvp78v1NCXc%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-2b9c956d35cda96323db32f58b03973f5c8f41e8962657cffc1591aa24f92a21d459b873cd4cafcefc5adf27878569b9e3e05ae7677f5b2c305a5e1275657320&expires=8h&r=818908387&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-7&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-7&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=12146e4ffd7df3c9bc45b0a93630176585de8c56d5e93494305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 导入路径: 通过import "net/rpc"导入

  - 注册要求

    :

    - 接口注册: 需要注册接口到RPC中
    - 多方法封装: 可以将多个方法同时注册到RPC中

- 封装多个方法到RPC 

  02:10

  - 封装方式: 通过结构体(struct)封装方法
  - 实现逻辑: 相比接口(I)更简单的实现方式

- 定义HelloService结构 

  02:37

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-8?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-l6Ac668QtWaoujUeRwetW4%2BGz%2Fw%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-8ccd5dc8172ce04df972695abf54a7db3e71cbf3abd4a202c50b7b39e03f9b5bab512e16704b643f217f6c3b6133e7f961033329ef3acd91305a5e1275657320&expires=8h&r=654686697&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-8&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-8&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=cf87eda222dfadb772972c81ee53d49300214a5d83f761b0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 结构定义:
  - 方法封装: 在结构体上封装方法，使用指针接收器

- Hello方法参数与返回值 

  03:06

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-9?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-1B2jRTaOwvdZZ%2F8nK5QtBEMAWuY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-afc6dc3eba3e966e4b2a6442893cbe5ae67a2f83d8dc6c634e93480a5a93276c188d20852c0f745c7d04fe63a9230ee075d00a9ee9443cbf305a5e1275657320&expires=8h&r=985403256&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-9&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-9&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=83f2b583554fba15b5814bdd3b617ecb02541ba8a634e414&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 方法签名:

  - 参数特点

    :

    - request参数: 普通字符串参数
    - reply参数: 必须是指针类型(string指针)
    - 返回值: 固定为error类型

- 修改reply指针返回值 

  04:18

  - 返回值机制: 通过修改reply指针的值返回结果
  - 实现示例:

- 注册HelloService到RPC 

  05:17

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-10?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-N%2F6PAujaVi6sI3dhGwvoq6z%2FKFA%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-3735a2fe0d255f9a1b84eae63aa3b72386e25a334297daed3c2e51f8e255a597faef30c0dcf5cb3b3973f08599e05ee791d920018379a29a305a5e1275657320&expires=8h&r=407492532&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-10&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-10&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e80686faf624695b8f8f85c67d8d55d84419180d4af97bfb69cf0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 注册函数: 使用rpc.RegisterName

  - 参数说明

    :

    - name参数: 服务名称(可任意命名)
    - rcvr参数: 接收interface{}类型

  - 源码查看: 可通过IDE查看RegisterName的源码实现

- RPC开发三步走策略 

  07:00

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-11?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-sukSJt9AwddQRInoYKJObFsSP6o%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-880c1e922943e230c537498a23516c43c77c43e75bb29b1d736ea102ae15a8547f6e0b8130bf24641c2a1a0e05a42ee0bed854e848f4c80c305a5e1275657320&expires=8h&r=310195242&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-11&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-11&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=875e0ff32ac7bd89b7db44095cce31dd02541ba8a634e414&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 开发流程

    :

    - 实例化一个server
    - 注册处理逻辑handler
    - 启动服务

  - 通用性: 该策略适用于绝大多数框架

- 监听TCP端口 

  08:06

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-12?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-TBu4gHz32pRJxOiuxwYjCAiR5t8%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b2dea52c89f3234902984ae35b667e8148bd38e54231b65c731ad6d63200d9f4dda1c3b8d6b192787150f68bd11326711713ae10d5736f63305a5e1275657320&expires=8h&r=393181712&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-12&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-12&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068c32f23017ea016b05c67d8d55d84419180d4af97bfb69cf0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 监听方式: 使用Go内置的net包

  - 实现代码:

  - 地址说明

    :

    - 不指定IP地址时，默认通过127.0.0.1访问
    - 端口号使用1234

- 处理连接请求 

  09:59

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-13?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433841&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ZlQeriNtTfMd4rGeKAOo%2BbVs564%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-a1cd155032ef5760f526cd2d2f2cf1fc375909b3436cefab9682430a8b1e514de5eb27f2a1faf200c39d23bcf3fbaf917c9318fd7e856584305a5e1275657320&expires=8h&r=740680568&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-13&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-13&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=b3434a369726e9249598d5fd593929895c67d8d55d84419180d4af97bfb69cf0&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 连接接收: 使用listener.Accept()
  - RPC处理: 通过rpc.ServeConn(conn)将连接交给RPC处理
  - 错误处理: 简单示例中可忽略错误处理

- 启动服务并检查错误 

  11:00

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-14?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-wgRC1N5DUg5%2Fqt1RIkSy1VRw4f8%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-64ca131e87de70e86f6aa8b31c2b45eefb32de44f2811ba2d6512d16c61e965a0643aa05d980467a65d2e622993427a1f572d8dac3e2d798305a5e1275657320&expires=8h&r=370557770&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-14&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-14&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068b85158c4a6b0835109f43f1a98aa08a0305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 指针传递: 注册时需要传递结构体指针
  - 最终实现:
  - 服务测试: 启动服务后无报错即可编写客户端代码

###### 2）客户端代码开发 ﻿11:35﻿

- 建立连接 

  11:54

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-15?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-TH2JFAgir6qciMc5zbXbJuFqqJ8%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-f5ac0669b1fed42e51b25cabcc662b4aa349b1c90e1d8a1683abac0cd2c29d5f340cbeb5e189fe14bc2550c399ae8851267d58887e9cf1c8305a5e1275657320&expires=8h&r=316788376&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-15&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-15&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=1524a5cd531d02e5d5c5445e5877de9e09f43f1a98aa08a0305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 连接步骤：客户端开发第一步是建立连接，使用rpc.Dial方法进行TCP连接
  - 参数说明：rpc.Dial需要两个参数：network类型（如"tcp"）和address地址（如"localhost:1234"）

- 使用RPC进行连接 

  12:04

  - 协议选择：必须使用RPC协议进行连接，不能直接使用net包
  - 本地测试：开发阶段通常使用localhost作为地址，端口号可自定义（如1234）

- 错误处理 

  12:50

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-16?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-hjV1BK7OkRXIGJvX9U6TiBGlhaI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-27c468c79ccb32120c0dc07c819c7b4a345cf9289e0b704acacb2dac1a26b587495e88d2df7d1646556020d1bef1c983796bd4a5177e2c81305a5e1275657320&expires=8h&r=974060728&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-16&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-16&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068fca2b103d063e44c09f43f1a98aa08a0305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 必要性：必须检查rpc.Dial返回的error值，连接失败时应panic终止程序
  - 实践建议：错误信息应包含"连接失败"等明确提示，便于调试定位问题

- 调用函数 

  13:27

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-17?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-nkdzlyynCuo96em%2F70lz7JUtruI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e98bbd4c5d9e68f3cbb97ea068a429a9dead7c8f18e497fde8be71e99c20a9014dff711e1313283b6f81abda343440a2a5ef8115d9161722305a5e1275657320&expires=8h&r=204450993&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-17&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-17&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=4126a8bea2f5ff03d442d91ff8c6edef21d3742c67f741ff&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 命名规则：调用方法格式为"ServiceName.MethodName"，如"HelloService.Hello"
  - 作用域设计：服务名前缀避免了方法名冲突，允许不同服务有同名方法
  - 参数传递：需要明确知道服务端结构体名称和方法签名

- 指针与内存分配 

  17:17

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-18?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-D3nSv8r1T80u8N4IEt4OSLoIyqc%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-55e8549df45e15f0f7817c1857c62587ff15a20ee9cba16c13563064b7962a7d7788ae4656af6ab56559eeb63076d79547e4445bfc2e0163305a5e1275657320&expires=8h&r=569832378&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-18&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-18&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068230408e99c62dfff09f43f1a98aa08a0305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 常见错误：传递nil指针会导致"DecodeValue of unassignable value"错误

  - 解决方案

    ：

    - 使用new(string)分配内存空间
    - 或直接声明string变量（自动初始化为空字符串）

  - 原理说明：服务端需要有效的内存地址来存储返回值

- 序列化与反序列化 

  20:39

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-19?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-DK4oR%2BMjWTJ9p7Y3AtvMlVQtcbA%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b29ffdb1925e8b49a1d656a53beb9e6d007d6e9b20411fe7f0c7f47de0b69f5ae57c43fa5269f1dc2802a3d6b9cd51b227f4149a1a88fbb7305a5e1275657320&expires=8h&r=942199260&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-19&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-19&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=eae2efe893f98aac2c72557199f0d9e509f43f1a98aa08a0305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 核心问题

    ：

    - Call ID映射：解决远程函数识别问题
    - 数据编解码：处理参数和返回值的序列化/反序列化

  - 依赖关系：RPC层依赖net包处理基础网络通信，但增加了上述核心功能

- 封装调用 

  22:19

  - ![img](https://bdcm01.baidupcs.com/file/p-33899adfece8254092ce8677a7aa2df4-40-2025042100-20?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756433842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-YrMGEwWoxwJpJEwpaQJ0Ci0M%2BsM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-c814545407e08599c98a833a0410c8d922dcaf3bded17e4dbd6e49d6fc1bac5fd90333579e3269e3d0044bf8df271b2da78ec3bd87750e7b305a5e1275657320&expires=8h&r=836265870&vbdid=-&fin=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-20&fn=p-33899adfece8254092ce8677a7aa2df4-40-2025042100-20&rtype=1&dp-logid=9034985145658715606&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068f193165a1eaeeb4309f43f1a98aa08a0305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 体验问题：当前调用方式需要了解过多服务端细节
  - 改进方向：可封装为类似本地调用的形式，如client.Hello("bobby", &reply)
  - 实现提示：需要通过自定义封装来隐藏RPC调用的复杂性

#### 二、知识小结

| 知识点           | 核心内容                                                     | 考试重点/易混淆点                              | 难度系数 |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------- | -------- |
| Go语言RPC基础    | 使用Go内置net/rpc包实现简单RPC调用流程                       | 服务端注册方法必须满足特定签名格式（指针参数） | ⭐⭐       |
| 服务端开发三步走 | 1. 实例化server; 2. 注册处理逻辑; 3. 启动服务                | 端口监听与RPC框架解耦（使用net包独立监听）     | ⭐⭐       |
| 方法注册规范     | 需满足： - 接收者为指针类型; - 参数二必须为指针; - 返回error类型 | 未导出方法报错（需用指针注册）                 | ⭐⭐⭐      |
| 客户端调用机制   | 调用格式：client.Call("结构体名.方法名", 请求, 回复指针)     | 指针变量初始化问题（必须用new或变量地址）      | ⭐⭐⭐      |
| 序列化限制       | 内置RPC使用Gob编码，字段需可导出                             | 跨语言调用需自定义编解码器                     | ⭐⭐⭐⭐     |
| 连接管理缺陷     | 当前实现只能处理单次连接                                     | 需改造为循环accept实现持续服务                 | ⭐⭐       |
| 本地化调用封装   | 原生调用需知晓方法全路径（结构体名.方法名）                  | 理想形态应支持client.Hello("bob", &reply)      | ⭐⭐⭐      |

- 摘要

  该视频主要讲述了Go语言RPC库的使用及其存在的问题，包括序列化和反序列化的复杂性以及调用端的繁琐性。同时，视频还探讨了RPC的跨语言调用能力，指出只要知道数据协议，就可以实现跨语言调用。此外，视频还介绍了将RPC的序列化协议替换为更常见的JSON协议的方法，并演示了如何使用不同语言进行RPC调用，以强调RPC的跨语言特性。

- 分段总结

  折叠

  00:01Go语言RPC库介绍

  1.介绍了Go语言自带的RPC库，并简单完成了一个RPC逻辑端的编码。 2.讨论了序列化和反序列化的重要性，以及它们在RPC中的角色。 3.提到了序列化和反序列化在不同语言中的通用性，以及它们与编码和解码的关系。

  00:32RPC调用模式的问题

  1.讨论了RPC调用模式的问题，特别是端写起来比较麻烦的问题。 2.介绍了使用点调用模式（如.hello）的简便性，并指出在静态语言如Go中实现起来较为复杂。 3.提到了反射在Java等动态语言中实现类似调用的可能性，但仍然不够简便。

  01:58RPC的跨语言调用

  1.讨论了RPC的跨语言调用可能性，强调了序列化和反序列化协议的重要性。 2.指出只要知道服务端的数据协议，就可以实现跨语言调用。 3.讨论了Go语言序列化和反序列化协议的默认选择及其性能优势。

  03:15替换序列化协议为JSON

  1.讨论了将RPC的序列化协议替换为JSON的可能性。 2.介绍了JSON协议的普遍性和高性能特点。 3.指导如何将Go语言RPC的序列化协议替换为JSON。

  04:30JSON RPC Server的实现

  1.介绍了如何新建JSON RPC Server的目录和文件结构。 2.讨论了修改代码以使用JSON编码的具体步骤。 3.指导如何替换底层协议为JSON，并运行server以验证其工作。

  07:26JSON RPC Client的实现

  1.讨论了JSON RPC Client的实现，包括拨号和连接的变化。 2.介绍了如何使用new client with codec来创建客户端。 3.指导如何发送JSON格式的数据到server，并接收响应。

  11:50防止Server端关闭的方法

  1.讨论了防止Server端关闭的方法，包括使用死循环来处理连接。 2.介绍了如何使用goroutine来异步处理连接，以提高并发性。 3.指导如何运行server以保持其持续运行。

  13:26使用Python进行跨语言调用

  1.介绍了使用Python进行跨语言调用的示例。 2.讨论了为什么选择Python进行示例演示，以及其相对简单的特性。 3.指导如何使用Python的socket编程来发送和接收JSON数据。

- 重点

  本视频暂不支持提取重点

#### 一、替换rpc序列化协议为json ﻿00:02﻿

##### 1. 上节回顾 ﻿00:33﻿

###### 1）RPC端调用的简便性问题 ﻿00:34﻿

- 调用方式改进：当前RPC调用方式较为繁琐，理想状态应支持类似"client.Hello()"的直接调用方式
- 语言特性限制：在静态语言如Go中实现动态调用方式比Python等动态语言更复杂，可通过反射实现但不够简洁

###### 2）RPC的跨语言调用可能性 ﻿02:00﻿

- 核心机制：网络调用的跨语言能力取决于序列化协议，只要服务端能解析数据协议即可实现跨语言调用
- 协议关键性：Go语言默认使用Gob协议而非JSON，了解协议规范是实现跨语言调用的前提

###### 3）序列化协议的性能与替换 ﻿02:47﻿

- 协议对比：Gob协议性能优于JSON，但JSON更通用且支持跨语言
- 协议替换：Go的RPC框架支持将默认的Gob协议替换为JSON等常见序列化协议

##### 2. 替换为json协议 ﻿03:41﻿

###### 1）项目新建 ﻿04:27﻿

- ![img](https://bdcm01.baidupcs.com/file/p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756434771&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-pRoe6TgbFL7%2BkrSOcyohMNsNItk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-3ea28a9b5b821381abd9929b0bf9d1aaa4d3f6b54b8eaa9b15fb7ed0d05c20a73f0ef3ee663624e1e51b32630fe5fe37aeb3a3583f95fe36305a5e1275657320&expires=8h&r=850727401&vbdid=-&fin=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-1&fn=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-1&rtype=1&dp-logid=9035235032045694859&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=eae2efe893f98aac2c72557199f0d9e5fecbc3775a3f0dc4305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 目录结构

  ：

  - 新建json_rpc_test目录
  - 创建server和client子目录
  - 分别建立server.go和client.go文件

###### 2）服务器代码编写 ﻿05:16﻿

- ![img](https://xacm01.baidupcs.com/file/p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756434771&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-VzzLVITNTY3jN4efQfzcRb7w2X8%3D&to=131&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CXian%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-baf80976c7f6d0f064454a1ef25e4802986db584f538727d3311bd93e5a61dd1fc213f775494dd33be25ec4c7519aad50a155e934632d7da305a5e1275657320&expires=8h&r=271433481&vbdid=-&fin=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-2&fn=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-2&rtype=1&dp-logid=9035235032045694859&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068f193165a1eaeeb43fecbc3775a3f0dc4305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 核心修改

  ：

  - 使用jsonrpc.NewServerCodec替代默认的ServeConn
  - 主要流程不变：实例化server→注册处理逻辑→启动服务
  - 关键代码：rpc.ServeCodec(jsonrpc.NewServerCodec(conn))

- 并发处理

  ：

  - 添加for循环防止服务立即退出
  - 建议使用goroutine处理每个连接以实现并发

###### 3）客户端代码编写 ﻿07:24﻿

- ![img](https://bdcm01.baidupcs.com/file/p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756434772&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-SKWG3sqvbRY3Pd%2FfLuRjn9TlOcM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b489f7a305fd4826da2102a3fde1640462d210582f4c51824a0bdc7c107187a1b508e61e4bc8a9bb5adf8dc35ce10ecb45411310de6be7ed305a5e1275657320&expires=8h&r=879593347&vbdid=-&fin=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-3&fn=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-3&rtype=1&dp-logid=9035235032045694859&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=eae2efe893f98aaca3b9ff4a91798660f3ab493438254dd6&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 主要变更

  ：

  - 使用net.Dial替代rpc.Dial建立原始TCP连接
  - 通过jsonrpc.NewClientCodec包装连接
  - 关键代码：client := rpc.NewClientWithCodec(jsonrpc.NewClientCodec(conn))

###### 4）服务器运行 ﻿10:23﻿

- ![img](https://bdcm01.baidupcs.com/file/p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756434772&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-5Kc8NnwFpRjnoAdLGw4c9gHq0rY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-f9063e2149518944134f2a1f39f6948ad448a803272c5ea602009c5718c50a90537c9c116527155d29044b25ea394f9147289b149b06399a305a5e1275657320&expires=8h&r=247944751&vbdid=-&fin=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-4&fn=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-4&rtype=1&dp-logid=9035235032045694859&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=6a9088c7620f7a1736564e37f877fcb0b5f70224ccefe673&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 运行验证

  ：

  - 服务端启动后持续监听端口
  - 客户端调用返回预期结果"hello, bobby"
  - 验证JSON协议替换成功

###### 5）服务器添加死循环 ﻿10:44﻿

- ![img](https://bdcm01.baidupcs.com/file/p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756434772&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-IfzCFXhA9VwKZ%2FUpupF%2B6bR1FsY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-fef89ebf3eeb02443eda7d1dddfae3ab44a69b4a3f75dd019af342eb565dbdeb4473003a8cd33797a99962bc479eacd5c6dcc167c840b0c0305a5e1275657320&expires=8h&r=720782001&vbdid=-&fin=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-5&fn=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-5&rtype=1&dp-logid=9035235032045694859&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=0cce998314b34a67bdd25db1c01455a9a4465f977bb10337&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 改进方案

  ：

  - 使用for循环持续接受新连接
  - 避免服务处理单个请求后立即退出
  - 代码结构：for { conn,_:=listener.Accept()... }

###### 6）客户端添加携程 ﻿11:50﻿

- 并发优化

  ：

  - 每个连接使用goroutine异步处理
  - 解决多个请求排队等待的问题
  - 实现真正的并发处理能力

###### 7）拍摄客户端代码编写 ﻿14:32﻿

- ![img](https://bdcm01.baidupcs.com/file/p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756434772&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-hzM7UNKP%2FeLo23OGDPQ1bJy1W38%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e9ce63f44202a2515d99882859e7916f5336ce8cdba417a92e1947cd8378e1a531d40fe46e9012e647cab2ca7c95b658c1dc37334d0ff1cf305a5e1275657320&expires=8h&r=315090830&vbdid=-&fin=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-6&fn=p-15c34ec98ce6fa66590950a68b5c404a-40-2025042100-6&rtype=1&dp-logid=9035235032045694859&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=c77a2290e27174be3d66e1a7460e33c3db433041c47c616d305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 实现要点

  ：

  - 使用socket而非requests库（避免HTTP协议干扰）
  - 请求格式必须符合JSON-RPC规范：
  - 完整流程：建立连接→发送JSON数据→接收并解析响应

- 关键代码：

- 跨语言验证

  ：

  - 成功实现Python调用Go服务
  - 证明JSON协议确实实现了跨语言能力
  - 相同原理可应用于其他语言如Java、PHP等

#### 二、知识小结

| 知识点           | 核心内容                                 | 考试重点/易混淆点                      | 难度系数 |
| ---------------- | ---------------------------------------- | -------------------------------------- | -------- |
| Go语言RPC基础    | 使用Go语言自带RPC库实现简单RPC逻辑端编码 | 序列化与反序列化（编码/解码）概念辨析  | ⭐⭐       |
| RPC跨语言调用    | 网络调用的跨语言实现关键在序列化协议     | Go语言默认使用gob协议而非JSON          | ⭐⭐⭐      |
| JSON-RPC改造     | 通过jsonrpc包替换默认序列化协议          | ServeCodec与NewClientWithCodec方法应用 | ⭐⭐⭐⭐     |
| 并发处理优化     | 使用goroutine实现服务端并发请求处理      | 同步处理与异步处理的性能差异           | ⭐⭐⭐      |
| Python跨语言调用 | 通过socket编程发送标准JSON-RPC格式数据   | Method/Params/ID字段的强制格式要求     | ⭐⭐⭐⭐     |
| 协议对比分析     | gob协议与JSON协议的性能与兼容性差异      | JSON协议的跨语言通用性优势             | ⭐⭐       |
| HTTP协议限制     | 强调RPC底层需使用原始TCP连接而非HTTP     | HTTP协议头会干扰RPC数据解析            | ⭐⭐⭐      |

- 摘要

  该视频主要讲述了如何将RPC的序列化协议换成JSON，并直接监听HTTP请求。通过内置的HTTP服务器和Flask框架，可以暴露HTTP数据。视频中展示了如何使用RPC的灵活性，将RPC直接基于HTTP进行修改。在代码中，将之前的JSON Server拷贝过来，然后将RPC放在HTTP服务器上监听。在Python的HTTP包中，使用起来非常简单，只需要注释掉不需要的部分，并配置URL和RPC逻辑即可。视频还提到了一个简单的外部开发模型，并指出这不是重点，因为后边会学习更深入的内容。最后，视频展示了如何注册函数处理函数，对应URL的处理函数在Flask和HTTP中是一样的，只不过这里是一个匿名函数。

- 分段总结

  折叠

  00:01RPC传输协议替换为HTTP

  1.介绍将RPC的传输协议替换为HTTP的背景和意义，便于使用HTTP请求进行通信。 2.讲解如何在RPC中实现HTTP传输，包括服务器和客户端的创建。

  02:58HTTP包在Go语言中的位置

  1.介绍Go语言中HTTP包的位置，以及如何使用该包进行HTTP请求的处理。 2.讲解如何将RPC注册到HTTP服务器上，监听HTTP请求。

  04:36HTTP请求处理函数

  1.介绍HTTP请求处理函数的注册过程，包括函数签名和参数。 2.讲解如何解析HTTP请求中的JSON数据，并调用相应的RPC处理函数。

  06:42HTTP客户端发送请求

  1.介绍如何使用HTTP客户端发送请求到RPC服务器。 2.讲解如何设置正确的URL、请求方法和请求头，以及如何传递JSON数据。

  08:59RPC零拷贝和本地调用

  1.介绍RPC零拷贝和本地调用的概念，以及如何实现这些功能。 2.讲解如何封装RPC调用，以实现更高效和便捷的通信。

- 重点

  本视频暂不支持提取重点

#### 一、替换rpc的传输协议为http ﻿00:08﻿

##### 1. 问题引入 ﻿00:28﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435502&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-a6nvIdUEVt6rv4GhPKDTVmKq5QI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-1ecd2e39d87ae2e280353e34dd50be310104588ad48c571882cda4f11122d7fabe10c7bc1d4869fc2bbc979ba2cda98b05cf33e67df24fa4305a5e1275657320&expires=8h&r=699213133&vbdid=-&fin=p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-1&fn=p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-1&rtype=1&dp-logid=9035431295167608904&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=875e0ff32ac7bd89b7db44095cce31dd6dbcf08b6f98ad49&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 协议替换需求: 将RPC的序列化协议从TCP替换为HTTP，使客户端可以直接通过HTTP请求调用服务

- 优势

  :

  - 使用更加方便，可以直接使用curl等命令进行请求
  - 兼容性更好，可以与其他HTTP工具链集成

##### 2. rpc介绍 ﻿01:51﻿

- 灵活性证明: Go语言的RPC框架非常丰富，能够直接基于RPC修改协议，证明了其强大的灵活性

- 与其他框架对比

  :

  - 类似Python中的Flask框架，只要能解析JSON并返回JSON即可
  - Go语言中很多web框架都能实现类似功能，但直接基于RPC修改更能体现其灵活性

##### 3. server代码 ﻿02:02﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435503&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-DzlYMOT6D4ldbrnVfUBjZoE6P%2FY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-ecc0d93c9cc2ac4c5de7a6949c27dc06b24584b781499ea91990acb04a670e7c808ff7b3f70b1ac6979663afbc098c9955fd2bfb85e49cb1305a5e1275657320&expires=8h&r=509032049&vbdid=-&fin=p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-2&fn=p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-2&rtype=1&dp-logid=9035431295167608904&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=66239664855e8068c32f23017ea016b017824dbdc42ed54b60f1fd2882e1895f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 核心结构

  :

  - 定义HelloService结构体，包含Hello方法
  - Hello方法接收请求字符串，返回"hello, "+request的格式

- 服务注册

  :

  - 使用rpc.RegisterName注册服务名为"HelloService"
  - 关键点：需要确保服务名称与客户端调用时一致

- HTTP处理

  :

  - 使用http.HandleFunc注册处理路径"/jsonrpc"
  - 创建io.ReadWriteCloser结构体连接请求体和响应体
  - 使用rpc.ServeRequest处理RPC请求

- 服务启动

  :

  - 调用http.ListenAndServe在1234端口启动HTTP服务
  - 注意：需要确保端口未被占用

##### 4. client代码 ﻿05:58﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435503&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ZONsnVCWsvkttvcJZNV1HghpG3o%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CYangquan%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-84fe7471be3116a5236fd57dbea5913b5fc8d589d123599d6eb8b353e54e5606ba8e2d36c58efa1b6a6c6f9097d4390b386fa02bfd790e0b305a5e1275657320&expires=8h&r=313690315&vbdid=-&fin=p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-3&fn=p-e3d66ff41b6c0cde846d30770963047a-40-2025042100-3&rtype=1&dp-logid=9035431295167608904&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=b3434a369726e9249598d5fd5939298917824dbdc42ed54bc48031c257b32a4e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 请求构造

  :

  - 构建JSON格式的请求体，包含id、params和method字段
  - method字段格式为"服务名.方法名"(如"HelloService.Hello")

- HTTP调用

  :

  - 使用POST方法请求"http://localhost:1234/jsonrpc"
  - 通过json参数直接传递请求体
  - 注意：必须使用POST方法，GET方法不支持请求体

- 响应处理

  :

  - 响应体为JSON格式，包含result字段
  - 错误处理需要考虑HTTP状态码和RPC错误信息

##### 5. client代码改进 ﻿06:42﻿

- 原始问题

  :

  - 直接使用socket发送JSON数据无法被HTTP服务器识别
  - 缺少HTTP协议必需的头信息(GET/POST方法等)

- 改进方案

  :

  - 使用标准HTTP客户端库发送请求
  - 确保URL路径与服务端配置一致("/jsonrpc")
  - 通过json参数自动处理JSON序列化

- 优势

  :

  - 自动处理HTTP协议细节
  - 内置JSON序列化/反序列化
  - 更健壮的错误处理机制

#### 二、知识小结

| 知识点            | 核心内容                                                     | 考试重点/易混淆点                 | 难度系数 |
| ----------------- | ------------------------------------------------------------ | --------------------------------- | -------- |
| RPC协议替换为JSON | 讲解如何将RPC的序列化协议从默认格式替换为JSON，提升兼容性和易用性 | JSON与二进制协议的性能差异        | ⭐⭐       |
| RPC监听HTTP端口   | 演示如何让RPC服务直接监听HTTP请求而非TCP端口，便于通过curl等工具调用 | HTTP协议头处理 vs 原始TCP数据解析 | ⭐⭐⭐      |
| Go语言HTTP包集成  | 使用net/http包注册RPC服务，通过URL路径映射处理函数           | 匿名函数在HTTP路由中的应用        | ⭐⭐       |
| HTTP客户端调用RPC | 通过http.Post发送JSON数据，解析响应时剥离HTTP协议头          | POST请求路径匹配与JSON数据封装    | ⭐⭐⭐      |
| 与Web框架对比     | 对比直接基于RPC改造与Flask等框架暴露JSON接口的灵活性差异     | RPC协议扩展性优势                 | ⭐⭐       |
| ZeroRPC预告       | 下节课将实现类似Python ZeroRPC的本地调用封装，隐藏方法名细节 | 方法名隐式映射机制                | ⭐⭐⭐⭐     |

 

- 摘要

  该视频主要讲述了如何使用代理封装函数。通过将函数封装到代理中，可以提高代码的可维护性和可扩展性。在视频中，演示了如何将函数封装到一个名为client的包中，并将其命名为端代理。为了实现封装效果，需要将函数封装到一个结构体中，该结构体包含函数的输入和输出参数。在封装过程中，需要将函数暴露出去，以便在其他地方调用。为了方便代码的封装，可以将函数封装到类中，使用代理类来调用该函数。在Go语言中，可以使用结构体和指针来实现函数的封装和调用。最后，视频还介绍了如何实例化代理对象，并演示了如何调用封装后的函数，就像本地函数一样简单。

- 分段总结

  折叠

  00:01RPC传输协议改造

  1.上一节课讲解了如何将RPC的传输协议改成HTTP协议。 2.本次课程继续改造代码，解决RPC调用仍不具备本地调用感觉的问题。

  00:14RPC调用存在的问题

  1.RPC调用仍然不是本地调用的感觉，需要记住每个函数的名称。 2.传递方式也不像本地函数一样，使用起来不方便。

  01:00RPC调用原理

  1.服务端代码是固定的，客户端如何生成RPC调用？ 2.通过模仿方法和getattr方法，客户端可以根据方法名称构建网络请求。

  03:54解决客户端调用问题

  1.将handler代码放到公用文件中，解决客户端和服务端的代码一致性问题。 2.使用前缀解决名称冲突问题，通过import旧包和新handler的方式实现。

  09:26封装RPC调用为代理

  1.封装RPC调用为代理，简化客户端调用方式。 2.使用struct封装handler函数，通过指针调用，实现本地函数调用效果。 3.初始化函数new用于实例化代理对象，传递基本信息和协议信息。

- 重点

  本视频暂不支持提取重点

#### 一、进一步改造RPC调用的代码 ﻿00:07﻿

##### 1. 客户端调用问题处理 ﻿01:11﻿

- ![img](https://bdcm01.baidupcs.com/file/p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435792&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-nz9T6lrRi9tBNSMC3GbSH7sLalM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-9977694ef0a9df24798a32195c7cdf4c73f7294220a0c368d3e734860dc3a0b1c43110191d856d943226b5f682c51883bea14227d708e4dc305a5e1275657320&expires=8h&r=370826464&vbdid=-&fin=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-1&fn=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-1&rtype=1&dp-logid=9035509164345432004&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=e83ff6a1394898305c92c18ca9f96abafcbc1f44ded06395&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 问题本质：当前RPC调用方式需要记住每个函数名称和传递方式，不符合本地调用的直观感受
- 对比Python实现：Python通过__getattr__魔法方法动态生成方法调用，而Go语言是静态编译语言无法实现相同机制
- 解决方案思路：通过封装代理模式模拟本地调用体验

##### 2. 服务器代码改造 ﻿03:46﻿

- ![img](https://bdcm01.baidupcs.com/file/p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435793&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-V5KVpPIebXhe1OXfe78KdGttBns%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-37a65725a2c1acfe9b5159a64b98280b4ac80b04a21d7f31cda9ae7915541a5f9688eafd3d8975f03010aa795b3d8187cf8f32c8d6f4bf80305a5e1275657320&expires=8h&r=995939552&vbdid=-&fin=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-2&fn=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-2&rtype=1&dp-logid=9035509164345432004&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=e83ff6a1394898307b01f8311a6d0192fcbc1f44ded06395&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 服务注册优化

  ：

  - 使用rpc.RegisterName注册服务时采用统一命名规范
  - 通过handler包管理服务名称常量，避免硬编码

- 命名冲突解决：在服务名前添加包路径前缀（如handler/HelloService）确保全局唯一性

##### 3. 客户端方法调用封装 ﻿04:52﻿

- ![img](https://bdcm01.baidupcs.com/file/p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435793&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-OFcvzEjSDMa0j9f9yld%2FV7Hfsno%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-be69ece60962152216181ad329891f7ed4e77252ad1ded570157b9693795b44fefe48f5133c96031ab371224667c5a7765f6be9c1328939e305a5e1275657320&expires=8h&r=729565931&vbdid=-&fin=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-3&fn=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-3&rtype=1&dp-logid=9035509164345432004&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=5eee304bbb22b9c2fcf9761cd9df8ec9e5e04f0a5f4977b9c48031c257b32a4e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 代理模式实现

  ：

  - 创建HelloServiceStub结构体包含*rpc.Client匿名成员
  - 实现Hello方法封装底层client.Call调用

- 初始化规范

  ：

  - 使用NewHelloServiceClient工厂函数替代直接实例化
  - 工厂函数处理网络连接建立和代理对象创建

##### 4. 完整代理实现 ﻿10:09﻿

- ![img](https://bdcm01.baidupcs.com/file/p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756435793&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-5M%2BZkdDdROlJAzWWYk2fNle%2B%2FJ4%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-fd3bbde290312627d624448c1bde17b0301f685d08e6d65177626120476746af0985df852f5b06c80751344e3c4aa2f73f1abd54a0c87343305a5e1275657320&expires=8h&r=744937050&vbdid=-&fin=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-4&fn=p-95a15a2b70cae283fd824e492af0a1c0-40-2025042100-4&rtype=1&dp-logid=9035509164345432004&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=7717645f262844ca5d56a4409b209f552559e228a123a63f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 方法映射

  ：

  - 代理方法名与服务端方法名严格对应
  - 方法签名保持(request string, reply *string) error形式

- 错误处理

  ：

  - 连接失败时直接panic终止程序
  - 调用失败返回标准error类型

- 调用示例：

```
client := NewHelloServiceClient("tcp", "localhost:1234")
var reply string
err := client.Hello("bobby", &reply)
```

#### 二、知识小结

| 知识点           | 核心内容                          | 考试重点/易混淆点    | 难度系数 |
| ---------------- | --------------------------------- | -------------------- | -------- |
| RPC协议改造      | 将RPC传输协议改为HTTP协议         | 协议切换的实现方式   | ⭐⭐       |
| 客户端本地化调用 | 实现类似本地函数调用的RPC调用体验 | 动态方法生成机制差异 | ⭐⭐⭐⭐     |
| 服务发现机制     | 使用公共handler解决服务名称冲突   | 路径前缀命名规范     | ⭐⭐       |
| 代理模式实现     | 通过stub封装RPC调用细节           | struct匿名字段用法   | ⭐⭐⭐      |
| 动态方法拦截     | Python的__getattr__魔法方法实现   | Go语言静态类型限制   | ⭐⭐⭐⭐     |
| 客户端初始化     | NewXXXClient工厂模式规范          | 错误处理机制差异     | ⭐⭐⭐      |
| 协议兼容性       | JSON-RPC与原生RPC调用对比         | 参数序列化方式       | ⭐⭐       |
| 服务端注册       | 统一service name管理方案          | 多服务注册冲突解决   | ⭐⭐       |

- 摘要

  该视频主要讲述了如何封装RPC调用到代理类中，简化客户端和服务器端的调用逻辑。通过封装，客户端和服务器端的业务逻辑与RPC框架细节分离，使得开发者只需关注业务逻辑本身。视频还展示了如何在代理类中封装注册逻辑，进一步减少主逻辑中的代码量，提高开发效率和代码的可维护性。

- 分段总结

  折叠

  00:01RPC调用封装

  1.RPC调用封装在客户端和服务端，采用正确的方式实例化。 2.客户端调用简化，通过grant prophecy新建client。 3.服务端注册逻辑封装在代理类中，使用for循环和goroutine防止断开。

  02:54业务逻辑抽离

  1.将服务端业务逻辑抽离，使用import导入handler。 2.注册逻辑封装在代理类中，简化主逻辑。 3.使用server proxy封装注册逻辑，避免直接引用handler。

  08:53接口解耦

  1.关注函数名称而非结构体类型，使用接口解耦。 2.handler结构体实现接口方法，名称一致即可注册。 3.client stub和server proxy使用interface类型参数，避免报错。

  12:10客户端调用流程

  1.客户端通过stub代理向服务端发起请求。 2.服务端proxy接收请求，转发给实际处理逻辑。 3.数据返回客户端，实现本地调用效果。

  16:39自动生成代理类

  1.自动生成client stub和server proxy，简化开发。 2.支持多种语言生成，实现跨语言调用。

- 重点

  本视频暂不支持提取重点

#### 一、Go语言RPC开发 ﻿00:00﻿

##### 1. RPC封装原理 ﻿00:02﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437699&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-HnMrZFnp0VhE7Z62TgfmwjJrAiU%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-efe4bf76fc7a33ae5515400eaba75e3427ba2bc691fa0f96462f136d32c9ad0428939ca73bfc94bc565ddc58d6160ef72860434bb1ec7ce7305a5e1275657320&expires=8h&r=679295045&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-1&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-1&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=5eee304bbb22b9c2fcf9761cd9df8ec9d19934ce0d53114ba6c2ad6eeb587c84&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 封装目的：将网络通信细节隐藏在客户端代理中，使调用像本地函数一样简单
- 实现方式：通过client_proxy封装rpc.Dial建立连接，隐藏TCP地址等底层细节
- 注意事项：避免按Python习惯写Go代码，特别注意Go的类型系统和实例化语法差异

##### 2. 客户端实现 ﻿00:16﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437699&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-QL6OrTDRM3DxXE%2Be9hjZHyhKztg%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-1de43ad91994e1e22743513bf57944262997f6944086184e3f40831cb7497e4fb466ebf5b32b9f65050ecae81639d18556aaf59f2b73ee5d305a5e1275657320&expires=8h&r=196386432&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-2&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-2&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=7717645f262844ca5d56a4409b209f551c466dcb1189ca5f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 连接建立：使用client_proxy.NewHelloServiceClient简化连接过程
- 业务调用：直接通过client.Hello()方法调用，无需关注函数名映射
- 参数传递：reply参数需使用指针&reply以便服务端修改返回值

##### 3. 服务端实现 ﻿01:43﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437700&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-0uhs32QE%2BXASz2m55h1G31neRqo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-6f942bca72b3fcab2d9881e10a70d3248d5f6d4d4e8642d5b2b3f9e657c5a3b83e1c81a03b5186b919d62ea9b84d7116faf7f11a3b3c070f305a5e1275657320&expires=8h&r=215680023&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-3&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-3&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=5eee304bbb22b9c2b6e12d2bd14114ddd19934ce0d53114ba6c2ad6eeb587c84&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 核心组件

  ：

  - net.Listen创建TCP监听
  - rpc.RegisterName注册服务
  - rpc.ServeConn处理连接

- 并发处理：使用go关键字将每个连接放入协程处理，防止阻塞

##### 4. 业务逻辑解耦 ﻿02:54﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437700&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-vV2MsH9u16sjZZ4U1QJsTh7zgs8%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-410f3193efb57f4107580d23f812151018f96f008a89a30765e55fb65a79d5f0bbecbc2a4fdf9ae98682ef990993c208a91c022aaabeb082305a5e1275657320&expires=8h&r=225798218&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-4&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-4&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=a5f92b9aebde11e52e423028fca05fd99eb3d0351ab7292e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 解耦方案

  ：

  - 将HelloService结构体和业务方法移到单独handler包
  - 服务端通过hanlder.HelloServiceName引用服务名称

- 优势：业务代码与RPC框架分离，便于维护和测试

##### 5. 服务注册优化 ﻿04:49﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437700&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-5CJ5UFf9roy725DXZ1qcxnWwaEM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-0a098df3449d6cfb136b24ae53b620f67e58f6aa24d699e85a9d8950c63567a62b8f0a1d4e6065be838f647cdb8bd44dc70fac66d743914f305a5e1275657320&expires=8h&r=837034321&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-5&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-5&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=5eee304bbb22b9c2b94d4c3788c069c52a95b2190d7928ea36d137a8fa615318&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 封装函数：创建RegisterHelloService统一处理服务注册
- 错误处理：返回可能的注册错误，避免服务启动时静默失败
- 代码示例：

```
func RegisterHelloService(srv hanlder.HelloService) error {
    return rpc.RegisterName(hanlder.HelloServiceName, srv)
}
```

##### 6. 接口解耦设计 ﻿09:11﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437700&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-FEliGLBjOsu6gU6je0wQVpZLQSI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-0d4565e1161fa41f793a8ac60c572da5c2483b23a829972fb82ee4b7b0fe30b886f92fc001ebdc7bb42120b600eacb0f39f9235e73c24e93305a5e1275657320&expires=8h&r=222746382&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-6&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-6&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=a7e1f23860a769ab62a02d5a82ac3ae59eb3d0351ab7292e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 鸭子类型：定义HelloServicer接口而非具体结构体
- 核心优势：任何实现Hello方法的类型都可注册，不依赖具体实现
- 关键代码：

```
type HelloServicer interface {
    Hello(request string, reply *string) error
}
```

##### 7. 完整调用流程 ﻿12:17﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3b2349911056dea8c0e030d02b6da728-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756437700&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-hG90znHoW3dILZd6cXvvarIzNwI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4cbcf8e5e63805326d619d6734aff21b0ff9d5da9cf3e5fddce8fb0e4f0456a80638a223fdf32687f14516d0f9bd1dfc571ca3ca869f5db9305a5e1275657320&expires=8h&r=345082207&vbdid=-&fin=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-7&fn=p-3b2349911056dea8c0e030d02b6da728-40-2025042100-7&rtype=1&dp-logid=9036021039795258781&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=3306618675&ti=718800a01e5121ca67a4b8c3cb26e049a8cfdb7ffc72e376&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 调用链：Client → ClientProxy → ServerProxy → Server

- 设计要点

  ：

  - 客户端代理隐藏网络细节
  - 服务端代理处理服务注册
  - 业务逻辑完全独立

- 跨语言支持：通过IDL定义接口，可自动生成多语言客户端代码

##### 8. 开发实践要点

- 代码生成：实际开发中应使用工具自动生成proxy代码
- 跨语言支持：GRPC等框架可生成多种语言客户端
- 性能考量：序列化协议选择影响性能，GRPC默认使用Protocol Buffers

#### 二、知识小结

| 知识点       | 核心内容                                            | 考试重点/易混淆点                  | 难度系数 |
| ------------ | --------------------------------------------------- | ---------------------------------- | -------- |
| RPC调用原理  | 客户端通过代理类发起请求，服务端处理业务逻辑        | 代理类与业务逻辑的解耦方式         | ⭐⭐⭐⭐     |
| 接口解耦设计 | 使用interface实现类型压制，不依赖具体结构体         | 接口命名规范(er结尾) vs 结构体实现 | ⭐⭐⭐⭐     |
| 服务端封装   | 将业务逻辑抽离到handler包，通过Register函数注册服务 | 注册时的类型检查机制               | ⭐⭐⭐      |
| 客户端封装   | 使用client proxy简化调用，隐藏RPC底层细节           | TCP连接参数配置方式                | ⭐⭐⭐      |
| 自动生成工具 | grpc可实现多语言代理类自动生成                      | 手写proxy vs 工具生成对比          | ⭐⭐⭐⭐     |
| 完整调用流程 | Client→ClientProxy→ServerProxy→Server→业务逻辑      | 各组件通信时序关系                 | ⭐⭐⭐⭐     |

以下是 Go 内置`net/rpc`快速开发相关的 20 道八股文题和 15 道场景题，聚焦标准库 RPC 的核心用法、开发技巧和实践场景，难度递增：

### 一、八股文题（20 题）

#### 基础概念（1-8 题）

1. **问题**：Go 内置`net/rpc`包的核心功能是什么？它解决了什么问题？
   **答案**：

   - 核心功能：提供跨进程 / 机器的函数调用能力，封装了网络通信细节，让开发者可像调用本地函数一样调用远程方法。
   - 解决问题：简化分布式系统中服务间通信的开发，无需手动处理 TCP 连接、数据序列化、协议解析等底层逻辑。

2. **问题**：`net/rpc`支持哪些数据传输方式？各有什么特点？
   **答案**：

   - TCP：基于原始 TCP 连接，效率高，适用于内部服务间高频通信。
   - HTTP：通过 HTTP 协议传输，可利用 HTTP 生态（如反向代理），但额外开销略大。
     两者均使用 Gob 编码（Go 专用二进制格式），仅支持 Go 语言客户端与服务端通信。

3. **问题**：一个方法要被`net/rpc`注册为可调用的 RPC 方法，必须满足哪些签名要求？
   **答案**：

   - 方法必须是导出的（首字母大写）。
   - 方法必须有且仅有两个参数，且参数类型必须是导出类型或基本类型。
   - 第二个参数必须是指针类型（用于返回结果）。
   - 返回值必须是`error`类型。
     格式：`func (t *T) MethodName(args Type, reply *Type) error`

4. **问题**：`net/rpc`中的服务注册函数`Register`和`RegisterName`有什么区别？
   **答案**：

   - `Register(x interface{}) error`：以对象的类型名作为服务名前缀，方法名格式为`"Type.Method"`。
   - `RegisterName(name string, x interface{}) error`：自定义服务名`name`，方法名格式为`"name.Method"`。
     示例：`Register(new(Arith))`注册的方法名为`"Arith.Add"`；`RegisterName("calc", new(Arith))`注册的方法名为`"calc.Add"`。

5. **问题**：`net/rpc`客户端的`Call`和`Go`方法的使用场景有何不同？
   **答案**：

   - `Call(serviceMethod string, args interface{}, reply interface{}) error`：同步调用，阻塞等待结果，适合需要立即处理响应的场景。
   - `Go(serviceMethod string, args interface{}, reply interface{}, done chan *Call) *Call`：异步调用，立即返回`*Call`结构体，通过`done`通道通知完成，适合并发发送多个请求的场景。

6. **问题**：Gob 编码在`net/rpc`中的作用是什么？它有哪些优缺点？
   **答案**：

   - 作用：`net/rpc`默认使用 Gob 对 RPC 方法的参数和返回值进行序列化 / 反序列化，支持 Go 的所有数据类型（包括自定义结构体）。
   - 优点：专为 Go 设计，支持复杂类型，序列化效率高，无需手动定义 IDL。
   - 缺点：仅支持 Go 语言，无法与其他语言的 RPC 客户端 / 服务端通信。

7. **问题**：`net/rpc`服务端如何同时支持 TCP 和 HTTP 两种传输方式？
   **答案**：
   可在同一服务进程中分别启动 TCP 监听器和 HTTP 监听器：

   go

   ```go
   // 注册服务
   rpc.Register(new(Arith))
   
   // 启动TCP服务
   go func() {
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }()
   
   // 启动HTTP服务
   rpc.HandleHTTP()
   http.ListenAndServe(":8080", nil)
   ```

8. **问题**：`net/rpc`客户端如何连接不同传输方式的服务端？
   **答案**：

   - 连接 TCP 服务：`client, err := rpc.Dial("tcp", "localhost:1234")`
   - 连接 HTTP 服务：`client, err := rpc.DialHTTP("tcp", "localhost:8080")`
     连接后使用统一的`Call`或`Go`方法调用 RPC，无需关心底层传输方式。

#### 进阶特性（9-15 题）

1. **问题**：`net/rpc`如何处理大尺寸数据的传输？需要注意什么？
   **答案**：

   - 处理方式：Gob 支持任意大小的数据传输，但大尺寸数据会占用更多内存和网络带宽。
   - 注意事项：
     - 避免一次性传输过大数据（如超过 100MB），可分片传输。
     - 大对象序列化 / 反序列化耗时，可能阻塞 Goroutine，建议异步处理。
     - 可在传输前压缩数据（如使用`gzip`）减少网络开销。

2. **问题**：`net/rpc`中如何实现服务端的并发处理？默认并发模型是什么？
   **答案**：

   - 并发模型：`net/rpc`服务端为每个新连接创建一个 Goroutine，每个连接上的 RPC 请求按顺序处理（单连接串行，多连接并行）。
   - 实现方式：无需额外配置，框架自动处理，开发者只需确保 RPC 方法线程安全（如使用锁保护共享资源）。

3. **问题**：如何在`net/rpc`中实现请求超时控制？
   **答案**：

   - 客户端连接超时：使用`net.DialTimeout`或`context.Dialer`设置连接超时。
   - 客户端调用超时：结合`time.After`和`select`监控异步调用的`done`通道。
     示例：

   go

   ```go
   // 连接超时
   client, err := rpc.DialTimeout("tcp", "localhost:1234", 5*time.Second)
   
   // 调用超时
   call := client.Go("Arith.Add", args, &reply, nil)
   select {
   case <-call.Done:
       // 处理结果
   case <-time.After(3*time.Second):
       // 超时处理
   }
   ```

4. **问题**：`net/rpc`的错误处理机制是什么？服务端如何向客户端传递自定义错误？
   **答案**：

   - 机制：RPC 方法返回的`error`会被序列化后传递给客户端，客户端`Call`方法返回的错误即为服务端返回的错误。
   - 自定义错误：服务端可返回`fmt.Errorf`或自定义错误类型（需实现`Error() string`方法），客户端通过类型断言解析。
     示例：

   go

   ```go
   // 服务端
   func (a *Arith) Divide(args *Args, reply *float64) error {
       if args.B == 0 {
           return fmt.Errorf("除数不能为0")
       }
       // ...
   }
   
   // 客户端
   err := client.Call("Arith.Divide", args, &reply)
   if err != nil {
       fmt.Println("服务端错误:", err.Error())
   }
   ```

5. **问题**：`net/rpc`服务如何优雅关闭？
   **答案**：

   1. 监听关闭信号（如`os.Interrupt`）。
   2. 关闭监听器，停止接收新连接。
   3. 等待现有连接处理完毕（可选）。
      示例：

   go

   运行

   ```go
   lis, _ := net.Listen("tcp", ":1234")
   go func() {
       sigChan := make(chan os.Signal, 1)
       signal.Notify(sigChan, os.Interrupt)
       <-sigChan
       lis.Close() // 关闭监听器
       fmt.Println("服务已关闭")
   }()
   rpc.Accept(lis) // 当lis关闭时，Accept会返回错误
   ```

6. **问题**：`net/rpc`中如何实现单向通知（客户端发送请求后无需等待响应）？
   **答案**：
   可通过以下方式模拟：

   - 服务端方法的`reply`参数设为`*struct{}`（空结构体），并始终返回`nil`。
   - 客户端使用`Go`方法调用，忽略`done`通道和结果。
     示例：

   go

   ```go
   // 服务端
   func (n *Notifier) Notify(msg string, reply *struct{}) error {
       fmt.Println("收到通知:", msg)
       return nil
   }
   
   // 客户端
   client.Go("Notifier.Notify", "hello", &struct{}{}, nil)
   ```

7. **问题**：`net/rpc`与`net/rpc/jsonrpc`的兼容性如何？能否混合使用？
   **答案**：

   - 不兼容：`net/rpc`使用 Gob 编码，`jsonrpc`使用 JSON 编码，协议格式不同。
   - 不能混合使用：Gob 客户端无法与 jsonrpc 服务端通信，反之亦然。需确保客户端和服务端使用相同的编码方式。

#### 实践与优化（16-20 题）

1. **问题**：`net/rpc`服务的性能瓶颈可能在哪里？如何优化？
   **答案**：

   - 瓶颈：单连接串行处理请求、Gob 编码开销、网络 IO。
   - 优化：
     - 客户端使用连接池复用连接，减少 TCP 握手开销。
     - 大对象传输前压缩（如`gzip`）。
     - 服务端使用多核 CPU（设置`GOMAXPROCS`）。
     - 拆分大服务为多个小服务，分散负载。

2. **问题**：如何为`net/rpc`服务添加日志记录，跟踪请求和响应？
   **答案**：
   可在 RPC 方法内部或通过包装器添加日志：

   go

   ```go
   type LoggedArith struct {
       Arith // 嵌入原始服务
   }
   
   func (l *LoggedArith) Add(args *Args, reply *int) error {
       log.Printf("收到Add请求: %+v", args)
       err := l.Arith.Add(args, reply)
       log.Printf("Add响应: %d, 错误: %v", *reply, err)
       return err
   }
   
   // 注册包装后的服务
   rpc.Register(new(LoggedArith))
   ```

3. **问题**：`net/rpc`服务如何实现身份验证？
   **答案**：
   可在 TCP 连接建立时进行认证，或在每个 RPC 方法中验证权限：

   - 连接级认证：在`Accept`前拦截连接，验证客户端身份（如令牌）。

   go

   ```go
   lis, _ := net.Listen("tcp", ":1234")
   for {
       conn, _ := lis.Accept()
       // 验证连接（如读取令牌）
       if !authenticate(conn) {
           conn.Close()
           continue
       }
       go rpc.ServeConn(conn)
   }
   ```

4. **问题**：`net/rpc`客户端如何处理服务端宕机或网络中断？
   **答案**：

   - 检测错误：通过`Call`或`Go`的返回错误判断连接状态（如`io.EOF`表示连接关闭）。
   - 自动重连：封装客户端，当检测到连接错误时尝试重新拨号。
     示例：

   go

   ```go
   func dialWithRetry(addr string) (*rpc.Client, error) {
       for {
           client, err := rpc.Dial("tcp", addr)
           if err == nil {
               return client, nil
           }
           time.Sleep(1 * time.Second)
       }
   }
   ```

5. **问题**：`net/rpc`适合哪些场景？不适合哪些场景？
   **答案**：

   - 适合场景：
     - 纯 Go 语言的分布式系统内部服务通信。
     - 对性能要求较高、交互频繁的服务调用。
     - 快速开发原型或中小型项目。
   - 不适合场景：
     - 需要跨语言通信（如 Go 与 Java 服务交互）。
     - 需要复杂特性（如流式通信、负载均衡）。
     - 对外开放的 API 服务（建议用 HTTP/REST）。

### 二、场景题（15 题）

#### 基础开发（1-5 题）

1. **场景**：使用`net/rpc`实现一个简单的计算器服务，支持加、减、乘、除四种操作。
   **答案**：

   go

   ```go
   // 服务端 (server.go)
   package main
   
   import (
       "errors"
       "net"
       "net/rpc"
   )
   
   type Args struct {
       A, B int
   }
   
   type Calculator int
   
   func (c *Calculator) Add(args *Args, reply *int) error {
       *reply = args.A + args.B
       return nil
   }
   
   func (c *Calculator) Subtract(args *Args, reply *int) error {
       *reply = args.A - args.B
       return nil
   }
   
   func (c *Calculator) Multiply(args *Args, reply *int) error {
       *reply = args.A * args.B
       return nil
   }
   
   func (c *Calculator) Divide(args *Args, reply *float64) error {
       if args.B == 0 {
           return errors.New("除数不能为0")
       }
       *reply = float64(args.A) / float64(args.B)
       return nil
   }
   
   func main() {
       calc := new(Calculator)
       rpc.Register(calc)
       lis, _ := net.Listen("tcp", ":1234")
       defer lis.Close()
       rpc.Accept(lis)
   }
   
   // 客户端 (client.go)
   package main
   
   import (
       "fmt"
       "net/rpc"
   )
   
   type Args struct {
       A, B int
   }
   
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       defer client.Close()
   
       args := &Args{10, 5}
       var addReply int
       client.Call("Calculator.Add", args, &addReply)
       fmt.Printf("10 + 5 = %d\n", addReply) // 15
   
       var divReply float64
       err := client.Call("Calculator.Divide", args, &divReply)
       if err == nil {
           fmt.Printf("10 / 5 = %.2f\n", divReply) // 2.00
       }
   }
   ```

2. **场景**：使用 HTTP 作为传输协议，实现一个`net/rpc`服务，客户端通过 HTTP 调用。
   **答案**：

   go

   ```go
   // 服务端 (http_server.go)
   package main
   
   import (
       "net"
       "net/http"
       "net/rpc"
   )
   
   type Greeter struct{}
   
   func (g *Greeter) Greet(name string, reply *string) error {
       *reply = "Hello, " + name
       return nil
   }
   
   func main() {
       rpc.Register(new(Greeter))
       rpc.HandleHTTP() // 注册HTTP处理器
       lis, _ := net.Listen("tcp", ":8080")
       http.Serve(lis, nil) // 启动HTTP服务
   }
   
   // 客户端 (http_client.go)
   package main
   
   import (
       "fmt"
       "net/rpc"
   )
   
   func main() {
       // 连接HTTP RPC服务
       client, _ := rpc.DialHTTP("tcp", "localhost:8080")
       defer client.Close()
   
       var reply string
       client.Call("Greeter.Greet", "Alice", &reply)
       fmt.Println(reply) // 输出：Hello, Alice
   }
   ```

3. **场景**：使用`rpc.Go`方法异步调用 RPC 服务，并处理多个并发请求。
   **答案**：

   go

   ```go
   package main
   
   import (
       "fmt"
       "net/rpc"
       "sync"
   )
   
   type Args struct {
       A, B int
   }
   
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       defer client.Close()
   
       argsList := []Args{{2, 3}, {5, 2}, {10, 4}}
       var wg sync.WaitGroup
       wg.Add(len(argsList))
   
       for i, args := range argsList {
           go func(idx int, a Args) {
               defer wg.Done()
               var reply int
               call := client.Go("Calculator.Multiply", &a, &reply, nil)
               <-call.Done // 等待调用完成
               if call.Error == nil {
                   fmt.Printf("任务 %d: %d * %d = %d\n", idx, a.A, a.B, reply)
               }
           }(i, args)
       }
   
       wg.Wait()
   }
   ```

4. **场景**：定义一个包含自定义结构体参数的 RPC 方法，实现复杂数据传输。
   **答案**：

   go

   ```go
   // 服务端与客户端共享的结构体定义
   type User struct {
       Name string
       Age  int
   }
   
   type UserRequest struct {
       UserID int
   }
   
   // 服务端
   type UserService int
   
   func (u *UserService) GetUser(req *UserRequest, reply *User) error {
       // 模拟数据库查询
       *reply = User{Name: "Alice", Age: 30}
       return nil
   }
   
   func main() {
       rpc.Register(new(UserService))
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }
   
   // 客户端
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       var user User
       client.Call("UserService.GetUser", &UserRequest{UserID: 1}, &user)
       fmt.Printf("%+v\n", user) // 输出：{Name:Alice Age:30}
   }
   ```

5. **场景**：为 RPC 服务添加参数校验，确保输入符合业务规则。
   **答案**：

   go

   ```go
   // 服务端
   type UserService int
   
   func (u *UserService) CreateUser(user *User, reply *int) error {
       // 校验参数
       if user.Name == "" {
           return errors.New("用户名不能为空")
       }
       if user.Age < 0 || user.Age > 150 {
           return errors.New("年龄无效")
       }
       // 模拟创建用户，返回ID
       *reply = 1001
       return nil
   }
   
   // 客户端
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       var userID int
       err := client.Call("UserService.CreateUser", &User{Name: "", Age: 200}, &userID)
       if err != nil {
           fmt.Println("创建失败:", err) // 输出错误信息
       }
   }
   ```

#### 进阶应用（6-10 题）

1. **场景**：实现 RPC 连接池，复用连接以提高性能（限制最大连接数为 10）。
   **答案**：

   go

   ```go
   package main
   
   import (
       "errors"
       "net/rpc"
       "sync"
   )
   
   type Pool struct {
       mu       sync.Mutex
       conns    chan *rpc.Client
       addr     string
       maxConns int
   }
   
   func NewPool(addr string, maxConns int) *Pool {
       return &Pool{
           addr:     addr,
           maxConns: maxConns,
           conns:    make(chan *rpc.Client, maxConns),
       }
   }
   
   // 获取连接
   func (p *Pool) Get() (*rpc.Client, error) {
       p.mu.Lock()
       defer p.mu.Unlock()
   
       select {
       case conn := <-p.conns:
           // 简单检查连接是否存活
           if err := conn.Ping(); err == nil {
               return conn, nil
           }
           // 连接已失效，创建新连接
           fallthrough
       default:
           if len(p.conns) < p.maxConns {
               conn, err := rpc.Dial("tcp", p.addr)
               return conn, err
           }
           return nil, errors.New("连接池已满")
       }
   }
   
   // 归还连接
   func (p *Pool) Put(conn *rpc.Client) {
       p.mu.Lock()
       defer p.mu.Unlock()
   
       select {
       case p.conns <- conn:
       default:
           // 连接池已满，关闭多余连接
           conn.Close()
       }
   }
   
   // 关闭连接池
   func (p *Pool) Close() {
       p.mu.Lock()
       defer p.mu.Unlock()
   
       close(p.conns)
       for conn := range p.conns {
           conn.Close()
       }
   }
   
   // 使用示例
   func main() {
       pool := NewPool("localhost:1234", 10)
       defer pool.Close()
   
       conn, _ := pool.Get()
       defer pool.Put(conn)
       // 调用RPC...
   }
   ```

2. **场景**：为 RPC 客户端添加超时控制，避免长时间阻塞。
   **答案**：

   go

   ```go
   package main
   
   import (
       "fmt"
       "net/rpc"
       "time"
   )
   
   type Args struct {
       A, B int
   }
   
   // 带超时的RPC调用
   func callWithTimeout(client *rpc.Client, serviceMethod string, args, reply interface{}, timeout time.Duration) error {
       call := client.Go(serviceMethod, args, reply, nil)
       select {
       case <-call.Done:
           return call.Error
       case <-time.After(timeout):
           return fmt.Errorf("调用超时（%v）", timeout)
       }
   }
   
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       defer client.Close()
   
       args := &Args{10, 3}
       var reply int
       err := callWithTimeout(client, "Calculator.Divide", args, &reply, 2*time.Second)
       if err != nil {
           fmt.Println("错误:", err)
       } else {
           fmt.Println("结果:", reply)
       }
   }
   ```

3. **场景**：实现 RPC 服务的优雅关闭，确保现有请求处理完毕再退出。
   **答案**：

   go

   ```go
   package main
   
   import (
       "log"
       "net"
       "net/rpc"
       "os"
       "os/signal"
       "sync"
       "syscall"
   )
   
   type Calculator int
   
   // ... 实现Calculator方法（省略）
   
   func main() {
       calc := new(Calculator)
       rpc.Register(calc)
       lis, _ := net.Listen("tcp", ":1234")
   
       var wg sync.WaitGroup
       quit := make(chan struct{})
   
       // 处理连接的Goroutine
       go func() {
           for {
               select {
               case <-quit:
                   return
               default:
                   conn, err := lis.Accept()
                   if err != nil {
                       log.Println("接受连接失败:", err)
                       return
                   }
                   wg.Add(1)
                   go func(c net.Conn) {
                       defer wg.Done()
                       rpc.ServeConn(c)
                   }(conn)
               }
           }
       }()
   
       // 监听关闭信号
       sigChan := make(chan os.Signal, 1)
       signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
       <-sigChan
       log.Println("开始关闭服务...")
   
       // 停止接受新连接
       lis.Close()
       close(quit)
   
       // 等待现有连接处理完毕
       wg.Wait()
       log.Println("服务已优雅关闭")
   }
   ```

4. **场景**：为 RPC 服务添加详细日志，记录请求参数、响应结果和耗时。
   **答案**：

   go

   ```go
   package main
   
   import (
       "log"
       "net/rpc"
       "time"
   )
   
   // 原始服务
   type Calculator struct{}
   
   func (c *Calculator) Add(args *Args, reply *int) error {
       *reply = args.A + args.B
       return nil
   }
   
   // 带日志的包装服务
   type LoggedCalculator struct {
       Calculator
   }
   
   func (l *LoggedCalculator) Add(args *Args, reply *int) error {
       start := time.Now()
       log.Printf("收到Add请求: A=%d, B=%d", args.A, args.B)
       
       err := l.Calculator.Add(args, reply)
       
       duration := time.Since(start)
       if err != nil {
           log.Printf("Add请求失败: 错误=%v, 耗时=%v", err, duration)
       } else {
           log.Printf("Add请求成功: 结果=%d, 耗时=%v", *reply, duration)
       }
       return err
   }
   
   func main() {
       // 注册带日志的服务
       rpc.Register(new(LoggedCalculator))
       // ... 启动服务（省略）
   }
   ```

5. **场景**：实现 RPC 客户端的自动重连机制，当连接断开时自动恢复。
   **答案**：

   go

   ```go
   package main
   
   import (
       "net/rpc"
       "sync"
       "time"
   )
   
   type AutoReconnectClient struct {
       mu      sync.Mutex
       client  *rpc.Client
       addr    string
       connected bool
   }
   
   func NewAutoReconnectClient(addr string) *AutoReconnectClient {
       c := &AutoReconnectClient{addr: addr}
       c.connect() // 初始连接
       return c
   }
   
   // 连接服务器
   func (c *AutoReconnectClient) connect() error {
       client, err := rpc.Dial("tcp", c.addr)
       if err != nil {
           c.connected = false
           return err
       }
       c.client = client
       c.connected = true
       return nil
   }
   
   // 带重连的Call方法
   func (c *AutoReconnectClient) Call(serviceMethod string, args, reply interface{}) error {
       c.mu.Lock()
       defer c.mu.Unlock()
   
       // 如果未连接，尝试重连
       if !c.connected {
           if err := c.connect(); err != nil {
               return err
           }
       }
   
       // 调用RPC
       err := c.client.Call(serviceMethod, args, reply)
       if err != nil {
           // 连接可能已断开，尝试重连一次
           c.connected = false
           if err := c.connect(); err != nil {
               return err
           }
           // 重连后再次尝试调用
           return c.client.Call(serviceMethod, args, reply)
       }
       return nil
   }
   
   // 使用示例
   func main() {
       client := NewAutoReconnectClient("localhost:1234")
       var reply int
       err := client.Call("Calculator.Add", &Args{2, 3}, &reply)
       // ...
   }
   ```

#### 综合实践（11-15 题）

1. **场景**：实现一个基于`net/rpc`的分布式计数器服务，支持多客户端并发递增。
   **答案**：

   go

   ```go
   // 服务端
   package main
   
   import (
       "net"
       "net/rpc"
       "sync"
   )
   
   type Counter struct {
       mu    sync.Mutex
       value int64
   }
   
   func (c *Counter) Increment(args struct{}, reply *int64) error {
       c.mu.Lock()
       c.value++
       *reply = c.value
       c.mu.Unlock()
       return nil
   }
   
   func (c *Counter) Get(args struct{}, reply *int64) error {
       c.mu.Lock()
       *reply = c.value
       c.mu.Unlock()
       return nil
   }
   
   func main() {
       counter := new(Counter)
       rpc.Register(counter)
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }
   
   // 客户端（并发测试）
   package main
   
   import (
       "fmt"
       "net/rpc"
       "sync"
   )
   
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       defer client.Close()
   
       var wg sync.WaitGroup
       wg.Add(1000)
   
       // 1000个并发递增
       for i := 0; i < 1000; i++ {
           go func() {
               defer wg.Done()
               var reply int64
               client.Call("Counter.Increment", struct{}{}, &reply)
           }()
       }
   
       wg.Wait()
       // 最终值应为1000
       var final int64
       client.Call("Counter.Get", struct{}{}, &final)
       fmt.Println("最终计数:", final)
   }
   ```

2. **场景**：使用`net/rpc`实现一个简单的消息推送服务，支持向指定客户端发送消息。
   **答案**：

   go

   ```go
   // 服务端
   package main
   
   import (
       "net"
       "net/rpc"
       "sync"
   )
   
   type Client struct {
       id     string
       conn   net.Conn
       replyCh chan string
   }
   
   type MessageService struct {
       clients map[string]*Client
       mu      sync.Mutex
   }
   
   // 客户端注册
   func (m *MessageService) Register(clientID string, reply *bool) error {
       // 获取当前连接（通过goroutine局部变量传递）
       conn := getCurrentConn() // 需自定义实现，通过ServeConn的参数获取
       m.mu.Lock()
       m.clients[clientID] = &Client{
           id:     clientID,
           conn:   conn,
           replyCh: make(chan string),
       }
       m.mu.Unlock()
       *reply = true
       return nil
   }
   
   // 发送消息
   func (m *MessageService) SendMessage(req struct{To, Msg string}, reply *bool) error {
       m.mu.Lock()
       client, ok := m.clients[req.To]
       m.mu.Unlock()
       if !ok {
           return fmt.Errorf("客户端 %s 未注册", req.To)
       }
       client.replyCh <- req.Msg
       *reply = true
       return nil
   }
   
   // 客户端接收消息（长轮询）
   func (m *MessageService) Receive(clientID string, reply *string) error {
       m.mu.Lock()
       client, ok := m.clients[clientID]
       m.mu.Unlock()
       if !ok {
           return fmt.Errorf("客户端未注册")
       }
       *reply = <-client.replyCh
       return nil
   }
   
   func main() {
       service := &MessageService{
           clients: make(map[string]*Client),
       }
       rpc.Register(service)
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }
   ```

3. **场景**：为 RPC 服务添加简单的令牌认证，只有携带有效令牌的客户端才能调用。
   **答案**：

   go

   ```go
   // 服务端
   package main
   
   import (
       "errors"
       "net"
       "net/rpc"
   )
   
   const validToken = "secret-token"
   
   // 带令牌的请求参数
   type AuthArgs struct {
       Token string
       Data  interface{} // 实际业务参数
   }
   
   type SecureCalculator int
   
   func (s *SecureCalculator) Add(args *AuthArgs, reply *int) error {
       // 验证令牌
       if args.Token != validToken {
           return errors.New("无效的令牌，拒绝访问")
       }
       // 解析实际参数
       realArgs := args.Data.(map[string]int)
       *reply = realArgs["A"] + realArgs["B"]
       return nil
   }
   
   func main() {
       rpc.Register(new(SecureCalculator))
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }
   
   // 客户端
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       args := &AuthArgs{
           Token: "secret-token",
           Data:  map[string]int{"A": 5, "B": 3},
       }
       var reply int
       err := client.Call("SecureCalculator.Add", args, &reply)
       if err == nil {
           fmt.Println("结果:", reply) // 8
       } else {
           fmt.Println("错误:", err)
       }
   }
   ```

4. **场景**：实现 RPC 服务的批量请求处理，一次调用处理多个子请求。
   **答案**：

   go

   ```go
   // 服务端
   package main
   
   import (
       "net"
       "net/rpc"
   )
   
   type BatchRequest struct {
       Operations []struct {
           Type string // "add", "multiply"
           A, B int
       }
   }
   
   type BatchResponse struct {
       Results []int
       Errors  []error
   }
   
   type BatchService int
   
   func (b *BatchService) Process(req *BatchRequest, reply *BatchResponse) error {
       reply.Results = make([]int, len(req.Operations))
       reply.Errors = make([]error, len(req.Operations))
   
       for i, op := range req.Operations {
           switch op.Type {
           case "add":
               reply.Results[i] = op.A + op.B
           case "multiply":
               reply.Results[i] = op.A * op.B
           default:
               reply.Errors[i] = fmt.Errorf("未知操作类型: %s", op.Type)
           }
       }
       return nil
   }
   
   func main() {
       rpc.Register(new(BatchService))
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }
   
   // 客户端
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       req := &BatchRequest{
           Operations: []struct {
               Type string
               A, B int
           }{
               {"add", 2, 3},
               {"multiply", 4, 5},
               {"unknown", 1, 1},
           },
       }
       var reply BatchResponse
       client.Call("BatchService.Process", req, &reply)
       for i, res := range reply.Results {
           if reply.Errors[i] != nil {
               fmt.Printf("操作 %d: 错误 - %v\n", i, reply.Errors[i])
           } else {
               fmt.Printf("操作 %d: 结果 - %d\n", i, res)
           }
       }
   }
   ```

5. **场景**：结合`context`实现 RPC 服务的分布式追踪（传递追踪 ID）。
   **答案**：

   go

   ```go
   // 服务端
   package main
   
   import (
       "context"
       "log"
       "net"
       "net/rpc"
   )
   
   // 自定义请求类型，包含追踪ID
   type TraceableRequest struct {
       TraceID string
       Args    interface{}
   }
   
   type Calculator int
   
   func (c *Calculator) Add(req *TraceableRequest, reply *int) error {
       // 记录追踪ID
       log.Printf("TraceID: %s, 处理Add请求", req.TraceID)
       // 解析参数
       args := req.Args.(*Args)
       *reply = args.A + args.B
       return nil
   }
   
   func main() {
       rpc.Register(new(Calculator))
       lis, _ := net.Listen("tcp", ":1234")
       rpc.Accept(lis)
   }
   
   // 客户端
   package main
   
   import (
       "context"
       "fmt"
       "net/rpc"
       "github.com/google/uuid"
   )
   
   // 封装带追踪的调用
   func tracedCall(ctx context.Context, client *rpc.Client, serviceMethod string, args, reply interface{}) error {
       traceID := ctx.Value("traceID").(string)
       req := &TraceableRequest{
           TraceID: traceID,
           Args:    args,
       }
       return client.Call(serviceMethod, req, reply)
   }
   
   func main() {
       client, _ := rpc.Dial("tcp", "localhost:1234")
       // 生成追踪ID
       traceID := uuid.New().String()
       ctx := context.WithValue(context.Background(), "traceID", traceID)
       
       var reply int
       err := tracedCall(ctx, client, "Calculator.Add", &Args{3, 4}, &reply)
       if err == nil {
           fmt.Printf("TraceID: %s, 结果: %d\n", traceID, reply)
       }
   }
   ```

   

   

   

   ![img](data:image/png;base64,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)

### 总结

以上题目聚焦 Go 内置`net/rpc`的快速开发实践，从基础的服务注册、方法调用，到进阶的连接池、超时控制、身份验证，再到综合场景的分布式计数器、批量处理等，覆盖了实际开发中常见的需求。通过这些练习，可以掌握`net/rpc`的核心用法和优化技巧，快速构建可靠的 Go 语言 RPC 服务。