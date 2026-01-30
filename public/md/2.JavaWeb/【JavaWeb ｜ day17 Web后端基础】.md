# ⚙️ JavaWeb Day17 - Web后端基础

> 💡 **后端开发的基石！** 本文聚焦Web后端核心技术——Maven依赖管理、HTTP协议、Spring IOC/DI、MySQL数据库、JDBC/Mybatis，帮你构建完整的后端知识体系，避开90%的坑。

---

## 🎯 快速回顾

- **📦 Maven核心**：依赖管理、聚合工程、版本锁定（dependencyManagement）
- **🌐 HTTP协议**：RESTful API设计、请求方法（GET/POST/PUT/DELETE）、状态码
- **🔄 Spring IOC**：控制反转、依赖注入（DI）、自动配置原理
- **💾 MySQL数据库**：索引类型、事务隔离级别、锁机制
- **🔌 JDBC/Mybatis**：数据库连接、SQL执行、结果映射
- **⚠️ 常见问题**：依赖冲突、跨域、循环依赖、索引失效

---

## 📑 目录

- [一、Maven：项目依赖管理与构建工具](#一maven项目依赖管理与构建工具)
  - [1. 核心概念](#1-核心概念)
  - [2. 实际场景拓展](#2-实际场景拓展)
  - [3. 深度避坑指南](#3-深度避坑指南)
- [二、HTTP协议：前后端通信的"语言"](#二http协议前后端通信的语言)
  - [1. 核心概念](#1-核心概念-1)
  - [2. 实际场景拓展](#2-实际场景拓展-1)
  - [3. 深度避坑指南](#3-深度避坑指南-1)
- [三、Spring IOC与DI：Spring的核心灵魂](#三spring-ioc与dispring的核心灵魂)
  - [1. 核心概念](#1-核心概念-2)
  - [2. 实际场景拓展](#2-实际场景拓展-2)
  - [3. 深度避坑指南](#3-深度避坑指南-2)
- [四、MySQL：关系型数据库核心](#四mysql关系型数据库核心)
  - [1. 核心概念](#1-核心概念-3)
  - [2. 实际场景拓展](#2-实际场景拓展-3)
  - [3. 深度避坑指南](#3-深度避坑指南-3)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、Maven：项目依赖管理与构建工具

#### 1. 核心概念

##### （1）依赖传递规则

Maven 依赖传递遵循三大原则，优先级从高到低：

1. **声明优先原则**：在 pom.xml 中，先声明的依赖版本优先级更高（同层级依赖）。
2. **就近原则**：直接依赖（项目直接声明）优先级高于传递依赖；传递依赖中，路径越短优先级越高。
3. **路径短优先原则**：传递依赖中，依赖路径长度越短，版本优先级越高。

##### （2）聚合工程与继承

- **聚合工程**：多模块项目（如`hmdp-parent`包含`hmdp-common`、`hmdp-service`、`hmdp-web`），通过父 pom 的`<modules>`标签管理子模块。

```xml
<!-- 父pom.xml -->
<packaging>pom</packaging>
<modules>
  <module>hmdp-common</module>
  <module>hmdp-service</module>
  <module>hmdp-web</module>
</modules>
```

- **继承**：子模块通过`<parent>`标签继承父 pom 的依赖、插件配置，减少重复配置。

##### （3）版本锁定（dependencyManagement）

父 pom 中使用`<dependencyManagement>`声明依赖版本，子模块无需指定版本：

```xml
<!-- 父pom.xml -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis</artifactId>
      <version>3.5.13</version>
    </dependency>
  </dependencies>
</dependencyManagement>

<!-- 子模块pom.xml（无需写version） -->
<dependencies>
  <dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
  </dependency>
</dependencies>
```

---

#### 2. 实际场景拓展

##### （1）私服配置（企业开发必备）

企业内部搭建 Maven 私服（如 Nexus），存储内部依赖、缓存中央仓库依赖：

```xml
<!-- settings.xml -->
<servers>
  <server>
    <id>company-nexus</id>
    <username>nexus账号</username>
    <password>nexus密码</password>
  </server>
</servers>
<mirrors>
  <mirror>
    <id>company-nexus</id>
    <name>企业私服</name>
    <url>http://nexus.company.com/repository/public/</url>
    <mirrorOf>central</mirrorOf>
  </mirror>
</mirrors>
```

##### （2）自定义打包插件（SpringBoot 可执行 jar）

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>2.7.15</version>
      <executions>
        <execution>
          <goals>
            <goal>repackage</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

---

#### 3. 深度避坑指南

| 坑点描述                            | 原因分析                                                     | 解决方案                                                     |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 依赖冲突导致 ClassNotFoundException | 不同依赖传递引入同一 jar 包的不同版本，高版本删除了低版本的类 | 1. 用`mvn dependency:tree`命令分析依赖树；2. 用`<exclusions>`排除低版本依赖；3. 在`<dependencyManagement>`中锁定统一版本 |
| 本地仓库 jar 包损坏，下载失败       | 网络中断、磁盘空间不足导致 jar 包下载不完整                  | 1. 删除`C:\Users\用户名\.m2\repository`中对应 jar 包的目录；2. 执行`mvn clean install -U`强制更新 |
| 私服依赖无法下载                    | 私服地址错误、账号密码错误、无权限访问                       | 1. 检查 settings.xml 中私服 url、账号密码；2. 联系私服管理员开通权限 |
| 快照版依赖更新不及时                | 快照版（SNAPSHOT）默认隔 24 小时更新，本地缓存未刷新         | 1. 执行`mvn clean install -U`强制更新；2. 开发环境用快照版，生产环境用稳定版（RELEASE） |

---

### 二、HTTP协议：前后端通信的"语言"

#### 1. 核心概念

##### （1）RESTful API 设计规范（企业主流）

- **资源命名**：用名词复数表示资源（如`/emps`表示员工列表，而非`/getEmps`）。
- **动作对应请求方法**：查询（GET）、新增（POST）、全量更新（PUT）、部分更新（PATCH）、删除（DELETE）。
- **状态码规范**：查询成功（200）、创建成功（201）、参数错误（400）、未授权（401）、权限不足（403）、资源不存在（404）、服务器错误（500）。
- **分页/筛选参数**：分页（`?page=1&size=10`）、筛选（`?name=张三&gender=1`）、排序（`?sort=createTime,desc`）。

##### （2）HTTPS 与 HTTP 的区别

| 对比项 | HTTP | HTTPS |
| ------ | ---- | ---- |
| 传输方式 | 明文传输 | SSL/TLS 加密传输 |
| 端口 | 80 | 443 |
| 安全性 | 存在窃听、篡改风险 | 数据加密，验证服务器身份 |
| 使用场景 | 开发测试环境 | 生产环境强制使用 |

##### （3）常用请求头详解

- `Authorization`：携带身份认证信息（如 JWT Token：`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）。
- `Content-Type`：指定请求体数据格式（`application/json`、`multipart/form-data`）。
- `Cookie`：携带客户端 Cookie（如 SessionID），用于会话保持。
- `Cache-Control`：控制缓存（`no-cache`：不使用缓存，`max-age=3600`：缓存 1 小时）。
- `Origin`：跨域请求时，标识请求来源（协议 + 域名 + 端口），用于服务器校验。

---

#### 2. 实际场景拓展

##### （1）大文件上传（分块上传）

大文件（如 100MB）直接上传易超时，采用分块上传：

1. 前端将文件分割为多个小块（如 5MB / 块），携带`chunkIndex`（块索引）、`totalChunks`（总块数）、`fileName`（文件名）。
2. 后端接收小块，存储临时目录，所有块上传完成后合并为完整文件。
3. 响应状态：上传中（200）、合并成功（201）。

##### （2）预检请求（OPTIONS）处理

跨域请求中，非简单请求（如 POST+JSON、带自定义请求头）会先发送 OPTIONS 预检请求：

```java
@CrossOrigin(origins = "http://localhost:8080", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
@RestController
public class EmpController {
  @RequestMapping(value = "/emp", method = RequestMethod.OPTIONS)
  public ResponseEntity<Void> handleOptions() {
    return ResponseEntity.ok().build();
  }
}
```

---

#### 3. 深度避坑指南

| 坑点描述                                          | 原因分析                                                     | 解决方案                                                     |
| ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 跨域请求提示 "Access-Control-Allow-Origin" 缺失   | 浏览器同源策略限制，服务器未配置跨域允许                     | 1. SpringBoot 添加`@CrossOrigin`注解；2. 全局配置 CORS（实现 WebMvcConfigurer）；3. 网关层（如 Nginx）配置跨域 |
| 大文件上传超时                                    | 文件过大，服务器默认超时时间过短（如 SpringBoot 默认 30 秒） | 1. 前端分块上传；2. 后端配置超时时间（`spring.servlet.multipart.max-request-size=100MB`）；3. 配置 Tomcat 超时（`server.tomcat.connection-timeout=600000`） |
| Token 放在 URL 参数中导致泄露                     | URL 会被浏览器记录、服务器日志存储，存在安全风险             | 1. Token 必须放在请求头`Authorization`中；2. 生产环境使用 HTTPS 加密传输 |
| 响应状态码使用错误（如新增成功返回 200 而非 201） | 状态码语义不清晰，前端无法正确判断业务状态                   | 严格遵循 RESTful 规范：新增成功（201）、删除成功（204）、参数错误（400）、未登录（401） |
| 中文乱码（响应体中文变为？？？）                  | 响应头未指定字符编码，默认 ISO-8859-1（不支持中文）          | 1. SpringBoot 默认配置`spring.http.encoding.charset=UTF-8`，无需手动处理；2. 手动设置响应头`response.setContentType("application/json;charset=UTF-8")` |

---

### 三、Spring IOC与DI：Spring的核心灵魂

#### 1. 核心概念

##### （1）@Autowired 与 @Resource 的区别

| 特性         | @Autowired                                 | @Resource                                 |
| ------------ | ------------------------------------------ | ----------------------------------------- |
| 来源         | Spring 注解                                | JDK 原生注解（javax.annotation.Resource） |
| 注入方式     | 先按类型（byType），再按名称（byName）     | 先按名称（byName），再按类型（byType）    |
| 依赖是否必须 | 默认必须（可通过`required=false`设置可选） | 默认必须                                  |
| 支持属性     | 支持`@Qualifier`指定名称                   | 支持`name`属性指定名称                    |

##### （2）SpringBoot 自动配置原理

SpringBoot 核心是 "自动配置"，通过`@SpringBootApplication`注解触发：

1. `@ComponentScan`：扫描当前包及子包的 Bean（@Controller、@Service 等）。
2. `@EnableAutoConfiguration`：启用自动配置，加载`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件中的自动配置类。
3. 自动配置类通过`@Conditional`注解判断是否生效（如`@ConditionalOnClass`：存在指定类才生效，`@ConditionalOnMissingBean`：不存在指定 Bean 才生效）。

##### （3）Bean 的初始化顺序控制

- `@DependsOn("beanName")`：强制当前 Bean 在指定 Bean 之后初始化。
- `@Order(value=1)`：指定 Bean 的加载顺序（值越小，优先级越高），仅对同一类型 Bean 生效。

---

#### 2. 实际场景拓展

##### （1）循环依赖解决方案

循环依赖（A 依赖 B，B 依赖 A）是 Spring 开发常见问题：

1. **单例 Bean 默认支持**：Spring 通过三级缓存（singletonFactories、earlySingletonObjects、singletonObjects）解决单例 Bean 的循环依赖。

2. **构造器注入循环依赖**：构造器注入不支持默认循环依赖，需配合`@Lazy`（延迟初始化）：

```java
@Service
public class AService {
  private final BService bService;
  @Autowired
  public AService(@Lazy BService bService) {
    this.bService = bService;
  }
}
```

3. **多例 Bean 循环依赖**：多例 Bean（@Scope ("prototype")）不支持循环依赖，需改为单例或重构代码解除依赖。

##### （2）静态成员变量无法注入

问题：静态成员变量（static）用`@Autowired`注入为 null。

- **原因**：Spring 注入依赖是在对象实例化后，静态变量属于类，不属于实例。

- **解决方案**：注入到非静态 setter 方法，或用`@PostConstruct`手动赋值：

```java
@Service
public class UserService {
  private static UserDao userDao;

  @Autowired
  private UserDao tempUserDao;

  @PostConstruct
  public void init() {
    userDao = tempUserDao;
  }
}
```

---

#### 3. 深度避坑指南

| 坑点描述                                                 | 原因分析                                                     | 解决方案                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Bean 注入时报 NoSuchBeanDefinitionException              | 1. Bean 未加注解（@Service/@Repository 等）；2. Bean 不在 Spring 扫描范围内；3. 多例 Bean 注入单例 Bean 时未正确配置 | 1. 为 Bean 添加正确的层级注解；2. 调整`@SpringBootApplication(scanBasePackages = "com.itheima")`扩大扫描范围；3. 多例 Bean 注入用`@Autowired + @Lazy` |
| 循环依赖导致 Bean 创建失败（CircularReferenceException） | 构造器注入的单例 Bean 循环依赖，或多例 Bean 循环依赖         | 1. 构造器注入改为 Setter 注入；2. 构造器注入配合`@Lazy`；3. 多例 Bean 改为单例，或重构代码拆分依赖 |
| 单例 Bean 的成员变量是可变的，导致线程安全问题           | 单例 Bean 是线程共享的，可变成员变量会被多线程并发修改       | 1. 单例 Bean 中避免定义可变成员变量；2. 用 ThreadLocal 存储线程私有数据；3. 可变状态抽离为独立的多例 Bean |
| @Autowired 注入的 Bean 是 null                           | 1. 注入的类不是 Spring Bean（如手动 new 的对象）；2. 静态成员变量注入；3. Bean 的初始化顺序问题 | 1. 确保注入的类被 Spring 管理（加注解或配置 Bean）；2. 避免静态成员变量注入，用 @PostConstruct 赋值；3. 用`@DependsOn`指定初始化顺序 |
| Bean 的 @PostConstruct 方法未执行                        | 1. 类未被 Spring 管理；2. 方法不是无参非静态方法；3. 方法抛出异常导致初始化失败 | 1. 为类添加 Spring 注解（@Component 等）；2. 确保 @PostConstruct 方法是无参、非静态、返回 void；3. 捕获方法内异常，打印日志排查 |

---

### 四、MySQL：关系型数据库核心

#### 1. 核心概念

##### （1）索引类型与原理

- **聚簇索引**：索引与数据存储在一起（如 InnoDB 的主键索引），查询效率高，一张表只有一个聚簇索引。
- **非聚簇索引**：索引与数据分离，索引存储主键 ID，查询时需通过主键 ID 回表查询数据（二次查询）。
- **联合索引**：多个字段组成的索引（如`idx_name_gender`），遵循 "最左前缀原则"（查询条件需包含索引的左前缀字段才会命中索引）。

##### （2）事务隔离级别

MySQL 支持 4 种事务隔离级别，默认是**可重复读（Repeatable Read）**：

| 隔离级别                     | 脏读 | 不可重复读 | 幻读 | 性能 |
| ---------------------------- | ---- | ---------- | ---- | ---- |
| 读未提交（Read Uncommitted） | 允许 | 允许       | 允许 | 最高 |
| 读已提交（Read Committed）   | 禁止 | 允许       | 允许 | 中   |
| 可重复读（Repeatable Read）  | 禁止 | 禁止       | 禁止 | 中   |
| 串行化（Serializable）       | 禁止 | 禁止       | 禁止 | 最低 |

##### （3）锁机制

- **行锁**：锁定单行数据（如 InnoDB 的行级锁），并发性能高，仅在修改数据时触发（WHERE 条件命中索引才会行锁，否则表锁）。
- **表锁**：锁定整张表（如 MyISAM 的表锁、InnoDB 无索引时的锁），并发性能低，适用于批量操作（如`ALTER TABLE`）。

---

#### 2. 实际场景拓展

##### （1）慢查询优化

1. 用`EXPLAIN`分析 SQL 执行计划，关注`type`（索引类型，如`ref`、`range`、`ALL`（全表扫描，需优化））、`key`（命中的索引）、`rows`（扫描行数）。
2. 优化方向：
   - 避免全表扫描：为查询字段创建索引。
   - 避免索引失效：不使用函数操作索引字段（如`WHERE DATE(createTime) = '2024-05-20'`改为`WHERE createTime BETWEEN '2024-05-20 00:00:00' AND '2024-05-20 23:59:59'`）。
   - 拆分复杂 SQL：将多表关联的复杂 SQL 拆分为多个简单 SQL，减少锁竞争。

##### （2）分库分表（海量数据存储）

当单表数据量超过 1000 万条，查询性能急剧下降，需分库分表：

- **水平分表**：同一表的数据按规则拆分到多个表（如`user_1`、`user_2`），拆分规则：按用户 ID 取模（`user_id % 2`）、按时间范围（如按月份拆分订单表）。
- **垂直分表**：将一张表的字段拆分到多个表（如`user_base`（基础信息）、`user_extend`（扩展信息）），适用于字段过多、大字段（如 text）的表。

---

#### 3. 深度避坑指南

| 坑点描述                                       | 原因分析                                                     | 解决方案                                                     |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 索引失效，SQL 执行全表扫描                     | 1. 函数操作索引字段（如`SUBSTR(phone,1,3) = '138'`）；2. 模糊查询前缀带 %（如`name LIKE '%张三'`）；3. 联合索引不满足最左前缀原则；4. 索引字段类型不匹配 | 1. 避免函数操作索引字段，调整查询条件；2. 模糊查询改为后缀 %（`name LIKE '张三%'`）；3. 联合索引查询包含左前缀字段；4. 确保查询条件类型与索引字段一致 |
| 事务隔离级别过高导致性能下降                   | 串行化隔离级别会强制事务串行执行，并发能力极差               | 生产环境使用默认的 "可重复读" 隔离级别，无需手动调整；特殊场景（如金融转账）可临时提升为串行化 |
| 主键用 UUID 导致性能下降                       | UUID 是随机字符串，聚簇索引存储时会频繁调整顺序，产生碎片    | 1. 用自增主键（`bigint + auto_increment`）；2. 用雪花算法（Snowflake）生成有序 ID，兼顾分布式环境 |

---

## ❓ 问答

### Q1：Maven 依赖传递遵循哪些原则？如何解决依赖冲突问题？

**答**：
- **依赖传递原则**：声明优先原则、就近原则、路径短优先原则
- **解决依赖冲突**：
  1. 用`mvn dependency:tree`命令分析依赖树，找到冲突版本
  2. 用`<exclusions>`排除低版本依赖
  3. 在`<dependencyManagement>`中锁定统一版本
- **解析**：依赖冲突是 Maven 开发常见问题，掌握依赖传递原则和冲突解决方法，能有效避免 ClassNotFoundException。

---

### Q2：RESTful API 设计规范中，请求方法与业务操作的对应关系是什么？常用的 HTTP 状态码有哪些？

**答**：
- **请求方法对应关系**：
  - GET：查询数据
  - POST：新增数据
  - PUT：全量更新数据
  - PATCH：部分更新数据
  - DELETE：删除数据
- **常用状态码**：
  - 200：查询成功
  - 201：创建成功
  - 400：参数错误
  - 401：未授权
  - 403：权限不足
  - 404：资源不存在
  - 500：服务器错误
- **解析**：RESTful API 是企业主流的接口设计规范，掌握请求方法和状态码的使用，能设计出清晰、规范的接口。

---

### Q3：@Autowired 和 @Resource 注解有什么区别？SpringBoot 自动配置的原理是什么？

**答**：
- **@Autowired 与 @Resource 区别**：
  - 来源：@Autowired 是 Spring 注解，@Resource 是 JDK 原生注解
  - 注入方式：@Autowired 先按类型再按名称，@Resource 先按名称再按类型
  - 依赖是否必须：@Autowired 默认必须（可通过`required=false`设置可选），@Resource 默认必须
- **SpringBoot 自动配置原理**：
  1. `@ComponentScan`：扫描当前包及子包的 Bean
  2. `@EnableAutoConfiguration`：启用自动配置，加载自动配置类
  3. 自动配置类通过`@Conditional`注解判断是否生效
- **解析**：理解注解区别和自动配置原理，能更好地使用 SpringBoot 框架，解决 Bean 注入和配置问题。

---

### Q4：MySQL 的索引类型有哪些？联合索引的"最左前缀原则"是什么？

**答**：
- **索引类型**：
  - 聚簇索引：索引与数据存储在一起（如 InnoDB 的主键索引）
  - 非聚簇索引：索引与数据分离，索引存储主键 ID
  - 联合索引：多个字段组成的索引
- **最左前缀原则**：查询条件需包含联合索引的左前缀字段才会命中索引（如联合索引`idx_name_gender`，查询条件必须包含`name`字段才能命中索引）
- **解析**：索引是提升查询性能的关键，掌握索引类型和最左前缀原则，能有效避免索引失效和全表扫描。

---

### Q5：Spring 循环依赖的解决方案有哪些？静态成员变量为什么无法用 @Autowired 注入？

**答**：
- **循环依赖解决方案**：
  1. 单例 Bean 默认支持：Spring 通过三级缓存解决单例 Bean 的循环依赖
  2. 构造器注入循环依赖：配合`@Lazy`（延迟初始化）
  3. 多例 Bean 循环依赖：改为单例或重构代码解除依赖
- **静态成员变量无法注入原因**：Spring 注入依赖是在对象实例化后，静态变量属于类，不属于实例
- **解决方案**：注入到非静态 setter 方法，或用`@PostConstruct`手动赋值
- **解析**：循环依赖和静态成员变量注入是 Spring 开发常见问题，掌握解决方案能有效避免 Bean 创建失败和注入失败。

---

> **📚 学习建议**：本节内容是后端开发的基石，重点掌握 Maven 依赖管理、HTTP 协议、Spring IOC/DI、MySQL 数据库核心知识，这些是构建完整后端知识体系的关键。
