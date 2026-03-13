/**
 * 项目卡片组件
 * 
 * 功能：
 * - 显示项目的基本信息（标题、描述、日期）
 * - 显示项目的技术栈标签
 * - 显示项目的主要职责预览
 * - 支持悬停效果
 * - 响应式布局支持
 * 
 * @param props 组件属性
 */
import { ExternalLink, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ProjectCardProps {
  id: string
  title: string
  description: string
  date: string
  skills: string[]
  category: string
}

export function ProjectCard({ id, title, description, date, skills, category }: ProjectCardProps) {
  return (
    <Link
      href={`/portfolio/${id}`}
      className="block p-6 bg-background border border-border rounded shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary group"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors flex-shrink-0">
          <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{date}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </div>
      </div>
    </Link>
  )
}
