/**
 * 文章页面客户端组件
 * 
 * 功能：
 * - 渲染完整的文章页面
 * - 包含目录、头部、内容、导航
 * - 响应式布局支持
 * - 使用自定义 Hooks 管理状态
 * 
 * @param props 组件属性
 */
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CollapsibleToc } from './CollapsibleToc'
import { ArticleHeader } from './ArticleHeader'
import { ArticleContent } from './ArticleContent'
import { ArticleNavigation } from './ArticleNavigation'
import { useArticleHeadings, useActiveHeading } from '@/hooks/useArticle'
import { useTocCollapsed } from '@/hooks/useToc'

interface ArticlePageProps {
  article: {
    slug: string
    title: string
    description?: string
    date?: string
    category: string
    content: string
  }
  categoryName: string
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
  articles?: {
    slug: string
    title: string
    category: string
  }[]
  currentArticle?: {
    slug: string
    category: string
  }
}

export default function ArticlePageClient({ 
  article, 
  categoryName, 
  prevArticle, 
  nextArticle, 
  articles, 
  currentArticle 
}: ArticlePageProps) {
  const headings = useArticleHeadings()
  const activeId = useActiveHeading()
  const { isCollapsed, toggleCollapse } = useTocCollapsed()

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  const handleArticleClick = (slug: string) => {
    window.location.href = `/blog/${article.category}/${slug}`
  }

  return (
    <div className="min-h-screen">
      <CollapsibleToc 
        headings={headings}
        activeId={activeId}
        onHeadingClick={scrollToHeading}
        articles={articles}
        currentArticle={currentArticle}
        onArticleClick={handleArticleClick}
        onCollapseChange={toggleCollapse}
      />

      <article className={`py-8 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[35px]' : 'lg:ml-[calc(26.66%+15px)]'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/blog/${article.category}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回 {categoryName}
            </Link>

            <ArticleHeader 
              title={article.title}
              category={article.category}
              categoryName={categoryName}
              date={article.date}
            />

            <ArticleContent content={article.content} />

            <ArticleNavigation 
              prevArticle={prevArticle}
              nextArticle={nextArticle}
              category={article.category}
            />
          </div>
        </div>
      </article>
    </div>
  )
}
