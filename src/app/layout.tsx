import { ThemeProvider } from '@/app/providers'
import { Container } from '@/components/Container'
import { CustomCursor } from '@/components/CustomCursor'
import { Navigation } from '@/components/Navigation'
import { PageTransition } from '@/components/PageTransition'
import ThemeSwitch from '@/components/ThemeSwitch'
import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import './global.css'

const meta = {
  title: '个人博客',
  description:
    '基于 Next.js 15 + TypeScript + Tailwind CSS 构建的个人博客网站，融合了创意设计与技术展示。',
  image: `${WEBSITE_HOST_URL}/og-image.png`,
}

export const metadata: Metadata = {
  title: {
    default: meta.title,
    template: '%s | 个人博客',
  },
  description: meta.description,
  openGraph: {
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
    title: meta.title,
    description: meta.description,
    images: meta.image,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: WEBSITE_HOST_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
        <ThemeProvider attribute="class" defaultTheme="system">
          <CustomCursor />
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <Container>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Link href="/" className="text-2xl font-bold">
                    个人博客
                  </Link>
                  <Navigation />
                </div>
                <ThemeSwitch />
              </div>
            </Container>
          </header>
          <main className="flex-1">
            <Container>
              <PageTransition>{children}</PageTransition>
            </Container>
          </main>
          <footer className="py-12 border-t">
            <Container>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} 个人博客. 保留所有权利.
                </p>
                <div className="flex items-center gap-4">
                  <Link className="link" href="/">首页</Link>
                  <Link className="link" href="/about">关于</Link>
                </div>
              </div>
            </Container>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
