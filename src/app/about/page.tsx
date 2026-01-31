/**
 * 关于页面组件
 * 展示个人介绍、个人信息、经历时间轴、技能雷达图、在校荣誉和联系方式
 */

// 导入必要的组件和工具
import { WEBSITE_HOST_URL } from '@/lib/constants' // 网站主机URL
import type { Metadata } from 'next' // Next.js元数据类型
import { Button } from '@/components/ui/button' // 按钮组件
import { Github, GitMerge, Linkedin, Mail, Phone, MapPin, Award } from 'lucide-react' // 图标组件
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
            我是一名全栈开发工程师，专注于Java后端和Vue3前端技术栈，
            拥有扎实的前后端开发基础，能够独立完成从需求分析到部署上线的全流程开发。
          </p>
          
          {/* 社交链接 */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button asChild variant="secondary" className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border-blue-600/30">
              <a href="mailto:lrx563647@qq.com" className="flex items-center gap-2">
                <Mail size={18} />
                发送邮件
              </a>
            </Button>
            <Button asChild variant="secondary" className="bg-gradient-to-r from-gray-800/10 to-gray-600/10 hover:from-gray-800/20 hover:to-gray-600/20 border-gray-600/30">
              <a href="https://github.com/RONGX563647" className="flex items-center gap-2">
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
                  <p className="text-gray-600 dark:text-gray-300">lrx563647@qq.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">电话</h3>
                  <p className="text-gray-600 dark:text-gray-300">18876381526</p>
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
                  <span>Java基础知识扎实，了解JUC/JVM，熟悉SSM、Spring Boot、Spring Cloud等后端框架</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>熟悉Vue3生态，掌握Composition API、Pinia状态管理、Vue Router路由等前端技术</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>掌握MySQL、Redis等数据库技术，了解SQL优化和缓存设计</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>熟悉Linux操作系统，掌握Docker容器化技术和基本的服务器部署运维技能</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>具备完整的项目开发经验，能够独立完成从需求分析到部署上线的全流程开发</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 主要时间轴（左侧，宽度为2/3） */}
            <div className="md:col-span-2">
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
                        <div className="mt-4 flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <a href="https://gitee.com" className="flex items-center gap-2">
                          <GitMerge size={14} />
                          Gitee
                        </a>
                      </Button>
                    </div>
                      </div>
                    </div>
                    <div className="md:w-1/2 md:pl-12"></div>
                  </div>
                  
                  {/* 项目经历1：福师畅聊 - 全栈开发 */}
                  <div className="relative flex flex-col md:flex-row items-start">
                    <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-purple-600 dark:bg-purple-400 transform md:translate-x-[-50%] z-10"></div>
                    <div className="md:w-1/2 md:pr-12"></div>
                    <div className="md:w-1/2 md:pl-12">
                      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">2025.08 - 2025.10</span>
                        <h3 className="text-xl font-semibold mt-2 mb-2">福师畅聊</h3>
                        <p className="text-gray-600 dark:text-gray-300">全栈开发工程师</p>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">基于Java + Vue3技术栈开发的即时通讯应用，使用Netty实现长连接，Spring Boot构建后端API，Vue3 + Element Plus实现前端界面，支持实时消息推送和群聊功能</p>
                        <div className="mt-4 flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <a href="https://gitee.com" className="flex items-center gap-2">
                          <GitMerge size={14} />
                          Gitee
                        </a>
                      </Button>
                    </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 项目经历2：师大云学 - 全栈开发 */}
                  <div className="relative flex flex-col md:flex-row items-start">
                    <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-green-600 dark:bg-green-400 transform md:translate-x-[-50%] z-10"></div>
                    <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
                      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">2025.07 - 2025.09</span>
                        <h3 className="text-xl font-semibold mt-2 mb-2">师大云学</h3>
                        <p className="text-gray-600 dark:text-gray-300">全栈开发工程师</p>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">基于Java + Vue3技术栈开发的在线教育平台，使用Spring Boot + MyBatis Plus构建后端，Vue3 + Vite实现前端，支持课程管理、在线学习、考试测评等功能</p>
                        <div className="mt-4 flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <a href="https://gitee.com" className="flex items-center gap-2">
                          <GitMerge size={14} />
                          Gitee
                        </a>
                      </Button>
                    </div>
                      </div>
                    </div>
                    <div className="md:w-1/2 md:pl-12"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 副时间轴（右侧，宽度为1/3） */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold mb-6">技术发展历程</h3>
              <div className="relative">
                {/* 副时间轴线 */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                
                {/* 副时间轴项目 */}
                <div className="space-y-8 pl-6">
                  {/* 洛谷oj 50题 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">2024.10.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">洛谷oj</h4>
                      <p className="text-gray-600 dark:text-gray-300">50题</p>
                    </div>
                  </div>
                  
                  {/* Leetcode oc100题 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">2024.12.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">Leetcode</h4>
                      <p className="text-gray-600 dark:text-gray-300">oc100题</p>
                    </div>
                  </div>
                  
                  {/* 软件工程实践课项目 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">2025.6.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">软件工程实践课项目</h4>
                      <p className="text-gray-600 dark:text-gray-300">银行管理系统</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">java + jdbc + swing</p>
                      <div className="mt-3 flex gap-2">
                        <Button asChild variant="secondary" size="sm">
                          <a href="https://gitee.com" className="flex items-center gap-2">
                            <GitMerge size={12} />
                            Gitee
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* CSDN 10w浏览量 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-green-500 dark:bg-green-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-green-600 dark:text-green-400 font-semibold">2025.10.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">CSDN</h4>
                      <p className="text-gray-600 dark:text-gray-300">10w浏览量</p>
                    </div>
                  </div>
                  
                  {/* 计算机网络实践课项目 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-orange-600 dark:text-orange-400 font-semibold">2025.11.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">计算机网络实践课项目</h4>
                      <p className="text-gray-600 dark:text-gray-300">局域网聊天室</p>
                      <div className="mt-3 flex gap-2">
                        <Button asChild variant="secondary" size="sm">
                          <a href="https://gitee.com" className="flex items-center gap-2">
                            <GitMerge size={12} />
                            Gitee
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 数据库实践课项目 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-teal-500 dark:bg-teal-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-teal-600 dark:text-teal-400 font-semibold">2025.12.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">数据库实践课项目</h4>
                      <p className="text-gray-600 dark:text-gray-300">CMP管理系统</p>
                      <div className="mt-3 flex gap-2">
                        <Button asChild variant="secondary" size="sm">
                          <a href="https://gitee.com" className="flex items-center gap-2">
                            <GitMerge size={12} />
                            Gitee
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Web应用开发课项目 */}
                  <div className="relative">
                    <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-pink-500 dark:bg-pink-400"></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-sm text-pink-600 dark:text-pink-400 font-semibold">2026.1</span>
                      <h4 className="text-lg font-semibold mt-2 mb-2">Web应用开发课项目</h4>
                      <p className="text-gray-600 dark:text-gray-300">简易Mybatis</p>
                      <div className="mt-3 flex gap-2">
                        <Button asChild variant="secondary" size="sm">
                          <a href="https://gitee.com" className="flex items-center gap-2">
                            <GitMerge size={12} />
                            Gitee
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
            {/* 后端技术能力雷达图 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-center">后端技术能力</h3>
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
                  <g fontSize="11" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                    <text x="100" y="25">Java</text>
                    <text x="175" y="100">Spring Boot</text>
                    <text x="100" y="175">MySQL</text>
                    <text x="25" y="100">Linux</text>
                  </g>
                </svg>
              </div>
            </div>
            
            {/* 前端技术能力雷达图 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-center">前端技术能力</h3>
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
                    fill="rgba(139, 92, 246, 0.2)"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                  
                  {/* 标签 */}
                  <g fontSize="11" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                    <text x="100" y="25">Vue3</text>
                    <text x="175" y="100">JavaScript</text>
                    <text x="100" y="175">CSS3</text>
                    <text x="25" y="100">HTML5</text>
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
            <a href="mailto:lrx563647@qq.com" className="flex items-center gap-2">
              <Mail size={16} />
              发送邮件
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/RONGX563647" className="flex items-center gap-2">
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
