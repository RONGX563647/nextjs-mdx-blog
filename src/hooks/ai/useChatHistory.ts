/**
 * 对话历史记录 Hook
 * 
 * 功能：
 * - 保存对话历史到 localStorage
 * - 页面刷新后恢复对话历史
 * - 支持清除历史记录
 * 
 * @returns 对话历史相关状态和方法
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const HISTORY_KEY = 'ai-assistant-chat-history'
const MAX_HISTORY = 50

export function useChatHistory() {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem(HISTORY_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          setHistory(parsed)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
      setIsLoaded(true)
    }

    loadHistory()
  }, [])

  const saveHistory = useCallback((messages: ChatMessage[]) => {
    try {
      const trimmed = messages.slice(-MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }, [])

  const addMessage = useCallback((message: ChatMessage) => {
    setHistory(prev => {
      const newHistory = [...prev, message].slice(-MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }, [])

  return {
    history,
    isLoaded,
    saveHistory,
    addMessage,
    clearHistory
  }
}
