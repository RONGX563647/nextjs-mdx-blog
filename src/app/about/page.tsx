import { WEBSITE_HOST_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Mail, Phone, MapPin, Award } from 'lucide-react'
import Link from 'next/link'

const meta = {
  title: '关于我',
  description: '测试开发工程师 | 自动化测试 | 接口/性能测试 | 后端技术支撑',
  url: `${WEBSITE_HOST_URL}/about`,
}

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

export default function About() {
  return (
    <div>
      {/* About Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">关于我</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            我是一名测试开发工程师，专注于自动化测试、接口测试和性能测试，
            拥有扎实的后端技术基础，能够为项目提供全面的测试解决方案。
          </p>
          
          {/* Social Links */}
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

      {/* Personal Info */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">个人信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
            <div className="space-y-6">
              <h3 className="font-semibold text-xl">核心优势</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>扎实的编码与逻辑能力（支撑测试脚本/工具开发）</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>熟悉接口测试、性能测试、UI自动化测试流程</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>精通 JUnit5/TestNG 编写 Java 单元测试</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>掌握 JMeter 设计性能测试场景</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span>熟悉 Spring Boot、Spring Cloud 框架</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">经历时间轴</h2>
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-600/20 dark:bg-blue-400/20 transform md:translate-x-[-50%]"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {/* Education Item */}
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
              
              {/* Project Experience 1 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-purple-600 dark:bg-purple-400 transform md:translate-x-[-50%] z-10"></div>
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">2025.08 - 2025.10</span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">福师畅聊</h3>
                    <p className="text-gray-600 dark:text-gray-300">测试开发工程师</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责测试开发工作</p>
                  </div>
                </div>
              </div>
              
              {/* Project Experience 2 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full bg-green-600 dark:bg-green-400 transform md:translate-x-[-50%] z-10"></div>
                <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">2025.07 - 2025.09</span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">师大云学</h3>
                    <p className="text-gray-600 dark:text-gray-300">测试开发工程师</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">基于 Spring Cloud Alibaba 开发的在线教育平台，负责测试开发工作</p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Radar Chart */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">技能雷达图</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Testing Skills Radar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-center">测试核心能力</h3>
              <div className="aspect-square max-w-md mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Radar Grid */}
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
                    {/* Axes */}
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
                  
                  {/* Data Polygon */}
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
                  
                  {/* Labels */}
                  <g fontSize="12" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                    <text x="100" y="20">接口自动化</text>
                    <text x="180" y="100">单元测试</text>
                    <text x="100" y="180">性能测试</text>
                    <text x="20" y="100">测试工具开发</text>
                  </g>
                </svg>
              </div>
            </div>
            
            {/* Technical Skills Radar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-center">技术支撑</h3>
              <div className="aspect-square max-w-md mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Radar Grid */}
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
                    {/* Axes */}
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
                  
                  {/* Data Polygon */}
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
                  
                  {/* Labels */}
                  <g fontSize="12" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                    <text x="100" y="20">Java</text>
                    <text x="180" y="100">Spring Boot</text>
                    <text x="100" y="180">MySQL</text>
                    <text x="20" y="100">Linux</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
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

      {/* Contact Section */}
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
