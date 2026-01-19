import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { allPosts } from 'contentlayer/generated'
import { compareDesc } from 'date-fns'
import { Github, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date)),
  )

  return (
    <div>
      {/* Hero Section */}
      <section className="py-40 text-center">
        <div className="max-w-4xl mx-auto">
          {/* 3D Text Animation */}
          <div className="mb-12">
            <h1 className="font-bold tracking-tight mb-6 animate-3d-pop">
              <span className="text-4xl md:text-5xl lg:text-6xl">你好，我是</span>
              <span className="mx-2 text-6xl md:text-7xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">RONGX</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              测试开发工程师 | 自动化测试 | 接口/性能测试 |
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/about">了解更多</Link>
            </Button>
            <Button asChild variant="outline" className="text-lg px-10 py-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 hover:bg-white/5 dark:hover:bg-gray-800/50 transition-all duration-300">
              <Link href="/portfolio">查看项目</Link>
            </Button>
            <Button asChild variant="secondary" className="text-lg px-10 py-6 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
              <a href="#" className="flex items-center gap-2">
                <Download size={20} />
                下载简历
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <h2 className="text-3xl font-semibold tracking-tight mb-6">
          精选项目
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
          以下是我参与开发的一些代表性项目，展示了我的技术能力和实践经验。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">福师畅聊 - 测试开发</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责测试开发工作。
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">Spring Boot</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">Netty</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm">Redis</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm">测试开发</span>
            </div>
            <Button asChild variant="ghost" className="text-blue-600 dark:text-blue-400">
              <a href="/portfolio/福师畅聊" className="flex items-center gap-1">
                查看详情
                <ExternalLink size={14} />
              </a>
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">师大云学 - 测试开发</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              基于 Spring Cloud Alibaba 开发的在线教育平台，负责测试开发工作。
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">Spring Cloud</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">MySQL</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm">RabbitMQ</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm">测试开发</span>
            </div>
            <Button asChild variant="ghost" className="text-blue-600 dark:text-blue-400">
              <a href="/portfolio/师大云学" className="flex items-center gap-1">
                查看详情
                <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold tracking-tight mb-6">
          博客文章
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
          分享我的技术学习心得和项目经验。
        </p>
        <div className="space-y-12">
          {posts.map((post, idx) => (
            <PostCard key={idx} {...post} />
          ))}
        </div>
      </section>
    </div>
  )
}
