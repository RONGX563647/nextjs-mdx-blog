# 【Java +AI ｜基础加强篇day15 单元测试 反射 注解 动态代理】

## 核心结论

Java 高级技术（反射、注解、动态代理）是框架设计的核心基石，通过 “运行时解析类结构、标记代码语义、增强对象行为”，实现通用化、灵活化的编程模式，广泛应用于 Spring、MyBatis 等主流框架。单元测试则是保障代码正确性的关键手段，提升开发效率与代码可靠性。

------

## 一、单元测试（JUnit）—— 代码正确性的保障

### 1. 单元测试的核心价值与场景

#### （1）为什么需要单元测试？

- 传统 main 方法测试的痛点：
  - 无法自动化：需手动调用方法，无法批量执行。
  - 结果不直观：需手动观察输出，无明确成功 / 失败标识。
  - 依赖严重：一个方法失败会阻塞后续测试。
- 单元测试的核心场景：
  - 开发阶段：快速验证单个方法的逻辑正确性（如工具类、业务方法）。
  - 重构阶段：确保重构后代码功能不变（回归测试）。
  - 协作开发：避免他人修改代码导致功能异常（集成测试前置）。

#### （2）JUnit 框架的优势

- 自动化执行：支持单个 / 全部测试方法一键运行，无需手动调用。
- 结果可视化：绿色标识成功、红色标识失败，生成详细测试报告。
- 独立性：测试方法相互隔离，一个方法失败不影响其他方法。
- 注解驱动：通过 `@Test` 标记测试方法，简化配置。

### 2. JUnit 核心用法与原理

#### （1）基础使用步骤

1. 环境准备：IDEA 已集成 JUnit（需确保依赖导入，Maven 项目需添加 JUnit 依赖）。
2. 编写测试类：
   - 测试类命名规范：`被测试类名+Test`（如 `UserServiceTest`）。
   - 测试方法规范：`public void 方法名()`，无参无返回值，用 `@Test` 注解标记。
3. 执行测试：
   - 单个方法：右键测试方法 → Run "方法名"。
   - 全部方法：右键测试类 → Run "测试类名"。
4. 断言验证：使用 `Assert` 类（JUnit 4）或 `Assertions` 类（JUnit 5）验证结果，替代手动观察。

#### （2）核心注解与断言

| 注解           | 作用                              | 适用场景                         |
| -------------- | --------------------------------- | -------------------------------- |
| `@Test`        | 标记测试方法                      | 需执行的测试逻辑                 |
| `@Before`      | 每个测试方法执行前执行（JUnit 4） | 初始化资源（如创建数据库连接）   |
| `@After`       | 每个测试方法执行后执行（JUnit 4） | 释放资源（如关闭数据库连接）     |
| `@BeforeClass` | 测试类加载时执行一次（静态方法）  | 初始化全局资源（如加载配置文件） |
| `@AfterClass`  | 测试类销毁时执行一次（静态方法）  | 释放全局资源（如关闭线程池）     |

- 断言示例（JUnit 5）：

  java

  运行

  ```java
  import static org.junit.jupiter.api.Assertions.*;
  
  @Test
  public void testLogin() {
      UserService userService = new UserService();
      boolean result = userService.login("admin", "123456");
      assertTrue(result, "登录失败，用户名或密码错误"); // 断言结果为true，否则抛异常
      assertEquals("admin", userService.getCurrentUser().getName()); // 断言用户名一致
  }
  ```

  

#### （3）原理简析

- JUnit 本质是通过反射机制解析测试类中的

   

  ```
  @Test
  ```

   

  注解方法，依次实例化测试类（非单例），执行方法并捕获异常：

  - 无异常 → 测试成功（绿色）。
  - 抛出 `AssertionError` → 断言失败（红色）。
  - 抛出其他异常 → 测试异常（红色）。

### 3. 实战案例：业务方法单元测试

java

```java
// 被测试的业务类
public class UserService {
    public boolean login(String username, String password) {
        return "admin".equals(username) && "123456".equals(password);
    }

    public int calculateAge(int birthYear) {
        if (birthYear < 1900 || birthYear > 2024) {
            throw new IllegalArgumentException("出生年份非法");
        }
        return 2024 - birthYear;
    }
}

// 测试类
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class UserServiceTest {
    private UserService userService;

    // 每个测试方法执行前初始化
    @BeforeEach
    void setUp() {
        userService = new UserService();
    }

    // 每个测试方法执行后清理
    @AfterEach
    void tearDown() {
        userService = null;
    }

    @Test
    void login_success() {
        boolean result = userService.login("admin", "123456");
        assertTrue(result);
    }

    @Test
    void login_fail_with_wrong_password() {
        boolean result = userService.login("admin", "111111");
        assertFalse(result);
    }

    @Test
    void calculateAge_valid() {
        int age = userService.calculateAge(2000);
        assertEquals(24, age);
    }

    @Test
    void calculateAge_invalid_throw_exception() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.calculateAge(1899),
            "应抛出非法参数异常"
        );
        assertEquals("出生年份非法", exception.getMessage());
    }
}
```

------

## 二、反射（Reflection）—— 运行时解析类结构的利器

### 1. 反射的核心本质与场景

#### （1）反射是什么？

反射是 Java 提供的运行时解析类结构的机制，允许程序在运行时：

- 加载类并获取其 `Class` 对象（类的 “元数据”）。
- 解剖类的成分（构造器、成员变量、方法）。
- 动态调用方法、修改成员变量（即使是私有成分）。

#### （2）核心应用场景

- 框架开发：MyBatis 解析 Mapper 接口、Spring 实例化 Bean、JUnit 解析 `@Test` 注解。
- 通用工具类：如对象序列化（JSON 转换）、对象拷贝（BeanUtils）、数据库 ORM 映射。
- 绕过限制：突破封装（访问私有方法 / 变量）、绕过泛型约束（向 List<String> 中添加 Integer）。

### 2. 反射的底层原理

#### （1）Class 对象的本质

- 每个类在 JVM 中仅对应一个

   

  ```
  Class
  ```

   

  对象，是类加载的产物：

  - 类加载流程：加载（读取 .class 字节码）→ 验证 → 准备 → 解析 → 初始化。
  - `Class` 对象在 “加载阶段” 生成，存储类的完整结构信息（类名、父类、接口、成员等）。

- 所有对象（`Object` 子类）的 `getClass()` 方法，本质是返回该对象所属类的 `Class` 对象。

#### （2）获取 Class 对象的三种方式（原理差异）

| 方式                      | 原理                                   | 适用场景                           |
| ------------------------- | -------------------------------------- | ---------------------------------- |
| `类名.class`              | 编译期静态获取，无需实例化对象         | 已知类名，编译时确定类             |
| `对象.getClass()`         | 运行时通过对象获取，需先实例化         | 已知对象，动态获取其类结构         |
| `Class.forName("全类名")` | 运行时通过类名加载类并获取，无需实例化 | 类名未知（如配置文件中配置的类名） |

- 示例：

  java

  ```java
  // 1. 类名.class（静态编译）
  Class<Student> clazz1 = Student.class;
  
  // 2. 对象.getClass()（运行时获取）
  Student student = new Student();
  Class<? extends Student> clazz2 = student.getClass();
  
  // 3. Class.forName（动态加载，需处理ClassNotFoundException）
  Class<?> clazz3 = Class.forName("com.itheima.Student");
  ```

  

### 3. 反射操作类成分的详细步骤

#### （1）操作构造器（实例化对象）

- 核心 API（`Class` 类方法）：

  | 方法                               | 作用                         | 访问权限             |
  | ---------------------------------- | ---------------------------- | -------------------- |
  | `getConstructors()`                | 获取所有 public 构造器       | 仅 public            |
  | `getDeclaredConstructors()`        | 获取所有构造器（含 private） | 无限制（需暴力反射） |
  | `getConstructor(Class...)`         | 获取指定参数的 public 构造器 | 仅 public            |
  | `getDeclaredConstructor(Class...)` | 获取指定参数的任意构造器     | 无限制（需暴力反射） |

- 核心操作：通过 `Constructor.newInstance(Object...)` 实例化对象。

- 暴力反射：`setAccessible(true)` 关闭访问权限检查（突破 private 限制）。

- 案例：实例化私有构造器的对象

  java

  ```java
  class Student {
      private String name;
      private int age;
  
      // 私有构造器
      private Student(String name, int age) {
          this.name = name;
          this.age = age;
      }
  }
  
  public class ReflectConstructorDemo {
      public static void main(String[] args) throws Exception {
          // 1. 获取Class对象
          Class<Student> clazz = Student.class;
  
          // 2. 获取私有构造器（参数：String.class, int.class）
          Constructor<Student> constructor = clazz.getDeclaredConstructor(String.class, int.class);
  
          // 3. 暴力反射：关闭访问检查
          constructor.setAccessible(true);
  
          // 4. 实例化对象
          Student student = constructor.newInstance("张三", 20);
          System.out.println(student.getName()); // 输出“张三”（需getter方法）
      }
  }
  ```

  

#### （2）操作成员变量（赋值 / 取值）

- 核心 API（`Class` 类方法）：

  | 方法                            | 作用                           | 访问权限             |
  | ------------------------------- | ------------------------------ | -------------------- |
  | `getFields()`                   | 获取所有 public 成员变量       | 仅 public            |
  | `getDeclaredFields()`           | 获取所有成员变量（含 private） | 无限制（需暴力反射） |
  | `getField(String name)`         | 获取指定名称的 public 成员变量 | 仅 public            |
  | `getDeclaredField(String name)` | 获取指定名称的任意成员变量     | 无限制（需暴力反射） |

- 核心操作：

  - 赋值：`Field.set(Object obj, Object value)`（obj 为实例对象，静态变量传 null）。
  - 取值：`Field.get(Object obj)`。

- 案例：修改私有成员变量

  java

  ```java
  public class ReflectFieldDemo {
      public static void main(String[] args) throws Exception {
          Class<Student> clazz = Student.class;
          Student student = clazz.getDeclaredConstructor(String.class, int.class).newInstance("张三", 20);
  
          // 1. 获取私有成员变量name
          Field nameField = clazz.getDeclaredField("name");
          nameField.setAccessible(true);
  
          // 2. 取值
          String oldName = (String) nameField.get(student);
          System.out.println("旧姓名：" + oldName); // 张三
  
          // 3. 赋值
          nameField.set(student, "李四");
          System.out.println("新姓名：" + student.getName()); // 李四
  
          // 操作静态成员变量（obj传null）
          Field schoolField = clazz.getDeclaredField("school"); // 假设school是private static String
          schoolField.setAccessible(true);
          schoolField.set(null, "黑马程序员");
          System.out.println(Student.getSchool()); // 黑马程序员
      }
  }
  ```

  

#### （3）操作成员方法（调用方法）

- 核心 API（`Class` 类方法）：

  | 方法                                       | 作用                                 | 访问权限             |
  | ------------------------------------------ | ------------------------------------ | -------------------- |
  | `getMethods()`                             | 获取所有 public 方法（含父类继承的） | 仅 public            |
  | `getDeclaredMethods()`                     | 获取所有方法（含 private，不含父类） | 无限制（需暴力反射） |
  | `getMethod(String name, Class...)`         | 获取指定名称和参数的 public 方法     | 仅 public            |
  | `getDeclaredMethod(String name, Class...)` | 获取指定名称和参数的任意方法         | 无限制（需暴力反射） |

- 核心操作：`Method.invoke(Object obj, Object...)`（obj 为实例对象，静态方法传 null）。

- 案例：调用私有方法

  java

  ```java
  class Student {
      private void study(String subject) {
          System.out.println("正在学习：" + subject);
      }
  
      private static void sayHello() {
          System.out.println("Hello, 反射！");
      }
  }
  
  public class ReflectMethodDemo {
      public static void main(String[] args) throws Exception {
          Class<Student> clazz = Student.class;
          Student student = clazz.getDeclaredConstructor(String.class, int.class).newInstance("张三", 20);
  
          // 1. 调用私有实例方法study
          Method studyMethod = clazz.getDeclaredMethod("study", String.class);
          studyMethod.setAccessible(true);
          studyMethod.invoke(student, "Java反射"); // 输出“正在学习：Java反射”
  
          // 2. 调用私有静态方法sayHello
          Method helloMethod = clazz.getDeclaredMethod("sayHello");
          helloMethod.setAccessible(true);
          helloMethod.invoke(null); // 输出“Hello, 反射！”
      }
  }
  ```

  

### 4. 反射的核心作用与风险

#### （1）核心作用

- 动态性：运行时解析类结构，适配未知类（如框架解析配置文件中的类）。

- 通用性：编写通用工具类（如 BeanUtils 拷贝任意对象属性）。

- 突破限制：访问私有成分、绕过泛型约束（如下例）。

- 绕过泛型约束案例：

  java

  ```java
  public class ReflectGenericDemo {
      public static void main(String[] args) throws Exception {
          List<String> list = new ArrayList<>();
          list.add("Java");
  
          // 绕过泛型约束，向List<String>中添加Integer
          Class<? extends List> clazz = list.getClass();
          Method addMethod = clazz.getDeclaredMethod("add", Object.class);
          addMethod.invoke(list, 100); // 无编译错误，运行时成功添加
  
          System.out.println(list); // 输出 [Java, 100]
      }
  }
  ```

  

- 原理：泛型仅在编译期有效，运行时泛型被擦除为 `Object`，反射直接调用底层方法，不受编译期约束。

#### （2）风险与注意事项

- 破坏封装：访问私有成分可能导致代码逻辑混乱（如修改私有变量值导致对象状态异常）。
- 性能损耗：反射需动态解析类结构，比直接调用慢 10~100 倍（框架中通过缓存 `Class` 对象优化）。
- 安全性：暴力反射可能被恶意利用（如破解单例模式的私有构造器）。

### 5. 反射的框架应用案例：简易对象序列化工具

需求：将任意对象的属性名和值写入文件（模拟 JSON 序列化的核心逻辑）。

java

```java
import java.io.FileWriter;
import java.lang.reflect.Field;

public class ObjectSerializer {
    // 序列化对象到文件
    public static void serialize(Object obj, String filePath) throws Exception {
        if (obj == null) throw new IllegalArgumentException("对象不能为空");

        Class<?> clazz = obj.getClass();
        FileWriter writer = new FileWriter(filePath);
        writer.write("=" + clazz.getSimpleName() + "=\n");

        // 遍历所有成员变量（含private）
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            field.setAccessible(true); // 暴力反射
            String fieldName = field.getName();
            Object fieldValue = field.get(obj);
            writer.write(fieldName + "=" + fieldValue + "\n");
        }

        writer.write("===" + clazz.getSimpleName() + "===\n");
        writer.close();
        System.out.println("序列化成功：" + filePath);
    }

    public static void main(String[] args) throws Exception {
        Student student = new Student("张三", 20);
        serialize(student, "student.txt");
        // 输出文件内容：
        // =Student=
        // name=张三
        // age=20
        // ===Student===
    }
}
```

------

## 三、注解（Annotation）—— 代码的语义标记

### 1. 注解的核心本质与场景

#### （1）注解是什么？

注解是 Java 代码的 “特殊标记”（如 `@Test`、`@Override`），本质是继承 `java.lang.annotation.Annotation` 的接口，用于：

- 标记代码（类、方法、变量等），为其他程序（如框架、编译器）提供语义信息。
- 存储配置信息（替代 XML 配置），简化开发（如 Spring 的 `@Component` 替代 XML 中的 ``）。

#### （2）核心应用场景

- 编译器检查：`@Override` 验证方法重写、`@Deprecated` 标记过时方法。
- 框架配置：Spring 的 `@Autowired`（依赖注入）、MyBatis 的 `@Select`（SQL 映射）。
- 自定义业务逻辑：如自定义 `@Log` 注解标记需要记录日志的方法，通过反射解析执行日志逻辑。

### 2. 注解的底层原理

#### （1）注解的本质

- 注解本质是接口，编译后生成的字节码文件中，注解接口会继承 `Annotation` 接口，属性会被编译为抽象方法。

- 注解的使用（`@MyAnnotation(属性=值)`）本质是创建该接口的实现类对象，属性值通过实现类的方法返回。

- 示例：自定义注解的底层等价

  java

  ```java
  // 自定义注解
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  public @interface MyTest {
      String value() default "test";
  }
  
  // 底层等价于
  public interface MyTest extends Annotation {
      String value() default "test";
  }
  
  // 使用 @MyTest("demo") 等价于
  MyTest myTest = new MyTest() {
      @Override
      public String value() {
          return "demo";
      }
  
      @Override
      public Class<? extends Annotation> annotationType() {
          return MyTest.class;
      }
  };
  ```

  

#### （2）元注解（注解的注解）

元注解用于约束自定义注解的 “使用范围” 和 “存活周期”，核心元注解有 2 个：

1. `@Retention`：指定注解的存活周期（必须指定，否则默认 `CLASS`）：
   - `RetentionPolicy.SOURCE`：仅存活于源码阶段，编译为 .class 后消失（如 `@Override`）。
   - `RetentionPolicy.CLASS`：存活到 .class 阶段，运行时消失（默认值，无特殊需求不使用）。
   - `RetentionPolicy.RUNTIME`：存活到运行时，可通过反射解析（开发常用，如 `@Test`、自定义业务注解）。
2. `@Target`：指定注解的使用位置（如方法、类、变量）：
   - `ElementType.TYPE`：类、接口、枚举。
   - `ElementType.METHOD`：方法。
   - `ElementType.FIELD`：成员变量。
   - `ElementType.PARAMETER`：方法参数。
   - `ElementType.CONSTRUCTOR`：构造器。

### 3. 自定义注解与解析

#### （1）自定义注解步骤

1. 用 `@interface` 关键字定义注解。
2. 添加属性（格式：`属性类型 属性名() default 默认值;`）。
3. 添加元注解（`@Retention`、`@Target`）。

- 示例：自定义日志注解

  java

  ```java
  import java.lang.annotation.*;
  
  // 元注解：运行时存活，可标记在方法上
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  public @interface Log {
      // 注解属性：日志描述，默认值为"执行方法"
      String desc() default "执行方法";
      // 注解属性：是否记录耗时，默认值为false
      boolean recordTime() default false;
  }
  ```

  

#### （2）注解解析步骤

注解解析是通过反射获取 “被注解的元素”（类、方法等），提取注解属性值，核心依赖 `AnnotatedElement` 接口（`Class`、`Method`、`Field` 等均实现该接口）。

核心 API（`AnnotatedElement` 接口）：

| 方法                                 | 作用                 |
| ------------------------------------ | -------------------- |
| `isAnnotationPresent(Class clazz)`   | 判断是否存在指定注解 |
| `getDeclaredAnnotation(Class clazz)` | 获取指定注解对象     |
| `getDeclaredAnnotations()`           | 获取所有注解对象     |

- 案例：解析

  ```
  @Log
  ```

  注解，执行日志逻辑

  java

  ```java
  import java.lang.reflect.Method;
  import java.time.LocalDateTime;
  
  // 被注解的业务类
  public class UserService {
      @Log(desc = "用户登录", recordTime = true)
      public boolean login(String username, String password) {
          // 模拟登录逻辑
          try {
              Thread.sleep(100); // 模拟耗时
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
          return "admin".equals(username) && "123456".equals(password);
      }
  
      @Log(desc = "用户退出")
      public void logout() {
          System.out.println("用户退出成功");
      }
  }
  
  // 注解解析器
  public class LogAnnotationParser {
      public static void parse(Object obj) throws Exception {
          Class<?> clazz = obj.getClass();
          Method[] methods = clazz.getDeclaredMethods();
  
          for (Method method : methods) {
              // 1. 判断方法是否有@Log注解
              if (method.isAnnotationPresent(Log.class)) {
                  // 2. 获取注解对象
                  Log logAnnotation = method.getDeclaredAnnotation(Log.class);
                  String desc = logAnnotation.desc();
                  boolean recordTime = logAnnotation.recordTime();
  
                  // 3. 执行日志逻辑
                  System.out.println("[" + LocalDateTime.now() + "] 开始" + desc);
                  long start = System.currentTimeMillis();
  
                  // 4. 调用目标方法
                  method.setAccessible(true);
                  Object result = method.invoke(obj, "admin", "123456");
                  System.out.println("[" + LocalDateTime.now() + "] " + desc + "结果：" + result);
  
                  // 5. 记录耗时
                  if (recordTime) {
                      long cost = System.currentTimeMillis() - start;
                      System.out.println("[" + LocalDateTime.now() + "] " + desc + "耗时：" + cost + "ms");
                  }
                  System.out.println("------------------------");
              }
          }
      }
  
      public static void main(String[] args) throws Exception {
          UserService userService = new UserService();
          parse(userService);
          // 输出结果：
          // [2024-10-01T15:30:00] 开始用户登录
          // [2024-10-01T15:30:00] 用户登录结果：true
          // [2024-10-01T15:30:00] 用户登录耗时：102ms
          // ------------------------
          // [2024-10-01T15:30:00] 开始用户退出
          // 用户退出成功
          // [2024-10-01T15:30:00] 用户退出结果：null
          // ------------------------
      }
  }
  ```

  

### 4. 注解的框架应用：简易 JUnit 实现

需求：自定义 `@MyTest` 注解，模拟 JUnit 功能，标记的方法自动执行。

java

```java
import java.lang.reflect.Method;

// 1. 自定义@MyTest注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyTest {
}

// 2. 测试类
public class TestDemo {
    @MyTest
    public void test1() {
        System.out.println("执行测试方法1");
    }

    public void test2() {
        System.out.println("未标记注解，不执行");
    }

    @MyTest
    public void test3() {
        System.out.println("执行测试方法3");
    }
}

// 3. 模拟JUnit执行器
public class MyJUnitRunner {
    public static void run(Class<?> testClass) throws Exception {
        Object testObj = testClass.getDeclaredConstructor().newInstance();
        Method[] methods = testClass.getDeclaredMethods();

        for (Method method : methods) {
            if (method.isAnnotationPresent(MyTest.class)) {
                method.setAccessible(true);
                try {
                    method.invoke(testObj);
                } catch (Exception e) {
                    System.out.println("测试方法" + method.getName() + "执行失败：" + e.getMessage());
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        run(TestDemo.class);
        // 输出：
        // 执行测试方法1
        // 执行测试方法3
    }
}
```

------

## 四、动态代理（Dynamic Proxy）—— 增强对象行为的设计模式

### 1. 动态代理的核心本质与场景

#### （1）为什么需要代理？

代理模式的核心是 “增强目标对象的行为”，且不修改目标对象的代码，解决以下问题：

- 通用功能抽离：将日志、事务、权限校验等通用逻辑与业务逻辑分离（如所有方法执行前记录日志）。
- 解耦：目标对象仅关注核心业务，代理对象负责非核心功能。

#### （2）核心应用场景

- AOP（面向切面编程）：Spring AOP 的核心实现（如事务管理、日志记录、异常处理）。
- 框架封装：MyBatis 的 Mapper 代理（通过动态代理生成 Mapper 接口的实现类）。
- 性能监控：统计方法执行耗时、接口限流、缓存代理。

### 2. JDK 动态代理的底层原理

#### （1）JDK 动态代理的核心特性

- 基于接口：目标对象必须实现接口，代理对象是接口的实现类（通过 `Proxy.newProxyInstance` 生成）。
- 动态生成字节码：JVM 在运行时生成代理类的字节码，无需手动编写代理类。
- 核心依赖：`java.lang.reflect.Proxy` 类（生成代理对象）和 `java.lang.reflect.InvocationHandler` 接口（定义代理逻辑）。

#### （2）动态代理的执行流程

1. 目标对象实现接口（如 `UserService` 实现 `IUserService`）。
2. 实现 `InvocationHandler` 接口，重写 `invoke` 方法（代理逻辑 + 目标方法调用）。
3. 通过 `Proxy.newProxyInstance` 生成代理对象（参数：类加载器、目标接口、InvocationHandler）。
4. 调用代理对象的方法 → 触发 `InvocationHandler.invoke` 方法 → 执行代理逻辑 → 调用目标方法。

#### （3）Proxy.newProxyInstance 参数详解

| 参数                  | 作用                                   | 示例                                 |
| --------------------- | -------------------------------------- | ------------------------------------ |
| `ClassLoader loader`  | 加载代理类的类加载器（与目标对象一致） | `target.getClass().getClassLoader()` |
| `Class[] interfaces`  | 目标对象实现的所有接口                 | `target.getClass().getInterfaces()`  |
| `InvocationHandler h` | 代理逻辑处理器（核心）                 | 自定义的 InvocationHandler 实现类    |

### 3. JDK 动态代理实战案例

需求：增强 `UserService` 类，统计所有方法的执行耗时（模拟 Spring AOP 的性能监控）。

#### （1）步骤 1：定义目标接口和目标类

java

```java
// 目标接口
public interface IUserService {
    boolean login(String username, String password);
    void logout();
}

// 目标类（实现接口）
public class UserService implements IUserService {
    @Override
    public boolean login(String username, String password) {
        try {
            Thread.sleep(100); // 模拟业务耗时
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "admin".equals(username) && "123456".equals(password);
    }

    @Override
    public void logout() {
        System.out.println("用户退出成功");
    }
}
```

#### （2）步骤 2：实现 InvocationHandler（代理逻辑）

java

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.time.LocalDateTime;

public class TimeInvocationHandler implements InvocationHandler {
    // 目标对象（被代理的对象）
    private final Object target;

    public TimeInvocationHandler(Object target) {
        this.target = target;
    }

    /**
     * 代理逻辑核心方法
     * @param proxy 代理对象（一般不用）
     * @param method 目标方法
     * @param args 目标方法参数
     * @return 目标方法返回值
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 1. 前置增强：记录开始时间
        System.out.println("[" + LocalDateTime.now() + "] 方法" + method.getName() + "开始执行");
        long start = System.currentTimeMillis();

        // 2. 调用目标方法
        Object result = method.invoke(target, args); // 执行目标对象的方法

        // 3. 后置增强：记录结束时间和耗时
        long cost = System.currentTimeMillis() - start;
        System.out.println("[" + LocalDateTime.now() + "] 方法" + method.getName() + "执行结束，耗时：" + cost + "ms");
        System.out.println("------------------------");

        return result;
    }
}
```

#### （3）步骤 3：生成代理对象并测试

java

```java
import java.lang.reflect.Proxy;

public class ProxyTest {
    public static void main(String[] args) {
        // 1. 创建目标对象
        IUserService target = new UserService();

        // 2. 创建InvocationHandler
        InvocationHandler handler = new TimeInvocationHandler(target);

        // 3. 生成代理对象（参数：类加载器、接口、handler）
        IUserService proxy = (IUserService) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            handler
        );

        // 4. 调用代理对象的方法
        boolean loginResult = proxy.login("admin", "123456");
        System.out.println("登录结果：" + loginResult);

        proxy.logout();
    }
}

// 输出结果：
// [2024-10-01T16:00:00] 方法login开始执行
// [2024-10-01T16:00:00] 方法login执行结束，耗时：101ms
// ------------------------
// 登录结果：true
// [2024-10-01T16:00:00] 方法logout开始执行
// 用户退出成功
// [2024-10-01T16:00:00] 方法logout执行结束，耗时：1ms
// ------------------------
```

### 4. 动态代理的扩展：JDK 代理 vs CGLIB 代理

| 对比维度     | JDK 动态代理                            | CGLIB 代理                        |
| ------------ | --------------------------------------- | --------------------------------- |
| 依赖         | JDK 内置（无需第三方依赖）              | 第三方库（cglib-nodep.jar）       |
| 目标对象要求 | 必须实现接口                            | 无需实现接口（基于类继承）        |
| 底层原理     | 生成接口实现类字节码                    | 生成目标类的子类字节码            |
| 代理限制     | 无法代理私有方法、final 方法            | 无法代理 final 类 / 方法          |
| 性能         | 低版本 JDK 中较慢，JDK8+ 性能接近 CGLIB | 基于 ASM 字节码操作，性能略高     |
| 应用场景     | Spring AOP 中默认（目标对象实现接口时） | Spring AOP 中目标对象无接口时使用 |

### 5. 动态代理的框架应用：Spring AOP 原理简化

Spring AOP 的核心是 “动态代理 + 注解 / XML 配置”，简化流程如下：

1. 定义切面类（如 `LogAspect`），包含通知（前置、后置、环绕通知）。
2. 通过 `@Aspect` 注解标记切面类，`@Before`/`@After` 标记通知方法。
3. Spring 扫描切面类和目标类，通过 JDK 或 CGLIB 生成代理对象。
4. 调用目标方法 → 代理对象触发通知逻辑 → 执行目标方法。

------

## 五、核心总结与面试高频点

### 1. 核心技术对比

| 技术     | 核心本质                     | 核心应用                | 底层依赖                                         |
| -------- | ---------------------------- | ----------------------- | ------------------------------------------------ |
| 反射     | 运行时解析类结构             | 框架开发、通用工具类    | Class 对象、反射 API（Constructor/Field/Method） |
| 注解     | 代码语义标记与配置存储       | 框架配置、编译器检查    | 注解接口、元注解、反射解析                       |
| 动态代理 | 增强对象行为，不修改目标代码 | AOP、性能监控、框架封装 | Proxy 类、InvocationHandler 接口                 |
| 单元测试 | 自动化验证方法正确性         | 开发测试、重构回归测试  | JUnit 框架、反射解析 @Test 注解                  |

### 2. 面试高频问题

- 反射为什么能破坏封装？

  因为

  ```
  setAccessible(true)
  ```

   

  会关闭 JVM 的访问权限检查，允许访问私有成员，底层是通过跳过字节码中的访问控制校验实现的。

- 注解的生命周期有哪几种？开发中常用哪种？

  

  三种：SOURCE、CLASS、RUNTIME；开发中常用 RUNTIME，因为只有该阶段的注解可通过反射解析，适用于框架配置。

- JDK 动态代理为什么必须基于接口？

  

  因为 JDK 动态代理生成的代理类会默认继承

  ```
  Proxy
  ```

  类，而 Java 不支持多继承，因此只能通过实现目标接口的方式生成代理类。

- 反射、注解、动态代理在 Spring 中的应用？

  - 反射：实例化 Bean、注入属性（`@Autowired`）。
  - 注解：`@Component` 标记 Bean、`@RequestMapping` 映射接口。
  - 动态代理：AOP 事务管理、日志切面、缓存增强。

- 单元测试中如何验证异常？

  

  JUnit 5 用

   

  ```
  assertThrows
  ```

   

  方法捕获预期异常，验证异常类型和消息。



# 5 道 Java 高级技术（反射 + 注解 + 动态代理 + 单元测试）中大厂面试题

## 面试题 1

请详细说明反射机制的核心作用，并举例说明如何通过反射 “绕过泛型约束”（如向`List`中添加`Integer`）。同时分析反射的性能损耗来源，以及在框架开发中（如 Spring）如何优化反射性能？

## 面试题 2

自定义注解需依赖元注解，请解释`@Retention`和`@Target`的核心作用及取值差异。若需开发一个类似 Spring`@Component`的注解（标记类为 Bean，运行时生效），请写出完整的注解定义、解析逻辑，并说明解析注解时为何必须依赖反射？

## 面试题 3

JDK 动态代理与 CGLIB 代理的底层实现原理有何差异？请从 “目标对象要求、代理逻辑依赖、性能、局限性” 四个维度对比，并说明 Spring AOP 在何种情况下选择 JDK 代理，何种情况下选择 CGLIB 代理？Spring Boot 2.x 后对代理选择有何调整？

## 面试题 4

JUnit 单元测试中，`@Test`注解标记的测试方法为何必须满足 “public、无参、无返回值” 的规范？请说明如何使用 JUnit 5 的断言机制验证 “方法抛出预期异常”（如验证`IllegalArgumentException`），并解释 “测试方法独立性” 的重要性及如何保证？

## 面试题 5

请设计一个基于 “反射 + 注解 + 动态代理” 的简易权限校验框架：要求通过`@RequiresPermission`注解标记需要权限的方法（注解属性为权限名称），代理对象在调用目标方法前校验当前用户是否拥有该权限，无权限则抛出`PermissionDeniedException`。请写出注解定义、代理逻辑及测试代码，并说明各技术模块的协作流程。

------

# 面试题答案

## 面试题 1 答案

### 1. 反射机制的核心作用

反射的核心是 “运行时解析类结构并操作成分”，核心作用包括：

1. **动态解析类成分**：加载未知类（如配置文件中指定的类名），获取其构造器、成员变量、方法并操作（如 Spring 实例化 Bean）。
2. **破坏封装性**：访问类的私有成员（如私有构造器、私有方法），典型场景是框架中的单例模式破解、对象序列化。
3. **绕过编译期约束**：突破泛型擦除后的限制、绕过访问权限修饰符（如`private`）。
4. **通用工具开发**：编写通用化组件（如`BeanUtils`对象拷贝、JSON 序列化工具），适配任意对象。

### 2. 反射绕过泛型约束的原理与示例

#### （1）原理

泛型仅在**编译期**生效，运行时 JVM 会执行 “泛型擦除”：将`List`擦除为`List`，泛型约束仅存在于编译期语法检查，运行时通过反射调用底层方法（如`List.add(Object)`），可不受编译期约束。

#### （2）示例代码

java



运行









```java
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class ReflectGenericDemo {
    public static void main(String[] args) throws Exception {
        // 1. 初始化泛型集合List<String>
        List<String> strList = new ArrayList<>();
        strList.add("Java"); // 编译期允许，符合泛型约束

        // 2. 反射获取List的add方法（底层add方法参数为Object）
        Class<? extends List> clazz = strList.getClass();
        Method addMethod = clazz.getDeclaredMethod("add", Object.class); // 泛型擦除后参数为Object

        // 3. 绕过泛型约束，添加Integer类型
        addMethod.invoke(strList, 100); // 运行时无编译约束，成功添加

        // 4. 验证结果
        System.out.println(strList); // 输出 [Java, 100]，泛型约束被绕过
    }
}
```

### 3. 反射的性能损耗来源

1. **动态解析成本**：反射需在运行时解析`Class`对象、查找方法 / 字段（如`getDeclaredMethod`需遍历方法数组匹配参数类型），而非编译期直接绑定。
2. **访问权限检查**：若操作私有成员，需调用`setAccessible(true)`关闭 JVM 的访问校验，涉及底层权限检查逻辑。
3. **方法调用成本**：反射调用（`Method.invoke`）需封装参数数组、处理返回值装箱 / 拆箱，比直接调用多一层中间逻辑（JVM 无法对反射调用做编译优化）。

### 4. 框架中的反射性能优化方案（以 Spring 为例）

1. 缓存`Class`与成员对象

   ：Spring 在启动时缓存

   ```
   Bean
   ```

   的

   ```
   Class
   ```

   对象、构造器、方法（如

   ```
   BeanDefinition
   ```

   中存储解析后的成员信息），避免重复解析。

   java

   

   运行

   

   

   

   

   ```java
   // 伪代码：Spring缓存Method对象
   private Map<Class<?>, Map<String, Method>> methodCache = new ConcurrentHashMap<>();
   public Method getCachedMethod(Class<?> clazz, String methodName, Class<?>... paramTypes) {
       return methodCache.computeIfAbsent(clazz, k -> new ConcurrentHashMap<>())
                        .computeIfAbsent(methodName + Arrays.toString(paramTypes), k -> {
                            try {
                                return clazz.getDeclaredMethod(methodName, paramTypes);
                            } catch (NoSuchMethodException e) {
                                throw new RuntimeException(e);
                            }
                        });
   }
   ```

   

2. **关闭访问权限检查**：通过`setAccessible(true)`跳过 JVM 的访问校验，减少权限检查开销（框架中默认对私有成员执行此操作）。

3. **使用高效反射 API**：JDK7 + 提供`MethodHandle`，性能接近直接调用（底层绕过部分反射校验逻辑），Spring 在核心组件中逐步替换`Method.invoke`为`MethodHandle`。

4. **字节码生成优化**：Spring 通过 CGLIB 动态生成代理类时，直接在字节码中硬编码成员访问逻辑，避免反射调用（如`Bean`的属性注入）。

## 面试题 2 答案

### 1. 元注解`@Retention`与`@Target`的核心作用

#### （1）`@Retention`：控制注解的 “存活周期”

- 核心作用：定义注解在 JVM 中的有效范围，决定注解是否能被反射解析。
- 取值差异：
  - `RetentionPolicy.SOURCE`：仅存活于源码阶段，编译为`.class`后删除（如`@Override`，仅用于编译器检查）。
  - `RetentionPolicy.CLASS`：存活到`.class`文件，但运行时 JVM 不加载，无法通过反射获取（默认值，无特殊场景不使用）。
  - `RetentionPolicy.RUNTIME`：存活到运行时，可通过反射解析（开发常用，如框架配置注解`@Component`、`@Test`）。

#### （2）`@Target`：控制注解的 “使用位置”

- 核心作用：限制注解可标记的 Java 元素（如类、方法、变量），避免滥用。
- 常用取值：
  - `ElementType.TYPE`：可标记类、接口、枚举。
  - `ElementType.METHOD`：可标记成员方法。
  - `ElementType.FIELD`：可标记成员变量。
  - `ElementType.PARAMETER`：可标记方法参数。

### 2. 自定义`@MyComponent`注解（模拟 Spring`@Component`）

#### （1）完整注解定义

java



运行









```java
import java.lang.annotation.*;

// 元注解：运行时生效，仅可标记类/接口/枚举
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MyComponent {
    // 注解属性：Bean名称，默认值为类名首字母小写
    String value() default "";
}
```

#### （2）注解解析逻辑（模拟 Spring 扫描 Bean）

java



运行









```java
import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class MyComponentScanner {
    // 存储扫描到的Bean实例
    private List<Object> beanList = new ArrayList<>();

    // 扫描指定包下的@MyComponent注解类并实例化
    public void scan(String basePackage) throws Exception {
        // 1. 将包名转为文件路径（如com.itheima → com/itheima）
        String packagePath = basePackage.replace(".", File.separator);
        // 2. 通过类加载器获取包的物理路径
        URL url = Thread.currentThread().getContextClassLoader().getResource(packagePath);
        if (url == null) {
            throw new RuntimeException("包路径不存在：" + basePackage);
        }
        File packageDir = new File(url.getFile());

        // 3. 遍历包下所有.class文件
        for (File file : packageDir.listFiles()) {
            String fileName = file.getName();
            if (fileName.endsWith(".class")) {
                // 4. 构建全类名（如com.itheima.UserService）
                String className = basePackage + "." + fileName.substring(0, fileName.indexOf("."));
                // 5. 反射获取Class对象
                Class<?> clazz = Class.forName(className);
                // 6. 判断类是否标记@MyComponent
                if (clazz.isAnnotationPresent(MyComponent.class)) {
                    // 7. 实例化Bean（调用无参构造器）
                    Object bean = clazz.getDeclaredConstructor().newInstance();
                    beanList.add(bean);
                    // 8. 打印Bean信息
                    MyComponent annotation = clazz.getDeclaredAnnotation(MyComponent.class);
                    String beanName = annotation.value().isEmpty() 
                            ? toLowerFirstCase(clazz.getSimpleName()) 
                            : annotation.value();
                    System.out.println("扫描到Bean：" + beanName + "，类型：" + clazz.getName());
                }
            }
        }
    }

    // 工具方法：类名首字母小写（如UserService → userService）
    private String toLowerFirstCase(String className) {
        char[] chars = className.toCharArray();
        chars[0] += 32; // ASCII码小写比大写大32
        return new String(chars);
    }

    // 测试
    public static void main(String[] args) throws Exception {
        MyComponentScanner scanner = new MyComponentScanner();
        scanner.scan("com.itheima.service"); // 扫描指定包
        // 输出示例：扫描到Bean：userService，类型：com.itheima.service.UserService
    }
}
```

#### （3）解析注解依赖反射的原因

注解的本质是 “继承`Annotation`的接口”，其属性值仅在运行时通过接口实现类（JVM 动态生成）存储。而解析注解需：

1. 判断元素（类 / 方法）是否标记注解（`isAnnotationPresent`）；

2. 获取注解对象及属性值（

   ```
   getDeclaredAnnotation
   ```

   ）；

   

   这些操作均需通过反射访问元素的 “元数据”（

   ```
   Class
   ```

   /

   ```
   Method
   ```

   /

   ```
   Field
   ```

   对象），因为注解信息存储在

   ```
   Class
   ```

   文件的 “运行时常量池” 中，仅反射能在运行时读取该信息。

## 面试题 3 答案

### 1. JDK 动态代理与 CGLIB 代理的核心差异（四维度对比）

| 对比维度     | JDK 动态代理                                                 | CGLIB 代理                                                   |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 目标对象要求 | 必须实现**至少一个接口**（代理类继承`Proxy`，无法多继承）    | 无需实现接口（代理类继承目标类），但目标类不能是`final`      |
| 代理逻辑依赖 | 实现`InvocationHandler`接口，重写`invoke`方法（通过`Method.invoke`调用目标方法） | 实现`MethodInterceptor`接口，重写`intercept`方法（通过 ASM 字节码操作调用目标方法） |
| 性能         | JDK8 前：反射调用开销大，性能低于 CGLIB；JDK8+：优化反射（如`MethodHandle`），性能接近 CGLIB | 基于 ASM 直接生成字节码，无反射开销，高并发下性能略优        |
| 局限性       | 1. 无法代理无接口的类；2. 无法代理`private`/`final`方法（反射无法调用） | 1. 无法代理`final`类（无法继承）；2. 无法代理`final`方法（无法重写） |

### 2. Spring AOP 的代理选择逻辑

Spring AOP 的代理选择核心是 “优先 JDK 动态代理， fallback 到 CGLIB”，具体判断流程如下：

1. 判断目标类是否实现接口

   ：

   - 若实现接口（如`UserService implements IUserService`）：默认使用 JDK 动态代理。
   - 若未实现接口（如`UserService`无接口）：使用 CGLIB 代理。

2. 强制 CGLIB 代理的场景

   ：

   - 配置`spring.aop.proxy-target-class=true`（Spring Boot 2.x 后默认`true`）：无论是否有接口，均使用 CGLIB。
   - 目标类是`final`但实现接口：JDK 代理（因 CGLIB 无法继承`final`类）。

3. Spring Boot 2.x 的调整

   ：

   - Spring Boot 1.x 默认`proxy-target-class=false`（优先 JDK）；2.x 默认`true`（优先 CGLIB）。
   - 调整原因：CGLIB 无需接口，适配更多场景（如无接口的类），且 JDK8 + 后 CGLIB 性能优势不明显，简化配置。

### 3. 示例：Spring AOP 代理选择场景

java



运行









```java
// 场景1：目标类实现接口 → JDK代理（默认）
public interface IUserService { void login(); }
@Service
public class UserService implements IUserService { 
    @Override public void login() { /* 业务逻辑 */ } 
}

// 场景2：目标类无接口 → CGLIB代理
@Service
public class OrderService { 
    public void createOrder() { /* 业务逻辑 */ } 
}

// 场景3：配置强制CGLIB → 即使有接口也用CGLIB
// application.properties：spring.aop.proxy-target-class=true
@Service
public class ProductService implements IProductService { 
    @Override public void query() { /* 业务逻辑 */ } 
}
```

## 面试题 4 答案

### 1. `@Test`方法 “public、无参、无返回值” 的原因

JUnit 设计此规范的核心是 “保证测试独立性和自动化执行”，具体原因如下：

1. **public 访问权限**：JUnit 通过反射调用测试方法（`Method.invoke`），若为`private`，反射需`setAccessible(true)`，但 JUnit 为避免破坏封装，强制`public`（早期 JUnit 版本不支持私有方法测试）。
2. **无参数**：测试方法需 “独立执行”，若有参数，JUnit 无法自动注入参数值（参数来源不明确，破坏独立性）。
3. **无返回值**：测试结果通过 “断言”（如`assertTrue`）判断，而非返回值（返回值无法标准化判断成功 / 失败），且无返回值可简化测试逻辑。

### 2. JUnit 5 验证 “预期异常” 的断言机制

JUnit 5 通过`Assertions.assertThrows`方法捕获预期异常，验证异常类型和消息，示例如下：

java



运行









```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

// 被测试类：计算年龄，非法年份抛异常
class AgeCalculator {
    public int calculate(int birthYear) {
        if (birthYear < 1900 || birthYear > 2024) {
            throw new IllegalArgumentException("出生年份必须在1900-2024之间");
        }
        return 2024 - birthYear;
    }
}

// 测试类
class AgeCalculatorTest {
    private final AgeCalculator calculator = new AgeCalculator();

    @Test
    void calculate_invalidBirthYear_throwException() {
        // 1. 捕获预期异常（参数1：预期异常类型，参数2：Lambda表达式执行测试逻辑）
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> calculator.calculate(1899), // 执行会抛异常的逻辑
            "预期抛出非法参数异常，但未抛出" // 断言失败提示
        );

        // 2. 验证异常消息（确保异常原因正确）
        assertEquals("出生年份必须在1900-2024之间", exception.getMessage());
    }
}
```

### 3. 测试方法独立性的重要性及保证措施

#### （1）重要性

- 避免 “测试污染”：若测试方法依赖其他方法的执行结果（如共享静态变量），一个方法失败会导致后续方法全部失败，无法定位真实问题。
- 支持并行执行：JUnit 5 支持测试方法并行执行，独立性是并行的前提（无共享状态）。

#### （2）保证措施

1. 测试方法无共享状态

   ：不使用静态变量存储测试数据（静态变量会跨方法共享），每个测试方法独立初始化对象。

   java

   

   运行

   

   

   

   

   ```java
   // 错误：静态变量共享状态
   private static User user; 
   @Test void test1() { user = new User(); }
   @Test void test2() { user.setName("test"); } // 污染test1的user
   
   // 正确：每个方法独立初始化
   private User user;
   @BeforeEach void setUp() { user = new User(); } // 每个测试前初始化
   ```

   

2. **测试方法顺序无关**：不依赖方法执行顺序（JUnit 默认随机执行顺序，可通过`@TestMethodOrder`指定，但不推荐）。

3. **资源独立释放**：使用`@AfterEach`释放资源（如关闭文件、数据库连接），避免资源泄漏影响其他方法。

## 面试题 5 答案

### 1. 简易权限校验框架设计（反射 + 注解 + 动态代理）

#### （1）步骤 1：定义`@RequiresPermission`注解

java



运行









```java
import java.lang.annotation.*;

// 元注解：运行时生效，仅标记方法
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RequiresPermission {
    // 注解属性：所需权限名称（如"user:delete"）
    String value();
}
```

#### （2）步骤 2：实现权限校验代理（InvocationHandler）

java



运行









```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

// 权限上下文：模拟当前登录用户的权限
class PermissionContext {
    private static String currentUserPermission; // 模拟当前用户权限

    public static void setCurrentUserPermission(String permission) {
        currentUserPermission = permission;
    }

    public static String getCurrentUserPermission() {
        return currentUserPermission;
    }
}

// 自定义异常：权限不足
class PermissionDeniedException extends RuntimeException {
    public PermissionDeniedException(String message) {
        super(message);
    }
}

// 代理处理器：实现权限校验逻辑
class PermissionInvocationHandler implements InvocationHandler {
    private final Object target; // 目标对象

    public PermissionInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 1. 判断方法是否标记@RequiresPermission
        if (method.isAnnotationPresent(RequiresPermission.class)) {
            // 2. 获取注解中的所需权限
            RequiresPermission annotation = method.getDeclaredAnnotation(RequiresPermission.class);
            String requiredPerm = annotation.value();
            // 3. 获取当前用户权限
            String userPerm = PermissionContext.getCurrentUserPermission();

            // 4. 权限校验
            if (userPerm == null || !userPerm.equals(requiredPerm)) {
                throw new PermissionDeniedException("权限不足：需要[" + requiredPerm + "]，当前用户仅有[" + userPerm + "]");
            }
        }

        // 5. 权限通过，调用目标方法
        return method.invoke(target, args);
    }

    // 静态方法：生成代理对象
    public static <T> T createProxy(T target) {
        return (T) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            new PermissionInvocationHandler(target)
        );
    }
}
```

#### （3）步骤 3：目标接口与实现类（标记注解）

java



运行









```java
// 目标接口
public interface IUserService {
    void queryUser(); // 无需权限

    @RequiresPermission("user:delete") // 需要"user:delete"权限
    void deleteUser(String userId);
}

// 目标实现类
public class UserService implements IUserService {
    @Override
    public void queryUser() {
        System.out.println("查询用户成功");
    }

    @Override
    public void deleteUser(String userId) {
        System.out.println("删除用户：" + userId + " 成功");
    }
}
```

#### （4）步骤 4：测试代码

java



运行









```java
public class PermissionProxyTest {
    public static void main(String[] args) {
        // 1. 创建目标对象
        IUserService target = new UserService();
        // 2. 生成代理对象
        IUserService proxy = PermissionInvocationHandler.createProxy(target);

        // 场景1：当前用户无权限 → 执行deleteUser抛异常
        PermissionContext.setCurrentUserPermission("user:query");
        proxy.queryUser(); // 输出：查询用户成功
        try {
            proxy.deleteUser("1001"); 
        } catch (PermissionDeniedException e) {
            System.out.println("异常：" + e.getMessage()); // 输出：权限不足：需要[user:delete]，当前用户仅有[user:query]
        }

        // 场景2：当前用户有权限 → 执行成功
        PermissionContext.setCurrentUserPermission("user:delete");
        proxy.deleteUser("1001"); // 输出：删除用户：1001 成功
    }
}
```

### 2. 技术模块协作流程

1. **注解标记**：`@RequiresPermission`标记需要权限的方法，存储 “所需权限” 元数据（运行时通过反射读取）。
2. **反射解析**：代理处理器`PermissionInvocationHandler`在`invoke`方法中，通过反射（`method.isAnnotationPresent`、`getDeclaredAnnotation`）解析方法上的注解，获取所需权限。
3. **动态代理**：通过`Proxy.newProxyInstance`生成代理对象，拦截目标方法调用，在调用前执行权限校验逻辑，校验通过则调用目标方法（`method.invoke`），否则抛异常。

整个流程实现 “权限校验与业务逻辑解耦”，无需修改`UserService`代码，仅通过注解和代理即可增强功能，符合 AOP 思想。