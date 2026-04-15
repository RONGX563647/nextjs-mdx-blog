# 【项目实战1 -瑞吉外卖｜day22 】

# 

## 核心目标

1. 掌握 MyBatis-Plus 公共字段自动填充的底层逻辑与实战
2. 理解 ThreadLocal 的线程隔离机制及在项目中的应用
3. 完成分类管理 CRUD 全流程（含关联校验、异常处理）
4. 拓展 MyBatis-Plus 高级用法、异常处理规范、数据关联设计思路

------

## 一、公共字段自动填充（核心重点）

### 1.1 底层原理

MyBatis-Plus 的公共字段自动填充，本质是**通过拦截器机制，在 SQL 执行前对实体类的指定字段进行赋值**，避免重复编码。

- 拦截时机：SQL 插入（INSERT）、更新（UPDATE）执行前
- 核心接口：`MetaObjectHandler`（提供`insertFill`和`updateFill`两个抽象方法，需自定义实现）
- 元数据对象（MetaObject）：MyBatis 提供的用于操作实体类属性的工具类，可通过`setValue`方法给属性赋值

### 1.2 完整实现流程（含代码 + 注释）

#### 步骤 1：实体类字段注解配置

java

运行

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

- 注解说明：`FieldFill`是枚举类，包含`DEFAULT`（不填充）、`INSERT`（插入填充）、`UPDATE`（更新填充）、`INSERT_UPDATE`（插入 + 更新填充）

#### 步骤 2：自定义元数据处理器（核心）

java

运行

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

- 关键方法：`strictInsertFill`/`strictUpdateFill`是 MyBatis-Plus 提供的严格填充方法，字段不存在时会抛出异常（推荐使用，避免字段名写错）；`setValue`方法不校验字段是否存在，出错难排查。

#### 步骤 3：ThreadLocal 工具类（解决用户 ID 传递问题）

java

运行

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

#### 步骤 4：在拦截器中存储用户 ID 到 ThreadLocal

java

运行

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

- 关键时机：用户登录后，每次请求都会经过拦截器，此时将用户 ID 存入 ThreadLocal，后续元数据处理器就能从当前线程中获取。

### 1.3 拓展知识点

#### 1. ThreadLocal 的内存泄漏风险

- 原因：ThreadLocal 的`Entry`是弱引用（Key 为弱引用），但 ThreadLocalMap 的生命周期和 Thread 一致。如果线程池复用线程（如 Tomcat 默认线程池），Thread 不会销毁，ThreadLocalMap 中的 Entry 会一直存在，导致内存泄漏。

- 解决方案：在请求结束后调用

  ```
  ThreadLocal.remove()
  ```

  ，移除当前线程的存储值。

  - 优化：在拦截器的`finally`块中添加`BaseContext.removeCurrentId();`，确保无论请求是否成功，都能清理数据。

#### 2. 公共字段自动填充的其他场景

- 填充固定值：如`isDeleted`（逻辑删除字段）默认填充 0。
- 填充 UUID：如`orderNo`（订单号），可通过`UUID.randomUUID().toString()`生成。
- 填充当前 IP：通过`request.getRemoteAddr()`获取客户端 IP（需结合 HttpServletRequest，可通过 RequestContextHolder 获取）。

#### 3. 自定义填充策略

如果需要更灵活的填充逻辑（如不同实体的填充规则不同），可通过`metaObject.getOriginalObject().getClass()`判断实体类型，再执行不同逻辑：

java

运行

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

------

## 二、分类管理 CRUD（结合业务规则）

### 2.1 数据模型深度解析

category 表结构（核心字段）：

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

- 关键约束：`name`字段唯一，避免重复分类；`sort`字段非负，默认值 0，数值越小越靠前。

### 2.2 新增分类（完整代码）

#### 步骤 1：实体类（Category）

java

运行

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

#### 步骤 2：Mapper 接口（CategoryMapper）

java



运行









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

#### 步骤 3：Service 接口及实现类

java

运行

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

#### 步骤 4：Controller（CategoryController）

java

运行

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

### 2.3 分页查询分类（完整代码 + 拓展）

#### 核心代码（Controller 新增方法）

java

运行

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

#### 拓展：条件构造器的高级用法

1. 多条件组合查询（如按类型查询分类）：

java

运行

```java
// 示例：查询type=1（菜品分类）的分页数据
queryWrapper.eq(Category::getType, 1) // 等于
           .like(Category::getName, "川") // 模糊查询（名称包含“川”）
           .ge(Category::getSort, 10); // 大于等于
```

1. 动态条件（前端传递类型参数时才添加条件）：

java

运行

```java
Integer type = request.getParameter("type"); // 前端可选参数
if (type != null) {
    queryWrapper.eq(Category::getType, type);
}
```

1. 避免 null 值异常：

java

运行

```java
// 若name可能为null，使用eqIfPresent（值不为null时才添加条件）
queryWrapper.eqIfPresent(Category::getName, category.getName());
```

### 2.4 删除分类（关联校验 + 异常处理）

#### 核心业务规则

- 不能删除已关联菜品（dish 表）的分类
- 不能删除已关联套餐（setmeal 表）的分类
- 关联数据存在时，抛出业务异常，提示用户

#### 步骤 1：准备关联表的基础代码（Dish、Setmeal）

java

运行

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

#### 步骤 2：自定义业务异常类

java

运行

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

#### 步骤 3：全局异常处理器（统一捕获异常）

java

运行

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
     * 处理自定义业务异常（如关联数据不能删除）
     */
    @ExceptionHandler(CustomException.class)
    public R<String> exceptionHandler(CustomException ex) {
        log.error("业务异常：{}", ex.getMessage());
        return R.error(ex.getMessage());
    }

    /**
     * 处理其他未知异常
     */
    @ExceptionHandler(Exception.class)
    public R<String> exceptionHandler(Exception ex) {
        log.error("未知异常：{}", ex.getMessage());
        return R.error("系统错误，请联系管理员");
    }
}
```

#### 步骤 4：实现删除分类的自定义逻辑（ServiceImpl）

java

运行

```java
package com.itheima.reggie.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itheima.reggie.common.CustomException;
import com.itheima.reggie.entity.Category;
import com.itheima.reggie.entity.Dish;
import com.itheima.reggie.entity.Setmeal;
import com.itheima.reggie.mapper.CategoryMapper;
import com.itheima.reggie.service.CategoryService;
import com.itheima.reggie.service.DishService;
import com.itheima.reggie.service.SetmealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Autowired
    private DishService dishService;

    @Autowired
    private SetmealService setmealService;

    /**
     * 自定义删除逻辑：先校验关联数据，再删除
     */
    @Override
    public void remove(Long id) {
        // 1. 校验该分类是否关联菜品
        LambdaQueryWrapper<Dish> dishQueryWrapper = new LambdaQueryWrapper<>();
        dishQueryWrapper.eq(Dish::getCategoryId, id); // 关联分类ID=当前删除ID
        long dishCount = dishService.count(dishQueryWrapper); // 统计数量
        if (dishCount > 0) {
            // 关联菜品：抛出业务异常
            throw new CustomException("当前分类下关联了菜品，不能删除");
        }

        // 2. 校验该分类是否关联套餐
        LambdaQueryWrapper<Setmeal> setmealQueryWrapper = new LambdaQueryWrapper<>();
        setmealQueryWrapper.eq(Setmeal::getCategoryId, id);
        long setmealCount = setmealService.count(setmealQueryWrapper);
        if (setmealCount > 0) {
            throw new CustomException("当前分类下关联了套餐，不能删除");
        }

        // 3. 无关联数据：执行删除（调用父类方法）
        super.removeById(id);
    }
}
```

#### 步骤 5：Controller 删除方法

java

运行

```java
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 删除分类
 * 请求方式：DELETE
 * 请求参数：id（分类ID，拼接在URL中）
 * 响应：R<String>（成功提示）
 */
@DeleteMapping
public R<String> delete(@RequestParam Long id) {
    log.info("删除分类，ID：{}", id);
    // 调用自定义的remove方法（带关联校验）
    categoryService.remove(id);
    return R.success("分类删除成功");
}
```

### 2.5 修改分类（完整代码）

#### Controller 新增方法

java

运行

```java
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * 修改分类
 * 请求方式：PUT
 * 请求参数：JSON格式（id、name、sort、type）
 * 响应：R<String>（成功提示）
 */
@PutMapping
public R<String> update(@RequestBody Category category) {
    log.info("修改分类：{}", category);
    // 调用Service的updateById方法，公共字段（updateTime、updateUser）自动填充
    categoryService.updateById(category);
    return R.success("分类修改成功");
}
```

#### 关键要点

- 前端回显：前端从分页列表中获取分类的完整数据（含 id），修改后提交整个实体，后端直接用`updateById`更新。

- 乐观锁：如果需要防止并发修改冲突，可在实体类添加

  ```
  @Version
  ```

  注解（需配合 MyBatis-Plus 的乐观锁插件）：

  java

  运行

  ```java
  @Version // 乐观锁版本号字段
  private Integer version;
  ```

  

------

## 三、核心拓展与避坑指南

### 3.1 MyBatis-Plus 插件拓展

#### 1. 分页插件（必须配置，否则分页查询无效）

java

运行

```java
package com.itheima.reggie.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus配置类
 */
@Configuration
public class MybatisPlusConfig {

    /**
     * 分页插件：添加到MyBatis-Plus拦截器链
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}
```

#### 2. 乐观锁插件（解决并发修改冲突）

java

运行

```java
// 在MybatisPlusConfig中添加乐观锁插件
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    // 分页插件
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
    // 乐观锁插件
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return interceptor;
}
```

- 实体类需添加

  ```
  @Version
  ```

  注解：

  java

  运行

  ```java
  @Version
  private Integer version; // 版本号字段，初始值0
  ```

### 3.2 避坑指南

1. 公共字段自动填充失败：
   - 实体类字段名与`setValue`的参数名不一致（如实体类是`createTime`，代码写`create tiem`）。
   - 元数据处理器未加`@Component`注解，未被 Spring 管理。
   - 填充策略注解错误（如`updateTime`用了`FieldFill.INSERT`）。
2. ThreadLocal 获取不到用户 ID：
   - 拦截器中未存储用户 ID（如登录判断逻辑有误）。
   - 线程池复用导致 ThreadLocal 数据污染（未调用`remove`方法）。
3. 分页查询返回空数据：
   - 未配置分页插件（MybatisPlusConfig）。
   - 页码参数错误（如前端传递的 page 是 0，MyBatis-Plus 页码从 1 开始）。
4. 删除分类时关联查询效率低：
   - 问题：`count`方法会执行`SELECT COUNT(*) FROM dish WHERE category_id = ?`，数据量大时效率低。
   - 优化：给`dish.category_id`和`setmeal.category_id`添加索引（ALTER TABLE dish ADD INDEX idx_category_id (category_id);）。

### 3.3 项目架构优化

#### 1. 统一返回结果类（R.java）完整实现

java

运行

```java
package com.itheima.reggie.common;

import lombok.Data;
import java.util.HashMap;
import java.util.Map;

/**
 * 统一返回结果类：所有接口响应都用此类封装
 * @param <T> 响应数据类型
 */
@Data
public class R<T> {
    // 响应码：1=成功，0=失败
    private Integer code;
    // 响应信息
    private String msg;
    // 响应数据
    private T data;
    // 额外参数（可选）
    private Map<String, Object> extra = new HashMap<>();

    /**
     * 成功响应（无数据）
     */
    public static <T> R<T> success() {
        R<T> r = new R<>();
        r.setCode(1);
        r.setMsg("操作成功");
        return r;
    }

    /**
     * 成功响应（带数据）
     */
    public static <T> R<T> success(T data) {
        R<T> r = new R<>();
        r.setCode(1);
        r.setMsg("操作成功");
        r.setData(data);
        return r;
    }

    /**
     * 成功响应（带数据+自定义消息）
     */
    public static <T> R<T> success(String msg, T data) {
        R<T> r = new R<>();
        r.setCode(1);
        r.setMsg(msg);
        r.setData(data);
        return r;
    }

    /**
     * 失败响应（自定义消息）
     */
    public static <T> R<T> error(String msg) {
        R<T> r = new R<>();
        r.setCode(0);
        r.setMsg(msg);
        return r;
    }

    /**
     * 添加额外参数（如分页总条数）
     */
    public R<T> addExtra(String key, Object value) {
        this.extra.put(key, value);
        return this;
    }
}
```

#### 2. 分层架构职责明确

- Controller：接收请求、参数校验、返回响应，不处理业务逻辑。
- Service：处理业务逻辑、关联校验、事务管理。
- Mapper：仅负责数据库操作，不包含业务逻辑。
- Common：存放公共工具类、异常类、统一返回类等。

------

## 四、完整笔记总结

Day03 的核心是 “**公共字段自动填充**” 和 “**分类管理 CRUD**”，关键技术点包括：

1. MyBatis-Plus 的`MetaObjectHandler`实现公共字段自动填充，减少重复编码。
2. ThreadLocal 实现线程隔离的用户 ID 传递，解决跨组件数据共享问题。
3. 分类管理的关联校验（菜品 / 套餐关联）和自定义异常处理，保证数据完整性。
4. MyBatis-Plus 的分页、条件构造器、Service 封装等高级用法，简化开发。

避坑核心：

- 公共字段填充需注意字段名一致、注解正确、元数据处理器被 Spring 管理。
- ThreadLocal 需在请求结束后清理，避免内存泄漏。
- 关联查询需添加索引，提升效率。
- 全局异常处理器需覆盖常见异常（SQL 异常、业务异常、未知异常）。

要不要我帮你整理一份**可直接运行的完整代码压缩包**，包含所有实体类、Mapper、Service、Controller、配置类，方便你直接导入项目测试？



# 瑞吉外卖 - Day04 深度笔记（原理 + 代码 + 拓展）

## 核心目标

1. 掌握 SpringBoot 文件上传下载的底层机制与实战技巧
2. 理解多表关联操作（菜品 + 口味）的事务控制与 DTO 数据传输
3. 精通分页查询中的数据转换与关联字段补充
4. 掌握菜品修改的 “先删后加” 策略与数据回显逻辑
5. 拓展文件存储、事务管理、分页优化等高级用法

------

## 一、文件上传下载（基础核心）

### 1.1 底层原理

#### 1.1.1 文件上传核心机制

- **前端要求**：form 表单需满足`method="post"`、`enctype="multipart/form-data"`、`input type="file"`，否则无法传输文件二进制数据。
- **后端核心**：SpringBoot 通过`MultipartFile`接口封装上传文件，底层依赖 Apache Commons FileUpload 组件解析请求体。
- **临时文件机制**：上传的文件先存储在服务器临时目录（如`/tmp/tomcat`），请求结束后自动删除，因此必须通过`transferTo`方法转存到指定路径。

#### 1.1.2 文件下载核心机制

- 本质是**服务端将文件以字节流写入 HTTP 响应**，浏览器根据响应头`Content-Type`决定是预览（如图片）还是下载（如附件）。
- 关键响应头：
  - `Content-Type: image/jpeg`：告知浏览器以图片形式预览。
  - `Content-Disposition: attachment; filename=xxx.jpg`：告知浏览器以附件形式下载（可自定义文件名）。

### 1.2 完整代码实现

#### 1.2.1 配置文件（application.yml）

定义文件存储根路径，避免硬编码，便于维护：

yaml











```yaml
reggie:
  path: D:\reggie_img\  # 本地存储路径，生产环境可改为OSS路径（如阿里云OSS）
spring:
  servlet:
    multipart:
      max-file-size: 10MB  # 单个文件最大限制（默认1MB，需手动扩大）
      max-request-size: 100MB  # 单次请求最大文件总大小
```

#### 1.2.2 公共控制器（CommonController）

java



运行









```java
package com.itheima.reggie.controller;

import com.itheima.reggie.common.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.UUID;

/**
 * 文件上传下载控制器
 * 路径：/common，统一管理文件相关操作
 */
@RestController
@RequestMapping("/common")
@Slf4j
public class CommonController {

    // 从配置文件中读取存储路径（@Value注解注入）
    @Value("${reggie.path}")
    private String basePath;

    /**
     * 文件上传（核心方法）
     * @param file 前端传递的文件（name属性必须为"file"，与前端一致）
     * @return 上传后的文件名（用于后续下载/存储到数据库）
     */
    @PostMapping("/upload")
    public R<String> upload(MultipartFile file) {
        log.info("文件上传：文件名={}, 大小={}KB", file.getOriginalFilename(), file.getSize()/1024);

        // 1. 获取原始文件名，提取后缀（如.jpg、.png）
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));

        // 2. 生成UUID文件名，避免同名文件覆盖（核心避坑点）
        String fileName = UUID.randomUUID().toString() + suffix; // 例：f37a6666-7442-42c8-8374-775559555555.jpg

        // 3. 创建存储目录（若不存在则递归创建）
        File dir = new File(basePath);
        if (!dir.exists()) {
            dir.mkdirs(); // 注意：mkdirs()创建多级目录，mkdir()仅创建单级目录
        }

        try {
            // 4. 将临时文件转存到指定路径（关键步骤：避免临时文件被删除）
            file.transferTo(new File(basePath + fileName));
        } catch (IOException e) {
            log.error("文件上传失败：", e);
            return R.error("文件上传失败");
        }

        // 5. 返回文件名（后续存储到dish表的image字段）
        return R.success(fileName);
    }

    /**
     * 文件下载（核心方法）
     * @param name 上传时返回的文件名（用于拼接存储路径）
     * @param response 响应对象：通过输出流将文件写入浏览器
     */
    @GetMapping("/download")
    public void download(String name, HttpServletResponse response) {
        try {
            // 1. 输入流：读取服务器端的文件
            FileInputStream fis = new FileInputStream(new File(basePath + name));

            // 2. 输出流：将文件写入浏览器（响应体）
            ServletOutputStream sos = response.getOutputStream();

            // 3. 设置响应头：告知浏览器文件类型（图片预览）
            response.setContentType("image/jpeg");

            // 4. 字节数组：缓冲区（1KB），提升读写效率
            byte[] buffer = new byte[1024];
            int len = 0;
            // 循环读取文件到缓冲区，再写入输出流
            while ((len = fis.read(buffer)) != -1) {
                sos.write(buffer, 0, len);
                sos.flush(); // 刷新缓冲区，避免数据残留
            }

            // 5. 关闭资源（先关输出流，再关输入流）
            sos.close();
            fis.close();
        } catch (Exception e) {
            log.error("文件下载失败：", e);
            // 若下载失败，可通过response返回错误信息
            try {
                response.getWriter().write(R.error("文件下载失败").toString());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
}
```

#### 1.2.3 拦截器放行（LoginCheckFilter）

文件上传下载无需登录即可测试，需在拦截器中放行`/common/**`：

java



运行









```java
// LoginCheckFilter的doFilter方法中，添加放行路径
String[] urls = new String[]{
    "/employee/login",
    "/employee/logout",
    "/backend/**",
    "/front/**",
    "/common/**"  // 放行文件上传下载
};
```

### 1.3 拓展知识点

#### 1.3.1 文件存储方案拓展

- **本地存储**：适用于开发 / 测试环境，优点是简单，缺点是服务器迁移时需迁移文件，且容量有限。

- 云存储（推荐生产环境）

  ：如阿里云 OSS、腾讯云 COS，步骤如下：

  1. 引入云存储 SDK（如 aliyun-oss-java-sdk）。
  2. 配置 AccessKey、BucketName、Endpoint。
  3. 上传时调用 SDK 将文件上传到云服务器，返回文件 URL。
  4. 下载时直接通过 URL 访问，无需服务端中转。

#### 1.3.2 常见问题与解决方案

1. **文件上传失败（提示文件过大）**：

   - 原因：SpringBoot 默认单个文件最大 1MB，单次请求最大 10MB。
   - 解决方案：在 application.yml 中配置`spring.servlet.multipart.max-file-size`和`spring.servlet.multipart.max-request-size`。

2. **文件上传后无法访问 / 下载 404**：

   - 原因：存储路径错误（如配置路径多了斜杠`/`）、文件名拼接错误、目录未创建。
   - 排查：打印`basePath + fileName`，检查路径是否正确（如`D:\reggie_img\f37a6666.jpg`）。

3. **临时文件删除导致的异常**：

   - 原因：未调用`transferTo`转存，或转存前关闭了流。
   - 注意：`MultipartFile`的`getInputStream`获取的流关闭后，临时文件会被删除。

4. **跨域问题**：

   - 若前端和后端域名不同，需配置跨域：

     java

     运行

     ```java
@Configuration
     public class CorsConfig implements WebMvcConfigurer {
    @Override
         public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                     .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                     .allowedHeaders("*");
    }
     }
     ```
     
     

#### 1.3.4 优化建议

- **文件名优化**：除了 UUID，可添加时间戳（如`20240520-f37a6666.jpg`），便于按时间分类管理。

- 文件类型校验

  ：限制仅允许上传图片（.jpg、.png、.jpeg），避免恶意文件上传：

  java

  运行

  ```java
// 上传方法中添加类型校验
  List<String> allowedSuffix = Arrays.asList(".jpg", ".png", ".jpeg");
if (!allowedSuffix.contains(suffix.toLowerCase())) {
      return R.error("仅支持jpg、png、jpeg格式图片");
}
  ```

  

- **清理过期文件**：定时任务（如 Quartz）删除 30 天前的临时图片，避免磁盘占满。

------

## 二、菜品新增（多表操作 + DTO + 事务）

### 2.1 核心业务逻辑

新增菜品需操作两张表：

- `dish`表：存储菜品基本信息（名称、价格、分类 ID、图片等）。
- `dish_flavor`表：存储菜品口味信息（如辣度、忌口），通过`dish_id`与`dish`表关联。

核心难点：

1. 前端传递的参数包含菜品基本信息 + 口味列表，需自定义 DTO 接收。
2. 两张表操作需保证原子性（要么都成功，要么都失败），需事务控制。
3. 口味列表需关联菜品 ID（`dish_id`），需先保存菜品再保存口味。

### 2.2 数据模型深度解析

#### 2.2.1 核心表结构

| 表名        | 核心字段                                    | 说明                                  |
| ----------- | ------------------------------------------- | ------------------------------------- |
| dish        | id、name、category_id、price、image、status | status：1 = 起售，0 = 停售            |
| dish_flavor | id、dish_id、name、value                    | value：口味选项（如 ["不辣","微辣"]） |

#### 2.2.2 DTO 设计（DishDto）

为什么用 DTO？`Dish`实体仅包含菜品基本信息，无法接收前端传递的`flavors`（口味列表），因此需要**数据传输对象（DTO）** 扩展属性：

java

运行

```java
package com.itheima.reggie.dto;

import com.itheima.reggie.entity.Dish;
import com.itheima.reggie.entity.DishFlavor;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * 菜品DTO：用于接收前端新增/修改菜品的请求参数
 * 继承Dish：复用菜品基本属性
 * 扩展flavors：接收口味列表
 */
@Data
public class DishDto extends Dish {
    // 菜品口味列表（前端传递的核心扩展字段）
    private List<DishFlavor> flavors = new ArrayList<>();
    
    // 分页查询时用到的分类名称（非新增必填）
    private String categoryName;
    
    // 前端展示用的份数（非核心）
    private Integer copies;
}
```

### 2.3 完整代码实现

#### 2.3.1 准备工作（实体类、Mapper、Service）

- **DishFlavor 实体类**（已提供，核心字段：dishId、name、value）。
- **DishFlavorMapper**：继承 BaseMapper，无需自定义方法。
- **DishFlavorService**：继承 IService，无需自定义方法。

#### 2.3.2 菜品分类查询（前端下拉框数据）

新增菜品时需选择分类，需先查询所有菜品分类（type=1）：

java

运行



```java
// CategoryController中新增方法
@GetMapping("/list")
public R<List<Category>> list(Category category) {
    // 条件构造器：按type查询，按sort升序、updateTime降序
    LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(category.getType() != null, Category::getType, category.getType())
                .orderByAsc(Category::getSort)
                .orderByDesc(Category::getUpdateTime);
    
    List<Category> list = categoryService.list(queryWrapper);
    return R.success(list);
}
```

#### 2.3.3 新增菜品核心代码（Controller+Service）

##### 1. Controller 层（DishController）

java

运行



```java
package com.itheima.reggie.controller;

import com.itheima.reggie.common.R;
import com.itheima.reggie.dto.DishDto;
import com.itheima.reggie.service.DishFlavorService;
import com.itheima.reggie.service.DishService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 菜品管理控制器
 */
@RestController
@RequestMapping("/dish")
@Slf4j
public class DishController {

    @Autowired
    private DishService dishService;

    @Autowired
    private DishFlavorService dishFlavorService;

    /**
     * 新增菜品（接收DTO参数）
     */
    @PostMapping
    public R<String> save(@RequestBody DishDto dishDto) {
        log.info("新增菜品：{}", dishDto);
        // 调用自定义Service方法（含事务控制）
        dishService.saveWithFlavor(dishDto);
        return R.success("新增菜品成功");
    }
}
```

##### 2. Service 层（DishService+Impl）

java

运行

```java
// DishService接口
public interface DishService extends IService<Dish> {
    // 新增菜品并保存口味（自定义方法）
    void saveWithFlavor(DishDto dishDto);
}

// DishServiceImpl实现类
package com.itheima.reggie.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itheima.reggie.dto.DishDto;
import com.itheima.reggie.entity.Dish;
import com.itheima.reggie.entity.DishFlavor;
import com.itheima.reggie.mapper.DishMapper;
import com.itheima.reggie.service.DishFlavorService;
import com.itheima.reggie.service.DishService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DishServiceImpl extends ServiceImpl<DishMapper, Dish> implements DishService {

    @Autowired
    private DishFlavorService dishFlavorService;

    /**
     * 新增菜品+保存口味：事务控制（@Transactional）
     * 核心逻辑：先保存菜品，再保存口味（口味需关联菜品ID）
     */
    @Override
    @Transactional // 开启事务：确保两张表操作原子性
    public void saveWithFlavor(DishDto dishDto) {
        // 1. 保存菜品基本信息到dish表（this指当前Service，继承自ServiceImpl）
        this.save(dishDto);
        Long dishId = dishDto.getId(); // 保存后自动生成的菜品ID

        // 2. 处理口味列表：为每个口味设置dishId（关联菜品）
        List<DishFlavor> flavors = dishDto.getFlavors();
        // stream流遍历：给每个DishFlavor设置dishId
        flavors = flavors.stream().map(flavor -> {
            flavor.setDishId(dishId);
            return flavor;
        }).collect(Collectors.toList());

        // 3. 批量保存口味到dish_flavor表（saveBatch效率高于循环save）
        dishFlavorService.saveBatch(flavors);
    }
}
```

##### 3. 开启事务支持（引导类）

`@Transactional`注解需配合`@EnableTransactionManagement`开启事务管理：

java

运行

```java
@Slf4j
@SpringBootApplication
@ServletComponentScan
@EnableTransactionManagement // 开启事务支持（核心）
public class ReggieApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReggieApplication.class, args);
        log.info("项目启动成功...");
    }
}
```

### 2.4 拓展知识点

#### 2.4.1 DTO、Entity、VO 的区别（核心面试点）

| 类型   | 全称         | 用途                                    | 示例                                |
| ------ | ------------ | --------------------------------------- | ----------------------------------- |
| Entity | 实体类       | 与数据库表一一对应，用于数据持久化      | Dish、DishFlavor                    |
| DTO    | 数据传输对象 | 用于前后端数据传输（封装多表 / 多字段） | DishDto（Dish+flavors）             |
| VO     | 值对象       | 用于前端页面展示（封装页面所需数据）    | DishVO（Dish+categoryName+flavors） |

#### 2.4.2 事务管理深度拓展

1. **事务传播机制**：默认`Propagation.REQUIRED`（如果当前有事务则加入，无则新建），适合多表操作。

2. **事务隔离级别**：默认`Isolation.DEFAULT`（跟随数据库），避免脏读、不可重复读。

3. 事务回滚条件

   ：默认 RuntimeException 回滚，CheckedException 不回滚，可通过

   ```
   rollbackFor
   ```

   指定：

   java

   

   运行

   

   

   

   

   ```java
   @Transactional(rollbackFor = Exception.class) // 所有异常都回滚
   ```

   

#### 2.4.3 批量操作优化

- `saveBatch`原理：MyBatis-Plus 的批量保存会拼接`INSERT INTO ... VALUES (...), (...), (...)`语句，减少 SQL 执行次数（比循环`save`效率高 10 倍以上）。

- 大批量数据（如 1000 + 口味）：可设置分批保存（如每 500 条一批），避免 SQL 过长：

  java

  

  运行

  

  

  

  

  ```java
  // 分批保存工具类
  public static <T> void saveBatchByBatch(IService<T> service, List<T> list, int batchSize) {
      int total = list.size();
      for (int i = 0; i < total; i += batchSize) {
          int end = Math.min(i + batchSize, total);
          service.saveBatch(list.subList(i, end));
      }
  }
  ```

  

------

## 三、菜品分页查询（数据转换 + 关联字段补充）

### 3.1 核心需求

- 分页展示菜品基本信息（名称、价格、状态、更新时间）。
- 展示菜品分类名称（而非分类 ID）：需关联`category`表查询。
- 展示菜品图片：通过文件下载接口回显。

### 3.2 核心难点

- 分页查询的结果是`Page`，但前端需要`categoryName`（分类名称），需转换为`Page`。
- 避免 N+1 查询（如 1 页 10 条菜品，查询 10 次分类表），需优化查询效率。

### 3.3 完整代码实现

java

运行

```java
// DishController中新增分页查询方法
@GetMapping("/page")
public R<Page> page(int page, int pageSize, String name) {
    // 1. 构造分页构造器（MyBatis-Plus提供）
    Page<Dish> dishPage = new Page<>(page, pageSize); // 原始菜品分页对象
    Page<DishDto> dishDtoPage = new Page<>(); // 转换后的DTO分页对象

    // 2. 构造查询条件（模糊查询名称+按更新时间降序）
    LambdaQueryWrapper<Dish> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.like(name != null, Dish::getName, name) // 模糊查询（name不为空时）
                .orderByDesc(Dish::getUpdateTime); // 按更新时间降序

    // 3. 执行分页查询（查询dish表）
    dishService.page(dishPage, queryWrapper);

    // 4. 转换分页数据：Dish -> DishDto（核心步骤）
    // 4.1 拷贝分页基本属性（total、pages、current等，忽略records）
    BeanUtils.copyProperties(dishPage, dishDtoPage, "records");

    // 4.2 处理records（菜品列表）：补充categoryName
    List<Dish> dishList = dishPage.getRecords();
    List<DishDto> dishDtoList = dishList.stream().map(dish -> {
        DishDto dishDto = new DishDto();
        // 拷贝菜品基本属性
        BeanUtils.copyProperties(dish, dishDto);

        // 根据categoryId查询分类名称（核心关联查询）
        Long categoryId = dish.getCategoryId();
        Category category = categoryService.getById(categoryId);
        if (category != null) {
            dishDto.setCategoryName(category.getName()); // 补充分类名称
        }

        return dishDto;
    }).collect(Collectors.toList());

    // 4.3 设置DTO分页的records
    dishDtoPage.setRecords(dishDtoList);

    // 5. 返回DTO分页对象
    return R.success(dishDtoPage);
}
```

### 3.4 拓展知识点

#### 3.4.1 分页查询优化（避免 N+1 问题）

上述代码存在 N+1 查询问题（1 次查询菜品，N 次查询分类），优化方案：

1. **提前查询所有分类并缓存**：

   java

   

   运行

   ```java
// 优化：查询所有菜品分类（type=1），存入Map（categoryId -> categoryName）
   Map<Long, String> categoryMap = categoryService.list(new LambdaQueryWrapper<Category>()
        .eq(Category::getType, 1))
           .stream()
        .collect(Collectors.toMap(Category::getId, Category::getName));
   
// 后续直接从Map获取，无需多次查询数据库
   String categoryName = categoryMap.get(categoryId);
   ```
   
   
   
2. **使用 MyBatis-Plus 关联查询（XML / 注解）**：

   java

   

   运行

   ```java
// DishMapper中新增关联查询方法
   @Select("SELECT d.*, c.name AS category_name FROM dish d LEFT JOIN category c ON d.category_id = c.id ${ew.customSqlSegment}")
Page<DishDto> pageWithCategory(Page<DishDto> page, @Param("ew") LambdaQueryWrapper<Dish> queryWrapper);
   ```

   

#### 3.4.2 分页插件原理

MyBatis-Plus 的分页插件通过**拦截器**改写 SQL，自动添加`LIMIT`语句：

- 需在配置类中注册插件（否则分页失效）：

  java

  

  运行

  

  

  

  

  ```java
  @Configuration
  public class MybatisPlusConfig {
      @Bean
      public MybatisPlusInterceptor mybatisPlusInterceptor() {
          MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
          // 添加分页插件（核心）
          interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
          return interceptor;
      }
  }
  ```

  

#### 3.4.3 前端分页参数说明

- `page`：页码（从 1 开始，MyBatis-Plus 默认页码从 1 开始）。
- `pageSize`：每页条数（如 10、20）。
- 前端分页组件（ElementUI）会自动传递这两个参数，无需手动处理。

------

## 四、菜品修改（先删后加 + 数据回显）

### 4.1 核心业务逻辑

修改菜品需完成 3 件事：

1. 回显菜品基本信息 + 口味信息（根据菜品 ID 查询）。
2. 更新菜品基本信息（dish 表）。
3. 更新菜品口味信息（dish_flavor 表）：采用 “先删后加” 策略（删除原有口味，新增修改后的口味）。

### 4.2 完整代码实现

#### 4.2.1 数据回显（根据 ID 查询菜品 + 口味）

##### 1. Service 层拓展

java



运行

```java
// DishService接口新增方法
DishDto getByIdWithFlavor(Long id);

// DishServiceImpl实现
@Override
public DishDto getByIdWithFlavor(Long id) {
    // 1. 查询菜品基本信息
    Dish dish = this.getById(id);
    DishDto dishDto = new DishDto();
    BeanUtils.copyProperties(dish, dishDto);

    // 2. 查询菜品口味信息（根据dishId）
    List<DishFlavor> flavors = dishFlavorService.list(
            new LambdaQueryWrapper<DishFlavor>()
                    .eq(DishFlavor::getDishId, id)
    );
    dishDto.setFlavors(flavors);

    return dishDto;
}
```

##### 2. Controller 层

java



运行









```java
/**
 * 根据ID查询菜品+口味（数据回显）
 * @param id 菜品ID（从URL路径中获取@PathVariable）
 */
@GetMapping("/{id}")
public R<DishDto> getById(@PathVariable Long id) {
    DishDto dishDto = dishService.getByIdWithFlavor(id);
    return R.success(dishDto);
}
```

#### 4.2.2 保存修改（更新菜品 + 口味）

##### 1. Service 层拓展

java



运行

```java
// DishService接口新增方法
void updateWithFlavor(DishDto dishDto);

// DishServiceImpl实现（含事务）
@Override
@Transactional
public void updateWithFlavor(DishDto dishDto) {
    // 1. 更新菜品基本信息（dish表）
    this.updateById(dishDto);

    // 2. 删除原有口味（dish_flavor表）：先删后加，避免口味残留
    dishFlavorService.remove(
            new LambdaQueryWrapper<DishFlavor>()
                    .eq(DishFlavor::getDishId, dishDto.getId())
    );

    // 3. 新增修改后的口味（与新增菜品逻辑一致）
    List<DishFlavor> flavors = dishDto.getFlavors();
    flavors = flavors.stream().map(flavor -> {
        flavor.setDishId(dishDto.getId());
        return flavor;
    }).collect(Collectors.toList());
    dishFlavorService.saveBatch(flavors);
}
```

##### 2. Controller 层

java



运行



```java
/**
 * 修改菜品（接收DTO参数）
 */
@PutMapping
public R<String> update(@RequestBody DishDto dishDto) {
    log.info("修改菜品：{}", dishDto);
    dishService.updateWithFlavor(dishDto);
    return R.success("修改菜品成功");
}
```

### 4.3 拓展知识点

#### 4.3.1 “先删后加” 策略的优势

- 无需判断口味是新增、修改还是删除，逻辑简单。
- 避免口味数据残留（如用户删除了某个口味，直接删除原有所有口味再新增）。
- 适合口味数量少的场景（如菜品口味通常不超过 10 个），效率影响可忽略。

#### 4.3.2 乐观锁在修改中的应用

并发修改菜品时可能导致数据覆盖，可通过乐观锁避免：

1. 实体类添加版本号字段：

   java

   

   运行

   

   

   ```java
@Data
   public class Dish {
    // 其他字段...
       @Version // 乐观锁版本号字段
       private Integer version;
   }
   ```
   
   
   
2. 配置乐观锁插件：

   java

   

   运行

   

   

   

   

   ```java
   @Bean
   public MybatisPlusInterceptor mybatisPlusInterceptor() {
       MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
       interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
       interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor()); // 乐观锁插件
       return interceptor;
   }
   ```

   

#### 4.3.3 @PathVariable 注解说明

- 用于提取 URL 路径中的参数（如`/dish/123`中的 123）。
- 需与方法参数名一致，或通过`@PathVariable("id")`指定。
- 区别于`@RequestParam`（提取 URL 查询参数，如`/dish/page?page=1`）。

------

## 五、避坑指南与总结

### 5.1 常见坑点与解决方案

1. **文件上传下载 404**：
   - 检查`basePath`配置是否正确（如路径是否存在、是否多斜杠）。
   - 检查拦截器是否放行`/common/**`。
2. **菜品新增 / 修改后口味不保存**：
   - 忘记开启事务（`@EnableTransactionManagement`）。
   - 口味列表未设置`dishId`（核心关联字段）。
   - `saveBatch`方法未调用（或口味列表为空）。
3. **分页查询分类名称为空**：
   - 分类 ID 不存在（如菜品的`categoryId`错误）。
   - `categoryService.getById(categoryId)`返回 null，未做非空判断。
4. **事务不回滚**：
   - 未加`@Transactional`注解。
   - 注解加在 private 方法上（Spring 事务不支持 private 方法）。
   - 抛出的是 CheckedException（默认不回滚）。

### 5.2 核心知识点总结

1. **文件上传下载**：MultipartFile 临时文件转存、流的关闭、响应头设置。
2. **多表操作**：DTO 数据传输、事务控制、批量保存。
3. **分页查询**：MyBatis-Plus 分页插件、数据转换（Dish→DishDto）、关联字段补充。
4. **菜品修改**：先删后加策略、数据回显、乐观锁应用。

### 5.3 项目架构优化建议

1. **统一异常处理**：完善 GlobalExceptionHandler，捕获文件上传失败、事务异常等。
2. **工具类封装**：封装文件上传下载、分批保存、数据转换等通用逻辑。
3. **缓存优化**：缓存分类、菜品等高频查询数据，减少数据库压力。
4. **日志规范**：在关键方法（如事务方法）添加详细日志，便于问题排查。

------

## 六、交付物提议

要不要我帮你整理一份**可直接运行的完整代码包**，包含所有 DTO、Service、Controller、配置类（含文件上传下载、菜品 CRUD、事务配置、分页插件），并附带 SQL 脚本和测试说明，方便你直接导入项目测试和复用？