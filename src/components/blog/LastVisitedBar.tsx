'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { getLastVisitedArticle } from '@/utils/lastVisited'

interface LastVisitedBarProps {
  className?: string
}

export function LastVisitedBar({ className = '' }: LastVisitedBarProps) {
  const [lastVisited, setLastVisited] = useState<ReturnType<typeof getLastVisitedArticle>>(null)
  const [mounted, setMounted] = useState(false)

  // 只在客户端初始化数据
  useEffect(() => {
    setLastVisited(getLastVisitedArticle())
    setMounted(true)
  }, [])

  // 监听localStorage变化，更新上次浏览记录
  useEffect(() => {
    const handleStorageChange = () => {
      setLastVisited(getLastVisitedArticle())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 如果没有数据或还未挂载，返回与有数据时相同结构的占位符
  if (!mounted || !lastVisited) {
    return (
      <div className={`bg-muted/50 border-b border-border py-3 px-4 transition-all duration-300 ${className}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1 opacity-0">上次浏览</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate opacity-0">占位符</span>
              </div>
            </div>
            <span className="text-sm flex items-center gap-1 opacity-0">
              继续阅读
              <ArrowLeft className="h-3 w-3 rotate-180" />
            </span>
          </div>
        </div>
      </div>
    )
  }

  const url = lastVisited.sectionId 
    ? `/blog/${lastVisited.category}/${lastVisited.slug}#${lastVisited.sectionId}`
    : `/blog/${lastVisited.category}/${lastVisited.slug}`

  return (
    <div className={`bg-muted/50 border-b border-border py-3 px-4 transition-all duration-300 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">上次浏览</p>
            <div className="flex items-center gap-2">
              <Link 
                href={url} 
                className="text-sm font-medium hover:text-primary transition-colors truncate"
                title={lastVisited.title}
              >
                {lastVisited.title}
              </Link>
              {lastVisited.sectionTitle && (
                <span className="text-xs text-muted-foreground truncate">
                  - {lastVisited.sectionTitle}
                </span>
              )}
            </div>
          </div>
          <Link 
            href={url} 
            className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
          >
            继续阅读
            <ArrowLeft className="h-3 w-3 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}
