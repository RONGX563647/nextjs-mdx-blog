# 🚀 JavaWeb Day18 - Web后端实战

> 💡 **实战是最好的老师！** 本文通过Tlias员工管理系统案例，带你完整实践Web后端开发全流程——分层架构、CRUD操作、分页查询、事务控制，帮你将理论知识转化为实战能力。

---

## 🎯 快速回顾

- **🏗️ 分层架构**：Controller（表现层）→ Service（业务层）→ Mapper（持久层）→ Database
- **📦 核心功能**：员工CRUD、分页查询、条件筛选、批量删除
- **🔧 技术栈**：SpringBoot 2.7.x、Mybatis、MySQL 8.0、Lombok
- **📄 统一响应**：Result类封装（code、msg、data）
- **🔄 事务控制**：@Transactional注解实现事务管理
- **⚙️ 配置要点**：application.properties、Mybatis XML映射

---

## 📑 目录

- [一、案例概述：Tlias是什么？](#一案例概述tlias是什么)
  - [1. 核心定位](#1-核心定位)
  - [2. 核心功能](#2-核心功能)
  - [3. 技术栈](#3-技术栈)
- [二、架构设计：Web开发的分层思想](#二架构设计web开发的分层思想)
  - [1. 分层架构核心原则](#1-分层架构核心原则)
  - [2. 核心依赖流程](#2-核心依赖流程)
  - [3. Tlias项目结构](#3-tlias项目结构)
- [三、环境搭建：Tlias项目初始化](#三环境搭建tlias项目初始化)
  - [1. 创建SpringBoot项目](#1-创建springboot项目)
  - [2. 配置文件](#2-配置文件)
  - [3. 数据库设计](#3-数据库设计)
  - [4. 核心工具类封装](#4-核心工具类封装)
- [四、核心功能实现：Tlias分层开发实战](#四核心功能实现tlias分层开发实战)
  - [1. 实体层与DTO层封装](#1-实体层与dto层封装)
  - [2. 持久层（Mapper）](#2-持久层mapper)
  - [3. 业务层（Service）](#3-业务层service)
  - [4. 表现层（Controller）](#4-表现层controller)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、案例概述：Tlias是什么？

#### 1. 核心定位

Tlias（Talent Information Management System）是一款**员工信息管理系统**，是 Web 开发的经典入门 + 进阶案例。它覆盖了后端开发的核心场景：数据 CRUD、分页查询、条件筛选、文件上传、前后端对接、异常处理、事务控制等，技术栈贴合企业实际（SpringBoot+Mybatis+MySQL+Vue），能直观落地 Java Web 核心知识。

---

#### 2. 核心功能

- **员工管理**：新增、查询（单条 / 列表 / 分页 / 条件）、更新（全量 / 部分）、删除（单条 / 批量）。
- **部门管理**：基础 CRUD（关联员工表）。
- **通用功能**：数据校验、异常统一处理、跨域配置、事务控制、文件上传（员工头像）。

---

#### 3. 技术栈

| 类型 | 技术栈 |
| ---- | ------ |
| **后端** | SpringBoot 2.7.x、SpringMVC、Mybatis、MySQL 8.0、Maven、HikariCP（连接池） |
| **前端** | Vue 2.x、Axios、ElementUI（UI 组件库） |
| **开发工具** | IDEA、Postman（接口测试）、Navicat（数据库管理） |

---

### 二、架构设计：Web开发的分层思想

#### 1. 分层架构核心原则

Web 开发遵循 "**职责单一、解耦复用**"，Tlias 严格采用经典分层架构，每层各司其职，通过依赖注入关联：

| 层级 | 核心职责 | 技术实现 | Tlias 案例落地 |
| ---- | -------- | -------- | -------------- |
| **表现层（Controller）** | 接收前端请求、参数校验、返回响应 | @RestController、@RequestMapping、@RequestParam/@RequestBody | EmployeeController、DeptController（处理 HTTP 请求） |
| **业务层（Service）** | 实现核心业务逻辑、事务控制 | @Service、@Transactional、接口 + 实现类 | EmployeeService（员工 CRUD 业务、分页逻辑） |
| **持久层（Mapper）** | 操作数据库、数据映射 | @Mapper、Mybatis XML / 注解 | EmployeeMapper（SQL 执行、结果映射） |
| **实体层（Entity）** | 封装数据（数据库表→Java 对象） | 实体类、Lombok（简化 get/set） | Employee（对应 emp 表）、Dept（对应 dept 表） |
| **DTO 层** | 前后端数据传输（隐藏敏感字段、适配前端参数） | 自定义 DTO 类 | EmployeeDTO（新增员工时接收前端参数，不含 id/createTime） |
| **工具层（Util）** | 通用工具类（日期、加密、结果封装） | 静态方法、工具类注解 | Result（统一响应格式）、DateUtil（日期转换） |

---

#### 2. 核心依赖流程

```
┌─────────────────────────────────────────────────┐
│         请求处理流程              │
├─────────────────────────────────────────────────┤
│  前端请求                                        │
│     ↓                                            │
│  Controller（接收参数）                          │
│     ↓                                            │
│  Service（业务处理）                             │
│     ↓                                            │
│  Mapper（数据库操作）                            │
│     ↓                                            │
│  Database                                        │
│     ↓                                            │
│  反向返回响应（Result封装）                      │
└─────────────────────────────────────────────────┘
```

---

#### 3. Tlias 项目结构（标准 Web 项目骨架）

```
tlias/
├── src/main/java/com/itheima/tlias/
│   ├── TliasApplication.java（启动类）
│   ├── controller/（表现层）
│   │   ├── EmployeeController.java
│   │   └── DeptController.java
│   ├── service/（业务层）
│   │   ├── EmployeeService.java（接口）
│   │   └── impl/EmployeeServiceImpl.java（实现类）
│   ├── mapper/（持久层）
│   │   ├── EmployeeMapper.java
│   │   └── EmployeeMapper.xml
│   ├── entity/（实体层）
│   │   ├── Employee.java
│   │   └── Dept.java
│   ├── dto/（数据传输层）
│   │   ├── EmployeeDTO.java（新增）
│   │   └── EmployeeUpdateDTO.java（更新）
│   ├── exception/（异常处理）
│   │   ├── GlobalExceptionHandler.java（全局异常处理器）
│   │   └── BusinessException.java（自定义异常）
│   └── util/（工具层）
│       └── Result.java（统一响应类）
└── src/main/resources/
    ├── application.properties（配置文件）
    └── mapper/（Mybatis XML映射文件）
        └── EmployeeMapper.xml
```

---

### 三、环境搭建：Tlias项目初始化

#### 1. 创建 SpringBoot 项目

- **方式 1**：IDEA 直接创建（Spring Initializr），选择依赖：Spring Web、Mybatis Framework、MySQL Driver、Lombok。
- **方式 2**：Spring 官网（https://start.spring.io/）生成压缩包，导入 IDEA。

---

#### 2. 配置文件（application.properties）

核心配置：数据库连接、Mybatis、服务器端口：

```properties
# 服务器端口
server.port=8080

# 数据库连接配置（HikariCP默认集成）
spring.datasource.url=jdbc:mysql://localhost:3306/tlias?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Mybatis配置
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.itheima.tlias.entity
mybatis.configuration.map-underscore-to-camel-case=true

# 日志配置（打印SQL，方便调试）
logging.level.com.itheima.tlias.mapper=debug
```

---

#### 3. 数据库设计（Tlias 核心表）

##### （1）员工表（emp）

```sql
CREATE TABLE `emp` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '员工ID（主键）',
  `name` varchar(50) NOT NULL COMMENT '姓名',
  `gender` tinyint DEFAULT 1 COMMENT '性别（1=男，2=女）',
  `age` int COMMENT '年龄',
  `dept_id` bigint COMMENT '部门ID（外键，关联dept表id）',
  `entrydate` date COMMENT '入职日期',
  `avatar` varchar(255) COMMENT '头像URL',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_dept_id` (`dept_id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';
```

##### （2）部门表（dept）

```sql
CREATE TABLE `dept` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '部门ID（主键）',
  `name` varchar(50) NOT NULL COMMENT '部门名称',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';
```

---

#### 4. 核心工具类封装

##### （1）统一响应类（Result.java）

解决前后端响应格式不一致问题，Tlias 所有接口统一返回该格式：

```java
import lombok.Data;

@Data
public class Result<T> {
    private Integer code; // 状态码（200成功，400参数错误，500服务器错误）
    private String msg;   // 提示信息
    private T data;       // 响应数据（泛型适配不同类型）

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data);
    }

    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功", null);
    }

    public static <T> Result<T> error(Integer code, String msg) {
        return new Result<>(code, msg, null);
    }
}
```

---

### 四、核心功能实现：Tlias分层开发实战

#### 1. 实体层与 DTO 层封装

##### （1）实体类（Employee.java）

与数据库表字段一一对应，用 Lombok 简化 get/set/ 构造方法：

```java
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Employee {
    private Long id;
    private String name;
    private Integer gender;
    private Integer age;
    private Long deptId;
    private LocalDate entrydate;
    private String avatar;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

##### （2）DTO 类（EmployeeDTO.java）

前端新增员工时，无需传递`id`（自增）、`createTime`（自动填充），用 DTO 接收参数：

```java
import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class EmployeeDTO {
    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotNull(message = "性别不能为空")
    private Integer gender;

    private Integer age;

    @NotNull(message = "部门ID不能为空")
    private Long deptId;

    private LocalDate entrydate;
}
```

---

#### 2. 持久层（Mapper）：数据库操作实现

##### （1）Mapper 接口（EmployeeMapper.java）

```java
import com.itheima.tlias.entity.Employee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface EmployeeMapper {
    int insert(Employee employee);
    Employee selectById(Long id);
    List<Employee> selectByPage(@Param("name") String name, @Param("deptId") Long deptId, @Param("start") Integer start, @Param("size") Integer size);
    Long selectTotal(@Param("name") String name, @Param("deptId") Long deptId);
    int update(Employee employee);
    int batchDelete(@Param("ids") List<Long> ids);
}
```

##### （2）Mapper XML 映射文件（EmployeeMapper.xml）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.tlias.mapper.EmployeeMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO emp (name, gender, age, dept_id, entrydate, avatar, create_time, update_time)
        VALUES (#{name}, #{gender}, #{age}, #{deptId}, #{entrydate}, #{avatar}, NOW(), NOW())
    </insert>

    <select id="selectById" resultType="com.itheima.tlias.entity.Employee">
        SELECT id, name, gender, age, dept_id AS deptId, entrydate, avatar, create_time AS createTime, update_time AS updateTime
        FROM emp WHERE id = #{id}
    </select>

    <select id="selectByPage" resultType="com.itheima.tlias.entity.Employee">
        SELECT id, name, gender, age, dept_id AS deptId, entrydate, avatar, create_time AS createTime, update_time AS updateTime
        FROM emp
        <where>
            <if test="name != null and name != ''">
                AND name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="deptId != null">
                AND dept_id = #{deptId}
            </if>
        </where>
        LIMIT #{start}, #{size}
    </select>

    <select id="selectTotal" resultType="java.lang.Long">
        SELECT COUNT(*) FROM emp
        <where>
            <if test="name != null and name != ''">
                AND name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="deptId != null">
                AND dept_id = #{deptId}
            </if>
        </where>
    </select>

    <update id="update">
        UPDATE emp
        <set>
            <if test="name != null">name = #{name},</if>
            <if test="gender != null">gender = #{gender},</if>
            <if test="age != null">age = #{age},</if>
            <if test="deptId != null">dept_id = #{deptId},</if>
            <if test="entrydate != null">entrydate = #{entrydate},</if>
            <if test="avatar != null">avatar = #{avatar},</if>
            update_time = NOW()
        </set>
        WHERE id = #{id}
    </update>

    <delete id="batchDelete">
        DELETE FROM emp WHERE id IN
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </delete>
</mapper>
```

---

#### 3. 业务层（Service）：核心业务逻辑实现

##### （1）Service 接口（EmployeeService.java）

```java
import com.itheima.tlias.dto.EmployeeDTO;
import com.itheima.tlias.entity.Employee;
import java.util.List;
import java.util.Map;

public interface EmployeeService {
    void addEmployee(EmployeeDTO employeeDTO);
    Employee getEmployeeById(Long id);
    Map<String, Object> getEmployeeByPage(Integer page, Integer size, String name, Long deptId);
    void updateEmployee(Employee employee);
    void batchDeleteEmployee(List<Long> ids);
}
```

##### （2）Service 实现类（EmployeeServiceImpl.java）

```java
import com.itheima.tlias.dto.EmployeeDTO;
import com.itheima.tlias.entity.Employee;
import com.itheima.tlias.mapper.EmployeeMapper;
import com.itheima.tlias.service.EmployeeService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Resource
    private EmployeeMapper employeeMapper;

    @Override
    @Transactional
    public void addEmployee(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        BeanUtils.copyProperties(employeeDTO, employee);
        int rows = employeeMapper.insert(employee);
        if (rows != 1) {
            throw new RuntimeException("新增员工失败");
        }
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeMapper.selectById(id);
    }

    @Override
    public Map<String, Object> getEmployeeByPage(Integer page, Integer size, String name, Long deptId) {
        Integer start = (page - 1) * size;
        List<Employee> employeeList = employeeMapper.selectByPage(name, deptId, start, size);
        Long total = employeeMapper.selectTotal(name, deptId);

        Map<String, Object> pageResult = new HashMap<>();
        pageResult.put("list", employeeList);
        pageResult.put("total", total);
        pageResult.put("totalPage", (total + size - 1) / size);
        pageResult.put("currentPage", page);
        pageResult.put("pageSize", size);

        return pageResult;
    }

    @Override
    @Transactional
    public void updateEmployee(Employee employee) {
        int rows = employeeMapper.update(employee);
        if (rows != 1) {
            throw new RuntimeException("更新员工失败，员工不存在");
        }
    }

    @Override
    @Transactional
    public void batchDeleteEmployee(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("删除ID列表不能为空");
        }
        int rows = employeeMapper.batchDelete(ids);
        if (rows == 0) {
            throw new RuntimeException("批量删除失败，无有效员工ID");
        }
    }
}
```

---

#### 4. 表现层（Controller）：接收请求 + 返回响应

##### （1）EmployeeController.java

```java
import com.itheima.tlias.dto.EmployeeDTO;
import com.itheima.tlias.entity.Employee;
import com.itheima.tlias.service.EmployeeService;
import com.itheima.tlias.util.Result;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
@CrossOrigin
public class EmployeeController {

    @Resource
    private EmployeeService employeeService;

    @PostMapping
    public Result<?> addEmployee(@Validated @RequestBody EmployeeDTO employeeDTO) {
        employeeService.addEmployee(employeeDTO);
        return Result.success("员工新增成功");
    }

    @GetMapping("/{id}")
    public Result<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        return Result.success(employee);
    }

    @GetMapping
    public Result<Map<String, Object>> getEmployeeByPage(
        @RequestParam(defaultValue = "1") Integer page,
        @RequestParam(defaultValue = "10") Integer size,
        String name,
        Long deptId
    ) {
        Map<String, Object> pageResult = employeeService.getEmployeeByPage(page, size, name, deptId);
        return Result.success(pageResult);
    }

    @PutMapping("/{id}")
    public Result<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        employee.setId(id);
        employeeService.updateEmployee(employee);
        return Result.success("员工更新成功");
    }

    @DeleteMapping("/batch")
    public Result<?> batchDeleteEmployee(@RequestBody List<Long> ids) {
        employeeService.batchDeleteEmployee(ids);
        return Result.success("批量删除成功");
    }
}
```

---

## ❓ 问答

### Q1：Web 开发为什么要采用分层架构？各层的职责是什么？

**答**：
- **分层原因**：遵循 "职责单一、解耦复用" 原则，每层各司其职，降低耦合度，提高代码可维护性和复用性
- **各层职责**：
  - **Controller（表现层）**：接收前端请求、参数校验、返回响应
  - **Service（业务层）**：实现核心业务逻辑、事务控制
  - **Mapper（持久层）**：操作数据库、数据映射
  - **Entity（实体层）**：封装数据（数据库表→Java 对象）
  - **DTO 层**：前后端数据传输（隐藏敏感字段、适配前端参数）
- **解析**：分层架构是 Web 开发的标准实践，理解各层职责是开发高质量代码的基础。

---

### Q2：Tlias 项目中，如何实现分页查询？分页参数如何计算？

**答**：
- **分页查询实现**：
  1. Mapper 层：`selectByPage` 方法接收 `start`（起始索引）和 `size`（每页条数）参数
  2. Service 层：计算 `start = (page - 1) * size`，调用 Mapper 查询分页数据和总条数
  3. 封装分页结果：包含 `list`（当前页数据）、`total`（总条数）、`totalPage`（总页数）、`currentPage`（当前页）、`pageSize`（每页条数）
- **分页参数计算**：
  - 起始索引：`start = (page - 1) * size`
  - 总页数：`totalPage = (total + size - 1) / size`
- **解析**：分页查询是 Web 开发的常见需求，掌握分页参数计算和结果封装，能实现高效的分页功能。

---

### Q3：Tlias 项目中，如何实现事务控制？@Transactional 注解的作用是什么？

**答**：
- **事务控制实现**：在 Service 层方法上添加 `@Transactional` 注解
- **@Transactional 注解作用**：
  1. 开启事务：方法执行前自动开启事务
  2. 提交事务：方法正常执行完成后自动提交事务
  3. 回滚事务：方法抛出 RuntimeException 时自动回滚事务
- **使用场景**：新增、更新、删除等需要保证数据一致性的操作
- **解析**：事务控制是保证数据一致性的关键，理解 @Transactional 注解的作用和使用场景，能有效避免数据不一致问题。

---

### Q4：Tlias 项目中，为什么要使用 DTO 类？DTO 和 Entity 有什么区别？

**答**：
- **使用 DTO 原因**：
  1. 隐藏敏感字段：如新增员工时，前端无需传递 `id`（自增）、`createTime`（自动填充）
  2. 适配前端参数：前端参数格式可能与数据库表字段不一致
  3. 数据校验：DTO 类可以添加 `@NotBlank`、`@NotNull` 等校验注解
- **DTO 与 Entity 区别**：
  - **DTO（Data Transfer Object）**：用于前后端数据传输，包含业务逻辑相关的字段
  - **Entity（实体类）**：与数据库表一一对应，包含所有数据库字段
- **解析**：DTO 和 Entity 的分离是 Web 开发的最佳实践，能有效隐藏敏感字段、适配前端参数、提高代码可维护性。

---

### Q5：Tlias 项目中，如何实现批量删除？Mapper XML 中如何使用 foreach 标签？

**答**：
- **批量删除实现**：
  1. Mapper 接口：`int batchDelete(@Param("ids") List<Long> ids);`
  2. Mapper XML：使用 `<foreach>` 标签遍历 ID 列表
  3. Service 层：调用 Mapper 的 `batchDelete` 方法，并添加 `@Transactional` 注解
- **foreach 标签使用**：
  ```xml
  <delete id="batchDelete">
      DELETE FROM emp WHERE id IN
      <foreach collection="ids" item="id" open="(" close=")" separator=",">
          #{id}
      </foreach>
  </delete>
  ```
  - `collection`：集合参数名
  - `item`：遍历的元素变量名
  - `open`：开始字符
  - `close`：结束字符
  - `separator`：分隔符
- **解析**：批量删除是提高操作效率的常见需求，掌握 foreach 标签的使用，能实现高效的批量操作。

---

> **📚 学习建议**：本节内容是 Web 后端开发的实战案例，重点掌握分层架构、CRUD 操作、分页查询、事务控制等核心功能，这些是构建完整 Web 应用的基础。建议动手实践 Tlias 项目，将理论知识转化为实战能力。
