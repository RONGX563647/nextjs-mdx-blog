"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Torus } from '@react-three/drei'
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

// 旋转球体组件
function RotatingSpheres() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={meshRef}>
      <Sphere position={[-3, 2, -5]} scale={1}>
        <meshStandardMaterial color="#3b82f6" opacity={0.2} transparent />
      </Sphere>
      <Sphere position={[3, -2, -5]} scale={1.5}>
        <meshStandardMaterial color="#8b5cf6" opacity={0.2} transparent />
      </Sphere>
      <Sphere position={[0, 0, -8]} scale={0.8}>
        <meshStandardMaterial color="#ec4899" opacity={0.2} transparent />
      </Sphere>
    </group>
  )
}

// 旋转圆环组件
function RotatingTori() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.07
    }
  })

  return (
    <group ref={meshRef}>
      <Torus position={[0, 0, -10]} scale={2} args={[3, 0.5, 16, 100]}>
        <meshStandardMaterial color="#3b82f6" opacity={0.1} transparent />
      </Torus>
      <Torus position={[0, 0, -10]} scale={1.5} args={[2, 0.3, 16, 100]}>
        <meshStandardMaterial color="#8b5cf6" opacity={0.1} transparent />
      </Torus>
    </group>
  )
}

export function Hero3DBackground() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.offsetWidth
        const height = canvasRef.current.offsetHeight
        canvasRef.current.style.width = `${width}px`
        canvasRef.current.style.height = `${height}px`
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      ref={canvasRef}
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    >
      <Canvas camera={{ position: [0, 0, 10] }}>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* 浮动球体 */}
        <RotatingSpheres />
        
        {/* 环绕 torus */}
        <RotatingTori />
      </Canvas>
    </div>
  )
}
