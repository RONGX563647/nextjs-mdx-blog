/**
 * 文章内容组件
 * 
 * 功能：
 * - 渲染 Markdown 内容
 * - 支持代码高亮
 * - 支持标题自动链接
 * - 响应式布局
 * 
 * @param content Markdown 内容字符串
 */
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { Copy, Check } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface ArticleContentProps {
  content: string
}

// 自定义代码块组件，添加复制功能
function CodeBlock({ node, inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  
  // 检查是否是代码块（不是内联代码）
  if (!inline && className && className.includes('language-')) {
    // 提取代码内容
    const codeContent = children[0] || ''
    
    // 复制代码到剪贴板
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(codeContent)
        setCopied(true)
        // 2秒后重置复制状态
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy code:', err)
      }
    }
    
    return (
      <div className="relative">
        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        {/* 原始代码块 */}
        <pre className={className} {...props}>
          <code className={className}>
            {children}
          </code>
        </pre>
      </div>
    )
  }
  
  // 对于内联代码或其他情况，使用默认渲染
  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="p-4">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeHighlight,
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'prepend',
                properties: {
                  className: ['anchor-link'],
                },
              },
            ],
          ]}
          components={{
            code: CodeBlock
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
