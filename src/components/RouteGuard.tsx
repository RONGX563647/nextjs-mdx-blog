'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * 路由守卫组件
 * 根据当前路由路径控制全局组件的显示/隐藏
 * /interview 路由完全隐藏导航栏、自定义鼠标、AI助手等所有全局组件
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isInterviewRoute, setIsInterviewRoute] = useState(false)

  useEffect(() => {
    setIsInterviewRoute(pathname === '/interview' || pathname?.startsWith('/interview/'))
  }, [pathname])

  // 面试路由：完全独立，隐藏所有全局组件
  if (isInterviewRoute) {
    return (
      <>
        {/* 隐藏所有全局组件 */}
        <style>{`
          header, footer, [data-hide-on-interview="true"] { display: none !important; }
        `}</style>
        {children}
      </>
    )
  }

  return <>{children}</>
}
