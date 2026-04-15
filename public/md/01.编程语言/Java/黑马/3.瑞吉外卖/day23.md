# 【项目实战1 -瑞吉外卖｜day23 】

## 一、核心架构与源码设计思想

### 1. 整体架构分层（源码目录对应）

plaintext

```plaintext
com.itheima.reggie
├── controller：接口层（接收请求、返回响应）→ 如SetmealController、UserController
├── service：业务层（核心逻辑、事务控制）→ 如SetmealServiceImpl、OrderServiceImpl
├── mapper：持久层（数据库操作）→ 基于MyBatis-Plus BaseMapper
├── entity：实体类（映射数据库表）→ 如Setmeal、ShoppingCart
├── dto：数据传输对象（适配前后端数据格式）→ 如SetmealDto、DishDto
├── common：通用组件（统一返回、全局异常、ThreadLocal工具）→ R.java、BaseContext.java
└── utils：工具类（短信、验证码、ID生成）→ SMSUtils、IdWorker
```

### 2. 核心设计思想

- **分层解耦**：Controller 接收请求，Service 处理逻辑，Mapper 操作数据库，职责单一；
- **DTO 模式**：解决前后端数据格式不匹配（如 SetmealDto 扩展菜品列表、分类名称）；
- **事务一致性**：多表操作（如套餐新增、下单）必加`@Transactional`；
- **用户隔离**：通过`BaseContext`（ThreadLocal）存储当前用户 ID，所有操作关联用户；
- **复用优先**：单表 CRUD 复用 MyBatis-Plus BaseMapper，通用组件（R、GlobalExceptionHandler）全局复用。

## 二、Day05 核心模块源码深度分析

### 模块 1：套餐管理（多表操作 + 事务控制）

#### 1. 核心实体与 DTO 源码分析

java

```java
// Setmeal.java（实体类：映射setmeal表）
@Data
public class Setmeal extends BaseEntity {
    private String name;          // 套餐名称（唯一索引）
    private Long categoryId;     // 关联套餐分类
    private BigDecimal price;    // 套餐价格
    private String code;         // 套餐编码
    private String image;        // 套餐图片
    private String description;  // 描述
    private Integer status;      // 状态（1起售/0停售）
}

// SetmealDto.java（DTO：适配前端请求/响应）
@Data
public class SetmealDto extends Setmeal {
    private List<SetmealDish> setmealDishes; // 前端传递的关联菜品列表（实体类无此字段）
    private String categoryName;            // 响应给前端的分类名称（实体类无此字段）
}
```

- **DTO 设计思想**：实体类严格映射数据库表，DTO 扩展前后端交互所需字段，避免实体类冗余；
- **数据流转**：前端→Controller（接收 SetmealDto）→Service（拆分 Setmeal 和 SetmealDish）→Mapper（分别插入两表）。

#### 2. 新增套餐源码深入分析（SetmealServiceImpl.saveWithDish）

java

```java
@Transactional // 事务隔离级别默认DEFAULT，传播行为REQUIRED
public void saveWithDish(SetmealDto setmealDto) {
    // 1. 保存套餐基本信息（操作setmeal表）
    this.save(setmealDto); // 复用MyBatis-Plus BaseMapper的save方法
    Long setmealId = setmealDto.getId(); // 新增后自动回显ID（MyBatis-Plus特性）
    
    // 2. 处理套餐-菜品关联数据（操作setmeal_dish表）
    List<SetmealDish> setmealDishes = setmealDto.getSetmealDishes();
    // 给每个关联菜品设置套餐ID（关键：建立两表关联）
    setmealDishes.stream().forEach(dish -> dish.setSetmealId(setmealId));
    
    // 3. 批量保存关联数据（批量操作提升性能）
    setmealDishService.saveBatch(setmealDishes); 
}
```

- **事务底层**：`@Transactional`基于 Spring AOP 实现，默认捕获 RuntimeException 回滚；
- **性能优化**：`saveBatch`底层执行批量 INSERT SQL（而非循环单条插入），减少数据库交互次数；
- **关键依赖**：SetmealDish 的 setmealId 必须与 Setmeal 的 id 一致，否则关联失败。

#### 3. 套餐删除源码深入分析（SetmealServiceImpl.removeWithDish）

java

```java
@Transactional
public void removeWithDish(List<Long> ids) {
    // 步骤1：校验套餐状态（核心：售卖中套餐不允许删除）
    LambdaQueryWrapper<Setmeal> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.in(Setmeal::getId, ids)
                .eq(Setmeal::getStatus, 1); // 1=起售
    int count = this.count(queryWrapper);
    if (count > 0) {
        throw new CustomException("套餐正在售卖中，无法删除"); // 自定义异常触发事务回滚
    }

    // 步骤2：删除套餐表数据（批量删除）
    this.removeByIds(ids); // MyBatis-Plus批量删除，底层执行DELETE ... IN (ids)

    // 步骤3：删除关联菜品表数据
    LambdaQueryWrapper<SetmealDish> dishWrapper = new LambdaQueryWrapper<>();
    dishWrapper.in(SetmealDish::getSetmealId, ids);
    setmealDishService.remove(dishWrapper);
}
```

- **异常机制**：CustomException 是 RuntimeException 子类，抛出后事务回滚；
- **校验逻辑**：先校验状态再删除，避免删除已售套餐导致订单数据关联失效；
- **SQL 执行顺序**：先删主表（setmeal）还是从表（setmeal_dish）？→ 此处先删主表，但实际应先删从表（避免外键约束报错），源码需优化（避坑点）。

### 模块 2：手机验证码登录（第三方服务 + Session+ThreadLocal）

#### 1. 核心工具类源码分析（SMSUtils）

java

```java
public class SMSUtils {
    public static void sendMessage(String signName, String templateCode, String phone, String code) {
        // 1. 初始化阿里云SDK客户端
        DefaultProfile profile = DefaultProfile.getProfile(
            "cn-hangzhou", // 地域
            "AccessKeyId", // 子用户AccessKey（仅授权短信服务）
            "AccessKeySecret"
        );
        IAcsClient client = new DefaultAcsClient(profile);

        // 2. 构建短信请求参数
        SendSmsRequest request = new SendSmsRequest();
        request.setPhoneNumbers(phone); // 接收手机号
        request.setSignName(signName); // 审核通过的签名
        request.setTemplateCode(templateCode); // 审核通过的模板ID
        request.setTemplateParam("{\"code\":\"" + code + "\"}"); // 模板参数（JSON格式）

        try {
            client.getAcsResponse(request); // 发送请求（无返回值，异常表示失败）
        } catch (ClientException e) {
            e.printStackTrace();
        }
    }
}
```

- **第三方集成原则**：工具类封装第三方 SDK，业务层无需关注底层调用细节，仅调用工具类方法；
- **安全设计**：AccessKey 使用子用户，仅分配短信服务权限，避免主账号泄露导致全权限风险；
- **开发技巧**：个人账号无法通过签名审核时，可注释`client.getAcsResponse(request)`，用`log.info("验证码：{}", code)`模拟发送。

#### 2. 登录流程源码深度分析（UserController）

java

```java
// 步骤1：发送验证码
@PostMapping("/sendMsg")
public R<String> sendMsg(@RequestBody User user, HttpSession session) {
    String phone = user.getPhone();
    if (StringUtils.isNotEmpty(phone)) {
        // 生成4位随机验证码（基于Math.random()）
        String code = ValidateCodeUtils.generateValidateCode(4).toString();
        log.info("验证码：{}", code);
        
        // 存入Session：key=手机号（避免多用户验证码覆盖）
        session.setAttribute(phone, code); 
        return R.success("验证码发送成功");
    }
    return R.error("验证码发送失败");
}

// 步骤2：登录校验
@PostMapping("/login")
public R<User> login(@RequestBody Map<String, String> map, HttpSession session) {
    String phone = map.get("phone");
    String code = map.get("code");
    String sessionCode = (String) session.getAttribute(phone);

    // 验证码比对（核心：Session中存储的验证码与前端输入比对）
    if (sessionCode != null && sessionCode.equals(code)) {
        // 未注册用户自动注册（提升用户体验）
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getPhone, phone);
        User user = userService.getOne(queryWrapper);
        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setStatus(1); // 默认正常状态
            userService.save(user);
        }
        
        // 存储登录状态：Session中存入用户ID（移动端无Cookie，依赖Session标识）
        session.setAttribute("user", user.getId());
        // 存入ThreadLocal：供后续业务获取当前用户（如购物车、下单）
        BaseContext.setCurrentId(user.getId());
        return R.success(user);
    }
    return R.error("登录失败");
}
```

- **Session 存储机制**：Session 数据存储在服务器内存，基于 JSESSIONID Cookie 关联用户，单体应用适用；分布式应用需改用 Redis；
- **用户隔离核心**：`BaseContext.setCurrentId(user.getId())`将用户 ID 存入 ThreadLocal，后续通过`BaseContext.getCurrentId()`获取，确保线程安全；
- **自动注册设计**：无需用户手动注册，降低使用门槛，符合移动端产品逻辑。

#### 3. 过滤器源码分析（LoginCheckFilter）

java

```java
@WebFilter(filterName = "loginCheckFilter", urlPatterns = "/*")
public class LoginCheckFilter implements Filter {
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 1. 定义白名单（无需登录即可访问）
        String[] freeUrls = {
            "/employee/login", "/employee/logout",
            "/user/sendMsg", "/user/login", // 移动端登录相关
            "/backend/**", "/front/**"    // 静态资源
        };

        // 2. 校验是否在白名单
        String requestURI = request.getRequestURI();
        boolean isFree = check(freeUrls, requestURI);
        if (isFree) {
            chain.doFilter(request, response);
            return;
        }

        // 3. 校验管理端登录状态（Session中存employee）
        if (request.getSession().getAttribute("employee") != null) {
            Long empId = (Long) request.getSession().getAttribute("employee");
            BaseContext.setCurrentId(empId);
            chain.doFilter(request, response);
            return;
        }

        // 4. 校验移动端登录状态（Session中存user）
        if (request.getSession().getAttribute("user") != null) {
            Long userId = (Long) request.getSession().getAttribute("user");
            BaseContext.setCurrentId(userId);
            chain.doFilter(request, response);
            return;
        }

        // 5. 未登录：返回NOTLOGIN，前端跳转到登录页
        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
    }

    // 路径匹配（支持Ant风格通配符：/**匹配多级目录）
    private boolean check(String[] urls, String requestURI) {
        for (String url : urls) {
            if (PATH_MATCHER.match(url, requestURI)) {
                return true;
            }
        }
        return false;
    }
}
```

- **过滤器执行时机**：在 Controller 之前拦截请求，统一处理登录校验，避免每个接口重复写校验逻辑；
- **路径匹配工具**：AntPathMatcher 是 Spring 提供的路径匹配工具，支持`/**`（多级目录）、`*`（单级目录），适配静态资源和接口路径；
- **登录状态传递**：通过`BaseContext.setCurrentId`将用户 ID 存入 ThreadLocal，后续业务层可直接获取，无需每层传递参数。

## 三、Day06 核心模块源码深度分析

### 模块 1：用户地址簿（单表操作 + 默认地址唯一）

#### 1. 核心逻辑源码分析（AddressBookController.setDefault）

java

```java
@PutMapping("default")
public R<AddressBook> setDefault(@RequestBody AddressBook addressBook) {
    // 步骤1：将当前用户所有地址设为非默认（is_default=0）
    LambdaUpdateWrapper<AddressBook> wrapper = new LambdaUpdateWrapper<>();
    wrapper.eq(AddressBook::getUserId, BaseContext.getCurrentId())
           .set(AddressBook::getIsDefault, 0);
    addressBookService.update(wrapper); // 执行UPDATE address_book SET is_default=0 WHERE user_id=?
    
    // 步骤2：将当前地址设为默认（is_default=1）
    addressBook.setIsDefault(1);
    addressBookService.updateById(addressBook); // 执行UPDATE address_book SET is_default=1 WHERE id=?
    
    return R.success(addressBook);
}
```

- **默认地址唯一性保障**：先重置所有地址，再设置当前地址，两步更新确保同一用户仅一个默认地址；
- **SQL 执行逻辑**：执行两条 UPDATE 语句，均关联`user_id`，避免跨用户操作；
- **避坑点**：若省略步骤 1，直接设置当前地址为默认，会导致多个默认地址（源码中必须保留两步更新）。

#### 2. ThreadLocal 工具类源码分析（BaseContext）

java

```java
public class BaseContext {
    // ThreadLocal：线程局部变量，每个线程独立存储，线程安全
    private static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    // 设置当前线程的用户ID
    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    // 获取当前线程的用户ID
    public static Long getCurrentId() {
        return threadLocal.get();
    }

    // 移除当前线程的用户ID（避免内存泄漏）
    public static void removeCurrentId() {
        threadLocal.remove();
    }
}
```

- **底层原理**：ThreadLocal 内部维护一个 Map，key 是当前线程，value 是存储的用户 ID，线程隔离；
- **用户隔离实现**：每个请求对应一个线程，过滤器中设置用户 ID，业务层获取，确保多用户并发时数据不混淆；
- **内存泄漏风险**：使用后需调用`remove()`，否则线程池场景下线程复用会导致用户 ID 残留（源码中过滤器未实现，需补充）。

### 模块 2：菜品 / 套餐展示优化（DTO + 多表关联）

#### 1. 菜品展示源码深入分析（DishController.list）

java

```java
@GetMapping("/list")
public R<List<DishDto>> list(Dish dish) {
    // 步骤1：查询起售状态的菜品（status=1）
    LambdaQueryWrapper<Dish> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(dish.getCategoryId() != null, Dish::getCategoryId, dish.getCategoryId())
                .eq(Dish::getStatus, 1)
                .orderByAsc(Dish::getSort).orderByDesc(Dish::getUpdateTime);
    List<Dish> dishList = dishService.list(queryWrapper);

    // 步骤2：转换为DishDto，关联口味信息
    List<DishDto> dishDtoList = dishList.stream().map(item -> {
        DishDto dto = new DishDto();
        BeanUtils.copyProperties(item, dto); // 拷贝菜品基本信息
        
        // 步骤3：查询菜品关联的口味（多表关联）
        LambdaQueryWrapper<DishFlavor> flavorWrapper = new LambdaQueryWrapper<>();
        flavorWrapper.eq(DishFlavor::getDishId, item.getId());
        List<DishFlavor> flavors = dishFlavorService.list(flavorWrapper);
        dto.setFlavors(flavors); // 给DTO设置口味列表
        
        return dto;
    }).collect(Collectors.toList());

    return R.success(dishDtoList);
}
```

- **DTO 转换逻辑**：BeanUtils.copyProperties 是 Spring 提供的属性拷贝工具，避免手动 setter；
- **多表关联底层**：通过`dish_id`关联 dish 和 dish_flavor 表，本质执行`SELECT * FROM dish_flavor WHERE dish_id=?`；
- **性能优化点**：循环查询口味会导致 N+1 问题（1 次查菜品，N 次查口味），可优化为批量查询（根据所有菜品 ID 查口味，再分组）。

### 模块 3：购物车（状态管理 + 数量累加）

#### 1. 核心逻辑源码分析（ShoppingCartController.add）

java

```java
@PostMapping("/add")
public R<ShoppingCart> add(@RequestBody ShoppingCart shoppingCart) {
    Long userId = BaseContext.getCurrentId();
    shoppingCart.setUserId(userId); // 关联当前用户

    // 步骤1：判断是菜品还是套餐（dish_id和setmeal_id互斥）
    Long dishId = shoppingCart.getDishId();
    LambdaQueryWrapper<ShoppingCart> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(ShoppingCart::getUserId, userId);
    if (dishId != null) {
        queryWrapper.eq(ShoppingCart::getDishId, dishId);
    } else {
        queryWrapper.eq(ShoppingCart::getSetmealId, shoppingCart.getSetmealId());
    }

    // 步骤2：查询是否已存在（核心：避免重复新增）
    ShoppingCart existingCart = shoppingCartService.getOne(queryWrapper);
    if (existingCart != null) {
        // 已存在：数量+1
        existingCart.setNumber(existingCart.getNumber() + 1);
        shoppingCartService.updateById(existingCart);
    } else {
        // 不存在：新增（数量默认1）
        shoppingCart.setNumber(1);
        shoppingCart.setCreateTime(LocalDateTime.now());
        shoppingCartService.save(shoppingCart);
        existingCart = shoppingCart;
    }

    return R.success(existingCart);
}
```

- **互斥逻辑**：菜品和套餐不能同时添加，通过`dishId != null`判断，避免数据混乱；
- **数量累加设计**：同一菜品 / 套餐重复添加时，更新数量而非新增记录，减少数据库冗余；
- **时间字段**：setCreateTime 用于排序（购物车按添加时间展示），符合用户习惯。

### 模块 4：下单功能（多表事务 + 订单流转）

#### 1. 核心源码分析（OrderServiceImpl.submit）

java

```java
@Transactional // 事务边界：覆盖整个下单流程
public void submit(Orders orders) {
    Long userId = BaseContext.getCurrentId();

    // 步骤1：校验购物车非空
    LambdaQueryWrapper<ShoppingCart> cartWrapper = new LambdaQueryWrapper<>();
    cartWrapper.eq(ShoppingCart::getUserId, userId);
    List<ShoppingCart> cartList = shoppingCartService.list(cartWrapper);
    if (cartList == null || cartList.isEmpty()) {
        throw new CustomException("购物车为空，无法下单");
    }

    // 步骤2：校验地址有效
    User user = userService.getById(userId);
    AddressBook addressBook = addressBookService.getById(orders.getAddressBookId());
    if (addressBook == null) {
        throw new CustomException("地址信息无效，无法下单");
    }

    // 步骤3：生成全局唯一订单号（基于雪花算法）
    long orderId = IdWorker.getId();
    // 原子类：保证金额计算线程安全（多线程并发下单时金额准确）
    AtomicInteger totalAmount = new AtomicInteger(0);

    // 步骤4：组装订单明细（批量）
    List<OrderDetail> orderDetails = cartList.stream().map(cart -> {
        OrderDetail detail = new OrderDetail();
        detail.setOrderId(orderId); // 关联订单ID
        detail.setDishId(cart.getDishId());
        detail.setSetmealId(cart.getSetmealId());
        detail.setName(cart.getName());
        detail.setImage(cart.getImage());
        detail.setDishFlavor(cart.getDishFlavor());
        detail.setNumber(cart.getNumber());
        detail.setAmount(cart.getAmount());
        // 累加总金额：amount * number
        totalAmount.addAndGet(cart.getAmount().multiply(new BigDecimal(cart.getNumber())).intValue());
        return detail;
    }).collect(Collectors.toList());

    // 步骤5：组装订单主表
    orders.setId(orderId);
    orders.setNumber(String.valueOf(orderId)); // 订单号=订单ID
    orders.setOrderTime(LocalDateTime.now());
    orders.setCheckoutTime(LocalDateTime.now());
    orders.setStatus(2); // 状态：2=待派送（业务定义）
    orders.setAmount(new BigDecimal(totalAmount.get())); // 总金额
    orders.setUserId(userId);
    orders.setUserName(user.getName());
    orders.setConsignee(addressBook.getConsignee());
    orders.setPhone(addressBook.getPhone());
    // 拼接完整地址：省+市+区+详细地址
    orders.setAddress(addressBook.getProvinceName() + addressBook.getCityName() 
                     + addressBook.getDistrictName() + addressBook.getDetail());

    // 步骤6：批量保存订单主表和明细表（事务保证原子性）
    this.save(orders);
    orderDetailService.saveBatch(orderDetails);

    // 步骤7：清空购物车（订单保存成功后执行）
    shoppingCartService.remove(cartWrapper);
}
```

- **事务核心**：`@Transactional`保证步骤 6 和步骤 7 要么同时成功，要么同时失败；若订单保存失败，购物车不会清空；
- **订单号生成**：IdWorker 基于雪花算法，生成 64 位全局唯一 ID，包含时间戳、机器 ID、序列号，避免重复；
- **并发安全**：AtomicInteger 是原子类，`addAndGet`是原子操作，避免多线程并发时总金额计算错误；
- **数据流转**：购物车→订单主表（orders）+ 订单明细表（order_detail）→清空购物车，完成 “加购→下单” 闭环。

## 四、核心源码避坑点深度解析

| 坑点描述               | 源码位置                          | 底层原因                                                     | 解决方案                                                     |
| ---------------------- | --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 套餐删除时外键约束报错 | SetmealServiceImpl.removeWithDish | 先删主表（setmeal），从表（setmeal_dish）有外键关联，数据库拒绝删除 | 调整顺序：先删从表（setmeal_dish），再删主表（setmeal）      |
| 验证码被多用户覆盖     | UserController.sendMsg            | Session 键用固定值（如 "code"），多用户同时获取验证码时覆盖  | Session 键用手机号（`session.setAttribute(phone, code)`）    |
| 菜品口味未返回         | DishController.list               | 返回 Dish 而非 DishDto，未关联 dish_flavor 表                | 改为返回 DishDto，查询并设置 flavors 字段                    |
| 购物车跨用户访问       | ShoppingCartController.add        | 未关联 user_id，查询时未加用户条件                           | 所有购物车操作均添加`eq(ShoppingCart::getUserId, userId)`    |
| 下单后购物车未清空     | OrderServiceImpl.submit           | 清空购物车逻辑在订单保存前执行，订单保存失败但购物车已清空   | 调整顺序：先保存订单和明细，再清空购物车                     |
| 事务未生效             | 所有多表操作 Service 方法         | 1. 未加 @Transactional；2. 自调用（this. 方法）绕过 AOP 代理 | 1. 加 @Transactional；2. 通过代理对象调用（如 AopContext.currentProxy ()） |
| ThreadLocal 内存泄漏   | BaseContext                       | 线程池场景下线程复用，未移除 ThreadLocal 中的用户 ID         | 在过滤器 finally 中调用`BaseContext.removeCurrentId()`       |
| 菜品展示 N+1 问题      | DishController.list               | 循环查询每个菜品的口味，数据库交互次数多                     | 批量查询：先查所有菜品 ID，再查所有口味，最后按菜品 ID 分组  |

## 五、核心设计思想与复用原则

### 1. 源码复用技巧

- **单表 CRUD 复用**：基于 MyBatis-Plus BaseMapper，无需写 XML，直接调用 save、list、remove 等方法；
- **通用组件复用**：R.java（统一返回）、GlobalExceptionHandler（全局异常）、BaseContext（用户隔离）全局复用；
- **业务逻辑复用**：多表操作的事务控制、DTO 转换、数据校验逻辑可抽象为通用模板。

### 2. 核心设计思想

- **分层架构**：Controller（请求响应）→Service（逻辑事务）→Mapper（数据访问），职责分离，便于维护；
- **面向接口编程**：Service 层定义接口，Impl 实现，依赖注入时面向接口，便于替换实现；
- **DTO 模式**：解耦前后端数据格式，实体类映射数据库，DTO 适配交互，避免实体类冗余；
- **并发安全**：使用 ThreadLocal、AtomicInteger、事务等保证多线程场景下的数据安全。

### 3. 生产环境优化建议

- **Session 替换**：分布式环境下用 Redis 替代 Session 存储登录状态、验证码；
- **缓存优化**：菜品、套餐、分类等静态数据缓存到 Redis，减少数据库查询；
- **异步处理**：短信发送、订单通知等非核心逻辑用线程池异步执行，提升响应速度；
- **数据库优化**：多表关联查询添加索引（如 setmeal_dish.setmeal_id），批量操作替代循环单条操作。

## 六、总结

Day05-06 覆盖了瑞吉外卖的核心业务流程，源码设计体现了分层架构、复用原则、并发安全等核心思想。关键亮点：

1. 多表操作的事务控制（套餐管理、下单）；
2. DTO 模式解决前后端数据不匹配；
3. ThreadLocal 实现用户隔离；
4. 第三方服务的封装（短信发送）；
5. 移动端登录的 Session 状态管理。

深入理解源码的底层逻辑（如事务传播、ThreadLocal 原理、MyBatis-Plus 操作），能帮助我们在实际开发中规避坑点，提升代码质量和复用性。



# 瑞吉外卖 Day05-06 深度笔记（源码分析 + 底层逻辑 + 避坑指南）

## 一、核心架构与源码设计思想

### 1. 整体架构分层（源码目录对应）

plaintext

```plaintext
com.itheima.reggie
├── controller：接口层（接收请求、返回响应）→ 如SetmealController、UserController
├── service：业务层（核心逻辑、事务控制）→ 如SetmealServiceImpl、OrderServiceImpl
├── mapper：持久层（数据库操作）→ 基于MyBatis-Plus BaseMapper
├── entity：实体类（映射数据库表）→ 如Setmeal、ShoppingCart
├── dto：数据传输对象（适配前后端数据格式）→ 如SetmealDto、DishDto
├── common：通用组件（统一返回、全局异常、ThreadLocal工具）→ R.java、BaseContext.java
└── utils：工具类（短信、验证码、ID生成）→ SMSUtils、IdWorker
```

### 2. 核心设计思想

- **分层解耦**：Controller 接收请求，Service 处理逻辑，Mapper 操作数据库，职责单一；
- **DTO 模式**：解决前后端数据格式不匹配（如 SetmealDto 扩展菜品列表、分类名称）；
- **事务一致性**：多表操作（如套餐新增、下单）必加`@Transactional`；
- **用户隔离**：通过`BaseContext`（ThreadLocal）存储当前用户 ID，所有操作关联用户；
- **复用优先**：单表 CRUD 复用 MyBatis-Plus BaseMapper，通用组件（R、GlobalExceptionHandler）全局复用。

## 二、Day05 核心模块源码深度分析

### 模块 1：套餐管理（多表操作 + 事务控制）

#### 1. 核心实体与 DTO 源码分析

java

运行

```java
// Setmeal.java（实体类：映射setmeal表）
@Data
public class Setmeal extends BaseEntity {
    private String name;          // 套餐名称（唯一索引）
    private Long categoryId;     // 关联套餐分类
    private BigDecimal price;    // 套餐价格
    private String code;         // 套餐编码
    private String image;        // 套餐图片
    private String description;  // 描述
    private Integer status;      // 状态（1起售/0停售）
}

// SetmealDto.java（DTO：适配前端请求/响应）
@Data
public class SetmealDto extends Setmeal {
    private List<SetmealDish> setmealDishes; // 前端传递的关联菜品列表（实体类无此字段）
    private String categoryName;            // 响应给前端的分类名称（实体类无此字段）
}
```

- **DTO 设计思想**：实体类严格映射数据库表，DTO 扩展前后端交互所需字段，避免实体类冗余；
- **数据流转**：前端→Controller（接收 SetmealDto）→Service（拆分 Setmeal 和 SetmealDish）→Mapper（分别插入两表）。

#### 2. 新增套餐源码深入分析（SetmealServiceImpl.saveWithDish）

java

运行

```java
@Transactional // 事务隔离级别默认DEFAULT，传播行为REQUIRED
public void saveWithDish(SetmealDto setmealDto) {
    // 1. 保存套餐基本信息（操作setmeal表）
    this.save(setmealDto); // 复用MyBatis-Plus BaseMapper的save方法
    Long setmealId = setmealDto.getId(); // 新增后自动回显ID（MyBatis-Plus特性）
    
    // 2. 处理套餐-菜品关联数据（操作setmeal_dish表）
    List<SetmealDish> setmealDishes = setmealDto.getSetmealDishes();
    // 给每个关联菜品设置套餐ID（关键：建立两表关联）
    setmealDishes.stream().forEach(dish -> dish.setSetmealId(setmealId));
    
    // 3. 批量保存关联数据（批量操作提升性能）
    setmealDishService.saveBatch(setmealDishes); 
}
```

- **事务底层**：`@Transactional`基于 Spring AOP 实现，默认捕获 RuntimeException 回滚；
- **性能优化**：`saveBatch`底层执行批量 INSERT SQL（而非循环单条插入），减少数据库交互次数；
- **关键依赖**：SetmealDish 的 setmealId 必须与 Setmeal 的 id 一致，否则关联失败。

#### 3. 套餐删除源码深入分析（SetmealServiceImpl.removeWithDish）

java

运行

```java
@Transactional
public void removeWithDish(List<Long> ids) {
    // 步骤1：校验套餐状态（核心：售卖中套餐不允许删除）
    LambdaQueryWrapper<Setmeal> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.in(Setmeal::getId, ids)
                .eq(Setmeal::getStatus, 1); // 1=起售
    int count = this.count(queryWrapper);
    if (count > 0) {
        throw new CustomException("套餐正在售卖中，无法删除"); // 自定义异常触发事务回滚
    }

    // 步骤2：删除套餐表数据（批量删除）
    this.removeByIds(ids); // MyBatis-Plus批量删除，底层执行DELETE ... IN (ids)

    // 步骤3：删除关联菜品表数据
    LambdaQueryWrapper<SetmealDish> dishWrapper = new LambdaQueryWrapper<>();
    dishWrapper.in(SetmealDish::getSetmealId, ids);
    setmealDishService.remove(dishWrapper);
}
```

- **异常机制**：CustomException 是 RuntimeException 子类，抛出后事务回滚；
- **校验逻辑**：先校验状态再删除，避免删除已售套餐导致订单数据关联失效；
- **SQL 执行顺序**：先删主表（setmeal）还是从表（setmeal_dish）？→ 此处先删主表，但实际应先删从表（避免外键约束报错），源码需优化（避坑点）。

### 模块 2：手机验证码登录（第三方服务 + Session+ThreadLocal）

#### 1. 核心工具类源码分析（SMSUtils）

java

运行

```java
public class SMSUtils {
    public static void sendMessage(String signName, String templateCode, String phone, String code) {
        // 1. 初始化阿里云SDK客户端
        DefaultProfile profile = DefaultProfile.getProfile(
            "cn-hangzhou", // 地域
            "AccessKeyId", // 子用户AccessKey（仅授权短信服务）
            "AccessKeySecret"
        );
        IAcsClient client = new DefaultAcsClient(profile);

        // 2. 构建短信请求参数
        SendSmsRequest request = new SendSmsRequest();
        request.setPhoneNumbers(phone); // 接收手机号
        request.setSignName(signName); // 审核通过的签名
        request.setTemplateCode(templateCode); // 审核通过的模板ID
        request.setTemplateParam("{\"code\":\"" + code + "\"}"); // 模板参数（JSON格式）

        try {
            client.getAcsResponse(request); // 发送请求（无返回值，异常表示失败）
        } catch (ClientException e) {
            e.printStackTrace();
        }
    }
}
```

- **第三方集成原则**：工具类封装第三方 SDK，业务层无需关注底层调用细节，仅调用工具类方法；
- **安全设计**：AccessKey 使用子用户，仅分配短信服务权限，避免主账号泄露导致全权限风险；
- **开发技巧**：个人账号无法通过签名审核时，可注释`client.getAcsResponse(request)`，用`log.info("验证码：{}", code)`模拟发送。

#### 2. 登录流程源码深度分析（UserController）

java

运行

```java
// 步骤1：发送验证码
@PostMapping("/sendMsg")
public R<String> sendMsg(@RequestBody User user, HttpSession session) {
    String phone = user.getPhone();
    if (StringUtils.isNotEmpty(phone)) {
        // 生成4位随机验证码（基于Math.random()）
        String code = ValidateCodeUtils.generateValidateCode(4).toString();
        log.info("验证码：{}", code);
        
        // 存入Session：key=手机号（避免多用户验证码覆盖）
        session.setAttribute(phone, code); 
        return R.success("验证码发送成功");
    }
    return R.error("验证码发送失败");
}

// 步骤2：登录校验
@PostMapping("/login")
public R<User> login(@RequestBody Map<String, String> map, HttpSession session) {
    String phone = map.get("phone");
    String code = map.get("code");
    String sessionCode = (String) session.getAttribute(phone);

    // 验证码比对（核心：Session中存储的验证码与前端输入比对）
    if (sessionCode != null && sessionCode.equals(code)) {
        // 未注册用户自动注册（提升用户体验）
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getPhone, phone);
        User user = userService.getOne(queryWrapper);
        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setStatus(1); // 默认正常状态
            userService.save(user);
        }
        
        // 存储登录状态：Session中存入用户ID（移动端无Cookie，依赖Session标识）
        session.setAttribute("user", user.getId());
        // 存入ThreadLocal：供后续业务获取当前用户（如购物车、下单）
        BaseContext.setCurrentId(user.getId());
        return R.success(user);
    }
    return R.error("登录失败");
}
```

- **Session 存储机制**：Session 数据存储在服务器内存，基于 JSESSIONID Cookie 关联用户，单体应用适用；分布式应用需改用 Redis；
- **用户隔离核心**：`BaseContext.setCurrentId(user.getId())`将用户 ID 存入 ThreadLocal，后续通过`BaseContext.getCurrentId()`获取，确保线程安全；
- **自动注册设计**：无需用户手动注册，降低使用门槛，符合移动端产品逻辑。

#### 3. 过滤器源码分析（LoginCheckFilter）

java

```java
@WebFilter(filterName = "loginCheckFilter", urlPatterns = "/*")
public class LoginCheckFilter implements Filter {
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 1. 定义白名单（无需登录即可访问）
        String[] freeUrls = {
            "/employee/login", "/employee/logout",
            "/user/sendMsg", "/user/login", // 移动端登录相关
            "/backend/**", "/front/**"    // 静态资源
        };

        // 2. 校验是否在白名单
        String requestURI = request.getRequestURI();
        boolean isFree = check(freeUrls, requestURI);
        if (isFree) {
            chain.doFilter(request, response);
            return;
        }

        // 3. 校验管理端登录状态（Session中存employee）
        if (request.getSession().getAttribute("employee") != null) {
            Long empId = (Long) request.getSession().getAttribute("employee");
            BaseContext.setCurrentId(empId);
            chain.doFilter(request, response);
            return;
        }

        // 4. 校验移动端登录状态（Session中存user）
        if (request.getSession().getAttribute("user") != null) {
            Long userId = (Long) request.getSession().getAttribute("user");
            BaseContext.setCurrentId(userId);
            chain.doFilter(request, response);
            return;
        }

        // 5. 未登录：返回NOTLOGIN，前端跳转到登录页
        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
    }

    // 路径匹配（支持Ant风格通配符：/**匹配多级目录）
    private boolean check(String[] urls, String requestURI) {
        for (String url : urls) {
            if (PATH_MATCHER.match(url, requestURI)) {
                return true;
            }
        }
        return false;
    }
}
```

- **过滤器执行时机**：在 Controller 之前拦截请求，统一处理登录校验，避免每个接口重复写校验逻辑；
- **路径匹配工具**：AntPathMatcher 是 Spring 提供的路径匹配工具，支持`/**`（多级目录）、`*`（单级目录），适配静态资源和接口路径；
- **登录状态传递**：通过`BaseContext.setCurrentId`将用户 ID 存入 ThreadLocal，后续业务层可直接获取，无需每层传递参数。

## 三、Day06 核心模块源码深度分析

### 模块 1：用户地址簿（单表操作 + 默认地址唯一）

#### 1. 核心逻辑源码分析（AddressBookController.setDefault）

java

```java
@PutMapping("default")
public R<AddressBook> setDefault(@RequestBody AddressBook addressBook) {
    // 步骤1：将当前用户所有地址设为非默认（is_default=0）
    LambdaUpdateWrapper<AddressBook> wrapper = new LambdaUpdateWrapper<>();
    wrapper.eq(AddressBook::getUserId, BaseContext.getCurrentId())
           .set(AddressBook::getIsDefault, 0);
    addressBookService.update(wrapper); // 执行UPDATE address_book SET is_default=0 WHERE user_id=?
    
    // 步骤2：将当前地址设为默认（is_default=1）
    addressBook.setIsDefault(1);
    addressBookService.updateById(addressBook); // 执行UPDATE address_book SET is_default=1 WHERE id=?
    
    return R.success(addressBook);
}
```

- **默认地址唯一性保障**：先重置所有地址，再设置当前地址，两步更新确保同一用户仅一个默认地址；
- **SQL 执行逻辑**：执行两条 UPDATE 语句，均关联`user_id`，避免跨用户操作；
- **避坑点**：若省略步骤 1，直接设置当前地址为默认，会导致多个默认地址（源码中必须保留两步更新）。

#### 2. ThreadLocal 工具类源码分析（BaseContext）

java

```java
public class BaseContext {
    // ThreadLocal：线程局部变量，每个线程独立存储，线程安全
    private static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    // 设置当前线程的用户ID
    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    // 获取当前线程的用户ID
    public static Long getCurrentId() {
        return threadLocal.get();
    }

    // 移除当前线程的用户ID（避免内存泄漏）
    public static void removeCurrentId() {
        threadLocal.remove();
    }
}
```

- **底层原理**：ThreadLocal 内部维护一个 Map，key 是当前线程，value 是存储的用户 ID，线程隔离；
- **用户隔离实现**：每个请求对应一个线程，过滤器中设置用户 ID，业务层获取，确保多用户并发时数据不混淆；
- **内存泄漏风险**：使用后需调用`remove()`，否则线程池场景下线程复用会导致用户 ID 残留（源码中过滤器未实现，需补充）。

### 模块 2：菜品 / 套餐展示优化（DTO + 多表关联）

#### 1. 菜品展示源码深入分析（DishController.list）

java

```java
@GetMapping("/list")
public R<List<DishDto>> list(Dish dish) {
    // 步骤1：查询起售状态的菜品（status=1）
    LambdaQueryWrapper<Dish> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(dish.getCategoryId() != null, Dish::getCategoryId, dish.getCategoryId())
                .eq(Dish::getStatus, 1)
                .orderByAsc(Dish::getSort).orderByDesc(Dish::getUpdateTime);
    List<Dish> dishList = dishService.list(queryWrapper);

    // 步骤2：转换为DishDto，关联口味信息
    List<DishDto> dishDtoList = dishList.stream().map(item -> {
        DishDto dto = new DishDto();
        BeanUtils.copyProperties(item, dto); // 拷贝菜品基本信息
        
        // 步骤3：查询菜品关联的口味（多表关联）
        LambdaQueryWrapper<DishFlavor> flavorWrapper = new LambdaQueryWrapper<>();
        flavorWrapper.eq(DishFlavor::getDishId, item.getId());
        List<DishFlavor> flavors = dishFlavorService.list(flavorWrapper);
        dto.setFlavors(flavors); // 给DTO设置口味列表
        
        return dto;
    }).collect(Collectors.toList());

    return R.success(dishDtoList);
}
```

- **DTO 转换逻辑**：BeanUtils.copyProperties 是 Spring 提供的属性拷贝工具，避免手动 setter；
- **多表关联底层**：通过`dish_id`关联 dish 和 dish_flavor 表，本质执行`SELECT * FROM dish_flavor WHERE dish_id=?`；
- **性能优化点**：循环查询口味会导致 N+1 问题（1 次查菜品，N 次查口味），可优化为批量查询（根据所有菜品 ID 查口味，再分组）。

### 模块 3：购物车（状态管理 + 数量累加）

#### 1. 核心逻辑源码分析（ShoppingCartController.add）

java

```java
@PostMapping("/add")
public R<ShoppingCart> add(@RequestBody ShoppingCart shoppingCart) {
    Long userId = BaseContext.getCurrentId();
    shoppingCart.setUserId(userId); // 关联当前用户

    // 步骤1：判断是菜品还是套餐（dish_id和setmeal_id互斥）
    Long dishId = shoppingCart.getDishId();
    LambdaQueryWrapper<ShoppingCart> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(ShoppingCart::getUserId, userId);
    if (dishId != null) {
        queryWrapper.eq(ShoppingCart::getDishId, dishId);
    } else {
        queryWrapper.eq(ShoppingCart::getSetmealId, shoppingCart.getSetmealId());
    }

    // 步骤2：查询是否已存在（核心：避免重复新增）
    ShoppingCart existingCart = shoppingCartService.getOne(queryWrapper);
    if (existingCart != null) {
        // 已存在：数量+1
        existingCart.setNumber(existingCart.getNumber() + 1);
        shoppingCartService.updateById(existingCart);
    } else {
        // 不存在：新增（数量默认1）
        shoppingCart.setNumber(1);
        shoppingCart.setCreateTime(LocalDateTime.now());
        shoppingCartService.save(shoppingCart);
        existingCart = shoppingCart;
    }

    return R.success(existingCart);
}
```

- **互斥逻辑**：菜品和套餐不能同时添加，通过`dishId != null`判断，避免数据混乱；
- **数量累加设计**：同一菜品 / 套餐重复添加时，更新数量而非新增记录，减少数据库冗余；
- **时间字段**：setCreateTime 用于排序（购物车按添加时间展示），符合用户习惯。

### 模块 4：下单功能（多表事务 + 订单流转）

#### 1. 核心源码分析（OrderServiceImpl.submit）

java



运行



```java
@Transactional // 事务边界：覆盖整个下单流程
public void submit(Orders orders) {
    Long userId = BaseContext.getCurrentId();

    // 步骤1：校验购物车非空
    LambdaQueryWrapper<ShoppingCart> cartWrapper = new LambdaQueryWrapper<>();
    cartWrapper.eq(ShoppingCart::getUserId, userId);
    List<ShoppingCart> cartList = shoppingCartService.list(cartWrapper);
    if (cartList == null || cartList.isEmpty()) {
        throw new CustomException("购物车为空，无法下单");
    }

    // 步骤2：校验地址有效
    User user = userService.getById(userId);
    AddressBook addressBook = addressBookService.getById(orders.getAddressBookId());
    if (addressBook == null) {
        throw new CustomException("地址信息无效，无法下单");
    }

    // 步骤3：生成全局唯一订单号（基于雪花算法）
    long orderId = IdWorker.getId();
    // 原子类：保证金额计算线程安全（多线程并发下单时金额准确）
    AtomicInteger totalAmount = new AtomicInteger(0);

    // 步骤4：组装订单明细（批量）
    List<OrderDetail> orderDetails = cartList.stream().map(cart -> {
        OrderDetail detail = new OrderDetail();
        detail.setOrderId(orderId); // 关联订单ID
        detail.setDishId(cart.getDishId());
        detail.setSetmealId(cart.getSetmealId());
        detail.setName(cart.getName());
        detail.setImage(cart.getImage());
        detail.setDishFlavor(cart.getDishFlavor());
        detail.setNumber(cart.getNumber());
        detail.setAmount(cart.getAmount());
        // 累加总金额：amount * number
        totalAmount.addAndGet(cart.getAmount().multiply(new BigDecimal(cart.getNumber())).intValue());
        return detail;
    }).collect(Collectors.toList());

    // 步骤5：组装订单主表
    orders.setId(orderId);
    orders.setNumber(String.valueOf(orderId)); // 订单号=订单ID
    orders.setOrderTime(LocalDateTime.now());
    orders.setCheckoutTime(LocalDateTime.now());
    orders.setStatus(2); // 状态：2=待派送（业务定义）
    orders.setAmount(new BigDecimal(totalAmount.get())); // 总金额
    orders.setUserId(userId);
    orders.setUserName(user.getName());
    orders.setConsignee(addressBook.getConsignee());
    orders.setPhone(addressBook.getPhone());
    // 拼接完整地址：省+市+区+详细地址
    orders.setAddress(addressBook.getProvinceName() + addressBook.getCityName() 
                     + addressBook.getDistrictName() + addressBook.getDetail());

    // 步骤6：批量保存订单主表和明细表（事务保证原子性）
    this.save(orders);
    orderDetailService.saveBatch(orderDetails);

    // 步骤7：清空购物车（订单保存成功后执行）
    shoppingCartService.remove(cartWrapper);
}
```

- **事务核心**：`@Transactional`保证步骤 6 和步骤 7 要么同时成功，要么同时失败；若订单保存失败，购物车不会清空；
- **订单号生成**：IdWorker 基于雪花算法，生成 64 位全局唯一 ID，包含时间戳、机器 ID、序列号，避免重复；
- **并发安全**：AtomicInteger 是原子类，`addAndGet`是原子操作，避免多线程并发时总金额计算错误；
- **数据流转**：购物车→订单主表（orders）+ 订单明细表（order_detail）→清空购物车，完成 “加购→下单” 闭环。

## 四、核心源码避坑点深度解析

| 坑点描述               | 源码位置                          | 底层原因                                                     | 解决方案                                                     |
| ---------------------- | --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 套餐删除时外键约束报错 | SetmealServiceImpl.removeWithDish | 先删主表（setmeal），从表（setmeal_dish）有外键关联，数据库拒绝删除 | 调整顺序：先删从表（setmeal_dish），再删主表（setmeal）      |
| 验证码被多用户覆盖     | UserController.sendMsg            | Session 键用固定值（如 "code"），多用户同时获取验证码时覆盖  | Session 键用手机号（`session.setAttribute(phone, code)`）    |
| 菜品口味未返回         | DishController.list               | 返回 Dish 而非 DishDto，未关联 dish_flavor 表                | 改为返回 DishDto，查询并设置 flavors 字段                    |
| 购物车跨用户访问       | ShoppingCartController.add        | 未关联 user_id，查询时未加用户条件                           | 所有购物车操作均添加`eq(ShoppingCart::getUserId, userId)`    |
| 下单后购物车未清空     | OrderServiceImpl.submit           | 清空购物车逻辑在订单保存前执行，订单保存失败但购物车已清空   | 调整顺序：先保存订单和明细，再清空购物车                     |
| 事务未生效             | 所有多表操作 Service 方法         | 1. 未加 @Transactional；2. 自调用（this. 方法）绕过 AOP 代理 | 1. 加 @Transactional；2. 通过代理对象调用（如 AopContext.currentProxy ()） |
| ThreadLocal 内存泄漏   | BaseContext                       | 线程池场景下线程复用，未移除 ThreadLocal 中的用户 ID         | 在过滤器 finally 中调用`BaseContext.removeCurrentId()`       |
| 菜品展示 N+1 问题      | DishController.list               | 循环查询每个菜品的口味，数据库交互次数多                     | 批量查询：先查所有菜品 ID，再查所有口味，最后按菜品 ID 分组  |

## 五、核心设计思想与复用原则

### 1. 源码复用技巧

- **单表 CRUD 复用**：基于 MyBatis-Plus BaseMapper，无需写 XML，直接调用 save、list、remove 等方法；
- **通用组件复用**：R.java（统一返回）、GlobalExceptionHandler（全局异常）、BaseContext（用户隔离）全局复用；
- **业务逻辑复用**：多表操作的事务控制、DTO 转换、数据校验逻辑可抽象为通用模板。

### 2. 核心设计思想

- **分层架构**：Controller（请求响应）→Service（逻辑事务）→Mapper（数据访问），职责分离，便于维护；
- **面向接口编程**：Service 层定义接口，Impl 实现，依赖注入时面向接口，便于替换实现；
- **DTO 模式**：解耦前后端数据格式，实体类映射数据库，DTO 适配交互，避免实体类冗余；
- **并发安全**：使用 ThreadLocal、AtomicInteger、事务等保证多线程场景下的数据安全。

### 3. 生产环境优化建议

- **Session 替换**：分布式环境下用 Redis 替代 Session 存储登录状态、验证码；
- **缓存优化**：菜品、套餐、分类等静态数据缓存到 Redis，减少数据库查询；
- **异步处理**：短信发送、订单通知等非核心逻辑用线程池异步执行，提升响应速度；
- **数据库优化**：多表关联查询添加索引（如 setmeal_dish.setmeal_id），批量操作替代循环单条操作。

## 六、总结

Day05-06 覆盖了瑞吉外卖的核心业务流程，源码设计体现了分层架构、复用原则、并发安全等核心思想。关键亮点：

1. 多表操作的事务控制（套餐管理、下单）；
2. DTO 模式解决前后端数据不匹配；
3. ThreadLocal 实现用户隔离；
4. 第三方服务的封装（短信发送）；
5. 移动端登录的 Session 状态管理。

深入理解源码的底层逻辑（如事务传播、ThreadLocal 原理、MyBatis-Plus 操作），能帮助我们在实际开发中规避坑点，提升代码质量和复用性。





# 瑞吉外卖 Day05-06 核心可复用模块总结（含代码模板 + 复用场景）

## 一、通用基础组件（全项目复用）

### 1. 统一返回结果类（R.java）

#### 功能

全局统一接口响应格式，支持成功 / 失败响应、带数据 / 无数据响应、动态扩展字段。

#### 核心代码

java

```java
@Data
public class R<T> {
    private Integer code; // 1成功，0失败
    private String msg;   // 提示信息
    private T data;       // 响应数据
    private Map<String, Object> map = new HashMap<>(); // 动态扩展

    // 静态工厂方法（简化调用）
    public static <T> R<T> success(T data) {
        R<T> r = new R<>();
        r.code = 1;
        r.data = data;
        return r;
    }

    public static <T> R<T> error(String msg) {
        R<T> r = new R<>();
        r.code = 0;
        r.msg = msg;
        return r;
    }

    // 动态添加字段（链式调用）
    public R<T> add(String key, Object value) {
        this.map.put(key, value);
        return this;
    }
}
```

#### 复用场景

所有 Controller 接口的响应（如登录、新增、分页查询等），前端统一解析格式，避免混乱。

#### 避坑点

- 泛型需与返回数据类型一致（如分页查询用`R`）；
- 失败响应必须传`msg`，方便前端展示错误信息。

### 2. 全局异常处理器（GlobalExceptionHandler.java）

#### 功能

统一捕获 Controller 层异常，返回友好提示，避免直接抛出异常给前端。

#### 核心代码

java

```java
@RestControllerAdvice(annotations = {RestController.class, Controller.class})
@Slf4j
public class GlobalExceptionHandler {
    // 处理SQL唯一约束异常（如重复用户名）
    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public R<String> handleSQLUniqueException(SQLIntegrityConstraintViolationException ex) {
        log.error("SQL异常：{}", ex.getMessage());
        if (ex.getMessage().contains("Duplicate entry")) {
            String[] split = ex.getMessage().split(" ");
            return R.error(split[2] + "已存在");
        }
        return R.error("数据库操作异常");
    }

    // 处理自定义业务异常
    @ExceptionHandler(CustomException.class)
    public R<String> handleBusinessException(CustomException ex) {
        log.error("业务异常：{}", ex.getMessage());
        return R.error(ex.getMessage());
    }

    // 通用异常兜底
    @ExceptionHandler(Exception.class)
    public R<String> handleCommonException(Exception ex) {
        log.error("系统异常：{}", ex.getMessage());
        return R.error("操作失败：" + ex.getMessage());
    }
}

// 自定义业务异常（需单独创建）
public class CustomException extends RuntimeException {
    public CustomException(String message) {
        super(message);
    }
}
```

#### 复用场景

所有业务模块的异常处理（如套餐删除时的 “售卖中无法删除”、下单时的 “购物车为空”）。

#### 避坑点

- 需指定`annotations = {RestController.class, Controller.class}`，避免拦截非 Controller 层异常；
- 异常匹配优先级：具体异常（SQL 异常）> 自定义异常 > 通用异常。

### 3. ThreadLocal 用户隔离工具（BaseContext.java）

#### 功能

存储当前线程的用户 ID，实现多用户并发时的数据隔离，无需每层传递用户 ID 参数。

#### 核心代码

java

```java
public class BaseContext {
    private static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    // 设置当前用户ID
    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    // 获取当前用户ID
    public static Long getCurrentId() {
        return threadLocal.get();
    }

    // 移除用户ID（避免内存泄漏）
    public static void removeCurrentId() {
        threadLocal.remove();
    }
}
```

#### 复用场景

所有需关联用户的操作（地址簿、购物车、下单、套餐管理），通过`BaseContext.getCurrentId()`获取当前登录用户 ID。

#### 避坑点

- 必须在过滤器 / 拦截器中调用`removeCurrentId()`，避免线程池复用导致用户 ID 残留；
- 仅适用于单线程场景，异步线程需手动传递用户 ID。

## 二、第三方集成工具（跨模块复用）

### 1. 短信发送工具（SMSUtils.java）

#### 功能

封装阿里云短信服务 SDK，支持发送验证码、通知类短信。

#### 核心代码

java

```java
public class SMSUtils {
    /**
     * 发送短信验证码
     * @param signName 阿里云短信签名（需审核）
     * @param templateCode 短信模板ID（需审核）
     * @param phone 接收手机号
     * @param code 验证码内容
     */
    public static void sendMessage(String signName, String templateCode, String phone, String code) {
        DefaultProfile profile = DefaultProfile.getProfile("cn-hangzhou", "AccessKeyId", "AccessKeySecret");
        IAcsClient client = new DefaultAcsClient(profile);
        SendSmsRequest request = new SendSmsRequest();
        request.setPhoneNumbers(phone);
        request.setSignName(signName);
        request.setTemplateCode(templateCode);
        request.setTemplateParam("{\"code\":\"" + code + "\"}"); // 模板参数（JSON格式）
        try {
            client.getAcsResponse(request);
        } catch (ClientException e) {
            e.printStackTrace();
        }
    }
}
```

#### 复用场景

用户注册、登录验证码、订单通知、密码找回等需短信通知的场景。

#### 避坑点

- AccessKey 使用子用户，仅分配短信服务权限，避免主账号泄露；
- 开发时可注释真实发送逻辑，用`log.info("验证码：{}", code)`模拟，避免审核问题。

### 2. 验证码生成工具（ValidateCodeUtils.java）

#### 功能

生成指定长度的随机验证码（数字型），用于短信验证码、图形验证码。

#### 核心代码

java

```java
public class ValidateCodeUtils {
    /**
     * 生成随机验证码
     * @param length 验证码长度（4位/6位）
     * @return 验证码
     */
    public static Integer generateValidateCode(int length) {
        Integer code = null;
        if (length == 4) {
            code = (int) (Math.random() * 9000 + 1000); // 4位随机数
        } else if (length == 6) {
            code = (int) (Math.random() * 900000 + 100000); // 6位随机数
        } else {
            throw new CustomException("验证码长度只能是4位或6位");
        }
        return code;
    }
}
```

#### 复用场景

手机验证码登录、图形验证码验证、安全操作校验（如修改密码）。

## 三、业务层通用模板（业务模块复用）

### 1. 单表 CRUD 模板（适用于地址簿、购物车等单表业务）

#### 核心功能

包含新增、查询列表、查询详情、更新、删除，复用 MyBatis-Plus BaseMapper。

#### 核心代码（以 AddressBook 为例）

java

```java
// Controller层模板
@RestController
@RequestMapping("/addressBook")
public class AddressBookController {
    @Autowired
    private AddressBookService addressBookService;

    // 新增
    @PostMapping
    public R<AddressBook> save(@RequestBody AddressBook addressBook) {
        addressBook.setUserId(BaseContext.getCurrentId());
        addressBookService.save(addressBook);
        return R.success(addressBook);
    }

    // 查询列表
    @GetMapping("/list")
    public R<List<AddressBook>> list(AddressBook addressBook) {
        addressBook.setUserId(BaseContext.getCurrentId());
        LambdaQueryWrapper<AddressBook> queryWrapper = new LambdaQueryWrapper<>(addressBook);
        queryWrapper.orderByDesc(AddressBook::getUpdateTime);
        return R.success(addressBookService.list(queryWrapper));
    }

    // 查询详情
    @GetMapping("/{id}")
    public R<AddressBook> getById(@PathVariable Long id) {
        AddressBook addressBook = addressBookService.getById(id);
        return addressBook != null ? R.success(addressBook) : R.error("未查询到数据");
    }

    // 更新
    @PutMapping
    public R<String> update(@RequestBody AddressBook addressBook) {
        addressBookService.updateById(addressBook);
        return R.success("更新成功");
    }

    // 删除
    @DeleteMapping("/{id}")
    public R<String> delete(@PathVariable Long id) {
        addressBookService.removeById(id);
        return R.success("删除成功");
    }
}
```

#### 复用场景

地址簿管理、购物车管理、用户地址、基础数据字典等单表业务。

#### 避坑点

- 所有操作需关联`userId`，确保用户隔离；
- 列表查询需添加排序条件（如按更新时间），保证展示顺序合理。

### 2. 多表事务操作模板（适用于套餐新增、下单等多表业务）

#### 功能

保证多表操作原子性（要么全成功，要么全回滚），适用于 “主表 + 从表” 关联操作。

#### 核心代码（通用模板）

java

```java
@Service
public class XXXServiceImpl extends ServiceImpl<XXXMapper, XXX> implements XXXService {
    @Autowired
    private YYYService yyyService; // 从表Service

    @Transactional // 事务注解（关键）
    public void saveWithRelations(XXXDto xxxDto) {
        // 1. 保存主表数据
        this.save(xxxDto);
        Long mainId = xxxDto.getId(); // 主表ID（新增后回显）

        // 2. 处理从表数据（设置主表关联ID）
        List<YYY> yyyList = xxxDto.getYyyList();
        yyyList.stream().forEach(yyy -> yyy.setMainId(mainId));

        // 3. 批量保存从表数据
        yyyService.saveBatch(yyyList);
    }

    @Transactional
    public void removeWithRelations(List<Long> mainIds) {
        // 1. 校验主表状态（如售卖中无法删除）
        LambdaQueryWrapper<XXX> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(XXX::getId, mainIds).eq(XXX::getStatus, 1);
        if (this.count(queryWrapper) > 0) {
            throw new CustomException("状态不允许删除");
        }

        // 2. 删除从表数据（先删从表，避免外键约束）
        LambdaQueryWrapper<YYY> yyyWrapper = new LambdaQueryWrapper<>();
        yyyWrapper.in(YYY::getMainId, mainIds);
        yyyService.remove(yyyWrapper);

        // 3. 删除主表数据
        this.removeByIds(mainIds);
    }
}
```

#### 复用场景

套餐新增（setmeal + setmeal_dish）、下单功能（orders + order_detail）、组合数据删除。

#### 避坑点

- 事务注解`@Transactional`必须加在 Service 层方法上；
- 多表删除需先删从表，再删主表，避免外键约束报错。

### 3. 分页查询模板（支持模糊查询 + 关联字段）

#### 功能

通用分页查询，支持按关键字模糊查询、关联字段回显（如套餐分类名称）。

#### 核心代码

java



运行









```java
@GetMapping("/page")
public R<Page> page(int page, int pageSize, String name) {
    // 1. 分页构造器
    Page<XXX> pageInfo = new Page<>(page, pageSize);
    Page<XXXDto> dtoPage = new Page<>();

    // 2. 查询主表数据
    LambdaQueryWrapper<XXX> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.like(name != null, XXX::getName, name)
                .orderByDesc(XXX::getUpdateTime);
    xxxService.page(pageInfo, queryWrapper);

    // 3. 转换为DTO，关联查询扩展字段（如分类名称）
    BeanUtils.copyProperties(pageInfo, dtoPage, "records");
    List<XXXDto> dtoList = pageInfo.getRecords().stream().map(item -> {
        XXXDto dto = new XXXDto();
        BeanUtils.copyProperties(item, dto);
        // 关联查询扩展字段（如分类名称）
        Category category = categoryService.getById(item.getCategoryId());
        if (category != null) {
            dto.setCategoryName(category.getName());
        }
        return dto;
    }).collect(Collectors.toList());

    dtoPage.setRecords(dtoList);
    return R.success(dtoPage);
}
```

#### 复用场景

套餐分页查询、菜品分页查询、订单分页查询等需分页 + 关联字段展示的场景。

#### 避坑点

- 分页插件必须配置（MybatisPlusConfig），否则分页失效；
- 关联查询需判空，避免关联数据删除后导致空指针。

## 四、权限与状态管理（跨模块复用）

### 1. 登录校验过滤器（LoginCheckFilter.java）

#### 功能

统一拦截未登录请求，区分管理端 / 移动端登录状态，放行白名单路径。

#### 核心代码

java



运行









```java
@WebFilter(filterName = "loginCheckFilter", urlPatterns = "/*")
@Slf4j
public class LoginCheckFilter implements Filter {
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 1. 白名单配置（无需登录即可访问）
        String[] freeUrls = {
            "/employee/login", "/employee/logout",
            "/user/sendMsg", "/user/login",
            "/backend/**", "/front/**"
        };

        // 2. 校验是否在白名单
        String requestURI = request.getRequestURI();
        boolean isFree = check(freeUrls, requestURI);
        if (isFree) {
            chain.doFilter(request, response);
            return;
        }

        // 3. 校验管理端登录状态
        if (request.getSession().getAttribute("employee") != null) {
            Long empId = (Long) request.getSession().getAttribute("employee");
            BaseContext.setCurrentId(empId);
            chain.doFilter(request, response);
            return;
        }

        // 4. 校验移动端登录状态
        if (request.getSession().getAttribute("user") != null) {
            Long userId = (Long) request.getSession().getAttribute("user");
            BaseContext.setCurrentId(userId);
            chain.doFilter(request, response);
            return;
        }

        // 5. 未登录，返回NOTLOGIN
        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
    }

    // 路径匹配（支持Ant风格通配符）
    private boolean check(String[] urls, String requestURI) {
        for (String url : urls) {
            if (PATH_MATCHER.match(url, requestURI)) {
                return true;
            }
        }
        return false;
    }
}
```

#### 复用场景

全项目登录校验，管理端（员工）和移动端（用户）统一权限控制。

#### 避坑点

- 引导类需加`@ServletComponentScan`，否则过滤器不生效；
- 白名单需包含静态资源路径（`/backend/**`、`/front/**`），避免页面空白。

## 五、数据处理工具（跨模块复用）

### 1. DTO 转换工具（BeanUtils+Stream）

#### 功能

实体类与 DTO 之间的属性拷贝，支持批量转换（如 Dish→DishDto）。

#### 核心代码

java

```java
// 单个对象转换
public static DishDto convertToDto(Dish dish, List<DishFlavor> flavors) {
    DishDto dto = new DishDto();
    BeanUtils.copyProperties(dish, dto);
    dto.setFlavors(flavors);
    return dto;
}

// 批量转换（List<实体>→List<DTO>）
public static List<DishDto> convertToDtoList(List<Dish> dishList, Map<Long, List<DishFlavor>> flavorMap) {
    return dishList.stream().map(dish -> {
        DishDto dto = new DishDto();
        BeanUtils.copyProperties(dish, dto);
        dto.setFlavors(flavorMap.get(dish.getId()));
        return dto;
    }).collect(Collectors.toList());
}
```

#### 复用场景

菜品展示（Dish→DishDto）、套餐展示（Setmeal→SetmealDto）、订单展示（Order→OrderDto）。

#### 避坑点

- 拷贝时忽略复杂字段（如 List），手动设置；
- 确保实体类与 DTO 的字段名一致（支持驼峰命名）。

### 2. 金额计算工具（AtomicInteger）

#### 功能

并发场景下安全累加金额，避免金额计算错误（如下单时总金额统计）。

#### 核心代码

java

```java
// 原子类保证线程安全
AtomicInteger totalAmount = new AtomicInteger(0);
List<OrderDetail> orderDetails = cartList.stream().map(cart -> {
    OrderDetail detail = new OrderDetail();
    // 其他属性设置...
    // 累加金额：amount * number
    totalAmount.addAndGet(cart.getAmount().multiply(new BigDecimal(cart.getNumber())).intValue());
    return detail;
}).collect(Collectors.toList());
// 总金额转换为BigDecimal
BigDecimal total = new BigDecimal(totalAmount.get());
```

#### 复用场景

下单总金额计算、购物车金额统计、批量订单金额汇总。

## 六、复用原则与注意事项

1. **统一管理**：将通用组件（R、BaseContext、GlobalExceptionHandler）放在`common`包下，全项目引入；
2. **依赖注入**：复用 Service/Mapper 时通过`@Autowired`注入，避免手动`new`实例；
3. **用户隔离**：所有关联用户的操作必须通过`BaseContext.getCurrentId()`获取用户 ID，避免跨用户数据泄露；
4. **事务边界**：多表操作必须加`@Transactional`，确保数据一致性；
5. **避坑优先**：复用前先查看模块的 “避坑点”，如 ThreadLocal 需移除、分页需配置插件。

这些模块覆盖了瑞吉外卖的核心复用场景，直接复制代码模板即可快速开发新业务（如菜品管理、订单管理），大幅提升开发效率并保证代码规范。



# 瑞吉外卖 Day05-06 核心知识点 5 道中大厂面试题（含场景 + 深度解析）

## 面试题 1（多表事务 + DTO 设计）

### 场景

面试官：“瑞吉外卖的‘新增套餐’功能需同时保存套餐基本信息（setmeal 表）和套餐 - 菜品关联信息（setmeal_dish 表），且前端需传递套餐名称、分类 ID、关联菜品列表等数据。请回答以下问题：”

### 问题

1. 该功能为何必须使用事务？若不使用事务会出现什么问题？Spring 事务的默认传播行为和隔离级别是什么？
2. 为何需要设计`SetmealDto`而非直接使用`Setmeal`实体类接收参数？DTO 的核心设计思想是什么？
3. 保存关联数据时，若先删主表（setmeal）再删从表（setmeal_dish）会出现什么问题？如何解决？

------

## 面试题 2（ThreadLocal + 用户隔离）

### 场景

面试官：“瑞吉外卖通过`BaseContext`（ThreadLocal）存储当前登录用户 ID，实现地址簿、购物车、下单等功能的用户隔离。请结合源码回答：”

### 问题

1. ThreadLocal 的底层实现原理是什么？如何保证多用户并发时的数据隔离？
2. 使用 ThreadLocal 可能出现什么内存泄漏风险？如何避免？在瑞吉外卖的过滤器中需要补充什么代码？
3. 若项目从单体架构升级为分布式架构（多服务部署），ThreadLocal 会失效，如何解决用户 ID 的传递问题？

------

## 面试题 3（过滤器 + 权限控制）

### 场景

面试官：“瑞吉外卖的`LoginCheckFilter`需拦截未登录请求，区分管理端（employee）和移动端（user）登录状态，放行白名单路径。请回答：”

### 问题

1. 过滤器的执行流程是什么？与 SpringMVC 的拦截器（Interceptor）有何核心区别？（从执行时机、依赖容器、功能范围说明）
2. 白名单配置中为何要包含`/backend/**`和`/front/**`？若遗漏会出现什么问题？`AntPathMatcher`的作用是什么？
3. 如何优化该过滤器，支持更细粒度的权限控制（如管理端不同角色只能访问指定接口）？

------

## 面试题 4（第三方集成 + 性能优化）

### 场景

面试官：“瑞吉外卖的‘手机验证码登录’功能封装了阿里云短信服务，生成 4 位验证码并通过 Session 存储。请回答：”

### 问题

1. 短信发送工具类`SMSUtils`的设计遵循什么原则？为何要使用子用户 AccessKey 而非主账号？
2. 开发环境中无法通过阿里云短信签名审核时，如何模拟验证码发送功能？生产环境中如何保证验证码的安全性（防止恶意刷取）？
3. 若并发场景下多个用户同时获取验证码，如何避免 Session 中验证码被覆盖？该问题在分布式架构中如何解决？

------

## 面试题 5（分页查询 + N+1 问题优化）

### 场景

面试官：“瑞吉外卖的‘菜品展示’功能需分页查询菜品列表，并关联查询菜品口味（dish_flavor 表），最终返回包含口味信息的 DishDto。请回答：”

### 问题

1. MyBatis-Plus 的分页插件（PaginationInnerInterceptor）底层原理是什么？若分页查询返回所有数据（分页失效），可能的原因有哪些？
2. 原代码中循环查询每个菜品的口味会导致 “N+1 问题”（1 次查菜品 + N 次查口味），如何优化？请写出核心优化代码。
3. 为何要将查询结果转换为 DishDto 而非直接返回 Dish 实体类？DTO 在前后端交互中的核心价值是什么？

------

# 参考答案

## 面试题 1 参考答案

### 1. 事务的必要性 + 默认属性

- 必须使用事务的原因：“新增套餐” 是多表原子操作，需保证 “套餐保存” 和 “关联关系保存” 要么同时成功，要么同时失败。若不使用事务，可能出现 “套餐保存成功但关联菜品未保存”（数据不完整）或 “关联菜品保存成功但套餐保存失败”（数据冗余）的问题。
- Spring 事务默认属性：
  - 传播行为：`PROPAGATION_REQUIRED`（若当前无事务则创建，有则加入）；
  - 隔离级别：`ISOLATION_DEFAULT`（继承数据库默认隔离级别，MySQL 默认`REPEATABLE READ`）。

### 2. SetmealDto 的设计原因 + DTO 核心思想

- 不用 Setmeal 实体类的原因：Setmeal 仅映射 setmeal 表字段（如 name、categoryId），无法接收前端传递的 “关联菜品列表”（setmealDishes）；同时前端展示需套餐分类名称（categoryName），实体类无此字段，需通过 DTO 扩展。
- DTO 核心设计思想：“数据传输专用”，解耦前后端数据格式与数据库实体映射，避免实体类冗余（如扩展前端所需字段）或暴露数据库字段（如隐藏主键生成规则），简化数据流转。

### 3. 主从表删除顺序问题 + 解决方案

- 问题：先删主表（setmeal）再删从表（setmeal_dish）会触发外键约束报错（从表记录关联主表主键，数据库禁止删除被引用的主表记录）。
- 解决方案：调整删除顺序，先删从表（根据套餐 ID 删除关联菜品记录），再删主表，确保外键无引用后再删除主表数据。

## 面试题 2 参考答案

### 1. ThreadLocal 底层原理 + 数据隔离

- 底层原理：ThreadLocal 内部维护`ThreadLocalMap`，key 是 ThreadLocal 实例本身，value 是存储的用户 ID；每个线程独立持有自己的`ThreadLocalMap`，线程之间互不干扰。
- 数据隔离保证：线程启动时创建独立的`ThreadLocalMap`，存储的用户 ID 仅当前线程可见，多用户并发时，不同线程的`ThreadLocalMap`相互隔离，不会出现数据混淆。

### 2. 内存泄漏风险 + 避免方案

- 内存泄漏原因：ThreadLocalMap 的 key 是弱引用（WeakReference），但 value 是强引用；若线程池复用线程且未手动移除 value，value 会一直被线程引用，导致内存泄漏。

- 避免方案：在过滤器 / 拦截器的`finally`块中调用`BaseContext.removeCurrentId()`，手动移除 ThreadLocal 中的 value；

- 瑞吉外卖过滤器需补充代码：

  java

  

  运行

  ```java
  finally {
      BaseContext.removeCurrentId(); // 避免线程池复用导致内存泄漏
  }
  ```

### 3. 分布式架构下 ThreadLocal 失效解决方案

- 失效原因：分布式架构中，用户请求可能路由到不同服务实例，ThreadLocal 仅作用于当前线程，无法跨服务共享。
- 解决方案：
  1. 用 Redis 存储用户登录状态，key 为全局唯一令牌（如 JWT），value 为用户 ID；
  2. 前端请求头携带令牌，服务端通过拦截器解析令牌，从 Redis 获取用户 ID 后存入 ThreadLocal；
  3. 核心：将 “线程级共享” 升级为 “分布式共享”，依赖 Redis 等中间件实现跨服务数据传递。

## 面试题 3 参考答案

### 1. 过滤器执行流程 + 与拦截器的区别

- 过滤器执行流程：`init()`（初始化）→ `doFilter()`（拦截请求：校验白名单→登录状态→放行 / 拦截）→ `destroy()`（销毁）；执行时机在请求进入 Servlet 容器后、SpringMVCDispatcherServlet 之前。

- 与拦截器（Interceptor）的核心区别：

  | 对比维度 | 过滤器（Filter）                       | 拦截器（Interceptor）                 |
  | -------- | -------------------------------------- | ------------------------------------- |
  | 依赖容器 | 依赖 Servlet 容器（Tomcat）            | 依赖 Spring 容器                      |
  | 执行时机 | 请求进入 Spring 容器前                 | 请求进入 Spring 容器后、Controller 前 |
  | 功能范围 | 仅拦截 HTTP 请求                       | 可拦截请求、响应、异常、方法执行      |
  | 依赖注入 | 无法直接注入 Spring Bean（需特殊处理） | 可直接注入 Spring Bean（如 Service）  |

### 2. 白名单配置原因 + AntPathMatcher 作用

- 白名单包含`/backend/**`和`/front/**`的原因：这两个路径是前端静态资源（HTML/CSS/JS）的存放路径，若遗漏，过滤器会拦截静态资源请求，导致页面空白、样式失效。
- AntPathMatcher 作用：支持 Ant 风格通配符路径匹配，如`/**`匹配多级目录（`/backend/js/login.js`可被`/backend/**`匹配），`*`匹配单级目录，解决固定路径无法适配动态资源的问题。

### 3. 细粒度权限控制优化方案

1. 扩展用户实体，增加`role`字段（如 0 = 普通员工、1 = 管理员）；

2. 在过滤器中，校验登录状态后，根据用户角色过滤接口权限：

   java

   运行

   ```java
   // 示例：管理员可访问所有接口，普通员工仅能访问查询接口
   String requestURI = request.getRequestURI();
   Long userId = (Long) request.getSession().getAttribute("employee");
   User user = userService.getById(userId);
   if (user.getRole() == 0 && requestURI.contains("/delete") || requestURI.contains("/save")) {
       response.getWriter().write(JSON.toJSONString(R.error("无操作权限")));
       return;
   }
   ```

   

3. 进阶方案：引入 Spring Security/Shiro，基于注解（如`@PreAuthorize("hasRole('ADMIN')")`）实现更细粒度的接口权限控制。

## 面试题 4 参考答案

### 1. 短信工具类设计原则 + AccessKey 安全设计

- 设计原则：“封装隔离”，将第三方 SDK（阿里云短信服务）封装为工具类，业务层无需关注底层调用细节，仅通过工具类方法调用，降低耦合；同时支持开发环境与生产环境切换。
- 用子用户 AccessKey 的原因：主账号 AccessKey 拥有全权限，泄露会导致所有云服务被滥用；子用户可仅分配 “短信服务” 权限，即使泄露，影响范围仅限于短信功能，安全性更高。

### 2. 开发环境模拟 + 验证码安全保障

- 开发环境模拟方案：注释真实短信发送逻辑，通过日志打印验证码，避免依赖阿里云签名审核：

  java

  运行

  ```java
  // 开发环境模拟：替换client.getAcsResponse(request)
  log.info("验证码：{}", code);
  ```

  

- 生产环境验证码安全保障：

  1. 验证码有效期限制（如 5 分钟），存入 Redis 并设置过期时间；
  2. 限制同一手机号单位时间内获取次数（如 1 小时内最多 5 次），防止恶意刷取；
  3. 验证码传输通过 HTTPS 加密，避免明文泄露。

### 3. 验证码覆盖问题 + 分布式解决方案

- 覆盖原因：若 Session 键用固定值（如 “code”），多用户同时获取验证码时，后存入的验证码会覆盖前一个。
- 单体架构解决方案：Session 键用 “手机号”（`session.setAttribute(phone, code)`），确保每个用户的验证码独立存储。
- 分布式架构解决方案：用 Redis 替代 Session，key 为 “verify_code: 手机号”，value 为验证码，过期时间 5 分钟，支持跨服务共享，避免 Session 集群同步问题。

## 面试题 5 参考答案

### 1. 分页插件原理 + 分页失效原因

- 底层原理：MyBatis-Plus 的`PaginationInnerInterceptor`通过拦截 MyBatis 的`Executor.query()`方法，自动拼接`LIMIT`语句（实现分页）和`COUNT(*)`语句（统计总记录数），最终将结果封装到`Page`对象中。
- 分页失效的常见原因：
  1. 未配置分页插件（未在`MybatisPlusConfig`中注册`PaginationInnerInterceptor`）；
  2. 调用`service.list()`而非`service.page()`方法，未触发分页拦截；
  3. MyBatis-Plus 版本与 SpringBoot 版本不兼容（如 SpringBoot 2.6 + 与 MyBatis-Plus 3.4.x 冲突）；
  4. 分页参数传递错误（如`page`从 0 开始，前端传递 1 导致逻辑错误）。

### 2. N+1 问题优化方案

- N+1 问题描述：查询 N 个菜品（1 次 SQL），再循环查询每个菜品的口味（N 次 SQL），共执行 N+1 次 SQL，效率低下。

- 优化方案：批量查询口味，再按菜品 ID 分组，减少 SQL 执行次数为 2 次（1 次查菜品 + 1 次查所有口味）：

  java

  运行

  ```java
  @GetMapping("/list")
  public R<List<DishDto>> list(Dish dish) {
      // 1. 查菜品（1次SQL）
      LambdaQueryWrapper<Dish> queryWrapper = new LambdaQueryWrapper<>();
      queryWrapper.eq(Dish::getStatus, 1);
      List<Dish> dishList = dishService.list(queryWrapper);
      
      // 2. 批量查口味（1次SQL，避免循环查询）
      List<Long> dishIds = dishList.stream().map(Dish::getId).collect(Collectors.toList());
      LambdaQueryWrapper<DishFlavor> flavorWrapper = new LambdaQueryWrapper<>();
      flavorWrapper.in(DishFlavor::getDishId, dishIds);
      List<DishFlavor> flavorList = dishFlavorService.list(flavorWrapper);
      
      // 3. 按菜品ID分组口味（Map<dishId, List<flavor>>）
      Map<Long, List<DishFlavor>> flavorMap = flavorList.stream()
          .collect(Collectors.groupingBy(DishFlavor::getDishId));
      
      // 4. 转换DTO（无额外SQL）
      List<DishDto> dtoList = dishList.stream().map(item -> {
          DishDto dto = new DishDto();
          BeanUtils.copyProperties(item, dto);
          dto.setFlavors(flavorMap.getOrDefault(item.getId(), Collections.emptyList()));
          return dto;
      }).collect(Collectors.toList());
      
      return R.success(dtoList);
  }
  ```

### 3. DTO 转换原因 + 核心价值

- 转换原因：`Dish`实体类仅包含菜品基本信息（id、name、categoryId 等），无法满足前端需求（需展示口味列表`flavors`），需通过`DishDto`扩展字段。
- DTO 核心价值：
  1. 适配前后端数据格式：前端需关联字段（如口味、分类名称），DTO 可扩展这些非数据库映射字段；
  2. 隐藏敏感信息：避免返回数据库字段（如`createTime`、`updateUser`），降低数据泄露风险；
  3. 简化数据传递：一次性传递前端所需所有数据，减少接口调用次数（如无需单独调用 “查询菜品口味” 接口）。