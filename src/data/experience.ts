/**
 * 经历数据
 * 包含主时间轴（教育+项目经历）和副时间轴（技术发展历程）
 */

export interface TimelineItem {
  period: string
  title: string
  role?: string
  description?: string
  link?: { label: string; url: string }
  color: string // tailwind color: blue/purple/green/yellow/orange/teal/pink/indigo
}

// 主时间轴 - 教育与项目经历
export const mainTimeline: TimelineItem[] = [
  {
    period: '2024.09 - 2028.06',
    title: '福建师范大学',
    role: '软件工程（本科）',
    description: '主修课程：数据结构、算法设计、数据库原理、操作系统、计算机网络、软件工程',
    link: { label: 'Gitee', url: 'https://gitee.com' },
    color: 'blue',
  },
  {
    period: '2025.08 - 2025.10',
    title: '福师畅聊',
    role: '全栈开发工程师',
    description: '基于Java + Vue3技术栈开发的即时通讯应用，使用Netty实现长连接，Spring Boot构建后端API，Vue3 + Element Plus实现前端界面，支持实时消息推送和群聊功能',
    link: { label: 'Gitee', url: 'https://gitee.com' },
    color: 'purple',
  },
  {
    period: '2025.07 - 2025.09',
    title: '师大云学',
    role: '全栈开发工程师',
    description: '基于Java + Vue3技术栈开发的在线教育平台，使用Spring Boot + MyBatis Plus构建后端，Vue3 + Vite实现前端，支持课程管理、在线学习、考试测评等功能',
    link: { label: 'Gitee', url: 'https://gitee.com' },
    color: 'green',
  },
]

// 副时间轴 - 技术发展历程
export const techTimeline: TimelineItem[] = [
  {
    period: '2024.10.1',
    title: '洛谷oj',
    description: '50题',
    color: 'blue',
  },
  {
    period: '2024.12.1',
    title: 'Leetcode',
    description: 'oc100题',
    color: 'indigo',
  },
  {
    period: '2025.6.1',
    title: '软件工程实践课项目',
    description: '银行管理系统\njava + jdbc + swing',
    link: { label: 'GitHub', url: 'https://github.com/RONGX563647/bank' },
    color: 'yellow',
  },
  {
    period: '2025.10.1',
    title: 'CSDN',
    description: '10w浏览量',
    color: 'green',
  },
  {
    period: '2025.11.1',
    title: '计算机网络实践课项目',
    description: '局域网聊天室',
    link: { label: 'GitHub', url: 'https://github.com/RONGX563647/NewChatRoom' },
    color: 'orange',
  },
  {
    period: '2025.12.1',
    title: '数据库实践课项目',
    description: 'CMP管理系统',
    link: { label: 'Gitee', url: 'https://gitee.com' },
    color: 'teal',
  },
  {
    period: '2026.1',
    title: 'Web应用开发课项目',
    description: '简易Mybatis',
    link: { label: 'Gitee', url: 'https://gitee.com' },
    color: 'pink',
  },
]
