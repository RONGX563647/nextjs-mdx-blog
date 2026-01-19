"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

interface Project {
  id: string
  title: string
  description: string
  color: string
}

interface ThreeDCarouselProps {
  projects?: Project[]
}

const defaultProjects: Project[] = [
  {
    id: '1',
    title: '福师畅聊',
    description: '即时通讯应用',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: '师大云学',
    description: '在线教育平台',
    color: '#8b5cf6'
  },
  {
    id: '3',
    title: '自动化测试',
    description: '测试框架',
    color: '#ec4899'
  },
  {
    id: '4',
    title: '性能测试',
    description: '压测工具',
    color: '#10b981'
  },
  {
    id: '5',
    title: '接口测试',
    description: 'API测试',
    color: '#f59e0b'
  }
]

// 旋转木马组件
function CarouselGroup({ projects }: { projects: Project[] }) {
  const groupRef = useRef<THREE.Group>(null)

  // 使用useFrame实现旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {projects.map((project, index) => {
        const angle = (index / projects.length) * Math.PI * 2
        const radius = 4
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        return (
          <group key={project.id} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[2, 2, 0.2]} />
              <meshStandardMaterial 
                color={project.color} 
                opacity={0.8} 
                transparent
              />
              <Text
                position={[0, 0, 0.11]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {project.title}
              </Text>
              <Text
                position={[0, -0.5, 0.11]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.2}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {project.description}
              </Text>
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function ThreeDCarousel({ projects = defaultProjects }: ThreeDCarouselProps) {
  return (
    <div className="w-full h-96 relative">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls enableZoom={false} enablePan={false} />

        <CarouselGroup projects={projects} />
      </Canvas>
    </div>
  )
}
