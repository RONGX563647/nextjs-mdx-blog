import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, FileText } from 'lucide-react'
import { getCategories, getArticles } from '@/lib/blog'

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

  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                技术博客专栏
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                深入学习编程技术，从基础到进阶，记录学习过程中的思考与总结
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoriesWithCount.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/${category.id}`}
                  className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {category.description || '探索相关知识体系，掌握核心技能'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{category.articleCount} 篇文章</span>
                    </div>
                    {category.latestArticle && (
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[150px]">最新: {category.latestArticle}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {categoriesWithCount.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  暂无专栏内容
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
