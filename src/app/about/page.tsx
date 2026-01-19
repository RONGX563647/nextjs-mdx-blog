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
        <h1>关于我</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl">
          我是一名测试开发工程师，专注于自动化测试、接口测试和性能测试，
          拥有扎实的后端技术基础，能够为项目提供全面的测试解决方案。
        </p>
      </section>

      {/* Personal Info */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-10">个人信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium">期望地点</h3>
                <p className="text-gray-600 dark:text-gray-300">福州</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium">邮箱</h3>
                <p className="text-gray-600 dark:text-gray-300">example@example.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium">电话</h3>
                <p className="text-gray-600 dark:text-gray-300">138****1234</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium">教育背景</h3>
                <p className="text-gray-600 dark:text-gray-300">福建师范大学 · 软件工程（本科）</p>
                <p className="text-gray-600 dark:text-gray-300">2024.09-2028.06</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">核心优势</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <span>扎实的编码与逻辑能力（支撑测试脚本/工具开发）</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <span>熟悉接口测试、性能测试、UI自动化测试流程</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <span>精通 JUnit5/TestNG 编写 Java 单元测试</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <span>掌握 JMeter 设计性能测试场景</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <span>熟悉 Spring Boot、Spring Cloud 框架</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-10">技能清单</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Testing Skills */}
          <div>
            <h3 className="font-semibold text-lg mb-6">测试核心能力</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>接口自动化测试</span>
                  <span>95%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>单元测试</span>
                  <span>90%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>性能测试</span>
                  <span>85%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>测试工具开发</span>
                  <span>80%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Technical Skills */}
          <div>
            <h3 className="font-semibold text-lg mb-6">技术支撑</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Java</span>
                  <span>90%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Spring Boot</span>
                  <span>85%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>MySQL</span>
                  <span>80%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Linux</span>
                  <span>75%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '75%' }}></div>
                </div>
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
