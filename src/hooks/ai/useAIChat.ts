/**
 * AI对话交互逻辑 Hook
 * 
 * 功能：
 * - 管理对话状态
 * - 调用阿里云百炼平台 API 实现流式输出
 * - 处理加载状态和错误
 * - 支持对话历史记录
 * 
 * @returns AI对话相关状态和方法
 */

'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface AIConfig {
  apiKey: string
  apiUrl: string
  model: string
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamingTextRef = useRef('')
  const isStreamingRef = useRef(false)
  const streamingMessageIdRef = useRef<string | null>(null)

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const streamAIResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true)
    setError(null)
    streamingTextRef.current = ''
    isStreamingRef.current = true
    
    const messageId = `${Date.now()}-${Math.random()}`
    streamingMessageIdRef.current = messageId

    try {
      const config: AIConfig = {
        apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || 'sk-86c926b97fd244fd86412b3f11a5c1be',
        apiUrl: process.env.NEXT_PUBLIC_AI_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: process.env.NEXT_PUBLIC_AI_MODEL || 'qwen-turbo'
      }

      if (!config.apiKey) {
        throw new Error('未配置 AI API 密钥，请在环境变量中设置 NEXT_PUBLIC_AI_API_KEY')
      }

      console.log('正在调用 API:', config.apiUrl)
      console.log('使用模型:', config.model)

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            ...messages.slice(-10).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          stream: true
        })
      })

      console.log('API 响应状态:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 错误响应:', errorText)
        throw new Error(`API 调用失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应流')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]' || !data) {
              continue
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || parsed.output?.text || ''
              
              if (content) {
                streamingTextRef.current += content
                
                const assistantMessage: ChatMessage = {
                  id: messageId,
                  role: 'assistant',
                  content: streamingTextRef.current,
                  timestamp: Date.now()
                }
                
                setMessages(prev => {
                  const filtered = prev.filter(m => m.id !== messageId)
                  return [...filtered, assistantMessage]
                })
              }
            } catch (e) {
              console.error('解析流式响应失败:', e, '原始数据:', data)
            }
          }
        }
      }

      isStreamingRef.current = false
      setIsLoading(false)
      streamingMessageIdRef.current = null

    } catch (err) {
      console.error('AI API 调用错误:', err)
      setError(err instanceof Error ? err.message : '发生未知错误')
      setIsLoading(false)
      isStreamingRef.current = false
      streamingMessageIdRef.current = null
    }
  }, [messages])

  const handleSendMessage = useCallback((message: string) => {
    addMessage('user', message)
    streamAIResponse(message)
  }, [addMessage, streamAIResponse])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    streamingMessageIdRef.current = null
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return {
    messages,
    isLoading,
    error,
    streamingText: streamingTextRef.current,
    isStreaming: isStreamingRef.current,
    addMessage,
    handleSendMessage,
    clearMessages,
    removeMessage
  }
}
