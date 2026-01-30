# 📚 SSM Day25 - Spring IOC 与 DI 注解开发

> 💡 **注解开发是主流，底层原理是关键。** 本文深入解析 Spring 注解开发的核心机制、第三方 Bean 管理、容器差异与整合开发，帮你掌握企业级开发的核心技能。

---

## 🎯 快速回顾

- **📦 第三方 Bean 管理**：通过 `@Bean` 注解管理 Druid 等第三方组件
- **🏭 核心容器**：BeanFactory（延迟加载）vs ApplicationContext（立即加载）
- **🔍 注解扫描**：`@ComponentScan` 扫描指定包，自动注册 Bean
- **💉 依赖注入**：`@Autowired`（自动装配）、`@Qualifier`（指定 Bean）、`@Value`（简单类型）
- **🔄 Bean 生命周期**：实例化 → 依赖注入 → 初始化 → 销毁
- **🔗 Spring 整合**：MyBatis（MapperScannerConfigurer）、Junit（@RunWith）

---

## 📑 目录

- [一、IOC/DI 配置管理第三方 Bean](#一iocdi-配置管理第三方-bean)
  - [1. 核心原理](#1-核心原理)
  - [2. 数据源配置深入解析](#2-数据源配置深入解析)
- [二、Spring 核心容器](#二spring-核心容器)
  - [1. 容器层次结构与核心接口](#1-容器层次结构与核心接口)
  - [2. BeanFactory vs ApplicationContext](#2-beanfactory-vs-applicationcontext)
  - [3. Bean 的实例化流程](#3-bean-的实例化流程)
- [三、IOC/DI 注解开发](#三iocdi-注解开发)
  - [1. 注解扫描的底层机制](#1-注解扫描的底层机制)
  - [2. 依赖注入的底层原理](#2-依赖注入的底层原理)
  - [3. Bean 的作用范围与生命周期](#3-bean-的作用范围与生命周期)
- [四、注解管理第三方 Bean](#四注解管理第三方-bean)
  - [1. @Bean 注解的底层逻辑](#1-bean-注解的底层逻辑)
  - [2. 第三方 Bean 的资源注入](#2-第三方-bean-的资源注入)
- [五、Spring 整合开发](#五spring-整合开发)
  - [1. Spring 整合 MyBatis](#1-spring-整合-mybatis)
  - [2. Spring 整合 Junit](#2-spring-整合-junit)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、IOC/DI 配置管理第三方 Bean

#### 1. 核心原理

第三方 Bean（如 Druid）的管理本质是：**Spring 通过反射调用第三方类的无参构造器创建实例，再通过 setter 方法注入配置参数**，与自定义 Bean 管理逻辑一致，但需注意第三方类的属性命名规范（如 Druid 的`driverClassName` vs C3P0 的`driverClass`）。

#### 2. 数据源配置深入解析

**（1）配置参数映射规则（重点）**

- Spring 通过`<property>`注入参数时，`name`必须与第三方类的**setter 方法名对应**（如`setDriverClassName` → `name="driverClassName"`），与成员变量名无关。
- 示例：Druid 的`driverClassName`属性对应`setDriverClassName(String driverClassName)`方法，若写错`name`为`driverClass`，则注入失败（无对应 setter）。

**（2）加载 properties 文件的底层逻辑（难点）**

- `<context:property-placeholder>`标签的本质是注册`PropertySourcesPlaceholderConfigurer` Bean，该 Bean 会在容器初始化时加载 properties 文件，将键值对存入`Environment`对象。
- 注入时`${key}`会被`PropertySourcesPlaceholderConfigurer`解析为对应值，优先级：**系统环境变量 > 命令行参数 > properties 文件**（可通过`system-properties-mode="NEVER"`禁用系统变量优先级）。

**（3）多配置文件加载的底层限制（易错点）**

- 不支持通配符`*`（如`classpath:*.properties`），需显式指定文件名或使用`classpath*:`（扫描所有依赖项目的配置文件）。
- 示例：`@PropertySource({"classpath:jdbc.properties", "classpath:redis.properties"})`（正确），`@PropertySource("classpath:*.properties")`（错误）。

---

### 二、Spring 核心容器

#### 1. 容器层次结构与核心接口

```
BeanFactory（顶层接口）
├─ ListableBeanFactory（批量获取Bean）
├─ HierarchicalBeanFactory（父子容器）
└─ ApplicationContext（核心接口）
   ├─ ClassPathXmlApplicationContext（类路径XML）
   ├─ FileSystemXmlApplicationContext（文件系统XML）
   └─ AnnotationConfigApplicationContext（注解配置）
```

#### 2. BeanFactory vs ApplicationContext（重点对比）

| 对比维度 | BeanFactory | ApplicationContext | 底层原因 |
|----------|-------------|---------------------|----------|
| 加载时机 | 延迟加载（getBean 时创建 Bean） | 立即加载（容器初始化时创建单例 Bean） | ApplicationContext 初始化时会调用`refresh()`方法，触发 Bean 的实例化；BeanFactory 仅在调用`getBean()`时才触发。 |
| 功能扩展 | 仅基础 Bean 管理 | 包含 BeanFactory 所有功能 + 资源加载、事件发布、国际化等 | ApplicationContext 继承`ResourceLoader`、`ApplicationEventPublisher`等接口，扩展了更多企业级功能。 |
| 依赖注入 | 需手动触发 | 自动完成依赖注入 | ApplicationContext 在 Bean 实例化后会自动执行依赖注入（`populateBean`方法），BeanFactory 需手动调用`getBean()`才触发。 |

**（1）延迟加载与立即加载的实战影响（难点）**

- **单例 Bean**（默认`scope="singleton"`）：
  - ApplicationContext：启动时创建所有单例 Bean，启动慢但运行时快（适合生产环境）。
  - BeanFactory：首次调用`getBean()`时创建，启动快但首次访问慢（适合资源受限环境）。
- **多例 Bean**（`scope="prototype"`）：无论哪种容器，均为延迟加载（`getBean()`时创建）。

#### 3. Bean 的实例化流程（核心难点）

以 ApplicationContext 为例，单例 Bean 的实例化流程：

1. 容器初始化（`refresh()`）→ 扫描 Bean 定义（如`<bean>`、`@Component`）。
2. 调用`BeanFactoryPostProcessor`处理配置（如解析`${key}`）。
3. 实例化 Bean（`createBean()`）：通过反射调用无参构造器创建实例。
4. 依赖注入（`populateBean()`）：注入属性（setter 注入、构造器注入）。
5. 初始化 Bean（`initializeBean()`）：执行`@PostConstruct`方法、`init-method`。
6. Bean 就绪，存入容器注册表（`DefaultSingletonBeanRegistry`）。

---

### 三、IOC/DI 注解开发

#### 1. 注解扫描的底层机制（难点）

**（1）@ComponentScan 的扫描流程**

1. 扫描`base-package`指定的包及子包，过滤出带有`@Component`、`@Service`等注解的类。
2. 对每个候选类，通过`AnnotationBeanNameGenerator`生成 Bean 名称（默认类名首字母小写，如`BookServiceImpl` → `bookServiceImpl`）。
3. 将 Bean 定义（`BeanDefinition`）注册到`BeanDefinitionRegistry`（容器的 Bean 定义注册表）。

**（2）注解扫描的过滤规则（进阶点）**

可通过`@ComponentScan`的`includeFilters`和`excludeFilters`自定义扫描规则：

```java
@Configuration
@ComponentScan(
    basePackages = "com.itheima",
    includeFilters = @Filter(type = FilterType.ANNOTATION, classes = Service.class), // 仅扫描@Service注解
    excludeFilters = @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = BookDaoImpl.class) // 排除BookDaoImpl类
)
public class SpringConfig {
}
```

#### 2. 依赖注入的底层原理（核心难点）

**（1）@Autowired 的注入流程**

1. **类型匹配**：容器中查找与注入属性类型匹配的 Bean（如`BookDao`类型的 Bean）。
2. **匹配结果处理**：
   - 唯一匹配：直接注入。
   - 多个匹配：按属性名与 Bean 名称匹配（如属性名`bookDao` → 匹配 Bean ID 为`bookDao`的实例）。
   - 无匹配：若`@Autowired(required = true)`（默认），则抛出`NoSuchBeanDefinitionException`；若`required = false`，则注入`null`。
3. **底层实现**：通过`AutowiredAnnotationBeanPostProcessor` Bean 完成，该 Bean 实现`BeanPostProcessor`接口，在 Bean 初始化后执行注入逻辑。

**（2）@Qualifier 的作用机制（易错点）**

- `@Qualifier`的本质是指定 Bean 的 ID，需与`@Autowired`配合使用（单独使用无效），优先级高于 "属性名匹配"。
- 示例：容器中有`bookDaoMysql`和`bookDaoOracle`两个`BookDao`实例，`@Autowired @Qualifier("bookDaoMysql")`会直接注入 ID 为`bookDaoMysql`的 Bean，忽略属性名。

**（3）@Value 注入的底层逻辑（难点）**

- `@Value`支持三种注入方式：
  1. 直接值（`@Value("itheima")`）：直接赋值字符串。
  2. 表达式（`@Value("#{10+20}")`）：通过 SpEL 表达式计算值。
  3. 配置值（`@Value("${jdbc.username}")`）：解析 properties 文件或系统变量。
- 底层由`AutowiredAnnotationBeanPostProcessor`和`PropertySourcesPlaceholderConfigurer`协同处理，先解析`${}`再解析`#{}`。

#### 3. Bean 的作用范围与生命周期（重点）

**（1）单例与多例的底层实现（难点）**

- **单例 Bean**（`scope="singleton"`）：容器中仅存一个实例，存储在`DefaultSingletonBeanRegistry`的`singletonObjects`缓存（ConcurrentHashMap）中，线程安全。
- **多例 Bean**（`scope="prototype"`）：每次`getBean()`都会创建新实例，不存入缓存，容器仅负责实例化和注入，不管理生命周期（销毁方法`@PreDestroy`不执行）。

**（2）生命周期的核心回调（重点）**

生命周期流程（单例 Bean）：

```
实例化（反射调用构造器）→ 依赖注入（populateBean）→ 初始化（initializeBean）→ 就绪 → 销毁（destroyBean）
```

- **初始化回调（优先级）**：`@PostConstruct`（JSR-250 注解） > `InitializingBean`接口（`afterPropertiesSet()`） > `init-method`（XML / 注解配置）。
- **销毁回调（优先级）**：`@PreDestroy` > `DisposableBean`接口（`destroy()`） > `destroy-method`。
- **难点**：`@PostConstruct`和`@PreDestroy`依赖`javax.annotation-api`包（JDK9 + 已移除），底层由`CommonAnnotationBeanPostProcessor`解析。

---

### 四、注解管理第三方 Bean

#### 1. @Bean 注解的底层逻辑（难点）

- `@Bean`标注的方法会被`ConfigurationClassPostProcessor`解析为`BeanDefinition`，方法返回值为 Bean 类型，方法名默认作为 Bean ID。
- 若方法有参数（如`@Bean public DataSource dataSource(BookDao bookDao)`），容器会自动按类型注入参数（与`@Autowired`逻辑一致），支持简单类型和引用类型注入。
- **关键区别**：`@Bean`方法所在的类若标注`@Configuration`，则方法会被 CGLIB 动态代理，确保多次调用返回同一个 Bean（单例）；若未标注`@Configuration`，则方法无代理，多次调用返回不同实例。

**@Import 的三种用法（进阶点）**

1. 导入配置类（`@Import(JdbcConfig.class)`）：直接注册配置类中的 Bean。
2. 导入普通类（`@Import(BookDaoImpl.class)`）：将普通类直接注册为 Bean（无需`@Component`注解）。
3. 导入 ImportSelector 实现类（动态导入）：通过代码逻辑动态指定导入的类（SpringBoot 自动配置核心）。

#### 2. 第三方 Bean 的资源注入（易错点）

- **简单类型注入**：需通过`@Value`注入，且`@Value`必须标注在配置类的成员变量上（`@Bean`方法中无法直接使用`${key}`，需通过成员变量中转）。

**示例**：

```java
public class JdbcConfig {
    @Value("${jdbc.url}") // 正确：配置类成员变量注入
    private String url;

    @Bean
    public DataSource dataSource() {
        DruidDataSource ds = new DruidDataSource();
        ds.setUrl(url); // 引用注入的成员变量
        // ds.setUrl("${jdbc.url}"); // 错误：@Bean方法中无法直接解析${}
        return ds;
    }
}
```

---

### 五、Spring 整合开发

#### 1. Spring 整合 MyBatis（核心重点）

**（1）整合核心桥梁（难点）**

| 整合组件 | 作用 | 底层逻辑 |
|---------|------|----------|
| SqlSessionFactoryBean | 替代 MyBatis 的 SqlSessionFactory | 封装 MyBatis 的 Configuration，通过`setDataSource`注入数据源，`setTypeAliasesPackage`配置别名扫描，初始化时创建 SqlSessionFactory 实例。 |
| MapperScannerConfigurer | 扫描 Mapper 接口生成代理对象 | 实现`BeanDefinitionRegistryPostProcessor`接口，扫描指定包下的 Mapper 接口，为每个接口创建`MapperFactoryBean`（FactoryBean），`MapperFactoryBean`会通过 SqlSession 获取代理对象。 |

**（2）Mapper 代理对象的生成流程（核心难点）**

1. `MapperScannerConfigurer`扫描`com.itheima.dao`包下的接口（如`AccountDao`）。
2. 为每个接口创建`MapperFactoryBean`的 BeanDefinition（`BeanClass=MapperFactoryBean`）。
3. 容器初始化时，`MapperFactoryBean`的`getObject()`方法会调用`SqlSession.getMapper(AccountDao.class)`生成代理对象。
4. 代理对象被注入 Service 层（如`AccountService`的`accountDao`属性），调用方法时实际执行`SqlSession`的对应操作。

**（3）事务管理整合（进阶重点）**

- 需导入`spring-tx`依赖，配置`DataSourceTransactionManager` Bean：

```java
@Bean
public PlatformTransactionManager transactionManager(DataSource dataSource) {
    return new DataSourceTransactionManager(dataSource);
}
```

- 标注`@Transactional`注解（类 / 方法级别），Spring 会通过 AOP 生成代理对象，自动管理事务（提交 / 回滚）。

#### 2. Spring 整合 Junit（重点）

**（1）整合底层原理（难点）**

- `@RunWith(SpringJUnit4ClassRunner.class)`的本质是替换 Junit 的默认运行器，让 Junit 在执行测试方法前初始化 Spring 容器。
- `@ContextConfiguration`指定配置类 / 文件，运行器会创建`ApplicationContext`实例，将测试类中的`@Autowired`属性注入容器中的 Bean。
- **关键**：测试类本身会被 Spring 容器管理（作为一个 Bean），因此支持`@Autowired`、`@Value`等注解。

**（2）常见问题（易错点）**

- 测试类若未标注`@ContextConfiguration`，则无法注入 Bean（容器未初始化）。
- 若测试方法需事务支持，需添加`@Transactional`和`@Rollback`（默认回滚测试数据，避免污染数据库）。

---

## ❓ 问答

### Q1：@Autowired 的注入流程是什么？

**A**：
1. 容器初始化时，`AutowiredAnnotationBeanPostProcessor`扫描 Bean 中带有`@Autowired`的属性 / 方法。
2. 根据注入属性的类型，从容器中查找匹配的 Bean。
3. 匹配结果处理：
   - 唯一匹配：直接注入。
   - 多个匹配：结合`@Qualifier`注解指定的 Bean ID 筛选；若无`@Qualifier`，则按属性名与 Bean ID 匹配。
   - 无匹配：若`@Autowired(required = true)`（默认），抛出`NoSuchBeanDefinitionException`；若`required = false`，注入`null`。
4. 通过反射暴力设值（无需 setter 方法），将匹配的 Bean 注入到目标属性。

### Q2：BeanFactory 和 ApplicationContext 的核心差异是什么？

**A**：
- **加载时机**：BeanFactory 延迟加载（getBean 时创建 Bean），ApplicationContext 立即加载（容器初始化时创建单例 Bean）。
- **功能扩展**：BeanFactory 仅提供基础 Bean 管理，ApplicationContext 包含 BeanFactory 所有功能 + 资源加载、事件发布、国际化等。
- **依赖注入**：BeanFactory 需手动触发，ApplicationContext 自动完成依赖注入。

### Q3：Spring 如何解决循环依赖问题？

**A**：Spring 通过「三级缓存」解决单例 Bean 的 setter 注入循环依赖：
- **一级缓存**（singletonObjects）：存储完全初始化完成的单例 Bean。
- **二级缓存**（earlySingletonObjects）：存储早期暴露的单例 Bean（已实例化，但未完成依赖注入和初始化）。
- **三级缓存**（singletonFactories）：存储 Bean 的工厂对象（`ObjectFactory`），用于延迟生成早期 Bean 的代理对象。

**无法解决的场景**：
- 多例 Bean 循环依赖（多例 Bean 不存入缓存）。
- 构造器注入循环依赖（构造器注入在实例化阶段依赖对方，此时 Bean 未暴露到缓存）。

### Q4：@Bean 和 @Component 的核心区别是什么？

**A**：
- **@Component**：用于标注自定义类，让 Spring 扫描并注册为 Bean（类级别注解）。
- **@Bean**：用于标注方法，返回值作为 Bean 注册到容器（方法级别注解），主要用于管理第三方类（如 Druid、Redis）。

### Q5：Spring Bean 的完整生命周期是什么？

**A**：单例 Bean 的完整生命周期：
1. **实例化**：通过反射调用无参构造器创建实例。
2. **依赖注入**：注入属性（setter 注入、构造器注入）。
3. **初始化**：执行`@PostConstruct`方法、`InitializingBean.afterPropertiesSet()`、`init-method`。
4. **就绪**：Bean 可用。
5. **销毁**：执行`@PreDestroy`方法、`DisposableBean.destroy()`、`destroy-method`。

---

## 💡 学习建议

1. **理解核心思想**：重点理解注解开发的底层机制（扫描、注入、生命周期），而非死记硬背注解。
2. **动手实践**：通过编写案例加深理解，特别是`@Autowired`的注入流程和循环依赖解决方案。
3. **对比学习**：对比 XML 配置和注解开发的差异，理解各自的适用场景。
4. **关注底层**：了解 Spring 容器的底层实现（反射、工厂模式、三级缓存），为后续学习 AOP、事务打下基础。
5. **面试准备**：重点掌握`@Autowired`注入流程、循环依赖、BeanFactory 与 ApplicationContext 差异等面试高频点。

---

> **🎯 下一步学习**：Day26 将深入讲解 Spring AOP（面向切面编程），包括 AOP 核心概念、通知类型、切入点表达式、事务管理等核心内容。
