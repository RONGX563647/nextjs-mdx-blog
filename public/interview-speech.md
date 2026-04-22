# Java 后端开发面试演示演讲稿

## 开场白（10 秒）

> 各位面试官好，我是 [姓名]，今天非常荣幸能够参加这次面试。我将从自我介绍、项目经历和技术能力三个方面进行展示。

---

## 第一页：封面（5 秒）

**【页面展示】**：个人简历封面

**演讲稿**：
> 如各位所见，我是一名专注于 Java 后端开发的工程师，接下来请允许我详细介绍自己。

---

## 第二页：自我介绍（45 秒）

**【页面展示】**：个人简介、教育背景、技术方向

**演讲稿**：

> **个人背景**：
> 我来自 [地点]，毕业于 [学校][专业]。在校期间，我系统学习了计算机科学的核心课程，并专注于 Java 后端开发方向。
>
> **技术栈概览**：
> - **核心语言**：Java，深入理解 JVM 内存模型、GC 算法、并发编程（JUC 包）
> - **框架生态**：熟练掌握 Spring Boot、Spring Cloud Alibaba 微服务全家桶
> - **中间件**：Redis（缓存设计/分布式锁）、RabbitMQ（异步解耦/消息可靠性）、MQTT（IoT 协议）
> - **数据库**：MySQL（索引优化/事务隔离）、JPA（批量操作/流式查询）
> - **监控运维**：Prometheus + Grafana（系统监控）、Docker（容器化部署）
>
> **核心优势**：
> 1. **扎实的理论基础**：深入理解数据结构、算法、设计模式，能够灵活运用在实际开发中
> 2. **完整的工程经验**：从 0 到 1 搭建过 IoT 平台、电商平台等多个完整项目
> 3. **性能优化能力**：有实际的高并发场景优化经验，包括缓存设计、异步处理、数据库优化
> 4. **开源贡献经历**：向 GVP 顶级项目 Hutool 贡献过代码，具备良好的代码规范意识
>
> **荣誉奖项**：
> - [奖项 1]
> - [奖项 2]
> - [奖项 3]

**【过渡语】**：
> 纸上得来终觉浅，接下来我将通过四个具体项目，展示我的技术实践能力。

---

## 第三页：项目概览（20 秒）

**【页面展示】**：四个项目卡片

**演讲稿**：

> 我的项目经历涵盖从**开源贡献**到**自研框架**，从**IoT 平台**到**电商平台**，每个项目都解决了特定的技术挑战：
>
> 1. **Hutool 开源贡献**：为 GVP 顶级 Java 工具包贡献 Word 模板引擎和 PDF 生成功能
> 2. **LightSSM**：手写轻量级 Spring 框架，深入理解 IOC/AOP/MVC核心原理
> 3. **智能插座系统**：基于 Java 21 虚拟线程+MQTT+RabbitMQ的IoT平台，支持千级设备并发
> 4. **不二价校园电商**：Spring Cloud 微服务架构，实现高并发秒杀和 AI 智能客服
>
> 接下来，我会逐一详细介绍每个项目的**核心痛点**、**技术方案**和**实现细节**。

---

## 第四页：Hutool 开源贡献（1 分钟）

**【页面展示】**：Hutool 项目详情

**演讲稿**：

### 项目背景

> Hutool 是一个 GVP 顶级 Java 工具包，Star 数超过 27k。我在 v7 版本贡献了**Word 模板引擎**和**PDF 生成工具**，代码已合并到 `feature/word-pdf-pdf-converter` 分支。
>
> **PR 链接**：https://gitee.com/chinabugotech/hutool/pulls/1439/files

### 核心痛点

> 1. **现有 Word 导出功能单一**：仅支持简单的表格导出，不支持模板化文档生成
> 2. **PDF 生成依赖繁重**：现有方案需要引入 iText、POI 等多个重型依赖
> 3. **占位符替换复杂**：缺乏统一的模板引擎，开发者需要手动处理 XML

### 技术方案

> **1. Word 模板引擎设计**
>
> ```java
> // 核心 API 设计 - 链式调用
> WordTemplate template = WordTemplate.create("template.docx")
>     .bindText("name", "张三")           // 文本占位符 {{name}}
>     .bindImage("logo", imageBytes)      // 图片占位符 {{@logo}}
>     .bindTable("table", dataList)       // 表格占位符 {{#table}}
>     .renderTo("output.docx");
> ```
>
> **技术实现细节**：
> - **解析层**：基于 Apache POI 解析 `.docx`（本质是 ZIP 压缩包）
> - **渲染器模式**：定义 `TextRenderer`、`ImageRenderer`、`TableRenderer` 三种渲染器
> - **占位符识别**：使用正则 `\\{\\{(@|#)?(\\w+)\\}\\}` 识别三种占位符类型
> - **XML 安全处理**：对特殊字符进行 XML 转义，防止注入攻击
>
> **2. PDF 生成工具**
>
> ```java
> // 基于 OFD 中间格式转换
> PdfWriter writer = PdfWriter.create("output.pdf")
>     .addText("标题", font, 16)
>     .addImage(imageBytes, x, y, width, height)
>     .addTable(dataList, columns)
>     .generate();
> ```
>
> **技术亮点**：
> - **OFD 格式转换**：复用 ofdrw 库，无需引入额外依赖
> - **中文支持**：内置宋体/黑体字体处理，解决中文乱码问题
> - **布局引擎**：简单的流式布局计算，自动分页

### 提交记录

> - `995e681f6`：Word 模板引擎基础功能（文本替换）
> - `276b7ca67`：图片和表格渲染功能
> - `f12179c73`：完整功能合并 + 测试覆盖

### 面试加分点

> **面试官可能问的问题**：
> 1. **问**：`.docx` 文件的本质是什么？
>    **答**：本质是 ZIP 压缩包，包含 `word/document.xml`（文档内容）、`word/media/`（图片资源）、`_rels/`（关系定义）
>
> 2. **问**：如何保证模板替换不破坏 XML 结构？
>    **答**：使用 POI 的 XWPF 对象模型操作，而非字符串替换；对特殊字符进行 XML 转义（`<` → `&lt;`）
>
> 3. **问**：OFD 是什么？为什么选择 OFD 作为中间格式？
>    **答**：OFD 是中国自主的版式文档标准（类似 PDF）。选择 OFD 是因为 ofdrw 库已成熟，可以直接复用，避免重复造轮子

### 技术收获

> 通过这个项目，我深入理解了：
> - Apache POI 的底层原理（XML 解析、DOM 树操作）
> - 设计模式在实际开发中的应用（渲染器模式、建造者模式）
> - 开源项目的代码规范和协作流程

---

## 第五页：LightSSM（2 分钟）

**【页面展示】**：LightSSM 四个翻转卡片

**演讲稿**：

### 项目背景

> **在线演示**：https://rongx563647.github.io/LightSSM/
> **系列博客**：https://blog.csdn.net/king_model/category_13130911.html
>
> 这个项目源于我对 Spring 框架的深入思考：**如果让我从零实现一个 Spring，我会怎么做？**
>
> 通过这个项目，我手写了一个精简版的 Spring + SpringMVC + MyBatis，虽然功能不如官方完善，但帮助我深入理解了框架的核心设计思想。

### 模块一：迷你 IOC 容器

> **正面 - 核心功能**：
> - 包扫描 + BeanDefinitionMap 注册
> - 三级缓存解决循环依赖
> - @Component + @Autowired 注解注入
> - @Scope 单例/原型模式
>
> **反面 - 核心代码**：
> ```java
> public class DefaultListableBeanFactory {
>   // 一级缓存：完整 Bean
>   private Map<String, Object> singletonObjects = new ConcurrentHashMap<>();
>   // 二级缓存：早期引用（未完全初始化）
>   private Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>();
>   // 三级缓存：ObjectFactory（用于 AOP 代理）
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
> **官方 Spring 设计对比**：
> - **核心类**：BeanDefinitionRegistry → DefaultListableBeanFactory → BeanPostProcessor → BeanWrapper
> - **设计模式**：工厂模式 + 模板方法 + 策略模式
> - **关键机制**：
>   1. BeanDefinition 存储 Bean 定义信息（scope、lazyInit、依赖关系）
>   2. 三级缓存 + ObjectFactory 提前暴露引用解决循环依赖
>   3. BeanPostProcessor 提供 Bean 初始化前后扩展点
>   4. FactoryBean 允许自定义 Bean 创建逻辑
>
> **我的不足**：
> 1. 未实现 BeanPostProcessor 完整生命周期（只实现了最基础的依赖注入）
> 2. 缺少 @Configuration 配置类处理（ConfigurationClassPostProcessor）
> 3. 未支持 FactoryBean 和 BeanFactoryPostProcessor 扩展点
> 4. 循环依赖仅限 setter 注入，不支持构造器注入循环依赖

### 模块二：迷你 SpringMVC

> **正面 - 核心功能**：
> - DispatcherServlet 核心分发器
> - HandlerMapping URL 映射表
> - @RequestMapping + @ResponseBody
> - @RequestParam + @PathVariable
>
> **反面 - 核心代码**：
> ```java
> public class DispatcherServlet extends HttpServlet {
>   private List<HandlerMapping> handlerMappings = new ArrayList<>();
>   private List<HandlerAdapter> handlerAdapters = new ArrayList<>();
>   
>   @Override
>   protected void service(HttpServletRequest req, HttpServletResponse resp) {
>     doDispatch(req, resp);
>   }
>   
>   private void doDispatch(HttpServletRequest req, HttpServletResponse resp) {
>     // 1. 根据 URL 查找 Handler
>     HandlerExecutionChain handler = getHandler(req);
>     if (handler == null) return;
>     
>     // 2. 查找适配器
>     HandlerAdapter adapter = getHandlerAdapter(handler);
>     
>     // 3. 执行 Handler（调用 Controller 方法）
>     ModelAndView mv = adapter.handle(req, resp, handler);
>     
>     // 4. 渲染视图
>     render(mv, req, resp);
>   }
> }
> ```
>
> **官方 Spring 设计对比**：
> - **核心类**：DispatcherServlet → HandlerMapping → HandlerAdapter → ViewResolver → HandlerExceptionResolver
> - **设计模式**：前端控制器 + 策略模式 + 适配器模式
> - **关键机制**：
>   1. HandlerMapping 多种实现（注解/路径/正则）
>   2. HandlerAdapter 支持多种 Handler 类型（Method/Controller）
>   3. HandlerMethodArgumentResolver 支持 100+ 参数类型
>   4. HandlerExceptionResolver 统一异常处理（@ExceptionHandler）
>
> **我的不足**：
> 1. 未实现拦截器链（HandlerInterceptor）
> 2. 缺少视图解析器（ViewResolver）和视图渲染
> 3. 参数绑定仅支持基础类型，不支持复杂对象和自定义类型转换器
> 4. 异常处理机制不完善（无 @ExceptionHandler/@ControllerAdvice）

### 模块三：迷你 AOP

> **正面 - 核心功能**：
> - JDK/CGLIB 双代理自动切换
> - @Before + @After + @Around
> - AspectJ 表达式切入点
> - 方法拦截器链织入
>
> **反面 - 核心代码**：
> ```java
> public class AopProxy {
>   public Object createProxy(Object target) {
>     if (target.getClass().isInterface()) {
>       return JDKProxy(target);  // JDK 动态代理
>     } else {
>       return CGLIBProxy(target); // CGLIB 字节码增强
>     }
>   }
>   
>   // Advisor = Advice（增强逻辑） + Pointcut（切入点表达式）
>   public Object invoke(MethodInvocation invocation) {
>     // 拦截器链调用
>     if (interceptorIndex < interceptors.size()) {
>       MethodInterceptor interceptor = interceptors.get(interceptorIndex++);
>       return interceptor.invoke(invocation);
>     }
>     return invocation.proceed(); // 执行目标方法
>   }
> }
> ```
>
> **官方 Spring 设计对比**：
> - **核心类**：ProxyFactory → Advisor → Advice → Pointcut → AopProxy
> - **设计模式**：代理模式 + 责任链 + 拦截器模式
> - **关键机制**：
>   1. ProxyFactory + BeanPostProcessor 实现自动代理
>   2. AdvisorChainFactory 构建拦截器调用链
>   3. @Transactional 基于 AOP 的声明式事务
>   4. ExposeInvocationInterceptor 暴露当前调用链
>
> **我的不足**：
> 1. 未实现 Spring AOP 自动代理机制（InfrastructureAdvisorAutoProxyCreator）
> 2. 不支持 @AspectJ 注解声明式切面（@Aspect/@Pointcut/@Around）
> 3. 缺少事务管理集成（@Transactional + PlatformTransactionManager）
> 4. 代理对象创建时机未优化（非懒加载，启动时创建）

### 模块四：整合 MyBatis

> **正面 - 核心功能**：
> - XML SQL 映射配置
> - 动态 SQL（OGNL 表达式）
> - 参数自动绑定 + ResultSet 映射
> - 插件拦截器机制
>
> **反面 - 核心代码**：
> ```java
> public class SqlSessionFactory {
>   private Configuration configuration;
>   
>   public SqlSession openSession() {
>     return new DefaultSqlSession(configuration);
>   }
> }
>
> public class Configuration {
>   private Map<String, MappedStatement> mappedStatements = new HashMap<>();
>   private Map<String, TypeHandler> typeHandlers = new HashMap<>();
>   private Executor executor = new SimpleExecutor(); // 执行器
> }
> ```
>
> **官方 MyBatis 设计对比**：
> - **核心类**：SqlSessionFactoryBuilder → Configuration → MappedStatement → Executor → SqlSession
> - **设计模式**：建造者模式 + 工厂模式 + 模板方法 + 代理模式
> - **关键机制**：
>   1. 一级缓存 PerpetualCache（SqlSession 级别）
>   2. 二级缓存 Ehcache/Redis（Mapper Namespace 级别）
>   3. PageHelper 分页插件基于拦截器自动拼接 LIMIT
>   4. Spring 事务集成 DataSourceTransactionManager
>
> **我的不足**：
> 1. 未实现一级/二级缓存机制，每次查询直连数据库
> 2. 动态 SQL 仅支持基础 if/foreach，不支持 choose/when/otherwise
> 3. 缺少分页插件和 SQL 性能分析（Slow SQL 日志）
> 4. 多数据源支持和事务集成不完善（无 @Transactional 整合）

### 面试加分点

> **面试官可能问的问题**：
>
> 1. **问**：Spring 的三级缓存分别是什么？为什么需要三级？
>    **答**：
>    - 一级：singletonObjects（完整 Bean）
>    - 二级：earlySingletonObjects（早期引用，未完全初始化）
>    - 三级：singletonFactories（ObjectFactory，用于 AOP 代理）
>    - **为什么需要三级**：因为 AOP 代理需要在 Bean 初始化之前创建代理对象。如果只有两级，当发生循环依赖时，无法提前暴露代理对象。三级缓存通过 ObjectFactory 延迟创建代理，解决了这个问题。
>
> 2. **问**：JDK 代理和 CGLIB 代理的区别？
>    **答**：
>    - **JDK 代理**：基于接口，使用反射调用，性能较低；只能代理接口方法
>    - **CGLIB 代理**：基于字节码生成子类，使用 ASM 修改字节码，性能较高；可以代理类方法
>    - **Spring 的选择策略**：有接口用 JDK，无接口用 CGLIB；可以通过 `proxyTargetClass=true` 强制使用 CGLIB
>
> 3. **问**：SpringMVC 的请求处理流程？
>    **答**：
>    1. 用户发送请求 → DispatcherServlet
>    2. DispatcherServlet → HandlerMapping（查找 Handler）
>    3. HandlerMapping → DispatcherServlet（返回 HandlerExecutionChain）
>    4. DispatcherServlet → HandlerAdapter（执行 Handler）
>    5. HandlerAdapter → Controller（执行业务逻辑）
>    6. Controller → ModelAndView（返回视图模型）
>    7. DispatcherServlet → ViewResolver（解析视图）
>    8. ViewResolver → View（返回具体视图）
>    9. DispatcherServlet → 渲染视图 → 响应给用户

### 技术收获

> 通过这个项目，我深入理解了：
> - Spring IOC 的三级缓存设计哲学
> - SpringMVC 的前端控制器模式
> - AOP 的代理机制和拦截器链设计
> - MyBatis 的 SQL 映射和执行流程
> - **更重要的是**：学会了如何阅读源码，如何从复杂代码中提取核心逻辑

---

## 第六页：智能插座系统（3 分钟）⭐重点

**【页面展示】**：智能插座系统完整架构

**演讲稿**：

### 项目背景

> **GitHub**：https://github.com/RONGX563647/dorm-power-console
>
> 这是一个基于 **Java 21 虚拟线程 + MQTT + RabbitMQ** 的实时监控与智能告警平台，支持**10,000+ 设备并发**。
>
> 项目源于我在宿舍的实际需求：学校电力设备缺乏统一监控平台，设备故障发现滞后，影响教学和生活。

### 核心痛点

> **1. 千级设备并发连接 OOM**
> - 传统平台线程模型：每个连接占用一个线程，线程栈大小 1MB
> - 1000 个设备 = 1000 个线程 = 1GB 内存（仅线程栈）
> - 设备量增加 → 线程数增加 → OOM
>
> **2. 设备批量上报阻塞**
> - 设备每 5 秒上报一次遥测数据（电压、电流、功率）
> - 1000 台设备 = 200 条/秒 = 12,000 条/分钟
> - 同步写入数据库 → 连接池耗尽 → 接口超时
>
> **3. 接口响应慢（>500ms）**
> - 频繁查询数据库获取设备状态
> - 无缓存设计，每次查询直连数据库
> - 复杂 SQL 未优化，缺少联合索引
>
> **4. 恶意请求缺乏防护**
> - 未做限流，单 IP 可发起大量请求
> - 单机限流无法应对多实例部署
> - 缺乏分布式限流方案

### 技术方案（层级架构）

> **第一层：客户端层**
> - Vue 3 Web 管理后台
> - UniApp 移动端（Android/iOS）
> - IoT 设备（智能插座，MQTT 协议）
>
> **第二层：网关层**
> - Nginx 反向代理（负载均衡 + SSL + 静态资源）
>
> **第三层：应用服务层**
> - JWT 认证 + Redis 黑名单
> - WebSocket 连接管理（JUC 并发）
> - MQTT Bridge 虚拟线程桥接
> - RabbitMQ 异步解耦
>
> **第四层：核心服务层**
> - AOP 限流（Redis+Lua）
> - AOP 审计（审计日志）
> - 多级缓存（Caffeine+Redis）
> - JPA 批量操作 + 联合索引
> - PBKDF2 加盐哈希
>
> **第五层：监控与数据层**
> - Prometheus（11 类指标）
> - Grafana（8 个监控面板）
> - MySQL（联合索引优化）

### 核心技术实现（重点讲解）

#### 1. Java 21 虚拟线程（解决千级设备并发）

> **问题**：平台线程内存占用大，无法支撑千级设备并发
>
> **解决方案**：
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
> **性能对比**：
> - 平台线程：栈大小 1MB，1000 线程 = 1GB 内存
> - 虚拟线程：栈大小几百字节，10000 线程 = 几 MB 内存
> - **内存占用降低 99%**
>
> **面试加分点**：
> - 虚拟线程由 JVM 调度，挂载在平台线程上运行
> - 当虚拟线程阻塞（IO/等待）时，JVM 自动切换到其他虚拟线程
> - 适合 IO 密集型任务（网络请求、数据库查询），不适合 CPU 密集型任务

#### 2. RabbitMQ 异步链路（解决批量上报阻塞）

> **问题**：同步写入数据库导致连接池耗尽
>
> **解决方案**：
> ```java
> // 生产者：发送消息到队列
> @Service
> public class RabbitMQProducer {
>     @Autowired
>     private RabbitTemplate rabbitTemplate;
>     
>     public void sendTelemetry(TelemetryData data) {
>         // 手动确认模式 + 死信队列
>         rabbitTemplate.convertAndSend(
>             "telemetry.exchange",
>             "telemetry.routing",
>             data,
>             message -> {
>                 message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
>                 return message;
>             }
>         );
>     }
> }
>
> // 消费者：异步批量消费
> @Service
> public class RabbitMQConsumer {
>     @RabbitListener(queues = "telemetry.queue", ackMode = "MANUAL")
>     public void handleTelemetry(List<TelemetryData> messages, Channel channel) {
>         try {
>             // 批量写入数据库（100 条/批）
>             telemetryRepository.saveAll(messages);
>             // 手动 ACK
>             channel.basicAck(messages.getLast().getDeliveryTag(), true);
>         } catch (Exception e) {
>             // 拒绝消息，转入死信队列
>             channel.basicNack(messages.getLast().getDeliveryTag(), true, false);
>         }
>     }
> }
> ```
>
> **性能提升**：
> - 系统吞吐提升**10 倍**
> - 数据库 IO 压力减少**80%**
> - 接口响应时间从 500ms 降至**50ms**
>
> **面试加分点**：
> - **生产者 Confirm**：保证消息到达 Broker
> - **消费者手动 ACK**：保证消息被成功消费
> - **死信队列（DLQ）**：处理失败消息，便于人工干预
> - **延迟队列**：基于 TTL + DLX 实现，用于设备心跳超时检测

#### 3. Redis+Lua 分布式滑动窗口限流（解决恶意请求）

> **问题**：单机限流无法应对多实例部署
>
> **解决方案**：
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
> ```java
> // Java 调用 Lua 脚本
> @Service
> public class RedisRateLimiter {
>     @Autowired
>     private RedisTemplate<String, String> redisTemplate;
>     
>     private static final String SCRIPT = "..."; // 上面的 Lua 脚本
>     
>     public boolean tryAcquire(String key, int limit, int window) {
>         RedisScript<Long> redisScript = RedisScript.of(SCRIPT, Long.class);
>         Long result = redisTemplate.execute(
>             redisScript,
>             Collections.singletonList(key),
>             String.valueOf(System.currentTimeMillis()),
>             String.valueOf(window),
>             String.valueOf(limit)
>         );
>         return result == 1;
>     }
> }
> ```
>
> **性能指标**：
> - QPS 承载：**10,000+**（提升 100 倍）
> - 限流精度：毫秒级
> - 分布式支持：多实例共享限流配额
>
> **面试加分点**：
> - Lua 脚本在 Redis 中**原子执行**，避免并发问题
> - 滑动窗口算法：比固定窗口更平滑，避免临界问题
> - 使用 ZSET 存储请求时间戳，自动过期

#### 4. Caffeine+Redis 多级缓存（解决接口响应慢）

> **问题**：频繁查询数据库，接口响应慢
>
> **解决方案**：
> ```java
> @Configuration
> public class MultiLevelCacheConfig {
>     
>     // L1 缓存：Caffeine（本地缓存，热点数据）
>     @Bean
>     public Cache<Object, Object> caffeineCache() {
>         return Caffeine.newBuilder()
>             .maximumSize(10000)
>             .expireAfterWrite(5, TimeUnit.MINUTES)
>             .recordStats()
>             .build();
>     }
>     
>     // L2 缓存：Redis（分布式缓存，全量数据）
>     @Bean
>     public RedisTemplate<String, Object> redisTemplate() {
>         // ... 配置序列化
>     }
> }
>
> @Service
> public class TelemetryService {
>     
>     public TelemetryData getTelemetry(Long deviceId) {
>         // 1. 查询 L1 缓存（Caffeine）
>         TelemetryData data = l1Cache.getIfPresent(deviceId);
>         if (data != null) {
>             return data;  // 命中 L1，<1ms
>         }
>         
>         // 2. 查询 L2 缓存（Redis）
>         data = (TelemetryData) redisTemplate.opsForValue().get("telemetry:" + deviceId);
>         if (data != null) {
>             l1Cache.put(deviceId, data);  // 回写 L1
>             return data;  // 命中 L2，<10ms
>         }
>         
>         // 3. 查询数据库
>         data = telemetryRepository.findById(deviceId).orElse(null);
>         if (data != null) {
>             redisTemplate.opsForValue().set("telemetry:" + deviceId, data, 10, TimeUnit.MINUTES);
>             l1Cache.put(deviceId, data);
>         }
>         return data;
>     }
> }
> ```
>
> **性能指标**：
> - 缓存命中率：**95%**
> - L1 命中：<1ms
> - L2 命中：<10ms
> - 接口平均响应：**<50ms**

#### 5. JPA 批量操作 + 联合索引（数据库优化）

> **问题**：单条插入效率低，SQL 查询慢
>
> **解决方案**：
> ```java
> // Repository：批量操作
> public interface TelemetryRepository extends JpaRepository<TelemetryData, Long> {
>     
>     // 批量插入（JDBC Batch）
>     @Modifying
>     @Query(value = "INSERT INTO telemetry (device_id, voltage, current, power) VALUES ?1, ?2, ?3, ?4", 
>            nativeQuery = true)
>     void batchInsert(List<Object[]> params);
>     
>     // 流式查询（避免 OOM）
>     @Query("SELECT t FROM TelemetryData t WHERE t.deviceId = ?1")
>     Stream<TelemetryData> findByDeviceIdStream(Long deviceId);
> }
>
> // 实体类：联合索引
> @Entity
> @Table(indexes = {
>     @Index(name = "idx_device_time", columnList = "deviceId, timestamp"),
>     @Index(name = "idx_status", columnList = "status")
> })
> public class TelemetryData {
>     @Id
>     private Long deviceId;
>     private LocalDateTime timestamp;
>     private Double voltage;
>     private Double current;
>     private Double power;
>     private String status;
> }
> ```
>
> **性能提升**：
> - 批量插入：**100 条/批**，效率提升 50 倍
> - 联合索引：查询速度提升 10 倍
> - 流式分页：避免大表全量加载

#### 6. JWT + Redis 黑名单（分布式鉴权）

> **问题**：JWT 无状态，无法主动失效 Token
>
> **解决方案**：
> ```java
> @Service
> public class TokenBlacklist {
>     @Autowired
>     private RedisTemplate<String, String> redisTemplate;
>     
>     // 添加 Token 到黑名单
>     public void blacklist(String token, long expireTime) {
>         String key = "token:blacklist:" + token;
>         // SETNX + EX 原子操作
>         redisTemplate.opsForValue()
>             .set(key, "1", expireTime, TimeUnit.SECONDS);
>     }
>     
>     // 检查 Token 是否在黑名单
>     public boolean isBlacklisted(String token) {
>         return Boolean.TRUE.equals(
>             redisTemplate.hasKey("token:blacklist:" + token)
>         );
>     }
> }
>
> // AOP 切面：统一鉴权
> @Aspect
> @Component
> public class AuthAspect {
>     @Around("@annotation(RequireAuth)")
>     public Object checkAuth(ProceedingJoinPoint pjp) throws Throwable {
>         String token = getTokenFromRequest();
>         
>         // 1. 验证 Token 有效性
>         if (!JwtUtil.validate(token)) {
>             throw new AuthException("Token 无效");
>         }
>         
>         // 2. 检查黑名单
>         if (tokenBlacklist.isBlacklisted(token)) {
>             throw new AuthException("Token 已失效");
>         }
>         
>         return pjp.proceed();
>     }
> }
> ```
>
> **技术亮点**：
> - Redis SETNX+EX 原子操作，避免并发问题
> - 分布式黑名单，多实例共享
> - Token 过期时间 = JWT 剩余有效期

#### 7. RBAC 细粒度权限模型

> **三级权限设计**：
> - **接口级**：控制 API 访问（如 `/api/admin/**`）
> - **方法级**：控制业务方法（如 `deleteUser()`）
> - **数据级**：控制数据范围（如只能查看本部门数据）
>
> ```java
> @Entity
> public class UserAccount {
>     @ManyToMany
>     @JoinTable(name = "user_role", ...)
>     private List<Role> roles;
> }
>
> @Entity
> public class Role {
>     @ManyToMany
>     @JoinTable(name = "role_permission", ...)
>     private List<Permission> permissions;
> }
>
> @Entity
> public class Permission {
>     private String resource;      // 资源（如 "user"）
>     private String action;        // 操作（如 "delete"）
>     private String dataScope;     // 数据范围（如 "dept:1001"）
> }
> ```
>
> **权限校验**：
> ```java
> public boolean hasPermission(UserAccount user, String resource, String action, String dataScope) {
>     return user.getRoles().stream()
>         .flatMap(role -> role.getPermissions().stream())
>         .anyMatch(p -> 
>             p.getResource().equals(resource) &&
>             p.getAction().equals(action) &&
>             matchDataScope(p.getDataScope(), dataScope)
>         );
> }
> ```

#### 8. AOP 三大切面（限流 + 审计 + 异常治理）

> **1. 限流切面**：
> ```java
> @Aspect
> @Component
> public class RateLimitAspect {
>     @Autowired
>     private RedisRateLimiter rateLimiter;
>     
>     @Around("@annotation(RateLimit)")
>     public Object limitRate(ProceedingJoinPoint pjp) throws Throwable {
>         RateLimit annotation = getAnnotation(pjp);
>         String key = pjp.getSignature().toShortString();
>         
>         if (!rateLimiter.tryAcquire(key, annotation.limit(), annotation.window())) {
>             throw new RateLimitException("请求过于频繁");
>         }
>         
>         return pjp.proceed();
>     }
> }
> ```
>
> **2. 审计日志切面**：
> ```java
> @Aspect
> @Component
> public class AuditLogAspect {
>     @Around("@annotation(AuditLog)")
>     public Object logAudit(ProceedingJoinPoint pjp) throws Throwable {
>         long startTime = System.currentTimeMillis();
>         
>         try {
>             Object result = pjp.proceed();
>             logSuccess(pjp, result, System.currentTimeMillis() - startTime);
>             return result;
>         } catch (Exception e) {
>             logError(pjp, e, System.currentTimeMillis() - startTime);
>             throw e;
>         }
>     }
> }
> ```
>
> **3. 全局异常治理**：
> ```java
> @RestControllerAdvice
> public class GlobalExceptionHandler {
>     
>     @ExceptionHandler(BusinessException.class)
>     public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
>         return ResponseEntity.status(400)
>             .body(new ErrorResponse(400, e.getMessage()));
>     }
>     
>     @ExceptionHandler(Exception.class)
>     public ResponseEntity<ErrorResponse> handleUnknown(Exception e) {
>         log.error("未知异常", e);
>         return ResponseEntity.status(500)
>             .body(new ErrorResponse(500, "系统繁忙"));
>     }
> }
> ```

#### 9. PBKDF2 加盐哈希（密码安全）

> **问题**：明文存储密码，存在安全风险
>
> **解决方案**：
> ```java
> public class PasswordUtils {
>     private static final int ITERATIONS = 65536;
>     private static final int KEY_LENGTH = 256;
>     
>     // 加盐哈希
>     public static String hash(String password) {
>         SecureRandom random = new SecureRandom();
>         byte[] salt = new byte[16];
>         random.nextBytes(salt);
>         
>         KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
>         SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
>         byte[] hash = factory.generateSecret(spec).getEncoded();
>         
>         // 拼接盐值和哈希值（Base64 编码）
>         return Base64.getEncoder().encodeToString(salt) + ":" + 
>                Base64.getEncoder().encodeToString(hash);
>     }
>     
>     // 恒定时间比对（防时序攻击）
>     public static boolean verify(String password, String hashed) {
>         String[] parts = hashed.split(":");
>         byte[] salt = Base64.getDecoder().decode(parts[0]);
>         byte[] hash = Base64.getDecoder().decode(parts[1]);
>         
>         KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
>         SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
>         byte[] testHash = factory.generateSecret(spec).getEncoded();
>         
>         // 恒定时间比对（避免时序攻击）
>         return MessageDigest.isEqual(hash, testHash);
>     }
> }
> ```
>
> **面试加分点**：
> - **随机盐值**：每个用户独立盐值，防止彩虹表攻击
> - **高迭代次数**：65536 次迭代，增加暴力破解成本
> - **恒定时间比对**：防止时序攻击（攻击者通过比对时间推断密码）

#### 10. Prometheus+Grafana 监控

> **11 类监控指标**：
> 1. JVM 指标（内存/GC/线程）
> 2. HTTP 请求指标（QPS/响应时间/错误率）
> 3. 数据库指标（连接数/查询耗时）
> 4. Redis 指标（命中率/内存使用）
> 5. RabbitMQ 指标（队列长度/消费速率）
> 6. 设备在线数
> 7. 遥测数据处理量
> 8. 告警触发次数
> 9. 缓存命中率
> 10. 限流拒绝次数
> 11. 认证失败次数
>
> **8 个 Grafana 面板**：
> 1. 系统概览（核心指标）
> 2. JVM 监控
> 3. HTTP 请求分析
> 4. 数据库性能
> 5. Redis 缓存
> 6. RabbitMQ 队列
> 7. 设备状态
> 8. 告警统计

### 性能优化成果

> | 指标 | 优化前 | 优化后 | 提升 |
> |------|--------|--------|------|
> | 并发连接数 | 1000 | 10,000+ | 10 倍 |
> | 系统吞吐量 | 200 条/秒 | 2000 条/秒 | 10 倍 |
> | 接口响应时间 | >500ms | <50ms | 10 倍 |
> | QPS 承载 | 100 | 10,000+ | 100 倍 |
> | 缓存命中率 | 0% | 95% | - |
> | 数据库 IO | 100% | 20% | 减少 80% |

### 面试加分点

> **面试官可能问的问题**：
>
> 1. **问**：虚拟线程和平台线程的本质区别？
>    **答**：
>    - **平台线程**：操作系统内核线程的封装，一对一映射，栈大小固定（1MB）
>    - **虚拟线程**：JVM 调度的轻量级线程，多对一映射（多个虚拟线程挂载在少量平台线程上），栈动态扩展（初始几百字节）
>    - **适用场景**：虚拟线程适合 IO 密集型（网络/数据库），平台线程适合 CPU 密集型
>
> 2. **问**：RabbitMQ 如何保证消息不丢失？
>    **答**：
>    - **生产者**：开启 Confirm 模式，Broker 确认后认为发送成功
>    - **Broker**：消息持久化（队列和消息都设置为持久化）
>    - **消费者**：手动 ACK 模式，业务处理成功后再确认
>    - **失败处理**：死信队列（DLQ）存储失败消息，人工干预恢复
>
> 3. **问**：Redis 限流为什么用 Lua 脚本？
>    **答**：
>    - **原子性**：Lua 脚本在 Redis 中单线程执行，避免并发问题
>    - **性能**：减少网络往返（一次调用完成多次操作）
>    - **灵活性**：可以实现复杂逻辑（如滑动窗口）
>
> 4. **问**：多级缓存如何保证一致性？
>    **答**：
>    - **更新策略**：先更新数据库，再删除缓存（Cache Aside）
>    - **过期时间**：L1 缓存过期时间短（5 分钟），L2 缓存长（10 分钟）
>    - **极端情况**：允许短暂不一致（最终一致性）
>
> 5. **问**：联合索引的设计原则？
>    **答**：
>    - **最左前缀原则**：索引从左到右匹配，查询条件必须包含最左列
>    - **高频列优先**：将查询频率高的列放在左边
>    - **区分度高**：将区分度高的列放在左边（如设备 ID > 时间）
>    - **覆盖索引**：尽量让查询的列都在索引中，避免回表

---

## 第七页：不二价校园电商（2 分钟）

**【页面展示】**：不二价项目架构

**演讲稿**：

### 项目背景

> **不二价**是一个校园二手交易平台，解决学生闲置物品流转痛点。项目采用 **Spring Cloud Alibaba**微服务架构，支持**高并发秒杀**和**AI 智能客服**。

### 核心痛点

> **1. 秒杀场景库存超卖**
> - 多个用户同时下单，库存扣减并发问题
> - 数据库行锁竞争，性能瓶颈
>
> **2. 分布式事务一致性**
> - 订单服务、库存服务、支付服务跨服务调用
> - 网络故障导致数据不一致
>
> **3. 人工客服响应慢**
> - 咨询量大，客服人力不足
> - 重复问题占比高（60%+）
>
> **4. 校外用户混入**
> - 非校内用户注册，存在安全隐患
> - 缺乏有效的身份认证机制

### 技术方案

> **1. Redis Lua 原子扣减（解决库存超卖）**
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
> **效果**：库存超卖率**0%**
>
> **2. Seata AT 分布式事务（解决数据一致性）**
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
> **效果**：事务**100%** 一致性
>
> **3. Spring AI 智能客服（解决响应慢）**
> ```java
> @Service
> public class AiCustomerService {
>     @Autowired
>     private ChatClient chatClient;  // Spring AI
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
> **效果**：AI 客服覆盖率**60%**
>
> **4. 身份认证 + 地理围栏（解决校外用户）**
> - 学号 + 密码认证（对接学校统一身份认证）
> - 地理围栏：仅限校内 IP 段注册
> - 人脸识别：可选，用于高价值交易
>
> **效果**：**100%** 校内用户

### 技术栈

> - Spring Cloud Alibaba（Nacos/Sentinel/Seata）
> - Redis + Lua（原子操作）
> - Spring AI（智能客服）
> - WebSocket（实时通知）
> - Sentinel（限流降级）

---

## 第八页：技术能力总结（30 秒）

**【页面展示】**：技术能力雷达图

**演讲稿**：

> 通过这四个项目，我掌握了以下核心技术：
>
> **后端核心**：
> - Java（95%）：JVM、并发编程、集合框架
> - Spring（90%）：Boot、Cloud、MVC、IOC、AOP
> - MySQL（85%）：索引优化、事务隔离、SQL 调优
> - Redis（88%）：缓存设计、分布式锁、数据结构
>
> **微服务与中间件**：
> - Spring Cloud（85%）：Nacos、Sentinel、Seata、Gateway
> - RabbitMQ（82%）：消息可靠性、死信队列、延迟队列
> - Docker（75%）：容器化部署、Docker Compose
> - Spring AI（70%）：大模型集成、RAG 知识库
>
> **项目成果**：
> - 4+ 完整项目经验
> - 1000+ 设备并发处理能力
> - 5 倍系统吞吐提升
> - 1 个开源项目贡献

---

## 第九页：联系方式（10 秒）

**【页面展示】**：联系方式

**演讲稿**：

> **感谢各位面试官的聆听！**
>
> 我的联系方式如下：
> - 邮箱：[your-email@example.com]
> - 电话：[138-xxxx-xxxx]
> - GitHub：[your-github]
> - 个人主页：[your-homepage]
>
> 期待能够加入贵公司，与优秀的团队一起成长！
>
> **谢谢！**

---

## 附录：常见面试问题准备

### Java 基础

1. **HashMap 的底层实现？**
   - JDK 1.7：数组 + 链表
   - JDK 1.8：数组 + 链表 + 红黑树（链表长度>8 且数组长度>64 时转红黑树）
   - 扩容机制：2 倍扩容，rehash

2. **ConcurrentHashMap 如何保证线程安全？**
   - JDK 1.7：分段锁（Segment）
   - JDK 1.8：CAS + synchronized（锁粒度更细）

3. **synchronized 和 ReentrantLock 的区别？**
   - synchronized：JVM 层面，自动加锁/释放，不支持中断
   - ReentrantLock：API 层面，手动加锁/释放，支持中断、公平锁

### Spring

1. **Bean 的生命周期？**
   - 实例化 → 属性赋值 → 初始化前（BeanPostProcessor） → 初始化（InitializingBean） → 初始化后（AOP 代理）

2. **Spring 事务传播机制？**
   - REQUIRED（默认）：有事务则加入，无事务则新建
   - REQUIRES_NEW：总是新建事务，挂起当前事务
   - NESTED：嵌套事务，基于保存点

### MySQL

1. **索引失效的场景？**
   - 模糊查询 `%` 在前
   - 类型转换（字符串不加引号）
   - 函数运算
   - OR 连接条件（一边无索引）

2. **事务隔离级别？**
   - READ UNCOMMITTED：读未提交
   - READ COMMITTED：读已提交
   - REPEATABLE READ：可重复读（MySQL 默认）
   - SERIALIZABLE：串行化

### Redis

1. **缓存穿透/击穿/雪崩？**
   - 穿透：布隆过滤器、缓存空值
   - 击穿：互斥锁、逻辑过期
   - 雪崩：随机过期时间、高可用架构

2. **Redis 持久化机制？**
   - RDB：快照，数据完整但可能丢失最后一次快照后的数据
   - AOF：追加日志，数据更安全但文件较大

---

## 演讲技巧提示

1. **时间控制**：总时长约 10-12 分钟，重点放在智能插座系统（3 分钟）
2. **语速适中**：不要过快，给面试官思考时间
3. **眼神交流**：看摄像头（线上）或面试官（线下）
4. **重点突出**：技术难点和解决方案要详细讲解
5. **引导提问**：讲到技术亮点时可以停顿，引导面试官提问
6. **诚实原则**：不会的问题不要强行回答，可以说"这个我还需要深入学习"

---

**祝你面试顺利！拿到心仪的 Offer！** 🎉
