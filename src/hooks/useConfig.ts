'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchConfig } from '@/services/api'
import { clearCachedData } from '@/services/cache'
import type { ConfigData } from '@/services/types'

interface UseConfigResult {
  data: ConfigData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useConfig(): UseConfigResult {
  const [data, setData] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const config = await fetchConfig()
      setData(config)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  const refetch = useCallback(async () => {
    clearCachedData('config')
    await fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch }
}

export function useProfile() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    profile: data?.profile,
    loading,
    error,
    refetch,
  }
}

export function useProjects() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    projects: data?.projects || [],
    loading,
    error,
    refetch,
  }
}

export function useCarouselProjects() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    carouselProjects: data?.carousel_projects || [],
    loading,
    error,
    refetch,
  }
}

export function useQuickLinks() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    quickLinks: data?.quick_links || [],
    loading,
    error,
    refetch,
  }
}

export function useSkills() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    skills: data?.skills || [],
    loading,
    error,
    refetch,
  }
}

export function useSocialLinks() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    socialLinks: data?.social_links || [],
    loading,
    error,
    refetch,
  }
}

export function useRepoLinks() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    repoLinks: data?.repo_links || {},
    loading,
    error,
    refetch,
  }
}

export function useTimeline() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    mainTimeline: data?.timeline?.main || [],
    techTimeline: data?.timeline?.tech || [],
    loading,
    error,
    refetch,
  }
}

export function useSiteConfig() {
  const { data, loading, error, refetch } = useConfig()
  
  return {
    siteConfig: data?.site_config,
    loading,
    error,
    refetch,
  }
}