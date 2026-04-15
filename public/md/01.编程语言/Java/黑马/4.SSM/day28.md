# 【SSM 框架 ｜ day27 MP】

## 一、MyBatis-Plus 简介

- **定义**：基于 MyBatis 的增强工具，旨在简化开发、提高效率，不替代 MyBatis，仅做增强。

- 核心优势

  ：

  - 无侵入性：不改变 MyBatis 原有功能。
  - 内置通用 Mapper，简化单表 CRUD 操作。
  - 支持 Lambda 表达式、主键自动生成、分页插件等。

## 二、入门案例（SpringBoot 整合）

1. **环境准备**：
   - 数据库表：创建 `user` 表（id, name, password, age, tel）。
   - 依赖：`mybatis-plus-boot-starter`、`druid`（数据源）、`mysql-connector-java`。
   - 配置：`application.yml` 配置数据源（驱动、URL、用户名、密码）。
2. **核心代码**：
   - 实体类：`User`（对应表字段）。
   - Dao 接口：`UserDao extends BaseMapper`（继承 MP 通用 Mapper）。
   - 测试：通过 `userDao.selectList(null)` 实现查询所有数据。

## 三、标准数据层开发

### 1. 基础 CRUD（基于 BaseMapper）

| 操作         | 方法                                    | 说明                                       |
| ------------ | --------------------------------------- | ------------------------------------------ |
| 新增         | `int insert(T entity)`                  | 插入一条记录，返回影响行数                 |
| 删除         | `int deleteById(Serializable id)`       | 根据 ID 删除，返回影响行数                 |
| 修改         | `int updateById(T entity)`              | 根据 ID 修改（非 null 字段），返回影响行数 |
| 根据 ID 查询 | `T selectById(Serializable id)`         | 返回单条记录                               |
| 查询所有     | `List selectList(Wrapper queryWrapper)` | 查询所有（可加条件）                       |

### 2. Lombok 简化实体类

- 注解

  ：

  - `@Data`：生成 setter、getter、toString、equals、hashCode。
  - `@NoArgsConstructor`：无参构造函数。
  - `@AllArgsConstructor`：全参构造函数。

- **作用**：减少实体类中重复的模板代码。

### 3. 分页查询

1. 配置分页拦截器

   ：

   java

   ```java
   @Configuration
   public class MybatisPlusConfig {
       @Bean
       public MybatisPlusInterceptor mpInterceptor() {
           MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
           interceptor.addInnerInterceptor(new PaginationInnerInterceptor()); // 添加分页拦截器
           return interceptor;
       }
   }
   ```

   

2. 使用

   ：

   java

   运行

   ```java
   IPage<User> page = new Page<>(1, 3); // 第1页，每页3条
   userDao.selectPage(page, null); // 执行分页查询
   // 分页结果：page.getCurrent()（当前页）、page.getSize()（每页条数）、page.getTotal()（总条数）等
   ```

## 四、DQL 编程控制（查询操作）

### 1. 条件查询（Wrapper）

- **核心类**：

  - `QueryWrapper`：非 Lambda 方式，需手动写字段名（易出错）。
  - `LambdaQueryWrapper`：Lambda 方式，通过 `User::getAge` 避免字段名写错。

- **常用条件方法**：

  - `eq`：等于（`=`)
  - `lt`/`gt`：小于（`<`）/ 大于（`>`）
  - `le`/`ge`：小于等于（`<=`）/ 大于等于（`>=`）
  - `between`：范围（`BETWEEN ? AND ?`）
  - `like`/`likeLeft`/`likeRight`：模糊查询（`%值%`/`%值`/`值%`）
  - `and`/`or`：逻辑与 / 或

- **示例**：

  java

  运行

  ```java
  LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
  lqw.lt(User::getAge, 30).gt(User::getAge, 10); // 年龄 10 < age < 30
  List<User> list = userDao.selectList(lqw);
  ```

  

### 2. null 判定（动态条件）

- 解决场景：前端查询条件可能为 null（如年龄范围只输入最小值）。

- 方法：使用条件方法的

  ```
  condition
  ```

  参数（true 则添加条件）。

  java

  运行

  ```java
  LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
  lqw.lt(null != maxAge, User::getAge, maxAge) // 若 maxAge 不为 null，则添加 age < maxAge
     .gt(null != minAge, User::getAge, minAge); // 若 minAge 不为 null，则添加 age > minAge
  ```

### 3. 查询投影（指定字段 / 聚合 / 分组）

- 指定字段

  ：

  ```
  select
  ```

  

  方法

  java

  ```java
  lqw.select(User::getId, User::getName); // 只查询 id 和 name
  ```

- 聚合查询

  ：结合 

  ```
  selectMaps
  ```

  （返回 Map 结果）

  java

  运行

  ```java
  QueryWrapper<User> qw = new QueryWrapper<>();
  qw.select("count(*) as count", "max(age) as maxAge"); // 统计总数、最大年龄
  List<Map<String, Object>> result = userDao.selectMaps(qw);
  ```

  

- 分组查询

  ：

  ```
  groupBy
  ```

   

  方法

  java

  ```java
  qw.select("tel", "count(*) as count").groupBy("tel"); // 按 tel 分组统计数量
  ```

  

### 4. 映射匹配（表 / 字段名不一致）

- **表名映射**：`@TableName("tbl_user")`（类注解，指定表名）。
- **字段名映射**：`@TableField("pwd")`（属性注解，指定字段名）。
- **排除非表字段**：`@TableField(exist = false)`（属性不对应表字段）。
- **隐藏查询字段**：`@TableField(select = false)`（默认查询不包含该字段）。

## 五、DML 编程控制（增删改）

### 1. 主键生成策略（@TableId）

- **注解**：`@TableId(type = IdType.策略)`

- 常用策略

  ：

  - `AUTO`：数据库自增（需表主键设为自增）。
  - `INPUT`：手动输入 ID。
  - `ASSIGN_ID`：雪花算法生成 Long 型 ID（分布式场景推荐）。
  - `ASSIGN_UUID`：生成 UUID 字符串（需主键为 varchar 类型）。

- 全局配置

  （避免每个实体类重复设置）：

  yaml

  ```yaml
  mybatis-plus:
    global-config:
      db-config:
        id-type: assign_id # 全局默认主键策略
  ```

  

### 2. 多记录操作

- 批量删除

  ：

  ```
  deleteBatchIds(Collection<? extends Serializable> idList)
  ```

  java

  运行

  ```java
  userDao.deleteBatchIds(Arrays.asList(1L, 2L)); // 删除 ID 为 1 和 2 的记录
  ```

  

- **批量查询**：`selectBatchIds(Collection idList)`

### 3. 逻辑删除（假删除）

- **原理**：通过字段标记数据是否删除（如 `deleted` 字段，0 = 正常，1 = 删除），本质是更新操作。

- 实现

  ：

  1. 表添加 `deleted` 字段（默认值 0）。

  2. 实体类添加属性：`@TableLogic private Integer deleted;`。

  3. 全局配置（可选）：

     yaml

     ```yaml
     mybatis-plus:
       global-config:
         db-config:
           logic-delete-field: deleted # 逻辑删除字段名
           logic-not-delete-value: 0 # 未删除值
           logic-delete-value: 1 # 删除值
     ```

     

- **效果**：删除时执行 `UPDATE ... SET deleted=1`；查询时自动添加 `WHERE deleted=0`。

### 4. 乐观锁（解决并发更新冲突）

- **原理**：通过版本号（`version`）控制，更新时检查版本号是否匹配。

- 实现

  ：

  1. 表添加 `version` 字段（默认值 1）。

  2. 实体类添加属性：`@Version private Integer version;`。

  3. 配置乐观锁拦截器：

     java

     ```java
     @Bean
     public MybatisPlusInterceptor mpInterceptor() {
         MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
         interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor()); // 乐观锁拦截器
         return interceptor;
     }
     ```

     

- **效果**：更新时执行 `UPDATE ... SET version=version+1 WHERE ... AND version=?`，版本不匹配则更新失败。

## 六、快速开发（代码生成器）

- **作用**：根据数据库表自动生成实体类、Dao、Service、Controller 代码。

- 步骤

  ：

  1. 导入依赖：`mybatis-plus-generator`（代码生成器）、`velocity-engine-core`（模板引擎）。

  2. 编写生成配置（数据源、全局配置、包配置、策略配置）：

     java

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

     

## 七、Service 层 CRUD

- 继承关系

  ：

  - 自定义 Service 接口：`public interface UserService extends IService`。
  - 实现类：`public class UserServiceImpl extends ServiceImpl implements UserService`。

- **优势**：`IService` 提供了更多批量操作、分页查询等方法（如 `list()`、`page()`、`saveBatch()` 等）。

**总结**：MyBatis-Plus 核心是通过封装通用 Mapper 和 Service 简化单表操作，重点掌握条件构造、主键策略、分页、逻辑删除、乐观锁等功能，结合代码生成器可大幅提升开发效率。

以下是 5 道 MyBatis-Plus（MP）相关的中大厂面试题，涵盖**底层原理、分布式场景、并发控制、性能优化**等核心考点，每道题均附详细解析，适配中高级开发岗位面试场景：

### 面试题 1：MyBatis-Plus 的主键生成策略有哪些？分布式系统中优先选哪种？为什么？

#### 问题解析

该题考察对 MP 主键策略的全面理解，以及分布式场景下的技术选型能力，大厂尤其关注分布式 ID 的唯一性和性能问题。

#### 参考答案

1. MP 核心主键生成策略

   （基于

   ```
   IdType
   ```

   枚举）

   | 策略        | 说明                                                         |
   | ----------- | ------------------------------------------------------------ |
   | AUTO        | 依赖数据库自增主键，需数据库表设置主键自增，适用于单库单表场景。 |
   | INPUT       | 手动输入主键，需开发者自行保证唯一性，风险高，极少使用。     |
   | ASSIGN_ID   | 基于雪花算法生成 64 位 Long 型 ID，兼容数值和字符串类型，支持分布式。 |
   | ASSIGN_UUID | 生成 32 位 UUID 字符串，无需依赖数据库，但字符串存储占用空间大，不支持排序。 |
   | （已过时）  | ID_WORKER、ID_WORKER_STR 等，已被 ASSIGN_ID/ASSIGN_UUID 替代。 |

2. 分布式系统优先选`ASSIGN_ID`

   ，原因如下

   - **唯一性保障**：雪花算法通过 “时间戳 + 数据中心 ID + 机器 ID + 序列号” 组合生成 ID，避免分布式节点 ID 冲突。
   - **性能优异**：本地生成 ID，无需与数据库交互，减少网络开销，吞吐量远高于数据库自增。
   - **有序性**：基于时间戳生成，ID 整体有序，利于数据库索引优化（B + 树索引对有序数据插入效率更高）。
   - 对比`ASSIGN_UUID`：UUID 无序，会导致索引碎片，查询性能下降；且字符串存储比 Long 型占用更多空间。

### 面试题 2：MyBatis-Plus 的乐观锁实现原理是什么？它和悲观锁的适用场景有何区别？

#### 问题解析

并发控制是大厂面试高频考点，乐观锁是 MP 的核心特性，需深入理解其底层逻辑和实际业务适配能力。

#### 参考答案

1. MP 乐观锁实现原理

   

   MP 的乐观锁通过

   版本号机制

   实现，核心步骤如下

   1. 表中新增`version`字段（默认值 1），实体类对应字段添加`@Version`注解。

   2. 配置乐观锁拦截器`OptimisticLockerInnerInterceptor`，拦截更新 SQL。

   3. 更新时，MP 自动拼接条件`WHERE version = 原版本号`，并将版本号自增（`SET version = version + 1`）。

   4. 若更新影响行数为 0，说明版本号已被其他线程修改，更新失败，需开发者处理重试或提示。

      

      示例 SQL：

   sql

   

   

   

   

   

   ```sql
   -- 原始更新意图
   UPDATE tbl_user SET name = 'Jock888' WHERE id = 3;
   -- MP处理后SQL
   UPDATE tbl_user SET name = 'Jock888', version = 2 WHERE id = 3 AND version = 1;
   ```

   

2. 乐观锁与悲观锁适用场景区别

   | 锁类型 | 适用场景                                                   | 特点                                   |
   | ------ | ---------------------------------------------------------- | -------------------------------------- |
   | 乐观锁 | 读多写少、并发冲突少的场景（如商品详情查询、用户资料修改） | 无锁开销，性能高，冲突时需手动处理重试 |
   | 悲观锁 | 写多读少、并发冲突多的场景（如秒杀、库存扣减）             | 直接锁定资源，冲突少，但性能开销大     |

### 面试题 3：MyBatis-Plus 的条件构造器 Wrapper 有几种？LambdaQueryWrapper 相比 QueryWrapper 的优势是什么？

#### 问题解析

条件构造器是 MP 简化查询的核心，考察对 MP API 的使用熟练度，以及代码健壮性的理解，大厂注重代码低出错率和可维护性。

#### 参考答案

1. MP 条件构造器核心类型
   - `AbstractWrapper`：抽象基类，定义通用条件方法（如 eq、lt、like 等）。
   - `QueryWrapper`：非 Lambda 方式，需手动传入字段名字符串（如`qw.eq("name", "Tom")`）。
   - `LambdaQueryWrapper`：Lambda 方式，通过方法引用获取字段（如`lqw.eq(User::getName, "Tom")`）。
   - `UpdateWrapper`：用于构建更新条件的构造器。
2. LambdaQueryWrapper 的核心优势
   - **类型安全，避免字段名写错**：QueryWrapper 需手动写字符串字段名，若字段名修改或拼写错误，编译时无法发现，只能运行时报错；Lambda 方式通过`User::getName`关联字段，字段名错误会直接编译失败。
   - **代码可读性更高**：直接关联实体类属性，无需记忆数据库字段名，尤其适合字段名复杂的场景。
   - **适配字段重构**：若数据库字段名通过注解映射（如`@TableField("user_name")`），Lambda 方式无需修改查询代码，QueryWrapper 需手动修改字符串。

### 面试题 4：MyBatis-Plus 的分页插件底层是如何实现的？如何优化分页查询的性能？

#### 问题解析

分页是业务系统高频操作，考察对 MP 插件机制的理解和数据库性能优化能力，大厂关注大数据量下的分页效率问题。

#### 参考答案

1. 分页插件底层实现原理

   

   MP 的分页依赖

   ```
   PaginationInnerInterceptor
   ```

   拦截器，核心流程如下

   1. 开发者通过`new Page<>(current, size)`构建分页参数。
   2. 拦截器拦截目标方法（如`selectPage`），获取原始 SQL。
   3. 根据数据库类型（如 MySQL、Oracle）拼接分页 SQL：
      - MySQL：拼接`LIMIT ?, ?`；
      - Oracle：通过`ROWNUM`实现分页。
   4. 执行分页 SQL，同时执行`COUNT(*)`查询获取总条数。
   5. 将查询结果封装到`IPage`对象（包含当前页数据、总条数、总页数等）。

2. 分页查询性能优化方案

   - **避免查询总条数**：若业务无需总页数（如滚动加载），可通过`page.setSearchCount(false)`关闭`COUNT(*)`查询，减少一次全表扫描。
   - **优化大数据量分页**：MySQL 的`LIMIT 100000, 10`会扫描前 100010 条数据，效率极低。可改为基于主键的游标分页：

   java

   

   运行

   

   

   

   

   ```java
   // 游标分页，基于上一页最后一条ID
   LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
   lqw.gt(User::getId, lastId).last("LIMIT 10");
   ```

   

   - **添加索引**：分页查询的`WHERE`条件字段和排序字段需建立索引，避免全表扫描。
   - **分库分表**：若单表数据量超千万，可通过分库分表（如 Sharding-JDBC）拆分数据，降低单表分页压力。

### 面试题 5：MyBatis-Plus 的逻辑删除和物理删除有什么区别？实际业务中如何选择？

#### 问题解析

考察对数据删除机制的理解，以及业务设计中的数据安全和性能权衡能力，大厂注重数据可追溯性和系统稳定性。

#### 参考答案

1. 逻辑删除与物理删除的核心区别

   | 维度         | 逻辑删除                                                     | 物理删除                           |
   | ------------ | ------------------------------------------------------------ | ---------------------------------- |
   | 实现方式     | 新增`deleted`字段标记（0 = 正常，1 = 删除），删除时执行 UPDATE 操作 | 执行 DELETE 语句，直接删除表中数据 |
   | 数据可恢复性 | 可恢复，修改`deleted`字段即可                                | 不可直接恢复，需依赖数据库备份     |
   | 查询影响     | MP 自动拼接`WHERE deleted = 0`，无需手动过滤                 | 无影响，查询结果不包含已删除数据   |
   | 性能影响     | 长期会导致表数据量增大，需定期归档                           | 数据量减少，查询性能可能提升       |

2. 实际业务选型建议

   - **选逻辑删除的场景**：

   1. 需数据追溯的场景（如订单、用户操作日志），删除后可能需对账或排查问题；
   2. 关联数据多的场景（如员工表关联合同表，删除员工后合同数据需保留关联关系）；
   3. 合规要求场景（如金融、医疗数据，需长期留存）。

   - **选物理删除的场景**：

   1. 临时数据场景（如缓存表、会话表），数据无追溯价值；
   2. 高频写入删除的场景（如秒杀临时订单），避免表数据膨胀影响性能；
   3. 敏感数据场景（如用户临时输入的隐私信息，删除后需彻底清除）。

   - **补充**：逻辑删除需配合定期归档策略（如将 3 个月前的删除数据迁移至历史表），避免主表数据量过大。

