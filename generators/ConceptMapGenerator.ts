import { 
  ConceptAnalysis, 
  ConceptMapData, 
  ConceptNode, 
  ConceptEdge,
  LayoutSettings,
  MapInteraction,
  ConceptMapStyle,
  NodeStyle,
  EdgeStyle
} from '@/core/types'

export class ConceptMapGenerator {
  /**
   * Generates concept map content based on concept analysis
   */
  async generate(analysis: ConceptAnalysis): Promise<ConceptMapData> {
    const topic = analysis.topic.toLowerCase()
    
    // Route to specific concept map generators based on topic
    if (topic.includes('neural network') || topic.includes('machine learning')) {
      return this.generateNeuralNetworkMap()
    }
    
    if (topic.includes('internet') || topic.includes('web') || topic.includes('network')) {
      return this.generateInternetMap()
    }
    
    if (topic.includes('ecosystem') || topic.includes('food chain')) {
      return this.generateEcosystemMap()
    }
    
    if (topic.includes('democracy') || topic.includes('government')) {
      return this.generateEcosystemMap() // Placeholder - would implement government map
    }
    
    if (topic.includes('economy') || topic.includes('market')) {
      return this.generateEcosystemMap() // Placeholder - would implement economy map
    }
    
    // Default knowledge map
    return this.generateGenericConceptMap(analysis)
  }
  
  /**
   * Generates neural network learning concept map
   */
  private generateNeuralNetworkMap(): ConceptMapData {
    const nodes: ConceptNode[] = [
      {
        id: 'neural_network',
        label: 'Neural Network',
        type: 'concept',
        level: 0,
        position: { x: 400, y: 200 },
        size: { width: 120, height: 60 },
        data: {
          description: 'A computing system inspired by biological neural networks',
          examples: ['Feedforward Networks', 'CNNs', 'RNNs'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#3b82f6',
          size: { width: 120, height: 60 }
        }
      },
      {
        id: 'input_layer',
        label: 'Input Layer',
        type: 'entity',
        level: 1,
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Layer that receives input data',
          examples: ['Raw data', 'Features', 'Pixels'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#10b981',
          size: { width: 100, height: 50 }
        }
      },
      {
        id: 'hidden_layers',
        label: 'Hidden Layers',
        type: 'entity',
        level: 1,
        position: { x: 400, y: 100 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Intermediate processing layers',
          examples: ['Dense layers', 'Convolutional layers', 'LSTM layers'],
          expandable: true
        },
        style: {
          shape: 'ellipse',
          color: '#8b5cf6',
          size: { width: 100, height: 50 }
        }
      },
      {
        id: 'output_layer',
        label: 'Output Layer',
        type: 'entity',
        level: 1,
        position: { x: 700, y: 100 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Layer that produces final predictions',
          examples: ['Classification', 'Regression', 'Generation'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#ef4444',
          size: { width: 100, height: 50 }
        }
      },
      {
        id: 'weights',
        label: 'Weights',
        type: 'property',
        level: 2,
        position: { x: 200, y: 300 },
        size: { width: 80, height: 40 },
        data: {
          description: 'Parameters that determine connection strength',
          examples: ['Matrix values', 'Learnable parameters'],
          expandable: false
        },
        style: {
          shape: 'circle',
          color: '#f59e0b',
          size: { width: 80, height: 40 }
        }
      },
      {
        id: 'activation',
        label: 'Activation Functions',
        type: 'process',
        level: 2,
        position: { x: 400, y: 300 },
        size: { width: 120, height: 40 },
        data: {
          description: 'Functions that introduce non-linearity',
          examples: ['ReLU', 'Sigmoid', 'Tanh', 'Softmax'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#06b6d4',
          size: { width: 120, height: 40 }
        }
      },
      {
        id: 'backpropagation',
        label: 'Backpropagation',
        type: 'process',
        level: 2,
        position: { x: 600, y: 300 },
        size: { width: 120, height: 40 },
        data: {
          description: 'Algorithm for training neural networks',
          examples: ['Gradient descent', 'Chain rule', 'Error propagation'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#dc2626',
          size: { width: 120, height: 40 }
        }
      },
      {
        id: 'learning',
        label: 'Learning',
        type: 'process',
        level: 1,
        position: { x: 400, y: 350 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Process of adjusting weights to improve performance',
          examples: ['Supervised learning', 'Unsupervised learning'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#7c3aed',
          size: { width: 100, height: 50 }
        }
      }
    ]
    
    const edges: ConceptEdge[] = [
      {
        id: 'input_to_hidden',
        from: 'input_layer',
        to: 'hidden_layers',
        label: 'processes',
        type: 'produces',
        weight: 1.0,
        style: {
          color: '#64748b',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'hidden_to_output',
        from: 'hidden_layers',
        to: 'output_layer',
        label: 'produces',
        type: 'produces',
        weight: 1.0,
        style: {
          color: '#64748b',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'network_contains_input',
        from: 'neural_network',
        to: 'input_layer',
        type: 'contains',
        weight: 0.8,
        style: {
          color: '#9ca3af',
          width: 1,
          arrow: 'to'
        }
      },
      {
        id: 'network_contains_hidden',
        from: 'neural_network',
        to: 'hidden_layers',
        type: 'contains',
        weight: 0.8,
        style: {
          color: '#9ca3af',
          width: 1,
          arrow: 'to'
        }
      },
      {
        id: 'network_contains_output',
        from: 'neural_network',
        to: 'output_layer',
        type: 'contains',
        weight: 0.8,
        style: {
          color: '#9ca3af',
          width: 1,
          arrow: 'to'
        }
      },
      {
        id: 'weights_connect',
        from: 'weights',
        to: 'hidden_layers',
        label: 'connects',
        type: 'relates-to',
        weight: 0.9,
        style: {
          color: '#f59e0b',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'activation_transforms',
        from: 'hidden_layers',
        to: 'activation',
        label: 'uses',
        type: 'requires',
        weight: 1.0,
        style: {
          color: '#06b6d4',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'backprop_updates',
        from: 'backpropagation',
        to: 'weights',
        label: 'updates',
        type: 'causes',
        weight: 1.0,
        style: {
          color: '#dc2626',
          width: 3,
          arrow: 'to'
        }
      },
      {
        id: 'learning_uses_backprop',
        from: 'learning',
        to: 'backpropagation',
        label: 'uses',
        type: 'requires',
        weight: 1.0,
        style: {
          color: '#7c3aed',
          width: 2,
          arrow: 'to'
        }
      }
    ]
    
    return {
      type: 'concept-map',
      nodes,
      edges,
      layout: {
        algorithm: 'force-directed',
        spacing: 100,
        iterations: 300,
        nodeRepulsion: 1000,
        edgeLength: 150
      },
      interactions: [
        {
          type: 'click',
          target: 'node',
          action: {
            type: 'expand',
            parameters: {
              showRelated: true,
              highlightConnections: true
            }
          }
        },
        {
          type: 'hover',
          target: 'node',
          action: {
            type: 'highlight',
            parameters: {
              highlightConnected: true,
              fadeOthers: true
            }
          }
        },
        {
          type: 'click',
          target: 'edge',
          action: {
            type: 'showDetails',
            parameters: {
              showRelationshipInfo: true
            }
          }
        }
      ],
      styling: {
        backgroundColor: '#f8fafc',
        nodeDefaults: {
          shape: 'ellipse',
          color: '#e2e8f0',
          size: { width: 80, height: 40 }
        },
        edgeDefaults: {
          color: '#94a3b8',
          width: 1,
          arrow: 'to'
        },
        highlightColor: '#fbbf24',
        selectionColor: '#3b82f6'
      }
    }
  }
  
  /**
   * Generates internet/web infrastructure concept map
   */
  private generateInternetMap(): ConceptMapData {
    const nodes: ConceptNode[] = [
      {
        id: 'internet',
        label: 'Internet',
        type: 'concept',
        level: 0,
        position: { x: 400, y: 200 },
        size: { width: 100, height: 60 },
        data: {
          description: 'Global network of interconnected computers',
          examples: ['World Wide Web', 'Email', 'File Transfer'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#3b82f6',
          size: { width: 100, height: 60 }
        }
      },
      {
        id: 'isp',
        label: 'Internet Service Provider',
        type: 'entity',
        level: 1,
        position: { x: 200, y: 100 },
        size: { width: 140, height: 50 },
        data: {
          description: 'Company that provides internet access',
          examples: ['Comcast', 'Verizon', 'AT&T'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#10b981',
          size: { width: 140, height: 50 }
        }
      },
      {
        id: 'router',
        label: 'Router',
        type: 'entity',
        level: 2,
        position: { x: 100, y: 250 },
        size: { width: 80, height: 40 },
        data: {
          description: 'Device that forwards data packets',
          examples: ['Home router', 'Enterprise router'],
          expandable: false
        },
        style: {
          shape: 'rectangle',
          color: '#8b5cf6',
          size: { width: 80, height: 40 }
        }
      },
      {
        id: 'server',
        label: 'Web Server',
        type: 'entity',
        level: 1,
        position: { x: 600, y: 100 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Computer that serves web content',
          examples: ['Apache', 'Nginx', 'IIS'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#ef4444',
          size: { width: 100, height: 50 }
        }
      },
      {
        id: 'dns',
        label: 'DNS',
        type: 'process',
        level: 2,
        position: { x: 300, y: 350 },
        size: { width: 80, height: 40 },
        data: {
          description: 'Domain Name System - translates domain names to IP addresses',
          examples: ['google.com → 8.8.8.8'],
          expandable: true
        },
        style: {
          shape: 'circle',
          color: '#f59e0b',
          size: { width: 80, height: 40 }
        }
      },
      {
        id: 'tcp_ip',
        label: 'TCP/IP',
        type: 'process',
        level: 2,
        position: { x: 500, y: 350 },
        size: { width: 80, height: 40 },
        data: {
          description: 'Protocol suite for internet communication',
          examples: ['TCP', 'IP', 'HTTP', 'HTTPS'],
          expandable: true
        },
        style: {
          shape: 'circle',
          color: '#06b6d4',
          size: { width: 80, height: 40 }
        }
      },
      {
        id: 'browser',
        label: 'Web Browser',
        type: 'entity',
        level: 2,
        position: { x: 700, y: 250 },
        size: { width: 100, height: 40 },
        data: {
          description: 'Software for accessing web content',
          examples: ['Chrome', 'Firefox', 'Safari'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#dc2626',
          size: { width: 100, height: 40 }
        }
      }
    ]
    
    const edges: ConceptEdge[] = [
      {
        id: 'isp_provides_access',
        from: 'isp',
        to: 'internet',
        label: 'provides access to',
        type: 'produces',
        weight: 1.0,
        style: {
          color: '#10b981',
          width: 3,
          arrow: 'to'
        }
      },
      {
        id: 'router_connects',
        from: 'router',
        to: 'isp',
        label: 'connects to',
        type: 'relates-to',
        weight: 0.8,
        style: {
          color: '#8b5cf6',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'server_hosts',
        from: 'server',
        to: 'internet',
        label: 'hosts content on',
        type: 'produces',
        weight: 1.0,
        style: {
          color: '#ef4444',
          width: 3,
          arrow: 'to'
        }
      },
      {
        id: 'dns_resolves',
        from: 'dns',
        to: 'server',
        label: 'resolves to',
        type: 'relates-to',
        weight: 0.9,
        style: {
          color: '#f59e0b',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'tcpip_enables',
        from: 'tcp_ip',
        to: 'internet',
        label: 'enables communication',
        type: 'requires',
        weight: 1.0,
        style: {
          color: '#06b6d4',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'browser_requests',
        from: 'browser',
        to: 'server',
        label: 'requests from',
        type: 'relates-to',
        weight: 0.9,
        style: {
          color: '#dc2626',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'browser_uses_dns',
        from: 'browser',
        to: 'dns',
        label: 'uses',
        type: 'requires',
        weight: 0.7,
        style: {
          color: '#9ca3af',
          width: 1,
          arrow: 'to',
          dashed: true
        }
      }
    ]
    
    return {
      type: 'concept-map',
      nodes,
      edges,
      layout: {
        algorithm: 'hierarchical',
        spacing: 120,
        nodeRepulsion: 800,
        edgeLength: 100
      },
      interactions: [
        {
          type: 'click',
          target: 'node',
          action: {
            type: 'expand',
            parameters: {
              showRelated: true
            }
          }
        },
        {
          type: 'hover',
          target: 'edge',
          action: {
            type: 'highlight',
            parameters: {
              showLabel: true
            }
          }
        }
      ],
      styling: {
        backgroundColor: '#ffffff',
        nodeDefaults: {
          shape: 'ellipse',
          color: '#e5e7eb',
          size: { width: 80, height: 40 }
        },
        edgeDefaults: {
          color: '#6b7280',
          width: 1,
          arrow: 'to'
        },
        highlightColor: '#fbbf24',
        selectionColor: '#3b82f6'
      }
    }
  }
  
  /**
   * Generates ecosystem concept map
   */
  private generateEcosystemMap(): ConceptMapData {
    const nodes: ConceptNode[] = [
      {
        id: 'ecosystem',
        label: 'Ecosystem',
        type: 'concept',
        level: 0,
        position: { x: 400, y: 200 },
        size: { width: 120, height: 60 },
        data: {
          description: 'Community of living organisms and their environment',
          examples: ['Forest', 'Ocean', 'Desert', 'Grassland'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#22c55e',
          size: { width: 120, height: 60 }
        }
      },
      {
        id: 'producers',
        label: 'Producers',
        type: 'entity',
        level: 1,
        position: { x: 200, y: 100 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Organisms that produce their own food',
          examples: ['Plants', 'Algae', 'Some bacteria'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#16a34a',
          size: { width: 100, height: 50 }
        }
      },
      {
        id: 'primary_consumers',
        label: 'Primary Consumers',
        type: 'entity',
        level: 1,
        position: { x: 400, y: 100 },
        size: { width: 120, height: 50 },
        data: {
          description: 'Animals that eat producers',
          examples: ['Herbivores', 'Deer', 'Rabbits'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#3b82f6',
          size: { width: 120, height: 50 }
        }
      },
      {
        id: 'secondary_consumers',
        label: 'Secondary Consumers',
        type: 'entity',
        level: 1,
        position: { x: 600, y: 100 },
        size: { width: 120, height: 50 },
        data: {
          description: 'Animals that eat primary consumers',
          examples: ['Carnivores', 'Wolves', 'Hawks'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#ef4444',
          size: { width: 120, height: 50 }
        }
      },
      {
        id: 'decomposers',
        label: 'Decomposers',
        type: 'entity',
        level: 1,
        position: { x: 400, y: 300 },
        size: { width: 100, height: 50 },
        data: {
          description: 'Organisms that break down dead matter',
          examples: ['Bacteria', 'Fungi', 'Worms'],
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#8b5cf6',
          size: { width: 100, height: 50 }
        }
      },
      {
        id: 'energy_flow',
        label: 'Energy Flow',
        type: 'process',
        level: 2,
        position: { x: 200, y: 300 },
        size: { width: 100, height: 40 },
        data: {
          description: 'Transfer of energy through trophic levels',
          examples: ['10% rule', 'Energy pyramid'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#f59e0b',
          size: { width: 100, height: 40 }
        }
      },
      {
        id: 'nutrient_cycle',
        label: 'Nutrient Cycling',
        type: 'process',
        level: 2,
        position: { x: 600, y: 300 },
        size: { width: 120, height: 40 },
        data: {
          description: 'Recycling of nutrients in ecosystem',
          examples: ['Carbon cycle', 'Nitrogen cycle'],
          expandable: true
        },
        style: {
          shape: 'rectangle',
          color: '#06b6d4',
          size: { width: 120, height: 40 }
        }
      }
    ]
    
    const edges: ConceptEdge[] = [
      {
        id: 'producers_to_primary',
        from: 'producers',
        to: 'primary_consumers',
        label: 'eaten by',
        type: 'produces',
        weight: 1.0,
        style: {
          color: '#16a34a',
          width: 3,
          arrow: 'to'
        }
      },
      {
        id: 'primary_to_secondary',
        from: 'primary_consumers',
        to: 'secondary_consumers',
        label: 'eaten by',
        type: 'produces',
        weight: 1.0,
        style: {
          color: '#3b82f6',
          width: 3,
          arrow: 'to'
        }
      },
      {
        id: 'decomposers_recycle',
        from: 'decomposers',
        to: 'producers',
        label: 'provides nutrients to',
        type: 'produces',
        weight: 0.9,
        style: {
          color: '#8b5cf6',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'energy_flows',
        from: 'energy_flow',
        to: 'primary_consumers',
        type: 'relates-to',
        weight: 0.8,
        style: {
          color: '#f59e0b',
          width: 2,
          arrow: 'to'
        }
      },
      {
        id: 'nutrients_cycle',
        from: 'nutrient_cycle',
        to: 'decomposers',
        type: 'relates-to',
        weight: 0.8,
        style: {
          color: '#06b6d4',
          width: 2,
          arrow: 'to'
        }
      }
    ]
    
    return {
      type: 'concept-map',
      nodes,
      edges,
      layout: {
        algorithm: 'hierarchical',
        spacing: 100,
        nodeRepulsion: 1000,
        edgeLength: 120
      },
      interactions: [
        {
          type: 'click',
          target: 'node',
          action: {
            type: 'showDetails',
            parameters: {
              showExamples: true,
              showConnections: true
            }
          }
        }
      ],
      styling: {
        backgroundColor: '#f0fdf4',
        nodeDefaults: {
          shape: 'ellipse',
          color: '#dcfce7',
          size: { width: 80, height: 40 }
        },
        edgeDefaults: {
          color: '#22c55e',
          width: 2,
          arrow: 'to'
        },
        highlightColor: '#fbbf24',
        selectionColor: '#16a34a'
      }
    }
  }
  
  /**
   * Generic concept map fallback
   */
  private generateGenericConceptMap(analysis: ConceptAnalysis): ConceptMapData {
    const centralNode: ConceptNode = {
      id: 'main_concept',
      label: analysis.topic,
      type: 'concept',
      level: 0,
      position: { x: 400, y: 200 },
      size: { width: 120, height: 60 },
      data: {
        description: `Main concept: ${analysis.topic}`,
        examples: analysis.keywords.slice(0, 3),
        expandable: true
      },
      style: {
        shape: 'rectangle',
        color: '#3b82f6',
        size: { width: 120, height: 60 }
      }
    }
    
    const nodes: ConceptNode[] = [centralNode]
    const edges: ConceptEdge[] = []
    
    // Create nodes for each keyword
    analysis.keywords.slice(0, 6).forEach((keyword, index) => {
      const angle = (index / 6) * 2 * Math.PI
      const radius = 150
      const x = 400 + Math.cos(angle) * radius
      const y = 200 + Math.sin(angle) * radius
      
      const node: ConceptNode = {
        id: `keyword_${index}`,
        label: keyword,
        type: 'property',
        level: 1,
        position: { x, y },
        size: { width: 80, height: 40 },
        data: {
          description: `Related to ${analysis.topic}`,
          expandable: false
        },
        style: {
          shape: 'ellipse',
          color: '#10b981',
          size: { width: 80, height: 40 }
        }
      }
      
      nodes.push(node)
      
      edges.push({
        id: `main_to_${index}`,
        from: 'main_concept',
        to: `keyword_${index}`,
        type: 'relates-to',
        weight: 0.8,
        style: {
          color: '#64748b',
          width: 1,
          arrow: 'to'
        }
      })
    })
    
    return {
      type: 'concept-map',
      nodes,
      edges,
      layout: {
        algorithm: 'radial',
        spacing: 100,
        nodeRepulsion: 500,
        edgeLength: 150
      },
      interactions: [
        {
          type: 'click',
          target: 'node',
          action: {
            type: 'expand',
            parameters: {
              showRelated: true
            }
          }
        }
      ],
      styling: {
        backgroundColor: '#f8fafc',
        nodeDefaults: {
          shape: 'ellipse',
          color: '#e2e8f0',
          size: { width: 80, height: 40 }
        },
        edgeDefaults: {
          color: '#94a3b8',
          width: 1,
          arrow: 'to'
        },
        highlightColor: '#fbbf24',
        selectionColor: '#3b82f6'
      }
    }
  }
}