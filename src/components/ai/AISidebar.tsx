/**
 * AI助手侧边栏组件
 * 
 * 功能：
 * - 从页面右侧滑出
 * - 包含标题栏、关闭按钮、消息区域、输入区域
 * - 支持响应式设计（桌面端 350-400px，移动端全屏）
 * - 集成 AI 交互逻辑和对话历史记录
 * - 支持 Markdown 渲染（标题降级显示）
 * - 半透明背景、圆角边框、自动伸缩
 * - 支持初始消息自动发送
 * - 全部加载完成后自动滚动
 * 
 * @param props 组件属性
 * @returns 侧边栏组件
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Maximize2, Minimize2, Copy, Check } from 'lucide-react'
import { useAIChat } from '@/hooks/ai/useAIChat'
import { useChatHistory } from '@/hooks/ai/useChatHistory'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css'

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: string
}

const SIDEBAR_WIDTH = 380

// 代码块复制按钮组件
function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = useCallback(async () => {
    if (!code.trim()) return
    
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [code])
  
  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-1 right-1 p-1 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="复制代码"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
      <pre className={className}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function AISidebar({ isOpen, onClose, initialMessage }: AISidebarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const hasProcessedInitialMessage = useRef(false)
  const prevMessagesLength = useRef(0)
  
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

  // 处理初始消息 - 只处理一次
  useEffect(() => {
    if (initialMessage && isOpen && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true
      // 延迟发送，确保侧边栏动画完成
      setTimeout(() => {
        aiHandleSendMessage(initialMessage)
      }, 300)
    }
  }, [initialMessage, isOpen, aiHandleSendMessage])

  // 当侧边栏关闭时重置标记
  useEffect(() => {
    if (!isOpen) {
      hasProcessedInitialMessage.current = false
    }
  }, [isOpen])

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

  // 自动滚动 - 只在消息完全加载后滚动（消息数量增加且不在加载中）
  useEffect(() => {
    // 只有当消息数量增加且不在加载中时才滚动
    if (messages.length > prevMessagesLength.current && !isLoading && !isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessagesLength.current = messages.length
  }, [messages, isLoading, isStreaming])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // ReactMarkdown 自定义组件 - 标题降级：h1->h4, h2->h5, h3->h6
  const markdownComponents = {
    pre: ({ children }: { children?: React.ReactNode }) => {
      // 从children中提取代码文本
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node
        if (typeof node === 'number') return String(node)
        if (Array.isArray(node)) return node.map(extractText).join('')
        if (node && typeof node === 'object') {
          // 检查是否是React元素
          const element = node as any
          if (element.props && element.props.children) {
            return extractText(element.props.children)
          }
        }
        return ''
      }
      const code = extractText(children)
      return <CodeBlock code={code} className="bg-muted/50 p-2 rounded overflow-x-auto my-1 text-[10px]" />
    },
    code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: any }) => {
      const isInline = !className?.includes('language-')
      if (isInline) {
        return <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px]" {...props}>{children}</code>
      }
      return <code className={className} {...props}>{children}</code>
    },
    // 标题降级：h1->h4, h2->h5, h3->h6
    h1: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h4 className="text-xs font-bold mt-2 mb-1" {...props}>{children}</h4>
    ),
    h2: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h5 className="text-xs font-semibold mt-2 mb-1" {...props}>{children}</h5>
    ),
    h3: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-1" {...props}>{children}</h6>
    ),
    h4: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-0.5" {...props}>{children}</h6>
    ),
    h5: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-0.5" {...props}>{children}</h6>
    ),
    h6: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <h6 className="text-xs font-medium mt-1 mb-0.5" {...props}>{children}</h6>
    ),
  }

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
                          <div className="prose prose-xs dark:prose-invert max-w-none [&_*]:text-xs [&_p]:m-0 [&_p]:mb-1 [&_ul]:m-0 [&_ul]:mb-1 [&_ol]:m-0 [&_ol]:mb-1 [&_li]:m-0 [&_code]:text-[10px] [&_pre]:text-[10px]">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
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
