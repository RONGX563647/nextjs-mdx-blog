/**
 * 技能数据
 * 包含雷达图数据、技能分类等
 */

export interface SkillRadar {
  title: string
  labels: string[]
  values: number[]
  fillColor: string
  strokeColor: string
}

export const skillRadars: SkillRadar[] = [
  {
    title: '后端技术能力',
    labels: ['Java', 'Spring Boot', 'MySQL', 'Linux'],
    values: [0.95, 0.90, 0.85, 0.80],
    fillColor: 'rgba(59, 130, 246, 0.2)',
    strokeColor: '#3b82f6',
  },
  {
    title: '前端技术能力',
    labels: ['Vue3', 'JavaScript', 'CSS3', 'HTML5'],
    values: [0.95, 0.90, 0.85, 0.80],
    fillColor: 'rgba(139, 92, 246, 0.2)',
    strokeColor: '#8b5cf6',
  },
]
