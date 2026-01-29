/**
 * 3D背景组件
 * 为英雄区域提供3D动画背景效果，包括浮动球体和旋转圆环
 */

// 标记为客户端组件
"use client"

// 导入必要的工具
import React from 'react' // React库

/**
 * 动画球体组件的属性接口
 */
interface AnimatedSphereProps {
  size: string // 球体尺寸
  color: string // 球体颜色
  top: string // 顶部位置
  left: string // 左侧位置
  animationDuration: number // 动画持续时间（秒）
  reverse?: boolean // 是否反向动画，默认为false
}

/**
 * 动画圆环组件的属性接口
 */
interface AnimatedRingProps {
  size: string // 圆环尺寸
  color: string // 圆环颜色
  animationDuration: number // 动画持续时间（秒）
  reverse?: boolean // 是否反向动画，默认为false
}

/**
 * 动画球体组件
 * 创建一个浮动的球体效果
 * @param size 球体尺寸
 * @param color 球体颜色
 * @param top 顶部位置
 * @param left 左侧位置
 * @param animationDuration 动画持续时间（秒）
 * @param reverse 是否反向动画，默认为false
 * @returns 动画球体组件
 */
function AnimatedSphere({ size, color, top, left, animationDuration, reverse = false }: AnimatedSphereProps) {
  return (
    <div 
      // 绝对定位的球体
      className={`absolute ${size} ${size} rounded-full ${color} blur-2xl`}
      style={{
        top, // 顶部位置
        left, // 左侧位置
        // 应用浮动动画
        animation: `float ${animationDuration}s ease-in-out infinite ${reverse ? 'reverse' : ''}`,
      }}
    />
  )
}

/**
 * 动画圆环组件
 * 创建一个旋转的圆环效果
 * @param size 圆环尺寸
 * @param color 圆环颜色
 * @param animationDuration 动画持续时间（秒）
 * @param reverse 是否反向动画，默认为false
 * @returns 动画圆环组件
 */
function AnimatedRing({ size, color, animationDuration, reverse = false }: AnimatedRingProps) {
  return (
    <div 
      // 绝对定位的圆环
      className={`absolute ${size} ${size} rounded-full border-2 ${color}`}
      style={{
        top: '50%', // 垂直居中
        left: '50%', // 水平居中
        transform: 'translate(-50%, -50%)', // 居中偏移
        // 应用旋转动画
        animation: `rotate ${animationDuration}s linear infinite ${reverse ? 'reverse' : ''}`,
      }}
    />
  )
}

/**
 * 3D背景组件
 * 为英雄区域提供3D动画背景效果，包括浮动球体和旋转圆环
 * @returns 3D背景组件
 */
export function Hero3DBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/10"></div>
      
      {/* 动画球体和圆环 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 蓝色浮动球体 */}
        <AnimatedSphere 
          size="w-32 h-32"
          color="bg-blue-500/20"
          top="20%"
          left="10%"
          animationDuration={8}
        />
        
        {/* 紫色浮动球体（反向动画） */}
        <AnimatedSphere 
          size="w-40 h-40"
          color="bg-purple-500/20"
          top="60%"
          left="85%"
          animationDuration={10}
          reverse
        />
        
        {/* 粉色浮动球体 */}
        <AnimatedSphere 
          size="w-24 h-24"
          color="bg-pink-500/20"
          top="40%"
          left="50%"
          animationDuration={12}
        />
        
        {/* 蓝色旋转圆环 */}
        <AnimatedRing 
          size="w-64 h-64"
          color="border-blue-500/10"
          animationDuration={20}
        />
        
        {/* 紫色旋转圆环（反向动画） */}
        <AnimatedRing 
          size="w-48 h-48"
          color="border-purple-500/10"
          animationDuration={15}
          reverse
        />
      </div>
      
      {/* 全局样式：定义浮动和旋转动画 */}
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
