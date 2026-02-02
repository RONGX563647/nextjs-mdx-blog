# 24Spring IOC与DI：从"new"到"优雅解耦"的救赎之路

> 记得刚学Java时，导师说："遇到需求就new一个对象，简单！" 直到我维护一个上万行的单体项目，看着满屏的`new Service()`、`new Dao()`，我才明白：**简单不等于优雅，能跑不等于可维护**。Spring的IOC，就是那个把我从"new地狱"中拯救出来的英雄。

![image-20260202171736519](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202171736519.png)

## 一、从"new地狱"到"IOC救赎"

### 1.1 我经历过的"new地狱"

刚接手一个老项目时，代码是这样的：

java

```java
// OrderService.java
public class OrderService {
    private OrderDao orderDao = new OrderDaoImpl();
    private UserDao userDao = new UserDaoImpl();
    private ProductDao productDao = new ProductDaoImpl();
    private EmailService emailService = new EmailServiceImpl();
    private SmsService smsService = new SmsServiceImpl();
    
    public void placeOrder(Order order) {
        // 验证用户
        User user = userDao.getById(order.getUserId());
        
        // 验证商品库存
        Product product = productDao.getById(order.getProductId());
        
        // 保存订单
        orderDao.save(order);
        
        // 发送邮件
        emailService.sendOrderConfirmation(user.getEmail(), order);
        
        // 发送短信
        smsService.sendOrderNotification(user.getPhone(), order);
    }
}
```



**问题来了：**

1. **测试困难**：想单元测试`placeOrder`？得把5个依赖都mock一遍
2. **切换困难**：想把邮件服务换成阿里云的，得改代码、重新编译
3. **单例问题**：每个OrderService都有自己的Dao实例，数据库连接爆炸
4. **循环依赖**：如果UserService也要用OrderService？互相new会死锁

### 1.2 第一次接触Spring：这配置是啥？

导师给我看Spring配置：

xml

```xml
<!-- applicationContext.xml -->
<beans>
    <bean id="orderDao" class="com.example.dao.OrderDaoImpl"/>
    <bean id="userDao" class="com.example.dao.UserDaoImpl"/>
    <bean id="productDao" class="com.example.dao.ProductDaoImpl"/>
    <bean id="emailService" class="com.example.service.EmailServiceImpl"/>
    <bean id="smsService" class="com.example.service.SmsServiceImpl"/>
    
    <bean id="orderService" class="com.example.service.OrderService">
        <property name="orderDao" ref="orderDao"/>
        <property name="userDao" ref="userDao"/>
        <property name="productDao" ref="productDao"/>
        <property name="emailService" ref="emailService"/>
        <property name="smsService" ref="smsService"/>
    </bean>
</beans>
```



**我的第一反应：** "这XML比我的代码还长！说好的简化呢？"

**导师的回答：** "别急，看你的Service变成什么样了。"

### 1.3 改造后的OrderService

java

```java
public class OrderService {
    // 不再new！等着Spring注入
    private OrderDao orderDao;
    private UserDao userDao;
    private ProductDao productDao;
    private EmailService emailService;
    private SmsService smsService;
    
    // Setter方法（JavaBean规范）
    public void setOrderDao(OrderDao orderDao) {
        this.orderDao = orderDao;
    }
    
    public void setUserDao(UserDao dao) {  // 等等，这参数名不对！
        this.userDao = dao;
    }
    
    // 其他setter...
    
    public void placeOrder(Order order) {
        // 同样的业务逻辑
    }
}
```



**运行测试：**

java

```java
public class TestOrderService {
    public static void main(String[] args) {
        // 1. 加载Spring配置
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        
        // 2. 获取OrderService（Spring已经帮我们new好了，依赖也注入了）
        OrderService orderService = (OrderService) context.getBean("orderService");
        
        // 3. 直接使用！
        Order order = new Order();
        orderService.placeOrder(order);
    }
}
```



**那一刻的震撼：** 我不用关心OrderService怎么创建，不用关心它的依赖怎么组装，只管用就行！

## 二、IOC容器的奇幻漂流：Bean工厂的秘密

![image-20260202171929144](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202171929144.png)

### 2.1 Bean工厂的底层实现（简化版）

我好奇Spring怎么做到自动创建对象的，于是写了个简单的Bean工厂模拟：

java

```java
public class SimpleBeanFactory {
    // 存储Bean定义
    private Map<String, BeanDefinition> beanDefinitions = new HashMap<>();
    
    // 存储创建好的Bean实例（单例池）
    private Map<String, Object> singletonPool = new HashMap<>();
    
    // 解析XML配置（简化）
    public void loadConfig(String configFile) {
        // 模拟解析XML，创建BeanDefinition
        BeanDefinition orderDaoDef = new BeanDefinition();
        orderDaoDef.setId("orderDao");
        orderDaoDef.setClassName("com.example.dao.OrderDaoImpl");
        orderDaoDef.setSingleton(true);  // 默认单例
        
        BeanDefinition orderServiceDef = new BeanDefinition();
        orderServiceDef.setId("orderService");
        orderServiceDef.setClassName("com.example.service.OrderService");
        orderServiceDef.setSingleton(true);
        
        // 设置依赖关系
        PropertyDefinition prop = new PropertyDefinition();
        prop.setName("orderDao");
        prop.setRef("orderDao");
        orderServiceDef.addProperty(prop);
        
        beanDefinitions.put("orderDao", orderDaoDef);
        beanDefinitions.put("orderService", orderServiceDef);
    }
    
    // 获取Bean
    public Object getBean(String beanName) {
        BeanDefinition def = beanDefinitions.get(beanName);
        if (def == null) {
            throw new RuntimeException("Bean '" + beanName + "' not found");
        }
        
        // 单例模式：已经创建过直接返回
        if (def.isSingleton() && singletonPool.containsKey(beanName)) {
            return singletonPool.get(beanName);
        }
        
        // 创建Bean实例（反射）
        Object bean = createBean(def);
        
        // 如果是单例，放入池子
        if (def.isSingleton()) {
            singletonPool.put(beanName, bean);
        }
        
        return bean;
    }
    
    private Object createBean(BeanDefinition def) {
        try {
            // 1. 反射创建实例
            Class<?> clazz = Class.forName(def.getClassName());
            Object bean = clazz.newInstance();  // 调用无参构造
            
            // 2. 依赖注入
            for (PropertyDefinition prop : def.getProperties()) {
                // 找到setter方法
                String setterName = "set" + 
                    prop.getName().substring(0, 1).toUpperCase() + 
                    prop.getName().substring(1);
                
                // 获取依赖的Bean
                Object dependency = getBean(prop.getRef());
                
                // 反射调用setter
                Method setter = clazz.getMethod(setterName, dependency.getClass());
                setter.invoke(bean, dependency);
            }
            
            // 3. 初始化方法（如果有）
            if (def.getInitMethod() != null) {
                Method initMethod = clazz.getMethod(def.getInitMethod());
                initMethod.invoke(bean);
            }
            
            return bean;
        } catch (Exception e) {
            throw new RuntimeException("创建Bean失败: " + def.getId(), e);
        }
    }
}

// Bean定义类
class BeanDefinition {
    private String id;
    private String className;
    private boolean singleton = true;
    private List<PropertyDefinition> properties = new ArrayList<>();
    private String initMethod;
    private String destroyMethod;
    // getter/setter省略
}

// 属性定义
class PropertyDefinition {
    private String name;  // 属性名
    private String ref;   // 引用的Bean名
    private String value; // 简单类型的值
    // getter/setter省略
}
```



**运行演示：**

java

```java
public class Demo {
    public static void main(String[] args) {
        SimpleBeanFactory factory = new SimpleBeanFactory();
        factory.loadConfig("applicationContext.xml");
        
        // 第一次获取：创建+注入
        OrderService service1 = (OrderService) factory.getBean("orderService");
        System.out.println("第一次获取: " + service1);
        
        // 第二次获取：从单例池拿
        OrderService service2 = (OrderService) factory.getBean("orderService");
        System.out.println("第二次获取: " + service2);
        System.out.println("是同一个对象吗？ " + (service1 == service2));  // true
    }
}
```



**这就是Spring IOC容器的核心原理！** 当然，Spring的实现更复杂（支持循环依赖、AOP代理、事件机制等），但基本思想就是这样。

### 2.2 单例 vs 多例：一个意想不到的bug

有一次线上出bug：用户A看到了用户B的购物车！

**原因：** 我把购物车对象配置成了单例！

xml

```xml
<!-- 错误配置！购物车应该是多例的 -->
<bean id="shoppingCart" class="com.example.ShoppingCart" scope="singleton"/>
```



**修正：**

xml

```xml
<!-- 正确：每个用户有自己的购物车 -->
<bean id="shoppingCart" class="com.example.ShoppingCart" scope="prototype"/>
```



**单例(Singleton)使用场景：**

- Service、Dao、工具类（无状态，线程安全）
- 缓存、配置信息

**多例(Prototype)使用场景：**

- 购物车、用户会话（有状态，线程不安全）
- 每次需要新实例的业务对象

### 2.3 生命周期：Bean的一生

我调试时发现，Bean不是简单new出来就完事的：

java

```java
public class OrderDaoImpl implements OrderDao, InitializingBean, DisposableBean {
    
    private DataSource dataSource;
    
    public OrderDaoImpl() {
        System.out.println("1. 构造方法被调用");
    }
    
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
        System.out.println("2. 依赖注入：setDataSource被调用");
    }
    
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("3. 初始化：afterPropertiesSet被调用");
        // 可以在这里初始化资源，比如建立数据库连接池
    }
    
    public void init() {
        System.out.println("4. 自定义初始化：init被调用");
    }
    
    @Override
    public void save() {
        System.out.println("5. 业务方法被调用");
    }
    
    @Override
    public void destroy() throws Exception {
        System.out.println("6. 销毁：destroy被调用");
        // 释放资源，比如关闭数据库连接
    }
    
    public void customDestroy() {
        System.out.println("7. 自定义销毁：customDestroy被调用");
    }
}
```



**XML配置：**

xml

```xml
<bean id="dataSource" class="com.example.DataSource"/>
<bean id="orderDao" class="com.example.OrderDaoImpl" 
      init-method="init" destroy-method="customDestroy">
    <property name="dataSource" ref="dataSource"/>
</bean>
```



**测试代码：**

java

```java
public class LifecycleTest {
    public static void main(String[] args) {
        // 注意：要用ClassPathXmlApplicationContext，它才有close方法
        ClassPathXmlApplicationContext context = 
            new ClassPathXmlApplicationContext("applicationContext.xml");
        
        OrderDao orderDao = context.getBean(OrderDao.class);
        orderDao.save();
        
        context.close();  // 触发销毁方法
        
        // 或者注册关闭钩子，JVM退出时自动销毁
        // context.registerShutdownHook();
    }
}
```



**输出顺序：**

text

```
1. 构造方法被调用
2. 依赖注入：setDataSource被调用
3. 初始化：afterPropertiesSet被调用
4. 自定义初始化：init被调用
5. 业务方法被调用
6. 销毁：destroy被调用
7. 自定义销毁：customDestroy被调用
```



**发现：** 接口方法`afterPropertiesSet`先于自定义的`init`执行！

## 三、依赖注入的三种姿势

![image-20260202172116505](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202172116505.png)

### 3.1 Setter注入：灵活但可能为null

java

```java
public class OrderService {
    private OrderDao orderDao;
    
    // Setter注入
    public void setOrderDao(OrderDao orderDao) {
        this.orderDao = orderDao;
    }
    
    public void placeOrder() {
        if (orderDao == null) {
            // 可能忘记配置依赖注入，运行时才报错！
            throw new RuntimeException("orderDao未注入！");
        }
        orderDao.save();
    }
}
```



**优点：** 灵活，可以重新注入
**缺点：** 依赖可能为null，需要在运行时检查

### 3.2 构造器注入：我的最爱

java

```java
public class OrderService {
    private final OrderDao orderDao;
    private final UserDao userDao;
    
    // 构造器注入
    public OrderService(OrderDao orderDao, UserDao userDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
        // 构造完成时，所有依赖都就绪了
    }
    
    public void placeOrder() {
        // 不用检查null，构造时已经保证了
        orderDao.save();
        userDao.update();
    }
}
```



**XML配置：**

xml

```xml
<bean id="orderService" class="com.example.OrderService">
    <!-- 按参数顺序 -->
    <constructor-arg index="0" ref="orderDao"/>
    <constructor-arg index="1" ref="userDao"/>
    
    <!-- 或者按参数名（更清晰） -->
    <!-- <constructor-arg name="orderDao" ref="orderDao"/> -->
    <!-- <constructor-arg name="userDao" ref="userDao"/> -->
</bean>
```



**优点：**

1. **不可变**：final字段，线程安全
2. **完全初始化**：对象创建时所有依赖就绪
3. **避免null**：不用检查依赖是否为null
4. **清晰**：构造器明确告诉你需要什么依赖

### 3.3 字段注入：方便但有坑

java

```java
@Component
public class OrderService {
    @Autowired  // 字段注入
    private OrderDao orderDao;
    
    @Resource(name = "userDao")  // JSR-250标准
    private UserDao userDao;
    
    @Value("${order.maxItems:10}")  // 注入配置值
    private int maxItems;
}
```



**字段注入的问题：**

1. **不能final**：字段不能是final，失去了不变性
2. **测试困难**：不能通过构造器注入mock对象
3. **隐藏依赖**：看代码不知道这个类需要哪些依赖
4. **容易过度使用**：新手容易滥用，导致类变得臃肿

## 四、那些年我踩过的坑

### 4.1 循环依赖：鸡生蛋蛋生鸡

**场景：** OrderService需要UserService，UserService也需要OrderService

java

```java
@Service
public class OrderService {
    @Autowired
    private UserService userService;
    
    public void placeOrder() {
        userService.validateUser();
    }
}

@Service  
public class UserService {
    @Autowired
    private OrderService orderService;
    
    public void validateUser() {
        // 可能需要检查用户的历史订单
    }
}
```



**Spring报错：**

text

```
BeanCurrentlyInCreationException: 
Error creating bean with name 'orderService': 
Requested bean is currently in creation: Is there an unresolvable circular reference?
```



**解决方案：**

1. **重构设计**（推荐）：提取公共逻辑到第三个类
2. **使用@Lazy**：延迟加载其中一个依赖
3. **Setter注入**：Spring对Setter注入的循环依赖有特殊处理
4. **@Autowired + @Qualifier**：明确指定Bean

### 4.2 Bean名称冲突：同名不同命

java

```java
@Component("userDao")  // 名字叫userDao
public class UserDaoMySqlImpl implements UserDao {
    // ...
}

@Repository  // 默认名字叫userDaoImpl
public class UserDaoOracleImpl implements UserDao {
    // ...
}
```



**报错：** `BeanDefinitionOverrideException`，两个Bean都叫userDao

**解决方案：**

java

```java
@Autowired
@Qualifier("userDaoOracleImpl")  // 明确指定用哪个
private UserDao userDao;
```



### 4.3 多环境配置：开发和生产用不同的Bean

xml

```xml
<!-- 开发环境 -->
<beans profile="dev">
    <bean id="dataSource" class="com.example.DevDataSource">
        <property name="url" value="jdbc:mysql://localhost:3306/dev"/>
    </bean>
</beans>

<!-- 生产环境 -->
<beans profile="prod">
    <bean id="dataSource" class="com.example.ProdDataSource">
        <property name="url" value="jdbc:mysql://prod-db:3306/prod"/>
    </bean>
</beans>
```



**激活方式：**

- JVM参数：`-Dspring.profiles.active=prod`
- 环境变量：`export SPRING_PROFILES_ACTIVE=prod`

## 五、从XML到注解：配置的演进

### 5.1 XML配置时代（Spring 2.x）

xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans>
    <!-- 数据源 -->
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/test"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
        <property name="initialSize" value="5"/>
        <property name="maxActive" value="10"/>
    </bean>
    
    <!-- 事务管理器 -->
    <bean id="transactionManager" 
          class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- Dao -->
    <bean id="userDao" class="com.example.dao.UserDaoImpl">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- Service -->
    <bean id="userService" class="com.example.service.UserServiceImpl">
        <property name="userDao" ref="userDao"/>
    </bean>
    
    <!-- 更多Bean... -->
</beans>
```



**问题：** XML文件越来越长，找Bean定义像大海捞针

### 5.2 注解配置时代（Spring 3.x+）

java

```java
@Configuration
@ComponentScan("com.example")  // 扫描这个包下的注解
@PropertySource("classpath:application.properties")
public class AppConfig {
    
    @Bean
    @Profile("dev")  // 开发环境
    public DataSource devDataSource() {
        BasicDataSource ds = new BasicDataSource();
        ds.setDriverClassName("com.mysql.jdbc.Driver");
        ds.setUrl("jdbc:mysql://localhost:3306/dev");
        ds.setUsername("root");
        ds.setPassword("123456");
        return ds;
    }
    
    @Bean
    @Profile("prod")  // 生产环境
    public DataSource prodDataSource() {
        // 生产环境的数据源配置
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}

// Dao层
@Repository
public class UserDaoImpl implements UserDao {
    @Autowired
    private DataSource dataSource;
    // ...
}

// Service层  
@Service
public class UserServiceImpl implements UserService {
    private final UserDao userDao;
    
    @Autowired  // 构造器注入，可以省略@Autowired（Spring 4.3+）
    public UserServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }
    // ...
}
```



**优点：**

1. **类型安全**：编译时检查，不会写错类名
2. **IDE支持**：自动补全、跳转到定义
3. **配置集中**：Java代码中，逻辑更清晰
4. **条件化Bean**：用`@Conditional`实现复杂条件

### 5.3 Spring Boot：约定大于配置

![image-20260202172435157](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202172435157.png)

java

```java
@SpringBootApplication  // 一个注解搞定所有
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// Service
@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    // ...
}

// Repository（Spring Data JPA）
public interface UserRepository extends JpaRepository<User, Long> {
    // 不用写实现，Spring自动生成
    List<User> findByName(String name);
}
```



**Spring Boot做了什么：**

1. **自动配置**：根据classpath中的jar包自动配置Bean
2. **内嵌服务器**：不用部署到Tomcat，直接运行
3. **健康检查**：`/actuator/health`端点
4. **外部化配置**：`application.yml`统一管理配置

## 六、IOC容器的设计模式

理解了这些设计模式，才算真正懂了Spring IOC：

![image-20260202172555228](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202172555228.png)

### 6.1 工厂模式（BeanFactory）

java

```java
// 工厂接口
public interface BeanFactory {
    Object getBean(String name);
    <T> T getBean(Class<T> requiredType);
    boolean containsBean(String name);
}

// 具体工厂
public class DefaultListableBeanFactory implements BeanFactory {
    private Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>();
    
    @Override
    public Object getBean(String name) {
        BeanDefinition bd = beanDefinitionMap.get(name);
        if (bd == null) {
            throw new NoSuchBeanDefinitionException(name);
        }
        
        // 单例？多例？构造器注入？Setter注入？
        // 都在这里处理
        return createBean(bd);
    }
}
```



### 6.2 单例模式（Singleton Registry）

java

```java
public class DefaultSingletonBeanRegistry {
    // 单例对象缓存
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);
    
    protected Object getSingleton(String beanName) {
        Object singletonObject = this.singletonObjects.get(beanName);
        if (singletonObject == null) {
            // 双重检查锁创建单例
            synchronized (this.singletonObjects) {
                singletonObject = this.singletonObjects.get(beanName);
                if (singletonObject == null) {
                    singletonObject = createBean(beanName);
                    this.singletonObjects.put(beanName, singletonObject);
                }
            }
        }
        return singletonObject;
    }
}
```



### 6.3 模板方法模式（Bean生命周期）

java

```java
public abstract class AbstractAutowireCapableBeanFactory {
    
    // 创建Bean的模板方法
    protected Object createBean(String beanName, BeanDefinition bd) {
        // 1. 实例化
        Object bean = instantiateBean(beanName, bd);
        
        // 2. 属性填充（依赖注入）
        populateBean(beanName, bd, bean);
        
        // 3. 初始化
        bean = initializeBean(beanName, bean, bd);
        
        return bean;
    }
    
    // 这些方法可以被子类重写
    protected abstract Object instantiateBean(String beanName, BeanDefinition bd);
    protected abstract void populateBean(String beanName, BeanDefinition bd, Object bean);
    protected abstract Object initializeBean(String beanName, Object bean, BeanDefinition bd);
}
```



## 七、如果重来一次，我会...

### 7.1 更早使用构造器注入

java

```java
// 旧代码：字段注入
@Service
public class OrderService {
    @Autowired private OrderDao orderDao;
    @Autowired private UserDao userDao;
    @Autowired private ProductDao productDao;
    // ... 还有10个依赖
}

// 新代码：构造器注入
@Service
public class OrderService {
    private final OrderDao orderDao;
    private final UserDao userDao;
    private final ProductDao productDao;
    
    @Autowired  // Spring 4.3+ 可以省略
    public OrderService(OrderDao orderDao, UserDao userDao, ProductDao productDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
        this.productDao = productDao;
        
        // 依赖太多？说明这个类职责太重，考虑拆分！
        if (参数太多) {
            log.warn("OrderService有太多依赖，考虑重构");
        }
    }
}
```



### 7.2 使用@Configuration类替代XML

java

```java
@Configuration
@EnableTransactionManagement
@EnableCaching
public class AppConfig {
    
    @Bean
    @ConditionalOnMissingBean  // 没有其他DataSource时使用这个
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(env.getProperty("spring.datasource.url"));
        ds.setUsername(env.getProperty("spring.datasource.username"));
        ds.setPassword(env.getProperty("spring.datasource.password"));
        return ds;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```



### 7.3 理解IOC容器的层次结构

java

```java
// 父容器（基础服务）
ApplicationContext parent = new ClassPathXmlApplicationContext("parent-context.xml");

// 子容器（Web模块，可以覆盖父容器的Bean）
ApplicationContext child = new ClassPathXmlApplicationContext(
    new String[] {"child-context.xml"}, parent);

// Web应用典型结构：
// 父容器：Service、Dao、事务管理等公共Bean
// 子容器：Controller、Web相关Bean
```



## 结语：从"工匠"到"架构师"的蜕变

学Spring IOC的过程，让我从只关心"这个功能怎么实现"的码农，变成了思考"这个系统怎么设计"的工程师：

1. **关注点分离**：对象创建和使用分离，代码更清晰
2. **依赖倒置**：面向接口编程，而不是面向实现
3. **单一职责**：每个类只做一件事，每个方法只做一件事
4. **开闭原则**：对扩展开放，对修改关闭

**现在看当年写的`new Service()`代码，就像看小时候的涂鸦——虽然能看出画的是什么，但确实不够优雅。**

**Spring教给我的最重要的不是怎么用@Autowired，而是：好的架构让代码自己会说话，让系统自己会成长。**

与所有正在从"new对象"向"IOC容器"转变的程序员共勉：**每一次解耦，都是向更好的软件设计迈进一步。**