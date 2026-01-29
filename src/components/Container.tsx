/**
 * 容器组件
 * 提供统一的容器样式，包括最大宽度、居中和内边距
 */

// 导入必要的工具
import clsx from 'clsx' // 类名合并工具

/**
 * 容器组件的属性接口
 */
interface ContainerProps {
  children: React.ReactNode // 容器内容
  className?: string // 可选的CSS类名
}

/**
 * 容器组件
 * 提供统一的容器样式，包括最大宽度、居中和内边距
 * @param children 容器内容
 * @param className 可选的CSS类名
 * @returns 容器组件
 */
export function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div 
      className={clsx(
        className, // 自定义类名
        'mx-auto', // 水平居中
        'max-w-4xl', // 默认最大宽度
        'px-6', // 水平内边距
        'lg:max-w-6xl', // 大屏幕最大宽度
        'xl:max-w-7xl' // 超大屏幕最大宽度
      )}
    >
      {children}
    </div>
  )
}
