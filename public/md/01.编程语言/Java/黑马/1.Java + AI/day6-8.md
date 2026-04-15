# 【Java +AI ｜基础篇day6、7、8 OOP高级 继承 多态 抽象 代码块 内部类 函数式编程】

## 一、继承（OOP 三大特征之二）—— 从代码复用到底层逻辑

继承是 Java 实现**代码纵向复用**的核心机制，通过建立类的父子关系，让子类复用父类的共性逻辑，同时扩展自身特有功能。

### 1. 继承的底层本质与语法

- **核心定义**：子类（派生类）通过 `extends` 关键字继承父类（基类 / 超类），本质是**子类对象包含父类的成员变量和方法**（内存中子类对象由 “父类部分 + 子类部分” 组成）。

- 语法格式

  ：

  java

  ```java
  // 父类（共性抽取）
  class Parent {
      String name; // 父类成员变量
      public void eat() { // 父类成员方法
          System.out.println(name + "吃饭");
      }
  }
  // 子类（继承+扩展）
  class Child extends Parent {
      int age; // 子类特有成员变量
      public void study() { // 子类特有方法
          System.out.println(name + "（" + age + "岁）学习");
      }
  }
  ```

  

- **内存模型**：创建子类对象 `Child c = new Child();` 时，堆内存中先初始化父类部分（`name` 等），再初始化子类部分（`age` 等），栈内存的引用 `c` 指向整个子类对象。

### 2. 权限修饰符的底层控制逻辑

权限修饰符通过 **JVM 访问校验机制** 限制成员的可访问范围，直接决定子类能否继承父类成员：

| 修饰符         | 本类 | 同一包 | 子孙类（跨包） | 任意类 | 继承可见性原理                                               |
| -------------- | ---- | ------ | -------------- | ------ | ------------------------------------------------------------ |
| `private`      | √    |        |                |        | 编译期直接限制访问，字节码中标记为私有，子类无法获取成员引用 |
| 缺省（无修饰） | √    | √      |                |        | 仅包内可见，跨包子类编译时无法解析成员符号                   |
| `protected`    | √    | √      | √              |        | 跨包子类可通过 “继承上下文” 访问（如子类方法中直接调用 `super.成员`），但无法通过父类对象访问 |
| `public`       | √    | √      | √              | √      | 无访问限制，编译期不做限制，运行时可通过任意对象访问         |

**关键案例**：跨包子类访问父类 `protected` 成员

java

```java
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
        System.out.println(super.name); // 合法：通过super访问（继承上下文）
        Parent p = new Parent();
        // System.out.println(p.name); // 非法：跨包通过父类对象访问protected成员
    }
}
```

### 3. 继承的核心规则与陷阱

#### （1）单继承与多层继承的设计原因

- 单继承

  ：一个类只能有一个直接父类。

  

  ✅ 原因：避免 “菱形继承冲突”—— 若类 A 同时继承 B 和 C，而 B、C 都有

   

  ```
  method()
  ```

   

  方法，子类调用

   

  ```
  method()
  ```

   

  时无法确定执行哪个父类的方法（C++ 支持多继承，需手动解决冲突，Java 简化设计）。

- 多层继承

  ：支持 “祖父→父→子” 的继承链（如

   

  ```
  Object→Parent→Child
  ```

  ）。

  

  ✅ 优势：逐步细化功能，符合 “单一职责原则”（每层只扩展少量特有功能）。

#### （2）Object 类 —— 所有类的祖宗

- **底层逻辑**：Java 中所有类（包括自定义类、API 类）都直接或间接继承 `java.lang.Object`，编译时编译器会自动为无显式父类的类添加 `extends Object`。

- 核心方法

  （子类可重写）：

  - `toString()`：默认返回 “类名 @哈希码”（如 `com.Child@1b6d3586`），重写后可返回对象属性（开发中必重写）。
  - `equals(Object obj)`：默认比较对象地址（`==`），重写后可自定义相等规则（如比较 `name` 和 `age`）。
  - `hashCode()`：默认返回对象地址相关的哈希值，重写 `equals` 时必须重写（保证 “相等对象哈希值相等”）。

### 4. 方法重写（Override）—— 多态的前提

方法重写是子类对父类方法的 “重新实现”，需严格遵循**方法签名一致性**和**访问权限规则**，否则编译报错。

#### （1）重写的严格规则（编译器校验逻辑）

1. 方法签名完全一致

   ：方法名、参数列表（个数、类型、顺序）必须与父类完全相同。

   

   ❌ 错误示例：父类

    

   ```
   eat(String food)
   ```

   ，子类

    

   ```
   eat(int num)
   ```

   （参数类型不同，不是重写，是重载）。

2. 访问权限不缩小

   ：子类重写方法的权限 ≥ 父类方法（

   ```
   public > protected > 缺省
   ```

   ）。

   

   ❌ 错误示例：父类

    

   ```
   public void run()
   ```

   ，子类

    

   ```
   protected void run()
   ```

   （权限缩小，编译报错）。

3. 返回值类型兼容

   ：

   - JDK7 前：必须与父类完全相同。
   - JDK7 后：支持 “协变返回值”—— 子类返回值可是父类返回值的子类（如父类返回 `Animal`，子类返回 `Dog`）。

4. **异常声明不扩大**：子类重写方法声明的异常 ≤ 父类方法（异常类型可相同或为子类）。

5. 不可重写的方法

   ：

   - 父类 `private` 方法：子类无法继承，不存在重写。
   - 父类 `static` 方法：属于类，子类若定义同名静态方法，是 “隐藏” 而非 “重写”（调用时看引用类型，不看对象类型）。

#### （2）重写的底层实现 —— 动态绑定

- 动态绑定

  ：调用重写方法时，JVM 会在

  运行时根据对象的实际类型

  确定执行哪个版本的方法（而非编译时根据引用类型）。

  

  示例：

  java

  ```java
  Parent p = new Child(); // 父类引用指向子类对象
  p.eat(); // 运行时执行 Child 的 eat()（若重写），而非 Parent 的 eat()
  ```

  

- **实现原理**：每个类的字节码中都有一个 “方法表”，记录方法的签名和地址。当调用方法时，JVM 先获取对象的实际类型，再从该类型的方法表中找到方法地址，执行对应逻辑。

### 5. 子类构造器的底层执行流程

子类构造器的核心规则：**必须先初始化父类部分，再初始化子类部分**，底层通过 `super()` 实现。

#### （1）默认执行逻辑

- 子类构造器中，若未显式调用 `super()` 或 `this()`，编译器会自动在构造器第一行添加 `super()`（调用父类无参构造器）。
- **执行顺序**：父类静态代码块 → 子类静态代码块 → 父类实例代码块 → 父类构造器 → 子类实例代码块 → 子类构造器。

#### （2）父类无无参构造器的解决方案

若父类自定义了有参构造器，默认无参构造器会失效，子类必须显式调用父类有参构造器：

java

```java
// 父类（无无参构造器）
class Parent {
    String name;
    public Parent(String name) { // 自定义有参构造器
        this.name = name;
    }
}
// 子类（必须显式调用父类有参构造器）
class Child extends Parent {
    int age;
    // 方案1：调用父类有参构造器
    public Child(String name, int age) {
        super(name); // 必须在第一行，初始化父类name
        this.age = age;
    }
    // 方案2：通过this()调用本类其他构造器，间接调用父类构造器
    public Child() {
        this("默认名字", 0); // 调用本类有参构造器
    }
}
```

#### （3）`this(...)` 与 `super(...)` 的冲突

- 两者都必须位于构造器第一行，因此**不能同时存在**（JVM 需确保先初始化父类或先调用本类其他构造器，二选一）。

  

## 二、多态（OOP 三大特征之三）—— 从行为多样性到解耦

多态是 “同一行为，不同实现” 的体现，核心是**父类引用指向子类对象**，通过动态绑定实现灵活调用，是 Java 解耦和扩展的关键。

### 1. 多态的三大前提与底层条件

- **前提 1：继承 / 实现关系**：多态基于继承（类→类）或实现（类→接口），确保父类与子类有共性行为。
- **前提 2：父类引用指向子类对象**：`Parent p = new Child();`（向上转型），引用类型是父类，对象类型是子类。
- **前提 3：方法重写**：子类重写父类的方法，否则调用的是父类的默认实现（无多态效果）。

**关键注意**：**属性无多态**—— 访问属性时，JVM 编译时根据引用类型确定，而非对象类型（如 `p.name` 访问的是父类的 `name`）。

### 2. 多态的核心优势 —— 解耦与扩展

#### （1）解耦：对象与逻辑分离

多态下，调用方仅依赖父类接口，不关心子类具体实现，修改子类时无需修改调用代码：

java



```java
// 调用方代码（仅依赖父类）
public class Test {
    public static void feed(Parent p) { // 父类作为参数
        p.eat(); // 不关心p是Parent还是Child，统一调用
    }

    public static void main(String[] args) {
        feed(new Parent()); // 传入父类对象
        feed(new Child());  // 传入子类对象（无需修改feed方法）
    }
}
```

#### （2）扩展：支持动态切换实现

新增子类时，无需修改现有代码，直接传入调用方即可（符合 “开闭原则”）：

java

```java
// 新增子类
class GrandChild extends Parent {
    @Override
    public void eat() {
        System.out.println("孙子吃饭");
    }
}
// 直接使用，无需修改feed方法
feed(new GrandChild()); 
```

### 3. 多态的局限与类型转换解决方案

#### （1）局限：无法直接调用子类特有方法

父类引用仅能访问父类定义的方法，无法直接调用子类特有方法（如 `p.study()` 编译报错，因 `Parent` 无 `study()` 方法）。

#### （2）类型转换：解决子类特有方法调用

多态下的类型转换分为**向上转型**（自动）和**向下转型**（强制），底层是 “引用类型的转换”，对象实际类型不变。

| 类型转换         | 语法格式                  | 特点                                                         | 适用场景             |
| ---------------- | ------------------------- | ------------------------------------------------------------ | -------------------- |
| 向上转型（自动） | `Parent p = new Child();` | 安全（子类→父类，范围扩大），无需显式转换                    | 多态调用（统一接口） |
| 向下转型（强制） | `Child c = (Child) p;`    | 风险（父类→子类，范围缩小），需确保对象实际类型是子类，否则抛 `ClassCastException` | 调用子类特有方法     |

#### （3）安全校验：`instanceof` 关键字

`instanceof` 用于判断对象的**实际类型**，返回 `boolean`，是避免类型转换异常的核心手段：

java

```java
Parent p = new Child();
if (p instanceof Child) { // 判断p的实际类型是Child
    Child c = (Child) p;
    c.study(); // 安全调用子类特有方法
}
if (p instanceof GrandChild) { // 实际类型不是GrandChild，返回false
    GrandChild gc = (GrandChild) p; // 不会执行，避免异常
}
```

## 三、核心关键字与设计模式 —— 从语法到架构

### 1. final 关键字 —— 不可变的底层保障

`final` 表示 “最终不可变”，通过编译期限制和运行时校验，确保被修饰的类、方法、变量不被修改。

#### （1）final 修饰类 —— 禁止继承

- **底层逻辑**：`final` 类的字节码中会被标记为 `ACC_FINAL`，编译器在处理子类继承时，若发现父类是 `final`，直接报错。
- **应用场景**：核心工具类（如 `java.lang.String`、`java.lang.Math`），避免子类修改核心逻辑（如 `String` 的不可变性）。

#### （2）final 修饰方法 —— 禁止重写

- **底层逻辑**：`final` 方法的字节码中标记为 `ACC_FINAL`，子类若定义同名方法，编译器会校验方法签名，发现父类方法是 `final` 则报错。
- **注意**：`final` 方法仍可被继承和调用，只是不能重写。

#### （3）final 修饰变量 —— 值不可变

- 基本类型变量

  ：编译期直接将变量值 “嵌入” 字节码，运行时无法修改（若尝试修改，编译器报错）。

  java

  ```java
  final int num = 10;
  // num = 20; // 编译报错：final变量不能修改
  ```

  

- 引用类型变量

  ：变量存储的

  地址

  不可变（无法指向新对象），但地址指向的

  对象内容

  可修改（如集合添加元素）：

  java

  ```java
  final List<String> list = new ArrayList<>();
  list.add("a"); // 合法：对象内容可修改
  // list = new LinkedList<>(); // 非法：地址不可修改
  ```

  

#### （4）常量（static final）—— 全局不可变

- **定义**：`static final` 修饰的变量是 “全局常量”，具备 “类级别的不可变性”（类加载时初始化，仅一次）。
- **命名规范**：全大写字母，多单词用下划线连接（如 `public static final String SCHOOL = "黑马程序员"`）。
- **底层优化**：编译时 “宏替换”—— 所有引用常量的地方，会直接替换为常量的字面量（如 `System.out.println(SCHOOL)` 编译后变为 `System.out.println("黑马程序员")`），性能与直接用字面量一致。

### 2. 单例设计模式 —— 确保唯一实例的底层实现

单例模式是 “创建型设计模式”，核心是**确保某个类在内存中仅存在一个实例**，避免重复创建对象浪费资源。

#### （1）饿汉式单例 —— 类加载时初始化

- 实现代码

  ：

  java

  ```java
  public class HungrySingleton {
      // 1. 私有构造器：禁止外部创建对象
      private HungrySingleton() {}
      
      // 2. 静态成员变量：类加载时创建实例（仅一次）
      private static final HungrySingleton INSTANCE = new HungrySingleton();
      
      // 3. 静态方法：返回唯一实例
      public static HungrySingleton getInstance() {
          return INSTANCE;
      }
  }
  ```

  

- **底层逻辑**：类加载时（`HungrySingleton.class` 加载到方法区），静态变量 `INSTANCE` 会被初始化，由于类仅加载一次，实例也仅创建一次。

- **优点**：线程安全（类加载由 JVM 保证线程安全），简单高效。

- **缺点**：类加载时就创建实例，若实例未被使用，会浪费内存（如工具类的单例）。

#### （2）懒汉式单例 —— 延迟加载（线程安全版）

- **问题**：基础懒汉式（无锁）线程不安全（多线程同时调用 `getInstance()` 可能创建多个实例）。

- 线程安全实现

  ：双重检查锁（DCL，Double-Checked Locking）+

   

  ```
  volatile
  ```

  ：

  java

  ```java
  public class LazySingleton {
      private LazySingleton() {}
      
      // volatile：禁止指令重排序，确保实例初始化完成后再赋值给变量
      private static volatile LazySingleton instance;
      
      public static LazySingleton getInstance() {
          // 第一次检查：避免不必要的锁竞争（实例已创建时直接返回）
          if (instance == null) {
              synchronized (LazySingleton.class) { // 类锁：保证同一时间仅一个线程进入
                  // 第二次检查：避免多线程等待锁时重复创建实例
                  if (instance == null) {
                      instance = new LazySingleton(); 
                      // 若无volatile，可能发生指令重排序：赋值给instance时，对象尚未初始化完成
                  }
              }
          }
          return instance;
      }
  }
  ```

  

- **关键细节**：`volatile` 关键字的作用 —— 禁止 `instance = new LazySingleton()` 的指令重排序（该操作分三步：1. 分配内存；2. 初始化对象；3. 赋值给变量），确保其他线程看到 `instance` 非 `null` 时，对象已完全初始化。

#### （3）枚举单例 —— 最安全的实现

- 实现代码

  ：

  java

  

  运行

  ```java
  public enum EnumSingleton {
      INSTANCE; // 唯一实例（枚举常量）
      
      // 枚举类的方法
      public void doSomething() {
          System.out.println("枚举单例执行方法");
      }
  }
  ```

  

- 底层优势

  ：

  1. 枚举类默认私有构造器，外部无法创建对象。
  2. 枚举类的实例由 JVM 管理，确保线程安全（枚举类加载时初始化实例）。
  3. 避免反射破坏单例（反射无法创建枚举类的实例）。

- **应用场景**：高安全性场景（如配置中心、数据库连接池）。

### 3. 枚举类（Enum）—— 类型安全的常量定义

枚举是 “特殊的类”，用于定义**固定数量的常量**（如状态、方向），比普通常量更安全（避免非法值）。

#### （1）枚举类的底层结构

编译器会将枚举类编译为 “继承 `java.lang.Enum` 的 final 类”，枚举常量是该类的静态 final 实例：

java

```java
// 定义枚举类
public enum Direction {
    UP, DOWN, LEFT, RIGHT;
}

// 编译器编译后等价于：
public final class Direction extends Enum<Direction> {
    public static final Direction UP = new Direction("UP", 0);
    public static final Direction DOWN = new Direction("DOWN", 1);
    public static final Direction LEFT = new Direction("LEFT", 2);
    public static final Direction RIGHT = new Direction("RIGHT", 3);
    
    // 私有构造器（编译器自动生成）
    private Direction(String name, int ordinal) {
        super(name, ordinal);
    }
    
    // 编译器自动生成的方法
    public static Direction[] values() { ... } // 返回所有枚举常量
    public static Direction valueOf(String name) { ... } // 根据名称获取常量
}
```

#### （2）枚举类的核心方法

- `values()`：返回所有枚举常量的数组（开发中常用，如遍历所有状态）。
- `valueOf(String name)`：根据名称获取枚举常量（名称不匹配时抛 `IllegalArgumentException`）。
- `name()`：返回枚举常量的名称（如 `UP.name()` 返回 `"UP"`）。
- `ordinal()`：返回枚举常量的序号（从 0 开始，如 `UP.ordinal()` 返回 `0`）。

#### （3）枚举类的扩展功能

枚举类可添加成员变量、方法，甚至实现接口：

java

```java
public enum OrderStatus {
    // 枚举常量（需传入构造器参数）
    UNPAID(0, "未支付"),
    PAID(1, "已支付"),
    SHIPPED(2, "已发货"),
    DELIVERED(3, "已送达");
    
    // 枚举类的成员变量
    private int code;
    private String desc;
    
    // 私有构造器（枚举常量初始化时调用）
    private OrderStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }
    
    // 普通方法
    public String getDesc() {
        return desc;
    }
    
    // 静态方法（根据code获取枚举常量）
    public static OrderStatus getByCode(int code) {
        for (OrderStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        return null;
    }
}

// 使用
OrderStatus status = OrderStatus.getByCode(1);
System.out.println(status.getDesc()); // 输出：已支付
```

## 四、抽象类与接口 —— 从模板到规范

### 1. 抽象类（abstract class）—— 不完整的类

抽象类是 “包含抽象方法的类”，仅作为父类供子类继承，强制子类实现核心行为，是 “模板方法设计模式” 的核心载体。

#### （1）抽象类的核心定义与规则

- **抽象方法**：用 `abstract` 修饰，无方法体（仅定义方法签名），必须被子类重写。

- 抽象类定义

  ：

  java

  ```java
  // 抽象类（不能创建对象）
  abstract class Animal {
      String name;
      
      // 抽象方法（无方法体）
      public abstract void cry();
      
      // 普通方法（有方法体，可被子类继承）
      public void eat() {
          System.out.println(name + "吃饭");
      }
  }
  
  // 子类（必须重写所有抽象方法，否则子类需为抽象类）
  class Dog extends Animal {
      @Override
      public void cry() {
          System.out.println(name + "汪汪叫");
      }
  }
  ```

  

- 核心规则

  ：

  1. 抽象类不能创建对象（`new Animal()` 报错），仅用于继承。
  2. 子类继承抽象类，必须重写**所有**抽象方法（否则子类需用 `abstract` 修饰）。
  3. 抽象类可包含普通方法、成员变量、构造器（构造器用于子类初始化父类部分）。

#### （2）模板方法设计模式 —— 抽象类的核心应用

- **核心思想**：抽象类中定义 “模板方法”（封装固定流程），将可变步骤定义为抽象方法，由子类实现。

- **优势**：固定流程不修改，可变步骤灵活扩展，提高代码复用。

- 示例（考试流程）

  ：

  java

  ```java
  abstract class Exam {
      // 模板方法（final修饰，禁止子类重写，确保流程固定）
      public final void examProcess() {
          System.out.println("1. 发试卷"); // 固定步骤1
          doExam(); // 可变步骤（抽象方法，子类实现）
          System.out.println("3. 收试卷"); // 固定步骤2
      }
      
      // 可变步骤（抽象方法）
      public abstract void doExam();
  }
  
  // 学生A的考试（实现可变步骤）
  class StudentA extends Exam {
      @Override
      public void doExam() {
          System.out.println("2. 学生A认真做题");
      }
  }
  
  // 学生B的考试（实现可变步骤）
  class StudentB extends Exam {
      @Override
      public void doExam() {
          System.out.println("2. 学生B快速做题");
      }
  }
  
  // 使用
  public class Test {
      public static void main(String[] args) {
          Exam a = new StudentA();
          a.examProcess(); // 输出：发试卷→学生A做题→收试卷
          
          Exam b = new StudentB();
          b.examProcess(); // 输出：发试卷→学生B做题→收试卷
      }
  }
  ```

  

### 2. 接口（interface）—— 行为规范

接口是 “纯抽象的行为规范”，仅定义方法签名（JDK8 后支持默认方法、静态方法），用于实现 “多继承” 效果和 “面向接口编程”。

#### （1）接口的底层本质与语法

- **底层本质**：接口编译后生成 `class` 文件，本质是 “特殊的抽象类”（无构造器，所有方法默认 `public abstract`，所有变量默认 `public static final`）。

- JDK8 前接口定义

  ：

  java

  ```java
  public interface Swim {
      // 常量（默认public static final）
      int MAX_SPEED = 10;
      
      // 抽象方法（默认public abstract）
      void swim();
  }
  ```

  

- JDK8 新增方法（解决接口扩展问题）

  ：

  1. 默认方法（default）

     ：有方法体，实现类可直接调用或重写，用于接口扩展（避免修改所有实现类）。

     java

     

     ```java
     interface Swim {
         default void warmUp() { // 默认方法
             System.out.println("热身运动");
         }
         void swim();
     }
     
     class Fish implements Swim {
         @Override
         public void swim() {
             System.out.println("鱼游");
         }
         // 可重写warmUp()，也可不重写（直接使用默认实现）
     }
     ```

     

  2. 静态方法（static）

     ：有方法体，接口名直接调用，用于定义工具方法。

     java

     ```java
     interface Swim {
         static void showRule() { // 静态方法
             System.out.println("游泳规则：禁止潜水");
         }
         void swim();
     }
     
     // 使用
     Swim.showRule(); // 接口名直接调用
     ```

     

  3. **私有方法（private，JDK9+）**：有方法体，仅接口内部调用，用于封装默认方法或静态方法的重复逻辑。

#### （2）接口的核心特点

1. 多实现

   ：一个类可实现多个接口（

   ```
   class A implements B, C
   ```

   ），弥补类单继承的不足。

   java

   ```java
   interface Run {
       void run();
   }
   
   interface Fly {
       void fly();
   }
   
   // 实现多个接口，需重写所有抽象方法
   class Bird implements Run, Fly {
       @Override
       public void run() {
           System.out.println("鸟跑");
       }
       
       @Override
       public void fly() {
           System.out.println("鸟飞");
       }
   }
   ```

   

2. 多继承

   ：一个接口可继承多个接口（

   ```
   interface C extends A, B
   ```

   ），组合多个接口的规范。

   java

   ```java
   interface A {
       void methodA();
   }
   
   interface B {
       void methodB();
   }
   
   // 接口C继承A和B，包含methodA()和methodB()
   interface C extends A, B {
       void methodC();
   }
   ```

   

3. 接口冲突解决

   ：

   - 实现多个接口，若有同名默认方法：实现类必须重写该方法（否则编译报错）。
   - 继承父类且实现接口，若父类方法与接口默认方法同名：优先使用父类方法（“类优先” 原则）。

#### （3）抽象类与接口的核心区别（从设计理念到底层）

| 对比维度    | 抽象类（abstract class）                              | 接口（interface）                                            |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| 设计理念    | “is-a” 关系（子类是父类的一种，如 `Dog is a Animal`） | “has-a” 关系（类具备某种行为，如 `Bird has a Fly`）          |
| 成员类型    | 可包含抽象方法、普通方法、成员变量、构造器            | JDK8 前：仅抽象方法 + 常量；JDK8 后：新增默认 / 静态 / 私有方法 |
| 继承 / 实现 | 单继承（一个类仅能继承一个抽象类）                    | 多实现（一个类可实现多个接口）；多继承（接口可继承多个接口） |
| 访问修饰符  | 成员可多修饰符（private/protected/public 等）         | 成员默认 public（常量：public static final；方法：public abstract） |
| 实例化      | 不能实例化（需子类继承后实例化）                      | 不能实例化（需实现类实现后实例化）                           |
| 底层字节码  | 标记为 `abstract class`，有构造器字节码               | 标记为 `interface`，无构造器字节码                           |
| 应用场景    | 抽取类的共性（包含属性和方法），定义模板流程          | 抽取类的共性行为（仅方法），定义规范                         |

## 五、代码块与内部类 —— 类的特殊成分

### 1. 代码块（初始化工具）

代码块是类的五大成分之一（成员变量、构造器、方法、代码块、内部类），用于**初始化类或对象**，按类型分为静态代码块和实例代码块。

#### （1）静态代码块（static {}）

- **执行时机**：类加载时执行（仅一次，无论创建多少对象）。

- **执行顺序**：多个静态代码块按定义顺序执行；父类静态代码块 → 子类静态代码块。

- 核心作用

  ：

  1. 初始化静态变量（如加载配置文件、初始化全局常量）。
  2. 执行类级别的初始化逻辑（如注册驱动）。

- 示例

  ：

  java

  ```java
  class Config {
      public static String DB_URL;
      
      // 静态代码块：初始化静态变量
      static {
          // 模拟加载配置文件
          DB_URL = "jdbc:mysql://localhost:3306/test";
          System.out.println("静态代码块执行：加载数据库URL");
      }
  }
  
  // 使用：访问静态变量时触发类加载，执行静态代码块
  System.out.println(Config.DB_URL); 
  ```

  

#### （2）实例代码块（{}）

- **执行时机**：每次创建对象时执行（在构造器前执行）。

- **执行顺序**：多个实例代码块按定义顺序执行；父类实例代码块 → 父类构造器 → 子类实例代码块 → 子类构造器。

- 核心作用

  ：

  1. 初始化实例变量（提取多个构造器的重复初始化逻辑）。
  2. 执行对象级别的预处理逻辑（如校验初始化参数）。

- 示例

  ：

  java

  ```java
  class Person {
      String name;
      int age;
      
      // 实例代码块：提取重复初始化逻辑
      {
          System.out.println("实例代码块执行：初始化对象");
          name = "默认名字"; // 所有构造器创建对象时，都会执行此初始化
      }
      
      // 无参构造器
      public Person() {
          System.out.println("无参构造器执行");
      }
      
      // 有参构造器
      public Person(int age) {
          this.age = age;
          System.out.println("有参构造器执行");
      }
  }
  
  // 使用：创建对象时执行实例代码块→构造器
  new Person(); 
  // 输出：实例代码块执行→无参构造器执行
  new Person(18); 
  // 输出：实例代码块执行→有参构造器执行
  ```

  

### 2. 内部类（嵌套类）—— 类的 “内部组件”

内部类是定义在另一个类（外部类）内部的类，用于封装与外部类**强关联的逻辑**（如外部类的 “组件” 或 “辅助逻辑”），按类型分为四种。

#### （1）成员内部类（非静态内部类）

- **定义**：外部类的普通成员（无 `static` 修饰），与外部类的实例绑定（需通过外部类实例创建）。

- **创建对象语法**：`外部类名.内部类名 变量 = new 外部类().new 内部类();`

- 核心特点

  ：

  1. 内部类持有外部类的引用（`外部类名.this`），可直接访问外部类的**所有成员**（包括 `private` 成员）。
  2. 外部类访问内部类成员，需通过内部类实例。

- 示例

  ：

  java

  ```java
  class Outer {
      private String outerName = "外部类名字";
      
      // 成员内部类
      class Inner {
          String innerName = "内部类名字";
          
          public void show() {
              // 直接访问外部类private成员
              System.out.println("外部类名字：" + outerName);
              System.out.println("内部类名字：" + innerName);
              // 通过Outer.this获取外部类实例
              System.out.println("外部类实例：" + Outer.this);
          }
      }
      
      // 外部类访问内部类成员
      public void accessInner() {
          Inner inner = new Inner();
          System.out.println("内部类名字：" + inner.innerName);
      }
  }
  
  // 使用
  public class Test {
      public static void main(String[] args) {
          // 创建内部类对象：需先创建外部类实例
          Outer.Inner inner = new Outer().new Inner();
          inner.show();
          
          // 外部类访问内部类
          Outer outer = new Outer();
          outer.accessInner();
      }
  }
  ```

  

- **底层原理**：编译器会为成员内部类生成构造器，传入外部类实例（如 `Inner(Outer outer) { this.outer = outer; }`），内部类通过该引用访问外部类成员。

#### （2）静态内部类（static 内部类）

- **定义**：用 `static` 修饰的内部类，与外部类的类本身绑定（无需外部类实例，直接通过外部类名创建）。

- **创建对象语法**：`外部类名.内部类名 变量 = new 外部类名.内部类名();`

- 核心特点

  ：

  1. 不持有外部类引用，仅可直接访问外部类的**静态成员**（无法访问实例成员，需通过外部类实例）。
  2. 可独立存在（类似普通类，只是定义在外部类内部）。

- 示例

  ：

  java

  ```java
  class Outer {
      private static String staticName = "外部类静态名字";
      private String instanceName = "外部类实例名字";
      
      // 静态内部类
      static class Inner {
          public void show() {
              // 直接访问外部类静态成员
              System.out.println("外部类静态名字：" + staticName);
              // 无法直接访问外部类实例成员（需外部类实例）
              // System.out.println(instanceName); // 编译报错
              
              // 通过外部类实例访问实例成员
              Outer outer = new Outer();
              System.out.println("外部类实例名字：" + outer.instanceName);
          }
      }
  }
  
  // 使用：无需外部类实例，直接创建内部类对象
  Outer.Inner inner = new Outer.Inner();
  inner.show();
  ```

  

- **应用场景**：外部类的 “工具组件”（如 `java.util.HashMap` 的 `Entry` 内部类，用于存储键值对）。

#### （3）局部内部类（方法内的内部类）

- **定义**：定义在方法、代码块、构造器等**局部范围**内的内部类，作用域仅限局部范围。

- 核心特点

  ：

  1. 访问局部变量时，局部变量必须是

     ```
     final
     ```

      修饰（JDK8 后隐式

      ，即变量值不可修改）。

     ✅ 原因：局部变量的生命周期与内部类对象生命周期不一致 —— 局部变量随方法执行结束销毁，而内部类对象可能仍存在（如被外部引用），

     ```
     final
     ```

      

     确保变量值不被修改，避免内部类访问到 “已销毁的变量”。

  2. 实用性低（仅在局部范围使用，无法外部访问），开发中极少使用。

- 示例

  ：

  java

  ```java
  class Outer {
      public void method() {
          final int num = 10; // 局部变量，隐式final（JDK8+）
          
          // 局部内部类（仅在method()中可见）
          class Inner {
              public void show() {
                  System.out.println(num); // 合法：访问final局部变量
              }
          }
          
          // 局部范围内创建内部类对象并使用
          Inner inner = new Inner();
          inner.show();
      }
  }
  ```

  

#### （4）匿名内部类（无名称的局部内部类）

- **定义**：无类名的局部内部类，本质是 “继承父类 / 实现接口的子类匿名对象”，用于**快速创建一次性使用的子类对象**。

- 语法格式

  ：

  java

  ```java
  new 父类/接口(构造参数) {
      // 类体：重写父类方法或实现接口方法
      @Override
      public void 方法名() {
          // 方法实现
      }
  };
  ```

  

- 核心特点

  ：

  1. 无类名，编译器自动生成类名（如 `Outer$1.class`）。
  2. 本质是子类对象，创建后立即使用（仅一次）。
  3. 仅能继承一个父类或实现一个接口（不能同时）。

- 开发中的核心应用场景

  ：

  1. 作为方法参数传递（简化代码，替代显式子类）。

     java

     ```java
     // 接口
     interface Swim {
         void swim();
     }
     
     // 方法：参数为Swim接口
     public static void testSwim(Swim s) {
         s.swim();
     }
     
     // 使用匿名内部类作为参数
     testSwim(new Swim() {
         @Override
         public void swim() {
             System.out.println("匿名内部类实现游泳");
         }
     });
     ```

     

  2. 事件监听（如 Swing 按钮点击、集合排序）。

     java

     ```java
     // 集合排序：匿名内部类实现Comparator接口
     List<String> list = Arrays.asList("b", "a", "c");
     Collections.sort(list, new Comparator<String>() {
         @Override
         public int compare(String o1, String o2) {
             return o1.compareTo(o2); // 按自然顺序排序
         }
     });
     ```

     

- **底层原理**：编译器生成匿名类文件（如 `Test$1.class`），该类继承父类或实现接口，并重写方法；运行时创建该匿名类的实例，传递给方法或直接使用。

## 六、函数式编程（JDK8+）—— 从面向对象到面向函数

函数式编程的核心是 “关注做什么，而非怎么做”，通过 **Lambda 表达式** 和 **方法引用** 简化代码，基于 “函数式接口” 实现。

### 1. 函数式接口 —— 函数式编程的基石

- **定义**：有且仅有一个抽象方法的接口，用 `@FunctionalInterface` 注解校验（可选，但推荐添加，编译器会强制检查是否为函数式接口）。

- **核心作用**：作为 Lambda 表达式的 “类型载体”（Lambda 表达式本质是函数式接口的匿名实现）。

- 常见内置函数式接口

  （

  ```
  java.util.function
  ```

   包）：

  | 接口名      | 抽象方法            | 功能描述                       |
  | ----------- | ------------------- | ------------------------------ |
  | `Predicate` | `boolean test(T t)` | 判断输入参数是否满足条件       |
  | `Consumer`  | `void accept(T t)`  | 消费输入参数（无返回值）       |
  | `Function`  | `R apply(T t)`      | 将输入参数转换为另一种类型     |
  | `Supplier`  | `T get()`           | 提供一个数据（无输入，有返回） |

- 自定义函数式接口示例

  ：

  java

  ```java
  // 自定义函数式接口（仅一个抽象方法）
  @FunctionalInterface
  interface Calculator {
      int calculate(int a, int b); // 抽象方法：计算两个数
  }
  ```

  

### 2. Lambda 表达式 —— 函数式接口的简化写法

Lambda 是函数式接口的 “匿名内部类简化版”，通过简洁的语法替代冗余的匿名内部类代码。

#### （1）Lambda 的语法格式

- 完整格式

  ：

  ```
  (参数列表) -> { 方法体; }
  ```

  - `(参数列表)`：对应函数式接口抽象方法的参数（类型可省略，编译器自动推断）。
  - `->`：Lambda 运算符，分隔参数列表和方法体。
  - `{ 方法体; }`：对应抽象方法的实现（若仅一行代码，`{}` 和 `;` 可省略；若有返回值，`return` 也可省略）。

#### （2）Lambda 的简化规则（核心）

1. **参数类型可省略**：编译器根据函数式接口的抽象方法自动推断参数类型。
2. **参数括号可省略**：若仅一个参数，`()` 可省略；多个参数不可省略。
3. **方法体大括号可省略**：若方法体仅一行代码，`{}` 和 `;` 可省略；若有 `return`，需一并省略。

#### （3）示例演变（从匿名内部类到 Lambda）

以 `Calculator` 接口为例：

java

```java
// 1. 匿名内部类实现
Calculator add1 = new Calculator() {
    @Override
    public int calculate(int a, int b) {
        return a + b;
    }
};

// 2. Lambda 完整写法
Calculator add2 = (int a, int b) -> {
    return a + b;
};

// 3. Lambda 简化写法（省略参数类型、大括号、return）
Calculator add3 = (a, b) -> a + b;

// 使用
System.out.println(add3.calculate(10, 20)); // 输出：30
```

#### （4）Lambda 的底层实现

- **JDK8 前**：Lambda 会被编译为匿名内部类（生成 `Test$1.class`），与匿名内部类实现一致。
- **JDK8 后**：引入 `invokedynamic` 指令，直接动态生成 Lambda 函数的调用逻辑，避免创建匿名类文件，性能更优。

### 3. 方法引用 ——Lambda 的进一步简化

方法引用是 “Lambda 表达式的语法糖”，当 Lambda 逻辑仅调用一个已存在的方法时，可直接引用该方法，替代重复的 Lambda 代码。

#### （1）方法引用的四种形式

| 引用形式         | 语法格式             | 适用场景                                                     | 示例                                                         |
| ---------------- | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 静态方法引用     | `类名::静态方法名`   | Lambda 逻辑仅调用某个静态方法，且参数列表与静态方法一致      | `Calculator add = Integer::sum;`（`Integer.sum(a,b)` 与 `calculate(a,b)` 参数一致） |
| 实例方法引用     | `对象名::实例方法名` | Lambda 逻辑仅调用某个对象的实例方法，且参数列表与实例方法一致 | `String str = "hello"; Predicate isEqual = str::equals;`（`str.equals(s)` 与 `test(s)` 参数一致） |
| 特定类型方法引用 | `类名::实例方法名`   | Lambda 第一个参数是方法的调用者，后续参数是方法的参数        | `Comparator comp = String::compareTo;`（`s1.compareTo(s2)` 对应 `compare(s1,s2)`） |
| 构造器引用       | `类名::new`          | Lambda 逻辑仅创建对象，且参数列表与构造器一致                | `Supplier> listSup = ArrayList::new;`（`new ArrayList<>()` 与 `get()` 无参数一致） |

#### （2）示例：方法引用简化集合排序

java

```java
List<String> list = Arrays.asList("b", "a", "c");

// 1. 匿名内部类排序
Collections.sort(list, new Comparator<String>() {
    @Override
    public int compare(String o1, String o2) {
        return o1.compareTo(o2);
    }
});

// 2. Lambda 简化
Collections.sort(list, (o1, o2) -> o1.compareTo(o2));

// 3. 方法引用（特定类型方法引用）
Collections.sort(list, String::compareTo);
```

## 七、常用 API 与 GUI 编程 —— 从理论到实践

### 1. String 类 —— 不可变字符串的底层实现

String 类封装字符串数据，是 **不可变类**（对象创建后，字符内容无法修改），底层基于字符数组（JDK9 后改为字节数组）实现。

#### （1）String 的不可变性底层原理

- **JDK8 及之前**：底层是 `private final char[] value`（`final` 修饰数组，地址不可变；`private` 修饰，外部无法修改数组元素）。
- **JDK9 及之后**：底层是 `private final byte[] value` + `private final byte coder`（编码标识），节省内存（如 Latin-1 编码的字符串，1 个字符占 1 字节，而 char 占 2 字节）。
- **不可变性的体现**：任何修改 String 的操作（如 `substring`、`replace`）都会创建新的 String 对象，原对象不变。

#### （2）String 常量池 —— 避免重复创建对象

- **定义**：方法区中的一块特殊区域，存储字符串常量（如 `"abc"`），避免重复创建相同内容的 String 对象。

- 核心机制

  ：

  1. 直接赋值创建 String（`String s = "abc"`）：先检查常量池，若存在 `"abc"`，直接返回引用；若不存在，创建常量并放入常量池。
  2. `new` 创建 String（`String s = new String("abc")`）：先检查常量池，若不存在 `"abc"` 则创建；再在堆内存创建 String 对象，引用指向堆对象。

- `intern()` 方法

  ：将堆中的 String 对象加入常量池（若常量池无该对象），返回常量池中的引用：

  java

  ```java
  String s1 = new String("abc"); // 堆对象：s1指向堆
  String s2 = s1.intern();       // s2指向常量池的"abc"
  String s3 = "abc";             // s3指向常量池的"abc"
  System.out.println(s2 == s3);  // true：都指向常量池
  ```

  

#### （3）String 常用方法（核心）

| 方法名                                               | 功能描述                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `int length()`                                       | 获取字符串长度（字符个数）                                   |
| `char charAt(int index)`                             | 获取指定索引的字符（索引从 0 开始）                          |
| `boolean equals(Object obj)`                         | 比较字符串内容（区分大小写）                                 |
| `boolean equalsIgnoreCase(String s)`                 | 比较字符串内容（忽略大小写）                                 |
| `String substring(int begin)`                        | 从 `begin` 索引截取到末尾，返回新字符串                      |
| `String substring(int begin, int end)`               | 从 `begin` 截取到 `end-1`（包前不包后），返回新字符串        |
| `String replace(CharSequence old, CharSequence new)` | 替换字符串中的旧字符 / 子串，返回新字符串                    |
| `String[] split(String regex)`                       | 按 `regex` 分割字符串，返回字符串数组（`regex` 是正则表达式，如 `split("\\.")` 分割点） |
| `boolean contains(CharSequence s)`                   | 判断字符串是否包含子串 `s`                                   |

### 2. ArrayList 集合 —— 动态数组的底层实现

ArrayList 是 List 接口的实现类，基于 **动态数组** 实现，支持动态扩容，是开发中最常用的集合。

#### （1）ArrayList 的底层结构

- **底层存储**：`transient Object[] elementData`（`transient` 修饰，序列化时仅序列化实际元素，而非整个数组）。

- 容量与大小

  ：

  - 容量（Capacity）：`elementData` 数组的长度（默认初始容量 10）。
  - 大小（Size）：集合中实际元素的个数（`size` 变量记录）。

#### （2）ArrayList 的扩容机制

当添加元素时，若 `size == 容量`，触发扩容：

1. **扩容公式**：新容量 = 旧容量 + (旧容量>> 1)（即旧容量的 1.5 倍，如 10→15→22...）。

2. 扩容过程

   ：

   - 创建新容量的数组（`Arrays.copyOf(elementData, newCapacity)`）。
   - 将原数组元素复制到新数组。
   - `elementData` 指向新数组。

- **注意**：扩容是 “复制数组” 的过程，频繁扩容会影响性能，因此可通过 `new ArrayList(int initialCapacity)` 指定初始容量（如已知存储 1000 个元素，初始容量设为 1000，避免扩容）。

#### （3）ArrayList 常用方法（核心）

| 方法名                     | 功能描述                                              |
| -------------------------- | ----------------------------------------------------- |
| `boolean add(E e)`         | 尾部添加元素，返回是否成功                            |
| `void add(int index, E e)` | 在 `index` 位置插入元素，后续元素后移                 |
| `E get(int index)`         | 获取 `index` 位置的元素                               |
| `E set(int index, E e)`    | 修改 `index` 位置的元素为 `e`，返回旧元素             |
| `E remove(int index)`      | 删除 `index` 位置的元素，后续元素前移，返回被删除元素 |
| `boolean remove(Object o)` | 删除第一个等于 `o` 的元素，返回是否成功               |
| `int size()`               | 获取集合中元素的个数                                  |
| `boolean isEmpty()`        | 判断集合是否为空                                      |
| `void clear()`             | 清空集合中的所有元素                                  |

### 3. GUI 编程（Swing）—— 图形化界面开发

Swing 是 Java 提供的 GUI 组件库，基于 AWT 开发，是 **轻量级组件**（不依赖操作系统的本地组件，跨平台性好）。

#### （1）Swing 核心组件

| 组件类名         | 功能描述                                     |
| ---------------- | -------------------------------------------- |
| `JFrame`         | 顶层窗口组件（必须，每个 GUI 程序至少一个）  |
| `JPanel`         | 面板组件（用于组织其他组件，如按钮、输入框） |
| `JButton`        | 按钮组件（触发点击事件）                     |
| `JTextField`     | 单行输入框组件（接收用户输入的文本）         |
| `JPasswordField` | 密码输入框组件（输入内容隐藏为星号）         |
| `JTable`         | 表格组件（展示多行多列数据）                 |
| `JLabel`         | 标签组件（显示文本或图片，不可编辑）         |

#### （2）Swing 布局管理器

布局管理器用于**自动排列组件**，避免手动设置组件的位置和大小（不同操作系统分辨率不同，手动设置易错位）。

| 布局管理器类名 | 布局特点                                                     | 适用场景                   |
| -------------- | ------------------------------------------------------------ | -------------------------- |
| `FlowLayout`   | 流式布局：组件按顺序排列，一行排满换行                       | 简单组件排列（如按钮组）   |
| `BorderLayout` | 边界布局：将容器分为东（EAST）、南（SOUTH）、西（WEST）、北（NORTH）、中（CENTER）五个区域，每个区域仅一个组件 | 顶层窗口布局（如 JFrame）  |
| `GridLayout`   | 网格布局：将容器分为多行多列的网格，组件按行填充             | 规则排列组件（如登录表单） |
| `BoxLayout`    | 箱式布局：组件按水平或垂直方向排列，可设置间距               | 精确控制组件排列方向       |

#### （3）Swing 事件处理（观察者模式）

- **核心机制**：事件源（如按钮）→ 事件（如点击）→ 事件监听器（如 `ActionListener`），监听器监听事件源的事件，触发时执行处理逻辑。

- 常用事件监听器

  ：

  - `ActionListener`：处理点击事件（如按钮点击）。
  - `MouseListener`：处理鼠标事件（如鼠标点击、移入、移出）。
  - `KeyListener`：处理键盘事件（如按键按下、释放）。

- 示例：按钮点击事件

  java

  ```java
  import javax.swing.*;
  import java.awt.*;
  import java.awt.event.ActionEvent;
  import java.awt.event.ActionListener;
  
  public class SwingDemo {
      public static void main(String[] args) {
          // 1. 创建顶层窗口
          JFrame frame = new JFrame("Swing示例");
          frame.setSize(400, 300); // 窗口大小
          frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // 关闭窗口时退出程序
          frame.setLocationRelativeTo(null); // 窗口居中
  
          // 2. 创建面板和按钮
          JPanel panel = new JPanel();
          JButton btn = new JButton("点击我");
  
          // 3. 绑定点击事件监听器（匿名内部类）
          btn.addActionListener(new ActionListener() {
              @Override
              public void actionPerformed(ActionEvent e) {
                  // 事件处理逻辑：弹出对话框
                  JOptionPane.showMessageDialog(frame, "按钮被点击了！");
              }
          });
  
          // 4. 组装组件
          panel.add(btn);
          frame.add(panel);
  
          // 5. 显示窗口
          frame.setVisible(true);
      }
  }
  ```

  

## 八、综合案例：员工信息管理系统（完整实现）

### 1. 需求设计

- **功能**：员工信息的添加、查询、修改、删除，表格展示，搜索功能。
- **技术栈**：Swing（界面）+ ArrayList（数据存储）+ 接口（功能规范）。

### 2. 核心代码实现

#### （1）员工实体类（Employee.java）

java

```java
public class Employee {
    private int id;
    private String name;
    private String job;
    private String dept;

    // 构造器
    public Employee() {}
    public Employee(int id, String name, String job, String dept) {
        this.id = id;
        this.name = name;
        this.job = job;
        this.dept = dept;
    }

    // getter/setter
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }

    // toString（便于调试）
    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", job='" + job + '\'' +
                ", dept='" + dept + '\'' +
                '}';
    }
}
```

#### （2）数据访问接口（EmployeeDAO.java）

java

```java
import java.util.List;

public interface EmployeeDAO {
    void add(Employee emp); // 添加员工
    List<Employee> queryAll(); // 查询所有员工
    Employee queryById(int id); // 按ID查询员工
    boolean update(Employee emp); // 修改员工
    boolean delete(int id); // 按ID删除员工
    List<Employee> search(String keyword); // 按关键词搜索（姓名/部门）
}
```

#### （3）数据访问实现类（EmployeeDAOImpl.java）

java

```java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class EmployeeDAOImpl implements EmployeeDAO {
    // 模拟数据库：ArrayList存储员工数据
    private List<Employee> empList = new ArrayList<>();
    // 自增ID（模拟主键）
    private int nextId = 1;

    // 初始化测试数据
    public EmployeeDAOImpl() {
        empList.add(new Employee(nextId++, "张三", "开发工程师", "技术部"));
        empList.add(new Employee(nextId++, "李四", "产品经理", "产品部"));
        empList.add(new Employee(nextId++, "王五", "测试工程师", "测试部"));
    }

    @Override
    public void add(Employee emp) {
        emp.setId(nextId++); // 分配自增ID
        empList.add(emp);
    }

    @Override
    public List<Employee> queryAll() {
        return new ArrayList<>(empList); // 返回副本，避免外部修改原集合
    }

    @Override
    public Employee queryById(int id) {
        for (Employee emp : empList) {
            if (emp.getId() == id) {
                return emp;
            }
        }
        return null;
    }

    @Override
    public boolean update(Employee emp) {
        Employee oldEmp = queryById(emp.getId());
        if (oldEmp != null) {
            oldEmp.setName(emp.getName());
            oldEmp.setJob(emp.getJob());
            oldEmp.setDept(emp.getDept());
            return true;
        }
        return false;
    }

    @Override
    public boolean delete(int id) {
        Employee emp = queryById(id);
        if (emp != null) {
            empList.remove(emp);
            return true;
        }
        return false;
    }

    @Override
    public List<Employee> search(String keyword) {
        // 按姓名或部门包含关键词搜索（忽略大小写）
        return empList.stream()
                .filter(emp -> emp.getName().toLowerCase().contains(keyword.toLowerCase())
                        || emp.getDept().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
}
```

#### （4）GUI 窗口类（EmployeeFrame.java）

java

```java
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.List;

public class EmployeeFrame extends JFrame {
    private EmployeeDAO empDAO = new EmployeeDAOImpl();
    private JTable table;
    private DefaultTableModel tableModel;
    private JTextField searchField;

    public EmployeeFrame() {
        // 1. 初始化窗口
        setTitle("员工信息管理系统");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null); // 居中
        setLayout(new BorderLayout());

        // 2. 创建顶部面板（搜索+添加按钮）
        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        searchField = new JTextField(20);
        JButton searchBtn = new JButton("搜索");
        JButton addBtn = new JButton("添加");

        // 搜索按钮事件
        searchBtn.addActionListener(e -> searchEmployee());
        // 添加按钮事件
        addBtn.addActionListener(e -> addEmployee());

        topPanel.add(new JLabel("关键词："));
        topPanel.add(searchField);
        topPanel.add(searchBtn);
        topPanel.add(addBtn);
        add(topPanel, BorderLayout.NORTH);

        // 3. 创建表格（展示员工数据）
        String[] columnNames = {"ID", "姓名", "职位", "部门"};
        tableModel = new DefaultTableModel(columnNames, 0);
        table = new JTable(tableModel);
        JScrollPane scrollPane = new JScrollPane(table);
        add(scrollPane, BorderLayout.CENTER);

        // 4. 创建底部面板（修改+删除按钮）
        JPanel bottomPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        JButton updateBtn = new JButton("修改");
        JButton deleteBtn = new JButton("删除");

        // 修改按钮事件
        updateBtn.addActionListener(e -> updateEmployee());
        // 删除按钮事件
        deleteBtn.addActionListener(e -> deleteEmployee());

        bottomPanel.add(updateBtn);
        bottomPanel.add(deleteBtn);
        add(bottomPanel, BorderLayout.SOUTH);

        // 5. 加载员工数据
        loadEmployeeData(empDAO.queryAll());

        // 6. 显示窗口
        setVisible(true);
    }

    // 加载员工数据到表格
    private void loadEmployeeData(List<Employee> empList) {
        // 清空表格
        tableModel.setRowCount(0);
        // 添加数据
        for (Employee emp : empList) {
            Object[] rowData = {
                    emp.getId(),
                    emp.getName(),
                    emp.getJob(),
                    emp.getDept()
            };
            tableModel.addRow(rowData);
        }
    }

    // 搜索员工
    private void searchEmployee() {
        String keyword = searchField.getText().trim();
        List<Employee> result = empDAO.search(keyword);
        loadEmployeeData(result);
    }

    // 添加员工
    private void addEmployee() {
        // 创建添加表单
        JTextField nameField = new JTextField(10);
        JTextField jobField = new JTextField(10);
        JTextField deptField = new JTextField(10);

        JPanel panel = new JPanel(new GridLayout(3, 2, 5, 5));
        panel.add(new JLabel("姓名："));
        panel.add(nameField);
        panel.add(new JLabel("职位："));
        panel.add(jobField);
        panel.add(new JLabel("部门："));
        panel.add(deptField);

        // 弹出对话框
        int option = JOptionPane.showConfirmDialog(this, panel, "添加员工", JOptionPane.OK_CANCEL_OPTION);
        if (option == JOptionPane.OK_OPTION) {
            // 获取输入内容
            String name = nameField.getText().trim();
            String job = jobField.getText().trim();
            String dept = deptField.getText().trim();

            // 简单校验
            if (name.isEmpty() || job.isEmpty() || dept.isEmpty()) {
                JOptionPane.showMessageDialog(this, "请填写完整信息！");
                return;
            }

            // 添加员工
            empDAO.add(new Employee(0, name, job, dept));
            // 重新加载数据
            loadEmployeeData(empDAO.queryAll());
            JOptionPane.showMessageDialog(this, "添加成功！");
        }
    }

    // 修改员工
    private void updateEmployee() {
        // 获取选中行
        int selectedRow = table.getSelectedRow();
        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "请选中要修改的员工！");
            return;
        }

        // 获取选中员工的ID
        int id = (int) tableModel.getValueAt(selectedRow, 0);
        Employee emp = empDAO.queryById(id);
        if (emp == null) {
            JOptionPane.showMessageDialog(this, "员工不存在！");
            return;
        }

        // 创建修改表单（预填现有信息）
        JTextField nameField = new JTextField(emp.getName(), 10);
        JTextField jobField = new JTextField(emp.getJob(), 10);
        JTextField deptField = new JTextField(emp.getDept(), 10);

        JPanel panel = new JPanel(new GridLayout(3, 2, 5, 5));
        panel.add(new JLabel("姓名："));
        panel.add(nameField);
        panel.add(new JLabel("职位："));
        panel.add(jobField);
        panel.add(new JLabel("部门："));
        panel.add(deptField);

        // 弹出对话框
        int option = JOptionPane.showConfirmDialog(this, panel, "修改员工", JOptionPane.OK_CANCEL_OPTION);
        if (option == JOptionPane.OK_OPTION) {
            // 获取修改后的内容
            String name = nameField.getText().trim();
            String job = jobField.getText().trim();
            String dept = deptField.getText().trim();

            // 简单校验
            if (name.isEmpty() || job.isEmpty() || dept.isEmpty()) {
                JOptionPane.showMessageDialog(this, "请填写完整信息！");
                return;
            }

            // 修改员工
            emp.setName(name);
            emp.setJob(job);
            emp.setDept(dept);
            boolean success = empDAO.update(emp);
            if (success) {
                // 重新加载数据
                loadEmployeeData(empDAO.queryAll());
                JOptionPane.showMessageDialog(this, "修改成功！");
            } else {
                JOptionPane.showMessageDialog(this, "修改失败！");
            }
        }
    }

    // 删除员工
    private void deleteEmployee() {
        // 获取选中行
        int selectedRow = table.getSelectedRow();
        if (selectedRow == -1
           ···
```









# Java OOP 高级 15 道难度递增面试题（含场景 + 答案）

## 面试题 1（基础：继承 + 方法重写）

### 场景

面试官：“以下代码定义了`Person`父类和`Student`子类，试图重写`toString()`方法展示学生信息，请分析代码是否存在问题，若有请修复，并解释方法重写的核心规则。”

java

```java
class Person {
    protected String name;
    protected int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "姓名：" + name + "，年龄：" + age;
    }
}

class Student extends Person {
    private String studentId;

    public Student(String name, int age, String studentId) {
        this.name = name;
        this.age = age;
        this.studentId = studentId;
    }

    // 试图重写toString方法
    public String toString(String prefix) {
        return prefix + " 姓名：" + name + "，年龄：" + age + "，学号：" + studentId;
    }
}
```

### 问题

1. 代码存在什么问题？请修复并写出完整正确代码。
2. 方法重写（Override）的核心规则有哪些？
3. 子类重写父类方法时，访问权限修饰符有什么要求？

------

## 面试题 2（基础进阶：子类构造器规则）

### 场景

面试官：“以下代码试图通过继承实现`Teacher`类，编译时出现错误，请分析错误原因并修复，同时解释子类构造器的核心规则。”

java

```java
class People {
    private String name;
    private int age;

    // 父类仅有有参构造器，无无参构造器
    public People(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // getter/setter方法
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}

class Teacher extends People {
    private String subject;

    // 子类构造器
    public Teacher(String name, int age, String subject) {
        this.subject = subject;
    }

    public void teach() {
        System.out.println(name + "老师教" + subject);
    }
}
```

### 问题

1. 代码编译错误的原因是什么？
2. 修复代码使其能正常运行，写出完整修复代码。
3. 子类构造器中`this(...)`和`super(...)`能否同时存在？为什么？

------

## 面试题 3（中级：多态的前提与表现）

### 场景

面试官：“以下代码尝试体现多态特性，请分析运行结果并解释原因，同时说明多态的实现前提。”

java

```java
class Animal {
    public String name = "动物";

    public void cry() {
        System.out.println("动物发出叫声");
    }
}

class Dog extends Animal {
    public String name = "小狗";

    @Override
    public void cry() {
        System.out.println("小狗汪汪叫");
    }
}

public class PolymorphismDemo {
    public static void main(String[] args) {
        Animal animal = new Dog();
        System.out.println(animal.name);
        animal.cry();
    }
}
```

### 问题

1. 代码的运行结果是什么？
2. 为什么会出现该结果？多态下属性和方法的访问规则有何不同？
3. 多态的实现前提有哪些？

------

## 面试题 4（中级：多态下的类型转换）

### 场景

面试官：“以下代码试图通过多态实现学生和老师的信息展示，需要调用子类特有方法，请修复代码中的错误，确保能正确调用`study()`和`teach()`方法，并解释类型转换的核心规则。”

java

```java
class People {
    protected String name;

    public People(String name) {
        this.name = name;
    }

    public void show() {
        System.out.println("姓名：" + name);
    }
}

class Student extends People {
    public Student(String name) {
        super(name);
    }

    public void study() {
        System.out.println(name + "学生正在学习");
    }
}

class Teacher extends People {
    public Teacher(String name) {
        super(name);
    }

    public void teach() {
        System.out.println(name + "老师正在授课");
    }
}

public class CastDemo {
    public static void main(String[] args) {
        People p1 = new Student("张三");
        People p2 = new Teacher("李四");

        p1.study(); // 报错
        p2.teach(); // 报错
    }
}
```

### 问题

1. 代码报错的原因是什么？
2. 修复代码使其能正确调用子类特有方法，写出完整修复代码。
3. 强制类型转换前为什么需要用`instanceof`判断？如何使用？

------

## 面试题 5（中级：final 关键字的用法）

### 场景

面试官：“`final`关键字是 Java 中的重要修饰符，请分析以下代码的运行结果，若有错误请说明原因，并详细解释`final`修饰类、方法、变量的不同作用。”

java

```java
final class FinalClass {
    public final String INFO = "常量";
    public static final int MAX = 100;

    public final void show() {
        System.out.println("FinalClass的show方法");
    }
}

// 试图继承FinalClass
class SubClass extends FinalClass {
    @Override
    public void show() {
        System.out.println("子类重写的show方法");
    }
}

public class FinalDemo {
    public static void main(String[] args) {
        FinalClass fc = new FinalClass();
        fc.INFO = "修改常量"; // 试图修改final变量
        System.out.println(fc.MAX);
    }
}
```

### 问题

1. 代码存在哪些错误？分别说明原因。
2. `final`修饰类、方法、变量的核心作用是什么？
3. `static final`修饰的常量与普通`final`变量有何区别？

------

## 面试题 6（中级：抽象类的核心规则）

### 场景

面试官：“请基于抽象类设计一个`Shape`（图形）体系，包含`Circle`（圆形）和`Rectangle`（矩形），要求：1. `Shape`为抽象类，包含抽象方法`calculateArea()`（计算面积）和普通方法`show()`（展示图形类型）；2. 子类必须实现`calculateArea()`方法；3. 测试类通过多态创建对象并计算面积。”

### 问题

1. 写出完整的代码实现（包含`Shape`、`Circle`、`Rectangle`和测试类）。
2. 抽象类能否创建对象？为什么？
3. 子类继承抽象类后，若不重写所有抽象方法，会有什么后果？

------

## 面试题 7（中级：接口的特性与 JDK8 新特性）

### 场景

面试官：“以下代码定义了`Flyable`接口和`Bird`实现类，请分析代码是否能正常运行，若有问题请修复，并解释接口的核心特性及 JDK8 后接口的新增方法类型。”

java

```java
interface Flyable {
    String TYPE = "飞行生物"; // 常量

    // 抽象方法
    void fly();

    // JDK8新增默认方法
    default void showType() {
        System.out.println("类型：" + TYPE);
    }

    // JDK8新增静态方法
    static void showRule() {
        System.out.println("飞行规则：遵守空中交通");
    }
}

class Bird implements Flyable {
    private String name;

    public Bird(String name) {
        this.name = name;
    }

    // 实现fly方法
    public void fly() {
        System.out.println(name + "展翅高飞");
    }

    // 重写默认方法
    public void showType() {
        System.out.println("自定义类型：" + TYPE);
    }
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Flyable bird = new Bird("雄鹰");
        bird.fly();
        bird.showType();
        Flyable.showRule();
        System.out.println(bird.TYPE);
    }
}
```

### 问题

1. 代码能否正常运行？若能，运行结果是什么？若不能，修复错误。
2. 接口的核心特性有哪些？（至少 3 点）
3. JDK8 后接口新增了哪几种方法？各自的访问规则是什么？

------

## 面试题 8（中高：抽象类 vs 接口的区别与选择）

### 场景

面试官：“某电商平台需要设计支付功能，支持微信支付、支付宝支付、银联支付，每种支付方式都有‘发起支付’和‘查询支付状态’两个核心功能，同时所有支付方式都需要遵守‘支付安全校验’的固定流程。请回答以下问题：”

### 问题

1. 该场景适合用抽象类还是接口实现？为什么？
2. 抽象类和接口的核心区别有哪些？（从继承关系、成员类型、设计理念 3 个维度说明）
3. 写出核心代码框架（包含抽象类 / 接口和任意两个支付实现类）。

------

## 面试题 9（中高：单例设计模式）

### 场景

面试官：“单例模式确保类只能创建一个对象，请分析以下饿汉式和懒汉式单例代码的优缺点，修复懒汉式的线程安全问题，并解释单例模式的应用场景。”

java

```java
// 饿汉式单例
class HungrySingleton {
    private static final HungrySingleton INSTANCE = new HungrySingleton();

    private HungrySingleton() {}

    public static HungrySingleton getInstance() {
        return INSTANCE;
    }
}

// 懒汉式单例（存在线程安全问题）
class LazySingleton {
    private static LazySingleton instance;

    private LazySingleton() {}

    public static LazySingleton getInstance() {
        if (instance == null) {
            instance = new LazySingleton();
        }
        return instance;
    }
}
```

### 问题

1. 饿汉式单例的优缺点是什么？
2. 懒汉式单例存在什么问题？如何修复（写出线程安全的懒汉式代码）？
3. 单例模式的应用场景有哪些？为什么这些场景需要单例？

------

## 面试题 10（中高：枚举类的特性与应用）

### 场景

面试官：“请设计一个枚举类`OrderStatus`，表示订单的状态（待支付、已支付、已发货、已完成、已取消），要求：1. 每个状态包含对应的中文描述；2. 提供方法根据状态名称获取中文描述；3. 测试类遍历所有状态并打印。”

### 问题

1. 写出完整的`OrderStatus`枚举类和测试类代码。
2. 枚举类的核心特性有哪些？（至少 3 点）
3. 枚举类与普通类相比，有哪些优势？

------

## 面试题 11（中高：代码块的执行顺序）

### 场景

面试官：“以下代码包含静态代码块、实例代码块和构造器，请分析运行结果并详细解释代码块的执行顺序规则。”

java

```java
class BlockDemo {
    // 静态代码块
    static {
        System.out.println("静态代码块1");
    }

    // 实例代码块
    {
        System.out.println("实例代码块1");
    }

    public BlockDemo() {
        System.out.println("无参构造器");
    }

    // 静态代码块2
    static {
        System.out.println("静态代码块2");
    }

    // 实例代码块2
    {
        System.out.println("实例代码块2");
    }
}

public class BlockOrderDemo {
    public static void main(String[] args) {
        new BlockDemo();
        System.out.println("--------");
        new BlockDemo();
    }
}
```

### 问题

1. 代码的运行结果是什么？
2. 静态代码块和实例代码块的核心区别是什么？（执行时机、执行次数、访问权限）
3. 代码块、构造器、父类初始化的整体执行顺序是什么？

------

## 面试题 12（高级：成员内部类的访问规则）

### 场景

面试官：“以下代码定义了外部类`Outer`和成员内部类`Inner`，试图实现内外类的相互访问，请分析代码是否存在问题，若有请修复，并解释成员内部类的访问规则。”

java

```java
class Outer {
    private String outerName = "外部类名称";
    static String outerStatic = "外部静态变量";

    class Inner {
        private String innerName = "内部类名称";

        public void showInner() {
            System.out.println(innerName);
            System.out.println(outerName);
            System.out.println(outerStatic);
        }
    }

    public void showOuter() {
        System.out.println(outerName);
        System.out.println(innerName); // 报错
        System.out.println(outerStatic);
    }
}

public class InnerClassDemo {
    public static void main(String[] args) {
        // 试图创建内部类对象
        Inner inner = new Inner(); // 报错
        inner.showInner();
    }
}
```

### 问题

1. 代码存在哪些错误？分别说明原因。
2. 修复代码使其能正常运行，写出完整修复代码。
3. 成员内部类的创建方式是什么？内外类相互访问成员的规则是什么？

------

## 面试题 13（高级：匿名内部类与 Lambda 转换）

### 场景

面试官：“以下代码通过匿名内部类实现`Comparator`接口完成数组排序，请将其改写为 Lambda 表达式，并解释 Lambda 表达式的核心语法和省略规则。”

java

```java
import java.util.Arrays;
import java.util.Comparator;

class Student {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // getter方法
    public String getName() { return name; }
    public int getAge() { return age; }

    @Override
    public String toString() {
        return "姓名：" + name + "，年龄：" + age;
    }
}

public class AnonymousLambdaDemo {
    public static void main(String[] args) {
        Student[] students = {
            new Student("张三", 20),
            new Student("李四", 18),
            new Student("王五", 22)
        };

        // 匿名内部类实现Comparator接口，按年龄升序排序
        Arrays.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student s1, Student s2) {
                return s1.getAge() - s2.getAge();
            }
        });

        System.out.println(Arrays.toString(students));
    }
}
```

### 问题

1. 将匿名内部类改写为 Lambda 表达式，写出完整的`main`方法代码。
2. Lambda 表达式的核心语法是什么？有哪些省略规则？
3. Lambda 表达式的使用前提是什么？

------

## 面试题 14（高级：方法引用的应用）

### 场景

面试官：“以下代码通过 Lambda 表达式实现了字符串长度比较和学生对象创建，请将其改写为方法引用形式，并解释每种方法引用的适用场景。”

java

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.function.Supplier;

class Person {
    private String name;
    private int age;

    public Person() {}

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "姓名：" + name + "，年龄：" + age;
    }
}

public class MethodReferenceDemo {
    public static void main(String[] args) {
        // 1. Lambda：字符串按长度比较
        Comparator<String> comp1 = (s1, s2) -> s1.length() - s2.length();
        String[] strs = {"apple", "banana", "orange"};
        Arrays.sort(strs, comp1);
        System.out.println(Arrays.toString(strs));

        // 2. Lambda：创建Person对象
        Supplier<Person> sup1 = () -> new Person();
        Person p = sup1.get();
        System.out.println(p);
    }
}
```

### 问题

1. 将两处 Lambda 表达式改写为方法引用，写出完整代码。
2. 方法引用有哪几种形式？各自的适用场景是什么？
3. 方法引用与 Lambda 表达式的关系是什么？

------

## 面试题 15（高级：综合应用：接口 + 多态 + 集合）

### 场景

面试官：“请设计一个简易的商品管理系统，要求：1. 定义`Product`接口，包含`getInfo()`（获取商品信息）和`getPrice()`（获取价格）方法；2. 实现`Electronics`（电子产品）和`Clothing`（服装）两个类，分别实现`Product`接口；3. 定义`ProductManager`类，包含`addProduct()`（添加商品）、`queryAll()`（查询所有商品）、`queryByPriceRange()`（按价格区间查询商品）方法；4. 测试类完成商品添加、查询功能。”

### 问题

1. 写出完整的代码实现（包含接口、实现类、管理类、测试类）。
2. 该设计中体现了 OOP 的哪些核心特性？请具体说明。
3. 若需新增 “食品” 商品类型，该设计是否具备扩展性？为什么？

------

# 参考答案

## 面试题 1 参考答案

### 1. 问题与修复

- 问题：`Student`类的`toString(String prefix)`方法不是重写，而是重载（参数列表不同），违反方法重写的 “参数列表必须与父类一致” 规则；子类构造器未调用父类构造器（父类无无参构造器）。
- 修复后代码：

java

```java
class Person {
    protected String name;
    protected int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "姓名：" + name + "，年龄：" + age;
    }
}

class Student extends Person {
    private String studentId;

    // 调用父类有参构造器
    public Student(String name, int age, String studentId) {
        super(name, age); // 显式调用父类构造器
        this.studentId = studentId;
    }

    // 正确重写toString方法（参数列表与父类一致）
    @Override
    public String toString() {
        return "学生信息：" + super.toString() + "，学号：" + studentId;
    }
}
```

### 2. 方法重写核心规则

1. 方法名、参数列表必须与父类完全一致；
2. 返回值类型：与父类一致或为其子类（协变返回值）；
3. 访问权限：子类方法权限 ≥ 父类方法权限；
4. 私有方法、静态方法不能重写；
5. 可添加`@Override`注解校验格式。

### 3. 访问权限要求

子类重写方法的访问权限修饰符不能严于父类，权限等级：`public > protected > 缺省 > private`。例如父类方法为`protected`，子类可改为`protected`或`public`，不能改为缺省或`private`。

## 面试题 2 参考答案

### 1. 错误原因

子类`Teacher`的构造器未调用父类`People`的构造器。父类仅有有参构造器，无默认无参构造器，子类构造器默认隐式调用`super()`（父类无参构造器），导致编译报错。

### 2. 修复后代码

java

```java
class People {
    private String name;
    private int age;

    public People(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}

class Teacher extends People {
    private String subject;

    // 显式调用父类有参构造器（位于第一行）
    public Teacher(String name, int age, String subject) {
        super(name, age); // 关键修复
        this.subject = subject;
    }

    public void teach() {
        System.out.println(getName() + "老师教" + subject); // 用getter访问私有成员
    }
}
```

### 3. `this(...)`与`super(...)`能否共存

不能共存。两者都必须位于构造器的第一行，用于初始化对象（`this(...)`调用本类其他构造器，`super(...)`调用父类构造器），同一行无法同时执行两个初始化逻辑。

## 面试题 3 参考答案

### 1. 运行结果



```plaintext
动物
小狗汪汪叫
```

### 2. 结果原因与访问规则

- 原因：多态下 “方法重写生效，属性无多态”。
  - 方法：父类引用`animal`调用`cry()`时，实际执行子类`Dog`重写的方法；
  - 属性：属性不支持多态，直接访问父类`Animal`的`name`属性。
- 访问规则：
  - 方法：先找子类重写的方法，无则向上追溯父类方法；
  - 属性：直接访问引用类型（父类）的属性，与对象真实类型无关。

### 3. 多态实现前提

1. 存在继承或实现关系（类继承类、类实现接口）；
2. 父类引用指向子类对象（`父类名 变量 = new 子类名()`）；
3. 存在方法重写（属性无多态）。

## 面试题 4 参考答案

### 1. 报错原因

多态下父类引用`People`无法直接调用子类特有方法（`study()`、`teach()`是子类独有，父类无定义），需通过强制类型转换（向下转型）解决。

### 2. 修复后代码

java

```java
class People {
    protected String name;

    public People(String name) {
        this.name = name;
    }

    public void show() {
        System.out.println("姓名：" + name);
    }
}

class Student extends People {
    public Student(String name) {
        super(name);
    }

    public void study() {
        System.out.println(name + "学生正在学习");
    }
}

class Teacher extends People {
    public Teacher(String name) {
        super(name);
    }

    public void teach() {
        System.out.println(name + "老师正在授课");
    }
}

public class CastDemo {
    public static void main(String[] args) {
        People p1 = new Student("张三");
        People p2 = new Teacher("李四");

        // 强制类型转换前用instanceof判断
        if (p1 instanceof Student) {
            Student s = (Student) p1;
            s.study(); // 调用子类特有方法
        }

        if (p2 instanceof Teacher) {
            Teacher t = (Teacher) p2;
            t.teach(); // 调用子类特有方法
        }
    }
}
```

### 3. `instanceof`的作用与使用

- 作用：判断对象的真实类型，避免强制类型转换时出现`ClassCastException`（类型转换异常）；
- 使用格式：`对象 instanceof 类型`，返回`boolean`值（`true`表示对象是该类型或其子类实例）。

## 面试题 5 参考答案

### 1. 代码错误与原因

- 错误 1：`SubClass`继承`FinalClass`报错 → `FinalClass`被`final`修饰，不可被继承；
- 错误 2：`SubClass`重写`show()`方法报错 → `show()`被`final`修饰，不可被重写；
- 错误 3：`fc.INFO = "修改常量"`报错 → `INFO`是`final`变量，值不可修改。

### 2. `final`的核心作用

- 修饰类：类不可被继承（如`String`类），避免核心逻辑被篡改；
- 修饰方法：方法不可被重写，确保父类方法逻辑稳定；
- 修饰变量：
  - 基本类型：变量值不可修改（常量）；
  - 引用类型：变量指向的地址不可修改，但对象内容可修改（如`final List list = new ArrayList<>(); list.add("a")`合法）。

### 3. `static final`与普通`final`变量的区别

| 对比维度   | `static final`变量（全局常量）     | 普通`final`变量（实例常量） |
| ---------- | ---------------------------------- | --------------------------- |
| 所属对象   | 属于类，内存中仅一份               | 属于对象，每个对象一份      |
| 初始化时机 | 类加载时初始化                     | 对象创建时初始化            |
| 访问方式   | 类名。变量名（推荐）               | 对象名。变量名              |
| 命名规范   | 大写字母 + 下划线（如`MAX_VALUE`） | 驼峰命名（如`finalName`）   |

## 面试题 6 参考答案

### 1. 完整代码实现

java

```java
// 抽象类Shape
abstract class Shape {
    protected String type;

    public Shape(String type) {
        this.type = type;
    }

    // 抽象方法：计算面积（子类必须实现）
    public abstract double calculateArea();

    // 普通方法：展示图形类型
    public void show() {
        System.out.println("图形类型：" + type);
    }
}

// 圆形类（子类）
class Circle extends Shape {
    private double radius; // 半径

    public Circle(double radius) {
        super("圆形");
        this.radius = radius;
    }

    @Override
    public double calculateArea() {
        return Math.PI * radius * radius; // 圆面积公式：πr²
    }
}

// 矩形类（子类）
class Rectangle extends Shape {
    private double width; // 宽
    private double height; // 高

    public Rectangle(double width, double height) {
        super("矩形");
        this.width = width;
        this.height = height;
    }

    @Override
    public double calculateArea() {
        return width * height; // 矩形面积公式：长×宽
    }
}

// 测试类
public class ShapeTest {
    public static void main(String[] args) {
        // 多态创建对象
        Shape circle = new Circle(5);
        Shape rectangle = new Rectangle(4, 6);

        // 调用方法
        circle.show();
        System.out.println("圆形面积：" + String.format("%.2f", circle.calculateArea()));

        rectangle.show();
        System.out.println("矩形面积：" + rectangle.calculateArea());
    }
}
```

### 2. 抽象类能否创建对象

不能。抽象类是 “不完整的类”，包含未实现的抽象方法，仅作为父类供子类继承，若允许创建对象，调用抽象方法会导致逻辑错误。

### 3. 子类不重写所有抽象方法的后果

子类必须重写父类所有抽象方法，否则子类需被定义为抽象类（添加`abstract`修饰），否则编译报错。

## 面试题 7 参考答案

### 1. 运行结果

代码能正常运行，结果：

plaintext

```plaintext
雄鹰展翅高飞
自定义类型：飞行生物
飞行规则：遵守空中交通
飞行生物
```

### 2. 接口核心特性

1. 接口不能创建对象，仅用于被类实现或被接口继承；
2. 接口支持多继承（一个接口可继承多个接口）和多实现（一个类可实现多个接口）；
3. 接口成员默认访问权限为`public`（抽象方法、默认方法、静态方法、常量）；
4. 接口中的常量默认被`public static final`修饰，必须显式赋值。

### 3. JDK8 后接口新增方法类型及访问规则

| 方法类型 | 定义格式                      | 访问规则                                   |
| -------- | ----------------------------- | ------------------------------------------ |
| 默认方法 | `default 返回值类型 方法名()` | 实现类可直接调用或重写，通过对象调用       |
| 静态方法 | `static 返回值类型 方法名()`  | 接口名直接调用，实现类不能重写             |
| 私有方法 | `private 返回值类型 方法名()` | 仅接口内部调用，用于封装默认方法的重复逻辑 |

## 面试题 8 参考答案

### 1. 场景适合的实现方式及原因

适合用 “抽象类 + 接口” 结合实现，或单独用抽象类实现：

- 原因：所有支付方式都需遵守 “支付安全校验” 的固定流程（适合抽象类的普通方法），同时需实现 “发起支付” 和 “查询支付状态” 的个性化功能（适合抽象方法或接口方法）。

### 2. 抽象类与接口的核心区别

| 对比维度 | 抽象类                               | 接口                                                         |
| -------- | ------------------------------------ | ------------------------------------------------------------ |
| 继承关系 | 单继承（一个类仅能继承一个抽象类）   | 多实现（一个类可实现多个接口）、多继承（接口可继承多个接口） |
| 成员类型 | 抽象方法、普通方法、变量、构造器     | 抽象方法、默认方法、静态方法、私有方法、常量                 |
| 设计理念 | 体现 “is-a” 关系（子类是父类的一种） | 体现 “has-a” 关系（类具备某种行为）                          |

### 3. 核心代码框架

java

```java
// 抽象类：封装固定流程和通用属性
abstract class Payment {
    protected String payName; // 支付名称

    public Payment(String payName) {
        this.payName = payName;
    }

    // 固定流程：支付安全校验
    public final void securityCheck() {
        System.out.println(payName + "执行支付安全校验...");
    }

    // 抽象方法：发起支付（子类个性化实现）
    public abstract boolean pay(double amount);

    // 抽象方法：查询支付状态（子类个性化实现）
    public abstract String queryStatus(String orderId);
}

// 微信支付实现类
class WeChatPay extends Payment {
    public WeChatPay() {
        super("微信支付");
    }

    @Override
    public boolean pay(double amount) {
        securityCheck();
        System.out.println("微信支付成功，金额：" + amount + "元");
        return true;
    }

    @Override
    public String queryStatus(String orderId) {
        return "微信支付订单[" + orderId + "]：已支付";
    }
}

// 支付宝支付实现类
class Alipay extends Payment {
    public Alipay() {
        super("支付宝支付");
    }

    @Override
    public boolean pay(double amount) {
        securityCheck();
        System.out.println("支付宝支付成功，金额：" + amount + "元");
        return true;
    }

    @Override
    public String queryStatus(String orderId) {
        return "支付宝支付订单[" + orderId + "]：已支付";
    }
}
```

## 面试题 9 参考答案

### 1. 饿汉式单例的优缺点

- 优点：
  1. 线程安全（类加载时创建实例，仅一次）；
  2. 实现简单，无锁机制，性能高。
- 缺点：
  1. 类加载时即创建实例，提前占用内存（若实例未被使用，造成内存浪费）；
  2. 无法延迟加载（懒加载）。

### 2. 懒汉式问题与修复

- 问题：多线程环境下，多个线程同时进入`if (instance == null)`，会创建多个实例，破坏单例特性；
- 线程安全的懒汉式（双重检查锁定 + volatile）：

java

```java
class LazySingleton {
    // volatile防止指令重排
    private static volatile LazySingleton instance;

    // 私有构造器，禁止外部创建对象
    private LazySingleton() {}

    public static LazySingleton getInstance() {
        // 第一次检查：避免已创建实例后仍加锁
        if (instance == null) {
            synchronized (LazySingleton.class) {
                // 第二次检查：防止多线程等待锁时，实例已被创建
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}
```

### 3. 单例模式应用场景

- 场景：任务管理器、数据库连接池、配置工具类、日志工具类等；
- 原因：这些场景需要确保对象唯一，避免重复创建导致资源浪费（如数据库连接池重复创建会耗尽连接）或逻辑冲突（如日志工具类多实例会导致日志混乱）。

## 面试题 10 参考答案

### 1. 枚举类与测试类代码

java

```java
// 订单状态枚举类
enum OrderStatus {
    // 枚举常量（名称+中文描述）
    PENDING_PAY("待支付"),
    PAID("已支付"),
    SHIPPED("已发货"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    // 中文描述属性
    private final String desc;

    // 枚举构造器（默认私有）
    OrderStatus(String desc) {
        this.desc = desc;
    }

    // 获取中文描述的方法
    public String getDesc() {
        return desc;
    }

    // 静态方法：根据名称获取枚举常量及描述
    public static OrderStatus getByDesc(String desc) {
        for (OrderStatus status : values()) {
            if (status.getDesc().equals(desc)) {
                return status;
            }
        }
        return null;
    }
}

// 测试类
public class OrderStatusTest {
    public static void main(String[] args) {
        // 遍历所有枚举常量
        System.out.println("所有订单状态：");
        for (OrderStatus status : OrderStatus.values()) {
            System.out.println("状态名称：" + status.name() + "，中文描述：" + status.getDesc());
        }

        // 根据描述获取枚举常量
        OrderStatus status = OrderStatus.getByDesc("已支付");
        System.out.println("\n根据描述查询：" + status.name());
    }
}
```

### 2. 枚举类核心特性

1. 枚举类默认继承`java.lang.Enum`，不可被继承；
2. 构造器私有（默认，无需显式声明），外部不能创建对象；
3. 第一行必须是枚举常量（本质是枚举类的实例）；
4. 提供`values()`方法（编译器自动生成），返回所有枚举常量数组；
5. 提供`valueOf(String name)`方法，根据名称获取枚举常量。

### 3. 枚举类相比普通类的优势

1. 类型安全：枚举常量是唯一实例，避免普通类常量的类型错误（如用整数常量时传入非法值）；
2. 简化代码：无需手动实现单例、常量管理，编译器自动生成相关方法；
3. 扩展性强：支持添加属性和方法，可实现接口，功能更丰富；
4. 可读性高：枚举常量名称直观，代码逻辑清晰。

## 面试题 11 参考答案

### 1. 运行结果

plaintext

```plaintext
静态代码块1
静态代码块2
实例代码块1
实例代码块2
无参构造器
--------
实例代码块1
实例代码块2
无参构造器
```

### 2. 静态代码块与实例代码块的核心区别

| 对比维度 | 静态代码块                             | 实例代码块                         |
| -------- | -------------------------------------- | ---------------------------------- |
| 执行时机 | 类加载时执行                           | 对象创建时执行（构造器之前）       |
| 执行次数 | 仅一次（类加载仅一次）                 | 每次创建对象都执行                 |
| 访问权限 | 仅能访问静态成员（静态变量、静态方法） | 可访问静态成员和实例成员           |
| 核心作用 | 初始化静态变量、加载资源（如配置文件） | 初始化实例变量、提取构造器重复逻辑 |

### 3. 整体执行顺序

1. 父类静态代码块 → 子类静态代码块（类加载阶段）；
2. 父类实例代码块 → 父类构造器 → 子类实例代码块 → 子类构造器（对象创建阶段）。

## 面试题 12 参考答案

### 1. 代码错误与原因

- 错误 1：`showOuter()`方法访问`innerName`报错 → 外部类访问内部类成员需通过内部类对象，不能直接访问；
- 错误 2：`new Inner()`创建内部类对象报错 → 成员内部类需通过外部类对象创建（`外部类对象.new 内部类()`）。

### 2. 修复后代码

java

```java
class Outer {
    private String outerName = "外部类名称";
    static String outerStatic = "外部静态变量";

    class Inner {
        private String innerName = "内部类名称";

        public void showInner() {
            System.out.println(innerName);
            System.out.println(outerName); // 内部类可直接访问外部类成员
            System.out.println(outerStatic);
        }
    }

    public void showOuter() {
        System.out.println(outerName);
        // 外部类访问内部类成员：通过内部类对象
        Inner inner = new Inner();
        System.out.println(inner.innerName);
        System.out.println(outerStatic);
    }
}

public class InnerClassDemo {
    public static void main(String[] args) {
        // 创建内部类对象：外部类对象.new 内部类()
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        inner.showInner();

        // 调用外部类方法
        outer.showOuter();
    }
}
```

### 3. 成员内部类的创建方式与访问规则

- 创建方式：`外部类名.内部类名 变量 = new 外部类().new 内部类();`（需先创建外部类对象）；
- 访问规则：
  1. 内部类可直接访问外部类的所有成员（包括私有成员）；
  2. 外部类访问内部类成员需通过内部类对象；
  3. 内部类中用 `外部类名.this` 可获取外部类对象（如 `Outer.this.outerName`）。

## 面试题 13 参考答案

### 1. Lambda 表达式改写后的`main`方法

java

```java
import java.util.Arrays;

public class AnonymousLambdaDemo {
    public static void main(String[] args) {
        Student[] students = {
            new Student("张三", 20),
            new Student("李四", 18),
            new Student("王五", 22)
        };

        // Lambda表达式：按年龄升序排序（简化匿名内部类）
        Arrays.sort(students, (s1, s2) -> s1.getAge() - s2.getAge());

        System.out.println(Arrays.toString(students));
    }
}
```

### 2. Lambda 核心语法与省略规则

- 核心语法：`(参数列表) -> { 方法体 }`；
- 省略规则：
  1. 参数类型可省略（编译器自动推断）；
  2. 若仅一个参数，括号 `()` 可省略；
  3. 若方法体仅一行代码，大括号 `{}` 和分号 `;` 可省略；若为 `return` 语句，`return` 需一并省略。

### 3. Lambda 使用前提

Lambda 表达式是函数式接口的匿名内部类简化写法，使用前提是：必须存在一个 “有且仅有一个抽象方法” 的函数式接口（可通过 `@FunctionalInterface` 注解校验）。

## 面试题 14 参考答案

### 1. 方法引用改写后的代码

java

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.function.Supplier;

class Person {
    private String name;
    private int age;

    public Person() {}

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "姓名：" + name + "，年龄：" + age;
    }
}

public class MethodReferenceDemo {
    public static void main(String[] args) {
        // 1. 方法引用：字符串按长度比较（特定类型方法引用）
        Comparator<String> comp1 = String::compareToIgnoreCase; // 按长度比较可简化为 (s1,s2)->s1.length()-s2.length()，无直接方法引用，此处用忽略大小写比较示例
        String[] strs = {"apple", "banana", "orange"};
        Arrays.sort(strs, String::length); // 按长度比较的方法引用（特定类型方法引用）
        System.out.println(Arrays.toString(strs));

        // 2. 方法引用：创建Person对象（构造器引用）
        Supplier<Person> sup1 = Person::new;
        Person p = sup1.get();
        System.out.println(p);
    }
}
```

### 2. 方法引用的形式与适用场景

| 引用形式         | 语法格式           | 适用场景                                          |
| ---------------- | ------------------ | ------------------------------------------------- |
| 静态方法引用     | `类名::静态方法`   | Lambda 逻辑仅调用某个静态方法                     |
| 实例方法引用     | `对象名::实例方法` | Lambda 逻辑仅调用某个对象的实例方法               |
| 特定类型方法引用 | `类名::实例方法`   | Lambda 第一个参数是方法调用者，后续参数是方法参数 |
| 构造器引用       | `类名::new`        | Lambda 逻辑仅创建对象                             |

### 3. 方法引用与 Lambda 的关系

方法引用是 Lambda 表达式的进一步简化形式，当 Lambda 表达式的逻辑仅为调用一个已存在的方法时，可通过方法引用替代重复的 Lambda 代码，使代码更简洁、可读性更高。

## 面试题 15 参考答案

### 1. 完整代码实现

java

运行

```java
// 商品接口
interface Product {
    // 获取商品信息
    String getInfo();
    // 获取价格
    double getPrice();
}

// 电子产品实现类
class Electronics implements Product {
    private String name;
    private double price;
    private String brand; // 品牌

    public Electronics(String name, double price, String brand) {
        this.name = name;
        this.price = price;
        this.brand = brand;
    }

    @Override
    public String getInfo() {
        return "电子产品 - 名称：" + name + "，品牌：" + brand + "，价格：" + price + "元";
    }

    @Override
    public double getPrice() {
        return price;
    }
}

// 服装实现类
class Clothing implements Product {
    private String name;
    private double price;
    private String size; // 尺寸

    public Clothing(String name, double price, String size) {
        this.name = name;
        this.price = price;
        this.size = size;
    }

    @Override
    public String getInfo() {
        return "服装 - 名称：" + name + "，尺寸：" + size + "，价格：" + price + "元";
    }

    @Override
    public double getPrice() {
        return price;
    }
}

// 商品管理类
class ProductManager {
    private List<Product> productList = new ArrayList<>();

    // 添加商品
    public void addProduct(Product product) {
        if (product != null) {
            productList.add(product);
        }
    }

    // 查询所有商品
    public List<Product> queryAll() {
        return new ArrayList<>(productList); // 返回副本，避免外部修改
    }

    // 按价格区间查询商品
    public List<Product> queryByPriceRange(double minPrice, double maxPrice) {
        List<Product> result = new ArrayList<>();
        for (Product product : productList) {
            double price = product.getPrice();
            if (price >= minPrice && price <= maxPrice) {
                result.add(product);
            }
        }
        return result;
    }
}

// 测试类
public class ProductSystemTest {
    public static void main(String[] args) {
        // 创建管理对象
        ProductManager manager = new ProductManager();

        // 添加商品
        manager.addProduct(new Electronics("手机", 3999.99, "华为"));
        manager.addProduct(new Electronics("笔记本电脑", 5999.99, "联想"));
        manager.addProduct(new Clothing("T恤", 99.9, "M"));
        manager.addProduct(new Clothing("牛仔裤", 199.9, "L"));

        // 查询所有商品
        System.out.println("所有商品：");
        List<Product> allProducts = manager.queryAll();
        for (Product product : allProducts) {
            System.out.println(product.getInfo());
        }

        // 按价格区间查询（100~6000元）
        System.out.println("\n价格100~6000元的商品：");
        List<Product> rangeProducts = manager.queryByPriceRange(100, 6000);
        for (Product product : rangeProducts) {
            System.out.println(product.getInfo());
        }
    }
}
```

### 2. 体现的 OOP 核心特性

1. 封装：`ProductManager`封装商品的添加、查询逻辑，隐藏内部存储细节（`productList`私有）；
2. 接口：`Product`接口定义商品的规范，实现类按需实现，体现 “面向接口编程”；
3. 多态：`productList`存储`Product`接口引用，可接收`Electronics`、`Clothing`等任意实现类对象；
4. 继承 / 实现：`Electronics`和`Clothing`实现`Product`接口，复用接口规范，实现个性化功能。

### 3. 扩展性分析

具备良好扩展性。新增 “食品” 商品类型时，只需创建`Food`类实现`Product`接口，无需修改现有`ProductManager`和测试类代码，符合 “开闭原则”（对扩展开放，对修改关闭）。









