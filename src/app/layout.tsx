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
      <body className="min-h-screen flex flex-col bg-background">
        <ThemeProvider attribute="class" defaultTheme="system">
          <CustomCursor />
          
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
            <Container>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-5xl font-bold tracking-tighter">
                    RONGX
                  </Link>
                  <Navigation />
                </div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://github.com/RONGX563647" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Github size={20} />
                    GitHub
                  </a>
                  <ThemeSwitch />
                </div>
              </div>
            </Container>
          </header>
          
          <main className="flex-1">
            <Container>
              <PageTransition>{children}</PageTransition>
            </Container>
          </main>
          
          <footer className="py-16 border-t border-border">
            <Container>
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    © {new Date().getFullYear()} RONGX
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    构建高质量的全栈应用
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <Link className="link text-sm" href="/">首页</Link>
                  <Link className="link text-sm" href="/about">关于</Link>
                  <Link className="link text-sm" href="/portfolio">项目</Link>
                  <Link className="link text-sm" href="/blog">博客</Link>
                </div>
              </div>
            </Container>
          </footer>
        </ThemeProvider>
        
        <Analytics />
      </body>
    </html>
  )
}
