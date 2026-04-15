# 【Java +AI ｜基础篇day4 数组】

## 一、核心概述

数组是 Java 中最基础的**同类型数据有序容器**，核心作用是解决 “大批量同类型数据存储” 的问题 —— 相比多个独立变量，数组能简化数据管理、提升访问效率。其本质是**连续的内存空间分配**，通过索引快速定位元素（时间复杂度 O (1)）。

扩展而来的二维数组，本质是 “数组的数组”，适用于存储多维结构化数据（如座位表、矩阵、游戏地图），底层仍基于一维数组实现，仅组织形式不同。

## 二、一维数组（核心重点）

### 1. 数组的本质与核心特性

- **核心定义**：存储一批**数据类型相同、有序排列**的数据，每个元素占用相同大小的内存空间，通过 “数组名 + 索引” 快速访问。

- 关键特性

  ：

  - 长度固定：一旦初始化，长度不可修改（若需扩容，需新建数组并拷贝元素）；
  - 索引从 0 开始：最大索引 = 数组长度 - 1（越界会抛出`ArrayIndexOutOfBoundsException`）；
  - 存储一致性：仅能存储同类型数据（基本类型 / 引用类型），混合类型会编译报错。

### 2. 初始化方式（静态 + 动态，底层差异解析）

数组初始化的核心是 “分配内存空间 + 赋值”，分为两种方式，底层内存分配逻辑不同：

#### （1）静态初始化（已知具体元素）

- 格式 1（简化版，推荐）：

  ```
  数据类型[] 数组名 = {元素1, 元素2, ..., 元素n};
  ```

  

  示例：

  ```
  String[] names = {"张三", "李四", "王五"};
  ```

  （存储学生姓名）

- 格式 2（完整版）：

  ```
  数据类型[] 数组名 = new 数据类型[]{元素1, 元素2, ...};
  ```

  

  示例：

  ```
  int[] scores = new int[]{90, 85, 95};
  ```

- 底层逻辑：JVM 先计算元素个数→分配对应长度的连续内存→将元素依次存入内存→数组名指向内存首地址。

#### （2）动态初始化（已知长度，未知元素）

- 格式：

  ```
  数据类型[] 数组名 = new 数据类型[长度];
  ```

  

  示例：

  ```
  double[] javaScores = new double[8];
  ```

  （存储 8 名学生的 Java 成绩）

- 底层逻辑：JVM 先根据长度和数据类型分配连续内存→为元素赋**默认值**→数组名指向内存首地址。

- 默认值规则（关键避坑点）：

  | 数据类型分类                  | 默认值                     |
  | ----------------------------- | -------------------------- |
  | 整数型（byte/short/int/long） | 0                          |
  | 浮点型（float/double）        | 0.0                        |
  | 布尔型（boolean）             | false                      |
  | 字符型（char）                | '\u0000'（空字符，不可见） |
  | 引用类型（String / 数组等）   | null                       |

#### （3）两种初始化方式对比

| 初始化方式 | 适用场景                 | 优点                       | 缺点                               |
| ---------- | ------------------------ | -------------------------- | ---------------------------------- |
| 静态初始化 | 已知所有元素具体值       | 直接赋值，代码简洁         | 长度由元素个数决定，无法动态调整   |
| 动态初始化 | 已知数据个数，未知具体值 | 长度明确，适合后续循环赋值 | 需手动赋值，默认值可能导致逻辑错误 |

### 3. 数组的核心操作（底层原理 + 实战）

#### （1）元素访问与遍历

- 访问格式：

  ```
  数组名[索引]
  ```

  （读 / 写均可）

  

  示例：

  ```
  javaScores[0] = 88.5;
  ```

  （给第 1 个学生赋值）、

  ```
  System.out.println(javaScores[0]);
  ```

  （读取第 1 个学生成绩）

- 遍历方式（3 种，效率对比）：

  1. 普通 for 循环（最灵活，支持索引操作）：

     java

     

     运行

     

     ```java
     for (int i = 0; i < javaScores.length; i++) {
         System.out.println("第" + (i+1) + "名学生成绩：" + javaScores[i]);
     }
     ```

     

     底层：通过索引直接定位内存地址，效率最高（推荐用于需修改元素的场景）。

  2. 增强 for 循环（foreach，简洁高效）：

     java

     

     运行

     ```java
     for (double score : javaScores) {
         System.out.println("成绩：" + score);
     }
     ```

     

     底层：迭代器遍历，无法获取索引，仅适用于 “只读遍历”（代码简洁，无索引越界风险）。

  3. Arrays 工具类（JDK 提供，便捷）：

     java

     

     运行

     ```java
     import java.util.Arrays;
     System.out.println(Arrays.toString(javaScores)); // 直接打印数组所有元素
     ```

     

#### （2）核心业务场景实现

##### 场景 1：求数组最值（成绩最高分 / 最低分）

- 核心思路：假设第一个元素为最值→遍历数组逐一对比→更新最值。

- 实战代码：

  java

  运行

  ```java
  public static double getMaxScore(double[] scores) {
      if (scores == null || scores.length == 0) {
          throw new IllegalArgumentException("数组不能为空或长度为0");
      }
      double max = scores[0]; // 假设第一个元素为最大值
      for (int i = 1; i < scores.length; i++) {
          if (scores[i] > max) {
              max = scores[i]; // 发现更大值，更新
          }
      }
      return max;
  }
  ```

  

- 底层优化：避免每次循环都访问`scores.length`（虽 JVM 已优化，但手动缓存更高效）。

##### 场景 2：元素交换（斗地主洗牌核心）

- 核心思路：通过 “临时变量” 暂存元素，避免覆盖丢失。

- 实战代码（交换数组中两个索引的元素）：

  java

  运行

  

  ```java
  public static void swap(int[] arr, int i, int j) {
      // 边界校验：索引不越界+i != j（避免无效交换）
      if (i < 0 || i >= arr.length || j < 0 || j >= arr.length || i == j) {
          return;
      }
      int temp = arr[i]; // 暂存i位置元素
      arr[i] = arr[j];   // j位置元素覆盖i位置
      arr[j] = temp;     // 暂存元素写入j位置
  }
  ```

  

- 应用：斗地主洗牌（Fisher-Yates 算法）—— 随机生成索引，与当前元素交换，确保洗牌均匀：

  java

  

  运行

  

  

  

  

  ```java
  public static void shuffle(String[] cards) {
      Random random = new Random();
      for (int i = cards.length - 1; i > 0; i--) {
          int randomIndex = random.nextInt(i + 1); // 生成0~i的随机索引
          swap(cards, i, randomIndex); // 交换当前元素与随机索引元素
      }
  }
  ```

  

##### 场景 3：随机点名（数组 + 随机数）

- 核心思路：数组存储姓名→生成 0~ 数组长度 - 1 的随机索引→访问对应元素。

- 实战代码：

  java

  ```java
  public static String randomCall(String[] names) {
      if (names == null || names.length == 0) {
          return "无学生数据";
      }
      Random random = new Random();
      int index = random.nextInt(names.length); // 生成合法索引
      return names[index];
  }
  ```

  

- 对比独立变量：若用 70 个独立变量（name1~name70），需 70 个变量 + 70 个 case，数组仅需 1 行存储 + 1 行随机访问，大幅简化代码。

### 4. 一维数组常见问题与避坑指南

- 问题 1：数组索引越界（`ArrayIndexOutOfBoundsException`）

  - 原因：索引 <0 或 索引>= 数组长度（如`arr[arr.length]`）；
  - 避免：遍历用`i < arr.length`，随机索引用`nextInt(arr.length)`。

- 问题 2：空指针异常（`NullPointerException`）

  - 原因：数组未初始化（`int[] arr = null`）或动态初始化后元素为 null（如`String[] arr = new String[3]; arr[0].length()`）；
  - 避免：使用前校验数组非 null，引用类型数组需逐个初始化元素。

- 问题 3：数组长度不可变

  - 解决方案：新建更大数组，用

    ```
    System.arraycopy
    ```

    或

    ```
    Arrays.copyOf
    ```

    拷贝原元素：

    java

    ```java
    // 数组扩容（原数组长度+5）
    int[] newArr = Arrays.copyOf(oldArr, oldArr.length + 5);
    ```

    

## 三、二维数组（多维数据存储）

### 1. 二维数组的本质与核心特性

- **核心定义**：数组的每个元素都是一个**一维数组**（即 “数组的数组”），适用于存储结构化数据（如班级座位表、矩阵、游戏地图）。

- 关键特性

  ：

  - 支持不规则结构：每行可以是不同长度的一维数组（如第一行 3 个元素，第二行 5 个元素）；
  - 索引双重定位：`数组名[行索引][列索引]`（行 / 列索引均从 0 开始）；
  - 底层存储：本质是一维数组，每个元素存储对应行的一维数组的内存地址，并非严格的 “矩阵式连续内存”。

### 2. 初始化方式（静态 + 动态）

#### （1）静态初始化（已知所有元素）

- 格式 1（简化版）：

  ```
  数据类型[][] 数组名 = {{元素11, 元素12}, {元素21, 元素22}, ...};
  ```

  

  示例（座位表）：

  ```java
  String[][] seats = {
      {"张无忌", "赵敏", "周芷若"}, // 第一行
      {"张三丰", "宋远桥", "殷梨亭"}, // 第二行
      {"灭绝", "陈昆", "玄冥二老", "金毛狮王"} // 第三行（不规则长度）
  };
  ```

  

- 格式 2（完整版）：`数据类型[][] 数组名 = new 数据类型[][]{{元素11, 12}, {元素21, 22}};`

#### （2）动态初始化（已知行数 / 列数）

- 格式 1（固定行列数）：

  ```
  数据类型[][] 数组名 = new 数据类型[行数][列数];
  ```

  

  示例（3 行 3 列矩阵）：

  ```
  int[][] matrix = new int[3][3];
  ```

  （每行默认 3 个元素，值为 0）

- 格式 2（仅固定行数，列数动态分配）：

  ```
  数据类型[][] 数组名 = new 数据类型[行数][];
  ```

  

  示例（不规则二维数组）：

  java

  ```java
  int[][] irregularArr = new int[3][];
  irregularArr[0] = new int[2]; // 第一行2个元素
  irregularArr[1] = new int[4]; // 第二行4个元素
  irregularArr[2] = new int[1]; // 第三行1个元素
  ```

  

- 底层逻辑：先分配存储 “行数组引用” 的一维数组→再为每行分配独立的一维数组内存。

### 3. 二维数组的核心操作

#### （1）元素访问与遍历

- 访问格式：

  ```
  数组名[行索引][列索引]
  ```

  

  示例：

  ```
  System.out.println(seats[0][1]);
  ```

  （获取第一行第二列的 “赵敏”）

- 遍历方式（双重循环）：

  java

  ```java
  // 普通双重for循环（支持索引操作）
  for (int i = 0; i < seats.length; i++) { // 遍历行
      System.out.print("第" + (i+1) + "排：");
      for (int j = 0; j < seats[i].length; j++) { // 遍历当前行的列
          System.out.print(seats[i][j] + " ");
      }
      System.out.println();
  }
  
  // 增强for循环（简洁，无索引）
  for (String[] row : seats) {
      for (String name : row) {
          System.out.print(name + " ");
      }
      System.out.println();
  }
  ```

  

- 关键注意：`seats.length`是**行数**，`seats[i].length`是**第 i 行的列数**（不规则数组需逐行获取列数）。

#### （2）实战场景：石头迷阵游戏地图初始化

- 需求：用二维数组存储游戏地图的数字布局，支持后续打乱操作。

- 实战代码：

  java

  ```java
  public class StonePuzzle {
      public static void main(String[] args) {
          // 初始化3x3游戏地图
          int[][] map = {
              {1, 2, 3},
              {4, 5, 6},
              {7, 8, 0} // 0表示空白位置
          };
          System.out.println("初始化地图：");
          printMap(map);
  
          // 打乱地图（核心：随机交换元素）
          shuffleMap(map);
          System.out.println("\n打乱后地图：");
          printMap(map);
      }
  
      // 打印地图
      private static void printMap(int[][] map) {
          for (int[] row : map) {
              for (int num : row) {
                  System.out.print(num + "\t");
              }
              System.out.println();
          }
      }
  
      // 打乱地图（类似斗地主洗牌）
      private static void shuffleMap(int[][] map) {
          Random random = new Random();
          for (int i = map.length - 1; i >= 0; i--) {
              for (int j = map[i].length - 1; j >= 0; j--) {
                  int randomRow = random.nextInt(map.length);
                  int randomCol = random.nextInt(map[randomRow].length);
                  // 交换当前元素与随机位置元素
                  int temp = map[i][j];
                  map[i][j] = map[randomRow][randomCol];
                  map[randomRow][randomCol] = temp;
              }
          }
      }
  }
  ```

  

### 4. 二维数组常见问题与避坑

- 问题 1：行未初始化导致空指针（`NullPointerException`）
  - 原因：动态初始化时仅分配行数，未分配列数（如`int[][] arr = new int[3][]; arr[0][0] = 1;`）；
  - 避免：使用前确保每行已初始化（`arr[0] = new int[2];`）。
- 问题 2：不规则数组列数越界
  - 原因：默认每行列数相同，实际某行列数更少（如`seats[2].length=4`，却访问`seats[2][4]`）；
  - 避免：遍历列时用`row.length`（当前行的实际列数），而非固定值。

## 四、数组的底层内存模型（深入理解）

### 1. 一维数组内存布局

- 基本类型数组（如`int[] arr = {1,2,3}`）：
  - 栈内存：存储数组名`arr`（引用变量，指向堆内存地址）；
  - 堆内存：分配连续空间（3 个 int，共 12 字节），存储元素`1,2,3`；
  - 访问逻辑：`arr[0]` → 通过`arr`的地址找到堆内存首地址 → 偏移 0 字节（int 占 4 字节）→ 取出元素 1。
- 引用类型数组（如`String[] names = {"张三", "李四"}`）：
  - 栈内存：`names`存储堆内存地址；
  - 堆内存：分配连续空间（2 个引用，共 8 字节），每个引用指向对应的`String`对象（`"张三"`、`"李四"`存储在常量池）；
  - 注意：数组存储的是引用（地址），而非对象本身，修改数组元素是修改引用指向，不影响原对象。

### 2. 二维数组内存布局（以`int[][] arr = {{1,2}, {3,4}}`为例）

- 栈内存：`arr`存储堆内存地址；
- 堆内存：
  - 第一层：分配连续空间（2 个引用，共 8 字节），分别指向两个一维数组；
  - 第二层：两个一维数组各自分配连续空间，存储`{1,2}`和`{3,4}`；
- 访问逻辑：`arr[0][1]` → `arr`指向第一层数组 → 索引 0 找到第一个一维数组的地址 → 索引 1 取出元素 2。

## 五、数组的适用场景与局限性

### 1. 适用场景

- 存储大批量同类型数据（如学生成绩、用户列表）；
- 需快速随机访问元素（索引访问 O (1) 效率）；
- 多维结构化数据（如座位表、矩阵、游戏地图）；
- 简单排序、查找算法（如冒泡排序、线性查找）。

### 2. 局限性与替代方案

- 长度固定：无法动态扩容 / 缩容 → 替代方案：`ArrayList`（自动扩容的动态数组）；
- 插入 / 删除效率低：需移动大量元素（时间复杂度 O (n)） → 替代方案：`LinkedList`（链表结构）；
- 仅支持同类型数据：混合类型存储不便 → 替代方案：`HashMap`（键值对存储）或自定义类数组。

## 六、综合实战：学生成绩管理系统（数组全知识点整合）

### 需求

录入 8 名学生的 Java 成绩（小数），实现：计算平均分、最高分、最低分，打印所有学生成绩，查找指定分数的学生索引。

### 完整代码

java

```java
import java.util.Arrays;
import java.util.Scanner;

public class ScoreManager {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 1. 动态初始化数组（存储8名学生成绩）
        double[] scores = new double[8];

        // 2. 录入成绩
        for (int i = 0; i < scores.length; i++) {
            System.out.print("请输入第" + (i+1) + "名学生的Java成绩：");
            while (!sc.hasNextDouble()) {
                System.out.print("输入格式错误，请输入小数：");
                sc.next(); // 清空无效输入
            }
            scores[i] = sc.nextDouble();
        }

        // 3. 业务计算
        double avg = calculateAverage(scores);
        double max = getMaxScore(scores);
        double min = getMinScore(scores);
        int targetIndex = findScoreIndex(scores, 90.0); // 查找90分的学生索引

        // 4. 结果输出
        System.out.println("\n=== 学生成绩统计 ===");
        System.out.println("所有成绩：" + Arrays.toString(scores));
        System.out.printf("平均分：%.2f\n", avg);
        System.out.println("最高分：" + max);
        System.out.println("最低分：" + min);
        if (targetIndex != -1) {
            System.out.println("90分对应的学生索引（从0开始）：" + targetIndex);
        } else {
            System.out.println("未找到90分的学生");
        }

        sc.close();
    }

    // 计算平均分
    private static double calculateAverage(double[] scores) {
        double sum = 0;
        for (double score : scores) {
            sum += score;
        }
        return sum / scores.length;
    }

    // 计算最高分
    private static double getMaxScore(double[] scores) {
        double max = scores[0];
        for (double score : scores) {
            if (score > max) {
                max = score;
            }
        }
        return max;
    }

    // 计算最低分
    private static double getMinScore(double[] scores) {
        double min = scores[0];
        for (double score : scores) {
            if (score < min) {
                min = score;
            }
        }
        return min;
    }

    // 查找指定分数的索引（找到第一个匹配项）
    private static int findScoreIndex(double[] scores, double target) {
        for (int i = 0; i < scores.length; i++) {
            // 浮点数比较：避免直接==，用差值小于阈值
            if (Math.abs(scores[i] - target) < 1e-6) {
                return i;
            }
        }
        return -1; // 未找到返回-1
    }
}
```

### 知识点整合说明

- 动态初始化数组：`new double[8]` 存储 8 名学生成绩；
- 数组遍历：增强 for 循环求和，普通 for 循环录入成绩；
- 核心操作：求最值、平均分、元素查找；
- 边界处理：浮点数比较（避免`==`精度问题）、输入格式校验。

## 七、核心总结

1. 数组是连续内存的同类型数据容器，索引访问高效，长度固定；
2. 一维数组重点掌握：两种初始化、遍历方式、元素交换、最值计算；
3. 二维数组本质是 “数组的数组”，支持不规则结构，遍历需双重循环；
4. 避坑核心：索引不越界、空指针校验、默认值处理；
5. 适用场景：大批量同类型数据存储、快速访问，复杂场景可替换为集合类。

# Java 数组与二维数组 5 道深度面试题（含场景 + 答案）

## 面试题 1（基础：一维数组初始化 + 默认值 + 遍历）

### 场景

面试官：“某班级需要统计 5 名学生的数学成绩，其中 2 名学生成绩未录入（需排除未录入数据），请分析以下代码的运行结果并解释原因，同时修复代码以正确计算‘已录入成绩’的平均分。”

java



运行









```java
public class ScoreAverageDemo {
    public static void main(String[] args) {
        // 动态初始化数组，存储5名学生成绩（未录入成绩用默认值）
        double[] mathScores = new double[5];
        // 录入3名学生成绩
        mathScores[0] = 85.5;
        mathScores[2] = 92.0;
        mathScores[4] = 78.5;
        
        double sum = 0;
        // 遍历数组计算总分
        for (int i = 0; i < mathScores.length; i++) {
            sum += mathScores[i];
        }
        // 计算平均分（用数组长度5）
        double average = sum / mathScores.length;
        System.out.println("数学成绩平均分：" + average);
    }
}
```

### 问题

1. 原代码的运行结果是什么？为什么会出现该结果？
2. 代码存在什么逻辑错误？请修复代码以正确计算 “已录入成绩” 的平均分。
3. 动态初始化`double`数组时，未赋值元素的默认值是什么？不同数据类型数组的默认值规则有何核心差异？

## 面试题 2（进阶：一维数组扩容 + 元素插入）

### 场景

面试官：“开发中常需向数组中插入新元素，但数组长度固定，需手动实现扩容。请编写代码实现‘向 int 数组的指定索引插入元素’功能，要求：1. 插入后数组长度 + 1；2. 若索引不合法（<0 或> 原数组长度），抛出 IllegalArgumentException；3. 原数组元素从插入索引开始后移，不覆盖数据。”

### 问题

1. 编写完整的插入元素代码（含扩容逻辑）。
2. 数组扩容的核心原理是什么？为什么不直接修改原数组长度？
3. 若原数组长度为 1000，插入元素后新数组长度为 1001，该过程的时间复杂度是多少？为什么？

## 面试题 3（深入：一维数组内存模型 + 引用类型）

### 场景

面试官：“以下代码涉及 String 数组的内存存储，请分析运行结果并详细解释内存布局（栈、堆、常量池的交互），同时说明为什么修改`arr[1]`后，原 String 对象`"李四"`未被改变。”

java



运行









```java
public class StringArrayMemoryDemo {
    public static void main(String[] args) {
        // 静态初始化String数组
        String[] arr = {"张三", "李四", "王五"};
        // 修改数组第二个元素
        arr[1] = "赵六";
        // 打印数组和原对象
        System.out.println("数组元素：" + Arrays.toString(arr));
        System.out.println("原\"李四\"对象是否存在？" + ("李四".equals(arr[1]) ? "是" : "否"));
    }
}
```

### 问题

1. 代码的运行结果是什么？
2. 请用文字描述代码执行过程中的内存布局（栈、堆、字符串常量池分别存储什么）。
3. 为什么修改`arr[1]`后，原`"李四"`对象未被改变？这体现了引用类型数组的什么特性？

## 面试题 4（二维数组：不规则数组 + 遍历 + 空指针处理）

### 场景

面试官：“某班级座位表用二维数组存储，其中第三排未初始化（因学生未到齐），请分析以下代码的运行结果并修复错误，同时统计‘已有人的座位总数’和‘每排实际人数’。”

java



运行









```java
public class SeatCountDemo {
    public static void main(String[] args) {
        // 动态初始化二维数组（4排，每排人数不定）
        String[][] seats = new String[4][];
        // 初始化1、2、4排座位
        seats[0] = new String[]{"张无忌", "赵敏"};
        seats[1] = new String[]{"张三丰", "宋远桥", "殷梨亭"};
        seats[3] = new String[]{"杨逍", "纪晓芙"};
        
        int total = 0;
        // 遍历统计总人数和每排人数
        for (int i = 0; i < seats.length; i++) {
            System.out.println("第" + (i+1) + "排人数：" + seats[i].length);
            total += seats[i].length;
        }
        System.out.println("已有人的座位总数：" + total);
    }
}
```

### 问题

1. 原代码运行时会抛出什么异常？为什么？
2. 修复代码以正确统计（需处理未初始化的行），写出完整修复代码。
3. 二维数组的本质是什么？为什么支持 “不规则行数”（每排人数不同）？

## 面试题 5（综合：数组排序 + 二分查找 + 业务逻辑）

### 场景

面试官：“请实现一个‘成绩管理工具类’，包含两个核心方法：1. `bubbleSort`：用冒泡排序对 int 类型成绩数组从小到大排序；2. `binarySearch`：对排序后的数组用二分查找指定成绩，返回索引（未找到返回 - 1）。要求：处理数组为空或长度为 0 的情况，抛出 IllegalArgumentException。”

### 问题

1. 编写完整的`ScoreTool`工具类代码。
2. 冒泡排序的核心逻辑是什么？该算法的时间复杂度和空间复杂度分别是多少？
3. 二分查找的前提条件是什么？若未找到目标值，返回 - 1 的核心判断逻辑是什么？

# 参考答案

## 面试题 1 参考答案

### 1. 原代码运行结果与原因

- 运行结果：`数学成绩平均分：51.2`；
- 原因：动态初始化`double`数组时，未赋值元素的默认值为`0.0`（`mathScores[1]`和`mathScores[3]`均为`0.0`）；原代码用数组总长度`5`计算平均分，将未录入的`0.0`计入总分，导致结果偏低。

### 2. 逻辑错误与修复代码

- 逻辑错误：未排除 “未录入的默认值`0.0`”，直接用总长度计算，不符合 “已录入成绩” 的统计需求；

- 修复代码：

  java

  

  运行

  

  

  

  

  ```java
  public class ScoreAverageDemo {
      public static void main(String[] args) {
          double[] mathScores = new double[5];
          mathScores[0] = 85.5;
          mathScores[2] = 92.0;
          mathScores[4] = 78.5;
          
          double sum = 0;
          int count = 0; // 统计已录入成绩的数量
          for (int i = 0; i < mathScores.length; i++) {
              // 排除默认值0.0（假设成绩不会为0.0，实际可用标记值如-1表示未录入）
              if (mathScores[i] != 0.0) {
                  sum += mathScores[i];
                  count++;
              }
          }
          // 避免count=0时除以0
          double average = count == 0 ? 0 : sum / count;
          System.out.println("数学成绩平均分（已录入）：" + average); // 结果：(85.5+92.0+78.5)/3 = 85.333...
      }
  }
  ```

  

### 3. 默认值规则核心差异

- `double`数组未赋值元素默认值：`0.0`；

- 核心差异（按类型分类）：

  | 数据类型分类              | 默认值             | 核心特点                     |
  | ------------------------- | ------------------ | ---------------------------- |
  | 整数型（byte/int 等）     | 0                  | 数值型默认值为 “零值”        |
  | 浮点型（float/double）    | 0.0                | 带小数点的零值               |
  | 布尔型（boolean）         | false              | 逻辑零值                     |
  | 字符型（char）            | '\u0000'（空字符） | Unicode 编码中的零值，不可见 |
  | 引用类型（String / 数组） | null               | 无指向的空引用               |

## 面试题 2 参考答案

### 1. 完整插入元素代码

java



运行









```java
import java.util.Arrays;

public class ArrayInsertDemo {
    public static void main(String[] args) {
        int[] original = {10, 20, 30, 40};
        int insertValue = 25;
        int insertIndex = 2; // 插入到索引2（原20和30之间）
        int[] newArray = insertElement(original, insertValue, insertIndex);
        System.out.println("插入后数组：" + Arrays.toString(newArray)); // 结果：[10,20,25,30,40]
    }

    /**
     * 向int数组指定索引插入元素
     * @param original 原数组
     * @param value 待插入元素
     * @param index 插入索引
     * @return 插入后的新数组
     */
    public static int[] insertElement(int[] original, int value, int index) {
        // 1. 校验原数组
        if (original == null || original.length == 0) {
            throw new IllegalArgumentException("原数组不能为空或长度为0");
        }
        // 2. 校验索引合法性（0<=index<=原数组长度，允许插入到末尾）
        if (index < 0 || index > original.length) {
            throw new IllegalArgumentException("插入索引不合法：" + index + "，合法范围0~" + original.length);
        }
        // 3. 扩容：新建长度+1的数组
        int[] newArray = new int[original.length + 1];
        // 4. 拷贝原数组元素到新数组：索引0~index-1的元素直接拷贝
        System.arraycopy(original, 0, newArray, 0, index);
        // 5. 插入新元素
        newArray[index] = value;
        // 6. 拷贝原数组剩余元素：索引index~original.length-1的元素后移
        System.arraycopy(original, index, newArray, index + 1, original.length - index);
        return newArray;
    }
}
```

### 2. 数组扩容原理与长度不可变原因

- 核心原理：Java 数组长度一旦初始化就固定，扩容本质是**新建一个更长的数组**，通过`System.arraycopy`或`Arrays.copyOf`将原数组元素拷贝到新数组，原数组成为垃圾对象等待 GC 回收；
- 长度不可变原因：数组底层是**连续的内存空间**，若直接修改长度，可能导致内存地址冲突（如相邻内存已被占用），或破坏数组 “连续存储” 的特性，影响索引访问效率（O (1)）。

### 3. 时间复杂度分析

- 时间复杂度：`O(n)`（`n`为原数组长度，此处`n=1000`）；
- 原因：扩容的核心操作是两次`System.arraycopy`，需拷贝`index`（最多 1000） + `original.length - index`（最多 1000） = 1000 个元素，拷贝次数与原数组长度成正比，故时间复杂度为`O(n)`。

## 面试题 3 参考答案

### 1. 运行结果

plaintext











```plaintext
数组元素：[张三, 赵六, 王五]
原"李四"对象是否存在？否
```

### 2. 内存布局详解（执行过程）

- 初始状态（`String[] arr = {"张三", "李四", "王五"}`）

  ：

  1. 栈内存：存储数组引用变量`arr`，指向堆内存的数组对象；
  2. 堆内存：新建长度为 3 的`String[]`数组，每个元素是`String`对象的引用（地址），分别指向字符串常量池中的`"张三"`、`"李四"`、`"王五"`；
  3. 字符串常量池：存储字面量`"张三"`、`"李四"`、`"王五"`（常量池特性：相同字面量仅存储一份）。

- 修改`arr[1] = "赵六"`后

  ：

  1. 字符串常量池：若`"赵六"`不存在，创建`"赵六"`对象；
  2. 堆内存：数组`arr`的索引 1 元素，从 “指向`"李四"`的地址” 改为 “指向`"赵六"`的地址”；
  3. 原`"李四"`对象：仍存在于常量池中（无引用指向时等待 GC，但本案例中`"李四"`字面量未被回收）。

### 3. 原对象未改变的原因与引用类型数组特性

- 原因：引用类型数组（如`String[]`）存储的是**对象的引用（地址）** ，而非对象本身。修改`arr[1]`仅改变 “索引 1 存储的地址”，不影响原对象`"李四"`的内容；
- 核心特性：引用类型数组的元素是 “指针”，元素修改仅改变指针指向，不修改原对象数据（体现 “引用传递” 的本质）。

## 面试题 4 参考答案

### 1. 异常类型与原因

- 抛出异常：`NullPointerException`（空指针异常）；
- 原因：二维数组`seats[2]`未初始化（动态初始化时仅分配了 4 个 “行引用” 的空间，`seats[2]`默认值为`null`），遍历到`i=2`时，执行`seats[i].length`相当于`null.length`，触发空指针异常。

### 2. 修复后的完整代码

java



运行









```java
public class SeatCountDemo {
    public static void main(String[] args) {
        String[][] seats = new String[4][];
        seats[0] = new String[]{"张无忌", "赵敏"};
        seats[1] = new String[]{"张三丰", "宋远桥", "殷梨亭"};
        seats[3] = new String[]{"杨逍", "纪晓芙"};
        
        int total = 0;
        System.out.println("=== 班级座位统计 ===");
        for (int i = 0; i < seats.length; i++) {
            // 处理未初始化的行（seats[i] == null）
            if (seats[i] == null || seats[i].length == 0) {
                System.out.println("第" + (i+1) + "排人数：0（未初始化/无学生）");
                continue;
            }
            System.out.println("第" + (i+1) + "排人数：" + seats[i].length);
            total += seats[i].length;
        }
        System.out.println("已有人的座位总数：" + total); // 结果：2+3+0+2=7
    }
}
```

### 3. 二维数组本质与不规则行数支持原因

- 本质：二维数组是 “**数组的数组**”—— 外层数组的每个元素是一个一维数组的引用（地址）；
- 支持不规则行数原因：外层数组仅存储 “行引用”，每行的一维数组是独立的对象，可单独初始化不同长度（如`seats[0]`长度 2，`seats[1]`长度 3），底层不要求 “矩阵式连续内存”，故支持不规则结构。

## 面试题 5 参考答案

### 1. 完整`ScoreTool`工具类代码

java



运行









```java
public class ScoreTool {
    /**
     * 冒泡排序：int数组从小到大排序
     * @param scores 待排序的成绩数组
     */
    public static void bubbleSort(int[] scores) {
        // 校验数组
        if (scores == null || scores.length == 0) {
            throw new IllegalArgumentException("成绩数组不能为空或长度为0");
        }
        // 冒泡排序核心：外层循环控制轮次，内层循环控制每轮比较
        int n = scores.length;
        for (int i = 0; i < n - 1; i++) { // 轮次：n-1轮（最后一个元素无需比较）
            boolean swapped = false; // 优化：标记本轮是否发生交换，无交换则已有序
            for (int j = 0; j < n - 1 - i; j++) { // 每轮比较：排除已排序的i个元素
                if (scores[j] > scores[j + 1]) {
                    // 交换元素
                    int temp = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) {
                break; // 无交换，数组已有序，提前退出
            }
        }
    }

    /**
     * 二分查找：在排序后的数组中查找目标成绩
     * @param sortedScores 已从小到大排序的成绩数组
     * @param target 目标成绩
     * @return 目标成绩的索引（未找到返回-1）
     */
    public static int binarySearch(int[] sortedScores, int target) {
        // 校验数组
        if (sortedScores == null || sortedScores.length == 0) {
            throw new IllegalArgumentException("成绩数组不能为空或长度为0");
        }
        int left = 0;
        int right = sortedScores.length - 1;
        // 二分查找核心：缩小左右边界
        while (left <= right) {
            int mid = left + (right - left) / 2; // 避免(left+right)溢出
            if (sortedScores[mid] == target) {
                return mid; // 找到目标，返回索引
            } else if (sortedScores[mid] < target) {
                left = mid + 1; // 目标在右半区，左边界右移
            } else {
                right = mid - 1; // 目标在左半区，右边界左移
            }
        }
        return -1; // 循环结束未找到，返回-1
    }

    // 测试
    public static void main(String[] args) {
        int[] scores = {85, 92, 78, 65, 98};
        // 排序
        bubbleSort(scores);
        System.out.println("排序后成绩：" + Arrays.toString(scores)); // [65,78,85,92,98]
        // 查找
        int index = binarySearch(scores, 85);
        System.out.println("85分的索引：" + index); // 2
        int notFoundIndex = binarySearch(scores, 90);
        System.out.println("90分的索引（未找到）：" + notFoundIndex); // -1
    }
}
```

### 2. 冒泡排序逻辑与复杂度

- 核心逻辑：通过 “相邻元素两两比较，逆序则交换”，每轮将最大元素 “冒泡” 到数组末尾，经过`n-1`轮（`n`为数组长度）完成排序；优化点：若某轮无交换，说明数组已有序，提前退出循环；
- 复杂度：
  - 时间复杂度：最坏情况`O(n²)`（数组逆序，需全量比较交换）；最好情况`O(n)`（数组已有序，一轮无交换退出）；
  - 空间复杂度：`O(1)`（仅用临时变量`temp`和标记`swapped`，无额外空间开销，属于 “原地排序”）。

### 3. 二分查找前提与未找到返回 - 1 的逻辑

- 前提条件：数组**必须已排序**（本案例为从小到大排序），否则无法通过 “中间值与目标值的大小关系” 缩小查找范围；
- 未找到返回 - 1 的逻辑：当`left > right`时，说明左右边界已交叉，覆盖了所有可能的索引，仍未找到目标值，此时循环结束，返回 - 1（表示查找失败）。



