黑马程序员瑞吉外卖项目 Day1 的核心是实现**后台员工登录 / 退出功能**，涉及数据库设计、实体类定义、Controller 层接口开发、Service 层逻辑实现等完整流程。以下是具体功能实现细节及示例代码：

### 一、前期准备

#### 1. 数据库设计（员工表 `employee`）

首先在 `reggie` 数据库中创建员工表，存储登录用户信息：

sql



```sql
CREATE TABLE `employee` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码（加密存储）',
  `name` varchar(50) NOT NULL COMMENT '姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `sex` varchar(2) DEFAULT NULL COMMENT '性别',
  `id_number` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-正常',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `create_user` bigint(20) NOT NULL COMMENT '创建人',
  `update_user` bigint(20) NOT NULL COMMENT '修改人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)  -- 用户名唯一，用于登录验证
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='员工信息';
```

#### 2. 项目结构搭建

创建标准的 Spring Boot 项目结构，核心包结构如下：

plaintext











```plaintext
com.itheima.reggie
├── controller    # 控制器层（接收请求）
├── service       # 服务层（业务逻辑）
│   └── impl      # 服务实现类
├── mapper        # 持久层（数据库操作）
├── pojo          # 实体类（对应数据库表）
├── common        # 通用工具类（返回结果、异常处理等）
└── ReggieApplication.java  # 启动类
```

### 二、核心功能实现

#### 1. 实体类定义（`Employee.java`）

对应数据库表 `employee`，使用 Lombok 简化 get/set 方法：

java











```java
package com.itheima.reggie.pojo;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import java.time.LocalDateTime;

@Data  // Lombok注解，自动生成get/set/toString等方法
public class Employee {
    @TableId(type = IdType.AUTO)  // 主键自增
    private Long id;
    private String username;
    private String password;
    private String name;
    private String phone;
    private String sex;
    private String idNumber;  // 对应数据库的id_number字段（驼峰命名自动映射）
    private Integer status;  // 1-正常，0-禁用
    
    // 自动填充创建时间、修改时间、创建人、修改人（后续功能会用到）
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableField(fill = FieldFill.INSERT)
    private Long createUser;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}
```

#### 2. 通用返回结果类（`R.java`）

统一接口返回格式，方便前端处理：

java











```java
package com.itheima.reggie.common;

import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
public class R<T> {
    private Integer code;  // 编码：1成功，0和其它数字为失败
    private String msg;    // 错误信息
    private T data;        // 数据
    private Map map = new HashMap();  // 动态数据

    // 成功返回
    public static <T> R<T> success(T object) {
        R<T> r = new R<T>();
        r.data = object;
        r.code = 1;
        return r;
    }

    // 失败返回
    public static <T> R<T> error(String msg) {
        R<T> r = new R<T>();
        r.msg = msg;
        r.code = 0;
        return r;
    }

    // 往返回结果中添加动态数据
    public R<T> add(String key, Object value) {
        this.map.put(key, value);
        return this;
    }
}
```

#### 3. Mapper 层（`EmployeeMapper.java`）

使用 MyBatis-Plus 简化数据库操作：

java











```java
package com.itheima.reggie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itheima.reggie.pojo.Employee;
import org.apache.ibatis.annotations.Mapper;

@Mapper  // 标记为MyBatis映射接口
public interface EmployeeMapper extends BaseMapper<Employee> {
    // 继承BaseMapper后，无需手动写CRUD方法，MyBatis-Plus自动实现
}
```

#### 4. Service 层（`EmployeeService.java` 及实现类）

定义业务逻辑接口及实现：

java











```java
// 接口
package com.itheima.reggie.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.itheima.reggie.pojo.Employee;

public interface EmployeeService extends IService<Employee> {
    // 继承IService，获得MyBatis-Plus的增强CRUD方法
}

// 实现类
package com.itheima.reggie.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itheima.reggie.mapper.EmployeeMapper;
import com.itheima.reggie.pojo.Employee;
import com.itheima.reggie.service.EmployeeService;
import org.springframework.stereotype.Service;

@Service
public class EmployeeServiceImpl extends ServiceImpl<EmployeeMapper, Employee> implements EmployeeService {
    // 无需手动实现基础方法，如需自定义业务逻辑可在此添加
}
```

#### 5. Controller 层（`EmployeeController.java`）

处理登录 / 退出请求，核心逻辑：

java











```java
package com.itheima.reggie.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itheima.reggie.common.R;
import com.itheima.reggie.pojo.Employee;
import com.itheima.reggie.service.EmployeeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@Slf4j  // 日志注解
@RestController
@RequestMapping("/employee")  // 统一接口前缀
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    /**
     * 员工登录
     * @param request 用于存储登录成功的员工ID到Session
     * @param employee 接收前端传递的用户名和密码
     * @return 登录结果
     */
    @PostMapping("/login")
    public R<Employee> login(HttpServletRequest request, @RequestBody Employee employee) {
        // 1. 获取前端传递的密码，进行MD5加密（数据库中密码是加密存储的）
        String password = employee.getPassword();
        password = DigestUtils.md5DigestAsHex(password.getBytes());  // Spring提供的MD5工具

        // 2. 根据用户名查询数据库
        LambdaQueryWrapper<Employee> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Employee::getUsername, employee.getUsername());  // 等值查询用户名
        Employee emp = employeeService.getOne(queryWrapper);  // 用户名唯一，用getOne

        // 3. 判断用户是否存在
        if (emp == null) {
            return R.error("登录失败，用户不存在");
        }

        // 4. 判断密码是否正确
        if (!emp.getPassword().equals(password)) {
            return R.error("登录失败，密码错误");
        }

        // 5. 判断用户是否被禁用（status=0）
        if (emp.getStatus() == 0) {
            return R.error("登录失败，账号已被禁用");
        }

        // 6. 登录成功，将员工ID存入Session
        request.getSession().setAttribute("employee", emp.getId());

        // 7. 返回成功结果
        return R.success(emp);
    }

    /**
     * 员工退出
     * @param request 用于清除Session中的员工ID
     * @return 退出结果
     */
    @PostMapping("/logout")
    public R<String> logout(HttpServletRequest request) {
        // 清除Session中的员工ID
        request.getSession().removeAttribute("employee");
        return R.success("退出成功");
    }
}
```

### 三、关键逻辑解析

#### 1. 登录流程

1. **密码加密**：前端传递的明文密码通过 MD5 加密（`DigestUtils.md5DigestAsHex`），与数据库中存储的加密密码比对（防止明文泄露）。
2. **用户查询**：使用 MyBatis-Plus 的 `LambdaQueryWrapper` 按用户名查询（`eq(Employee::getUsername, ...)`）。
3. **状态校验**：检查用户是否存在、密码是否正确、账号是否被禁用（`status=0`）。
4. **Session 存储**：登录成功后，将员工 ID 存入 Session（`request.getSession().setAttribute(...)`），用于后续权限验证。

#### 2. 退出流程

- 核心是清除 Session 中的员工 ID（`removeAttribute("employee")`），使前端失去登录状态。

### 四、测试验证

1. **登录请求**（POST）：
   URL：`http://localhost:8080/employee/login`
   请求体：

   json

   

   

   

   

   

   ```json
   {
       "username": "admin",
       "password": "123456"
   }
   ```

   成功响应：

   json

   

   

   

   

   

   ```json
   {
       "code": 1,
       "msg": null,
       "data": {
           "id": 1,
           "username": "admin",
           "name": "管理员",
           ...
       }
   }
   ```

2. **退出请求**（POST）：
   URL：`http://localhost:8080/employee/logout`
   成功响应：

   json

   

   

   

   

   

   ```json
   {
       "code": 1,
       "msg": null,
       "data": "退出成功"
   }
   ```

### 五、总结

Day1 的核心是**登录 / 退出功能**，通过 Spring Boot + MyBatis-Plus 实现了完整的 MVC 流程，重点包括：

- 数据库表设计与实体类映射。
- 通用返回结果类统一接口格式。
- 密码加密与 Session 管理。
- MyBatis-Plus 简化 CRUD 操作。

这些基础功能为后续的菜品管理、订单处理等模块奠定了用户认证基础。

不够详细继续

### 瑞吉外卖项目 Day1 详细解析（续）

#### 六、配置文件详解

##### 1. application.yml 配置

yaml











```yaml
server:
  port: 8080  # 服务端口
  servlet:
    context-path: /  # 应用上下文路径

spring:
  datasource:  # 数据库配置
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/reggie?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    
  # 静态资源映射（后续会用到）
  resources:
    static-locations: classpath:/static/,classpath:/public/

mybatis-plus:
  mapper-locations: classpath:/mapper/**/*.xml  # mapper.xml文件位置
  type-aliases-package: com.itheima.reggie.pojo  # 实体类包路径
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 打印SQL日志
    map-underscore-to-camel-case: true  # 开启驼峰命名转换
```

##### 2. 项目启动类（ReggieApplication.java）

java











```java
package com.itheima.reggie;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;  // 启用缓存（后续会用到）
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@MapperScan("com.itheima.reggie.mapper")  // 扫描Mapper接口
@EnableTransactionManagement  // 启用事务管理
@EnableCaching  // 启用缓存（后续Redis会用到）
public class ReggieApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReggieApplication.class, args);
    }
}
```

#### 七、登录功能深入解析

##### 1. 密码加密策略

项目使用**MD5 加密**存储密码，但实际生产环境建议使用更安全的**BCrypt**：

java











```java
// BCrypt加密示例（替代MD5）
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// 加密
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String encodedPassword = encoder.encode("原始密码");

// 验证
boolean matches = encoder.matches("原始密码", encodedPassword);
```

##### 2. Session 管理与权限控制

登录成功后，员工 ID 存入 Session，后续可通过拦截器验证登录状态：

java











```java
// 登录状态拦截器示例
public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, 
                             HttpServletResponse response, 
                             Object handler) throws Exception {
        // 检查Session中是否有员工ID
        Object employeeId = request.getSession().getAttribute("employee");
        if (employeeId == null) {
            // 未登录，返回未登录结果（前端会跳转到登录页）
            response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
            return false;
        }
        return true;  // 已登录，放行
    }
}

// 注册拦截器（在配置类中）
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**")  // 拦截所有请求
                .excludePathPatterns(  // 排除登录、静态资源等请求
                        "/employee/login",
                        "/employee/logout",
                        "/backend/**",
                        "/front/**"
                );
    }
}
```

#### 八、数据库初始化与数据填充

##### 1. 初始数据导入

项目提供了 SQL 脚本初始化数据，包括：

- 员工表（默认管理员账号）
- 菜品分类表
- 菜品表
- 套餐表
- 订单表结构等

示例插入管理员账号：

sql











```sql
INSERT INTO employee (username, password, name, phone, sex, id_number, status, create_time, update_time, create_user, update_user)
VALUES ('admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', '13800138000', '男', '110101199001011234', 1, NOW(), NOW(), 1, 1);

-- 密码：123456（MD5加密后为 e10adc3949ba59abbe56e057f20f883e）
```

##### 2. 数据库连接测试

创建测试类验证数据库连接：

java











```java
@SpringBootTest
class ReggieApplicationTests {

    @Autowired
    private EmployeeMapper employeeMapper;

    @Test
    void testSelect() {
        System.out.println(("----- selectAll method test ------"));
        List<Employee> employeeList = employeeMapper.selectList(null);
        employeeList.forEach(System.out::println);
    }
}
```

#### 九、前端页面集成

##### 1. 静态资源配置

将课程提供的前端页面（`backend` 和 `front` 文件夹）放入 `src/main/resources/static` 目录下：

plaintext











```plaintext
src/main/resources/
└── static/
    ├── backend/    # 管理后台页面
    │   ├── index.html
    │   ├── login.html
    │   └── ...
    └── front/      # 移动端页面
        ├── index.html
        └── ...
```

##### 2. 登录页面处理

前端登录页面（`backend/login.html`）发送 AJAX 请求：

javascript











```javascript
// 登录按钮点击事件
document.querySelector('#loginButton').addEventListener('click', function() {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    
    // 发送登录请求
    fetch('/employee/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 1) {
            // 登录成功，跳转到首页
            location.href = '/backend/index.html';
        } else {
            // 登录失败，显示错误信息
            alert(data.msg);
        }
    });
});
```

#### 十、全局异常处理

##### 1. 自定义异常类

java











```java
// 业务异常类
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
```

##### 2. 全局异常处理器

java











```java
@RestControllerAdvice  // 全局异常处理
public class GlobalExceptionHandler {

    // 处理登录失败异常
    @ExceptionHandler(BusinessException.class)
    public R<String> handleBusinessException(BusinessException ex) {
        log.error(ex.getMessage());
        return R.error(ex.getMessage());
    }

    // 处理其他异常
    @ExceptionHandler(Exception.class)
    public R<String> handleException(Exception ex) {
        log.error("系统异常：", ex);
        return R.error("系统繁忙，请稍后重试");
    }
}
```

#### 十一、日志配置

##### 1. logback-spring.xml 配置

xml











```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds" debug="false">
    <!-- 应用名称 -->
    <property name="APP_NAME" value="reggie"/>
    
    <!-- 日志输出格式 -->
    <property name="LOG_PATTERN" value="%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"/>
    
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>
    
    <!-- 系统日志输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${APP_NAME}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${APP_NAME}.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>
    
    <!-- 日志级别配置 -->
    <root level="info">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
    
    <!-- 自定义包日志级别 -->
    <logger name="com.itheima.reggie" level="debug"/>
    <logger name="com.baomidou.mybatisplus" level="info"/>
</configuration>
```

#### 十二、开发规范与代码质量

##### 1. 代码注释规范

java











```java
/**
 * 员工管理控制器
 * 提供员工登录、退出等功能
 * 
 * @author 黑马程序员
 * @version 1.0
 */
@RestController
@RequestMapping("/employee")
public class EmployeeController {
    // 类注释
    
    /**
     * 员工登录方法
     * 1. 接收前端传递的用户名和密码
     * 2. 进行密码加密比对
     * 3. 验证用户状态
     * 4. 登录成功后将员工ID存入Session
     * 
     * @param request HTTP请求对象，用于操作Session
     * @param employee 包含用户名和密码的员工对象
     * @return 统一响应结果R，包含登录成功的员工信息或错误信息
     */
    @PostMapping("/login")
    public R<Employee> login(HttpServletRequest request, @RequestBody Employee employee) {
        // 方法注释
        // ... 方法实现
    }
}
```

##### 2. 统一返回格式

所有接口都返回 `R<T>` 格式，确保前端处理一致性：

json











```json
// 成功响应示例
{
    "code": 1,
    "msg": null,
    "data": {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "phone": "13800138000",
        "status": 1,
        "createTime": "2023-01-01T12:00:00"
    }
}

// 失败响应示例
{
    "code": 0,
    "msg": "登录失败，密码错误",
    "data": null
}
```

#### 十三、项目部署与测试

##### 1. 本地部署步骤

1. 安装 MySQL 8.0+，创建`reggie`数据库
2. 导入 SQL 脚本初始化表结构和数据
3. 修改`application.yml`中的数据库连接信息
4. 运行`ReggieApplication`启动项目
5. 访问`http://localhost:8080/backend/login.html`登录系统

##### 2. 测试用例

java











```java
@SpringBootTest
@AutoConfigureMockMvc
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testLoginSuccess() throws Exception {
        // 准备请求参数
        Employee employee = new Employee();
        employee.setUsername("admin");
        employee.setPassword("123456");
        
        // 发送登录请求
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/employee/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(JSON.toJSONString(employee)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        
        // 验证响应结果
        String content = result.getResponse().getContentAsString();
        R<Employee> response = JSON.parseObject(content, new TypeReference<R<Employee>>() {});
        
        Assertions.assertNotNull(response.getData());
        Assertions.assertEquals("admin", response.getData().getUsername());
    }
}
```

#### 十四、常见问题与解决方案

1. **跨域问题**
   解决方案：添加 CORS 配置

   java

   

   

   

   

   

   ```java
   @Configuration
   public class CorsConfig implements WebMvcConfigurer {
       @Override
       public void addCorsMappings(CorsRegistry registry) {
           registry.addMapping("/**")
                   .allowedOrigins("*")
                   .allowedMethods("GET", "POST", "PUT", "DELETE")
                   .allowedHeaders("*")
                   .allowCredentials(true);
       }
   }
   ```

2. **Session 失效问题**
   解决方案：

   - 增加 Session 超时时间：`server.servlet.session.timeout=30m`
   - 前端定期发送心跳请求保持 Session 活跃

3. **SQL 日志不显示**
   解决方案：检查`mybatis-plus.configuration.log-impl`配置是否正确

### 总结

Day1 的核心是**搭建基础环境**和实现**登录 / 退出功能**，重点包括：

1. **项目结构**：标准的 MVC 分层（Controller/Service/Mapper/Entity）
2. **数据库设计**：员工表设计与初始化
3. **安全机制**：密码加密、Session 管理、登录验证
4. **全局处理**：异常处理、日志配置
5. **前端集成**：静态资源映射与登录页面交互

这些基础工作为后续开发菜品管理、订单系统等功能模块提供了坚实的基础。

再详细一点

### 瑞吉外卖项目 Day1 超详细解析（续）

#### 十三、项目部署与测试（续）

##### 3. 数据库连接池配置

在 `application.yml` 中添加 HikariCP 连接池配置：

yaml











```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource  # 指定连接池类型
    hikari:
      minimum-idle: 5  # 最小空闲连接数
      maximum-pool-size: 15  # 最大连接数
      auto-commit: true  # 自动提交事务
      idle-timeout: 30000  # 空闲连接超时时间
      pool-name: HikariCP  # 连接池名称
      max-lifetime: 1800000  # 连接最大生命周期
      connection-timeout: 30000  # 连接超时时间
      connection-test-query: SELECT 1  # 连接测试查询语句
```

##### 4. 单元测试进阶

使用 Testcontainers 进行容器化测试（需要 Docker 环境）：

java











```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class EmployeeControllerTest {

    // 启动 MySQL 容器
    @Container
    static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        // 设置测试环境的数据源
        System.setProperty("spring.datasource.url", mysqlContainer.getJdbcUrl());
        System.setProperty("spring.datasource.username", mysqlContainer.getUsername());
        System.setProperty("spring.datasource.password", mysqlContainer.getPassword());
    }

    @Test
    void testLoginSuccess() throws Exception {
        // 初始化测试数据
        initTestData();
        
        // 执行测试
        MvcResult result = mockMvc.perform(post("/employee/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andReturn();
        
        // 验证结果
        String content = result.getResponse().getContentAsString();
        R<Employee> response = JSON.parseObject(content, new TypeReference<R<Employee>>() {});
        assertNotNull(response.getData());
        assertEquals("admin", response.getData().getUsername());
    }

    private void initTestData() {
        // 使用 JdbcTemplate 插入测试数据
        JdbcTemplate jdbcTemplate = new JdbcTemplate(
                DataSourceBuilder.create()
                        .url(mysqlContainer.getJdbcUrl())
                        .username(mysqlContainer.getUsername())
                        .password(mysqlContainer.getPassword())
                        .driverClassName(mysqlContainer.getDriverClassName())
                        .build()
        );
        
        // 创建员工表
        jdbcTemplate.execute("CREATE TABLE employee (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                "username VARCHAR(50) NOT NULL," +
                "password VARCHAR(100) NOT NULL," +
                "status INT NOT NULL" +
                ")");
        
        // 插入测试数据（密码为 MD5("123456")）
        jdbcTemplate.update("INSERT INTO employee (username, password, status) VALUES (?, ?, ?)",
                "admin", "e10adc3949ba59abbe56e057f20f883e", 1);
    }
}
```

#### 十四、MyBatis-Plus 高级特性

##### 1. 自动填充功能

实现创建时间、修改时间等字段的自动填充：

java











```java
// 定义元数据处理器
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        // 插入时自动填充创建时间和修改时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        // 从 Session 中获取当前登录用户（实际项目中需要根据 Session 或 Token 获取）
        this.strictInsertFill(metaObject, "createUser", Long.class, 1L);
        this.strictInsertFill(metaObject, "updateUser", Long.class, 1L);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        // 更新时自动填充修改时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        // 更新时自动填充修改用户
        this.strictUpdateFill(metaObject, "updateUser", Long.class, 1L);
    }
}
```

##### 2. 逻辑删除配置

配置逻辑删除（不物理删除数据，通过状态字段标记）：

java











```java
// 在实体类的状态字段上添加注解
@TableLogic
private Integer status;  // 1-正常，0-删除

// 配置文件中添加逻辑删除设置
mybatis-plus:
  global-config:
    db-config:
      logic-not-delete-value: 1  # 未删除值
      logic-delete-value: 0     # 已删除值
```

#### 十五、登录安全增强

##### 1. 验证码功能实现

添加登录验证码防止暴力破解：

java











```java
// 验证码生成工具类
public class CaptchaUtils {
    // 生成随机验证码
    public static String generateCode(int length) {
        String chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
    
    // 生成验证码图片
    public static BufferedImage generateImage(String code, int width, int height) {
        // 创建图片
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics g = image.getGraphics();
        
        // 设置背景色
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);
        
        // 设置字体
        g.setFont(new Font("Arial", Font.BOLD, 20));
        
        // 绘制验证码
        for (int i = 0; i < code.length(); i++) {
            g.setColor(getRandomColor());
            g.drawString(code.charAt(i) + "", 20 * i + 10, 25);
        }
        
        // 添加干扰线
        drawRandomLines(g, width, height);
        
        // 释放资源
        g.dispose();
        
        return image;
    }
    
    // 生成随机颜色
    private static Color getRandomColor() {
        Random random = new Random();
        return new Color(random.nextInt(255), random.nextInt(255), random.nextInt(255));
    }
    
    // 绘制干扰线
    private static void drawRandomLines(Graphics g, int width, int height) {
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            g.setColor(getRandomColor());
            int x1 = random.nextInt(width);
            int y1 = random.nextInt(height);
            int x2 = random.nextInt(width);
            int y2 = random.nextInt(height);
            g.drawLine(x1, y1, x2, y2);
        }
    }
}

// 验证码控制器
@RestController
@RequestMapping("/captcha")
public class CaptchaController {

    @GetMapping("/image")
    public void getCaptchaImage(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 生成验证码
        String code = CaptchaUtils.generateCode(4);
        
        // 将验证码存入 Session
        request.getSession().setAttribute("captcha", code);
        
        // 设置响应头
        response.setContentType("image/jpeg");
        response.setHeader("Cache-Control", "no-cache");
        
        // 生成图片并输出
        BufferedImage image = CaptchaUtils.generateImage(code, 100, 40);
        ImageIO.write(image, "JPEG", response.getOutputStream());
    }
}

// 登录方法增强（添加验证码校验）
@PostMapping("/login")
public R<Employee> login(HttpServletRequest request, @RequestBody EmployeeLoginDTO dto) {
    // 1. 校验验证码
    String captcha = (String) request.getSession().getAttribute("captcha");
    if (captcha == null || !captcha.equals(dto.getCaptcha())) {
        return R.error("验证码错误");
    }
    
    // 2. 移除验证码（防止重复使用）
    request.getSession().removeAttribute("captcha");
    
    // 3. 原登录逻辑...
}
```

##### 2. 登录失败次数限制

防止暴力破解，限制登录失败次数：

java











```java
// 在 Session 中记录登录失败次数
@PostMapping("/login")
public R<Employee> login(HttpServletRequest request, @RequestBody EmployeeLoginDTO dto) {
    // 获取登录失败次数
    Integer failCount = (Integer) request.getSession().getAttribute("loginFailCount");
    if (failCount == null) {
        failCount = 0;
    }
    
    // 限制失败次数（例如超过5次需要验证码）
    if (failCount >= 5 && !validateCaptcha(request, dto.getCaptcha())) {
        return R.error("验证码错误");
    }
    
    // 验证用户名密码...
    Employee emp = employeeService.getOne(new LambdaQueryWrapper<Employee>()
            .eq(Employee::getUsername, dto.getUsername()));
    
    if (emp == null || !emp.getPassword().equals(encryptPassword(dto.getPassword()))) {
        // 登录失败，增加失败次数
        request.getSession().setAttribute("loginFailCount", failCount + 1);
        return R.error("用户名或密码错误");
    }
    
    // 登录成功，重置失败次数
    request.getSession().removeAttribute("loginFailCount");
    
    // 其他逻辑...
}
```

#### 十六、前端交互优化

##### 1. 表单验证

增强登录表单验证：

html



预览









```html
<!-- backend/login.html -->
<form id="loginForm">
    <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" required>
        <div class="error-message" id="usernameError"></div>
    </div>
    
    <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" required minlength="6">
        <div class="error-message" id="passwordError"></div>
    </div>
    
    <div class="form-group">
        <label for="captcha">验证码</label>
        <input type="text" id="captcha" required maxlength="4">
        <img src="/captcha/image" id="captchaImg" onclick="this.src='/captcha/image?'+Math.random()">
        <div class="error-message" id="captchaError"></div>
    </div>
    
    <button type="submit" id="loginButton">登录</button>
</form>

<script>
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 重置错误信息
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // 验证用户名
    const username = document.getElementById('username').value;
    if (!username) {
        document.getElementById('usernameError').textContent = '用户名不能为空';
        return;
    }
    
    // 验证密码
    const password = document.getElementById('password').value;
    if (!password) {
        document.getElementById('passwordError').textContent = '密码不能为空';
        return;
    }
    if (password.length < 6) {
        document.getElementById('passwordError').textContent = '密码长度不能少于6位';
        return;
    }
    
    // 验证验证码
    const captcha = document.getElementById('captcha').value;
    if (!captcha) {
        document.getElementById('captchaError').textContent = '请输入验证码';
        return;
    }
    if (captcha.length !== 4) {
        document.getElementById('captchaError').textContent = '验证码长度为4位';
        return;
    }
    
    // 发送登录请求...
});
</script>
```

##### 2. 登录状态管理

前端存储登录状态：

javascript











```javascript
// 登录成功后
fetch('/employee/login', { ... })
.then(response => response.json())
.then(data => {
    if (data.code === 1) {
        // 存储登录状态和用户信息
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        
        // 跳转到首页
        location.href = '/backend/index.html';
    } else {
        // 登录失败...
    }
});

// 在需要验证登录的页面检查状态
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // 未登录，跳转到登录页
        location.href = '/backend/login.html';
    } else {
        // 已登录，显示用户名
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        document.getElementById('usernameDisplay').textContent = userInfo.name;
    }
});
```

#### 十七、性能优化

##### 1. 慢查询监控

配置 MyBatis-Plus SQL 性能分析插件：

java











```java
@Configuration
public class MyBatisPlusConfig {

    @Bean
    @Profile({"dev", "test"})  // 只在开发和测试环境启用
    public PerformanceInterceptor performanceInterceptor() {
        PerformanceInterceptor interceptor = new PerformanceInterceptor();
        interceptor.setMaxTime(1000);  // 设置SQL执行最大时间（毫秒）
        interceptor.setFormat(true);   // SQL格式化显示
        return interceptor;
    }
}
```

##### 2. 统一响应包装

创建拦截器自动包装响应结果：

java











```java
@RestControllerAdvice
public class ResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // 排除不需要包装的方法（如返回R类型的方法）
        return !returnType.getGenericParameterType().equals(R.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        // 包装响应结果
        return R.success(body);
    }
}
```

#### 十八、代码规范与质量控制

##### 1. 代码检查工具配置

在 `pom.xml` 中添加 Checkstyle 和 PMD 插件：

xml











```xml
<build>
    <plugins>
        <!-- Checkstyle 代码风格检查 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-checkstyle-plugin</artifactId>
            <version>3.1.2</version>
            <configuration>
                <configLocation>google_checks.xml</configLocation>
                <encoding>UTF-8</encoding>
                <consoleOutput>true</consoleOutput>
                <failsOnError>true</failsOnError>
            </configuration>
        </plugin>
        
        <!-- PMD 代码质量检查 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-pmd-plugin</artifactId>
            <version>3.15.0</version>
            <configuration>
                <rulesets>
                    <ruleset>/rulesets/java/quickstart.xml</ruleset>
                </rulesets>
                <failOnViolation>true</failOnViolation>
            </configuration>
        </plugin>
    </plugins>
</build>
```

##### 2. 单元测试覆盖率

使用 JaCoCo 插件统计测试覆盖率：

xml











```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.7</version>
            <executions>
                <execution>
                    <id>prepare-agent</id>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>test</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

#### 十九、项目部署与 Docker 化

##### 1. Dockerfile 配置

dockerfile











```dockerfile
# 使用OpenJDK基础镜像
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 复制项目JAR文件
COPY target/reggie-1.0-SNAPSHOT.jar /app/reggie.jar

# 暴露服务端口
EXPOSE 8080

# 配置环境变量
ENV SPRING_PROFILES_ACTIVE=prod

# 启动应用
CMD ["java", "-jar", "reggie.jar"]
```

##### 2. Docker Compose 配置

yaml











```yaml
version: '3'

services:
  # 数据库服务
  mysql:
    image: mysql:8.0
    container_name: reggie-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: reggie
    volumes:
      - ./mysql/data:/var/lib/mysql  # 数据持久化
      - ./mysql/init:/docker-entrypoint-initdb.d  # 初始化脚本
    ports:
      - "3306:3306"
      
  # 应用服务
  reggie:
    build: .
    container_name: reggie-app
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/reggie?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=root
```

#### 二十、安全加固

##### 1. XSS 防护

添加 XSS 过滤器：

java











```java
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // 包装原始请求，过滤XSS
        XssHttpServletRequestWrapper xssRequest = new XssHttpServletRequestWrapper(
                (HttpServletRequest) request);
        chain.doFilter(xssRequest, response);
    }

    // XSS过滤包装类
    public static class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {
        public XssHttpServletRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return xssClean(value);
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) {
                return null;
            }
            String[] cleanValues = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                cleanValues[i] = xssClean(values[i]);
            }
            return cleanValues;
        }

        // 过滤XSS特殊字符
        private String xssClean(String value) {
            if (value == null || value.isEmpty()) {
                return value;
            }
            // 使用OWASP ESAPI库进行XSS过滤
            return ESAPI.encoder().canonicalize(value)
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")
                    .replaceAll("\"", "&quot;")
                    .replaceAll("'", "&#x27;")
                    .replaceAll("/", "&#x2F;");
        }
    }
}

// 注册过滤器
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Bean
    public FilterRegistrationBean<XssFilter> xssFilterRegistration() {
        FilterRegistrationBean<XssFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new XssFilter());
        registration.addUrlPatterns("/*");
        registration.setName("xssFilter");
        registration.setOrder(1);
        return registration;
    }
}
```

##### 2. SQL 注入防护

使用预编译语句（MyBatis-Plus 默认使用），避免手动拼接 SQL：

java











```java
// 安全的查询方式（MyBatis-Plus自动使用预编译）
LambdaQueryWrapper<Employee> queryWrapper = new LambdaQueryWrapper<>();
queryWrapper.eq(Employee::getUsername, username);  // 自动处理参数，防止SQL注入
employeeService.getOne(queryWrapper);
```

### 总结

Day1 通过**安全增强**、**性能优化**、**前端交互提升**和**代码质量控制**等多方面的深入实现，构建了一个健壮的项目基础：

1. **安全体系**：
   - 密码加密（MD5→BCrypt）
   - 验证码与登录限制
   - XSS/SQL 注入防护
   - Session 管理与权限控制
2. **开发效率**：
   - MyBatis-Plus 高级特性（自动填充、逻辑删除）
   - 全局异常处理与统一响应
   - 容器化测试与 CI/CD 基础
3. **用户体验**：
   - 表单验证与交互反馈
   - 登录状态管理
   - 响应式界面基础

这些细节为后续开发提供了坚实的基础，确保项目可维护性、安全性和扩展性。