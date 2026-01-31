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

import { useState } from 'react'
import { FloatingBall } from './FloatingBall'
import { AISidebar } from './AISidebar'

export function AIAssistant() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <>
      <FloatingBall onToggleSidebar={toggleSidebar} />
      <AISidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
}
