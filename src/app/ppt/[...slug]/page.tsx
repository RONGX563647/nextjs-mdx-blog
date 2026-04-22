/**
 * PPT子目录页面
 * 展示指定子目录下的所有PPT文件
 */
'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { Folder, ArrowLeft, File, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface File {
  name: string
  type: string
  path: string
  size: number
}

interface Directory {
  name: string
  type: string
  path: string
}

interface PPTPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export default function PPTDetailPage({ params }: PPTPageProps) {
  const resolvedParams = use(params)
  const directoryPath = resolvedParams.slug.join('/')
  const directoryName = resolvedParams.slug[resolvedParams.slug.length - 1]

  const [files, setFiles] = useState<File[]>([])
  const [directories, setDirectories] = useState<Directory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/ppt?dir=${encodeURIComponent(directoryPath)}`)

        if (!response.ok) {
          throw new Error('获取文件列表失败')
        }

        const data = await response.json()
        setFiles(data.files || [])
        setDirectories(data.directories || [])
      } catch (err) {
        console.error('获取PPT文件失败:', err)
        setError('加载PPT文件失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [directoryPath])

  // 计算文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // 返回上一级
  const getParentPath = (): string => {
    const parts = resolvedParams.slug
    if (parts.length <= 1) {
      return '/ppt'
    }
    return `/ppt/${parts.slice(0, -1).join('/')}`
  }

  return (
    <Container>
      <div className="min-h-[60vh] py-12">
        {/* 面包屑导航 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              首页
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/ppt" className="text-muted-foreground hover:text-foreground transition-colors">
              PPT资源
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{directoryName}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={getParentPath()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">{directoryName}</h1>
          <p className="text-muted-foreground">PPT文件列表</p>
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
          ) : files.length === 0 && directories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <File className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>此目录下暂无文件</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 子目录列表 */}
              {directories.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">子目录</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {directories.map((dir) => (
                      <Link
                        key={dir.path}
                        href={`/ppt/${dir.path}`}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
                      >
                        <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-medium group-hover:text-primary transition-colors truncate">
                          {dir.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 文件列表 */}
              {files.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">文件</h2>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={file.path} download>
                            <Download className="h-4 w-4 mr-2" />
                            下载
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
