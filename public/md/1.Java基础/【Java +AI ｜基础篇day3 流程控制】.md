# 03🔄 Java Day03 - 流程控制

> 💡 **核心提示**：程序流程控制是控制代码执行顺序的核心，本文系统讲解分支结构、循环结构、跳转语句，帮你彻底掌握流程控制，避开 90% 的坑。

---

## 📋 快速回顾

| 结构类型 | 关键字 | 核心特点 | 适用场景 |
|----------|--------|----------|----------|
| **顺序结构** | 默认执行 | 代码自上而下执行 | 所有程序的基础 |
| **分支结构** | `if`、`switch` | 根据条件选择执行路径 | 条件判断、多分支选择 |
| **循环结构** | `for`、`while`、`do-while` | 重复执行代码块 | 批量处理、重复操作 |
| **跳转语句** | `break`、`continue` | 控制循环执行流程 | 提前终止、跳过迭代 |

---

## 📑 目录

- [一、分支结构](#一分支结构)
  - [1. if 分支（灵活判断）](#1-if-分支灵活判断)
  - [2. switch 分支（等值判断）](#2-switch-分支等值判断)
  - [3. if vs switch 对比](#3-if-vs-switch-对比)
- [二、循环结构](#二循环结构)
  - [1. for 循环（已知次数）](#1-for-循环已知次数)
  - [2. while 循环（未知次数）](#2-while-循环未知次数)
  - [3. do-while 循环（至少执行一次）](#3-do-while-循环至少执行一次)
  - [4. 三种循环对比](#4-三种循环对比)
  - [5. 增强 for 循环（foreach）](#5-增强-for-循环foreach)
- [三、跳转语句](#三跳转语句)
  - [1. break（终止）](#1-break终止)
  - [2. continue（跳过）](#2-continue跳过)
- [四、综合案例](#四综合案例)
  - [案例1：猜数字游戏](#案例1猜数字游戏)
  - [案例2：打印九九乘法表](#案例2打印九九乘法表)
  - [案例3：判断素数](#案例3判断素数)
- [问答](#问答)

---

## 📚 详细内容

### 🔀 一、分支结构

#### 1️⃣ if 分支（灵活判断）

| 形式 | 语法 | 适用场景 |
|:----:|------|----------|
| **单条件** | `if (条件) { 语句体; }` | 满足条件才执行 |
| **二选一** | `if (条件) { A } else { B }` | 互斥场景 |
| **多条件** | `if (条件1) { A } else if (条件2) { B } else { C }` | 多区间判断 |

> 📌 **if-else 执行流程图：**

```
┌─────────────────────────────────────────────────────────────┐
│                  if-else 执行流程                      │
│                                                             │
│   if (score >= 90) {                                        │
│       System.out.println("优秀");                          │
│   } else if (score >= 80) {                                │
│       System.out.println("良好");                          │
│   } else if (score >= 60) {                                │
│       System.out.println("及格");                          │
│   } else {                                                  │
│       System.out.println("不及格");                        │
│   }                                                         │
│                                                             │
│   ┌──────────────┐                                          │
│   │ score = 85   │                                          │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐    否    ┌──────────────┐               │
│   │score >= 90?  │────────►│score >= 80?  │               │
│   └──────┬───────┘          └──────┬───────┘               │
│    是   │                         │ 是                      │
│          ▼                         ▼                         │
│   ┌──────────────┐         ┌──────────────┐                 │
│   │  输出"优秀"  │         │  输出"良好"  │                 │
│   └──────────────┘         └──────────────┘                 │
│                                  │ 否                        │
│                                  ▼                           │
│                          ┌──────────────┐    否    ┌────────┐│
│                          │score >= 60?  │────────►│ 输出   ││
│                          └──────┬───────┘          │"不及格"││
│                           是   │                   └────────┘│
│                                ▼                             │
│                        ┌──────────────┐                      │
│                        │  输出"及格"  │                      │
│                        └──────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> ⚠️ **关键注意点：**
> - 条件表达式结果必须是 `boolean` 类型
> - `if (条件)` 后不要加 `;`
> - 即使语句体只有一行，建议保留大括号

```java
// 成绩等级判断
int score = 85;
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 80) {
    System.out.println("良好");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
```

#### 2️⃣ switch 分支（等值判断）

```java
switch(表达式) {
    case 值1:
        语句体1;
        break;
    case 值2:
        语句体2;
        break;
    ...
    default:
        默认语句;
}
```

> 🔄 **执行流程**：计算表达式值 → 匹配 case 值 → 执行语句体 → 遇 `break` 跳出（无 break 则"穿透"）

> 🚫 **关键限制：**
> - 表达式支持：`byte`、`short`、`int`、`char`、枚举（JDK5+）、`String`（JDK7+）
> - 不支持：`long`、`float`、`double`
> - case 值必须是字面量（不能是变量），且不可重复

```java
// 星期判断
int day = 3;
switch (day) {
    case 1:
        System.out.println("星期一");
        break;
    case 2:
        System.out.println("星期二");
        break;
    case 3:
        System.out.println("星期三");
        break;
    default:
        System.out.println("其他");
}
```

> 💡 **穿透性应用**（多个 case 逻辑相同）：

```java
// 判断季节
int month = 4;
switch (month) {
    case 3:
    case 4:
    case 5:
        System.out.println("春季");
        break;
    case 6:
    case 7:
    case 8:
        System.out.println("夏季");
        break;
    // ...
}
```

#### 3️⃣ if vs switch 对比

| 特性 | if 分支 | switch 分支 |
|:----:|---------|-------------|
| **判断逻辑** | 支持区间、多条件组合 | 仅支持等值判断 |
| **代码风格** | 复杂条件更直观 | 多等值场景更简洁 |
| **性能** | 顺序判断 O(n) | 跳转表 O(1) |
| **适用场景** | BMI 等级、温度区间 | 菜单选择、状态码匹配 |

---

### 🔁 二、循环结构

#### 1️⃣ for 循环（已知次数）

```java
for (初始化语句; 循环条件; 迭代语句) {
    循环体语句;
}
```

> 🔄 **执行流程**：初始化（仅1次）→ 判断条件 → 执行循环体 → 迭代语句 → 重复判断

> 📌 **for 循环执行流程图：**

```
┌─────────────────────────────────────────────────────────────┐
│                  for 循环执行流程                      │
│                                                             │
│   for (int i = 1; i <= 100; i++) {                         │
│       sum += i;                                             │
│   }                                                         │
│                                                             │
│   ┌──────────────┐                                          │
│   │ int i = 1   │  ← 初始化（仅执行1次）                    │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐    否    ┌──────────────┐               │
│   │  i <= 100?  │────────►│   结束循环   │               │
│   └──────┬───────┘          └──────────────┘               │
│    是   │                                                   │
│          ▼                                                   │
│   ┌──────────────┐                                          │
│   │  sum += i   │  ← 执行循环体                            │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐                                          │
│   │    i++      │  ← 迭代语句                              │
│   └──────┬───────┘                                          │
│          │                                                   │
│          └──────────────────────────┐                       │
│                                   │                          │
│                                   ▼                          │
│                          ┌──────────────┐                   │
│                          │  i <= 100?  │ ◄───┐              │
│                          └──────┬───────┘     │              │
│                           是   │             │              │
│                                └─────────────┘              │
│                                                             │
│   循环执行 100 次，sum = 5050                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```java
// 1-100 求和
int sum = 0;
for (int i = 1; i <= 100; i++) {
    sum += i;
}
System.out.println("1-100的和：" + sum);  // 5050
```

#### 2️⃣ while 循环（未知次数）

```java
初始化语句;
while (循环条件) {
    循环体语句;
    迭代语句;
}
```

> 💡 **特点**：先判断条件，再执行循环体（条件不满足则一次都不执行）

```java
// 纸张折叠到珠峰高度（8848米）
int count = 0;
double thickness = 0.0001;  // 0.1毫米
while (thickness < 8848) {
    thickness *= 2;
    count++;
}
System.out.println("折叠次数：" + count);
```

#### 3️⃣ do-while 循环（至少执行一次）

```java
初始化语句;
do {
    循环体语句;
    迭代语句;
} while (循环条件);
```

> 💡 **特点**：先执行循环体，再判断条件（确保至少执行1次）

```java
// 用户登录验证（至少输入一次密码）
Scanner sc = new Scanner(System.in);
String password;
do {
    System.out.print("请输入密码：");
    password = sc.nextLine();
} while (!"123456".equals(password));
System.out.println("登录成功！");
```

#### 4️⃣ 三种循环对比

| 循环类型 | 核心特点 | 适用场景 | 变量作用域 |
|:--------:|----------|----------|------------|
| **for** | 已知次数，结构紧凑 | 固定次数循环、范围遍历 | 循环变量仅在循环内有效 |
| **while** | 未知次数，先判断后执行 | 外部条件控制的循环 | 变量在循环外可复用 |
| **do-while** | 未知次数，先执行后判断 | 必须执行1次的操作 | 变量在循环外可复用 |

#### 5️⃣ 增强 for 循环（foreach）

```java
// 遍历数组
int[] arr = {1, 2, 3, 4, 5};
for (int num : arr) {
    System.out.println(num);
}

// 遍历集合
List<String> list = Arrays.asList("A", "B", "C");
for (String s : list) {
    System.out.println(s);
}
```

> ⚠️ **注意**：增强 for 只能读取元素，不能修改（修改的是临时变量）。

---

### 🚀 三、跳转语句

#### 1️⃣ break（终止）

- **作用**：跳出当前循环或 switch 分支
- **嵌套循环中**：仅终止当前层

```java
// 找 100 以内第一个能被 7 整除的数
for (int i = 1; i <= 100; i++) {
    if (i % 7 == 0) {
        System.out.println("找到：" + i);  // 7
        break;  // 终止循环
    }
}
```

> 💡 **带标签的 break**（终止外层循环）：

```java
outer:  // 标签
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
            break outer;  // 终止外层循环
        }
        System.out.println(i + "," + j);
    }
}
```

#### 2️⃣ continue（跳过）

- **作用**：跳过本次循环剩余代码，进入下一次迭代
- **仅用于**：循环

```java
// 打印 1-10 的奇数
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue;  // 跳过偶数
    }
    System.out.println(i);  // 1, 3, 5, 7, 9
}
```

> ⚠️ **注意**：
> - `for` 循环：`continue` 后自动执行迭代语句（如 `i++`）
> - `while` 循环：`continue` 后需手动迭代，否则可能死循环

---

### 🎯 四、综合案例

#### 🎲 案例1：猜数字游戏

```java
import java.util.Random;
import java.util.Scanner;

public class GuessNumber {
    public static void main(String[] args) {
        Random random = new Random();
        int target = random.nextInt(100) + 1;  // 1-100
        Scanner sc = new Scanner(System.in);
        
        int count = 0;
        while (true) {
            System.out.print("请输入猜测（1-100）：");
            int guess = sc.nextInt();
            count++;
            
            if (guess > target) {
                System.out.println("猜大了");
            } else if (guess < target) {
                System.out.println("猜小了");
            } else {
                System.out.println("恭喜猜对！用了" + count + "次");
                break;
            }
        }
        sc.close();
    }
}
```

#### 📊 案例2：打印九九乘法表

```java
public class MultiplicationTable {
    public static void main(String[] args) {
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j + "×" + i + "=" + (i * j) + "\t");
            }
            System.out.println();
        }
    }
}
```

#### 🔢 案例3：判断素数

```java
public class PrimeNumber {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
        
        // 只需判断到 √n
        for (int i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }
    
    public static void main(String[] args) {
        // 输出 101-200 之间的素数
        for (int i = 101; i <= 200; i++) {
            if (isPrime(i)) {
                System.out.print(i + " ");
            }
        }
    }
}
```

---

## ❓ 问答

### Q1：if 和 switch 的使用场景区别？

**答**：
- **if**：支持区间判断（如 `score >= 60 && score < 80`）、多条件组合，更灵活。
- **switch**：仅支持等值判断，但代码更简洁，执行效率更高（跳转表实现）。
- **选择建议**：等值判断且 case 较多时用 switch，其他情况用 if。

### Q2：for、while、do-while 如何选择？

**答**：
- **for**：已知循环次数，结构紧凑（如遍历数组、固定次数操作）。
- **while**：未知循环次数，可能一次都不执行（如等待用户输入特定值）。
- **do-while**：未知循环次数，但至少执行一次（如菜单选择、登录验证）。

### Q3：break 和 continue 的区别？

**答**：
- **break**：终止整个循环，跳出循环体。
- **continue**：跳过本次循环剩余代码，进入下一次迭代。
- **类比**：break 是"退出游戏"，continue 是"跳过这一局，开始下一局"。

### Q4：switch 的穿透性是什么？如何利用？

**答**：
- **穿透性**：case 语句没有 break 时，会继续执行下一个 case 的语句体。
- **利用场景**：多个 case 逻辑相同时，可以共用语句体，简化代码。

```java
switch (month) {
    case 3:  // 穿透
    case 4:  // 穿透
    case 5:
        System.out.println("春季");  // 3、4、5月都输出春季
        break;
}
```

### Q5：如何避免死循环？

**答**：
- 确保循环条件最终会变为 `false`
- 循环体内要有改变条件的语句
- 使用 `break` 设置安全退出机制

```java
// 安全退出示例
int attempts = 0;
while (true) {
    if (attempts >= 3) {
        System.out.println("超过最大尝试次数");
        break;  // 安全退出
    }
    // 业务逻辑
    attempts++;
}
```

---

> 💡 **学习建议**：流程控制是编程的基础，建议多写练习，特别是嵌套循环和跳转语句的应用。理解每种结构的适用场景，选择合适的控制结构编写代码。
