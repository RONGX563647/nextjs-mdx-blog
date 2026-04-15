# 【JavaWeb｜day19 Web后端进阶 SpringAOP、SpringBoot原理、自定义Starter、Maven高级】

## 一、SpringAOP：面向切面编程（解耦横切逻辑）

### 1. 核心定位

SpringAOP（Aspect-Oriented Programming）是 Spring 核心特性之一，核心解决「横切逻辑与业务逻辑解耦」问题。横切逻辑是指多个业务模块共用的逻辑（如日志记录、权限校验、事务控制、异常捕获），通过 AOP 可将这些逻辑抽离为独立 “切面”，无需侵入业务代码，实现统一管理和复用。

### 2. 核心概念（必须掌握）

| 概念                | 定义                                                   | 实际场景落地                                                 |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| 切面（Aspect）      | 横切逻辑的封装（含通知和切入点）                       | 日志切面（LogAspect）、权限切面（AuthAspect）                |
| 通知（Advice）      | 切面的具体执行逻辑（何时执行）                         | 前置通知（执行前）、后置通知（执行后）、环绕通知（执行前后）、异常通知（抛出异常时）、最终通知（无论是否异常都执行） |
| 连接点（JoinPoint） | 程序执行过程中的可拦截点（如方法调用、字段赋值）       | Controller 的接口方法、Service 的业务方法（SpringAOP 仅支持方法级连接点） |
| 切入点（Pointcut）  | 筛选连接点的规则（指定哪些方法被切面拦截）             | 通过表达式（如`execution(* com.itheima.service.*.*(..))`）拦截 Service 层所有方法 |
| 目标对象（Target）  | 被切面拦截的原始业务对象                               | UserServiceImpl 实例（被日志切面拦截的业务对象）             |
| 代理对象（Proxy）   | SpringAOP 动态生成的对象（包装目标对象，植入切面逻辑） | 对 UserServiceImpl 生成的代理对象，调用其方法时会先执行切面逻辑 |
| 织入（Weaving）     | 将切面逻辑植入目标对象的过程                           | Spring 容器启动时，通过动态代理将日志切面织入 Service 层方法 |

### 3. 实现原理：动态代理

SpringAOP 的底层是**动态代理**，根据目标对象是否实现接口，自动选择代理方式：

#### （1）JDK 动态代理（默认，目标对象实现接口）

- 原理：基于 Java 反射机制，动态生成目标接口的代理类（实现 InvocationHandler 接口），代理类调用目标对象方法时植入切面逻辑。

- 特点：仅支持接口代理，目标对象必须实现接口；生成代理类效率高，运行时效率中等。

- 核心代码示例：

  java

  运行

  ```java
  // JDK动态代理示例（模拟SpringAOP底层）
  public class JdkProxy implements InvocationHandler {
      private Object target; // 目标对象
  
      public JdkProxy(Object target) {
          this.target = target;
      }
  
      // 生成代理对象
      public <T> T getProxy() {
          return (T) Proxy.newProxyInstance(
              target.getClass().getClassLoader(),
              target.getClass().getInterfaces(),
              this
          );
      }
  
      // 代理逻辑（切面逻辑植入）
      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
          // 前置通知（如日志记录）
          System.out.println("方法执行前：" + method.getName());
          try {
              // 执行目标对象方法
              Object result = method.invoke(target, args);
              // 后置通知
              System.out.println("方法执行后：" + method.getName());
              return result;
          } catch (Exception e) {
              // 异常通知
              System.out.println("方法执行异常：" + e.getMessage());
              throw e;
          } finally {
              // 最终通知
              System.out.println("方法执行完毕（无论是否异常）");
          }
      }
  }
  ```

  

#### （2）CGLIB 动态代理（目标对象无接口）

- 原理：基于 ASM 字节码生成框架，动态生成目标对象的子类，重写目标方法并植入切面逻辑。

- 特点：支持类代理（无需实现接口）；生成代理类效率中等，运行时效率高（直接操作字节码）。

- 启用方式：SpringBoot 2.x 默认自动切换，若需强制使用 CGLIB，配置：

  properties

  ```properties
  spring.aop.proxy-target-class=true
  ```

  

#### （3）JDK 与 CGLIB 代理对比

| 对比维度    | JDK 动态代理             | CGLIB 动态代理                          |
| ----------- | ------------------------ | --------------------------------------- |
| 依赖条件    | 目标对象必须实现接口     | 目标对象可以是普通类（不能是 final 类） |
| 实现方式    | 反射机制生成接口代理类   | ASM 框架生成目标类子类                  |
| 效率        | 生成快，运行中           | 生成中，运行快                          |
| 支持场景    | 接口代理                 | 类代理、接口代理                        |
| Spring 默认 | 目标对象有接口时优先使用 | 目标对象无接口时自动使用                |

### 4. 实际开发场景（SpringAOP 实战）

#### （1）场景 1：接口访问日志记录（环绕通知）

需求：记录所有 Controller 接口的请求 URL、参数、响应时间、用户 ID，无需在每个接口手动写日志。

- 步骤 1：定义切面类（@Aspect+@Component）

  java

  运行

  ```java
  import org.aspectj.lang.ProceedingJoinPoint;
  import org.aspectj.lang.annotation.Around;
  import org.aspectj.lang.annotation.Aspect;
  import org.aspectj.lang.annotation.Pointcut;
  import org.springframework.stereotype.Component;
  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;
  
  @Aspect // 标识为切面类
  @Component // 交给Spring容器管理
  public class LogAspect {
      private static final Logger logger = LoggerFactory.getLogger(LogAspect.class);
  
      // 切入点：拦截com.itheima.controller包下所有类的所有方法
      @Pointcut("execution(* com.itheima.controller..*.*(..))")
      public void logPointcut() {}
  
      // 环绕通知（最灵活，可控制目标方法执行）
      @Around("logPointcut()")
      public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
          // 1. 前置逻辑：记录请求信息
          long startTime = System.currentTimeMillis();
          String methodName = joinPoint.getSignature().getName(); // 方法名
          String className = joinPoint.getTarget().getClass().getName(); // 类名
          Object[] args = joinPoint.getArgs(); // 请求参数
  
          logger.info("接口请求：类={}, 方法={}, 参数={}", className, methodName, args);
  
          try {
              // 2. 执行目标方法（接口业务逻辑）
              Object result = joinPoint.proceed();
  
              // 3. 后置逻辑：记录响应信息
              long costTime = System.currentTimeMillis() - startTime;
              logger.info("接口响应：类={}, 方法={}, 耗时={}ms, 结果={}", 
                          className, methodName, costTime, result);
              return result;
          } catch (Exception e) {
              // 4. 异常逻辑：记录异常信息
              logger.error("接口异常：类={}, 方法={}, 异常信息={}", 
                          className, methodName, e.getMessage(), e);
              throw e; // 重新抛出异常，让全局异常处理器处理
          }
      }
  }
  ```

  

- 步骤 2：启动 SpringBoot 项目，访问 Controller 接口，自动打印日志，无需修改业务代码。

#### （2）场景 2：权限校验（前置通知）

需求：某些接口需要登录后才能访问，通过 AOP 拦截接口，校验用户是否登录（从 Token 中解析用户 ID）。

- 核心代码：

  java

  运行

  ```java
  @Aspect
  @Component
  public class AuthAspect {
      // 切入点：拦截带有@RequireLogin注解的方法
      @Pointcut("@annotation(com.itheima.annotation.RequireLogin)")
      public void authPointcut() {}
  
      // 前置通知：目标方法执行前校验权限
      @Before("authPointcut()")
      public void doAuth(JoinPoint joinPoint) {
          // 1. 从请求头获取Token
          HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
          String token = request.getHeader("Authorization");
  
          // 2. 校验Token（模拟逻辑）
          if (token == null || !token.startsWith("Bearer ")) {
              throw new BusinessException("未登录，请先登录");
          }
  
          // 3. 解析Token获取用户ID（实际使用JWT工具类）
          String userId = token.substring(7);
          if (userId == null || userId.isEmpty()) {
              throw new BusinessException("登录状态失效，请重新登录");
          }
  
          // 4. 有权限，继续执行目标方法
          logger.info("用户{}已登录，允许访问接口", userId);
      }
  }
  
  // 自定义注解：标识需要登录的接口
  @Target(ElementType.METHOD)
  @Retention(RetentionPolicy.RUNTIME)
  public @interface RequireLogin {}
  
  // Controller接口使用
  @RestController
  @RequestMapping("/user")
  public class UserController {
      @GetMapping("/info")
      @RequireLogin // 该接口需要登录校验
      public Result<User> getUserInfo() {
          // 业务逻辑（无需关注权限校验）
          return Result.success(new User(1L, "张三"));
      }
  }
  ```

  

#### （3）场景 3：事务控制（环绕通知，Spring 声明式事务底层）

Spring 的`@Transactional`注解底层就是 AOP，通过环绕通知实现事务的开启、提交、回滚：

- 核心逻辑：

  ```java
  @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
  public Object transactionAround(ProceedingJoinPoint joinPoint) throws Throwable {
      Connection conn = null;
      try {
          // 1. 开启事务（关闭自动提交）
          conn = dataSource.getConnection();
          conn.setAutoCommit(false);
  
          // 2. 执行目标方法（业务逻辑）
          Object result = joinPoint.proceed();
  
          // 3. 提交事务
          conn.commit();
          return result;
      } catch (Exception e) {
          // 4. 回滚事务
          if (conn != null) {
              conn.rollback();
          }
          throw e;
      } finally {
          // 5. 释放资源
          if (conn != null) {
              conn.close();
          }
      }
  }
  ```

  

### 5. 深度避坑指南

| 坑点描述                                                     | 原因分析                                                     | 解决方案                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 静态方法无法被 AOP 代理                                      | SpringAOP 仅支持方法级连接点，且动态代理（JDK/CGLIB）无法代理静态方法（静态方法属于类，不属于实例） | 1. 将静态方法改为实例方法；2. 若必须用静态方法，通过手动调用切面逻辑替代 AOP |
| 通知顺序混乱（多个切面拦截同一方法）                         | 未指定切面优先级，Spring 默认按切面类名排序（字母顺序）      | 1. 用`@Order(value=1)`注解指定优先级（值越小优先级越高）；2. 实现`Ordered`接口重写`getOrder()`方法 |
| 内部方法调用无法触发 AOP（如 Service 中 a () 调用 b ()，b () 的切面不执行） | 内部调用是目标对象直接调用，未经过代理对象，切面逻辑无法植入 | 1. 注入自身代理对象（`@Autowired private UserService userService;`），通过`userService.b()`调用；2. 从 Spring 容器中获取代理对象（`ApplicationContext.getBean(UserService.class)`）；3. 重构代码，拆分内部调用为独立 Service |
| 切入点表达式错误导致切面不生效                               | 表达式语法错误（如包名写错、方法匹配规则错误）               | 1. 用`execution(* com.itheima.service..*.*(..))`匹配 service 包及子包所有方法；2. 用`@Pointcut("@annotation(com.itheima.annotation.RequireLogin)")`匹配带指定注解的方法；3. 开启 AOP 日志调试（`logging.level.org.springframework.aop=debug`） |
| CGLIB 代理无法代理 final 类 / 方法                           | CGLIB 通过生成子类重写方法实现代理，final 类无法被继承，final 方法无法被重写 | 1. 移除目标类 / 方法的 final 修饰符；2. 若目标类是 final，让其实现接口，切换为 JDK 动态代理 |
| 环绕通知未调用`joinPoint.proceed()`，导致目标方法不执行      | 环绕通知需手动调用`proceed()`触发目标方法执行，否则仅执行切面逻辑 | 确保环绕通知中调用`joinPoint.proceed()`，并返回结果（`return result;`） |

### 6. 通用模板（通用日志切面模板）

java

运行

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * 通用接口日志切面（直接复制复用）
 */
@Aspect
@Component
public class CommonLogAspect {
    private static final Logger logger = LoggerFactory.getLogger(CommonLogAspect.class);

    // 切入点：拦截所有Controller接口（可根据需求修改）
    @Pointcut("execution(* com.itheima..controller..*.*(..))")
    public void logPointcut() {}

    @Around("logPointcut()")
    public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. 获取请求上下文
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        // 2. 记录请求信息
        long startTime = System.currentTimeMillis();
        String url = request.getRequestURI();
        String method = request.getMethod();
        String ip = request.getRemoteAddr();
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        logger.info("【请求日志】URL: {}, 方法: {}, IP: {}, 类: {}, 方法名: {}, 参数: {}",
                url, method, ip, className, methodName, Arrays.toString(args));

        try {
            // 3. 执行目标方法
            Object result = joinPoint.proceed();

            // 4. 记录响应信息
            long costTime = System.currentTimeMillis() - startTime;
            logger.info("【响应日志】URL: {}, 方法名: {}, 耗时: {}ms, 结果: {}",
                    url, methodName, costTime, result);
            return result;
        } catch (Exception e) {
            // 5. 记录异常信息
            logger.error("【异常日志】URL: {}, 方法名: {}, 异常信息: {}",
                    url, methodName, e.getMessage(), e);
            throw e;
        }
    }
}
```

------

## 二、SpringBoot 原理：简化 Spring 开发的核心

### 1. 核心定位

SpringBoot 的核心是「约定优于配置」，通过**自动配置**、** starters 依赖 **、**嵌入式服务器**三大特性，简化 Spring 项目的搭建、配置、部署流程，解决传统 Spring 项目 “配置繁琐、依赖冲突、部署复杂” 的问题。

### 2. 核心注解：@SpringBootApplication 拆解

`@SpringBootApplication`是 SpringBoot 的入口注解，本质是三个核心注解的组合：

java

```java
@SpringBootConfiguration // 1. 等同于@Configuration，标识当前类是配置类
@EnableAutoConfiguration // 2. 核心：启用自动配置
@ComponentScan // 3. 核心：扫描Spring Bean（默认扫描当前包及子包）
public @interface SpringBootApplication {
    // 排除不需要的自动配置类
    Class<?>[] exclude() default {};
    // 按类名排除自动配置类
    String[] excludeName() default {};
    // 指定扫描的包（默认当前包及子包）
    String[] scanBasePackages() default {};
}
```

#### （1）@SpringBootConfiguration

- 作用：标识当前类是 Spring 的配置类，允许在类中用`@Bean`声明 Bean。
- 与`@Configuration`的区别：`@SpringBootConfiguration`是 SpringBoot 的专属注解，底层继承`@Configuration`，仅用于标识 SpringBoot 应用的主配置类。

#### （2）@ComponentScan

- 作用：扫描指定包下的`@Component`、`@Controller`、`@Service`、`@Repository`等注解的类，将其注册为 Spring Bean。
- 默认规则：扫描`@SpringBootApplication`所在类的当前包及所有子包。
- 自定义扫描：通过`scanBasePackages = "com.itheima"`指定扫描包，解决 Bean 未被扫描导致的注入失败问题。

#### （3）@EnableAutoConfiguration（自动配置核心）

- 作用：根据项目依赖（如引入`spring-boot-starter-web`则自动配置 Tomcat、SpringMVC），自动加载对应的配置类，创建 Bean 并注入 Spring 容器。

- 实现原理：

  SPI（Service Provider Interface）机制

  1. SpringBoot 启动时，`@EnableAutoConfiguration`会触发`AutoConfigurationImportSelector`类执行。
  2. 该类读取`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件（SpringBoot 2.7+），该文件中包含所有自动配置类的全类名（如`DataSourceAutoConfiguration`、`MybatisAutoConfiguration`）。
  3. 对每个自动配置类，通过`@Conditional`系列注解判断是否生效（如`@ConditionalOnClass`：存在指定类才生效，`@ConditionalOnMissingBean`：不存在指定 Bean 才生效）。
  4. 生效的自动配置类会被加载，通过`@Bean`声明必要的 Bean（如`DataSource`、`DispatcherServlet`），注入 Spring 容器。

### 3. 自动配置流程（核心原理落地）

以 “自动配置数据源” 为例，拆解 SpringBoot 自动配置的完整流程：

1. 项目引入`spring-boot-starter-jdbc`依赖（包含`spring-jdbc`、HikariCP 连接池、MySQL 驱动）。

2. SpringBoot 启动时，`@EnableAutoConfiguration`触发加载`DataSourceAutoConfiguration`（来自`AutoConfiguration.imports`文件）。

3. `DataSourceAutoConfiguration`通过`@ConditionalOnClass(DataSource.class)`判断：项目中存在`DataSource`类（来自`spring-jdbc`依赖），因此该自动配置类生效。

4. `DataSourceAutoConfiguration`读取`application.properties`中的数据库配置（`spring.datasource.url`、`username`、`password`）。

5. 通过

   ```
   @Bean
   ```

   声明

   ```
   DataSource
   ```

    

   Bean（默认使用 HikariCP 连接池）：

   java

   

   运行

   ```java
   @Bean
   @ConditionalOnMissingBean
   public DataSource dataSource(DataSourceProperties properties) {
       return properties.initializeDataSourceBuilder().build();
   }
   ```

   

6. `DataSource` Bean 被注入 Spring 容器，后续`JdbcTemplate`、`Mybatis`等组件可直接注入`DataSource`使用，无需手动配置。

### 4. Starters 原理：依赖聚合 + 自动配置

#### （1）Starters 的核心作用

Starters 是 SpringBoot 的 “依赖套餐”，核心解决两个问题：

- 依赖聚合：一个 Starter 包含该场景所需的所有依赖（如`spring-boot-starter-web`包含 Tomcat、SpringMVC、Jackson 等），无需手动引入多个依赖。
- 自动配置：每个 Starter 都关联对应的自动配置类（如`spring-boot-starter-web`关联`DispatcherServletAutoConfiguration`、`TomcatAutoConfiguration`），实现 “引入依赖即配置”。

#### （2）常用 Starters 示例

| Starter 名称                | 核心依赖                         | 自动配置内容                                       | 适用场景             |
| --------------------------- | -------------------------------- | -------------------------------------------------- | -------------------- |
| spring-boot-starter-web     | SpringMVC、Tomcat、Jackson       | 配置 DispatcherServlet、Tomcat 服务器、JSON 序列化 | Web 项目（接口开发） |
| spring-boot-starter-jdbc    | Spring-jdbc、HikariCP            | 配置 DataSource、JdbcTemplate                      | 数据库操作（JDBC）   |
| spring-boot-starter-mybatis | Mybatis、Mybatis-Spring          | 配置 SqlSessionFactory、MapperScanner              | Mybatis 数据库操作   |
| spring-boot-starter-redis   | Spring-Data-Redis、Jedis/Lettuce | 配置 RedisTemplate、StringRedisTemplate            | Redis 缓存操作       |

#### （3）Starters 的命名规范

- 官方 Starter：`spring-boot-starter-xxx`（如`spring-boot-starter-web`）。
- 第三方 Starter：`xxx-spring-boot-starter`（如`mybatis-spring-boot-starter`、`druid-spring-boot-starter`），避免与官方 Starter 冲突。

### 5. 嵌入式服务器原理

SpringBoot 默认集成 Tomcat（嵌入式服务器），可直接通过`java -jar`命令启动项目，无需部署到外部 Tomcat，核心原理：

1. `spring-boot-starter-web`依赖包含`tomcat-embed-core`（嵌入式 Tomcat 核心依赖）。

2. 自动配置类`TomcatAutoConfiguration`生效，通过`@Bean`声明`TomcatServletWebServerFactory`。

3. SpringBoot 启动时，`TomcatServletWebServerFactory`创建 Tomcat 实例，配置端口（默认 8080）、上下文路径等。

4. 将 SpringMVC 的`DispatcherServlet`注册到 Tomcat，Tomcat 启动后监听端口，接收 HTTP 请求并转发给`DispatcherServlet`。

5. 切换嵌入式服务器（如 Jetty、Undertow）：排除 Tomcat 依赖，引入对应服务器依赖：

   xml

   

   ```xml
   <!-- 排除Tomcat依赖 -->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-web</artifactId>
       <exclusions>
           <exclusion>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-tomcat</artifactId>
           </exclusion>
       </exclusions>
   </dependency>
   <!-- 引入Jetty依赖 -->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-jetty</artifactId>
   </dependency>
   ```

   

### 6. 实际开发场景（SpringBoot 原理落地）

#### （1）场景 1：自定义自动配置类（覆盖默认配置）

需求：SpringBoot 默认配置的`RedisTemplate`序列化方式为 JDK 序列化（序列化后数据乱码），自定义自动配置类，将序列化方式改为 Jackson。

- 步骤 1：创建自动配置类

  java

  

  运行

  ```java
  import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
  import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.data.redis.connection.RedisConnectionFactory;
  import org.springframework.data.redis.core.RedisTemplate;
  import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
  import org.springframework.data.redis.serializer.StringRedisSerializer;
  
  import com.fasterxml.jackson.databind.ObjectMapper;
  
  // 当项目中存在RedisTemplate类时，该配置类生效
  @Configuration
  @ConditionalOnClass(RedisTemplate.class)
  public class CustomRedisAutoConfiguration {
  
      // 当容器中不存在RedisTemplate Bean时，才创建该Bean（允许用户自定义覆盖）
      @Bean
      @ConditionalOnMissingBean
      public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
          RedisTemplate<String, Object> template = new RedisTemplate<>();
          template.setConnectionFactory(factory);
  
          // 配置Jackson序列化
          Jackson2JsonRedisSerializer<Object> jacksonSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
          ObjectMapper mapper = new ObjectMapper();
          mapper.findAndRegisterModules(); // 支持Java 8时间类型
          jacksonSerializer.setObjectMapper(mapper);
  
          // Key用String序列化
          template.setKeySerializer(new StringRedisSerializer());
          // Value用Jackson序列化
          template.setValueSerializer(jacksonSerializer);
          // Hash Key/Value序列化
          template.setHashKeySerializer(new StringRedisSerializer());
          template.setHashValueSerializer(jacksonSerializer);
  
          template.afterPropertiesSet();
          return template;
      }
  }
  ```

  

- 步骤 2：创建

  ```
  META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
  ```

  文件，添加自动配置类全类名：

  plaintext

  ```plaintext
  com.itheima.config.CustomRedisAutoConfiguration
  ```

  

- 步骤 3：启动项目，SpringBoot 会自动加载该配置类，创建自定义的`RedisTemplate` Bean。

#### （2）场景 2：配置文件优先级（覆盖自动配置）

SpringBoot 支持多种配置文件格式，优先级从高到低：

1. 命令行参数（`java -jar app.jar --server.port=8081`）。
2. 系统环境变量（如`SPRING_DATASOURCE_URL`）。
3. `application-dev.yml`/`application-dev.properties`（激活的环境配置）。
4. `application.yml`/`application.properties`（默认配置）。
5. `application-default.yml`/`application-default.properties`（默认 fallback 配置）。

- 实际场景：开发环境用

  ```
  application-dev.properties
  ```

  ，生产环境用

  ```
  application-prod.properties
  ```

  ，通过

  ```
  spring.profiles.active=dev
  ```

  激活对应环境：

  properties

  ```properties
  # application.properties
  spring.profiles.active=dev # 激活开发环境
  ```

  properties

  ```properties
  # application-dev.properties（开发环境）
  server.port=8080
  spring.datasource.url=jdbc:mysql://localhost:3306/dev_db
  ```

  properties

  ```properties
  # application-prod.properties（生产环境）
  server.port=80
  spring.datasource.url=jdbc:mysql://192.168.1.100:3306/prod_db
  ```

  

### 7. 深度避坑指南

| 坑点描述                            | 原因分析                                                     | 解决方案                                                     |                                        |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------- |
| 自动配置类不生效                    | 1. 项目依赖缺失（如未引入`spring-boot-starter-web`，则 Tomcat 自动配置不生效）；2. 自动配置类被`@SpringBootApplication(exclude=xxx.class)`排除；3. `@Conditional`注解条件不满足（如`@ConditionalOnClass`所需类不存在） | 1. 检查依赖是否完整；2. 移除 exclude 中的对应类；3. 开启自动配置调试日志（`debug=true`），查看`Positive matches`（生效的自动配置）和`Negative matches`（未生效的自动配置及原因） |                                        |
| 自定义 Bean 未覆盖默认自动配置 Bean | 自动配置类的`@Bean`用了`@ConditionalOnMissingBean`，表示 “仅当容器中不存在该 Bean 时才创建”，若自定义 Bean 的名称与自动配置的 Bean 名称不一致，自动配置的 Bean 仍会创建 | 1. 确保自定义 Bean 的名称与自动配置的 Bean 名称一致（如`redisTemplate`）；2. 用`@Primary`注解强制使用自定义 Bean；3. 排除对应的自动配置类（`@SpringBootApplication(exclude=RedisAutoConfiguration.class)`） |                                        |
| 配置文件属性未绑定到 Bean           | 1. 未加`@ConfigurationProperties`注解；2. 配置文件属性名与 Bean 属性名不一致（未开启驼峰命名转换）；3. 未加`@EnableConfigurationProperties`启用配置绑定 | 1. 在 Bean 类上添加`@ConfigurationProperties(prefix="spring.datasource")`；2. 开启驼峰命名转换（`spring-boot-starter-web`默认开启）；3. 在配置类上添加`@EnableConfigurationProperties(MyProperties.class)` |                                        |
| 嵌入式 Tomcat 端口被占用            | 默认端口 8080 被其他程序占用，导致项目启动失败               | 1. 配置`server.port=8081`修改端口；2. 配置`server.port=0`，让 SpringBoot 自动分配可用端口；3. 关闭占用 8080 端口的程序（Windows：`netstat -ano | findstr 8080`，Linux：`lsof -i:8080`） |
| 多环境配置激活失败                  | 1. 激活命令错误（如`spring.profiles.active=dev`写成`spring.profile.active=dev`）；2. 配置文件名称错误（如`application-dev.yml`写成`application-devl.yml`）；3. 命令行参数覆盖了配置文件的激活配置 | 1. 检查配置项名称是否正确；2. 确保配置文件名称格式为`application-{profile}.yml`；3. 查看启动日志，确认激活的环境（`The following profiles are active: dev`） |                                        |

------

## 三、自定义 Starter：SpringBoot 进阶实战

### 1. 核心定位

自定义 Starter 是 SpringBoot 的进阶应用，核心作用是「封装通用功能（如缓存、日志、权限）为独立组件，实现 “引入依赖即使用”」。企业开发中，可将多个项目共用的逻辑封装为 Starter，简化项目配置，提升复用性（如阿里的`druid-spring-boot-starter`、Mybatis 的`mybatis-spring-boot-starter`）。

### 2. 自定义 Starter 的核心组成

一个完整的自定义 Starter 包含 3 个核心部分：

1. **Starter 模块**：仅包含依赖管理（聚合自动配置模块），无业务代码，供其他项目引入。
2. **自动配置模块**：包含核心业务逻辑、自动配置类、`META-INF`配置文件，是 Starter 的核心。
3. **配置属性类**：绑定用户配置文件（`application.properties`）中的属性，支持用户自定义配置。

### 3. 自定义 Starter 开发流程（实战：自定义 Redis Starter）

需求：开发一个`redis-spring-boot-starter`，实现以下功能：

- 自动配置`RedisTemplate`（Jackson 序列化，解决乱码问题）。
- 提供`RedisUtil`工具类（封装常用的 set、get、delete 方法）。
- 支持用户在`application.properties`中配置 Redis 连接信息（主机、端口、密码）。

#### （1）步骤 1：创建项目结构（Maven 多模块）

plaintext

```plaintext
redis-spring-boot-starter-demo/
├── redis-spring-boot-starter/  # Starter模块（仅依赖管理）
│   └── pom.xml
└── redis-spring-boot-autoconfigure/  # 自动配置模块（核心）
    ├── src/main/java/com/itheima/redis/
    │   ├── config/RedisAutoConfiguration.java  # 自动配置类
    │   ├── properties/RedisProperties.java     # 配置属性类
    │   └── util/RedisUtil.java                # 工具类
    └── src/main/resources/
        └── META-INF/
            └── spring/
                └── org.springframework.boot.autoconfigure.AutoConfiguration.imports  # 自动配置入口
```

#### （2）步骤 2：编写自动配置模块（redis-spring-boot-autoconfigure）

##### ① 配置属性类（RedisProperties.java）：绑定用户配置

java

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Data;

// 绑定配置文件中前缀为"spring.redis"的属性
@Data
@ConfigurationProperties(prefix = "spring.redis")
public class RedisProperties {
    private String host = "localhost"; // 默认值：localhost
    private Integer port = 6379;      // 默认值：6379
    private String password = "";      // 默认值：空
    private Integer database = 0;       // 默认值：0号库
    private Integer timeout = 3000;    // 超时时间（毫秒），默认3秒
}
```

##### ② Redis 工具类（RedisUtil.java）：封装常用操作

java

```java
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

@Component
public class RedisUtil {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    // 存储数据
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    // 获取数据
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // 删除数据
    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }

    // 其他方法（如hash、list操作，按需添加）
}
```

##### ③ 自动配置类（RedisAutoConfiguration.java）：核心配置

java

```java
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;

// 当项目中存在RedisTemplate类时，该配置类生效
@Configuration
@ConditionalOnClass(RedisTemplate.class)
// 启用配置属性绑定（让RedisProperties生效）
@EnableConfigurationProperties(RedisProperties.class)
public class RedisAutoConfiguration {

    // 配置RedisConnectionFactory（连接Redis）
    @Bean
    @ConditionalOnMissingBean
    public RedisConnectionFactory redisConnectionFactory(RedisProperties properties) {
        LettuceConnectionFactory factory = new LettuceConnectionFactory();
        factory.setHostName(properties.getHost());
        factory.setPort(properties.getPort());
        factory.setPassword(properties.getPassword());
        factory.setDatabase(properties.getDatabase());
        // 配置超时时间
        factory.setTimeout(Duration.ofMillis(properties.getTimeout()));
        return factory;
    }

    // 配置RedisTemplate（Jackson序列化）
    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // Jackson序列化配置
        Jackson2JsonRedisSerializer<Object> jacksonSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules(); // 支持Java 8 LocalDateTime
        jacksonSerializer.setObjectMapper(mapper);

        // Key/Value序列化
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(jacksonSerializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(jacksonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    // 配置RedisUtil工具类
    @Bean
    @ConditionalOnMissingBean
    public RedisUtil redisUtil() {
        return new RedisUtil();
    }
}
```

##### ④ 编写自动配置入口文件

在`src/main/resources/META-INF/spring/`目录下创建`org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件，添加自动配置类全类名：



```plaintext
com.itheima.redis.config.RedisAutoConfiguration
```

#### （3）步骤 3：编写 Starter 模块（redis-spring-boot-starter）

Starter 模块仅需引入自动配置模块依赖，无需编写业务代码：

xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.itheima</groupId>
    <artifactId>redis-spring-boot-starter</artifactId>
    <version>1.0-SNAPSHOT</version>
    <name>redis-spring-boot-starter</name>
    <description>自定义Redis Starter</description>

    <!-- 引入自动配置模块 -->
    <dependencies>
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>redis-spring-boot-autoconfigure</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <!-- 引入Redis核心依赖（避免用户手动引入） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
            <version>2.7.15</version>
            <scope>provided</scope> <!-- 避免依赖冲突，用户项目已引入则使用用户的版本 -->
        </dependency>
    </dependencies>
</project>
```

#### （4）步骤 4：打包发布与使用

1. 打包：分别对自动配置模块和 Starter 模块执行`mvn clean install`，安装到本地 Maven 仓库。

2. 其他项目使用：

   xml

   ```xml
   <!-- 引入自定义Redis Starter -->
   <dependency>
       <groupId>com.itheima</groupId>
       <artifactId>redis-spring-boot-starter</artifactId>
       <version>1.0-SNAPSHOT</version>
   </dependency>
   ```

   

3. 配置

   ```
   application.properties
   ```

   ：

   properties

   

   

   

   

   

   ```properties
   # Redis连接配置（覆盖默认值）
   spring.redis.host=192.168.1.100
   spring.redis.port=6379
   spring.redis.password=123456
   spring.redis.database=1
   ```

   

4. 直接注入

   ```
   RedisUtil
   ```

   使用：

   java

   ```java
   @RestController
   public class TestController {
       @Autowired
       private RedisUtil redisUtil;
   
       @GetMapping("/redis/set")
       public Result<?> setRedis() {
           redisUtil.set("name", "张三", 1, TimeUnit.HOURS);
           return Result.success("设置成功");
       }
   
       @GetMapping("/redis/get")
       public Result<?> getRedis() {
           Object name = redisUtil.get("name");
           return Result.success(name);
       }
   }
   ```

   

### 4. 自定义 Starter 命名规范

- 官方 Starter：`spring-boot-starter-xxx`（如`spring-boot-starter-web`），个人 / 企业禁止使用该格式，避免与官方 Starter 冲突。
- 第三方 / 自定义 Starter：`xxx-spring-boot-starter`（如`redis-spring-boot-starter`、`mybatis-spring-boot-starter`），清晰标识是第三方提供的 Starter。

### 5. 深度避坑指南

| 坑点描述                                                     | 原因分析                                                     | 解决方案                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 自定义 Starter 引入后，自动配置类不生效                      | 1. 未编写`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件；2. 自动配置类的`@Conditional`条件不满足（如缺少核心依赖）；3. Starter 模块未引入自动配置模块依赖 | 1. 确保 AutoConfiguration.imports 文件路径正确，且包含自动配置类全类名；2. 检查 Starter 依赖是否完整，必要时添加`@ConditionalOnMissingClass`等注解放宽条件；3. 确认 Starter 模块的 pom.xml 中已引入自动配置模块 |
| 用户配置文件中的属性未绑定到 RedisProperties                 | 1. 未添加`@ConfigurationProperties`注解；2. 未添加`@EnableConfigurationProperties(RedisProperties.class)`；3. 配置文件属性名与 RedisProperties 属性名不一致 | 1. 在 RedisProperties 类上添加`@ConfigurationProperties(prefix="spring.redis")`；2. 在自动配置类上添加`@EnableConfigurationProperties`；3. 确保属性名一致（如 RedisProperties 的`host`对应`spring.redis.host`），可开启`spring-boot-configuration-processor`依赖生成配置元数据（方便 IDE 提示） |
| 依赖冲突（如用户项目已引入 spring-boot-starter-data-redis，与 Starter 中的依赖冲突） | Starter 模块中直接引入依赖（未设置 scope=provided），导致用户项目存在多个版本的依赖 | 1. 在 Starter 模块的依赖中设置`scope=provided`（仅编译时依赖，不打包到 Starter 中）；2. 不指定依赖版本，继承 SpringBoot 的 parent 工程版本（避免版本冲突） |
| RedisUtil 注入 RedisTemplate 失败（报 NoSuchBeanDefinitionException） | 1. RedisTemplate 未被 Spring 容器管理；2. RedisUtil 未被`@Component`标识，或未被扫描到 | 1. 确保自动配置类中已通过`@Bean`声明 RedisTemplate；2. 给 RedisUtil 添加`@Component`，或在自动配置类中通过`@Bean`声明 RedisUtil；3. 确保自动配置类所在包被 Spring 扫描到 |
| 自定义 Starter 发布到私服后，其他项目无法下载                | 1. 私服地址配置错误；2. Starter 模块打包时未上传到私服；3. 私服权限不足 | 1. 检查 settings.xml 中私服的 url、账号密码配置；2. 执行`mvn clean deploy`将 Starter 上传到私服（需在 pom.xml 中配置 distributionManagement）；3. 联系私服管理员开通下载权限 |

### 6. 通用模板（自定义 Starter 通用骨架）

java

```java
// 1. 配置属性类模板（XXXProperties.java）
@Data
@ConfigurationProperties(prefix = "com.itheima.xxx") // 自定义前缀
public class XXXProperties {
    private String defaultParam = "默认值"; // 配置项，支持用户自定义
    private Integer timeout = 5000;
}

// 2. 自动配置类模板（XXXAutoConfiguration.java）
@Configuration
@ConditionalOnClass(XXXCore.class) // 存在核心类时生效
@EnableConfigurationProperties(XXXProperties.class) // 启用配置绑定
public class XXXAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public XXXCore xxxCore(XXXProperties properties) {
        // 初始化核心组件，注入配置属性
        XXXCore core = new XXXCore();
        core.setDefaultParam(properties.getDefaultParam());
        core.setTimeout(properties.getTimeout());
        return core;
    }

    @Bean
    @ConditionalOnMissingBean
    public XXXUtil xxxUtil(XXXCore xxxCore) {
        // 提供工具类，封装核心组件操作
        return new XXXUtil(xxxCore);
    }
}

// 3. 工具类模板（XXXUtil.java）
@Component
public class XXXUtil {
    private final XXXCore xxxCore;

    // 构造器注入核心组件
    public XXXUtil(XXXCore xxxCore) {
        this.xxxCore = xxxCore;
    }

    // 封装业务方法，供用户调用
    public void doSomething(String param) {
        xxxCore.execute(param);
    }
}

// 4. Starter模块pom.xml模板
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.itheima</groupId>
    <artifactId>xxx-spring-boot-starter</artifactId>
    <version>1.0-SNAPSHOT</version>
    <name>xxx-spring-boot-starter</name>

    <dependencies>
        <!-- 引入自动配置模块 -->
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>xxx-spring-boot-autoconfigure</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <!-- 引入核心依赖（provided避免冲突） -->
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>xxx-core</artifactId>
            <version>1.0.0</version>
            <scope>provided</scope>
        </dependency>

        <!-- SpringBoot自动配置依赖（必要时引入） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
            <version>2.7.15</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
```

------

## 四、Maven 高级：企业级项目管理

### 1. 核心定位

Maven 高级特性聚焦「企业级项目管理」，解决多模块项目协作、依赖统一管理、私服部署、构建流程定制等问题，是大型项目必备的构建工具技能。

### 2. 核心高级特性

#### （1）聚合工程（多模块管理）

##### 核心定位

聚合工程是一个 “空壳工程”（打包类型为 pom），用于管理多个子模块（如`common`、`service`、`web`），实现 “一键构建所有子模块”（编译、测试、打包、部署），避免逐个模块操作。

##### 实际场景：企业级多模块项目结构



```plaintext
hmdp-parent/  # 聚合工程（父工程）
├── pom.xml
├── hmdp-common/  # 通用模块（工具类、实体类）
│   └── pom.xml
├── hmdp-service/  # 业务模块（Service、Mapper）
│   └── pom.xml
└── hmdp-web/  # Web模块（Controller、配置）
    └── pom.xml
```

##### 核心配置（父工程 pom.xml）



```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.itheima</groupId>
    <artifactId>hmdp-parent</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging> <!-- 聚合工程必须设为pom -->
    <name>hmdp-parent</name>

    <!-- 管理子模块 -->
    <modules>
        <module>hmdp-common</module>
        <module>hmdp-service</module>
        <module>hmdp-web</module>
    </modules>

    <!-- 统一管理依赖版本（子模块无需指定version） -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <version>2.7.15</version>
            </dependency>
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-starter</artifactId>
                <version>2.3.1</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!-- 所有子模块共用的插件配置 -->
    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.8.1</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

##### 子模块 pom.xml 配置（以 hmdp-web 为例）

xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <!-- 继承父工程 -->
    <parent>
        <groupId>com.itheima</groupId>
        <artifactId>hmdp-parent</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <modelVersion>4.0.0</modelVersion>
    <artifactId>hmdp-web</artifactId>
    <name>hmdp-web</name>

    <!-- 引入依赖（无需指定version，继承父工程） -->
    <dependencies>
        <!-- 依赖common模块 -->
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>hmdp-common</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <!-- 引入SpringBoot Web依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
```

##### 聚合工程核心命令

- 一键构建所有子模块：在父工程目录执行`mvn clean package`，Maven 会按模块依赖顺序构建（先构建`common`，再构建`service`，最后构建`web`）。
- 构建单个子模块：在父工程目录执行`mvn clean package -pl hmdp-web -am`（`-pl`指定模块，`-am`同时构建依赖的模块）。

#### （2）依赖管理（dependencyManagement）

##### 核心作用

- 统一管理依赖版本：子模块引入依赖时无需指定`version`，由父工程统一控制，避免版本冲突。
- 按需引入：父工程仅声明依赖版本，子模块需显式引入才会生效（区别于`dependencies`标签，子模块会自动继承）。

##### 与 dependencies 的区别

| 对比维度 | dependencyManagement                   | dependencies                                        |
| -------- | -------------------------------------- | --------------------------------------------------- |
| 作用     | 声明依赖版本，统一管理                 | 实际引入依赖，子模块会自动继承                      |
| 版本控制 | 子模块无需指定 version，继承父工程版本 | 子模块未指定 version 时，继承父工程版本；指定则覆盖 |
| 依赖传递 | 不传递依赖，子模块需显式引入           | 传递依赖，子模块自动继承                            |

#### （3）私服配置与部署（企业必备）

##### 核心作用

- 私服是企业内部的 Maven 仓库，用于存储：
  1. 企业内部开发的组件（如自定义 Starter、通用模块）。
  2. 缓存中央仓库的依赖（减少外网访问，提高构建速度）。
  3. 第三方付费依赖（如 Oracle 驱动）。

##### 私服配置（settings.xml）

1. 配置私服账号密码：

   xml

   

   ```xml
   <servers>
       <server>
           <id>company-nexus</id> <!-- 与mirror的id一致 -->
           <username>nexus-admin</username>
           <password>123456</password>
       </server>
   </servers>
   ```

   

2. 配置私服镜像（优先从私服下载依赖）：

   xml

   

   ```xml
   <mirrors>
       <mirror>
           <id>company-nexus</id>
           <name>企业私服</name>
           <url>http://192.168.1.200:8081/repository/public/</url>
           <mirrorOf>central</mirrorOf> <!-- 镜像中央仓库 -->
       </mirror>
   </mirrors>
   ```

   

##### 部署项目到私服（pom.xml 配置）

在需要部署的模块（如自定义 Starter）的 pom.xml 中添加：

xml

```xml
<distributionManagement>
    <repository>
        <id>company-nexus-releases</id> <!-- 与settings.xml的server.id一致 -->
        <name>企业私服发布版仓库</name>
        <url>http://192.168.1.200:8081/repository/releases/</url>
    </repository>
    <snapshotRepository>
        <id>company-nexus-snapshots</id>
        <name>企业私服快照版仓库</name>
        <url>http://192.168.1.200:8081/repository/snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

执行部署命令：`mvn clean deploy`（将模块打包并上传到私服对应仓库）。

#### （4）生命周期与插件开发（定制构建流程）

##### Maven 生命周期

Maven 有三套独立的生命周期，每套生命周期包含多个阶段，执行后一阶段会自动执行前序阶段：

1. **Clean 生命周期**：清理构建产物（`clean`）。
2. **Default 生命周期**：核心构建流程（`validate`→`compile`→`test`→`package`→`install`→`deploy`）。
3. **Site 生命周期**：生成项目文档（`site`→`site-deploy`）。

##### 插件与生命周期的关系

- 插件是生命周期阶段的实现者（如`maven-compiler-plugin`实现`compile`阶段，`maven-surefire-plugin`实现`test`阶段）。
- 自定义插件：通过编写 Maven 插件，定制构建流程（如代码生成、自动部署、版本号替换）。

##### 自定义 Maven 插件示例（简单代码生成插件）

1. 创建插件项目（打包类型为 maven-plugin）：

   xml

   ```xml
   <packaging>maven-plugin</packaging>
   <dependencies>
       <dependency>
           <groupId>org.apache.maven</groupId>
           <artifactId>maven-plugin-api</artifactId>
           <version>3.8.5</version>
       </dependency>
       <dependency>
           <groupId>org.apache.maven.plugin-tools</groupId>
           <artifactId>maven-plugin-annotations</artifactId>
           <version>3.6.4</version>
           <scope>provided</scope>
       </dependency>
   </dependencies>
   ```

   

2. 编写插件目标（Mojo）：

   java

   ```java
   import org.apache.maven.plugin.AbstractMojo;
   import org.apache.maven.plugin.MojoExecutionException;
   import org.apache.maven.plugins.annotations.Mojo;
   import org.apache.maven.plugins.annotations.Parameter;
   import java.io.File;
   import java.io.FileWriter;
   import java.io.IOException;
   
   // 插件目标：generate-code，绑定到compile阶段前执行
   @Mojo(name = "generate-code", defaultPhase = org.apache.maven.plugins.annotations.LifecyclePhase.COMPILE)
   public class CodeGenerateMojo extends AbstractMojo {
   
       // 配置参数：从pom.xml读取
       @Parameter(property = "generate.entityName", required = true)
       private String entityName;
   
       @Parameter(defaultValue = "${project.build.sourceDirectory}/../generated-sources")
       private File outputDirectory;
   
       @Override
       public void execute() throws MojoExecutionException {
           // 1. 创建输出目录
           if (!outputDirectory.exists()) {
               outputDirectory.mkdirs();
           }
   
           // 2. 生成Java文件（如实体类）
           String code = "public class " + entityName + " {\n" +
                   "    private Long id;\n" +
                   "    // getter/setter\n" +
                   "}";
   
           // 3. 写入文件
           File file = new File(outputDirectory, entityName + ".java");
           try (FileWriter writer = new FileWriter(file)) {
               writer.write(code);
               getLog().info("成功生成实体类：" + file.getAbsolutePath());
           } catch (IOException e) {
               throw new MojoExecutionException("生成代码失败", e);
           }
       }
   }
   ```

   

3. 打包插件：`mvn clean install`，安装到本地仓库。

4. 其他项目使用插件：

   xml

   

   ```xml
   <build>
       <plugins>
           <plugin>
               <groupId>com.itheima</groupId>
               <artifactId>code-generate-plugin</artifactId>
               <version>1.0-SNAPSHOT</version>
               <executions>
                   <execution>
                       <goals>
                           <goal>generate-code</goal>
                       </goals>
                       <configuration>
                           <entityName>User</entityName> <!-- 生成User实体类 -->
                       </configuration>
                   </execution>
               </executions>
           </plugin>
       </plugins>
   </build>
   ```

   

执行`mvn compile`，插件会自动生成`User.java`文件到`generated-sources`目录。

### 3. 深度避坑指南

| 坑点描述                                                     | 原因分析                                                     | 解决方案                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 聚合工程构建时，子模块依赖的其他子模块未找到（报 MissingArtifactException） | 1. 子模块的依赖顺序错误（如 web 模块依赖 service 模块，但 service 模块未先构建）；2. 依赖的子模块未安装到本地仓库 | 1. 确保父工程的``标签中，子模块顺序按依赖关系排列（先 common，再 service，最后 web）；2. 先执行`mvn clean install`安装所有子模块到本地仓库，再执行构建；3. 使用`mvn clean package -am`构建时自动构建依赖模块 |
| 私服部署失败（报 401 Unauthorized）                          | 1. settings.xml 中 server 的 id 与 pom.xml 中 distributionManagement 的 repository.id 不一致；2. 私服账号密码错误；3. 私服仓库权限不足（如快照版部署到发布版仓库） | 1. 确保 server.id 与 repository.id 完全一致；2. 检查私服账号密码是否正确，是否有部署权限；3. 确认版本号：SNAPSHOT 版部署到 snapshotRepository，RELEASE 版部署到 repository |
| 依赖管理中声明的版本不生效，子模块仍需指定 version           | 1. 子模块引入的依赖在父工程的 dependencyManagement 中未声明；2. 子模块引入依赖时，groupId 或 artifactId 与父工程不一致；3. 父工程的 dependencyManagement 标签嵌套错误（如放在 dependencies 标签内） | 1. 在父工程的 dependencyManagement 中添加该依赖的完整坐标；2. 确保子模块依赖的 groupId、artifactId 与父工程完全一致；3. 检查 pom.xml 结构，dependencyManagement 应与 dependencies 同级，而非嵌套 |
| 自定义 Maven 插件执行时，参数未注入（报 NullPointerException） | 1. 插件参数未添加`@Parameter`注解；2. 参数名与 pom.xml 中 configuration 的配置项不一致；3. required=true 的参数未在 pom.xml 中配置 | 1. 给插件参数添加`@Parameter`注解，指定 property 属性（如`@Parameter(property="generate.entityName")`）；2. 确保 pom.xml 中 configuration 的配置项名称与参数名一致；3. 若参数 required=true，必须在 configuration 中配置该参数 |
| 多模块项目中，子模块打包类型错误（如 service 模块打包为 war） | 子模块的 packaging 标签配置错误（service 模块应打包为 jar，web 模块打包为 war） | 1. 通用模块（common、service）打包类型设为 jar（默认）；2. Web 模块打包类型设为 war；3. 聚合工程（父模块）打包类型设为 pom |

### 4. 通用模板（Maven 聚合工程通用骨架）

plaintext











```plaintext
parent-project/
├── pom.xml  # 父工程（聚合+依赖管理）
├── module-common/  # 通用模块
│   └── pom.xml
├── module-service/  # 业务模块
│   └── pom.xml
└── module-web/  # Web模块
    └── pom.xml
```

#### 父工程 pom.xml 模板

xml











```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.itheima</groupId>
    <artifactId>parent-project</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>parent-project</name>

    <!-- 子模块管理 -->
    <modules>
        <module>module-common</module>
        <module>module-service</module>
        <module>module-web</module>
    </modules>

    <!-- 依赖版本管理 -->
    <dependencyManagement>
        <dependencies>
            <!-- SpringBoot核心依赖 -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-parent</artifactId>
                <version>2.7.15</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- 通用依赖 -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-test</artifactId>
                <scope>test</scope>
            </dependency>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.24</version>
                <optional>true</optional>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!-- 插件管理 -->
    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.8.1</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                        <encoding>UTF-8</encoding>
                    </configuration>
                </plugin>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <version>2.7.15</version>
                    <configuration>
                        <excludes>
                            <exclude>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                            </exclude>
                        </excludes>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

#### 子模块（module-web）pom.xml 模板

xml



```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>com.itheima</groupId>
        <artifactId>parent-project</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <modelVersion>4.0.0</modelVersion>
    <artifactId>module-web</artifactId>
    <name>module-web</name>
    <packaging>war</packaging>

    <dependencies>
        <!-- 依赖业务模块 -->
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>module-service</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <!-- 引入SpringBoot Web依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 测试依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- 引入SpringBoot打包插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

------



### 面试题 1（基础原理 + 场景应用，难度：★★★☆☆）

1. SpringAOP 中，前置通知（@Before）、后置通知（@After）、环绕通知（@Around）的核心区别是什么？请分别说明它们的执行时机和适用场景。2. SpringAOP 的动态代理有哪两种实现方式？它们的适用条件和核心区别是什么？3. SpringBoot 的自动配置核心注解 @EnableAutoConfiguration 的实现原理是什么？请简述 SPI 机制在自动配置中的作用流程。

### 面试题 2（原理深度 + Starter 基础，难度：★★★★☆）

1. 为什么 SpringAOP 中 “内部方法调用”（如 Service 中 a () 调用本类 b ()）无法触发 b () 的切面逻辑？请从代理对象的角度分析根源，并给出至少 2 种解决方案。2. SpringBoot 的条件注解（@ConditionalOnClass、@ConditionalOnMissingBean）的作用是什么？请举例说明如何通过条件注解控制自定义 Starter 的自动配置类是否生效。3. 自定义 Starter 的核心组成部分有哪些？请简述 “配置属性类（XXXProperties）” 与 “自动配置类（XXXAutoConfiguration）” 的关联逻辑，以及 @ConfigurationProperties 注解的作用。

### 面试题 3（Maven 高级 + Starter 实战，难度：★★★★☆）

1. Maven 聚合工程中，父工程的<dependencyManagement>与<dependencies>标签的核心区别是什么？为什么企业多模块项目中优先使用<dependencyManagement>管理依赖版本？2. 自定义 Starter 中，如何让用户在 application.properties 中配置的属性（如 spring.redis.host）自动绑定到自定义的配置属性类（RedisProperties）？需要哪些关键注解和配置？3. SpringBoot 项目中，若引入的自定义 Starter 与官方 Starter 存在依赖冲突（如同一 jar 包的不同版本），请给出至少 2 种解决方案，并说明原理。

### 面试题 4（综合应用 + 问题排查，难度：★★★★☆）

1. SpringAOP 的环绕通知中，若未调用 ProceedingJoinPoint 的 proceed () 方法，会导致什么问题？若调用多次 proceed () 方法，又会出现什么情况？请结合切面逻辑执行流程说明。2. SpringBoot 启动时，如何通过日志排查自动配置类未生效的问题？请说明关键日志配置（debug=true）的作用，以及如何解读 “Positive matches” 和 “Negative matches” 的输出结果。3. Maven 聚合工程中，子模块依赖其他子模块（如 web 模块依赖 service 模块）时，构建顺序异常导致 “MissingArtifactException”，可能的原因有哪些？请给出对应的解决方案。

### 面试题 5（高并发优化 + 高级特性，难度：★★★★★）

1. 高并发场景下，使用 SpringAOP 记录接口日志时，可能存在哪些性能问题？如何优化？请结合 ThreadLocal、异步日志、切入点表达式优化等思路给出具体方案。2. 自定义 Starter 需要支持 “多环境适配”（如开发环境启用调试模式，生产环境禁用），如何通过 SpringBoot 的条件注解组合（如 @ConditionalOnProperty+@ConditionalOnClass）实现？请编写核心代码示例。3. 企业级项目中，需要开发一个 Maven 插件，实现 “编译前自动生成实体类” 的功能（根据数据库表结构生成 Java 实体）。请简述该插件的核心开发流程，以及如何将插件绑定到 Maven 的生命周期阶段（如 compile 前）。

------

### 参考答案 1

#### 1. 三种通知的核心区别、执行时机与适用场景

| 通知类型 | 执行时机                                   | 核心区别                                                     | 适用场景                                                     |
| -------- | ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| @Before  | 目标方法执行**前**执行                     | 仅能获取请求参数，无法修改目标方法参数和返回值；无返回值     | 权限校验、日志记录（请求参数）、前置准备（如数据源切换）     |
| @After   | 目标方法执行**后**执行（无论是否抛出异常） | 仅能获取目标方法执行状态，无法干预执行流程；无返回值         | 资源释放（如关闭连接）、日志记录（执行耗时）                 |
| @Around  | 目标方法执行**前后**均可干预               | 可控制目标方法是否执行（是否调用 proceed ()）；可修改参数和返回值；必须返回 proceed () 的结果 | 日志记录（完整请求 - 响应链路）、性能监控、异常捕获与重试、参数 / 返回值修改 |

#### 2. SpringAOP 动态代理的两种实现方式

| 实现方式       | 适用条件                                    | 核心区别                                                     | 实现原理                                                     |
| -------------- | ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| JDK 动态代理   | 目标对象**必须实现接口**                    | 仅支持接口代理；生成代理类效率高；基于反射                   | 动态生成目标接口的代理类，实现 InvocationHandler 接口，通过 invoke () 方法植入切面逻辑 |
| CGLIB 动态代理 | 目标对象**无需实现接口**（不能是 final 类） | 支持类代理；生成代理类效率中等，运行效率高；基于字节码       | 基于 ASM 框架生成目标类的子类，重写目标方法，植入切面逻辑    |
| 核心区别总结   | ——                                          | 1. 依赖条件：接口 vs 类；2. 实现原理：反射 vs 字节码；3. 效率：生成速度 JDK 更优，运行速度 CGLIB 更优 | ——                                                           |

#### 3. @EnableAutoConfiguration 的实现原理与 SPI 机制流程

- 核心原理：`@EnableAutoConfiguration`是 SpringBoot 自动配置的入口，通过**SPI（Service Provider Interface）机制**动态加载符合条件的自动配置类，实现 “引入依赖即配置”。
- SPI 机制在自动配置中的作用流程：
  1. SpringBoot 启动时，`@EnableAutoConfiguration`注解触发`AutoConfigurationImportSelector`类执行。
  2. 该类调用`loadFactoryNames()`方法，读取类路径下`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件。
  3. 该文件中存储了所有官方自动配置类的全类名（如`DataSourceAutoConfiguration`、`MybatisAutoConfiguration`）。
  4. Spring 对每个自动配置类执行条件校验（通过`@Conditional`系列注解，如`@ConditionalOnClass`检查是否存在依赖类）。
  5. 校验通过的自动配置类被加载，通过`@Bean`声明核心组件（如`DataSource`、`SqlSessionFactory`），注入 Spring 容器。

### 参考答案 2

#### 1. 内部方法调用无法触发 AOP 的根源与解决方案

- 根源分析：SpringAOP 的切面逻辑是通过

  代理对象

  植入的。当执行内部方法调用时（如

  ```
  a()
  ```

  调用本类

  ```
  b()
  ```

  ），是目标对象直接调用自身方法，未经过 Spring 生成的代理对象，因此切面逻辑无法被拦截。

  java

  

  运行

  ```java
  @Service
  public class UserServiceImpl implements UserService {
      @Override
      public void a() {
          b(); // 直接调用目标对象的b()方法，未经过代理对象
      }
  
      @Around("execution(* com.itheima.service.*.*(..))")
      public void aroundB(ProceedingJoinPoint joinPoint) throws Throwable {
          System.out.println("b()方法切面逻辑");
          joinPoint.proceed();
      }
  
      @Override
      public void b() {
          System.out.println("b()方法业务逻辑");
      }
  }
  ```

  

- 解决方案：

  1. 注入自身代理对象（推荐）：通过

     ```
     @Autowired
     ```

     注入当前 Service 的代理对象，通过代理对象调用内部方法：

     java

     

     运行

     ```java
     @Service
     public class UserServiceImpl implements UserService {
         @Autowired
         private UserService userService; // 注入代理对象（而非目标对象）
     
         @Override
         public void a() {
             userService.b(); // 代理对象调用b()，触发切面
         }
         // ... 其他方法
     }
     ```

     

  2. 从 Spring 容器中获取代理对象：通过

     ```
     ApplicationContext
     ```

     获取当前 Bean 的代理对象：

     java

     

     运行

     ```java
     @Service
     public class UserServiceImpl implements UserService, ApplicationContextAware {
         private ApplicationContext applicationContext;
     
         @Override
         public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
             this.applicationContext = applicationContext;
         }
     
         @Override
         public void a() {
             UserService proxy = applicationContext.getBean(UserService.class);
             proxy.b(); // 容器获取的是代理对象
         }
         // ... 其他方法
     }
     ```

     

  3. 重构代码：将内部方法拆分到独立的 Service 类，通过依赖注入调用，避免内部调用。

#### 2. 条件注解的作用与自动配置类生效控制示例

- 条件注解的核心作用：根据指定条件判断是否加载自动配置类或创建 Bean，实现 “按需配置”，避免不必要的组件被注入容器。

- 关键条件注解说明：

  - `@ConditionalOnClass`：当项目中存在指定类时，配置生效（如存在`RedisTemplate.class`才加载 Redis 自动配置）。
  - `@ConditionalOnMissingBean`：当容器中不存在指定 Bean 时，才创建当前 Bean（允许用户自定义 Bean 覆盖默认配置）。
  - `@ConditionalOnProperty`：当配置文件中存在指定属性且值匹配时，配置生效（如`spring.redis.enabled=true`）。

- 自定义 Starter 自动配置类生效控制示例：

  java

  

  运行

  ```java
  // 自定义Redis自动配置类
  @Configuration
  @ConditionalOnClass(RedisTemplate.class) // 存在RedisTemplate类才生效（引入spring-boot-starter-data-redis后满足）
  @ConditionalOnProperty(prefix = "spring.redis", name = "enabled", havingValue = "true", matchIfMissing = true) // 配置enabled=true或未配置时生效
  @EnableConfigurationProperties(RedisProperties.class)
  public class RedisAutoConfiguration {
      @Bean
      @ConditionalOnMissingBean // 容器中无RedisTemplate时才创建
      public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
          // 自定义RedisTemplate配置（如序列化）
          RedisTemplate<String, Object> template = new RedisTemplate<>();
          template.setConnectionFactory(factory);
          // ... 序列化配置
          return template;
      }
  }
  ```

  

- 生效逻辑：当项目引入`spring-boot-starter-data-redis`依赖（满足`@ConditionalOnClass`），且`spring.redis.enabled`未配置或为`true`（满足`@ConditionalOnProperty`）时，该自动配置类生效；若用户已自定义`RedisTemplate` Bean（满足`@ConditionalOnMissingBean`），则默认 Bean 不创建。

#### 3. 自定义 Starter 的核心组成与配置绑定逻辑

- 自定义 Starter 的核心组成：

  1. 配置属性类（XXXProperties）：绑定用户配置文件中的属性。
  2. 自动配置类（XXXAutoConfiguration）：根据条件创建 Bean，注入容器。
  3. 核心业务组件（如工具类、服务类）：Starter 提供的核心功能。
  4. META-INF 配置文件：`AutoConfiguration.imports`（指定自动配置类）。

- 配置属性类与自动配置类的关联逻辑：

  1. 配置属性类通过`@ConfigurationProperties(prefix = "xxx")`注解，绑定配置文件中前缀为`xxx`的属性（如`spring.redis`）。
  2. 自动配置类通过`@EnableConfigurationProperties(XXXProperties.class)`注解，启用配置绑定，将 XXXProperties 注入为 Spring Bean。
  3. 自动配置类在创建核心 Bean 时，从 XXXProperties 中获取配置值（如 Redis 的 host、port），初始化组件。

- ```
  @ConfigurationProperties
  ```

  的作用：

  - 自动绑定配置文件中的属性到 Java 类的字段（支持类型转换、默认值）。
  - 提供配置元数据，支持 IDE 自动提示（需引入`spring-boot-configuration-processor`依赖）。

- 示例代码：

  java

  

  运行

  ```java
  // 配置属性类
  @Data
  @ConfigurationProperties(prefix = "spring.redis")
  public class RedisProperties {
      private String host = "localhost"; // 默认值
      private Integer port = 6379;
      private String password = "";
  }
  
  // 自动配置类
  @Configuration
  @EnableConfigurationProperties(RedisProperties.class) // 启用配置绑定
  public class RedisAutoConfiguration {
      @Bean
      public RedisConnectionFactory redisConnectionFactory(RedisProperties properties) {
          LettuceConnectionFactory factory = new LettuceConnectionFactory();
          factory.setHostName(properties.getHost()); // 从配置属性类获取值
          factory.setPort(properties.getPort());
          factory.setPassword(properties.getPassword());
          return factory;
      }
  }
  ```

  

### 参考答案 3

#### 1. <dependencyManagement>与<dependencies>的核心区别

| 对比维度 | <dependencyManagement>                                       | <dependencies>                                               |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 核心作用 | 声明依赖版本，统一管理（不实际引入依赖）                     | 实际引入依赖，子模块自动继承                                 |
| 依赖传递 | 不传递依赖，子模块需显式引入才生效                           | 传递依赖，子模块无需显式引入即可使用                         |
| 版本控制 | 子模块引入时无需指定 version，继承父工程版本；子模块可指定 version 覆盖父工程 | 子模块未指定 version 时继承父工程版本；指定则覆盖            |
| 适用场景 | 企业多模块项目，统一控制所有模块的依赖版本，避免冲突         | 所有模块都需要使用的依赖（如 lombok、spring-boot-starter-test） |

- 企业多模块项目优先使用<dependencyManagement>的原因：
  1. 版本统一：所有子模块使用统一的依赖版本，避免 “同一依赖不同版本” 导致的冲突（如 Spring 核心依赖版本不一致）。
  2. 按需引入：子模块仅引入自身需要的依赖，避免不必要的依赖被打包（如 web 模块引入 spring-boot-starter-web，service 模块无需引入）。
  3. 维护便捷：修改依赖版本时，仅需修改父工程的<dependencyManagement>，无需逐个修改子模块。

#### 2. 自定义 Starter 的配置属性绑定实现

要实现用户配置与自定义配置类的绑定，需 3 个关键步骤：

1. 编写配置属性类，添加

   ```
   @ConfigurationProperties
   ```

   注解：

   java

   ```java
   @Data
   @ConfigurationProperties(prefix = "com.itheima.starter") // 配置前缀
   public class StarterProperties {
       private Boolean enabled = true; // 默认值：启用
       private String appName = "default-app";
       private Integer timeout = 3000;
   }
   ```

   

2. 在自动配置类中添加

   ```
   @EnableConfigurationProperties
   ```

   注解，启用配置绑定：

   java

   

   运行

   ```java
   @Configuration
   @EnableConfigurationProperties(StarterProperties.class) // 关键：启用绑定
   public class StarterAutoConfiguration {
       // 注入配置属性类
       private final StarterProperties properties;
   
       // 构造器注入（推荐，Spring 4.3+支持构造器注入无需@Autowired）
       public StarterAutoConfiguration(StarterProperties properties) {
           this.properties = properties;
       }
   
       @Bean
       public StarterService starterService() {
           StarterService service = new StarterService();
           service.setEnabled(properties.getEnabled());
           service.setAppName(properties.getAppName());
           service.setTimeout(properties.getTimeout());
           return service;
       }
   }
   ```

   

3. 引入配置元数据依赖（可选，支持 IDE 自动提示）：

   xml

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-configuration-processor</artifactId>
       <version>2.7.15</version>
       <optional>true</optional>
   </dependency>
   ```

   

- 用户使用方式：在 application.properties 中配置：

  properties

  ```properties
  # 自定义Starter配置（前缀与@ConfigurationProperties一致）
  com.itheima.starter.enabled=true
  com.itheima.starter.appName=my-app
  com.itheima.starter.timeout=5000
  ```

  

- 核心原理：`@ConfigurationProperties`注解会触发 SpringBoot 的配置绑定机制，自动将配置文件中前缀匹配的属性值注入到配置属性类的对应字段（支持类型转换、默认值、空值处理）。

#### 3. 自定义 Starter 与官方 Starter 的依赖冲突解决方案

依赖冲突的核心原因：自定义 Starter 与官方 Starter 引入了同一 jar 包的不同版本（如自定义 Starter 依赖 spring-core 5.2.0，官方 spring-boot-starter-web 依赖 spring-core 5.3.20）。

解决方案：

1. 排除冲突依赖（推荐）：在自定义 Starter 的依赖中，排除冲突的 jar 包，让子模块继承官方 Starter 的版本：

   xml

   ```xml
   <!-- 自定义Starter的pom.xml -->
   <dependency>
       <groupId>org.springframework</groupId>
       <artifactId>spring-core</artifactId>
       <version>5.2.0</version>
       <exclusions>
           <!-- 排除冲突的依赖，使用官方Starter的版本 -->
           <exclusion>
               <groupId>org.springframework</groupId>
               <artifactId>spring-jcl</artifactId>
           </exclusion>
       </exclusions>
   </dependency>
   ```

   

   或在子模块中引入自定义 Starter 时排除冲突依赖：

   xml

   ```xml
   <!-- 子模块的pom.xml -->
   <dependency>
       <groupId>com.itheima</groupId>
       <artifactId>my-starter</artifactId>
       <version>1.0-SNAPSHOT</version>
       <exclusions>
           <exclusion>
               <groupId>org.springframework</groupId>
               <artifactId>spring-core</artifactId>
           </exclusion>
       </exclusions>
   </dependency>
   ```

   

2. 统一依赖版本：在父工程的<dependencyManagement>中声明冲突依赖的统一版本，覆盖所有子模块的版本：

   xml

   ```xml
   <!-- 父工程pom.xml -->
   <dependencyManagement>
       <dependencies>
           <dependency>
               <groupId>org.springframework</groupId>
               <artifactId>spring-core</artifactId>
               <version>5.3.20</version> <!-- 与官方Starter版本一致 -->
           </dependency>
       </dependencies>
   </dependencyManagement>
   ```

   

3. 使用

   ```
   <scope>provided</scope>
   ```

   ：在自定义 Starter 中，将冲突依赖的 scope 设为 provided，表明该依赖由用户项目提供（如官方 Starter），避免打包到 Starter 中：

   xml

   ```xml
   <!-- 自定义Starter的pom.xml -->
   <dependency>
       <groupId>org.springframework</groupId>
       <artifactId>spring-core</artifactId>
       <version>5.2.0</version>
       <scope>provided</scope> <!-- 仅编译时依赖，不打包 -->
   </dependency>
   ```

   

### 参考答案 4

#### 1. 环绕通知中 proceed () 方法的调用影响

- 未调用 proceed () 方法：目标方法

  不会执行

  ，仅执行环绕通知中的切面逻辑（如日志记录）。

  - 原因：环绕通知是 “包裹” 目标方法的，proceed () 方法是触发目标方法执行的关键入口，未调用则目标方法无法被触发。

  - 示例：

    java

    

    运行

    ```java
    @Around("logPointcut()")
    public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("切面逻辑执行");
        // 未调用joinPoint.proceed()
        return null; // 目标方法未执行
    }
    ```

    

- 多次调用 proceed () 方法：目标方法会

  多次执行

  （调用几次 proceed () 就执行几次），可能导致重复业务逻辑（如重复插入数据、重复扣减库存）。

  - 示例：

    java

    

    运行

    ```java
    @Around("logPointcut()")
    public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("切面逻辑执行");
        Object result1 = joinPoint.proceed(); // 第一次执行目标方法
        Object result2 = joinPoint.proceed(); // 第二次执行目标方法
        return result1;
    }
    ```

    

- 正确用法：仅调用一次 proceed () 方法，并返回其结果（确保目标方法正常执行，且返回值能传递给前端）：

  java

  

  运行

  ```java
  @Around("logPointcut()")
  public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
      try {
          // 前置逻辑
          Object result = joinPoint.proceed(); // 仅调用一次
          // 后置逻辑
          return result;
      } catch (Exception e) {
          // 异常逻辑
          throw e;
      }
  }
  ```

  

#### 2. SpringBoot 自动配置类未生效的日志排查方案

- 关键配置：在 application.properties 中添加`debug=true`，SpringBoot 启动时会打印自动配置的详细日志。
- 日志解读：
  1. Positive matches（生效的自动配置类）：列出所有满足条件、已加载的自动配置类（如`RedisAutoConfiguration`）。
  2. Negative matches（未生效的自动配置类）：列出未满足条件、未加载的自动配置类，并说明原因（如 “@ConditionalOnClass did not find required class 'redis.clients.jedis.Jedis'”）。
- 排查步骤：
  1. 启动项目，搜索日志中的 “AutoConfigurationReport”，找到目标自动配置类（如`MyStarterAutoConfiguration`）。
  2. 若在 Negative matches 中：查看 “Reason” 列的原因，针对性解决：
     - 原因 1：`@ConditionalOnClass did not find required class 'xxx'` → 项目缺少必要依赖，引入对应依赖。
     - 原因 2：`@ConditionalOnMissingBean found existing bean 'xxx'` → 容器中已存在该 Bean，用户自定义 Bean 覆盖了自动配置。
     - 原因 3：`@ConditionalOnProperty did not find property 'xxx.enabled'` → 配置文件中未启用该配置，添加`xxx.enabled=true`。
  3. 若未找到目标自动配置类：检查`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件是否正确配置了自动配置类的全类名。

#### 3. Maven 聚合工程子模块依赖构建顺序异常的原因与解决方案

- 可能原因：

  1. 父工程的``标签中子模块顺序与依赖顺序不一致（如 web 模块依赖 service 模块，但``中 web 在 service 之前）。
  2. 依赖的子模块未安装到本地仓库（如 service 模块未执行`mvn install`，web 模块构建时无法找到 service 的 jar 包）。
  3. 子模块的``标签配置错误（如父工程的 groupId、artifactId、version 与实际不一致）。
  4. 依赖的子模块打包类型错误（如 service 模块打包为 war，web 模块依赖时无法识别）。

- 解决方案：

  1. 调整

     ```
     <modules>
     ```

     顺序：确保子模块顺序与依赖关系一致（先依赖后被依赖），如：

     xml

     ```xml
     <!-- 父工程pom.xml -->
     <modules>
         <module>module-common</module> <!-- 无依赖，最先构建 -->
         <module>module-service</module> <!-- 依赖common -->
         <module>module-web</module> <!-- 依赖service和common -->
     </modules>
     ```

     

  2. 安装依赖模块到本地仓库：先在父工程执行`mvn clean install`，将所有子模块安装到本地仓库，再构建目标模块。

  3. 构建时指定依赖模块：使用

     ```
     -pl
     ```

     （指定模块）和

     ```
     -am
     ```

     （构建依赖模块）参数，如构建 web 模块时自动构建其依赖的 service 和 common 模块：

     bash

     ```bash
     mvn clean package -pl module-web -am
     ```

     

  4. 检查子模块配置：

     - 确保依赖的子模块打包类型为 jar（通用模块、业务模块）。
     - 确保子模块的``标签与父工程的坐标完全一致。

### 参考答案 5

#### 1. 高并发下 SpringAOP 日志记录的性能问题与优化方案

- 潜在性能问题：

  1. 同步日志：切面逻辑与业务逻辑同步执行，日志写入（如数据库、文件）耗时过长，导致接口响应延迟。
  2. 切入点表达式过宽：如`execution(* com.itheima..*(..))`拦截所有方法，包括频繁执行的工具类方法，增加代理开销。
  3. 线程安全问题：切面中使用非线程安全的对象（如全局变量），导致并发时数据错乱。
  4. 序列化开销：日志中序列化复杂参数（如大对象），占用 CPU 和内存。

- 优化方案：

  1. 异步日志记录（核心优化）：将日志写入逻辑异步执行，不阻塞业务线程。

     - 实现方式：使用 Spring 的

       ```
       @Async
       ```

       注解，配合线程池：

       java

       

       运行

       ```java
       // 1. 配置异步线程池
       @Configuration
       @EnableAsync
       public class AsyncConfig {
           @Bean
           public Executor asyncExecutor() {
               ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
               executor.setCorePoolSize(5);
               executor.setMaxPoolSize(10);
               executor.setQueueCapacity(20);
               executor.setThreadNamePrefix("AsyncLog-");
               executor.initialize();
               return executor;
           }
       }
       
       // 2. 异步日志服务
       @Service
       public class AsyncLogService {
           @Async // 异步执行
           public void saveLog(String url, String params, long costTime) {
               // 日志写入数据库/文件（耗时操作）
               System.out.println("异步保存日志：" + url + ", " + params + ", " + costTime);
           }
       }
       
       // 3. 切面中调用异步服务
       @Aspect
       @Component
       public class LogAspect {
           @Autowired
           private AsyncLogService asyncLogService;
       
           @Around("execution(* com.itheima.controller..*.*(..))") // 仅拦截Controller方法
           public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
               long startTime = System.currentTimeMillis();
               // 获取请求信息（简化，避免复杂序列化）
               String url = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getRequestURI();
               String params = Arrays.toString(joinPoint.getArgs());
       
               Object result = joinPoint.proceed(); // 执行业务逻辑
       
               // 异步记录日志（不阻塞业务线程）
               long costTime = System.currentTimeMillis() - startTime;
               asyncLogService.saveLog(url, params, costTime);
       
               return result;
           }
       }
       ```

       

  2. 优化切入点表达式：精准拦截目标方法（如仅拦截 Controller 层接口），避免不必要的代理：

     java

     

     运行

     ```java
     // 仅拦截Controller层的public方法，排除内部私有方法
     @Pointcut("execution(public * com.itheima.controller..*.*(..))")
     public void logPointcut() {}
     ```

     

  3. 线程安全优化：使用 ThreadLocal 存储线程私有数据（如请求上下文），避免全局变量：

     java

     

     运行

     ```java
     @Aspect
     @Component
     public class LogAspect {
         // ThreadLocal存储当前线程的请求信息
         private static final ThreadLocal<LogContext> LOG_CONTEXT = new ThreadLocal<>();
     
         @Before("logPointcut()")
         public void beforeLog() {
             LogContext context = new LogContext();
             context.setRequestTime(LocalDateTime.now());
             LOG_CONTEXT.set(context);
         }
     
         @After("logPointcut()")
         public void afterLog() {
             LOG_CONTEXT.remove(); // 避免内存泄漏
         }
     
         // 内部类：日志上下文
         @Data
         private static class LogContext {
             private LocalDateTime requestTime;
             private String url;
         }
     }
     ```

     

  4. 简化日志数据：避免序列化复杂对象，仅记录关键参数（如 ID、名称），减少开销。

#### 2. 自定义 Starter 多环境适配的条件注解组合实现

需求：自定义 Starter 支持 “开发环境启用调试模式（打印详细日志），生产环境禁用调试模式”，通过配置文件`spring.profiles.active`控制。

核心实现：使用`@ConditionalOnProperty`（判断环境配置）+`@ConditionalOnClass`（判断依赖是否存在）组合条件注解，控制调试组件的创建。

步骤 1：编写配置属性类，添加环境适配配置：

java



运行

```java
@Data
@ConfigurationProperties(prefix = "com.itheima.starter")
public class StarterProperties {
    private Boolean debug = false; // 默认禁用调试模式
}
```

步骤 2：编写调试组件（开发环境启用）：

java



运行

```java
public class DebugLogger {
    public void printDebugLog(String message) {
        System.out.println("[DEBUG] " + message);
    }
}
```

步骤 3：自动配置类中使用条件注解组合：

java



运行

```java
@Configuration
@EnableConfigurationProperties(StarterProperties.class)
public class StarterAutoConfiguration {
    // 开发环境启用调试组件：满足两个条件：
    // 1. 存在DebugLogger类（依赖存在）；
    // 2. 配置文件中spring.profiles.active=dev 或 com.itheima.starter.debug=true
    @Bean
    @ConditionalOnClass(DebugLogger.class)
    @ConditionalOnProperty(
        value = {"spring.profiles.active", "com.itheima.starter.debug"},
        havingValue = "dev",
        matchIfMissing = false // 未满足条件时不创建
    )
    public DebugLogger debugLogger() {
        return new DebugLogger();
    }

    // 核心业务组件（所有环境都创建）
    @Bean
    public StarterService starterService(StarterProperties properties, Optional<DebugLogger> debugLogger) {
        StarterService service = new StarterService();
        service.setEnabled(properties.getEnabled());
        // 若调试组件存在，则注入（Optional避免空指针）
        debugLogger.ifPresent(service::setDebugLogger);
        return service;
    }
}
```

步骤 4：用户使用方式：

- 开发环境（application-dev.properties）：

  properties

  ```properties
  spring.profiles.active=dev
  com.itheima.starter.debug=true
  ```

  

  → 自动创建 DebugLogger Bean，StarterService 启用调试模式。

- 生产环境（application-prod.properties）：

  properties

  ```properties
  spring.profiles.active=prod
  com.itheima.starter.debug=false
  ```

  

  → 不创建 DebugLogger Bean，StarterService 禁用调试模式。

核心原理：条件注解组合时，所有条件必须满足才会创建 Bean。通过`@ConditionalOnProperty`的`value`属性指定多个配置项（“或” 关系），实现多条件适配。

#### 3. Maven 插件开发（自动生成实体类）的核心流程

需求：开发 Maven 插件，在编译前（compile 阶段）根据数据库表结构自动生成 Java 实体类（如根据`user`表生成`User.java`）。

核心开发流程：

1. 新建 Maven 插件项目，指定打包类型为`maven-plugin`：

   xml

   ```xml
   <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <groupId>com.itheima</groupId>
       <artifactId>code-generate-plugin</artifactId>
       <version>1.0-SNAPSHOT</version>
       <packaging>maven-plugin</packaging> <!-- 插件项目必须指定 -->
   
       <dependencies>
           <!-- Maven插件核心依赖 -->
           <dependency>
               <groupId>org.apache.maven</groupId>
               <artifactId>maven-plugin-api</artifactId>
               <version>3.8.5</version>
           </dependency>
           <!-- 插件注解依赖（简化配置） -->
           <dependency>
               <groupId>org.apache.maven.plugin-tools</groupId>
               <artifactId>maven-plugin-annotations</artifactId>
               <version>3.6.4</version>
               <scope>provided</scope>
           </dependency>
           <!-- 数据库连接依赖（用于读取表结构） -->
           <dependency>
               <groupId>mysql</groupId>
               <artifactId>mysql-connector-java</artifactId>
               <version>8.0.33</version>
           </dependency>
       </dependencies>
   </project>
   ```

   

2. 编写插件目标（Mojo）：实现实体类生成逻辑，绑定到 compile 阶段前：

   java

   

   运行

   ```java
   import org.apache.maven.plugin.AbstractMojo;
   import org.apache.maven.plugin.MojoExecutionException;
   import org.apache.maven.plugins.annotations.Mojo;
   import org.apache.maven.plugins.annotations.Parameter;
   import org.apache.maven.plugins.annotations.LifecyclePhase;
   import java.sql.*;
   import java.io.File;
   import java.io.FileWriter;
   import java.io.IOException;
   
   // 插件目标名称：generate-entity，绑定到compile阶段前执行
   @Mojo(name = "generate-entity", defaultPhase = LifecyclePhase.COMPILE)
   public class EntityGenerateMojo extends AbstractMojo {
       // 插件配置参数：从pom.xml读取（用户可配置）
       @Parameter(property = "db.url", required = true)
       private String dbUrl;
   
       @Parameter(property = "db.username", required = true)
       private String dbUsername;
   
       @Parameter(property = "db.password", required = true)
       private String dbPassword;
   
       @Parameter(property = "table.name", required = true)
       private String tableName;
   
       @Parameter(defaultValue = "${project.build.sourceDirectory}/../generated-sources")
       private File outputDirectory;
   
       @Override
       public void execute() throws MojoExecutionException {
           Connection conn = null;
           try {
               // 1. 连接数据库，查询表结构
               Class.forName("com.mysql.cj.jdbc.Driver");
               conn = DriverManager.getConnection(dbUrl, dbUsername, dbPassword);
               ResultSet rs = conn.getMetaData().getColumns(null, null, tableName, null);
   
               // 2. 生成实体类代码（简化逻辑：根据字段名生成属性）
               StringBuilder code = new StringBuilder();
               code.append("package com.itheima.entity;\n\n");
               code.append("import lombok.Data;\n\n");
               code.append("@Data\n");
               code.append("public class ").append(toCamelCase(tableName)).append(" {\n");
   
               // 3. 遍历表字段，生成实体属性
               while (rs.next()) {
                   String columnName = rs.getString("COLUMN_NAME"); // 字段名（如user_name）
                   String javaType = getJavaType(rs.getString("TYPE_NAME")); // 字段类型（如VARCHAR→String）
                   String fieldName = toCamelCase(columnName); // 转为驼峰命名（user_name→userName）
                   code.append("    private ").append(javaType).append(" ").append(fieldName).append(";\n");
               }
               code.append("}");
   
               // 4. 写入文件
               outputDirectory.mkdirs(); // 创建目录
               File entityFile = new File(outputDirectory, toCamelCase(tableName) + ".java");
               try (FileWriter writer = new FileWriter(entityFile)) {
                   writer.write(code.toString());
               }
               getLog().info("实体类生成成功：" + entityFile.getAbsolutePath());
           } catch (ClassNotFoundException | SQLException | IOException e) {
               throw new MojoExecutionException("生成实体类失败", e);
           } finally {
               if (conn != null) {
                   try {
                       conn.close();
                   } catch (SQLException e) {
                       getLog().error("关闭数据库连接失败", e);
                   }
               }
           }
       }
   
       // 辅助方法：下划线转驼峰（user_name→userName）
       private String toCamelCase(String str) {
           StringBuilder sb = new StringBuilder();
           boolean upperCase = false;
           for (char c : str.toCharArray()) {
               if (c == '_') {
                   upperCase = true;
               } else {
                   sb.append(upperCase ? Character.toUpperCase(c) : Character.toLowerCase(c));
                   upperCase = false;
               }
           }
           // 首字母大写（类名）
           return Character.toUpperCase(sb.charAt(0)) + sb.substring(1);
       }
   
       // 辅助方法：数据库类型转Java类型（简化）
       private String getJavaType(String dbType) {
           switch (dbType.toUpperCase()) {
               case "INT":
               case "BIGINT":
                   return "Long";
               case "VARCHAR":
               case "CHAR":
                   return "String";
               case "DATE":
               case "DATETIME":
                   return "LocalDateTime";
               case "DECIMAL":
                   return "BigDecimal";
               default:
                   return "String";
           }
       }
   }
   ```

   

3. 打包插件：执行`mvn clean install`，将插件安装到本地 Maven 仓库。

4. 其他项目使用插件：

   xml

   ```xml
   <build>
       <plugins>
           <plugin>
               <groupId>com.itheima</groupId>
               <artifactId>code-generate-plugin</artifactId>
               <version>1.0-SNAPSHOT</version>
               <executions>
                   <execution>
                       <goals>
                           <goal>generate-entity</goal> <!-- 插件目标 -->
                       </goals>
                       <configuration>
                           <!-- 插件配置参数 -->
                           <dbUrl>jdbc:mysql://localhost:3306/tlias</dbUrl>
                           <dbUsername>root</dbUsername>
                           <dbPassword>123456</dbPassword>
                           <tableName>user</tableName> <!-- 要生成实体的表名 -->
                       </configuration>
                   </execution>
               </executions>
           </plugin>
       </plugins>
   </build>
   ```

   

5. 执行插件：运行`mvn compile`，插件会在`generated-sources`目录下生成`User.java`实体类。

核心原理：Maven 插件通过 Mojo（目标）实现具体功能，`@Mojo`注解指定目标名称和绑定的生命周期阶段；插件参数通过`@Parameter`注解绑定，用户可在 pom.xml 中配置；执行`mvn compile`时，Maven 会按生命周期阶段触发插件目标执行。