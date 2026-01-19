import { Button } from '@/components/ui/button'
import { ExternalLink, Github, Database, Server, Code, TestTube } from 'lucide-react'
import Link from 'next/link'

export default function Portfolio() {
  const projects = [
    {
      id: '福师畅聊',
      title: '福师畅聊 - 测试开发',
      description: '基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责测试开发工作。',
      date: '2025.08-2025.10',
      skills: ['Spring Boot', 'Netty', 'Redis', 'MySQL', 'MinIO', 'WebSocket', 'JUnit5', 'RestAssured', 'JMeter', 'Docker'],
      responsibilities: [
        '针对 Netty 长连接接口、RESTful API 设计测试用例，覆盖私聊/群聊、离线消息、语音视频通话等核心场景，共输出 120+ 用例',
        '用 RestAssured+JUnit5 编写接口自动化脚本，覆盖 80% 核心接口，支持一键执行并生成测试报告',
        '用 Postman+Newman 实现接口回归测试的定时执行，减少人工回归成本 60%',
        '用 JMeter 模拟千级并发消息发送场景，测试 Netty 长连接的吞吐量，定位到 Redis 缓存热点问题并输出优化建议',
        '验证离线消息存储的性能，确保消息峰值下的实时送达率达 100%',
        '用 Docker 快速搭建包含 MySQL、Redis、MinIO 的测试环境，将环境部署时间从 2 小时缩短至 15 分钟'
      ],
      link: '/portfolio/福师畅聊'
    },
    {
      id: '师大云学',
      title: '师大云学 - 测试开发',
      description: '基于 Spring Cloud Alibaba 开发的在线教育平台，负责测试开发工作。',
      date: '2025.07-2025.09',
      skills: ['Spring Cloud Alibaba', 'Spring Boot', 'MySQL', 'Redis', 'RabbitMQ', 'RestAssured', 'Jenkins'],
      responsibilities: [
        '基于 Spring Cloud Alibaba 微服务架构，梳理服务间调用链路，设计接口联调测试用例，覆盖课程、订单等核心模块',
        '针对 RabbitMQ 消息通知场景，设计消息可靠性测试用例，验证消息的发送/消费/重试逻辑，避免消息丢失',
        '将接口自动化脚本接入 Jenkins，实现代码提交后自动触发测试，及时反馈代码质量问题',
        '设计 Redis 缓存与 MySQL 数据库的一致性测试用例，覆盖缓存更新、失效等场景，确保数据准确性'
      ],
      link: '/portfolio/师大云学'
    }
  ]

  return (
    <div>
      {/* Portfolio Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">项目经历</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            以下是我参与开发的代表性项目，展示了我的技术能力和实践经验。
          </p>
        </div>
      </section>

      {/* 3D Carousel Portfolio */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12 text-center">我的项目</h2>
          
          {/* 3D Carousel Container */}
          <div className="relative overflow-hidden py-10">
            <div className="flex justify-center perspective-1000">
              <div className="carousel-container relative w-full max-w-6xl">
                <div className="carousel-wrapper flex transition-transform duration-700 ease-in-out hover:duration-1000" style={{ transform: 'translateZ(-200px)' }}>
                  {projects.map((project, index) => (
                    <div 
                      key={project.id} 
                      className="carousel-item relative flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4"
                      style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s ease'
                      }}
                    >
                      <div 
                        className="project-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-y-5 group"
                        style={{ height: '100%' }}
                      >
                        {/* Project Header with Icon */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                          <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                              <Code size={24} className="text-white" />
                            </div>
                          </div>
                          <p className="text-white/80 mt-2">{project.date}</p>
                        </div>
                        
                        {/* Project Content */}
                        <div className="p-6">
                          <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {project.description}
                          </p>
                          
                          {/* Project Skills */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.skills.slice(0, 6).map((skill, skillIndex) => (
                              <span key={skillIndex} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm group-hover:scale-105 transition-transform">
                                {skill}
                              </span>
                            ))}
                            {project.skills.length > 6 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm group-hover:scale-105 transition-transform">
                                +{project.skills.length - 6} 更多
                              </span>
                            )}
                          </div>
                          
                          {/* Project Responsibilities Preview */}
                          <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3">主要职责</h3>
                            <ul className="space-y-2">
                              {project.responsibilities.slice(0, 2).map((responsibility, respIndex) => (
                                <li key={respIndex} className="flex items-start gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-600 dark:text-gray-300 text-sm">{responsibility}</span>
                                </li>
                              ))}
                              {project.responsibilities.length > 2 && (
                                <li className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2">
                                  +{project.responsibilities.length - 2} 更多职责
                                </li>
                              )}
                            </ul>
                          </div>
                          
                          {/* Project Links */}
                          <div className="flex gap-4">
                            <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group-hover:shadow-lg transition-all">
                              <Link href={project.link} className="flex items-center justify-center gap-2">
                                查看详情
                                <ExternalLink size={16} />
                              </Link>
                            </Button>
                            <Button asChild variant="secondary" className="group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-all">
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
        </div>
      </section>

      {/* Project Details Preview */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12 text-center">项目详情预览</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500">
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-4">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-lg">技术栈</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={project.link} className="flex items-center justify-center gap-2">
                      查看完整详情
                      <ExternalLink size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}