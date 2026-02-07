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
import { Calendar, BookOpen, User, Download } from 'lucide-react'

interface ArticleHeaderProps {
  title: string
  category: string
  categoryName: string
  date?: string
  content?: string
}

export function ArticleHeader({ title, category, categoryName, date, content }: ArticleHeaderProps) {
  // 计算阅读时间
  const calculateReadingTime = (text?: string) => {
    if (!text) return 1 // 默认1分钟
    
    // 中文平均阅读速度：每分钟300个汉字
    // 英文平均阅读速度：每分钟200个单词
    
    // 计算中文字符数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    
    // 计算英文字符数（排除空格和标点）
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length
    
    // 计算单词数（假设平均每个单词5个字母）
    const englishWords = Math.ceil(englishChars / 5)
    
    // 计算总阅读时间（分钟）
    const chineseTime = chineseChars / 300
    const englishTime = englishWords / 200
    const totalTime = chineseTime + englishTime
    
    return Math.max(1, Math.ceil(totalTime)) // 最少1分钟
  }

  // 下载文章为Markdown文件
  const handleDownload = () => {
    if (!content) return

    // 创建Markdown内容
    const markdownContent = `# ${title}

${date ? `**日期:** ${date}

` : ''}${content}`

    // 创建Blob对象
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)

    // 创建下载链接
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-')}.md`
    document.body.appendChild(a)

    // 触发下载
    a.click()

    // 清理
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  // 计算阅读时间
  const readingTime = calculateReadingTime(content)

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Link
          href={`/blog/${category}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          {categoryName}
        </Link>
        <button
          onClick={handleDownload}
          disabled={!content}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-3 w-3" />
          下载文章
        </button>
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
          <BookOpen className="h-4 w-4" />
          <span>大约 {readingTime} 分钟</span>
        </div>
      </div>
    </header>
  )
}
