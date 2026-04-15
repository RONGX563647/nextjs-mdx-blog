/**
 * 根布局组件
 * 定义了整个网站的基本结构，包括头部、主体和底部
 */

import { ThemeProvider } from '@/app/providers'
import { Container } from '@/components/Container'
import { CustomCursor } from '@/components/CustomCursor'
import { Navigation } from '@/components/Navigation'
import { PageTransition } from '@/components/PageTransition'
import ThemeSwitch from '@/components/ThemeSwitch'
import { WEBSITE_HOST_URL } from '@/lib/constants'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AIAssistant, AIAssistantProvider } from '@/components/ai/AIAssistant'
import { HeaderWithDoubleClick } from '@/components/HeaderWithDoubleClick'
import { siteConfig } from '@/data/site'
import './global.css'

const meta = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: `${WEBSITE_HOST_URL}${siteConfig.ogImage}`,
}

export const metadata: Metadata = {
  title: {
    default: meta.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: WEBSITE_HOST_URL,
    siteName: meta.title,
    locale: siteConfig.locale,
    type: 'website',
    images: [{ url: meta.image }],
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
  icons: {
    icon: siteConfig.favicon,
    shortcut: siteConfig.favicon,
    apple: siteConfig.favicon,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning={true}>
      <body className="min-h-screen flex flex-col bg-background">
        <ThemeProvider attribute="class" defaultTheme="system">
          <AIAssistantProvider>
            <CustomCursor />
            <HeaderWithDoubleClick />
            <main className="flex-1">
              <Container>
                <PageTransition>{children}</PageTransition>
              </Container>
            </main>
            <AIAssistant />
            <footer className="py-16 border-t border-border">
              <Container>
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
              </Container>
            </footer>
          </AIAssistantProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
