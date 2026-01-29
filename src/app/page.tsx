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
import { Github, Download, ExternalLink, Eye } from 'lucide-react' // 图标组件
import Link from 'next/link' // Next.js链接组件

/**
 * 首页组件
 * @returns 首页内容
 */
export default function Home() {

  return (
    <div>
      {/* Hero区域 - 个人介绍部分 */}
      <section className="py-40 text-center relative overflow-hidden">
        {/* 3D背景效果 */}
        <Hero3DBackground />
        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* 3D文本动画 */}
          <ScrollAnimation className="mb-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Logo区域 */}
              <div className="flex-shrink-0">
                <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-white p-6 sm:p-8 shadow-lg flex items-center justify-center">
                    <img src="/1.png" alt="RONGX Logo" className="w-full h-full object-contain transform -translate-y-10" />
                  </div>
              </div>
              {/* 个人介绍文本 */}
              <div className="text-center md:text-left max-w-2xl">
                <h1 className="font-bold tracking-tight mb-6">
                  <span className="text-4xl md:text-5xl lg:text-6xl">你好，我是</span>
                  <span className="mx-2 text-6xl md:text-7xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">RONGX</span>
                </h1>
                <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-8">
                  全栈开发工程师 | Java | Vue3 
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  专注于Java后端和Vue3前端开发，致力于构建高质量的全栈应用。
                </p>
              </div>
            </div>
          </ScrollAnimation>
          
          {/* 行动按钮区域 */}
          <ScrollAnimation className="flex flex-wrap justify-center gap-6" delay={0.2}>
            {/* 了解更多按钮 */}
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/about">了解更多 →</Link>
            </Button>
            {/* 查看项目按钮 */}
            <Button asChild variant="outline" className="text-lg px-10 py-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 hover:bg-white/5 dark:hover:bg-gray-800/50 transition-all duration-300">
              <Link href="/portfolio">查看项目</Link>
            </Button>
            {/* 下载简历按钮 */}
            <div className="relative group">
              <Button asChild variant="secondary" className="text-lg px-10 py-6 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
                <a href="/1.pdf" download className="flex items-center gap-2">
                  <Download size={20} />
                  下载简历
                </a>
              </Button>
              
              {/* 预览简历按钮 - 在新标签页打开 */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -top-2 -right-2 bg-blue-600 text-white hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <a href="/1.pdf" target="_blank" rel="noopener noreferrer">
                  <Eye size={16} />
                </a>
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
      
      
      
      {/* 精选项目区域 */}
      <section className="py-20">
        <ScrollAnimation>
          <h2 className="text-3xl font-semibold tracking-tight mb-6">
            精选项目
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
            以下是我参与开发的一些代表性项目，展示了我的技术能力和实践经验。
          </p>
        </ScrollAnimation>
        {/* 项目卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 项目1：福师畅聊 */}
          <ScrollAnimation delay={0.2}>
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-3">福师畅聊 - 全栈开发</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责全栈开发工作。
              </p>
              {/* 技术标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100/70 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 rounded-full text-sm">Spring Boot</span>
                <span className="px-3 py-1 bg-green-100/70 text-green-800 dark:bg-green-900/70 dark:text-green-200 rounded-full text-sm">Netty</span>
                <span className="px-3 py-1 bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 rounded-full text-sm">Redis</span>
                <span className="px-3 py-1 bg-purple-100/70 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200 rounded-full text-sm">Vue3</span>
              </div>
              {/* 查看详情按钮 */}
              <Button asChild variant="ghost" className="text-blue-600 dark:text-blue-400">
                <a href="/portfolio/福师畅聊" className="flex items-center gap-1">
                  查看详情
                  <ExternalLink size={14} />
                </a>
              </Button>
            </GlassCard>
          </ScrollAnimation>
          {/* 项目2：师大云学 */}
          <ScrollAnimation delay={0.4}>
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-3">师大云学 - 全栈开发</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                基于 Spring Cloud Alibaba 开发的在线教育平台，负责全栈开发工作。
              </p>
              {/* 技术标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100/70 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 rounded-full text-sm">Spring Cloud</span>
                <span className="px-3 py-1 bg-green-100/70 text-green-800 dark:bg-green-900/70 dark:text-green-200 rounded-full text-sm">MySQL</span>
                <span className="px-3 py-1 bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 rounded-full text-sm">RabbitMQ</span>
                <span className="px-3 py-1 bg-purple-100/70 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200 rounded-full text-sm">Vue3</span>
              </div>
              {/* 查看详情按钮 */}
              <Button asChild variant="ghost" className="text-blue-600 dark:text-blue-400">
                <a href="/portfolio/师大云学" className="flex items-center gap-1">
                  查看详情
                  <ExternalLink size={14} />
                </a>
              </Button>
            </GlassCard>
          </ScrollAnimation>
        </div>
      </section>

      {/* 3D轮播图区域 */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <ScrollAnimation>
          <h2 className="text-3xl font-semibold tracking-tight mb-6 text-center">
            项目展示
          </h2>
        </ScrollAnimation>
        <ScrollAnimation>
          <div className="max-w-4xl mx-auto">
            {/* 3D轮播图组件 */}
            <ThreeDCarousel />
          </div>
        </ScrollAnimation>
      </section>

    </div>
  )
}
