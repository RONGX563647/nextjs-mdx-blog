# 高效SQL编写：从基础到高级技巧

## 问题引入：一个慢查询引发的雪崩

去年双11，我们的订单查询接口突然变慢，从200ms飙升到15秒。追查发现是一个"简单"的统计SQL：

```sql
-- 罪魁祸首
SELECT * FROM orders 
WHERE status = 'PAID' 
AND created_at > '2023-11-01'
ORDER BY created_at DESC;
```

**问题分析**：
- 没有合适的索引
- 使用了 `SELECT *`
- 返回了50万条数据
- 应用层内存溢出
- 数据库CPU飙升到90%

这次事故让我们深刻认识到：编写高效的SQL不仅是技术问题，更是系统稳定性的保障。

## 现象描述：低效SQL的常见症状

### 症状1：全表扫描

```sql
-- 低效：函数操作导致索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2023;
-- 扫描1000万行，耗时8秒

-- 高效：范围查询使用索引
SELECT * FROM users 
WHERE created_at >= '2023-01-01' 
AND created_at < '2024-01-01';
-- 扫描1万行，耗时20ms
```

### 症状2：大偏移量分页

```sql
-- 低效：深分页性能灾难
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 1000000, 10;
-- 需要扫描1000010行，耗时15秒

-- 高效：基于游标的分页
SELECT * FROM orders 
WHERE created_at < '2023-11-10 10:00:00'
ORDER BY created_at DESC 
LIMIT 10;
-- 扫描10行，耗时1ms
```

### 症状3：N+1查询问题

```java
// 低效：N+1查询
List<Order> orders = orderMapper.findByUserId(userId);  // 1次查询
for (Order order : orders) {
    User user = userMapper.findById(order.getUserId());  // N次查询
    order.setUser(user);
}
// 总查询次数：N+1次

// 高效：JOIN一次性查询
SELECT o.*, u.username, u.email 
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.user_id = ?;
// 总查询次数：1次
```

## 原因分析：SQL性能影响因素

### 1. 索引使用原理

```sql
-- 索引结构示意（B+树）
-- 假设有索引 idx_status_created (status, created_at)

-- 可以使用索引的查询
SELECT * FROM orders WHERE status = 'PAID';  -- 使用索引
SELECT * FROM orders WHERE status = 'PAID' AND created_at > '2023-01-01';  -- 使用索引
SELECT * FROM orders WHERE status = 'PAID' ORDER BY created_at;  -- 使用索引

-- 不能使用索引的查询
SELECT * FROM orders WHERE created_at > '2023-01-01';  -- 跳过最左前缀
SELECT * FROM orders WHERE STATUS = 'PAID';  -- 函数操作（大写函数）
SELECT * FROM orders WHERE status != 'PAID';  -- 不等于操作
```

### 2. 执行计划分析

```sql
-- 查看执行计划
EXPLAIN SELECT * FROM orders WHERE status = 'PAID'\G

-- 关键字段解读
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: orders
   partitions: NULL
         type: ref                    -- 访问类型：ref表示使用索引
possible_keys: idx_status_created      -- 可能使用的索引
          key: idx_status_created      -- 实际使用的索引
      key_len: 33                      -- 索引长度
          ref: const                   -- 与索引比较的列
         rows: 1000                    -- 预估扫描行数
     filtered: 100.00                  -- 过滤比例
        Extra: Using index condition   -- 额外信息
```

**type字段含义**：
| 类型 | 效率 | 说明 |
|------|------|------|
| system | 最高 | 表只有一行 |
| const | 极高 | 通过主键或唯一索引一次就找到 |
| eq_ref | 极高 | JOIN中通过主键或唯一索引关联 |
| ref | 高 | 使用非唯一索引 |
| range | 中 | 索引范围扫描 |
| index | 低 | 全索引扫描 |
| ALL | 最低 | 全表扫描 |

## 解决方案：高效SQL编写技巧

### 1. SELECT语句优化

#### 只查询需要的字段

```sql
-- ❌ 错误：查询所有字段
SELECT * FROM users WHERE user_id = 1;
-- 返回20个字段，包括大文本字段

-- ✅ 正确：只查询需要的字段
SELECT user_id, username, email, phone FROM users WHERE user_id = 1;
-- 返回4个必要字段

-- ✅ 更好的方式：覆盖索引
SELECT user_id, username FROM users 
WHERE username = 'zhangsan';  -- username有索引
-- 直接从索引获取数据，无需回表
```

#### 使用覆盖索引

```sql
-- 创建覆盖索引
CREATE INDEX idx_cover ON orders(user_id, status, total_amount);

-- 覆盖索引查询（Extra: Using index）
SELECT user_id, status, total_amount 
FROM orders 
WHERE user_id = 1 AND status = 'PAID';
-- 所有字段都在索引中，无需访问数据行
```

### 2. JOIN优化

#### 选择合适的JOIN类型

```sql
-- 明确使用INNER JOIN
SELECT o.order_id, o.total_amount, u.username
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id
WHERE o.status = 'PAID';

-- 避免隐式JOIN（笛卡尔积风险）
-- ❌ 不推荐
SELECT * FROM orders o, users u WHERE o.user_id = u.user_id;

-- 小表驱动大表
-- 假设 users 表 1万行，orders 表 1000万行
-- ✅ 小表在前驱动大表
SELECT * FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE u.status = 'ACTIVE';

-- 避免大表驱动小表
-- ❌ 不推荐
SELECT * FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE u.status = 'ACTIVE';
```

#### 优化多表JOIN

```sql
-- 三表JOIN优化
-- 场景：查询订单、用户、商品信息

-- ✅ 推荐：按需选择字段，明确JOIN条件
SELECT 
    o.order_id,
    o.total_amount,
    u.username,
    u.phone,
    p.product_name,
    oi.quantity
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
WHERE o.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY o.created_at DESC
LIMIT 100;

-- 添加复合索引优化
CREATE INDEX idx_created_user ON orders(created_at, user_id);
```

### 3. 分页优化

#### 传统分页的问题

```sql
-- 低效：OFFSET越大越慢
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 1000000, 10;
-- MySQL需要扫描1000010行，然后丢弃前1000000行
```

#### 优化方案1：延迟关联

```sql
-- 使用覆盖索引获取ID，再关联获取完整数据
SELECT o.* 
FROM orders o
JOIN (
    SELECT order_id 
    FROM orders 
    ORDER BY created_at DESC 
    LIMIT 1000000, 10
) tmp ON o.order_id = tmp.order_id;
-- 子查询使用覆盖索引，快速定位ID
```

#### 优化方案2：基于游标的分页

```sql
-- 第一页
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
-- 记录最后一条：created_at = '2023-11-10 10:00:00', order_id = 10001

-- 下一页（基于上一页最后一条记录）
SELECT * FROM orders 
WHERE created_at < '2023-11-10 10:00:00'
   OR (created_at = '2023-11-10 10:00:00' AND order_id < 10001)
ORDER BY created_at DESC, order_id DESC
LIMIT 10;
-- 只需扫描10行，性能稳定
```

#### 优化方案3：业务层优化

```java
// 限制最大分页深度
public List<Order> getOrders(int page, int size) {
    // 限制最大页码
    if (page > 1000) {
        throw new BusinessException("最多只能查看前1000页数据");
    }
    
    int offset = (page - 1) * size;
    return orderMapper.findByPage(offset, size);
}

// 提供搜索功能替代深分页
public List<Order> searchOrders(OrderSearchParam param) {
    // 通过条件筛选缩小范围
    return orderMapper.findByCondition(param);
}
```

### 4. 批量操作优化

#### 批量插入

```sql
-- ❌ 错误：循环单条插入
-- for (Order order : orders) { insert(order); }
-- 1000条数据需要1000次网络往返

-- ✅ 正确：批量插入
INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
(1, 100.00, 'PAID', '2023-11-01 10:00:00'),
(2, 200.00, 'PAID', '2023-11-01 10:01:00'),
(3, 150.00, 'PENDING', '2023-11-01 10:02:00'),
-- ... 更多数据
(1000, 300.00, 'PAID', '2023-11-01 10:30:00');
-- 1000条数据只需1次网络往返

-- MyBatis批量插入示例
<insert id="batchInsert">
    INSERT INTO orders (user_id, total_amount, status, created_at)
    VALUES
    <foreach collection="list" item="item" separator=",">
        (#{item.userId}, #{item.totalAmount}, #{item.status}, #{item.createdAt})
    </foreach>
</insert>
```

#### 批量更新

```sql
-- ❌ 错误：循环单条更新
-- for (Order order : orders) { update(order); }

-- ✅ 正确：CASE WHEN批量更新
UPDATE orders 
SET status = CASE order_id
    WHEN 1 THEN 'SHIPPED'
    WHEN 2 THEN 'COMPLETED'
    WHEN 3 THEN 'CANCELLED'
    ELSE status
END,
updated_at = NOW()
WHERE order_id IN (1, 2, 3);

-- ✅ 或者使用ON DUPLICATE KEY UPDATE（MySQL）
INSERT INTO orders (order_id, status, updated_at) VALUES
(1, 'SHIPPED', NOW()),
(2, 'COMPLETED', NOW()),
(3, 'CANCELLED', NOW())
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    updated_at = VALUES(updated_at);
```

### 5. 子查询优化

#### 避免相关子查询

```sql
-- ❌ 低效：相关子查询（每行都执行子查询）
SELECT o.*,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) as item_count
FROM orders o
WHERE o.status = 'PAID';

-- ✅ 高效：JOIN替代子查询
SELECT o.*, COUNT(oi.item_id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.status = 'PAID'
GROUP BY o.order_id;
```

#### 使用EXISTS替代IN

```sql
-- 查询有订单的用户
-- ❌ 低效：IN子查询
SELECT * FROM users 
WHERE user_id IN (SELECT user_id FROM orders WHERE created_at > '2023-01-01');

-- ✅ 高效：EXISTS
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.user_id 
    AND o.created_at > '2023-01-01'
);

-- ✅ 更高效：JOIN去重
SELECT DISTINCT u.* 
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE o.created_at > '2023-01-01';
```

### 6. 聚合查询优化

#### 减少数据扫描范围

```sql
-- ❌ 低效：先聚合再过滤
SELECT user_id, COUNT(*) as order_count
FROM orders
GROUP BY user_id
HAVING order_count > 10;
-- 需要扫描全表

-- ✅ 高效：先过滤再聚合
SELECT user_id, COUNT(*) as order_count
FROM orders
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY user_id
HAVING order_count > 10;
-- 只扫描近1年的数据
```

#### 使用WITH ROLLUP

```sql
-- 统计各状态订单金额，同时显示总计
SELECT 
    COALESCE(status, '总计') as status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_amount
FROM orders
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY status WITH ROLLUP;
```

## 实施步骤：SQL优化流程

### 步骤1：发现问题

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 超过1秒的查询记录

-- 查看慢查询
SELECT * FROM mysql.slow_log 
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY query_time DESC
LIMIT 10;
```

### 步骤2：分析执行计划

```sql
-- 使用EXPLAIN分析
EXPLAIN FORMAT=JSON SELECT * FROM orders WHERE status = 'PAID';

-- 关注指标：
-- 1. type: 避免ALL（全表扫描）
-- 2. rows: 预估扫描行数
-- 3. Extra: 关注Using filesort, Using temporary
```

### 步骤3：优化实施

```markdown
优化优先级：
1. 添加合适的索引
2. 优化SQL写法
3. 优化表结构
4. 优化数据库配置
5. 升级硬件资源
```

### 步骤4：效果验证

```sql
-- 优化前后对比
-- 记录优化前的执行时间和扫描行数
-- 实施优化
-- 对比优化后的执行时间和扫描行数

-- 使用SHOW PROFILES查看详细耗时
SET profiling = 1;
SELECT * FROM orders WHERE status = 'PAID';
SHOW PROFILES;
```

## 效果验证：优化前后对比

### 案例1：订单查询优化

| 指标 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| 查询时间 | 15s | 50ms | 99.7% ↓ |
| 扫描行数 | 1000万 | 1000 | 99.99% ↓ |
| 返回行数 | 50万 | 100 | 合理范围 |
| CPU使用率 | 90% | 5% | 94% ↓ |

**优化措施**：
1. 添加复合索引 `(status, created_at)`
2. 将 `SELECT *` 改为只查询必要字段
3. 限制返回结果数量

### 案例2：分页查询优化

| 页码 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| 第1页 | 10ms | 5ms | 50% ↓ |
| 第100页 | 100ms | 10ms | 90% ↓ |
| 第1000页 | 1s | 15ms | 98.5% ↓ |
| 第10000页 | 15s | 20ms | 99.9% ↓ |

**优化措施**：
1. 使用基于游标的分页替代OFFSET分页
2. 添加覆盖索引

## 经验总结：高效SQL编写原则

### ✅ 应该做的

1. **只查询需要的字段**：避免 `SELECT *`
2. **为WHERE、JOIN、ORDER BY字段加索引**
3. **使用EXPLAIN分析执行计划**
4. **避免在索引列上使用函数**
5. **大批量操作分批处理**
6. **使用连接(JOIN)替代子查询**
7. **小表驱动大表**
8. **限制分页深度**
9. **使用预编译语句防止SQL注入**
10. **定期分析和优化表**：`ANALYZE TABLE`, `OPTIMIZE TABLE`

### ❌ 不应该做的

1. `SELECT *` 查询所有字段
2. 在WHERE条件中对字段使用函数
3. 使用 `NOT IN`（用 `NOT EXISTS` 或 `LEFT JOIN` 替代）
4. 深分页使用大OFFSET
5. 在循环中执行SQL
6. 隐式类型转换（如字符串和数字比较）
7. 使用 `OR` 连接多个条件（考虑用 `UNION` 替代）
8. 忽略索引维护
9. 不关注慢查询日志
10. 不测试SQL性能就上线

## 深度案例分析：电商系统SQL优化实战

### 项目背景

某电商平台面临以下SQL性能问题：
- 订单列表查询平均响应时间2秒
- 用户订单统计接口超时
- 报表查询导致数据库CPU飙升

### 问题SQL分析

```sql
-- 问题1：订单列表查询
SELECT * FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.product_id
WHERE o.user_id = 12345
ORDER BY o.created_at DESC
LIMIT 0, 20;
-- 执行时间：2.5秒

-- 问题分析：
-- 1. SELECT * 返回大量不需要的字段
-- 2. 多表JOIN导致数据膨胀
-- 3. 缺少合适的索引
-- 4. 分页使用大OFFSET
```

### 优化方案

```sql
-- 优化1：拆分查询，按需加载
-- 主查询只查订单
SELECT 
    o.order_id,
    o.order_no,
    o.total_amount,
    o.status,
    o.created_at,
    u.username,
    u.phone
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.user_id = 12345
ORDER BY o.created_at DESC
LIMIT 0, 20;
-- 执行时间：50ms

-- 创建复合索引
CREATE INDEX idx_user_created ON orders(user_id, created_at);

-- 订单详情单独查询（点击展开时）
SELECT 
    oi.product_id,
    p.product_name,
    p.product_image,
    oi.quantity,
    oi.price
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
WHERE oi.order_id = ?;
-- 执行时间：10ms
```

```sql
-- 优化2：用户订单统计
-- 原SQL：实时统计，性能差
SELECT 
    u.user_id,
    u.username,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.created_at > '2023-01-01'
GROUP BY u.user_id;
-- 执行时间：30秒

-- 优化方案：使用预计算表
-- 创建统计表
CREATE TABLE user_order_stats (
    user_id BIGINT PRIMARY KEY,
    order_count INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    last_order_time TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 查询时直接读取统计表
SELECT u.user_id, u.username, s.order_count, s.total_amount
FROM users u
JOIN user_order_stats s ON u.user_id = s.user_id
WHERE u.created_at > '2023-01-01';
-- 执行时间：100ms
```

### 优化效果

| 接口 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| 订单列表 | 2.5s | 50ms | 98% ↓ |
| 订单详情 | - | 10ms | 新增 |
| 用户统计 | 30s | 100ms | 99.7% ↓ |
| 数据库CPU | 85% | 20% | 76% ↓ |

## SQL优化决策树

```
SQL性能问题
    ↓
是否使用了索引？
    ↓ 否
添加合适的索引
    ↓
是否返回了过多数据？
    ↓ 是
优化SELECT字段，添加LIMIT
    ↓
是否使用了深分页？
    ↓ 是
使用游标分页或限制分页深度
    ↓
是否有复杂的子查询？
    ↓ 是
改写为JOIN
    ↓
是否有多表JOIN？
    ↓ 是
优化JOIN顺序，确保小表驱动大表
    ↓
优化完成
```

## 常见误区与避坑指南

### ❌ 误区1：索引越多越好

**问题**：过多索引影响写入性能，占用存储空间。

**正确做法**：只为必要的字段添加索引，定期清理无用索引。

```sql
-- 查看索引使用情况
SELECT 
    table_name,
    index_name,
    rows_selected,
    rows_inserted,
    rows_deleted
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
ORDER BY rows_selected DESC;
```

### ❌ 误区2：EXPLAIN显示使用索引就一定快

**问题**：使用索引但扫描行数过多仍然慢。

**正确做法**：关注rows字段，确保扫描行数合理。

### ❌ 误区3：只关注查询时间，忽略写入性能

**问题**：过度优化查询导致写入变慢。

**正确做法**：平衡读写性能，必要时采用读写分离。

### ❌ 误区4：忽视SQL注入风险

**问题**：字符串拼接SQL导致安全漏洞。

**正确做法**：始终使用预编译语句。

```java
// ❌ 错误：字符串拼接
String sql = "SELECT * FROM users WHERE username = '" + username + "'";

// ✅ 正确：预编译语句
@Query("SELECT u FROM User u WHERE u.username = :username")
User findByUsername(@Param("username") String username);
```

## SQL编写检查清单

```markdown
□ 是否只查询了必要的字段？
□ WHERE条件是否能使用索引？
□ 是否存在函数操作导致索引失效？
□ 分页是否使用了大OFFSET？
□ 是否可以使用覆盖索引？
□ JOIN顺序是否最优（小表驱动大表）？
□ 子查询是否可以改写为JOIN？
□ 是否使用了预编译语句？
□ 是否添加了合适的LIMIT限制？
□ 是否检查了执行计划？
```

## 附录

### A. 常用EXPLAIN字段速查

| 字段 | 含义 | 优化建议 |
|------|------|---------|
| type | 访问类型 | 至少达到range，最好是ref或const |
| key | 使用的索引 | 确保使用了预期的索引 |
| rows | 预估扫描行数 | 越小越好 |
| Extra | 额外信息 | 避免Using filesort, Using temporary |

### B. 索引优化检查清单

```sql
-- 1. 查看表索引
SHOW INDEX FROM orders;

-- 2. 查看索引 cardinality
SHOW INDEX FROM orders\G

-- 3. 分析表统计信息
ANALYZE TABLE orders;

-- 4. 查看索引使用情况
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_database';
```

### C. 慢查询分析模板

```markdown
## 慢查询分析报告

### 基本信息
- SQL语句：
- 执行时间：
- 扫描行数：
- 返回行数：

### 执行计划
```
EXPLAIN输出
```

### 问题分析
1. 
2. 
3. 

### 优化方案
1. 
2. 
3. 

### 优化效果
- 优化前执行时间：
- 优化后执行时间：
- 提升比例：
```

## 读者练习

1. **思考题**：分析你项目中的慢查询日志，找出3个可以优化的SQL。

2. **实践题**：优化以下SQL：
```sql
SELECT * FROM orders 
WHERE YEAR(created_at) = 2023 
AND status = 'PAID'
ORDER BY total_amount DESC
LIMIT 1000, 10;
```

3. **挑战题**：设计一个支持千万级数据的高效分页方案。

---

**系列上一篇**：[表结构设计进阶：数据类型、约束与扩展性](03表结构设计进阶：数据类型、约束与扩展性.md)

**系列下一篇**：[索引深度解析：B+树、哈希与覆盖索引](05索引深度解析：B+树、哈希与覆盖索引.md)
