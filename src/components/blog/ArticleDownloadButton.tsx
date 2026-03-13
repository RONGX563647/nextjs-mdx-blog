'use client'

import React from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArticleDownloadButtonProps {
  category: string
  slug: string
  title: string
}

/**
 * 文章下载按钮组件
 * 用于在文章列表中提供下载功能
 * 
 * @param props 组件属性
 */
export function ArticleDownloadButton({ category, slug, title }: ArticleDownloadButtonProps) {
  // 下载文章为Markdown文件
  const handleDownload = async () => {
    try {
      // 构建Markdown文件路径
      const filePath = `/md/${category}/${slug}.md`
      
      // 从public目录获取Markdown内容
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }
      
      const content = await response.text()
      
      // 创建Markdown内容
      const markdownContent = content
      
      // 创建Blob对象
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      
      // 创建下载链接
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-')}.md`
      document.body.appendChild(a)
      
      // 触发下载
      a.click()
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Error downloading article:', error)
      alert('下载文章失败，请稍后重试')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownload}
      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
      title="下载文章"
    >
      <Download size={16} />
    </Button>
  )
}
