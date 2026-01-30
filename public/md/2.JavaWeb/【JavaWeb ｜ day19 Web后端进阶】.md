# 🔧 JavaWeb Day19 - Web后端进阶

> 💡 **进阶必备！** 本文聚焦Web后端进阶技术——SpringAOP面向切面编程、SpringBoot自动配置原理、自定义Starter、Maven高级，帮你深入理解框架底层原理，提升代码质量和开发效率。

---

## 🎯 快速回顾

- **🎯 SpringAOP**：面向切面编程、动态代理（JDK/CGLIB）、通知类型（前置/后置/环绕/异常/最终）
- **🔄 SpringBoot原理**：自动配置、@SpringBootApplication拆解、@Conditional条件注解
- **📦 自定义Starter**：依赖聚合+自动配置、starter命名规范、自动配置类编写
- **🔨 Maven高级**：依赖传递规则、聚合工程与继承、私服配置、版本锁定
- **⚠️ 常见问题**：静态方法无法AOP代理、内部方法调用不触发切面、通知顺序混乱

---

## 📑 目录

- [一、SpringAOP：面向切面编程](#一springaop面向切面编程)
  - [1. 核心定位](#1-核心定位)
  - [2. 核心概念（必须掌握）](#2-核心概念必须掌握)
  - [3. 实现原理：动态代理](#3-实现原理动态代理)
  - [4. 实际开发场景](#4-实际开发场景)
  - [5. 深度避坑指南](#5-深度避坑指南)
- [二、SpringBoot原理：简化Spring开发的核心](#二springboot原理简化spring开发的核心)
  - [1. 核心定位](#1-核心定位-1)
  - [2. 核心注解：@SpringBootApplication拆解](#2-核心注解springbootapplication拆解)
  - [3. 自动配置流程](#3-自动配置流程)
  - [4. Starters原理](#4-starters原理)
- [三、自定义Starter：依赖聚合+自动配置](#三自定义starter依赖聚合自动配置)
  - [1. 核心定位](#1-核心定位-2)
  - [2. Starter命名规范](#2-starter命名规范)
  - [3. 自定义Starter步骤](#3-自定义starter步骤)
- [四、Maven高级：项目依赖管理与构建](#四maven高级项目依赖管理与构建)
  - [1. 核心概念](#1-核心概念-3)
  - [2. 实际场景拓展](#2-实际场景拓展-1)
  - [3. 深度避坑指南](#3-深度避坑指南-1)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、SpringAOP：面向切面编程

#### 1. 核心定位

SpringAOP（Aspect-Oriented Programming）是 Spring 核心特性之一，核心解决「横切逻辑与业务逻辑解耦」问题。横切逻辑是指多个业务模块共用的逻辑（如日志记录、权限校验、事务控制、异常捕获），通过 AOP 可将这些逻辑抽离为独立 "切面"，无需侵入业务代码，实现统一管理和复用。

---

#### 2. 核心概念（必须掌握）

| 概念 | 定义 | 实际场景落地 |
| ---- | ---- | ------------ |
| **切面（Aspect）** | 横切逻辑的封装（含通知和切入点） | 日志切面（LogAspect）、权限切面（AuthAspect） |
| **通知（Advice）** | 切面的具体执行逻辑（何时执行） | 前置通知（执行前）、后置通知（执行后）、环绕通知（执行前后）、异常通知（抛出异常时）、最终通知（无论是否异常都执行） |
| **连接点（JoinPoint）** | 程序执行过程中的可拦截点（如方法调用、字段赋值） | Controller 的接口方法、Service 的业务方法（SpringAOP 仅支持方法级连接点） |
| **切入点（Pointcut）** | 筛选连接点的规则（指定哪些方法被切面拦截） | 通过表达式（如`execution(* com.itheima.service.*.*(..))`）拦截 Service 层所有方法 |
| **目标对象（Target）** | 被切面拦截的原始业务对象 | UserServiceImpl 实例（被日志切面拦截的业务对象） |
| **代理对象（Proxy）** | SpringAOP 动态生成的对象（包装目标对象，植入切面逻辑） | 对 UserServiceImpl 生成的代理对象，调用其方法时会先执行切面逻辑 |
| **织入（Weaving）** | 将切面逻辑植入目标对象的过程 | Spring 容器启动时，通过动态代理将日志切面织入 Service 层方法 |

---

#### 3. 实现原理：动态代理

SpringAOP 的底层是**动态代理**，根据目标对象是否实现接口，自动选择代理方式：

##### （1）JDK 动态代理（默认，目标对象实现接口）

- **原理**：基于 Java 反射机制，动态生成目标接口的代理类（实现 InvocationHandler 接口），代理类调用目标对象方法时植入切面逻辑。
- **特点**：仅支持接口代理，目标对象必须实现接口；生成代理类效率高，运行时效率中等。

##### （2）CGLIB 动态代理（目标对象无接口）

- **原理**：基于 ASM 字节码生成框架，动态生成目标对象的子类，重写目标方法并植入切面逻辑。
- **特点**：支持类代理（无需实现接口）；生成代理类效率中等，运行时效率高（直接操作字节码）。
- **启用方式**：SpringBoot 2.x 默认自动切换，若需强制使用 CGLIB，配置：`spring.aop.proxy-target-class=true`

##### （3）JDK 与 CGLIB 代理对比

| 对比维度 | JDK 动态代理 | CGLIB 动态代理 |
| -------- | ------------- | -------------- |
| 依赖条件 | 目标对象必须实现接口 | 目标对象可以是普通类（不能是 final 类） |
| 实现方式 | 反射机制生成接口代理类 | ASM 框架生成目标类子类 |
| 效率 | 生成快，运行中 | 生成中，运行快 |
| 支持场景 | 接口代理 | 类代理、接口代理 |
| Spring 默认 | 目标对象有接口时优先使用 | 目标对象无接口时自动使用 |

---

#### 4. 实际开发场景

##### （1）场景 1：接口访问日志记录（环绕通知）

需求：记录所有 Controller 接口的请求 URL、参数、响应时间、用户 ID，无需在每个接口手动写日志。

```java
@Aspect
@Component
public class LogAspect {
    private static final Logger logger = LoggerFactory.getLogger(LogAspect.class);

    @Pointcut("execution(* com.itheima.controller..*.*(..))")
    public void logPointcut() {}

    @Around("logPointcut()")
    public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getName();
        Object[] args = joinPoint.getArgs();

        logger.info("接口请求：类={}, 方法={}, 参数={}", className, methodName, args);

        try {
            Object result = joinPoint.proceed();
            long costTime = System.currentTimeMillis() - startTime;
            logger.info("接口响应：类={}, 方法={}, 耗时={}ms, 结果={}", className, methodName, costTime, result);
            return result;
        } catch (Exception e) {
            logger.error("接口异常：类={}, 方法={}, 异常信息={}", className, methodName, e.getMessage(), e);
            throw e;
        }
    }
}
```

##### （2）场景 2：权限校验（前置通知）

需求：某些接口需要登录后才能访问，通过 AOP 拦截接口，校验用户是否登录（从 Token 中解析用户 ID）。

```java
@Aspect
@Component
public class AuthAspect {
    @Pointcut("@annotation(com.itheima.annotation.RequireLogin)")
    public void authPointcut() {}

    @Before("authPointcut()")
    public void doAuth(JoinPoint joinPoint) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException("未登录，请先登录");
        }

        String userId = token.substring(7);
        if (userId == null || userId.isEmpty()) {
            throw new BusinessException("登录状态失效，请重新登录");
        }

        logger.info("用户{}已登录，允许访问接口", userId);
    }
}
```

---

#### 5. 深度避坑指南

| 坑点描述 | 原因分析 | 解决方案 |
| -------- | -------- | -------- |
| 静态方法无法被 AOP 代理 | SpringAOP 仅支持方法级连接点，且动态代理无法代理静态方法 | 1. 将静态方法改为实例方法；2. 若必须用静态方法，通过手动调用切面逻辑替代 AOP |
| 通知顺序混乱（多个切面拦截同一方法） | 未指定切面优先级，Spring 默认按切面类名排序（字母顺序） | 1. 用`@Order(value=1)`注解指定优先级（值越小优先级越高）；2. 实现`Ordered`接口重写`getOrder()`方法 |
| 内部方法调用无法触发 AOP | 内部调用是目标对象直接调用，未经过代理对象，切面逻辑无法植入 | 1. 注入自身代理对象，通过代理对象调用；2. 从 Spring 容器中获取代理对象；3. 重构代码，拆分内部调用为独立 Service |
| 切入点表达式错误导致切面不生效 | 表达式语法错误（如包名写错、方法匹配规则错误） | 1. 用`execution(* com.itheima.service..*.*(..))`匹配 service 包及子包所有方法；2. 用`@Pointcut("@annotation(com.itheima.annotation.RequireLogin)")`匹配带指定注解的方法 |
| CGLIB 代理无法代理 final 类 / 方法 | CGLIB 通过生成子类重写方法实现代理，final 类无法被继承，final 方法无法被重写 | 1. 移除目标类 / 方法的 final 修饰符；2. 若目标类是 final，让其实现接口，切换为 JDK 动态代理 |
| 环绕通知未调用`joinPoint.proceed()`，导致目标方法不执行 | 环绕通知需手动调用`proceed()`触发目标方法执行，否则仅执行切面逻辑 | 确保环绕通知中调用`joinPoint.proceed()`，并返回结果（`return result;`） |

---

### 二、SpringBoot原理：简化Spring开发的核心

#### 1. 核心定位

SpringBoot 的核心是「约定优于配置」，通过**自动配置**、**starters 依赖**、**嵌入式服务器**三大特性，简化 Spring 项目的搭建、配置、部署流程，解决传统 Spring 项目 "配置繁琐、依赖冲突、部署复杂" 的问题。

---

#### 2. 核心注解：@SpringBootApplication 拆解

`@SpringBootApplication`是 SpringBoot 的入口注解，本质是三个核心注解的组合：

```java
@SpringBootConfiguration // 1. 等同于@Configuration，标识当前类是配置类
@EnableAutoConfiguration // 2. 核心：启用自动配置
@ComponentScan // 3. 核心：扫描Spring Bean（默认扫描当前包及子包）
public @interface SpringBootApplication {
    Class<?>[] exclude() default {};
    String[] excludeName() default {};
    String[] scanBasePackages() default {};
}
```

##### （1）@SpringBootConfiguration

- **作用**：标识当前类是 Spring 的配置类，允许在类中用`@Bean`声明 Bean。
- **与@Configuration的区别**：`@SpringBootConfiguration`是 SpringBoot 的专属注解，底层继承`@Configuration`，仅用于标识 SpringBoot 应用的主配置类。

##### （2）@ComponentScan

- **作用**：扫描指定包下的`@Component`、`@Controller`、`@Service`、`@Repository`等注解的类，将其注册为 Spring Bean。
- **默认规则**：扫描`@SpringBootApplication`所在类的当前包及所有子包。
- **自定义扫描**：通过`scanBasePackages = "com.itheima"`指定扫描包，解决 Bean 未被扫描导致的注入失败问题。

##### （3）@EnableAutoConfiguration（自动配置核心）

- **作用**：根据项目依赖（如引入`spring-boot-starter-web`则自动配置 Tomcat、SpringMVC），自动加载对应的配置类，创建 Bean 并注入 Spring 容器。

---

#### 3. 自动配置流程

以 "自动配置数据源" 为例，拆解 SpringBoot 自动配置的完整流程：

1. 项目引入`spring-boot-starter-jdbc`依赖（包含`spring-jdbc`、HikariCP 连接池、MySQL 驱动）。
2. SpringBoot 启动时，`@EnableAutoConfiguration`触发加载`DataSourceAutoConfiguration`。
3. `DataSourceAutoConfiguration`通过`@ConditionalOnClass(DataSource.class)`判断：项目中存在`DataSource`类，因此该自动配置类生效。
4. `DataSourceAutoConfiguration`读取`application.properties`中的数据库配置。
5. 通过`@Bean`声明`DataSource` Bean（默认使用 HikariCP 连接池）。
6. `DataSource` Bean 被注入 Spring 容器，后续`JdbcTemplate`、`Mybatis`等组件可直接注入`DataSource`使用。

---

#### 4. Starters 原理：依赖聚合 + 自动配置

##### （1）Starters 的核心作用

Starters 是 SpringBoot 的 "依赖套餐"，核心解决两个问题：

- **依赖聚合**：一个 Starter 包含该场景所需的所有依赖（如`spring-boot-starter-web`包含 Tomcat、SpringMVC、Jackson 等），无需手动引入多个依赖。
- **自动配置**：引入 Starter 后，SpringBoot 自动加载对应的自动配置类，创建必要的 Bean 并注入容器。

##### （2）Starter 命名规范

- **官方 Starter**：`spring-boot-starter-{场景}`（如`spring-boot-starter-web`、`spring-boot-starter-data-jpa`）
- **第三方 Starter**：`{项目名}-spring-boot-starter`（如`mybatis-spring-boot-starter`、`druid-spring-boot-starter`）

---

### 三、自定义Starter：依赖聚合+自动配置

#### 1. 核心定位

自定义 Starter 是将常用功能封装为独立模块，通过依赖聚合 + 自动配置，实现 "引入依赖即可使用" 的效果，提高代码复用性和开发效率。

---

#### 2. Starter 命名规范

- **官方 Starter**：`spring-boot-starter-{场景}`
- **第三方 Starter**：`{项目名}-spring-boot-starter`

---

#### 3. 自定义 Starter 步骤

1. **创建 Maven 项目**：命名为`{项目名}-spring-boot-starter`
2. **添加依赖**：引入`spring-boot-autoconfigure`、`spring-boot-configuration-processor`等依赖
3. **编写自动配置类**：使用`@Configuration`、`@Conditional`等注解
4. **创建配置属性类**：使用`@ConfigurationProperties`绑定配置文件
5. **编写 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports**：声明自动配置类
6. **打包发布**：将 Starter 发布到私服或中央仓库

---

### 四、Maven高级：项目依赖管理与构建

#### 1. 核心概念

##### （1）依赖传递规则

Maven 依赖传递遵循三大原则，优先级从高到低：

1. **声明优先原则**：在 pom.xml 中，先声明的依赖版本优先级更高（同层级依赖）。
2. **就近原则**：直接依赖（项目直接声明）优先级高于传递依赖；传递依赖中，路径越短优先级越高。
3. **路径短优先原则**：传递依赖中，依赖路径长度越短，版本优先级越高。

##### （2）聚合工程与继承

- **聚合工程**：多模块项目（如`hmdp-parent`包含`hmdp-common`、`hmdp-service`、`hmdp-web`），通过父 pom 的`<modules>`标签管理子模块。
- **继承**：子模块通过`<parent>`标签继承父 pom 的依赖、插件配置，减少重复配置。

##### （3）版本锁定（dependencyManagement）

父 pom 中使用`<dependencyManagement>`声明依赖版本，子模块无需指定版本，统一由父工程管理。

---

#### 2. 实际场景拓展

##### （1）私服配置（企业开发必备）

企业内部搭建 Maven 私服（如 Nexus），存储内部依赖、缓存中央仓库依赖。

##### （2）自定义打包插件（SpringBoot 可执行 jar）

SpringBoot 项目通过`spring-boot-maven-plugin`插件打包为可执行 jar，包含内置 Tomcat。

---

#### 3. 深度避坑指南

| 坑点描述 | 原因分析 | 解决方案 |
| -------- | -------- | -------- |
| 依赖冲突导致 ClassNotFoundException | 不同依赖传递引入同一 jar 包的不同版本，高版本删除了低版本的类 | 1. 用`mvn dependency:tree`命令分析依赖树；2. 用`<exclusions>`排除低版本依赖；3. 在`<dependencyManagement>`中锁定统一版本 |
| 本地仓库 jar 包损坏，下载失败 | 网络中断、磁盘空间不足导致 jar 包下载不完整 | 1. 删除`C:\Users\用户名\.m2\repository`中对应 jar 包的目录；2. 执行`mvn clean install -U`强制更新 |
| 私服依赖无法下载 | 私服地址错误、账号密码错误、无权限访问 | 1. 检查 settings.xml 中私服 url、账号密码；2. 联系私服管理员开通权限 |

---

## ❓ 问答

### Q1：SpringAOP 的核心概念有哪些？动态代理有哪两种方式？

**答**：
- **核心概念**：切面（Aspect）、通知（Advice）、连接点（JoinPoint）、切入点（Pointcut）、目标对象（Target）、代理对象（Proxy）、织入（Weaving）
- **动态代理方式**：
  1. **JDK 动态代理**：目标对象实现接口时使用，基于反射机制生成接口代理类
  2. **CGLIB 动态代理**：目标对象无接口时使用，基于 ASM 字节码生成框架生成目标类子类
- **解析**：理解 SpringAOP 的核心概念和动态代理原理，是掌握 AOP 技术的基础。

---

### Q2：@SpringBootApplication 注解由哪三个核心注解组成？各自的作用是什么？

**答**：
- **@SpringBootApplication 组成**：
  1. `@SpringBootConfiguration`：标识当前类是配置类，允许用`@Bean`声明 Bean
  2. `@EnableAutoConfiguration`：启用自动配置，根据项目依赖自动加载对应的配置类
  3. `@ComponentScan`：扫描指定包下的 Spring Bean（默认扫描当前包及子包）
- **解析**：理解 @SpringBootApplication 的组成和作用，是掌握 SpringBoot 自动配置原理的关键。

---

### Q3：SpringBoot 自动配置的流程是什么？以数据源自动配置为例说明。

**答**：
- **自动配置流程**：
  1. 项目引入 Starter 依赖（如`spring-boot-starter-jdbc`）
  2. SpringBoot 启动时，`@EnableAutoConfiguration`触发加载自动配置类（如`DataSourceAutoConfiguration`）
  3. 自动配置类通过`@Conditional`注解判断是否生效（如`@ConditionalOnClass`：存在指定类才生效）
  4. 生效的自动配置类通过`@Bean`声明必要的 Bean（如`DataSource`）
  5. Bean 被注入 Spring 容器，后续组件可直接使用
- **解析**：理解 SpringBoot 自动配置流程，能更好地使用 SpringBoot 框架，解决配置问题。

---

### Q4：Maven 依赖传递遵循哪些原则？如何解决依赖冲突问题？

**答**：
- **依赖传递原则**：声明优先原则、就近原则、路径短优先原则
- **解决依赖冲突**：
  1. 用`mvn dependency:tree`命令分析依赖树，找到冲突版本
  2. 用`<exclusions>`排除低版本依赖
  3. 在`<dependencyManagement>`中锁定统一版本
- **解析**：依赖冲突是 Maven 开发常见问题，掌握依赖传递原则和冲突解决方法，能有效避免 ClassNotFoundException。

---

### Q5：自定义 Starter 的步骤是什么？Starter 命名规范是什么？

**答**：
- **自定义 Starter 步骤**：
  1. 创建 Maven 项目，命名为`{项目名}-spring-boot-starter`
  2. 添加依赖（`spring-boot-autoconfigure`、`spring-boot-configuration-processor`等）
  3. 编写自动配置类（使用`@Configuration`、`@Conditional`等注解）
  4. 创建配置属性类（使用`@ConfigurationProperties`绑定配置文件）
  5. 编写 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports 文件
  6. 打包发布
- **Starter 命名规范**：
  - 官方 Starter：`spring-boot-starter-{场景}`
  - 第三方 Starter：`{项目名}-spring-boot-starter`
- **解析**：自定义 Starter 是提高代码复用性和开发效率的有效手段，掌握命名规范和开发步骤，能快速封装常用功能。

---

> **📚 学习建议**：本节内容是 Web 后端开发的进阶知识，重点掌握 SpringAOP、SpringBoot 自动配置原理、自定义 Starter、Maven 高级等核心技术，这些是深入理解框架底层原理、提升代码质量和开发效率的关键。
