# 【JavaWeb｜day17 Web后端基础 Maven、HTTP协议、Spring IOC、DI、MySQL、JDBC、Mybatis】



[黑马官方笔记📒地址](https://heuqqdmbyk.feishu.cn/wiki/FxTdw2K9mieDgAkhSqucg59Cn8f)

本期内容较多 对于小💡难度较大 合理安排时间 建议看官方笔记 本篇内容是挑出的重点内容以及一些补充。以下每个知识点都可以再展开深入了解 对于老💡来说。

 

## 一、Maven：项目依赖管理与构建工具

### 1. 核心概念深化

#### （1）依赖传递规则

Maven 依赖传递遵循三大原则，优先级从高到低：

1. **声明优先原则**：在 pom.xml 中，先声明的依赖版本优先级更高（同层级依赖）。
2. **就近原则**：直接依赖（项目直接声明）优先级高于传递依赖；传递依赖中，路径越短优先级越高（A→B→C，A→C，C 的版本以 A 直接声明的为准）。
3. **路径短优先原则**：传递依赖中，依赖路径长度越短，版本优先级越高（A→B→C1.0，A→D→E→C2.0，优先使用 C1.0）。

#### （2）聚合工程与继承

- 聚合工程

  ：多模块项目（如

  ```
  hmdp-parent
  ```

  包含

  ```
  hmdp-common
  ```

  、

  ```
  hmdp-service
  ```

  、

  ```
  hmdp-web
  ```

  ），通过父 pom 的

  ```
  <modules>
  ```

  标签管理子模块，执行父工程命令（如

  ```
  mvn clean package
  ```

  ）会同步执行所有子模块命令。

  xml

  ```xml
  <!-- 父pom.xml -->
  <packaging>pom</packaging>
  <modules>
    <module>hmdp-common</module>
    <module>hmdp-service</module>
    <module>hmdp-web</module>
  </modules>
  ```

  

- **继承**：子模块通过``标签继承父 pom 的依赖、插件配置，减少重复配置（如 SpringBoot 父工程`spring-boot-starter-parent`）。

#### （3）版本锁定（dependencyManagement）

父 pom 中使用``声明依赖版本，子模块无需指定版本，统一由父工程管理，避免版本混乱：

xml

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

### 2. 实际场景拓展

#### （1）私服配置（企业开发必备）

企业内部搭建 Maven 私服（如 Nexus），存储内部依赖、缓存中央仓库依赖，解决外网访问慢、内部组件共享问题：

- 配置私服地址（settings.xml）：

  xml

  ```xml
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

  

#### （2）自定义打包插件（SpringBoot 可执行 jar）

SpringBoot 项目通过`spring-boot-maven-plugin`插件打包为可执行 jar，包含内置 Tomcat：

xml

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
            <goal>repackage</goal> <!-- 重打包为可执行jar -->
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

### 3. 深度避坑指南

| 坑点描述                            | 原因分析                                                     | 解决方案                                                     |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 依赖冲突导致 ClassNotFoundException | 不同依赖传递引入同一 jar 包的不同版本，高版本删除了低版本的类 | 1. 用`mvn dependency:tree`命令分析依赖树，找到冲突版本；2. 用``排除低版本依赖；3. 在``中锁定统一版本 |
| 本地仓库 jar 包损坏，下载失败       | 网络中断、磁盘空间不足导致 jar 包下载不完整                  | 1. 删除`C:\Users\用户名\.m2\repository`中对应 jar 包的目录；2. 执行`mvn clean install -U`（-U 强制更新快照） |
| 私服依赖无法下载                    | 私服地址错误、账号密码错误、无权限访问                       | 1. 检查 settings.xml 中私服 url、账号密码；2. 联系私服管理员开通权限；3. 临时关闭私服镜像，直接从中央仓库下载（测试用） |
| 快照版依赖更新不及时                | 快照版（SNAPSHOT）默认隔 24 小时更新，本地缓存未刷新         | 1. 执行`mvn clean install -U`强制更新；2. 开发环境用快照版，生产环境用稳定版（RELEASE） |
| 插件版本冲突导致构建失败            | 不同插件依赖同一工具类的不同版本（如 maven-compiler-plugin 与其他插件） | 1. 显式声明插件版本；2. 在``的``中锁定插件版本               |

## 二、HTTP 协议：前后端通信的 “语言”

### 1. 核心概念深化

#### （1）RESTful API 设计规范（企业主流）

- 资源命名：用名词复数表示资源（如`/emps`表示员工列表，而非`/getEmps`）。
- 动作对应请求方法：查询（GET）、新增（POST）、全量更新（PUT）、部分更新（PATCH）、删除（DELETE）。
- 状态码规范：查询成功（200）、创建成功（201）、参数错误（400）、未授权（401）、权限不足（403）、资源不存在（404）、服务器错误（500）。
- 分页 / 筛选参数：分页（`?page=1&size=10`）、筛选（`?name=张三&gender=1`）、排序（`?sort=createTime,desc`）。

#### （2）HTTPS 与 HTTP 的区别

- HTTP：明文传输，端口 80，无加密，存在窃听、篡改风险。
- HTTPS：HTTP+SSL/TLS 加密，端口 443，数据传输加密，验证服务器身份，企业生产环境强制使用。

#### （3）常用请求头详解

- `Authorization`：携带身份认证信息（如 JWT Token：`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）。
- `Content-Type`：指定请求体数据格式（`application/json`、`multipart/form-data`）。
- `Cookie`：携带客户端 Cookie（如 SessionID），用于会话保持。
- `Cache-Control`：控制缓存（`no-cache`：不使用缓存，`max-age=3600`：缓存 1 小时）。
- `Origin`：跨域请求时，标识请求来源（协议 + 域名 + 端口），用于服务器校验。

### 2. 实际场景拓展

#### （1）大文件上传（分块上传）

大文件（如 100MB）直接上传易超时，采用分块上传：

1. 前端将文件分割为多个小块（如 5MB / 块），携带`chunkIndex`（块索引）、`totalChunks`（总块数）、`fileName`（文件名）。
2. 后端接收小块，存储临时目录，所有块上传完成后合并为完整文件。
3. 响应状态：上传中（200）、合并成功（201）。

#### （2）预检请求（OPTIONS）处理

跨域请求中，非简单请求（如 POST+JSON、带自定义请求头）会先发送 OPTIONS 预检请求，验证服务器是否允许跨域：

- 后端需响应 OPTIONS 请求，返回允许的请求方法、请求头：

  java

  ```java
  @CrossOrigin(origins = "http://localhost:8080", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
  @RestController
  public class EmpController {
    // 处理OPTIONS请求
    @RequestMapping(value = "/emp", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
      return ResponseEntity.ok().build();
    }
  }
  ```

  

### 3. 深度避坑指南

| 坑点描述                                          | 原因分析                                                     | 解决方案                                                     |
| ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 跨域请求提示 “Access-Control-Allow-Origin” 缺失   | 浏览器同源策略限制，服务器未配置跨域允许                     | 1. SpringBoot 添加`@CrossOrigin`注解（单个控制器 / 方法）；2. 全局配置 CORS（实现 WebMvcConfigurer）；3. 网关层（如 Nginx）配置跨域 |
| 大文件上传超时                                    | 文件过大，服务器默认超时时间过短（如 SpringBoot 默认 30 秒） | 1. 前端分块上传；2. 后端配置超时时间（`spring.servlet.multipart.max-request-size=100MB`、`spring.servlet.multipart.max-file-size=100MB`）；3. 配置 Tomcat 超时（`server.tomcat.connection-timeout=600000`） |
| Token 放在 URL 参数中导致泄露                     | URL 会被浏览器记录、服务器日志存储，存在安全风险             | 1. Token 必须放在请求头`Authorization`中；2. 生产环境使用 HTTPS 加密传输 |
| 响应状态码使用错误（如新增成功返回 200 而非 201） | 状态码语义不清晰，前端无法正确判断业务状态                   | 严格遵循 RESTful 规范：新增成功（201）、删除成功（204）、参数错误（400）、未登录（401） |
| 中文乱码（响应体中文变为？？？）                  | 响应头未指定字符编码，默认 ISO-8859-1（不支持中文）          | 1. SpringBoot 默认配置`spring.http.encoding.charset=UTF-8`，无需手动处理；2. 手动设置响应头`response.setContentType("application/json;charset=UTF-8")` |

## 三、Spring IOC 与 DI：Spring 的核心灵魂

### 1. 核心概念深化

#### （1）@Autowired 与 @Resource 的区别

| 特性         | @Autowired                                 | @Resource                                 |
| ------------ | ------------------------------------------ | ----------------------------------------- |
| 来源         | Spring 注解                                | JDK 原生注解（javax.annotation.Resource） |
| 注入方式     | 先按类型（byType），再按名称（byName）     | 先按名称（byName），再按类型（byType）    |
| 依赖是否必须 | 默认必须（可通过`required=false`设置可选） | 默认必须                                  |
| 支持属性     | 支持`@Qualifier`指定名称                   | 支持`name`属性指定名称                    |

#### （2）SpringBoot 自动配置原理

SpringBoot 核心是 “自动配置”，通过`@SpringBootApplication`注解触发：

1. `@ComponentScan`：扫描当前包及子包的 Bean（@Controller、@Service 等）。
2. `@EnableAutoConfiguration`：启用自动配置，加载`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件中的自动配置类（如`DataSourceAutoConfiguration`、`MybatisAutoConfiguration`）。
3. 自动配置类通过`@Conditional`注解判断是否生效（如`@ConditionalOnClass`：存在指定类才生效，`@ConditionalOnMissingBean`：不存在指定 Bean 才生效）。

#### （3）Bean 的初始化顺序控制

- `@DependsOn("beanName")`：强制当前 Bean 在指定 Bean 之后初始化（如`@DependsOn("dataSource")`，确保数据源 Bean 先初始化）。
- `@Order(value=1)`：指定 Bean 的加载顺序（值越小，优先级越高），仅对同一类型 Bean 生效。

### 2. 实际场景拓展

#### （1）循环依赖解决方案

循环依赖（A 依赖 B，B 依赖 A）是 Spring 开发常见问题，解决方案：

1. **单例 Bean 默认支持**：Spring 通过三级缓存（singletonFactories、earlySingletonObjects、singletonObjects）解决单例 Bean 的循环依赖。

2. 构造器注入循环依赖

   ：构造器注入不支持默认循环依赖，需配合

   ```
   @Lazy
   ```

   （延迟初始化）：

   java

   ```java
   @Service
   public class AService {
     private final BService bService;
     // @Lazy延迟初始化BService，打破循环依赖
     @Autowired
     public AService(@Lazy BService bService) {
       this.bService = bService;
     }
   }
   ```

   

3. **多例 Bean 循环依赖**：多例 Bean（@Scope ("prototype")）不支持循环依赖，需改为单例或重构代码解除依赖。

#### （2）静态成员变量无法注入

问题：静态成员变量（static）用`@Autowired`注入为 null：

- 原因：Spring 注入依赖是在对象实例化后，静态变量属于类，不属于实例。

- 解决方案：注入到非静态 setter 方法，或用

  ```
  @PostConstruct
  ```

  手动赋值：

  java

  

  运行

  

  

  

  

  ```java
  @Service
  public class UserService {
    private static UserDao userDao;
  
    @Autowired
    private UserDao tempUserDao;
  
    // 实例化后执行，将非静态变量赋值给静态变量
    @PostConstruct
    public void init() {
      userDao = tempUserDao;
    }
  }
  ```

  

### 3. 深度避坑指南

| 坑点描述                                                 | 原因分析                                                     | 解决方案                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Bean 注入时报 NoSuchBeanDefinitionException              | 1. Bean 未加注解（@Service/@Repository 等）；2. Bean 不在 Spring 扫描范围内；3. 多例 Bean 注入单例 Bean 时未正确配置 | 1. 为 Bean 添加正确的层级注解；2. 调整`@SpringBootApplication(scanBasePackages = "com.itheima")`扩大扫描范围；3. 多例 Bean 注入用`@Autowired + @Lazy` |
| 循环依赖导致 Bean 创建失败（CircularReferenceException） | 构造器注入的单例 Bean 循环依赖，或多例 Bean 循环依赖         | 1. 构造器注入改为 Setter 注入；2. 构造器注入配合`@Lazy`；3. 多例 Bean 改为单例，或重构代码拆分依赖 |
| 单例 Bean 的成员变量是可变的，导致线程安全问题           | 单例 Bean 是线程共享的，可变成员变量会被多线程并发修改       | 1. 单例 Bean 中避免定义可变成员变量；2. 用 ThreadLocal 存储线程私有数据；3. 可变状态抽离为独立的多例 Bean |
| @Autowired 注入的 Bean 是 null                           | 1. 注入的类不是 Spring Bean（如手动 new 的对象）；2. 静态成员变量注入；3. Bean 的初始化顺序问题 | 1. 确保注入的类被 Spring 管理（加注解或配置 Bean）；2. 避免静态成员变量注入，用 @PostConstruct 赋值；3. 用`@DependsOn`指定初始化顺序 |
| Bean 的 @PostConstruct 方法未执行                        | 1. 类未被 Spring 管理；2. 方法不是无参非静态方法；3. 方法抛出异常导致初始化失败 | 1. 为类添加 Spring 注解（@Component 等）；2. 确保 @PostConstruct 方法是无参、非静态、返回 void；3. 捕获方法内异常，打印日志排查 |

## 四、MySQL：关系型数据库核心

### 1. 核心概念深化

#### （1）索引类型与原理

- **聚簇索引**：索引与数据存储在一起（如 InnoDB 的主键索引），查询效率高，一张表只有一个聚簇索引。
- **非聚簇索引**：索引与数据分离，索引存储主键 ID，查询时需通过主键 ID 回表查询数据（二次查询）。
- **联合索引**：多个字段组成的索引（如`idx_name_gender`），遵循 “最左前缀原则”（查询条件需包含索引的左前缀字段才会命中索引）。

#### （2）事务隔离级别

MySQL 支持 4 种事务隔离级别，默认是**可重复读（Repeatable Read）**：

| 隔离级别                     | 脏读（读取未提交数据） | 不可重复读（同一事务内重复查询结果不一致） | 幻读（同一事务内新增数据导致查询结果变化） | 性能 |
| ---------------------------- | ---------------------- | ------------------------------------------ | ------------------------------------------ | ---- |
| 读未提交（Read Uncommitted） | 允许                   | 允许                                       | 允许                                       | 最高 |
| 读已提交（Read Committed）   | 禁止                   | 允许                                       | 允许                                       | 中   |
| 可重复读（Repeatable Read）  | 禁止                   | 禁止                                       | 禁止（InnoDB 通过 MVCC 实现）              | 中   |
| 串行化（Serializable）       | 禁止                   | 禁止                                       | 禁止                                       | 最低 |

#### （3）锁机制

- **行锁**：锁定单行数据（如 InnoDB 的行级锁），并发性能高，仅在修改数据时触发（WHERE 条件命中索引才会行锁，否则表锁）。
- **表锁**：锁定整张表（如 MyISAM 的表锁、InnoDB 无索引时的锁），并发性能低，适用于批量操作（如`ALTER TABLE`）。

### 2. 实际场景拓展

#### （1）慢查询优化

1. 用`EXPLAIN`分析 SQL 执行计划，关注`type`（索引类型，如`ref`、`range`、`ALL`（全表扫描，需优化））、`key`（命中的索引）、`rows`（扫描行数）。
2. 优化方向：
   - 避免全表扫描：为查询字段创建索引。
   - 避免索引失效：不使用函数操作索引字段（如`WHERE DATE(createTime) = '2024-05-20'`改为`WHERE createTime BETWEEN '2024-05-20 00:00:00' AND '2024-05-20 23:59:59'`）。
   - 拆分复杂 SQL：将多表关联的复杂 SQL 拆分为多个简单 SQL，减少锁竞争。

#### （2）分库分表（海量数据存储）

当单表数据量超过 1000 万条，查询性能急剧下降，需分库分表：

- **水平分表**：同一表的数据按规则拆分到多个表（如`user_1`、`user_2`），拆分规则：按用户 ID 取模（`user_id % 2`）、按时间范围（如按月份拆分订单表）。
- **垂直分表**：将一张表的字段拆分到多个表（如`user_base`（基础信息）、`user_extend`（扩展信息）），适用于字段过多、大字段（如 text）的表。

### 3. 深度避坑指南

| 坑点描述                                       | 原因分析                                                     | 解决方案                                                     |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 索引失效，SQL 执行全表扫描                     | 1. 函数操作索引字段（如`SUBSTR(phone,1,3) = '138'`）；2. 模糊查询前缀带 %（如`name LIKE '%张三'`）；3. 联合索引不满足最左前缀原则；4. 索引字段类型不匹配（如字符串字段用数字查询：`phone = 13800138000`） | 1. 避免函数操作索引字段，调整查询条件；2. 模糊查询改为后缀 %（`name LIKE '张三%'`）；3. 联合索引查询包含左前缀字段；4. 确保查询条件类型与索引字段一致 |
| 事务隔离级别过高导致性能下降                   | 串行化隔离级别会强制事务串行执行，并发能力极差               | 生产环境使用默认的 “可重复读” 隔离级别，无需手动调整；特殊场景（如金融转账）可临时提升为串行化 |
| 主键用 UUID 导致性能下降                       | UUID 是随机字符串，聚簇索引存储时会频繁调整顺序，产生碎片    | 1. 用自增主键（`bigint + auto_increment`）；2. 用雪花算法（Snowflake）生成有序 ID，兼顾分布式环境 |
| 大字段（text）存储导致查询缓慢                 | text 字段存储大量数据，查询时会占用过多 IO                   | 1. 垂直分表，将大字段拆分到独立表；2. 非必要不查询大字段（如`SELECT id, name FROM user`而非`SELECT *`）；3. 大文件（如图片、文档）存储到 OSS，数据库仅存 URL |
| 幻读问题（同一事务内新增数据导致查询结果变化） | 低隔离级别（读已提交）下，同一事务内重复查询可能出现新增的数据 | 1. 升级隔离级别为 “可重复读”（InnoDB 默认解决幻读）；2. 用`SELECT ... FOR UPDATE`加行锁，防止其他事务新增数据 |
| 批量插入数据效率低                             | 单条 INSERT 循环执行，频繁与数据库交互                       | 1. 用批量 INSERT（`INSERT INTO user (name,phone) VALUES (?,?), (?,?), ...`）；2. 关闭自动提交事务，批量插入后手动提交；3. 调整 MySQL 参数（`max_allowed_packet`）支持大 SQL |

## 五、JDBC：Java 操作数据库的原生方式

### 1. 核心概念深化

#### （1）数据库连接池原理

- 连接池是预先创建一定数量的数据库连接，存储在池中，应用程序按需获取、归还，避免频繁创建 / 关闭连接（重量级操作）。
- 主流连接池：HikariCP（SpringBoot 默认，性能最优）、C3P0、Druid（阿里开源，支持监控）。
- 核心参数（HikariCP）：
  - `maximum-pool-size`：最大连接数（默认 10，根据 CPU 核心数调整，如 8 核 CPU 设为 20）。
  - `connection-timeout`：连接超时时间（默认 30 秒）。
  - `idle-timeout`：连接空闲超时时间（默认 600 秒，空闲过久的连接自动关闭）。

#### （2）JDBC 事务控制

JDBC 默认自动提交事务（`autoCommit=true`），每条 SQL 执行后自动提交，需手动控制事务：

```java
conn.setAutoCommit(false); // 关闭自动提交
try {
  // 执行增删改操作
  pstmt1.executeUpdate();
  pstmt2.executeUpdate();
  conn.commit(); // 事务提交
} catch (SQLException e) {
  conn.rollback(); // 事务回滚
} finally {
  conn.setAutoCommit(true); // 恢复自动提交
}
```

### 2. 实际场景拓展

#### （1）JDBC 批处理（批量新增 / 修改）

批量操作避免单条 SQL 循环执行，提升效率：

java

```java
public int batchAdd(List<User> userList) {
  String sql = "INSERT INTO user (name, phone) VALUES (?, ?)";
  try (Connection conn = dataSource.getConnection();
       PreparedStatement pstmt = conn.prepareStatement(sql)) {
    conn.setAutoCommit(false); // 关闭自动提交
    for (User user : userList) {
      pstmt.setString(1, user.getName());
      pstmt.setString(2, user.getPhone());
      pstmt.addBatch(); // 添加到批处理队列
    }
    int[] results = pstmt.executeBatch(); // 执行批处理，返回每条SQL的影响行数
    conn.commit();
    return results.length; // 返回成功执行的条数
  } catch (SQLException e) {
    e.printStackTrace();
    return 0;
  }
}
```

#### （2）HikariCP 连接池配置（SpringBoot）

SpringBoot 默认使用 HikariCP，配置`application.properties`：

properties

```properties
# 数据库连接信息
spring.datasource.url=jdbc:mysql://localhost:3306/hmdp?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456
# HikariCP配置
spring.datasource.hikari.maximum-pool-size=20 # 最大连接数
spring.datasource.hikari.connection-timeout=60000 # 连接超时时间（60秒）
spring.datasource.hikari.idle-timeout=600000 # 空闲超时时间（10分钟）
spring.datasource.hikari.max-lifetime=1800000 # 连接最大生命周期（30分钟）
```

### 3. 深度避坑指南

| 坑点描述                                        | 原因分析                                                     | 解决方案                                                     |
| ----------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 数据库连接泄露，连接池耗尽                      | 1. Connection/PreparedStatement/ResultSet 未关闭；2. 异常情况下未关闭资源 | 1. 用 try-with-resources 语法（自动关闭资源）；2. 手动关闭资源时，按 ResultSet→PreparedStatement→Connection 的顺序关闭，且用 try-catch 包裹；3. 连接池配置`leak-detection-threshold`（泄露检测阈值），打印泄露日志 |
| 批处理执行效率低                                | 1. 未关闭自动提交事务（每条 SQL 都提交）；2. 批处理条数过多（如 10 万条一次提交）；3. MySQL 未开启批处理优化 | 1. 批处理前关闭自动提交，执行后手动提交；2. 分批次提交（如每 1000 条提交一次）；3. 配置 JDBC URL：`rewriteBatchedStatements=true`（MySQL 批处理优化） |
| ResultSet 遍历时报 “Before start of result set” | 未调用`rs.next()`就获取字段值（ResultSet 默认指向第一条数据之前） | 遍历 ResultSet 前必须调用`rs.next()`，返回 true 表示有数据：`while (rs.next()) { String name = rs.getString("name"); }` |
| 连接池参数配置不当导致性能问题                  | 1. 最大连接数过大（超过数据库承载能力，导致数据库连接拥堵）；2. 最大连接数过小（并发请求时等待连接） | 1. 最大连接数 = CPU 核心数 ×2+1（如 8 核 CPU 设为 17）；2. 监控数据库连接状态（如 Druid 监控面板），根据实际并发调整；3. 配置连接超时重试机制 |
| PreparedStatement 的 set 参数索引错误           | 参数索引从 1 开始，而非 0，错误使用`setString(0, "张三")`    | 确保参数索引与 SQL 中`?`的顺序一致，从 1 开始计数：`SQL: INSERT INTO user (name,phone) VALUES (?,?)` → `setString(1, "张三")`、`setString(2, "13800138000")` |

## 六、Mybatis：简化 JDBC 的 ORM 框架

### 1. 核心概念深化

#### （1）Mybatis 缓存机制

Mybatis 提供两级缓存，用于减少数据库查询次数，提升性能：

- 一级缓存（SqlSession 级别）

  ：默认开启，缓存存储在 SqlSession 中，SqlSession 关闭后缓存失效。

  - 命中条件：同一 SqlSession、同一 SQL、同一参数、同一隔离级别。
  - 失效场景：执行 INSERT/UPDATE/DELETE、调用`clearCache()`、SqlSession 关闭。

- 二级缓存（Mapper 级别）

  ：默认关闭，需在 Mapper 映射文件添加

  ```
  <cache/>
  ```

  开启，缓存存储在 Mapper 接口中，多个 SqlSession 共享。

  - 注意：缓存的对象需实现`Serializable`接口，避免序列化失败。

#### （2）ResultMap 复杂映射

当 Java 对象与数据库表字段名不一致，或存在关联关系（一对一、一对多），需用`resultMap`定义映射：

xml

```xml
<!-- 字段名与属性名不一致（数据库user_name，Java userName） -->
<resultMap id="UserMap" type="com.itheima.entity.User">
  <id column="id" property="id"/>
  <result column="user_name" property="userName"/>
  <result column="phone" property="phone"/>
</resultMap>

<!-- 一对一关联（用户→订单，一个用户对应一个订单） -->
<resultMap id="UserOrderMap" type="com.itheima.entity.User">
  <id column="id" property="id"/>
  <result column="name" property="name"/>
  <!-- association：一对一关联，javaType指定关联对象类型 -->
  <association property="order" javaType="com.itheima.entity.Order">
    <id column="order_id" property="id"/>
    <result column="order_no" property="orderNo"/>
  </association>
</resultMap>
```

#### （3）Mybatis-Plus（增强版 Mybatis）

Mybatis-Plus 是 Mybatis 的增强工具，简化 CRUD 操作，无需编写 XML：

- 核心特性：自动生成 CRUD 接口、条件构造器（QueryWrapper）、分页插件、逻辑删除。

- 示例（条件查询）：

  java

  运行

  ```java
  // 查询姓名包含"张"、性别为男的用户，分页查询第1页
  QueryWrapper<User> queryWrapper = new QueryWrapper<User>()
    .like("name", "张")
    .eq("gender", 1);
  Page<User> page = new Page<>(1, 10);
  Page<User> userPage = userMapper.selectPage(page, queryWrapper);
  ```

  

### 2. 实际场景拓展

#### （1）动态 SQL 批量删除

需求：根据多个 ID 批量删除用户，使用``标签：

- Mapper 接口：

  java

  运行

  ```java
  int batchDelete(@Param("ids") List<Long> ids);
  ```

  

- XML 映射文件：

  xml

  ```xml
  <delete id="batchDelete">
    DELETE FROM `user` WHERE id IN
    <foreach collection="ids" item="id" open="(" close=")" separator=",">
      #{id}
    </foreach>
  </delete>
  ```

- 调用：`userMapper.batchDelete(Arrays.asList(1L, 2L, 3L));`

#### （2）Mybatis 分页插件（PageHelper）

1. 引入依赖：

xml

```xml
<dependency>
  <groupId>com.github.pagehelper</groupId>
  <artifactId>pagehelper-spring-boot-starter</artifactId>
  <version>1.4.6</version>
</dependency>
```

1. 配置 application.properties：

properties

```properties
pagehelper.helper-dialect=mysql # 数据库方言
pagehelper.reasonable=true # 合理化分页（页码<=0查询第1页，页码>总页数查询最后一页）
```

1. 使用：

java

运行

```java
// 查询第1页，每页10条
PageHelper.startPage(1, 10);
List<User> userList = userMapper.list(null, 1); // 执行查询，自动拼接LIMIT
PageInfo<User> pageInfo = new PageInfo<>(userList); // 分页结果封装（总条数、总页数等）
```

### 3. 深度避坑指南

| 坑点描述                                                     | 原因分析                                                     | 解决方案                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Mybatis 缓存导致数据一致性问题（查询到旧数据）               | 一级缓存未失效，或二级缓存共享导致其他 SqlSession 查询到旧数据 | 1. 增删改操作后手动清除缓存（`sqlSession.clearCache()`）；2. 禁用二级缓存（不推荐，除非数据一致性要求极高）；3. 配置缓存过期时间（二级缓存） |
| 动态 SQL 中 foreach 遍历空集合，导致 SQL 语法错误（`IN ()`） | 集合为空时，``生成空的`IN ()`，不符合 SQL 语法               | 1. 调用前判断集合是否为空，为空则直接返回；2. 动态 SQL 中添加``判断：`...` |
| 字段名与属性名不一致，查询结果为 null                        | 数据库字段`user_name`，Java 属性`userName`，未配置映射       | 1. 开启驼峰命名自动转换（`mybatis.configuration.map-underscore-to-camel-case=true`）；2. 用`resultMap`手动配置映射；3. SQL 中用别名（`SELECT user_name AS userName FROM user`） |
| Mybatis-Plus 逻辑删除与物理删除混用，导致数据查询异常        | 逻辑删除（`@TableLogic`）会自动拼接`WHERE is_deleted=0`，物理删除后逻辑删除标记未更新 | 1. 统一使用逻辑删除或物理删除，不混用；2. 物理删除时，同步更新逻辑删除标记；3. 禁用逻辑删除（`mybatis-plus.global-config.db-config.logic-delete-enabled=false`） |
| 分页插件不生效，查询所有数据                                 | 1. 分页插件未引入或配置错误；2. `PageHelper.startPage()`调用顺序错误（需在查询前调用）；3. 数据库方言配置错误 | 1. 确认引入分页插件依赖，配置正确的方言（如 mysql）；2. 严格按照 “PageHelper.startPage () → 执行查询” 的顺序；3. 检查是否有自定义拦截器覆盖了分页插件 |
| `#{}与${}`混用导致 SQL 注入                                  | `#{}`是预编译（安全），`${}`是字符串替换（不安全），错误用`${}`拼接查询参数 | 1. 查询参数优先用`#{}`, ；2. 仅动态表名、排序字段等场景用`${}`，且需手动过滤非法值（如排序字段仅允许`createTime`、`id`）；3. 禁止用`${}`拼接用户输入的参数 |

------





### 面试题 1（基础原理 + 场景应用，难度：★★★☆☆）

Spring 中`@Autowired`和`@Resource`的核心区别是什么？如果出现单例 Bean 之间的循环依赖（A 依赖 B，B 依赖 A），Spring 是如何解决的？若改为构造器注入，循环依赖会出现什么问题，该如何解决？

### 面试题 2（规范 + 底层 + 工程化，难度：★★★★☆）

1. 请简述 RESTful API 的核心设计规范，并举例说明 “新增用户”“部分更新用户手机号”“删除用户” 对应的 API（含请求方法、URL、状态码）；2. HTTPS 相比 HTTP 的核心优势是什么，其加密流程（TLS 握手）的关键步骤有哪些？3. 前后端分离项目中，跨域问题的根源是什么？除了`@CrossOrigin`注解，还有哪些全局解决方案？

### 面试题 3（数据库核心 + 优化，难度：★★★★☆）

1. MySQL 中，联合索引`idx_name_gender_age`（姓名、性别、年龄）的 “最左前缀原则” 是什么？请列举 3 种导致该索引失效的 SQL 场景，并说明原因；2. 事务的 ACID 特性分别指什么？MySQL 默认的事务隔离级别是什么？该级别下如何解决 “幻读” 问题（结合 InnoDB 的底层机制说明）；3. 大表（1000 万条数据）查询缓慢，除了加索引，还有哪些优化方案？

### 面试题 4（框架底层 + 坑点，难度：★★★★☆）

1. Mybatis 的一级缓存和二级缓存的核心区别（存储范围、生效条件、失效场景）是什么？二级缓存开启后可能存在什么问题，如何避免？2. 请用 Mybatis 的动态 SQL 实现 “多条件查询用户”（姓名模糊匹配、性别可选、年龄范围可选）+“批量删除用户”（根据 ID 列表）的 XML 映射代码；3. SpringBoot 整合 Mybatis 时，`@Mapper`和`@MapperScan`的作用是什么？Mybatis 如何将 Mapper 接口动态生成代理对象？

### 面试题 5（高并发 + 综合调优，难度：★★★★★）

某高并发项目中，存在以下问题：1. 数据库连接池频繁耗尽，导致接口超时；2. 批量插入 10 万条用户数据时，效率极低（单条插入循环执行）；3. Mybatis 查询用户列表时，偶尔出现 “查询到旧数据” 的缓存一致性问题。请分别分析每个问题的根源，并给出具体的技术解决方案（需结合连接池参数配置、JDBC 批处理原理、Mybatis 缓存机制说明）。

------

### 参考答案 1

#### 1. `@Autowired`与`@Resource`的核心区别

| 对比维度   | @Autowired                                 | @Resource                                  |
| ---------- | ------------------------------------------ | ------------------------------------------ |
| 来源       | Spring 框架注解                            | JDK 原生注解（javax.annotation.Resource）  |
| 注入逻辑   | 先按类型（byType）匹配，再按名称（byName） | 先按名称（byName）匹配，再按类型（byType） |
| 依赖必要性 | 默认必须（可通过`required=false`设置可选） | 默认必须（无`required`属性）               |
| 支持特性   | 支持`@Qualifier`指定 Bean 名称             | 支持`name`属性指定 Bean 名称               |
| 适用场景   | Spring 生态项目（如 SpringBoot）           | 需兼容 JDK 原生规范的项目                  |

#### 2. 单例 Bean 循环依赖的解决机制

Spring 通过**三级缓存**解决单例 Bean 的循环依赖，核心流程：

1. 三级缓存定义：
   - 一级缓存（singletonObjects）：存储完全初始化完成的 Bean。
   - 二级缓存（earlySingletonObjects）：存储提前暴露的、未完成属性注入的 Bean 实例。
   - 三级缓存（singletonFactories）：存储 Bean 的工厂方法，用于生成 Bean 的早期实例。
2. 解决流程：
   - A Bean 实例化（未注入属性）后，将其工厂方法存入三级缓存。
   - A Bean 需要注入 B Bean，Spring 创建 B Bean 实例化后，同样存入三级缓存。
   - B Bean 需要注入 A Bean，Spring 从三级缓存中获取 A 的工厂方法，生成 A 的早期实例（未完成属性注入），存入二级缓存，删除三级缓存中的 A。
   - B Bean 完成属性注入和初始化，存入一级缓存，删除二级缓存中的 B。
   - A Bean 注入 B Bean 的实例，完成初始化，存入一级缓存，删除二级缓存中的 A。

#### 3. 构造器注入的循环依赖问题及解决方案

- 问题：构造器注入时，Bean 实例化阶段就需要依赖对象，而三级缓存仅在 “实例化后、初始化前” 暴露 Bean，无法解决构造器注入的循环依赖，会抛出`CircularReferenceException`。
- 解决方案：
  1. 改用 Setter 注入或字段注入（保留 Spring 默认的三级缓存解决方案）。
  2. 在构造器注入时，对依赖的 Bean 添加`@Lazy`注解（延迟初始化，打破循环依赖）。
  3. 重构代码，拆分公共依赖（如将 A 和 B 共同依赖的逻辑抽离为 C Bean，A 和 B 仅依赖 C）。

### 参考答案 2

#### 1. RESTful API 核心设计规范及示例

- 核心规范：
  1. 资源命名：用名词复数表示资源（如`/users`代表用户资源集合），不使用动词。
  2. 请求方法与动作对应：GET（查询）、POST（新增）、PUT（全量更新）、PATCH（部分更新）、DELETE（删除）。
  3. 状态码规范：200（查询成功）、201（创建成功）、204（删除成功）、400（参数错误）、401（未授权）、403（权限不足）、404（资源不存在）、500（服务器错误）。
  4. 参数传递：分页（`?page=1&size=10`）、筛选（`?name=张三&gender=1`）、排序（`?sort=createTime,desc`）。
- 接口示例：
  - 新增用户：POST `/users`，请求体（JSON）：`{"name":"张三","phone":"13800138000"}`，响应状态码 201。
  - 部分更新用户手机号：PATCH `/users/1`，请求体（JSON）：`{"phone":"13900139000"}`，响应状态码 200。
  - 删除用户：DELETE `/users/1`，响应状态码 204。

#### 2. HTTPS 的核心优势及 TLS 握手流程

- 核心优势：
  1. 数据加密：通过对称加密 + 非对称加密结合，避免数据传输过程中被窃听。
  2. 身份认证：通过数字证书验证服务器身份，避免中间人攻击。
  3. 数据完整性：通过 MAC 校验，确保数据未被篡改。
- TLS 握手关键步骤：
  1. 客户端发送 Client Hello：携带支持的 TLS 版本、加密套件、随机数（Client Random）。
  2. 服务器发送 Server Hello：确认 TLS 版本、加密套件，返回服务器随机数（Server Random）和数字证书。
  3. 客户端验证证书：通过 CA 公钥验证服务器证书的合法性，确保服务器身份真实。
  4. 密钥协商：客户端生成预主密钥（Pre-Master Secret），用服务器证书中的公钥加密后发送给服务器。
  5. 生成会话密钥：客户端和服务器分别用 Client Random、Server Random、Pre-Master Secret 生成相同的会话密钥（对称加密密钥）。
  6. 握手完成：双方发送 Finished 消息，后续数据通过会话密钥进行对称加密传输。

#### 3. 跨域问题的根源及全局解决方案

- 根源：浏览器的 “同源策略” 限制（协议、域名、端口必须完全一致），非同源的前端请求会被浏览器拦截。

- 全局解决方案（除

  ```
  @CrossOrigin
  ```

  外）：

  1. SpringBoot 全局 CORS 配置（实现

     ```
     WebMvcConfigurer
     ```

     ）：

     ```java
     @Configuration
     public class CorsConfig implements WebMvcConfigurer {
       @Override
       public void addCorsMappings(CorsRegistry registry) {
         registry.addMapping("/**") // 所有接口
           .allowedOrigins("http://localhost:8080") // 允许的前端域名
           .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE") // 允许的请求方法
           .allowedHeaders("*") // 允许的请求头
           .allowCredentials(true) // 允许携带Cookie
           .maxAge(3600); // 预检请求缓存时间（1小时）
       }
     }
     ```

  2. Nginx 反向代理（将前端请求代理到后端，消除跨域）：

     nginx

     ```nginx
     server {
       listen 80;
       server_name localhost;
       # 代理后端接口
       location /api/ {
         proxy_pass http://localhost:8080/; # 后端服务地址
         add_header Access-Control-Allow-Origin http://localhost:8080;
         add_header Access-Control-Allow-Methods "GET,POST,PUT,PATCH,DELETE";
         add_header Access-Control-Allow-Credentials true;
       }
     }
     ```

     

  3. 网关层配置（如 Spring Cloud Gateway）：在网关统一配置 CORS，无需后端服务单独配置。

### 参考答案 3

#### 1. 联合索引最左前缀原则及索引失效场景

- 最左前缀原则：联合索引的查询条件需包含索引的 “最左前缀字段”，才能命中索引。例如联合索引`idx_name_gender_age`，仅当查询条件包含`name`（左前缀）时，才可能命中索引；若直接查询`gender=1`，则索引失效。
- 索引失效场景（3 种）：
  1. 跳过左前缀字段查询：`SELECT * FROM user WHERE gender=1 AND age=20`（未包含`name`，索引失效）。
  2. 索引字段用函数操作：`SELECT * FROM user WHERE SUBSTR(name,1,3)='张三'`（函数操作`name`字段，索引失效）。
  3. 模糊查询前缀带 %：`SELECT * FROM user WHERE name LIKE '%张三'`（前缀 % 导致索引无法匹配，失效）；后缀 %（`name LIKE '张三%'`）可命中索引。
  4. 字段类型不匹配：`name`是 VARCHAR 类型，查询时用`name=123`（数字类型），导致索引失效。

#### 2. 事务 ACID 特性及幻读解决方案

- ACID 特性：

  1. 原子性（Atomicity）：事务中的操作要么全成功，要么全回滚（如转账：扣款和到账不可拆分）。
  2. 一致性（Consistency）：事务执行前后数据总量一致（如转账：A 扣款 100，B 到账 100，总金额不变）。
  3. 隔离性（Isolation）：多个事务并发执行时，互不干扰，避免脏读、不可重复读、幻读。
  4. 持久性（Durability）：事务提交后，数据永久保存到数据库，即使服务器宕机也不丢失。

- MySQL 默认隔离级别：可重复读（Repeatable Read）。

- 幻读的解决：InnoDB 通过

  MVCC（多版本并发控制）+ 间隙锁

  解决幻读：

  1. MVCC：事务启动时生成 Read View（一致性视图），后续查询仅能看到该视图之前提交的数据，无法看到其他事务新增的数据，避免幻读。
  2. 间隙锁：执行`SELECT ... FOR UPDATE`（悲观锁）时，InnoDB 会对查询范围的 “间隙” 加锁，阻止其他事务在该间隙中新增数据，从物理上杜绝幻读。

#### 3. 大表查询优化方案（除加索引外）

1. 分库分表：

   - 水平分表：按规则拆分数据（如用户 ID 取模、时间范围），将 1000 万条数据拆分为 10 张表（每张 100 万条），减少单表数据量。
   - 垂直分表：拆分大字段（如 text、blob）到独立表，避免查询时加载不必要的大字段。

2. 分页优化：

   - 避免用

     ```
     LIMIT 100000, 10
     ```

     （扫描前 100010 条数据），改用 “延迟关联”：

     sql

     ```sql
     SELECT u.* FROM user u 
     JOIN (SELECT id FROM user ORDER BY id LIMIT 100000, 10) t ON u.id = t.id;
     ```

3. 读写分离：主库负责增删改，从库负责查询，分散数据库压力（需配置主从复制）。

4. 数据归档：将历史数据（如 1 年前的数据）归档到离线数据库（如 Hive），仅保留近期热点数据在业务库。

5. SQL 优化：避免`SELECT *`，只查询必要字段；减少多表关联，拆分复杂 SQL 为简单 SQL；避免子查询，改用 JOIN。

### 参考答案 4

#### 1. Mybatis 一级缓存与二级缓存的核心区别

| 对比维度 | 一级缓存（SqlSession 级别）                                  | 二级缓存（Mapper 级别）                                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 存储范围 | 单个 SqlSession 内（线程私有）                               | Mapper 接口内（多个 SqlSession 共享）                        |
| 开启方式 | 默认开启，无需配置                                           | 默认关闭，需在 Mapper XML 添加``                             |
| 生效条件 | 同一 SqlSession、同一 SQL、同一参数、同一隔离级别            | 同一 Mapper、同一 SQL、同一参数、Bean 实现 Serializable      |
| 失效场景 | 1. 执行 INSERT/UPDATE/DELETE；2. 调用`sqlSession.clearCache()`；3. SqlSession 关闭；4. 手动设置`flushCache=true` | 1. 执行 INSERT/UPDATE/DELETE（默认清空缓存）；2. 配置`flushCache=true`；3. 缓存过期（可配置`eviction`策略） |
| 局限性   | 仅当前 SqlSession 有效，无法跨线程共享                       | 多表关联查询时缓存一致性难保证，需谨慎使用                   |

#### 2. 动态 SQL 实现（多条件查询 + 批量删除）

- Mapper 接口：

  java

  ```java
  // 多条件查询用户
  List<User> selectUserByCondition(@Param("name") String name, 
                                   @Param("gender") Integer gender, 
                                   @Param("minAge") Integer minAge, 
                                   @Param("maxAge") Integer maxAge);
  
  // 批量删除用户
  int batchDeleteUser(@Param("ids") List<Long> ids);
  ```

- XML 映射文件：

  xml

  ```xml
  <!-- 多条件查询 -->
  <select id="selectUserByCondition" resultType="com.itheima.entity.User">
    SELECT id, name, gender, age FROM user
    <where>
      <if test="name != null and name != ''">
        AND name LIKE CONCAT('%', #{name}, '%')
      </if>
      <if test="gender != null">
        AND gender = #{gender}
      </if>
      <if test="minAge != null">
        AND age >= #{minAge}
      </if>
      <if test="maxAge != null">
        AND age <= #{maxAge}
      </if>
    </where>
  </select>
  
  <!-- 批量删除 -->
  <delete id="batchDeleteUser">
    DELETE FROM user WHERE id IN
    <foreach collection="ids" item="id" open="(" close=")" separator=",">
      #{id}
    </foreach>
  </delete>
  ```

  

#### 3. `@Mapper`与`@MapperScan`的作用及 Mapper 代理对象生成原理

- 作用：
  1. `@Mapper`：标识该接口是 Mybatis 的 Mapper 接口，SpringBoot 启动时会扫描该注解，自动生成代理对象并注入 Spring 容器。
  2. `@MapperScan`：批量扫描指定包下的所有 Mapper 接口（如`@MapperScan("com.itheima.mapper")`），无需在每个 Mapper 接口加`@Mapper`，简化配置。
- Mapper 代理对象生成原理（Mybatis 核心流程）：
  1. SpringBoot 整合 Mybatis 时，通过`SqlSessionFactory`创建`SqlSession`（默认是`DefaultSqlSession`）。
  2. `SqlSession.getMapper(Class mapperInterface)`方法调用`MapperProxyFactory`创建`MapperProxy`（实现`InvocationHandler`接口的动态代理类）。
  3. `MapperProxy`通过 JDK 动态代理机制，为 Mapper 接口生成代理对象。
  4. 当调用 Mapper 接口方法时，`MapperProxy.invoke()`方法会解析方法对应的 SQL（从 XML 或注解中），执行数据库操作并返回结果。

### 参考答案 5

#### 1. 数据库连接池耗尽问题的根源及解决方案

- 根源：

  1. 连接池最大连接数配置过小，无法满足高并发请求（如 HikariCP 默认最大连接数 10，高并发下请求排队等待连接）。
  2. 连接泄露：`Connection`、`PreparedStatement`、`ResultSet`未关闭，导致连接池中的连接被占用且无法释放。
  3. 连接超时时间过短，高并发下连接获取超时。

- 解决方案：

  1. 优化连接池参数（以 HikariCP 为例，配置

     ```
     application.properties
     ```

     ）：

     properties

     ```properties
     # 最大连接数：根据CPU核心数调整（8核CPU设为20-30）
     spring.datasource.hikari.maximum-pool-size=25
     # 最小空闲连接数：保持一定数量的空闲连接，避免频繁创建连接
     spring.datasource.hikari.minimum-idle=5
     # 连接超时时间：延长至60秒（默认30秒）
     spring.datasource.hikari.connection-timeout=60000
     # 连接泄露检测：超过60秒未归还连接，打印泄露日志
     spring.datasource.hikari.leak-detection-threshold=60000
     ```

     

  2. 避免连接泄露：

     - 用 try-with-resources 语法自动关闭资源（JDBC/Mybatis）：

       java

       ```java
       try (SqlSession sqlSession = sqlSessionFactory.openSession();
            UserMapper userMapper = sqlSession.getMapper(UserMapper.class)) {
         // 执行查询操作
       }
       ```

       

     - 检查代码中是否有未关闭的`SqlSession`、`Connection`（如异常情况下未关闭）。

  3. 监控连接池状态：使用 Druid 连接池的监控面板，实时查看连接数、空闲连接数、泄露连接等，针对性优化。

#### 2. 批量插入效率低的根源及解决方案

- 根源：

  1. 单条`INSERT`循环执行：频繁与数据库交互（10 万条数据需 10 万次 SQL 执行），网络开销大。
  2. 未关闭自动提交事务：每条`INSERT`都触发事务提交，数据库 IO 压力大。
  3. MySQL 未开启批处理优化，导致批量插入退化为单条执行。

- 解决方案（Mybatis+JDBC 批处理优化）：

  1. 开启 MySQL 批处理优化（JDBC URL 添加参数）：

     properties

     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/hmdp?useSSL=false&serverTimezone=UTC&rewriteBatchedStatements=true
     ```

  2. Mybatis 批量插入（XML+

     ```
     foreach
     ```

     ）：

     xml

     ```xml
     <insert id="batchInsertUser">
       INSERT INTO user (name, phone, gender) VALUES
       <foreach collection="list" item="user" separator=",">
         (#{user.name}, #{user.phone}, #{user.gender})
       </foreach>
     </insert>
     ```

     

  3. 关闭自动提交事务，批量提交：

     java

     运行

     ```java
     @Transactional // Spring事务管理，自动关闭自动提交
     public int batchInsert(List<User> userList) {
       // 分批次提交（每1000条提交一次，避免SQL过长）
       int batchSize = 1000;
       for (int i = 0; i < userList.size(); i += batchSize) {
         int end = Math.min(i + batchSize, userList.size());
         userMapper.batchInsertUser(userList.subList(i, end));
       }
       return userList.size();
     }
     ```

     

  4. 禁用 Mybatis 一级缓存（批量操作时避免缓存占用内存）：在`insert`标签添加`flushCache="true"`。

#### 3. Mybatis 缓存一致性问题的根源及解决方案

- 根源：

  1. 一级缓存未失效：同一`SqlSession`中，先查询用户列表，后执行更新操作但未关闭`SqlSession`，再次查询时命中一级缓存，获取旧数据。
  2. 二级缓存共享：多个`SqlSession`共享二级缓存，某一`SqlSession`更新数据后未清空二级缓存，其他`SqlSession`查询时命中旧缓存。

- 解决方案：

  1. 一级缓存优化：

     - 执行更新操作（INSERT/UPDATE/DELETE）后，手动调用`sqlSession.clearCache()`清空一级缓存。
     - 业务逻辑中，避免同一`SqlSession`先查询后更新再查询（拆分`SqlSession`，查询和更新用不同的`SqlSession`）。

  2. 二级缓存优化：

     - 禁用二级缓存（若数据一致性要求高，如用户信息表）：删除 Mapper XML 中的``标签。
     - 配置二级缓存的`flushCache="true"`（默认更新操作会清空二级缓存，确保配置正确）。
     - 避免多表关联查询使用二级缓存（如`user`表关联`order`表，`order`表更新后`user`表缓存未清空，导致数据不一致）。

  3. 缓存过期策略：二级缓存添加过期配置（如

     ```
     eviction="LRU"
     ```

     （最近最少使用）、

     ```
     flushInterval="60000"
     ```

     （1 分钟过期））：

     xml

     ```xml
     <cache eviction="LRU" flushInterval="60000" size="1024" readOnly="true"/>
     ```

     

  4. 最终解决方案：高并发场景下，优先使用 Redis 等分布式缓存替代 Mybatis 二级缓存，通过缓存更新策略（如更新数据库后主动删除缓存）保证一致性。

