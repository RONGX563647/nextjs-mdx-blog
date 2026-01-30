# 【JavaWeb｜day20 Web前端实战 项目部署】

https://heuqqdmbyk.feishu.cn/wiki/SE5owqapKiXSySkrHduchs4ynac

这部分自己看笔记📒 其实也可以直接跳过 问题不大

## 核心目标

掌握前端实战开发规范（页面整合、接口对接），以及项目本地 / 服务器部署全流程，实现前后端联调落地。

## 一、Web 前端实战（核心流程）

### 1. 前端项目结构（通用规范）

plaintext

```plaintext
web-project/
├── css/        # 样式文件（全局样式、组件样式）
├── js/         # 脚本文件（axios请求、工具类、业务逻辑）
├── images/     # 静态资源（图片、图标）
├── pages/      # 页面文件（首页、列表页、详情页）
├── lib/        # 第三方依赖（ElementUI、jQuery）
└── index.html  # 入口页面
```

### 2. 核心开发步骤

- 页面布局：基于 ElementUI/Vue 组件快速搭建页面结构（导航栏、表格、表单、分页组件）。

- 接口对接：用 Axios 封装请求（GET/POST/PUT/DELETE），统一处理请求头（Token）、响应拦截（统一结果格式）。

  javascript

  ```javascript
  // Axios请求封装示例
  axios.interceptors.request.use(config => {
    config.headers.Authorization = "Bearer " + localStorage.getItem("token");
    return config;
  });
  axios.interceptors.response.use(res => res.data);
  ```

  

- 数据绑定：将接口返回数据渲染到页面（表格展示、表单回显），处理加载状态（loading 组件）。

- 功能测试：用浏览器 F12 调试（Network 查看请求、Console 打印日志），排查跨域、参数错误等问题。

### 3. 实战优化要点

- 样式统一：提取全局样式（如颜色、字体），避免重复代码。
- 表单校验：前端先做基础校验（非空、格式），减少后端请求。
- 性能优化：压缩静态资源（CSS/JS），图片用懒加载。

## 二、项目部署（本地 + 服务器）

### 1. 本地部署（前后端联调）

- 前端：用 VSCode 插件（如 Live Server）启动前端项目，端口默认 5500。
- 后端：启动 SpringBoot 项目（端口 8080），确保跨域配置生效。
- 联调：前端请求地址指向本地后端（`http://localhost:8080/api/xxx`），测试所有接口功能正常。

### 2. 服务器部署（生产环境）

#### （1）环境准备

- 服务器：CentOS/Ubuntu，安装 JDK（1.8+）、MySQL、Nginx。
- 依赖安装：
  - JDK：`yum install -y java-1.8.0-openjdk-devel`
  - MySQL：安装后创建数据库，执行 SQL 脚本导入数据。
  - Nginx：`yum install -y nginx`，启动 Nginx（`systemctl start nginx`）。

#### （2）项目打包

- 后端：在 IDEA 中执行`mvn clean package`，生成 Jar 包（如`tlias-0.0.1-SNAPSHOT.jar`）。
- 前端：执行`npm run build`（Vue 项目），生成 dist 文件夹（静态资源）。

#### （3）上传部署

- 后端：用 Xshell/Xftp 将 Jar 包上传到服务器（如

  ```
  /usr/local/project/
  ```

  ），启动命令：

  bash

  ```bash
  nohup java -jar tlias-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
  ```

  

  （nohup 确保后台运行，日志输出到 app.log）

- 前端：将 dist 文件夹上传到 Nginx 静态资源目录（如

  ```
  /usr/share/nginx/html/
  ```

  ），修改 Nginx 配置（

  ```
  /etc/nginx/nginx.conf
  ```

  ）：

  nginx

  

  ```nginx
  server {
    listen 80;
    server_name 服务器IP;
  
    # 前端静态资源配置
    location / {
      root /usr/share/nginx/html/dist;
      index index.html;
      try_files $uri $uri/ /index.html; # 解决Vue路由刷新404
    }
  
    # 后端接口反向代理（避免跨域）
    location /api/ {
      proxy_pass http://localhost:8080/;
    }
  }
  ```

- 重启 Nginx：`systemctl restart nginx`。

#### （4）访问测试

- 前端：浏览器输入`http://服务器IP`，能正常打开页面、操作功能。
- 后端：访问`http://服务器IP/api/employees`，能返回 JSON 数据。

### 3. 常见部署问题

- 端口占用：用`netstat -ano | grep 8080`查看占用端口，杀死进程（`kill -9 进程ID`）。
- 跨域问题：检查 Nginx 反向代理配置，确保`proxy_pass`指向后端地址。
- 数据库连接失败：确认服务器 MySQL 允许远程连接，防火墙开放 3306 端口。
- 后端启动失败：查看`app.log`日志，排查配置错误（如数据库账号密码）。

## 核心总结

1. 前端实战关键：统一结构、封装请求、前后端数据对齐。
2. 部署核心：服务器环境准备→项目打包→上传部署→反向代理配置。
3. 排查技巧：优先看日志（后端 app.log、Nginx 日志），用浏览器调试前端请求。





