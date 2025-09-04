'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SimulationData, ContentMetadata } from '@/core/types'
import { cn } from '@/lib/utils'

interface SimulationRendererProps {
  data: SimulationData
  metadata: ContentMetadata
}

export function SimulationRenderer({ data, metadata }: SimulationRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [parameters, setParameters] = useState(data.initialState)
  const [derivedValues, setDerivedValues] = useState<Record<string, number>>({})

  // Calculate derived values based on current parameters
  const calculateDerivedValues = useCallback(() => {
    const newValues: Record<string, number> = { ...parameters }

    // Apply constraints/formulas
    data.constraints.forEach(constraint => {
      if (!constraint.active) return

      try {
        // Simple formula evaluation for common patterns
        if (constraint.formula.includes('F = G * (m1 * m2) / (r²)')) {
          // Gravity calculation
          const G = 6.674e-11 // Gravitational constant (simplified)
          const m1 = parameters.mass1 || 100
          const m2 = parameters.mass2 || 50
          const r = parameters.distance || 10
          newValues.gravitationalForce = (G * m1 * m2) / (r * r) * 1e9 // Scaled for display
          newValues.acceleration1 = newValues.gravitationalForce / m1
        }
        
        if (constraint.formula.includes('evaporation = temperature * 0.8 + windSpeed * 0.3')) {
          // Water cycle calculation
          const temp = parameters.temperature || 25
          const wind = parameters.windSpeed || 10
          newValues.evaporationRate = temp * 0.8 + wind * 0.3
        }
        
        if (constraint.formula.includes('precipitation = max(0, (humidity - 80) * 2)')) {
          const humidity = parameters.humidity || 60
          newValues.precipitationRate = Math.max(0, (humidity - 80) * 2)
        }
        
        if (constraint.formula.includes('rate = co2Factor * lightFactor * tempFactor')) {
          // Photosynthesis calculation
          const co2 = parameters.co2Level || 400
          const light = parameters.lightIntensity || 80
          const temp = parameters.temperature || 25
          
          const co2Factor = Math.min(1, co2 / 400)
          const lightFactor = Math.min(1, light / 80)
          const tempFactor = Math.max(0, 1 - Math.abs(temp - 25) / 20)
          
          newValues.photosynthesisRate = co2Factor * lightFactor * tempFactor * 100
          newValues.oxygenProduction = newValues.photosynthesisRate * 0.8
        }
        
        if (constraint.formula === 'result = parameter1 * 2') {
          // Generic calculation
          newValues.result = (parameters.parameter1 || 0) * 2
        }
      } catch (error) {
        console.warn('Formula evaluation error:', error)
      }
    })

    setDerivedValues(newValues)
    return newValues
  }, [parameters, data.constraints])

  // Render visualization on canvas
  const renderVisualization = useCallback((values: Record<string, number>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render visual elements
    data.visualElements.forEach(element => {
      ctx.save()
      ctx.translate(element.position.x, element.position.y)

      const boundValues = element.dataBinding.map(key => values[key] || 0)
      const value = boundValues[0] || 0

      switch (element.type) {
        case 'particle':
          const radius = Math.max(10, Math.min(50, value / 2))
          ctx.beginPath()
          ctx.arc(0, 0, radius, 0, 2 * Math.PI)
          ctx.fillStyle = element.style.color
          ctx.globalAlpha = element.style.opacity
          ctx.fill()
          break

        case 'bar':
          const height = Math.max(5, Math.min(150, value * 2))
          ctx.fillStyle = element.style.color
          ctx.globalAlpha = element.style.opacity
          ctx.fillRect(-element.size.width / 2, -height, element.size.width, height)
          break

        case 'flow':
          const length = Math.max(20, Math.min(200, value * 3))
          const width = element.style.strokeWidth || 2
          ctx.strokeStyle = element.style.color
          ctx.globalAlpha = element.style.opacity
          ctx.lineWidth = width
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(length, 0)
          ctx.stroke()
          
          // Arrow head
          ctx.beginPath()
          ctx.moveTo(length - 10, -5)
          ctx.lineTo(length, 0)
          ctx.lineTo(length - 10, 5)
          ctx.stroke()
          break

        case 'line':
          // Simple line chart representation
          if (boundValues.length >= 2) {
            ctx.strokeStyle = element.style.color
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(element.size.width, -boundValues[1] / 2)
            ctx.stroke()
          }
          break

        case 'scatter':
          // Scatter plot representation
          for (let i = 0; i < Math.min(value / 10, 50); i++) {
            const x = (Math.random() - 0.5) * element.size.width
            const y = (Math.random() - 0.5) * element.size.height
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fillStyle = element.style.color
            ctx.fill()
          }
          break
      }

      ctx.restore()
    })
  }, [data.visualElements])

  // Animation loop
  const animate = useCallback(() => {
    if (!isRunning) return

    const values = calculateDerivedValues()
    renderVisualization(values)

    animationRef.current = requestAnimationFrame(animate)
  }, [isRunning, calculateDerivedValues, renderVisualization])

  // Handle parameter changes
  const handleParameterChange = (parameterId: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [parameterId]: value
    }))
  }

  // Start/stop simulation
  const toggleSimulation = () => {
    setIsRunning(!isRunning)
  }

  // Setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 800
      canvas.height = 400
    }

    // Initial render
    const values = calculateDerivedValues()
    renderVisualization(values)
  }, [calculateDerivedValues, renderVisualization])

  useEffect(() => {
    if (isRunning) {
      animate()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, animate])

  // Update visualization when parameters change
  useEffect(() => {
    const values = calculateDerivedValues()
    renderVisualization(values)
  }, [parameters, calculateDerivedValues, renderVisualization])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Simulation Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{metadata.title}</h3>
        <p className="text-sm text-gray-600">{metadata.description}</p>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-lg border overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full"
          style={{ 
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '300px'
          }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Input Parameters */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.parameters
              .filter(param => param.category === 'input')
              .map(param => (
                <div key={param.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {param.name} ({param.unit})
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={(param.max - param.min) / 100}
                      value={parameters[param.id] || param.default}
                      onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-16 text-sm text-gray-600 text-right">
                      {(parameters[param.id] || param.default).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{param.description}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Output Values */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.parameters
              .filter(param => param.category === 'output')
              .map(param => (
                <div key={param.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">{param.name}</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {(derivedValues[param.id] || 0).toFixed(2)} {param.unit}
                  </div>
                  <div className="text-xs text-gray-500">{param.description}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex justify-center">
          <button
            onClick={toggleSimulation}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              isRunning
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {isRunning ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>

        {/* Active Constraints */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-2">Active Rules</h4>
          <div className="space-y-2">
            {data.constraints
              .filter(constraint => constraint.active)
              .map(constraint => (
                <div key={constraint.id} className="p-2 bg-blue-50 rounded text-sm">
                  <div className="font-medium text-blue-800">{constraint.description}</div>
                  <div className="text-blue-600 font-mono text-xs">{constraint.formula}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}