import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

const testMarkdown = `
# 测试标题1
这是测试标题1的内容。

## 测试标题2
这是测试标题2的内容。

### 测试标题3
这是测试标题3的内容。

#### 测试标题4
这是测试标题4的内容。

这是一个普通段落，包含 **粗体** 和 *斜体* 文本。
`

export default function MarkdownTest() {
  return (
    <div style={{
      border: '2px solid blue',
      padding: '2rem',
      margin: '2rem 0',
      backgroundColor: 'lightblue'
    }}>
      <h2 style={{
        color: 'blue',
        marginBottom: '1rem'
      }}>Markdown 渲染测试</h2>
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 style={{
              color: 'red',
              fontSize: '2rem',
              fontWeight: 'bold',
              border: '2px solid red',
              padding: '1rem',
              backgroundColor: 'yellow',
              margin: '1rem 0',
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              zIndex: 9999,
              position: 'relative'
            }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{
              color: 'blue',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '2px solid blue',
              padding: '1rem',
              backgroundColor: 'lightyellow',
              margin: '1rem 0',
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              zIndex: 9999,
              position: 'relative'
            }}>
              {children}
            </h2>
          )
        }}
      >
        {testMarkdown}
      </ReactMarkdown>
    </div>
  )
}
