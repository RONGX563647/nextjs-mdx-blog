# io

Java IO 包（`java.io`）是处理输入输出的核心 API，其设计核心是 **“流（Stream）”** 模型，按数据单位分为 **字节流**（处理二进制数据）和 **字符流**（处理文本数据，底层依赖字节流 + 编码转换），按功能分为 **节点流**（直接连接数据源 / 目的地）和 **处理流**（包装节点流增强功能）。

### 一、IO 核心顶层架构

所有常用 API 均基于以下 4 个抽象基类，它们定义了流的基本行为，**不能直接实例化**：

| 流类型       | 抽象基类（字节流） | 抽象基类（字符流） | 核心作用         |
| ------------ | ------------------ | ------------------ | ---------------- |
| 输入流（读） | `InputStream`      | `Reader`           | 从数据源读取数据 |
| 输出流（写） | `OutputStream`     | `Writer`           | 向目的地写入数据 |

#### 1. 字节流顶层基类：`InputStream` & `OutputStream`

- **`InputStream`（字节输入基类）**
  核心方法（所有字节输入流都继承）：
  - `int read()`：读取 1 个字节，返回字节值（0-255），若到末尾返回 `-1`。
  - `int read(byte[] b)`：读取多个字节到数组 `b`，返回实际读取的字节数，末尾返回 `-1`（常用，减少 IO 次数）。
  - `void close()`：关闭流，释放资源（必须调用，建议用 `try-with-resources` 自动关闭）。
- **`OutputStream`（字节输出基类）**
  核心方法（所有字节输出流都继承）：
  - `void write(int b)`：写入 1 个字节（仅取 `int` 的低 8 位）。
  - `void write(byte[] b)`：写入数组 `b` 中所有字节。
  - `void flush()`：强制刷新缓冲区，将数据写入目的地（缓冲流必须调用，否则数据可能滞留缓冲区）。
  - `void close()`：关闭流（关闭前会自动刷新）。

#### 2. 字符流顶层基类：`Reader` & `Writer`

字符流处理 **Unicode 字符**（1 个字符 = 2 字节），底层通过 “字节流 + 字符编码（如 UTF-8、GBK）” 实现文本转换，解决字节流读文本乱码问题。

- **`Reader`（字符输入基类）**
  核心方法：
  - `int read()`：读取 1 个字符，返回字符值（0-65535），末尾返回 `-1`。
  - `int read(char[] cbuf)`：读取多个字符到数组 `cbuf`，返回实际读取的字符数。
  - `void close()`：关闭流。
- **`Writer`（字符输出基类）**
  核心方法：
  - `void write(int c)`：写入 1 个字符（仅取 `int` 的低 16 位）。
  - `void write(char[] cbuf)`：写入字符数组 `cbuf`。
  - `void write(String str)`：直接写入字符串（字符流特有，字节流需手动转字节数组）。
  - `void flush()`：刷新缓冲区。
  - `void close()`：关闭流。

### 二、常用节点流（直接操作数据源 / 目的地）

节点流是 “流的源头”，直接连接文件、内存、管道等具体数据源，必须单独使用或被处理流包装。

#### 1. 字节节点流（处理二进制文件：图片、视频、压缩包等）

| 类名                    | 核心用途                    | 关键构造方法                                                 | 常用方法（除基类方法外）                                     |
| ----------------------- | --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `FileInputStream`       | 从文件读字节                | `FileInputStream(File file)` `FileInputStream(String path)`  | -                                                            |
| `FileOutputStream`      | 向文件写字节（覆盖 / 追加） | `FileOutputStream(File file, boolean append)`（`append=true` 追加） | -                                                            |
| `ByteArrayInputStream`  | 从内存字节数组读字节        | `ByteArrayInputStream(byte[] buf)`                           | -                                                            |
| `ByteArrayOutputStream` | 向内存字节数组写字节        | `ByteArrayOutputStream()`（初始容量 32，自动扩容）           | `byte[] toByteArray()`：获取写入的字节数组 `String toString()`：转字符串（默认 UTF-8） |
| `PipedInputStream`      | 管道输入（线程间通信）      | `PipedInputStream(PipedOutputStream out)`                    | 需与 `PipedOutputStream` 配对，否则可能阻塞                  |
| `PipedOutputStream`     | 管道输出（线程间通信）      | `PipedOutputStream(PipedInputStream in)`                     | 同上                                                         |

#### 2. 字符节点流（处理文本文件：.txt、.java 等）

| 类名              | 核心用途                   | 关键构造方法                                      | 常用方法（除基类方法外）                                     |
| ----------------- | -------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `FileReader`      | 从文件读字符（默认编码）   | `FileReader(File file)` `FileReader(String path)` | -（依赖系统默认编码，乱码需用转换流）                        |
| `FileWriter`      | 向文件写字符（默认编码）   | `FileWriter(File file, boolean append)`           | -                                                            |
| `CharArrayReader` | 从内存字符数组读字符       | `CharArrayReader(char[] buf)`                     | -                                                            |
| `CharArrayWriter` | 向内存字符数组写字符       | `CharArrayWriter()`                               | `char[] toCharArray()`：获取字符数组 `String toString()`：转字符串 |
| `StringReader`    | 从字符串读字符             | `StringReader(String s)`                          | -                                                            |
| `StringWriter`    | 向字符串写字符（内存缓冲） | `StringWriter()`                                  | `String toString()`：获取写入的字符串                        |
| `PipedReader`     | 管道字符输入（线程通信）   | `PipedReader(PipedWriter out)`                    | 需与 `PipedWriter` 配对                                      |
| `PipedWriter`     | 管道字符输出（线程通信）   | `PipedWriter(PipedReader in)`                     | 同上                                                         |

### 三、常用处理流（包装节点流，增强功能）

处理流不能直接连接数据源，必须 “包装” 节点流或其他处理流，常见功能：缓冲、编码转换、读写基本类型、序列化等。

#### 1. 缓冲流（减少 IO 次数，提升性能）

所有 IO 操作中 **最常用的处理流**，通过内存缓冲区减少磁盘 / 网络的直接读写（IO 是耗时操作，缓冲流将多次小读写合并为一次大读写）。

| 类名                   | 核心用途                 | 关键构造方法                                                 | 特有方法                                                     |
| ---------------------- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `BufferedInputStream`  | 字节输入缓冲             | `BufferedInputStream(InputStream in)` `BufferedInputStream(InputStream in, int size)`（指定缓冲区大小，默认 8KB） | -                                                            |
| `BufferedOutputStream` | 字节输出缓冲             | `BufferedOutputStream(OutputStream out)`                     | 必须调用 `flush()` 或 `close()` 才会写数据                   |
| `BufferedReader`       | 字符输入缓冲（文本专用） | `BufferedReader(Reader in)`                                  | `String readLine()`：读取一行文本（不含换行符），末尾返回 `null` |
| `BufferedWriter`       | 字符输出缓冲（文本专用） | `BufferedWriter(Writer out)`                                 | `void newLine()`：写入平台无关的换行符（Windows \r\n，Linux \n） |

#### 2. 转换流（字节流 ↔ 字符流，解决编码问题）

`java.io` 中 **唯一能指定字符编码的流**，是字节流和字符流的 “桥梁”，解决 `FileReader/FileWriter` 依赖系统默认编码导致的乱码问题。

| 类名                 | 核心用途                | 关键构造方法                                                 | 核心作用                   |
| -------------------- | ----------------------- | ------------------------------------------------------------ | -------------------------- |
| `InputStreamReader`  | 字节输入流 → 字符输入流 | `InputStreamReader(InputStream in, Charset charset)`（指定编码，如 StandardCharsets.UTF_8） | 将字节按指定编码解码为字符 |
| `OutputStreamWriter` | 字符输出流 → 字节输出流 | `OutputStreamWriter(OutputStream out, Charset charset)`      | 将字符按指定编码编码为字节 |

**示例**：用 UTF-8 编码读文本文件（避免乱码）

java

```java
try (InputStream in = new FileInputStream("test.txt");
     Reader reader = new InputStreamReader(in, StandardCharsets.UTF_8);
     BufferedReader br = new BufferedReader(reader)) {
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

#### 3. 数据流（读写基本数据类型，保留类型信息）

用于读写 Java 基本数据类型（`int`、`double`、`boolean` 等），会自动保留数据类型信息（如写 `int 123` 时，不会转成字节 `{49,50,51}`，而是按 4 字节整数存储）。

| 类名               | 核心用途       | 关键构造方法                         | 常用方法                                                     |
| ------------------ | -------------- | ------------------------------------ | ------------------------------------------------------------ |
| `DataInputStream`  | 读基本数据类型 | `DataInputStream(InputStream in)`    | `readInt()`、`readDouble()`、`readBoolean()` 等              |
| `DataOutputStream` | 写基本数据类型 | `DataOutputStream(OutputStream out)` | `writeInt(int v)`、`writeDouble(double v)`、`writeUTF(String s)`（写 UTF-8 字符串） |

**注意**：读写顺序必须一致（如先写 `int` 再写 `double`，读时必须先读 `int` 再读 `double`）。

#### 4. 对象流（序列化 / 反序列化，读写对象）

将 Java 对象转换为字节流（序列化），或从字节流恢复为对象（反序列化），用于对象持久化（存文件）或网络传输。

| 类名                 | 核心用途                | 关键构造方法                           | 核心要求                                |
| -------------------- | ----------------------- | -------------------------------------- | --------------------------------------- |
| `ObjectInputStream`  | 反序列化（字节 → 对象） | `ObjectInputStream(InputStream in)`    | 读对象：`Object readObject()`（需强转） |
| `ObjectOutputStream` | 序列化（对象 → 字节）   | `ObjectOutputStream(OutputStream out)` | 写对象：`void writeObject(Object obj)`  |

**序列化必须满足 2 个条件**：

1. 类实现 `java.io.Serializable` 接口（空接口，仅作标记）；
2. 类中显式声明 `serialVersionUID`（如 `private static final long serialVersionUID = 1L`），避免类结构变化导致反序列化失败。

**注意**：

- `transient` 修饰的成员变量不会被序列化；
- 静态变量不属于对象状态，不参与序列化。

#### 5. 打印流（格式化输出，自动刷新）

专门用于输出数据，支持格式化打印和自动刷新，`System.out` 本质就是 `PrintStream`。

| 类名          | 核心用途                    | 关键构造方法                                                 | 特有方法                                                     |
| ------------- | --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `PrintStream` | 字节打印流（控制台 / 文件） | `PrintStream(OutputStream out)` `PrintStream(String fileName, Charset charset)` | `print()`/`println()`（打印任意类型） `printf(String format, Object... args)`（格式化输出，如 `printf("%.2f", 3.14)`） |
| `PrintWriter` | 字符打印流（文本专用）      | `PrintWriter(Writer out, boolean autoFlush)`（`autoFlush=true` 时，调用 `println()` 会自动刷新） | 同上，支持指定字符编码，比 `PrintStream` 更适合文本输出      |

### 四、IO 包关键概念与实践建议

1. **资源关闭**：所有流都实现 `AutoCloseable` 接口，必须用 `try-with-resources` 语法自动关闭（无需手动调用 `close()`，避免资源泄漏）。
2. **编码问题**：处理文本必须指定编码（如 `UTF-8`），优先用 `InputStreamReader/OutputStreamWriter` + `StandardCharsets` 类（避免硬编码字符串）。
3. **流的顺序**：处理流包装节点流时，关闭流只需关闭最外层的处理流（内层流会被自动关闭）。
4. **性能优先**：读写文件 / 网络时，必须用缓冲流（`BufferedXXX`），缓冲区大小默认 8KB，大文件可适当调大（如 64KB）。
5. **序列化安全**：敏感字段用 `transient` 修饰，或重写 `writeObject()`/`readObject()` 方法自定义序列化逻辑。

通过以上体系，`java.io` 包覆盖了所有常用 IO 场景：从简单的文件读写，到复杂的对象序列化、编码转换、线程间通信，掌握 “字节流 vs 字符流”“节点流 vs 处理流” 的核心区别，就能灵活组合 API 解决实际问题。



# 问答

### 一、IO 包八股文（15 题，难度递增）

#### 基础篇（1-5 题）

1. **Java IO 包的核心设计思想是什么？流按数据单位分为哪两类？**
   答案：核心是「流（Stream）模型」+「装饰器模式」，流是单向数据传输通道，装饰器模式通过处理流增强节点流功能。
   按数据单位分：**字节流**（以字节为单位，处理所有二进制数据）和**字符流**（以字符为单位，仅处理文本，自动关联编码）。
2. **IO 包的 4 个顶层抽象类是什么？分别对应什么功能？**
   答案：
   - 字节输入流：`InputStream`（从数据源读字节）；
   - 字节输出流：`OutputStream`（向目的地写字节）；
   - 字符输入流：`Reader`（从数据源读字符）；
   - 字符输出流：`Writer`（向目的地写字符）。
     注：均为抽象类，不能直接实例化，需用子类实现。
3. **节点流和处理流的区别是什么？各举 2 个例子。**
   答案：
   - 节点流：直接连接数据源 / 目的地，是流的 “源头”，必须单独使用；例：`FileInputStream`（文件字节输入）、`FileReader`（文件字符输入）。
   - 处理流：包装节点流 / 其他处理流，增强功能（如缓冲、编码），不能单独使用；例：`BufferedInputStream`（缓冲字节流）、`InputStreamReader`（转换流）。
4. **`FileInputStream` 和 `FileReader` 的核心区别？什么时候用前者，什么时候用后者？**
   答案：
   - 数据单位：`FileInputStream` 是字节流（读字节），`FileReader` 是字符流（读字符）；
   - 编码：`FileInputStream` 不处理编码，读文本需手动转字符；`FileReader` 依赖系统默认编码，易乱码。
     场景：
   - 用 `FileInputStream`：处理二进制文件（图片、视频）或不确定数据类型时；
   - 用 `FileReader`：仅处理文本且能接受系统默认编码（不推荐，建议用转换流 + 显式编码）。
5. **`try-with-resources` 语法在 IO 中作用是什么？为什么必须用它？**
   答案：作用是**自动关闭实现 `AutoCloseable` 接口的资源**（所有 IO 流都实现该接口），无需手动调用 `close()`。
   必须用的原因：IO 流是 “系统资源”（如文件句柄、网络连接），若不关闭会导致资源泄漏，`try-with-resources` 确保无论是否抛出异常，资源都会被自动释放。

#### 进阶篇（6-10 题）

1. **缓冲流（`BufferedInputStream`/`BufferedReader`）的原理是什么？为什么能提升 IO 性能？**
   答案：原理是**内置内存缓冲区**（默认 8KB），将 “多次小读写” 合并为 “一次大读写”。
   性能提升原因：IO 操作的瓶颈是 “磁盘 / 网络的物理读写”（耗时远大于内存操作），缓冲流减少了物理读写次数，用内存操作替代部分物理操作，从而提升效率。
   例：读 10KB 文件，字节流需读 10 次 1KB，缓冲流一次读 8KB 到缓冲区，再读 2KB，仅 2 次物理读写。

2. **`InputStreamReader` 和 `OutputStreamWriter` 的核心作用是什么？如何用它们解决文本乱码问题？**
   答案：核心作用是**字节流与字符流的转换桥梁**，支持显式指定字符编码（如 UTF-8）。
   解决乱码：乱码本质是 “读 / 写编码不一致”，通过转换流指定统一编码即可。
   示例（读 UTF-8 文本）：

   java

   ```java
   try (InputStream in = new FileInputStream("test.txt");
        // 显式指定编码为 UTF-8，避免依赖系统默认编码
        Reader reader = new InputStreamReader(in, StandardCharsets.UTF_8);
        BufferedReader br = new BufferedReader(reader)) {
       String line = br.readLine();
   }
   ```
   
3. **对象流（`ObjectInputStream`/`ObjectOutputStream`）实现序列化的条件是什么？`transient` 关键字的作用？**
   答案：序列化条件：

   1. 类必须实现 `java.io.Serializable` 接口（空接口，仅作标记）；
   2. 类中显式声明 `serialVersionUID`（如 `private static final long serialVersionUID = 1L`），避免类结构变化导致反序列化失败。
      `transient` 作用：修饰的成员变量**不参与序列化**（如敏感信息：密码），反序列化后该字段为默认值（如 `null`、0）。

4. **`DataInputStream` 和 `ObjectInputStream` 的区别？分别用在什么场景？**
   答案：

   - 数据单位：`DataInputStream` 读写**基本数据类型**（`int`、`double`），不保留对象结构；`ObjectInputStream` 读写**完整对象**，保留对象结构和成员变量。
   - 场景：
     - `DataInputStream`：网络传输结构化数据（如 “int 长度 + double 数值”），或存储简单类型到文件；
     - `ObjectInputStream`：对象持久化（如将 User 对象写入文件）或网络传输对象（如 RPC 调用）。

5. **`PrintStream` 和 `PrintWriter` 的区别？为什么推荐用 `PrintWriter` 处理文本输出？**
   答案：

   - 流类型：`PrintStream` 是字节流，`PrintWriter` 是字符流；
   - 编码：`PrintStream` 依赖系统默认编码，`PrintWriter` 可显式指定编码；
   - 功能：均支持 `print()`/`println()`/`printf()`，但 `PrintWriter` 更适合文本（支持字符流特性，如 `write(String)`）。
     推荐 `PrintWriter` 处理文本：支持显式编码，避免乱码；且可包装字符流，与 `BufferedWriter` 配合提升效率。

#### 深入篇（11-15 题）

1. **IO 包的装饰器模式体现在哪里？以 “文件流 + 缓冲流 + 数据流” 为例说明。**
   答案：装饰器模式体现在「处理流包装节点流 / 其他处理流」，核心是 “不修改原类，通过组合增强功能”。
   角色对应：

   - 被装饰者（Component）：`InputStream`/`OutputStream`/`Reader`/`Writer`（抽象基类）；
   - 具体被装饰者（ConcreteComponent）：`FileInputStream`（节点流，基础功能）；
   - 装饰者（Decorator）：`FilterInputStream`（所有字节处理流的父类，持有被装饰者引用）；
   - 具体装饰者（ConcreteDecorator）：`BufferedInputStream`（缓冲功能）、`DataInputStream`（数据类型功能）。
     示例（多层装饰）：

   java

   ```java
   // 节点流（被装饰者）→ 缓冲流（装饰者1：加缓冲）→ 数据流（装饰者2：加数据类型读写）
   try (DataInputStream dis = new DataInputStream(
           new BufferedInputStream(new FileInputStream("data.txt")))) {
       int num = dis.readInt(); // 数据流的功能，依赖缓冲流提升效率
   }
   ```

2. **序列化时，静态变量为什么不参与序列化？如何实现 “自定义序列化”？**
   答案：静态变量不参与序列化的原因：静态变量属于「类的状态」，而非「对象的状态」，序列化仅保存对象的实例状态，因此静态变量被排除。
   自定义序列化：重写 `writeObject()` 和 `readObject()` 方法（需用 `private` 修饰，Java 序列化机制会反射调用），示例：

   java

   ```java
   private void writeObject(ObjectOutputStream out) throws IOException {
       // 自定义写逻辑：如加密敏感字段
       out.defaultWriteObject(); // 先执行默认序列化
       out.writeUTF(encrypt(password)); // 加密后写密码
   }
   private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
       in.defaultReadObject(); // 先执行默认反序列化
       this.password = decrypt(in.readUTF()); // 解密读密码
   }
   ```

3. **`ByteArrayInputStream`/`ByteArrayOutputStream` 的特点是什么？用在什么场景？**
   答案：特点是**基于内存字节数组**，不依赖外部设备（如文件、网络），读写速度极快，数据仅存于内存，程序退出后消失。
   场景：

   - 临时数据缓存（如处理文件时先读入内存再解析）；
   - 数据转换（如将对象序列化后的字节数组转为字符串）；
   - 避免创建临时文件（如多模块间传递二进制数据）。

4. **IO 流关闭时，为什么只需关闭最外层的处理流？底层原理是什么？**
   答案：因为处理流的 `close()` 方法会**自动调用被包装流的 `close()` 方法**，从外层到内层递归关闭所有流。
   底层原理：处理流（如 `BufferedInputStream`）持有被包装流（如 `FileInputStream`）的引用，在 `close()` 中会先关闭自身资源（如刷新缓冲区），再调用被包装流的 `close()`。
   示例：关闭 `DataInputStream`（最外层），会自动关闭 `BufferedInputStream`，再自动关闭 `FileInputStream`。

5. **Java IO 和 NIO 的核心区别是什么？为什么 NIO 更适合高并发场景？**
   答案：

   - 模型：IO 是「阻塞式同步 IO」（BIO），一个线程处理一个流，线程会阻塞在 IO 操作上；NIO 是「非阻塞式同步 IO」（NIO），基于「通道（Channel）+ 缓冲区（Buffer）+ 选择器（Selector）」，一个线程可处理多个通道的 IO 事件。
   - 高并发适配：BIO 线程数随连接数增长，线程切换开销大；NIO 用 Selector 轮询就绪事件，仅处理就绪的连接，线程数少（固定线程池），适合高并发（如百万级连接）。

### 二、IO 场景题（5 题，难度递增）

#### 场景 1：基础文件复制（字节流 + 缓冲流）

**需求**：用 IO 流实现 “将 `a.jpg` 复制到 `b.jpg`”，要求兼顾性能，避免内存溢出。
**答案**：用字节缓冲流分块读写（缓冲区大小 8KB），避免一次性读入大文件导致内存溢出：

java

```java
public static void copyFile(String srcPath, String destPath) throws IOException {
    // 用 try-with-resources 自动关闭流，外层缓冲流关闭时会自动关闭内层文件流
    try (InputStream in = new BufferedInputStream(new FileInputStream(srcPath));
         OutputStream out = new BufferedOutputStream(new FileOutputStream(destPath))) {
        byte[] buf = new byte[8192]; // 8KB 缓冲区（默认也是8KB，显式指定更清晰）
        int len;
        // 循环读：每次读8KB到缓冲区，返回实际读取的字节数，-1表示到末尾
        while ((len = in.read(buf)) != -1) {
            out.write(buf, 0, len); // 写实际读取的字节（避免缓冲区残留数据）
        }
        out.flush(); // 缓冲输出流需手动刷新，确保数据写入文件
    }
}
```

#### 场景 2：文本文件按行读写（字符流 + 转换流）

**需求**：读取 UTF-8 编码的 `test.txt`，每行末尾添加 “【END】” 后，写入 `result.txt`（同样 UTF-8 编码），要求避免乱码。
**答案**：用转换流 `InputStreamReader/OutputStreamWriter` 显式指定 UTF-8，配合字符缓冲流 `BufferedReader/BufferedWriter` 按行处理：

java

```java
public static void processText() throws IOException {
    try (// 读：字节流→转换流（UTF-8）→字符缓冲流（按行读）
         InputStream in = new FileInputStream("test.txt");
         Reader reader = new InputStreamReader(in, StandardCharsets.UTF_8);
         BufferedReader br = new BufferedReader(reader);
         
         // 写：字节流→转换流（UTF-8）→字符缓冲流（按行写）
         OutputStream out = new FileOutputStream("result.txt");
         Writer writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
         BufferedWriter bw = new BufferedWriter(writer)) {
        
        String line;
        while ((line = br.readLine()) != null) { // 逐行读
            String newLine = line + "【END】";
            bw.write(newLine);
            bw.newLine(); // 写入平台无关的换行符（Windows \r\n，Linux \n）
        }
        bw.flush(); // 刷新缓冲区
    }
}
```

#### 场景 3：对象序列化与反序列化（对象流）

**需求**：定义 `User` 类，实现将 `User` 对象序列化到 `user.dat`，再反序列化为对象并打印。
**答案**：`User` 类需实现 `Serializable` 并指定 `serialVersionUID`，用对象流处理：

java

```java
// 1. 定义可序列化的 User 类
class User implements Serializable {
    // 显式声明 serialVersionUID，避免类结构变化导致反序列化失败
    private static final long serialVersionUID = 1L;
    private String name;
    private transient String password; // 密码不参与序列化
    private int age;

    public User(String name, String password, int age) {
        this.name = name;
        this.password = password;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', password='" + password + "', age=" + age + "}";
    }
}

// 2. 序列化与反序列化
public static void serializeUser() throws IOException, ClassNotFoundException {
    // 序列化：对象→字节→文件
    User user = new User("张三", "123456", 20);
    try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("user.dat"))) {
        oos.writeObject(user);
        System.out.println("序列化完成");
    }

    // 反序列化：文件→字节→对象
    try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("user.dat"))) {
        User deserializedUser = (User) ois.readObject();
        System.out.println("反序列化结果：" + deserializedUser);
        // 输出：User{name='张三', password='null', age=20}（password 被 transient 修饰，未序列化）
    }
}
```

#### 场景 4：大文件读取（分块处理 + 缓冲流）

**需求**：读取 1GB 的 `large.dat`，每 100MB 为一个块，统计每个块中字节 `0x00` 的数量，避免内存溢出。
**答案**：用字节缓冲流分块读取（每次读 100MB），块内用缓冲区统计，避免一次性加载大文件：

java

```java
public static void countZeroBytes(String filePath) throws IOException {
    final int BLOCK_SIZE = 100 * 1024 * 1024; // 100MB 块大小
    final byte TARGET = 0x00; // 目标字节
    long totalCount = 0;
    int blockNum = 1;

    try (InputStream in = new BufferedInputStream(new FileInputStream(filePath))) {
        byte[] blockBuf = new byte[BLOCK_SIZE]; // 块缓冲区（100MB）
        int blockLen;

        // 循环读块：每次读100MB到块缓冲区
        while ((blockLen = in.read(blockBuf)) != -1) {
            int blockCount = 0;
            // 统计当前块中 0x00 的数量
            for (int i = 0; i < blockLen; i++) {
                if (blockBuf[i] == TARGET) {
                    blockCount++;
                }
            }
            System.out.println("第" + blockNum + "块：" + blockCount + "个 0x00");
            totalCount += blockCount;
            blockNum++;
        }
        System.out.println("总数量：" + totalCount);
    }
}
```

#### 场景 5：线程间通信（管道流）

**需求**：用管道流实现 “线程 A 写数据到线程 B，线程 B 读取并打印”，确保线程安全。
**答案**：用字符管道流 `PipedWriter/PipedReader` 配对使用，线程 A 写，线程 B 读，注意管道流需提前连接：

java

```java
public static void pipeThreadComm() throws IOException {
    // 1. 创建管道流并连接（必须配对，否则线程会阻塞）
    PipedWriter writer = new PipedWriter();
    PipedReader reader = new PipedReader(writer); // 传入 writer 建立连接

    // 2. 线程 A：写数据到管道
    Thread threadA = new Thread(() -> {
        try (writer) { // try-with-resources 自动关闭 writer
            String data = "Hello from Thread A!";
            System.out.println("Thread A 写入：" + data);
            writer.write(data);
            writer.flush(); // 刷新管道，确保数据被读取
        } catch (IOException e) {
            e.printStackTrace();
        }
    });

    // 3. 线程 B：从管道读数据
    Thread threadB = new Thread(() -> {
        try (reader) { // try-with-resources 自动关闭 reader
            char[] buf = new char[1024];
            int len = reader.read(buf); // 阻塞，直到有数据可读
            String data = new String(buf, 0, len);
            System.out.println("Thread B 读取：" + data);
        } catch (IOException e) {
            e.printStackTrace();
        }
    });

    // 4. 启动线程
    threadB.start(); // 先启动读线程，避免写线程写完后读线程未就绪
    threadA.start();
}
```