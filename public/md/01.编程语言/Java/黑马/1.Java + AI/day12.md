# 【Java +AI ｜基础加强篇day12 File + 递归 + IO 流】

## 一、File 类 —— 文件与文件夹的操作核心

File 类是 `java.io` 包下的核心类，用于代表操作系统中的文件或文件夹，仅负责操作文件 / 文件夹本身（如创建、删除、获取信息），**不能读写文件内部数据**。其核心价值是搭建程序与磁盘文件的桥梁，为 IO 流提供操作目标。

### 1. File 类核心基础

#### （1）构造器与路径表示

File 类通过路径创建对象，支持绝对路径和相对路径，构造器灵活适配不同路径场景：

| 构造器                              | 说明                                  | 示例                                                         |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `File(String pathname)`             | 根据完整路径（绝对 / 相对）创建对象   | `new File("D:\\test.txt")`（绝对路径）、`new File("src\\a.txt")`（相对路径） |
| `File(String parent, String child)` | 父路径 + 子路径拼接创建对象           | `new File("D:\\", "test.txt")`                               |
| `File(File parent, String child)`   | 父路径 File 对象 + 子路径拼接创建对象 | `new File(new File("D:\\"), "test.txt")`                     |

- **绝对路径**：从盘符开始（如 `D:\\test.txt`），路径唯一。
- **相对路径**：不带盘符，默认基于当前工程根目录（如 `src\\a.txt` 等价于 `工程根目录\\src\\a.txt`）。
- 注意：File 对象仅封装路径，路径可存在或不存在，不影响对象创建。

#### （2）核心方法分类

File 类的方法围绕 “判断、获取、创建、删除、遍历” 五大功能，核心方法如下：

##### ① 判断文件类型与路径存在性

| 方法名                  | 说明                       |
| ----------------------- | -------------------------- |
| `boolean exists()`      | 判断路径是否存在           |
| `boolean isFile()`      | 判断是否为文件（非文件夹） |
| `boolean isDirectory()` | 判断是否为文件夹           |

##### ② 获取文件信息

| 方法名                     | 说明                                     |
| -------------------------- | ---------------------------------------- |
| `String getName()`         | 获取文件 / 文件夹名称（含后缀）          |
| `long length()`            | 获取文件大小（字节数），文件夹返回 0     |
| `long lastModified()`      | 获取最后修改时间（毫秒时间戳）           |
| `String getPath()`         | 获取创建对象时的路径（传入路径原样返回） |
| `String getAbsolutePath()` | 获取绝对路径（无论传入相对 / 绝对路径）  |

##### ③ 创建与删除操作

| 方法名                    | 说明                                       | 注意事项                                                 |
| ------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| `boolean createNewFile()` | 创建空文件（父文件夹不存在则失败）         | 需处理 `IOException`                                     |
| `boolean mkdir()`         | 创建一级文件夹（父文件夹不存在则失败）     | 如 `new File("D:\\a\\b").mkdir()` 失败（a 不存在）       |
| `boolean mkdirs()`        | 创建多级文件夹（父文件夹不存在则自动创建） | 如 `new File("D:\\a\\b").mkdirs()` 成功                  |
| `boolean delete()`        | 删除文件或空文件夹                         | 非空文件夹无法直接删除，需先删除内部内容；删除不进回收站 |

##### ④ 遍历文件夹

| 方法名               | 说明                          | 核心特点                                   |
| -------------------- | ----------------------------- | ------------------------------------------ |
| `String[] list()`    | 返回一级文件 / 文件夹名称数组 | 仅返回名称，需手动拼接路径                 |
| `File[] listFiles()` | 返回一级文件 / 文件夹对象数组 | 推荐使用，直接操作 File 对象，包含完整路径 |

**listFiles () 注意事项**：

- 路径不存在 / 是文件：返回 `null`。
- 空文件夹：返回长度为 0 的数组。
- 有内容文件夹：返回一级所有文件 / 文件夹对象（含隐藏文件）。
- 无访问权限：返回 `null`。

### 2. 典型应用场景与案例

#### （1）创建多级文件夹并创建文件

java

```java
public class FileDemo {
    public static void main(String[] args) throws IOException {
        // 1. 创建多级文件夹 D:\\test\\io
        File dir = new File("D:\\test\\io");
        if (!dir.exists()) {
            boolean success = dir.mkdirs(); // 创建多级文件夹
            System.out.println("文件夹创建：" + success);
        }

        // 2. 在文件夹下创建文件 test.txt
        File file = new File(dir, "test.txt");
        if (!file.exists()) {
            boolean success = file.createNewFile(); // 创建空文件
            System.out.println("文件创建：" + success);
        }

        // 3. 获取文件信息
        System.out.println("文件名称：" + file.getName());
        System.out.println("文件大小：" + file.length() + "字节");
        System.out.println("绝对路径：" + file.getAbsolutePath());
    }
}
```

#### （2）遍历文件夹下所有文件（一级）

java

```java
public class FileTraverseDemo {
    public static void main(String[] args) {
        File dir = new File("D:\\test\\io");
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles(); // 获取一级文件对象数组
            for (File f : files) {
                if (f.isFile()) {
                    System.out.println("文件：" + f.getName() + "，大小：" + f.length() + "字节");
                } else {
                    System.out.println("文件夹：" + f.getName());
                }
            }
        }
    }
}
```

------

## 二、方法递归 —— 重复逻辑的高效实现

递归是一种算法，指方法调用自身的形式，核心用于解决 “有规律重复、可拆分为子问题” 的场景（如文件搜索、数学运算）。其核心是避免冗余代码，简化复杂逻辑，但需严格控制终止条件。

### 1. 递归核心三要素

递归的正确执行依赖三个核心条件，缺一不可，否则会导致栈内存溢出（`StackOverflowError`）：

1. **递归公式**：将大问题拆分为子问题的核心逻辑（如 `f(n) = f(n-1) * n`）。
2. **终结点**：递归停止的条件（如 `f(1) = 1`），避免无限递归。
3. **递归方向**：子问题必须向终结点靠拢（如 `n` 从 5 逐步减至 1）。

### 2. 经典递归案例解析

#### （1）案例 1：求 n 的阶乘（`n! = 1×2×...×n`）

- 递归公式：`f(n) = f(n-1) × n`

- 终结点：`f(1) = 1`

- 代码实现：

  java

  ```java
  public class FactorialDemo {
      public static void main(String[] args) {
          System.out.println(f(5)); // 输出 120（5! = 5×4×3×2×1）
      }
  
      public static int f(int n) {
          if (n == 1) {
              return 1; // 终结点
          }
          return n * f(n - 1); // 递归公式，方向向终结点靠拢
      }
  }
  ```

- 执行流程：栈内存依次压入 `f(5)→f(4)→f(3)→f(2)→f(1)`，再从 `f(1)` 开始回溯计算结果。

#### （2）案例 2：递归搜索文件夹下的目标文件

需求：从 `D:` 盘搜索 `QQ.exe` 文件，找到后输出绝对路径。

- 核心逻辑：遍历一级文件夹，是文件则判断名称，是文件夹则递归遍历。

- 代码实现：

  java

  ```java
  public class FileSearchDemo {
      public static void main(String[] args) {
          searchFile(new File("D:\\"), "QQ.exe");
      }
  
      public static void searchFile(File dir, String target) {
          // 1. 校验路径合法性
          if (dir == null || !dir.exists() || !dir.isDirectory()) {
              return;
          }
  
          // 2. 遍历一级文件对象
          File[] files = dir.listFiles();
          if (files == null) {
              return; // 无权限访问该文件夹
          }
  
          // 3. 循环判断
          for (File f : files) {
              if (f.isFile() && f.getName().equals(target)) {
                  System.out.println("找到目标文件：" + f.getAbsolutePath());
              } else if (f.isDirectory()) {
                  searchFile(f, target); // 递归遍历子文件夹
              }
          }
      }
  }
  ```

#### （3）案例 3：猴子吃桃问题（逆向递归）

需求：猴子每天吃前一天剩余桃子的一半 + 1，第 10 天剩 1 个，求第一天摘的桃子数。

- 递归公式（逆向推导）：`f(n) = (f(n+1) + 1) × 2`（第 n 天桃子数 = 第 n+1 天桃子数 + 1 再 ×2）

- 终结点：`f(10) = 1`

- 代码实现：

  java

  ```java
  public class MonkeyPeachDemo {
      public static void main(String[] args) {
          System.out.println("第一天摘的桃子数：" + f(1)); // 输出 1534
      }
  
      public static int f(int day) {
          if (day == 10) {
              return 1; // 终结点：第10天剩1个
          }
          return (f(day + 1) + 1) * 2; // 逆向递归公式
      }
  }
  ```

### 3. 递归风险与注意事项

- **栈内存溢出**：未控制终结点或递归层级过深（如 `f(10000)`），导致栈内存耗尽，需合理控制递归深度（复杂场景用迭代替代）。
- **效率问题**：递归会产生栈帧压入 / 弹出开销，简单重复逻辑（如 1-100 求和）优先用迭代。
- **适用场景**：文件夹遍历、树形结构处理、数学规律运算等 “拆分后逻辑一致” 的场景。

------

## 三、字符集 —— 数据编码与解码的核心

字符集是字符与字节的映射规则，决定了如何将 “字符” 转换为 “字节”（编码）和 “字节” 还原为 “字符”（解码）。编码解码使用的字符集必须一致，否则会出现乱码。

### 1. 常见字符集与核心差异

不同字符集的编码规则、支持字符范围、存储占用差异显著，开发中需根据场景选择：

| 字符集  | 支持字符         | 编码规则                                     | 核心特点                                 |
| ------- | ---------------- | -------------------------------------------- | ---------------------------------------- |
| ASCII   | 英文、数字、符号 | 1 个字节存储（首位为 0），共 128 个字符      | 基础字符集，所有字符集兼容 ASCII         |
| GBK     | 中文、ASCII      | 中文占 2 个字节（首位为 1），英文占 1 个字节 | 国标编码，仅支持中文字符，不支持其他语言 |
| UTF-8   | 全球所有字符     | 英文 1 字节、中文 3 字节、特殊字符 1-4 字节  | 互联网标准编码，兼容 ASCII，开发首选     |
| Unicode | 全球所有字符     | 固定 2 字节（UTF-16）或 4 字节（UTF-32）     | 字符集标准，UTF-8 是其可变长编码方案     |

### 2. 编码与解码的 Java 实现

Java 中通过 `String` 类的方法实现编码解码，核心 API 如下：

#### （1）编码：字符 → 字节（`String → byte[]`）

| 方法                              | 说明                                                        | 示例                       |
| --------------------------------- | ----------------------------------------------------------- | -------------------------- |
| `byte[] getBytes()`               | 使用平台默认字符集编码（如 GBK、UTF-8）                     | `"中国".getBytes()`        |
| `byte[] getBytes(String charset)` | 使用指定字符集编码（需处理 `UnsupportedEncodingException`） | `"中国".getBytes("UTF-8")` |

#### （2）解码：字节 → 字符（`byte[] → String`）

| 构造器                                 | 说明                             | 示例                                   |
| -------------------------------------- | -------------------------------- | -------------------------------------- |
| `String(byte[] bytes)`                 | 使用平台默认字符集解码           | `new String("中国".getBytes("UTF-8"))` |
| `String(byte[] bytes, String charset)` | 使用指定字符集解码（需处理异常） | `new String(bytes, "UTF-8")`           |

### 3. 乱码原因与解决方案

#### （1）乱码核心原因

- 编码与解码字符集不一致（如 UTF-8 编码的字节用 GBK 解码）。
- 字节不完整（如 UTF-8 中文占 3 字节，仅读取 2 字节解码）。

#### （2）解决方案

- 统一字符集为 UTF-8（开发、数据库、文件存储统一）。

- 确保字节完整性（如读取文件时一次性读取全部字节，避免中文被拆分）。

- 示例：解决中文乱码

  java

  ```java
  public class CharsetDemo {
      public static void main(String[] args) throws UnsupportedEncodingException {
          // 1. 编码：中文 → UTF-8 字节
          String str = "中国";
          byte[] utf8Bytes = str.getBytes("UTF-8"); // 长度为6（3×2）
  
          // 2. 解码：UTF-8 字节 → 中文（正确）
          String utf8Str = new String(utf8Bytes, "UTF-8");
          System.out.println(utf8Str); // 输出 中国
  
          // 3. 错误解码：UTF-8 字节 → GBK（乱码）
          String gbkStr = new String(utf8Bytes, "GBK");
          System.out.println(gbkStr); // 输出 涓浗（乱码）
      }
  }
  ```

------

## 四、IO 流 —— 数据读写的核心机制

IO 流（Input/Output）是 Java 用于读写数据的核心工具，以内存为基准，分为输入流（读数据到内存）和输出流（写数据到磁盘 / 网络），支持字节、字符两种数据类型，覆盖所有文件读写场景。

### 1. IO 流核心分类与体系结构

#### （1）分类维度

- 按**数据流向**：输入流（`InputStream`/`Reader`）、输出流（`OutputStream`/`Writer`）。

- 按

  数据类型

  ：字节流（

  ```
  InputStream
  ```

  /

  ```
  OutputStream
  ```

  ）、字符流（

  ```
  Reader
  ```

  /

  ```
  Writer
  ```

  ）。

  - 字节流：适用于所有文件（音频、视频、图片、文本），万能流。
  - 字符流：仅适用于纯文本文件（`.txt`/`.java`），避免中文乱码。

#### （2）核心体系结构（抽象类 + 实现类）

IO 流基于抽象类定义规范，实现类适配具体场景（文件、缓冲、转换等）：

plaintext

```plaintext
// 字节流（抽象父类）
InputStream（字节输入流）→ 实现类：FileInputStream、BufferedInputStream、DataInputStream
OutputStream（字节输出流）→ 实现类：FileOutputStream、BufferedOutputStream、DataOutputStream

// 字符流（抽象父类）
Reader（字符输入流）→ 实现类：FileReader、BufferedReader、InputStreamReader
Writer（字符输出流）→ 实现类：FileWriter、BufferedWriter、PrintWriter
```

### 2. 字节流 —— 万能数据读写工具

字节流以字节为单位读写数据，是所有 IO 流的基础，核心用于文件复制、二进制数据传输（如图片、视频）。

#### （1）文件字节输入流（`FileInputStream`）

- 作用：从磁盘文件读字节到内存。

- 核心构造器：

  - `FileInputStream(File file)`：传入 File 对象。
  - `FileInputStream(String path)`：传入文件路径。

- 核心方法：

  | 方法名                  | 说明                                       | 特点                                      |
  | ----------------------- | ------------------------------------------ | ----------------------------------------- |
  | `int read()`            | 每次读 1 个字节，返回字节值（-1 表示读完） | 性能差，适合小文件                        |
  | `int read(byte[] buf)`  | 每次读 1 个字节数组，返回实际读取字节数    | 性能优，推荐使用（缓冲区大小建议 1024×8） |
  | `byte[] readAllBytes()` | 一次性读全部字节（JDK9+）                  | 避免乱码，大文件可能内存溢出              |

- 示例：读取文本文件（避免中文乱码）

  java

  ```java
  public class FileInputStreamDemo {
      public static void main(String[] args) throws IOException {
          // 1. 创建流对象
          try (FileInputStream fis = new FileInputStream("test.txt")) {
              // 2. 一次性读取全部字节（适合小文件）
              byte[] bytes = fis.readAllBytes();
              // 3. 解码为字符串（指定UTF-8）
              String content = new String(bytes, "UTF-8");
              System.out.println(content);
          }
      }
  }
  ```

#### （2）文件字节输出流（`FileOutputStream`）

- 作用：从内存写字节到磁盘文件。

- 核心构造器（支持追加模式）：

  - `FileOutputStream(File file, boolean append)`：`append=true` 表示追加数据，不覆盖。

- 核心方法：

  | 方法名                                     | 说明                                             |
  | ------------------------------------------ | ------------------------------------------------ |
  | `void write(int b)`                        | 写 1 个字节                                      |
  | `void write(byte[] buf)`                   | 写 1 个字节数组                                  |
  | `void write(byte[] buf, int off, int len)` | 写字节数组的部分内容（off：起始索引，len：长度） |

- 示例：文件复制（字节流核心应用）

  java

  ```java
  public class FileCopyDemo {
      public static void main(String[] args) throws IOException {
          // 源文件：D:\\test.jpg，目标文件：E:\\test_copy.jpg
          long start = System.currentTimeMillis();
  
          // try-with-resource：自动关闭流（实现AutoCloseable接口）
          try (FileInputStream fis = new FileInputStream("D:\\test.jpg");
               FileOutputStream fos = new FileOutputStream("E:\\test_copy.jpg")) {
  
              byte[] buf = new byte[1024 * 8]; // 8KB缓冲区，平衡性能与内存
              int len; // 记录每次读取的字节数
              while ((len = fis.read(buf)) != -1) {
                  fos.write(buf, 0, len); // 写入实际读取的字节
              }
          }
  
          long end = System.currentTimeMillis();
          System.out.println("复制完成，耗时：" + (end - start) + "ms");
      }
  }
  ```

#### （3）资源释放机制

IO 流是 “稀缺资源”（占用系统文件句柄），必须关闭，否则会导致资源泄漏。Java 提供两种释放方案：

1. **传统方案：try-catch-finally**（JDK7 前）：

java

```java
FileInputStream fis = null;
FileOutputStream fos = null;
try {
    fis = new FileInputStream("src.jpg");
    fos = new FileOutputStream("dest.jpg");
    // 读写逻辑
} catch (IOException e) {
    e.printStackTrace();
} finally {
    // 关闭资源（先关输出流，后关输入流）
    if (fos != null) fos.close();
    if (fis != null) fis.close();
}
```

1. 推荐方案：try-with-resource

   （JDK7+）：

   直接在

   ```
   try() 
   ```

   中定义流对象，自动关闭（无需手动调用

   ```
   close()
   ```

   ），代码简洁：

java

```java
try (FileInputStream fis = new FileInputStream("src.jpg");
     FileOutputStream fos = new FileOutputStream("dest.jpg")) {
    // 读写逻辑
} catch (IOException e) {
    e.printStackTrace();
}
```

### 3. 字符流 —— 纯文本文件的最优选择

字符流以字符为单位读写数据，底层自动处理编码解码（默认使用平台字符集），避免中文乱码，仅适用于纯文本文件。

#### （1）文件字符输入流（`FileReader`）

- 作用：读纯文本文件的字符到内存。

- 核心构造器：`FileReader(File file)`、`FileReader(String path)`。

- 核心方法：

  | 方法名                 | 说明                                          |
  | ---------------------- | --------------------------------------------- |
  | `int read()`           | 读 1 个字符，返回字符 ASCII 值（-1 表示读完） |
  | `int read(char[] buf)` | 读 1 个字符数组，返回实际读取字符数           |

- 示例：读取 UTF-8 编码的文本文件

  java

  ```java
  public class FileReaderDemo {
      public static void main(String[] args) throws IOException {
          try (FileReader fr = new FileReader("test.txt")) {
              char[] buf = new char[1024];
              int len;
              while ((len = fr.read(buf)) != -1) {
                  // 直接转换为字符串，无乱码
                  System.out.print(new String(buf, 0, len));
              }
          }
      }
  }
  ```

#### （2）文件字符输出流（`FileWriter`）

- 作用：写字符到纯文本文件。

- 核心构造器：支持追加模式（`append=true`）。

- 核心方法：

  | 方法名                   | 说明                                         |
  | ------------------------ | -------------------------------------------- |
  | `void write(int c)`      | 写 1 个字符                                  |
  | `void write(String str)` | 写 1 个字符串（推荐，避免编码问题）          |
  | `void write(char[] buf)` | 写 1 个字符数组                              |
  | `void flush()`           | 刷新缓冲区（字符流必须刷新，否则数据不生效） |

- 关键注意：字符流有缓冲区，写字节后必须调用 `flush()` 或 `close()`（包含刷新），否则数据会残留在缓冲区，文件中无内容。

- 示例：写入中文到文本文件

  java

  ```java
  public class FileWriterDemo {
      public static void main(String[] args) throws IOException {
          try (FileWriter fw = new FileWriter("output.txt", true)) { // 追加模式
              fw.write("你好，Java IO流！"); // 写字符串
              fw.write("\r\n"); // 换行（Windows系统）
              fw.flush(); // 刷新缓冲区，数据生效
          }
      }
  }
  ```

### 4. 缓冲流 —— 性能优化的核心

缓冲流是 “装饰器模式” 的实现，通过自带的 8KB 缓冲区（字节 / 字符）减少磁盘 IO 次数，大幅提升读写性能，核心是 “包装” 原始流（如 `FileInputStream`）。

#### （1）缓冲字节流（`BufferedInputStream`/`BufferedOutputStream`）

- 核心原理：自带 8KB 字节缓冲区，读取时先填满缓冲区，再批量写入内存；写入时先存缓冲区，满后批量写入磁盘，减少 IO 次数。

- 构造器：`new BufferedInputStream(InputStream is)`、`new BufferedOutputStream(OutputStream os)`。

- 性能对比：原始字节流（1 字节读写）< 原始字节流（字节数组）< 缓冲字节流（字节数组）（最优）。

- 示例：缓冲流文件复制（性能最优方案）

  java

  ```java
  public class BufferedStreamDemo {
      public static void main(String[] args) throws IOException {
          long start = System.currentTimeMillis();
  
          try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("D:\\large_video.mp4"));
               BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("E:\\video_copy.mp4"))) {
  
              byte[] buf = new byte[1024 * 8];
              int len;
              while ((len = bis.read(buf)) != -1) {
                  bos.write(buf, 0, len);
              }
          }
  
          long end = System.currentTimeMillis();
          System.out.println("缓冲流复制耗时：" + (end - start) + "ms"); // 比原始流快5-10倍
      }
  }
  ```

  

#### （2）缓冲字符流（`BufferedReader`/`BufferedWriter`）

- 核心优势：自带 8KB 字符缓冲区，且新增实用方法：

  - `BufferedReader.readLine()`：按行读取文本（返回 null 表示读完），无需手动处理换行符。
  - `BufferedWriter.newLine()`：跨平台换行（自动适配 Windows/Linux 换行符）。

- 示例：按行读取文本并写入新文件

  java

  ```java
  public class BufferedCharStreamDemo {
      public static void main(String[] args) throws IOException {
          try (BufferedReader br = new BufferedReader(new FileReader("input.txt"));
               BufferedWriter bw = new BufferedWriter(new FileWriter("output.txt"))) {
  
              String line;
              while ((line = br.readLine()) != null) { // 按行读取
                  bw.write(line); // 写行内容
                  bw.newLine(); // 跨平台换行
              }
          }
      }
  }
  ```

  

### 5. 其他核心流 —— 解决特殊场景

#### （1）字符输入转换流（`InputStreamReader`）

- 核心问题：`FileReader` 默认使用平台字符集，读取非平台编码的文件（如 UTF-8 文本在 GBK 系统）会乱码。

- 作用：将字节输入流按指定字符集转换为字符输入流，解决字符流乱码问题。

- 构造器：`new InputStreamReader(InputStream is, String charset)`。

- 示例：读取 UTF-8 编码的文本文件（GBK 系统）

  java

  ```java
  public class InputStreamReaderDemo {
      public static void main(String[] args) throws IOException {
          // 字节流 → 转换流（指定UTF-8）→ 缓冲字符流（按行读）
          try (InputStreamReader isr = new InputStreamReader(new FileInputStream("utf8_file.txt"), "UTF-8");
               BufferedReader br = new BufferedReader(isr)) {
  
              String line;
              while ((line = br.readLine()) != null) {
                  System.out.println(line); // 无乱码
              }
          }
      }
  }
  ```

  

#### （2）打印流（`PrintStream`/`PrintWriter`）

- 核心优势：支持打印任意类型数据（`int`/`String`/`Object`），自动转换为字符串，无需手动编码，性能高效。

- 分类：

  - `PrintStream`：字节打印流（如 `System.out` 本质是 `PrintStream`）。
  - `PrintWriter`：字符打印流（支持指定字符集，推荐用于文本输出）。

- 示例：用

   

  ```
  PrintWriter
  ```

   

  写入日志

  java

  ```java
  public class PrintWriterDemo {
      public static void main(String[] args) throws IOException {
          // 支持自动刷新（第二个参数true）
          try (PrintWriter pw = new PrintWriter(new FileWriter("log.txt", true), true)) {
              pw.println("[" + new Date() + "] 系统启动成功"); // 打印字符串+换行
              pw.println("[" + new Date() + "] 用户登录：admin");
          }
      }
  }
  ```

  

#### （3）数据流（`DataInputStream`/`DataOutputStream`）

- 核心作用：读写数据时保留数据类型（如 `int`/`double`），避免手动转换。

- 示例：写入

  ```
  int
  ```

  和

  ```
  String
  ```

  并读取

  java

  ```java
  public class DataStreamDemo {
      public static void main(String[] args) throws IOException {
          // 写入数据（保留类型）
          try (DataOutputStream dos = new DataOutputStream(new FileOutputStream("data.dat"))) {
              dos.writeInt(100); // 写int类型（4字节）
              dos.writeUTF("Java数据流"); // 写UTF-8字符串
          }
  
          // 读取数据（还原类型）
          try (DataInputStream dis = new DataInputStream(new FileInputStream("data.dat"))) {
              int num = dis.readInt(); // 读int类型
              String str = dis.readUTF(); // 读UTF-8字符串
              System.out.println(num + ", " + str); // 输出 100, Java数据流
          }
      }
  }
  ```

  

### 6. Commons-IO 框架 —— 简化 IO 操作

Apache Commons-IO 是开源工具框架，封装了 Java 原生 IO 流的冗余代码，提供简洁 API，开发中推荐使用。

#### （1）核心步骤

1. 导入 `commons-io-xxx.jar` 包（项目创建 `lib` 文件夹，添加为 Library）。
2. 核心工具类：`FileUtils`（文件 / 文件夹操作）、`IOUtils`（流操作）。

#### （2）常用 API 示例

java

```java
import org.apache.commons.io.FileUtils;
import java.io.File;
import java.io.IOException;

public class CommonsIODemo {
    public static void main(String[] args) throws IOException {
        // 1. 复制文件（一行代码）
        FileUtils.copyFile(new File("src.jpg"), new File("dest.jpg"));

        // 2. 复制文件夹（含子文件夹）
        FileUtils.copyDirectory(new File("D:\\test"), new File("E:\\test_copy"));

        // 3. 读取文件为字符串（指定UTF-8）
        String content = FileUtils.readFileToString(new File("test.txt"), "UTF-8");

        // 4. 写入字符串到文件（追加模式）
        FileUtils.writeStringToFile(new File("output.txt"), "Commons-IO测试", "UTF-8", true);
    }
}
```

------

## 五、综合实战案例：石头迷阵游戏历史最少步数记录

### 1. 需求

石头迷阵游戏胜利后，记录并展示历史最少步数：

- 游戏启动时，读取磁盘文件（`min_steps.txt`）中的历史最少步数。
- 玩家胜利后，对比当前步数与历史步数，更新最小值并写入文件。

### 2. 核心实现

java

```java
import java.io.*;

public class GameStepRecord {
    private static final String FILE_PATH = "min_steps.txt";

    // 读取历史最少步数（无文件则返回Integer.MAX_VALUE）
    public static int readMinSteps() {
        File file = new File(FILE_PATH);
        if (!file.exists()) {
            return Integer.MAX_VALUE;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line = br.readLine();
            return line == null ? Integer.MAX_VALUE : Integer.parseInt(line);
        } catch (IOException e) {
            e.printStackTrace();
            return Integer.MAX_VALUE;
        }
    }

    // 写入新的最少步数
    public static void writeMinSteps(int steps) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(FILE_PATH))) {
            bw.write(String.valueOf(steps));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 游戏胜利时调用：更新最少步数
    public static void updateMinSteps(int currentSteps) {
        int minSteps = readMinSteps();
        if (currentSteps < minSteps) {
            writeMinSteps(currentSteps);
            System.out.println("恭喜！刷新历史最少步数：" + currentSteps);
        } else {
            System.out.println("当前步数：" + currentSteps + "，历史最少步数：" + minSteps);
        }
    }

    public static void main(String[] args) {
        // 模拟游戏胜利（当前步数15）
        updateMinSteps(15);
    }
}
```

### 3. 技术点总结

- 文件读写：`BufferedReader`/`BufferedWriter` 按行读写文本。
- 异常处理：兼容文件不存在场景，返回默认值。
- 数据转换：`String` 与 `int` 互转，确保步数存储正确。

------

## 六、核心知识点总结与面试重点

### 1. 核心对比

| 技术点                                 | 核心特点                                     | 适用场景                           |
| -------------------------------------- | -------------------------------------------- | ---------------------------------- |
| 字节流 vs 字符流                       | 字节流：万能，无编码；字符流：纯文本，防乱码 | 字节流：文件复制；字符流：文本读写 |
| 原始流 vs 缓冲流                       | 缓冲流自带 8KB 缓冲区，性能提升 5-10 倍      | 优先使用缓冲流 + 字节数组          |
| try-catch-finally vs try-with-resource | try-with-resource 自动关流，代码简洁         | JDK7 + 首选 try-with-resource      |

### 2. 面试高频问题

- 字符流为什么需要刷新（`flush()`）？—— 字符流有缓冲区，数据需手动刷入磁盘。
- 乱码的原因与解决方法？—— 编码解码字符集不一致；统一为 UTF-8，确保字节完整。
- 缓冲流的性能优化原理？—— 减少磁盘 IO 次数，批量读写数据。
- File 类能读写文件内容吗？—— 不能，仅操作文件本身，读写需 IO 流。

# 5 道 Java IO 流与文件操作（File + 递归）中大厂面试题

## 面试题 1

请详细说明 Java IO 流的分类体系（按流向、数据类型），并对比字节流（InputStream/OutputStream）与字符流（Reader/Writer）的核心差异（底层实现、编码处理、适用场景）。如果需要复制一个 1GB 的视频文件，你会选择哪种流？为什么？

## 面试题 2

缓冲流（BufferedInputStream/BufferedOutputStream、BufferedReader/BufferedWriter）的底层优化原理是什么？其自带的缓冲区大小是多少？为什么说 “缓冲流 + 字节数组” 是文件复制的最优方案？请结合 IO 操作的性能瓶颈分析。

## 面试题 3

如何使用 Java 实现 “删除非空文件夹” 的功能？请说明核心思路、涉及的 File 类方法及递归的应用逻辑，并分析该过程中需要注意的异常场景（如文件夹无访问权限、文件正在被占用）。

## 面试题 4

开发中读取文本文件时经常出现乱码，请分析乱码的核心原因（至少 2 点）。如何使用字符输入转换流（InputStreamReader）解决 “UTF-8 编码文件在 GBK 系统中读取乱码” 的问题？请写出关键代码，并说明编码与解码的匹配原则。

## 面试题 5

Java 中 IO 流的资源释放机制有哪些？请对比 try-catch-finally 与 try-with-resource 的实现原理、代码简洁度及适用场景，并说明 try-with-resource 能自动关闭资源的底层依赖（AutoCloseable 接口）。同时说明：当同时使用多个流（如输入流 + 输出流）时，关闭顺序有何要求？

------

# 面试题答案

## 面试题 1 答案

### 1. IO 流的分类体系

IO 流按两大维度分类，核心体系如下：

- 按

  数据流向

  ：

  - 输入流：从磁盘 / 网络读取数据到内存（`InputStream`/`Reader` 抽象父类）。
  - 输出流：从内存写入数据到磁盘 / 网络（`OutputStream`/`Writer` 抽象父类）。

- 按

  数据类型

  ：

  - 字节流：以字节（`byte`）为单位读写，核心类 `InputStream`/`OutputStream` 及实现类（`FileInputStream`/`BufferedOutputStream`）。
  - 字符流：以字符（`char`）为单位读写，核心类 `Reader`/`Writer` 及实现类（`FileReader`/`BufferedWriter`）。

### 2. 字节流与字符流的核心差异

| 对比维度 | 字节流（InputStream/OutputStream）                           | 字符流（Reader/Writer）                            |
| -------- | ------------------------------------------------------------ | -------------------------------------------------- |
| 底层实现 | 直接操作字节，无编码处理，仅传输二进制数据                   | 底层基于字节流，自动进行编码解码（默认平台字符集） |
| 编码处理 | 不处理编码，读写中文需手动转换（如 `new String(bytes, "UTF-8")`） | 内置编码逻辑，避免纯文本文件乱码                   |
| 适用场景 | 所有文件类型（视频、图片、音频、文本），万能流               | 仅纯文本文件（`.txt`/`.java`），避免中文乱码       |
| 核心方法 | `read()`/`write(int b)`（操作字节）                          | `read()`/`write(int c)`（操作字符）                |

### 3. 1GB 视频文件的复制方案选择

**选择：缓冲字节流（BufferedInputStream/BufferedOutputStream）+ 字节数组**

核心原因：

- 视频文件是二进制数据，字节流是万能选择，无编码干扰，避免数据丢失。
- 缓冲流自带 8KB 缓冲区，减少磁盘 IO 次数（原始流每次读写 1 字节，IO 次数达 10 亿 +；缓冲流批量读写，IO 次数大幅减少）。
- 搭配 8KB~64KB 字节数组（如 `byte[] buf = new byte[1024*8]`），进一步提升批量读写效率，平衡内存占用与性能。
- 字符流不适合：视频文件非纯文本，编码解码会破坏二进制数据，导致文件损坏。

### 核心代码示例

java



运行









```java
try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("video.mp4"));
     BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("video_copy.mp4"))) {
    byte[] buf = new byte[1024 * 8];
    int len;
    while ((len = bis.read(buf)) != -1) {
        bos.write(buf, 0, len);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

## 面试题 2 答案

### 1. 缓冲流的底层优化原理

缓冲流是 “装饰器模式” 的实现，核心优化逻辑是**减少磁盘 IO 次数**：

- 底层封装原始流（如 `FileInputStream`），自带 8KB 缓冲区（字节缓冲流、字符缓冲流均为 8192 字节）。
- 读取时：先从磁盘读取批量数据填满缓冲区，后续读取直接从缓冲区获取，无需频繁访问磁盘。
- 写入时：先将数据存入缓冲区，缓冲区满后再批量写入磁盘，减少单次写入的 IO 开销。
- 性能瓶颈：磁盘 IO 是低速操作（毫秒级），内存操作是高速操作（纳秒级），缓冲流通过 “内存缓冲” 将多次磁盘 IO 合并为一次，大幅提升效率。

### 2. 缓冲区大小

缓冲流默认缓冲区大小为 **8KB（8192 字节）**，无需手动设置，Java 官方优化的平衡值（过小则 IO 次数多，过大则占用内存）。

### 3. “缓冲流 + 字节数组” 是最优方案的原因

- 缓冲流解决了 “单次读写 1 字节” 的低效问题，但缓冲区固定 8KB。
- 字节数组进一步扩大 “批量读写单位”（如设置为 16KB、32KB），可根据文件大小动态调整，平衡内存占用与 IO 次数。
- 对比其他方案：
  - 原始字节流（无缓冲）：IO 次数过多，1GB 文件需 10 亿 + 次 IO，耗时极长。
  - 缓冲流（无字节数组）：仅依赖 8KB 缓冲区，批量粒度有限。
  - 字符流：仅适用于文本，二进制文件会损坏。
- 实测性能：缓冲流 + 8KB 字节数组比原始流快 5~10 倍，比单纯缓冲流快 2~3 倍，是文件复制的最优组合。

## 面试题 3 答案

### 1. 核心思路

删除非空文件夹的核心是 “先删内容，后删文件夹”：

1. 遍历文件夹下的所有一级文件 / 子文件夹（`File.listFiles()`）。
2. 若为文件：直接删除（`File.delete()`）。
3. 若为子文件夹：递归调用删除方法，先删除子文件夹内的内容，再删除子文件夹本身。
4. 所有内容删除后，删除当前文件夹。

### 2. 核心代码实现

java



运行









```java
public class DeleteDirDemo {
    public static void deleteDir(File dir) {
        // 1. 校验路径合法性
        if (dir == null || !dir.exists() || !dir.isDirectory()) {
            return;
        }

        // 2. 遍历一级文件/子文件夹
        File[] files = dir.listFiles();
        if (files == null) {
            System.out.println("无权限访问文件夹：" + dir.getAbsolutePath());
            return;
        }

        // 3. 循环删除内容
        for (File file : files) {
            if (file.isFile()) {
                // 3.1 删除文件（文件正在被占用时返回false）
                boolean success = file.delete();
                if (!success) {
                    System.out.println("文件删除失败（可能被占用）：" + file.getName());
                }
            } else {
                // 3.2 递归删除子文件夹
                deleteDir(file);
            }
        }

        // 4. 删除当前空文件夹
        dir.delete();
        System.out.println("文件夹删除成功：" + dir.getAbsolutePath());
    }

    public static void main(String[] args) {
        deleteDir(new File("D:\\test_dir"));
    }
}
```

### 3. 涉及的 File 类核心方法

- `listFiles()`：获取一级文件 / 子文件夹对象数组（核心遍历方法）。
- `isFile()`/`isDirectory()`：判断是文件还是文件夹。
- `delete()`：删除文件或空文件夹（非空文件夹需先删内容）。
- `exists()`：判断路径是否存在。

### 4. 异常场景与处理

- 文件夹无访问权限：`listFiles()` 返回 `null`，需判断并提示，避免空指针异常。
- 文件正在被占用：`delete()` 返回 `false`，需捕获并提示（如 “文件被其他程序打开”）。
- 路径不存在 / 不是文件夹：直接返回，无需后续操作。
- 递归深度过深：如文件夹嵌套 1000 + 层，会导致栈内存溢出（`StackOverflowError`），需用迭代替代递归（复杂场景）。

## 面试题 4 答案

### 1. 乱码的核心原因

乱码本质是 “编码与解码的字符集不一致”，常见场景：

- 原因 1：编码解码字符集不同（如 UTF-8 编码的文本用 GBK 解码）。例如：“中国” UTF-8 编码为 6 字节，GBK 解码时按 2 字节一组解析，得到无效字符（乱码）。
- 原因 2：字节数据不完整（如 UTF-8 中文占 3 字节，仅读取 2 字节后解码）。
- 原因 3：字符集不支持目标字符（如 ASCII 编码中文，直接丢失数据）。

### 2. 解决 “UTF-8 文件在 GBK 系统中读取乱码” 的方案

核心工具：字符输入转换流 `InputStreamReader`，作用是 “将字节流按指定字符集转换为字符流”，强制统一编码。

### 3. 关键代码实现

java



运行









```java
public class CharsetFixDemo {
    public static void main(String[] args) throws IOException {
        // 1. 字节流（原始数据，无编码）
        FileInputStream fis = new FileInputStream("utf8_file.txt");
        // 2. 转换流：字节流 → 字符流（指定UTF-8编码）
        InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
        // 3. 缓冲字符流（优化读取性能，按行读）
        BufferedReader br = new BufferedReader(isr);

        String line;
        while ((line = br.readLine()) != null) {
            System.out.println(line); // 无乱码
        }

        // 关闭流（try-with-resource简化版）
        br.close();
    }
}
```

### 4. 编码与解码的匹配原则

- 核心原则：**编码时使用的字符集必须与解码时完全一致**（如 UTF-8 编码 → UTF-8 解码）。
- 开发规范：统一使用 UTF-8 字符集（文件存储、数据库、程序编码），避免跨环境乱码。
- 特殊场景：若无法确定文件编码，可通过工具（如 Notepad++）查看，或使用 `InputStreamReader` 尝试常见字符集（UTF-8、GBK）。

## 面试题 5 答案

### 1. IO 流的资源释放机制

Java 提供两种核心资源释放方案，核心目标是关闭 IO 流，释放系统文件句柄（避免资源泄漏）。

### 2. try-catch-finally vs try-with-resource 对比

| 对比维度   | try-catch-finally                        | try-with-resource（JDK7+）                                   |
| ---------- | ---------------------------------------- | ------------------------------------------------------------ |
| 实现原理   | 手动在 finally 块中调用 `close()` 关闭流 | 自动调用流的 `close()` 方法，底层依赖 `AutoCloseable` 接口   |
| 代码简洁度 | 繁琐，需判断流非空，避免空指针           | 简洁，流定义在 `try()` 中，自动关闭，无需手动处理            |
| 异常处理   | 关闭流可能抛出异常，需嵌套 try-catch     | 关闭流的异常被抑制，仅抛出业务异常，便于排查                 |
| 适用场景   | JDK7 及以下版本                          | JDK7+ 首选，所有实现 `AutoCloseable` 接口的资源（IO 流、Socket、数据库连接） |

### 3. try-with-resource 的底层依赖

- 核心接口：`java.lang.AutoCloseable`，所有可自动关闭的资源（IO 流、`Scanner`、数据库连接）均实现该接口。
- 接口方法：`void close() throws Exception`，try-with-resource 会在代码执行完毕后（正常 / 异常）自动调用该方法关闭资源。
- 示例：`InputStream` 继承 `Closeable`，`Closeable` 继承 `AutoCloseable`，因此 `FileInputStream` 可被 try-with-resource 自动关闭。

### 4. 多流关闭顺序要求

当同时使用多个流（如输入流 + 输出流）时：

- 手动关闭（try-catch-finally）：**先关输出流，后关输入流**。原因：输出流可能有缓冲区数据未写入磁盘，关闭时会自动刷新（`flush()`），若先关输入流，输出流刷新时不会受影响。
- 自动关闭（try-with-resource）：无需手动控制顺序，底层按 “流定义的逆序” 关闭（如先定义输入流，后定义输出流，则先关输出流，后关输入流），符合最佳实践。

### 代码示例

#### （1）try-catch-finally（手动关闭）

java



运行









```java
FileInputStream fis = null;
FileOutputStream fos = null;
try {
    fis = new FileInputStream("src.txt");
    fos = new FileOutputStream("dest.txt");
    // 读写逻辑
} catch (IOException e) {
    e.printStackTrace();
} finally {
    // 先关输出流，后关输入流
    if (fos != null) try { fos.close(); } catch (IOException e) {}
    if (fis != null) try { fis.close(); } catch (IOException e) {}
}
```

#### （2）try-with-resource（自动关闭）

java



运行









```java
try (FileInputStream fis = new FileInputStream("src.txt");
     FileOutputStream fos = new FileOutputStream("dest.txt")) {
    // 读写逻辑
} catch (IOException e) {
    e.printStackTrace();
}
// 底层逆序关闭：先 fos.close()，后 fis.close()
```