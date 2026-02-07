/**
 * 可折叠目录组件
 * 
 * 功能：
 * - 显示文章目录（标题列表）
 * - 显示专栏文章列表
 * - 支持折叠/展开功能
 * - 响应式布局（桌面端显示，移动端隐藏）
 * - 高亮当前活动标题
 * 
 * @param props 组件属性
 */
'use client'

import { useState, useEffect } from 'react'
import { List, ChevronLeft, ChevronRight, BookOpen, FileText, Download } from 'lucide-react'
import { useTocCollapsed, useTocSectionExpanded } from '@/hooks/useToc'
import { getArticle } from '@/lib/blog'

interface Heading {
  id: string
  text: string
  level: number
}

interface Article {
  slug: string
  title: string
  category: string
}

interface CollapsibleTocProps {
  headings: Heading[]
  activeId: string
  onHeadingClick: (id: string) => void
  articles?: Article[]
  currentArticle?: {
    slug: string
    category: string
  }
  onArticleClick?: (slug: string) => void
  onCollapseChange?: (isCollapsed: boolean) => void
}

const TOC_STORAGE_KEY = 'blog-toc-collapsed'
const SECTION_STORAGE_KEY = 'blog-toc-section'

export function CollapsibleToc({ 
  headings, 
  activeId, 
  onHeadingClick, 
  articles, 
  currentArticle, 
  onArticleClick, 
  onCollapseChange 
}: CollapsibleTocProps) {
  const { isCollapsed, toggleCollapse } = useTocCollapsed(onCollapseChange)
  const { isExpanded, toggleSection } = useTocSectionExpanded()

  // 下载文章为Markdown文件
  const handleDownload = async (article: Article) => {
    try {
      // 构建Markdown文件路径
      const filePath = `/md/${article.category}/${article.slug}.md`
      
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
      a.download = `${article.title.replace(/[^a-zA-Z0-9]/g, '-')}.md`
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
    <aside 
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-500 ease-in-out hidden lg:flex ${
        isCollapsed ? 'lg:w-[35px] lg:opacity-100' : 'lg:w-[calc(26.66%+15px)] lg:opacity-100'
      }`}
      style={{
        paddingTop: '6rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="h-full flex">
        <div className="flex-1 overflow-y-auto" style={{ direction: 'rtl' }}>
          {isCollapsed ? (
            <button
              onClick={toggleCollapse}
              className="w-full h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="展开目录"
              style={{ direction: 'ltr' }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="w-[1px] h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </button>
          ) : (
            <div className="px-4" style={{ direction: 'ltr' }}>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">专栏文章</h3>
                    </div>
                    <button
                      onClick={toggleSection}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title={isExpanded ? "收起" : "展开"}
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {isExpanded && articles && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <nav className="space-y-1">
                      {articles.map((article) => (
                        <div 
                          key={article.slug}
                          className={`w-full px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                            currentArticle?.slug === article.slug && currentArticle?.category === article.category
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => onArticleClick?.(article.slug)}
                              className="flex-1 text-left flex items-center gap-2"
                            >
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{article.title}</span>
                            </button>
                            <button
                              onClick={() => handleDownload(article)}
                              className="p-1 rounded-full hover:bg-primary/20 text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                              title="下载文章"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </nav>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">此页内容</h3>
                  </div>
                  {headings.length > 0 ? (
                    <nav className="space-y-1">
                      {headings.map((heading, index) => (
                        <button
                          key={`${heading.id}-${index}`}
                          onClick={() => onHeadingClick(heading.id)}
                          className={`block w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                            activeId === heading.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-700'
                          }`}
                          style={{
                            paddingLeft: `${(heading.level - 1) * 1 + 0.5}rem`,
                          }}
                        >
                          {heading.text}
                        </button>
                      ))}
                    </nav>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      暂无目录
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleCollapse}
          className="w-[15px] h-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex-shrink-0"
          title={isCollapsed ? "展开目录" : "折叠目录"}
        />
      </div>
    </aside>
  )
}
