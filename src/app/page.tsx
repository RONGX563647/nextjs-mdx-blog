/**
 * 首页组件
 * 展示个人介绍、精选项目和项目展示
 */

'use client'

import { Button } from '@/components/ui/button'
import { EasterEgg } from '@/components/EasterEgg'
import { GlassCard } from '@/components/GlassCard'
import { Hero3DBackground } from '@/components/Hero3DBackground'
import { MouseParallax } from '@/components/MouseParallax'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { ThreeDCarousel } from '@/components/ThreeDCarousel'
import { BookOpen, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ResumeDownloadButton } from '@/components/resume/ResumeDownloadButton'
import { profileConfig } from '@/data/profile'
import { featuredProjects } from '@/data/projects'
import { siteConfig } from '@/data/site'

export default function Home() {
  return (
    <div>
      <section className="py-32 relative">
        <div className="w-full max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold tracking-widest uppercase mb-4 text-primary">
                  {profileConfig.title}
                </p>
                <h1 className="font-bold tracking-tighter mb-8">
                  <span className="text-5xl md:text-6xl lg:text-7xl block mb-2">{profileConfig.greeting}</span>
                  <span className="text-6xl md:text-7xl lg:text-8xl text-primary">{profileConfig.name}</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-lg">
                  {profileConfig.bio}
                </p>
                <p className="text-base text-muted-foreground/80 mb-10 max-w-md">
                  {profileConfig.subBio}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-4 rounded">
                    <Link href="/about">了解更多 →</Link>
                  </Button>
                  <Button asChild variant="outline" className="text-base px-8 py-4 rounded border-2 border-border hover:border-primary hover:bg-primary/5">
                    <Link href="/portfolio">查看项目</Link>
                  </Button>
                  <ResumeDownloadButton />
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 border-4 border-border p-6">
                  <img src={siteConfig.avatar} alt={`${profileConfig.name} Logo`} className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
      
      <section className="py-20 border-t border-border">
        <ScrollAnimation>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-1 bg-primary"></div>
            <h2 className="text-3xl font-bold tracking-tight">
              精选项目
            </h2>
          </div>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            以下是我参与开发的一些代表性项目，展示了我的技术能力和实践经验
          </p>
        </ScrollAnimation>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <ScrollAnimation key={project.id} delay={0.2 * (index + 1)}>
              <div className="p-6 border border-border hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {(project.featuredSkills || project.skills.slice(0, 4)).map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">{skill}</span>
                  ))}
                </div>
                <Button asChild variant="ghost" className="text-primary px-0 hover:bg-transparent">
                  <a href={`/portfolio/${project.id}`} className="flex items-center gap-2 font-medium">
                    查看详情
                    <ArrowRight size={16} />
                  </a>
                </Button>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <ScrollAnimation>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-1 bg-primary"></div>
            <h2 className="text-3xl font-bold tracking-tight">
              项目展示
            </h2>
          </div>
        </ScrollAnimation>
        <ScrollAnimation>
          <div className="max-w-4xl mx-auto">
            <ThreeDCarousel />
          </div>
        </ScrollAnimation>
      </section>

    </div>
  )
}
