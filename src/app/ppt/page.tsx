/**
 * PPT目录列表页面
 * 展示 /public/ppt 下的所有子目录
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { Folder, ArrowLeft, File } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Directory {
  name: string
  path: string
}

interface File {
  name: string
  type: string
  path: string
  size: number
}

export default function PPTPage() {
  const [directories, setDirectories] = useState<Directory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/ppt')

        if (!response.ok) {
          throw new Error('获取目录列表失败')
        }

        const data = await response.json()
        setDirectories(data.directories || [])
      } catch (err) {
        console.error('获取PPT目录失败:', err)
        setError('加载PPT目录失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchDirectories()
  }, [])

  return (
    <Container>
      <div className="min-h-[60vh] py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              首页
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">PPT资源</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">PPT资源</h1>
          <p className="text-muted-foreground">浏览和下载PPT演示文稿</p>
        </div>

        {/* 内容区域 */}
        <div className="bg-card border border-border rounded-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                重试
              </Button>
            </div>
          ) : directories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>暂无PPT目录</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {directories.map((dir) => (
                <a
                  key={dir.path}
                  href={`/ppt/${dir.path}/index.html`}
                  className="block p-4 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <Folder className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors truncate">
                        {dir.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        点击打开PPT演示文稿
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
