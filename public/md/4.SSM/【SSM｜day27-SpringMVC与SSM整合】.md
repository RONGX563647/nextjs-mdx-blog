# 📚 SSM Day27 - SpringMVC 与 SSM 整合

> 💡 **SpringMVC 是 Spring 生态中的 Web 框架，通过 MVC 架构实现前后端分离。** 本文深入解析 SSM 整合、统一结果封装、异常处理、拦截器、前后端联调等核心内容，帮你掌握企业级 Web 开发的关键技能。

---

## 🎯 快速回顾

- **🔧 SSM 整合**：Spring 容器统一管控三层组件（Controller、Service、Dao）
- **📦 组件扫描**：Spring 扫描 Service/Dao，SpringMVC 扫描 Controller
- **🎁 统一结果封装**：Result 类统一响应格式，支持泛型和序列化定制
- **⚠️ 统一异常处理**：@RestControllerAdvice + @ExceptionHandler 实现全局异常处理
- **🛡️ 拦截器**：HandlerInterceptor 实现 preHandle、postHandle、afterCompletion
- **🌐 前后端联调**：跨域配置、文件上传、JWT Token 校验

---

## 📑 目录

- [一、SSM 整合](#一ssm-整合)
  - [1. 组件扫描与 Bean 生命周期管控](#1-组件扫描与-bean-生命周期管控)
  - [2. MyBatis 代理对象生成与注入](#2-mybatis-代理对象生成与注入)
  - [3. 事务管理的底层实现](#3-事务管理的底层实现)
  - [4. 整合坑点与排查技巧](#4-整合坑点与排查技巧)
- [二、统一结果封装](#二统一结果封装)
  - [1. 序列化定制](#1-序列化定制)
  - [2. 泛型适配与 Swagger 联动](#2-泛型适配与-swagger-联动)
- [三、统一异常处理](#三统一异常处理)
  - [1. 完整分级异常体系](#1-完整分级异常体系)
  - [2. 异常处理器](#2-异常处理器)
- [四、拦截器](#四拦截器)
  - [1. 拦截器执行流程](#1-拦截器执行流程)
  - [2. 分布式限流](#2-分布式限流)
- [五、前后台联调](#五前后台联调)
  - [1. 跨域问题](#1-跨域问题)
  - [2. 文件上传](#2-文件上传)
  - [3. JWT Token 校验](#3-jwt-token-校验)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、SSM 整合

#### 1. 组件扫描与 Bean 生命周期管控

SSM 整合的核心是 **Spring IoC 容器对三层组件的统一管控**，其底层依赖组件扫描、动态代理、切面织入等机制。

**（1）Bean 重复加载的底层规避**

Spring 配置类需精确扫描业务根包，排除 Controller 避免与 SpringMVC 重复加载：

```java
@Configuration
// 精确扫描业务根包，排除Controller避免与SpringMVC重复加载
@ComponentScan(
    value = "com.itheima",
    excludeFilters = {
        @ComponentScan.Filter(
            type = FilterType.ANNOTATION,
            classes = Controller.class
        )
    }
)
public class SpringConfig {
}
```

对应的 SpringMVC 配置类需明确扫描 Controller，形成容器分工：

```java
@Configuration
@EnableWebMvc
@ComponentScan(value = "com.itheima", includeFilters = {
    @ComponentScan.Filter(
        type = FilterType.ANNOTATION,
        classes = Controller.class
    )
})
public class SpringMvcConfig {
}
```

**避坑建议**：
1. 扫描范围忌过宽：若 Spring 配置类扫描范围写 `com`，可能加载到依赖包中的 Bean，导致内存溢出或冲突。
2. 避免注解混用：若 Controller 同时标注 `@Service`，即使排除 `@Controller`，仍会被 Spring 容器扫描。

#### 2. MyBatis 代理对象生成与注入

Mapper 接口的动态代理依赖 `MapperScannerConfigurer`，以下补充完整配置：

**（1）配置 Mapper 扫描**

```java
@Configuration
public class MyBatisConfig {
    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer scanner = new MapperScannerConfigurer();
        scanner.setBasePackage("com.itheima.mapper");
        scanner.setSqlSessionFactoryBeanName("sqlSessionFactory");
        return scanner;
    }
}
```

**（2）底层代理逻辑拆解**

Mapper 代理的核心是 `MapperFactoryBean`，其 `getObject()` 方法最终调用 MyBatis 的 `MapperProxyFactory` 生成代理对象：

```java
// MyBatis-Spring 核心类简化逻辑
public class MapperFactoryBean<T> implements FactoryBean<T> {
    private Class<T> mapperInterface;
    private SqlSession sqlSession;

    @Override
    public T getObject() throws Exception {
        return sqlSession.getMapper(mapperInterface);
    }

    @Override
    public Class<T> getObjectType() {
        return mapperInterface;
    }
}
```

**避坑建议**：
1. 接口命名忌冲突：若两个 Mapper 接口同名（不同包），`MapperScannerConfigurer` 会优先注册后扫描到的 Bean。
2. 禁用默认接口方法：Java 8+ 的接口默认方法无法被 MyBatis 代理。

#### 3. 事务管理的底层实现

`@Transactional` 的底层是 AOP 动态代理，以下补充不同场景的事务配置。

**（1）完整事务配置**

```java
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

**（2）多场景事务代码示例**

```java
@Service
public class BookService {
    // 场景1：嵌套事务，子事务独立提交/回滚
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void updateBookStock(Integer bookId, Integer num) throws Exception {
        if (num < 0) {
            throw new Exception("库存不能为负数");
        }
    }

    // 场景2：只读事务，优化查询性能
    @Transactional(readOnly = true)
    public Object getBookById(Integer id) {
        return null;
    }
}
```

**（3）高频事务失效案例与修复**

| 失效场景       | 错误代码                                                     | 修复方案                                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 非 public 方法 | `@Transactional private void deductStock() {}`               | 改为 public 方法                                             |
| 同类方法调用   | `public void buyBook() { deductStock(); }`                  | 通过 AopContext 获取代理对象：`((BookService)AopContext.currentProxy()).deductStock()` |
| 异常类型不匹配 | `@Transactional public void deductStock() { try { } catch (Exception e) {} }` | 抛出 RuntimeException 或指定异常：`@Transactional(rollbackFor = Exception.class)` |

#### 4. 整合坑点与排查技巧

| 问题                 | 底层原因                           | 进阶排查方案                                                 |
| -------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Mapper 注入失败      | Mapper 代理对象未注册到容器        | 打印容器中 Bean 名称：`applicationContext.getBeanDefinitionNames()` |
| 数据源连接超时       | 连接池参数不合理，如最大连接数过小 | 配置 Druid 监控：`spring.datasource.druid.stat-view-servlet.enabled=true` |
| 事务提交后数据未更新 | 多数据源场景下事务管理器未指定     | 明确绑定数据源：`@Transactional(transactionManager = "bookDataSourceTransactionManager")` |

---

### 二、统一结果封装

#### 1. 序列化定制

统一结果类需兼顾序列化规范、类型安全与多端适配。

**（1）增强版 Result 类（含状态码枚举）**

```java
@Data
public class Result<T> {
    public enum Code {
        SUCCESS(20000, "操作成功"),
        GET_ERR(20040, "查询失败"),
        SYSTEM_ERR(50000, "系统异常");

        private final Integer code;
        private final String msg;

        Code(Integer code, String msg) {
            this.code = code;
            this.msg = msg;
        }
    }

    private Integer code;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime timestamp;
    private T data;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String msg;

    private Result(Integer code, T data, String msg) {
        this.code = code;
        this.data = data;
        this.msg = msg;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(Code.SUCCESS.code, data, Code.SUCCESS.msg);
    }

    public static <T> Result<T> error(Integer code, String msg) {
        return new Result<>(code, null, msg);
    }
}
```

**（2）全局序列化配置**

```java
@Configuration
public class JacksonConfig {
    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        JavaTimeModule timeModule = new JavaTimeModule();
        timeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        ));
        objectMapper.registerModule(timeModule);
        objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        return new MappingJackson2HttpMessageConverter(objectMapper);
    }
}
```

**避坑建议**：
1. 禁用空对象序列化：若 Result 中 data 为某个空对象，未禁用 `FAIL_ON_EMPTY_BEANS` 会抛出序列化异常。
2. 时间戳时区统一：前端若显示时间偏差，大概率是未指定 `timezone = "GMT+8"`。

#### 2. 泛型适配与 Swagger 联动

```java
@RestController
@RequestMapping("/books")
public class BookController {
    @GetMapping("/{id}")
    public Result<Book> getById(@PathVariable Integer id) {
        Book book = new Book(id, "Spring实战", 59.9);
        return book != null ? Result.success(book) : Result.error(Result.Code.GET_ERR.code, "图书不存在");
    }

    @Data
    static class Book {
        private Integer id;
        private String name;
        private Double price;
    }
}
```

**避坑建议**：
1. Swagger 需指定泛型类型：若直接标注 `@Schema(implementation = Result.class)`，文档中 data 字段类型会显示为 Object。
2. 避免泛型擦除问题：若返回 `Result` 而非 `Result`，前端解析时可能无法识别 data 结构。

---

### 三、统一异常处理

#### 1. 完整分级异常体系

```java
public abstract class BaseException extends RuntimeException {
    private final Integer code;

    public BaseException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }
}

public class SystemException extends BaseException {
    public SystemException(Integer code, String message) {
        super(code, message);
    }

    public static SystemException DB_CONN_ERR() {
        return new SystemException(50001, "数据库连接失败");
    }
}

public class BusinessException extends BaseException {
    public BusinessException(Integer code, String message) {
        super(code, message);
    }
}
```

#### 2. 异常处理器

```java
@RestControllerAdvice
@Slf4j
public class ProjectExceptionAdvice {
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String DING_TALK_URL = "https://oapi.dingtalk.com/robot/send?access_token=xxx";

    @ExceptionHandler(SystemException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleSystemException(SystemException ex) {
        log.error("系统异常：{}", ex.getMessage(), ex);
        sendDingTalkMsgWithRetry("系统异常：" + ex.getMessage());
        return Result.error(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException ex) {
        log.warn("业务异常：{}", ex.getMessage());
        return Result.error(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception ex) {
        log.error("未知异常：", ex);
        sendDingTalkMsgWithRetry("未知异常：" + ex.getMessage());
        return Result.error(Result.Code.SYSTEM_ERR.code, "系统繁忙，请稍后再试");
    }

    private void sendDingTalkMsgWithRetry(String content) {
        int retryCount = 3;
        for (int i = 0; i < retryCount; i++) {
            try {
                Map<String, Object> msg = new HashMap<>();
                msg.put("msgtype", "text");
                Map<String, String> text = new HashMap<>();
                text.put("content", content);
                msg.put("text", text);
                restTemplate.postForObject(DING_TALK_URL, msg, String.class);
                return;
            } catch (Exception e) {
                log.error("预警发送失败，重试第{}次", i + 1, e);
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        log.error("预警发送失败，已达最大重试次数");
    }
}
```

**避坑建议**：
1. 日志级别区分：业务异常用 `warn` 级别，系统异常用 `error` 级别。
2. 预警加重试与熔断：若钉钉接口临时不可用，无重试机制会导致预警丢失。

---

### 四、拦截器

#### 1. 拦截器执行流程

通过日志直观展示 `preHandle`、`postHandle`、`afterCompletion` 的执行顺序：

```java
@Slf4j
public class LogInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        log.info("【LogInterceptor】preHandle：请求路径{}", request.getRequestURI());
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        log.info("【LogInterceptor】postHandle：请求路径{}", request.getRequestURI());
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        log.info("【LogInterceptor】afterCompletion：请求路径{}", request.getRequestURI());
    }
}
```

**配置拦截器**：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor())
            .addPathPatterns("/**")
            .excludePathPatterns("/login", "/register");
    }
}
```

#### 2. 分布式限流

使用 Redis + Lua 脚本实现分布式限流：

```java
@Component
public class RateLimiterInterceptor implements HandlerInterceptor {
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String key = "rate_limit:" + request.getRequestURI();
        Long count = redisTemplate.opsForValue().increment(key);
        if (count == 1) {
            redisTemplate.expire(key, 1, TimeUnit.MINUTES);
        }
        if (count > 100) {
            response.setStatus(429);
            return false;
        }
        return true;
    }
}
```

---

### 五、前后台联调

#### 1. 跨域问题

**（1）错误配置复现**

前端请求：`http://localhost:8080/books`，后端地址：`http://localhost:8081`，浏览器会报跨域错误。

**（2）修复方案**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:8080")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

#### 2. 文件上传

**（1）完整实现**

```java
@RestController
@RequestMapping("/upload")
public class UploadController {
    @PostMapping
    public Result<String> upload(MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error(Result.Code.GET_ERR.code, "文件为空");
        }
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;
        String path = "/Users/rongx/Desktop/uploads/" + newFilename;
        try {
            file.transferTo(new File(path));
            return Result.success(newFilename);
        } catch (IOException e) {
            return Result.error(Result.Code.SYSTEM_ERR.code, "文件上传失败");
        }
    }
}
```

**（2）异常处理**

```java
@ExceptionHandler(MaxUploadSizeExceededException.class)
public Result<Void> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
    return Result.error(Result.Code.GET_ERR.code, "文件大小超过限制");
}
```

#### 3. JWT Token 校验

**（1）JWT 工具类**

```java
@Component
public class JwtUtil {
    private static final String SECRET_KEY = "itheima";
    private static final long EXPIRATION = 7 * 24 * 60 * 60 * 1000;

    public String generateToken(String username) {
        return Jwts.builder()
            .setSubject(username)
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
            .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
            .compact();
    }

    public String parseToken(String token) {
        return Jwts.parser()
            .setSigningKey(SECRET_KEY)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
```

**（2）Token 校验拦截器**

```java
@Component
public class TokenInterceptor implements HandlerInterceptor {
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null) {
            response.setStatus(401);
            return false;
        }
        try {
            String username = jwtUtil.parseToken(token);
            request.setAttribute("username", username);
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            return false;
        }
    }
}
```

---

## ❓ 问答

### Q1：SSM 整合的核心是什么？

**A**：SSM 整合的核心是 **Spring IoC 容器对三层组件的统一管控**：
- Spring 容器扫描 Service 和 Dao 层组件
- SpringMVC 容器扫描 Controller 层组件
- MyBatis 通过 MapperScannerConfigurer 生成 Mapper 代理对象并注入到 Spring 容器

### Q2：@Transactional 事务失效的常见原因有哪些？

**A**：
1. 非 public 方法
2. 同类方法调用（AOP 无法拦截）
3. 异常类型不匹配（默认仅 RuntimeException 回滚）
4. 异常被捕获未抛出

### Q3：如何实现统一异常处理？

**A**：使用 `@RestControllerAdvice` + `@ExceptionHandler`：
```java
@RestControllerAdvice
public class ProjectExceptionAdvice {
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception ex) {
        return Result.error(Result.Code.SYSTEM_ERR.code, "系统繁忙");
    }
}
```

### Q4：拦截器的执行顺序是什么？

**A**：
1. `preHandle`：按拦截器配置顺序执行
2. `postHandle`：按拦截器配置逆序执行
3. `afterCompletion`：按拦截器配置逆序执行

### Q5：如何解决跨域问题？

**A**：通过 `WebMvcConfigurer` 配置 CORS：
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:8080")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

---

## 💡 学习建议

1. **理解整合原理**：重点理解 SSM 整合的核心是 Spring 容器统一管控三层组件。
2. **掌握统一封装**：重点掌握统一结果封装和统一异常处理的实现方式。
3. **动手实践**：通过编写案例加深理解，特别是拦截器和文件上传的使用。
4. **关注底层**：了解 SpringMVC 的底层实现（DispatcherServlet、HandlerMapping、HandlerAdapter）。
5. **面试准备**：重点掌握 SSM 整合、事务失效、统一异常处理等面试高频点。

---

> **🎯 下一步学习**：Day28 将深入讲解 SSM 项目实战，包括图书管理系统、前后端联调、部署上线等核心内容。
