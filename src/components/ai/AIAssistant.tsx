/**
 * AI助手主组件
 * 
 * 功能：
 * - 集成悬浮球和侧边栏
 * - 管理侧边栏的打开/关闭状态
 * - 提供统一的AI助手入口
 * - 支持从文本选择传入初始消息
 * 
 * 使用方式：
 * 在layout.tsx中导入并使用AIAssistantProvider包裹应用
 * 然后在需要的地方使用AIAssistant组件
 * 
 * @returns AI助手主组件
 */

'use client'

import { useState, useEffect } from 'react'
import { FloatingBall } from './FloatingBall'
import { AISidebar } from './AISidebar'
import { useAIAssistant } from './AIAssistantContext'

export function AIAssistant() {
  const { isOpen, initialMessage, toggleAIAssistant, closeAIAssistant } = useAIAssistant()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render AI components on mobile
  if (isMobile) return null

  return (
    <>
      <FloatingBall onToggleSidebar={toggleAIAssistant} />
      <AISidebar 
        isOpen={isOpen} 
        onClose={closeAIAssistant}
        initialMessage={initialMessage}
      />
    </>
  )
}

// 导出Provider和hook
export { AIAssistantProvider, useAIAssistant } from './AIAssistantContext'
