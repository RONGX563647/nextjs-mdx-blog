'use client'

/**
 * 上次浏览文章的类型定义
 */
export interface LastVisitedArticle {
  category: string
  slug: string
  title: string
  sectionId?: string
  sectionTitle?: string
  timestamp: number
}

/**
 * 存储键名
 */
const STORAGE_KEY = 'lastVisitedArticle'

/**
 * 存储上次浏览的文章信息
 * @param article 文章信息
 */
export function storeLastVisitedArticle(article: Omit<LastVisitedArticle, 'timestamp'>) {
  try {
    // 只在客户端访问localStorage
    if (typeof window === 'undefined') {
      return
    }
    const lastVisited: LastVisitedArticle = {
      ...article,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lastVisited))
  } catch (error) {
    console.error('Failed to store last visited article:', error)
  }
}

/**
 * 获取上次浏览的文章信息
 * @returns 上次浏览的文章信息，或null
 */
export function getLastVisitedArticle(): LastVisitedArticle | null {
  try {
    // 只在客户端访问localStorage
    if (typeof window === 'undefined') {
      return null
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch (error) {
    console.error('Failed to get last visited article:', error)
    return null
  }
}

/**
 * 检查是否在客户端环境
 * @returns 是否在客户端环境
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 清除上次浏览的文章信息
 */
export function clearLastVisitedArticle() {
  try {
    // 只在客户端访问localStorage
    if (typeof window === 'undefined') {
      return
    }
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear last visited article:', error)
  }
}
