# Next.js 全栈个人博客/作品集网站

**最后更新：2026-01-29 - 使用 Next.js 16 App Router**

这是一个基于 Next.js 16 的个人博客/作品集网站，使用 MDX、Tailwind CSS 和 Framer Motion 等现代前端技术构建。网站具有美观的 UI 设计、丰富的动画效果和响应式布局，适合展示个人作品和全栈开发技术能力。

## 📋 项目简介

本网站是一个现代化的个人展示平台，集成了以下核心功能：

- 🎨 **美观的 UI 设计**：基于 shadcn/ui 组件库，提供一致且美观的用户界面
- 🌓 **响应式布局**：完美适配桌面、平板和手机等各种设备
- 🌙 **深色模式支持**：内置主题切换功能，支持深色和浅色模式
- 🚀 **3D 视觉效果**：使用 Three.js 和 React Three Fiber 创建 3D 背景和轮播图
- ✨ **丰富的动画**：基于 Framer Motion 实现流畅的滚动动画和页面过渡效果
- 📱 **移动端优化**：包含移动端导航菜单，确保在手机上也有良好的用户体验
- 🎯 **项目展示**：展示个人项目作品，包括福师畅聊和师大云学等全栈项目
- 📄 **简历下载**：提供简历下载和预览功能

## 🛠️ 技术栈

### 核心技术

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Next.js | ^16.1.3 | 框架核心，提供 SSR、App Router 等功能 | 性能优异，功能丰富，生态成熟，Vercel 集成 |
| React | ^19.2.3 | UI 库 | 最流行的 UI 库，生态成熟，组件化开发 |
| TypeScript | ^5.6.2 | 类型系统 | 类型安全，减少运行时错误，提高开发效率 |
| Tailwind CSS | 3.3.3 | 样式框架 | 原子化 CSS 类，响应式设计，开发速度快 |
| shadcn/ui | 最新版 | UI 组件库 | 高质量的 UI 组件，可定制，TypeScript 支持 |

### 动画与视觉效果

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Framer Motion | ^12.27.1 | 动画库 | 声明式动画 API，物理动画，滚动触发 |
| GSAP | 3.x | 高级动画库 | 高性能，复杂动画，滚动效果，3D 变换 |
| Three.js | 0.160+ | 3D 渲染库 | 强大的 3D 渲染能力，WebGL 支持，场景管理 |
| React Three Fiber | 8.x | Three.js 的 React 封装 | 将 Three.js 与 React 集成，组件化开发 |

### 工具与开发依赖

| 工具 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| ESLint | 8.56.0 | 代码质量检查 | 保持代码质量，遵循最佳实践 |
| Prettier | ^3.0.3 | 代码格式化 | 统一代码风格，提高可读性 |
| Vercel | 最新版 | 托管和部署平台 | 与 Next.js 无缝集成，全球 CDN |
| GitHub Actions | 最新版 | CI/CD 自动化 | 自动化构建和部署流程 |

## 🚀 快速开始

### 1. 克隆项目

```bash
# 克隆项目到本地
git clone https://github.com/RONGX563647/nextjs-mdx-blog.git
cd nextjs-mdx-blog
```

### 2. 安装依赖

```bash
# 安装项目依赖（使用 --legacy-peer-deps 解决依赖冲突）
npm install --legacy-peer-deps
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看项目。

## 📁 项目结构

```
nextjs-mdx-blog/
├── .github/              # GitHub Actions 配置文件
│   └── workflows/     # 工作流定义
│       └── ci-cd.yml  # CI/CD 配置
├── .idea/               # IDE 配置文件
├── doc/                 # 项目文档
│   ├── 开发规划.md      # 项目开发计划
│   ├── 技术选型.md      # 技术栈选择说明
│   ├── 模块开发方案.md  # 模块开发方案
│   ├── 简历.md         # 简历相关文档
│   └── 需求分析.md      # 需求分析文档
├── public/              # 静态资源
│   ├── images/          # 图片资源
│   ├── next.svg         # Next.js 图标
│   ├── vercel.svg        # Vercel 图标
│   └── 1.pdf            # 简历文件
├── src/                 # 源代码
│   ├── app/             # Next.js App Router
│   │   ├── about/        # 关于页面
│   │   ├── portfolio/     # 作品集页面
│   │   │   ├── [id]/   # 动态路由：项目详情页
│   │   ├── layout.tsx     # 全局布局组件
│   │   ├── page.tsx       # 首页
│   │   ├── providers.tsx  # 全局提供者（主题等）
│   │   └── sitemap.ts     # 网站地图
│   ├── components/      # 组件
│   │   ├── ui/            # UI 组件（shadcn/ui）
│   │   ├── Container.tsx  # 容器组件
│   │   ├── CustomCursor.tsx # 自定义光标效果
│   │   ├── EasterEgg.tsx # 彩蛋功能
│   │   ├── GlassCard.tsx  # 玻璃态卡片
│   │   ├── Hero3DBackground.tsx # 3D 背景效果
│   │   ├── MouseParallax.tsx # 鼠标视差效果
│   │   ├── Navigation.tsx  # 导航栏组件
│   │   ├── PageTransition.tsx # 页面过渡效果
│   │   ├── ScrollAnimation.tsx # 滚动动画
│   │   ├── ThemeSwitch.tsx # 主题切换组件
│   │   └── ThreeDCarousel.tsx # 3D 轮播图
│   └── lib/             # 工具库
│       ├── constants.ts    # 常量定义
│       └── utils.ts       # 工具函数
├── .eslintrc.json       # ESLint 配置
├── .gitignore           # Git 忽略文件
├── README.md            # 项目说明文档（本文件）
├── learn.md             # 详细开发指南
├── components.json       # shadcn/ui 组件配置
├── next.config.js       # Next.js 配置
├── package.json        # 项目依赖和脚本
├── postcss.config.js   # PostCSS 配置
├── prettier.config.js   # Prettier 配置
├── tailwind.config.js   # Tailwind CSS 配置
├── tsconfig.json        # TypeScript 配置
└── vercel.json          # Vercel 部署配置
```

## 🎨 核心功能

### 1. 首页

首页是网站的入口，包含英雄区、精选项目和 3D 轮播图。

**主要特性：**
- 3D 背景效果（`Hero3DBackground`）
- 鼠标视差效果（`MouseParallax`）
- 滚动动画（`ScrollAnimation`）
- 玻璃态卡片展示项目（`GlassCard`）
- 3D 轮播图展示（`ThreeDCarousel`）

### 2. 关于页面

关于页面用于展示个人信息和全栈开发技能。

**主要特性：**
- 个人信息展示
- 技术栈展示（Java、Vue3、Spring Boot 等）
- 滚动动画效果

### 3. 作品集页面

作品集页面包含项目列表和详情页。

**主要特性：**
- 项目列表展示
- 动态路由（`[id]/page.tsx`）
- 项目详情页
- 技术标签展示

### 4. 导航栏

导航栏包含网站链接和主题切换按钮，支持当前页面高亮显示。

**主要特性：**
- 响应式设计（桌面端和移动端）
- 当前页面高亮
- 移动端汉堡菜单
- 主题切换按钮
- 简历下载链接
- GitHub 链接（最右侧）

### 5. 主题切换

使用 `next-themes` 实现深色模式和浅色模式的切换。

**主要特性：**
- 深色/浅色模式切换
- 状态持久化（localStorage）
- 平滑过渡动画

### 6. 动画效果

#### 滚动动画

使用 Framer Motion 实现滚动时的动画效果。

**主要特性：**
- 元素进入视口时触发动画
- 平滑的过渡效果
- 可配置的延迟时间
- 视口边缘扩展

#### 鼠标视差

实现鼠标移动时的视差效果。

**主要特性：**
- 实时鼠标位置追踪
- 可配置的视差强度
- 平滑的变换效果

#### 3D 效果

使用 Three.js 和 React Three Fiber 实现 3D 背景。

**主要特性：**
- 3D 粒子效果
- WebGL 渲染
- 性能优化

## 🚢 部署

### 1. 构建项目

```bash
# 构建生产版本
npm run build
```

### 2. 部署到 Vercel

本项目使用 GitHub Actions 自动部署到 Vercel。

**部署流程：**
1. 推送代码到 GitHub
2. GitHub Actions 自动触发 CI/CD 流程
3. 安装依赖（使用 `--legacy-peer-deps` 解决依赖冲突）
4. 构建项目
5. 自动部署到 Vercel 生产环境

**CI/CD 配置：**
- 合并构建和部署为一个 job，提高效率
- 使用 `--legacy-peer-deps` 解决 ESLint 版本冲突
- 仅在 main 分支触发部署
- 支持手动触发部署

### 3. Vercel 配置

项目包含 `vercel.json` 配置文件，指定了构建和安装命令：

```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build"
}
```

## 🔧 开发指南

### 1. 添加新页面

在 `src/app` 目录下创建新的文件夹和 `page.tsx` 文件。

### 2. 添加新组件

在 `src/components` 目录下创建新的组件文件。

### 3. 添加新样式

使用 Tailwind CSS 类名进行样式设计，参考 `tailwind.config.js` 配置。

### 4. 修改主题

在 `src/app/layout.tsx` 中修改主题配置。

## 📚 文档

详细的开发指南请查看 [learn.md](./learn.md) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
