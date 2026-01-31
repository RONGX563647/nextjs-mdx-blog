/**
 * 3D 轮播组件
 * 
 * 功能：
 * - 显示项目列表的进度条动画
 * - 支持自定义项目数据
 * - 每个项目有独立的进度条动画
 * - 支持进度条闪烁效果
 * 
 * @returns 3D 轮播组件内容
 */

// 标记为客户端组件
'use client'

// 导入 React 核心库和钩子
import React, { useState, useEffect } from 'react'

/**
 * 项目接口
 * 定义项目数据结构
 */
interface Project {
  id: string              // 项目唯一标识
  title: string           // 项目标题
  description: string     // 项目描述
  color: string          // 进度条颜色
  link: string           // 项目链接
}

/**
 * 3D 轮播组件属性接口
 */
interface ThreeDCarouselProps {
  projects?: Project[]    // 可选的项目列表，默认使用内置项目
}

/**
 * 默认项目数据
 * 提供一组默认项目用于演示
 */
const defaultProjects: Project[] = [
  {
    id: '1',
    title: '福师畅聊',
    description: '即时通讯应用',
    color: '#3b82f6',  // 蓝色
    link: '#'
  },
  {
    id: '2',
    title: '师大云学',
    description: '在线教育平台',
    color: '#8b5cf6',  // 紫色
    link: '#'
  },
  {
    id: '3',
    title: '自动化测试',
    description: '测试框架',
    color: '#ec4899',  // 粉色
    link: '#'
  },
  {
    id: '4',
    title: '性能测试',
    description: '压测工具',
    color: '#10b981',  // 绿色
    link: '#'
  },
  {
    id: '5',
    title: '接口测试',
    description: 'API测试',
    color: '#f59e0b',  // 橙色
    link: '#'
  }
]

/**
 * 进度条项组件
 * 
 * 功能：
 * - 显示单个项目的进度条
 * - 自动从 0% 增加到 100%
 * - 支持进度条闪烁动画
 * - 延迟启动动画以创建级联效果
 * 
 * @param props 组件属性
 * @returns 进度条项内容
 */
function ProgressBarItem({ project, delay }: { project: Project; delay: number }) {
  // 进度状态，从 0 开始
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 延迟启动动画，创建级联效果
    const timer = setTimeout(() => {
      // 创建定时器，每 20ms 增加 1%
      const interval = setInterval(() => {
        setProgress((prev) => {
          // 如果达到 100%，清除定时器
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          // 否则增加进度
          return prev + 1
        })
      }, 20)

      // 清理函数：清除定时器
      return () => clearInterval(interval)
    }, delay * 100)  // 延迟时间转换为毫秒

    // 清理函数：清除延迟定时器
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <a 
      href={project.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full mb-6 group"
    >
      {/* 项目标题和进度百分比 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <span className="text-sm font-medium text-muted-foreground">
          {progress}%
        </span>
      </div>
      
      {/* 进度条容器 */}
      <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
        {/* 进度条填充 */}
        <div 
          className="h-full rounded-full transition-all duration-300 ease-out relative"
          style={{
            width: `${progress}%`,              // 进度条宽度
            backgroundColor: project.color,        // 进度条颜色
            boxShadow: `0 0 10px ${project.color}40`,  // 进度条阴影效果
          }}
        >
          {/* 闪烁效果层 */}
          <div 
            className="absolute top-0 left-0 w-full h-full bg-white opacity-30"
            style={{
              transform: `translateX(-100%)`,
              // 只有在进度未完成时才显示闪烁动画
              animation: progress < 100 ? 'shimmer 1.5s infinite' : 'none',
            }}
          />
        </div>
      </div>
      
      {/* 项目描述 */}
      <div className="mt-1 text-sm text-muted-foreground">
        {project.description}
      </div>
    </a>
  )
}

/**
 * 3D 轮播主组件
 * 
 * 功能：
 * - 渲染项目列表
 * - 为每个项目创建进度条
 * - 添加全局闪烁动画样式
 * 
 * @param props 组件属性
 * @returns 3D 轮播组件内容
 */
export function ThreeDCarousel({ projects = defaultProjects }: ThreeDCarouselProps) {
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <h2 className="text-3xl font-bold mb-8 text-center">测试项目进度</h2>
        
        {/* 项目列表 */}
        <div className="max-w-3xl mx-auto space-y-4">
          {projects.map((project, index) => (
            <ProgressBarItem 
              key={project.id} 
              project={project} 
              delay={index * 0.3}  // 每个项目延迟 0.3 秒
            />
          ))}
        </div>
      </div>
      
      {/* 全局样式：闪烁动画 */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
