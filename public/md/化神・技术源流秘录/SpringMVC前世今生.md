# 从“Servlet汪洋”到“响应式时代”：Spring MVC 1.x到5.x演进全记录与核心知识点详解

### 引言

如果问你：一个HTTP请求从浏览器发出，到后端返回JSON数据，这中间到底经历了什么？很多Java开发者都会脱口而出：“经过Spring MVC，DispatcherServlet处理……”但你可能不知道，这套如今看似理所当然的流程，是从怎样一个“野蛮生长”的年代一步步演变过来的。

Spring MVC，这个伴随Spring Framework一同诞生的Web框架，从2004年至今，已经走过了五个大版本的演进历程。它见证了Java Web开发从“JSP+Servlet”混战到RESTful风格一统江湖，从“配置文件堆积如山”到“一键注解搞定”的整个历史。

今天，我们顺着时间线，用最详尽的笔触，还原Spring MVC每个版本的核心技术点、配置细节、设计思想，以及当年开发者踩过的坑。这篇文章不仅是为了让你在面试中侃侃而谈，更是为了让你在实际开发中真正理解：为什么今天的Spring MVC长成这样。


## 第一章：Spring MVC 1.x —— 破土而出，终结Servlet的“野蛮时代”

### 1.1 时代背景：Servlet开发的噩梦

**时间回到2004年。**

那时候做Java Web开发是什么体验？如果你经历过，一定会记得那些噩梦般的日子：

- **每个请求都要写一个Servlet类**：`public class UserServlet extends HttpServlet`，然后在`web.xml`里配上一长串`<servlet>`和`<servlet-mapping>`
- **获取请求参数全靠手动**：`String id = request.getParameter("id")`，然后自己转型、自己校验、自己处理空值
- **返回响应全靠拼字符串**：用`PrintWriter`在Java代码里拼HTML，或者`forward`到一个JSP
- **处理完业务逻辑，还得自己管理事务、自己捕获异常**

一个简单的用户列表功能，可能要写三四个Servlet，配十几行XML，代码里充斥着大量的模板式代码。更可怕的是，每个Servlet都继承了`HttpServlet`，和Servlet API牢牢绑定，单元测试成了奢望。

这时候，Spring 1.x带着它的IoC容器来了，但Web层依然是一团乱麻。业界迫切需要一种能将Web层也纳入Spring管理的框架。

#### 1.1.1 当时的竞争对手

- **Struts 1.x**：最主流的MVC框架，但Action类必须继承`Action`，表单需要单独的`ActionForm`，配置繁琐且和Servlet API耦合
- **WebWork**：比Struts更灵活，但后来被Struts 2吸收
- **Tapestry**：组件化思想，但学习曲线陡峭

Spring MVC 1.x就是在这样的背景下诞生的。它的核心理念是：**用Spring的IoC容器来管理Web层的组件，把Servlet开发从“面向接口实现”变成“面向配置”**。

### 1.2 核心架构：前端控制器模式

Spring MVC 1.x已经奠定了后来所有版本的基石——**DispatcherServlet前端控制器模式**。这个模式的核心思想是：所有的请求都先经过一个中央处理器（DispatcherServlet），由它负责分发到具体的处理器（Controller）。

#### 1.2.1 核心组件详解

| 组件 | 接口/类 | 作用 | 1.x时代的特点 |
|------|---------|------|---------------|
| **DispatcherServlet** | `FrameworkServlet`的子类 | 前端控制器，接收所有请求，调度其他组件 | 必须在`web.xml`中显式配置，指定配置文件位置 |
| **HandlerMapping** | `HandlerMapping` | 根据请求URL找到对应的处理器（Controller） | 默认使用`BeanNameUrlHandlerMapping`，即URL匹配Bean的name属性 |
| **HandlerAdapter** | `HandlerAdapter` | 调用处理器的方法 | `SimpleControllerHandlerAdapter`专门适配实现了`Controller`接口的类 |
| **ViewResolver** | `ViewResolver` | 将逻辑视图名解析为物理视图 | `InternalResourceViewResolver`最常用，加上前缀后缀找到JSP |
| **ModelAndView** | `ModelAndView` | 封装模型数据和视图信息 | 所有控制器必须返回这个对象 |

#### 1.2.2 配置一个完整的Spring MVC 1.x应用

**第一步：配置web.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee 
                             http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd"
         version="2.4">

    <!-- 配置DispatcherServlet -->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- 指定配置文件位置，如果不指定，默认找 /WEB-INF/[servlet-name]-servlet.xml -->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/springmvc-servlet.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <!-- 配置Servlet映射，那个年代经典的后缀是 .do -->
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>*.do</url-pattern>
    </servlet-mapping>

    <!-- 配置Spring监听器，加载业务层配置 -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/applicationContext.xml</param-value>
    </context-param>
</web-app>
```

**第二步：配置springmvc-servlet.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- 配置视图解析器：将逻辑视图名解析为JSP路径 -->
    <bean id="viewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/jsp/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

    <!-- 配置HandlerMapping：BeanNameUrlHandlerMapping是默认的，可以不用显式配置 -->
    <!-- 它的原理是：Bean的name属性就是URL路径 -->
    
    <!-- 配置HandlerAdapter：SimpleControllerHandlerAdapter是默认的，可以不用显式配置 -->
    <!-- 它的原理是：适配实现了Controller接口的类 -->

    <!-- 定义Controller：注意Bean的name就是URL路径 -->
    <bean name="/user/list.do" class="com.example.controller.UserListController">
        <property name="userService" ref="userService"/>
    </bean>
    
    <bean name="/user/detail.do" class="com.example.controller.UserDetailController">
        <property name="userService" ref="userService"/>
    </bean>

    <!-- 引用业务层配置 -->
    <import resource="applicationContext.xml"/>
</beans>
```

### 1.3 控制器怎么写？

在1.x时代，你必须实现`Controller`接口：

```java
package com.example.controller;

import com.example.model.User;
import com.example.service.UserService;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class UserDetailController implements Controller {
    
    private UserService userService;
    
    // Setter注入
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
    
    @Override
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // 1. 手动获取参数
        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        
        // 2. 手动转换类型
        Long id = Long.parseLong(idParam);
        
        // 3. 调用业务层
        User user = userService.findById(id);
        if (user == null) {
            // 返回错误视图
            return new ModelAndView("error/404");
        }
        
        // 4. 封装ModelAndView返回
        ModelAndView mav = new ModelAndView();
        mav.addObject("user", user);
        mav.setViewName("user/detail");  // 逻辑视图名
        return mav;
    }
}
```

### 1.4 请求处理流程详解

1. **浏览器发送请求**：`http://localhost:8080/app/user/detail.do?id=1`
2. **DispatcherServlet接收请求**：根据`web.xml`配置，所有`.do`请求都被`DispatcherServlet`拦截
3. **遍历HandlerMapping**：`DispatcherServlet`持有的`HandlerMapping`（默认是`BeanNameUrlHandlerMapping`）遍历所有注册的Bean，查找name属性匹配`/user/detail.do`的Bean
4. **找到处理器**：找到`UserDetailController`，返回`HandlerExecutionChain`（包含处理器和拦截器）
5. **选择HandlerAdapter**：`DispatcherServlet`遍历持有的`HandlerAdapter`，找到能处理`Controller`接口的`SimpleControllerHandlerAdapter`
6. **调用处理器**：适配器调用`controller.handleRequest(request, response)`
7. **执行业务逻辑**：控制器内部调用`userService.findById(id)`，获取User对象
8. **返回ModelAndView**：控制器返回封装了数据和视图名的`ModelAndView`
9. **解析视图**：`DispatcherServlet`调用`ViewResolver`，将逻辑视图名`user/detail`解析为物理视图路径`/WEB-INF/jsp/user/detail.jsp`
10. **渲染视图**：`DispatcherServlet`将Model中的数据填充到视图（JSP）中
11. **响应客户端**：渲染后的HTML返回给浏览器

### 1.5 局限性分析

**优点：**
- 第一次把Web层的组件纳入了Spring容器管理，实现了依赖注入
- 分离了控制器、视图解析、请求映射的职责，架构清晰
- 为后来的演进打下了坚实的基础

**缺点：**
- **每个URL对应一个Controller类**：一个中等规模项目，Controller类数量轻松上百，难以维护
- **必须实现特定接口**：与Spring API耦合，无法使用POJO
- **XML配置依然繁琐**：一个URL一行配置，项目大了配置文件膨胀
- **获取参数还是要手动**：没有参数绑定，全是`request.getParameter()`
- **类型转换靠手动**：`Long.parseLong()`到处可见，容易抛出异常
- **返回类型单一**：必须返回`ModelAndView`，无法直接返回数据

**当年老开发的心声**：
> “那时候写一个用户模块，要创建UserListController、UserDetailController、UserSaveController、UserDeleteController……光类名就起得手软。而且每个Controller里都要写一堆参数获取和类型转换的代码，复用？不存在的。最怕的是用户ID传了个非数字，500错误直接崩了。”


## 第二章：Spring MVC 2.x —— 注解初现，黎明前的曙光

### 2.1 版本概览

2006年，Spring 2.0发布；2007年，Spring 2.5发布。随着Java 5的发布，注解技术开始进入视野。Spring 2.x开始尝试用注解简化配置，这是Spring MVC历史上**第一次质的飞跃**。

**核心升级点**：
- 引入`@Controller`和`@RequestMapping`注解
- 支持方法级别的请求映射
- 增加了`@RequestParam`等参数绑定注解
- 提供了`@InitBinder`进行数据绑定定制
- 支持POJO作为控制器，不再强制实现接口

#### 2.1.1 关键变化：从“类即URL”到“方法即动作”

1.x时代：**一个URL对应一个Controller类**
2.x时代：**一个Controller类可以包含多个处理方法，分别处理不同的URL**

这意味着Controller类的数量可以大大减少，代码组织更加合理。

### 2.2 核心注解详解

#### 2.2.1 @Controller

```java
package com.example.controller;

import com.example.model.User;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller  // 声明这是一个控制器
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // 处理 /user/list.do 请求
    @RequestMapping("/user/list.do")
    public ModelAndView listUsers() {
        List<User> users = userService.findAll();
        ModelAndView mav = new ModelAndView("user/list");
        mav.addObject("users", users);
        return mav;
    }
    
    // 处理 /user/detail.do 请求
    @RequestMapping("/user/detail.do")
    public ModelAndView detailUser(HttpServletRequest request) {
        // 虽然有了注解，但参数获取还得手动
        String id = request.getParameter("id");
        User user = userService.findById(Long.parseLong(id));
        return new ModelAndView("user/detail", "user", user);
    }
    
    // 处理 /user/save.do 请求，并限定POST方法
    @RequestMapping(value = "/user/save.do", method = RequestMethod.POST)
    public ModelAndView saveUser(User user) {  // 注意：这里还不能自动绑定
        userService.save(user);
        return new ModelAndView("redirect:/user/list.do");
    }
}
```

#### 2.2.2 @RequestMapping

`@RequestMapping`是2.x版本最核心的注解，可以作用在类级别和方法级别。

```java
@Controller
@RequestMapping("/user")  // 类级别的映射，所有方法的URL都基于此
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // 完整路径：/user/list.do
    @RequestMapping("/list.do")
    public ModelAndView listUsers() { ... }
    
    // 完整路径：/user/detail.do
    @RequestMapping("/detail.do")
    public ModelAndView detailUser(@RequestParam("id") Long id) {  // 支持@RequestParam了！
        User user = userService.findById(id);
        return new ModelAndView("user/detail", "user", user);
    }
    
    // 限定HTTP方法
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ModelAndView saveUser(@ModelAttribute("user") User user) {  // 支持@ModelAttribute
        userService.save(user);
        return new ModelAndView("redirect:/user/list.do");
    }
    
    // 支持多路径映射
    @RequestMapping({"/edit.do", "/update.do"})
    public ModelAndView editUser(@RequestParam("id") Long id) { ... }
}
```

**@RequestMapping属性详解**：

| 属性 | 作用 | 示例 |
|------|------|------|
| `value`/`path` | 指定URL路径 | `@RequestMapping("/user")` |
| `method` | 指定HTTP方法 | `@RequestMapping(method=RequestMethod.POST)` |
| `params` | 限制请求参数 | `@RequestMapping(params="action=save")` |
| `headers` | 限制请求头 | `@RequestMapping(headers="content-type=text/*")` |

#### 2.2.3 @RequestParam

```java
@RequestMapping("/detail.do")
public ModelAndView detailUser(@RequestParam("id") Long userId,
                               @RequestParam(value = "name", required = false) String userName) {
    // @RequestParam会自动从请求参数中获取值，并进行类型转换
    // required默认为true，参数缺失会抛出异常
    // 可以通过defaultValue设置默认值
    User user = userService.findById(userId);
    return new ModelAndView("user/detail", "user", user);
}
```

#### 2.2.4 @ModelAttribute

```java
@RequestMapping(value = "/save.do", method = RequestMethod.POST)
public ModelAndView saveUser(@ModelAttribute("user") User user) {
    // @ModelAttribute会从请求参数中自动填充User对象的属性
    // 参数名称与User属性名匹配
    userService.save(user);
    return new ModelAndView("redirect:/user/list.do");
}

// 也可以用在方法上，在执行所有处理方法之前执行，用于准备数据
@ModelAttribute("userTypes")
public List<String> populateUserTypes() {
    return Arrays.asList("ADMIN", "USER", "GUEST");
}
```

#### 2.2.5 @InitBinder

用于自定义数据绑定规则。

```java
@Controller
public class UserController {
    
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // 注册自定义属性编辑器
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, true));
        
        // 设置允许的字段，防止过度提交
        binder.setAllowedFields("username", "password", "email", "birthDate");
    }
    
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ModelAndView saveUser(@ModelAttribute("user") User user) {
        // 这里的user对象的birthDate会被自动转换为Date类型
        userService.save(user);
        return new ModelAndView("redirect:/user/list.do");
    }
}
```

### 2.3 配置方式变化

**必须开启注解支持**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd
           http://www.springframework.org/schema/mvc
           http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 开启组件扫描，自动注册@Controller注解的类 -->
    <context:component-scan base-package="com.example.controller"/>

    <!-- 开启Spring MVC注解支持，注册必要的HandlerMapping和HandlerAdapter -->
    <!-- 这行配置会注册 DefaultAnnotationHandlerMapping 和 AnnotationMethodHandlerAdapter -->
    <mvc:annotation-driven/>

    <!-- 视图解析器保持不变 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/jsp/"/>
        <property name="suffix" value=".jsp"/>
    </bean>
</beans>
```

如果不使用`<mvc:annotation-driven/>`，也可以手动注册：

```xml
<bean class="org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping"/>
<bean class="org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter"/>
```

### 2.4 支持多种返回值类型

2.x的控制器方法不再强制返回`ModelAndView`，可以返回多种类型：

```java
@Controller
public class FlexibleController {
    
    // 返回ModelAndView
    @RequestMapping("/mav")
    public ModelAndView handleMav() {
        return new ModelAndView("viewName");
    }
    
    // 返回String（逻辑视图名）
    @RequestMapping("/string")
    public String handleString() {
        return "viewName";  // 默认将返回字符串作为视图名
    }
    
    // 返回void（通常用于直接操作response）
    @RequestMapping("/void")
    public void handleVoid(HttpServletResponse response) throws IOException {
        response.getWriter().write("Hello World");
    }
    
    // 返回ModelMap（会自动根据请求URL推导视图名）
    @RequestMapping("/modelmap")
    public ModelMap handleModelMap() {
        ModelMap model = new ModelMap();
        model.addAttribute("key", "value");
        return model;
    }
    
    // 返回任意POJO（会被放入Model，根据请求URL推导视图名）
    @RequestMapping("/pojo")
    public User handlePojo() {
        return userService.findById(1L);
    }
}
```

### 2.5 2.x时代的“混搭”配置策略

2.x时代的最佳实践是：**基础架构用XML，业务逻辑用注解**。

- **XML配置**：负责数据源、事务管理器、视图解析器等基础设施，以及URL到Controller的顶层映射
- **注解配置**：负责Controller内部的请求映射、参数绑定等

这种“混搭”风格允许开发者将URL映射规则集中在XML中管理，而将方法分派规则用注解表达：

```xml
<!-- XML中定义Controller的顶层映射 -->
<bean class="org.springframework.web.servlet.handler.SimpleUrlHandlerMapping">
    <property name="mappings">
        <value>
            /accounts/*=accountsController
        </value>
    </property>
</bean>

<bean id="accountsController" class="com.example.AccountsController"/>
```

```java
// 注解中定义方法级别的映射
@Controller
public class AccountsController {
    
    @RequestMapping(method=RequestMethod.GET)
    public List<Account> list() { ... }
    
    @RequestMapping(method=RequestMethod.GET)
    public Account show(@RequestParam("id") Long id) { ... }
}
```

### 2.6 局限性分析

**进步之处：**
- 一个Controller类可以处理多个URL，大大减少了类的数量
- 注解配置比XML简洁，开发效率提升
- 参数绑定开始自动化（@RequestParam）
- 返回类型更加灵活

**依然存在的问题：**
- **参数绑定还不完善**：复杂对象绑定需要`@InitBinder`辅助
- **REST支持薄弱**：虽然支持了method属性，但返回JSON等格式还很麻烦
- **类型转换依赖属性编辑器**：`PropertyEditor`是线程不安全的，容易出问题
- **配置文件依然存在**：虽然减少了，但XML和注解混用增加了认知负担


## 第三章：Spring MVC 3.x —— RESTful崛起，注解驱动时代全面到来

### 3.1 版本概览

2010年，Spring 3.0发布。这是Spring MVC走向成熟的里程碑。随着REST架构风格的流行，Spring MVC 3.x全面拥抱REST，引入了大量新特性。

**核心升级点**：
- 完整的RESTful支持：`@PathVariable`、`@ResponseBody`、`@RequestBody`
- 内容协商（Content Negotiation）
- HTTP方法转换（HiddenHttpMethodFilter）
- ETag支持（ShallowEtagHeaderFilter）
- RestTemplate客户端
- 基于注解的异常处理（@ExceptionHandler）

#### 3.1.1 为什么要支持REST？

REST（Representational State Transfer）作为一种架构风格，强调资源的概念和统一接口。它的核心原则：
- 使用URI标识资源
- 使用统一的HTTP方法操作资源（GET、PUT、POST、DELETE）
- 资源可以有多种表现形式（JSON、XML、HTML）
- 无状态通信

在REST流行之前，Web服务大多基于SOAP，复杂且笨重。REST以其简单、轻量的特点迅速成为Web API的事实标准。

### 3.2 RESTful核心特性详解

#### 3.2.1 @PathVariable：从URL模板中提取变量

这是3.x最重要的特性之一，让REST风格的URL成为可能。

```java
@Controller
@RequestMapping("/users")
public class UserController {
    
    // 处理 GET /users/123
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ModelAndView getUser(@PathVariable Long id) {
        // @PathVariable会自动从URL模板中提取id的值，并转换为Long
        User user = userService.findById(id);
        return new ModelAndView("user/detail", "user", user);
    }
    
    // 支持多个路径变量
    @RequestMapping(value = "/{userId}/orders/{orderId}", method = RequestMethod.GET)
    public ModelAndView getUserOrder(@PathVariable("userId") Long userId,
                                     @PathVariable("orderId") Long orderId) {
        // 如果参数名和变量名不一致，需要指定value
        Order order = orderService.findByUserAndOrder(userId, orderId);
        return new ModelAndView("order/detail", "order", order);
    }
    
    // 支持正则表达式
    @RequestMapping(value = "/{username:[a-z0-9]+}/profile")
    public ModelAndView getProfile(@PathVariable String username) {
        // 只有小写字母和数字组成的username才会匹配
        User user = userService.findByUsername(username);
        return new ModelAndView("user/profile", "user", user);
    }
    
    // 支持Ant风格路径和路径变量结合
    @RequestMapping(value = "/{userId}/orders/*/details")
    public ModelAndView getOrderDetails(@PathVariable Long userId) {
        // 匹配 /users/1/orders/anything/details
        List<Order> orders = orderService.findByUser(userId);
        return new ModelAndView("order/details", "orders", orders);
    }
}
```

**工作原理**：`@PathVariable`的解析基于`UriTemplate`类，它可以将模板化的URI（如`/users/{id}`）与实际请求URI（如`/users/123`）进行匹配，并提取变量值。Spring MVC在`AnnotationMethodHandlerAdapter`中集成了这一功能。

#### 3.2.2 @ResponseBody：直接返回数据，而不是视图

这是RESTful API开发的核心注解，让控制器可以直接返回Java对象，由框架自动转换为JSON/XML。

```java
@Controller
@RequestMapping("/api/users")
public class UserApiController {
    
    // 返回单个用户对象，自动转JSON
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    @ResponseBody
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    // 返回列表，自动转JSON数组
    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public List<User> getUsers() {
        return userService.findAll();
    }
    
    // 返回String，直接作为响应体
    @RequestMapping(value = "/hello", method = RequestMethod.GET)
    @ResponseBody
    public String hello() {
        return "Hello World";  // 直接返回字符串，不是视图名
    }
}
```

**消息转换器（HttpMessageConverter）**：`@ResponseBody`的背后是`HttpMessageConverter`机制。Spring 3.x内置了多种消息转换器：

| 转换器 | 用途 | 条件 |
|--------|------|------|
| `MappingJacksonHttpMessageConverter` | JSON转换 | 需要Jackson库在classpath中 |
| `Jaxb2RootElementHttpMessageConverter` | XML转换 | 需要JAXB 2 |
| `StringHttpMessageConverter` | 字符串转换 | 默认启用 |
| `FormHttpMessageConverter` | 表单数据转换 | 默认启用 |
| `ByteArrayHttpMessageConverter` | 字节数组 | 默认启用 |

#### 3.2.3 @RequestBody：接收JSON/XML请求体

与`@ResponseBody`相对，`@RequestBody`将请求体中的数据转换为Java对象。

```java
@Controller
@RequestMapping("/api/users")
public class UserApiController {
    
    // 创建用户，接收JSON格式的请求体
    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public User createUser(@RequestBody User user) {
        // 请求体中的JSON自动转换为User对象
        return userService.save(user);
    }
    
    // 更新用户，接收JSON请求体
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    @ResponseBody
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.update(user);
    }
    
    // 接收复杂嵌套对象
    @RequestMapping(value = "/batch", method = RequestMethod.POST)
    @ResponseBody
    public List<User> createUsers(@RequestBody List<User> users) {
        return userService.saveAll(users);
    }
}
```

**请求示例**：
```json
POST /api/users HTTP/1.1
Content-Type: application/json

{
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "age": 25
}
```

#### 3.2.4 HTTP方法转换（HiddenHttpMethodFilter）

REST要求使用PUT和DELETE方法，但HTML表单只支持GET和POST。Spring 3.x提供了`HiddenHttpMethodFilter`来解决这个问题。

**配置web.xml**：
```xml
<filter>
    <filter-name>hiddenHttpMethodFilter</filter-name>
    <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>hiddenHttpMethodFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

**在表单中使用**：
```jsp
<form action="/api/users/123" method="post">
    <input type="hidden" name="_method" value="PUT"/>
    <!-- 表单字段 -->
    <input type="submit" value="更新用户"/>
</form>
```

**原理**：过滤器会检查请求参数中是否有`_method`，如果有，将请求包装成对应的HTTP方法（PUT/DELETE/PATCH）。这样，浏览器可以通过POST请求模拟PUT和DELETE。

#### 3.2.5 内容协商（Content Negotiation）

内容协商是指同一个资源可以有多种表示形式（JSON、XML、HTML等），根据客户端的偏好返回合适的格式。

**配置内容协商管理器**：

```xml
<mvc:annotation-driven content-negotiation-manager="contentNegotiationManager"/>

<bean id="contentNegotiationManager" class="org.springframework.web.accept.ContentNegotiationManagerFactoryBean">
    <!-- 支持通过请求参数指定格式：/users?format=json -->
    <property name="favorParameter" value="true"/>
    <property name="parameterName" value="format"/>
    
    <!-- 支持通过路径扩展名指定格式：/users.json -->
    <property name="favorPathExtension" value="true"/>
    
    <!-- 默认使用Accept头 -->
    <property name="ignoreAcceptHeader" value="false"/>
    
    <!-- 默认内容类型 -->
    <property name="defaultContentType" value="application/json"/>
    
    <!-- 映射文件扩展名到媒体类型 -->
    <property name="mediaTypes">
        <map>
            <entry key="json" value="application/json"/>
            <entry key="xml" value="application/xml"/>
            <entry key="html" value="text/html"/>
        </map>
    </property>
</bean>
```

**控制器中配合使用**：
```java
@Controller
@RequestMapping("/api/users")
public class UserController {
    
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    @ResponseBody
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

**客户端请求方式**：
```bash
# 通过Accept头
curl -H "Accept: application/json" http://localhost:8080/api/users/1

# 通过文件扩展名
curl http://localhost:8080/api/users/1.json

# 通过请求参数
curl http://localhost:8080/api/users/1?format=json
```

#### 3.2.6 ETag支持（ShallowEtagHeaderFilter）

ETag（实体标签）是HTTP协议中用于缓存验证的机制。Spring 3.x提供了`ShallowEtagHeaderFilter`来简化ETag的实现。

**配置web.xml**：
```xml
<filter>
    <filter-name>etagFilter</filter-name>
    <filter-class>org.springframework.web.filter.ShallowEtagHeaderFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>etagFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

**工作原理**：
1. 过滤器拦截响应，缓存渲染后的内容
2. 计算内容的MD5哈希作为ETag值
3. 将ETag添加到响应头
4. 下次客户端请求时，在`If-None-Match`头中带上ETag
5. 过滤器比较哈希值，如果相同则返回304 Not Modified，节省带宽

**注意**：这是**浅层ETag**，只是基于渲染后内容的哈希，不能节省处理时间（视图仍然会渲染）。深层ETag需要基于业务数据实现。

#### 3.2.7 RestTemplate：HTTP客户端

Spring 3.x引入了`RestTemplate`，作为HTTP客户端工具，简化对RESTful服务的调用。

```java
@Service
public class UserServiceClient {
    
    private RestTemplate restTemplate = new RestTemplate();
    
    public User getUserById(Long id) {
        String url = "http://user-service/api/users/{id}";
        return restTemplate.getForObject(url, User.class, id);
    }
    
    public List<User> getAllUsers() {
        String url = "http://user-service/api/users";
        ResponseEntity<List<User>> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            null, 
            new ParameterizedTypeReference<List<User>>() {}
        );
        return response.getBody();
    }
    
    public User createUser(User user) {
        String url = "http://user-service/api/users";
        return restTemplate.postForObject(url, user, User.class);
    }
    
    public void updateUser(Long id, User user) {
        String url = "http://user-service/api/users/{id}";
        restTemplate.put(url, user, id);
    }
    
    public void deleteUser(Long id) {
        String url = "http://user-service/api/users/{id}";
        restTemplate.delete(url, id);
    }
}
```

**RestTemplate支持的方法**：
- `getForObject` / `getForEntity`：GET请求
- `postForObject` / `postForEntity` / `postForLocation`：POST请求
- `put`：PUT请求
- `delete`：DELETE请求
- `exchange`：更通用的方法
- `execute`：执行请求并处理响应

#### 3.2.8 基于注解的异常处理

Spring 3.x引入了`@ExceptionHandler`注解，可以在控制器内部处理异常。

```java
@Controller
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @RequestMapping("/{id}")
    public ModelAndView getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            throw new UserNotFoundException("用户不存在，ID: " + id);
        }
        return new ModelAndView("user/detail", "user", user);
    }
    
    // 处理当前控制器中的异常
    @ExceptionHandler(UserNotFoundException.class)
    public ModelAndView handleUserNotFound(UserNotFoundException ex) {
        ModelAndView mav = new ModelAndView("error/404");
        mav.addObject("message", ex.getMessage());
        return mav;
    }
    
    // 处理参数类型转换异常
    @ExceptionHandler(NumberFormatException.class)
    public ModelAndView handleNumberFormat(NumberFormatException ex) {
        ModelAndView mav = new ModelAndView("error/400");
        mav.addObject("message", "无效的ID格式");
        return mav;
    }
}
```

**全局异常处理**：可以通过实现`HandlerExceptionResolver`接口，或在Spring配置中注册`SimpleMappingExceptionResolver`实现全局异常处理。

### 3.3 新增注解汇总

| 注解 | 作用 | 引入版本 |
|------|------|----------|
| `@PathVariable` | 绑定URL模板变量 | 3.0 |
| `@ResponseBody` | 将返回值写入响应体 | 3.0 |
| `@RequestBody` | 将请求体转换为对象 | 3.0 |
| `@RestController` | 组合注解（3.x中尚未引入，4.x才有） | 3.x未引入 |
| `@ExceptionHandler` | 异常处理方法 | 3.0 |
| `@CookieValue` | 绑定Cookie值 | 3.0 |
| `@RequestHeader` | 绑定请求头 | 3.0 |
| `@ControllerAdvice` | 全局控制器增强（3.2引入） | 3.2 |

### 3.4 配置方式简化

**3.x推荐的配置方式**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd
           http://www.springframework.org/schema/mvc
           http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 自动扫描控制器 -->
    <context:component-scan base-package="com.example.controller"/>

    <!-- 开启MVC注解驱动，注册所有必要的组件 -->
    <mvc:annotation-driven>
        <!-- 配置消息转换器 -->
        <mvc:message-converters>
            <bean class="org.springframework.http.converter.json.MappingJacksonHttpMessageConverter"/>
            <bean class="org.springframework.http.converter.xml.Jaxb2RootElementHttpMessageConverter"/>
        </mvc:message-converters>
    </mvc:annotation-driven>

    <!-- 静态资源处理（避免DispatcherServlet拦截） -->
    <mvc:resources mapping="/static/**" location="/static/"/>

    <!-- 视图解析器 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

</beans>
```

### 3.5 3.x与JAX-RS的对比

在3.x时代，Spring MVC的REST支持与JAX-RS规范形成了竞争关系。InfoQ在2010年发表了一篇详细的对比文章，总结如下：

| 维度 | Spring MVC 3.x | JAX-RS (Jersey) |
|------|---------------|-----------------|
| **资源模型** | 控制器是单例，请求数据通过方法参数传递 | 资源可以是请求作用域，可存储请求数据 |
| **子资源** | 每个资源对应一个独立的Controller | 支持根资源和子资源链式处理 |
| **依赖注入** | 原生Spring DI，无缝集成 | 需要额外整合Spring |
| **URI模板** | `@RequestMapping("/users/{id}")` | `@Path("/users/{id}")` |
| **参数绑定** | `@RequestParam`、`@PathVariable` | `@QueryParam`、`@PathParam` |
| **内容协商** | `ContentNegotiatingViewResolver` | `@Produces`、`@Consumes` |
| **目标定位** | 通用Web框架，同时支持HTML和REST | 专注于RESTful Web Services |

**总结**：Spring MVC 3.x在保持原有Web开发能力的同时，增加了完整的REST支持，使得开发者可以用同一套框架同时构建面向浏览器的HTML应用和面向客户端的REST API。

### 3.6 局限性分析

**进步之处：**
- RESTful支持完整，适应现代API开发需求
- 参数绑定更加自动化
- 内容协商机制灵活
- 异常处理更加优雅

**依然存在的问题：**
- **XML配置依然存在**：虽然减少了很多，但`web.xml`和Spring配置文件还是必须的
- **异步处理支持不足**：Servlet 3.0的异步特性尚未充分利用
- **Java 8新特性未集成**：3.x主要针对Java 6/7
- **性能优化空间**：仍然是阻塞式IO模型


## 第四章：Spring MVC 4.x —— Java 8加持，异步请求时代

### 4.1 版本概览

2013年，Spring 4.0发布。这个版本主要是对Java 8的全面支持和对异步请求处理的完善。

**核心升级点**：
- Java 8全面支持（Lambda、日期时间API）
- 异步请求处理（Callable、DeferredResult）
- @RestController组合注解
- 跨域支持（@CrossOrigin）
- 更灵活的消息转换器
- WebSocket支持（但属于spring-websocket模块）

### 4.2 Java 8新特性支持

#### 4.2.1 Lambda表达式

Spring 4.x的回调接口现在可以接受Lambda表达式：

```java
// 传统方式
restTemplate.execute("http://example.com", HttpMethod.GET,
    new RequestCallback() {
        @Override
        public void doWithRequest(ClientHttpRequest request) throws IOException {
            // 处理请求
        }
    },
    new ResponseExtractor<String>() {
        @Override
        public String extractData(ClientHttpResponse response) throws IOException {
            // 处理响应
            return "result";
        }
    }
);

// Lambda方式
restTemplate.execute("http://example.com", HttpMethod.GET,
    request -> {
        // 处理请求
    },
    response -> {
        // 处理响应
        return "result";
    }
);
```

#### 4.2.2 新日期时间API支持

Spring 4.x全面支持JSR-310（Java 8日期时间API），可以直接在`@RequestParam`、`@PathVariable`、`@RequestBody`中使用`LocalDate`、`LocalDateTime`等类型。

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    
    @GetMapping("/search")
    public List<Order> searchOrders(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return orderService.findByDateBetween(startDate, endDate);
    }
    
    @GetMapping("/{date}/summary")
    public OrderSummary getSummary(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return orderService.getSummary(date);
    }
    
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        // Order实体中包含LocalDateTime字段
        return orderService.save(order);
    }
}
```

#### 4.2.3 Optional作为返回值

```java
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    Optional<User> user = userService.findById(id);
    return user.map(ResponseEntity::ok)
               .orElse(ResponseEntity.notFound().build());
}
```

### 4.3 异步请求处理

Spring MVC 3.2开始引入了基于Servlet 3的异步请求处理，4.x进一步完善了这一特性。

#### 4.3.1 为什么要异步？

传统的Servlet模型：一个请求占用一个线程，直到响应完成才释放。如果请求中包含了耗时操作（如调用外部API、查询数据库），线程就会被长时间占用，导致服务器线程池耗尽，吞吐量下降。

异步请求处理：控制器可以立即返回，释放容器线程，耗时操作在另一个线程中执行，完成后将结果返回给容器，再响应给客户端。

#### 4.3.2 配置异步支持

**web.xml配置**（Servlet 3.0+）：
```xml
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee 
                             http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         version="3.0">

    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <async-supported>true</async-supported>  <!-- 启用异步支持 -->
    </servlet>
    
    <filter>
        <filter-name>someFilter</filter-name>
        <filter-class>com.example.SomeFilter</filter-class>
        <async-supported>true</async-supported>  <!-- 过滤器也要支持异步 -->
    </filter>
    <filter-mapping>
        <filter-name>someFilter</filter-name>
        <url-pattern>/*</url-pattern>
        <dispatcher>REQUEST</dispatcher>
        <dispatcher>ASYNC</dispatcher>  <!-- 支持ASYNC分发 -->
    </filter-mapping>
</web-app>
```

如果使用Servlet 3.0+的编程式配置，可以继承`AbstractDispatcherServletInitializer`或`AbstractAnnotationConfigDispatcherServletInitializer`，它们会自动配置异步支持。

#### 4.3.3 Callable：最简单的异步方式

```java
@RestController
@RequestMapping("/async")
public class AsyncController {
    
    @Autowired
    private TaskService taskService;
    
    @GetMapping("/callable")
    public Callable<String> handleCallable() {
        // 立即返回，释放容器线程
        return new Callable<String>() {
            @Override
            public String call() throws Exception {
                // 这个逻辑会在Spring MVC管理的另一个线程中执行
                Thread.sleep(5000);  // 模拟耗时操作
                return "任务完成";
            }
        };
    }
    
    // 使用Lambda简化
    @GetMapping("/lambda")
    public Callable<String> handleLambda() {
        return () -> {
            Thread.sleep(5000);
            return "任务完成";
        };
    }
}
```

**执行流程**：
1. 控制器返回`Callable`对象
2. Spring MVC开始异步处理，将`Callable`提交给`TaskExecutor`在独立线程中执行
3. `DispatcherServlet`和所有过滤器退出，释放容器线程
4. `Callable`执行完成，产生结果
5. Spring MVC重新分发请求到Servlet容器
6. `DispatcherServlet`再次被调用，处理`Callable`返回的结果
7. 响应返回给客户端

#### 4.3.4 DeferredResult：更灵活的方式

`DeferredResult`允许在任何线程中设置结果，不限于Spring MVC管理的线程。

```java
@RestController
@RequestMapping("/async")
public class DeferredResultController {
    
    // 用于存储等待中的DeferredResult
    private final Queue<DeferredResult<String>> resultQueue = new ConcurrentLinkedQueue<>();
    
    @GetMapping("/deferred")
    public DeferredResult<String> handleDeferred() {
        // 创建DeferredResult，设置超时时间
        DeferredResult<String> deferredResult = new DeferredResult<>(30000L, "超时默认值");
        
        // 注册超时回调
        deferredResult.onTimeout(() -> {
            System.out.println("请求超时");
            resultQueue.remove(deferredResult);
        });
        
        // 注册完成回调
        deferredResult.onCompletion(() -> {
            System.out.println("请求完成");
            resultQueue.remove(deferredResult);
        });
        
        // 存入队列，等待其他线程设置结果
        resultQueue.add(deferredResult);
        
        return deferredResult;  // 立即返回
    }
    
    // 模拟外部事件触发结果设置
    @PostMapping("/notify/{id}")
    public String notifyResult(@PathVariable String id, @RequestBody String data) {
        // 从队列中找到匹配的DeferredResult
        for (DeferredResult<String> result : resultQueue) {
            // 这里简化处理，实际可能需要根据ID匹配
            result.setResult("处理结果: " + data);
            break;
        }
        return "已通知";
    }
    
    // 模拟JMS消息监听器设置结果
    public void onJmsMessage(String message) {
        DeferredResult<String> result = resultQueue.poll();
        if (result != null) {
            result.setResult("JMS消息: " + message);
        }
    }
}
```

**适用场景**：
- 长轮询（Long Polling）
- 服务器推送事件（Server-Sent Events）
- 响应外部事件（JMS消息、定时任务等）
- 与其他异步框架集成

#### 4.3.5 异步请求的异常处理

```java
@RestController
@RequestMapping("/async")
public class AsyncExceptionController {
    
    @GetMapping("/callable-exception")
    public Callable<String> handleWithException() {
        return () -> {
            if (Math.random() > 0.5) {
                throw new RuntimeException("随机异常");
            }
            return "成功";
        };
    }
    
    @GetMapping("/deferred-exception")
    public DeferredResult<String> handleDeferredWithException() {
        DeferredResult<String> deferredResult = new DeferredResult<>();
        
        // 可以在其他线程中设置异常
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                // 使用setErrorResult设置异常
                deferredResult.setErrorResult(new RuntimeException("处理失败"));
            } catch (InterruptedException e) {
                deferredResult.setErrorResult(e);
            }
        }).start();
        
        return deferredResult;
    }
    
    // 全局异常处理
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleException(Exception ex) {
        return Collections.singletonMap("error", ex.getMessage());
    }
}
```

#### 4.3.6 拦截异步请求

Spring 4.x提供了`AsyncHandlerInterceptor`接口，用于拦截异步请求。

```java
public class AsyncInterceptor extends HandlerInterceptorAdapter implements AsyncHandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle: " + request.getRequestURI());
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // 注意：在异步请求中，这个方法**不会**被调用
        System.out.println("postHandle - 异步请求中不会执行");
    }
    
    @Override
    public void afterConcurrentHandlingStarted(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 当异步处理开始时，这个方法会被调用，代替postHandle和afterCompletion
        System.out.println("afterConcurrentHandlingStarted: 异步处理开始");
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 异步请求完成后，这个方法会被调用
        System.out.println("afterCompletion: 异步请求完成");
    }
}
```

### 4.4 @RestController组合注解

```java
// 4.x之前
@Controller
@ResponseBody
public class UserController { ... }

// 4.x之后
@RestController  // 组合注解，等价于 @Controller + @ResponseBody
@RequestMapping("/api/users")
public class UserController { ... }
```

`@RestController`的源码：
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestController {
    String value() default "";
}
```

### 4.5 跨域支持（@CrossOrigin）

Spring 4.2引入了`@CrossOrigin`注解，简化CORS配置。

```java
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")  // 类级别配置
public class UserController {
    
    @GetMapping("/{id}")
    @CrossOrigin(origins = "http://example.com")  // 方法级别覆盖
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @PostMapping
    @CrossOrigin(allowCredentials = "true", maxAge = 3600)  // 更详细的配置
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    @DeleteMapping("/{id}")
    @CrossOrigin(origins = "*")  // 允许所有来源
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

**全局CORS配置**：
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://example.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 4.6 HTTP Streaming支持

Spring 4.x提供了`ResponseBodyEmitter`和`SseEmitter`，支持HTTP流式响应。

#### 4.6.1 ResponseBodyEmitter

```java
@RestController
@RequestMapping("/stream")
public class StreamingController {
    
    @GetMapping("/events")
    public ResponseBodyEmitter handleEvents() {
        ResponseBodyEmitter emitter = new ResponseBodyEmitter();
        
        // 在其他线程中发送多个数据块
        executorService.execute(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    emitter.send("Event " + i + "\n");
                    Thread.sleep(1000);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
    
    @GetMapping("/file")
    public ResponseEntity<ResponseBodyEmitter> downloadFile() {
        ResponseBodyEmitter emitter = new ResponseBodyEmitter();
        
        executorService.execute(() -> {
            try (InputStream is = new FileInputStream("/path/to/large/file.zip")) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    emitter.send(buffer, 0, bytesRead);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=file.zip")
                .body(emitter);
    }
}
```

#### 4.6.2 SseEmitter（Server-Sent Events）

```java
@RestController
@RequestMapping("/sse")
public class SseController {
    
    @GetMapping("/news")
    public SseEmitter streamNews() {
        SseEmitter emitter = new SseEmitter();
        
        executorService.execute(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    SseEmitter.SseEventBuilder event = SseEmitter.event()
                            .id(String.valueOf(i))
                            .name("news")
                            .data("News update " + i)
                            .comment("This is a comment");
                    emitter.send(event);
                    Thread.sleep(2000);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
}
```

**客户端JavaScript**：
```javascript
var source = new EventSource('/sse/news');
source.addEventListener('news', function(event) {
    console.log('News:', event.data);
});
```

### 4.7 4.x其他改进

#### 4.7.1 Matrix变量支持

```java
@RestController
@RequestMapping("/users")
public class UserController {
    
    // 请求路径：/users/42;q=10;r=20
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id,
                        @MatrixVariable int q,
                        @MatrixVariable int r) {
        return userService.findById(id, q, r);
    }
    
    // 需要启用Matrix变量支持
    @Configuration
    public class WebConfig implements WebMvcConfigurer {
        @Override
        public void configurePathMatch(PathMatchConfigurer configurer) {
            configurer.setRemoveSemicolonContent(false);
        }
    }
}
```

#### 4.7.2 消息转换器改进

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 添加Jackson转换器，支持Java 8日期时间类型
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        MappingJackson2HttpMessageConverter jsonConverter = 
            new MappingJackson2HttpMessageConverter(objectMapper);
        converters.add(jsonConverter);
        
        // 添加XML转换器
        converters.add(new Jaxb2RootElementHttpMessageConverter());
    }
}
```


## 第五章：Spring MVC 5.x —— 响应式新篇章，WebMVC依然坚挺

### 5.1 版本概览

2017年，Spring 5.0发布，带来了划时代的**WebFlux**响应式框架。但请注意：**Spring MVC并没有被淘汰**，它和WebFlux是并存的两个Web框架。

**核心升级点**：
- 响应式编程支持（但WebMVC本身仍是阻塞式的）
- HTTP/2支持
- Kotlin支持
- 函数式编程模型（在WebFlux中）
- 新的`WebClient`替代`RestTemplate`（在WebFlux模块）
- 与JUnit 5集成

### 5.2 Spring MVC 5.x的核心定位

在5.x版本中，Spring MVC和Spring WebFlux形成了清晰的定位区分：

| 维度 | Spring MVC | Spring WebFlux |
|------|------------|----------------|
| **编程模型** | 基于Servlet API，阻塞式 | 基于Reactive Streams，非阻塞 |
| **线程模型** | 每个请求一个线程 | 事件循环，少量线程 |
| **适用场景** | 传统应用、JDBC、模板引擎 | 高并发I/O密集型、网关 |
| **底层容器** | Tomcat、Jetty等Servlet容器 | Netty、Servlet 3.1+ |
| **数据库驱动** | JDBC（阻塞） | R2DBC（非阻塞） |

**官方建议**：
- 如果应用是传统的CRUD、使用JDBC、依赖Servlet API，或者团队不熟悉响应式编程，**继续使用Spring MVC**
- 如果需要高并发、I/O密集型、希望用少量线程支撑大量请求，可以考虑**Spring WebFlux**

### 5.3 Spring MVC 5.x的新特性

虽然Spring MVC 5.x的核心API保持稳定，但仍然有一些增强：

#### 5.3.1 HTTP/2支持

```java
@RestController
public class Http2Controller {
    
    @GetMapping("/push")
    public ResponseEntity<String> handleWithPush(PushBuilder pushBuilder) {
        if (pushBuilder != null) {
            pushBuilder.path("/static/style.css")
                      .addHeader("content-type", "text/css")
                      .push();
        }
        return ResponseEntity.ok("Main response");
    }
}
```

#### 5.3.2 Kotlin支持

```kotlin
@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {
    
    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: Long): User {
        // 使用协程，不阻塞线程
        return userService.findById(id)
    }
    
    @GetMapping
    fun getUsers(): Flow<User> = userService.findAll()
    
    @PostMapping
    suspend fun createUser(@RequestBody user: User): User {
        return userService.save(user)
    }
}
```

#### 5.3.3 与JUnit 5集成

```java
@ExtendWith(SpringExtension.class)
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    @DisplayName("测试获取用户")
    void testGetUser() throws Exception {
        User user = new User(1L, "张三");
        when(userService.findById(1L)).thenReturn(user);
        
        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("张三"));
    }
}
```

### 5.4 WebFlux简介（对比用）

虽然本文主要讲Spring MVC，但了解WebFlux有助于理解5.x的全貌。

**WebFlux的两种编程模型**：

1. **基于注解的模型**：与Spring MVC非常相似，但返回值是Mono/Flux

```java
@RestController
@RequestMapping("/api/users")
public class UserReactiveController {
    
    @GetMapping("/{id}")
    public Mono<User> getUser(@PathVariable String id) {
        return userRepository.findById(id);
    }
    
    @GetMapping
    public Flux<User> getUsers() {
        return userRepository.findAll();
    }
}
```

2. **函数式端点模型**：基于RouterFunction和HandlerFunction

```java
@Configuration
public class RoutingConfig {
    
    @Bean
    public RouterFunction<ServerResponse> userRoutes(UserHandler handler) {
        return route()
                .GET("/api/users/{id}", handler::getUser)
                .GET("/api/users", handler::getUsers)
                .POST("/api/users", handler::createUser)
                .build();
    }
}

@Component
public class UserHandler {
    
    public Mono<ServerResponse> getUser(ServerRequest request) {
        String id = request.pathVariable("id");
        return userRepository.findById(id)
                .flatMap(user -> ServerResponse.ok().bodyValue(user))
                .switchIfEmpty(ServerResponse.notFound().build());
    }
}
```

### 5.5 Spring MVC 5.x的最佳实践

虽然版本演进到5.x，但Spring MVC的核心编程模式变化不大。以下是基于5.x的最佳实践：

#### 5.5.1 控制器层

```java
@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable @Min(1) Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new UserNotFoundException(id));
    }
    
    @GetMapping
    public Page<User> getUsers(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String search) {
        return userService.findAll(search, pageable);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }
    
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return userService.update(id, request);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

#### 5.5.2 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFound(UserNotFoundException ex) {
        return new ErrorResponse("USER_NOT_FOUND", ex.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());
        return new ErrorResponse("VALIDATION_FAILED", String.join(", ", errors));
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        return new ErrorResponse("INVALID_PARAMETER", message);
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return new ErrorResponse("INTERNAL_ERROR", "服务器内部错误");
    }
}
```

#### 5.5.3 数据验证

```java
public class UserCreateRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄必须大于等于18")
    @Max(value = 120, message = "年龄必须小于等于120")
    private Integer age;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    // getters/setters
}
```


## 第六章：版本演进全景图与核心知识点总结

### 6.1 版本演进核心脉络

| 版本 | 发布时间 | 核心主题 | 代表特性 |
|------|----------|---------|---------|
| **1.x** | 2004 | 前端控制器模式奠基 | DispatcherServlet、Controller接口、XML配置、ModelAndView |
| **2.x** | 2006-2007 | 注解初现 | @Controller、@RequestMapping、@RequestParam、@InitBinder |
| **3.x** | 2010 | RESTful崛起 | @PathVariable、@ResponseBody、@RequestBody、内容协商、RestTemplate |
| **4.x** | 2013-2015 | Java 8与异步 | @RestController、Callable/DeferredResult、@CrossOrigin、流式响应 |
| **5.x** | 2017 | 响应式并行 | WebFlux、HTTP/2、Kotlin、JUnit 5（但WebMVC本身保持稳定） |

### 6.2 核心组件演进

| 组件 | 1.x | 2.x | 3.x | 4.x | 5.x |
|------|-----|-----|-----|-----|-----|
| **DispatcherServlet** | 核心 | 核心 | 核心 | 核心 | 核心 |
| **HandlerMapping** | BeanNameUrlHandlerMapping | +DefaultAnnotationHandlerMapping | +RequestMappingHandlerMapping | 同3.x | 同3.x |
| **HandlerAdapter** | SimpleControllerHandlerAdapter | +AnnotationMethodHandlerAdapter | +RequestMappingHandlerAdapter | 同3.x | 同3.x |
| **视图解析器** | InternalResourceViewResolver | 同左 | +ContentNegotiatingViewResolver | 同左 | 同左 |
| **参数绑定** | 手动 | @RequestParam | +@PathVariable、@RequestBody | 同3.x | 同3.x |
| **返回值** | ModelAndView | 多种类型 | +@ResponseBody | +ResponseBodyEmitter | 同4.x |

### 6.3 常用注解演进时间线

| 注解 | 引入版本 | 作用 |
|------|----------|------|
| `@Controller` | 2.5 | 声明控制器 |
| `@RequestMapping` | 2.5 | 请求映射 |
| `@RequestParam` | 2.5 | 绑定请求参数 |
| `@InitBinder` | 2.5 | 数据绑定定制 |
| `@ModelAttribute` | 2.5 | 模型属性绑定 |
| `@PathVariable` | 3.0 | 绑定URL模板变量 |
| `@ResponseBody` | 3.0 | 直接返回数据 |
| `@RequestBody` | 3.0 | 接收请求体 |
| `@ExceptionHandler` | 3.0 | 异常处理 |
| `@CookieValue` | 3.0 | 绑定Cookie |
| `@RequestHeader` | 3.0 | 绑定请求头 |
| `@ControllerAdvice` | 3.2 | 全局控制器增强 |
| `@RestController` | 4.0 | 组合注解 |
| `@CrossOrigin` | 4.2 | 跨域支持 |
| `@GetMapping`等 | 4.3 | 简化@RequestMapping |

### 6.4 配置文件演进

| 版本 | 配置方式 | 代表配置 |
|------|---------|---------|
| **1.x** | 纯XML | `<bean name="/user.do" class="..."/>` |
| **2.x** | XML + 注解 | `<context:component-scan/>` + `@Controller` |
| **3.x** | XML + 注解 | `<mvc:annotation-driven/>` + 注解 |
| **4.x** | Java配置 + 注解 | `@Configuration` + `@EnableWebMvc` |
| **5.x** | Java配置 + 注解 | 同4.x |


## 第七章：面试题库

### 5道难度递增的基础面试题

#### 第1题：请简述Spring MVC的核心组件及其作用。

**难度**：⭐

**参考答案**：

Spring MVC的核心组件包括：

1. **DispatcherServlet**：前端控制器，所有请求的入口，负责调度其他组件
2. **HandlerMapping**：根据请求URL查找对应的处理器（Controller），返回HandlerExecutionChain
3. **HandlerAdapter**：调用处理器的具体方法，适配不同类型的处理器
4. **HandlerInterceptor**：拦截器，在请求处理前后执行逻辑
5. **ViewResolver**：将逻辑视图名解析为物理视图（如JSP、Thymeleaf）
6. **ModelAndView**：封装模型数据和视图信息
7. **LocaleResolver**：解析国际化区域信息
8. **MultipartResolver**：处理文件上传

**一句话总结**：DispatcherServlet是大脑，HandlerMapping是导航，HandlerAdapter是执行者，ViewResolver是翻译官。

#### 第2题：@Controller和@RestController有什么区别？

**难度**：⭐⭐

**参考答案**：

- `@Controller`是Spring MVC的传统控制器注解，通常与视图技术（如JSP）配合使用。控制器方法可以返回`ModelAndView`或逻辑视图名，由`ViewResolver`解析为视图页面。
- `@RestController`是Spring 4.x引入的组合注解，相当于`@Controller`+`@ResponseBody`。它表示该控制器的所有方法都默认返回数据对象（如JSON/XML），而不是视图页面，适用于RESTful API开发。

```java
@Controller  // 需要配合视图解析器
public class ViewController {
    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("message", "Hello");
        return "hello";  // 返回视图名
    }
}

@RestController  // 所有方法都加了@ResponseBody
public class ApiController {
    @GetMapping("/api/hello")
    public Map<String, String> hello() {
        return Collections.singletonMap("message", "Hello");  // 直接返回JSON
    }
}
```

#### 第3题：请描述Spring MVC中从请求到响应的完整工作流程。

**难度**：⭐⭐⭐

**参考答案**：

Spring MVC的工作流程以DispatcherServlet为核心，分为以下步骤：

1. **客户端发送请求**：浏览器发送请求到服务器，如`/users/123`
2. **DispatcherServlet接收请求**：根据web.xml配置，DispatcherServlet拦截所有匹配的请求
3. **查找Handler**：DispatcherServlet调用HandlerMapping，根据请求URL找到对应的处理器（Controller）和拦截器，封装成HandlerExecutionChain
4. **选择HandlerAdapter**：DispatcherServlet遍历HandlerAdapter，找到能处理该处理器的适配器
5. **执行处理器**：HandlerAdapter调用处理器的方法，执行业务逻辑，返回ModelAndView
6. **处理异常**：如果执行过程中抛出异常，由HandlerExceptionResolver处理
7. **解析视图**：DispatcherServlet将ModelAndView传递给ViewResolver，ViewResolver解析得到具体的View对象
8. **渲染视图**：DispatcherServlet将Model数据填充到View中（视图渲染）
9. **响应客户端**：DispatcherServlet将渲染后的视图响应给客户端

**前后端分离场景下的简化流程**：
- 如果控制器使用了`@ResponseBody`，则不会经过ViewResolver
- HandlerAdapter直接使用HttpMessageConverter将返回值转换为JSON/XML
- 直接写入响应体返回给客户端

#### 第4题：@RequestMapping注解有哪些常用属性？请举例说明。

**难度**：⭐⭐⭐

**参考答案**：

`@RequestMapping`的常用属性包括：

| 属性 | 作用 | 示例 |
|------|------|------|
| `value`/`path` | 指定URL路径 | `@RequestMapping("/users")` |
| `method` | 指定HTTP方法 | `@RequestMapping(method=RequestMethod.GET)` |
| `params` | 限制请求必须包含的参数 | `@RequestMapping(params="action=save")` |
| `headers` | 限制请求必须包含的Header | `@RequestMapping(headers="content-type=application/json")` |
| `consumes` | 限制请求的Content-Type | `@RequestMapping(consumes="application/json")` |
| `produces` | 限制响应的Content-Type | `@RequestMapping(produces="application/json")` |

**示例**：
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    // 处理GET请求，必须包含id参数
    @RequestMapping(method = RequestMethod.GET, params = "id")
    public User getUserById(@RequestParam Long id) {
        return userService.findById(id);
    }
    
    // 处理POST请求，且Content-Type必须为application/json
    @RequestMapping(method = RequestMethod.POST, consumes = "application/json")
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    // 处理GET请求，且客户端Accept包含application/json
    @RequestMapping(method = RequestMethod.GET, produces = "application/json")
    public List<User> getUsers() {
        return userService.findAll();
    }
}
```

#### 第5题：Spring MVC中如何实现全局异常处理？请写出代码示例。

**难度**：⭐⭐⭐⭐

**参考答案**：

Spring MVC提供了多种异常处理方式，最推荐的是使用`@ControllerAdvice`（或`@RestControllerAdvice`）进行全局异常处理。

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    // 处理特定异常
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFound(UserNotFoundException ex) {
        log.warn("用户不存在: {}", ex.getMessage());
        return new ErrorResponse("USER_NOT_FOUND", ex.getMessage());
    }
    
    // 处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());
        log.warn("参数校验失败: {}", errors);
        return new ErrorResponse("VALIDATION_FAILED", String.join(", ", errors));
    }
    
    // 处理@RequestParam参数校验异常
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        return new ErrorResponse("INVALID_PARAMETER", message);
    }
    
    // 处理类型转换异常
    @ExceptionHandler({TypeMismatchException.class, NumberFormatException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleTypeMismatch(Exception ex) {
        return new ErrorResponse("INVALID_FORMAT", "参数格式错误");
    }
    
    // 处理所有未捕获的异常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        log.error("服务器内部错误", ex);
        return new ErrorResponse("INTERNAL_ERROR", "服务器内部错误，请稍后重试");
    }
    
    // 错误响应体
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ErrorResponse {
        private String code;
        private String message;
    }
}
```

**其他方式**：
1. **控制器内部异常处理**：使用`@ExceptionHandler`注解在控制器内部处理特定异常
2. **HandlerExceptionResolver接口**：实现该接口自定义异常处理逻辑
3. **SimpleMappingExceptionResolver**：在XML中配置异常与视图的映射

### 3道实战场景题

#### 场景1：RESTful API设计问题

**场景描述**：你在设计一个用户管理的RESTful API，需要对用户进行增删改查操作。请写出符合RESTful风格的Controller方法定义，包括URL路径、HTTP方法和注解使用。

**难度**：⭐⭐⭐

**参考思路**：

```java
@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * 查询所有用户（支持分页）
     * GET /api/v1/users?page=0&size=20&sort=name,asc
     */
    @GetMapping
    public Page<User> getUsers(
            @PageableDefault(size = 20, sort = "id") Pageable pageable,
            @RequestParam(required = false) String keyword) {
        return userService.findAll(keyword, pageable);
    }
    
    /**
     * 查询单个用户
     * GET /api/v1/users/{id}
     */
    @GetMapping("/{id}")
    public User getUser(@PathVariable @Min(1) Long id) {
        return userService.findById(id)
                .orElseThrow(() -> new UserNotFoundException("用户不存在，ID: " + id));
    }
    
    /**
     * 创建用户
     * POST /api/v1/users
     * Request Body: { "username": "zhangsan", "email": "zhang@example.com", "age": 25 }
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }
    
    /**
     * 更新用户（全量更新）
     * PUT /api/v1/users/{id}
     */
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return userService.update(id, request);
    }
    
    /**
     * 部分更新用户（例如只更新邮箱）
     * PATCH /api/v1/users/{id}/email
     * Request Body: { "email": "newemail@example.com" }
     */
    @PatchMapping("/{id}/email")
    public User updateEmail(@PathVariable Long id, @Valid @RequestBody EmailUpdateRequest request) {
        return userService.updateEmail(id, request.getEmail());
    }
    
    /**
     * 删除用户
     * DELETE /api/v1/users/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
    
    /**
     * 批量删除用户
     * DELETE /api/v1/users?ids=1,2,3
     */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUsers(@RequestParam List<Long> ids) {
        userService.deleteAll(ids);
    }
}
```

**RESTful设计原则体现**：
1. **资源通过URI标识**：`/api/v1/users/{id}`
2. **使用HTTP方法表达动作**：GET查询、POST创建、PUT全量更新、PATCH部分更新、DELETE删除
3. **无状态通信**：每个请求包含所有必要信息
4. **使用HTTP状态码**：200成功、201创建、204无内容、400错误、404未找到、500服务器错误

#### 场景2：文件上传功能实现

**场景描述**：你需要实现一个头像上传功能，前端上传文件到`/api/users/avatar`，后端需要限制文件大小为2MB，只支持jpg、png格式，并将文件保存到指定目录。请写出完整的Controller实现。

**难度**：⭐⭐⭐

**参考思路**：

```java
@RestController
@RequestMapping("/api/users")
public class UserAvatarController {
    
    private static final Logger log = LoggerFactory.getLogger(UserAvatarController.class);
    
    @Value("${upload.avatar.path:/uploads/avatars}")
    private String uploadPath;
    
    @Value("${upload.avatar.max-size:2097152}")  // 2MB
    private long maxSize;
    
    private final Set<String> allowedTypes = Set.of("image/jpeg", "image/png", "image/jpg");
    
    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        
        // 1. 校验文件是否为空
        if (file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }
        
        // 2. 校验文件大小
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("文件大小不能超过2MB");
        }
        
        // 3. 校验文件类型
        String contentType = file.getContentType();
        if (!allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException("只支持JPG和PNG格式");
        }
        
        // 4. 校验文件扩展名（额外安全校验）
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            if (!Set.of("jpg", "jpeg", "png").contains(extension)) {
                throw new IllegalArgumentException("文件扩展名不合法");
            }
        }
        
        try {
            // 5. 生成唯一文件名
            String extension = originalFilename != null 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            
            // 6. 创建日期目录（按年月分类）
            String datePath = new SimpleDateFormat("yyyy/MM/dd").format(new Date());
            Path targetPath = Paths.get(uploadPath, datePath, filename);
            
            // 7. 确保目录存在
            Files.createDirectories(targetPath.getParent());
            
            // 8. 保存文件
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            
            // 9. 生成可访问的URL
            String fileUrl = request.getScheme() + "://" + 
                           request.getServerName() + ":" + 
                           request.getServerPort() + 
                           "/avatars/" + datePath + "/" + filename;
            
            log.info("头像上传成功: {}", fileUrl);
            
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", filename,
                "size", String.valueOf(file.getSize())
            ));
            
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败，请稍后重试", e);
        }
    }
    
    /**
     * 删除头像
     */
    @DeleteMapping("/avatar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAvatar(@RequestParam String filename) {
        try {
            Path path = Paths.get(uploadPath, filename);
            Files.deleteIfExists(path);
            log.info("头像删除成功: {}", filename);
        } catch (IOException e) {
            log.error("头像删除失败", e);
            throw new RuntimeException("头像删除失败", e);
        }
    }
    
    /**
     * 配置文件上传大小限制
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(2));
        factory.setMaxRequestSize(DataSize.ofMegabytes(2));
        return factory.createMultipartConfig();
    }
    
    /**
     * 全局异常处理
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleIllegalArgument(IllegalArgumentException ex) {
        return Collections.singletonMap("error", ex.getMessage());
    }
}
```

**前端示例（JavaScript）**：
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/users/avatar', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log('上传成功:', data))
.catch(error => console.error('上传失败:', error));
```

#### 场景3：性能优化实战

**场景描述**：你的Spring MVC应用在某些接口上响应缓慢，通过分析发现，这些接口内部会调用多个外部服务，总耗时约800ms。用户反馈并发高时接口响应时间会飙升到3秒以上。作为架构师，你会如何优化？

**难度**：⭐⭐⭐⭐

**参考思路**：

这个问题考察的是**并发场景下的性能优化**。核心思路是将串行调用改为并行调用，减少总耗时。

**问题诊断**：
- 现象：并发高时响应时间飙升
- 原因：Tomcat线程池被占满，请求排队等待
- 本质：I/O密集型操作阻塞了容器线程

**方案一：使用CompletableFuture（Spring MVC 4.x+）**

```java
@RestController
@RequestMapping("/api/orders")
public class OrderDetailController {
    
    private final OrderService orderService;
    private final UserServiceClient userServiceClient;
    private final ProductServiceClient productServiceClient;
    private final Executor taskExecutor;
    
    public OrderDetailController(OrderService orderService,
                                UserServiceClient userServiceClient,
                                ProductServiceClient productServiceClient,
                                @Qualifier("asyncExecutor") Executor taskExecutor) {
        this.orderService = orderService;
        this.userServiceClient = userServiceClient;
        this.productServiceClient = productServiceClient;
        this.taskExecutor = taskExecutor;
    }
    
    @GetMapping("/{id}/detail")
    public CompletableFuture<OrderDetail> getOrderDetail(@PathVariable Long id) {
        // 1. 查询订单（串行）
        Order order = orderService.findById(id);
        if (order == null) {
            throw new OrderNotFoundException(id);
        }
        
        // 2. 并发调用用户服务和商品服务
        CompletableFuture<User> userFuture = 
            CompletableFuture.supplyAsync(() -> userServiceClient.getUser(order.getUserId()), taskExecutor);
        
        CompletableFuture<List<Product>> productsFuture = 
            CompletableFuture.supplyAsync(() -> productServiceClient.getProductsByOrderId(id), taskExecutor);
        
        // 3. 等待所有异步任务完成，组装结果
        return CompletableFuture.allOf(userFuture, productsFuture)
            .thenApply(v -> {
                OrderDetail detail = new OrderDetail();
                detail.setOrder(order);
                detail.setUser(userFuture.join());
                detail.setProducts(productsFuture.join());
                return detail;
            });
    }
    
    /**
     * 配置异步线程池
     */
    @Bean("asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

**方案二：使用DeferredResult（Spring MVC 3.2+）**

```java
@RestController
@RequestMapping("/api/orders")
public class OrderDeferredController {
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(20);
    
    @GetMapping("/{id}/detail")
    public DeferredResult<OrderDetail> getOrderDetail(@PathVariable Long id) {
        // 设置超时时间
        DeferredResult<OrderDetail> result = new DeferredResult<>(5000L);
        
        // 超时回调
        result.onTimeout(() -> {
            result.setErrorResult("请求超时");
        });
        
        // 使用线程池异步执行
        executorService.submit(() -> {
            try {
                // 串行获取订单
                Order order = orderService.findById(id);
                if (order == null) {
                    result.setErrorResult("订单不存在");
                    return;
                }
                
                // 并发调用两个服务
                CompletableFuture<User> userFuture = 
                    CompletableFuture.supplyAsync(() -> userServiceClient.getUser(order.getUserId()));
                CompletableFuture<List<Product>> productsFuture = 
                    CompletableFuture.supplyAsync(() -> productServiceClient.getProductsByOrderId(id));
                
                // 等待两个任务完成
                CompletableFuture.allOf(userFuture, productsFuture).join();
                
                // 组装结果
                OrderDetail detail = new OrderDetail();
                detail.setOrder(order);
                detail.setUser(userFuture.get());
                detail.setProducts(productsFuture.get());
                
                result.setResult(detail);
                
            } catch (Exception e) {
                result.setErrorResult("处理失败: " + e.getMessage());
            }
        });
        
        return result;
    }
    
    @PreDestroy
    public void cleanup() {
        executorService.shutdown();
    }
}
```

**方案三：使用Spring WebFlux（如果允许升级到Spring 5+）**

```java
@RestController
@RequestMapping("/api/orders")
public class OrderReactiveController {
    
    private final OrderRepository orderRepository;
    private final WebClient userWebClient;
    private final WebClient productWebClient;
    
    public Mono<OrderDetail> getOrderDetail(@PathVariable Long id) {
        return orderRepository.findById(id)
                .switchIfEmpty(Mono.error(new OrderNotFoundException(id)))
                .flatMap(order -> 
                    Mono.zip(
                        userWebClient.get()
                            .uri("/users/{id}", order.getUserId())
                            .retrieve()
                            .bodyToMono(User.class),
                        productWebClient.get()
                            .uri("/orders/{id}/products", order.getId())
                            .retrieve()
                            .bodyToFlux(Product.class)
                            .collectList()
                    ).map(tuple -> {
                        OrderDetail detail = new OrderDetail();
                        detail.setOrder(order);
                        detail.setUser(tuple.getT1());
                        detail.setProducts(tuple.getT2());
                        return detail;
                    })
                );
    }
    
    @Bean
    public WebClient userWebClient() {
        return WebClient.builder()
                .baseUrl("http://user-service")
                .build();
    }
}
```

**优化效果对比**：

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 平均响应时间 | 800ms | 300ms | 62.5% |
| 最大并发 | 200 | 800 | 300% |
| Tomcat线程占用 | 全程占用 | 仅初始查询占用 | 大幅降低 |
| 吞吐量 | 1000 req/s | 3000 req/s | 200% |

**关键点总结**：
1. **识别I/O密集型操作**：外部服务调用、数据库查询
2. **并行化处理**：将串行调用改为并发调用
3. **释放容器线程**：使用异步技术（Callable/DeferredResult）尽早释放Tomcat线程
4. **线程池隔离**：为异步任务配置独立线程池，避免影响核心业务
5. **超时控制**：设置合理的超时时间，避免资源耗尽


## 结语

从2004年到今天，Spring MVC走过了二十年的演进历程。从1.x的“接口实现+XML配置”到5.x的“注解驱动+RESTful+异步”，它始终扮演着Java Web开发中“连接器”的角色——连接前端与后端，连接HTTP协议与业务逻辑，连接开发者与生产力。

理解Spring MVC的演进历程，不仅是为了在面试中侃侃而谈，更是为了在实际开发中做出正确的技术选型，写出更优雅、更高效的代码。无论是维护老项目还是开启新项目，希望这篇超详细的梳理能为你提供有价值的参考。

技术不断向前，但Spring MVC的核心思想始终未变：**让开发者专注于业务逻辑，而非Web层的复杂性**。这或许正是它能统治Java Web开发近二十年的根本原因。


**参考资料**：
1. 在 Spring MVC 中使用混合注解和 XML 方法进行请求映射. springframework.org.cn, 2008. 
2. Spring 3 中的 REST：@MVC. springframework.org.cn, 2009. 
3. Spring MVC 处理异步请求-Spring MVC 4.2.4.RELEASE 中文文档. w3cschool. 
4. cockroachdb与spring webflux. 腾讯云开发者社区, 2024. 
5. 基于注解的控制器配置. php.cn. 
6. Spring 4.x官方参考文档中文版——第21章 Web MVC框架(12). CSDN, 2016. 
7. webflux. 腾讯云开发者社区, 2025. 
8. Spring MVC 与 JAX-RS 比较与分析. InfoQ, 2010. 