# API网关设计与实现

## 一、问题引入：微服务入口的治理难题

### 1.1 真实案例：网关重构之路

```
场景：微服务从10个扩展到100个，客户端调用混乱
问题：每个客户端需要维护大量服务地址

解决方案演进：
┌─────────────────────────────────────────────────────────────┐
│ 阶段1：直连模式（问题）                                      │
│ 客户端 → 服务A/服务B/服务C...                                │
│ - 客户端需要知道所有服务地址                                 │
│ - 认证逻辑分散在各服务                                       │
│ - 限流熔断难以统一管理                                       │
├─────────────────────────────────────────────────────────────┤
│ 阶段2：引入API网关                                           │
│ 客户端 → API网关 → 服务A/服务B/服务C...                      │
│ - 统一入口，客户端只需知道网关地址                           │
│ - 统一认证鉴权                                               │
│ - 统一流量控制                                               │
│ - 统一监控日志                                               │
└─────────────────────────────────────────────────────────────┘
```

## 二、API网关核心功能

```
API网关功能架构：
┌──────────────────────────────────────────────────────────────┐
│                        客户端请求                            │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 接入层                                                │   │
│  │ - 协议转换（HTTP/HTTPS/WebSocket/gRPC）              │   │
│  │ - 负载均衡                                            │   │
│  │ - SSL终止                                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 安全层                                                │   │
│  │ - 身份认证（JWT/OAuth2/API Key）                     │   │
│  │ - 权限鉴权（RBAC/ABAC）                              │   │
│  │ - 防刷限流                                            │   │
│  │ - WAF防护                                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 流量控制层                                            │   │
│  │ - 路由转发                                            │   │
│  │ - 限流熔断                                            │   │
│  │ - 灰度发布                                            │   │
│  │ - 服务降级                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 协议层                                                │   │
│  │ - 请求/响应转换                                       │   │
│  │ - 协议适配（REST/gRPC/Dubbo）                        │   │
│  │ - 数据格式转换（JSON/XML）                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│                        后端服务                              │
└──────────────────────────────────────────────────────────────┘
```

## 三、Spring Cloud Gateway实现

### 3.1 基础配置

```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        # 订单服务路由
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
            - name: Retry
              args:
                retries: 3
                statuses: BAD_GATEWAY
            - name: CircuitBreaker
              args:
                name: orderCircuitBreaker
                fallbackUri: forward:/fallback/order

        # 用户服务路由
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
            - Method=GET,POST
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-From,Gateway
            - RequestRateLimiter=
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20

      # 全局默认过滤器
      default-filters:
        - DedupeResponseHeader=Access-Control-Allow-Credentials Access-Control-Allow-Origin
        - AddResponseHeader=X-Gateway-Version,1.0

      # 全局跨域配置
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "https://example.com"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true
```

### 3.2 自定义过滤器

```java
/**
 * JWT认证过滤器
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 跳过白名单路径
        if (isWhiteList(request.getPath().value())) {
            return chain.filter(exchange);
        }

        // 获取Token
        String token = extractToken(request);
        if (token == null) {
            return unauthorized(exchange, "Missing token");
        }

        // 验证Token
        try {
            Claims claims = tokenProvider.validateToken(token);
            
            // 将用户信息传递到下游服务
            ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Roles", claims.get("roles").toString())
                .build();
            
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
            
        } catch (Exception e) {
            return unauthorized(exchange, "Invalid token");
        }
    }

    private String extractToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        String body = String.format("{\"error\":\"%s\"}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // 高优先级
    }
}
```

### 3.3 限流实现

```java
/**
 * 基于Redis的分布式限流
 */
@Component
public class RateLimiterConfig {

    @Bean
    public RedisRateLimiter redisRateLimiter(ReactiveRedisTemplate<String, String> redisTemplate) {
        return new RedisRateLimiter(10, 20); // replenishRate, burstCapacity
    }

    @Bean
    KeyResolver userKeyResolver() {
        // 按用户限流
        return exchange -> Mono.just(
            exchange.getRequest().getHeaders().getFirst("X-User-Id")
        );
    }

    @Bean
    KeyResolver ipKeyResolver() {
        // 按IP限流
        return exchange -> Mono.just(
            exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
        );
    }
}

/**
 * 自定义限流过滤器
 */
@Component
public class CustomRateLimiterFilter extends AbstractGatewayFilterFactory<CustomRateLimiterFilter.Config> {

    @Autowired
    private StringRedisTemplate redisTemplate;

    public CustomRateLimiterFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String key = "rate_limit:" + getClientId(exchange);
            
            Long current = redisTemplate.opsForValue().increment(key);
            if (current == 1) {
                redisTemplate.expire(key, config.getWindowSize(), TimeUnit.SECONDS);
            }
            
            if (current > config.getMaxRequests()) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                return exchange.getResponse().setComplete();
            }
            
            return chain.filter(exchange);
        };
    }

    @Data
    public static class Config {
        private int maxRequests = 100;
        private int windowSize = 60; // 秒
    }
}
```

## 四、Kong网关配置

```yaml
# kong.yml 声明式配置
_format_version: "3.0"

services:
  - name: order-service
    url: http://order-service:8080
    routes:
      - name: order-routes
        paths:
          - /api/orders
        strip_path: true
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: redis
          redis_host: redis
      - name: jwt
        config:
          uri_param_names: []
          cookie_names: []
          key_claim_name: iss
          secret_is_base64: false
          claims_to_verify:
            - exp
      - name: cors
        config:
          origins:
            - "https://example.com"
          methods:
            - GET
            - POST
            - PUT
            - DELETE
          headers:
            - Authorization
            - Content-Type
          max_age: 3600

  - name: user-service
    url: http://user-service:8080
    routes:
      - name: user-routes
        paths:
          - /api/users
    plugins:
      - name: key-auth
      - name: prometheus

consumers:
  - username: mobile-app
    jwt_secrets:
      - algorithm: HS256
        secret: "${JWT_SECRET}"
```

## 五、网关高可用设计

```
高可用架构：
┌──────────────────────────────────────────────────────────────┐
│                        负载均衡器                            │
│                     (Nginx/ALB/CLB)                          │
│                             │                                │
│              ┌──────────────┼──────────────┐                │
│              ▼              ▼              ▼                │
│        ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│        │ Gateway │◄──►│ Gateway │◄──►│ Gateway │           │
│        │   #1    │    │   #2    │    │   #3    │           │
│        └────┬────┘    └────┬────┘    └────┬────┘           │
│             │              │              │                 │
│             └──────────────┼──────────────┘                 │
│                            │                                │
│                     ┌──────┴──────┐                        │
│                     │   Consul    │                        │
│                     │  /Eureka    │                        │
│                     └─────────────┘                        │
│                            │                                │
│              ┌─────────────┼─────────────┐                  │
│              ▼             ▼             ▼                  │
│        ┌─────────┐   ┌─────────┐   ┌─────────┐             │
│        │Service A│   │Service B│   │Service C│             │
│        └─────────┘   └─────────┘   └─────────┘             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 六、网关监控指标

```
关键监控指标：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  性能指标：                                                  │
│  - 请求延迟（P50/P95/P99）                                   │
│  - 吞吐量（QPS）                                             │
│  - 错误率（4xx/5xx）                                         │
│                                                              │
│  资源指标：                                                  │
│  - CPU使用率                                                 │
│  - 内存使用率                                                │
│  - 连接数                                                    │
│                                                              │
│  业务指标：                                                  │
│  - 各路由请求量                                              │
│  - 限流触发次数                                              │
│  - 熔断触发次数                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**系列上一篇**：[微服务网络通信模式](09微服务网络通信模式.md)

**系列下一篇**：[网络安全防护体系](11网络安全防护体系.md)
