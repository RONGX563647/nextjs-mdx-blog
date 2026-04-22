# Java 后端开发面试演示演讲稿（口语化深度版）

## 使用说明

> **这份演讲稿的设计思路**：
>
> - ✅ **口语化**：像聊天一样自然，避免背书感
> - ✅ **有深度**：不仅讲"怎么做"，还要讲"为什么这么做"
> - ✅ **有思考**：展示你的技术选型思考过程
> - ✅ **留接口**：故意埋下伏笔，引导面试官追问

---

## 第一页：封面（5 秒）

**【动作】**：微笑，点头示意

**演讲稿**：

> 各位面试官好，我是 \[姓名]。今天不太想照本宣科地背简历，所以做了这个演示页面，想通过几个实际的项目，跟各位聊聊我在技术探索路上的一些实践和思考。
>
> 废话不多说，咱们直接开始。

---

## 第二页：自我介绍（40 秒）

**【演讲稿】**：

> 先简单介绍一下自己。
>
> 我是 \[学校]\[专业] 的 \[姓名]。说实话，我大学走得比较"偏"——当其他同学在刷题准备蓝桥杯的时候，我天天抱着 Spring 源码啃，室友都说我魔怔了。
>
> **技术栈方面**，我主要专注在 Java 后端：
>
> - Java 基础这块，JVM、并发包、集合源码都过过几遍
> - Spring 全家桶是吃饭的家伙，微服务架构也有实际项目经验
> - 中间件像 Redis、RabbitMQ 这些，不仅会用，还研究过底层原理
> - 数据库方面，MySQL 的索引优化、事务隔离这些在实际项目中踩过不少坑
>
> **说实话**，我觉得自己跟其他候选人最大的区别可能是——我特别喜欢"造轮子"。不是那种为了面试背的八股文，而是真的去手写一个简化版的 Spring、自己实现一个 IOC 容器。这个过程很痛苦，但收获也特别大。
>
> 后面我会通过几个项目具体展开，各位也能看到我的技术成长路径。

**【过渡】**：

> 先看一下我做过的项目，接下来会详细聊每个项目背后的技术思考。

---

## 第三页：项目概览（15 秒）

**【演讲稿】**：

> 我挑了四个比较有代表性的项目：
>
> 1. **Hutool 开源贡献**：给一个 27k Star 的 Java 工具库贡献过代码，这个后面会细说
> 2. **LightSSM**：手写了一个迷你版 Spring，这个项目让我对框架设计有了全新理解
> 3. **智能插座系统**：一个 IoT 平台，用到了 Java 21 虚拟线程、MQTT、RabbitMQ 这些技术
> 4. **不二价**：校园电商平台，主要解决了高并发秒杀和分布式事务的问题
>
> 每个项目我都会重点讲三个东西：**遇到了什么问题**、**为什么选这个方案**、**具体怎么实现的**。

---

## 第四页：Hutool 开源贡献（1 分钟）

**【演讲稿】**：

> 先说 Hutool 这个项目。可能有些面试官听说过，这是一个 GVP 顶级的 Java 工具包，Star 数 27k+。
>
> ### 为什么要贡献这个？
>
> 其实起因很简单。当时我在做一个文档生成的功能，需要把数据填充到 Word 模板里。找了一圈发现，Hutool 居然没有这个功能！当时我就想，这么常用的需求，为什么没有呢？
>
> ### 核心问题
>
> 我去研究了现有的 Word 导出方案，发现几个问题：
>
> **第一**，现有的功能太单一，只能导出简单表格，不支持模板化文档
>
> **第二**，PDF 生成依赖太重了，动不动就要引入 iText、POI 好几个重型库
>
> **第三**，也是最关键的——缺乏统一的模板引擎。开发者得手动解析 Word 的 XML 结构，这个门槛太高了
>
> ### 我的解决方案
>
> 我当时的思路是：**能不能设计一个简单易用的 API，让开发者像填表单一样生成 Word 文档？**
>
> 所以我设计了这样的 API：
>
> ```java
> // 链式调用，一看就懂
> WordTemplate template = WordTemplate.create("template.docx")
>     .bindText("name", "张三")           // 文本占位符 {{name}}
>     .bindImage("logo", imageBytes)      // 图片占位符 {{@logo}}
>     .bindTable("table", dataList)       // 表格占位符 {{#table}}
>     .renderTo("output.docx");
> ```
>
> ### 技术实现细节
>
> 这里有个很有意思的技术点：**Word 文档的本质是什么？**
>
> 其实 `.docx` 文件就是个 ZIP 压缩包，解压后里面是 `word/document.xml`（文档内容）、`word/media/`（图片资源）这些文件。
>
> 所以我实现的思路是：
>
> 1. 用 Apache POI 打开 ZIP 包
> 2. 解析 `document.xml`，找到占位符
> 3. 用正则 `\\{\\{(@|#)?(\\w+)\\}\\}` 识别三种占位符类型
> 4. 替换内容，重新打包
>
> **这里有个坑**：替换文本的时候，如果不做 XML 转义，特殊字符会破坏文档结构。比如 `<` 要转成 `&lt;`，这个我一开始就踩过坑。
>
> ### PDF 生成
>
> PDF 生成我走了个"捷径"——基于 OFD 中间格式转换。OFD 是中国自主的版式文档标准，类似 PDF。我复用了 ofdrw 库，这样就不用引入额外依赖了。
>
> ### 提交过程
>
> 其实整个 PR 过程挺曲折的。第一次提交被 maintainer 打回来，说 API 设计不够优雅。我改了三次，最后才合并进去。这个过程中学到了很多关于 API 设计的思考。
>
> **现在这个功能已经在** `feature/word-pdf-converter` **分支了**，有兴趣的面试官可以看看代码：
> <https://gitee.com/chinabugotech/hutool/pulls/1439/files>

**【可能的追问】**：

> - **问**：.docx 文件的结构是什么样的？
> - **问**：如何保证模板替换不破坏 XML 结构？
> - **问**：OFD 和 PDF 有什么区别？

---

## 第五页：LightSSM（2 分 30 秒）⭐

**【演讲稿】**：

> 接下来这个项目，是我觉得技术含量最高的一个——手写了一个迷你版 Spring 框架，我叫它 LightSSM。
>
> ### 为什么做这个？
>
> 说实话，当时学 Spring 的时候我一直有个困惑：**这么多注解、这么多配置，Spring 到底是怎么工作的？**
>
> 看源码吧，太复杂了，几百万行代码无从下手。后来我想，不如自己手写一个简化版，哪怕功能不全，至少能理解核心思想。
>
> 这个项目在线演示地址：<https://rongx563647.github.io/LightSSM/>
>
> ### 模块一：IOC 容器（重点）
>
> 先看 IOC 容器。Spring IOC 最核心的设计是什么？我认为是**三级缓存解决循环依赖**。
>
> **先说问题**：什么是循环依赖？比如 A 依赖 B，B 又依赖 A，这时候怎么创建 Bean？
>
> Spring 的解决方案是用三级缓存：
>
> - **一级缓存**：singletonObjects，存完整的 Bean
> - **二级缓存**：earlySingletonObjects，存早期引用（还没完全初始化）
> - **三级缓存**：singletonFactories，存 ObjectFactory，用于创建代理
>
> **关键代码**：
>
> ```java
> public class DefaultListableBeanFactory {
>   // 一级缓存：完整 Bean
>   private Map<String, Object> singletonObjects = new ConcurrentHashMap<>();
>   // 二级缓存：早期引用
>   private Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>();
>   // 三级缓存：ObjectFactory
>   private Map<String, ObjectFactory<?>> singletonFactories = new ConcurrentHashMap<>();
>
>   protected Object getSingleton(String beanName) {
>     Object obj = singletonObjects.get(beanName);
>     if (obj == null && isSingletonCurrentlyInCreation(beanName)) {
>       obj = earlySingletonObjects.get(beanName);
>       if (obj == null) {
>         ObjectFactory<?> factory = singletonFactories.get(beanName);
>         if (factory != null) {
>           obj = factory.getObject();  // 提前暴露引用
>           earlySingletonObjects.put(beanName, obj);
>           singletonFactories.remove(beanName);
>         }
>       }
>     }
>     return obj;
>   }
> }
> ```
>
> **这里最巧妙的设计**是三级缓存。为什么需要三级？两级行不行？
>
> 答案是：**不行**。因为 AOP 代理需要在 Bean 初始化之前就创建代理对象。如果只有两级缓存，当发生循环依赖时，无法提前暴露代理对象。三级缓存通过 ObjectFactory 延迟创建代理，完美解决了这个问题。
>
> **我举一个具体的例子**：
>
> 假设有两个 Bean：UserService 和 OrderService，它们互相依赖。
>
> 1. Spring 创建 UserService 实例，但发现它依赖 OrderService
> 2. 暂停 UserService 的创建，去创建 OrderService
> 3. OrderService 又依赖 UserService，怎么办？
> 4. 从三级缓存获取 UserService 的 ObjectFactory，调用 `getObject()` 提前暴露引用
> 5. OrderService 拿到 UserService 的引用（可能是代理对象），完成创建
> 6. UserService 再拿到 OrderService 的引用，也完成创建
>
> **这个过程最精妙的地方**在于：三级缓存中的 ObjectFactory 可以延迟创建代理对象。如果 AOP 需要代理，ObjectFactory 返回代理对象；如果不需要，返回原始对象。
>
> **当然**，我的实现跟官方 Spring 比还有很多不足：
>
> - 没实现 BeanPostProcessor 的完整生命周期（只实现了最基础的依赖注入）
> - 不支持 @Configuration 配置类（ConfigurationClassPostProcessor 没实现）
> - 循环依赖只支持 setter 注入，构造器注入的循环依赖处理不了
> - 没实现 FactoryBean 和 BeanFactoryPostProcessor 扩展点
>
> 但通过这个过程，我真的理解了 Spring 的设计思想。
>
> **这里我还深入研究了一个问题**：为什么 Spring 在 3.2 之后默认都用 CGLIB 而不是 JDK 代理？
>
> 我做了个性能测试：
>
> - JDK 代理：基于反射，每次调用都要经过 InvocationHandler，性能较低
> - CGLIB 代理：基于 ASM 生成子类，直接调用目标方法，性能接近原生调用
>
> 在我的 LightSSM 里，我实现了自动切换逻辑：有接口用 JDK，没接口用 CGLIB。
>
> ### 模块二：SpringMVC
>
> SpringMVC 的核心是什么？我认为是**前端控制器模式**。
>
> DispatcherServlet 就像一个前台接待，所有请求都先到它这里，然后它再分发给对应的 Handler。
>
> **核心流程**：
>
> 1. 用户发送请求 → DispatcherServlet
> 2. DispatcherServlet → HandlerMapping（查找 Handler）
> 3. HandlerMapping → DispatcherServlet（返回 HandlerExecutionChain）
> 4. DispatcherServlet → HandlerAdapter（执行 Handler）
> 5. HandlerAdapter → Controller（执行业务逻辑）
> 6. Controller → ModelAndView（返回视图模型）
> 7. DispatcherServlet → ViewResolver（解析视图）
> 8. ViewResolver → View（返回具体视图）
> 9. DispatcherServlet → 渲染视图 → 响应给用户
>
> **我的实现**只支持了最基础的功能，像拦截器链、视图解析器这些都没实现。参数绑定也只支持基础类型，复杂对象绑定不了。
>
> **但我研究了一个很有意思的问题**：SpringMVC 是如何支持 100+ 种参数类型的？
>
> 比如 @RequestParam、@PathVariable、@RequestBody、HttpServletRequest 等等。
>
> 官方 Spring 的实现是：**HandlerMethodArgumentResolver 策略模式**。
>
> - 每个参数类型对应一个 Resolver
> - RequestParamHandlerResolver 处理 @RequestParam
> - PathVariableHandlerResolver 处理 @PathVariable
> - RequestBodyHandlerResolver 处理 @RequestBody（配合 HttpMessageConverter）
> - 默认支持 100+ 种参数类型
>
> 我的 LightSSM 只实现了最简单的参数绑定，但这个设计思想我学到了。
>
> **还有一个问题**：@ResponseBody 是如何把对象转成 JSON 的？
>
> 官方 Spring 用的是 **HttpMessageConverter**：
>
> - MappingJackson2HttpMessageConverter：用 Jackson 转 JSON
> - StringHttpMessageConverter：处理 String 类型
> - FormHttpMessageConverter：处理表单数据
>
> 我在自己的项目里也模仿了这个设计，虽然功能简单，但原理是一样的。
>
> ### 模块三：AOP
>
> AOP 这块我实现了 JDK 和 CGLIB 双代理自动切换。
>
> **核心思路**：
>
> - 如果目标对象实现了接口，用 JDK 动态代理
> - 如果没有接口，用 CGLIB 字节码增强
>
> **这里有个技术细节**：JDK 代理基于反射，性能相对较低；CGLIB 基于 ASM 修改字节码，性能更高。Spring 在 3.2 之后默认都用 CGLIB 了。
>
> 我的实现只支持基础的 @Before、@After、@Around，不支持 @AspectJ 注解声明式切面。事务管理也没集成。
>
> **但我深入研究了 Spring AOP 的底层原理**：
>
> Spring AOP 的核心是**拦截器链模式**。
>
> 当你调用一个被 AOP 代理的方法时，实际执行流程是：
>
> 1. 进入代理对象的 invoke() 方法
> 2. 获取拦截器链（AdvisorChain）
> 3. 依次执行拦截器：
>    - MethodBeforeAdviceInterceptor（@Before）
>    - AroundInterceptor（@Around 的前半部分）
>    - 目标方法
>    - AroundInterceptor（@Around 的后半部分）
>    - AfterReturningAdviceInterceptor（@AfterReturning）
>    - AfterThrowingAdviceInterceptor（@AfterThrowing）
> 4. 如果有异常，执行 @AfterThrowing
> 5. 最后执行 @After（无论是否异常）
>
> **这个设计最巧妙的地方**是：所有拦截器共用一个 MethodInvocation 对象，通过 `proceed()` 方法串联起来。
>
> 每个拦截器执行完后，调用 `proceed()` 进入下一个拦截器，形成一个责任链。
>
> **我还研究了一个问题**：@Transactional 是如何实现事务管理的？
>
> 答案是：**基于 AOP 的声明式事务**。
>
> - BeanPostProcessor 扫描所有方法，检查是否有 @Transactional
> - 如果有，创建事务拦截器（TransactionInterceptor）
> - 拦截器执行流程：
>   1. 获取事务管理器（PlatformTransactionManager）
>   2. 开启事务（getTransaction）
>   3. 执行目标方法
>   4. 如果成功，提交事务（commit）
>   5. 如果异常，回滚事务（rollback）
>
> 这个设计思想在我后来的项目中经常用到。
>
> ### 模块四：MyBatis 整合
>
> MyBatis 这块我实现了 XML SQL 映射、动态 SQL、参数绑定这些基础功能。
>
> **核心类**：
>
> - SqlSessionFactory：工厂模式，创建 SqlSession
> - Configuration：配置中心，存储 MappedStatement、TypeHandler
> - Executor：执行器，负责真正执行 SQL
>
> **不足的地方**：
>
> - 没实现一级/二级缓存
> - 动态 SQL 只支持 if/foreach，不支持 choose/when/otherwise
> - 分页插件和 SQL 性能分析也没有
>
> **但我深入研究了 MyBatis 的核心设计**：
>
> **问题一**：MyBatis 是如何把 ResultSet 映射成 Java 对象的？
>
> 答案是：**ResultSetHandler + TypeHandler**。
>
> - ResultSetHandler 负责解析 ResultSet
> - TypeHandler 负责 Java 类型和 JDBC 类型的转换
> - 通过反射设置属性值（PropertyTokenizer 解析属性名）
>
> **问题二**：MyBatis 的一级缓存和二级缓存有什么区别？
>
> - **一级缓存**：SqlSession 级别，默认开启
>   - 基于 PerpetualCache（HashMap 实现）
>   - 同一个 SqlSession 内，相同 SQL 和参数直接返回缓存
>   - SqlSession 关闭或执行增删改时清空
> - **二级缓存**：Mapper Namespace 级别，需要手动配置
>   - 基于 Cache 接口，多种实现（Ehcache、Redis 等）
>   - 多个 SqlSession 共享
>   - 需要 POJO 实现 Serializable 接口
>
> **问题三**：PageHelper 分页插件的原理是什么？
>
> 答案是：**拦截器自动拼接 LIMIT**。
>
> - 实现 PageInterceptor 接口
> - 拦截 Executor 的 query() 方法
> - 解析 SQL，自动拼接 LIMIT 语句
> - 修改 BoundSql，设置分页参数
>
> 这个设计思想在我后来的项目中经常用到，比如智能插座系统的流式分页。

**【可能的追问】**：

> - **问**：Spring 三级缓存的具体作用？
> - **问**：JDK 代理和 CGLIB 代理的本质区别？
> - **问**：SpringMVC 的请求处理流程？
> - **问**：AOP 的底层实现原理？

---

## 第六页：智能插座系统（4 分钟）⭐⭐⭐ 核心重点

**【演讲稿】**：

> 接下来这个项目，是我花的时间最多的——智能插座系统。GitHub 地址：<https://github.com/RONGX563647/dorm-power-console>
>
> 这个项目源于我在宿舍的实际需求。学校电力设备缺乏统一监控，设备故障发现滞后，影响教学和生活。我就想，能不能自己做一个监控平台？
>
> ### 核心痛点（逐个分析）
>
> **痛点一：千级设备并发连接 OOM**
>
> 一开始我用的是传统的平台线程模型，每个设备连接占用一个线程。很快我就发现问题了：
>
> - 一个线程栈大小 1MB
> - 1000 个设备 = 1000 个线程 = 1GB 内存（仅线程栈）
> - 设备量增加 → 线程数增加 → OOM
>
> **这个怎么解决？** 我调研了两种方案：
>
> 1. 用 Netty 的 NIO 模型（异步非阻塞）
> 2. 用 Java 21 的虚拟线程
>
> 最后我选了虚拟线程。为什么？因为 NIO 模型虽然性能好，但编程模型复杂，调试困难。而虚拟线程可以用同步的方式写代码，性能却接近异步。
>
> **虚拟线程的核心优势**：
>
> - 平台线程：栈大小固定 1MB，由操作系统调度
> - 虚拟线程：栈大小动态扩展（初始几百字节），由 JVM 调度
> - 当虚拟线程阻塞时，JVM 自动切换到其他虚拟线程
>
> **实际效果**：
>
> - 内存占用从 1GB 降到几 MB（降低 99%）
> - 并发连接数从 1000 提升到 10,000+
>
> **代码实现**：
>
> ```java
> // 虚拟线程执行器
> ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
>
> // MQTT 消息处理
> @MqttListener(topic = "device/+/telemetry")
> public void handleTelemetry(MqttMessage message) {
>     virtualExecutor.submit(() -> {
>         // 每个设备消息使用一个虚拟线程处理
>         TelemetryData data = parseMessage(message);
>         telemetryService.process(data);
>     });
> }
> ```
>
> **痛点二：设备批量上报阻塞**
>
> 设备每 5 秒上报一次遥测数据（电压、电流、功率）。算一笔账：
>
> - 1000 台设备 = 200 条/秒 = 12,000 条/分钟
> - 如果同步写入数据库，连接池很快就耗尽了
>
> **解决方案**：用 RabbitMQ 做异步链路。
>
> **架构设计**：
>
> ```
> 设备 → MQTT → RabbitMQ → 异步消费 → 批量落库
> ```
>
> **关键技术点**：
>
> 1. **生产者 Confirm**：保证消息到达 Broker
>    - 开启 Confirm 模式
>    - Broker 确认后认为发送成功
>    - 超时未确认则重试
> 2. **消费者手动 ACK**：保证消息被成功消费
>    - 关闭自动 ACK
>    - 业务处理成功后手动 ACK
>    - 处理失败则 NACK，消息重新入队或转入死信队列
> 3. **死信队列（DLQ）**：处理失败消息，便于人工干预
>    - 消息过期、被拒绝、队列满时转入 DLQ
>    - 人工检查 DLQ 消息，分析失败原因
>    - 必要时手动恢复消息
> 4. **批量消费**：100 条/批，减少数据库 IO
>    - 消费者批量拉取消息
>    - JDBC Batch 批量插入
>    - 事务提交，统一 ACK
>
> **效果**：
>
> - 系统吞吐从 200 条/秒提升到 2000 条/秒（10 倍）
> - 数据库 IO 压力减少 80%
> - 接口响应时间从 500ms 降到 50ms
>
> **这里我踩过一个坑**：消息重复消费。
>
> 有一次消费者处理完业务后，还没来得及 ACK 就宕机了。重启后消息重新入队，导致重复消费。
>
> **解决方案**：实现幂等性。
>
> - 每条消息有唯一 ID
> - 用 Redis 记录已处理的消息 ID
> - 消费前检查，如果已处理则直接 ACK
>
> 这个教训让我深刻理解了**消息可靠性**的重要性。
>
> **痛点三：接口响应慢**
>
> 一开始没有缓存设计，每次查询都直连数据库。后来我设计了多级缓存：
>
> **L1 缓存（Caffeine）**：
>
> - 本地缓存，存热点数据
> - 过期时间 5 分钟
> - 命中时间 <1ms
>
> **L2 缓存（Redis）**：
>
> - 分布式缓存，存全量数据
> - 过期时间 10 分钟
> - 命中时间 <10ms
>
> **查询流程**：
>
> 1. 先查 L1，命中直接返回
> 2. L1 没命中，查 L2
> 3. L2 没命中，查数据库，然后回写 L2 和 L1
>
> **这里有个一致性问题**：如何保证缓存和数据库的一致性？
>
> 我用的 Cache Aside 模式：
>
> - 读：先读缓存，没命中再读数据库
> - 写：先更新数据库，再删除缓存（不是更新缓存！）
> - 允许短暂不一致，最终会一致
>
> **为什么先删缓存而不是更新缓存？**
>
> 我研究过几种方案：
>
> 1. **先更新数据库，再更新缓存**
>    - 问题：并发更新时，可能旧数据覆盖新数据
>    - 例：线程 A 更新 DB，线程 B 更新 DB，线程 B 先更新缓存，线程 A 后更新缓存 → 缓存是旧数据
> 2. **先删除缓存，再更新数据库**
>    - 问题：删除后到更新前，有请求读到旧 DB 数据并写入缓存
>    - 例：线程 A 删缓存，线程 B 读缓存（没命中）→ 读 DB → 写缓存，线程 A 更新 DB → 缓存是旧数据
> 3. **先更新数据库，再删除缓存（我选的方案）**
>    - 优点：简单有效
>    - 极端情况：删缓存失败，会有短暂不一致
>    - 解决：设置过期时间，最终会一致
>
> **效果**：缓存命中率 95%，接口平均响应 <50ms
>
> **这里我还实现了一个优化**：热点数据永不过期。
>
> - 对于访问频率极高的数据（如设备在线状态）
> - 不设置过期时间，后台定时任务异步更新
> - 查询时发现数据旧了，异步触发更新
>
> 这个方案避免了热点 key 过期导致的击穿问题。
>
> **痛点四：恶意请求缺乏防护**
>
> 一开始没做限流，后来发现有单 IP 刷接口的情况。我调研了三种限流方案：
>
> 1. **单机限流**：用 Guava RateLimiter
>    - 问题：多实例部署时，每个实例独立限流，无法共享配额
> 2. **分布式限流**：用 Redis + Lua
>    - 优点：多实例共享配额，限流精确
>    - 缺点：依赖 Redis，有网络开销
> 3. **双层限流**：Guava（单机兜底）+ Redis（分布式精确）
>    - 综合了前两者的优点
>
> 我最后选的是方案 3。
>
> **Lua 脚本实现滑动窗口**：
>
> ```lua
> -- Redis Lua 脚本（原子执行）
> local key = "rate_limit:" .. KEYS[1]
> local now = tonumber(ARGV[1])
> local window = tonumber(ARGV[2])  -- 窗口大小（秒）
> local limit = tonumber(ARGV[3])   -- 限制次数
>
> -- 移除窗口外的数据
> redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
>
> -- 统计窗口内请求数
> local count = redis.call('ZCARD', key)
>
> if count < limit then
>     -- 未超限，添加新请求
>     redis.call('ZADD', key, now, now .. math.random())
>     redis.call('EXPIRE', key, window)
>     return 1  -- 允许
> else
>     return 0  -- 拒绝
> end
> ```
>
> **为什么用 Lua？**
>
> - Lua 脚本在 Redis 中单线程执行，原子性保证
> - 减少网络往返（一次调用完成多次操作）
> - 可以实现复杂逻辑（如滑动窗口）
>
> **效果**：QPS 承载从 100 提升到 10,000+（100 倍）
>
> **这里我深入研究了一个问题**：滑动窗口和固定窗口的区别？
>
> - **固定窗口**：统计每个固定时间窗口（如 1 分钟）内的请求数
>   - 问题：临界问题
>   - 例：0:59 发 100 次，1:01 发 100 次，虽然 2 秒内 200 次，但都没超限
> - **滑动窗口**：统计最近 N 秒内的请求数，窗口随时间滑动
>   - 解决：临界问题
>   - 实现：用 ZSET 存储每个请求的时间戳，自动过期
>
> **我还对比了其他限流算法**：
>
> - **令牌桶**：固定速率生成令牌，请求消耗令牌
>   - 特点：允许突发流量
>   - 适用：保护下游系统，允许短暂超限
> - **漏桶**：固定速率流出，请求注入漏桶
>   - 特点：强制恒定速率
>   - 适用：限制请求速率，保护自身资源
> - **滑动窗口**：统计最近 N 秒内的请求数
>   - 特点：精确限流，无临界问题
>   - 适用：严格限制请求频率
>
> 我选滑动窗口是因为：IoT 设备上报频率固定，不需要突发，需要精确限流。
>
> ### 其他技术亮点（快速过）
>
> **1. JWT + Redis 黑名单**
>
> - JWT 无状态，无法主动失效 Token
> - 用 Redis 存黑名单 Token，设置过期时间
> - 每次请求检查 Token 是否在黑名单
>
> **这里有个技术细节**：过期时间怎么设置？
>
> - 不能固定过期时间（比如 30 分钟）
> - 应该设置为 JWT 的剩余有效期
> - 例：JWT 还有 10 分钟过期，Redis 黑名单也设置 10 分钟
> - 这样 Redis 不会存储过期的黑名单，节省内存
>
> **2. RBAC 细粒度权限**
>
> - 三级权限：接口级 + 方法级 + 数据级
> - 用户 → 角色 → 权限，多对多关系
>
> **接口级权限**：控制 API 访问（如 `/api/admin/**`）
> **方法级权限**：控制业务方法（如 `deleteUser()`）
> **数据级权限**：控制数据范围（如只能查看本部门数据）
>
> **我实现了一个很有意思的功能**：数据权限动态拼接 SQL。
>
> - 用 AOP 拦截查询方法
> - 解析用户的数据权限范围
> - 自动拼接 WHERE 条件（如 `WHERE dept_id = 1001`）
> - 用户无感知，自动过滤数据
>
> **3. AOP 三大切面**
>
> - 限流切面：@RateLimit 注解
> - 审计日志切面：@AuditLog 注解
> - 全局异常治理：@RestControllerAdvice
>
> **审计日志切面我记录的内容**：
>
> - 接口 URL、请求参数、响应结果
> - 执行耗时、操作人、IP 地址
> - 异步写入数据库，不影响主流程
>
> 这个功能在问题排查时非常有用，可以快速定位问题。
>
> **4. PBKDF2 加盐哈希**
>
> - 随机盐值（每个用户独立）
> - 65536 次迭代（增加暴力破解成本）
> - 恒定时间比对（防时序攻击）
>
> **为什么不用 MD5 或 SHA？**
>
> - MD5/SHA 计算太快，容易被暴力破解
> - PBKDF2 通过高迭代次数增加计算成本
> - 65536 次迭代意味着：每次密码验证需要 65536 次哈希计算
> - 暴力破解成本增加 65536 倍
>
> **恒定时间比对是什么？**
>
> - 普通比对：发现不同字符立即返回 false
> - 恒定时间比对：无论是否相同，都执行相同时间
> - 防止攻击者通过比对时间推断密码
>
> **5. Prometheus + Grafana 监控**
>
> - 11 类指标（JVM、HTTP、数据库、Redis、MQTT 等）
> - 8 个 Grafana 面板
> - 秒级告警响应
>
> **我监控的核心指标**：
>
> - JVM：内存使用率、GC 次数、线程数
> - HTTP：QPS、响应时间（P50/P95/P99）、错误率
> - 数据库：连接数、查询耗时、慢查询次数
> - Redis：命中率、内存使用、键数量
> - RabbitMQ：队列长度、消费速率、ACK 次数
> - 业务：设备在线数、遥测数据处理量、告警触发次数
>
> **告警规则**：
>
> - CPU 使用率 > 80% 持续 5 分钟 → 邮件告警
> - 内存使用率 > 90% 持续 5 分钟 → 邮件告警
> - 接口错误率 > 5% 持续 1 分钟 → 邮件告警
> - 设备离线率 > 20% 持续 5 分钟 → 邮件告警
>
> 这个监控系统帮我发现了很多潜在问题，比如内存泄漏、慢查询等。

**【可能的追问】**：

> - **问**：虚拟线程和平台线程的本质区别？
> - **问**：RabbitMQ 如何保证消息不丢失？
> - **问**：Redis 限流为什么用 Lua 脚本？
> - **问**：多级缓存如何保证一致性？
> - **问**：联合索引的设计原则？

---

## 第七页：不二价校园电商（1 分 30 秒）

**【演讲稿】**：

> 最后一个项目是校园二手交易平台"不二价"。这个项目主要解决了两个技术难点：高并发秒杀和分布式事务。
>
> ### 难点一：秒杀库存超卖
>
> **问题**：多个用户同时下单，库存扣减并发问题
>
> **解决方案**：Redis Lua 原子扣减
>
> ```lua
> -- 库存扣减 Lua 脚本
> local stock = redis.call('GET', KEYS[1])
> if tonumber(stock) >= tonumber(ARGV[1]) then
>     redis.call('DECRBY', KEYS[1], ARGV[1])
>     return 1  -- 成功
> else
>     return 0  -- 库存不足
> end
> ```
>
> **为什么不用数据库乐观锁？**
>
> 我对比过两种方案：
>
> 1. **数据库乐观锁**：
>    - 实现：`UPDATE stock SET count = count - 1 WHERE id = 1 AND count > 0`
>    - 问题：高并发下 CAS 失败率高，大量请求回滚
>    - 性能：1000 QPS 时，失败率约 30%
> 2. **Redis Lua 原子扣减**（我选的方案）：
>    - 实现：Lua 脚本在 Redis 单线程执行，无锁设计
>    - 优点：无 CAS 失败，性能稳定
>    - 性能：10000+ QPS，失败率 0%
>
> **效果**：库存超卖率 0%
>
> **这里我踩过一个坑**：Redis 和数据库的数据一致性。
>
> 有一次 Redis 扣减成功了，但数据库订单创建失败了。结果就是：库存少了，订单没生成。
>
> **解决方案**：最终一致性方案。
>
> - Redis 扣减库存后，发送延迟消息到 MQ
> - 延迟 5 分钟后消费，检查订单是否创建
> - 如果没创建，回滚库存（Redis 加回）
> - 如果已创建，正常流程
>
> 这个方案虽然复杂，但保证了最终一致性。
>
> ### 难点二：分布式事务
>
> **问题**：订单服务、库存服务、支付服务跨服务调用，网络故障导致数据不一致
>
> **解决方案**：Seata AT 模式
>
> ```java
> @GlobalTransactional
> public void createOrder(OrderDTO dto) {
>     // 1. 扣减库存
>     inventoryService.decrease(dto.getItemId(), dto.getCount());
>     // 2. 创建订单
>     orderService.create(dto);
>     // 3. 扣减余额
>     accountService.decrease(dto.getUserId(), dto.getAmount());
> }
> ```
>
> **Seata AT 的原理**：
>
> 1. 一阶段：本地事务执行，记录 undo log
>    - 执行 SQL 前，查询原始数据
>    - 记录 undo log（前镜像 + 后镜像）
>    - 提交本地事务，释放数据库锁
>    - 向 TC（Transaction Coordinator）注册分支事务
> 2. 二阶段提交：异步删除 undo log
>    - TC 发起全局提交指令
>    - 各分支异步删除 undo log
>    - 性能损耗小（毫秒级）
> 3. 二阶段回滚：根据 undo log 反向补偿
>    - TC 发起全局回滚指令
>    - 各分支根据 undo log 恢复数据
>    - 提交回滚事务
>
> **效果**：事务 100% 一致性
>
> **这里我对比过其他方案**：
>
> 1. **TCC 模式**（Try-Confirm-Cancel）：
>    - 优点：性能高，不依赖数据库锁
>    - 缺点：需要实现三个接口，侵入性强
>    - 适用：对性能要求极高的场景
> 2. **Saga 模式**：
>    - 优点：长事务支持，每个子事务独立
>    - 缺点：补偿逻辑复杂，不支持隔离性
>    - 适用：业务流程长、子事务多的场景
> 3. **AT 模式**（我选的方案）：
>    - 优点：无侵入，自动代理 DataSource
>    - 缺点：一阶段持有数据库锁，性能一般
>    - 适用：大多数业务场景
>
> 我选 AT 是因为：项目规模不大，AT 的无侵入性开发效率高。
>
> ### 难点三：AI 智能客服
>
> **问题**：咨询量大，客服人力不足，重复问题占比 60%+
>
> **解决方案**：Spring AI + RAG 知识库
>
> ```java
> @Service
> public class AiCustomerService {
>     @Autowired
>     private ChatClient chatClient;
>
>     public String answer(String question) {
>         // 从知识库检索相似问题
>         List<FAQ> faqs = faqRepository.findSimilar(question);
>
>         // 调用大模型生成答案
>         return chatClient.prompt()
>             .user("基于以下知识回答问题：" + faqs + "\n 用户问题：" + question)
>             .call()
>             .content();
>     }
> }
> ```
>
> **效果**：AI 客服覆盖率 60%
>
> **RAG 的核心思想**：检索增强生成（Retrieval-Augmented Generation）
>
> 1. **知识库构建**：
>    - 收集常见问题（FAQ）
>    - 用 Embedding 模型转成向量
>    - 存入向量数据库（我用的是 pgvector）
> 2. **检索阶段**：
>    - 用户问题转成向量
>    - 向量相似度搜索（余弦相似度）
>    - 返回 Top-K 个相似问题
> 3. **生成阶段**：
>    - 把检索到的知识作为上下文
>    - 发送给大模型（Qwen、GPT 等）
>    - 大模型基于上下文生成答案
>
> **为什么不用纯大模型？**
>
> - 大模型会"幻觉"（胡说八道）
> - 知识库可以保证答案准确性
> - 更新知识库比微调大模型成本低
>
> **这里我实现了一个优化**：多轮对话上下文。
>
> - 记录最近 5 轮对话历史
> - 每次提问时，把历史对话作为上下文
> - 大模型可以理解上下文，回答更准确
>
> 例：
>
> - 用户："这个商品多少钱？" → AI："100 元"
> - 用户："能便宜点吗？" → AI 结合上下文理解"这个商品"指的是什么
>
> ### 难点四：身份认证 + 地理围栏
>
> **问题**：校外用户混入，存在安全隐患
>
> **解决方案**：
>
> - 学号 + 密码认证（对接学校统一身份认证）
> - 地理围栏：仅限校内 IP 段注册
> - 人脸识别：可选，用于高价值交易
>
> **效果**：100% 校内用户
>
> **地理围栏的实现**：
>
> - 获取用户 IP 地址
> - 调用 IP 归属地 API
> - 判断是否在学校 IP 段内
> - 如果不是，拒绝注册
>
> **这里有个问题**：学生用 4G/5G 网络，IP 不在校内。
>
> **解决方案**：辅助认证。
>
> - 允许校外 IP 注册，但需要额外验证
> - 上传学生证照片，人工审核
> - 或者用学号 + 教务系统密码验证
>
> 这个方案既保证了安全性，又兼顾了便利性。

---

## 第八页：技术能力总结（30 秒）

**【演讲稿】**：

> 最后总结一下我的技术能力。
>
> **后端核心**：
>
> - Java：JVM、并发包、集合源码都过过几遍
> - Spring：不仅会用，还手写过简化版，理解设计思想
> - MySQL：索引优化、事务隔离、SQL 调优都有实战经验
> - Redis：缓存设计、分布式锁、底层数据结构
>
> **微服务与中间件**：
>
> - Spring Cloud：Nacos、Sentinel、Seata、Gateway
> - RabbitMQ：消息可靠性、死信队列、延迟队列
> - Docker：容器化部署、Docker Compose
> - Spring AI：大模型集成、RAG 知识库
>
> **项目成果**：
>
> - 4 个完整项目经验
> - 10,000+ 设备并发处理能力
> - 10 倍系统吞吐提升
> - 1 个开源项目贡献
>
> **我觉得自己最大的优势**是：不仅会用技术，还愿意深入理解原理。这种刨根问底的精神，让我能够快速掌握新技术，并且在实际项目中做出合理的技术选型。

---

## 第九页：联系方式（10 秒）

**【演讲稿】**：

> 以上就是我的分享。感谢各位面试官的时间！
>
> 我的联系方式：
>
> - 邮箱：\[<your-email@example.com>]
> - 电话：\[138-xxxx-xxxx]
> - GitHub：\[your-github]
> - 个人主页：\[your-homepage]
>
> 期待能够加入贵公司，与优秀的团队一起成长！谢谢！

---

## 附录：高频面试问题深度准备

### Java 并发

**问：synchronized 和 ReentrantLock 的区别？**

> **我的理解**：
>
> - synchronized 是 JVM 层面的，通过 monitor 实现，自动加锁/释放
> - ReentrantLock 是 API 层面的，需要手动 lock()/unlock()
>
> **关键区别**：
>
> 1. ReentrantLock 支持中断（lockInterruptibly）
> 2. ReentrantLock 支持公平锁（synchronized 只能非公平）
> 3. ReentrantLock 可以绑定多个 Condition
> 4. synchronized 在 JDK 1.6 之后做了大量优化（偏向锁、轻量级锁），性能差距没那么大
>
> **实际项目**：我一般优先用 synchronized，代码更简洁。只有需要中断、公平锁这些高级特性时，才用 ReentrantLock。

**问：ConcurrentHashMap 如何保证线程安全？**

> **我的理解**：
>
> - JDK 1.7：分段锁（Segment），每个 Segment 一把锁
> - JDK 1.8：CAS + synchronized，锁粒度更细（只锁链表头节点）
>
> **为什么去掉 Segment？**
>
> - Segment 内存占用大
> - 锁粒度还是太粗
> - synchronized 优化后性能提升明显
>
> **实际项目**：高并发场景首选，比 Hashtable 性能好太多。

### Spring

**问：Bean 的生命周期？**

> **我的理解**（结合手写 IOC 的经验）：
>
> 1. 实例化（createBeanInstance）
> 2. 属性赋值（populateBean）
> 3. 初始化前（BeanPostProcessor.postProcessBeforeInitialization）
> 4. 初始化（InitializingBean.afterPropertiesSet / @PostConstruct）
> 5. 初始化后（BeanPostProcessor.postProcessAfterInitialization，这里做 AOP 代理）
> 6. 销毁（DisposableBean.destroy / @PreDestroy）
>
> **最关键的扩展点**：BeanPostProcessor。Spring 的很多魔法都是靠它实现的，比如 AOP 代理、@Autowired 注入。

**问：Spring 事务传播机制？**

> **我的理解**：
>
> - REQUIRED（默认）：有事务则加入，无事务则新建
> - REQUIRES_NEW：总是新建事务，挂起当前事务
> - NESTED：嵌套事务，基于保存点
> - SUPPORTS：支持事务，无事务也执行
> - NOT_SUPPORTED：不支持事务，挂起当前事务
> - MANDATORY：必须在事务中执行
> - NEVER：不能在事务中执行
>
> **实际项目**：我遇到过一个问题——在 REQUIRED 传播下，catch 住异常后事务不会回滚。后来改成 REQUIRES_NEW 才解决。

### MySQL

**问：索引失效的场景？**

> **我踩过的坑**：
>
> 1. 模糊查询 `%` 在前：`LIKE '%abc'`
> 2. 类型转换：字符串字段不加引号 `WHERE name = 123`
> 3. 函数运算：`WHERE DATE(create_time) = '2024-01-01'`
> 4. OR 连接条件：一边有索引一边没索引
> 5. 最左前缀不匹配：联合索引 (a,b,c)，查询只用 (b,c)
>
> **实际项目**：我在智能插座系统里，一开始没建联合索引，查询设备历史数据要 2 秒+。后来建了 (device_id, timestamp) 联合索引，降到 50ms。

**问：事务隔离级别？**

> **我的理解**：
>
> - READ UNCOMMITTED：读未提交（脏读、不可重复读、幻读）
> - READ COMMITTED：读已提交（解决脏读，仍有不可重复读、幻读）
> - REPEATABLE READ：可重复读（MySQL 默认，解决不可重复读，仍有幻读）
> - SERIALIZABLE：串行化（解决所有问题，性能最差）
>
> **MySQL 的特殊之处**：通过 Next-Key Lock 解决了幻读问题（其他数据库的 RR 级别仍有幻读）

### Redis

**问：缓存穿透/击穿/雪崩？**

> **我的理解**：
>
> - **穿透**：查询不存在的数据，缓存不命中，请求直达数据库
>   - 解决：布隆过滤器、缓存空值
> - **击穿**：热点 key 过期，大量请求直达数据库
>   - 解决：互斥锁、逻辑过期（不设置过期时间，后台异步更新）
> - **雪崩**：大量 key 同时过期，数据库压力激增
>   - 解决：随机过期时间、高可用架构
>
> **实际项目**：我在智能插座系统里用的是逻辑过期方案。热点数据不设过期时间，查询时发现数据旧了，异步更新缓存。

**问：Redis 持久化机制？**

> **我的理解**：
>
> - **RDB**：快照，定时将内存数据 dump 到磁盘
>   - 优点：文件小、恢复快
>   - 缺点：可能丢失最后一次快照后的数据
> - **AOF**：追加日志，记录每次写操作
>   - 优点：数据更安全
>   - 缺点：文件大、恢复慢
>
> **实际项目**：生产环境建议 RDB+AOF 混合使用。Redis 4.0+ 支持混合持久化，AOF 重写时会把当前内存数据用 RDB 格式写入 AOF 文件。

---

## 演讲技巧补充

1. **语速控制**：不要太快，重点地方可以停顿一下
2. **眼神交流**：看摄像头（线上）或面试官（线下）
3. **手势辅助**：讲到架构时可以比划一下层级关系
4. **引导追问**：讲到技术亮点时可以说"这个我研究得比较深，面试官如果有兴趣我可以展开讲讲"
5. **诚实原则**：不会的问题不要强行回答，可以说"这个我还需要深入学习，我的理解是..."

---

**祝你面试顺利！拿到心仪的 Offer！** 🎉
