/**
 * 个人信息数据
 * 包含个人基本资料、联系方式、教育背景、核心优势等
 */

export const profileConfig = {
  // 基本介绍
  title: '全栈开发工程师',
  name: 'RONGX',
  greeting: '你好，我是',
  bio: '专注于 Java 后端和 Vue3 前端开发，致力于构建高质量的全栈应用',
  subBio: '从基础到进阶，记录学习过程中的思考与总结，分享技术见解与实践经验',

  // 联系方式
  contact: {
    location: '福州',
    email: 'lrx563647@qq.com',
    phone: '18876381526',
  },

  // 教育背景
  education: {
    school: '福建师范大学',
    major: '软件工程（本科）',
    period: '2024.09 - 2028.06',
    courses: '数据结构、算法设计、数据库原理、操作系统、计算机网络、软件工程',
  },

  // 核心优势
  strengths: [
    'Java基础知识扎实，了解JUC/JVM，熟悉SSM、Spring Boot、Spring Cloud等后端框架',
    '熟悉Vue3生态，掌握Composition API、Pinia状态管理、Vue Router路由等前端技术',
    '掌握MySQL、Redis等数据库技术，了解SQL优化和缓存设计',
    '熟悉Linux操作系统，掌握Docker容器化技术和基本的服务器部署运维技能',
    '具备完整的项目开发经验，能够独立完成从需求分析到部署上线的全流程开发',
  ],

  // 在校荣誉
  honors: [
    {
      title: 'ACM CCPC 省级铜奖',
      description: '算法竞赛奖项，展示了扎实的编程基础和问题解决能力',
    },
    {
      title: '蓝桥杯 Java 开发 省级二等奖',
      description: 'Java 开发竞赛奖项，展示了 Java 编程能力',
    },
    {
      title: '全国大学生数学建模竞赛 省级一等奖',
      description: '数学建模竞赛奖项，展示了数据分析和建模能力',
    },
  ],

  // 关于页面描述
  aboutDescription: '我是一名全栈开发工程师，专注于Java后端和Vue3前端技术栈，拥有扎实的前后端开发基础，能够独立完成从需求分析到部署上线的全流程开发。',

  // 简历配置
  resume: {
    pdfPath: '/1.pdf',
    fileName: '刘荣显-全栈开发工程师.pdf',
  },
}
