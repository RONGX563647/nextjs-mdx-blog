/**
 * 社交链接数据
 * 包含所有社交媒体和外部链接
 */

export interface SocialLink {
  name: string
  url: string
  icon: 'github' | 'linkedin' | 'csdn' | 'gitee' | 'gitmerge'
  variant?: string
}

export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/RONGX563647',
    icon: 'github',
    variant: 'gray',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    icon: 'linkedin',
    variant: 'blue',
  },
  {
    name: 'CSDN',
    url: 'https://blog.csdn.net/King_model?type=blogColumn',
    icon: 'csdn',
  },
]

// 仓库链接（用于时间轴等）
export const repoLinks = {
  bank: 'https://github.com/RONGX563647/bank',
  chatRoom: 'https://github.com/RONGX563647/NewChatRoom',
  gitee: 'https://gitee.com',
  github: 'https://github.com/RONGX563647',
}
