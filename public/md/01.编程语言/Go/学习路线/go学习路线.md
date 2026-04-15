Go官方基础指南-中文
https://tour.go-zh.org/welcome/1
这个是一个官方的入门教程，或者说只是一个大概了解的教程，只介绍了一些简单的东西，并且没有太多的说明。不过这个教程支持在线执行代码，还是很不错的，这个时候你都不需要有本地的开发环境。不用想太多，现在就开始，把这个教程从头到尾看一遍，练习一遍，遇到不明白的地方也不要纠结，继续向后看就行了。
开发环境
Go 的安装非常的简单，没有太多的依赖，如果是 Linux 下安装基本上下载一个二进制包，解压配置上一个环境变量、GOROOT 既可以了，具体的可以查看官方的安装方法： 下载安装文档
开发工具
这里推荐VSCode或GoLand，更多Go编辑器和IDE可参考官方
一套基础视频+一套文档教程
Go 编程基础 （视频）
Go 入门指南（教程）仓库地址
李文周博客教程和视频
Golang中国教程和视频
将标准库过一遍
至少要把常用的全都看一遍，如 strings /strconv/http 等，如果有能力可以将它们都记住，如果记忆力不太好，至少也要知道有什么，用到的时候通过手册可以快速找到。
官方标准库： https://golang.org/pkg/
中文版的标准库： https://studygolang.com/static/pkgdoc/main.html
推荐 https://github.com/astaxie/gopkg 和《Go 语言标准库》The Golang Standard Library by Example ，有关于标准库的详细说明和示例，通过这两个文档库学习起来会容易一些，等全都明白了要使用的时候可以去查看上面的文档。
基础书籍推荐
纸质书：Go语言学习笔记、HeadFirst Go语言程序设计
电子书：Go By Example 中文版、跟着单元测试学习 Go
写案例
这个时候一般都已经入门，可以试着写点东西，比如写一个博客、小系统，或者去学习一个框架，提升自己Go Web和Go Api的开发能力。
https://www.yuque.com/go/doc/68565648
初级项目案例（实现或参考实现其中之一）
使用Go生成GitHub上面项目的star趋势图 https://github.com/caarlos0/starcharts
使用Go写的吃豆人小游戏，每一步都有详细的描述和代码实现 https://github.com/danicat/pacgo
微信 web 版 API 的 Go 实现，模拟微信网页版的登录／联系人／消息收发等功能 https://github.com/songtianyi/wechat-go
Go Web开发
基础知识掌握之后，可以上手做一些 web 应用，进一步了解更多的 Go 语言相关框架以及生产环境中的常用中间件，推荐书籍《Go Web 编程》
Gin框架
官方文档都有中文，照着 demo 敲一下，了解下怎么处理 HTTP 请求的
ORM 框架 Gorm
有官方中文文档，照着 demo 敲一下基本上两天就能掌握了，后面遇到不会的再来查
Casbin
能够基于Casbin进行的控制处理
Web项目推荐（实现或参考实现其中之一）
https://www.yuque.com/go/doc/68565677： 一个 Go 语言入门项目，旨在让初学者花尽可能短的时间，通过尽可能详细的步骤，历经 17 个 demo，最终一步步构建出一个生产级的 Go 后端服务器。从开发准备到 API 设计，再到 API 实现、测试和部署，每一步都详细介绍了如何去构建
gin-vue-admin：使用 Gin 框架构建的后台管理系统，有详细的中文文档，并且配套教学视频https://github.com/flipped-aurora/gin-vue-admin
ferry：基于 Gin + Vue + Element UI 前后端分离的工单系统。https://github.com/lanyulei/ferry
Go-admi：Gin + Vue + Element UI 的前后端分离权限管理系统，有详细中文文档和配套视频教程 http://github.com/go-admin-team/go-admin
对于 web 项目的学习，可能有同学觉得项目太庞杂，根本不知道怎么下手。我想建议的是，可以在本地把项目跑起来，然后断点调试一个 HTTP 请求的整体流程，搞懂了一个接口，其他的大同小异。
https://www.zhihu.com/question/399923003
进阶项目（实现或参考实现其中之一）
一个 Go 语言实现的快速、稳定、内嵌的 k-v 存储引擎 rosedb https://github.com/flower-corp/rosedb
视频：space.bilibili.com/2619