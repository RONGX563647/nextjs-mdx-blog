GORM 是 Go 语言生态中最流行的 **ORM（对象关系映射）库**，用于简化 Go 程序与数据库的交互，支持 MySQL、PostgreSQL、SQLite、SQL Server 等主流数据库，核心优势是 “约定优于配置”、API 简洁且功能强大。以下从 **基础使用、核心功能、高级特性、注意事项** 四个维度，进行全面详细讲解（基于当前主流的 GORM v2 版本）。

### 一、基础准备：安装与环境配置

#### 1. 安装 GORM

首先通过 `go get` 安装 GORM 核心库及对应数据库驱动（以 MySQL 为例）：

go











```go
// 安装 GORM 核心库
go get gorm.io/gorm
// 安装 MySQL 驱动（GORM v2 需单独安装驱动）
go get gorm.io/driver/mysql
```

#### 2. 核心概念：模型（Model）定义

GORM 通过 **结构体（Struct）映射数据库表**，结构体字段对应表的列，需遵循以下约定（也可通过标签自定义）：

- 结构体名默认转为表名：`User` → `users`（复数形式，蛇形命名）；
- 字段名默认转为列名：`UserName` → `user_name`（蛇形命名）；
- 若字段名为 `ID` 且类型为 `uint`/`int64`，默认作为 **主键（自增）**；
- 若字段含 `gorm.DeletedAt` 类型，默认开启 **软删除**（逻辑删除，而非物理删除）。

**模型定义示例（User 表）**：

go











```go
package main

import (
  "gorm.io/gorm"
  "time"
)

// User 模型（映射 users 表）
type User struct {
  gorm.Model        // 嵌入 GORM 内置模型（含 ID, CreatedAt, UpdatedAt, DeletedAt）
  UserName  string  `gorm:"column:user_name;type:varchar(50);not null;uniqueIndex:idx_user_name"` // 自定义列名、类型、非空、唯一索引
  Age       int     `gorm:"column:age;type:int;default:0;comment:'用户年龄'"` // 默认值、注释
  Email     string  `gorm:"column:email;type:varchar(100);unique;not null"` // 唯一约束
  Address   *string `gorm:"column:address;type:varchar(200);null"` // 指针类型支持 NULL
}

// （可选）自定义表名：若不实现此方法，默认用结构体复数（users）
func (u User) TableName() string {
  return "t_user" // 自定义表名为 t_user（加前缀是常见规范）
}
```

**常用字段标签说明**：

| 标签语法                     | 作用                               | 示例                                  |
| ---------------------------- | ---------------------------------- | ------------------------------------- |
| `gorm:"primaryKey"`          | 指定为主键（非 ID 字段需显式声明） | `IDCard string gorm:"primaryKey"`     |
| `gorm:"column:xxx"`          | 自定义列名                         | `Name string gorm:"column:user_name"` |
| `gorm:"type:xxx"`            | 自定义数据库字段类型               | `Phone string gorm:"type:char(11)"`   |
| `gorm:"not null"`            | 非空约束                           | `Email string gorm:"not null"`        |
| `gorm:"unique"`              | 唯一约束（列级）                   | `Phone string gorm:"unique"`          |
| `gorm:"uniqueIndex:idx_xxx"` | 唯一索引（支持多字段联合索引）     | `gorm:"uniqueIndex:idx_user_email"`   |
| `gorm:"index:idx_xxx"`       | 普通索引（提升查询效率）           | `gorm:"index:idx_user_age"`           |
| `gorm:"default:xxx"`         | 字段默认值                         | `Status int gorm:"default:1"`         |
| `gorm:"comment:xxx"`         | 字段注释                           | `gorm:"comment:'用户状态'"`           |
| `gorm:"-:migration"`         | 迁移时忽略该字段（不创建列）       | `TempField string gorm:"-:migration"` |

#### 3. 数据库连接

通过 `gorm.Open` 初始化数据库连接，需传入 “驱动配置” 和 “GORM 全局配置”，并验证连接是否成功。

**以 MySQL 为例**：

go











```go
package main

import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
  "gorm.io/gorm/logger"
)

func main() {
  // 1. 拼接 MySQL DSN（数据源名称）：格式为 "用户名:密码@tcp(地址:端口)/数据库名?参数"
  // 关键参数：parseTime=true（必须，GORM 需解析 MySQL 时间类型）、loc=Local（时区）
  dsn := "root:123456@tcp(127.0.0.1:3306)/test_db?charset=utf8mb4&parseTime=true&loc=Local"

  // 2. 初始化 GORM DB 实例
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
    // 可选配置：日志级别（开发环境建议开启 Info，生产环境可设为 Error）
    Logger: logger.Default.LogMode(logger.Info),
    // 可选：禁用默认事务（GORM 对写操作默认开启事务，若无需可关闭提升性能）
    SkipDefaultTransaction: true,
    // 可选：设置默认创建时间格式（默认是 time.Time，可自定义为 int64 时间戳）
    // NowFunc: func() time.Time { return time.Now().Local() },
  })
  if err != nil {
    panic("数据库连接失败：" + err.Error())
  }

  // 3. （可选）配置数据库连接池（重要！避免高并发下连接耗尽）
  sqlDB, err := db.DB()
  if err != nil {
    panic("获取 SQL DB 实例失败：" + err.Error())
  }
  // 设置最大打开连接数（根据数据库性能调整，如 MySQL 默认最大连接数是 151）
  sqlDB.SetMaxOpenConns(100)
  // 设置最大空闲连接数（保持部分连接池，避免频繁创建销毁）
  sqlDB.SetMaxIdleConns(20)
  // 设置连接最大存活时间（避免连接超时）
  sqlDB.SetConnMaxLifetime(time.Hour)

  // 后续通过 db 操作数据库...
}
```

### 二、核心功能：CRUD 与常用操作

GORM 的 CRUD 操作 API 高度统一，均通过 `db` 实例调用，支持链式查询（如 `Where().Limit().Find()`）。

#### 1. 数据迁移（Model → 数据库表）

GORM 可根据模型自动创建 / 更新表结构（**仅新增字段，不删除现有字段**，避免数据丢失），核心方法是 `AutoMigrate`。

go











```go
// 1. 自动迁移：根据 User 模型创建 t_user 表（若表已存在，更新字段结构）
err := db.AutoMigrate(&User{})
if err != nil {
  panic("迁移失败：" + err.Error())
}

// 2. 手动迁移（进阶）：创建/删除表
// 创建表（若已存在则报错）
db.Migrator().CreateTable(&User{})
// 删除表
db.Migrator().DropTable(&User{})
// 判断表是否存在
if db.Migrator().HasTable(&User{}) {
  fmt.Println("t_user 表已存在")
}
// 添加字段（给 User 模型新增一个 NickName 字段后，手动添加列）
db.Migrator().AddColumn(&User{}, "NickName")
// 删除字段（谨慎使用！会丢失数据）
db.Migrator().DropColumn(&User{}, "Address")
```

#### 2. 创建（Create）：新增数据

支持单条创建、批量创建，且可通过 **模型钩子**（如 `BeforeCreate`）在插入前处理数据（如密码加密）。

go











```go
// 1. 单条创建
user := User{
  UserName: "zhangsan",
  Age:      20,
  Email:    "zhangsan@test.com",
}
// Create 方法：返回 *gorm.DB 实例，可通过 Error 判断是否成功
result := db.Create(&user)
if result.Error != nil {
  panic("创建失败：" + result.Error.Error())
}
// 插入成功后，user.ID 会自动填充（自增主键）
fmt.Println("新增用户 ID：", user.ID)
fmt.Println("影响行数：", result.RowsAffected) // 1

// 2. 批量创建（效率高于循环单条创建）
users := []User{
  {UserName: "lisi", Age: 22, Email: "lisi@test.com"},
  {UserName: "wangwu", Age: 25, Email: "wangwu@test.com"},
}
result = db.Create(&users) // 批量插入
fmt.Println("批量新增影响行数：", result.RowsAffected) // 2
for _, u := range users {
  fmt.Println("用户 ID：", u.ID) // 自动填充 ID
}

// 3. 模型钩子（BeforeCreate）：插入前自动处理数据（示例：给 Email 加后缀）
func (u *User) BeforeCreate(tx *gorm.DB) error {
  if u.Email != "" && !strings.Contains(u.Email, "@test.com") {
    u.Email += "@test.com" // 若 Email 不含后缀，自动添加
  }
  return nil
}
// 此时创建 User{UserName: "zhaoliu", Email: "zhaoliu"}，最终 Email 会变为 zhaoliu@test.com
```

#### 3. 查询（Read）：获取数据

查询是 GORM 最核心、最灵活的功能，支持 **单条查询、条件查询、分页、排序、关联预加载** 等场景。

##### （1）单条查询：First、Take、Last

- `First`：按主键升序取第一条（若无数据，返回 `ErrRecordNotFound`）；
- `Take`：取任意一条（不排序）；
- `Last`：按主键降序取最后一条。

go











```go
var user User

// 1. 按主键查询（ID=1）
result := db.First(&user, 1) // 等价于 db.First(&user, "id = ?", 1)
if result.Error != nil {
  if errors.Is(result.Error, gorm.ErrRecordNotFound) {
    fmt.Println("用户不存在")
  } else {
    panic("查询失败：" + result.Error.Error())
  }
}
fmt.Println("查询到的用户：", user)

// 2. 按条件查询（单条件）
db.Where("user_name = ?", "zhangsan").Take(&user) // WHERE user_name = 'zhangsan'

// 3. 按条件查询（多条件：AND）
db.Where("age > ? AND email LIKE ?", 20, "%test.com").Take(&user) // WHERE age > 20 AND email LIKE '%test.com'

// 4. 按结构体条件查询（自动匹配非零字段）
db.Where(&User{UserName: "zhangsan", Age: 20}).Take(&user) // WHERE user_name = 'zhangsan' AND age = 20（忽略空字段）

// 5. 按 Map 条件查询
db.Where(map[string]interface{}{"user_name": "zhangsan", "age": 20}).Take(&user)
```

##### （2）批量查询：Find

go











```go
var users []User

// 1. 查询所有数据（注意：表数据量大时避免用，会导致内存溢出）
db.Find(&users)

// 2. 条件批量查询（年龄>20）
db.Where("age > ?", 20).Find(&users)

// 3. 分页查询（核心！避免大数据量查询压力）
page := 1   // 当前页
pageSize := 10 // 每页条数
offset := (page - 1) * pageSize
db.Where("age > ?", 20).Offset(offset).Limit(pageSize).Find(&users)

// 4. 排序查询（按年龄降序，ID 升序）
db.Order("age DESC, id ASC").Find(&users)

// 5. 去重查询（DISTINCT）
db.Distinct("age").Where("age > ?", 18).Find(&users) // 只返回不同的 age 值
```

##### （3）关联预加载：解决 N+1 问题

若模型存在关联（如 `User` 关联 `Order`），直接查询会导致 “N+1 问题”（1 次查用户，N 次查每个用户的订单）。GORM 用 `Preload` 实现 **预加载**（1 次查询用户，1 次批量查询所有关联订单）。

go











```go
// 1. 定义关联模型（User 1:N Order）
type Order struct {
  gorm.Model
  UserID  uint   `gorm:"column:user_id;not null;index:idx_order_user_id"` // 外键（关联 User.ID）
  OrderNo string `gorm:"column:order_no;unique;not null"`
  Amount  float64 `gorm:"column:amount;not null"`
}

// 2. 预加载 User 的所有 Order（1 次 SQL 查询用户，1 次 SQL 查询所有订单）
var user User
db.Preload("Orders").First(&user, 1) // 需在 User 模型中定义 Orders 字段：Orders []Order `gorm:"foreignKey:UserID"`
fmt.Println("用户的订单列表：", user.Orders)

// 3. 预加载带条件（只加载金额>100 的订单）
db.Preload("Orders", "amount > ?", 100).First(&user, 1)

// 4. 嵌套预加载（若 Order 还关联 Product，预加载 Order 的 Product）
db.Preload("Orders.Product").First(&user, 1)
```

#### 4. 更新（Update）：修改数据

支持 **全量更新**（`Save`）、**指定字段更新**（`Update`/`Updates`）、**条件更新**，且支持 `BeforeUpdate`/`AfterUpdate` 钩子。

go











```go
var user User

// 1. 全量更新（Save）：先查询，再修改字段，最后保存（会更新所有字段，包括未修改的）
db.First(&user, 1)
user.Age = 21          // 修改年龄
user.Email = "new_zhangsan@test.com" // 修改邮箱
db.Save(&user)         // 等价于 UPDATE t_user SET ... WHERE id = 1

// 2. 指定字段更新（Update/Updates）：无需先查询，直接更新指定字段（推荐，效率更高）
// 单字段更新：Update(字段名, 值)
db.Model(&User{}).Where("id = ?", 1).Update("age", 22) // WHERE id = 1，只更新 age 字段

// 多字段更新：Updates(结构体/Map)
// 方式1：结构体（只更新非零字段，若字段为 0/"" 会被忽略）
db.Model(&User{}).Where("id = ?", 1).Updates(User{Age: 23, Email: "update_zhangsan@test.com"})

// 方式2：Map（强制更新所有指定字段，即使值为 0/""）
db.Model(&User{}).Where("id = ?", 1).Updates(map[string]interface{}{
  "age":  24,
  "email": "map_update_zhangsan@test.com",
})

// 3. 条件批量更新（所有年龄>25 的用户，年龄+1）
db.Model(&User{}).Where("age > ?", 25).Update("age", gorm.Expr("age + ?", 1)) // 用 Expr 支持 SQL 函数/表达式
```

#### 5. 删除（Delete）：删除数据

GORM 支持 **物理删除**（直接删除表记录）和 **软删除**（逻辑删除，通过 `DeletedAt` 字段标记）。

##### （1）软删除（默认，需模型含 `gorm.DeletedAt` 字段）

软删除后，查询时会自动过滤 `DeletedAt IS NOT NULL` 的记录，需用 `Unscoped()` 查看已删除记录。

go











```go
// 1. 软删除单条数据（ID=1）
db.Delete(&User{}, 1) // 等价于 UPDATE t_user SET deleted_at = NOW() WHERE id = 1

// 2. 软删除批量数据（年龄<18）
db.Where("age < ?", 18).Delete(&User{})

// 3. 查询已软删除的记录（需用 Unscoped() 取消过滤）
var deletedUsers []User
db.Unscoped().Where("deleted_at IS NOT NULL").Find(&deletedUsers)

// 4. 彻底删除已软删除的记录（物理删除，谨慎使用！）
db.Unscoped().Where("id = ?", 1).Delete(&User{})
```

##### （2）物理删除（无需 `gorm.DeletedAt` 字段，或用 `Unscoped()`）

go











```go
// 模型不含 gorm.DeletedAt 时，Delete 直接物理删除
db.Delete(&User{}, 1) // 等价于 DELETE FROM t_user WHERE id = 1
```

### 三、高级特性：事务、关联、原生 SQL

#### 1. 事务（Transaction）

GORM 支持事务管理，确保一组操作 “要么全部成功，要么全部失败”，核心方法是 `Begin()`/`Commit()`/`Rollback()`。

go











```go
// 1. 普通事务
tx := db.Begin() // 开启事务
defer func() {
  // 异常回滚（若 panic，先回滚再抛出）
  if r := recover(); r != nil {
    tx.Rollback()
    panic(r)
  }
  // 错误回滚（若业务错误，回滚）
  if tx.Error != nil {
    tx.Rollback()
  }
}()

// 业务操作1：创建用户
user := User{UserName: "transaction", Age: 30, Email: "transaction@test.com"}
if err := tx.Create(&user).Error; err != nil {
  return err // 触发 defer 回滚
}

// 业务操作2：给该用户创建订单
order := Order{UserID: user.ID, OrderNo: "TXN001", Amount: 200.0}
if err := tx.Create(&order).Error; err != nil {
  return err // 触发 defer 回滚
}

// 所有操作成功，提交事务
tx.Commit()

// 2. 嵌套事务（GORM v2 支持）
tx1 := db.Begin()
tx1.Create(&User{UserName: "tx1"})
tx2 := tx1.Begin() // 嵌套事务（实际是 Savepoint）
tx2.Create(&User{UserName: "tx2"})
tx2.Rollback() // 回滚 tx2（仅 tx2 的操作被回滚，tx1 的操作保留）
tx1.Commit()   // 提交 tx1（最终只保存 tx1 的 User）
```

#### 2. 关联操作（HasOne/HasMany/BelongsTo/ManyToMany）

GORM 支持四种核心关联关系，需通过模型标签定义外键和关联字段：

| 关联类型   | 场景示例                   | 模型定义核心标签                            |
| ---------- | -------------------------- | ------------------------------------------- |
| HasOne     | User 有一个 Profile        | `Profile Profile gorm:"foreignKey:UserID"`  |
| HasMany    | User 有多个 Order          | `Orders []Order gorm:"foreignKey:UserID"`   |
| BelongsTo  | Order 属于一个 User        | `UserID uint; User User`                    |
| ManyToMany | User 有多个 Role（多对多） | `Roles []Role gorm:"many2many:user_roles;"` |

**多对多示例（User ↔ Role）**：

go











```go
// 1. 定义模型（中间表 user_roles 自动创建）
type Role struct {
  gorm.Model
  Name string `gorm:"unique;not null"`
}

type User struct {
  gorm.Model
  UserName string
  Roles    []Role `gorm:"many2many:user_roles;foreignKey:ID;joinForeignKey:UserID;References:ID;joinReferences:RoleID"`
  // many2many: 中间表名；foreignKey: 当前模型（User）的外键；joinForeignKey: 中间表的 User 外键；
  // References: 关联模型（Role）的主键；joinReferences: 中间表的 Role 外键
}

// 2. 给用户添加角色（关联操作）
var user User
var role Role
db.First(&user, 1)   // 查询用户
db.First(&role, 1)   // 查询角色

// 方式1：Append 添加角色（中间表新增关联）
db.Model(&user).Association("Roles").Append(&role)

// 方式2：Replace 替换角色（先清空用户现有角色，再添加新角色）
db.Model(&user).Association("Roles").Replace([]Role{role})

// 3. 查询用户的所有角色
var roles []Role
db.Model(&user).Association("Roles").Find(&roles)

// 4. 解除用户与角色的关联
db.Model(&user).Association("Roles").Delete(&role)
```

#### 3. 原生 SQL（Raw/Exec）

当 GORM 封装的 API 无法满足复杂查询需求时，可直接执行原生 SQL：

go











```go
// 1. 原生查询（查询数据）
var users []User
// Raw 方法：执行原生 SELECT，Scan 映射到结构体
db.Raw("SELECT id, user_name, age FROM t_user WHERE age > ?", 20).Scan(&users)

// 2. 原生执行（写操作：INSERT/UPDATE/DELETE）
// Exec 方法：执行非查询 SQL，返回结果
result := db.Exec("UPDATE t_user SET age = age + 1 WHERE id = ?", 1)
fmt.Println("影响行数：", result.RowsAffected)

// 3. 结合 GORM 链式调用（用 Raw 写条件，用 GORM 方法分页）
db.Raw("SELECT * FROM t_user WHERE age > ?", 20).Offset(0).Limit(10).Scan(&users)
```

### 四、注意事项与性能优化

1. **避免 N+1 问题**：关联查询必须用 `Preload` 或 `Joins` 预加载，禁止循环查询关联数据；
2. **软删除陷阱**：含 `gorm.DeletedAt` 的模型，查询时默认过滤已删除记录，需用 `Unscoped()` 查看；
3. **更新字段控制**：优先用 `Model().Where().Updates()` 而非 `Save()`，避免更新无关字段；
4. **索引优化**：对频繁查询的字段（如 `user_name`、`user_id`），通过 `gorm:"index"` 加索引；
5. **批量操作优于循环**：批量创建 / 更新用 `Create(&slice)`/`Updates(map)`，减少 SQL 执行次数；
6. **日志级别控制**：生产环境将 GORM 日志级别设为 `logger.Error`，避免日志过多影响性能；
7. **连接池配置**：必须设置 `SetMaxOpenConns`/`SetMaxIdleConns`，避免高并发下连接泄漏。

### 总结

GORM 是 Go 语言操作数据库的 “瑞士军刀”，核心是通过 **模型映射** 简化 SQL 编写，同时提供事务、关联、迁移等企业级功能。掌握其 “约定优于配置” 的设计思想，以及 `Preload`（预加载）、`Updates`（指定更新）、`事务` 等核心用法，即可满足绝大多数业务场景。实际使用中需结合数据库性能优化（如索引、连接池），避免常见陷阱（如 N+1 问题、软删除过滤）。

相关视频

![img](./assets/icon.pngtplv-a9rns2rl98-image.png)



更亲近开发者的 Go ORM GORM 是为 Go 语言设计的一款优秀的 ORM 库，旨在为开发者提供友好的操作体验。它是一个全功能的 ORM 库，支持大多数关联类型如一对一、一对多、多对多、多态关联和单表继承。GORM 还提供了丰富的特性，比如事务处理、嵌套事务、Hooks（在创建、保存、更新、删除、查找前后的操作）、预加载、批量插入等等，几乎满足了现代 Web 应用对数据库操作的所有需求。 开源项目地址：https://github.com/go-gorm/gorm #ORM #数据库 #Go #关系型数据库 #艺术在抖音

出10道难度递增的八股文以及5道场景题

已完成思考



# GORM 八股文 + 场景题（含答案）

## 一、八股文题（10 道，难度递增）

### 1. 基础题：GORM 的核心定位是什么？如何安装 GORM 及 MySQL 驱动？

**答案**：

GORM 是 Go 语言生态中**主流的 ORM（对象关系映射）库**，核心定位是简化 Go 程序与数据库的交互，支持 MySQL、PostgreSQL 等主流数据库，通过 “约定优于配置” 降低 SQL 编写成本。

安装步骤（基于 GORM v2 版本）：

1. 安装 GORM 核心库：

   bash

   

   

   

   

   

   ```bash
   go get gorm.io/gorm
   ```

   

2. 安装 MySQL 驱动（GORM v2 需单独安装对应数据库驱动）：

   bash

   

   

   

   

   

   ```bash
   go get gorm.io/driver/mysql
   ```

   

### 2. 基础题：GORM 模型（Model）与数据库表的默认映射规则是什么？常用的字段标签有哪些？

**答案**：

#### （1）默认映射规则（约定优于配置）：

- 结构体名 → 表名：首字母小写 + 复数（如 `User` → `users`，`Order` → `orders`）；
- 字段名 → 列名：驼峰转蛇形（如 `UserName` → `user_name`，`CreateTime` → `create_time`）；
- 主键：字段名 `ID` 且类型为 `uint`/`int64` 时，默认作为自增主键；
- 时间字段：`CreatedAt`/`UpdatedAt` 会自动填充创建 / 更新时间；含 `gorm.DeletedAt` 字段时，默认开启软删除。

#### （2）常用字段标签：

- `gorm:"primaryKey"`：指定非 `ID` 字段为主键（如 `UserID string gorm:"primaryKey"`）；
- `gorm:"column:xxx"`：自定义列名（如 `Name string gorm:"column:user_name"`）；
- `gorm:"type:xxx"`：指定数据库字段类型（如 `Phone string gorm:"type:char(11)"`）；
- `gorm:"not null"`：非空约束；
- `gorm:"unique"`/`gorm:"uniqueIndex:idx_xxx"`：唯一约束 / 唯一索引；
- `gorm:"default:xxx"`：字段默认值（如 `Status int gorm:"default:1"`）；
- `gorm:"comment:xxx"`：字段注释（如 `gorm:"comment:'用户状态'"`）。

### 3. 中等题：如何初始化 GORM 数据库连接？请写出完整代码，并说明连接池配置的核心参数。

**答案**：

以 MySQL 为例，完整连接代码及连接池配置如下：

go











```go
package main

import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
  "gorm.io/gorm/logger"
  "time"
)

// 定义模型（示例）
type User struct {
  gorm.Model
  UserName string `gorm:"column:user_name;not null"`
}

func main() {
  // 1. 拼接 MySQL DSN（关键参数：parseTime=true 必须，用于解析时间类型）
  dsn := "root:123456@tcp(127.0.0.1:3306)/test_db?charset=utf8mb4&parseTime=true&loc=Local"

  // 2. 初始化 GORM DB 实例
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
    Logger: logger.Default.LogMode(logger.Info), // 日志级别（开发环境用 Info，生产用 Error）
  })
  if err != nil {
    panic("数据库连接失败：" + err.Error())
  }

  // 3. 配置连接池（生产环境必须配置，避免连接耗尽）
  sqlDB, err := db.DB()
  if err != nil {
    panic("获取 SQL 连接池失败：" + err.Error())
  }
  // 核心连接池参数
  sqlDB.SetMaxOpenConns(100)    // 最大打开连接数（不超过数据库最大连接数，如 MySQL 默认 151）
  sqlDB.SetMaxIdleConns(20)     // 最大空闲连接数（保持部分连接，减少创建开销）
  sqlDB.SetConnMaxLifetime(time.Hour) // 连接最大存活时间（避免超时连接）
}
```

### 4. 中等题：GORM 中如何实现 “单条创建” 和 “批量创建”？`First` 方法查询不到数据时会返回什么错误？如何处理？

**答案**：

#### （1）创建操作：

- **单条创建**：用 `Create` 方法，传入模型指针，成功后自动填充主键（如 `ID`）；

  go

  

  

  

  

  

  ```go
  user := User{UserName: "zhangsan", Age: 20}
  result := db.Create(&user) // 单条创建
  if result.Error != nil {
    panic("创建失败：" + result.Error.Error())
  }
  fmt.Println("新增用户 ID：", user.ID) // 自动填充 ID
  ```

  

- **批量创建**：传入模型切片，效率高于循环单条创建（减少 SQL 执行次数）；

  go

  

  

  

  

  

  ```go
  users := []User{
    {UserName: "lisi", Age: 22},
    {UserName: "wangwu", Age: 25},
  }
  result := db.Create(&users) // 批量创建
  fmt.Println("批量创建影响行数：", result.RowsAffected) // 输出 2
  ```

  

#### （2）`First` 方法的错误处理：

`First` 方法查询不到数据时，会返回 `gorm.ErrRecordNotFound` 错误（非 `nil`），需通过 `errors.Is` 判断处理：

go











```go
var user User
result := db.First(&user, 999) // 查询 ID=999 的用户（不存在）
if result.Error != nil {
  if errors.Is(result.Error, gorm.ErrRecordNotFound) {
    fmt.Println("用户不存在") // 正确处理“无数据”场景
  } else {
    panic("查询失败：" + result.Error.Error()) // 处理其他错误（如 SQL 语法错误）
  }
}
```

### 5. 中等题：GORM 中 `Save` 和 `Updates` 方法的区别是什么？如何实现 “条件批量更新”？

**答案**：

#### （1）`Save` vs `Updates` 核心区别：

| 方法      | 作用                                   | 适用场景                           | 注意事项                                        |
| --------- | -------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| `Save`    | 全量更新（先查询，再覆盖所有字段）     | 需更新大部分字段，或不清楚修改范围 | 会更新未修改的字段（如 `CreatedAt` 可能被重置） |
| `Updates` | 部分更新（仅更新指定字段，无需先查询） | 仅更新少量字段（如状态、年龄）     | 结构体传参时，仅更新非零字段；Map 传参强制更新  |

示例：

go











```go
// Save 全量更新（需先查询）
db.First(&user, 1)
user.Age = 21
db.Save(&user) // 更新所有字段（包括未修改的 UserName、Email 等）

// Updates 部分更新（无需查询）
// 方式1：结构体传参（仅更新非零字段，若 Age=0 则不更新）
db.Model(&User{}).Where("id = ?", 1).Updates(User{Age: 21})
// 方式2：Map 传参（强制更新所有指定字段，即使值为 0）
db.Model(&User{}).Where("id = ?", 1).Updates(map[string]interface{}{"age": 21, "status": 0})
```

#### （2）条件批量更新：

通过 `Where` 指定条件，`Updates` 批量更新符合条件的记录，示例：

go











```go
// 批量更新：所有年龄>25 的用户，年龄+1，状态设为 1
db.Model(&User{}).Where("age > ?", 25).Updates(map[string]interface{}{
  "age":   gorm.Expr("age + ?", 1), // 用 Expr 支持 SQL 表达式（避免注入）
  "status": 1,
})
```

### 6. 中等偏难题：GORM 软删除的实现原理是什么？如何查询 “已软删除的记录”？如何彻底删除软删除记录？

**答案**：

#### （1）软删除实现原理：

- 模型需嵌入 `gorm.DeletedAt` 字段（或直接定义 `DeletedAt gorm.DeletedAt`）；
- 执行 `Delete` 时，GORM 不执行 `DELETE` 语句，而是执行 `UPDATE` 语句，将 `deleted_at` 字段设为当前时间（标记为删除）；
- 后续查询（如 `Find`/`First`）时，GORM 会自动添加 `WHERE deleted_at IS NULL` 条件，过滤已软删除记录。

示例：

go











```go
type User struct {
  gorm.Model // 内置 DeletedAt 字段，开启软删除
  UserName string
}

// 软删除：ID=1 的用户（实际执行 UPDATE t_user SET deleted_at=NOW() WHERE id=1）
db.Delete(&User{}, 1)
```

#### （2）查询已软删除记录：

用 `Unscoped()` 取消 “过滤软删除记录” 的默认行为，示例：

go











```go
var deletedUsers []User
// 查询所有已软删除的用户（添加 WHERE deleted_at IS NOT NULL）
db.Unscoped().Where("deleted_at IS NOT NULL").Find(&deletedUsers)
```

#### （3）彻底删除软删除记录：

结合 `Unscoped()` 和 `Delete`，执行物理删除（`DELETE` 语句），示例：

go











```go
// 彻底删除 ID=1 的软删除用户（执行 DELETE FROM t_user WHERE id=1）
db.Unscoped().Delete(&User{}, 1)
```

### 7. 中等偏难题：GORM 如何实现事务？请写出 “创建用户并关联创建订单” 的事务代码，确保原子性。

**答案**：

GORM 通过 `Begin()` 开启事务，`Commit()` 提交，`Rollback()` 回滚，核心是 “所有操作在事务内执行，任一失败则全回滚”。

#### 事务代码示例（创建用户 + 订单，原子性保证）：

go











```go
// 定义关联模型
type Order struct {
  gorm.Model
  UserID  uint    `gorm:"column:user_id;not null"`
  OrderNo string  `gorm:"column:order_no;unique;not null"`
  Amount  float64 `gorm:"column:amount;not null"`
}

func CreateUserWithOrder(db *gorm.DB, userName string, orderNo string, amount float64) error {
  // 1. 开启事务
  tx := db.Begin()
  defer func() {
    // 异常处理：panic 时回滚
    if r := recover(); r != nil {
      tx.Rollback()
      // 可选：将 panic 转为 error 返回
      panic(r)
    }
    // 错误处理：业务错误时回滚
    if tx.Error != nil {
      tx.Rollback()
    }
  }()

  // 2. 事务内操作1：创建用户
  user := User{UserName: userName, Age: 20}
  if err := tx.Create(&user).Error; err != nil {
    return err // 触发 defer 回滚
  }

  // 3. 事务内操作2：创建关联订单（使用用户的 ID 作为外键）
  order := Order{
    UserID:  user.ID,
    OrderNo: orderNo,
    Amount:  amount,
  }
  if err := tx.Create(&order).Error; err != nil {
    return err // 触发 defer 回滚
  }

  // 4. 所有操作成功，提交事务
  return tx.Commit().Error
}

// 调用事务函数
err := CreateUserWithOrder(db, "zhaoliu", "ORD20240601001", 199.9)
if err != nil {
  fmt.Println("事务失败：", err)
} else {
  fmt.Println("事务成功：用户和订单创建完成")
}
```

### 8. 较难题：什么是 “N+1 查询问题”？GORM 如何通过预加载解决该问题？请写出带条件的预加载示例。

**答案**：

#### （1）N+1 查询问题定义：

当查询 N 条主数据（如 N 个用户），并循环查询每条主数据的关联数据（如每个用户的订单）时，会产生 “1 次主查询 + N 次关联查询”，导致 SQL 执行次数过多，性能低下。

示例（N+1 问题代码，不推荐）：

go











```go
var users []User
db.Find(&users) // 1 次主查询（获取所有用户）
for _, user := range users {
  var orders []Order
  db.Where("user_id = ?", user.ID).Find(&orders) // N 次关联查询（每个用户查一次订单）
  user.Orders = orders
}
```

#### （2）GORM 预加载解决 N+1 问题：

通过 `Preload` 方法，实现 “1 次主查询 + 1 次批量关联查询”，彻底解决 N+1 问题。

#### （3）带条件的预加载示例：

go











```go
var users []User
// 预加载用户的订单，且仅加载“金额>100”的订单（1 次主查询 + 1 次关联查询）
db.Preload("Orders", "amount > ?", 100).Find(&users)

// 模型需定义关联字段（User 1:N Order）
type User struct {
  gorm.Model
  UserName string  `gorm:"column:user_name"`
  Orders   []Order `gorm:"foreignKey:UserID"` // foreignKey 指定 Order 的外键字段
}

// 嵌套预加载（若 Order 还关联 Product，预加载 Order 的 Product）
db.Preload("Orders.Product", "price > ?", 50).Find(&users)
```

### 9. 难题：GORM 如何配置 “多对多关联”？请写出 “用户 - 角色” 多对多关联的模型定义及 “给用户添加角色”“查询用户角色” 的代码。

**答案**：

多对多关联需通过 “中间表” 实现，GORM 自动创建中间表（也可自定义），核心是通过 `many2many` 标签配置关联。

#### （1）模型定义（User ↔ Role 多对多）：

go











```go
// 角色模型
type Role struct {
  gorm.Model
  Name string `gorm:"column:name;unique;not null;comment:'角色名'"`
}

// 用户模型（多对多关联 Role）
type User struct {
  gorm.Model
  UserName string `gorm:"column:user_name;not null"`
  // many2many: 中间表名；foreignKey: User 的主键；joinForeignKey: 中间表的 User 外键；
  // References: Role 的主键；joinReferences: 中间表的 Role 外键
  Roles []Role `gorm:"many2many:user_roles;foreignKey:ID;joinForeignKey:UserID;References:ID;joinReferences:RoleID"`
}
```

- 中间表 `user_roles` 会自动创建，字段为 `user_id`（关联 User.ID）和 `role_id`（关联 Role.ID）。

#### （2）多对多关联操作：

1. **给用户添加角色**（中间表新增关联）：

   go

   

   

   

   

   

   ```go
   // 1. 查询用户和角色
   var user User
   var role Role
   db.First(&user, 1)   // 查询 ID=1 的用户
   db.First(&role, 1)   // 查询 ID=1 的角色（如“管理员”）
   
   // 2. 给用户添加单个角色（Append：新增关联，不覆盖现有角色）
   db.Model(&user).Association("Roles").Append(&role)
   
   // 3. 给用户添加多个角色（Replace：先清空现有角色，再添加新角色）
   otherRole := Role{Model: gorm.Model{ID: 2}} // ID=2 的角色（如“普通用户”）
   db.Model(&user).Association("Roles").Replace([]Role{role, otherRole})
   ```

   

2. **查询用户的所有角色**：

   go

   

   

   

   

   

   ```go
   var user User
   var roles []Role
   // 方式1：预加载查询
   db.Preload("Roles").First(&user, 1)
   roles = user.Roles
   
   // 方式2：通过 Association 直接查询
   db.Model(&user).Association("Roles").Find(&roles)
   fmt.Println("用户 ID=1 的角色：", roles)
   ```

   

3. **解除用户与角色的关联**：

   go

   

   

   

   

   

   ```go
   db.Model(&user).Association("Roles").Delete(&role) // 解除用户与指定角色的关联
   ```

   

### 10. 难题：生产环境中使用 GORM 有哪些性能优化手段？请至少说明 5 点。

**答案**：

生产环境 GORM 性能优化核心是 “减少 SQL 执行次数、降低数据库压力、避免无效操作”，关键手段如下：

1. **合理配置连接池**：

   必须设置 `SetMaxOpenConns`（不超过数据库最大连接数）、`SetMaxIdleConns`（保持适量空闲连接）、`SetConnMaxLifetime`（避免超时连接），避免连接泄漏或频繁创建销毁连接。

2. **使用预加载（Preload/Joins）避免 N+1 问题**：

   关联查询时，用 `Preload` 批量加载关联数据，替代循环查询，减少 SQL 执行次数。

3. **优先用批量操作替代循环操作**：

   批量创建（`Create(&slice)`）、批量更新（`Where().Updates()`）、批量删除（`Where().Delete()`），减少 SQL 执行次数（1 次批量操作 vs N 次单条操作）。

4. **添加索引优化查询**：

   对频繁查询的字段（如 `user_name`、`user_id`、`order_no`），通过 `gorm:"index:idx_xxx"` 或 `uniqueIndex` 添加索引，加速 `WHERE`/`JOIN` 语句查询。

5. **控制日志级别**：

   生产环境将 GORM 日志级别设为 `logger.Error`（仅输出错误日志），避免 `Info` 级别日志过多占用 IO 和内存（开发环境用 `Info` 方便调试）。

6. **避免全表查询和大结果集**：

   列表查询必须用 `Offset()`+`Limit()` 实现分页，避免 `Find(&slice)` 全表查询（数据量大时导致内存溢出）；用 `Select()` 指定需查询的字段，避免 `SELECT *` 加载无用字段。

7. **禁用默认事务（按需）**：

   GORM 对写操作（`Create`/`Update`/`Delete`）默认开启事务，若业务无需事务保证，可通过 `gorm.Config{SkipDefaultTransaction: true}` 禁用，提升性能。

## 二、场景题（5 道，贴近生产实践）

### 场景题 1：用户注册与订单创建（事务场景）

**问题**：开发 “用户注册后自动创建初始订单” 功能，要求：

1. 用户注册（创建 `User` 记录）；
2. 为新用户创建初始订单（`Order` 记录，`user_id` 关联新用户 ID，`amount=0`，`order_no` 为 UUID）；
3. 确保两步操作原子性（任一失败，均不生效）。

**答案**：

go











```go
package main

import (
  "github.com/google/uuid"
  "gorm.io/gorm"
)

// 1. 定义模型（User 和 Order）
type User struct {
  gorm.Model
  UserName string `gorm:"column:user_name;not null;unique"`
  Email    string `gorm:"column:email;not null;unique"`
}

type Order struct {
  gorm.Model
  UserID  uint    `gorm:"column:user_id;not null"`
  OrderNo string  `gorm:"column:order_no;unique;not null"`
  Amount  float64 `gorm:"column:amount;not null;default:0"`
}

// 2. 事务函数：注册用户并创建初始订单
func RegisterWithInitOrder(db *gorm.DB, userName, email string) (uint, error) {
  // 开启事务
  tx := db.Begin()
  defer func() {
    if r := recover(); r != nil {
      tx.Rollback()
      panic(r)
    }
    if tx.Error != nil {
      tx.Rollback()
    }
  }()

  // 步骤1：创建用户
  user := User{UserName: userName, Email: email}
  if err := tx.Create(&user).Error; err != nil {
    return 0, err // 用户创建失败，回滚
  }

  // 步骤2：创建初始订单（OrderNo 用 UUID 保证唯一）
  orderNo := uuid.NewString() // 生成唯一订单号
  order := Order{
    UserID:  user.ID,
    OrderNo: orderNo,
    Amount:  0, // 初始订单金额为 0
  }
  if err := tx.Create(&order).Error; err != nil {
    return 0, err // 订单创建失败，回滚
  }

  // 提交事务
  if err := tx.Commit().Error; err != nil {
    return 0, err
  }

  return user.ID, nil // 返回新用户 ID
}

// 3. 调用示例
func main() {
  // （省略数据库连接代码，同上题）
  userID, err := RegisterWithInitOrder(db, "newuser", "newuser@test.com")
  if err != nil {
    fmt.Printf("注册失败：%v\n", err)
  } else {
    fmt.Printf("注册成功！新用户 ID：%d，已创建初始订单\n", userID)
  }
}
```

### 场景题 2：用户列表分页查询（条件 + 排序场景）

**问题**：开发 “用户列表接口”，要求：

1. 支持按 “年龄范围”（`min_age`/`max_age`）过滤；
2. 支持按 “创建时间” 降序排序；
3. 支持分页（`page` 页码，`page_size` 每页条数）；
4. 返回结果包含 “总条数”“总页数”“当前页数据”。

**答案**：

go











```go
// 1. 定义请求参数和响应结构体
type UserListReq struct {
  MinAge    int `form:"min_age"`    // 最小年龄（可选）
  MaxAge    int `form:"max_age"`    // 最大年龄（可选）
  Page      int `form:"page" binding:"required,min=1"` // 当前页（必传，最小 1）
  PageSize  int `form:"page_size" binding:"required,min=1,max=100"` // 每页条数（1-100）
}

type UserListResp struct {
  Total    int    `json:"total"`    // 总条数
  TotalPage int    `json:"total_page"`// 总页数
  Page      int    `json:"page"`    // 当前页
  PageSize  int    `json:"page_size"`// 每页条数
  List      []User `json:"list"`    // 当前页数据
}

// 2. 分页查询函数
func GetUserList(db *gorm.DB, req UserListReq) (UserListResp, error) {
  var (
    resp     UserListResp
    users    []User
    total    int64
    offset   = (req.Page - 1) * req.PageSize // 计算偏移量
  )

  // 构建查询条件
  tx := db.Model(&User{})
  // 年龄范围过滤（若参数非零则添加条件）
  if req.MinAge > 0 {
    tx = tx.Where("age >= ?", req.MinAge)
  }
  if req.MaxAge > 0 {
    tx = tx.Where("age <= ?", req.MaxAge)
  }

  // 步骤1：查询总条数
  if err := tx.Count(&total).Error; err != nil {
    return resp, err
  }

  // 步骤2：查询当前页数据（按创建时间降序）
  if err := tx.Order("created_at DESC").Offset(offset).Limit(req.PageSize).Find(&users).Error; err != nil {
    return resp, err
  }

  // 计算总页数
  totalPage := int((total + int64(req.PageSize) - 1) / int64(req.PageSize)) // 向上取整

  // 组装响应
  resp = UserListResp{
    Total:    int(total),
    TotalPage: totalPage,
    Page:      req.Page,
    PageSize:  req.PageSize,
    List:      users,
  }

  return resp, nil
}

// 3. 调用示例（结合 Gin 接口）
// func UserListHandler(c *gin.Context) {
//   var req UserListReq
//   if err := c.ShouldBindQuery(&req); err != nil {
//     c.JSON(400, gin.H{"error": err.Error()})
//     return
//   }
//   resp, err := GetUserList(db, req)
//   if err != nil {
//     c.JSON(500, gin.H{"error": "查询失败"})
//     return
//   }
//   c.JSON(200, resp)
// }
```

### 场景题 3：关联查询优化（预加载场景）

**问题**：开发 “订单详情接口”，需返回 “订单信息” 及关联的 “用户信息” 和 “订单商品列表”，要求避免 N+1 查询问题。

**答案**：

go











```go
// 1. 定义关联模型
type Product struct {
  gorm.Model
  Name  string  `gorm:"column:name;not null"`
  Price float64  `gorm:"column:price;not null"`
}

type OrderItem struct {
  gorm.Model
  OrderID   uint    `gorm:"column:order_id;not null;index"` // 关联 Order.ID
  ProductID uint    `gorm:"column:product_id;not null;index"`// 关联 Product.ID
  Quantity  int     `gorm:"column:quantity;not null;default:1"`// 商品数量
  Product   Product  `gorm:"foreignKey:ProductID"` // 关联 Product
}

type Order struct {
  gorm.Model
  UserID    uint        `gorm:"column:user_id;not null;index"`
  OrderNo   string      `gorm:"column:order_no;unique;not null"`
  Amount    float64     `gorm:"column:amount;not null"`
  User      User        `gorm:"foreignKey:UserID"` // 关联 User（1:1）
  OrderItems []OrderItem `gorm:"foreignKey:OrderID"`// 关联 OrderItem（1:N）
}

// 2. 订单详情查询函数（预加载关联，避免 N+1）
func GetOrderDetail(db *gorm.DB, orderID uint) (Order, error) {
  var order Order
  // 预加载：Order → User（用户信息）、Order → OrderItems → Product（订单商品及商品详情）
  err := db.Preload("User").Preload("OrderItems.Product").First(&order, orderID).Error
  return order, err
}

// 3. 调用示例
func main() {
  // （省略数据库连接）
  order, err := GetOrderDetail(db, 1) // 查询 ID=1 的订单详情
  if err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
      fmt.Println("订单不存在")
      return
    }
    panic("查询失败：" + err.Error())
  }

  // 打印结果
  fmt.Printf("订单号：%s，用户：%s，总金额：%.2f\n", order.OrderNo, order.User.UserName, order.Amount)
  fmt.Println("订单商品：")
  for _, item := range order.OrderItems {
    fmt.Printf("- 商品：%s，数量：%d，单价：%.2f\n", item.Product.Name, item.Quantity, item.Product.Price)
  }
}
```

### 场景题 4：软删除与数据恢复（软删除场景）

**问题**：开发 “用户删除与恢复” 功能，要求：

1. 删除用户时采用软删除（而非物理删除）；
2. 提供 “恢复已删除用户” 的接口（将 `deleted_at` 设为 `NULL`）；
3. 提供 “彻底删除用户” 的接口（仅管理员可操作，物理删除）。

**答案**：

go











```go
// 1. 模型定义（含软删除字段）
type User struct {
  gorm.Model // 内置 DeletedAt，开启软删除
  UserName string `gorm:"column:user_name;not null"`
  Role     string `gorm:"column:role;not null;default:'user'"` // role=admin 为管理员
}

// 2. 软删除用户（普通用户删除）
func SoftDeleteUser(db *gorm.DB, userID uint) error {
  return db.Delete(&User{}, userID).Error
}

// 3. 恢复已软删除用户（需管理员权限）
func RestoreUser(db *gorm.DB, userID uint) error {
  // 用 Unscoped() 取消软删除过滤，更新 deleted_at 为 NULL
  return db.Unscoped().Model(&User{}).Where("id = ?", userID).Update("deleted_at", nil).Error
}

// 4. 彻底删除用户（仅管理员可操作，物理删除）
func HardDeleteUser(db *gorm.DB, operatorID, userID uint) error {
  // 步骤1：校验操作者是否为管理员
  var operator User
  if err := db.First(&operator, operatorID).Error; err != nil {
    return err
  }
  if operator.Role != "admin" {
    return fmt.Errorf("无权限：仅管理员可彻底删除用户")
  }

  // 步骤2：物理删除用户（Unscoped() + Delete()）
  return db.Unscoped().Delete(&User{}, userID).Error
}

// 5. 调用示例
func main() {
  // （省略数据库连接）
  adminID := uint(1) // 管理员 ID=1
  userID := uint(2)  // 待操作用户 ID=2

  // 1. 软删除用户
  if err := SoftDeleteUser(db, userID); err != nil {
    panic("软删除失败：" + err.Error())
  }
  fmt.Println("用户已软删除")

  // 2. 恢复用户
  if err := RestoreUser(db, userID); err != nil {
    panic("恢复失败：" + err.Error())
  }
  fmt.Println("用户已恢复")

  // 3. 彻底删除用户（管理员操作）
  if err := HardDeleteUser(db, adminID, userID); err != nil {
    panic("彻底删除失败：" + err.Error())
  }
  fmt.Println("用户已彻底删除（物理删除）")
}
```

### 场景题 5：批量更新与原生 SQL（复杂更新场景）

**问题**：开发 “订单状态批量更新” 功能，要求：

1. 将 “创建时间超过 7 天且状态为待支付（status=0）” 的订单，批量更新为 “已取消（status=2）”；
2. 记录更新时间（`updated_at` 自动更新）；
3. 若 GORM 封装方法无法满足，可结合原生 SQL 实现。

**答案**：

go











```go
// 1. 模型定义
type Order struct {
  gorm.Model
  OrderNo string `gorm:"column:order_no;unique;not null"`
  Status  int    `gorm:"column:status;not null;default:0"` // 0=待支付，1=已支付，2=已取消
}

// 2. 批量更新订单状态（两种实现方式）
func BatchCancelExpiredOrders(db *gorm.DB) (int64, error) {
  // 方式1：GORM 封装方法（推荐，避免 SQL 注入）
  // 条件：created_at < 当前时间-7天，且 status=0
  sevenDaysAgo := time.Now().AddDate(0, 0, -7)
  result := db.Model(&Order{}).
    Where("created_at < ?", sevenDaysAgo).
    Where("status = ?", 0).
    Updates(map[string]interface{}{"status": 2})

  // // 方式2：原生 SQL（若需更复杂逻辑，如关联子查询）
  // sql := `UPDATE orders SET status = 2, updated_at = NOW() WHERE created_at < ? AND status = 0`
  // result := db.Exec(sql, sevenDaysAgo)

  return result.RowsAffected, result.Error
}

// 3. 调用示例
func main() {
  // （省略数据库连接）
  affected, err := BatchCancelExpiredOrders(db)
  if err != nil {
    panic("批量更新失败：" + err.Error())
  }
  fmt.Printf("成功取消 %d 个过期待支付订单\n", affected)
}
```