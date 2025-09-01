import { 
  ConceptAnalysis, 
  SimulationData, 
  SimulationParameter, 
  SimulationConstraint,
  SimulationVisual,
  VisualStyle 
} from '@/core/types'

export class InteractiveSimulationGenerator {
  /**
   * Generates interactive simulation content based on concept analysis
   */
  async generate(analysis: ConceptAnalysis): Promise<SimulationData> {
    const topic = analysis.topic.toLowerCase()
    
    // Route to specific simulation generators based on topic
    if (topic.includes('gravity') || topic.includes('gravitational')) {
      return this.generateGravitySimulation()
    }
    
    if (topic.includes('water cycle') || topic.includes('hydrological')) {
      return this.generateWaterCycleSimulation()
    }
    
    if (topic.includes('photosynthesis') && analysis.keywords.includes('co2')) {
      return this.generatePhotosynthesisSimulation()
    }
    
    if (topic.includes('ecosystem') || topic.includes('population')) {
      return this.generateEcosystemSimulation()
    }
    
    // Default physics simulation
    return this.generateGenericPhysicsSimulation(analysis)
  }
  
  /**
   * Generates gravity simulation - adjust mass, distance, see gravitational force
   */
  private generateGravitySimulation(): SimulationData {
    return {
      type: 'simulation',
      simulationType: 'physics',
      parameters: [
        {
          id: 'mass1',
          name: 'Mass 1',
          description: 'Mass of the first object (kg)',
          min: 1,
          max: 1000,
          default: 100,
          unit: 'kg',
          category: 'input'
        },
        {
          id: 'mass2',
          name: 'Mass 2',
          description: 'Mass of the second object (kg)',
          min: 1,
          max: 1000,
          default: 50,
          unit: 'kg',
          category: 'input'
        },
        {
          id: 'distance',
          name: 'Distance',
          description: 'Distance between objects (m)',
          min: 1,
          max: 100,
          default: 10,
          unit: 'm',
          category: 'input'
        },
        {
          id: 'gravitationalForce',
          name: 'Gravitational Force',
          description: 'Force between the objects (N)',
          min: 0,
          max: 10000,
          default: 0,
          unit: 'N',
          category: 'output'
        },
        {
          id: 'acceleration1',
          name: 'Acceleration of Mass 1',
          description: 'Acceleration experienced by first object (m/s²)',
          min: 0,
          max: 100,
          default: 0,
          unit: 'm/s²',
          category: 'output'
        }
      ],
      initialState: {
        mass1: 100,
        mass2: 50,
        distance: 10,
        gravitationalForce: 0,
        acceleration1: 0
      },
      constraints: [
        {
          id: 'gravity_law',
          description: 'Newton\'s Law of Universal Gravitation',
          formula: 'F = G * (m1 * m2) / (r²)',
          active: true
        },
        {
          id: 'acceleration',
          description: 'Newton\'s Second Law',
          formula: 'a = F / m',
          active: true
        }
      ],
      visualElements: [
        {
          id: 'mass1_visual',
          type: 'particle',
          position: { x: 150, y: 200 },
          size: { width: 60, height: 60 },
          dataBinding: ['mass1'],
          style: { color: '#3b82f6', opacity: 0.8 }
        },
        {
          id: 'mass2_visual',
          type: 'particle',
          position: { x: 350, y: 200 },
          size: { width: 40, height: 40 },
          dataBinding: ['mass2'],
          style: { color: '#ef4444', opacity: 0.8 }
        },
        {
          id: 'force_arrow',
          type: 'flow',
          position: { x: 200, y: 180 },
          size: { width: 100, height: 20 },
          dataBinding: ['gravitationalForce'],
          style: { color: '#10b981', opacity: 0.7, strokeWidth: 3 }
        },
        {
          id: 'force_chart',
          type: 'line',
          position: { x: 450, y: 50 },
          size: { width: 300, height: 150 },
          dataBinding: ['gravitationalForce', 'distance'],
          style: { color: '#8b5cf6', opacity: 1 }
        }
      ],
      updateInterval: 16 // 60fps
    }
  }
  
  /**
   * Generates water cycle simulation
   */
  private generateWaterCycleSimulation(): SimulationData {
    return {
      type: 'simulation',
      simulationType: 'biological',
      parameters: [
        {
          id: 'temperature',
          name: 'Temperature',
          description: 'Environmental temperature (°C)',
          min: 0,
          max: 50,
          default: 25,
          unit: '°C',
          category: 'input'
        },
        {
          id: 'humidity',
          name: 'Humidity',
          description: 'Relative humidity (%)',
          min: 0,
          max: 100,
          default: 60,
          unit: '%',
          category: 'input'
        },
        {
          id: 'windSpeed',
          name: 'Wind Speed',
          description: 'Wind velocity (km/h)',
          min: 0,
          max: 50,
          default: 10,
          unit: 'km/h',
          category: 'input'
        },
        {
          id: 'evaporationRate',
          name: 'Evaporation Rate',
          description: 'Rate of water evaporation',
          min: 0,
          max: 100,
          default: 0,
          unit: 'units/min',
          category: 'output'
        },
        {
          id: 'precipitationRate',
          name: 'Precipitation Rate',
          description: 'Rate of precipitation',
          min: 0,
          max: 100,
          default: 0,
          unit: 'units/min',
          category: 'output'
        }
      ],
      initialState: {
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        evaporationRate: 0,
        precipitationRate: 0
      },
      constraints: [
        {
          id: 'evaporation_temp',
          description: 'Evaporation increases with temperature',
          formula: 'evaporation = temperature * 0.8 + windSpeed * 0.3',
          active: true
        },
        {
          id: 'precipitation_humidity',
          description: 'Precipitation occurs when humidity is high',
          formula: 'precipitation = max(0, (humidity - 80) * 2)',
          active: true
        }
      ],
      visualElements: [
        {
          id: 'water_body',
          type: 'particle',
          position: { x: 100, y: 350 },
          size: { width: 200, height: 80 },
          dataBinding: ['evaporationRate'],
          style: { color: '#3b82f6', opacity: 0.7 }
        },
        {
          id: 'evaporation_particles',
          type: 'particle',
          position: { x: 150, y: 250 },
          size: { width: 100, height: 100 },
          dataBinding: ['evaporationRate', 'temperature'],
          style: { color: '#60a5fa', opacity: 0.5 }
        },
        {
          id: 'cloud',
          type: 'particle',
          position: { x: 300, y: 100 },
          size: { width: 150, height: 60 },
          dataBinding: ['humidity'],
          style: { color: '#9ca3af', opacity: 0.8 }
        },
        {
          id: 'rain',
          type: 'flow',
          position: { x: 320, y: 160 },
          size: { width: 80, height: 150 },
          dataBinding: ['precipitationRate'],
          style: { color: '#3b82f6', opacity: 0.6, strokeWidth: 2 }
        },
        {
          id: 'cycle_chart',
          type: 'line',
          position: { x: 500, y: 50 },
          size: { width: 250, height: 200 },
          dataBinding: ['evaporationRate', 'precipitationRate'],
          style: { color: '#10b981', opacity: 1 }
        }
      ],
      updateInterval: 33 // 30fps for smoother particle animation
    }
  }
  
  /**
   * Generates photosynthesis rate simulation with CO2 levels
   */
  private generatePhotosynthesisSimulation(): SimulationData {
    return {
      type: 'simulation',
      simulationType: 'biological',
      parameters: [
        {
          id: 'co2Level',
          name: 'CO₂ Concentration',
          description: 'Carbon dioxide concentration (ppm)',
          min: 200,
          max: 1000,
          default: 400,
          unit: 'ppm',
          category: 'input'
        },
        {
          id: 'lightIntensity',
          name: 'Light Intensity',
          description: 'Photosynthetic light intensity (%)',
          min: 0,
          max: 100,
          default: 80,
          unit: '%',
          category: 'input'
        },
        {
          id: 'temperature',
          name: 'Temperature',
          description: 'Leaf temperature (°C)',
          min: 5,
          max: 45,
          default: 25,
          unit: '°C',
          category: 'input'
        },
        {
          id: 'photosynthesisRate',
          name: 'Photosynthesis Rate',
          description: 'Rate of photosynthesis',
          min: 0,
          max: 100,
          default: 0,
          unit: 'units/s',
          category: 'output'
        },
        {
          id: 'oxygenProduction',
          name: 'Oxygen Production',
          description: 'Rate of oxygen production',
          min: 0,
          max: 100,
          default: 0,
          unit: 'molecules/s',
          category: 'output'
        }
      ],
      initialState: {
        co2Level: 400,
        lightIntensity: 80,
        temperature: 25,
        photosynthesisRate: 0,
        oxygenProduction: 0
      },
      constraints: [
        {
          id: 'co2_limitation',
          description: 'CO₂ concentration affects photosynthesis rate',
          formula: 'rate = co2Factor * lightFactor * tempFactor',
          active: true
        },
        {
          id: 'light_saturation',
          description: 'Light intensity has diminishing returns',
          formula: 'lightFactor = min(1, lightIntensity / 80)',
          active: true
        },
        {
          id: 'temperature_optimum',
          description: 'Temperature has an optimum around 25°C',
          formula: 'tempFactor = 1 - abs(temperature - 25) / 20',
          active: true
        }
      ],
      visualElements: [
        {
          id: 'leaf',
          type: 'particle',
          position: { x: 200, y: 200 },
          size: { width: 120, height: 80 },
          dataBinding: ['photosynthesisRate'],
          style: { color: '#22c55e', opacity: 0.8 }
        },
        {
          id: 'co2_intake',
          type: 'flow',
          position: { x: 50, y: 220 },
          size: { width: 140, height: 20 },
          dataBinding: ['co2Level'],
          style: { color: '#64748b', opacity: 0.7, strokeWidth: 2 }
        },
        {
          id: 'oxygen_output',
          type: 'flow',
          position: { x: 330, y: 220 },
          size: { width: 100, height: 20 },
          dataBinding: ['oxygenProduction'],
          style: { color: '#ef4444', opacity: 0.8, strokeWidth: 3 }
        },
        {
          id: 'rate_chart',
          type: 'line',
          position: { x: 450, y: 50 },
          size: { width: 300, height: 200 },
          dataBinding: ['photosynthesisRate', 'co2Level'],
          style: { color: '#16a34a', opacity: 1 }
        },
        {
          id: 'sunlight',
          type: 'particle',
          position: { x: 150, y: 50 },
          size: { width: 80, height: 60 },
          dataBinding: ['lightIntensity'],
          style: { color: '#fbbf24', opacity: 0.9 }
        }
      ],
      updateInterval: 50 // 20fps for biological processes
    }
  }
  
  /**
   * Generic ecosystem simulation
   */
  private generateEcosystemSimulation(): SimulationData {
    return {
      type: 'simulation',
      simulationType: 'biological',
      parameters: [
        {
          id: 'preyPopulation',
          name: 'Prey Population',
          description: 'Number of prey animals',
          min: 0,
          max: 1000,
          default: 400,
          unit: 'individuals',
          category: 'input'
        },
        {
          id: 'predatorPopulation',
          name: 'Predator Population',
          description: 'Number of predator animals',
          min: 0,
          max: 200,
          default: 50,
          unit: 'individuals',
          category: 'input'
        },
        {
          id: 'carryingCapacity',
          name: 'Carrying Capacity',
          description: 'Maximum sustainable population',
          min: 100,
          max: 2000,
          default: 800,
          unit: 'individuals',
          category: 'input'
        }
      ],
      initialState: {
        preyPopulation: 400,
        predatorPopulation: 50,
        carryingCapacity: 800
      },
      constraints: [
        {
          id: 'lotka_volterra',
          description: 'Predator-Prey dynamics',
          formula: 'Lotka-Volterra equations',
          active: true
        }
      ],
      visualElements: [
        {
          id: 'prey_visual',
          type: 'scatter',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 200 },
          dataBinding: ['preyPopulation'],
          style: { color: '#22c55e', opacity: 0.7 }
        },
        {
          id: 'predator_visual',
          type: 'scatter',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 200 },
          dataBinding: ['predatorPopulation'],
          style: { color: '#ef4444', opacity: 0.8 }
        },
        {
          id: 'population_chart',
          type: 'line',
          position: { x: 350, y: 50 },
          size: { width: 300, height: 250 },
          dataBinding: ['preyPopulation', 'predatorPopulation'],
          style: { color: '#8b5cf6', opacity: 1 }
        }
      ],
      updateInterval: 100 // 10fps for population dynamics
    }
  }
  
  /**
   * Generic physics simulation fallback
   */
  private generateGenericPhysicsSimulation(analysis: ConceptAnalysis): SimulationData {
    return {
      type: 'simulation',
      simulationType: 'physics',
      parameters: [
        {
          id: 'parameter1',
          name: 'Input Variable',
          description: `Primary parameter for ${analysis.topic}`,
          min: 0,
          max: 100,
          default: 50,
          unit: 'units',
          category: 'input'
        },
        {
          id: 'result',
          name: 'Output',
          description: `Result of ${analysis.topic} simulation`,
          min: 0,
          max: 200,
          default: 0,
          unit: 'units',
          category: 'output'
        }
      ],
      initialState: {
        parameter1: 50,
        result: 0
      },
      constraints: [
        {
          id: 'basic_relation',
          description: 'Basic linear relationship',
          formula: 'result = parameter1 * 2',
          active: true
        }
      ],
      visualElements: [
        {
          id: 'input_visual',
          type: 'bar',
          position: { x: 100, y: 200 },
          size: { width: 60, height: 100 },
          dataBinding: ['parameter1'],
          style: { color: '#3b82f6', opacity: 0.8 }
        },
        {
          id: 'output_visual',
          type: 'bar',
          position: { x: 300, y: 200 },
          size: { width: 60, height: 100 },
          dataBinding: ['result'],
          style: { color: '#10b981', opacity: 0.8 }
        },
        {
          id: 'relationship_chart',
          type: 'line',
          position: { x: 450, y: 100 },
          size: { width: 200, height: 150 },
          dataBinding: ['parameter1', 'result'],
          style: { color: '#8b5cf6', opacity: 1 }
        }
      ],
      updateInterval: 33 // 30fps
    }
  }
}