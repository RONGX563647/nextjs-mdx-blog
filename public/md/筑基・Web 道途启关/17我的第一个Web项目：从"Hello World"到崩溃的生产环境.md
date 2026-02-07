# 17我的第一个Web项目：从"Hello World"到崩溃的生产环境

> "你的代码把生产数据库锁死了。"凌晨三点，我接到运维的紧急电话，手忙脚乱地登录服务器，却发现自己连日志文件都找不到。那一刻我意识到：**会写Controller不等于懂Web开发。**

![image-20260202125918224](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202125918224.png)

## 一、Maven：从"能用就行"到"工程化管理"

![image-20260202125949195](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202125949195.png)

### 1.1 第一次的pom.xml灾难

我的第一个Maven项目长这样：

xml

```xml
<project>
    <!-- 我根本不知道groupId、artifactId、version是干嘛的 -->
    <groupId>com.me</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0</version>
    
    <dependencies>
        <!-- 把所有我听说过的框架都加进来 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>5.2.0</version>  <!-- 版本不统一！ -->
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.12.0</version>
        </dependency>
        <!-- 还有很多很多... -->
    </dependencies>
</project>
```



**问题来了**：

1. Spring版本不一致，运行时出现奇怪的NoClassDefFoundError
2. 项目打包后50MB，因为包含了所有依赖的依赖
3. 团队其他人拉取代码后，依赖下载失败（某个版本被仓库删除了）

### 1.2 导师教我的正确姿势

xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <!-- 1. 继承SpringBoot父工程，统一版本管理 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.15</version>
    </parent>
    
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.company</groupId>
    <artifactId>employee-management</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    
    <properties>
        <!-- 2. 自定义属性，便于统一修改 -->
        <java.version>11</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    
    <dependencies>
        <!-- 3. 使用starter，无需指定版本 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <!-- 版本由父工程管理 -->
        </dependency>
        
        <!-- 4. 测试依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- 5. 开发工具 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- 6. SpringBoot打包插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <!-- 排除devtools，生产环境不需要 -->
                        <exclude>
                            <groupId>org.springframework.boot</groupId>
                            <artifactId>spring-boot-devtools</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
    
    <!-- 7. 指定仓库（国内加速） -->
    <repositories>
        <repository>
            <id>aliyun</id>
            <name>Aliyun Maven Repository</name>
            <url>https://maven.aliyun.com/repository/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>
</project>
```



### 1.3 多模块项目的艺术

当项目变大时，我开始拆分模块：

text

```text
employee-system/
├── pom.xml  (父工程)
├── employee-common/     (公共模块)
│   ├── pom.xml
│   └── src/
├── employee-domain/     (领域模型)
│   ├── pom.xml
│   └── src/
├── employee-repository/ (数据访问)
│   ├── pom.xml
│   └── src/
├── employee-service/    (业务逻辑)
│   ├── pom.xml
│   └── src/
└── employee-web/       (Web接口)
    ├── pom.xml
    └── src/
```



父pom.xml的关键配置：

xml

```xml
<!-- 父工程统一管理依赖版本 -->
<dependencyManagement>
    <dependencies>
        <!-- 统一所有子模块的版本 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 模块声明 -->
<modules>
    <module>employee-common</module>
    <module>employee-domain</module>
    <module>employee-repository</module>
    <module>employee-service</module>
    <module>employee-web</module>
</modules>
```



子模块pom.xml：

xml

```xml
<parent>
    <groupId>com.company</groupId>
    <artifactId>employee-system</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</parent>

<artifactId>employee-service</artifactId>

<dependencies>
    <!-- 无需指定版本 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    
    <!-- 引用兄弟模块 -->
    <dependency>
        <groupId>com.company</groupId>
        <artifactId>employee-domain</artifactId>
        <version>${project.version}</version>
    </dependency>
</dependencies>
```



## 二、HTTP协议：那些"理所当然"的坑

### 2.1 GET请求的"意外"

![image-20260202130209328](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202130209328.png)

我写了一个查询接口：

java

```java
@GetMapping("/employees")
public List<Employee> search(@RequestParam String keyword) {
    return employeeService.search(keyword);
}
```



**问题**：用户输入`Java & Spring`，URL变成`/employees?keyword=Java%20%26%20Spring`，但后端收到的是`Java`（&被截断了）。

**原因**：`&`是URL参数分隔符。

**解决方案**：

java

```java
// 1. 前端编码
const keyword = encodeURIComponent('Java & Spring');  // "Java%20%26%20Spring"

// 2. 后端接收时自动解码（Spring已经做了）
```



### 2.2 POST请求的大小限制

用户上传Excel文件时总是失败：

java

```java
@PostMapping("/upload")
public String upload(@RequestParam MultipartFile file) {
    // 处理文件
}
```



**错误**：`org.apache.tomcat.util.http.fileupload.FileUploadBase$SizeLimitExceededException`

**解决方案**：

yaml

```yaml
# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 10MB     # 单个文件最大10MB
      max-request-size: 30MB  # 整个请求最大30MB
      enabled: true
```



### 2.3 状态码的误用

我曾经这样返回：

java

```java
@PostMapping("/employees")
public Employee create(@RequestBody Employee employee) {
    Employee saved = employeeService.save(employee);
    return saved;  // 状态码200，实际应该是201
}
```



**正确的RESTful风格**：

java

```java
@PostMapping("/employees")
public ResponseEntity<Employee> create(@RequestBody Employee employee) {
    Employee saved = employeeService.save(employee);
    
    // 返回201 Created，并在响应头中设置Location
    URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(saved.getId())
            .toUri();
    
    return ResponseEntity.created(location).body(saved);
}
```



## 三、Spring IOC：从"能用"到"优雅"

### 3.1 我的"上帝"Service

刚开始，我写了一个巨大的Service：

java

```java
@Service
public class EmployeeService {
    @Autowired
    private EmployeeRepository employeeRepo;
    @Autowired 
    private DepartmentRepository deptRepo;
    @Autowired
    private SalaryService salaryService;
    @Autowired
    private AttendanceService attendanceService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private FileService fileService;
    
    // 一个方法200行，做所有事情
    public void processEmployee(EmployeeDTO dto) {
        // 验证数据（50行）
        // 处理业务（100行）
        // 发送通知（30行）
        // 记录日志（20行）
    }
}
```



### 3.2 依赖注入的几种方式

导师教我：

java

```java
// 方式1：字段注入（不推荐，但最常见）
@Service
public class EmployeeService {
    @Autowired
    private EmployeeRepository employeeRepo;
}

// 方式2：构造器注入（Spring推荐）
@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepo;
    private final DepartmentRepository deptRepo;
    
    // 构造器注入，依赖关系明确
    public EmployeeService(EmployeeRepository employeeRepo,
                          DepartmentRepository deptRepo) {
        this.employeeRepo = employeeRepo;
        this.deptRepo = deptRepo;
    }
}

// 方式3：Setter注入（适合可选依赖）
@Service
public class EmployeeService {
    private EmailService emailService;
    
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```



### 3.3 解决循环依赖

有一天，我的项目启动失败了：

text

```
The dependencies of some of the beans in the application context form a cycle:
┌─────┐
|  employeeService
↑     ↓
|  departmentService
└─────┘
```



**问题代码**：

java

```java
@Service
public class EmployeeService {
    @Autowired
    private DepartmentService departmentService;
}

@Service 
public class DepartmentService {
    @Autowired
    private EmployeeService employeeService;
}
```



**解决方案**：

1. **重构设计**（最佳）：

java

```java
// 提取公共逻辑到第三个Service
@Service
public class CommonService {
    // 公共方法
}

@Service
public class EmployeeService {
    @Autowired
    private CommonService commonService;
}

@Service
public class DepartmentService {
    @Autowired
    private CommonService commonService;
}
```



2 **使用@Lazy**：

java

```java
@Service
public class EmployeeService {
    private final DepartmentService departmentService;
    
    public EmployeeService(@Lazy DepartmentService departmentService) {
        this.departmentService = departmentService;
    }
}
```



1. **使用Setter注入**：

java

```java
@Service
public class EmployeeService {
    private DepartmentService departmentService;
    
    @Autowired
    public void setDepartmentService(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }
}
```



## 四、MySQL：从"跑起来"到"跑得快"

![image-20260202131209623](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202131209623.png)

### 4.1 我设计的第一张表

sql

```sql
-- 我的"杰作"
CREATE TABLE employee (
    id int PRIMARY KEY,
    name varchar(20),
    age int,
    department varchar(50),
    position varchar(50),
    salary float,
    entry_date datetime,
    update_time datetime,
    status int
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
```



**问题一堆**：

1. 使用MyISAM引擎，不支持事务
2. 字符集是latin1，不能存中文
3. 主键用int，最多存21亿条数据
4. salary用float，计算精度有问题
5. 没有索引，查询慢

### 4.2 正确的表设计

sql

```sql
CREATE TABLE employee (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    employee_no VARCHAR(32) NOT NULL UNIQUE COMMENT '员工编号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender TINYINT NOT NULL DEFAULT 1 COMMENT '性别:1男,2女',
    age TINYINT UNSIGNED COMMENT '年龄',
    department_id BIGINT UNSIGNED NOT NULL COMMENT '部门ID',
    position VARCHAR(50) COMMENT '职位',
    salary DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '薪资',
    entry_date DATE NOT NULL COMMENT '入职日期',
    
    -- 状态管理
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1在职,2离职,3休假',
    
    -- 审计字段
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT UNSIGNED COMMENT '创建人',
    update_by BIGINT UNSIGNED COMMENT '更新人',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除:0否,1是',
    
    -- 索引
    INDEX idx_department_id (department_id),
    INDEX idx_status (status),
    INDEX idx_entry_date (entry_date),
    UNIQUE INDEX uk_employee_no (employee_no),
    INDEX idx_name (name(10))  -- 前缀索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='员工表' 
  ROW_FORMAT=DYNAMIC;
```



### 4.3 SQL优化实战

**慢查询**：`SELECT * FROM employee WHERE name LIKE '%张%' AND department_id = 1 ORDER BY entry_date DESC LIMIT 0, 20;`

**优化步骤**：

1. **使用EXPLAIN分析**：

sql

```sql
EXPLAIN SELECT * FROM employee WHERE name LIKE '%张%' AND department_id = 1;
```



1. **添加合适的索引**：

sql

```sql
-- 原来的索引不够
-- 添加联合索引
CREATE INDEX idx_department_name ON employee(department_id, name(10), entry_date);
```



1. **优化查询语句**：

sql

```sql
-- 如果必须使用%张%，考虑使用全文索引
ALTER TABLE employee ADD FULLTEXT INDEX ft_name (name);

-- 或者使用搜索引擎如Elasticsearch
SELECT * FROM employee 
WHERE department_id = 1 
  AND MATCH(name) AGAINST('张*' IN BOOLEAN MODE)
ORDER BY entry_date DESC 
LIMIT 0, 20;
```



### 4.4 事务管理：发工资的教训

我写的发工资代码：

java

```java
public void paySalary(Long employeeId, BigDecimal amount) {
    // 1. 更新账户余额
    accountService.addBalance(employeeId, amount);
    
    // 2. 记录工资发放日志
    salaryLogService.log(employeeId, amount);
    
    // 3. 发送通知
    notificationService.send(employeeId, "工资已发放");
}
```



**问题**：如果在第3步失败，账户余额已经增加了，但用户没收到通知，日志也没记录。

**解决方案**：

java

```java
@Service
@Transactional(rollbackFor = Exception.class)  // 默认只回滚RuntimeException
public class SalaryService {
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private SalaryLogService salaryLogService;
    
    @Autowired
    private NotificationService notificationService;
    
    // 声明式事务
    public void paySalary(Long employeeId, BigDecimal amount) {
        // 都成功或都失败
        accountService.addBalance(employeeId, amount);
        salaryLogService.log(employeeId, amount);
        notificationService.send(employeeId, "工资已发放");
    }
    
    // 编程式事务（更灵活）
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    public void paySalaryWithTemplate(Long employeeId, BigDecimal amount) {
        transactionTemplate.execute(status -> {
            try {
                accountService.addBalance(employeeId, amount);
                salaryLogService.log(employeeId, amount);
                notificationService.send(employeeId, "工资已发放");
                return Boolean.TRUE;
            } catch (Exception e) {
                status.setRollbackOnly();  // 标记回滚
                throw e;
            }
        });
    }
}
```



## 五、JDBC到MyBatis：数据访问的进化

### 5.1 原始的JDBC代码

java

```java
public class EmployeeDao {
    public Employee findById(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            conn = dataSource.getConnection();
            String sql = "SELECT * FROM employee WHERE id = ?";
            ps = conn.prepareStatement(sql);
            ps.setLong(1, id);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                Employee emp = new Employee();
                emp.setId(rs.getLong("id"));
                emp.setName(rs.getString("name"));
                emp.setAge(rs.getInt("age"));
                // ... 每个字段都要手动设置
                return emp;
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } finally {
            // 必须关闭资源
            try { if (rs != null) rs.close(); } catch (Exception e) {}
            try { if (ps != null) ps.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }
    }
}
```



### 5.2 使用JdbcTemplate简化

java

```java
@Repository
public class EmployeeDao {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Employee findById(Long id) {
        String sql = "SELECT * FROM employee WHERE id = ?";
        
        // 使用RowMapper映射结果
        return jdbcTemplate.queryForObject(sql, new RowMapper<Employee>() {
            @Override
            public Employee mapRow(ResultSet rs, int rowNum) throws SQLException {
                Employee emp = new Employee();
                emp.setId(rs.getLong("id"));
                emp.setName(rs.getString("name"));
                // 还是要手动映射
                return emp;
            }
        }, id);
    }
    
    // 使用BeanPropertyRowMapper（字段名和属性名一致时）
    public Employee findByIdSimple(Long id) {
        String sql = "SELECT * FROM employee WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, 
            new BeanPropertyRowMapper<>(Employee.class), id);
    }
}
```



### 5.3 MyBatis的优雅

xml

```xml
<!-- EmployeeMapper.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.company.mapper.EmployeeMapper">
    
    <!-- 结果映射 -->
    <resultMap id="EmployeeResultMap" type="Employee">
        <id property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="age" column="age"/>
        <result property="gender" column="gender"/>
        <result property="salary" column="salary"/>
        <result property="entryDate" column="entry_date"/>
        
        <!-- 关联查询 -->
        <association property="department" javaType="Department">
            <id property="id" column="dept_id"/>
            <result property="name" column="dept_name"/>
        </association>
    </resultMap>
    
    <!-- 基础查询 -->
    <select id="findById" resultMap="EmployeeResultMap">
        SELECT 
            e.*,
            d.name as dept_name
        FROM employee e
        LEFT JOIN department d ON e.department_id = d.id
        WHERE e.id = #{id}
    </select>
    
    <!-- 动态查询 -->
    <select id="findByCondition" resultMap="EmployeeResultMap">
        SELECT * FROM employee
        <where>
            <if test="name != null and name != ''">
                AND name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="departmentId != null">
                AND department_id = #{departmentId}
            </if>
            <if test="minSalary != null">
                AND salary >= #{minSalary}
            </if>
            <if test="maxSalary != null">
                AND salary &lt;= #{maxSalary}
            </if>
            <if test="statusList != null and statusList.size() > 0">
                AND status IN
                <foreach collection="statusList" item="status" 
                         open="(" separator="," close=")">
                    #{status}
                </foreach>
            </if>
        </where>
        ORDER BY entry_date DESC
    </select>
    
    <!-- 分页查询 -->
    <select id="findPage" resultMap="EmployeeResultMap">
        SELECT * FROM employee
        <where>
            is_deleted = 0
            <if test="condition.name != null">
                AND name LIKE CONCAT('%', #{condition.name}, '%')
            </if>
        </where>
        ORDER BY id DESC
        LIMIT #{offset}, #{pageSize}
    </select>
    
    <!-- 插入 -->
    <insert id="insert" parameterType="Employee" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO employee (
            employee_no, name, gender, age, 
            department_id, position, salary, entry_date
        ) VALUES (
            #{employeeNo}, #{name}, #{gender}, #{age},
            #{departmentId}, #{position}, #{salary}, #{entryDate}
        )
    </insert>
    
    <!-- 批量插入 -->
    <insert id="batchInsert">
        INSERT INTO employee (
            employee_no, name, gender, department_id
        ) VALUES
        <foreach collection="list" item="emp" separator=",">
            (#{emp.employeeNo}, #{emp.name}, #{emp.gender}, #{emp.departmentId})
        </foreach>
    </insert>
    
    <!-- 更新 -->
    <update id="update">
        UPDATE employee
        <set>
            <if test="name != null">name = #{name},</if>
            <if test="age != null">age = #{age},</if>
            <if test="salary != null">salary = #{salary},</if>
            update_time = NOW()
        </set>
        WHERE id = #{id}
    </update>
</mapper>
```



java

```java
// Mapper接口
@Mapper
public interface EmployeeMapper {
    Employee findById(Long id);
    
    List<Employee> findByCondition(@Param("name") String name,
                                  @Param("departmentId") Long departmentId,
                                  @Param("minSalary") BigDecimal minSalary,
                                  @Param("maxSalary") BigDecimal maxSalary,
                                  @Param("statusList") List<Integer> statusList);
    
    List<Employee> findPage(@Param("condition") EmployeeCondition condition,
                           @Param("offset") int offset,
                           @Param("pageSize") int pageSize);
    
    int insert(Employee employee);
    
    int batchInsert(@Param("list") List<Employee> employees);
    
    int update(Employee employee);
}
```



## 六、项目部署：从"本地跑通"到"线上运行"

![image-20260202132304917](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202132304917.png)

### 6.1 我的第一个部署

1. 本地打包：`mvn clean package`
2. 把jar包上传到服务器
3. 运行：`java -jar myapp.jar`
4. 第二天发现服务挂了（进程被终止）

**问题**：没有使用进程管理工具。

**解决方案**：

bash

```bash
# 使用systemd管理（推荐）
sudo vim /etc/systemd/system/employee.service
```



ini

```ini
[Unit]
Description=Employee Management System
After=network.target

[Service]
Type=simple
User=appuser
Group=appgroup

# 工作目录
WorkingDirectory=/opt/employee

# 启动命令
ExecStart=/usr/bin/java -jar employee-app.jar
ExecStop=/bin/kill -15 $MAINPID

# 环境变量
Environment="JAVA_OPTS=-Xms512m -Xmx1024m -Dspring.profiles.active=prod"
Environment="TZ=Asia/Shanghai"

# 重启策略
Restart=always
RestartSec=10

# 日志
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```



### 6.2 数据库连接池配置

yaml

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/employee_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
    # HikariCP连接池配置
    hikari:
      pool-name: EmployeeHikariCP
      minimum-idle: 5           # 最小空闲连接
      maximum-pool-size: 20     # 最大连接数
      idle-timeout: 600000      # 空闲连接超时时间(ms)
      connection-timeout: 30000 # 连接超时时间(ms)
      max-lifetime: 1800000     # 连接最大生命周期(ms)
      connection-test-query: SELECT 1
      auto-commit: false        # 手动提交事务
      
  jpa:
    hibernate:
      ddl-auto: validate        # 生产环境用validate，不用update
    show-sql: false             # 生产环境关闭SQL日志
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: false
```



## 七、经验总结：Web后端开发的成长之路

### 7.1 我学到的教训

1. **版本一致性是关键**：依赖版本不统一是万恶之源
2. **SQL注入不是危言耸听**：一定要使用预编译语句
3. **事务不是自动的**：需要显式声明事务边界
4. **索引不是越多越好**：需要根据查询模式设计
5. **日志是你的眼睛**：没有日志等于盲人摸象

### 7.2 我的开发清单

现在，每次开始新项目，我都会检查：

- Maven依赖版本是否统一
- 数据库字符集是否为utf8mb4
- 是否配置了数据库连接池
- 是否启用了事务管理
- 是否添加了必要的索引
- 是否配置了统一的异常处理
- 是否添加了接口日志
- 是否配置了监控端点

### 7.3 推荐的学习路线

1. **基础阶段**：
   - Spring Boot快速入门
   - 简单的CRUD项目
   - 理解HTTP协议
2. **进阶阶段**：
   - 数据库优化（索引、SQL调优）
   - 事务管理
   - 缓存使用（Redis）
   - 消息队列（RabbitMQ）
3. **高级阶段**：
   - 微服务架构
   - 分布式事务
   - 性能调优
   - 安全防护

## 结语：从写代码到做工程

从第一个"Hello World"到能处理高并发的生产系统，我最大的感悟是：

**编程不仅是写代码，更是解决问题的系统化思维。**

每一个技术选择，每一个架构决策，背后都是对业务需求、性能要求、维护成本、团队能力的综合考量。

那个曾经把生产数据库锁死的菜鸟，现在能设计支撑百万用户的系统。不是因为天赋，而是因为踩过足够多的坑，并且从每个坑里都学到了东西。

记住：**优秀的后端工程师不是不犯错，而是能从错误中快速恢复，并且确保同样的错误不再发生。**