'use client'

/**
 * 全局组件包装器
 * 根据当前路由条件性渲染全局组件
 * /interview 路由完全隐藏导航栏、鼠标指针、AI助手等所有全局组件
 */

import { usePathname } from 'next/navigation'
import { CustomCursor } from '@/components/CustomCursor'
import { PageTransition } from '@/components/PageTransition'
import { AIAssistant, AIAssistantProvider } from '@/components/ai/AIAssistant'
import { HeaderWithDoubleClick } from '@/components/HeaderWithDoubleClick'
import { siteConfig } from '@/data/site'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'

export function GlobalComponents({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isInterviewRoute = pathname === '/interview' || pathname?.startsWith('/interview/') || pathname?.startsWith('/interview-detail')

  // 面试路由：完全独立，不渲染任何全局组件
  if (isInterviewRoute) {
    return <>{children}</>
  }

  // 主站路由：正常渲染所有全局组件
  return (
    <AIAssistantProvider>
      <CustomCursor />
      <HeaderWithDoubleClick />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <AIAssistant />
      <footer className="py-16 border-t border-border">
        <div className="mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                © {new Date().getFullYear()} {siteConfig.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {siteConfig.footer.slogan}
              </p>
            </div>
            <div className="flex items-center gap-8">
              {siteConfig.nav.map((item) => (
                <Link key={item.href} className="link text-sm" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <Analytics />
    </AIAssistantProvider>
  )
}
