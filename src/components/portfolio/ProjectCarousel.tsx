/**
 * 3D 项目轮播组件
 * 
 * 功能：
 * - 显示项目卡片的 3D 轮播效果
 * - 支持鼠标悬停交互
 * - 响应式布局支持
 * 
 * @param props 组件属性
 */
'use client'

import { useState } from 'react'
import { ExternalLink, Github, Code } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  description: string
  date: string
  skills: string[]
  link: string
}

interface ProjectCarouselProps {
  projects: Project[]
}

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="relative overflow-hidden py-10">
      <div className="flex justify-center perspective-1000">
        <div className="carousel-container relative w-full max-w-6xl">
          <div className="carousel-wrapper flex transition-transform duration-700 ease-in-out hover:duration-1000" style={{ transform: 'translateZ(-200px)' }}>
            {projects.map((project, index) => (
              <div 
                key={project.id} 
                className="carousel-item relative flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease'
                }}
              >
                <div 
                  className={`project-card bg-background border border-border rounded shadow-sm overflow-hidden transition-all duration-500 ${
                    hoveredIndex === index ? 'shadow-lg border-primary' : ''
                  }`}
                  style={{ height: '100%' }}
                >
                  <div className="bg-primary p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-primary-foreground">{project.title}</h2>
                      <div className="bg-primary-foreground/20 backdrop-blur-sm p-3 rounded-full">
                        <Code size={24} className="text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <p className="text-primary-foreground/80 mt-2">{project.date}</p>
                  
                  <div className="p-6">
                    <p className="text-muted-foreground mb-6">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.skills.slice(0, 6).map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 6 && (
                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                          +{project.skills.length - 6} 更多
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href={project.link} className="flex items-center justify-center gap-2">
                          查看详情
                          <ExternalLink size={16} />
                        </Link>
                      </Button>
                      <Button asChild variant="secondary" className="hover:bg-secondary/80">
                        <a href="#" className="flex items-center gap-2">
                          <Github size={16} />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
