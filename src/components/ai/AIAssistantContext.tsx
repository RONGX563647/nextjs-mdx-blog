/**
 * AI助手全局状态管理Context
 * 
 * 功能：
 * - 提供全局AI助手状态管理
 * - 支持从任何组件打开AI助手并传入初始消息
 * - 统一悬浮球和文本选择两种触发方式
 * 
 * @returns AIAssistantProvider组件和useAIAssistant hook
 */

'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface AIAssistantContextType {
  isOpen: boolean
  initialMessage: string | undefined
  openAIAssistant: (message?: string) => void
  closeAIAssistant: () => void
  toggleAIAssistant: () => void
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined)

  const openAIAssistant = useCallback((message?: string) => {
    if (message) {
      setInitialMessage(message)
    }
    setIsOpen(true)
  }, [])

  const closeAIAssistant = useCallback(() => {
    setIsOpen(false)
    // 延迟清除初始消息，避免动画期间内容消失
    setTimeout(() => {
      setInitialMessage(undefined)
    }, 300)
  }, [])

  const toggleAIAssistant = useCallback(() => {
    setIsOpen(prev => {
      if (prev) {
        // 关闭时清除初始消息
        setTimeout(() => {
          setInitialMessage(undefined)
        }, 300)
      }
      return !prev
    })
  }, [])

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        initialMessage,
        openAIAssistant,
        closeAIAssistant,
        toggleAIAssistant
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider')
  }
  return context
}
