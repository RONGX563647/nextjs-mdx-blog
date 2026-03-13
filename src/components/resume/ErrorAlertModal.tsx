'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ErrorAlertModalProps {
  isOpen: boolean
  message: string
  onClose: () => void
}

// localStorage key
const ERROR_RECORD_KEY = 'resume_download_error_record'

// 记录错误到localStorage
export function recordErrorToStorage(answers: Record<number, string>) {
  const record = {
    timestamp: new Date().toISOString(),
    answers,
    userAgent: navigator.userAgent,
  }
  localStorage.setItem(ERROR_RECORD_KEY, JSON.stringify(record))
}

// 获取错误记录
export function getErrorRecord() {
  const record = localStorage.getItem(ERROR_RECORD_KEY)
  return record ? JSON.parse(record) : null
}

// 清除错误记录
export function clearErrorRecord() {
  localStorage.removeItem(ERROR_RECORD_KEY)
}

export function ErrorAlertModal({ isOpen, message, onClose }: ErrorAlertModalProps) {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 3秒后自动关闭
  useEffect(() => {
    if (!isOpen) {
      setProgress(100)
      return
    }

    setProgress(100)
    const duration = 3000 // 3秒
    const interval = 50 // 每50ms更新一次
    const step = 100 / (duration / interval)

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - step
        if (newProgress <= 0) {
          return 0
        }
        return newProgress
      })
    }, interval)

    const closeTimer = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearInterval(progressTimer)
      clearTimeout(closeTimer)
    }
  }, [isOpen, onClose])

  // 防止body滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
          }}
        >
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />

          {/* 错误弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              margin: '0 16px',
              zIndex: 1,
            }}
          >
            <div className="bg-background border border-destructive/30 rounded-xl shadow-2xl overflow-hidden">
              {/* 头部图标 */}
              <div className="flex flex-col items-center pt-8 pb-4 bg-destructive/5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
                >
                  <XCircle className="h-10 w-10 text-destructive" />
                </motion.div>
                <h3 className="text-xl font-semibold text-destructive">验证失败</h3>
              </div>

              {/* 错误信息 */}
              <div className="px-6 py-4 text-center">
                <p className="text-muted-foreground text-base leading-relaxed">{message}</p>
              </div>

              {/* 倒计时进度条 */}
              <div className="px-6 pb-6">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-destructive"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.05, ease: 'linear' }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  {Math.ceil((progress / 100) * 3)}秒后自动关闭
                </p>
              </div>

              {/* 关闭按钮 */}
              <div className="px-6 pb-6">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
                >
                  知道了
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (!mounted) return null

  return createPortal(modalContent, document.body)
}
