黑马小兔鲜儿是一个**生鲜电商项目**，主打生鲜商品销售，包含首页商品展示、分类导航、商品详情、购物车、用户中心等核心功能。Day1 的重点是搭建项目基础架构、实现核心环境配置，并完成**用户登录**和**首页商品展示**的基础功能。以下是超详细解析：

### 一、项目介绍与技术栈

#### 1. 项目定位

- 类型：生鲜电商平台（B2C 模式），面向 C 端用户提供生鲜商品购买服务。
- 核心模块：首页商品推荐、分类导航、商品搜索、购物车、订单管理、用户中心等。
- 开发阶段：Day1 聚焦**环境搭建**和**基础功能落地**（登录、首页数据展示）。

#### 2. 技术栈

| 方向     | 技术 / 工具                      | 说明                                  |
| -------- | -------------------------------- | ------------------------------------- |
| 前端     | Vue3 + Vite + TypeScript         | 构建用户界面，TypeScript 保证类型安全 |
| 前端生态 | Vue Router 4 + Pinia + Axios     | 路由管理、状态管理、HTTP 请求         |
| 样式方案 | Less + CSS Modules               | 模块化样式，避免冲突                  |
| 后端     | Spring Boot 2.7.x + MyBatis-Plus | 后端接口开发，简化数据库操作          |
| 数据库   | MySQL 8.0                        | 存储商品、用户、订单等数据            |
| 开发工具 | VSCode（前端）+ IDEA（后端）     | 代码编写与调试                        |
| 接口测试 | Postman                          | 验证后端接口正确性                    |

### 二、环境搭建（前后端）

#### 1. 前端项目初始化（Vue3 + Vite）

##### （1）创建项目

bash











```bash
# 安装Vite（若未安装）
npm install -g create-vite

# 创建项目（项目名：rabbit-shop，模板：vue-ts）
create-vite rabbit-shop --template vue-ts

# 进入项目目录
cd rabbit-shop

# 安装依赖
npm install

# 安装核心依赖
npm install vue-router@4 pinia axios less less-loader @types/node -S
```

##### （2）项目结构设计

plaintext











```plaintext
rabbit-shop/
├── public/               # 静态资源（favicon、图标等）
├── src/
│   ├── api/              # 接口请求封装（axios实例、API函数）
│   ├── assets/           # 静态资源（图片、样式、字体）
│   ├── components/       # 公共组件（Button、Input、Navbar等）
│   ├── pages/            # 页面组件（Login、Home、Category等）
│   ├── router/           # 路由配置（index.ts）
│   ├── store/            # Pinia状态管理（user、cart等）
│   ├── types/            # TypeScript类型定义（接口、实体）
│   ├── utils/            # 工具函数（时间格式化、本地存储等）
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── vite-env.d.ts     # Vite类型声明
├── .eslintrc.js          # ESLint配置
├── tsconfig.json         # TypeScript配置
└── vite.config.ts        # Vite配置
```

##### （3）Vite 配置（`vite.config.ts`）

解决路径别名、跨域等问题：

typescript











```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // 别名@指向src目录
    }
  },
  server: {
    port: 3000,                // 前端启动端口
    open: true,                // 自动打开浏览器
    proxy: {                   // 跨域代理（对接后端接口）
      '/api': {
        target: 'http://localhost:8080',  // 后端接口地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

#### 2. 后端项目初始化（Spring Boot）

##### （1）通过 IDEA 创建项目

- 选择

  ```
  Spring Initializr
  ```

  ，设置：

  - 项目类型：Maven
  - 语言：Java
  - Spring Boot 版本：2.7.10
  - Group：com.rabbit
  - Artifact：rabbit-shop-api
  - 依赖：`Spring Web`、`MyBatis-Plus`、`MySQL Driver`、`Lombok`、`Validation`

##### （2）项目结构

plaintext











```plaintext
rabbit-shop-api/
├── src/main/java/com/rabbit/
│   ├── config/           # 配置类（MyBatis-Plus、跨域等）
│   ├── controller/       # 控制器（用户、商品接口）
│   ├── entity/           # 实体类（User、Goods等）
│   ├── mapper/           # Mapper接口（操作数据库）
│   ├── service/          # 服务层（业务逻辑）
│   │   └── impl/         # 服务实现类
│   ├── common/           # 通用类（返回结果、异常等）
│   └── RabbitShopApiApplication.java  # 启动类
├── src/main/resources/
│   ├── application.yml   # 核心配置文件
│   └── mapper/           # MyBatis映射文件（xml）
└── pom.xml               # 依赖管理
```

##### （3）核心配置（`application.yml`）

yaml











```yaml
server:
  port: 8080  # 后端端口

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/rabbit_shop?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: root  # 替换为自己的MySQL密码

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml  # Mapper.xml路径
  type-aliases-package: com.rabbit.entity  # 实体类别名包
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 打印SQL日志
  global-config:
    db-config:
      id-type: auto  # 主键自增

# 日志配置
logging:
  level:
    com.rabbit.mapper: debug  # Mapper接口日志级别
```

### 三、数据库设计（核心表）

#### 1. 创建数据库

sql











```sql
CREATE DATABASE IF NOT EXISTS rabbit_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rabbit_shop;
```

#### 2. 核心表结构

##### （1）用户表（`user`）

sql











```sql
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名（登录账号）',
  `password` varchar(100) NOT NULL COMMENT '密码（加密存储）',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态（1-正常，0-禁用）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)  # 用户名唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

##### （2）商品表（`goods`）

sql











```sql
CREATE TABLE `goods` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `image` varchar(255) NOT NULL COMMENT '商品主图',
  `sales` int(11) NOT NULL DEFAULT 0 COMMENT '销量',
  `stock` int(11) NOT NULL COMMENT '库存',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态（1-上架，0-下架）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

##### （3）商品分类表（`category`）

sql











```sql
CREATE TABLE `category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `icon` varchar(255) DEFAULT NULL COMMENT '分类图标',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序（数字越小越靠前）',
  `parent_id` bigint(20) DEFAULT 0 COMMENT '父分类ID（0-一级分类）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';
```

### 四、核心功能实现（Day1 重点）

#### 1. 通用模块（前后端）

##### （1）后端统一返回结果（`R.java`）

java











```java
package com.rabbit.common;

import lombok.Data;

@Data
public class R<T> {
    private Integer code;  // 1-成功，0-失败
    private String msg;    // 消息
    private T data;        // 数据

    // 成功返回
    public static <T> R<T> success(T data) {
        R<T> r = new R<>();
        r.code = 1;
        r.data = data;
        return r;
    }

    // 失败返回
    public static <T> R<T> error(String msg) {
        R<T> r = new R<>();
        r.code = 0;
        r.msg = msg;
        return r;
    }
}
```

##### （2）前端 Axios 封装（`src/api/request.ts`）

typescript











```typescript
import axios from 'axios';
import { ElMessage } from 'element-plus'; // 后续会引入Element Plus，先简化

// 创建实例
const request = axios.create({
  baseURL: '/api',  // 对应Vite的proxy配置
  timeout: 5000
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 后续添加token：config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) { // 后端返回失败
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(res.msg);
    }
    return res.data; // 返回成功数据
  },
  (error) => {
    ElMessage.error('网络错误，请稍后重试');
    return Promise.reject(error);
  }
);

export default request;
```

#### 2. 用户登录功能（前后端）

##### （1）后端实现

###### ① 实体类（`User.java`）

java











```java
package com.rabbit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String phone;
    private String avatar;
    private Integer status;

    @TableField(value = "create_time")
    private LocalDateTime createTime;
    @TableField(value = "update_time")
    private LocalDateTime updateTime;
}
```

###### ② Mapper 接口（`UserMapper.java`）

java











```java
package com.rabbit.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.rabbit.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 继承BaseMapper，自带CRUD方法
}
```

###### ③ 服务层（`UserService.java`及实现）

java











```java
// 接口
package com.rabbit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.rabbit.entity.User;
import com.rabbit.common.R;

public interface UserService extends IService<User> {
    R<User> login(String username, String password);
}

// 实现类
package com.rabbit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rabbit.entity.User;
import com.rabbit.mapper.UserMapper;
import com.rabbit.service.UserService;
import com.rabbit.common.R;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public R<User> login(String username, String password) {
        // 1. 查询用户
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, username);
        User user = baseMapper.selectOne(queryWrapper);

        // 2. 验证用户是否存在
        if (user == null) {
            return R.error("用户名不存在");
        }

        // 3. 验证密码（MD5加密）
        String md5Password = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!user.getPassword().equals(md5Password)) {
            return R.error("密码错误");
        }

        // 4. 验证账号状态
        if (user.getStatus() == 0) {
            return R.error("账号已禁用");
        }

        // 5. 登录成功（后续会生成token，Day1简化为返回用户信息）
        return R.success(user);
    }
}
```

###### ④ 控制器（`UserController.java`）

java











```java
package com.rabbit.controller;

import com.rabbit.common.R;
import com.rabbit.entity.User;
import com.rabbit.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor  // Lombok注入依赖
public class UserController {

    private final UserService userService;

    @PostMapping("/user/login")
    public R<User> login(
            @RequestParam String username,
            @RequestParam String password
    ) {
        return userService.login(username, password);
    }
}
```

##### （2）前端实现

###### ① 登录 API（`src/api/user.ts`）

typescript











```typescript
import request from './request';

// 登录请求
export const loginApi = (username: string, password: string) => {
  return request.post('/user/login', { username, password });
};
```

###### ② 登录页面组件（`src/pages/Login.vue`）

vue











```vue
<template>
  <div class="login-container">
    <div class="login-box">
      <h2>小兔鲜儿 - 登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="username" 
            required
            placeholder="请输入用户名"
          >
        </div>
        <div class="form-item">
          <label>密码</label>
          <input 
            type="password" 
            v-model="password" 
            required
            placeholder="请输入密码"
          >
        </div>
        <button type="submit" class="login-btn">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginApi } from '@/api/user';

const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const user = await loginApi(username.value, password.value);
    // 存储用户信息（后续用Pinia，Day1简化）
    localStorage.setItem('user', JSON.stringify(user));
    // 跳转到首页
    router.push('/');
  } catch (error) {
    // 错误信息由Axios拦截器处理
  }
};
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;

  .login-box {
    width: 350px;
    padding: 30px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);

    h2 {
      text-align: center;
      margin-bottom: 20px;
      color: #333;
    }

    .form-item {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        color: #666;
      }

      input {
        width: 100%;
        height: 40px;
        padding: 0 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        outline: none;
        &:focus {
          border-color: #42b983;
        }
      }
    }

    .login-btn {
      width: 100%;
      height: 40px;
      background-color: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        background-color: #359e75;
      }
    }
  }
}
</style>
```

###### ③ 路由配置（`src/router/index.ts`）

typescript











```typescript
import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Home from '@/pages/Home.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: Home }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

#### 3. 首页商品展示（基础）

##### （1）后端商品列表接口

###### ① 商品实体类（`Goods.java`）

java











```java
package com.rabbit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Goods {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    @TableField("category_id")
    private Long categoryId;
    private BigDecimal price;
    @TableField("original_price")
    private BigDecimal originalPrice;
    private String image;
    private Integer sales;
    private Integer stock;
    private Integer status;
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
}
```

###### ② 商品 Service 与 Controller

java











```java
// GoodsService.java
package com.rabbit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.rabbit.entity.Goods;
import com.rabbit.common.R;

import java.util.List;

public interface GoodsService extends IService<Goods> {
    R<List<Goods>> getHomeGoods(); // 获取首页商品
}

// GoodsServiceImpl.java
package com.rabbit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rabbit.entity.Goods;
import com.rabbit.mapper.GoodsMapper;
import com.rabbit.service.GoodsService;
import com.rabbit.common.R;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Override
    public R<List<Goods>> getHomeGoods() {
        // 查询上架商品（status=1），按销量降序取前8条
        LambdaQueryWrapper<Goods> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Goods::getStatus, 1)
                    .orderByDesc(Goods::getSales)
                    .last("limit 8");
        List<Goods> goodsList = baseMapper.selectList(queryWrapper);
        return R.success(goodsList);
    }
}

// GoodsController.java
package com.rabbit.controller;

import com.rabbit.common.R;
import com.rabbit.entity.Goods;
import com.rabbit.service.GoodsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GoodsController {

    private final GoodsService goodsService;

    @GetMapping("/goods/home")
    public R<List<Goods>> getHomeGoods() {
        return goodsService.getHomeGoods();
    }
}
```

##### （2）前端首页组件

###### ① 商品 API（`src/api/goods.ts`）

typescript











```typescript
import request from './request';

// 获取首页商品
export const getHomeGoodsApi = () => {
  return request.get('/goods/home');
};
```

###### ② 首页组件（`src/pages/Home.vue`）

vue











```vue
<template>
  <div class="home-container">
    <header class="home-header">小兔鲜儿 - 新鲜直达</header>
    
    <section class="goods-list">
      <h3>热销推荐</h3>
      <div class="goods-grid">
        <div class="goods-item" v-for="goods in goodsList" :key="goods.id">
          <img :src="goods.image" :alt="goods.name" class="goods-img">
          <h4 class="goods-name">{{ goods.name }}</h4>
          <div class="goods-price">
            <span class="current-price">¥{{ goods.price }}</span>
            <span class="original-price" v-if="goods.originalPrice">¥{{ goods.originalPrice }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHomeGoodsApi } from '@/api/goods';

// 商品列表数据
const goodsList = ref([]);

// 页面加载时获取商品
onMounted(async () => {
  const data = await getHomeGoodsApi();
  goodsList.value = data;
});
</script>

<style lang="less" scoped>
.home-container {
  padding-bottom: 50px;

  .home-header {
    height: 50px;
    line-height: 50px;
    text-align: center;
    background-color: #ff4d4f;
    color: white;
    font-size: 18px;
  }

  .goods-list {
    padding: 15px;

    h3 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }

    .goods-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .goods-item {
      background: white;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);

      .goods-img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 4px;
      }

      .goods-name {
        font-size: 14px;
        margin: 10px 0;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .goods-price {
        .current-price {
          color: #ff4d4f;
          font-weight: bold;
        }
        .original-price {
          color: #999;
          font-size: 12px;
          text-decoration: line-through;
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
```

### 五、跨域配置（后端）

为解决前后端分离的跨域问题，添加配置类：

java











```java
package com.rabbit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 所有接口
                .allowedOrigins("http://localhost:3000")  // 前端地址
                .allowedMethods("GET", "POST", "PUT", "DELETE")  // 允许的方法
                .allowedHeaders("*")  // 允许的请求头
                .allowCredentials(true)  // 允许携带cookie
                .maxAge(3600);  // 预检请求有效期
    }
}
```

### 六、测试验证

1. **初始化数据库**：执行上述 SQL 脚本，插入测试数据（如用户`admin`，密码`123456`（MD5 加密后为`e10adc3949ba59abbe56e057f20f883e`），以及几条商品数据）。
2. **启动后端**：运行`RabbitShopApiApplication`，确保服务在 8080 端口启动。
3. **启动前端**：执行`npm run dev`，访问`http://localhost:3000/login`，输入用户名`admin`和密码`123456`，登录成功后跳转到首页，应展示后端返回的商品列表。

### 总结

Day1 完成了小兔鲜儿项目的核心基础：

- 前后端项目架构搭建（Vue3 + Spring Boot）。
- 核心环境配置（数据库、跨域、Axios 封装）。
- 核心功能实现：用户登录（含密码加密验证）、首页商品展示（热销商品查询）。

这些内容为后续开发分类导航、商品详情、购物车等功能奠定了基础，重点体现了前后端分离架构的协作模式和基础功能的实现逻辑。