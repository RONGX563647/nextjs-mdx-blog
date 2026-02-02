'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface CommentSectionProps {
  articleTitle: string
  articleSlug: string
}

export function CommentSection({ articleTitle, articleSlug }: CommentSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const commentRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      // 加载 giscus 脚本
      const script = document.createElement('script')
      script.src = 'https://giscus.app/client.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.setAttribute('data-repo', 'RONGX563647/nextjs-mdx-blog')
      script.setAttribute('data-repo-id', 'R_kgDOQ80jjw')
      script.setAttribute('data-category', 'General')
      script.setAttribute('data-category-id', 'DIC_kwDOQ80jj84C1v-M')
      script.setAttribute('data-mapping', 'pathname')
      script.setAttribute('data-strict', '0')
      script.setAttribute('data-reactions-enabled', '1')
      script.setAttribute('data-emit-metadata', '0')
      script.setAttribute('data-input-position', 'top')
      script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
      script.setAttribute('data-lang', 'zh-CN')
      script.setAttribute('data-loading', 'lazy')
      
      // 添加错误处理
      script.onError = () => {
        setHasError(true)
        setIsLoaded(true)
      }
      
      // 监听 giscus 错误事件
      const handleGiscusError = (event: MessageEvent) => {
        if (event.data && event.data.giscus && event.data.giscus.error) {
          setHasError(true)
        }
      }
      
      window.addEventListener('message', handleGiscusError)
      
      if (commentRef.current) {
        commentRef.current.appendChild(script)
        setIsLoaded(true)
      }

      // 清理函数
      return () => {
        if (commentRef.current && script) {
          commentRef.current.removeChild(script)
        }
        window.removeEventListener('message', handleGiscusError)
      }
    }
  }, [isLoaded, theme])

  useEffect(() => {
    // 主题变化时更新 giscus 主题
    if (isLoaded && !hasError && typeof window !== 'undefined' && window.giscus) {
      window.giscus?.setConfig({
        theme: theme === 'dark' ? 'dark' : 'light'
      })
    }
  }, [theme, isLoaded, hasError])

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">评论区</h2>
      
      {hasError ? (
        <div className="bg-muted rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-3">评论系统未初始化</h3>
          <p className="text-muted-foreground mb-4">
            评论功能需要在 GitHub 上安装 giscus App 并配置相关权限。
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            请按照以下步骤配置：
          </p>
          <ol className="text-left text-sm text-muted-foreground mb-6 space-y-2">
            <li>1. 访问 <a href="https://giscus.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">giscus.app</a></li>
            <li>2. 按照指示安装 giscus GitHub App 到您的仓库</li>
            <li>3. 配置评论分类和其他设置</li>
            <li>4. 复制生成的配置代码并更新本组件</li>
          </ol>
          <a 
            href="https://github.com/giscus/giscus/issues/new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            报告问题
          </a>
        </div>
      ) : (
        <>
          <div 
            ref={commentRef}
            className="giscus"
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>使用 GitHub 账号登录后即可发表评论，支持 Markdown 格式。</p>
          </div>
        </>
      )}
    </div>
  )
}
