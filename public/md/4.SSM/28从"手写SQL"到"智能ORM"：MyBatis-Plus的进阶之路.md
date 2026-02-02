# 28从"手写SQL"到"智能ORM"：MyBatis-Plus的进阶之路

> 还记得那些年，我在MyBatis的XML里写的上百个``标签吗？每个表都要写一套CRUD，每个条件查询都要写一个方法。**直到我发现了MyBatis-Plus，才明白什么叫"告别重复劳动，拥抱高效开发"！**

![image-20260202192911537](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202192911537.png)

## 一、MyBatis-Plus初体验：从"震惊"到"真香"

### 1.1 传统的MyBatis开发流程

在瑞吉外卖项目中，我最初是这样使用MyBatis的：

java

```java
// 1. 实体类
@Data
public class User {
    private Long id;
    private String name;
    private String password;
    private Integer age;
    private String tel;
}

// 2. Mapper接口
public interface UserMapper {
    int insert(User user);
    int deleteById(Long id);
    int update(User user);
    User selectById(Long id);
    List<User> selectAll();
    List<User> selectByCondition(@Param("name") String name, @Param("minAge") Integer minAge);
    // 还有更多方法...
}

// 3. XML映射文件
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.reggie.mapper.UserMapper">
    <insert id="insert" parameterType="User" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO user(name, password, age, tel)
        VALUES(#{name}, #{password}, #{age}, #{tel})
    </insert>
    
    <delete id="deleteById" parameterType="Long">
        DELETE FROM user WHERE id = #{id}
    </delete>
    
    <update id="update" parameterType="User">
        UPDATE user 
        SET name = #{name}, password = #{password}, age = #{age}, tel = #{tel}
        WHERE id = #{id}
    </update>
    
    <select id="selectById" parameterType="Long" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <select id="selectAll" resultType="User">
        SELECT * FROM user
    </select>
    
    <select id="selectByCondition" resultType="User">
        SELECT * FROM user 
        WHERE 1=1
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="minAge != null">
            AND age >= #{minAge}
        </if>
    </select>
    
    <!-- 还有更多SQL... -->
</mapper>
```



**痛点：**

1. **重复劳动**：每个实体类都要写一套CRUD
2. **维护困难**：改字段名要改Java代码、XML、SQL
3. **容易出错**：字段名写错要到运行时才发现
4. **XML膨胀**：几十个表就有几十个XML文件

### 1.2 MyBatis-Plus带来的震撼

java

```java
// 1. 引入依赖
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.1</version>
</dependency>

// 2. 实体类（几乎不变，加点注解）
@Data
@TableName("user")  // 指定表名，类名和表名不一致时需要
public class User {
    @TableId(type = IdType.ASSIGN_ID)  // 主键策略：雪花算法
    private Long id;
    
    private String name;
    private String password;
    private Integer age;
    private String tel;
    
    @TableField(exist = false)  // 非数据库字段
    private String confirmPassword;
}

// 3. Mapper接口（只需要继承BaseMapper！）
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 不需要写任何方法！CRUD全都有了
}

// 4. 直接使用！
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
    
    public void testCRUD() {
        // 新增
        User user = new User();
        user.setName("张三");
        user.setAge(25);
        userMapper.insert(user);  // 自动生成SQL！
        
        // 查询
        User dbUser = userMapper.selectById(user.getId());
        
        // 更新
        dbUser.setAge(26);
        userMapper.updateById(dbUser);
        
        // 删除
        userMapper.deleteById(user.getId());
        
        // 查询所有
        List<User> allUsers = userMapper.selectList(null);
    }
}
```



**我的第一反应：** "这...这就完事了？SQL呢？XML呢？"

**导师的回答：** "MP帮我们生成了，这叫约定大于配置！"

## 二、条件构造器：从"手写动态SQL"到"链式调用"

![image-20260202192940563](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202192940563.png)

### 2.1 动态SQL的进化

**传统MyBatis的动态SQL：**

xml

```java
<select id="selectByCondition" resultType="User">
    SELECT * FROM user 
    WHERE 1=1
    <if test="name != null and name != ''">
        AND name LIKE CONCAT('%', #{name}, '%')
    </if>
    <if test="minAge != null">
        AND age >= #{minAge}
    </if>
    <if test="maxAge != null">
        AND age <= #{maxAge}
    </if>
    <if test="tel != null and tel != ''">
        AND tel = #{tel}
    </if>
    ORDER BY id DESC
</select>
```



**在Java代码中调用：**

java

```java
Map<String, Object> params = new HashMap<>();
params.put("name", "张");
params.put("minAge", 18);
params.put("maxAge", 30);
List<User> users = userMapper.selectByCondition(params);
```



**问题：**

1. **不直观**：SQL逻辑分散在XML中
2. **难调试**：参数传递复杂
3. **类型不安全**：参数类型不匹配要运行时才知道

**MyBatis-Plus的条件构造器：**

java

```java
public List<User> findUsers(String name, Integer minAge, Integer maxAge, String tel) {
    // 创建条件构造器
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    
    if (StringUtils.isNotBlank(name)) {
        wrapper.like("name", name);  // name LIKE '%张%'
    }
    
    if (minAge != null) {
        wrapper.ge("age", minAge);  // age >= 18
    }
    
    if (maxAge != null) {
        wrapper.le("age", maxAge);  // age <= 30
    }
    
    if (StringUtils.isNotBlank(tel)) {
        wrapper.eq("tel", tel);  // tel = '13800138000'
    }
    
    wrapper.orderByDesc("id");  // ORDER BY id DESC
    
    return userMapper.selectList(wrapper);
}
```



### 2.2 Lambda条件构造器：类型安全的革命

**问题：** QueryWrapper写字段名字符串，容易写错！

java

```
wrapper.eq("name", "张三");  // 写成了"nmae"怎么办？运行时才报错！
```



**解决方案：LambdaQueryWrapper**

java

```java
public List<User> findUsersLambda(String name, Integer minAge, Integer maxAge, String tel) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    // 使用Lambda表达式，编译期检查！
    if (StringUtils.isNotBlank(name)) {
        wrapper.like(User::getName, name);  // 写错方法名会编译失败！
    }
    
    if (minAge != null) {
        wrapper.ge(User::getAge, minAge);
    }
    
    if (maxAge != null) {
        wrapper.le(User::getAge, maxAge);
    }
    
    if (StringUtils.isNotBlank(tel)) {
        wrapper.eq(User::getTel, tel);
    }
    
    wrapper.orderByDesc(User::getId);
    
    return userMapper.selectList(wrapper);
}
```



**更优雅的链式调用：**

java

```java
public List<User> findUsersChain(String name, Integer minAge, Integer maxAge, String tel) {
    return userMapper.selectList(new LambdaQueryWrapper<User>()
        .like(StringUtils.isNotBlank(name), User::getName, name)
        .ge(minAge != null, User::getAge, minAge)
        .le(maxAge != null, User::getAge, maxAge)
        .eq(StringUtils.isNotBlank(tel), User::getTel, tel)
        .orderByDesc(User::getId));
}
```



**条件构造器常用方法：**

java

```java
// 比较操作
wrapper.eq("name", "张三");      // name = '张三'
wrapper.ne("name", "张三");      // name != '张三'
wrapper.gt("age", 18);          // age > 18
wrapper.ge("age", 18);          // age >= 18  
wrapper.lt("age", 60);          // age < 60
wrapper.le("age", 60);          // age <= 60

// 范围查询
wrapper.between("age", 18, 60); // age BETWEEN 18 AND 60
wrapper.notBetween("age", 18, 60); // age NOT BETWEEN 18 AND 60
wrapper.in("id", Arrays.asList(1, 2, 3)); // id IN (1,2,3)
wrapper.notIn("id", Arrays.asList(4, 5, 6)); // id NOT IN (4,5,6)

// 模糊查询
wrapper.like("name", "张");     // name LIKE '%张%'
wrapper.likeLeft("name", "三"); // name LIKE '%三'
wrapper.likeRight("name", "张"); // name LIKE '张%'
wrapper.notLike("name", "张");  // name NOT LIKE '%张%'

// 空值判断
wrapper.isNull("email");        // email IS NULL
wrapper.isNotNull("phone");     // phone IS NOT NULL

// 分组和排序
wrapper.groupBy("dept_id");     // GROUP BY dept_id
wrapper.orderByAsc("age");      // ORDER BY age ASC
wrapper.orderByDesc("create_time"); // ORDER BY create_time DESC
wrapper.having("COUNT(*) > 10"); // HAVING COUNT(*) > 10

// 逻辑连接
wrapper.and(w -> w.eq("name", "张三").or().eq("name", "李四"));
// WHERE (name = '张三' OR name = '李四')

wrapper.or().eq("status", 1);   // OR status = 1

// 选择特定字段
wrapper.select("id", "name", "age"); // 只查这三个字段
```



## 三、分页插件：从"手写分页SQL"到"一键分页"

![image-20260202193058903](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202193058903.png)

### 3.1 传统分页的痛苦

sql

```java
-- MySQL分页
SELECT * FROM user LIMIT 0, 10;

-- 还要查总数
SELECT COUNT(*) FROM user;

-- 不同数据库语法不同！
-- Oracle: SELECT * FROM (SELECT t.*, ROWNUM rn FROM user t WHERE ROWNUM <= 20) WHERE rn > 10
-- SQL Server: SELECT * FROM user ORDER BY id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY
```



**在MyBatis中：**

xml

```xml
<select id="selectPage" resultType="User">
    SELECT * FROM user 
    LIMIT #{offset}, #{pageSize}
</select>

<select id="selectCount" resultType="Long">
    SELECT COUNT(*) FROM user
</select>
```



java

```java
public PageResult<User> listUsers(int page, int size) {
    int offset = (page - 1) * size;
    
    List<User> users = userMapper.selectPage(offset, size);
    Long total = userMapper.selectCount();
    
    int totalPages = (int) Math.ceil((double) total / size);
    
    return new PageResult<>(users, total, page, size, totalPages);
}
```



### 3.2 MyBatis-Plus分页插件

**配置分页插件：**

java

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 分页插件
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor();
        paginationInterceptor.setDbType(DbType.MYSQL);  // 设置数据库类型
        paginationInterceptor.setMaxLimit(1000L);       // 单页最大1000条
        paginationInterceptor.setOverflow(true);        // 超过总页数后返回第一页
        
        interceptor.addInnerInterceptor(paginationInterceptor);
        
        // 乐观锁插件（可选）
        OptimisticLockerInnerInterceptor optimisticLockerInterceptor = new OptimisticLockerInnerInterceptor();
        interceptor.addInnerInterceptor(optimisticLockerInterceptor);
        
        return interceptor;
    }
}
```



**使用分页：**

java

```java
public PageResult<User> listUsersMP(int page, int size) {
    // 创建分页对象
    Page<User> pageInfo = new Page<>(page, size);
    
    // 执行分页查询（自动带上COUNT查询！）
    userMapper.selectPage(pageInfo, null);
    
    // 分页结果都在pageInfo里了
    List<User> users = pageInfo.getRecords();    // 当前页数据
    long total = pageInfo.getTotal();            // 总条数
    long pages = pageInfo.getPages();            // 总页数
    
    return new PageResult<>(users, total, page, size, (int) pages);
}
```



**带条件的分页查询：**

java

```java
public PageResult<User> searchUsers(String keyword, Integer minAge, int page, int size) {
    Page<User> pageInfo = new Page<>(page, size);
    
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.like(StringUtils.isNotBlank(keyword), User::getName, keyword)
           .or()
           .like(StringUtils.isNotBlank(keyword), User::getTel, keyword)
           .ge(minAge != null, User::getAge, minAge)
           .orderByDesc(User::getCreateTime);
    
    userMapper.selectPage(pageInfo, wrapper);
    
    return new PageResult<>(
        pageInfo.getRecords(),
        pageInfo.getTotal(),
        pageInfo.getCurrent(),
        pageInfo.getSize(),
        pageInfo.getPages()
    );
}
```



## 四、高级特性：逻辑删除、乐观锁、字段填充

![image-20260202193120536](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202193120536.png)

### 4.1 逻辑删除：优雅的"假删除"

**传统删除的问题：** 数据真的没了，想恢复都难！

**逻辑删除方案：** 用一个字段标记是否删除

java

```java
// 1. 数据库表添加deleted字段
ALTER TABLE user ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除';

// 2. 实体类添加字段
@Data
public class User {
    // ... 其他字段
    
    @TableLogic  // 标记这是逻辑删除字段
    private Integer deleted;  // 0=未删除，1=已删除
}

// 3. 配置（可选，有默认值）
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加逻辑删除拦截器
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor()); // 防止全表更新/删除
        
        return interceptor;
    }
}

// 4. 使用
@Service
public class UserService {
    
    public void deleteUser(Long id) {
        // 实际执行的是：UPDATE user SET deleted = 1 WHERE id = ? AND deleted = 0
        userMapper.deleteById(id);
        
        // 查询时自动过滤：SELECT * FROM user WHERE deleted = 0
        List<User> activeUsers = userMapper.selectList(null);
        
        // 如果想查所有（包括已删除的）
        List<User> allUsers = userMapper.selectList(new LambdaQueryWrapper<User>()
            .isNotNull(User::getId));  // 不会自动加deleted=0条件
    }
    
    // 恢复删除
    public void restoreUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setDeleted(0);
        userMapper.updateById(user);
    }
}
```



### 4.2 乐观锁：解决并发更新冲突

**场景：** 两个用户同时修改同一条数据，后者覆盖前者

java

```java
// 1. 数据库表添加version字段
ALTER TABLE user ADD COLUMN version INT DEFAULT 1 COMMENT '版本号，用于乐观锁';

// 2. 实体类添加字段
@Data
public class User {
    // ... 其他字段
    
    @Version  // 标记这是乐观锁版本字段
    private Integer version;
}

// 3. 已在前面的配置中添加乐观锁插件

// 4. 使用
@Service
@Transactional
public class UserService {
    
    public void updateUserAge(Long userId, Integer newAge) {
        // 第一次查询
        User user = userMapper.selectById(userId);
        
        // 模拟其他线程修改了数据
        // 另一个线程执行了：UPDATE user SET age = 30 WHERE id = ? AND version = 1
        
        // 设置新年龄
        user.setAge(newAge);
        
        // 更新，SQL：UPDATE user SET age = ?, version = 2 WHERE id = ? AND version = 1
        // 如果version被其他线程修改了，这里影响行数为0，更新失败！
        int rows = userMapper.updateById(user);
        
        if (rows == 0) {
            throw new BusinessException("数据已被修改，请刷新后重试");
        }
    }
    
    // 批量操作的乐观锁
    public void batchUpdateUsers(List<User> users) {
        for (User user : users) {
            int rows = userMapper.updateById(user);
            if (rows == 0) {
                // 处理更新失败的情况
                log.warn("用户{}更新失败，版本冲突", user.getId());
            }
        }
    }
}
```



### 4.3 自动填充：告别手动set时间

**场景：** 每个表都有create_time、update_time字段

java

```java
// 1. 实体类
@Data
public class User {
    // ... 其他字段
    
    @TableField(fill = FieldFill.INSERT)  // 插入时填充
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)  // 插入和更新时填充
    private LocalDateTime updateTime;
    
    @TableField(fill = FieldFill.INSERT)  // 插入时填充
    private Long createUser;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)  // 插入和更新时填充
    private Long updateUser;
}

// 2. 实现元对象处理器
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        // 从ThreadLocal或SecurityContext中获取当前用户ID
        Long currentUserId = getCurrentUserId();
        this.strictInsertFill(metaObject, "createUser", Long.class, currentUserId);
        this.strictInsertFill(metaObject, "updateUser", Long.class, currentUserId);
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        Long currentUserId = getCurrentUserId();
        this.strictUpdateFill(metaObject, "updateUser", Long.class, currentUserId);
    }
    
    private Long getCurrentUserId() {
        // 实际项目中从安全上下文获取
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return 1L; // 默认系统用户
        }
    }
}

// 3. 使用：完全不需要手动设置这些字段！
@Service
public class UserService {
    
    public void addUser(UserDTO dto) {
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        
        // 不需要设置createTime、updateTime、createUser、updateUser！
        userMapper.insert(user);
        
        log.info("用户创建时间: {}", user.getCreateTime());
        log.info("创建人: {}", user.getCreateUser());
    }
    
    public void updateUser(UserDTO dto) {
        User user = userMapper.selectById(dto.getId());
        BeanUtils.copyProperties(dto, user);
        
        // 不需要设置updateTime、updateUser！
        userMapper.updateById(user);
    }
}
```



## 五、代码生成器：从"手写"到"自动生成"

![image-20260202193141161](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202193141161.png)

### 5.1 代码生成器的威力

**场景：** 新项目有50张表，每张表都要写：

- Entity实体类
- Mapper接口
- Service接口和实现
- Controller

**手写：** 至少3天，而且容易出错

**代码生成器：** 5分钟！

java

```java
// 代码生成器配置
public class CodeGenerator {
    
    public static void main(String[] args) {
        // 1. 创建代码生成器
        AutoGenerator generator = new AutoGenerator();
        
        // 2. 数据源配置
        DataSourceConfig dataSource = new DataSourceConfig();
        dataSource.setUrl("jdbc:mysql://localhost:3306/reggie?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai");
        dataSource.setDriverName("com.mysql.cj.jdbc.Driver");
        dataSource.setUsername("root");
        dataSource.setPassword("123456");
        generator.setDataSource(dataSource);
        
        // 3. 全局配置
        GlobalConfig globalConfig = new GlobalConfig();
        globalConfig.setOutputDir(System.getProperty("user.dir") + "/src/main/java");
        globalConfig.setAuthor("瑞吉开发团队");
        globalConfig.setOpen(false); // 生成后不打开文件夹
        globalConfig.setSwagger2(true); // 生成Swagger注解
        globalConfig.setServiceName("%sService"); // 服务接口名格式
        globalConfig.setFileOverride(true); // 覆盖已有文件
        globalConfig.setIdType(IdType.ASSIGN_ID); // 主键策略
        generator.setGlobalConfig(globalConfig);
        
        // 4. 包配置
        PackageConfig packageConfig = new PackageConfig();
        packageConfig.setParent("com.reggie");
        packageConfig.setEntity("entity");
        packageConfig.setMapper("mapper");
        packageConfig.setService("service");
        packageConfig.setServiceImpl("service.impl");
        packageConfig.setController("controller");
        generator.setPackageInfo(packageConfig);
        
        // 5. 策略配置
        StrategyConfig strategy = new StrategyConfig();
        strategy.setInclude("user", "order", "product", "category"); // 要生成的表
        strategy.setTablePrefix("tbl_"); // 表前缀，生成实体类时会去掉
        strategy.setNaming(NamingStrategy.underline_to_camel); // 下划线转驼峰
        strategy.setColumnNaming(NamingStrategy.underline_to_camel);
        strategy.setEntityLombokModel(true); // 使用Lombok
        strategy.setRestControllerStyle(true); // RESTful风格
        strategy.setLogicDeleteFieldName("deleted"); // 逻辑删除字段
        strategy.setVersionFieldName("version"); // 乐观锁字段
        
        // 自动填充配置
        TableFill createTime = new TableFill("create_time", FieldFill.INSERT);
        TableFill updateTime = new TableFill("update_time", FieldFill.INSERT_UPDATE);
        strategy.setTableFillList(Arrays.asList(createTime, updateTime));
        
        generator.setStrategy(strategy);
        
        // 6. 模板配置（使用默认模板）
        TemplateConfig templateConfig = new TemplateConfig();
        templateConfig.setXml(null); // 不生成XML，使用MP的注解方式
        generator.setTemplate(templateConfig);
        
        // 7. 执行生成
        generator.execute();
    }
}
```



**生成的文件结构：**

text

```
src/main/java/com/reggie/
├── entity/
│   ├── User.java
│   ├── Order.java
│   ├── Product.java
│   └── Category.java
├── mapper/
│   ├── UserMapper.java
│   ├── OrderMapper.java
│   ├── ProductMapper.java
│   └── CategoryMapper.java
├── service/
│   ├── UserService.java
│   ├── OrderService.java
│   ├── ProductService.java
│   └── CategoryService.java
├── service/impl/
│   ├── UserServiceImpl.java
│   ├── OrderServiceImpl.java
│   ├── ProductServiceImpl.java
│   └── CategoryServiceImpl.java
└── controller/
    ├── UserController.java
    ├── OrderController.java
    ├── ProductController.java
    └── CategoryController.java
```



**生成的Controller示例：**

java

```java
@RestController
@RequestMapping("/user")
@Api(tags = "用户管理")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    @ApiOperation("根据ID查询用户")
    public Result<User> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        return Result.success(user);
    }
    
    @PostMapping
    @ApiOperation("新增用户")
    public Result<Boolean> save(@RequestBody User user) {
        boolean success = userService.save(user);
        return success ? Result.success() : Result.error("新增失败");
    }
    
    @PutMapping
    @ApiOperation("修改用户")
    public Result<Boolean> update(@RequestBody User user) {
        boolean success = userService.updateById(user);
        return success ? Result.success() : Result.error("修改失败");
    }
    
    @DeleteMapping("/{id}")
    @ApiOperation("删除用户")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean success = userService.removeById(id);
        return success ? Result.success() : Result.error("删除失败");
    }
    
    @GetMapping("/page")
    @ApiOperation("分页查询用户")
    public Result<IPage<User>> page(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name) {
        
        Page<User> pageInfo = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(name), User::getName, name);
        
        IPage<User> result = userService.page(pageInfo, wrapper);
        return Result.success(result);
    }
}
```



## 六、Service层CRUD：更便捷的操作

### 6.1 IService接口

java

```java
// 自定义Service接口
public interface UserService extends IService<User> {
    // 可以在这里定义自己的业务方法
    List<User> findActiveUsers();
}

// 实现类
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    @Override
    public List<User> findActiveUsers() {
        // 可以使用baseMapper（父类提供的）
        return baseMapper.selectList(new LambdaQueryWrapper<User>()
            .eq(User::getStatus, 1)
            .orderByDesc(User::getCreateTime));
    }
}

// 使用
@RestController
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/list")
    public Result<List<User>> list() {
        // IService提供的方法
        List<User> list = userService.list();
        return Result.success(list);
    }
    
    @PostMapping("/batch")
    public Result<Boolean> batchSave(@RequestBody List<User> users) {
        // 批量插入
        boolean success = userService.saveBatch(users);
        return Result.success(success);
    }
    
    @GetMapping("/page")
    public Result<IPage<User>> page(@RequestParam(defaultValue = "1") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        // 分页查询
        Page<User> pageInfo = new Page<>(page, size);
        IPage<User> result = userService.page(pageInfo);
        return Result.success(result);
    }
    
    @GetMapping("/count")
    public Result<Long> count() {
        // 计数
        long count = userService.count();
        return Result.success(count);
    }
    
    @GetMapping("/chain/{id}")
    public Result<User> getByIdChain(@PathVariable Long id) {
        // 链式查询
        User user = userService.lambdaQuery()
            .eq(User::getId, id)
            .ne(User::getDeleted, 1)
            .one();  // 查询一条
        
        return Result.success(user);
    }
    
    @PutMapping("/chain")
    public Result<Boolean> updateChain(@RequestBody User user) {
        // 链式更新
        boolean success = userService.lambdaUpdate()
            .eq(User::getId, user.getId())
            .set(User::getName, user.getName())
            .set(User::getAge, user.getAge())
            .update();
        
        return Result.success(success);
    }
}
```



### 6.2 批量操作的性能优化

java

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    // 批量插入（默认分批，每批1000条）
    public void batchInsertUsers(List<User> users) {
        // 方法1：简单批量插入
        saveBatch(users);  // 默认分批插入
        
        // 方法2：指定批次大小
        saveBatch(users, 500);  // 每500条一批
        
        // 方法3：带事务的批量插入
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        transactionTemplate.execute(status -> {
            try {
                saveBatch(users);
                return true;
            } catch (Exception e) {
                status.setRollbackOnly();
                throw new BusinessException("批量插入失败", e);
            }
        });
    }
    
    // 批量更新
    public void batchUpdateUsers(List<User> users) {
        // 方法1：逐条更新（适合少量数据）
        updateBatchById(users);
        
        // 方法2：使用SQL（适合大量数据）
        if (!users.isEmpty()) {
            // 构建CASE WHEN SQL
            StringBuilder sql = new StringBuilder();
            sql.append("UPDATE user SET name = CASE id ");
            
            List<Long> ids = new ArrayList<>();
            for (User user : users) {
                sql.append("WHEN ").append(user.getId()).append(" THEN '").append(user.getName()).append("' ");
                ids.add(user.getId());
            }
            
            sql.append("END WHERE id IN (");
            sql.append(StringUtils.join(ids, ","));
            sql.append(")");
            
            // 执行原生SQL
            baseMapper.executeUpdate(sql.toString());
        }
    }
}
```



## 七、实战经验与坑点总结

### 7.1 性能优化建议

java

```java
// 1. 避免N+1查询
// 错误做法
List<Order> orders = orderService.list();
for (Order order : orders) {
    User user = userService.getById(order.getUserId()); // 每个订单都查一次用户
    order.setUserName(user.getName());
}

// 正确做法：先批量查询，再建立映射
List<Order> orders = orderService.list();
List<Long> userIds = orders.stream()
    .map(Order::getUserId)
    .distinct()
    .collect(Collectors.toList());

Map<Long, User> userMap = userService.listByIds(userIds).stream()
    .collect(Collectors.toMap(User::getId, Function.identity()));

orders.forEach(order -> {
    User user = userMap.get(order.getUserId());
    if (user != null) {
        order.setUserName(user.getName());
    }
});

// 2. 合理使用索引
// 查询条件顺序应该和索引顺序一致
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getDeptId, 1)  // 假设索引是 (dept_id, status)
       .eq(User::getStatus, 1)
       .orderByAsc(User::getId);

// 3. 避免SELECT *
// 错误：查所有字段
List<User> users = userService.list();

// 正确：只查需要的字段
List<User> users = userService.lambdaQuery()
    .select(User::getId, User::getName, User::getAge)
    .list();
```



### 7.2 常见坑点及解决方案

java

```java
// 1. 字段名映射问题
@Data
public class User {
    // 数据库字段是 user_name，Java属性是 userName
    @TableField("user_name")  // 必须加这个注解！
    private String userName;
}

// 2. 枚举类型处理
public enum UserStatus {
    ACTIVE(1, "活跃"),
    INACTIVE(0, "禁用");
    
    private final Integer code;
    private final String desc;
    
    // 实体类中使用
    @TableField("status")
    private UserStatus status;
    
    // 需要配置枚举处理器
    @Configuration
    public class MybatisConfig {
        @Bean
        public MybatisPlusInterceptor mybatisPlusInterceptor() {
            MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
            // 添加枚举处理器
            interceptor.addInnerInterceptor(new EnumInnerInterceptor());
            return interceptor;
        }
    }
}

// 3. 分页总数查询慢
// 当表很大时，COUNT(*)会很慢
Page<User> page = new Page<>(1, 10);
page.setSearchCount(false);  // 不查询总数，提升性能

// 4. 逻辑删除的关联查询问题
// 当关联查询时，逻辑删除条件可能不会自动加上
@Select("SELECT u.*, d.name as dept_name FROM user u LEFT JOIN dept d ON u.dept_id = d.id")
List<UserVO> listWithDept();

// 解决方案：手动加上条件
@Select("SELECT u.*, d.name as dept_name FROM user u LEFT JOIN dept d ON u.dept_id = d.id WHERE u.deleted = 0")
List<UserVO> listWithDept();

// 5. 批量插入返回ID问题
List<User> users = new ArrayList<>();
// ... 添加用户

userService.saveBatch(users);
// 注意：批量插入后，users中的对象不会有ID（MySQL不支持批量返回ID）

// 解决方案：逐条插入或使用其他方式
for (User user : users) {
    userService.save(user);  // 这样才有ID
}
```



### 7.3 监控与调试

java

```java
// 1. 启用SQL日志
# application.yml
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 控制台打印SQL

// 2. 性能监控
@Aspect
@Component
@Slf4j
public class MybatisPlusMonitorAspect {
    
    @Around("execution(* com.baomidou.mybatisplus.core.mapper.BaseMapper.*(..))")
    public Object monitor(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            
            // 慢SQL告警
            if (duration > 1000) {
                log.warn("慢SQL警告: {} 执行耗时 {}ms", methodName, duration);
            }
            
            return result;
        } catch (Exception e) {
            log.error("SQL执行失败: {}", methodName, e);
            throw e;
        }
    }
}

// 3. 自定义SQL注入器（扩展MP功能）
@Component
public class MySqlInjector extends DefaultSqlInjector {
    
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass) {
        List<AbstractMethod> methodList = super.getMethodList(mapperClass);
        
        // 添加自定义方法
        methodList.add(new InsertBatchSomeColumn());  // 批量插入
        methodList.add(new LogicDeleteByIdWithFill()); // 逻辑删除填充字段
        
        return methodList;
    }
}

// 在配置中注册
@Bean
public MySqlInjector mySqlInjector() {
    return new MySqlInjector();
}
```



## 结语：从"工具使用者"到"效率创造者"

MyBatis-Plus的学习过程，让我从一个CRUD程序员，变成了一个思考如何提高开发效率的工程师。我学到的不仅仅是：

1. **减少重复代码**：代码生成器、BaseMapper、自动填充
2. **提高开发效率**：条件构造器、分页插件、Service封装
3. **增强代码质量**：类型安全的Lambda查询、乐观锁、逻辑删除
4. **统一开发规范**：注解配置、全局设置、最佳实践

更重要的是，我开始思考：**工具是为了解放生产力，而不是增加学习成本**。好的框架应该让开发者更专注于业务逻辑，而不是技术细节。

**现在回头看那些手写的SQL和XML，就像看到手工织布——虽然精细，但效率太低了。**

**MyBatis-Plus教给我最重要的一课是：优秀的工具不是让你少写代码，而是让你只写有价值的代码。** 把时间花在业务逻辑上，而不是重复的CRUD上。

与所有还在手写SQL的程序员共勉：**当你第三次写类似的CRUD代码时，就该考虑使用MyBatis-Plus了！**