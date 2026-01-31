##### 12📁 Java Day12 - File、递归、IO流

> 💡 **核心提示**：文件操作和 IO 流是 Java 与外部数据交互的核心机制。本文系统讲解 File 类、递归算法、字节流和字符流的使用，帮你掌握 Java 文件操作。

---

#### 快速回顾

- **File 类**：文件和目录路径名的抽象表示，用于创建、删除、遍历文件
- **递归**：方法调用自身，用于解决树形结构问题（如遍历目录）
- **IO 流**：数据传输的通道，字节流（二进制数据）、字符流（文本数据）
- **缓冲流**：提高读写效率，减少系统调用次数

---

#### 目录

- [一、File 类](#一file-类)
  - [1. File 类构造方法](#1-file-类构造方法)
  - [2. File 类常用方法](#2-file-类常用方法)
  - [3. 文件遍历示例](#3-文件遍历示例)
- [二、递归算法](#二递归算法)
  - [1. 递归三要素](#1-递归三要素)
  - [2. 经典递归案例](#2-经典递归案例)
  - [3. 递归遍历目录](#3-递归遍历目录)
- [三、IO 流](#三io-流)
  - [1. IO 流体系](#1-io-流体系)
  - [2. 字节流](#2-字节流)
  - [3. 字符流](#3-字符流)
  - [4. 转换流（处理编码）](#4-转换流处理编码)
  - [5. 对象序列化](#5-对象序列化)
- [四、IO 流选择指南](#四io-流选择指南)
- [问答](#问答)

---

#### 详细内容

##### 一、File 类

#### 1. File 类构造方法

```java
// 通过路径字符串创建
File file1 = new File("test.txt");
File file2 = new File("/Users/name/Documents/test.txt");

// 通过父路径和子路径创建
File file3 = new File("/Users/name/Documents", "test.txt");

// 通过父 File 对象和子路径创建
File parent = new File("/Users/name/Documents");
File file4 = new File(parent, "test.txt");
```

#### 2. File 类常用方法

```java
File file = new File("test.txt");

// 获取信息
String name = file.getName();           // 文件名
String path = file.getPath();           // 路径
String absolutePath = file.getAbsolutePath();  // 绝对路径
String parent = file.getParent();       // 父目录
long length = file.length();            // 文件大小（字节）
long lastModified = file.lastModified(); // 最后修改时间

// 判断
boolean exists = file.exists();         // 是否存在
boolean isFile = file.isFile();         // 是否是文件
boolean isDirectory = file.isDirectory(); // 是否是目录
boolean canRead = file.canRead();       // 是否可读
boolean canWrite = file.canWrite();     // 是否可写

// 创建
boolean created = file.createNewFile(); // 创建新文件
boolean mkdir = file.mkdir();           // 创建单级目录
boolean mkdirs = file.mkdirs();         // 创建多级目录

// 删除
boolean deleted = file.delete();        // 删除文件或空目录
file.deleteOnExit();                    // JVM 退出时删除

// 遍历
File[] files = file.listFiles();        // 获取子文件/目录
String[] names = file.list();           // 获取子文件/目录名
```

#### 3. 文件遍历示例

```java
// 遍历目录下的所有文件
public static void listFiles(File dir) {
    if (!dir.exists() || !dir.isDirectory()) {
        return;
    }
    
    File[] files = dir.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isFile()) {
                System.out.println("文件：" + file.getName());
            } else if (file.isDirectory()) {
                System.out.println("目录：" + file.getName());
                listFiles(file);  // 递归遍历子目录
            }
        }
    }
}
```

---

##### 二、递归算法

#### 1. 递归三要素

1. **递归终止条件**：防止无限递归
2. **递归调用**：方法调用自身
3. **业务逻辑**：每次递归执行的操作

#### 2. 经典递归案例

```java
// 阶乘
public static long factorial(int n) {
    if (n <= 1) return 1;  // 终止条件
    return n * factorial(n - 1);  // 递归调用
}

// 斐波那契数列
public static int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 求数组和
public static int sum(int[] arr, int index) {
    if (index >= arr.length) return 0;
    return arr[index] + sum(arr, index + 1);
}
```

**递归执行流程图（阶乘示例）：**

```
┌─────────────────────────────────────────────────────────────┐
│              递归执行流程详解（factorial(4)）    │
│                                                             │
│   调用：factorial(4)                                     │
│                                                             │
│   ┌─────────────────────────────────────────────┐           │
│   │   factorial(4)                          │           │
│   │   n = 4, n > 1                      │           │
│   │   return 4 * factorial(3)             │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │   factorial(3)                          │           │
│   │   n = 3, n > 1                      │           │
│   │   return 3 * factorial(2)             │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │   factorial(2)                          │           │
│   │   n = 2, n > 1                      │           │
│   │   return 2 * factorial(1)             │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │   factorial(1)                          │           │
│   │   n = 1, n <= 1                     │           │
│   │   return 1  ← 终止条件              │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      ▼ 返回结果                              │
│   factorial(2) = 2 * 1 = 2                                 │
│   factorial(3) = 3 * 2 = 6                                 │
│   factorial(4) = 4 * 6 = 24                                │
│                                                             │
│   执行栈（调用栈）：                                        │
│   ┌─────────────────────────────────────────────┐           │
│   │   栈顶（最新调用）                      │           │
│   │   ┌─────────────────────────────┐         │           │
│   │   │ factorial(1) → return 1  │         │           │
│   │   └─────────────────────────────┘         │           │
│   │   ┌─────────────────────────────┐         │           │
│   │   │ factorial(2) → 等待结果   │         │           │
│   │   └─────────────────────────────┘         │           │
│   │   ┌─────────────────────────────┐         │           │
│   │   │ factorial(3) → 等待结果   │         │           │
│   │   └─────────────────────────────┘         │           │
│   │   ┌─────────────────────────────┐         │           │
│   │   │ factorial(4) → 等待结果   │         │           │
│   │   └─────────────────────────────┘         │           │
│   │   栈底（初始调用）                      │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   说明：                                                    │
│   • 递归调用会压入调用栈，每层递归占用栈空间              │
│   • 到达终止条件后，逐层返回结果，栈空间释放                │
│   • 递归深度过大会导致 StackOverflowError                   │
│   • 必须有明确的终止条件，否则会无限递归                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3. 递归遍历目录

```java
// 计算目录总大小
public static long getDirectorySize(File dir) {
    long size = 0;
    File[] files = dir.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isFile()) {
                size += file.length();
            } else {
                size += getDirectorySize(file);  // 递归
            }
        }
    }
    return size;
}

// 查找文件
public static void findFile(File dir, String fileName) {
    File[] files = dir.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isFile() && file.getName().contains(fileName)) {
                System.out.println("找到：" + file.getAbsolutePath());
            } else if (file.isDirectory()) {
                findFile(file, fileName);  // 递归
            }
        }
    }
}

// 删除目录及其内容
public static void deleteDirectory(File dir) {
    File[] files = dir.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isDirectory()) {
                deleteDirectory(file);  // 递归删除子目录
            }
            file.delete();
        }
    }
    dir.delete();
}
```

---

##### 三、IO 流

#### 1. IO 流体系

```
IO流
├── 字节流（二进制数据）
│   ├── InputStream
│   │   ├── FileInputStream
│   │   ├── BufferedInputStream
│   │   └── ObjectInputStream
│   └── OutputStream
│       ├── FileOutputStream
│       ├── BufferedOutputStream
│       └── ObjectOutputStream
└── 字符流（文本数据）
    ├── Reader
    │   ├── FileReader
    │   ├── BufferedReader
    │   └── InputStreamReader
    └── Writer
        ├── FileWriter
        ├── BufferedWriter
        └── OutputStreamWriter
```

#### 2. 字节流

```java
// 文件复制（字节流）
public static void copyFile(String srcPath, String destPath) {
    try (FileInputStream fis = new FileInputStream(srcPath);
         FileOutputStream fos = new FileOutputStream(destPath)) {
        
        byte[] buffer = new byte[1024];
        int len;
        while ((len = fis.read(buffer)) != -1) {
            fos.write(buffer, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// 带缓冲的字节流（效率更高）
public static void copyFileBuffered(String srcPath, String destPath) {
    try (BufferedInputStream bis = new BufferedInputStream(
            new FileInputStream(srcPath));
         BufferedOutputStream bos = new BufferedOutputStream(
            new FileOutputStream(destPath))) {
        
        byte[] buffer = new byte[1024];
        int len;
        while ((len = bis.read(buffer)) != -1) {
            bos.write(buffer, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

#### 3. 字符流

```java
// 文本文件复制（字符流）
public static void copyTextFile(String srcPath, String destPath) {
    try (FileReader fr = new FileReader(srcPath);
         FileWriter fw = new FileWriter(destPath)) {
        
        char[] buffer = new char[1024];
        int len;
        while ((len = fr.read(buffer)) != -1) {
            fw.write(buffer, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// 带缓冲的字符流 + 按行读写
public static void copyTextFileLineByLine(String srcPath, String destPath) {
    try (BufferedReader br = new BufferedReader(new FileReader(srcPath));
         BufferedWriter bw = new BufferedWriter(new FileWriter(destPath))) {
        
        String line;
        while ((line = br.readLine()) != null) {
            bw.write(line);
            bw.newLine();  // 写入换行符
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

#### 4. 转换流（处理编码）

```java
// 指定编码读取文件
public static void readWithEncoding(String path, String charset) {
    try (InputStreamReader isr = new InputStreamReader(
            new FileInputStream(path), charset);
         BufferedReader br = new BufferedReader(isr)) {
        
        String line;
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// 指定编码写入文件
public static void writeWithEncoding(String path, String content, String charset) {
    try (OutputStreamWriter osw = new OutputStreamWriter(
            new FileOutputStream(path), charset);
         BufferedWriter bw = new BufferedWriter(osw)) {
        
        bw.write(content);
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

#### 5. 对象序列化

```java
// 可序列化的类必须实现 Serializable 接口
public class Student implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private int age;
    // transient 修饰的字段不会被序列化
    private transient String password;
    
    // 构造器、getter、setter 省略
}

// 序列化（对象 → 文件）
public static void serialize(Object obj, String path) {
    try (ObjectOutputStream oos = new ObjectOutputStream(
            new FileOutputStream(path))) {
        oos.writeObject(obj);
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// 反序列化（文件 → 对象）
public static Object deserialize(String path) {
    try (ObjectInputStream ois = new ObjectInputStream(
            new FileInputStream(path))) {
        return ois.readObject();
    } catch (IOException | ClassNotFoundException e) {
        e.printStackTrace();
        return null;
    }
}
```

---

##### 四、IO 流选择指南

| 场景 | 推荐流 |
|------|--------|
| 复制任何文件 | BufferedInputStream / BufferedOutputStream |
| 读写文本文件 | BufferedReader / BufferedWriter |
| 需要指定编码 | InputStreamReader / OutputStreamWriter |
| 对象持久化 | ObjectInputStream / ObjectOutputStream |
| 内存操作 | ByteArrayInputStream / ByteArrayOutputStream |

---

#### 问答

##### Q1：字节流和字符流有什么区别？

**答**：
- **字节流**：以字节为单位，适合所有类型文件（图片、视频、二进制等）。
- **字符流**：以字符为单位，适合文本文件，自动处理字符编码。
- **关系**：字符流 = 字节流 + 编码表。
- **建议**：文本用字符流，其他用字节流。

##### Q2：为什么要使用缓冲流？

**答**：
- **减少系统调用**：普通流每次读写都进行系统调用，缓冲流先写入缓冲区。
- **提高效率**：缓冲区满或关闭时才进行实际的 IO 操作。
- **支持更多功能**：如 BufferedReader 的 `readLine()` 方法。
- **性能提升**：通常可提升 10 倍以上性能。

##### Q3：递归有什么优缺点？

**答**：
- **优点**：代码简洁，易于理解，适合树形结构问题。
- **缺点**：
  - 消耗栈空间，深度过大可能导致 StackOverflowError
  - 可能存在重复计算（如斐波那契数列）
- **优化**：使用尾递归、记忆化搜索或改为迭代。

##### Q4：try-with-resources 是什么？

**答**：
- JDK7 引入的语法糖，用于自动关闭资源。
- 资源必须实现 `AutoCloseable` 接口。
- 编译器自动生成 finally 代码块关闭资源。
- 支持多个资源，用 `;` 分隔。

```java
try (FileInputStream fis = new FileInputStream("a.txt");
     FileOutputStream fos = new FileOutputStream("b.txt")) {
    // 自动关闭 fis 和 fos
}
```

##### Q5：序列化中的 serialVersionUID 有什么作用？

**答**：
- 序列化版本标识符，用于验证序列化和反序列化的类是否兼容。
- 如果不定义，编译器会自动生成，但类修改后会改变。
- **建议**：显式定义 `serialVersionUID`，避免版本不一致导致的异常。

---

> **学习建议**：文件操作和 IO 流是 Java 与外部世界交互的桥梁，务必掌握 File 类的使用、递归算法的应用、各种 IO 流的选择。建议多写练习，特别是文件复制、目录遍历等常见操作。
