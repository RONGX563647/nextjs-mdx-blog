/**
 * 自定义光标组件
 * 提供跟随鼠标的自定义光标效果，包括主光标和光标光环
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和工具
import { motion, useMotionValue, useSpring } from 'framer-motion' // Framer Motion动画库和钩子
import { useEffect } from 'react' // React钩子

/**
 * 自定义光标组件
 * 提供跟随鼠标的自定义光标效果，包括主光标和光标光环
 * @returns 自定义光标组件
 */
export function CustomCursor() {
  // 创建鼠标位置的动画值
  const x = useMotionValue(0) // X轴位置
  const y = useMotionValue(0) // Y轴位置
  
  // 使用弹簧动画使光标移动更平滑
  const springX = useSpring(x, { stiffness: 400, damping: 25 }) // X轴弹簧动画
  const springY = useSpring(y, { stiffness: 400, damping: 25 }) // Y轴弹簧动画

  useEffect(() => {
    // 鼠标移动事件处理函数
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX) // 设置X轴位置
      y.set(e.clientY) // 设置Y轴位置
    }

    // 添加鼠标移动事件监听器
    window.addEventListener('mousemove', handleMouseMove)
    
    // 清理函数：移除事件监听器
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  return (
    <>
      {/* 主光标 - 小圆点 */}
      <motion.div
        // 在移动端隐藏，在桌面端显示
        className="hidden md:block fixed top-0 left-0 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          x: springX, // 使用弹簧动画的X轴位置
          y: springY, // 使用弹簧动画的Y轴位置
          translateX: "-50%", // 向左偏移50%，使光标中心对准鼠标位置
          translateY: "-50%" // 向上偏移50%，使光标中心对准鼠标位置
        }}
      />
      {/* 光标光环 - 大圆点 */}
      <motion.div
        // 在移动端隐藏，在桌面端显示
        className="hidden md:block fixed top-0 left-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full pointer-events-none z-40 mix-blend-difference opacity-20"
        style={{
          x: springX, // 使用弹簧动画的X轴位置
          y: springY, // 使用弹簧动画的Y轴位置
          translateX: "-50%", // 向左偏移50%，使光标中心对准鼠标位置
          translateY: "-50%" // 向上偏移50%，使光标中心对准鼠标位置
        }}
      />
    </>
  )
}
