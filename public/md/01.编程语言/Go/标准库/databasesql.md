### Go 语言`database/sql`标准库深入讲解与示例

#### 一、`database/sql`包核心功能概述

`database/sql`是 Go 语言处理**关系型数据库**的标准抽象层，提供了一套统一的接口用于与各种数据库（如 MySQL、PostgreSQL、SQLite 等）交互。其核心价值在于：

- **数据库无关性**：通过统一接口屏蔽不同数据库的实现差异，切换数据库时无需大幅修改代码；
- **连接管理**：内置连接池，自动管理数据库连接的创建、复用和释放；
- **SQL 执行与结果处理**：支持执行查询（`SELECT`）、命令（`INSERT`/`UPDATE`/`DELETE`）及事务操作；
- **类型安全**：提供类型转换机制，将数据库返回的字段映射为 Go 原生类型。

使用时需配合具体数据库的驱动（如`github.com/go-sql-driver/mysql` for MySQL），驱动通过实现`database/sql/driver`接口与`database/sql`协作。

### 二、核心概念与接口

`database/sql`的核心概念围绕 “连接”“查询”“结果” 展开，关键接口和类型如下：

| 类型 / 接口  | 作用描述                                             |
| ------------ | ---------------------------------------------------- |
| `sql.DB`     | 数据库连接池的抽象，代表一个数据库实例，是操作入口   |
| `sql.Stmt`   | 预编译语句，可重复执行，提升性能并防止 SQL 注入      |
| `sql.Row`    | 单行查询结果，用于`QueryRow`返回单条记录             |
| `sql.Rows`   | 多行查询结果，用于`Query`返回多条记录                |
| `sql.Result` | 执行命令（`Exec`）的结果，包含受影响行数和自增 ID    |
| `sql.Tx`     | 数据库事务，支持提交（`Commit`）和回滚（`Rollback`） |

#### 1. `sql.DB`：连接池的核心

`sql.DB`并非直接对应单个数据库连接，而是**连接池的管理器**，负责：

- 维护连接池，按需创建和复用连接；
- 分发连接给查询操作，完成后回收；
- 处理连接超时、失效重连等。

通过`sql.Open(driverName, dataSourceName)`创建`*sql.DB`，其中：

- `driverName`：驱动注册的名称（如 MySQL 驱动通常为`"mysql"`）；
- `dataSourceName`：数据库连接字符串（格式由驱动定义，如`"user:pass@tcp(addr)/dbname"`）。

### 三、核心功能与示例代码

#### 1. 基础使用流程（以 MySQL 为例）

go

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql" // 导入MySQL驱动（_表示仅执行init函数）
)

func main() {
	// 1. 打开数据库（创建连接池）
	// 连接字符串格式：用户名:密码@tcp(地址:端口)/数据库名?参数
	dsn := "root:password@tcp(localhost:3306)/testdb?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("无法打开数据库: %v", err)
	}
	defer db.Close() // 程序退出时关闭连接池

	// 2. 验证连接（可选但推荐，Open不会立即建立连接）
	err = db.Ping()
	if err != nil {
		log.Fatalf("无法连接到数据库: %v", err)
	}
	fmt.Println("数据库连接成功")

	// 3. 设置连接池参数（可选）
	db.SetMaxOpenConns(20)       // 最大打开连接数（默认无限制）
	db.SetMaxIdleConns(10)       // 最大空闲连接数
	db.SetConnMaxLifetime(300)   // 连接的最大存活时间（秒）
	db.SetConnMaxIdleTime(60)    // 连接的最大空闲时间（秒）
}
```

**注意**：

- `sql.Open`不会立即建立连接，仅初始化连接池，需通过`Ping`验证连接有效性；
- 连接池参数需根据数据库性能和业务需求调整，避免连接数过多导致数据库压力过大。

#### 2. 执行 SQL 命令（`Exec`）

用于执行`INSERT`/`UPDATE`/`DELETE`等不返回结果集的命令，返回`sql.Result`。

go

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/testdb")
	if err != nil || db.Ping() != nil {
		log.Fatal("数据库连接失败")
	}
	defer db.Close()

	// 1. 执行INSERT
	name := "Alice"
	age := 30
	result, err := db.Exec("INSERT INTO users (name, age) VALUES (?, ?)", name, age)
	if err != nil {
		log.Fatalf("INSERT失败: %v", err)
	}

	// 获取自增ID（仅支持有自增主键的表）
	lastID, err := result.LastInsertId()
	if err != nil {
		log.Fatalf("获取LastInsertId失败: %v", err)
	}
	fmt.Printf("插入成功，自增ID: %d\n", lastID)

	// 获取受影响的行数
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Fatalf("获取RowsAffected失败: %v", err)
	}
	fmt.Printf("受影响行数: %d\n", rowsAffected)

	// 2. 执行UPDATE
	newAge := 31
	result, err = db.Exec("UPDATE users SET age = ? WHERE name = ?", newAge, name)
	if err != nil {
		log.Fatalf("UPDATE失败: %v", err)
	}
	rowsAffected, _ = result.RowsAffected()
	fmt.Printf("更新受影响行数: %d\n", rowsAffected)

	// 3. 执行DELETE
	result, err = db.Exec("DELETE FROM users WHERE name = ?", name)
	if err != nil {
		log.Fatalf("DELETE失败: %v", err)
	}
	rowsAffected, _ = result.RowsAffected()
	fmt.Printf("删除受影响行数: %d\n", rowsAffected)
}
```

**参数占位符**：

- 不同数据库的占位符格式可能不同（如 MySQL 用`?`，PostgreSQL 用`$1`/`$2`），由驱动决定；
- 始终使用参数化查询，避免字符串拼接 SQL（防止 SQL 注入）。

#### 3. 执行查询（`Query`与`QueryRow`）

- `Query`：用于`SELECT`查询，返回多行结果（`*sql.Rows`）；
- `QueryRow`：用于查询单条记录，返回`*sql.Row`（更简洁）。

go

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

type User struct {
	ID   int
	Name string
	Age  int
}

func main() {
	db, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/testdb")
	if err != nil || db.Ping() != nil {
		log.Fatal("数据库连接失败")
	}
	defer db.Close()

	// 1. Query：查询多行
	ageThreshold := 25
	rows, err := db.Query("SELECT id, name, age FROM users WHERE age > ?", ageThreshold)
	if err != nil {
		log.Fatalf("Query失败: %v", err)
	}
	defer rows.Close() // 必须关闭rows，否则连接不会被回收

	var users []User
	// 遍历结果集
	for rows.Next() {
		var u User
		// 将行数据扫描到结构体（字段顺序需与SELECT一致）
		err := rows.Scan(&u.ID, &u.Name, &u.Age)
		if err != nil {
			log.Fatalf("Scan失败: %v", err)
		}
		users = append(users, u)
	}

	// 检查遍历过程中的错误
	if err = rows.Err(); err != nil {
		log.Fatalf("rows遍历错误: %v", err)
	}

	fmt.Printf("年龄大于%d的用户:\n", ageThreshold)
	for _, u := range users {
		fmt.Printf("ID: %d, Name: %s, Age: %d\n", u.ID, u.Name, u.Age)
	}

	// 2. QueryRow：查询单行（适合按唯一键查询）
	var u User
	err = db.QueryRow("SELECT id, name, age FROM users WHERE id = ?", 1).
		Scan(&u.ID, &u.Name, &u.Age)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("未找到用户")
		} else {
			log.Fatalf("QueryRow失败: %v", err)
		}
	} else {
		fmt.Printf("查询到用户: ID=%d, Name=%s, Age=%d\n", u.ID, u.Name, u.Age)
	}
}
```

**结果处理注意事项**：

- `rows.Next()`：迭代结果集，返回`false`表示遍历结束；
- `rows.Scan()`：将字段值映射到 Go 变量，变量类型需与数据库字段兼容（如`INT`→`int`，`VARCHAR`→`string`）；
- 必须调用`rows.Close()`释放连接，即使查询失败也需关闭（通常用`defer`）；
- `QueryRow`的`Scan`在无结果时返回`sql.ErrNoRows`，需单独处理。

#### 4. 预编译语句（`Stmt`）

对于重复执行的 SQL，预编译语句（`*sql.Stmt`）可提升性能（数据库只需解析一次 SQL），并减少 SQL 注入风险。

go

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/testdb")
	if err != nil || db.Ping() != nil {
		log.Fatal("数据库连接失败")
	}
	defer db.Close()

	// 1. 预编译INSERT语句
	insertStmt, err := db.Prepare("INSERT INTO users (name, age) VALUES (?, ?)")
	if err != nil {
		log.Fatalf("Prepare失败: %v", err)
	}
	defer insertStmt.Close()

	// 重复执行预编译语句
	users := []struct{ name string; age int }{
		{"Bob", 28},
		{"Charlie", 35},
	}
	for _, u := range users {
		result, err := insertStmt.Exec(u.name, u.age)
		if err != nil {
			log.Printf("插入失败: %v", err)
			continue
		}
		id, _ := result.LastInsertId()
		fmt.Printf("插入用户 %s，ID: %d\n", u.name, id)
	}

	// 2. 预编译查询语句
	queryStmt, err := db.Prepare("SELECT name, age FROM users WHERE id = ?")
	if err != nil {
		log.Fatalf("Prepare查询失败: %v", err)
	}
	defer queryStmt.Close()

	// 执行查询
	var name string
	var age int
	err = queryStmt.QueryRow(1).Scan(&name, &age)
	if err == nil {
		fmt.Printf("ID=1的用户: %s, %d岁\n", name, age)
	}
}
```

#### 5. 事务处理（`Tx`）

事务用于将多个 SQL 操作视为原子操作（要么全部成功，要么全部失败），适用于转账、订单创建等场景。

go

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/testdb")
	if err != nil || db.Ping() != nil {
		log.Fatal("数据库连接失败")
	}
	defer db.Close()

	// 1. 开始事务
	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Begin事务失败: %v", err)
	}

	// 2. 执行事务内的操作
	// 示例：转账（A减少100，B增加100）
	_, err1 := tx.Exec("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
	_, err2 := tx.Exec("UPDATE accounts SET balance = balance + 100 WHERE id = 2")

	// 3. 判断是否提交或回滚
	if err1 != nil || err2 != nil {
		// 有错误，回滚事务
		tx.Rollback()
		log.Printf("事务回滚，错误: err1=%v, err2=%v", err1, err2)
		return
	}

	// 无错误，提交事务
	err = tx.Commit()
	if err != nil {
		log.Fatalf("提交事务失败: %v", err)
	}
	fmt.Println("事务提交成功")
}
```

**事务注意事项**：

- 事务期间，连接会被独占，直到`Commit`或`Rollback`；
- 长时间未提交的事务可能导致连接池耗尽，需控制事务执行时间；
- 事务内的查询应使用`tx.Query`/`tx.Exec`，而非`db.Query`/`db.Exec`（确保使用同一连接）。

### 四、常见问题与最佳实践

1. **空值处理**：
   数据库的`NULL`值需用`sql.NullXXX`类型接收（如`sql.NullString`、`sql.NullInt64`），避免`Scan`失败：

   go

   ```go
   var name sql.NullString
   err := db.QueryRow("SELECT name FROM users WHERE id=?", 1).Scan(&name)
   if name.Valid { // 检查是否为NULL
       fmt.Println("Name:", name.String)
   } else {
       fmt.Println("Name is NULL")
   }
   ```

2. **连接池管理**：

   - `SetMaxOpenConns`：不应超过数据库允许的最大连接数（如 MySQL 默认`max_connections=151`）；
   - `SetMaxIdleConns`：建议与`SetMaxOpenConns`保持一致，避免频繁创建连接；
   - 定期检查连接有效性（部分驱动支持`keepalive`参数）。

3. **错误处理**：

   - 区分常见错误（如`sql.ErrNoRows`表示无结果，非错误）；
   - 执行`Exec`/`Query`后需检查错误，避免无效操作。

4. **性能优化**：

   - 批量操作使用`Stmt`预编译；
   - 大结果集分页查询（`LIMIT/OFFSET`），避免一次性加载过多数据；
   - 避免在循环中执行`Query`，改为批量查询。

5. **SQL 注入防护**：

   - 始终使用参数化查询（`?`或`$n`占位符），禁止字符串拼接 SQL；
   - 对用户输入进行验证和过滤。

### 五、总结

`database/sql`提供了一套简洁而强大的数据库操作抽象，其核心优势在于：

- 统一接口，降低跨数据库迁移成本；
- 内置连接池，简化资源管理；
- 支持事务、预编译等高级特性。

使用时需结合具体数据库驱动，并注意连接池配置、错误处理和安全防护。掌握`database/sql`是 Go 语言开发后端应用、处理关系型数据库的基础技能。