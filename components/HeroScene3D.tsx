'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Box, Octahedron } from '@react-three/drei'
import * as THREE from 'three'

// Simple floating shape component
function FloatingShape({ position, color, shape = 'sphere', scale = 1 }: {
  position: [number, number, number]
  color: string
  shape?: string
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.3
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.5
    }
  })

  const ShapeComponent = shape === 'box' ? Box : shape === 'octahedron' ? Octahedron : Sphere

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <ShapeComponent args={[0.8, 16, 16]}>
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.7}
          transparent
          opacity={0.6}
        />
      </ShapeComponent>
    </mesh>
  )
}

// Simple lighting
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={0.3} />
    </>
  )
}

// Main 3D Scene component
export function HeroScene3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-30">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        className="bg-transparent"
      >
        <SceneLighting />
        
        {/* Simple floating shapes */}
        <FloatingShape position={[-3, 2, 0]} color="#3b82f6" shape="sphere" scale={0.8} />
        <FloatingShape position={[3, -2, -1]} color="#06b6d4" shape="box" scale={0.6} />
        <FloatingShape position={[0, 1, -2]} color="#10b981" shape="octahedron" scale={0.7} />
      </Canvas>
    </div>
  )
}