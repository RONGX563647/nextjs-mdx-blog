'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useAIAssistant } from '@/components/ai/AIAssistant'

export function TextSelectionHandler() {
  const [selectedText, setSelectedText] = useState('')
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const { openAIAssistant } = useAIAssistant()

  // 检测文本选择
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() || ''
    
    if (text && text.length > 0) {
      setSelectedText(text)
    } else {
      setSelectedText('')
      setShowContextMenu(false)
    }
  }, [])

  // 处理右键点击
  const handleContextMenu = useCallback((e: MouseEvent) => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() || ''
    
    if (text && text.length > 0) {
      e.preventDefault()
      setSelectedText(text)
      setContextMenuPosition({ x: e.clientX, y: e.clientY })
      setShowContextMenu(true)
    }
  }, [])

  // 处理点击其他地方关闭菜单
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      setShowContextMenu(false)
    }
  }, [])

  // 处理键盘事件
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowContextMenu(false)
    }
  }, [])

  useEffect(() => {
    // 监听文本选择变化
    document.addEventListener('selectionchange', handleSelectionChange)
    
    // 监听右键点击
    document.addEventListener('contextmenu', handleContextMenu)
    
    // 监听点击其他地方
    document.addEventListener('click', handleClickOutside)
    
    // 监听键盘事件
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSelectionChange, handleContextMenu, handleClickOutside, handleKeyDown])

  const handleAskAI = () => {
    if (selectedText) {
      // 使用全局AI助手打开侧边栏并发送消息
      openAIAssistant(selectedText)
      setShowContextMenu(false)
      
      // 清除文本选择
      window.getSelection()?.removeAllRanges()
      setSelectedText('')
    }
  }

  if (!showContextMenu || !contextMenuPosition) return null

  return (
    <div
      ref={contextMenuRef}
      className="fixed z-[100] bg-background border border-border rounded-lg shadow-lg py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: contextMenuPosition.x,
        top: contextMenuPosition.y,
      }}
    >
      <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1">
        选中了 {selectedText.length} 个字符
      </div>
      <button
        onClick={handleAskAI}
        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Ask AI Assistant</span>
      </button>
    </div>
  )
}
