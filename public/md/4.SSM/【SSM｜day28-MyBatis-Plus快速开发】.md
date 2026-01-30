# 📚 SSM Day28 - MyBatis-Plus 快速开发

> 💡 **MyBatis-Plus 是基于 MyBatis 的增强工具，旨在简化开发、提高效率。** 本文深入解析 MP 核心功能、条件构造、分页插件、代码生成器等核心内容，帮你掌握企业级快速开发的关键技能。

---

## 🎯 快速回顾

- **🚀 MyBatis-Plus 简介**：基于 MyBatis 的增强工具，不替代 MyBatis，仅做增强
- **📦 BaseMapper**：内置通用 Mapper，简化单表 CRUD 操作
- **🔍 条件构造器**：QueryWrapper、LambdaQueryWrapper 实现动态查询
- **📄 分页插件**：PaginationInnerInterceptor 实现分页查询
- **🔑 主键策略**：AUTO、INPUT、ASSIGN_ID、ASSIGN_UUID
- **🗑️ 逻辑删除**：通过字段标记数据是否删除（假删除）
- **🔒 乐观锁**：通过版本号控制并发更新冲突
- **⚡ 代码生成器**：根据数据库表自动生成实体类、Dao、Service、Controller

---

## 📑 目录

- [一、MyBatis-Plus 简介](#一mybatis-plus-简介)
- [二、入门案例](#二入门案例)
- [三、标准数据层开发](#三标准数据层开发)
  - [1. 基础 CRUD](#1-基础-crud)
  - [2. Lombok 简化实体类](#2-lombok-简化实体类)
  - [3. 分页查询](#3-分页查询)
- [四、DQL 编程控制](#四dql-编程控制)
  - [1. 条件查询](#1-条件查询)
  - [2. null 判定](#2-null-判定)
  - [3. 查询投影](#3-查询投影)
  - [4. 映射匹配](#4-映射匹配)
- [五、DML 编程控制](#五dml-编程控制)
  - [1. 主键生成策略](#1-主键生成策略)
  - [2. 多记录操作](#2-多记录操作)
  - [3. 逻辑删除](#3-逻辑删除)
  - [4. 乐观锁](#4-乐观锁)
- [六、快速开发](#六快速开发)
- [七、Service 层 CRUD](#七service-层-crud)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、MyBatis-Plus 简介

- **定义**：基于 MyBatis 的增强工具，旨在简化开发、提高效率，不替代 MyBatis，仅做增强。
- **核心优势**：
  - 无侵入性：不改变 MyBatis 原有功能。
  - 内置通用 Mapper，简化单表 CRUD 操作。
  - 支持 Lambda 表达式、主键自动生成、分页插件等。

---

### 二、入门案例

**1. 环境准备**：
- 数据库表：创建 `user` 表（id, name, password, age, tel）。
- 依赖：`mybatis-plus-boot-starter`、`druid`（数据源）、`mysql-connector-java`。
- 配置：`application.yml` 配置数据源（驱动、URL、用户名、密码）。

**2. 核心代码**：
- 实体类：`User`（对应表字段）。
- Dao 接口：`UserDao extends BaseMapper<User>`（继承 MP 通用 Mapper）。
- 测试：通过 `userDao.selectList(null)` 实现查询所有数据。

---

### 三、标准数据层开发

#### 1. 基础 CRUD（基于 BaseMapper）

| 操作         | 方法                                    | 说明                                       |
| ------------ | --------------------------------------- | ------------------------------------------ |
| 新增         | `int insert(T entity)`                  | 插入一条记录，返回影响行数                 |
| 删除         | `int deleteById(Serializable id)`       | 根据 ID 删除，返回影响行数                 |
| 修改         | `int updateById(T entity)`              | 根据 ID 修改（非 null 字段），返回影响行数 |
| 根据 ID 查询 | `T selectById(Serializable id)`         | 返回单条记录                               |
| 查询所有     | `List<T> selectList(Wrapper<T> queryWrapper)` | 查询所有（可加条件）                       |

#### 2. Lombok 简化实体类

**注解**：
- `@Data`：生成 setter、getter、toString、equals、hashCode。
- `@NoArgsConstructor`：无参构造函数。
- `@AllArgsConstructor`：全参构造函数。

**作用**：减少实体类中重复的模板代码。

#### 3. 分页查询

**配置分页拦截器**：

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mpInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}
```

**使用**：

```java
IPage<User> page = new Page<>(1, 3); // 第1页，每页3条
userDao.selectPage(page, null); // 执行分页查询
// 分页结果：page.getCurrent()（当前页）、page.getSize()（每页条数）、page.getTotal()（总条数）等
```

---

### 四、DQL 编程控制

#### 1. 条件查询（Wrapper）

**核心类**：
- `QueryWrapper`：非 Lambda 方式，需手动写字段名（易出错）。
- `LambdaQueryWrapper`：Lambda 方式，通过 `User::getAge` 避免字段名写错。

**常用条件方法**：
- `eq`：等于（`=`)
- `lt`/`gt`：小于（`<`）/ 大于（`>`）
- `le`/`ge`：小于等于（`<=`）/ 大于等于（`>=`）
- `between`：范围（`BETWEEN ? AND ?`）
- `like`/`likeLeft`/`likeRight`：模糊查询（`%值%`/`%值`/`值%`）
- `and`/`or`：逻辑与 / 或

**示例**：

```java
LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
lqw.lt(User::getAge, 30).gt(User::getAge, 10); // 年龄 10 < age < 30
List<User> list = userDao.selectList(lqw);
```

#### 2. null 判定（动态条件）

解决场景：前端查询条件可能为 null（如年龄范围只输入最小值）。

**方法**：使用条件方法的 `condition` 参数（true 则添加条件）。

```java
LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
lqw.lt(null != maxAge, User::getAge, maxAge) // 若 maxAge 不为 null，则添加 age < maxAge
   .gt(null != minAge, User::getAge, minAge); // 若 minAge 不为 null，则添加 age > minAge
```

#### 3. 查询投影（指定字段 / 聚合 / 分组）

**指定字段**：`select` 方法

```java
lqw.select(User::getId, User::getName); // 只查询 id 和 name
```

**聚合查询**：结合 `selectMaps`（返回 Map 结果）

```java
QueryWrapper<User> qw = new QueryWrapper<>();
qw.select("count(*) as count", "max(age) as maxAge"); // 统计总数、最大年龄
List<Map<String, Object>> result = userDao.selectMaps(qw);
```

**分组查询**：`groupBy` 方法

```java
qw.select("tel", "count(*) as count").groupBy("tel"); // 按 tel 分组统计数量
```

#### 4. 映射匹配（表 / 字段名不一致）

- **表名映射**：`@TableName("tbl_user")`（类注解，指定表名）。
- **字段名映射**：`@TableField("pwd")`（属性注解，指定字段名）。
- **排除非表字段**：`@TableField(exist = false)`（属性不对应表字段）。
- **隐藏查询字段**：`@TableField(select = false)`（默认查询不包含该字段）。

---

### 五、DML 编程控制

#### 1. 主键生成策略（@TableId）

**注解**：`@TableId(type = IdType.策略)`

**常用策略**：

| 策略        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| AUTO        | 依赖数据库自增主键，需数据库表设置主键自增，适用于单库单表场景。 |
| INPUT       | 手动输入 ID，需开发者自行保证唯一性，风险高，极少使用。     |
| ASSIGN_ID   | 基于雪花算法生成 64 位 Long 型 ID，兼容数值和字符串类型，支持分布式。 |
| ASSIGN_UUID | 生成 32 位 UUID 字符串，无需依赖数据库，但字符串存储占用空间大，不支持排序。 |

**全局配置**（避免每个实体类重复设置）：

```yaml
mybatis-plus:
  global-config:
    db-config:
      id-type: assign_id # 全局默认主键策略
```

#### 2. 多记录操作

**批量删除**：`deleteBatchIds(Collection<? extends Serializable> idList)`

```java
userDao.deleteBatchIds(Arrays.asList(1L, 2L)); // 删除 ID 为 1 和 2 的记录
```

**批量查询**：`selectBatchIds(Collection<? extends Serializable> idList)`

#### 3. 逻辑删除（假删除）

**原理**：通过字段标记数据是否删除（如 `deleted` 字段，0 = 正常，1 = 删除），本质是更新操作。

**实现**：
1. 表添加 `deleted` 字段（默认值 0）。
2. 实体类添加属性：`@TableLogic private Integer deleted;`。
3. 全局配置（可选）：

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted # 逻辑删除字段名
      logic-not-delete-value: 0 # 未删除值
      logic-delete-value: 1 # 删除值
```

**效果**：删除时执行 `UPDATE ... SET deleted=1`；查询时自动添加 `WHERE deleted=0`。

#### 4. 乐观锁（解决并发更新冲突）

**原理**：通过版本号（`version`）控制，更新时检查版本号是否匹配。

**实现**：
1. 表添加 `version` 字段（默认值 1）。
2. 实体类添加属性：`@Version private Integer version;`。
3. 配置乐观锁拦截器：

```java
@Bean
public MybatisPlusInterceptor mpInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor()); // 乐观锁拦截器
    return interceptor;
}
```

**效果**：更新时执行 `UPDATE ... SET version=version+1 WHERE ... AND version=?`，版本不匹配则更新失败。

---

### 六、快速开发

**代码生成器**：根据数据库表自动生成实体类、Dao、Service、Controller 代码。

**步骤**：
1. 导入依赖：`mybatis-plus-generator`（代码生成器）、`velocity-engine-core`（模板引擎）。
2. 编写生成配置（数据源、全局配置、包配置、策略配置）：

```java
AutoGenerator autoGenerator = new AutoGenerator();
// 1. 配置数据源
DataSourceConfig dataSource = new DataSourceConfig();
dataSource.setDriverName("com.mysql.cj.jdbc.Driver");
dataSource.setUrl("jdbc:mysql://localhost:3306/mybatisplus_db");
dataSource.setUsername("root");
dataSource.setPassword("root");
autoGenerator.setDataSource(dataSource);

// 2. 全局配置（输出目录、作者、ID策略等）
GlobalConfig globalConfig = new GlobalConfig();
globalConfig.setOutputDir(System.getProperty("user.dir") + "/src/main/java");
globalConfig.setAuthor("开发者");
globalConfig.setIdType(IdType.ASSIGN_ID);
autoGenerator.setGlobalConfig(globalConfig);

// 3. 包配置（父包名、各层包名）
PackageConfig packageInfo = new PackageConfig();
packageInfo.setParent("com.aaa");
packageInfo.setEntity("domain");
packageInfo.setMapper("dao");
autoGenerator.setPackageInfo(packageInfo);

// 4. 策略配置（表名、前缀、Lombok、逻辑删除等）
StrategyConfig strategyConfig = new StrategyConfig();
strategyConfig.setInclude("tbl_user"); // 生成的表名
strategyConfig.setTablePrefix("tbl_"); // 表前缀（生成类名会去掉前缀）
strategyConfig.setEntityLombokModel(true); // 启用 Lombok
autoGenerator.setStrategy(strategyConfig);

// 执行生成
autoGenerator.execute();
```

---

### 七、Service 层 CRUD

**继承关系**：
- 自定义 Service 接口：`public interface UserService extends IService<User>`。
- 实现类：`public class UserServiceImpl extends ServiceImpl<UserDao, User> implements UserService`。

**优势**：`IService` 提供了更多批量操作、分页查询等方法（如 `list()`、`page()`、`saveBatch()` 等）。

---

## ❓ 问答

### Q1：MyBatis-Plus 的主键生成策略有哪些？分布式系统中优先选哪种？

**A**：
- **AUTO**：数据库自增，适用于单库单表场景。
- **INPUT**：手动输入 ID，风险高，极少使用。
- **ASSIGN_ID**：基于雪花算法生成 64 位 Long 型 ID，支持分布式，**分布式系统优先选择**。
- **ASSIGN_UUID**：生成 32 位 UUID 字符串，无序，会导致索引碎片。

**分布式系统优先选 ASSIGN_ID**：
- 唯一性保障：雪花算法通过 "时间戳 + 数据中心 ID + 机器 ID + 序列号" 组合生成 ID，避免分布式节点 ID 冲突。
- 性能优异：本地生成 ID，无需与数据库交互，减少网络开销。
- 有序性：基于时间戳生成，ID 整体有序，利于数据库索引优化。

### Q2：MyBatis-Plus 的乐观锁实现原理是什么？

**A**：MP 的乐观锁通过版本号机制实现：
1. 表中新增 `version` 字段（默认值 1），实体类对应字段添加 `@Version` 注解。
2. 配置乐观锁拦截器 `OptimisticLockerInnerInterceptor`，拦截更新 SQL。
3. 更新时，MP 自动拼接条件 `WHERE version = 原版本号`，并将版本号自增（`SET version = version + 1`）。
4. 若更新影响行数为 0，说明版本号已被其他线程修改，更新失败，需开发者处理重试或提示。

**示例 SQL**：
```sql
-- 原始更新意图
UPDATE tbl_user SET name = 'Jock888' WHERE id = 3;
-- MP处理后SQL
UPDATE tbl_user SET name = 'Jock888', version = 2 WHERE id = 3 AND version = 1;
```

### Q3：LambdaQueryWrapper 相比 QueryWrapper 的优势是什么？

**A**：
1. **类型安全，避免字段名写错**：QueryWrapper 需手动传入字段名字符串，若字段名修改或拼写错误，编译时无法发现；Lambda 方式通过 `User::getName` 关联字段，字段名错误会直接编译失败。
2. **代码可读性更高**：直接关联实体类属性，无需记忆数据库字段名。
3. **适配字段重构**：若数据库字段名通过注解映射（如 `@TableField("user_name")`），Lambda 方式无需修改查询代码。

### Q4：MyBatis-Plus 的分页插件底层是如何实现的？

**A**：MP 的分页依赖 `PaginationInnerInterceptor` 拦截器：
1. 开发者通过 `new Page<>(current, size)` 构建分页参数。
2. 拦截器拦截目标方法（如 `selectPage`），获取原始 SQL。
3. 根据数据库类型（如 MySQL、Oracle）拼接分页 SQL：
   - MySQL：拼接 `LIMIT ?, ?`；
   - Oracle：通过 `ROWNUM` 实现分页。
4. 执行分页 SQL，同时执行 `COUNT(*)` 查询获取总条数。
5. 将查询结果封装到 `IPage` 对象（包含当前页数据、总条数、总页数等）。

### Q5：MyBatis-Plus 的逻辑删除和物理删除有什么区别？

**A**：

| 维度         | 逻辑删除                                                     | 物理删除                           |
| ------------ | ------------------------------------------------------------ | ---------------------------------- |
| 实现方式     | 新增 `deleted` 字段标记（0 = 正常，1 = 删除），删除时执行 UPDATE 操作 | 执行 DELETE 语句，直接删除表中数据 |
| 数据可恢复性 | 可恢复，修改 `deleted` 字段即可                                | 不可直接恢复，需依赖数据库备份     |
| 查询影响     | MP 自动拼接 `WHERE deleted = 0`，无需手动过滤                 | 无影响，查询结果不包含已删除数据   |
| 性能影响     | 长期会导致表数据量增大，需定期归档                           | 数据量减少，查询性能可能提升       |

**选型建议**：
- **选逻辑删除**：需数据追溯的场景（如订单、用户操作日志）、关联数据多的场景、合规要求场景。
- **选物理删除**：临时数据场景、高频写入删除的场景、敏感数据场景。

---

## 💡 学习建议

1. **理解核心思想**：重点理解 MyBatis-Plus 是基于 MyBatis 的增强工具，不替代 MyBatis。
2. **掌握条件构造器**：重点掌握 QueryWrapper 和 LambdaQueryWrapper 的使用，特别是动态条件查询。
3. **动手实践**：通过编写案例加深理解，特别是分页插件、逻辑删除、乐观锁的使用。
4. **关注底层**：了解 MyBatis-Plus 的底层实现（拦截器、SQL 拼接、版本号机制）。
5. **面试准备**：重点掌握主键策略、乐观锁、逻辑删除、分页插件等面试高频点。

---

> **🎯 学习完成**：SSM 框架学习已全部完成，建议通过实战项目（如图书管理系统）巩固所学知识，为后续学习 SpringBoot 打下坚实基础。
