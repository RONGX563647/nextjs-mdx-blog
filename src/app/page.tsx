/**
 * 首页组件
 * 展示个人介绍、精选项目和项目展示
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和工具
import { Button } from '@/components/ui/button' // 按钮组件
import { EasterEgg } from '@/components/EasterEgg' // 彩蛋组件
import { GlassCard } from '@/components/GlassCard' // 玻璃态卡片组件
import { Hero3DBackground } from '@/components/Hero3DBackground' // 3D背景组件
import { MouseParallax } from '@/components/MouseParallax' // 鼠标视差效果组件
import { ScrollAnimation } from '@/components/ScrollAnimation' // 滚动动画组件
import { ThreeDCarousel } from '@/components/ThreeDCarousel' // 3D轮播图组件
import { Github, Download, ExternalLink, Eye, BookOpen, ArrowRight } from 'lucide-react' // 图标组件
import Link from 'next/link' // Next.js链接组件

/**
 * 首页组件
 * @returns 首页内容
 */
export default function Home() {

  return (
    <div>
      <section className="py-32 relative">
        <div className="w-full max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold tracking-widest uppercase mb-4 text-primary">
                  全栈开发工程师
                </p>
                <h1 className="font-bold tracking-tighter mb-8">
                  <span className="text-5xl md:text-6xl lg:text-7xl block mb-2">你好，我是</span>
                  <span className="text-6xl md:text-7xl lg:text-8xl text-primary">RONGX</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-lg">
                  专注于 Java 后端和 Vue3 前端开发，致力于构建高质量的全栈应用
                </p>
                <p className="text-base text-muted-foreground/80 mb-10 max-w-md">
                  从基础到进阶，记录学习过程中的思考与总结，分享技术见解与实践经验
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-4 rounded">
                    <Link href="/about">了解更多 →</Link>
                  </Button>
                  <Button asChild variant="outline" className="text-base px-8 py-4 rounded border-2 border-border hover:border-primary hover:bg-primary/5">
                    <Link href="/portfolio">查看项目</Link>
                  </Button>
                  <div className="relative group">
                    <Button asChild variant="secondary" className="text-base px-8 py-4 rounded hover:bg-secondary/80">
                      <a href="/1.pdf" download className="flex items-center gap-2">
                        <Download size={18} />
                        下载简历
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 bg-primary text-white hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                    >
                      <a href="/1.pdf" target="_blank" rel="noopener noreferrer">
                        <Eye size={12} />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 border-4 border-border p-6">
                  <img src="/1.png" alt="RONGX Logo" className="w-full h-full object-contain" />
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
          <ScrollAnimation delay={0.2}>
            <div className="p-6 border border-border hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">福师畅聊 - 全栈开发</h3>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责全栈开发工作
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">Spring Boot</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">Netty</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">Redis</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">Vue3</span>
              </div>
              <Button asChild variant="ghost" className="text-primary px-0 hover:bg-transparent">
                <a href="/portfolio/福师畅聊" className="flex items-center gap-2 font-medium">
                  查看详情
                  <ArrowRight size={16} />
                </a>
              </Button>
            </div>
          </ScrollAnimation>
          <ScrollAnimation delay={0.4}>
            <div className="p-6 border border-border hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">师大云学 - 全栈开发</h3>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                基于 Spring Cloud Alibaba 开发的在线教育平台，负责全栈开发工作
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">Spring Cloud</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">MySQL</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">RabbitMQ</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium">Vue3</span>
              </div>
              <Button asChild variant="ghost" className="text-primary px-0 hover:bg-transparent">
                <a href="/portfolio/师大云学" className="flex items-center gap-2 font-medium">
                  查看详情
                  <ArrowRight size={16} />
                </a>
              </Button>
            </div>
          </ScrollAnimation>
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
