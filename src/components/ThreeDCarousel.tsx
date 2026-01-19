"use client"

import React, { useState, useEffect } from 'react'

interface Project {
  id: string
  title: string
  description: string
  color: string
  link: string
}

interface ThreeDCarouselProps {
  projects?: Project[]
}

const defaultProjects: Project[] = [
  {
    id: '1',
    title: '福师畅聊',
    description: '即时通讯应用',
    color: '#3b82f6',
    link: '#'
  },
  {
    id: '2',
    title: '师大云学',
    description: '在线教育平台',
    color: '#8b5cf6',
    link: '#'
  },
  {
    id: '3',
    title: '自动化测试',
    description: '测试框架',
    color: '#ec4899',
    link: '#'
  },
  {
    id: '4',
    title: '性能测试',
    description: '压测工具',
    color: '#10b981',
    link: '#'
  },
  {
    id: '5',
    title: '接口测试',
    description: 'API测试',
    color: '#f59e0b',
    link: '#'
  }
]

function ProgressBarItem({ project, delay }: { project: Project; delay: number }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 1
        })
      }, 20)

      return () => clearInterval(interval)
    }, delay * 100)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <a 
      href={project.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full mb-6 group"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <span className="text-sm font-medium text-muted-foreground">
          {progress}%
        </span>
      </div>
      <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300 ease-out relative"
          style={{
            width: `${progress}%`,
            backgroundColor: project.color,
            boxShadow: `0 0 10px ${project.color}40`,
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-full bg-white opacity-30"
            style={{
              transform: `translateX(-100%)`,
              animation: progress < 100 ? 'shimmer 1.5s infinite' : 'none',
            }}
          />
        </div>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        {project.description}
      </div>
    </a>
  )
}

export function ThreeDCarousel({ projects = defaultProjects }: ThreeDCarouselProps) {
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">测试项目进度</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {projects.map((project, index) => (
            <ProgressBarItem 
              key={project.id} 
              project={project} 
              delay={index * 0.3} 
            />
          ))}
        </div>
      </div>
      
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