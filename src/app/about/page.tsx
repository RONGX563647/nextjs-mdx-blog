'use client'

import { Button } from '@/components/ui/button'
import { Github, GitMerge, Linkedin, Mail, Phone, MapPin, Award, Download } from 'lucide-react'
import Link from 'next/link'
import { ResumeDownloadButton } from '@/components/resume/ResumeDownloadButton'
import { useProfile, useSocialLinks, useSkills, useTimeline } from '@/hooks/useConfig'
import { profileConfig } from '@/data/profile'
import { socialLinks, repoLinks } from '@/data/social'
import { skillRadars } from '@/data/skills'
import { mainTimeline, techTimeline } from '@/data/experience'

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  linkedin: <Linkedin size={18} />,
}

const variantMap: Record<string, string> = {
  gray: 'bg-gradient-to-r from-gray-800/10 to-gray-600/10 hover:from-gray-800/20 hover:to-gray-600/20 border-gray-600/30',
  blue: 'bg-gradient-to-r from-blue-700/10 to-blue-500/10 hover:from-blue-700/20 hover:to-blue-500/20 border-blue-700/30',
}

const colorMap: Record<string, { dot: string; text: string }> = {
  blue: { dot: 'bg-blue-600 dark:bg-blue-400', text: 'text-blue-600 dark:text-blue-400' },
  purple: { dot: 'bg-purple-600 dark:bg-purple-400', text: 'text-purple-600 dark:text-purple-400' },
  green: { dot: 'bg-green-600 dark:bg-green-400', text: 'text-green-600 dark:text-green-400' },
  yellow: { dot: 'bg-yellow-500 dark:bg-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' },
  orange: { dot: 'bg-orange-500 dark:bg-orange-400', text: 'text-orange-600 dark:text-orange-400' },
  teal: { dot: 'bg-teal-500 dark:bg-teal-400', text: 'text-teal-600 dark:text-teal-400' },
  pink: { dot: 'bg-pink-500 dark:bg-pink-400', text: 'text-pink-600 dark:text-pink-400' },
  indigo: { dot: 'bg-indigo-500 dark:bg-indigo-400', text: 'text-indigo-600 dark:text-indigo-400' },
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-muted rounded w-48"></div>
      <div className="h-24 bg-muted rounded w-full max-w-3xl"></div>
      <div className="flex gap-4">
        <div className="h-10 bg-muted rounded w-32"></div>
        <div className="h-10 bg-muted rounded w-32"></div>
      </div>
    </div>
  )
}

export default function About() {
  const { profile, loading: profileLoading } = useProfile()
  const { socialLinks: apiSocialLinks, loading: socialLoading } = useSocialLinks()
  const { skills: apiSkills, loading: skillsLoading } = useSkills()
  const { mainTimeline: apiMainTimeline, techTimeline: apiTechTimeline, loading: timelineLoading } = useTimeline()
  
  const isLoading = profileLoading || socialLoading || skillsLoading || timelineLoading
  
  const displayProfile = profile || {
    nickname: profileConfig.name,
    title: profileConfig.title,
    bio: profileConfig.bio,
    sub_bio: profileConfig.subBio,
    location: profileConfig.contact.location,
    email: profileConfig.contact.email,
    phone: profileConfig.contact.phone,
    school: profileConfig.education.school,
    major: profileConfig.education.major,
    education_period: profileConfig.education.period,
    strengths: profileConfig.strengths.map((s, i) => ({ id: i + 1, title: s, description: '', order: i })),
    honors: profileConfig.honors.map((h, i) => ({ id: i + 1, title: h.title, description: h.description, order: i })),
  }
  
  const displaySocialLinks = apiSocialLinks.length > 0 
    ? apiSocialLinks 
    : socialLinks
  
  const displaySkills = apiSkills.length > 0 
    ? apiSkills.map(s => ({
        title: s.title,
        labels: s.labels,
        values: s.values,
        fillColor: s.fill_color,
        strokeColor: s.stroke_color,
      }))
    : skillRadars
  
  const displayMainTimeline = apiMainTimeline.length > 0 
    ? apiMainTimeline.map((e, i) => ({
        period: e.period,
        title: e.title,
        role: e.role,
        description: e.description,
        color: ['blue', 'purple', 'green', 'yellow', 'orange', 'teal', 'pink', 'indigo'][i % 8],
        link: e.link_url ? { url: e.link_url, label: e.link_type || 'Link' } : undefined,
      }))
    : mainTimeline
  
  const displayTechTimeline = apiTechTimeline.length > 0 
    ? apiTechTimeline.map((e, i) => ({
        period: e.period,
        title: e.title,
        description: e.description,
        color: ['blue', 'purple', 'green', 'yellow', 'orange', 'teal', 'pink', 'indigo'][i % 8],
        link: e.link_url ? { url: e.link_url, label: e.link_type || 'Link' } : undefined,
      }))
    : techTimeline
  
  return (
    <div>
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">关于我</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
                {displayProfile.bio}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <ResumeDownloadButton />
                {displaySocialLinks.filter(s => s.icon === 'github' || s.icon === 'linkedin').map((social) => (
                  <Button key={social.name} asChild variant="secondary" className={variantMap[social.variant || ''] || ''}>
                    <a href={social.url} className="flex items-center gap-2">
                      {iconMap[social.icon]}
                      {social.name}
                    </a>
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">个人信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">期望地点</h3>
                  <p className="text-gray-600 dark:text-gray-300">{displayProfile.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">邮箱</h3>
                  <p className="text-gray-600 dark:text-gray-300">{displayProfile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">电话</h3>
                  <p className="text-gray-600 dark:text-gray-300">{displayProfile.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">教育背景</h3>
                  <p className="text-gray-600 dark:text-gray-300">{displayProfile.school} · {displayProfile.major}</p>
                  <p className="text-gray-600 dark:text-gray-300">{displayProfile.education_period}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-semibold text-xl">核心优势</h3>
              <ul className="space-y-4">
                {displayProfile.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span>{typeof strength === 'string' ? strength : strength.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">经历时间轴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="relative max-w-3xl mx-auto">
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-600/20 dark:bg-blue-400/20 transform md:translate-x-[-50%]"></div>
                
                <div className="space-y-12">
                  {displayMainTimeline.map((item, index) => {
                    const colors = colorMap[item.color] || colorMap.blue
                    const isLeft = index % 2 === 0
                    return (
                      <div key={index} className="relative flex flex-col md:flex-row items-start">
                        <div className={`absolute left-[-9px] md:left-1/2 top-4 w-4 h-4 rounded-full ${colors.dot} transform md:translate-x-[-50%] z-10`}></div>
                        <div className={`md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right mb-6 md:mb-0' : 'md:pr-12'}`}>
                          {isLeft && (
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                              <span className={`text-sm ${colors.text} font-semibold`}>{item.period}</span>
                              <h3 className="text-xl font-semibold mt-2 mb-2">{item.title}</h3>
                              {item.role && <p className="text-gray-600 dark:text-gray-300">{item.role}</p>}
                              {item.description && <p className="text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>}
                              {item.link && (
                                <div className="mt-4 flex gap-2">
                                  <Button asChild variant="secondary" size="sm">
                                    <a href={item.link.url} className="flex items-center gap-2">
                                      <GitMerge size={14} />
                                      {item.link.label}
                                    </a>
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className={`md:w-1/2 ${isLeft ? 'md:pl-12' : 'md:pl-12'}`}>
                          {!isLeft && (
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                              <span className={`text-sm ${colors.text} font-semibold`}>{item.period}</span>
                              <h3 className="text-xl font-semibold mt-2 mb-2">{item.title}</h3>
                              {item.role && <p className="text-gray-600 dark:text-gray-300">{item.role}</p>}
                              {item.description && <p className="text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>}
                              {item.link && (
                                <div className="mt-4 flex gap-2">
                                  <Button asChild variant="secondary" size="sm">
                                    <a href={item.link.url} className="flex items-center gap-2">
                                      <GitMerge size={14} />
                                      {item.link.label}
                                    </a>
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold mb-6">技术发展历程</h3>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                <div className="space-y-8 pl-6">
                  {displayTechTimeline.map((item, index) => {
                    const colors = colorMap[item.color] || colorMap.blue
                    const descLines = (item.description || '').split('\n')
                    return (
                      <div key={index} className="relative">
                        <div className={`absolute left-[-10px] top-2 w-4 h-4 rounded-full ${colors.dot}`}></div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <span className={`text-sm ${colors.text} font-semibold`}>{item.period}</span>
                          <h4 className="text-lg font-semibold mt-2 mb-2">{item.title}</h4>
                          {descLines.map((line, i) => (
                            <p key={i} className={`text-gray-600 dark:text-gray-300${i > 0 ? ' text-sm mt-1' : ''}`}>{line}</p>
                          ))}
                          {item.link && (
                            <div className="mt-3 flex gap-2">
                              <Button asChild variant="secondary" size="sm">
                                <a href={item.link.url} className="flex items-center gap-2">
                                  <GitMerge size={12} />
                                  {item.link.label}
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12">技能雷达图</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {displaySkills.map((radar, radarIndex) => {
              const sides = radar.labels.length
              const angleStep = (2 * Math.PI) / sides
              return (
                <div key={radarIndex} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-6 text-center">{radar.title}</h3>
                  <div className="aspect-square max-w-md mx-auto">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <g stroke="#e5e7eb" strokeWidth="1" fill="none">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <polygon
                            key={level}
                            points={Array.from({ length: sides }, (_, i) =>
                              `${100 + 80 * Math.cos(i * angleStep) * (level / 5)},${100 + 80 * Math.sin(i * angleStep) * (level / 5)}`
                            ).join(' ')}
                            className="dark:stroke-gray-700"
                          />
                        ))}
                        {Array.from({ length: sides }, (_, i) => (
                          <line
                            key={i}
                            x1="100"
                            y1="100"
                            x2={100 + 80 * Math.cos(i * angleStep)}
                            y2={100 + 80 * Math.sin(i * angleStep)}
                            className="dark:stroke-gray-700"
                          />
                        ))}
                      </g>
                      
                      <polygon
                        points={radar.values.map((val, i) =>
                          `${100 + 80 * Math.cos(i * angleStep) * val},${100 + 80 * Math.sin(i * angleStep) * val}`
                        ).join(' ')}
                        fill={radar.fillColor}
                        stroke={radar.strokeColor}
                        strokeWidth="2"
                      />
                      
                      <g fontSize="11" textAnchor="middle" fill="#6b7280" className="dark:fill-gray-300">
                        {radar.labels.map((label, i) => {
                          const labelRadius = 95
                          const x = 100 + labelRadius * Math.cos(i * angleStep)
                          const y = 100 + labelRadius * Math.sin(i * angleStep)
                          return <text key={i} x={x} y={y + 4}>{label}</text>
                        })}
                      </g>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-10">在校荣誉</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayProfile.honors.map((honor, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{honor.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{honor.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-10">联系方式</h2>
        <div className="flex flex-wrap gap-4">
          <ResumeDownloadButton />
          {displaySocialLinks.filter(s => s.icon === 'github' || s.icon === 'linkedin').map((social) => (
            <Button key={social.name} asChild variant="secondary">
              <a href={social.url} className="flex items-center gap-2">
                {iconMap[social.icon]}
                {social.name}
              </a>
            </Button>
          ))}
        </div>
      </section>
    </div>
  )
}