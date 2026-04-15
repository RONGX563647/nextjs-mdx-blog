# 【Java +AI ｜基础加强篇day11 Set+Map+Stream】

## 一、Set 集合 —— 无序、不重复、无索引的核心容器

Set 是 Collection 接口的子接口，核心特性为**无序、不重复、无索引**，仅提供 Collection 接口的通用方法，无额外新增常用功能。其核心价值是 “去重” 和 “快速查找”，根据底层实现不同分为 HashSet、LinkedHashSet、TreeSet 三类。

### 1. Set 集合整体体系与选择策略

#### （1）体系结构

plaintext

```plaintext
Set<E>（接口）
├─ HashSet<E>：无序、不重复、无索引（底层：哈希表）
├─ LinkedHashSet<E>：有序、不重复、无索引（底层：哈希表+双链表）
└─ TreeSet<E>：可排序、不重复、无索引（底层：红黑树）
```

#### （2）快速选择策略

| 业务场景                 | 推荐实现类    | 核心原因                                      |
| ------------------------ | ------------- | --------------------------------------------- |
| 无需有序、需去重、查询快 | HashSet       | 哈希表实现，增删改查性能最优（平均 O (1)）    |
| 需保留添加顺序、需去重   | LinkedHashSet | 哈希表保证性能，双链表记录顺序                |
| 需排序、需去重           | TreeSet       | 红黑树实现，自动排序（自然排序 / 自定义排序） |

### 2. HashSet 深度解析（核心重点）

#### （1）核心特点

- 无序：添加顺序与遍历顺序不一致（由哈希值决定存储位置）。
- 不重复：依赖元素的 `hashCode()` 和 `equals()` 方法。
- 无索引：无法通过索引访问元素，遍历依赖迭代器或增强 for。

#### （2）底层原理：哈希表（JDK8 前后差异）

哈希表是 “数组 + 链表 + 红黑树” 的混合结构，核心是**通过哈希值快速定位存储位置**，平衡增删改查性能。

- JDK8 之前：哈希表 = 数组 + 链表（解决哈希冲突）。
- JDK8 之后：哈希表 = 数组 + 链表 + 红黑树（优化长链表查询性能）。

#### （3）哈希值与对象去重机制

- 哈希值：对象调用

  ```
  Object.hashCode()
  ```

  得到的 int 类型值，是对象的 “逻辑地址”（非物理地址）。

  - 特点：同一对象多次调用 `hashCode()` 结果一致；不同对象哈希值可能相同（哈希碰撞）。

- 去重原理：添加元素时，先通过哈希值定位数组位置，再通过

  ```
  equals()
  ```

  比较元素内容：

  1. 若数组位置为 null：直接存入元素。
  2. 若数组位置非 null：调用 `equals()` 比较，内容相同则去重，不同则存入链表 / 红黑树。

- 关键要求：若希望 Set 认为 “内容相同的对象是重复的”，必须重写对象的 `hashCode()` 和 `equals()` 方法（IDE 可自动生成）。

#### （4）哈希表存储数据的完整流程

1. 初始化哈希表：创建默认长度 16、负载因子 0.75 的数组（`table`）。
2. 计算存储位置：通过 `元素.hashCode() ^ (hash >>> 16)` 优化哈希值，再通过 `(数组长度 - 1) & 哈希值` 得到数组索引（等价于取模，效率更高）。
3. 元素存入判断：
   - 索引位置为 null：直接存入。
   - 索引位置非 null：调用 `equals()` 比较，相同则不存，不同则存入（JDK8 后尾插法挂在链表末尾）。
4. 扩容触发：当元素个数超过 `数组长度 × 负载因子`（16×0.75=12）时，数组扩容为原来的 2 倍（保证 2 的幂，确保哈希均匀分布）。
5. 红黑树转换：当链表长度 > 8 且数组长度 ≥ 64 时，链表转为红黑树（查询时间复杂度从 O (n) 降至 O (log n)）；当红黑树节点数 < 6 时，退化为链表。

#### （5）案例：HashSet 存储学生对象去重

java

```java
// 学生类（必须重写hashCode()和equals()）
class Student {
    private String id;
    private String name;

    // 构造器、getter/setter
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return Objects.equals(id, student.id) && Objects.equals(name, student.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}

// 使用
public class Test {
    public static void main(String[] args) {
        Set<Student> set = new HashSet<>();
        set.add(new Student("1", "张三"));
        set.add(new Student("1", "张三")); // 重复，不存入
        System.out.println(set.size()); // 输出 1
    }
}
```

### 3. LinkedHashSet 深度解析

#### （1）核心特点

- 有序：保留元素添加顺序（遍历顺序与添加顺序一致）。
- 不重复、无索引：继承 HashSet 的去重和无索引特性。

#### （2）底层原理

- 基于哈希表（数组 + 链表 + 红黑树）实现，保证增删改查性能。
- 额外通过**双向链表**记录元素的前后位置，实现有序性（双链表仅维护顺序，不影响哈希表的存储和查询）。

#### （3）适用场景

需要 “去重 + 保留添加顺序” 的场景（如购物车历史记录、最近访问列表）。

### 4. TreeSet 深度解析

#### （1）核心特点

- 可排序：默认升序排序（数值类型按大小，字符串按 Unicode 编码）。
- 不重复、无索引：基于红黑树的排序特性实现去重。

#### （2）底层原理

- 基于红黑树（自平衡二叉查找树）实现，排序的同时保证增删改查性能（O (log n)）。
- 红黑树优势：避免普通二叉查找树的 “斜树” 问题，保证树的高度平衡，查询效率稳定。

#### （3）自定义类型排序的两种方式

TreeSet 存储自定义类型（如 Student）时，必须指定排序规则，否则抛出 `ClassCastException`。

##### 方式一：类实现 Comparable 接口（自然排序）

让自定义类实现 `Comparable` 接口，重写 `compareTo()` 方法定义排序规则：

java

```java
class Student implements Comparable<Student> {
    private String id;
    private int age;

    @Override
    public int compareTo(Student o) {
        // 按年龄升序排序，年龄相同按ID升序
        if (this.age != o.age) {
            return this.age - o.age; // 正整数：当前对象大；负整数：当前对象小；0：相等（去重）
        }
        return this.id.compareTo(o.id);
    }
}
```

##### 方式二：创建 TreeSet 时指定 Comparator 比较器（定制排序）

通过 TreeSet 有参构造器传入 `Comparator` 对象，灵活指定排序规则（优先级高于自然排序）：

java

```java
Set<Student> set = new TreeSet<>((s1, s2) -> {
    // 按年龄降序排序
    return s2.age - s1.age;
});
```

#### （4）排序规则核心约定

- 返回正整数：当前元素 > 比较元素，当前元素排在后面。
- 返回负整数：当前元素 < 比较元素，当前元素排在前面。
- 返回 0：当前元素 = 比较元素，TreeSet 认为重复，不存入。

------

## 二、Map 集合 —— 键值对双列容器

Map 集合是 “键值对（key-value）” 容器，核心特点是**键唯一、值可重复、键值一一对应**，适用于存储 “一一对应” 的数据（如商品 ID - 商品信息、用户名 - 密码）。

### 1. Map 集合整体体系与核心特点

#### （1）体系结构

plaintext

```plaintext
Map<K,V>（接口）
├─ HashMap<K,V>：键无序、唯一、无索引（底层：哈希表）
├─ LinkedHashMap<K,V>：键有序、唯一、无索引（底层：哈希表+双链表）
└─ TreeMap<K,V>：键可排序、唯一、无索引（底层：红黑树）
```

- 核心规则：Map 集合的特点由**键（key）** 决定，值（value）仅为附属数据，无特殊限制。

#### （2）核心特点对比

| 实现类        | 键的特点             | 底层原理                       | 适用场景                           |
| ------------- | -------------------- | ------------------------------ | ---------------------------------- |
| HashMap       | 无序、唯一、无索引   | 哈希表（数组 + 链表 + 红黑树） | 无需有序、键值对查询频繁（最常用） |
| LinkedHashMap | 有序、唯一、无索引   | 哈希表 + 双链表                | 需保留键的添加顺序                 |
| TreeMap       | 可排序、唯一、无索引 | 红黑树                         | 需对键排序（如按价格排序商品）     |

### 2. Map 集合核心常用方法

Map 是双列集合的顶层接口，提供所有实现类的通用方法：

| 方法名                            | 功能描述                                              |
| --------------------------------- | ----------------------------------------------------- |
| `V put(K key, V value)`           | 添加键值对（键存在则覆盖值，返回旧值）                |
| `V get(Object key)`               | 根据键获取值（键不存在返回 null）                     |
| `V remove(Object key)`            | 根据键删除键值对，返回被删除的值                      |
| `boolean containsKey(Object key)` | 判断是否包含指定键（依赖键的 `hashCode` 和 `equals`） |
| `boolean containsValue(Object v)` | 判断是否包含指定值（遍历所有值，效率较低）            |
| `int size()`                      | 返回键值对个数                                        |
| `void clear()`                    | 清空所有键值对                                        |
| `Set keySet()`                    | 获取所有键的 Set 集合（用于键找值遍历）               |
| `Collection values()`             | 获取所有值的 Collection 集合                          |
| `Set> entrySet()`                 | 获取所有键值对的 Set 集合（用于键值对遍历）           |

### 3. Map 集合的三种遍历方式

#### （1）方式一：键找值（最基础，适用于仅需遍历值场景）

1. 通过 `keySet()` 获取所有键的 Set 集合。
2. 遍历键集合，通过 `get(key)` 获取对应值。

java

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 10);
map.put("B", 20);

// 键找值遍历
Set<String> keys = map.keySet();
for (String key : keys) {
    Integer value = map.get(key);
    System.out.println(key + "=" + value);
}
```

#### （2）方式二：键值对遍历（推荐，效率高）

1. 通过 `entrySet()` 获取所有键值对（`Map.Entry`）的 Set 集合。
2. 遍历键值对集合，通过 `getKey()` 和 `getValue()` 获取键和值。

java

```java
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();
    Integer value = entry.getValue();
    System.out.println(key + "=" + value);
}
```

#### （3）方式三：Lambda 表达式遍历（JDK8+，最简洁）

通过 `forEach(BiConsumer action)` 方法，结合 Lambda 表达式简化遍历：

java

```java
map.forEach((key, value) -> {
    System.out.println(key + "=" + value);
});
```

### 4. 核心实现类底层原理

#### （1）HashMap 底层原理

- 与 HashSet 底层完全一致：基于哈希表（数组 + 链表 + 红黑树）实现。

- 本质：HashSet 是 HashMap 的 “简化版”，仅存储键（value 固定为一个空对象

   

  ```
  PRESENT
  ```

  ）。

  java

  ```java
  public HashSet() {
      map = new HashMap<>(); // HashSet 底层直接依赖 HashMap
  }
  ```

  

- 键的去重机制：与 HashSet 一致，依赖键对象的 `hashCode()` 和 `equals()` 方法。

#### （2）LinkedHashMap 底层原理

- 基于哈希表（数组 + 链表 + 红黑树）保证性能，额外通过**双向链表**记录键的添加顺序，实现有序性。
- 与 LinkedHashSet 原理相通：LinkedHashSet 底层依赖 LinkedHashMap。

#### （3）TreeMap 底层原理

- 与 TreeSet 底层一致：基于红黑树实现，键的排序规则（自然排序 / 定制排序）与 TreeSet 完全相同。
- 键的去重：通过排序规则判断（`compareTo()` 或 `compare()` 返回 0 则认为键重复，覆盖值）。

### 5. 综合案例：统计投票信息

#### 需求

80 名学生投票选择 A、B、C、D 四个景点，统计每个景点的投票数，找出最受欢迎的景点。

#### 实现代码

java

```java
import java.util.*;

public class Vote统计 {
    public static void main(String[] args) {
        // 1. 模拟 80 名学生的投票数据（A、B、C、D 随机生成）
        String[] spots = {"A", "B", "C", "D"};
        List<String> votes = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < 80; i++) {
            votes.add(spots[random.nextInt(4)]);
        }

        // 2. 用 Map 统计投票数（key：景点，value：投票数）
        Map<String, Integer> countMap = new HashMap<>();
        for (String spot : votes) {
            if (countMap.containsKey(spot)) {
                // 景点已存在，投票数+1
                countMap.put(spot, countMap.get(spot) + 1);
            } else {
                // 景点不存在，初始投票数=1
                countMap.put(spot, 1);
            }
        }

        // 3. 遍历 Map 输出统计结果
        System.out.println("投票统计结果：");
        countMap.forEach((spot, count) -> {
            System.out.println(spot + "：" + count + "票");
        });

        // 4. 找出票数最多的景点
        String maxSpot = null;
        int maxCount = 0;
        for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                maxSpot = entry.getKey();
            }
        }
        System.out.println("最受欢迎的景点：" + maxSpot + "（" + maxCount + "票）");
    }
}
```

#### 技术点总结

- Map 集合的核心应用：存储 “分类统计” 数据（键为分类项，值为统计数）。
- 键的去重特性：保证每个景点仅统计一次。
- 遍历效率：HashMap 的 `forEach` 遍历效率高于传统循环，适合大数据量统计。

------

## 三、核心对比与面试高频点

### 1. Set 与 Map 核心关联

- Set 集合的底层均依赖 Map 实现：HashSet → HashMap，LinkedHashSet → LinkedHashMap，TreeSet → TreeMap。
- 本质：Set 是 “仅存键、不存值” 的 Map，值固定为一个空对象（`new Object()`）。

### 2. 哈希表核心参数解析

- 初始容量：默认 16（2 的幂），保证哈希值均匀分布，避免哈希冲突。
- 负载因子：默认 0.75，平衡 “空间利用率” 和 “哈希冲突概率”：
  - 负载因子过大：数组利用率高，但链表变长，查询效率下降。
  - 负载因子过小：哈希冲突少，但数组浪费严重，扩容频繁。

### 3. 红黑树的核心优势

- 自平衡：通过变色、旋转机制保证树的高度平衡，避免 “斜树” 问题。
- 性能稳定：查询、插入、删除的时间复杂度均为 O (log n)，优于长链表（O (n)）。

### 4. 集合选择总原则

| 业务需求                   | 推荐集合                        |
| -------------------------- | ------------------------------- |
| 单列、去重、无序、查询快   | HashSet                         |
| 单列、去重、有序           | LinkedHashSet                   |
| 单列、去重、排序           | TreeSet                         |
| 双列、键值对、无序、查询快 | HashMap                         |
| 双列、键值对、有序         | LinkedHashMap                   |
| 双列、键值对、排序         | TreeMap                         |
| 双列、统计分类数据         | HashMap（键为分类，值为统计数） |

------

## 四、Stream 流（基础入门）

Stream 流是 JDK8+ 新增的高效数据处理工具，可对集合（Collection/Map）进行 “过滤、映射、排序、聚合” 等操作，核心优势是**代码简洁、并行处理高效**。

### 1. Stream 流的核心特点

- 惰性求值：中间操作（如 filter）仅记录操作，不执行；终端操作（如 forEach）触发执行。
- 一次性使用：流使用一次后关闭，不可重复使用。
- 并行处理：支持并行流（`parallelStream()`），利用多线程提升大数据量处理效率。

### 2. Stream 流的基础操作示例

以 List 集合为例，演示 Stream 流的常用操作：

java

```java
List<Student> students = Arrays.asList(
    new Student("1", "张三", 18),
    new Student("2", "李四", 20),
    new Student("3", "王五", 18)
);

// 1. 过滤：筛选年龄为 18 的学生
students.stream()
        .filter(s -> s.getAge() == 18) // 中间操作：过滤
        .forEach(s -> System.out.println(s.getName())); // 终端操作：遍历输出（张三、王五）

// 2. 映射：提取学生姓名组成新集合
List<String> names = students.stream()
        .map(Student::getName) // 中间操作：映射为姓名
        .collect(Collectors.toList()); // 终端操作：收集为 List

// 3. 排序：按年龄升序，姓名降序
students.stream()
        .sorted((s1, s2) -> {
            if (s1.getAge() != s2.getAge()) {
                return s1.getAge() - s2.getAge();
            }
            return s2.getName().compareTo(s1.getName());
        })
        .forEach(System.out::println);
```

### 3. 适用场景

- 集合数据批量处理（过滤、排序、统计）。
- 替代传统 for 循环，简化代码（如筛选符合条件的元素、提取字段）。
- 大数据量并行处理（并行流比串行循环效率高）。



# 5 道 Java 集合框架（Set+Map+Stream 流）中大厂面试题

## 面试题 1

请详细说明 HashSet 实现 “元素去重” 的底层机制，为什么必须同时重写元素的`hashCode()`和`equals()`方法？如果只重写其中一个方法，会出现什么问题？请结合自定义对象（如 Student 类）举例说明。

## 面试题 2

JDK8 中 HashMap 的底层数据结构是什么？请完整描述其`put(K key, V value)`方法的执行流程，包括哈希值计算、数组索引确定、哈希冲突处理逻辑，以及红黑树转换的触发条件。同时说明 HashMap 的初始容量、负载因子的作用，以及扩容机制的核心细节。

## 面试题 3

TreeMap 支持哪两种排序方式？请分别说明每种排序方式的实现原理（涉及的接口、方法及返回值规则），并对比两种排序方式的优先级。若自定义对象（如 User 类）作为 TreeMap 的键，未指定任何排序规则，程序会出现什么问题？请举例说明如何解决。

## 面试题 4

Map 集合有哪 3 种常见的遍历方式（键找值、键值对、Lambda）？请从 “执行效率”“代码简洁度”“适用场景” 三个维度对比分析，并解释为什么`entrySet()`遍历比`keySet()`遍历更高效？

## 面试题 5

什么是 Stream 流的 “惰性求值” 特性？请区分 Stream 流的 “中间操作” 和 “终端操作”，并举例说明如何使用 Stream 流对`List`集合完成 “筛选年龄> 18 的学生→提取学生姓名→按姓名首字母升序排序→打印结果” 的完整流程。若集合数据量达 10 万条，如何优化 Stream 流的处理效率？

------

# 面试题答案

## 面试题 1 答案

### 1. HashSet 去重的底层机制

HashSet 基于**哈希表（数组 + 链表 + 红黑树）** 实现去重，核心依赖元素的`hashCode()`和`equals()`方法，完整流程如下：

1. **计算哈希值**：添加元素时，先调用元素的`hashCode()`方法，得到哈希值。

2. **确定数组索引**：通过`(哈希表数组长度 - 1) & 哈希值`计算元素在数组中的存储位置（等价于取模，效率更高）。

3. 判断位置状态

   ：

   - 若索引位置为`null`：直接将元素存入该位置。

   - 若索引位置非

     ```
     null
     ```

     ：调用元素的

     ```
     equals()
     ```

     方法与该位置的所有元素比较：

     - 若`equals()`返回`true`：元素重复，不存入。
     - 若`equals()`返回`false`：发生哈希冲突，将元素存入链表（JDK8 后尾插法）或红黑树（链表长度 > 8 且数组长度≥64 时）。

### 2. 必须同时重写`hashCode()`和`equals()`的原因

根据 “哈希表设计规范”：**若两个对象`equals()`返回`true`，则它们的`hashCode()`必须相等；若两个对象`hashCode()`相等，`equals()`可返回`false`（哈希冲突）**。

若只重写其中一个方法，会破坏该规范，导致 HashSet 无法正确去重。

### 3. 只重写一个方法的问题案例（以 Student 类为例）

假设 Student 类仅重写`equals()`（按`id`判断相等），未重写`hashCode()`：

java

```java
class Student {
    private String id;
    private String name;

    // 仅重写equals()，未重写hashCode()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return Objects.equals(id, student.id);
    }
}

// 使用HashSet
Set<Student> set = new HashSet<>();
set.add(new Student("1", "张三"));
set.add(new Student("1", "张三")); // 两个对象id相同，equals()返回true
System.out.println(set.size()); // 输出2，未去重！
```

**问题原因**：未重写`hashCode()`时，两个`id`相同的 Student 对象会生成不同的哈希值，被分配到数组的不同位置，`equals()`方法从未被调用，导致重复存入。

若 Student 类仅重写`hashCode()`（按`id`计算），未重写`equals()`：

java

```java
class Student {
    private String id;
    private String name;

    // 仅重写hashCode()，未重写equals()
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

// 使用HashSet
Set<Student> set = new HashSet<>();
set.add(new Student("1", "张三"));
set.add(new Student("1", "李四")); // 两个对象id相同，hashCode()相等
System.out.println(set.size()); // 输出2，未去重！
```

**问题原因**：`hashCode()`相等导致两个对象存入同一位置，但未重写`equals()`时，默认调用`Object.equals()`（比较地址），返回`false`，被判定为不同元素，存入链表，导致重复。

## 面试题 2 答案

### 1. JDK8 中 HashMap 的底层数据结构

**数组 + 链表 + 红黑树**：

- 数组（`Node[] table`）：存储哈希桶，每个桶是链表或红黑树的头节点，默认初始容量为 16（2 的幂，保证哈希均匀分布）。
- 链表：解决哈希冲突（不同键哈希值相同），JDK8 后采用尾插法。
- 红黑树：当链表长度 > 8 且数组长度≥64 时，链表转为红黑树（查询时间复杂度从 O (n) 降至 O (log n)）；当红黑树节点数 < 6 时，退化为链表。

### 2. HashMap 的`put()`方法执行流程

1. **参数校验**：若`key`为`null`，直接存入数组索引 0 的位置（HashMap 允许`key`为`null`）。

2. **计算哈希值**：通过`hash = key.hashCode() ^ (hash >>> 16)`优化哈希值 —— 将哈希值的高位（16 位）与低位（16 位）异或，让高位参与索引计算，减少哈希冲突。

3. **确定数组索引**：通过`index = (table.length - 1) & hash`计算索引（利用 2 的幂特性，确保索引在数组范围内，效率高于取模）。

4. 处理索引位置元素

   - 若`table[index] == null`：创建`Node`节点直接存入该位置。

   - 若

     ```
     table[index] != null
     ```

     （哈希冲突）：

     - 若当前节点的`key`与传入`key`相等（`key.equals(oldKey)`）：覆盖旧值，返回旧值。
     - 若当前节点是红黑树节点（`TreeNode`）：按红黑树规则插入节点。
     - 若当前节点是链表节点：遍历链表，若找到`key`相等的节点则覆盖值；未找到则尾插法添加节点，添加后判断链表长度，满足条件则转为红黑树。

5. **扩容判断**：插入后若`size > threshold`（`threshold = 数组容量 × 负载因子`，默认 16×0.75=12），触发扩容。

6. **扩容逻辑**：新容量 = 旧容量 ×2（保证 2 的幂），通过`Arrays.copyOf()`复制原数组元素到新数组，重新计算每个元素的索引（因容量翻倍，索引仅可能不变或增加旧容量大小）。

### 3. 初始容量、负载因子与扩容机制

- 初始容量

  ：默认 16，可通过构造器

  ```
  new HashMap(int initialCapacity)
  ```

  指定（底层会向上调整为最近的 2 的幂，如传入 17 则调整为 32）。

  作用：避免频繁扩容，若已知数据量（如 1000 个键值对），建议指定初始容量（如 1000/0.75≈1334，调整为 2048）。

- 负载因子

  ：默认 0.75，平衡 “空间利用率” 和 “哈希冲突概率”：

  - 负载因子过大：数组利用率高，但链表 / 红黑树变长，查询效率下降。
  - 负载因子过小：哈希冲突少，但数组浪费严重，扩容频繁。

- **扩容机制**：每次扩容为原容量的 2 倍，确保数组长度始终是 2 的幂，保证`(length-1)&hash`计算索引的均匀性。

## 面试题 3 答案

### 1. TreeMap 的两种排序方式

TreeMap 基于**红黑树**实现排序，支持两种排序方式，核心是通过 “比较键的大小” 确定节点在红黑树中的位置，实现 “键不重复、可排序”。

#### 方式一：自然排序（Comparable 接口）

- **实现原理**：让自定义键类（如 User）实现`java.lang.Comparable`接口，重写`compareTo(T o)`方法，定义键的默认排序规则。

- 返回值规则

  ：

  - 返回正整数：当前键 > 比较键，当前键排在红黑树右侧。
  - 返回负整数：当前键 < 比较键，当前键排在红黑树左侧。
  - 返回 0：当前键 = 比较键，TreeMap 认为键重复，覆盖旧值。

- 示例

  ：

  ```java
  class User implements Comparable<User> {
      private String id;
      private int age;
  
      @Override
      public int compareTo(User o) {
          // 按年龄升序排序，年龄相同按id升序
          if (this.age != o.age) {
              return this.age - o.age;
          }
          return this.id.compareTo(o.id);
      }
  }
  
  // 使用TreeMap（自然排序）
  Map<User, String> map = new TreeMap<>();
  map.put(new User("1", 20), "张三");
  map.put(new User("2", 18), "李四");
  // 遍历结果：李四（18）→ 张三（20）（按年龄升序）
  ```

  

#### 方式二：定制排序（Comparator 比较器）

- **实现原理**：创建 TreeMap 时，通过有参构造器`new TreeMap(Comparator comparator)`传入`Comparator`对象，定义定制排序规则（优先级高于自然排序）。

- **返回值规则**：与`compareTo()`一致，通过`compare(K o1, K o2)`方法比较两个键。

- 示例

  ：

  java

  ```java
  // 使用定制排序（按年龄降序）
  Map<User, String> map = new TreeMap<>((u1, u2) -> {
      return u2.age - u1.age; // 降序
  });
  map.put(new User("1", 20), "张三");
  map.put(new User("2", 18), "李四");
  // 遍历结果：张三（20）→ 李四（18）（按年龄降序）
  ```

  

### 2. 排序方式优先级与未指定排序规则的问题

- **优先级**：定制排序（Comparator）> 自然排序（Comparable）—— 若同时指定，TreeMap 优先使用 Comparator 的规则。
- **未指定排序规则的问题**：若自定义键类未实现 Comparable，且创建 TreeMap 时未传入 Comparator，添加元素时会抛出`ClassCastException`（无法将键类转为 Comparable）。
- **解决方式**：二选一即可 ——① 键类实现 Comparable；② TreeMap 传入 Comparator。

## 面试题 4 答案

### 1. Map 集合的 3 种遍历方式及对比

Map 的核心遍历方式包括 “键找值”“键值对”“Lambda 表达式”，具体对比如下：

| 遍历方式      | 核心 API                | 执行效率 | 代码简洁度 | 适用场景                          |
| ------------- | ----------------------- | -------- | ---------- | --------------------------------- |
| 键找值        | `keySet()` + `get(key)` | 低       | 中等       | 仅需遍历值，对效率要求不高        |
| 键值对        | `entrySet()`            | 高       | 中等       | 需同时使用键和值，效率要求高      |
| Lambda 表达式 | `forEach(BiConsumer)`   | 高       | 高         | JDK8+，追求代码简洁，需同时用键值 |

### 2. 各遍历方式代码示例

#### （1）键找值（keySet）

java

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 10);
map.put("B", 20);

Set<String> keys = map.keySet();
for (String key : keys) {
    Integer value = map.get(key);
    System.out.println(key + "=" + value);
}
```

#### （2）键值对（entrySet）

java

```java
Set<Map.Entry<String, Integer>> entries = map.entrySet();
for (Map.Entry<String, Integer> entry : entries) {
    String key = entry.getKey();
    Integer value = entry.getValue();
    System.out.println(key + "=" + value);
}
```

#### （3）Lambda 表达式

java

```java
map.forEach((key, value) -> {
    System.out.println(key + "=" + value);
});
```

### 3. `entrySet()`比`keySet()`高效的原因

- **`keySet()`的性能瓶颈**：遍历键集合后，需调用`map.get(key)`获取值 ——`get(key)`会重新计算键的哈希值和索引，遍历链表 / 红黑树查找值，相当于 “两次遍历”（一次键集合，一次哈希表），时间复杂度 O (n)×O (1)（平均）。
- **`entrySet()`的优势**：`entrySet()`直接返回存储键值对的`Map.Entry`对象集合，`Entry`对象中直接持有键和值的引用，无需调用`get(key)`，仅需 “一次遍历”，时间复杂度 O (n)，效率更高。

## 面试题 5 答案

### 1. Stream 流的 “惰性求值” 特性

Stream 流的 “惰性求值” 是指：**中间操作（如过滤、映射）仅记录操作逻辑，不实际执行；只有当调用终端操作（如遍历、收集）时，才会触发所有中间操作的链式执行**。

核心目的：减少不必要的计算，提升效率（如多个中间操作可合并为一次遍历）。

### 2. 中间操作与终端操作的区分

| 操作类型 | 核心特点                             | 常见 API                                                    |
| -------- | ------------------------------------ | ----------------------------------------------------------- |
| 中间操作 | 惰性求值，返回 Stream 流，可链式调用 | `filter()`（过滤）、`map()`（映射）、`sorted()`（排序）     |
| 终端操作 | 触发执行，返回非 Stream 结果，流关闭 | `forEach()`（遍历）、`collect()`（收集）、`count()`（计数） |

### 3. Stream 流处理`List`的完整示例

假设`Student`类包含`name`（姓名）、`age`（年龄）属性，需求：筛选年龄 > 18 的学生→提取姓名→按姓名首字母升序→打印。

java

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

class Student {
    private String name;
    private int age;

    // 构造器、getter
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}

public class StreamDemo {
    public static void main(String[] args) {
        List<Student> students = Arrays.asList(
            new Student("Zhang San", 20),
            new Student("Li Si", 18),
            new Student("Wang Wu", 22),
            new Student("Zhao Liu", 17)
        );

        // Stream流链式操作
        students.stream()
                .filter(s -> s.getAge() > 18) // 中间操作：筛选年龄>18
                .map(Student::getName) // 中间操作：提取姓名（方法引用）
                .sorted() // 中间操作：按姓名首字母升序（String默认排序）
                .forEach(System.out::println); // 终端操作：打印结果
        // 输出：Li Si（注：实际按拼音首字母排序，此处示例简化为姓名首字母）
        // 正确输出：Wang Wu → Zhang San → Zhao Liu（按拼音首字母W→Z排序）
    }
}
```

### 4. 大数据量（10 万条）的优化方案

使用**并行流（Parallel Stream）**，利用多线程并行处理数据，提升效率：

- **核心 API**：`collection.parallelStream()`（并行流），底层基于 Fork/Join 框架实现任务拆分与合并。

- 优化示例

  ：

  java

  

  ```java
  // 10万条数据并行处理
  List<Student> bigList = new ArrayList<>(); // 假设已填充10万条Student数据
  bigList.parallelStream()
         .filter(s -> s.getAge() > 18)
         .map(Student::getName)
         .sorted()
         .collect(Collectors.toList()) // 终端操作：收集结果
         .forEach(System.out::println);
  ```

  

- 注意事项

  ：

  - 并行流默认使用`ForkJoinPool.commonPool()`，线程数为 CPU 核心数，无需手动创建线程。
  - 若中间操作涉及线程不安全的操作（如修改共享变量），需通过`ThreadLocal`或同步机制保证线程安全。
  - 小数据量不建议使用并行流（线程切换开销可能高于并行收益）。