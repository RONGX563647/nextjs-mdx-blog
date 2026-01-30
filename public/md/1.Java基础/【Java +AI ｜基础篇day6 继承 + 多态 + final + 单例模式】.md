#  06 Java Day06🚀  OOP进阶核心：继承+多态+final+单例模式速查笔记

> 💡 **核心提示**：继承和多态是 OOP 实现代码复用和灵活扩展的核心，看似简单却藏着很多易踩的细节坑。本文把继承、多态、final、单例模式的核心概念、语法要素、综合案例和高频面试题拆解清楚，所有代码极简可运行。

## 📑 目录

- [一、继承（Inheritance）](#一继承inheritance)
  - [1. 核心概念](#1-核心概念)
  - [2. 基础语法](#2-基础语法)
  - [3. 继承中的权限控制](#3-继承中的权限控制)
  - [4. 方法重写规则（Override）](#4-方法重写规则override)
  - [5. 子类构造器执行顺序](#5-子类构造器执行顺序)
- [二、多态（Polymorphism）](#二多态polymorphism)
  - [1. 三大前提](#1-三大前提)
  - [2. 核心特性](#2-核心特性)
  - [3. 多态优势](#3-多态优势)
  - [4. 多态局限性](#4-多态局限性)
  - [5. 属性 vs 方法在多态中的区别](#5-属性-vs-方法在多态中的区别)
- [三、final关键字](#三final关键字)
  - [1. 修饰类：不可继承](#1-修饰类不可继承)
  - [2. 修饰方法：不可重写](#2-修饰方法不可重写)
  - [3. 修饰变量：值不可变](#3-修饰变量值不可变)
  - [4. static final：全局常量](#4-static-final全局常量)
- [四、单例设计模式](#四单例设计模式)
  - [1. 核心目标](#1-核心目标)
  - [2. 饿汉式（线程安全）](#2-饿汉式线程安全)
  - [3. 懒汉式（双重检查锁，线程安全）](#3-懒汉式双重检查锁线程安全)
  - [4. 枚举单例（推荐）](#4-枚举单例推荐)
- [五、高频面试题](#五高频面试题)
- [六、快速记忆口诀](#六快速记忆口诀)
- [七、实战建议](#七实战建议)

---

## 📚 一、继承（Inheritance）

### 1️⃣ 核心概念

- **子承父业**：子类通过`extends`继承父类成员
- **代码复用**：抽取共性到父类，子类继承并扩展
- **单继承**：Java中一个类只能继承一个父类

### 2️⃣ 基础语法

java

```
class Parent {
    String name;
    public void eat() { System.out.println(name + "吃饭"); }
}

class Child extends Parent {
    int age;  // 子类特有属性
    public void study() {  // 子类特有方法
        System.out.println(name + "（" + age + "岁）学习");
    }
}
```

> 📌 **继承关系图：**

```
┌─────────────────────────────────────────────────────────────┐
│                  继承关系示意图                      │
│                                                             │
│   父类（Parent）- 基类 / 超类                              │
│   ┌─────────────────────────────────────────────┐           │
│   │              Parent 类                       │           │
│   │                                             │           │
│   │   属性：                                     │           │
│   │   • String name    姓名                     │           │
│   │                                             │           │
│   │   方法：                                     │           │
│   │   • eat()        吃饭                       │           │
│   │                                             │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      │ extends                               │
│                      │ 继承                                 │
│                      ▼                                       │
│   子类（Child）- 派生类                                     │
│   ┌─────────────────────────────────────────────┐           │
│   │              Child 类                        │           │
│   │                                             │           │
│   │   继承的属性：                               │           │
│   │   • String name    姓名（来自父类）           │           │
│   │                                             │           │
│   │   特有属性：                                 │           │
│   │   • int age        年龄                     │           │
│   │                                             │           │
│   │   继承的方法：                               │           │
│   │   • eat()        吃饭（来自父类）           │           │
│   │                                             │           │
│   │   特有方法：                                 │           │
│   │   • study()      学习                       │           │
│   │                                             │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   说明：                                                    │
│   • 子类继承父类的所有非私有成员                            │
│   • 子类可以扩展自己的属性和方法                              │
│   • 子类可以重写父类的方法                                  │
│   • Java只支持单继承（一个类只能有一个父类）                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3️⃣ 继承中的权限控制

| 修饰符    | 同一类 | 同一包 | 不同包子类 | 不同包非子类 |
|:---------:|:------:|:------:|:---------:|:-----------:|
| private   | √      | ×      | ×          | ×            |
| default   | √      | √      | ×          | ×            |
| protected | √      | √      | √          | ×            |
| public    | √      | √      | √          | √            |

### 4️⃣ 方法重写规则（Override）

1. **方法签名一致**：方法名、参数列表必须相同
2. **访问权限**：子类方法权限 ≥ 父类方法
3. **返回值类型**：子类 ≤ 父类（协变返回类型）
4. **异常抛出**：子类异常 ≤ 父类异常
5. **不能重写**：`private`、`static`、`final`方法

java

```
class Animal {
    public void cry() { System.out.println("动物叫"); }
}

class Dog extends Animal {
    @Override  // 注解表示重写，可选但推荐
    public void cry() { System.out.println("小狗汪汪叫"); }
}
```

### 5️⃣ 子类构造器执行顺序

1. **默认调用**：子类构造器隐式调用父类无参构造器

2. **显式调用**：若父类无无参构造器，必须用`super(参数)`显式调用

3. **执行顺序**：

   text

   ```
   父类构造器 → 子类构造器
   ```

java

```
class Parent {
    public Parent(String name) { this.name = name; }
    String name;
}

class Child extends Parent {
    int age;
    public Child(String name, int age) {
        super(name);  // 必须先调用父类构造器
        this.age = age;
    }
}
```

------

## 二、多态（Polymorphism）

### 1. 三大前提

1. **继承关系**：子类继承父类
2. **方法重写**：子类重写父类方法
3. **父类引用指向子类对象**：`Parent obj = new Child()`

### 2. 核心特性

- **动态绑定**：运行时根据实际对象类型调用方法
- **编译看左，运行看右**：编译时看引用类型，运行时看对象类型

java

```
Animal a = new Dog();  // 父类引用指向子类对象
a.cry();  // 输出"小狗汪汪叫"（动态绑定到Dog类的cry方法）
```

**多态动态绑定图：**

```
┌─────────────────────────────────────────────────────────────┐
│                  多态动态绑定机制                    │
│                                                             │
│   编译期（Compile Time）                                     │
│   ┌─────────────────────────────────────────────┐           │
│   │   Animal a = new Dog();                     │           │
│   │                                             │           │
│   │   编译器检查：                               │           │
│   │   • a 的类型是 Animal（看左边）               │           │
│   │   • Animal 类有 cry() 方法 ✓                 │           │
│   │   • 编译通过                               │           │
│   └─────────────────────────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   运行期（Runtime）                                         │
│   ┌─────────────────────────────────────────────┐           │
│   │   a.cry();  执行方法调用                   │           │
│   │                                             │           │
│   │   JVM 动态绑定：                              │           │
│   │   • a 实际指向的是 Dog 对象（看右边）         │           │
│   │   • 调用 Dog 类的 cry() 方法                 │           │
│   │   • 输出："小狗汪汪叫"                       │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   内存结构：                                                │
│   ┌──────────────────┐         ┌──────────────────┐         │
│   │   栈内存         │         │   堆内存         │         │
│   │                  │         │                  │         │
│   │  ┌────────────┐  │         │  ┌────────────┐  │         │
│   │  │     a     │  │────────►│  │ Dog 对象   │  │         │
│   │  │ Animal类型 │  │  地址   │  │ 0x1234     │  │         │
│   │  │ 0x1234    │  │         │  └─────┬──────┘  │         │
│   │  └────────────┘  │         │        │         │         │
│   └──────────────────┘         │        ▼         │         │
│                                │  ┌────────────┐  │         │
│                                │  │ cry() 方法  │  │         │
│                                │  │ "汪汪叫"   │  │         │
│                                │  └────────────┘  │         │
│                                └──────────────────┘         │
│                                                             │
│   说明：                                                    │
│   • 编译期：检查引用类型是否有该方法（看左边）                │
│   • 运行期：根据实际对象类型调用方法（看右边）                │
│   • 动态绑定：运行时才确定调用哪个方法                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. 多态优势

- **解耦**：调用方依赖父类，不依赖具体子类
- **扩展性**：新增子类无需修改调用方代码
- **灵活性**：同一方法不同实现

java

```
public void feed(Animal a) {
    a.cry();  // 传入Dog输出"汪汪"，传入Cat输出"喵喵"
}
```

### 4. 多态局限性

java

```
Animal a = new Dog();
// a.study();  // 编译错误，父类引用不能调用子类特有方法

// 解决方案：向下转型（需用instanceof检查）
if (a instanceof Dog) {
    Dog d = (Dog) a;
    d.study();  // 可调用子类特有方法
}
```

### 5. 属性 vs 方法在多态中的区别

java

```
class Animal {
    String name = "动物";
    public void cry() { System.out.println("动物叫"); }
}

class Dog extends Animal {
    String name = "小狗";  // 隐藏父类name属性
    @Override
    public void cry() { System.out.println("小狗叫"); }
}

Animal a = new Dog();
System.out.println(a.name);  // 输出"动物"（属性静态绑定）
a.cry();  // 输出"小狗叫"（方法动态绑定）
```

------

## 三、final关键字

### 1. 修饰类：不可继承

java

```
final class FinalClass { }  // 不能被继承
// class SubClass extends FinalClass { }  // 编译错误
```

### 2. 修饰方法：不可重写

java

```
class Parent {
    public final void show() { }  // 子类不能重写此方法
}
```

### 3. 修饰变量：值不可变

| 变量类型 | final效果                | 示例                                                |
| -------- | ------------------------ | --------------------------------------------------- |
| 基本类型 | 值不可变                 | `final int x = 10;`                                 |
| 引用类型 | 引用不可变，对象内容可变 | `final List list = new ArrayList(); list.add("A");` |

java

```
// 基本类型
final int num = 10;
// num = 20;  // 编译错误

// 引用类型
final StringBuilder sb = new StringBuilder("hello");
sb.append(" world");  // 允许修改对象内容
// sb = new StringBuilder("hi");  // 编译错误（引用不可变）
```

### 4. static final：全局常量

java

```
public static final int MAX_SIZE = 100;  // 类加载时初始化，不可修改
```

------

## 四、单例设计模式

### 1. 核心目标

- 确保一个类只有一个实例
- 提供全局访问点
- 避免重复创建，节省资源

### 2. 饿汉式（线程安全）

java

```
public class HungrySingleton {
    // 1. 私有构造器
    private HungrySingleton() { }
    
    // 2. 类加载时创建实例
    private static final HungrySingleton INSTANCE = new HungrySingleton();
    
    // 3. 提供全局访问点
    public static HungrySingleton getInstance() {
        return INSTANCE;
    }
}
```

**特点**：线程安全，但非懒加载（可能浪费资源）

### 3. 懒汉式（双重检查锁，线程安全）

java

```
public class LazySingleton {
    // 1. 私有构造器
    private LazySingleton() { }
    
    // 2. volatile防止指令重排序
    private static volatile LazySingleton instance;
    
    // 3. 双重检查锁
    public static LazySingleton getInstance() {
        if (instance == null) {  // 第一次检查
            synchronized (LazySingleton.class) {
                if (instance == null) {  // 第二次检查
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}
```

**特点**：线程安全，懒加载，性能较好

### 4. 枚举单例（推荐）

java

```
public enum EnumSingleton {
    INSTANCE;  // 单例实例
    // 可添加方法
    public void doSomething() { }
}
```

**特点**：线程安全，防反射/序列化破坏，代码简洁

------

## 五、高频面试题

### Q1：方法重写的规则？

**A：**

1. 方法名和参数列表必须相同
2. 返回值类型相同或是父类返回值的子类（协变）
3. 访问权限不能低于父类方法
4. 不能抛出比父类更宽泛的受检异常
5. 不能重写`private`、`static`、`final`方法

### Q2：构造器能否被重写？

**A：**
 不能。构造器不是方法，不能被重写。子类构造器必须调用父类构造器（显式或隐式）。

### Q3：多态中属性和方法的访问区别？

**A：**

- **属性**：静态绑定，编译时根据引用类型决定
- **方法**：动态绑定，运行时根据实际对象类型决定

### Q4：final、finally、finalize区别？

**A：**

- **final**：修饰符，修饰类/方法/变量
- **finally**：异常处理块，无论是否异常都会执行
- **finalize**：Object类方法，垃圾回收前调用（已废弃）

### Q5：单例模式如何保证线程安全？

**A：**

1. 饿汉式：类加载时创建，线程安全
2. 懒汉式：双重检查锁 + volatile
3. 枚举式：枚举特性保证线程安全

### Q6：如何破坏单例模式？如何防止？

**A：**
 **破坏方式**：

1. 反射调用私有构造器
2. 序列化/反序列化
3. 克隆

**防止方法**：

1. 枚举单例（天然防反射和序列化）
2. 重写`readResolve()`方法
3. 重写`clone()`方法并返回单例实例

------

## 六、快速记忆口诀

### 继承

- 子承父业用extends，代码复用效率高
- 构造器要先调父类，super关键字不能少
- 重写方法要一致，权限不能更缩小

### 多态

- 父类引用子类对象，方法重写才生效
- 属性访问看左边，方法调用看右边
- 向下转型要检查，instanceof保安全

### final关键字

- final修饰不可变，类方法变量都能管
- 类被final不能继承，方法被final不能重写
- 变量被final值不变，引用变量地址不能换

### 单例模式

- 单例模式三要素：私有构造、静态实例、公共访问
- 饿汉加载立即创，懒汉延迟双重查
- 枚举单例最推荐，安全简洁不怕破坏

------

## 七、实战建议

### 继承设计

1. 优先使用组合而非继承（除非明确is-a关系）
2. 避免过深的继承层次（≤3层）
3. 抽象出稳定的父类，将变化封装在子类

### 多态应用

1. 面向接口/父类编程，提高扩展性
2. 使用工厂模式创建对象，隐藏具体类型
3. 策略模式、模板方法模式都是多态的典型应用

### final使用

1. 工具类声明为final，防止被继承修改
2. 常量使用static final，命名全大写
3. 方法参数声明为final，避免意外修改

### 单例选择

1. 简单场景用饿汉式
2. 资源敏感用懒汉式（双重检查锁）
3. 高要求用枚举式（防反射/序列化）

**核心思想**：理解设计意图比记忆语法更重要，结合实际场景选择最合适的实现方案。多写代码多思考，掌握OOP设计思想，提升代码质量和可维护性。



------

------

### Java 面向对象编程（OOP）进阶篇①：继承 + 多态 + final + 单例模式

（初学者友好 + 可运行代码 + 面试题详解）

#### 前言

初学 Java 面向对象进阶内容时，我被继承的权限修饰符、方法重写的规则、多态的动态绑定这些知识点绕晕，尤其面试时对单例模式的线程安全、final 关键字的底层逻辑把握不准 —— 继承和多态是 OOP 实现代码复用和灵活扩展的核心，看似简单却藏着很多易踩的细节坑。这篇内容把继承、多态、final、单例模式的核心概念、语法要素、综合案例和高频面试题拆解清楚，所有代码极简可运行，既方便自己后续快速回顾，也帮新手吃透 OOP 进阶核心思想。

#### 一、核心思路 / 概念（大白话讲透）

1. **继承**：核心是「子承父业，按需扩展」—— 把子类和父类的共性逻辑抽到父类，子类通过 `extends` 继承父类的成员（变量 + 方法），同时新增自己的特有功能，实现代码纵向复用。
2. **多态**：核心是「同一行为，不同实现」—— 父类引用指向子类对象，调用方法时自动执行子类的重写实现，让代码更灵活、易扩展。
3. **final**：核心是「最终不可变」—— 修饰类不让继承、修饰方法不让重写、修饰变量不让改值，是保障代码稳定性的关键。
4. **单例模式**：核心是「一生只造一个对象」—— 确保某个类在内存中只有一个实例，避免重复创建浪费资源。

#### 二、实操步骤 + 可运行代码

##### 2.1 继承（OOP 三大特征之二）

###### 2.1.1 基础语法（直接运行）

java

运行

```
// 父类：抽取共性
class Parent {
    String name;
    public void eat() {
        System.out.println(name + "吃饭");
    }
}

// 子类：继承+扩展
class Child extends Parent {
    int age; // 子类特有属性
    public void study() { // 子类特有方法
        System.out.println(name + "（" + age + "岁）学习");
    }
}

// 测试类
public class ExtendDemo {
    public static void main(String[] args) {
        Child c = new Child();
        c.name = "张三"; // 继承父类的属性
        c.age = 18;
        c.eat(); // 继承父类的方法：张三吃饭
        c.study(); // 子类特有方法：张三（18岁）学习
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.1.2 权限修饰符的访问规则（关键案例）

java

运行

```
// 包1：父类
package com.parent;
public class Parent {
    protected String name = "父类名字";
}

// 包2：子类
package com.child;
import com.parent.Parent;
public class Child extends Parent {
    public void show() {
        System.out.println(super.name); // 合法：继承上下文访问
        Parent p = new Parent();
        // System.out.println(p.name); // 非法：跨包通过父类对象访问protected
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.1.3 方法重写（Override）规则（直接运行）

java

运行

```
class Animal {
    public void cry() {
        System.out.println("动物叫");
    }
}

class Dog extends Animal {
    // 正确重写：方法签名一致、权限不缩小
    @Override
    public void cry() {
        System.out.println("小狗汪汪叫");
    }
}

public class OverrideDemo {
    public static void main(String[] args) {
        Animal a = new Dog();
        a.cry(); // 输出：小狗汪汪叫（动态绑定）
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.1.4 子类构造器执行流程（直接运行）

java

运行

```
class Parent {
    public Parent(String name) { // 父类无参构造器失效
        this.name = name;
    }
    String name;
}

class Child extends Parent {
    int age;
    // 必须显式调用父类有参构造器
    public Child(String name, int age) {
        super(name); // 第一行：初始化父类
        this.age = age;
    }
}

public class ConstructorDemo {
    public static void main(String[] args) {
        Child c = new Child("李四", 20);
        System.out.println(c.name + "，" + c.age + "岁"); // 输出：李四，20岁
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

##### 2.2 多态（OOP 三大特征之三）

###### 2.2.1 多态的三大前提（直接运行）

java

运行

```
// 1. 继承关系
class Animal {
    public void cry() { System.out.println("动物叫"); }
}
class Cat extends Animal {
    // 2. 方法重写
    @Override
    public void cry() { System.out.println("小猫喵喵叫"); }
}

public class PolymorphismDemo {
    public static void main(String[] args) {
        // 3. 父类引用指向子类对象
        Animal a = new Cat();
        a.cry(); // 输出：小猫喵喵叫（动态绑定）
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.2.2 多态的优势：解耦 + 扩展（直接运行）

java

运行

```
// 调用方仅依赖父类，无需关心子类
public class FeedDemo {
    public static void feed(Animal a) {
        a.cry();
    }

    public static void main(String[] args) {
        feed(new Dog()); // 输出：小狗汪汪叫
        feed(new Cat()); // 输出：小猫喵喵叫
        // 新增子类无需修改feed方法（开闭原则）
        feed(new Bird()); // 输出：小鸟叽叽叫
    }
}

class Bird extends Animal {
    @Override
    public void cry() { System.out.println("小鸟叽叽叫"); }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.2.3 多态的局限与类型转换（直接运行）

java

运行

```
public class CastDemo {
    public static void main(String[] args) {
        Animal a = new Dog();
        // a.study(); // 报错：父类引用不能调子类特有方法
        
        // 安全转换：instanceof + 强制转换
        if (a instanceof Dog) {
            Dog d = (Dog) a;
            d.study(); // 输出：小狗学习
        }
    }
}

class Dog extends Animal {
    @Override
    public void cry() { System.out.println("小狗汪汪叫"); }
    public void study() { System.out.println("小狗学习"); }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

##### 2.3 final 关键字（直接运行）

java

运行

```
// 1. final修饰类：不可继承（如String类）
final class FinalClass {}
// class SubClass extends FinalClass {} // 报错

// 2. final修饰方法：不可重写
class ParentFinal {
    public final void show() { System.out.println("父类方法"); }
}
class ChildFinal extends ParentFinal {
    // @Override
    // public void show() {} // 报错
}

// 3. final修饰变量：值不可改
public class FinalDemo {
    public static void main(String[] args) {
        final int num = 10;
        // num = 20; // 报错
        
        final StringBuilder sb = new StringBuilder("hello");
        sb.append(" world"); // 合法：对象内容可改
        // sb = new StringBuilder("hi"); // 报错：地址不可改
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

##### 2.4 单例设计模式

###### 2.4.1 饿汉式（线程安全，直接运行）

java

运行

```
public class HungrySingleton {
    // 1. 私有构造器：禁止外部创建
    private HungrySingleton() {}
    
    // 2. 类加载时创建实例（仅一次）
    private static final HungrySingleton INSTANCE = new HungrySingleton();
    
    // 3. 对外提供获取方法
    public static HungrySingleton getInstance() {
        return INSTANCE;
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

###### 2.4.2 懒汉式（线程安全版，直接运行）

java

运行

```
public class LazySingleton {
    private LazySingleton() {}
    
    // volatile：禁止指令重排序
    private static volatile LazySingleton instance;
    
    public static LazySingleton getInstance() {
        // 第一次检查：避免不必要的锁
        if (instance == null) {
            synchronized (LazySingleton.class) {
                // 第二次检查：避免重复创建
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

#### 三、高频面试题详解

##### 面试题 1：继承 + 方法重写

**问题**：分析以下代码问题，修复并解释方法重写规则。

java

运行

```
class Person {
    public Person(String name) { this.name = name; }
    String name;
    public String toString() { return name; }
}
class Student extends Person {
    String id;
    public Student(String name, String id) {
        this.name = name; // 错误：未调用父类构造器
        this.id = id;
    }
    public String toString(String prefix) { // 错误：不是重写
        return prefix + name + "，" + id;
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

**解答**：

1. 错误 1：子类构造器未调用父类有参构造器 → 加 `super(name)`；
2. 错误 2：`toString` 参数列表不一致 → 重写需保持签名一致；**修复后代码**：

java

运行

```
class Student extends Person {
    String id;
    public Student(String name, String id) {
        super(name); // 调用父类构造器
        this.id = id;
    }
    @Override
    public String toString() { // 正确重写
        return "学生：" + name + "，学号：" + id;
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

**核心规则**：方法名 / 参数列表一致、权限不缩小、返回值兼容。

##### 面试题 2：多态的属性 vs 方法

**问题**：分析运行结果，解释多态下属性和方法的访问规则。

java

运行

```
class Animal {
    String name = "动物";
    public void cry() { System.out.println("动物叫"); }
}
class Dog extends Animal {
    String name = "小狗";
    @Override
    public void cry() { System.out.println("小狗叫"); }
}
public class Test {
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.name);
        a.cry();
    }
}
```

![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

**解答**：

- 运行结果：`动物`、`小狗叫`；
- 规则：方法有动态绑定（看对象类型），属性无多态（看引用类型）。

#### 四、总结

1. 继承核心：子类构造器必须先初始化父类，方法重写需遵循签名一致、权限不缩小规则；
2. 多态核心：父类引用指向子类对象，方法看对象类型，属性看引用类型，向下转型需用 `instanceof` 校验；
3. final 核心：修饰类 / 方法禁止继承 / 重写，修饰变量禁止改值，static final 是全局常量；
4. 单例核心：私有构造器 + 静态方法返回实例，懒汉式需加双重检查锁 + volatile 保证线程安全。





![img](https://i-blog.csdnimg.cn/direct/a71e9bde1ee54f779f1c83ca860b50d7.jpg)![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)编辑

![img](https://i-blog.csdnimg.cn/direct/f5920e16d2a243ea8bea8a1529f369cf.jpg)![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)编辑

![img](https://i-blog.csdnimg.cn/direct/12287379055945dfb4d0debb2d335d5c.jpg)![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)编辑