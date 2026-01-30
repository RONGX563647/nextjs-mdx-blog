# 05 🎯 Java Day5 - 面向对象基础

> 💡 **核心提示**：面向对象编程（OOP）是 Java 的核心思想，本文系统讲解类与对象、封装、构造器、this 关键字等核心概念，帮你建立面向对象思维，避开 90% 的坑。

---

## 📋 快速回顾

| 核心概念 | 说明 |
|:--------:|------|
| **类与对象** | 类是模板（设计图），对象是实例（具体事物） |
| **封装** | 隐藏内部细节，暴露必要接口，提高安全性 |
| **构造器** | 对象创建时自动调用，用于初始化成员变量 |
| **this 关键字** | 指向当前对象，区分成员变量与局部变量 |

---

## 📑 目录

- [一、面向对象核心概念](#一面向对象核心概念)
  - [1. 类与对象的关系](#1-类与对象的关系)
  - [2. 内存结构](#2-内存结构)
- [二、封装（Encapsulation）](#二封装encapsulation)
  - [1. 封装的核心思想](#1-封装的核心思想)
  - [2. 封装的好处](#2-封装的好处)
  - [3. JavaBean 规范](#3-javabean-规范)
- [三、构造器（Constructor）](#三构造器constructor)
  - [1. 构造器的作用](#1-构造器的作用)
  - [2. 构造器的特点](#2-构造器的特点)
  - [3. 构造器注意事项](#3-构造器注意事项)
- [四、this 关键字](#四-this-关键字)
  - [1. this 的作用](#1-this-的作用)
  - [2. this 的使用示例](#2-this-的使用示例)
- [五、综合案例：学生管理系统](#五综合案例学生管理系统)
- [问答](#问答)

---

## 📚 详细内容

### 🎨 一、面向对象核心概念

#### 1️⃣ 类与对象的关系

| 概念 | 说明 | 类比 |
|:----:|------|------|
| **类（Class）** | 对象的模板，定义属性和行为 | 汽车设计图纸 |
| **对象（Object）** | 类的实例，具体存在的实体 | 一辆具体的汽车 |

> 📌 **类与对象关系图：**

```
┌─────────────────────────────────────────────────────────────┐
│                  类与对象的关系                        │
│                                                             │
│   类（Class） - 设计图 / 模板                               │
│   ┌─────────────────────────────────────────────┐           │
│   │              Car 类                         │           │
│   │                                             │           │
│   │   属性：                                     │           │
│   │   • String brand    品牌                     │           │
│   │   • String color    颜色                     │           │
│   │   • double price    价格                     │           │
│   │                                             │           │
│   │   行为：                                     │           │
│   │   • run()         行驶                       │           │
│   │   • stop()        停止                       │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      │ new Car()                             │
│                      │ 实例化                                 │
│                      ▼                                       │
│   对象（Object） - 具体实例                                  │
│   ┌─────────────────────────────────────────────┐           │
│   │           car1 对象                          │           │
│   │                                             │           │
│   │   brand = "宝马"                             │           │
│   │   color = "黑色"                             │           │
│   │   price = 500000.0                          │           │
│   │                                             │           │
│   │   run()  →  "宝马正在行驶"                  │           │
│   │   stop() →  "宝马已停止"                    │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   ┌─────────────────────────────────────────────┐           │
│   │           car2 对象                          │           │
│   │                                             │           │
│   │   brand = "奔驰"                             │           │
│   │   color = "白色"                             │           │
│   │   price = 600000.0                          │           │
│   │                                             │           │
│   │   run()  →  "奔驰正在行驶"                  │           │
│   │   stop() →  "奔驰已停止"                    │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   说明：                                                    │
│   • 类是抽象的模板，对象是具体的实例                        │
│   • 一个类可以创建多个对象                                  │
│   • 每个对象有独立的属性值，共享类的方法                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```java
// 定义类（模板）
public class Car {
    // 属性（成员变量）
    String brand;
    String color;
    double price;
    
    // 行为（成员方法）
    public void run() {
        System.out.println(brand + "正在行驶");
    }
    
    public void stop() {
        System.out.println(brand + "已停止");
    }
}

// 创建对象（实例化）
public class Test {
    public static void main(String[] args) {
        Car car1 = new Car();  // 创建对象
        car1.brand = "宝马";
        car1.color = "黑色";
        car1.price = 500000;
        
        car1.run();   // 调用方法
        car1.stop();
    }
}
```

#### 2️⃣ 内存结构

```
栈内存              堆内存
main() {
    Car c = new Car();  →  [brand="宝马", color="黑色", price=500000.0]
    c.run();
}
```

- **栈**：存储局部变量、方法调用
- **堆**：存储对象实例、成员变量
- **方法区**：存储类信息、静态变量、方法代码

> 📌 **对象内存结构详细图：**

```
┌─────────────────────────────────────────────────────────────┐
│                  对象内存结构详解                    │
│                                                             │
│   栈内存（Stack）                堆内存（Heap）              │
│   ┌──────────────────┐         ┌──────────────────┐         │
│   │   main 方法       │         │                  │         │
│   │                  │         │                  │         │
│   │  ┌────────────┐  │         │  ┌────────────┐  │         │
│   │  │   car1    │  │────────►│  │  Car 对象   │  │         │
│   │  │ 0x1234    │  │  地址   │  │ 0x1234     │  │         │
│   │  └────────────┘  │         │  └─────┬──────┘  │         │
│   └──────────────────┘         │        │         │         │
│                                │        ▼         │         │
│                                │  ┌────────────┐  │         │
│                                │  │  成员变量   │  │         │
│                                │  │ brand      │  │         │
│                                │  │ "宝马"      │  │         │
│                                │  │ color      │  │         │
│                                │  │ "黑色"      │  │         │
│                                │  │ price      │  │         │
│                                │  │ 500000.0   │  │         │
│                                │  └────────────┘  │         │
│                                │                  │         │
│                                └──────────────────┘         │
│                                                             │
│   方法区（Method Area）                                      │
│   ┌──────────────────┐         ┌──────────────────┐         │
│   │   Car 类信息     │         │   Car 方法代码   │         │
│   │                  │         │                  │         │
│   │  • 类名：Car     │         │  • run()        │         │
│   │  • 父类：Object  │         │  • stop()       │         │
│   │  • 字段信息      │         │                  │         │
│   │  • 方法签名      │         │                  │         │
│   └──────────────────┘         └──────────────────┘         │
│                                                             │
│   说明：                                                    │
│   • 栈：存储局部变量 car1，存储对象地址                     │
│   • 堆：存储对象实例，包含成员变量的值                       │
│   • 方法区：存储类信息和方法代码，所有对象共享               │
│   • car1.run() 通过地址找到对象，执行方法区中的代码           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔒 二、封装（Encapsulation）

#### 1️⃣ 封装的核心思想

**原则**：合理隐藏，合理暴露

- 将成员变量设为 `private`（隐藏）
- 提供 `public` 的 getter/setter 方法（暴露）

```java
public class Student {
    // 私有成员变量（隐藏）
    private String name;
    private int age;
    private double score;
    
    // 公共 getter/setter（暴露）
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        // 数据校验
        if (age >= 0 && age <= 150) {
            this.age = age;
        } else {
            System.out.println("年龄不合法");
        }
    }
    
    public double getScore() {
        return score;
    }
    
    public void setScore(double score) {
        if (score >= 0 && score <= 100) {
            this.score = score;
        } else {
            System.out.println("成绩不合法");
        }
    }
}
```

#### 2️⃣ 封装的好处

| 好处 | 说明 |
|:----:|------|
| **安全性** | 防止外部直接修改内部数据 |
| **可控性** | 通过 setter 方法进行数据校验 |
| **灵活性** | 内部实现改变不影响外部调用 |
| **可维护性** | 代码结构清晰，易于维护 |

#### 3️⃣ JavaBean 规范

符合以下规范的类称为 JavaBean：
- 成员变量私有（`private`）
- 提供无参构造器
- 提供 getter/setter 方法

```java
public class User {
    private Long id;
    private String username;
    private String password;
    
    // 无参构造器
    public User() {}
    
    // 有参构造器
    public User(Long id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }
    
    // getter/setter 省略...
}
```

---

### 🏗️ 三、构造器（Constructor）

#### 1️⃣ 构造器的作用

- 创建对象时自动调用
- 用于初始化成员变量

#### 2️⃣ 构造器的特点

| 特点 | 说明 |
|:----:|------|
| **名称与类名相同** | `public Student() {}` |
| **没有返回值类型** | 不写 `void` |
| **可以重载** | 多个构造器，参数不同 |
| **默认构造器** | 不写时编译器自动生成无参构造器 |

#### 3️⃣ 构造器注意事项

```java
public class Student {
    private String name;
    private int age;
    
    // 无参构造器
    public Student() {
        System.out.println("无参构造器被调用");
    }
    
    // 有参构造器（重载）
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
        System.out.println("有参构造器被调用");
    }
}

// 使用
Student s1 = new Student();              // 调用无参构造器
Student s2 = new Student("张三", 20);    // 调用有参构造器
```

#### 3. 构造器注意事项

- 一旦定义了有参构造器，编译器不再提供默认无参构造器
- 建议始终显式定义无参构造器
- 构造器之间可以相互调用（`this()`），必须放在第一行

```java
public Student(String name) {
    this(name, 0);  // 调用另一个构造器
}

public Student(String name, int age) {
    this.name = name;
    this.age = age;
}
```

---

### 四、this 关键字

#### 1. this 的作用

| 场景 | 用法 | 说明 |
|------|------|------|
| 区分变量 | `this.name = name;` | 区分成员变量和局部变量 |
| 调用构造器 | `this();` | 在一个构造器中调用另一个构造器 |
| 返回当前对象 | `return this;` | 支持链式调用 |

#### 2. this 的使用示例

```java
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;  // this.name 是成员变量，name 是参数
        this.age = age;
    }
    
    // 链式调用
    public Person setName(String name) {
        this.name = name;
        return this;  // 返回当前对象
    }
    
    public Person setAge(int age) {
        this.age = age;
        return this;
    }
}

// 链式调用
Person p = new Person("张三", 20)
    .setName("李四")
    .setAge(25);
```

---

### 五、综合案例：学生管理系统

```java
// Student 类
public class Student {
    private String id;
    private String name;
    private int age;
    private double score;
    
    public Student() {}
    
    public Student(String id, String name, int age, double score) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.score = score;
    }
    
    // getter/setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public int getAge() { return age; }
    public void setAge(int age) { 
        if (age > 0 && age < 150) {
            this.age = age;
        }
    }
    
    public double getScore() { return score; }
    public void setScore(double score) { 
        if (score >= 0 && score <= 100) {
            this.score = score;
        }
    }
    
    @Override
    public String toString() {
        return "Student{id='" + id + "', name='" + name + 
               "', age=" + age + ", score=" + score + "}";
    }
}

// 测试类
public class StudentManager {
    public static void main(String[] args) {
        Student s1 = new Student("001", "张三", 20, 85.5);
        Student s2 = new Student();
        s2.setId("002");
        s2.setName("李四");
        s2.setAge(21);
        s2.setScore(90.0);
        
        System.out.println(s1);
        System.out.println(s2);
    }
}
```

---

## 问答

### Q1：面向对象和面向过程有什么区别？

**答**：
- **面向过程**：以步骤为中心，按顺序执行函数，适合简单任务。
- **面向对象**：以对象为中心，通过对象交互完成任务，适合复杂系统。
- **类比**：面向过程是"自己做菜"（按步骤来），面向对象是"去餐厅"（告诉服务员需求）。

### Q2：为什么要使用封装？直接 public 不行吗？

**答**：
- **安全性**：`public` 允许外部任意修改，无法保证数据合法性。
- **可控性**：封装后可以在 setter 中添加校验逻辑。
- **灵活性**：内部实现改变不影响外部调用者。
- **维护性**：清晰的接口定义，降低耦合度。

### Q3：构造器和普通方法有什么区别？

**答**：
- **调用时机**：构造器在创建对象时自动调用，普通方法需手动调用。
- **返回值**：构造器没有返回值（不写 `void`），普通方法必须有返回值类型。
- **命名**：构造器必须与类名相同，普通方法命名自由。
- **作用**：构造器用于初始化，普通方法用于定义行为。

### Q4：this 关键字在哪些场景下必须使用？

**答**：
- **区分同名变量**：当成员变量和局部变量/参数同名时，用 `this` 指明成员变量。
- **构造器调用**：一个构造器调用另一个构造器时，用 `this()`。
- **返回当前对象**：实现链式调用时，返回 `this`。

### Q5：JavaBean 规范有什么好处？

**答**：
- **标准化**：统一的编码规范，便于团队协作。
- **框架兼容**：大多数 Java 框架（Spring、Hibernate 等）都基于 JavaBean 规范。
- **工具支持**：IDE 可以自动生成 getter/setter，提高开发效率。
- **可维护性**：结构清晰，易于理解和维护。

---

> **学习建议**：面向对象是 Java 编程的核心思想，务必理解类与对象的关系、封装的意义。建议多练习类的设计，培养面向对象的思维方式。
