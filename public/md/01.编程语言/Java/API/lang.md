![image-20250910194303205](./assets/image-20250910194303205.png)

`java.lang` 包是 Java 语言的核心基础包，包含了支撑 Java 程序运行的最基本类和接口，所有类都默认继承或依赖此包中的类，无需手动导入。以下从**核心类、接口、枚举、异常**四个维度，详细梳理其全部内容及 1.8 特性：

### 一、核心类（基础类型与根类）

#### 1. `Object`（所有类的直接 / 间接父类）

- **核心功能**：定义 Java 对象的通用行为，是类层次结构的根。

- **1.8 状态**：无新增方法，但需掌握其 11 个核心方法的底层逻辑：

  | 方法名                | 功能描述                                              | 关键细节                                                     |
  | --------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
  | `equals(Object obj)`  | 判断两个对象是否相等                                  | 默认比较内存地址，自定义类需重写（需与 `hashCode` 保持一致） |
  | `hashCode()`          | 返回对象的哈希码                                      | 重写 `equals` 时必须重写，否则影响 `HashMap` 等容器的键存储  |
  | `toString()`          | 返回对象的字符串表示                                  | 默认格式为 `类名@十六进制哈希码`，建议重写（如 `User{id=1}`） |
  | `getClass()`          | 返回对象的运行时类（`Class` 对象）                    | 反射的入口，如 `"abc".getClass() == String.class` 返回 `true` |
  | `clone()`             | 创建并返回对象的副本（浅拷贝）                        | 需实现 `Cloneable` 接口，否则抛 `CloneNotSupportedException` |
  | `wait()`/`wait(long)` | 使当前线程等待，释放对象锁                            | 必须在 `synchronized` 块中调用，需被 `notify()` 唤醒         |
  | `notify()`            | 唤醒在此对象监视器上等待的单个线程                    | 随机唤醒，不保证顺序                                         |
  | `notifyAll()`         | 唤醒在此对象监视器上等待的所有线程                    | 常用于批量唤醒场景                                           |
  | `finalize()`          | 垃圾回收前调用（已过时，Java 9 标记为 `@Deprecated`） | 不建议依赖，回收时机不确定                                   |

- **示例**：重写 `equals` 和 `hashCode`（确保一致性）：

  java

  ```java
  class Student {
      private int id;
      private String name;
      
      @Override
      public boolean equals(Object o) {
          if (this == o) return true;
          if (o == null || getClass() != o.getClass()) return false;
          Student student = (Student) o;
          return id == student.id && Objects.equals(name, student.name);
      }
      
      @Override
      public int hashCode() {
          return Objects.hash(id, name); // 依赖 1.7 新增的 Objects 工具类
      }
  }
  ```

#### 2. 基本类型包装类（8 个）

- **功能**：将基本数据类型包装为对象，提供类型转换、常量等工具方法。

- **1.8 新增方法**（以 `Integer` 为例，其他包装类类似）：

  | 方法名                  | 功能                                                         |
  | ----------------------- | ------------------------------------------------------------ |
  | `compare(int x, int y)` | 比较两个 int 值（`x < y` 返回 `-1`，相等返回 `0`，否则 `1`） |
  | `sum(int a, int b)`     | 计算两数之和（替代 `a + b`，语义更清晰）                     |
  | `max(int a, int b)`     | 返回两数中的最大值（替代 `Math.max(a, b)`）                  |
  | `min(int a, int b)`     | 返回两数中的最小值（替代 `Math.min(a, b)`）                  |

- **缓存机制**（重点）：
  `Byte`、`Short`、`Integer`（`[-128, 127]`）、`Long`、`Character`（`[0, 127]`）默认缓存常量池，超出范围则创建新对象：

  java

  ```java
  Integer a = 127;
  Integer b = 127;
  System.out.println(a == b); // true（缓存命中）
  
  Integer c = 128;
  Integer d = 128;
  System.out.println(c == d); // false（超出缓存范围）
  ```

#### 3. 字符串相关类

##### `String`（不可变字符序列）

- **核心特性**：不可变性（底层 `char[]` 被 `final` 修饰），线程安全，适合作为常量或键。

- **1.8 新增方法**：

  - ```
    String join(CharSequence delimiter, CharSequence... elements)
    ```

    ：拼接字符串（固定分隔符场景替代

     

    ```
    StringBuilder
    ```

    ）：

    java

    ```java
    String date = String.join("/", "2025", "09", "10"); // 结果："2025/09/10"
    ```

  - `boolean isEmpty()`：判断长度是否为 0（等价于 `length() == 0`，`""` 返回 `true`，`" "` 返回 `false`）。

- **高频方法**：

  | 方法名                                                   | 功能示例                                                     |
  | -------------------------------------------------------- | ------------------------------------------------------------ |
  | `substring(int begin, int end)`                          | `"abcde".substring(1, 3)` → `"bc"`（注意：1.7 后优化为共享字符数组） |
  | `split(String regex)`                                    | `"a,b,c".split(",")` → `["a", "b", "c"]`（支持正则表达式）   |
  | `startsWith(String prefix)`                              | `"hello".startsWith("he")` → `true`                          |
  | `replace(CharSequence target, CharSequence replacement)` | `"abc".replace("b", "x")` → `"axc"`（非正则替换）            |

##### `StringBuilder` 与 `StringBuffer`

- **功能**：可变字符序列（用于动态拼接字符串，效率高于 `String`）。
- **区别**：`StringBuffer` 线程安全（方法加 `synchronized`），`StringBuilder` 非线程安全（效率更高，推荐单线程场景）。
- **1.8 新增**：无新增方法，但 `StringBuilder` 性能优化更明显。

#### 4. 系统与工具类

##### `System`（系统级操作）

- **核心功能**：访问系统资源、控制程序运行。

- 1.8 方法

  ：

  | 方法名                                                       | 功能                                                         |
  | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | `out`/`err`                                                  | 标准输出流 / 错误流（`System.out.println("hello")`）         |
  | `in`                                                         | 标准输入流（配合 `Scanner` 读取用户输入）                    |
  | `currentTimeMillis()`                                        | 返回当前时间戳（毫秒，自 1970-01-01 起）                     |
  | `nanoTime()`                                                 | 返回高精度时间戳（纳秒，用于测量代码执行时间）               |
  | `arraycopy(Object src, int srcPos, Object dest, int destPos, int length)` | 数组复制（比 `for` 循环高效）                                |
  | `gc()`                                                       | 建议 JVM 执行垃圾回收（仅建议，不保证立即执行）              |
  | `getProperty(String key)`                                    | 获取系统属性（如 `System.getProperty("user.home")` 获取用户主目录） |
  | `lineSeparator()`                                            | 返回系统换行符（跨平台兼容，Windows 为 `\r\n`，Linux 为 `\n`） |

##### `Math`（数学运算工具类）

- 核心方法

  （1.8 新增 2 个关键方法）：

  | 方法名                    | 功能示例                                                     |
  | ------------------------- | ------------------------------------------------------------ |
  | `floorDiv(int x, int y)`  | 向下取整除法：`Math.floorDiv(7, 3)` → `2`（区别于 `7/3` 的整数除法） |
  | `floorMod(int x, int y)`  | 向下取整取模：`Math.floorMod(7, 3)` → `1`；`Math.floorMod(-7, 3)` → `2` |
  | `random()`                | 返回 `[0.0, 1.0)` 随机数（`(int)(Math.random() * 100)` 生成 0-99 整数） |
  | `abs(int a)`              | 绝对值：`Math.abs(-5)` → `5`                                 |
  | `pow(double a, double b)` | 幂运算：`Math.pow(2, 3)` → `8.0`                             |

#### 5. 线程与并发基础类

##### `Thread`（线程类）

- **功能**：创建和控制线程，是 Java 多线程的基础。

- **1.8 特性**：支持 Lambda 表达式创建线程（因 `Runnable` 是函数式接口）：

  java

  ```java
  // 传统方式（匿名内部类）
  new Thread(new Runnable() {
      @Override
      public void run() {
          System.out.println("线程运行");
      }
  }).start();
  
  // 1.8 Lambda 简化
  new Thread(() -> System.out.println("线程运行")).start();
  ```

- **核心方法**：

  | 方法名                  | 功能                                                         |
  | ----------------------- | ------------------------------------------------------------ |
  | `start()`               | 启动线程（底层调用 `run()`，不能重复调用）                   |
  | `run()`                 | 线程执行体（重写此方法定义线程任务）                         |
  | `join()`                | 等待线程结束（如 `t.join()` 表示当前线程等待 `t` 线程执行完毕） |
  | `sleep(long millis)`    | 线程休眠（暂停执行指定毫秒数，不释放锁）                     |
  | `interrupt()`           | 中断线程（设置中断标志，需配合 `isInterrupted()` 判断）      |
  | `setDaemon(boolean on)` | 设置为守护线程（如 GC 线程，主线程结束后自动退出）           |

##### `ThreadLocal<T>`（线程本地变量）

- **功能**：为每个线程存储独立的变量副本，解决线程安全问题（无需同步）。

- **1.8 新增方法**：

  - ```
    static <S> ThreadLocal<S> withInitial(Supplier<? extends S> supplier)
    ```

    ：简化初始化（替代传统的

     

    ```
    initialValue()
    ```

     

    重写）：

    java

    ```java
    // 1.8 前：需重写 initialValue()
    ThreadLocal<String> oldTL = new ThreadLocal<String>() {
        @Override
        protected String initialValue() {
            return "default";
        }
    };
    
    // 1.8 简化：使用 Supplier
    ThreadLocal<String> newTL = ThreadLocal.withInitial(() -> "default");
    ```

- **关键注意**：使用后必须调用 `remove()` 清理，否则可能导致内存泄漏（线程池复用线程时变量残留）。

#### 6. 反射与类加载相关类

##### `Class<T>`（类的字节码表示）

- **功能**：反射的入口，代表类的运行时信息，可动态获取类的成员（方法、字段等）。

- **获取方式**：

  java

  ```java
  Class<?> cls1 = String.class; // 类名.class
  Class<?> cls2 = "abc".getClass(); // 对象.getClass()
  Class<?> cls3 = Class.forName("java.lang.String"); // 全类名（需处理 ClassNotFoundException）
  ```

- **1.8 新增方法**：

  - ```
    isAnnotationPresent(Class<? extends Annotation> annotationClass)
    ```

    ：判断类是否被指定注解标记：

    java

    ```java
    boolean hasFunc = Runnable.class.isAnnotationPresent(FunctionalInterface.class); // true
    ```

  - `getDeclaredMethod(String name, Class<?>... parameterTypes)`：获取类的声明方法（包括私有方法）。

##### `ClassLoader`（类加载器）

- **功能**：负责将类的字节码加载到 JVM 中，Java 采用 “双亲委派模型” 加载类。

- 核心方法

  ：

  - `loadClass(String name)`：加载指定类（遵循双亲委派）。

  - ```
    getResourceAsStream(String name)
    ```

    ：加载类路径下的资源（如配置文件）：

    java

    ```java
    InputStream in = ClassLoader.getSystemResourceAsStream("config.properties");
    ```

#### 7. 其他核心类

| 类名        | 功能描述                                                     | 1.8 特性                                           |
| ----------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `Package`   | 表示类所在的包，包含包的元信息（如名称、版本）               | `getImplementationVersion()` 获取包版本            |
| `Void`      | 表示 `void` 关键字的包装类（无实例，仅作为标记）             | 无新增                                             |
| `Boolean`   | `boolean` 类型的包装类，提供 `TRUE`/`FALSE` 常量             | 新增 `logicalAnd()`/`logicalOr()` 等逻辑运算方法   |
| `Character` | `char` 类型的包装类，提供字符判断方法（如 `isDigit()`/`isLetter()`） | 新增 `isSurrogatePair()` 判断是否为 Unicode 代理对 |

### 二、核心接口

#### 1. `Runnable`（任务接口）

- **抽象方法**：`void run()`（定义线程任务）。

- 1.8 特性

  ：被标记为

   

  ```
  @FunctionalInterface
  ```

  （函数式接口），支持 Lambda 表达式：

  java

  ```java
  Runnable task = () -> System.out.println("执行任务");
  ```

#### 2. `Comparable<T>`（可比较接口）

- **抽象方法**：`int compareTo(T o)`（定义对象的自然排序规则）。

- 示例

  ：自定义类实现排序：

  java

  

  运行

  ```java
  class Person implements Comparable<Person> {
      private int age;
      @Override
      public int compareTo(Person o) {
          return Integer.compare(this.age, o.age); // 按年龄升序
      }
  }
  // 使用：List<Person> 可直接调用 sort()
  ```

#### 3. `Iterable<T>`（可迭代接口）

- **功能**：支持增强 for 循环（`for-each`），所有集合类（`List`/`Set` 等）都实现此接口。

- 1.8 新增默认方法

  ：

  - ```
    forEach(Consumer<? super T> action)
    ```

    ：遍历元素（支持 Lambda）：

    java

    ```java
    List<String> list = Arrays.asList("a", "b");
    list.forEach(s -> System.out.println(s)); // 替代传统 for 循环
    ```

  - `Spliterator<T> spliterator()`：返回可分割迭代器（支持 Stream 并行操作）。

#### 4. `AutoCloseable`（自动关闭接口）

- **抽象方法**：`void close()`（定义资源关闭逻辑）。

- 功能

  ：支持 try-with-resources 语法（自动关闭资源，如文件流、数据库连接）：

  java

  ```java
  // 无需手动调用 close()，try 块结束后自动关闭
  try (FileInputStream fis = new FileInputStream("file.txt")) {
      // 操作文件
  } catch (IOException e) {
      e.printStackTrace();
  }
  ```

### 三、枚举类

#### 1. `Thread.State`（线程状态枚举）

- 定义线程的 6 种状态：`NEW`（新建）、`RUNNABLE`（可运行）、`BLOCKED`（阻塞）、`WAITING`（等待）、`TIMED_WAITING`（超时等待）、`TERMINATED`（终止）。

#### 2. `Character.UnicodeBlock`（Unicode 字符块枚举）

- 表示 Unicode 字符的分类（如 `BASIC_LATIN`、`CJK_UNIFIED_IDEOGRAPHS` 等）。

### 四、异常与错误类（`Throwable` 体系）

`java.lang` 包定义了所有异常和错误的基类，形成以下层次：

plaintext

```plaintext
Throwable
├─ Error（错误：JVM 无法处理，如内存溢出）
│  ├─ VirtualMachineError（虚拟机错误）
│  │  ├─ OutOfMemoryError（内存溢出）
│  │  └─ StackOverflowError（栈溢出）
│  └─ NoClassDefFoundError（类定义未找到）
│
└─ Exception（异常：程序可处理）
   ├─ RuntimeException（运行时异常：非受检，可不捕获）
   │  ├─ NullPointerException（空指针）
   │  ├─ IndexOutOfBoundsException（索引越界）
   │  └─ ClassCastException（类型转换）
   │
   └─ 受检异常（必须捕获或声明抛出）
      ├─ InterruptedException（线程中断）
      └─ CloneNotSupportedException（克隆不支持）
```

### 五、1.8 新增核心元素

1. **`@FunctionalInterface` 注解**：
   标记函数式接口（仅含一个抽象方法），如 `Runnable`、`Comparable` 等，编译器会校验接口是否符合规范。

2. **`Objects` 工具类**（1.7 新增，1.8 增强）：
   提供静态工具方法，避免空指针异常：

   java

   ```java
   Objects.equals(a, b); // 安全比较（a 或 b 为 null 时不抛异常）
   Objects.requireNonNull(obj, "对象不能为空"); // 校验非空，否则抛异常
   ```

### 总结

`java.lang` 包是 Java 语言的 “基石”，涵盖：

- 所有类的根类 `Object`；
- 基本类型包装、字符串、系统操作等基础类；
- 线程、反射、异常等核心机制；
- 1.8 新增的函数式接口支持和工具方法。

理解这些类的底层实现（如 `String` 的不可变性、`ThreadLocal` 的内存模型）是写出高效、安全 Java 代码的关键。



# 题

### 一、`java.lang` 八股文（15 题，难度递增）

#### 基础篇（1-5 题）

1. **`java.lang.Object` 有哪些核心方法？分别有什么作用？**
   答案：`Object` 包含 `equals`（判断对象相等性）、`hashCode`（返回对象哈希码，需与`equals`逻辑一致）、`toString`（生成对象的字符串表示）、`getClass`（获取运行时类，是反射的入口）、`clone`（创建对象浅拷贝，需实现`Cloneable`接口）、`wait`/`notify`/`notifyAll`（线程间通信，基于对象监视器锁）、`finalize`（垃圾回收前回调，已过时）。
2. **`String` 为什么是不可变的？有什么好处？**
   答案：`String` 底层由 `final char[]`（JDK9 后为`byte[]`）实现，所有 “修改” 方法（如`substring`、`replace`）都会创建新`String`对象。好处：线程安全（可安全共享）、作为`HashMap`等容器的键更稳定（哈希值不变）、字符串常量池可复用相同字符串，节省内存。
3. **`Integer` 的缓存机制是怎样的？范围是多少？**
   答案：`Integer` 对 `[-128, 127]` 范围内的整数使用缓存（由`IntegerCache`类实现）。通过`Integer.valueOf(int)`获取对象时，此范围直接返回缓存实例；超出范围则新建对象。目的是减少小整数的对象创建开销。
4. **`ThreadLocal` 的作用是什么？使用时需要注意什么？**
   答案：`ThreadLocal` 为每个线程存储独立的变量副本，解决多线程下的线程安全问题（无需同步锁）。使用时必须调用`remove()`清理，否则线程池复用线程时，变量会因线程长期存在而无法回收，导致**内存泄漏**。
5. **`java.lang.Throwable` 体系结构是怎样的？`Error` 和 `Exception` 的区别？**
   答案：`Throwable` 是所有异常 / 错误的父类，子类分为`Error`（JVM 无法恢复的错误，如`OutOfMemoryError`）和`Exception`（程序可处理的异常）。`Exception`又分**受检异常**（必须捕获或声明抛出，如`IOException`）和**运行时异常**（`RuntimeException`子类，可不强制处理，如`NullPointerException`）。

#### 进阶篇（6-10 题）

1. **`String`、`StringBuilder`、`StringBuffer` 的区别？**
   答案：`String` 不可变；`StringBuilder` 可变、非线程安全、效率高；`StringBuffer` 可变、线程安全（方法加`synchronized`）、效率略低。单线程字符串拼接用`StringBuilder`，多线程用`StringBuffer`。
2. **`Object.equals` 和 `Objects.equals` 有什么区别？**
   答案：`Object.equals` 是实例方法，若调用者为`null`会抛`NullPointerException`；`Objects.equals` 是工具类的静态方法，会先判断`null`，更安全（如`Objects.equals(null, "a")`返回`false`，无异常）。
3. **`Thread.sleep()` 和 `Object.wait()` 的区别？**
   答案：`sleep` 是`Thread`的静态方法，休眠时**不释放对象锁**，时间到自动唤醒；`wait` 是`Object`的方法，**必须在`synchronized`块中调用**，会释放锁，需`notify`/`notifyAll`主动唤醒。
4. **`Class.forName()` 和 `ClassLoader.loadClass()` 的区别？**
   答案：`Class.forName()` 会触发类的**初始化**（执行静态代码块、静态变量赋值）；`ClassLoader.loadClass()` 仅加载类（获取`Class`对象），不触发初始化。例如 JDBC 驱动加载需用`Class.forName`触发静态注册。
5. **`@FunctionalInterface` 注解的作用？哪些接口是函数式接口？**
   答案：`@FunctionalInterface` 用于标记**函数式接口**（仅含一个抽象方法的接口），编译器会校验接口是否符合规范。`java.lang` 中典型的函数式接口有`Runnable`（`run`方法）、`Comparable`（`compareTo`方法）等。

#### 源码 & 设计篇（11-15 题）

1. **`String.intern()` 方法的作用？JDK6 和 JDK7 + 有什么区别？**
   答案：`intern()` 将字符串放入常量池，返回常量池中的引用。JDK6 中，常量池在**永久代**，`intern`会复制字符串到永久代；JDK7 + 中，常量池移到**堆**中，`intern`若常量池已有则返回引用，否则直接存堆中字符串的引用（节省空间）。
2. **`Integer.valueOf(int i)` 和 `new Integer(int i)` 的区别？**
   答案：`valueOf` 会利用`[-128,127]`的缓存，返回缓存对象或新对象；`new Integer` 每次都**新建对象**。因此`valueOf`更高效，推荐使用。
3. **`ThreadLocal` 的实现原理？为什么会有内存泄漏风险？**
   答案：`ThreadLocal` 内部是`ThreadLocalMap`（线程的成员变量），键是`ThreadLocal`的**弱引用**（`WeakReference`），值是线程变量。若`ThreadLocal`外部引用消失，键会被 GC 回收，但值若未手动`remove`，会因线程（如线程池线程）长期存在而无法回收，导致内存泄漏。
4. **`Object.clone()` 是深拷贝还是浅拷贝？如何实现深拷贝？**
   答案：默认是**浅拷贝**（仅复制对象引用，不复制引用的对象）。实现深拷贝：重写`clone`时对引用类型成员也调用`clone`；或通过**序列化**（对象实现`Serializable`，先序列化再反序列化）。
5. **`java.lang` 包的设计体现了哪些面向对象思想？**
   答案：继承（`Object`是所有类的父类）、封装（`String`封装不可变的`char[]`）、多态（`Object`的方法被子类重写）；还体现了单例（如`Runtime.getRuntime()`）、工厂模式（`Class.forName`创建类）等设计模式思想。

### 二、`java.lang` 场景题（5 题）

1. **场景：** 频繁拼接大量字符串时，`String` 直接`+`拼接性能差，如何优化？
   答案：使用`StringBuilder`（单线程）或`StringBuffer`（多线程），它们是可变字符序列，避免频繁创建新对象。示例：

   java

   ```java
   StringBuilder sb = new StringBuilder();
   for (int i = 0; i < 1000; i++) {
       sb.append("item").append(i);
   }
   String result = sb.toString();
   ```

2. **场景：** 编写工具方法判断两个对象 “逻辑相等”，需避免空指针，如何实现？
   答案：使用`Objects.equals`工具方法，它会先判断`null`。示例：

   java

   ```java
   public static boolean isEqual(Object a, Object b) {
       return Objects.equals(a, b);
   }
   ```

3. **场景：** 多线程环境下，每个线程需独立的 “用户上下文”，如何保证线程安全且不影响性能？
   答案：使用`ThreadLocal`存储上下文。示例：

   java

   ```java
   public class UserContextHolder {
       private static final ThreadLocal<UserContext> context = ThreadLocal.withInitial(UserContext::new);
       public static UserContext get() { return context.get(); }
       public static void set(UserContext ctx) { context.set(ctx); }
       public static void clear() { context.remove(); } // 关键：用完清理
   }
   ```

4. **场景：** 如何通过反射调用类的私有方法？
   答案：用`Class.getDeclaredMethod`获取方法，设置`setAccessible(true)`绕过访问检查，再调用`invoke`。示例：

   java

   ```java
   Class<?> cls = TargetClass.class;
   Method method = cls.getDeclaredMethod("privateMethod");
   method.setAccessible(true);
   method.invoke(cls.newInstance());
   ```

5. **场景：** 监控线程状态（如运行、阻塞），如何实现？
   答案：通过`Thread.getState()`获取线程状态（`Thread.State`枚举）。示例：

   java

   ```java
   Thread t = new Thread(() -> {
       try { Thread.sleep(1000); } catch (InterruptedException e) {}
   });
   t.start();
   System.out.println(t.getState()); // RUNNABLE
   Thread.sleep(500);
   System.out.println(t.getState()); // TIMED_WAITING
   ```

### 三、`java.lang` 相关小项目：简易命令行学生管理系统（~200 行，含详细注释）

java

```java
package top.rongx.studentmanager;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.concurrent.ThreadLocalRandom;

/**
 * @author lrx56
 */
public class StudentManagementSystem {
    private static final List<Student> students = new ArrayList<>();
    private static final Scanner scanner = new Scanner(System.in);
    private static final ThreadLocal<List<String>> cmdHistory = ThreadLocal.withInitial(ArrayList::new);

    public static void main(String[] args) {
        initStudents();

        // 修复：线程使用英文命名，分步骤设置守护线程并启动
        Thread promptThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(5000);
                    System.out.println("\n=== 自动提示：当前系统中有 " + students.size() + " 名学生 ===");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break; // 中断后退出循环，避免无限等待
                }
            }
        });
        promptThread.setDaemon(true);
        promptThread.start();

        while (true) {
            System.out.print("请输入命令（help 查看帮助）：");
            String cmd = scanner.nextLine().trim();
            cmdHistory.get().add(cmd);

            if ("exit".equalsIgnoreCase(cmd)) {
                System.out.println("系统退出，再见！");
                scanner.close();
                break;
            }

            // 修复：处理空命令和无效命令格式
            if (cmd.isEmpty()) {
                System.out.println("命令不能为空，请重新输入（help 查看帮助）。");
                continue;
            }

            try {
                // 修复：仅保留命令中的字母，过滤特殊字符，增强健壮性
                String cleanCmd = cmd.replaceAll("[^a-zA-Z]", "");
                if (cleanCmd.isEmpty()) {
                    System.out.println("命令格式无效，请输入有效命令（help 查看帮助）。");
                    continue;
                }
                // 构建方法名（首字母大写 + 其余部分）
                String methodName = "execute" +
                        cleanCmd.substring(0, 1).toUpperCase() +
                        cleanCmd.substring(1).toLowerCase();

                Method method = StudentManagementSystem.class.getMethod(methodName);
                method.invoke(null);
            } catch (NoSuchMethodException e) {
                System.out.println("未知命令，请输入 help 查看可用命令。");
            } catch (Exception e) {
                System.out.println("执行命令出错：" + e.getMessage());
            }
        }
    }

    private static void initStudents() {
        students.add(new Student(1, "张三", 18));
        students.add(new Student(2, "李四", 20));
    }

    public static void executeHelp() {
        System.out.println("可用命令：");
        System.out.println("  list：列出所有学生");
        System.out.println("  add：添加学生");
        System.out.println("  find：查找学生（按ID）");
        System.out.println("  remove：删除学生（按ID）");
        System.out.println("  history：查看命令历史");
        System.out.println("  exit：退出系统");
    }

    public static void executeList() {
        if (students.isEmpty()) {
            System.out.println("暂无学生数据。");
            return;
        }
        System.out.println("=== 学生列表 ===");
        for (Student s : students) {
            System.out.println(s);
        }
    }

    public static void executeAdd() {
        System.out.print("请输入学生姓名：");
        String name = scanner.nextLine().trim();
        if (name.isEmpty()) {
            System.out.println("姓名不能为空，添加失败。");
            return;
        }

        // 修复：处理年龄输入的非数字异常
        int age;
        try {
            System.out.print("请输入学生年龄：");
            age = Integer.parseInt(scanner.nextLine().trim());
            if (age <= 0 || age > 150) {
                System.out.println("年龄必须在1-150之间，添加失败。");
                return;
            }
        } catch (NumberFormatException e) {
            System.out.println("年龄必须是数字，添加失败。");
            return;
        }

        int id = ThreadLocalRandom.current().nextInt(100, 1000);
        Student student = new Student(id, name, age);
        students.add(student);
        System.out.println("添加成功：" + student);
    }

    public static void executeFind() {
        // 修复：处理ID输入的非数字异常
        int id;
        try {
            System.out.print("请输入要查找的学生ID：");
            id = Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException e) {
            System.out.println("ID必须是数字，查找失败。");
            return;
        }

        Student target = null;
        for (Student s : students) {
            if (s.getId().equals(id)) {
                target = s;
                break;
            }
        }
        if (target != null) {
            System.out.println("找到学生：" + target);
        } else {
            System.out.println("未找到ID为 " + id + " 的学生。");
        }
    }

    public static void executeRemove() {
        // 修复：处理ID输入的非数字异常
        int id;
        try {
            System.out.print("请输入要删除的学生ID：");
            id = Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException e) {
            System.out.println("ID必须是数字，删除失败。");
            return;
        }

        boolean removed = students.removeIf(s -> s.getId().equals(id));
        if (removed) {
            System.out.println("删除成功！");
        } else {
            System.out.println("未找到ID为 " + id + " 的学生，删除失败。");
        }
    }

    public static void executeHistory() {
        List<String> history = cmdHistory.get();
        System.out.println("=== 命令历史（共 " + history.size() + " 条）===");
        for (int i = 0; i < history.size(); i++) {
            System.out.println(i + 1 + ". " + history.get(i));
        }
    }
}


```



**项目说明：**

- `Student` 类演示 `Object` 的 `equals`、`hashCode`、`toString` 重写，以及 `Integer` 等包装类的使用。

- ```
  StudentManagementSystem
  ```

   

  核心功能：

  - **`ThreadLocal`**：存储每个线程独立的命令历史，避免线程间干扰。
  - **`Thread`**：创建异步提示线程（守护线程），演示多线程基础。
  - **反射**：通过`Class.getMethod`和`Method.invoke`动态执行命令方法，降低代码耦合。
  - **字符串操作**：`trim`、`substring` 等方法处理命令输入。
  - **基本类型包装**：`Integer.parseInt` 解析用户输入的 ID、年龄。

运行程序后，可通过命令行执行 `list`、`add`、`find` 等操作，直观体验 `java.lang` 核心 API 在实际场景中的应用。