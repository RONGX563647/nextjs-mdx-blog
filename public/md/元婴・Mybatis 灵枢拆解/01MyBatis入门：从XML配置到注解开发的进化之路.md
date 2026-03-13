## MyBatis入门：从XML配置到注解开发的进化之路

> MyBatis不是简单的ORM，而是灵活的SQL映射框架

### 开篇：为什么选择MyBatis？

在Java持久层框架中，MyBatis以其灵活性和强大的SQL控制能力脱颖而出。它不像Hibernate那样完全封装SQL，而是让开发者保持对SQL的控制权。

![MyBatis架构](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MyBatis%20architecture%2C%20SQL%20mapping%20framework%2C%20XML%20configuration%2C%20database%20interaction%2C%20Java%20persistence%20layer&image_size=square)

### XML配置：MyBatis的传统方式

XML配置是MyBatis最经典、最灵活的配置方式。

#### 1. 核心配置文件

```xml
<!-- mybatis-config.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/mybatis_db"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="com/example/mapper/UserMapper.xml"/>
    </mappers>
</configuration>
```

#### 2. Mapper接口

```java
// UserMapper.java
public interface UserMapper {
    User getUserById(int id);
    List<User> getAllUsers();
    void insertUser(User user);
    void updateUser(User user);
    void deleteUser(int id);
}
```

#### 3. XML映射文件

```xml
<!-- UserMapper.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    <select id="getUserById" resultType="com.example.entity.User">
        SELECT * FROM users WHERE id = #{id}
    </select>
    
    <select id="getAllUsers" resultType="com.example.entity.User">
        SELECT * FROM users
    </select>
    
    <insert id="insertUser" parameterType="com.example.entity.User">
        INSERT INTO users(name, age, email) VALUES(#{name}, #{age}, #{email})
    </insert>
    
    <update id="updateUser" parameterType="com.example.entity.User">
        UPDATE users SET name=#{name}, age=#{age}, email=#{email} WHERE id=#{id}
    </update>
    
    <delete id="deleteUser" parameterType="int">
        DELETE FROM users WHERE id=#{id}
    </delete>
</mapper>
```

### 注解开发：MyBatis的现代方式

随着Java注解的流行，MyBatis也提供了注解方式来简化配置。

```java
// UserMapper.java 使用注解
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User getUserById(int id);
    
    @Select("SELECT * FROM users")
    List<User> getAllUsers();
    
    @Insert("INSERT INTO users(name, age, email) VALUES(#{name}, #{age}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertUser(User user);
    
    @Update("UPDATE users SET name=#{name}, age=#{age}, email=#{email} WHERE id=#{id}")
    void updateUser(User user);
    
    @Delete("DELETE FROM users WHERE id=#{id}")
    void deleteUser(int id);
}
```

### 动态SQL：MyBatis的强大特性

动态SQL是MyBatis最强大的特性之一，它允许你根据条件动态构建SQL语句。

#### XML方式的动态SQL

```xml
<select id="getUsersByCondition" resultType="com.example.entity.User">
    SELECT * FROM users
    <where>
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="age != null">
            AND age = #{age}
        </if>
        <if test="email != null and email != ''">
            AND email LIKE CONCAT('%', #{email}, '%')
        </if>
    </where>
    <orderBy>
        <if test="orderBy != null and orderBy != ''">
            ORDER BY #{orderBy}
            <if test="orderDir != null and orderDir != ''">
                #{orderDir}
            </if>
        </if>
    </orderBy>
</select>
```

#### 注解方式的动态SQL

```java
@SelectProvider(type = UserSqlProvider.class, method = "getUsersByCondition")
List<User> getUsersByCondition(Map<String, Object> condition);

// SQL提供者类
class UserSqlProvider {
    public String getUsersByCondition(Map<String, Object> condition) {
        return new SQL() {
            {
                SELECT("*");
                FROM("users");
                if (condition.get("name") != null) {
                    WHERE("name LIKE CONCAT('%', #{name}, '%')");
                }
                if (condition.get("age") != null) {
                    WHERE("age = #{age}");
                }
                if (condition.get("email") != null) {
                    WHERE("email LIKE CONCAT('%', #{email}, '%')");
                }
                if (condition.get("orderBy") != null) {
                    ORDER_BY("#{orderBy} #{orderDir}");
                }
            }
        }.toString();
    }
}
```

### 结果映射：解决列名与属性名不一致

当数据库列名与Java实体类属性名不一致时，需要使用结果映射。

#### XML方式的结果映射

```xml
<resultMap id="userResultMap" type="com.example.entity.User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <result property="age" column="user_age"/>
    <result property="email" column="user_email"/>
</resultMap>

<select id="getUserById" resultMap="userResultMap">
    SELECT user_id, user_name, user_age, user_email FROM users WHERE user_id = #{id}
</select>
```

#### 注解方式的结果映射

```java
@Results({
    @Result(property = "id", column = "user_id", id = true),
    @Result(property = "name", column = "user_name"),
    @Result(property = "age", column = "user_age"),
    @Result(property = "email", column = "user_email")
})
@Select("SELECT user_id, user_name, user_age, user_email FROM users WHERE user_id = #{id}")
User getUserById(int id);
```

### 关联查询：处理复杂的数据关系

MyBatis提供了强大的关联查询能力，支持一对一、一对多等复杂关系。

```xml
<!-- 一对一关联 -->
<resultMap id="orderResultMap" type="com.example.entity.Order">
    <id property="id" column="order_id"/>
    <result property="orderNo" column="order_no"/>
    <result property="createTime" column="create_time"/>
    <association property="user" javaType="com.example.entity.User">
        <id property="id" column="user_id"/>
        <result property="name" column="user_name"/>
        <result property="email" column="user_email"/>
    </association>
</resultMap>

<!-- 一对多关联 -->
<resultMap id="userWithOrdersResultMap" type="com.example.entity.User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <collection property="orders" ofType="com.example.entity.Order">
        <id property="id" column="order_id"/>
        <result property="orderNo" column="order_no"/>
        <result property="createTime" column="create_time"/>
    </collection>
</resultMap>
```

### MyBatis-Plus：MyBatis的增强工具

MyBatis-Plus是一个MyBatis的增强工具，在MyBatis的基础上只做增强不做改变，为简化开发、提高效率而生。

```java
// 继承BaseMapper即可获得CRUD操作
public interface UserMapper extends BaseMapper<User> {
    // 自定义方法
}

// 服务层使用
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    // 业务方法
}
```

### 实战建议

1. **选择合适的配置方式**：
   - 简单SQL用注解，复杂SQL用XML
   - 动态SQL复杂时推荐XML方式

2. **优化SQL性能**：
   - 使用索引
   - 避免全表扫描
   - 合理使用缓存
   - 优化批量操作

3. **代码规范**：
   - 统一命名规范
   - 合理组织目录结构
   - 添加必要的注释
   - 使用参数验证

4. **错误处理**：
   - 捕获并处理SQL异常
   - 提供有意义的错误信息
   - 记录详细的日志

### 结语

MyBatis是一个灵活而强大的持久层框架，它既保留了SQL的灵活性，又提供了ORM的便利性。从XML配置到注解开发，MyBatis不断进化，适应现代Java开发的需求。

通过本文的学习，你应该对MyBatis有了一个全面的了解，从基本配置到高级特性，从XML到注解，从单表操作到复杂关联查询。

在实际项目中，合理使用MyBatis的各种特性，能够显著提高开发效率和系统性能。
