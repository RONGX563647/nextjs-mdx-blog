# 25从XML到注解：Spring IOC的"文艺复兴"之路

> "这XML配置比我的代码还长！"看着1000多行的applicationContext.xml，我陷入了沉思。**当配置的复杂性开始吞噬业务逻辑时，我知道，是时候拥抱注解了。** 但注解真的是银弹吗？还是只是把复杂性从XML转移到了别处？

![image-20260202175830933](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202175830933.png)

## 一、从XML到注解：解放生产力的革命

### 1.1 XML配置的"最后一战"

记得瑞吉外卖项目里的XML配置吗？让我们回顾一下：

xml

```xml
<!-- applicationContext.xml -->
<beans>
    <!-- 数据源配置 -->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/reggie"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
        <property name="initialSize" value="5"/>
        <property name="maxActive" value="20"/>
        <property name="maxWait" value="60000"/>
    </bean>
    
    <!-- MyBatis配置 -->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="mapperLocations" value="classpath:mapper/*.xml"/>
        <property name="typeAliasesPackage" value="com.reggie.entity"/>
    </bean>
    
    <!-- Mapper扫描 -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.reggie.mapper"/>
    </bean>
    
    <!-- 事务管理器 -->
    <bean id="transactionManager" 
          class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- 开启注解事务 -->
    <tx:annotation-driven transaction-manager="transactionManager"/>
    
    <!-- 扫描Service和Component -->
    <context:component-scan base-package="com.reggie.service,com.reggie.component"/>
    
    <!-- 开启AOP自动代理 -->
    <aop:aspectj-autoproxy/>
    
    <!-- 更多Bean... -->
</beans>
```



**痛点：**

1. **配置冗长**：一个简单Bean要写好几行
2. **类型不安全**：写错类名要运行时才报错
3. **难以重构**：改类名得手动改XML
4. **可读性差**：业务逻辑和配置分离，跳转麻烦

### 1.2 注解的春风拂面

java

```java
@Configuration
@ComponentScan("com.reggie")
@EnableTransactionManagement
@EnableAspectJAutoProxy
@PropertySource("classpath:application.properties")
public class AppConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return DruidDataSourceBuilder.create().build();
    }
    
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setMapperLocations(
            new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml")
        );
        factoryBean.setTypeAliasesPackage("com.reggie.entity");
        return factoryBean.getObject();
    }
    
    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer scanner = new MapperScannerConfigurer();
        scanner.setBasePackage("com.reggie.mapper");
        return scanner;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```



**震撼：** 配置从1000+行XML变成了几十行Java代码！

## 二、@Autowired的奇幻漂流：自动装配的陷阱与救赎

### 2.1 @Autowired的"智能"匹配

#### 2.1.1 类型匹配的魔法

java

```java
@Service
public class OrderService {
    // Spring会找到OrderDao类型的Bean注入
    @Autowired
    private OrderDao orderDao;
}
```



**但如果有多个OrderDao实现呢？**

java

```java
@Repository
public class OrderDaoMySqlImpl implements OrderDao { }

@Repository  
public class OrderDaoOracleImpl implements OrderDao { }

@Service
public class OrderService {
    @Autowired  // 报错！NoUniqueBeanDefinitionException
    private OrderDao orderDao;
}
```



#### 2.1.2 @Qualifier：明确指定

java

```java
@Service
public class OrderService {
    @Autowired
    @Qualifier("orderDaoMySqlImpl")  // 指定Bean名称
    private OrderDao orderDao;
}
```



#### 2.1.3 @Primary：设置首选

java

```java
@Repository
@Primary  // 标记为首选，当有多个同类型Bean时优先注入这个
public class OrderDaoMySqlImpl implements OrderDao { }
```



### 2.2 构造器注入：我的最爱

java

```java
@Service
public class OrderService {
    private final OrderDao orderDao;
    private final UserDao userDao;
    private final ProductDao productDao;
    
    // 构造器注入（Spring 4.3+可以省略@Autowired）
    public OrderService(OrderDao orderDao, UserDao userDao, ProductDao productDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
        this.productDao = productDao;
    }
}
```



**优点：**

1. **不可变**：final字段，线程安全
2. **完全初始化**：构造完成时依赖就绪
3. **避免循环依赖**：构造器注入不支持循环依赖，强制你设计更好的架构

### 2.3 字段注入 vs Setter注入 vs 构造器注入

![image-20260202180753163](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202180753163.png)

java

```java
// 字段注入（不推荐）
@Service
public class OrderService {
    @Autowired
    private OrderDao orderDao;
    // 问题：不能final，测试困难，隐藏依赖
}

// Setter注入（可选）
@Service  
public class OrderService {
    private OrderDao orderDao;
    
    @Autowired
    public void setOrderDao(OrderDao orderDao) {
        this.orderDao = orderDao;
    }
    // 优点：可重新注入，支持可选依赖
    // 缺点：可能为null，状态可变
}

// 构造器注入（推荐）
@Service
public class OrderService {
    private final OrderDao orderDao;
    
    public OrderService(OrderDao orderDao) {
        this.orderDao = orderDao;
    }
    // 优点：不可变，完全初始化，依赖明确
}
```



## 三、第三方Bean管理：@Bean的魔法

### 3.1 数据源配置的演变

#### 3.1.1 硬编码配置

java

```java
@Bean
public DataSource dataSource() {
    DruidDataSource ds = new DruidDataSource();
    ds.setUrl("jdbc:mysql://localhost:3306/reggie");
    ds.setUsername("root");
    ds.setPassword("123456");
    ds.setDriverClassName("com.mysql.jdbc.Driver");
    return ds;
}
```



**问题：** 配置写死在代码里，不同环境要改代码

#### 3.1.2 @Value注入

java

```java
@Bean
public DataSource dataSource(
    @Value("${db.url}") String url,
    @Value("${db.username}") String username,
    @Value("${db.password}") String password) {
    
    DruidDataSource ds = new DruidDataSource();
    ds.setUrl(url);
    ds.setUsername(username);
    ds.setPassword(password);
    return ds;
}
```



#### 3.1.3 @ConfigurationProperties：终极方案

yaml

```java
# application.yml
spring:
  datasource:
    druid:
      url: jdbc:mysql://localhost:3306/reggie
      username: root
      password: 123456
      driver-class-name: com.mysql.jdbc.Driver
      initial-size: 5
      max-active: 20
      min-idle: 5
      max-wait: 60000
```



java

```java
@Bean
@ConfigurationProperties(prefix = "spring.datasource.druid")
public DataSource dataSource() {
    // 自动绑定所有配置！
    return DruidDataSourceBuilder.create().build();
}
```



**魔法原理：** Spring Boot会自动将`spring.datasource.druid`下的所有属性绑定到DruidDataSource对象上！

### 3.2 多环境配置

java

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Profile("dev")  // 开发环境
    @ConfigurationProperties(prefix = "spring.datasource.druid.dev")
    public DataSource devDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
    
    @Bean
    @Profile("test")  // 测试环境
    @ConfigurationProperties(prefix = "spring.datasource.druid.test")
    public DataSource testDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
    
    @Bean
    @Profile("prod")  // 生产环境
    @ConfigurationProperties(prefix = "spring.datasource.druid.prod")
    public DataSource prodDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
}
```



**激活方式：**

- 命令行：`java -jar app.jar --spring.profiles.active=prod`
- 环境变量：`export SPRING_PROFILES_ACTIVE=prod`
- JVM参数：`-Dspring.profiles.active=prod`

## 四、Bean的生命周期：从出生到死亡

![image-20260202180957258](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202180957258.png)

### 4.1 完整的生命周期

java

```java
@Component
@Slf4j
public class OrderDaoImpl implements OrderDao, 
      BeanNameAware, BeanFactoryAware, ApplicationContextAware,
      InitializingBean, DisposableBean {
    
    public OrderDaoImpl() {
        log.info("1. 构造方法执行");
    }
    
    @PostConstruct
    public void postConstruct() {
        log.info("3. @PostConstruct执行");
    }
    
    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("4. InitializingBean.afterPropertiesSet执行");
    }
    
    public void initMethod() {
        log.info("5. 自定义init-method执行");
    }
    
    @PreDestroy
    public void preDestroy() {
        log.info("7. @PreDestroy执行");
    }
    
    @Override
    public void destroy() throws Exception {
        log.info("8. DisposableBean.destroy执行");
    }
    
    public void destroyMethod() {
        log.info("9. 自定义destroy-method执行");
    }
    
    // BeanNameAware
    @Override
    public void setBeanName(String name) {
        log.info("2.1 BeanNameAware: 我的名字是 {}", name);
    }
    
    // BeanFactoryAware
    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        log.info("2.2 BeanFactoryAware: 我的工厂是 {}", beanFactory.getClass());
    }
    
    // ApplicationContextAware
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        log.info("2.3 ApplicationContextAware: 我的容器是 {}", applicationContext.getClass());
    }
}
```



**配置：**

java

```java
@Bean(initMethod = "initMethod", destroyMethod = "destroyMethod")
public OrderDao orderDao() {
    return new OrderDaoImpl();
}
```



**执行顺序：**

text

```
1. 构造方法
2. Aware接口回调 (BeanNameAware → BeanFactoryAware → ApplicationContextAware)
3. @PostConstruct
4. InitializingBean.afterPropertiesSet
5. 自定义init-method
6. Bean就绪
7. @PreDestroy
8. DisposableBean.destroy
9. 自定义destroy-method
```



### 4.2 BeanPostProcessor：Bean的后置处理器

java

```java
@Component
@Slf4j
public class MyBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (bean instanceof OrderDao) {
            log.info("Before初始化: {}", beanName);
        }
        return bean;
    }
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof OrderDao) {
            log.info("After初始化: {}", beanName);
        }
        return bean;
    }
}
```



**执行时机：**

- `postProcessBeforeInitialization`：在init-method之前执行
- `postProcessAfterInitialization`：在init-method之后执行

**应用场景：** AOP代理、监控、性能统计等

## 五、Spring整合MyBatis：注解版的优雅

![image-20260202181115769](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202181115769.png)

### 5.1 传统XML配置 vs 注解配置

#### 5.1.1 XML方式

xml

```xml
<!-- mybatis-config.xml -->
<configuration>
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
    <typeAliases>
        <package name="com.reggie.entity"/>
    </typeAliases>
</configuration>
```



xml

```xml
<!-- applicationContext.xml -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
    <property name="configLocation" value="classpath:mybatis-config.xml"/>
    <property name="mapperLocations" value="classpath:mapper/*.xml"/>
</bean>
```



#### 5.1.2 注解方式（推荐）

java

```java
@Configuration
public class MyBatisConfig {
    
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        
        // 配置对象（替代mybatis-config.xml）
        org.apache.ibatis.session.Configuration configuration = 
            new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setLogImpl(StdOutImpl.class);  // 打印SQL
        
        factoryBean.setConfiguration(configuration);
        factoryBean.setTypeAliasesPackage("com.reggie.entity");
        factoryBean.setMapperLocations(
            new PathMatchingResourcePatternResolver()
                .getResources("classpath:mapper/*.xml")
        );
        
        return factoryBean.getObject();
    }
    
    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer scanner = new MapperScannerConfigurer();
        scanner.setBasePackage("com.reggie.mapper");
        scanner.setSqlSessionFactoryBeanName("sqlSessionFactory");
        return scanner;
    }
}
```



### 5.2 纯注解的MyBatis Mapper

java

```java
@Mapper  // 告诉MyBatis这是Mapper接口
@Repository  // 告诉Spring这是Repository
public interface UserMapper {
    
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);
    
    @Insert("INSERT INTO user(name, age) VALUES(#{name}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);
    
    @Update("UPDATE user SET name=#{name}, age=#{age} WHERE id=#{id}")
    int update(User user);
    
    @Delete("DELETE FROM user WHERE id = #{id}")
    int deleteById(Long id);
    
    // 动态SQL
    @SelectProvider(type = UserSqlProvider.class, method = "selectByCondition")
    List<User> selectByCondition(UserCondition condition);
}

// SQL提供类
class UserSqlProvider {
    public String selectByCondition(UserCondition condition) {
        return new SQL() {{
            SELECT("*");
            FROM("user");
            if (condition.getName() != null) {
                WHERE("name like #{name}");
            }
            if (condition.getMinAge() != null) {
                WHERE("age >= #{minAge}");
            }
            if (condition.getMaxAge() != null) {
                WHERE("age <= #{maxAge}");
            }
            ORDER_BY("id desc");
        }}.toString();
    }
}
```



## 六、Spring整合JUnit：测试的艺术

### 6.1 传统JUnit测试的痛点

java

```java
public class OrderServiceTest {
    
    @Test
    public void testPlaceOrder() {
        // 要手动创建所有依赖！
        OrderDao orderDao = new OrderDaoImpl();
        UserDao userDao = new UserDaoImpl();
        // ... 还有一堆依赖
        
        OrderService service = new OrderService(orderDao, userDao, ...);
        // 测试逻辑
    }
}
```



**问题：** 构造依赖太麻烦，而且不是生产环境真实的依赖关系

### 6.2 Spring整合JUnit的优雅

java

```java
@RunWith(SpringRunner.class)  // Spring测试运行器
@SpringBootTest  // 启动Spring Boot应用
@Transactional  // 测试后回滚，不污染数据库
@Rollback(true)  // 默认就是true，显式声明一下
@ActiveProfiles("test")  // 使用测试环境配置
public class OrderServiceTest {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private DataSource dataSource;
    
    @Test
    public void testPlaceOrder() {
        // Spring已经帮我们注入了所有依赖！
        Order order = new Order();
        // 设置订单数据
        
        Long orderId = orderService.placeOrder(order);
        
        assertNotNull(orderId);
        // 更多断言...
    }
    
    @Test
    @Sql("/sql/init-test-data.sql")  // 执行SQL脚本
    public void testPlaceOrderWithData() {
        // 测试前数据库已有初始化数据
    }
    
    @Test
    @Sql(statements = {
        "INSERT INTO user(id, name) VALUES(1001, '测试用户')",
        "INSERT INTO product(id, name, stock) VALUES(2001, '测试商品', 100)"
    })
    public void testPlaceOrderWithInsert() {
        // 测试前插入特定数据
    }
}
```



### 6.3 Mock测试：隔离依赖

java

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class OrderServiceMockTest {
    
    @Autowired
    private OrderService orderService;
    
    @MockBean  // 模拟UserService，不会调用真实方法
    private UserService userService;
    
    @MockBean
    private EmailService emailService;
    
    @Test
    public void testPlaceOrderWithMock() {
        // 模拟用户服务返回特定用户
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        
        when(userService.getUserById(1L)).thenReturn(mockUser);
        when(emailService.send(anyString(), anyString())).thenReturn(true);
        
        Order order = new Order();
        order.setUserId(1L);
        
        orderService.placeOrder(order);
        
        // 验证emailService.send被调用了一次
        verify(emailService, times(1)).send(anyString(), anyString());
    }
}
```



## 七、BeanFactory vs ApplicationContext：容器的选择

### 7.1 BeanFactory：轻量级容器

java

```java
public class BeanFactoryDemo {
    public static void main(String[] args) {
        // 1. 创建BeanFactory
        DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
        
        // 2. 创建Bean定义读取器
        XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(beanFactory);
        
        // 3. 加载配置文件
        reader.loadBeanDefinitions("applicationContext.xml");
        
        // 4. 获取Bean（延迟加载）
        OrderService orderService = beanFactory.getBean(OrderService.class);
        
        // 问题：AOP、事务、事件等高级功能不可用
    }
}
```



**特点：**

- 延迟加载：用到时才创建Bean
- 功能简单：只有基本的IOC功能
- 性能好：启动快，内存占用少

### 7.2 ApplicationContext：企业级容器

java

```java
public class ApplicationContextDemo {
    public static void main(String[] args) {
        // 1. 创建ApplicationContext（立即加载所有单例Bean）
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        
        // 2. 获取Bean（已经创建好了）
        OrderService orderService = context.getBean(OrderService.class);
        
        // 3. 使用高级功能
        // 发布事件
        context.publishEvent(new OrderPlacedEvent(this, order));
        
        // 国际化
        String message = context.getMessage("order.created", null, Locale.CHINA);
        
        // 获取环境变量
        String activeProfile = context.getEnvironment().getActiveProfiles()[0];
    }
}
```



**特点：**

- 立即加载：启动时就创建单例Bean
- 功能丰富：AOP、事务、事件、国际化等
- 方便集成：与Spring其他模块无缝集成

### 7.3 选择建议

| 场景       | 推荐容器                 | 原因                     |
| :--------- | :----------------------- | :----------------------- |
| 移动端应用 | BeanFactory              | 内存敏感，启动要快       |
| Web应用    | ApplicationContext       | 需要完整功能             |
| 单元测试   | 轻量级ApplicationContext | 快速启动，测试隔离       |
| 批处理任务 | ApplicationContext       | 一次性处理，需要完整功能 |

## 八、条件化Bean：智能的Bean创建

### 8.1 @Conditional：根据条件创建Bean

java

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Conditional(DevDataSourceCondition.class)  // 开发环境条件
    @ConfigurationProperties(prefix = "spring.datasource.dev")
    public DataSource devDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
    
    @Bean
    @Conditional(ProdDataSourceCondition.class)  // 生产环境条件
    @ConfigurationProperties(prefix = "spring.datasource.prod")
    public DataSource prodDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
}

// 开发环境条件
public class DevDataSourceCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 检查是否是开发环境
        Environment env = context.getEnvironment();
        return env.acceptsProfiles("dev") && 
               env.containsProperty("spring.datasource.dev.url");
    }
}

// 生产环境条件
public class ProdDataSourceCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        return env.acceptsProfiles("prod") &&
               env.containsProperty("spring.datasource.prod.url");
    }
}
```



### 8.2 Spring Boot的条件注解

![image-20260202181344308](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202181344308.png)

java

```java
@Configuration
public class CacheConfig {
    
    @Bean
    @ConditionalOnClass(RedisTemplate.class)  // 当有RedisTemplate类时
    @ConditionalOnProperty(prefix = "spring.cache", name = "type", havingValue = "redis")
    public CacheManager redisCacheManager(RedisConnectionFactory factory) {
        return RedisCacheManager.create(factory);
    }
    
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)  // 当没有其他CacheManager时
    @ConditionalOnProperty(prefix = "spring.cache", name = "type", havingValue = "simple")
    public CacheManager simpleCacheManager() {
        return new ConcurrentMapCacheManager();
    }
    
    @Bean
    @ConditionalOnWebApplication  // 当是Web应用时
    @ConditionalOnMissingBean
    public CacheManager caffeineCacheManager() {
        return new CaffeineCacheManager();
    }
}
```



**这就是Spring Boot自动配置的原理！**

## 九、如果重来一次，我会...

### 9.1 更早使用构造器注入

java

```java
// 旧习惯：字段注入
@Service
public class OrderService {
    @Autowired private OrderDao orderDao;
    @Autowired private UserDao userDao;
    // ... 还有10个依赖
}

// 新习惯：构造器注入（一眼就知道依赖什么）
@Service
public class OrderService {
    private final OrderDao orderDao;
    private final UserDao userDao;
    
    public OrderService(OrderDao orderDao, UserDao userDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
    }
}
```



### 9.2 使用@ConfigurationProperties统一配置

java

```java
// 旧：到处@Value
@Component
public class AppConfig {
    @Value("${app.name}") private String appName;
    @Value("${app.version}") private String version;
    @Value("${app.description}") private String description;
}

// 新：统一配置类
@Component
@ConfigurationProperties(prefix = "app")
@Data  // Lombok
public class AppProperties {
    private String name;
    private String version;
    private String description;
    private List<String> features;
    private Map<String, String> settings;
}

// 使用
@Service
public class AppService {
    private final AppProperties appProperties;
    
    public AppService(AppProperties appProperties) {
        this.appProperties = appProperties;
        System.out.println("App: " + appProperties.getName() + " v" + appProperties.getVersion());
    }
}
```



### 9.3 理解容器的层次结构

java

```java
// 父容器（公共Bean）
@Configuration
@ComponentScan("com.reggie.common")
public class ParentConfig {
    @Bean
    public DataSource dataSource() {
        // 公共数据源
        return new DruidDataSource();
    }
}

// 子容器（Web相关Bean）
@Configuration
@ComponentScan("com.reggie.web")
public class WebConfig {
    // 可以覆盖父容器的Bean
    @Bean
    @Primary
    public DataSource webDataSource() {
        // Web专用的数据源
        return new DruidDataSource();
    }
}

// 创建容器层次
public static void main(String[] args) {
    // 先创建父容器
    AnnotationConfigApplicationContext parent = new AnnotationConfigApplicationContext(ParentConfig.class);
    
    // 创建子容器，指定父容器
    AnnotationConfigApplicationContext child = new AnnotationConfigApplicationContext();
    child.setParent(parent);
    child.register(WebConfig.class);
    child.refresh();
    
    // 子容器可以访问父容器的Bean，反之不行
    DataSource ds = child.getBean(DataSource.class);  // 获取的是子容器的Bean
}
```



## 结语：注解不是目的，优雅才是

从XML到注解，我学到的不是新的语法，而是**如何更好地组织代码、如何更清晰地表达意图、如何让系统更容易维护**。

注解让配置变得类型安全、让依赖关系变得明确、让测试变得简单。但滥用注解同样会导致问题：注解太多会掩盖业务逻辑、循环依赖会让系统难以理解、过度依赖框架会让代码难以迁移。

**Spring教给我的最重要的一课是：技术应该服务于业务，而不是反过来。** 选择XML还是注解，选择字段注入还是构造器注入，选择BeanFactory还是ApplicationContext，都要根据具体场景来决定。

现在回头看那些密密麻麻的XML配置，我不再觉得它们丑陋，而是看到了Spring框架演进的足迹。从XML到注解，从Spring到Spring Boot，每一次演进都是为了让我们更专注于业务，而不是框架本身。

**好的框架像空气，感觉不到它的存在，却无处不在支撑着系统。** 与所有正在学习Spring的程序员共勉。