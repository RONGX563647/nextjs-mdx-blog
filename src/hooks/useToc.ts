/**
 * 自定义 Hook：用于管理目录折叠状态
 * 
 * 功能：
 * - 从 localStorage 读取保存的折叠状态
 * - 提供切换折叠状态的方法
 * - 将状态同步到 localStorage
 * 
 * @param onCollapseChange 状态变化回调函数
 * @returns 折叠状态和切换函数
 */
import { useState, useEffect } from 'react'

export function useTocCollapsed(onCollapseChange?: (isCollapsed: boolean) => void) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('blog-toc-collapsed')
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true')
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('blog-toc-collapsed', String(newState))
    }
    onCollapseChange?.(newState)
  }

  return { isCollapsed, toggleCollapse }
}

/**
 * 自定义 Hook：用于管理目录中的文章列表展开状态
 * 
 * 功能：
 * - 从 localStorage 读取保存的展开状态
 * - 提供切换展开状态的方法
 * - 将状态同步到 localStorage
 * 
 * @returns 展开状态和切换函数
 */
export function useTocSectionExpanded() {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const savedExpanded = localStorage.getItem('blog-toc-section')
    if (savedExpanded !== null) {
      setIsExpanded(savedExpanded === 'true')
    }
  }, [])

  const toggleSection = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('blog-toc-section', String(newState))
    }
  }

  return { isExpanded, toggleSection }
}
