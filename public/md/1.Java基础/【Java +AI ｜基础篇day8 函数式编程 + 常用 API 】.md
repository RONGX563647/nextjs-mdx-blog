# 08 ⚡   Java Day08 Java面向对象编程进阶：函数式编程+API+面试题核心总结

> 💡 **核心提示**：函数式编程是 JDK8 引入的重要特性，Lambda 表达式和方法引用让代码更简洁优雅。本文系统讲解函数式编程、常用 API、GUI 编程的核心概念、语法要素、综合案例和高频面试题，帮你彻底掌握 Java 进阶编程技巧。

## 目录

- [一、函数式编程（JDK8+）](#一函数式编程jdk8)
  - [1. 函数式接口](#1-函数式接口)
  - [2. Lambda表达式简化规则](#2-lambda表达式简化规则)
  - [3. 方法引用（4种类型）](#3-方法引用4种类型)
- [二、常用API核心要点](#二常用api核心要点)
  - [1. String类（不可变对象）](#1-string类不可变对象)
  - [2. ArrayList类（动态数组）](#2-arraylist类动态数组)
  - [3. ArrayList扩容机制](#3-arraylist扩容机制)
- [三、GUI编程（Swing）要点](#三gui编程swing要点)
  - [1. 核心组件](#1-核心组件)
  - [2. 布局管理器](#2-布局管理器)
  - [3. 事件监听](#3-事件监听)
- [四、综合案例：员工管理系统设计](#四综合案例员工管理系统设计)
  - [1. 三层架构](#1-三层架构)
  - [2. 核心代码结构](#2-核心代码结构)
  - [3. 技术要点总结](#3-技术要点总结)
- [五、高频面试题核心答案](#五高频面试题核心答案)
- [六、快速记忆口诀](#六快速记忆口诀)
- [七、实战建议](#七实战建议)

---

## 一、函数式编程（JDK8+）

### 1. 函数式接口

- **定义**：只有一个抽象方法的接口
- **注解**：`@FunctionalInterface`（可选，推荐使用）
- **常见内置接口**：
  - `Runnable` → `() -> void`
  - `Comparator` → `(T, T) -> int`
  - `Function` → `T -> R`
  - `Predicate` → `T -> boolean`
  - `Consumer` → `T -> void`
  - `Supplier` → `() -> T`

### 2. Lambda表达式简化规则

text

```
匿名内部类 → Lambda完整 → Lambda最简
```

java

```
// 完整演进示例（Comparator排序）
// 1. 匿名内部类
new Comparator<Student>() {
    @Override
    public int compare(Student s1, Student s2) {
        return s1.getAge() - s2.getAge();
    }
}

// 2. Lambda完整
(Student s1, Student s2) -> {
    return s1.getAge() - s2.getAge();
}

// 3. Lambda最简
(s1, s2) -> s1.getAge() - s2.getAge()
```

**Lambda表达式演进图：**

```
┌─────────────────────────────────────────────────────────────┐
│              Lambda表达式演进过程                  │
│                                                             │
│   阶段1：匿名内部类（传统方式）                              │
│   ┌─────────────────────────────────────────────┐           │
│   │   new Comparator<Student>() {             │           │
│   │       @Override                        │           │
│   │       public int compare(Student s1,      │           │
│   │                               Student s2) {│           │
│   │           return s1.getAge() -         │           │
│   │                  s2.getAge();         │           │
│   │       }                                │           │
│   │   }                                     │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   阶段2：Lambda完整表达式（简化类名和方法名）                │
│   ┌─────────────────────────────────────────────┐           │
│   │   (Student s1, Student s2) -> {        │           │
│   │       return s1.getAge() -             │           │
│   │              s2.getAge();             │           │
│   │   }                                     │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   阶段3：Lambda最简表达式（省略return和大括号）             │
│   ┌─────────────────────────────────────────────┐           │
│   │   (s1, s2) -> s1.getAge() -          │           │
│   │              s2.getAge()              │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   简化规则：                                                │
│   • 省略参数类型（类型推断）                                │
│   • 单个参数可省略括号：(s) -> s.length()                   │
│   • 单行语句可省略return和大括号                              │
│   • 方法体只有一行时，return和{}都可省略                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. 方法引用（4种类型）

| 类型     | 语法             | 示例                | 等价Lambda                 |
| -------- | ---------------- | ------------------- | -------------------------- |
| 静态方法 | `类名::静态方法` | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| 实例方法 | `对象::实例方法` | `str::toUpperCase`  | `() -> str.toUpperCase()`  |
| 特定类型 | `类名::实例方法` | `String::length`    | `s -> s.length()`          |
| 构造器   | `类名::new`      | `ArrayList::new`    | `() -> new ArrayList<>()`  |

------

## 二、常用API核心要点

### 1. String类（不可变对象）

java

```
// 核心特性
String s = "Hello";
s = s + " World";  // 创建新对象，原对象不变

// 常量池机制
String s1 = "abc";              // 常量池
String s2 = new String("abc");  // 堆内存新对象
String s3 = s2.intern();        // 手动入池
System.out.println(s1 == s3);   // true（同常量池）

// 常用方法
s.length();      // 长度
s.substring(0,5);  // 截取
s.split(" ");    // 分割
s.replace("a","b");  // 替换
s.contains("ll");    // 包含判断
s.equals(s2);    // 内容比较（非==）
```

### 2. ArrayList类（动态数组）

java

```
List<String> list = new ArrayList<>();

// 核心方法
list.add("A");          // 添加
list.get(0);            // 获取
list.set(0, "B");       // 修改
list.remove(0);         // 删除
list.size();            // 大小
list.contains("A");     // 包含判断

// 遍历方式对比
// 1. 普通for（适合随机访问）
for (int i = 0; i < list.size(); i++) { }

// 2. 增强for（简单遍历）
for (String s : list) { }

// 3. 迭代器（可安全删除）
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (条件) it.remove();  // 安全删除
}

// 4. Lambda（JDK8+）
list.forEach(s -> System.out.println(s));
```

### 3. ArrayList扩容机制

- **初始容量**：10（空构造器）
- **扩容规则**：1.5倍（`newCapacity = oldCapacity + (oldCapacity >> 1)`）
- **扩容时机**：添加元素时，`size >= capacity`
- **性能建议**：预估容量，避免频繁扩容

------

## 三、GUI编程（Swing）要点

### 1. 核心组件

java

```
JFrame frame = new JFrame("标题");  // 窗口
JButton button = new JButton("确定");  // 按钮
JTextField textField = new JTextField(20);  // 输入框
JLabel label = new JLabel("标签");  // 标签
JTextArea textArea = new JTextArea(10, 30);  // 文本域
JTable table = new JTable(model);  // 表格
```

### 2. 布局管理器

java

```
// 1. 流式布局（默认）
frame.setLayout(new FlowLayout());

// 2. 边界布局（东/西/南/北/中）
frame.setLayout(new BorderLayout());
frame.add(component, BorderLayout.NORTH);

// 3. 网格布局（行列固定）
frame.setLayout(new GridLayout(2, 3));  // 2行3列
```

### 3. 事件监听

java

```
button.addActionListener(e -> {
    // 按钮点击事件
    String input = textField.getText();
    // 处理逻辑
});

// 传统方式
button.addActionListener(new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        // 事件处理
    }
});
```

------

## 四、综合案例：员工管理系统设计

### 1. 三层架构

text

```
实体层（Employee）
   ↓
数据访问层（EmployeeDAO接口 + 实现）
   ↓
表示层（Swing GUI）
```

### 2. 核心代码结构

java

```
// 1. 实体类（封装数据）
class Employee {
    private int id;
    private String name;
    private String job;
    private String dept;
    // getter/setter + toString
}

// 2. DAO接口（定义规范）
interface EmployeeDAO {
    void add(Employee emp);
    List<Employee> queryAll();
    boolean delete(int id);
}

// 3. DAO实现（ArrayList存储）
class EmployeeDAOImpl implements EmployeeDAO {
    private List<Employee> empList = new ArrayList<>();
    private int nextId = 1;
    // 实现接口方法
}

// 4. GUI界面（Swing）
class EmployeeFrame extends JFrame {
    private EmployeeDAO dao;
    private JTable table;
    // 初始化组件、绑定事件、刷新表格
}
```

### 3. 技术要点总结

1. **封装性**：实体类私有字段 + 公共访问方法
2. **多态性**：DAO接口 + 多种实现（可扩展其他存储方式）
3. **开闭原则**：新增功能只需扩展，无需修改现有代码
4. **异常处理**：输入校验、操作提示
5. **数据绑定**：表格模型与数据同步

------

## 五、高频面试题核心答案

### 1. 方法重写规则

1. **方法签名**：方法名+参数列表必须相同
2. **访问权限**：子类 ≥ 父类（public > protected > default > private）
3. **返回类型**：协变返回（子类可返回父类返回值的子类）
4. **异常**：不能抛出更宽泛的受检异常
5. **不能重写**：private、static、final方法

### 2. 子类构造器规则

java

```
class Parent {
    public Parent(String name) { }  // 只有有参构造
}

class Child extends Parent {
    public Child() {
        super("默认");  // 必须显式调用父类构造器
    }
}
```

- 子类构造器第一行必须是`super(...)`或`this(...)`
- 父类若无无参构造器，子类必须显式调用有参构造器

### 3. 多态：属性 vs 方法

java

```
class Parent {
    String name = "父类";
    void say() { System.out.println("父类方法"); }
}

class Child extends Parent {
    String name = "子类";  // 隐藏父类属性
    void say() { System.out.println("子类方法"); }  // 重写方法
}

// 测试
Parent p = new Child();
System.out.println(p.name);  // 输出"父类"（属性静态绑定）
p.say();  // 输出"子类方法"（方法动态绑定）
```

### 4. 向下转型安全方案

java

```
Parent p = getObject();  // 可能返回Child实例

// 不安全：直接转型
Child c = (Child) p;  // 可能ClassCastException

// 安全：instanceof检查
if (p instanceof Child) {
    Child c = (Child) p;
    c.childMethod();  // 调用子类特有方法
}
```

### 5. final关键字

- **修饰类**：不可继承（如String、Integer）
- **修饰方法**：不可重写
- **修饰变量**：
  - 基本类型：值不可变
  - 引用类型：引用不可变，对象内容可变
- **初始化时机**：声明时、构造器中、初始化块中

### 6. 抽象类 vs 接口

| 维度     | 抽象类            | 接口（JDK8+）                 |
| -------- | ----------------- | ----------------------------- |
| 方法     | 可有抽象/具体方法 | 默认方法、静态方法、私有方法  |
| 变量     | 任意类型变量      | 只能是public static final常量 |
| 构造器   | 有                | 无                            |
| 继承     | 单继承            | 多实现                        |
| 设计目的 | "是什么"（is-a）  | "能做什么"（has-a）           |

### 7. 单例模式实现

java

```
// 1. 饿汉式（线程安全）
class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() { }
    public static Singleton getInstance() { return INSTANCE; }
}

// 2. 懒汉式（DCL双重检查锁）
class Singleton {
    private static volatile Singleton instance;
    private Singleton() { }
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

// 3. 枚举式（推荐，防反射/序列化破坏）
enum Singleton {
    INSTANCE;
    public void doSomething() { }
}
```

### 8. 枚举类特性

- 本质是继承`Enum`的类
- 构造器私有
- 实例是预定义的常量
- 提供`values()`、`valueOf()`等方法
- 可添加方法、实现接口

### 9. 代码块执行顺序

java

```
父类静态块 → 子类静态块 → 
父类实例块 → 父类构造器 → 
子类实例块 → 子类构造器
```

- 静态块：类加载时执行一次
- 实例块：每次创建对象时执行

### 10. 内部类分类

| 类型       | 特点                           | 创建方式                  |
| ---------- | ------------------------------ | ------------------------- |
| 成员内部类 | 依赖外部实例，可访问所有成员   | `outer.new Inner()`       |
| 静态内部类 | 不依赖外部实例，仅访问静态成员 | `new Outer.Inner()`       |
| 局部内部类 | 方法内定义，作用域限于方法     | 方法内部定义              |
| 匿名内部类 | 一次性实现，无类名             | `new Interface() { ... }` |

### 11. Lambda表达式核心

- **前提**：函数式接口（一个抽象方法）
- **语法**：`(参数) -> { 方法体 }`
- **简化**：
  - 参数类型可省略
  - 单参数可省略括号
  - 单行代码可省略`{}`和`return`

### 12. 方法引用使用场景

- Lambda体仅调用一个已有方法时
- 方法签名与函数式接口匹配
- 四种引用方式对应不同场景

### 13. OOP设计原则

1. **封装**：私有字段 + 公共接口
2. **继承**：抽取共性，代码复用
3. **多态**：接口编程，扩展灵活
4. **开闭原则**：对扩展开放，对修改关闭

------

## 六、快速记忆口诀

### 函数式编程

- 一个接口一个法，Lambda表达式来简化
- 箭头左边是参数，右边代码是方法体
- 方法引用更简洁，双冒号来替代

### String特性

- String对象不可变，拼接操作新对象
- 常量池里存一份，equals比较内容等
- ==比较是地址，想要相等用intern

### ArrayList要点

- 动态数组可扩容，默认大小是十个
- 满了扩容一点五，性能考虑预分配
- 遍历方式有多种，迭代删除最安全

### 多态核心

- 编译看左边，运行看右边
- 属性静态绑，方法动态绑
- 向下转型要小心，instanceof保平安

### 面试重点

- 重写规则要记牢，权限返回不能错
- 抽象接口区别大，单例模式三写法
- 代码执行顺序清，静态先行实例后

------

## 七、实战建议

1. **函数式编程**：从Comparator排序入手，逐步掌握Lambda和方法引用
2. **String操作**：理解不可变性，避免在循环中拼接字符串
3. **集合选择**：根据场景选择合适集合，掌握遍历和删除技巧
4. **GUI编程**：作为综合练习，理解事件驱动模型
5. **设计模式**：掌握单例、工厂等常用模式
6. **代码规范**：遵循命名规范，编写可读性高的代码

**最后提示**：理解原理比记忆语法更重要，多写代码多思考，面试时结合具体场景回答问题，展示解决问题的能力。

------

------

# Java 面向对象编程（OOP）进阶篇③：函数式编程 + 常用 API + 综合案例 + 15 道高频面试题

（初学者友好 + 可运行代码 + 面试题详解）

## 前言

初学 Java 函数式编程时，我看不懂 Lambda 表达式的简化规则、方法引用的适用场景，面试时面对综合案例题无从下手 —— 函数式编程是 JDK8+ 的核心特性，常用 API（String、ArrayList）是开发必备，综合案例则是检验 OOP 掌握程度的关键。这篇内容把函数式编程、常用 API、GUI 编程和 15 道难度递增的面试题拆解清楚，所有代码极简可运行，帮新手从理论落地到实践，应对面试和开发场景。

## 一、核心思路 / 概念（大白话讲透）

- 函数式编程：核心是「关注做什么，而非怎么做」—— 通过 Lambda 表达式和方法引用简化代码，基于函数式接口实现，告别冗余的匿名内部类。
- String 类：核心是「不可变字符串」—— 创建后内容不能改，常量池避免重复创建，是开发中最常用的类。
- ArrayList 类：核心是「动态数组」—— 支持自动扩容，是存储数据的首选集合。
- GUI 编程（Swing）：核心是「图形化界面」—— 用组件和布局管理器搭建界面，事件监听处理用户操作（虽日常开发少用，但适合练手）。

## 二、实操步骤 + 可运行代码

### 2.1 函数式编程（JDK8+）

函数式编程的核心是「行为参数化」，依赖**函数式接口**（仅含一个抽象方法的接口），通过 Lambda 表达式和方法引用简化代码，替代冗余的匿名内部类。

#### 2.1.1 核心前提：函数式接口

函数式接口是 Lambda 的基础，JDK8 提供 `@FunctionalInterface` 注解校验（可选但推荐），JDK 内置了大量函数式接口（如 `Comparator`、`Supplier`、`Function`）。

java

运行

```
// 自定义函数式接口示例
@FunctionalInterface
interface MyComparator<T> {
    int compare(T t1, T t2); // 唯一抽象方法
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 2.1.2 Lambda 表达式（简化匿名内部类）

**核心简化规则**（从完整到最简，一步到位）：

| 简化步骤        | 示例（Comparator 排序）                                      | 说明                                     |
| --------------- | ------------------------------------------------------------ | ---------------------------------------- |
| 匿名内部类      | `new Comparator() { @Override public int compare(Student s1, Student s2) { return s1.age - s2.age; } }` | 原始写法，冗余代码多                     |
| Lambda 完整写法 | `(Student s1, Student s2) -> { return s1.age - s2.age; }`    | 保留核心逻辑，去掉接口和 new 关键字      |
| Lambda 最简写法 | `(s1, s2) -> s1.age - s2.age`                                | 省略参数类型、大括号、return（单行逻辑） |

**完整可运行示例**：

java

运行

```
import java.util.Arrays;
import java.util.Comparator;

class Student {
    String name;
    int age;
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    @Override
    public String toString() { return name + "，" + age + "岁"; }
}

public class LambdaDemo {
    public static void main(String[] args) {
        Student[] students = {new Student("张三",20), new Student("李四",18), new Student("王五",19)};
        
        // 1. 匿名内部类（原始）
        Arrays.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student s1, Student s2) {
                return s1.age - s2.age;
            }
        });
        System.out.println("匿名内部类排序：" + Arrays.toString(students));
        
        // 2. Lambda最简写法（降序）
        Arrays.sort(students, (s1, s2) -> s2.age - s1.age);
        System.out.println("Lambda最简写法：" + Arrays.toString(students));
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

**运行结果**：

plaintext

```
匿名内部类排序：[李四，18岁, 王五，19岁, 张三，20岁]
Lambda最简写法：[张三，20岁, 王五，19岁, 李四，18岁]
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 2.1.3 方法引用（Lambda 进一步简化）

当 Lambda 体**仅调用一个已有方法**时，用方法引用进一步简化，分为 4 类：

| 类型             | 语法               | 示例                | 等价 Lambda                |
| ---------------- | ------------------ | ------------------- | -------------------------- |
| 静态方法引用     | 类名：：静态方法名 | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| 实例方法引用     | 对象：：实例方法名 | `str::toUpperCase`  | `() -> str.toUpperCase()`  |
| 特定类型方法引用 | 类名：：实例方法名 | `String::length`    | `s -> s.length()`          |
| 构造器引用       | 类名::new          | `ArrayList::new`    | `() -> new ArrayList<>()`  |

**完整可运行示例**：

java

运行

```
import java.util.Arrays;
import java.util.ArrayList;
import java.util.function.Supplier;

public class MethodRefDemo {
    // 静态方法（用于静态方法引用）
    public static int compareAge(Student s1, Student s2) {
        return s1.age - s2.age;
    }

    public static void main(String[] args) {
        Student[] students = {new Student("张三",20), new Student("李四",18)};
        
        // 1. 静态方法引用（排序）
        Arrays.sort(students, MethodRefDemo::compareAge);
        System.out.println("静态方法引用排序：" + Arrays.toString(students));
        
        // 2. 特定类型方法引用（字符串按长度排序）
        String[] strs = {"apple", "banana", "cherry"};
        Arrays.sort(strs, String::length);
        System.out.println("特定类型方法引用：" + Arrays.toString(strs));
        
        // 3. 构造器引用（创建集合）
        Supplier<ArrayList<String>> sup = ArrayList::new;
        System.out.println("构造器引用创建集合：" + sup.get().isEmpty()); // 输出true
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

### 2.2 常用 API（开发必备）

#### 2.2.1 String 类（核心：不可变性 + 常量池）

- **不可变性**：String 被 `final` 修饰，内部字符数组 `private final char value[]` 无修改方法，保证线程安全和常量池优化。
- **常量池**：相同字符串仅存一份，`intern()` 方法可手动将字符串入池。
- **核心方法 + 常量池完整示例**：

java

运行

```
public class StringDemo {
    public static void main(String[] args) {
        String s = "Hello World";
        // 核心方法演示
        System.out.println("字符串长度：" + s.length()); // 输出：11
        System.out.println("截取前5个字符：" + s.substring(0,5)); // 输出：Hello
        System.out.println("替换字符：" + s.replace("World", "Java")); // 输出：Hello Java
        System.out.println("是否包含指定字符：" + s.contains("World")); // 输出：true
        System.out.println("分割字符串：" + Arrays.toString(s.split(" "))); // 输出：[Hello, World]
        
        // 常量池关键：==比较引用，equals比较内容
        String s1 = "abc";
        String s2 = new String("abc").intern(); // 手动入池
        String s3 = new String("abc"); // 堆内存新对象
        System.out.println("s1 == s2：" + (s1 == s2)); // 输出：true（同常量池）
        System.out.println("s1 == s3：" + (s1 == s3)); // 输出：false（地址不同）
        System.out.println("s1.equals(s3)：" + s1.equals(s3)); // 输出：true（内容相同）
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 2.2.2 ArrayList 类（核心：动态数组 + 扩容）

- **底层原理**：基于数组实现，默认初始容量 10，满后扩容为原容量的 1.5 倍（`newCapacity = oldCapacity + (oldCapacity >> 1)`）。
- **核心方法 + 遍历完整示例**：

java

运行

```
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ArrayListDemo {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        // 增删改查基础操作
        list.add("a"); // 添加元素
        list.add("b");
        list.add("c");
        System.out.println("初始集合：" + list); // 输出：[a, b, c]
        
        list.set(1, "d"); // 修改索引1的元素
        System.out.println("修改后集合：" + list); // 输出：[a, d, c]
        
        list.remove(0); // 删除索引0的元素
        System.out.println("删除后集合：" + list); // 输出：[d, c]
        
        System.out.println("索引1的元素：" + list.get(1)); // 输出：c
        System.out.println("集合大小：" + list.size()); // 输出：2
        
        // 三种遍历方式
        System.out.println("\n1. 普通for循环遍历：");
        for (int i = 0; i < list.size(); i++) {
            System.out.print(list.get(i) + " "); // 输出：d c
        }
        
        System.out.println("\n2. 增强for循环遍历：");
        for (String str : list) {
            System.out.print(str + " "); // 输出：d c
        }
        
        System.out.println("\n3. 迭代器遍历（删除安全）：");
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            String str = it.next();
            System.out.print(str + " "); // 输出：d c
            if (str.equals("d")) {
                it.remove(); // 迭代器删除不会报错
            }
        }
        System.out.println("\n迭代器删除后：" + list); // 输出：[c]
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 2.2.3 GUI 编程（Swing 完整示例）

补充带布局、事件处理的完整 Swing 示例，新手可直接运行：

java

运行

```
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class SwingDemo {
    public static void main(String[] args) {
        // 确保Swing组件在事件调度线程中创建
        SwingUtilities.invokeLater(() -> {
            // 1. 创建窗口
            JFrame frame = new JFrame("简易员工管理界面");
            frame.setSize(500, 300);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setLocationRelativeTo(null); // 居中显示
            frame.setLayout(new FlowLayout(FlowLayout.CENTER, 20, 30)); // 流式布局
            
            // 2. 创建组件
            JLabel nameLabel = new JLabel("员工姓名：");
            JTextField nameText = new JTextField(15); // 输入框
            JButton addBtn = new JButton("添加员工");
            JTextArea showArea = new JTextArea(10, 30); // 文本域（显示结果）
            showArea.setEditable(false); // 不可编辑
            JScrollPane scrollPane = new JScrollPane(showArea); // 滚动面板
            
            // 3. 事件监听（按钮点击逻辑）
            addBtn.addActionListener(new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    String name = nameText.getText().trim();
                    if (name.isEmpty()) {
                        JOptionPane.showMessageDialog(frame, "姓名不能为空！", "提示", JOptionPane.WARNING_MESSAGE);
                        return;
                    }
                    // 追加到文本域
                    showArea.append("添加成功：" + name + "\n");
                    nameText.setText(""); // 清空输入框
                }
            });
            
            // 4. 组装组件
            frame.add(nameLabel);
            frame.add(nameText);
            frame.add(addBtn);
            frame.add(scrollPane);
            
            // 5. 显示窗口
            frame.setVisible(true);
        });
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

### 2.3 综合案例：员工信息管理系统（完整可运行）

#### 2.3.1 员工实体类（Employee.java）

java

运行

```
public class Employee {
    private int id; // 员工ID（自增）
    private String name; // 姓名
    private String job; // 职位
    private String dept; // 部门
    
    // 无参构造器
    public Employee() {}
    
    // 有参构造器（ID除外，自动生成）
    public Employee(String name, String job, String dept) {
        this.name = name;
        this.job = job;
        this.dept = dept;
    }
    
    // getter/setter方法
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }
    
    // 重写toString（便于打印）
    @Override
    public String toString() {
        return "Employee{id=" + id + ", name='" + name + "', job='" + job + "', dept='" + dept + "'}";
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 2.3.2 数据访问接口 + 实现（DAO 层）

java

运行

```
// EmployeeDAO.java（接口：定义规范）
import java.util.List;
public interface EmployeeDAO {
    void add(Employee emp); // 添加员工
    List<Employee> queryAll(); // 查询所有员工
    boolean delete(int id); // 根据ID删除员工
}

// EmployeeDAOImpl.java（实现类：具体逻辑）
import java.util.ArrayList;
import java.util.List;
public class EmployeeDAOImpl implements EmployeeDAO {
    private List<Employee> empList = new ArrayList<>(); // 存储员工数据
    private int nextId = 1; // 自增ID（从1开始）
    
    @Override
    public void add(Employee emp) {
        emp.setId(nextId++); // 分配ID并自增
        empList.add(emp);
    }
    
    @Override
    public List<Employee> queryAll() {
        return new ArrayList<>(empList); // 返回副本，避免外部修改原集合
    }
    
    @Override
    public boolean delete(int id) {
        for (Employee emp : empList) {
            if (emp.getId() == id) {
                empList.remove(emp);
                return true; // 删除成功
            }
        }
        return false; // 未找到员工
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 2.3.3 GUI 界面（EmployeeFrame.java）

java

运行

```
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class EmployeeFrame extends JFrame {
    private EmployeeDAO empDAO = new EmployeeDAOImpl(); // DAO实例
    private DefaultTableModel tableModel; // 表格模型
    // 输入框组件
    private JTextField nameText, jobText, deptText, deleteIdText;
    
    public EmployeeFrame() {
        // 1. 窗口初始化
        setTitle("员工信息管理系统");
        setSize(800, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10)); // 边界布局（上下左右中）
        
        // 2. 顶部面板（添加员工功能）
        JPanel topPanel = new JPanel();
        topPanel.add(new JLabel("姓名："));
        nameText = new JTextField(10);
        topPanel.add(nameText);
        
        topPanel.add(new JLabel("职位："));
        jobText = new JTextField(10);
        topPanel.add(jobText);
        
        topPanel.add(new JLabel("部门："));
        deptText = new JTextField(10);
        topPanel.add(deptText);
        
        JButton addBtn = new JButton("添加员工");
        topPanel.add(addBtn);
        
        // 3. 中间面板（表格显示员工数据）
        String[] tableColumns = {"员工ID", "姓名", "职位", "部门"};
        tableModel = new DefaultTableModel(tableColumns, 0); // 0行初始数据
        JTable empTable = new JTable(tableModel);
        empTable.setRowHeight(25); // 行高
        JScrollPane scrollPane = new JScrollPane(empTable); // 滚动面板
        
        // 4. 底部面板（删除+刷新功能）
        JPanel bottomPanel = new JPanel();
        bottomPanel.add(new JLabel("删除ID："));
        deleteIdText = new JTextField(5);
        bottomPanel.add(deleteIdText);
        
        JButton deleteBtn = new JButton("删除员工");
        bottomPanel.add(deleteBtn);
        
        JButton refreshBtn = new JButton("刷新表格");
        bottomPanel.add(refreshBtn);
        
        // 5. 组装所有面板
        add(topPanel, BorderLayout.NORTH); // 顶部
        add(scrollPane, BorderLayout.CENTER); // 中间
        add(bottomPanel, BorderLayout.SOUTH); // 底部
        
        // 6. 绑定事件
        addBtn.addActionListener(e -> addEmployee());
        deleteBtn.addActionListener(e -> deleteEmployee());
        refreshBtn.addActionListener(e -> refreshTable());
        
        // 7. 初始化表格数据
        refreshTable();
        
        // 8. 显示窗口
        setVisible(true);
    }
    
    // 添加员工逻辑
    private void addEmployee() {
        String name = nameText.getText().trim();
        String job = jobText.getText().trim();
        String dept = deptText.getText().trim();
        
        // 校验输入
        if (name.isEmpty() || job.isEmpty() || dept.isEmpty()) {
            JOptionPane.showMessageDialog(this, "请填写完整信息！", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        // 调用DAO添加
        empDAO.add(new Employee(name, job, dept));
        JOptionPane.showMessageDialog(this, "添加成功！");
        
        // 刷新表格+清空输入框
        refreshTable();
        nameText.setText("");
        jobText.setText("");
        deptText.setText("");
    }
    
    // 删除员工逻辑
    private void deleteEmployee() {
        try {
            int id = Integer.parseInt(deleteIdText.getText().trim());
            if (empDAO.delete(id)) {
                JOptionPane.showMessageDialog(this, "删除成功！");
            } else {
                JOptionPane.showMessageDialog(this, "未找到该ID的员工！", "错误", JOptionPane.ERROR_MESSAGE);
            }
            // 刷新表格+清空输入框
            refreshTable();
            deleteIdText.setText("");
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "ID必须是数字！", "错误", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    // 刷新表格数据
    private void refreshTable() {
        tableModel.setRowCount(0); // 清空原有数据
        List<Employee> empList = empDAO.queryAll(); // 查询所有员工
        for (Employee emp : empList) {
            // 新增一行数据
            tableModel.addRow(new Object[]{
                emp.getId(), emp.getName(), emp.getJob(), emp.getDept()
            });
        }
    }
    
    // 主方法（启动程序）
    public static void main(String[] args) {
        // 在事件调度线程中创建界面
        SwingUtilities.invokeLater(EmployeeFrame::new);
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

## 三、15 道 OOP 高级面试题（详细详解）

| 题号 | 核心考点           | 详细详解                                                     |
| ---- | ------------------ | ------------------------------------------------------------ |
| 1    | 方法重写规则       | 1. 方法名、参数列表必须与父类完全一致；2. 子类方法权限 ≥ 父类（如父类是 protected，子类可是 public）；3. 返回值协变（子类返回值是父类返回值的子类，如父类返回 Object，子类可返回 String）；4. 不能抛出比父类更宽泛的受检异常（如父类抛 IOException，子类不能抛 Exception）；5. 例外：private / 静态方法不能重写（子类是重新定义，非重写）。 |
| 2    | 子类构造器规则     | 1. 子类构造器默认隐式调用父类无参构造器（`super()`），且必须是第一行代码；2. 若父类无无参构造器，子类必须显式调用父类有参构造器（`super(参数)`）；3. `this()`（调用自身其他构造器）和 `super()` 不能共存（都要求第一行）；4. 子类构造器执行顺序：先执行父类构造器，再执行自身构造逻辑。 |
| 3    | 多态的属性 vs 方法 | 1. 方法：动态绑定（运行时根据实际对象类型执行，体现多态）；2. 属性：静态绑定（编译时根据引用类型确定，无多态）；示例：`Parent p = new Child();` → `p.name` 取 Parent 的属性，`p.say()` 执行 Child 的方法。 |
| 4    | 向下转型           | 1. 定义：父类引用转子类类型（`Child c = (Child) p;`），用于获取子类特有方法；2. 风险：若父类引用的对象不是子类实例，会抛出 `ClassCastException`；3. 解决方案：转型前用 `instanceof` 校验（`if (p instanceof Child) { 转型操作 }`），避免异常。 |
| 5    | final 关键字       | 1. 修饰类：不可继承（如 String、Integer，避免被修改核心逻辑）；2. 修饰方法：不可重写（子类不能修改父类该方法的实现）；3. 修饰变量：赋值后不可改（基本类型值不变，引用类型地址不变）； - 成员变量：需在声明、构造器、初始化块中赋值； - 局部变量：声明后可延迟赋值，但仅能赋值一次；4. `static final`：全局常量，类加载时初始化，必须显式赋值。 |
| 6    | 抽象类             | 1. 用 `abstract` 修饰，不能直接创建对象（`new AbstractClass()` 报错）；2. 可包含：抽象方法（无方法体，`abstract void method();`）、普通方法、成员变量、构造器；3. 子类规则：必须实现所有抽象方法，否则子类也需用 `abstract` 修饰（成为抽象类）；4. 用途：抽取共性逻辑（普通方法），定义子类必须实现的规范（抽象方法）。 |
| 7    | 接口 JDK8+ 新特性  | 1. JDK8 前：仅含抽象方法（默认 public abstract）和常量（默认 public static final）；2. JDK8 新增： - 默认方法（`default void method() {}`）：有方法体，子类可重写，也可直接使用； - 静态方法（`static void method() {}`）：接口名直接调用（`InterfaceName.method()`），子类不能重写；3. JDK9 新增：私有方法（`private void method() {}`）：仅接口内部复用逻辑，子类不可见。 |
| 8    | 抽象类 vs 接口     |                                                              |
|      |                    |                                                              |
| 9    | 单例模式           | 1. 核心：确保一个类仅有一个实例，提供全局访问点；2. 常见实现： - 饿汉式：类加载时创建实例（`private static final Singleton INSTANCE = new Singleton();`），线程安全但无懒加载； - 懒汉式（DCL）：双重检查锁 + volatile（`private static volatile Singleton INSTANCE;`），线程安全且懒加载； - 枚举单例：`enum Singleton { INSTANCE; }`，最安全（防反射、序列化破坏），推荐使用；3. 应用场景：工具类、线程池、数据库连接池等。 |
| 10   | 枚举类             | 1. 本质：特殊的类，默认继承 `Enum` 类，不可继承其他类（可实现接口）；2. 特性： - 构造器私有（不能外部创建实例）； - 常量是唯一实例（`enum Color { RED, GREEN; }`）； - 提供 `values()` 方法（返回所有常量数组）、`valueOf(String name)` 方法（按名称获取常量）；3. 优势：类型安全（避免传入非法值），替代 int 常量（可读性更高）。 |
| 11   | 代码块执行顺序     | 完整顺序（从父类到子类）：1. 父类静态代码块 → 子类静态代码块（类加载时执行，仅一次）；2. 父类实例代码块 → 父类构造器 → 子类实例代码块 → 子类构造器（每次创建对象执行）；示例：`java class Parent { static {System.out.println("父静态");} {System.out.println("父实例");} public Parent() {System.out.println("父构造");}} class Child extends Parent { static {System.out.println("子静态");} {System.out.println("子实例");} public Child() {System.out.println("子构造");}} new Child(); // 输出：父静态→子静态→父实例→父构造→子实例→子构造 ` |
| 12   | 内部类             | 1. 成员内部类： - 依赖外部类实例（`Outer outer = new Outer(); Outer.Inner inner = outer.new Inner();`）； - 可访问外部类所有成员（包括 private）；2. 静态内部类： - 不依赖外部类实例（`Outer.Inner inner = new Outer.Inner();`）； - 仅能访问外部类静态成员；3. 匿名内部类： - 简化一次性接口 / 抽象类实现（无类名）； - 不能有构造器，仅能使用一次；4. 局部内部类： - 定义在方法内部，作用域仅限方法内； - 不能用 public/protected/private/static 修饰。 |
| 13   | Lambda 表达式      | 1. 前提：必须基于函数式接口（仅一个抽象方法）；2. 语法：`(参数列表) -> { 代码体 }`；3. 简化规则： - 参数类型可省略（编译器自动推断）； - 单参数可省略括号（`s -> s.length()`）； - 代码体仅一行可省略大括号和 return（`(a,b) -> a + b`）；4. 本质：函数式接口的匿名实现类实例。 |
| 14   | 方法引用           | 1. 核心：Lambda 的简化版，仅当 Lambda 体只调用一个已有方法时使用；2. 分类及语法： - 静态方法引用：`类名::静态方法名`（如 `Integer::parseInt`）； - 实例方法引用：`对象::实例方法名`（如 `str::toUpperCase`）； - 特定类型方法引用：`类名::实例方法名`（如 `String::length`）； - 构造器引用：`类名::new`（如 `ArrayList::new`）；3. 注意：方法参数列表、返回值需与函数式接口的抽象方法一致。 |
| 15   | OOP 综合设计       | 1. 核心原则：体现封装、继承、多态，遵循开闭原则（对扩展开放，对修改关闭）；2. 设计思路： - 封装：私有化成员变量，提供 getter/setter，隐藏实现细节； - 多态：父类 / 接口引用指向子类实例，新增功能只需新增子类； - 接口：定义规范，解耦实现（如 DAO 接口 + 不同数据库实现类）；3. 示例：员工管理系统中，新增 “修改员工” 功能，只需在 DAO 接口添加 `update` 方法，实现类补充逻辑，无需修改原有查询 / 删除代码。 |

## 四、总结

- 函数式编程核心：Lambda 基于函数式接口简化匿名内部类，方法引用是 Lambda 的进阶简化，核心是 “行为参数化”，让代码更简洁高效；
- 常用 API 核心：String 不可变 + 常量池优化（比较用 `equals()`），ArrayList 动态扩容（尾部增删高效），是开发中最基础、最常用的工具；
- 综合案例核心：通过接口定义规范（DAO）、ArrayList 存储数据、Swing 搭建界面，完整体现 OOP 的封装、多态和开闭原则，帮你从 “语法” 落地到 “应用”；
- 面试核心：重点掌握方法重写、多态、抽象类 vs 接口、单例模式、Lambda / 方法引用，理解底层逻辑而非死记硬背，应对面试和开发场景都够用。