/**
 * 根布局组件
 * 定义了整个网站的基本结构，包括头部、主体和底部
 * 包含了主题切换、自定义光标、导航栏等全局组件
 */

// 导入必要的组件和工具
import { ThemeProvider } from '@/app/providers' // 主题提供者，用于管理网站主题
import { Container } from '@/components/Container' // 容器组件，提供统一的布局宽度
import { CustomCursor } from '@/components/CustomCursor' // 自定义光标效果
import { Navigation } from '@/components/Navigation' // 导航栏组件
import { PageTransition } from '@/components/PageTransition' // 页面过渡动画
import ThemeSwitch from '@/components/ThemeSwitch' // 主题切换按钮
import { WEBSITE_HOST_URL } from '@/lib/constants' // 网站主机URL
import { Analytics } from '@vercel/analytics/next' // Vercel分析工具
import type { Metadata } from 'next' // Next.js元数据类型
import Link from 'next/link' // Next.js链接组件
import { Github } from 'lucide-react' // GitHub图标
import './global.css' // 全局样式

// 网站基本元数据
const meta = {
  title: 'RONGX', // 网站标题
  description: '基于 Next.js 15 + TypeScript + Tailwind CSS 构建的个人博客网站，融合了创意设计与技术展示。', // 网站描述
  image: `${WEBSITE_HOST_URL}/og-image.png`, // 网站预览图
}

/**
 * Next.js元数据配置
 * 用于SEO、社交媒体分享等
 */
export const metadata: Metadata = {
  title: {
    default: meta.title, // 默认标题
    template: '%s | RONGX', // 标题模板，用于子页面
  },
  description: meta.description, // 网站描述
  openGraph: {
    // OpenGraph配置，用于Facebook等社交媒体
    title: meta.title,
    description: meta.description,
    url: WEBSITE_HOST_URL,
    siteName: meta.title,
    locale: 'zh-CN',
    type: 'website',
    images: [
      {
        url: meta.image,
      },
    ],
  },
  twitter: {
    // Twitter卡片配置
    title: meta.title,
    description: meta.description,
    images: meta.image,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: WEBSITE_HOST_URL, // 规范URL
  },
  icons: {
    // 网站图标
    icon: '/1.png',
    shortcut: '/1.png',
    apple: '/1.png',
  },
}

/**
 * 根布局组件
 * @param children 子组件，即页面内容
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
        {/* 主题提供者，用于管理浅色/深色主题 */}
        <ThemeProvider attribute="class" defaultTheme="system">
          {/* 自定义光标效果 */}
          <CustomCursor />
          
          {/* 头部导航栏 */}
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <Container>
              <div className="flex items-center justify-between py-4">
                {/* Logo和导航菜单 */}
                <div className="flex items-center gap-4">
                  <Link href="/" className="text-4xl font-bold">
                    RONGX
                  </Link>
                  <Navigation />
                </div>
                {/* 右侧按钮组 */}
                <div className="flex items-center gap-4">
                  {/* GitHub链接 */}
                  <a 
                    href="https://github.com/RONGX563647" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                  >
                    <Github size={24} />
                    GitHub
                  </a>
                  {/* 主题切换按钮 */}
                  <ThemeSwitch />
                </div>
              </div>
            </Container>
          </header>
          
          {/* 主内容区域 */}
          <main className="flex-1">
            <Container>
              {/* 页面过渡动画，包裹页面内容 */}
              <PageTransition>{children}</PageTransition>
            </Container>
          </main>
          
          {/* 页脚 */}
          <footer className="py-12 border-t">
            <Container>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* 版权信息 */}
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} RONGX. 保留所有权利.
                </p>
                {/* 页脚导航链接 */}
                <div className="flex items-center gap-4">
                  <Link className="link" href="/">首页</Link>
                  <Link className="link" href="/about">关于</Link>
                </div>
              </div>
            </Container>
          </footer>
        </ThemeProvider>
        
        {/* Vercel分析工具，用于统计网站访问数据 */}
        <Analytics />
      </body>
    </html>
  )
}
