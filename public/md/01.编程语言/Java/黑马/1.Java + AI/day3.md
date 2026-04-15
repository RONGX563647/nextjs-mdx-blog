# 【Java +AI ｜基础篇day3 流程控制】



## 一、核心概述

程序流程控制是控制代码执行顺序的核心技术，主要分为三大结构：**顺序结构**（自上而下默认执行）、**分支结构**（按条件选执行路径）、**循环结构**（重复执行指定代码），配合`break`/`continue`辅助控制，支撑各类复杂业务逻辑实现。

## 二、分支结构（条件选择执行）

### 1. if 分支（灵活判断，支持区间 / 多条件）

#### （1）三种核心形式

| 形式           | 格式                                                         | 适用场景                                         |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| 单条件判断     | `if (条件表达式) { 语句体; }`                                | 满足条件才执行某段代码                           |
| 二选一判断     | `if (条件表达式) { 语句体1; } else { 语句体2; }`             | 两种互斥场景选择（如登录成功 / 失败）            |
| 多条件区间判断 | `if (条件1) { 语句体1; } else if (条件2) { 语句体2; } ... else { 语句体n; }` | 多区间 / 多场景判断（如 BMI 等级、温度穿衣建议） |

#### （2）关键注意事项

- 条件表达式结果必须为`boolean`类型（`true`/`false`）；
- `if (条件)`后不能加`;`，否则语句体将不受条件控制；
- 若语句体仅一行代码，大括号可省略（建议保留，提升可读性）。

### 2. switch 分支（等值判断，格式优雅）

#### （1）核心格式与执行流程

java

```java
switch(表达式) {
    case 值1: 语句体1; break;
    case 值2: 语句体2; break;
    ...
    default: 语句体n; // 所有case不匹配时执行
}
```

- 执行流程：计算表达式值 → 匹配 case 值 → 执行对应语句体 → 遇`break`跳出分支（无`break`则穿透）。

#### （2）关键限制与注意事项

- 表达式类型支持：`byte`、`short`、`int`、`char`（JDK5 + 支持枚举，JDK7 + 支持 String），不支持`double`、`float`、`long`；
- case 值必须是字面量（不能是变量），且不可重复；
- 穿透性应用：多个 case 逻辑相同时，可省略部分`break`，让代码穿透到目标 case 执行（简化重复代码）。

#### （3）if 与 switch 对比

| 特性     | if 分支                        | switch 分支                      |
| -------- | ------------------------------ | -------------------------------- |
| 判断逻辑 | 支持区间、多条件组合（灵活）   | 仅支持等值判断（单一）           |
| 代码风格 | 适合复杂条件，逻辑直观         | 适合多等值场景，格式简洁、性能优 |
| 适用场景 | BMI 等级、温度区间、多条件校验 | 菜单选择、角色权限匹配、状态判断 |

## 三、循环结构（重复执行代码）

### 1. for 循环（已知循环次数，推荐首选）

#### （1）格式与执行流程

java

```java
for (初始化语句; 循环条件; 迭代语句) {
    循环体语句; // 重复执行的代码
}
```

- 执行流程：初始化语句（仅执行 1 次）→ 判断循环条件（`true`则执行循环体）→ 执行迭代语句 → 重复判断条件，直至`false`结束。

#### （2）典型应用场景

- 固定次数循环（如输出 10 次 HelloWorld、1-100 求和）；
- 遍历已知范围数据（如水仙花数查找、奇数和计算）。

### 2. while 循环（未知循环次数，灵活控制）

#### （1）格式与执行流程

java

```java
初始化语句;
while (循环条件) {
    循环体语句;
    迭代语句;
}
```

- 执行流程：初始化 → 判断条件（`true`执行循环体 + 迭代）→ 重复判断，直至`false`结束（先判断后执行）。

#### （2）典型应用场景

- 未知循环次数的场景（如纸张折叠到珠峰高度、复利翻倍计算）；
- 依赖外部条件终止的循环（如用户输入指定值退出）。

### 3. do-while 循环（先执行后判断，至少执行 1 次）

#### （1）格式与特点

java

```java
初始化语句;
do {
    循环体语句;
    迭代语句;
} while (循环条件);
```

- 核心特点：先执行 1 次循环体，再判断条件（确保循环至少执行 1 次）；
- 适用场景：必须执行 1 次的操作（如 12306 刷票、用户登录验证）。

### 4. 三种循环对比与选择

| 循环类型 | 核心特点                   | 适用场景               | 变量作用域             |
| -------- | -------------------------- | ---------------------- | ---------------------- |
| for      | 已知循环次数，结构紧凑     | 固定次数循环、范围遍历 | 循环变量仅在循环内有效 |
| while    | 未知循环次数，先判断后执行 | 外部条件控制的循环     | 循环变量在循环外可复用 |
| do-while | 未知循环次数，先执行后判断 | 必须执行 1 次的操作    | 循环变量在循环外可复用 |

- 功能等价性：三种循环可相互替代，优先按 “已知次数用 for，未知次数用 while，必须执行 1 次用 do-while” 选择。

### 5. 循环进阶用法

#### （1）死循环（无限执行，需手动终止）

- 常见写法：

  java

  ```java
  for (;;) { ... } // 经典写法
  while (true) { ... } // 最常用
  do { ... } while (true);
  ```

  

- 应用场景：服务器监听、游戏主循环、用户交互菜单（需配合`break`终止）。

#### （2）循环嵌套（循环内包含循环）

- 核心特点：**外循环每执行 1 次，内循环完整执行 1 轮**；
- 典型应用：打印图形（如矩形、三角形）、多层数据遍历（如表格数据）。

## 四、循环控制符（break/continue）

### 1. break（终止当前循环 /switch）

- 作用：跳出当前所在的循环（for/while/do-while）或 switch 分支；
- 注意：仅终止 “当前层级” 的循环，嵌套循环中不影响外层循环。

### 2. continue（跳过当前次，进入下一次）

- 作用：跳过循环体中剩余代码，直接执行下一次迭代（不终止循环）；
- 注意：仅在循环中使用，不能用于 switch 分支。

### 3. 用法示例

java

```java
// break：找到100以内第一个能被7整除的数，终止循环
for (int i = 1; i <= 100; i++) {
    if (i % 7 == 0) {
        System.out.println("第一个能被7整除的数：" + i);
        break; // 终止for循环
    }
}

// continue：打印1-10中的奇数（跳过偶数）
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue; // 跳过偶数，直接进入下一次循环
    }
    System.out.println(i);
}
```

## 五、综合实战案例（知识点整合）

### 1. 猜数字游戏（循环 + 分支 + 随机数）

- 核心逻辑：生成 1-100 随机数 → 死循环接收用户猜测 → 分支判断大小 → 猜中用`break`终止。
- 关键技术：`Random`生成随机数（导包→创建对象→`nextInt(n)`生成 0~n-1）。

### 2. 验证码生成（循环 + switch + 随机数）

- 核心逻辑：指定验证码长度（如 5 位）→ 循环生成每位字符（数字 / 大写字母 / 小写字母随机切换）→ 字符串拼接结果。
- 关键技巧：用`nextInt(3)`随机选择字符类型，配合 ASCII 码生成字母（A=65，a=97）。

### 3. 找素数（循环嵌套 + 分支）

- 需求：判断 101-200 之间的素数（仅能被 1 和自身整除）。
- 核心逻辑：外层循环遍历 101-200 → 内层循环判断是否能被 2~√n 整除 → 无整除则为素数。

### 4. 简单计算器（分支 + 输入输出）

- 核心逻辑：接收用户输入的两个数字和运算符 → switch 判断运算符 → 执行对应运算并输出结果。

## 六、核心避坑指南

1. 分支结构：if 条件表达式必须是`boolean`类型，避免用`=`代替`==`；switch 的 case 必须加`break`（除非需要穿透）。
2. 循环结构：避免遗漏迭代语句（导致死循环）；for 循环的初始化语句不能声明重复变量；while/do-while 需确保循环条件能终止。
3. 循环控制符：break 仅终止当前层级循环，嵌套循环需注意终止范围；continue 不能用于循环体外。
4. 随机数：`Random.nextInt(n)`生成 0~n-1 的数，生成指定范围（如 65-91）需用 “`nextInt(范围长度) + 起始值`”。



以下是在原有笔记基础上拓展的**更深入、更实用**的 Java 程序流程控制学习内容，补充了底层逻辑、实战技巧与真实场景应用：

## 二、分支结构（条件选择执行）补充

### 1. if 分支：深入技巧与场景拓展

#### （1）条件表达式的 “短路逻辑” 优化

if 的条件表达式支持`&&`（短路与）和`||`（短路或），利用其 “短路特性” 可提升效率并避免异常：

- **`&&`**：左侧为`false`时，右侧表达式**不执行**（如`if (obj != null && obj.getValue() > 0)`，先判断非空避免空指针）；
- **`||`**：左侧为`true`时，右侧表达式**不执行**（如`if (isAdmin || hasPermission())`，管理员直接通过，无需检查权限）。

**反例**：若写成`if (obj.getValue() > 0 && obj != null)`，当`obj`为`null`时会直接抛出`NullPointerException`。

#### （2）复杂条件的 “可读性重构”

多条件判断时，避免冗长的`if-else if`链，可通过 “变量提取” 或 “策略模式” 优化：

java



运行









```java
// 原始：冗长且难维护
if (score >= 90 && score <= 100) {
    grade = "优秀";
} else if (score >= 80 && score < 90) {
    grade = "良好";
} 
// ... 更多条件

// 优化：提取条件变量，逻辑更清晰
boolean isExcellent = score >= 90 && score <= 100;
boolean isGood = score >= 80 && score < 90;
if (isExcellent) { ... } else if (isGood) { ... }
```

**真实场景**：电商订单状态判断（待支付、已支付、已发货等），通过提取`isPaid()`、`isShipped()`等方法，让分支逻辑更直观。

### 2. switch 分支：JDK 新特性与高级用法

#### （1）JDK 12+ 增强 switch（箭头语法与 yield）

传统 switch 需要`break`避免穿透，JDK12 引入**箭头语法**（`->`）自动终止，且支持`yield`返回值：

java



运行









```java
// 增强版：简洁且无穿透问题
int day = 3;
String week = switch (day) {
    case 1 -> "周一";
    case 2 -> "周二";
    case 3 -> "周三";
    default -> "未知"; // 无需break，自动跳出
};

// 带逻辑块的yield返回
int num = 2;
String result = switch (num) {
    case 1 -> {
        System.out.println("处理1");
        yield "one"; // 返回值
    }
    case 2 -> {
        System.out.println("处理2");
        yield "two";
    }
    default -> "other";
};
```

**优势**：减少`break`遗漏导致的逻辑错误，支持直接返回值，更适合作为 “表达式” 使用（如赋值、参数传递）。

#### （2）穿透性的合理应用（而非禁用）

穿透性并非缺陷，在 “多值对应同一逻辑” 场景下可简化代码：

java



运行









```java
// 示例：判断季节（3-5春，6-8夏，9-11秋，12-2冬）
int month = 4;
String season = switch (month) {
    case 3,4,5 -> "春季"; // 多case合并（JDK14+）
    case 6,7,8 -> "夏季";
    case 9,10,11 -> "秋季";
    case 12,1,2 -> "冬季";
    default -> "无效月份";
};
```

**注意**：传统写法中，若需穿透，需显式去掉`break`，但需注释说明（避免他人误改）：

java



运行









```java
case 12:
case 1:
case 2: 
    season = "冬季"; 
    break; // 最后一个case加break
```

#### （3）switch vs if 的性能差异

- **switch**：编译时会将`case`值转换为 “跳转表”（类似数组索引），匹配时直接定位，**O (1) 时间复杂度**，适合多等值判断（如 10 + 个 case）；

- if-else

  ：按顺序逐个判断，

  O (n) 时间复杂度

  ，适合少量条件或区间判断。

  

  场景选择

  ：角色权限判断（10 + 种角色）用 switch，而年龄区间判断（如儿童 / 青年 / 中年）用 if 更合适。

## 三、循环结构（重复执行代码）补充

### 1. for 循环：高级用法与性能细节

#### （1）增强 for 循环（foreach）的底层与限制

用于遍历数组或集合，语法简洁，但**不支持修改元素（值传递）** 且**无法获取索引**：

java



运行









```java
int[] arr = {1,2,3};
for (int num : arr) { 
    num *= 2; // 无效！仅修改临时变量，原数组不变
}
// 原数组仍为 {1,2,3}
```

**适用场景**：仅需读取元素（如打印集合内容），无需修改或索引；若需修改，仍用普通 for 循环。

#### （2）循环变量的作用域陷阱

for 循环的初始化语句中声明的变量，仅在循环内有效，避免重复声明导致编译错误：

java



运行









```java
for (int i = 0; i < 5; i++) { ... }
// System.out.println(i); // 编译报错：i未定义

// 正确：若需循环外使用变量，在外部声明
int i;
for (i = 0; i < 5; i++) { ... }
System.out.println(i); // 输出5（循环结束后的值）
```

### 2. 循环嵌套：效率优化核心技巧

嵌套循环的时间复杂度是`外层次数 × 内层次数`，优化核心是**减少内层循环的执行次数**：

**反例**：双层循环求 1-100 的素数，内层循环从 2 遍历到 n-1

java



运行









```java
for (int n = 101; n <= 200; n++) {
    boolean isPrime = true;
    for (int i = 2; i < n; i++) { // 低效：i无需到n-1
        if (n % i == 0) {
            isPrime = false;
            break;
        }
    }
}
```

**优化**：内层循环仅需到`√n`（若 n 有因子，必有一个≤√n），且跳过偶数

java



运行









```java
for (int n = 101; n <= 200; n += 2) { // 跳过偶数（除2外偶数都不是素数）
    boolean isPrime = true;
    for (int i = 3; i <= Math.sqrt(n); i += 2) { // 仅判断奇数因子
        if (n % i == 0) {
            isPrime = false;
            break;
        }
    }
}
```

**效果**：外层循环次数减少一半，内层循环次数减少至√n/2，效率大幅提升。

### 3. 死循环的 “安全退出” 机制

死循环需配合`break`手动终止，实际开发中需避免 “无法退出” 的风险，常用策略：

- **计数器限制**：防止无限执行（如最多尝试 3 次）；
- **超时控制**：超过指定时间强制退出（需结合时间戳）。

java



运行









```java
// 示例：用户登录（最多3次机会）
int maxAttempts = 3;
int attempts = 0;
while (true) {
    if (attempts >= maxAttempts) {
        System.out.println("超过最大尝试次数，退出");
        break;
    }
    // 输入密码并验证
    if (isValidPassword(input)) {
        System.out.println("登录成功");
        break;
    }
    attempts++;
}
```

## 四、循环控制符（break/continue）补充

### 1. 带标签的 break/continue（嵌套循环专用）

默认`break`/`continue`仅作用于当前循环，带标签（`label:`）可控制外层循环：

java



运行









```java
// 示例：找到二维数组中第一个偶数，终止所有循环
int[][] matrix = {{1,3,5}, {2,4,6}, {7,8,9}};
outer: // 外层循环标签
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] % 2 == 0) {
            System.out.println("找到偶数：" + matrix[i][j]);
            break outer; // 终止外层循环
        }
    }
}
```

**注意**：标签名需与循环绑定，且仅建议在两层嵌套中使用（多层嵌套易导致代码混乱）。

### 2. continue 在不同循环中的差异

- **for 循环**：`continue`后会自动执行 “迭代语句”（如`i++`）；
- **while 循环**：`continue`后需手动执行迭代（否则可能死循环）。

java



运行









```java
// for循环：continue后自动i++
for (int i = 0; i < 3; i++) {
    if (i == 1) continue;
    System.out.println(i); // 输出0、2
}

// while循环：需手动迭代，否则i=1时会无限循环
int i = 0;
while (i < 3) {
    if (i == 1) {
        i++; // 必须手动i++，否则continue后i始终为1
        continue;
    }
    System.out.println(i);
    i++;
}
```

## 五、综合实战案例：深度优化与场景细节

### 1. 猜数字游戏（升级版）

**核心优化**：限制猜测次数、显示已猜次数、提示最近两次猜测的偏差趋势。

java



运行









```java
import java.util.Random;
import java.util.Scanner;

public class GuessNumber {
    public static void main(String[] args) {
        Random random = new Random();
        int target = random.nextInt(100) + 1; // 1-100
        Scanner sc = new Scanner(System.in);
        int maxTries = 7;
        int tries = 0;
        int lastDiff = 0; // 记录上一次的差值

        while (tries < maxTries) {
            tries++;
            System.out.printf("第%d次猜测（1-100）：", tries);
            int guess = sc.nextInt();

            if (guess == target) {
                System.out.println("恭喜猜对！用了" + tries + "次");
                break;
            }

            int currentDiff = Math.abs(guess - target);
            if (tries > 1) {
                // 提示趋势（更近/更远）
                if (currentDiff < lastDiff) {
                    System.out.println("比上一次更接近了！");
                } else {
                    System.out.println("比上一次更远了！");
                }
            }

            System.out.println(guess > target ? "猜大了" : "猜小了");
            lastDiff = currentDiff;
        }

        if (tries >= maxTries) {
            System.out.println("次数用尽，答案是：" + target);
        }
        sc.close();
    }
}
```

### 2. 验证码生成（防混淆版）

**核心优化**：排除易混淆字符（0 与 O、1 与 l、I），确保可读性。

java



运行









```java
import java.util.Random;

public class CaptchaGenerator {
    public static String generate(int length) {
        // 可用字符：排除0,O,1,l,I
        String digits = "23456789";
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 无O
        String lower = "abcdefghjkmnpqrstuvwxyz"; // 无l
        String all = digits + upper + lower;

        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(all.length());
            sb.append(all.charAt(index));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println("验证码：" + generate(6)); // 如：K3f7Q2
    }
}
```

## 六、避坑指南（新增高频问题）

1. **if-else 的 “悬挂 else” 问题**

   省略大括号时，else 默认匹配最近的 if，易导致逻辑错误：

   java

   

   运行

   

   

   

   

   ```java
   // 错误示例：else实际匹配内层if，而非外层
   if (a > 0)
       if (b > 0)
           System.out.println("both >0");
   else // 实际属于内层if的else
       System.out.println("a <=0");
   
   // 正确：加括号明确层级
   if (a > 0) {
       if (b > 0) {
           System.out.println("both >0");
       }
   } else {
       System.out.println("a <=0");
   }
   ```

   

2. **switch 的 case 值类型错误**

   若表达式为`long`，即使 case 值是 int 也会编译失败（long 范围大于 int，无法隐式转换）：

   java

   

   运行

   

   

   

   

   ```java
   long num = 10;
   switch (num) {
       // case 10: ... 编译报错：不支持long类型
   }
   ```

   

3. **循环中修改循环变量导致逻辑混乱**

   避免在循环体中随意修改循环变量（如 for 循环中手动`i++`）：

   java

   

   运行

   

   

   

   

   ```java
   // 易错：循环体中i++导致跳过元素
   for (int i = 0; i < 5; i++) {
       System.out.println(i);
       i++; // 实际i每次+2，输出0、2、4
   }
   ```

   

通过以上补充，不仅深化了基础语法的理解，更结合实际开发场景提供了可直接复用的技巧与避坑方案，帮助在复杂业务逻辑中更高效地使用流程控制。

# Java 程序流程控制 5 道深度面试题（含场景 + 答案）

## 面试题 1（分支结构深度对比）

### 场景

面试官：“以下两段代码分别用 if 和 switch 实现相同的业务逻辑（根据会员等级发放优惠券），请分析运行结果并解释原因，同时说明 switch 穿透性的适用场景和风险，以及 if 和 switch 在底层执行效率上的差异。”

java



运行









```java
// 代码1：if分支实现
public class MemberDemo1 {
    public static void main(String[] args) {
        String memberLevel = "VIP2";
        int coupon = 0;
        if ("VIP1".equals(memberLevel)) {
            coupon = 10;
        } else if ("VIP2".equals(memberLevel)) {
            coupon = 20;
        } else if ("VIP3".equals(memberLevel)) {
            coupon = 50;
        } else {
            coupon = 5;
        }
        System.out.println("if分支优惠券：" + coupon);
    }
}

// 代码2：switch分支实现（故意遗漏部分break）
public class MemberDemo2 {
    public static void main(String[] args) {
        String memberLevel = "VIP2";
        int coupon = 0;
        switch (memberLevel) {
            case "VIP1":
                coupon = 10;
            case "VIP2":
                coupon += 20;
            case "VIP3":
                coupon += 30;
                break;
            default:
                coupon = 5;
        }
        System.out.println("switch分支优惠券：" + coupon);
    }
}
```

### 问题

1. 两段代码的运行结果分别是什么？
2. 代码 2 中 switch 分支的执行流程是什么？switch 穿透性的适用场景和潜在风险是什么？
3. if 和 switch 在底层执行效率上有何差异？分别适合什么业务场景？

------

## 面试题 2（循环嵌套 + break/continue 控制）

### 场景

面试官：“以下代码是一个嵌套循环案例，用于查找 100-200 之间的所有‘双素数对’（两个连续奇数均为素数，如 3 和 5、5 和 7），代码中存在逻辑错误导致结果异常，请找出错误并修复，同时解释 break 和 continue 在嵌套循环中的作用范围，以及如何实现‘终止外层循环’。”

java



运行









```java
public class TwinPrimeDemo {
    public static void main(String[] args) {
        System.out.println("100-200之间的双素数对：");
        for (int i = 101; i <= 199; i += 2) {
            int j = i + 2;
            if (isPrime(i) && isPrime(j)) {
                System.out.println(i + "和" + j);
                continue;
            }
            break;
        }
    }

    // 判断是否为素数（仅能被1和自身整除）
    private static boolean isPrime(int num) {
        if (num < 2) return false;
        for (int k = 2; k < num; k++) {
            if (num % k == 0) {
                continue;
            }
        }
        return true;
    }
}
```

### 问题

1. 代码中存在哪些逻辑错误？请逐一指出并说明原因。
2. 修复后的完整代码是什么？
3. break 和 continue 在嵌套循环中默认作用于哪一层？如何实现 “终止外层循环”（举例说明）？

------

## 面试题 3（综合循环 + 分支 + 随机数：抽奖系统）

### 场景

面试官：“请设计一个抽奖系统，满足以下需求，考察你对循环、分支、随机数的综合运用能力：”

### 需求

1. 奖项设置：一等奖（10% 概率）、二等奖（20% 概率）、三等奖（30% 概率）、谢谢参与（40% 概率）；
2. 每个用户每天最多抽奖 3 次，抽奖次数耗尽后提示 “今日抽奖次数已用完”；
3. 抽中一等奖后直接终止当日抽奖（不再允许后续抽奖）；
4. 输出每次抽奖结果和剩余次数。

### 问题

1. 编写完整的抽奖系统代码（使用 Scanner 接收用户输入，Random 生成随机数）。
2. 代码中如何控制抽奖概率？核心逻辑是什么？
3. 如何确保抽中一等奖后终止当日抽奖？用到了哪些流程控制技术？

------

## 面试题 4（死循环 + 条件终止：用户交互菜单）

### 场景

面试官：“以下是一个简化的用户交互菜单代码，用于实现‘学生信息管理系统’的主菜单，但存在循环终止逻辑错误和用户输入异常问题，请修复代码并解释死循环的实际应用场景，以及如何优雅地终止死循环。”

java



运行









```java
import java.util.Scanner;

public class StudentMenuDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (true) {
            System.out.println("=== 学生信息管理系统 ===");
            System.out.println("1. 查看学生信息");
            System.out.println("2. 添加学生信息");
            System.out.println("3. 退出系统");
            System.out.print("请选择功能（1-3）：");
            int choice = sc.nextInt();
            
            if (choice == 1) {
                System.out.println("查看学生信息...");
            } else if (choice == 2) {
                System.out.println("添加学生信息...");
            } else if (choice == 3) {
                System.out.println("退出系统...");
            } else {
                System.out.println("输入错误，请重新选择！");
            }
        }
    }
}
```

### 问题

1. 代码中存在哪些问题？请指出并修复。
2. 死循环的实际应用场景有哪些？除了`while (true)`，还有哪些死循环写法？
3. 终止死循环的常见方式有哪些？本案例中最适合用哪种方式？为什么？

------

## 面试题 5（算法优化：素数判断的循环效率）

### 场景

面试官：“素数判断是循环结构的经典应用，以下代码用于统计 1-10000 之间的素数个数，但循环效率较低，请分析低效原因并优化代码，同时解释优化思路和数学原理。”

java



运行









```java
public class PrimeCountDemo {
    public static void main(String[] args) {
        int count = 0;
        for (int i = 2; i <= 10000; i++) {
            if (isPrime(i)) {
                count++;
            }
        }
        System.out.println("1-10000之间的素数个数：" + count);
    }

    private static boolean isPrime(int num) {
        for (int j = 2; j < num; j++) {
            if (num % j == 0) {
                return false;
            }
        }
        return true;
    }
}
```

### 问题

1. 原代码的低效原因是什么？时间复杂度是多少？
2. 优化后的代码是什么？优化思路和数学原理是什么？
3. 进一步优化（如筛选法）的核心逻辑是什么？请简要描述实现步骤。

------

# 参考答案

## 面试题 1 参考答案

### 1. 运行结果

- 代码 1（if 分支）：`if分支优惠券：20`；
- 代码 2（switch 分支）：`switch分支优惠券：50`。

### 2. switch 执行流程与穿透性分析

- 代码 2 执行流程：
  1. `memberLevel="VIP2"`，匹配`case "VIP2"`；
  2. 执行`coupon +=20`（coupon=20）；
  3. 无`break`，触发穿透，执行`case "VIP3"`的`coupon +=30`（coupon=50）；
  4. 遇`break`，跳出 switch 分支，最终输出 50。
- 穿透性适用场景：多个 case 逻辑相同时（如周一至周三执行相同代码），可省略中间 case 的`break`，简化代码；
- 潜在风险：忘记加`break`导致逻辑穿透，出现非预期结果（如本案例误加 30 优惠券）。

### 3. if 与 switch 效率差异与场景选择

- 效率差异：
  - switch：底层通过 “跳转表” 实现，等值匹配时直接定位 case，效率高于 if（尤其 case 数量多时）；
  - if：需依次判断条件，适合少量条件或区间判断，数量越多效率越低。
- 场景选择：
  - if：区间判断（如 BMI 等级、温度范围）、多条件组合（如`age>18 && score>=60`）；
  - switch：等值判断（如菜单选择、会员等级、状态码匹配），代码更简洁优雅。

## 面试题 2 参考答案

### 1. 存在的逻辑错误

- 错误 1：外层循环中`break`位置错误，导致仅判断第一个数（101 和 103）后就终止循环，无法遍历所有数；
- 错误 2：`isPrime`方法中`continue`使用错误，应改为`return false`（当前数能被整除，直接判定为非素数），原代码会继续循环，最终误判非素数为素数；
- 错误 3：`isPrime`方法中循环条件`k < num`效率低，可优化为`k <= Math.sqrt(num)`（大于根号 num 的因数无需判断）。

### 2. 修复后的完整代码

java



运行









```java
public class TwinPrimeDemo {
    public static void main(String[] args) {
        System.out.println("100-200之间的双素数对：");
        for (int i = 101; i <= 199; i += 2) {
            int j = i + 2;
            if (isPrime(i) && isPrime(j)) {
                System.out.println(i + "和" + j);
            }
            // 移除错误的break，确保遍历所有奇数
        }
    }

    private static boolean isPrime(int num) {
        if (num < 2) return false;
        // 优化循环条件：仅判断到根号num，减少循环次数
        for (int k = 2; k <= Math.sqrt(num); k++) {
            if (num % k == 0) {
                return false; // 能被整除，非素数
            }
        }
        return true;
    }
}
```

### 3. break/continue 作用范围与外层循环终止

- 默认作用范围：break 和 continue 仅作用于 “当前所在的最内层循环”；

- 终止外层循环的方式：使用 “标签（label）”，示例：

  java

  

  运行

  

  

  

  

  ```java
  outer: for (int i = 0; i < 5; i++) { // 外层循环标签outer
      for (int j = 0; j < 3; j++) {
          if (j == 1) {
              break outer; // 终止外层循环
          }
          System.out.println(i + "," + j);
      }
  }
  ```

  

## 面试题 3 参考答案

### 1. 完整抽奖系统代码

java



运行









```java
import java.util.Random;
import java.util.Scanner;

public class LotterySystem {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Random random = new Random();
        int maxTimes = 3; // 每日最大抽奖次数
        int remainingTimes = maxTimes; // 剩余次数

        while (remainingTimes > 0) {
            System.out.print("是否参与抽奖（y/n）：");
            String choice = sc.next();
            if (!"y".equalsIgnoreCase(choice)) {
                System.out.println("已取消抽奖，今日剩余次数：" + remainingTimes);
                continue;
            }

            // 生成0-99的随机数，控制概率
            int randomNum = random.nextInt(100);
            String award = "";
            boolean isFirstAward = false;

            // 概率判断：0-9（10%）一等奖，10-29（20%）二等奖，30-59（30%）三等奖，60-99（40%）谢谢参与
            if (randomNum < 10) {
                award = "一等奖（10元优惠券）";
                isFirstAward = true;
            } else if (randomNum < 30) {
                award = "二等奖（5元优惠券）";
            } else if (randomNum < 60) {
                award = "三等奖（2元优惠券）";
            } else {
                award = "谢谢参与";
            }

            // 输出结果
            remainingTimes--;
            System.out.println("抽奖结果：" + award + "，今日剩余次数：" + remainingTimes);

            // 抽中一等奖，终止当日抽奖
            if (isFirstAward) {
                System.out.println("恭喜抽中一等奖，今日抽奖结束！");
                break;
            }
        }

        if (remainingTimes == 0) {
            System.out.println("今日抽奖次数已用完，明日再来！");
        }
        sc.close();
    }
}
```

### 2. 概率控制核心逻辑

- 利用`Random.nextInt(100)`生成 0-99 的随机数（共 100 个可能值）；
- 按概率分配区间：一等奖占 10 个值（0-9）、二等奖占 20 个值（10-29）、三等奖占 30 个值（30-59）、谢谢参与占 40 个值（60-99）；
- 核心原理：随机数在每个区间的分布概率与区间长度成正比，实现指定概率控制。

### 3. 一等奖终止逻辑

- 定义`isFirstAward`布尔变量，标记是否抽中一等奖；
- 抽中后设置`isFirstAward=true`，执行`break`终止死循环（`while (remainingTimes > 0)`），实现当日抽奖终止；
- 用到的流程控制技术：`break`终止循环、布尔变量标记状态、`while`循环控制抽奖次数。

## 面试题 4 参考答案

### 1. 代码问题与修复

- 存在问题：

  1. 选择 “3. 退出系统” 时无终止循环逻辑，导致死循环无法退出；
  2. 若用户输入非整数（如字母、符号），调用`sc.nextInt()`会抛出`InputMismatchException`，程序崩溃。

- 修复后的代码：

  java

  

  运行

  

  

  

  

  ```java
  import java.util.Scanner;
  
  public class StudentMenuDemo {
      public static void main(String[] args) {
          Scanner sc = new Scanner(System.in);
          while (true) {
              System.out.println("=== 学生信息管理系统 ===");
              System.out.println("1. 查看学生信息");
              System.out.println("2. 添加学生信息");
              System.out.println("3. 退出系统");
              System.out.print("请选择功能（1-3）：");
  
              // 处理非整数输入
              if (!sc.hasNextInt()) {
                  System.out.println("输入错误，请输入1-3的整数！");
                  sc.next(); // 清空无效输入
                  continue;
              }
  
              int choice = sc.nextInt();
              if (choice == 1) {
                  System.out.println("查看学生信息...");
              } else if (choice == 2) {
                  System.out.println("添加学生信息...");
              } else if (choice == 3) {
                  System.out.println("退出系统...");
                  break; // 终止死循环
              } else {
                  System.out.println("输入错误，请重新选择！");
              }
          }
          sc.close();
      }
  }
  ```

  

### 2. 死循环应用场景与写法

- 应用场景：服务器监听、用户交互菜单、游戏主循环、消息队列消费等（需要持续运行的业务）；

- 常见写法：

  java

  

  运行

  

  

  

  

  ```java
  for (;;) { ... } // 经典写法，无初始化、条件、迭代
  while (true) { ... } // 最常用
  do { ... } while (true); // 先执行后判断，至少执行1次
  ```

  

### 3. 死循环终止方式与选择

- 常见终止方式：
  1. `break`语句：直接终止当前循环（本案例首选，简单直接）；
  2. 条件变量控制：`while (flag) { ... flag = false; ... }`（适合复杂终止条件）；
  3. `return`语句：直接返回方法，间接终止循环；
  4. 抛出异常：通过异常中断循环（不推荐，用于异常场景）。
- 本案例选择`break`的原因：退出逻辑简单明确，仅在选择 “3” 时终止，无需额外变量，代码简洁高效。

## 面试题 5 参考答案

### 1. 原代码低效原因与时间复杂度

- 低效原因：
  1. `isPrime`方法中循环条件`j < num`，需遍历从 2 到 num-1 的所有数，冗余判断（如判断 10000 是否为素数，需循环 9998 次）；
  2. 未排除偶数（除 2 外，所有偶数均非素数），增加无效循环。
- 时间复杂度：O (n²)（外层循环 n 次，内层循环平均 n/2 次）。

### 2. 优化后的代码与思路

- 优化代码：

  java

  

  运行

  

  

  

  

  ```java
  public class PrimeCountDemo {
      public static void main(String[] args) {
          int count = 0;
          if (2 <= 10000) count++; // 2是唯一的偶素数
          // 仅遍历奇数，减少一半循环
          for (int i = 3; i <= 10000; i += 2) {
              if (isPrime(i)) {
                  count++;
              }
          }
          System.out.println("1-10000之间的素数个数：" + count);
      }
  
      private static boolean isPrime(int num) {
          // 优化循环条件：仅判断到根号num（因数成对出现，大于根号num的因数无需判断）
          for (int j = 3; j <= Math.sqrt(num); j += 2) {
              if (num % j == 0) {
                  return false;
              }
          }
          return true;
      }
  }
  ```

  

- 优化思路与数学原理：

  1. 排除偶数：除 2 外，所有偶数均能被 2 整除，无需判断；
  2. 循环条件优化：若 num 存在因数 a 和 b（a≤b），则 a≤√num、b≥√num，只需判断到√num 即可，减少循环次数；
  3. 内层循环步长为 2：仅判断奇数因数，进一步减少无效判断。

- 优化后时间复杂度：O (n√n/4)，效率提升显著。

### 3. 进一步优化（筛选法）核心逻辑

- 核心原理：利用 “素数的倍数一定是非素数”，一次性标记所有非素数，无需逐个判断；
- 实现步骤：
  1. 创建布尔数组`isPrime`，长度为 10001，初始值`true`（默认所有数为素数）；
  2. 设`isPrime[0] = isPrime[1] = false`（0 和 1 非素数）；
  3. 遍历 2 到√10000，若当前数为素数，则标记其所有倍数为非素数；
  4. 统计数组中`true`的个数，即为素数个数；
- 筛选法时间复杂度：O (n log log n)，适合大规模素数统计（如 100 万以上）。