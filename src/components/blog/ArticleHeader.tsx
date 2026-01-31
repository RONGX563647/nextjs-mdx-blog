/**
 * 文章头部组件
 * 
 * 功能：
 * - 显示文章标题和元数据
 * - 显示返回链接和分类标签
 * - 响应式布局支持
 * 
 * @param props 组件属性
 */
import Link from 'next/link'
import { Calendar, BookOpen, User } from 'lucide-react'

interface ArticleHeaderProps {
  title: string
  category: string
  categoryName: string
  date?: string
}

export function ArticleHeader({ title, category, categoryName, date }: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Link
          href={`/blog/${category}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          {categoryName}
        </Link>
      </div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
        {title}
      </h1>
      
      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>博主</span>
        </div>
        
        {date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span>大约 24 分钟</span>
        </div>
      </div>
    </header>
  )
}
