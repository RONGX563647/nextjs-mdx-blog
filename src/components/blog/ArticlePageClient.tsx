'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, BookOpen, Menu, X, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import 'highlight.js/styles/github-dark.css'
import { CollapsibleToc } from './CollapsibleToc'

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

interface Heading {
  id: string
  text: string
  level: number
}

export default function ArticlePageClient({ article, categoryName, prevArticle, nextArticle, articles, currentArticle }: ArticlePageProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTocCollapsed, setIsTocCollapsed] = useState(false)

  useEffect(() => {
    const extractHeadings = () => {
      const extractedHeadings: Heading[] = []
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      headingElements.forEach((element) => {
        const id = element.getAttribute('id')
        const text = element.textContent || ''
        const level = parseInt(element.tagName.substring(1))
        
        if (id) {
          extractedHeadings.push({ id, text, level })
        }
      })
      
      setHeadings(extractedHeadings)
    }

    extractHeadings()

    const observer = new MutationObserver(() => {
      extractHeadings()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [article.content])

  useEffect(() => {
    const checkTocCollapsed = () => {
      if (typeof window !== 'undefined') {
        const isCollapsed = localStorage.getItem('blog-toc-collapsed') === 'true'
        setIsTocCollapsed(isCollapsed)
      }
    }

    checkTocCollapsed()

    const handleStorageChange = () => {
      checkTocCollapsed()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let currentId = ''
      
      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 100) {
          currentId = element.getAttribute('id') || ''
        }
      })
      
      setActiveId(currentId)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      />

      <article className={`py-8 transition-all duration-500 ease-in-out ${isTocCollapsed ? 'lg:ml-[35px]' : 'lg:ml-[calc(26.66%+15px)]'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Link
              href={`/blog/${article.category}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回 {categoryName}
            </Link>

            <header className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href={`/blog/${article.category}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  {categoryName}
                </Link>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>博主</span>
                </div>
                
                {article.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{article.date}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <span>大约 24 分钟</span>
                </div>
              </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[
                    rehypeHighlight,
                    rehypeSlug,
                    [
                      rehypeAutolinkHeadings,
                      {
                        behavior: 'wrap',
                        properties: {
                          className: ['anchor-link'],
                        },
                      },
                    ],
                  ]}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {prevArticle ? (
                  <Link 
                    href={`/blog/${article.category}/${prevArticle.slug}`}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">上一页</div>
                      <div className="font-medium">{prevArticle.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="w-1/2 opacity-0">
                    <div className="text-xs text-gray-500 dark:text-gray-500">上一页</div>
                    <div className="font-medium">无</div>
                  </div>
                )}
                
                {nextArticle ? (
                  <Link 
                    href={`/blog/${article.category}/${nextArticle.slug}`}
                    className="flex items-center justify-end gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-500">下一页</div>
                      <div className="font-medium">{nextArticle.title}</div>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="w-1/2 opacity-0">
                    <div className="text-xs text-gray-500 dark:text-gray-500">下一页</div>
                    <div className="font-medium">无</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
