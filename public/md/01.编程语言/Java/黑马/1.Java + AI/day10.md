# 【Java +AI ｜基础加强篇day10 异常 泛型 集合】

## 一、异常（Exception）—— 程序健壮性的核心保障

### 1. 异常基础核心

#### （1）异常的本质

异常是程序运行时的**非正常执行流程**，由代码逻辑错误或外部环境异常（如文件缺失、网络中断）触发，会中断默认执行顺序。

#### （2）异常体系结构（顶层 `Throwable`）

plaintext

```plaintext
Throwable
├─ Error：系统级错误（JVM层面，不可恢复）
│  ├─ OutOfMemoryError（内存溢出）
│  └─ StackOverflowError（栈溢出）
└─ Exception：可处理异常
   ├─ 编译时异常（Checked Exception）：编译强制处理
   │  ├─ IOException（IO操作异常）
   │  └─ SQLException（数据库操作异常）
   └─ 运行时异常（Unchecked Exception）：运行时触发
      ├─ NullPointerException（空指针）
      ├─ ArrayIndexOutOfBoundsException（数组下标越界）
      └─ IllegalArgumentException（非法参数）
```

#### （3）核心异常处理机制

##### ① try-catch-finally

java

```java
try {
    // 可能触发异常的代码（如文件读取、数据库连接）
    FileReader fr = new FileReader("test.txt");
} catch (FileNotFoundException e) {
    // 异常处理逻辑（如日志记录、友好提示）
    System.out.println("文件不存在，请检查路径");
    e.printStackTrace(); // 打印栈追踪信息，便于排查
} finally {
    // 必须执行的代码（如资源关闭，无论是否异常）
    if (fr != null) {
        try {
            fr.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

- 执行逻辑：try 块异常 → 匹配 catch 块 → 执行 finally；无异常 → 跳过 catch → 执行 finally。

##### ② throws 声明异常

方法不处理异常，将责任转移给调用者，适用于 “异常无法在当前方法解决” 的场景（如 DAO 层数据库异常）。

java

```java
// 声明抛出编译时异常，调用者必须处理（try-catch 或继续 throws）
public void readFile(String path) throws FileNotFoundException, IOException {
    FileReader fr = new FileReader(path);
    fr.read();
}
```

##### ③ throw 主动抛出异常

手动触发异常，用于业务校验（如参数合法性检查）。

java

```java
public void register(User user) {
    if (user.getAge() < 18 || user.getAge() > 120) {
        // 主动抛出运行时异常，中断流程
        throw new IllegalArgumentException("年龄必须在18-120岁之间");
    }
}
```

### 2. 异常深入原理

#### （1）异常表（Exception Table）

- 编译后，

  ```
  try-catch
  ```

   

  会被转化为 “异常表” 存储在字节码中，记录：

  - `start_pc`/`end_pc`：try 块的字节码范围。
  - `handler_pc`：异常处理逻辑的字节码地址。
  - `catch_type`：捕获的异常类型（全类名）。

- JVM 运行时，触发异常后会遍历异常表，匹配对应的处理逻辑；无匹配则向上层方法传递，直至 JVM 终止程序。

#### （2）栈追踪（Stack Trace）

- 异常对象通过 `StackTraceElement[] getStackTrace()` 存储方法调用链，包含异常发生时的类名、方法名、行号。
- 核心价值：快速定位异常根源（如多层调用中，明确是 DAO 层还是 Service 层触发）。

#### （3）自定义异常

Java 内置异常无法满足业务需求时（如 “用户不存在”“订单已支付”），可自定义异常：

- 继承 `Exception`（编译时异常）或 `RuntimeException`（运行时异常，推荐业务异常使用）。
- 提供无参、带消息参数的构造器，支持异常链传递。

示例（业务异常）：

java

```java
// 自定义运行时异常（业务异常无需强制处理，更灵活）
public class UserNotFoundException extends RuntimeException {
    // 无参构造器
    public UserNotFoundException() {
        super();
    }
    // 带消息的构造器
    public UserNotFoundException(String message) {
        super(message);
    }
    // 支持异常链（保留原始异常信息）
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

// 业务层使用
public User getUserById(String userId) {
    User user = userDao.selectById(userId);
    if (user == null) {
        throw new UserNotFoundException("用户ID：" + userId + " 不存在");
    }
    return user;
}
```

### 3. 异常实战场景与最佳实践

#### （1）典型业务场景

| 场景               | 异常类型                       | 处理方式                                    |
| ------------------ | ------------------------------ | ------------------------------------------- |
| 用户注册参数非法   | 自定义 `IllegalParamException` | 抛运行时异常，Controller 捕获返回 400 响应  |
| 订单支付时已支付   | 自定义 `OrderPaidException`    | 抛运行时异常，前端显示 “订单已支付”         |
| 文件上传时格式错误 | `IllegalArgumentException`     | 主动 throw，前端提示 “支持 JPG/PNG 格式”    |
| 数据库连接超时     | `SQLException`                 | DAO 层 throws，Service 层捕获封装为业务异常 |

#### （2）最佳实践

- ① 分层处理：异常需在合适的层级处理，避免 “一刀切”。

  - DAO 层：抛出技术异常（如 `SQLException`）。
  - Service 层：捕获技术异常，封装为业务异常（如 `DataAccessException`）。
  - Controller 层：捕获业务异常，返回 JSON 友好提示（如 `{"code":404,"msg":"用户不存在"}`）。

- ② 避免空捕获：`catch (Exception e) {}` 会隐藏异常，导致问题无法排查，需明确捕获具体异常。

- ③ 资源关闭优先用 try-with-resources（JDK7+）：自动关闭实现

  ```
  AutoCloseable
  ```

   

  接口的资源（如文件流、数据库连接），简化代码。

  java

  ```java
  // try-with-resources 自动关闭资源，无需 finally
  try (FileReader fr = new FileReader("test.txt")) {
      fr.read();
  } catch (IOException e) {
      e.printStackTrace();
  }
  ```

  

- ④ 异常信息要具体：避免 “操作失败”，应明确 “用户不存在”“库存不足”，便于前端提示和问题排查。

------

## 二、泛型（Generic）—— 类型安全的基石

### 1. 泛型基础核心

#### （1）泛型的本质

泛型是**参数化类型**，允许定义类、接口、方法时使用 “类型参数”，使用时再指定具体类型（如 `ArrayList` 明确存储字符串）。

- 核心价值：① 编译期类型检查，避免类型转换异常；② 代码复用，一个类 / 方法支持多种类型。

#### （2）泛型的三种核心形式

##### ① 泛型类

类定义时声明类型参数（如 `T`、`K`、`V`），类中成员（属性、方法）可使用该类型。

```java
// 泛型类：Box 可存储任意类型数据
public class Box<T> {
    private T data; // 泛型属性
    
    // 泛型构造器
    public Box(T data) {
        this.data = data;
    }
    
    // 泛型方法（返回值为泛型类型）
    public T getData() {
        return data;
    }
}

// 使用：指定具体类型为 String
Box<String> stringBox = new Box<>("Hello 泛型");
String data = stringBox.getData(); // 无需类型转换，编译期检查

// 指定具体类型为 Integer
Box<Integer> intBox = new Box<>(100);
Integer num = intBox.getData();
```

##### ② 泛型方法

方法独立声明类型参数（可独立于类泛型），适用于 “单个方法需要支持多种类型” 的场景。

java

```java
public class GenericMethodDemo {
    // 泛型方法：<E> 是类型参数，声明在返回值前
    public <E> E getElement(E[] array, int index) {
        return array[index];
    }
}

// 使用：自动推断类型
GenericMethodDemo demo = new GenericMethodDemo();
String[] strArr = {"a", "b", "c"};
String str = demo.getElement(strArr, 1); // 推断 E 为 String

Integer[] intArr = {1, 2, 3};
Integer num = demo.getElement(intArr, 1); // 推断 E 为 Integer
```

##### ③ 泛型接口

接口声明类型参数，实现类需指定具体类型或保留泛型。

java

```java
// 泛型接口：定义数据操作规范
public interface DataOperate<T> {
    void add(T data);
    T get(int index);
}

// 实现类：指定具体类型为 String
public class StringDataOperate implements DataOperate<String> {
    private List<String> list = new ArrayList<>();
    
    @Override
    public void add(String data) {
        list.add(data);
    }
    
    @Override
    public String get(int index) {
        return list.get(index);
    }
}
```

### 2. 泛型深入原理（类型擦除）

#### （1）核心原理：编译期擦除

泛型仅在**编译期**存在，运行时会被 “擦除” 为原始类型（`Object` 或上界类型），JVM 无法感知泛型信息。

- 示例：

  ```
  ArrayList<String>
  ```

  编译后为 

  ```
  ArrayList
  ```

  ，所有 

  ```
  String
  ```

  相关操作被擦除为

  ```
  Object
  ```

  ，再通过强制类型转换保证类型安全。

  java

  ```java
  // 编译前
  ArrayList<String> list = new ArrayList<>();
  list.add("a");
  String s = list.get(0);
  
  // 编译后（类型擦除）
  ArrayList list = new ArrayList();
  list.add("a");
  String s = (String) list.get(0); // 编译器自动添加强制类型转换
  ```

  

#### （2）桥接方法（Bridge Method）

类型擦除后可能破坏多态，编译器会自动生成 “桥接方法” 修复。

- 示例：泛型接口 `Comparable` 的 `compareTo(T o)` 擦除后为 `compareTo(Object o)`，实现类的 `compareTo(String o)` 会被编译器生成桥接方法 `compareTo(Object o)`，调用实际的 `compareTo(String o)`。

#### （3）泛型通配符（`?`）

通配符用于 “不确定具体类型” 的场景，分为三种：

##### ① 无界通配符 `?`

表示任意类型，仅用于 “读取” 操作，无法添加元素（除 `null`）。

java

```java
// 无界通配符：可接收 List<String>、List<Integer> 等任意 List
public void printList(List<?> list) {
    for (Object obj : list) {
        System.out.println(obj);
    }
}
```

##### ② 上界通配符 `? extends 父类`

表示 “父类或其子类”，支持读取（泛型协变），无法添加元素（避免类型不安全）。

- 场景：读取数值集合（如 `List`、`List`），统计总和。

java

```java
// 上界通配符：仅接收 Number 及其子类（Integer、Double 等）
public double sum(List<? extends Number> list) {
    double total = 0;
    for (Number num : list) {
        total += num.doubleValue(); // 调用 Number 的方法，安全
    }
    return total;
}

// 使用：可传入 List<Integer>、List<Double>
List<Integer> intList = Arrays.asList(1, 2, 3);
System.out.println(sum(intList)); // 输出 6.0
```

##### ③ 下界通配符 `? super 子类`

表示 “子类或其父类”，支持添加元素（泛型逆变），读取时仅能转为 `Object`。

- 场景：向集合添加整数（如 `List`、`List`、`List`）。

java

```java
// 下界通配符：仅接收 Integer 及其父类（Number、Object 等）
public void addIntegers(List<? super Integer> list) {
    list.add(100); // 可添加 Integer 及其子类（如 int）
    list.add(200);
}

// 使用：可传入 List<Integer>、List<Number>、List<Object>
List<Number> numList = new ArrayList<>();
addIntegers(numList);
System.out.println(numList); // 输出 [100, 200]
```

### 3. 泛型实战场景与最佳实践

#### （1）典型业务场景

| 场景           | 泛型应用                             | 价值体现                                      |
| -------------- | ------------------------------------ | --------------------------------------------- |
| 通用工具类     | `CollectionUtils.isEmpty(List list)` | 一个方法支持所有类型集合的空判断              |
| DAO 层通用封装 | `BaseDao` 实现增删改查               | 避免为 User、Order 等实体类重复写 DAO 代码    |
| 回调接口       | `Callback` 定义回调逻辑              | 回调返回值支持多种类型（如 User、List<User>） |
| 集合存储限制   | `List` 明确存储用户对象              | 编译期禁止添加非 User 类型，避免类型转换异常  |

#### （2）最佳实践

- ① 类型参数命名规范：使用单个大写字母（`T`-Type、`K`-Key、`V`-Value、`E`-Element），增强可读性。

- ② 避免泛型类型擦除的坑：

  - 不能用

    ```
    new T()
    ```

    ：类型擦除后 

    ```
    T
    ```

    为 

    ```
    Object
    ```

    ，无法实例化具体类型（解决方案：传入

    ```
    Class<T> 
    ```

    反射创建）。

    java

    运行

    ```java
    // 反射创建泛型实例
    public <T> T createInstance(Class<T> clazz) throws InstantiationException, IllegalAccessException {
        return clazz.newInstance();
    }
    ```

    

  - 不能用 `T[]` 作为方法返回值：可返回 `List` 或通过 `Array.newInstance(clazz, size)` 创建数组。

- ③ 泛型接口优先指定具体类型：避免 “裸类型”（如 `List` 而非 `List`），否则失去类型安全校验。

------

## 三、集合框架（Collection Framework）—— 数据存储的核心利器

### 1. 集合框架基础核心

#### （1）集合的本质与体系

集合是用于**存储多个数据**的容器，相比数组，具有动态扩容、丰富操作方法（增删改查）、支持多种数据结构（数组、链表、哈希表）的优势。

- 核心体系（Java 集合框架顶层接口）：

  plaintext

  ```plaintext
  单列集合：Collection
  ├─ List：有序、可重复（ArrayList、LinkedList、Vector）
  └─ Set：无序、不可重复（HashSet、TreeSet、LinkedHashSet）
  
  双列集合：Map
  ├─ HashMap：无序、键唯一（数组+链表+红黑树）
  ├─ TreeMap：有序、键唯一（红黑树）
  └─ LinkedHashMap：有序、键唯一（数组+链表+红黑树+双向链表）
  ```

  

#### （2）集合与数组的对比

| 对比维度 | 数组                               | 集合                                        |
| -------- | ---------------------------------- | ------------------------------------------- |
| 长度     | 固定（初始化后不可修改）           | 动态（自动扩容 / 缩容）                     |
| 存储类型 | 基本类型（int、char）+ 引用类型    | 仅引用类型（基本类型需包装类）              |
| 操作方法 | 无内置方法（需手动实现排序、查找） | 丰富内置方法（add、remove、contains、sort） |
| 数据结构 | 单一（数组）                       | 多样（数组、链表、哈希表、红黑树）          |
| 适用场景 | 固定长度、频繁随机访问             | 动态长度、需频繁增删改查                    |

#### （3）Collection 接口通用方法

所有单列集合（List、Set）的父接口，定义通用操作：

- `boolean add(E e)`：添加元素（成功返回 `true`）。
- `boolean remove(Object o)`：删除指定元素（成功返回 `true`）。
- `boolean contains(Object o)`：判断是否包含元素（依赖 `equals` 方法）。
- `int size()`：返回元素个数。
- `boolean isEmpty()`：判断是否为空。
- `void clear()`：清空集合。
- `Iterator iterator()`：获取迭代器，用于遍历集合。

### 2. List 集合 —— 有序、可重复、有索引

#### （1）ArrayList 深度解析（核心重点）

##### ① 底层数据结构

基于**动态数组**（`Object[] elementData`）实现，数组长度不足时自动扩容。

##### ② 初始化与扩容机制（源码级）

- 初始化：

  - `new ArrayList()`：JDK8 中初始容量为 `0`，第一次添加元素时扩容为 `10`。
  - `new ArrayList(int initialCapacity)`：指定初始容量，避免多次扩容（推荐预估元素数量时使用）。

- 扩容触发条件：添加元素后 `size > elementData.length`（`size` 是实际元素个数）。

- 扩容核心方法

  ```
  grow(int minCapacity)
  ```

  ：

  java

  ```java
  private void grow(int minCapacity) {
      int oldCapacity = elementData.length;
      // 新容量 = 旧容量 + 旧容量/2（即 1.5 倍扩容）
      int newCapacity = oldCapacity + (oldCapacity >> 1);
      // 若新容量仍不足（如初始容量为 0 时），直接使用 minCapacity
      if (newCapacity - minCapacity < 0) {
          newCapacity = minCapacity;
      }
      // 数组拷贝（基于 System.arraycopy，native 方法，性能较高）
      elementData = Arrays.copyOf(elementData, newCapacity);
  }
  ```

##### ③ 核心方法性能分析

| 方法                  | 时间复杂度 | 原理                                 |
| --------------------- | ---------- | ------------------------------------ |
| `get(int index)`      | O(1)       | 数组索引直接访问，无遍历             |
| `add(E e)`            | O(1)       | 尾部添加，无需移动元素；扩容时 O (n) |
| `add(int index, E e)` | O(n)       | 插入位置后元素需向后移动             |
| `remove(int index)`   | O(n)       | 删除位置后元素需向前移动             |

##### ④ 适用场景与优化

- 适用场景：频繁查询（如商品列表、用户列表分页查询）、批量添加元素。
- 性能优化：
  - 预估元素数量时，指定初始容量（如 `new ArrayList(1000)`），减少扩容次数。
  - 批量添加用 `addAll(Collection c)`，比循环 `add` 减少扩容次数。
  - 避免在遍历中删除元素（触发 `ConcurrentModificationException`），用迭代器 `remove()`。

#### （2）LinkedList 深度解析

##### ① 底层数据结构

基于**双向链表**实现，每个节点（`Node`）包含前驱指针（`prev`）、元素（`item`）、后继指针（`next`）。

java

```java
private static class Node<E> {
    E item;
    Node<E> next; // 后继节点
    Node<E> prev; // 前驱节点

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

##### ② 核心方法性能分析

| 方法                  | 时间复杂度 | 原理                               |
| --------------------- | ---------- | ---------------------------------- |
| `add(E e)`            | O(1)       | 尾部添加，仅修改尾节点指针         |
| `add(int index, E e)` | O(n)       | 需遍历找到索引位置，再修改指针     |
| `get(int index)`      | O(n)       | 需从表头 / 表尾遍历至目标索引      |
| `remove(int index)`   | O(n)       | 需遍历找到节点，再修改前后节点指针 |

##### ③ 适用场景

- 频繁增删（如消息队列、浏览器历史记录）、实现栈 / 队列数据结构（LinkedList 实现了 `Deque` 接口）。

- 队列实现（先进先出）：

  java

  ```java
  Queue<String> queue = new LinkedList<>();
  queue.offer("a"); // 入队（尾部添加）
  queue.offer("b");
  String elem = queue.poll(); // 出队（头部删除，返回 "a"）
  ```

  

- 栈实现（先进后出）：

  java

  ```java
  Deque<String> stack = new LinkedList<>();
  stack.push("a"); // 入栈（头部添加）
  stack.push("b");
  String elem = stack.pop(); // 出栈（头部删除，返回 "b"）
  ```

  

#### （3）List 遍历方式对比

| 遍历方式           | 优点                                | 缺点                             | 适用场景                         |
| ------------------ | ----------------------------------- | -------------------------------- | -------------------------------- |
| 普通 for 循环      | 可通过索引操作元素（修改、删除）    | 仅适用于有索引的集合（List）     | List 集合，需操作索引            |
| 增强 for 循环      | 代码简洁，无需索引                  | 无法删除元素（触发并发修改异常） | 所有 Collection 集合，仅遍历     |
| 迭代器（Iterator） | 支持遍历中安全删除（`it.remove()`） | 代码稍繁琐                       | 所有 Collection 集合，需遍历删除 |
| Lambda 表达式      | 代码最简洁（JDK8+）                 | 无法删除元素                     | 所有 Collection 集合，仅遍历     |

示例（迭代器安全删除）：

java

```java
List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c"));
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String elem = it.next();
    if ("a".equals(elem)) {
        it.remove(); // 迭代器删除，安全无异常
    }
}
System.out.println(list); // 输出 [b, c]
```

### 3. Set 集合 —— 无序、不可重复

#### （1）HashSet 深度解析

##### ① 底层数据结构

基于**哈希表**（`HashMap` 的 key 集）实现，JDK8 后为 “数组 + 链表 + 红黑树”：

- 数组：存储哈希桶（链表 / 红黑树的头节点）。
- 链表：解决哈希冲突（不同元素哈希值相同）。
- 红黑树：当链表长度 > 8 且数组长度 > 64 时，链表转为红黑树（查询时间复杂度从 O (n) 降至 O (log n)）。

##### ② 元素不可重复的原理

依赖 `hashCode()` 和 `equals()` 方法：

1. 添加元素时，先调用元素的 `hashCode()` 计算哈希值，确定数组索引位置。

2. 若该位置无元素，直接添加；若有元素，调用

    

   ```
   equals()
   ```

    

   比较：

   - `equals()` 返回 `true`：元素重复，不添加。
   - `equals()` 返回 `false`：哈希冲突，添加到链表 / 红黑树中。

##### ③ 重写 `hashCode()` 和 `equals()` 的规范

- 若 `a.equals(b) = true`，则 `a.hashCode() = b.hashCode()`（保证重复元素哈希值相同）。
- 若 `a.hashCode() = b.hashCode()`，`a.equals(b)` 可返回 `false`（允许哈希冲突）。

示例（自定义对象存入 HashSet）：

java

```java
public class User {
    private String id;
    private String name;

    // 重写 equals()：id 相同则为同一用户
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    // 重写 hashCode()：基于 id 计算哈希值
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

// 使用：id 相同的用户视为重复，无法重复添加
Set<User> userSet = new HashSet<>();
userSet.add(new User("1", "张三"));
userSet.add(new User("1", "张三")); // 重复，不添加
System.out.println(userSet.size()); // 输出 1
```

#### （2）TreeSet 深度解析

##### ① 底层数据结构

基于**红黑树**（平衡二叉查找树）实现，元素会按 “自然顺序” 或 “自定义比较器” 排序。

##### ② 元素有序的原理

- 自然排序：元素实现 `Comparable` 接口，重写 `compareTo(T o)` 方法。
- 自定义排序：创建 TreeSet 时传入 `Comparator` 接口实现。

示例（自定义排序）：

java

```java
// 按用户年龄升序排序
Set<User> userSet = new TreeSet<>((u1, u2) -> u1.getAge() - u2.getAge());
userSet.add(new User("1", "张三", 20));
userSet.add(new User("2", "李四", 18));
userSet.add(new User("3", "王五", 25));
// 遍历输出：李四（18）→ 张三（20）→ 王五（25）
```

#### （3）Set 集合选择策略

| 场景                     | 推荐集合      | 核心原因                                |
| ------------------------ | ------------- | --------------------------------------- |
| 无序、去重、查询快       | HashSet       | 哈希表查询 O (1)，性能最优              |
| 有序、去重、排序         | TreeSet       | 红黑树排序，支持自然排序 / 自定义排序   |
| 有序、去重、保留插入顺序 | LinkedHashSet | 哈希表 + 双向链表，查询快且保留插入顺序 |

### 4. Map 集合 —— 双列数据（键值对）

#### （1）HashMap 深度解析（核心重点）

##### ① 底层数据结构（JDK8）

“数组 + 链表 + 红黑树”：

- 数组（`Node[] table`）：存储哈希桶，默认初始容量 `16`（2 的幂，保证哈希均匀分布）。
- 链表：哈希冲突时，元素链化（链表长度 > 8 且数组长度 > 64 转为红黑树）。
- 红黑树：解决链表查询慢的问题，时间复杂度 O (log n)。

##### ② 核心原理（put 方法流程）

1. 计算键的哈希值：`hash = key.hashCode() ^ (hash >>> 16)`（高位参与运算，减少哈希冲突）。
2. 计算数组索引：`index = (table.length - 1) & hash`（保证索引在数组范围内）。
3. 插入元素：
   - 索引位置无元素：创建 `Node` 插入。
   - 索引位置有元素（哈希冲突）：
     - 键相同（`key.equals(oldKey)`）：覆盖值。
     - 键不同：链表插入（链表长度 > 8 转红黑树）。
4. 扩容判断：插入后 `size > threshold`（`threshold = 容量 × 负载因子`，默认负载因子 `0.75`），触发扩容（容量翻倍）。

##### ③ 核心参数

- 初始容量：`16`（默认），必须是 2 的幂（便于 `index = (n-1) & hash` 计算索引）。
- 负载因子：`0.75`（默认），平衡 “空间” 和 “时间”：负载因子越大，数组利用率越高，但哈希冲突越多；反之则相反。

##### ④ 适用场景

- 无序、键唯一、查询快（如用户信息缓存：`key=用户ID，value=User`）、购物车（`key=商品ID，value=购物车项`）。

#### （2）Map 集合核心方法

| 方法                              | 功能描述                               |
| --------------------------------- | -------------------------------------- |
| `V put(K key, V value)`           | 添加键值对（键存在则覆盖值，返回旧值） |
| `V get(Object key)`               | 根据键获取值（键不存在返回 `null`）    |
| `boolean containsKey(Object key)` | 判断是否包含指定键                     |
| `Set keySet()`                    | 获取所有键的集合（可遍历键）           |
| `Collection values()`             | 获取所有值的集合（可遍历值）           |
| `Set> entrySet()`                 | 获取键值对集合（推荐遍历方式）         |

#### （3）Map 遍历方式

java

```java
Map<String, String> map = new HashMap<>();
map.put("1", "张三");
map.put("2", "李四");

// 方式1：遍历键，再获取值（效率低，需多次 get）
for (String key : map.keySet()) {
    String value = map.get(key);
    System.out.println(key + ":" + value);
}

// 方式2：遍历键值对（推荐，效率高）
for (Map.Entry<String, String> entry : map.entrySet()) {
    String key = entry.getKey();
    String value = entry.getValue();
    System.out.println(key + ":" + value);
}

// 方式3：Lambda 遍历（JDK8+，代码简洁）
map.forEach((key, value) -> System.out.println(key + ":" + value));
```

### 5. 集合线程安全方案

#### （1）非线程安全集合

ArrayList、LinkedList、HashMap、HashSet 等默认非线程安全，多线程并发修改（如同时 `add`）会触发 `ConcurrentModificationException`。

#### （2）线程安全解决方案

##### ① 同步集合（Synchronized 修饰）

- `Vector`：ArrayList 的同步版（`add`、`get` 等方法加 `synchronized`）。
- `Hashtable`：HashMap 的同步版（所有方法加 `synchronized`）。
- 缺点：性能低（锁整个集合），仅适用于低并发场景。

##### ② 并发集合（JUC 包，推荐）

- `CopyOnWriteArrayList`：写时复制，读无锁、写加锁，适合读多写少场景（如配置缓存）。
- `ConcurrentHashMap`：JDK7 分段锁，JDK8 CAS + `synchronized`（锁哈希桶），并发性能优异。
- `ConcurrentLinkedQueue`：无锁队列，适合高并发生产 / 消费场景。

### 6. 集合选择总策略

| 业务场景             | 推荐集合                               | 核心原因                                   |
| -------------------- | -------------------------------------- | ------------------------------------------ |
| 频繁查询、少量增删   | ArrayList                              | 数组索引查询 O (1)，性能最优               |
| 频繁增删、少量查询   | LinkedList                             | 链表增删 O (1)，无需移动元素               |
| 无序去重、查询快     | HashSet                                | 哈希表查询 O (1)，去重依赖 hashCode/equals |
| 有序去重、需排序     | TreeSet                                | 红黑树排序，支持自然排序 / 自定义排序      |
| 键值对、查询快       | HashMap                                | 哈希表查询 O (1)，无序键唯一               |
| 键值对、需排序       | TreeMap                                | 红黑树排序，键有序唯一                     |
| 键值对、保留插入顺序 | LinkedHashMap                          | 哈希表 + 双向链表，查询快且有序            |
| 多线程并发修改       | ConcurrentHashMap/CopyOnWriteArrayList | 并发安全，性能优于同步集合                 |

------

## 四、综合实战案例（电商购物车系统）

### 1. 需求分析

实现电商购物车核心功能：

- 添加商品（支持重复添加，合并数量）。
- 删除商品（根据商品 ID）。
- 修改商品数量（校验库存）。
- 计算购物车总价。
- 查看购物车所有商品。

### 2. 技术选型

- 数据存储：`HashMap`（`key=商品ID，value=购物车项`，保证商品唯一且查询快）。
- 实体类：`Product`（商品）、`CartItem`（购物车项）、`ShoppingCart`（购物车核心逻辑）。
- 异常处理：自定义业务异常（`StockInsufficientException` 库存不足、`ProductNotFoundException` 商品不存在）。

### 3. 核心代码实现

#### （1）实体类定义

java

```java
// 商品类
class Product {
    private String id; // 商品ID（唯一）
    private String name; // 商品名称
    private double price; // 商品单价
    private int stock; // 库存

    // 构造器、getter、setter
}

// 购物车项类（封装商品+数量）
class CartItem {
    private Product product; // 商品
    private int quantity; // 购买数量

    // 计算单项总价
    public double getSubtotal() {
        return product.getPrice() * quantity;
    }

    // 构造器、getter、setter
}

// 自定义业务异常（库存不足）
class StockInsufficientException extends RuntimeException {
    public StockInsufficientException(String message) {
        super(message);
    }
}
```

#### （2）购物车核心逻辑

java

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Collection;

public class ShoppingCart {
    // 存储购物车项：key=商品ID，value=购物车项（保证商品唯一）
    private Map<String, CartItem> cartMap = new HashMap<>();

    /**
     * 添加商品到购物车
     * @param product 商品
     * @param quantity 购买数量
     */
    public void addProduct(Product product, int quantity) {
        // 校验参数
        if (product == null) {
            throw new IllegalArgumentException("商品不能为空");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("购买数量必须大于0");
        }
        // 校验库存
        if (product.getStock() < quantity) {
            throw new StockInsufficientException("商品《" + product.getName() + "》库存不足，当前库存：" + product.getStock());
        }

        String productId = product.getId();
        // 商品已在购物车：合并数量
        if (cartMap.containsKey(productId)) {
            CartItem item = cartMap.get(productId);
            int newQuantity = item.getQuantity() + quantity;
            // 再次校验合并后的数量是否超过库存
            if (product.getStock() < newQuantity) {
                throw new StockInsufficientException("商品《" + product.getName() + "》库存不足，当前库存：" + product.getStock() + "，已选：" + item.getQuantity());
            }
            item.setQuantity(newQuantity);
        } else {
            // 商品不在购物车：新增购物车项
            CartItem item = new CartItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            cartMap.put(productId, item);
        }
    }

    /**
     * 删除商品（根据商品ID）
     */
    public void removeProduct(String productId) {
        if (!cartMap.containsKey(productId)) {
            throw new ProductNotFoundException("商品ID：" + productId + " 不在购物车中");
        }
        cartMap.remove(productId);
    }

    /**
     * 修改商品数量
     */
    public void updateQuantity(String productId, int newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("修改数量必须大于0");
        }
        CartItem item = cartMap.get(productId);
        if (item == null) {
            throw new ProductNotFoundException("商品ID：" + productId + " 不在购物车中");
        }
        Product product = item.getProduct();
        if (product.getStock() < newQuantity) {
            throw new StockInsufficientException("商品《" + product.getName() + "》库存不足，当前库存：" + product.getStock());
        }
        item.setQuantity(newQuantity);
    }

    /**
     * 计算购物车总价
     */
    public double calculateTotal() {
        double total = 0;
        // 遍历所有购物车项，累加单项总价
        for (CartItem item : cartMap.values()) {
            total += item.getSubtotal();
        }
        return total;
    }

    /**
     * 查看购物车所有商品
     */
    public Collection<CartItem> getCartItems() {
        return cartMap.values();
    }
}
```

#### （3）测试类

java

```java
public class ShoppingCartTest {
    public static void main(String[] args) {
        // 初始化商品
        Product p1 = new Product("1", "Java编程思想", 89.0, 10);
        Product p2 = new Product("2", "数据结构", 69.0, 5);

        // 创建购物车
        ShoppingCart cart = new ShoppingCart();

        // 测试添加商品
        cart.addProduct(p1, 2);
        cart.addProduct(p2, 1);
        System.out.println("购物车总价：" + cart.calculateTotal()); // 89*2 + 69*1 = 247.0

        // 测试重复添加商品（合并数量）
        cart.addProduct(p1, 1); // 已选2本，新增1本，共3本
        System.out.println("重复添加后总价：" + cart.calculateTotal()); // 89*3 + 69*1 = 336.0

        // 测试修改数量
        cart.updateQuantity("1", 4);
        System.out.println("修改数量后总价：" + cart.calculateTotal()); // 89*4 + 69*1 = 425.0

        // 测试删除商品
        cart.removeProduct("2");
        System.out.println("删除商品后总价：" + cart.calculateTotal()); // 89*4 = 356.0

        // 测试库存不足
        try {
            cart.addProduct(p1, 7); // 库存10，已选4，新增7 → 共11，库存不足
        } catch (StockInsufficientException e) {
            System.out.println("异常提示：" + e.getMessage()); // 输出库存不足提示
        }
    }
}
```

### 4. 案例技术点总结

- 集合应用：`HashMap` 保证商品唯一（按 ID）和查询高效（O (1)），适合购物车 “高频查询、频繁修改” 的场景。
- 异常处理：自定义业务异常，明确异常原因，便于前端提示和问题排查。
- 面向对象：封装 `ShoppingCart` 类，将购物车逻辑与界面分离，符合 “单一职责原则”。
- 业务校验：添加 / 修改商品时校验库存、数量合法性，保证程序健壮性。

------

## 五、面试高频考点总结

### 1. 异常相关

- 异常体系结构：`Throwable` 子类、编译时异常与运行时异常的区别。
- 异常处理机制：`try-catch-finally` 执行顺序（如 finally 一定会执行吗？答：除非 JVM 终止，如 `System.exit(0)`）。
- 自定义异常：为什么推荐继承 `RuntimeException`？（无需强制处理，更灵活）。

### 2. 泛型相关

- 类型擦除：泛型在运行时的表现（擦除为 `Object` 或上界类型）。
- 泛型通配符：上界 `? extends T` 与下界 `? super T` 的区别（读取用 extends，写入用 super）。
- 泛型的限制：不能实例化 `new T()`、不能用 `T[]` 作为返回值。

### 3. 集合相关

- ArrayList vs LinkedList：数据结构、时间复杂度、适用场景。
- HashMap 底层原理：JDK8 数据结构（数组 + 链表 + 红黑树）、put 流程、扩容机制。
- HashMap vs Hashtable vs ConcurrentHashMap：线程安全、性能、底层实现。
- 集合线程安全：同步集合与并发集合的区别（ConcurrentHashMap 性能优势）。
- HashSet 去重原理：依赖 `hashCode()` 和 `equals()` 方法的配合。

### 4. 综合应用

- 集合选择策略：根据业务场景（查询 / 增删频率、是否有序、是否去重）选择合适的集合。
- 泛型与集合结合：`List` 与 `List` 的关系（无继承关系，泛型不协变）。

通过以上完整笔记，可系统掌握 Java 异常、泛型、集合框架的基础用法、底层原理、实战场景与面试考点，形成完整的 Java 核心技术体系，为后续学习并发编程、框架源码（如 Spring、MyBatis）奠定坚实基础。





# 5 道 Java 核心技术（异常 + 泛型 + 集合）中大厂面试题

## 面试题 1

请详细描述 JDK8 中 HashMap 的底层数据结构、put 方法执行流程，以及扩容机制的核心细节（包括初始容量、负载因子、扩容触发条件、红黑树转换阈值）。

## 面试题 2

什么是泛型的类型擦除？类型擦除会带来哪些问题？请举例说明`List`和`List`的区别及适用场景，为什么不能向`List`中添加除`null`外的元素？

## 面试题 3

ArrayList 和 LinkedList 的底层数据结构、核心方法时间复杂度有何差异？请分别说明两者的适用场景，并解释：为什么 ArrayList 的扩容因子默认是 0.75？LinkedList 的迭代器遍历比普通 for 循环遍历效率高的原因是什么？

## 面试题 4

Java 异常体系中，编译时异常（Checked Exception）和运行时异常（Unchecked Exception）的核心区别是什么？自定义业务异常时，推荐继承 RuntimeException 而非 Exception，为什么？请设计一个分层架构（DAO+Service+Controller）的异常处理方案，说明各层异常的传递和处理逻辑。

## 面试题 5

Java 中集合的线程安全方案有哪些？请对比 Synchronized 同步集合（如 Vector、Hashtable）和 JUC 并发集合（如 ConcurrentHashMap、CopyOnWriteArrayList）的实现原理、性能差异及适用场景。并解释 ConcurrentHashMap 在 JDK7 和 JDK8 中的核心实现变化。

------

# 面试题答案

## 面试题 1 答案

### 1. 底层数据结构（JDK8）

HashMap 底层采用 “**数组 + 链表 + 红黑树**” 的混合结构：

- 数组（`Node[] table`）：存储哈希桶，每个元素是链表或红黑树的头节点，默认初始容量为`16`（必须是 2 的幂，保证哈希值均匀分布）。
- 链表：解决哈希冲突（不同 key 哈希值相同），当链表长度超过阈值时转为红黑树。
- 红黑树：当链表长度`>8`且数组长度`>64`时，链表转为红黑树（查询时间复杂度从 O (n) 降至 O (log n)）；当红黑树节点数`<6`时，退化为链表。

### 2. put 方法执行流程

1. **计算哈希值**：通过`key.hashCode() ^ (hash >>> 16)`计算 key 的哈希值（高位参与运算，减少哈希冲突）。

2. **确定数组索引**：通过`index = (table.length - 1) & hash`计算索引（利用 2 的幂特性，保证索引在数组范围内，等价于取模但效率更高）。

3. 插入元素

   ：

   - 若索引位置无元素（`table[index] == null`）：创建`Node`节点直接插入。
   - 若索引位置有元素（哈希冲突）：
     - 若 key 相同（`key.equals(oldKey)`）：覆盖旧值，返回旧值。
     - 若 key 不同：
       - 若当前是红黑树：按红黑树规则插入节点。
       - 若当前是链表：尾插法添加节点，添加后检查链表长度，满足条件则转为红黑树。

4. **扩容判断**：插入后若`size > threshold`（`threshold = 容量 × 负载因子`），触发扩容。

### 3. 扩容机制核心细节

- 初始容量：默认`16`，可通过构造器`new HashMap(int initialCapacity)`指定（底层会向上调整为最近的 2 的幂）。
- 负载因子：默认`0.75`，平衡 “空间利用率” 和 “哈希冲突概率”：负载因子过大则哈希冲突增多，过小则数组利用率低。
- 扩容触发条件：`size > threshold`（元素个数超过阈值），或链表转红黑树时数组长度不足 64（此时先扩容而非转树）。
- 扩容逻辑：新容量 = 旧容量 × 2（保证 2 的幂），通过`Arrays.copyOf`复制原数组元素到新数组，重新计算每个元素的索引（因容量翻倍，索引仅可能不变或增加旧容量大小）。

## 面试题 2 答案

### 1. 泛型的类型擦除

泛型的类型擦除是指：**泛型信息仅在编译期存在，运行时 JVM 会将泛型类型擦除为原始类型（默认 Object，或指定的上界类型）**。

例如：`List`编译后会被擦除为`List`，所有`String`相关操作会转为`Object`操作，编译器通过自动添加强制类型转换保证类型安全。

### 2. 类型擦除带来的问题

- 无法实例化泛型对象：`new T()`会被擦除为`new Object()`，无法创建具体类型实例（解决方案：传入`Class`通过反射创建）。
- 无法获取泛型类型的 Class 对象：`List.class`编译报错，因擦除后所有泛型 List 的 Class 都是`List.class`。
- 可能破坏多态：需编译器生成 “桥接方法” 修复（如泛型接口`Comparable`的`compareTo(T o)`擦除后为`compareTo(Object o)`，实现类会生成桥接方法调用实际的泛型方法）。

### 3. `List`和`List`的区别及适用场景

| 通配符类型 | 含义（类型范围）         | 核心特性                                 | 适用场景                       |
| ---------- | ------------------------ | ---------------------------------------- | ------------------------------ |
| `List`     | T 及其子类（上界通配符） | 仅支持读取，无法添加非 null 元素         | 读取数据（如统计数值集合总和） |
| `List`     | T 及其父类（下界通配符） | 仅支持添加 T 及其子类元素，读取为 Object | 写入数据（如向集合添加整数）   |

### 4. 为什么不能向`List`添加除`null`外的元素？

- 示例：`List`可接收`List`或`List`。
- 若允许添加`Integer`，当集合实际是`List`时，会导致类型安全问题（`Double`集合中存入`Integer`）。
- 编译器无法确定集合的具体类型，因此禁止添加除`null`外的任何元素（`null`无类型，不会破坏类型安全）。

## 面试题 3 答案

### 1. 底层数据结构与核心方法时间复杂度对比

| 对比维度             | ArrayList                   | LinkedList                     |
| -------------------- | --------------------------- | ------------------------------ |
| 底层数据结构         | 动态数组（`Object[]`）      | 双向链表（`Node`节点）         |
| `get(int index)`     | O (1)（数组索引直接访问）   | O (n)（遍历链表找索引）        |
| `add(E e)`           | O (1)（尾部添加，无扩容时） | O (1)（尾部添加，修改指针）    |
| `add(int idx,E e)`   | O (n)（移动后续元素）       | O (n)（遍历找索引 + 修改指针） |
| `remove(int idx)`    | O (n)（移动后续元素）       | O (n)（遍历找索引 + 修改指针） |
| `contains(Object o)` | O (n)（遍历数组）           | O (n)（遍历链表）              |

### 2. 适用场景

- ArrayList：频繁查询（如商品列表分页、用户信息查询）、批量添加元素场景（扩容次数少）。
- LinkedList：频繁增删（如消息队列、浏览器历史记录）、需实现栈 / 队列数据结构的场景（LinkedList 实现了 Deque 接口）。

### 3. 关键问题解释

#### （1）ArrayList 扩容因子默认是 0.75 的原因

- 平衡 “空间利用率” 和 “哈希冲突概率”：负载因子越大，数组利用率越高，但哈希冲突（元素扎堆）越多；负载因子越小，冲突越少，但数组浪费越严重。
- 0.75 是基于统计的最优值：在该因子下，数组的 “空间浪费” 和 “冲突概率” 达到平衡，避免频繁扩容或冲突过多。

#### （2）LinkedList 迭代器遍历比普通 for 循环高效的原因

- 普通 for 循环遍历 LinkedList：`for (int i=0; i，每次`get(i)`都需从表头 / 表尾重新遍历至索引 i，时间复杂度 O (n²)。
- 迭代器遍历：`Iterator it = list.iterator(); while(it.hasNext()) { it.next(); }`，迭代器持有当前节点引用，`next()`仅需通过`node.next`移动指针，时间复杂度 O (n)，无需重复遍历。

## 面试题 4 答案

### 1. 编译时异常与运行时异常的核心区别

| 对比维度 | 编译时异常（Checked Exception）                  | 运行时异常（Unchecked Exception）              |
| -------- | ------------------------------------------------ | ---------------------------------------------- |
| 继承关系 | 直接 / 间接继承 Exception（非 RuntimeException） | 继承 RuntimeException                          |
| 编译要求 | 必须处理（try-catch 或 throws 声明）             | 无需强制处理，编译通过                         |
| 触发场景 | 外部环境异常（如文件缺失、网络中断）             | 代码逻辑错误（如空指针、数组下标越界）         |
| 示例     | IOException、SQLException                        | NullPointerException、IllegalArgumentException |

### 2. 自定义业务异常推荐继承 RuntimeException 的原因

- 无需强制处理：业务异常（如 “用户不存在”“库存不足”）属于逻辑错误，无需编译器强制捕获，调用者可根据业务场景选择性处理。
- 代码简洁：避免每层方法都声明`throws 自定义异常`，减少冗余代码。
- 分层处理更灵活：Service 层抛出 RuntimeException，Controller 层统一捕获并返回友好提示，无需在 DAO→Service→Controller 的每个方法上传递异常声明。

### 3. 分层架构异常处理方案

#### （1）DAO 层

- 职责：处理技术异常（如 SQLException、RedisConnectionException）。

- 处理逻辑：不捕获异常，直接向上抛出；或封装为数据访问相关的 RuntimeException（如 DataAccessException）。

- 示例：

  java

  ```java
  public User selectById(String id) {
      try (Connection conn = getConnection()) {
          // 数据库查询逻辑
      } catch (SQLException e) {
          // 保留异常链，便于排查
          throw new DataAccessException("查询用户失败，用户ID：" + id, e);
      }
  }
  ```

  

#### （2）Service 层

- 职责：捕获 DAO 层异常，封装为业务异常；或直接抛出业务异常。

- 处理逻辑：业务校验失败时，抛出自定义业务异常（如 UserNotFoundException、StockInsufficientException）。

- 示例：

  java

  ```java
  public User getUserById(String id) {
      User user = userDao.selectById(id);
      if (user == null) {
          throw new UserNotFoundException("用户ID：" + id + " 不存在");
      }
      return user;
  }
  ```

  

#### （3）Controller 层

- 职责：统一捕获 Service 层抛出的业务异常和未处理的 RuntimeException。

- 处理逻辑：通过全局异常处理器（如 Spring 的 @RestControllerAdvice）捕获异常，返回标准化 JSON 响应（包含错误码、错误信息）。

- 示例：

  java

  ```java
  @RestControllerAdvice
  public class GlobalExceptionHandler {
      @ExceptionHandler(UserNotFoundException.class)
      public Result<Void> handleUserNotFound(UserNotFoundException e) {
          return Result.fail(404, e.getMessage());
      }
      
      @ExceptionHandler(RuntimeException.class)
      public Result<Void> handleRuntimeException(RuntimeException e) {
          return Result.fail(500, "系统异常：" + e.getMessage());
      }
  }
  ```

  

## 面试题 5 答案

### 1. 集合线程安全方案分类

Java 中集合线程安全方案主要分为 3 类：同步集合（Synchronized 修饰）、JUC 并发集合、手动加锁（如`Collections.synchronizedList`），核心对比如下：

| 方案类型     | 代表类                       | 实现原理                                             | 性能                               | 适用场景                                   |
| ------------ | ---------------------------- | ---------------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| 同步集合     | Vector、Hashtable            | 所有方法加`synchronized`（锁整个集合）               | 低（高并发下锁竞争严重）           | 低并发、简单场景                           |
| JUC 并发集合 | ConcurrentHashMap            | JDK7：分段锁；JDK8：CAS+`synchronized`（锁哈希桶）   | 高（锁粒度细，支持并发读写）       | 高并发键值对存储                           |
| JUC 并发集合 | CopyOnWriteArrayList         | 写时复制（写操作复制新数组，读无锁）                 | 读极高、写极少场景（写操作 O (n)） | 配置缓存、只读列表                         |
| 手动加锁     | Collections.synchronizedList | 包装原始集合，所有方法加`synchronized`（锁集合对象） | 中（锁粒度与同步集合一致）         | 需使用 ArrayList/LinkedList 的线程安全场景 |

### 2. 核心并发集合实现原理

#### （1）ConcurrentHashMap

- JDK7 实现：采用 “分段锁（Segment）”，将数组分为 16 个 Segment，每个 Segment 是独立的哈希表，锁仅作用于 Segment，支持 16 个线程同时写入（锁粒度粗于 JDK8）。
- JDK8 实现：取消 Segment，采用 “数组 + 链表 + 红黑树” 结构，锁粒度细化到 “哈希桶（Node）”：
  - 读操作无锁（volatile 保证可见性）。
  - 写操作通过`CAS`或` synchronized` 锁定哈希桶节点，仅阻塞同一哈希桶的并发写，不同哈希桶可并发操作，性能大幅提升。

#### （2）CopyOnWriteArrayList

- 核心原理：“写时复制”—— 所有写操作（add/remove/update）都会复制一份新的数组，修改操作在新数组上执行，执行完成后将原数组引用指向新数组；读操作直接访问原数组，无需加锁。
- 优势：读操作无锁、无并发冲突，适合读多写少场景（如配置中心）。
- 劣势：写操作 O (n)（复制数组），占用双倍内存，不保证实时一致性（读操作可能读取到旧数据）。

### 3. 并发集合与同步集合的核心差异

- 锁粒度：同步集合锁整个集合，并发集合锁粒度更细（哈希桶、分段）或无锁（CopyOnWriteArrayList）。
- 读写并发：同步集合读写互斥，并发集合支持并发读写（如 ConcurrentHashMap 读无锁，写锁哈希桶）。
- 迭代器特性：同步集合的迭代器是 “快速失败”（遍历中修改抛 ConcurrentModificationException），JUC 并发集合的迭代器是 “弱一致性”（遍历中修改不抛异常，可能读取到旧数据）。

### 4. 适用场景总结

- 高并发键值对存储：ConcurrentHashMap（JDK8）。
- 读多写少的列表场景：CopyOnWriteArrayList（如系统配置、字典表）。
- 低并发简单场景：Vector/Hashtable（不推荐，优先 JUC 集合）。
- 需使用 LinkedList 的线程安全场景：Collections.synchronizedList (new LinkedList<>())（无 JUC 对应实现）。

