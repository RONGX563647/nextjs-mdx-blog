'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Check, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Site {
  id: string
  name: string
  url: string
}

interface ExpandingNavBarProps {
  isExpanded: boolean
  onToggle: () => void
}

const defaultSites: Site[] = [
  {
    id: '1',
    name: '本地服务器',
    url: 'https://117.72.210.10:8888/home'
  },
  {
    id: '2',
    name: '面试鸭',
    url: 'https://www.mianshiya.com/bank/1787463103423897602'
  },
  {
    id: '3',
    name: '小林coding',
    url: 'https://xiaolincoding.com/'
  },
  {
    id: '4',
    name: 'Java笔记',
    url: 'https://www.bookstack.cn/books/sdky-java-note'
  },
  {
    id: '5',
    name: 'LeetCode',
    url: 'https://leetcode.cn/studyplan/top-100-liked/'
  }
]

export function ExpandingNavBar({ isExpanded, onToggle }: ExpandingNavBarProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingUrl, setEditingUrl] = useState('')

  // Load sites from localStorage or use defaults
  useEffect(() => {
    // Clear old localStorage data to use new default sites with friendly names
    localStorage.removeItem('expandingNavBarSites')
    
    // Always use default sites with friendly names
    setSites(defaultSites)
  }, [])

  // Save sites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('expandingNavBarSites', JSON.stringify(sites))
  }, [sites])

  const handleAddSite = () => {
    // Validate inputs
    if (!newName.trim()) {
      setValidationError('Please enter a site name')
      return
    }

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
      name: newName,
      url: newUrl
    }

    setSites([...sites, newSite])
    setNewName('')
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

  const handleEditSite = (site: Site) => {
    setEditingId(site.id)
    setEditingName(site.name)
    setEditingUrl(site.url)
  }

  const handleSaveEdit = () => {
    // Validate inputs
    if (!editingName.trim()) {
      setValidationError('Please enter a site name')
      return
    }

    if (!editingUrl.trim()) {
      setValidationError('Please enter a URL')
      return
    }

    try {
      new URL(editingUrl)
    } catch {
      setValidationError('Please enter a valid URL')
      return
    }

    // Update site
    setSites(sites.map(site => 
      site.id === editingId 
        ? { ...site, name: editingName, url: editingUrl }
        : site
    ))
    
    setEditingId(null)
    setEditingName('')
    setEditingUrl('')
    setValidationError('')
    setShowSuccess(true)
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditingUrl('')
    setValidationError('')
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
                  className="flex flex-col gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  {editingId === site.id ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Enter site name"
                          className="px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          placeholder="Enter URL"
                          className="px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleSaveEdit}
                          className="text-sm"
                        >
                          Save
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <a 
                        href={site.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary truncate flex-1"
                      >
                        {site.name}
                      </a>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditSite(site)}
                          className="hover:bg-accent/20 hover:text-accent rounded-full"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveSite(site.id)}
                          className="hover:bg-destructive/20 hover:text-destructive rounded-full"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add New Site Section */}
        <div className="mt-6">
          {isAdding ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter site name"
                  className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {validationError && (
                <p className="text-sm text-destructive mt-1">{validationError}</p>
              )}
              <div className="flex gap-3">
                <Button onClick={handleAddSite} className="whitespace-nowrap">
                  Add Site
                </Button>
                <Button variant="ghost" onClick={() => {
                  setIsAdding(false)
                  setNewName('')
                  setNewUrl('')
                  setValidationError('')
                }}>
                  Cancel
                </Button>
              </div>
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
