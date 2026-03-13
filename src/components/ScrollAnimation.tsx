/**
 * 滚动动画组件
 * 当元素进入视口时，触发淡入和上移的动画效果
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和类型
import { motion } from 'framer-motion' // Framer Motion动画库
import { ReactNode } from 'react' // React节点类型

/**
 * 滚动动画组件的属性接口
 */
interface ScrollAnimationProps {
  children: ReactNode // 要应用动画的子元素
  className?: string // 可选的CSS类名
  delay?: number // 可选的动画延迟时间（秒）
}

/**
 * 滚动动画组件
 * @param children 要应用动画的子元素
 * @param className 可选的CSS类名
 * @param delay 可选的动画延迟时间，默认为0秒
 * @returns 带有滚动动画效果的组件
 */
export function ScrollAnimation({ children, className, delay = 0 }: ScrollAnimationProps) {
  return (
    <motion.div
      className={className}
      // 初始状态：透明且向下偏移50px
      initial={{ opacity: 0, y: 50 }}
      // 进入视口时的状态：不透明且回到原始位置
      whileInView={{ opacity: 1, y: 0 }}
      // 动画配置：持续0.8秒，指定延迟，使用easeOut缓动函数
      transition={{
        duration: 0.8,
        delay: delay,
        ease: "easeOut"
      }}
      // 视口配置：只触发一次动画，视口边缘扩展-100px
      viewport={{
        once: true, // 只触发一次动画
        margin: "-100px" // 视口边缘扩展，使动画在元素接近视口时就开始触发
      }}
    >
      {children}
    </motion.div>
  )
}
