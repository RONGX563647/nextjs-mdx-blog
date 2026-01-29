/**
 * 页面过渡组件
 * 提供页面切换时的过渡动画效果
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和类型
import { AnimatePresence, motion } from 'framer-motion' // Framer Motion动画库
import { ReactNode } from 'react' // React节点类型

/**
 * 页面过渡组件的属性接口
 */
interface PageTransitionProps {
  children: ReactNode // 要应用过渡效果的子元素
}

/**
 * 页面过渡组件
 * 提供页面切换时的过渡动画效果，包括淡入淡出和位移
 * @param children 要应用过渡效果的子元素
 * @returns 带有页面过渡效果的组件
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        // 使用随机数作为key，确保每次页面切换都触发动画
        key={Math.random()}
        // 初始状态：透明且向下偏移20px
        initial={{ opacity: 0, y: 20 }}
        // 进入状态：不透明且回到原始位置
        animate={{ opacity: 1, y: 0 }}
        // 退出状态：透明且向上偏移20px
        exit={{ opacity: 0, y: -20 }}
        // 动画配置：持续0.5秒，使用easeInOut缓动函数
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
