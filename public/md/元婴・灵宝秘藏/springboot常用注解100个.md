# Spring Boot 最常用100个注解终极详解（典藏版）

**本文目标**：提供一份完整、详细、可收藏的Spring Boot注解大全。涵盖**六大核心领域**的100个常用注解，每个注解都配有**详细的功能解析、使用场景、核心要点**，并用**加粗**标注重点。文末附赠10道高频面试题和10道实战场景题，助你彻底掌握。

> **阅读提示**：注解按领域分类，可直接跳转查阅。**加粗文字**为必须掌握的核心要点。

---

## 📚 一、核心容器（IoC与配置）· 20个

| 序号 | 注解 | 详细解析与重点 |
| :--- | :--- | :--- |
| 1 | **@SpringBootApplication** | **组合注解**，包含 `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`。标注在**主启动类**上，表示这是一个Spring Boot应用。**重点**：它会自动扫描主类所在包及其子包下的所有组件。 |
| 2 | **@Configuration** | 标注在类上，表明该类是一个 **配置类**，相当于传统的XML配置文件。类中可以定义多个 `@Bean` 方法。**重点**：配置类本身也会被Spring容器管理。 |
| 3 | **@EnableAutoConfiguration** | **开启自动配置**，Spring Boot会根据项目依赖的jar包自动配置Spring应用。例如，引入`spring-boot-starter-web`会自动配置Tomcat和Spring MVC。**底层原理**：通过 `@Import(AutoConfigurationImportSelector.class)` 加载 `META-INF/spring.factories` 中的自动配置类。 |
| 4 | **@ComponentScan** | 定义**组件扫描路径**，默认扫描主类所在包及其子包。可以自定义扫描包：`@ComponentScan("com.example")`。**重点**：如果定义的Bean扫描不到，检查该注解是否覆盖了正确包路径。 |
| 5 | **@Component** | 最通用的**Spring组件注解**，被标注的类会被自动注册为Bean。**重点**：它是所有特定组件注解（如`@Service`）的元注解。 |
| 6 | **@Service** | 标注**业务逻辑层**的类，是 `@Component` 的语义化特例。**重点**：虽然没有额外功能，但推荐使用以明确层次。 |
| 7 | **@Repository** | 标注**数据访问层**的类。除了注册Bean外，Spring还会自动将其抛出的持久层异常（如`SQLException`）转换为Spring的`DataAccessException`。**重点**：具有异常转换功能。 |
| 8 | **@Controller** | 标注**控制层**（Spring MVC控制器），通常返回视图页面（如Thymeleaf）。**重点**：若想返回JSON，需配合`@ResponseBody`使用。 |
| 9 | **@RestController** | **组合注解**，等于 `@Controller` + `@ResponseBody`。用于构建RESTful API，所有方法默认返回JSON/XML数据。**重点**：前后端分离项目中最常用的注解。 |
| 10 | **@Bean** | 标注在**方法**上，将方法的返回值注册为一个Spring Bean。通常与`@Configuration`配合使用，用于**引入第三方库组件**。**重点**：方法名默认为Bean的名称，可通过`name`属性指定。 |
| 11 | **@Autowired** | **按类型（byType）自动装配**依赖，是Spring最核心的DI注解。**重点**：当同一类型存在多个Bean时，需配合`@Qualifier`指定名称；也可标注在构造器上实现构造器注入（推荐）。 |
| 12 | **@Qualifier** | 配合 `@Autowired` 使用，当同一类型有多个Bean时，**按名称指定**具体注入哪个。**重点**：名称是`@Bean`的方法名或`@Component`的value值。 |
| 13 | **@Resource** | JSR-250标准注解，默认**按名称（byName）**装配，是`@Autowired`的替代方案。可通过`name`属性指定名称，若找不到名称，再按类型装配。**重点**：属于Java原生注解，与Spring解耦。 |
| 14 | **@Primary** | 当同一类型有多个Bean时，标注此注解的Bean拥有**最高优先级**，优先被`@Autowired`注入。**重点**：用于解决多Bean冲突，类似“首选”Bean。 |
| 15 | **@Scope** | 定义Bean的**作用域**。常用取值：`singleton`（单例，默认）、`prototype`（原型）、`request`（请求）、`session`（会话）。**重点**：单例Bean在容器启动时创建，原型Bean每次获取时创建。 |
| 16 | **@Lazy** | 针对单例Bean，默认在启动时创建，加上此注解后，改为**第一次使用时才创建**。**重点**：可用于减少启动时间或解决循环依赖。 |
| 17 | **@Value** | 从配置文件（`application.properties/yml`）中**注入单个值**，支持SpEL表达式（如`#{...}`）。**重点**：可用于注入字符串、整数、布尔等基本类型。 |
| 18 | **@ConfigurationProperties** | **批量绑定**配置文件中的属性（如指定`prefix="app"`）到一个Java Bean上，支持复杂类型（List、Map）和数据校验（结合`@Validated`）。**重点**：比`@Value`更适合管理一组相关配置。 |
| 19 | **@PropertySource** | 用于指定要加载的**外部配置文件**，如`@PropertySource("classpath:custom.properties")`。**重点**：通常与`@Configuration`配合使用，将自定义属性加载到环境变量中。 |
| 20 | **@Profile** | 指定Bean或配置在特定的**环境**（如`dev`、`test`、`prod`）中才生效。**重点**：通过`spring.profiles.active`激活环境，实现多环境配置隔离。 |

---

## 🌐 二、Web开发（MVC与REST）· 20个

| 序号 | 注解 | 详细解析与重点 |
| :--- | :--- | :--- |
| 21 | **@RequestMapping** | 映射HTTP请求路径到控制器方法。可通过`method`属性指定请求类型（GET、POST等），也可标注在类上定义父路径。**重点**：是最基础的请求映射注解，但日常推荐用简化版本。 |
| 22 | **@GetMapping** | 组合注解，等于 `@RequestMapping(method = RequestMethod.GET)`，处理GET请求。**重点**：语义清晰，推荐使用。 |
| 23 | **@PostMapping** | 处理POST请求，常用于创建资源。 |
| 24 | **@PutMapping** | 处理PUT请求，常用于更新资源。 |
| 25 | **@DeleteMapping** | 处理DELETE请求，常用于删除资源。 |
| 26 | **@PatchMapping** | 处理PATCH请求，用于部分更新资源。 |
| 27 | **@PathVariable** | 获取**URL路径模板**中的变量，如 `/users/{id}` 中的 `id`。**重点**：如果参数名与路径变量名不一致，需用`value`指定。 |
| 28 | **@RequestParam** | 获取**请求参数**（URL中的 `?key=value` 或表单数据`application/x-www-form-urlencoded`）。可设置`required`和`defaultValue`。**重点**：常用于GET请求的分页、过滤参数。 |
| 29 | **@RequestBody** | 接收**请求体**中的JSON/XML数据，并将其绑定到Java对象上。**重点**：一个请求只能有一个`@RequestBody`，且需要`HttpMessageConverter`支持（Spring Boot默认支持Jackson）。 |
| 30 | **@ResponseBody** | 将方法返回值**直接写入HTTP响应体**（通常是JSON），而非解析为视图路径。**重点**：`@RestController`已包含此注解，无需重复标注。 |
| 31 | **@RequestHeader** | 获取指定的**请求头**信息，如 `@RequestHeader("User-Agent") String userAgent`。 |
| 32 | **@CookieValue** | 获取指定的**Cookie**值，如 `@CookieValue("JSESSIONID") String sessionId`。 |
| 33 | **@SessionAttribute** | 从HTTP **Session** 中获取指定的属性值（通常用于获取之前存入Session的数据）。 |
| 34 | **@RequestAttribute** | 获取请求域（`request` scope）中的属性（通常由过滤器或拦截器设置）。 |
| 35 | **@ModelAttribute** | 将方法参数或返回值绑定到**Model**中，供视图渲染使用。也可用于在控制器方法执行前加载通用数据。**重点**：在参数上使用时，Spring会自动将请求参数绑定到该对象。 |
| 36 | **@SessionAttributes** | 将Model中的指定属性**临时存储到Session**中，实现跨请求共享（如购物车数据）。**重点**：标注在类上，指定属性名。 |
| 37 | **@CrossOrigin** | 开启**跨域访问**支持，可标注在类或方法上。可指定`origins`、`methods`等属性。**重点**：解决前后端分离开发中的跨域问题。 |
| 38 | **@ControllerAdvice** | **全局控制器增强**，常配合`@ExceptionHandler`做全局异常处理，也可配合`@InitBinder`实现全局数据绑定。**重点**：被标注的类会被扫描并应用于所有`@Controller`。 |
| 39 | **@RestControllerAdvice** | 组合注解，等于 `@ControllerAdvice` + `@ResponseBody`。用于处理全局异常并返回JSON数据，是REST API的最佳实践。 |
| 40 | **@ExceptionHandler** | 标注在方法上，声明该方法用于**处理指定类型的异常**。通常放在`@ControllerAdvice`类中，实现统一异常处理。**重点**：可以返回视图或JSON。 |

---

## 💾 三、数据访问（JPA/MyBatis/事务）· 25个

| 序号 | 注解 | 详细解析与重点 |
| :--- | :--- | :--- |
| 41 | **@Transactional** | **声明式事务管理**的核心，标注在类或方法上，开启数据库事务。**重点**：注意失效场景（非public、内部调用、异常被捕获、异常类型不匹配）。可通过`propagation`、`isolation`、`rollbackFor`等属性精细控制。 |
| 42 | **@Entity** | JPA注解，标识一个**JPA实体类**，与数据库表映射。**重点**：需要有无参构造器。 |
| 43 | **@Table** | 指定实体类对应的**数据库表名**（当表名与类名不同时使用）。如`@Table(name = "t_user")`。 |
| 44 | **@Id** | JPA注解，标注实体类的**主键**字段。 |
| 45 | **@GeneratedValue** | 配置主键的**生成策略**，如`strategy = GenerationType.IDENTITY`（自增）、`SEQUENCE`、`AUTO`。 |
| 46 | **@Column** | 映射实体字段与数据库表的**列名**（当字段名与列名不同时）。也可指定长度、是否可为空等属性。 |
| 47 | **@Transient** | 标注该字段**不参与**数据库表字段的映射，即忽略该字段。 |
| 48 | **@Temporal** | 用于配置`java.util.Date`或`Calendar`类型的字段在数据库中的**精度**（DATE、TIME、TIMESTAMP）。 |
| 49 | **@OneToOne** | JPA实体关系注解，标识**一对一**关联。常用属性：`cascade`（级联操作）、`fetch`（加载策略）、`mappedBy`（被拥有方指向拥有方）。 |
| 50 | **@OneToMany** | 标识**一对多**关联。常用属性：`mappedBy`（指向多方的关联字段）、`cascade`、`fetch`。 |
| 51 | **@ManyToOne** | 标识**多对一**关联（最常用）。通常配合`@JoinColumn`指定外键列。**重点**：默认`fetch = FetchType.EAGER`（立即加载），注意N+1问题。 |
| 52 | **@ManyToMany** | 标识**多对多**关联。常与`@JoinTable`指定中间表。 |
| 53 | **@JoinColumn** | 指定关联表之间的**外键列名**。常与`@ManyToOne`或`@OneToOne`配合使用。 |
| 54 | **@JoinTable** | 用于多对多关系，指定**中间连接表**的信息，包括表名、关联列等。 |
| 55 | **@Query** | JPA中定义**自定义查询**（JPQL或原生SQL）。**重点**：使用`@Query("select u from User u where u.name = :name")`。 |
| 56 | **@Modifying** | 与`@Query`配合使用，表示该查询是**更新或删除**操作，需要触发事务（通常还要加上`@Transactional`）。 |
| 57 | **@EnableJpaRepositories** | 启用JPA仓库，并指定扫描`Repository`接口的包路径（通常在配置类上使用）。 |
| 58 | **@Mapper** | MyBatis注解，标记一个接口为**Mapper接口**，用于生成SQL映射代理。**重点**：需要在启动类上添加`@MapperScan`或在每个接口上加此注解。 |
| 59 | **@MapperScan** | 启用MyBatis Mapper扫描，指定扫描接口的包路径（替代在每个接口上加`@Mapper`）。**重点**：通常加在启动类或配置类上。 |
| 60 | **@Select** | MyBatis注解，直接写在接口方法上，定义**查询SQL**。如`@Select("SELECT * FROM user WHERE id = #{id}")`。 |
| 61 | **@Insert** | 定义**插入SQL**。 |
| 62 | **@Update** | 定义**更新SQL**。 |
| 63 | **@Delete** | 定义**删除SQL**。 |
| 64 | **@Options** | 配置MyBatis操作的选项，如获取自增主键值：`@Options(useGeneratedKeys = true, keyProperty = "id")`。 |
| 65 | **@Param** | 为MyBatis SQL 中的参数**指定名称**，尤其是多参数时。如`List<User> findByCondition(@Param("name") String name, @Param("age") Integer age)`。 |

---

## 🔐 四、安全与控制（Spring Security & 条件）· 15个

| 序号 | 注解 | 详细解析与重点 |
| :--- | :--- | :--- |
| 66 | **@EnableWebSecurity** | 启用Spring Security的Web安全支持，通常与`WebSecurityConfigurerAdapter`一起使用（Spring Security 5.7+后推荐基于组件的方式）。 |
| 67 | **@EnableGlobalMethodSecurity** | 启用**方法级别**的安全控制，如`@PreAuthorize`、`@Secured`。常用属性：`prePostEnabled = true`（启用`@PreAuthorize`等）、`securedEnabled = true`（启用`@Secured`）。 |
| 68 | **@PreAuthorize** | **方法执行前**进行权限校验，如`@PreAuthorize("hasRole('ADMIN')")`。**重点**：支持SpEL表达式，功能强大。 |
| 69 | **@PostAuthorize** | **方法执行后**进行权限校验，常用于校验返回结果（如检查用户是否有权查看该数据）。 |
| 70 | **@PreFilter** | 对方法参数进行过滤，通常用于集合参数，过滤掉不符合权限的元素。 |
| 71 | **@PostFilter** | 对方法返回的集合进行过滤，返回给调用者前剔除不符合权限的元素。 |
| 72 | **@Secured** | 基于角色的访问控制（较老的方式），如`@Secured("ROLE_ADMIN")`。**重点**：只能使用角色名，不支持表达式。 |
| 73 | **@RolesAllowed** | JSR-250标准，作用和`@Secured`类似，但属于Java EE标准。 |
| 74 | **@AuthenticationPrincipal** | 在Controller参数中获取当前**认证用户详情**。如`public String getInfo(@AuthenticationPrincipal UserDetails userDetails)`。 |
| 75 | **@Conditional** | Spring底层**条件注解**的基础，根据条件决定是否加载Bean。开发者可以实现`Condition`接口自定义条件。 |
| 76 | **@ConditionalOnClass** | 当类路径下**存在**指定类时，配置生效。常用于自动配置。 |
| 77 | **@ConditionalOnMissingClass** | 当类路径下**不存在**指定类时，配置生效。 |
| 78 | **@ConditionalOnBean** | 当容器中**存在**指定Bean时，配置生效。 |
| 79 | **@ConditionalOnMissingBean** | 当容器中**不存在**指定Bean时，配置生效（常用于覆盖默认配置）。 |
| 80 | **@ConditionalOnProperty** | 根据配置文件中的**属性值**决定是否加载。如`@ConditionalOnProperty(name = "my.feature.enabled", havingValue = "true")`，实现功能开关。 |

---

## ⚡ 五、异步与任务调度 · 10个

| 序号 | 注解 | 详细解析与重点 |
| :--- | :--- | :--- |
| 81 | **@EnableAsync** | 开启Spring的**异步方法**执行能力。通常在配置类或启动类上添加。 |
| 82 | **@Async** | 标注方法为**异步方法**，调用后会立即返回，实际逻辑在线程池中执行。**重点**：需要配合`@EnableAsync`使用；注意内部调用失效；建议自定义线程池。 |
| 83 | **@EnableScheduling** | 开启Spring的**定时任务**支持。 |
| 84 | **@Scheduled** | 标注方法为**定时任务**，支持cron表达式、`fixedRate`、`fixedDelay`等。**重点**：默认使用单线程池执行，长任务会阻塞其他任务；建议自定义`TaskScheduler`。 |
| 85 | **@EnableJms** | 开启对JMS（Java消息服务）的支持，用于消息队列。 |
| 86 | **@JmsListener** | 标注方法为JMS消息的**监听器**，当消息到达时自动调用。 |
| 87 | **@EnableRabbit** | 开启对RabbitMQ的支持。 |
| 88 | **@RabbitListener** | 标注方法为RabbitMQ消息的**监听器**。 |
| 89 | **@KafkaListener** | 标注方法为Kafka消息的**监听器**。 |
| 90 | **@EnableWebSocket** | 开启对WebSocket的支持，用于实时通信。 |

---

## 🧪 六、测试与扩展 · 10个

| 序号 | 注解 | 详细解析与重点 |
| :--- | :--- | :--- |
| 91 | **@SpringBootTest** | 启动**完整的Spring Boot应用上下文**进行集成测试。**重点**：会加载所有Bean，适合整体功能测试。 |
| 92 | **@WebMvcTest** | **切片测试**，仅加载Web层（Controller）相关Bean，用于Controller层单元测试。**重点**：需要配合`@MockBean`模拟Service层。 |
| 93 | **@DataJpaTest** | 切片测试，仅加载JPA相关组件（如`@Repository`），用于Repository层测试。默认使用嵌入式数据库。 |
| 94 | **@JsonTest** | 切片测试，仅加载JSON相关组件（如Jackson），用于测试JSON序列化/反序列化。 |
| 95 | **@MockBean** | 在测试上下文中，为指定的Bean创建并注入一个**Mock对象**（基于Mockito）。**重点**：用于替换真实Bean，隔离依赖。 |
| 96 | **@SpyBean** | 在测试上下文中，创建并注入一个**Spy对象**（部分模拟），真实方法会被调用，但可以验证或存根。 |
| 97 | **@Sql** | 在测试方法执行前后，执行指定的**SQL脚本**初始化或清理数据。可指定`executionPhase`（前/后）。 |
| 98 | **@DirtiesContext** | 标记测试方法或类会 **“污染”** 应用上下文，执行后Spring会重新加载上下文。用于测试对上下文有副作用的操作。 |
| 99 | **@EnableSwagger2** | 启用Swagger 2 在线接口文档（已过时，新项目推荐使用SpringDoc OpenAPI）。 |
| 100| **@ApiOperation** | Swagger注解，标注在方法上，描述一个API接口的用途和参数。 |

---

## 📝 附录：10道高频面试题 + 10道实战场景题

### 面试题精选（含答案）

**1. 问：`@SpringBootApplication` 中的 `@EnableAutoConfiguration` 是如何实现自动配置的？**

**答：** `@EnableAutoConfiguration` 通过 `@Import(AutoConfigurationImportSelector.class)` 导入一批自动配置类。`AutoConfigurationImportSelector` 会扫描所有jar包下的 `META-INF/spring.factories`（或2.7后的 `AutoConfiguration.imports`）文件，将其中的 `XxxAutoConfiguration` 类加载为候选配置。这些候选类上通常带有 `@ConditionalOnXxx` 注解，**只有当条件满足（如存在对应的类、Bean或配置属性）时，该自动配置类才会真正生效**，从而完成自动配置。

**2. 问：`@Autowired` 和 `@Resource` 在注入时的核心区别是什么？**

**答：** 区别有三点：
- **来源不同**：`@Autowired` 是Spring定义的，`@Resource` 是JSR-250标准（Java EE）定义的。
- **装配方式不同**：`@Autowired` 默认**按类型（byType）**装配；`@Resource` 默认**按名称（byName）**装配，如果找不到名称，则回退为按类型装配。
- **解决冲突的方式不同**：当同一类型有多个Bean时，`@Autowired` 需配合 `@Qualifier` 按名称指定；`@Resource` 可通过 `name` 属性直接指定名称。

**3. 问：`@Transactional` 注解在哪些典型场景下会失效？**

**答：** 常见失效场景：
- **非public方法**：`@Transactional` 标注在非public方法上，Spring无法生成代理，事务失效。
- **同类内部调用**：同一个类中的方法A（无事务）调用方法B（有`@Transactional`），由于调用的是`this`对象（原始对象）而非代理对象，事务拦截器无法生效。
- **异常被捕获且未抛出**：在方法内用`try-catch`捕获了异常，但没有抛出，Spring无法感知异常，不会回滚。
- **异常类型不匹配**：默认只回滚`RuntimeException`和`Error`，如果抛出的是受检异常（如`IOException`），事务不会回滚。可通过`rollbackFor = Exception.class`解决。
- **数据库引擎不支持事务**：如MySQL的MyISAM引擎不支持事务。

**4. 问：`@Configuration` 注解的 `proxyBeanMethods = false` 有什么作用？**

**答：** 设置`proxyBeanMethods = false`开启 **Lite 模式**。在Lite模式下，配置类不会被CGLIB代理，`@Bean`方法调用不会经过代理拦截，每次调用都会返回一个新的对象（如果方法内有`new`操作）。**优点**是启动速度更快、开销更小，适合配置类内部没有`@Bean`方法互相调用的场景。默认是`true`（Full模式），保证单例Bean的依赖关系。

**5. 问：`@PostConstruct` 和 `@Autowired` 的执行顺序是怎样的？**

**答：** 顺序是：**构造方法 → `@Autowired`（属性注入） → `@PostConstruct`（初始化前回调）**。因此，在构造方法中无法使用被`@Autowired`注入的Bean，而在`@PostConstruct`方法中可以安全使用。

**6. 问：`@ConditionalOnMissingBean` 注解在自动配置中扮演什么角色？**

**答：** 它是实现 **“用户自定义覆盖默认配置”** 的关键。例如在`RedisAutoConfiguration`中，先判断容器中是否存在`RedisTemplate` Bean，如果不存在（即用户没有自定义），`@ConditionalOnMissingBean(RedisTemplate.class)`条件成立，自动配置类才会创建默认的`RedisTemplate` Bean。这样既保证了开箱即用，又允许用户自定义覆盖。

**7. 问：`@RequestBody` 和 `@RequestParam` 都可以接收参数，它们的底层实现有何不同？**

**答：** `@RequestParam` 从 `HttpServletRequest` 的 `getParameterMap()` 获取值，处理的是`application/x-www-form-urlencoded`编码的请求体或URL参数。`@RequestBody` 通过 `HttpMessageConverter` 从 `request.getInputStream()` 中读取请求体字节流，并根据`Content-Type`（如`application/json`）将其反序列化为Java对象。

**8. 问：`@RestControllerAdvice` 为什么能处理全局异常？**

**答：** 因为`@RestControllerAdvice` 被`@Component`标注，会被Spring扫描并注册为Bean。Spring MVC在初始化时，会从容器中查找所有带有`@ControllerAdvice`或`@RestControllerAdvice`的Bean，提取其中用`@ExceptionHandler`标注的方法，将其注册为全局异常处理器，当控制器抛出异常时，就会调用这些方法。

**9. 问：`@Async` 方法默认使用的线程池有什么问题？应该如何改进？**

**答：** 默认使用`SimpleAsyncTaskExecutor`，它**不是真正的线程池，每次执行都会创建新线程**，在高并发下可能导致资源耗尽。**改进**：在配置类中自定义一个`TaskExecutor` Bean，如`ThreadPoolTaskExecutor`，设置核心线程数、最大线程数、队列容量等参数。

**10. 问：`@Scheduled` 定时任务如果执行时间过长，会有什么后果？**

**答：** 默认情况下，所有`@Scheduled`任务共用一个**单线程的调度器**。如果一个任务执行时间过长，会阻塞后续所有定时任务的准时执行，导致任务堆积或延迟。**解决方法**：自定义一个`TaskScheduler` Bean，配置合适的线程池大小（如`ThreadPoolTaskScheduler`），让不同任务可以并发执行。

---

### 实战场景题（含思路）

**1. 场景：项目启动时需要从数据库加载配置到Redis缓存。**

**思路：** 创建一个`@Component`类，在`@PostConstruct`方法中注入`Service`查询数据库，然后将数据存入Redis。`@PostConstruct`保证在Bean初始化完成后立即执行。

**2. 场景：自定义Starter，希望用户配置 `my.service.enabled=true` 时才加载Bean。**

**思路：** 在自动配置类上使用`@ConditionalOnProperty(name = "my.service.enabled", havingValue = "true")`，这样只有当配置文件中该属性为true时，配置类才会生效。

**3. 场景：Service层内部方法调用 `@Transactional` 方法，事务不生效。**

**思路：** 内部调用失效，需通过代理对象调用。方案一：将两个方法拆分到不同的Service类中。方案二：在当前类中注入自己的代理（`@Autowired private UserService self;`），然后用`self.methodB()`调用。方案三：启用`@EnableAspectJAutoProxy(exposeProxy = true)`，然后用`AopContext.currentProxy()`获取代理对象。

**4. 场景：想要统计每个Controller方法的执行时间，不侵入业务代码。**

**思路：** 定义一个`@Aspect`切面，使用`@Around("@within(org.springframework.web.bind.annotation.RestController)")`作为切点，环绕通知中记录开始时间，执行方法，再记录结束时间并打印耗时。

**5. 场景：想把配置文件中的 `custom.upload.path` 注入到一个工具类的静态变量中。**

**思路：** `@Value`不能直接注入静态变量。可在工具类中提供一个非静态的setter方法，标注`@Value`，然后将值赋给静态变量。
```java
@Component
public class FileUtil {
    private static String uploadPath;
    @Value("${custom.upload.path}")
    public void setUploadPath(String path) {
        FileUtil.uploadPath = path;
    }
}
```

**6. 场景：开发和生产环境需要配置不同的数据源。**

**思路：** 使用`@Profile`注解。分别定义两个配置类或两个`@Bean`方法，一个标注`@Profile("dev")`，另一个标注`@Profile("prod")`。然后在不同环境中通过`spring.profiles.active`激活对应profile。

**7. 场景：应用启动报错 `Consider defining a bean of type 'XxxService' in your configuration.`**

**思路：** 这是Bean未定义的错误。排查步骤：1. 检查`XxxService`类上是否有`@Service`或`@Component`注解。2. 检查该类是否在主启动类的子包下，确保被`@ComponentScan`扫描到。3. 如果是通过`@Bean`配置，检查配置类是否被扫描或导入。

**8. 场景：想写一个通用的Redis操作组件 `RedisUtils`，交给Spring管理。**

**思路：** 创建一个`@Configuration`类，在里面定义一个`@Bean`方法返回`RedisUtils`实例。方法参数可以自动注入`StringRedisTemplate`等依赖。
```java
@Configuration
public class RedisConfig {
    @Bean
    public RedisUtils redisUtils(StringRedisTemplate redisTemplate) {
        return new RedisUtils(redisTemplate);
    }
}
```

**9. 场景：前端传参字段名是 `user-name`，后端实体类是 `userName`，接收不到值。**

**思路：** 在Controller方法参数前使用`@RequestParam("user-name")`显式映射；或在使用`@RequestBody`的实体类字段上加`@JsonProperty("user-name")`注解（Jackson）。

**10. 场景：单元测试时只想测试Controller层，不想加载整个Spring上下文。**

**思路：** 使用`@WebMvcTest(YourController.class)`注解，它只会加载Web层相关组件。对于Service层依赖，用`@MockBean`创建Mock对象并模拟其行为，实现Controller层的独立单元测试。

---

**结语**：本文梳理了Spring Boot最常用的100个注解，并深入讲解了核心注解的底层原理。希望这份清单能成为你开发路上的得力助手。掌握这些注解，你就掌握了Spring Boot开发的精髓。