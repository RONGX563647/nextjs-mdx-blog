/**
 * 个人信息数据
 * 包含个人基本资料、联系方式、教育背景、核心优势等
 */

export const profileConfig = {
  // 基本介绍
  title: '全栈开发工程师',
  name: '刘荣翔',
  greeting: '你好，我是',
  bio: '专注于 Java 后端和 Vue3 前端开发，具备 Spring Cloud 微服务与 Spring AI 大模型工程化落地实战经验',
  subBio: '从基础到进阶，记录学习过程中的思考与总结，分享技术见解与实践经验',

  // 联系方式
  contact: {
    location: '福州',
    email: 'lrx563647@qq.com',
    phone: '18876381526',
    github: 'rongx563647',
    homepage: 'www.rongx.top',
  },

  // 教育背景
  education: {
    school: '福建师范大学',
    major: '软件工程（本科）',
    period: '2024.09 - 至今',
    courses: '数据结构、算法设计、数据库原理、操作系统、计算机网络、软件工程',
  },

  // 核心优势
  strengths: [
    '具备扎实 Java 编程基础，熟练掌握 Java 21 新特性、虚拟线程、函数式编程，深入理解 JVM 内存模型、垃圾回收机制与底层运行原理',
    '熟练运用 Spring Boot、Spring Cloud Alibaba 全家桶生态，可基于 Nacos、Gateway、OpenFeign 完成微服务注册发现、路由转发、服务通信全链路开发',
    '熟练操作 MySQL 数据库，熟悉 SQL 优化、索引设计、事务处理机制；掌握 Redis 全量数据结构，可基于 Lua 脚本实现分布式限流、库存原子扣减、令牌黑名单等业务方案',
    '深入理解 RabbitMQ 消息中间件，熟悉手动 ACK、延迟队列、死信队列 DLQ 机制，能够运用于业务异步削峰、流量解耦、分布式最终一致性场景',
    '熟练运用 Spring Security、JWT、RBAC 权限架构，熟悉 PBKDF2 加盐哈希加密、恒定时间防时序攻击方案，具备完整接口安全防护能力',
    '能够运用 Spring AI Alibaba 大模型框架，具备智能客服、图片识别、函数调用 Function-Calling 大模型工程化落地实战经验',
  ],

  // 在校荣誉
  honors: [
    {
      title: '全国大学生物联网设计竞赛 东部赛区一等奖',
      description: 'A类赛事，智能插座系统项目获奖',
    },
    {
      title: '全国大学生数学建模竞赛 福建省二等奖',
      description: 'A类赛事，展示数据分析和建模能力',
    },
    {
      title: '蓝桥杯 Java 软件开发组 省级二等奖',
      description: 'A类赛事，展示 Java 编程能力',
    },
    {
      title: '计算机软考 软件设计师',
      description: '国家级资格证书',
    },
    {
      title: '大学英语四级 CET-4',
      description: '英语能力认证',
    },
  ],

  // 关于页面描述
  aboutDescription: '我是一名全栈开发工程师，专注于Java后端和Vue3前端技术栈，具备 Spring Cloud 微服务架构设计与 Spring AI 大模型工程化落地实战经验，能够独立完成从需求分析到部署上线的全流程开发。',

  // 简历配置
  resume: {
    pdfPath: '/个人简历.pdf',
    fileName: '刘荣翔-全栈开发工程师.pdf',
  },
}