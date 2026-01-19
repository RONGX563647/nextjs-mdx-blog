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
        <h1>项目经历</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl">
          以下是我参与开发的代表性项目，展示了我的技术能力和实践经验。
        </p>
      </section>

      {/* Projects Grid */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-semibold">{project.title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <span>{project.date}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skills.slice(0, 6).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 6 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm">
                      +{project.skills.length - 6} 更多
                    </span>
                  )}
                </div>
                <Button asChild className="w-full">
                  <Link href={project.link} className="flex items-center justify-center gap-2">
                    查看详情
                    <ExternalLink size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}