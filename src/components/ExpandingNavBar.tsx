'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Site {
  id: string
  url: string
}

interface ExpandingNavBarProps {
  isExpanded: boolean
  onToggle: () => void
}

const defaultSites: Site[] = [
  {
    id: '1',
    url: 'https://117.72.210.10:8888/home'
  },
  {
    id: '2',
    url: 'https://www.mianshiya.com/bank/1787463103423897602'
  },
  {
    id: '3',
    url: 'https://xiaolincoding.com/'
  },
  {
    id: '4',
    url: 'https://www.bookstack.cn/books/sdky-java-note'
  },
  {
    id: '5',
    url: 'https://leetcode.cn/studyplan/top-100-liked/'
  }
]

export function ExpandingNavBar({ isExpanded, onToggle }: ExpandingNavBarProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Load sites from localStorage or use defaults
  useEffect(() => {
    const savedSites = localStorage.getItem('expandingNavBarSites')
    if (savedSites) {
      try {
        setSites(JSON.parse(savedSites))
      } catch {
        setSites(defaultSites)
      }
    } else {
      setSites(defaultSites)
    }
  }, [])

  // Save sites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('expandingNavBarSites', JSON.stringify(sites))
  }, [sites])

  const handleAddSite = () => {
    // Validate URL
    if (!newUrl.trim()) {
      setValidationError('Please enter a URL')
      return
    }

    try {
      new URL(newUrl)
    } catch {
      setValidationError('Please enter a valid URL')
      return
    }

    // Add new site
    const newSite: Site = {
      id: Date.now().toString(),
      url: newUrl
    }

    setSites([...sites, newSite])
    setNewUrl('')
    setIsAdding(false)
    setValidationError('')
    setShowSuccess(true)
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
  }

  const handleRemoveSite = (id: string) => {
    setSites(sites.filter(site => site.id !== id))
  }

  if (!isExpanded) return null

  return (
    <div className="bg-background border-b border-border py-4 animate-slideDown">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggle}
              className="hover:bg-accent rounded-full"
            >
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sites.map((site) => (
                <div 
                  key={site.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <a 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:text-primary truncate flex-1"
                  >
                    {site.url}
                  </a>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveSite(site.id)}
                    className="hover:bg-destructive/20 hover:text-destructive rounded-full"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add New Site Section */}
        <div className="mt-6">
          {isAdding ? (
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter URL (e.g., https://example.com)"
                className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationError && (
                <p className="text-sm text-destructive mt-1">{validationError}</p>
              )}
              <Button onClick={handleAddSite} className="whitespace-nowrap">
                Add Site
              </Button>
              <Button variant="ghost" onClick={() => {
                setIsAdding(false)
                setNewUrl('')
                setValidationError('')
              }}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="secondary" 
              onClick={() => setIsAdding(true)}
              className="mt-2"
            >
              <Plus size={16} className="mr-2" />
              Add New Site
            </Button>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mt-4 flex items-center gap-2 text-sm text-success">
            <Check size={16} />
            <span>Site added successfully!</span>
          </div>
        )}
      </div>
    </div>
  )
}
