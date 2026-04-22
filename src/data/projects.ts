/**
 * 项目数据
 * 统一的项目数据源，供 portfolio 页面和项目详情页共用
 * 消除 portfolio/page.tsx 和 portfolio/[id]/page.tsx 中的重复数据
 */

export interface ProjectChallenge {
  challenge: string
  solution: string
}

export interface Project {
  id: string
  title: string
  description: string
  date: string
  skills: string[]
  background: string
  architecture: string
  features: string[]
  responsibilities: string[]
  challenges: ProjectChallenge[]
  achievements: string[]
  link: string
  featuredSkills?: string[]
}

export const projects: Project[] = [
  {
    id: '不二价',
    title: '不二价 - 校园二手交易平台',
    description:
      '基于 Spring Cloud Alibaba 微服务架构的校园专属二手交易平台，集成 AI 智能服务模块，实现商品交易、营销、用户交互全业务闭环。',
    date: '2026.02-至今',
    skills: [
      'Java 21',
      'Spring Cloud Alibaba',
      'Spring Security',
      'JWT',
      'Nacos',
      'Sentinel',
      'Redis',
      'Seata',
      'MySQL',
      'Vue3',
      'Element Plus',
      'Spring AI Alibaba',
      'WebSocket',
      'OSS',
    ],
    featuredSkills: ['Spring Cloud', 'Spring AI', 'Vue3', 'Redis'],
    background:
      '不二价是一款面向高校学生的二手交易平台，旨在为校园用户提供安全、便捷的交易环境。项目需求包括校园身份认证、地理围栏校验、高并发秒杀、AI智能客服等功能，同时需要保证系统的安全性、高并发性能和可扩展性。作为全栈开发工程师，我负责从微服务架构设计到前后端全流程开发工作。',
    architecture:
      '项目采用 Spring Cloud Alibaba 微服务架构，拆分用户服务、商品服务、订单服务、支付服务、AI服务等核心服务。使用 Nacos 作为服务注册中心和配置中心，Sentinel 实现流量控制和熔断降级，Seata 保证分布式事务一致性，Redis 处理缓存和库存预扣。前端使用 Vue3 + Element Plus 构建用户端与管理端，集成 WebSocket 实现即时通讯，OSS 处理对象存储。',
    features: [
      '校园身份认证：实现校园身份认证 + 地理围栏双重校验，保障校内专属交易安全',
      '细粒度权限控制：JWT + RBAC 完成细粒度权限控制，支持多角色管理',
      '高并发秒杀模块：Redis 库存预扣防超卖、Sentinel 限流熔断、Seata 分布式事务',
      'AI智能服务：基于 Spring AI 搭建智能服务模块，实现商品图片自动分类、AI智能客服问答',
      '即时通讯：集成 WebSocket 实现即时通讯，支持买卖双方实时沟通',
      '对象存储：OSS 对象存储处理商品图片、用户头像等文件',
      '商品交易全流程：支持商品发布、浏览、下单、支付、评价等完整交易链路',
      '营销活动：支持优惠券、限时折扣、秒杀活动等营销功能',
    ],
    responsibilities: [
      '基于 Spring Cloud Alibaba 设计并实现微服务架构，拆分核心服务',
      '使用 Vue3 + Element Plus 搭建用户端与管理端前端界面',
      '实现校园身份认证 + 地理围栏双重校验，保障交易安全',
      '设计 JWT + RBAC 细粒度权限控制体系',
      '开发高并发秒杀模块，使用 Redis 库存预扣、Sentinel 限流、Seata 分布式事务',
      '基于 Spring AI Alibaba 搭建智能服务模块，实现图片分类和智能客服',
      '集成 WebSocket 即时通讯和 OSS 对象存储',
    ],
    challenges: [
      {
        challenge: '高并发秒杀防超卖',
        solution:
          '采用 Redis Lua 脚本实现库存原子扣减，Sentinel 进行限流熔断保护后端服务，Seata AT 模式保证分布式事务一致性，支撑校园峰值流量',
      },
      {
        challenge: '校园交易安全保障',
        solution:
          '实现校园身份认证 + 地理围栏双重校验，结合 JWT + RBAC 完成细粒度权限控制，确保只有校内用户才能参与交易',
      },
      {
        challenge: 'AI智能服务集成',
        solution:
          '基于 Spring AI Alibaba 搭建智能服务模块，实现商品图片自动分类和 AI 智能客服问答，提升平台自动化能力',
      },
      {
        challenge: '微服务架构稳定性',
        solution:
          '使用 Nacos 服务注册发现、Sentinel 流量控制、Seata 分布式事务，保证微服务架构的高可用和一致性',
      },
    ],
    achievements: [
      '完成校园专属二手交易平台全栈开发，支持完整交易链路',
      '高并发秒杀模块支撑校园峰值流量，库存扣减准确率 100%',
      'AI智能客服提升平台自动化能力，减少人工客服工作量',
      '微服务架构稳定运行，服务可用性达到 99.9%',
    ],
    link: 'https://github.com/RONGX563647/FNUSALE',
  },
  {
    id: '智能插座系统',
    title: '智能插座系统 - IoT电力管理平台',
    description:
      '基于 Spring Boot 3 和 Java 21 LTS 开发的 IoT 智能插座管理系统，覆盖电力设备接入、用电数据采集、远程控制、权限管控、告警计费全业务链路。',
    date: '2025.11-2026.02',
    skills: [
      'Spring Boot 3',
      'Java 21 LTS',
      'Spring Security',
      'Spring Data JPA',
      'JWT',
      'MQTT',
      'Guava',
      'PostgreSQL',
      'Redis',
      'RabbitMQ',
    ],
    featuredSkills: ['Java 21', 'Spring Boot', 'IoT', 'Redis'],
    background:
      '智能插座系统是一款面向宿舍/办公场景的 IoT 电力管理平台，旨在实现智能用电管理、远程控制、告警通知、计费统计等功能。项目需要支持千级设备并发接入、实时数据采集、高并发数据处理，同时保证系统的安全性和稳定性。作为后端开发工程师，我负责从架构设计到核心功能实现的全流程开发工作。',
    architecture:
      '项目采用支持水平扩展的分层架构，后端基于 Spring Boot 3 和 Java 21 LTS，使用 Spring Security + JWT + RBAC 实现分布式无状态鉴权，MQTT 协议处理 IoT 设备通信，Redis 实现分布式令牌黑名单和多级缓存，RabbitMQ 处理异步消息削峰，PostgreSQL 持久化存储业务数据。',
    features: [
      'IoT设备接入：支持千级电力设备并发接入与数据上报，基于 MQTT 协议',
      '用电数据采集：实时采集设备用电数据，支持数据存储和统计分析',
      '远程控制：支持设备远程开关、定时任务、用电策略配置',
      '权限管控：分布式 JWT 无状态鉴权 + RBAC 细粒度权限模型',
      '告警通知：设备异常告警、用电超限告警，支持多渠道通知',
      '计费统计：用电账单自动生成，支持多种计费策略',
      '统一限流：Guava 令牌桶单机兜底 + Redis+Lua 分布式滑动窗口限流',
      '审计日志：基于 AOP 切面实现统一审计日志和全局异常治理',
    ],
    responsibilities: [
      '设计并实现支持水平扩展的分层架构，覆盖 IoT 全业务链路',
      '落地分布式 JWT 无状态鉴权 + RBAC 细粒度权限模型',
      'Redis 实现原子性 SETNX+EX 的分布式令牌黑名单',
      'PBKDF2 加盐哈希加密 + 恒定时间比对防时序攻击',
      '基于 AOP 切面实现统一限流、审计日志、全局异常治理',
      'Redis 多级缓存优化数据层性能，接口响应耗时压缩至 50ms 以内',
      'RabbitMQ 实现三大核心异步链路，系统吞吐提升 5 倍',
      'Java 21 虚拟线程优化 IoT 高并发场景',
    ],
    challenges: [
      {
        challenge: 'IoT 高并发设备接入',
        solution:
          '落地 Java 21 虚拟线程优化 IoT 高并发场景，支撑千级设备并发接入与数据上报，大幅提升系统吞吐能力',
      },
      {
        challenge: '分布式鉴权与权限控制',
        solution:
          'Redis 实现原子性 SETNX+EX 的分布式令牌黑名单，替代本地 Map 支持多实例部署；PBKDF2 加盐哈希加密 + 恒定时间比对防时序攻击',
      },
      {
        challenge: '数据层性能优化',
        solution:
          'Redis 多级缓存（L1 本地 Caffeine + L2 分布式 Redis）缓存热点设备/用电数据；JPA 批量操作、联合索引优化、流式分页降低数据库 IO，接口平均响应耗时压缩至 50ms 以内',
      },
      {
        challenge: '异步削峰填谷',
        solution:
          'RabbitMQ 实现设备遥测数据异步落库、告警消息异步推送、用电账单异步生成三大核心异步链路，削平 IoT 设备批量上报的流量峰值，系统吞吐提升 5 倍',
      },
      {
        challenge: '统一限流与异常治理',
        solution:
          '基于 AOP 切面实现统一限流、审计日志、全局异常治理：Guava 令牌桶算法做单机兜底，Redis+Lua 脚本实现分布式滑动窗口限流，峰值 QPS 承载提升 300%',
      },
    ],
    achievements: [
      '支撑千级 IoT 设备并发接入与数据上报',
      '接口平均响应耗时压缩至 50ms 以内',
      '系统吞吐提升 5 倍，峰值 QPS 承载提升 300%',
      '全国大学生物联网设计竞赛东部赛区一等奖（A类赛事）',
    ],
    link: 'https://github.com/RONGX563647/dorm-power',
  },
  {
    id: 'LightSSM',
    title: 'LightSSM - 轻量级 Web 框架',
    description:
      '自研轻量级 Java Web 框架，复刻 Spring 核心流程，实现 IoC/DI 容器、SpringMVC 核心、ORM 模块、AOP 切面能力。',
    date: '2025.09-2025.11',
    skills: [
      'Java',
      'IoC/DI',
      'SpringMVC',
      'ORM',
      'AOP',
      'JDK Proxy',
      'CGLIB',
      'XML解析',
    ],
    featuredSkills: ['Java', 'IoC/DI', 'SpringMVC', 'AOP'],
    background:
      'LightSSM 是一个自研的轻量级 Java Web 框架，旨在深入理解 Spring 框架的核心原理。项目通过复刻 Spring 的核心流程，实现 IoC/DI 容器、SpringMVC 核心组件、轻量级 ORM 模块和 AOP 切面能力，帮助开发者理解框架底层原理。',
    architecture:
      '框架采用模块化设计，IoC/DI 容器支持注解扫描和依赖注入，SpringMVC 模块实现 DispatcherServlet、HandlerMapping、HandlerAdapter、ViewResolver 核心组件，ORM 模块支持 XML SQL 映射和动态 SQL，AOP 模块基于 JDK/CGLIB 双代理实现通知织入。',
    features: [
      'IoC/DI 容器：支持 @Component/@Autowired 注解扫描与依赖注入',
      '三级缓存：基于三级缓存解决循环依赖问题',
      'SpringMVC 核心：实现 DispatcherServlet、HandlerMapping、HandlerAdapter、ViewResolver',
      'RESTful 接口：支持 @RequestMapping/@ResponseBody 开发 RESTful 接口',
      'ORM 模块：支持 XML SQL 映射、动态 SQL 拼接、参数自动绑定与 ResultSet 映射',
      'AOP 切面：基于 JDK/CGLIB 双代理实现 @Before/@After/@Around 通知织入',
    ],
    responsibilities: [
      '设计并实现 IoC/DI 容器，支持注解扫描与依赖注入',
      '基于三级缓存解决循环依赖问题',
      '复刻 SpringMVC 核心流程，实现四大核心组件',
      '实现轻量级 ORM 模块，支持 XML SQL 映射和动态 SQL',
      '集成 AOP 切面能力，基于 JDK/CGLIB 双代理实现通知织入',
    ],
    challenges: [
      {
        challenge: '循环依赖解决',
        solution:
          '基于三级缓存解决循环依赖问题，提前暴露引用对象，实现完整的依赖注入流程',
      },
      {
        challenge: 'SpringMVC 核心流程复刻',
        solution:
          '实现 DispatcherServlet、HandlerMapping、HandlerAdapter、ViewResolver 四大核心组件，完整复刻 SpringMVC 请求处理流程',
      },
      {
        challenge: '动态 SQL 实现',
        solution:
          '实现 XML SQL 映射和动态 SQL 拼接，支持参数自动绑定与 ResultSet 映射',
      },
      {
        challenge: 'AOP 双代理实现',
        solution:
          '基于 JDK 动态代理和 CGLIB 代理实现 @Before/@After/@Around 通知织入，支持接口和类两种代理方式',
      },
    ],
    achievements: [
      '完整复刻 Spring 核心流程，深入理解框架底层原理',
      'IoC/DI 容器支持注解扫描和三级缓存解决循环依赖',
      'SpringMVC 核心组件完整实现，支持 RESTful 接口开发',
      'ORM 模块支持 XML SQL 映射和动态 SQL',
    ],
    link: 'https://github.com/rongx563647/mvc',
  },
  {
    id: 'Hutool开源贡献',
    title: 'Hutool - Java 工具包开源贡献',
    description:
      '向 Hutool（GVP 顶级开源项目）贡献代码，自研 Word 模板引擎和 PDF 生成工具，修复多项线上 bug。',
    date: '2025.09-2025.11',
    skills: ['Java', 'Word模板引擎', 'PDF生成', 'OFD', '开源贡献'],
    featuredSkills: ['Java', '开源贡献', 'Word模板', 'PDF'],
    background:
      'Hutool 是一个 Java 工具包类库，GVP（Gitee Most Valuable Project）顶级开源项目。我向该项目贡献了 Word 模板引擎和 PDF 生成工具两个核心模块，并修复了多项线上 bug，提升了框架的稳定性和文档处理能力。',
    architecture:
      'Word 模板引擎支持文本/图片/表格占位符渲染，采用链式调用设计，支持自定义配置。PDF 生成工具基于 OFD 中间格式实现文档转换，支持文本/图片写入，完善文档处理能力。',
    features: [
      'Word 模板引擎：支持文本/图片/表格占位符渲染',
      '链式调用：采用链式调用设计，简化 API 使用',
      '自定义配置：支持自定义配置，灵活适配不同场景',
      'PDF 生成工具：基于 OFD 中间格式实现文档转换',
      '文本/图片写入：支持文本和图片写入 PDF 文档',
      'Bug 修复：修复泛型类型转换、API 兼容性、编译异常等线上 bug',
    ],
    responsibilities: [
      '自研 Word 模板引擎，支持文本/图片/表格占位符渲染、链式调用、自定义配置',
      '新增 PDF 生成工具，基于 OFD 中间格式实现文档转换、文本/图片写入',
      '修复泛型类型转换、API 兼容性、编译异常等线上 bug，提升框架稳定性',
    ],
    challenges: [
      {
        challenge: 'Word 模板引擎设计',
        solution:
          '设计支持文本/图片/表格占位符渲染的模板引擎，采用链式调用简化 API，支持自定义配置灵活适配不同场景',
      },
      {
        challenge: 'PDF 生成工具实现',
        solution:
          '基于 OFD 中间格式实现文档转换，支持文本/图片写入，完善文档处理能力',
      },
      {
        challenge: '线上 Bug 修复',
        solution:
          '修复泛型类型转换、API 兼容性、编译异常等线上 bug，提升框架稳定性',
      },
    ],
    achievements: [
      '自研 Word 模板引擎，大幅简化文档生成逻辑',
      '新增 PDF 生成工具，完善文档处理能力',
      '修复多项线上 bug，提升框架稳定性',
      '贡献代码被合并到 Hutool 主分支（git hash: f12179c73a6bd16ec885443a6aba49fb27e32f03）',
    ],
    link: 'https://github.com/dromara/hutool',
  },
]

/**
 * 首页精选项目（从 projects 中取前两个）
 */
export const featuredProjects = projects.slice(0, 2)

/**
 * 3D轮播展示项目数据
 */
export interface CarouselProject {
  id: string
  title: string
  description: string
  color: string
  link: string
  targetProgress: number
}

// 轮播区域标题
export const carouselTitle = 'Java + Vue3 全栈项目'

export const carouselProjects: CarouselProject[] = [
  {
    id: '1',
    title: '不二价 - 校园二手交易平台',
    description: 'Spring Cloud Alibaba + Spring AI + Vue3',
    color: '#3b82f6',
    link: 'https://github.com/RONGX563647/FNUSALE',
    targetProgress: 95,
  },
  {
    id: '2',
    title: '智能插座系统 - IoT电力管理',
    description: 'Java 21 + Spring Boot 3 + MQTT + Redis',
    color: '#8b5cf6',
    link: 'https://github.com/RONGX563647/dorm-power',
    targetProgress: 88,
  },
  {
    id: '3',
    title: 'LightSSM - 轻量级Web框架',
    description: 'IoC/DI + SpringMVC + ORM + AOP',
    color: '#ec4899',
    link: 'https://github.com/rongx563647/mvc',
    targetProgress: 82,
  },
  {
    id: '4',
    title: 'Hutool - Java工具包开源贡献',
    description: 'Word模板引擎 + PDF生成工具',
    color: '#10b981',
    link: 'https://github.com/dromara/hutool',
    targetProgress: 75,
  },
]

/**
 * 快捷链接数据
 */
export interface QuickLink {
  id: string
  name: string
  url: string
}

export const quickLinks: QuickLink[] = [
  { id: '1', name: '个人主页', url: 'https://www.rongx.top' },
  { id: '2', name: 'GitHub', url: 'https://github.com/rongx563647' },
  {
    id: '3',
    name: '面试鸭',
    url: 'https://www.mianshiya.com/bank/1787463103423897602',
  },
  { id: '4', name: '小林coding', url: 'https://xiaolincoding.com/' },
  {
    id: '5',
    name: 'LeetCode',
    url: 'https://leetcode.cn/studyplan/top-100-liked/',
  },
]

/**
 * 博客视频配置
 */
export const categoryVideos: Record<string, { bvid: string; title: string }> = {
  '引气・Java 气海初拓': {
    bvid: 'BV17F411T7Ao',
    title: '黑马程序员Java零基础视频教程',
  },
  '筑基・Web 道途启关': {
    bvid: 'BV1yGydYEE3H',
    title: 'AI+JavaWeb开发入门，Tlias教学管理系统项目实战',
  },
}

/**
 * 简历验证问题
 */
export const resumeQuestions = [
  {
    id: 1,
    question: '贵公司招聘岗位与我技术栈匹配吗',
    options: ['匹配', '不太匹配'],
    correctAnswer: 'yes' as const,
  },
  {
    id: 2,
    question: '贵公司团队氛围融洽吗？',
    options: ['融洽', '一般'],
    correctAnswer: 'yes' as const,
  },
  {
    id: 3,
    question: '贵公司工作节奏快吗',
    options: ['适中', '很快'],
    correctAnswer: 'no' as const,
  },
]

/**
 * Giscus 评论配置
 */
export const giscusConfig = {
  repo: 'RONGX563647/nextjs-mdx-blog',
  repoId: 'R_kgDOQ80jjw',
  category: 'General',
  categoryId: 'DIC_kwDOQ80jj84C1v-M',
  lang: 'zh-CN',
}
