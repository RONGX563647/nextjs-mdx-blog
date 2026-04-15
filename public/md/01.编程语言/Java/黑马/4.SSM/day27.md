# 【SSM 框架 ｜ day27 spring MVC】

## 一、SSM 整合：从配置到底层协同原理（深化代码 + 底层剖析）

SSM 整合的核心是 **Spring IoC 容器对三层组件的统一管控**，其底层依赖组件扫描、动态代理、切面织入等机制。以下结合核心代码拆解原理，并补充关键避坑点。

### 1. 组件扫描与 Bean 生命周期管控（代码深化 + 避坑）

#### （1）Bean 重复加载的底层规避（代码细化 + 调试技巧）

原文的配置类可进一步补充注解解析逻辑，并添加调试手段，同时点明易踩的扫描范围坑。

java

```java
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;

/**
 * Spring 核心配置类
 * 避坑点：扫描范围若写"com"会导致第三方包被误扫描，建议精确到项目业务包
 */
@Configuration
// 精确扫描业务根包，排除Controller避免与SpringMVC重复加载
@ComponentScan(
        value = "com.itheima",
        excludeFilters = {
                // 排除Controller注解
                @ComponentScan.Filter(
                        type = FilterType.ANNOTATION,
                        classes = Controller.class
                ),
                // 可选：排除测试类等非核心组件
                @ComponentScan.Filter(
                        type = FilterType.REGEX,
                        pattern = "com.itheima.*.test.*"
                )
        }
)
public class SpringConfig {
    // 可添加BeanPostProcessor打印Bean加载日志，排查重复加载
    /*@Bean
    public BeanPostProcessor myBeanPostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessBeforeInitialization(Object bean, String beanName) {
                System.out.println("加载Bean：" + beanName);
                return bean;
            }
        };
    }*/
}
```

对应的 SpringMVC 配置类需明确扫描 Controller，形成容器分工：

java

```java
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/**
 * SpringMVC配置类，仅扫描Controller
 */
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

**避坑建议**

1. 扫描范围忌过宽：若 Spring 配置类扫描范围写 `com`，可能加载到依赖包中的 Bean，导致内存溢出或冲突，必须精确到项目包（如 `com.itheima`）。
2. 避免注解混用：若 Controller 同时标注 `@Service`，即使排除 `@Controller`，仍会被 Spring 容器扫描，需严格遵循分层注解规范。

#### （2）MyBatis 代理对象生成与注入（完整代码 + 源码关联）

Mapper 接口的动态代理依赖 `MapperScannerConfigurer`，以下补充完整配置，并关联 MyBatis 与 Spring 的衔接代码。

1. 配置 Mapper 扫描

   java

   ```java
   import org.mybatis.spring.mapper.MapperScannerConfigurer;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   
   @Configuration
   public class MyBatisConfig {
       @Bean
       public MapperScannerConfigurer mapperScannerConfigurer() {
           MapperScannerConfigurer scanner = new MapperScannerConfigurer();
           // 扫描Mapper接口所在包
           scanner.setBasePackage("com.itheima.mapper");
           // 关联SqlSessionFactory（Spring会自动注入匹配的Bean）
           scanner.setSqlSessionFactoryBeanName("sqlSessionFactory");
           return scanner;
       }
   }
   ```

   

2. 底层代理逻辑拆解

   Mapper 代理的核心是

   ```
   MapperFactoryBean
   ```

   ，其 

   ```
   getObject()
   ```

   方法最终调用 MyBatis 的

   ```
   MapperProxyFactory
   ```

   生成代理对象，简化源码逻辑如下：

   java

   ```java
   // MyBatis-Spring 核心类简化逻辑
   public class MapperFactoryBean<T> implements FactoryBean<T> {
       private Class<T> mapperInterface;
       private SqlSession sqlSession;
   
       @Override
       public T getObject() throws Exception {
           // 生成Mapper代理对象
           return sqlSession.getMapper(mapperInterface);
       }
   
       @Override
       public Class<T> getObjectType() {
           return mapperInterface;
       }
   }
   ```

   

**避坑建议**

1. 接口命名忌冲突：若两个 Mapper 接口同名（不同包），`MapperScannerConfigurer` 会优先注册后扫描到的 Bean，导致前一个被覆盖，建议按 “业务模块 + 功能” 命名（如 `BookMapper`、`UserMapper`）。
2. 禁用默认接口方法：Java 8+ 的接口默认方法无法被 MyBatis 代理，若在 Mapper 中写 `default void test() {}`，调用时会抛出 `UnsupportedOperationException`。

### 2. 事务管理的底层实现（多场景代码 + 异常案例）

`@Transactional` 的底层是 AOP 动态代理，以下补充不同场景的事务配置，并剖析常见失效案例。

#### （1）完整事务配置

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement // 开启事务管理，注册事务切面
public class TransactionConfig {
    // 事务管理器依赖数据源
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

#### （2）多场景事务代码示例

java

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {

    // 场景1：嵌套事务，子事务独立提交/回滚
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void updateBookStock(Integer bookId, Integer num) throws Exception {
        // 库存扣减逻辑
        if (num < 0) {
            throw new Exception("库存不能为负数"); // 触发回滚
        }
        // jdbcTemplate.update("update book set stock = stock - ? where id = ?", num, bookId);
    }

    // 场景2：只读事务，优化查询性能
    @Transactional(readOnly = true)
    public Object getBookById(Integer id) {
        // 仅查询操作，设置readOnly=true后数据库会关闭写锁
        return null;
    }
}
```

#### （3）高频事务失效案例与修复

| 失效场景       | 错误代码                                                     | 修复方案                                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 非 public 方法 | `@Transactional private void deductStock() {}`               | 改为 public 方法：`@Transactional public void deductStock() {}` |
| 同类方法调用   | `public void buyBook() { // 同类调用，AOP无法拦截 deductStock(); } @Transactional public void deductStock() {}` | 通过 AopContext 获取代理对象：`public void buyBook() { ((BookService)AopContext.currentProxy()).deductStock(); }`需开启暴露代理：`@EnableAspectJAutoProxy(exposeProxy = true)` |
| 异常类型不匹配 | `@Transactional public void deductStock() { try { // 异常被捕获 } catch (Exception e) {} }` | 1. 抛出 RuntimeException 或指定异常：`@Transactional(rollbackFor = Exception.class)`2. 捕获后手动抛出：`catch (Exception e) {throw new RuntimeException(e);}` |

### 3. 整合坑点与排查技巧（补充日志与调试手段）

| 问题                 | 底层原因                           | 进阶排查方案                                                 |
| -------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Mapper 注入失败      | Mapper 代理对象未注册到容器        | 1. 打印容器中 Bean 名称：`applicationContext.getBeanDefinitionNames()`2. 检查 Mapper 接口是否加 `@Mapper` 或扫描配置正确 |
| 数据源连接超时       | 连接池参数不合理，如最大连接数过小 | 1. 配置 Druid 监控：`spring.datasource.druid.stat-view-servlet.enabled=true`2. 访问 `http://localhost:8080/druid` 查看连接池状态 |
| 事务提交后数据未更新 | 多数据源场景下事务管理器未指定     | 明确绑定数据源：`@Transactional(transactionManager = "bookDataSourceTransactionManager")` |

## 二、统一结果封装：序列化定制与多场景适配（代码细化 + 避坑）

统一结果类需兼顾序列化规范、类型安全与多端适配，以下补充完整工具类及序列化异常处理。

### 1. 序列化定制（完整 Result 类 + 全局配置）

#### （1）增强版 Result 类（含状态码枚举）

java

```java
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 全局统一结果类
 * 避坑点：泛型不可省略，否则前端解析会出现类型混乱
 */
@Data
public class Result<T> {
    // 状态码枚举，避免硬编码
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
    @JsonInclude(JsonInclude.Include.NON_NULL) // 空值不返回
    private String msg;

    // 私有构造，通过静态方法创建
    private Result(Integer code, T data, String msg) {
        this.code = code;
        this.data = data;
        this.msg = msg;
        this.timestamp = LocalDateTime.now();
    }

    // 成功响应（带数据）
    public static <T> Result<T> success(T data) {
        return new Result<>(Code.SUCCESS.code, data, Code.SUCCESS.msg);
    }

    // 失败响应（自定义消息）
    public static <T> Result<T> error(Integer code, String msg) {
        return new Result<>(code, null, msg);
    }
}
```

#### （2）全局序列化配置（解决 LocalDateTime 序列化异常）

java

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Configuration
public class JacksonConfig {
    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        JavaTimeModule timeModule = new JavaTimeModule();
        // 定制LocalDateTime序列化格式
        timeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        ));
        objectMapper.registerModule(timeModule);
        // 禁用空对象序列化
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS);
        return new MappingJackson2HttpMessageConverter(objectMapper);
    }
}
```

**避坑建议**

1. 禁用空对象序列化：若 Result 中 data 为某个空对象（如 `new Book()`），未禁用 `FAIL_ON_EMPTY_BEANS` 会抛出序列化异常，需在配置中显式关闭。
2. 时间戳时区统一：前端若显示时间偏差，大概率是未指定 `timezone = "GMT+8"`，或服务器时区与数据库时区不一致，建议统一设置为 UTC+8。

### 2. 泛型适配与 Swagger 联动（完整接口示例）

java

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/books")
public class BookController {

    @Operation(summary = "根据ID查询图书")
    @ApiResponses({
            @ApiResponse(responseCode = "20000", description = "查询成功",
                    content = @Content(schema = @Schema(implementation = Result.class))),
            @ApiResponse(responseCode = "20040", description = "图书不存在")
    })
    @GetMapping("/{id}")
    public Result<Book> getById(@PathVariable Integer id) {
        // 模拟查询
        Book book = new Book(id, "Spring实战", 59.9);
        return book != null ? Result.success(book) : Result.error(Result.Code.GET_ERR.code, "图书不存在");
    }

    // 静态内部类，模拟Book实体
    @Data
    static class Book {
        private Integer id;
        private String name;
        private Double price;

        public Book(Integer id, String name, Double price) {
            this.id = id;
            this.name = name;
            this.price = price;
        }
    }
}
```

**避坑建议**

1. Swagger 需指定泛型类型：若直接标注 `@Schema(implementation = Result.class)`，文档中 data 字段类型会显示为 Object，需结合 `@Schema(type = "object", ref = "#/components/schemas/Book")` 明确类型。
2. 避免泛型擦除问题：若返回 `Result` 而非 `Result`，前端解析时可能无法识别 data 结构，需严格指定泛型。

## 三、统一异常处理：异常体系与预警机制（代码补全 + 预警优化）

完善分级异常体系，并补充预警机制的异常处理、日志规范，避免预警功能引发次生问题。

### 1. 完整分级异常体系

java

```java
/**
 * 顶级异常，封装错误码和消息
 */
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

/**
 * 系统异常：数据库、缓存等底层问题
 */
public class SystemException extends BaseException {
    public SystemException(Integer code, String message) {
        super(code, message);
    }

    // 预定义常见系统异常
    public static SystemException DB_CONN_ERR() {
        return new SystemException(50001, "数据库连接失败");
    }

    public static SystemException CACHE_ERR() {
        return new SystemException(50002, "缓存服务异常");
    }
}

/**
 * 业务异常：用户操作、参数校验等问题
 */
public class BusinessException extends BaseException {
    public BusinessException(Integer code, String message) {
        super(code, message);
    }
}
```

### 2. 异常处理器（含预警重试机制）

java

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestControllerAdvice
@Slf4j
public class ProjectExceptionAdvice {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String DING_TALK_URL = "https://oapi.dingtalk.com/robot/send?access_token=xxx";

    // 处理系统异常
    @ExceptionHandler(SystemException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleSystemException(SystemException ex) {
        log.error("系统异常：{}", ex.getMessage(), ex); // 打印堆栈，便于排查
        // 发送预警，带重试机制
        sendDingTalkMsgWithRetry("系统异常：" + ex.getMessage());
        return Result.error(ex.getCode(), ex.getMessage());
    }

    // 处理业务异常
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException ex) {
        log.warn("业务异常：{}", ex.getMessage()); // 警告级别，无需堆栈
        return Result.error(ex.getCode(), ex.getMessage());
    }

    // 处理未捕获的通用异常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception ex) {
        log.error("未知异常：", ex); // 必须打印完整堆栈
        sendDingTalkMsgWithRetry("未知异常：" + ex.getMessage());
        return Result.error(Result.Code.SYSTEM_ERR.code, "系统繁忙，请稍后再试");
    }

    // 预警重试机制，避免网络抖动导致预警失败
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
                    TimeUnit.SECONDS.sleep(1); // 重试间隔1秒
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        log.error("预警发送失败，已达最大重试次数");
    }
}
```

**避坑建议**

1. 日志级别区分：业务异常用 `warn` 级别，系统异常用 `error` 级别，避免日志刷屏；未知异常必须打印完整堆栈，否则无法定位问题。
2. 预警加重试与熔断：若钉钉接口临时不可用，无重试机制会导致预警丢失，重试次数建议控制在 3 次内，避免引发连锁超时。

## 四、拦截器：进阶用法与底层机制（代码补全 + 执行流程可视化）

深化拦截器执行流程的代码验证，并补充分布式限流、注解式拦截的完整实现，规避拦截范围与执行顺序的坑。

### 1. 拦截器执行流程（带日志打印）

通过日志直观展示 `preHandle`、`postHandle`、`afterCompletion` 的执行顺序：

java

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
public class LogInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        log.info("【LogInterceptor】preHandle：请求路径{}", request.getRequestURI());
        return true; // 返回true才会继续执行后续流程
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, 
                          org.springframework.web.servlet.ModelAndView modelAndView) {
        log.info("【LogInterceptor】postHandle：处理器执行完成");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        log.info("【LogInterceptor】afterCompletion：视图渲染完成，异常信息{}", ex);
    }
}
```

注册拦截器：

java

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class InterceptorConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor())
                .addPathPatterns("/**") // 拦截所有路径
                .excludePathPatterns("/login"); // 排除登录接口
    }
}
```

**执行日志示例**

plaintext

```plaintext
【LogInterceptor】preHandle：请求路径/books/1
【LogInterceptor】postHandle：处理器执行完成
【LogInterceptor】afterCompletion：视图渲染完成，异常信息null
```

**避坑建议**

1. `afterCompletion` 必执行：即使 `preHandle` 返回 false，已执行的拦截器的 `afterCompletion` 仍会执行，需避免在此方法中做业务逻辑处理。
2. 排除静态资源：若拦截器拦截 `/**` 且未排除 `.js`、`.css` 等静态资源，会导致前端资源加载失败，需通过 `excludePathPatterns` 排除。

### 2. 分布式限流（Redis+Lua 脚本）

本地限流无法适配分布式系统，以下是 Redis+Lua 的分布式限流实现，避免并发问题：

java

```java
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;

public class RateLimitInterceptor implements HandlerInterceptor {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    // 限流脚本：1分钟内最多100次请求
    private static final String RATE_LIMIT_SCRIPT = """
            local key = KEYS[1]
            local limit = tonumber(ARGV[1])
            local expire = tonumber(ARGV[2])
            local current = redis.call('incr', key)
            if current == 1 then
                redis.call('expire', key, expire)
            end
            return current <= limit
            """;

    public RateLimitInterceptor(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ip = request.getRemoteAddr();
        String uri = request.getRequestURI();
        String key = "rate_limit:" + ip + ":" + uri;
        Integer limit = 100;
        Integer expire = 60;

        // 执行Lua脚本
        Boolean allowed = redisTemplate.execute(
                new DefaultRedisScript<>(RATE_LIMIT_SCRIPT, Boolean.class),
                Collections.singletonList(key),
                limit.toString(),
                expire.toString()
        );

        if (Boolean.FALSE.equals(allowed)) {
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(Result.error(60001, "请求过于频繁")));
            return false;
        }
        return true;
    }
}
```

**避坑建议**

1. 用 Lua 脚本保证原子性：若分两次执行 `incr` 和 `expire`，高并发下会出现超限流问题，Lua 脚本可确保两个操作原子执行。
2. 避免 Redis 雪崩：限流键设置过期时间，防止键堆积占用内存；同时给 Redis 配置哨兵模式，避免单点故障。

## 五、前后台联调：跨域、文件传输与接口安全（问题复现 + 修复）

针对联调中高频问题，复现错误配置并给出完整修复方案，确保生产环境可用。

### 1. 跨域问题（错误配置复现 + 修复）

#### （1）常见错误配置

java

```java
// 错误配置：allowedOrigins为*时，不能允许credentials（cookie等）
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // 通配符
                .allowCredentials(true); // 冲突，会导致跨域失败
    }
}
```

#### （2）正确配置

java

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8080") // 明确前端地址
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**避坑建议**

1. 避免通配符与凭证冲突：`allowedOrigins("*")` 和 `allowCredentials(true)` 不能同时配置，浏览器会拦截响应。
2. 排查网关跨域：若项目有 Nginx 或 Spring Cloud Gateway，需确保跨域配置仅在一处生效，否则会因重复设置响应头导致失败。

### 2. 文件上传（完整实现 + 异常处理）

java

```java
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
public class FileUploadController {

    private static final String UPLOAD_PATH = "D:/uploads/";

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        // 1. 校验文件是否为空
        if (file.isEmpty()) {
            return Result.error(60002, "上传文件不能为空");
        }
        // 2. 校验文件格式
        String originalFilename = file.getOriginalFilename();
        if (!originalFilename.endsWith(".png") && !originalFilename.endsWith(".jpg")) {
            return Result.error(60003, "仅支持png和jpg格式");
        }
        // 3. 生成唯一文件名，避免覆盖
        String filename = UUID.randomUUID() + originalFilename.substring(originalFilename.lastIndexOf("."));
        File destFile = new File(UPLOAD_PATH + filename);
        // 4. 创建目录（若不存在）
        if (!destFile.getParentFile().exists()) {
            destFile.getParentFile().mkdirs();
        }
        try {
            file.transferTo(destFile);
            return Result.success("/uploads/" + filename);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error(60004, "文件上传失败");
        }
    }
}
```

**避坑建议**

1. 生成唯一文件名：若直接用原文件名，同名文件会被覆盖，建议用 UUID 或 “时间戳 + 原文件名” 命名。
2. 避免本地存储：生产环境不要存储文件到服务器本地，建议用 MinIO 或阿里云 OSS，同时记录文件存储路径到数据库。

### 3. JWT Token 校验（完整工具类 + 过期处理）

#### （1）JWT 工具类

java

```java
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

public class JwtUtil {
    // 密钥（生产环境需配置在配置中心，避免硬编码）
    private static final String SECRET = "itheima-secret-key-32bytes-long-123456";
    // 过期时间：2小时
    private static final long EXPIRATION = 7200000;

    // 生成Token
    public static String generateToken(String username) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(username)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    // 验证Token并获取用户名
    public static String verifyToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        // 校验过期时间
        if (claims.getExpiration().before(new Date())) {
            throw new RuntimeException("Token已过期");
        }
        return claims.getSubject();
    }
}
```

#### （2）JWT 拦截器完善

java

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.servlet.HandlerInterceptor;

public class JwtInterceptor implements HandlerInterceptor {
    private final ObjectMapper objectMapper;

    public JwtInterceptor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            response.getWriter().write(objectMapper.writeValueAsString(Result.error(401, "Token不存在")));
            return false;
        }
        try {
            JwtUtil.verifyToken(token.substring(7));
        } catch (RuntimeException e) {
            response.getWriter().write(objectMapper.writeValueAsString(Result.error(401, e.getMessage())));
            return false;
        }
        return true;
    }
}
```

**避坑建议**

1. 密钥长度足够：JWT 若使用 HS256 算法，密钥长度至少 256 位（32 个字符），否则会抛出 `KeyLengthException`。
2. 处理 Token 过期：前端需监听 401 响应，跳转至登录页重新获取 Token；服务端可生成刷新 Token，避免频繁登录。

## 总结

SSM 框架的企业级开发，核心在于**吃透底层机制、规范代码编写、提前规避坑点**。本文通过补充完整代码示例、拆解底层逻辑、复现高频错误，从 SSM 整合、统一结果 / 异常处理、拦截器拓展到前后端联调，形成一套完整的实战体系。开发中需重点关注容器协同、事务一致性、序列化规范、接口安全等核心问题，同时养成日志分级、异常捕获、配置规范的习惯，才能构建出高可用、易维护的 Web 应用。



### 面试题 1（SSM 整合底层）

**题目**：SSM 整合时，Controller 为何会出现重复加载的问题？底层原因是什么？请给出两种规避方案并说明各自的适用场景。

**考察点**：Spring 与 SpringMVC 容器关系、组件扫描机制、企业级配置规范

**参考答案**

1. **底层原因**

本质是 Spring 容器（RootApplicationContext）与 SpringMVC 容器（ServletApplicationContext）的**父子容器作用域冲突**。Spring 容器通常管理 Service、Mapper 等全局 Bean，SpringMVC 容器管理 Controller；若两者扫描范围重叠（如均扫描com.itheima），Controller 会被两个容器分别实例化，导致重复加载。

1. **规避方案及适用场景**

```
// Spring配置类排除Controller
@ComponentScan(value = "com.itheima",excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Controller.class))
// SpringMVC配置类仅扫描Controller
@ComponentScan(value = "com.itheima",includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Controller.class))
```

- - 方案 1：扫描范围精准划分。Spring 配置类扫描根包并排除@Controller，SpringMVC 配置类仅扫描 Controller。适用于**分层清晰的中小型项目**，配置简单易维护。代码示例：

- - 方案 2：按包路径分层扫描。将 Controller 统一放在com.itheima.controller子包，Spring 配置类扫描com.itheima.service、com.itheima.mapper，SpringMVC 扫描com.itheima.controller。适用于**大型项目**，避免扫描范围泄露导致的冲突。

### 面试题 2（事务进阶）

**题目**：使用@Transactional注解时，列举 3 种常见的事务失效场景并说明底层原因，针对 “同类方法调用导致事务失效” 给出两种企业级解决方案。

**考察点**：Spring 事务底层代理机制、实战坑点排查、分布式场景适配

**参考答案**

1. **3 种事务失效场景及底层原因**

1. 1. 场景 1：注解标注在非 public 方法。底层 Spring 事务通过 JDK 动态代理或 CGLIB 代理实现，代理逻辑仅拦截 public 方法，非 public 方法无法触发切面。

1. 1. 场景 2：同类方法内部调用。同类方法调用时，直接通过 this 调用而非代理对象调用，跳过 AOP 拦截链，事务切面未执行。

1. 1. 场景 3：未指定rollbackFor且抛出检查型异常。默认@Transactional仅对RuntimeException和Error回滚，检查型异常（如IOException）不会触发回滚。

1. **同类方法调用的解决方案**

```
@EnableAspectJAutoProxy(exposeProxy = true)
public class BookService {
    public void buyBook() {
        ((BookService)AopContext.currentProxy()).deductStock();
    }
    @Transactional
    public void deductStock() {}
}
```

- - 方案 1：通过AopContext获取代理对象。开启暴露代理配置，调用代理对象的目标方法触发切面。适用于**单体项目**，代码侵入性低。

- - 方案 2：依赖注入自身 Bean。通过构造器注入 Service 自身，调用注入对象的方法。适用于**无法使用 AopContext**的场景（如低版本 Spring），需注意避免循环依赖风险。

### 面试题 3（拦截器与 AOP）

**题目**：SpringMVC 的拦截器和 Spring AOP 都能实现功能增强，请从执行时机、底层原理、适用场景三个维度对比两者的差异，并说明为何接口限流更适合用拦截器实现。

**考察点**：拦截器执行流程、AOP 底层机制、场景化技术选型

**参考答案**

1. **三者维度差异表**

| 对比维度 | SpringMVC 拦截器                                             | Spring AOP                                                   |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 执行时机 | 围绕 DispatcherServlet 的处理器执行链，仅作用于 Controller 请求 | 可作用于所有 Spring Bean 的方法，执行时机贯穿 Bean 方法生命周期 |
| 底层原理 | 基于 Java 回调机制，通过HandlerExecutionChain构建执行链      | 基于动态代理（JDK/CGLIB）和切面织入，通过Advisor和Advice定义增强逻辑 |
| 适用场景 | 请求级别的功能增强（如登录校验、跨域处理、接口限流）         | 业务级别的功能增强（如事务控制、日志记录、权限细化校验）     |

1. **接口限流适合用拦截器的原因**

1. 1. 拦截器聚焦请求流程，可在请求进入 Controller 前直接拦截非法请求，减少无效的业务逻辑执行，比 AOP 更高效。

1. 1. 拦截器可直接获取HttpServletRequest对象，轻松获取 IP、请求 URI 等限流关键信息，无需额外注入上下文。

1. 1. 拦截器支持快速响应（如直接向HttpServletResponse写入限流提示），无需等待业务方法执行，用户体验更优。

### 面试题 4（统一异常处理）

**题目**：请设计一套企业级的分级异常体系，说明设计思路，同时说明如何避免异常处理过程中出现的预警次生问题。

**考察点**：异常体系设计、日志规范、生产环境稳定性保障

**参考答案**

1. **分级异常体系设计**

```
// 顶级抽象异常
public abstract class BaseException extends RuntimeException {
    private final Integer code;
    public BaseException(Integer code, String message) {super(message);this.code = code;}
    // getter
}
// 系统异常（数据库、缓存等底层问题）
public class SystemException extends BaseException {
    public static SystemException DB_CONN_ERR() {return new SystemException(50001, "数据库连接失败");}
}
// 业务异常（用户操作、参数校验等）
public class BusinessException extends BaseException {
    public BusinessException(Integer code, String message) {super(code, message);}
}
```

1. 1. 设计思路：基于异常影响范围和类型，划分**顶级抽象异常 + 细分异常**，统一封装错误码和消息，便于前端适配和问题定位。

1. 1. 代码实现：

1. **避免预警次生问题的方案**

1. 1. 预警重试机制：发送钉钉 / 企业微信预警时，添加 3 次内重试逻辑，间隔 1 秒，避免网络抖动导致预警丢失。

1. 1. 日志分级：业务异常用warn级别（无需堆栈），系统异常用error级别（打印完整堆栈），避免日志刷屏。

1. 1. 熔断保护：若预警接口持续失败，暂停预警 1 分钟，防止预警逻辑拖垮业务系统。

### 面试题 5（前后端联调）

**题目**：前后端分离项目中，同时遇到 JWT Token 失效和跨域两个问题，请分别说明问题原因，并给出一套可落地的整合解决方案，确保生产环境安全可用。

**考察点**：JWT 机制、跨域底层原理、生产环境安全配置

**参考答案**

1. **问题原因**

- - JWT Token 失效：Token 过期、密钥篡改或 Token 格式错误，导致服务端校验失败；

- - 跨域：浏览器的同源策略限制，前端请求的协议、域名、端口与后端不一致，触发跨域拦截。

1. **整合解决方案**

1. 1. **JWT Token 失效处理**

```
public String verifyToken(String token) {
    SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());
    try {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    } catch (Exception e) {throw new RuntimeException("Token无效或已过期");}
}
```

- - - 服务端：开发 JWT 工具类，统一处理 Token 生成、校验，校验失败时返回 401 状态码；

- - - 前端：通过请求拦截器携带 Token，响应拦截器监听 401，跳转至登录页重新获取 Token。

1. 1. **跨域解决方案**

配置全局跨域，明确允许的前端地址，避免通配符与凭证冲突；

```
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("https://xxx-frontend.com")
            .allowedMethods("GET","POST")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

1. 1. **生产环境安全增强**

- - - JWT 密钥存储在配置中心（如 Nacos），避免硬编码；

- - - 跨域仅允许生产环境的前端域名，禁用本地测试域名；

- - - 对敏感接口（如支付），除 Token 外额外添加签名校验。