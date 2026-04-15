# 【项目实战1 -瑞吉外卖｜day21 】



## 一、核心定位与技术栈拆解

### 1. 项目核心逻辑

瑞吉外卖是**前后端分离的餐饮管理系统**，分管理端（员工操作）和用户端（消费者操作），Day01-02 聚焦「环境搭建 + 登录权限 + 员工管理」，是整个项目的基础骨架，后续所有功能（菜品、订单）均依赖此架构。

### 2. 技术栈深度解析（重点）

| 技术组件           | 核心作用                         | 底层逻辑 / 设计思路                                          |
| ------------------ | -------------------------------- | ------------------------------------------------------------ |
| SpringBoot 2.4.5   | 快速搭建项目，整合依赖           | 自动配置原理：通过`@Conditional`注解根据依赖是否存在自动激活配置（如数据源自动配置） |
| MyBatis-Plus 3.4.2 | 简化单表 CRUD，分页、条件查询    | 基于 MyBatis 动态代理实现，通过`BaseMapper`封装通用 SQL，减少重复编码 |
| MySQL 8.0+         | 存储业务数据（员工、菜品、订单） | 依赖 InnoDB 引擎的事务和索引特性，确保数据一致性和查询效率   |
| Lombok 1.18.20     | 简化实体类（get/set/ 构造器）    | 编译期注解处理器生成字节码，不影响运行时性能，但需 IDE 安装插件支持 |
| Jackson            | JSON 序列化 / 反序列化           | 自定义转换器解决 Java `Long`与 JS `Number`精度不兼容问题（JS 最大安全整数 2^53） |
| 过滤器（Filter）   | 登录权限拦截                     | 基于 Servlet 规范，在请求到达 Controller 前拦截，执行权限校验 |

⚠️ 避坑点：技术版本必须匹配（如 SpringBoot 2.4.x + MyBatis-Plus 3.4.x），高版本可能出现自动配置冲突（如 SpringBoot 2.6 + 与 MyBatis-Plus 分页插件不兼容）。

## 二、环境搭建深度指南（地基工程，必掌握）

### 1. Maven 依赖配置（重点：版本锁定 + 依赖排除）

xml

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

⚠️ 避坑点：

1. Lombok 的`optional=true`必须加，否则其他模块依赖本项目时会强制引入 Lombok；
2. MyBatis-Plus 必须排除`mybatis`依赖，否则与 SpringBoot 默认的 MyBatis 版本冲突，导致启动失败。

### 2. 核心配置文件（application.yml）

yaml

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

⚠️ 避坑点：

1. URL 必须加`serverTimezone=Asia/Shanghai`（解决时区异常）和`allowPublicKeyRetrieval=true`（避免连接时权限报错）；
2. `id-type: ASSIGN_ID`适用于分布式环境，单机可改用`AUTO`（自增），但需确保数据库表 ID 设为自增。

### 3. 关键配置类（重点：静态资源 + 分页插件 + 消息转换器）

#### （1）WebMvcConfig（静态资源 + 消息转换器）

java

运行

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

#### （2）MybatisPlusConfig（分页插件）

java

运行

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

⚠️ 避坑点：

1. 分页插件必须指定`DbType.MYSQL`，否则不同数据库（如 Oracle）的分页语法不兼容；
2. 自定义消息转换器必须添加到`converters`第一个位置，否则会被 Spring 默认转换器覆盖。

## 三、核心可复用组件（深度解析 + 复用技巧）

### 1. 统一返回结果类（R.java）

java

运行

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

#### 设计思路（深入）：

- 泛型``：适配不同响应数据类型（如`R`、`R`），避免重复定义多个返回类；
- 静态工厂方法：简化代码（`return R.success(data)` vs `return new R<>(1, null, data)`）；
- 动态`map`：应对特殊场景（如同时返回数据和额外统计信息），无需修改类结构。

### 2. 全局异常处理器（GlobalExceptionHandler.java）

java

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

#### 重点解析：

- `@RestControllerAdvice`：= `@ControllerAdvice` + `@ResponseBody`，全局拦截 Controller 层异常；
- 异常匹配规则：优先匹配具体异常（如`SQLIntegrityConstraintViolationException`），再匹配父类异常（`Exception`）；
- 错误信息解析：利用 MySQL 错误信息格式（`Duplicate entry 'xxx' for key 'xxx'`）提取关键信息，提升用户体验。

⚠️ 避坑点：必须指定`annotations = {RestController.class, Controller.class}`，否则会拦截非 Controller 层的异常（如 Service 层），导致日志混乱。

### 3. 登录校验过滤器（LoginCheckFilter.java）

java

运行

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

#### 核心流程（深入）：

1. 拦截所有请求（`urlPatterns = "/*"`）；
2. 白名单校验：静态资源和登录 / 退出接口直接放行；
3. 登录状态校验：通过 Session 中的`employee`标识判断是否登录；
4. 未登录处理：返回`R.error("NOTLOGIN")`，前端响应拦截器捕获后跳转到登录页。

⚠️ 避坑点：

1. 白名单必须包含`/backend/**`和`/front/**`，否则前端静态资源无法访问，页面空白；
2. 必须在引导类添加`@ServletComponentScan`注解，否则 SpringBoot 无法扫描`@WebFilter`，过滤器失效。

### 4. Jackson 对象转换器（JacksonObjectMapper.java）

java

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

#### 深度解析：

- 精度丢失根源：JS 的`Number`类型最大安全整数是`2^53`（9007199254740992），而 Java `Long`的取值范围更大（-9223372036854775808~9223372036854775807），超出部分会被截断；
- 序列化规则：通过`ToStringSerializer`将 Long 转为 String，JS 接收后以字符串形式存储，保持完整精度；
- 忽略未知字段：`FAIL_ON_UNKNOWN_PROPERTIES=false`避免前端传递多余字段导致接口报错（如前端多传一个`timestamp`字段）。

## 四、通用功能模板（CRUD + 权限，带设计思路）

### 1. 实体类模板（BaseEntity.java）

java

运行

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

#### 重点：审计字段自动填充（可选扩展）

如果需要 MyBatis-Plus 自动填充`createTime`、`updateUser`等字段，可添加填充处理器：

java

运行

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

⚠️ 避坑点：自动填充需配合`@TableField(fill = FieldFill.INSERT)`注解，且填充处理器必须加`@Component`注解交给 Spring 管理。

### 2. 新增功能模板（Controller 层）

java

运行

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

#### 设计思路：

- 密码加密：MD5 是不可逆加密，即使数据库泄露，密码也无法还原（生产环境可改用 BCrypt，支持盐值）；
- 审计字段：谁创建 / 修改的数据谁负责，便于后续追溯和权限审计；
- 泛型复用：将`Employee`改为泛型``，可复用为其他实体的新增接口（如菜品、套餐）。

⚠️ 避坑点：MD5 加密时需注意字符编码（默认 UTF-8），前后端编码一致，否则密码比对失败。

### 3. 分页查询模板（Controller 层）

java

运行

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

#### 深度解析：

- `LambdaQueryWrapper`：通过方法引用（`Employee::getName`）指定字段，避免硬编码字段名（如`"name"`），减少拼写错误；
- 分页结果：`Page`对象包含`total`（总记录数）和`records`（当前页数据），前端可直接用于分页控件渲染；
- 条件优化：`StringUtils.isNotEmpty(name)`避免`name`为`null`或空字符串时，生成`like '%%'`查询所有数据。

### 4. 登录 / 退出功能（权限核心）

#### （1）登录接口

java

运行

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

#### （2）退出接口

java

运行

```java
@PostMapping("/logout")
public R<String> logout(HttpServletRequest request) {
    // 清除Session中的员工ID，销毁登录状态
    request.getSession().removeAttribute("employee");
    return R.success("退出成功");
}
```

#### 权限逻辑：

- 登录状态存储：Session 是服务器端存储，基于 Cookie 的 JSESSIONID 识别用户，适合单体应用；分布式应用需改用 Redis 存储登录状态；
- 账号禁用校验：`status=0`表示禁用，避免禁用账号登录系统；
- 密码比对：前端传递明文密码，后端加密后与数据库中加密密码比对，确保传输安全（生产环境需配合 HTTPS）。

## 五、高频避坑点汇总（⚠️ 重点标记）

| 问题现象                                                     | 根本原因                                                     | 解决方案                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 前端页面空白，控制台 404                                     | 静态资源映射未配置或路径错误                                 | 检查`WebMvcConfig`的`addResourceHandlers`，确保路径映射正确（`/backend/**`→`classpath:/backend/`） |
| Long 类型 ID 前端显示错误（如 1420038345634918401→1420038345634918400） | JS Number 类型精度限制                                       | 启用`JacksonObjectMapper`转换器，Long 转为 String            |
| 分页查询返回所有数据，分页失效                               | 未配置 MyBatis-Plus 分页插件                                 | 在`MybatisPlusConfig`中注册`PaginationInnerInterceptor`      |
| 新增重复用户名报错 “未知错误”                                | SQL 唯一约束异常未处理                                       | 全局异常处理器捕获`SQLIntegrityConstraintViolationException`，解析错误信息 |
| 过滤器不生效                                                 | 未添加`@ServletComponentScan`注解                            | 在引导类添加`@ServletComponentScan`，扫描`@WebFilter`注解    |
| 自动填充字段为 null                                          | 未配置 MetaObjectHandler 或注解错误                          | 检查`@TableField(fill = FieldFill.INSERT)`注解和填充处理器的`@Component` |
| Maven 依赖冲突                                               | 核心依赖版本不匹配（如 SpringBoot 2.6 + 与 MyBatis-Plus 3.4.x） | 锁定依赖版本，排除冲突依赖（如 MyBatis-Plus 排除 mybatis 依赖） |

## 六、核心收获与后续扩展

### 1. 深度收获

- 掌握 SpringBoot+MyBatis-Plus 的项目搭建流程，理解自动配置、依赖管理的底层逻辑；
- 学会通用组件设计（统一返回、全局异常、过滤器），减少重复编码，提升项目可维护性；
- 解决实战高频问题（精度丢失、分页失效、权限拦截），形成 “问题→原因→解决方案” 的思维模式；
- 理解分层架构思想（Controller→Service→Mapper），明确各层职责（Controller 接收请求，Service 处理业务，Mapper 操作数据库）。

### 2. 后续扩展方向

- 权限升级：用 SpringSecurity 或 Shiro 替代过滤器，支持多角色权限控制（如管理员 vs 普通员工）；
- 分布式扩展：用 Redis 存储登录状态和分布式锁，适配集群部署；
- 性能优化：添加缓存（Redis）减少数据库查询，批量操作替代循环单条操作；
- 功能扩展：基于当前架构开发菜品管理、套餐管理、订单管理等功能（复用 CRUD 模板和通用组件）。

  







# 瑞吉外卖 Day01-02 核心知识点 5 道中大厂面试题（含场景 + 参考答案）

## 面试题 1（组件设计 + 规范）

### 场景

面试官：“瑞吉外卖项目中定义了统一返回类`R`和全局异常处理器`GlobalExceptionHandler`，请回答以下问题：”

### 问题

1. 设计`R`类时，为什么采用泛型 + 静态工厂方法的设计？相比直接返回 Map 有哪些优势？
2. 全局异常处理器中，`@RestControllerAdvice`注解的作用是什么？异常匹配的优先级是什么？
3. 若新增 “参数格式错误”（`MethodArgumentNotValidException`）的业务场景，如何扩展全局异常处理器？写出核心代码片段。

------

## 面试题 2（权限控制 + 过滤器）

### 场景

面试官：“瑞吉外卖通过`LoginCheckFilter`实现登录权限拦截，请结合代码逻辑回答：”

### 问题

1. 过滤器的核心执行流程是什么？如何实现 “白名单路径放行”？`AntPathMatcher`的作用是什么？
2. 为什么必须在引导类添加`@ServletComponentScan`注解？若过滤器不生效，可能的排查方向有哪些？
3. 该过滤器仅校验了管理端（员工）的登录状态，若需同时支持用户端（消费者）登录校验（Session 中存储`user`标识），如何修改核心逻辑？

------

## 面试题 3（前后端交互 + 数据兼容）

### 场景

面试官：“瑞吉外卖中`JacksonObjectMapper`解决了 Long 类型 ID 精度丢失问题，请深入回答：”

### 问题

1. JS 中 Number 类型的精度限制是什么？Long 类型 ID 精度丢失的根源是什么？
2. `JacksonObjectMapper`除了处理 Long 转 String，还实现了哪些功能？核心配置`FAIL_ON_UNKNOWN_PROPERTIES=false`的作用是什么？
3. 若前端需要将日期格式改为`yyyy-MM-dd`，如何修改转换器？除了 Jackson，还有哪些方式能解决 Long 精度丢失问题？

------

## 面试题 4（ORM 框架 + 实操避坑）

### 场景

面试官：“瑞吉外卖使用 MyBatis-Plus 简化持久层操作，请结合分页查询和审计字段自动填充回答：”

### 问题

1. 分页插件`PaginationInnerInterceptor`的底层工作原理是什么？若分页查询返回所有数据（分页失效），可能的原因有哪些？
2. 审计字段（createTime、updateUser）的自动填充需要哪些核心步骤？`@TableField(fill = FieldFill.INSERT)`注解的作用是什么？
3. 对比`LambdaQueryWrapper`和普通`QueryWrapper`，前者的优势是什么？使用时需要注意什么？

------

## 面试题 5（架构复用 + 功能扩展）

### 场景

面试官：“基于瑞吉外卖现有架构（统一返回、全局异常、CRUD 模板），需新增‘菜品管理’功能（包含新增、分页查询、修改状态），请回答：”

### 问题

1. 如何复用现有`R`类、全局异常处理器和 CRUD 模板？需新增哪些核心组件（实体类、Mapper、Service）？
2. 菜品管理需额外存储 “分类 ID”“售价”“图片 URL” 等字段，如何设计实体类才能复用`BaseEntity`的审计字段？
3. 若新增菜品时需校验 “分类 ID 必须存在”，如何结合自定义业务异常`BusinessException`实现？写出核心代码片段。

------

# 参考答案

## 面试题 1 参考答案

### 1. 泛型 + 静态工厂方法的设计思路与优势

- 设计思路：
  - 泛型``：适配任意响应数据类型（String、Page、实体类），避免为不同返回类型定义多个返回类（如`ResultString`、`ResultPage`）；
  - 静态工厂方法（`success()`/`error()`）：简化调用语法（`return R.success(data)` vs `new R<>(1, null, data)`），隐藏对象创建细节，统一响应码规范（1 = 成功，0 = 失败）。
- 相比 Map 的优势：
  1. 类型安全：避免 Map 的 “键名拼写错误”“值类型转换异常”（如 Map.get ("data") 需手动强转）；
  2. 规范统一：强制响应格式包含`code`/`msg`/`data`，避免前端处理逻辑混乱；
  3. 扩展性强：内置动态`map`字段，支持额外返回多组数据，无需修改类结构。

### 2. `@RestControllerAdvice`作用与异常匹配优先级

- `@RestControllerAdvice`作用：= `@ControllerAdvice` + `@ResponseBody`，全局拦截标注`@RestController`/`@Controller`的类的异常，统一封装响应格式（如`R.error(msg)`），避免直接抛出异常给前端。
- 异常匹配优先级：**具体异常（如`SQLIntegrityConstraintViolationException`）> 自定义异常（如`BusinessException`）> 父类异常（`Exception`）**，遵循 “精准匹配优先” 原则。

### 3. 扩展 “参数格式错误” 异常处理

java

运行

```java
// 全局异常处理器中新增方法
@ExceptionHandler(MethodArgumentNotValidException.class)
public R<String> handleParamValidException(MethodArgumentNotValidException ex) {
    log.error("参数格式错误：{}", ex.getMessage());
    // 提取字段校验失败信息（如@NotBlank标注的字段为空）
    String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("，"));
    return R.error("参数错误：" + msg);
}
```

------

## 面试题 2 参考答案

### 1. 过滤器核心流程 + 白名单实现 + AntPathMatcher 作用

- 核心流程：

  ```
  初始化（init） 
  ```

  ```
  拦截请求（doFilter）→ 
  ```

  ```
  销毁（destroy）
  ```

  ；其中

  ```
  doFilter
  ```

  的核心逻辑：

  1. 获取请求 URI → 2. 校验是否在白名单 → 3. 白名单则放行 → 4. 非白名单则校验 Session 中的登录标识 → 5. 已登录则放行 → 6. 未登录返回`NOTLOGIN`。

- 白名单实现：定义无需拦截的路径数组（如`/employee/login`、`/backend/**`），通过`AntPathMatcher`的`match()`方法判断当前请求 URI 是否匹配白名单路径。

- `AntPathMatcher`作用：支持 Ant 风格通配符（`/**`匹配多级目录，`*`匹配单级目录），解决固定路径无法匹配动态前缀的问题（如`/backend/js/login.js`可被`/backend/**`匹配）。

### 2. `@ServletComponentScan`的作用 + 过滤器失效排查

- `@ServletComponentScan`作用：SpringBoot 默认不扫描`@WebFilter`/`@WebServlet`/`@WebListener`注解，该注解用于指定扫描包路径，让 SpringBoot 识别并注册过滤器实例。
- 过滤器失效排查方向：
  1. 引导类未加`@ServletComponentScan`注解；
  2. 过滤器的`urlPatterns`配置错误（如写成`/employee/*`，未覆盖所有请求）；
  3. 过滤器顺序问题（被其他过滤器拦截）；
  4. 白名单路径配置错误（如遗漏`/backend/**`，导致静态资源被拦截）。

### 3. 扩展用户端登录校验逻辑

修改`LoginCheckFilter`的登录状态校验步骤，新增用户端`user`标识判断：

java

```java
// 原校验逻辑后新增
// 3. 校验用户端登录状态（Session中是否存在userID）
if (request.getSession().getAttribute("user") != null) {
    chain.doFilter(request, response);
    return;
}
```

------

## 面试题 3 参考答案

### 1. JS Number 精度限制 + Long 精度丢失根源

- JS Number 精度限制：JS 的`Number`类型基于 64 位双精度浮点型实现，最大安全整数为`2^53`（9007199254740992），超出该范围的整数无法精确表示。
- 精度丢失根源：Java 中`Long`类型的取值范围（-9223372036854775808~9223372036854775807）远超`2^53`，当 Long 类型 ID（如 1420038345634918401）通过 JSON 序列化传递给前端时，JS 无法精确解析，导致末尾数字被截断。

### 2. JacksonObjectMapper 的额外功能 + 核心配置作用

- 额外功能：
  1. 日期时间格式化：将`LocalDateTime`统一序列化为`yyyy-MM-dd HH:mm:ss`格式，避免前后端日期格式不一致；
  2. 忽略未知字段：通过`configure(FAIL_ON_UNKNOWN_PROPERTIES, false)`避免前端传递多余字段（如`timestamp`）导致接口报错。
- `FAIL_ON_UNKNOWN_PROPERTIES=false`作用：当 JSON 字符串中存在 Java 实体类未定义的字段时，Jackson 不会抛出`UnrecognizedPropertyException`，而是直接忽略该字段，提升接口兼容性。

### 3. 日期格式修改 + 其他精度丢失解决方案

- 修改日期格式为

  ```
  yyyy-MM-dd
  ```

  ：

  java

  ```java
  // JacksonObjectMapper中修改日期格式化模板
  public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
  // 替换日期序列化/反序列化器
  .addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))
  .addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)));
  ```

- 其他精度丢失解决方案：

  1. 后端返回时主动将 Long 转为 String（如在 DTO 中定义 ID 为 String 类型）；
  2. 前端使用`BigInt`类型接收 ID（兼容超大整数）；
  3. 数据库 ID 改用`String`类型（如 UUID），避免使用 Long 类型。

------

## 面试题 4 参考答案

### 1. 分页插件原理 + 分页失效排查

- 底层原理：`PaginationInnerInterceptor`是 MyBatis-Plus 的核心拦截器，通过拦截`Executor`的`query`方法，自动拼接`LIMIT`语句（实现分页）和`COUNT(*)`语句（统计总记录数），最终将结果封装到`Page`对象中。
- 分页失效排查方向：
  1. 未配置分页插件或配置错误（如未指定`DbType.MYSQL`）；
  2. 调用`service.list()`而非`service.page()`方法；
  3. 分页参数传递错误（如`page`从 0 开始，前端传递 1 导致逻辑错误）；
  4. MyBatis-Plus 版本与 SpringBoot 版本不兼容（如 SpringBoot 2.6 + 与 MyBatis-Plus 3.4.x 冲突）。

### 2. 审计字段自动填充步骤 + 注解作用

- 核心步骤：
  1. 实体类字段添加`@TableField(fill = FieldFill.INSERT)`/`FieldFill.INSERT_UPDATE`注解，指定填充时机；
  2. 实现`MetaObjectHandler`接口，重写`insertFill()`和`updateFill()`方法，定义填充逻辑（如当前时间、登录员工 ID）；
  3. 给填充处理器添加`@Component`注解，交给 Spring 管理。
- `@TableField(fill = FieldFill.INSERT)`作用：标记该字段在 “插入数据时” 由 MyBatis-Plus 自动填充，无需手动设置值。

### 3. LambdaQueryWrapper 优势 + 注意事项

- 优势：
  1. 类型安全：通过方法引用（`Employee::getName`）指定字段，避免硬编码字段名（如`"name"`）导致的拼写错误；
  2. 编译期校验：若字段名修改（如`name`改为`username`），编译时会直接报错，便于排查；
  3. 代码简洁：无需手动拼接字段名，可读性更高。
- 注意事项：
  1. 仅支持实体类中存在的字段，不支持数据库函数（如`DATE_FORMAT(create_time, '%Y-%m-%d')`）；
  2. 模糊查询（`like`）时需手动判断参数非空，避免生成`like '%%'`导致全表扫描。

------

## 面试题 5 参考答案

### 1. 组件复用 + 新增核心组件

- 组件复用：
  1. 直接复用`R`类作为响应结果；
  2. 全局异常处理器无需修改，自动捕获 SQL 异常、业务异常等；
  3. 复用 CRUD 模板（新增、分页、更新），仅需替换实体类为`Dish`。
- 新增核心组件：
  1. 实体类`Dish`（继承`BaseEntity`，包含`categoryId`、`price`、`image`等字段）；
  2. Mapper 接口`DishMapper`（继承`BaseMapper`）；
  3. Service 接口`DishService`（继承`IService`）及实现类`DishServiceImpl`；
  4. Controller 类`DishController`（复用 CRUD 模板方法）。

### 2. 实体类设计（复用 BaseEntity）

java

```java
@Data
public class Dish extends BaseEntity {
    private static final long serialVersionUID = 1L;

    // 菜品名称
    private String name;
    // 分类ID（额外业务字段）
    private Long categoryId;
    // 售价（额外业务字段）
    private BigDecimal price;
    // 图片URL（额外业务字段）
    private String image;
    // 状态（0禁用，1启用）
    private Integer status;
    // 描述
    private String description;
}
```

- 设计思路：通过继承`BaseEntity`，直接复用`id`、`createTime`、`updateUser`等审计字段，无需重复定义。

### 3. 分类 ID 校验 + 自定义业务异常

- 核心代码片段：

java

```java
// 1. 自定义业务异常（已存在，直接使用）
// public class BusinessException extends RuntimeException {
//     public BusinessException(String message) {
//         super(message);
//     }
// }

// 2. DishService中新增分类存在校验方法
@Resource
private CategoryMapper categoryMapper;

public void checkCategoryExists(Long categoryId) {
    Category category = categoryMapper.selectById(categoryId);
    if (category == null) {
        throw new BusinessException("分类ID不存在，无法新增菜品");
    }
}

// 3. DishController新增方法中调用校验
@PostMapping
public R<String> save(HttpServletRequest request, @RequestBody Dish dish) {
    log.info("新增菜品：{}", dish);
    // 校验分类ID是否存在
    dishService.checkCategoryExists(dish.getCategoryId());
    
    // 复用原有审计字段填充、保存逻辑
    dish.setCreateTime(LocalDateTime.now());
    dish.setUpdateTime(LocalDateTime.now());
    dish.setCreateUser((Long) request.getSession().getAttribute("employee"));
    dish.setUpdateUser((Long) request.getSession().getAttribute("employee"));
    
    dishService.save(dish);
    return R.success("新增菜品成功");
}
```

- 逻辑说明：通过自定义`BusinessException`抛出业务异常，全局异常处理器自动捕获并返回`R.error("分类ID不存在，无法新增菜品")`，保证响应格式统一。