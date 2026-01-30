import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getCategories, getArticle, getCategoryFromId } from '@/lib/blog'
import { notFound } from 'next/navigation'
import ArticlePageClient from '@/components/blog/ArticlePageClient'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  const params: { category: string; slug: string }[] = []
  
  for (const category of categories) {
    const { getArticles } = await import('@/lib/blog')
    const articles = await getArticles(category.id)
    
    for (const article of articles) {
      params.push({
        category: category.id,
        slug: article.slug,
      })
    }
  }
  
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params
  const decodedCategory = decodeURIComponent(category)
  const decodedSlug = decodeURIComponent(slug)
  const article = await getArticle(decodedCategory, decodedSlug)
  const categoryName = getCategoryFromId(decodedCategory)

  if (!article) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: `${article.title} - ${categoryName}`,
    description: article.description || `${article.title} - ${categoryName}专栏文章`,
    openGraph: {
      title: `${article.title} - ${categoryName}`,
      description: article.description || `${article.title} - ${categoryName}专栏文章`,
      url: `${WEBSITE_HOST_URL}/blog/${category}/${slug}`,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { category, slug } = await params
  const decodedCategory = decodeURIComponent(category)
  const decodedSlug = decodeURIComponent(slug)
  const article = await getArticle(decodedCategory, decodedSlug)
  const categoryName = getCategoryFromId(decodedCategory)

  if (!article) {
    notFound()
  }

  // 获取上一页和下一页文章
  const { getArticles } = await import('@/lib/blog')
  const articles = await getArticles(decodedCategory)
  const currentIndex = articles.findIndex(a => a.slug === decodedSlug)
  
  let prevArticle = null
  let nextArticle = null
  
  if (currentIndex > 0) {
    prevArticle = articles[currentIndex - 1]
  }
  
  if (currentIndex < articles.length - 1) {
    nextArticle = articles[currentIndex + 1]
  }

  return <ArticlePageClient 
    article={article} 
    categoryName={categoryName} 
    prevArticle={prevArticle ? { slug: prevArticle.slug, title: prevArticle.title, category: prevArticle.category } : undefined}
    nextArticle={nextArticle ? { slug: nextArticle.slug, title: nextArticle.title, category: nextArticle.category } : undefined}
    articles={articles}
    currentArticle={{ slug: decodedSlug, category: decodedCategory }}
  />
}
