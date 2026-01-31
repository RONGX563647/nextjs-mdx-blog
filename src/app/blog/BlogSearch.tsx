'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description?: string
  category: string
  categoryName: string
  content: string
}

interface BlogSearchProps {
  articles: Article[]
}

export function BlogSearch({ articles }: BlogSearchProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 搜索功能
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }
    
    const keyword = searchKeyword.toLowerCase()
    const results = articles.filter(article => {
      return (
        article.title.toLowerCase().includes(keyword) ||
        article.content.toLowerCase().includes(keyword)
      )
    })
    
    setSearchResults(results)
  }, [searchKeyword, articles])

  // 清除搜索
  const clearSearch = () => {
    setSearchKeyword('')
    setSearchResults([])
  }

  return (
    <div className="relative">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索文章..."
          className="w-full p-3 pl-10 pr-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        {searchKeyword && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* 搜索结果数量 */}
      {searchResults.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          找到 {searchResults.length} 篇相关文章
        </p>
      )}
      
      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 border border-border rounded-lg p-4 max-h-96 overflow-y-auto bg-background/90 backdrop-blur-sm shadow-lg">
          {searchResults.map((article) => (
            <Link
              key={`${article.category}-${article.id}`}
              href={`/blog/${article.category}/${article.id}`}
              className="block p-3 hover:bg-muted/50 rounded-md transition-colors mb-2"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {article.categoryName}
                </span>
              </div>
              {article.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {article.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
      
      {/* 加载状态 */}
      {articles.length === 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          加载中...
        </div>
      )}
    </div>
  )
}
