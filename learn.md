# Next.js MDX 博客项目开发教程

## 目录

1. [项目概述](#项目概述)
2. [技术栈介绍](#技术栈介绍)
3. [项目初始化](#项目初始化)
4. [项目结构](#项目结构)
5. [核心功能开发](#核心功能开发)
6. [样式系统](#样式系统)
7. [博客系统](#博客系统)
8. [项目展示](#项目展示)
9. [部署上线](#部署上线)

---

## 项目概述

本项目是一个基于 Next.js 13 App Router 构建的个人博客系统，支持 Markdown 文章、评论、标签管理等功能。项目采用现代化的前端技术栈，具有良好的 SEO 优化、快速的页面加载速度和优秀的用户体验。

### 项目特点

- **现代化技术栈**：使用 Next.js 13、React 18、TypeScript 等最新技术
- **优秀的性能**：利用 Server Components 和 Streaming 优化页面加载
- **SEO 友好**：支持动态元标签和结构化数据
- **响应式设计**：完美支持桌面端和移动端
- **主题切换**：支持浅色模式和深色模式
- **Markdown 支持**：支持 Markdown 文章编写和代码高亮
- **自定义动画**：使用 Framer Motion 实现流畅的动画效果

### 核心功能

1. **首页**：展示个人介绍、精选项目和 3D 轮播
2. **关于页面**：展示个人信息、技能和经历
3. **项目页面**：展示项目经历和详细的项目信息
4. **博客系统**：支持 Markdown 文章、分类、评论等功能
5. **主题切换**：支持浅色/深色模式切换
6. **自定义光标**：桌面端显示跟随鼠标的自定义光标
7. **导航系统**：响应式导航栏，支持移动端菜单

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

---

## 项目初始化

### 1. 创建 Next.js 项目

使用 Next.js 官方脚手架创建项目：

```bash
# 使用 npm
npx create-next-app@latest my-blog

# 使用 yarn
yarn create next-app my-blog

# 使用 pnpm
pnpm create next-app my-blog
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
cd my-blog

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

# 安装类型定义
npm install -D @types/node
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

创建 `tailwind.config.ts` 文件：

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
export default config
```

**配置说明：**

- `content`：指定要扫描的文件路径
- `darkMode`：设置为 class，使用 class 控制深色模式
- `theme.extend.colors`：扩展颜色，使用 CSS 变量
- `theme.extend.borderRadius`：扩展圆角，使用 CSS 变量

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
    domains: ['localhost'],
  },
  experimental: {
    mdxRs: true,
  },
}

module.exports = nextConfig
```

**配置说明：**

- `reactStrictMode`：启用 React 严格模式
- `images.domains`：允许的图片域名
- `experimental.mdxRs`：启用 MDX 支持

### 4. 创建项目结构

创建以下目录结构：

```
my-blog/
├── public/              # 静态资源
│   ├── md/            # Markdown 文章
│   └── images/         # 图片资源
├── src/
│   ├── app/            # App Router 页面
│   │   ├── layout.tsx # 根布局
│   │   ├── page.tsx   # 首页
│   │   ├── about/     # 关于页面
│   │   ├── portfolio/ # 项目页面
│   │   └── blog/      # 博客页面
│   ├── components/      # 组件
│   │   ├── ui/        # UI 组件
│   │   ├── blog/      # 博客组件
│   │   └── portfolio/ # 项目组件
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具函数
│   └── styles/         # 全局样式
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── postcss.config.js
```

---

## 项目结构

### 目录说明

#### public/

存放静态资源，如图片、字体、PDF 等。

**特点：**

- 直接通过 URL 访问：`/images/logo.png`
- 不会被 Next.js 处理，直接返回文件
- 适合存放不常变化的静态资源

#### src/app/

App Router 的页面目录，基于文件系统的路由。

**路由规则：**

- `page.tsx`：页面组件
- `layout.tsx`：布局组件
- `loading.tsx`：加载组件
- `error.tsx`：错误组件
- `not-found.tsx`：404 组件

**示例：**

```
app/
├── page.tsx              # / (首页)
├── about/
│   └── page.tsx        # /about (关于页面)
├── portfolio/
│   ├── page.tsx          # /portfolio (项目列表)
│   └── [id]/
│       └── page.tsx      # /portfolio/:id (项目详情)
└── blog/
    ├── page.tsx          # /blog (博客列表)
    └── [category]/
        └── page.tsx      # /blog/:category (分类列表)
```

#### src/components/

存放可复用的组件。

**组件分类：**

- `ui/`：基础 UI 组件（按钮、输入框等）
- `blog/`：博客相关组件（文章列表、文章详情等）
- `portfolio/`：项目相关组件（项目卡片、项目轮播等）

#### src/hooks/

存放自定义 Hooks。

**示例：**

- `useArticle.ts`：文章相关 Hooks
- `useToc.ts`：目录相关 Hooks
- `useTheme.ts`：主题相关 Hooks

#### src/lib/

存放工具函数和常量。

**示例：**

- `utils.ts`：通用工具函数
- `constants.ts`：常量定义
- `api.ts`：API 调用函数

#### src/styles/

存放全局样式。

**示例：**

- `globals.css`：全局 CSS 样式

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
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

#### 2.2 在布局中使用自定义光标

修改 `src/app/layout.tsx` 文件：

```typescript
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

- `CustomCursor`：在 Providers 之后，children 之前
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

---

## 样式系统

### 1. 全局样式

创建 `src/app/globals.css` 文件：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

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
  --secondary-foreground: 0 0% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 90%;
  --radius: 0.25rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 25 95% 53%;
  --primary-foreground: 0 0% 98%;
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
  --ring: 240 4.9% 83.9%;
  --radius: 0.25rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

**说明：**

- `:root`：定义浅色模式的 CSS 变量
- `.dark`：定义深色模式的 CSS 变量
- 使用 HSL 颜色空间，便于调整主题

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

创建 `src/lib/mdx.ts` 文件：

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const articlesDirectory = path.join(process.cwd(), 'public', 'md')

export function getArticlesByCategory(category: string): Article[] {
  const fullPath = path.join(articlesDirectory, category)
  const fileNames = fs.readdirSync(fullPath)
  
  const articles = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(articlesDirectory, category, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      slug: id,
      title: data.title,
      description: data.description,
      date: data.date,
      category: category,
      content,
    }
  })
  
  return articles.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllCategories(): Category[] {
  const categories = fs.readdirSync(articlesDirectory)
  
  return categories.map((category) => ({
    id: category,
    name: category,
  }))
}
```

**说明：**

- `fs.readdirSync`：读取目录中的文件
- `fs.readFileSync`：读取文件内容
- `matter`：解析 Markdown 的 frontmatter
- `sort`：按日期排序

### 3. 创建博客列表页面

创建 `src/app/blog/page.tsx` 文件：

```typescript
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText } from 'lucide-react'
import { getAllCategories, getArticlesByCategory } from '@/lib/mdx'

export default function BlogPage() {
  const categories = getAllCategories()
  
  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            技术博客专栏
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            深入学习编程技术，从基础到进阶，记录学习过程中的思考与总结
          </p>
          
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
- 响应式网格：`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 4. 创建分类详情页面

创建 `src/app/blog/[category]/page.tsx` 文件：

```typescript
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText, Calendar } from 'lucide-react'
import { getArticlesByCategory } from '@/lib/mdx'

interface PageProps {
  params: {
    category: string
  }
}

export default function CategoryPage({ params }: PageProps) {
  const articles = getArticlesByCategory(params.category)
  
  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回专栏列表
          </Link>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {params.category}
                </h1>
                <p className="text-muted-foreground mt-1">
                  共 {articles.length} 篇文章
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${params.category}/${article.slug}`}
                className="block p-6 bg-background border border-border rounded shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    {article.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {article.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{article.date}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                          {params.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary rotate-180 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

**说明：**

- `params.category`：从 URL 获取分类名
- 动态路由：`[category]` 匹配任何分类名
- 文章列表：显示分类下的所有文章

### 5. 创建文章详情页面

创建 `src/app/blog/[category]/[slug]/page.tsx` 文件：

```typescript
import Link from 'next/link'
import { ArrowLeft, BookOpen, User, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import 'highlight.js/styles/github-dark.css'
import { getArticleBySlug, getArticlesByCategory } from '@/lib/mdx'

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug, params.category)
  const articles = getArticlesByCategory(params.category)
  const currentIndex = articles.findIndex(a => a.slug === params.slug)
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : undefined
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : undefined
  
  if (!article) {
    return <div>文章不存在</div>
  }
  
  return (
    <div className="min-h-screen">
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/blog/${params.category}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回 {params.category}
            </Link>

            <header className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href={`/blog/${params.category}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  {params.category}
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
            </header>

            <div className="bg-background border border-border rounded shadow-sm p-6 md:p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
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
                  {article.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-8 bg-background border border-border rounded shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {prevArticle ? (
                  <Link 
                    href={`/blog/${params.category}/${prevArticle.slug}`}
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
                    href={`/blog/${params.category}/${nextArticle.slug}`}
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
          </div>
        </div>
      </section>
    </div>
  )
}
```

**说明：**

- 动态路由：`[category]/[slug]` 匹配分类和文章 slug
- `ReactMarkdown`：渲染 Markdown 内容
- `remarkPlugins`：Markdown 插件
- `rehypePlugins`：HTML 处理插件
- 上一页/下一页：显示相邻文章

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

### 3. 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加自定义域名
3. 按照提示配置 DNS 记录

### 4. 性能优化

#### 4.1 图片优化

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

#### 4.2 字体优化

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

#### 4.3 代码分割

Next.js 自动进行代码分割，但可以进一步优化：

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

### 5. 监控和分析

#### 5.1 Google Analytics

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

#### 5.2 Vercel Analytics

Vercel 提供内置的分析工具，无需额外配置。

---

## 总结

本教程详细介绍了如何从零开发一个 Next.js MDX 博客项目，涵盖了：

1. **项目初始化**：创建 Next.js 项目、安装依赖、配置项目
2. **项目结构**：了解 Next.js App Router 的目录结构
3. **核心功能**：主题切换、自定义光标、导航栏、滚动动画
4. **样式系统**：Tailwind CSS 的使用、响应式设计、深色模式
5. **博客系统**：Markdown 文章、分类、文章详情
6. **项目展示**：项目列表、项目详情
7. **部署上线**：Vercel 部署、性能优化、监控分析

通过本教程，你应该能够：
- 创建一个功能完整的 Next.js 博客项目
- 理解 Next.js App Router 的工作原理
- 掌握 Tailwind CSS 的使用方法
- 实现主题切换、响应式设计等功能
- 部署项目到 Vercel

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

*最后更新：2026年1月*
