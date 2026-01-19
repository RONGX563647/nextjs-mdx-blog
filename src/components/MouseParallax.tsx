'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ReactNode, useEffect } from 'react'

interface MouseParallaxProps {
  children: ReactNode
  intensity?: number
  className?: string
}

export function MouseParallax({ children, intensity = 10, className }: MouseParallaxProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [intensity, -intensity])
  const rotateY = useTransform(x, [-100, 100], [-intensity, intensity])
  const translateX = useTransform(x, [-100, 100], [-intensity/2, intensity/2])
  const translateY = useTransform(y, [-100, 100], [-intensity/2, intensity/2])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const { clientX, clientY } = e

      x.set((clientX / innerWidth - 0.5) * 200)
      y.set((clientY / innerHeight - 0.5) * 200)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  return (
    <motion.div
      className={className}
      style={{
        rotateX,
        rotateY,
        translateX,
        translateY,
        transformStyle: "preserve-3d"
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
