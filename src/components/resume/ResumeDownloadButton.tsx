'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ResumeDownloadModal } from './ResumeDownloadModal'

export function ResumeDownloadButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = () => {
    // 触发简历下载
    const link = document.createElement('a')
    link.href = '/resume.pdf' // 简历文件路径
    link.download = '刘荣显-全栈开发工程师.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Button 
        variant="secondary" 
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border-blue-600/30"
        onClick={() => setIsOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Download size={18} />
          下载简历
        </span>
      </Button>
      <ResumeDownloadModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onDownload={handleDownload}
      />
    </>
  )
}
