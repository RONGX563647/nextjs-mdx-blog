import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, BookOpen } from 'lucide-react'
import { getCategories, getArticles, getCategoryFromId } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { ArticleDownloadButton } from '@/components/blog/ArticleDownloadButton'
import { ArticleCoverImage } from '@/components/blog/ArticleCoverImage'
import { EnhancedBilibiliPlayer } from '@/components/video/EnhancedBilibiliPlayer'

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
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

// 专栏视频配置
const categoryVideos: Record<string, { bvid: string; title: string }> = {
  '引气・Java 气海初拓': {
    bvid: 'BV17F411T7Ao',
    title: '黑马程序员Java零基础视频教程',
  },
  '筑基・Web 道途启关': {
    bvid: 'BV1yGydYEE3H',
    title: 'AI+JavaWeb开发入门，Tlias教学管理系统项目实战',
  },
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const { page = '1' } = await searchParams
  const decodedCategory = decodeURIComponent(category)
  const categories = await getCategories()
  const currentCategory = categories.find((c) => c.id === decodedCategory)
  
  if (!currentCategory) {
    notFound()
  }

  const articles = await getArticles(decodedCategory)
  const categoryName = getCategoryFromId(decodedCategory)

  // 分页配置
  const itemsPerPage = 5
  const currentPage = parseInt(page, 10) || 1
  const totalItems = articles.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 计算当前页显示的文章
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = articles.slice(startIndex, endIndex)

  // 获取当前专栏的视频配置
  const videoConfig = categoryVideos[decodedCategory]

  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回专栏列表
            </Link>

            <div className="mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {categoryName}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      共 {articles.length} 篇文章
                    </p>
                  </div>
                </div>
                {/* 视频教程按钮 */}
                {videoConfig && (
                  <div className="hidden sm:block">
                    <EnhancedBilibiliPlayer 
                      bvid={videoConfig.bvid} 
                      title={videoConfig.title}
                      totalEpisodes={200}
                    />
                  </div>
                )}
              </div>
              {currentCategory.description && (
                <p className="text-muted-foreground mt-4">
                  {currentCategory.description}
                </p>
              )}
              {/* 移动端视频按钮 */}
              {videoConfig && (
                <div className="sm:hidden mt-4">
                  <EnhancedBilibiliPlayer 
                    bvid={videoConfig.bvid} 
                    title={videoConfig.title}
                    totalEpisodes={200}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {paginatedArticles.map((article) => (
                <div 
                  key={article.slug}
                  className="p-6 bg-background border border-border rounded shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary group"
                >
                  <div className="flex items-start gap-4">
                    {/* 文章封面图片 - 使用文章中的第一个图片链接 */}
                    {(() => {
                      // 从文章内容中提取第一个图片链接
                      const imgRegex = /!\[.*?\]\((.*?)\)/g
                      const imgMatch = imgRegex.exec(article.content)
                      const imgSrc = imgMatch ? imgMatch[1] : undefined
                      
                      return (
                        <ArticleCoverImage 
                          src={imgSrc} 
                          alt={article.title} 
                        />
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${category}/${article.slug}`}
                        className="block"
                      >
                        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        {article.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          {article.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{article.date}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                              {categoryName}
                            </span>
                          </div>
                        </div>

                        {/* 知识点栏 */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              // 从文章标题和内容中提取具体知识点
                              const knowledgePoints = []
                               
                              // 基于标题和内容的具体知识点提取
                              if (article.title.includes('Java重生之旅')) {
                                knowledgePoints.push('环境配置', 'JDK选择', '环境变量', '类型转换', '精度丢失', '流程控制', '嵌套地狱', '工程思维')
                              } else if (article.title.includes('Java知识树')) {
                                knowledgePoints.push('Java体系', '知识架构', '学习路线', '技能图谱', '核心概念', '进阶路径', '技术栈', '职业发展')
                              } else if (article.title.includes('Swing') && article.title.includes('聊天室')) {
                                knowledgePoints.push('Java GUI', 'Swing', '网络编程', 'Socket', '多线程', '事件处理', '界面设计', '客户端通信')
                              } else if (article.title.includes('银行管理系统')) {
                                knowledgePoints.push('Java项目', '银行系统', '业务逻辑', '数据库设计', '事务处理', '安全认证', '账户管理', '交易流程')
                              } else if (article.title.includes('MyBatis')) {
                                knowledgePoints.push('ORM框架', 'MyBatis', 'SQL映射', '数据库操作', '代码生成', '性能优化', '动态SQL', '结果映射')
                              } else if (article.title.includes('Spring')) {
                                knowledgePoints.push('Spring框架', 'IOC容器', '依赖注入', 'AOP切面', '事务管理', '配置方式', '组件扫描', '生命周期')
                              } else if (article.title.includes('Web') || article.title.includes('项目')) {
                                knowledgePoints.push('Web开发', '项目实战', '前后端交互', '部署上线', '生产环境', '性能优化', '用户体验', '系统架构')
                              } else {
                                // 为其他文章添加通用知识点
                                knowledgePoints.push('Java编程', '技术学习', '开发实践', '代码优化', '最佳实践', '问题排查', '性能调优', '架构设计')
                              }
                               
                              return knowledgePoints.map((point, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  {point}
                                </span>
                              ))
                            })()}
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <ArticleDownloadButton 
                        category={article.category} 
                        slug={article.slug} 
                        title={article.title} 
                      />
                      <Link
                        href={`/blog/${category}/${article.slug}`}
                        className="flex items-center justify-center p-1 rounded-full hover:bg-primary/10 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary rotate-180 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  该专栏暂无文章
                </p>
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  {/* 上一页按钮 */}
                  <Link
                    href={`/blog/${category}?page=${Math.max(1, currentPage - 1)}`}
                    className={`flex items-center justify-center px-3 py-1 rounded-md border transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground' : 'border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                    aria-disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>

                  {/* 页码按钮 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/blog/${category}?page=${pageNum}`}
                      className={`px-3 py-1 rounded-md transition-colors ${currentPage === pageNum ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                    >
                      {pageNum}
                    </Link>
                  ))}

                  {/* 下一页按钮 */}
                  <Link
                    href={`/blog/${category}?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={`flex items-center justify-center px-3 py-1 rounded-md border transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground' : 'border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                    aria-disabled={currentPage === totalPages}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </nav>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
