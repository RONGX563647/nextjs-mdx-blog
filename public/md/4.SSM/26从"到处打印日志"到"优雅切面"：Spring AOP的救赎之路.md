# 26从"到处打印日志"到"优雅切面"：Spring AOP的救赎之路

> "这日志怎么打印得到处都是？改个日志格式要改一百个地方！" 我看着满屏幕的`System.out.println`和`log.info`，感觉自己像个日志搬运工。**直到我遇见了AOP，才明白什么叫"一次编写，处处生效"的魔法。**

![image-20260202181732024](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202181732024.png)

## 一、AOP的前世今生：从"重复劳动"到"优雅切面"

### 1.1 没有AOP的日子：我像个日志搬运工

在瑞吉外卖项目中，刚开始我是这样写代码的：

java

```java
@Service
public class OrderServiceImpl implements OrderService {
    
    @Override
    public Order createOrder(Order order) {
        long start = System.currentTimeMillis();
        log.info("开始创建订单，参数: {}", order);
        
        try {
            // 1. 验证用户
            log.info("验证用户: {}", order.getUserId());
            User user = userService.getById(order.getUserId());
            
            // 2. 验证商品
            log.info("验证商品: {}", order.getProductId());
            Product product = productService.getById(order.getProductId());
            
            // 3. 扣减库存
            log.info("扣减库存，商品ID: {}，数量: {}", product.getId(), order.getQuantity());
            productService.reduceStock(product.getId(), order.getQuantity());
            
            // 4. 保存订单
            log.info("保存订单");
            orderDao.save(order);
            
            long end = System.currentTimeMillis();
            log.info("订单创建成功，订单ID: {}，耗时: {}ms", order.getId(), (end - start));
            
            return order;
        } catch (Exception e) {
            log.error("创建订单失败: {}", e.getMessage(), e);
            throw new BusinessException("订单创建失败");
        }
    }
    
    @Override
    public Order getOrder(Long id) {
        long start = System.currentTimeMillis();
        log.info("开始查询订单，ID: {}", id);
        
        try {
            Order order = orderDao.getById(id);
            
            long end = System.currentTimeMillis();
            log.info("查询订单成功，耗时: {}ms", (end - start));
            
            return order;
        } catch (Exception e) {
            log.error("查询订单失败: {}", e.getMessage(), e);
            throw new BusinessException("查询订单失败");
        }
    }
    
    // 还有updateOrder、deleteOrder、listOrder... 每个方法都要写一遍日志！
}
```



**问题：**

1. **代码冗余**：每个方法都要写日志开头、结尾、异常处理
2. **难以维护**：要改日志格式？得改几十个方法
3. **业务逻辑被污染**：业务代码和日志代码混在一起
4. **容易遗漏**：新加的方法可能忘记加日志

### 1.2 第一次尝试：提取公共方法

java

```java
public class LogUtil {
    
    public static void logStart(String methodName, Object... args) {
        log.info("开始执行{}，参数: {}", methodName, args);
    }
    
    public static void logEnd(String methodName, long startTime) {
        long endTime = System.currentTimeMillis();
        log.info("{}执行成功，耗时: {}ms", methodName, (endTime - startTime));
    }
    
    public static void logError(String methodName, Exception e) {
        log.error("{}执行失败: {}", methodName, e.getMessage(), e);
    }
}

@Service
public class OrderServiceImpl implements OrderService {
    
    @Override
    public Order createOrder(Order order) {
        long start = System.currentTimeMillis();
        LogUtil.logStart("createOrder", order);
        
        try {
            // 业务逻辑...
            LogUtil.logEnd("createOrder", start);
            return order;
        } catch (Exception e) {
            LogUtil.logError("createOrder", e);
            throw new BusinessException("订单创建失败");
        }
    }
}
```



**改进：** 日志格式统一了，但还是要在每个方法里调用

**新问题：** 如果我想加性能监控、权限校验、参数验证...还得在每个方法里加

### 1.3 AOP登场：真正的解耦

java

```java
@Aspect
@Component
@Slf4j
public class LogAspect {
    
    // 切入点：所有Service的public方法
    @Pointcut("execution(public * com.reggie.service.*.*(..))")
    public void servicePointcut() {}
    
    @Around("servicePointcut()")
    public Object aroundLog(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取方法信息
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        long start = System.currentTimeMillis();
        log.info("[{}] {} 开始执行，参数: {}", className, methodName, args);
        
        try {
            // 执行原方法
            Object result = joinPoint.proceed();
            
            long end = System.currentTimeMillis();
            log.info("[{}] {} 执行成功，耗时: {}ms，返回值: {}", 
                    className, methodName, (end - start), result);
            
            return result;
        } catch (Exception e) {
            long end = System.currentTimeMillis();
            log.error("[{}] {} 执行失败，耗时: {}ms，异常: {}", 
                    className, methodName, (end - start), e.getMessage(), e);
            throw e;
        }
    }
}

// Service变得如此简洁！
@Service
public class OrderServiceImpl implements OrderService {
    
    @Override
    public Order createOrder(Order order) {
        // 只关注业务逻辑！
        User user = userService.getById(order.getUserId());
        Product product = productService.getById(order.getProductId());
        productService.reduceStock(product.getId(), order.getQuantity());
        return orderDao.save(order);
    }
}
```



**魔法效果：**

1. Service代码清爽了60%
2. 所有Service方法自动有了日志
3. 要改日志格式？改一个地方就行
4. 新加的方法自动有日志

## 二、AOP核心概念：连接点、切入点、通知、切面

![image-20260202181835763](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202181835763.png)

### 2.1 通俗理解AOP术语

**场景：** 我要给所有Service方法加日志

java

```java
// 1. 连接点（JoinPoint）：所有可能被增强的地方
// 比如：OrderService.createOrder()、OrderService.getOrder()、
//       UserService.login()、ProductService.reduceStock()...
// 瑞吉外卖里大概有50个这样的方法

// 2. 切入点（Pointcut）：我实际选择要增强的地方
// 比如：我只想给OrderService的所有方法加日志
// 表达式：execution(* com.reggie.service.OrderService.*(..))

// 3. 通知（Advice）：我要加的增强逻辑
// 比如：打印开始日志、计算耗时、打印结束日志、异常处理

// 4. 切面（Aspect）：通知 + 切入点 = 切面
// 就是把"打印日志"这个通知，应用到"OrderService的所有方法"这个切入点上
```



### 2.2 切入点表达式：精确制导的导弹

#### 2.2.1 基本语法

java

```java
// 格式：execution(访问修饰符 返回值 包名.类名.方法名(参数))
@Pointcut("execution(public * com.reggie.service.OrderService.createOrder(..))")
// 匹配：OrderService.createOrder方法，任何参数，任何返回值

@Pointcut("execution(* com.reggie.service.*.*(..))")
// 匹配：service包下所有类的所有方法

@Pointcut("execution(* com.reggie.service.*Service.*(..))")
// 匹配：service包下所有以Service结尾的类的所有方法

@Pointcut("execution(* com.reggie..service.*.*(..))")
// 匹配：com.reggie包及其子包下service包的所有类的所有方法

@Pointcut("execution(* *..service.*.*(..))")
// 匹配：任意包下的service包的所有类的所有方法（慎用，性能差！）
```



#### 2.2.2 瑞吉外卖实战表达式

java

```java
@Aspect
@Component
public class ReggieAspects {
    
    // 1. 给所有Service方法加日志
    @Pointcut("execution(* com.reggie.service.*Service.*(..))")
    public void serviceLog() {}
    
    // 2. 给所有Controller方法加请求日志（如果有Controller层）
    @Pointcut("execution(* com.reggie.controller.*Controller.*(..))")
    public void controllerLog() {}
    
    // 3. 给所有查询方法加缓存（方法名以get/find/list开头）
    @Pointcut("execution(* com.reggie.service.*Service.get*(..)) || " +
              "execution(* com.reggie.service.*Service.find*(..)) || " +
              "execution(* com.reggie.service.*Service.list*(..))")
    public void queryCache() {}
    
    // 4. 给所有更新方法加事务（方法名以save/update/delete开头）
    @Pointcut("execution(* com.reggie.service.*Service.save*(..)) || " +
              "execution(* com.reggie.service.*Service.update*(..)) || " +
              "execution(* com.reggie.service.*Service.delete*(..))")
    public void transactionRequired() {}
    
    // 5. 给特定方法加特殊处理（比如支付回调要幂等）
    @Pointcut("@annotation(com.reggie.annotation.Idempotent)")
    public void idempotent() {}
}
```



### 2.3 通知类型：5种增强时机

![image-20260202181906916](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202181906916.png)

java

```java
@Aspect
@Component
@Slf4j
public class AllAdviceTypesAspect {
    
    @Pointcut("execution(* com.reggie.service.OrderService.createOrder(..))")
    public void orderCreatePointcut() {}
    
    // 1. 前置通知：在目标方法执行前执行
    @Before("orderCreatePointcut()")
    public void beforeAdvice(JoinPoint joinPoint) {
        log.info("前置通知：准备创建订单，参数: {}", joinPoint.getArgs());
        // 可以做参数校验、权限校验等
    }
    
    // 2. 后置通知：在目标方法执行后执行（无论是否异常）
    @After("orderCreatePointcut()")
    public void afterAdvice(JoinPoint joinPoint) {
        log.info("后置通知：订单创建方法执行完毕");
        // 可以做一些清理工作
    }
    
    // 3. 返回通知：在目标方法正常返回后执行
    @AfterReturning(value = "orderCreatePointcut()", returning = "result")
    public void afterReturningAdvice(JoinPoint joinPoint, Object result) {
        log.info("返回通知：订单创建成功，返回值: {}", result);
        // 可以处理返回值，比如脱敏
    }
    
    // 4. 异常通知：在目标方法抛出异常后执行
    @AfterThrowing(value = "orderCreatePointcut()", throwing = "ex")
    public void afterThrowingAdvice(JoinPoint joinPoint, Exception ex) {
        log.error("异常通知：订单创建失败，异常: {}", ex.getMessage(), ex);
        // 可以记录异常日志、发送告警等
    }
    
    // 5. 环绕通知：最强大的通知，可以控制目标方法是否执行
    @Around("orderCreatePointcut()")
    public Object aroundAdvice(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info("环绕通知-前：开始执行");
        
        long start = System.currentTimeMillis();
        
        try {
            // 可以修改参数
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Order) {
                Order order = (Order) args[0];
                order.setCreateTime(new Date()); // 自动设置创建时间
            }
            
            // 执行目标方法（可以决定是否执行、何时执行）
            Object result = joinPoint.proceed(args);
            
            long end = System.currentTimeMillis();
            log.info("环绕通知-后：执行成功，耗时: {}ms", (end - start));
            
            // 可以修改返回值
            return result;
        } catch (Exception e) {
            long end = System.currentTimeMillis();
            log.error("环绕通知-异常：执行失败，耗时: {}ms", (end - start), e);
            throw e;
        }
    }
}
```



**执行顺序（同一个切面）：**

text

```
环绕通知-前 → 前置通知 → 目标方法 → 返回通知 → 后置通知 → 环绕通知-后
如果异常：环绕通知-前 → 前置通知 → 目标方法 → 异常通知 → 后置通知 → 环绕通知-异常
```



## 三、AOP实战：瑞吉外卖中的切面应用

![image-20260202182033684](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202182033684.png)

### 3.1 性能监控切面

java

```java
@Aspect
@Component
@Slf4j
public class PerformanceAspect {
    
    // 监控所有Service方法
    @Pointcut("execution(* com.reggie.service.*Service.*(..))")
    public void servicePointcut() {}
    
    @Around("servicePointcut()")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();
        
        try {
            return joinPoint.proceed();
        } finally {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            // 慢查询告警（超过1秒）
            if (duration > 1000) {
                log.warn("⚠️ 慢方法告警: {} 耗时 {}ms", methodName, duration);
                // 可以发送告警邮件、钉钉消息等
                sendAlert(methodName, duration);
            }
            
            // 统计信息（可以存到Redis或数据库）
            recordStats(methodName, duration);
        }
    }
    
    private void sendAlert(String methodName, long duration) {
        // 发送告警逻辑
        log.warn("发送慢方法告警: {} 耗时 {}ms", methodName, duration);
    }
    
    private void recordStats(String methodName, long duration) {
        // 记录统计信息，用于分析性能瓶颈
        String key = "performance:stats:" + methodName;
        // 可以用Redis的sorted set记录耗时分布
    }
}
```



### 3.2 缓存切面

java

```java
@Aspect
@Component
@Slf4j
public class CacheAspect {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 缓存查询结果（方法名以get/find/list开头）
    @Pointcut("execution(* com.reggie.service.*Service.get*(..)) || " +
              "execution(* com.reggie.service.*Service.find*(..)) || " +
              "execution(* com.reggie.service.*Service.list*(..))")
    public void cacheablePointcut() {}
    
    @Around("cacheablePointcut()")
    public Object cacheAround(ProceedingJoinPoint joinPoint) throws Throwable {
        // 生成缓存key：类名+方法名+参数哈希
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        String cacheKey = generateCacheKey(className, methodName, args);
        
        // 1. 先查缓存
        Object cachedValue = redisTemplate.opsForValue().get(cacheKey);
        if (cachedValue != null) {
            log.debug("缓存命中: {}，key: {}", methodName, cacheKey);
            return cachedValue;
        }
        
        log.debug("缓存未命中: {}，key: {}", methodName, cacheKey);
        
        // 2. 执行原方法
        Object result = joinPoint.proceed();
        
        // 3. 存入缓存（非空才缓存）
        if (result != null) {
            // 根据方法名设置不同的过期时间
            long timeout = getTimeout(methodName);
            redisTemplate.opsForValue().set(cacheKey, result, timeout, TimeUnit.SECONDS);
            log.debug("设置缓存: {}，key: {}，timeout: {}s", methodName, cacheKey, timeout);
        }
        
        return result;
    }
    
    // 更新操作清除相关缓存
    @Pointcut("execution(* com.reggie.service.*Service.save*(..)) || " +
              "execution(* com.reggie.service.*Service.update*(..)) || " +
              "execution(* com.reggie.service.*Service.delete*(..))")
    public void cacheEvictPointcut() {}
    
    @AfterReturning("cacheEvictPointcut()")
    public void evictCache(JoinPoint joinPoint) {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        // 根据方法名清除相关缓存
        if (methodName.contains("Product")) {
            // 清除商品相关缓存
            clearProductCache();
        } else if (methodName.contains("Order")) {
            // 清除订单相关缓存
            clearOrderCache();
        }
        // 其他业务逻辑...
    }
    
    private String generateCacheKey(String className, String methodName, Object[] args) {
        // 简单的key生成策略
        StringBuilder keyBuilder = new StringBuilder();
        keyBuilder.append("cache:").append(className).append(":").append(methodName);
        
        if (args != null && args.length > 0) {
            keyBuilder.append(":");
            for (Object arg : args) {
                keyBuilder.append(arg.toString()).append("_");
            }
        }
        
        return keyBuilder.toString();
    }
    
    private long getTimeout(String methodName) {
        // 根据方法类型设置不同的超时时间
        if (methodName.startsWith("get")) {
            return 60; // 1分钟
        } else if (methodName.startsWith("find")) {
            return 300; // 5分钟
        } else if (methodName.startsWith("list")) {
            return 600; // 10分钟
        }
        return 300; // 默认5分钟
    }
}
```



### 3.3 权限校验切面

java

```java
@Aspect
@Component
@Slf4j
public class PermissionAspect {
    
    @Autowired
    private HttpSession session;
    
    // 需要管理员权限的方法
    @Pointcut("@annotation(com.reggie.annotation.RequireAdmin)")
    public void requireAdminPointcut() {}
    
    @Before("requireAdminPointcut()")
    public void checkAdminPermission(JoinPoint joinPoint) {
        Long userId = (Long) session.getAttribute("employee");
        if (userId == null) {
            throw new BusinessException("请先登录");
        }
        
        // 查询用户信息
        Employee employee = employeeService.getById(userId);
        if (employee == null || employee.getStatus() == 0) {
            throw new BusinessException("用户不存在或已被禁用");
        }
        
        // 检查是否是管理员（假设管理员username是admin）
        if (!"admin".equals(employee.getUsername())) {
            throw new BusinessException("需要管理员权限");
        }
        
        log.info("权限校验通过: 用户 {} 执行 {}", employee.getUsername(), 
                joinPoint.getSignature().getName());
    }
    
    // 需要登录的方法
    @Pointcut("@annotation(com.reggie.annotation.RequireLogin)")
    public void requireLoginPointcut() {}
    
    @Before("requireLoginPointcut()")
    public void checkLogin(JoinPoint joinPoint) {
        Long userId = (Long) session.getAttribute("employee");
        if (userId == null) {
            throw new BusinessException("请先登录");
        }
    }
}

// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAdmin {
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireLogin {
}

// 使用注解
@Service
public class CategoryServiceImpl implements CategoryService {
    
    @Override
    @RequireAdmin  // 只有管理员能新增分类
    public void addCategory(Category category) {
        // 业务逻辑
    }
    
    @Override
    @RequireLogin  // 登录用户就能查看
    public List<Category> listCategories() {
        // 业务逻辑
        return categoryDao.list();
    }
}
```



## 四、Spring事务管理：AOP的经典应用

### 4.1 手动事务管理的痛苦

java

```java
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public void placeOrder(Order order) {
        Connection conn = null;
        try {
            // 1. 获取连接
            conn = dataSource.getConnection();
            
            // 2. 关闭自动提交
            conn.setAutoCommit(false);
            
            // 3. 执行业务
            orderDao.save(order, conn);
            productService.reduceStock(order.getProductId(), order.getQuantity(), conn);
            
            // 4. 提交事务
            conn.commit();
        } catch (Exception e) {
            // 5. 回滚事务
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            throw new BusinessException("下单失败", e);
        } finally {
            // 6. 关闭连接
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```



**问题：** 模板代码太多，容易遗漏，事务边界不清晰

### 4.2 @Transactional注解的魔法

java

```java
@Service
@Transactional  // 类级别：所有方法都开启事务
public class OrderServiceImpl implements OrderService {
    
    @Override
    public void placeOrder(Order order) {
        // 业务逻辑（自动在事务中执行）
        orderDao.save(order);
        productService.reduceStock(order.getProductId(), order.getQuantity());
        
        // 如果这里抛异常，事务会自动回滚
    }
    
    @Override
    @Transactional(readOnly = true)  // 方法级别：只读事务（可优化）
    public Order getOrder(Long id) {
        return orderDao.getById(id);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)  // 所有异常都回滚
    public void cancelOrder(Long orderId) {
        // 即使抛出自定义异常也会回滚
        orderDao.updateStatus(orderId, OrderStatus.CANCELLED);
        productService.addBackStock(orderId);
    }
}
```



### 4.3 事务传播行为：解决嵌套事务问题

**场景：** 下单时不仅要创建订单，还要记录操作日志

java

```java
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private LogService logService;
    
    @Override
    @Transactional
    public void placeOrder(Order order) {
        // 1. 保存订单（在事务中）
        orderDao.save(order);
        
        // 2. 记录日志（问题：如果这里抛异常，订单也会回滚！）
        logService.log("创建订单", "订单ID: " + order.getId());
        
        // 我们希望：日志记录失败不影响订单创建
    }
}

@Service
public class LogServiceImpl implements LogService {
    
    @Override
    @Transactional  // 默认传播行为：REQUIRED（加入当前事务）
    public void log(String action, String content) {
        logDao.save(new Log(action, content));
        
        // 如果这里抛异常，整个事务（包括订单）都会回滚
        throw new RuntimeException("日志保存失败");
    }
}
```



**解决方案：** 修改传播行为

java

```java
@Service
public class LogServiceImpl implements LogService {
    
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)  // 新开事务
    public void log(String action, String content) {
        logDao.save(new Log(action, content));
        
        // 现在这个异常只会导致日志事务回滚，不会影响订单事务
        throw new RuntimeException("日志保存失败");
    }
}
```



### 4.4 常见事务传播行为

java

```java
@Service
public class ComplexService {
    
    // 1. REQUIRED（默认）：有事务就加入，没有就新建
    @Transactional(propagation = Propagation.REQUIRED)
    public void methodA() {
        // 如果methodB()抛异常，methodA()也会回滚
        methodB();
    }
    
    // 2. REQUIRES_NEW：总是新建事务，挂起当前事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void methodB() {
        // 独立事务，失败不影响methodA()
    }
    
    // 3. NESTED：嵌套事务，子事务回滚不影响父事务
    @Transactional(propagation = Propagation.NESTED)
    public void methodC() {
        // 嵌套事务，有自己的保存点
    }
    
    // 4. SUPPORTS：有事务就加入，没有就算了
    @Transactional(propagation = Propagation.SUPPORTS)
    public void methodD() {
        // 不主动开启事务
    }
    
    // 5. NOT_SUPPORTED：非事务执行，挂起当前事务
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void methodE() {
        // 强制不在事务中执行
    }
    
    // 6. MANDATORY：必须在事务中调用，否则抛异常
    @Transactional(propagation = Propagation.MANDATORY)
    public void methodF() {
        // 必须在事务中调用
    }
    
    // 7. NEVER：不能在事务中调用，否则抛异常
    @Transactional(propagation = Propagation.NEVER)
    public void methodG() {
        // 必须不在事务中
    }
}
```



## 五、AOP底层原理：动态代理的魔法

![image-20260202182200502](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260202182200502.png)

### 5.1 JDK动态代理 vs CGLIB代理

java

```java
// 场景：给OrderService加日志

// 1. 如果OrderService有接口（实现了OrderService接口）
// Spring使用JDK动态代理
public class $Proxy0 implements OrderService {
    private OrderService target;  // 原始对象
    private LogAspect logAspect;  // 切面
    
    @Override
    public Order createOrder(Order order) {
        // 调用切面的前置通知
        logAspect.before();
        
        try {
            // 调用原始对象的方法
            Order result = target.createOrder(order);
            
            // 调用切面的返回通知
            logAspect.afterReturning(result);
            return result;
        } catch (Exception e) {
            // 调用切面的异常通知
            logAspect.afterThrowing(e);
            throw e;
        } finally {
            // 调用切面的后置通知
            logAspect.after();
        }
    }
}

// 2. 如果OrderService没有接口（直接是类）
// Spring使用CGLIB代理
public class OrderService$$EnhancerByCGLIB extends OrderService {
    private LogAspect logAspect;
    
    @Override
    public Order createOrder(Order order) {
        // 类似JDK动态代理的逻辑，但是通过继承实现
        // ...
    }
}
```



### 5.2 验证代理类型

java

```java
@SpringBootTest
public class AopTest {
    
    @Autowired
    private OrderService orderService;  // 注意：这是代理对象！
    
    @Test
    public void testProxyType() {
        // 打印类名
        System.out.println(orderService.getClass().getName());
        // JDK代理：com.sun.proxy.$ProxyXXX
        // CGLIB代理：com.reggie.service.OrderService$$EnhancerBySpringCGLIB$$XXX
        
        // 检查是否是代理
        System.out.println(AopUtils.isAopProxy(orderService));  // true
        System.out.println(AopUtils.isJdkDynamicProxy(orderService));  // true/false
        System.out.println(AopUtils.isCglibProxy(orderService));  // true/false
        
        // 获取原始对象（target）
        OrderService target = (OrderService) AopProxyUtils.getSingletonTarget(orderService);
    }
}
```



## 六、AOP的坑与解决方案

### 6.1 自调用问题：AOP失效

java

```java
@Service
public class OrderServiceImpl implements OrderService {
    
    @Override
    @Transactional
    public void placeOrder(Order order) {
        // 业务逻辑...
        
        // 自调用：AOP失效！
        this.sendNotification(order);  // 事务不会生效！
        
        // 正确做法：注入自己，或者拆分方法
    }
    
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(Order order) {
        // 发送通知
    }
}
```



**解决方案1：注入自己（有点奇怪但有用）**

java

```java
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderService self;  // 注入自己，Spring会注入代理对象
    
    @Override
    @Transactional
    public void placeOrder(Order order) {
        // 业务逻辑...
        
        // 通过代理对象调用
        self.sendNotification(order);  // 事务生效！
    }
}
```



**解决方案2：拆分到不同类**

java

```javajava
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private NotificationService notificationService;
    
    @Override
    @Transactional
    public void placeOrder(Order order) {
        // 业务逻辑...
        
        notificationService.send(order);  // 事务生效！
    }
}
```



### 6.2 切面执行顺序问题

java

```java
@Aspect
@Order(1)  // 指定顺序，数字越小优先级越高
@Component
public class LogAspect {
    // 最先执行
}

@Aspect
@Order(2)
@Component  
public class CacheAspect {
    // 其次执行
}

@Aspect
@Order(3)
@Component
public class TransactionAspect {
    // 最后执行（事务要包裹所有操作）
}
```



**执行顺序：**

text

```
LogAspect.around前 → CacheAspect.around前 → TransactionAspect.around前
→ 目标方法
→ TransactionAspect.around后 → CacheAspect.around后 → LogAspect.around后
```



### 6.3 性能考虑

java

```java
@Aspect
@Component
public class PerformanceConsiderationAspect {
    
    // 错误：太宽泛，会影响所有Bean，包括Spring自己的Bean！
    @Pointcut("execution(* *(..))")
    public void tooBroad() {}
    
    // 正确：只针对业务包
    @Pointcut("execution(* com.reggie.service..*(..))")
    public void businessOnly() {}
    
    // 更好：只针对Service层
    @Pointcut("execution(* com.reggie.service.*Service.*(..))")
    public void serviceLayer() {}
    
    // 最好：使用注解，精确控制
    @Pointcut("@annotation(com.reggie.annotation.Monitor)")
    public void monitorAnnotated() {}
}
```



## 七、如果重来一次，我会...

### 7.1 更早使用自定义注解

java

```java
// 定义业务语义明确的注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLog {
    String value() default "";
    OperationType type() default OperationType.OTHER;
}

public enum OperationType {
    CREATE, UPDATE, DELETE, QUERY, LOGIN, LOGOUT
}

// 在Service方法上使用
@Service
public class EmployeeServiceImpl implements EmployeeService {
    
    @Override
    @OperationLog(value = "员工登录", type = OperationType.LOGIN)
    public Employee login(String username, String password) {
        // ...
    }
    
    @Override
    @OperationLog(value = "新增员工", type = OperationType.CREATE)
    @RequireAdmin
    public void addEmployee(Employee employee) {
        // ...
    }
}

// 切面根据注解做不同处理
@Aspect
@Component
public class OperationLogAspect {
    
    @AfterReturning("@annotation(operationLog)")
    public void logOperation(JoinPoint joinPoint, OperationLog operationLog) {
        // 根据operationLog.type()做不同的日志处理
        if (operationLog.type() == OperationType.LOGIN) {
            // 登录日志特殊处理
        } else if (operationLog.type() == OperationType.CREATE) {
            // 创建操作日志
        }
        // ...
    }
}
```



### 7.2 统一异常处理

java

```java
@Aspect
@Component
@Slf4j
public class GlobalExceptionAspect {
    
    @Pointcut("execution(* com.reggie.controller..*(..))")
    public void controllerPointcut() {}
    
    @AfterThrowing(pointcut = "controllerPointcut()", throwing = "ex")
    public void handleException(JoinPoint joinPoint, Exception ex) {
        // 统一记录异常日志
        log.error("Controller异常: {}.{}", 
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(), ex);
        
        // 根据异常类型做不同处理
        if (ex instanceof BusinessException) {
            // 业务异常，返回给前端友好提示
        } else if (ex instanceof AuthenticationException) {
            // 认证异常，跳转到登录页
        } else {
            // 系统异常，返回系统错误
        }
    }
}
```



### 7.3 监控告警一体化

java

```java
@Aspect
@Component
@Slf4j
public class MonitorAspect {
    
    @Pointcut("@annotation(com.reggie.annotation.Monitor)")
    public void monitorPointcut() {}
    
    @Around("monitorPointcut()")
    public Object monitor(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();
        
        // 监控指标：开始计数
        Metrics.counter("method.start", methodName).increment();
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - start;
            
            // 记录成功指标
            Metrics.timer("method.success", methodName).record(duration);
            
            // 慢查询告警
            if (duration > 1000) {
                Alert.send("慢方法告警", methodName + " 耗时 " + duration + "ms");
            }
            
            return result;
        } catch (Exception e) {
            // 记录失败指标
            Metrics.counter("method.error", methodName).increment();
            
            // 异常告警
            Alert.send("方法异常告警", methodName + " 异常: " + e.getMessage());
            
            throw e;
        }
    }
}
```



## 结语：从"代码搬运工"到"架构师"的思维转变

学习AOP的过程，让我从一个只会写业务代码的程序员，开始思考**系统架构**的问题：

1. **关注点分离**：业务代码只关心业务，横切关注点交给AOP
2. **开闭原则**：新增功能不修改原有代码，通过切面扩展
3. **DRY原则**：消除重复代码，一次编写处处生效
4. **可观测性**：通过AOP轻松实现监控、日志、追踪

**现在看那些到处打印日志的代码，就像看到原始人用石头刻字——虽然能记录信息，但效率太低了。**

**Spring AOP教给我的最重要的一课是：优秀的架构不是做加法，而是做减法。不是往代码里加更多逻辑，而是把无关的逻辑抽离出去，让核心业务保持纯净。**

与所有正在被重复代码困扰的程序员共勉：**当你第三次写同样的代码时，就该考虑用AOP了。**