/**
 * 3D 轮播组件
 * 
 * 功能：
 * - 显示项目列表的进度条动画
 * - 支持自定义项目数据，默认从数据源获取
 * - 每个项目有独立的进度条动画
 * - 支持进度条闪烁效果
 */

'use client'

import React, { useState, useEffect } from 'react'
import { carouselProjects, carouselTitle, type CarouselProject } from '@/data/projects'

interface ThreeDCarouselProps {
  projects?: CarouselProject[]
}

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
function ProgressBarItem({ project, delay }: { project: CarouselProject; delay: number }) {
  // 进度状态，从 0 开始
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 计算动画持续时间，确保至少 5 秒
    const totalDuration = Math.max(5000, project.targetProgress * 50) // 至少 5秒，或根据进度计算
    const intervalTime = totalDuration / project.targetProgress // 每增加 1% 所需的时间

    // 延迟启动动画，创建级联效果
    const timer = setTimeout(() => {
      // 创建定时器，按照计算的间隔时间增加进度
      const interval = setInterval(() => {
        setProgress((prev) => {
          // 如果达到目标进度，清除定时器
          if (prev >= project.targetProgress) {
            clearInterval(interval)
            return project.targetProgress
          }
          // 否则增加进度
          return prev + 0.5 // 每次增加 0.5%，使动画更平滑
        })
      }, intervalTime / 2) // 每 0.5% 触发一次

      // 清理函数：清除定时器
      return () => clearInterval(interval)
    }, delay * 200)  // 延迟时间转换为毫秒，增加延迟以获得更好的级联效果

    // 清理函数：清除延迟定时器
    return () => clearTimeout(timer)
  }, [delay, project.targetProgress])

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
              // 只有在进度未达到目标时才显示闪烁动画
              animation: progress < project.targetProgress ? 'shimmer 1.5s infinite' : 'none',
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
export function ThreeDCarousel({ projects = carouselProjects }: ThreeDCarouselProps) {
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <h2 className="text-3xl font-bold mb-8 text-center">{carouselTitle}</h2>
        
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
