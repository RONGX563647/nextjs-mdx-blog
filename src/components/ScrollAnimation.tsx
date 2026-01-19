'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode } from 'react'

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollAnimation({ children, className, delay = 0 }: ScrollAnimationProps) {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.1], [50, 0])

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: "easeOut"
      }}
      viewport={{
        once: true,
        margin: "-100px"
      }}
      style={{
        opacity,
        y
      }}
    >
      {children}
    </motion.div>
  )
}
