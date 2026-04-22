/**
 * 根布局组件
 * 定义了整个网站的基本结构
 */

import { ThemeProvider } from '@/app/providers'
import { GlobalComponents } from '@/components/GlobalComponents'
import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
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
          <GlobalComponents>{children}</GlobalComponents>
        </ThemeProvider>
      </body>
    </html>
  )
}
