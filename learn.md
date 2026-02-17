# Next.js MDX 博客项目开发教程

## 目录

1. [项目概述](#项目概述)
2. [技术栈介绍](#技术栈介绍)
3. [项目初始化](#项目初始化)
4. [项目结构](#项目结构)
5. [核心功能开发](#核心功能开发)
6. [样式系统](#样式系统)
7. [博客系统](#博客系统)
8. [AI 辅助功能](#ai-辅助功能)
9. [项目展示](#项目展示)
10. [部署上线](#部署上线)

---

## 项目概述

本项目是一个基于 Next.js 13 App Router 构建的现代化个人技术博客系统，专注于分享 Java、Spring、MyBatis、Dubbo 等后端技术以及算法、架构设计、数据库、网络等全栈技术内容。项目采用最新的前端技术栈，具有优秀的性能表现、良好的 SEO 优化和出色的用户体验。

### 项目特点

- **现代化技术栈**：使用 Next.js 13、React 18、TypeScript 等最新技术，享受 App Router、Server Components 等新特性
- **卓越的性能**：利用 Server Components、Streaming 和静态生成优化页面加载速度
- **SEO 友好**：支持动态元标签、结构化数据和自动生成站点地图
- **响应式设计**：完美适配桌面端、平板和移动端设备
- **主题系统**：支持浅色模式和深色模式，自动跟随系统主题
- **Markdown 支持**：支持 Markdown 文章编写、代码高亮、表格、任务列表等扩展语法
- **丰富的动画**：使用 Framer Motion 实现流畅的页面过渡和交互动画
- **智能 AI 辅助**：集成 AI 助手，提供文章内容问答、智能交互和测验功能
- **视频集成**：支持增强版 B 站播放器，带有序列管理和进度跟踪
- **强大的搜索**：实现博客文章的实时前端搜索，支持标题和内容匹配
- **评论系统**：集成 GitHub 评论功能，方便读者互动
- **知识体系**：按照修仙等级划分的技术知识体系，结构清晰
- **最近访问**：记录并展示用户最近访问的文章，提升用户体验
- **代码质量**：严格的 TypeScript 类型检查和 ESLint 规则

### 核心功能

1. **首页**：展示个人介绍、精选项目和 3D 轮播效果，带有动态背景
2. **关于页面**：展示个人信息、技能栈和职业经历
3. **项目页面**：展示项目经历和详细的项目信息，支持项目轮播
4. **博客系统**：支持 Markdown 文章、多分类、标签、搜索、分页等功能
5. **主题切换**：支持浅色/深色模式切换，无闪烁体验
6. **自定义光标**：桌面端显示跟随鼠标的自定义光标，提升交互体验
7. **导航系统**：响应式导航栏，支持移动端菜单和双击 Logo 导航到顶部
8. **AI 助手**：提供文章内容智能问答、文本选择处理和侧边栏聊天
9. **文章测试**：在文章末尾添加 AI 出题测试功能，巩固学习成果
10. **视频集成**：支持增强版 B 站播放器，带有序列管理、进度跟踪和搜索
11. **评论系统**：集成 GitHub 评论功能，方便读者互动
12. **站点地图**：自动生成站点地图，提升 SEO
13. **最近访问**：记录并展示用户最近访问的文章
14. **文章导航**：提供文章之间的前后导航，方便阅读
15. **知识标签**：自动提取文章中的知识标签，方便内容分类
16. **文章下载**：支持文章内容下载为 PDF 格式
17. **代码示例**：丰富的代码示例和详细的技术讲解
18. **CI/CD**：集成 GitHub Actions 实现自动部署

---

## 技术栈介绍

### 前端框架

#### Next.js 13

Next.js 是一个 React 框架，提供了许多开箱即用的功能，如服务端渲染、静态生成、API 路由等。

**主要特性：**

- **App Router**：Next.js 13 引入的新路由系统，支持嵌套布局、并行路由等
- **Server Components**：默认在服务端渲染组件，提高性能
- **Streaming**：支持流式渲染，提高首屏加载速度
- **文件系统路由**：基于文件系统的路由，自动生成路由
- **API Routes**：内置 API 路由，无需额外配置
- **站点地图生成**：支持自动生成 `sitemap.ts`，提升 SEO

**为什么选择 Next.js？**

1. **性能优秀**：服务端渲染和静态生成提供更快的首屏加载
2. **SEO 友好**：服务端渲染使搜索引擎更容易抓取内容
3. **开发体验好**：热重载、TypeScript 支持、自动路由等
4. **生态丰富**：大量第三方库和工具支持
5. **部署简单**：支持 Vercel 一键部署

#### React 18

React 是一个用于构建用户界面的 JavaScript 库。

**主要特性：**

- **组件化**：将 UI 拆分为可复用的组件
- **虚拟 DOM**：提高渲染性能
- **Hooks**：在函数组件中使用状态和生命周期
- **并发渲染**：React 18 引入的新特性，提高性能

#### TypeScript

TypeScript 是 JavaScript 的超集，添加了静态类型检查。

**主要特性：**

- **类型安全**：在编译时捕获类型错误
- **智能提示**：提供更好的代码补全和文档
- **重构友好**：类型系统使重构更安全
- **文档即代码**：类型定义本身就是文档

### 样式系统

#### Tailwind CSS

Tailwind CSS 是一个实用优先的 CSS 框架。

**主要特性：**

- **实用类**：提供大量预定义的 CSS 类
- **响应式设计**：内置响应式前缀（`sm:`、`md:`、`lg:`）
- **深色模式**：内置深色模式支持（`dark:`）
- **自定义配置**：支持自定义主题和扩展
- **按需生成**：只生成使用的 CSS，减少文件大小

**为什么选择 Tailwind CSS？**

1. **开发效率高**：无需切换文件编写 CSS
2. **一致性**：预定义的设计系统保证一致性
3. **响应式简单**：内置响应式前缀使响应式设计更简单
4. **可定制**：支持自定义主题和扩展
5. **性能优秀**：按需生成，减少文件大小

### 动画库

#### Framer Motion

Framer Motion 是一个用于 React 的动画库。

**主要特性：**

- **声明式 API**：使用组件和 props 定义动画
- **手势支持**：内置拖拽、缩放、旋转等手势
- **布局动画**：自动处理布局变化的动画
- **性能优秀**：使用 Web Animations API

### UI 组件库

#### shadcn/ui

shadcn/ui 是一个基于 Radix UI 和 Tailwind CSS 的组件库。

**主要特性：**

- **可访问性**：基于 Radix UI，提供优秀的可访问性
- **可定制**：基于 Tailwind CSS，易于定制
- **无样式**：提供基础样式，可完全自定义
- **TypeScript 支持**：完整的 TypeScript 类型定义

### Markdown 渲染

#### react-markdown

react-markdown 是一个用于渲染 Markdown 的 React 组件。

**主要特性：**

- **安全性**：自动转义 HTML，防止 XSS 攻击
- **插件支持**：支持 remark 和 rehype 插件
- **可定制**：支持自定义渲染器

#### remark-gfm

remark-gfm 是一个支持 GitHub Flavored Markdown 的 remark 插件。

**主要特性：**

- **表格支持**：支持 Markdown 表格
- **删除线支持**：支持 `~~删除线~~` 语法
- **任务列表**：支持 `- [ ]` 任务列表语法

#### rehype-highlight

rehype-highlight 是一个用于代码高亮的 rehype 插件。

**主要特性：**

- **多语言支持**：支持 180+ 编程语言
- **主题支持**：支持多种代码高亮主题
- **行号支持**：可选的行号显示

#### rehype-slug

rehype-slug 是一个用于生成标题锚点的 rehype 插件。

**主要特性：**

- **自动生成锚点**：为标题自动生成 ID
- **自定义格式**：支持自定义 ID 格式

#### rehype-autolink-headings

rehype-autolink-headings 是一个用于自动链接标题的 rehype 插件。

**主要特性：**

- **自动链接**：为标题自动添加链接
- **可定制**：支持自定义链接样式

### 主题管理

#### next-themes

next-themes 是一个用于 Next.js 的主题管理库。

**主要特性：**

- **服务端渲染**：支持服务端渲染
- **深色模式**：内置深色模式支持
- **系统主题**：支持跟随系统主题
- **无闪烁**：避免主题切换时的闪烁

### 图标库

#### lucide-react

lucide-react 是一个轻量级的图标库。

**主要特性：**

- **树摇优化**：只导入使用的图标
- **可定制**：支持自定义大小、颜色等
- **TypeScript 支持**：完整的 TypeScript 类型定义

### 视频集成

#### B 站视频播放器

项目集成了 B 站视频播放器，支持在文章中嵌入视频内容。

**主要特性：**

- **响应式设计**：自适应不同屏幕尺寸
- **播放控制**：支持播放、暂停、音量调节等
- **全屏支持**：支持全屏播放

### AI 相关

项目集成了 AI 辅助功能，包括文章问答和智能出题。

**主要特性：**

- **内容理解**：基于文章内容提供智能问答
- **互动测试**：在文章末尾生成相关测试题
- **实时交互**：支持实时聊天交互

### 搜索功能

项目实现了前端搜索功能，支持在博客专栏中搜索文章。

**主要特性：**

- **实时搜索**：输入时实时显示搜索结果
- **模糊匹配**：支持标题和内容的模糊匹配
- **响应式设计**：适配不同屏幕尺寸

---

## 项目初始化

### 1. 创建 Next.js 项目

使用 Next.js 官方脚手架创建项目：

```bash
# 使用 npm
npx create-next-app@latest nextjs-mdx-blog

# 使用 yarn
yarn create next-app nextjs-mdx-blog

# 使用 pnpm
pnpm create next-app nextjs-mdx-blog
```

创建时会询问以下问题：

```
? Would you like to use TypeScript? Yes
? Would you like to use ESLint? Yes
? Would you like to use Tailwind CSS? Yes
? Would you like to use `src/` directory? Yes
? Would you like to use App Router? Yes
? Would you like to customize the default import alias? No
```

### 2. 安装依赖

进入项目目录并安装必要的依赖：

```bash
cd nextjs-mdx-blog

# 安装核心依赖
npm install react react-dom

# 安装动画库
npm install framer-motion

# 安装主题管理
npm install next-themes

# 安装图标库
npm install lucide-react

# 安装 Markdown 渲染相关
npm install react-markdown remark-gfm rehype-highlight rehype-slug rehype-autolink-headings

# 安装代码高亮
npm install highlight.js

# 安装 shadcn/ui 相关
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node @types/react @types/react-dom

# 安装其他工具
npm install prettier prettier-plugin-tailwindcss
npm install -D eslint-plugin-tailwindcss
```

### 3. 配置项目

#### 3.1 配置 TypeScript

创建 `tsconfig.json` 文件：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**配置说明：**

- `target`：编译目标，设置为 ES2017
- `lib`：包含的类型库
- `strict`：启用严格模式
- `paths`：路径别名，`@/*` 映射到 `./src/*`
- `jsx`：设置为 preserve，由 Next.js 处理 JSX

#### 3.2 配置 Tailwind CSS

创建 `tailwind.config.js` 文件：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**配置说明：**

- `content`：指定要扫描的文件路径
- `darkMode`：设置为 class，使用 class 控制深色模式
- `theme.extend.colors`：扩展颜色，使用 CSS 变量
- `theme.extend.borderRadius`：扩展圆角，使用 CSS 变量
- `theme.extend.keyframes`：扩展动画关键帧

#### 3.3 配置 PostCSS

创建 `postcss.config.js` 文件：

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**配置说明：**

- `tailwindcss`：处理 Tailwind CSS 指令
- `autoprefixer`：自动添加浏览器前缀

#### 3.4 配置 Next.js

创建 `next.config.js` 文件：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'i0.hdslb.com'],
  },
}

module.exports = nextConfig
```

**配置说明：**

- `reactStrictMode`：启用 React 严格模式
- `images.domains`：允许的图片域名，包括本地和 B 站图片

#### 3.5 配置 ESLint

创建 `.eslintrc.json` 文件：

```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "tailwindcss"
  ],
  "rules": {
    "tailwindcss/classnames-order": "error",
    "tailwindcss/enforces-negative-arbitrary-values": "error",
    "tailwindcss/enforces-shorthand": "error",
    "tailwindcss/no-custom-classname": "error",
    "tailwindcss/no-contradicting-classname": "error"
  }
}
```

**配置说明：**

- `extends`：扩展 ESLint 配置
- `plugins`：使用的 ESLint 插件
- `rules`：自定义 ESLint 规则

### 4. 创建项目结构

创建以下目录结构：

```
nextjs-mdx-blog/
├── .github/            # GitHub 配置
│   ├── workflows/      # CI/CD 工作流
│   │   └── ci-cd.yml   # 自动部署配置
│   └── FUNDING.yml     # 资助配置
├── .idea/              # IDE 配置
├── .trae/              # Trae 配置
│   └── documents/      # Trae 文档
├── doc/                # 项目文档
│   ├── skill.md        # 技能文档
│   ├── 开发规划.md       # 开发规划
│   ├── 技术选型.md       # 技术选型
│   ├── 模块开发方案.md     # 模块开发方案
│   ├── 简历.md          # 简历
│   └── 需求分析.md       # 需求分析
├── public/              # 静态资源
│   ├── images/         # 图片资源
│   │   ├── bridge.jpg  # 桥梁图片
│   │   └── og-image.png # Open Graph 图片
│   ├── md/            # Markdown 文章
│   │   ├── 引气・Java 气海初拓/   # Java 基础教程
│   │   ├── 筑基・Web 道途启关/     # Web 开发教程
│   │   ├── 筑基・数据元府藏真/     # 数据库教程
│   │   ├── 筑基・网络云路秘径/     # 网络教程
│   │   ├── 金丹・SSM 三式凝丹/     # SSM 框架教程
│   │   ├── 金丹・瑞吉厨域试炼/     # 瑞吉外卖项目教程
│   │   ├── 金丹・苍穹食府演法/     # 餐饮系统教程
│   │   ├── 元婴・Spring 道韵观想/  # Spring 高级教程
│   │   ├── 元婴・Mybatis 灵枢拆解/ # MyBatis 高级教程
│   │   ├── 元婴・Dubbo 界域传法/   # Dubbo 教程
│   │   ├── 元婴・算法心劫磨砺/     # 算法教程
│   │   ├── 化神・若依架构御界/     # 若依框架教程
│   │   └── 合体・全栈道途擘画/     # 综合教程
│   ├── 1.pdf           # 简历文件
│   └── 1.png           # 简历图片
├── src/                # 源代码
│   ├── app/            # App Router 页面
│   │   ├── about/      # 关于页面
│   │   │   └── page.tsx # 关于页面内容
│   │   ├── api/        # API 路由
│   │   │   └── quiz/   # 测验 API
│   │   │       └── route.ts # 测验 API 路由
│   │   ├── blog/       # 博客页面
│   │   │   ├── [category]/  # 分类页面
│   │   │   │   ├── [slug]/  # 文章详情页面
│   │   │   │   │   └── page.tsx # 文章详情
│   │   │   │   └── page.tsx  # 分类列表
│   │   │   ├── BlogSearch.tsx # 博客搜索组件
│   │   │   └── page.tsx      # 博客首页
│   │   ├── portfolio/  # 项目页面
│   │   │   ├── [id]/   # 项目详情页面
│   │   │   │   └── page.tsx # 项目详情
│   │   │   └── page.tsx      # 项目列表
│   │   ├── favicon.ico # 网站图标
│   │   ├── global.css  # 全局样式
│   │   ├── layout.tsx  # 根布局
│   │   ├── page.tsx    # 首页
│   │   ├── providers.tsx # 提供者组件
│   │   └── sitemap.ts  # 站点地图
│   ├── components/      # 组件
│   │   ├── ai/         # AI 相关组件
│   │   │   ├── AIAssistant.tsx # AI 助手主组件
│   │   │   ├── AIAssistantContext.tsx # AI 助手上下文
│   │   │   ├── AISidebar.tsx # AI 侧边栏
│   │   │   ├── ChatInput.tsx # 聊天输入框
│   │   │   ├── ChatMessage.tsx # 聊天消息
│   │   │   └── FloatingBall.tsx # 悬浮球
│   │   ├── blog/       # 博客相关组件
│   │   │   ├── AIAssistantSidebar.tsx # AI 助手侧边栏
│   │   │   ├── ArticleContent.tsx # 文章内容
│   │   │   ├── ArticleCoverImage.tsx # 文章封面图片
│   │   │   ├── ArticleDownloadButton.tsx # 文章下载按钮
│   │   │   ├── ArticleHeader.tsx # 文章头部
│   │   │   ├── ArticleNavigation.tsx # 文章导航
│   │   │   ├── ArticlePageClient.tsx # 文章页面客户端
│   │   │   ├── ArticleQuiz.tsx # 文章测验
│   │   │   ├── CollapsibleToc.tsx # 可折叠目录
│   │   │   ├── CommentSection.tsx # 评论区
│   │   │   ├── LastVisitedBar.tsx # 最近访问栏
│   │   │   ├── LastVisitedBarWrapper.tsx # 最近访问栏包装器
│   │   │   └── TextSelectionHandler.tsx # 文本选择处理
│   │   ├── portfolio/  # 项目相关组件
│   │   │   ├── ProjectCard.tsx # 项目卡片
│   │   │   └── ProjectCarousel.tsx # 项目轮播
│   │   ├── resume/     # 简历相关组件
│   │   │   ├── ErrorAlertModal.tsx # 错误提示模态框
│   │   │   ├── ResumeDownloadButton.tsx # 简历下载按钮
│   │   │   └── ResumeDownloadModal.tsx # 简历下载模态框
│   │   ├── ui/         # UI 组件
│   │   │   ├── badge.tsx # 徽章
│   │   │   ├── button.tsx # 按钮
│   │   │   ├── card.tsx # 卡片
│   │   │   ├── input.tsx # 输入框
│   │   │   └── scroll-area.tsx # 滚动区域
│   │   ├── video/      # 视频相关组件
│   │   │   ├── BilibiliPlayer.tsx # B 站播放器
│   │   │   └── EnhancedBilibiliPlayer.tsx # 增强版 B 站播放器
│   │   ├── Container.tsx # 容器组件
│   │   ├── CustomCursor.tsx # 自定义光标
│   │   ├── EasterEgg.tsx # 彩蛋
│   │   ├── ExpandingNavBar.tsx # 扩展导航栏
│   │   ├── GlassCard.tsx # 玻璃卡片
│   │   ├── HeaderWithDoubleClick.tsx # 双击 Logo 导航
│   │   ├── Hero3DBackground.tsx # 3D 背景
│   │   ├── MouseParallax.tsx # 鼠标视差效果
│   │   ├── Navigation.tsx # 导航组件
│   │   ├── PageTransition.tsx # 页面过渡
│   │   ├── ScrollAnimation.tsx # 滚动动画
│   │   ├── ThemeSwitch.tsx # 主题切换
│   │   └── ThreeDCarousel.tsx # 3D 轮播
│   ├── hooks/          # 自定义 Hooks
│   │   ├── ai/         # AI 相关 Hooks
│   │   │   ├── useAIChat.ts # AI 聊天 Hook
│   │   │   └── useChatHistory.ts # 聊天历史 Hook
│   │   ├── useArticle.ts # 文章相关 Hook
│   │   └── useToc.ts   # 目录相关 Hook
│   ├── lib/            # 工具函数
│   │   ├── blog.ts     # 博客相关工具
│   │   ├── constants.ts # 常量定义
│   │   └── utils.ts    # 通用工具函数
│   └── utils/          # 其他工具
│       └── lastVisited.ts # 最近访问记录
├── .eslintrc.json       # ESLint 配置
├── .gitignore          # Git 忽略文件
├── .stylelintrc.json    # Stylelint 配置
├── README.md           # 项目说明
├── components.json      # 组件配置
├── learn.md            # 本教程文件
├── next.config.js       # Next.js 配置
├── package-lock.json    # npm 锁文件
├── package.json         # 项目依赖
├── postcss.config.js    # PostCSS 配置
├── prettier.config.js   # Prettier 配置
├── tailwind.config.js   # Tailwind CSS 配置
├── tsconfig.json        # TypeScript 配置
└── vercel.json          # Vercel 配置
```

---

## 项目结构

### 目录说明

#### .github/

GitHub 配置目录，包含 CI/CD 工作流配置。

**主要内容：**

- `workflows/`：CI/CD 工作流配置
  - `ci-cd.yml`：自动部署配置，实现代码推送后自动构建和部署
- `FUNDING.yml`：资助配置

#### doc/

项目文档目录，包含项目规划、技术选型等文档。

**主要内容：**

- `skill.md`：技能文档
- `开发规划.md`：项目开发规划
- `技术选型.md`：技术栈选型说明
- `模块开发方案.md`：各模块详细开发方案
- `简历.md`：个人简历
- `需求分析.md`：项目需求分析

#### public/

存放静态资源，如图片、Markdown 文章、PDF 等。

**特点：**

- 直接通过 URL 访问：`/images/logo.png`
- 不会被 Next.js 处理，直接返回文件
- 适合存放不常变化的静态资源

**主要内容：**

- `images/`：图片资源
  - `bridge.jpg`：桥梁图片，用于首页背景
  - `og-image.png`：Open Graph 图片，用于社交媒体分享
- `md/`：Markdown 文章，按分类组织
  - `引气・Java 气海初拓/`：Java 基础教程
  - `筑基・Web 道途启关/`：Web 开发教程
  - `筑基・数据元府藏真/`：数据库教程
  - `筑基・网络云路秘径/`：网络教程
  - `金丹・SSM 三式凝丹/`：SSM 框架教程
  - `金丹・瑞吉厨域试炼/`：瑞吉外卖项目教程
  - `金丹・苍穹食府演法/`：餐饮系统教程
  - `元婴・Spring 道韵观想/`：Spring 高级教程
  - `元婴・Mybatis 灵枢拆解/`：MyBatis 高级教程
  - `元婴・Dubbo 界域传法/`：Dubbo 教程
  - `元婴・算法心劫磨砺/`：算法教程
  - `化神・若依架构御界/`：若依框架教程
  - `合体・全栈道途擘画/`：综合教程
- `1.pdf`：简历文件
- `1.png`：简历图片

#### src/app/

App Router 的页面目录，基于文件系统的路由。

**路由规则：**

- `page.tsx`：页面组件
- `layout.tsx`：布局组件
- `loading.tsx`：加载组件
- `error.tsx`：错误组件
- `not-found.tsx`：404 组件
- `sitemap.ts`：站点地图生成

**主要内容：**

```
app/
├── page.tsx              # / (首页)
├── about/
│   └── page.tsx        # /about (关于页面)
├── api/
│   └── quiz/
│       └── route.ts    # 测验 API
├── blog/
│   ├── page.tsx          # /blog (博客列表)
│   ├── BlogSearch.tsx     # 博客搜索组件
│   └── [category]/        # 分类页面
│       ├── page.tsx      # /blog/:category (分类列表)
│       └── [slug]/        # 文章详情页面
│           └── page.tsx  # /blog/:category/:slug (文章详情)
├── portfolio/
│   ├── page.tsx          # /portfolio (项目列表)
│   └── [id]/
│       └── page.tsx      # /portfolio/:id (项目详情)
├── favicon.ico           # 网站图标
├── global.css            # 全局样式
├── layout.tsx            # 根布局
├── providers.tsx         # 提供者组件（主题、AI 等）
├── sitemap.ts            # 站点地图
```

#### src/components/

存放可复用的组件，按功能分类。

**组件分类：**

- `ai/`：AI 相关组件
  - `AIAssistant.tsx`：AI 助手主组件
  - `AIAssistantContext.tsx`：AI 助手上下文
  - `AISidebar.tsx`：AI 侧边栏
  - `ChatInput.tsx`：聊天输入框
  - `ChatMessage.tsx`：聊天消息
  - `FloatingBall.tsx`：悬浮球
- `blog/`：博客相关组件
  - `AIAssistantSidebar.tsx`：AI 助手侧边栏
  - `ArticleContent.tsx`：文章内容
  - `ArticleCoverImage.tsx`：文章封面图片
  - `ArticleDownloadButton.tsx`：文章下载按钮
  - `ArticleHeader.tsx`：文章头部
  - `ArticleNavigation.tsx`：文章导航
  - `ArticlePageClient.tsx`：文章页面客户端
  - `ArticleQuiz.tsx`：文章测验
  - `CollapsibleToc.tsx`：可折叠目录
  - `CommentSection.tsx`：评论区
  - `LastVisitedBar.tsx`：最近访问栏
  - `LastVisitedBarWrapper.tsx`：最近访问栏包装器
  - `TextSelectionHandler.tsx`：文本选择处理
- `portfolio/`：项目相关组件
  - `ProjectCard.tsx`：项目卡片
  - `ProjectCarousel.tsx`：项目轮播
- `resume/`：简历相关组件
  - `ErrorAlertModal.tsx`：错误提示模态框
  - `ResumeDownloadButton.tsx`：简历下载按钮
  - `ResumeDownloadModal.tsx`：简历下载模态框
- `ui/`：基础 UI 组件
  - `badge.tsx`：徽章
  - `button.tsx`：按钮
  - `card.tsx`：卡片
  - `input.tsx`：输入框
  - `scroll-area.tsx`：滚动区域
- `video/`：视频相关组件
  - `BilibiliPlayer.tsx`：B 站播放器
  - `EnhancedBilibiliPlayer.tsx`：增强版 B 站播放器
- 通用组件
  - `Container.tsx`：容器组件
  - `CustomCursor.tsx`：自定义光标
  - `EasterEgg.tsx`：彩蛋
  - `ExpandingNavBar.tsx`：扩展导航栏
  - `GlassCard.tsx`：玻璃卡片
  - `HeaderWithDoubleClick.tsx`：双击 Logo 导航
  - `Hero3DBackground.tsx`：3D 背景
  - `MouseParallax.tsx`：鼠标视差效果
  - `Navigation.tsx`：导航组件
  - `PageTransition.tsx`：页面过渡
  - `ScrollAnimation.tsx`：滚动动画
  - `ThemeSwitch.tsx`：主题切换
  - `ThreeDCarousel.tsx`：3D 轮播

#### src/hooks/

存放自定义 Hooks，按功能分类。

**主要内容：**

- `ai/`：AI 相关 Hooks
  - `useAIChat.ts`：AI 聊天 Hook
  - `useChatHistory.ts`：聊天历史 Hook
- `useArticle.ts`：文章相关 Hook，用于处理文章数据
- `useToc.ts`：目录相关 Hook，用于生成文章目录

#### src/lib/

存放工具函数和常量。

**主要内容：**

- `blog.ts`：博客相关工具（文章解析、分类处理等）
- `constants.ts`：常量定义
- `utils.ts`：通用工具函数

#### src/utils/

存放其他工具。

**主要内容：**

- `lastVisited.ts`：最近访问记录，用于跟踪用户浏览历史

#### 配置文件

**主要配置文件：**

- `.eslintrc.json`：ESLint 配置，用于代码质量检查
- `.gitignore`：Git 忽略文件，指定不需要版本控制的文件
- `.stylelintrc.json`：Stylelint 配置，用于 CSS 代码质量检查
- `next.config.js`：Next.js 配置
- `package.json`：项目依赖和脚本
- `postcss.config.js`：PostCSS 配置
- `prettier.config.js`：Prettier 配置，用于代码格式化
- `tailwind.config.js`：Tailwind CSS 配置
- `tsconfig.json`：TypeScript 配置
- `vercel.json`：Vercel 配置，用于部署

---

## 核心功能开发

### 1. 主题切换功能

#### 1.1 创建主题提供者

创建 `src/app/providers.tsx` 文件：

```typescript
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  )
}
```

**说明：**

- `'use client'`：标记为客户端组件
- `ThemeProvider`：next-themes 的主题提供者
- `attribute="class"`：使用 class 控制主题
- `defaultTheme="system"`：默认跟随系统主题

#### 1.2 创建主题切换组件

创建 `src/components/ThemeSwitch.tsx` 文件：

```typescript
'use client'

import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()
  const otherTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${otherTheme} theme` : 'Toggle theme'}
      className="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      onClick={() => setTheme(otherTheme)}
    >
      <Sun 
        className="h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden" 
      />
      <MoonStar 
        className="hidden h-6 w-6 fill-zinc-700 stroke-zinc-500 transition dark:block" 
      />
    </button>
  )
}
```

**说明：**

- `useTheme`：获取当前主题和设置主题的方法
- `mounted`：避免服务端渲染和客户端渲染不匹配
- `otherTheme`：计算另一个主题
- `Sun` 和 `MoonStar`：太阳和月亮图标

#### 1.3 在布局中使用主题提供者

修改 `src/app/layout.tsx` 文件：

```typescript
import { Providers } from './providers'
import { CustomCursor } from '@/components/CustomCursor'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
          <CustomCursor />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**说明：**

- `suppressHydrationWarning`：抑制水合警告
- `Providers`：包裹所有子组件，提供主题上下文
- `CustomCursor`：在 Providers 之后，children 之前

### 2. 自定义光标功能

#### 2.1 创建自定义光标组件

创建 `src/components/CustomCursor.tsx` 文件：

```typescript
'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

export function CustomCursor() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, { stiffness: 400, damping: 25 })
  const springY = useSpring(y, { stiffness: 400, damping: 25 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  return (
    <>
      <motion.div
        className="hidden md:block fixed top-0 left-0 w-6 h-6 bg-primary rounded-full pointer-events-none z-50"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="hidden md:block fixed top-0 left-0 w-20 h-20 bg-primary rounded-full pointer-events-none z-40 opacity-20"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  )
}
```

**说明：**

- `useMotionValue`：创建可动画的值
- `useSpring`：创建弹簧动画
- `mousemove` 事件：监听鼠标移动
- `motion.div`：Framer Motion 的动画组件
- 只在桌面端显示（`hidden md:block`）

### 3. 导航栏功能

#### 3.1 创建导航栏组件

创建 `src/components/Navigation.tsx` 文件：

```typescript
'use client'

import Link from 'next/link'
import { Download, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="hidden md:flex items-center gap-2 text-base">
        <Link 
          href="/" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          首页
        </Link>
        <Link 
          href="/about" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/about' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          关于
        </Link>
        <Link 
          href="/portfolio" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/portfolio' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          项目
        </Link>
        <Link 
          href="/blog" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/blog' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          博客
        </Link>
        <a 
          href="/1.pdf" 
          download 
          className="px-4 py-2 hover:text-primary transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          简历
        </a>
      </nav>
      
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border z-50">
          <div className="flex flex-col p-4 gap-2">
            <Link 
              href="/" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/about' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              关于
            </Link>
            <Link 
              href="/portfolio" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/portfolio' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              项目
            </Link>
            <Link 
              href="/blog" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/blog' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              博客
            </Link>
            <a 
              href="/1.pdf" 
              download 
              className="px-4 py-3 hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Download size={20} />
              简历
            </a>
          </div>
        </div>
      )}
    </>
  )
}
```

**说明：**

- `usePathname`：获取当前路径
- `mobileMenuOpen`：移动端菜单状态
- `hidden md:flex`：桌面端显示导航栏
- `md:hidden`：移动端显示菜单按钮

#### 3.2 创建双击 Logo 导航组件

创建 `src/components/HeaderWithDoubleClick.tsx` 文件：

```typescript
'use client'

import Link from 'next/link'
import { useState } from 'react'

export function HeaderWithDoubleClick() {
  const [clickCount, setClickCount] = useState(0)

  const handleLogoClick = () => {
    setClickCount(prev => {
      if (prev === 1) {
        // 双击，滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return 0
      }
      // 单击，重置计数器
      setTimeout(() => setClickCount(0), 300)
      return prev + 1
    })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={handleLogoClick}
        >
          <span className="text-xl font-bold">技术博客</span>
        </Link>
        {/* 导航链接和主题切换按钮 */}
      </div>
    </header>
  )
}
```

**说明：**

- `clickCount`：记录点击次数
- `handleLogoClick`：处理点击事件，双击时滚动到顶部
- `setTimeout`：300ms 内的两次点击视为双击

### 4. 滚动动画功能

#### 4.1 创建滚动动画组件

创建 `src/components/ScrollAnimation.tsx` 文件：

```typescript
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function ScrollAnimation({ children, delay = 0, direction = 'up' }: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
```

**说明：**

- `useInView`：检测元素是否在视口中
- `variants`：定义动画变体
- `once: true`：只触发一次动画

#### 4.2 使用滚动动画组件

在任何组件中使用：

```typescript
import { ScrollAnimation } from '@/components/ScrollAnimation'

export default function Page() {
  return (
    <div>
      <ScrollAnimation>
        <h1>标题</h1>
      </ScrollAnimation>
      <ScrollAnimation delay={0.2}>
        <p>内容</p>
      </ScrollAnimation>
    </div>
  )
}
```

### 5. 博客系统

博客系统是本项目的核心功能，支持 Markdown 文章、多分类、搜索、分页等功能。

#### 5.1 博客核心工具

创建 `src/lib/blog.ts` 文件，实现博客相关的核心功能：

```typescript
import fs from 'fs'
import path from 'path'

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Article {
  slug: string
  title: string
  description?: string
  date?: string
  category: string
  content: string
}

const MD_DIR = path.join(process.cwd(), 'public', 'md')

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await fs.promises.readdir(MD_DIR)
    
    // 修仙体系排序优先级
    const cultivationOrder = ['引气', '筑基', '金丹', '元婴', '化神', '合体']
    
    return categories
      .filter((item) => {
        const itemPath = path.join(MD_DIR, item)
        return fs.statSync(itemPath).isDirectory()
      })
      .map((folder) => {
        const match = folder.match(/^(\d+)\.(.+)$/)
        if (match) {
          return {
            id: folder,
            name: match[2],
          }
        }
        return {
          id: folder,
          name: folder,
        }
      })
      .sort((a, b) => {
        // 提取修仙等级
        const getCultivationLevel = (name: string) => {
          for (const level of cultivationOrder) {
            if (name.includes(level)) {
              return cultivationOrder.indexOf(level)
            }
          }
          return cultivationOrder.length // 不在排序中的放在最后
        }
        
        const levelA = getCultivationLevel(a.name)
        const levelB = getCultivationLevel(b.name)
        
        if (levelA !== levelB) {
          return levelA - levelB
        }
        
        // 同一等级内按名称排序
        return a.name.localeCompare(b.name)
      })
  } catch (error) {
    console.error('Error reading categories:', error)
    return []
  }
}

export async function getArticles(categoryId: string): Promise<Article[]> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const files = await fs.promises.readdir(categoryPath)
    
    const articles: Article[] = []
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(categoryPath, file)
        const content = await fs.promises.readFile(filePath, 'utf-8')
        
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const descMatch = content.match(/^>?\s*(.+)$/m)
        
        const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '')
        const description = descMatch ? descMatch[1].trim() : ''
        
        articles.push({
          slug: file.replace('.md', ''),
          title,
          description,
          category: categoryId,
          content,
        })
      }
    }
    
    return articles.sort((a, b) => {
      const numA = parseInt(a.title.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.title.match(/\d+/)?.[0] || '0')
      return numA - numB
    })
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

export async function getArticle(categoryId: string, slug: string): Promise<Article | null> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const filePath = path.join(categoryPath, `${slug}.md`)
    
    const content = await fs.promises.readFile(filePath, 'utf-8')
    
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const descMatch = content.match(/^>?\s*(.+)$/m)
    
    const title = titleMatch ? titleMatch[1].trim() : slug
    const description = descMatch ? descMatch[1].trim() : ''
    
    return {
      slug,
      title,
      description,
      category: categoryId,
      content,
    }
  } catch (error) {
    console.error('Error reading article:', error)
    return null
  }
}

export function getCategoryFromId(categoryId: string): string {
  const match = categoryId.match(/^(\d+)\.(.+)$/)
  return match ? match[2] : categoryId
}
```

**说明：**

- `getCategories()`：获取所有分类，支持修仙体系排序
- `getArticles()`：获取指定分类下的所有文章，支持按标题数字排序
- `getArticle()`：获取指定分类下的指定文章
- `getCategoryFromId()`：从分类 ID 中提取分类名称
- 支持 Markdown 文件解析，自动提取标题和描述

#### 5.2 博客首页

创建 `src/app/blog/page.tsx` 文件，实现博客首页：

```typescript
import { getCategories } from '@/lib/blog'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function BlogPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">技术博客</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/${category.id}`}
              className="group"
            >
              <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center text-primary font-medium">
                  查看文章
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 5.3 分类详情页

创建 `src/app/blog/[category]/page.tsx` 文件，实现分类详情页，支持分页：

```typescript
import { notFound } from 'next/navigation'
import { getCategories, getArticles, getCategoryFromId } from '@/lib/blog'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BlogSearch } from '../BlogSearch'

export default async function CategoryPage({ params, searchParams }: { params: { category: string }, searchParams: { page?: string } }) {
  const { category } = params
  const { page = '1' } = searchParams
  const decodedCategory = decodeURIComponent(category)
  
  const categories = await getCategories()
  const currentCategory = categories.find((c) => c.id === decodedCategory)
  
  if (!currentCategory) {
    notFound()
  }

  const articles = await getArticles(decodedCategory)
  const categoryName = getCategoryFromId(decodedCategory)

  // 分页配置
  const itemsPerPage = 5
  const currentPage = parseInt(page, 10) || 1
  const totalItems = articles.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 计算当前页显示的文章
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = articles.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">{categoryName}</h1>
        
        {/* 搜索功能 */}
        <div className="mb-8">
          <BlogSearch articles={articles.map(article => ({
            ...article,
            id: article.slug,
            categoryName: categoryName
          }))} />
        </div>
        
        {/* 文章列表 */}
        <div className="space-y-6">
          {paginatedArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${decodedCategory}/${article.slug}`}
              className="block group"
            >
              <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                {article.description && (
                  <p className="text-muted-foreground mb-4">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center text-primary font-medium">
                  阅读全文
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              {currentPage > 1 && (
                <Link
                  href={`/blog/${decodedCategory}?page=${currentPage - 1}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`/blog/${decodedCategory}?page=${pageNum}`}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    pageNum === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {pageNum}
                </Link>
              ))}
              
              {currentPage < totalPages && (
                <Link
                  href={`/blog/${decodedCategory}?page=${currentPage + 1}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
```

**说明：**

- 支持分页功能，每页显示 5 篇文章
- 集成搜索功能，可以在当前分类中搜索文章
- 显示分类名称和文章列表
- 支持文章详情页导航

#### 5.4 文章详情页

创建 `src/app/blog/[category]/[slug]/page.tsx` 文件，实现文章详情页：

```typescript
import { notFound } from 'next/navigation'
import { getArticle, getArticles } from '@/lib/blog'
import { ArticlePageClient } from '@/components/blog/ArticlePageClient'

export default async function ArticlePage({ params }: { params: { category: string; slug: string } }) {
  const { category, slug } = params
  const decodedCategory = decodeURIComponent(category)
  
  const article = await getArticle(decodedCategory, slug)
  const articles = await getArticles(decodedCategory)
  
  if (!article) {
    notFound()
  }
  
  // 查找上一篇和下一篇文章
  const articleIndex = articles.findIndex(a => a.slug === slug)
  const prevArticle = articleIndex > 0 ? articles[articleIndex - 1] : null
  const nextArticle = articleIndex < articles.length - 1 ? articles[articleIndex + 1] : null

  return (
    <ArticlePageClient
      article={article}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
      category={decodedCategory}
    />
  )
}
```

#### 5.5 文章页面客户端组件

创建 `src/components/blog/ArticlePageClient.tsx` 文件，实现文章页面的客户端功能：

```typescript
'use client'

import { ArticleContent } from './ArticleContent'
import { ArticleHeader } from './ArticleHeader'
import { ArticleNavigation } from './ArticleNavigation'
import { ArticleQuiz } from './ArticleQuiz'
import { CommentSection } from './CommentSection'
import { LastVisitedBarWrapper } from './LastVisitedBarWrapper'
import { TextSelectionHandler } from './TextSelectionHandler'
import { ArticleDownloadButton } from './ArticleDownloadButton'
import { CollapsibleToc } from './CollapsibleToc'
import { useState, useEffect } from 'react'

interface Article {
  slug: string
  title: string
  description?: string
  category: string
  content: string
}

interface ArticlePageClientProps {
  article: Article
  prevArticle: Article | null
  nextArticle: Article | null
  category: string
}

export function ArticlePageClient({ article, prevArticle, nextArticle, category }: ArticlePageClientProps) {
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([])
  
  // 提取文章目录
  useEffect(() => {
    const extractToc = (content: string) => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm
      const headings: { id: string; text: string; level: number }[] = []
      let match
      
      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        
        headings.push({ id, text, level })
      }
      
      setToc(headings)
    }
    
    extractToc(article.content)
  }, [article.content])

  return (
    <div className="min-h-screen py-12">
      <TextSelectionHandler />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏目录 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CollapsibleToc toc={toc} />
              <div className="mt-6">
                <ArticleDownloadButton content={article.content} title={article.title} />
              </div>
            </div>
          </div>
          
          {/* 文章内容 */}
          <div className="lg:col-span-3">
            <ArticleHeader title={article.title} description={article.description} />
            
            <ArticleContent content={article.content} />
            
            <ArticleNavigation prev={prevArticle} next={nextArticle} category={category} />
            
            <ArticleQuiz content={article.content} title={article.title} />
            
            <CommentSection />
          </div>
        </div>
      </div>
      
      <LastVisitedBarWrapper />
    </div>
  )
}
```

#### 5.6 博客搜索功能

创建 `src/app/blog/BlogSearch.tsx` 文件，实现博客搜索功能：

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description?: string
  category: string
  categoryName: string
  content: string
}

interface BlogSearchProps {
  articles: Article[]
}

export function BlogSearch({ articles }: BlogSearchProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])

  // 搜索功能
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }
    
    const keyword = searchKeyword.toLowerCase()
    const results = articles.filter(article => {
      return (
        article.title.toLowerCase().includes(keyword) ||
        article.content.toLowerCase().includes(keyword)
      )
    })
    
    setSearchResults(results)
  }, [searchKeyword, articles])

  // 清除搜索
  const clearSearch = () => {
    setSearchKeyword('')
    setSearchResults([])
  }

  return (
    <div className="relative">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索文章..."
          className="w-full p-3 pl-10 pr-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        {searchKeyword && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* 搜索结果数量 */}
      {searchResults.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          找到 {searchResults.length} 篇相关文章
        </p>
      )}
      
      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 border border-border rounded-lg p-4 max-h-96 overflow-y-auto bg-background/90 backdrop-blur-sm shadow-lg">
          {searchResults.map((article) => (
            <Link
              key={`${article.category}-${article.id}`}
              href={`/blog/${article.category}/${article.id}`}
              className="block p-3 hover:bg-muted/50 rounded-md transition-colors mb-2"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {article.categoryName}
                </span>
              </div>
              {article.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {article.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
      
      {/* 加载状态 */}
      {articles.length === 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          加载中...
        </div>
      )}
    </div>
  )
}
```

**说明：**

- 实时搜索：输入时实时显示搜索结果
- 模糊匹配：支持标题和内容的模糊匹配
- 结果显示：显示搜索结果数量和详细信息
- 响应式设计：适配不同屏幕尺寸

### 6. AI 助手功能

#### 6.1 创建 AI 助手上下文

创建 `src/components/ai/AIAssistantContext.tsx` 文件：

```typescript
/**
 * AI助手全局状态管理Context
 * 
 * 功能：
 * - 提供全局AI助手状态管理
 * - 支持从任何组件打开AI助手并传入初始消息
 * - 统一悬浮球和文本选择两种触发方式
 * 
 * @returns AIAssistantProvider组件和useAIAssistant hook
 */

'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface AIAssistantContextType {
  isOpen: boolean
  initialMessage: string | undefined
  openAIAssistant: (message?: string) => void
  closeAIAssistant: () => void
  toggleAIAssistant: () => void
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined)

  const openAIAssistant = useCallback((message?: string) => {
    if (message) {
      setInitialMessage(message)
    }
    setIsOpen(true)
  }, [])

  const closeAIAssistant = useCallback(() => {
    setIsOpen(false)
    // 延迟清除初始消息，避免动画期间内容消失
    setTimeout(() => {
      setInitialMessage(undefined)
    }, 300)
  }, [])

  const toggleAIAssistant = useCallback(() => {
    setIsOpen(prev => {
      if (prev) {
        // 关闭时清除初始消息
        setTimeout(() => {
          setInitialMessage(undefined)
        }, 300)
      }
      return !prev
    })
  }, [])

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        initialMessage,
        openAIAssistant,
        closeAIAssistant,
        toggleAIAssistant
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider')
  }
  return context
}
```

**说明：**

- `createContext`：创建 AI 助手上下文
- `AIAssistantProvider`：提供 AI 助手状态和方法
- `useAIAssistant`：使用 AI 助手上下文的 Hook
- `useCallback`：优化函数性能，避免不必要的重渲染
- 支持侧边栏的打开/关闭状态管理
- 支持初始消息设置，带有延迟清除机制

#### 6.2 创建 AI 助手组件

创建 `src/components/ai/AIAssistant.tsx` 文件：

```typescript
/**
 * AI助手主组件
 * 
 * 功能：
 * - 集成悬浮球和侧边栏
 * - 管理侧边栏的打开/关闭状态
 * - 提供统一的AI助手入口
 * - 支持从文本选择传入初始消息
 * 
 * 使用方式：
 * 在layout.tsx中导入并使用AIAssistantProvider包裹应用
 * 然后在需要的地方使用AIAssistant组件
 * 
 * @returns AI助手主组件
 */

'use client'

import { useState, useEffect } from 'react'
import { FloatingBall } from './FloatingBall'
import { AISidebar } from './AISidebar'
import { useAIAssistant } from './AIAssistantContext'

export function AIAssistant() {
  const { isOpen, initialMessage, toggleAIAssistant, closeAIAssistant } = useAIAssistant()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) return null

  return (
    <>
      <FloatingBall onToggleSidebar={toggleAIAssistant} />
      <AISidebar 
        isOpen={isOpen} 
        onClose={closeAIAssistant}
        initialMessage={initialMessage}
      />
    </>
  )
}
```

**说明：**

- `useAIAssistant`：使用 AI 助手上下文
- `FloatingBall`：悬浮球组件，作为 AI 助手的入口
- `AISidebar`：侧边栏组件，显示 AI 聊天界面
- 响应式设计：在移动设备上不显示 AI 组件

#### 6.3 创建 AI 侧边栏组件

创建 `src/components/ai/AISidebar.tsx` 文件：

```typescript
/**
 * AI助手侧边栏组件
 * 
 * 功能：
 * - 从页面右侧滑出
 * - 包含标题栏、关闭按钮、消息区域、输入区域
 * - 支持响应式设计（桌面端 350-400px，移动端全屏）
 * - 集成 AI 交互逻辑和对话历史记录
 * - 支持 Markdown 渲染（标题降级显示）
 * - 半透明背景、圆角边框、自动伸缩
 * - 支持初始消息自动发送
 * - 全部加载完成后自动滚动
 * 
 * @param props 组件属性
 * @returns 侧边栏组件
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Maximize2, Minimize2, Copy, Check } from 'lucide-react'
import { useAIChat } from '@/hooks/ai/useAIChat'
import { useChatHistory } from '@/hooks/ai/useChatHistory'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css'

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: string
}

const SIDEBAR_WIDTH = 380

// 代码块复制按钮组件
function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = useCallback(async () => {
    if (!code.trim()) return
    
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [code])
  
  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-1 right-1 p-1 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="复制代码"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
      <pre className={className}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function AISidebar({ isOpen, onClose, initialMessage }: AISidebarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const hasProcessedInitialMessage = useRef(false)
  const prevMessagesLength = useRef(0)
  
  const { 
    messages, 
    isLoading, 
    error, 
    streamingText, 
    isStreaming,
    handleSendMessage: aiHandleSendMessage, 
    clearMessages 
  } = useAIChat()

  const { 
    history, 
    saveHistory 
  } = useChatHistory()

  // 处理初始消息 - 只处理一次
  useEffect(() => {
    if (initialMessage && isOpen && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true
      // 延迟发送，确保侧边栏动画完成
      setTimeout(() => {
        aiHandleSendMessage(initialMessage)
      }, 300)
    }
  }, [initialMessage, isOpen, aiHandleSendMessage])

  // 当侧边栏关闭时重置标记
  useEffect(() => {
    if (!isOpen) {
      hasProcessedInitialMessage.current = false
    }
  }, [isOpen])

  const handleClearHistory = useCallback(() => {
    clearMessages()
    if (textareaRef.current) {
      textareaRef.current.value = ''
    }
  }, [clearMessages])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        saveHistory([...history, lastMessage])
      }
    }
  }, [messages, saveHistory, history])

  // 自动滚动 - 只在消息完全加载后滚动（消息数量增加且不在加载中）
  useEffect(() => {
    // 只有当消息数量增加且不在加载中时才滚动
    if (messages.length > prevMessagesLength.current && !isLoading && !isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessagesLength.current = messages.length
  }, [messages, isLoading, isStreaming])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // ReactMarkdown 自定义组件 - 标题降级：h1->h4, h2->h5, h3->h6
  const markdownComponents = {
    pre: ({ children }: { children?: React.ReactNode }) => {
      // 从children中提取代码文本
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node
        if (typeof node === 'number') return String(node)
        if (Array.isArray(node)) return node.map(extractText).join('')
        if (node && typeof node === 'object') {
          // 检查是否是React元素
          const element = node as any
          if (element.props && element.props.children) {
            return extractText(element.props.children)
          }
        }
        return ''
      }
      const code = extractText(children)
      return <CodeBlock code={code} className="bg-muted/50 p-2 rounded overflow-x-auto my-1 text-[10px]" />
    },
    code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: any }) => {
      const isInline = !className?.includes('language-')
      if (isInline) {
        return <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px]" {...props}>{children}</code>
      }
      return <code className={className} {...props}>{children}</code>
    },
    // 标题降级：h1->h4, h2->h5, h3->h6
    h1: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h4 className="text-xs font-bold mt-2 mb-1" {...props}>{children}</h4>
    ),
    h2: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h5 className="text-xs font-semibold mt-2 mb-1" {...props}>{children}</h5>
    ),
    h3: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-1" {...props}>{children}</h6>
    ),
    h4: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-0.5" {...props}>{children}</h6>
    ),
    h5: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-0.5" {...props}>{children}</h6>
    ),
    h6: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-0.5" {...props}>{children}</h6>
    ),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[380px] bg-background backdrop-blur-sm border-l border-border shadow-2xl z-50 rounded-l-2xl"
            style={{
              borderTopLeftRadius: '1rem',
              borderBottomLeftRadius: '1rem',
              width: SIDEBAR_WIDTH
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground">AI助手</h2>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-muted/50 rounded transition-colors"
                    title={isExpanded ? '收起' : '展开'}
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="p-2 hover:bg-muted/50 rounded transition-colors text-xs text-muted-foreground"
                    title="清除历史"
                  >
                    清除历史
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted/50 rounded transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div 
                className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
                  isExpanded ? 'flex-1' : 'flex-1'
                }`}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="text-sm font-medium">
                          {message.role === 'user' ? '你' : 'AI'}
                        </span>
                      </div>
                      <div className={`flex-1 rounded-lg p-3 overflow-hidden ${
                        message.role === 'user' 
                          ? 'bg-primary/10' 
                          : 'bg-muted/80'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-xs dark:prose-invert max-w-none [&_*]:text-xs [&_p]:m-0 [&_p]:mb-1 [&_ul]:m-0 [&_ul]:mb-1 [&_ol]:m-0 [&_ol]:mb-1 [&_li]:m-0 [&_code]:text-[10px] [&_pre]:text-[10px]">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="w-8 h-8 border-2 border-primary rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground ml-2">AI 正在思考...</span>
                    </div>
                  )}
                  {error && (
                    <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className={`p-4 border-t border-border/50 transition-all duration-300 ${
                isExpanded ? 'h-auto' : 'h-[50%]'
              }`}>
                <div className="flex gap-2 h-full">
                  <textarea
                    ref={textareaRef}
                    placeholder="输入您的问题..."
                    disabled={isLoading}
                    className="flex-1 p-3 bg-input/80 border border-border/80 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/80 resize-none transition-all"
                    style={{
                      height: isExpanded ? 'auto' : '100%'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        const message = textareaRef.current?.value || ''
                        if (message.trim()) {
                          aiHandleSendMessage(message.trim())
                          if (textareaRef.current) {
                            textareaRef.current.value = ''
                          }
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const message = textareaRef.current?.value || ''
                      if (message.trim()) {
                        aiHandleSendMessage(message.trim())
                        if (textareaRef.current) {
                          textareaRef.current.value = ''
                        }
                      }
                    }}
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary/90 text-primary-foreground rounded-lg font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send size={20} />
                    <span className="hidden md:inline">发送</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

**说明：**

- `useAIChat`：使用 AI 聊天 Hook，处理 AI 交互逻辑
- `useChatHistory`：使用聊天历史 Hook，处理对话历史记录
- `ReactMarkdown`：渲染 AI 回复的 Markdown 内容
- `motion`：使用 Framer Motion 实现平滑的动画效果
- 支持代码块复制功能
- 支持 Markdown 渲染，包括标题降级显示
- 支持初始消息自动发送
- 支持自动滚动到最新消息
- 响应式设计，适配不同屏幕尺寸

#### 6.4 创建 AI 聊天 Hook

创建 `src/hooks/ai/useAIChat.ts` 文件：

```typescript
/**
 * AI对话交互逻辑 Hook
 * 
 * 功能：
 * - 管理对话状态
 * - 调用阿里云百炼平台 API 实现流式输出
 * - 处理加载状态和错误
 * - 支持对话历史记录
 * 
 * @returns AI对话相关状态和方法
 */

'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface AIConfig {
  apiKey: string
  apiUrl: string
  model: string
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamingTextRef = useRef('')
  const isStreamingRef = useRef(false)
  const streamingMessageIdRef = useRef<string | null>(null)

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const streamAIResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true)
    setError(null)
    streamingTextRef.current = ''
    isStreamingRef.current = true
    
    const messageId = `${Date.now()}-${Math.random()}`
    streamingMessageIdRef.current = messageId

    try {
      const config: AIConfig = {
        apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || 'sk-86c926b97fd244fd86412b3f11a5c1be',
        apiUrl: process.env.NEXT_PUBLIC_AI_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: process.env.NEXT_PUBLIC_AI_MODEL || 'qwen-turbo'
      }

      if (!config.apiKey) {
        throw new Error('未配置 AI API 密钥，请在环境变量中设置 NEXT_PUBLIC_AI_API_KEY')
      }

      console.log('正在调用 API:', config.apiUrl)
      console.log('使用模型:', config.model)

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            ...messages.slice(-10).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          stream: true
        })
      })

      console.log('API 响应状态:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 错误响应:', errorText)
        throw new Error(`API 调用失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应流')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]' || !data) {
              continue
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || parsed.output?.text || ''
              
              if (content) {
                streamingTextRef.current += content
                
                const assistantMessage: ChatMessage = {
                  id: messageId,
                  role: 'assistant',
                  content: streamingTextRef.current,
                  timestamp: Date.now()
                }
                
                setMessages(prev => {
                  const filtered = prev.filter(m => m.id !== messageId)
                  return [...filtered, assistantMessage]
                })
              }
            } catch (e) {
              console.error('解析流式响应失败:', e, '原始数据:', data)
            }
          }
        }
      }

      isStreamingRef.current = false
      setIsLoading(false)
      streamingMessageIdRef.current = null

    } catch (err) {
      console.error('AI API 调用错误:', err)
      setError(err instanceof Error ? err.message : '发生未知错误')
      setIsLoading(false)
      isStreamingRef.current = false
      streamingMessageIdRef.current = null
    }
  }, [messages])

  const handleSendMessage = useCallback((message: string) => {
    addMessage('user', message)
    streamAIResponse(message)
  }, [addMessage, streamAIResponse])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    streamingMessageIdRef.current = null
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return {
    messages,
    isLoading,
    error,
    streamingText: streamingTextRef.current,
    isStreaming: isStreamingRef.current,
    addMessage,
    handleSendMessage,
    clearMessages,
    removeMessage
  }
}
```

**说明：**

- `useState`：管理对话状态、加载状态和错误状态
- `useCallback`：优化函数性能，避免不必要的重渲染
- `useRef`：管理流式输出的文本和状态
- `streamAIResponse`：调用 AI API 实现流式输出
- 支持从环境变量读取 API 配置
- 支持对话历史记录，最多保留最近 10 条消息
- 错误处理：捕获并显示 API 调用错误

#### 6.5 创建聊天历史 Hook

创建 `src/hooks/ai/useChatHistory.ts` 文件：

```typescript
/**
 * 聊天历史记录管理 Hook
 * 
 * 功能：
 * - 从 localStorage 加载历史记录
 * - 保存历史记录到 localStorage
 * - 提供历史记录管理方法
 * 
 * @returns 聊天历史相关状态和方法
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from './useAIChat'

const STORAGE_KEY = 'ai-chat-history'
const MAX_HISTORY_ITEMS = 50

export function useChatHistory() {
  const [history, setHistory] = useState<ChatMessage[]>([])

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setHistory(Array.isArray(parsedHistory) ? parsedHistory : [])
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error)
      setHistory([])
    }
  }, [])

  // 保存历史记录到 localStorage
  const saveHistory = useCallback((newHistory: ChatMessage[]) => {
    try {
      // 限制历史记录数量
      const limitedHistory = newHistory.slice(-MAX_HISTORY_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory))
      setHistory(limitedHistory)
    } catch (error) {
      console.error('保存聊天历史失败:', error)
    }
  }, [])

  // 清除历史记录
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setHistory([])
    } catch (error) {
      console.error('清除聊天历史失败:', error)
    }
  }, [])

  return {
    history,
    saveHistory,
    clearHistory
  }
}
```

**说明：**

- `useState`：管理聊天历史状态
- `useEffect`：从 localStorage 加载历史记录
- `useCallback`：优化函数性能，避免不必要的重渲染
- `saveHistory`：保存历史记录到 localStorage，限制最大数量为 50 条
- `clearHistory`：清除历史记录

#### 6.6 创建悬浮球组件

创建 `src/components/ai/FloatingBall.tsx` 文件：

```typescript
/**
 * 悬浮球组件
 * 
 * 功能：
 * - 悬浮在页面右下角
 * - 点击打开/关闭AI助手侧边栏
 * - 支持拖拽移动
 * - 响应式设计（移动端隐藏）
 * 
 * @param props 组件属性
 * @returns 悬浮球组件
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain } from 'lucide-react'

interface FloatingBallProps {
  onToggleSidebar: () => void
}

export function FloatingBall({ onToggleSidebar }: FloatingBallProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const ballRef = useRef<HTMLDivElement>(null)

  // 初始化位置
  useEffect(() => {
    const initializePosition = () => {
      if (typeof window !== 'undefined') {
        const x = window.innerWidth - 80
        const y = window.innerHeight - 80
        setPosition({ x, y })
        setLastPosition({ x, y })
      }
    }

    initializePosition()
    window.addEventListener('resize', initializePosition)
    return () => window.removeEventListener('resize', initializePosition)
  }, [])

  // 处理鼠标按下事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }, [])

  // 处理鼠标移动事件
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (ballRef.current) {
        const x = e.clientX - 25 // 25 是球的半径
        const y = e.clientY - 25
        
        // 限制在屏幕内
        const constrainedX = Math.max(0, Math.min(x, window.innerWidth - 50))
        const constrainedY = Math.max(0, Math.min(y, window.innerHeight - 50))
        
        setPosition({ x: constrainedX, y: constrainedY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setLastPosition(position)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, position])

  // 处理点击事件
  const handleClick = useCallback(() => {
    if (!isDragging) {
      onToggleSidebar()
    }
  }, [isDragging, onToggleSidebar])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ballRef}
          className="fixed z-40 cursor-move"
          style={{
            left: position.x,
            top: position.y,
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            userSelect: 'none',
            touchAction: 'none'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          <Brain className="h-6 w-6 text-white" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**说明：**

- `motion`：使用 Framer Motion 实现平滑的动画效果
- 支持拖拽移动功能
- 初始化位置在页面右下角
- 响应式设计，在窗口大小改变时重新定位
- 点击事件：只有在非拖拽状态下才触发侧边栏切换

#### 6.7 在布局中使用 AI 助手

修改 `src/app/layout.tsx` 文件，添加 AI 助手提供者：

```typescript
import { Providers } from './providers'
import { CustomCursor } from '@/components/CustomCursor'
import { AIAssistantProvider } from '@/components/ai/AIAssistantContext'
import { AIAssistant } from '@/components/ai/AIAssistant'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
          <AIAssistantProvider>
            <CustomCursor />
            <AIAssistant />
            {children}
          </AIAssistantProvider>
        </Providers>
      </body>
    </html>
  )
}
```

**说明：**

- `AIAssistantProvider`：提供 AI 助手上下文
- `AIAssistant`：AI 助手主组件，包含悬浮球和侧边栏
- 放在 `Providers` 内部，确保能访问到主题等上下文

#### 6.8 创建文本选择处理组件

创建 `src/components/blog/TextSelectionHandler.tsx` 文件：

```typescript
/**
 * 文本选择处理组件
 * 
 * 功能：
 * - 监听文本选择事件
 * - 显示浮动工具栏
 * - 支持将选中的文本发送给AI助手
 * 
 * @returns 文本选择处理组件
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Copy, Share2 } from 'lucide-react'
import { useAIAssistant } from '@/components/ai/AIAssistantContext'

export function TextSelectionHandler() {
  const [selection, setSelection] = useState<string>('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const { openAIAssistant } = useAIAssistant()

  // 处理文本选择事件
  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      setSelection(selection.toString().trim())
      setPosition({
        x: rect.left + rect.width / 2 - 60, // 60 是工具栏宽度的一半
        y: rect.top - 40 // 40 是工具栏高度
      })
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [])

  // 监听文本选择事件
  useEffect(() => {
    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('touchend', handleSelection)
    
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('touchend', handleSelection)
    }
  }, [handleSelection])

  // 处理点击外部事件
  useEffect(() => {
    const handleClickOutside = () => {
      setIsVisible(false)
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isVisible])

  // 处理复制事件
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(selection)
    setIsVisible(false)
  }, [selection])

  // 处理分享事件
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: '分享文本',
        text: selection
      })
    }
    setIsVisible(false)
  }, [selection])

  // 处理 AI 助手事件
  const handleAI = useCallback(() => {
    openAIAssistant(`请解释这段文本：${selection}`)
    setIsVisible(false)
  }, [selection, openAIAssistant])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-2 flex gap-2"
          style={{
            left: position.x,
            top: position.y,
            width: 120
          }}
          initial={{ opacity: 0, scale: 0.8, y: position.y + 10 }}
          animate={{ opacity: 1, scale: 1, y: position.y }}
          exit={{ opacity: 0, scale: 0.8, y: position.y + 10 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleCopy}
            className="p-2 rounded hover:bg-muted transition-colors"
            title="复制"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded hover:bg-muted transition-colors"
            title="分享"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleAI}
            className="p-2 rounded hover:bg-primary/10 transition-colors text-primary"
            title="问 AI"
          >
            <Brain className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**说明：**

- 监听文本选择事件，显示浮动工具栏
- 支持复制、分享和发送给 AI 助手功能
- 使用 Framer Motion 实现平滑的动画效果
- 响应式设计，适配不同屏幕尺寸

#### 6.9 在文章页面中使用文本选择处理

修改 `src/components/blog/ArticlePageClient.tsx` 文件，添加文本选择处理：

```typescript
import { TextSelectionHandler } from './TextSelectionHandler'

// 在组件返回的 JSX 中添加
return (
  <div className="min-h-screen">
    <TextSelectionHandler />
    {/* 其他组件内容 */}
  </div>
)
```

**说明：**

- `TextSelectionHandler`：文本选择处理组件，监听文本选择事件
- 放在文章页面的根元素中，确保能监听整个页面的文本选择事件

### 7. 视频集成功能

#### 7.1 创建增强版 B 站播放器组件

创建 `src/components/video/EnhancedBilibiliPlayer.tsx` 文件：

```typescript
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Maximize, 
  Minimize, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MonitorPlay,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Filter,
  ChevronDown,
  Grid3X3,
  List,
  SkipBack,
  SkipForward
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface VideoEpisode {
  id: number
  title: string
  duration?: string
  isWatched?: boolean
  progress?: number
}

interface EnhancedBilibiliPlayerProps {
  bvid: string
  title?: string
  totalEpisodes?: number
}

// localStorage keys
const getWatchedKey = (bvid: string) => `bilibili_watched_episodes_${bvid}`
const getLastEpisodeKey = (bvid: string) => `bilibili_last_episode_${bvid}`
const getPlaybackProgressKey = (bvid: string) => `bilibili_playback_progress_${bvid}`

// Java基础视频选集 (BV17F411T7Ao)
const javaBasicVideoTitles: string[] = [
  'Java入门-01-Java学习介绍',
  'Java入门-02-人机交互-图形化界面的小故事',
  'Java入门-03-打开CMD',
  'Java入门-04-常见的CMD命令',
  'Java入门-05-练习-利用CMD打开QQ并配置环境变量',
  'Java入门-06-Java概述和学习方法',
  'Java入门-07-Java学习-JDK下载和安装',
  'Java入门-08-Java学习-HelloWorld小案例',
  'Java入门-09-Java学习-常见小问题',
  'Java入门-10-Java学习-环境变量',
  'Java入门-11-Java学习-Notepad',
  'Java入门-12-Java学习-Java语言的发展',
  'Java入门-13-Java学习-Java能干什么',
  'Java入门-14-Java学习-Java为什么这么火',
  'Java入门-15-Java学习-Java跨平台的原理',
  'Java入门-16-JDK和JRE',
  'Java基础概念-01-02-注释和关键字',
  'Java基础概念-03-字面量',
  'Java基础概念-04-变量-基本用法',
  'Java基础概念-05-变量-使用方式和注意事项',
  'Java基础概念-06-变量练习-计算公交车的人数',
  'Java基础概念-07-计算机中的数据存储',
  'Java基础概念-08-数据类型',
  'Java基础概念-09-定义变量的三个练习',
  'Java基础概念-10-标识符',
  'Java基础概念-11-键盘录入',
  'Java基础概念-12-idea的概述和下载安装',
  'Java基础概念-13-idea中的第一个代码',
  'Java基础概念-14-AI工具和IDEA的相关设置',
  '运算符-01-03-算术运算符详解和综合练习',
  '运算符-04-05-隐式转换和强制转换',
  '运算符-06-字符串和字符的加操作',
  '运算符-07-自增自减运算符-基本使用',
  '运算符-08-赋值运算符和关系运算符',
  '运算符-09-四种逻辑运算符',
  '运算符-10-短路逻辑运算符',
  '运算符-11-三元运算符和运算符的优先级',
  '运算符-12-多学一招原码反码补码',
  '判断和循环-01-流程控制语句-顺序结构',
  '判断和循环-02-if第一种格式和注意事项加练习',
  '判断和循环-03-if的第二种格式和练习',
  '判断和循环-04-if的第三种格式',
  '判断和循环-05-switch语句和练习',
  '判断和循环-06-switch的扩展知识点和练习',
  '判断和循环-07-循环语句-for循环格式和练习',
  '判断和循环-08-for循环练习-累加思想和统计思想',
  '判断和循环-09-循环语句-while',
  '判断和循环-10-两道力扣算法题和do...while循环',
  '循环高级综合练习-01-无限循环和跳转控制语句',
  '循环高级综合练习-02-逢七过',
  '循环高级综合练习-03-平方根',
  '循环高级综合练习-04-判断是否为质数',
  '循环高级综合练习-05-猜数字小游戏',
  '数组-01-数组的概述和静态初始化',
  '数组-02-数组的地址值和元素访问',
  '数组-03-数组的遍历和三道综合练习',
  '数组-04-数组的动态初始化和常见问题',
  '数组-05-数组练习1-求最值',
  '数组-06-数组练习2-求和并统计个数',
  '数组-07-数组练习3-交换数据',
  '数组-08-数组练习4-打乱数据',
  '数组-09-数组的内存图',
  '方法-01-什么是方法？',
  '方法-02-最简单的方法定义和调用',
  '方法-03-带参数的方法定义和调用',
  '方法-04-带返回值方法的定义和调用',
  '方法-05-方法的小结',
  '方法-06-方法的重载',
  '方法-07-方法的三个练习：遍历求最大值和判断是否存在',
  '方法-08-方法练习-拷贝数组',
  '方法-09-方法的基本内存原理',
  '方法-10-什么是基本数据类型和引用数据类型',
  '方法-11-方法的值传递',
  '综合练习-01~02-买飞机票和找质数',
  '综合练习-03~04-开发验证码和数组元素的复制',
  '综合练习-05-评委打分',
  '综合练习-06-数字加密和解密',
  '综合练习-07-抽奖的两种实现方式',
  '面向对象-01-面向对象介绍',
  '面向对象-02-类和对象',
  '面向对象-03-封装',
  '面向对象-04-构造方法',
  '面向对象-05-标准JavaBean',
  '面向对象-06-对象内存图',
  '面向对象-07-this关键字',
  '面向对象-08-成员变量和局部变量',
  '面向对象-09-综合练习-文字版格斗游戏',
  '面向对象-10-综合练习-两个对象数组练习',
  '面向对象-11-综合练习-对象数组练习3和4',
  '面向对象-12-综合练习-键盘录入',
  '字符串-01-API和API帮助文档',
  '字符串-02-String概述',
  '字符串-03-String构造方法',
  '字符串-04-String成员方法-比较',
  '字符串-05-String成员方法-遍历、替换、截取',
  '字符串-06-StringBuilder概述',
  '字符串-07-StringBuilder构造方法和成员方法',
  '字符串-08-StringJoiner',
  '字符串-09-字符串原理-扩展底层原理1',
  '字符串-10-字符串原理-扩展底层原理2和3',
  '字符串-11-综合练习-01-转换罗马数字',
  '字符串-12-综合练习-02-调整字符串',
  '字符串-13-综合练习-03-打乱字符串',
  '字符串-14-综合练习-04-生成验证码',
  '集合-01-集合体系结构',
  '集合-02-Collection集合-常用方法',
  '集合-03-Collection集合-遍历方式',
  '集合-04-List集合-特点和特有方法',
  '集合-05-List集合-五种遍历方式',
  '集合-06-数据结构-栈和队列',
  '集合-07-数据结构-数组和链表',
  '集合-08-ArrayList集合-底层原理',
  '集合-09-LinkedList集合',
  '集合-10-泛型-概述',
  '集合-11-泛型-细节',
  '集合-12-泛型-通配符',
  '集合-13-Set集合-概述',
  '集合-14-Set集合-HashSet',
  '集合-15-Set集合-LinkedHashSet',
  '集合-16-Set集合-TreeSet',
  '集合-17-双列集合-Map集合-特点',
  '集合-18-双列集合-Map集合-常用方法',
  '集合-19-双列集合-Map集合-遍历方式',
  '集合-20-双列集合-HashMap',
  '集合-21-双列集合-LinkedHashMap',
  '集合-22-双列集合-TreeMap',
  '集合-23-可变参数',
  '集合-24-综合练习-01-随机点名器',
  '集合-25-综合练习-02-带有概率的随机点名',
  '集合-26-综合练习-03-集合嵌套',
  '集合-27-综合练习-04-斗地主发牌',
  '集合-28-综合练习-05-斗地主发牌2',
  '集合-29-Stream流-初体验',
  '集合-30-Stream流-生成方式',
  '集合-31-Stream流-中间方法',
  '集合-32-Stream流-终结方法',
  '集合-33-方法引用-概述',
  '集合-34-方法引用-引用静态方法',
  '集合-35-方法引用-引用成员方法',
  '集合-36-方法引用-引用构造方法',
  '集合-37-方法引用-其他调用方式',
  '异常-01-异常-概述',
  '异常-02-异常-体系介绍',
  '异常-03-异常-作用',
  '异常-04-异常-处理方式-throws',
  '异常-05-异常-处理方式-try...catch',
  '异常-06-异常-常见方法',
  '异常-07-异常-综合练习',
  '异常-08-异常-自定义异常',
  'File-01-File-概述和构造方法',
  'File-02-File-成员方法-判断和获取',
  'File-03-File-成员方法-创建和删除',
  'File-04-File-成员方法-获取并遍历',
  'File-05-File-综合练习-01-创建文件夹',
  'File-06-File-综合练习-02-查找文件',
  'File-07-File-综合练习-03-删除多级文件夹',
  'File-08-File-综合练习-04-统计文件大小',
  'IO流-01-IO流-概述和分类',
  'IO流-02-IO流-字节流-书写和读取',
  'IO流-03-IO流-字节流-文件拷贝',
  'IO流-04-IO流-字节流-文件拷贝的弊端',
  'IO流-05-IO流-字节流-一次读取多个字节',
  'IO流-06-IO流-字符流-编码表',
  'IO流-07-IO流-字符流-书写和读取',
  'IO流-08-IO流-字符流-书写和读取2',
  'IO流-09-IO流-字符流-拷贝文件',
  'IO流-10-IO流-字符流-缓冲区',
  'IO流-11-IO流-字节流和字符流的使用场景',
  'IO流-12-IO流-综合练习-01-拷贝文件夹',
  'IO流-13-IO流-综合练习-02-文件加密',
  'IO流-14-IO流-综合练习-03-数字排序',
  'IO流-15-IO流-综合练习-04-软件运行次数',
  'IO流-16-IO流-高级流-缓冲流-字节缓冲流',
  'IO流-17-IO流-高级流-缓冲流-字符缓冲流',
  'IO流-18-IO流-高级流-转换流-概述和分类',
  'IO流-19-IO流-高级流-转换流-书写和读取',
  'IO流-20-IO流-高级流-序列化流和反序列化流',
  'IO流-21-IO流-高级流-打印流',
  'IO流-22-IO流-高级流-解压缩流和压缩流',
  'IO流-23-IO流-高级流-Commons-io',
  'IO流-24-IO流-高级流-hutool工具包',
  'IO流-25-IO流-综合练习-01-网络爬虫',
  'IO流-26-IO流-综合练习-02-利用糊涂包生成假数据',
  'IO流-27-IO流-综合练习-03-带权重的随机',
  'IO流-28-IO流-综合练习-04-多线程下载',
  '多线程-01-多线程-概述',
  '多线程-02-多线程-并发和并行',
  '多线程-03-多线程的实现方式-继承Thread类',
  '多线程-04-多线程的实现方式-实现Runnable接口',
  '多线程-05-多线程的实现方式-实现Callable接口',
  '多线程-06-多线程-常见的成员方法',
  '多线程-07-多线程-线程的生命周期',
  '多线程-08-多线程-线程安全问题-同步代码块',
  '多线程-09-多线程-线程安全问题-同步方法',
  '多线程-10-多线程-线程安全问题-Lock锁',
  '多线程-11-多线程-死锁',
  '多线程-12-多线程-等待唤醒机制',
  '多线程-13-多线程-等待唤醒机制-阻塞队列',
  '多线程-14-多线程-线程的状态',
  '多线程-15-多线程-综合练习-01-抽奖',
  '多线程-16-多线程-综合练习-02-多线程下载',
  '多线程-17-多线程-线程池-概述',
  '多线程-18-多线程-线程池-自定义线程池',
  '多线程-19-多线程-线程池-最大并行数',
  '网络编程-01-网络编程三要素-概述',
  '网络编程-02-网络编程三要素-IP',
  '网络编程-03-网络编程三要素-端口号',
  '网络编程-04-网络编程三要素-协议',
  '网络编程-05-UDP-发送端',
  '网络编程-06-UDP-接收端',
  '网络编程-07-UDP-练习-聊天室',
  '网络编程-08-UDP-三种通讯方式-单播、组播、广播',
  '网络编程-09-TCP-客户端',
  '网络编程-10-TCP-服务器',
  '网络编程-11-TCP-练习-多发多收',
  '网络编程-12-TCP-练习-接收并反馈',
  '网络编程-13-TCP-练习-上传文件',
  '网络编程-14-TCP-练习-上传文件-优化',
  '网络编程-15-TCP-练习-BS架构',
  '反射-01-反射-概述',
  '反射-02-反射-获取class对象',
  '反射-03-反射-获取构造方法',
  '反射-04-反射-获取成员变量',
  '反射-05-反射-获取成员方法',
  '反射-06-反射-综合练习-01-保存任意对象数据',
  '反射-07-反射-综合练习-02-利用反射动态的创建对象并执行方法',
  '动态代理-01-动态代理-概述',
  '动态代理-02-动态代理-代码实现',
  '动态代理-03-动态代理-扩展-增强方法',
  '动态代理-04-动态代理-扩展-增强方法2',
  '动态代理-05-动态代理-扩展-无侵入式编程',
  'JUnit-01-JUnit-概述和基本使用',
  'JUnit-02-JUnit-常用注解',
  'JUnit-03-JUnit-断言',
]

// Web开发视频选集 (BV1yGydYEE3H)
const javaWebVideoTitles: string[] = [
  '01.Web开发-导学视频',
  '02.Web前端开发初识',
  '03.HTML-CSS-入门程序',
  '04.HTML-CSS-VsCode开发工具',
  '05.HTML-CSS-常见标签和样式-央视新闻-标题-排版',
  '06.HTML-CSS-常见标签和样式-央视新闻-标题-样式',
  '07.HTML-CSS-常见标签和样式-央视新闻-标题-样式(选择器)',
  '08.HTML-CSS-常见标签和样式-央视新闻-正文-排版',
  '09.HTML-CSS-常见标签和样式-央视新闻-正文-样式',
  '10.HTML-CSS-常见标签和样式-央视新闻-整体布局',
  '11.HTML-CSS-常见标签和样式-tlias案例-顶部导航栏',
  '12.HTML-CSS-常见标签和样式-表单标签',
  '13.HTML-CSS-常见标签和样式-表单项标签',
  '14.HTML-CSS-常见标签和样式-tlias案例-搜索表单区域',
  '15.HTML-CSS-常见标签和样式-tlias案例-底部版权区域',
  '16.HTML-CSS-课程总结',
  '17.JS-课程介绍',
  '18.JS-核心语法-引入方式',
  '19.JS-核心语法-变量&数据类型',
  '20.JS-核心语法-函数',
  '21.JS-核心语法-自定义对象&JSON',
  '22.JS-核心语法-DOM',
  '23.JS-事件监听-语法&常见事件',
  '24.JS-事件监听-常见事件(优化-JS模块化)',
  '25.Vue-快速入门',
  '26.Vue-常用指令-v-for',
  '27.Vue-常用指令-v-bind&v-if&v-show',
  '28.Vue-常用指令-v-model与v-on',
  '29.Ajax-入门',
  '30.Ajax-案例',
  '31.Maven-课程介绍',
  '32.Maven-概述-介绍&安装',
  '33.Maven-IDEA集成',
  '34.Maven-依赖管理',
  '35.单元测试-概述&入门',
  '36.单元测试-断言&常见注解',
  '37.单元测试-企业开发规范&AI生成生成单元测试',
  '38.单元测试-Maven依赖范围',
  '39.Maven-常见问题解决方案',
  '40.Web基础-课程安排',
  '41.Web基础-SpringBootWeb入门-入门程序',
  '42.Web基础-SpringBootWeb入门-入门解析',
  '43.Web基础-HTTP协议-概述',
  '44.Web基础-HTTP协议-请求协议',
  '45.Web基础-HTTP协议-响应协议',
  '46.Web基础-SpringBootWeb案例',
  '47.Web基础-分层解耦-三层架构',
  '48.Web基础-分层解耦-IOC与DI入门',
  '49.Web基础-分层解耦-IOC&DI详解',
  '50.MySQL-课程介绍',
  '51.MySQL-概述-安装&数据模型',
  '52.MySQL-SQL-DDL-数据库操作&图形化工具',
  '53.MySQL-SQL-DDL-表操作-创建表',
  '54.MySQL-SQL-DDL-表操作-数据类型',
  '55.MySQL-SQL-DDL-表操作-设计表案例',
  '56.MySQL-SQL-DDL-表操作-查询-修改-删除',
  '57.MySQL-SQL-DML-insert&update&delete',
  '58.MySQL-SQL-DQL-基本查询',
  '59.MySQL-SQL-DQL-条件查询',
  '60.MySQL-SQL-DQL-分组查询',
  '61.MySQL-SQL-DQL-排序查询&分页查询',
  '62.JDBC-入门程序',
  '63.JDBC-执行DQL语句',
  '64.JDBC-预编译SQL',
  '65.Mybatis-入门程序',
  '66.Mybatis-辅助配置&JDBC VS Mybatis',
  '67.Mybatis-数据库连接池',
  '68.Mybatis-增删改查-删除操作',
  '69.Mybatis-增删改查-新增操作',
  '70.Mybatis-增删改查-更新操作',
  '71.Mybatis-增删改查-查询操作',
  '72.Mybatis-XML映射配置',
  '73.SpringBoot项目配置文件',
  '74.准备工作-开发规范-开发模式',
  '75.准备工作-开发规范-Restful',
  '76.准备工作-工程搭建',
  '77.部门管理-列表查询-接口开发',
  '78.部门管理-列表查询-结果封装',
  '79.部门管理-列表查询-前后端联调测试',
  '80.部门管理-删除部门-接口开发',
  '81.部门管理-新增部门-接口开发',
  '82.部门管理-修改部门-查询回显',
  '83.部门管理-修改部门-修改数据',
  '84.日志技术-Logback入门程序',
  '85.日志技术-Logback配置文件&日志级别',
  '86.员工管理-分页查询-分析',
  '87.员工管理-分页查询-实现',
  '88.员工管理-分页查询-PageHelper插件',
  '89.员工管理-分页查询-前后端联调',
  '90.员工管理-条件分页查询',
  '91.员工管理-新增员工-分析',
  '92.员工管理-新增员工-实现',
  '93.文件上传-简介&前端三要素',
  '94.文件上传-服务端接收文件',
  '95.文件上传-本地存储',
  '96.文件上传-阿里云OSS-概述',
  '97.文件上传-阿里云OSS-入门',
  '98.文件上传-阿里云OSS-集成',
  '99.员工管理-修改员工',
  '100.员工管理-查询回显',
  '101.登录认证-概述',
  '102.登录认证-登录功能',
  '103.登录认证-登录校验-概述',
  '104.登录认证-登录校验-JWT令牌',
  '105.登录认证-登录校验-JWT令牌-生成',
  '106.登录认证-登录校验-JWT令牌-校验',
  '107.登录认证-登录校验-过滤器Filter',
  '108.登录认证-登录校验-拦截器Interceptor',
  '109.登录认证-登录校验-全局异常处理',
  '110.事务管理-事务回顾&Spring事务管理',
  '111.事务管理-事务进阶-事务属性',
  '112.AOP-基础-概述',
  '113.AOP-基础-核心概念',
  '114.AOP-基础-快速入门',
  '115.AOP-基础-AOP工作流程',
  '116.AOP-进阶-通知类型',
  '117.AOP-进阶-通知顺序',
  '118.AOP-进阶-切入点表达式-execution',
  '119.AOP-进阶-切入点表达式-@annotation',
  '120.AOP-进阶-连接点',
  '121.AOP-案例-记录操作日志',
  '122.项目部署-概述',
  '123.项目部署-多环境配置',
  '124.项目部署-项目打包',
  '125.项目部署-部署',
]

// 视频选集映射表
const videoTitlesMap: Record<string, string[]> = {
  'BV17F411T7Ao': javaBasicVideoTitles,
  'BV1yGydYEE3H': javaWebVideoTitles,
}

// 获取视频选集
const getVideoTitles = (bvid: string): string[] => {
  return videoTitlesMap[bvid] || javaBasicVideoTitles
}

// 生成视频数据
const generateEpisodes = (bvid: string, total: number): VideoEpisode[] => {
  const titles = getVideoTitles(bvid)
  return Array.from({ length: Math.min(total, titles.length) }, (_, i) => {
    const id = i + 1
    return {
      id,
      title: titles[i] || `第${id}集`,
      duration: '',
    }
  })
}

export function EnhancedBilibiliPlayer({ 
  bvid, 
  title = '视频教程',
  totalEpisodes = 200 
}: EnhancedBilibiliPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showFilter, setShowFilter] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'watched' | 'unwatched'>('all')
  const [mounted, setMounted] = useState(false)
  const [isPreview, setIsPreview] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 使用useMemo缓存episodes，避免重复生成
  const episodes = useMemo(() => generateEpisodes(bvid, totalEpisodes), [bvid, totalEpisodes])

  // 获取当前视频的localStorage key
  const watchedKey = useMemo(() => getWatchedKey(bvid), [bvid])
  const lastEpisodeKey = useMemo(() => getLastEpisodeKey(bvid), [bvid])

  useEffect(() => {
    setMounted(true)
    // 从localStorage读取当前视频的观看记录
    const savedWatched = localStorage.getItem(watchedKey)
    if (savedWatched) {
      setWatchedEpisodes(new Set(JSON.parse(savedWatched)))
    }
    const savedLastEpisode = localStorage.getItem(lastEpisodeKey)
    if (savedLastEpisode) {
      setCurrentEpisode(parseInt(savedLastEpisode, 10))
    }
  }, [watchedKey, lastEpisodeKey])

  // 过滤和搜索
  const filteredEpisodes = useMemo(() => {
    let result = episodes

    // 搜索过滤
    if (searchQuery) {
      result = result.filter(ep => 
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.id.toString().includes(searchQuery)
      )
    }

    // 观看状态过滤
    if (filterType === 'watched') {
      result = result.filter(ep => watchedEpisodes.has(ep.id))
    } else if (filterType === 'unwatched') {
      result = result.filter(ep => !watchedEpisodes.has(ep.id))
    }

    return result
  }, [episodes, searchQuery, filterType, watchedEpisodes])

  // 自动滚动到当前集
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const element = document.getElementById(`episode-${bvid}-${currentEpisode}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isOpen, currentEpisode, bvid])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setIsPreview(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIsFullscreen(false)
    setIsPreview(false)
  }, [])

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const handleEpisodeChange = useCallback((episodeId: number) => {
    setCurrentEpisode(episodeId)
    localStorage.setItem(lastEpisodeKey, episodeId.toString())
    
    // 保存观看记录
    const newWatched = new Set(watchedEpisodes)
    newWatched.add(episodeId)
    setWatchedEpisodes(newWatched)
    localStorage.setItem(watchedKey, JSON.stringify(Array.from(newWatched)))
    
    setIsPreview(false)
  }, [watchedEpisodes, watchedKey, lastEpisodeKey])

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      handleEpisodeChange(currentEpisode - 1)
    }
  }, [currentEpisode, handleEpisodeChange])

  const handleNextEpisode = useCallback(() => {
    if (currentEpisode < episodes.length) {
      handleEpisodeChange(currentEpisode + 1)
    }
  }, [currentEpisode, episodes.length, handleEpisodeChange])

  const handleQuickJump = useCallback((episodeId: number) => {
    if (episodeId >= 1 && episodeId <= episodes.length) {
      handleEpisodeChange(episodeId)
    }
  }, [episodes.length, handleEpisodeChange])

  const handleResetProgress = useCallback(() => {
    localStorage.removeItem(watchedKey)
    localStorage.removeItem(lastEpisodeKey)
    setWatchedEpisodes(new Set())
    setCurrentEpisode(1)
  }, [watchedKey, lastEpisodeKey])

  // 生成B站嵌入URL
  const embedUrl = useMemo(() => {
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${currentEpisode}&high_quality=1&danmaku=0&autoplay=${isPreview ? 0 : 1}`
  }, [bvid, currentEpisode, isPreview])

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border-pink-500/30"
      >
        <MonitorPlay className="h-4 w-4 mr-2" />
        视频教程
      </Button>
    )
  }

  const progress = episodes.length > 0 ? Math.round((watchedEpisodes.size / episodes.length) * 100) : 0

  return (
    <>
      {/* 触发按钮 */}
      <Button
        onClick={handleOpen}
        variant="secondary"
        size="sm"
        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border-pink-500/30"
      >
        <MonitorPlay className="h-4 w-4 mr-2" />
        视频教程
        {watchedEpisodes.size > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {progress}%
          </Badge>
        )}
      </Button>

      {/* 视频播放器弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }}
              onClick={handleClose}
            />

            {/* 播放器容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'relative',
                width: isFullscreen ? '100%' : '95%',
                height: isFullscreen ? '100%' : '90%',
                maxWidth: isFullscreen ? '100%' : '1400px',
                maxHeight: isFullscreen ? '100%' : '900px',
                zIndex: 1,
              }}
              className="bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* 头部工具栏 */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <MonitorPlay className="h-5 w-5 text-pink-500" />
                  <div>
                    <h3 className="text-lg font-semibold truncate max-w-md">{title}</h3>
                    <p className="text-xs text-muted-foreground">
                      第 {currentEpisode} 集 / 共 {episodes.length} 集
                      {watchedEpisodes.size > 0 && ` · 已观看 ${watchedEpisodes.size} 集`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 进度重置 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetProgress}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    重置进度
                  </Button>
                  {/* 全屏按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="hover:bg-muted"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                  {/* 关闭按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 主体内容 */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* 主播放器区域 */}
                <div className="flex-1 relative bg-black flex flex-col">
                  {/* 视频播放器 */}
                  <div className="flex-1 relative">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ border: 'none' }}
                    />
                    
                    {/* 预览遮罩 */}
                    {isPreview && (
                      <div 
                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                        onClick={() => setIsPreview(false)}
                      >
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-pink-500/90 flex items-center justify-center mb-4 mx-auto hover:scale-110 transition-transform">
                            <Play className="h-10 w-10 text-white ml-1" />
                          </div>
                          <p className="text-white text-lg font-medium">点击开始播放</p>
                          <p className="text-white/70 text-sm mt-1">第 {currentEpisode} 集</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 播放控制栏 */}
                  <div className="bg-muted/30 border-t border-border p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevEpisode}
                        disabled={currentEpisode === 1}
                      >
                        <SkipBack className="h-4 w-4 mr-1" />
                        上一集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextEpisode}
                        disabled={currentEpisode === episodes.length}
                      >
                        下一集
                        <SkipForward className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    {/* 快速跳转 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">跳转到</span>
                      <Input
                        type="number"
                        min={1}
                        max={episodes.length}
                        placeholder="集数"
                        className="w-20 h-8 text-center"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseInt((e.target as HTMLInputElement).value)
                            handleQuickJump(value)
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">集</span>
                    </div>
                  </div>
                </div>

                {/* 侧边栏 - 选集区域 */}
                {!isFullscreen && (
                  <div className="w-full lg:w-96 border-l border-border bg-muted/20 flex flex-col">
                    {/* 搜索和筛选 */}
                    <div className="p-4 border-b border-border space-y-3">
                      {/* 搜索框 */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="搜索集数或标题..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      {/* 筛选和视图切换 */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilter(!showFilter)}
                          className={showFilter ? 'text-pink-500' : ''}
                        >
                          <Filter className="h-4 w-4 mr-1" />
                          筛选
                          <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                            onClick={() => setViewMode('list')}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 筛选选项 */}
                      <AnimatePresence>
                        {showFilter && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                                className="flex-1"
                              >
                                全部
                              </Button>
                              <Button
                                variant={filterType === 'watched' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('watched')}
                                className="flex-1"
                              >
                                已看
                              </Button>
                              <Button
                                variant={filterType === 'unwatched' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('unwatched')}
                                className="flex-1"
                              >
                                未看
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 统计信息 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>共 {filteredEpisodes.length} 集</span>
                        <span>观看进度 {progress}%</span>
                      </div>
                    </div>

                    {/* 选集列表 */}
                    <ScrollArea className="flex-1" ref={scrollRef}>
                      <div className={`p-2 ${viewMode === 'grid' ? 'grid grid-cols-4 gap-2' : 'space-y-1'}`}>
                        {filteredEpisodes.map((episode) => {
                          const isWatched = watchedEpisodes.has(episode.id)
                          const isCurrent = currentEpisode === episode.id
                          
                          if (viewMode === 'grid') {
                            return (
                              <button
                                key={episode.id}
                                id={`episode-${bvid}-${episode.id}`}
                                onClick={() => handleEpisodeChange(episode.id)}
                                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                                  isCurrent
                                    ? 'bg-pink-500 text-white'
                                    : isWatched
                                    ? 'bg-muted hover:bg-muted/80'
                                    : 'bg-background hover:bg-muted border border-border'
                                }`}
                              >
                                <span className="text-lg font-bold">{episode.id}</span>
                                {isWatched && (
                                  <CheckCircle2 className={`h-3 w-3 mt-1 ${isCurrent ? 'text-white' : 'text-green-500'}`} />
                                )}
                              </button>
                            )
                          }

                          return (
                            <button
                              key={episode.id}
                              id={`episode-${bvid}-${episode.id}`}
                              onClick={() => handleEpisodeChange(episode.id)}
                              className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                                isCurrent
                                  ? 'bg-pink-500/10 border-pink-500/30 border'
                                  : isWatched
                                  ? 'bg-muted/50 hover:bg-muted'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCurrent
                                  ? 'bg-pink-500 text-white'
                                  : isWatched
                                  ? 'bg-green-500/10 text-green-600'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {isWatched ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  episode.id
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isCurrent ? 'text-pink-600' : ''}`}>
                                  {episode.title}
                                </p>
                              </div>
                              {isCurrent && (
                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </ScrollArea>

                    {/* 快速导航 */}
                    <div className="p-3 border-t border-border bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(1)}
                          className="flex-1"
                        >
                          首集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(Math.max(1, currentEpisode - 10))}
                          className="flex-1"
                        >
                          -10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(Math.min(episodes.length, currentEpisode + 10))}
                          className="flex-1"
                        >
                          +10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(episodes.length)}
                          className="flex-1"
                        >
                          末集
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
```

**说明：**

- `bvid`：B站视频 ID
- `title`：视频标题
- `totalEpisodes`：总集数
- 观看记录：使用 localStorage 保存观看进度和历史
- 选集功能：支持列表和网格两种视图
- 搜索和筛选：支持按标题搜索和按观看状态筛选
- 快速导航：支持首集、末集和快速跳转
- 全屏模式：点击全屏按钮切换全屏状态
- 预览模式：点击播放按钮开始播放
- 响应式设计：适配不同屏幕尺寸

### 8. 评论系统功能

#### 8.1 创建评论区组件

创建 `src/components/blog/CommentSection.tsx` 文件：

```typescript
'use client'

import { useEffect, useRef } from 'react'

interface CommentSectionProps {
  articleId: string
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const commentContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!commentContainerRef.current) return

    // 这里可以集成 GitHub Discussions 或其他评论系统
    // 例如使用 utterances 或 giscus
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', 'yourusername/your-repo')
    script.setAttribute('data-repo-id', 'your-repo-id')
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', 'category-id')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', 'zh-CN')

    commentContainerRef.current.innerHTML = ''
    commentContainerRef.current.appendChild(script)

    return () => {
      if (commentContainerRef.current) {
        commentContainerRef.current.innerHTML = ''
      }
    }
  }, [articleId])

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h3 className="text-xl font-bold mb-6">评论</h3>
      <div ref={commentContainerRef} className="w-full"></div>
    </div>
  )
}
```

**说明：**

- `articleId`：文章 ID，用于关联评论
- `useEffect`：动态加载评论系统脚本
- `giscus`：使用 Giscus 评论系统（基于 GitHub Discussions）

### 9. 站点地图功能

#### 9.1 创建站点地图

创建 `src/app/sitemap.ts` 文件：

```typescript
import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-blog-domain.com'
  const articlesDirectory = path.join(process.cwd(), 'public', 'md')

  // 生成博客文章链接
  const blogLinks: MetadataRoute.Sitemap = []

  try {
    const categories = fs.readdirSync(articlesDirectory)
    
    categories.forEach((category) => {
      const categoryPath = path.join(articlesDirectory, category)
      if (fs.statSync(categoryPath).isDirectory()) {
        const articles = fs.readdirSync(categoryPath)
        
        articles.forEach((article) => {
          if (article.endsWith('.md')) {
            const slug = article.replace('.md', '')
            blogLinks.push({
              url: `${baseUrl}/blog/${category}/${slug}`,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.8,
            })
          }
        })
      }
    })
  } catch (error) {
    console.error('生成站点地图失败:', error)
  }

  // 生成其他页面链接
  const otherLinks: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  return [...otherLinks, ...blogLinks]
}
```

**说明：**

- `MetadataRoute.Sitemap`：Next.js 13 的站点地图类型
- `fs.readdirSync`：读取 Markdown 文章目录
- `map`：生成文章链接和其他页面链接
- `lastModified`：最后修改时间
- `changeFrequency`：更新频率
- `priority`：优先级

---

## 样式系统

### 1. 全局样式

创建 `src/app/global.css` 文件：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 25 95% 53%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 25 95% 53%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 25 95% 53%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 25 95% 53%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: var(--radius);
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: var(--radius);
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary));
}

/* 自定义选中文本样式 */
::selection {
  background-color: hsl(var(--primary) / 0.3);
  color: hsl(var(--primary-foreground));
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
```

**说明：**

- `@layer base`：使用 Tailwind 的层功能组织样式
- `:root`：定义浅色模式的 CSS 变量
- `.dark`：定义深色模式的 CSS 变量
- 使用 HSL 颜色空间，便于调整主题
- 自定义滚动条、选中文本样式和平滑滚动

### 2. 响应式设计

Tailwind CSS 提供了内置的响应式前缀：

- `sm:`：≥ 640px
- `md:`：≥ 768px
- `lg:`：≥ 1024px
- `xl:`：≥ 1280px
- `2xl:`：≥ 1536px

**示例：**

```jsx
<div className="text-sm md:text-base lg:text-lg">
  响应式文本
</div>
```

**说明：**

- 小屏幕：`text-sm`
- 中等屏幕：`text-base`
- 大屏幕：`text-lg`

### 3. 深色模式

使用 `dark:` 前缀实现深色模式：

```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  深色模式支持
</div>
```

**说明：**

- 浅色模式：`bg-white text-gray-900`
- 深色模式：`bg-gray-900 text-white`

### 4. 组件样式

使用 Tailwind CSS 的 `@layer components` 定义组件样式：

```css
@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
  
  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/90;
  }
}
```

### 5. 工具类

使用 Tailwind CSS 的 `@layer utilities` 定义自定义工具类：

```css
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
  
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .glass-effect {
    @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-md;
  }
}
```

### 6. 动画

使用 Tailwind CSS 的动画功能和 Framer Motion 实现动画效果：

**Tailwind CSS 动画示例：**

```css
@layer utilities {
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
}
```

**Framer Motion 示例：**

```jsx
import { motion } from 'framer-motion'

const AnimatedComponent = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    动画组件
  </motion.div>
)
```

---

## 博客系统

### 1. 创建博客数据结构

创建 `src/lib/blog.ts` 文件：

```typescript
export interface Article {
  slug: string
  title: string
  description?: string
  date?: string
  category: string
  content: string
}

export interface Category {
  id: string
  name: string
  description?: string
}
```

**说明：**

- `Article`：文章接口
- `Category`：分类接口

### 2. 读取 Markdown 文件

创建 `src/lib/blog.ts` 文件，包含博客相关工具函数：

```typescript
import fs from 'fs'
import path from 'path'

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Article {
  slug: string
  title: string
  description?: string
  date?: string
  category: string
  content: string
}

const MD_DIR = path.join(process.cwd(), 'public', 'md')

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await fs.promises.readdir(MD_DIR)
    
    // 修仙体系排序优先级
    const cultivationOrder = ['引气', '筑基', '金丹', '元婴', '化神', '合体']
    
    return categories
      .filter((item) => {
        const itemPath = path.join(MD_DIR, item)
        return fs.statSync(itemPath).isDirectory()
      })
      .map((folder) => {
        const match = folder.match(/^(\d+)\.(.+)$/)
        if (match) {
          return {
            id: folder,
            name: match[2],
          }
        }
        return {
          id: folder,
          name: folder,
        }
      })
      .sort((a, b) => {
        // 提取修仙等级
        const getCultivationLevel = (name: string) => {
          for (const level of cultivationOrder) {
            if (name.includes(level)) {
              return cultivationOrder.indexOf(level)
            }
          }
          return cultivationOrder.length // 不在排序中的放在最后
        }
        
        const levelA = getCultivationLevel(a.name)
        const levelB = getCultivationLevel(b.name)
        
        if (levelA !== levelB) {
          return levelA - levelB
        }
        
        // 同一等级内按名称排序
        return a.name.localeCompare(b.name)
      })
  } catch (error) {
    console.error('Error reading categories:', error)
    return []
  }
}

export async function getArticles(categoryId: string): Promise<Article[]> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const files = await fs.promises.readdir(categoryPath)
    
    const articles: Article[] = []
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(categoryPath, file)
        const content = await fs.promises.readFile(filePath, 'utf-8')
        
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const descMatch = content.match(/^>?\s*(.+)$/m)
        
        const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '')
        const description = descMatch ? descMatch[1].trim() : ''
        
        articles.push({
          slug: file.replace('.md', ''),
          title,
          description,
          category: categoryId,
          content,
        })
      }
    }
    
    return articles.sort((a, b) => {
      const numA = parseInt(a.title.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.title.match(/\d+/)?.[0] || '0')
      return numA - numB
    })
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

export async function getArticle(categoryId: string, slug: string): Promise<Article | null> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const filePath = path.join(categoryPath, `${slug}.md`)
    
    const content = await fs.promises.readFile(filePath, 'utf-8')
    
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const descMatch = content.match(/^>?\s*(.+)$/m)
    
    const title = titleMatch ? titleMatch[1].trim() : slug
    const description = descMatch ? descMatch[1].trim() : ''
    
    return {
      slug,
      title,
      description,
      category: categoryId,
      content,
    }
  } catch (error) {
    console.error('Error reading article:', error)
    return null
  }
}

export function getCategoryFromId(categoryId: string): string {
  const match = categoryId.match(/^(\d+)\.(.+)$/)
  return match ? match[2] : categoryId
}
```

**说明：**

- `fs.promises.readdir`：异步读取目录中的文件
- `fs.promises.readFile`：异步读取文件内容
- `sort`：按修仙体系排序分类，按标题中的数字排序文章
- `getCategoryFromId`：从分类 ID 中提取分类名称
- 使用正则表达式从 Markdown 内容中提取标题和描述

### 3. 创建博客列表页面

创建 `src/app/blog/page.tsx` 文件：

```typescript
import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getArticles } from '@/lib/blog'
import { BookOpen, ArrowRight, FileText } from 'lucide-react'
import { BlogSearch } from './BlogSearch'

// 导入客户端组件
import LastVisitedBarWrapper from '@/components/blog/LastVisitedBarWrapper'

const meta = {
  title: '博客专栏',
  description: '技术博客专栏，分享Java、前端、后端等技术知识',
  url: `${WEBSITE_HOST_URL}/blog`,
}

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.url,
  },
  twitter: {
    title: meta.title,
    description: meta.description,
  },
  alternates: {
    canonical: meta.url,
  },
}

interface Article {
  id: string
  title: string
  description?: string
  category: string
  categoryName: string
  content: string
}

export default async function BlogPage() {
  const categories = await getCategories()
  
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const articles = await getArticles(category.id)
      return {
        ...category,
        articleCount: articles.length,
        latestArticle: articles[0]?.title || '',
      }
    })
  )

  // 预加载所有文章数据
  const allArticles: Article[] = []
  for (const category of categories) {
    const articles = await getArticles(category.id)
    for (const article of articles) {
      allArticles.push({
        id: article.slug,
        title: article.title,
        description: article.description,
        category: category.id,
        categoryName: category.name,
        content: article.content
      })
    }
  }

  return (
    <div className="min-h-screen">
      {/* 上次浏览文章横条导航 - 使用动态导入避免hydration不匹配 */}
      <LastVisitedBarWrapper />
      
      <section className="py-24 relative overflow-hidden">
        {/* 背景图片 - 宽度与页面一致，长度等比例放大 */}
        <div className="absolute top-[-5px] left-0 right-0 pointer-events-none w-full" style={{ opacity: 0.1 }}>
          <img src="https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260207210813997.png" alt="背景" className="w-full h-auto" />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-1 bg-primary"></div>
                <p className="text-sm font-semibold tracking-widest uppercase text-primary">技术博客</p>
              </div>
              
              {/* 标题和搜索框 */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">技术博客专栏</h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">深入学习编程技术，从基础到进阶，记录学习过程中的思考与总结</p>
                </div>
                
                <div className="w-full md:w-64 lg:w-80">
                  <BlogSearch key="blog-search" articles={allArticles} />
                </div>
              </div>
            </div>

            {/* 分类卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ marginTop: '224px' }}>
              {categoriesWithCount.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/${category.id}`}
                  className="group block p-8 border border-border hover:border-primary transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{category.name}</h2>
                  
                  <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">{category.description || '探索相关知识体系，掌握核心技能'}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{category.articleCount} 篇文章</span>
                    </div>
                    {category.latestArticle && (
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">最新: {category.latestArticle}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {categoriesWithCount.length === 0 && (
              <div className="text-center py-24">
                <BookOpen className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
                <p className="text-muted-foreground text-xl">暂无专栏内容</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            技术博客专栏
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            深入学习编程技术，从基础到进阶，记录学习过程中的思考与总结
          </p>
          
          <div className="mb-12">
            <BlogSearch />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const articles = getArticlesByCategory(category.id)
              return (
                <Link
                  key={category.id}
                  href={`/blog/${category.id}`}
                  className="group block p-8 border border-border hover:border-primary transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                    {category.description || '探索相关知识体系，掌握核心技能'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{articles.length} 篇文章</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
```

**说明：**

- `getAllCategories`：获取所有分类
- `getArticlesByCategory`：获取分类下的文章
- `BlogSearch`：博客搜索组件
- 响应式网格：`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 4. 创建分类详情页面

创建 `src/app/blog/[category]/page.tsx` 文件：

```typescript
import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, BookOpen } from 'lucide-react'
import { getCategories, getArticles, getCategoryFromId } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { ArticleDownloadButton } from '@/components/blog/ArticleDownloadButton'
import { ArticleCoverImage } from '@/components/blog/ArticleCoverImage'
import { EnhancedBilibiliPlayer } from '@/components/video/EnhancedBilibiliPlayer'

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    category: category.id,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const categories = await getCategories()
  const currentCategory = categories.find((c) => c.id === category)
  const categoryName = currentCategory ? currentCategory.name : getCategoryFromId(category)

  return {
    title: `${categoryName} - 博客专栏`,
    description: `${categoryName}专栏文章列表`,
    openGraph: {
      title: `${categoryName} - 博客专栏`,
      description: `${categoryName}专栏文章列表`,
      url: `${WEBSITE_HOST_URL}/blog/${category}`,
    },
  }
}

// 专栏视频配置
const categoryVideos: Record<string, { bvid: string; title: string }> = {
  '引气・Java 气海初拓': {
    bvid: 'BV17F411T7Ao',
    title: '黑马程序员Java零基础视频教程',
  },
  '筑基・Web 道途启关': {
    bvid: 'BV1yGydYEE3H',
    title: 'AI+JavaWeb开发入门，Tlias教学管理系统项目实战',
  },
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const { page = '1' } = await searchParams
  const decodedCategory = decodeURIComponent(category)
  const categories = await getCategories()
  const currentCategory = categories.find((c) => c.id === decodedCategory)
  
  if (!currentCategory) {
    notFound()
  }

  const articles = await getArticles(decodedCategory)
  const categoryName = getCategoryFromId(decodedCategory)

  // 分页配置
  const itemsPerPage = 5
  const currentPage = parseInt(page, 10) || 1
  const totalItems = articles.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 计算当前页显示的文章
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = articles.slice(startIndex, endIndex)

  // 获取当前专栏的视频配置
  const videoConfig = categoryVideos[decodedCategory]

  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回专栏列表
            </Link>

            <div className="mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {categoryName}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      共 {articles.length} 篇文章
                    </p>
                  </div>
                </div>
                {/* 视频教程按钮 */}
                {videoConfig && (
                  <div className="hidden sm:block">
                    <EnhancedBilibiliPlayer 
                      bvid={videoConfig.bvid} 
                      title={videoConfig.title}
                      totalEpisodes={200}
                    />
                  </div>
                )}
              </div>
              {currentCategory.description && (
                <p className="text-muted-foreground mt-4">
                  {currentCategory.description}
                </p>
              )}
              {/* 移动端视频按钮 */}
              {videoConfig && (
                <div className="sm:hidden mt-4">
                  <EnhancedBilibiliPlayer 
                    bvid={videoConfig.bvid} 
                    title={videoConfig.title}
                    totalEpisodes={200}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {paginatedArticles.map((article) => (
                <div 
                  key={article.slug}
                  className="p-6 bg-background border border-border rounded shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary group"
                >
                  <div className="flex items-start gap-4">
                    {/* 文章封面图片 - 使用文章中的第一个图片链接 */}
                    {(() => {
                      // 从文章内容中提取第一个图片链接
                      const imgRegex = /!\[.*?\]\((.*?)\)/g
                      const imgMatch = imgRegex.exec(article.content)
                      const imgSrc = imgMatch ? imgMatch[1] : undefined
                      
                      return (
                        <ArticleCoverImage 
                          src={imgSrc} 
                          alt={article.title} 
                        />
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${category}/${article.slug}`}
                        className="block"
                      >
                        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        {article.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          {article.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{article.date}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                              {categoryName}
                            </span>
                          </div>
                        </div>

                        {/* 知识点栏 */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              // 从文章标题和内容中提取具体知识点
                              const knowledgePoints = []
                               
                              // 基于标题和内容的具体知识点提取
                              if (article.title.includes('Java重生之旅')) {
                                knowledgePoints.push('环境配置', 'JDK选择', '环境变量', '类型转换', '精度丢失', '流程控制', '嵌套地狱', '工程思维')
                              } else if (article.title.includes('Java知识树')) {
                                knowledgePoints.push('Java体系', '知识架构', '学习路线', '技能图谱', '核心概念', '进阶路径', '技术栈', '职业发展')
                              } else if (article.title.includes('Swing') && article.title.includes('聊天室')) {
                                knowledgePoints.push('Java GUI', 'Swing', '网络编程', 'Socket', '多线程', '事件处理', '界面设计', '客户端通信')
                              } else if (article.title.includes('银行管理系统')) {
                                knowledgePoints.push('Java项目', '银行系统', '业务逻辑', '数据库设计', '事务处理', '安全认证', '账户管理', '交易流程')
                              } else if (article.title.includes('MyBatis')) {
                                knowledgePoints.push('ORM框架', 'MyBatis', 'SQL映射', '数据库操作', '代码生成', '性能优化', '动态SQL', '结果映射')
                              } else if (article.title.includes('Spring')) {
                                knowledgePoints.push('Spring框架', 'IOC容器', '依赖注入', 'AOP切面', '事务管理', '配置方式', '组件扫描', '生命周期')
                              } else if (article.title.includes('Web') || article.title.includes('项目')) {
                                knowledgePoints.push('Web开发', '项目实战', '前后端交互', '部署上线', '生产环境', '性能优化', '用户体验', '系统架构')
                              } else {
                                // 为其他文章添加通用知识点
                                knowledgePoints.push('Java编程', '技术学习', '开发实践', '代码优化', '最佳实践', '问题排查', '性能调优', '架构设计')
                              }
                               
                              return knowledgePoints.map((point, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  {point}
                                </span>
                              ))
                            })()}
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <ArticleDownloadButton 
                        category={article.category} 
                        slug={article.slug} 
                        title={article.title} 
                      />
                      <Link
                        href={`/blog/${category}/${article.slug}`}
                        className="flex items-center justify-center p-1 rounded-full hover:bg-primary/10 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary rotate-180 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  该专栏暂无文章
                </p>
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  {/* 上一页按钮 */}
                  <Link
                    href={`/blog/${category}?page=${Math.max(1, currentPage - 1)}`}
                    className={`flex items-center justify-center px-3 py-1 rounded-md border transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground' : 'border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                    aria-disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>

                  {/* 页码按钮 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/blog/${category}?page=${pageNum}`}
                      className={`px-3 py-1 rounded-md transition-colors ${currentPage === pageNum ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                    >
                      {pageNum}
                    </Link>
                  ))}

                  {/* 下一页按钮 */}
                  <Link
                    href={`/blog/${category}?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={`flex items-center justify-center px-3 py-1 rounded-md border transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground' : 'border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                    aria-disabled={currentPage === totalPages}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </nav>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
```

**说明：**

- `generateStaticParams`：静态生成路由参数，提高性能
- `generateMetadata`：动态生成页面元数据，提升 SEO
- `getArticles`：获取分类下的文章
- `getCategoryFromId`：从分类 ID 中提取分类名称
- 视频集成：为特定专栏添加 B 站视频教程
- 文章封面图片：自动从文章内容中提取第一张图片
- 知识点提取：基于文章标题自动生成知识点标签
- 分页功能：支持文章列表分页
- 错误处理：使用 `notFound()` 处理分类不存在的情况

### 5. 创建文章详情页面

创建 `src/app/blog/[category]/[slug]/page.tsx` 文件：

```typescript
import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getCategories, getArticle, getCategoryFromId } from '@/lib/blog'
import { notFound } from 'next/navigation'
import ArticlePageClient from '@/components/blog/ArticlePageClient'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  const params: { category: string; slug: string }[] = []
  
  for (const category of categories) {
    const { getArticles } = await import('@/lib/blog')
    const articles = await getArticles(category.id)
    
    for (const article of articles) {
      params.push({
        category: category.id,
        slug: article.slug,
      })
    }
  }
  
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params
  const decodedCategory = decodeURIComponent(category)
  const decodedSlug = decodeURIComponent(slug)
  const article = await getArticle(decodedCategory, decodedSlug)
  const categoryName = getCategoryFromId(decodedCategory)

  if (!article) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: `${article.title} - ${categoryName}`,
    description: article.description || `${article.title} - ${categoryName}专栏文章`,
    openGraph: {
      title: `${article.title} - ${categoryName}`,
      description: article.description || `${article.title} - ${categoryName}专栏文章`,
      url: `${WEBSITE_HOST_URL}/blog/${category}/${slug}`,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { category, slug } = await params
  const decodedCategory = decodeURIComponent(category)
  const decodedSlug = decodeURIComponent(slug)
  const article = await getArticle(decodedCategory, decodedSlug)
  const categoryName = getCategoryFromId(decodedCategory)

  if (!article) {
    notFound()
  }

  // 获取上一页和下一页文章
  const { getArticles } = await import('@/lib/blog')
  const articles = await getArticles(decodedCategory)
  const currentIndex = articles.findIndex(a => a.slug === decodedSlug)
  
  let prevArticle = null
  let nextArticle = null
  let isNextCategory = false
  let nextCategoryName = ''
  let isPrevCategory = false
  let prevCategoryName = ''
  
  if (currentIndex > 0) {
    // 当前专栏还有上一篇文章
    prevArticle = articles[currentIndex - 1]
  } else {
    // 当前专栏的第一篇文章，获取上一个专栏的最后一篇文章
    const allCategories = await getCategories()
    const currentCategoryIndex = allCategories.findIndex(c => c.id === decodedCategory)
    
    if (currentCategoryIndex > 0) {
      // 还有上一个专栏
      const prevCategory = allCategories[currentCategoryIndex - 1]
      const prevCategoryArticles = await getArticles(prevCategory.id)
      
      if (prevCategoryArticles.length > 0) {
        prevArticle = prevCategoryArticles[prevCategoryArticles.length - 1]
        isPrevCategory = true
        prevCategoryName = prevCategory.name
      }
    }
  }
  
  if (currentIndex < articles.length - 1) {
    // 当前专栏还有下一篇文章
    nextArticle = articles[currentIndex + 1]
  } else {
    // 当前专栏的最后一篇文章，获取下一个专栏的第一篇文章
    const allCategories = await getCategories()
    const currentCategoryIndex = allCategories.findIndex(c => c.id === decodedCategory)
    
    if (currentCategoryIndex < allCategories.length - 1) {
      // 还有下一个专栏
      const nextCategory = allCategories[currentCategoryIndex + 1]
      const nextCategoryArticles = await getArticles(nextCategory.id)
      
      if (nextCategoryArticles.length > 0) {
        nextArticle = nextCategoryArticles[0]
        isNextCategory = true
        nextCategoryName = nextCategory.name
      }
    }
  }

  return <ArticlePageClient 
    article={article} 
    categoryName={categoryName} 
    prevArticle={prevArticle ? { slug: prevArticle.slug, title: prevArticle.title, category: prevArticle.category } : undefined}
    nextArticle={nextArticle ? { slug: nextArticle.slug, title: nextArticle.title, category: nextArticle.category } : undefined}
    articles={articles}
    currentArticle={{ slug: decodedSlug, category: decodedCategory }}
    isNextCategory={isNextCategory}
    nextCategoryName={nextCategoryName}
    isPrevCategory={isPrevCategory}
    prevCategoryName={prevCategoryName}
  />
}
```

**说明：**

- `generateStaticParams`：静态生成路由参数，提高性能
- `generateMetadata`：动态生成页面元数据，提升 SEO
- `ArticlePageClient`：客户端组件，处理交互功能
- 实现了跨专栏的上一篇/下一篇文章导航
- 使用 `notFound()` 处理文章不存在的情况
- 动态路由：`[category]/[slug]` 匹配分类和文章 slug
- `ArticleNavigation`：文章导航组件（上一页/下一页）
- `ArticleQuiz`：文章测验组件
- `CommentSection`：评论区组件
- `AIAssistantSidebar`：AI 助手侧边栏组件

### 6. 创建文章相关组件

#### 6.1 文章内容组件

创建 `src/components/blog/ArticleContent.tsx` 文件：

```typescript
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { CollapsibleToc } from './CollapsibleToc'

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="bg-background border border-border rounded shadow-sm p-6 md:p-8">
      <CollapsibleToc content={content} />
      <div className="prose prose-lg dark:prose-invert max-w-none mt-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeHighlight,
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'wrap',
                properties: {
                  className: ['anchor-link'],
                },
              },
            ],
          ]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
```

#### 6.2 文章头部组件

创建 `src/components/blog/ArticleHeader.tsx` 文件：

```typescript
import Link from 'next/link'
import { ArrowLeft, BookOpen, User, Calendar } from 'lucide-react'

interface ArticleHeaderProps {
  article: {
    title: string
    date?: string
    description?: string
  }
  category: string
}

export function ArticleHeader({ article, category }: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Link
          href={`/blog/${category}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          {category}
        </Link>
      </div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
        {article.title}
      </h1>
      
      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>博主</span>
        </div>
        
        {article.date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{article.date}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span>大约 24 分钟</span>
        </div>
      </div>
      
      {article.description && (
        <p className="text-lg text-muted-foreground mb-6">
          {article.description}
        </p>
      )}
    </header>
  )
}
```

#### 6.3 文章导航组件

创建 `src/components/blog/ArticleNavigation.tsx` 文件：

```typescript
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ArticleNavigationProps {
  prevArticle: { slug: string; title: string } | undefined
  nextArticle: { slug: string; title: string } | undefined
  category: string
}

export function ArticleNavigation({ prevArticle, nextArticle, category }: ArticleNavigationProps) {
  return (
    <div className="mt-8 bg-background border border-border rounded shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {prevArticle ? (
          <Link 
            href={`/blog/${category}/${prevArticle.slug}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-xs text-muted-foreground">上一页</div>
              <div className="font-medium">{prevArticle.title}</div>
            </div>
          </Link>
        ) : (
          <div className="w-full md:w-1/2 opacity-0">
            <div className="text-xs text-muted-foreground">上一页</div>
            <div className="font-medium">无</div>
          </div>
        )}
        
        {nextArticle ? (
          <Link 
            href={`/blog/${category}/${nextArticle.slug}`}
            className="flex items-center justify-end gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="text-right">
              <div className="text-xs text-muted-foreground">下一页</div>
              <div className="font-medium">{nextArticle.title}</div>
            </div>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-full md:w-1/2 opacity-0">
            <div className="text-xs text-muted-foreground">下一页</div>
            <div className="font-medium">无</div>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 6.4 文章测验组件

创建 `src/components/blog/ArticleQuiz.tsx` 文件：

```typescript
'use client'

import { useState, useEffect } from 'react'

interface ArticleQuizProps {
  article: {
    title: string
    content: string
  }
}

export function ArticleQuiz({ article }: ArticleQuizProps) {
  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // 这里可以实现实际的测验生成逻辑
        // 例如调用 AI API 生成测验题
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟 API 调用
        setQuiz({
          questions: [
            {
              id: 1,
              question: '这篇文章的主要内容是什么？',
              options: [
                'JavaScript 基础',
                'React 进阶',
                'Next.js 实战',
                'TypeScript 入门'
              ],
              answer: 2
            },
            {
              id: 2,
              question: '以下哪个不是 Next.js 的特性？',
              options: [
                '服务端渲染',
                '静态生成',
                'API 路由',
                'Vue 组件'
              ],
              answer: 3
            }
          ]
        })
      } catch (error) {
        console.error('获取测验失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [article])

  if (isLoading) {
    return (
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="text-xl font-bold mb-6">知识测验</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h3 className="text-xl font-bold mb-6">知识测验</h3>
      <div className="bg-background border border-border rounded shadow-sm p-6">
        {quiz.questions.map((question: any) => (
          <div key={question.id} className="mb-6">
            <p className="font-medium mb-3">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id={`option-${question.id}-${index}`} 
                    name={`question-${question.id}`} 
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor={`option-${question.id}-${index}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          提交答案
        </button>
      </div>
    </div>
  )
}
```

#### 6.5 AI 助手侧边栏组件

创建 `src/components/blog/AIAssistantSidebar.tsx` 文件：

```typescript
import { AIAssistant } from '@/components/ai/AIAssistant'
import { AIAssistantProvider } from '@/components/ai/AIAssistantContext'

interface AIAssistantSidebarProps {
  article: {
    title: string
    content: string
  }
}

export function AIAssistantSidebar({ article }: AIAssistantSidebarProps) {
  return (
    <div className="sticky top-24 bg-background border border-border rounded shadow-sm p-4">
      <h3 className="text-lg font-bold mb-4">AI 助手</h3>
      <p className="text-sm text-muted-foreground mb-4">
        有任何问题，随时问我！
      </p>
      <AIAssistantProvider>
        <AIAssistant />
      </AIAssistantProvider>
    </div>
  )
}
```

---

## 项目展示

### 1. 创建项目数据结构

创建 `src/lib/projects.ts` 文件：

```typescript
export interface Project {
  id: string
  title: string
  description: string
  date: string
  skills: string[]
  background: string
  architecture: string
  features: string[]
  responsibilities: string[]
  challenges: {
    challenge: string
    solution: string
  }[]
  achievements: string[]
  link: string
}
```

**说明：**

- `Project`：项目接口，包含项目所有信息

### 2. 创建项目列表页面

创建 `src/app/portfolio/page.tsx` 文件：

```typescript
import { ProjectCarousel } from '@/components/portfolio/ProjectCarousel'
import { ProjectCard } from '@/components/portfolio/ProjectCard'

export default function Portfolio() {
  const projects = [
    {
      id: '福师畅聊',
      title: '福师畅聊 - 全栈开发',
      description: '基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责全栈开发工作，包括前端和后端。',
      date: '2025.08-2025.10',
      skills: ['Spring Boot', 'Netty', 'Redis', 'MySQL', 'MinIO', 'WebSocket', 'Vue 3', 'TypeScript', 'Vite', 'Docker', 'Nginx'],
      background: '福师畅聊是一款面向高校师生的即时通讯应用，旨在为校园用户提供便捷的沟通工具。项目需求包括支持私聊、群聊、离线消息、文件传输、语音视频通话等功能，同时需要保证系统的高并发性能和稳定性。作为全栈开发工程师，我负责从架构设计到功能实现的全流程开发工作。',
      architecture: '项目采用前后端分离架构，后端基于 Spring Boot 框架，使用 Netty 实现高性能的实时消息推送，Redis 作为缓存和消息队列，MySQL 持久化存储用户数据和聊天记录，MinIO 处理文件存储。前端使用 Vue 3 + TypeScript 构建，通过 WebSocket 与后端保持实时连接，实现消息的即时推送和接收。',
      features: [
        '实时消息推送：基于 Netty 长连接和 WebSocket，支持私聊、群聊的实时消息推送',
        '离线消息处理：用户离线时消息存储到 Redis，上线后自动推送离线消息',
        '文件传输：支持图片、文档等多种文件类型的上传和下载，使用 MinIO 对象存储',
        '语音视频通话：集成 WebRTC 实现点对点的语音视频通话功能',
        '好友管理：支持好友添加、删除、分组管理等功能',
        '群组功能：支持创建群组、邀请成员、群组消息推送等功能',
        '消息已读回执：实时显示消息的已读状态',
        '用户设置：支持个人信息修改、隐私设置、通知设置等功能'
      ],
      responsibilities: [
        '设计并实现基于 Netty 的实时消息推送系统，支持私聊、群聊、离线消息等核心功能',
        '开发 RESTful API 接口，实现用户认证、消息管理、好友关系等后端功能',
        '构建 Vue 3 + TypeScript 前端应用，实现消息列表、聊天界面、用户设置等功能',
        '集成 WebSocket 实现前后端实时通信，确保消息即时送达',
        '设计 Redis 缓存策略，优化消息查询性能和系统响应速度',
        '使用 Docker 容器化部署，配合 Nginx 实现负载均衡和 HTTPS 配置'
      ],
      challenges: [
        {
          challenge: '高并发消息推送性能优化',
          solution: '使用 Netty 的 NIO 模式和线程池优化，结合 Redis 的 Pub/Sub 机制实现消息分发，通过连接池管理减少连接创建开销，最终支持 1000+ 并发连接，消息延迟控制在 100ms 以内'
        },
        {
          challenge: '离线消息存储和推送',
          solution: '设计离线消息存储策略，用户离线时消息存储到 Redis Sorted Set，用户上线时通过定时任务批量推送，同时设置消息过期时间避免内存占用过大'
        },
        {
          challenge: '前端性能优化',
          solution: '使用 Vue 3 的 Composition API 和响应式系统优化，实现虚拟滚动减少 DOM 操作，使用 Web Worker 处理消息历史记录查询，最终将页面加载时间优化至 0.8 秒'
        },
        {
          challenge: '消息可靠性保证',
          solution: '实现消息确认机制，发送方收到接收方的确认后才标记为已送达，对于未确认的消息设置重试机制，确保消息送达率达到 100%'
        }
      ],
      achievements: [
        '实现了支持 1000+ 并发连接的实时消息系统',
        '前端页面加载速度优化至 0.8 秒，用户体验显著提升',
        '系统稳定性达到 99.9%，消息送达率 100%',
        '代码质量优秀，通过了团队代码审查，获得好评'
      ],
      link: '/portfolio/福师畅聊'
    }
  ]

  return (
    <div>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">项目经历</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            以下是我参与开发的代表性项目，展示了我的技术能力和实践经验。
          </p>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">我的项目</h2>
          
          <ProjectCarousel projects={projects} />
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">项目详情预览</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                date={project.date}
                skills={project.skills}
                category={project.id}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

**说明：**

- 项目数据：定义项目数组
- `ProjectCarousel`：3D 轮播组件
- `ProjectCard`：项目卡片组件

### 3. 创建项目详情页面

创建 `src/app/portfolio/[id]/page.tsx` 文件：

```typescript
import Link from 'next/link'
import { ArrowLeft, Calendar, Code, FileText } from 'lucide-react'
import { projects } from '@/lib/projects'

interface PageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailPage({ params }: PageProps) {
  const project = projects.find(p => p.id === params.id)
  
  if (!project) {
    return <div>项目不存在</div>
  }
  
  return (
    <div>
      <section className="py-12">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {project.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{project.date}</span>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">项目背景</h2>
        <p className="text-muted-foreground leading-relaxed">
          {project.background}
        </p>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">技术架构</h2>
        <p className="text-muted-foreground leading-relaxed">
          {project.architecture}
        </p>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.features.map((feature, index) => (
            <div key={index} className="bg-background border border-border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">技术栈</h2>
        <div className="flex flex-wrap gap-3">
          {project.skills.map((skill, index) => (
            <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">工作职责</h2>
        <ul className="space-y-4">
          {project.responsibilities.map((responsibility, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-muted-foreground">
                {responsibility}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">技术难点与解决方案</h2>
        <div className="space-y-6">
          {project.challenges.map((item, index) => (
            <div key={index} className="bg-background border border-border p-6 rounded shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-primary">
                {item.challenge}
              </h3>
              <p className="text-muted-foreground">
                {item.solution}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">项目成果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.achievements.map((achievement, index) => (
            <div key={index} className="bg-background border border-border p-6 rounded shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground">
                {achievement}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

**说明：**

- 动态路由：`[id]` 匹配项目 ID
- 项目详情：显示项目的所有信息
- 响应式布局：使用 Tailwind 的响应式类

---

## 部署上线

### 1. Vercel 部署

Vercel 是 Next.js 的官方部署平台，提供免费的部署服务。

#### 1.1 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 1.2 在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 配置项目设置（通常自动检测 Next.js 配置）
5. 点击 "Deploy"

Vercel 会自动：
- 检测 Next.js 项目
- 配置构建设置
- 部署到全球 CDN
- 提供 HTTPS 证书

### 2. 环境变量配置

在 Vercel 项目设置中配置环境变量：

- `NEXT_PUBLIC_SITE_URL`：网站 URL
- `NEXT_PUBLIC_GA_ID`：Google Analytics ID（可选）
- `NEXT_PUBLIC_AI_API_KEY`：AI API 密钥（可选）
- `NEXT_PUBLIC_AI_API_URL`：AI API URL（可选）
- `NEXT_PUBLIC_AI_MODEL`：AI 模型名称（可选）

### 3. 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加自定义域名
3. 按照提示配置 DNS 记录

### 4. CI/CD 配置

#### 4.1 GitHub Actions 配置

创建 `.github/workflows/ci.yml` 文件：

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Run lint
      run: npm run lint

    - name: Run type check
      run: npm run typecheck

    - name: Build project
      run: npm run build
```

#### 4.2 部署流程

1. **开发流程**：
   - 在本地开发新功能或修复 bug
   - 运行 `npm run lint` 检查代码风格
   - 运行 `npm run typecheck` 检查类型错误
   - 运行 `npm run build` 确保项目能正常构建
   - 提交代码并推送到 GitHub

2. **CI 流程**：
   - GitHub Actions 自动运行 CI 工作流
   - 检查代码风格、类型错误和构建状态
   - 如果所有检查通过，工作流成功完成

3. **部署流程**：
   - Vercel 自动检测 GitHub 仓库的更新
   - 触发新的部署流程
   - 部署完成后发送通知

### 5. 性能优化

#### 5.1 图片优化

使用 Next.js 的 Image 组件：

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority
/>
```

#### 5.2 字体优化

使用 Next.js 的字体优化：

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

#### 5.3 代码分割

Next.js 自动进行代码分割，但可以进一步优化：

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

#### 5.4 缓存优化

使用 Next.js 的缓存功能：

```typescript
// 在 API 路由中
export const revalidate = 60 // 60秒重新验证

// 在 getStaticProps 中
export async function getStaticProps() {
  return {
    props: { /* ... */ },
    revalidate: 60,
  }
}
```

### 6. 监控和分析

#### 6.1 Google Analytics

安装 `@vercel/analytics`：

```bash
npm install @vercel/analytics
```

在布局中使用：

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### 6.2 Vercel Analytics

Vercel 提供内置的分析工具，无需额外配置。

#### 6.3 站点地图生成

创建 `src/app/sitemap.ts` 文件：

```typescript
import { MetadataRoute } from 'next'
import { getCategories } from '@/lib/blog'
import { getArticles } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories()
  
  // 生成分类页面的 sitemap 条目
  const categoryEntries = categories.map((category) => ({
    url: `https://your-domain.com/blog/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 生成文章页面的 sitemap 条目
  const articleEntries = []
  for (const category of categories) {
    const articles = await getArticles(category.id)
    for (const article of articles) {
      articleEntries.push({
        url: `https://your-domain.com/blog/${category.id}/${article.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }
  }

  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://your-domain.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...categoryEntries,
    ...articleEntries,
  ]
}
```

---

## 总结

本教程详细介绍了如何从零开发一个 Next.js MDX 博客项目，涵盖了：

1. **项目初始化**：创建 Next.js 项目、安装依赖、配置项目
2. **项目结构**：了解 Next.js App Router 的目录结构
3. **核心功能**：主题切换、自定义光标、导航栏、滚动动画
4. **样式系统**：Tailwind CSS 的使用、响应式设计、深色模式
5. **博客系统**：Markdown 文章、分类、文章详情、搜索功能、分页
6. **AI 助手功能**：AI 聊天界面、文本选择处理、对话历史记录
7. **视频集成功能**：增强版 B 站播放器、选集功能、观看进度保存
8. **部署上线**：Vercel 部署、CI/CD 配置、性能优化、监控分析

通过本教程，你应该能够：
- 创建一个功能完整的 Next.js 博客项目
- 理解 Next.js App Router 的工作原理
- 掌握 Tailwind CSS 的使用方法
- 实现主题切换、响应式设计等功能
- 集成 AI 助手和视频播放器
- 部署项目到 Vercel 并配置 CI/CD 流程

希望本教程对你有所帮助！如有问题，欢迎交流讨论。

---

## 附录

### A. 推荐资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 官方文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [Framer Motion 文档](https://www.framer.com/motion)

### B. 常见问题

**Q: 如何处理 SEO？**

A: Next.js 提供了 Metadata API，可以在页面中设置元标签：

```typescript
export const metadata = {
  title: '我的博客',
  description: '分享技术文章和项目经验',
}
```

**Q: 如何优化性能？**

A: Next.js 提供了多种性能优化方法：
- 使用 Server Components
- 使用 Image 组件优化图片
- 使用字体优化
- 代码分割和懒加载

**Q: 如何处理国际化？**

A: 可以使用 next-intl 或其他国际化库：

```bash
npm install next-intl
```

### C. 最佳实践

1. **组件拆分**：将大型组件拆分为小型、专注的组件
2. **自定义 Hooks**：提取可复用的逻辑到自定义 Hooks
3. **类型安全**：充分利用 TypeScript 的类型系统
4. **性能优化**：使用 React.memo、useMemo、useCallback 优化性能
5. **代码规范**：使用 ESLint 和 Prettier 保持代码风格一致

---

*最后更新：2026年2月16日*
