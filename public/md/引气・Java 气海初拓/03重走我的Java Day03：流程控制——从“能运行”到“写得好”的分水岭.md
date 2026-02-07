## 重走我的Java Day03：流程控制——从“能运行”到“写得好”的分水岭

> 如果前两天的内容是学习“造砖”，那今天就是学习“砌墙”。流程控制决定了你的代码是坚固的建筑，还是随时会塌的积木。

### 开篇：我那个让服务器崩溃的“循环”

![image-20260201133026366](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201133026366.png)

一年前，我第一次在生产环境写的代码，是一个简单的日志清理脚本。需求很直接：“删除30天前的日志文件”。我信心满满地写了一个for循环遍历目录，判断文件日期，然后删除。

代码上线后第一分钟，系统监控告警：磁盘IO飙到100%，服务响应时间从50ms飙升到5000ms。我被迫回滚，被导师叫到会议室。

“知道问题在哪吗？”他问。

我以为是日期判断逻辑错了。他摇头，在白板上画了两个循环：

java

```java
// 我写的版本
for (File file : getAllFiles()) {
    if (isOlderThan30Days(file)) {
        deleteFile(file);  // 同步IO操作
    }
}

// 他建议的版本
List<File> filesToDelete = new ArrayList<>();
for (File file : getAllFiles()) {
    if (isOlderThan30Days(file)) {
        filesToDelete.add(file);
    }
}
// 批量、异步删除
deleteFilesAsync(filesToDelete);
```



差别不在语法，而在**思维**。我的循环里混了业务判断和IO操作，每次删除都阻塞线程。他的版本将“筛选”和“执行”分离。

那一天我明白：流程控制的核心不是记住`for`和`while`的语法，而是理解**数据流与控制流的分离**。

### 一、分支结构：if-else的“金字塔噩梦”与救赎

每个程序员都经历过if-else嵌套地狱。我早期最“自豪”的代码，是一个用户权限检查：

![image-20260201133103313](../../../../../../../Library/Application%20Support/typora-user-images/image-20260201133103313.png)

java

```java
// ❌ 噩梦开始：if-else金字塔
public boolean checkPermission(User user, Resource resource, Operation op) {
    if (user != null) {
        if (user.isActive()) {
            if (resource != null) {
                if (resource.isAvailable()) {
                    if (op != null) {
                        if (user.hasRole("admin")) {
                            return true;
                        } else {
                            if (user.hasPermission(resource, op)) {
                                if (!isDuringMaintenance()) {
                                    return true;
                                } else {
                                    log.warn("系统维护中");
                                    return false;
                                }
                            } else {
                                log.warn("权限不足");
                                return false;
                            }
                        }
                    } else {
                        log.warn("操作不能为空");
                        return false;
                    }
                } else {
                    log.warn("资源不可用");
                    return false;
                }
            } else {
                log.warn("资源不能为空");
                return false;
            }
        } else {
            log.warn("用户未激活");
            return false;
        }
    } else {
        log.warn("用户不能为空");
        return false;
    }
}
```



阅读这段代码就像走迷宫。更可怕的是，它的**圈复杂度高达12**（业内要求通常不超过10）。

#### 重构方案1：卫语句（Guard Clauses）

java

```java
// ✅ 第一层优化：尽早返回
public boolean checkPermission(User user, Resource resource, Operation op) {
    // 卫语句：先处理所有失败情况
    if (user == null) {
        log.warn("用户不能为空");
        return false;
    }
    if (!user.isActive()) {
        log.warn("用户未激活");
        return false;
    }
    if (resource == null) {
        log.warn("资源不能为空");
        return false;
    }
    if (!resource.isAvailable()) {
        log.warn("资源不可用");
        return false;
    }
    if (op == null) {
        log.warn("操作不能为空");
        return false;
    }
    if (isDuringMaintenance()) {
        log.warn("系统维护中");
        return false;
    }
    
    // 现在只剩下核心业务逻辑
    if (user.hasRole("admin")) {
        return true;
    }
    
    return user.hasPermission(resource, op);
}
```



#### 重构方案2：策略模式

java

```java
// ✅ 终极方案：策略模式 + 责任链
public class PermissionChecker {
    private final List<CheckRule> rules = Arrays.asList(
        new UserNotNullRule(),
        new UserActiveRule(),
        new ResourceAvailableRule(),
        new MaintenanceRule(),
        new AdminRoleRule(),  // 管理员直接通过
        new PermissionRule()   // 普通权限检查
    );
    
    public boolean check(User user, Resource resource, Operation op) {
        for (CheckRule rule : rules) {
            CheckResult result = rule.check(user, resource, op);
            if (!result.isPassed()) {
                log.warn(result.getMessage());
                return false;
            }
            if (result.isShortCircuit()) {
                return true;  // 如管理员规则，直接通过
            }
        }
        return true;
    }
}
```



**关键洞察**：if-else不是问题，问题是**嵌套深度**和**职责混合**。好的分支结构像漏斗——先过滤无效情况，最后处理核心逻辑。

### 二、switch：从“鸡肋”到“利器”的认知升级

我一度认为switch是Java的“鸡肋”特性——只能做等值判断，功能被if-else完全覆盖。直到我遇到这两个场景：

![image-20260201133238751](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201133238751.png)

#### 场景1：状态机的优雅实现

java

```java
// 订单状态流转
public class OrderProcessor {
    public void process(Order order, Event event) {
        switch (order.getStatus()) {
            case NEW -> handleNewOrder(order, event);
            case PAID -> handlePaidOrder(order, event);
            case SHIPPED -> handleShippedOrder(order, event);
            case DELIVERED -> handleDeliveredOrder(order, event);
            case CANCELLED -> handleCancelledOrder(order, event);
            default -> throw new IllegalStateException("未知状态: " + order.getStatus());
        }
    }
    
    private void handleNewOrder(Order order, Event event) {
        switch (event.getType()) {
            case PAYMENT_RECEIVED -> {
                order.setStatus(Status.PAID);
                sendPaymentConfirmation(order);
            }
            case CANCELLATION -> {
                order.setStatus(Status.CANCELLED);
                refundIfNeeded(order);
            }
            // ...
        }
    }
}
```



switch在这里比if-else链清晰得多，特别是Java 12+的switch表达式：

java

```java
// Java 14+ switch表达式（更简洁）
String statusDescription = switch (order.getStatus()) {
    case NEW -> "新订单，等待支付";
    case PAID -> "已支付，等待发货";
    case SHIPPED -> "已发货，运输中";
    case DELIVERED -> "已送达";
    case CANCELLED -> "已取消";
    default -> {
        log.warn("未知状态: {}", order.getStatus());
        yield "状态未知";
    }
};
```



#### 场景2：性能关键路径

在一次性能优化中，我发现一个热点函数里有一段if-else链：

java

```java
// 原始的if-else链（每次都要顺序比较）
String getCategory(int type) {
    if (type == 1) return "A";
    if (type == 2) return "B";
    if (type == 3) return "C";
    // ... 20多个if-else
    return "OTHER";
}
```



这个函数每秒被调用上百万次。我改成switch后，性能提升了15%：

java

```java
// switch（JVM可能优化为跳转表）
String getCategory(int type) {
    switch (type) {
        case 1: return "A";
        case 2: return "B";
        case 3: return "C";
        // ...
        default: return "OTHER";
    }
}
```



**为什么更快？** JVM可能将switch编译为`tableswitch`（连续值）或`lookupswitch`（稀疏值），都是O(1)的跳转，而if-else链是O(n)的顺序比较。

#### switch的现代用法：模式匹配（Java 17预览）

java

```java
// Java 17+ 模式匹配（预览特性）
static String format(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("整数: %d", i);
        case Long l    -> String.format("长整数: %d", l);
        case Double d  -> String.format("浮点数: %.2f", d);
        case String s  -> String.format("字符串: %s", s);
        case null      -> "null";
        default        -> obj.toString();
    };
}
```



### 三、循环：不只是“重复”，而是“遍历”与“转换”

#### 1. for循环的认知升级：从索引到迭代器

我早期遍历列表是这样的：

java

```java
// 初级：索引遍历（容易越界）
for (int i = 0; i < list.size(); i++) {
    String item = list.get(i);
    process(item);
}
```



这里隐藏一个问题：如果`list`是`LinkedList`，`list.get(i)`是O(n)操作，整个循环变成O(n²)！

![image-20260201133539059](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201133539059.png)

**正确做法**：

java

```java
// 中级：迭代器（所有List都高效）
for (Iterator<String> it = list.iterator(); it.hasNext(); ) {
    String item = it.next();
    process(item);
}

// 高级：增强for循环（语法糖，编译为迭代器）
for (String item : list) {
    process(item);
}
```



#### 2. while循环：处理“不确定”的艺术

while循环适合“不知道要循环多少次”的场景。我写过一个数据同步程序：

java

```java
// 从消息队列消费，直到队列为空
int batchSize = 100;
List<Message> messages;
do {
    messages = messageQueue.poll(batchSize);
    if (!messages.isEmpty()) {
        processBatch(messages);
        messageQueue.commit();
    }
} while (!messages.isEmpty() && !isShutdownRequested());
```



这里的关键是**循环条件要包含退出机制**。我见过一个死循环：

java

```java
// ❌ 经典死循环：忘记更新条件
while (offset < total) {
    // 处理数据...
    // 忘记 offset += batchSize;
}
```



#### 3. 循环控制：break与continue的哲学

break和continue用得好是艺术，用不好是灾难。

**break的智慧**：不仅是“退出”，更是“找到即停止”

java

```java
// 在列表中查找特定元素
String target = null;
for (String item : list) {
    if (isWhatWeNeed(item)) {
        target = item;
        break;  // 找到就停止，不浪费CPU
    }
}
```



**continue的妙用**：过滤与清理

java

```java
// 处理一批数据，跳过无效的
int validCount = 0;
for (Data data : dataList) {
    if (data == null) {
        log.warn("遇到空数据，跳过");
        continue;
    }
    
    if (!data.isValid()) {
        log.warn("数据无效: {}", data.getId());
        continue;
    }
    
    // 只有有效数据到达这里
    processValidData(data);
    validCount++;
}
log.info("处理了 {} 条有效数据，跳过了 {} 条", validCount, dataList.size() - validCount);
```



#### 4. 循环性能的隐藏杀手：方法调用

这是我调优过的一个真实案例：

java

```java
// 低效版本：每次循环都调用size()
for (int i = 0; i < list.size(); i++) {
    // ...
}

// 高效版本：缓存size
int size = list.size();
for (int i = 0; i < size; i++) {
    // ...
}
```



差别微乎其微？当循环执行上亿次时，这个差别就是秒和分钟的差距。

### 四、嵌套循环：复杂度爆炸与优化策略

![image-20260201133805234](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201133805234.png)

嵌套循环是性能问题的重灾区。我处理过一个数据分析任务，最初版本：

java

```java
// O(n²) 的嵌套循环
List<Pair> findRelatedItems(List<Item> items) {
    List<Pair> pairs = new ArrayList<>();
    for (int i = 0; i < items.size(); i++) {
        for (int j = i + 1; j < items.size(); j++) {
            if (items.get(i).isRelatedTo(items.get(j))) {
                pairs.add(new Pair(items.get(i), items.get(j)));
            }
        }
    }
    return pairs;
}
```



1000个元素 → 近50万次比较。优化后：

java

```java
// O(n) 使用哈希表
List<Pair> findRelatedItems(List<Item> items) {
    List<Pair> pairs = new ArrayList<>();
    Map<String, Item> index = new HashMap<>();
    
    for (Item item : items) {
        Item related = index.get(item.getKey());
        if (related != null) {
            pairs.add(new Pair(item, related));
        }
        index.put(item.getKey(), item);
    }
    return pairs;
}
```



**嵌套循环优化原则**：

1. 能否用数据结构（哈希表、集合）替代内层循环？
2. 能否先排序，然后使用更高效的算法？
3. 能否提前break或continue减少迭代次数？

### 五、实际案例：从“作业题”到“工程代码”

#### 案例1：猜数字游戏的工业级实现

![image-20260201133909534](https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260201133909534.png)

例子是教学版，工业级要考虑更多：

java

```java
public class GuessNumberGame {
    private static final int MAX_ATTEMPTS = 7;
    private static final int MIN_NUMBER = 1;
    private static final int MAX_NUMBER = 100;
    
    public void play() {
        Random random = new SecureRandom();  // 安全随机数
        int target = random.nextInt(MAX_NUMBER - MIN_NUMBER + 1) + MIN_NUMBER;
        
        try (Scanner scanner = new Scanner(System.in)) {
            int attempts = 0;
            boolean guessed = false;
            
            while (attempts < MAX_ATTEMPTS && !guessed) {
                System.out.printf("尝试 %d/%d，请输入数字 (%d-%d): ",
                    attempts + 1, MAX_ATTEMPTS, MIN_NUMBER, MAX_NUMBER);
                
                if (!scanner.hasNextInt()) {
                    System.out.println("请输入有效的数字！");
                    scanner.next(); // 清除无效输入
                    continue;
                }
                
                int guess = scanner.nextInt();
                attempts++;
                
                if (guess < MIN_NUMBER || guess > MAX_NUMBER) {
                    System.out.printf("数字必须在 %d 到 %d 之间！%n", MIN_NUMBER, MAX_NUMBER);
                    continue;
                }
                
                if (guess == target) {
                    System.out.printf("恭喜！你在第 %d 次猜对了！%n", attempts);
                    guessed = true;
                } else if (guess < target) {
                    System.out.println("猜小了！");
                } else {
                    System.out.println("猜大了！");
                }
            }
            
            if (!guessed) {
                System.out.printf("很遗憾，正确数字是 %d%n", target);
            }
            
            System.out.println("游戏结束！");
        }
    }
}
```



**改进点**：

1. 安全的随机数生成器（`SecureRandom`）
2. 尝试次数限制，防止无限循环
3. 输入验证和错误处理
4. 资源自动关闭（try-with-resources）

#### 案例2：九九乘法表的多种实现

不只是打印，而是思考不同实现背后的思维：

java

```java
// 方法1：传统嵌套循环
public void printMultiplicationTable1() {
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= i; j++) {
            System.out.printf("%d×%d=%-2d  ", j, i, i * j);
        }
        System.out.println();
    }
}

// 方法2：使用StringBuilder减少IO
public void printMultiplicationTable2() {
    StringBuilder sb = new StringBuilder();
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= i; j++) {
            sb.append(String.format("%d×%d=%-2d  ", j, i, i * j));
        }
        sb.append("\n");
    }
    System.out.print(sb.toString());  // 一次IO操作
}

// 方法3：函数式风格（Java 8+）
public void printMultiplicationTable3() {
    IntStream.rangeClosed(1, 9)
        .forEach(i -> {
            IntStream.rangeClosed(1, i)
                .forEach(j -> System.out.printf("%d×%d=%-2d  ", j, i, i * j));
            System.out.println();
        });
}
```



#### 案例3：判断素数的生产级实现

用户给的例子是教学版，实际要考虑大数性能：

java

```java
public class PrimeChecker {
    // 缓存小素数，加速判断
    private static final Set<Integer> SMALL_PRIMES = Set.of(2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
    private static final int[] PRIME_WHEEL = {6, 4, 2, 4, 2, 4, 6, 2};  // 轮子法
    
    public static boolean isPrime(int n) {
        // 快速检查小数字
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;
        if (n < 30) return SMALL_PRIMES.contains(n);
        
        // 只检查6k±1的形式
        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }
    
    // 对于大数的概率性测试（Miller-Rabin）
    public static boolean isProbablyPrime(long n, int certainty) {
        if (n < 2) return false;
        if (n == 2 || n == 3) return true;
        if (n % 2 == 0) return false;
        
        long d = n - 1;
        int s = 0;
        while (d % 2 == 0) {
            d /= 2;
            s++;
        }
        
        Random rnd = new SecureRandom();
        for (int i = 0; i < certainty; i++) {
            long a = 2 + rnd.nextLong() % (n - 3);
            if (!millerTest(a, d, n, s)) {
                return false;
            }
        }
        return true;
    }
}
```



### 六、流程控制的最佳实践与思维模型

经过多年实践，我总结了流程控制的“思维模型”：

#### 1. 圈复杂度控制

- 单个方法圈复杂度 ≤ 10
- 超过时提取子方法或使用策略模式
- 工具：SonarQube、Checkstyle自动检查

#### 2. 循环选择决策树

text

```
需要循环吗？
├── 是 → 循环次数已知吗？
│   ├── 是 → 需要索引吗？
│   │   ├── 是 → 传统for循环
│   │   └── 否 → 增强for循环
│   └── 否 → 至少执行一次吗？
│       ├── 是 → do-while
│       └── 否 → while
└── 否 → 考虑递归或流式API
```



#### 3. 分支结构选择指南

text

```
需要判断什么？
├── 等值判断（且case ≥ 3） → switch
├── 区间判断 → if-else if
├── 复杂条件组合 → 提取方法 + 卫语句
└── 多维度判断 → 策略模式/状态模式
```



#### 4. 避免的“反模式”

java

```java
// 反模式1：循环内try-catch
for (Item item : items) {
    try {
        process(item);
    } catch (Exception e) {
        // 应该在外层统一处理
    }
}

// 反模式2：修改循环中的集合
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
for (String s : list) {
    if ("B".equals(s)) {
        list.remove(s);  // ConcurrentModificationException!
    }
}

// 反模式3：浮点数作为循环计数器
for (double d = 0; d < 1.0; d += 0.1) {
    // 可能执行9次或10次，浮点误差不可预测
}
```



### 结语：流程控制是编程的“呼吸节奏”

一年前那个让我出丑的日志清理脚本，今天看来是个宝贵的礼物。它教会我：**流程控制不仅是让代码运行，更是让代码优雅地运行**。

好的流程控制像呼吸——自然、有节奏、无需刻意思考。差的流程控制像哮喘——时断时续，让人提心吊胆。

Day3的内容看似基础，实则是你编程风格的奠基石。你今天写的每一个if、每一个for，都在塑造你作为程序员的思维习惯。

当你能一眼看出嵌套循环的性能问题，当你能自然地将复杂条件重构为清晰策略，当你能在switch和if-else间做出最优选择——你就完成了从“码农”到“工程师”的关键转变。

记住：代码首先是写给人看的，其次才是给机器执行的。流程控制是你的第一个，也是最重要的表达工具。

明天，当你学习数组时，你会看到这些流程控制结构如何与数据结构完美结合。但那是明天的故事了。

今天，好好练习你的“呼吸”。