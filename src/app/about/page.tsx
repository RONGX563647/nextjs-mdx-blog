/**
 * 关于页面组件
 * 展示个人介绍、个人信息、经历时间轴、技能雷达图、在校荣誉和联系方式
 */

// 导入必要的组件和工具
import { WEBSITE_HOST_URL } from '@/lib/constants' // 网站主机URL
import type { Metadata } from 'next' // Next.js元数据类型
import { Button } from '@/components/ui/button' // 按钮组件
import { Github, Linkedin, Mail, Phone, MapPin, Award } from 'lucide-react' // 图标组件
import Link from 'next/link' // Next.js链接组件

// 页面元数据
const meta = {
  title: '关于我', // 页面标题
  description: '全栈开发工程师 | Java | Vue3 | 前后端一体化开发', // 页面描述
  url: `${WEBSITE_HOST_URL}/about`, // 页面URL
}

/**
 * Next.js元数据配置
 * 用于SEO、社交媒体分享等
 */
export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.url,
  },
  twitter: {
    title: meta.title,
    description: meta.description,
  },
  alternates: {
    canonical: meta.url,
  },
}

/**
 * 关于页面组件
 * @returns 关于页面内容
 */
export default function About() {
  return (
    <div>
      {/* 关于页面头部 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">关于我</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            我是一名全栈开发工程师，专注于 Java 后端和 Vue3 前端开发，
            拥有扎实的前后端技术基础，能够为项目提供完整的技术解决方案。
          </p>
          
          {/* 社交链接 */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button asChild variant="secondary" className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border-blue-600/30">
              <a href="mailto:example@example.com" className="flex items-center gap-2">
                <Mail size={18} />
                发送邮件
              </a>
            </Button>
            <Button asChild variant="secondary" className="bg-gradient-to-r from-gray-800/10 to-gray-600/10 hover:from-gray-800/20 hover:to-gray-600/20 border-gray-600/30">
              <a href="https://github.com" className="flex items-center gap-2">
                <Github size={18} />
                GitHub
              </a>
            </Button>
            <Button asChild variant="secondary" className="bg-gradient-to-r from-blue-700/10 to-blue-500/10 hover:from-blue-700/20 hover:to-blue-500/20 border-blue-700/30">
              <a href="https://linkedin.com" className="flex items-center gap-2">
                <Linkedin size={18} />
                LinkedIn
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 个人信息部分 */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">个人信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 基本信息 */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">期望地点</h3>
                  <p className="text-gray-600 dark:text-gray-300">福州</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">邮箱</h3>
                  <p className="text-gray-600 dark:text-gray-300">example@example.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">电话</h3>
                  <p className="text-gray-600 dark:text-gray-300">138****1234</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">教育背景</h3>
                  <p className="text-gray-600 dark:text-gray-300">福建师范大学 · 软件工程（本科）</p>
                  <p className="text-gray-600 dark:text-gray-300">2024.09-2028.06</p>
                </div>
              </div>
            </div>
            {/* 核心优势 */}
            <div className="space-y-6">
              <h3 className="font-semibold text-xl">核心优势</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>扎实的编码与逻辑能力，熟悉前后端开发流程</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>精通 Java 后端开发，熟悉 Spring Boot、Spring Cloud 框架</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>熟练掌握 Vue3 前端开发，熟悉组件化开发和响应式设计</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>熟悉 MySQL、Redis 等数据库和缓存技术</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>了解微服务架构和分布式系统设计</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 经历时间轴 */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">经历时间轴</h2>
          <div className="relative max-w-3xl mx-auto">
            {/* 时间轴线 */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-600/20 dark:bg-blue-400/20 transform md:translate-x-[-50%]"></div>
            
            {/* 时间轴项目 */}
            <div className="space-y-12">
              {/* 教育经历 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 transform md:translate-x-[-50%] z-10"></div>
                <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">2024.09 - 2028.06</span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">福建师范大学</h3>
                    <p className="text-gray-600 dark:text-gray-300">软件工程（本科）</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">主修课程：数据结构、算法设计、数据库原理、操作系统、计算机网络、软件工程</p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
              
              {/* 项目经历1：福师畅聊 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-purple-600 dark:bg-purple-400 transform md:translate-x-[-50%] z-10"></div>
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">2025.08 - 2025.10</span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">福师畅聊</h3>
                    <p className="text-gray-600 dark:text-gray-300">全栈开发工程师</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责前后端全栈开发工作</p>
                  </div>
                </div>
              </div>
              
              {/* 项目经历2：师大云学 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-green-600 dark:bg-green-400 transform md:translate-x-[-50%] z-10"></div>
                <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">2025.07 - 2025.09</span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">师大云学</h3>
                    <p className="text-gray-600 dark:text-gray-300">全栈开发工程师</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">基于 Spring Cloud Alibaba 开发的在线教育平台，负责前后端全栈开发工作</p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 技能雷达图 */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">技能雷达图</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 后端开发能力雷达图 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-center">后端开发能力</h3>
              <div className="aspect-square max-w-md mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* 雷达网格 */}
                  <g stroke="#e5e7eb" strokeWidth="1" fill="none">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <polygon
                        key={level}
                        points={[
                          100 + 80 * Math.cos(0) * (level / 5),
                          100 + 80 * Math.sin(0) * (level / 5),
                          100 + 80 * Math.cos((2 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.sin((2 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.cos((4 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.sin((4 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.cos((6 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.sin((6 * Math.PI) / 4) * (level / 5),
                        ].join(' ')}
                        className="dark:stroke-gray-700"
                      />
                    ))}
                    {/* 轴线 */}
                    {[0, 1, 2, 3].map((i) => (
                      <line
                        key={i}
                        x1="100"
                        y1="100"
                        x2={100 + 80 * Math.cos((i * 2 * Math.PI) / 4)}
                        y2={100 + 80 * Math.sin((i * 2 * Math.PI) / 4)}
                        className="dark:stroke-gray-700"
                      />
                    ))}
                  </g>
                  
                  {/* 数据多边形 */}
                  <polygon
                    points={[
                      100 + 80 * Math.cos(0) * 0.95,
                      100 + 80 * Math.sin(0) * 0.95,
                      100 + 80 * Math.cos((2 * Math.PI) / 4) * 0.90,
                      100 + 80 * Math.sin((2 * Math.PI) / 4) * 0.90,
                      100 + 80 * Math.cos((4 * Math.PI) / 4) * 0.85,
                      100 + 80 * Math.sin((4 * Math.PI) / 4) * 0.85,
                      100 + 80 * Math.cos((6 * Math.PI) / 4) * 0.80,
                      100 + 80 * Math.sin((6 * Math.PI) / 4) * 0.80,
                    ].join(' ')}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  
                  {/* 标签 */}
                  <g fontSize="12" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                    <text x="100" y="20">Java</text>
                    <text x="180" y="100">Spring Boot</text>
                    <text x="100" y="180">MySQL</text>
                    <text x="20" y="100">Redis</text>
                  </g>
                </svg>
              </div>
            </div>
            
            {/* 前端开发能力雷达图 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-center">前端开发能力</h3>
              <div className="aspect-square max-w-md mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* 雷达网格 */}
                  <g stroke="#e5e7eb" strokeWidth="1" fill="none">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <polygon
                        key={level}
                        points={[
                          100 + 80 * Math.cos(0) * (level / 5),
                          100 + 80 * Math.sin(0) * (level / 5),
                          100 + 80 * Math.cos((2 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.sin((2 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.cos((4 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.sin((4 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.cos((6 * Math.PI) / 4) * (level / 5),
                          100 + 80 * Math.sin((6 * Math.PI) / 4) * (level / 5),
                        ].join(' ')}
                        className="dark:stroke-gray-700"
                      />
                    ))}
                    {/* 轴线 */}
                    {[0, 1, 2, 3].map((i) => (
                      <line
                        key={i}
                        x1="100"
                        y1="100"
                        x2={100 + 80 * Math.cos((i * 2 * Math.PI) / 4)}
                        y2={100 + 80 * Math.sin((i * 2 * Math.PI) / 4)}
                        className="dark:stroke-gray-700"
                      />
                    ))}
                  </g>
                  
                  {/* 数据多边形 */}
                  <polygon
                    points={[
                      100 + 80 * Math.cos(0) * 0.90,
                      100 + 80 * Math.sin(0) * 0.90,
                      100 + 80 * Math.cos((2 * Math.PI) / 4) * 0.85,
                      100 + 80 * Math.sin((2 * Math.PI) / 4) * 0.85,
                      100 + 80 * Math.cos((4 * Math.PI) / 4) * 0.80,
                      100 + 80 * Math.sin((4 * Math.PI) / 4) * 0.80,
                      100 + 80 * Math.cos((6 * Math.PI) / 4) * 0.75,
                      100 + 80 * Math.sin((6 * Math.PI) / 4) * 0.75,
                    ].join(' ')}
                    fill="rgba(139, 92, 246, 0.2)"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                  
                  {/* 标签 */}
                  <g fontSize="12" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                    <text x="100" y="20">Vue3</text>
                    <text x="180" y="100">JavaScript</text>
                    <text x="100" y="180">CSS/Tailwind</text>
                    <text x="20" y="100">React</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 在校荣誉 */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-10">在校荣誉</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">ACM CCPC 省级铜奖</h3>
            <p className="text-gray-600 dark:text-gray-300">算法竞赛奖项，展示了扎实的编程基础和问题解决能力</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">蓝桥杯 Java 开发 省级二等奖</h3>
            <p className="text-gray-600 dark:text-gray-300">Java 开发竞赛奖项，展示了 Java 编程能力</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">全国大学生数学建模竞赛 省级一等奖</h3>
            <p className="text-gray-600 dark:text-gray-300">数学建模竞赛奖项，展示了数据分析和建模能力</p>
          </div>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-10">联系方式</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="secondary">
            <a href="mailto:example@example.com" className="flex items-center gap-2">
              <Mail size={16} />
              发送邮件
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com" className="flex items-center gap-2">
              <Github size={16} />
              GitHub
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://linkedin.com" className="flex items-center gap-2">
              <Linkedin size={16} />
              LinkedIn
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
