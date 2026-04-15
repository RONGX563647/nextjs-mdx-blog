[MySQL基础篇 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/5df9fc29e4b06c8b0bb390ee)

[Mysql基础知识 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/61f797051efad479c07919a0)

[MySQL命令 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/624ad8331efad40756e1bcfb)



# MySQL 基本使用全面讲解

MySQL 是一款开源的关系型数据库管理系统（RDBMS），以轻量、高效、易扩展的特点，广泛应用于 Web 开发、数据分析等场景。掌握其基本使用，需从「环境准备→基础概念→核心 SQL 操作→日常管理」逐步推进，以下结合实操示例，覆盖新手必备的全部知识点。

## 一、环境准备：安装与连接 MySQL

在使用 MySQL 前，需先完成「安装→启动服务→连接数据库」三步，不同操作系统的操作略有差异。

### 1. 安装 MySQL（主流操作系统）

MySQL 提供社区版（免费）和企业版（收费），日常开发优先选择 **MySQL Community Server**，下载地址：[MySQL 官方下载页](https://dev.mysql.com/downloads/mysql/)。

#### （1）Windows 系统

1. 下载「MySQL Installer for Windows」（如 `mysql-installer-community-8.0.36.0.msi`）；
2. 双击运行安装包，选择「Custom」自定义安装，勾选「MySQL Server 8.0.x」（核心服务）；
3. 配置端口（默认 3306，建议保持）、root 密码（需牢记，后续连接用）；
4. 安装完成后，勾选「Start the MySQL Server at System Startup」（开机启动服务）。

#### （2）Linux 系统（以 CentOS 为例）

通过 `yum` 包管理器安装，步骤更简洁：

bash











```bash
# 1. 安装 MySQL 官方仓库
sudo rpm -Uvh https://dev.mysql.com/get/mysql80-community-release-el8-3.noarch.rpm

# 2. 安装 MySQL 服务
sudo yum install -y mysql-community-server

# 3. 启动服务并设置开机自启
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 4. 查看初始密码（MySQL 8.0 首次启动会生成临时密码）
sudo grep 'temporary password' /var/log/mysqld.log
```

#### （3）macOS 系统

推荐用 `brew`（包管理器）安装：

bash











```bash
# 1. 安装 MySQL
brew install mysql

# 2. 启动服务（开机自启）
brew services start mysql

# 3. 初始化配置（设置 root 密码）
mysql_secure_installation
```

### 2. 验证服务状态

安装后需确认 MySQL 服务已启动，避免连接失败：

- **Windows**：打开「服务」（搜索 `services.msc`），找到「MySQL80」，状态需为「正在运行」；
- **Linux**：`sudo systemctl status mysqld`，输出 `active (running)` 即为正常；
- **macOS**：`brew services list`，MySQL 行状态为 `started` 即为正常。

### 3. 连接 MySQL（两种核心方式）

MySQL 支持「命令行连接」（轻量，适合脚本）和「图形化工具连接」（直观，适合日常开发）。

#### （1）命令行连接（基础）

打开终端 / 命令提示符，输入以下命令，按提示输入 root 密码：

bash











```bash
# 基本语法：mysql -u 用户名 -p 密码 -h 主机地址 -P 端口
mysql -u root -p  # 简化版：默认连接本地（127.0.0.1）、端口 3306，密码后续输入（避免明文暴露）
```

- 连接成功后，终端会显示 `mysql>` 提示符，表明已进入 MySQL 交互环境；
- 退出连接：输入 `exit;` 或 `quit;`（注意 SQL 语句需以分号 `;` 结尾）。

#### （2）图形化工具连接（推荐新手）

主流工具：**Navicat Premium**、**DBeaver**（开源免费）、**MySQL Workbench**（官方工具），以 DBeaver 为例：

1. 打开 DBeaver，点击「新建连接」→ 选择「MySQL」；
2. 填写连接信息：
   - 主机：`localhost` 或 `127.0.0.1`（本地）；
   - 端口：`3306`（默认）；
   - 数据库：暂不填（连接后可选择）；
   - 用户名：`root`；
   - 密码：安装时设置的 root 密码；
3. 点击「测试连接」，提示「连接成功」后，点击「完成」。

## 二、MySQL 核心基础概念

在写 SQL 前，需先理解 MySQL 的「数据组织逻辑」，避免概念混淆。

| 概念                  | 定义                                                         | 类比（文件夹 / 文件）          |
| --------------------- | ------------------------------------------------------------ | ------------------------------ |
| 数据库（Database）    | 存储多个表的「容器」，每个数据库有独立的权限和字符集         | 电脑中的「文件夹」             |
| 表（Table）           | 数据库中实际存储数据的「二维表格」，由行（记录）和列（字段）组成 | 文件夹中的「Excel 文件」       |
| 字段（Column）        | 表的「列」，定义数据的类型（如姓名是字符串、年龄是数字）     | Excel 中的「表头」             |
| 记录（Row）           | 表的「行」，对应一条完整的数据（如一条用户信息）             | Excel 中的「一行数据」         |
| 数据类型（Data Type） | 定义字段可存储的数据种类（如 `int` 存整数、`varchar` 存字符串） | Excel 单元格的「数据格式」     |
| 主键（Primary Key）   | 表中唯一标识一条记录的字段（如用户 ID），不可重复、不可为空  | 身份证号（唯一标识一个人）     |
| 外键（Foreign Key）   | 关联两个表的字段（如订单表的「用户 ID」关联用户表的「ID」），保证数据一致性 | 订单中的「客户编号」关联客户表 |

### 常用数据类型（新手必知）

选择正确的数据类型是数据库设计的基础，避免存储冗余或数据溢出：

| 数据类型       | 用途说明                                                     | 示例                                          |
| -------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `int`          | 存储整数（范围：-2^31~2^31-1，约 ±20 亿）                    | 年龄（`age int`）                             |
| `bigint`       | 存储大整数（范围：-2^63~2^63-1）                             | 订单号（`order_id bigint`）                   |
| `varchar(n)`   | 存储变长字符串（n 为最大长度，如 `varchar(50)`）             | 姓名（`name varchar(50)`）                    |
| `char(n)`      | 存储定长字符串（不足补空格，适合固定长度数据）               | 手机号（`phone char(11)`）                    |
| `datetime`     | 存储日期 + 时间（格式：YYYY-MM-DD HH:MM:SS，范围 1000-01-01~9999-12-31） | 创建时间（`create_time datetime`）            |
| `date`         | 仅存储日期（格式：YYYY-MM-DD）                               | 生日（`birthday date`）                       |
| `decimal(m,d)` | 存储高精度小数（m 总位数，d 小数位数）                       | 金额（`price decimal(10,2)`，如 99999999.99） |

## 三、核心 SQL 操作：从建库到查改删

SQL（结构化查询语言）是操作 MySQL 的 “语言”，按功能分为 **DDL（数据定义）、DML（数据操纵）、DQL（数据查询）、DCL（数据控制）**，新手需优先掌握前三者。

### 1. DDL：数据定义语言（建库、建表、改表结构）

用于「创建 / 删除 / 修改数据库和表」，核心命令：`CREATE`（创建）、`ALTER`（修改）、`DROP`（删除）、`USE`（切换数据库）。

#### （1）数据库操作

sql











```sql
-- 1. 创建数据库（指定字符集 utf8mb4，支持 emoji 表情）
CREATE DATABASE IF NOT EXISTS test_db 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_general_ci;

-- 2. 切换到目标数据库（后续操作针对该库）
USE test_db;

-- 3. 查看所有数据库
SHOW DATABASES;

-- 4. 查看当前数据库信息
SELECT DATABASE();

-- 5. 删除数据库（谨慎！不可逆）
DROP DATABASE IF EXISTS test_db;
```

- `IF NOT EXISTS`：避免 “数据库已存在” 报错；
- `utf8mb4`：MySQL 中真正的 UTF-8（`utf8` 实际是 utf8mb3，不支持 emoji），推荐所有数据库默认使用。

#### （2）表操作（核心）

以创建「用户表（user）」为例，包含 `id`（主键）、`username`（用户名）、`age`（年龄）、`create_time`（创建时间）：

sql











```sql
-- 1. 创建表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- 主键，自增（无需手动插入）
    username VARCHAR(50) NOT NULL UNIQUE,  -- 用户名：非空、唯一（避免重复注册）
    age INT DEFAULT 0,                     -- 年龄：默认值 0（未填写时自动填充）
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP  -- 创建时间：默认当前时间
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 查看当前数据库的所有表
SHOW TABLES;

-- 3. 查看表结构（字段名、类型、约束）
DESC user;  -- 简化版
-- 或查看创建表的完整 SQL（含引擎、字符集）
SHOW CREATE TABLE user;

-- 4. 修改表结构（如新增「手机号」字段）
ALTER TABLE user 
ADD COLUMN phone CHAR(11) UNIQUE COMMENT '手机号' AFTER username;  -- AFTER 指定字段位置

-- 5. 删除表（谨慎！不可逆）
DROP TABLE IF EXISTS user;
```

- **引擎 `ENGINE=InnoDB`**：MySQL 8.0 默认引擎，支持事务、外键、行级锁（适合生产环境）；

- 约束说明

  ：

  - `PRIMARY KEY`：主键（唯一标识记录）；
  - `AUTO_INCREMENT`：自增（仅用于整数主键，每次插入自动 + 1）；
  - `NOT NULL`：字段不可为空（必须填写）；
  - `UNIQUE`：字段值唯一（避免重复，如用户名、手机号）；
  - `DEFAULT`：默认值（未插入时自动填充）；
  - `COMMENT`：字段注释（方便他人理解字段含义）。

### 2. DML：数据操纵语言（增删改数据）

用于「插入、删除、修改表中的记录」，核心命令：`INSERT`（增）、`UPDATE`（改）、`DELETE`（删）。

#### （1）插入数据（`INSERT`）

sql











```sql
-- 1. 插入单条数据（指定字段，推荐：顺序可自定义，未指定字段用默认值）
INSERT INTO user (username, age, phone) 
VALUES ('zhangsan', 20, '13800138000');

-- 2. 插入多条数据（批量插入，效率高于单条多次插入）
INSERT INTO user (username, age, phone) 
VALUES 
('lisi', 22, '13900139000'),
('wangwu', 25, '13700137000');

-- 3. 插入所有字段（不推荐：需严格按表字段顺序，表结构变更后会报错）
INSERT INTO user 
VALUES (NULL, 'zhaoliu', 28, '13600136000', '2024-05-01 10:00:00');  -- 主键自增填 NULL
```

- 主键 `id` 自增时，插入可填 `NULL` 或省略该字段，MySQL 会自动生成唯一值；
- 执行后若提示 `Query OK, 1 row affected (0.01 sec)`，表示插入成功（`1 row affected` 即影响 1 条记录）。

#### （2）修改数据（`UPDATE`）

sql











```sql
-- 1. 修改指定记录（必须加 WHERE 条件！否则全表修改）
UPDATE user 
SET age = 21, phone = '13800138001'  -- 多个字段用逗号分隔
WHERE username = 'zhangsan';         -- 条件：仅修改用户名是 zhangsan 的记录

-- 2. 批量修改（按条件匹配多条）
UPDATE user 
SET age = age + 1  -- 年龄自增 1
WHERE age < 25;    -- 条件：年龄小于 25 的所有用户
```

- **致命提醒**：`UPDATE` 必须加 `WHERE` 条件！若省略 `WHERE`，会修改表中所有记录（如 `UPDATE user SET age=30;` 会把所有用户年龄改为 30），生产环境需格外谨慎。

#### （3）删除数据（`DELETE`）

sql











```sql
-- 1. 删除指定记录（必须加 WHERE 条件！否则全表删除）
DELETE FROM user 
WHERE username = 'zhaoliu';

-- 2. 删除符合条件的多条记录
DELETE FROM user 
WHERE age > 30;

-- 3. 清空表（删除所有记录，但保留表结构，主键自增重置）
TRUNCATE TABLE user;  -- 效率高于 DELETE FROM user;（不记录日志，不可逆）
```

- ```
  DELETE
  ```

   

  vs

   

  ```
  TRUNCATE
  ```

  ：

  - `DELETE`：删除记录，可加 `WHERE` 条件，主键自增不重置（如删除 id=5 的记录，下次插入 id=6）；
  - `TRUNCATE`：清空全表，不可加 `WHERE`，主键自增重置为 1，适合重建表数据（如测试环境）。

### 3. DQL：数据查询语言（查询数据）

用于「从表中获取数据」，核心命令 `SELECT`，是日常使用最频繁的 SQL，支持条件、排序、分页、关联查询等。

#### （1）基础查询（查询所有 / 指定字段）

sql











```sql
-- 1. 查询表中所有记录和所有字段（不推荐：表字段多时效率低，且返回无关字段）
SELECT * FROM user;

-- 2. 查询指定字段（推荐：只获取需要的字段，减少数据传输）
SELECT id, username, age FROM user;

-- 3. 给字段起别名（用 AS，可省略，适合字段名过长或结果展示）
SELECT 
    id AS 用户ID, 
    username 用户名,  -- 省略 AS
    age 年龄 
FROM user;
```

#### （2）条件查询（`WHERE` 子句）

通过 `WHERE` 筛选符合条件的记录，支持常见运算符：`=`（等于）、`!=`（不等于）、`>`/`<`（大于 / 小于）、`BETWEEN...AND`（范围）、`IN`（多值匹配）、`LIKE`（模糊匹配）、`IS NULL`（空值匹配）。

sql











```sql
-- 1. 等值匹配（查询年龄=22 的用户）
SELECT username, age FROM user WHERE age = 22;

-- 2. 范围匹配（查询年龄 20~25 的用户，包含边界）
SELECT username, age FROM user WHERE age BETWEEN 20 AND 25;

-- 3. 多值匹配（查询用户名是 zhangsan 或 lisi 的用户）
SELECT username, phone FROM user WHERE username IN ('zhangsan', 'lisi');

-- 4. 模糊匹配（查询用户名含「张」的用户，% 表示任意字符，_ 表示单个字符）
SELECT username FROM user WHERE username LIKE '%张%';  -- 含「张」的所有用户名
SELECT username FROM user WHERE username LIKE '张_';    -- 「张」开头，且仅 2 个字（如「张三」）

-- 5. 空值匹配（查询手机号未填写的用户，注意：NULL 不能用 =，必须用 IS NULL）
SELECT username FROM user WHERE phone IS NULL;
-- 非空匹配：IS NOT NULL
SELECT username FROM user WHERE phone IS NOT NULL;
```

#### （3）排序查询（`ORDER BY`）

按指定字段排序，默认升序（`ASC`），可指定降序（`DESC`）。

sql











```sql
-- 1. 单字段排序（按年龄升序，从小到大）
SELECT username, age FROM user ORDER BY age;  -- 等价于 ORDER BY age ASC

-- 2. 单字段降序（按创建时间降序，最新的记录在前）
SELECT username, create_time FROM user ORDER BY create_time DESC;

-- 3. 多字段排序（先按年龄降序，年龄相同则按创建时间升序）
SELECT username, age, create_time FROM user 
ORDER BY age DESC, create_time ASC;
```

#### （4）分页查询（`LIMIT`）

当表中数据量大时，用 `LIMIT` 分页获取，避免一次性返回过多数据导致性能问题（如每页显示 10 条）。

sql











```sql
-- 语法：LIMIT 起始索引, 每页条数（起始索引从 0 开始）
-- 第 1 页：显示前 10 条（起始索引 0，0 可省略）
SELECT id, username FROM user LIMIT 10;  -- 等价于 LIMIT 0, 10

-- 第 2 页：显示 11~20 条（起始索引 = (页码-1)*每页条数 = 1*10=10）
SELECT id, username FROM user LIMIT 10, 10;

-- 第 3 页：显示 21~30 条
SELECT id, username FROM user LIMIT 20, 10;
```

#### （5）聚合查询（`GROUP BY` + 聚合函数）

用于「统计数据」，如计算总数、平均值、最大值等，常用聚合函数：

- `COUNT(*)`：统计记录总数；
- `COUNT(字段)`：统计该字段非 NULL 的记录数；
- `SUM(字段)`：计算字段值的总和（仅数值类型）；
- `AVG(字段)`：计算字段值的平均值（仅数值类型）；
- `MAX(字段)`/`MIN(字段)`：获取字段值的最大 / 最小值。

sql











```sql
-- 1. 统计用户总数
SELECT COUNT(*) AS 用户总数 FROM user;

-- 2. 统计有手机号的用户数（排除 phone 为 NULL 的记录）
SELECT COUNT(phone) AS 有手机号用户数 FROM user;

-- 3. 计算所有用户的平均年龄
SELECT AVG(age) AS 平均年龄 FROM user;

-- 4. 按年龄分组，统计每组的用户数（如 20 岁有 2 人，22 岁有 1 人）
SELECT age AS 年龄, COUNT(*) AS 人数 
FROM user 
GROUP BY age;  -- 按 age 分组，聚合函数统计每组数据

-- 5. 分组后筛选（HAVING：筛选分组结果，WHERE 筛选原始记录）
SELECT age AS 年龄, COUNT(*) AS 人数 
FROM user 
GROUP BY age 
HAVING COUNT(*) >= 2;  -- 只显示用户数≥2 的年龄组
```

- ```
  WHERE
  ```

   

  vs

   

  ```
  HAVING
  ```

  ：

  - `WHERE`：在分组前筛选原始记录（不能用聚合函数，如 `WHERE COUNT(*)>=2` 报错）；
  - `HAVING`：在分组后筛选分组结果（可使用聚合函数）。

#### （6）关联查询（多表查询，`JOIN`）

当数据分散在多个表中时（如「订单表」和「用户表」），需用 `JOIN` 关联查询。以「订单表（order）」和「用户表（user）」为例：

- 订单表 `order` 结构：`order_id`（主键）、`user_id`（外键，关联 user.id）、`order_amount`（订单金额）、`create_time`（创建时间）；
- 用户表 `user` 结构：`id`（主键）、`username`（用户名）。

sql











```sql
-- 1. 内连接（INNER JOIN）：只返回两表中匹配的记录（即有订单的用户）
SELECT 
    o.order_id AS 订单ID,
    u.username AS 用户名,
    o.order_amount AS 订单金额
FROM `order` o  -- 表起别名 o（简化写法）
INNER JOIN user u  -- 关联 user 表，起别名 u
ON o.user_id = u.id;  -- 关联条件：订单表的 user_id = 用户表的 id

-- 2. 左连接（LEFT JOIN）：返回左表（order）所有记录，右表（user）无匹配则补 NULL
-- （适合查看所有订单，即使订单对应的用户已删除）
SELECT 
    o.order_id AS 订单ID,
    u.username AS 用户名,  -- 无匹配时显示 NULL
    o.order_amount AS 订单金额
FROM `order` o
LEFT JOIN user u
ON o.user_id = u.id;

-- 3. 右连接（RIGHT JOIN）：返回右表（user）所有记录，左表（order）无匹配则补 NULL
-- （适合查看所有用户，包括无订单的用户）
SELECT 
    u.username AS 用户名,
    o.order_id AS 订单ID  -- 无订单时显示 NULL
FROM `order` o
RIGHT JOIN user u
ON o.user_id = u.id;
```

- 表名 `order` 是 MySQL 关键字，需用反引号 ``` 包裹（避免语法报错）；
- 关联查询必须加 `ON` 子句指定关联条件，否则会产生「笛卡尔积」（两表记录数相乘，数据冗余）。

### 4. DCL：数据控制语言（权限管理）

用于「管理用户和权限」，新手了解基础操作即可（生产环境通常由运维负责）。

sql











```sql
-- 1. 创建用户（如创建开发用户 dev，仅允许本地连接）
CREATE USER IF NOT EXISTS 'dev'@'localhost' 
IDENTIFIED BY 'Dev@123456';  -- 密码需符合复杂度（MySQL 8.0 要求大小写+数字+特殊字符）

-- 2. 授予权限（如授予 dev 用户 test_db 库所有表的查询、插入、修改权限）
GRANT SELECT, INSERT, UPDATE ON test_db.* TO 'dev'@'localhost';

-- 3. 查看用户权限
SHOW GRANTS FOR 'dev'@'localhost';

-- 4. 撤销权限（如撤销 dev 用户的修改权限）
REVOKE UPDATE ON test_db.* FROM 'dev'@'localhost';

-- 5. 删除用户
DROP USER IF EXISTS 'dev'@'localhost';

-- 6. 修改用户密码（修改 root 密码）
ALTER USER 'root'@'localhost' 
IDENTIFIED BY 'NewRoot@123456';
```

- 用户格式：`'用户名'@'主机地址'`，`localhost` 表示仅本地连接，`%` 表示允许远程连接（如 `'dev'@'%'`）；
- 权限粒度：`test_db.*` 表示 `test_db` 库的所有表，`*.*` 表示所有库的所有表（超级权限，谨慎授予）。

## 四、MySQL 日常管理与注意事项

### 1. 常见管理操作

sql











```sql
-- 1. 查看当前数据库的字符集
SELECT DEFAULT_CHARACTER_SET_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'test_db';

-- 2. 查看表的引擎
SHOW TABLE STATUS LIKE 'user';

-- 3. 查看慢查询日志（定位耗时 SQL，需提前开启）
SHOW VARIABLES LIKE 'slow_query_log';  -- 查看是否开启
SET GLOBAL slow_query_log = ON;         -- 临时开启（重启失效）

-- 4. 查看当前连接数（避免连接数满导致无法连接）
SHOW STATUS LIKE 'Threads_connected';
SHOW VARIABLES LIKE 'max_connections';  -- 查看最大连接数（默认 151）
```

### 2. 新手必避坑点

1. **SQL 语句必须以分号结尾**：MySQL 以 `;` 识别语句结束，忘记加会导致终端一直等待输入（按 `Ctrl+C` 退出）；
2. **`UPDATE`/`DELETE` 必须加 `WHERE`**：否则会修改 / 删除全表数据，生产环境建议先执行 `SELECT` 验证条件；
3. **字段 / 表名是关键字需用反引号包裹**：如 `order`、`user` 是关键字，需写 ``order``、``user``；
4. **字符串用单引号包裹**：MySQL 中字符串值必须用单引号（`'zhangsan'`），双引号可能报错（依赖配置）；
5. **主键自增不要手动插入值**：若主键设为 `AUTO_INCREMENT`，插入时填 `NULL` 或省略该字段，手动插入可能导致主键冲突；
6. **避免用 `SELECT \*`**：只查询需要的字段，减少数据传输和内存占用，且表结构变更后不会返回无关字段。

## 五、总结

MySQL 基本使用的核心是「SQL 操作」，新手需按以下步骤进阶：

1. 先掌握「环境安装→连接数据库」，确保能正常操作；
2. 理解「数据库→表→字段→记录」的关系，学会用 DDL 创建库表；
3. 熟练 DML（增删改）和 DQL（基础查询、条件、排序、分页），这是日常开发最常用的操作；
4. 再学习关联查询（`JOIN`）和聚合查询，应对多表数据场景；
5. 最后了解权限管理和日常维护，确保数据安全。

建议多动手实操（如创建用户表、插入测试数据、写查询语句），通过实践加深理解，遇到问题可查看 MySQL 官方文档或用 `SHOW ERRORS;` 查看报错详情。