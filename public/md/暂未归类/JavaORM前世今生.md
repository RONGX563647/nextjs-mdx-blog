## 从“SQL泥潭”到“无感知开发”：Java主流ORM框架发展历程与核心知识点详解（超详细版）

### 引言

如果你是一名Java后端开发者，一定写过这样的代码：`Connection conn = null;`、`PreparedStatement ps = null;`、`ResultSet rs = null;`，然后是层层嵌套的try-catch-finally，最后还要在finally里手动关闭资源。稍有不慎，连接泄漏、资源未关闭、SQL注入等问题就会找上门来。

这就是JDBC时代的真实写照——**功能强大，但繁琐至极**。

为了解决这个痛点，Java世界在过去二十多年里涌现出无数ORM（Object Relational Mapping）框架。从早期的OJB、JDO，到称霸一时的Hibernate，再到后来居上的MyBatis，以及如今如日中天的MyBatis-Plus——这是一部开发者不断追求“更简单、更高效”的历史。

今天，我们顺着时间线，用最详尽的笔触，还原Java主流ORM框架从无到有、从群雄逐鹿到生态统一的完整历程。每个框架的核心技术点、设计思想、代码示例，以及当年开发者踩过的坑，我都会一一梳理清楚。


## 第一章：黎明前的黑暗——JDBC时代（1996-2000）

### 1.1 最原始的数据库操作

1996年，JDK 1.0发布，Java诞生。1997年，JDK 1.1引入了JDBC（Java Database Connectivity），这是Java操作关系型数据库的第一个标准API。

**一个典型的JDBC查询**：
```java
public User findUserById(Long id) {
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    User user = null;
    
    try {
        // 1. 加载驱动
        Class.forName("com.mysql.jdbc.Driver");
        
        // 2. 获取连接
        conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/test", 
            "root", 
            "password"
        );
        
        // 3. 创建语句
        ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
        ps.setLong(1, id);
        
        // 4. 执行查询
        rs = ps.executeQuery();
        
        // 5. 处理结果集
        if (rs.next()) {
            user = new User();
            user.setId(rs.getLong("id"));
            user.setName(rs.getString("name"));
            user.setEmail(rs.getString("email"));
            user.setAge(rs.getInt("age"));
        }
    } catch (ClassNotFoundException e) {
        e.printStackTrace();
    } catch (SQLException e) {
        e.printStackTrace();
    } finally {
        // 6. 关闭资源（最容易被遗忘的部分）
        try { if (rs != null) rs.close(); } catch (SQLException e) {}
        try { if (ps != null) ps.close(); } catch (SQLException e) {}
        try { if (conn != null) conn.close(); } catch (SQLException e) {}
    }
    
    return user;
}
```

### 1.2 JDBC的痛点

| 痛点 | 说明 |
|------|------|
| **代码冗余** | 每个数据库操作都要重复6个步骤，大量样板代码 |
| **资源管理繁琐** | 必须手动关闭Connection、Statement、ResultSet，容易泄漏 |
| **异常处理复杂** | SQLException是受检异常，必须捕获或抛出 |
| **结果集映射手动** | 需要手动从ResultSet中取字段，设置到对象 |
| **SQL与Java耦合** | SQL语句散落在Java代码中，难以维护 |
| **无缓存机制** | 每次查询都要访问数据库，性能低下 |
| **无事务抽象** | 事务管理全靠手动commit/rollback |

**当年开发者的心声**：
> “那时候写一个简单的CRUD，DAO层代码占了整个项目的三分之一。最怕的是finally块里忘记关闭连接，生产环境跑几天就报‘Too many connections’。后来干脆写了个工具类封装，但每个项目都要复制一遍，简直是噩梦。”

JDBC的这些问题，催生了ORM框架的诞生。


## 第二章：群雄逐鹿——早期ORM探索（2001-2005）

### 2.1 Apache OJB（2001）：第一个开源尝试

**对象关系桥（OJB）**是Apache软件基金会开发的开源Java ORM工具，发布于2001年，2005年成为Apache顶级项目。

**核心特性**：
- 支持JDO、JPA及底层PersistenceBroker API等多种持久化接口
- 通过XML映射文件动态配置元数据
- 支持正向工程、反向工程和映射生成三种方式建立对象-关系映射
- 提供事务管理、对象缓存及分布式锁治理

**历史地位**：OJB作为早期的开源ORM尝试，为后来的Hibernate等框架提供了参考。但因配置复杂、文档匮乏，最终未能成为主流。

### 2.2 Hibernate的诞生（2001-2002）：一个关于执着的故事

**2001年，澳大利亚悉尼**，Cirrus Technologies公司的会议桌上，一个年轻人和老板激烈争论：

小伙子：“老板，EJB的Entity Bean太复杂了，浪费了我大量时间。我觉得可以设计出比Entity Bean更好的方案。”

老板：“Gavin，别傻了，EJB是业界的标准。”

这个年轻人就是**Gavin King**。他当时确实没有任何用SQL开发数据库的经验——为了开发Hibernate，他去街上买了本SQL基础的书。

**Hibernate的核心设计理念**：
- **轻量级封装JDBC**，让程序员用对象编程思维操纵数据库
- 可以在任何使用JDBC的场合应用
- 目标是取代EJB CMP（Container-Managed Persistence）

### 2.3 Hibernate 1.x和2.x（2002-2005）：从默默无闻到声名鹊起

**Hibernate 1.x**（2002）：
- 实现基本的O/R映射功能
- 使用XML映射文件（.hbm.xml）定义对象-关系映射
- 支持HQL（Hibernate Query Language）面向对象查询

**Hibernate 2.x**（2003-2005）：
- 性能大幅优化
- 引入缓存机制（一级缓存、二级缓存）
- 支持延迟加载（Lazy Loading）
- 成为JBoss的一部分，获得商业支持

**Hibernate 2的映射文件示例**：
```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">

<hibernate-mapping>
    <class name="com.example.User" table="users">
        <id name="id" column="user_id">
            <generator class="native"/>
        </id>
        <property name="name" column="user_name" length="50"/>
        <property name="email" column="email_address"/>
        <property name="birthDate" column="birth_date" type="date"/>
    </class>
</hibernate-mapping>
```

### 2.4 iBatis的诞生（2002）：SQL优先的另一条路

在Hibernate走“全自动”ORM路线的同时，另一条“半自动”路线也在发展。

**iBatis**（名称来源于"internet"和"abatis"的组合）最初是Apache的一个开源项目，由Clinton Begin在2002年创建。

**iBatis的核心哲学**：不隐藏SQL，而是让开发者编写自己的SQL，框架负责映射参数和结果集。

**iBatis 1.x/2.x的特点**：
- **SQL Maps**：将SQL语句映射到Java对象
- **Data Access Objects（DAO）**：数据访问对象模式
- 比Hibernate更轻量，学习曲线更平缓
- 更适合遗留系统、需要精细SQL优化的场景

**iBatis的SQL映射文件示例**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN"
        "http://ibatis.apache.org/dtd/sql-map-2.dtd">

<sqlMap namespace="User">
    <select id="getUserById" parameterClass="int" resultClass="com.example.User">
        SELECT user_id as id, user_name as name, email
        FROM users
        WHERE user_id = #id#
    </select>
    
    <insert id="insertUser" parameterClass="com.example.User">
        INSERT INTO users (user_name, email)
        VALUES (#name#, #email#)
        <selectKey resultClass="int" keyProperty="id">
            SELECT LAST_INSERT_ID()
        </selectKey>
    </insert>
</sqlMap>
```

### 2.5 早期ORM时代的对比（2005年前后）

| 框架 | 类型 | 特点 | 适用场景 |
|------|------|------|----------|
| **Hibernate** | 全自动ORM | 对象化强、HQL强大、透明持久化 | 新项目、快速开发 |
| **iBatis** | 半自动SQL映射 | SQL可控、轻量、灵活 | 遗留系统、SQL优化 |
| **TopLink** | 商业ORM | 图形工具、Oracle集成 | Oracle数据库用户 |
| **JDO** | 规范 | 厂商中立、功能完备 | 需要避免厂商锁定 |
| **OJB** | 开源ORM | 早期尝试、支持多种API | 历史研究 |


## 第三章：Hibernate 3与JPA规范的诞生（2005-2009）

### 3.1 Hibernate 3的重大飞跃（2005）

**Hibernate 3**的发布是Java ORM史上的里程碑事件。

**核心新特性**：
- **属性级别的延迟加载**：之前只支持类的延迟加载
- **HQL增强**：支持更多的查询特性
- **过滤器（Filters）**：动态添加数据过滤条件
- **事件框架**：拦截器机制，可在持久化事件前后执行自定义逻辑
- **注解支持**（通过Hibernate Annotations项目）

**Hibernate 3的体系结构**：
```
Application
    ↓
    ↗ Hibernate API
SessionFactory ← Configuration
    ↓
Session → Transaction
    ↓
Query / Criteria
    ↓
    ↘ JDBC
Database
```

### 3.2 Gavin King加入EJB 3.0 EG：从民间走向官方

Gavin King加入EJB 3.0 EG（专家组），负责制订EJB 3.0的持久层规范，这是一个标志性事件。

**EJB 3.0 EntityBean与Hibernate的关系**：
- API接口不同，但设计理念完全来自于Hibernate
- JSR-220（EJB 3.0持久层规范）以Hibernate理念为基础
- Hibernate对EJB 3.0规范的跟随非常紧密，在规范制定过程中就不断发布参考实现

**JBoss的策略**：Hibernate未来以独立产品存在和发展，既可以outside EJB container使用，同时也做JBoss EntityBean Implementation。这意味着Hibernate实际上提供了两套API：
- **Hibernate原生API**：功能更强大，灵活度高
- **EJB 3.0兼容API**：符合标准，可移植性好

### 3.3 JPA 1.0的诞生（2006）

**JPA（Java Persistence API）**是EJB 3.0的一部分，2006年随Java EE 5发布。

**JPA的核心内容**：
1. **一套API标准**（javax.persistence包）：操作实体对象，执行CRUD操作
2. **JPQL（Java Persistence Query Language）**：面向对象的查询语言
3. **ORM元数据**：支持XML和JDK 5.0注解两种形式

**JPA与Hibernate的关系**：Hibernate成为了JPA的**实现提供者**（Provider）之一。JPA规范就像JDBC规范，Hibernate就像MySQL驱动——你写JPA标准代码，底层由Hibernate执行。

**JPA注解示例**：
```java
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_name", nullable = false, length = 50)
    private String name;
    
    @Column(unique = true)
    private String email;
    
    @Temporal(TemporalType.DATE)
    private Date birthDate;
    
    // getters/setters
}
```

### 3.4 JPA 2.0/2.1的演进（2009-2013）

**JPA 2.0**（2009，Java EE 6）：
- 引入Criteria API（类型安全的动态查询）
- 支持集合排序、分页
- 缓存API标准化

**JPA 2.1**（2013，Java EE 7）：
- 支持存储过程
- 实体图（Entity Graphs）控制加载策略
- 转换器（Converters）
- CDI集成

**Criteria API示例**：
```java
CriteriaBuilder cb = entityManager.getCriteriaBuilder();
CriteriaQuery<Employee> query = cb.createQuery(Employee.class);
Root<Employee> root = query.from(Employee.class);
query.select(root)
     .where(cb.equal(root.get(Employee_.department), "IT"))
     .orderBy(cb.asc(root.get(Employee_.name)));

List<Employee> result = entityManager.createQuery(query).getResultList();
```

### 3.5 这一时期的技术对比

| 框架 | 编程模型 | 查询方式 | 优势 |
|------|----------|----------|------|
| **Hibernate原生** | 对象化 | HQL、Criteria | 功能强大、灵活 |
| **JPA + Hibernate** | 标准化 | JPQL、Criteria | 可移植、规范 |
| **iBatis** | SQL映射 | 原生SQL | 精细控制、优化 |


## 第四章：MyBatis的崛起与MyBatis-Plus的萌芽（2010-2016）

### 4.1 iBatis → MyBatis：品牌重塑（2010）

**2010年6月**，iBatis项目从Apache Software Foundation迁移到Google Code。随着开发团队转投Google Code旗下，iBatis 3.x正式更名为**MyBatis**。

**更名背后的意义**：
- 摆脱Apache的品牌束缚
- 开启独立发展之路
- 重新定位为“SQL映射框架”而非ORM

**2013年11月**，MyBatis代码迁移到GitHub，社区活跃度持续提升。

### 4.2 MyBatis 3.x的核心特性

MyBatis 3.x是一次重大重写，引入了大量新特性：

**1. 动态SQL**
```xml
<select id="findUsers" parameterType="map" resultType="User">
    SELECT * FROM users
    <where>
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="age != null">
            AND age = #{age}
        </if>
        <choose>
            <when test="orderBy != null">
                ORDER BY ${orderBy}
            </when>
            <otherwise>
                ORDER BY id
            </otherwise>
        </choose>
    </where>
</select>
```

**2. 注解支持**
```java
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User selectUser(int id);
    
    @Insert("INSERT INTO users(name, email) VALUES(#{name}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertUser(User user);
}
```

**3. 接口式编程**
```java
// 无需实现类，MyBatis自动生成代理
UserMapper mapper = sqlSession.getMapper(UserMapper.class);
User user = mapper.selectUser(1);
```

### 4.3 MyBatis的设计哲学：SQL优先，可控为王

**为什么开发者选择MyBatis？**

| 维度 | Hibernate/JPA | MyBatis |
|------|---------------|---------|
| **SQL生成** | 自动生成 | 手动编写 |
| **优化控制** | 难（需绕过框架） | 完全控制 |
| **复杂查询** | 需要HQL/JPQL学习 | 直接用SQL |
| **性能调优** | 黑盒 | 白盒 |
| **学习曲线** | 陡峭 | 平缓 |

### 4.4 MyBatis-Plus的前身：代码生成器（2012）

**2012年**，一个名为**MyBatis-Plus-Generator**的代码生成器由Javen开发并在GitHub上发布。这个代码生成器能够根据数据库表结构自动生成MyBatis的实体类、Mapper接口和XML映射文件，大大提高了开发效率。

当时，这只是一个小工具，没人想到它会成为未来统治中国的ORM框架。

### 4.5 Spring Data项目的诞生（2010）

Spring Data项目是从2010年发展起来的，其目标是**提供一个大家熟悉的、一致的、基于Spring的数据访问编程模型，同时仍然保留底层数据存储的特殊特性**。

**Spring Data JPA**作为其子项目，对JPA进行了进一步抽象：

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // 根据方法名自动推导查询
    List<User> findByLastName(String lastName);
    
    // 分页查询
    Page<User> findByAgeGreaterThan(int age, Pageable pageable);
    
    // 自定义JPQL
    @Query("SELECT u FROM User u WHERE u.email LIKE %?1%")
    List<User> findByEmailDomain(String domain);
}

// 使用
@Autowired
private UserRepository userRepository;

public void demo() {
    // 无需实现类，直接使用
    User user = userRepository.save(new User("张三"));
    List<User> list = userRepository.findByLastName("张");
}
```

### 4.6 MyBatis-Plus的独立发展（2016）

**2016年初**，MyBatis-Plus项目初始创建，由baomidou（苞米豆）团队发起，旨在解决MyBatis使用过程中的繁琐代码和重复性工作，提供更便捷的CRUD操作和通用的查询功能。MyBatis-Plus的名称直接表明了它与MyBatis的关系，即**在MyBatis的基础上做了增强，而不是替代或改变MyBatis的原有功能**。

**2016年**，MyBatis-Plus发布了第一个独立版本。这个版本提供了一系列的增强功能，包括：
- **通用Mapper**：继承BaseMapper即可获得20+ CRUD方法
- **分页插件**：基于MyBatis物理分页
- **逻辑删除**：支持软删除功能
- **自动填充**：自动填充创建时间、更新时间等字段


## 第五章：MyBatis-Plus的爆发与生态统一（2017-2022）

### 5.1 MyBatis-Plus 2.0（2017）：功能全面扩展

**2017年**，MyBatis-Plus发布了2.0版本，引入了更多的增强功能：

| 功能 | 说明 |
|------|------|
| **性能分析插件** | 输出SQL执行时间，定位慢查询 |
| **动态表名** | 支持分表场景下的动态表名切换 |
| **多租户支持** | 内置多租户SQL解析器 |
| **全局拦截器** | 可自定义SQL拦截器 |
| **ActiveRecord模式** | 实体类直接操作数据库 |

**ActiveRecord模式示例**：
```java
@TableName("user")
public class User extends Model<User> {
    @TableId
    private Long id;
    private String name;
    private Integer age;
    
    // getters/setters
}

// 直接通过实体类操作
User user = new User();
user.setName("张三");
user.insert();  // 插入

User found = user.selectById(1);  // 查询
```

### 5.2 MyBatis-Plus 3.0（2018）：Lambda时代

**2018年**，MyBatis-Plus发布了3.0版本：

**1. Lambda表达式查询**
```java
// 传统方式（字符串硬编码，容易写错）
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("name", "张三").gt("age", 18);

// Lambda方式（类型安全，编译期检查）
LambdaQueryWrapper<User> lambdaWrapper = new LambdaQueryWrapper<>();
lambdaWrapper.eq(User::getName, "张三")
             .gt(User::getAge, 18);

List<User> users = userMapper.selectList(lambdaWrapper);
```

**2. 代码生成器可视化界面**：提供图形化配置界面

**3. 全新的分页模型**：IPage接口，支持物理分页

```java
@GetMapping("/list")
public IPage<User> list(Page<User> page) {
    // 自动生成LIMIT分页SQL
    return userService.page(page);
}
```

### 5.3 MyBatis-Plus 3.1-3.5（2019-2022）：持续进化

| 版本 | 年份 | 新特性 |
|------|------|--------|
| **3.1** | 2019 | 多数据源支持、全局拦截器 |
| **3.2** | 2020 | 多租户数据隔离、性能优化 |
| **3.3** | 2021 | 完善功能、修复bug |
| **3.4** | 2021 | 支持mybatis 3.5.x |
| **3.5** | 2022 | 适配Spring Boot 3、JDK 17 |

### 5.4 MyBatis-Plus的核心原理

**MyBatis-Plus如何工作？**

**初始化阶段**：
1. `SqlSessionFactoryBuilder`构建`SqlSessionFactory`
2. 配置文件被解析，配置MP的各种行为（分页插件、乐观锁插件等）
3. 扫描继承`BaseMapper`的接口，自动注入通用CRUD方法

**执行阶段**：
1. 开发者调用Mapper接口方法
2. 根据方法名和参数，自动生成对应的SQL语句
3. 通过`SqlSession`执行SQL
4. 结果映射到Java对象

**特殊功能实现**：
- **分页功能**：通过拦截器自动添加分页信息到SQL语句
- **性能分析**：拦截器记录SQL执行时间和慢查询
- **条件构造器**：基于`Wrapper`抽象类，将条件表达式转换为SQL片段
- **乐观锁**：通过`@Version`注解和拦截器实现版本控制

### 5.5 MyBatis-Plus vs 原生MyBatis：代码量对比

**原生MyBatis实现CRUD**：
```java
// Mapper接口
public interface UserMapper {
    User selectById(Long id);
    List<User> selectAll();
    int insert(User user);
    int updateById(User user);
    int deleteById(Long id);
}

// XML映射文件
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    <select id="selectById" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <select id="selectAll" resultType="User">
        SELECT * FROM user
    </select>
    
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO user(name, age, email) VALUES(#{name}, #{age}, #{email})
    </insert>
    
    <update id="updateById">
        UPDATE user SET name=#{name}, age=#{age}, email=#{email} WHERE id=#{id}
    </update>
    
    <delete id="deleteById">
        DELETE FROM user WHERE id=#{id}
    </delete>
</mapper>
```

**MyBatis-Plus实现CRUD**：
```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 无需任何代码，继承即拥有所有CRUD方法
}

// 使用
@Autowired
private UserMapper userMapper;

public void demo() {
    User user = userMapper.selectById(1L);
    List<User> list = userMapper.selectList(null);
    userMapper.insert(newUser);
    userMapper.updateById(user);
    userMapper.deleteById(1L);
}
```

**代码量对比**：MyBatis-Plus使CRUD代码量减少80%以上。


## 第六章：MyBatis-Plus的统治时代（2023-2026）

### 6.1 2025年市场格局

根据2025年底的真实数据：

| 框架 | 中国互联网使用率 | 评价 |
|------|-----------------|------|
| **MyBatis** | 90%+ | “老子就想写 SQL，别的别管我！” |
| **MyBatis-Plus** | 80%+ | “MyBatis 的神级增强版，增删改查一行代码” |
| **Hibernate** | < 3% | “全自动 ORM，牛逼是牛逼，但 SQL 被它玩坏了” |
| **Spring Data JPA** | ~8% | “写 Java 代码就能操作数据库，爽但性能拉胯” |

**2025年真实结论**：
- 新项目 99.9% 选 **MyBatis-Plus + Spring Boot 3**
- Hibernate 基本只存在于 10 年以上银行/政府老系统
- Spring Data JPA 国外用得多，国内大厂基本不用（SQL 不可控）
- 大厂核心系统：**MyBatis**（手写 SQL 极致性能）+ **MyBatis-Plus**（业务代码）

### 6.2 MyBatis-Plus的核心功能体系（2026版）

#### 6.2.1 BaseMapper：20+ CRUD方法

```java
public interface BaseMapper<T> {
    // 插入
    int insert(T entity);
    
    // 删除
    int deleteById(Serializable id);
    int deleteByMap(Map<String, Object> columnMap);
    int delete(Wrapper<T> queryWrapper);
    int deleteBatchIds(Collection<? extends Serializable> idList);
    
    // 更新
    int updateById(T entity);
    int update(T entity, Wrapper<T> updateWrapper);
    
    // 查询
    T selectById(Serializable id);
    List<T> selectBatchIds(Collection<? extends Serializable> idList);
    List<T> selectByMap(Map<String, Object> columnMap);
    T selectOne(Wrapper<T> queryWrapper);
    Integer selectCount(Wrapper<T> queryWrapper);
    List<T> selectList(Wrapper<T> queryWrapper);
    List<Map<String, Object>> selectMaps(Wrapper<T> queryWrapper);
    List<Object> selectObjs(Wrapper<T> queryWrapper);
    
    // 分页
    <E extends IPage<T>> E selectPage(E page, Wrapper<T> queryWrapper);
    <E extends IPage<Map<String, Object>>> E selectMapsPage(E page, Wrapper<T> queryWrapper);
}
```

#### 6.2.2 条件构造器（Wrapper）体系

**Wrapper类层次结构**：
```
Wrapper (抽象类)
    ├── AbstractWrapper
    │   ├── QueryWrapper (字符串形式)
    │   └── UpdateWrapper (更新条件)
    └── AbstractLambdaWrapper
        ├── LambdaQueryWrapper (Lambda形式)
        └── LambdaUpdateWrapper (Lambda更新)
```

**常用条件方法**：

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq` | 等于 | `wrapper.eq("name", "张三")` |
| `ne` | 不等于 | `wrapper.ne("age", 20)` |
| `gt` | 大于 | `wrapper.gt("age", 18)` |
| `ge` | 大于等于 | `wrapper.ge("age", 20)` |
| `lt` | 小于 | `wrapper.lt("age", 65)` |
| `le` | 小于等于 | `wrapper.le("age", 65)` |
| `between` | 介于 | `wrapper.between("age", 18, 30)` |
| `like` | 模糊匹配 | `wrapper.like("name", "张")` |
| `in` | 包含 | `wrapper.in("age", Arrays.asList(18,20,22))` |
| `isNull` | 为NULL | `wrapper.isNull("email")` |
| `orderByAsc` | 升序 | `wrapper.orderByAsc("age")` |
| `orderByDesc` | 降序 | `wrapper.orderByDesc("create_time")` |
| `select` | 指定查询列 | `wrapper.select("id", "name")` |

**复杂查询示例**：
```java
// 查询年龄在18-30之间，姓名包含"张"，按年龄降序的用户
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.between(User::getAge, 18, 30)
       .like(User::getName, "张")
       .orderByDesc(User::getAge);

List<User> users = userMapper.selectList(wrapper);
```

#### 6.2.3 分页插件

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        return interceptor;
    }
}

// 使用分页
@GetMapping("/users")
public IPage<User> listUsers(@RequestParam(defaultValue = "1") int page,
                              @RequestParam(defaultValue = "10") int size) {
    Page<User> pageParam = new Page<>(page, size);
    return userMapper.selectPage(pageParam, null);
    // 自动生成：SELECT * FROM user LIMIT (page-1)*size, size
}
```

#### 6.2.4 逻辑删除

```java
@Data
@TableName("user")
public class User {
    @TableId
    private Long id;
    private String name;
    
    @TableLogic  // 逻辑删除注解
    private Integer deleted;  // 0-未删除，1-已删除
}

// 删除操作
userMapper.deleteById(1L);  // 实际执行：UPDATE user SET deleted=1 WHERE id=1

// 查询操作自动过滤已删除
userMapper.selectList(null);  // 实际执行：SELECT * FROM user WHERE deleted=0
```

#### 6.2.5 自动填充

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        // 插入时自动填充创建时间和更新时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        // 更新时自动填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}

@Data
@TableName("user")
public class User {
    @TableId
    private Long id;
    private String name;
    
    @TableField(fill = FieldFill.INSERT)  // 插入时填充
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)  // 插入和更新时填充
    private LocalDateTime updateTime;
}
```

#### 6.2.6 乐观锁

```java
@Entity
public class User {
    @Version  // 乐观锁注解
    private Integer version;
    
    private Integer stock;  // 库存
}

// 更新时自动检查version
User user = userMapper.selectById(1);
user.setStock(user.getStock() - 1);
userMapper.updateById(user);
// 实际执行：UPDATE user SET stock=stock-1, version=version+1 WHERE id=1 AND version=旧version
// 如果version被其他线程修改，更新失败，返回0
```

#### 6.2.7 代码生成器

```java
// 快速生成器
FastAutoGenerator.create("jdbc:mysql://localhost:3306/mybatis-plus", "root", "password")
    .globalConfig(builder -> builder
        .outputDir("D://code")  // 输出目录
        .author("张三")          // 作者
        .enableSwagger()         // 开启swagger
    )
    .packageConfig(builder -> builder
        .parent("com.example")   // 父包名
        .entity("entity")        // 实体类包名
        .mapper("mapper")        // mapper包名
        .service("service")      // service包名
        .controller("controller") // controller包名
    )
    .strategyConfig(builder -> builder
        .addInclude("user", "order")  // 需要生成的表
        .addTablePrefix("t_")         // 表前缀过滤
        .entityBuilder()
        .enableLombok()                // 启用Lombok
        .enableChainModel()            // 启用链式模型
        .controllerBuilder()
        .enableRestStyle()              // 启用Rest风格
    )
    .execute();
```

### 6.3 MyBatis-Plus的优缺点深度解析

#### 6.3.1 核心优势

**1. 开发效率质变提升**：代码量减少60%以上，CRUD操作一行代码搞定

**2. 性能优化与扩展性**：
- 内置分页插件实现物理分页，避免内存分页
- 乐观锁插件自动实现版本控制
- 性能分析插件快速定位慢查询

**3. 链式查询与Lambda表达式的类型安全**：
```java
// 编译期检查字段名，避免运行时错误
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三")  // 如果字段不存在，编译报错
       .gt(User::getAge, 18);
```

**4. 无侵入设计**：只做增强不做改变，可以与原生MyBatis共存

#### 6.3.2 局限性

**1. 复杂SQL的灵活性受限**

当需要多表关联、子查询、复杂统计时，Wrapper的表达能力不足：

```xml
<!-- 传统MyBatis可以写复杂SQL -->
<select id="selectAboveAvgAge" resultType="User">
    SELECT * FROM user 
    WHERE age > (SELECT AVG(age) FROM user) 
    AND dept_id = (SELECT id FROM dept WHERE name = '技术部')
</select>

<!-- MyBatis-Plus的Wrapper难以表达这种嵌套 -->
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.gt(User::getAge, "(SELECT AVG(age) FROM user)") // 不推荐，会生成字面量
       .eq(User::getDeptId, "(SELECT id FROM dept WHERE name = '技术部')");
```

**2. 过度封装导致的失控风险**：
- 自动生成的SQL可能不是最优的
- 可能诱导开发者忽视批量查询、缓存优化等性能关键点
- 掩盖数据库设计的缺陷

**3. 学习成本**：Wrapper体系、插件机制等需要额外学习

### 6.4 最佳实践：分层使用

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    // 基础CRUD用BaseMapper
    // 复杂查询用自定义方法
    
    @Select("SELECT * FROM user WHERE age > (SELECT AVG(age) FROM user)")
    List<User> selectAboveAvgAge();
    
    List<User> selectComplexReport(@Param("param") ReportParam param);
}

<!-- UserMapper.xml -->
<select id="selectComplexReport" resultType="User">
    SELECT u.*, d.name as deptName
    FROM user u
    LEFT JOIN dept d ON u.dept_id = d.id
    WHERE u.age > #{param.minAge}
    AND u.create_time BETWEEN #{param.startTime} AND #{param.endTime}
    <if test="param.deptId != null">
        AND u.dept_id = #{param.deptId}
    </if>
</select>
```


## 第七章：ORM框架演进全景图

### 7.1 发展时间线

| 年份 | Hibernate | MyBatis | MyBatis-Plus | JPA规范 | Spring Data |
|------|-----------|---------|--------------|---------|-------------|
| 2001 | Hibernate项目启动 | - | - | - | - |
| 2002 | Hibernate 1.x | iBatis 1.x | - | - | - |
| 2003 | Hibernate 2.x | iBatis 2.x | - | - | - |
| 2005 | Hibernate 3.0 | - | - | JPA 1.0 | - |
| 2006 | 成为JPA实现 | - | - | Java EE 5 | - |
| 2009 | Hibernate 3.5 | - | - | JPA 2.0 | - |
| 2010 | - | iBatis → MyBatis | - | - | Spring Data启动 |
| 2011 | Hibernate 4.0 | MyBatis 3.0 | - | - | Spring Data JPA 1.0 |
| 2012 | - | - | MP代码生成器（前身） | - | - |
| 2013 | Hibernate 4.3 | MyBatis迁移GitHub | - | JPA 2.1 | - |
| 2015 | Hibernate 5.0 | MyBatis 3.4 | - | - | Spring Data JPA 1.10 |
| 2016 | - | - | MyBatis-Plus 1.0 | - | - |
| 2017 | Hibernate 5.2 | MyBatis 3.5 | MyBatis-Plus 2.0 | JPA 2.2 | Spring Data JPA 2.0 |
| 2018 | - | - | MyBatis-Plus 3.0 | - | - |
| 2019 | Hibernate 6.0开发 | - | MyBatis-Plus 3.1 | JPA 3.0 | - |
| 2021 | Hibernate 6.0 | - | MyBatis-Plus 3.4 | - | - |
| 2022 | Hibernate 6.1 | MyBatis 3.5.11 | MyBatis-Plus 3.5 | JPA 3.1 | Spring Data JPA 3.0 |
| 2025 | Hibernate 6.5+ | MyBatis 3.5.19 | MyBatis-Plus 3.5.8 | - | Spring Data JPA 3.3+ |

### 7.2 框架特性对比（2026版）

| 特性 | Hibernate | JPA + Hibernate | MyBatis | MyBatis-Plus | Spring Data JPA |
|------|-----------|-----------------|---------|--------------|-----------------|
| **类型** | 全自动ORM | 规范+实现 | 半自动SQL映射 | MyBatis增强 | 抽象层 |
| **开发效率** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **SQL控制权** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **学习曲线** | 陡峭 | 中等 | 平缓 | 平缓 | 中等 |
| **复杂查询** | HQL/JPQL | JPQL | 原生SQL | 原生SQL | JPQL/原生 |
| **动态查询** | Criteria | Criteria | 动态SQL | 条件构造器 | Specifications |
| **性能优化** | 缓存、批处理 | 同左 | SQL优化 | SQL优化+插件 | 依赖JPA实现 |
| **多表关联** | @OneToMany等 | 同左 | 手写SQL | 手写SQL | @OneToMany等 |
| **分页** | Query对象 | Query对象 | 插件/手写 | 内置分页插件 | PageRequest |
| **代码生成** | 工具 | 工具 | 工具 | 内置代码生成器 | 工具 |
| **国内市场份额** | <3% | <8% | 90%+ | 80%+ | <8% |

### 7.3 技术选型决策树（2026版）

```
开始
├─ 新项目，无历史包袱？
│   ├─ 是 → 国内团队？ → 是 → MyBatis-Plus（90%场景首选）
│   │                    → 否 → 国外团队 → Spring Data JPA
│   └─ 否 → 遗留系统？
│       ├─ 是 → 已用MyBatis？ → 是 → 保留MyBatis，局部引入MP
│       │                    → 否 → 已用Hibernate？ → 继续使用，考虑JPA
│       └─ 否 → 需要SQL精细控制？
│           ├─ 是 → 复杂查询、性能极致 → 原生MyBatis
│           └─ 否 → 简单CRUD为主 → MyBatis-Plus
├─ 分库分表需求？
│   ├─ 是 → MyBatis + ShardingSphere 或 MyBatis-Plus + ShardingSphere
│   └─ 否 → 继续上述判断
├─ 响应式需求？
│   ├─ 是 → Spring Data R2DBC 或 Hibernate Reactive
│   └─ 否 → 继续上述判断
├─ 云原生/Serverless？
│   ├─ 是 → 考虑MyBatis-Plus（原生镜像友好）
│   └─ 否 → 正常选型
```

**一句话总结**：国内新项目首选**MyBatis-Plus**，大厂核心系统**MyBatis + MyBatis-Plus**混合使用，国外项目**Spring Data JPA**，老银行项目**Hibernate**。


## 第八章：面试题库

### 5道难度递增的基础面试题

#### 第1题：什么是ORM？为什么要使用ORM？

**难度**：⭐

**参考答案**：

ORM（Object Relational Mapping）是对象关系映射，用于解决面向对象编程语言与关系数据库之间的“阻抗不匹配”问题。

**使用ORM的原因**：
1. **提高开发效率**：减少重复的JDBC代码
2. **对象化操作**：可以用面向对象思维操作数据库
3. **屏蔽数据库差异**：可移植性好
4. **提供缓存、延迟加载等高级特性**

**阻抗不匹配示例**：
- 面向对象：继承、多态、引用
- 关系模型：外键、表连接、范式

#### 第2题：Hibernate、MyBatis和MyBatis-Plus有什么区别？

**难度**：⭐⭐

**参考答案**：

| 维度 | Hibernate | MyBatis | MyBatis-Plus |
|------|-----------|---------|--------------|
| **定位** | 全自动ORM框架 | 半自动SQL映射框架 | MyBatis增强工具 |
| **SQL生成** | 自动生成 | 手动编写 | 自动生成+手动 |
| **CRUD操作** | 需定义 | 需定义 | 继承BaseMapper即得20+方法 |
| **开发效率** | 高 | 中 | 极高 |
| **SQL控制** | 弱 | 强 | 较强（可回退原生） |
| **学习曲线** | 陡峭 | 平缓 | 平缓 |
| **复杂查询** | HQL/JPQL | 原生SQL | 原生SQL |
| **分页** | Query对象 | 插件/手写 | 内置分页插件 |
| **代码生成** | 工具 | 工具 | 内置代码生成器 |
| **国内市场** | <3% | 90%+ | 80%+ |

**一句话总结**：Hibernate让你少写SQL但失去控制，MyBatis让你写SQL但完全可控，MyBatis-Plus在MyBatis基础上让你少写80%的SQL。

#### 第3题：MyBatis-Plus的BaseMapper提供了哪些功能？它是如何实现的？

**难度**：⭐⭐⭐

**参考答案**：

**BaseMapper是MyBatis-Plus的核心接口**，提供了20+常用CRUD方法：

```java
public interface BaseMapper<T> {
    int insert(T entity);
    int deleteById(Serializable id);
    int updateById(T entity);
    T selectById(Serializable id);
    List<T> selectList(Wrapper<T> queryWrapper);
    Integer selectCount(Wrapper<T> queryWrapper);
    IPage<T> selectPage(IPage<T> page, Wrapper<T> queryWrapper);
    // ... 更多方法
}
```

**实现原理**：

1. **初始化阶段**：MyBatis-Plus启动时，扫描继承`BaseMapper`的接口
2. **SQL自动注入**：通过`ISqlInjector`接口，为每个方法自动注入对应的SQL语句
3. **方法代理**：MyBatis的MapperProxy会代理这些方法，执行时调用注入的SQL
4. **条件构造器**：`Wrapper`对象在运行时被解析为SQL片段，拼接到自动生成的SQL中

**关键源码组件**：
- `AbstractSqlInjector`：SQL注入器
- `AbstractMethod`：每个CRUD方法对应一个实现类（如`Insert`、`SelectById`）
- `MybatisMapperProxy`：方法代理类

#### 第4题：MyBatis-Plus的条件构造器（Wrapper）是如何工作的？Lambda形式有什么优势？

**难度**：⭐⭐⭐⭐

**参考答案**：

**Wrapper的工作流程**：

1. **创建Wrapper对象**：`LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();`
2. **链式调用添加条件**：`wrapper.eq(User::getName, "张三").gt(User::getAge, 18)`
3. **条件存储**：每个条件被封装成`QueryCondition`对象，存入`List`
4. **SQL生成**：执行`selectList`时，MyBatis-Plus遍历条件列表，拼接成WHERE子句
5. **参数绑定**：条件值通过`#{paramName}`形式绑定到PreparedStatement

**Lambda形式的优势**：

| 维度 | 传统字符串形式 | Lambda形式 |
|------|---------------|------------|
| **字段引用** | `"name"`（硬编码） | `User::getName`（方法引用） |
| **编译期检查** | 无，拼写错误运行时才报 | 有，字段不存在编译失败 |
| **重构友好** | 字段改名需手动改所有字符串 | 自动同步 |
| **类型安全** | 无 | 有 |
| **代码提示** | 无 | IDE自动补全 |

**示例对比**：
```java
// 字符串形式（容易写错，运行时才暴露）
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("nmae", "张三")  // 拼写错误，运行时才报错

// Lambda形式（编译期检查）
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三")  // 编译期检查字段是否存在
```

#### 第5题：MyBatis-Plus的分页插件是如何实现的？与手动LIMIT分页有什么区别？

**难度**：⭐⭐⭐⭐⭐

**参考答案**：

**MyBatis-Plus分页插件的实现原理**：

1. **插件注册**：配置`PaginationInnerInterceptor`，继承MyBatis的`Interceptor`接口
2. **SQL拦截**：拦截`Executor`的`query`方法，检测参数中是否有`Page`对象
3. **SQL解析**：使用`JsqlParser`解析原始SQL，获取其结构
4. **SQL改写**：
   - 生成count查询：将原始SQL包装为`SELECT COUNT(1) FROM (原始SQL) temp`
   - 生成分页查询：根据数据库方言，添加`LIMIT`、`OFFSET`或`ROWNUM`等分页语句
5. **结果封装**：执行两个查询，将结果封装到`Page`对象中（包含total和records）

**伪代码实现**：
```java
public class PaginationInnerInterceptor implements Interceptor {
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object[] args = invocation.getArgs();
        MappedStatement ms = (MappedStatement) args[0];
        Object parameter = args[1];
        
        // 检测是否有Page参数
        Page page = findPage(parameter);
        if (page == null) {
            return invocation.proceed();
        }
        
        // 获取原始SQL
        BoundSql boundSql = ms.getBoundSql(parameter);
        String originalSql = boundSql.getSql();
        
        // 执行count查询
        String countSql = "SELECT COUNT(1) FROM (" + originalSql + ") temp";
        Long total = executeCountQuery(countSql, parameter);
        page.setTotal(total);
        
        // 执行分页查询
        String pageSql = generatePageSql(originalSql, page);
        args[2] = new BoundSql(pageSql); // 替换SQL
        List records = (List) invocation.proceed();
        page.setRecords(records);
        
        return page;
    }
}
```

**与手动LIMIT分页的区别**：

| 维度 | 手动LIMIT分页 | MyBatis-Plus分页插件 |
|------|--------------|---------------------|
| **代码量** | 多（需手写COUNT和分页SQL） | 少（一行代码） |
| **数据库兼容** | 需针对不同数据库改写SQL | 自动适配多种数据库 |
| **总记录数** | 需手动查询COUNT | 自动查询并封装 |
| **性能** | 可能多一次查询 | 同样多一次查询，但自动优化 |
| **动态排序** | 需手动拼接 | 支持Page对象传入排序条件 |
| **复杂查询** | 可完全控制 | 对于复杂SQL可能解析错误 |

**使用示例**：
```java
@GetMapping("/users")
public IPage<User> listUsers(Page<User> page) {
    // 前端传入page参数（page、size、排序字段）
    return userService.page(page);
    // 自动执行COUNT和分页查询
}
```


### 3道实战场景题

#### 场景1：MyBatis-Plus复杂报表查询

**场景描述**：你需要实现一个销售报表接口，需要按年、月、日统计销售额，并支持多维度钻取（按产品线、按区域、按渠道）。数据量很大（千万级）。你会如何设计？

**考察点**：MyBatis-Plus复杂查询处理、性能优化

**参考思路**：

**方案1：自定义SQL + MyBatis-Plus（推荐）**

```java
@Mapper
public interface SalesReportMapper extends BaseMapper<SalesOrder> {
    
    List<SalesReportDTO> queryReport(@Param("param") ReportQueryParam param);
}
```

```xml
<select id="queryReport" resultType="SalesReportDTO">
    SELECT 
        <choose>
            <when test="param.groupBy == 'day'">DATE(create_time) as date</when>
            <when test="param.groupBy == 'month'">DATE_FORMAT(create_time, '%Y-%m') as date</when>
            <when test="param.groupBy == 'year'">YEAR(create_time) as date</when>
        </choose>
        ,product_line as productLine
        ,region
        ,channel
        ,SUM(amount) as totalAmount
        ,COUNT(*) as orderCount
    FROM sales_order
    <where>
        <if test="param.startDate != null">
            AND create_time >= #{param.startDate}
        </if>
        <if test="param.endDate != null">
            AND create_time < #{param.endDate}
        </if>
        <if test="param.productLine != null">
            AND product_line = #{param.productLine}
        </if>
        <if test="param.region != null">
            AND region = #{param.region}
        </if>
    </where>
    GROUP BY date, product_line, region, channel
    ORDER BY date DESC
</select>
```

**方案2：使用MyBatis-Plus的流式查询处理大数据**

```java
@Select("SELECT * FROM sales_order WHERE create_time BETWEEN #{start} AND #{end}")
@Options(fetchSize = 1000, resultSetType = ResultSetType.FORWARD_ONLY)
void streamLargeData(@Param("start") Date start, @Param("end") Date end, 
                     ResultHandler<SalesOrder> handler);

// 使用
sqlSession.select("streamLargeData", params, context -> {
    SalesOrder order = context.getResultObject();
    // 逐条处理，避免内存溢出
    aggregateResult(order);
});
```

**优化建议**：
- **索引优化**：在create_time、product_line等字段建立复合索引
- **汇总表**：提前预计算，存入汇总表
- **异步生成**：报表异步生成，避免实时计算
- **分库分表**：配合ShardingSphere进行分片

#### 场景2：多数据源与分库分表

**场景描述**：你的应用需要同时访问两个数据库：业务库（MySQL）和日志库（PostgreSQL）。同时，业务库按用户ID分成了16个分表。你会如何用MyBatis-Plus实现？

**考察点**：多数据源配置、动态表名

**参考思路**：

**1. 多数据源配置**：

```yaml
spring:
  datasource:
    business:
      url: jdbc:mysql://localhost:3306/business
      username: root
      password: 123456
    log:
      url: jdbc:postgresql://localhost:5432/log
      username: postgres
      password: 123456
```

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.business")
    public DataSource businessDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.log")
    public DataSource logDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    public MybatisPlusSqlSessionFactoryBean businessSqlSessionFactory(
            @Qualifier("businessDataSource") DataSource dataSource) {
        MybatisPlusSqlSessionFactoryBean factory = new MybatisPlusSqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        factory.setMapperLocations(new PathMatchingResourcePatternResolver()
            .getResources("classpath:mapper/business/*.xml"));
        return factory;
    }
    
    @Bean
    public MybatisPlusSqlSessionFactoryBean logSqlSessionFactory(
            @Qualifier("logDataSource") DataSource dataSource) {
        MybatisPlusSqlSessionFactoryBean factory = new MybatisPlusSqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        factory.setMapperLocations(new PathMatchingResourcePatternResolver()
            .getResources("classpath:mapper/log/*.xml"));
        return factory;
    }
}
```

**2. 动态表名实现分表**：

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 动态表名插件
        DynamicTableNameInnerInterceptor dynamicTable = new DynamicTableNameInnerInterceptor();
        dynamicTable.setTableNameHandler((sql, tableName) -> {
            String userId = UserIdContext.get(); // 从ThreadLocal获取当前用户ID
            if ("order".equals(tableName) && userId != null) {
                // order表按用户ID分表
                int shard = (userId.hashCode() & Integer.MAX_VALUE) % 16;
                return "order_" + shard;
            }
            return tableName;
        });
        
        interceptor.addInnerInterceptor(dynamicTable);
        // 其他插件...
        return interceptor;
    }
}

// 使用
@Service
public class OrderService {
    @Autowired
    private OrderMapper orderMapper;
    
    public void saveOrder(Order order) {
        // 设置用户ID上下文
        UserIdContext.set(order.getUserId());
        orderMapper.insert(order);
        UserIdContext.clear();
    }
}
```

#### 场景3：MyBatis-Plus性能优化实战

**场景描述**：你的订单系统使用MyBatis-Plus，随着数据量增长，发现以下几个问题：
1. 分页查询变慢，尤其是deep分页（如第1000页）
2. 批量插入10万条数据耗时太长
3. N+1查询问题导致接口响应慢

作为架构师，你会如何优化？

**考察点**：MyBatis-Plus性能优化、批量操作、关联查询

**参考思路**：

**问题1：深度分页优化**

```java
// 问题代码（深度分页性能差）
Page<Order> page = new Page<>(100000, 10);
orderMapper.selectPage(page, null); // 实际执行：LIMIT 100000, 10

// 优化方案1：使用子查询优化
@Select("SELECT * FROM order WHERE id > (SELECT id FROM order ORDER BY id LIMIT #{offset}, 1) LIMIT #{size}")
List<Order> pageOptimized(@Param("offset") long offset, @Param("size") long size);

// 优化方案2：使用游标分页（基于上次ID）
@Select("SELECT * FROM order WHERE id > #{lastId} ORDER BY id LIMIT #{size}")
List<Order> pageByCursor(@Param("lastId") Long lastId, @Param("size") int size);
```

**问题2：批量插入优化**

```java
// 问题代码（循环单条插入）
for (Order order : orders) {
    orderMapper.insert(order); // 10万次网络IO
}

// 优化方案1：使用MyBatis-Plus批量方法
List<Order> orderList = new ArrayList<>();
// ... 添加10万条
userMapper.insertBatch(orderList); // 内部使用JDBC batch

// 优化方案2：手动使用SqlSession batch模式
try (SqlSession sqlSession = sqlSessionFactory.openSession(ExecutorType.BATCH)) {
    OrderMapper mapper = sqlSession.getMapper(OrderMapper.class);
    for (Order order : orders) {
        mapper.insert(order);
    }
    sqlSession.commit(); // 一次性提交
}

// 优化方案3：使用rewriteBatchedStatements（MySQL）
spring.datasource.url=jdbc:mysql://localhost:3306/test?rewriteBatchedStatements=true
```

**问题3：N+1查询优化**

```java
// 问题代码（N+1查询）
public List<OrderVO> getOrderDetails() {
    List<Order> orders = orderMapper.selectList(null);
    List<OrderVO> result = new ArrayList<>();
    for (Order order : orders) {
        // 每次循环都查询用户信息（N次查询）
        User user = userMapper.selectById(order.getUserId());
        result.add(new OrderVO(order, user));
    }
    return result;
}

// 优化方案1：使用连表查询
@Select("SELECT o.*, u.* FROM order o LEFT JOIN user u ON o.user_id = u.id")
List<OrderVO> selectWithUser();

// 优化方案2：使用IN查询批量获取
@Select("SELECT * FROM user WHERE id IN <foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach>")
List<User> selectBatchIds(@Param("ids") List<Long> ids);
```

**性能优化效果预估**：

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 深度分页 | 5秒 | 0.2秒 | 25倍 |
| 10万条插入 | 30秒 | 2秒 | 15倍 |
| N+1查询 | 10秒 | 0.5秒 | 20倍 |


## 结语

从1996年JDBC的繁琐操作，到2002年Hibernate的横空出世，再到2010年MyBatis的另辟蹊径，直到2016年MyBatis-Plus的异军突起——Java ORM框架的演进史，就是一部开发者不断追求“更简单、更高效”的历史。

每一种框架都有其独特的设计哲学：
- **Hibernate/JPA**相信“框架比你更懂数据库”，让你专注于对象模型
- **MyBatis**相信“开发者最懂自己的SQL”，给你完全的控制权
- **MyBatis-Plus**则在这两者之间找到了平衡点：基础CRUD完全自动化，复杂查询保留SQL控制

截至2026年，中国Java后端开发的现实是：
- **90%** 的项目在使用MyBatis
- **80%** 的项目在使用MyBatis-Plus
- **99%** 的新项目首选MyBatis-Plus

理解这些框架的演进历程和设计思想，不仅是为了在面试中侃侃而谈，更是为了在实际开发中做出正确的技术选型。没有最好的框架，只有最适合你场景的工具。而对于绝大多数国内项目来说，**MyBatis-Plus就是那个“最合适”的选择**。


**参考资料**：
1. MyBatisPlus快速入门（一）：MyBatisPlus简介、历史和优势. 百度开发者中心, 2024. 
2. MyBatis-Plus官方文档. baomidou.com, 2025. 
3. Spring整合ORM框架（Hibernate、MyBatis）. CSDN博客, 2025. 
4. MyBatis场景面试题. 阿里云开发者社区, 2025. 
5. MyBatis-Plus：简化 CRUD 操作的艺术. 阿里云开发者社区, 2024. 
6. MyBatis Plus 核心功能与用法. 阿里云开发者社区, 2025. 
7. SpringBoot | 关系型数据库存储技术全解析：从JDBC到MyBatis-Plus. CSDN博客, 2025. 
8. MyBatis-Plus：深入探索与常见面试题. 百度开发者中心, 2024. 
9. MybatisPlus（1）. 腾讯云开发者社区, 2023. 
10. MyBatisPlus优缺点深度解析：性能、灵活性与适用场景全览. 百度开发者中心, 2025. 