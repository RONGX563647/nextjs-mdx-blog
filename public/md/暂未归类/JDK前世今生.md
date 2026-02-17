## 从“Oak”到“虚拟线程”：JDK 1.0到25演进全记录与核心知识点详解

### 引言

如果你是Java开发者，一定听过“一次编写，到处运行”这句口号。但你可能不知道，从1996年第一个正式版本到今天，Java已经走过了近三十年的演进历程。这期间，它经历了互联网泡沫、.NET的挑战、Oracle收购、模块化转型，以及云原生时代的重生。

JDK的每个版本都承载着那个时代的印记：1.2让Java真正走向企业级，5.0带来了语法革命，8开启了函数式编程，11完成了模块化瘦身，21则用虚拟线程重构了并发编程模型。

今天，我们顺着时间线，看看JDK从1.0到25是如何一步步演变成今天这个样子的。每个版本的核心特性、设计思想、实用知识点，以及当年开发者踩过的坑，我都会一一梳理清楚。


## 第一章：JDK 1.0到1.4 —— 从诞生到企业级奠基（1996-2002）

### 1.1 JDK 1.0（1996）：Oak的诞生，Java的起点

**历史背景**：Java最初由Sun公司的“Green”项目组开发，用于智能家电设备，最初名为Oak。因商标被占用，1995年更名为“Java”——灵感来自开发人员常去的一家名叫“Java Coffee”的咖啡店。

**1996年1月23日**，JDK 1.0正式发布。这是一个纯解释运行的版本，使用外挂JIT，性能比较差。

**核心特性**：
- **Java语言本身**：类、接口、异常处理等基础语法
- **基础类库**：java.lang、java.io、java.util等
- **Applet支持**：能在浏览器中运行的小程序，当时最吸引人的特性
- **AWT**：Abstract Window Toolkit，图形用户界面工具包

**实用知识点**：Applet在当时被誉为“Web的未来”，但后来因为安全性问题和Flash的崛起逐渐衰落。如果你维护过2000年左右的老系统，可能还会看到Applet代码。

### 1.2 JDK 1.1（1997）：内部类与JDBC

**1997年2月**，JDK 1.1发布。

**核心特性**：
- **内部类**：可以在类内部定义类，为事件处理等场景提供便利
- **JavaBeans**：可重用的组件模型
- **JDBC**：Java Database Connectivity，数据库连接API，让Java可以操作关系数据库
- **RMI**：Remote Method Invocation，远程方法调用，支持分布式计算
- **反射API**：可以在运行时获取类的信息、调用方法

**实用知识点**：内部类直到今天仍是常用特性，尤其在事件监听和集合操作中。但要注意，内部类会持有外部类的引用，容易引发内存泄漏。

### 1.3 JDK 1.2（1998）：Java 2时代，集合框架诞生

**1998年12月8日**，JDK 1.2发布，Sun将其更名为**Java 2**，并分为三个平台：J2SE（标准版）、J2EE（企业版）、J2ME（微型版）。

**核心特性**：
- **集合框架**：List、Set、Map等接口和实现类，取代了之前的Vector、Hashtable
- **JIT编译器**：即时编译，大幅提升性能
- **Swing**：轻量级GUI组件库，比AWT更丰富、更美观
- **Java2D**：二维图形API
- **数字签名**：对打包的Java文件进行数字签名
- **Java插件**：浏览器中运行Applet的插件

**虚拟机并存**：这个阶段并存过三个虚拟机——Classic VM、Exact VM和HotSpot VM。HotSpot于1999年4月诞生，后来成为主流。

**实用知识点**：集合框架是1.2最重要的贡献，它统一了Java的数据结构API。直到今天，我们每天都在用ArrayList、HashMap。

### 1.4 JDK 1.3（2000）：性能优化与HotSpot普及

**2000年5月8日**，JDK 1.3发布。

**核心特性**：
- **HotSpot VM成为默认**：提供更优的性能和内存管理
- **Java Sound API**：音频处理
- **JNDI**：Java Naming and Directory Interface，命名和目录服务访问
- **jar文件索引**：优化类加载性能

**历史背景**：当时Sun正面临来自Microsoft的严峻挑战，后者推出了.NET框架试图颠覆Java的地位。Sun决定加快Java的开发速度以增强竞争力。

### 1.5 JDK 1.4（2002）：第一个LTS，NIO与断言

**2002年2月13日**，JDK 1.4发布。这是Java SE中功能最全面的版本之一，也是第一个获得长期支持（LTS）的版本。

**核心特性**：
- **NIO**：New I/O，非阻塞I/O API，为高性能网络编程奠基
- **断言**：assert关键字，用于调试
- **正则表达式**：java.util.regex包
- **日志API**：java.util.logging
- **XML处理**：内置SAX和DOM解析器
- **链式异常**：异常可以包装另一个异常
- **IPV6支持**

**实用知识点**：NIO的出现让Java真正具备了开发高性能网络服务器的能力。后来的Netty、Tomcat NIO组件都基于此。

| 版本 | 年份 | 核心主题 | 代表特性 |
|------|------|---------|---------|
| 1.0 | 1996 | 诞生 | Applet、AWT、基础类库 |
| 1.1 | 1997 | 数据库连接 | 内部类、JDBC、RMI、反射 |
| 1.2 | 1998 | Java 2时代 | 集合框架、Swing、JIT |
| 1.3 | 2000 | 性能优化 | HotSpot VM、Java Sound |
| 1.4 | 2002 | 企业级能力 | NIO、正则、断言、日志 |


## 第二章：JDK 5和6 —— 语法革命与生态繁荣（2004-2006）

### 2.1 JDK 5（2004）：史上最大语法更新

**2004年9月30日**，JDK 5发布。这是继1.0之后最重大的版本更新，Sun放弃了“JDK 1.x”的命名方式，直接称为JDK 5。

**为什么改名？** Sun想传达Java平台快速迭代的理念，避免版本号混淆。

**核心特性**：

| 特性 | 作用 | 示例 |
|------|------|------|
| **泛型** | 类型安全的集合 | `List<String> list = new ArrayList<String>();` |
| **增强for循环** | 简化遍历 | `for (String s : list) { ... }` |
| **自动装箱/拆箱** | 基本类型与包装类自动转换 | `Integer i = 100;` |
| **枚举** | 类型安全的常量 | `enum Color { RED, GREEN, BLUE }` |
| **可变参数** | 方法接收任意数量参数 | `void print(String... args)` |
| **静态导入** | 直接使用静态成员 | `import static java.lang.Math.*;` |
| **注解** | 元数据支持 | `@Override`、`@Deprecated` |
| **并发包** | java.util.concurrent | 线程池、锁、并发集合 |

**代码对比**：

```java
// JDK 1.4风格
List list = new ArrayList();
list.add("hello");
String s = (String) list.get(0);

// JDK 5风格
List<String> list = new ArrayList<String>();
list.add("hello");
String s = list.get(0);  // 无需强制转型
```

**实用知识点**：泛型的本质是类型擦除，运行时List<String>和List<Integer>是同一个类。这导致了一些限制，比如不能`new T()`、不能`instanceof List<String>`。

### 2.2 JDK 6（2006）：性能优化与脚本支持

**2006年12月11日**，JDK 6发布。

**核心特性**：
- **JDBC 4.0**：简化的数据库操作，自动加载驱动
- **JConsole**：Java监视与管理控制台
- **脚本语言支持**：通过JSR 223集成JavaScript等脚本语言
- **Compiler API**：可以在程序中调用Java编译器
- **Web Services**：内置对XML、SOAP的支持
- **轻量级HTTP服务器**：用于测试

**历史背景**：JDK 6的生命周期异常长，直到2014年JDK 8发布前，它都是企业级应用的主流选择。即使在今天，一些银行系统仍在运行JDK 6。

**为什么银行还坚守JDK 6？**
- **稳定性高**：经过多年验证，符合金融行业对稳定性的严苛要求
- **可控性强**：新特性较少，容易维护和掌控
- **成本考虑**：升级需要修改代码、重新测试、重新审计，成本巨大

**2009年**，Oracle以74亿美元收购Sun公司。Java正式归属Oracle，一个新时代开始了。


## 第三章：JDK 7和8 —— Oracle时代与函数式革命（2011-2014）

### 3.1 JDK 7（2011）：曲折的过渡版本

**2011年7月28日**，JDK 7发布。

**历史背景**：在JDK 7开发期间，Sun公司陷入财务困境，股票市值跌至高峰时期的3%，无力按计划推进研发。Oracle收购后立即实行“B计划”，大幅裁剪预定目标，才保证了准时发布。

**核心特性**：
- **switch支持字符串**
  ```java
  switch (str) {
      case "hello": break;
      case "world": break;
  }
  ```
- **菱形操作符**：泛型类型推断
  ```java
  List<String> list = new ArrayList<>();  // 无需重复写类型
  ```
- **try-with-resources**：自动关闭资源
  ```java
  try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
      // 使用完后自动关闭
  }
  ```
- **多异常捕获**
  ```java
  try {
      // ...
  } catch (IOException | SQLException e) {
      // 统一处理
  }
  ```
- **二进制字面量**：0b开头表示二进制
  ```java
  int binary = 0b1010;  // 十进制10
  ```
- **数字字面量加下划线**：提高可读性
  ```java
  int million = 1_000_000;
  ```
- **NIO.2**：增强的文件操作API
  ```java
  Path path = Paths.get("/tmp/file.txt");
  Files.copy(path, Paths.get("/tmp/copy.txt"));
  ```

### 3.2 JDK 8（2014）：函数式编程的革命

**2014年3月18日**，JDK 8发布。这是继JDK 5之后最重要的版本，也是目前最流行的LTS版本。

**核心特性**：

#### 3.2.1 Lambda表达式

这是JDK 8最核心的特性，让Java具备了函数式编程能力。

```java
// 传统方式
Collections.sort(list, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
});

// Lambda方式
Collections.sort(list, (a, b) -> a.length() - b.length());

// 更简洁的方法引用
Collections.sort(list, Comparator.comparingInt(String::length));
```

**Lambda语法**：
- `(参数) -> 表达式`
- `(参数) -> { 语句; }`

#### 3.2.2 Stream API

Stream提供了一种声明式处理数据集合的方式。

```java
List<User> users = Arrays.asList(new User("张三", 20), new User("李四", 30), ...);

// 筛选年龄>18的用户，提取姓名，排序，收集到列表
List<String> names = users.stream()
    .filter(u -> u.getAge() > 18)
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());

// 并行流
users.parallelStream()
    .filter(u -> u.getAge() > 18)
    .forEach(System.out::println);
```

**Stream操作分类**：
- **中间操作**：filter、map、sorted、distinct、limit
- **终端操作**：forEach、collect、count、reduce、anyMatch

#### 3.2.3 新日期时间API

彻底重写了日期时间库，解决了旧版`Date`的可变性和线程安全问题。

```java
// 创建日期
LocalDate date = LocalDate.of(2026, 2, 18);
LocalTime time = LocalTime.of(10, 30);
LocalDateTime datetime = LocalDateTime.now();

// 日期运算
LocalDate tomorrow = date.plusDays(1);
LocalDate lastMonth = date.minusMonths(1);

// 格式化
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
String formatted = date.format(formatter);

// 时区处理
ZonedDateTime zdt = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
```

#### 3.2.4 接口默认方法与静态方法

```java
public interface MyInterface {
    // 抽象方法
    void abstractMethod();
    
    // 默认方法：有实现的方法
    default void defaultMethod() {
        System.out.println("默认实现");
    }
    
    // 静态方法
    static void staticMethod() {
        System.out.println("静态方法");
    }
}
```

#### 3.2.5 Optional类

用于优雅地处理空指针问题。

```java
// 传统方式
public String getCity(User user) {
    if (user != null && user.getAddress() != null) {
        return user.getAddress().getCity();
    }
    return "未知";
}

// Optional方式
public String getCity(User user) {
    return Optional.ofNullable(user)
        .map(User::getAddress)
        .map(Address::getCity)
        .orElse("未知");
}
```

**其他特性**：
- **CompletableFuture**：增强的异步编程
- **Nashorn JavaScript引擎**：在JVM上运行JavaScript
- **重复注解**：同一个位置可以多次使用同一注解
- **方法引用**：`System.out::println`语法

**JDK 8为什么能统治十年？** 
- Lambda和Stream让代码量减少40%，函数式编程简化了集合操作
- Optional将空指针异常关进笼子
- 新日期API解决了长期以来的痛点
- 性能优化和生态成熟度达到顶峰


## 第四章：JDK 9到11 —— 模块化转型与发布周期变革（2017-2018）

### 4.1 发布周期革命：从大版本到半年一发

从JDK 9开始，Oracle改变了发布策略：
- **每6个月发布一个功能版本**（3月和9月）
- **每3年（后来改为2年）发布一个LTS版本**
- LTS版本获得长期支持和更新

这意味着：
- JDK 8之后，下一个LTS是JDK 11
- 非LTS版本只有6个月的支持期，不建议在生产环境使用

### 4.2 JDK 9（2017）：模块化系统（Jigsaw）

**2017年9月22日**，JDK 9发布。

**核心特性**：

#### 4.2.1 模块系统（JPMS）

这是JDK 9最大的变化，将JDK自身也模块化了。

**模块描述文件module-info.java**：
```java
module com.example.myapp {
    requires java.sql;                 // 依赖其他模块
    exports com.example.myapp.api;      // 导出包供其他模块使用
    uses com.example.myapp.spi.Service;  // 声明使用服务
    provides com.example.myapp.spi.Service 
        with com.example.myapp.impl.ServiceImpl;  // 提供服务实现
}
```

**模块化的好处**：
- **强封装**：可以控制哪些包对外可见
- **可靠配置**：避免ClassPath上的Jar冲突
- **可伸缩**：可以构建更小的运行时镜像（通过jlink）

#### 4.2.2 JShell

交互式编程环境，可以逐行执行Java代码，类似Python的REPL。

```bash
$ jshell
jshell> int a = 10
a ==> 10
jshell> System.out.println(a * 2)
20
```

#### 4.2.3 其他特性

- **HTTP/2客户端**（孵化阶段）：新的HTTP客户端API
- **集合工厂方法**：快速创建不可变集合
  ```java
  List.of("a", "b", "c");
  Set.of("x", "y", "z");
  Map.of("k1", "v1", "k2", "v2");
  ```
- **私有接口方法**：接口中可以有private方法
- **改进的try-with-resources**：可以使用effectively final变量
- **响应式流API**：java.util.concurrent.Flow

### 4.3 JDK 10（2018）：局部变量类型推断

**2018年3月20日**，JDK 10发布。

**核心特性**：

#### 4.3.1 var：局部变量类型推断

```java
// 之前
List<String> list = new ArrayList<>();
Map<String, List<Integer>> map = new HashMap<>();

// 之后
var list = new ArrayList<String>();
var map = new HashMap<String, List<Integer>>();

// 循环中
for (var entry : map.entrySet()) {
    var key = entry.getKey();
    var value = entry.getValue();
}
```

**使用限制**：
- 只能用于局部变量（方法内）
- 必须在声明时初始化
- 不能用于方法参数、返回值、字段

#### 4.3.2 其他特性

- **G1并行Full GC**：优化G1垃圾收集器
- **应用类数据共享**：AppCDS，减少启动时间
- **根证书**：OpenJDK中提供一组默认根证书

### 4.4 JDK 11（2018）：第二个LTS，企业升级首选

**2018年9月25日**，JDK 11发布。这是继JDK 8之后的第二个LTS版本，目前仍有约48%的市场份额。

**核心特性**：

#### 4.4.1 HTTP Client标准化

JDK 9孵化的HTTP Client在JDK 11中正式标准化。

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.example.com/users"))
        .build();

// 同步请求
HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// 异步请求
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println);
```

#### 4.4.2 简化启动单个文件

```bash
# 无需编译，直接运行
java HelloWorld.java
```

#### 4.4.3 字符串增强

```java
"  hello  ".isBlank();        // true/false
"hello".repeat(3);             // "hellohellohello"
"  hello  ".strip();           // "hello" (去除全角和半角空格)
"a,b,c".lines().count();       // 3
```

#### 4.4.4 集合转数组

```java
// 之前
String[] arr = list.toArray(new String[0]);

// 之后
String[] arr = list.toArray(String[]::new);
```

#### 4.4.5 垃圾收集器

- **ZGC**：可伸缩的低延迟垃圾收集器（实验性）
- **Epsilon GC**：无操作的垃圾收集器，用于性能测试

**被移除的特性**：
- Java EE模块（JAXB、JAX-WS等）被移除，需要单独引入
- JavaFX被分离为独立模块
- Nashorn JavaScript引擎被废弃

**JDK 11的地位**：作为JDK 8之后第一个LTS，它是企业升级的“安全垫”——语法比8更简洁，模块化让应用更轻量，同时避开了9/10的过渡期不稳定性。


## 第五章：JDK 12到17 —— 模式匹配与云原生时代（2019-2021）

### 5.1 预览特性机制

从JDK 12开始，Java引入了**预览特性**（Preview Features）机制：一些新特性先以预览形式发布，让开发者试用反馈，经过1-2个版本后正式转正。这既加快了创新速度，又保证了稳定性。

### 5.2 JDK 12-16：预览特性轮番登场

#### JDK 12（2019.3）
- **Switch表达式**（预览）：可以作为表达式返回值
  ```java
  int numLetters = switch (day) {
      case MONDAY, FRIDAY, SUNDAY -> 6;
      case TUESDAY                -> 7;
      case THURSDAY, SATURDAY     -> 8;
      case WEDNESDAY              -> 9;
  };
  ```
- **Shenandoah GC**：低暂停时间垃圾收集器（实验性）

#### JDK 13（2019.9）
- **文本块**（预览）：多行字符串
  ```java
  String json = """
      {
          "name": "张三",
          "age": 25
      }
      """;
  ```
- **Switch表达式增强**（预览）

#### JDK 14（2020.3）
- **instanceof模式匹配**（预览）
  ```java
  // 之前
  if (obj instanceof String) {
      String s = (String) obj;
      System.out.println(s.length());
  }
  
  // 之后
  if (obj instanceof String s) {
      System.out.println(s.length());  // 直接使用s
  }
  ```
- **Records**（预览）：透明数据载体
  ```java
  record Point(int x, int y) {}
  ```
- **文本块转正**

#### JDK 15（2020.9）
- **密封类**（预览）：限制哪些类可以继承
  ```java
  sealed interface Shape 
      permits Circle, Rectangle, Triangle {
  }
  ```
- **Records**（第二次预览）
- **instanceof模式匹配**（第二次预览）

#### JDK 16（2021.3）
- **Records转正**
  ```java
  // 一行搞定数据类
  record User(Long id, String name, String email) {}
  
  // 使用
  User user = new User(1L, "张三", "zhang@example.com");
  System.out.println(user.name());  // 自动生成getter
  ```
- **instanceof模式匹配转正**
- **密封类**（第二次预览）

### 5.3 JDK 17（2021.9）：第三个LTS，现代Java的标配

**2021年9月14日**，JDK 17发布。这是继8和11之后的第三个LTS版本，目前市场份额约45%。Spring Boot 3.x要求JDK 17+，使其成为新项目的标配。

**核心特性**：

#### 5.3.1 密封类转正

```java
public sealed class Shape
    permits Circle, Rectangle, Triangle {
}

final class Circle extends Shape { /* ... */ }
final class Rectangle extends Shape { /* ... */ }
final class Triangle extends Shape { /* ... */ }
// 其他类不能继承Shape
```

#### 5.3.2 增强的伪随机数生成器

```java
RandomGeneratorFactory.all()
    .map(f -> f.name())
    .sorted()
    .forEach(System.out::println);

RandomGenerator random = RandomGeneratorFactory
    .of("L128X256MixRandom")
    .create();
```

#### 5.3.3 上下文特定的反序列化过滤器

增强反序列化安全性，可针对特定上下文设置过滤器。

#### 5.3.4 移除和废弃

- **Applet API**被标记为废弃
- **RMI激活**被废弃
- **安全管理器**被标记为废弃

**为什么JDK 17是新项目标配？**
- **语法减负**：文本块、Records、instanceof模式匹配让代码更简洁
- **性能定型**：ZGC和Shenandoah GC经过多个版本验证，稳定可靠
- **生态适配**：Spring Boot 3.x、Quarkus等主流框架都基于JDK 17+
- **默认UTF-8**：解决跨平台编码问题


## 第六章：JDK 18到21 —— 虚拟线程革命（2022-2023）

### 6.1 JDK 18-20：为虚拟线程铺路

#### JDK 18（2022.3）
- **简单Web服务器**：命令行启动简易HTTP服务器
- **UTF-8默认编码**：解决跨平台编码问题
- **简单的API文档片段**：支持在javadoc中加入代码片段

#### JDK 19（2022.9）
- **虚拟线程**（预览）：轻量级线程，JDK并发编程的革命
- **结构化并发**（孵化）：简化多线程编程
- **向量API**（孵化）：SIMD指令支持

#### JDK 20（2023.3）
- **虚拟线程**（第二次预览）
- **结构化并发**（第二次孵化）
- **作用域值**（孵化）：替代ThreadLocal的线程间共享数据方案
- **记录模式**（预览）：在模式匹配中解构Records

### 6.2 JDK 21（2023.9）：第四个LTS，虚拟线程正式版

**2023年9月19日**，JDK 21发布。这是继17之后的第四个LTS版本，被普遍认为是继Java 8之后的下一个主流版本。

**核心特性**：

#### 6.2.1 虚拟线程正式发布

这是JDK 21最重磅的特性，彻底改变了Java的并发编程模型。

**什么是虚拟线程？**
- 传统的Java线程是操作系统线程（平台线程），创建成本高、内存占用大（约1MB）
- 虚拟线程由JVM管理，是JDK级别的轻量级线程，创建成本极低、内存占用小（几KB）
- 单个JVM可以创建数百万个虚拟线程

**传统线程模型的问题**：
```java
// 每个请求占用一个线程
ExecutorService executor = Executors.newFixedThreadPool(200);
for (int i = 0; i < 10000; i++) {
    executor.submit(() -> {
        // 阻塞调用会占用线程
        String result = httpClient.get("https://api.example.com");
        return result;
    });
}
// 如果并发超过200，请求会排队
```

**虚拟线程的写法**：
```java
// 无需线程池，每个任务一个虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10000; i++) {
        executor.submit(() -> {
            // 阻塞调用不会阻塞底层操作系统线程
            String result = httpClient.get("https://api.example.com");
            return result;
        });
    }
}
```

**工作原理**：
1. 虚拟线程运行在称为“载体线程”的平台线程上
2. 当虚拟线程执行阻塞操作（I/O、锁等）时，会自动从载体线程卸载
3. 载体线程可以去执行其他虚拟线程
4. 阻塞操作完成后，虚拟线程重新调度到某个载体线程上

**性能对比**（4C8G机器）：
| 指标 | 平台线程池 | 虚拟线程 | 提升 |
|------|------------|----------|------|
| 最大并发 | 200 | 10000+ | 50x |
| 创建10000线程耗时 | 3秒+ | <100ms | 30x+ |
| P99延迟 | 高（排队） | 低（无阻塞） | 大幅优化 |

**使用建议**：
- **I/O密集型任务**：虚拟线程优势明显
- **CPU密集型任务**：使用平台线程，与CPU核心数匹配
- **避免synchronized**：会钉住载体线程，改用ReentrantLock
- **慎用ThreadLocal**：虚拟线程数量大，推荐使用ScopedValue

#### 6.2.2 结构化并发

将相关任务看作一个整体单元，简化错误处理和取消。

```java
// 传统方式：需要手动管理多个线程的异常和取消
Future<String> user = executor.submit(() -> fetchUser());
Future<Integer> order = executor.submit(() -> fetchOrder());
try {
    String u = user.get();  // 可能抛出异常
    Integer o = order.get();
} catch (Exception e) {
    user.cancel(true);
    order.cancel(true);
    throw e;
}

// 结构化并发
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<String> user = scope.fork(() -> fetchUser());
    Future<Integer> order = scope.fork(() -> fetchOrder());
    
    scope.join();          // 等待所有任务
    scope.throwIfFailed(); // 如果有任务失败，抛出异常
    
    return new Result(user.resultNow(), order.resultNow());
} // 自动取消未完成的任务
```

#### 6.2.3 作用域值

替代ThreadLocal的更高效的线程间共享数据方案。

```java
// 定义作用域值
private static final ScopedValue<User> LOGGED_IN_USER = ScopedValue.newInstance();

// 绑定值并在作用域内运行
ScopedValue.where(LOGGED_IN_USER, user)
    .run(() -> {
        // 在这个作用域内可以访问LOGGED_IN_USER
        processRequest();
    });

// 在方法中获取
void processRequest() {
    User user = LOGGED_IN_USER.get();
    // ...
}
```

#### 6.2.4 记录模式

可以在模式匹配中解构Records。

```java
record Point(int x, int y) {}
record Line(Point start, Point end) {}

// 之前
if (obj instanceof Line l) {
    Point s = l.start();
    Point e = l.end();
    System.out.println(s.x() + "," + s.y());
}

// 记录模式
if (obj instanceof Line(Point(var x1, var y1), Point(var x2, var y2))) {
    System.out.println(x1 + "," + y1);
}
```

#### 6.2.5 Switch模式匹配

```java
// 之前
String formatted;
if (obj instanceof Integer i) {
    formatted = String.format("int %d", i);
} else if (obj instanceof Long l) {
    formatted = String.format("long %d", l);
} else if (obj instanceof String s) {
    formatted = String.format("String %s", s);
} else {
    formatted = "unknown";
}

// 之后
String formatted = switch (obj) {
    case Integer i -> String.format("int %d", i);
    case Long l    -> String.format("long %d", l);
    case String s  -> String.format("String %s", s);
    default        -> "unknown";
};
```

**其他特性**：
- **序列化集合**：有序的`LinkedHashMap`和`LinkedHashSet`性能优化
- **分代ZGC**：降低垃圾收集开销
- **Key Encapsulation Mechanism API**：KEM加密支持


## 第七章：JDK 22到25 —— AI与云原生深化（2024-2026）

### 7.1 JDK 22（2024.3）

**核心特性**：
- **未命名变量和模式**：用`_`表示不使用的变量
  ```java
  try (var _ = conn.prepareStatement(sql)) { ... }
  
  if (obj instanceof Point(int x, int _)) { ... }
  ```
- **外部函数与内存API**：安全高效地调用本地代码
- **字符串模板**（第二次预览）
  ```java
  String name = "张三";
  String info = STR."用户：\{name}";
  ```

### 7.2 JDK 23（2024.9）

**核心特性**：
- **矢量API**（第八次孵化）：SIMD指令支持，为AI计算加速
- **作用域值**（第三次预览）
- **隐式声明的类和实例主方法**：简化入门

### 7.3 JDK 24（2025.3）

**核心特性**：
- **类文件API**：解析和生成Java类文件
- **紧凑对象头**：减少内存占用（为JDK 25铺路）
- **量子安全加密API**：PEM格式支持

### 7.4 JDK 25（2025.9）：第五个LTS，AI时代的Java

**2025年9月**，JDK 25发布。这是第五个LTS版本，支持周期至2033年。

**核心特性**：

#### 7.4.1 紧凑对象头正式版

- 对象头从96-128位压缩到64位
- **堆内存占用减少20%**，适合云原生环境

#### 7.4.2 Float16向量运算

- 支持半精度浮点数运算
- **AI推理效率提升25%**，适合机器学习计算

#### 7.4.3 AOT编译优化

- AOT编译启动速度提升30%+
- 原生镜像更小、更快

#### 7.4.4 PEM加密API正式版

- 支持量子安全的PEM格式密钥
- 适配后量子密码学标准

**JDK 25的定位**：
- 面向AI推理引擎、数值计算项目
- 适合云原生服务（追求低内存、快启动）
- 创新型团队技术预研的首选


## 第八章：版本演进全景图与选型指南

### 8.1 LTS版本一览

| 版本 | 发布时间 | 支持截止 | 核心主题 | 代表特性 |
|------|----------|----------|---------|---------|
| **JDK 8** | 2014.3 | 2030.12（商业） | 函数式革命 | Lambda、Stream、Optional |
| **JDK 11** | 2018.9 | 2026.9（社区） | 模块化转型 | HTTP Client、ZGC孵化、var |
| **JDK 17** | 2021.9 | 2029.9 | 语法完善 | Records、密封类、模式匹配 |
| **JDK 21** | 2023.9 | 2031.9 | 并发革命 | 虚拟线程、结构化并发 |
| **JDK 25** | 2025.9 | 2033.9 | AI原生 | 紧凑对象头、Float16向量 |

### 8.2 非LTS版本定位

非LTS版本（如JDK 9、10、12-16、18-20、22-24）是“功能预览版”：
- 每6个月发布，只有6个月支持期
- 引入预览特性，供开发者试用反馈
- **不建议在生产环境使用**，除非有特定需求

### 8.3 版本选型建议

根据2026年初的实际情况：

| 场景 | 推荐版本 | 理由 |
|------|----------|------|
| **遗留系统维护** | JDK 8 | 金融、政务等老旧系统，升级成本高，商业支持至2030年 |
| **企业过渡升级** | JDK 17 | 从8/11迁移，稳定性高，生态完善，Spring Boot 3.x适配 |
| **新项目标杆** | JDK 21 | 虚拟线程大幅简化并发编程，支持周期至2031年 |
| **前沿技术布局** | JDK 25 | AI计算优化、内存占用低、支持至2033年，适合云原生 |

### 8.4 升级避坑指南

#### 从8到11
- **移除Java EE模块**：JAXB、JAX-WS等需要单独引入
- **ClassLoader变化**：有些应用依赖的类加载行为改变
- **废弃API**：`finalize()`、`Thread.destroy()`等被移除

#### 从11到17
- **封装JDK内部API**：使用`--add-opens`或改用公共API
- **预览特性**：如果用了预览特性（如Records预览版），需要调整
- **默认编码UTF-8**：依赖系统编码的应用需注意

#### 从17到21
- **虚拟线程适配**：检查`synchronized`、`ThreadLocal`使用
- **新反射限制**：部分私有字段访问受限
- **预览特性升级**：如Switch模式匹配语法可能有微调


## 第九章：面试题库

### 5道难度递增的基础面试题

#### 第1题：JDK、JRE和JVM有什么区别？

**难度**：⭐

**参考答案**：

| 组件 | 全称 | 作用 |
|------|------|------|
| **JDK** | Java Development Kit | Java开发工具包，包含编译、调试、文档工具，以及JRE |
| **JRE** | Java Runtime Environment | Java运行时环境，包含JVM和核心类库，用于运行Java程序 |
| **JVM** | Java Virtual Machine | Java虚拟机，执行字节码，实现跨平台 |

**关系**：JDK包含JRE，JRE包含JVM。

#### 第2题：请列举JDK 5引入的5个重要特性。

**难度**：⭐⭐

**参考答案**：

1. **泛型**：类型安全的集合，如`List<String>`
2. **增强for循环**：简化集合遍历
3. **自动装箱/拆箱**：基本类型与包装类自动转换
4. **枚举**：类型安全的常量，如`enum Color {RED, GREEN}`
5. **注解**：元数据支持，如`@Override`
6. **并发包**：java.util.concurrent（答案选5个即可）

#### 第3题：Lambda表达式和Stream API如何改变Java编程？

**难度**：⭐⭐⭐

**参考答案**：

Lambda表达式和Stream API将函数式编程风格引入Java，主要体现在：

1. **代码简洁**：将集合操作从“怎么做”变成“做什么”
   ```java
   // 传统方式
   List<String> result = new ArrayList<>();
   for (User u : users) {
       if (u.getAge() > 18) {
           result.add(u.getName());
       }
   }
   Collections.sort(result);
   
   // Stream方式
   List<String> result = users.stream()
       .filter(u -> u.getAge() > 18)
       .map(User::getName)
       .sorted()
       .collect(Collectors.toList());
   ```

2. **惰性求值**：Stream的中间操作不会立即执行，只有终端操作时才触发

3. **并行处理**：`parallelStream()`可以轻松利用多核CPU

4. **减少中间状态**：无需临时变量，降低出错概率

#### 第4题：什么是虚拟线程？它与传统平台线程有什么区别？

**难度**：⭐⭐⭐⭐

**参考答案**：

虚拟线程是JDK 21正式发布的轻量级线程，由JVM管理而非操作系统。

**核心区别**：

| 维度 | 平台线程 | 虚拟线程 |
|------|----------|----------|
| **管理方** | 操作系统内核 | JVM |
| **内存占用** | ~1MB/线程 | 几KB/线程 |
| **最大数量** | 数千 | 数百万 |
| **创建开销** | 高 | 极低 |
| **上下文切换** | 系统调度 | JVM调度 |
| **阻塞影响** | 占用操作系统线程 | 仅挂起自身 |

**工作原理**：
1. 虚拟线程运行在载体线程（平台线程）上
2. 阻塞操作时自动卸载，载体线程可执行其他虚拟线程
3. 阻塞结束后重新调度

**适用场景**：I/O密集型任务（Web服务器、数据库访问、RPC调用）优势明显；CPU密集型任务仍使用平台线程。

#### 第5题：从JDK 8到21，Java的并发编程模型发生了怎样的演变？

**难度**：⭐⭐⭐⭐⭐

**参考答案**：

**JDK 8时代**：
- **线程池**：`Executors.newFixedThreadPool()`
- **Future**：`ExecutorService.submit()`返回Future
- **CompletableFuture**：异步编程组合，但仍有回调嵌套问题

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
Future<String> future = executor.submit(() -> fetchData());
```

**JDK 11时代**：
- **CompletableFuture增强**：超时控制等
- **Flow API**：响应式流规范

**JDK 21革命**：
- **虚拟线程**：颠覆性改变，每个任务一个线程成为可能
  ```java
  try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      // 可以创建10万个虚拟线程
      IntStream.range(0, 100000).forEach(i -> 
          executor.submit(() -> handleRequest(i))
      );
  }
  ```
- **结构化并发**：将相关任务组织成整体，统一处理取消和错误
  ```java
  try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
      Future<String> user = scope.fork(() -> fetchUser());
      Future<Integer> order = scope.fork(() -> fetchOrder());
      scope.join();
      return new Result(user.resultNow(), order.resultNow());
  }
  ```
- **作用域值**：替代ThreadLocal，更高效的线程间数据共享

**演变趋势**：
从“线程池管理资源”到“虚拟线程无限制创建”，从“手动处理并发错误”到“结构化统一管理”，从“ThreadLocal”到“作用域值”。Java的并发编程正变得越来越简单、安全、高效。

### 3道实战场景题

#### 场景1：老项目升级决策

**场景描述**：你们公司有一个基于JDK 8开发的金融交易系统，运行稳定已有5年。现在技术部门建议升级到JDK 17或21，但业务部门担心稳定性和升级成本。作为技术负责人，你会如何分析和决策？

**考察点**：版本选型、风险评估、升级策略

**参考思路**：

**第一步：评估升级收益**
- JDK 17/21带来的价值：虚拟线程可提升并发能力、Records减少样板代码、新日期API简化时间处理、ZGC降低延迟
- 如果系统是I/O密集型，虚拟线程可能带来10倍以上并发提升

**第二步：识别风险点**
- 依赖第三方库是否兼容（如旧版Hibernate、MyBatis）
- 是否有使用Java EE模块（JAXB等）被移除
- 是否有反射访问JDK内部API
- 团队对新特性熟悉程度

**第三步：分阶段升级策略**

1. **评估阶段（2周）**：使用jdeprscan扫描废弃API，检查所有依赖
2. **沙箱测试（1个月）**：搭建完全相同的测试环境，运行全量自动化测试
3. **试点升级（1个月）**：选择非核心模块升级到JDK 17，灰度观察
4. **分批升级（2-3个月）**：核心模块分批升级，每次上线前充分测试
5. **回退预案**：保留JDK 8环境，遇到严重问题立即回滚

**第四步：版本选择建议**
- 如果是保守策略：升级到JDK 17（稳定，Spring Boot 3.x适配）
- 如果是进取策略：直接升级到JDK 21（虚拟线程收益大，支持周期长）

#### 场景2：高并发系统优化

**场景描述**：你的Web应用基于JDK 11开发，每天处理500万请求。高峰期出现响应变慢、CPU飙升，监控显示Tomcat线程池经常占满（最大200线程），大量请求排队。作为架构师，你会如何优化？

**考察点**：虚拟线程应用、线程模型理解

**参考思路**：

**问题诊断**：线程池占满说明系统是I/O密集型阻塞，每个请求都长时间占用Tomcat线程。

**方案一：升级到JDK 21，启用虚拟线程**

```yaml
# 如果使用Spring Boot 3.2+
spring:
  threads:
    virtual:
      enabled: true
```

**代码无需修改**，Tomcat会自动使用虚拟线程处理请求：

```java
@RestController
public class OrderController {
    @GetMapping("/order/{id}")
    public Order getOrder(@PathVariable Long id) {
        // 这些阻塞调用现在运行在虚拟线程上
        User user = userService.getUser(id);      // RPC调用
        Order order = orderService.getOrder(id);  // 数据库查询
        List<Item> items = itemService.getItems(id); // 另一个服务
        return new Order(order, user, items);
    }
}
```

**效果**：
- 理论上可以支撑的并发从200提升到数万
- 操作系统线程从200个变为几十个（载体线程）
- 请求不再排队等待

**方案二：使用结构化并发优化内部调用**

```java
@GetMapping("/order/{id}")
public Order getOrder(@PathVariable Long id) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        Future<User> user = scope.fork(() -> userService.getUser(id));
        Future<Order> order = scope.fork(() -> orderService.getOrder(id));
        Future<List<Item>> items = scope.fork(() -> itemService.getItems(id));
        
        scope.join();          // 等待所有任务
        scope.throwIfFailed(); // 如果有失败，抛出异常
        
        return new Order(order.resultNow(), 
                        user.resultNow(), 
                        items.resultNow());
    }
}
```

**方案三：逐步迁移策略**
1. 先将JDK升级到21，但不启用虚拟线程，验证兼容性
2. 在测试环境启用虚拟线程，压测验证
3. 选择非核心接口灰度开启
4. 全量开启，监控线程数和响应时间

#### 场景3：云原生部署优化

**场景描述**：你们团队准备将Java应用容器化部署到Kubernetes，但发现传统JDK 8应用启动需要30-40秒，内存占用高（基础堆1GB），导致Pod扩缩容慢、资源成本高。你会如何利用新版JDK优化？

**考察点**：云原生知识、AOT编译、CDS

**参考思路**：

**核心方案**：升级到JDK 21或25，利用AppCDS和AOT优化

**第一步：启用AppCDS（应用类数据共享）**

```bash
# 1. 创建类列表
java -Xshare:off -XX:+UseAppCDS -XX:DumpLoadedClassList=app.list -jar myapp.jar

# 2. 创建共享存档
java -Xshare:dump -XX:+UseAppCDS -XX:SharedClassListFile=app.list \
     -XX:SharedArchiveFile=app.jsa -cp myapp.jar

# 3. 使用存档启动
java -Xshare:on -XX:+UseAppCDS -XX:SharedArchiveFile=app.jsa -jar myapp.jar
```

**效果**：启动时间减少30-40%

**第二步：升级到JDK 25，利用紧凑对象头**

JDK 25的对象头压缩到64位，内存占用减少20%。

**第三步：使用ZGC替代G1（如果延迟敏感）**

```bash
java -XX:+UseZGC -jar myapp.jar
```

ZGC的暂停时间通常在10ms以内，远低于G1的几十毫秒。

**第四步：如果允许，使用GraalVM原生镜像**

```xml
<!-- 使用native-maven-plugin -->
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <configuration>
        <imageName>myapp</imageName>
        <buildArgs>
            <buildArg>-H:+ReportExceptionStackTraces</buildArg>
        </buildArgs>
    </configuration>
</plugin>
```

```bash
mvn -Pnative native:compile
```

**效果**：
- 启动时间：40秒 → <100毫秒
- 内存占用：1GB → 120MB
- 镜像体积：可执行文件约50-70MB

**第五步：Kubernetes配置优化**

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        startupProbe:
          httpGet:
            path: /health
          initialDelaySeconds: 0  # 原生镜像启动极快
          periodSeconds: 1
        resources:
          requests:
            memory: "256Mi"  # 大幅降低内存请求
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
```

**最终收益**：
- 启动时间：40秒 → 100毫秒（原生镜像）或 5-8秒（优化后JVM）
- 内存占用：降低50-80%
- 资源成本：降低60%以上
- 扩缩容响应：从分钟级到秒级


## 结语

从1996年的JDK 1.0到2025年的JDK 25，Java走过了近三十年的演进历程。它从一种简单的面向对象语言，成长为拥有庞大生态的企业级平台；从传统的同步阻塞模型，进化到支持百万级并发的虚拟线程；从语法相对繁琐，到今天拥有Lambda、Records、模式匹配等现代语言特性。

每个版本都承载着那个时代的印记：1.2让Java走向企业级，5.0带来语法革命，8开启函数式编程，11完成模块化转型，21用虚拟线程重构并发模型，25则瞄准AI与云原生。

理解这些演进历程，不仅有助于我们在面试中展现技术深度，更重要的是能在实际项目中做出正确的技术选型，写出更优雅、更高效的代码。无论你还在使用JDK 8，还是已经拥抱JDK 21，希望这篇超详细的梳理能为你提供有价值的参考。

技术不断向前，但Java的核心理念始终未变：**一次编写，到处运行**。这或许正是它能统治企业级开发近三十年的根本原因。


**参考资料**：
1. Java基础(一)：发展史、技术体系与JDK环境配置详解. 华为云社区, 2025. 
2. 全网最全的JAVA所有版本特性【JAVA 1.0 - JAVA 24】. CSDN博客, 2018-2025. 
3. ⚠️2025 还守 JDK8？JDK8-25 进化史 + 4 个 LTS 避坑指南. 百家号, 2025. 
4. 聊聊JDK1.0到JDK20的那些事儿. 京东云开发者社区, 2023. 
5. 聊聊 JDK1.0 到 JDK20 的那些事儿 | 京东云技术团队. 搜狐, 2023. 