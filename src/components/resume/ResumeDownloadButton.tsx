'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ResumeDownloadModal } from './ResumeDownloadModal'
import { ErrorAlertModal, getErrorRecord, clearErrorRecord } from './ErrorAlertModal'

// localStorage key for success record
const SUCCESS_RECORD_KEY = 'resume_download_success_record'

// 记录成功到localStorage
function recordSuccessToStorage() {
  const record = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }
  localStorage.setItem(SUCCESS_RECORD_KEY, JSON.stringify(record))
}

// 获取成功记录
function getSuccessRecord() {
  const record = localStorage.getItem(SUCCESS_RECORD_KEY)
  return record ? JSON.parse(record) : null
}

// 清除成功记录
function clearSuccessRecord() {
  localStorage.removeItem(SUCCESS_RECORD_KEY)
}

export function ResumeDownloadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isErrorOpen, setIsErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownload = useCallback(() => {
    // 触发简历下载
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = '刘荣显-全栈开发工程师.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const handleButtonClick = useCallback(() => {
    // 检查是否有成功记录
    const successRecord = getSuccessRecord()
    if (successRecord) {
      // 之前验证成功过，直接下载
      handleDownload()
      return
    }

    // 检查是否有错误记录
    const errorRecord = getErrorRecord()
    if (errorRecord) {
      // 之前验证失败过，直接显示错误弹窗
      setErrorMessage('很抱歉，无法接受贵司')
      setIsErrorOpen(true)
      return
    }

    // 没有记录，打开验证弹窗
    setIsModalOpen(true)
  }, [handleDownload])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleSuccess = useCallback(() => {
    // 记录成功
    recordSuccessToStorage()
    // 清除错误记录（如果有）
    clearErrorRecord()
    // 执行下载
    handleDownload()
    // 关闭弹窗
    setIsModalOpen(false)
  }, [handleDownload])

  const handleError = useCallback((answers: Record<number, string>) => {
    // 记录错误
    const record = {
      timestamp: new Date().toISOString(),
      answers,
      userAgent: navigator.userAgent,
    }
    localStorage.setItem('resume_download_error_record', JSON.stringify(record))
    
    // 显示错误弹窗
    setErrorMessage('很抱歉，无法接受贵司')
    setIsErrorOpen(true)
    // 关闭验证弹窗
    setIsModalOpen(false)
  }, [])

  const handleErrorClose = useCallback(() => {
    setIsErrorOpen(false)
  }, [])

  // 防止body滚动
  useEffect(() => {
    if (isErrorOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isErrorOpen])

  if (!mounted) {
    return (
      <Button 
        variant="secondary" 
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border-blue-600/30"
      >
        <span className="flex items-center gap-2">
          <Download size={18} />
          下载简历
        </span>
      </Button>
    )
  }

  return (
    <>
      <Button 
        variant="secondary" 
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border-blue-600/30"
        onClick={handleButtonClick}
      >
        <span className="flex items-center gap-2">
          <Download size={18} />
          下载简历
        </span>
      </Button>
      
      <ResumeDownloadModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <ErrorAlertModal
        isOpen={isErrorOpen}
        message={errorMessage}
        onClose={handleErrorClose}
      />
    </>
  )
}
