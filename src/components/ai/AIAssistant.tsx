/**
 * AI助手主组件
 * 
 * 功能：
 * - 集成悬浮球和侧边栏
 * - 管理侧边栏的打开/关闭状态
 * - 提供统一的AI助手入口
 * 
 * @returns AI助手主组件
 */

'use client'

import { useState, useEffect } from 'react'
import { FloatingBall } from './FloatingBall'
import { AISidebar } from './AISidebar'

export function AIAssistant() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the default breakpoint for md in Tailwind
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  // Don't render AI components on mobile
  if (isMobile) return null

  return (
    <>
      <FloatingBall onToggleSidebar={toggleSidebar} />
      <AISidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
}
