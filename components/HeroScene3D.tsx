'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Box, Octahedron, Torus, Float, Trail, Sparkles } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useDrag } from '@use-gesture/react'
import * as THREE from 'three'

// Floating geometric shape component
function FloatingShape({ position, color, shape = 'sphere', scale = 1 }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [spring, api] = useSpring(() => ({
    position: position,
    rotation: [0, 0, 0],
    scale: scale,
  }))

  // Dragging interaction
  const bind = useDrag(({ offset: [x, y], down }) => {
    api.start({
      position: [x / 100, -y / 100, position[2]],
      scale: down ? scale * 1.2 : scale,
    })
  })

  // Continuous rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
      
      // Gentle floating motion
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002
    }
  })

  const ShapeComponent = useMemo(() => {
    switch (shape) {
      case 'box':
        return Box
      case 'octahedron':
        return Octahedron
      case 'torus':
        return Torus
      default:
        return Sphere
    }
  }, [shape])

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <animated.mesh
        ref={meshRef}
        {...spring}
        {...bind()}
        castShadow
        receiveShadow
      >
        <ShapeComponent args={shape === 'torus' ? [1, 0.4, 16, 100] : [1, 32, 32]}>
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.8}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </ShapeComponent>
        
        {/* Glow effect */}
        <Sphere args={[1.2, 32, 32]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
      </animated.mesh>
    </Float>
  )
}

// Particle connections between elements
function ParticleConnections() {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i < 50; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ))
    }
    return pts
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Dynamic lighting setup
function SceneLighting() {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 10
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 10
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        ref={lightRef}
        position={[10, 10, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} color="#6366f1" intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={0.5} />
    </>
  )
}

// Camera controller for parallax
function CameraController() {
  const { camera } = useThree()
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      
      camera.position.x += (x * 2 - camera.position.x) * 0.05
      camera.position.y += (y * 2 - camera.position.y) * 0.05
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [camera])

  return null
}

// Main 3D Scene component
export function HeroScene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        shadows
        gl={{ alpha: true, antialias: true }}
        className="bg-transparent"
      >
        <CameraController />
        <SceneLighting />
        
        {/* Floating shapes at different depths */}
        <FloatingShape position={[-4, 2, 0]} color="#6366f1" shape="sphere" scale={1.2} />
        <FloatingShape position={[4, -2, -2]} color="#8b5cf6" shape="box" scale={0.8} />
        <FloatingShape position={[-2, -3, 1]} color="#06b6d4" shape="octahedron" scale={1} />
        <FloatingShape position={[3, 3, -1]} color="#10b981" shape="torus" scale={0.6} />
        <FloatingShape position={[0, 0, -3]} color="#f59e0b" shape="sphere" scale={0.7} />
        <FloatingShape position={[-5, 0, 2]} color="#ef4444" shape="box" scale={0.9} />
        
        {/* Particle effects */}
        <ParticleConnections />
        <Sparkles count={30} scale={10} size={2} speed={0.5} color="#6366f1" />
        
        {/* Background elements for depth */}
        <group position={[0, 0, -5]}>
          <FloatingShape position={[8, 4, 0]} color="#6366f1" shape="sphere" scale={0.5} />
          <FloatingShape position={[-8, -4, 0]} color="#8b5cf6" shape="octahedron" scale={0.4} />
        </group>
      </Canvas>
    </div>
  )
}