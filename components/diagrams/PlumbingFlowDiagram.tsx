'use client'

import { useCallback, useState, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Panel,
  Handle,
  Position,
  NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PlumbingSystem, PlumbingComponent } from '@/types/plumbing'

// Custom Node Types for Plumbing Components
function PipeNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 min-w-[150px] ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } ${data.material === 'copper' ? 'bg-orange-100' : 
       data.material === 'pvc' ? 'bg-white' : 
       data.material === 'pex' ? 'bg-red-100' : 'bg-gray-100'}`}>
      
      <Handle type="target" position={Position.Left} />
      
      <div className="text-center">
        <div className="font-bold text-sm">{data.label}</div>
        <div className="text-xs text-gray-600">
          {data.size}" {data.material?.toUpperCase()}
        </div>
        <div className="text-xs text-blue-600">
          {data.pressure && `${data.pressure} PSI`}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

function FixtureNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[120px] ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } bg-blue-50`}>
      
      <Handle type="target" position={Position.Top} />
      
      <div className="text-center">
        <div className="text-2xl mb-1">{data.icon}</div>
        <div className="font-bold text-sm">{data.label}</div>
        <div className="text-xs text-gray-600">
          {data.flow && `${data.flow} GPM`}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function ValveNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-3 py-2 shadow-lg rounded-full border-2 min-w-[80px] h-[80px] flex items-center justify-center ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } ${data.isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
      
      <Handle type="target" position={Position.Left} />
      
      <div className="text-center">
        <div className="text-lg">{data.isOpen ? '🟢' : '🔴'}</div>
        <div className="font-bold text-xs">{data.label}</div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Custom Edge Types
function PressureEdge({ id, sourceX, sourceY, targetX, targetY, data }: any) {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2
  
  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${
          data?.flow === 'hot' ? 'stroke-red-500' :
          data?.flow === 'cold' ? 'stroke-blue-500' :
          data?.flow === 'drain' ? 'stroke-gray-600' : 'stroke-gray-400'
        }`}
        d={edgePath}
        strokeWidth={data?.size ? data.size * 2 : 2}
        fill="none"
      />
      {data?.pressure && (
        <text
          x={midX}
          y={midY - 10}
          className="text-xs fill-gray-700"
          textAnchor="middle"
        >
          {data.pressure} PSI
        </text>
      )}
      {data?.flow && (
        <text
          x={midX}
          y={midY + 15}
          className="text-xs fill-gray-700"
          textAnchor="middle"
        >
          {data.flow.toUpperCase()}
        </text>
      )}
    </>
  )
}

interface PlumbingFlowDiagramProps {
  system: PlumbingSystem
  editable?: boolean
  showFlow?: boolean
  showPressure?: boolean
  onComponentSelect?: (component: PlumbingComponent) => void
  className?: string
}

export function PlumbingFlowDiagram({
  system,
  editable = false,
  showFlow = true,
  showPressure = true,
  onComponentSelect,
  className = "w-full h-96"
}: PlumbingFlowDiagramProps) {
  
  // Node types
  const nodeTypes = useMemo(() => ({
    pipe: PipeNode,
    fixture: FixtureNode,
    valve: ValveNode,
  }), [])
  
  // Edge types
  const edgeTypes = useMemo(() => ({
    pressure: PressureEdge,
  }), [])
  
  // Generate initial nodes and edges from system data
  const initialNodes = useMemo(() => {
    const nodes: Node[] = []
    
    // Create nodes for each component
    system.components.forEach((component, index) => {
      let nodeType = 'pipe'
      let icon = '🔧'
      
      if (component.category === 'fixture') {
        nodeType = 'fixture'
        if (component.name.toLowerCase().includes('toilet')) icon = '🚽'
        else if (component.name.toLowerCase().includes('sink')) icon = '🚿'
        else if (component.name.toLowerCase().includes('faucet')) icon = '🚰'
        else icon = '🔧'
      } else if (component.category === 'valve') {
        nodeType = 'valve'
      }
      
      nodes.push({
        id: component.id,
        type: nodeType,
        position: { 
          x: 100 + (index % 4) * 200, 
          y: 100 + Math.floor(index / 4) * 150 
        },
        data: {
          label: component.name,
          material: component.material,
          size: component.size,
          icon: icon,
          isOpen: nodeType === 'valve' ? true : undefined,
          pressure: showPressure ? Math.floor(Math.random() * 50 + 20) : undefined,
          flow: nodeType === 'fixture' ? Math.floor(Math.random() * 10 + 5) : undefined,
        },
      })
    })
    
    return nodes
  }, [system.components, showPressure])
  
  const initialEdges = useMemo(() => {
    const edges: Edge[] = []
    
    // Create connections based on plumbing logic
    for (let i = 0; i < system.components.length - 1; i++) {
      const source = system.components[i]
      const target = system.components[i + 1]
      
      // Determine flow type
      let flowType = 'supply'
      if (source.name.toLowerCase().includes('hot')) flowType = 'hot'
      else if (source.name.toLowerCase().includes('cold')) flowType = 'cold'
      else if (source.name.toLowerCase().includes('drain')) flowType = 'drain'
      
      edges.push({
        id: `${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        type: 'pressure',
        data: {
          flow: flowType,
          pressure: showPressure ? Math.floor(Math.random() * 30 + 40) : undefined,
          size: parseFloat(source.size) || 1,
        },
      })
    }
    
    return edges
  }, [system.components, showPressure])
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  
  const onConnect = useCallback(
    (params: Connection) => {
      if (editable) {
        setEdges((eds) => addEdge({
          ...params,
          type: 'pressure',
          data: { flow: 'supply', pressure: 45, size: 1 }
        }, eds))
      }
    },
    [editable, setEdges]
  )
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
    const component = system.components.find(c => c.id === node.id)
    if (component && onComponentSelect) {
      onComponentSelect(component)
    }
  }, [system.components, onComponentSelect])
  
  // Control panel for system information
  const SystemInfo = () => (
    <div className="bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="font-bold text-lg mb-2">{system.name}</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Type:</strong> {system.type.toUpperCase()}</div>
        <div><strong>Components:</strong> {system.components.length}</div>
        {system.pressureRequirements && (
          <div>
            <strong>Pressure:</strong> {system.pressureRequirements.min}-{system.pressureRequirements.max} {system.pressureRequirements.unit}
          </div>
        )}
        {selectedNode && (
          <div className="mt-3 pt-2 border-t">
            <strong>Selected:</strong> {nodes.find(n => n.id === selectedNode)?.data.label}
          </div>
        )}
      </div>
    </div>
  )
  
  // Legend for flow types
  const FlowLegend = () => (
    <div className="bg-white p-3 rounded-lg shadow-lg border">
      <h4 className="font-bold text-sm mb-2">Flow Types</h4>
      <div className="space-y-1 text-xs">
        <div className="flex items-center">
          <div className="w-4 h-1 bg-red-500 mr-2"></div>
          <span>Hot Water</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-blue-500 mr-2"></div>
          <span>Cold Water</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-gray-600 mr-2"></div>
          <span>Drain/Waste</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-gray-400 mr-2"></div>
          <span>Supply</span>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className={className}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode="loose" as any
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectNodesOnDrag={false}
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
        
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'fixture') return '#dbeafe'
            if (node.type === 'valve') return node.data?.isOpen ? '#dcfce7' : '#fee2e2'
            return '#f3f4f6'
          }}
          className="!bg-white !border-gray-300"
        />
        
        <Panel position="top-left">
          <SystemInfo />
        </Panel>
        
        <Panel position="top-right">
          <FlowLegend />
        </Panel>
        
        <Panel position="bottom-left">
          <div className="bg-white p-2 rounded-lg shadow-lg border">
            <div className="text-xs text-gray-600">
              {editable ? 'Click and drag to connect components' : 'Click components for details'}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default PlumbingFlowDiagram