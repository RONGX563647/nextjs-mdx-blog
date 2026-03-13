/**
 * 对话消息组件
 * 
 * 功能：
 * - 显示用户和AI的对话消息
 * - 支持流式输出效果（逐字/逐句显示）
 * - 区分用户消息和AI消息的样式
 * 
 * @param props 组件属性
 * @returns 对话消息组件
 */

'use client'

import { motion } from 'framer-motion'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const words = message.content.split('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <span className="text-sm font-medium">
          {message.role === 'user' ? '你' : 'AI'}
        </span>
      </div>
      <div className={`flex-1 rounded-lg p-3 ${
        message.role === 'user' 
          ? 'bg-primary/10' 
          : 'bg-muted'
      }`}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.1 }}
            className="text-sm leading-relaxed text-foreground"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}
