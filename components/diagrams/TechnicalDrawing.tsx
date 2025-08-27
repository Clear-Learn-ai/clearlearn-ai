'use client'

import { useState, useRef, useCallback } from 'react'
import { Stage, Layer, Line, Circle, Rect, Text, Group, RegularPolygon } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { PlumbingComponent, PlumbingInstallation } from '@/types/plumbing'

interface TechnicalDrawingProps {
  installation: PlumbingInstallation
  showDimensions?: boolean
  showGrid?: boolean
  editable?: boolean
  scale?: number
  className?: string
  onComponentClick?: (component: PlumbingComponent) => void
}

interface DrawingElement {
  id: string
  type: 'pipe' | 'fitting' | 'dimension' | 'annotation'
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  points?: number[]
  text?: string
  component?: PlumbingComponent
}

export function TechnicalDrawing({
  installation,
  showDimensions = true,
  showGrid = true,
  editable = false,
  scale = 1,
  className = "w-full h-96",
  onComponentClick
}: TechnicalDrawingProps) {
  const stageRef = useRef<any>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [elements, setElements] = useState<DrawingElement[]>(() => 
    generateDrawingFromInstallation(installation)
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'pipe' | 'fitting' | 'dimension'>('select')
  
  // Generate drawing elements from installation data
  function generateDrawingFromInstallation(installation: PlumbingInstallation): DrawingElement[] {
    const elements: DrawingElement[] = []
    let currentY = 100
    
    installation.materials.forEach((material, index) => {
      const x = 100 + index * 150
      
      if (material.category === 'pipe') {
        // Draw pipe as line
        elements.push({
          id: `pipe-${material.id}`,
          type: 'pipe',
          x,
          y: currentY,
          width: 100,
          height: 20,
          component: material,
          points: [x, currentY, x + 100, currentY]
        })
        
        // Add pipe label
        elements.push({
          id: `label-${material.id}`,
          type: 'annotation',
          x: x + 50,
          y: currentY - 25,
          text: `${material.size}" ${material.material}`,
          component: material
        })
      }
      
      if (material.category === 'fitting') {
        // Draw fitting as circle
        elements.push({
          id: `fitting-${material.id}`,
          type: 'fitting',
          x,
          y: currentY,
          width: 30,
          height: 30,
          component: material
        })
        
        // Add fitting label
        elements.push({
          id: `label-${material.id}`,
          type: 'annotation',
          x,
          y: currentY + 45,
          text: material.name,
          component: material
        })
      }
      
      currentY += 80
    })
    
    // Add dimensions if requested
    if (showDimensions) {
      elements.push({
        id: 'dimension-1',
        type: 'dimension',
        x: 50,
        y: 100,
        width: 200,
        height: 0,
        text: '8"',
        points: [50, 100, 250, 100]
      })
    }
    
    return elements
  }
  
  // Grid component
  function GridLayer() {
    if (!showGrid) return null
    
    const gridSize = 20
    const lines = []
    
    // Vertical lines
    for (let i = 0; i < stageSize.width; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      )
    }
    
    // Horizontal lines
    for (let i = 0; i < stageSize.height; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width, i]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      )
    }
    
    return <>{lines}</>
  }
  
  // Pipe component
  function PipeElement({ element }: { element: DrawingElement }) {
    const isSelected = selectedId === element.id
    
    return (
      <Group
        onClick={() => {
          setSelectedId(element.id)
          if (element.component && onComponentClick) {
            onComponentClick(element.component)
          }
        }}
      >
        <Line
          points={element.points || [element.x, element.y, element.x + (element.width || 0), element.y]}
          stroke={isSelected ? "#3b82f6" : getPipeColor(element.component?.material)}
          strokeWidth={getPipeWidth(element.component?.size)}
          lineCap="round"
        />
        
        {/* Connection points */}
        <Circle
          x={element.x}
          y={element.y}
          radius={3}
          fill="#666666"
        />
        <Circle
          x={element.x + (element.width || 0)}
          y={element.y}
          radius={3}
          fill="#666666"
        />
        
        {/* Selection handles */}
        {isSelected && (
          <>
            <Rect
              x={element.x - 4}
              y={element.y - 4}
              width={8}
              height={8}
              fill="#3b82f6"
            />
            <Rect
              x={element.x + (element.width || 0) - 4}
              y={element.y - 4}
              width={8}
              height={8}
              fill="#3b82f6"
            />
          </>
        )}
      </Group>
    )
  }
  
  // Fitting component
  function FittingElement({ element }: { element: DrawingElement }) {
    const isSelected = selectedId === element.id
    
    const shape = getFittingShape(element.component?.name)
    
    return (
      <Group
        onClick={() => {
          setSelectedId(element.id)
          if (element.component && onComponentClick) {
            onComponentClick(element.component)
          }
        }}
      >
        {shape === 'circle' && (
          <Circle
            x={element.x}
            y={element.y}
            radius={(element.width || 30) / 2}
            fill={isSelected ? "#dbeafe" : "#f3f4f6"}
            stroke={isSelected ? "#3b82f6" : "#6b7280"}
            strokeWidth={2}
          />
        )}
        
        {shape === 'square' && (
          <Rect
            x={element.x - (element.width || 30) / 2}
            y={element.y - (element.height || 30) / 2}
            width={element.width || 30}
            height={element.height || 30}
            fill={isSelected ? "#dbeafe" : "#f3f4f6"}
            stroke={isSelected ? "#3b82f6" : "#6b7280"}
            strokeWidth={2}
          />
        )}
        
        {shape === 'triangle' && (
          <RegularPolygon
            x={element.x}
            y={element.y}
            sides={3}
            radius={(element.width || 30) / 2}
            fill={isSelected ? "#dbeafe" : "#f3f4f6"}
            stroke={isSelected ? "#3b82f6" : "#6b7280"}
            strokeWidth={2}
          />
        )}
        
        {/* Fitting symbol */}
        <Text
          x={element.x}
          y={element.y - 5}
          text={getFittingSymbol(element.component?.name)}
          fontSize={12}
          fontFamily="Arial"
          fill="#1f2937"
          align="center"
          offsetX={5}
        />
      </Group>
    )
  }
  
  // Dimension component
  function DimensionElement({ element }: { element: DrawingElement }) {
    if (!element.points) return null
    
    const [x1, y1, x2, y2] = element.points
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    
    return (
      <Group>
        {/* Dimension line */}
        <Line
          points={element.points}
          stroke="#ef4444"
          strokeWidth={1}
          dash={[5, 5]}
        />
        
        {/* Dimension arrows */}
        <RegularPolygon
          x={x1}
          y={y1}
          sides={3}
          radius={4}
          fill="#ef4444"
          rotation={Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI}
        />
        <RegularPolygon
          x={x2}
          y={y2}
          sides={3}
          radius={4}
          fill="#ef4444"
          rotation={Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI}
        />
        
        {/* Dimension text */}
        <Rect
          x={midX - 15}
          y={midY - 8}
          width={30}
          height={16}
          fill="white"
          stroke="#ef4444"
          strokeWidth={1}
        />
        <Text
          x={midX}
          y={midY - 5}
          text={element.text || ""}
          fontSize={10}
          fontFamily="Arial"
          fill="#ef4444"
          align="center"
          offsetX={10}
        />
      </Group>
    )
  }
  
  // Annotation component
  function AnnotationElement({ element }: { element: DrawingElement }) {
    return (
      <Text
        x={element.x}
        y={element.y}
        text={element.text || ""}
        fontSize={12}
        fontFamily="Arial"
        fill="#374151"
        align="center"
        offsetX={(element.text || "").length * 3}
      />
    )
  }
  
  // Helper functions
  function getPipeColor(material?: string): string {
    switch (material) {
      case 'copper': return '#B87333'
      case 'pvc': return '#000000'
      case 'abs': return '#2C2C2C'
      case 'pex': return '#FF6B6B'
      default: return '#6b7280'
    }
  }
  
  function getPipeWidth(size?: string): number {
    if (!size) return 2
    const sizeNum = parseFloat(size)
    return Math.max(2, sizeNum * 4)
  }
  
  function getFittingShape(name?: string): 'circle' | 'square' | 'triangle' {
    if (!name) return 'circle'
    if (name.toLowerCase().includes('elbow')) return 'square'
    if (name.toLowerCase().includes('tee')) return 'triangle'
    return 'circle'
  }
  
  function getFittingSymbol(name?: string): string {
    if (!name) return ''
    if (name.toLowerCase().includes('elbow')) return '⌐'
    if (name.toLowerCase().includes('tee')) return '⊥'
    if (name.toLowerCase().includes('coupling')) return '○'
    if (name.toLowerCase().includes('reducer')) return '◊'
    return '○'
  }
  
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
    }
  }, [])
  
  return (
    <div className={className}>
      {/* Toolbar */}
      {editable && (
        <div className="mb-4 p-2 bg-gray-100 rounded-lg flex gap-2">
          <button
            className={`px-3 py-1 rounded ${tool === 'select' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('select')}
          >
            Select
          </button>
          <button
            className={`px-3 py-1 rounded ${tool === 'pipe' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('pipe')}
          >
            Pipe
          </button>
          <button
            className={`px-3 py-1 rounded ${tool === 'fitting' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('fitting')}
          >
            Fitting
          </button>
          <button
            className={`px-3 py-1 rounded ${tool === 'dimension' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('dimension')}
          >
            Dimension
          </button>
        </div>
      )}
      
      {/* Drawing Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <GridLayer />
          </Layer>
          
          <Layer>
            {elements.map((element) => {
              switch (element.type) {
                case 'pipe':
                  return <PipeElement key={element.id} element={element} />
                case 'fitting':
                  return <FittingElement key={element.id} element={element} />
                case 'dimension':
                  return <DimensionElement key={element.id} element={element} />
                case 'annotation':
                  return <AnnotationElement key={element.id} element={element} />
                default:
                  return null
              }
            })}
          </Layer>
        </Stage>
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-bold text-sm mb-2">Symbol Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center">
            <span className="text-lg mr-2">⌐</span>
            <span>Elbow</span>
          </div>
          <div className="flex items-center">
            <span className="text-lg mr-2">⊥</span>
            <span>Tee</span>
          </div>
          <div className="flex items-center">
            <span className="text-lg mr-2">○</span>
            <span>Coupling</span>
          </div>
          <div className="flex items-center">
            <span className="text-lg mr-2">◊</span>
            <span>Reducer</span>
          </div>
        </div>
      </div>
      
      {/* Selected component info */}
      {selectedId && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold text-sm mb-1">Selected Component</h4>
          {(() => {
            const element = elements.find(e => e.id === selectedId)
            return element?.component ? (
              <div className="text-sm">
                <div><strong>Name:</strong> {element.component.name}</div>
                <div><strong>Size:</strong> {element.component.size}"</div>
                <div><strong>Material:</strong> {element.component.material}</div>
                <div><strong>Description:</strong> {element.component.description}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No component data available</div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default TechnicalDrawing