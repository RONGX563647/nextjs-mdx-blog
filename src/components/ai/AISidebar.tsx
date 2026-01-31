/**
 * AI助手侧边栏组件
 * 
 * 功能：
 * - 从页面右侧滑出
 * - 包含标题栏、关闭按钮、消息区域、输入区域
 * - 支持响应式设计（桌面端 350-400px，移动端全屏）
 * - 集成 AI 交互逻辑和对话历史记录
 * - 支持 Markdown 渲染
 * - 半透明背景、圆角边框、自动伸缩
 * 
 * @param props 组件属性
 * @returns 侧边栏组件
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Maximize2, Minimize2 } from 'lucide-react'
import { useAIChat } from '@/hooks/ai/useAIChat'
import { useChatHistory } from '@/hooks/ai/useChatHistory'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import 'highlight.js/styles/github-dark.css'

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
}

const SIDEBAR_WIDTH = 380

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  
  const { 
    messages, 
    isLoading, 
    error, 
    streamingText, 
    isStreaming,
    handleSendMessage: aiHandleSendMessage, 
    clearMessages 
  } = useAIChat()

  const { 
    history, 
    saveHistory 
  } = useChatHistory()

  const handleClearHistory = useCallback(() => {
    clearMessages()
    if (textareaRef.current) {
      textareaRef.current.value = ''
    }
  }, [clearMessages])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        saveHistory([...history, lastMessage])
      }
    }
  }, [messages, saveHistory, history])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[380px] bg-background backdrop-blur-sm border-l border-border shadow-2xl z-50 rounded-l-2xl"
            style={{
              borderTopLeftRadius: '1rem',
              borderBottomLeftRadius: '1rem',
              width: SIDEBAR_WIDTH
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground">AI助手</h2>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-muted/50 rounded transition-colors"
                    title={isExpanded ? '收起' : '展开'}
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="p-2 hover:bg-muted/50 rounded transition-colors text-xs text-muted-foreground"
                    title="清除历史"
                  >
                    清除历史
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted/50 rounded transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div 
                className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
                  isExpanded ? 'flex-1' : 'flex-1'
                }`}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="text-sm font-medium">
                          {message.role === 'user' ? '你' : 'AI'}
                        </span>
                      </div>
                      <div className={`flex-1 rounded-lg p-3 overflow-hidden ${
                        message.role === 'user' 
                          ? 'bg-primary/10' 
                          : 'bg-muted/80'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[
                                rehypeHighlight,
                                rehypeSlug,
                                [
                                  rehypeAutolinkHeadings,
                                  {
                                    behavior: 'wrap',
                                    properties: {
                                      className: ['anchor-link'],
                                    },
                                  },
                                ],
                              ]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="w-8 h-8 border-2 border-primary rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground ml-2">AI 正在思考...</span>
                    </div>
                  )}
                  {error && (
                    <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className={`p-4 border-t border-border/50 transition-all duration-300 ${
                isExpanded ? 'h-auto' : 'h-[50%]'
              }`}>
                <div className="flex gap-2 h-full">
                  <textarea
                    ref={textareaRef}
                    placeholder="输入您的问题..."
                    disabled={isLoading}
                    className="flex-1 p-3 bg-input/80 border border-border/80 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/80 resize-none transition-all"
                    style={{
                      height: isExpanded ? 'auto' : '100%'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        const message = textareaRef.current?.value || ''
                        if (message.trim()) {
                          aiHandleSendMessage(message.trim())
                          if (textareaRef.current) {
                            textareaRef.current.value = ''
                          }
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const message = textareaRef.current?.value || ''
                      if (message.trim()) {
                        aiHandleSendMessage(message.trim())
                        if (textareaRef.current) {
                          textareaRef.current.value = ''
                        }
                      }
                    }}
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary/90 text-primary-foreground rounded-lg font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send size={20} />
                    <span className="hidden md:inline">发送</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
