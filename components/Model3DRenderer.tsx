'use client'

import { useEffect, useRef, useState } from 'react'
import { Model3DData, ContentMetadata } from '@/core/types'
import { cn } from '@/lib/utils'

interface Model3DRendererProps {
  data: Model3DData
  metadata: ContentMetadata
}

export function Model3DRenderer({ data, metadata }: Model3DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [cameraMode, setCameraMode] = useState<'orbit' | 'focus'>('orbit')
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const [showWireframe, setShowWireframe] = useState(false)

  // This would integrate with Three.js in a real implementation
  // For now, we'll create a placeholder that shows the data structure
  useEffect(() => {
    if (!containerRef.current) return

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const renderPlaceholder3D = () => {
    const { modelType, geometry } = data
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto bg-blue-500 rounded-lg shadow-lg transform rotate-12 animate-pulse" />
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-800">3D Model: {modelType}</h4>
            <p className="text-sm text-gray-600">
              {geometry.type} geometry at scale {geometry.scale.x}x{geometry.scale.y}x{geometry.scale.z}
            </p>
            <div className="text-xs text-gray-500">
              📱 Click and drag to rotate • 🔍 Scroll to zoom
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderModelInfo = () => {
    switch (data.modelType) {
      case 'molecular':
        return (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Molecular Structure</h5>
            {data.geometry.data.molecule && (
              <p className="text-sm text-gray-600">Molecule: {data.geometry.data.molecule}</p>
            )}
            {data.geometry.data.atoms && (
              <div className="text-sm text-gray-600">
                Atoms: {data.geometry.data.atoms.length} total
                <div className="ml-2 space-y-1">
                  {data.geometry.data.atoms.map((atom: any, index: number) => (
                    <div key={index} className="text-xs">
                      {atom.element} at ({atom.position.x.toFixed(1)}, {atom.position.y.toFixed(1)}, {atom.position.z.toFixed(1)})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      case 'anatomical':
        return (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Anatomical Model</h5>
            {data.geometry.data.organ && (
              <p className="text-sm text-gray-600">Organ: {data.geometry.data.organ}</p>
            )}
            {data.geometry.data.organelles && (
              <div className="text-sm text-gray-600">
                Organelles: {data.geometry.data.organelles.length}
                <div className="ml-2 space-y-1">
                  {data.geometry.data.organelles.map((organelle: any, index: number) => (
                    <div key={index} className="text-xs">
                      {organelle.type} (size: {organelle.size})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">3D Model</h5>
            <p className="text-sm text-gray-600">Type: {data.modelType}</p>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading 3D Model</h3>
          <p className="text-sm text-gray-600">Preparing interactive visualization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Model Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{metadata.title}</h3>
        <p className="text-sm text-gray-600">{metadata.description}</p>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 min-h-0">
        <div ref={containerRef} className="w-full h-full min-h-[300px]">
          {renderPlaceholder3D()}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4">
        {/* View Controls */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">View Controls</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setCameraMode('orbit')}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                cameraMode === 'orbit'
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Orbit View
            </button>
            <button
              onClick={() => setCameraMode('focus')}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                cameraMode === 'focus'
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Focus View
            </button>
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                showWireframe
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {showWireframe ? 'Hide' : 'Show'} Wireframe
            </button>
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Animation Speed: {animationSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Model Information */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Model Information</h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            {renderModelInfo()}
          </div>
        </div>

        {/* Materials */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Materials</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.materials.map(material => (
              <div
                key={material.id}
                className="p-2 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPart(material.id)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: material.properties.color || '#gray' }}
                  />
                  <span className="text-sm font-medium">{material.id}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {material.type} material
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactions */}
        {data.interactions.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Interactive Elements</h4>
            <div className="space-y-2">
              {data.interactions.map((interaction, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                  <div className="font-medium text-blue-800">
                    {interaction.type} on {interaction.target}
                  </div>
                  <div className="text-blue-600">
                    Action: {interaction.action.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animations */}
        {data.animations.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Available Animations</h4>
            <div className="flex flex-wrap gap-2">
              {data.animations.map(animation => (
                <button
                  key={animation.id}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200 transition-colors"
                  onClick={() => console.log('Play animation:', animation.id)}
                >
                  {animation.id} ({(animation.duration / 1000).toFixed(1)}s)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Camera Settings */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Camera:</strong> {data.camera.type}<br />
              <strong>FOV:</strong> {data.camera.fov || 'N/A'}°<br />
              <strong>Position:</strong> ({data.camera.position.x}, {data.camera.position.y}, {data.camera.position.z})
            </div>
            <div>
              <strong>Lighting:</strong><br />
              • Ambient: {data.lighting.ambient.intensity}<br />
              • Directional: {data.lighting.directional.length}<br />
              • Point: {data.lighting.point.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}