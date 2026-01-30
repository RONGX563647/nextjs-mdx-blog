# 00📚  Java Day00 Java + AI 完整学习笔记（整理版）

> 💡 **核心提示**：本笔记整合了Java基础到进阶的全部核心知识点，按学习路径组织，去除重复内容，便于快速回顾和复习。

---

# Day 1 - Java入门与环境搭建

## 快速回顾

- Java三大平台：SE（标准版）、EE（企业版）、ME（小型版）
- JDK ⊃ JRE ⊃ JVM，JDK用于开发，JRE用于运行，JVM实现跨平台
- 开发流程：编写.java → javac编译 → 生成.class → JVM解释执行

## 内容

### 1. Java核心特性

**跨平台原理**：一次编写，多处运行。JVM将字节码翻译成对应操作系统的机器指令。

### 2. JDK/JRE/JVM关系

| 组件 | 作用 | 包含内容 |
|------|------|----------|
| JVM | 跨平台核心 | 字节码解析执行 |
| JRE | 运行环境 | JVM + 核心类库 |
| JDK | 开发工具包 | JRE + 编译工具(javac/java等) |

### 3. 环境配置

```bash
# 验证安装
java -version
javac -version
```

**环境变量配置**：
- `JAVA_HOME`: JDK安装路径
- `Path`: `%JAVA_HOME%\bin`

### 4. HelloWorld程序

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

编译运行：
```bash
javac HelloWorld.java    # 编译
java HelloWorld          # 运行
```

### 5. 编码规范

- 类名：大驼峰（HelloWorld）
- 方法/变量：小驼峰（helloWorld）
- 常量：全大写（MAX_VALUE）

## 问答

**Q1: 为什么说Java是跨平台的？**  
A: Java程序编译后生成字节码(.class)，不同操作系统安装对应的JVM，JVM将字节码翻译成该系统的机器指令执行。

**Q2: JDK和JRE的区别？**  
A: JDK是开发工具包，包含JRE和编译工具；JRE是运行环境，只包含运行所需组件。开发需要JDK，运行只需要JRE。

**Q3: 环境变量的作用是什么？**  
A: 让系统在任何目录下都能识别javac、java等命令，而不必进入JDK的bin目录。

---

# Day 2 - 方法、类型转换、运算符

## 快速回顾

- 方法：封装功能的代码块，支持重载（同名不同参）
- 类型转换：小→大自动转，大→小强制转（可能丢失精度）
- 运算符：算术、赋值、比较、逻辑、位运算、三元

## 内容

### 1. 方法详解

**完整语法**：
```java
修饰符 返回值类型 方法名(参数列表) {
    方法体
    return 返回值;
}
```

**方法重载规则**：
- 同一类中，方法名相同
- 参数列表不同（个数/类型/顺序）
- 与返回值无关

```java
public static void print(int num) { }
public static void print(String str) { }
public static void print(double num, String desc) { }
```

### 2. 类型转换

**类型范围**：`byte < short < char < int < long < float < double`

| 转换类型 | 方向 | 语法 | 安全性 |
|----------|------|------|--------|
| 自动转换 | 小→大 | `int a = byteVal;` | 安全 |
| 强制转换 | 大→小 | `int a = (int)doubleVal;` | 可能丢失 |

**表达式自动提升**：
```java
byte a = 10;
byte b = 20;
int c = a + b;  // 运算时自动提升为int
```

### 3. 运算符

**算术运算符**：`+ - * / % ++ --`

**赋值运算符**：`= += -= *= /= %=`

**比较运算符**：`== != > < >= <=`

**逻辑运算符**：`&& || ! & |`
- `&&`短路与：左边false右边不执行
- `||`短路或：左边true右边不执行

**三元运算符**：`条件 ? 值1 : 值2`

## 问答

**Q1: 方法重载和方法重写有什么区别？**  
A: 重载是同一类中同名不同参；重写是子类对父类方法的重新实现，方法签名相同。

**Q2: 强制转换可能产生什么问题？**  
A: 大范围转小范围可能导致数据溢出或精度丢失，如`int`转`byte`可能截断高位。

**Q3: && 和 & 的区别？**  
A: &&是短路与，左边false右边不执行；&是非短路，两边都执行。||和|同理。

---

# Day 3 - 流程控制

## 快速回顾

- 顺序结构：默认自上而下执行
- 分支结构：if/switch条件判断
- 循环结构：for/while/do-while重复执行
- 跳转语句：break/continue控制流程

## 内容

### 1. 分支结构

**if分支**：
```java
// 单条件
if (条件) { 语句体; }

// 二选一
if (条件) { 语句体1; } else { 语句体2; }

// 多条件
if (条件1) { } else if (条件2) { } else { }
```

**switch分支**：
```java
switch(表达式) {
    case 值1: 语句体1; break;
    case 值2: 语句体2; break;
    default: 默认语句;
}
```
- 表达式支持：byte/short/int/char/枚举/String（JDK7+）
- case值必须是字面量，不能重复
- 无break会"穿透"执行

### 2. 循环结构

**for循环**（已知次数）：
```java
for (初始化; 条件; 迭代) {
    循环体;
}
```

**while循环**（未知次数）：
```java
while (条件) {
    循环体;
}
```

**do-while循环**（至少执行一次）：
```java
do {
    循环体;
} while (条件);
```

### 3. 跳转语句

| 语句 | 作用 |
|------|------|
| break | 跳出当前循环/switch |
| continue | 跳过本次循环，继续下一次 |
| return | 结束方法执行 |

## 问答

**Q1: if和switch的使用场景区别？**  
A: if支持区间和多条件组合，更灵活；switch适合等值判断，代码更简洁。

**Q2: for、while、do-while如何选择？**  
A: 已知循环次数用for；未知次数用while；至少执行一次用do-while。

**Q3: break和continue的区别？**  
A: break是跳出整个循环；continue是跳过本次，继续下一次循环。

---

# Day 4 - 数组

## 快速回顾

- 数组：同类型数据的连续内存集合，长度固定
- 索引从0开始，通过索引快速访问
- Arrays工具类提供排序、搜索、复制等操作

## 内容

### 1. 数组初始化

```java
// 静态初始化
int[] arr1 = {1, 2, 3};
int[] arr2 = new int[]{1, 2, 3};

// 动态初始化
int[] arr3 = new int[5];  // 默认值0
String[] arr4 = new String[5];  // 默认值null
```

**默认值规则**：整数0，浮点0.0，布尔false，引用类型null

### 2. 数组遍历

```java
// 普通for
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}

// 增强for
for (int num : arr) {
    System.out.println(num);
}

// 快速打印
System.out.println(Arrays.toString(arr));
```

### 3. 二维数组

```java
// 初始化
int[][] arr = {{1,2}, {3,4,5}, {6}};

// 遍历
for (int i = 0; i < arr.length; i++) {
    for (int j = 0; j < arr[i].length; j++) {
        System.out.println(arr[i][j]);
    }
}
```

### 4. Arrays工具类

| 方法 | 功能 |
|------|------|
| `sort(arr)` | 排序（快排/TimSort） |
| `binarySearch(arr, key)` | 二分查找（需先排序） |
| `copyOf(arr, length)` | 复制数组 |
| `fill(arr, val)` | 填充数组 |
| `equals(arr1, arr2)` | 比较数组 |
| `toString(arr)` | 转字符串 |

## 问答

**Q1: 数组和ArrayList的区别？**  
A: 数组长度固定，可存基本类型；ArrayList长度可变，只能存对象。

**Q2: 为什么数组索引从0开始？**  
A: 索引表示偏移量，arr[0]表示从首地址偏移0个单位。

**Q3: 二分查找的前提条件？**  
A: 数组必须是有序的，否则结果不可预期。

---

# Day 5 - 面向对象基础

## 快速回顾

- 类是模板，对象是实例
- 封装：private属性 + public方法
- 构造器：初始化对象，可重载
- this：区分成员变量和局部变量

## 内容

### 1. 类与对象

```java
public class Student {
    // 成员变量
    private String name;
    private int age;
    
    // 构造器
    public Student() {}
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 成员方法
    public void study() {
        System.out.println(name + "在学习");
    }
    
    // getter/setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

### 2. 封装

**作用**：保护数据安全，隐藏实现细节

**实现**：
- 属性私有化（private）
- 提供公共访问方法（getter/setter）

### 3. 构造器

**特点**：
- 方法名与类名相同
- 无返回值（void也没有）
- 默认提供无参构造，定义有参后需手动添加无参

**this调用构造器**：
```java
public Student() {
    this("未知", 0);  // 必须放第一行
}
```

### 4. this关键字

| 用途 | 示例 |
|------|------|
| 区分成员变量 | `this.name = name;` |
| 调用其他构造器 | `this(参数);` |
| 返回当前对象 | `return this;` |

## 问答

**Q1: 成员变量和局部变量的区别？**  
A: 成员变量在类中定义，有默认值，作用域整个类；局部变量在方法中定义，无默认值，作用域方法内。

**Q2: 为什么要封装？**  
A: 保护数据不被随意修改，可以在setter中添加校验逻辑，提高安全性。

**Q3: 构造器和普通方法的区别？**  
A: 构造器无返回值，方法名与类名相同，用于初始化对象；普通方法有返回值，用于实现功能。

---

# Day 6 - 继承、多态、final、单例模式

## 快速回顾

- 继承：子类extends父类，复用代码
- 多态：父类引用指向子类对象，方法重写实现
- final：修饰类（不可继承）、方法（不可重写）、变量（不可变）
- 单例：全局唯一实例

## 内容

### 1. 继承

```java
class Animal {
    protected String name;
    public void eat() { }
}

class Dog extends Animal {
    public void bark() { }
}
```

**方法重写规则**：
- 方法名、参数列表相同
- 返回值类型相同或子类（协变）
- 访问权限≥父类
- 异常≤父类

**super关键字**：
```java
public Dog(String name) {
    super(name);  // 调用父类构造器
}
```

### 2. 多态

**前提条件**：
1. 继承关系
2. 方法重写
3. 父类引用指向子类对象

```java
Animal animal = new Dog();  // 向上转型
animal.eat();  // 调用Dog的eat()

// 向下转型
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.bark();
}
```

### 3. final关键字

| 修饰 | 作用 |
|------|------|
| 类 | 不可被继承 |
| 方法 | 不可被重写 |
| 变量 | 不可重新赋值（常量） |

### 4. 单例模式

**饿汉式**：
```java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

**懒汉式**：
```java
public class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

## 问答

**Q1: 重载和重写的区别？**  
A: 重载是同一类中同名不同参；重写是子类对父类方法的重新实现，方法签名相同。

**Q2: 多态的好处？**  
A: 提高代码扩展性，便于维护。如定义Animal[]数组，可存Dog、Cat等各种子类对象。

**Q3: 单例模式的应用场景？**  
A: 配置类、连接池、线程池等需要全局唯一实例的场景。

---

# Day 7 - 抽象类、接口、代码块、内部类

## 快速回顾

- 抽象类：半成品，可含抽象方法和普通方法
- 接口：行为规范，JDK8+支持默认/静态方法
- 代码块：静态代码块（类加载执行）、构造代码块（创建对象执行）
- 内部类：成员/局部/匿名/静态内部类

## 内容

### 1. 抽象类

```java
abstract class Animal {
    String name;
    
    abstract void cry();  // 抽象方法
    
    void eat() {  // 普通方法
        System.out.println("eating");
    }
}
```

**特点**：
- 不能实例化
- 子类必须实现所有抽象方法
- 单继承

### 2. 接口

```java
interface Swim {
    void swim();  // 默认public abstract
    
    default void warmUp() {  // 默认方法
        System.out.println("热身");
    }
    
    static void showRule() {  // 静态方法
        System.out.println("规则");
    }
}
```

**接口vs抽象类**：

| 特性 | 接口 | 抽象类 |
|------|------|--------|
| 方法 | JDK8前只能抽象 | 可有抽象和普通方法 |
| 继承 | 多实现 | 单继承 |
| 变量 | 默认public static final | 普通成员变量 |
| 构造器 | 无 | 有 |

### 3. 代码块

```java
public class Demo {
    static {  // 静态代码块
        // 类加载时执行，只执行一次
    }
    
    {  // 构造代码块
        // 每次创建对象时执行
    }
    
    public Demo() {
        // 构造器
    }
}
```

### 4. 内部类

```java
public class Outer {
    // 成员内部类
    class Inner {
        void show() {
            System.out.println(Outer.this.name);  // 访问外部类成员
        }
    }
    
    // 静态内部类
    static class StaticInner { }
    
    public void method() {
        // 局部内部类
        class LocalInner { }
        
        // 匿名内部类
        Runnable r = new Runnable() {
            public void run() { }
        };
    }
}
```

## 问答

**Q1: 抽象类和接口的区别？**  
A: 抽象类是半成品模板，单继承；接口是行为规范，多实现。JDK8后接口可有默认方法。

**Q2: 什么时候用抽象类，什么时候用接口？**  
A: is-a关系用抽象类（如Dog is a Animal）；has-a能力用接口（如Dog has Swim ability）。

**Q3: 内部类的作用？**  
A: 封装隐藏、访问外部类私有成员、实现回调机制（如匿名内部类）。

---

# Day 8 - 函数式编程、常用API

## 快速回顾

- Lambda：简化匿名内部类，(参数) -> {方法体}
- 方法引用：::简化Lambda
- String：不可变，常量池机制
- ArrayList：动态数组，自动扩容

## 内容

### 1. Lambda表达式

```java
// 匿名内部类
Comparator<Integer> c1 = new Comparator<Integer>() {
    public int compare(Integer a, Integer b) {
        return a - b;
    }
};

// Lambda完整
Comparator<Integer> c2 = (Integer a, Integer b) -> {
    return a - b;
};

// Lambda最简
Comparator<Integer> c3 = (a, b) -> a - b;
```

**函数式接口**：只有一个抽象方法的接口
- `Runnable`: () -> void
- `Comparator<T>`: (T, T) -> int
- `Function<T, R>`: T -> R
- `Predicate<T>`: T -> boolean
- `Consumer<T>`: T -> void
- `Supplier<T>`: () -> T

### 2. 方法引用

| 类型 | 语法 | 示例 |
|------|------|------|
| 静态方法 | 类名::静态方法 | Integer::parseInt |
| 实例方法 | 对象::实例方法 | str::toUpperCase |
| 特定类型 | 类名::实例方法 | String::length |
| 构造器 | 类名::new | ArrayList::new |

### 3. String类

**核心特性**：
- 不可变：修改创建新对象
- 常量池：字面量方式创建入池

```java
String s1 = "abc";              // 常量池
String s2 = new String("abc");  // 堆内存
String s3 = s2.intern();        // 入池
System.out.println(s1 == s3);   // true
```

**常用方法**：
- `length()`, `charAt()`, `substring()`, `split()`, `replace()`, `contains()`, `equals()`, `trim()`, `startsWith()`

### 4. ArrayList

```java
List<String> list = new ArrayList<>();
list.add("A");
list.get(0);
list.set(0, "B");
list.remove(0);
list.size();
```

**遍历方式**：
```java
// 普通for
for (int i = 0; i < list.size(); i++) { }

// 增强for
for (String s : list) { }

// 迭代器
Iterator<String> it = list.iterator();
while (it.hasNext()) { }

// forEach + Lambda
list.forEach(s -> System.out.println(s));
```

## 问答

**Q1: Lambda的使用前提？**  
A: 必须是函数式接口（只有一个抽象方法）。

**Q2: String为什么不可变？**  
A: 底层用final char[]存储，保证安全（如作为HashMap的key）、节省内存（常量池复用）。

**Q3: ArrayList的扩容机制？**  
A: 默认初始容量10，扩容时增长为原来的1.5倍，使用Arrays.copyOf复制元素。

---

# Day 9 - 项目实战：银行管理系统

## 快速回顾

- 分层架构：model/dao/util/ui
- JDBC：Java连接数据库的标准API
- Swing：Java GUI开发工具包

## 内容

### 1. 项目结构

```
src/main/java/com/bank/
├── model/      # 实体类（Account, Transaction）
├── dao/        # 数据访问层（数据库CRUD）
├── util/       # 工具类（DBUtil）
└── ui/         # 界面层（Swing组件）
```

### 2. JDBC核心步骤

```java
// 1. 加载驱动
Class.forName("com.mysql.cj.jdbc.Driver");

// 2. 获取连接
Connection conn = DriverManager.getConnection(url, user, password);

// 3. 创建Statement
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, param);

// 4. 执行SQL
ResultSet rs = ps.executeQuery();  // 查询
int rows = ps.executeUpdate();     // 增删改

// 5. 处理结果
while (rs.next()) {
    String name = rs.getString("name");
}

// 6. 关闭资源
rs.close(); ps.close(); conn.close();
```

### 3. 事务处理

```java
try {
    conn.setAutoCommit(false);  // 开启事务
    // 执行多个SQL操作
    conn.commit();  // 提交
} catch (Exception e) {
    conn.rollback();  // 回滚
} finally {
    conn.setAutoCommit(true);
}
```

## 问答

**Q1: 为什么要分层架构？**  
A: 高内聚低耦合，便于维护和扩展。各层职责清晰，如dao层只负责数据库操作。

**Q2: Statement和PreparedStatement的区别？**  
A: PreparedStatement预编译SQL，防止SQL注入，性能更好，支持参数化查询。

**Q3: 事务的ACID特性？**  
A: 原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）。

---

# Day 10 - 异常、泛型、集合

## 快速回顾

- 异常：Error（系统级）和Exception（可处理）
- 泛型：编译期类型检查，类型擦除
- 集合：List（有序可重复）、Set（无序不重复）

## 内容

### 1. 异常体系

```
Throwable
├─ Error（不可恢复）
│  ├─ OutOfMemoryError
│  └─ StackOverflowError
└─ Exception
   ├─ 编译时异常（Checked）：必须处理
   └─ 运行时异常（Unchecked）：RuntimeException
```

**处理方式**：
```java
// try-catch-finally
try {
    // 可能抛异常的代码
} catch (SpecificException e) {
    // 处理特定异常
} finally {
    // 必须执行的代码
}

// throws声明
public void read() throws IOException { }

// 主动抛出
throw new IllegalArgumentException("参数错误");

// try-with-resources（自动关闭）
try (FileInputStream fis = new FileInputStream("file.txt")) { }
```

### 2. 泛型

```java
// 泛型类
class Box<T> {
    private T data;
    public T getData() { return data; }
}

// 泛型方法
public <T> T getElement(T[] array, int index) {
    return array[index];
}

// 泛型接口
interface DataOperate<T> {
    void add(T data);
}
```

**通配符**：
- `?`：任意类型
- `? extends T`：T或T的子类（上界，只读）
- `? super T`：T或T的父类（下界，只写）

### 3. List集合

| 实现类 | 底层结构 | 特点 |
|--------|----------|------|
| ArrayList | 数组 | 查询快O(1)，增删慢O(n) |
| LinkedList | 双向链表 | 查询慢O(n)，增删快O(1) |
| Vector | 数组 | 线程安全，已过时 |

## 问答

**Q1: 编译时异常和运行时异常的区别？**  
A: 编译时异常必须处理（try-catch或throws），运行时异常可不处理，如NullPointerException。

**Q2: 泛型的类型擦除是什么？**  
A: 编译期泛型存在，运行期被擦除为Object或上界类型，保证向后兼容。

**Q3: ArrayList和LinkedList如何选择？**  
A: 查询多用ArrayList，频繁增删用LinkedList。大部分场景ArrayList更优。

---

# Day 11 - Set、Map、Stream

## 快速回顾

- Set：无序不重复，HashSet/LinkedHashSet/TreeSet
- Map：键值对，HashMap/LinkedHashMap/TreeMap
- Stream：函数式操作集合，链式调用

## 内容

### 1. Set集合

| 实现类 | 有序性 | 底层 | 特点 |
|--------|--------|------|------|
| HashSet | 无序 | 哈希表 | 去重、O(1)查询 |
| LinkedHashSet | 保留添加顺序 | 哈希表+链表 | 去重+有序 |
| TreeSet | 排序 | 红黑树 | 去重+排序 |

**HashSet去重原理**：
- 先比较hashCode()
- hashCode相同再比较equals()
- 两者都相同则认为是重复元素

```java
// 必须同时重写hashCode和equals
@Override
public boolean equals(Object o) { }

@Override
public int hashCode() { }
```

### 2. Map集合

| 方法 | 功能 |
|------|------|
| put(K, V) | 添加/覆盖键值对 |
| get(K) | 根据键获取值 |
| remove(K) | 删除键值对 |
| containsKey(K) | 判断是否包含键 |
| keySet() | 获取所有键 |
| entrySet() | 获取键值对集合 |

**遍历方式**：
```java
// 1. 键找值
for (String key : map.keySet()) {
    Integer value = map.get(key);
}

// 2. 键值对（推荐）
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();
    Integer value = entry.getValue();
}

// 3. forEach + Lambda
map.forEach((k, v) -> System.out.println(k + "=" + v));
```

### 3. Stream流

```java
List<Integer> result = list.stream()
    .filter(x -> x > 10)        // 过滤
    .map(x -> x * 2)            // 映射
    .sorted()                   // 排序
    .limit(5)                   // 限制数量
    .collect(Collectors.toList());  // 收集
```

**常用操作**：
- 中间操作：filter, map, sorted, distinct, limit, skip
- 终结操作：collect, forEach, count, reduce, anyMatch, allMatch

## 问答

**Q1: HashSet如何保证元素不重复？**  
A: 通过hashCode和equals方法，先比hashCode，相同再比equals。

**Q2: HashMap的底层原理？**  
A: JDK8前是数组+链表，JDK8后是数组+链表+红黑树。链表长度>8且数组长度≥64时转红黑树。

**Q3: Stream的优势？**  
A: 代码简洁、支持并行处理(parallelStream)、函数式编程风格。

---

# Day 12 - File、递归、IO流

## 快速回顾

- File：文件/目录操作，非流操作
- 递归：方法调用自身，需有终止条件
- IO流：字节流（InputStream/OutputStream）、字符流（Reader/Writer）

## 内容

### 1. File类

```java
File file = new File("path");

// 判断
file.exists();
file.isFile();
file.isDirectory();

// 获取信息
file.getName();
file.length();
file.getAbsolutePath();

// 创建删除
file.createNewFile();
file.mkdir();      // 单级目录
file.mkdirs();     // 多级目录
file.delete();     // 删除文件或空目录

// 遍历
File[] files = dir.listFiles();
```

### 2. 递归

**三要素**：
1. 递归公式
2. 递归方向（向终止条件靠近）
3. 终止条件

```java
// 阶乘
public int factorial(int n) {
    if (n == 1) return 1;
    return n * factorial(n - 1);
}

// 文件搜索
public void search(File dir, String target) {
    File[] files = dir.listFiles();
    for (File f : files) {
        if (f.isFile() && f.getName().equals(target)) {
            System.out.println("找到：" + f);
        } else if (f.isDirectory()) {
            search(f, target);  // 递归
        }
    }
}
```

### 3. IO流

**字节流**（适合所有文件）：
```java
// 文件复制
FileInputStream fis = new FileInputStream("src.jpg");
FileOutputStream fos = new FileOutputStream("dest.jpg");
byte[] buffer = new byte[1024];
int len;
while ((len = fis.read(buffer)) != -1) {
    fos.write(buffer, 0, len);
}
fis.close();
fos.close();
```

**字符流**（适合文本）：
```java
BufferedReader br = new BufferedReader(new FileReader("file.txt"));
BufferedWriter bw = new BufferedWriter(new FileWriter("out.txt"));
String line;
while ((line = br.readLine()) != null) {
    bw.write(line);
    bw.newLine();
}
br.close();
bw.close();
```

## 问答

**Q1: 字节流和字符流的区别？**  
A: 字节流按字节读写，适合所有文件；字符流按字符读写，带编码转换，适合文本文件。

**Q2: 递归的注意事项？**  
A: 必须有终止条件，否则栈溢出；递归深度不宜过大。

**Q3: 为什么使用Buffered流？**  
A: 带缓冲区，减少系统IO次数，提高读写效率。

---

# Day 13 - 多线程

## 快速回顾

- 线程创建：继承Thread、实现Runnable/Callable
- 线程状态：新建→就绪→运行→阻塞→死亡
- 线程安全：synchronized、Lock、原子类
- 线程池：复用线程，减少创建销毁开销

## 内容

### 1. 线程创建

```java
// 方式1：继承Thread
class MyThread extends Thread {
    @Override
    public void run() { }
}
new MyThread().start();

// 方式2：实现Runnable（推荐）
class MyRunnable implements Runnable {
    public void run() { }
}
new Thread(new MyRunnable()).start();

// 方式3：实现Callable（有返回值）
FutureTask<Integer> task = new FutureTask<>(new MyCallable());
new Thread(task).start();
Integer result = task.get();  // 阻塞获取结果
```

### 2. 线程同步

**synchronized**：
```java
// 同步方法
public synchronized void method() { }

// 同步代码块
synchronized (this) { }
synchronized (obj) { }
```

**Lock接口**：
```java
Lock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区代码
} finally {
    lock.unlock();
}
```

### 3. 线程池

```java
ExecutorService pool = Executors.newFixedThreadPool(10);
// 或自定义
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    5,                      // 核心线程数
    10,                     // 最大线程数
    60L,                    // 空闲线程存活时间
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100)  // 任务队列
);

pool.execute(() -> { });
Future<Integer> future = pool.submit(() -> 100);
pool.shutdown();
```

### 4. 常用方法

| 方法 | 作用 |
|------|------|
| start() | 启动线程 |
| sleep(ms) | 休眠，不释放锁 |
| yield() | 礼让CPU |
| join() | 等待该线程执行完毕 |
| interrupt() | 中断线程 |

## 问答

**Q1: start()和run()的区别？**  
A: start()启动新线程执行run()；直接调用run()只是普通方法调用，不会创建新线程。

**Q2: synchronized和Lock的区别？**  
A: synchronized是关键字，自动释放锁；Lock是接口，需手动释放，更灵活（可中断、超时、公平锁）。

**Q3: 为什么要用线程池？**  
A: 减少线程创建销毁开销，便于管理，提高响应速度，控制并发数。

---

# Day 14 - 网络编程

## 快速回顾

- Socket：网络通信端点，IP+端口
- TCP：面向连接，可靠传输
- UDP：无连接，不可靠但效率高
- C/S架构：客户端/服务端模式

## 内容

### 1. TCP通信

**服务端**：
```java
ServerSocket serverSocket = new ServerSocket(8888);
Socket socket = serverSocket.accept();  // 阻塞等待连接
InputStream is = socket.getInputStream();
OutputStream os = socket.getOutputStream();
// 读写数据
socket.close();
serverSocket.close();
```

**客户端**：
```java
Socket socket = new Socket("127.0.0.1", 8888);
InputStream is = socket.getInputStream();
OutputStream os = socket.getOutputStream();
// 读写数据
socket.close();
```

### 2. UDP通信

```java
// 发送端
DatagramSocket socket = new DatagramSocket();
byte[] data = "Hello".getBytes();
DatagramPacket packet = new DatagramPacket(
    data, data.length, 
    InetAddress.getByName("127.0.0.1"), 8888
);
socket.send(packet);
socket.close();

// 接收端
DatagramSocket socket = new DatagramSocket(8888);
byte[] buffer = new byte[1024];
DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
socket.receive(packet);  // 阻塞接收
String msg = new String(packet.getData(), 0, packet.getLength());
socket.close();
```

### 3. TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠 | 不可靠 |
| 效率 | 较低 | 高 |
| 应用场景 | 文件传输、HTTP | 视频直播、DNS |

## 问答

**Q1: TCP的三次握手和四次挥手？**  
A: 三次握手建立连接（SYN→SYN+ACK→ACK）；四次挥手断开连接（FIN→ACK→FIN→ACK）。

**Q2: 为什么需要端口号？**  
A: IP定位主机，端口定位主机上的具体应用程序。

**Q3: Socket通信的基本流程？**  
A: 服务端创建ServerSocket监听端口，accept等待连接；客户端创建Socket连接服务端；双方通过输入输出流通信。

---

# Day 15 - 单元测试、反射、注解、动态代理

## 快速回顾

- JUnit：单元测试框架，自动化验证代码正确性
- 反射：运行时获取类信息、操作成员
- 注解：代码元数据，替代XML配置
- 动态代理：运行时创建代理对象，实现AOP

## 内容

### 1. JUnit单元测试

```java
@Test
public void testAdd() {
    Calculator calc = new Calculator();
    int result = calc.add(1, 2);
    assertEquals(3, result);
}
```

**常用注解**：
- `@Test`：标记测试方法
- `@BeforeEach/@AfterEach`：每个测试前后执行
- `@BeforeAll/@AfterAll`：类级别执行（静态方法）

**常用断言**：
- `assertEquals(expected, actual)`
- `assertTrue(condition)`
- `assertNull(object)`
- `assertThrows(Exception.class, () -> { })`

### 2. 反射

```java
// 获取Class对象
Class<?> clazz = Class.forName("com.example.User");

// 创建对象
Object obj = clazz.getDeclaredConstructor().newInstance();

// 操作字段
Field field = clazz.getDeclaredField("name");
field.setAccessible(true);  // 暴力访问私有
field.set(obj, "张三");

// 调用方法
Method method = clazz.getDeclaredMethod("sayHello");
method.invoke(obj);
```

### 3. 注解

**元注解**：
```java
@Retention(RetentionPolicy.RUNTIME)  // 生命周期
@Target(ElementType.METHOD)          // 作用目标
public @interface MyAnnotation {
    String value() default "";
}
```

**解析注解**：
```java
if (method.isAnnotationPresent(MyAnnotation.class)) {
    MyAnnotation anno = method.getAnnotation(MyAnnotation.class);
    String value = anno.value();
}
```

### 4. 动态代理

**JDK动态代理**：
```java
public class ProxyFactory {
    public static Object createProxy(Object target) {
        return Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            (proxy, method, args) -> {
                System.out.println("前置增强");
                Object result = method.invoke(target, args);
                System.out.println("后置增强");
                return result;
            }
        );
    }
}
```

## 问答

**Q1: 反射的应用场景？**  
A: 框架开发（Spring IoC、MyBatis）、通用工具（JSON序列化）、IDE代码提示。

**Q2: 注解的RetentionPolicy三种类型？**  
A: SOURCE（仅源码）、CLASS（编译到class文件）、RUNTIME（运行时可通过反射获取）。

**Q3: 动态代理和静态代理的区别？**  
A: 静态代理需手动编写代理类；动态代理运行时生成代理类，更灵活，Spring AOP基于此实现。

---

# 附录：核心知识点速查表

## 访问修饰符

| 修饰符 | 同类 | 同包 | 子类 | 其他包 |
|--------|------|------|------|--------|
| private | ✓ | ✗ | ✗ | ✗ |
| default | ✓ | ✓ | ✗ | ✗ |
| protected | ✓ | ✓ | ✓ | ✗ |
| public | ✓ | ✓ | ✓ | ✓ |

## 集合对比

| 集合 | 有序 | 可重复 | 底层 | 线程安全 |
|------|------|--------|------|----------|
| ArrayList | ✓ | ✓ | 数组 | ✗ |
| LinkedList | ✓ | ✓ | 链表 | ✗ |
| HashSet | ✗ | ✗ | 哈希表 | ✗ |
| TreeSet | 排序 | ✗ | 红黑树 | ✗ |
| HashMap | ✗ | key不重复 | 哈希表 | ✗ |
| Hashtable | ✗ | key不重复 | 哈希表 | ✓ |
| ConcurrentHashMap | ✗ | key不重复 | 哈希表 | ✓（分段锁）|

## 线程状态转换

```
新建(new) → start() → 就绪(runnable) → 获取CPU → 运行(running)
                           ↑__________________________|
                           |                          |
                         调度                        阻塞(blocked)
                           |                          |
                           |←←←←←←←←←←←←←←←←←←←←←←←←←
                                              wait/sleep/IO
```

## 异常处理选择

| 场景 | 处理方式 |
|------|----------|
| 方法内可处理 | try-catch |
| 方法内无法处理 | throws |
| 必须执行清理 | finally / try-with-resources |
| 参数校验失败 | throw |

---

> 笔记整理完成，建议按Day顺序学习，每天配合代码练习加深理解。
