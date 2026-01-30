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
    
    return categories
      .filter((item) => {
        const itemPath = path.join(MD_DIR, item)
        return fs.statSync(itemPath).isDirectory()
      })
      .map((folder) => {
        const match = folder.match(/^(\d+)\.(.+)$/)
        let name = match ? match[2] : folder
        let description = ''
        
        // 根据专栏名称设置具体描述
        switch (name) {
          case 'Java基础':
            description = '从Java语言基础到核心概念，全面覆盖Java编程必备知识，适合初学者和进阶开发者'
            break
          case 'JavaWeb':
            description = '深入学习JavaWeb开发技术，包括Servlet、JSP、Spring等框架，构建企业级Web应用'
            break
          case '瑞吉外卖':
            description = '基于Spring Boot和Vue开发的外卖点餐系统，实战项目演练，掌握全栈开发技能'
            break
          case 'SSM':
            description = 'Spring + SpringMVC + MyBatis整合开发，掌握企业级JavaWeb开发主流技术栈'
            break
          case '苍穹外卖':
            description = '基于Spring Boot和Vue3开发的餐饮管理系统，实战项目演练，提升全栈开发能力'
            break
          case '若依框架':
            description = '基于Spring Boot的快速开发平台，学习企业级项目架构设计和开发规范'
            break
          case '数据库':
            description = 'MySQL数据库设计与优化，掌握SQL语句、索引、事务等核心知识点'
            break
          case '计算机网络':
            description = '计算机网络基础知识，涵盖TCP/IP、HTTP协议、网络安全等核心概念'
            break
          case '手写Dubbo':
            description = '从零实现RPC框架Dubbo，深入理解分布式服务治理原理和微服务架构'
            break
          case '手写Sring':
            description = '手写Spring框架核心功能，深入理解IOC和AOP原理，提升框架设计能力'
            break
          case '手写Mybatis':
            description = '手写Mybatis持久层框架，深入理解ORM映射原理和数据库操作机制'
            break
          case '课程设计':
            description = '大学课程设计项目实战，涵盖多种技术栈和业务场景，提升综合开发能力'
            break
          case 'LeetCode-Hot100':
            description = 'LeetCode热门100题详解，提升算法思维和编程能力，备战技术面试'
            break
          default:
            description = '探索相关知识体系，掌握核心技能'
        }
        
        if (match) {
          return {
            id: folder,
            name: match[2],
            description,
          }
        }
        return {
          id: folder,
          name: folder,
          description,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
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
