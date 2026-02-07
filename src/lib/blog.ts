import fs from 'fs'
import path from 'path'

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Article {
  slug: string
  title: string
  description?: string
  date?: string
  category: string
  content: string
}

const MD_DIR = path.join(process.cwd(), 'public', 'md')

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await fs.promises.readdir(MD_DIR)
    
    // 修仙体系排序优先级
    const cultivationOrder = ['引气', '筑基', '金丹', '元婴', '化神', '合体']
    
    return categories
      .filter((item) => {
        const itemPath = path.join(MD_DIR, item)
        return fs.statSync(itemPath).isDirectory()
      })
      .map((folder) => {
        const match = folder.match(/^(\d+)\.(.+)$/)
        if (match) {
          return {
            id: folder,
            name: match[2],
          }
        }
        return {
          id: folder,
          name: folder,
        }
      })
      .sort((a, b) => {
        // 提取修仙等级
        const getCultivationLevel = (name: string) => {
          for (const level of cultivationOrder) {
            if (name.includes(level)) {
              return cultivationOrder.indexOf(level)
            }
          }
          return cultivationOrder.length // 不在排序中的放在最后
        }
        
        const levelA = getCultivationLevel(a.name)
        const levelB = getCultivationLevel(b.name)
        
        if (levelA !== levelB) {
          return levelA - levelB
        }
        
        // 同一等级内按名称排序
        return a.name.localeCompare(b.name)
      })
  } catch (error) {
    console.error('Error reading categories:', error)
    return []
  }
}

export async function getArticles(categoryId: string): Promise<Article[]> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const files = await fs.promises.readdir(categoryPath)
    
    const articles: Article[] = []
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(categoryPath, file)
        const content = await fs.promises.readFile(filePath, 'utf-8')
        
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const descMatch = content.match(/^>?\s*(.+)$/m)
        
        const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '')
        const description = descMatch ? descMatch[1].trim() : ''
        
        articles.push({
          slug: file.replace('.md', ''),
          title,
          description,
          category: categoryId,
          content,
        })
      }
    }
    
    return articles.sort((a, b) => {
      const numA = parseInt(a.title.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.title.match(/\d+/)?.[0] || '0')
      return numA - numB
    })
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

export async function getArticle(categoryId: string, slug: string): Promise<Article | null> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const filePath = path.join(categoryPath, `${slug}.md`)
    
    const content = await fs.promises.readFile(filePath, 'utf-8')
    
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const descMatch = content.match(/^>?\s*(.+)$/m)
    
    const title = titleMatch ? titleMatch[1].trim() : slug
    const description = descMatch ? descMatch[1].trim() : ''
    
    return {
      slug,
      title,
      description,
      category: categoryId,
      content,
    }
  } catch (error) {
    console.error('Error reading article:', error)
    return null
  }
}

export function getCategoryFromId(categoryId: string): string {
  const match = categoryId.match(/^(\d+)\.(.+)$/)
  return match ? match[2] : categoryId
}
