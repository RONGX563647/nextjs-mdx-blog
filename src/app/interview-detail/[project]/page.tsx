'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import { projects } from '@/data/projects'

const projectDetails: Record<string, {
  title: string
  subtitle: string
  sections: {
    title: string
    type: 'painpoint' | 'solution' | 'architecture' | 'challenge' | 'achievement'
    content: string[]
    diagram?: string[]
    images?: string[]
  }[]
}> = {
  '不二价': {
    title: '不二价',
    subtitle: '校园二手交易平台 - 微服务 + 高并发 + AI',
    sections: [
      {
        title: '项目背景与业务目标',
        type: 'painpoint',
        content: [
          '校园内闲置物品流转困难，学生交易成本高',
          '传统二手群信息混乱，缺乏规范化管理',
          '目标：构建校园内安全可信的二手交易平台',
          '技术挑战：高并发秒杀、分布式事务、AI 客服集成',
        ],
      },
      {
        title: '痛点分析与解决方案',
        type: 'painpoint',
        content: [
          '痛点 1：秒杀场景库存超卖问题',
          '  解决方案：Redis Lua 脚本实现库存原子扣减，保证数据一致性',
          '痛点 2：分布式事务一致性保障困难',
          '  解决方案：引入 Seata AT 模式，订单-库存-支付三服务事务一致性',
          '痛点 3：人工客服响应慢、工作量大',
          '  解决方案：Spring AI Alibaba 构建智能客服系统，覆盖 60% 常见问题',
          '痛点 4：校外用户混入影响交易安全',
          '  解决方案：校园身份认证 + 地理围栏双重校验，100% 校内用户',
        ],
      },
      {
        title: '微服务架构设计',
        type: 'architecture',
        content: [
          'Gateway 网关：统一鉴权、路由转发、跨域处理',
          '用户服务：学工号认证、地理围栏校验、RBAC 权限管理',
          '商品服务：商品发布、图片分类（Spring AI）、搜索浏览',
          '订单服务：下单支付、秒杀模块、订单状态机管理',
          '支付服务：支付回调处理、账单生成、交易记录',
          'AI 服务：智能客服（Function Calling）、图片分类识别',
        ],
        diagram: ['客户端 → Gateway 网关 → 5个微服务 → Nacos/Sentinel/Seata'],
      },
      {
        title: '核心技术实现',
        type: 'solution',
        content: [
          'Redis Lua 脚本原子操作：库存预扣减 + 超卖检测 + 订单创建，单事务完成',
          'Seata AT 模式：自动解析 SQL、生成 undo_log、二阶段提交保证事务一致性',
          'Sentinel 限流熔断：QPS 限流、慢调用比例熔断、系统自适应保护',
          'Spring AI Function Calling：将 Java 方法注册为 AI 可调用函数，实现智能客服',
          'WebSocket 即时通讯：买卖家实时沟通，消息推送通知',
          'OSS 对象存储：商品图片上传、CDN 加速访问',
        ],
      },
      {
        title: '性能优化与安全',
        type: 'challenge',
        content: [
          '限流防护：Guava 令牌桶（单机兜底）+ Redis 滑动窗口（分布式精确限流）',
          '分布式缓存：多级缓存架构（L1 Caffeine + L2 Redis），接口响应 <50ms',
          '密码安全：PBKDF2 加盐哈希加密 + 恒定时间比对防时序攻击',
          'Token 黑名单：Redis SETNX+EX 原子操作，支持用户主动登出',
          '全局异常治理：统一异常处理器，避免敏感信息泄露',
        ],
      },
      {
        title: '项目成果',
        type: 'achievement',
        content: [
          '库存超卖率 0%：Lua 原子操作保证秒杀场景数据一致性',
          '分布式事务 100% 一致性：Seata AT 模式保障跨服务事务',
          'AI 客服覆盖率 60%：减少人工客服工作量，提升响应效率',
          '100% 校内用户纯净度：校园身份认证 + 地理围栏双重保障',
          '峰值 QPS 承载提升 300%：限流架构有效应对流量高峰',
        ],
      },
    ],
  },
  '智能插座系统': {
    title: '智能插座系统',
    subtitle: 'IoT 电力设备管理平台 - 基于 Java 21 虚拟线程 + MQTT + RabbitMQ 的实时监控与智能告警',
    sections: [
      {
        title: '项目背景与业务目标',
        type: 'painpoint',
        content: [
          '校园电力设备监控困难，缺乏统一管理平台',
          '设备故障发现滞后，影响教学和生活',
          '目标：构建 IoT 电力设备实时监控与智能告警平台',
          '技术挑战：千级设备并发、海量数据处理、实时告警',
        ],
      },
      {
        title: '教学文档与源码',
        type: 'solution',
        content: [
          '📚 完整教学文档：https://rongx563647.github.io/dorm-power-console/index.html',
          '💻 GitHub 源码：https://github.com/RONGX563647/dorm-power-console',
          '📖 教学特色：目标导向、分步实操、完整代码、联调验证',
          '📝 包含 10 个核心模块：用户认证、设备管理、数据采集、计费管理、告警管理、控制管理、宿舍管理、系统管理、AI 智能、通知管理',
        ],
      },
      {
        title: '痛点分析与解决方案',
        type: 'painpoint',
        content: [
          '痛点 1：千级设备并发连接导致 OOM',
          '  解决方案：Java 21 虚拟线程替代平台线程，单个虚拟线程仅占用几百字节',
          '痛点 2：设备批量上报阻塞主流程',
          '  解决方案：RabbitMQ 异步链路削峰填谷，数据异步消费批量落库',
          '痛点 3：接口响应慢（>500ms）',
          '  解决方案：Redis 多级缓存架构（L1 Caffeine + L2 Redis），接口响应压缩至 50ms',
          '痛点 4：恶意请求缺乏防护',
          '  解决方案：Guava + Redis 双层限流架构，QPS 承载提升 300%',
        ],
      },
      {
        title: 'IoT 异步架构设计',
        type: 'architecture',
        content: [
          '设备接入层：MQTT 协议接入，千级设备并发连接，Topic 设计（设备/类型/操作）',
          '消息队列层：RabbitMQ 手动 ACK + 死信队列（DLQ），保证消息可靠性',
          '数据处理层：异步消费遥测数据，批量落库，减少数据库 IO 压力',
          '业务处理层：实时告警规则引擎、用电账单计算、设备状态监控',
          '通知推送层：多渠道告警推送（邮件/短信/Webhook），延迟队列实现定时任务',
        ],
        diagram: ['设备 → MQTT → RabbitMQ → 异步消费 → 数据存储 → 告警/账单/监控'],
      },
      {
        title: '系统架构设计',
        type: 'architecture',
        content: [
          '前端架构：Vue 3 Web 端 + UniApp 移动端（Android/iOS）',
          '反向代理：Nginx 负载均衡 + SSL + 静态资源托管',
          '后端服务：Spring Boot 3.2 核心服务',
          '认证授权：JWT + Redis 黑名单机制',
          '实时通信：WebSocket 连接管理（JUC 并发）',
          'IoT 桥接：MQTT Bridge 虚拟线程消息桥接',
          '异步处理：RabbitMQ 异步链路解耦',
          '多级缓存：Caffeine + Redis 两级缓存架构',
          '监控告警：Prometheus + Grafana 监控面板',
        ],
      },
      {
        title: '核心技术实现',
        type: 'solution',
        content: [
          'Java 21 Virtual Threads：轻量级线程由 JVM 调度，支撑千级设备并发接入',
          'MQTT 协议：QoS 0/1/2 三种级别，设备在线状态心跳检测',
          'RabbitMQ 可靠性保障：生产者 Confirm/Return + 消费者手动 ACK + DLQ',
          'Redis 多级缓存：L1 Caffeine 本地缓存（热点数据 <1ms）+ L2 Redis 分布式缓存',
          'Guava + Redis 双层限流：单机兜底 + 分布式精确限流，支持多实例部署',
          'JWT + Redis 黑名单：Token 认证 + Redis 黑名单快速失效',
          'WebSocket 连接管理：JUC 并发包管理设备连接状态',
          'AOP 切面审计：接口调用日志记录，便于问题排查和性能分析',
        ],
      },
      {
        title: '性能优化指标',
        type: 'achievement',
        content: [
          '并发能力：1000+ 电力设备并发接入，虚拟线程内存占用降低 99%',
          '系统吞吐：RabbitMQ 异步链路使系统吞吐提升 5 倍',
          '响应时间：Redis 多级缓存使接口平均响应压缩至 50ms 以内',
          'QPS 承载：双层限流架构使峰值 QPS 承载提升 300%',
          '数据库 IO：批量落库 + 联合索引，减少 80% 数据库访问',
          '监控告警：Prometheus + Grafana 实时监控，秒级告警响应',
        ],
      },
      {
        title: '安全与告警机制',
        type: 'challenge',
        content: [
          '密码安全：PBKDF2 加盐哈希 + 随机盐值 + 恒定时间比对',
          '告警规则：阈值告警、趋势告警、组合告警，多维度设备监控',
          '延迟队列：基于 TTL + DLX 实现延迟消息，用于设备心跳超时检测',
          '死信处理：消息过期/被拒绝/队列满时转入 DLQ，人工干预恢复',
          '审计日志：AOP 切面记录接口调用日志，便于问题排查和性能分析',
          'JWT 黑名单：Redis 快速失效恶意 Token，保障系统安全',
        ],
      },
    ],
  },
  'LightSSM': {
    title: 'LightSSM',
    subtitle: '轻量级自研 SSM 框架 - 手写精简版 Spring + SpringMVC + MyBatis',
    sections: [
      {
        title: '项目核心价值',
        type: 'painpoint',
        content: [
          '别人只会背原生 Spring 理论，你是原生 Spring 原理 + 自己手写精简框架对照理解',
          '所有面试考点锚定你的项目，不再空洞，面试官深挖你完全接得住',
          '通过手写精简版框架，深入理解框架核心设计思想',
          '面试最加分的项目经历，让你在众多候选人中脱颖而出',
        ],
      },
      {
        title: '功能特性总览',
        type: 'architecture',
        content: [
          'IOC/DI 容器：支持 @Component、@Autowired 注解扫描与依赖注入，基于三级缓存解决循环依赖问题，支持 @Scope 配置单例/原型模式',
          'SpringMVC 核心：实现 DispatcherServlet、HandlerMapping、HandlerAdapter，支持 @RequestMapping、@ResponseBody、@RequestParam、@PathVariable',
          'ORM 模块：支持 XML SQL 映射配置、动态 SQL 拼接（OGNL 表达式）、参数自动绑定与 ResultSet 映射、插件拦截器机制',
          'AOP 切面：基于 JDK/CGLIB 双代理实现，支持 @Before、@After、@Around 通知织入，支持 AspectJ 表达式切入点',
        ],
        diagram: ['IOC 容器 → Bean 生命周期 → AOP 代理 → MVC 请求 → ORM 查询'],
      },
      {
        title: '架构对比：原生 Spring vs LightSSM',
        type: 'solution',
        content: [
          '原生 Spring【IOC 容器】：BeanDefinition → BeanFactory → 三级缓存 → BeanPostProcessor',
          'LightSSM【迷你 IOC】：包扫描 → BeanDefinitionMap → 三级缓存 → 字段注入',
          '原生 Spring【AOP】：动态代理 → 声明式事务',
          'LightSSM【迷你 AOP】：JDK/CGLIB 双代理 → 方法拦截器',
          '原生 Spring【SpringMVC】：DispatcherServlet → HandlerMapping → HandlerAdapter → ViewResolver',
          'LightSSM【迷你 MVC】：DispatcherServlet → URL 映射表 → 反射执行',
          '原生 Spring【ORM】：SqlSessionFactory → SqlSession → Executor → StatementHandler',
          'LightSSM【整合 MyBatis】：手动 SqlSessionFactory → Mapper 代理注入',
        ],
      },
      {
        title: '三级缓存核心实现',
        type: 'challenge',
        content: [
          '一级缓存 singletonObjects：存储完整 Bean 实例，ConcurrentHashMap 实现',
          '二级缓存 earlySingletonObjects：存储早期引用（未填充属性），解决循环依赖',
          '三级缓存 singletonFactories：存储 ObjectFactory 工厂，支持 AOP 代理',
          'getSingleton() 方法：逐级获取缓存，从一级 → 二级 → 三级',
          '循环依赖解决：A 创建 → 放入三级缓存 → 注入 B → B 创建 → 注入 A → 从三级缓存获取 A 早期引用 → B 完成 → A 完成',
        ],
      },
      {
        title: '核心代码展示',
        type: 'architecture',
        content: [
          'DefaultListableBeanFactory 核心字段：singletonObjects（一级）、earlySingletonObjects（二级）、singletonFactories（三级）',
          'getSingleton() 方法逻辑：先查一级缓存，若正在创建中则查二级缓存，若仍无则从三级缓存工厂获取',
          '三级缓存优势：提前暴露引用，支持 AOP 代理对象创建，避免循环依赖死锁',
        ],
      },
      {
        title: '架构图',
        type: 'architecture',
        content: [],
        diagram: [
          'AOP 代理机制图',
          'IOC 容器架构图',
          'SpringMVC 核心流程图',
        ],
        images: [
          '/images/lightssm/1.png',
          '/images/lightssm/2.png',
          '/images/lightssm/3.png',
        ],
      },
      {
        title: '面试考点',
        type: 'achievement',
        content: [
          'IOC、DI 是什么？你的 LightSSM 如何实现？',
          'Spring 三级缓存机制是什么？你的 LightSSM 如何实现的？',
          'SpringMVC 流程？你的 DispatcherServlet 怎么写的？',
          'MyBatis 如何整合进 Spring 容器？',
          'AOP 实现原理？你的 LightSSM 支持哪些通知类型？',
        ],
      },
    ],
  },
  'Hutool 开源贡献': {
    title: 'Hutool 开源贡献',
    subtitle: 'GVP 顶级 Java 工具包 - Word 模板引擎 & PDF 生成（v7-dev 分支）',
    sections: [
      {
        title: '贡献背景',
        type: 'painpoint',
        content: [
          'Hutool 是 Gitee GVP（Most Valuable Project）顶级开源项目，Star 数 30k+',
          'Java 工具包类库，涵盖字符串、日期、文件、加密、网络等常用工具',
          'v7 版本需要完善文档处理能力，缺少 Word 模板和 PDF 生成功能',
          '目标：为 Hutool v7 贡献 feature/word-pdf-converter 分支',
        ],
      },
      {
        title: 'Word 模板引擎实现',
        type: 'solution',
        content: [
          '文本占位符 {{name}}：支持段落、表格单元格、页眉页脚中的文本替换',
          '图片占位符 {{@logo}}：支持 File/InputStream/路径三种图片源方式',
          '表格占位符 {{#table}}：支持 List<List<String>>、List<Object[]>、Bean 列表',
          '渲染器接口设计：TemplateRenderer 接口 + 三种实现（文本/图片/表格）',
          '模板配置：TemplateConfig 支持自定义占位符开始/结束标签',
        ],
      },
      {
        title: 'PDF 生成工具实现',
        type: 'solution',
        content: [
          'OFD 中间格式方案：用户数据 → OFD 文档 → PDF 文档',
          '复用 ofdrw-full 库，无需引入新依赖，OFD 是国产标准格式',
          '支持中文排版，转换质量有保障，避免乱码问题',
          'PdfWriter 链式 API：addText/addPicture/add 方法，流式写入',
          'PdfUtil 工具类：ofdToPdf 转换方法，createWriter 工厂方法',
        ],
      },
      {
        title: '技术架构与测试',
        type: 'architecture',
        content: [
          '模块结构：hutool-poi/word/template + pdf 两个子模块',
          '核心类：WordTemplate（模板加载/渲染/输出）、PdfWriter（PDF 写入器）',
          '依赖复用：Apache POI（Word 处理）+ ofdrw-full（OFD/PDF 转换）',
          '测试覆盖：7 个测试类（WordTemplateTest/PictureRendererTest/PdfWriterTest 等）',
          '代码规范：遵循 Hutool 编码规范，完整注释和单元测试',
        ],
      },
      {
        title: '架构图',
        type: 'architecture',
        content: [],
        diagram: [
          'Word 模板引擎架构图',
          'PdfUtil 和 PdfWriter 方法展示',
        ],
        images: [
          '/images/hutool/1.png',
          '/images/hutool/2.png',
        ],
      },
      {
        title: '提交记录',
        type: 'achievement',
        content: [
          '995e681f6 - feat: 添加 Word 模板引擎基础功能（Phase 1）',
          '276b7ca67 - feat: 添加 Word 模板图片和表格渲染功能（Phase 2）',
          'f12179c73 - feat(poi): 新增 Word 模板引擎和 PDF 生成功能（完整合并）',
        ],
      },
      {
        title: '后续规划',
        type: 'challenge',
        content: [
          '支持循环渲染（列表数据自动生成多行）',
          '支持条件渲染（根据条件显示/隐藏内容）',
          '支持嵌套表格和更多图片格式/尺寸控制',
          'PDF 添加水印功能',
        ],
      },
    ],
  },
}

export default function InterviewDetailPage() {
  const params = useParams()
  const rawProject = decodeURIComponent((params?.project as string) || '')
  
  // Map URL-friendly names to the keys in projectDetails
  const projectKeyMap: Record<string, string> = {
    'bu-er-jia': '不二价',
    'smart-socket': '智能插座系统',
    'light-ssm': 'LightSSM',
    'hutool': 'Hutool 开源贡献',
    // Also support direct Chinese names
    '不二价': '不二价',
    '智能插座系统': '智能插座系统',
    'LightSSM': 'LightSSM',
    'Hutool 开源贡献': 'Hutool 开源贡献',
  }
  
  const project = projectKeyMap[rawProject] || rawProject
  const detail = projectDetails[project]

  if (!detail) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">项目未找到</h1>
          <p className="text-gray-600 mb-8">找不到项目 "{rawProject}" 的详情页面</p>
          <a
            href="/interview"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all inline-block"
          >
            返回面试演示
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* 固定头部 */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-8 lg:px-16 py-4">
          <div className="flex items-center justify-between">
            <a
              href="/interview"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-gray-700"
            >
              <ArrowLeft size={20} />
              返回面试演示
            </a>
            <a
              href="/个人简历.pdf"
              download
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
            >
              <Download size={18} />
              下载简历
            </a>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-8 lg:px-16 py-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{detail.title}</h1>
            <p className="text-xl text-orange-600">{detail.subtitle}</p>
          </motion.div>

        <div className="space-y-12">
          {detail.sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-2xl border-2 ${
                section.type === 'painpoint' ? 'bg-red-50 border-red-200' :
                section.type === 'solution' ? 'bg-orange-50 border-orange-200' :
                section.type === 'architecture' ? 'bg-blue-50 border-blue-200' :
                section.type === 'challenge' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}
            >
              <h2 className={`text-3xl font-bold mb-6 ${
                section.type === 'painpoint' ? 'text-red-700' :
                section.type === 'solution' ? 'text-orange-700' :
                section.type === 'architecture' ? 'text-blue-700' :
                section.type === 'challenge' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {section.title}
              </h2>

              {section.diagram && (
                <div className="mb-6 space-y-4">
                  {section.images && section.images.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {section.images.map((imgSrc, imgIndex) => (
                        <div key={imgIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-700">{section.diagram?.[imgIndex] || `架构图 ${imgIndex + 1}`}</span>
                          </div>
                          <div className="p-4">
                            <img 
                              src={imgSrc} 
                              alt={section.diagram?.[imgIndex] || `架构图 ${imgIndex + 1}`}
                              className="w-full h-auto rounded-lg shadow-lg"
                              loading="lazy"
                              onError={(e) => {
                                // 图片加载失败时显示占位提示
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'block';
                              }}
                            />
                            <div className="hidden bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
                              <div className="text-yellow-800 font-medium mb-2">
                                📷 图片尚未添加
                              </div>
                              <div className="text-yellow-600 text-sm mb-4">
                                {section.diagram?.[imgIndex] || `架构图 ${imgIndex + 1}`}
                              </div>
                              <div className="text-yellow-500 text-xs">
                                请将图片保存到 <code className="bg-yellow-100 px-2 py-1 rounded">public/images/hutool/</code> 目录
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="text-center text-gray-800 font-medium">
                        {section.diagram[0]}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ul className="space-y-4">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      section.type === 'painpoint' ? 'bg-red-500' :
                      section.type === 'solution' ? 'bg-orange-500' :
                      section.type === 'architecture' ? 'bg-blue-500' :
                      section.type === 'challenge' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="text-gray-800 whitespace-pre-line">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center gap-4"
        >
          <a
            href="/interview"
            className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl text-lg font-medium hover:bg-orange-600 transition-all hover:scale-105"
          >
            <ArrowLeft size={20} />
            返回面试演示
          </a>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
