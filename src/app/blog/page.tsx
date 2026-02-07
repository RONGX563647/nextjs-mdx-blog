import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getArticles } from '@/lib/blog'
import { BookOpen, ArrowRight, FileText } from 'lucide-react'
import { BlogSearch } from './BlogSearch'

// 导入客户端组件
import LastVisitedBarWrapper from '@/components/blog/LastVisitedBarWrapper'

const meta = {
  title: '博客专栏',
  description: '技术博客专栏，分享Java、前端、后端等技术知识',
  url: `${WEBSITE_HOST_URL}/blog`,
}

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.url,
  },
  twitter: {
    title: meta.title,
    description: meta.description,
  },
  alternates: {
    canonical: meta.url,
  },
}

interface Article {
  id: string
  title: string
  description?: string
  category: string
  categoryName: string
  content: string
}

export default async function BlogPage() {
  const categories = await getCategories()
  
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const articles = await getArticles(category.id)
      return {
        ...category,
        articleCount: articles.length,
        latestArticle: articles[0]?.title || '',
      }
    })
  )

  // 预加载所有文章数据
  const allArticles: Article[] = []
  for (const category of categories) {
    const articles = await getArticles(category.id)
    for (const article of articles) {
      allArticles.push({
        id: article.slug,
        title: article.title,
        description: article.description,
        category: category.id,
        categoryName: category.name,
        content: article.content
      })
    }
  }

  return (
    <div className="min-h-screen">
      {/* 上次浏览文章横条导航 - 使用动态导入避免hydration不匹配 */}
      <LastVisitedBarWrapper />
      
      <section className="py-24 relative overflow-hidden">
        {/* 背景图片 - 宽度与页面一致，长度等比例放大 */}
        <div className="absolute top-[-5px] left-0 right-0 pointer-events-none w-full" style={{ opacity: 0.8 }}>
          <img src="https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260207210813997.png" alt="背景" className="w-full h-auto" />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-1 bg-primary"></div>
                <p className="text-sm font-semibold tracking-widest uppercase text-primary">技术博客</p>
              </div>
              
              {/* 标题和搜索框 */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">技术博客专栏</h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">深入学习编程技术，从基础到进阶，记录学习过程中的思考与总结</p>
                </div>
                
                <div className="w-full md:w-64 lg:w-80">
                  <BlogSearch key="blog-search" articles={allArticles} />
                </div>
              </div>
            </div>

            {/* 分类卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithCount.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/${category.id}`}
                  className="group block p-8 border border-border hover:border-primary transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{category.name}</h2>
                  
                  <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">{category.description || '探索相关知识体系，掌握核心技能'}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{category.articleCount} 篇文章</span>
                    </div>
                    {category.latestArticle && (
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">最新: {category.latestArticle}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {categoriesWithCount.length === 0 && (
              <div className="text-center py-24">
                <BookOpen className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
                <p className="text-muted-foreground text-xl">暂无专栏内容</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

