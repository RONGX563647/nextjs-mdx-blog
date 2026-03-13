# 数据库缓存架构：Redis与数据库一致性

## 一、问题引入：缓存与数据库不一致的困境

### 1.1 真实案例：电商库存超卖事故

```
事故时间：2024年双11大促期间
事故场景：某爆款商品库存显示为0，但实际已超卖500+件
影响范围：涉及订单金额120万元，用户投诉300+
根本原因：缓存与数据库库存数据不一致

事故经过：
┌─────────────────────────────────────────────────────────────┐
│  T1: 用户A查询库存 → 缓存命中 → 显示剩余100件               │
│  T2: 用户B下单扣减库存 → 更新数据库为99件                   │
│  T3: 缓存删除失败（网络抖动）→ 缓存仍为100件                │
│  T4: 用户C查询库存 → 缓存命中 → 显示剩余100件（实际99）     │
│  T5: 500个并发请求基于错误缓存下单 → 超卖500件              │
└─────────────────────────────────────────────────────────────┘

损失评估：
- 直接经济损失：赔付用户优惠券价值15万元
- 品牌信誉损失：无法量化
- 技术团队：连续加班72小时修复数据
```

### 1.2 缓存一致性问题的本质

```
缓存与数据库不一致的根源：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   分布式系统的CAP理论约束                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Consistency (一致性)                               │   │
│   │  Availability (可用性)                              │   │
│   │  Partition Tolerance (分区容错性)                   │   │
│   │                                                     │   │
│   │  缓存架构中，我们只能保证AP或CP，无法同时满足三者   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   不一致产生的场景：                                         │
│   1. 并发读写竞争条件                                        │
│   2. 缓存更新操作失败                                        │
│   3. 主从复制延迟                                            │
│   4. 分布式事务未完成                                        │
│   5. 缓存过期策略不当                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 一致性问题的业务影响

| 业务场景 | 不一致后果 | 严重程度 |
|---------|-----------|---------|
| 库存扣减 | 超卖或库存积压 | 🔴 致命 |
| 账户余额 | 资金损失 | 🔴 致命 |
| 用户权限 | 越权访问 | 🔴 致命 |
| 商品信息 | 价格错误 | 🟠 严重 |
| 用户资料 | 昵称/头像不一致 | 🟡 一般 |
| 统计报表 | 数据不准确 | 🟡 一般 |

## 二、缓存架构设计模式

### 2.1 四种经典缓存模式对比

```
┌─────────────────────────────────────────────────────────────────────┐
│                        缓存架构模式全景图                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Cache-Aside (旁路缓存) - 最常用的模式                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  读流程：                                                    │   │
│  │  Application → [Cache Miss] → Database → Write Cache        │   │
│  │              ↘ [Cache Hit]  ↗                               │   │
│  │  写流程：                                                    │   │
│  │  Application → Update Database → Delete Cache               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  2. Read-Through (读穿透)                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Application → Cache Provider → [Miss] → Cache Provider     │   │
│  │                                              ↓              │   │
│  │                                         Database            │   │
│  │  缓存层封装了数据加载逻辑，对应用透明                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  3. Write-Through (写穿透)                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Application → Cache Provider → Synchronous Write           │   │
│  │                              ↓                              │   │
│  │                           Database                          │   │
│  │  同步写缓存和数据库，保证强一致性，但写延迟增加               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  4. Write-Behind (异步写回)                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Application → Cache Provider → Async Queue                 │   │
│  │                              ↓                              │   │
│  │                           Database (Eventually)             │   │
│  │  写性能最高，但可能丢数据，适合日志、统计类场景               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 模式选择决策树

```
                    ┌─────────────────┐
                    │  业务场景分析   │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │ 读多写少   │    │ 读写均衡   │    │ 写多读少   │
    │ 80%/20%    │    │ 50%/50%    │    │ 20%/80%    │
    └─────┬──────┘    └─────┬──────┘    └─────┬──────┘
          │                 │                 │
          ▼                 ▼                 ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │Cache-Aside   │  │Read-Through  │  │Write-Behind  │
   │+ 延迟双删    │  │+ 本地缓存    │  │+ 消息队列    │
   └──────────────┘  └──────────────┘  └──────────────┘
```

### 2.3 Cache-Aside模式详解

```java
/**
 * Cache-Aside模式完整实现
 * 包含一致性保障、异常处理、性能优化
 */
@Service
@Slf4j
public class CacheAsideService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RedissonClient redissonClient;
    
    private static final String USER_KEY_PREFIX = "user:";
    private static final long CACHE_TTL = 30; // 30分钟
    private static final long LOCK_WAIT_TIME = 3;
    private static final long LOCK_LEASE_TIME = 10;
    
    /**
     * 读取数据 - 标准Cache-Aside流程
     */
    public User getUser(Long userId) {
        String key = USER_KEY_PREFIX + userId;
        
        // 1. 先查缓存
        String cached = redisTemplate.opsForValue().get(key);
        if (StringUtils.isNotBlank(cached)) {
            log.debug("Cache hit for user: {}", userId);
            return JSON.parseObject(cached, User.class);
        }
        
        // 2. 缓存未命中，查数据库
        log.debug("Cache miss for user: {}, querying database", userId);
        User user = userMapper.selectById(userId);
        
        // 3. 写入缓存（即使为null也缓存，防止穿透）
        if (user != null) {
            redisTemplate.opsForValue().set(
                key, 
                JSON.toJSONString(user), 
                CACHE_TTL, 
                TimeUnit.MINUTES
            );
        } else {
            // 缓存空值，短时间过期
            redisTemplate.opsForValue().set(
                key, 
                "null", 
                5, 
                TimeUnit.MINUTES
            );
        }
        
        return user;
    }
    
    /**
     * 更新数据 - 先更新数据库，再删缓存（延迟双删）
     */
    @Transactional
    public void updateUser(User user) {
        Long userId = user.getId();
        String key = USER_KEY_PREFIX + userId;
        
        // 1. 先删除缓存
        redisTemplate.delete(key);
        log.debug("First cache delete for user: {}", userId);
        
        // 2. 更新数据库
        int affected = userMapper.updateById(user);
        if (affected == 0) {
            throw new OptimisticLockException("更新失败，记录可能已被修改");
        }
        log.debug("Database updated for user: {}", userId);
        
        // 3. 延迟双删 - 防止并发脏读
        // 使用线程池异步执行，避免阻塞主线程
        CompletableFuture.runAsync(() -> {
            try {
                // 延迟时间要大于主从同步延迟 + 业务读操作耗时
                Thread.sleep(500);
                redisTemplate.delete(key);
                log.debug("Delayed double delete for user: {}", userId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Delayed delete interrupted", e);
            }
        }, delayedDeleteExecutor);
    }
    
    /**
     * 删除数据
     */
    @Transactional
    public void deleteUser(Long userId) {
        String key = USER_KEY_PREFIX + userId;
        
        // 1. 先删缓存
        redisTemplate.delete(key);
        
        // 2. 删数据库
        userMapper.deleteById(userId);
        
        // 3. 延迟再次删除
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(500);
                redisTemplate.delete(key);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, delayedDeleteExecutor);
    }
    
    /**
     * 批量查询 - 使用Pipeline优化
     */
    public List<User> batchGetUsers(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyList();
        }
        
        // 1. 批量查缓存
        List<String> keys = userIds.stream()
            .map(id -> USER_KEY_PREFIX + id)
            .collect(Collectors.toList());
        
        List<String> cachedList = redisTemplate.opsForValue().multiGet(keys);
        
        // 2. 分离命中和未命中
        List<Long> missedIds = new ArrayList<>();
        List<User> result = new ArrayList<>();
        
        for (int i = 0; i < userIds.size(); i++) {
            String cached = cachedList.get(i);
            if (StringUtils.isNotBlank(cached) && !"null".equals(cached)) {
                result.add(JSON.parseObject(cached, User.class));
            } else {
                missedIds.add(userIds.get(i));
            }
        }
        
        // 3. 批量查数据库
        if (!missedIds.isEmpty()) {
            List<User> dbUsers = userMapper.selectBatchIds(missedIds);
            
            // 4. 批量写回缓存
            Map<String, String> cacheMap = dbUsers.stream()
                .collect(Collectors.toMap(
                    u -> USER_KEY_PREFIX + u.getId(),
                    u -> JSON.toJSONString(u)
                ));
            
            if (!cacheMap.isEmpty()) {
                redisTemplate.opsForValue().multiSet(cacheMap);
                // 设置过期时间
                cacheMap.keySet().forEach(key -> 
                    redisTemplate.expire(key, CACHE_TTL, TimeUnit.MINUTES)
                );
            }
            
            result.addAll(dbUsers);
        }
        
        return result;
    }
    
    // 延迟删除线程池
    private final Executor delayedDeleteExecutor = Executors.newFixedThreadPool(
        4,
        new ThreadFactoryBuilder().setNameFormat("cache-delayed-delete-%d").build()
    );
}
```

## 三、缓存一致性保障方案

### 3.1 方案对比与选择

| 方案 | 一致性级别 | 性能影响 | 复杂度 | 适用场景 |
|-----|-----------|---------|-------|---------|
| 延迟双删 | 最终一致 | 低 | 低 | 读多写少，容忍秒级延迟 |
| 分布式锁 | 强一致 | 中 | 中 | 库存等关键数据 |
| 消息队列 | 最终一致 | 中 | 中 | 高并发写入场景 |
| Canal订阅 | 最终一致 | 低 | 高 | 已有成熟MySQL架构 |
| 分布式事务 | 强一致 | 高 | 高 | 金融级强一致要求 |

### 3.2 延迟双删模式详解

```java
/**
 * 延迟双删模式 - 解决并发读写导致的数据不一致
 * 
 * 问题场景：
 * T1: 线程A删除缓存
 * T2: 线程B查询缓存未命中，读取数据库旧值
 * T3: 线程A更新数据库
 * T4: 线程B将旧值写入缓存
 * 结果：缓存中是旧值，数据库是新值
 * 
 * 解决方案：延迟一段时间后再次删除缓存
 */
@Component
@Slf4j
public class DelayedDoubleDeleteStrategy {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    private final ScheduledExecutorService scheduler = 
        Executors.newScheduledThreadPool(4);
    
    /**
     * 执行延迟双删
     * 
     * @param key 缓存key
     * @param delayMillis 延迟时间（毫秒）
     * @param retryTimes 重试次数
     */
    public void execute(String key, long delayMillis, int retryTimes) {
        // 第一次删除已经在调用前完成
        
        // 调度延迟删除
        scheduler.schedule(() -> {
            try {
                Boolean deleted = redisTemplate.delete(key);
                log.info("Delayed delete cache key: {}, result: {}", key, deleted);
                
                // 如果删除失败，进行重试
                if (Boolean.FALSE.equals(deleted) && retryTimes > 0) {
                    retryDelete(key, retryTimes);
                }
            } catch (Exception e) {
                log.error("Delayed delete failed for key: {}", key, e);
                // 记录到延迟队列，后续补偿
                recordToCompensateQueue(key);
            }
        }, delayMillis, TimeUnit.MILLISECONDS);
    }
    
    /**
     * 重试删除
     */
    private void retryDelete(String key, int retryTimes) {
        int attempt = 0;
        while (attempt < retryTimes) {
            try {
                Thread.sleep(100 * (attempt + 1)); // 指数退避
                Boolean deleted = redisTemplate.delete(key);
                if (Boolean.TRUE.equals(deleted)) {
                    log.info("Retry delete success for key: {} on attempt {}", key, attempt + 1);
                    return;
                }
            } catch (Exception e) {
                log.error("Retry delete failed for key: {} on attempt {}", key, attempt + 1, e);
            }
            attempt++;
        }
        log.error("All retry attempts failed for key: {}", key);
    }
    
    /**
     * 记录到补偿队列（使用Redis Stream或MQ）
     */
    private void recordToCompensateQueue(String key) {
        // 实现略，可以使用Redis Stream或消息队列
    }
    
    /**
     * 计算合适的延迟时间
     * 
     * 延迟时间 = 主从同步延迟 + 业务读操作耗时 + 安全余量
     */
    public long calculateDelayTime() {
        // 主从同步延迟（通常<100ms）
        long replicationDelay = 100;
        // 业务读操作耗时（根据实际监控数据）
        long readOperationTime = 50;
        // 安全余量
        long safetyMargin = 100;
        
        return replicationDelay + readOperationTime + safetyMargin;
    }
}
```

### 3.3 基于Canal的订阅变更方案

```java
/**
 * Canal监听MySQL binlog，实现缓存自动失效
 * 优点：
 * 1. 业务代码无侵入
 * 2. 数据库变更必能感知
 * 3. 支持批量处理
 */
@Component
@Slf4j
public class CanalCacheInvalidationListener {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private CanalClient canalClient;
    
    /**
     * 监听用户表变更
     */
    @CanalListener(destination = "example", schema = "mydb", table = "user")
    public void onUserChange(CanalEntry.Entry entry) {
        CanalEntry.RowChange rowChange = parseRowChange(entry);
        
        for (CanalEntry.RowData rowData : rowChange.getRowDatasList()) {
            // 获取变更后的数据
            List<CanalEntry.Column> columns = rowData.getAfterColumnsList();
            Long userId = extractUserId(columns);
            
            if (userId != null) {
                String cacheKey = "user:" + userId;
                
                // 根据变更类型处理
                switch (entry.getHeader().getEventType()) {
                    case INSERT:
                    case UPDATE:
                        // 删除缓存，下次查询时重建
                        invalidateCache(cacheKey);
                        log.info("Cache invalidated due to user update, userId: {}", userId);
                        break;
                    case DELETE:
                        invalidateCache(cacheKey);
                        log.info("Cache invalidated due to user delete, userId: {}", userId);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    
    /**
     * 批量缓存失效
     */
    @CanalListener(destination = "example", schema = "mydb", table = "order")
    public void onOrderChange(CanalEntry.Entry entry) {
        CanalEntry.RowChange rowChange = parseRowChange(entry);
        
        Set<String> keysToDelete = new HashSet<>();
        
        for (CanalEntry.RowData rowData : rowChange.getRowDatasList()) {
            List<CanalEntry.Column> columns = rowData.getAfterColumnsList();
            Long orderId = extractColumn(columns, "id");
            Long userId = extractColumn(columns, "user_id");
            
            // 收集需要删除的缓存key
            keysToDelete.add("order:" + orderId);
            keysToDelete.add("user:orders:" + userId);
            keysToDelete.add("user:order_count:" + userId);
        }
        
        // 批量删除
        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
            log.info("Batch cache invalidation, keys: {}", keysToDelete);
        }
    }
    
    /**
     * 带重试的缓存失效
     */
    private void invalidateCache(String key) {
        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                Boolean result = redisTemplate.delete(key);
                if (Boolean.TRUE.equals(result)) {
                    return;
                }
            } catch (Exception e) {
                log.error("Cache invalidation failed, attempt: {}, key: {}", i + 1, key, e);
                if (i < maxRetries - 1) {
                    try {
                        Thread.sleep(100 * (i + 1));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
    }
    
    private CanalEntry.RowChange parseRowChange(CanalEntry.Entry entry) {
        try {
            return CanalEntry.RowChange.parseFrom(entry.getStoreValue());
        } catch (InvalidProtocolBufferException e) {
            throw new RuntimeException("Parse row change failed", e);
        }
    }
    
    private Long extractUserId(List<CanalEntry.Column> columns) {
        return columns.stream()
            .filter(c -> "id".equals(c.getName()))
            .findFirst()
            .map(c -> Long.valueOf(c.getValue()))
            .orElse(null);
    }
    
    private Long extractColumn(List<CanalEntry.Column> columns, String columnName) {
        return columns.stream()
            .filter(c -> columnName.equals(c.getName()))
            .findFirst()
            .map(c -> Long.valueOf(c.getValue()))
            .orElse(null);
    }
}
```

### 3.4 分布式锁保证强一致性

```java
/**
 * 使用Redisson分布式锁保证缓存与数据库强一致性
 * 适用于库存扣减、账户余额等关键场景
 */
@Service
@Slf4j
public class StrongConsistencyCacheService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    /**
     * 扣减库存 - 强一致性实现
     * 
     * 流程：
     * 1. 获取分布式锁
     * 2. 查缓存获取当前库存
     * 3. 判断库存是否充足
     * 4. 扣减数据库库存
     * 5. 更新缓存
     * 6. 释放锁
     */
    public boolean deductInventory(Long productId, Integer quantity) {
        String lockKey = "lock:inventory:" + productId;
        String cacheKey = "inventory:" + productId;
        RLock lock = redissonClient.getLock(lockKey);
        
        try {
            // 获取锁，最多等待3秒，持有10秒
            boolean locked = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!locked) {
                log.warn("Failed to acquire lock for product: {}", productId);
                throw new ConcurrentModificationException("系统繁忙，请稍后重试");
            }
            
            try {
                // 1. 查缓存
                String cached = redisTemplate.opsForValue().get(cacheKey);
                Integer currentStock;
                
                if (StringUtils.isNotBlank(cached)) {
                    currentStock = Integer.valueOf(cached);
                } else {
                    // 缓存未命中，查数据库
                    Inventory inventory = inventoryMapper.selectById(productId);
                    currentStock = inventory != null ? inventory.getStock() : 0;
                }
                
                // 2. 检查库存
                if (currentStock < quantity) {
                    log.warn("Insufficient stock for product: {}, required: {}, available: {}", 
                        productId, quantity, currentStock);
                    return false;
                }
                
                // 3. 扣减数据库（使用乐观锁防止并发）
                int affected = inventoryMapper.deductStock(productId, quantity, currentStock);
                if (affected == 0) {
                    log.warn("Optimistic lock conflict for product: {}", productId);
                    return false;
                }
                
                // 4. 更新缓存
                int newStock = currentStock - quantity;
                redisTemplate.opsForValue().set(cacheKey, String.valueOf(newStock));
                
                log.info("Inventory deducted successfully, product: {}, quantity: {}, remaining: {}",
                    productId, quantity, newStock);
                return true;
                
            } finally {
                // 释放锁
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("操作被中断", e);
        }
    }
    
    /**
     * 使用Redisson的RAtomicLong实现原子操作
     */
    public boolean deductInventoryAtomic(Long productId, Integer quantity) {
        String stockKey = "stock:" + productId;
        RAtomicLong atomicStock = redissonClient.getAtomicLong(stockKey);
        
        // 初始化缓存（从数据库加载）
        if (!atomicStock.isExists()) {
            Inventory inventory = inventoryMapper.selectById(productId);
            if (inventory != null) {
                atomicStock.set(inventory.getStock());
            }
        }
        
        // 原子扣减
        long currentStock = atomicStock.get();
        if (currentStock < quantity) {
            return false;
        }
        
        long newStock = atomicStock.addAndGet(-quantity);
        if (newStock < 0) {
            // 扣减失败，回滚
            atomicStock.addAndGet(quantity);
            return false;
        }
        
        // 异步同步到数据库
        asyncSyncToDatabase(productId, (int) newStock);
        
        return true;
    }
    
    /**
     * 异步同步库存到数据库
     */
    @Async
    public void asyncSyncToDatabase(Long productId, Integer stock) {
        try {
            inventoryMapper.updateStock(productId, stock);
        } catch (Exception e) {
            log.error("Failed to sync stock to database, product: {}", productId, e);
            // 记录到补偿队列
        }
    }
}
```

## 四、缓存三大问题及解决方案

### 4.1 缓存穿透

```
缓存穿透：查询一个不存在的数据，缓存和数据库都没有
攻击者利用这一点，大量请求不存在的数据，压垮数据库

解决方案对比：
┌─────────────────────────────────────────────────────────────┐
│ 方案1：缓存空值                                              │
│ 优点：实现简单                                                │
│ 缺点：占用内存，短期数据不一致                                │
├─────────────────────────────────────────────────────────────┤
│ 方案2：布隆过滤器（推荐）                                    │
│ 优点：内存占用小，查询快                                      │
│ 缺点：有一定误判率，不能删除元素                              │
├─────────────────────────────────────────────────────────────┤
│ 方案3：接口校验                                               │
│ 优点：从源头拦截非法请求                                      │
│ 缺点：只能防正常业务错误，不能防恶意攻击                      │
└─────────────────────────────────────────────────────────────┘
```

```java
/**
 * 布隆过滤器解决缓存穿透
 */
@Component
@Slf4j
public class BloomFilterCachePenetration {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    private RBloomFilter<String> userBloomFilter;
    
    /**
     * 初始化布隆过滤器
     * 预期数据量：100万
     * 误判率：0.01
     */
    @PostConstruct
    public void init() {
        userBloomFilter = redissonClient.getBloomFilter("user:bloom:filter");
        // 尝试初始化，如果已存在则不会重新初始化
        boolean initialized = userBloomFilter.tryInit(1000000L, 0.01);
        
        if (initialized) {
            log.info("Bloom filter initialized, loading existing user IDs...");
            // 加载已有用户ID
            List<Long> userIds = userMapper.selectAllIds();
            userIds.forEach(id -> userBloomFilter.add("user:" + id));
            log.info("Bloom filter loaded with {} user IDs", userIds.size());
        }
    }
    
    /**
     * 查询用户 - 使用布隆过滤器防止穿透
     */
    public User getUser(Long userId) {
        String key = "user:" + userId;
        
        // 1. 布隆过滤器检查
        if (!userBloomFilter.contains(key)) {
            log.debug("Bloom filter indicates user {} does not exist", userId);
            return null; // 一定不存在，直接返回
        }
        
        // 2. 查缓存
        String cached = redisTemplate.opsForValue().get(key);
        if (StringUtils.isNotBlank(cached)) {
            return JSON.parseObject(cached, User.class);
        }
        
        // 3. 查数据库
        User user = userMapper.selectById(userId);
        
        // 4. 写入缓存
        if (user != null) {
            redisTemplate.opsForValue().set(key, JSON.toJSONString(user), 30, TimeUnit.MINUTES);
        } else {
            // 缓存空值，短时间过期
            redisTemplate.opsForValue().set(key, "null", 5, TimeUnit.MINUTES);
        }
        
        return user;
    }
    
    /**
     * 新增用户时更新布隆过滤器
     */
    public void addUser(User user) {
        // 1. 写入数据库
        userMapper.insert(user);
        
        // 2. 更新布隆过滤器
        userBloomFilter.add("user:" + user.getId());
        
        // 3. 写入缓存
        redisTemplate.opsForValue().set(
            "user:" + user.getId(),
            JSON.toJSONString(user),
            30,
            TimeUnit.MINUTES
        );
    }
}
```

### 4.2 缓存击穿

```
缓存击穿：热点key过期瞬间，大量请求同时打到数据库

解决方案：
┌─────────────────────────────────────────────────────────────┐
│ 方案1：互斥锁                                                │
│ - 只允许一个线程重建缓存                                      │
│ - 其他线程等待或返回降级数据                                  │
├─────────────────────────────────────────────────────────────┤
│ 方案2：逻辑过期                                               │
│ - 不设置TTL，通过逻辑时间判断是否过期                         │
│ - 过期时异步重建，老数据继续服务                              │
├─────────────────────────────────────────────────────────────┤
│ 方案3：热点数据预加载                                         │
│ - 系统启动时加载热点数据                                      │
│ - 定时刷新，避免过期                                          │
└─────────────────────────────────────────────────────────────┘
```

```java
/**
 * 缓存击穿解决方案
 */
@Component
@Slf4j
public class CacheBreakdownSolution {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private ProductMapper productMapper;
    
    /**
     * 方案1：互斥锁防止缓存击穿
     */
    public Product getProductWithLock(Long productId) {
        String key = "product:" + productId;
        String lockKey = "lock:product:" + productId;
        
        // 1. 查缓存
        String cached = redisTemplate.opsForValue().get(key);
        if (StringUtils.isNotBlank(cached)) {
            return JSON.parseObject(cached, Product.class);
        }
        
        // 2. 获取分布式锁
        RLock lock = redissonClient.getLock(lockKey);
        try {
            boolean locked = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!locked) {
                // 获取锁失败，返回降级数据或重试
                log.warn("Failed to acquire lock for product: {}", productId);
                return getFallbackProduct(productId);
            }
            
            try {
                // 3. 双重检查
                cached = redisTemplate.opsForValue().get(key);
                if (StringUtils.isNotBlank(cached)) {
                    return JSON.parseObject(cached, Product.class);
                }
                
                // 4. 查数据库
                Product product = productMapper.selectById(productId);
                
                // 5. 写入缓存
                if (product != null) {
                    redisTemplate.opsForValue().set(
                        key,
                        JSON.toJSONString(product),
                        30,
                        TimeUnit.MINUTES
                    );
                }
                
                return product;
                
            } finally {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("操作被中断", e);
        }
    }
    
    /**
     * 方案2：逻辑过期时间
     * 适用于热点数据，如秒杀商品信息
     */
    public Product getProductWithLogicalExpire(Long productId) {
        String key = "product:logical:" + productId;
        
        // 1. 查缓存
        String cached = redisTemplate.opsForValue().get(key);
        if (StringUtils.isBlank(cached)) {
            return null;
        }
        
        // 2. 解析数据
        RedisData redisData = JSON.parseObject(cached, RedisData.class);
        Product product = JSON.parseObject(redisData.getData(), Product.class);
        LocalDateTime expireTime = redisData.getExpireTime();
        
        // 3. 判断是否逻辑过期
        if (expireTime.isAfter(LocalDateTime.now())) {
            // 未过期，直接返回
            return product;
        }
        
        // 4. 已过期，尝试获取锁重建缓存
        String lockKey = "lock:product:logical:" + productId;
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        try {
            locked = lock.tryLock(0, 5, TimeUnit.SECONDS);
            if (locked) {
                // 异步重建缓存
                CompletableFuture.runAsync(() -> rebuildProductCache(productId));
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 5. 返回过期数据（保证可用性）
        return product;
    }
    
    /**
     * 异步重建缓存
     */
    @Async
    public void rebuildProductCache(Long productId) {
        String key = "product:logical:" + productId;
        String lockKey = "lock:product:logical:" + productId;
        RLock lock = redissonClient.getLock(lockKey);
        
        try {
            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
                try {
                    // 查数据库
                    Product product = productMapper.selectById(productId);
                    if (product != null) {
                        // 构建逻辑过期数据
                        RedisData redisData = new RedisData();
                        redisData.setData(JSON.toJSONString(product));
                        redisData.setExpireTime(LocalDateTime.now().plusMinutes(30));
                        
                        // 写入缓存（不设置TTL）
                        redisTemplate.opsForValue().set(key, JSON.toJSONString(redisData));
                    }
                } finally {
                    if (lock.isHeldByCurrentThread()) {
                        lock.unlock();
                    }
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * 方案3：热点数据永不过期 + 定时刷新
     */
    @Scheduled(fixedRate = 60000) // 每分钟刷新
    public void refreshHotProducts() {
        // 获取热点商品列表
        List<Long> hotProductIds = getHotProductIds();
        
        for (Long productId : hotProductIds) {
            try {
                Product product = productMapper.selectById(productId);
                if (product != null) {
                    String key = "product:hot:" + productId;
                    redisTemplate.opsForValue().set(key, JSON.toJSONString(product));
                    // 不设置过期时间
                }
            } catch (Exception e) {
                log.error("Failed to refresh hot product: {}", productId, e);
            }
        }
    }
    
    private Product getFallbackProduct(Long productId) {
        // 返回降级数据，如静态页面或默认数据
        Product fallback = new Product();
        fallback.setId(productId);
        fallback.setName("商品信息加载中");
        return fallback;
    }
    
    private List<Long> getHotProductIds() {
        // 从Redis获取热点商品列表
        String hotKey = "products:hot";
        String ids = redisTemplate.opsForValue().get(hotKey);
        if (StringUtils.isNotBlank(ids)) {
            return JSON.parseArray(ids, Long.class);
        }
        return Collections.emptyList();
    }
    
    @Data
    public static class RedisData {
        private LocalDateTime expireTime;
        private String data;
    }
}
```

### 4.3 缓存雪崩

```
缓存雪崩：大量缓存key同时过期，或Redis宕机，导致数据库压力骤增

解决方案：
┌─────────────────────────────────────────────────────────────┐
│ 1. 过期时间加随机值                                           │
│    基础时间 + random(0, 300)秒                               │
├─────────────────────────────────────────────────────────────┤
│ 2. 多级缓存架构                                               │
│    L1: Caffeine本地缓存                                       │
│    L2: Redis分布式缓存                                        │
│    L3: 数据库                                                 │
├─────────────────────────────────────────────────────────────┤
│ 3. 熔断降级                                                   │
│    数据库压力过大时，触发熔断，返回降级数据                   │
├─────────────────────────────────────────────────────────────┤
│ 4. 高可用Redis集群                                            │
│    主从 + 哨兵 / Cluster模式                                  │
└─────────────────────────────────────────────────────────────┘
```

```java
/**
 * 缓存雪崩解决方案 - 多级缓存架构
 */
@Component
@Slf4j
public class MultiLevelCache {
    
    // L1: 本地缓存 (Caffeine)
    private final Cache<String, Object> localCache = Caffeine.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(10, TimeUnit.SECONDS)
        .recordStats()
        .build();
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private ProductMapper productMapper;
    
    /**
     * 获取数据 - 多级缓存查询
     */
    public Product getProduct(Long productId) {
        String key = "product:" + productId;
        
        // L1: 本地缓存
        Product product = (Product) localCache.getIfPresent(key);
        if (product != null) {
            log.debug("L1 cache hit for product: {}", productId);
            return product;
        }
        
        // L2: Redis缓存
        String cached = redisTemplate.opsForValue().get(key);
        if (StringUtils.isNotBlank(cached)) {
            log.debug("L2 cache hit for product: {}", productId);
            product = JSON.parseObject(cached, Product.class);
            // 回填L1
            localCache.put(key, product);
            return product;
        }
        
        // L3: 数据库
        log.debug("Cache miss, querying database for product: {}", productId);
        product = productMapper.selectById(productId);
        
        if (product != null) {
            // 写入L2，过期时间加随机值防止雪崩
            long baseTtl = 30; // 基础30分钟
            long randomTtl = ThreadLocalRandom.current().nextInt(300); // 0-5分钟随机
            redisTemplate.opsForValue().set(
                key,
                JSON.toJSONString(product),
                baseTtl + randomTtl,
                TimeUnit.MINUTES
            );
            
            // 回填L1
            localCache.put(key, product);
        }
        
        return product;
    }
    
    /**
     * 批量预热缓存
     */
    public void preloadCache(List<Long> productIds) {
        if (CollectionUtils.isEmpty(productIds)) {
            return;
        }
        
        // 分批处理，避免一次性加载过多
        List<List<Long>> batches = Lists.partition(productIds, 100);
        
        for (List<Long> batch : batches) {
            try {
                List<Product> products = productMapper.selectBatchIds(batch);
                
                for (Product product : products) {
                    String key = "product:" + product.getId();
                    
                    // 随机过期时间
                    long ttl = 30 + ThreadLocalRandom.current().nextInt(300);
                    redisTemplate.opsForValue().set(
                        key,
                        JSON.toJSONString(product),
                        ttl,
                        TimeUnit.MINUTES
                    );
                }
                
                // 批次间短暂休眠，避免数据库压力过大
                Thread.sleep(100);
                
            } catch (Exception e) {
                log.error("Failed to preload cache batch", e);
            }
        }
    }
}
```

## 五、高级缓存架构设计

### 5.1 多级缓存架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         多级缓存架构                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Application Layer                        │   │
│  │                      (业务应用层)                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L1: Local Cache (Caffeine/Guava)                           │   │
│  │  - 访问速度：< 1μs                                          │   │
│  │  - 容量：万级                                                │   │
│  │  - 过期：秒级                                                │   │
│  │  - 作用：拦截热点数据，减轻Redis压力                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L2: Redis Cluster                                          │   │
│  │  - 访问速度：~ 1ms                                           │   │
│  │  - 容量：百万级                                              │   │
│  │  - 过期：分钟级                                              │   │
│  │  - 作用：分布式共享缓存                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L3: Database (MySQL/PostgreSQL)                            │   │
│  │  - 访问速度：~ 10ms                                          │   │
│  │  - 容量：无限制                                              │   │
│  │  - 作用：持久化存储                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  缓存同步策略：                                                     │
│  1. L1与L2：Cache-Aside，L1过期时间 < L2                          │
│  2. L2与L3：延迟双删 + Canal订阅                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 缓存与数据库一致性保障框架

```java
/**
 * 通用缓存一致性保障框架
 * 封装了各种一致性保障策略
 */
@Component
@Slf4j
public class ConsistentCacheFramework {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private RedissonClient redissonClient;
    
    /**
     * 带一致性保障的缓存读取
     * 
     * @param key 缓存key
     * @param clazz 数据类型
     * @param dbLoader 数据库加载函数
     * @param ttl 过期时间
     * @param strategy 一致性策略
     */
    public <T> T getWithConsistency(
            String key,
            Class<T> clazz,
            Supplier<T> dbLoader,
            Duration ttl,
            ConsistencyStrategy strategy) {
        
        switch (strategy) {
            case EVENTUAL:
                return getWithEventualConsistency(key, clazz, dbLoader, ttl);
            case STRONG:
                return getWithStrongConsistency(key, clazz, dbLoader, ttl);
            case READ_THROUGH:
                return getWithReadThrough(key, clazz, dbLoader, ttl);
            default:
                throw new IllegalArgumentException("Unknown strategy: " + strategy);
        }
    }
    
    /**
     * 最终一致性读取
     */
    private <T> T getWithEventualConsistency(
            String key,
            Class<T> clazz,
            Supplier<T> dbLoader,
            Duration ttl) {
        
        // 1. 查缓存
        String cached = redisTemplate.opsForValue().get(key);
        if (StringUtils.isNotBlank(cached)) {
            return JSON.parseObject(cached, clazz);
        }
        
        // 2. 查数据库
        T data = dbLoader.get();
        
        // 3. 异步写缓存
        if (data != null) {
            final T finalData = data;
            CompletableFuture.runAsync(() -> {
                redisTemplate.opsForValue().set(
                    key,
                    JSON.toJSONString(finalData),
                    ttl
                );
            });
        }
        
        return data;
    }
    
    /**
     * 强一致性读取 - 使用分布式锁
     */
    private <T> T getWithStrongConsistency(
            String key,
            Class<T> clazz,
            Supplier<T> dbLoader,
            Duration ttl) {
        
        String lockKey = "lock:" + key;
        RLock lock = redissonClient.getLock(lockKey);
        
        try {
            // 先尝试无锁读取
            String cached = redisTemplate.opsForValue().get(key);
            if (StringUtils.isNotBlank(cached)) {
                return JSON.parseObject(cached, clazz);
            }
            
            // 获取锁
            if (!lock.tryLock(3, 10, TimeUnit.SECONDS)) {
                // 获取锁失败，直接读数据库（牺牲一致性保证可用性）
                return dbLoader.get();
            }
            
            try {
                // 双重检查
                cached = redisTemplate.opsForValue().get(key);
                if (StringUtils.isNotBlank(cached)) {
                    return JSON.parseObject(cached, clazz);
                }
                
                // 查数据库并写缓存
                T data = dbLoader.get();
                if (data != null) {
                    redisTemplate.opsForValue().set(
                        key,
                        JSON.toJSONString(data),
                        ttl
                    );
                }
                
                return data;
            } finally {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("操作被中断", e);
        }
    }
    
    /**
     * 带一致性保障的缓存更新
     */
    public <T> void putWithConsistency(
            String key,
            T data,
            Duration ttl,
            Runnable dbUpdater,
            ConsistencyStrategy strategy) {
        
        switch (strategy) {
            case CACHE_FIRST:
                // 先删缓存，再更新数据库
                redisTemplate.delete(key);
                dbUpdater.run();
                // 延迟双删
                delayedDelete(key);
                break;
            case DB_FIRST:
                // 先更新数据库，再删缓存
                dbUpdater.run();
                redisTemplate.delete(key);
                break;
            case WRITE_THROUGH:
                // 同步更新
                dbUpdater.run();
                if (data != null) {
                    redisTemplate.opsForValue().set(key, JSON.toJSONString(data), ttl);
                }
                break;
            default:
                throw new IllegalArgumentException("Unknown strategy: " + strategy);
        }
    }
    
    /**
     * 延迟删除
     */
    private void delayedDelete(String key) {
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(500);
                redisTemplate.delete(key);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
    
    public enum ConsistencyStrategy {
        EVENTUAL,      // 最终一致性
        STRONG,        // 强一致性
        READ_THROUGH,  // 读穿透
        CACHE_FIRST,   // 先删缓存
        DB_FIRST,      // 先更新数据库
        WRITE_THROUGH  // 同步写
    }
}
```

## 六、性能测试与监控

### 6.1 缓存性能测试数据

```
┌─────────────────────────────────────────────────────────────────────┐
│                      缓存性能对比测试                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  测试环境：                                                         │
│  - 数据库：MySQL 8.0，单表1000万记录                                │
│  - 缓存：Redis 6.0 Cluster，3主3从                                  │
│  - 应用：8核16G，Spring Boot 2.7                                    │
│  - 并发：1000线程                                                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  场景1：简单查询（根据ID查用户）                                    │
│  ┌────────────────┬──────────┬──────────┬──────────┐               │
│  │     方案       │   QPS    │ 平均延迟 │ 99分位   │               │
│  ├────────────────┼──────────┼──────────┼──────────┤               │
│  │ 直接查数据库   │   2,500  │   15ms   │   45ms   │               │
│  │ 单层Redis缓存  │  50,000  │  1.2ms   │    3ms   │               │
│  │ 多级缓存(L1+L2)│ 120,000  │  0.5ms   │    1ms   │               │
│  │ 本地缓存(Caffeine)│ 500,000│ 0.02ms  │  0.05ms  │               │
│  └────────────────┴──────────┴──────────┴──────────┘               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  场景2：复杂查询（关联3张表）                                       │
│  ┌────────────────┬──────────┬──────────┬──────────┐               │
│  │     方案       │   QPS    │ 平均延迟 │ 99分位   │               │
│  ├────────────────┼──────────┼──────────┼──────────┤               │
│  │ 直接查数据库   │     800  │   80ms   │  200ms   │               │
│  │ 结果集缓存     │  30,000  │  1.5ms   │    5ms   │               │
│  │ 多级缓存       │  80,000  │  0.8ms   │    2ms   │               │
│  └────────────────┴──────────┴──────────┴──────────┘               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  场景3：写操作（更新用户信息）                                      │
│  ┌────────────────┬──────────┬──────────┬──────────┐               │
│  │     方案       │   QPS    │ 平均延迟 │ 数据一致性│               │
│  ├────────────────┼──────────┼──────────┼──────────┤               │
│  │ 直接写数据库   │   3,000  │   10ms   │   100%   │               │
│  │ 延迟双删       │   2,800  │   12ms   │  99.9%   │               │
│  │ 分布式锁       │   1,500  │   25ms   │   100%   │               │
│  │ Canal订阅      │   2,900  │   11ms   │  99.5%   │               │
│  └────────────────┴──────────┴──────────┴──────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 缓存监控指标

```java
/**
 * 缓存监控系统
 */
@Component
@Slf4j
public class CacheMonitor {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 缓存命中率监控
     */
    public void recordCacheMetrics(String cacheName, boolean hit) {
        Counter counter = Counter.builder("cache.access")
            .tag("name", cacheName)
            .tag("result", hit ? "hit" : "miss")
            .register(meterRegistry);
        counter.increment();
    }
    
    /**
     * 缓存操作延迟监控
     */
    public <T> T recordLatency(String operation, Supplier<T> supplier) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return supplier.get();
        } finally {
            sample.stop(Timer.builder("cache.operation")
                .tag("operation", operation)
                .register(meterRegistry));
        }
    }
    
    /**
     * Redis监控指标收集
     */
    @Scheduled(fixedRate = 60000)
    public void collectRedisMetrics() {
        try {
            RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
            
            // 内存使用
            Properties info = connection.info("memory");
            long usedMemory = Long.parseLong(info.getProperty("used_memory"));
            Gauge.builder("redis.memory.used", () -> usedMemory)
                .register(meterRegistry);
            
            // 连接数
            info = connection.info("clients");
            int connectedClients = Integer.parseInt(info.getProperty("connected_clients"));
            Gauge.builder("redis.clients.connected", () -> connectedClients)
                .register(meterRegistry);
            
            // 命中率
            info = connection.info("stats");
            long keyspaceHits = Long.parseLong(info.getProperty("keyspace_hits"));
            long keyspaceMisses = Long.parseLong(info.getProperty("keyspace_misses"));
            double hitRate = (double) keyspaceHits / (keyspaceHits + keyspaceMisses);
            Gauge.builder("redis.hitrate", () -> hitRate)
                .register(meterRegistry);
            
            connection.close();
            
        } catch (Exception e) {
            log.error("Failed to collect Redis metrics", e);
        }
    }
    
    /**
     * 缓存健康检查
     */
    public HealthCheckResult checkCacheHealth() {
        HealthCheckResult result = new HealthCheckResult();
        
        try {
            // 检查Redis连接
            String pong = redisTemplate.execute(RedisCallback::ping);
            result.setRedisConnected("PONG".equals(pong));
            
            // 检查内存使用
            RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
            Properties memory = connection.info("memory");
            long usedMemory = Long.parseLong(memory.getProperty("used_memory"));
            long maxMemory = Long.parseLong(memory.getProperty("maxmemory"));
            double memoryUsage = (double) usedMemory / maxMemory;
            result.setMemoryUsage(memoryUsage);
            result.setMemoryHealthy(memoryUsage < 0.8);
            
            connection.close();
            
        } catch (Exception e) {
            result.setRedisConnected(false);
            result.setError(e.getMessage());
        }
        
        return result;
    }
    
    @Data
    public static class HealthCheckResult {
        private boolean redisConnected;
        private boolean memoryHealthy;
        private double memoryUsage;
        private String error;
    }
}
```

## 七、经验总结与最佳实践

### 7.1 缓存设计决策树

```
                            ┌─────────────────┐
                            │  开始缓存设计   │
                            └────────┬────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │  数据更新频率如何？            │
                    └────────────────┬───────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            ▼                        ▼                        ▼
    ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
    │ 几乎不更新    │        │ 偶尔更新      │        │ 频繁更新      │
    │ < 1次/天      │        │ 1-100次/天    │        │ > 100次/天    │
    └───────┬───────┘        └───────┬───────┘        └───────┬───────┘
            │                        │                        │
            ▼                        ▼                        ▼
    ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
    │ 长过期时间    │        │ 中等过期时间  │        │ 短过期时间    │
    │ 24-72小时     │        │ 1-24小时      │        │ 1-60分钟      │
    │ + 主动刷新    │        │ + 延迟双删    │        │ + 分布式锁    │
    └───────────────┘        └───────────────┘        └───────────────┘
```

### 7.2 最佳实践清单

```
┌─────────────────────────────────────────────────────────────────────┐
│                      缓存架构最佳实践清单                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  【设计原则】                                                       │
│  □ 1. 缓存是锦上添花，不是雪中送炭 - 系统要能在缓存失效时正常运行   │
│  □ 2. 缓存过期时间要加随机值，防止雪崩                              │
│  □ 3. 热点数据设置永不过期，通过定时任务刷新                        │
│  □ 4. 写操作优先更新数据库，再失效缓存                              │
│  □ 5. 读操作优先读缓存，未命中再查数据库                            │
│                                                                     │
│  【一致性保障】                                                     │
│  □ 1. 读多写少场景：Cache-Aside + 延迟双删                        │
│  □ 2. 读写均衡场景：Read-Through + 本地缓存                       │
│  □ 3. 强一致要求：分布式锁 + 数据库乐观锁                         │
│  □ 4. 高并发写入：Canal订阅 + 异步缓存更新                        │
│                                                                     │
│  【安全防护】                                                       │
│  □ 1. 使用布隆过滤器防止缓存穿透                                  │
│  □ 2. 热点数据使用互斥锁或逻辑过期防止击穿                        │
│  □ 3. 多级缓存架构防止雪崩                                        │
│  □ 4. 设置接口限流，防止恶意攻击                                  │
│                                                                     │
│  【监控告警】                                                       │
│  □ 1. 监控缓存命中率（目标>95%）                                  │
│  □ 2. 监控Redis内存使用（告警阈值80%）                            │
│  □ 3. 监控缓存操作延迟（P99<5ms）                                 │
│  □ 4. 监控大Key和热Key                                            │
│                                                                     │
│  【故障处理】                                                       │
│  □ 1. 缓存故障时自动降级到数据库                                  │
│  □ 2. 数据库压力过大时触发熔断                                    │
│  □ 3. 准备缓存预热脚本，故障恢复后快速重建                        │
│  □ 4. 定期进行缓存故障演练                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 常见错误与解决方案

| 错误 | 后果 | 正确做法 |
|-----|------|---------|
| 先更新数据库，再删缓存 | 并发时缓存被旧值覆盖 | 先删缓存，再更新数据库，延迟双删 |
| 缓存和数据库同时更新 | 事务复杂，容易不一致 | 单一数据源原则，以数据库为准 |
| 缓存不设置过期时间 | 内存无限增长，数据永久不一致 | 设置合理过期时间，热点数据定时刷新 |
| 缓存空值时间过长 | 数据已存在但返回空 | 空值过期时间设置5分钟内 |
| 大对象直接缓存 | Redis内存占用高，序列化慢 | 拆分大对象，压缩存储 |
| 缓存Key无前缀 | 容易冲突，难以管理 | 统一命名规范：业务:模块:标识 |

---

**系列上一篇**：[分库分表设计与实践](12分库分表设计与实践.md)

**系列下一篇**：[数据异构与同步方案](14数据异构与同步方案.md)
