export interface Honor {
  id: number
  title: string
  description: string
  order: number
}

export interface Strength {
  id: number
  title: string
  description: string
  order: number
}

export interface UserProfile {
  id: number
  nickname: string
  title: string
  greeting: string
  avatar: string | null
  bio: string
  sub_bio: string
  location: string
  email: string
  phone: string
  school: string
  major: string
  education_period: string
  courses: string
  resume_pdf: string | null
  resume_filename: string
  honors: Honor[]
  strengths: Strength[]
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  name: string
  period: string
  role: string
  tech_stack: string
  background: string
  architecture: string
  features: string[]
  responsibilities: string[]
  challenges: string[]
  achievements: string[]
  demo_url: string
  source_url: string
  thumbnail: string | null
  is_visible: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface CarouselProject {
  id: number
  title: string
  description: string
  color: string
  target_progress: number
  order: number
}

export interface QuickLink {
  id: number
  name: string
  url: string
  order: number
}

export interface SkillRadar {
  id: number
  title: string
  labels: string[]
  values: number[]
  fill_color: string
  stroke_color: string
  order: number
}

export interface SocialLink {
  id: number
  name: string
  url: string
  icon: string
  variant: string
  order: number
}

export interface RepoLinks {
  [key: string]: string
}

export interface TimelineEvent {
  id: number
  timeline_type: 'main' | 'tech'
  period: string
  title: string
  role: string
  description: string
  link_type: string
  link_url: string
  order: number
}

export interface Timeline {
  main: TimelineEvent[]
  tech: TimelineEvent[]
}

export interface SiteConfig {
  id: number
  name: string
  title: string
  description: string
  url: string
  locale: string
  favicon: string
  og_image: string
  avatar: string
  blog_bg_image: string
  footer_copyright: string
  footer_slogan: string
  nav_links: Array<{ label: string; href: string }>
  giscus_config: {
    repo: string
    repoId: string
    category: string
    categoryId: string
    lang: string
  }
  category_videos: Record<string, { bvid: string; title: string }>
  created_at: string
  updated_at: string
}

export interface ConfigData {
  profile: UserProfile | null
  projects: Project[]
  carousel_projects: CarouselProject[]
  quick_links: QuickLink[]
  skills: SkillRadar[]
  social_links: SocialLink[]
  repo_links: RepoLinks
  timeline: Timeline
  site_config: SiteConfig | null
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}