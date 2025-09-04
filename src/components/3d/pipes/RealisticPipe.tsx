'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useBVH } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { PlumbingComponent } from '@/types/plumbing'

interface RealisticPipeProps {
  component: PlumbingComponent
  position?: [number, number, number]
  rotation?: [number, number, number]
  length?: number
  diameter?: number
  showLabels?: boolean
  interactive?: boolean
  onHover?: (_hovered: boolean) => void
  onClick?: () => void
  highlighted?: boolean
}

export function RealisticPipe({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  length = 2,
  diameter = 0.1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false
}: RealisticPipeProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  
  // Enhanced materials with realistic properties
  const material = useMemo(() => {
    const materials = {
      copper: new THREE.MeshStandardMaterial({
        color: '#B87333',
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 1.0,
        // Add subtle texture
        normalMap: createNormalTexture(),
      }),
      pvc: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: 0.1,
        transparent: false,
        envMapIntensity: 0.3,
      }),
      abs: new THREE.MeshStandardMaterial({
        color: '#2C2C2C',
        metalness: 0.0,
        roughness: 0.4,
        envMapIntensity: 0.2,
      }),
      pex: new THREE.MeshStandardMaterial({
        color: '#FF6B6B',
        metalness: 0.0,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 0.5,
      }),
      'cast-iron': new THREE.MeshStandardMaterial({
        color: '#36454F',
        metalness: 0.6,
        roughness: 0.8,
        envMapIntensity: 0.4,
      }),
      steel: new THREE.MeshStandardMaterial({
        color: '#71797E',
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.2,
      }),
      other: new THREE.MeshStandardMaterial({
        color: '#CCCCCC',
        metalness: 0.3,
        roughness: 0.5,
      })
    }
    
    return materials[component.material] || materials.other
  }, [component.material])
  
  // Create subtle normal texture for surface detail
  function createNormalTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Create subtle noise pattern for pipe texture
    const imageData = ctx.createImageData(256, 256)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 0.1 + 0.5
      imageData.data[i] = noise * 128 + 127     // R
      imageData.data[i + 1] = noise * 128 + 127 // G
      imageData.data[i + 2] = 255               // B (normal Z)
      imageData.data[i + 3] = 255               // A
    }
    ctx.putImageData(imageData, 0, 0)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 1)
    
    return texture
  }
  
  // Animation springs for interactions
  const { scale } = useSpring({
    scale: highlighted ? 1.05 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  // Add BVH for efficient collision detection
  useBVH(meshRef)
  
  // Pipe geometry with realistic segments
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      diameter,
      diameter,
      length,
      32, // More segments for smoother appearance
      1
    )
    
    // Add end caps for realism
    const capGeometry = new THREE.CircleGeometry(diameter, 32)
    const topCapGeometry = capGeometry.clone()
    topCapGeometry.translate(0, length / 2, 0)
    topCapGeometry.rotateX(-Math.PI / 2)
    
    const bottomCapGeometry = capGeometry.clone()
    bottomCapGeometry.translate(0, -length / 2, 0)
    bottomCapGeometry.rotateX(Math.PI / 2)
    
    const mergedGeometry = new THREE.BufferGeometry()
    mergedGeometry.copy(geo)
    // Note: For production, you'd merge the geometries properly
    
    return mergedGeometry
  }, [diameter, length])
  
  // Enhanced interaction handlers
  const handlePointerEnter = () => {
    if (interactive && onHover) {
      onHover(true)
      document.body.style.cursor = 'pointer'
    }
  }
  
  const handlePointerLeave = () => {
    if (interactive && onHover) {
      onHover(false)
      document.body.style.cursor = 'auto'
    }
  }
  
  const handleClick = (e: any) => {
    if (interactive && onClick) {
      e.stopPropagation()
      onClick()
    }
  }
  
  // Add subtle animation for "living" feel
  useFrame(({ clock }) => {
    if (meshRef.current && component.material === 'pex') {
      // Subtle breathing effect for flexible pipes
      const breathe = Math.sin(clock.elapsedTime * 0.5) * 0.002
      meshRef.current.scale.setScalar(1 + breathe)
    }
  })
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      <animated.mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        scale={scale}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        castShadow
        receiveShadow
      />
      
      {/* Pipe threading for threaded pipes */}
      {component.material === 'steel' && (
        <mesh position={[0, length / 2 - 0.05, 0]}>
          <torusGeometry args={[diameter + 0.01, 0.005, 8, 16]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
        </mesh>
      )}
      
      {/* Size marking */}
      {showLabels && (
        <Text
          position={[0, diameter + 0.1, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          anchorY="bottom"
          font="/fonts/inter-bold.woff"
        >
          {component.size}"
        </Text>
      )}
      
      {/* Material label */}
      {showLabels && (
        <Text
          position={[0, -diameter - 0.1, 0]}
          fontSize={0.06}
          color="#666666"
          anchorX="center"
          anchorY="top"
          font="/fonts/inter-regular.woff"
        >
          {component.material.toUpperCase()}
        </Text>
      )}
      
      {/* Hover info panel */}
      {highlighted && showLabels && (
        <group position={[length / 2 + 0.2, 0, 0]}>
          <mesh>
            <planeGeometry args={[1, 0.6]} />
            <meshBasicMaterial color="white" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0.15, 0.01]}
            fontSize={0.05}
            color="#1E0F2E"
            anchorX="center"
            font="/fonts/inter-bold.woff"
          >
            {component.name}
          </Text>
          <Text
            position={[0, 0.05, 0.01]}
            fontSize={0.04}
            color="#666666"
            anchorX="center"
            font="/fonts/inter-regular.woff"
          >
            Size: {component.size}"
          </Text>
          <Text
            position={[0, -0.05, 0.01]}
            fontSize={0.04}
            color="#666666"
            anchorX="center"
            font="/fonts/inter-regular.woff"
          >
            Material: {component.material}
          </Text>
          <Text
            position={[0, -0.15, 0.01]}
            fontSize={0.03}
            color="#888888"
            anchorX="center"
            font="/fonts/inter-regular.woff"
            maxWidth={0.9}
          >
            {component.description}
          </Text>
        </group>
      )}
    </group>
  )
}

export default RealisticPipe