'use client'

import { useRef, useMemo, useState } from 'react'
// import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { PlumbingTool } from '@/types/plumbing'

interface ToolProps {
  _tool: PlumbingTool
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  showLabels?: boolean
  interactive?: boolean
  onHover?: (_hovered: boolean) => void
  onClick?: () => void
  highlighted?: boolean
  inUse?: boolean
}

// Pipe Wrench Tool
export function PipeWrench({
  tool,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  _inUse = false
}: ToolProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const { scaleSpring, rotationZ } = useSpring({
    scaleSpring: highlighted ? 1.1 : 1,
    rotationZ: isAnimating ? Math.PI * 0.1 : 0,
    config: { tension: 300, friction: 10 }
  })
  
  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B0000',
    roughness: 0.6,
    metalness: 0.1
  }), [])
  
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1
  }), [])
  
  const handleClick = () => {
    onClick?.()
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      <animated.group
        scale={scaleSpring}
        rotation-z={rotationZ}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={handleClick}
      >
        {/* Handle */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.6, 16]} />
          <primitive object={handleMaterial} />
        </mesh>
        
        {/* Fixed Jaw */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <boxGeometry args={[0.05, 0.15, 0.03]} />
          <primitive object={metalMaterial} />
        </mesh>
        
        {/* Movable Jaw */}
        <mesh position={[0.02, 0.32, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.03]} />
          <primitive object={metalMaterial} />
        </mesh>
        
        {/* Adjustment Mechanism */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 16]} />
          <primitive object={metalMaterial} />
        </mesh>
        
        {/* Grip Texture on Handle */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, -0.2 + i * 0.05, 0]}>
            <torusGeometry args={[0.025, 0.002, 8, 16]} />
            <meshStandardMaterial color="#600000" />
          </mesh>
        ))}
      </animated.group>
      
      {showLabels && (
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.06}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Pipe Wrench
        </Text>
      )}
      
      {highlighted && showLabels && (
        <Html position={[0.4, 0.1, 0]}>
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <h4 className="font-bold text-sm mb-1">Safety Tips:</h4>
            <ul className="text-xs space-y-1">
              <li>• Always pull, never push</li>
              <li>• Use two wrenches for leverage</li>
              <li>• Check jaw condition before use</li>
              <li>• Wear safety glasses</li>
            </ul>
          </div>
        </Html>
      )}
    </group>
  )
}

// Tubing Cutter Tool
export function TubingCutter({
  tool,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  _inUse = false
}: ToolProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [cutting, setCutting] = useState(false)
  
  const { scaleSpring, wheelRotation } = useSpring({
    scaleSpring: highlighted ? 1.1 : 1,
    wheelRotation: cutting ? Math.PI * 4 : 0,
    config: { tension: 200, friction: 15 }
  })
  
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF6600',
    roughness: 0.4,
    metalness: 0.2
  }), [])
  
  const bladeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E0E0E0',
    metalness: 0.95,
    roughness: 0.05
  }), [])
  
  const handleClick = () => {
    onClick?.()
    setCutting(true)
    setTimeout(() => setCutting(false), 2000)
  }
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      <animated.group
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={handleClick}
      >
        {/* Main Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.08, 0.06]} />
          <primitive object={bodyMaterial} />
        </mesh>
        
        {/* Cutting Wheel */}
        <animated.mesh position={[0, 0, 0.04]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 32]} />
          <primitive object={bladeMaterial} />
        </animated.mesh>
        
        {/* Pressure Rollers */}
        <mesh position={[0.05, 0, -0.04]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        <mesh position={[-0.05, 0, -0.04]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        
        {/* Adjustment Knob */}
        <mesh position={[0, -0.06, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.015, 0.03, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Knob Ridges */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const x = Math.cos(angle) * 0.028
          const z = Math.sin(angle) * 0.028
          return (
            <mesh key={i} position={[x, -0.06, z]}>
              <boxGeometry args={[0.003, 0.03, 0.008]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          )
        })}
      </animated.group>
      
      {showLabels && (
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.06}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Tubing Cutter
        </Text>
      )}
      
      {cutting && (
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.05}
          color="#FF6600"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Cutting...
        </Text>
      )}
    </group>
  )
}

// Channel Lock Pliers
export function ChannelLocks({
  tool,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  _inUse = false
}: ToolProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [isGripping, setIsGripping] = useState(false)
  
  const { scaleSpring, jawAngle } = useSpring({
    scaleSpring: highlighted ? 1.1 : 1,
    jawAngle: isGripping ? -Math.PI / 6 : 0,
    config: { tension: 300, friction: 10 }
  })
  
  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0000CD',
    roughness: 0.6,
    metalness: 0.1
  }), [])
  
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1
  }), [])
  
  const handleClick = () => {
    onClick?.()
    setIsGripping(!isGripping)
  }
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      <animated.group
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={handleClick}
      >
        {/* Lower Handle/Jaw */}
        <mesh rotation={[0, 0, Math.PI / 12]} castShadow receiveShadow>
          <boxGeometry args={[0.03, 0.5, 0.02]} />
          <primitive object={handleMaterial} />
        </mesh>
        
        {/* Upper Handle/Jaw */}
        <animated.mesh rotation-z={jawAngle} castShadow receiveShadow>
          <boxGeometry args={[0.03, 0.5, 0.02]} />
          <primitive object={handleMaterial} />
        </animated.mesh>
        
        {/* Lower Jaw */}
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 12]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.04]} />
          <primitive object={metalMaterial} />
        </mesh>
        
        {/* Upper Jaw */}
        <animated.mesh 
          position={[0, 0.28, 0]} 
          rotation-z={jawAngle}
          castShadow
        >
          <boxGeometry args={[0.06, 0.12, 0.04]} />
          <primitive object={metalMaterial} />
        </animated.mesh>
        
        {/* Pivot Pin */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.05, 16]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        
        {/* Channel Adjustment */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.04, 0.08, 0.02]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* Serrated Jaws */}
        {[...Array(6)].map((_, i) => (
          <group key={i}>
            <mesh position={[-0.02 + i * 0.008, 0.28, 0.025]}>
              <boxGeometry args={[0.002, 0.12, 0.01]} />
              <meshStandardMaterial color="#999999" />
            </mesh>
          </group>
        ))}
      </animated.group>
      
      {showLabels && (
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.06}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Channel Locks
        </Text>
      )}
      
      {highlighted && showLabels && (
        <Html position={[0.3, 0.1, 0]}>
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <h4 className="font-bold text-sm mb-1">Usage:</h4>
            <ul className="text-xs space-y-1">
              <li>• Adjust channel for pipe size</li>
              <li>• Grip close to work piece</li>
              <li>• Use steady pressure</li>
              <li>• Good for rounded objects</li>
            </ul>
          </div>
        </Html>
      )}
    </group>
  )
}

// Pipe Threading Machine
export function ThreadingMachine({
  tool,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  _inUse = false
}: ToolProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [isThreading, setIsThreading] = useState(false)
  
  const { scaleSpring, chuckRotation } = useSpring({
    scaleSpring: highlighted ? 1.05 : 1,
    chuckRotation: isThreading ? Math.PI * 6 : 0,
    config: { tension: 200, friction: 20 }
  })
  
  const machineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2F4F4F',
    roughness: 0.6,
    metalness: 0.4
  }), [])
  
  const handleClick = () => {
    onClick?.()
    setIsThreading(true)
    setTimeout(() => setIsThreading(false), 3000)
  }
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      <animated.group
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={handleClick}
      >
        {/* Base */}
        <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.1, 0.3]} />
          <primitive object={machineMaterial} />
        </mesh>
        
        {/* Motor Housing */}
        <mesh position={[-0.15, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
          <primitive object={machineMaterial} />
        </mesh>
        
        {/* Chuck Assembly */}
        <animated.mesh 
          position={[0.1, 0.05, 0]} 
          rotation-z={chuckRotation}
          castShadow 
          receiveShadow
        >
          <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </animated.mesh>
        
        {/* Die Head */}
        <mesh position={[0.2, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        
        {/* Pipe Support Arms */}
        <mesh position={[0.3, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.03, 0.03]} />
          <primitive object={machineMaterial} />
        </mesh>
        
        {/* Threading Dies */}
        {[...Array(4)].map((_, i) => {
          const angle = (i / 4) * Math.PI * 2
          const x = Math.cos(angle) * 0.035
          const z = Math.sin(angle) * 0.035
          return (
            <mesh key={i} position={[0.2 + x, 0.05, z]}>
              <boxGeometry args={[0.01, 0.08, 0.01]} />
              <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
            </mesh>
          )
        })}
        
        {/* Control Switch */}
        <mesh position={[-0.1, 0.15, -0.1]} castShadow>
          <boxGeometry args={[0.03, 0.03, 0.02]} />
          <meshStandardMaterial color={isThreading ? "#00FF00" : "#FF0000"} />
        </mesh>
      </animated.group>
      
      {showLabels && (
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.06}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Threading Machine
        </Text>
      )}
      
      {isThreading && (
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.05}
          color="#FF6600"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Threading NPT...
        </Text>
      )}
      
      {highlighted && showLabels && (
        <Html position={[0.5, 0.1, 0]}>
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <h4 className="font-bold text-sm mb-1">Threading Process:</h4>
            <ol className="text-xs space-y-1">
              <li>1. Secure pipe in chuck</li>
              <li>2. Select correct die size</li>
              <li>3. Apply cutting oil</li>
              <li>4. Start threading operation</li>
              <li>5. Check thread depth</li>
            </ol>
          </div>
        </Html>
      )}
    </group>
  )
}

// Tool Storage/Organization Component
export function ToolBox({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  _tools = [],
  onToolSelect
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  tools?: PlumbingTool[]
  onToolSelect?: (tool: PlumbingTool) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const { lidRotation } = useSpring({
    lidRotation: isOpen ? -Math.PI / 2 : 0,
    config: { tension: 200, friction: 20 }
  })
  
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      {/* Tool Box Body */}
      <mesh 
        castShadow 
        receiveShadow
        onClick={() => setIsOpen(!isOpen)}
      >
        <boxGeometry args={[0.6, 0.15, 0.3]} />
        <meshStandardMaterial color="#FF0000" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Tool Box Lid */}
      <animated.mesh 
        position={[0, 0.075, 0.15]}
        rotation-x={lidRotation}
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.6, 0.03, 0.3]} />
        <meshStandardMaterial color="#CC0000" metalness={0.3} roughness={0.7} />
      </animated.mesh>
      
      {/* Handle */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Tools inside (when open) */}
      {isOpen && (
        <group position={[0, 0.08, 0]}>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.05}
            color="#FFFFFF"
            anchorX="center"
          >
            Plumbing Tools
          </Text>
          {_tools.slice(0, 3).map((tool, index) => (
            <mesh
              key={tool.id}
              position={[-0.2 + index * 0.2, 0, 0]}
              onClick={() => onToolSelect?.(tool)}
            >
              <boxGeometry args={[0.05, 0.02, 0.15]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

const PlumbingToolsComponents = {
  PipeWrench,
  TubingCutter,
  ChannelLocks,
  ThreadingMachine,
  ToolBox
}

export default PlumbingToolsComponents