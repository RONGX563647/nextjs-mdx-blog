import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, BookOpen } from 'lucide-react'
import { getCategories, getArticles, getCategoryFromId } from '@/lib/blog'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    category: category.id,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const categories = await getCategories()
  const currentCategory = categories.find((c) => c.id === category)
  const categoryName = currentCategory ? currentCategory.name : getCategoryFromId(category)

  return {
    title: `${categoryName} - 博客专栏`,
    description: `${categoryName}专栏文章列表`,
    openGraph: {
      title: `${categoryName} - 博客专栏`,
      description: `${categoryName}专栏文章列表`,
      url: `${WEBSITE_HOST_URL}/blog/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const categories = await getCategories()
  const currentCategory = categories.find((c) => c.id === decodedCategory)
  
  if (!currentCategory) {
    notFound()
  }

  const articles = await getArticles(decodedCategory)
  const categoryName = getCategoryFromId(decodedCategory)

  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回专栏列表
            </Link>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {categoryName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    共 {articles.length} 篇文章
                  </p>
                </div>
              </div>
              {currentCategory.description && (
                <p className="text-gray-600 dark:text-gray-300 ml-12">
                  {currentCategory.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${category}/${article.slug}`}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                          {article.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {article.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{article.date}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                            {categoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-500 rotate-180 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  该专栏暂无文章
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
