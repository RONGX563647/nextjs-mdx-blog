/**
 * 导航栏组件
 * 展示网站的主要导航链接，包括首页、关于、项目、博客和简历下载
 * 支持当前页面的高亮显示
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和工具
import Link from 'next/link' // Next.js链接组件
import { Download, Menu, X } from 'lucide-react' // 下载图标、菜单图标和关闭图标
import { Button } from '@/components/ui/button' // 按钮组件
import { usePathname } from 'next/navigation' // 获取当前路径的钩子
import { useState } from 'react' // React状态管理

/**
 * 导航栏组件
 * @returns 导航栏内容
 */
export function Navigation() {
  // 获取当前路径，用于判断哪个导航链接是活动状态
  const pathname = usePathname()
  // 移动端菜单状态管理
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* 桌面端导航栏 */}
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
