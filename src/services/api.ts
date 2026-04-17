import type { ConfigData, ApiResponse } from './types'
import { getCachedData, setCachedData } from './cache'
import { getFallbackData } from './fallback'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json()
}

export async function fetchConfig(): Promise<ConfigData> {
  const cacheKey = 'config'
  const cached = getCachedData<ConfigData>(cacheKey)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetchApi<ConfigData>('/config/')
    
    if (response.code === 200 && response.data) {
      setCachedData(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.message || 'Failed to fetch config')
  } catch (error) {
    console.warn('API unavailable, using fallback data:', error)
    return getFallbackData()
  }
}

export async function fetchProfile(): Promise<ConfigData['profile']> {
  const config = await fetchConfig()
  return config.profile
}

export async function fetchProjects(): Promise<ConfigData['projects']> {
  const config = await fetchConfig()
  return config.projects
}

export async function fetchCarouselProjects(): Promise<ConfigData['carousel_projects']> {
  const config = await fetchConfig()
  return config.carousel_projects
}

export async function fetchQuickLinks(): Promise<ConfigData['quick_links']> {
  const config = await fetchConfig()
  return config.quick_links
}

export async function fetchSkills(): Promise<ConfigData['skills']> {
  const config = await fetchConfig()
  return config.skills
}

export async function fetchSocialLinks(): Promise<ConfigData['social_links']> {
  const config = await fetchConfig()
  return config.social_links
}

export async function fetchRepoLinks(): Promise<ConfigData['repo_links']> {
  const config = await fetchConfig()
  return config.repo_links
}

export async function fetchTimeline(): Promise<ConfigData['timeline']> {
  const config = await fetchConfig()
  return config.timeline
}

export async function fetchSiteConfig(): Promise<ConfigData['site_config']> {
  const config = await fetchConfig()
  return config.site_config
}

export { getFallbackData }