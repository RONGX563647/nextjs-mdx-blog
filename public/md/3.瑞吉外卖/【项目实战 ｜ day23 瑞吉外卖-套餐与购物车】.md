# 🚀 项目实战 Day23 - 瑞吉外卖：套餐与购物车

> 💡 **实战进阶！** 本文聚焦瑞吉外卖项目的套餐管理、手机验证码登录、用户地址簿、菜品/套餐展示、购物车、下单功能——多表操作、事务控制、Session+ThreadLocal，帮你掌握企业级项目的高级功能实现。

---

## 🎯 快速回顾

- **🍱 套餐管理**：多表操作（setmeal + setmeal_dish）、事务控制、关联校验、批量操作
- **📱 手机验证码登录**：阿里云短信服务、Session存储、自动注册
- **📍 用户地址簿**：单表操作、默认地址唯一、ThreadLocal用户隔离
- **🍜 菜品/套餐展示**：DTO模式、多表关联、N+1问题优化
- **🛒 购物车**：状态管理、数量累加、互斥逻辑
- **📦 下单功能**：多表事务、订单流转、雪花算法ID生成
- **⚠️ 常见问题**：事务回滚、N+1查询、内存泄漏、并发安全

---

## 📑 目录

- [一、核心架构与源码设计思想](#一核心架构与源码设计思想)
  - [1. 整体架构分层（源码目录对应）](#1-整体架构分层源码目录对应)
  - [2. 核心设计思想](#2-核心设计思想)
- [二、套餐管理（多表操作 + 事务控制）](#二套餐管理多表操作--事务控制)
  - [1. 核心实体与 DTO 源码分析](#1-核心实体与-dto-源码分析)
  - [2. 新增套餐源码深入分析（SetmealServiceImpl.saveWithDish）](#2-新增套餐源码深入分析setmealservicesavewithdish)
  - [3. 套餐删除源码深入分析（SetmealServiceImpl.removeWithDish）](#3-套餐删除源码深入分析setmealserviceremovewithdish)
- [三、手机验证码登录（第三方服务 + Session+ThreadLocal）](#三手机验证码登录第三方服务--sessionthreadlocal)
  - [1. 核心工具类源码分析（SMSUtils）](#1-核心工具类源码分析smsutils)
  - [2. 登录流程源码深度分析（UserController）](#2-登录流程源码深度分析usercontroller)
  - [3. 过滤器源码分析（LoginCheckFilter）](#3-过滤器源码分析logincheckfilter)
- [四、用户地址簿（单表操作 + 默认地址唯一）](#四用户地址簿单表操作--默认地址唯一)
  - [1. 核心逻辑源码分析（AddressBookController.setDefault）](#1-核心逻辑源码分析addressbookcontrollersetdefault)
  - [2. ThreadLocal 工具类源码分析（BaseContext）](#2-threadlocal-工具类源码分析basecontext)
- [五、菜品 / 套餐展示优化（DTO + 多表关联）](#五菜品--套餐展示优化dto--多表关联)
  - [1. 菜品展示源码深入分析（DishController.list）](#1-菜品展示源码深入分析dishcontrollerlist)
- [六、购物车（状态管理 + 数量累加）](#六购物车状态管理--数量累加)
  - [1. 核心逻辑源码分析（ShoppingCartController.add）](#1-核心逻辑源码分析shoppingcartcontrolleradd)
- [七、下单功能（多表事务 + 订单流转）](#七下单功能多表事务--订单流转)
  - [1. 核心源码分析（OrderServiceImpl.submit）](#1-核心源码分析orderservicesubmit)
- [❓ 问答](#问答)

---

## 📖 详细内容

### 一、核心架构与源码设计思想

#### 1. 整体架构分层（源码目录对应）

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

---

#### 2. 核心设计思想

- **分层解耦**：Controller 接收请求，Service 处理逻辑，Mapper 操作数据库，职责单一；
- **DTO 模式**：解决前后端数据格式不匹配（如 SetmealDto 扩展菜品列表、分类名称）；
- **事务一致性**：多表操作（如套餐新增、下单）必加`@Transactional`；
- **用户隔离**：通过`BaseContext`（ThreadLocal）存储当前用户 ID，所有操作关联用户；
- **复用优先**：单表 CRUD 复用 MyBatis-Plus BaseMapper，通用组件（R、GlobalExceptionHandler）全局复用。

---

### 二、套餐管理（多表操作 + 事务控制）

#### 1. 核心实体与 DTO 源码分析

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

---

#### 2. 新增套餐源码深入分析（SetmealServiceImpl.saveWithDish）

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

---

#### 3. 套餐删除源码深入分析（SetmealServiceImpl.removeWithDish）

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

---

### 三、手机验证码登录（第三方服务 + Session+ThreadLocal）

#### 1. 核心工具类源码分析（SMSUtils）

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

---

#### 2. 登录流程源码深度分析（UserController）

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

---

#### 3. 过滤器源码分析（LoginCheckFilter）

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

---

### 四、用户地址簿（单表操作 + 默认地址唯一）

#### 1. 核心逻辑源码分析（AddressBookController.setDefault）

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

---

#### 2. ThreadLocal 工具类源码分析（BaseContext）

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

---

### 五、菜品 / 套餐展示优化（DTO + 多表关联）

#### 1. 菜品展示源码深入分析（DishController.list）

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

---

### 六、购物车（状态管理 + 数量累加）

#### 1. 核心逻辑源码分析（ShoppingCartController.add）

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

---

### 七、下单功能（多表事务 + 订单流转）

#### 1. 核心源码分析（OrderServiceImpl.submit）

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

    // 步骤6：保存订单主表
    this.save(orders);

    // 步骤7：保存订单明细（批量）
    orderDetailService.saveBatch(orderDetails);

    // 步骤8：清空购物车
    shoppingCartService.remove(cartWrapper);
}
```

- **事务控制**：`@Transactional`确保下单流程原子性，任何步骤失败都会回滚；
- **雪花算法**：`IdWorker.getId()`生成分布式唯一 ID，避免订单号冲突；
- **线程安全**：`AtomicInteger`保证金额计算线程安全，多线程并发下单时金额准确；
- **清空购物车**：下单成功后清空购物车，符合用户习惯。

---

## ❓ 问答

### Q1：套餐管理中，如何实现多表操作和事务控制？

**答**：
- **多表操作**：
  1. 保存套餐基本信息（setmeal表）
  2. 处理套餐-菜品关联数据（setmeal_dish表）
  3. 给每个关联菜品设置套餐ID，建立两表关联
- **事务控制**：
  1. 在 Service 方法上添加`@Transactional`注解
  2. 抛出 RuntimeException 触发事务回滚（如 CustomException）
  3. 确保多表操作原子性，任何步骤失败都会回滚
- **解析**：理解多表操作和事务控制，是掌握企业级项目开发的关键。

---

### Q2：手机验证码登录的流程是什么？如何实现自动注册？

**答**：
- **登录流程**：
  1. 发送验证码：生成4位随机验证码，存入 Session（key=手机号）
  2. 登录校验：比对 Session 中存储的验证码与前端输入
  3. 自动注册：未注册用户自动注册，提升用户体验
  4. 存储登录状态：Session 存入用户 ID，ThreadLocal 存入用户 ID 供后续业务使用
- **自动注册实现**：
  1. 按手机号查询用户是否存在
  2. 不存在则创建新用户，设置默认状态
  3. 存储登录状态，返回用户信息
- **解析**：理解手机验证码登录流程和自动注册，是掌握移动端登录的关键。

---

### Q3：ThreadLocal 的线程隔离机制是什么？如何避免内存泄漏？

**答**：
- **线程隔离机制**：ThreadLocal 内部维护一个 Map，key 是当前线程，value 是存储的用户 ID，每个线程有独立的存储副本，线程间互不干扰
- **避免内存泄漏**：
  1. 在请求结束后调用`ThreadLocal.remove()`，移除当前线程的存储值
  2. 在过滤器的`finally`块中添加清理逻辑，确保无论请求是否成功，都能清理数据
  3. 线程池场景下，避免用户 ID 残留导致数据混淆
- **解析**：理解 ThreadLocal 的线程隔离机制和内存泄漏风险，是掌握并发编程的基础。

---

### Q4：购物车的数量累加逻辑是什么？如何避免重复新增？

**答**：
- **数量累加逻辑**：
  1. 判断是菜品还是套餐（dish_id 和 setmeal_id 互斥）
  2. 查询购物车中是否已存在该商品
  3. 已存在：数量+1，更新记录
  4. 不存在：新增记录，数量默认1
- **避免重复新增**：
  1. 通过`userId`和`dishId`/`setmealId`查询是否已存在
  2. 已存在则更新数量，而非新增记录
  3. 减少数据库冗余，提升查询效率
- **解析**：理解购物车的数量累加逻辑，是掌握状态管理的关键。

---

### Q5：下单功能的事务控制是如何实现的？如何保证数据一致性？

**答**：
- **事务控制实现**：
  1. 在 Service 方法上添加`@Transactional`注解
  2. 事务边界覆盖整个下单流程（校验购物车、校验地址、生成订单号、组装订单、保存订单、清空购物车）
  3. 任何步骤失败都会回滚，确保数据一致性
- **数据一致性保障**：
  1. 校验购物车非空，避免下单失败
  2. 校验地址有效，避免配送失败
  3. 使用`AtomicInteger`保证金额计算线程安全
  4. 批量保存订单明细，提升性能
  5. 下单成功后清空购物车，符合用户习惯
- **解析**：理解下单功能的事务控制和数据一致性保障，是掌握企业级项目开发的关键。

---

> **📚 学习建议**：本节内容是瑞吉外卖项目的高级功能，重点掌握套餐管理、手机验证码登录、用户地址簿、菜品/套餐展示、购物车、下单功能，这些是企业级项目开发的核心，涉及多表操作、事务控制、用户隔离等高级技术。
