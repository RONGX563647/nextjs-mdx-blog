# CS61C 第一节课超详细学习笔记：课程全景与核心基石

# 理论

## 一、课程元信息与定位

### 1. 课程全称与代码

- 全称：*“Great Ideas in Computer Architecture (a.k.a. Machine Structures)”*（计算机体系结构中的伟大思想，又名 “机器结构”）。
- 定位：UC Berkeley 计算机科学**核心进阶课**，是 **CS61A（编程方法）**、**CS61B（数据结构）** 的后续延伸，聚焦 “**硬件如何支撑软件运行**” 与 “**软硬件协同优化系统性能**”。

### 2. 先修要求与目标受众

- 先修基础：需掌握 **C 语言**（或通过 CS61A/61B 等效掌握 “编程逻辑、指针、数据结构”）。
- 目标：让学生从 “**软件开发者视角**” 理解硬件，能回答 “为什么这段代码在架构 A 上快、架构 B 上慢？”“如何为特定硬件优化程序？” 等问题。

### 3. 授课形式与考核

- 授课形式：**讲座（Lecture）**（讲解理论） + **讨论课（Discussion）**（深入习题与案例） + **实验（Lab）**（验证性实践） + **项目（Project）**（创造性工程实践）。
- 考核占比：
  - 项目（~50%）：核心是 “动手设计 / 实现硬件或优化软件”（如 RISC-V CPU 设计、并行程序优化）。
  - 考试（~30%）：闭卷，考察 “理论应用 + 案例分析”（非死记硬背）。
  - 实验与作业（~20%）：小实验（如 Cache 命中率模拟）+ 编程作业（如 C 语言内存优化）。

## 二、计算机体系结构的 “六大伟大思想”（深度拆解）

### 1. Abstraction（抽象）

#### 定义与价值

- 定义：通过**层次化隐藏细节**，将复杂系统拆分为 “用户可见层” 和 “底层实现层”，降低认知与设计复杂度。
- 价值：让不同层级的开发者专注自身任务（如应用开发者无需关心 “CPU 如何执行指令”，硬件工程师无需关心 “App 如何写界面”）。

#### 硬件中的分层抽象示例

| 抽象层级         | 用户视角（可见）            | 底层实现（隐藏）                              |
| ---------------- | --------------------------- | --------------------------------------------- |
| 高级语言（如 C） | `int a = b + c;`            | 编译为**多条机器指令**（如取数、加法、存数）  |
| 指令集（ISA）    | `add a, b, c`（加法指令）   | 逻辑门组合电路（如全加器、寄存器组）          |
| 逻辑门           | 与门（AND）、或门（OR）     | 晶体管开关（MOSFET，通过电场控制导通 / 截止） |
| 晶体管           | 开关特性（开 / 关对应 0/1） | 半导体物理（PN 结、载流子迁移）               |

#### 代码示例：C 语言的 “抽象” 特性

c

```c
// 开发者只需调用 sqrt 函数，无需关心“平方根如何计算”（底层由硬件/数学库实现）
#include <math.h>
int main() {
    double x = 2.0;
    double root = sqrt(x); // 抽象：隐藏了“平方根算法”与“硬件执行细节”
    return 0;
}
```

### 2. Moore’s Law（摩尔定律）

#### 原始表述与历史

- 1965 年 Intel 联合创始人 **Gordon Moore** 提出：集成电路上的**晶体管数量**每 18–24 个月翻一番。
- 早期验证：
  - 1971 年，Intel 4004 芯片（世界首款微处理器）含 **2300 个晶体管**；
  - 1997 年，Intel 奔腾 II 芯片含 **750 万个晶体管**；
  - 2020 年，AMD 锐龙 9 芯片含 **超 100 亿个晶体管**。

#### 发展瓶颈与转型方向

- **瓶颈**：约 2005 年后，晶体管尺寸接近**原子级**（~10nm 量级），“尺寸缩小→性能提升” 的规律因两大问题失效：
  - **量子隧穿效应**：晶体管太小时，电流会 “失控泄漏”，无法稳定表示 0/1；
  - **散热问题**：晶体管密度过高，热量无法及时散出，导致芯片过热降频。
- **转型方向**：
  - **架构优化**：从 “单核高频” 转向 “**多核并行**”（如现代 CPU 多为 8 核、16 核）；
  - **专用加速**：为特定任务设计**专用硬件**（如 GPU 用于图形渲染，TPU 用于 AI 计算）；
  - **异构计算**：CPU + 专用芯片协同工作（如手机的 “CPU + NPU（神经网络处理单元）”）。

### 3. Principle of Locality & Memory Hierarchy（局部性原理与存储层次）

#### 局部性原理：程序的 “访问偏好”

程序访问数据具有**倾向性**，分为两类：

- **时间局部性**：**近期访问过的数据，未来更可能再被访问**（如循环变量 `i` 在每次循环中都被使用）。
- **空间局部性**：**访问某个地址时，其相邻地址更可能被访问**（如数组 `int arr[100]` 按顺序遍历）。

#### 存储层次结构：速度与容量的平衡

现代计算机存储是 **“金字塔” 结构 **，利用 “局部性” 优化访问效率（越顶层速度越快、容量越小、成本越高）：

| 存储层级        | 访问延迟（典型值） | 容量（典型值）    | 成本（每 GB） | 依赖的局部性         |
| --------------- | ------------------ | ----------------- | ------------- | -------------------- |
| 寄存器          | ~0.5 ns            | ~ 几百字节        | 极高          | 时间局部性（频繁用） |
| L1 Cache        | ~1 ns              | ~ 几 KB–几十 KB   | 高            | 时间 + 空间局部性    |
| L2 Cache        | ~3 ns              | ~ 几十 KB–几百 KB | 中高          | 时间 + 空间局部性    |
| L3 Cache        | ~10 ns             | ~ 几 MB–几十 MB   | 中            | 时间 + 空间局部性    |
| 主存（DRAM）    | ~100 ns            | ~ 几 GB–几十 GB   | 中低          | 空间局部性（预取）   |
| 磁盘（SSD/HDD） | ~100 μs–10 ms      | ~ 几百 GB–几 TB   | 低            | 无（纯容量层）       |

#### 代码示例：利用 “空间局部性” 优化 Cache 命中率

c

```c
// 反例：差的空间局部性（列优先遍历二维数组，Cache 命中率低）
int sum = 0;
int arr[1000][1000];
for (int j = 0; j < 1000; j++) {
    for (int i = 0; i < 1000; i++) {
        sum += arr[i][j]; // 数组在内存中“按行存储”，列遍历导致频繁 Cache 失效
    }
}

// 正例：好的空间局部性（行优先遍历，Cache 命中率高）
for (int i = 0; i < 1000; i++) {
    for (int j = 0; j < 1000; j++) {
        sum += arr[i][j]; // 连续访问“相邻内存地址”，利用空间局部性
    }
}
```

### 4. Parallelism（并行性）

#### 并行的三类核心形式

并行是 “提升系统性能” 的核心思想，分为三类：



- **指令级并行（ILP）**：CPU 内部**同时执行多条指令**（如**流水线技术**：将 “取指、译码、执行、访存、写回” 五个阶段 “重叠进行”）。
  - 示例：CPU 在 “执行指令 A” 的同时，对 “指令 B” 进行 “取指”，从而提升单位时间内的指令吞吐量。
- **线程级并行（TLP）**：多个**线程 / 进程同时执行**（如多核 CPU 上，一个核运行 “线程 A”，另一个核运行 “线程 B”）。
  - 示例：Web 服务器用多线程 “同时处理多个用户请求”。
- **数据级并行（DLP）**：对**多组数据同时执行相同操作**（如 **SIMD 指令**：单条指令可同时处理 “4 个浮点数加法”）。
  - 示例：图像处理中，“同时对多个像素” 进行亮度调整。

#### Amdahl 定律：并行的 “理论上限”

公式：\(\text{加速比} = \frac{1}{(1 - p) + \frac{p}{s}}\)，其中：

- p：程序中 “可并行部分的比例”；
- s：并行度（如多少个核同时工作）。
- 结论：**程序的加速比受限于 “必须串行的部分”**。例如，若程序有 40% 必须串行（\(p = 0.6\)），即使 “无限并行”（\(s \to \infty\)），加速比最多为 \(1 / 0.4 = 2.5\) 倍。

### 5. Performance Measurement & Improvement（性能衡量与优化）

#### 核心性能指标

- **延迟（Latency）**：完成**单个任务**的**总时间**（如 “从发送网络请求到收到响应” 的耗时）。
- **吞吐量（Throughput）**：单位时间内完成的**任务数量**（如 “服务器每秒处理的请求数”）。

#### 优化方向：“延迟” vs “吞吐量”

- **低延迟优化**：让 “单个任务” 尽快完成（如数据库用 “索引” 加速 “单条查询”）。
- **高吞吐量优化**：让系统 “单位时间内完成更多任务”（如 Web 服务器用 “多线程” 同时处理请求）。

#### 指令集与性能：RISC vs CISC

- **CISC（复杂指令集，如 x86）**：指令功能 “强而复杂”（如一条指令可完成 “从内存取数 + 乘法 + 存回内存”），但**硬件实现复杂**，导致 “单条指令延迟高”。
- **RISC（精简指令集，如 RISC-V）**：指令功能 “简单精简”（每条指令只做 “一件事”），**硬件实现更高效**，因此 “指令吞吐量高”。
- CS61C 选择 **RISC-V** 作为教学指令集：开源、模块化、易上手，适合学习 “指令如何映射到硬件”。

### 6. Dependability via Redundancy（通过冗余实现可靠性）

#### 核心逻辑

系统中加入**冗余组件**，当某部分 “故障” 时，冗余部分可 “接管工作”，保证整体不失效。

#### 硬件冗余示例

- ** 
-  RAID 磁盘阵列**：多块磁盘 “同时存储数据”，若一块磁盘损坏，可从其他磁盘 “恢复数据”（如 RAID 5 允许 “单盘故障”）。
- **冗余电源**：服务器配备 “多个电源”，一个故障后，另一个自动供电，保证系统不停机。

#### 软件与工程冗余示例

- **错误校验码（ECC）**：内存中存储 “额外校验位”，可 “检测并纠正单比特错误”（避免因内存错误导致程序崩溃）。
- **备份与恢复**：数据库 “定期备份”，系统崩溃后可从备份恢复数据。

## 三、数制与数据表示（硬件与软件的桥梁）

### 1. 二进制与进制转换

计算机以**二进制**为基础（晶体管 “开 / 关” 状态对应 0/1）。

- 转换示例：
  - 十进制 `10` → 二进制 `1010`（\(10 = 8 + 2 = 2^3 + 2^1\)）。
  - 二进制 `1010` → 十六进制 `0xA`（每 4 位二进制对应 1 位十六进制）。

### 2. 有符号数：补码（2’s Complement）

#### 作用

用二进制**统一表示正、负数**，让硬件可通过 “加法器”**同时处理加减法**（无需额外设计 “减法电路”）。

#### 表示方法（以 8 位为例）

- **正数**：最高位（符号位）为 `0`，数值位为 “本身的二进制”（如 `+5` → `00000101`）。
- **负数**：最高位为 `1`，数值位为 “绝对值的二进制取反 + 1”（如 `-5` → 先取反 `00000101` → `11111010`，再加 1 → `11111011`）。

#### ？？？运算示例：用补码做减法（`7 - 5 = 2`）

- 7 的补码：`00000111`
- -5 的补码：`11111011`
- 相加：`00000111 + 11111011 = 100000010`（8 位下 “溢出最高位”，结果为 `00000010`，即十进制 `2`）。

### 3. 浮点数：IEEE 754 标准

#### 格式（以 “单精度 float” 为例）

用 32 位表示：`符号位（1 位） + 指数位（8 位） + 尾数位（23 位）`，类似**二进制科学计数法**： \((-1)^{\text{符号位}} \times 1.\text{尾数位} \times 2^{\text{指数位} - 127}\)

#### 精度问题

由于 “尾数位长度有限”，**部分实数无法 “精确表示”**（如 `0.1` 的二进制是 “无限循环小数”，存储时会被 “截断”）。



- 示例：

  c

  

  ```c
  float a = 0.1;
  float b = 0.2;
  float c = a + b;
  // c 的值不是“精确的 0.3”，而是近似值（可通过 double 减少误差，但仍无法完全避免）
  ```

  

## 四、冯・诺依曼体系结构（硬件基石）

### 核心组成（五大部件）

1. **运算器（ALU，算术逻辑单元）**：执行 “算术运算”（加减乘除）与 “逻辑运算”（与、或、非）。
2. **控制器（Control Unit）**：协调各部件工作，负责 “取指令、译码、生成控制信号”。
3. **存储器（Memory）**：存储 “程序” 和 “数据”（早期为 “内存 + 磁盘”，现代扩展为 “多层存储 hierarchy”）。
4. **输入设备**：向计算机输入数据（如键盘、鼠标）。
5. **输出设备**：从计算机输出数据（如屏幕、打印机）。

### “存储程序” 概念

“程序（指令）” 与 “数据”**以相同格式存储在存储器中**，计算机自动 “取指令→译码→执行”，无需 “手动布线编程”（区别于早期 “编程靠硬件接线” 的计算机）。

## 五、软硬件接口：指令集架构（ISA）

### 定义与作用

- 定义：**指令集架构（Instruction Set Architecture，ISA）** 是 “软件能看到的硬件接口”，规定了 “软件可执行的指令、寄存器、内存模型” 等。
- 作用：是 “软硬件的契约”—— 编译器将 “高级语言（如 C）” 编译为 **ISA 指令**，CPU 硬件则负责 “执行这些指令”。

### 常见 ISA 对比

- **x86**：复杂指令集（CISC），广泛用于 PC，“兼容性强”，但 “硬件实现复杂”。
- **ARM**：精简指令集（RISC），广泛用于移动设备（手机），“功耗低”。
- **RISC-V**：**开源**精简指令集，“模块化设计”，适合 “教学” 与 “定制化硬件”（CS61C 选用此架构）。

## 六、课程实践与学习建议

### 核心项目（Project）

CS61C 有 3–4 个 “贯穿学期的大型项目”，第一节课会介绍其方向：



1. **Project 1：C 语言与内存**：深入理解 “指针、内存分配、缓存优化”（如用 C 实现 “高效数据结构”）。
2. **Project 2：RISC-V 汇编与 CPU 模拟**：用 RISC-V 汇编编写程序，并用工具 “模拟 CPU 执行过程”。
3. **Project 3：流水线 CPU 设计**：用 “硬件描述语言（如 Verilog）” 设计 “支持流水线的 RISC-V CPU”，解决 “数据冒险、控制冒险” 等问题。
4. **Project 4：并行与多核**：编写 “并行程序”，优化 “多核架构下的性能”。

### 学习建议

1. **重视实践**：课程的 “项目” 和 “实验” 是 “理解原理” 的核心，切勿 “只学理论，不动手”。
2. **结合工具**：使用课程提供的 “模拟器”（如 RISC-V 模拟器 `spike`）、“硬件仿真工具”（如 `Verilator`），**直观看到 “代码如何在硬件上运行”**。
3. **提前预习**：若 “C 语言” 或 “数字电路” 基础薄弱，提前复习 “指针、补码、逻辑门” 等内容。



这节课是 CS61C 的 “全景图”，后续课程会围绕 “六大思想”，结合**RISC-V 指令集、流水线 CPU、存储层次、并行计算**等具体技术，逐步深入展开。



# 实验

# CS61C 第一节课实验：C 语言基础与数制表示

## 实验目的

1. 熟悉 C 语言程序的编译与运行流程
2. 掌握二进制、十进制和十六进制之间的转换
3. 学习使用 GDB 调试工具
4. 理解 C 语言中的宏定义和预处理

## 实验环境

- Linux 或 macOS 系统
- GCC 编译器
- GDB 调试器

## 实验内容

### 练习 1：C 程序的编译与运行

首先，创建一个简单的 C 程序`numbers.c`：

C语言数制转换程序

V1

创建时间：16:38

![Asset cover](data:image/png;base64,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)

编译并运行程序：

bash

```bash
# 编译程序
gcc -o numbers numbers.c

# 运行程序
./numbers
```

预期输出：

plaintext



```plaintext
十进制: 42
十六进制: 0x2a
二进制: 0000 0000 0000 0000 0000 0000 0010 1010

十进制: 123
十六进制: 0x7b
二进制: 0000 0000 0000 0000 0000 0000 0111 1011

十进制: 255
十六进制: 0xff
二进制: 0000 0000 0000 0000 0000 0000 1111 1111

十进制: -1
十六进制: 0xffffffff
二进制: 1111 1111 1111 1111 1111 1111 1111 1111
```

### 练习 2：数制转换实践

创建一个新文件`conversion.c`，实现十进制到二进制的转换函数：

![Asset cover](data:image/png;base64,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)



数制转换函数实现

V1

创建时间：16:38

![Asset cover](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAEYCAMAAACjh1lKAAAAvVBMVEUAAAD////////////////////////////////////////////////39/fv7++vr6/f39/7+/uQkJDn5+egoKC/v7/Pz8+YmJifn5+oqKjHx8e3t7fX19enp6fz8/Pn7f/s7OyIiIi4uLhrk/+Epf/AwMDz9v9Tgf+1yf+ct//k5OTO2/+AgID5+fnN2//x8fF3nP/p6elfiv/a5P+Qrv+pwP9GeP//msadt///0ub/hLrC0v//9Pn/4/D/tNV9Mc44AAAADHRSTlMA3yDvEJ/PkGCAMKBO5IwmAAAVH0lEQVR42uzZ226iUBSAYazHNj+mhMxM0sywSSAcSkTroY6N7fs/1gASwY12etEr1v6DJt5+WQs5WE2j2XgyRFzDyXg2srrdTVsYCwdZje80jtGUdrY0ELi/HI8BrUSCMGgNycOlh0wQBg+35kMoSDMjuodUEAajyuMeLbEgTKuFQU8uCOXSjNETDFKMyIhOgkGGI2tGJ8EgzK5tjGSQsTWhk2SQiTWkk2SQoUU3ySAYkNsgS49TNYhar3M+KaePnUGcF3fOqRqEJATFpjhyiKKoElC5goiNUrGK6F8NiO1dA1mF27g4UrJ1GMYRf4N0vSEJwnz3Gib0L4tzV0GCDdsdmxXZCgqBGLKAZAvE9LH/gijSBBWQhZDuVAzFJ0kxIOWPnFdFFtQgEaec8nB68sfUgMxd16eqBomCOG+BxKsghSQO1+oEEqxSyrwnnn/y+Jte1IA4RVRVIHpZqCKASEGdoodZdLsBgojMlaoBMSAGxIC0MyBaBkTLgGgZkG9Mv5fRL93fj+9IqwHxnOULwIIzyJ490rJosl0A33dqkP3b/k3ciLRBfK/6fnRrkMPh44C0WiCeT5nv1hNyKAbkA2k1IE59TrWhApF5CmlAnGfXv3xidjwc5W1MC6SMKnMdomVAtAyIlgHRMiB6NYiLwD4BcX8hMLMyXwexe/Jy8vtA/iAwszK3QBzf95dU1SDzJwTWfvuvPUK0fyCwBoT5nFNmZaoW/9i3uxW3YSAMwzfw1ew20MNVYKYjC1FXyD8Ycv/3VY2rJLMp/YMWYqyXRGCbnDzgWAjrdHrDVgXpPuOA3UF0SQRb11vmEw6YBUEFabfM1rk7ddiqIN3Bp+5fikKt3jIvOGBtYvbnIN1HHLC2HvIXIB9wwNoCUftTbSANpIHYGsi/zIKYbZkWJE7QxMFE0Bzj53ESmOZ1wi4yIG8vP4BIj8gyOMg0lwHjABkAeGiOdBh00CtAGUfUmPH9pOjvEfqAYQ8bbOwLM+dHkD6viD6xl5iJEXgqB0wWhHnKAkqTnwHisDgXSg4iyBMTXOZpKY4Q9DTj6asg6vHavQdxtAoQE0AjQg+EGRcCFgsCvaqfSHWPnsSSALgk57JzCzBViCIc8eTdQLrT+baGWEHY90BkgAcF0W8kwFuQlXgpIE4PQlCQ6EsjgJCZWZwH+oCtIa1Pv/fZvkF0/voKrYJsJL8BcR7IroLMDPEO12LS0YAk2sGfiH3KPNwymlxBLp7lDkJp1IuekSmlK4hkygYEE3G6g+xk06IF+eU7ZiIwuds5e1oA/+54FwT/cWKWKO/gOdJmqg2kgdgayEMN5Bv7drKbOgwGUPgFzj/UY8hQAVI3lXj/17skpJML0l1ULKKchY3i3ScEieU07SBNO0jTDtK0gzT9GYge2/2QJT9zJzU22hdIlN/PMlJwE1fgNqoLINETrmyxbyAX1j5BSs14mCwIucvByTZUYazDlNDOtkjyBXKM7yvJCqIpC/gEXSS4FgMwpyqagJLObK72vd2lFcRCAbcF4WRmhTxZcAILiFi3wSM130EuP0EWkg+QoAAnODgh4omxbpDjx0lmjb//ZeQDpKTDIWLJbKQPNkxbPSzxCYI0Z8zaVGBVkC3+mu43ZjvIDrKDzO0gTTtI0w7StIM07SBNO0jT34FcjsLS/4M4bWPPwySyNuSeQ4S+9zA3zlNiyWqN+Hni+bXv3MkyvfAAxCNKVKIDy6hBBdS5pa6ULC6sF0Uc8QiIK9KflVvWj3QOOQNBwRNro+ET3huuPLUW5P2G8Pp+uQui1kUmG4IN9Q2tgyX6k410Zom5XPNAqZMFMJvHOg2EwUbGmoNrqiYl51wQkUcgXrXvZ0tisGeStCASY1Tg1a8yv0H65MDVJBs6UQ6qVQnMrdNJgWJQFWBeVggR1v22kiG6ewRoQE4pvc2LkE9BuFVqz9NqQV6PEC/XOb5wB2QMptApOaOJnMxMCMD10wlAA0DJ0Cl2vXhbHqcQ1/22ee0QQjCAe9+Q3gaK0SeWNHXKU2tB/rF3tjtuo1AYvoHzwQAG44/RxFL+rLqq5v5vbuFAgofZbDZpVKURr8YeDPZx+hSn9ls4/kSAt0vfIU67CsSx1GnxXFGASA8pQJSPm9IctXDx29wGO/ExLgu0l8wwAfl8wt/tULbDMj8+GguxFVYguFreAMZwRB3WUZonzaEAkUrpIejZLrCI36Y0mxqNtPcrQAuEdNBLOd3vVgUiwpPpLkCuqLhmlEq7qrOolvC8RoSqdrM54IHqN2YdyF4dSKMOpFEH0qgDadSBNOpAGnUgjTqQh6oCwY8oEN3pmF3XOhsQOYZrwhibLvlmSO0HQSgK4VSUB8WkMT8O5JNXWdhrmr/PqMJyxJ2OWWlBQ3GFqKAOTitiRqkBMiVC3gSKK2NOYYFQwRIIaGDIlVjiYPwVlzDRqUKOwPFMZF1rUJNKxuh4gENgZVRFGqvPn6Huq74mui9B73TM1jDrCcw4+wmU5TXweXAaDlGREMpDvybFAHZmn0wRZ2MZmIcYFn2qhHVltJqxPP5t6zDA4GOcYsgt2s6wSAWvs7XgDqujIcoAYg0aDyM98yEesA7A42yPsAxR8vl1jMyzjzDjJjjZd152QN4MFN3jmEmjki6uOLskUuWJ3IYqioSrBsdpjyVGGEnZyFEZBlbxgNQEq4uHSZAi4+UcFCmfDDl28Ze4cDzlExHIOQSg28COSnECMg3y8WL4dBBqMCpKAsSyJ2KVwk4RiATf95A6TPUex0waY4vxbFn+OPo8OG0hHVUuaDVSanY+NhBqxcrOSj7xIQVPy0g7IIWylkXslgzkh7hwUpI6JfY9RKFeWAVWKRS7CkSl4qyjYJSy0sxs4oanFHkYdkD2ad3ucMwqEF7A7YHoxt1QnnMfsrI5ewIfZE/yEjYsDRA6IIgfZ2wFUpzbHZAqCaqtsJ2O8VDcAcniCUingEnKslh9ExcgbQe5wzGrQCYdhj0QpzkQVJ2vh9myBeEyxC32rGPDGixLpEj5bK/NmjdwljUVICkoJhduOQFhe9xDX2PQowAhHXglGDx/AWJ8sB5StYfEVoCgtrxUIJXBXY5ZFbY7Ytu8j4B5YUW5sjbjt3NVEeaVqGmsQWvLdxuO9p+hhn2aGzN+ljGezwLkadSBdCAdSAfSgezVgTTqQBp1II9VBfL+2c6X+S6k7HapWA4Et8qpFGAJJcBTTjLZvdbtrUlj3koZ3CYCMuKU5ScwowBOTyHZ1xLj67tfplK1pRQAVQ0glpV5JjJfgBgQXXTMlLczKC5OGYnvxEArE4g1pQHH2U5Agdmvs0ZY7KCX01ggd4wBuARwpwAWiJ9ofme9ZPCvvxBElx2zwUF5ss9m0ZEoFRe7QVAgZSAbf8S/4KXYWsc8FshSG8DFAB5jlX2aidH7xG4/L18y4ph9A8KWmcv0TE8JCFleMxAte+s8uMxv0kG+Ey0BtvVZHnb3/w0BYDKHi45Z8+cROwrK9MygwOhk/Js9kNGUg+0CliC2lwC4C6D8E710Yfcd8vFBILrsmDkdULE4ZRCCQh14KFaL0XbVoKwd9kCMDRFFEorrqDSL5R5iALYL+hQAn2mC501jzKqNRacFocpYaPyy/R6a/jXA83ydPvjGjLzVCv5DT/Mt0e9UO5AOZK8OpFEH0qgDadSBNOpAGnUgj1UF8tOYfVKmy0IDomf1vBrdC+T9MzpmmcPlMWZoVJ5cmUjQ2TR7pZxmZyBEu1Rml8eY8SKTK7UBxWfT7JVymp2B/G1+/iyJzC47ZpFDnlY3HIFVNc1eKKfZbsDM+7sB0WXHjFavBAhqtNU0e6WcZhVI9SYuO2YRzJonVw4bV8/rlXKaVSDv5tr7dhFt8C5PrsQfBs6m2SvlNNtdMhVCBdKoTq4kK5tpeSEa99+YKf0q/6r0O9UOpAPpQL6oA2nUgTTqQBp1II06kEaPA/LzHf6WcWZXgehmeza1PP3h97B1OMSnIUjDqhCuAvmBZjd+jBQrxNN/7Os//NGmAsF3QhP7CcF1IOugFZBPsxyBx1kr5WW2V9Sf/m78/dtUKWWqist1IAQLQ1CAB1QWxDxT4GPLKwL5Pz1E5sqNBHFxLECUVQxR29OMnnsEkLe/ylzE60CmDXg69ZCgAOymIIpep4eQMR/0SQbgKhBt7UhAOtgJwIewukhISLzSJfMWlceZXQNyHilGWNfOQdQrAam658ZsXhFEnv/sf3cffqdKf7j/3m/dO5AOpAPpQPbqQBp1II06kAeqdcxKgpGbgEwTNJoNXNC13QLBdxEaBPJj2X3RI07eTwB1Gx6m1jGjT3MrkGHISf5PacgQWOXxASrWIJjsrEkVnvKOZZsNRCj7Se1IpxKigqIRLeB2JECSjGUOUSOWJGQ5Q9nD1DpmEcTtQPTMFoDnNa7DOkwRCFmCbRy8A+aVUsKxCYqRxJxttnUus2uUnxkprliAlJLnGYKDqO1gD06mg47MOWMZeqIVUiiPkqFMG3iMWj8E4A4g51T/umSeYuUNmDzFjJVkYcJDAVKSialVNowyMCYuEWMqjHQqablWBNjmJgmVpKUR1OFgIkmiFDBtw/16PJAhfUgKzLok8+LRIqj1DERjXMgIkFwBxWabIx4x6dnJMlIpVRNBaX8YJVRJmCZ56ZA0liRk/AAajwaCGt1Q84KxGjYwPhZKD1GpjWKFPwEpNltSWED8t9xDSkmA4PkrRIAsK6CWRhNSdT7Zg4G0jtn7518fb7cBcTroCYwPq5WMY4NYzlMsWp+BGBv8EjGEMCwFSLHZkkysJ/TBHmXMWinphGqS+OAyEEmYJkBwlX0Gzz4DOTwKSuuYiW7pISKKy7++RZOXUiCs61pVi3WXfQtCI6wl/HKy7XYgv//GbLZ+hN8kA49Sv1PtQDqQDqQD+aoOpFEH0qgDadSBPFKNY1Zymd0GxPoJquoNNfl2VpE88Y1NnZtOBS4FYrhV6B9knbWO2XucmXkjEOXp7ImlX5LrLAqPG51fmXl6X0BcdJPIedSyZcCkEGlF9gxQYalDwFxWX5tMib48yDprHbOoG4Gg1WxOntjKGpW3XDoI11dm6nnW7pSb6ICgGLyT3ey8APC6khvApCxoFYjzA8e6dKSzq0SaywPjxCV9/xGUj3UasnWm4NfU+CGyurWHWHHMKNtgo8mZrJTkO0/SlH54goULkDKlkxCi2BUrDdwg4dYKZN5AtHDJ+C9eofhsfEztRyqnBZ1jKIRf1HeD6O0OID8gLUpsMAHCvAiQbHJp8YrUGQhqsFCk4x7mBIQsW65AiPWxvEmg5HNXa0Qy8xCbfKS6MnOMW4H8qlogwuOeHqKA/A6IaBhSG34DIn+1W/kWcatS8/EEhJfSj87SMC4wDQVI7i1ZeJBc9vBYIK1jFn8+3m4HYizr5QRk0YwFSH1lZgUyBgP0g2LBgVxigBoLkEXbgeM2Zw8sumobTNrOXICgl6xo0mS3FJ6HL0AOC/yaHuGYiQhrGS8k5K9VVBOeNcISYFNSoBquOQ9R3ay6Zp096Y3ZP+2d627UMBCF0wttgTNj107iXBFZqX9QUcX7vxzx2Nm0XhAktMvC5pOabme9lfopUaOjmfg3RjotVmHxh2x3qpuQTcgmZBPykk1IwiYkYROSsAl5TdLEjGW/zMVCDFDZtHJI55zrcOK8TMzu7z8/AcuEkLWPQIfY8yVHCQRYE+K0pkBVB1XKulA8yXnWJDGTEcQlQiS2Cjvv7VTboFDScuYVqcJoMoSyiY/7GnrrheStMtCGOgcyFidGmofYpYlZu9+KsC4RusUM+wqkzaVtJNghYNrCsKuZa4uizhk4OR+JEIxKvmKRkEpPQljlzejAl3yl6ZUrYXPOIUQhcZNM8HCa85upEHwjLBKiGnAQArDzQnggL8QQlLezK2PMEYXoPH7OnOTsVTKVyXbpfxnr6tqFP9Z3fhVGORnVtIWr2xLQjwxJw2VNY8qwSWaxAzumx5O7ZpLEbJ7K/H0YESagKJlikeCxCuHlvIYYE6f3TMnXvjErSrygdIyfQ6d31Wx3qpuQTcgmZBPynE1IwiYkYROSsAl5TdLEbEXDDHJX5fgRTYdSIYVYehp+gd7h+BwmZrK5G7C4x8wgtpnxnI+x3pWwvsAcQjI5SgsaWcQSyTdBSgSwZkCr6ZfRft9NlrVvS5qY3dtPC4VQb1ovJLSZ9U2cpURRFSb2hIxFJzGaU0U37ZYJP6RHMln5AEnUwkyn/6CzssKIF50r5ZQaCFXdmgZkGG9HmofwEy0UMnUFVR3rHmQeHkBaExugiEIgIZnjTgFS9WXdS7qmOvilGkAMSgZ58UxIDxoItUVlZYnFGtYJefryeRy6wxohpleqAB4GhlbK6vy5kMKHZNQUwF5IqeC/wgieICXRw2YWEl/FjRc4xzpWChkDkXETEaw6Q7T84Lo8VF+0UekaI2UOzGdILguiEMKIdRgxPJ0hjtEcW0iamAHrLpmaZVNMcjz1Uraub5tJiA/JeqDKVSktaFrJgoomIRKchZnOxijHsKb1r3a7AyFvG7KliRmANT1m9IMdAIjSFbFGNJcm5tK8VL4OWR+y/ac3Zm8bsv2DQn7JJiRhE5KwCUnYhLwu2RUOOGchV9kNDjhnITfZRxxwzkLeZXc44JyF3GXXVxDCVOaKHjOha+IATFqvAY2FWPw9rrPsFoIkZvy0fF6GLYeBORvGJv2RNEMgDTZMQKhjGs/kaQHiWywHeXP6AOQX4ai8y7LsEsI9SUAEYYGQriqMFiFKg/30pQ/JWkPwaIVmUCV2feEITsXxzM4VPTBYjOQq5GQ5x0ysHVQHn5MRjCpw1MbFy2zkFoFRyCf7ZXHIDG8jCJH80ICNtJ5ZvY8C2TGHR3S1Mp7Z7AjPczIamJtmysSMr0oj2gA58Y7G+8xzfQEh9Jh9WfqUql65ZhJSsQgJcVmrikmIPHNMY58rUmt2EGJO5t/vpgjIAKUvWBgclYsscClGghAsFeIsVLk/QzrwXohHhBBowMgsBGHWF5jOELnCJiFDrOLIQi4us8iHC+x7zJZeMo2pfTRmZNbUmrw/EFLV0npmeBZS5Kra52Qu5GQ1T0JcHRvRRIgrcRwuPmTCdI7cj3ylxXO7oHAkBKxDSszBZuTHNCf72QeaIwmR82PmPWZEyCrY5abD69LhKNxeZy+5/IiJ87tTvbq9zA65vvt4c4WR8xJydfPu7tnZ8R3t4r1F3ryyrgAAAABJRU5ErkJggg==)

编译并测试程序：

bash











```bash
gcc -o conversion conversion.c
./conversion
```

输入不同的整数（正数、负数、零）测试程序，并与练习 1 的输出进行比较。

### 练习 3：使用 GDB 调试程序

创建一个有错误的程序`buggy.c`：

![Asset cover](data:image/png;base64,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)



用于GDB调试练习的有错误程序

V1

创建时间：16:38

![Asset cover](data:image/png;base64,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)

使用 GDB 调试：

bash

```bash
# 使用-g选项编译以包含调试信息
gcc -g -o buggy buggy.c

# 启动GDB
gdb ./buggy

# 在GDB中设置断点
(gdb) break main
(gdb) break sum_up_to

# 运行程序
(gdb) run

# 单步执行
(gdb) step  # 进入函数
(gdb) next  # 执行下一行但不进入函数

# 查看变量值
(gdb) print i
(gdb) print sum

# 继续执行直到下一个断点
(gdb) continue

# 退出GDB
(gdb) quit
```

尝试使用 GDB 的各种命令，理解程序的执行流程。

### 练习 4：C 语言宏定义与预处理

创建`macro_demo.c`文件：

C语言宏定义示例

V1

创建时间：16:38

![Asset cover](data:image/png;base64,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)

编译并运行程序，观察宏定义的行为：

bash











```bash
gcc -o macro_demo macro_demo.c
./macro_demo
```

使用预处理命令查看宏展开的结果：

bash











```bash
gcc -E macro_demo.c -o macro_demo.i
cat macro_demo.i
```

## 实验思考题

1. 为什么负数的二进制表示采用补码形式？
2. 宏定义与函数有什么区别？在什么情况下应该使用宏而不是函数？
3. 观察`SQUARE(a++)`的输出结果，解释为什么会得到这样的结果？
4. 在练习 1 中，-1 的二进制表示为什么全是 1？

## 实验总结

通过本实验，你应该能够：

1. 使用 gcc 编译 C 程序并运行
2. 在不同数制之间进行转换，理解补码表示
3. 使用 GDB 调试工具跟踪程序执行
4. 理解并使用 C 语言中的宏定义

这些基础技能对于后续学习计算机体系结构和底层编程至关重要。

可以用 Go 实现 CS61C 第一节课实验的核心功能。虽然 Go 与 C 在语法和特性上有差异（如无宏定义、调试工具不同），但可以通过 Go 的语言特性完成相同的实验目标。以下是基于 Go 的实验实现：

# CS61C 第一节课实验（Go 版本）

## 实验目的

1. 熟悉 Go 程序的编译与运行流程
2. 掌握数制转换逻辑（二进制、十进制、十六进制）
3. 学习使用 Delve（Go 调试工具）
4. 理解 Go 中函数与 C 中宏的替代关系

## 实验环境

- Go 1.16+ 环境
- Delve 调试工具（`go install github.com/go-delve/delve/cmd/dlv@latest`）

## 实验内容

### 练习 1：数制表示与转换

创建`numbers.go`文件，实现不同进制的表示功能：

![Asset cover](data:image/png;base64,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)



Go数制转换程序

V1

创建时间：16:40

![Asset cover](data:image/png;base64,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)

编译并运行：

bash











```bash
# 直接运行（Go自动编译）
go run numbers.go

# 或先编译再运行
go build -o numbers numbers.go
./numbers
```

预期输出与 C 版本一致，展示各数字在不同进制下的表示，特别注意负数的补码表示（全 1）。

### 练习 2：十进制转二进制函数

创建`conversion.go`，实现递归转换逻辑：

![Asset cover](data:image/png;base64,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)



Go十进制转二进制函数

V1

创建时间：16:40

![Asset cover](data:image/png;base64,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)

运行测试：

bash











```bash
go run conversion.go
```

输入不同整数（正数、负数、0），观察二进制输出（注：负数转换结果为其绝对值的二进制，需结合补码概念理解）。

### 练习 3：使用 Delve 调试程序

创建`buggy.go`（包含故意设计的 "逻辑漏洞"）：

![Asset cover](data:image/png;base64,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)



Go调试练习程序

V1

创建时间：16:40

![Asset cover](data:image/png;base64,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)

使用 Delve 调试：

bash











```bash
# 启动调试
dlv debug buggy.go

# 在main函数设置断点
(dlv) break main
# 在sumUpTo函数设置断点
(dlv) break sumUpTo

# 运行程序
(dlv) continue

# 单步执行（进入函数用step，跳过用next）
(dlv) step
(dlv) next

# 查看变量值
(dlv) print i
(dlv) print sum

# 修改变量值（调试中修复错误）
(dlv) set i = 5

# 退出调试
(dlv) quit
```

通过调试发现`sumUpTo`函数中循环条件应为`i <= n`，修复后重新运行验证。

### 练习 4：Go 中宏的替代实现（函数替代）

Go 没有预处理器宏，但可以用**函数**和**常量**替代 C 中的宏功能。创建`macro_alternative.go`：

![Asset cover](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOwAAADsCAYAAAB300oUAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAeYSURBVHgB7d2BcqsoFABQbPv/f7zNvsw0sy5PU03gInDOzJvX2LQ06uUiInymdj7+/Pv8+fqW6puhvPu/Jai85ae8KNHlXVLrHbAk4LDpa6zKIjIdE2kdsKOf0FoQFNUyYJfVP+CAlgF7y/4HfqFJXJfKiKJ0OtWluU9RArYuGZai3IeFjnwc3AZcwMcvr2vTZIQT1gF6b55+JkrS5Keoj52vgQtaB6nmKVc3/TmaZ1VBy5VNf4mRB6yxvWW1qABVugPbyrAOeDktKj8V7sC2MmwUJ1YdKtyBPabdONtDXGoakqjpTEq7/83Lwe2Pz7esvt+yqbxk29Z/19b2q/tOE/lKr2W6rYOfbx+5pl9+2X7b2N76ccL135Yfn/Xrvc9wRdO1JtYn3iPT3nfCP6m+R3nfKaaWbFHeIxBGLG9ZlRc16VtkeZe01RR2DdQ3x29gRjfVpZeYolr2EgMnybB1GThBUYYm1qVJTFGaxHXJsBQlw0JHXMOOZ+RWksfrEqOY4WT2eF0CuiFgx9HTGOBXaRInRrH3QMZINIkTo5ghw05PwI5DoE5AwI7H4JeBCVjoiIAdj6bxwAQsPXFbJwHdELD0xH3YBHRDwEJHBCw90emU5uKWR99cw6a5GAXUt+kr3PsJ/JXGtbX8xLLxva0TofVaOGesP9d6W2+2Psez9023CsCoGfZxIPODv7emzLJ6nb+vhxMiP3n3HrVr3cK4/fK9ZeO9e8dhymy7tbaOtW76Lu87jbnWzVYwT8c17DhmaB7qdEpANwQsPXEfNjGS0ZuMmsRpLqPX0D7f4GRY6IiAHYuRXIMTsNARATsWDzcMzsAJ6IheYuiIJjF0RMDWJ6tTjGvYMctkUK5hxyiLSWgS1yOzUpyArUeGpbg8YJ1k5dmnFJMHrGZcefYpxbTOsLIPnND6Glb2gRNaN4lHzrD5/MfwNp1O9diXFKfTqa6jM9nDITJsXT0s80FH7ifUZ/Z6az2a9ev1tme/t5d1aY44u+bL3vZ8X+T7qff9tbdESP79tXc/81QV4j1Y11n2sfxCyradMWJWORKES9rfV8vOtpGC9S5fo+i28/WzfcUT+do6M6w9E1Xekv5bO2jUtW6iy3uwtg5VuH6lKAELHRGwdblWoygBW4+RThQnYOsRqBQnYOsStBRlTifeYX8Gmylgjestz/4MpknMO2TYYAKWd8iwwWYKWCdXeTJssNmuYSlLJRhsxgwrcOnWjBlWVqBbM3Y6ybB0Sy8x71D5BdNLzDvs02CGJvIO+zPYFQI26qA7uejeFQI2slmlCUfXNImhIy0DtkXwyLB0rWXARs/DK1jpXusMGxm0UfPnQjVbARt1UuezxEeRaelWvrbOEVszN5yZzeHIe7eWwciXtdj7nbLoOev9dXY9pSssLzLd2jpH5s7N10XZ+t6zg7wVaFsBtmTvzy07P3v0/WxbL7thLuUL21pbx1owyjta3kNkeVO3oFr3EqvJOcrjkX98pXZca3KGDJv+n2EFED2YOsPmizkDFybDQkfMOAEdEbBjGbmVpAWY/g5YO6Vv+iEGl3c6OeBcnds6PzzNwpUZZppcw9IPyST9HbCaxFyVkU5JpxN0RZMYOiJgxzJDC0mnE8OY4WR2DQsdeNx2lGEZxujZ5wpzSDUlYOmNDAsdcB82CVj6YYxAErDQFQELHRGw9MLTOknA0p+pr2XvtZWgjZGvDZQvcZLS9n3G6Bn2r+i3tZamIVhfd/ZE2TrJ1ifg8uRn8m2juB3Ylq/rNHWTOF+cytozZct7UF65Mt2HpRoTAlCUgKUXeomTgK3N6Jxy8uv+KQlYXtUicKavAAUsr2rRNJ2+T0DA1qXTqRzXsKntgs5wliZxoqYZTrCoz/gYQKGXeCJ6bcuLDKDpl5OZLWBdU5anEgykScy7VIKBBCw9cVsnwWtajDzSS5zgNe6LNiBgeVWLDKtJnOA1LYJHkzi15ZZAv1ocOxk2tRV9AFQQfZNh01x0kPRNhs1ej16DybD9M5Z4RQbiyowlzl5H7wwZr7zofaqSD9Q6wzrY5UXtU8euAfdhedX0zdMWBOxYWjSHBW2g9RP86xWu83VM1p5tf/Zze+/Jtx3ZvscJ9LrH/n73Z7f2/9ZxzH/+yPunP7brxbC2giil54s45e9ZO7LI023n67TzN6Unv4NryY/n3vnwW6Xs2K8sO19bC0Z5R8tUYQZyDTuOVoGjtziQgRPjaHGdF91TbGhi9lrzpn+R92E9vBFMk3gcraZs0SoLJGDHET1li2BtYLbnYSkncjV7fphxYjzRS2cQSJOYd6hwgwnY8URmPRk2mIAdhxXRJyBgxyOIBiZg64m+L5o/kBFVJoEEbH3R90WjB04QSMDWM8N0OzJsMAFbX+R90TtBNDABW1/kYPzokUeaxMEEbD0tpoxt8QQNgQRsfZG9xJHl0YCAhY4I2Poib+tElhddFknA1jTDyaz5HewrUVOLjicGJsPW474oxc0UsC2yj3l7KWqmgG01VFAnEMXM2CQeOePJ5pMZfcD6DAPyAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBfj7WgohF4QykAAAAASUVORK5CYII=)



Go中宏的替代实现

V1

创建时间：16:40

![Asset cover](data:image/png;base64,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)

运行程序：

bash











```bash
go run macro_alternative.go
```

对比输出与 C 版本的差异，特别是`a++`的处理：Go 函数参数先求值（无副作用），而 C 宏会直接展开导致多次自增。

## 实验思考题（Go 版本）

1. Go 中如何处理负数的二进制表示？与 C 的补码表示有何异同？
2. 为什么 Go 不支持宏定义？用函数替代宏有哪些优缺点？
3. Delve 与 GDB 在调试体验上有哪些主要区别？
4. 对比`square(a++)`在 Go 和 C 中的执行结果，解释差异原因。

## 实验总结

Go 通过**强类型系统**、**函数特性**和**现代调试工具**，可以实现与 C 语言实验相同的底层概念验证，但在语法和行为上有以下关键差异：

1. 无宏定义，用函数和常量替代，减少了宏展开带来的副作用
2. 调试工具更简洁（Delve vs GDB）
3. 类型检查更严格，编译期错误提示更友好
4. 内置对切片、范围循环等高级特性的支持

这些差异体现了 Go 在 “底层控制” 与 “开发效率” 之间的平衡，适合作为理解计算机体系结构的现代语言工具。

# 问答

# CS61C 第一节课理论知识测试题（10 道难度递增）及解答

以下题目基于第一节课核心知识点设计，涵盖**六大伟大思想、数制转换、冯・诺依曼体系、ISA、性能衡量、并行性**等，难度从 “概念记忆” 逐步过渡到 “综合应用”。

## 题目 1（基础记忆）：六大伟大思想匹配

请将下列场景与对应的 “计算机体系结构六大伟大思想” 匹配（每个思想仅用一次）：
场景：

1. 程序员用`sqrt()`函数计算平方根时，无需关心底层硬件如何实现平方根算法；
2. 现代 CPU 从 “单核高频” 转向 “多核并行”，以应对晶体管密度增长放缓的问题；
3. 计算机设计 “寄存器→L1 Cache→L2 Cache→主存” 的存储层级，平衡速度与成本；
4. 数据库通过 “数据备份” 避免单磁盘故障导致数据丢失；
5. 用多线程同时处理多个用户请求，提升服务器单位时间内的任务处理量；
6. 分析 “程序中串行部分比例”，判断并行优化的理论上限。

伟大思想：
A. 抽象（Abstraction）；B. 摩尔定律（Moore’s Law）；C. 局部性与存储层次（Locality & Memory Hierarchy）；
D. 冗余实现可靠性（Redundancy）；E. 并行性（Parallelism）；F. 性能衡量与优化（Performance Measurement）。

### 解答 1

1-**A**（抽象：`sqrt()`函数隐藏底层实现细节，符合 “层次化隐藏细节” 的定义）；
2-**B**（摩尔定律：晶体管密度增长放缓后，通过架构优化（多核）维持性能提升，符合定律转型方向）；
3-**C**（局部性与存储层次：利用局部性设计多层存储，平衡速度与成本）；
4-**D**（冗余：备份是 “数据冗余”，避免单点故障）；
5-**E**（并行性：多线程并行处理请求，提升吞吐量）；
6-**F**（性能衡量与优化：Amdahl 定律基于串行比例计算并行上限，属于性能优化分析）。

## 题目 2（基础计算）：正整数进制转换

请完成以下转换：
（1）十进制`67`转换为二进制；
（2）二进制`101101`转换为十进制；
（3）十六进制`0x2F`转换为二进制。

### 解答 2

（1）十进制→二进制：除 2 取余法
`67 ÷ 2 = 33 余1`，`33 ÷ 2 = 16 余1`，`16 ÷ 2 = 8 余0`，`8 ÷ 2 = 4 余0`，`4 ÷ 2 = 2 余0`，`2 ÷ 2 = 1 余0`，`1 ÷ 2 = 0 余1`；
从余反向取数：**1000011**。

（2）二进制→十进制：按位加权求和
`1×2⁵ + 0×2⁴ + 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 32 + 0 + 8 + 4 + 0 + 1 = 45`，结果：**45**。

（3）十六进制→二进制：1 位十六进制对应 4 位二进制
`0x2`→`0010`，`0xF`→`1111`，合并后：**101111**（可省略前导 0，简化为`101111`）。

## 题目 3（中等理解）：补码表示与运算

已知计算机用 8 位补码存储整数，完成以下任务：
（1）写出十进制`-12`的 8 位补码；
（2）计算`6 + (-12)`的 8 位补码结果，并转换为十进制验证。

### 解答 3

（1）负数补码计算步骤：

- 第一步：求绝对值的二进制：`12`→`00001100`；
- 第二步：按位取反：`11110011`；
- 第三步：加 1：`11110011 + 1 = 11110100`；
  结果：`-12`的 8 位补码为**11110100**。

（2）补码运算：

- `6`的 8 位补码：`00000110`；
- `-12`的 8 位补码：`11110100`；
- 相加：`00000110 + 11110100 = 11111010`（无溢出，8 位内运算）；
- 补码转十进制：符号位为 1（负数），先取反加 1 求绝对值：`11111010`取反→`00000101`，加 1→`00000110`（即 6），故结果为`-6`；
  验证：`6 + (-12) = -6`，正确。

## 题目 4（中等应用）：局部性原理判断

以下两段 C 代码均实现 “计算二维数组所有元素的和”，请分析哪段代码的 “空间局部性” 更好，并说明原因（数组在内存中按 “行优先” 存储）：

c



运行

```c
// 代码A（列优先遍历）
int sum = 0;
int arr[100][100];
for (int j = 0; j < 100; j++) {
    for (int i = 0; i < 100; i++) {
        sum += arr[i][j];
    }
}

// 代码B（行优先遍历）
int sum = 0;
int arr[100][100];
for (int i = 0; i < 100; i++) {
    for (int j = 0; j < 100; j++) {
        sum += arr[i][j];
    }
}
```

### 解答 4

**代码 B 的空间局部性更好**，原因：
空间局部性的核心是 “访问某个地址时，其相邻地址更可能被访问”；

- 数组按 “行优先” 存储，即`arr[0][0]`与`arr[0][1]`在内存中相邻，`arr[0][99]`与`arr[1][0]`相邻；
- 代码 B 按 “行优先” 遍历，每次访问的`arr[i][j]`与`arr[i][j+1]`是内存相邻地址，符合空间局部性；
- 代码 A 按 “列优先” 遍历，每次访问的`arr[i][j]`与`arr[i+1][j]`在内存中相隔`100`个`int`的地址（不相邻），频繁触发 Cache 失效，空间局部性差。

## 题目 5（中等计算）：摩尔定律应用

假设 2020 年某芯片的晶体管数量为`100亿`，若摩尔定律（晶体管数量每 2 年翻一番）仍有效：
（1）2024 年该芯片的晶体管数量约为多少？
（2）若 2030 年晶体管数量达到`800亿`，是否符合摩尔定律？请计算验证。

### 解答 5

（1）2020→2024 年共 4 年，即`4 ÷ 2 = 2`个翻倍周期；
晶体管数量 = `100亿 × 2² = 100亿 × 4 = 400亿`；
结果：**400 亿**。

（2）2020→2030 年共 10 年，即`10 ÷ 2 = 5`个翻倍周期；
理论数量 = `100亿 × 2⁵ = 100亿 × 32 = 3200亿`；
实际数量`800亿 < 3200亿`，故**不符合摩尔定律**（说明 2020 年后摩尔定律已显著放缓）。

## 题目 6（中等辨析）：性能指标区分

请判断以下场景描述的是 “延迟（Latency）” 还是 “吞吐量（Throughput）”，并解释两者的核心差异：
（1）某快递从北京寄到上海，耗时 2 天；
（2）某快递站点每小时能处理 500 个包裹；
（3）某数据库单条查询耗时 0.1 秒；
（4）某数据库每秒能处理 2000 条查询。

### 解答 6

（1）**延迟**：描述 “单个任务的总耗时”（快递从发出到送达的时间）；
（2）**吞吐量**：描述 “单位时间内完成的任务数量”（每小时处理的包裹数）；
（3）**延迟**：单条查询的耗时（单个任务的总时间）；
（4）**吞吐量**：每秒处理的查询数（单位时间任务量）。

核心差异：

- 延迟聚焦 “单个任务的快慢”，目标是 “让一个任务尽快完成”；
- 吞吐量聚焦 “系统整体的处理能力”，目标是 “单位时间内完成更多任务”；
  两者可能存在权衡（如为提升吞吐量增加并发，可能导致单个任务延迟上升）。

## 题目 7（较难理解）：ISA 的作用与分类

（1）什么是 ISA（指令集架构）？它在 “软件” 和 “硬件” 之间扮演什么角色？
（2）对比 RISC（如 RISC-V）和 CISC（如 x86）的核心差异，说明 CS61C 为何选择 RISC-V 作为教学指令集。

### 解答 7

（1）ISA 定义：软件能看到的硬件接口，规定了 “软件可执行的指令、寄存器、内存模型” 等；
角色：**软硬件的契约**—— 编译器将高级语言（如 C/Go）编译为 ISA 指令，CPU 硬件执行 ISA 指令，使 “软件无需适配具体硬件细节” 即可运行。

（2）RISC 与 CISC 的核心差异：

| 维度       | RISC（如 RISC-V）        | CISC（如 x86）           |
| ---------- | ------------------------ | ------------------------ |
| 指令复杂度 | 精简（单条指令做一件事） | 复杂（单条指令做多件事） |
| 硬件实现   | 简单（执行速度快）       | 复杂（执行延迟高）       |
| 扩展性     | 模块化（易定制）         | 兼容性优先（难扩展）     |

CS61C 选择 RISC-V 的原因：开源免费（无版权限制）、模块化设计（易学习核心指令）、硬件实现简单（适合教学实验，如设计 RISC-V CPU）。

## 题目 8（较难系统）：冯・诺依曼体系

（1）冯・诺依曼体系的五大核心部件是什么？请描述 “执行一条加法指令（如`a = b + c`）” 时，五大部件的协同流程。
（2）“存储程序” 是冯・诺依曼体系的核心思想，它的含义是什么？

### 解答 8

（1）五大部件：运算器（ALU）、控制器、存储器、输入设备、输出设备；
加法指令`a = b + c`的协同流程：

1. 控制器向存储器发送 “取数指令”，从存储器中读取`b`和`c`的值，送入运算器；
2. 控制器向运算器发送 “加法控制信号”，运算器（ALU）执行`b + c`，得到结果；
3. 控制器向存储器发送 “存数指令”，将运算结果写入存储器中`a`对应的地址；
4. （若需输出）控制器向输出设备发送信号，将`a`的值输出（如显示到屏幕）；
   整个过程由控制器统一协调，按 “取指→译码→执行” 的周期循环。

（2）“存储程序” 含义：**程序（指令）与数据以相同格式（二进制）存储在存储器中**，计算机无需 “手动布线编程”，可自动从存储器中 “取指令→译码→执行”，实现 “程序的自动化运行”（区别于早期 “编程靠硬件接线” 的计算机）。

## 题目 9（最难计算）：Amdahl 定律应用

某程序总运行时间为 100 秒，其中 60 秒是 “可并行部分”，40 秒是 “必须串行部分”。
（1）若用 4 核 CPU 并行优化，程序的加速比是多少？总运行时间变为多少？
（2）若无限增加 CPU 核心数（并行度无限大），加速比的理论上限是多少？

### 解答 9

Amdahl 定律公式：
加速比（Speedup）= `1 / [(1 - p) + p/s]`，其中：

- `p`：可并行部分的比例；
- `s`：并行度（CPU 核心数）。

（1）第一步：计算可并行比例`p` = 可并行时间 / 总时间 = `60 / 100 = 0.6`；
第二步：代入公式，`s=4`：
加速比 = `1 / [(1 - 0.6) + 0.6/4] = 1 / [0.4 + 0.15] = 1 / 0.55 ≈ 1.82`；
总运行时间 = 原总时间 / 加速比 ≈ `100 / 1.82 ≈ 54.9`秒（或直接计算：串行时间 + 并行时间 / 4 = `40 + 60/4 = 40 + 15 = 55`秒）；
结果：加速比≈**1.82**，总运行时间≈**55 秒**。

（2）无限并行时，`s→∞`，则`p/s→0`；
加速比上限 = `1 / (1 - p) = 1 / 0.4 = 2.5`；
结论：即使无限增加核心，加速比最多提升 2.5 倍（受限于 40% 的串行部分）。

## 题目 10（最难综合）：并行性与局部性综合优化

某程序用单线程计算 “1000×1000 二维数组的每行求和”，代码如下：

go

```go
func rowSum(arr [1000][1000]int) []int {
    sum := make([]int, 1000)
    for i := 0; i < 1000; i++ {
        s := 0
        for j := 0; j < 1000; j++ {
            s += arr[i][j]
        }
        sum[i] = s
    }
    return sum
}
```

（1）如何利用 “线程级并行” 优化该程序（基于 Go 的`goroutine`）？
（2）优化后是否会影响 “局部性”？为什么？

### 解答 10

（1）线程级并行优化（用`goroutine`分块处理行）：
思路：将 1000 行分为多个块（如 4 块，每块 250 行），每个块用一个`goroutine`计算，最后汇总结果；
优化代码：

go

```go
import (
    "sync"
)

func rowSumParallel(arr [1000][1000]int) []int {
    sum := make([]int, 1000)
    var wg sync.WaitGroup
    blockSize := 250 // 每块250行，4个goroutine
    
    for block := 0; block < 4; block++ {
        wg.Add(1)
        // 捕获循环变量（避免闭包陷阱）
        start := block * blockSize
        end := start + blockSize
        go func() {
            defer wg.Done()
            for i := start; i < end; i++ {
                s := 0
                for j := 0; j < 1000; j++ {
                    s += arr[i][j]
                }
                sum[i] = s
            }
        }()
    }
    wg.Wait() // 等待所有goroutine完成
    return sum
}
```

（2）优化后**不影响局部性，甚至可能提升局部性**：

- 原代码按 “行优先” 遍历，空间局部性已最优；
- 优化后每个`goroutine`处理连续的行（如 0-249 行），仍按 “行优先” 访问数组，相邻元素在内存中连续，空间局部性保持不变；
- 若 CPU 有多个核心，每个核心的 Cache 可缓存当前`goroutine`处理的行数据，减少 Cache 失效（相比单线程频繁切换行，多线程分块处理可降低 Cache 竞争），局部性可能更优。

## 总结

10 道题覆盖第一节课所有核心知识点，难度从 “概念记忆”（题 1-2）→“计算应用”（题 3-5）→“辨析理解”（题 6-8）→“综合设计”（题 9-10），逐步考察对 “体系结构理论” 的掌握深度与应用能力，为后续实验与进阶学习奠定基础。

# 场景题

# 基于 CS61C 第一节课知识的 Go 后端开发场景题（5 题，难度递增）

以下题目结合 Go 后端开发实际场景，将计算机体系结构核心理论（抽象、局部性、并行性、性能衡量、冗余可靠性等）与工程实践结合，难度从 “基础应用” 逐步过渡到 “系统设计”。

## 题目 1（基础应用）：接口设计与抽象思想

在 Go 后端开发中，我们经常需要对接不同的数据库（如 MySQL、PostgreSQL、MongoDB）。请设计一个数据库操作层，利用 “抽象（Abstraction）” 思想实现 “新增用户” 功能，要求：
（1）对上层业务代码隐藏具体数据库的实现细节；
（2）支持轻松切换不同数据库而不修改业务逻辑。

### 解答 1

核心思路：利用 Go 的**接口（Interface）** 实现抽象，定义统一的数据库操作接口，不同数据库实现该接口。

go

```go
// 1. 定义抽象接口（隐藏底层细节）
type UserStore interface {
    CreateUser(user User) error
}

// 2. 具体实现（MySQL）
type MySQLStore struct {
    // 数据库连接等信息
}

func (m *MySQLStore) CreateUser(user User) error {
    // MySQL特有的SQL插入逻辑
    return nil
}

// 3. 具体实现（MongoDB）
type MongoStore struct {
    // 数据库连接等信息
}

func (m *MongoStore) CreateUser(user User) error {
    // MongoDB特有的文档插入逻辑
    return nil
}

// 4. 业务层代码（依赖抽象接口，不依赖具体实现）
func RegisterUser(store UserStore, user User) error {
    // 业务逻辑（如校验用户信息）
    return store.CreateUser(user) // 调用抽象接口，无需关心底层是MySQL还是MongoDB
}
```

**理论对应**：

- 符合 “抽象（Abstraction）” 思想：通过接口定义 “上层可见的操作标准”，隐藏不同数据库的底层实现（如 SQL 语法、连接方式），使业务层无需修改即可切换数据库，降低系统复杂度。

## 题目 2（中等应用）：缓存设计与局部性原理

某 Go 后端服务需要频繁查询 “用户最近 30 天的订单列表”，每次查询需从数据库读取大量数据，性能较差。请结合 “局部性原理（Locality）” 设计缓存策略优化，并说明：
（1）选择何种缓存介质（如内存、Redis）及原因；
（2）缓存的 key 如何设计才能最大化利用 “空间局部性”；
（3）如何处理缓存与数据库的一致性。

### 解答 2

#### （1）缓存介质选择：Redis（内存数据库）

原因：用户订单查询属于 “高频访问”，符合 “时间局部性”（同一用户会多次查询）；内存访问延迟（微秒级）远低于数据库（毫秒级），通过 “存储层次”（内存缓存→数据库）平衡速度与成本。

#### （2）缓存 key 设计（利用空间局部性）

go

```go
// 设计：按用户ID+时间范围分组，相邻时间的订单共享前缀
// key格式："user:orders:{userID}:{month}"（如"user:orders:10086:202409"）
func getCacheKey(userID int, month string) string {
    return fmt.Sprintf("user:orders:%d:%s", userID, month)
}
```

原理：同一用户的订单在时间上连续（如 9 月的订单），查询时会批量访问该月份的所有订单，符合 “空间局部性”（相邻时间的数据被连续访问），Redis 可高效批量读取同一前缀的 key。

#### （3）缓存一致性处理

- 采用 “更新数据库后异步更新缓存” 策略：用户新增订单时，先写数据库，再通过消息队列异步更新缓存（避免同步更新阻塞主流程）；
- 给缓存设置过期时间（如 24 小时），即使更新失败，过期后也会从数据库重新加载，保证最终一致性。

**理论对应**：

- 利用 “时间局部性”（用户重复查询）和 “空间局部性”（时间相邻的订单被批量访问）提升缓存命中率；
- 通过 “存储层次”（内存缓存→数据库）优化访问延迟，符合 “局部性与存储层次” 思想。

## 题目 3（中高应用）：并发处理与并行性优化

某 Go 后端 API 需要处理 “批量发送 1000 封邮件” 的请求，单封邮件发送耗时约 100ms（含网络 IO）。现有两种方案：
方案 A：单线程串行发送（循环调用`sendEmail`函数）；
方案 B：用 100 个 goroutine 并行发送（每个 goroutine 处理 10 封邮件）。
（1）计算两种方案的理论耗时（忽略 goroutine 调度开销）；
（2）若因邮件服务器限制，“并行发送的 goroutine 数超过 200 时，单封邮件耗时会增至 200ms”，此时最优 goroutine 数是多少？
（3）用 Go 实现方案 B，需避免 “goroutine 泄露” 和 “过度并发”。

### 解答 3

#### （1）耗时计算

- 方案 A（串行）：总耗时 = 1000 × 100ms = 100,000ms = **100 秒**；
- 方案 B（100 个 goroutine）：总耗时 ≈ (1000/100) × 100ms = 10 × 100ms = **1 秒**（并行处理，IO 操作可重叠）。

#### （2）最优 goroutine 数计算

设 goroutine 数为`n`，单封耗时为`t`：

- 当`n ≤ 200`时，`t = 100ms`，总耗时 = (1000/n) × 100ms；
- 当`n > 200`时，`t = 200ms`，总耗时 = (1000/n) × 200ms；
- 计算临界点：`n=200`时，耗时 = (1000/200)×100 = 500ms；`n=300`时，耗时 =(1000/300)×200≈667ms，故**最优为 200 个 goroutine**。

#### （3）Go 实现（控制并发数）

go

```go
func sendBulkEmails(emails []string) error {
    const maxGoroutines = 200
    sem := make(chan struct{}, maxGoroutines) // 信号量控制并发数
    var wg sync.WaitGroup
    var errCh = make(chan error, 1) // 捕获第一个错误
    
    for _, email := range emails {
        sem <- struct{}{} // 获取信号量，超过max则阻塞
        wg.Add(1)
        go func(e string) {
            defer wg.Done()
            defer func() { <-sem }() // 释放信号量
            
            if err := sendEmail(e); err != nil {
                select {
                case errCh <- err: // 只保存第一个错误
                default:
                }
            }
        }(email)
    }
    
    wg.Wait()
    close(errCh)
    return <-errCh // 返回可能的错误
}
```

**理论对应**：

- 符合 “并行性（Parallelism）” 思想：通过 goroutine 实现 “线程级并行”，重叠 IO 操作提升吞吐量；
- 体现 Amdahl 定律：并行加速受限于 “不可并行的部分”（如邮件服务器的 IO 瓶颈），过度并行反而因资源竞争降低性能。

## 题目 4（高难度应用）：性能瓶颈分析与优化

某 Go 后端服务的 API 接口出现性能问题：95% 请求延迟超过 500ms，吞吐量仅为 100 QPS（每秒查询数）。经排查，发现：

- 60% 的时间用于 “解析 JSON 请求体”（可并行优化）；
- 30% 的时间用于 “数据库查询”（受限于索引，难以并行）；
- 10% 的时间用于 “生成 JSON 响应”（可并行优化）。
  （1）计算该接口的 “可并行比例” 及理论最大加速比（基于 Amdahl 定律）；
  （2）设计优化方案，说明如何利用 Go 的特性（如 goroutine、JSON 库）提升性能；
  （3）优化后，若吞吐量提升至 300 QPS，95% 延迟降至 200ms，是否符合预期？

### 解答 4

#### （1）可并行比例与加速比

- 可并行部分：JSON 解析（60%）+ JSON 响应生成（10%）= **70%**（`p=0.7`）；
- 串行部分：数据库查询（30%）（`1-p=0.3`）；
- 理论最大加速比（并行度无限大时）= `1/(1-p) = 1/0.3 ≈ 3.33`倍。

#### （2）优化方案

- **并行处理 JSON 解析与响应生成**：
  用 goroutine 并行解析请求体中的多个字段（如用户信息、商品列表），避免串行解析；响应生成时，并行组装不同部分（如基础信息、明细列表）。

  go

  

  运行

  ```go
  // 并行解析示例
  type Request struct {
      User   User   `json:"user"`
      Items  []Item `json:"items"`
  }
  
  func parseRequest(data []byte) (Request, error) {
      var req Request
      // 解析整体结构（串行）
      if err := json.Unmarshal(data, &req); err != nil {
          return req, err
      }
      
      // 并行处理子结构的深层解析（如用户地址、商品详情）
      var wg sync.WaitGroup
      wg.Add(2)
      go func() { defer wg.Done(); parseUserDetails(&req.User) }()
      go func() { defer wg.Done(); parseItemDetails(&req.Items) }()
      wg.Wait()
      return req, nil
  }
  ```

- **数据库查询优化**：
  增加缓存（如 Redis）存储热点查询结果，利用 “时间局部性” 减少数据库访问；优化索引，降低单次查询耗时。

- **使用高效 JSON 库**：替换标准库`encoding/json`为`easyjson`（预编译代码生成），降低序列化 / 反序列化耗时（减少可并行部分的绝对时间）。

#### （3）优化效果评估

- 原吞吐量 100 QPS，优化后 300 QPS，提升 3 倍；原延迟 500ms，优化后 200ms，降低 60%；
- 理论最大加速比为 3.33 倍，实际提升 3 倍，**符合预期**（受限于实际并行度和串行部分的优化空间）。

**理论对应**：

- 应用 “性能衡量与优化” 思想：通过分解耗时比例，针对性优化可并行部分；
- 体现 Amdahl 定律：加速比受限于 30% 的串行数据库查询，无法无限提升；
- 利用 “并行性” 和 “局部性”（缓存热点数据）协同优化性能。

## 题目 5（综合设计）：分布式系统与冗余可靠性

某 Go 后端服务需要设计一个 “分布式任务调度系统”，要求：
（1）单节点故障时，任务能自动转移到其他节点，不丢失；
（2）任务执行结果需确保 “至少被成功存储一次”；
（3）支持每秒 1000 个任务的调度，延迟控制在 1 秒内。
请结合 “冗余可靠性（Redundancy）” 和 “性能衡量” 思想，设计核心架构并说明：

- 如何通过冗余实现故障容错；
- 如何平衡 “可靠性” 与 “性能”（延迟 / 吞吐量）。

### 解答 5

#### 核心架构设计

1. **集群架构**：

   - 3 个调度节点（主从模式）：主节点分配任务，从节点备份元数据（任务 ID、状态），主节点故障时从节点通过选举成为新主（**节点冗余**）；
   - 多个执行节点：接收任务并执行，每个任务至少被分配到 2 个执行节点（**执行冗余**）。

2. **数据存储**：

   - 任务元数据存储在分布式 K-V 数据库（如 etcd），3 副本部署（**数据冗余**）；
   - 执行结果写入分布式日志（如 Kafka），至少 2 副本，确保不丢失（**结果冗余**）。

3. **核心流程**：

   plaintext

   ```plaintext
   客户端提交任务 → 主调度节点分配任务给2个执行节点 → 
   执行节点并行执行 → 任一节点成功后写入结果日志 → 
   调度节点确认结果并标记任务完成（若两节点均失败，重新分配）
   ```

#### 冗余与容错实现

- **节点故障**：通过心跳检测（如每 100ms 一次）发现故障节点，主节点故障时从节点基于 Raft 协议选举新主，未完成的任务由新主重新分配；
- **任务丢失**：执行节点定期向调度节点汇报任务进度（checkpoint），超过超时时间未汇报则判定为失败，调度节点重新分配任务给其他节点；
- **数据可靠性**：etcd 和 Kafka 的多副本机制确保单节点存储故障时，数据不丢失。

#### 可靠性与性能的平衡

- **降低延迟**：任务分配时采用 “就近原则”（执行节点与数据存储在同一机房），减少网络延迟；结果日志采用 “异步写入”，执行节点完成任务后立即返回，后台异步同步结果；
- **提升吞吐量**：调度节点与执行节点通过消息队列（如 RabbitMQ）通信，解耦生产者与消费者，支持批量提交任务；
- **可靠性取舍**：非核心任务可降低副本数（如 1 个执行节点），以减少资源占用和延迟，核心任务保持 2 副本冗余。

**理论对应**：

- 符合 “冗余实现可靠性” 思想：通过节点、数据、执行多副本，避免单点故障；
- 体现 “性能衡量” 思想：在 “可靠性（至少一次存储）” 与 “延迟 / 吞吐量” 间权衡，根据任务重要性动态调整冗余策略；
- 结合 “并行性”：多执行节点并行处理任务，提升系统吞吐量。

## 总结

5 道题从 “接口抽象”→“缓存优化”→“并发处理”→“性能瓶颈分析”→“分布式系统设计”，逐步将体系结构理论与 Go 后端开发的核心场景（接口设计、缓存、并发、性能优化、分布式容错）结合，强调 “理论指导实践” 的思路 —— 理解底层原理才能设计出更高效、可靠的系统。



# 项目

以下是一个基于 CS61C 课程核心概念的 Go 实用工具，整合了数制转换、系统信息查看和并行性能测试功能，代码约 300 行，涵盖课程中的抽象、并行性、性能衡量等知识点。

CS61C课程相关的Go实用工具

V1

创建时间：17:41



### 工具功能说明

该工具基于 CS61C 课程中的核心概念设计，主要包含四个功能模块：

1. **数制转换模块**：实现十进制、二进制、十六进制之间的相互转换，直接应用课程中关于数制表示的基础知识。
2. **补码计算模块**：计算指定数值的 N 位补码表示，帮助理解计算机中负数的存储方式，这是课程中数据表示的核心内容。
3. **系统信息模块**：展示 CPU 核心数、内存使用和系统架构等信息，体现对硬件系统的认知，与课程中的计算机体系结构内容对应。
4. **并行性能测试模块**：通过不同数量的 goroutine 计算素数，展示并行性对性能的影响，验证 Amdahl 定律，直观体现课程中的并行性思想。

### 使用方法

编译并运行工具，通过命令行参数指定功能：

bash



```bash
# 数制转换（十进制42转二进制）
go run cs61c_tool.go -convert dec:42:bin

# 计算补码（-5的8位补码）
go run cs61c_tool.go -complement -5:8

# 查看系统信息
go run cs61c_tool.go -sysinfo

# 并行性能测试（计算1到100000的素数，使用4个goroutine）
go run cs61c_tool.go -parallel 100000:4
```

这个工具将课程中的理论知识转化为可交互的实践功能，帮助加深对计算机体系结构核心概念的理解和应用。

```go
package main

import (
	"flag"
	"fmt"
	"os"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"
)

// 数制转换模块 - 基于课程中的数制表示知识
type NumberConverter interface {
	DecimalToBinary(int) string
	BinaryToDecimal(string) (int, error)
	HexToDecimal(string) (int, error)
	DecimalToHex(int) string
	TwosComplement(int, int) string // 补码表示
}

// 实现数制转换接口
type BasicConverter struct{}

func (c *BasicConverter) DecimalToBinary(n int) string {
	if n == 0 {
		return "0"
	}
	isNegative := n < 0
	if isNegative {
		n = -n
	}

	var bits []byte
	for n > 0 {
		bits = append(bits, byte(n%2)+'0')
		n /= 2
	}

	// 反转结果
	for i, j := 0, len(bits)-1; i < j; i, j = i+1, j-1 {
		bits[i], bits[j] = bits[j], bits[i]
	}

	result := string(bits)
	if isNegative {
		return "-" + result
	}
	return result
}

func (c *BasicConverter) BinaryToDecimal(bin string) (int, error) {
	return strconv.ParseInt(bin, 2, 64)
}

func (c *BasicConverter) HexToDecimal(hex string) (int, error) {
	// 移除0x前缀
	hex = strings.TrimPrefix(hex, "0x")
	val, err := strconv.ParseInt(hex, 16, 64)
	return int(val), err
}

func (c *BasicConverter) DecimalToHex(n int) string {
	return fmt.Sprintf("0x%x", n)
}

func (c *BasicConverter) TwosComplement(n, bits int) string {
	if n >= 0 {
		bin := c.DecimalToBinary(n)
		// 补前导0
		if len(bin) < bits {
			return strings.Repeat("0", bits-len(bin)) + bin
		}
		return bin[:bits]
	}

	// 计算负数的补码
	abs := -n
	bin := c.DecimalToBinary(abs)
	// 补前导0到指定位数
	if len(bin) < bits {
		bin = strings.Repeat("0", bits-len(bin)) + bin
	} else {
		bin = bin[:bits]
	}

	// 按位取反
	bytes := []byte(bin)
	for i := 0; i < len(bytes); i++ {
		if bytes[i] == '0' {
			bytes[i] = '1'
		} else {
			bytes[i] = '0'
		}
	}

	// 加1
	result := make([]byte, bits)
	carry := 1
	for i := bits - 1; i >= 0; i-- {
		val := int(bytes[i]-'0') + carry
		if val == 2 {
			result[i] = '0'
			carry = 1
		} else {
			result[i] = byte(val) + '0'
			carry = 0
			break
		}
	}

	return string(result)
}

// 系统信息模块 - 体现抽象和硬件认知
type SystemInfo interface {
	GetCPUInfo() string
	GetMemoryInfo() string
	GetArchitecture() string
}

type BasicSystemInfo struct{}

func (s *BasicSystemInfo) GetCPUInfo() string {
	return fmt.Sprintf("CPU核心数: %d", runtime.NumCPU())
}

func (s *BasicSystemInfo) GetMemoryInfo() string {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return fmt.Sprintf("总内存: %.2f MB, 已使用: %.2f MB",
		float64(m.TotalAlloc)/1024/1024,
		float64(m.Alloc)/1024/1024)
}

func (s *BasicSystemInfo) GetArchitecture() string {
	return fmt.Sprintf("架构: %s, 操作系统: %s", runtime.GOARCH, runtime.GOOS)
}

// 并行性能测试模块 - 基于并行性和性能衡量知识
func parallelPrimeTest(max int, goroutines int) time.Duration {
	start := time.Now()
	chunkSize := (max + goroutines - 1) / goroutines
	var wg sync.WaitGroup

	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		startNum := i*chunkSize + 1
		endNum := startNum + chunkSize - 1
		if endNum > max {
			endNum = max
		}

		go func(s, e int) {
			defer wg.Done()
			for num := s; num <= e; num++ {
				isPrime(num)
			}
		}(startNum, endNum)
	}

	wg.Wait()
	return time.Since(start)
}

// 简单的素数判断
func isPrime(n int) bool {
	if n <= 1 {
		return false
	}
	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	return true
}

// 主函数 - 命令行接口
func main() {
	// 命令行参数
	convertFlag := flag.String("convert", "", "数制转换，格式: 源类型:值:目标类型 (支持dec, bin, hex)")
	complementFlag := flag.String("complement", "", "计算补码，格式: 数值:位数")
	systemInfoFlag := flag.Bool("sysinfo", false, "显示系统信息")
	parallelTestFlag := flag.String("parallel", "", "并行性能测试，格式: 最大数:goroutine数")

	flag.Parse()

	// 数制转换功能
	if *convertFlag != "" {
		parts := strings.Split(*convertFlag, ":")
		if len(parts) != 3 {
			fmt.Println("转换格式错误，正确格式: 源类型:值:目标类型 (如 dec:42:bin)")
			os.Exit(1)
		}

		converter := &BasicConverter{}
		sourceType, value, targetType := parts[0], parts[1], parts[2]
		var num int
		var err error

		switch sourceType {
		case "dec":
			num, err = strconv.Atoi(value)
		case "bin":
			num, err = converter.BinaryToDecimal(value)
		case "hex":
			num, err = converter.HexToDecimal(value)
		default:
			fmt.Println("不支持的源类型，支持: dec, bin, hex")
			os.Exit(1)
		}

		if err != nil {
			fmt.Printf("转换错误: %v\n", err)
			os.Exit(1)
		}

		switch targetType {
		case "dec":
			fmt.Println(num)
		case "bin":
			fmt.Println(converter.DecimalToBinary(num))
		case "hex":
			fmt.Println(converter.DecimalToHex(num))
		default:
			fmt.Println("不支持的目标类型，支持: dec, bin, hex")
			os.Exit(1)
		}
		return
	}

	// 补码计算功能
	if *complementFlag != "" {
		parts := strings.Split(*complementFlag, ":")
		if len(parts) != 2 {
			fmt.Println("补码格式错误，正确格式: 数值:位数 (如 -5:8)")
			os.Exit(1)
		}

		num, err1 := strconv.Atoi(parts[0])
		bits, err2 := strconv.Atoi(parts[1])
		if err1 != nil || err2 != nil || bits <= 0 {
			fmt.Println("无效的数值或位数")
			os.Exit(1)
		}

		converter := &BasicConverter{}
		fmt.Printf("%d的%d位补码: %s\n", num, bits, converter.TwosComplement(num, bits))
		return
	}

	// 系统信息功能
	if *systemInfoFlag {
		sysInfo := &BasicSystemInfo{}
		fmt.Println("系统信息:")
		fmt.Println("-", sysInfo.GetArchitecture())
		fmt.Println("-", sysInfo.GetCPUInfo())
		fmt.Println("-", sysInfo.GetMemoryInfo())
		return
	}

	// 并行性能测试功能
	if *parallelTestFlag != "" {
		parts := strings.Split(*parallelTestFlag, ":")
		if len(parts) != 2 {
			fmt.Println("并行测试格式错误，正确格式: 最大数:goroutine数 (如 100000:4)")
			os.Exit(1)
		}

		maxNum, err1 := strconv.Atoi(parts[0])
		goroutines, err2 := strconv.Atoi(parts[1])
		if err1 != nil || err2 != nil || maxNum <= 0 || goroutines <= 0 {
			fmt.Println("无效的数值或goroutine数")
			os.Exit(1)
		}

		fmt.Printf("测试: 计算1到%d的素数，使用%d个goroutine...\n", maxNum, goroutines)
		duration := parallelPrimeTest(maxNum, goroutines)
		fmt.Printf("完成，耗时: %v\n", duration)
		
		// 展示并行性影响
		if goroutines > 1 {
			fmt.Printf("提示: 尝试不同的goroutine数可以观察并行性能变化，体现Amdahl定律\n")
		}
		return
	}

	// 未指定任何功能，显示帮助
	fmt.Println("CS61C课程实用工具")
	fmt.Println("用法:")
	flag.PrintDefaults()
	fmt.Println("\n示例:")
	fmt.Println("  数制转换: cs61c_tool -convert dec:42:bin")
	fmt.Println("  补码计算: cs61c_tool -complement -5:8")
	fmt.Println("  系统信息: cs61c_tool -sysinfo")
	fmt.Println("  并行测试: cs61c_tool -parallel 100000:4")
}
    
```

