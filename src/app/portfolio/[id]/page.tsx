import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Github, Database, Server, Code, TestTube, Calendar } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default function ProjectDetail({ params }: { params: { id: string } }) {
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
      achievements: [
        '测试覆盖率达到 90% 以上',
        '发现并修复了 15+ 个潜在问题',
        '优化了测试流程，提高了团队效率',
        '确保了系统在高并发场景下的稳定性'
      ]
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
      achievements: [
        '实现了自动化测试覆盖率达到 85%',
        '优化了消息队列的可靠性，减少了消息丢失率',
        '提高了微服务架构的稳定性和可靠性',
        '为团队提供了完整的测试方案和文档'
      ]
    }
  ]

  const project = projects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  return (
    <div>
      <section className="py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/portfolio" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            返回项目列表
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {project.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-10">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{project.date}</span>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-8">技术栈</h2>
        <div className="flex flex-wrap gap-3">
          {project.skills.map((skill, index) => (
            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-8">工作职责</h2>
        <ul className="space-y-4">
          {project.responsibilities.map((responsibility, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {responsibility}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-8">项目成果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.achievements.map((achievement, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <p className="text-gray-600 dark:text-gray-300">
                {achievement}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}