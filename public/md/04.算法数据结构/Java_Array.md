# 数组

## 数组类介绍

~~~markdown
Java的内置数组功能主要通过语言本身的核心功能来实现，不需要额外导入包。不过，Java提供了一些工具类来简化数组的操作，这些工具类位于`java.util`包中。以下是一些常用的数组相关工具类：

1. **Arrays类**（`java.util.Arrays`）：提供了大量静态方法用于数组的排序、搜索、比较、填充等操作。
   - 示例：排序、填充、二分查找等。
   ```java
   import java.util.Arrays;

   public class ArrayExample {
       public static void main(String[] args) {
           int[] arr = {3, 1, 4, 1, 5, 9};
           Arrays.sort(arr); // 排序数组
           System.out.println(Arrays.toString(arr)); // 输出数组内容
           int index = Arrays.binarySearch(arr, 5); // 二分查找元素
           Arrays.fill(arr, 0); // 填充数组
       }
   }
   ```

2. **Arrays.asList()**：将数组转换为List集合。
   ```java
   List<String> list = Arrays.asList("apple", "banana", "cherry");
   ```

3. **数组的基本语法**：
   ```java
   int[] numbers = new int[5]; // 声明并初始化数组
   String[] names = {"Alice", "Bob", "Charlie"}; // 直接初始化数组
   ```

4. **多维数组**：
   ```java
   int[][] matrix = new int[3][3]; // 二维数组
   ```

如果需要更高级的数组操作（如动态数组、集合框架），可以使用`java.util.ArrayList`、`java.util.LinkedList`等类，但这些属于集合框架，而非原生数组。
~~~

## Arrays

### Arrays类介绍

~~~markdown
Java中的`Arrays`类（位于`java.util`包）是一个强大的工具类，提供了一系列静态方法来操作数组（如排序、搜索、比较、填充等）。以下是对`Arrays`类的深入讲解：


### **1. 数组排序**
`Arrays.sort()`方法可对数组进行排序：
- **基本类型数组**：使用双轴快速排序（Dual-Pivot Quick Sort），时间复杂度为 **O(n log n)**。
- **对象数组**：使用TimSort（归并排序与插入排序的混合），要求元素实现`Comparable`接口。
- **并行排序**：`Arrays.parallelSort()`适用于大数据量，利用多线程加速排序。

```java
import java.util.Arrays;

public class SortExample {
    public static void main(String[] args) {
        int[] nums = {5, 3, 8, 1};
        Arrays.sort(nums); // 升序排序：[1, 3, 5, 8]
        
        String[] words = {"banana", "apple", "cherry"};
        Arrays.sort(words); // 按字典序排序：[apple, banana, cherry]
        
        // 自定义排序（降序）
        Integer[] numsObj = {5, 3, 8, 1};
        Arrays.sort(numsObj, (a, b) -> b - a); // [8, 5, 3, 1]
    }
}
```


### **2. 数组搜索**
`Arrays.binarySearch()`用于在**已排序的数组**中查找元素：
- 返回元素的索引，若不存在则返回`-(插入点) - 1`。
- **注意**：使用前必须先对数组排序，否则结果不确定。

```java
int[] arr = {2, 4, 6, 8, 10};
int index = Arrays.binarySearch(arr, 6); // 返回2
int notFound = Arrays.binarySearch(arr, 5); // 返回-3（插入点为2，取反加1）
```


### **3. 数组比较**
`Arrays.equals()`和`Arrays.deepEquals()`用于比较数组：
- `equals()`：比较一维数组的元素是否相等。
- `deepEquals()`：递归比较多维数组的元素（适用于嵌套数组）。

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};
System.out.println(Arrays.equals(a, b)); // true

int[][] multiA = {{1, 2}, {3, 4}};
int[][] multiB = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepEquals(multiA, multiB)); // true
```


### **4. 数组填充**
`Arrays.fill()`用于将指定值填充到数组的每个元素：
```java
int[] arr = new int[5];
Arrays.fill(arr, 10); // [10, 10, 10, 10, 10]

// 填充部分范围
Arrays.fill(arr, 1, 3, 20); // [10, 20, 20, 10, 10]
```


### **5. 数组复制**
`Arrays.copyOf()`和`Arrays.copyOfRange()`用于复制数组：
```java
int[] original = {1, 2, 3, 4, 5};
int[] copy = Arrays.copyOf(original, 3); // [1, 2, 3]（截取前3个元素）
int[] range = Arrays.copyOfRange(original, 1, 4); // [2, 3, 4]（索引1到3）
```


### **6. 数组转字符串**
`Arrays.toString()`和`Arrays.deepToString()`用于打印数组：
- `toString()`：一维数组的字符串表示。
- `deepToString()`：多维数组的递归字符串表示。

```java
int[] arr = {1, 2, 3};
System.out.println(Arrays.toString(arr)); // [1, 2, 3]

int[][] multi = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepToString(multi)); // [[1, 2], [3, 4]]
```


### **7. 数组转集合**
`Arrays.asList()`将数组转换为固定大小的`List`：
```java
String[] array = {"a", "b", "c"};
List<String> list = Arrays.asList(array); // [a, b, c]

// 注意：不能添加/删除元素（固定大小）
// list.add("d"); // 会抛出UnsupportedOperationException
```


### **8. 并行操作（Java 8+）**
`Arrays.parallelPrefix()`和`Arrays.parallelSetAll()`支持并行处理：
- `parallelPrefix()`：对数组元素进行累积计算（如累加）。
- `parallelSetAll()`：使用Lambda表达式并行设置数组元素。

```java
int[] arr = {1, 2, 3, 4};
Arrays.parallelPrefix(arr, (a, b) -> a + b); // [1, 3, 6, 10]（累加）

Arrays.parallelSetAll(arr, i -> i * 2); // [0, 2, 4, 6]（索引*2）
```


### **9. 性能注意事项**
- **排序性能**：对于大数据集，`parallelSort()`通常比`sort()`更快（需多核CPU）。
- **内存开销**：复制数组时需注意内存使用，避免不必要的大数组复制。


### **总结**
`Arrays`类是Java处理数组的核心工具，提供了丰富的方法来简化数组操作。掌握这些方法可以提高代码效率和可读性。建议结合Java文档进一步探索其完整功能：  
👉 [Java Arrays类官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html)
~~~

### 官方文档总结

```markdown
该网页是关于Java平台标准版8中`java.util.Arrays`类的官方文档，主要介绍了`Arrays`类的功能、方法及其使用，为Java开发者提供了全面的参考。
1. **类概述**：`Arrays`类是`java.util`包的一部分，属于Java集合框架。它包含了多种用于数组操作的方法，如排序、搜索、复制、填充等，还提供了将数组视为列表的静态工厂方法。若指定数组引用为`null` ，除特定说明外，类中的方法都会抛出`NullPointerException`。
2. **方法摘要**
    - **排序方法**：包括`sort`和`parallelSort`系列方法，可对不同类型数组（如`byte`、`int`、`long`等）进行排序。`sort`方法使用双轴快速排序算法，性能优于传统单轴快速排序；`parallelSort`方法基于并行排序 - 合并算法，适用于多核心处理器，能提高大规模数组的排序效率。
    - **搜索方法**：`binarySearch`系列方法用于在已排序数组中查找指定元素，返回元素索引或插入点。根据数组类型和是否指定比较器，有多种重载形式。
    - **复制方法**：`copyOf`和`copyOfRange`系列方法用于复制数组，可指定新数组长度或复制特定范围，支持多种数据类型。
    - **比较方法**：`equals`系列方法用于判断两个数组是否相等，`deepEquals`用于深度比较嵌套数组；`hashCode`和`deepHashCode`方法分别用于计算基于数组内容和深度内容的哈希码。
    - **填充方法**：`fill`系列方法用于将指定值填充到数组或数组的特定范围，支持各种基本数据类型和对象类型。
    - **其他方法**：`asList`方法将数组转换为固定大小的列表；`parallelPrefix`用于并行累积数组元素；`setAll`和`parallelSetAll`用于设置数组元素；`spliterator`和`stream`方法分别用于创建数组的迭代器和流。
3. **方法详细说明**：对每个方法的功能、参数、返回值、实现细节、异常情况等进行了详细介绍。如`sort(int[] a)`方法，用于将`int`类型数组按升序排序，采用双轴快速排序算法，若数组为`null`会抛出异常。
4. **继承关系**：`Arrays`类继承自`java.lang.Object`类，继承了其部分方法，如`clone`、`equals`等 ，并在此基础上扩展了丰富的数组操作功能。 
```

## ArrayList

### ArrayList类介绍

~~~markdown

`ArrayList`是Java集合框架中最常用的动态数组实现（`java.util.ArrayList`），它基于数组但支持自动扩容，完美解决了原生数组长度固定的痛点。以下从**底层结构、核心机制、源码分析、性能特点、使用场景**等维度深入讲解：


### **一、底层结构：动态数组**
`ArrayList`的核心是一个**可变长的对象数组**（`transient Object[] elementData`），通过`size`字段记录实际存储的元素数量。与原生数组的区别在于：  
- 原生数组长度固定，`ArrayList`可自动扩容。  
- 支持泛型（如`ArrayList<String>`），编译期类型检查。  


### **二、初始化与扩容机制**
#### **1. 初始化方式**
- **无参构造**（最常用）：初始`elementData`是一个**空数组**（`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`），**首次添加元素时**才分配默认容量（`DEFAULT_CAPACITY = 10`）。  
- **指定初始容量**：`new ArrayList<>(int initialCapacity)`，直接创建长度为`initialCapacity`的数组（避免后续频繁扩容）。  
- **通过集合初始化**：`new ArrayList<>(Collection<? extends E> c)`，将集合元素复制到新数组。  


#### **2. 扩容逻辑（核心源码）**
当添加元素时，若当前数组已满（`size == elementData.length`），触发扩容。扩容步骤如下：  

```java
// 源码：add(E e) 方法简化逻辑
public boolean add(E e) {
    modCount++;  // 记录结构修改次数（用于快速失败）
    int oldSize = size;
    if (oldSize == elementData.length) {
        // 计算新容量（核心扩容逻辑）
        int newCapacity = calculateNewCapacity(oldSize);
        // 复制数组到新容量
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
    elementData[oldSize] = e;  // 添加元素
    size = oldSize + 1;
    return true;
}

// 计算新容量的逻辑（Java 8+）
private int calculateNewCapacity(int oldCapacity) {
    // 初始无参构造时，首次扩容为 DEFAULT_CAPACITY（10）
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, oldCapacity + 1);
    }
    // 正常扩容：原容量的 1.5 倍（位运算优化）
    int newCapacity = oldCapacity + (oldCapacity >> 1);  // oldCapacity * 1.5
    if (newCapacity - MAX_ARRAY_SIZE <= 0) {  // MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8（防止内存溢出）
        return newCapacity;
    }
    // 极端情况：容量超过 MAX_ARRAY_SIZE 时，返回 Integer.MAX_VALUE
    return hugeCapacity(oldCapacity + 1);
}
```

**关键点**：  
- **扩容倍数**：默认扩容为原容量的**1.5倍**（`oldCapacity + (oldCapacity >> 1)`），兼顾空间和时间效率（比Vector的2倍扩容更节省内存）。  
- **延迟初始化**：无参构造的`ArrayList`不会立即分配数组，直到首次调用`add()`时才创建长度为10的数组（减少内存浪费）。  
- **扩容代价**：`Arrays.copyOf()`会通过`System.arraycopy()`复制原数组到新数组，时间复杂度为`O(n)`，频繁扩容会影响性能（建议根据数据量预设初始容量）。  


### **三、核心方法源码解析**
#### **1. 随机访问：get(int index)**  
通过索引直接访问数组元素，时间复杂度`O(1)`：  
```java
public E get(int index) {
    if (index >= size) {  // 越界检查（抛出 IndexOutOfBoundsException）
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
    return (E) elementData[index];  // 数组的随机访问特性
}
```


#### **2. 插入元素：add(int index, E element)**  
在指定位置插入元素，需**移动后续元素**（时间复杂度`O(n)`）：  
```java
public void add(int index, E element) {
    if (index > size || index < 0) {  // 越界检查
        throw new IndexOutOfBoundsException(...);
    }
    modCount++;
    int numMoved = size - index;
    if (numMoved > 0) {
        // 从 index 开始，将后续元素后移一位（System.arraycopy 是 native 方法，效率很高）
        System.arraycopy(elementData, index, elementData, index + 1, numMoved);
    }
    elementData[index] = element;  // 插入新元素
    size++;
}
```


#### **3. 删除元素：remove(int index)**  
删除指定位置的元素，需**移动后续元素**（时间复杂度`O(n)`）：  
```java
public E remove(int index) {
    if (index >= size) {  // 越界检查
        throw new IndexOutOfBoundsException(...);
    }
    modCount++;
    E oldValue = (E) elementData[index];
    int numMoved = size - index - 1;
    if (numMoved > 0) {
        // 将后续元素前移一位（覆盖被删除的元素）
        System.arraycopy(elementData, index + 1, elementData, index, numMoved);
    }
    elementData[--size] = null;  // 清除末位引用（帮助GC）
    return oldValue;
}
```


#### **4. 缩容：trimToSize()**  
当数组实际元素远小于容量时，可调用`trimToSize()`释放空闲空间（将`elementData`长度调整为`size`）：  
```java
public void trimToSize() {
    modCount++;
    if (size < elementData.length) {
        elementData = (size == 0) ? EMPTY_ELEMENTDATA : Arrays.copyOf(elementData, size);
    }
}
```


### **四、关键特性与注意事项**
#### **1. 线程不安全**  
`ArrayList`**非线程安全**（多线程并发修改会导致数据不一致或`ConcurrentModificationException`）。  
**解决方案**：  
- 使用`Collections.synchronizedList(new ArrayList<>())`包装为线程安全列表（外部加锁）。  
- 使用`CopyOnWriteArrayList`（写时复制，适合读多写少场景）。  


#### **2. 快速失败（Fail-Fast）机制**  
`ArrayList`的迭代器（`Iterator`）通过`modCount`字段检测结构修改（如添加/删除元素）。若迭代过程中`modCount`变化，抛出`ConcurrentModificationException`。  

**正确迭代删除方式**：  
```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (条件) {
        it.remove();  // 调用迭代器的remove()，会同步更新modCount
    }
}
```


#### **3. 序列化优化**  
`elementData`被`transient`修饰（不自动序列化），但`ArrayList`自定义了`writeObject()`和`readObject()`方法：  
- 序列化时仅保存实际存储的元素（`size`个），避免空闲空间的冗余。  
- 反序列化时根据`size`重建数组，节省传输和存储开销。  


#### **4. subList() 的视图特性**  
`subList(int fromIndex, int toIndex)`返回的是原列表的**视图**（而非独立列表），对`subList`的修改会直接影响原列表：  
```java
ArrayList<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4));
List<Integer> sub = list.subList(0, 2);  // 视图：[1, 2]
sub.set(0, 100);  // 原列表变为 [100, 2, 3, 4]
```


### **五、性能总结**
| 操作                | 时间复杂度 | 说明                          |
|---------------------|------------|-------------------------------|
| 随机访问（`get`）    | O(1)       | 数组的随机访问特性，极快。    |
| 尾部插入（`add`）    | O(1)       | 无扩容时；扩容时O(n)（偶发）。|
| 中间/头部插入（`add`）| O(n)      | 需移动后续元素，效率低。      |
| 中间/头部删除（`remove`）| O(n)    | 需移动后续元素，效率低。      |
| 遍历（`for`循环）    | O(n)       | 数组的连续内存特性，缓存友好。|


### **六、适用场景**
- **高频随机访问**（如按索引查询、遍历）：数组的连续内存布局对CPU缓存友好，速度远超链表。  
- **尾部高频增删**：尾部操作无需移动元素，性能接近`O(1)`（仅需处理扩容）。  
- **数据量可预估**：通过`new ArrayList<>(initialCapacity)`预设容量，避免频繁扩容。  


### **总结**
`ArrayList`是Java中**最常用的列表实现**，核心优势在于随机访问的高效性。理解其底层数组结构、扩容机制和方法源码，能帮助我们在实际开发中：  
- 合理设置初始容量（如已知数据量为1000，`new ArrayList<>(1000)`）。  
- 避免在中间频繁插入/删除（改用`LinkedList`或`LinkedHashSet`）。  
- 多线程场景选择合适的线程安全方案。  

深入掌握`ArrayList`的细节，是写出高效Java代码的基础。建议结合官方文档进一步探索：  
👉 [ArrayList官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html)
~~~

### 官方文档总结

```markdown
该网页是Java Platform SE 8中`ArrayList`类的官方文档，全面介绍了`ArrayList`类的相关信息，为Java开发者提供了重要的参考。
1. **类定义与继承结构**：`ArrayList<E>` 类是 `List` 接口的可调整大小的数组实现，继承自 `AbstractList<E>`，实现了 `List<E>`、`RandomAccess`、`Cloneable` 和 `Serializable` 接口，有 `AttributeList`、`RoleList`、`RoleUnresolvedList` 等直接已知子类。
2. **特点与性能**：支持所有可选列表操作，允许 `null` 元素。`size`、`isEmpty`、`get`、`set`、`iterator` 和 `listIterator` 操作时间复杂度为常数级；`add` 操作摊销常数时间，添加 `n` 个元素时间复杂度为 `O(n)`；其他操作大致为线性时间，常数因子低于 `LinkedList`。每个实例都有容量，添加元素时容量自动增长，可使用 `ensureCapacity` 方法提前增加容量以减少增量重新分配。
3. **线程安全性**：该实现不同步，多线程并发访问且有线程进行结构修改时，必须外部同步。可通过同步封装列表的对象或使用 `Collections.synchronizedList` 方法解决。其迭代器是快速失败的，在迭代器创建后，若列表发生结构修改（除通过迭代器自身的 `remove` 或 `add` 方法），会抛出 `ConcurrentModificationException`，但该行为不能完全保证，仅用于检测错误。
4. **成员总结**
    - **字段**：继承自 `AbstractList` 的 `modCount` 字段，用于记录列表结构修改次数。
    - **构造方法**：有三个构造方法，可创建初始容量为10的空列表、指定初始容量的空列表，或包含指定集合元素的列表。
    - **方法**：涵盖添加、删除、修改、查询等多种操作方法，还包括 `forEach`、`sort`、`spliterator` 等适配新特性的方法。
5. **方法详细说明**：对每个方法的功能、参数、返回值、异常抛出情况及与其他接口或类的关系进行了详细阐述，部分方法还给出使用示例和注意事项。 
```

### 方法

```java

### **Java `ArrayList` 学习笔记**  


#### **一、核心特性**  
`ArrayList` 是Java集合框架中基于**动态数组**实现的 `List` 接口类，核心特点如下：  
- **动态扩容**：底层使用数组存储元素（`transient Object[] elementData`），当数组容量不足时自动扩容（默认扩容为原容量的1.5倍），解决了原生数组长度固定的限制。  
- **随机访问高效**：通过索引直接访问元素（如`get(int index)`）的时间复杂度为 `O(1)`，适合高频查询或遍历场景（CPU缓存友好）。  
- **插入/删除低效**：在列表中间插入或删除元素时（如`add(int index, E e)`或`remove(int index)`），需要移动后续元素，时间复杂度为 `O(n)`；尾部操作（如`add(E e)`）更高效（无扩容时为 `O(1)`）。  
- **非线程安全**：多线程环境下并发修改（如添加或删除元素）可能导致数据不一致，或抛出 `ConcurrentModificationException`（快速失败机制触发）。  


#### **二、构造方法**  
`ArrayList` 提供三种构造方式，根据初始化场景选择：  
1. **无参构造**（最常用）：`new ArrayList<>()`  
   - 初始时`elementData`是一个空数组（`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`），**首次添加元素时**才会分配默认容量（`DEFAULT_CAPACITY = 10`）。  
   - 适合不确定数据量的场景（延迟初始化，避免内存浪费）。  

2. **指定初始容量构造**：`new ArrayList<>(int initialCapacity)`  
   - 直接创建一个初始容量为`initialCapacity`的空数组。  
   - 若已知数据量（如预计存储1000个元素），建议使用此构造，避免后续频繁扩容（扩容会触发数组复制，影响性能）。  

3. **通过集合构造**：`new ArrayList<>(Collection<? extends E> c)`  
   - 将集合`c`的元素按迭代顺序添加到新`ArrayList`中（底层调用`c.toArray()`复制元素）。  
   - 若集合`c`为`null`，会抛出`NullPointerException`。  


#### **三、核心操作：增删改查**  
**1. 添加元素**  
- **尾部添加**：`boolean add(E e)`  
  直接将元素添加到列表末尾。若当前数组已满（`size == elementData.length`），触发扩容（1.5倍）。无扩容时时间复杂度为 `O(1)`，扩容时为 `O(n)`（数组复制）。  

- **指定位置插入**：`void add(int index, E element)`  
  在`index`位置插入元素，后续元素整体后移一位。时间复杂度为 `O(n)`（需移动元素），若`index`越界（`index < 0`或`index > size`），抛出`IndexOutOfBoundsException`。  

- **批量添加集合元素**：`boolean addAll(Collection<? extends E> c)` 和 `boolean addAll(int index, Collection<? extends E> c)`  
  - 前者将集合`c`的所有元素添加到尾部，时间复杂度为 `O(k)`（`k`为集合大小，可能触发扩容）。  
  - 后者将集合`c`的元素插入到`index`位置（后续元素后移），时间复杂度为 `O(n + k)`（`n`为原列表大小，`k`为集合大小）。  


**2. 删除元素**  
- **按索引删除**：`E remove(int index)`  
  删除`index`位置的元素，后续元素整体前移一位。返回被删除的元素，时间复杂度为 `O(n)`（需移动元素）；若`index`越界，抛出`IndexOutOfBoundsException`。  

- **按值删除**：`boolean remove(Object o)`  
  删除第一个匹配的元素（`o == null`时删除`null`，否则通过`equals`比较）。时间复杂度为 `O(n)`（需遍历查找），若成功删除返回`true`（仅删除第一个匹配项）。  

- **批量删除**：`boolean removeAll(Collection<?> c)` 和 `boolean retainAll(Collection<?> c)`  
  - `removeAll`：删除所有在集合`c`中的元素（取差集），时间复杂度为 `O(n * k)`（`n`为列表大小，`k`为集合大小）。  
  - `retainAll`：仅保留与集合`c`共有的元素（取交集），逻辑与`removeAll`相反，时间复杂度相同。  

- **清空列表**：`void clear()`  
  将所有元素置为`null`（帮助GC回收），`size`变为0，但数组容量不变，时间复杂度为 `O(n)`。  


**3. 修改与查询**  
- **修改元素**：`E set(int index, E element)`  
  替换`index`位置的元素，返回被替换的旧值。时间复杂度为 `O(1)`（直接通过索引定位），若`index`越界抛出异常。  

- **查询元素**：`E get(int index)`  
  获取`index`位置的元素，时间复杂度为 `O(1)`（数组随机访问特性），若`index`越界抛出异常。  

- **判断存在性**：`boolean contains(Object o)`  
  检查列表是否包含元素`o`（`o == null`时检查是否有`null`元素，否则通过`equals`比较），时间复杂度为 `O(n)`（需遍历查找）。  

- **查找索引**：`int indexOf(Object o)` 和 `int lastIndexOf(Object o)`  
  - `indexOf`：从前往后查找第一个匹配元素的索引（未找到返回`-1`）。  
  - `lastIndexOf`：从后往前查找最后一个匹配元素的索引（未找到返回`-1`）。  
  两者时间复杂度均为 `O(n)`。  


#### **四、容量管理**  
`ArrayList` 通过动态扩容解决数组长度限制，但频繁扩容会影响性能。以下方法用于手动管理容量：  
- **释放冗余空间**：`void trimToSize()`  
  将数组容量（`elementData.length`）调整为实际元素数量（`size`），释放空闲空间。适合数据量稳定后优化内存（如批量删除后），可能触发数组复制（`Arrays.copyOf`）。  

- **预分配容量**：`void ensureCapacity(int minCapacity)`  
  确保数组容量至少为`minCapacity`（若当前容量不足则扩容）。常用于批量添加前（如`addAll`），避免多次扩容。扩容规则：若当前容量不足，新容量为原容量的1.5倍（或直接取`minCapacity`，取较大值）。  


#### **五、迭代与遍历**  
`ArrayList` 支持多种遍历方式，需注意迭代过程中的结构修改：  
- **普通`for`循环**：通过索引遍历（`for (int i=0; i<list.size(); i++)`），适合随机访问，时间复杂度为 `O(n)`。  

- **迭代器（`Iterator`）**：  
  通过`list.iterator()`获取单向迭代器，支持`hasNext()`、`next()`、`remove()`操作。迭代过程中若通过`list.remove()`修改列表结构（非迭代器的`remove`），会触发`ConcurrentModificationException`（快速失败机制）。  

- **列表迭代器（`ListIterator`）**：  
  通过`list.listIterator()`获取双向迭代器，支持`hasPrevious()`、`previous()`向前遍历，还可通过`add()`、`set()`修改元素。可指定起始位置（`list.listIterator(int index)`），更灵活。  

- **Java 8+ 函数式遍历**：`void forEach(Consumer<? super E> action)`  
  对每个元素执行`action.accept(e)`操作（如打印或处理），简化`for`循环代码，时间复杂度为 `O(n)`。  


#### **六、注意事项**  
1. **线程安全**：  
   `ArrayList` 非线程安全，多线程并发修改需额外处理：  
   - 使用`Collections.synchronizedList(new ArrayList<>())`包装（外部同步锁，性能较低）。  
   - 使用`CopyOnWriteArrayList`（写时复制，读多写少场景更高效）。  

2. **快速失败（Fail-Fast）**：  
   迭代器通过`modCount`字段记录列表结构修改次数。若迭代过程中`modCount`变化（如调用`list.add()`），迭代器会抛出`ConcurrentModificationException`。安全修改方式：使用迭代器的`remove()`方法。  

3. **内存优化**：  
   - 已知数据量时，通过`new ArrayList<>(initialCapacity)`预分配容量，减少扩容次数（扩容的数组复制操作耗时）。  
   - 长期存储大列表后，调用`trimToSize()`释放冗余空间（避免数组空闲位置浪费内存）。  


#### **七、总结**  
`ArrayList` 是Java中最常用的动态数组实现，核心优势是**随机访问高效**（`O(1)`时间复杂度），适合高频查询、尾部增删的场景。使用时需注意：  
- 避免在中间频繁插入/删除（改用`LinkedList`或考虑其他数据结构）。  
- 预分配容量或优化扩容（减少`Arrays.copyOf`的调用次数）。  
- 多线程场景选择合适的线程安全方案。  

通过理解`ArrayList`的底层逻辑（动态数组、扩容机制）和核心方法，能更高效地使用它解决实际问题。
```

#### 迭代器

```markdown
Java 中的列表迭代器（ListIterator）
双向功能：继承自 Iterator，支持前后遍历、修改、插入元素。
java
List<String> list = new ArrayList<>();
list.add("A");
ListIterator<String> it = list.listIterator();
while (it.hasNext()) {  // 向前遍历
    String element = it.next();
    if (element.equals("A")) {
        it.set("B");  // 修改当前元素
        it.add("C");  // 在当前位置后插入元素
    }
}

特点：
可通过 hasPrevious() 和 previous() 实现逆序遍历。
支持在遍历过程中安全地修改列表（避免并发修改异常）。
关键特性总结
通用性：适用于各种列表或集合类型（如数组、链表、集合等），提供统一的遍历接口。
访问控制：通常通过解引用操作（如 *it、it.next()）获取当前元素。
遍历控制：通过条件判断（如 hasNext()）决定是否继续遍历，避免越界。
局限性：某些语言的迭代器在列表结构改变时可能失效（如 Python 列表迭代器在列表被修改后可能报错）。
```

#### 详细介绍

~~~markdown

在 Java 中，**`ListIterator`** 是专门为 `List` 集合设计的迭代器接口，用于更灵活地遍历、操作列表元素。它扩展了普通 `Iterator` 接口，提供了双向遍历、元素修改、索引获取等增强功能。以下是对 `ListIterator` 的详细介绍：


### 一、基本概念
1. **继承关系**  
   `ListIterator` 继承自 `Iterator` 接口，因此拥有 `Iterator` 的所有方法（`hasNext()`、`next()`、`remove()`），并额外提供了针对列表的专属功能。
   
2. **作用**  
   - 支持**双向遍历**（向前和向后）列表。  
   - 允许在遍历过程中**添加、修改、删除元素**（普通 `Iterator` 仅支持删除）。  
   - 可获取当前遍历位置的**索引信息**。  
   - 仅适用于 `List` 及其子类（如 `ArrayList`、`LinkedList`），不适用于其他集合（如 `Set`）。


### 二、核心方法
#### 1. 双向遍历方法
| 方法                | 描述                                                                 |
|---------------------|----------------------------------------------------------------------|
| `boolean hasNext()` | 判断是否有下一个元素（正向遍历）。                                   |
| `E next()`          | 返回下一个元素（正向移动，索引递增）。                               |
| `boolean hasPrevious()` | 判断是否有上一个元素（反向遍历）。                               |
| `E previous()`      | 返回上一个元素（反向移动，索引递减）。                               |

#### 2. 索引相关方法
| 方法                | 描述                                                                 |
|---------------------|----------------------------------------------------------------------|
| `int nextIndex()`   | 返回下一个元素的索引（正向遍历时，当前位置的下一个元素索引）。       |
| `int previousIndex()` | 返回上一个元素的索引（反向遍历时，当前位置的上一个元素索引）。     |

- **示例**：若列表有 `[A, B, C]`，初始位置在索引 `0` 前：  
  - `nextIndex()` 返回 `0`（下一个元素是 `A`，索引 0），`previousIndex()` 返回 `-1`（无前驱元素）。  
  - 调用 `next()` 后，位置在索引 `0`（元素 `A`），`nextIndex()` 变为 `1`，`previousIndex()` 变为 `0`。

#### 3. 元素操作方法
| 方法                | 描述                                                                 |
|---------------------|----------------------------------------------------------------------|
| `void add(E e)`     | 在当前位置**之前**插入元素 `e`，插入后新元素的索引为 `nextIndex()`。 |
| `void set(E e)`     | 用 `e` 替换当前元素（即最后一次 `next()` 或 `previous()` 返回的元素）。 |
| `void remove()`     | 删除最后一次 `next()` 或 `previous()` 返回的元素（与 `Iterator` 行为一致）。 |


### 三、创建 `ListIterator`
通过 `List` 接口的 `listIterator()` 方法创建，支持指定起始索引：
```java
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");

// 从默认位置（索引 0 前）开始，正向遍历
ListIterator<String> iterator1 = list.listIterator(); 

// 从指定索引（如 1）开始，可正向或反向遍历
ListIterator<String> iterator2 = list.listIterator(1); 
```


### 四、使用示例
#### 1. 正向遍历（类似普通 `Iterator`）
```java
while (iterator1.hasNext()) {
    String element = iterator1.next();
    System.out.print(element + " "); // 输出：A B C
}
```

#### 2. 反向遍历（从末尾到开头）
```java
// 先移动到列表末尾（nextIndex() == list.size()）
while (iterator1.hasNext()) {
    iterator1.next(); // 移动到最后一个元素（C）的下一个位置（索引 3）
}
// 反向遍历
while (iterator1.hasPrevious()) {
    String element = iterator1.previous();
    System.out.print(element + " "); // 输出：C B A
}
```

#### 3. 遍历中添加元素
```java
ListIterator<String> iterator = list.listIterator();
while (iterator.hasNext()) {
    String element = iterator.next();
    if (element.equals("B")) {
        iterator.add("X"); // 在 B 之后插入 X（此时 nextIndex() 为 2，插入后 X 索引为 2，原 B 后元素后移）
    }
}
System.out.println(list); // 输出：[A, B, X, C]
```

#### 4. 遍历中修改元素
```java
ListIterator<String> iterator = list.listIterator();
while (iterator.hasNext()) {
    String element = iterator.next();
    if (element.equals("B")) {
        iterator.set("B_MODIFIED"); // 将 B 替换为 B_MODIFIED
    }
}
System.out.println(list); // 输出：[A, B_MODIFIED, C]
```


### 五、注意事项
1. **双向遍历限制**  
   - 反向遍历前，需通过 `next()` 移动到某个位置，或直接从指定索引开始（如 `listIterator(n)`）。  
   - 初始状态下（未调用 `next()` 或 `previous()`），`previousIndex()` 返回 `-1`，`nextIndex()` 返回 `0`。

2. **线程安全**  
   与普通 `Iterator` 一样，若在遍历过程中列表结构被外部修改（非通过 `ListIterator` 的 `add()`/`remove()`/`set()`），会抛出 `ConcurrentModificationException`（fail-fast 机制）。

3. **适用场景**  
   - 需要双向遍历列表时（如链表的前后移动）。  
   - 遍历过程中需要动态插入、修改元素时（普通 `Iterator` 仅支持删除）。  
   - 需要获取当前遍历位置的索引时。


### 六、与普通 `Iterator` 的对比
| 特性                | `Iterator`                     | `ListIterator`                 |
|---------------------|--------------------------------|--------------------------------|
| 遍历方向            | 单向（向前）                   | 双向（向前、向后）             |
| 元素操作            | 仅支持删除                     | 支持添加、修改、删除           |
| 索引获取            | 不支持                         | 支持 `nextIndex()`、`previousIndex()` |
| 适用集合            | 所有集合（实现 `Iterable`）    | 仅 `List` 及其子类             |


### 总结
`ListIterator` 是 Java 中处理 `List` 集合的强大工具，通过双向遍历和灵活的元素操作，满足了列表特有的遍历需求。合理使用它可以简化代码逻辑，提高集合操作的效率。但需注意其线程安全问题及适用场景，避免在非 `List` 集合中误用。
~~~



# 相关算法及知识点

## 大致介绍

~~~markdown

在 Java 中，虽然没有 C++ 中 `vector` 的概念，但 `ArrayList` 与其功能类似，都是动态数组。以下是结合 Java 对图中相关知识点的讲解：

### 边界处理问题  
在 Java 数组或 `ArrayList` 操作中，边界条件的处理至关重要。  
- 数组索引从 `0` 开始，若访问 `arr[n]`（`n` 为数组长度）会抛出 `ArrayIndexOutOfBoundsException`。例如：  
  ```java  
  int[] arr = {1, 2, 3};  
  System.out.println(arr[3]); // 运行时抛出 ArrayIndexOutOfBoundsException  
  ```  
- 对 `ArrayList` 操作时，同样要检查索引范围。例如 `get(int index)` 方法，若 `index < 0` 或 `index >= size()`，也会抛出异常。  

### `ArrayList` 里的坑  
- **迭代器失效风险**：使用 `Iterator` 或 `ListIterator` 遍历 `ArrayList` 时，若通过集合本身（而非迭代器的 `remove`/`add` 方法）修改集合结构（如 `add`/`remove` 元素），会触发 `ConcurrentModificationException`（快速失败机制）。  
  ```java  
  ArrayList<Integer> list = new ArrayList<>();  
  list.add(1);  
  list.add(2);  
  Iterator<Integer> it = list.iterator();  
  while (it.hasNext()) {  
      it.next();  
      list.remove(0); // 抛出 ConcurrentModificationException  
  }  
  ```  
- **扩容性能开销**：`ArrayList` 底层数组容量不足时会自动扩容（新容量为原容量的 1.5 倍），频繁扩容会导致多次数组复制，影响性能。可通过 `ensureCapacity(int minCapacity)` 预分配空间。  

### 数组相关算法与技巧  
- **二分算法**：  
  Java 提供 `Arrays.binarySearch(int[] a, int key)` 对有序数组进行二分查找。若自定义实现，需注意边界条件（区间开闭）。  
  ```java  
  int[] sortedArr = {1, 3, 5, 7, 9};  
  int target = 5;  
  int left = 0, right = sortedArr.length - 1;  
  while (left <= right) {  
      int mid = left + (right - left) / 2;  
      if (sortedArr[mid] == target) {  
          System.out.println("找到，索引：" + mid);  
          break;  
      } else if (sortedArr[mid] < target) {  
          left = mid + 1;  
      } else {  
          right = mid - 1;  
      }  
  }  
  ```  
- **双指针**：  
  - **快慢指针**：常用于数组去重、链表环检测等。例如数组去重（原地修改）：  
    ```java  
    ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 1, 2, 2, 3));  
    int slow = 0;  
    for (int fast = 1; fast < nums.size(); fast++) {  
        if (!nums.get(fast).equals(nums.get(slow))) {  
            slow++;  
            nums.set(slow, nums.get(fast));  
        }  
    }  
    nums.subList(slow + 1, nums.size()).clear(); // 移除重复元素后的多余部分  
    ```  
  - **对撞指针**：在有序数组中，一个从左（`left`）、一个从右（`right`）移动。例如两数之和等于目标值（有序数组）：  
    ```java  
    int[] arr = {1, 2, 4, 6, 8};  
    int target = 10;  
    int left = 0, right = arr.length - 1;  
    while (left < right) {  
        int sum = arr[left] + arr[right];  
        if (sum == target) {  
            System.out.println("找到组合：" + arr[left] + " 和 " + arr[right]);  
            break;  
        } else if (sum < target) {  
            left++;  
        } else {  
            right--;  
        }  
    }  
    ```  
- **滑动窗口**：处理连续子数组问题（如最大子数组和）。例如求数组中连续 `k` 个元素的最大和：  
  ```java  
  int[] arr = {1, 3, -1, -3, 5, 3, 6, 7};  
  int k = 3;  
  int maxSum = Integer.MIN_VALUE;  
  int currentSum = 0;  
  for (int i = 0; i < arr.length; i++) {  
      currentSum += arr[i];  
      if (i >= k - 1) {  
          maxSum = Math.max(maxSum, currentSum);  
          currentSum -= arr[i - (k - 1)]; // 窗口滑动，减去左边移出的元素  
      }  
  }  
  ```  
- **滑动窗口 + 哈希**：结合 `HashMap` 记录窗口内元素信息。例如求字符串中无重复字符的最长子串：  
  ```java  
  String s = "abcabcbb";  
  int maxLen = 0;  
  int left = 0;  
  HashMap<Character, Integer> charMap = new HashMap<>();  
  for (int right = 0; right < s.length(); right++) {  
      char c = s.charAt(right);  
      if (charMap.containsKey(c)) {  
          left = Math.max(left, charMap.get(c) + 1); // 调整左边界  
      }  
      charMap.put(c, right);  
      maxLen = Math.max(maxLen, right - left + 1);  
  }  
  ```  

### 二维数组初始化  
Java 中初始化二维数组（类似 C++ 中 `vector<vector<int>>`）：  
```java  
int n = 3;  
int[][] res = new int[n][n]; // 创建 n×n 的二维数组，元素默认初始化为 0  
for (int i = 0; i < n; i++) {  
    for (int j = 0; j < n; j++) {  
        res[i][j] = i * n + j; // 填充示例  
    }  
}  
```  

### 循环矩阵与螺旋矩阵 II  
- **循环矩阵**：按层处理矩阵（如逐层遍历）。例如顺时针打印矩阵：  
  ```java  
  int[][] matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};  
  int left = 0, right = matrix[0].length - 1;  
  int top = 0, bottom = matrix.length - 1;  
  while (left <= right && top <= bottom) {  
      // 上侧  
      for (int i = left; i <= right; i++) System.out.print(matrix[top][i] + " ");  
      top++;  
      // 右侧  
      for (int i = top; i <= bottom; i++) System.out.print(matrix[i][right] + " ");  
      right--;  
      if (top <= bottom) {  
          // 下侧  
          for (int i = right; i >= left; i--) System.out.print(matrix[bottom][i] + " ");  
          bottom--;  
      }  
      if (left <= right) {  
          // 左侧  
          for (int i = bottom; i >= top; i--) System.out.print(matrix[i][left] + " ");  
          left++;  
      }  
  }  
  ```  
- **螺旋矩阵 II**：生成 \(n \times n\) 的螺旋矩阵（填充 `1` 到 `n²`）。  
  ```java  
  int n = 3;  
  int[][] matrix = new int[n][n];  
  int num = 1;  
  int left = 0, right = n - 1;  
  int top = 0, bottom = n - 1;  
  while (left <= right && top <= bottom) {  
      // 上侧  
      for (int i = left; i <= right; i++) matrix[top][i] = num++;  
      top++;  
      // 右侧  
      for (int i = top; i <= bottom; i++) matrix[i][right] = num++;  
      right--;  
      if (top <= bottom) {  
          // 下侧  
          for (int i = right; i >= left; i--) matrix[bottom][i] = num++;  
          bottom--;  
      }  
      if (left <= right) {  
          // 左侧  
          for (int i = bottom; i >= top; i--) matrix[i][left] = num++;  
          left++;  
      }  
  }  
  ```  

这些知识点在 Java 算法题（如 LeetCode）和实际编程中非常重要，理解并掌握它们能有效提升数组及动态数组（`ArrayList`）的操作能力，优化代码效率与正确性。 
~~~





## 双指针

~~~markdown

在 Java 中，双指针在数组问题中应用广泛，主要分为以下几种题目类型及对应解法：

### 一、相向双指针（对撞指针）
**题目类型**：常用于有序数组，解决两数之和、数组元素配对等问题。  
**解法**：一个指针指向数组开头（左指针），一个指向结尾（右指针），根据两指针指向元素的和与目标值的大小关系，调整指针移动方向。  

**示例：有序数组两数之和（LeetCode 167）**  
给定一个已排序的整数数组 `numbers` 和目标值 `target`，找出两个数，返回它们的下标（1 起始）。  
```java
public int[] twoSum(int[] numbers, int target) {
    int left = 0;
    int right = numbers.length - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) {
            return new int[]{left + 1, right + 1}; // 1-based 下标
        } else if (sum < target) {
            left++; // 和偏小，左指针右移
        } else {
            right--; // 和偏大，右指针左移
        }
    }
    return new int[]{-1, -1}; // 无符合条件的解
}
```

### 二、同向快慢指针
**题目类型**：用于数组元素的移除、去重，或寻找特定元素等。  
**解法**：快指针遍历数组，慢指针记录有效位置（如非目标值、非重复值的位置），通过比较快慢指针指向的元素，决定是否更新慢指针。  

**1. 移除数组元素（LeetCode 27）**  
原地移除数组中所有等于 `val` 的元素，返回新数组长度。  
```java
public int removeElement(int[] nums, int val) {
    int slow = 0; // 慢指针记录非 val 元素的位置
    for (int fast = 0; fast < nums.length; fast++) { // 快指针遍历
        if (nums[fast] != val) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    return slow; // 新数组长度
}
```

**2. 删除有序数组重复项（LeetCode 26）**  
原地删除有序数组中的重复项，使每个元素只出现一次，返回新长度。  
```java
public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    int slow = 0; // 慢指针记录不重复元素的位置
    for (int fast = 1; fast < nums.length; fast++) { // 快指针探索
        if (nums[fast] != nums[slow]) { // 发现新元素
            slow++;
            nums[slow] = nums[fast];
        }
    }
    return slow + 1; // 新数组长度（slow 从 0 开始）
}
```

### 三、滑动窗口（同向双指针）
**题目类型**：求满足特定条件的连续子数组（如和为定值、最值等）。  
**解法**：两个指针（左、右）从左向右移动，右指针扩展窗口（加入元素），左指针收缩窗口（移除元素），通过判断窗口内元素是否符合条件，调整指针位置。  

**示例：和为 `target` 的连续正整数子数组**  
输入正整数 `target`，返回和为 `target` 的连续正整数子数组（示例代码简化处理）。  
```java
public int[] findContinuousSequence(int target) {
    int left = 1, right = 2; // 左右指针初始化
    while (left < right) {
        int sum = (left + right) * (right - left + 1) / 2; // 计算窗口和
        if (sum == target) {
            int[] res = new int[right - left + 1];
            for (int i = left; i <= right; i++) {
                res[i - left] = i;
            }
            return res;
        } else if (sum < target) {
            right++; // 和偏小，扩大窗口
        } else {
            left++; // 和偏大，缩小窗口
        }
    }
    return null;
}
```

### 四、分离双指针（拓展）
**题目类型**：将数组元素按条件分区（如奇偶分离、正负分离）。  
**解法**：一个指针从左向右，一个从右向左，根据元素是否符合条件，交换或移动指针。  

**示例：调整数组顺序使奇数在前偶数在后**  
```java
public void reorderArray(int[] nums) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        // 左指针找偶数
        while (left < right && nums[left] % 2 != 0) left++;
        // 右指针找奇数
        while (left < right && nums[right] % 2 == 0) right--;
        // 交换
        if (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
        }
    }
}
```

双指针通过减少遍历次数、利用数组特性（如有序性），能有效优化时间复杂度（通常从 \(O(n^2)\) 降至 \(O(n)\)）。实际应用中，需根据题目条件灵活选择指针移动逻辑。 
~~~



# 数组算法题目

## 题录

[数组1](https://blog.csdn.net/xdzhangzhenhao/article/details/81349891?ops_request_misc=%257B%2522request%255Fid%2522%253A%25227d9ffe0ce1205f5730c5e97c06423ce3%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=7d9ffe0ce1205f5730c5e97c06423ce3&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-81349891-null-null.142^v102^pc_search_result_base7&utm_term=%E6%95%B0%E7%BB%84%E7%AE%97%E6%B3%95%E9%A2%98%E7%9B%B8%E5%85%B3%E6%80%BB%E7%BB%93&spm=1018.2226.3001.4187)

[数组2](https://blog.csdn.net/weixin_64838846/article/details/136523401?ops_request_misc=%257B%2522request%255Fid%2522%253A%25223b6348c501c4980ea43964fb49959ab4%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=3b6348c501c4980ea43964fb49959ab4&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-5-136523401-null-null.142^v102^pc_search_result_base7&utm_term=%E6%95%B0%E7%BB%84%E7%AE%97%E6%B3%95%E9%A2%98%E7%9B%B8%E5%85%B3%E6%80%BB%E7%BB%93&spm=1018.2226.3001.4187)

[数组3](https://blog.csdn.net/weixin_50302770/article/details/121412972?ops_request_misc=%257B%2522request%255Fid%2522%253A%25223c86f869a2c01296fa892a5532b1fb68%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=3c86f869a2c01296fa892a5532b1fb68&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-121412972-null-null.142^v102^pc_search_result_base7&utm_term=%E6%95%B0%E7%BB%84%E7%AE%97%E6%B3%95%E9%A2%98%E7%9B%B8%E5%85%B3%E6%80%BB%E7%BB%93java&spm=1018.2226.3001.4187)

### L26 删除重复项

解法：快慢双指针

### L122 股票买卖

1） 贪心算法

2） 动态规划

~~~markdown
### 问题分析  
题目要求计算股票多次买卖的最大利润（不能同时持有多笔），核心是找到所有可盈利的交易机会。以下分别用**贪心算法**和**动态规划**两种方法解决，并给出 Java 实现。


### **方法一：贪心算法**  
贪心的核心思想是：**只要后一天的股价比前一天高，就进行一次买卖**（即累加所有相邻正差值）。  
因为多次交易的利润可以拆分为多个“今天买、明天卖”的小利润之和（例如示例3中，1→2→3→4→5的利润等于 (2-1)+(3-2)+(4-3)+(5-4)=4）。  


#### 算法步骤  
1. 初始化利润 `profit = 0`。  
2. 遍历数组，从第 1 天开始，比较当前天与前一天的股价。  
3. 如果当前天股价更高（`prices[i] > prices[i-1]`），则累加差值到利润（`profit += prices[i] - prices[i-1]`）。  


#### 代码实现  
```java
public class Solution {
    // 贪心算法
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length <= 1) {
            return 0;
        }
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            // 只要后一天比前一天贵，就进行一次买卖
            if (prices[i] > prices[i - 1]) {
                profit += prices[i] - prices[i - 1];
            }
        }
        return profit;
    }
}
```


### **方法二：动态规划**  
动态规划的核心是定义状态并推导状态转移方程。由于不能同时持有多笔交易，状态需区分“持有股票”和“不持有股票”两种情况。  


#### 状态定义  
- `dp[i][0]`：第 `i` 天**不持有股票**时的最大利润。  
- `dp[i][1]`：第 `i` 天**持有股票**时的最大利润。  


#### 状态转移  
- **不持有股票**（`dp[i][0]`）：有两种可能：  
  1. 前一天也不持有股票（`dp[i-1][0]`）。  
  2. 前一天持有股票，今天卖出（`dp[i-1][1] + prices[i]`）。  
  取两者最大值：`dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i])`。  

- **持有股票**（`dp[i][1]`）：有两种可能：  
  1. 前一天也持有股票（`dp[i-1][1]`）。  
  2. 前一天不持有股票，今天买入（`dp[i-1][0] - prices[i]`）。  
  取两者最大值：`dp[i][1] = max(dp[i-1][1], dp[i-1][0] - prices[i])`。  


#### 初始状态  
- 第 0 天不持有股票：`dp[0][0] = 0`（未买入）。  
- 第 0 天持有股票：`dp[0][1] = -prices[0]`（买入第 0 天的股票）。  


#### 最终结果  
最后一天不持有股票的利润（`dp[n-1][0]`），因为持有股票的利润一定小于等于不持有（无法卖出）。  


#### 代码实现（基础版）  
```java
public class Solution {
    // 动态规划（基础版）
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length <= 1) {
            return 0;
        }
        int n = prices.length;
        int[][] dp = new int[n][2];
        // 初始化：第 0 天的状态
        dp[0][0] = 0;         // 不持有
        dp[0][1] = -prices[0];// 持有（买入第 0 天的股票）
        
        for (int i = 1; i < n; i++) {
            // 第 i 天不持有股票的最大利润
            dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] + prices[i]);
            // 第 i 天持有股票的最大利润
            dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] - prices[i]);
        }
        return dp[n-1][0]; // 最后一天不持有股票的利润最大
    }
}
```


#### 代码优化（空间压缩）  
由于每次状态转移仅依赖前一天的状态，可将二维数组压缩为两个变量，减少空间复杂度。  

```java
public class Solution {
    // 动态规划（空间优化版）
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length <= 1) {
            return 0;
        }
        int n = prices.length;
        // 用两个变量代替二维数组
        int notHold = 0;         // 初始不持有股票
        int hold = -prices[0];   // 初始持有股票（买入第 0 天的股票）
        
        for (int i = 1; i < n; i++) {
            int newNotHold = Math.max(notHold, hold + prices[i]);
            int newHold = Math.max(hold, notHold - prices[i]);
            // 更新状态
            notHold = newNotHold;
            hold = newHold;
        }
        return notHold; // 最后一天不持有股票的利润最大
    }
}
```


### **复杂度分析**  
| 方法       | 时间复杂度 | 空间复杂度（基础版） | 空间复杂度（优化版） |  
|------------|------------|----------------------|----------------------|  
| 贪心算法   | \(O(n)\)   | \(O(1)\)             | \(O(1)\)             |  
| 动态规划   | \(O(n)\)   | \(O(n)\)             | \(O(1)\)             |  


### **总结**  
- **贪心算法**：适用于本题，因为允许多次交易，且利润可拆分为所有相邻正差值之和。  
- **动态规划**：更通用，可扩展到其他股票交易变种问题（如限制交易次数、冷冻期等）。
~~~

### L1868轮转数组

~~~markdown
### **Java 实现数组向右轮转 k 个位置的三种方法**  


### **方法一：暴力法（逐次右移）**  
**思路**：每次将数组向右移动一步（最后一个元素移动到最前面），重复 `k` 次。  
**关键点**：由于轮转 `n` 次（`n` 为数组长度）等价于不轮转，因此需先计算 `k = k % n` 减少无效操作。  


#### 代码实现  
```java
public class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n; // 处理 k 大于数组长度的情况（例如 k=10，n=7，实际轮转3次）
        for (int i = 0; i < k; i++) {
            int last = nums[n - 1]; // 保存最后一个元素
            // 将前 n-1 个元素依次右移一位
            for (int j = n - 1; j > 0; j--) {
                nums[j] = nums[j - 1];
            }
            nums[0] = last; // 最后一个元素放到最前面
        }
    }
}
```  

**复杂度分析**：  
- 时间复杂度：\(O(k \times n)\)，最坏情况下（如 \(k = n-1\)）时间复杂度为 \(O(n^2)\)。  
- 空间复杂度：\(O(1)\)。  


### **方法二：额外数组法（直接计算目标位置）**  
**思路**：创建一个新数组，直接计算每个元素在轮转后的目标位置，最后将新数组复制回原数组。  
**关键点**：原数组下标 `i` 的元素轮转 `k` 次后的目标位置为 `(i + k) % n`（取模避免越界）。  


#### 代码实现  
```java
public class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n;
        int[] newArr = new int[n];
        // 计算每个元素的目标位置
        for (int i = 0; i < n; i++) {
            newArr[(i + k) % n] = nums[i];
        }
        // 将新数组复制回原数组
        System.arraycopy(newArr, 0, nums, 0, n);
    }
}
```  

**复杂度分析**：  
- 时间复杂度：\(O(n)\)，仅需一次遍历。  
- 空间复杂度：\(O(n)\)，需要额外数组存储。  


### **方法三：数组反转法（原地操作）**  
**思路**：通过三次反转数组实现轮转。  
**数学原理**：  
- 向右轮转 `k` 次等价于将数组的后 `k` 个元素移动到前面，前 `n-k` 个元素后移。  
- 反转整个数组后，后 `k` 个元素（原数组的末尾）会位于数组前 `k` 位，但顺序是逆的；  
- 反转前 `k` 个元素，恢复顺序；  
- 反转后 `n-k` 个元素，恢复顺序。  


#### 代码实现  
```java
public class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n;
        reverse(nums, 0, n - 1); // 反转整个数组
        reverse(nums, 0, k - 1); // 反转前 k 个元素
        reverse(nums, k, n - 1); // 反转后 n-k 个元素
    }

    // 辅助方法：反转数组从 start 到 end 的位置
    private void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;
            start++;
            end--;
        }
    }
}
```  

**复杂度分析**：  
- 时间复杂度：\(O(n)\)，三次反转操作的总时间为 \(O(n)\)（每次反转时间为 \(O(n/2)\)）。  
- 空间复杂度：\(O(1)\)，仅需常数空间。  


### **方法四（拓展）：环状替换法（原地操作）**  
**思路**：找到每个元素的目标位置，通过循环替换将元素直接放到正确位置，避免重复操作。  
**关键点**：每个元素最终会被替换到初始位置，形成一个环。通过遍历所有环，确保每个元素被处理一次。  


#### 代码实现  
```java
public class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n;
        int count = 0; // 记录已处理的元素个数
        for (int start = 0; count < n; start++) {
            int current = start; // 当前处理的起始位置
            int prev = nums[start]; // 保存起始位置的元素
            do {
                int next = (current + k) % n; // 计算下一个位置
                int temp = nums[next]; // 保存下一个位置的原元素
                nums[next] = prev; // 将当前元素放到下一个位置
                prev = temp; // 更新 prev 为下一个位置的原元素
                current = next; // 移动到下一个位置
                count++; // 已处理元素数 +1
            } while (current != start); // 回到起始位置时，结束当前环的处理
        }
    }
}
```  

**复杂度分析**：  
- 时间复杂度：\(O(n)\)，每个元素仅被处理一次。  
- 空间复杂度：\(O(1)\)，仅需常数空间。  


### **总结**  
| 方法             | 时间复杂度 | 空间复杂度 | 适用场景                     |  
|------------------|------------|------------|------------------------------|  
| 暴力法           | \(O(kn)\)  | \(O(1)\)   | 小数据量，代码简单但效率低   |  
| 额外数组法       | \(O(n)\)   | \(O(n)\)   | 允许额外空间，追求简单实现   |  
| 数组反转法       | \(O(n)\)   | \(O(1)\)   | 不允许额外空间，追求高效原地操作 |  
| 环状替换法       | \(O(n)\)   | \(O(1)\)   | 不允许额外空间，适合深入理解轮转逻辑 |
~~~



### L1898可移除字符串最大数目

~~~markdown
### LeetCode 1898. 可移除字符的最大数目

**题目描述**：  
给你两个字符串 `s` 和 `p`，其中 `p` 是 `s` 的一个子序列。同时，给你一个整数数组 `removable`，该数组是 `s` 中下标的一个子集（下标从 0 开始）。

请你找出一个整数 `k`（0 <= k <= removable.length），选出 `removable` 中的前 `k` 个下标，然后从 `s` 中移除这些下标对应的字符。此时，`p` 仍然是 `s` 的一个子序列。

返回你可以找出的最大 `k`。

**示例**：  
输入：`s = "abcacb", p = "ab", removable = [3,1,0]`  
输出：`2`  
解释：  
- 移除下标 3 和 1 后，`s` 变为 `"accb"`，`p` 仍然是其子序列。
- 若再移除下标 0，`s` 变为 `"ccb"`，`p` 不再是其子序列。
- 因此，最大的 `k` 是 2。


### 方法一：二分查找 + 模拟删除

**思路**：  
1. **二分查找**：`k` 的取值范围是 `[0, removable.length]`，通过二分查找确定最大的 `k`。
2. **模拟删除**：对于每个 `k`，模拟删除 `removable` 中前 `k` 个下标对应的字符，检查 `p` 是否仍是子序列。

**Java代码**：
```java
class Solution {
    public int maximumRemovals(String s, String p, int[] removable) {
        int left = 0, right = removable.length;
        int res = 0;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (isSubsequence(s, p, removable, mid)) {
                res = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return res;
    }
    
    private boolean isSubsequence(String s, String p, int[] removable, int k) {
        boolean[] removed = new boolean[s.length()];
        for (int i = 0; i < k; i++) {
            removed[removable[i]] = true;
        }
        
        int i = 0, j = 0;
        while (i < s.length() && j < p.length()) {
            if (!removed[i] && s.charAt(i) == p.charAt(j)) {
                j++;
            }
            i++;
        }
        
        return j == p.length();
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(m * log n)，其中 m 是 `s` 的长度，n 是 `removable` 的长度。每次检查子序列的时间为 O(m)，二分查找需要 log n 次。
- **空间复杂度**：O(m)，用于标记被删除的字符。


### 方法二：预处理 + 双指针优化

**思路**：  
1. **预处理删除顺序**：记录每个字符在删除操作中的顺序。
2. **双指针检查子序列**：遍历 `p` 中的每个字符，确保其在 `s` 中的位置在删除操作中的顺序晚于当前已删除的字符数。

**Java代码**：
```java
class Solution {
    public int maximumRemovals(String s, String p, int[] removable) {
        int[] removeOrder = new int[s.length()];
        Arrays.fill(removeOrder, Integer.MAX_VALUE);
        
        // 预处理每个字符的删除顺序
        for (int i = 0; i < removable.length; i++) {
            removeOrder[removable[i]] = i;
        }
        
        int left = 0, right = removable.length;
        int res = 0;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (isSubsequence(s, p, removeOrder, mid)) {
                res = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return res;
    }
    
    private boolean isSubsequence(String s, String p, int[] removeOrder, int k) {
        int i = 0, j = 0;
        while (i < s.length() && j < p.length()) {
            if (removeOrder[i] >= k && s.charAt(i) == p.charAt(j)) {
                j++;
            }
            i++;
        }
        return j == p.length();
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(m + n * log n)，其中 m 是 `s` 的长度，n 是 `removable` 的长度。预处理删除顺序的时间为 O(n)，每次检查子序列的时间为 O(m)，二分查找需要 log n 次。
- **空间复杂度**：O(m)，用于存储删除顺序。


### 方法三：贪心策略 + 直接遍历

**思路**：  
1. **贪心策略**：每次尝试删除当前可删除的下标中最小的一个，然后检查 `p` 是否仍是子序列。
2. **直接遍历**：维护一个指针 `ptr` 表示当前 `p` 中需要匹配的字符位置，遍历 `s` 并跳过已删除的字符。

**Java代码**：
```java
class Solution {
    public int maximumRemovals(String s, String p, int[] removable) {
        int maxK = 0;
        boolean[] removed = new boolean[s.length()];
        
        for (int k = 0; k < removable.length; k++) {
            removed[removable[k]] = true;
            if (isSubsequence(s, p, removed)) {
                maxK = k + 1;
            } else {
                break;
            }
        }
        
        return maxK;
    }
    
    private boolean isSubsequence(String s, String p, boolean[] removed) {
        int ptr = 0;
        for (int i = 0; i < s.length() && ptr < p.length(); i++) {
            if (!removed[i] && s.charAt(i) == p.charAt(ptr)) {
                ptr++;
            }
        }
        return ptr == p.length();
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(k * m)，其中 k 是最大可删除的下标数，m 是 `s` 的长度。每次检查子序列的时间为 O(m)，最坏情况下需要检查 k 次。
- **空间复杂度**：O(m)，用于标记被删除的字符。


### 三种方法对比

| 方法               | 时间复杂度         | 空间复杂度 | 优势                      |
|--------------------|--------------------|------------|---------------------------|
| 二分查找 + 模拟删除 | O(m * log n)       | O(m)       | 适用于大数据量，效率高    |
| 预处理 + 双指针优化 | O(m + n * log n)   | O(m)       | 预处理后检查子序列更高效  |
| 贪心策略 + 直接遍历 | O(k * m)           | O(m)       | 实现简单，适合小规模数据  |

方法一和方法二在处理大规模数据时更具优势，而方法三则更直观易理解。根据题目约束和数据规模，可选择合适的方法。
~~~

### L1505 两个数组的交集

~~~markdown
### 两个数组的交集：三种解法

**题目描述**：  
给定两个整数数组 `nums1` 和 `nums2`，返回它们的交集。每个元素在结果中应当唯一，结果可以是任意顺序。

**示例**：  
输入：`nums1 = [1,2,2,1]`, `nums2 = [2,2]`  
输出：`[2]`


### 方法一：哈希表（Hash Set）

**思路**：  
1. 将第一个数组存入哈希表，去除重复元素。
2. 遍历第二个数组，检查元素是否存在于哈希表中，若存在则加入结果集。

**Java代码**：
```java
import java.util.*;

class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        Set<Integer> set1 = new HashSet<>();
        for (int num : nums1) {
            set1.add(num);
        }
        
        Set<Integer> result = new HashSet<>();
        for (int num : nums2) {
            if (set1.contains(num)) {
                result.add(num);
            }
        }
        
        return result.stream().mapToInt(Integer::intValue).toArray();
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(m + n)，其中 m 和 n 分别是两个数组的长度。
- **空间复杂度**：O(m)，主要用于存储第一个数组的哈希表。


### 方法二：排序 + 双指针

**思路**：  
1. 对两个数组分别排序。
2. 使用双指针遍历两个数组，比较元素大小：
   - 若元素相等，加入结果集并同时移动指针。
   - 若元素不等，移动较小元素的指针。

**Java代码**：
```java
import java.util.*;

class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        Arrays.sort(nums1);
        Arrays.sort(nums2);
        
        Set<Integer> result = new HashSet<>();
        int i = 0, j = 0;
        
        while (i < nums1.length && j < nums2.length) {
            if (nums1[i] < nums2[j]) {
                i++;
            } else if (nums1[i] > nums2[j]) {
                j++;
            } else {
                result.add(nums1[i]);
                i++;
                j++;
            }
        }
        
        return result.stream().mapToInt(Integer::intValue).toArray();
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(m log m + n log n)，主要由排序操作决定。
- **空间复杂度**：O(log m + log n)，排序所需的递归栈空间。


### 方法三：二分查找

**思路**：  
1. 对较短的数组进行排序。
2. 遍历较长的数组，对每个元素在排序后的短数组中进行二分查找。
3. 使用哈希表去重。

**Java代码**：
```java
import java.util.*;

class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        // 选择较短的数组进行排序
        if (nums1.length > nums2.length) {
            return intersection(nums2, nums1);
        }
        
        Arrays.sort(nums1);
        
        Set<Integer> result = new HashSet<>();
        for (int num : nums2) {
            if (binarySearch(nums1, num)) {
                result.add(num);
            }
        }
        
        return result.stream().mapToInt(Integer::intValue).toArray();
    }
    
    private boolean binarySearch(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return true;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return false;
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(min(m, n) log min(m, n) + max(m, n) log min(m, n))。
- **空间复杂度**：O(log min(m, n))，排序所需的递归栈空间。


### 三种方法对比

| 方法         | 时间复杂度                      | 空间复杂度       | 适用场景                  |
|--------------|---------------------------------|------------------|---------------------------|
| 哈希表       | O(m + n)                        | O(m) 或 O(n)     | 数据无序，追求线性时间    |
| 排序 + 双指针 | O(m log m + n log n)            | O(log m + log n) | 数据已排序或需要节省空间  |
| 二分查找     | O(min(m, n) log min(m, n) + ...)| O(log min(m, n)) | 一个数组远小于另一个数组  |

- **哈希表法**适用于快速查找，时间复杂度最优。
- **排序 + 双指针法**在数据已排序时更高效，且无需额外空间存储哈希表。
- **二分查找法**适合一个数组远小于另一个数组的情况，可减少排序开销。
~~~

