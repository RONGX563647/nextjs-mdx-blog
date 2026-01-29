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
      // 半透明背景
      bg-white/30 dark:bg-gray-800/40
      // 背景模糊效果
      backdrop-blur-md
      // 半透明边框
      border border-white/50 dark:border-gray-700/50
      // 圆角
      rounded-xl
      // 阴影效果
      shadow-lg
      // 悬停效果（如果启用）
      ${hoverEffect ? 'hover:shadow-xl hover:bg-white/40 dark:hover:bg-gray-800/50 transition-all duration-300' : ''}
      // 自定义类名
      ${className}
    `}>
      {children}
    </div>
  )
}
