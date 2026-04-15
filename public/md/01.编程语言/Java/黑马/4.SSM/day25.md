# 【SSM框架 ｜ day25 spring IOC 与 DI 注解开发】

## 一、学习目标

1. 深度理解 IOC/DI 管理第三方 Bean 的底层逻辑（核心难点）
2. 掌握 Spring 核心容器的实现差异与适用场景（重点）
3. 精通注解开发的底层机制（如注解扫描、自动装配原理）（核心难点）
4. 理解第三方 Bean 资源注入的底层逻辑（重点）
5. 掌握 Spring 与 MyBatis 整合的核心桥梁与事务管理（核心难点）

## 二、IOC/DI 配置管理第三方 Bean（重点）

### 2.1 核心原理

第三方 Bean（如 Druid）的管理本质是：**Spring 通过反射调用第三方类的无参构造器创建实例，再通过 setter 方法注入配置参数**，与自定义 Bean 管理逻辑一致，但需注意第三方类的属性命名规范（如 Druid 的`driverClassName` vs C3P0 的`driverClass`）。

### 2.2 数据源配置深入解析

#### 2.2.1 配置参数映射规则（重点）

- Spring 通过``注入参数时，`name`必须与第三方类的**setter 方法名对应**（如`setDriverClassName` → `name="driverClassName"`），与成员变量名无关。
- 示例：Druid 的`driverClassName`属性对应`setDriverClassName(String driverClassName)`方法，若写错`name`为`driverClass`，则注入失败（无对应 setter）。

#### 2.2.2 加载 properties 文件的底层逻辑（难点）

- ``标签的本质是注册`PropertySourcesPlaceholderConfigurer` Bean，该 Bean 会在容器初始化时加载 properties 文件，将键值对存入`Environment`对象。
- 注入时`${key}`会被`PropertySourcesPlaceholderConfigurer`解析为对应值，优先级：**系统环境变量 > 命令行参数 > properties 文件**（可通过`system-properties-mode="NEVER"`禁用系统变量优先级）。

#### 2.2.3 多配置文件加载的底层限制（易错点）

- 不支持通配符`*`（如`classpath:*.properties`），需显式指定文件名或使用`classpath*:`（扫描所有依赖项目的配置文件）。
- 示例：`@PropertySource({"classpath:jdbc.properties", "classpath:redis.properties"})`（正确），`@PropertySource("classpath:*.properties")`（错误）。

## 三、Spring 核心容器（核心难点）

### 3.1 容器层次结构与核心接口

plaintext

```plaintext
BeanFactory（顶层接口）
├─ ListableBeanFactory（批量获取Bean）
├─ HierarchicalBeanFactory（父子容器）
└─ ApplicationContext（核心接口）
   ├─ ClassPathXmlApplicationContext（类路径XML）
   ├─ FileSystemXmlApplicationContext（文件系统XML）
   └─ AnnotationConfigApplicationContext（注解配置）
```

### 3.2 BeanFactory vs ApplicationContext（重点对比）

| 对比维度 | BeanFactory                     | ApplicationContext                                       | 底层原因                                                     |
| -------- | ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| 加载时机 | 延迟加载（getBean 时创建 Bean） | 立即加载（容器初始化时创建单例 Bean）                    | ApplicationContext 初始化时会调用`refresh()`方法，触发 Bean 的实例化；BeanFactory 仅在调用`getBean()`时才触发。 |
| 功能扩展 | 仅基础 Bean 管理                | 包含 BeanFactory 所有功能 + 资源加载、事件发布、国际化等 | ApplicationContext 继承`ResourceLoader`、`ApplicationEventPublisher`等接口，扩展了更多企业级功能。 |
| 依赖注入 | 需手动触发                      | 自动完成依赖注入                                         | ApplicationContext 在 Bean 实例化后会自动执行依赖注入（`populateBean`方法），BeanFactory 需手动调用`getBean()`才触发。 |

#### 3.2.1 延迟加载与立即加载的实战影响（难点）

- 单例 Bean（默认

  ```
  scope="singleton"
  ```

  ）：

  - ApplicationContext：启动时创建所有单例 Bean，启动慢但运行时快（适合生产环境）。
  - BeanFactory：首次调用`getBean()`时创建，启动快但首次访问慢（适合资源受限环境）。

- 多例 Bean（`scope="prototype"`）：无论哪种容器，均为延迟加载（`getBean()`时创建）。

### 3.3 Bean 的实例化流程（核心难点）

以 ApplicationContext 为例，单例 Bean 的实例化流程：

1. 容器初始化（`refresh()`）→ 扫描 Bean 定义（如``、`@Component`）。
2. 调用`BeanFactoryPostProcessor`处理配置（如解析`${key}`）。
3. 实例化 Bean（`createBean()`）：通过反射调用无参构造器创建实例。
4. 依赖注入（`populateBean()`）：注入属性（setter 注入、构造器注入）。
5. 初始化 Bean（`initializeBean()`）：执行`@PostConstruct`方法、`init-method`。
6. Bean 就绪，存入容器注册表（`DefaultSingletonBeanRegistry`）。

## 四、IOC/DI 注解开发（核心重点 + 难点）

### 4.1 注解扫描的底层机制（难点）

#### 4.1.1 @ComponentScan 的扫描流程

1. 扫描`base-package`指定的包及子包，过滤出带有`@Component`、`@Service`等注解的类。
2. 对每个候选类，通过`AnnotationBeanNameGenerator`生成 Bean 名称（默认类名首字母小写，如`BookServiceImpl` → `bookServiceImpl`）。
3. 将 Bean 定义（`BeanDefinition`）注册到`BeanDefinitionRegistry`（容器的 Bean 定义注册表）。

#### 4.1.2 注解扫描的过滤规则（进阶点）

可通过`@ComponentScan`的`includeFilters`和`excludeFilters`自定义扫描规则：

java

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

### 4.2 依赖注入的底层原理（核心难点）

#### 4.2.1 @Autowired 的注入流程

1. **类型匹配**：容器中查找与注入属性类型匹配的 Bean（如`BookDao`类型的 Bean）。

2. 匹配结果处理

   ：

   - 唯一匹配：直接注入。
   - 多个匹配：按属性名与 Bean 名称匹配（如属性名`bookDao` → 匹配 Bean ID 为`bookDao`的实例）。
   - 无匹配：若`@Autowired(required = true)`（默认），则抛出`NoSuchBeanDefinitionException`；若`required = false`，则注入`null`。

3. **底层实现**：通过`AutowiredAnnotationBeanPostProcessor` Bean 完成，该 Bean 实现`BeanPostProcessor`接口，在 Bean 初始化后执行注入逻辑。

#### 4.2.2 @Qualifier 的作用机制（易错点）

- `@Qualifier`的本质是指定 Bean 的 ID，需与`@Autowired`配合使用（单独使用无效），优先级高于 “属性名匹配”。
- 示例：容器中有`bookDaoMysql`和`bookDaoOracle`两个`BookDao`实例，`@Autowired @Qualifier("bookDaoMysql")`会直接注入 ID 为`bookDaoMysql`的 Bean，忽略属性名。

#### 4.2.3 @Value 注入的底层逻辑（难点）

- ```
  @Value
  ```

  支持三种注入方式：

  1. 直接值（`@Value("itheima")`）：直接赋值字符串。
  2. 表达式（`@Value("#{10+20}")`）：通过 SpEL 表达式计算值。
  3. 配置值（`@Value("${jdbc.username}")`）：解析 properties 文件或系统变量。

- 底层由`AutowiredAnnotationBeanPostProcessor`和`PropertySourcesPlaceholderConfigurer`协同处理，先解析`${}`再解析`#{}`。

### 4.3 Bean 的作用范围与生命周期（重点）

#### 4.3.1 单例与多例的底层实现（难点）

- 单例 Bean（`scope="singleton"`）：容器中仅存一个实例，存储在`DefaultSingletonBeanRegistry`的`singletonObjects`缓存（ConcurrentHashMap）中，线程安全。
- 多例 Bean（`scope="prototype"`）：每次`getBean()`都会创建新实例，不存入缓存，容器仅负责实例化和注入，不管理生命周期（销毁方法`@PreDestroy`不执行）。

#### 4.3.2 生命周期的核心回调（重点）

生命周期流程（单例 Bean）：

plaintext

```plaintext
实例化（反射调用构造器）→ 依赖注入（populateBean）→ 初始化（initializeBean）→ 就绪 → 销毁（destroyBean）
```

- 初始化回调（优先级）：`@PostConstruct`（JSR-250 注解） > `InitializingBean`接口（`afterPropertiesSet()`） > `init-method`（XML / 注解配置）。
- 销毁回调（优先级）：`@PreDestroy` > `DisposableBean`接口（`destroy()`） > `destroy-method`。
- 难点：`@PostConstruct`和`@PreDestroy`依赖`javax.annotation-api`包（JDK9 + 已移除），底层由`CommonAnnotationBeanPostProcessor`解析。

## 五、注解管理第三方 Bean（重点）

### 5.1 @Bean 注解的底层逻辑（难点）

- `@Bean`标注的方法会被`ConfigurationClassPostProcessor`解析为`BeanDefinition`，方法返回值为 Bean 类型，方法名默认作为 Bean ID。
- 若方法有参数（如`@Bean public DataSource dataSource(BookDao bookDao)`），容器会自动按类型注入参数（与`@Autowired`逻辑一致），支持简单类型和引用类型注入。
- 关键区别：`@Bean`方法所在的类若标注`@Configuration`，则方法会被 CGLIB 动态代理，确保多次调用返回同一个 Bean（单例）；若未标注`@Configuration`，则方法无代理，多次调用返回不同实例。

#### 5.1.2 @Import 的三种用法（进阶点）

1. 导入配置类（`@Import(JdbcConfig.class)`）：直接注册配置类中的 Bean。
2. 导入普通类（`@Import(BookDaoImpl.class)`）：将普通类直接注册为 Bean（无需`@Component`注解）。
3. 导入 ImportSelector 实现类（动态导入）：通过代码逻辑动态指定导入的类（SpringBoot 自动配置核心）。

### 5.2 第三方 Bean 的资源注入（易错点）

- 简单类型注入：需通过`@Value`注入，且`@Value`必须标注在配置类的成员变量上（`@Bean`方法中无法直接使用`${key}`，需通过成员变量中转）。

- 示例：

  java

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

  

## 六、Spring 整合开发（核心难点）

### 6.1 Spring 整合 MyBatis（核心重点）

#### 6.1.1 整合核心桥梁（难点）

| 整合组件                | 作用                              | 底层逻辑                                                     |
| ----------------------- | --------------------------------- | ------------------------------------------------------------ |
| SqlSessionFactoryBean   | 替代 MyBatis 的 SqlSessionFactory | 封装 MyBatis 的 Configuration，通过`setDataSource`注入数据源，`setTypeAliasesPackage`配置别名扫描，初始化时创建 SqlSessionFactory 实例。 |
| MapperScannerConfigurer | 扫描 Mapper 接口生成代理对象      | 实现`BeanDefinitionRegistryPostProcessor`接口，扫描指定包下的 Mapper 接口，为每个接口创建`MapperFactoryBean`（FactoryBean），`MapperFactoryBean`会通过 SqlSession 获取代理对象。 |

#### 6.1.2 Mapper 代理对象的生成流程（核心难点）

1. `MapperScannerConfigurer`扫描`com.itheima.dao`包下的接口（如`AccountDao`）。
2. 为每个接口创建`MapperFactoryBean`的 BeanDefinition（`BeanClass=MapperFactoryBean`）。
3. 容器初始化时，`MapperFactoryBean`的`getObject()`方法会调用`SqlSession.getMapper(AccountDao.class)`生成代理对象。
4. 代理对象被注入 Service 层（如`AccountService`的`accountDao`属性），调用方法时实际执行`SqlSession`的对应操作。

#### 6.1.3 事务管理整合（进阶重点）

- 需导入

  ```
  spring-tx
  ```

  依赖，配置

  ```
  DataSourceTransactionManager
  ```

   

  Bean：

  java

  ```java
  @Bean
  public PlatformTransactionManager transactionManager(DataSource dataSource) {
      return new DataSourceTransactionManager(dataSource);
  }
  ```

  

- 标注`@Transactional`注解（类 / 方法级别），Spring 会通过 AOP 生成代理对象，自动管理事务（提交 / 回滚）。

### 6.2 Spring 整合 Junit（重点）

#### 6.2.1 整合底层原理（难点）

- `@RunWith(SpringJUnit4ClassRunner.class)`的本质是替换 Junit 的默认运行器，让 Junit 在执行测试方法前初始化 Spring 容器。
- `@ContextConfiguration`指定配置类 / 文件，运行器会创建`ApplicationContext`实例，将测试类中的`@Autowired`属性注入容器中的 Bean。
- 关键：测试类本身会被 Spring 容器管理（作为一个 Bean），因此支持`@Autowired`、`@Value`等注解。

#### 6.2.2 常见问题（易错点）

- 测试类若未标注`@ContextConfiguration`，则无法注入 Bean（容器未初始化）。
- 若测试方法需事务支持，需添加`@Transactional`和`@Rollback`（默认回滚测试数据，避免污染数据库）。

## 七、核心重难点总结

### 核心难点（必须掌握）

1. IOC 容器的初始化流程（Bean 实例化、依赖注入、初始化）。
2. `@Autowired`自动装配的底层逻辑（类型匹配→名称匹配）。
3. Spring 整合 MyBatis 的核心组件（SqlSessionFactoryBean、MapperScannerConfigurer）。
4. BeanFactory 与 ApplicationContext 的差异（加载时机、功能扩展）。

### 重点掌握（实战高频）

1. 第三方 Bean 的配置（`@Bean`、`@Import`）与资源注入。
2. 注解开发的核心注解（`@ComponentScan`、`@PropertySource`、`@Scope`）。
3. Spring 与 Junit 的整合（`@RunWith`、`@ContextConfiguration`）。

### 易错点（避坑指南）

1. `@Value`注入`${key}`时，需确保`@PropertySource`加载了对应 properties 文件。
2. `@Bean`方法的参数注入依赖容器中已存在的 Bean（需注意配置类导入顺序）。
3. 多例 Bean 的`@PreDestroy`方法不执行（容器不管理多例 Bean 的生命周期）。



# 5 道中大厂 Spring Day02 核心面试题（含重难点解析）

## 面试题 1：请详细说明 @Autowired 的注入流程，以及 Spring 如何解决循环依赖问题？（核心难点）

### 题干分析

考察`@Autowired`底层原理与 Spring 循环依赖解决方案，是中大厂高频面试题，重点考察对 IOC 容器注入机制和缓存设计的理解。

### 答案解析

#### 一、@Autowired 注入流程（底层核心）

1. **注解解析**：容器初始化时，`AutowiredAnnotationBeanPostProcessor`（Bean 后置处理器）扫描 Bean 中带有`@Autowired`的属性 / 方法。

2. **类型匹配**：根据注入属性的类型，从容器中查找匹配的 Bean（通过`BeanFactory.getBean(Class type)`）。

3. 匹配结果处理

   ：

   - 唯一匹配：直接将 Bean 实例注入到目标属性。
   - 多个匹配：结合`@Qualifier`注解指定的 Bean ID 筛选；若无`@Qualifier`，则按属性名与 Bean ID 匹配（如属性名`bookDao`匹配 ID 为`bookDao`的 Bean）。
   - 无匹配：若`@Autowired(required = true)`（默认），抛出`NoSuchBeanDefinitionException`；若`required = false`，注入`null`。

4. **依赖注入**：通过反射暴力设值（无需 setter 方法），将匹配的 Bean 注入到目标属性（`field.set(target, beanInstance)`）。

#### 二、循环依赖解决方案（核心难点）

循环依赖指两个或多个 Bean 相互依赖（如 A 依赖 B，B 依赖 A），Spring 仅解决**单例 Bean 的构造器注入以外**的循环依赖，核心依赖「三级缓存」。

1. **三级缓存定义（底层数据结构：ConcurrentHashMap）**：
   - 一级缓存（singletonObjects）：存储完全初始化完成的单例 Bean（就绪状态）。
   - 二级缓存（earlySingletonObjects）：存储早期暴露的单例 Bean（已实例化，但未完成依赖注入和初始化）。
   - 三级缓存（singletonFactories）：存储 Bean 的工厂对象（`ObjectFactory`），用于延迟生成早期 Bean 的代理对象。
2. **解决流程（以 A 依赖 B，B 依赖 A 为例）**：
   - 1. 容器初始化 A，执行实例化（反射构造器创建 A 实例），将 A 的工厂对象存入三级缓存，此时 A 未完成依赖注入。
   - 1. A 需要注入 B，容器初始化 B，执行实例化，将 B 的工厂对象存入三级缓存。
   - 1. B 需要注入 A，容器从一级缓存查找 A（无）→ 二级缓存（无）→ 三级缓存（有 A 的工厂对象）。
   - 1. 调用 A 的工厂对象生成 A 的早期实例（无代理则直接返回实例），存入二级缓存，移除三级缓存中的 A 工厂。
   - 1. B 注入 A 的早期实例，完成依赖注入和初始化，存入一级缓存，B 就绪。
   - 1. A 注入 B 的就绪实例，完成依赖注入和初始化，存入一级缓存，A 就绪。
3. **无法解决的场景**：
   - 多例 Bean 循环依赖（多例 Bean 不存入缓存，每次`getBean()`创建新实例，无法复用）。
   - 构造器注入循环依赖（构造器注入在实例化阶段依赖对方，此时 Bean 未暴露到缓存）。

### 面试加分点

- 提到`@Autowired`的解析依赖`AutowiredAnnotationBeanPostProcessor`，而非容器直接解析。
- 区分「早期 Bean」与「完全 Bean」的差异（早期 Bean 未完成初始化，不可直接使用）。
- 说明三级缓存的核心作用：延迟生成代理对象（若 Bean 需要 AOP 代理，工厂对象会生成代理后再暴露到二级缓存）。

## 面试题 2：BeanFactory 和 ApplicationContext 的核心差异是什么？实际开发中如何选择？（重点）

### 题干分析

考察 Spring 核心容器的底层实现差异，高频面试题，重点考察对容器加载机制和功能扩展的理解。

### 答案解析

#### 一、核心差异（底层原理 + 实战影响）

| 对比维度     | BeanFactory                                            | ApplicationContext                                           | 底层原因与实战影响                                           |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 加载时机     | 延迟加载：仅在`getBean()`时实例化 Bean                 | 立即加载：容器初始化（`refresh()`）时实例化所有单例 Bean     | - BeanFactory 启动快，首次访问 Bean 慢（适合资源受限环境，如嵌入式设备）。- ApplicationContext 启动慢，运行时访问快（适合生产环境，提前暴露配置错误）。 |
| 功能范围     | 仅提供基础 Bean 管理（getBean、containsBean 等）       | 继承 BeanFactory 所有功能，新增：1. 资源加载（`ResourceLoader`）；2. 事件发布（`ApplicationEventPublisher`）；3. 国际化支持；4. 环境变量解析（`Environment`） | - BeanFactory 仅关注 Bean 生命周期管理，无企业级扩展功能。- ApplicationContext 是企业级开发首选，支持配置文件加载、事件驱动等高级特性。 |
| 依赖注入     | 需手动触发（`getBean()`时才执行注入）                  | 自动触发（实例化后立即执行依赖注入）                         | - BeanFactory 需显式调用`getBean()`才会完成 Bean 的依赖注入。- ApplicationContext 在`populateBean()`阶段自动完成注入，无需手动干预。 |
| 循环依赖支持 | 仅支持单例 Bean 的 setter 注入循环依赖（依赖三级缓存） | 与 BeanFactory 一致，但因立即加载，循环依赖更早暴露          | - 两者解决循环依赖的机制相同，但 ApplicationContext 在容器启动时就会检测循环依赖，而 BeanFactory 在首次访问时才检测。 |

#### 二、实际开发选择原则

1. **优先选择 ApplicationContext**：
   - 企业级应用（Web 项目、微服务）：使用`ClassPathXmlApplicationContext`（XML 配置）或`AnnotationConfigApplicationContext`（注解配置）。
   - 理由：功能全面，支持资源加载、事件驱动、国际化等，且启动时暴露配置错误（如 Bean 未找到、循环依赖），便于问题排查。
2. **特殊场景选择 BeanFactory**：
   - 资源受限环境（嵌入式设备、移动端）：使用`XmlBeanFactory`（已过时，推荐`DefaultListableBeanFactory`）。
   - 理由：体积小、启动快，仅保留核心 Bean 管理功能，减少资源占用。

### 面试易错点

- 误区：「ApplicationContext 不支持延迟加载」→ 错误！可通过`@Scope("singleton") + @Lazy(true)`让单例 Bean 延迟加载。
- 误区：「BeanFactory 不支持依赖注入」→ 错误！BeanFactory 支持依赖注入，但需手动调用`getBean()`触发。

## 面试题 3：@Bean 和 @Component 的核心区别是什么？分别适用于什么场景？（重点）

### 题干分析

考察 Spring Bean 的两种注册方式，高频面试题，重点考察对注解底层逻辑和适用场景的理解。

### 答案解析

#### 一、核心区别（底层原理 + 使用差异）

| 对比维度       | @Component                                                   | @Bean                                                        | 底层逻辑                                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 注册方式       | 注解驱动自动扫描：通过`@ComponentScan`扫描带有`@Component`（含`@Service`/`@Repository`等）的类，自动注册为 Bean | 手动声明注册：在配置类中通过`@Bean`标注方法，方法返回值作为 Bean 实例，手动注册到容器 | - `@Component`是「被动扫描」，容器自动发现并注册。- `@Bean`是「主动声明」，开发者手动控制 Bean 的创建逻辑。 |
| 适用对象       | 自定义类（开发者可修改源码，添加注解）                       | 第三方类（如 DruidDataSource、SqlSessionFactory）或复杂创建逻辑的自定义类（如需要初始化资源、参数校验） | - `@Component`无法用于第三方类（源码不可修改，无法添加注解）。- `@Bean`可灵活控制 Bean 的创建过程（如设置参数、初始化资源）。 |
| Bean 名称生成  | 默认类名首字母小写（如`BookServiceImpl`→`bookServiceImpl`），可通过`@Component("customName")`指定 | 默认方法名（如`@Bean public DataSource dataSource()`→Bean ID 为`dataSource`），可通过`@Bean("customName")`指定 | - `@Component`依赖`AnnotationBeanNameGenerator`生成名称。- `@Bean`依赖`BeanNameGenerator`生成名称，优先级更高。 |
| 依赖注入支持   | 支持`@Autowired`注入属性（容器自动完成）                     | 支持方法参数注入（容器自动按类型注入方法参数），也支持`@Value`注入配置 | - `@Component`的依赖注入是「属性级注入」。- `@Bean`的依赖注入是「方法参数级注入」，更灵活（如注入多个依赖用于 Bean 创建）。 |
| 配置类代理影响 | 无代理（普通类扫描注册）                                     | 若所在类标注`@Configuration`，则方法被 CGLIB 代理，多次调用返回同一个 Bean；若未标注`@Configuration`，则方法无代理，多次调用返回不同实例 | - 示例：@Configuration 类中，`@Bean public A a() { return new A(); }`，多次调用`a()`返回同一个 A 实例。- 非 @Configuration 类中，多次调用`a()`返回不同 A 实例。 |

#### 二、适用场景

1. **@Component（含 @Service/@Repository/@Controller）**：
   - 自定义业务组件（如 Service、Dao、Controller），源码可修改，无需复杂创建逻辑。
   - 示例：`@Service public class UserServiceImpl implements UserService {...}`。
2. **@Bean**：
   - 管理第三方 Bean（如 DruidDataSource、SqlSessionFactory）。
   - 自定义类但创建逻辑复杂（如需要初始化连接池、校验参数）。
   - 示例：`@Bean public DataSource dataSource() { DruidDataSource ds = new DruidDataSource(); ds.setUrl(...); return ds; }`。

### 面试加分点

- 提到`@Component`是「注解扫描注册」，`@Bean`是「方法返回值注册」，底层注册逻辑不同。
- 说明`@Configuration`对`@Bean`的代理影响（保证单例 Bean 的唯一性）。

## 面试题 4：Spring 整合 MyBatis 的核心组件有哪些？Mapper 接口是如何生成代理对象并注入 Service 的？（核心难点）

### 题干分析

考察 Spring 与 MyBatis 整合的底层原理，中大厂高频面试题，重点考察对整合桥梁和 Mapper 代理机制的理解。

### 答案解析

#### 一、整合核心组件（底层桥梁）

| 组件名称                     | 全类名                                                       | 核心作用                          | 底层逻辑                                                     |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------ |
| SqlSessionFactoryBean        | org.mybatis.spring.SqlSessionFactoryBean                     | 替代 MyBatis 的 SqlSessionFactory | 封装 MyBatis 的 Configuration，通过`setDataSource`注入 Spring 管理的数据源，`setTypeAliasesPackage`配置实体类别名扫描，`setMapperLocations`配置映射文件路径，初始化时创建 SqlSessionFactory 实例并注册到容器。 |
| MapperScannerConfigurer      | org.mybatis.spring.mapper.MapperScannerConfigurer            | 扫描 Mapper 接口并生成代理对象    | 实现`BeanDefinitionRegistryPostProcessor`接口，扫描指定包下的 Mapper 接口（如`com.itheima.dao`），为每个接口创建`MapperFactoryBean`（FactoryBean）的 BeanDefinition，而非直接创建接口实例。 |
| MapperFactoryBean            | org.mybatis.spring.mapper.MapperFactoryBean                  | 生成 Mapper 接口的代理对象        | 继承`FactoryBean`接口，`getObject()`方法通过`SqlSession.getMapper(MapperInterface)`生成 MyBatis 的 Mapper 代理对象，`getObjectType()`返回 Mapper 接口类型。 |
| DataSourceTransactionManager | org.springframework.jdbc.datasource.DataSourceTransactionManager | 管理事务（可选）                  | 基于数据源的事务管理器，与`@Transactional`注解配合，实现声明式事务。 |

#### 二、Mapper 代理对象生成与注入流程（核心难点）

1. **Mapper 接口扫描**：
   - `MapperScannerConfigurer`通过`setBasePackage("com.itheima.dao")`指定扫描路径，容器初始化时扫描该路径下的所有接口（如`UserDao`）。
   - 对每个接口，创建`MapperFactoryBean`的 BeanDefinition，设置`mapperInterface`属性为当前接口类型（如`UserDao.class`）。
2. **代理对象生成**：
   - 容器获取`UserDao`类型的 Bean 时，实际获取的是`MapperFactoryBean`实例（因接口无法实例化）。
   - 调用`MapperFactoryBean.getObject()`，内部通过`SqlSessionFactory.openSession()`获取 SqlSession，再调用`SqlSession.getMapper(UserDao.class)`生成代理对象。
   - MyBatis 的`MapperProxyFactory`创建`MapperProxy`（JDK 动态代理），`MapperProxy`持有 SqlSession 和 Mapper 接口信息。
3. **注入 Service 流程**：
   - Service 层通过`@Autowired private UserDao userDao`注入时，容器根据`UserDao`类型查找 BeanDefinition（实际是`MapperFactoryBean`）。
   - 容器调用`MapperFactoryBean.getObject()`获取代理对象，注入到 Service 的`userDao`属性。
   - Service 调用`userDao.selectById(1)`时，实际执行`MapperProxy.invoke()`方法，通过 SqlSession 执行 SQL 操作。

### 面试易错点

- 误区：「Mapper 接口被 Spring 直接实例化」→ 错误！Mapper 接口无法实例化，实际注入的是 MyBatis 生成的 JDK 动态代理对象。
- 误区：「SqlSessionFactoryBean 直接生成 SqlSession」→ 错误！SqlSessionFactoryBean 生成 SqlSessionFactory，SqlSession 由 SqlSessionFactory 创建（Spring 管理的 SqlSession 是线程不安全的，每次操作创建新实例）。

## 面试题 5：Spring Bean 的完整生命周期是什么？初始化和销毁回调有哪些方式？优先级如何？（重点）

### 题干分析

考察 Bean 生命周期的底层流程和回调机制，高频面试题，重点考察对 Bean 创建、初始化、销毁全流程的理解。

### 答案解析

#### 一、单例 Bean 的完整生命周期（核心流程）

Spring Bean 的生命周期从容器初始化到容器关闭，分为 5 个核心阶段，底层依赖`AbstractAutowireCapableBeanFactory`的`createBean()`方法：

1. **Bean 定义解析**：容器扫描`@Component`、``等配置，将 Bean 信息解析为`BeanDefinition`（存储类名、属性、依赖等），注册到`BeanDefinitionRegistry`。
2. **实例化（Instantiation）**：容器通过反射调用 Bean 的无参构造器（默认）创建实例（`newInstance()`），此时 Bean 仅完成内存分配，属性为默认值。
3. **依赖注入（Populate）**：容器解析 Bean 的依赖（`@Autowired`、``等），从容器中获取依赖 Bean，通过反射暴力设值或 setter 方法注入到当前 Bean 的属性。
4. **初始化（Initialization）**：Bean 完成依赖注入后，执行初始化逻辑，最终成为就绪状态的 Bean。
5. **销毁（Destruction）**：容器关闭时（如`ctx.close()`），执行 Bean 的销毁逻辑，释放资源。

#### 二、初始化与销毁回调方式（重点）

Spring 提供 3 种回调方式，支持自定义初始化和销毁逻辑，优先级从高到低排序。

| 回调类型            | 初始化回调                                                  | 销毁回调                                                     | 底层原理                                                     |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 注解方式（JSR-250） | `@PostConstruct`                                            | `@PreDestroy`                                                | 由`CommonAnnotationBeanPostProcessor`解析，在依赖注入后 / 容器关闭前调用注解标注的方法。 |
| 接口方式            | `InitializingBean`接口（`afterPropertiesSet()`方法）        | `DisposableBean`接口（`destroy()`方法）                      | Bean 实现接口后，容器在初始化阶段调用`afterPropertiesSet()`，销毁阶段调用`destroy()`。 |
| 配置方式            | XML：`init-method="init"`；注解：`@Bean(initMethod="init")` | XML：`destroy-method="destroy"`；注解：`@Bean(destroyMethod="destroy")` | 容器通过反射调用配置指定的方法，方法名可自定义。             |

#### 三、回调优先级与执行顺序

1. **初始化顺序**：`@PostConstruct` → `InitializingBean.afterPropertiesSet()` → 配置指定的`init-method`。
2. **销毁顺序**：`@PreDestroy` → `DisposableBean.destroy()` → 配置指定的`destroy-method`。

#### 四、关键注意点

1. 多例 Bean 的生命周期：容器仅负责实例化和依赖注入，不管理初始化后的生命周期（销毁回调不执行，需手动调用销毁方法）。
2. 初始化方法的执行时机：在依赖注入完成后执行（确保初始化时属性已赋值）。
3. `@PostConstruct`依赖`javax.annotation-api`包（JDK9 + 已移除，需手动导入依赖）。

### 面试加分点

- 提到 Bean 生命周期的底层实现类（`AbstractAutowireCapableBeanFactory`）。
- 区分实例化（创建对象）和初始化（执行自定义逻辑）的差异。
- 说明多例 Bean 与单例 Bean 生命周期的核心区别（销毁回调是否执行）。

## 总结

以上 5 道面试题覆盖了 Spring Day02 的核心知识点（IOC/DI 底层、容器差异、注解原理、整合开发），均为中大厂高频考察内容。答题时需注意：

1. 底层原理优先（如三级缓存、BeanDefinition、反射机制）。
2. 流程清晰（按步骤拆解，如注入流程、生命周期流程）。
3. 区分易混淆点（如`@Bean`与`@Component`、单例与多例生命周期）。
4. 结合实战场景（如容器选择、组件适用场景），体现落地能力。