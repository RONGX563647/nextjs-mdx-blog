/**
 * 玻璃态卡片组件
 * 提供具有玻璃态效果的卡片样式，支持悬停效果
 */

// 导入必要的类型
import { ReactNode } from 'react' // React节点类型

/**
 * 玻璃态卡片组件的属性接口
 */
interface GlassCardProps {
  children: ReactNode // 卡片内容
  className?: string // 可选的CSS类名
  hoverEffect?: boolean // 是否启用悬停效果，默认为true
}

/**
 * 玻璃态卡片组件
 * 提供具有玻璃态效果的卡片样式，包括半透明背景、模糊效果、边框和阴影
 * @param children 卡片内容
 * @param className 可选的CSS类名
 * @param hoverEffect 是否启用悬停效果，默认为true
 * @returns 玻璃态卡片组件
 */
export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <div className={`
      bg-background
      border border-border
      rounded
      ${hoverEffect ? 'hover:border-primary transition-colors duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
