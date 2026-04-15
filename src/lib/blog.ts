import fs from 'fs'
import path from 'path'

export interface Category {
  id: string
  name: string
  description?: string
}

export interface SubCategory {
  id: string
  name: string
  path: string // 相对于 category 的路径
  articleCount: number
}

export interface Article {
  slug: string
  title: string
  description?: string
  date?: string
  category: string
  subCategory?: string // 子目录路径
  content: string
}

const MD_DIR = path.join(process.cwd(), 'public', 'md')

// 排除的目录名
const EXCLUDED_DIRS = ['.obsidian', '.claude', '.claudian', 'build', 'CMakeFiles', '.git']

// 递归获取目录下的所有 markdown 文件
async function getMdFilesRecursively(dir: string, basePath: string = ''): Promise<{ slug: string; filePath: string; subCategory: string }[]> {
  const results: { slug: string; filePath: string; subCategory: string }[] = []
  
  try {
    const items = await fs.promises.readdir(dir)
    
    for (const item of items) {
      // 跳过排除的目录
      if (EXCLUDED_DIRS.includes(item)) continue
      
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        // 递归读取子目录
        const subResults = await getMdFilesRecursively(
          itemPath,
          basePath ? `${basePath}/${item}` : item
        )
        results.push(...subResults)
      } else if (item.endsWith('.md')) {
        // 添加 markdown 文件
        const slug = basePath ? `${basePath}/${item.replace('.md', '')}` : item.replace('.md', '')
        results.push({
          slug,
          filePath: itemPath,
          subCategory: basePath,
        })
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }
  
  return results
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await fs.promises.readdir(MD_DIR)
    
    // 修仙体系排序优先级
    const cultivationOrder = ['引气', '筑基', '金丹', '元婴', '化神', '合体']
    
    return categories
      .filter((item) => {
        if (EXCLUDED_DIRS.includes(item)) return false
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

// 获取子目录列表
export async function getSubCategories(categoryId: string): Promise<SubCategory[]> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const subCategories: SubCategory[] = []
    
    const scanDir = async (dir: string, basePath: string = '') => {
      const items = await fs.promises.readdir(dir)
      
      for (const item of items) {
        if (EXCLUDED_DIRS.includes(item)) continue
        
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          const subPath = basePath ? `${basePath}/${item}` : item
          
          // 检查是否有子目录或 md 文件
          const subItems = await fs.promises.readdir(itemPath)
          const hasContent = subItems.some(subItem => {
            if (EXCLUDED_DIRS.includes(subItem)) return false
            const subItemPath = path.join(itemPath, subItem)
            const subStat = fs.statSync(subItemPath)
            return subStat.isDirectory() || subItem.endsWith('.md')
          })
          
          if (hasContent) {
            // 计算该子目录下的文章数
            const files = await getMdFilesRecursively(itemPath, subPath)
            
            // 检查当前目录是否有直接的文章（不包括子目录）
            const directFiles = subItems.filter(subItem => subItem.endsWith('.md'))
            
            if (directFiles.length > 0 || files.length > 0) {
              subCategories.push({
                id: item,
                name: item,
                path: subPath,
                articleCount: files.length,
              })
            }
          }
          
          // 递归扫描
          await scanDir(itemPath, subPath)
        }
      }
    }
    
    await scanDir(categoryPath)
    
    return subCategories
  } catch (error) {
    console.error('Error reading subcategories:', error)
    return []
  }
}

export async function getArticles(categoryId: string): Promise<Article[]> {
  try {
    const categoryPath = path.join(MD_DIR, categoryId)
    const files = await getMdFilesRecursively(categoryPath)
    
    const articles: Article[] = []
    
    for (const file of files) {
      const content = await fs.promises.readFile(file.filePath, 'utf-8')
      
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const descMatch = content.match(/^>?\s*(.+)$/m)
      const dateMatch = content.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/)
      
      const title = titleMatch ? titleMatch[1].trim() : file.slug.split('/').pop() || file.slug
      const description = descMatch ? descMatch[1].trim() : ''
      const date = dateMatch ? dateMatch[1] : undefined
      
      articles.push({
        slug: file.slug,
        title,
        description,
        date,
        category: categoryId,
        subCategory: file.subCategory || undefined,
        content,
      })
    }
    
    // 按路径和标题排序
    return articles.sort((a, b) => {
      // 先按子目录排序
      const subA = a.subCategory || ''
      const subB = b.subCategory || ''
      if (subA !== subB) {
        return subA.localeCompare(subB)
      }
      
      // 同一目录内按数字排序
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
    const dateMatch = content.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/)
    
    const title = titleMatch ? titleMatch[1].trim() : slug.split('/').pop() || slug
    const description = descMatch ? descMatch[1].trim() : ''
    const date = dateMatch ? dateMatch[1] : undefined
    
    // 提取子目录路径
    const slugParts = slug.split('/')
    const subCategory = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : undefined
    
    return {
      slug,
      title,
      description,
      date,
      category: categoryId,
      subCategory,
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

// 获取子目录名称（从路径中提取）
export function getSubCategoryName(subCategoryPath: string): string {
  const parts = subCategoryPath.split('/')
  return parts[parts.length - 1] || subCategoryPath
}
