"use client"

import React from 'react'

interface AnimatedSphereProps {
  size: string
  color: string
  top: string
  left: string
  animationDuration: number
  reverse?: boolean
}

interface AnimatedRingProps {
  size: string
  color: string
  animationDuration: number
  reverse?: boolean
}

function AnimatedSphere({ size, color, top, left, animationDuration, reverse = false }: AnimatedSphereProps) {
  return (
    <div 
      className={`absolute ${size} ${size} rounded-full ${color} blur-2xl`}
      style={{
        top,
        left,
        animation: `float ${animationDuration}s ease-in-out infinite ${reverse ? 'reverse' : ''}`,
      }}
    />
  )
}

function AnimatedRing({ size, color, animationDuration, reverse = false }: AnimatedRingProps) {
  return (
    <div 
      className={`absolute ${size} ${size} rounded-full border-2 ${color}`}
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: `rotate ${animationDuration}s linear infinite ${reverse ? 'reverse' : ''}`,
      }}
    />
  )
}

export function Hero3DBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/10"></div>
      
      {/* 动画球体 */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatedSphere 
          size="w-32 h-32"
          color="bg-blue-500/20"
          top="20%"
          left="10%"
          animationDuration={8}
        />
        
        <AnimatedSphere 
          size="w-40 h-40"
          color="bg-purple-500/20"
          top="60%"
          left="85%"
          animationDuration={10}
          reverse
        />
        
        <AnimatedSphere 
          size="w-24 h-24"
          color="bg-pink-500/20"
          top="40%"
          left="50%"
          animationDuration={12}
        />
        
        {/* 圆环 */}
        <AnimatedRing 
          size="w-64 h-64"
          color="border-blue-500/10"
          animationDuration={20}
        />
        
        <AnimatedRing 
          size="w-48 h-48"
          color="border-purple-500/10"
          animationDuration={15}
          reverse
        />
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        
        @keyframes rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
