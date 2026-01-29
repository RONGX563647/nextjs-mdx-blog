# Next.js 全栈个人博客/作品集网站开发指南

## 项目简介

这是一个基于 Next.js 16 的个人博客/作品集网站，使用 MDX、Tailwind CSS 和 Framer Motion 等现代前端技术构建。网站具有美观的 UI 设计、丰富的动画效果和响应式布局，适合展示个人作品和全栈开发技术能力。

### 核心功能

- **3D 视觉效果和动画**：使用 Three.js 和 Framer Motion 创建 3D 背景和动画效果
- **响应式设计**：完美适配桌面、平板和手机等各种设备
- **深色模式支持**：内置主题切换功能，支持深色和浅色模式
- **项目展示和详情页**：展示个人项目作品，包括福师畅聊和师大云学等全栈项目
- **平滑的滚动和页面过渡效果**：基于 Framer Motion 实现流畅的动画效果

## 项目结构

```
nextjs-mdx-blog/
├── .github/              # GitHub 配置文件
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
├── README.md            # 项目说明文档
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

## 技术栈

### 核心技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Next.js | ^16.1.3 | 框架核心，提供 SSR、App Router 等功能 | 性能优异，功能丰富，生态成熟，Vercel 集成 |
| React | ^19.2.3 | UI 库 | 最流行的 UI 库，生态成熟，组件化开发 |
| TypeScript | ^5.6.2 | 类型系统 | 类型安全，减少运行时错误，提高开发效率 |
| Tailwind CSS | 3.3.3 | 样式框架 | 原子化 CSS 类，响应式设计，开发速度快 |
| shadcn/ui | 最新版 | UI 组件库 | 高质量的 UI 组件，可定制，TypeScript 支持 |

### 创意增强技术

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Framer Motion | ^12.27.1 | 动画库 | 声明式动画 API，物理动画，滚动触发 |
| GSAP | 3.x | 高级动画库 | 高性能，复杂动画，滚动效果，3D 变换 |
| Three.js | 0.160+ | 3D 渲染库 | 强大的 3D 渲染能力，WebGL 支持，场景管理 |
| React Three Fiber | 8.x | Three.js 的 React 封装 | 将 Three.js 与 React 集成，组件化开发 |

### 工具与依赖

| 工具 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| ESLint | 8.56.0 | 代码质量检查 | 保持代码质量，遵循最佳实践 |
| Prettier | ^3.0.3 | 代码格式化 | 统一代码风格，提高可读性 |
| Vercel | 最新版 | 托管和部署平台 | 与 Next.js 无缝集成，全球 CDN |
| GitHub Actions | 最新版 | CI/CD 自动化 | 自动化构建和部署流程 |

## 技术架构

### 架构图

```mermaid
flowchart TD
    subgraph 前端
        A[Next.js 16<br>App Router] --> B[TypeScript]
        A --> C[Tailwind CSS]
        A --> D[shadcn/ui]
        B --> E[Contentlayer]
        E --> F[MDX]
        C --> G[Framer Motion]
        C --> H[GSAP]
        D --> I[Three.js]
        D --> J[React Three Fiber]
        A --> K[Fuse.js]
        A --> L[Giscus]
    end
    
    subgraph 构建与部署
        M[Turborepo] --> N[Vercel]
        M --> O[GitHub Actions]
        N --> P[生产环境]
    end
    
    E --> M
    F --> M
```

## 性能优化策略

### 1. 构建优化

- **静态生成** - 优先使用静态生成 (SSG)
- **增量静态再生** - 使用 ISR 减少构建时间
- **代码分割** - 利用 Next.js 的自动代码分割
- **树摇** - 移除未使用的代码
- **图片优化** - 使用 Sharp 自动优化图片

### 2. 运行时优化

- **服务端渲染** - 首屏内容服务端渲染
- **客户端缓存** - 合理使用 React 缓存
- **预加载** - 预加载关键资源
- **懒加载** - 图片和组件懒加载
- **字体优化** - 字体预加载和子集化

### 3. 资源优化

- **CSS 优化** - Tailwind 自动移除未使用的 CSS
- **JS 优化** - 最小化和压缩 JavaScript
- **图片格式** - 使用 WebP 和 AVIF 格式
- **CDN 缓存** - 利用 Vercel 的 CDN
- **缓存策略** - 合理的缓存头设置

## 安全考虑

### 1. 前端安全

- **XSS 防护** - 自动转义用户输入
- **CSP** - 内容安全策略
- **HTTPS** - 强制使用 HTTPS
- **依赖安全** - 定期更新依赖包
- **输入验证** - 客户端输入验证

### 2. 部署安全

- **环境变量** - 安全存储敏感信息
- **权限控制** - 最小权限原则
- **CI/CD 安全** - 安全的构建流程
- **依赖扫描** - 自动扫描依赖漏洞

## 开发环境搭建

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

## 核心功能开发

### 1. 首页开发

首页是网站的入口，包含英雄区、精选项目和 3D 轮播图。

#### 1.1 英雄区

英雄区使用了 `Hero3DBackground` 组件创建 3D 背景效果，`MouseParallax` 组件实现鼠标视差效果，`ScrollAnimation` 组件实现滚动动画。

```tsx
// src/app/page.tsx 英雄区代码
<section className="py-40 text-center relative overflow-hidden">
  {/* 3D 背景效果组件 */}
  <Hero3DBackground />
  
  <div className="w-full max-w-6xl mx-auto relative z-10">
    {/* 3D 文本动画 */}
    <ScrollAnimation className="mb-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Logo 区域 */}
        <div className="flex-shrink-0">
          <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-white p-6 sm:p-8 shadow-lg flex items-center justify-center">
            <img src="/1.png" alt="RONGX Logo" className="w-full h-full object-contain transform -translate-y-10" />
          </div>
        </div>
        
        {/* 个人介绍文本 */}
        <div className="text-center md:text-left max-w-2xl">
          <h1 className="font-bold tracking-tight mb-6">
            <span className="text-4xl md:text-5xl lg:text-6xl">你好，我是</span>
            <span className="mx-2 text-6xl md:text-7xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">RONGX</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-8">
            全栈开发工程师 | Java | Vue3 
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            专注于Java后端和Vue3前端开发，致力于构建高质量的全栈应用。
          </p>
        </div>
      </div>
    </ScrollAnimation>
    
    {/* 行动按钮区域 */}
    <ScrollAnimation className="flex flex-wrap justify-center gap-6" delay={0.2}>
      {/* 了解更多按钮 */}
      <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <Link href="/about">了解更多 →</Link>
      </Button>
      
      {/* 查看项目按钮 */}
      <Button asChild variant="outline" className="text-lg px-10 py-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 hover:bg-white/5 dark:hover:bg-gray-800/50 transition-all duration-300">
        <Link href="/portfolio">查看项目</Link>
      </Button>
      
      {/* 下载简历按钮 */}
      <div className="relative group">
        <Button asChild variant="secondary" className="text-lg px-10 py-6 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
          <a href="/1.pdf" download className="flex items-center gap-2">
            <Download size={20} />
            下载简历
          </a>
        </Button>
        
        {/* 预览简历按钮 - 在新标签页打开 */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -top-2 -right-2 bg-blue-600 text-white hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <a href="/1.pdf" target="_blank" rel="noopener noreferrer">
            <Eye size={16} />
          </a>
        </Button>
      </div>
    </ScrollAnimation>
  </div>
</section>
```

#### 1.2 精选项目

使用 `GlassCard` 组件展示精选项目，配合 `ScrollAnimation` 实现滚动时的动画效果。

```tsx
// src/app/page.tsx 精选项目代码
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* 福师畅聊项目 */}
  <ScrollAnimation delay={0.2}>
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-3">福师畅聊 - 全栈开发</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责全栈开发工作。
      </p>
      {/* 技术标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-blue-100/70 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 rounded-full text-sm">Spring Boot</span>
        <span className="px-3 py-1 bg-green-100/70 text-green-800 dark:bg-green-900/70 dark:text-green-200 rounded-full text-sm">Netty</span>
        <span className="px-3 py-1 bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 rounded-full text-sm">Redis</span>
        <span className="px-3 py-1 bg-purple-100/70 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200 rounded-full text-sm">Vue3</span>
      </div>
      {/* 查看详情按钮 */}
      <Button asChild variant="ghost" className="text-blue-600 dark:text-blue-400">
        <a href="/portfolio/福师畅聊" className="flex items-center gap-1">
          查看详情
          <ExternalLink size={14} />
        </a>
      </Button>
    </GlassCard>
  </ScrollAnimation>
  
  {/* 师大云学项目 */}
  <ScrollAnimation delay={0.4}>
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-3">师大云学 - 全栈开发</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        基于 Spring Cloud Alibaba 开发的在线教育平台，负责全栈开发工作。
      </p>
      {/* 技术标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-blue-100/70 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 rounded-full text-sm">Spring Cloud</span>
        <span className="px-3 py-1 bg-green-100/70 text-green-800 dark:bg-green-900/70 dark:text-green-200 rounded-full text-sm">MySQL</span>
        <span className="px-3 py-1 bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 rounded-full text-sm">RabbitMQ</span>
        <span className="px-3 py-1 bg-purple-100/70 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200 rounded-full text-sm">Vue3</span>
      </div>
      {/* 查看详情按钮 */}
      <Button asChild variant="ghost" className="text-blue-600 dark:text-blue-400">
        <a href="/portfolio/师大云学" className="flex items-center gap-1">
          查看详情
          <ExternalLink size={14} />
        </a>
      </Button>
    </GlassCard>
  </ScrollAnimation>
</div>
```

#### 1.3 3D 轮播图

使用 `ThreeDCarousel` 组件实现 3D 效果的项目轮播图。

```tsx
// src/app/page.tsx 3D 轮播图代码
<section className="py-20 border-t border-gray-200 dark:border-gray-700">
  <ScrollAnimation>
    <h2 className="text-3xl font-semibold tracking-tight mb-6 text-center">
      项目展示
    </h2>
  </ScrollAnimation>
  <ScrollAnimation>
    <div className="max-w-4xl mx-auto">
      <ThreeDCarousel />
    </div>
  </ScrollAnimation>
</section>
```

### 2. 关于页面开发

关于页面用于展示个人信息和技能。

```tsx
// src/app/about/page.tsx
import { ScrollAnimation } from '@/components/ScrollAnimation'

export default function About() {
  return (
    <div className="py-20">
      <ScrollAnimation>
        <h1 className="text-4xl font-bold mb-12 text-center">关于我</h1>
      </ScrollAnimation>
      
      {/* 个人信息和技能展示 */}
      {/* 在这里添加个人信息和技能展示内容 */}
    </div>
  )
}
```

### 3. 作品集页面开发

作品集页面包含项目列表和详情页。

#### 3.1 作品集列表

```tsx
// src/app/portfolio/page.tsx
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { GlassCard } from '@/components/GlassCard'

export default function Portfolio() {
  return (
    <div className="py-20">
      <ScrollAnimation>
        <h1 className="text-4xl font-bold mb-12 text-center">作品集</h1>
      </ScrollAnimation>
      
      {/* 项目列表 */}
      {/* 在这里添加项目列表 */}
    </div>
  )
}
```

#### 3.2 作品集详情

使用动态路由 `[id]/page.tsx` 实现项目详情页。

```tsx
// src/app/portfolio/[id]/page.tsx
import { ScrollAnimation } from '@/components/ScrollAnimation'

// 定义路由参数接口
interface Params {
  id: string
}

export default function ProjectDetail({ params }: { params: Params }) {
  const { id } = params
  return (
    <div className="py-20">
      <ScrollAnimation>
        <h1 className="text-4xl font-bold mb-12 text-center">{id}</h1>
      </ScrollAnimation>
      
      {/* 项目详情 */}
      {/* 在这里添加项目详情内容 */}
    </div>
  )
}
```

### 4. 导航栏开发

导航栏包含网站链接和主题切换按钮，支持当前页面高亮显示。

```tsx
// src/components/Navigation.tsx
'use client'

import Link from 'next/link'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export function Navigation() {
  // 获取当前路径，用于判断哪个导航链接是活动状态
  const pathname = usePathname()

  return (
    <>
      {/* 桌面端导航栏 */}
      <nav className="hidden md:flex items-center gap-4 text-lg">
        {/* 首页链接 */}
        <Link 
          href="/" 
          className={`px-4 py-3 rounded-md transition-all duration-300 ${pathname === '/' ? 'text-blue-600 font-semibold' : 'hover:bg-accent hover:text-accent-foreground'}`}
          style={pathname === '/' ? { borderBottom: '3px solid #1e40af' } : {}}
        >
          首页
        </Link>
        
        {/* 关于链接 */}
        <Link 
          href="/about" 
          className={`px-4 py-3 rounded-md transition-all duration-300 ${pathname === '/about' ? 'text-blue-600 font-semibold' : 'hover:bg-accent hover:text-accent-foreground'}`}
          style={pathname === '/about' ? { borderBottom: '3px solid #1e40af' } : {}}
        >
          关于
        </Link>
        
        {/* 项目链接 */}
        <Link 
          href="/portfolio" 
          className={`px-4 py-3 rounded-md transition-all duration-300 ${pathname === '/portfolio' ? 'text-blue-600 font-semibold' : 'hover:bg-accent hover:text-accent-foreground'}`}
          style={pathname === '/portfolio' ? { borderBottom: '3px solid #1e40af' } : {}}
        >
          项目
        </Link>
        
        {/* 博客链接 - 在新标签页打开 */}
        <a 
          href="https://blog.csdn.net" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          博客
        </a>
        
        {/* 简历下载链接 */}
        <a 
          href="/1.pdf" 
          download 
          className="px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
        >
          <Download size={24} />
          简历
        </a>
      </nav>
      
      {/* 移动端菜单按钮 */}
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
      
      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg z-50">
          <div className="flex flex-col p-4 gap-2">
            {/* 首页链接 */}
            <Link 
              href="/" 
              className={`px-4 py-3 rounded-md transition-all duration-300 ${pathname === '/' ? 'text-blue-600 font-semibold bg-accent/50' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            {/* 关于链接 */}
            <Link 
              href="/about" 
              className={`px-4 py-3 rounded-md transition-all duration-300 ${pathname === '/about' ? 'text-blue-600 font-semibold bg-accent/50' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              关于
            </Link>
            {/* 项目链接 */}
            <Link 
              href="/portfolio" 
              className={`px-4 py-3 rounded-md transition-all duration-300 ${pathname === '/portfolio' ? 'text-blue-600 font-semibold bg-accent/50' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              项目
            </Link>
            {/* 博客链接 */}
            <a 
              href="https://blog.csdn.net" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              博客
            </a>
            {/* 简历下载链接 */}
            <a 
              href="/1.pdf" 
              download 
              className="px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
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

### 5. 主题切换功能

使用 `next-themes` 实现深色模式和浅色模式的切换。

```tsx
// src/components/ThemeSwitch.tsx
'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitch() {
  // 获取当前主题和设置主题的方法
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  )
}
```

### 6. 动画效果实现

#### 6.1 滚动动画

使用 Framer Motion 实现滚动时的动画效果。

```tsx
// src/components/ScrollAnimation.tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// 定义组件属性接口
interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollAnimation({ children, className, delay = 0 }: ScrollAnimationProps) {
  return (
    <motion.div
      className={className}
      // 初始状态：透明且向下偏移50px
      initial={{ opacity: 0, y: 50 }}
      // 进入视口时的状态：不透明且回到原始位置
      whileInView={{ opacity: 1, y: 0 }}
      // 动画配置：持续0.8秒，指定延迟，使用easeOut缓动函数
      transition={{
        duration: 0.8,
        delay: delay,
        ease: "easeOut"
      }}
      // 视口配置：只触发一次动画，视口边缘扩展-100px
      viewport={{
        once: true,
        margin: "-100px"
      }}
    >
      {children}
    </motion.div>
  )
}
```

#### 6.2 鼠标视差效果

实现鼠标移动时的视差效果。

```tsx
// src/components/MouseParallax.tsx
'use client'

import { useState, useEffect } from 'react'

// 定义组件属性接口
interface MouseParallaxProps {
  children: React.ReactNode
  intensity?: number
  className?: string
}

export function MouseParallax({ children, intensity = 10, className }: MouseParallaxProps) {
  // 鼠标位置状态
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // 鼠标移动事件处理函数
    const handleMouseMove = (e: MouseEvent) => {
      // 计算鼠标相对于屏幕中心的位置（-1到1范围）
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      setPosition({ x, y })
    }

    // 添加鼠标移动事件监听器
    window.addEventListener('mousemove', handleMouseMove)
    
    // 清理函数：移除事件监听器
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      className={className}
      // 应用视差变换效果
      style={{
        transform: `translate(${position.x * intensity}px, ${position.y * intensity}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  )
}
```

#### 6.3 3D 效果

使用 Three.js 和 React Three Fiber 实现 3D 背景。

```tsx
// src/components/Hero3DBackground.tsx
'use client'

import { useRef, useEffect } from 'react'

export function Hero3DBackground() {
  // 创建canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Three.js 场景初始化逻辑
    // 在这里添加3D场景、相机、渲染器等代码
    
    // 清理函数
    return () => {
      // 清理Three.js资源
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />
  )
}
```

## 部署与优化

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

### 4. 优化建议

1. **图片优化**：使用 Next.js 的 `Image` 组件优化图片加载
2. **代码分割**：利用 Next.js 的自动代码分割功能
3. **缓存策略**：配置合理的缓存策略
4. **SEO 优化**：添加 meta 标签和 sitemap
5. **性能监控**：使用 Vercel Analytics 监控性能

## 开发指南

### 1. 添加新页面

在 `src/app` 目录下创建新的文件夹和 `page.tsx` 文件。

### 2. 添加新组件

在 `src/components` 目录下创建新的组件文件。

### 3. 添加新样式

使用 Tailwind CSS 类名进行样式设计，参考 `tailwind.config.js` 配置。

### 4. 修改主题

在 `src/app/layout.tsx` 中修改主题配置。

## 总结与扩展

本项目是一个使用现代前端技术栈构建的个人博客/作品集网站，具有以下特点：

1. **现代化技术**：使用 Next.js 16、React 19、Tailwind CSS 等最新技术
2. **丰富的动画**：实现了 3D 背景、鼠标视差、滚动动画等效果
3. **响应式设计**：适配各种屏幕尺寸
4. **深色模式**：支持主题切换
5. **良好的用户体验**：平滑的过渡效果和交互

### 可能的扩展方向

1. **添加博客功能**：使用 MDX 实现博客文章
2. **集成 CMS**：使用 Sanity 或 Contentful 等 CMS 管理内容
3. **添加评论系统**：集成 Disqus 或其他评论系统
4. **实现多语言支持**：添加国际化功能
5. **优化 SEO**：进一步优化网站的搜索引擎排名

## 开发命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |

---

通过本指南，你应该能够理解项目的结构和开发流程，并能够基于此项目进行扩展和定制。祝你开发愉快！
