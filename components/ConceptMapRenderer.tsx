'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ConceptMapData, ContentMetadata, ConceptNode, ConceptEdge } from '@/core/types'
import { cn } from '@/lib/utils'

interface ConceptMapRendererProps {
  data: ConceptMapData
  metadata: ContentMetadata
}

interface NodePosition {
  id: string
  x: number
  y: number
  vx?: number
  vy?: number
}

export function ConceptMapRenderer({ data, metadata }: ConceptMapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isLayouting, setIsLayouting] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Initialize node positions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const positions: NodePosition[] = data.nodes.map((node, index) => {
      if (node.position) {
        return { id: node.id, x: node.position.x, y: node.position.y }
      }

      // Initialize based on layout algorithm
      switch (data.layout.algorithm) {
        case 'radial':
          const angle = (index / data.nodes.length) * 2 * Math.PI
          const radius = 150 + node.level * 100
          return {
            id: node.id,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          }
        
        case 'hierarchical':
          const levelY = 100 + node.level * 120
          const nodeIndex = data.nodes.filter(n => n.level === node.level).indexOf(node)
          const nodesAtLevel = data.nodes.filter(n => n.level === node.level).length
          const spacing = Math.min(200, 600 / Math.max(1, nodesAtLevel - 1))
          const startX = centerX - (nodesAtLevel - 1) * spacing / 2
          return {
            id: node.id,
            x: startX + nodeIndex * spacing,
            y: levelY
          }
        
        default: // force-directed
          return {
            id: node.id,
            x: centerX + (Math.random() - 0.5) * 400,
            y: centerY + (Math.random() - 0.5) * 400,
            vx: 0,
            vy: 0
          }
      }
    })

    setNodePositions(positions)
  }, [data.nodes, data.layout.algorithm])

  // Force-directed layout simulation
  const updateForceDirectedLayout = useCallback(() => {
    if (data.layout.algorithm !== 'force-directed' || !isLayouting) return

    setNodePositions(positions => {
      const newPositions = positions.map(pos => ({ ...pos }))
      const alpha = 0.1
      const k = data.layout.spacing || 100

      // Repulsion between nodes
      for (let i = 0; i < newPositions.length; i++) {
        for (let j = i + 1; j < newPositions.length; j++) {
          const dx = newPositions[j].x - newPositions[i].x
          const dy = newPositions[j].y - newPositions[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = (data.layout.nodeRepulsion || 1000) / (dist * dist)
          const fx = (dx / dist) * force * alpha
          const fy = (dy / dist) * force * alpha

          newPositions[i].vx = (newPositions[i].vx || 0) - fx
          newPositions[i].vy = (newPositions[i].vy || 0) - fy
          newPositions[j].vx = (newPositions[j].vx || 0) + fx
          newPositions[j].vy = (newPositions[j].vy || 0) + fy
        }
      }

      // Attraction along edges
      data.edges.forEach(edge => {
        const source = newPositions.find(p => p.id === edge.from)
        const target = newPositions.find(p => p.id === edge.to)
        if (!source || !target) return

        const dx = target.x - source.x
        const dy = target.y - source.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const targetDist = data.layout.edgeLength || 150
        const force = (dist - targetDist) * 0.1 * alpha
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        source.vx = (source.vx || 0) + fx
        source.vy = (source.vy || 0) + fy
        target.vx = (target.vx || 0) - fx
        target.vy = (target.vy || 0) - fy
      })

      // Apply velocities and damping
      newPositions.forEach(pos => {
        pos.vx = (pos.vx || 0) * 0.9
        pos.vy = (pos.vy || 0) * 0.9
        pos.x += pos.vx || 0
        pos.y += pos.vy || 0
      })

      return newPositions
    })
  }, [data.layout, data.edges, isLayouting])

  // Render the concept map
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = data.styling.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoomLevel, zoomLevel)

    // Draw edges first (behind nodes)
    data.edges.forEach(edge => {
      const sourcePos = nodePositions.find(p => p.id === edge.from)
      const targetPos = nodePositions.find(p => p.id === edge.to)
      if (!sourcePos || !targetPos) return

      ctx.strokeStyle = edge.style.color
      ctx.lineWidth = edge.style.width
      ctx.setLineDash(edge.style.dashed ? [5, 5] : [])

      ctx.beginPath()
      ctx.moveTo(sourcePos.x, sourcePos.y)
      ctx.lineTo(targetPos.x, targetPos.y)
      ctx.stroke()

      // Draw arrow
      if (edge.style.arrow === 'to' || edge.style.arrow === 'both') {
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x)
        const arrowLength = 15
        const arrowAngle = Math.PI / 6

        ctx.beginPath()
        ctx.moveTo(
          targetPos.x - arrowLength * Math.cos(angle - arrowAngle),
          targetPos.y - arrowLength * Math.sin(angle - arrowAngle)
        )
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.lineTo(
          targetPos.x - arrowLength * Math.cos(angle + arrowAngle),
          targetPos.y - arrowLength * Math.sin(angle + arrowAngle)
        )
        ctx.stroke()
      }

      // Draw edge label
      if (edge.label) {
        const midX = (sourcePos.x + targetPos.x) / 2
        const midY = (sourcePos.y + targetPos.y) / 2
        
        ctx.fillStyle = '#333'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(edge.label, midX, midY - 5)
      }
    })

    // Draw nodes
    data.nodes.forEach(node => {
      const pos = nodePositions.find(p => p.id === node.id)
      if (!pos) return

      const isSelected = selectedNode === node.id
      const isHovered = hoveredNode === node.id
      const nodeStyle = node.style

      // Node background
      ctx.fillStyle = isSelected 
        ? data.styling.selectionColor 
        : isHovered 
          ? data.styling.highlightColor 
          : nodeStyle.color
      
      if (nodeStyle.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, nodeStyle.size.width / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        const x = pos.x - nodeStyle.size.width / 2
        const y = pos.y - nodeStyle.size.height / 2
        ctx.fillRect(x, y, nodeStyle.size.width, nodeStyle.size.height)
      }

      // Node border
      ctx.strokeStyle = isSelected ? '#000' : '#666'
      ctx.lineWidth = isSelected ? 3 : 1
      ctx.stroke()

      // Node label
      ctx.fillStyle = '#000'
      ctx.font = `${isSelected ? 'bold' : 'normal'} 14px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, pos.x, pos.y)
    })

    ctx.restore()
  }, [nodePositions, data, selectedNode, hoveredNode, zoomLevel, panOffset])

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    // Check if clicking on a node
    const clickedNode = data.nodes.find(node => {
      const pos = nodePositions.find(p => p.id === node.id)
      if (!pos) return false

      const dx = x - pos.x
      const dy = y - pos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance <= node.style.size.width / 2
    })

    if (clickedNode) {
      setSelectedNode(clickedNode.id)
    } else {
      setSelectedNode(null)
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else {
      // Update hovered node
      const hoveredNode = data.nodes.find(node => {
        const pos = nodePositions.find(p => p.id === node.id)
        if (!pos) return false

        const dx = x - pos.x
        const dy = y - pos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance <= node.style.size.width / 2
      })

      setHoveredNode(hoveredNode?.id || null)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomSpeed = 0.1
    const newZoom = Math.max(0.2, Math.min(3, zoomLevel - e.deltaY * zoomSpeed * 0.01))
    setZoomLevel(newZoom)
  }

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateForceDirectedLayout()
      render()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateForceDirectedLayout, render])

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Stop layout animation after some time
    const timer = setTimeout(() => {
      setIsLayouting(false)
    }, 5000)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Map Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{metadata.title}</h3>
        <p className="text-sm text-gray-600">{metadata.description}</p>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 min-h-0 relative">
        <div
          ref={containerRef}
          className="w-full h-full border rounded-lg overflow-hidden bg-white"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.min(3, prev * 1.2))}
            className="w-8 h-8 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.2, prev / 1.2))}
            className="w-8 h-8 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 flex items-center justify-center text-sm font-bold"
          >
            -
          </button>
          <button
            onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }) }}
            className="w-8 h-8 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 flex items-center justify-center text-xs"
          >
            ⌂
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4">
        {/* Layout Controls */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Layout</h4>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setIsLayouting(!isLayouting)}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                isLayouting
                  ? "bg-red-600 text-white"
                  : "bg-green-600 text-white"
              )}
            >
              {isLayouting ? 'Stop Layout' : 'Start Layout'}
            </button>
            <span className="text-sm text-gray-600 py-1">
              Algorithm: {data.layout.algorithm}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            🖱️ Click nodes to select • Drag to pan • Scroll to zoom
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Selected Node</h4>
            {(() => {
              const node = data.nodes.find(n => n.id === selectedNode)
              if (!node) return null

              return (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900">{node.label}</h5>
                  <p className="text-sm text-blue-800 mt-1">{node.data.description}</p>
                  {node.data.examples && node.data.examples.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-blue-800">Examples:</div>
                      <div className="text-sm text-blue-700">
                        {node.data.examples.join(', ')}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-blue-600 mt-2">
                    Type: {node.type} • Level: {node.level}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Legend */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['concept', 'process', 'entity', 'property'].map(type => {
              const nodesOfType = data.nodes.filter(n => n.type === type)
              if (nodesOfType.length === 0) return null

              const exampleNode = nodesOfType[0]
              return (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: exampleNode.style.color }}
                  />
                  <span className="capitalize">{type}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="text-xs text-gray-500 grid grid-cols-3 gap-4">
          <div>
            <strong>Nodes:</strong> {data.nodes.length}
          </div>
          <div>
            <strong>Edges:</strong> {data.edges.length}
          </div>
          <div>
            <strong>Zoom:</strong> {(zoomLevel * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}