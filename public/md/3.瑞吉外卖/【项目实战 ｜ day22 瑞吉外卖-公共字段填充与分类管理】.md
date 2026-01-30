# 🚀 项目实战 Day22 - 瑞吉外卖：公共字段填充与分类管理

> 💡 **进阶必备！** 本文聚焦MyBatis-Plus公共字段自动填充、ThreadLocal线程隔离、分类管理CRUD、关联校验与异常处理，帮你深入理解框架底层原理，提升代码质量和开发效率。

---

## 🎯 快速回顾

- **🎯 MyBatis-Plus公共字段自动填充**：MetaObjectHandler、FieldFill注解、插入/更新填充
- **🔄 ThreadLocal**：线程隔离机制、用户ID传递、内存泄漏风险
- **📦 分类管理**：CRUD操作、分页查询、关联校验、异常处理
- **🔧 自定义异常**：CustomException、全局异常处理器、SQL异常解析
- **⚠️ 常见问题**：静态方法无法AOP代理、内部方法调用不触发切面、通知顺序混乱

---

## 📑 目录

- [一、公共字段自动填充（核心重点）](#一公共字段自动填充核心重点)
  - [1. 底层原理](#1-底层原理)
  - [2. 完整实现流程（含代码 + 注释）](#2-完整实现流程含代码--注释)
  - [3. 拓展知识点](#3-拓展知识点)
- [二、分类管理 CRUD（结合业务规则）](#二分类管理-crud结合业务规则)
  - [1. 数据模型深度解析](#1-数据模型深度解析)
  - [2. 新增分类（完整代码）](#2-新增分类完整代码)
  - [3. 分页查询分类（完整代码 + 拓展）](#3-分页查询分类完整代码--拓展)
  - [4. 删除分类（关联校验 + 异常处理）](#4-删除分类关联校验--异常处理)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、公共字段自动填充（核心重点）

#### 1. 底层原理

MyBatis-Plus 的公共字段自动填充，本质是**通过拦截器机制，在 SQL 执行前对实体类的指定字段进行赋值**，避免重复编码。

- **拦截时机**：SQL 插入（INSERT）、更新（UPDATE）执行前
- **核心接口**：`MetaObjectHandler`（提供`insertFill`和`updateFill`两个抽象方法，需自定义实现）
- **元数据对象（MetaObject）**：MyBatis 提供的用于操作实体类属性的工具类，可通过`setValue`方法给属性赋值

---

#### 2. 完整实现流程（含代码 + 注释）

##### 步骤 1：实体类字段注解配置

```java
package com.itheima.reggie.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String name;
    private String password;
    private String phone;
    private String sex;
    private String idNumber;
    private Integer status;

    // 插入时填充：@TableField(fill = FieldFill.INSERT)
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    // 插入+更新时填充：@TableField(fill = FieldFill.INSERT_UPDATE)
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createUser;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}
```

- **注解说明**：`FieldFill`是枚举类，包含`DEFAULT`（不填充）、`INSERT`（插入填充）、`UPDATE`（更新填充）、`INSERT_UPDATE`（插入 + 更新填充）

##### 步骤 2：自定义元数据处理器（核心）

```java
package com.itheima.reggie.common;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

/**
 * 自定义元数据对象处理器：所有实体的公共字段都会在这里自动填充
 */
@Component // 必须交给Spring管理，否则MyBatis-Plus无法扫描到
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {

    /**
     * 插入操作时的填充逻辑
     * @param metaObject 元数据对象：封装了当前操作的实体类信息
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("公共字段自动填充[INSERT]：{}", metaObject.getOriginalObject().getClass().getName());
        
        // 1. 填充创建时间和更新时间（当前时间）
        this.strictInsertFill(
            metaObject, 
            "createTime", // 实体类的字段名（必须和属性名一致）
            LocalDateTime.class, 
            LocalDateTime.now() // 填充值
        );
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        // 2. 填充创建人和更新人（从ThreadLocal中获取当前登录用户ID）
        this.strictInsertFill(metaObject, "createUser", Long.class, BaseContext.getCurrentId());
        this.strictInsertFill(metaObject, "updateUser", Long.class, BaseContext.getCurrentId());
    }

    /**
     * 更新操作时的填充逻辑
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("公共字段自动填充[UPDATE]：{}", metaObject.getOriginalObject().getClass().getName());
        
        // 1. 填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        // 2. 填充更新人
        this.strictUpdateFill(metaObject, "updateUser", Long.class, BaseContext.getCurrentId());
    }
}
```

- **关键方法**：`strictInsertFill`/`strictUpdateFill`是 MyBatis-Plus 提供的严格填充方法，字段不存在时会抛出异常（推荐使用，避免字段名写错）；`setValue`方法不校验字段是否存在，出错难排查。

##### 步骤 3：ThreadLocal 工具类（解决用户 ID 传递问题）

```java
package com.itheima.reggie.common;

/**
 * 基于ThreadLocal封装的工具类：存储当前线程的登录用户ID
 * ThreadLocal特性：线程隔离，每个线程有独立的存储副本，线程间互不干扰
 */
public class BaseContext {
    // 泛型指定存储的数据类型：Long（用户ID类型）
    private static final ThreadLocal<Long> THREAD_LOCAL = new ThreadLocal<>();

    /**
     * 存储用户ID到当前线程
     */
    public static void setCurrentId(Long id) {
        THREAD_LOCAL.set(id);
    }

    /**
     * 从当前线程获取用户ID
     */
    public static Long getCurrentId() {
        return THREAD_LOCAL.get();
    }

    /**
     * 移除当前线程的用户ID（避免内存泄漏）
     * 注意：在请求结束后调用（如拦截器的finally块）
     */
    public static void removeCurrentId() {
        THREAD_LOCAL.remove();
    }
}
```

##### 步骤 4：在拦截器中存储用户 ID 到 ThreadLocal

```java
package com.itheima.reggie.filter;

import com.alibaba.fastjson.JSON;
import com.itheima.reggie.common.BaseContext;
import com.itheima.reggie.common.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.AntPathMatcher;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter(filterName = "loginCheckFilter", urlPatterns = "/*")
@Slf4j
public class LoginCheckFilter implements Filter {
    // 路径匹配器：支持通配符（如/**）
    public static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 1. 获取请求路径
        String requestURI = request.getRequestURI();

        // 2. 定义不需要拦截的路径（登录、注册、静态资源等）
        String[] urls = new String[]{
            "/employee/login",
            "/employee/logout",
            "/backend/**",
            "/front/**"
        };

        // 3. 判断是否需要拦截
        boolean check = check(urls, requestURI);

        // 4. 不需要拦截：直接放行
        if (check) {
            filterChain.doFilter(request, response);
            return;
        }

        // 5. 需要拦截：判断用户是否登录（Session中是否有employee）
        if (request.getSession().getAttribute("employee") != null) {
            // 存储当前登录用户ID到ThreadLocal
            Long empId = (Long) request.getSession().getAttribute("employee");
            BaseContext.setCurrentId(empId);
            
            filterChain.doFilter(request, response);
            return;
        }

        // 6. 未登录：返回JSON提示
        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
    }

    /**
     * 路径匹配：判断请求路径是否在不需要拦截的列表中
     */
    public boolean check(String[] urls, String requestURI) {
        for (String url : urls) {
            boolean match = PATH_MATCHER.match(url, requestURI);
            if (match) {
                return true;
            }
        }
        return false;
    }
}
```

- **关键时机**：用户登录后，每次请求都会经过拦截器，此时将用户 ID 存入 ThreadLocal，后续元数据处理器就能从当前线程中获取。

---

#### 3. 拓展知识点

##### （1）ThreadLocal 的内存泄漏风险

- **原因**：ThreadLocal 的`Entry`是弱引用（Key 为弱引用），但 ThreadLocalMap 的生命周期和 Thread 一致。如果线程池复用线程（如 Tomcat 默认线程池），Thread 不会销毁，ThreadLocalMap 中的 Entry 会一直存在，导致内存泄漏。

- **解决方案**：在请求结束后调用`ThreadLocal.remove()`，移除当前线程的存储值。
  - **优化**：在拦截器的`finally`块中添加`BaseContext.removeCurrentId();`，确保无论请求是否成功，都能清理数据。

##### （2）公共字段自动填充的其他场景

- **填充固定值**：如`isDeleted`（逻辑删除字段）默认填充 0。
- **填充 UUID**：如`orderNo`（订单号），可通过`UUID.randomUUID().toString()`生成。
- **填充当前 IP**：通过`request.getRemoteAddr()`获取客户端 IP（需结合 HttpServletRequest，可通过 RequestContextHolder 获取）。

##### （3）自定义填充策略

如果需要更灵活的填充逻辑（如不同实体的填充规则不同），可通过`metaObject.getOriginalObject().getClass()`判断实体类型，再执行不同逻辑：

```java
// 示例：不同实体的createUser填充规则不同
if (metaObject.getOriginalObject() instanceof Employee) {
    // 员工表填充员工ID
    this.strictInsertFill(metaObject, "createUser", Long.class, BaseContext.getCurrentId());
} else if (metaObject.getOriginalObject() instanceof Category) {
    // 分类表填充管理员ID（假设管理员ID固定为1）
    this.strictInsertFill(metaObject, "createUser", Long.class, 1L);
}
```

---

### 二、分类管理 CRUD（结合业务规则）

#### 1. 数据模型深度解析

**category 表结构（核心字段）**：

| 字段名     | 类型        | 说明                                   | 约束                  |
| ---------- | ----------- | -------------------------------------- | --------------------- |
| id         | bigint      | 主键 ID（自增）                        | PRIMARY KEY           |
| type       | int         | 分类类型（1 = 菜品分类，2 = 套餐分类） | NOT NULL              |
| name       | varchar(64) | 分类名称                               | NOT NULL + UNIQUE KEY |
| sort       | int         | 排序字段（移动端展示顺序）             | NOT NULL DEFAULT 0    |
| createTime | datetime    | 创建时间                               | NOT NULL              |
| updateTime | datetime    | 更新时间                               | NOT NULL              |
| createUser | bigint      | 创建人 ID                              | NOT NULL              |
| updateUser | bigint      | 更新人 ID                              | NOT NULL              |

- **关键约束**：`name`字段唯一，避免重复分类；`sort`字段非负，默认值 0，数值越小越靠前。

---

#### 2. 新增分类（完整代码）

##### 步骤 1：实体类（Category）

```java
package com.itheima.reggie.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class Category implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Integer type; // 1=菜品分类，2=套餐分类
    private String name;  // 分类名称（唯一）
    private Integer sort; // 排序

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

##### 步骤 2：Mapper 接口（CategoryMapper）

```java
package com.itheima.reggie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itheima.reggie.entity.Category;
import org.apache.ibatis.annotations.Mapper;

/**
 * MyBatis-Plus的BaseMapper已提供CRUD基础方法：save、remove、update、getById、list等
 */
@Mapper // 标识为MyBatis映射接口，SpringBoot自动扫描
public interface CategoryMapper extends BaseMapper<Category> {
}
```

##### 步骤 3：Service 接口及实现类

```java
// CategoryService.java
package com.itheima.reggie.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.itheima.reggie.entity.Category;

public interface CategoryService extends IService<Category> {
    // 后续删除分类的自定义方法会在这里扩展
    void remove(Long id);
}

// CategoryServiceImpl.java
package com.itheima.reggie.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itheima.reggie.entity.Category;
import com.itheima.reggie.mapper.CategoryMapper;
import com.itheima.reggie.service.CategoryService;
import org.springframework.stereotype.Service;

/**
 * ServiceImpl<M, T>：MyBatis-Plus提供的Service实现类，封装了BaseMapper的方法
 * M：Mapper接口类型，T：实体类类型
 */
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {
    // 新增分类无需自定义实现，直接使用父类的save方法
}
```

##### 步骤 4：Controller（CategoryController）

```java
package com.itheima.reggie.controller;

import com.itheima.reggie.common.R;
import com.itheima.reggie.entity.Category;
import com.itheima.reggie.service.CategoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 分类管理Controller
 * 路径：/category，统一前缀
 */
@RestController
@RequestMapping("/category")
@Slf4j
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * 新增分类
     * 请求方式：POST
     * 请求参数：JSON格式（name、type、sort）
     * 响应：R<String>（成功提示）
     */
    @PostMapping
    public R<String> save(@RequestBody Category category) {
        log.info("新增分类：{}", category);
        // 调用Service的save方法，公共字段由自动填充处理
        categoryService.save(category);
        return R.success("新增分类成功");
    }
}
```

---

#### 3. 分页查询分类（完整代码 + 拓展）

##### 核心代码（Controller 新增方法）

```java
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itheima.reggie.entity.Category;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 分页查询分类
 * 请求方式：GET
 * 请求参数：page（页码）、pageSize（每页条数）
 * 响应：R<Page<Category>>（分页结果）
 */
@GetMapping("/page")
public R<Page<Category>> page(
    @RequestParam(defaultValue = "1") int page, // 默认页码1
    @RequestParam(defaultValue = "10") int pageSize // 默认每页10条
) {
    // 1. 创建分页构造器：Page<>(当前页码，每页条数)
    Page<Category> pageInfo = new Page<>(page, pageSize);

    // 2. 创建条件构造器：LambdaQueryWrapper（避免字段名硬编码）
    LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
    
    // 3. 添加排序条件：按sort升序（asc），若sort相同按updateTime降序（desc）
    queryWrapper.orderByAsc(Category::getSort).orderByDesc(Category::getUpdateTime);

    // 4. 执行分页查询：service.page(分页对象，条件构造器)
    categoryService.page(pageInfo, queryWrapper);

    // 5. 返回分页结果
    return R.success(pageInfo);
}
```

##### 拓展：条件构造器的高级用法

1. **多条件组合查询（如按类型查询分类）**：

```java
// 示例：查询type=1（菜品分类）的分页数据
queryWrapper.eq(Category::getType, 1) // 等于
           .like(Category::getName, "川") // 模糊查询（名称包含"川"）
           .ge(Category::getSort, 10); // 大于等于
```

2. **动态条件（前端传递类型参数时才添加条件）**：

```java
Integer type = request.getParameter("type"); // 前端可选参数
if (type != null) {
    queryWrapper.eq(Category::getType, type);
}
```

3. **避免 null 值异常**：

```java
// 若name可能为null，使用eqIfPresent（值不为null时才添加条件）
queryWrapper.eqIfPresent(Category::getName, category.getName());
```

---

#### 4. 删除分类（关联校验 + 异常处理）

##### 核心业务规则

- 不能删除已关联菜品（dish 表）的分类
- 不能删除已关联套餐（setmeal 表）的分类
- 关联数据存在时，抛出业务异常，提示用户

##### 步骤 1：准备关联表的基础代码（Dish、Setmeal）

```java
// Dish实体核心字段（仅展示关联相关）
package com.itheima.reggie.entity;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Dish {
    private Long id;
    private String name;
    private Long categoryId; // 关联分类ID（外键）
    // 其他字段...
}

// Setmeal实体核心字段（仅展示关联相关）
@Data
public class Setmeal {
    private Long id;
    private String name;
    private Long categoryId; // 关联分类ID（外键）
    // 其他字段...
}

// DishMapper.java
package com.itheima.reggie.mapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itheima.reggie.entity.Dish;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DishMapper extends BaseMapper<Dish> {
}

// SetmealMapper.java（同DishMapper）
```

##### 步骤 2：自定义业务异常类

```java
package com.itheima.reggie.common;

/**
 * 自定义业务异常：用于处理业务规则违规（如关联数据不能删除）
 * 继承RuntimeException：无需强制捕获，灵活抛出
 */
public class CustomException extends RuntimeException {
    // 构造方法：接收异常提示信息
    public CustomException(String message) {
        super(message);
    }
}
```

##### 步骤 3：全局异常处理器（统一捕获异常）

```java
package com.itheima.reggie.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLIntegrityConstraintViolationException;

/**
 * 全局异常处理器：捕获项目中所有未处理的异常
 * @ControllerAdvice(annotations = {RestController.class, Controller.class})：指定拦截RestController和Controller注解的类
 */
@ControllerAdvice(annotations = {RestController.class, Controller.class})
@ResponseBody // 返回JSON格式
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 处理SQL唯一约束异常（如分类名称重复）
     */
    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public R<String> exceptionHandler(SQLIntegrityConstraintViolationException ex) {
        log.error("SQL异常：{}", ex.getMessage());
        // 解析异常信息：Duplicate entry '川菜' for key 'category.name'
        if (ex.getMessage().contains("Duplicate entry")) {
            String[] split = ex.getMessage().split("'");
            String name = split[1];
            return R.error(name + "已存在，不能重复添加");
        }
        return R.error("数据库操作异常");
    }

    /**
     * 处理自定义业务异常（如分类关联数据不能删除）
     */
    @ExceptionHandler(CustomException.class)
    public R<String> exceptionHandler(CustomException ex) {
        log.error("业务异常：{}", ex.getMessage());
        return R.error(ex.getMessage());
    }

    /**
     * 处理所有未捕获的异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public R<String> exceptionHandler(Exception ex) {
        log.error("系统异常：{}", ex.getMessage());
        return R.error("系统异常，请联系管理员");
    }
}
```

##### 步骤 4：Service 层实现删除逻辑

```java
@Override
public void remove(Long id) {
    // 1. 校验分类是否关联菜品
    LambdaQueryWrapper<Dish> dishWrapper = new LambdaQueryWrapper<>();
    dishWrapper.eq(Dish::getCategoryId, id);
    int dishCount = dishService.count(dishWrapper);
    if (dishCount > 0) {
        throw new CustomException("当前分类下关联了菜品，不能删除");
    }

    // 2. 校验分类是否关联套餐
    LambdaQueryWrapper<Setmeal> setmealWrapper = new LambdaQueryWrapper<>();
    setmealWrapper.eq(Setmeal::getCategoryId, id);
    int setmealCount = setmealService.count(setmealWrapper);
    if (setmealCount > 0) {
        throw new CustomException("当前分类下关联了套餐，不能删除");
    }

    // 3. 删除分类
    this.removeById(id);
}
```

##### 步骤 5：Controller 层调用

```java
@DeleteMapping
public R<String> delete(Long id) {
    log.info("删除分类：{}", id);
    categoryService.remove(id);
    return R.success("分类删除成功");
}
```

---

## ❓ 问答

### Q1：MyBatis-Plus 公共字段自动填充的底层原理是什么？如何实现？

**答**：
- **底层原理**：通过拦截器机制，在 SQL 执行前对实体类的指定字段进行赋值
- **实现步骤**：
  1. 实体类字段添加`@TableField(fill = FieldFill.INSERT)`等注解
  2. 自定义`MetaObjectHandler`实现类，重写`insertFill`和`updateFill`方法
  3. 在拦截器中将用户 ID 存入 ThreadLocal
  4. 填充处理器从 ThreadLocal 获取用户 ID，填充到实体类字段
- **解析**：理解公共字段自动填充的原理和实现，是掌握 MyBatis-Plus 高级用法的基础。

---

### Q2：ThreadLocal 的线程隔离机制是什么？如何避免内存泄漏？

**答**：
- **线程隔离机制**：ThreadLocal 内部维护一个 Map，key 是当前线程，value 是存储的用户 ID，每个线程有独立的存储副本，线程间互不干扰
- **避免内存泄漏**：
  1. 在请求结束后调用`ThreadLocal.remove()`，移除当前线程的存储值
  2. 在拦截器的`finally`块中添加清理逻辑，确保无论请求是否成功，都能清理数据
- **解析**：理解 ThreadLocal 的线程隔离机制和内存泄漏风险，是掌握并发编程的基础。

---

### Q3：分类管理的核心业务规则是什么？如何实现关联校验？

**答**：
- **核心业务规则**：
  1. 不能删除已关联菜品（dish 表）的分类
  2. 不能删除已关联套餐（setmeal 表）的分类
  3. 关联数据存在时，抛出业务异常，提示用户
- **实现关联校验**：
  1. 查询 dish 表中是否存在`categoryId = id`的记录
  2. 查询 setmeal 表中是否存在`categoryId = id`的记录
  3. 如果存在，抛出`CustomException`异常
  4. 全局异常处理器捕获异常，返回友好提示
- **解析**：理解分类管理的业务规则和关联校验，是掌握业务逻辑实现的关键。

---

### Q4：全局异常处理器的作用是什么？如何处理自定义业务异常？

**答**：
- **全局异常处理器作用**：全局拦截 Controller 层异常，统一返回错误信息，提升用户体验
- **处理自定义业务异常**：
  1. 通过`@ExceptionHandler(CustomException.class)`拦截自定义异常
  2. 记录异常日志（`log.error("业务异常：{}", ex.getMessage())`）
  3. 返回友好提示（`R.error(ex.getMessage())`）
- **解析**：全局异常处理器是异常处理的核心，理解其作用和处理方法，能有效提升用户体验。

---

### Q5：LambdaQueryWrapper 的优势是什么？如何实现动态条件查询？

**答**：
- **LambdaQueryWrapper 优势**：
  1. 类型安全：通过方法引用（`Category::getName`）指定字段，避免硬编码字段名（如`"name"`），减少拼写错误
  2. 编译期检查：字段不存在时编译报错，避免运行时异常
  3. 代码可读性高：方法引用比字符串更易读
- **实现动态条件查询**：
  1. 前端传递可选参数（如`type`）
  2. 使用`eqIfPresent`方法，值不为 null 时才添加条件
  3. 避免生成`like '%%'`查询所有数据
- **解析**：理解 LambdaQueryWrapper 的优势和动态条件查询，是掌握 MyBatis-Plus 高级用法的关键。

---

> **📚 学习建议**：本节内容是 MyBatis-Plus 和业务逻辑的进阶知识，重点掌握公共字段自动填充、ThreadLocal 线程隔离、分类管理 CRUD、关联校验与异常处理，这些是深入理解框架底层原理、提升代码质量和开发效率的关键。
