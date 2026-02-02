# 22从“复制粘贴”到“恍然大悟”：手撕MyBatis-Plus自动填充和分类管理

> 凌晨1点，我盯着屏幕上重复了二十遍的`setCreateTime(new Date())`，突然把键盘一推——“我受够了！”**如果每个实体类都要手动设置这四个字段，那我写代码和流水线工人有什么区别？** 直到我遇见了MyBatis-Plus的自动填充，才明白什么是“优雅编码”。

![image-20260202165232839](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202165232839.png)

## 一、公共字段自动填充：从“体力活”到“智能编码”

### 1.1 那些年，我写过的重复代码

刚接手分类管理模块时，我的`CategoryController`长这样：

java

```java
@PostMapping
public R<String> addCategory(HttpServletRequest request, @RequestBody Category category) {
    // 每次新增都要设置这4个字段！
    category.setCreateTime(new Date());
    category.setUpdateTime(new Date());
    category.setCreateUser((Long) request.getSession().getAttribute("employee"));
    category.setUpdateUser((Long) request.getSession().getAttribute("employee"));
    
    categoryService.save(category);
    return R.success("添加成功");
}

@PutMapping
public R<String> updateCategory(HttpServletRequest request, @RequestBody Category category) {
    // 每次修改又要设置这2个字段！
    category.setUpdateTime(new Date());
    category.setUpdateUser((Long) request.getSession().getAttribute("employee"));
    
    categoryService.updateById(category);
    return R.success("修改成功");
}
```



**问题来了：**

1. **重复劳动**：每个Controller都要写一遍
2. **容易遗漏**：万一哪个方法忘了设置，数据就不完整
3. **维护困难**：如果要改字段名，得在所有地方改
4. **Session依赖**：每个方法都要从Session拿用户ID

### 1.2 第一次尝试：在Service层统一处理？

我在Service层加了个方法：

java

```java
private void setCommonFields(Category category, HttpServletRequest request) {
    Long userId = (Long) request.getSession().getAttribute("employee");
    if (category.getId() == null) {
        // 新增
        category.setCreateTime(new Date());
        category.setCreateUser(userId);
    }
    category.setUpdateTime(new Date());
    category.setUpdateUser(userId);
}
```



**新问题：**

- Service层拿不到HttpServletRequest！（Spring不推荐在Service层耦合Web对象）
- 每个Service都要写一遍这个方法

### 1.3 遇见MyBatis-Plus：原来可以这么优雅！

#### 1.3.1 第一步：实体类标记哪些字段需要自动填充

java

```java
@Data
public class Category {
    private Long id;
    private String name;
    private Integer type;
    private Integer sort;
    
    // 只在插入时填充
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    // 插入和更新时都填充
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(fill = FieldFill.INSERT)
    private Long createUser;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}
```



**那一刻的顿悟：**
原来`@TableField`不仅能做数据库字段映射，还能告诉MyBatis-Plus：“这个字段不用你管，我会自己填！”

#### 1.3.2 第二步：实现MetaObjectHandler

java

```java
@Component  // 一定要加这个注解！我忘了加，debug了半小时
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("公共字段自动填充[insert]...");
        
        // 设置创建时间和更新时间
        this.setFieldValByName("createTime", LocalDateTime.now(), metaObject);
        this.setFieldValByName("updateTime", LocalDateTime.now(), metaObject);
        
        // 设置创建人和更新人
        Long currentId = BaseContext.getCurrentId();
        this.setFieldValByName("createUser", currentId, metaObject);
        this.setFieldValByName("updateUser", currentId, metaObject);
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("公共字段自动填充[update]...");
        
        // 只设置更新时间和更新人
        this.setFieldValByName("updateTime", LocalDateTime.now(), metaObject);
        this.setFieldValByName("updateUser", BaseContext.getCurrentId(), metaObject);
    }
}
```



**踩坑记录：**

1. 忘了加`@Component`，Spring没扫描到，填充死活不生效
2. 字段名写错了，应该是`createTime`我写成了`create_time`
3. 不知道`BaseContext.getCurrentId()`是什么（下面马上讲）

#### 1.3.3 第三步：ThreadLocal登场——线程隔离的魔法

问题来了：`MetaObjectHandler`里怎么获取当前登录用户的ID？

**我的错误尝试：**

java

```java
// 错误示范：直接拿HttpServletRequest
HttpServletRequest request = ((ServletRequestAttributes) 
    RequestContextHolder.getRequestAttributes()).getRequest();
Long userId = (Long) request.getSession().getAttribute("employee");
```



**为什么不行？**

1. 复杂！每次都要写这么长一串
2. 可能为空（在非Web线程中执行时）
3. 破坏了Handler的纯洁性（它应该只关心数据填充）

**正确方案：ThreadLocal**

java

```java
public class BaseContext {
    // ThreadLocal：每个线程有自己的独立副本
    private static ThreadLocal<Long> threadLocal = new ThreadLocal<>();
    
    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }
    
    public static Long getCurrentId() {
        return threadLocal.get();
    }
    
    public static void removeCurrentId() {
        threadLocal.remove();  // 防止内存泄漏！
    }
}
```



**ThreadLocal理解小剧场：**

> 想象一个游泳馆更衣柜。每个线程（游泳者）有自己的柜子（ThreadLocal），柜子里可以放自己的东西（用户ID）。A线程拿不到B线程柜子里的东西，这就是线程隔离。

![image-20260202165422702](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202165422702.png)

**在过滤器中设置用户ID：**

java

```java
@WebFilter("/*")
public class LoginCheckFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        
        // 检查是否登录...
        if (req.getSession().getAttribute("employee") != null) {
            // 用户已登录，把用户ID放到ThreadLocal中
            Long empId = (Long) req.getSession().getAttribute("employee");
            BaseContext.setCurrentId(empId);
            
            try {
                chain.doFilter(request, response);
            } finally {
                // 一定要清理！防止内存泄漏
                BaseContext.removeCurrentId();
            }
        }
    }
}
```



### 1.4 最终效果：Controller变得如此简洁

java

```java
@PostMapping
public R<String> add(@RequestBody Category category) {
    // 不用再设置那些公共字段了！
    categoryService.save(category);
    return R.success("添加成功");
}

@PutMapping
public R<String> update(@RequestBody Category category) {
    // 这里也是！
    categoryService.updateById(category);
    return R.success("修改成功");
}
```



**那一刻的感受：** 原来好的框架不是让你少写代码，而是让你只写业务代码！

## 二、分类管理：从“能跑就行”到“健壮可靠”

### 2.1 分页查询：我以为很简单

![image-20260202165622451](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202165622451.png)

#### 2.1.1 我的第一版分页

java

```java
@GetMapping("/page")
public R<List<Category>> page(int page, int pageSize) {
    // 计算起始位置
    int start = (page - 1) * pageSize;
    
    // 自己写SQL...
    List<Category> list = categoryMapper.selectByPage(start, pageSize);
    
    return R.success(list);
}
```



**问题：**

1. 要自己计算总记录数（再查一次`count(*)`）
2. 要自己处理页码越界
3. 排序？过滤？每个需求都要改SQL

#### 2.1.2 MyBatis-Plus分页：真香！

java

```java
@GetMapping("/page")
public R<Page<Category>> page(int page, int pageSize) {
    // 1. 创建分页对象
    Page<Category> pageInfo = new Page<>(page, pageSize);
    
    // 2. 创建条件构造器（支持Lambda，避免字段名写错）
    LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
    wrapper.orderByAsc(Category::getSort)  // 按sort升序
           .orderByDesc(Category::getUpdateTime);  // 按更新时间降序
    
    // 3. 执行查询（自动分页！）
    categoryService.page(pageInfo, wrapper);
    
    // pageInfo里已经有：records(数据), total(总数), pages(总页数)
    return R.success(pageInfo);
}
```



**配置分页插件（别忘了！）：**

java

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}
```



**踩过的坑：** 忘记配置这个Bean，分页`limit`语句根本没生成，查出来的还是全部数据！

### 2.2 删除分类：我差点删掉了整个菜单

![image-20260202165831728](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202165831728.png)

#### 2.2.1 血泪教训：没有关联校验

那天下午，测试小姐姐跑过来：“分类怎么少了？里面的菜品也没了！”

我查了日志——我把一个有关联菜品的分类删了，数据库设置了外键级联删除，菜品跟着没了。

**紧急修复方案：**

java

```java
@DeleteMapping
public R<String> delete(Long id) {
    // 先检查这个分类下有没有菜品
    LambdaQueryWrapper<Dish> dishWrapper = new LambdaQueryWrapper<>();
    dishWrapper.eq(Dish::getCategoryId, id);
    int dishCount = dishService.count(dishWrapper);
    
    if (dishCount > 0) {
        return R.error("该分类下有关联菜品，无法删除");
    }
    
    // 再检查有没有套餐
    LambdaQueryWrapper<Setmeal> setmealWrapper = new LambdaQueryWrapper<>();
    setmealWrapper.eq(Setmeal::getCategoryId, id);
    int setmealCount = setmealService.count(setmealWrapper);
    
    if (setmealCount > 0) {
        return R.error("该分类下有关联套餐，无法删除");
    }
    
    // 都没问题才删除
    categoryService.removeById(id);
    return R.success("删除成功");
}
```



#### 2.2.2 进阶：自定义业务异常

上面的代码有重复逻辑，而且Controller里混入了业务判断。重构！

![image-20260202165917190](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202165917190.png)

**第一步：创建自定义异常**

java

```java
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
```



**第二步：Service层抛出异常**

java

```java
@Override
public void remove(Long id) {
    // 检查菜品关联
    LambdaQueryWrapper<Dish> dishWrapper = new LambdaQueryWrapper<>();
    dishWrapper.eq(Dish::getCategoryId, id);
    if (dishService.count(dishWrapper) > 0) {
        throw new BusinessException("当前分类下关联了菜品，不能删除");
    }
    
    // 检查套餐关联
    LambdaQueryWrapper<Setmeal> setmealWrapper = new LambdaQueryWrapper<>();
    setmealWrapper.eq(Setmeal::getCategoryId, id);
    if (setmealService.count(setmealWrapper) > 0) {
        throw new BusinessException("当前分类下关联了套餐，不能删除");
    }
    
    // 删除
    super.removeById(id);
}
```



**第三步：全局异常处理器**

java

```java
@ControllerAdvice
@ResponseBody
@Slf4j
public class GlobalExceptionHandler {
    
    // 处理业务异常
    @ExceptionHandler(BusinessException.class)
    public R<String> handleBusinessException(BusinessException ex) {
        log.error("业务异常：{}", ex.getMessage());
        return R.error(ex.getMessage());
    }
    
    // 处理SQL异常（比如唯一约束冲突）
    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public R<String> handleSQLException(SQLIntegrityConstraintViolationException ex) {
        log.error("SQL异常：{}", ex.getMessage());
        
        // 分类名重复："Duplicate entry '川菜' for key 'idx_category_name'"
        if (ex.getMessage().contains("Duplicate entry")) {
            String[] split = ex.getMessage().split("'");
            String duplicateValue = split[1]; // 取出重复的值
            return R.error(duplicateValue + "已存在");
        }
        
        return R.error("数据库操作失败");
    }
}
```



**第四步：Controller变得清爽**

java

```java
@DeleteMapping
public R<String> delete(Long id) {
    log.info("删除分类：{}", id);
    categoryService.remove(id);  // 可能抛出BusinessException
    return R.success("删除成功");
}
```



## 三、那些让我“顿悟”的时刻

### 3.1 关于ThreadLocal内存泄漏

有一次服务器运行几天后内存飙升，排查发现是ThreadLocal没清理。

**错误理解：** “方法执行完，局部变量不就自动回收了吗？”

**实际情况：** Tomcat用了线程池！线程执行完请求后放回池子，下次再用。如果ThreadLocal没清理，里面的数据会一直存在。

**修正后的过滤器：**

java

```java
try {
    if (已登录) {
        BaseContext.setCurrentId(userId);
    }
    chain.doFilter(request, response);
} finally {
    // 无论成功还是异常，都清理ThreadLocal
    BaseContext.removeCurrentId();
}
```



### 3.2 关于LambdaQueryWrapper的“类型安全”

以前用普通的QueryWrapper：

java

```java
QueryWrapper<Category> wrapper = new QueryWrapper<>();
wrapper.eq("name", "川菜");  // 字段名是字符串，写错了不报错！
```



现在用LambdaQueryWrapper：

java

```java
LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(Category::getName, "川菜");  // 编译期检查！改名了会报错
```



**重构时的便利：** 实体类字段名从`name`改成`categoryName`，所有用到的地方IDE都会提示错误。

### 3.3 关于“约定大于配置”

刚开始我不理解：为什么MyBatis-Plus能自动调用我的`MetaObjectHandler`？

后来看了源码才知道：MyBatis-Plus在插入/更新时，会检查实体字段的`@TableField(fill)`注解，如果需要填充，就调用已注册的`MetaObjectHandler`。

**这种设计思想的启示：** 好的框架通过约定减少配置。你只需要按照约定写代码，框架在背后帮你完成连接。

## 四、如果重来一次，我会...

### 4.1 在项目初期就引入公共字段填充

不用等到写了十几个Controller才重构。一开始就在BaseEntity里定义好：

java

```java
@Data
public abstract class BaseEntity {
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(fill = FieldFill.INSERT)
    private Long createUser;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}

// 所有实体继承它
public class Category extends BaseEntity {
    // ... 其他字段
}
```



### 4.2 更早使用全局异常处理

不要等到用户看到“500 Internal Server Error”才想起来要处理异常。

### 4.3 写更多的日志

java

```java
// 不要只写
log.info("删除分类：{}", id);

// 要写
log.info("用户{}尝试删除分类{}，IP：{}", 
    BaseContext.getCurrentId(), id, getClientIp(request));
```



## 结语：从“会用”到“理解”

学MyBatis-Plus的自动填充，我最大的收获不是少写了几行代码，而是理解了**框架设计思想**：

1. **元数据编程**：通过注解标记意图，框架读取并执行
2. **线程隔离**：ThreadLocal解决线程安全问题
3. **约定优于配置**：减少决策成本，提高开发效率
4. **关注点分离**：Controller只关心参数校验，Service只关心业务逻辑，填充交给框架

现在回头看那些重复的`setCreateTime()`，就像看到原始人钻木取火——不是不对，只是有了打火机，为什么不用呢？

**技术进阶的路就是这样：先学会用工具，再理解原理，最后创造自己的最佳实践。** 与各位还在“钻木取火”的同学共勉！