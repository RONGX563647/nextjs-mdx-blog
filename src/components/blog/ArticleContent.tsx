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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import 'highlight.js/styles/github-dark.css'

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
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
                behavior: 'prepend',
                properties: {
                  className: ['anchor-link'],
                },
              },
            ],
          ]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
