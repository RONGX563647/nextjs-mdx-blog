- 本视频详细讲解了Go语言中的集合类型数据结构，重点介绍了数组、切片、map和list四种集合类型。特别强调了切片和map的重要性，以及它们在实际开发中的应用。同时，详细阐述了数组的定义、操作及其与切片之间的区别，包括数组类型与元素数量之间的关系，以及数组遍历的方法。此外，还提到了Go语言中数组的一些特殊用法和注意事项。整体而言，该内容旨在帮助观众深入理解Go语言中集合类型的使用方法和技巧。

- 分段总结

  折叠

  00:01Go语言中的集合类型

  1.Go语言提供了多种集合类型的数据结构，包括数组、切片、map和list。 2.数组和list在实际开发中使用较少，重点讲解切片和map。

  01:56Go语言数组的基本用法

  1.数组定义：类型在前，变量名在后，数量在中间。 2.数组类型：不同元素数量的数组类型不同，不能直接赋值。 3.数组操作：可以修改值，但不能跨数量赋值。 4.数组长度固定，性能高。

  08:07数组的遍历

  1.使用for range遍历数组，获取索引和值。 2.切片在用法上与数组相似，但有区别。

#### 一、数组的基本用法 ﻿00:02﻿

##### 1. Go语言集合类型 ﻿00:13﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116002&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-HSLK7%2FpRhOIg49vf9cCEOO%2FimIw%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-78ac7c1ca1ac34eb9681a5581a60e56fc56ec332ee28ee630dd9497732654ff11446e71d551cb7ddeec8a49a816d59c47053e340aa065f00305a5e1275657320&expires=8h&r=268119601&vbdid=-&fin=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-1&fn=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-1&rtype=1&dp-logid=8949665976731524708&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=7717645f262844cad63a337261ba09ef1ce192cb22c1b6da&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 四种基本结构：数组、切片(slice)、map、list
- 使用频率：最常用的是切片和map，数组和list使用较少
- 性能特点：数组长度固定，性能较高

###### 1）数组 ﻿01:59﻿

- 数组的定义 

  02:13

  - ![img](https://bdcm01.baidupcs.com/file/p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116002&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-TT2VFVicTebs7w471V3aMAm4HN0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e7105ba07a312ebf0cf758cae2f643cac9bc0926e3732cf6ba7b4d8770782eebcae50cb0ab18b1a2b4f82bb6f973f1a1f023fc71ee7a990d305a5e1275657320&expires=8h&r=735728931&vbdid=-&fin=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-2&fn=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-2&rtype=1&dp-logid=8949665976731524708&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=5eee304bbb22b9c2b6e12d2bd14114dd1c796be9981f55fb60f1fd2882e1895f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 语法格式：var name [count]Type
  - 类型特点：数组类型包含元素数量信息，如[3]string和[4]string是不同类型
  - 示例：
  - 类型打印：使用fmt.Printf("%T", array)可显示完整类型信息，包含元素数量
  - ![img](https://bdcm01.baidupcs.com/file/p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116002&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-DYKjfRaVO4Wzd1OEr%2BKl7CvfhaM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b4e04cb76870c143ba623369de8e8e1692bcfc928c407b27f8ebbedb34c23604e5ffb780a43fa12e0a366913a8e5525d4737a34afb5414e9305a5e1275657320&expires=8h&r=908875593&vbdid=-&fin=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-3&fn=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-3&rtype=1&dp-logid=8949665976731524708&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=7717645f262844ca5d56a4409b209f551ce192cb22c1b6da&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 赋值限制：不同长度的数组不能相互赋值，如courses1 = courses2会导致类型不匹配错误

- 数组的遍历 

  08:15

  - ![img](https://bdcm01.baidupcs.com/file/p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116002&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-GBX0h8cJObP8%2BrjQV7MYsGCBkWA%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-0e3ecf8b93e1e80cd23180b3384d9ce1c0d93077a9ac1a6a387b2f311a66a67b1361415f354748617fcea329dea349859f2f3c2622289a93305a5e1275657320&expires=8h&r=360059117&vbdid=-&fin=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-4&fn=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-4&rtype=1&dp-logid=8949665976731524708&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=5eee304bbb22b9c2b94d4c3788c069c51c796be9981f55fb60f1fd2882e1895f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 遍历方法：使用for range循环
  - 示例代码：
  - 元素访问：通过下标访问，如courses1[0] = "go"，下标从0开始

##### 2. 结束 ﻿09:19﻿

- ![img](https://bdcm01.baidupcs.com/file/p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116003&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-BdC3U0nzCYPfi26n4wOmAUWmGiE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-8b00d0fd6cb89478149c7eb9c9d3cf60ede25a28c7b123b4f091db5fc0794081a5b977a922292142ac9ebdad0b37ce5684265aec665b7408305a5e1275657320&expires=8h&r=215842353&vbdid=-&fin=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-5&fn=p-3a78a9dd35e365a212cf47c077eb5b2a-40-2025042100-5&rtype=1&dp-logid=8949665976731524708&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=a5f92b9aebde11e52e423028fca05fd9ffc1e203d84458d9&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 基本操作：包括定义、赋值、遍历
- 与切片区别：数组长度固定，切片长度可变，两者类型不同
- 使用场景：元素数量固定且不变时使用数组性能更优

#### 二、知识小结

| 知识点         | 核心内容                                       | 考试重点/易混淆点                           | 难度系数 |
| -------------- | ---------------------------------------------- | ------------------------------------------- | -------- |
| Go语言集合类型 | 数组、切片(slice)、map、列表(list)四种数据结构 | 切片与数组的本质区别（类型系统差异）        | ⭐⭐       |
| 数组定义语法   | var name [count]type（类型声明在数组长度前）   | 元素数量属于类型系统（[3]string≠[4]string） | ⭐⭐⭐⭐     |
| 数组类型特性   | 固定长度、高性能、元素可修改                   | 不同长度数组属于不同类型（不可直接赋值）    | ⭐⭐⭐      |
| 切片与数组对比 | 切片不声明长度（动态数组）、数组长度固定       | 语法相似但类型不同（[]string vs [3]string） | ⭐⭐⭐⭐     |
| 数组遍历方法   | for index,value := range array{...}            | 匿名变量使用技巧（for _,value）             | ⭐⭐       |
| 数组性能优势   | 长度固定带来内存连续分配优势                   | 适用确定元素数量的场景                      | ⭐⭐⭐      |

- 该视频主要讲述了数组初始化的多种方法及其在Go语言中的应用。首先介绍了直接在定义时通过大括号初始化数组的方式，并指出可以省略类型声明。接着展示了部分位置初始化的灵活性，以及使用省略号自动推断数组长度的技巧。最后，还介绍了通过for range循环遍历数组的方法，强调了掌握这些初始化与遍历技巧的重要性，以提高编程的灵活性和效率。

- 分段总结

  折叠

  00:01数组的初始化

  1.数组的初始化方法简单，可以直接在定义时进行初始化。 2.使用大括号初始化数组，大括号内放置初始值。 3.初始化时可以省略类型声明，但声明也不会出错。

  01:12数组初始化的简化方法

  1.数组初始化可以进一步简化，例如使用类型字面量进行初始化。 2.初始化时可以在大括号内放置任意数量的初始值，数组长度自动调整。 3.默认情况下，未初始化的数组元素为该类型的零值。

  02:32数组初始化的常用方法

  1.数组初始化有四种常用方法：显式指定长度、省略类型声明、使用省略号、使用for循环。 2.显式指定长度：在定义时指定数组的长度和初始值。 3.省略类型声明：在定义时只指定初始值，省略类型声明。 4.使用省略号：在定义时使用省略号表示可变数量的元素。 5.使用for循环：在定义时使用for循环进行初始化。

  04:35数组的遍历方法

  1.数组的遍历可以使用for循环和for range语句。 2.for循环：通过索引遍历数组，适用于需要具体索引的操作。 3.for range：通过迭代遍历数组，适用于不需要索引的操作。

#### 一、数组的初始化 ﻿00:03﻿

##### 1. 数组初始化示例 ﻿00:08﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116623&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-U0VexDqCf4s04xosKZ85xF1rxMo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-6bd6ecf7473a926f07ab742ac442a36ac3a28e67609b0abbce2f832a2e8f4c3e6e5275cea3ba5bf5b97e2250719ec8c37860a59e1a649639305a5e1275657320&expires=8h&r=151245270&vbdid=-&fin=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-1&fn=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-1&rtype=1&dp-logid=8949832784505045711&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=a7e1f23860a769ab62a02d5a82ac3ae50c123648b9b90e5d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 基本语法: 使用 var name [count]type 定义数组，如 var courses1 [3]string 定义包含3个字符串元素的数组
- 赋值方式: 通过索引单独赋值，如 courses1[0] = "go"，courses1[1] = "grpc"，courses1[2] = "gin"
- 类型特性: [3]string 和 [4]string 是两种完全不同的数组类型
- ![img](https://bdcm01.baidupcs.com/file/p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116623&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-61uc40FtF4UELl07xsRtssRRg%2Bg%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-ff4cc700be4ecb2a0c895ec60766815bd20ce53c8065cbc11a8abe1e7553c49d0ad2afd6dafd407fc7de290349f796434be79f00779e545a305a5e1275657320&expires=8h&r=732067560&vbdid=-&fin=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-2&fn=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-2&rtype=1&dp-logid=8949832784505045711&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca44342240fa99746fc1e294a41894ad85305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 打印方法: 使用 fmt.Println(courses1) 打印整个数组，或使用 for _, value := range courses1 遍历打印每个元素

##### 2. 数组初始化的四种用法 ﻿02:33﻿

###### 1）数组的初始化一 ﻿02:40﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116623&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-kg7DLJMVU3CBF0r5gQtAyWnD5nI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-91bd31f23f62c7e49d7bcf153fb26cff0f5620756d7a9f3d5ffad8bfe16bf3d7c6929706c9007fab8bd9f9fe2721acd4ddbec094ddf05aff305a5e1275657320&expires=8h&r=789966840&vbdid=-&fin=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-3&fn=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-3&rtype=1&dp-logid=8949832784505045711&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=3612dd02eb4608abbfcd971e5877805e0c123648b9b90e5d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 标准形式: var courses1 [3]string = [3]string{"go", "grpc", "gin"}
- 类型推导: 类型声明可省略为 courses1 := [3]string{"go", "grpc", "gin"}，编译器会自动推导类型
- 注意事项: 虽然显式声明类型不会出错，但IDE会提示类型声明冗余（显示为灰色）

###### 2）数组的初始化二 ﻿02:51﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116623&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-bpD5RfGL9XDFVT5cvcMlb8EFR5w%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-3fc1165f261cee51b83b39e6896f0283c14b48f64e2baee856b75235acae8bc4dd7a43897cfe6ef9f64e8f8744ddda80c13b1d5ef4d5945e305a5e1275657320&expires=8h&r=231083183&vbdid=-&fin=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-4&fn=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-4&rtype=1&dp-logid=8949832784505045711&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca56afef5411c6cb25c1e294a41894ad85305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 特定索引赋值: 使用 courses2 := [3]string{2:"gin"} 只在索引2位置赋值
- 默认值规则: 未赋值的元素会自动初始化为该类型的零值（字符串为空字符串）
- 调试验证: 通过debug可看到数组实际值为 ["", "", "gin"]

###### 3）数组的初始化三 ﻿03:14﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116623&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-CceNEga%2BEJGdtHdYnO9cCv9SCPM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-32c21381dfc429fb3346c1aa91243c1a8ee942e85d11d0deb27e212ffc127278fae875e7f6b5092a8f6856ebb2fe3e968c030604f3519885305a5e1275657320&expires=8h&r=569471610&vbdid=-&fin=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-5&fn=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-5&rtype=1&dp-logid=8949832784505045711&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=3612dd02eb4608aba4eeb7dd13cdd2d30c123648b9b90e5d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 省略号语法: 使用 courses3 := [...]string{"go", "grpc", "gin"} 让编译器自动计算长度
- 长度自适应: 放入2个元素则长度为2，放入3个则长度为3
- 类型本质: 仍然是固定长度数组，只是长度由初始化元素数量决定

###### 4）数组的初始化四 ﻿04:29﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116623&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-C2sb0%2BwPcE%2BA9iuTZHegFn4CBL0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-449de899a2cdbf02de0f4bc94049a34b1cfd4c77240a7e048e82414090d110202c4f8863e58cae512a8cef3e183d95057a56a5e78bc28337305a5e1275657320&expires=8h&r=381281204&vbdid=-&fin=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-6&fn=p-9cfd28fd69c36e7bc9856bfd72d30179-40-2025042100-6&rtype=1&dp-logid=8949832784505045711&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121caae339351eea0af8e02592a47fe36f5c6&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 遍历方式1: 使用 for i := 0; i < len(courses3); i++ 配合索引访问
- 遍历方式2: 使用 for _, value := range courses3 的range语法
- 选择建议: 两种方式在不同场景各有优势，都需要掌握

#### 二、知识小结

| 知识点             | 核心内容                                                     | 考试重点/易混淆点                              | 难度系数 |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------- | -------- |
| 数组初始化基础语法 | 直接通过大括号赋值（如 [3]string{"Go", "gRPC", "进阶"}），类型可自动推导 | 类型声明可省略（[...]string vs [N]string）     | ⭐⭐       |
| 简化初始化写法     | 使用省略号（[...]string{"值1", "值2"}）动态确定数组长度      | 省略号用法与固定长度声明的区别                 | ⭐⭐       |
| 部分初始化与默认值 | 指定索引位置赋值（如 [3]string{2: "进阶"}），未赋值位置为类型零值（如 string 默认为空） | 默认值规则（不同数据类型的零值差异）           | ⭐⭐⭐      |
| 数组遍历方法       | for range 和传统 for 循环（for i:=0; i<len; i++）的对比      | 两种方法的适用场景与性能差异                   | ⭐⭐       |
| 多维数组与比较     | 预告下节课内容：多维数组结构及数组间比较操作                 | 数组比较的条件（长度、类型、元素值需完全一致） | ⭐⭐⭐      |

- 该视频主要讲述了数组之间的比较以及多维数组的定义和应用。首先，视频强调了在进行数组比较时，必须确保数组的长度相同，并且数组中的元素类型也要相同。接着，视频介绍了多维数组的概念，并通过实例演示了如何使用多维数组来存储和访问课程的基本信息，如课程名、时长和教师等。最后，视频展示了如何打印多维数组中的信息，提供了两种打印方式。通过该视频，观众可以深入了解数组比较和多维数组的应用，为编程实践提供有力的支持。

- 分段总结

  折叠

  00:01数组比较的基本规则

  1.数组比较首先检查长度是否相同，长度不同的数组不能直接比较。 2.长度相同的数组可以直接比较对应元素是否相等。 3.多维数组的比较规则与一维数组类似，首先比较长度，然后逐元素比较。

  01:53多维数组的定义与访问

  1.多维数组的定义方式与其他编程语言类似，可以定义指定行数和列数的数组。 2.通过指定索引访问多维数组中的元素，例如array[i][j]表示第i行第j列的元素。 3.多维数组可以存储更丰富的信息，适用于存储表格或结构化数据。

  05:22多维数组的打印方法

  1.打印多维数组时，可以使用嵌套循环遍历数组元素并逐行打印。 2.使用for range循环可以更简洁地遍历数组元素并进行打印。 3.通过格式化输出，可以更清晰地展示多维数组的内容。

#### 一、数组之间的比较 ﻿00:02﻿

##### 1. 数组类型定义

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116832&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-EK%2FEyuYS3i962hzY5PDrUCFLvvo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-5512464843f9701b5c655c32123f0f6bc2d931809d11b030d754fcc10e51b52c682987cce398c2f5d67e9c4db3c2efa80fba07ffd36fb827305a5e1275657320&expires=8h&r=398848385&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-1&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-1&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=4d291be9b9421959bfcd971e5877805e023ed3d583c909bb&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 类型特性

  ：Go语言中数组是固定长度的集合类型，定义方式为

  ﻿var name [count]intvar\ name\ [count]intvar name [count]int﻿

- 类型严格性

  ：[]string和

  ﻿[3]string[3]string[3]string﻿

  是两种完全不同的类型，长度不同则类型不同

- 示例代码：

##### 2. 数组初始化方式

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116832&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2B13zyT7QLD9P%2BQZhM2ZvhrHNcqI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-dbb030ba194e65a6c29df38fddd074d2fe3df87bd7060c853aea114f927d0d58ae8570b2d8506b18cd95a9c7867a329beff9aa27cc4f3cbc305a5e1275657320&expires=8h&r=937279085&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-2&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-2&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=12146e4ffd7df3c9bc45b0a9363017651a2bdaa272f2ba51305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 显式长度初始化：

- 隐式长度初始化：使用[...]语法自动推断长度

- 遍历方式

  ：

  - 传统for循环：

    ﻿for i:=0;i<len(courses3);i++for\ i:=0; i<len(courses3); i++for i:=0;i<len(courses3);i++﻿

  - range遍历：

    ﻿for ,value:=rangecourses3for\ _, value := range courses3for ,value:=rangecourses3﻿

##### 3. 数组比较规则

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116832&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-pdTfx5j0CDa%2FEw2VO3H3mfoppgk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-8516ff595cbf1acabedbb06dee02182a954c67df1692adf6c1d81657eb514634a4f61a9b8165cda8069361279eec1107ddb54f16d61aad69305a5e1275657320&expires=8h&r=186307507&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-3&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-3&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=cf87eda222dfadb772972c81ee53d493023ed3d583c909bb&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 类型一致性：比较的数组必须是相同类型（包括元素类型和长度）
- 值比较机制：当类型相同时，会逐个比较元素值

##### 4. 比较实例分析

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116832&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-819UP%2BoFRY44OMLjdUZWISjMB%2BE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-28c10aec5ee4c20531748a3bdba3894cacb479fa602102a542c229b89695584d81112486d61dc6afe8434f2e7fe1d09d7e494d6dd983a6eb305a5e1275657320&expires=8h&r=186061341&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-4&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-4&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=83f2b583554fba15b5814bdd3b617ecb8e18c3df29f6163d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 不等案例：

- 相等条件

  ：

  - 类型完全相同（元素类型+数组长度）
  - 所有对应位置的元素值相等
  - 示例：

##### 5. 比较注意事项

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116833&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2FI2PS3iNT3yaDSSCvcRsvr0lvo8%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-d2bc99de46c85375bf77bf921db95e4fba9a3a83edd0d1940063f5be2311e1b2418478e8f95388104fe86f768cfd564de07cb7f74f219fcd305a5e1275657320&expires=8h&r=341060199&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-5&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-5&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e80686faf624695b8f8f899a725d56fb7583760f1fd2882e1895f&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 长度优先：比较前会先检查数组长度是否一致
- 元素顺序敏感：元素的比较严格按照索引顺序进行
- 性能优势：直接比较比手动遍历比较更高效

#### 二、多维数组的定义及操作 ﻿01:53﻿

##### 1. 多维数组的定义 ﻿02:04﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116833&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-FOzUR%2BHN8T1m9g%2FZ1%2FZNXjmnrUY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-64640cc539632e7803f51d62cacd7897a9007aef9d0a127b2cc6fc332fd386d1a1832c0f3fb5d94445d4aa9ebfc9cf062d0b6b69e1b89f49305a5e1275657320&expires=8h&r=909304608&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-6&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-6&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=875e0ff32ac7bd89b7db44095cce31dd52da96ddd097db9d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 语法结构：使用var 数组名 [行数][列数]元素类型定义，如var arr [3][4]string定义3行4列的字符串数组
- 维度说明：第一个方括号表示行数，第二个方括号表示列数，与其他编程语言的多维数组定义方式一致
- 内存布局：多维数组在内存中仍然是连续存储，按行优先顺序排列

##### 2. 多维数组的初始化 ﻿02:47﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116833&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-b2uJOhM3FcD8dnKPaV25MGlpULA%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b5818816ea957866ac610fec122424d911f0ee553a138b90369af4eb7048ec9921dfbcd0a984138bad7f1b28422e10fa6125504fc6762f33305a5e1275657320&expires=8h&r=893010053&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-7&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-7&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068c32f23017ea016b099a725d56fb75837c48031c257b32a4e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 逐行初始化：可通过数组名[行号] = [列数]元素类型{值1,值2...}方式初始化，如：
- 元素赋值：支持通过数组名[行][列] = 值方式单独赋值，如：
- 实际应用：适合存储结构化数据，每行表示一个记录，每列表示不同属性（如课程名、时长、讲师等）

##### 3. 多维数组的打印 ﻿05:22﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-8?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116833&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-b2FG%2FbQLTk%2BxpvvPK398T7wIZoM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-9a133f0c2cb5e33aea8377fd5675f5e41ee7abb6d22e7800519d43929df08ec5d942967e8bb86635fb2867857cdfe2ba09d3560d2aa85500305a5e1275657320&expires=8h&r=474680721&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-8&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-8&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=b3434a369726e9249598d5fd5939298999a725d56fb75837c48031c257b32a4e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 双重循环法：
- range遍历法：
- 整行打印：直接使用fmt.Println(row)可打印整行数据，会自动添加方括号格式化输出

##### 4. 例题1:多维数组的遍历与打印 ﻿07:12﻿

- ![img](https://bdcm01.baidupcs.com/file/p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-9?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756116833&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-mae3cBzT3Hefd1DK7OUSX3LztfI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e95eae1f171715f6464f524ce543b9117859fd3edd21a803ed451bf1ad57d77d2537876755d089a47ab444a6d36dd3d89ef48316b27d1fb6305a5e1275657320&expires=8h&r=880995110&vbdid=-&fin=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-9&fn=p-e3c21fc8f8dfbc8fddc03db98da8653c-40-2025042100-9&rtype=1&dp-logid=8949888930961128658&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068b85158c4a6b08351f66163f1552cc71b305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 数据结构设计

  ：

  - 第0列：课程名称（如"go"）
  - 第1列：课程时长（如"1h"）
  - 第2列：授课老师（如"bobby"）
  - 第3列：课程描述（如"go体系课"）

- 打印技巧

  ：

  - 使用fmt.Print替代fmt.Println避免自动换行
  - 在列间添加空格提高可读性
  - 每行结束后使用fmt.Println()换行

- 长度获取

  ：

  - len(arr)获取行数
  - len(arr[i])获取第i行的列数

- 格式化输出：最终输出效果为：

#### 三、知识小结

| 知识点        | 核心内容                                      | 易混淆点                             | 难度系数 |
| ------------- | --------------------------------------------- | ------------------------------------ | -------- |
| 数组比较      | 数组比较需长度和元素类型相同                  | 类型不同无法比较 vs 长度不同无法比较 | ⭐⭐       |
| 一维数组定义  | 使用array关键字定义，可存储课程名称等简单信息 | 单维数组 vs 多维数组应用场景         | ⭐        |
| 二维数组优势  | 可存储结构化数据（课程名/时长/老师/简介）     | 行优先存储 vs 列优先存储             | ⭐⭐⭐      |
| 多维数组访问  | 通过array[i][j]访问特定元素                   | 索引从0开始 vs 从1开始的语言差异     | ⭐⭐       |
| 数组遍历方法  | 嵌套for循环 vs for-range循环两种方式          | 传统索引遍历 vs 迭代器遍历效率       | ⭐⭐       |
| 格式化输出    | 使用fmt.Print控制空格和换行                   | 自动格式化 vs 手动控制格式           | ⭐        |
| 多维slice关联 | 多维数组是多维slice的基础                     | 固定长度数组 vs 动态长度slice        | ⭐⭐⭐      |

 

- 本视频主要讲解了编程语言中切片（Slice）的定义、作用与使用方法。切片是一种动态数据结构，类似于其他语言中的动态数组或列表，允许在运行时添加或删除元素。在静态语言中，数组长度固定，不能动态改变，而切片则提供了这种灵活性。在Go语言中，切片基于数组但进行了扩展，使其成为动态可变的数据结构。切片的使用包括定义、赋值、追加元素等操作，与数组相似但更加灵活。视频还强调了切片的底层实现与数组的关系，以及在使用切片时需要注意的一些细节和技巧，如正确使用追加元素的方法和打印切片的值等。通过本讲解，旨在帮助学习者更好地理解和掌握切片的使用方法和技巧。

- 分段总结

  折叠

  00:01切片的基本概念

  1.切片是Go语言中非常重要的数据结构，类似于其他语言中的动态数组或列表。 2.切片的底层是数组，但提供了动态扩展的功能。 3.切片可以动态地添加和删除元素，符合现代编程中动态数据的使用习惯。

  00:38切片的定义和初始化

  1.切片的定义与数组类似，但不需要指定长度。 2.切片的类型可以是任意数据类型，包括基本类型和复杂数据结构。 3.切片可以包含其他切片，具有灵活的嵌套能力。

  04:56切片的操作

  1.可以向切片中追加元素，使用内置的append函数。 2.append函数的第一个参数必须是切片，第二个参数是要追加的值或另一个切片。 3.可以使用for range循环来遍历切片中的元素。 4.可以打印切片的内容，使用print或fmt包中的格式化函数。

  07:07切片的初始化

  1.可以通过多种方式初始化切片，包括直接赋值、使用make函数等。 2.make函数用于创建一个指定长度和容量的切片。 3.切片的容量可以动态调整，方便在实际应用中使用。

- 重点

  

#### 一、切片 ﻿00:02﻿

##### 1. 切片的定义和赋值 ﻿00:35﻿

###### 1）切片的定义 ﻿03:32﻿

- ![img](https://bdcm01.baidupcs.com/file/p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756119842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-2tQy3eXsW00f5ffG6FVK3gtpr7Q%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-658bc99f2d6348279b147515dcd74ef0b64fc8f8318efc618c089f9aed9b386852fceaab9fb2ba4121611ae42c1187319d3ed7ebc54a6faa305a5e1275657320&expires=8h&r=587526319&vbdid=-&fin=p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-1&fn=p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-1&rtype=1&dp-logid=8950696931558437175&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=4126a8bea2f5ff03d442d91ff8c6edef29a9b7a7983f5e02&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 底层结构: 切片底层实际上是数组，但提供了动态数组的功能

- 与数组区别

  :

  - 数组长度固定，不能动态增减元素
  - 切片长度可变，可以动态追加元素

- 语法特点

  :

  - 定义时不指定长度：var courses []string
  - 类型推导显示为切片类型：[]string
  - 可以嵌套定义：[][]string或[][4]int

###### 2）切片的赋值 ﻿05:20﻿

- ![img](https://bdcm01.baidupcs.com/file/p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756119842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-xKEupLB2XyGUPpa9tKlTdVOi3GU%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-c55a2d9df1a46eaa7710475b6c0508bdb7c62392bcd9344a727bf7e3311312e6e8a1e756dcea9622484c6572173be5325eff633ae7d2e2c6305a5e1275657320&expires=8h&r=326944294&vbdid=-&fin=p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-2&fn=p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-2&rtype=1&dp-logid=8950696931558437175&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068230408e99c62dfff458619884dea0bb7305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 赋值方法

  :

  - 使用append函数：courses = append(courses, "go")
  - 必须接收返回值：因为切片底层数组可能重新分配

- 动态特性

  :

  - 可以连续追加：append(courses, "grpc")
  - 支持多值追加：append(courses, "gin", "mysql")

- 特殊语法

  :

  - 第一个参数必须是切片变量
  - 返回值必须重新赋值给原变量

###### 3）切片的打印 ﻿06:09﻿

- ![img](https://bdcm01.baidupcs.com/file/p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756119842&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-xTdKdNq1fC7K0lE%2B2djN%2BTKFfUU%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-0e29fbf01b4f2a4eccfa3586cf008ad3df9ed0effa789dbae6f0255ba92e1b19ea18aa8a1fa08a3fdc20ec8f769ede0fde9c9c0f9dbdef21305a5e1275657320&expires=8h&r=643195496&vbdid=-&fin=p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-3&fn=p-4134e2e0baef56ead9711b4d5b5c51a1-40-2025042100-3&rtype=1&dp-logid=8950696931558437175&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=eae2efe893f98aac2c72557199f0d9e5458619884dea0bb7305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 打印方法

  :

  - 整体打印：fmt.Println(courses)
  - 单个元素访问：fmt.Println(courses[0])
  - 类型查看：fmt.Printf("%T", courses)

- 遍历方式

  :

  - 使用for range循环
  - 索引访问与数组相同

- 输出格式

  :

  - 打印结果包含方括号：[go grpc gin]
  - 类型显示为切片类型：[]string

#### 二、知识小结

| 知识点         | 核心内容                                            | 易混淆点/注意事项                                            | 难度系数 |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------ | -------- |
| 切片定义与特性 | Go语言中基于数组的动态数据结构，支持动态扩容        | 切片声明时不能指定长度，与静态数组区分                       | ⭐⭐       |
| 切片底层原理   | 底层仍为数组，通过弱化数组功能+增强动态特性实现折中 | 静态语言中数组长度不可变，动态语言中类似列表（如PHP的array） | ⭐⭐⭐      |
| 切片初始化     | var courses []string，类型为切片而非无长度数组      | 可嵌套（如切片中放数组或其他切片）                           | ⭐⭐       |
| 切片操作       | 使用append函数追加元素（需接收返回值）              | 直接修改原切片无效，必须重新赋值                             | ⭐⭐⭐⭐     |
| 切片与数组对比 | 数组长度固定，切片动态扩展；数组类型随长度变化      | Go语言刻意弱化数组，推荐使用切片                             | ⭐⭐⭐      |
| 切片使用示例   | append(courses, "Go")、索引访问（courses[0]）       | for range遍历与数组语法相同                                  | ⭐⭐       |

  

- 该视频主要讲述了Python和Go语言中切片的初始化和使用。在Python部分，视频详细解释了切片的基本定义、创建方法和特殊用法，并通过实例展示了如何从数组中创建切片。在Go语言部分，视频介绍了切片的概念、初始化过程、扩容问题以及使用切片时需要注意的细节。这些内容对于理解和掌握两种语言中的切片操作具有重要意义。

- 分段总结

  折叠

  00:02切片初始化方法概述

  1.切片初始化有三种方法：从数组创建、直接使用数组初始化语法、使用make函数。 2.最常用的初始化方法是使用make函数和从数组直接创建。

  01:41从数组创建切片

  1.可以通过指定数组的一部分元素来创建切片。 2.切片的左边界包含元素，而右边界不包含元素，类似于数学中的左闭右开区间。 3.示例中通过取数组的前两个元素来创建切片。

  04:17使用数组初始化语法

  1.直接使用数组初始化的语法来创建切片，适用于已知的数组大小。 2.示例中展示了如何定义一个与数组等长度的切片，并赋值。

  05:47使用make函数初始化切片

  1.make函数可以用于创建一个具有指定长度和容量的空切片。 2.切片的容量在初始化时确定，可以减少后续扩容的开销。 3.示例中展示了如何使用make函数创建一个初始空间为3的切片，并逐个赋值。

  08:41切片的append方法和错误处理

  1.append方法是向切片添加元素的推荐方式，适用于动态增长的数据。 2.如果尝试向未初始化的切片添加元素，可能会因为底层数组大小不足而报错。 3.正确使用slice的方法包括确保在添加元素前已正确初始化或使用append方法。

  

#### 一、切片 ﻿00:02﻿

##### 1. 切片的初始化 ﻿00:08﻿

###### 1）从数组直接创建 ﻿00:18﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756120326&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-5kZqcreRnTdapn2IR3kOwa7e4Cw%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-249cd8324760bbde494c9f82da3ce7c8233c53da18787b63f0a874171df96b3ff8fafffb9987a35b68e4b9f5d46cc4c979be86f017288fab305a5e1275657320&expires=8h&r=784966923&vbdid=-&fin=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-1&fn=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-1&rtype=1&dp-logid=8950826664275590404&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca67a4b8c3cb26e049bee24164a12e4377&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 创建方法：通过数组索引范围创建切片，语法为array[start:end]

- 区间特性：采用左闭右开区间，即包含起始索引元素但不包含结束索引元素

- 示例说明

  ：

  - 数组allCourses := [5]string{"go", "grpc", "gin", "mysql", "elasticsearch"}
  - 取前两个元素：allCourses[0:2] → 得到["go", "grpc"]
  - 取全部元素：allCourses[0:len(allCourses)]

- 注意事项：这种切片创建方式借鉴了Python语言的特性，在Go语言中特别灵活

###### 2）使用string{} ﻿05:01﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756120326&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-XBvZtloySyS3zctGh7zEEjqL7QY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-ceb69b111350563f18e16cf2c59ce41e3bc2d424c411e5aab0f38dc0f9a8693ee47a438cedba76d8732da3ad336dfe84707c8f503102c239305a5e1275657320&expires=8h&r=390951021&vbdid=-&fin=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-2&fn=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-2&rtype=1&dp-logid=8950826664275590404&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca44342240fa99746fc6d267e99372078e305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 创建方法：使用类似数组的初始化语法[]string{元素1, 元素2,...}

- 特点

  ：

  - 不需要预先指定大小
  - 初始化时元素数量即为切片长度

- 示例：courseSlice := []string{"go", "grpc", "gin", "mysql", "elasticsearch"}

- 与数组区别：数组需要指定大小[5]string，而切片不需要

###### 3）使用make函数 ﻿06:12﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756120326&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-jSd2HSgWsYVGU%2Fn2Rp5jDxfUNaA%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-d9dc1782a47d540b885aca12b24de3235c915ba14a41e09114fab623967fa010d7aae8590bfa0a384b78bbd2163a9f1e83148e235e2cff3e305a5e1275657320&expires=8h&r=301644281&vbdid=-&fin=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-3&fn=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-3&rtype=1&dp-logid=8950826664275590404&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca56afef5411c6cb25c6d267e99372078e305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 函数语法：make([]Type, length)

- 特点

  ：

  - 预先分配指定长度的空间
  - 适合性能要求高的场景，避免频繁扩容

- 示例：

- 注意事项

  ：

  - 使用make创建后可直接通过索引赋值
  - 未使用make创建的切片不能直接通过索引赋值，必须使用append
  - 索引赋值不能超过make指定的长度，否则会报index out of range错误
  - 未初始化的切片只能使用append添加元素
  - ![img](https://bdcm01.baidupcs.com/file/p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756120326&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-XnokWa%2BKmFzQ2DMihER5LaskPRU%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-db2ccd29b7a90595434843423ac87bc15522b922f15a346cb16e1d2071a13d9a8526e80724ebe2e0b8844e225451102b56b33eebbe93084e305a5e1275657320&expires=8h&r=379093200&vbdid=-&fin=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-4&fn=p-8a830e8e69f0730b948b3e3c8ed7195e-40-2025042100-4&rtype=1&dp-logid=8950826664275590404&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121caae339351eea0af8ebee24164a12e4377&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 性能建议：在知道切片大致大小时优先使用make，可以减少内存分配和复制操作

- append特性：即使切片未初始化或容量不足，append也能正常工作，但可能有性能损耗

#### 二、知识小结

| 知识点         | 核心内容                                                     | 易混淆点/注意事项              | 重要程度 |
| -------------- | ------------------------------------------------------------ | ------------------------------ | -------- |
| 切片初始化方法 | 三种初始化方式：1.从数组创建 2.类似数组初始化 3.使用make函数 | 数组创建需指定大小而切片不用   | ★★★★★    |
| 数组转切片     | 使用array[start:end]语法，左闭右开区间                       | 取前两个元素应为[0:2]而非[0:1] | ★★★★     |
| make函数用法   | 预分配空间make([]type, length)，可提升性能                   | 必须接收返回值，直接赋值会报错 | ★★★★     |
| 切片动态扩容   | 使用append函数添加元素                                       | 超出初始容量需重新分配内存     | ★★★      |
| 命名规范       | 驼峰命名法：首单词小写，后续单词首字母大写                   | 静态语言特有规范               | ★★       |
| 切片特性       | 底层基于数组，但长度可变                                     | 与固定长度数组的根本区别       | ★★★★★    |
| 多语言对比     | Go切片语法借鉴Python的灵活切片特性                           | 其他语言少见此类实现方式       | ★★       |

- 摘要

  该视频主要讲述了如何使用切片访问元素。切片是Go语言中用于处理序列数据的重要工具，具有灵活性和便利性。通过切片，可以方便地获取序列数据中的子集，并对子集进行操作。切片的基本操作包括创建、长度和容量、追加、截取等，这些操作可以帮助我们灵活地处理序列数据。此外，切片还支持取多个元素的操作，包括有start和end的切片、无start和end的切片、只有start的切片等，这些操作可以帮助我们快速地获取序列数据中的特定部分。在for循环中，也可以使用切片来遍历序列数据，与数组的for循环几乎完全一样。总之，切片是Go语言中处理序列数据的重要工具，具有灵活性和便利性。

- 分段总结

  折叠

  00:01切片元素访问概述

  1.访问切片的元素是常用的操作，包括访问单个元素和多个元素。 2.访问单个元素的用法与访问数组类似。 3.访问多个元素时，可以连续访问一段数据。

  00:56访问单个元素

  1.通过索引访问切片的单个元素，注意索引不能超过切片的长度。 2.示例代码展示了如何访问切片的第一个元素。

  01:16访问多个元素

  1.使用冒号语法访问切片中的多个元素，冒号两边分别是起始索引和结束索引。 2.索引位置可以填或不填，表示从哪个位置开始到哪个位置结束（左闭右开）。 3.如果只填写起始索引，表示从起始索引开始到切片末尾的所有数据。 4.如果只填写结束索引，表示从切片开头到结束索引前的所有数据。 5.如果都填写，表示指定范围内的数据。

  05:38切片for循环的用法

  1.切片的for循环用法与数组的for循环用法几乎完全相同。 2.示例代码展示了如何使用for循环遍历切片中的元素。

- 重点

  本视频暂不支持提取重点

#### 一、访问切片的元素 ﻿00:01﻿

##### 1. 访问单个 ﻿00:19﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756176377&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-d1735WxozQaHrOV8Sj%2F2myvUF%2FE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-676ea15db365f86fa221c153965f65c93316046bff1bc6645c05c962f4aedccdab0ff02f4f7661306507431e30ddc6ff10a28709c9581dce305a5e1275657320&expires=8h&r=187225871&vbdid=-&fin=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-1&fn=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-1&rtype=1&dp-logid=8965872830709107733&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca67a4b8c3cb26e049010a153fa426a7a9&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 基本语法：通过索引直接访问，语法为slice[index]，索引从0开始

- 注意事项

  ：

  - 不能超过切片长度，否则会报错
  - 示例：fmt.Println(courseSlice[1])输出第二个元素"grpc"
  - 与数组访问方式完全相同

##### 2. 访问多个 ﻿01:03﻿

###### 1）切片语法位置讲解 ﻿01:38﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756176377&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2FZtIwF0j7%2Bk9x2V%2B9rLbkOsEdq0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-400e5408745a312c2384fcf215e2ababc57dd973cf1a24a419668f100f2ee4ffc0c92e6a8ee8a656a63a5b26361966f74dfa93fdd81e1264305a5e1275657320&expires=8h&r=858840510&vbdid=-&fin=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-2&fn=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-2&rtype=1&dp-logid=8965872830709107733&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=a7e1f23860a769ab62a02d5a82ac3ae547ff09329eeab079&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 基本语法：slice[start:end]，左闭右开区间

- 位置参数

  ：

  - start：起始位置（包含）
  - end：结束位置（不包含）
  - 两者都是可选参数
  - 示例：courseSlice[1:4]获取第2到第4个元素

###### 2）切片语法位置示例 ﻿02:15﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756176377&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-VJSWf%2BUI6kFoUl0EX5O%2BgqSvZ9c%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e3ee11887e58b6c54b4ba5de16a6adac68db8b5edd68adb96ac85ea6e27d55ad81b7e30da65ad0d77d86cc5b54426e25e09a90cbae8de0f2305a5e1275657320&expires=8h&r=793842238&vbdid=-&fin=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-3&fn=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-3&rtype=1&dp-logid=8965872830709107733&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca44342240fa99746f359a1ab6c4ddc051305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 四种情况

  ：

  - 只有start：从start开始到结尾的所有数据，如courseSlice[1:]获取从第2个到末尾
  - 只有end：从开头到end之前的所有数据，如courseSlice[:3]获取前3个元素
  - 两者都有：从start到end的指定范围，如courseSlice[1:4]获取第2-4个元素
  - 两者都无：复制整个切片，如courseSlice[:]

###### 3）切片语法位置示例 ﻿03:44﻿

- ![img](https://bdcm01.baidupcs.com/file/p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756176377&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-JNpTcRh%2B1F371CCYOWINA9Xi8ZY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-30c4b6090dfdf97ad7c69854f5a922d20ac1e800a90c7b72cf0983b9682807766a38f4ed9efd39b969d4ef5af14cc6ca213a1433d1763d45305a5e1275657320&expires=8h&r=579399590&vbdid=-&fin=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-4&fn=p-9f2c8fecaf4b2d1935aae162fbc20a0d-40-2025042100-4&rtype=1&dp-logid=8965872830709107733&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=3612dd02eb4608abbfcd971e5877805e47ff09329eeab079&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 实际示例

  ：

  - courseSlice[1:]输出：["grpc", "gin", "mysql", "elasticsearch"]
  - courseSlice[:2]输出：["go", "grpc"]
  - courseSlice[1:4]输出：["grpc", "gin", "mysql"]
  - courseSlice[:]输出完整切片副本

- 注意事项

  ：

  - 语法灵感来自Python，但比Python更简洁
  - 索引从0开始计算
  - end位置不包含在结果中

#### 二、知识小结

| 知识点         | 核心内容                                                     | 考试重点/易混淆点                  | 难度系数 |
| -------------- | ------------------------------------------------------------ | ---------------------------------- | -------- |
| 切片元素访问   | 支持单个元素访问（类似数组）和连续范围访问（左闭右开）       | 索引越界风险（最大不超长度）       | ⭐⭐       |
| 切片范围语法   | start:end规则：- 仅start：从start到结尾- 仅end：从开头到end（不包含）- 无参数：复制完整切片 | 左闭右开原则（如1:3取第1-2个元素） | ⭐⭐⭐      |
| Python与Go差异 | Go切片语法为Python子集，简化灵活性（如不支持步长）           | 需注意Go无负索引等高级特性         | ⭐⭐       |
| 切片遍历       | 与数组循环用法完全一致                                       | 通常结合for range实现              | ⭐        |

- 摘要

  该视频主要讲述了Go语言中slice的底层实现原理，包括引用传递和值传递的区别。Slice是Go语言中一种特殊的类型，可以用来表示数组的一部分，其基本原理是引用传递。视频通过代码演示和例子，展示了slice在函数参数传递时的现象，即看似是引用传递，但实际上是值传递。视频还解释了slice底层的实现机制，包括其容量和长度，以及如何通过切片的拷贝来修改原始切片。最后，视频还提到了切片与数组的区别和联系，以及如何正确地使用切片。

- 分段总结

  折叠

  00:01Go切片底层实现原理

  1.Go切片的底层实现原理与数组列表不同，需要理解其底层原理以避免开发中的问题。 2.理解Go切片的底层原理在面试中也很重要。

  00:53切片在函数参数传递中的特性

  1.Go切片的函数参数传递是值传递，但效果上呈现出引用传递的效果。 2.严格意义上说是值传递，但效果上类似于引用传递。

  01:45切片传递现象的解释

  1.通过一段代码解释切片传递的现象，包括修改切片元素和切片长度的影响。 2.值传递的特性导致外部切片在函数内部修改后不会受到影响。

  04:52切片底层实现原理

  1.切片的底层实现原理将在下一节课详细讲解。

- 重点

  本视频暂不支持提取重点

- 摘要

  视频主要讲解了Go语言中slice的底层存储原理。首先介绍了slice本质上是一个结构体，它包含指向底层数组的指针，用于存储值。slice传递时虽然看似是引用传递，实则是值传递，但因为指向同一底层数组，所以在修改时会相互影响。slice的扩容机制是通过成倍增加容量来应对数据增长，当容量不足时进行扩容，扩容后原slice与新slice指向不同数据结构。视频还演示了通过数组生成slice的过程，并解释了为何slice在函数传递中需接受返回值，以及如何通过slice修改底层数据。最后，提及了下节课将讲解的数据结构map。

- 分段总结

  折叠

  00:01Go Slice的底层存储原理

  1.Go Slice本质上是一个结构体，结构体类似于C语言中的结构体或其他语言中的类。 2.结构体包含三个元素：array（指向底层数组的指针）、len（slice的长度）和cap（slice的容量）。 3.slice的声明语法只是语法糖，编译时会转换成slice结构体。

  02:17Slice的结构体定义

  1.slice结构体包含三个元素：array（指向底层数组的指针）、len（slice的长度）和cap（slice的容量）。 2.slice的声明语法会生成一个结构体，并指定其类型和初始长度。 3.容量可以在声明时指定，也可以根据需要动态调整。

  04:03底层数组的分配

  1.底层数组是slice实际存储数据的地方，其类型和大小由slice的类型决定。 2.在初始化时，底层数组会分配足够的空间以容纳初始数据。 3.容量大于初始长度时，底层数组会预先分配额外的空间，以减少后续扩容时的开销。

  07:22Slice的扩容机制

  1.当slice的长度达到其容量时，需要进行扩容以容纳更多数据。 2.扩容通常是成倍进行的，以提高效率。 3.扩容时机根据当前容量和长度动态确定，当容量不够时触发扩容。 4.扩容后，slice会指向新的底层数组，原数组中的数据会被复制到新数组中。

  13:37Slice的引用传递效果

  1.尽管slice是值传递，但由于其指向底层数组的指针，因此表现出引用传递的效果。 2.修改slice中的数据会影响到底层数组，进而影响其他指向同一底层数组的slice。 3.当slice扩容后，其指向的底层数组地址发生变化，不再与其他slice共享同一底层数组。

  17:56Slice的扩容示例

  1.通过循环向slice中添加数据，观察其长度和容量的变化。 2.初始时，slice的长度和容量均为1，随着数据的添加，容量逐渐翻倍。 3.当容量达到512后，扩容不再翻倍，而是逐渐增加。

- 重点

  本视频暂不支持提取重点

#### 一、切片原理 ﻿00:02﻿

##### 1. 结构体 ﻿00:26﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-rQLHJFSBJKw3l%2Bq3Y40U0%2F3lSZk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-f5c54223902e683923fcb060dcebe3900e84112e3811d6f8ad3d34db0240f3fdd45c04bdbbf15f58e63eeba3f5e34a0a2f4c7a5f8692fe74305a5e1275657320&expires=8h&r=218153205&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-1&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-1&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=cf87eda222dfadb772972c81ee53d493282bc8fb22fd2602&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 本质：与C语言结构体相同，可简单理解为其他语言中的类

- 组成

  ：

  - array：unsafe.Pointer类型，存储实际数据的数组指针
  - len：int类型，记录切片中元素数量
  - cap：int类型，表示底层数组的容量

- 传递特性：结构体在传值时是值传递（会拷贝），但slice表现出引用传递效果

##### 2. 结构体示意图 ﻿02:17﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-xB0pRY4vNDJkGiYs157qTLzCo2g%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-926301b2d3ff50921d44c8330904bc2ad52bc7e3cd468bef5161d66238e6051357747128a7cb32bf576a0cbf52e7af9b7af6dc3920e364b6305a5e1275657320&expires=8h&r=788541008&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-2&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-2&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=83f2b583554fba15b5814bdd3b617ecbb16eb5e79b7b7d56&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 内存布局

  ：

  - 结构体包含三个字段：指针、长度、容量
  - array指针指向连续内存空间存储实际数据

- 初始化示例

  ：

  - courses := []string{"go", "grpc", "gin"}

     会创建：

    - len=3（元素数量）
    - cap=3（初始容量）

  - 通过make可显式指定容量，如make([]string, 3, 5)

  - ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-tPIwYWuxOhE1Vt2FPg53FkrqkEk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b8c04a72ae855f8c184dbfdd81c4e415d08508a53a93eeb7c83a2da7e97a575495b96120b6087da2560e6ba14018c744317d83e1299966fb305a5e1275657320&expires=8h&r=625833187&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-3&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-3&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e80686faf624695b8f8f85080d1949846c3948456271b7afeae52&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 底层机制

  ：

  - 切片操作本质是创建新的结构体实例
  - 新实例共享底层数组但可能修改len和cap
  - 当容量不足时，append操作会触发扩容（分配新数组）

- 特殊现象

  ：

  - 值传递时修改元素内容会影响原切片
  - 但修改切片长度（如append）不影响原切片的len字段

##### 3. 容量问题 ﻿03:31﻿

###### 1）容量和长度的设置 ﻿03:34﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-3rTxqqG3bBzRwjDQ%2FI2DxgD54yk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e48c5148f36ed16559e3dd7128706965eed4a1cf4b28f09117e76604d046b71bbca2a4892aeaeacf486fa7ccd283fe776007f980ce933fa3305a5e1275657320&expires=8h&r=265294644&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-4&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-4&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=875e0ff32ac7bd89b7db44095cce31ddb16eb5e79b7b7d56&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 底层结构：Go的slice由三个字段组成：指向底层数组的指针(array)、长度(len)和容量(cap)
- 长度设置：make([]string, 5)中第二个参数5表示初始长度(len)，即包含5个空字符串元素
- 容量设置：make([]string, 5, 10)第三个参数10表示容量(cap)，即底层数组可容纳10个元素

###### 2）slice的底层数组原理 ﻿03:51﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-v%2Fbey2GCLSurKc3hUh8dTD4aE0Q%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-702857edb7c04aed329216a27f279cd2c88d781794676b5b7bae418d9eda07776e7269cf59c03bbe998aeeae0516fe74c4a12cc05ca4c6ef305a5e1275657320&expires=8h&r=416930911&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-5&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-5&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068c32f23017ea016b05080d1949846c3948456271b7afeae52&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 数组存储：底层数组存储实际数据，类型固定（如示例中的string数组）
- 空间分配：初始化时申请10个空间但只使用5个，剩余空间为后续append预留
- 指针指向：array指针指向数组起始位置，len标记当前使用元素数量

###### 3）容量设置不足导致的扩容问题 ﻿05:48﻿

- 扩容代价：当容量不足时，需要申请新数组并拷贝数据，性能开销大
- 示例说明：初始容量5时append第6个元素，需申请新数组（大小6）并拷贝原数据
- 系统交互：每次扩容都涉及向操作系统申请内存空间的操作

###### 4）初始容量设置过大对性能的影响 ﻿06:46﻿

- 预分配策略：建议初始容量设置较大（如10000），避免频繁扩容
- 内存权衡：虽然会占用更多初始内存，但避免了反复申请空间的性能损耗
- 使用弹性：大容量不影响实际使用，未使用的空间不会造成功能问题

###### 5）数组指向与切片取值问题 ﻿07:38﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-m%2FRc87OAvfUlSWRkqVy%2F6ff%2BN38%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-571162438a61a578d56a99bf869142d251d802cdbe38bfa96eb83305babbff7a4035a7378350f51acfd1ea397d94a51a28abbc1109ba21a2305a5e1275657320&expires=8h&r=843399174&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-6&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-6&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=b3434a369726e9249598d5fd593929895080d1949846c3948456271b7afeae52&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 子切片原理：从数组生成切片时，array指针指向子切片的起始元素
- 长度计算：len表示子切片包含的元素数量（如取数组第2-5个元素，len=3）
- 容量计算：cap从起始位置到底层数组末尾的总可用空间

###### 6）函数参数传递：值传递与引用效果 ﻿08:47﻿

- 值传递本质：传递slice时会复制整个结构体（包括array指针、len、cap）
- 引用效果：因复制的指针指向同一数组，修改元素会互相影响
- 严格区分：不是真正的引用传递，只是共享底层数组带来的类似效果

###### 7）扩容机制：成倍扩容的策略 ﻿11:23﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-pTmZZnKrMk75BsFZBchEe7WpiwI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4f71a3b8585f1f31c1463821eae37501affa0b9d1c8dfadb49fbbe8d47a5629bdd4f31957aa81de64e5b980a18654df08b6003291221b582305a5e1275657320&expires=8h&r=777134574&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-7&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-7&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068b85158c4a6b0835198ddbe85911256c9305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 扩容规则：元素总量<1024时成倍扩容（1→2→4→8...），≥1024时按比例扩容
- 扩容示例：容量1的slice在append时会依次扩容为2、4、8、16...
- 性能影响：成倍扩容平衡了内存使用和扩容频率

###### 8）扩容后数据独立性的影响 ﻿12:26﻿

- 分离机制：扩容后新旧slice指向不同数组，修改互不影响
- 示例说明：当sliceA扩容后，sliceB仍指向原数组，两者数据操作独立
- 关键注意：是否发生扩容决定了数据修改是否相互影响

###### 9）例题1:slice的append操作与返回值接收 ﻿12:37﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-8?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-5D74nWm5krpQsOwhgbA6Yu5lMVk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-f05c2ee40e542c407440e623dd07ee18126178b12ac1382a903459e31ba285176c4181a4706a1ea3ec05b2d15ae06a6e9ea0ad05a1933d89305a5e1275657320&expires=8h&r=626810005&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-8&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-8&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=1524a5cd531d02e5d5c5445e5877de9e98ddbe85911256c9305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 题目解析

  ：

  - 操作本质：append可能返回新slice（当发生扩容时）
  - 返回值必要性：必须用原变量接收返回值，否则可能丢失扩容后的新地址
  - 值传递限制：函数内无法修改外部slice的指针值，必须通过返回值更新

- 答案要点

  ：

  - 所有append操作都应使用slice = append(slice, elem)形式接收返回值
  - 忽略返回值会导致扩容后的新slice丢失

##### 4. 应用案例 ﻿13:37﻿

###### 1）例题:切片演示

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-9?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-RS04Ll7GVdO9J4BD%2B36UyJIv3aE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4aa4447ae92c2e8b8047f99664a9069134e768fc2ff078cb8d8cae67a0abe972e664e35a2c321c379a6c422df979dad7f70bd5737598af45305a5e1275657320&expires=8h&r=283928934&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-9&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-9&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068fca2b103d063e44c98ddbe85911256c9305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 底层结构

  :

  - array: 指向底层数组的指针
  - len: 切片中实际存储的元素数量
  - cap: 底层数组的容量

- 创建方式

  :

  - make([]string, 5, 10): 创建长度为5，容量为10的切片
  - []string{"go", "grpc", "gin"}: 直接初始化切片

- 传递机制

  :

  - 函数参数传递是值传递，但表现出引用效果
  - 因为复制的是包含指针的结构体，所以修改元素会影响原切片
  - ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-10?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-0HE5J3IPwbxw8WOAHHunFOcbK3I%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-88711406b4b81b23a660337b323a139dd1a32b669ed1a6e1d8be7ef6ca97c30079def971372c3b95e958513b90425cbffd93add7bef7a7e1305a5e1275657320&expires=8h&r=445889886&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-10&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-10&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=4126a8bea2f5ff03d442d91ff8c6edefb16eb5e79b7b7d56&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 切片共享机制

  :

  - 多个切片可共享同一底层数组
  - 示例中data := []int{1,2,3,4,5,6,7,8,9,10}
  - s1 := data[1:6]获取第2到第6个元素
  - s2 := data[2:7]获取第3到第7个元素

- 修改影响

  :

  - 修改s2[0] = 22会同时影响s1和原数组
  - 因为s1和s2共享底层数组的相同区域

###### 2）例题:切片扩容演示 ﻿17:51﻿

- ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-11?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187974&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-kSGwh8lOD95MvCQag0qpgKoiXMo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-311dea504ec436567504a5e3e5671e0995b39fd27dfd6e12aacc6e3d7d248f6fe26657fe70ee31ed539496b363191c922ff2f4ce762138e2305a5e1275657320&expires=8h&r=592093692&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-11&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-11&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068230408e99c62dfff98ddbe85911256c9305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 扩容规律

  :

  - 初始容量为1
  - 容量不足时按2倍扩容(1→2→4→8→16...)
  - 达到512后扩容幅度减缓(不再严格翻倍)

- 扩容影响

  :

  - 扩容会创建新数组并复制元素
  - 扩容后切片指向新数组，与原切片不再共享

- 容量计算

  :

  - 切片容量从起始位置到底层数组末尾
  - 示例中data[2:7]的容量为8(从第3个元素到数组末尾)
  - ![img](https://bdcm01.baidupcs.com/file/p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-12?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756187975&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ep4YKljH8wqDImqEpBzQ%2BCPIVDE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-b26f3ac9e444eb59e4d709ea3217200678badba7077bf9ad3909ad7d8058eb08a755e4260ef7dfe203239840898296c12fdd35f193dfba3c305a5e1275657320&expires=8h&r=520397617&vbdid=-&fin=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-12&fn=p-8a63a9a9ef9d824ffcb0dd5a491a336d-40-2025042100-12&rtype=1&dp-logid=8968985801202455568&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=eae2efe893f98aac2c72557199f0d9e598ddbe85911256c9305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 常用函数

  :

  - len(): 获取切片长度(元素数量)
  - cap(): 获取切片容量(底层数组长度)
  - append(): 添加元素，可能触发扩容

- 扩容时机

  :

  - 仅当添加元素超过当前容量时发生
  - 扩容后容量至少为原容量的2倍(小切片)或1.25倍(大切片)

#### 二、知识小结

| 知识点              | 核心内容                                                     | 考试重点/易混淆点                                      | 难度系数 |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------ | -------- |
| Go语言slice底层原理 | slice本质是包含**指针、长度和容量**的结构体，底层通过数组实现存储 | 值传递与引用传递的差异表现（结构体复制但共享底层数组） | ⭐⭐⭐⭐     |
| slice扩容机制       | 容量<1024时成倍扩容(2x)，≥1024时按比例扩容(1.25x)            | 扩容阈值判断与扩容后地址变更的关联性                   | ⭐⭐⭐⭐     |
| slice声明方式       | 通过make函数指定类型/长度/容量，或从数组切片生成             | 未指定容量时默认与长度关系（剩余空间全分配）           | ⭐⭐       |
| 结构体特性          | 与C语言结构体相似，传值时完整复制但共享指针引用              | 值传递为何能修改底层数据（指针成员的特殊性）           | ⭐⭐⭐      |
| 性能优化要点        | 预分配充足容量避免频繁扩容，内存管理机制解析                 | 容量过大的内存浪费与频繁扩容的性能损耗平衡             | ⭐⭐⭐⭐     |
| 实践演示案例        | 数组切片修改影响原数据 vs 扩容后数据隔离的对比实验           | append操作必须接收返回值的根本原因                     | ⭐⭐⭐      |

- 摘要

  该视频主要讲述了在Go语言中，map类型的值必须先初始化，否则会导致报错。视频中提到了两种初始化map的方法，一种是直接在定义时指定初始值，另一种是使用make函数进行初始化。同时，视频中也提到了slice类型的变量可以不进行初始化，但使用前需要先进行初始化。此外，视频还强调了在使用map时需要注意其简洁性。

- 分段总结

  折叠

  00:01map数据结构介绍

  1.map是Go语言中常用的数据结构之一，用于存储键值对。 2.map的主要特点是查询方便，时间复杂度为O(1)。 3.map的定义包括map的名称、键和值，键和值可以是多种类型。

  03:14map的初始化和赋值

  1.map的初始化可以通过字面量方式进行，类似于定义一个字典。 2.初始化时需要指定键和值的类型，键放在中括号内，值直接指定类型。 3.赋值时使用花括号，键值对之间用逗号分隔，最后一个键值对后面必须加逗号。 4.初始化完成后，可以通过键直接访问和修改map中的值。

  06:17map的使用注意事项

  1.map必须先初始化才能使用，否则如果尝试向未初始化的map中放置值，会报错。 2.初始化的方式有两种：字面量初始化和使用make函数。 3.make函数用于初始化slice、map和channel，可以指定类型和长度。 4.未初始化的map变量值为nil，访问nil对象的属性或方法时不会报错。

- 重点

  本视频暂不支持提取重点 

  #### 一、go语言 ﻿00:00﻿

  ##### 1. map的初始化和赋值 ﻿00:02﻿

  ###### 1）讲解map的作用 ﻿00:58﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-ytpA5UoGju%2Buh%2BrC%2BFw6yL7G5sM%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-f9d25d8d5c03d9edd1eeb58fccd5398adc4cfe028498f314ecfe1671a7ea3c58486ecd80336e1f1b52043e944a9703ce194031fee8c6e521305a5e1275657320&expires=8h&r=112947742&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-1&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-1&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=4126a8bea2f5ff03d442d91ff8c6edef1c2034c7ece28e18&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 常用数据结构: 在go语言中，slice和map是最常用的两种集合类数据结构

  - 核心作用: 提供key-value键值对存储，主要用于快速查询

  - 性能优势

    : 查询时间复杂度为

    ﻿O(1)O(1)O(1)﻿

    ，相比数组/切片的遍历查询性能更高

  - 无序特性: map中的元素存储是无序的集合

  ###### 2）map的定义 ﻿02:18﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-uYUzHMHiwyatSXN2ghcJEr27EzE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4ab3cb82057e14b4b9eaedd916952ef0342c86c189827c49557fcd4b1ffa4cab4042fe5174a1096040fe7b46f45bda3c3d66d26ea166e29a305a5e1275657320&expires=8h&r=250302493&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-2&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-2&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068230408e99c62dfff307d661de4e0d149305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 基本语法: var 变量名 map[key类型]value类型

  - 示例: var courseMap map[string]string

  - 类型说明

    :

    - key类型必须放在中括号内
    - value类型直接跟在后面

  - 命名冲突: 注意map作为关键字时可能产生命名冲突，建议使用mymap等替代名称

  ###### 3）往map中放值 ﻿03:14﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-xsfQ%2FRabdcSufjBbgU8Mofzp%2F1M%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-c09c55ddb9ba96b0b0981fc37be52baed79aab8faef0b3a852c1938a793f6e961310342552203c47469ddb58e2c94cbc2b5356ffd1bae8a1305a5e1275657320&expires=8h&r=282194607&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-3&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-3&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=eae2efe893f98aac2c72557199f0d9e5307d661de4e0d149305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 初始化赋值:

  - 语法要求

    :

    - 使用花括号包裹键值对
    - 每对键值用逗号分隔
    - 最后一个值必须以逗号结尾

  - 动态添加

    :

    - 可通过courseMap["mysql"] = "mysql的原理"方式添加新键值对

  ###### 4）取值操作 ﻿04:53﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-HfikvhRtr%2Bz2pNtHuwxeaDrHYOE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-8afc0896b25e2ff31ca5118e84fb470ff067b555fd988b67b124b7cd4b468f227fedb17974a634e2bb5b4cc83d37868c25211ebbeaa1f8bc305a5e1275657320&expires=8h&r=559150279&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-4&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-4&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068f193165a1eaeeb43307d661de4e0d149305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
  - 取值语法: value := mapName[key]
  - 示例:
  - 特点: 取值操作非常简便，直接通过key访问

  ###### 5）取值和放值的注意事项 ﻿06:13﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-RLHzUXm28cgEktvdkSiSEVQqbbo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-e602efa385e431ed042c664e3499a6904437048f8cb2a5b61a8e66185b8f436b1e06851f3d676d9ae21886ffffb36301c03b48e3afdae8dd305a5e1275657320&expires=8h&r=550035051&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-5&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-5&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=6a9088c7620f7a1736564e37f877fcb01c2034c7ece28e18&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 必须初始化: map类型必须初始化后才能设置值

  - nil map问题: 未初始化的map为nil，向其添加元素会导致panic

  - 初始化方式

    :

    - 空初始化: var courseMap = map[string]string{}
    - make初始化: var courseMap = make(map[string]string, 3)

  - 与slice区别: slice可以不初始化直接append，但map必须初始化

  ###### 6）初始化的另一种方式 ﻿08:15﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-pxnY7ALHsn4F%2FdMtZAOb7TUI9DQ%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-860418df8c41dd908cde6f6e8d62590eff9df0cf212ce0bc086d0dc7aa754f3546ac750c358049052966c07fdea92643f5b8bf97bc3a9938305a5e1275657320&expires=8h&r=422617826&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-6&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-6&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=0cce998314b34a67bdd25db1c01455a9864f4684d244f034&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - make函数

    :

    - 是go的内置函数
    - 用于初始化slice、map和channel三种结构

  - 语法: make(map[keyType]valueType, capacity)

  - 容量参数: 可指定初始容量，但不是必须的

  - 推荐用法: 通常更推荐使用make方式初始化map

  ###### 7）slice和map的区别 ﻿10:12﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-58zUSr78wI6JLqhZutJv8jjLwLI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-41e02fbb6c37bf2311a5b0343ed6c8e469bfb9acea165c1e7a1698d08a887904d8db0954053ffb0141b1f0c45c2d790803ec34611e5421bd305a5e1275657320&expires=8h&r=797487296&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-7&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-7&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=e83ff6a1394898305c92c18ca9f96aba1c2034c7ece28e18&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - nil处理

    :

    - map的nil值不能直接操作
    - slice的nil值可以append操作

  - 判断nil:

  - 底层实现: go中的nil与其他语言的null/none有区别，需要注意

  ###### 8）赋值操作 ﻿11:43﻿

  - ![img](https://bdcm01.baidupcs.com/file/p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-8?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756188847&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-sCmAcwro7kbuc41%2BZGxog0bfrgs%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-166c56560fd1660463c7b6010cbc37203a01e84e2e3aa7822c8784242dcb3862fcfcf3635a19ccfc390d91edb3e2fd36eda6446961cfc5ab305a5e1275657320&expires=8h&r=220997546&vbdid=-&fin=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-8&fn=p-4a61b47f4688384bc0924cedc71b400b-40-2025042100-8&rtype=1&dp-logid=8969220189535010905&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca44342240fa99746f307d661de4e0d149305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

  - 两种赋值方式

    :

    - 初始化时直接赋值
    - 初始化后通过map[key] = value方式单个赋值

  - 推荐做法: 通常使用make初始化后动态添加键值对

  - 简洁性: map的使用相比其他语言更加简洁方便

  #### 二、知识小结

  | 知识点      | 核心内容                                                     | 易混淆点/注意事项                          | 重要性 |
  | ----------- | ------------------------------------------------------------ | ------------------------------------------ | ------ |
  | Map数据结构 | Go语言中常用的键值对集合类型，提供快速查询能力               | 与关键字map重名需注意命名冲突              | ★★★★★  |
  | Map特性     | 无序键值对集合，查询时间复杂度为O(1)                         | 与切片/数组的线性查询性能对比              | ★★★★   |
  | Map定义语法 | var course map[string]string                                 | Key类型必须放在中括号内，value直接指定类型 | ★★★★   |
  | Map初始化   | 1. 直接初始化：course := map[string]string{"go":"工程师"}2. make函数：make(map[string]string) | 未初始化map为nil不能直接赋值               | ★★★★★  |
  | 值操作      | 赋值：course["grpc"]="入门"取值：course["grpc"]              | 最后一个键值对必须保留逗号                 | ★★★    |
  | nil处理     | nil map不能赋值但slice可以append                             | Go的nil与其他语言null的语义差异            | ★★★★   |
  | 性能优势    | 相比数组/切片的遍历查询，map哈希查找效率更高                 | 适合高频查询场景                           | ★★★★   |

- 摘要

  该视频主要讲述了Go语言中map的遍历方法及其特点。首先介绍了使用for range进行遍历，并解释了key和value的概念及其类型限制。然后展示了如何打印key和value，并说明了如果不关心key，可以使用匿名变量。接着，视频讨论了range的灵活性，可以只取一个值（此时默认为key），并解释了这种语法背后的原理。最后，视频提醒了map遍历的无序性，并展示了每次遍历可能得到不同的顺序。

- 分段总结

  折叠

  00:01Go语言map的遍历

  1.定义map结构体后，需要遍历取值。 2.使用for range进行遍历，key不再使用index。 3.key的类型可以多种，但value的类型几乎所有类型都可以。 4.布尔型可以作为key，但slice类型不可以。 5.数组类型需要是固定类型的slice才可以作为key。

  02:02遍历map的语法

  1.使用fmt.Println打印key和value。 2.如果不希望知道key，只拿value，可以使用匿名变量。 3.range支持一个参数和两个参数的写法，底层调用不同的函数。 4.一个参数的写法对应key，两个参数的写法对应key和value。

  04:07map的无序性

  1.map的遍历顺序是无序的，后加入的数据不一定后打印。 2.每次遍历的顺序也可能不同。 3.如果数据容器中的数据需要有序，不能使用map。

- 重点

  本视频暂不支持提取重点

#### 一、map的遍历 ﻿00:16﻿

##### 1. for循环遍历 ﻿00:17﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189334&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-JN5ZkkfxW6OTnrlAAMYgLDe5QFU%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-849440eaf924a518a9466b5ca7d0aaf8c13a13497e297b51a2f0d348515bc9015f769cd66f84f57d7387823903dc9512b9380a2e33395ea7305a5e1275657320&expires=8h&r=133140705&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-1&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-1&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=5eee304bbb22b9c2fcf9761cd9df8ec98425b66a02987c2bc48031c257b32a4e&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 初始化要求：map必须初始化才能使用，可以通过map[string]string{}或make(map[string]string,3)两种方式初始化，这与slice不同，slice可以不初始化直接使用。

- key类型限制

  ：

  - 不能使用slice作为key类型，如[]string会报错
  - 可以使用固定长度的数组作为key，如[2]int
  - 基本类型如bool、int等都可以作为key
  - 判断标准：key类型必须支持==和!=比较操作

- value类型：value可以是任意类型，没有限制

- ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189334&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-T4ATRzHKOFpCq9F%2BjqWSbYNeIVE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4567367eb2f23a9a5b0833bcfd2c60a9ce2e0f19dd9f6650f885be7e1058ba110aa59570deffe2d698ed2b6f38c43f8d6aa60fc2a10f5008305a5e1275657320&expires=8h&r=791298098&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-2&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-2&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=7717645f262844cad63a337261ba09ef8f9271db3ece3383&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 遍历语法

  ：

  - 使用for range进行遍历
  - 与slice遍历不同，map的遍历变量命名为key和value而非index
  - 可以只取value：for _, value := range courseMap
  - 也可以只取key：for key := range courseMap

##### 2. range遍历 ﻿02:40﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189334&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-djcP%2FCPHILuCqBniETItXFZTFBY%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-629f59de15aa5bbf50f38e2647b14fe2e58b3ac31762eff12cc106823c38f0ea74a34f5ef139526445a8dd93bb6350054fba41e9e0920167305a5e1275657320&expires=8h&r=637139930&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-3&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-3&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=5eee304bbb22b9c2b6e12d2bd14114dd8425b66a02987c2b8456271b7afeae52&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 底层实现

  ：

  - Go编译器会根据参数数量调用不同的底层函数
  - 单参数形式返回的是key
  - 双参数形式返回key和value

- 推荐用法

  ：

  - 更推荐使用双参数形式直接获取key和value
  - 单参数形式需要额外通过courseMap[key]获取value，效率较低

- 遍历顺序

  ：

  - map是无序集合，遍历顺序不固定
  - 每次遍历可能得到不同的顺序结果
  - ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189334&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-Rw6Fk2iNXwFyW7e9xK1ml1DmioE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-ed43edd1a6ae1e68a8edd6365750877a8da60648f3f344206b82958de8d7443fb78cef6053974b6087f4a0c96b8a2990e9e5b0f0f06c4d66305a5e1275657320&expires=8h&r=467526138&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-4&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-4&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=7717645f262844ca5d56a4409b209f558f9271db3ece3383&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 实践示例

  ：

  - 双参数形式：for key, value := range courseMap { fmt.Println(key, value) }
  - 单参数形式：for key := range courseMap { fmt.Println(key, courseMap[key]) }

- 输出结果

  ：

  - 示例输出可能为：gin gin深入理解、mysql mysql的原理、go go工程师、grpc grpc
  - 注意输出顺序每次运行可能不同

#### 二、打印key值 ﻿04:10﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189334&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-oZdaeg1tSBBEG8Et4QVemoE3mWo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-d547458718f7b69ee691e401c695cb981c544daa0b8984e2481b4c5292169f993edb264f3a23db0c7355e164d3901956cfd0a2326984cbab305a5e1275657320&expires=8h&r=618221506&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-5&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-5&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=5eee304bbb22b9c2b94d4c3788c069c58425b66a02987c2b8456271b7afeae52&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 取值方法: 通过courseMap["grpc"]语法可以获取map中"grpc"对应的值
- 打印结果: 打印输出的是"grpc入门"，但顺序与定义时不同
- 初始化要求: map类型想要设置值必须要先初始化，否则无法操作

#### 三、map无序性 ﻿05:11﻿

- ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189334&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-%2BRvW8VW1bfaFNBIkFMZXK0h9XM0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-59d5725f1e29996c0ffe32331c03ac10bc900e803efdac8f096b4c01bf29a063c2c08ea65761bd8380a95453d4ca853f9ba61293b093b1bf305a5e1275657320&expires=8h&r=296968276&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-6&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-6&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=a5f92b9aebde11e52e423028fca05fd916d3a70ebfbfffbd&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 本质特征

  : map是一个key(索引)和value(值)的无序集合，查询时间复杂度为

  ﻿O(1)O(1)O(1)﻿

- 无序表现

  :

  - 打印顺序与定义顺序不一致
  - 每次运行打印顺序可能不同(如第一次"gin→go→grpc→mysql"，第二次可能变为"go→grpc→gin→mysql")

- 注意事项

  :

  - 不能依赖map的遍历顺序来实现有序存储
  - 如需有序存储，需要结合slice使用

- 初始化方法

  :

  - ﻿map[string]string{}map[string]string\{\}map[string]string{}﻿
  - ﻿make(map[string]string,3)make(map[string]string, 3)make(map[string]string,3)﻿
  - 注意与slice的区别：slice可以不初始化直接使用
  - ![img](https://bdcm01.baidupcs.com/file/p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-7?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189335&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-Y7i51ZTxyKeo7RHhxwMQUir3Np0%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-5ebecc401b41eba58cbf788436e0510ff93f2536e45f9a10e49b6d2ae65aa80b98d48df4fa9b73d30d79360bb9b7018df94b9e4325ecbc27305a5e1275657320&expires=8h&r=523564283&vbdid=-&fin=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-7&fn=p-0a6cbd58f709020afd14e649992e04d7-40-2025042100-7&rtype=1&dp-logid=8969350855109002957&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=718800a01e5121ca67a4b8c3cb26e0498f9271db3ece3383&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 遍历方式

  :

  - 仅遍历值：

    ﻿for_,value:=rangecourseMapfor \_, value := range courseMapfor_,value:=rangecourseMap﻿

  - 遍历键值对：

    ﻿forkey:=rangecourseMapfor key := range courseMapforkey:=rangecourseMap﻿

- 性能特点

  : 主要优势在于查询方便，时间复杂度为

  ﻿O(1)O(1)O(1)﻿

- 实际应用建议

  :

  - 适合快速查找场景
  - 不适合需要保持元素顺序的场景
  - 在需要顺序的场景中，应配合slice使用

#### 四、知识小结

| 知识点           | 核心内容                                                     | 考试重点/易混淆点                                            | 难度系数 |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| Map遍历方法      | 使用for range遍历map，可获取key-value或仅key                 | 单参数时返回的是key（易混淆）                                | ⭐⭐       |
| Map的key类型限制 | 不可用slice，但可用固定长度数组；value无限制                 | 布尔、int等基础类型可用，但动态容器类型（如slice）不可作为key | ⭐⭐⭐      |
| Map的无序性      | 遍历顺序与插入顺序无关，每次运行顺序可能不同                 | 需结合slice实现有序访问                                      | ⭐⭐       |
| 匿名变量使用     | 忽略key时可用_占位，仅获取value（如for _, value := range map） | 语法灵活性易忽略                                             | ⭐        |
| 底层实现差异     | 单/双参数遍历在编译时调用不同底层函数                        | 语言设计特性，需理解底层逻辑                                 | ⭐⭐⭐      |

- 摘要

  该视频主要讲述了如何在map中获取和删除元素，并强调了正确处理元素存在性的重要性。首先，视频介绍了多种获取map中元素的方法，并指出了直接判断元素存在性的潜在问题。然后，通过示例展示了如何准确判断元素是否存在，包括使用带布尔值返回的方法。此外，视频还演示了如何删除map中的元素。整体而言，视频内容实用，对于理解和操作map数据结构具有重要意义。

- 分段总结

  折叠

  00:01Map元素获取与判断

  1.获取Map中元素的方法：通过键来获取值，支持多种方法。 2.判断Map中元素是否存在：使用两个参数的返回模式，其中一个参数为布尔值，表示元素是否存在。 3.空值的处理：当值为空时，直接判断是否存在会存在问题，建议使用两个参数的返回模式。

  05:14Map元素的删除

  1.删除Map中元素的方法：使用内置的delete函数，指定Map类型和要删除的键。 2.删除不存在的元素：不会报错，可以放心使用。

  06:42Map的线程安全性

  1.Map不是线程安全的：在多线程环境下操作Map可能会出错。 2.并发编程中的注意事项：使用sync.Map进行线程安全的操作。

- 重点

  本视频暂不支持提取重点

#### 一、判断map中是否存在元素 ﻿00:02﻿

##### 1. 取值 ﻿00:18﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189719&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-7lL9vGFksvCrI2%2BpdPOV8TsMHjo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-dcfbcb0ade72b4aa8dfdbc4fd7b7c4285850804ef00f3e7711dc5832602ce7986f8794bbbbd7eb06f58a261ae016e9cab5c424799caad16e305a5e1275657320&expires=8h&r=621216171&vbdid=-&fin=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-1&fn=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-1&rtype=1&dp-logid=8969454265628622435&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=b3434a369726e9249598d5fd5939298950c82c8af7e7f19ca6c2ad6eeb587c84&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 基本取值：通过键直接访问值，如courseMap["grpc"]，若键不存在会返回零值
- 零值问题：当键不存在时返回对应类型的零值（如string返回空字符串），无法区分"键不存在"和"键对应零值"的情况

##### 2. 遍历 ﻿00:27﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189719&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-zzINV%2B3dNPMEHUqc%2FY%2FAO6sFvBE%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-00cd96e8685e8528e61da4bd543699ba272e6b8ee9ff57e0238ee0f2ac649d2fa4772fb0a835c3baf9cbc3973e48ecf1a321db0bde2b260e305a5e1275657320&expires=8h&r=984394373&vbdid=-&fin=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-2&fn=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-2&rtype=1&dp-logid=8969454265628622435&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068b85158c4a6b083512f16141c1a5ab403305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 无序性：map遍历顺序不固定，每次运行可能不同

- 遍历方式

  ：

  - 仅遍历键：for key := range courseMap
  - 同时获取键值：for key, value := range courseMap

- 注意事项：遍历前必须初始化map，否则会panic

##### 3. 判断元素是否存在 ﻿01:42﻿

###### 1）示例 ﻿03:14﻿

- ![img](https://bdcm01.baidupcs.com/file/p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-3?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189719&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-YX09vTr0UJTA8220LXtfOj5anDk%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-3f5ab410b9cc745b3c86feab3190754f12f802ca1a339475322ee80e86a94c70da29c73909be1ec12e8a7168c20fa3475810548827f3a57a305a5e1275657320&expires=8h&r=296931562&vbdid=-&fin=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-3&fn=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-3&rtype=1&dp-logid=8969454265628622435&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068fca2b103d063e44c2f16141c1a5ab403305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 正确方法：使用双返回值形式value, ok := courseMap[key]，其中ok为bool类型表示键是否存在

- 常见错误：仅通过返回值是否为nil/零值判断存在性，当值为零值时会产生误判

- 代码优化

  ：

  - 使用if简写形式：if _, ok := courseMap["java"]; !ok {...}
  - 当不需要值时可用匿名变量_忽略

- 实际应用：

#### 二、删除元素 ﻿05:18﻿

##### 1. 删除操作示例

- ![img](https://bdcm01.baidupcs.com/file/p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-4?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189719&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-XAN5hyR3DL6b2uYVYBE9B3mvntI%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-db925880ffd22e2e7931a658c62ff38de092b9ca4f2aa5f38090080c8ff3e6685d7beea2df01a12790655331b18838dba2a4ae7735fd525e305a5e1275657320&expires=8h&r=482089840&vbdid=-&fin=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-4&fn=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-4&rtype=1&dp-logid=8969454265628622435&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=66239664855e8068230408e99c62dfff2f16141c1a5ab403305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 内置函数：使用delete()函数删除map中的元素，语法为delete(map变量, key)
- 操作示例：delete(courseMap, "grpc")会删除courseMap中键为"grpc"的键值对
- 安全特性：删除不存在的key不会报错，如delete(courseMap, "rpc")可以安全执行

##### 2. 删除后验证

- ![img](https://bdcm01.baidupcs.com/file/p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-5?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189719&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-EheaX8aMsSZRL7qy7%2FqSx7eR56A%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-a2af5ee25574ef35068e55a6a091343649b52585cbc5ada17231ded5b64020c6ae7eaac7346fd10c9098501db615e089e45273dd1b45940e305a5e1275657320&expires=8h&r=798401428&vbdid=-&fin=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-5&fn=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-5&rtype=1&dp-logid=8969454265628622435&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=eae2efe893f98aac2c72557199f0d9e52f16141c1a5ab403305a5e1275657320&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 效果验证：删除后再次打印map，确认被删除的key不再出现
- 线程安全提示：map不是线程安全的，并发操作需要使用sync.Map

##### 3. 重要注意事项

- ![img](https://bdcm01.baidupcs.com/file/p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-6?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189719&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-sTnRwrJUDTmBPiNsCymd6LRJ4d4%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-0e8dee4f1ce6606ed1b3795dce525434a9cbe9363878c37d395ffcb43e8a3c19d8b36447792b49fe9c43fa166a0902b64fe9aa960aa1d752305a5e1275657320&expires=8h&r=462631812&vbdid=-&fin=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-6&fn=p-b32fa799cb11a7a52b7e351f620dd1d3-40-2025042100-6&rtype=1&dp-logid=8969454265628622435&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=6a9088c7620f7a1736564e37f877fcb0334539e975780232&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)
- 并发安全：原生map不支持并发读写，多个goroutine同时操作会报错
- 解决方案：并发场景应使用sync包中的Map类型，如var syncMap sync.Map
- 初始化要求：map必须初始化才能使用，可通过map[string]string{}或make(map[string]string, 3)初始化

#### 三、知识小结

| 知识点       | 核心内容                                         | 考试重点/易混淆点                                         | 难度系数 |
| ------------ | ------------------------------------------------ | --------------------------------------------------------- | -------- |
| map元素获取  | 通过键直接取值 vs 双返回值模式（值+存在布尔值）  | 空值判断陷阱：仅判断值是否为nil不准确，必须用双返回值模式 | ⭐⭐       |
| map元素删除  | 使用内置delete()函数，参数为map变量和键名        | 删除不存在的键不会报错，需注意静默处理特性                | ⭐        |
| 线程安全警告 | 原生map非线程安全，并发操作需使用sync.Map        | 关键区别：协程(g routine)并发时必须用同步map              | ⭐⭐⭐      |
| 代码优化技巧 | if条件简写语法：if val, ok := map[key]; ok {...} | 注意分号使用位置，与常规if语句的语法差异                  | ⭐⭐       |
| 类型系统特性 | 编译期自动转换单/双参数调用为不同底层函数        | 参数数量严格限定，不支持自定义参数数量                    | ⭐⭐⭐      |

 

- 摘要

  该视频主要讲述了Go语言容器中的最后一个数据结构——list（链表）。链表与slice（切片）相比，空间不连续，但插入数据方便，不需要频繁扩容和数据拷贝。然而，链表每个元素需要额外存储一个指针，造成空间浪费，且性能较slice低。在实际开发中，slice和map的应用场景更广，而链表相对较少使用。但在需要频繁插入数据的场景下，链表可能是一个更好的选择。

- 分段总结

  折叠

  00:01Go语言中的List数据结构

  1.List是一种链表数据结构，常见于数据结构学习中。 2.List与Slice的区别在于，List是链表，而Slice是动态数组。 3.Slice在添加数据时需要频繁扩容和拷贝数据，而List则不需要连续存储空间。

  01:12链表与数组的区别

  1.链表的存储空间不连续，可以灵活分配空间。 2.链表通过指针连接每个元素，空间利用率较低，但分配能力较强。 3.数组需要连续存储空间，适用于查询操作，但插入和删除元素较为麻烦。

  03:01List的性能特点

  1.List的插入和删除元素非常方便，适用于频繁插入和删除的场景。 2.List的查询性能较差，需要遍历链表来查找元素。 3.List的空间利用率较低，每个元素需要额外的指针空间。

  06:58List的应用场景

  1.List适用于需要频繁插入和删除元素的场景，如缓存系统、消息队列等。 2.List的查询性能较低，适用于对查询要求不高的场景。

- 重点

  本视频暂不支持提取重点

#### 一、list ﻿00:05﻿

- ![img](https://bdcm01.baidupcs.com/file/p-7faad988df030ebceaa8153b57ee4852-40-2025042100-1?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189934&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-hvQQ%2B1MLt1DrBuKhg17vgJmN2lo%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-4671ce30c5005427f57226f434a97f13e283791ae15d1cb240f94a10c32c2653227e9bbf3ef2b70c354bc8b77a50690dc9d96aaa144b6422305a5e1275657320&expires=8h&r=526587342&vbdid=-&fin=p-7faad988df030ebceaa8153b57ee4852-40-2025042100-1&fn=p-7faad988df030ebceaa8153b57ee4852-40-2025042100-1&rtype=1&dp-logid=8969512091091845491&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=7717645f262844cad63a337261ba09ef6fef75cc5d589e1d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

##### 1. slice ﻿00:23﻿

- 存储特性: slice本质是动态数组，要求底层必须是连续的存储空间
- 扩容机制: 添加数据时会触发扩容，需要重新分配空间并进行数据拷贝
- 空间限制: 当内存中没有足够大的连续空间时，无法分配对应大小的slice

##### 2. list优点 ﻿03:48﻿

- ![img](https://bdcm01.baidupcs.com/file/p-7faad988df030ebceaa8153b57ee4852-40-2025042100-2?bkt=en-3de6f374fcad9f514a94920d227b7f50&fid=282335-250528-&time=1756189934&sign=FDTAXUVGEQlBHSKfWqij-GBWOGYTBgG0KqHy7wNbwoLTVMyJyK6xE-YbZXTPl8YFXqswsCTgf2zHVGvCs%3D&to=93&size=10&sta_dx=10&sta_cs=0&sta_ft=&sta_ct=7&sta_mt=7&fm2=MH%2CBaoding%2CAnywhere%2C%2C%E7%A6%8F%E5%BB%BA%2Ccmnet&ctime=0&mtime=0&dt3=0&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=10&vuk=0&iv=2&vl=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-8bb0ddcec3e45fcd787c3b3a0bfa6082ca17acfa94755eec76256c056bffcb32c754ecea85517f30382f0c38cd00d8386ae841c308fd0991305a5e1275657320&expires=8h&r=121060836&vbdid=-&fin=p-7faad988df030ebceaa8153b57ee4852-40-2025042100-2&fn=p-7faad988df030ebceaa8153b57ee4852-40-2025042100-2&rtype=1&dp-logid=8969512091091845491&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=-1&csign=dmayhhcqdS1jXSxjkf6DN1P7N8o%3D&so=0&ut=1&uter=-1&serv=-1&uc=14133076&ti=7717645f262844ca5d56a4409b209f556fef75cc5d589e1d&hflag=30&from_type=&adg=n&reqlabel=250528_n_e216f4915c0670ff5c66254cab087ccb_0_65e64f12d02189817bbddbf3effd3c99&chkv=5&bid=250528&by=themis)

- 空间分配: 每个元素独立分配内存，不要求连续存储空间

- 指针机制: 每个节点包含数据域和指针域（next指针），通过指针连接节点

- 插入优势

  : 在任意位置插入新节点只需修改相邻节点的指针，时间复杂度

  ﻿O(1)O(1)O(1)﻿

- 删除优势: 删除节点只需修改相邻节点的指针指向，无需移动其他元素

- 适用场景: 适合频繁插入删除但查询要求不高的场景

###### 1）性能对比

- 查询效率

  : slice通过偏移量直接访问(

  ﻿O(1)O(1)O(1)﻿

  )，list需要遍历(O(n))

- 空间开销: list每个节点需要额外存储指针，存在约30%的空间浪费

- 实际应用: 90%以上场景使用slice和map，list主要用于特定需求场景

###### 2）操作示例

- 插入示例: 在节点2和3之间插入新节点，只需将2的next指向新节点，新节点next指向3
- 删除示例: 删除节点2时，将节点1的next直接指向节点3即可
- 内存分配: 每个新节点都独立申请内存空间，不受其他节点存储位置影响

#### 二、知识小结

| 知识点             | 核心内容                                         | 考试重点/易混淆点         | 难度系数 |
| ------------------ | ------------------------------------------------ | ------------------------- | -------- |
| Go语言List数据结构 | List是链表结构，元素通过指针连接，空间不连续     | 与Slice的连续存储特性对比 | ⭐⭐       |
| List的优势         | 插入删除高效，无需移动元素，适合频繁修改场景     | 指针操作原理              | ⭐⭐       |
| List的劣势         | 查询效率低(O(n))，需遍历指针链；存在额外存储开销 | next指针占用空间          | ⭐⭐⭐      |
| Slice的特性        | 动态数组，连续存储空间，支持快速随机访问(O(1))   | 扩容时的数据拷贝机制      | ⭐⭐       |
| 性能对比           | Slice查询快但插入慢，List插入快但查询慢          | 内存分配策略差异          | ⭐⭐⭐⭐     |
| 实际应用场景       | 90%场景使用Slice/Map，List仅用于特定高频插入场景 | 选择数据结构的决策依据    | ⭐⭐⭐      |
| 内存分配差异       | Slice需连续内存空间，List可分散分配              | 内存碎片化影响            | ⭐⭐⭐      |

- 摘要

  该视频主要讲述了如何在编程中使用list数据结构，包括其导入方式、初始化、插入数据的方法（如push_back、insert等）以及遍历数据的两种方式（正序和反向遍历）。视频详细解释了list的封装特性，如通过迭代器访问元素，并展示了如何通过迭代器的方法（如next、prev）来实现数据的遍历。同时，强调了代码可读性的重要性。

- 分段总结

  折叠

  00:01list的基本用法

  1.list是一个包，在container中，用于定义链表数据结构。 2.初始化list时，使用list关键字并定义变量类型。 3.向list中添加值主要在链表尾部或中间位置进行。 4.常用的方法包括push_back、insert_after、insert_before、move_after等。

  02:06list的打印与遍历

  1.打印list时，显示的是地址和值。 2.遍历list时，使用for循环和list的front、next方法。 3.front方法返回第一个元素，next方法返回下一个元素。 4.反向遍历时，使用back方法获取最后一个元素，并使用prev方法向前遍历。

  05:20list的初始化方式

  1.可以使用list关键字直接初始化列表。 2.初始化时可以指定列表的类型和值。 3.列表可以存储在尾部或头部，具体取决于使用的push方法。

  06:43list的插入操作

  1.insert_before方法允许在指定元素之前插入新元素。 2.需要遍历列表以找到要插入位置的目标元素。 3.插入操作基于元素的索引位置进行。

  10:15list的删除操作

  1.remove方法用于删除列表中的指定元素。 2.通过遍历列表找到要删除的元素，并调用remove方法。 3.删除操作基于元素的索引位置进行。

- 重点

  本视频暂不支持提取重点

### 一、20 道八股文题及答案（数组、map、切片底层原理及易错点）

#### 基础概念与区别

1. **问题**：数组（array）和切片（slice）在 Go 中的核心区别是什么？
   **答案**：
   - 数组是固定长度的，长度在声明时确定且不可修改；切片是动态长度的，可通过`append`自动扩容。
   - 数组是值类型，赋值或传参时会复制整个数组；切片是引用类型，赋值或传参时仅复制切片头（指向底层数组的指针、长度、容量）。
   - 数组的长度是类型的一部分（如`[3]int`和`[4]int`是不同类型）；切片的长度不是类型的一部分（`[]int`可表示任意长度的 int 切片）。
2. **问题**：切片的底层数据结构包含哪三个核心字段？各自的作用是什么？
   **答案**：
   切片底层是一个结构体，包含：
   - `ptr`：指向底层数组的指针（存储实际数据）。
   - `len`：切片当前的元素个数（访问时不能超过此值）。
   - `cap`：底层数组的容量（从`ptr`开始到数组末尾的元素个数，决定了`append`时是否需要扩容）。
3. ### **问题**：map 的底层实现是什么？简述其基本工作流程。
   
   **答案**：
   map 底层基于哈希表实现，核心结构是`hmap`（哈希表）和`bmap`（桶）。
   工作流程：
   
   - 对键进行哈希计算，得到哈希值。
   - 用哈希值的低几位确定桶的索引，找到对应的`bmap`。
   - 在桶中遍历查找键值对（若发生哈希冲突，通过链表法解决）。
   - 若负载因子超过阈值（默认 6.5），触发扩容以保证查找效率。
4. **问题**：为什么说数组是 “值类型” 而切片是 “引用类型”？这种差异会导致哪些操作上的不同？
   **答案**：
   - 数组是值类型：变量直接存储数据本身，赋值或传参时会复制整个数组的内容。
   - 切片是引用类型：变量存储的是指向底层数据的指针，赋值或传参时仅复制指针，不复制数据。
   - 差异表现：修改数组副本不会影响原数组；修改切片副本（元素）会影响原切片（因共享底层数组）。
5. **问题**：切片的 “长度（len）” 和 “容量（cap）” 有什么区别？如何通过代码获取和间接修改它们？
   **答案**：
   - `len`：当前切片中元素的实际数量，通过`len(s)`获取。
   - `cap`：底层数组的容量（从切片起始位置到数组末尾的元素数），通过`cap(s)`获取。
   - 间接修改：
     - `len`可通过切片操作（如`s = s[:3]`）缩小，或通过`append`增大（不超过`cap`时）。
     - `cap`只能通过`append`触发扩容时增大（新容量由扩容规则决定），无法主动缩小。

#### 底层原理与操作机制

1. **问题**：当对切片执行`append`操作时，什么情况下会触发底层数组的扩容？扩容后的新容量如何计算？
   **答案**：
   - 触发条件：`append`后元素总数超过当前`cap`时，会创建新数组并复制原数据。
   - 扩容规则（Go 1.18+）： ？？？？
     - 若原`cap < 256`，新`cap = 2 * 原cap`。
     - 若原`cap >= 256`，新`cap = 原cap + 原cap/4`（每次增加 25%）。
     - 特殊情况：若一次`append`添加多个元素，新`cap`会直接扩容到能容纳所有元素的最小容量。
2. **问题**：数组的内存布局有什么特点？为什么数组的长度必须是编译期常量？
   **答案**：
   - 内存布局：数组在内存中是连续的存储空间，元素按索引顺序依次排列，访问时可通过基地址 + 偏移量快速定位。
   - 长度必须为编译期常量：因为数组的长度是类型的一部分（如`[5]int`），而 Go 的类型检查在编译期进行，需要提前确定内存分配大小。
3. **问题**：map 的 “负载因子（load factor）” 是如何计算的？它对 map 的性能和扩容有什么影响？
   **答案**：
   - 计算方式：`负载因子 = 键值对数量 / 桶数量`。
   - 影响：
     - 负载因子过低（如 < 1）：桶数量过多，浪费内存。
     - 负载因子过高（如 > 6.5）：哈希冲突概率增加，查找效率下降（遍历桶的时间变长）。
     - Go 中当负载因子超过 6.5 时，会触发扩容（增加桶数量），以降低负载因子，保证 O (1) 级别的查找效率。
4. **问题**：切片的切片操作（如`s[i:j]`）会创建新的底层数组吗？新切片的`len`和`cap`如何确定？
   **答案**：
   - 不会创建新的底层数组，新切片与原切片共享底层数组。
   - 新切片的`len = j - i`。
   - 新切片的`cap = 原切片的cap - i`（从原切片的起始索引`i`到原底层数组末尾的长度）。
5. ### **问题**：map 的 “桶（bucket）” 结构是什么？当发生哈希冲突时，map 如何处理？
   
   **答案**：
   
   - 桶（`bmap`）是存储键值对的基本单元，每个桶可存储 8 个键值对。
   - 哈希冲突处理：当多个键哈希后指向同一个桶时，这些键值对会按顺序存储在桶内，形成链表结构（“溢出桶”）。查找时需遍历桶内所有元素匹配键。

#### 易错点与边界情况

1. **问题**：为什么 map 的键必须是 “可比较类型”？哪些类型不能作为 map 的键？
   **答案**：
   - 原因：map 查找键时需要通过`==`判断是否匹配，因此键必须支持比较操作。
   - 不可作为键的类型：切片、map、函数（这些类型不支持`==`比较）；以及包含上述类型的结构体 / 数组。
2. **问题**：切片的 “nil 切片” 和 “空切片（len=0, cap=0）” 有什么区别？如何判断一个切片是否为 nil？
   **答案**：
   - 区别：
     - nil 切片：未初始化（如`var s []int`），`ptr`字段为 nil，`len`和`cap`为 0。
     - 空切片：已初始化但无元素（如`s := make([]int, 0)`），`ptr`指向一个空数组（非 nil），`len`和`cap`为 0。
   - 判断 nil 切片：只能通过`s == nil`，不能通过`len(s) == 0`（空切片的`len`也是 0）。
3. **问题**：当多个切片共享同一个底层数组时，修改其中一个切片的元素会对其他切片产生影响吗？为什么？
   **答案**：
   - 会产生影响。因为多个切片共享同一个底层数组，修改元素本质上是修改底层数组的内容，所有共享该数组的切片都会 “看到” 这个修改。
4. **问题**：数组作为函数参数传递时，函数内部对数组的修改会影响外部原数组吗？为什么？
   **答案**：
   - 不会影响。因为数组是值类型，作为参数传递时会复制整个数组的副本，函数内部修改的是副本，原数组不受影响。
5. **问题**：为什么在 Go 中不能直接用`==`比较两个切片？如何判断两个切片的元素是否完全相等？
   **答案**：
   - 不能直接用`==`的原因：切片是引用类型，`==`只能判断是否为 nil，不能比较元素内容（语言设计限制）。
   - 判断元素相等的方法：手动遍历两个切片，逐一比较对应索引的元素（需先检查`len`是否相等，再比较每个元素）。

#### 深入进阶

1. ### **问题**：map 在扩容时，“增量扩容” 和 “等量扩容” 分别在什么场景下触发？扩容的完整流程是什么？
   
   **答案**：
   
   - 增量扩容：当负载因子超过阈值（6.5）时触发，新桶数量为原桶数量的 2 倍，目的是降低负载因子。
   - 等量扩容：当桶中存在大量已删除的键值对（“哈希表拥挤”）时触发，新桶数量与原桶数量相同，目的是整理碎片，提高空间利用率。
   - 扩容流程：
     1. 创建新桶数组。
     2. 将原桶中的键值对 “渐进式” 迁移到新桶（不一次性迁移，避免阻塞）。
     3. 迁移完成后，新桶数组替代原桶数组。
   
2. **问题**：切片的`append`操作在传递给函数时，为什么有时会修改外部切片，有时不会？请举例说明。
   **答案**：

   - 若`append`未触发扩容（新长度≤原容量），函数内的切片与外部切片共享底层数组，修改会影响外部。

   - 若`append`触发扩容（新长度 > 原容量），函数内的切片会指向新的底层数组，修改不会影响外部。

   - 示例：

     go

     ```go
     func f(s []int) {
         s = append(s, 4) // 若原cap足够，修改影响外部；否则不影响
     }
     func main() {
         s := make([]int, 3, 3) // len=3, cap=3
         f(s) // append触发扩容，s仍为[0,0,0]
     }
     ```

3. **问题**：数组的长度超过一定阈值后，作为函数参数传递会对性能产生什么影响？如何优化？
   **答案**：

   - 影响：数组是值类型，传递时会复制整个数组。长度过大（如 10^6 元素）会导致内存拷贝开销剧增，降低性能。
   - 优化：传递数组的切片（如`arr[:]`），切片传递仅复制 3 个字段（指针、len、cap），开销极小，且能访问原数组元素。

4. **问题**：map 的`delete`操作会立即释放键值对占用的内存吗？为什么？
   **答案**：

   - 不会立即释放。`delete`仅标记键值对为 “已删除”，不会立即回收桶的内存。
   - 原因：避免频繁的内存分配 / 释放开销，内存会在 map 扩容时（迁移键值对）被间接回收。

5. **问题**：切片可能导致 “内存泄漏” 的场景是什么？如何避免？
   **答案**：

   - 场景：当一个小切片引用了一个大的底层数组，即使小切片不再使用，大数组也不会被 GC 回收（因被引用），导致内存浪费。
   - 避免方法：通过`copy`创建新的切片（如`s := make([]int, len(small)); copy(s, small)`），使新切片引用独立的小底层数组，原大数组可被回收。

### 二、10 道场景题及答案（难度递增）

#### Level 1：基础操作理解

1. **场景**：定义切片`s := []int{1, 2, 3, 4, 5}`，执行`s1 := s[1:3]`后：

   - `s1`的`len`和`cap`分别是多少？
   - 若修改`s1[0] = 10`，原切片`s`的值会如何变化？为什么？

   **答案**：

   - `s1`的`len=2`（3-1），`cap=4`（原`s`的`cap=5` - 起始索引 1）。
   - 原切片`s`会变为`[1, 10, 3, 4, 5]`。因为`s1`与`s`共享底层数组，修改`s1`的元素会直接修改底层数组。

#### Level 2：数组与切片传递差异

1. **场景**：定义函数`func modify(arr [3]int) { arr[0] = 100 }`，主函数中执行：

   go

   ```go
var a = [3]int{1, 2, 3}
   modify(a)
fmt.Println(a[0]) // 输出什么？为什么？
   ```

   **答案**：
输出`1`。因为数组是值类型，`modify`函数接收的是`a`的副本，修改副本不会影响原数组`a`。

#### Level 3：切片扩容机制

1. **场景**：在 Go 1.18 + 环境下，执行以下代码：

   go

   运行

   ```go
   s := make([]int, 0, 2) // len=0, cap=2
   s = append(s, 1, 2)    // 第一次append
   s = append(s, 3)       // 第二次append
   ```

   第二次`append`后，`s`的`cap`是多少？请说明扩容规则。

   **答案**：
   `cap`为 4。
   规则：原`cap=2 < 256`，扩容时新`cap`为原`cap`的 2 倍（2*2=4），可容纳新增的元素 3。

#### Level 4：map 键类型限制

1. **场景**：尝试执行以下代码会报错吗？为什么？如何修改才能实现 “用切片作为键” 的需求？

   go

   运行

   ```go
   m := make(map[[]int]string)
   m[[1,2,3]] = "test"
```
   
**答案**：
   
- 会报错，因为切片是不可比较类型，不能作为 map 的键。
   
- 修改方法：将切片转换为可比较类型（如字符串），例如：
   
     go
   
     运行

     ```go
m := make(map[string]string)
     m[fmt.Sprintf("%v", []int{1,2,3})] = "test" // 用字符串表示切片
```

#### Level 5：切片共享底层数组风险

1. **场景**：执行以下代码后，`s2[0]`的值是多少？为什么？

   go

   运行

   ```go
   s := []int{1, 2, 3, 4, 5}
   s1 := s[1:3]  // s1: [2,3], len=2, cap=4
   s2 := s[2:4]  // s2: [3,4], len=2, cap=3
   s1[1] = 100   // 修改s1的第二个元素

**答案**：
   `s2[0]`的值是 100。
因为`s1`和`s2`共享底层数组，`s1[1]`对应底层数组索引`1+1=2`，`s2[0]`也对应索引 2，修改`s1[1]`会同步影响`s2[0]`。

#### Level 6：map 并发安全问题

1. **场景**：两个 goroutine 同时对同一个 map 执行写操作（如下），会发生什么问题？如何修复？

   go

   运行

   ```go
   m := make(map[int]int)
   go func() {
       for i := 0; i < 1000; i++ {
           m[i] = i
       }
   }()
   go func() {
       for i := 1000; i < 2000; i++ {
           m[i] = i
       }
   }()
   
   **答案**：
   
   - 问题：map 不是并发安全的，多个 goroutine 同时写会导致 panic（“concurrent map writes”）。
   - 修复方法：
     1. 使用`sync.Mutex`或`sync.RWMutex`加锁保护 map 操作。
     2. 使用 Go 1.9 + 提供的`sync.Map`（专为并发场景设计的 map）。

#### Level 7：切片 nil 与空切片判断

1. **场景**：以下代码中，`s1 == nil`和`s2 == nil`的结果分别是什么？如何正确判断一个切片是否 “没有元素”？

   go

   ```go
   var s1 []int       // 声明未初始化
   s2 := make([]int, 0) // 初始化但长度为0

**答案**：

- `s1 == nil` 结果为`true`（s1 是 nil 切片）。
   - `s2 == nil` 结果为`false`（s2 是空切片，已初始化）。
- 判断 “没有元素”：通过`len(s) == 0`（无论 nil 切片还是空切片，`len`都是 0）。

#### Level 8：大数组性能优化

1. **场景**：定义一个包含 100 万个`int`的数组`a := [1000000]int{}`，需要在函数间传递并修改其中元素。直接传递数组和传递其切片（`a[:]`），哪种方式性能更好？为什么？

   **答案**：
   传递切片`a[:]`性能更好。
   原因：直接传递数组会复制 100 万个`int`（约 4MB 内存），开销大；传递切片仅复制 3 个字段（指针、len、cap，共 24 字节），几乎无开销，且修改切片元素会直接影响原数组。

#### Level 9：map 扩容触发条件

1. **场景**：假设 map 初始桶数量为 8，负载因子阈值为 6.5。当向 map 中添加多少个键值对时，会触发第一次扩容？请说明计算逻辑。

   **答案**：
   会在添加第 53 个键值对时触发扩容。
   计算逻辑：负载因子 = 键值对数量 / 桶数量。当键值对数量 = 8 * 6.5 = 52 时，负载因子刚好达到 6.5；添加第 53 个时，负载因子 = 53/8 = 6.625 > 6.5，触发扩容。

#### Level 10：复杂切片操作与内存问题

1. **场景**：执行以下代码后，`s`的值是什么？底层数组发生了什么变化？此时访问`s[4]`会有什么风险？

   go

   ```go
   s := []int{1, 2, 3, 4, 5} // len=5, cap=5
   s = append(s[:2], s[3:]...) // 保留索引0、1和3、4的素
   
   **答案**：
   
   - `s`的值是`[1, 2, 4, 5]`（`len=4, cap=5`）。
   - 底层数组变化：原数组为`[1,2,3,4,5]`，`append`操作会将`s[3:]`（即`[4,5]`）复制到`s[:2]`（即`[1,2]`）后面，覆盖原索引 2 的元素，数组变为`[1,2,4,5,5]`。
   - 访问`s[4]`的风险：`s`的`len=4`，访问索引 4 会触发运行时 panic（“index out of range”）。

以下是结合 Go 中切片（类似 list 的动态序列）的 30 道大厂级面试题，涵盖底层原理、高级特性、性能优化及场景应用，难度递增且贴近真实面试场景：

### 一、底层原理与核心特性（1-10 题）

1. **问题**：切片的`len`和`cap`在底层如何存储？当执行`s = s[:0]`时，`len`和`cap`如何变化？此时切片是否仍引用原底层数组？
   **答案**：
   - 底层通过`reflect.SliceHeader`结构体存储：`Data`（指针）、`Len`（长度）、`Cap`（容量）。
   - `s = s[:0]`后，`len=0`，`cap`不变，仍引用原底层数组。此时切片为空但未释放底层数组引用，可能导致内存泄漏。
2. **问题**：切片的`append`操作在什么情况下会复用原底层数组？什么情况下会导致 “长度溢出” 的 panic？
   **答案**：
   - 当`append`后新长度≤原`cap`时复用原数组；新长度 > 原`cap`时创建新数组。
   - 当切片通过`s[i:j:k]`（限定容量`k`）创建，且`append`后长度超过`k`时，会触发 “len out of range” panic（因显式限制了最大容量）。
3. **问题**：对比`make([]int, 5)`和`make([]int, 0, 5)`的底层差异，哪种更适合需要频繁`append`的场景？
   **答案**：
   - `make([]int,5)`：len=5，cap=5，底层数组初始化 5 个 0 值元素。
   - `make([]int,0,5)`：len=0，cap=5，底层数组未初始化元素（内存已分配）。
   - 后者更适合频繁`append`：初始长度为 0，`append`时直接从索引 0 开始填充，无需覆盖初始 0 值，效率更高。
4. **问题**：Go 1.21 中引入的`slices.Clone`函数与手动`copy`创建切片副本相比，有什么底层差异？
   **答案**：
   - `slices.Clone(s)`：创建新切片，长度和容量均为`len(s)`，底层数组是原数组的副本（独立内存）。
   - 手动`copy`：需先创建目标切片（如`s2 := make([]T, len(s))`），再`copy(s2, s)`，结果与`Clone`一致，但`Clone`更简洁。
   - 核心差异：`Clone`是标准库实现，对所有可切片类型（如字符串转为`[]byte`）更通用，且避免手动计算长度的错误。
5. **问题**：切片的 “零值”（nil 切片）与`make([]T, 0)`创建的空切片，在 JSON 序列化时有什么差异？为什么？
   **答案**：
   - nil 切片序列化结果为`null`。
   - 空切片（`len=0, cap=0`但非 nil）序列化结果为`[]`。
   - 原因：JSON 序列化库（如`encoding/json`）会检查切片指针是否为 nil，nil 切片指针为 nil，空切片指针指向空数组地址。
6. **问题**：当切片元素为引用类型（如`[]*int`）时，执行`s2 := append([]*int(nil), s...)`后，修改`s2[0]`的指向会影响`s`吗？修改`s2[0]`的底层值呢？
   **答案**：
   - 修改`s2[0]`的指向（如`s2[0] = new(int)`）：不影响`s`，因切片元素是指针，副本存储的是指针值，修改副本的指针指向不影响原切片的指针。
   - 修改`s2[0]`的底层值（如`*s2[0] = 10`）：影响`s`，因两者的指针指向同一个内存地址，修改该地址的值会同步反映。
7. **问题**：切片的`for range`遍历中，为什么修改循环变量不会影响原切片？如何正确修改原切片元素？
   **答案**：
   - 原因：`for range`会创建循环变量的副本，修改副本不会影响原切片元素（值类型元素）。
   - 正确方式：通过索引访问并修改，如`for i, v := range s { s[i] = v * 2 }`。
8. **问题**：底层数组的内存对齐对切片性能有什么影响？如何利用内存对齐优化切片操作？
   **答案**：
   - 影响：CPU 按固定字节数（如 64 位系统的 8 字节）读取内存，未对齐的数组会导致额外的内存访问，降低切片读写效率。
   - 优化：创建切片时指定容量为内存对齐值的倍数（如`make([]int, 0, 1024)`，`int`在 64 位系统占 8 字节，1024 是 8 的倍数），减少 CPU 访问次数。
9. **问题**：解释切片的 “预分配” 策略（`make`时指定足够`cap`）能提升性能的底层原因，并举一个反例说明过度预分配的弊端。
   **答案**：
   - 性能提升原因：避免`append`时的多次扩容（内存分配 + 数据复制），减少 GC 压力。
   - 过度预分配弊端：若实际使用长度远小于预分配`cap`（如预分配 10000 容量却只存 10 个元素），会浪费内存，且大内存块更难被 GC 回收，导致内存利用率下降。
10. **问题**：切片作为函数返回值时，若其底层数组很大但实际使用元素很少，会导致什么问题？如何避免？
    **答案**：
    - 问题：“内存泄漏”—— 切片引用大数组的小部分元素，导致整个大数组无法被 GC 回收。
    - 避免方法：返回前通过`copy`创建独立的小切片，如`func trim(s []int) []int { res := make([]int, len(s)-2); copy(res, s[1:len(s)-1]); return res }`。

### 二、易错点与边界场景（11-20 题）

1. **问题**：执行以下代码，`s`和`s1`的`len`、`cap`及元素值分别是什么？为什么？

   go

   ```go
   s := []int{1, 2, 3, 4, 5}
   s1 := s[1:3:3] // 第三个参数为cap限制
   s1 = append(s1, 6)
   ```

   **答案**：

   - `s`：`len=5, cap=5`，元素`[1,2,3,4,5]`（未被修改，因`s1`的`cap`被限制为 3，`append`时触发扩容，`s1`指向新数组）。
- `s1`：`len=3, cap=6`（原`cap=3`，扩容后为 6），元素`[2,3,6]`。
   - 原因：`s[1:3:3]`将`s1`的`cap`限制为`3-1=2`？不，`s[i:j:k]`中`k`为新切片的`cap`上限，必须满足`i ≤ j ≤ k ≤ cap(s)`，故`s1`初始`len=2, cap=2`（`k=3`，`cap=3-1=2`）。`append`添加元素 6 时，`len=3 > cap=2`，触发扩容（新`cap=4`），`s1`指向新数组，与`s`脱离关联。

2. **问题**：以下代码是否会导致 panic？若不会，输出结果是什么？

   go

   

   运行

   

   ```go
   s := []int{1, 2, 3}
   s = append(s[:1], s[2:]...)
   fmt.Println(s, len(s), cap(s))
   ```

   **答案**：
   不会 panic，输出`[1 3] 2 3`。
   解析：`s[:1]`为`[1]`（`len=1, cap=3`），`s[2:]`为`[3]`，`append`后将 3 追加到`[1]`后，覆盖原底层数组索引 1 的元素（2 被 3 覆盖），新切片`s`的`len=2`，`cap=3`（未扩容）。
   
3. **问题**：为什么以下代码中，`len(s)`的结果是 4 而不是 5？

   go

   

   运行

   

   ```go
   s := make([]int, 0, 5)
   for i := 0; i < 5; i++ {
       s = append(s, i)
       if i == 3 {
           s = s[:0]
       }
   }
   ```
   
   **答案**：
   
   - 循环过程：
     - `i=0`：`s = [0]`（`len=1`）。
     - `i=1`：`s = [0,1]`（`len=2`）。
     - `i=2`：`s = [0,1,2]`（`len=3`）。
     - `i=3`：`s = [0,1,2,3]` → 执行`s = s[:0]`（`len=0, cap=5`）。
     - `i=4`：`s = append(s[:0], 4)` → `len=1`。
   - 最终`len(s)=1`？原问题描述有误，正确结果应为 1。核心点：`s[:0]`重置长度为 0，但底层数组仍可被`append`复用，后续添加元素从索引 0 开始覆盖。
   
4. **问题**：以下代码中，`g()`函数返回的切片是否会导致原数组被长期引用？如何修复？

   go

   

   运行

   ```go
   func f() []int {
       a := [10000]int{} // 大数组
       return g(a[:])
   }
   func g(s []int) []int {
       return s[5:10] // 返回小切片
   }
   ```
   
   **答案**：
   
   - 会导致内存泄漏：`g()`返回的切片引用原大数组`a`的部分元素，`a`无法被 GC 回收，即使只使用 5 个元素，也占用 10000 个`int`的内存。
   - 修复：在`g()`中通过`copy`创建独立切片，如`func g(s []int) []int { res := make([]int, 5); copy(res, s[5:10]); return res }`。
   
5. **问题**：当切片元素为结构体时，`append`操作的性能与元素为指针的切片相比有何差异？为什么？
   **答案**：

   - 差异：元素为结构体的切片在`append`扩容时，需复制整个结构体（深拷贝），性能低于元素为指针的切片（仅复制指针，浅拷贝）。
   - 原因：结构体是值类型，复制时需拷贝所有字段；指针是引用类型，复制时仅拷贝内存地址（8 字节），尤其结构体体积较大时，差异更明显。

6. **问题**：以下代码中，`s2`的元素值是什么？解释 “切片重叠” 导致的意外行为。

   go

   

   运行

   ```go
   s := []int{1, 2, 3, 4, 5}
   s1 := s[1:4] // [2,3,4]
   s2 := s[2:5] // [3,4,5]
   copy(s1, s2) // 将s2复制到s1
   ```
   
   **答案**：
   `s2`的元素变为`[3,3,4]`。
   解析：`s1`和`s2`共享底层数组且内存重叠（`s1`覆盖索引 1-3，`s2`覆盖索引 2-4）。`copy`执行时，从左到右复制：
   
   - `s1[0] = s2[0]` → 索引 1=3（原 2→3）。
   - `s1[1] = s2[1]` → 索引 2=4（原 3→4）。
   - `s1[2] = s2[2]` → 索引 3=5（原 4→5）。
     此时`s2`对应索引 2-4 的值为`[4,5,5]`？原分析有误，正确结果应为`s2`变为`[4,5,5]`。核心点：重叠切片的`copy`可能导致数据覆盖，需谨慎使用。
   
7. **问题**：为什么不能用`for range`遍历切片时删除元素？写出正确的删除切片中间元素的代码，并说明其时间复杂度。
   **答案**：

   - 原因：`for range`遍历的是切片的初始长度，删除元素后切片`len`减小，但循环次数不变，可能访问到已删除的元素或越界。

   - 正确代码（删除索引

     ```
     i
     ```

     处元素）：

     go

     ```go
     func deleteElem(s []int, i int) []int {
         if i < 0 || i >= len(s) {
             return s
         }
         return append(s[:i], s[i+1:]...)
     }
     ```
     
   - 时间复杂度：O (n)，因需将`i+1`后的元素复制到`i`位置。
   
8. **问题**：以下代码在并发场景下是否安全？为什么？如何修改才能在多个 goroutine 中安全地向切片添加元素？

   go

   ```go
   var s []int
   for i := 0; i < 10; i++ {
    go func() {
           s = append(s, i)
    }()
   }
```
   
**答案**：
   
- 不安全：`append`操作在并发时会导致数据竞争（同时修改切片的`len`和底层数组），可能引发 panic 或数据错乱。
   
   - 修复：使用
   
```
     sync.Mutex
     ```
       
     加锁保护切片操作，或使用
    
     ```
  channel
     ```

     收集元素后批量添加：
    
     go


​     

     ```go
  var (
         s []int
         mu sync.Mutex
     )
  for i := 0; i < 10; i++ {
         go func(val int) {
          mu.Lock()
             s = append(s, val)
          mu.Unlock()
         }(i)
  }
     ```

9. **问题**：切片的`len`是否可能大于`cap`？什么操作会导致这种情况？此时访问切片会发生什么？
   **答案**：

   - 可能。通过不安全的`reflect`操作或`unsafe`包强制修改`SliceHeader`的`Len`字段，可使`len > cap`。
   - 后果：访问`len`范围内但超过`cap`的索引时，会触发 “index out of range” panic（因`cap`是底层数组的实际可用长度）。

10. **问题**：对比`[]byte("hello")`和`[]rune("hello")`的底层存储差异，当字符串包含中文时（如`"你好"`），哪种切片的`len`更能反映字符数量？
    **答案**：

    - 差异：`[]byte("hello")`存储字节（ASCII 码，每个字符 1 字节），`len=5`；`[]rune("hello")`存储 Unicode 码点（每个字符 1 个`rune`），`len=5`。
    - 中文场景：`"你好"`的`[]byte`长度为 6（每个中文字符占 3 字节 UTF-8 编码），`[]rune`长度为 2（每个中文字符对应 1 个`rune`），故`[]rune`的`len`更能反映实际字符数量。

### 三、综合应用与性能优化（21-30 题）

1. **问题**：设计一个函数，高效合并两个有序切片（假设均为升序），要求时间复杂度 O (n)，空间复杂度 O (1)（可修改原切片）。
   **答案**：

   go

   ```go
   func merge(a, b []int) []int {
       // 确保a有足够容量容纳合并结果
       totalLen := len(a) + len(b)
       if cap(a) < totalLen {
           // 若容量不足，创建新切片（仍保持O(n)时间）
           newA := make([]int, len(a), totalLen)
           copy(newA, a)
           a = newA
       }
       i, j, k := len(a)-1, len(b)-1, totalLen-1
       // 从尾部合并，避免覆盖未处理元素
       for i >= 0 && j >= 0 {
           if a[i] > b[j] {
               a[k] = a[i]
               i--
           } else {
               a[k] = b[j]
               j--
           }
           k--
       }
       // 复制剩余元素（b中可能有剩余）
       copy(a[:k+1], b[:j+1])
       return a[:totalLen]
   }
   ```
   
2. **问题**：实现一个 “滑动窗口” 函数，输入一个切片和窗口大小`k`，返回每个窗口内元素的和。要求时间复杂度 O (n)，空间复杂度 O (1)（除结果外）。
   **答案**：

   go

   

   ```go
   func slidingWindowSum(nums []int, k int) []int {
       if k <= 0 || k > len(nums) {
           return nil
       }
       res := make([]int, 0, len(nums)-k+1)
       // 计算第一个窗口的和
       sum := 0
       for i := 0; i < k; i++ {
           sum += nums[i]
       }
       res = append(res, sum)
       // 滑动窗口：减去左边界，加上右边界
       for i := k; i < len(nums); i++ {
           sum += nums[i] - nums[i-k]
           res = append(res, sum)
       }
       return res
   }
   ```
   
3. **问题**：如何高效地对一个切片进行去重（保持元素顺序）？对比 “哈希表辅助” 和 “双层循环” 两种方法的时间 / 空间复杂度。
   **答案**：

   - 哈希表辅助法（推荐）：

     go

     ```go
     func unique(s []int) []int {
         seen := make(map[int]bool)
         res := make([]int, 0, len(s))
         for _, v := range s {
             if !seen[v] {
                 seen[v] = true
                 res = append(res, v)
             }
         }
         return res
     }
     ```
     
     时间复杂度 O (n)，空间复杂度 O (n)（存储去重元素）。
     
   - 双层循环法：
   
     go
   
     ```go
     func uniqueSlow(s []int) []int {
         res := make([]int, 0, len(s))
         for i, v := range s {
             duplicate := false
             for j := 0; j < i; j++ {
                 if s[j] == v {
                     duplicate = true
                     break
                 }
             }
             if !duplicate {
                 res = append(res, v)
             }
         }
         return res
     }
     ```
     
     时间复杂度 O (n²)，空间复杂度 O (1)（除结果外）。
     
   - 结论：哈希表法更适合大数据量，双层循环适合数据量小且内存受限的场景。
   
4. **问题**：设计一个函数，将切片中的元素按奇偶分离（奇数在前，偶数在后），要求原地修改且保持奇数间、偶数间的相对顺序。
   **答案**：

   go

   ```go
   func partitionOddEven(nums []int) {
       // 思路：类似插入排序，找到奇数插入到左侧已处理奇数的末尾
       oddIdx := 0 // 下一个奇数应放置的位置
       for i := 0; i < len(nums); i++ {
           if nums[i]%2 == 1 { // 奇数
               // 将当前奇数插入到oddIdx位置
               if i != oddIdx {
                   // 保存当前奇数，将中间元素右移
                   temp := nums[i]
                   copy(nums[oddIdx+1:i+1], nums[oddIdx:i])
                   nums[oddIdx] = temp
               }
               oddIdx++
           }
       }
   }
   ```
   
5. **问题**：在处理超大切片（如 100 万个元素）时，为什么使用`for i := 0; i < len(s); i++`遍历比`for range`更高效？实际测试中可能存在哪些例外情况？
   **答案**：

   - 效率原因：`for range`会创建循环变量的副本（尤其元素是大结构体时），而索引遍历直接访问元素，减少内存拷贝。
   - 例外情况：
     - 当切片元素为指针或小尺寸类型（如`int`）时，`for range`的性能与索引遍历接近（编译器可能优化）。
     - 当切片存在大量内存碎片（不连续）时，索引遍历的缓存命中率可能降低，性能反而不如`for range`。

6. **问题**：实现一个 “切片池”（sync.Pool）用于复用临时切片，减少频繁创建 / 销毁切片的内存开销。说明其适用场景和注意事项。
   **答案**：

   go

   ```go
   import "sync"
   
   var slicePool = sync.Pool{
       New: func() interface{} {
           // 初始创建一个容量为1024的切片
           return make([]byte, 0, 1024)
       },
   }
   
   // 获取复用切片
   func getSlice() []byte {
       return slicePool.Get().([]byte)[:0] // 重置长度为0，保留容量
   }
   
   // 归还切片到池
   func putSlice(s []byte) {
       // 限制最大容量，避免池内积累过大切片
       if cap(s) <= 4096 {
           slicePool.Put(s)
       }
   }
   ```
   
   适用场景：高频创建相同类型临时切片（如 HTTP 请求处理中的缓冲区）。
   注意事项：
   
   - 切片池中的元素可能被 GC 回收，不能依赖其持久性。
   - 避免存入过大切片，防止内存占用过高。
   - 多 goroutine 共享时需注意并发安全（`sync.Pool`本身是并发安全的）。
   
7. **问题**：如何判断一个切片是否包含某个元素？对比 “线性查找”、“排序 + 二分查找”、“哈希表预存” 三种方法的适用场景。
   **答案**：

   - 线性查找：`func contains(s []int, x int) bool { for _, v := range s { if v == x { return true }; return false }`
     适用：小规模切片（n<100），无需预处理。

   - 排序 + 二分查找：

     go

     ```go
   import "sort"
     func containsSorted(s []int, x int) bool {
       sort.Ints(s)
         return sort.SearchInts(s, x) < len(s)
   }
     ```

     适用：需多次查询的中大规模切片（n>100），一次排序多次查找。

   - 哈希表预存：`func containsHash(s []int, x int) bool { m := make(map[int]bool); for _, v := range s { m[v] = true }; return m[x] }`
     适用：高频查询且内存充足的场景，空间换时间。
   
8. **问题**：设计一个函数，将切片旋转`k`位（如`[1,2,3,4,5]`旋转 2 位后为`[4,5,1,2,3]`），要求时间复杂度 O (n)，空间复杂度 O (1)。
   **答案**：

   go

   ```go
   func rotate(s []int, k int) {
       n := len(s)
       if n == 0 || k%n == 0 {
           return
       }
       k %= n // 处理k>n的情况
       // 三步反转法
       reverse(s[:n-k])   // 反转前n-k个元素
       reverse(s[n-k:])   // 反转后k个元素
       reverse(s)         // 反转整个切片
   }
   
   func reverse(s []int) {
       for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
           s[i], s[j] = s[j], s[i]
       }
   }
   ```
   
9. **问题**：在 Go 中，如何高效地比较两个大切片（如 10 万个元素）的内容是否完全相等？写出实现代码并说明优化点。
   **答案**：

   go

   ```go
   import "bytes"
   
   // 对于[]byte，使用标准库bytes.Equal（汇编优化，最快）
   func equalBytes(a, b []byte) bool {
       return bytes.Equal(a, b)
   }
   
   // 对于一般切片，先比较长度，再逐元素比较
   func equalInts(a, b []int) bool {
       if len(a) != len(b) {
           return false
       }
       for i := range a {
           if a[i] != b[i] {
               return false
           }
       }
       return true
   }
   ```
   
   优化点：
   
   - 先比较长度，不等则直接返回（O (1) 快速排除）。
   - 对于`[]byte`，优先使用`bytes.Equal`（底层用汇编实现，比 Go 循环快数倍）。
   - 对于大切片，可考虑分块并行比较（利用多核），但需权衡并行开销。
   
10. **问题**：分析以下代码的性能瓶颈，并优化使其能高效处理 100 万个整数的去重和排序：

    go

    

    运行

    ```go
    func process(nums []int) []int {
        // 去重
        unique := make([]int, 0)
        for _, v := range nums {
            exists := false
            for _, u := range unique {
                if v == u {
                    exists = true
                    break
                }
            }
            if !exists {
                unique = append(unique, v)
            }
        }
        // 排序
        for i := 0; i < len(unique); i++ {
            for j := i + 1; j < len(unique); j++ {
                if unique[j] < unique[i] {
                    unique[i], unique[j] = unique[j], unique[i]
                }
            }
        }
        return unique
    }
    ```
    
    **答案**：
    
    - 性能瓶颈：
    
      1. 去重使用双层循环，时间复杂度 O (n²)，处理 100 万元素时极慢。
      2. 排序使用冒泡排序，时间复杂度 O (m²)（m 为去重后元素数），效率低下。
    
    - 优化代码：
    
      go
    
      运行
    
      ```go
      import "sort"
      
      func processOptimized(nums []int) []int {
          // 去重：使用map，O(n)时间
          seen := make(map[int]bool, len(nums))
          unique := make([]int, 0, len(nums))
          for _, v := range nums {
              if !seen[v] {
                  seen[v] = true
                  unique = append(unique, v)
              }
          }
          // 排序：使用标准库sort，O(m log m)时间
          sort.Ints(unique)
          return unique
      }
      ```
      
    - 优化后复杂度：去重 O (n)，排序 O (m log m)，可高效处理百万级数据。

### 总结

这些题目覆盖了 Go 切片的底层原理（如扩容、内存布局）、易错场景（如共享底层数组、并发安全）、性能优化（如预分配、复用）及综合应用（如算法实现），与大厂面试中注重 “原理理解 + 工程实践” 的风格一致。解题的核心在于深入理解切片的引用特性、内存管理及 Go 语言的优化细节。



# 难点

## map底层实现

要深入理解 Go 语言中`map`的底层实现，需从**核心数据结构**、**哈希冲突解决**、**关键操作（查找 / 插入 / 删除）**、**扩容机制**及**设计优化**五个维度展开。Go 的`map`并非传统意义上的 “哈希表”，而是一套基于 “哈希桶数组 + 链表 / 红黑树” 的高效管理体系，其设计重点在于**内存效率**和**避免长时间 STW（Stop The World）**。

## 一、核心数据结构：hmap 与 bmap

Go 的`map`底层由两个关键结构体支撑：`hmap`（顶层管理结构）和`bmap`（哈希桶），二者协同实现键值对的存储与管理。

### 1. 顶层结构体：hmap（hash map）

`hmap`是`map`的 “总控制器”，存储了全局管理信息，定义在`src/runtime/map.go`中（简化版关键字段如下）：

go

```go
type hmap struct {
    count     int           // 当前map中的元素个数（len(map)的返回值）
    B         uint8         // 桶数组的大小级别：桶数量 = 2^B（如B=3时，桶数=8）
    flags     uint8         // 状态标记（如是否正在扩容、是否有写操作等）
    hash0     uint32       // 哈希种子（确保每次运行的哈希结果不同，避免哈希攻击）
    buckets    unsafe.Pointer // 指向桶数组的指针（核心存储区域）
    oldbuckets unsafe.Pointer // 扩容时的旧桶数组指针（渐进式扩容的关键）
    nevacuate  uintptr      // 已完成迁移的旧桶数量（标记扩容进度）
    extra      *mapextra    // 额外信息（存储溢出桶、红黑树等）
}
```

#### 关键字段解析：

- **`B`与桶数量**：桶数组的大小由`B`决定（桶数 = 2^B），例如`B=5`时，桶数为 32。`B`的取值会影响 “负载因子”（元素数 / 桶数），进而影响性能。
- **`oldbuckets`与`nevacuate`**：用于**渐进式扩容**（非一次性迁移所有数据），`oldbuckets`指向扩容前的旧桶，`nevacuate`标记已从旧桶迁移到新桶的数量。
- **`extra`**：存储 “溢出桶”（当主桶装满时用于扩容的额外桶）和 “红黑树节点”（当桶内链表过长时转为红黑树），避免主桶数组冗余。

### 2. 哈希桶：bmap（bucket map）

`bmap`是`map`的 “存储单元”，每个`bmap`（主桶）可存储**最多 8 个键值对**，若超过则通过 “溢出桶” 扩展。其结构设计有显著的**内存优化**特点（简化版如下）：

go

```go
type bmap struct {
    tophash [8]uint8        // 存储键的哈希值高位（快速匹配，减少键比较）
    // 以下字段编译时动态生成，不直接显式定义：
    // keys [8]keyType        // 8个键（按类型对齐存储）
    // values [8]valueType    // 8个值（与keys分开存储，优化内存对齐）
    // overflow uintptr       // 指向溢出桶的指针（桶满时扩展）
}
```

#### 关键设计与优化：

1. **`tophash`的作用**：
   - 哈希值计算后，会拆分为 “高位” 和 “低位”：
     - **低位**：用于确定键所在的桶索引（`hash & (1<<B - 1)`，等价于`hash % 2^B`，效率更高）；
     - **高位**：存储到`tophash`数组中，用于桶内快速匹配（避免直接比较键的全量字节，减少开销）。
   - `tophash`还会标记桶的状态（如`EmptyRest`表示后续位置为空，`Deleted`表示该位置元素已删除）。
2. **keys 与 values 分开存储**：
   - 传统哈希桶会将 “键值对”（`key-value`）作为一个单元存储（如`[8]struct{key K, val V}`），但 Go 将`keys`和`values`分开为两个数组（`[8]K`和`[8]V`）。
   - **优化原因**：减少内存对齐浪费。例如，若`K`是`int64`（8 字节）、`V`是`bool`（1 字节），混存时每个键值对需对齐到 8 字节（总 64 字节），而分开存储时`keys`占 64 字节、`values`占 8 字节（总 72 字节→72 字节？不对，实际是：混存时`struct{int64, bool}`的大小为 16 字节（对齐到 8 字节），8 个则 128 字节；分开存储时`[8]int64`=64 字节，`[8]bool`=8 字节，总 72 字节，节省 44% 内存）。
3. **溢出桶（Overflow Bucket）**：
   - 当一个主桶的 8 个位置装满后，会通过`overflow`指针指向一个 “溢出桶”（结构与主桶完全一致），形成 “桶链”。
   - 溢出桶由`hmap.extra`统一管理，避免主桶数组的频繁扩容。

### 3. 红黑树的引入（Go 1.6+）

当一个桶链（主桶 + 溢出桶）中的元素数量超过**8 个**时，Go 会将桶链转为**红黑树**（而非继续用链表），原因是：

- 链表的查找时间复杂度为`O(n)`，当`n>8`时，性能下降明显；
- 红黑树的查找 / 插入 / 删除时间复杂度为`O(log n)`，能稳定保证高性能。

红黑树的节点信息存储在`hmap.extra`中，桶结构会通过标记位（`bmap.tophash`的特殊值）指示当前桶是 “链表模式” 还是 “红黑树模式”。

## 二、哈希函数与冲突解决

哈希表的核心挑战是 “哈希冲突”（不同键计算出相同哈希值），Go 通过 “优质哈希函数” 和 “链地址法”（链表 + 红黑树）解决该问题。

### 1. 哈希函数的选择

Go 会根据**键的类型**选择不同的哈希函数，确保哈希值的 “随机性” 和 “均匀性”：

- 对于`int`、`uint`等数值类型：使用`fnv-1a`哈希（简单高效）；
- 对于`string`类型：使用专门优化的字符串哈希（结合`hash0`种子，避免哈希攻击）；
- 对于自定义类型：需用户实现`Hash()`方法（但日常开发中极少用到）。

此外，`hmap.hash0`是一个随机种子（每次程序运行时生成不同值），确保相同键在不同运行时的哈希值不同，从根本上避免 “固定哈希冲突” 的攻击。

### 2. 哈希冲突的解决：链地址法

当两个键的哈希值 “低位相同”（指向同一个桶）时，会发生冲突，Go 通过 “链地址法” 解决：

1. 第一个键存入主桶的空闲位置；
2. 后续冲突的键先尝试存入主桶的其他空闲位置；
3. 主桶满后，通过 “溢出桶” 扩展，形成 “桶链”；
4. 桶链长度超过 8 时，转为红黑树，优化查询效率。

## 三、核心操作的底层实现

理解`map`的查找、插入、删除过程，是掌握其底层逻辑的关键。

### 1. 查找操作（map [key]）

查找的核心是 “定位桶→桶内匹配→返回值”，步骤如下：

1. **参数校验**：若`map`为`nil`或`count=0`，直接返回零值；

2. **计算哈希值**：根据键的类型调用对应的哈希函数，得到`hash`值；

3. **定位桶索引**：用哈希值低位计算桶索引（`idx = hash & (1<<h.B - 1)`）；

4. **处理扩容中的旧桶**：若`oldbuckets`非空（正在扩容），先检查旧桶是否包含该键（若有则从旧桶查找，同时触发部分迁移）；

5. 桶内查找

   ：

   - 遍历当前桶的`tophash`数组，对比 “哈希高位”（快速过滤不匹配的位置）；
   - 找到匹配的`tophash`后，再比较键的全量字节（避免哈希碰撞导致的误判）；
   - 若当前桶未找到，遍历溢出桶（或红黑树）继续查找；

6. **返回结果**：找到则返回对应值，未找到则返回值类型的零值。

### 2. 插入操作（map [key] = value）

插入需先判断 “键是否已存在”（存在则更新，不存在则新增），步骤如下：

1. **参数校验**：若`map`为`nil`，直接`panic`（Go 不允许向`nil map`插入数据）；

2. **计算哈希值与桶索引**：同查找步骤 2-3；

3. **检查键是否已存在**：同查找步骤 4-5，若找到则直接更新值，流程结束；

4. 新增键值对

   ：

   - 查找当前桶（含溢出桶）的空闲位置（`tophash`为`Empty`状态）；
   - 若找到空闲位置，存入键、值，并更新`tophash`的哈希高位；
   - 若桶链已满（无空闲位置）：
     - 若桶链长度≤8：创建新的溢出桶，存入键值对；
     - 若桶链长度 > 8：将桶链转为红黑树，插入新节点；

5. 更新计数与触发扩容

   ：

   - `hmap.count++`（更新元素个数）；
   - 检查负载因子（`count / (1<<B)`），若超过**0.65**，触发渐进式扩容。

### 3. 删除操作（delete (map, key)）

删除操作不直接 “物理删除” 键值对，而是通过 “标记状态” 实现，步骤如下：

1. **参数校验**：若`map`为`nil`或`count=0`，直接返回（无操作）；

2. **定位桶与查找键**：同查找步骤 2-5，未找到则返回；

3. 标记删除

   ：

   - 将该位置的`tophash`设为`Deleted`（标记为删除状态）；
   - 不清除键值对的内存（避免移动其他元素，减少开销）；

4. **更新计数**：`hmap.count--`；

5. **触发等量扩容（可选）**：若溢出桶数量过多（超过主桶数量），触发 “等量扩容”（重新整理桶，减少溢出桶）。

## 四、核心机制：渐进式扩容

Go 的`map`扩容是**渐进式**的，而非一次性迁移所有数据，其设计目标是**避免长时间 STW**（若`map`有百万级元素，一次性迁移会导致程序卡顿）。

### 1. 扩容的两种场景

Go 的扩容分为 “正常扩容” 和 “等量扩容”，触发条件不同：

| 扩容类型 | 触发条件                                  | 桶数量变化                | 核心目的                                       |
| -------- | ----------------------------------------- | ------------------------- | ---------------------------------------------- |
| 正常扩容 | 负载因子 > 0.65（元素过多，冲突概率高）   | 2^B → 2^(B+1)（桶数翻倍） | 降低负载因子，减少哈希冲突                     |
| 等量扩容 | 溢出桶数量 > 主桶数量（桶链过长，查询慢） | 2^B → 2^B（桶数不变）     | 整理桶链，将溢出桶的元素迁移到主桶，减少溢出桶 |

### 2. 渐进式扩容的过程

以 “正常扩容” 为例，渐进式扩容分为 3 个阶段：

#### 阶段 1：初始化扩容

- 当负载因子超过 0.65 时，创建新的桶数组（大小为旧桶的 2 倍）；
- 将`hmap.oldbuckets`指向旧桶数组，`hmap.buckets`指向新桶数组；
- 初始化`hmap.nevacuate = 0`（标记未开始迁移），设置`hmap.flags`为 “正在扩容”。

#### 阶段 2：渐进式迁移

扩容不一次性完成，而是在**每次 map 操作（查找 / 插入 / 删除）** 时，“顺带” 迁移 1~2 个旧桶的数据到新桶，具体步骤：

1. 检查`hmap.oldbuckets`是否非空（若为空则扩容完成）；
2. 取`hmap.nevacuate`对应的旧桶，将其所有元素迁移到新桶；
3. 迁移规则：新桶数量是旧桶的 2 倍，因此旧桶`i`的元素会分散到新桶`i`和新桶`i+2^B`（根据哈希值的 “第 B 位” 判断：0→i，1→i+2^B）；
4. 迁移完成后，`hmap.nevacuate++`，直到所有旧桶迁移完毕。

#### 阶段 3：扩容收尾

- 当`hmap.nevacuate`等于旧桶数量（`2^B`）时，说明所有旧桶已迁移；
- 将`hmap.oldbuckets`设为`nil`（释放旧桶内存），清除 “正在扩容” 标记，扩容完成。

## 五、关键特性与注意事项

基于底层实现，Go 的`map`有几个重要特性，直接影响开发实践：

### 1. 并发不安全

`map`的底层结构（如`hmap.count`、`bmap.tophash`）没有任何并发保护机制，**并发读写会直接触发`panic`**（错误信息：`fatal error: concurrent map read and map write`）。

解决方式：

- 读多写少场景：使用`sync.RWMutex`（读锁共享，写锁互斥）；
- 读写频繁场景：使用标准库`sync.Map`（专门为并发设计，底层通过 “分段锁” 优化）。

### 2. 遍历顺序不固定

`map`的遍历（`for k, v := range map`）顺序是**随机的**，原因：

- 每次程序运行时`hmap.hash0`（哈希种子）不同，导致键的哈希值不同；
- 扩容过程中键会分散到不同的新桶，进一步打乱顺序。

若需固定顺序，需将键存入切片排序后遍历。

### 3. 键类型的限制

`map`的键必须支持 **`==`和`!=`比较 **，因此以下类型不能作为键：

- 切片（`slice`）、映射（`map`）、函数（`func`）：这些类型不支持`==`比较；
- 自定义类型若包含上述字段，也不能作为键。

值类型无限制，可任意选择。

### 4. 不能直接取键值的地址

`map`的元素是 “动态存储” 的（扩容时会迁移位置），因此**不能直接取`map[key]`的地址**，例如：

go

```go
m := map[int]int{1: 10}
p := &m[1] // 编译错误：cannot take address of map index expression
```

若需修改值，需通过 “先读取、修改、再存入” 的方式实现。

## 六、底层实现总结

Go 的`map`是一套兼顾 “性能”、“内存效率” 和 “并发友好”（通过渐进式扩容）的哈希表实现，核心要点可归纳为：

1. **结构分层**：`hmap`（顶层管理）+ `bmap`（哈希桶）+ 溢出桶 / 红黑树（扩展存储）；
2. **哈希优化**：按键类型选哈希函数，哈希值分高低位，`tophash`快速匹配；
3. **冲突解决**：链地址法（链表→红黑树），避免线性查找的性能问题；
4. **扩容机制**：渐进式迁移，避免 STW，平衡性能与响应速度；
5. **内存优化**：`keys`与`values`分开存储，减少对齐浪费。

理解这些底层细节，能帮助开发者更合理地使用`map`（如避免并发读写、理解遍历随机性），并在性能优化时（如大`map`的扩容控制）提供方向
