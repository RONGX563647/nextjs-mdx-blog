/**
 * 网站配置数据
 * 包含网站的基本信息、元数据、导航等
 */

export const siteConfig = {
  // 网站基本信息
  name: 'RONGX',
  title: 'RONGX',
  description: '基于 Next.js 15 + TypeScript + Tailwind CSS 构建的个人博客网站，融合了创意设计与技术展示。',
  url: 'https://nextjs-typescript-mdx-blog.vercel.app',
  locale: 'zh-CN',
  language: 'zh-CN',

  // 图标和图片
  favicon: '/1.png',
  ogImage: '/og-image.png',
  avatar: '/1.png',
  blogBgImage: 'https://rongxpicture.oss-cn-beijing.aliyuncs.com/image-20260207210813997.png',

  // 页脚
  footer: {
    copyright: 'RONGX',
    slogan: '构建高质量的全栈应用',
  },

  // 导航链接
  nav: [
    { label: '首页', href: '/' },
    { label: '关于', href: '/about' },
    { label: '项目', href: '/portfolio' },
    { label: '博客', href: '/blog' },
  ],
}
