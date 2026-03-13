import { useState, useEffect } from 'react'

/**
 * 自定义 Hook：用于提取文章中的标题
 * 
 * 功能：
 * - 从 DOM 中提取所有标题元素（h1-h6）
 * - 提取标题的 id、文本和级别
 * - 返回标题数组供目录使用
 * 
 * @returns 标题数组
 */
export function useArticleHeadings() {
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const extractHeadings = () => {
      const extractedHeadings: Heading[] = []
      
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      headingElements.forEach((element) => {
        const id = element.getAttribute('id')
        const text = element.textContent || ''
        const level = parseInt(element.tagName.substring(1))
        
        if (id) {
          extractedHeadings.push({ id, text, level })
        }
      })
      
      setHeadings(extractedHeadings)
    }

    extractHeadings()

    const observer = new MutationObserver(() => {
      extractHeadings()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return headings
}

/**
 * 自定义 Hook：用于监听滚动并高亮当前标题
 * 
 * 功能：
 * - 监听页面滚动事件
 * - 根据滚动位置确定当前可见的标题
 * - 更新活动标题 ID
 * 
 * @returns 当前活动标题的 ID
 */
export function useActiveHeading() {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let currentId = ''
      
      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 100) {
          currentId = element.getAttribute('id') || ''
        }
      })
      
      setActiveId(currentId)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return activeId
}

/**
 * 标题接口
 */
export interface Heading {
  id: string
  text: string
  level: number
}
