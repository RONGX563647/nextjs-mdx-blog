'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { X, Send, Bot, User, Sparkles, Copy, Check } from 'lucide-react'
import { useAIChat } from '@/hooks/ai/useAIChat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIAssistantSidebarProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: string
}

// 代码块复制按钮组件
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = useCallback(async () => {
    // 提取代码文本
    let codeText = ''
    if (typeof children === 'string') {
      codeText = children
    } else if (Array.isArray(children)) {
      codeText = children.map(child => typeof child === 'string' ? child : '').join('')
    }
    
    if (!codeText.trim()) return
    
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [children])
  
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
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function AIAssistantSidebar({ isOpen, onClose, initialMessage }: AIAssistantSidebarProps) {
  const { 
    messages, 
    isLoading, 
    error,
    handleSendMessage
  } = useAIChat()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState('')
  const hasProcessedInitialMessage = useRef(false)

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 处理初始消息 - 只处理一次
  useEffect(() => {
    if (initialMessage && isOpen && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true
      // 直接调用handleSendMessage，它会自动添加用户消息
      handleSendMessage(initialMessage)
    }
  }, [initialMessage, isOpen, handleSendMessage])

  // 当侧边栏关闭时重置标记
  useEffect(() => {
    if (!isOpen) {
      hasProcessedInitialMessage.current = false
    }
  }, [isOpen])

  const handleSend = async () => {
    const message = inputValue.trim()
    if (!message) return
    
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    await handleSendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // 自动调整高度
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ReactMarkdown 自定义组件
  const markdownComponents = {
    pre: ({ children }: { children?: React.ReactNode }) => {
      return <CodeBlock className="bg-muted/50 p-2 rounded overflow-x-auto my-1">{children}</CodeBlock>
    },
    code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: any }) => {
      const isInline = !className?.includes('language-')
      if (isInline) {
        return <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px]" {...props}>{children}</code>
      }
      return <code className={className} {...props}>{children}</code>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI 助手</h3>
            <p className="text-xs text-muted-foreground">智能问答</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="p-4 bg-primary/5 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-sm mb-2">选择文章中的文字</p>
            <p className="text-xs">右键点击"Ask AI Assistant"获取帮助</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-primary/10' 
                : 'bg-muted'
            }`}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Bot className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className={`flex-1 max-w-[80%] ${
              message.role === 'user' ? 'text-right' : ''
            }`}>
              <div className={`inline-block p-3 rounded-2xl text-xs max-w-full overflow-hidden ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap'
                  : 'bg-muted rounded-bl-md prose prose-xs dark:prose-invert max-w-none [&_*]:text-xs [&_p]:m-0 [&_p]:mb-1 [&_ul]:m-0 [&_ul]:mb-1 [&_ol]:m-0 [&_ol]:mb-1 [&_li]:m-0 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h4]:text-xs [&_code]:text-[10px] [&_pre]:text-[10px]'
              }`}>
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-2xl bg-muted rounded-bl-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">错误: {error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 min-h-[40px] max-h-32 p-2.5 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="发送"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
