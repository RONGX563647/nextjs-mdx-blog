'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'
import { ErrorAlertModal, recordErrorToStorage } from './ErrorAlertModal'

interface ResumeDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
}

interface Question {
  id: number
  text: string
  options: { value: string; label: string }[]
  correctAnswer: string
}

const questions: Question[] = [
  {
    id: 1,
    text: '贵公司招聘岗位与我技术栈匹配吗',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
    ],
    correctAnswer: 'yes',
  },
  {
    id: 2,
    text: '贵公司团队氛围融洽吗？',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
    ],
    correctAnswer: 'yes',
  },
  {
    id: 3,
    text: '贵公司工作节奏快吗',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
    ],
    correctAnswer: 'no',
  },
]

export function ResumeDownloadModal({ isOpen, onClose, onDownload }: ResumeDownloadModalProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAnswerChange = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)
    
    // 检查是否回答了所有问题
    const unansweredQuestions = questions.filter((q) => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      setErrorMessage('请回答所有问题后再提交')
      setErrorModalOpen(true)
      setIsSubmitting(false)
      return
    }

    // 验证答案
    const allCorrect = questions.every((q) => answers[q.id] === q.correctAnswer)
    
    if (allCorrect) {
      // 验证通过，触发下载
      onDownload()
      onClose()
      // 重置状态
      setAnswers({})
    } else {
      // 验证失败，记录到localStorage并显示错误弹窗
      recordErrorToStorage(answers)
      setErrorMessage('很抱歉，无法接受贵司')
      setErrorModalOpen(true)
    }
    
    setIsSubmitting(false)
  }, [answers, onClose, onDownload])

  const handleClose = useCallback(() => {
    setAnswers({})
    setErrorModalOpen(false)
    onClose()
  }, [onClose])

  const handleErrorModalClose = useCallback(() => {
    setErrorModalOpen(false)
    // 关闭错误弹窗后，验证弹窗保持打开状态
  }, [])

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
    <>
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
              zIndex: 9999 
            }}
          >
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={handleClose}
            />
            
            {/* 模态框 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ 
                position: 'relative',
                width: '100%',
                maxWidth: '512px',
                margin: '0 16px',
                zIndex: 1
              }}
            >
              <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* 头部 */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">简历下载验证</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label="关闭"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={question.id} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="text-base font-medium leading-tight pt-0.5">
                          {question.text}
                        </h3>
                      </div>
                      <div className="pl-8 space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              answers[question.id] === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.value}
                              checked={answers[question.id] === option.value}
                              onChange={() => handleAnswerChange(question.id, option.value)}
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                answers[question.id] === option.value
                                  ? 'border-primary'
                                  : 'border-muted-foreground/30'
                              }`}
                            >
                              {answers[question.id] === option.value && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 底部按钮 */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        验证中
                      </span>
                    ) : (
                      '提交'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 错误提示弹窗 */}
      <ErrorAlertModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={handleErrorModalClose}
      />
    </>
  )

  if (!mounted) return null

  return createPortal(modalContent, document.body)
}
