# 【SSM框架 ｜ day24 spring IOC 与 DI】

# 

## 一、核心思想：IOC 与 DI（⭐️ 面试 / 实操核心）

### 1. 为什么需要 IOC/DI？（解耦是核心目标）

传统开发痛点：

java

运行

```java
// 传统业务层代码：硬编码依赖，耦合度极高
public class BookServiceImpl implements BookService {
    // 问题1：直接new Dao，业务层与Dao层强绑定
    private BookDao bookDao = new BookDaoImpl(); 
    // 问题2：若Dao实现类变更（如BookDaoMysqlImpl），必须修改业务层代码，重新编译部署
}
```

- 耦合度高的后果：维护成本高、扩展性差、测试困难。
- Spring 解决方案：**将对象创建权交给容器，依赖关系由容器自动绑定**—— 即 IOC+DI。

### 2. 深度理解 IOC（控制反转）

#### （1）“反转” 的到底是什么？

- 传统开发：程序（开发者）主动控制对象创建（`new`）和依赖管理。
- Spring 开发：容器（Spring IOC 容器）被动接收配置，主动创建对象、管理对象生命周期 ——**反转 “对象创建权” 和 “依赖管理权”**。

#### （2）IOC 容器的本质

- 不是 new 出来的普通对象，而是一个

  工厂 + 注册表 + 依赖解析器

  ：

  1. 工厂：根据配置创建 Bean 对象（反射实现）。
  2. 注册表：存储所有管理的 Bean（key=id/name，value=Bean 实例）。
  3. 依赖解析器：分析 Bean 间依赖，自动完成注入。

#### （3）核心价值

- 解耦：业务层与数据层分离，无需关心依赖对象的创建细节。
- 可复用：Bean 由容器统一管理，多模块可共享。
- 可维护：对象创建、依赖变更只需修改配置，无需改代码。

### 3. 深度理解 DI（依赖注入）

#### （1）定义：依赖注入是 IOC 的具体实现

- 容器在创建 Bean 时，自动将其依赖的其他 Bean（或简单数据）注入到属性中，无需开发者手动`set`或`new`。
- 依赖：若 A 对象需要调用 B 对象的方法，则 A 依赖 B（如 BookService 依赖 BookDao）。
- 注入：容器将 B 对象 “塞” 到 A 对象的属性中，让 A 对象直接使用。

#### （2）DI 的实现前提

1. 依赖方（如 BookService）必须提供依赖属性（如 BookDao）的`setter`方法（或构造器）—— 容器通过这些方式注入。
2. 被依赖方（如 BookDao）必须被 IOC 容器管理（即配置为``）。

#### （3）IOC 与 DI 的关系

- IOC 是 “思想”：反转对象创建权。
- DI 是 “手段”：通过注入依赖，实现 IOC 的解耦目标。
- 一句话总结：**IOC 容器负责 “创建对象”，DI 负责 “绑定依赖”**，最终实现 “对象按需获取，依赖自动注入”。

## 二、入门案例深度拆解（⭐️ 实操必掌握）

### 1. IOC 入门案例（对象交给容器管理）

#### （1）核心目标

- 让 BookService 和 BookDao 由 Spring 容器创建，程序从容器中获取对象，而非手动`new`。

#### （2）步骤拆解（含底层逻辑）

##### 步骤 1：导入依赖（Maven）

xml

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.2.10.RELEASE</version> <!-- 稳定版本，适配JDK8 -->
</dependency>
```

- 核心依赖：`spring-context`包含 IOC 容器核心功能（BeanFactory、ApplicationContext）。

##### 步骤 2：编写业务代码（接口 + 实现类）

java

```java
// Dao接口（依赖抽象，而非具体实现，解耦关键）
public interface BookDao {
    void save();
}
// Dao实现类
public class BookDaoImpl implements BookDao {
    @Override
    public void save() {
        System.out.println("BookDaoImpl.save()：数据层保存图书");
    }
}
// Service接口
public interface BookService {
    void save();
}
// Service实现类（暂未依赖注入，先保留new，后续DI案例删除）
public class BookServiceImpl implements BookService {
    private BookDao bookDao = new BookDaoImpl(); // 后续要删除的硬编码
    @Override
    public void save() {
        System.out.println("BookServiceImpl.save()：业务层处理保存逻辑");
        bookDao.save();
    }
}
```

- 设计原则：依赖倒置（面向接口编程），后续替换 Dao 实现类无需修改 Service。

##### 步骤 3：Spring 配置文件（applicationContext.xml）

xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
                           http://www.springframework.org/schema/beans/spring-beans.xsd">
    <!-- 声明Bean：告诉容器要管理哪个类的对象 -->
    <bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl"/>
    <bean id="bookService" class="com.itheima.service.impl.BookServiceImpl"/>
</beans>
```

- 核心标签：

  ```
  <bean>
  ```

  - `id`：Bean 的唯一标识（容器内不可重复），后续通过 id 获取 Bean。
  - `class`：Bean 的**全类名**（必须是可实例化的类，不能是接口），容器通过反射创建对象。

- 底层逻辑：容器加载配置文件时，解析``标签，通过`Class.forName(class属性值)`获取 Class 对象，再调用无参构造器创建 Bean 实例，存入容器（注册表）。

##### 步骤 4：从容器获取 Bean 并调用

java

```java
public class App {
    public static void main(String[] args) {
        // 1. 加载Spring配置文件，初始化IOC容器
        ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
        // 2. 从容器获取Bean（两种方式）
        // 方式1：按id获取（需强转，常用）
        BookService bookService = (BookService) ctx.getBean("bookService");
        // 方式2：按类型获取（无需强转，但要求容器中该类型Bean唯一）
        // BookService bookService = ctx.getBean(BookService.class);
        // 3. 调用方法
        bookService.save();
    }
}
```

- 关键类：

  ```
  ApplicationContext
  ```

  （IOC 容器顶层接口）

  - 实现类：`ClassPathXmlApplicationContext`（加载类路径下的 XML 配置文件）。
  - 底层逻辑：`ctx.getBean()`从容器的注册表中根据 id / 类型查找 Bean 实例，直接返回（无需手动创建）。

#### （3）运行结果与核心结论

- 输出：`BookServiceImpl.save()：业务层处理保存逻辑 → BookDaoImpl.save()：数据层保存图书`。
- 结论：容器已成功创建 BookService 和 BookDao 实例，程序通过容器获取对象，初步实现解耦（但 Service 仍有`new BookDaoImpl()`硬编码，需 DI 解决）。

#### （4）常见错误排查（⭐️ 实操高频）

1. 错误：`ClassNotFoundException` → 原因：`class`属性的全类名写错（包名 / 类名错误）。
2. 错误：`NoSuchBeanDefinitionException` → 原因：`getBean()`的 id 不存在，或``标签未配置。
3. 错误：`InstantiationException` → 原因：Bean 类没有无参构造器（容器默认用无参构造创建对象）。

### 2. DI 入门案例（解决对象依赖）

#### （1）核心目标

- 删除 Service 中`new BookDaoImpl()`的硬编码，由容器自动将 BookDao 实例注入到 BookService 中。

#### （2）步骤拆解（核心是 “依赖绑定”）

##### 步骤 1：修改 Service 实现类（删除硬编码，提供 setter）

java

```java
public class BookServiceImpl implements BookService {
    // 1. 删除new BookDaoImpl()，只保留依赖属性
    private BookDao bookDao; 
    // 2. 提供setter方法（容器通过setter注入依赖）
    public void setBookDao(BookDao bookDao) {
        this.bookDao = bookDao;
    }
    @Override
    public void save() {
        System.out.println("BookServiceImpl.save()：业务层处理保存逻辑");
        bookDao.save(); // 此时bookDao由容器注入，非null
    }
}
```

- 关键：setter 方法必须符合 JavaBean 规范（`set+属性名首字母大写`），容器通过反射调用 setter 注入对象。

##### 步骤 2：修改配置文件（绑定依赖）

xml

```xml
<beans>
    <!-- 被依赖方：BookDao（必须先配置，容器按顺序加载） -->
    <bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl"/>
    <!-- 依赖方：BookService，通过<property>注入BookDao -->
    <bean id="bookService" class="com.itheima.service.impl.BookServiceImpl">
        <!-- property：配置依赖注入 -->
        <!-- name：Service中的依赖属性名（bookDao）→ 容器会调用setBookDao() -->
        <!-- ref：引用容器中已存在的Bean的id（bookDao）→ 指向被依赖的Bean -->
        <property name="bookDao" ref="bookDao"/>
    </bean>
</beans>
```

- 核心逻辑：
  1. 容器先创建`bookDao`实例（因为配置在前面）。
  2. 创建`bookService`实例后，发现``标签，解析`name`为`bookDao`，找到`setBookDao()`方法。
  3. 通过`ref="bookDao"`找到容器中的`bookDao`实例，调用`setBookDao(bookDao实例)`完成注入。

##### 步骤 3：运行程序（结果与 IOC 案例一致）

- 核心结论：Service 与 Dao 彻底解耦！若需替换 Dao 实现类（如`BookDaoMysqlImpl`），只需修改配置文件中`bookDao`的`class`属性，无需修改 Service 代码。

## 三、IOC 核心配置：Bean 的精细化管理（⭐️ 重点）

### 1. Bean 基础配置（XML 标签属性）

| 属性    | 作用                      | 重点说明                                                     |
| ------- | ------------------------- | ------------------------------------------------------------ |
| `id`    | Bean 的唯一标识           | 1. 不可重复；2. 命名规范：小写字母开头，驼峰命名（如`bookService`）；3. 容器通过 id 获取 Bean |
| `class` | Bean 的全类名             | 1. 必须是可实例化的类（不能是接口）；2. 需包含完整包名（如`com.itheima.dao.impl.BookDaoImpl`） |
| `name`  | Bean 的别名               | 1. 可多个别名，用逗号 / 分号 / 空格分隔（如`name="dao bookDaoImpl"`）；2. 与`id`功能一致，可通过别名获取 Bean |
| `scope` | Bean 的作用范围（⭐️ 高频） | 1. 默认`singleton`（单例）；2. 可选`prototype`（多例）；3. 其他值（`request`/`session`等）仅 Web 环境可用 |

#### （1）scope：单例 vs 多例（底层差异 + 适用场景）

| 类型        | 核心特点                                    | 底层实现                                   | 适用场景                              |
| ----------- | ------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| `singleton` | 容器中仅 1 个 Bean 实例，每次获取都是同一个 | 容器初始化时（加载配置文件）创建 Bean 实例 | Service、Dao、工具类（无状态对象）    |
| `prototype` | 每次`getBean()`都创建新实例                 | 获取 Bean 时才创建实例                     | 实体类、域对象（有状态对象，如 User） |

- 验证单例 / 多例：

java

运行

```java
// 测试代码
ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
BookDao dao1 = (BookDao) ctx.getBean("bookDao");
BookDao dao2 = (BookDao) ctx.getBean("bookDao");
System.out.println(dao1 == dao2); // singleton→true，prototype→false
```

### 2. Bean 实例化方式（容器创建 Bean 的 3 种底层逻辑）

#### （1）构造方法实例化（⭐️ 最常用）

- 底层原理：容器通过**反射调用 Bean 类的无参构造器**创建实例。
- 关键要求：
  1. 若类中没有重写构造器，JVM 默认提供无参构造器（可用）。
  2. 若重写了有参构造器，必须手动添加无参构造器（否则容器创建失败）。
- 示例：

java

运行

```java
public class BookDaoImpl implements BookDao {
    // 必须保留无参构造器（即使空实现）
    public BookDaoImpl() {} 
    // 重写有参构造器时，无参构造器不会自动生成
    public BookDaoImpl(String name) {}
    @Override
    public void save() {}
}
```

- 错误场景：若删除无参构造器，运行报错`NoSuchMethodException: com.itheima.dao.impl.BookDaoImpl.()`（无默认构造器）。

#### （2）静态工厂实例化（了解，兼容老系统）

- 适用场景：Bean 的创建逻辑复杂（如需要初始化资源、校验参数），且通过静态工厂方法创建。
- 步骤：
  1. 编写静态工厂类，提供静态方法创建 Bean 实例。
  2. 配置文件中，`class`指向工厂类，`factory-method`指向静态方法。
- 示例：

java

```java
// 静态工厂类
public class BookDaoFactory {
    // 静态方法：创建BookDao实例（可添加复杂逻辑）
    public static BookDao getBookDao() {
        System.out.println("静态工厂初始化资源...");
        return new BookDaoImpl();
    }
}
```

xml

```xml
<!-- 配置静态工厂实例化Bean -->
<bean id="bookDao" class="com.itheima.factory.BookDaoFactory" factory-method="getBookDao"/>
```

- 底层逻辑：容器调用`BookDaoFactory.getBookDao()`（静态方法）获取 Bean 实例。

#### （3）FactoryBean 实例化（⭐️ 实用，整合框架常用）

- 适用场景：Spring 整合 MyBatis、Redis 等框架时，需自定义 Bean 创建逻辑（如 MyBatis 的`SqlSessionFactory`）。
- 核心原理：实现`FactoryBean`接口，重写`getObject()`方法（返回真正的 Bean 实例）。
- 步骤：
  1. 编写 FactoryBean 实现类，重写 3 个方法。
  2. 配置文件中，`class`指向 FactoryBean 实现类（容器会自动调用`getObject()`创建 Bean）。
- 示例：

```java
// FactoryBean实现类（泛型T为要创建的Bean类型）
public class BookDaoFactoryBean implements FactoryBean<BookDao> {
    // 核心方法：返回真正的Bean实例（可添加复杂创建逻辑）
    @Override
    public BookDao getObject() throws Exception {
        System.out.println("FactoryBean初始化资源...");
        return new BookDaoImpl();
    }
    // 返回Bean的类型（容器用于按类型获取Bean）
    @Override
    public Class<?> getObjectType() {
        return BookDao.class;
    }
    // 是否单例（默认true，可重写改为多例）
    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

xml

```xml
<!-- 配置FactoryBean：class指向FactoryBean实现类 -->
<bean id="bookDao" class="com.itheima.factory.BookDaoFactoryBean"/>
```

- 关键细节：容器通过`getObject()`获取真正的`BookDao`实例，而非`BookDaoFactoryBean`本身（若需获取 FactoryBean 实例，需在 id 前加`&`：`ctx.getBean("&bookDao")`）。

### 3. Bean 生命周期（⭐️ 面试重点）

#### （1）生命周期完整流程（从创建到销毁）

plaintext

```plaintext
容器初始化 → 1.创建Bean实例（内存分配）→ 2.执行构造方法 → 3.属性注入（set操作）→ 4.执行初始化方法 → Bean可用 → 容器关闭 → 5.执行销毁方法 → Bean销毁
```

- 核心阶段：初始化（4）和销毁（5）是可自定义的扩展点。

#### （2）生命周期控制方式（两种）

##### 方式 1：配置文件（`init-method`+`destroy-method`）（简单易用）

java

```java
public class BookDaoImpl implements BookDao {
    // 初始化方法（自定义名称）：Bean创建后执行（如初始化连接池）
    public void init() {
        System.out.println("BookDaoImpl.init()：初始化资源");
    }
    // 销毁方法（自定义名称）：Bean销毁前执行（如关闭连接池）
    public void destroy() {
        System.out.println("BookDaoImpl.destroy()：释放资源");
    }
    @Override
    public void save() {}
}
```

xml

```xml
<!-- 配置初始化和销毁方法 -->
<bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl"
      init-method="init" destroy-method="destroy"/>
```

##### 方式 2：实现接口（`InitializingBean`+`DisposableBean`）（了解）

java

```java
public class BookDaoImpl implements BookDao, InitializingBean, DisposableBean {
    // 初始化方法（接口强制重写）：属性注入后执行
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("BookDaoImpl.afterPropertiesSet()：初始化资源");
    }
    // 销毁方法（接口强制重写）：Bean销毁前执行
    @Override
    public void destroy() throws Exception {
        System.out.println("BookDaoImpl.destroy()：释放资源");
    }
    @Override
    public void save() {}
}
```

- 注意：`afterPropertiesSet()`的执行时机晚于`setter`方法（属性注入后）。

#### （3）关闭容器（触发销毁方法）

- 问题：默认情况下，`main`方法执行完 JVM 直接退出，容器未关闭，销毁方法不执行。
- 解决方案：
  1. 用`ClassPathXmlApplicationContext`的`close()`方法（主动关闭）：

java

```java
ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
// 业务逻辑...
ctx.close(); // 主动关闭容器，触发销毁方法
```

1. 用`registerShutdownHook()`方法（JVM 退出前自动关闭）：

java

```java
ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
ctx.registerShutdownHook(); // JVM退出前自动关闭容器
// 业务逻辑...（无需手动close）
```

## 四、DI 核心配置：依赖注入的多种方式（⭐️ 实操重点）

### 1. 注入分类（按数据类型）

- 简单类型：基本类型（`int`/`boolean`等）+ `String`。
- 引用类型：其他 Bean（如 Service 依赖 Dao）。
- 集合类型：`数组`/`List`/`Set`/`Map`/`Properties`。

### 2. Setter 注入（⭐️ 推荐，灵活）

#### （1）引用类型注入（已讲，核心）

- 配置：``。

#### （2）简单类型注入

- 配置：``（容器自动类型转换）。
- 示例：

java

```java
public class BookDaoImpl implements BookDao {
    // 简单类型属性
    private String dbName; // 数据库名
    private int dbPort;    // 端口号
    // setter方法
    public void setDbName(String dbName) {
        this.dbName = dbName;
    }
    public void setDbPort(int dbPort) {
        this.dbPort = dbPort;
    }
    @Override
    public void save() {
        System.out.println("数据库连接：" + dbName + ":" + dbPort);
    }
}
```

xml

```xml
<bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl">
    <property name="dbName" value="mysql"/> <!-- String类型 -->
    <property name="dbPort" value="3306"/>  <!-- int类型（容器自动转换） -->
</bean>
```

- 注意：`value`属性直接写值（无需加引号，字符串也可省略），容器会根据属性类型自动转换（如`"3306"`→`int`）。

### 3. 构造器注入（⭐️ 严谨，强制依赖）

#### （1）适用场景

- 强制依赖：Bean 必须依赖某个属性才能创建（如数据库连接的 URL、用户名、密码）。
- 优势：通过构造器参数明确依赖，避免 Bean 创建后因缺少依赖而报错。

#### （2）引用类型 + 简单类型混合注入

java

```java
public class BookDaoImpl implements BookDao {
    private String dbName;
    private int dbPort;
    private UserDao userDao; // 引用类型
    // 构造器（含所有依赖属性）
    public BookDaoImpl(String dbName, int dbPort, UserDao userDao) {
        this.dbName = dbName;
        this.dbPort = dbPort;
        this.userDao = userDao;
    }
    @Override
    public void save() {
        System.out.println("数据库：" + dbName + ":" + dbPort);
        userDao.save();
    }
}
```

xml

```xml
<bean id="userDao" class="com.itheima.dao.impl.UserDaoImpl"/>
<bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl">
    <!-- 构造器参数注入：<constructor-arg> -->
    <!-- name：构造器参数名（推荐，清晰） -->
    <constructor-arg name="dbName" value="mysql"/>
    <constructor-arg name="dbPort" value="3306"/>
    <!-- ref：引用其他Bean -->
    <constructor-arg name="userDao" ref="userDao"/>
</bean>
```

#### （3）构造器参数匹配方式（优先级）

1. `name`（推荐）：按参数名匹配（如`name="dbName"`）—— 清晰，不易出错。

2. ```
   index
   ```

   ：按参数下标匹配（从 0 开始）—— 解决参数名变更问题。

   xml

   ```xml
   <constructor-arg index="0" value="mysql"/> <!-- 第一个参数（dbName） -->
   <constructor-arg index="1" value="3306"/>  <!-- 第二个参数（dbPort） -->
   <constructor-arg index="2" ref="userDao"/> <!-- 第三个参数（userDao） -->
   ```

   

3. ```
   type
   ```

   ：按参数类型匹配 —— 不推荐（若有多个同类型参数，匹配失败）。

   xml

   ```xml
   <constructor-arg type="java.lang.String" value="mysql"/>
   <constructor-arg type="int" value="3306"/>
   <constructor-arg type="com.itheima.dao.UserDao" ref="userDao"/>
   ```

   

### 4. 自动装配（⭐️ 简化配置，高频）

#### （1）核心思想

- 容器自动根据 “类型” 或 “名称” 匹配依赖，无需手动写``或``。
- 配置：给依赖方 Bean 添加`autowire`属性。

#### （2）自动装配方式（两种）

##### 方式 1：`autowire="byType"`（⭐️ 推荐）

- 逻辑：容器根据依赖属性的**类型**，在容器中查找同名类型的 Bean，找到后自动注入。
- 示例：

xml

```xml
<bean id="userDao" class="com.itheima.dao.impl.UserDaoImpl"/>
<!-- bookService依赖UserDao，按类型自动装配 -->
<bean id="bookService" class="com.itheima.service.impl.BookServiceImpl" autowire="byType"/>
```

- 要求：容器中该类型的 Bean**必须唯一**（否则报错`NoUniqueBeanDefinitionException`）。
- 优势：无需关心 Bean 的 id，配置简洁，适合大多数场景。

##### 方式 2：`autowire="byName"`（不推荐）

- 逻辑：容器根据依赖属性的**名称**（如`userDao`），在容器中查找 id = 属性名的 Bean，找到后自动注入。
- 示例：

xml

```xml
<!-- id必须等于依赖属性名（userDao） -->
<bean id="userDao" class="com.itheima.dao.impl.UserDaoImpl"/>
<bean id="bookService" class="com.itheima.service.impl.BookServiceImpl" autowire="byName"/>
```

- 缺点：属性名与 Bean 的 id 强耦合（若属性名变更，需同步修改 Bean 的 id），维护成本高。

#### （3）自动装配注意事项

1. 仅支持**引用类型**注入，不支持简单类型注入。
2. 优先级：手动注入（``/``）> 自动装配（`autowire`）—— 两者同时存在时，自动装配失效。

### 5. 集合类型注入（特殊场景）

#### （1）数组 / List（元素为简单类型）

java

```java
public class BookDaoImpl implements BookDao {
    private String[] authors; // 数组
    private List<String> tags; // List
    // setter方法（省略）
    @Override
    public void save() {
        System.out.println("数组：" + Arrays.toString(authors));
        System.out.println("List：" + tags);
    }
}
```

xml

```xml
<bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl">
    <!-- 数组注入 -->
    <property name="authors">
        <array>
            <value>鲁迅</value>
            <value>老舍</value>
        </array>
    </property>
    <!-- List注入（array和list可混用） -->
    <property name="tags">
        <list>
            <value>小说</value>
            <value>文学</value>
        </list>
    </property>
</bean>
```

#### （2）Set（元素为简单类型，自动去重）

xml

```xml
<property name="tags">
    <set>
        <value>小说</value>
        <value>小说</value> <!-- 自动去重，最终只保留一个 -->
    </set>
</property>
```

#### （3）Map（key-value 为简单类型）

java

运行

```java
private Map<String, String> config; // Map
```

xml

```xml
<property name="config">
    <map>
        <entry key="encoding" value="UTF-8"/>
        <entry key="timeout" value="3000"/>
    </map>
</property>
```

#### （4）Properties（key-value 均为 String）

java

运行

```java
private Properties props; // Properties
```

xml











```xml
<property name="props">
    <props>
        <prop key="username">root</prop>
        <prop key="password">123456</prop>
    </props>
</property>
```

#### （5）集合元素为引用类型（了解）

- 用``替代``：

xml

```xml
<property name="userDaos">
    <list>
        <ref bean="userDao1"/>
        <ref bean="userDao2"/>
    </list>
</property>
```

## 五、核心总结（⭐️ 必背）

### 1. 思想层面

- IOC：反转对象创建权（程序→容器），解耦对象创建与使用。
- DI：容器自动绑定 Bean 依赖，解耦 Bean 间的依赖关系。
- 最终目标：**高内聚、低耦合**。

### 2. 实操层面

| 核心功能      | 推荐配置方式                    | 重点注意事项                                     |
| ------------- | ------------------------------- | ------------------------------------------------ |
| Bean 声明     | ``                              | class 不能是接口，id 唯一                        |
| 引用类型注入  | Setter 注入（``）               | 必须提供 setter 方法                             |
| 简单类型注入  | Setter 注入（``）               | 容器自动类型转换                                 |
| 强制依赖注入  | 构造器注入（``）                | 适合必须的依赖属性                               |
| 简化依赖配置  | 自动装配（`autowire="byType"`） | 确保容器中该类型 Bean 唯一                       |
| Bean 作用范围 | 单例（默认`singleton`）         | Service、Dao 用单例，域对象用多例（`prototype`） |

### 3. 面试高频

- IOC/DI 的核心思想是什么？如何实现解耦？
- Bean 的实例化方式有哪些？默认是哪种？
- Bean 的生命周期？初始化和销毁方法的执行时机？
- 自动装配的方式有哪些？推荐哪种？为什么？
- 单例 Bean 的线程安全问题？如何解决？（无状态 Bean 无问题，有状态 Bean 用多例或 ThreadLocal）





### 1. 请详细说明 Spring 是如何解决 Bean 的循环依赖问题的？哪些场景下循环依赖无法被解决？

### 2. 对比 Spring 中 BeanFactory 和 ApplicationContext 的核心区别，以及它们的适用场景？

### 3. 请分析 @Autowired 和 @Resource 的注入逻辑、核心区别，以及实际开发中如何选择？

### 4. 单例 Bean 的线程安全问题本质是什么？Spring 提供了哪些间接解决方案？结合实际场景说明如何选型？

### 5. 简述 Spring IOC 容器初始化的完整流程（从加载配置到 Bean 可用），并说明关键步骤的底层实现原理？

### 答案

#### 1. 请详细说明 Spring 是如何解决 Bean 的循环依赖问题的？哪些场景下循环依赖无法被解决？

**答案**：

- **循环依赖定义**：两个或多个 Bean 互相依赖形成闭环（如 A 依赖 B，B 依赖 A；或 A→B→C→A）。

- Spring 解决机制

  ：仅针对「单例 Bean + setter 注入 / 自动装配」的场景，核心依赖「三级缓存」打破闭环，流程如下：

  1. 三级缓存定义

     ：

     - 一级缓存（singletonObjects）：存储完全初始化完成的单例 Bean（最终可用状态）。
     - 二级缓存（earlySingletonObjects）：存储「提前暴露的半成品 Bean」（已实例化，但未完成属性注入和初始化）。
     - 三级缓存（singletonFactories）：存储「Bean 工厂对象」（lambda 表达式），用于延迟生成半成品 Bean 的代理对象（若 Bean 需要 AOP 增强）。

  2. 核心流程（以 A 依赖 B、B 依赖 A 为例）

     ：

     - 1. 容器初始化 A：通过构造方法实例化 A（未注入属性、未初始化），将 A 的工厂对象存入三级缓存，移除二级缓存。
     - 1. 给 A 注入属性 B：容器发现 B 未创建，转而去初始化 B。
     - 1. 容器初始化 B：通过构造方法实例化 B，将 B 的工厂对象存入三级缓存，移除二级缓存。
     - 1. 给 B 注入属性 A：容器从三级缓存获取 A 的工厂对象，生成 A 的半成品 Bean（若 A 需要 AOP 则生成代理对象），存入二级缓存，移除三级缓存，将 A 的半成品注入 B。
     - 1. B 完成属性注入和初始化，存入一级缓存，移除二级 / 三级缓存。
     - 1. 容器将 B 的完整实例注入 A，A 完成初始化，存入一级缓存，移除二级 / 三级缓存。

- 无法解决的场景

  ：

  1. 多例 Bean（prototype）：Spring 不缓存多例 Bean，每次 getBean () 都会新建实例，循环依赖时会陷入无限递归创建，直接抛出 BeanCurrentlyInCreationException。
  2. 构造器注入：构造器注入是「实例化阶段依赖」，而三级缓存是在「实例化后暴露」，无法提前获取半成品 Bean，会抛出循环依赖异常。
  3. 单例 Bean + 构造器注入混合场景：只要存在构造器注入形成的闭环，无论是否搭配 setter 注入，均无法解决。

#### 2. 对比 Spring 中 BeanFactory 和 ApplicationContext 的核心区别，以及它们的适用场景？

**答案**：

BeanFactory 和 ApplicationContext 均是 Spring IOC 容器的核心接口，ApplicationContext 是 BeanFactory 的子接口，两者核心区别如下：

| 对比维度   | BeanFactory（基础容器）                                  | ApplicationContext（高级容器）                               |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| 核心定位   | 提供 Bean 的创建、获取、依赖管理的基础功能               | 继承 BeanFactory 所有功能，新增企业级特性（事件、资源加载、国际化等） |
| 初始化时机 | 懒加载：getBean () 时才实例化 Bean（单例 Bean）          | 预加载：容器初始化（加载配置）时，主动实例化所有单例 Bean    |
| 功能扩展   | 仅基础功能，无额外扩展                                   | 1. 资源加载（ResourceLoader）：支持加载类路径、文件系统资源；2. 事件机制（ApplicationEventPublisher）：支持 Bean 间事件通信；3. 国际化（MessageSource）：支持多语言；4. 环境适配（EnvironmentCapable）：支持配置文件、环境变量读取 |
| 实现类     | DefaultListableBeanFactory（底层核心实现）               | ClassPathXmlApplicationContext、AnnotationConfigApplicationContext、FileSystemXmlApplicationContext |
| 异常抛出   | 实例化 Bean 时（getBean ()）才抛出配置错误（如依赖缺失） | 容器初始化时即抛出配置错误，提前暴露问题                     |

- 适用场景

  ：

  - BeanFactory：适用于资源受限场景（如嵌入式设备、移动端），或追求极致性能（懒加载减少启动开销）的场景，实际开发中极少直接使用。
  - ApplicationContext：适用于绝大多数企业级应用（Web 应用、微服务等），支持 Spring 的完整特性（AOP、事务、事件驱动等），是开发中的首选容器。

#### 3. 请分析 @Autowired 和 @Resource 的注入逻辑、核心区别，以及实际开发中如何选择？

**答案**：

- **@Autowired（Spring 注解）**：
  1. 注入逻辑：默认「按类型（byType）匹配」→ 若容器中该类型 Bean 不唯一，按「属性名（byName）匹配」→ 若仍不匹配，可通过 @Qualifier 指定 Bean 的 id 强制匹配。
  2. 依赖要求：默认要求依赖必须存在（required=true），若允许依赖为 null，需设置 required=false。
  3. 底层实现：由 Spring 的 AutowiredAnnotationBeanPostProcessor 处理器解析执行。
  4. 支持场景：支持 setter 注入、构造器注入、字段注入（成员变量直接注入）。
- **@Resource（JDK 注解，javax.annotation.Resource）**：
  1. 注入逻辑：默认「按名称（byName）匹配」（匹配属性名与 Bean 的 id/name）→ 若名称不匹配，按「类型（byType）匹配」→ 若仍不匹配，抛出异常。
  2. 依赖要求：默认要求依赖必须存在，无 required 属性（可通过 @Nullable 注解允许 null）。
  3. 底层实现：由 JDK 提供标准，Spring 对其进行兼容实现（通过 CommonAnnotationBeanPostProcessor 处理器）。
  4. 支持场景：支持 setter 注入、字段注入，不支持构造器注入。
- **核心区别**：
  1. 来源不同：@Autowired 是 Spring 专属注解，@Resource 是 JDK 标准注解（跨框架兼容，如 JEE、Spring）。
  2. 匹配优先级不同：@Autowired 默认 byType，@Resource 默认 byName。
  3. 功能差异：@Autowired 支持 @Qualifier 指定 Bean，支持 required 属性；@Resource 支持 name 属性直接指定 Bean 的 id/name。
  4. 注入场景：@Autowired 支持构造器注入，@Resource 不支持。
- **实际开发选择**：
  1. 若项目仅依赖 Spring 框架，优先使用 @Autowired + @Qualifier：匹配逻辑灵活，支持构造器注入（推荐构造器注入，强制依赖声明），且是 Spring 生态的原生支持。
  2. 若项目需跨框架兼容（如可能迁移到其他 JEE 框架），或追求 JDK 标准注解，使用 @Resource：减少对 Spring 的依赖，兼容性更强。
  3. 避免字段注入（直接在成员变量上加注解）：推荐 setter 注入或构造器注入，便于单元测试（可手动设置依赖）。

#### 4. 单例 Bean 的线程安全问题本质是什么？Spring 提供了哪些间接解决方案？结合实际场景说明如何选型？

**答案**：

- **线程安全问题本质**：单例 Bean 在 Spring 容器中仅存在一个实例，多线程并发访问时，若 Bean 包含「可修改的成员变量」（即有状态 Bean），会出现多线程对共享资源的竞争修改，导致数据不一致；若 Bean 是「无状态 Bean」（无成员变量或成员变量为常量 / 不可变对象），则无线程安全问题。

- **Spring 间接解决方案（核心思路：避免多线程共享可变状态）**：

  1. **设计无状态 Bean（推荐）**：将 Bean 设计为无状态（如 Service、Dao 层），业务逻辑依赖方法参数传递数据，不存储可变成员变量。这是从根源上解决线程安全问题的方式，Spring 默认推荐此设计。

  2. 使用 ThreadLocal 封装状态

     ：若 Bean 必须存储状态（如用户登录信息、请求上下文），将状态封装到 ThreadLocal 中。ThreadLocal 为每个线程提供独立的变量副本，实现线程隔离，避免共享竞争。

     - 示例：Spring 的 RequestContextHolder（存储 HttpServletRequest）、TransactionSynchronizationManager（存储事务上下文）均基于 ThreadLocal 实现。

  3. **改为多例 Bean（scope="prototype"）**：每次 getBean () 创建新实例，多线程各自持有独立实例，无共享状态。但多例 Bean 会增加对象创建和销毁的开销，且 Spring 不管理多例 Bean 的生命周期（创建后交给开发者管理）。

  4. **使用同步机制（不推荐）**：在 Bean 的方法上添加 synchronized 关键字，或使用 Lock 锁，强制多线程串行执行。会导致性能大幅下降，仅适用于并发量极低的场景。

- **实际场景选型**：

  - 绝大多数场景（Service、Dao、工具类）：采用「无状态 Bean 设计」，无需额外处理线程安全。
  - 需存储线程专属状态（如请求上下文、用户会话）：采用「ThreadLocal」，兼顾性能和线程安全。
  - 少数有状态且并发量低的场景（如自定义工具类含可变配置）：可采用「多例 Bean」，但需注意内存开销。
  - 禁止使用同步机制（synchronized/Lock）：除非是极端特殊场景，否则会严重影响系统并发能力。

#### 5. 简述 Spring IOC 容器初始化的完整流程（从加载配置到 Bean 可用），并说明关键步骤的底层实现原理？

**答案**：

Spring IOC 容器（以 ApplicationContext 为例）的初始化流程可分为 5 个核心阶段，底层基于反射、XML 解析（或注解解析）、工厂模式实现：

1. **配置资源加载阶段**：
   - 核心操作：容器根据配置类型（XML / 注解）加载配置资源（如 applicationContext.xml、@Configuration 注解类）。
   - 底层原理：
     - XML 配置：通过 ResourceLoader 加载类路径 / 文件系统中的 XML 文件，转换为 Resource 对象（封装配置文件的输入流、路径等信息）。
     - 注解配置：扫描指定包路径（如 @ComponentScan），通过 ClassPathBeanDefinitionScanner 扫描带有 @Component、@Service 等注解的类。
2. **BeanDefinition 注册阶段**：
   - 核心操作：解析配置资源，将每个 Bean 的定义信息（类名、属性、依赖、作用域等）封装为 BeanDefinition 对象，注册到 BeanDefinitionRegistry（注册表）中。
   - 底层原理：
     - XML 解析：通过 BeanDefinitionDocumentReader 解析<bean>标签，提取 id、class、property 等属性，构建 BeanDefinition。
     - 注解解析：扫描到注解类后，通过 AnnotatedBeanDefinitionReader 解析注解信息（如 @Scope、@Autowired），构建 BeanDefinition。
   - 关键：此时仅注册 Bean 的「定义信息」，未实例化 Bean。
3. **BeanFactory 初始化阶段**：
   - 核心操作：初始化 BeanFactory（如 DefaultListableBeanFactory），将 BeanDefinitionRegistry 中的 BeanDefinition 加载到 BeanFactory，同时初始化 BeanFactory 的核心组件（如 BeanDefinitionResolver、BeanPostProcessor）。
   - 底层原理：BeanFactory 是容器的核心，负责 Bean 的实例化、依赖注入、生命周期管理，ApplicationContext 本质是对 BeanFactory 的包装，新增了企业级特性。
4. **Bean 实例化与依赖注入阶段**：
   - 核心操作：BeanFactory 根据 BeanDefinition 实例化 Bean（单例 Bean 预加载，多例 Bean 延迟加载），并完成依赖注入。
   - 底层原理：
     - 实例化：通过反射调用 Bean 的构造方法（默认无参构造），创建 Bean 实例（若为 FactoryBean，则调用 getObject () 获取真正实例）。
     - 依赖注入：通过 BeanWrapper（封装 Bean 实例）解析依赖，若为 setter 注入则调用 setter 方法，若为构造器注入则通过构造方法参数注入，依赖对象从 BeanFactory 中获取。
5. **Bean 初始化阶段**：
   - 核心操作：执行 Bean 的初始化逻辑，最终生成可用的 Bean 实例。
   - 底层流程：
     1. 调用 Bean 的 Aware 接口方法（如 BeanNameAware、ApplicationContextAware），注入 Bean 名称、容器等信息。
     2. 调用 BeanPostProcessor 的前置处理方法（postProcessBeforeInitialization）。
     3. 执行自定义初始化方法（init-method 或 afterPropertiesSet ()）。
     4. 调用 BeanPostProcessor 的后置处理方法（postProcessAfterInitialization）（AOP 动态代理在此阶段生成代理对象）。
   - 最终：单例 Bean 存入一级缓存（singletonObjects），供后续获取。

总结：容器初始化的核心是「先解析配置注册 Bean 定义，再实例化注入依赖，最后初始化完成 Bean」，底层依赖反射实现对象创建和方法调用，通过注册表和缓存管理 Bean 的生命周期。

编辑分享