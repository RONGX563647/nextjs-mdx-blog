'use client'

import React, { useState } from 'react'
import { Container } from '@/components/Container'
import { Navigation } from '@/components/Navigation'
import ThemeSwitch from '@/components/ThemeSwitch'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { ExpandingNavBar } from '@/components/ExpandingNavBar'

/**
 * Header component with double-click logo functionality
 * Handles the header layout and expanding navigation bar
 */
export function HeaderWithDoubleClick() {
  // State for tracking if the navigation bar is expanded
  const [isNavBarExpanded, setIsNavBarExpanded] = useState(false)

  // Toggle the expanding navigation bar
  const toggleNavBar = () => {
    setIsNavBarExpanded(!isNavBarExpanded)
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <Container>
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-5xl font-bold tracking-tighter cursor-pointer"
                onDoubleClick={toggleNavBar}
              >
                RONGX
              </Link>
              <Navigation />
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://blog.csdn.net/King_model?type=blogColumn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                CSDN
              </a>
              <a 
                href="https://github.com/RONGX563647" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Github size={20} />
                GitHub
              </a>
              <ThemeSwitch />
            </div>
          </div>
        </Container>
      </header>
      
      {/* Expanding Navigation Bar */}
      <ExpandingNavBar 
        isExpanded={isNavBarExpanded} 
        onToggle={toggleNavBar} 
      />
    </>
  )
}
