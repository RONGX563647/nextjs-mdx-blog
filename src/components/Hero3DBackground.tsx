"use client"

import React from 'react'

export function Hero3DBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/10"></div>
      
      {/* 动画球体 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 球体1 */}
        <div 
          className="absolute w-32 h-32 rounded-full bg-blue-500/20 blur-2xl"
          style={{
            top: '20%',
            left: '10%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        
        {/* 球体2 */}
        <div 
          className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-2xl"
          style={{
            top: '60%',
            right: '15%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        
        {/* 球体3 */}
        <div 
          className="absolute w-24 h-24 rounded-full bg-pink-500/20 blur-2xl"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        
        {/* 圆环 */}
        <div 
          className="absolute w-64 h-64 rounded-full border-2 border-blue-500/10"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'rotate 20s linear infinite',
          }}
        />
        
        <div 
          className="absolute w-48 h-48 rounded-full border-2 border-purple-500/10"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'rotate 15s linear infinite reverse',
          }}
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
