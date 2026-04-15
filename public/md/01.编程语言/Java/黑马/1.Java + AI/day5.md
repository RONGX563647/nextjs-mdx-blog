# 【Java +AI ｜基础篇day5 面对对象基础】

## 一、核心概述

面向对象编程（OOP）是 Java 的核心编程思想，核心原则是 **“万物皆对象，谁的数据谁存储”**—— 将现实事物抽象为 “对象”，对象包含事物的 “数据”（成员变量）和 “行为”（成员方法），通过类（对象的模板）创建对象，实现数据与逻辑的封装，提升代码复用性和可维护性。

## 二、类与对象（OOP 基础）

### 1. 核心概念

- **类**：对象的 “设计图 / 模板”，定义对象的成员变量（数据）和成员方法（行为），是抽象的概念。
- **对象**：类的实例化结果，是具体的事物，占用实际内存，每个对象的成员变量独立存储（实例变量）。

### 2. 类的定义格式

java

```java
public class 类名 {
    // 1. 成员变量（数据）：描述对象的属性
    数据类型 变量名;
    
    // 2. 成员方法（行为）：描述对象的功能
    public 返回值类型 方法名(参数列表) {
        方法体;
    }
}
```

示例（学生类）：

java

```java
public class Student {
    // 成员变量（数据）
    String name; // 姓名
    double chinese; // 语文成绩
    double math; // 数学成绩
    
    // 成员方法（行为）
    public void printTotalScore() {
        System.out.println(name + "的总分：" + (chinese + math));
    }
}
```

### 3. 对象的创建与使用

- **创建对象**：`类名 对象名 = new 类名();`（new 关键字触发对象初始化）

- 使用对象

  ：

  - 访问成员变量：`对象名.变量名`（如`s1.name = "播妞"`）
  - 调用成员方法：`对象名.方法名()`（如`s1.printTotalScore()`）

### 4. 内存模型（核心理解）

- **方法区**：存储类的字节码（如`Student.class`），包含成员变量定义、方法定义。

- **堆内存**：存储对象的实例数据（成员变量的具体值），每个对象独立占用一块堆空间。

- **栈内存**：存储对象引用（对象名），指向堆内存的对象地址。

  

## 三、核心语法要素

### 1. 构造器（Constructor）

#### （1）核心作用

创建对象时**初始化成员变量**，无需手动调用，通过`new 类名()`自动触发。

#### （2）关键特点

- 构造器名称必须与类名完全一致，无返回值类型（连`void`都不写）。
- 类默认自带一个**无参构造器**，若自定义了构造器，默认无参构造器会失效（需手动显式定义）。

#### （3）常见格式

java

```java
// 无参构造器（手动定义，避免自定义有参构造器后失效）
public 类名() {}

// 有参构造器（初始化成员变量）
public 类名(参数类型1 参数1, 参数类型2 参数2) {
    this.参数1 = 参数1; // this解决变量名冲突
    this.参数2 = 参数2;
}
```

#### （4）应用场景

创建对象时直接赋值，简化代码：

java

```java
// 有参构造器创建对象
Student s = new Student("播妞", 100, 100);
```

### 2. this 关键字

#### （1）核心含义

`this`是一个隐含变量，指向**当前对象**（哪个对象调用方法 / 构造器，this 就指向哪个对象）。

#### （2）核心应用场景

- 解决

  成员变量与局部变量名冲突

  （构造器、方法中常用）：

  java

  ```java
  public void setName(String name) {
      this.name = name; // this.name指成员变量，name指局部参数
  }
  ```

  

- 只能在**实例方法 / 构造器**中使用，静态方法中不能用 this（静态方法属于类，不依赖对象）。

### 3. 封装（OOP 三大特征之一）

#### （1）核心定义

将对象的 “数据（成员变量）” 和 “操作数据的方法” 封装在类中，通过访问控制符（`public/private`）实现**合理隐藏、合理暴露**。

#### （2）实现方式（代码层面）

- **隐藏**：成员变量用`private`修饰，外部无法直接访问。
- **暴露**：提供`public`修饰的`getter`（获取值）和`setter`（修改值）方法，控制访问逻辑。

#### （3）示例代码

java

```java
public class Student {
    // 私有成员变量（隐藏）
    private String name;
    private double score;
    
    // getter方法（暴露读取权限）
    public String getName() {
        return name;
    }
    
    // setter方法（暴露修改权限，可添加校验逻辑）
    public void setScore(double score) {
        if (score < 0 || score > 100) {
            System.out.println("成绩非法！");
            return;
        }
        this.score = score;
    }
}
```

### 4. JavaBean（实体类规范）

#### （1）核心定义

一种标准化的实体类，仅负责**存储数据**，数据与业务逻辑分离，是开发中存储数据的标准格式。

#### （2）强制规范

1. 成员变量全部用`private`修饰，提供`public`的`getter/setter`方法。
2. 必须提供**无参构造器**（有参构造器可选）。

#### （3）示例代码

java

```java
public class Person {
    // 私有成员变量
    private String name;
    private int age;
    
    // 无参构造器（必须）
    public Person() {}
    
    // 有参构造器（可选）
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // getter/setter方法（必须）
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}
```

### 5. static 关键字（静态修饰符）

#### （1）核心作用

修饰成员变量 / 方法，使其**属于类**而非对象，实现数据 / 方法的共享。

#### （2）static 修饰成员变量（类变量）

- **特点**：与类一起加载，内存中仅存一份，被所有对象共享。
- **访问方式**：`类名.变量名`（推荐）或`对象名.变量名`（不推荐）。
- **应用场景**：存储全局共享数据（如创建对象的计数器、系统常量）。

#### （3）static 修饰成员方法（类方法）

- **特点**：属于类，无需创建对象，直接通过类名调用。

- 访问限制

  ：

  - 可直接访问静态成员（静态变量 / 静态方法）。
  - 不能直接访问实例成员（实例变量 / 实例方法）、不能使用`this`关键字。

- **核心应用**：设计工具类（如验证码生成、数据格式转换），工具类需私有化构造器（避免创建对象浪费内存）。

#### （4）工具类示例

java

```java
public class StringUtil {
    // 私有化构造器，禁止创建对象
    private StringUtil() {}
    
    // 静态工具方法（字符串非空判断）
    public static boolean isNotEmpty(String str) {
        return str != null && !"".equals(str);
    }
}
```

## 四、关键语法规则总结

| 语法要素         | 核心规则                                                     |
| ---------------- | ------------------------------------------------------------ |
| 构造器           | 名同类名，无返回值；默认无参，自定义有参后需手动加无参。     |
| this 关键字      | 指向当前对象；解决变量名冲突；仅在实例方法 / 构造器中使用。  |
| 封装             | private 隐藏成员变量，public 暴露 getter/setter；合理控制访问权限。 |
| JavaBean         | 成员变量私有 + getter/setter + 无参构造器；仅负责存储数据。  |
| static 成员      | 类变量：共享一份，类名访问；类方法：无对象调用，不访问实例成员。 |
| 静态 vs 实例成员 | 静态方法→只能访问静态成员；实例方法→可访问静态 + 实例成员。  |

## 五、综合案例：简易电影信息展示系统

### 1. 案例核心设计

- **实体类（Movie）**：JavaBean 规范，存储电影数据（id、名称、价格、导演）。
- **业务逻辑**：展示所有电影、根据 id 查询电影。
- **技术应用**：类与对象创建、成员变量 / 方法、构造器、static（可选：电影计数器）。

### 2. 核心代码框架

java

```java
// 电影实体类（JavaBean）
public class Movie {
    private int id;
    private String name;
    private double price;
    private String director;
    
    // 无参+有参构造器
    public Movie() {}
    public Movie(int id, String name, double price, String director) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.director = director;
    }
    
    // getter/setter方法
    // ...（省略getter/setter）
    
    // 展示电影信息的实例方法
    public void showInfo() {
        System.out.println("电影ID：" + id + "，名称：" + name + "，价格：" + price + "，导演：" + director);
    }
}

// 测试类
public class MovieSystem {
    public static void main(String[] args) {
        // 创建电影对象
        Movie m1 = new Movie(1, "长津湖之水门桥", 99.0, "徐克");
        Movie m2 = new Movie(2, "月球陨落", 88.0, "罗兰·艾默里奇");
        
        // 展示所有电影
        System.out.println("所有电影信息：");
        m1.showInfo();
        m2.showInfo();
        
        // 根据id查询电影（简化逻辑）
        int targetId = 1;
        if (m1.getId() == targetId) {
            System.out.println("\n查询到电影：");
            m1.showInfo();
        }
    }
}
```

## 六、核心思想与应用场景

1. **OOP 核心价值**：代码复用（类模板）、数据封装（隐藏细节）、逻辑清晰（数据与行为绑定）。

2. **类的设计原则**：一个类对应一个核心事物（如 Student 对应学生、Movie 对应电影），遵循 “单一职责”。

3. 开发场景适配

   ：

   - 存储数据：用 JavaBean（实体类）。
   - 共享功能：用 static 工具类。
   - 复杂业务：拆分实体类（存数据）和业务类（处理逻辑），实现数据与逻辑分离。



# Java 面向对象编程（OOP）入门 5 道深度面试题（含场景 + 答案）

## 面试题 1（基础：类与对象的创建 + 成员访问）

### 场景

面试官：“某学校需要用面向对象思想存储学生信息，请分析以下代码的运行结果并解释原因，若有错误请修复。”

java

```java
public class StudentDemo {
    public static void main(String[] args) {
        // 创建学生对象
        Student s = new Student();
        // 设置学生信息
        s.name = "张三";
        s.age = 20;
        // 调用方法展示信息
        s.showInfo();
    }
}

// 学生类
class Student {
    // 成员变量
    String name;
    int age;
    
    // 成员方法：展示学生信息
    void showInfo() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}
```

### 问题

1. 上述代码是否能正常运行？若能，运行结果是什么？若不能，错误原因是什么？
2. 请解释 “类” 和 “对象” 的关系，并说明`new Student()`这句代码的作用。
3. 成员变量（如`name`）和局部变量（如方法中的参数）的核心区别是什么？

## 面试题 2（进阶：构造器的使用 + 默认构造器）

### 场景

面试官：“开发中常通过构造器初始化对象，请分析以下代码的编译错误原因并修复，要求创建对象时能直接赋值姓名和年龄，且保留无参构造器的功能。”

java

```java
public class TeacherDemo {
    public static void main(String[] args) {
        // 用无参构造器创建对象
        Teacher t1 = new Teacher();
        t1.setName("李老师");
        t1.setAge(35);
        
        // 用有参构造器创建对象（直接赋值）
        Teacher t2 = new Teacher("王老师", 40);
        
        t1.showInfo();
        t2.showInfo();
    }
}

class Teacher {
    private String name;
    private int age;
    
    // 有参构造器：初始化姓名和年龄
    public Teacher(String n, int a) {
        name = n;
        age = a;
    }
    
    // getter和setter方法
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    
    // 展示信息
    public void showInfo() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}
```

### 问题

1. 代码编译时会报错，错误位置在哪里？原因是什么？
2. 修复代码使其能正常运行，写出完整的修复代码。
3. 构造器的核心作用是什么？若类中自定义了有参构造器，默认无参构造器会如何变化？

## 面试题 3（深入：封装与 getter/setter + 数据校验）

### 场景

面试官：“封装是 OOP 的核心特征，请基于封装思想完善以下`Person`类，要求：1. 成员变量必须私有；2. 提供 getter 和 setter 方法；3. `age`的 setter 方法需校验年龄合法性（0~150 岁，不合法时提示错误并拒绝赋值）；4. `name`的 setter 方法需确保姓名不为 null 或空字符串（不合法时提示错误并拒绝赋值）。”

java

```java
// 待完善的Person类
class Person {
    // 成员变量（需按封装要求修改）
    String name;
    int age;
    
    // 需补充getter和setter方法（含校验逻辑）
    
    // 展示信息
    public void show() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}
```

### 问题

1. 写出完善后的`Person`类完整代码。
2. 封装的核心思想是什么？为什么要将成员变量设为私有（`private`）？
3. 若直接通过`对象名.age = -5`赋值，和通过`setAge(-5)`赋值，结果有何不同？这体现了 setter 方法的什么价值？

## 面试题 4（核心：this 关键字的应用）

### 场景

面试官：“以下代码试图通过 this 关键字解决变量名冲突，但运行结果不符合预期，请分析原因并修复，确保`setInfo`方法能正确设置成员变量的值。”

java

```java
public class ThisDemo {
    public static void main(String[] args) {
        Book book = new Book();
        book.setInfo("Java编程思想", 89.0);
        book.showInfo(); // 预期输出：书名：Java编程思想，价格：89.0
    }
}

class Book {
    private String name;
    private double price;
    
    // 设置图书信息（存在逻辑错误）
    public void setInfo(String name, double price) {
        name = name; // 变量名冲突，未正确使用this
        price = price;
    }
    
    public void showInfo() {
        System.out.println("书名：" + name + "，价格：" + price);
    }
}
```

### 问题

1. 原代码的运行结果是什么？为什么会出现该结果？
2. 修复代码中的`setInfo`方法，写出正确代码。
3. this 关键字的本质是什么？在构造器和成员方法中使用 this 有哪些核心场景？

## 面试题 5（综合：static 关键字 + 工具类设计）

### 场景

面试官：“请设计一个`ArrayUtil`工具类，包含以下静态方法：1. `printArray`：打印 int 数组的所有元素（格式：`[元素1, 元素2, ...]`）；2. `getSum`：计算 int 数组所有元素的和。要求：工具类不能被创建对象（禁止通过`new ArrayUtil()`创建实例），并测试工具类的使用。”

### 问题

1. 写出完整的`ArrayUtil`工具类代码。
2. 为什么工具类的方法通常设计为静态方法？如何禁止工具类被创建对象？
3. 静态方法和实例方法的核心区别是什么？静态方法中能否直接访问实例成员（实例变量 / 实例方法）？为什么？

# 参考答案

## 面试题 1 参考答案

### 1. 运行结果与原因

- 能正常运行，结果为：`姓名：张三，年龄：20`；
- 原因：代码正确定义了`Student`类（包含成员变量`name`、`age`和方法`showInfo`），通过`new Student()`创建了对象`s`，并正确赋值成员变量、调用方法，符合类与对象的基本使用规则。

### 2. 类与对象的关系及`new Student()`的作用

- 关系：类是对象的 “模板 / 设计图”（抽象概念），定义对象的属性和行为；对象是类的 “实例”（具体事物），基于类创建，占用实际内存。例如：`Student`类是 “学生模板”，`s`是 “张三这个具体学生”。

- ```
  new Student()
  ```

  的作用：

  1. 在堆内存中为对象分配空间；
  2. 初始化对象的成员变量（此处为默认值：`name=null`，`age=0`）；
  3. 返回对象的引用地址，赋值给变量`s`。

### 3. 成员变量与局部变量的核心区别

| 对比维度 | 成员变量（如`Student`类的`name`）  | 局部变量（如方法参数、方法内变量） |
| -------- | ---------------------------------- | ---------------------------------- |
| 定义位置 | 类中，方法外                       | 方法内、方法参数、代码块中         |
| 初始化值 | 有默认值（如`String`默认`null`）   | 无默认值，必须手动赋值后才能使用   |
| 内存位置 | 堆内存（对象所属空间）             | 栈内存（方法栈帧）                 |
| 生命周期 | 随对象创建而存在，随对象销毁而消失 | 随方法调用而存在，随方法结束而消失 |



## 面试题 2 参考答案

### 1. 编译错误位置与原因

- 错误位置：`Teacher t1 = new Teacher();`这句代码编译报错；
- 原因：当类中自定义了有参构造器后，Java 不再自动生成默认的无参构造器，此时`new Teacher()`（调用无参构造器）会因找不到对应构造器而报错。

### 2. 修复后的完整代码

java

```java
public class TeacherDemo {
    public static void main(String[] args) {
        Teacher t1 = new Teacher();
        t1.setName("李老师");
        t1.setAge(35);
        
        Teacher t2 = new Teacher("王老师", 40);
        
        t1.showInfo(); // 姓名：李老师，年龄：35
        t2.showInfo(); // 姓名：王老师，年龄：40
    }
}

class Teacher {
    private String name;
    private int age;
    
    // 手动添加无参构造器（关键修复）
    public Teacher() {}
    
    // 有参构造器
    public Teacher(String n, int a) {
        name = n;
        age = a;
    }
    
    // getter和setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    
    public void showInfo() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}
```

### 3. 构造器的作用与默认构造器变化

- 核心作用：创建对象时初始化成员变量，简化对象赋值流程（无需调用多个 setter 方法）；
- 默认构造器变化：类默认自带无参构造器（隐式）；若自定义了任意构造器（有参 / 无参），默认无参构造器会被覆盖（失效），需手动显式定义才能使用。

## 面试题 3 参考答案

### 1. 完善后的`Person`类代码

java

```java
class Person {
    // 私有成员变量（封装核心：隐藏数据）
    private String name;
    private int age;
    
    // name的getter
    public String getName() {
        return name;
    }
    
    // name的setter（含非空校验）
    public void setName(String name) {
        // 校验：姓名不能为null或空字符串（trim()处理空格）
        if (name == null || "".equals(name.trim())) {
            System.out.println("姓名不合法！不能为null或空");
            return; // 拒绝赋值
        }
        this.name = name;
    }
    
    // age的getter
    public int getAge() {
        return age;
    }
    
    // age的setter（含范围校验）
    public void setAge(int age) {
        // 校验：年龄必须在0~150岁
        if (age < 0 || age > 150) {
            System.out.println("年龄不合法！必须在0~150之间");
            return; // 拒绝赋值
        }
        this.age = age;
    }
    
    public void show() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}
```

### 2. 封装的核心思想与私有成员变量的原因

- 核心思想：“隐藏内部细节，暴露合理接口”—— 将对象的数据（成员变量）隐藏，仅通过指定方法（getter/setter）访问，实现对数据的可控操作；
- 成员变量设为`private`的原因：防止外部直接修改数据导致的不可控（如年龄设为 - 5、姓名设为空），通过方法层的校验逻辑保证数据合法性。

### 3. 直接赋值与 setter 赋值的区别及 setter 价值

- 区别：
  - 直接赋值（`对象名.age = -5`）：若`age`为`private`，编译报错（无法访问）；若为`public`，会成功赋值非法数据（-5）；
  - `setAge(-5)`：通过 setter 方法的校验逻辑，拒绝赋值并提示错误，保证数据合法；
- setter 价值：提供数据访问的 “中间层”，可在赋值前添加校验、日志等逻辑，确保数据符合业务规则，体现封装的 “可控暴露” 思想。

## 面试题 4 参考答案

### 1. 原代码运行结果与原因

- 运行结果：`书名：null，价格：0.0`；
- 原因：`setInfo`方法中，`name = name`和`price = price`是 “局部变量给局部变量赋值”（形参`name`赋值给自身），未修改成员变量。因局部变量与成员变量同名，局部变量 “遮蔽” 了成员变量，导致成员变量始终为默认值（`name=null`，`price=0.0`）。

### 2. 修复后的`setInfo`方法

java

```java
public void setInfo(String name, double price) {
    this.name = name; // this.name指成员变量，name指局部参数
    this.price = price;
}
```

修复后运行结果：`书名：Java编程思想，价格：89.0`。

### 3. this 关键字的本质与核心场景

- 本质：`this`是一个隐含的引用变量，指向**当前对象**（哪个对象调用方法，this 就指向哪个对象）；

- 核心场景：

  1. 解决**成员变量与局部变量名冲突**（如上述`setInfo`方法）；

  2. 在构造器中调用同类的其他构造器（需放在第一行）：

     ```
     this(参数)
     ```

     ；

     示例：

     java

     ```java
     public Book() {
         this("未知书名", 0.0); // 调用有参构造器
     }
     public Book(String name, double price) {
         this.name = name;
         this.price = price;
     }
     ```

     

  3. 在方法中返回当前对象（链式调用）：`return this;`。

## 面试题 5 参考答案

### 1. 完整的`ArrayUtil`工具类代码

java

```java
public class ArrayUtilDemo {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40};
        // 调用静态方法（类名.方法名）
        ArrayUtil.printArray(arr); // 输出：[10, 20, 30, 40]
        int sum = ArrayUtil.getSum(arr);
        System.out.println("数组元素和：" + sum); // 输出：100
    }
}

// 数组工具类
class ArrayUtil {
    // 私有化构造器：禁止创建对象（核心）
    private ArrayUtil() {}
    
    // 静态方法：打印数组
    public static void printArray(int[] arr) {
        if (arr == null) {
            System.out.println("数组为null");
            return;
        }
        System.out.print("[");
        for (int i = 0; i < arr.length; i++) {
            if (i == arr.length - 1) {
                System.out.print(arr[i]);
            } else {
                System.out.print(arr[i] + ", ");
            }
        }
        System.out.println("]");
    }
    
    // 静态方法：计算数组元素和
    public static int getSum(int[] arr) {
        if (arr == null || arr.length == 0) {
            return 0;
        }
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        return sum;
    }
}
```

### 2. 工具类方法设计为静态的原因及禁止创建对象的方式

- 工具类方法设为静态的原因：工具类的功能（如数组打印、求和）与 “对象实例” 无关，无需创建对象即可使用，通过`类名.方法名`直接调用，简化操作；
- 禁止创建对象的方式：将构造器**私有化**（`private ArrayUtil()`），外部无法通过`new`关键字创建实例，避免内存浪费（工具类无需实例化）。

### 3. 静态方法与实例方法的区别及静态方法访问限制

- 核心区别：

  | 对比维度     | 静态方法（`static`修饰）             | 实例方法（无`static`） |
  | ------------ | ------------------------------------ | ---------------------- |
  | 调用方式     | 类名。方法名（推荐）或对象名。方法名 | 必须通过对象名。方法名 |
  | 关联对象     | 属于类，不依赖对象存在               | 属于对象，依赖对象存在 |
  | `this`关键字 | 不能使用                             | 可以使用               |

- 静态方法访问限制：

  不能直接访问实例成员

  （实例变量 / 实例方法）；

  - 原因：静态方法属于类，加载时机早于对象（对象创建前静态方法已存在），而实例成员依赖对象存在，因此静态方法无法确定访问哪个对象的实例成员。