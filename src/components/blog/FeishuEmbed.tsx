'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Maximize, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeishuEmbedProps {
  wikiUrl?: string
  title?: string
}

const DEFAULT_WIKI_URL = 'https://hcnkxl9trgx3.feishu.cn/wiki/space/7615823921648028636'

export function FeishuEmbed({
  wikiUrl = DEFAULT_WIKI_URL,
  title = '飞书知识库'
}: FeishuEmbedProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleOpenExternal = useCallback(() => {
    window.open(wikiUrl, '_blank', 'noopener,noreferrer')
  }, [wikiUrl])

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/30"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        飞书知识库
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
        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/30"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        飞书知识库
      </Button>

      {/* 知识库弹窗 */}
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

            {/* 知识库容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'relative',
                width: isFullscreen ? '100%' : '90%',
                height: isFullscreen ? '100%' : '80%',
                maxWidth: isFullscreen ? '100%' : '1400px',
                maxHeight: isFullscreen ? '100%' : '900px',
                zIndex: 1,
              }}
              className="bg-background rounded-xl overflow-hidden shadow-2xl"
            >
              {/* 头部工具栏 */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold truncate max-w-md">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* 外部链接按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenExternal}
                    className="hover:bg-muted"
                    title="在新窗口打开"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
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

              {/* 知识库内容区域 */}
              <div className="h-[calc(100%-64px)] bg-white">
                <iframe
                  src={wikiUrl}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  allow="clipboard-read; clipboard-write"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}