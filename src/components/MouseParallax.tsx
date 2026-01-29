/**
 * 鼠标视差效果组件
 * 根据鼠标位置创建3D视差效果，包括旋转和位移
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和工具
import { motion, useMotionValue, useTransform } from 'framer-motion' // Framer Motion动画库和钩子
import { ReactNode, useEffect } from 'react' // React节点类型和钩子

/**
 * 鼠标视差效果组件的属性接口
 */
interface MouseParallaxProps {
  children: ReactNode // 要应用视差效果的子元素
  intensity?: number // 视差强度，默认为10
  className?: string // 可选的CSS类名
}

/**
 * 鼠标视差效果组件
 * 根据鼠标位置创建3D视差效果，包括旋转和位移
 * @param children 要应用视差效果的子元素
 * @param intensity 视差强度，默认为10
 * @param className 可选的CSS类名
 * @returns 带有鼠标视差效果的组件
 */
export function MouseParallax({ children, intensity = 10, className }: MouseParallaxProps) {
  // 创建鼠标位置的动画值
  const x = useMotionValue(0) // X轴位置
  const y = useMotionValue(0) // Y轴位置

  // 根据鼠标Y轴位置计算X轴旋转角度
  const rotateX = useTransform(y, [-100, 100], [intensity, -intensity])
  // 根据鼠标X轴位置计算Y轴旋转角度
  const rotateY = useTransform(x, [-100, 100], [-intensity, intensity])
  // 根据鼠标X轴位置计算X轴位移
  const translateX = useTransform(x, [-100, 100], [-intensity/2, intensity/2])
  // 根据鼠标Y轴位置计算Y轴位移
  const translateY = useTransform(y, [-100, 100], [-intensity/2, intensity/2])

  useEffect(() => {
    // 鼠标移动事件处理函数
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window // 获取窗口尺寸
      const { clientX, clientY } = e // 获取鼠标位置

      // 计算鼠标相对于窗口中心的位置（-100到100范围）
      x.set((clientX / innerWidth - 0.5) * 200)
      y.set((clientY / innerHeight - 0.5) * 200)
    }

    // 添加鼠标移动事件监听器
    window.addEventListener('mousemove', handleMouseMove)
    
    // 清理函数：移除事件监听器
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  return (
    <motion.div
      className={className}
      // 应用3D变换效果
      style={{
        rotateX, // X轴旋转
        rotateY, // Y轴旋转
        translateX, // X轴位移
        translateY, // Y轴位移
        transformStyle: "preserve-3d" // 保持3D变换效果
      }}
      // 设置过渡效果
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
