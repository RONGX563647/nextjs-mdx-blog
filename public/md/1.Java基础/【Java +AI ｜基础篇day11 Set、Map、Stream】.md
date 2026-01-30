# 11🗂️ Java Day11 - Set、Map、Stream

> 💡 **核心提示**：Set 和 Map 是 Java 集合框架的重要组成部分，Stream API 提供了强大的数据处理能力。本文系统讲解 Set、Map 的使用以及 Stream 的高级操作。

---

## 快速回顾

- **Set**：无序、不重复的集合，常用实现 HashSet、LinkedHashSet、TreeSet
- **Map**：键值对集合，键唯一，常用实现 HashMap、LinkedHashMap、TreeMap
- **Stream**：函数式数据流处理，支持过滤、映射、归约、分组等操作
- **Collectors**：Stream 的收集器，提供丰富的终端操作

---

## 目录

- [一、Set 集合](#一set-集合)
  - [1. Set 接口特点](#1-set-接口特点)
  - [2. HashSet](#2-hashset)
  - [3. LinkedHashSet](#3-linkedhashset)
  - [4. TreeSet](#4-treeset)
  - [5. Set 常用方法](#5-set-常用方法)
- [二、Map 集合](#二map-集合)
  - [1. Map 接口特点](#1-map-接口特点)
  - [2. HashMap](#2-hashmap)
  - [3. LinkedHashMap](#3-linkedhashmap)
  - [4. TreeMap](#4-treemap)
  - [5. Map 常用方法](#5-map-常用方法)
  - [6. Map 遍历最佳实践](#6-map-遍历最佳实践)
- [三、Stream API 进阶](#三stream-api-进阶)
  - [1. Stream 创建方式](#1-stream-创建方式)
  - [2. 中间操作](#2-中间操作)
  - [3. 终端操作](#3-终端操作)
  - [4. Collectors 工具类](#4-collectors-工具类)
- [问答](#问答)

---

## 详细内容

### 一、Set 集合

#### 1. Set 接口特点

- **无序**：不保证元素顺序（LinkedHashSet 除外）
- **不重复**：基于 equals() 和 hashCode() 判断重复
- **无索引**：不支持通过索引访问

#### 2. HashSet

```java
// 基于 HashMap 实现，元素无序
Set<String> set = new HashSet<>();
set.add("Apple");
set.add("Banana");
set.add("Apple");  // 重复，不会添加

System.out.println(set);  // [Banana, Apple]（无序）
```

**去重原理**：
1. 计算元素的 hashCode()
2. 如果 hashCode 相同，调用 equals() 比较
3. 如果 equals() 返回 true，认为是重复元素

**HashSet 去重原理图：**

```
┌─────────────────────────────────────────────────────────────┐
│              HashSet 去重原理详解              │
│                                                             │
│   添加元素 "Apple" 到 HashSet                              │
│                                                             │
│   步骤1：计算 hashCode()                                     │
│   ┌─────────────────────────────────────────────┐           │
│   │   "Apple".hashCode() = 123456           │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   步骤2：计算数组索引                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │   index = hashCode % 数组长度            │           │
│   │   index = 123456 % 16 = 8              │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   步骤3：检查位置是否已有元素                                 │
│   ┌─────────────────────────────────────────────┐           │
│   │   数组[8] = null（位置为空）            │           │
│   │   → 直接存储 "Apple"                    │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   再次添加 "Apple"（重复元素）                              │
│                                                             │
│   步骤1：计算 hashCode() = 123456（相同）                     │
│   步骤2：计算索引 index = 8（相同）                          │
│   步骤3：检查数组[8] = "Apple"（已有元素）                    │
│                                                             │
│   步骤4：调用 equals() 比较                                   │
│   ┌─────────────────────────────────────────────┐           │
│   │   "Apple".equals("Apple")                │           │
│   │   返回 true（内容相同）                    │           │
│   │   → 认为重复元素，不添加                  │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   添加 "Banana"（不同元素）                                │
│                                                             │
│   步骤1：计算 hashCode() = 789012（不同）                     │
│   步骤2：计算索引 index = 4（不同）                          │
│   步骤3：检查数组[4] = null（位置为空）                     │
│   ┌─────────────────────────────────────────────┐           │
│   │   → 直接存储 "Banana"                   │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   说明：                                                    │
│   • HashSet 基于 HashMap 实现，值作为 key，PRESENT 作为 value    │
│   • 先通过 hashCode() 快速定位，再用 equals() 精确比较        │
│   • 必须同时重写 hashCode() 和 equals() 才能正确去重        │
│   • 两个对象 hashCode 相同，equals() 不一定相同（哈希冲突）     │
│   • 两个对象 equals() 相同，hashCode() 必须相同            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**自定义对象去重**：
```java
public class Person {
    private String name;
    private int age;
    
    // 必须重写 equals 和 hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

#### 3. LinkedHashSet

```java
// 基于 LinkedHashMap 实现，保持插入顺序
Set<String> set = new LinkedHashSet<>();
set.add("Apple");
set.add("Banana");
set.add("Cherry");

System.out.println(set);  // [Apple, Banana, Cherry]（有序）
```

#### 4. TreeSet

```java
// 基于红黑树实现，元素有序（自然排序或自定义排序）
Set<Integer> set = new TreeSet<>();
set.add(3);
set.add(1);
set.add(2);

System.out.println(set);  // [1, 2, 3]（升序）

// 自定义排序
Set<String> descSet = new TreeSet<>((a, b) -> b.compareTo(a));
descSet.add("Apple");
descSet.add("Banana");
System.out.println(descSet);  // [Banana, Apple]（降序）
```

#### 5. Set 常用方法

```java
Set<String> set = new HashSet<>();

// 添加
set.add("A");
set.addAll(Arrays.asList("B", "C"));

// 删除
set.remove("A");
set.removeIf(s -> s.length() > 2);

// 查询
boolean contains = set.contains("A");
int size = set.size();
boolean isEmpty = set.isEmpty();

// 集合运算
Set<String> set1 = new HashSet<>(Arrays.asList("A", "B", "C"));
Set<String> set2 = new HashSet<>(Arrays.asList("B", "C", "D"));

set1.retainAll(set2);  // 交集：[B, C]
set1.addAll(set2);     // 并集
set1.removeAll(set2);  // 差集
```

---

### 二、Map 集合

#### 1. Map 接口特点

- **键值对存储**：每个元素包含键（key）和值（value）
- **键唯一**：不允许重复的键，重复的键会覆盖旧值
- **值可重复**：不同键可以对应相同的值

#### 2. HashMap

```java
// 基于哈希表实现，键无序
Map<String, Integer> map = new HashMap<>();
map.put("Alice", 25);
map.put("Bob", 30);
map.put("Alice", 26);  // 覆盖原值

System.out.println(map);  // {Bob=30, Alice=26}
```

**HashMap 原理**：
- JDK7：数组 + 链表
- JDK8：数组 + 链表 + 红黑树（链表长度 > 8 时转换）

#### 3. LinkedHashMap

```java
// 保持插入顺序
Map<String, Integer> map = new LinkedHashMap<>();
map.put("A", 1);
map.put("B", 2);
map.put("C", 3);

System.out.println(map);  // {A=1, B=2, C=3}
```

#### 4. TreeMap

```java
// 按键排序
Map<String, Integer> map = new TreeMap<>();
map.put("Charlie", 3);
map.put("Alice", 1);
map.put("Bob", 2);

System.out.println(map);  // {Alice=1, Bob=2, Charlie=3}
```

#### 5. Map 常用方法

```java
Map<String, Integer> map = new HashMap<>();

// 添加/修改
map.put("A", 1);
map.putIfAbsent("A", 2);  // 如果key不存在才添加
map.putAll(anotherMap);

// 获取
Integer value = map.get("A");
Integer valueOrDefault = map.getOrDefault("B", 0);

// 删除
map.remove("A");
map.remove("A", 1);  // key和value都匹配才删除

// 查询
boolean containsKey = map.containsKey("A");
boolean containsValue = map.containsValue(1);
int size = map.size();
boolean isEmpty = map.isEmpty();

// 遍历
// 方式1：entrySet
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}

// 方式2：keySet
for (String key : map.keySet()) {
    System.out.println(key + " = " + map.get(key));
}

// 方式3：forEach + Lambda
map.forEach((k, v) -> System.out.println(k + " = " + v));
```

#### 6. Map 遍历最佳实践

```java
// JDK8+ 推荐方式
map.forEach((key, value) -> {
    System.out.println(key + " = " + value);
});

// 遍历并修改（ConcurrentHashMap 或迭代器）
Iterator<Map.Entry<String, Integer>> it = map.entrySet().iterator();
while (it.hasNext()) {
    Map.Entry<String, Integer> entry = it.next();
    if (entry.getValue() < 0) {
        it.remove();
    }
}
```

---

### 三、Stream API 进阶

#### 1. Stream 创建方式

```java
// 从集合创建
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
Stream<Integer> stream1 = list.stream();
Stream<Integer> parallelStream = list.parallelStream();

// 从数组创建
Stream<String> stream2 = Arrays.stream(new String[]{"A", "B", "C"});

// 直接创建
Stream<Integer> stream3 = Stream.of(1, 2, 3);
Stream<Integer> stream4 = Stream.iterate(0, n -> n + 2).limit(10);  // 0, 2, 4, ...
Stream<Integer> stream5 = Stream.generate(() -> (int)(Math.random() * 100)).limit(10);
```

#### 2. 中间操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 过滤
numbers.stream()
    .filter(n -> n % 2 == 0)      // 偶数
    .filter(n -> n > 5);          // 大于5

// 映射
numbers.stream()
    .map(n -> n * n)               // 平方
    .map(String::valueOf);         // 转字符串

// 扁平化
List<List<Integer>> nested = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3, 4)
);
nested.stream()
    .flatMap(List::stream)         // [1, 2, 3, 4]
    .forEach(System.out::println);

// 去重、排序、截断
numbers.stream()
    .distinct()                    // 去重
    .sorted()                      // 自然排序
    .sorted(Comparator.reverseOrder())  // 降序
    .limit(5)                      // 前5个
    .skip(2);                      // 跳过前2个

//  peek（调试）
numbers.stream()
    .peek(n -> System.out.println("处理：" + n))
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

#### 3. 终端操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 遍历
numbers.stream().forEach(System.out::println);

// 收集
List<Integer> list = numbers.stream().collect(Collectors.toList());
Set<Integer> set = numbers.stream().collect(Collectors.toSet());
Map<String, Integer> map = numbers.stream()
    .collect(Collectors.toMap(n -> "key" + n, n -> n));

// 聚合
long count = numbers.stream().count();
int sum = numbers.stream().mapToInt(Integer::intValue).sum();
double avg = numbers.stream().mapToInt(Integer::intValue).average().orElse(0);
int max = numbers.stream().mapToInt(Integer::intValue).max().orElse(0);

// 匹配
boolean anyMatch = numbers.stream().anyMatch(n -> n > 3);
boolean allMatch = numbers.stream().allMatch(n -> n > 0);
boolean noneMatch = numbers.stream().noneMatch(n -> n < 0);

// 查找
Optional<Integer> first = numbers.stream().findFirst();
Optional<Integer> any = numbers.stream().findAny();

// 归约
int sum = numbers.stream().reduce(0, (a, b) -> a + b);
int product = numbers.stream().reduce(1, (a, b) -> a * b);
Optional<Integer> max = numbers.stream().reduce(Integer::max);
```

#### 4. Collectors 工具类

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Alice");

//  joining
String joined = names.stream()
    .collect(Collectors.joining(", "));           // "Alice, Bob, Charlie, David, Alice"
String joinedWithPrefix = names.stream()
    .collect(Collectors.joining(", ", "[", "]")); // "[Alice, Bob, Charlie, David, Alice]"

// groupingBy
Map<Integer, List<String>> groupByLength = names.stream()
    .collect(Collectors.groupingBy(String::length));

// partitioningBy
Map<Boolean, List<String>> partition = names.stream()
    .collect(Collectors.partitioningBy(s -> s.length() > 3));

// counting
Map<String, Long> countMap = names.stream()
    .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

// averagingInt
Double averageLength = names.stream()
    .collect(Collectors.averagingInt(String::length));

// summingInt
Integer totalLength = names.stream()
    .collect(Collectors.summingInt(String::length));

// maxBy/minBy
Optional<String> longest = names.stream()
    .collect(Collectors.maxBy(Comparator.comparingInt(String::length)));

// mapping
Map<Integer, List<Character>> firstCharsByLength = names.stream()
    .collect(Collectors.groupingBy(
        String::length,
        Collectors.mapping(s -> s.charAt(0), Collectors.toList())
    ));
```

---

## 问答

### Q1：HashSet 如何判断元素重复？

**答**：
1. 调用元素的 `hashCode()` 方法计算哈希值
2. 如果哈希值相同，调用 `equals()` 方法比较
3. 如果 `equals()` 返回 true，认为是重复元素，不添加
4. **必须同时重写 `equals()` 和 `hashCode()`**

### Q2：HashMap 的 put 方法执行流程？

**答**：
1. 计算 key 的 hashCode，再计算数组索引
2. 如果该位置为空，直接插入
3. 如果该位置有元素，比较 key 的 hashCode 和 equals
4. 如果 key 相同，覆盖旧值
5. 如果 key 不同，添加到链表/红黑树
6. 检查是否需要扩容（元素数 > 容量 × 负载因子）

### Q3：Stream 的惰性求值是什么？

**答**：
- **中间操作**（filter、map 等）是惰性的，不会立即执行
- **终端操作**（collect、forEach 等）触发实际计算
- 优势：可以优化操作顺序，避免不必要的计算

```java
list.stream()
    .filter(n -> n > 100)  // 可能过滤掉大部分元素
    .map(n -> expensiveOperation(n))  // 只对过滤后的元素执行
    .collect(Collectors.toList());
```

### Q4：HashMap 和 Hashtable 有什么区别？

**答**：
| 特性 | HashMap | Hashtable |
|------|---------|-----------|
| 线程安全 | 不安全 | 安全（synchronized）|
| 性能 | 高 | 低 |
| null 键/值 | 允许 | 不允许 |
| 出现版本 | JDK1.2 | JDK1.0 |
| 推荐使用 | 是 | 否（用 ConcurrentHashMap）|

### Q5：如何选择合适的集合？

**答**：
- **List**：有序、可重复、有索引 → ArrayList（查询多）/ LinkedList（增删多）
- **Set**：无序、不重复 → HashSet（无序）/ LinkedHashSet（有序）/ TreeSet（排序）
- **Map**：键值对 → HashMap（无序）/ LinkedHashMap（有序）/ TreeMap（排序）
- **线程安全**：ConcurrentHashMap、CopyOnWriteArrayList

---

> **学习建议**：Set 和 Map 是日常开发中最常用的集合类型，务必掌握其特性和使用场景。Stream API 可以大幅提升代码的简洁性和可读性，建议多加练习，熟练掌握函数式编程风格。
