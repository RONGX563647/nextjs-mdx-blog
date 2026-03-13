/**
 * AI对话输入区域组件
 * 
 * 功能：
 * - 多行文本输入框
 * - 发送按钮（支持点击和 Enter 键）
 * - 字符计数
 * - 禁用状态（加载时禁用）
 * 
 * @param props 组件属性
 * @returns 输入区域组件
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ onSendMessage, isLoading, placeholder = '输入您的问题...' }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (value.trim() && !isLoading) {
      onSendMessage(value.trim())
      setValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      autoResize()
    }
  }, [value])

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autoResize()
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full min-h-[80px] max-h-[200px] p-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
        />
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          {value.length} 字符
        </div>
      </div>
      <button
        onClick={handleSend}
        disabled={isLoading || !value.trim()}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Send size={20} />
        )}
        <span className="hidden md:inline">发送</span>
      </button>
    </div>
  )
}
