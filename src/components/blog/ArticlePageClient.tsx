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
  const [isTocCollapsed, setIsTocCollapsed] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedCollapsed = localStorage.getItem('blog-toc-collapsed')
    if (savedCollapsed !== null) {
      setIsTocCollapsed(savedCollapsed === 'true')
    }
  }, [])

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
    if (typeof window === 'undefined') return

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

  const handleCollapseChange = (isCollapsed: boolean) => {
    setIsTocCollapsed(isCollapsed)
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
        onCollapseChange={handleCollapseChange}
      />

      <article className={`py-8 transition-all duration-500 ease-in-out ${isTocCollapsed ? 'lg:ml-[35px]' : 'lg:ml-[calc(26.66%+15px)]'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/blog/${article.category}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回 {categoryName}
            </Link>

            <header className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href={`/blog/${article.category}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  {categoryName}
                </Link>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
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

            <div className="bg-background border border-border rounded shadow-sm p-6 md:p-8">
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

            <div className="mt-8 bg-background border border-border rounded shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {prevArticle ? (
                  <Link 
                    href={`/blog/${article.category}/${prevArticle.slug}`}
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
                    href={`/blog/${article.category}/${nextArticle.slug}`}
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
          </div>
        </div>
      </article>
    </div>
  )
}
