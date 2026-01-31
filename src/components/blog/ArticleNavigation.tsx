/**
 * 文章导航组件（上一页/下一页）
 * 
 * 功能：
 * - 显示上一篇文章链接
 * - 显示下一篇文章链接
 * - 响应式布局支持
 * - 处理没有上一页/下一页的情况
 * 
 * @param props 组件属性
 */
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ArticleNavigationProps {
  prevArticle?: {
    slug: string
    title: string
    category: string
  }
  nextArticle?: {
    slug: string
    title: string
    category: string
  }
  category: string
}

export function ArticleNavigation({ prevArticle, nextArticle, category }: ArticleNavigationProps) {
  return (
    <div className="mt-8 bg-background border border-border rounded shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {prevArticle ? (
          <Link 
            href={`/blog/${category}/${prevArticle.slug}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-xs text-muted-foreground">上一页</div>
              <div className="font-medium">{prevArticle.title}</div>
            </div>
          </Link>
        ) : (
          <div className="w-full md:w-1/2 opacity-0">
            <div className="text-xs text-muted-foreground">上一页</div>
            <div className="font-medium">无</div>
          </div>
        )}
        
        {nextArticle ? (
          <Link 
            href={`/blog/${category}/${nextArticle.slug}`}
            className="flex items-center justify-end gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="text-right">
              <div className="text-xs text-muted-foreground">下一页</div>
              <div className="font-medium">{nextArticle.title}</div>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-full md:w-1/2 opacity-0">
            <div className="text-xs text-muted-foreground">下一页</div>
            <div className="font-medium">无</div>
          </div>
        )}
      </div>
    </div>
  )
}
