/**
 * 项目页面组件
 * 
 * 功能：
 * - 显示项目经历介绍
 * - 显示 3D 项目轮播
 * - 显示项目详情预览
 * - 响应式布局支持
 * - 使用提取的子组件
 * 
 * @returns 项目页面内容
 */
import { ProjectCarousel } from '@/components/portfolio/ProjectCarousel'
import { ProjectCard } from '@/components/portfolio/ProjectCard'

export default function Portfolio() {
  const projects = [
    {
      id: '福师畅聊',
      title: '福师畅聊 - 全栈开发',
      description: '基于 Spring Boot、Netty、Redis 开发的即时通讯应用，负责全栈开发工作，包括前端和后端。',
      date: '2025.08-2025.10',
      skills: ['Spring Boot', 'Netty', 'Redis', 'MySQL', 'MinIO', 'WebSocket', 'Vue 3', 'TypeScript', 'Vite', 'Docker', 'Nginx'],
      background: '福师畅聊是一款面向高校师生的即时通讯应用，旨在为校园用户提供便捷的沟通工具。项目需求包括支持私聊、群聊、离线消息、文件传输、语音视频通话等功能，同时需要保证系统的高并发性能和稳定性。作为全栈开发工程师，我负责从架构设计到功能实现的全流程开发工作。',
      architecture: '项目采用前后端分离架构，后端基于 Spring Boot 框架，使用 Netty 实现高性能的实时消息推送，Redis 作为缓存和消息队列，MySQL 持久化存储用户数据和聊天记录，MinIO 处理文件存储。前端使用 Vue 3 + TypeScript 构建，通过 WebSocket 与后端保持实时连接，实现消息的即时推送和接收。',
      features: [
        '实时消息推送：基于 Netty 长连接和 WebSocket，支持私聊、群聊的实时消息推送',
        '离线消息处理：用户离线时消息存储到 Redis，上线后自动推送离线消息',
        '文件传输：支持图片、文档等多种文件类型的上传和下载，使用 MinIO 对象存储',
        '语音视频通话：集成 WebRTC 实现点对点的语音视频通话功能',
        '好友管理：支持好友添加、删除、分组管理等功能',
        '群组功能：支持创建群组、邀请成员、群组消息推送等功能',
        '消息已读回执：实时显示消息的已读状态',
        '用户设置：支持个人信息修改、隐私设置、通知设置等功能'
      ],
      responsibilities: [
        '设计并实现基于 Netty 的实时消息推送系统，支持私聊、群聊、离线消息等核心功能',
        '开发 RESTful API 接口，实现用户认证、消息管理、好友关系等后端功能',
        '构建 Vue 3 + TypeScript 前端应用，实现消息列表、聊天界面、用户设置等功能',
        '集成 WebSocket 实现前后端实时通信，确保消息即时送达',
        '设计 Redis 缓存策略，优化消息查询性能和系统响应速度',
        '使用 Docker 容器化部署，配合 Nginx 实现负载均衡和 HTTPS 配置'
      ],
      challenges: [
        {
          challenge: '高并发消息推送性能优化',
          solution: '使用 Netty 的 NIO 模式和线程池优化，结合 Redis 的 Pub/Sub 机制实现消息分发，通过连接池管理减少连接创建开销，最终支持 1000+ 并发连接，消息延迟控制在 100ms 以内'
        },
        {
          challenge: '离线消息存储和推送',
          solution: '设计离线消息存储策略，用户离线时消息存储到 Redis Sorted Set，用户上线时通过定时任务批量推送，同时设置消息过期时间避免内存占用过大'
        },
        {
          challenge: '前端性能优化',
          solution: '使用 Vue 3 的 Composition API 和响应式系统优化，实现虚拟滚动减少 DOM 操作，使用 Web Worker 处理消息历史记录查询，最终将页面加载时间优化至 0.8 秒'
        },
        {
          challenge: '消息可靠性保证',
          solution: '实现消息确认机制，发送方收到接收方的确认后才标记为已送达，对于未确认的消息设置重试机制，确保消息送达率达到 100%'
        }
      ],
      achievements: [
        '实现了支持 1000+ 并发连接的实时消息系统',
        '前端页面加载速度优化至 0.8 秒，用户体验显著提升',
        '系统稳定性达到 99.9%，消息送达率 100%',
        '代码质量优秀，通过了团队代码审查，获得好评'
      ],
      link: '/portfolio/福师畅聊'
    },
    {
      id: '师大云学',
      title: '师大云学 - 全栈开发',
      description: '基于 Spring Cloud Alibaba 开发的在线教育平台，负责全栈开发工作，包括微服务架构设计和前端实现。',
      date: '2025.07-2025.09',
      skills: ['Spring Cloud Alibaba', 'Spring Boot', 'MySQL', 'Redis', 'RabbitMQ', 'React', 'TypeScript', 'Next.js', 'Jenkins', 'Kubernetes'],
      background: '师大云学是一个面向高校师生的在线教育平台，提供课程学习、在线考试、作业提交、成绩查询等功能。项目需要支持高并发访问，保证系统的稳定性和可扩展性。作为全栈开发工程师，我负责微服务架构设计、后端服务开发、前端应用实现以及 DevOps 流程搭建。',
      architecture: '项目采用 Spring Cloud Alibaba 微服务架构，包含用户服务、课程服务、订单服务、支付服务、考试服务等核心微服务。使用 Nacos 作为服务注册中心和配置中心，Sentinel 实现流量控制和熔断降级，RabbitMQ 处理异步消息，Redis 作为缓存层。前端使用 React + TypeScript 构建，通过 RESTful API 与后端服务通信。',
      features: [
        '课程管理：支持课程创建、编辑、发布、下架等全生命周期管理',
        '在线学习：提供视频播放、课件下载、在线笔记等学习功能',
        '作业系统：支持作业发布、提交、批改、成绩查询等功能',
        '在线考试：支持题库管理、试卷生成、在线考试、自动阅卷等功能',
        '订单支付：集成支付宝、微信支付，支持课程购买和订单管理',
        '用户中心：支持个人信息管理、学习进度查看、证书下载等功能',
        '消息通知：支持系统通知、课程提醒、考试提醒等消息推送',
        '数据分析：提供学习数据统计、课程分析、用户行为分析等功能'
      ],
      responsibilities: [
        '基于 Spring Cloud Alibaba 设计并实现微服务架构，包括用户、课程、订单等核心服务',
        '开发 RESTful API 接口，实现课程管理、订单处理、支付集成等功能',
        '构建 React + TypeScript 前端应用，实现课程展示、购物车、支付流程等功能',
        '集成 RabbitMQ 实现消息通知系统，确保异步任务的可靠执行',
        '设计 Redis 缓存策略，优化课程查询和用户数据访问性能',
        '配置 Jenkins CI/CD 流水线，实现自动化构建和部署'
      ],
      challenges: [
        {
          challenge: '微服务间通信优化',
          solution: '使用 OpenFeign 实现服务间调用，配置合理的超时时间和重试策略，使用 Sentinel 实现熔断降级，避免服务雪崩，最终将服务间调用成功率提升至 99.9%'
        },
        {
          challenge: '高并发课程查询优化',
          solution: '设计多级缓存策略，本地缓存 + Redis 缓存 + 数据库三级缓存，使用 Redis 集群保证高可用，最终将课程查询响应时间从 500ms 优化至 50ms'
        },
        {
          challenge: '支付流程可靠性保证',
          solution: '实现支付状态机，确保支付流程的幂等性和最终一致性，使用消息队列处理支付回调，设置合理的重试机制，最终将支付成功率提升至 99.5%'
        },
        {
          challenge: '前端性能优化',
          solution: '使用 React 的虚拟 DOM 和 memo 优化渲染，实现路由懒加载和组件懒加载，使用 CDN 加速静态资源，最终将首屏加载时间优化至 1.2 秒'
        }
      ],
      achievements: [
        '实现了日访问量 10 万+ 的高并发在线教育平台',
        '课程加载速度提升 60%，用户停留时间增加 35%',
        '微服务架构部署成功，服务可用性达到 99.95%',
        'CI/CD 流水线搭建完成，部署时间从小时级缩短至分钟级'
      ],
      link: '/portfolio/师大云学'
    },
    {
      id: '个人博客系统',
      title: '个人博客系统 - 全栈开发',
      description: '基于 Next.js 13 App Router 和 TypeScript 开发的个人博客系统，支持 Markdown 文章、评论、标签管理等功能。',
      date: '2025.05-2025.06',
      skills: ['Next.js 13', 'React', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'Prisma', 'NextAuth.js', 'Docker'],
      background: '个人博客系统是一个用于分享技术文章和项目经验的平台，支持 Markdown 文章编写、代码高亮、图片上传、评论互动等功能。项目需要具备良好的 SEO 优化、快速的页面加载速度和优秀的用户体验。作为全栈开发工程师，我负责从前端架构到后端 API 的全流程开发。',
      architecture: '项目采用 Next.js 13 App Router 架构，利用 React Server Components 和 Streaming 实现高性能渲染。后端使用 Next.js API Routes 构建 RESTful 接口，MongoDB 作为数据库，Prisma ORM 实现数据访问层，NextAuth.js 处理用户认证。前端使用 Tailwind CSS 实现响应式设计，支持深色模式和主题切换。',
      features: [
        '文章管理：支持 Markdown 文章的创建、编辑、发布、删除等全生命周期管理',
        '代码高亮：集成 Prism.js 实现代码语法高亮，支持多种编程语言',
        '图片上传：支持图片上传和压缩，使用本地存储或云存储服务',
        '评论系统：支持文章评论、回复、点赞等功能，支持 Markdown 格式',
        '标签分类：支持文章标签和分类管理，方便内容组织和检索',
        '搜索功能：支持全文搜索和标签搜索，快速找到相关文章',
        '用户认证：集成 NextAuth.js 实现用户登录、注册、权限管理等功能',
        '主题切换：支持浅色模式和深色模式切换，提供更好的阅读体验'
      ],
      responsibilities: [
        '设计并实现基于 Next.js 13 App Router 的前端架构，优化页面加载性能',
        '开发 Markdown 编辑器，支持代码高亮、图片上传等功能',
        '构建后端 API 接口，实现文章管理、评论系统、标签分类等功能',
        '集成 NextAuth.js 实现用户认证和授权系统',
        '使用 MongoDB 和 Prisma ORM 实现数据存储和查询',
        '配置 Docker 容器化部署，确保开发环境一致性'
      ],
      challenges: [
        {
          challenge: 'SEO 优化和页面性能',
          solution: '使用 Next.js 13 的 Server Components 和 Streaming 优化页面加载，实现动态元标签和结构化数据，配置图片懒加载和代码分割，最终将 LCP 优化至 0.5 秒，Core Web Vitals 全部通过'
        },
        {
          challenge: 'Markdown 编辑器开发',
          solution: '集成 react-markdown 和 remark/rehype 插件实现 Markdown 渲染，使用 CodeMirror 开发编辑器，支持实时预览和语法高亮，最终提供流畅的写作体验'
        },
        {
          challenge: '图片上传和存储',
          solution: '实现图片上传接口，使用 sharp 库进行图片压缩和格式转换，支持本地存储和云存储，配置 CDN 加速图片访问，最终将图片加载速度提升 70%'
        },
        {
          challenge: '评论系统性能优化',
          solution: '使用 MongoDB 的索引优化查询性能，实现评论的分页加载和懒加载，使用 Redis 缓存热门文章的评论，最终将评论加载时间优化至 200ms'
        }
      ],
      achievements: [
        '实现了支持 SEO 优化的个人博客系统，Google 搜索排名前 10',
        '页面加载速度达到 0.5 秒，Core Web Vitals 全部通过',
        'Markdown 编辑器用户体验优秀，支持实时预览',
        '系统安全性良好，通过了基本的安全测试'
      ],
      link: '/portfolio/个人博客系统'
    }
  ]

  return (
    <div>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">项目经历</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            以下是我参与开发的代表性项目，展示了我的技术能力和实践经验。
          </p>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">我的项目</h2>
          
          <ProjectCarousel projects={projects} />
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">项目详情预览</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                date={project.date}
                skills={project.skills}
                category={project.id}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
