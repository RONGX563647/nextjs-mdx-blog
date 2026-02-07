'use client'

import { FileText } from 'lucide-react'

interface ArticleCoverImageProps {
  src?: string
  alt: string
}

export function ArticleCoverImage({ src, alt }: ArticleCoverImageProps) {
  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted group-hover:bg-primary/10 transition-colors flex-shrink-0 flex items-center justify-center">
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // 图片加载失败时显示默认图标
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            // 创建一个div来显示文件图标
            const iconDiv = document.createElement('div')
            iconDiv.className = 'flex items-center justify-center h-full w-full'
            iconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground group-hover:text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
            target.parentElement?.appendChild(iconDiv)
          }}
        />
      ) : (
        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      )}
    </div>
  )
}
