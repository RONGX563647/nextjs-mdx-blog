'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Code,
  BookOpen,
  Award,
  Mail,
  Phone,
  Github,
  Globe,
  MapPin,
  Download,
  Database,
  Server,
  Shield,
  Cpu,
  Layers,
  MessageSquare,
  ArrowRight,
  Target,
  Zap,
  CheckCircle2,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { profileConfig } from '@/data/profile'
import { projects } from '@/data/projects'

export default function InterviewPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const router = useRouter()

  // Restore slide index from sessionStorage on mount
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('interview-slide-index')
    if (savedIndex) {
      sessionStorage.removeItem('interview-slide-index')
      setCurrentSlide(parseInt(savedIndex, 10))
    }
  }, [])

  const slides = [
    { id: 'cover', title: '封面' },
    { id: 'intro', title: '自我介绍' },
    { id: 'projects-overview', title: '项目概览' },
    { id: 'project4', title: 'Hutool开源' },
    { id: 'project3', title: 'LightSSM' },
    { id: 'project2', title: '智能插座' },
    { id: 'project1', title: '不二价' },
    { id: 'tech-skills', title: '技术能力总结' },
    { id: 'contact', title: '联系方式' },
  ]

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen()
        }
      } catch (err) {
        console.log('无法进入全屏:', err)
      }
    }
    const timer = setTimeout(enterFullscreen, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length])

  const handleClick = (e: React.MouseEvent) => {
    const width = window.innerWidth
    const clickX = e.clientX
    if (clickX > width / 2) {
      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
    } else {
      setCurrentSlide((prev) => Math.max(prev - 1, 0))
    }
  }

  const handleNavigateToDetail = (e: React.MouseEvent, projectId: string, slideIndex: number | 'auto') => {
    e.stopPropagation()
    // Determine actual slide index
    const actualIndex = slideIndex === 'auto' ? currentSlide : slideIndex
    // Save current slide index to sessionStorage
    sessionStorage.setItem('interview-slide-index', String(actualIndex))
    router.push(`/interview-detail/${projectId}`)
  }

  return (
    <div
      className="min-h-screen bg-white text-gray-900 overflow-hidden cursor-pointer select-none"
      onClick={handleClick}
    >
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-100 px-6 py-3 rounded-full text-sm text-gray-600 flex items-center gap-4 shadow-sm"
        >
          <span>← 左侧点击回退</span>
          <span className="w-px h-4 bg-gray-300" />
          <span>右侧点击前进 →</span>
          <span className="w-px h-4 bg-gray-300" />
          <span>键盘 ← → 翻页</span>
        </motion.div>
      )}

      <div className="fixed bottom-4 right-6 z-40 text-sm text-gray-400">
        {currentSlide + 1} / {slides.length}
      </div>

      <div className="h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="h-full container mx-auto px-8 lg:px-16"
          >
            {currentSlide === 0 && <CoverSlide />}
            {currentSlide === 1 && <IntroSlide />}
            {currentSlide === 2 && <ProjectsOverviewSlide />}
            {currentSlide === 3 && <Project4Slide onNavigateToDetail={handleNavigateToDetail} />}
            {currentSlide === 4 && <Project3Slide onNavigateToDetail={handleNavigateToDetail} />}
            {currentSlide === 5 && <Project2Slide onNavigateToDetail={handleNavigateToDetail} />}
            {currentSlide === 6 && <Project1Slide onNavigateToDetail={handleNavigateToDetail} />}
            {currentSlide === 7 && <TechSkillsSlide />}
            {currentSlide === 8 && <ContactSlide />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function CoverSlide() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-28 h-28 mx-auto bg-orange-100 rounded-full flex items-center justify-center"
        >
          <User size={56} className="text-orange-500" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-gray-900"
        >
          {profileConfig.name}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-gray-600"
        >
          {profileConfig.title}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-6 text-gray-500"
        >
          <span className="flex items-center gap-2">
            <MapPin size={18} />
            {profileConfig.contact.location}
          </span>
          <span className="flex items-center gap-2">
            <Mail size={18} />
            {profileConfig.contact.email}
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-8"
        >
          <a
            href={profileConfig.resume.pdfPath}
            download={profileConfig.resume.fileName}
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all hover:scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={20} />
            下载简历
          </a>
        </motion.div>
      </div>
    </div>
  )
}

function IntroSlide() {
  return (
    <div className="h-full flex items-center">
      <div className="space-y-10">
        <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-5xl font-bold text-gray-900"
        >
          自我介绍
        </motion.h2>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-2xl font-semibold mb-4 text-orange-600">个人简介</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {profileConfig.bio}
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                {profileConfig.subBio}
              </p>
            </div>

            <div className="p-8 bg-orange-50 rounded-2xl border border-orange-100">
              <h3 className="text-2xl font-semibold mb-4 text-orange-600">教育背景</h3>
              <p className="text-gray-700 text-lg">{profileConfig.education.school}</p>
              <p className="text-gray-600 mt-1">{profileConfig.education.major}</p>
              <p className="text-gray-500 mt-1">{profileConfig.education.period}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-xl font-semibold mb-3 flex items-center gap-2 text-orange-600">
                <Code size={20} />
                技术方向
              </h4>
              <p className="text-gray-700">
                Java 后端开发为主，熟悉微服务架构、分布式系统设计，具备 IoT、AI 工程化落地实战经验。
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-xl font-semibold mb-3 flex items-center gap-2 text-orange-600">
                <Award size={20} />
                荣誉奖项
              </h4>
              <ul className="space-y-2 text-gray-700">
                {profileConfig.honors.slice(0, 3).map((honor, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 mt-2 bg-orange-500 rounded-full flex-shrink-0" />
                    <span>{honor.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-xl font-semibold mb-3 flex items-center gap-2 text-orange-600">
                <BookOpen size={20} />
                核心优势
              </h4>
              <p className="text-gray-700">
                扎实的 Java 基础，深入理解 JVM、并发编程；熟练 Spring Cloud 微服务生态；掌握 Redis、RabbitMQ 等中间件。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ProjectsOverviewSlide() {
  const projectData = [
    {
      name: 'Hutool 开源贡献',
      icon: <Code size={24} />,
      desc: 'GVP 顶级 Java 工具包',
      tech: ['Word 模板', 'PDF 生成', 'Bug 修复'],
      highlight: 'Gitee 开源项目贡献',
    },
    {
      name: 'LightSSM',
      icon: <Cpu size={24} />,
      desc: '轻量级 Spring 框架复刻',
      tech: ['Java', 'IoC', 'AOP', 'ORM'],
      highlight: '深入理解 Spring 原理',
    },
    {
      name: '智能插座系统',
      icon: <Zap size={24} />,
      desc: 'IoT 电力设备管理平台',
      tech: ['Java 21', 'MQTT', 'RabbitMQ', 'Redis'],
      highlight: '千级设备并发 + 5x 吞吐提升',
    },
    {
      name: '不二价',
      icon: <Layers size={24} />,
      desc: '校园二手交易平台',
      tech: ['Spring Cloud', 'Redis', 'RabbitMQ', 'Spring AI'],
      highlight: '高并发秒杀 + AI 客服',
    },
  ]

  return (
    <div className="h-full flex items-center">
      <div className="space-y-8">
        <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-5xl font-bold text-gray-900"
        >
          项目概览
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600"
        >
          从校园应用到 IoT 平台，从自研框架到开源贡献，每个项目都包含完整的技术实践
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {projectData.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-300 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                  {project.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{project.name}</h3>
                  <p className="text-gray-600">{project.desc}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-800 font-medium">✨ {project.highlight}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function Project1Slide({ onNavigateToDetail }: { onNavigateToDetail: (e: React.MouseEvent, id: string, slideIndex: number | 'auto') => void }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 固定头部 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">不二价</span>
            <span className="text-sm text-orange-500">校园二手交易平台</span>
          </div>
          <button
            onClick={(e) => onNavigateToDetail(e, 'bu-er-jia', 6)}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <ExternalLink size={16} />
            查看详细架构
          </button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            校园二手交易平台，解决学生闲置物品流转痛点，支持高并发秒杀和 AI 智能客服
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-red-600" />
                <h3 className="text-base font-bold text-red-700">核心痛点</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">秒杀场景库存超卖</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">分布式事务一致性</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">人工客服响应慢</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">校外用户混入</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-orange-600" />
                <h3 className="text-base font-bold text-orange-700">解决方案</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">Redis Lua 原子扣减</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">Seata AT 分布式事务</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">Spring AI 智能客服</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">身份认证 + 地理围栏</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-green-600" />
                <h3 className="text-base font-bold text-green-700">技术成果</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">库存超卖率 0%</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">事务 100% 一致性</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">AI 客服覆盖率 60%</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">100% 校内用户</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-base font-semibold mb-3 text-orange-600 flex items-center gap-2">
              <Server size={16} />
              架构设计
            </h3>
            <div className="space-y-2">
              {/* 客户端层 */}
              <div className="flex justify-center">
                <div className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                  Vue3 + Element Plus 客户端
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 网关层 */}
              <div className="flex justify-center">
                <div className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                  Gateway 网关（鉴权 + 路由 + 限流）
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 微服务层 */}
              <div className="grid grid-cols-5 gap-2">
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-center">
                  <div className="text-xs font-medium text-green-800">用户服务</div>
                  <div className="text-xs text-gray-500">认证 + 资料</div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-center">
                  <div className="text-xs font-medium text-green-800">商品服务</div>
                  <div className="text-xs text-gray-500">发布 + 搜索</div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-center">
                  <div className="text-xs font-medium text-green-800">订单服务</div>
                  <div className="text-xs text-gray-500">秒杀 + 交易</div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-center">
                  <div className="text-xs font-medium text-green-800">支付服务</div>
                  <div className="text-xs text-gray-500">订单支付</div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-center">
                  <div className="text-xs font-medium text-green-800">AI 服务</div>
                  <div className="text-xs text-gray-500">智能客服</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 中间件层 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-medium text-orange-800">Nacos</div>
                  <div className="text-xs text-gray-500">服务注册 + 配置中心</div>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-medium text-orange-800">OpenFeign</div>
                  <div className="text-xs text-gray-500">声明式服务调用</div>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-medium text-orange-800">Sentinel</div>
                  <div className="text-xs text-gray-500">限流 + 熔断降级</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 分布式事务 */}
              <div className="flex justify-center">
                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200 text-center">
                  <div className="text-xs font-medium text-yellow-800">Seata AT</div>
                  <div className="text-xs text-gray-500">分布式事务（订单+库存一致性）</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 全链路追踪 */}
              <div className="flex justify-center">
                <div className="bg-teal-50 p-2 rounded-lg border border-teal-200 text-center">
                  <div className="text-xs font-medium text-teal-800">Sleuth + SkyWalking</div>
                  <div className="text-xs text-gray-500">全链路追踪 + 分布式可观测性</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 消息与实时通信层 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-purple-50 p-2 rounded-lg border border-purple-200 text-center">
                  <div className="text-xs font-medium text-purple-800">RabbitMQ</div>
                  <div className="text-xs text-gray-500">订单超时 + 异步通知</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg border border-purple-200 text-center">
                  <div className="text-xs font-medium text-purple-800">WebSocket</div>
                  <div className="text-xs text-gray-500">实时聊天 + 订单推送</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 缓存层 */}
              <div className="flex justify-center">
                <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                  <div className="text-xs font-medium text-red-800">Redis</div>
                  <div className="text-xs text-gray-500">秒杀库存 + 分布式锁 + 缓存 + Lua 脚本</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* AI 能力层 */}
              <div className="flex justify-center">
                <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200 text-center">
                  <div className="text-xs font-medium text-indigo-800">Spring AI + RAG</div>
                  <div className="text-xs text-gray-500">Embedding + 向量检索 + 知识库</div>
                </div>
              </div>
              <div className="flex justify-center text-orange-400 text-sm">↓</div>
              
              {/* 数据存储层 */}
              <div className="flex justify-center">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs font-medium text-gray-800">MySQL</div>
                  <div className="text-xs text-gray-500">主数据库（联合索引优化）</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Spring Cloud Alibaba</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Redis + Lua</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Spring AI</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">WebSocket</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Seata AT</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Sentinel</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Project2Slide({ onNavigateToDetail }: { onNavigateToDetail: (e: React.MouseEvent, id: string, slideIndex: number | 'auto') => void }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 固定头部 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">智能插座系统</span>
            <span className="text-sm text-orange-500">IoT 电力设备管理平台</span>
          </div>
          <button
            onClick={(e) => onNavigateToDetail(e, 'smart-socket', 5)}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <ExternalLink size={16} />
            查看详细架构
          </button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {/* 教学文档链接 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-blue-800 mb-2">📚 完整教学文档与源码</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-medium">📖 教学文档：</span>
                    <a
                      href="https://rongx563647.github.io/dorm-power-console/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      https://rongx563647.github.io/dorm-power-console/index.html
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-medium">💻 GitHub 源码：</span>
                    <a
                      href="https://github.com/RONGX563647/dorm-power-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      https://github.com/RONGX563647/dorm-power-console
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <span className="font-medium">📝 教学特色：</span>
                    <span>目标导向 · 分步实操 · 完整代码 · 联调验证</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            基于 Java 21 虚拟线程 + MQTT + RabbitMQ 的实时监控与智能告警平台，支持 10,000+ 设备并发
          </p>

          {/* 核心痛点 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-red-600" />
                <h3 className="text-base font-bold text-red-700">核心痛点</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">千级设备并发连接 OOM</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">设备批量上报阻塞</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">接口响应慢（&gt;500ms）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">恶意请求缺乏防护</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-orange-600" />
                <h3 className="text-base font-bold text-orange-700">解决方案</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">Java 21 虚拟线程（10,000+ 并发）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">RabbitMQ 异步链路（10 倍吞吐）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">Caffeine+Redis 多级缓存（95% 命中）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">Redis+Lua 分布式限流（10,000+ QPS）</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-green-600" />
                <h3 className="text-base font-bold text-green-700">性能指标</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">10,000+ 设备并发接入</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">系统吞吐提升 10 倍</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">接口响应 &lt;50ms</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">QPS 承载 10,000+</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 层级架构图 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-base font-semibold mb-4 text-orange-600 flex items-center gap-2">
              <Server size={16} />
              系统架构设计（层级视图）
            </h3>
            
            {/* 第一层：客户端层 */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">【客户端层】</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <div className="text-sm font-semibold text-blue-800">Vue 3 Web</div>
                  <div className="text-xs text-gray-600">管理后台</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <div className="text-sm font-semibold text-blue-800">UniApp</div>
                  <div className="text-xs text-gray-600">移动端</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <div className="text-sm font-semibold text-blue-800">IoT 设备</div>
                  <div className="text-xs text-gray-600">智能插座</div>
                </div>
              </div>
            </div>

            {/* 第二层：网关层 */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">【网关层】</div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <div className="text-sm font-semibold text-green-800">Nginx 反向代理</div>
                <div className="text-xs text-gray-600">负载均衡 + SSL + 静态资源</div>
              </div>
            </div>

            {/* 第三层：应用服务层 */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">【应用服务层】</div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-semibold text-purple-800 mb-1">JWT 认证</div>
                  <div className="text-xs text-gray-600">Redis 黑名单</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-semibold text-purple-800 mb-1">WebSocket</div>
                  <div className="text-xs text-gray-600">JUC 并发管理</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-semibold text-purple-800 mb-1">MQTT Bridge</div>
                  <div className="text-xs text-gray-600">虚拟线程桥接</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-semibold text-purple-800 mb-1">RabbitMQ</div>
                  <div className="text-xs text-gray-600">异步解耦</div>
                </div>
              </div>
            </div>

            {/* 第四层：核心服务层 */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">【核心服务层】</div>
              <div className="grid grid-cols-5 gap-2">
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-semibold text-orange-800">AOP 限流</div>
                  <div className="text-xs text-gray-600">Redis+Lua</div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-semibold text-orange-800">AOP 审计</div>
                  <div className="text-xs text-gray-600">审计日志</div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-semibold text-orange-800">多级缓存</div>
                  <div className="text-xs text-gray-600">Caffeine+Redis</div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-semibold text-orange-800">JPA 批量</div>
                  <div className="text-xs text-gray-600">联合索引</div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <div className="text-xs font-semibold text-orange-800">PBKDF2</div>
                  <div className="text-xs text-gray-600">加盐哈希</div>
                </div>
              </div>
            </div>

            {/* 第五层：监控与数据层 */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">【监控与数据层】</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <div className="text-sm font-semibold text-red-800">Prometheus</div>
                  <div className="text-xs text-gray-600">11 类指标</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <div className="text-sm font-semibold text-red-800">Grafana</div>
                  <div className="text-xs text-gray-600">8 个监控面板</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <div className="text-sm font-semibold text-red-800">MySQL</div>
                  <div className="text-xs text-gray-600">联合索引优化</div>
                </div>
              </div>
            </div>
          </div>

          {/* IoT 系统架构图 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-base font-semibold mb-3 text-orange-600 flex items-center gap-2">
              <Server size={16} />
              IoT 系统界面展示
            </h3>
            <div className="flex justify-center">
              <img
                src="/images/iot/bf200fe1a101176eb27b44e1e5beabeb.jpg"
                alt="IoT 智能插座系统界面"
                className="max-w-[600px] w-full rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
          </div>

          {/* 10 大技术亮点 */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-4">
            <h3 className="text-base font-semibold mb-3 text-orange-700 flex items-center gap-2">
              <Award size={16} />
              10 大核心技术亮点
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">分布式 JWT+Redis 黑名单</div>
                  <div className="text-gray-600">Redis SETNX+EX 原子操作</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">RBAC 细粒度权限模型</div>
                  <div className="text-gray-600">接口级 + 方法级 + 数据级</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">AOP 三大切面</div>
                  <div className="text-gray-600">限流 + 审计日志 + 异常治理</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">Redis+Lua 滑动窗口</div>
                  <div className="text-gray-600">10,000+ QPS（提升 100 倍）</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">Caffeine+Redis 多级缓存</div>
                  <div className="text-gray-600">命中率 95%</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">JPA 批量操作</div>
                  <div className="text-gray-600">联合索引 + 流式分页（&lt;50ms）</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">7</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">RabbitMQ 三大异步链路</div>
                  <div className="text-gray-600">吞吐提升 10 倍</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">8</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">Java 21 虚拟线程</div>
                  <div className="text-gray-600">10,000+ 并发连接</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">9</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">PBKDF2 加盐哈希</div>
                  <div className="text-gray-600">恒定时间比对防时序攻击</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">10</div>
                <div className="text-xs text-gray-800">
                  <div className="font-semibold">Prometheus+Grafana</div>
                  <div className="text-gray-600">11 类指标，8 个监控面板</div>
                </div>
              </div>
            </div>
          </div>

          {/* 技术标签 */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Java 21 虚拟线程</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">MQTT</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">RabbitMQ</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Caffeine+Redis</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Redis+Lua</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">JWT 认证</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">RBAC 权限</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">AOP 切面</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Prometheus+Grafana</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">PBKDF2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlipCard({ front, back }: {
  front: { title: string; items: string[] }
  back: { title: string; code: string; official: { core: string[]; pattern: string; key: string[] }; weaknesses: string[] }
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative h-80 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={(e) => {
        e.stopPropagation()
        setIsFlipped(!isFlipped)
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* 正面 */}
        <div
          className="absolute w-full h-full bg-white rounded-xl border border-gray-200 p-4 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <h3 className="text-base font-bold mb-3 text-orange-600">{front.title}</h3>
          <ul className="space-y-2">
            {front.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                <span className="text-gray-800">{item}</span>
              </li>
            ))}
          </ul>
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">点击翻转 →</div>
        </div>

        {/* 反面 */}
        <div
          className="absolute w-full h-full bg-gray-900 text-gray-200 rounded-xl border border-gray-700 p-4 overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-sm font-bold mb-2 text-orange-400">{back.title}</h3>
          <pre className="text-xs text-green-400 bg-black/30 p-2 rounded mb-2 font-mono overflow-x-auto">
            {back.code}
          </pre>
          
          <div className="text-xs text-blue-400 font-semibold mb-1 flex items-center gap-1">
            <BookOpen size={10} />
            官方 Spring 设计：
          </div>
          <div className="bg-blue-900/20 border border-blue-800 rounded p-2 mb-2">
            <div className="text-xs text-blue-300 font-semibold mb-1">核心类：</div>
            <div className="text-xs text-gray-300 mb-1">{back.official.core.join(' → ')}</div>
            <div className="text-xs text-blue-300 font-semibold mb-1">设计模式：</div>
            <div className="text-xs text-gray-300 mb-1">{back.official.pattern}</div>
            <div className="text-xs text-blue-300 font-semibold mb-1">关键机制：</div>
            <ul className="space-y-0.5">
              {back.official.key.map((o, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                  <div className="w-1 h-1 mt-1 bg-blue-400 rounded-full flex-shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-xs text-red-400 font-semibold mb-1">不足点：</div>
          <ul className="space-y-1">
            {back.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                <div className="w-1 h-1 mt-1 bg-red-400 rounded-full flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
          <div className="absolute bottom-2 right-3 text-xs text-gray-500">点击返回 ←</div>
        </div>
      </div>
    </div>
  )
}

function Project3Slide({ onNavigateToDetail }: { onNavigateToDetail: (e: React.MouseEvent, id: string, slideIndex: number | 'auto') => void }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 固定头部 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">LightSSM</span>
            <span className="text-sm text-orange-500">轻量级 Spring 框架复刻</span>
            <a
              href="https://rongx563647.github.io/LightSSM/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-all flex items-center gap-1"
            >
              <Globe size={12} />
              在线演示
            </a>
            <a
              href="https://blog.csdn.net/king_model/category_13130911.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-all flex items-center gap-1"
            >
              <BookOpen size={12} />
              系列博客
            </a>
          </div>
          <button
            onClick={(e) => onNavigateToDetail(e, 'light-ssm', 4)}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <ExternalLink size={16} />
            查看详细架构
          </button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            通过手写精简版 Spring + SpringMVC + MyBatis，深入理解框架核心设计思想
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FlipCard
              front={{
                title: '迷你 IOC 容器',
                items: [
                  '包扫描 + BeanDefinitionMap 注册',
                  '三级缓存解决循环依赖',
                  '@Component + @Autowired 注解注入',
                  '@Scope 单例/原型模式',
                ],
              }}
              back={{
                title: '核心代码设计',
                code: `DefaultListableBeanFactory {\n  singletonObjects(一级)\n  earlySingletonObjects(二级)\n  singletonFactories(三级)\n  getSingleton(): 逐级获取`,
                official: {
                  core: ['BeanDefinitionRegistry', 'DefaultListableBeanFactory', 'BeanPostProcessor', 'BeanWrapper'],
                  pattern: '工厂模式 + 模板方法 + 策略模式',
                  key: [
                    'BeanDefinition 存储 Bean 定义信息（scope、lazyInit、依赖）',
                    '三级缓存 + ObjectFactory 提前暴露引用解决循环依赖',
                    'BeanPostProcessor 提供 Bean 初始化前后扩展点',
                    'FactoryBean 允许自定义 Bean 创建逻辑',
                  ],
                },
                weaknesses: [
                  '未实现 BeanPostProcessor 完整生命周期',
                  '缺少 @Configuration 配置类处理（ConfigurationClassPostProcessor）',
                  '未支持 FactoryBean 和 BeanFactoryPostProcessor 扩展点',
                  '循环依赖仅限 setter 注入，不支持构造器注入循环依赖',
                ],
              }}
            />

            <FlipCard
              front={{
                title: '迷你 SpringMVC',
                items: [
                  'DispatcherServlet 核心分发器',
                  'HandlerMapping URL 映射表',
                  '@RequestMapping + @ResponseBody',
                  '@RequestParam + @PathVariable',
                ],
              }}
              back={{
                title: '核心代码设计',
                code: `DispatcherServlet {\n  doDispatch() {\n    getHandler()\n    getHandlerAdapter()\n    handle()\n    render()\n  }\n}`,
                official: {
                  core: ['DispatcherServlet', 'HandlerMapping', 'HandlerAdapter', 'ViewResolver', 'HandlerExceptionResolver'],
                  pattern: '前端控制器 + 策略模式 + 适配器模式',
                  key: [
                    'HandlerMapping 多种实现（注解/路径/正则）',
                    'HandlerAdapter 支持多种 Handler 类型（Method/Controller）',
                    'HandlerMethodArgumentResolver 支持 100+ 参数类型',
                    'HandlerExceptionResolver 统一异常处理（@ExceptionHandler）',
                  ],
                },
                weaknesses: [
                  '未实现拦截器链（HandlerInterceptor）',
                  '缺少视图解析器（ViewResolver）和视图渲染',
                  '参数绑定仅支持基础类型，不支持复杂对象和自定义类型转换器',
                  '异常处理机制不完善（无 @ExceptionHandler/@ControllerAdvice）',
                ],
              }}
            />

            <FlipCard
              front={{
                title: '迷你 AOP',
                items: [
                  'JDK/CGLIB 双代理自动切换',
                  '@Before + @After + @Around',
                  'AspectJ 表达式切入点',
                  '方法拦截器链织入',
                ],
              }}
              back={{
                title: '核心代码设计',
                code: `AopProxy {\n  if(接口) JDK else CGLIB\n  Advisor { Advice + Pointcut }\n  MethodInvocation.proceed()\n}`,
                official: {
                  core: ['ProxyFactory', 'Advisor', 'Advice', 'Pointcut', 'AopProxy'],
                  pattern: '代理模式 + 责任链 + 拦截器模式',
                  key: [
                    'ProxyFactory + BeanPostProcessor 实现自动代理',
                    'AdvisorChainFactory 构建拦截器调用链',
                    '@Transactional 基于 AOP 的声明式事务',
                    'ExposeInvocationInterceptor 暴露当前调用链',
                  ],
                },
                weaknesses: [
                  '未实现 Spring AOP 自动代理机制（InfrastructureAdvisorAutoProxyCreator）',
                  '不支持 @AspectJ 注解声明式切面（@Aspect/@Pointcut/@Around）',
                  '缺少事务管理集成（@Transactional + PlatformTransactionManager）',
                  '代理对象创建时机未优化（非懒加载，启动时创建）',
                ],
              }}
            />

            <FlipCard
              front={{
                title: '整合 MyBatis',
                items: [
                  'XML SQL 映射配置',
                  '动态 SQL（OGNL 表达式）',
                  '参数自动绑定 + ResultSet 映射',
                  '插件拦截器机制',
                ],
              }}
              back={{
                title: '核心代码设计',
                code: `SqlSessionFactory {\n  Configuration {\n    MappedStatement\n    TypeHandler\n  }\n  Executor { Simple/Reuse/Batch }\n}`,
                official: {
                  core: ['SqlSessionFactoryBuilder', 'Configuration', 'MappedStatement', 'Executor', 'SqlSession'],
                  pattern: '建造者模式 + 工厂模式 + 模板方法 + 代理模式',
                  key: [
                    '一级缓存 PerpetualCache（SqlSession 级别）',
                    '二级缓存 Ehcache/Redis（Mapper Namespace 级别）',
                    'PageHelper 分页插件基于拦截器自动拼接 LIMIT',
                    'Spring 事务集成 DataSourceTransactionManager',
                  ],
                },
                weaknesses: [
                  '未实现一级/二级缓存机制，每次查询直连数据库',
                  '动态 SQL 仅支持基础 if/foreach，不支持 choose/when/otherwise',
                  '缺少分页插件和 SQL 性能分析（Slow SQL 日志）',
                  '多数据源支持和事务集成不完善（无 @Transactional 整合）',
                ],
              }}
            />
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h3 className="text-base font-semibold mb-3 text-blue-700 flex items-center gap-2">
              <Cpu size={16} />
              三级缓存核心实现
            </h3>
            <pre className="text-xs text-gray-800 bg-white p-3 rounded-lg overflow-x-auto font-mono">
{`public class DefaultListableBeanFactory {
  // 一级缓存：完整 Bean
  private Map<String, Object> singletonObjects = new ConcurrentHashMap<>();
  // 二级缓存：早期引用
  private Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>();
  // 三级缓存：ObjectFactory
  private Map<String, ObjectFactory<?>> singletonFactories = new ConcurrentHashMap<>();
  
  protected Object getSingleton(String beanName) {
    Object obj = singletonObjects.get(beanName);
    if (obj == null && isSingletonCurrentlyInCreation(beanName)) {
      obj = earlySingletonObjects.get(beanName);
      if (obj == null) {
        ObjectFactory<?> factory = singletonFactories.get(beanName);
        if (factory != null) {
          obj = factory.getObject();
          earlySingletonObjects.put(beanName, obj);
          singletonFactories.remove(beanName);
        }
      }
    }
    return obj;
  }
}`}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">IOC/DI</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">三级缓存</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">AOP 双代理</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">SpringMVC</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">ORM 整合</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">动态 SQL</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Project4Slide({ onNavigateToDetail }: { onNavigateToDetail: (e: React.MouseEvent, id: string, slideIndex: number | 'auto') => void }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 固定头部 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">Hutool 开源贡献</span>
            <span className="text-sm text-orange-500">GVP 顶级 Java 工具包</span>
            <a
              href="https://gitee.com/chinabugotech/hutool/pulls/1439/files"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-all flex items-center gap-1"
            >
              <FileText size={12} />
              查看 PR
            </a>
          </div>
          <button
            onClick={(e) => onNavigateToDetail(e, 'hutool', 3)}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <ExternalLink size={16} />
            查看详细架构
          </button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            为 Hutool v7 贡献 Word 模板引擎和 PDF 生成功能（feature/word-pdf-converter 分支）
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="text-base font-bold mb-3 text-orange-600">Word 模板引擎</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">{'文本占位符 {{name}} 替换'}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">{'图片占位符 {{@logo}} 渲染'}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">{'表格占位符 {{#table}} 生成'}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">链式 API + 自定义配置</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="text-base font-bold mb-3 text-orange-600">PDF 生成工具</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">基于 OFD 中间格式转换方案</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">复用 ofdrw 库，无需新依赖</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">支持中文排版，转换质量有保障</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800">PdfWriter 链式 API 设计</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-base font-bold mb-3 text-blue-700">技术架构</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs font-semibold text-blue-800 mb-1">模块结构</div>
                <div className="text-xs text-gray-700">hutool-poi/word/template + pdf</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs font-semibold text-blue-800 mb-1">渲染器设计</div>
                <div className="text-xs text-gray-700">接口 + 三种实现（文本/图片/表格）</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs font-semibold text-blue-800 mb-1">测试覆盖</div>
                <div className="text-xs text-gray-700">7 个测试类，覆盖核心功能</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h3 className="text-base font-bold mb-3 text-green-700">提交记录</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs font-semibold text-green-800 mb-1">995e681f6</div>
                <div className="text-xs text-gray-700">Word 模板引擎基础功能</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs font-semibold text-green-800 mb-1">276b7ca67</div>
                <div className="text-xs text-gray-700">图片和表格渲染功能</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs font-semibold text-green-800 mb-1">f12179c73</div>
                <div className="text-xs text-gray-700">完整功能合并</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Word 模板引擎</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">PDF 生成</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">OFD 格式</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Apache POI</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">ofdrw</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">GVP 项目</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TechSkillsSlide() {
  return (
    <div className="h-full flex items-center">
      <div className="space-y-8">
        <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-5xl font-bold text-gray-900"
        >
          技术能力总结
        </motion.h2>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-2xl font-semibold mb-4 text-orange-600">后端核心技术</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">Java</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '95%' }}
                    transition={{ delay: 0.3 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">95%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">Spring</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '90%' }}
                    transition={{ delay: 0.4 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">90%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">MySQL</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ delay: 0.5 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">Redis</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '88%' }}
                    transition={{ delay: 0.6 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">88%</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-2xl font-semibold mb-4 text-orange-600">微服务与中间件</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">Spring Cloud</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ delay: 0.7 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">RabbitMQ</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ delay: 0.8 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">82%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">Docker</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: 0.9 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-right font-medium text-gray-700">Spring AI</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ delay: 1.0 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600">70%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4+</div>
            <div className="text-gray-600">完整项目经验</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
            <div className="text-gray-600">设备并发处理</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">5x</div>
            <div className="text-gray-600">系统吞吐提升</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">1</div>
            <div className="text-gray-600">开源项目贡献</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ContactSlide() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-10">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold text-gray-900"
        >
          联系方式
        </motion.h2>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-gray-50 rounded-2xl border border-gray-100 max-w-2xl mx-auto"
        >
          <h3 className="text-3xl font-bold mb-4">{profileConfig.name}</h3>
          <p className="text-xl text-gray-600 mb-6">{profileConfig.title}</p>
          <p className="text-gray-500">{profileConfig.bio}</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <a
            href={`mailto:${profileConfig.contact.email}`}
            onClick={(e) => e.stopPropagation()}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <Mail className="w-8 h-8 mx-auto mb-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <p className="text-gray-700 text-sm">{profileConfig.contact.email}</p>
          </a>

          <a
            href={`tel:${profileConfig.contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <Phone className="w-8 h-8 mx-auto mb-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <p className="text-gray-700 text-sm">{profileConfig.contact.phone}</p>
          </a>

          <a
            href={`https://github.com/${profileConfig.contact.github}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <Github className="w-8 h-8 mx-auto mb-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <p className="text-gray-700 text-sm">{profileConfig.contact.github}</p>
          </a>

          <a
            href={`https://${profileConfig.contact.homepage}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <Globe className="w-8 h-8 mx-auto mb-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <p className="text-gray-700 text-sm">{profileConfig.contact.homepage}</p>
          </a>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a
            href={profileConfig.resume.pdfPath}
            download={profileConfig.resume.fileName}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-lg transition-all hover:scale-105"
          >
            <Download size={24} />
            下载我的简历
          </a>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-8"
        >
          <p className="text-2xl text-gray-500">
            期待与您携手，共创美好未来！
          </p>
        </motion.div>
      </div>
    </div>
  )
}