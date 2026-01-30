 

#07 🎨 Java OOP进阶：抽象类、接口、代码块、内部类核心总结

> 💡 **核心提示**：抽象类和接口是 Java 面向对象编程的重要特性，用于实现代码复用和灵活扩展。本文系统讲解抽象类、接口、代码块、内部类的核心概念、语法要素、综合案例和高频面试题，帮你彻底掌握 OOP 进阶核心思想。

## 目录

- [一、抽象类（Abstract Class）](#一抽象类abstract-class)
  - [1. 核心概念](#1-核心概念)
  - [2. 核心语法](#2-核心语法)
  - [3. 核心特性](#3-核心特性)
  - [4. 应用场景：模板方法模式](#4-应用场景模板方法模式)
- [二、接口（Interface）](#二接口interface)
  - [1. 核心概念](#1-核心概念-1)
  - [2. JDK8+ 接口新特性](#2-jdk8-接口新特性)
  - [3. 完整示例](#3-完整示例)
  - [4. 多实现](#4-多实现)
- [三、抽象类 vs 接口（面试重点）](#三抽象类-vs-接口面试重点)
  - [对比表格](#对比表格)
  - [如何选择？](#如何选择)
  - [支付系统设计示例](#支付系统设计示例)
- [四、代码块（Code Block）](#四代码块code-block)
  - [1. 三种代码块对比](#1-三种代码块对比)
  - [2. 执行顺序（含继承）](#2-执行顺序含继承)
  - [3. 完整示例](#3-完整示例-1)
  - [4. 应用场景](#4-应用场景-1)
- [五、内部类（Inner Class）](#五内部类inner-class)
  - [1. 四种内部类对比](#1-四种内部类对比)
  - [2. 成员内部类](#2-成员内部类)
  - [3. 静态内部类](#3-静态内部类)
  - [4. 匿名内部类](#4-匿名内部类)
  - [5. 局部内部类](#5-局部内部类)
- [六、高频面试题详解](#六高频面试题详解)
- [七、快速记忆口诀](#七快速记忆口诀)
- [八、实战建议](#八实战建议)

---

## 一、抽象类（Abstract Class）

### 1. 核心概念

- **半成品模板**：不能实例化，用于抽取多个类的共性
- **抽象方法**：只有声明没有实现，强制子类实现
- **普通方法**：可以有具体实现，子类可直接继承

### 2. 核心语法

java

```
// 定义抽象类
abstract class Animal {
    String name;  // 普通属性
    
    // 抽象方法（无方法体）
    public abstract void cry();
    
    // 普通方法（有方法体）
    public void eat() {
        System.out.println(name + "吃饭");
    }
}

// 子类必须实现所有抽象方法
class Cat extends Animal {
    @Override
    public void cry() {
        System.out.println(name + "喵喵叫");
    }
}
```

**抽象类与子类关系图：**

```
┌─────────────────────────────────────────────────────────────┐
│              抽象类与子类关系                    │
│                                                             │
│   抽象类（Abstract Class）- Animal                          │
│   ┌─────────────────────────────────────────────┐           │
│   │           abstract class Animal            │           │
│   │                                             │           │
│   │   属性：                                     │           │
│   │   • String name    姓名                     │           │
│   │                                             │           │
│   │   抽象方法（无实现）：                         │           │
│   │   • abstract void cry()  叫声               │           │
│   │                                             │           │
│   │   普通方法（有实现）：                         │           │
│   │   • void eat()      吃饭                   │           │
│   │                                             │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      │ extends                               │
│                      │ 继承                                 │
│                      ▼                                       │
│   子类（Concrete Class）- Cat                                │
│   ┌─────────────────────────────────────────────┐           │
│   │           class Cat extends Animal      │           │
│   │                                             │           │
│   │   继承的属性：                               │           │
│   │   • String name    姓名                     │           │
│   │                                             │           │
│   │   继承的方法：                               │           │
│   │   • void eat()      吃饭（直接使用）         │           │
│   │                                             │           │
│   │   实现的抽象方法：                             │           │
│   │   • void cry()      叫声（必须实现）         │           │
│   │     输出："喵喵叫"                           │           │
│   │                                             │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   说明：                                                    │
│   • 抽象类不能实例化（不能 new Animal()）                 │
│   • 子类必须实现所有抽象方法（除非子类也是抽象类）            │
│   • 子类可以直接使用抽象类的普通方法                         │
│   • 抽象类可以有构造器（供子类调用）                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. 核心特性

1. **不能实例化**：`new Animal()` 会编译错误
2. **必须被继承**：才有实际意义
3. **可以包含**：
   - 抽象方法
   - 普通方法
   - 构造器
   - 成员变量
   - 代码块
4. **继承关系**：单继承（一个类只能继承一个抽象类）

### 4. 应用场景：模板方法模式

java

```
abstract class Exam {
    // 模板方法（final防止子类修改流程）
    public final void examProcess() {
        System.out.println("1. 发试卷");
        doExam();  // 抽象方法，子类实现
        System.out.println("3. 收试卷");
    }
    
    public abstract void doExam();  // 可变部分
}

class StudentA extends Exam {
    @Override
    public void doExam() {
        System.out.println("2. 学生A认真做题");
    }
}
```

------

## 二、接口（Interface）

### 1. 核心概念

- **行为规范书**：定义类应该具备的能力
- **多实现**：弥补Java单继承的限制
- **解耦**：定义规范与实现分离

### 2. JDK8+ 接口新特性

| 特性     | 说明                | 语法示例                         |
| -------- | ------------------- | -------------------------------- |
| 抽象方法 | 默认public abstract | `void swim();`                   |
| 默认方法 | 有方法体，可重写    | `default void warmUp() { ... }`  |
| 静态方法 | 接口名直接调用      | `static void showRule() { ... }` |
| 私有方法 | JDK9+，接口内部复用 | `private void helper() { ... }`  |

### 3. 完整示例

java

```
interface Swim {
    // 抽象方法（默认public abstract）
    void swim();
    
    // 默认方法
    default void warmUp() {
        System.out.println("热身运动");
    }
    
    // 静态方法
    static void showRule() {
        System.out.println("禁止潜水");
    }
}

// 实现接口
class Fish implements Swim {
    @Override
    public void swim() {
        System.out.println("鱼游");
    }
}

// 测试
public class InterfaceDemo {
    public static void main(String[] args) {
        Fish f = new Fish();
        f.warmUp();         // 调用默认方法
        f.swim();           // 调用抽象方法
        Swim.showRule();    // 调用静态方法
    }
}
```

### 4. 多实现

java

```
interface Run { void run(); }
interface Fly { void fly(); }

// 实现多个接口
class Bird implements Run, Fly {
    @Override
    public void run() { System.out.println("鸟跑"); }
    @Override
    public void fly() { System.out.println("鸟飞"); }
}
```

------

## 三、抽象类 vs 接口（面试重点）

### 对比表格

| 维度         | 抽象类             | 接口（JDK8+）                          |
| ------------ | ------------------ | -------------------------------------- |
| **设计理念** | is-a（是什么）     | has-a（能做什么）                      |
| **继承关系** | 单继承             | 多实现                                 |
| **方法类型** | 抽象方法、普通方法 | 抽象方法、默认方法、静态方法、私有方法 |
| **成员变量** | 任意类型变量       | 只能是public static final常量          |
| **构造器**   | 有                 | 无                                     |
| **代码复用** | 通过继承复用代码   | 通过实现复用行为规范                   |

### 如何选择？

text

```
需要定义模板，有公共代码复用 → 抽象类
需要定义行为规范，多实现 → 接口
既有模板又有规范 → 抽象类实现接口
```

### 支付系统设计示例

java

```
// 接口定义支付行为
interface Payment {
    void pay(double amount);
    boolean checkStatus();
}

// 抽象类封装通用流程
abstract class AbstractPayment implements Payment {
    protected String paymentName;
    
    // 安全校验（模板方法）
    protected final boolean securityCheck() {
        System.out.println("执行安全校验...");
        return true;
    }
    
    // 记录日志（公共方法）
    protected void logPayment(double amount) {
        System.out.println(paymentName + "支付：" + amount);
    }
}

// 具体实现
class WechatPayment extends AbstractPayment {
    public WechatPayment() {
        paymentName = "微信";
    }
    
    @Override
    public void pay(double amount) {
        if (securityCheck()) {
            System.out.println("微信支付" + amount + "元");
            logPayment(amount);
        }
    }
    
    @Override
    public boolean checkStatus() {
        return true;
    }
}
```

------

## 四、代码块（Code Block）

### 1. 三种代码块对比

| 类型       | 语法                         | 执行时机       | 执行次数 |
| ---------- | ---------------------------- | -------------- | -------- |
| 静态代码块 | `static { ... }`             | 类加载时       | 一次     |
| 实例代码块 | `{ ... }`                    | 每次创建对象时 | 每次创建 |
| 构造器     | `public ClassName() { ... }` | 创建对象时     | 每次创建 |

### 2. 执行顺序（含继承）

text

```
父类静态代码块 → 子类静态代码块 →
父类实例代码块 → 父类构造器 →
子类实例代码块 → 子类构造器
```

### 3. 完整示例

java

```
class Parent {
    static { System.out.println("父类静态代码块"); }
    { System.out.println("父类实例代码块"); }
    public Parent() { System.out.println("父类构造器"); }
}

class Child extends Parent {
    static { System.out.println("子类静态代码块"); }
    { System.out.println("子类实例代码块"); }
    public Child() { System.out.println("子类构造器"); }
}

public class BlockTest {
    public static void main(String[] args) {
        System.out.println("第一次创建对象：");
        new Child();
        
        System.out.println("\n第二次创建对象：");
        new Child();
    }
}

/* 输出：
父类静态代码块
子类静态代码块
第一次创建对象：
父类实例代码块
父类构造器
子类实例代码块
子类构造器

第二次创建对象：
父类实例代码块
父类构造器
子类实例代码块
子类构造器
*/
```

### 4. 应用场景

- **静态代码块**：初始化静态变量、加载配置文件
- **实例代码块**：提取多个构造器的公共代码
- **构造器**：初始化对象特有属性

------

## 五、内部类（Inner Class）

### 1. 四种内部类对比

| 类型           | 特点           | 创建方式                  | 访问权限           |
| -------------- | -------------- | ------------------------- | ------------------ |
| **成员内部类** | 依赖外部实例   | `outer.new Inner()`       | 访问外部所有成员   |
| **静态内部类** | 不依赖外部实例 | `new Outer.Inner()`       | 只访问外部静态成员 |
| **局部内部类** | 方法内定义     | 方法内直接创建            | 访问方法final变量  |
| **匿名内部类** | 无类名，一次性 | `new Interface() { ... }` | 访问方法final变量  |

### 2. 成员内部类

java

```
class Outer {
    private String outerName = "外部";
    
    class Inner {
        private String innerName = "内部";
        public void show() {
            // 直接访问外部类私有成员
            System.out.println(outerName + " -> " + innerName);
        }
    }
    
    public void testInner() {
        Inner inner = new Inner();
        inner.show();
    }
}

// 外部创建内部类
Outer.Inner inner = new Outer().new Inner();
inner.show();
```

### 3. 静态内部类

java

```
class Outer {
    private static String staticName = "静态外部";
    private String instanceName = "实例外部";
    
    static class StaticInner {
        public void show() {
            System.out.println(staticName);  // √ 可以访问
            // System.out.println(instanceName);  // × 不能访问实例变量
        }
    }
}

// 创建静态内部类
Outer.StaticInner inner = new Outer.StaticInner();
inner.show();
```

### 4. 匿名内部类

java

```
interface Swim {
    void swim();
}

public class AnonymousDemo {
    public static void main(String[] args) {
        // 创建匿名内部类（实现接口）
        Swim s = new Swim() {
            @Override
            public void swim() {
                System.out.println("匿名内部类实现游泳");
            }
        };
        s.swim();
        
        // Lambda简化（函数式接口）
        Swim s2 = () -> System.out.println("Lambda实现游泳");
        s2.swim();
    }
}
```

### 5. 局部内部类

java

```
class Outer {
    public void method() {
        final String localVar = "局部变量";  // 必须final或有效final
        
        class LocalInner {
            public void show() {
                System.out.println(localVar);  // 只能访问final局部变量
            }
        }
        
        LocalInner inner = new LocalInner();
        inner.show();
    }
}
```

------

## 六、高频面试题详解

### Q1：抽象类和接口的区别？

**A：**

1. **设计理念**：
   - 抽象类：is-a关系，是什么（模板）
   - 接口：has-a关系，能做什么（规范）
2. **语法区别**：
   - 抽象类：有构造器、普通方法、各种变量
   - 接口：无构造器、默认/静态方法、只有常量
3. **继承关系**：
   - 抽象类：单继承
   - 接口：多实现
4. **选择策略**：
   - 有公共代码复用 → 抽象类
   - 需要多实现 → 接口

### Q2：什么时候用抽象类？什么时候用接口？

**A：**

- **用抽象类**：
  1. 多个类有共同属性和行为
  2. 需要封装固定流程（模板方法模式）
  3. 需要提供部分默认实现
- **用接口**：
  1. 定义行为规范，不关心实现
  2. 需要多继承能力
  3. 解耦，实现类可灵活替换

### Q3：代码块执行顺序？

**A：**

text

```
父类静态块 → 子类静态块 → 
父类实例块 → 父类构造器 → 
子类实例块 → 子类构造器
```

- **静态块**：类加载时执行，仅一次
- **实例块**：每次创建对象执行

### Q4：内部类的使用场景？

**A：**

1. **成员内部类**：逻辑强关联，需要访问外部类所有成员
2. **静态内部类**：逻辑相关但不依赖外部实例
3. **匿名内部类**：一次性实现接口/抽象类
4. **局部内部类**：仅在方法内使用，封装局部逻辑

### Q5：匿名内部类可以访问外部变量吗？

**A：**

- 可以访问，但必须是final或有效final（JDK8+）
- 原因：生命周期不一致，防止数据不一致

------

## 七、快速记忆口诀

### 抽象类

- 抽象类是半成品，不能实例化
- 抽象方法无实现，子类必须重写
- 模板方法设计好，固定流程不变更

### 接口

- 接口是行为书，定义规范不实现
- 默认方法JDK8，静态方法也能加
- 多实现是优势，解耦替换真灵活

### 代码块

- 静态块，类加载，一次执行跑不掉
- 实例块，对象造，构造器前它先到
- 执行顺序要记牢，父静子静父实父构子实子构

### 内部类

- 成员内部类，依赖外部实例
- 静态内部类，独立不依赖
- 匿名内部类，一次性实现
- 局部内部类，方法内定义

------

## 八、实战建议

1. **抽象类**：从具体类中抽取共性，形成模板
2. **接口**：先定义规范，再实现，便于扩展
3. **代码块**：合理使用，避免复杂初始化逻辑
4. **内部类**：慎用，避免过度嵌套，保持代码清晰

**核心思想**：理解设计理念比记忆语法更重要，多思考"为什么用这个，不用那个"，结合实际场景选择最合适的方案。

------

------

### Java 面向对象编程（OOP）进阶篇②：抽象类 + 接口 + 代码块 + 内部类

（初学者友好 + 可运行代码 + 面试题详解）

#### 前言

初学 Java 抽象类和接口时，我分不清 “什么时候用抽象类、什么时候用接口”，被代码块的执行顺序、内部类的创建方式绕得晕头转向，面试时对抽象类与接口的核心区别答不到点上 —— 抽象类是 “不完整的模板”，接口是 “行为的规范”，代码块和内部类是类的特殊成分，掌握这些才能真正灵活设计 Java 程序。这篇内容把抽象类、接口、代码块、内部类的核心概念、语法要素和高频面试题拆解清楚，所有代码极简可运行，帮新手吃透这些 OOP 核心知识点。

#### 一、核心思路 / 概念（大白话讲透）

1. **抽象类**：核心是「半成品模板」—— 包含抽象方法（只有声明没有实现）和普通方法，不能创建对象，强制子类实现抽象方法，适合抽取类的共性（属性 + 方法）。
2. **接口**：核心是「行为规范书」—— 只定义行为的标准（方法签名），不关心实现，支持多实现，适合抽取类的共性行为。
3. **代码块**：核心是「初始化工具」—— 静态代码块初始化类（仅一次），实例代码块初始化对象（每次创建都执行），解决构造器重复逻辑问题。
4. **内部类**：核心是「类的内部组件」—— 定义在其他类内部的类，用于封装与外部类强关联的逻辑，分成员、静态、局部、匿名四种。

#### 二、实操步骤 + 可运行代码

##### 2.1 抽象类（不完整的类）

###### 2.1.1 基础语法（直接运行）

java

运行

```
// 抽象类：不能创建对象
abstract class Animal {
    String name;
    // 抽象方法：无方法体，子类必须实现
    public abstract void cry();
    // 普通方法：可继承
    public void eat() { System.out.println(name + "吃饭"); }
}

// 子类：必须实现所有抽象方法
class Cat extends Animal {
    @Override
    public void cry() {
        System.out.println(name + "喵喵叫");
    }
}

public class AbstractDemo {
    public static void main(String[] args) {
        Animal a = new Cat();
        a.name = "小花";
        a.cry(); // 输出：小花喵喵叫
        a.eat(); // 输出：小花吃饭
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.1.2 模板方法设计模式（核心应用）

java

运行

```
// 抽象类：封装固定流程
abstract class Exam {
    // 模板方法：final禁止重写
    public final void examProcess() {
        System.out.println("1. 发试卷");
        doExam(); // 可变步骤（抽象方法）
        System.out.println("3. 收试卷");
    }
    public abstract void doExam();
}

// 子类实现可变步骤
class StudentA extends Exam {
    @Override
    public void doExam() {
        System.out.println("2. 学生A认真做题");
    }
}

public class TemplateDemo {
    public static void main(String[] args) {
        Exam a = new StudentA();
        a.examProcess(); 
        // 输出：1.发试卷 → 2.学生A认真做题 → 3.收试卷
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

##### 2.2 接口（行为规范）

###### 2.2.1 基础语法 + JDK8 新特性（直接运行）

java

运行

```
// 接口：行为规范
interface Swim {
    // 抽象方法（默认public abstract）
    void swim();
    // 默认方法（有方法体，可重写）
    default void warmUp() {
        System.out.println("热身运动");
    }
    // 静态方法（接口名调用）
    static void showRule() {
        System.out.println("禁止潜水");
    }
}

// 实现接口
class Fish implements Swim {
    @Override
    public void swim() {
        System.out.println("鱼游");
    }
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Fish f = new Fish();
        f.warmUp(); // 输出：热身运动
        f.swim(); // 输出：鱼游
        Swim.showRule(); // 输出：禁止潜水
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.2.2 接口多实现（弥补单继承）

java

运行

```
interface Run { void run(); }
interface Fly { void fly(); }

// 实现多个接口
class Bird implements Run, Fly {
    @Override
    public void run() { System.out.println("鸟跑"); }
    @Override
    public void fly() { System.out.println("鸟飞"); }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

##### 2.3 代码块（初始化工具）

java

运行

```
class BlockDemo {
    // 静态代码块：类加载时执行（仅一次）
    static { System.out.println("静态代码块1"); }
    static { System.out.println("静态代码块2"); }
    
    // 实例代码块：创建对象时执行（构造器前）
    { System.out.println("实例代码块1"); }
    { System.out.println("实例代码块2"); }
    
    public BlockDemo() { System.out.println("构造器"); }
}

public class BlockTest {
    public static void main(String[] args) {
        new BlockDemo(); 
        // 输出：静态1→静态2→实例1→实例2→构造器
        new BlockDemo();
        // 输出：实例1→实例2→构造器（静态代码块不重复执行）
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

##### 2.4 内部类（类的内部组件）

###### 2.4.1 成员内部类（直接运行）

java

运行

```
class Outer {
    private String outerName = "外部类";
    
    // 成员内部类：依赖外部类实例
    class Inner {
        private String innerName = "内部类";
        public void show() {
            // 直接访问外部类私有成员
            System.out.println(outerName + " + " + innerName);
        }
    }
    
    public void accessInner() {
        Inner inner = new Inner();
        System.out.println(inner.innerName);
    }
}

public class InnerClassDemo {
    public static void main(String[] args) {
        // 创建内部类对象：外部类实例.new 内部类()
        Outer.Inner inner = new Outer().new Inner();
        inner.show(); // 输出：外部类 + 内部类
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.4.2 匿名内部类（核心应用）

java

运行

```
interface Swim { void swim(); }

public class AnonymousDemo {
    public static void main(String[] args) {
        // 匿名内部类：快速创建接口实现类对象
        Swim s = new Swim() {
            @Override
            public void swim() {
                System.out.println("匿名内部类实现游泳");
            }
        };
        s.swim(); // 输出：匿名内部类实现游泳
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 三、高频面试题详解

##### 面试题 1：抽象类 vs 接口

**问题**：设计支付功能（微信 / 支付宝 / 银联），都有 “发起支付”“查询状态”，且有固定 “安全校验” 流程，该用抽象类还是接口？为什么？**解答**：

- 用「抽象类」实现： 

  1. 抽象类封装固定流程（安全校验）和通用属性（支付名称）；
  2. 抽象方法定义 “发起支付”“查询状态”（子类个性化实现）；

- 核心区别： 

  | 维度     | 抽象类                   | 接口                         |
  | -------- | ------------------------ | ---------------------------- |
  | 继承关系 | 单继承                   | 多实现 / 多继承              |
  | 成员类型 | 抽象 / 普通方法、变量    | 抽象 / 默认 / 静态方法、常量 |
  | 设计理念 | is-a（子类是父类的一种） | has-a（类具备某种行为）      |

##### 面试题 2：代码块执行顺序

**问题**：父类 + 子类的代码块执行顺序？**解答**：父类静态代码块 → 子类静态代码块 → 父类实例代码块 → 父类构造器 → 子类实例代码块 → 子类构造器。

#### 四、总结

1. 抽象类核心：不能创建对象，子类必须实现所有抽象方法，适合封装固定流程（模板方法模式）；
2. 接口核心：JDK8+ 支持默认 / 静态方法，多实现弥补单继承，适合定义行为规范；
3. 代码块核心：静态代码块初始化类（仅一次），实例代码块初始化对象（每次创建都执行）；
4. 内部类核心：成员内部类依赖外部类实例，匿名内部类简化接口 / 父类的一次性实现。

------

### 

