'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Cylinder, Sphere, Text } from '@react-three/drei'
import { PlumbingModel3D } from '@/types/plumbing'

interface ThreeDRendererProps {
  model?: PlumbingModel3D
  showLabels?: boolean
  interactive?: boolean
  className?: string
}

// Basic pipe component
function Pipe({ 
  length = 2, 
  diameter = 0.1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  material = 'copper'
}: {
  length?: number
  diameter?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  material?: string
}) {
  const meshRef = useRef<any>()

  const getMaterialColor = (material: string) => {
    switch (material) {
      case 'copper': return '#B87333'
      case 'pvc': return '#FFFFFF'
      case 'abs': return '#2C2C2C'
      case 'pex': return '#FF6B6B'
      default: return '#CCCCCC'
    }
  }

  return (
    <mesh ref={meshRef} position={position} rotation={rotation as any}>
      <cylinderGeometry args={[diameter, diameter, length, 16]} />
      <meshStandardMaterial color={getMaterialColor(material)} />
    </mesh>
  )
}

// Elbow fitting component
function Elbow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  material = 'copper'
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  diameter?: number
  material?: string
}) {
  const getMaterialColor = (material: string) => {
    switch (material) {
      case 'copper': return '#B87333'
      case 'pvc': return '#FFFFFF'
      case 'abs': return '#2C2C2C'
      case 'pex': return '#FF6B6B'
      default: return '#CCCCCC'
    }
  }

  return (
    <group position={position} rotation={rotation as any}>
      {/* Vertical pipe */}
      <mesh position={[0, diameter, 0]}>
        <cylinderGeometry args={[diameter, diameter, diameter * 2, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
      {/* Horizontal pipe */}
      <mesh position={[diameter, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[diameter, diameter, diameter * 2, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
      {/* Corner piece */}
      <mesh>
        <sphereGeometry args={[diameter * 1.2, 16, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
    </group>
  )
}

// T-fitting component
function TeeFitting({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  material = 'copper'
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  diameter?: number
  material?: string
}) {
  const getMaterialColor = (material: string) => {
    switch (material) {
      case 'copper': return '#B87333'
      case 'pvc': return '#FFFFFF'
      case 'abs': return '#2C2C2C'
      case 'pex': return '#FF6B6B'
      default: return '#CCCCCC'
    }
  }

  return (
    <group position={position} rotation={rotation as any}>
      {/* Main horizontal pipe */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[diameter, diameter, diameter * 4, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
      {/* Branch pipe */}
      <mesh position={[0, diameter * 2, 0]}>
        <cylinderGeometry args={[diameter, diameter, diameter * 2, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
      {/* Center connector */}
      <mesh>
        <sphereGeometry args={[diameter * 1.3, 16, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
    </group>
  )
}

// P-trap component
function PTrap({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.15,
  material = 'pvc'
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  diameter?: number
  material?: string
}) {
  const getMaterialColor = (material: string) => {
    switch (material) {
      case 'copper': return '#B87333'
      case 'pvc': return '#FFFFFF'
      case 'abs': return '#2C2C2C'
      case 'pex': return '#FF6B6B'
      default: return '#CCCCCC'
    }
  }

  return (
    <group position={position} rotation={rotation as any}>
      {/* Inlet pipe */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[diameter, diameter, 1.6, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
      
      {/* U-bend - using multiple segments to create curve */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 5) * Math.PI
        const x = Math.sin(angle) * 0.5
        const y = -Math.cos(angle) * 0.5 - 0.5
        const rotation = [0, 0, -angle]
        
        return (
          <mesh key={i} position={[x, y, 0]} rotation={rotation as any}>
            <cylinderGeometry args={[diameter, diameter, 0.2, 16]} />
            <meshStandardMaterial color={getMaterialColor(material)} />
          </mesh>
        )
      })}
      
      {/* Outlet pipe */}
      <mesh position={[0.5, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[diameter, diameter, 1, 16]} />
        <meshStandardMaterial color={getMaterialColor(material)} />
      </mesh>
    </group>
  )
}

// Toilet flange component
function ToiletFlange({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.2
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  diameter?: number
}) {
  return (
    <group position={position} rotation={rotation as any}>
      {/* Flange ring */}
      <mesh>
        <cylinderGeometry args={[diameter * 2, diameter * 2, 0.05, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Center pipe connection */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[diameter, diameter, 0.2, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Bolt holes */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2
        const x = Math.cos(angle) * diameter * 1.5
        const z = Math.sin(angle) * diameter * 1.5
        
        return (
          <mesh key={i} position={[x, 0.03, z]}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        )
      })}
    </group>
  )
}

// Sample plumbing scene
function PlumbingScene({ type = 'basic-connection' }: { type?: string }) {
  switch (type) {
    case 'toilet-flange':
      return (
        <>
          <ToiletFlange position={[0, 0, 0]} />
          <Pipe position={[0, -0.5, 0]} length={2} diameter={0.15} material="pvc" />
        </>
      )
    
    case 'p-trap':
      return (
        <>
          <PTrap position={[0, 0, 0]} />
          <Pipe position={[0, 1.3, 0]} length={1} diameter={0.15} material="pvc" />
          <Pipe position={[1, -0.2, 0]} length={2} diameter={0.15} material="pvc" rotation={[0, 0, Math.PI / 2]} />
        </>
      )
    
    case 'pipe-joints':
      return (
        <>
          <Pipe position={[-2, 0, 0]} length={1.5} diameter={0.1} material="copper" />
          <Elbow position={[-0.5, 0, 0]} />
          <Pipe position={[0.5, 1, 0]} length={1.5} diameter={0.1} material="copper" />
          <TeeFitting position={[1.5, 0, 0]} />
          <Pipe position={[2.5, 1, 0]} length={1} diameter={0.1} material="copper" />
        </>
      )
    
    default:
      return (
        <>
          <Pipe position={[0, 0, 0]} length={2} diameter={0.1} material="copper" />
          <Elbow position={[1.2, 0, 0]} />
        </>
      )
  }
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div className="text-gray-600">Loading 3D model...</div>
    </div>
  )
}

export function ThreeDRenderer({ 
  model, 
  showLabels = true, 
  interactive = true,
  className = "w-full h-96"
}: ThreeDRendererProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ background: '#f8f9fa' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Controls */}
          {interactive && <OrbitControls enableZoom enablePan enableRotate />}
          
          {/* Plumbing components */}
          <PlumbingScene type={model?.modelPath || 'basic-connection'} />
          
          {/* Labels */}
          {showLabels && (
            <Text
              position={[0, -2, 0]}
              fontSize={0.2}
              color="#1E0F2E"
              anchorX="center"
              anchorY="middle"
            >
              3D Plumbing Visualization
            </Text>
          )}
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#e0e0e0" opacity={0.5} transparent />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}

export default ThreeDRenderer