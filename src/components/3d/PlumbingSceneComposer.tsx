'use client'

import { Suspense, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Grid, 
  // PerspectiveCamera,
  Html,
  useProgress,
  AdaptiveDpr,
  AdaptiveEvents,
  BakeShadows,
  Preload
} from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'

// Import our plumbing components
import { RealisticPipe } from './pipes/RealisticPipe'
import { ElbowFitting } from './fittings/PlumbingFittings'
import { ToiletFixture, KitchenSink, BallValve, WaterHeater } from './fixtures/PlumbingFixtures'
import { PipeWrench, TubingCutter, ChannelLocks, ToolBox } from './tools/PlumbingTools'

import { PlumbingInstallation, PlumbingComponent, PlumbingTool } from '@/types/plumbing'

interface PlumbingSceneComposerProps {
  installation?: PlumbingInstallation
  showPerformance?: boolean
  quality?: 'low' | 'medium' | 'high'
  enableEffects?: boolean
  interactive?: boolean
  autoRotate?: boolean
  showGrid?: boolean
  environment?: 'workshop' | 'jobsite' | 'studio'
  onComponentSelect?: (_component: PlumbingComponent | PlumbingTool) => void
  className?: string
}

// Loading component
function Loader() {
  const { progress, errors, item, loaded, total } = useProgress()
  
  return (
    <Html center>
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <div className="text-center">
          <div className="text-lg font-bold mb-2">Loading 3D Models</div>
          <div className="w-48 h-2 bg-gray-200 rounded-full mb-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {Math.round(progress)}% loaded ({loaded}/{total})
          </div>
          {item && (
            <div className="text-xs text-gray-500 mt-1">
              Loading: {item}
            </div>
          )}
          {errors.length > 0 && (
            <div className="text-xs text-red-500 mt-1">
              Errors: {errors.length}
            </div>
          )}
        </div>
      </div>
    </Html>
  )
}

// Scene lighting setup
function SceneLighting({ environment }: { environment: string }) {
  const lightIntensity = useMemo(() => {
    switch (environment) {
      case 'jobsite': return 1.5 // Bright outdoor lighting
      case 'workshop': return 1.0 // Standard workshop lighting
      case 'studio': return 0.8 // Soft studio lighting
      default: return 1.0
    }
  }, [environment])
  
  return (
    <>
      <ambientLight intensity={0.4 * lightIntensity} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8 * lightIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={0.3 * lightIntensity}
        color="#4A90E2"
      />
      <pointLight 
        position={[10, -10, 10]} 
        intensity={0.2 * lightIntensity}
        color="#FF6B6B"
      />
    </>
  )
}

// Sample plumbing installation scene
function SampleInstallation({ onComponentSelect }: { onComponentSelect?: (_item: any) => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  
  const handleSelect = (item: any) => {
    setSelectedItem(item.id)
    onComponentSelect?.(item)
  }
  
  // Sample plumbing components
  const pipeComponent = useMemo(() => ({
    id: 'pipe-1',
    name: 'Copper Supply Line',
    category: 'pipe' as const,
    material: 'copper' as const,
    size: '3/4',
    description: 'Hot water supply line to kitchen sink',
    commonUses: ['Hot water distribution', 'Supply lines'],
    codeReferences: ['IPC 604.5']
  }), [])
  
  const elbowComponent = useMemo(() => ({
    id: 'elbow-1',
    name: '90° Copper Elbow',
    category: 'fitting' as const,
    material: 'copper' as const,
    size: '3/4',
    description: '90-degree elbow for directional changes',
    commonUses: ['Direction changes', 'Corner connections'],
    codeReferences: ['IPC 605.5']
  }), [])
  
  const toiletComponent = useMemo(() => ({
    id: 'toilet-1',
    name: 'Standard Toilet',
    category: 'fixture' as const,
    material: 'other' as const,
    size: '4',
    description: 'Standard residential toilet fixture',
    commonUses: ['Bathroom fixtures', 'Waste removal'],
    codeReferences: ['IPC 405.3']
  }), [])
  
  const wrenchTool = useMemo(() => ({
    id: 'wrench-1',
    name: '14" Pipe Wrench',
    category: 'specialty' as const,
    description: 'Heavy-duty pipe wrench for threaded connections',
    uses: ['Gripping pipes', 'Tightening fittings'],
    safetyNotes: ['Always pull, never push', 'Use two wrenches for leverage']
  }), [])
  
  return (
    <>
      {/* Main plumbing installation */}
      <group position={[0, 0, 0]}>
        {/* Toilet installation */}
        <ToiletFixture
          component={toiletComponent}
          position={[-3, -1.5, 0]}
          highlighted={selectedItem === 'toilet-1'}
          onHover={() => {}}
          onClick={() => handleSelect(toiletComponent)}
        />
        
        {/* Kitchen sink installation */}
        <KitchenSink
          component={{...pipeComponent, name: 'Kitchen Sink'}}
          position={[3, -0.5, 0]}
          highlighted={selectedItem === 'sink-1'}
          onHover={() => {}}
          onClick={() => handleSelect({...pipeComponent, name: 'Kitchen Sink', id: 'sink-1'})}
        />
        
        {/* Supply piping system */}
        <group position={[0, 0, 0]}>
          <RealisticPipe
            component={pipeComponent}
            position={[0, 0, 0]}
            length={3}
            diameter={0.08}
            highlighted={selectedItem === 'pipe-1'}
            onHover={() => {}}
            onClick={() => handleSelect(pipeComponent)}
          />
          
          <ElbowFitting
            component={elbowComponent}
            position={[1.5, 0, 0]}
            diameter={0.08}
            highlighted={selectedItem === 'elbow-1'}
            onHover={() => {}}
            onClick={() => handleSelect(elbowComponent)}
          />
          
          <RealisticPipe
            component={{...pipeComponent, material: 'pex', id: 'pipe-2'}}
            position={[1.5, 0.8, 0]}
            rotation={[0, 0, Math.PI / 2]}
            length={1.5}
            diameter={0.08}
            highlighted={selectedItem === 'pipe-2'}
            onHover={() => {}}
            onClick={() => handleSelect({...pipeComponent, material: 'pex', id: 'pipe-2'})}
          />
        </group>
        
        {/* Ball valve */}
        <BallValve
          component={{...pipeComponent, name: 'Main Shutoff Valve'}}
          position={[-1.5, 0, 0]}
          highlighted={selectedItem === 'valve-1'}
          onHover={() => {}}
          onClick={() => handleSelect({...pipeComponent, name: 'Main Shutoff Valve', id: 'valve-1'})}
        />
        
        {/* Water heater */}
        <WaterHeater
          component={{...pipeComponent, name: 'Gas Water Heater'}}
          position={[0, -1.5, -2]}
          scale={0.8}
          highlighted={selectedItem === 'heater-1'}
          onHover={() => {}}
          onClick={() => handleSelect({...pipeComponent, name: 'Gas Water Heater', id: 'heater-1'})}
        />
      </group>
      
      {/* Tools display */}
      <group position={[4, 0, 2]}>
        <PipeWrench
          tool={wrenchTool}
          position={[0, 0.5, 0]}
          rotation={[0, 0, Math.PI / 4]}
          highlighted={selectedItem === 'wrench-1'}
          onHover={() => {}}
          onClick={() => handleSelect(wrenchTool)}
        />
        
        <TubingCutter
          tool={{...wrenchTool, name: 'Copper Tubing Cutter'}}
          position={[0.5, 0.5, 0]}
          highlighted={selectedItem === 'cutter-1'}
          onHover={() => {}}
          onClick={() => handleSelect({...wrenchTool, name: 'Copper Tubing Cutter', id: 'cutter-1'})}
        />
        
        <ChannelLocks
          tool={{...wrenchTool, name: 'Channel Lock Pliers'}}
          position={[-0.5, 0.5, 0]}
          highlighted={selectedItem === 'pliers-1'}
          onHover={() => {}}
          onClick={() => handleSelect({...wrenchTool, name: 'Channel Lock Pliers', id: 'pliers-1'})}
        />
        
        <ToolBox
          position={[0, 0, 0]}
          tools={[wrenchTool]}
          onToolSelect={handleSelect}
        />
      </group>
    </>
  )
}

// Main scene composer
export function PlumbingSceneComposer({
  installation,
  showPerformance = false,
  quality = 'medium',
  enableEffects = true,
  interactive = true,
  autoRotate = false,
  showGrid = true,
  environment = 'workshop',
  onComponentSelect,
  className = "w-full h-screen"
}: PlumbingSceneComposerProps) {
  
  const qualitySettings = useMemo(() => {
    switch (quality) {
      case 'low':
        return {
          antialias: false,
          shadows: false,
          dpr: 1,
          toneMapping: THREE.NoToneMapping
        }
      case 'medium':
        return {
          antialias: true,
          shadows: true,
          dpr: 1.5,
          toneMapping: THREE.ACESFilmicToneMapping
        }
      case 'high':
        return {
          antialias: true,
          shadows: true,
          dpr: 2,
          toneMapping: THREE.ACESFilmicToneMapping
        }
      default:
        return {
          antialias: true,
          shadows: true,
          dpr: 1.5,
          toneMapping: THREE.ACESFilmicToneMapping
        }
    }
  }, [quality])
  
  const environmentPresets = {
    workshop: 'warehouse',
    jobsite: 'city',
    studio: 'studio'
  }
  
  return (
    <div className={className}>
      <Canvas
        dpr={qualitySettings.dpr}
        gl={{ 
          antialias: qualitySettings.antialias,
          toneMapping: qualitySettings.toneMapping,
          toneMappingExposure: 1,
          outputColorSpace: THREE.SRGBColorSpace,
          shadowMap: qualitySettings.shadows as any,
        }}
        shadows={qualitySettings.shadows}
        camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={<Loader />}>
          {/* Performance monitoring */}
          {showPerformance && <Perf position="top-left" />}
          
          {/* Adaptive performance */}
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          
          {/* Scene lighting */}
          <SceneLighting environment={environment} />
          
          {/* Environment */}
          <Environment preset={environmentPresets[environment] as any} />
          
          {/* Grid */}
          {showGrid && (
            <Grid 
              position={[0, -2, 0]}
              args={[20, 20]}
              cellColor="#e5e7eb"
              sectionColor="#9ca3af"
              fadeDistance={15}
              fadeStrength={0.8}
            />
          )}
          
          {/* Ground */}
          <ContactShadows
            position={[0, -1.99, 0]}
            opacity={0.4}
            scale={20}
            blur={1.5}
            far={10}
          />
          
          {/* Main scene content */}
          {installation ? (
            // Render actual installation
            <group>
              {/* TODO: Render from installation data */}
              <SampleInstallation onComponentSelect={onComponentSelect} />
            </group>
          ) : (
            // Render sample scene
            <SampleInstallation onComponentSelect={onComponentSelect} />
          )}
          
          {/* Post-processing effects disabled - removed @react-three/postprocessing dependency */}
          
          {/* Camera controls */}
          {interactive && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              minDistance={2}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2}
              target={[0, 0, 0]}
            />
          )}
          
          {/* Preload assets */}
          <Preload all />
          
          {/* Bake shadows for better performance */}
          {qualitySettings.shadows && <BakeShadows />}
        </Suspense>
      </Canvas>
      
      {/* Offline indicator */}
      {typeof navigator !== 'undefined' && !navigator.onLine && (
        <div className="offline-indicator">
          📡 Offline Mode - Using cached content
        </div>
      )}
    </div>
  )
}

export default PlumbingSceneComposer