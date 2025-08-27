'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useBVH } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { PlumbingComponent } from '@/types/plumbing'

interface FittingProps {
  component: PlumbingComponent
  position?: [number, number, number]
  rotation?: [number, number, number]
  diameter?: number
  showLabels?: boolean
  interactive?: boolean
  onHover?: (hovered: boolean) => void
  onClick?: () => void
  highlighted?: boolean
  angle?: number
}

// 90-degree Elbow Fitting
export function ElbowFitting({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  angle = 90
}: FittingProps) {
  const groupRef = useRef<THREE.Group>(null!)
  
  const material = useMemo(() => {
    const materials = {
      copper: new THREE.MeshStandardMaterial({
        color: '#B87333',
        metalness: 0.8,
        roughness: 0.2,
      }),
      pvc: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: 0.1,
      }),
      abs: new THREE.MeshStandardMaterial({
        color: '#2C2C2C',
        metalness: 0.0,
        roughness: 0.4,
      })
    }
    return materials[component.material as keyof typeof materials] || materials.pvc
  }, [component.material])
  
  const { scale, emissiveIntensity } = useSpring({
    scale: highlighted ? 1.1 : 1,
    emissiveIntensity: highlighted ? 0.3 : 0,
    config: { tension: 300, friction: 10 }
  })
  
  // Create elbow geometry using torus
  const elbowGeometry = useMemo(() => {
    const radius = diameter * 1.5
    const tube = diameter
    return new THREE.TorusGeometry(radius, tube, 16, 32, (Math.PI * angle) / 180)
  }, [diameter, angle])
  
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
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      <animated.mesh
        geometry={elbowGeometry}
        material={material}
        scale={scale}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={onClick}
        castShadow
        receiveShadow
      />
      
      {/* Connection points */}
      <mesh position={[diameter * 1.5, diameter * 1.5, 0]}>
        <cylinderGeometry args={[diameter, diameter, diameter * 0.2, 16]} />
        <meshStandardMaterial color={material.color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-diameter * 1.5, diameter * 1.5, 0]}>
        <cylinderGeometry args={[diameter, diameter, diameter * 0.2, 16]} />
        <meshStandardMaterial color={material.color} metalness={0.8} roughness={0.3} />
      </mesh>
      
      {showLabels && (
        <Text
          position={[0, diameter * 2.5, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          {angle}° Elbow
        </Text>
      )}
    </group>
  )
}

// T-Fitting Component
export function TeeFitting({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false
}: FittingProps) {
  const groupRef = useRef<THREE.Group>(null!)
  
  const material = useMemo(() => {
    const materials = {
      copper: new THREE.MeshStandardMaterial({
        color: '#B87333',
        metalness: 0.8,
        roughness: 0.2,
      }),
      pvc: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: 0.1,
      }),
      abs: new THREE.MeshStandardMaterial({
        color: '#2C2C2C',
        metalness: 0.0,
        roughness: 0.4,
      })
    }
    return materials[component.material as keyof typeof materials] || materials.pvc
  }, [component.material])
  
  const { scale } = useSpring({
    scale: highlighted ? 1.1 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      {/* Main horizontal pipe */}
      <animated.mesh
        scale={scale}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[diameter, diameter, diameter * 4, 16]} />
        <primitive object={material} />
      </animated.mesh>
      
      {/* Branch pipe - vertical */}
      <animated.mesh 
        position={[0, diameter * 2, 0]}
        scale={scale}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[diameter, diameter, diameter * 2, 16]} />
        <primitive object={material} />
      </animated.mesh>
      
      {/* Center connector sphere */}
      <animated.mesh scale={scale} castShadow receiveShadow>
        <sphereGeometry args={[diameter * 1.3, 16, 16]} />
        <primitive object={material} />
      </animated.mesh>
      
      {showLabels && (
        <Text
          position={[0, diameter * 3.5, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Tee Fitting
        </Text>
      )}
    </group>
  )
}

// Reducer Fitting Component
export function ReducerFitting({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false
}: FittingProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const smallDiameter = diameter * 0.7 // 30% reduction
  
  const material = useMemo(() => {
    const materials = {
      copper: new THREE.MeshStandardMaterial({
        color: '#B87333',
        metalness: 0.8,
        roughness: 0.2,
      }),
      pvc: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: 0.1,
      })
    }
    return materials[component.material as keyof typeof materials] || materials.pvc
  }, [component.material])
  
  const { scale } = useSpring({
    scale: highlighted ? 1.1 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  // Create reducer geometry
  const reducerGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(diameter, smallDiameter, diameter * 2, 16)
    return geometry
  }, [diameter, smallDiameter])
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      <animated.mesh
        geometry={reducerGeometry}
        material={material}
        scale={scale}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      />
      
      {showLabels && (
        <Text
          position={[0, diameter * 2, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Reducer
        </Text>
      )}
      
      {showLabels && (
        <Text
          position={[0, -diameter * 1.5, 0]}
          fontSize={0.06}
          color="#666666"
          anchorX="center"
          font="/fonts/inter-regular.woff"
        >
          {component.size}" → {(parseFloat(component.size) * 0.7).toFixed(1)}"
        </Text>
      )}
    </group>
  )
}

// Union Fitting Component (for removable connections)
export function UnionFitting({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false
}: FittingProps) {
  const groupRef = useRef<THREE.Group>(null!)
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#B87333',
      metalness: 0.9,
      roughness: 0.1,
    })
  }, [])
  
  const { scale, rotationY } = useSpring({
    scale: highlighted ? 1.1 : 1,
    rotationY: highlighted ? Math.PI * 0.1 : 0,
    config: { tension: 300, friction: 10 }
  })
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      {/* Main body */}
      <animated.mesh
        scale={scale}
        rotation-y={rotationY}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[diameter * 1.2, diameter * 1.2, diameter * 1.5, 16]} />
        <primitive object={material} />
      </animated.mesh>
      
      {/* Threaded connections */}
      <animated.mesh position={[0, diameter * 0.9, 0]} scale={scale}>
        <cylinderGeometry args={[diameter, diameter, diameter * 0.3, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </animated.mesh>
      <animated.mesh position={[0, -diameter * 0.9, 0]} scale={scale}>
        <cylinderGeometry args={[diameter, diameter, diameter * 0.3, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </animated.mesh>
      
      {/* Threading detail */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, -0.1 + i * 0.02, 0]}>
          <torusGeometry args={[diameter + 0.01, 0.003, 8, 16]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      
      {showLabels && (
        <Text
          position={[0, diameter * 2, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Union
        </Text>
      )}
    </group>
  )
}

// Coupling Component (for connecting same-size pipes)
export function CouplingFitting({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  diameter = 0.1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false
}: FittingProps) {
  const groupRef = useRef<THREE.Group>(null!)
  
  const material = useMemo(() => {
    const materials = {
      copper: new THREE.MeshStandardMaterial({
        color: '#B87333',
        metalness: 0.8,
        roughness: 0.2,
      }),
      pvc: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: 0.1,
      })
    }
    return materials[component.material as keyof typeof materials] || materials.pvc
  }, [component.material])
  
  const { scale } = useSpring({
    scale: highlighted ? 1.05 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      <animated.mesh
        scale={scale}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[diameter * 1.1, diameter * 1.1, diameter * 1.5, 16]} />
        <primitive object={material} />
      </animated.mesh>
      
      {/* Inner sleeve detail */}
      <animated.mesh scale={scale}>
        <cylinderGeometry args={[diameter * 0.95, diameter * 0.95, diameter * 1.6, 16]} />
        <meshStandardMaterial 
          color={material.color} 
          metalness={0.6} 
          roughness={0.4}
          transparent
          opacity={0.8}
        />
      </animated.mesh>
      
      {showLabels && (
        <Text
          position={[0, diameter * 2, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Coupling
        </Text>
      )}
    </group>
  )
}

export default {
  ElbowFitting,
  TeeFitting,
  ReducerFitting,
  UnionFitting,
  CouplingFitting
}