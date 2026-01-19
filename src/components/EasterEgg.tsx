'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'

interface EasterEggProps {
  children: React.ReactNode
  className?: string
}

export function EasterEgg({ children, className }: EasterEggProps) {
  const [count, setCount] = useState(0)
  const [showEgg, setShowEgg] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = () => {
    setCount(prev => {
      const newCount = prev + 1
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setCount(0)
      }, 3000)

      if (newCount === 5) {
        setShowEgg(true)
        setTimeout(() => {
          setShowEgg(false)
          setCount(0)
        }, 3000)
      }

      return newCount
    })
  }

  return (
    <div className={className} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {showEgg && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-2xl text-white text-center">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0]
                }}
                transition={{
                  duration: 1
                }}
              >
                🎉 恭喜你发现了隐藏彩蛋！ 🎉
              </motion.div>
              <p className="mt-4 text-lg">你是一个细心的探索者！</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
