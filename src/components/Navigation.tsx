/**
 * 导航栏组件
 * 展示网站的主要导航链接，包括首页、关于、项目、博客和简历下载
 * 支持当前页面的高亮显示
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和工具
import Link from 'next/link' // Next.js链接组件
import { Download, Menu, X } from 'lucide-react' // 下载图标、菜单图标和关闭图标
import { Button } from '@/components/ui/button' // 按钮组件
import { usePathname } from 'next/navigation' // 获取当前路径的钩子
import { useState, useEffect, useCallback } from 'react' // React状态管理
import { ResumeDownloadModal } from '@/components/resume/ResumeDownloadModal' // 简历下载验证模态框
import { ErrorAlertModal, getErrorRecord, clearErrorRecord } from '@/components/resume/ErrorAlertModal' // 错误弹窗

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

/**
 * 导航栏组件
 * @returns 导航栏内容
 */
export function Navigation() {
  // 获取当前路径，用于判断哪个导航链接是活动状态
  const pathname = usePathname()
  // 移动端菜单状态管理
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // 简历下载模态框状态
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  // 错误弹窗状态
  const [isErrorOpen, setIsErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 处理简历下载
  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = '刘荣显-全栈开发工程师.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // 点击简历按钮
  const handleResumeClick = useCallback(() => {
    // 关闭移动端菜单
    setMobileMenuOpen(false)

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
    setIsResumeModalOpen(true)
  }, [handleDownload])

  // 验证成功
  const handleSuccess = useCallback(() => {
    // 记录成功
    recordSuccessToStorage()
    // 清除错误记录（如果有）
    clearErrorRecord()
    // 执行下载
    handleDownload()
    // 关闭弹窗
    setIsResumeModalOpen(false)
  }, [handleDownload])

  // 验证失败
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
    setIsResumeModalOpen(false)
  }, [])

  // 关闭错误弹窗
  const handleErrorClose = useCallback(() => {
    setIsErrorOpen(false)
  }, [])

  // 关闭验证弹窗
  const handleModalClose = useCallback(() => {
    setIsResumeModalOpen(false)
  }, [])

  return (
    <>
      {/* 桌面端导航栏 */}
      <nav className="hidden md:flex items-center gap-2 text-base">
        <Link 
          href="/" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          首页
        </Link>
        <Link 
          href="/about" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/about' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          关于
        </Link>
        <Link 
          href="/portfolio" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/portfolio' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          项目
        </Link>
        <Link 
          href="/blog" 
          className={`px-4 py-2 transition-all duration-300 ${pathname === '/blog' ? 'text-primary font-bold' : 'hover:text-primary'}`}
        >
          博客
        </Link>
        <button 
          onClick={handleResumeClick}
          className="px-4 py-2 hover:text-primary transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          简历
        </button>
      </nav>
      
      {/* 移动端菜单按钮 */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
      
      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border z-50">
          <div className="flex flex-col p-4 gap-2">
            <Link 
              href="/" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/about' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              关于
            </Link>
            <Link 
              href="/portfolio" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/portfolio' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              项目
            </Link>
            <Link 
              href="/blog" 
              className={`px-4 py-3 transition-all duration-300 ${pathname === '/blog' ? 'text-primary font-bold' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              博客
            </Link>
            <button 
              onClick={handleResumeClick}
              className="px-4 py-3 hover:text-primary transition-colors flex items-center gap-2 text-left"
            >
              <Download size={20} />
              简历
            </button>
          </div>
        </div>
      )}

      {/* 简历下载验证模态框 */}
      {mounted && (
        <ResumeDownloadModal 
          isOpen={isResumeModalOpen} 
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {/* 错误提示弹窗 */}
      {mounted && (
        <ErrorAlertModal
          isOpen={isErrorOpen}
          message={errorMessage}
          onClose={handleErrorClose}
        />
      )}
    </>
  )
}
