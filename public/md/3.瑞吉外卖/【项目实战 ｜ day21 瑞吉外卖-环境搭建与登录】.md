# 🚀 项目实战 Day21 - 瑞吉外卖：环境搭建与登录

> 💡 **项目实战！** 本文聚焦瑞吉外卖项目的环境搭建、登录权限、员工管理等核心功能——SpringBoot配置、MyBatis-Plus使用、全局异常处理、登录过滤器，帮你掌握企业级项目开发的基础架构。

---

## 🎯 快速回顾

- **🏗️ 项目架构**：前后端分离、管理端+用户端、分层架构（Controller/Service/Mapper）
- **🔧 技术栈**：SpringBoot 2.4.5、MyBatis-Plus 3.4.2、MySQL 8.0+、Lombok、Jackson
- **⚙️ 环境搭建**：Maven依赖配置、application.yml配置、静态资源映射、分页插件、消息转换器
- **🛡️ 核心组件**：统一返回类R、全局异常处理器、登录校验过滤器、Jackson对象转换器
- **👥 员工管理**：新增员工、分页查询、登录/退出功能
- **⚠️ 常见问题**：版本冲突、时区异常、精度丢失、Session管理

---

## 📑 目录

- [一、核心定位与技术栈拆解](#一核心定位与技术栈拆解)
  - [1. 项目核心逻辑](#1-项目核心逻辑)
  - [2. 技术栈深度解析（重点）](#2-技术栈深度解析重点)
- [二、环境搭建深度指南（地基工程，必掌握）](#二环境搭建深度指南地基工程必掌握)
  - [1. Maven 依赖配置（重点：版本锁定 + 依赖排除）](#1-maven-依赖配置重点版本锁定--依赖排除)
  - [2. 核心配置文件（application.yml）](#2-核心配置文件applicationyml)
  - [3. 关键配置类（重点：静态资源 + 分页插件 + 消息转换器）](#3-关键配置类重点静态资源--分页插件--消息转换器)
- [三、核心可复用组件（深度解析 + 复用技巧）](#三核心可复用组件深度解析--复用技巧)
  - [1. 统一返回结果类（R.java）](#1-统一返回结果类rjava)
  - [2. 全局异常处理器（GlobalExceptionHandler.java）](#2-全局异常处理器globalexceptionhandlerjava)
  - [3. 登录校验过滤器（LoginCheckFilter.java）](#3-登录校验过滤器logincheckfilterjava)
  - [4. Jackson 对象转换器（JacksonObjectMapper.java）](#4-jackson-对象转换器jacksonobjectmapperjava)
- [四、通用功能模板（CRUD + 权限，带设计思路）](#四通用功能模板crud--权限带设计思路)
  - [1. 实体类模板（BaseEntity.java）](#1-实体类模板baseentityjava)
  - [2. 新增功能模板（Controller 层）](#2-新增功能模板controller-层)
  - [3. 分页查询模板（Controller 层）](#3-分页查询模板controller-层)
  - [4. 登录 / 退出功能（权限核心）](#4-登录--退出功能权限核心)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、核心定位与技术栈拆解

#### 1. 项目核心逻辑

瑞吉外卖是**前后端分离的餐饮管理系统**，分管理端（员工操作）和用户端（消费者操作），Day01-02 聚焦「环境搭建 + 登录权限 + 员工管理」，是整个项目的基础骨架，后续所有功能（菜品、订单）均依赖此架构。

---

#### 2. 技术栈深度解析（重点）

| 技术组件           | 核心作用                         | 底层逻辑 / 设计思路                                          |
| ------------------ | -------------------------------- | ------------------------------------------------------------ |
| SpringBoot 2.4.5   | 快速搭建项目，整合依赖           | 自动配置原理：通过`@Conditional`注解根据依赖是否存在自动激活配置（如数据源自动配置） |
| MyBatis-Plus 3.4.2 | 简化单表 CRUD，分页、条件查询    | 基于 MyBatis 动态代理实现，通过`BaseMapper`封装通用 SQL，减少重复编码 |
| MySQL 8.0+         | 存储业务数据（员工、菜品、订单） | 依赖 InnoDB 引擎的事务和索引特性，确保数据一致性和查询效率   |
| Lombok 1.18.20     | 简化实体类（get/set/ 构造器）    | 编译期注解处理器生成字节码，不影响运行时性能，但需 IDE 安装插件支持 |
| Jackson            | JSON 序列化 / 反序列化           | 自定义转换器解决 Java `Long`与 JS `Number`精度不兼容问题（JS 最大安全整数 2^53） |
| 过滤器（Filter）   | 登录权限拦截                     | 基于 Servlet 规范，在请求到达 Controller 前拦截，执行权限校验 |

⚠️ **避坑点**：技术版本必须匹配（如 SpringBoot 2.4.x + MyBatis-Plus 3.4.x），高版本可能出现自动配置冲突（如 SpringBoot 2.6 + 与 MyBatis-Plus 分页插件不兼容）。

---

### 二、环境搭建深度指南（地基工程，必掌握）

#### 1. Maven 依赖配置（重点：版本锁定 + 依赖排除）

```xml
<properties>
    <java.version>1.8</java.version>
    <!-- 锁定核心依赖版本，避免冲突 -->
    <mybatis-plus.version>3.4.2</mybatis-plus.version>
    <lombok.version>1.18.20</lombok.version>
</properties>

<dependencies>
    <!-- SpringBoot核心：web + 测试 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- MyBatis-Plus：必须排除自带的mybatis依赖，避免与SpringBoot默认mybatis冲突 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>${mybatis-plus.version}</version>
        <exclusions>
            <exclusion>
                <groupId>org.mybatis</groupId>
                <artifactId>mybatis</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    
    <!-- 数据库：MySQL驱动 + Druid连接池 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.1.23</version>
    </dependency>
    
    <!-- 工具类：Lombok（简化实体） + FastJSON（JSON处理） -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
        <optional>true</optional> <!-- 避免传递依赖冲突 -->
    </dependency>
</dependencies>
```

⚠️ **避坑点**：
1. Lombok 的`optional=true`必须加，否则其他模块依赖本项目时会强制引入 Lombok；
2. MyBatis-Plus 必须排除`mybatis`依赖，否则与 SpringBoot 默认的 MyBatis 版本冲突，导致启动失败。

---

#### 2. 核心配置文件（application.yml）

```yaml
server:
  port: 8080 # 端口，避免与其他服务冲突
spring:
  application:
    name: reggie_take_out
  datasource:
    druid:
      driver-class-name: com.mysql.cj.jdbc.Driver # MySQL8.0+必须用cj驱动
      url: jdbc:mysql://localhost:3306/reggie?serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=utf-8&allowPublicKeyRetrieval=true
      username: root
      password: root
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true # 数据库下划线→Java驼峰命名映射（如user_name→userName）
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl # 打印SQL，便于调试
  global-config:
    db-config:
      id-type: ASSIGN_ID # 雪花算法生成ID（分布式环境唯一）
```

⚠️ **避坑点**：
1. URL 必须加`serverTimezone=Asia/Shanghai`（解决时区异常）和`allowPublicKeyRetrieval=true`（避免连接时权限报错）；
2. `id-type: ASSIGN_ID`适用于分布式环境，单机可改用`AUTO`（自增），但需确保数据库表 ID 设为自增。

---

#### 3. 关键配置类（重点：静态资源 + 分页插件 + 消息转换器）

##### （1）WebMvcConfig（静态资源 + 消息转换器）

```java
@Configuration
@Slf4j
public class WebMvcConfig extends WebMvcConfigurationSupport {
    /**
     * 静态资源映射：让SpringBoot识别前端HTML/CSS/JS
     * 底层逻辑：将/backend/**路径映射到classpath:/backend/目录
     */
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        log.info("静态资源映射初始化...");
        registry.addResourceHandler("/backend/**").addResourceLocations("classpath:/backend/");
        registry.addResourceHandler("/front/**").addResourceLocations("classpath:/front/");
    }

    /**
     * 扩展消息转换器：解决Long→String精度丢失
     * 核心原理：Jackson序列化时将Long转为String，JS接收后保持完整精度
     */
    @Override
    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(new JacksonObjectMapper());
        converters.add(0, converter); // 优先使用自定义转换器
    }
}
```

##### （2）MybatisPlusConfig（分页插件）

```java
@Configuration
public class MybatisPlusConfig {
    /**
     * 分页插件：MyBatis-Plus分页功能的核心，必须配置
     * 底层逻辑：拦截SQL，自动添加LIMIT语句和总记录数查询
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL)); // 指定数据库类型
        return interceptor;
    }
}
```

⚠️ **避坑点**：
1. 分页插件必须指定`DbType.MYSQL`，否则不同数据库（如 Oracle）的分页语法不兼容；
2. 自定义消息转换器必须添加到`converters`第一个位置，否则会被 Spring 默认转换器覆盖。

---

### 三、核心可复用组件（深度解析 + 复用技巧）

#### 1. 统一返回结果类（R.java）

```java
@Data
public class R<T> {
    private Integer code; // 1成功，0失败（约定式返回，前端统一处理）
    private String msg;   // 提示信息
    private T data;       // 响应数据（泛型适配任意类型）
    private Map<String, Object> map = new HashMap<>(); // 动态扩展字段

    // 静态工厂方法：简化调用（无需new R<>()）
    public static <T> R<T> success(T data) {
        R<T> r = new R<>();
        r.code = 1;
        r.data = data;
        return r;
    }

    public static <T> R<T> error(String msg) {
        R<T> r = new R<>();
        r.code = 0;
        r.msg = msg;
        return r;
    }

    // 链式编程：动态添加字段（如R.success().add("total", 100)）
    public R<T> add(String key, Object value) {
        this.map.put(key, value);
        return this;
    }
}
```

**设计思路（深入）**：
- 泛型``：适配不同响应数据类型（如`R`、`R`），避免重复定义多个返回类；
- 静态工厂方法：简化代码（`return R.success(data)` vs `return new R<>(1, null, data)`）；
- 动态`map`：应对特殊场景（如同时返回数据和额外统计信息），无需修改类结构。

---

#### 2. 全局异常处理器（GlobalExceptionHandler.java）

```java
@RestControllerAdvice(annotations = {RestController.class, Controller.class})
@Slf4j
public class GlobalExceptionHandler {
    /**
     * 处理SQL唯一约束异常（如重复用户名）
     * 底层逻辑：拦截SQLIntegrityConstraintViolationException，解析错误信息返回友好提示
     */
    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public R<String> handleSQLUniqueException(SQLIntegrityConstraintViolationException ex) {
        log.error("SQL异常：{}", ex.getMessage());
        if (ex.getMessage().contains("Duplicate entry")) {
            String[] split = ex.getMessage().split(" ");
            String msg = split[2] + "已存在"; // 提取重复字段值（如用户名）
            return R.error(msg);
        }
        return R.error("数据库操作异常");
    }

    /**
     * 通用异常处理器：兜底所有未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public R<String> handleCommonException(Exception ex) {
        log.error("系统异常：{}", ex.getMessage());
        return R.error("操作失败：" + ex.getMessage());
    }
}
```

**重点解析**：
- `@RestControllerAdvice`：= `@ControllerAdvice` + `@ResponseBody`，全局拦截 Controller 层异常；
- 异常匹配规则：优先匹配具体异常（如`SQLIntegrityConstraintViolationException`），再匹配父类异常（`Exception`）；
- 错误信息解析：利用 MySQL 错误信息格式（`Duplicate entry 'xxx' for key 'xxx'`）提取关键信息，提升用户体验。

⚠️ **避坑点**：必须指定`annotations = {RestController.class, Controller.class}`，否则会拦截非 Controller 层的异常（如 Service 层），导致日志混乱。

---

#### 3. 登录校验过滤器（LoginCheckFilter.java）

```java
@WebFilter(filterName = "loginCheckFilter", urlPatterns = "/*")
@Slf4j
public class LoginCheckFilter implements Filter {
    // 路径匹配器：支持Ant风格通配符（/**匹配多级目录，*匹配单级目录）
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 1. 定义无需拦截的路径（白名单）
        String[] freeUrls = {
                "/employee/login", "/employee/logout", // 登录/退出接口
                "/backend/**", "/front/**" // 前端静态资源
        };

        // 2. 校验是否在白名单中
        String requestURI = request.getRequestURI();
        boolean isFree = check(freeUrls, requestURI);
        if (isFree) {
            chain.doFilter(request, response); // 放行
            return;
        }

        // 3. 校验登录状态（Session中是否有员工ID）
        if (request.getSession().getAttribute("employee") != null) {
            chain.doFilter(request, response);
            return;
        }

        // 4. 未登录：返回NOTLOGIN，前端跳转到登录页
        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
    }

    // 路径匹配逻辑
    private boolean check(String[] urls, String requestURI) {
        for (String url : urls) {
            if (PATH_MATCHER.match(url, requestURI)) {
                return true;
            }
        }
        return false;
    }
}
```

**核心流程（深入）**：
1. 拦截所有请求（`urlPatterns = "/*"`）；
2. 白名单校验：静态资源和登录 / 退出接口直接放行；
3. 登录状态校验：通过 Session 中的`employee`标识判断是否登录；
4. 未登录处理：返回`R.error("NOTLOGIN")`，前端响应拦截器捕获后跳转到登录页。

⚠️ **避坑点**：
1. 白名单必须包含`/backend/**`和`/front/**`，否则前端静态资源无法访问，页面空白；
2. 必须在引导类添加`@ServletComponentScan`注解，否则 SpringBoot 无法扫描`@WebFilter`，过滤器失效。

---

#### 4. Jackson 对象转换器（JacksonObjectMapper.java）

```java
public class JacksonObjectMapper extends ObjectMapper {
    // 日期时间格式化模板
    public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    public JacksonObjectMapper() {
        super();
        this.configure(FAIL_ON_UNKNOWN_PROPERTIES, false); // 忽略未知字段（避免前端传多余字段报错）
        
        // 注册自定义序列化/反序列化规则
        SimpleModule module = new SimpleModule()
                // 核心：Long/BigInteger转为String（解决JS精度丢失）
                .addSerializer(Long.class, ToStringSerializer.instance)
                .addSerializer(BigInteger.class, ToStringSerializer.instance)
                // 日期时间格式化（LocalDateTime→String）
                .addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))
                .addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)));
        
        this.registerModule(module);
    }
}
```

**深度解析**：
- 精度丢失根源：JS 的`Number`类型最大安全整数是`2^53`（9007199254740992），而 Java `Long`的取值范围更大（-9223372036854775808~9223372036854775807），超出部分会被截断；
- 序列化规则：通过`ToStringSerializer`将 Long 转为 String，JS 接收后以字符串形式存储，保持完整精度；
- 忽略未知字段：`FAIL_ON_UNKNOWN_PROPERTIES=false`避免前端传递多余字段导致接口报错（如前端多传一个`timestamp`字段）。

---

### 四、通用功能模板（CRUD + 权限，带设计思路）

#### 1. 实体类模板（BaseEntity.java）

```java
@Data
public class BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // 主键（雪花算法生成）
    private LocalDateTime createTime; // 创建时间
    private LocalDateTime updateTime; // 更新时间
    @TableField(fill = FieldFill.INSERT) // 插入时自动填充
    private Long createUser; // 创建人（员工ID）
    @TableField(fill = FieldFill.INSERT_UPDATE) // 插入/更新时自动填充
    private Long updateUser; // 更新人（员工ID）
}
```

**重点：审计字段自动填充（可选扩展）**

如果需要 MyBatis-Plus 自动填充`createTime`、`updateUser`等字段，可添加填充处理器：

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        // 从Session获取当前登录员工ID
        strictInsertFill(metaObject, "createUser", Long.class, (Long) SecurityUtils.getSubject().getSession().getAttribute("employee"));
        strictInsertFill(metaObject, "updateUser", Long.class, (Long) SecurityUtils.getSubject().getSession().getAttribute("employee"));
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        strictUpdateFill(metaObject, "updateUser", Long.class, (Long) SecurityUtils.getSubject().getSession().getAttribute("employee"));
    }
}
```

⚠️ **避坑点**：自动填充需配合`@TableField(fill = FieldFill.INSERT)`注解，且填充处理器必须加`@Component`注解交给 Spring 管理。

---

#### 2. 新增功能模板（Controller 层）

```java
@PostMapping
public R<String> save(HttpServletRequest request, @RequestBody Employee employee) {
    log.info("新增员工：{}", employee);
    
    // 1. 初始密码MD5加密（安全存储，避免明文）
    employee.setPassword(DigestUtils.md5DigestAsHex("123456".getBytes()));
    
    // 2. 填充审计字段（创建时间、创建人等）
    employee.setCreateTime(LocalDateTime.now());
    employee.setUpdateTime(LocalDateTime.now());
    employee.setCreateUser((Long) request.getSession().getAttribute("employee"));
    employee.setUpdateUser((Long) request.getSession().getAttribute("employee"));
    
    // 3. 保存数据（MyBatis-Plus的save方法）
    employeeService.save(employee);
    
    return R.success("新增员工成功");
}
```

**设计思路**：
- 密码加密：MD5 是不可逆加密，即使数据库泄露，密码也无法还原（生产环境可改用 BCrypt，支持盐值）；
- 审计字段：谁创建 / 修改的数据谁负责，便于后续追溯和权限审计；
- 泛型复用：将`Employee`改为泛型``，可复用为其他实体的新增接口（如菜品、套餐）。

⚠️ **避坑点**：MD5 加密时需注意字符编码（默认 UTF-8），前后端编码一致，否则密码比对失败。

---

#### 3. 分页查询模板（Controller 层）

```java
@GetMapping("/page")
public R<Page> page(int page, int pageSize, String name) {
    // 1. 构造分页条件（page=当前页，pageSize=每页条数）
    Page<Employee> pageInfo = new Page<>(page, pageSize);
    
    // 2. 构造查询条件（LambdaQueryWrapper：类型安全，避免字段名写错）
    LambdaQueryWrapper<Employee> queryWrapper = new LambdaQueryWrapper<>();
    // 模糊查询：姓名非空才添加条件（避免name为null时查询所有数据）
    queryWrapper.like(StringUtils.isNotEmpty(name), Employee::getName, name)
                .orderByDesc(Employee::getUpdateTime); // 按更新时间倒序（最新数据在前）
    
    // 3. 执行分页查询（MyBatis-Plus自动拼接LIMIT和COUNT语句）
    employeeService.page(pageInfo, queryWrapper);
    
    return R.success(pageInfo);
}
```

**深度解析**：
- `LambdaQueryWrapper`：通过方法引用（`Employee::getName`）指定字段，避免硬编码字段名（如`"name"`），减少拼写错误；
- 分页结果：`Page`对象包含`total`（总记录数）和`records`（当前页数据），前端可直接用于分页控件渲染；
- 条件优化：`StringUtils.isNotEmpty(name)`避免`name`为`null`或空字符串时，生成`like '%%'`查询所有数据。

---

#### 4. 登录 / 退出功能（权限核心）

##### （1）登录接口

```java
@PostMapping("/login")
public R<Employee> login(HttpServletRequest request, @RequestBody Employee employee) {
    // 1. 密码MD5加密（与数据库中加密后的密码比对）
    String password = employee.getPassword();
    password = DigestUtils.md5DigestAsHex(password.getBytes());
    
    // 2. 按用户名查询员工（LambdaQueryWrapper条件查询）
    LambdaQueryWrapper<Employee> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(Employee::getUsername, employee.getUsername());
    Employee emp = employeeService.getOne(queryWrapper);
    
    // 3. 校验逻辑（用户名不存在→密码不一致→账号禁用）
    if (emp == null) {
        return R.error("登录失败：用户名不存在");
    }
    if (!emp.getPassword().equals(password)) {
        return R.error("登录失败：密码错误");
    }
    if (emp.getStatus() == 0) {
        return R.error("登录失败：账号已禁用");
    }
    
    // 4. 保存登录状态（员工ID存入Session）
    request.getSession().setAttribute("employee", emp.getId());
    
    return R.success(emp);
}
```

##### （2）退出接口

```java
@PostMapping("/logout")
public R<String> logout(HttpServletRequest request) {
    // 清除Session中的员工ID，销毁登录状态
    request.getSession().removeAttribute("employee");
    return R.success("退出成功");
}
```

---

## ❓ 问答

### Q1：瑞吉外卖项目的技术栈有哪些？各自的核心作用是什么？

**答**：
- **技术栈及核心作用**：
  - **SpringBoot 2.4.5**：快速搭建项目，整合依赖，自动配置
  - **MyBatis-Plus 3.4.2**：简化单表 CRUD，分页、条件查询
  - **MySQL 8.0+**：存储业务数据（员工、菜品、订单）
  - **Lombok 1.18.20**：简化实体类（get/set/ 构造器）
  - **Jackson**：JSON 序列化 / 反序列化
  - **过滤器（Filter）**：登录权限拦截
- **解析**：理解技术栈的核心作用，是掌握项目开发的基础。

---

### Q2：Maven 依赖配置中，为什么需要排除 MyBatis-Plus 自带的 mybatis 依赖？

**答**：
- **原因**：MyBatis-Plus 自带的 mybatis 依赖版本可能与 SpringBoot 默认的 MyBatis 版本冲突，导致启动失败
- **解决方法**：在 MyBatis-Plus 依赖中添加`<exclusions>`排除自带的 mybatis 依赖
- **解析**：依赖冲突是 Maven 开发常见问题，掌握依赖排除方法，能有效避免启动失败。

---

### Q3：为什么需要自定义 Jackson 消息转换器？Long 类型精度丢失的根源是什么？

**答**：
- **精度丢失根源**：JS 的`Number`类型最大安全整数是`2^53`（9007199254740992），而 Java `Long`的取值范围更大，超出部分会被截断
- **解决方法**：通过自定义 Jackson 消息转换器，将 Long 转为 String，JS 接收后以字符串形式存储，保持完整精度
- **解析**：理解精度丢失的根源和解决方法，是前后端数据交互的关键。

---

### Q4：登录校验过滤器的核心流程是什么？如何实现白名单校验？

**答**：
- **核心流程**：
  1. 拦截所有请求（`urlPatterns = "/*"`）
  2. 白名单校验：静态资源和登录 / 退出接口直接放行
  3. 登录状态校验：通过 Session 中的`employee`标识判断是否登录
  4. 未登录处理：返回`R.error("NOTLOGIN")`，前端跳转到登录页
- **白名单校验**：通过 AntPathMatcher 路径匹配器，支持`/**`（多级目录）、`*`（单级目录）通配符
- **解析**：登录校验过滤器是权限控制的核心，理解其流程和白名单校验，能有效实现权限拦截。

---

### Q5：全局异常处理器的作用是什么？如何处理 SQL 唯一约束异常？

**答**：
- **全局异常处理器作用**：全局拦截 Controller 层异常，统一返回错误信息，提升用户体验
- **SQL 唯一约束异常处理**：
  1. 通过`@ExceptionHandler(SQLIntegrityConstraintViolationException.class)`拦截异常
  2. 解析错误信息（如`Duplicate entry 'xxx' for key 'xxx'`）提取重复字段值
  3. 返回友好提示（如`xxx已存在`）
- **解析**：全局异常处理器是异常处理的核心，理解其作用和处理方法，能有效提升用户体验。

---

> **📚 学习建议**：本节内容是瑞吉外卖项目的基础架构，重点掌握环境搭建、核心组件（统一返回类、全局异常处理器、登录过滤器）、通用功能模板（CRUD + 权限），这些是企业级项目开发的基础，后续所有功能（菜品、订单）均依赖此架构。
