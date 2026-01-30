# 📚 SSM Day24 - Spring IOC 与 DI

> 💡 **解耦是核心目标，IOC 容器是核心工具。** 本文深入解析 Spring IOC（控制反转）与 DI（依赖注入）的核心思想、底层原理与实战技巧，帮你掌握企业级开发的核心基石。

---

## 🎯 快速回顾

- **🔄 IOC（控制反转）**：将对象创建权交给容器，实现解耦
- **💉 DI（依赖注入）**：容器自动注入依赖，实现对象间的松耦合
- **🏭 Bean 管理**：通过 XML 或注解配置 Bean，容器负责创建和管理
- **🔧 三种实例化方式**：构造方法、静态工厂、FactoryBean
- **🔄 生命周期**：初始化 → 使用 → 销毁，可自定义回调方法
- **📦 依赖注入方式**：Setter 注入、构造器注入、自动装配

---

## 📑 目录

- [一、核心思想：IOC 与 DI](#一核心思想ioc-与-di)
  - [1. 为什么需要 IOC/DI](#1-为什么需要-iocdi)
  - [2. 深度理解 IOC](#2-深度理解-ioc)
  - [3. 深度理解 DI](#3-深度理解-di)
- [二、入门案例深度拆解](#二入门案例深度拆解)
  - [1. IOC 入门案例](#1-ioc-入门案例)
  - [2. DI 入门案例](#2-di-入门案例)
- [三、IOC 核心配置：Bean 的精细化管理](#三ioc-核心配置bean-的精细化管理)
  - [1. Bean 基础配置](#1-bean-基础配置)
  - [2. Bean 实例化方式](#2-bean-实例化方式)
  - [3. Bean 生命周期](#3-bean-生命周期)
- [四、DI 核心配置：依赖注入的多种方式](#四di-核心配置依赖注入的多种方式)
  - [1. 注入分类](#1-注入分类)
  - [2. Setter 注入](#2-setter-注入)
  - [3. 构造器注入](#3-构造器注入)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、核心思想：IOC 与 DI

#### 1. 为什么需要 IOC/DI？

传统开发痛点：

```java
// 传统业务层代码：硬编码依赖，耦合度极高
public class BookServiceImpl implements BookService {
    // 问题1：直接new Dao，业务层与Dao层强绑定
    private BookDao bookDao = new BookDaoImpl();
    // 问题2：若Dao实现类变更（如BookDaoMysqlImpl），必须修改业务层代码，重新编译部署
}
```

- **耦合度高的后果**：维护成本高、扩展性差、测试困难
- **Spring 解决方案**：将对象创建权交给容器，依赖关系由容器自动绑定 —— 即 IOC+DI

#### 2. 深度理解 IOC（控制反转）

**（1）"反转" 的到底是什么？**

- **传统开发**：程序（开发者）主动控制对象创建（`new`）和依赖管理
- **Spring 开发**：容器（Spring IOC 容器）被动接收配置，主动创建对象、管理对象生命周期 —— 反转 "对象创建权" 和 "依赖管理权"

**（2）IOC 容器的本质**

不是 new 出来的普通对象，而是一个 **工厂 + 注册表 + 依赖解析器**：

1. **工厂**：根据配置创建 Bean 对象（反射实现）
2. **注册表**：存储所有管理的 Bean（key=id/name，value=Bean 实例）
3. **依赖解析器**：分析 Bean 间依赖，自动完成注入

**（3）核心价值**

- **解耦**：业务层与数据层分离，无需关心依赖对象的创建细节
- **可复用**：Bean 由容器统一管理，多模块可共享
- **可维护**：对象创建、依赖变更只需修改配置，无需改代码

#### 3. 深度理解 DI（依赖注入）

**（1）定义：依赖注入是 IOC 的具体实现**

- 容器在创建 Bean 时，自动将其依赖的其他 Bean（或简单数据）注入到属性中，无需开发者手动`set`或`new`
- **依赖**：若 A 对象需要调用 B 对象的方法，则 A 依赖 B（如 BookService 依赖 BookDao）
- **注入**：容器将 B 对象 "塞" 到 A 对象的属性中，让 A 对象直接使用

**（2）DI 的实现前提**

1. 依赖方（如 BookService）必须提供依赖属性（如 BookDao）的`setter`方法（或构造器）—— 容器通过这些方式注入
2. 被依赖方（如 BookDao）必须被 IOC 容器管理（即配置为`<bean>`）

**（3）IOC 与 DI 的关系**

- **IOC 是 "思想"**：反转对象创建权
- **DI 是 "手段"**：通过注入依赖，实现 IOC 的解耦目标
- 一句话总结：**IOC 容器负责 "创建对象"，DI 负责 "绑定依赖"**，最终实现 "对象按需获取，依赖自动注入"

---

### 二、入门案例深度拆解

#### 1. IOC 入门案例（对象交给容器管理）

**（1）核心目标**

让 BookService 和 BookDao 由 Spring 容器创建，程序从容器中获取对象，而非手动`new`。

**（2）步骤拆解（含底层逻辑）**

**步骤 1：导入依赖（Maven）**

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.2.10.RELEASE</version> <!-- 稳定版本，适配JDK8 -->
</dependency>
```

- **核心依赖**：`spring-context`包含 IOC 容器核心功能（BeanFactory、ApplicationContext）

**步骤 2：编写业务代码（接口 + 实现类）**

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

- **设计原则**：依赖倒置（面向接口编程），后续替换 Dao 实现类无需修改 Service

**步骤 3：Spring 配置文件（applicationContext.xml）**

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

- **核心标签**：`<bean>`
  - `id`：Bean 的唯一标识（容器内不可重复），后续通过 id 获取 Bean
  - `class`：Bean 的**全类名**（必须是可实例化的类，不能是接口），容器通过反射创建对象
- **底层逻辑**：容器加载配置文件时，解析`<bean>`标签，通过`Class.forName(class属性值)`获取 Class 对象，再调用无参构造器创建 Bean 实例，存入容器（注册表）

**步骤 4：从容器获取 Bean 并调用**

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

- **关键类**：`ApplicationContext`（IOC 容器顶层接口）
  - 实现类：`ClassPathXmlApplicationContext`（加载类路径下的 XML 配置文件）
  - 底层逻辑：`ctx.getBean()`从容器的注册表中根据 id / 类型查找 Bean 实例，直接返回（无需手动创建）

**（3）运行结果与核心结论**

- **输出**：`BookServiceImpl.save()：业务层处理保存逻辑 → BookDaoImpl.save()：数据层保存图书`
- **结论**：容器已成功创建 BookService 和 BookDao 实例，程序通过容器获取对象，初步实现解耦（但 Service 仍有`new BookDaoImpl()`硬编码，需 DI 解决）

**（4）常见错误排查**

| 错误 | 原因 |
|------|------|
| `ClassNotFoundException` | `class`属性的全类名写错（包名 / 类名错误） |
| `NoSuchBeanDefinitionException` | `getBean()`的 id 不存在，或`<bean>`标签未配置 |
| `InstantiationException` | Bean 类没有无参构造器（容器默认用无参构造创建对象） |

#### 2. DI 入门案例（解决对象依赖）

**（1）核心目标**

删除 Service 中`new BookDaoImpl()`的硬编码，由容器自动将 BookDao 实例注入到 BookService 中。

**（2）步骤拆解（核心是 "依赖绑定"）**

**步骤 1：修改 Service 实现类（删除硬编码，提供 setter）**

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

- **关键**：setter 方法必须符合 JavaBean 规范（`set+属性名首字母大写`），容器通过反射调用 setter 注入对象

**步骤 2：修改配置文件（绑定依赖）**

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

- **核心逻辑**：
  1. 容器先创建`bookDao`实例（因为配置在前面）
  2. 创建`bookService`实例后，发现`<property>`标签，解析`name`为`bookDao`，找到`setBookDao()`方法
  3. 通过`ref="bookDao"`找到容器中的`bookDao`实例，调用`setBookDao(bookDao实例)`完成注入

**步骤 3：运行程序（结果与 IOC 案例一致）**

- **核心结论**：Service 与 Dao 彻底解耦！若需替换 Dao 实现类（如`BookDaoMysqlImpl`），只需修改配置文件中`bookDao`的`class`属性，无需修改 Service 代码

---

### 三、IOC 核心配置：Bean 的精细化管理

#### 1. Bean 基础配置（XML 标签属性）

| 属性 | 作用 | 重点说明 |
|------|------|----------|
| `id` | Bean 的唯一标识 | 1. 不可重复；2. 命名规范：小写字母开头，驼峰命名（如`bookService`）；3. 容器通过 id 获取 Bean |
| `class` | Bean 的全类名 | 1. 必须是可实例化的类（不能是接口）；2. 需包含完整包名（如`com.itheima.dao.impl.BookDaoImpl`） |
| `name` | Bean 的别名 | 1. 可多个别名，用逗号 / 分号 / 空格分隔（如`name="dao bookDaoImpl"`）；2. 与`id`功能一致，可通过别名获取 Bean |
| `scope` | Bean 的作用范围 | 1. 默认`singleton`（单例）；2. 可选`prototype`（多例）；3. 其他值（`request`/`session`等）仅 Web 环境可用 |

**（1）scope：单例 vs 多例（底层差异 + 适用场景）**

| 类型 | 核心特点 | 底层实现 | 适用场景 |
|------|----------|----------|----------|
| `singleton` | 容器中仅 1 个 Bean 实例，每次获取都是同一个 | 容器初始化时（加载配置文件）创建 Bean 实例 | Service、Dao、工具类（无状态对象） |
| `prototype` | 每次`getBean()`都创建新实例 | 获取 Bean 时才创建实例 | 实体类、域对象（有状态对象，如 User） |

- **验证单例 / 多例**：

```java
// 测试代码
ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
BookDao dao1 = (BookDao) ctx.getBean("bookDao");
BookDao dao2 = (BookDao) ctx.getBean("bookDao");
System.out.println(dao1 == dao2); // singleton→true，prototype→false
```

#### 2. Bean 实例化方式（容器创建 Bean 的 3 种底层逻辑）

**（1）构造方法实例化（⭐️ 最常用）**

- **底层原理**：容器通过**反射调用 Bean 类的无参构造器**创建实例
- **关键要求**：
  1. 若类中没有重写构造器，JVM 默认提供无参构造器（可用）
  2. 若重写了有参构造器，必须手动添加无参构造器（否则容器创建失败）
- **示例**：

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

- **错误场景**：若删除无参构造器，运行报错`NoSuchMethodException: com.itheima.dao.impl.BookDaoImpl.()`（无默认构造器）

**（2）静态工厂实例化（了解，兼容老系统）**

- **适用场景**：Bean 的创建逻辑复杂（如需要初始化资源、校验参数），且通过静态工厂方法创建
- **步骤**：
  1. 编写静态工厂类，提供静态方法创建 Bean 实例
  2. 配置文件中，`class`指向工厂类，`factory-method`指向静态方法
- **示例**：

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

```xml
<!-- 配置静态工厂实例化Bean -->
<bean id="bookDao" class="com.itheima.factory.BookDaoFactory" factory-method="getBookDao"/>
```

- **底层逻辑**：容器调用`BookDaoFactory.getBookDao()`（静态方法）获取 Bean 实例

**（3）FactoryBean 实例化（⭐️ 实用，整合框架常用）**

- **适用场景**：Spring 整合 MyBatis、Redis 等框架时，需自定义 Bean 创建逻辑（如 MyBatis 的`SqlSessionFactory`）
- **核心原理**：实现`FactoryBean`接口，重写`getObject()`方法（返回真正的 Bean 实例）
- **步骤**：
  1. 编写 FactoryBean 实现类，重写 3 个方法
  2. 配置文件中，`class`指向 FactoryBean 实现类（容器会自动调用`getObject()`创建 Bean）
- **示例**：

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

```xml
<!-- 配置FactoryBean：class指向FactoryBean实现类 -->
<bean id="bookDao" class="com.itheima.factory.BookDaoFactoryBean"/>
```

- **关键细节**：容器通过`getObject()`获取真正的`BookDao`实例，而非`BookDaoFactoryBean`本身（若需获取 FactoryBean 实例，需在 id 前加`&`：`ctx.getBean("&bookDao")`）

#### 3. Bean 生命周期（⭐️ 面试重点）

**（1）生命周期完整流程（从创建到销毁）**

```
容器初始化 → 1.创建Bean实例（内存分配）→ 2.执行构造方法 → 3.属性注入（set操作）→ 4.执行初始化方法 → Bean可用 → 容器关闭 → 5.执行销毁方法 → Bean销毁
```

- **核心阶段**：初始化（4）和销毁（5）是可自定义的扩展点

**（2）生命周期控制方式（两种）**

**方式 1：配置文件（`init-method`+`destroy-method`）（简单易用）**

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

```xml
<!-- 配置初始化和销毁方法 -->
<bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl"
      init-method="init" destroy-method="destroy"/>
```

**方式 2：实现接口（`InitializingBean`+`DisposableBean`）（了解）**

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

- **注意**：`afterPropertiesSet()`的执行时机晚于`setter`方法（属性注入后）

**（3）关闭容器（触发销毁方法）**

- **问题**：默认情况下，`main`方法执行完 JVM 直接退出，容器未关闭，销毁方法不执行
- **解决方案**：
  1. 用`ClassPathXmlApplicationContext`的`close()`方法（主动关闭）：

```java
ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
// 业务逻辑...
ctx.close(); // 主动关闭容器，触发销毁方法
```

  2. 用`registerShutdownHook()`方法（JVM 退出前自动关闭）：

```java
ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
ctx.registerShutdownHook(); // JVM退出前自动关闭容器
// 业务逻辑...（无需手动close）
```

---

### 四、DI 核心配置：依赖注入的多种方式

#### 1. 注入分类（按数据类型）

- **简单类型**：基本类型（`int`/`boolean`等）+ `String`
- **引用类型**：其他 Bean（如 Service 依赖 Dao）
- **集合类型**：`数组`/`List`/`Set`/`Map`/`Properties`

#### 2. Setter 注入（⭐️ 推荐，灵活）

**（1）引用类型注入（已讲，核心）**

- **配置**：`<property name="属性名" ref="Bean的id"/>`

**（2）简单类型注入**

- **配置**：`<property name="属性名" value="值"/>`（容器自动类型转换）
- **示例**：

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

```xml
<bean id="bookDao" class="com.itheima.dao.impl.BookDaoImpl">
    <property name="dbName" value="mysql"/> <!-- String类型 -->
    <property name="dbPort" value="3306"/>  <!-- int类型（容器自动转换） -->
</bean>
```

- **注意**：`value`属性直接写值（无需加引号，字符串也可省略），容器会根据属性类型自动转换（如`"3306"`→`int`）

#### 3. 构造器注入（⭐️ 严谨，强制依赖）

**（1）适用场景**

- **强制依赖**：Bean 必须依赖某个属性才能创建（如数据库连接的 URL、用户名、密码）
- **优势**：通过构造器参数明确依赖，避免 Bean 创建后因缺少依赖而报错

**（2）引用类型 + 简单类型混合注入**

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

**（3）构造器参数匹配方式（优先级）**

1. **`name`（推荐）**：按参数名匹配（如`name="dbName"`）—— 清晰，不易出错
2. **`index`**：按参数索引匹配（如`index="0"`匹配第一个参数）—— 不推荐，参数顺序变更会出错
3. **`type`**：按参数类型匹配（如`type="java.lang.String"`）—— 不推荐，同类型多个参数会混淆

---

## ❓ 问答

### Q1：IOC 和 DI 有什么区别？

**A**：IOC（控制反转）是一种思想，DI（依赖注入）是 IOC 的具体实现方式。IOC 强调将对象创建权交给容器，DI 强调容器如何自动注入依赖。简单说：IOC 是 "做什么"，DI 是 "怎么做"。

### Q2：Bean 的 scope 有哪些值？默认是什么？

**A**：Bean 的 scope 有：
- `singleton`（默认）：单例，容器中只有一个实例
- `prototype`：多例，每次 getBean() 创建新实例
- `request`：Web 环境，每个请求创建一个实例
- `session`：Web 环境，每个会话创建一个实例

### Q3：构造器注入和 Setter 注入如何选择？

**A**：
- **构造器注入**：适用于强制依赖（如数据库连接），确保 Bean 创建时依赖已就绪
- **Setter 注入**：适用于可选依赖，更灵活，支持循环依赖

### Q4：FactoryBean 和普通 Bean 有什么区别？

**A**：FactoryBean 是一种特殊的 Bean，用于创建其他 Bean。容器调用 FactoryBean 的 `getObject()` 方法获取真正的 Bean 实例。Spring 整合 MyBatis、Redis 等框架时常用 FactoryBean。

### Q5：如何触发 Bean 的销毁方法？

**A**：需要主动关闭容器：
1. 调用 `ClassPathXmlApplicationContext.close()` 方法
2. 调用 `ctx.registerShutdownHook()` 方法（JVM 退出前自动关闭）

---

## 💡 学习建议

1. **理解核心思想**：重点理解 IOC 和 DI 的设计思想，而非死记硬背配置
2. **动手实践**：通过编写案例加深理解，特别是 Bean 的生命周期和依赖注入
3. **对比学习**：对比 XML 配置和注解开发的差异，理解各自的适用场景
4. **关注底层**：了解 Spring 容器的底层实现（反射、工厂模式），为后续学习 AOP、事务打下基础
5. **面试准备**：重点掌握 Bean 生命周期、scope、依赖注入方式等面试高频点

---

> **🎯 下一步学习**：Day25 将深入讲解 Spring 注解开发，包括 `@Component`、`@Autowired`、`@Value` 等核心注解的使用与原理。
