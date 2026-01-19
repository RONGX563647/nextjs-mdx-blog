import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <div className={`
      bg-white/30 dark:bg-gray-800/40
      backdrop-blur-md
      border border-white/50 dark:border-gray-700/50
      rounded-xl
      shadow-lg
      ${hoverEffect ? 'hover:shadow-xl hover:bg-white/40 dark:hover:bg-gray-800/50 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
