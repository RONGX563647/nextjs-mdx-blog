# 📚 SSM Day26 - Spring AOP 面向切面编程

> 💡 **AOP 是 Spring 的核心特性之一，通过动态代理实现无侵入式功能增强。** 本文深入解析 AOP 核心概念、切入点表达式、通知类型、事务管理等核心内容，帮你掌握企业级开发的关键技能。

---

## 🎯 快速回顾

- **🎭 AOP 核心概念**：连接点（JoinPoint）、切入点（Pointcut）、通知（Advice）、切面（Aspect）
- **🔄 动态代理**：JDK 动态代理（有接口）vs CGLIB 代理（无接口）
- **📝 切入点表达式**：`execution(访问修饰符 返回值 包名.类名.方法名(参数))`
- **🔔 通知类型**：@Before（前置）、@After（后置）、@Around（环绕）、@AfterReturning（返回后）、@AfterThrowing（异常后）
- **💰 事务管理**：@Transactional 注解、PlatformTransactionManager、事务传播行为
- **📊 数据获取**：JoinPoint 获取参数、returning 获取返回值、throwing 获取异常

---

## 📑 目录

- [一、AOP 核心认知](#一aop-核心认知)
  - [1. 什么是 AOP](#1-什么是-aop)
  - [2. AOP 核心概念](#2-aop-核心概念)
- [二、AOP 入门案例](#二aop-入门案例)
  - [1. 实现步骤](#1-实现步骤)
  - [2. 核心注解总结](#2-核心注解总结)
- [三、AOP 工作流程](#三aop-工作流程)
  - [1. 完整流程拆解](#1-完整流程拆解)
  - [2. 代理对象创建逻辑](#2-代理对象创建逻辑)
- [四、AOP 配置管理](#四aop-配置管理)
  - [1. 切入点表达式](#1-切入点表达式)
  - [2. 通知类型](#2-通知类型)
  - [3. AOP 实战案例](#3-aop-实战案例)
- [五、AOP 通知数据获取](#五aop-通知数据获取)
  - [1. 获取参数](#1-获取参数)
  - [2. 获取返回值](#2-获取返回值)
  - [3. 获取异常](#3-获取异常)
- [六、声明式事务管理](#六声明式事务管理)
  - [1. 事务核心认知](#1-事务核心认知)
  - [2. 转账案例](#2-转账案例)
  - [3. 声明式事务配置](#3-声明式事务配置)
  - [4. 事务属性](#4-事务属性)
  - [5. 事务传播行为](#5-事务传播行为)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、AOP 核心认知

#### 1. 什么是 AOP

AOP（Aspect Oriented Programming）：面向切面编程，一种编程范式，核心是**在不修改原始代码的前提下对方法进行功能增强**。

- **与 OOP 的区别**：OOP 是垂直继承体系（如 Service、Dao 层），AOP 是横向切面增强（如日志、事务、性能监控），二者互补。
- **核心思想**：将分散在各个业务方法中的共性功能（如日志记录、事务管理、性能监控）抽取出来，形成独立的切面，通过动态代理在运行时织入到目标方法中。

#### 2. AOP 核心概念（必须掌握）

| 概念                   | 定义                                                  | 通俗理解                                                     |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| 连接点（JoinPoint）    | 程序执行过程中的任意位置（Spring 中特指**方法执行**） | 所有可被增强的方法（如 BookDao 的 save、update、delete、select） |
| 切入点（Pointcut）     | 匹配连接点的筛选条件（表达式）                        | 实际需要增强的方法（如只增强 update 和 delete 方法）         |
| 通知（Advice）         | 切入点处执行的共性功能（如打印时间、日志记录）        | 增强的具体逻辑（如计算方法执行耗时的代码）                   |
| 通知类（Advice Class） | 存放通知方法的类                                      | 封装共性功能的类（如 MyAdvice）                              |
| 切面（Aspect）         | 通知与切入点的绑定关系                                | 定义 "哪些通知" 作用于 "哪些切入点"                          |
| 目标对象（Target）     | 被增强的原始类对应的对象                              | 原始 BookDaoImpl 实例（未被增强的对象）                      |
| 代理（Proxy）          | 目标对象的增强版对象（Spring 动态生成）               | 包含原始方法逻辑 + 通知逻辑的代理实例                        |

**关键结论**：Spring AOP 的底层实现是**动态代理**（JDK 动态代理 + CGLIB 代理），容器初始化时根据切入点是否匹配目标对象方法，决定创建原始对象或代理对象。

---

### 二、AOP 入门案例

#### 1. 实现步骤（注解版）

**步骤 1：导入依赖（核心依赖）**

```xml
<!-- Spring核心依赖 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.2.10.RELEASE</version>
</dependency>
<!-- AOP整合AspectJ依赖（必须） -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.4</version>
</dependency>
```

- **易错点**：无需单独导入 spring-aop，spring-context 已包含；aspectjweaver 是 AOP 语法解析器，必须导入。

**步骤 2：定义目标对象（连接点）**

```java
// Dao接口
public interface BookDao {
    void save();
    void update();
}
// 实现类（目标对象）
@Repository
public class BookDaoImpl implements BookDao {
    @Override
    public void save() {
        System.out.println("book dao save ...");
    }
    @Override
    public void update() {
        System.out.println("book dao update ...");
    }
}
```

**步骤 3：定义通知类与通知**

```java
@Component // 交给Spring管理
@Aspect // 标识为切面类
public class MyAdvice {
    // 1. 定义切入点（筛选update方法）
    @Pointcut("execution(void com.itheima.dao.BookDao.update())")
    private void pt() {} // 无逻辑方法，仅作为切入点载体

    // 2. 绑定通知与切入点（前置通知：目标方法执行前执行）
    @Before("pt()")
    public void printTime() {
        System.out.println("当前系统时间：" + System.currentTimeMillis());
    }
}
```

**步骤 4：开启 AOP 注解支持**

```java
@Configuration
@ComponentScan("com.itheima") // 扫描组件
@EnableAspectJAutoProxy // 开启AOP注解功能【关键】
public class SpringConfig {
}
```

**步骤 5：测试**

```java
public class App {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);
        BookDao bookDao = ctx.getBean(BookDao.class);
        bookDao.update(); // 执行后会先打印时间，再执行update逻辑
    }
}
```

#### 2. 核心注解总结

| 注解                    | 作用                       | 位置           |
| ----------------------- | -------------------------- | -------------- |
| @EnableAspectJAutoProxy | 开启 AOP 注解支持          | 配置类上方     |
| @Aspect                 | 标识当前类为切面类         | 通知类上方     |
| @Pointcut               | 定义切入点表达式           | 无逻辑方法上方 |
| @Before                 | 前置通知（目标方法执行前） | 通知方法上方   |

---

### 三、AOP 工作流程

#### 1. 完整流程拆解

1. **Spring 容器启动**：
   - 加载所有组件（目标类、通知类）。
   - 扫描切面类中的切入点表达式，记录 "哪些方法需要被增强"。
2. **初始化 Bean**：
   - 对每个 Bean，判断其方法是否匹配切入点表达式：
     - 匹配失败：创建**原始对象**（Target），存入容器。
     - 匹配成功：通过动态代理创建**代理对象**（Proxy），存入容器。
   - **关键**：容器中存入的是代理对象，而非原始对象（若需增强）。
3. **获取 Bean 执行方法**：
   - 若获取的是原始对象：直接执行方法，无增强。
   - 若获取的是代理对象：执行代理方法（原始方法逻辑 + 通知逻辑）。

#### 2. 代理对象创建逻辑（底层原理）

- **目标类有接口**（如 BookDaoImpl 实现 BookDao）：使用**JDK 动态代理**（代理对象实现目标接口）。
- **目标类无接口**：使用**CGLIB 代理**（代理对象继承目标类）。
- **验证代理对象**：打印`bookDao.getClass()`，JDK 代理会显示`com.sun.proxy.$ProxyXXX`，CGLIB 代理会显示`目标类$EnhancerByCGLIBXXX`。

**核心结论**：
- AOP 的核心是 "动态代理"，容器初始化时决定创建原始对象或代理对象。
- 通知逻辑是在代理对象中执行的，原始对象代码完全不变（无侵入式增强）。

---

### 四、AOP 配置管理

#### 1. 切入点表达式（核心难点）

**（1）语法格式**

```plaintext
execution(访问修饰符 返回值 包名.类名/接口名.方法名(参数) 异常名)
```

- 关键字：`execution`（表示 "执行" 某个方法时触发通知）。
- 可省略部分：访问修饰符（默认 public）、异常名（不限制异常）。

**（2）通配符（简化表达式）**

| 通配符 | 作用                                   | 示例                                                         |
| ------ | -------------------------------------- | ------------------------------------------------------------ |
| `*`    | 匹配单个任意符号（包、类、方法、参数） | `execution(* com.itheima.dao.*Dao.*(..))`：匹配 dao 包下所有 XXDao 类的所有方法 |
| `..`   | 匹配多个连续任意符号（包、参数）       | `execution(* com..*Service.*(..))`：匹配 com 包下所有子包的 XXService 类的所有方法 |
| `+`    | 匹配子类（仅用于类名后）               | `execution(* com.itheima.service.*Service+.*(..))`：匹配 Service 接口的所有子类方法 |

**（3）书写技巧（实战高频）**

1. 描述接口（而非实现类）：降低耦合，如`execution(* com.itheima.dao.BookDao.*(..))`。
2. 包名尽量精准：避免`..`过度使用（效率低），如`com.itheima.service.*Service`。
3. 方法名用动词匹配：如`find*`（查询方法）、`save*`（保存方法）。
4. 参数用`..`匹配：如`*(..)`表示任意参数（无参、单参、多参）。

**（4）实战示例**

| 需求                                | 表达式                                             |
| ----------------------------------- | -------------------------------------------------- |
| 匹配 BookDao 的 update 方法（无参） | `execution(void com.itheima.dao.BookDao.update())` |
| 匹配所有 Service 类的所有方法       | `execution(* com.itheima.service.*Service.*(..))`  |
| 匹配所有查询方法（find 开头）       | `execution(* com.itheima.dao.*Dao.find*(..))`      |

#### 2. 通知类型（重点）

Spring 提供 5 种通知类型，对应通知在目标方法执行的不同时机：

| 通知类型       | 注解            | 执行时机                       | 核心特点                                                |
| -------------- | --------------- | ------------------------------ | ------------------------------------------------------- |
| 前置通知       | @Before         | 目标方法执行前                 | 无返回值，不能阻止目标方法执行                          |
| 后置通知       | @After          | 目标方法执行后（无论是否异常） | 无返回值，必定执行                                      |
| 环绕通知       | @Around         | 目标方法执行前后               | 可控制目标方法执行（必须调用`proceed()`），可修改返回值 |
| 返回后通知     | @AfterReturning | 目标方法正常执行完毕后         | 可获取返回值，异常时不执行                              |
| 抛出异常后通知 | @AfterThrowing  | 目标方法抛出异常后             | 可获取异常信息，正常时不执行                            |

**环绕通知（核心重点）**

环绕通知是功能最强的通知，可替代其他 4 种，需注意：

1. 必须传入`ProceedingJoinPoint`参数（用于调用目标方法）。
2. 必须调用`pjp.proceed()`（否则目标方法不执行）。
3. 需处理`Throwable`异常（`proceed()`会抛出异常）。
4. 可修改目标方法的参数和返回值。

示例：

```java
@Around("pt()")
public Object aroundAdvice(ProceedingJoinPoint pjp) throws Throwable {
    // 前置逻辑
    System.out.println("环绕通知 - 前");
    // 调用目标方法（可传入修改后的参数）
    Object[] args = pjp.getArgs();
    args[0] = 666; // 修改第一个参数
    Object result = pjp.proceed(args);
    // 后置逻辑
    System.out.println("环绕通知 - 后");
    return result; // 可修改返回值
}
```

#### 3. AOP 实战案例（业务层执行效率监控）

**需求**：统计所有 Service 方法的万次执行耗时，输出方法名和耗时时间。

**实现**：

```java
@Component
@Aspect
public class SpeedAdvice {
    // 切入点：所有Service方法
    @Pointcut("execution(* com.itheima.service.*Service.*(..))")
    private void servicePt() {}

    @Around("servicePt()")
    public Object calculateSpeed(ProceedingJoinPoint pjp) throws Throwable {
        // 获取方法签名（类名+方法名）
        Signature signature = pjp.getSignature();
        String className = signature.getDeclaringTypeName(); // 类名
        String methodName = signature.getName(); // 方法名

        // 统计万次执行耗时
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            pjp.proceed(); // 执行目标方法
        }
        long end = System.currentTimeMillis();

        // 输出结果
        System.out.println("万次执行：" + className + "." + methodName + " → " + (end - start) + "ms");
        return null;
    }
}
```

---

### 五、AOP 通知数据获取

#### 1. 获取参数

- **非环绕通知**（@Before、@After 等）：使用`JoinPoint`参数。
- **环绕通知**（@Around）：使用`ProceedingJoinPoint`参数（继承 JoinPoint）。

示例：

```java
// 前置通知获取参数
@Before("pt()")
public void beforeAdvice(JoinPoint jp) {
    Object[] args = jp.getArgs(); // 获取所有参数（数组）
    System.out.println("参数：" + Arrays.toString(args));
}

// 环绕通知获取参数
@Around("pt()")
public Object aroundAdvice(ProceedingJoinPoint pjp) throws Throwable {
    Object[] args = pjp.getArgs();
    args[0] = "修改后的参数"; // 可修改参数
    return pjp.proceed(args);
}
```

#### 2. 获取返回值

- **环绕通知**：直接接收`pjp.proceed()`的返回值。
- **返回后通知**（@AfterReturning）：通过`returning`属性绑定返回值。

示例：

```java
// 返回后通知获取返回值
@AfterReturning(value = "pt()", returning = "result")
public void afterReturnAdvice(Object result) {
    System.out.println("返回值：" + result);
}

// 环绕通知获取并修改返回值
@Around("pt()")
public Object aroundAdvice(ProceedingJoinPoint pjp) throws Throwable {
    Object result = pjp.proceed();
    return "修改后的返回值：" + result; // 修改返回值
}
```

- **易错点**：`returning`属性值必须与方法参数名一致（如上述`result`）。

#### 3. 获取异常

- **环绕通知**：通过`try-catch`捕获`Throwable`异常。
- **抛出异常后通知**（@AfterThrowing）：通过`throwing`属性绑定异常。

示例：

```java
// 抛出异常后通知获取异常
@AfterThrowing(value = "pt()", throwing = "ex")
public void afterThrowAdvice(Throwable ex) {
    System.out.println("异常信息：" + ex.getMessage());
}

// 环绕通知捕获异常
@Around("pt()")
public Object aroundAdvice(ProceedingJoinPoint pjp) {
    try {
        return pjp.proceed();
    } catch (Throwable ex) {
        ex.printStackTrace();
        return null; // 异常处理后返回默认值
    }
}
```

---

### 六、声明式事务管理

#### 1. 事务核心认知

- **事务作用**：保证一系列数据库操作 "同成功、同失败"（原子性）。
- **Spring 事务**：支持在**业务层**管理事务（数据层事务无法跨方法保证原子性，如转账业务的 "减钱 + 加钱"）。
- **核心接口**：`PlatformTransactionManager`（事务管理器），MyBatis 适配`DataSourceTransactionManager`（基于 JDBC 事务）。

#### 2. 转账案例（事务问题复现）

**环境准备**：
1. 数据库表：`tbl_account`（id、name、money）。
2. Dao 层：`outMoney`（减钱）、`inMoney`（加钱）。
3. Service 层：`transfer`（调用减钱 + 加钱）。

**问题复现**：

```java
@Service
public class AccountServiceImpl implements AccountService {
    @Autowired
    private AccountDao accountDao;

    @Override
    public void transfer(String out, String in, Double money) {
        accountDao.outMoney(out, money); // 减钱
        int i = 1 / 0; // 模拟异常
        accountDao.inMoney(in, money); // 加钱（不会执行）
    }
}
```

- 执行结果：out 账户减钱成功，in 账户加钱失败，数据不一致（事务未生效）。

#### 3. 声明式事务配置（重点）

**步骤 1：配置事务管理器**

```java
@Configuration
public class JdbcConfig {
    // 数据源配置（略）
    @Bean
    public DataSource dataSource() { ... }

    // 事务管理器（MyBatis专用）
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

**步骤 2：开启事务注解支持**

```java
@Configuration
@ComponentScan("com.itheima")
@Import({JdbcConfig.class, MybatisConfig.class})
@EnableTransactionManagement // 开启声明式事务
public class SpringConfig {
}
```

**步骤 3：给业务方法添加事务注解**

```java
@Service
public class AccountServiceImpl implements AccountService {
    @Autowired
    private AccountDao accountDao;

    // 事务注解：当前方法受事务管理
    @Transactional
    @Override
    public void transfer(String out, String in, Double money) {
        accountDao.outMoney(out, money);
        int i = 1 / 0; // 异常触发事务回滚
        accountDao.inMoney(in, money);
    }
}
```

- 执行结果：异常后事务回滚，out 账户减钱操作撤销，数据一致。

#### 4. 事务属性（重点）

通过`@Transactional`的参数配置事务特性：

| 属性          | 作用                                          | 可选值                                                       | 默认值                    |
| ------------- | --------------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| readOnly      | 是否为只读事务（查询用 true，增删改用 false） | true/false                                                   | false                     |
| timeout       | 事务超时时间（秒），超时未提交则回滚          | 正数 /-1（无超时）                                           | -1                        |
| rollbackFor   | 触发回滚的异常类型（如 IOException）          | 异常类数组                                                   | RuntimeException 及其子类 |
| noRollbackFor | 不触发回滚的异常类型                          | 异常类数组                                                   | 无                        |
| isolation     | 事务隔离级别（解决并发问题）                  | DEFAULT/READ_UNCOMMITTED/READ_COMMITTED/REPEATABLE_READ/SERIALIZABLE | DEFAULT（数据库默认）     |
| propagation   | 事务传播行为（多事务嵌套时的处理规则）        | REQUIRED/REQUIRES_NEW 等                                     | REQUIRED                  |

**关键属性说明**：

1. **rollbackFor**：默认仅 RuntimeException 回滚，需手动指定检查型异常（如 IOException）。

   ```java
   @Transactional(rollbackFor = {IOException.class, SQLException.class})
   ```

2. **propagation（事务传播行为）**：核心难点，解决 "事务嵌套" 问题（如转账 + 日志记录）。

#### 5. 事务传播行为（核心难点）

**场景需求**：转账业务中，无论转账是否成功，都需记录日志（日志事务独立于转账事务）。

**问题复现**：

```java
// 日志Service（默认传播行为REQUIRED）
@Service
public class LogServiceImpl implements LogService {
    @Autowired
    private LogDao logDao;

    @Transactional
    @Override
    public void log(String out, String in, Double money) {
        logDao.insertLog("转账：" + out + "→" + in + "，金额：" + money);
    }
}

// 转账Service
@Service
public class AccountServiceImpl implements AccountService {
    @Autowired
    private AccountDao accountDao;
    @Autowired
    private LogService logService;

    @Transactional
    @Override
    public void transfer(String out, String in, Double money) {
        try {
            accountDao.outMoney(out, money);
            int i = 1 / 0;
            accountDao.inMoney(in, money);
        } finally {
            logService.log(out, in, money); // 日志事务随转账事务回滚
        }
    }
}
```

- 执行结果：转账异常后，日志也回滚（不符合需求）。

**解决方案：设置传播行为为 REQUIRES_NEW**

```java
@Service
public class LogServiceImpl implements LogService {
    @Autowired
    private LogDao logDao;

    // 传播行为：创建新事务，与父事务独立
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void log(String out, String in, Double money) {
        logDao.insertLog("转账：" + out + "→" + in + "，金额：" + money);
    }
}
```

- 执行结果：转账异常后，日志事务独立提交，不受影响。

---

## ❓ 问答

### Q1：AOP 的核心概念有哪些？

**A**：
- **连接点（JoinPoint）**：程序执行过程中的任意位置（Spring 中特指方法执行）。
- **切入点（Pointcut）**：匹配连接点的筛选条件（表达式）。
- **通知（Advice）**：切入点处执行的共性功能。
- **切面（Aspect）**：通知与切入点的绑定关系。
- **目标对象（Target）**：被增强的原始类对应的对象。
- **代理（Proxy）**：目标对象的增强版对象（Spring 动态生成）。

### Q2：Spring AOP 的底层实现是什么？

**A**：Spring AOP 的底层实现是**动态代理**：
- **JDK 动态代理**：目标类有接口时使用，代理对象实现目标接口。
- **CGLIB 代理**：目标类无接口时使用，代理对象继承目标类。

### Q3：切入点表达式的语法是什么？

**A**：`execution(访问修饰符 返回值 包名.类名/接口名.方法名(参数) 异常名)`
- 可省略部分：访问修饰符（默认 public）、异常名（不限制异常）。
- 通配符：`*`（匹配单个任意符号）、`..`（匹配多个连续任意符号）、`+`（匹配子类）。

### Q4：Spring 事务的传播行为有哪些？

**A**：
- **REQUIRED**（默认）：如果当前存在事务，则加入该事务；否则创建一个新事务。
- **REQUIRES_NEW**：创建一个新事务，挂起当前事务（如果存在）。
- **SUPPORTS**：如果当前存在事务，则加入该事务；否则以非事务方式执行。
- **NOT_SUPPORTED**：以非事务方式执行，挂起当前事务（如果存在）。
- **MANDATORY**：如果当前存在事务，则加入该事务；否则抛出异常。
- **NEVER**：以非事务方式执行，如果当前存在事务则抛出异常。
- **NESTED**：如果当前存在事务，则在嵌套事务中执行；否则行为类似 REQUIRED。

### Q5：@Transactional 注解的常用属性有哪些？

**A**：
- **readOnly**：是否为只读事务（查询用 true，增删改用 false）。
- **timeout**：事务超时时间（秒），超时未提交则回滚。
- **rollbackFor**：触发回滚的异常类型（如 IOException）。
- **noRollbackFor**：不触发回滚的异常类型。
- **isolation**：事务隔离级别（解决并发问题）。
- **propagation**：事务传播行为（多事务嵌套时的处理规则）。

---

## 💡 学习建议

1. **理解核心思想**：重点理解 AOP 的核心概念（连接点、切入点、通知、切面）和动态代理机制。
2. **动手实践**：通过编写案例加深理解，特别是切入点表达式和通知类型的使用。
3. **掌握事务管理**：重点掌握 @Transactional 注解的使用和事务传播行为。
4. **关注底层**：了解 Spring AOP 的底层实现（JDK 动态代理、CGLIB 代理），为后续学习 SpringBoot 打下基础。
5. **面试准备**：重点掌握 AOP 核心概念、切入点表达式、事务传播行为等面试高频点。

---

> **🎯 下一步学习**：Day27 将深入讲解 SpringMVC，包括 MVC 架构、请求映射、参数绑定、视图解析等核心内容。
