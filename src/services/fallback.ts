import { profileConfig } from '@/data/profile'
import { projects, carouselProjects, quickLinks, categoryVideos, giscusConfig } from '@/data/projects'
import { skillRadars } from '@/data/skills'
import { socialLinks, repoLinks } from '@/data/social'
import { mainTimeline, techTimeline } from '@/data/experience'
import { siteConfig } from '@/data/site'
import type { ConfigData, UserProfile, Project, CarouselProject, QuickLink, SkillRadar, SocialLink, RepoLinks, Timeline, SiteConfig } from './types'

function transformProfile(): UserProfile {
  return {
    id: 1,
    nickname: profileConfig.name,
    title: profileConfig.title,
    greeting: profileConfig.greeting,
    avatar: null,
    bio: profileConfig.bio,
    sub_bio: profileConfig.subBio,
    location: profileConfig.contact.location,
    email: profileConfig.contact.email,
    phone: profileConfig.contact.phone,
    school: profileConfig.education.school,
    major: profileConfig.education.major,
    education_period: profileConfig.education.period,
    courses: profileConfig.education.courses,
    resume_pdf: profileConfig.resume.pdfPath,
    resume_filename: profileConfig.resume.fileName,
    honors: profileConfig.honors.map((h, i) => ({
      id: i + 1,
      title: h.title,
      description: h.description,
      order: i,
    })),
    strengths: profileConfig.strengths.map((s, i) => ({
      id: i + 1,
      title: s,
      description: '',
      order: i,
    })),
    created_at: '',
    updated_at: '',
  }
}

function transformProjects(): Project[] {
  return projects.map((p, i) => ({
    id: i + 1,
    name: p.title,
    period: p.date,
    role: '全栈开发工程师',
    tech_stack: p.skills.join(','),
    background: p.background,
    architecture: p.architecture || '',
    features: p.features,
    responsibilities: p.responsibilities,
    challenges: p.challenges.map(c => `${c.challenge}: ${c.solution}`),
    achievements: p.achievements,
    demo_url: '',
    source_url: '',
    thumbnail: null,
    is_visible: true,
    order: i,
    created_at: '',
    updated_at: '',
  }))
}

function transformCarouselProjects(): CarouselProject[] {
  return carouselProjects.map((p, i) => ({
    id: parseInt(p.id),
    title: p.title,
    description: p.description,
    color: p.color,
    target_progress: p.targetProgress,
    order: i,
  }))
}

function transformQuickLinks(): QuickLink[] {
  return quickLinks.map((l, i) => ({
    id: parseInt(l.id),
    name: l.name,
    url: l.url,
    order: i,
  }))
}

function transformSkills(): SkillRadar[] {
  return skillRadars.map((s, i) => ({
    id: i + 1,
    title: s.title,
    labels: s.labels,
    values: s.values,
    fill_color: s.fillColor,
    stroke_color: s.strokeColor,
    order: i,
  }))
}

function transformSocialLinks(): SocialLink[] {
  return socialLinks.map((l, i) => ({
    id: i + 1,
    name: l.name,
    url: l.url,
    icon: l.icon,
    variant: l.variant || 'gray',
    order: i,
  }))
}

function transformRepoLinks(): RepoLinks {
  return repoLinks
}

function transformTimeline(): Timeline {
  return {
    main: mainTimeline.map((e, i) => ({
      id: i + 1,
      timeline_type: 'main' as const,
      period: e.period,
      title: e.title,
      role: e.role || '',
      description: '',
      link_type: e.link?.label || '',
      link_url: e.link?.url || '',
      order: i,
    })),
    tech: techTimeline.map((e, i) => ({
      id: i + 1,
      timeline_type: 'tech' as const,
      period: e.period,
      title: e.title,
      role: '',
      description: e.description || '',
      link_type: e.link?.label || '',
      link_url: e.link?.url || '',
      order: i,
    })),
  }
}

function transformSiteConfig(): SiteConfig {
  return {
    id: 1,
    name: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
    favicon: siteConfig.favicon,
    og_image: siteConfig.ogImage,
    avatar: siteConfig.avatar,
    blog_bg_image: siteConfig.blogBgImage,
    footer_copyright: siteConfig.footer.copyright,
    footer_slogan: siteConfig.footer.slogan,
    nav_links: siteConfig.nav,
    giscus_config: giscusConfig,
    category_videos: categoryVideos,
    created_at: '',
    updated_at: '',
  }
}

export function getFallbackData(): ConfigData {
  return {
    profile: transformProfile(),
    projects: transformProjects(),
    carousel_projects: transformCarouselProjects(),
    quick_links: transformQuickLinks(),
    skills: transformSkills(),
    social_links: transformSocialLinks(),
    repo_links: transformRepoLinks(),
    timeline: transformTimeline(),
    site_config: transformSiteConfig(),
  }
}