'use client'

import { useState, useEffect } from 'react'
import { List, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react'

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

export function CollapsibleToc({ headings, activeId, onHeadingClick, articles, currentArticle, onArticleClick, onCollapseChange }: CollapsibleTocProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isSectionExpanded, setIsSectionExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedCollapsed = localStorage.getItem(TOC_STORAGE_KEY)
    const savedSectionExpanded = localStorage.getItem(SECTION_STORAGE_KEY)
    
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true')
    }
    
    if (savedSectionExpanded !== null) {
      setIsSectionExpanded(savedSectionExpanded === 'true')
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOC_STORAGE_KEY, String(newState))
    }
    onCollapseChange?.(newState)
  }

  const toggleSection = () => {
    const newState = !isSectionExpanded
    setIsSectionExpanded(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SECTION_STORAGE_KEY, String(newState))
    }
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-500 ease-in-out ${
        isCollapsed ? 'lg:w-[35px] lg:opacity-100' : 'lg:w-[320px] lg:opacity-100'
      } w-full`}
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
                      title={isSectionExpanded ? "收起" : "展开"}
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${isSectionExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {isSectionExpanded && articles && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <nav className="space-y-1">
                      {articles.map((article) => (
                        <button
                          key={article.slug}
                          onClick={() => onArticleClick?.(article.slug)}
                          className={`block w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                            currentArticle?.slug === article.slug && currentArticle?.category === article.category
                              ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{article.title}</span>
                          </div>
                        </button>
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
                      {headings.map((heading) => (
                        <button
                          key={heading.id}
                          onClick={() => onHeadingClick(heading.id)}
                          className={`block w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                            activeId === heading.id
                              ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
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
