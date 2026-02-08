'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Maximize, ChevronLeft, ChevronRight, X, MonitorPlay } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BilibiliPlayerProps {
  bvid: string
  title?: string
}

// 视频列表配置 - 可以根据需要扩展
const videoList = [
  { cid: '1', title: 'Java入门-01-Java学习介绍' },
  { cid: '2', title: 'Java入门-02-人机交互-图形化界面的小故事' },
  { cid: '3', title: 'Java入门-03-打开CMD' },
  { cid: '4', title: 'Java入门-04-常见的CMD命令' },
  { cid: '5', title: 'Java入门-05-练习-利用CMD打开QQ并配置环境变量' },
  { cid: '6', title: 'Java入门-06-Java概述和学习方法' },
  { cid: '7', title: 'Java入门-07-Java学习-JDK下载和安装' },
  { cid: '8', title: 'Java入门-08-Java学习-HelloWorld小案例' },
  { cid: '9', title: 'Java入门-09-Java学习-常见小问题' },
  { cid: '10', title: 'Java入门-10-Java学习-环境变量' },
]

export function BilibiliPlayer({ bvid, title = '黑马程序员Java零基础视频教程' }: BilibiliPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 计算当前页的视频
  const videosPerPage = 5
  const totalPages = Math.ceil(videoList.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const currentVideos = videoList.slice(startIndex, startIndex + videosPerPage)

  // 生成B站嵌入URL
  const embedUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&page=${currentPage}&high_quality=1&danmaku=0`

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIsFullscreen(false)
  }, [])

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }, [totalPages])

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border-pink-500/30"
      >
        <MonitorPlay className="h-4 w-4 mr-2" />
        视频教程
      </Button>
    )
  }

  return (
    <>
      {/* 触发按钮 */}
      <Button
        onClick={handleOpen}
        variant="secondary"
        size="sm"
        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border-pink-500/30"
      >
        <MonitorPlay className="h-4 w-4 mr-2" />
        视频教程
      </Button>

      {/* 视频播放器弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}
              onClick={handleClose}
            />

            {/* 播放器容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'relative',
                width: isFullscreen ? '100%' : '90%',
                height: isFullscreen ? '100%' : '80%',
                maxWidth: isFullscreen ? '100%' : '1200px',
                maxHeight: isFullscreen ? '100%' : '800px',
                zIndex: 1,
              }}
              className="bg-background rounded-xl overflow-hidden shadow-2xl"
            >
              {/* 头部工具栏 */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  <MonitorPlay className="h-5 w-5 text-pink-500" />
                  <h3 className="text-lg font-semibold truncate max-w-md">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* 全屏按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="hover:bg-muted"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                  {/* 关闭按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 视频播放区域 */}
              <div className="flex flex-col lg:flex-row h-[calc(100%-72px)]">
                {/* 主播放器 */}
                <div className="flex-1 relative bg-black">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ border: 'none' }}
                  />
                </div>

                {/* 侧边栏 - 视频列表 */}
                {!isFullscreen && (
                  <div className="w-full lg:w-80 border-l border-border bg-muted/30 flex flex-col">
                    {/* 分页控制 */}
                    <div className="flex items-center justify-between p-3 border-b border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {currentPage}/{totalPages} 页
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* 视频列表 */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {currentVideos.map((video, index) => (
                        <button
                          key={video.cid}
                          onClick={() => setCurrentPage(Math.ceil((startIndex + index + 1) / videosPerPage))}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            currentPage === Math.ceil((startIndex + index + 1) / videosPerPage)
                              ? 'bg-pink-500/10 text-pink-600'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {startIndex + index + 1}
                            </span>
                            <span className="text-sm line-clamp-2">{video.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 底部播放控制栏 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一集
                  </Button>
                  <span className="text-white text-sm">
                    第 {currentPage} 集 / 共 {videoList.length} 集
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="text-white hover:bg-white/20"
                  >
                    下一集
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
