/**
 * 悬浮球组件
 * 
 * 功能：
 * - 固定在页面右下角
 * - 显示AI助手图标
 * - 支持悬停效果（放大、阴影增强）
 * - 支持拖拽功能
 * - 点击时触发侧边栏展开
 * 
 * @returns 悬浮球组件
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

interface FloatingBallProps {
  onToggleSidebar: () => void
}

export function FloatingBall({ onToggleSidebar }: FloatingBallProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const ballRef = useRef<HTMLDivElement>(null)
  const dragStartTimeRef = useRef(0)

  useEffect(() => {
    const savedPosition = localStorage.getItem('ai-assistant-ball-position')
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition)
      if (ballRef.current) {
        ballRef.current.style.right = `${parsed.x}px`
        ballRef.current.style.bottom = `${parsed.y}px`
      }
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setHasMoved(false)
    dragStartTimeRef.current = Date.now()
    
    const startX = e.clientX
    const startY = e.clientY
    
    const startRight = parseInt(ballRef.current?.style.right || '20px')
    const startBottom = parseInt(ballRef.current?.style.bottom || '20px')
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX
      const deltaY = startY - moveEvent.clientY
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true)
      }
      
      const newRight = startRight + deltaX
      const newBottom = startBottom + deltaY
      
      const constrainedRight = Math.max(20, Math.min(newRight, window.innerWidth - 80))
      const constrainedBottom = Math.max(20, Math.min(newBottom, window.innerHeight - 80))
      
      if (ballRef.current) {
        ballRef.current.style.right = `${constrainedRight}px`
        ballRef.current.style.bottom = `${constrainedBottom}px`
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      
      if (ballRef.current) {
        const position = {
          x: parseInt(ballRef.current.style.right || '20px'),
          y: parseInt(ballRef.current.style.bottom || '20px')
        }
        localStorage.setItem('ai-assistant-ball-position', JSON.stringify(position))
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const dragDuration = Date.now() - dragStartTimeRef.current
    if (!isDragging || (isDragging && dragDuration < 200)) {
      e.preventDefault()
      e.stopPropagation()
      onToggleSidebar()
    }
  }, [isDragging, onToggleSidebar])

  return (
    <motion.div
      ref={ballRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        right: '20px',
        bottom: '20px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="fixed z-[9999]"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 border-black`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Bot className="w-8 h-8 text-black" />
      </motion.div>
    </motion.div>
  )
}
