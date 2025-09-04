'use client'

import { useRef, useMemo, useState } from 'react'
// import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { PlumbingComponent } from '@/types/plumbing'

interface FixtureProps {
  component: PlumbingComponent
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  showLabels?: boolean
  interactive?: boolean
  onHover?: (_hovered: boolean) => void
  onClick?: () => void
  highlighted?: boolean
  cutaway?: boolean
}

// Toilet Fixture with detailed components
export function ToiletFixture({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  cutaway = false
}: FixtureProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [showInternals, setShowInternals] = useState(cutaway)
  
  const { scaleSpring } = useSpring({
    scaleSpring: highlighted ? 1.05 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  // Toilet materials
  const porcelainMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F5F5F5',
    metalness: 0.1,
    roughness: 0.1,
    transparent: showInternals,
    opacity: showInternals ? 0.7 : 1
  }), [showInternals])
  
  const waterMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4A90E2',
    metalness: 0.0,
    roughness: 0.0,
    transparent: true,
    opacity: 0.6
  }), [])
  
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1
  }), [])
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      {/* Toilet Bowl */}
      <animated.mesh
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={() => {
          onClick?.()
          setShowInternals(!showInternals)
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
        <primitive object={porcelainMaterial} />
      </animated.mesh>
      
      {/* Toilet Tank */}
      <animated.mesh 
        position={[0, 0.4, -0.3]}
        scale={scaleSpring}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, 0.2]} />
        <primitive object={porcelainMaterial} />
      </animated.mesh>
      
      {/* Water in bowl (if showing internals) */}
      {showInternals && (
        <animated.mesh position={[0, -0.1, 0]} scale={scaleSpring}>
          <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <primitive object={waterMaterial} />
        </animated.mesh>
      )}
      
      {/* P-trap (if showing internals) */}
      {showInternals && (
        <group position={[0, -0.5, 0]}>
          <mesh>
            <torusGeometry args={[0.1, 0.05, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <Text
            position={[0.2, 0, 0]}
            fontSize={0.05}
            color="#1E0F2E"
            anchorX="left"
          >
            P-Trap
          </Text>
        </group>
      )}
      
      {/* Toilet Flange */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Flange bolts */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2
        const x = Math.cos(angle) * 0.15
        const z = Math.sin(angle) * 0.15
        return (
          <mesh key={i} position={[x, -0.35, z]}>
            <cylinderGeometry args={[0.01, 0.01, 0.04, 8]} />
            <primitive object={metalMaterial} />
          </mesh>
        )
      })}
      
      {showLabels && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Toilet Assembly
        </Text>
      )}
      
      {showLabels && highlighted && (
        <Html position={[0.5, 0.2, 0]}>
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <h4 className="font-bold text-sm mb-1">Installation Steps:</h4>
            <ol className="text-xs space-y-1">
              <li>1. Install flange at floor level</li>
              <li>2. Set wax ring on flange</li>
              <li>3. Lower toilet onto flange</li>
              <li>4. Secure with bolts</li>
              <li>5. Connect water supply</li>
            </ol>
          </div>
        </Html>
      )}
    </group>
  )
}

// Kitchen Sink Fixture
export function KitchenSink({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  cutaway = false
}: FixtureProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [showPlumbing, setShowPlumbing] = useState(cutaway)
  
  const { scaleSpring } = useSpring({
    scaleSpring: highlighted ? 1.05 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  const stainlessSteelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1
  }), [])
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      {/* Sink Bowl */}
      <animated.mesh
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={() => {
          onClick?.()
          setShowPlumbing(!showPlumbing)
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.6, 0.2, 0.4]} />
        <primitive object={stainlessSteelMaterial} />
      </animated.mesh>
      
      {/* Faucet */}
      <group position={[0, 0.15, -0.15]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
          <primitive object={stainlessSteelMaterial} />
        </mesh>
        <mesh position={[0, 0.2, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.025, 0.1, 16]} />
          <primitive object={stainlessSteelMaterial} />
        </mesh>
      </group>
      
      {/* Supply lines (if showing plumbing) */}
      {showPlumbing && (
        <group>
          {/* Hot water supply - red */}
          <mesh position={[-0.2, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
            <meshStandardMaterial color="#FF6B6B" />
          </mesh>
          <Text position={[-0.4, -0.2, 0]} fontSize={0.04} color="#FF0000">
            Hot (1/2")
          </Text>
          
          {/* Cold water supply - blue */}
          <mesh position={[0.2, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
            <meshStandardMaterial color="#4A90E2" />
          </mesh>
          <Text position={[0.4, -0.2, 0]} fontSize={0.04} color="#0000FF">
            Cold (1/2")
          </Text>
          
          {/* Drain line */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <Text position={[0, -0.5, 0]} fontSize={0.04} color="#000000">
            Drain (1-1/2")
          </Text>
        </group>
      )}
      
      {showLabels && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Kitchen Sink
        </Text>
      )}
      
      {showLabels && highlighted && (
        <Html position={[0.7, 0.2, 0]}>
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <h4 className="font-bold text-sm mb-1">Code Requirements:</h4>
            <ul className="text-xs space-y-1">
              <li>• Supply: 1/2" hot & cold</li>
              <li>• Drain: 1-1/2" minimum</li>
              <li>• Shutoff valves required</li>
              <li>• P-trap must be accessible</li>
            </ul>
          </div>
        </Html>
      )}
    </group>
  )
}

// Ball Valve Component
export function BallValve({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false
}: FixtureProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [isOpen, setIsOpen] = useState(true)
  
  const { scaleSpring, handleRotation } = useSpring({
    scaleSpring: highlighted ? 1.1 : 1,
    handleRotation: isOpen ? 0 : Math.PI / 2,
    config: { tension: 300, friction: 10 }
  })
  
  const brassMateria = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#B5651D',
    metalness: 0.8,
    roughness: 0.2
  }), [])
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      {/* Valve Body */}
      <animated.mesh
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={() => {
          onClick?.()
          setIsOpen(!isOpen)
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={brassMateria} />
      </animated.mesh>
      
      {/* Pipe connections */}
      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
        <primitive object={brassMateria} />
      </mesh>
      <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
        <primitive object={brassMateria} />
      </mesh>
      
      {/* Handle */}
      <animated.group rotation-z={handleRotation}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.01]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </animated.group>
      
      {showLabels && (
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.05}
          color={isOpen ? "#00AA00" : "#AA0000"}
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          {isOpen ? "OPEN" : "CLOSED"}
        </Text>
      )}
      
      {showLabels && (
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.06}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Ball Valve
        </Text>
      )}
    </group>
  )
}

// Water Heater Component
export function WaterHeater({
  component,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  interactive = true,
  onHover,
  onClick,
  highlighted = false,
  cutaway = false
}: FixtureProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [showConnections, setShowConnections] = useState(cutaway)
  
  const { scaleSpring } = useSpring({
    scaleSpring: highlighted ? 1.02 : 1,
    config: { tension: 300, friction: 10 }
  })
  
  const tankMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E0E0E0',
    metalness: 0.3,
    roughness: 0.4
  }), [])
  
  return (
    <group ref={groupRef} position={position} rotation={rotation as any} scale={scale}>
      {/* Main Tank */}
      <animated.mesh
        scale={scaleSpring}
        onPointerEnter={() => interactive && onHover?.(true)}
        onPointerLeave={() => interactive && onHover?.(false)}
        onClick={() => {
          onClick?.()
          setShowConnections(!showConnections)
        }}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.25, 0.25, 1.2, 32]} />
        <primitive object={tankMaterial} />
      </animated.mesh>
      
      {/* Temperature/Pressure Relief Valve */}
      <mesh position={[0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial color="#B5651D" />
      </mesh>
      
      {/* Gas Control (if gas) */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Connections (if showing) */}
      {showConnections && (
        <group>
          {/* Cold Water Inlet - top left, blue */}
          <mesh position={[-0.15, 0.6, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
            <meshStandardMaterial color="#4A90E2" />
          </mesh>
          <Text position={[-0.4, 0.6, 0]} fontSize={0.04} color="#0000FF">
            Cold In (3/4")
          </Text>
          
          {/* Hot Water Outlet - top right, red */}
          <mesh position={[0.15, 0.6, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
            <meshStandardMaterial color="#FF6B6B" />
          </mesh>
          <Text position={[0.4, 0.6, 0]} fontSize={0.04} color="#FF0000">
            Hot Out (3/4")
          </Text>
          
          {/* Gas Line */}
          <mesh position={[0.2, -0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 16]} />
            <meshStandardMaterial color="#FFFF00" />
          </mesh>
          <Text position={[0.4, -0.6, 0]} fontSize={0.04} color="#000000">
            Gas (1/2")
          </Text>
        </group>
      )}
      
      {showLabels && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.08}
          color="#1E0F2E"
          anchorX="center"
          font="/fonts/inter-bold.woff"
        >
          Water Heater
        </Text>
      )}
      
      {showLabels && highlighted && (
        <Html position={[0.5, 0.3, 0]}>
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <h4 className="font-bold text-sm mb-1">Installation Notes:</h4>
            <ul className="text-xs space-y-1">
              <li>• Cold inlet on left (blue)</li>
              <li>• Hot outlet on right (red)</li>
              <li>• TPR valve required</li>
              <li>• Gas shutoff within 6 feet</li>
              <li>• Drain pan recommended</li>
            </ul>
          </div>
        </Html>
      )}
    </group>
  )
}

const PlumbingFixturesComponents = {
  ToiletFixture,
  KitchenSink,
  BallValve,
  WaterHeater
}

export default PlumbingFixturesComponents