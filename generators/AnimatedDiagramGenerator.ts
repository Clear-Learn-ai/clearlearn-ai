import { 
  ConceptAnalysis, 
  AnimationData, 
  AnimationStep, 
  CanvasElement, 
  ElementAnimation 
} from '@/core/types'

export class AnimatedDiagramGenerator {
  private readonly CANVAS_WIDTH = 800
  private readonly CANVAS_HEIGHT = 600
  
  /**
   * Generates animated content based on concept analysis
   */
  async generate(analysis: ConceptAnalysis): Promise<AnimationData> {
    const topic = analysis.topic.toLowerCase()
    
    // Route to specific generators based on topic
    if (topic.includes('photosynthesis')) {
      return this.generatePhotosynthesisAnimation()
    }
    
    // Default fallback animation
    return this.generateGenericProcessAnimation(analysis)
  }
  
  /**
   * Generates detailed photosynthesis animation
   */
  private generatePhotosynthesisAnimation(): AnimationData {
    const steps: AnimationStep[] = [
      // Step 1: Introduction
      {
        id: 'intro',
        duration: 3000,
        elements: [
          this.createTitle('Photosynthesis', { x: 400, y: 50 }),
          this.createSubtitle('The process of converting light energy into chemical energy', { x: 400, y: 80 }),
          this.createPlantOutline({ x: 400, y: 300 })
        ],
        narration: 'Photosynthesis is how plants convert sunlight into energy'
      },
      
      // Step 2: Light absorption
      {
        id: 'light_absorption',
        duration: 4000,
        elements: [
          this.createPlantOutline({ x: 400, y: 300 }),
          this.createSun({ x: 200, y: 100 }),
          ...this.createLightRays({ startX: 200, startY: 100, endX: 350, endY: 200 }),
          this.createChloroplast({ x: 350, y: 200 }),
          this.createLabel('Chloroplast absorbs light', { x: 350, y: 180 })
        ],
        narration: 'Chloroplasts in leaves absorb sunlight energy'
      },
      
      // Step 3: Water absorption
      {
        id: 'water_absorption',
        duration: 4000,
        elements: [
          this.createPlantOutline({ x: 400, y: 300 }),
          this.createRoots({ x: 400, y: 450 }),
          ...this.createWaterMolecules({ startX: 300, startY: 500, endX: 400, endY: 400 }),
          this.createLabel('H₂O', { x: 250, y: 500 }),
          this.createLabel('Water absorbed by roots', { x: 400, y: 480 })
        ],
        narration: 'Roots absorb water from the soil'
      },
      
      // Step 4: CO2 intake
      {
        id: 'co2_intake',
        duration: 4000,
        elements: [
          this.createPlantOutline({ x: 400, y: 300 }),
          this.createLeaf({ x: 350, y: 200 }),
          ...this.createCO2Molecules({ startX: 150, startY: 200, endX: 330, endY: 200 }),
          this.createLabel('CO₂', { x: 100, y: 200 }),
          this.createLabel('Carbon dioxide enters through stomata', { x: 350, y: 160 })
        ],
        narration: 'Carbon dioxide enters through tiny pores called stomata'
      },
      
      // Step 5: The reaction
      {
        id: 'reaction',
        duration: 5000,
        elements: [
          this.createReactionEquation({ x: 400, y: 300 }),
          this.createEnergyBurst({ x: 400, y: 250 }),
          this.createLabel('6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂', { x: 400, y: 300 })
        ],
        narration: 'The chemical reaction combines CO2, water, and light energy to produce glucose and oxygen'
      },
      
      // Step 6: Products
      {
        id: 'products',
        duration: 4000,
        elements: [
          this.createPlantOutline({ x: 400, y: 300 }),
          this.createGlucose({ x: 400, y: 250 }),
          ...this.createOxygenMolecules({ startX: 350, startY: 200, endX: 600, endY: 150 }),
          this.createLabel('Glucose (C₆H₁₂O₆)', { x: 400, y: 220 }),
          this.createLabel('Oxygen (O₂) released', { x: 550, y: 130 })
        ],
        narration: 'Glucose provides energy for the plant, while oxygen is released into the atmosphere'
      }
    ]
    
    return {
      type: 'animation',
      steps,
      duration: steps.reduce((total, step) => total + step.duration, 0),
      canvas: {
        width: this.CANVAS_WIDTH,
        height: this.CANVAS_HEIGHT,
        backgroundColor: '#f0f9ff'
      }
    }
  }
  
  /**
   * Generic process animation for unknown topics
   */
  private generateGenericProcessAnimation(analysis: ConceptAnalysis): AnimationData {
    const steps: AnimationStep[] = [
      {
        id: 'generic_intro',
        duration: 3000,
        elements: [
          this.createTitle(analysis.topic, { x: 400, y: 100 }),
          this.createGenericProcess({ x: 400, y: 300 })
        ],
        narration: `Let's explore ${analysis.topic}`
      }
    ]
    
    return {
      type: 'animation',
      steps,
      duration: 3000,
      canvas: {
        width: this.CANVAS_WIDTH,
        height: this.CANVAS_HEIGHT,
        backgroundColor: '#f8fafc'
      }
    }
  }
  
  // Element creation helpers
  private createTitle(text: string, position: { x: number; y: number }): CanvasElement {
    return {
      id: `title_${Date.now()}`,
      type: 'text',
      position,
      properties: {
        text,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center'
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1000,
        easing: 'ease-in-out'
      }
    }
  }
  
  private createSubtitle(text: string, position: { x: number; y: number }): CanvasElement {
    return {
      id: `subtitle_${Date.now()}`,
      type: 'text',
      position,
      properties: {
        text,
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center'
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1000,
        easing: 'ease-in-out'
      }
    }
  }
  
  private createPlantOutline(position: { x: number; y: number }): CanvasElement {
    return {
      id: `plant_${Date.now()}`,
      type: 'path',
      position,
      properties: {
        path: this.getPlantPath(),
        strokeColor: '#16a34a',
        strokeWidth: 3,
        fillColor: '#dcfce7'
      },
      animation: {
        type: 'scale',
        from: { scale: 0 },
        to: { scale: 1 },
        duration: 1500,
        easing: 'ease-out'
      }
    }
  }
  
  private createSun(position: { x: number; y: number }): CanvasElement {
    return {
      id: `sun_${Date.now()}`,
      type: 'circle',
      position,
      properties: {
        radius: 40,
        fillColor: '#fbbf24',
        strokeColor: '#f59e0b',
        strokeWidth: 2
      },
      animation: {
        type: 'scale',
        from: { scale: 0 },
        to: { scale: 1 },
        duration: 1000,
        easing: 'ease-out'
      }
    }
  }
  
  private createLightRays(coords: { startX: number; startY: number; endX: number; endY: number }): CanvasElement[] {
    const rays: CanvasElement[] = []
    
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 15 // Spread rays
      const rad = (angle * Math.PI) / 180
      const endX = coords.startX + Math.cos(rad) * 150
      const endY = coords.startY + Math.sin(rad) * 150
      
      rays.push({
        id: `light_ray_${i}`,
        type: 'path',
        position: { x: coords.startX, y: coords.startY },
        properties: {
          path: `M 0,0 L ${endX - coords.startX},${endY - coords.startY}`,
          strokeColor: '#fbbf24',
          strokeWidth: 3,
          opacity: 0.7
        },
        animation: {
          type: 'fade',
          from: { opacity: 0 },
          to: { opacity: 0.7 },
          duration: 1500,
          easing: 'ease-in-out'
        }
      })
    }
    
    return rays
  }
  
  private createChloroplast(position: { x: number; y: number }): CanvasElement {
    return {
      id: `chloroplast_${Date.now()}`,
      type: 'ellipse',
      position,
      properties: {
        width: 30,
        height: 15,
        fillColor: '#22c55e',
        strokeColor: '#16a34a',
        strokeWidth: 2
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1000,
        easing: 'ease-in-out'
      }
    }
  }
  
  private createRoots(position: { x: number; y: number }): CanvasElement {
    return {
      id: `roots_${Date.now()}`,
      type: 'path',
      position,
      properties: {
        path: this.getRootPath(),
        strokeColor: '#a16207',
        strokeWidth: 3,
        fillColor: 'none'
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1500,
        easing: 'ease-in-out'
      }
    }
  }
  
  private createWaterMolecules(coords: { startX: number; startY: number; endX: number; endY: number }): CanvasElement[] {
    const molecules: CanvasElement[] = []
    
    for (let i = 0; i < 3; i++) {
      molecules.push({
        id: `water_molecule_${i}`,
        type: 'circle',
        position: { 
          x: coords.startX + i * 20, 
          y: coords.startY 
        },
        properties: {
          radius: 6,
          fillColor: '#3b82f6',
          strokeColor: '#1d4ed8',
          strokeWidth: 1
        },
        animation: {
          type: 'move',
          from: { x: coords.startX + i * 20, y: coords.startY },
          to: { x: coords.endX + i * 10, y: coords.endY },
          duration: 2000,
          easing: 'ease-in-out'
        }
      })
    }
    
    return molecules
  }
  
  private createCO2Molecules(coords: { startX: number; startY: number; endX: number; endY: number }): CanvasElement[] {
    const molecules: CanvasElement[] = []
    
    for (let i = 0; i < 4; i++) {
      molecules.push({
        id: `co2_molecule_${i}`,
        type: 'circle',
        position: { 
          x: coords.startX + i * 15, 
          y: coords.startY + (i % 2) * 10 
        },
        properties: {
          radius: 5,
          fillColor: '#64748b',
          strokeColor: '#475569',
          strokeWidth: 1
        },
        animation: {
          type: 'move',
          from: { x: coords.startX + i * 15, y: coords.startY + (i % 2) * 10 },
          to: { x: coords.endX, y: coords.endY },
          duration: 2500,
          easing: 'ease-in-out'
        }
      })
    }
    
    return molecules
  }
  
  private createOxygenMolecules(coords: { startX: number; startY: number; endX: number; endY: number }): CanvasElement[] {
    const molecules: CanvasElement[] = []
    
    for (let i = 0; i < 3; i++) {
      molecules.push({
        id: `oxygen_molecule_${i}`,
        type: 'circle',
        position: { 
          x: coords.startX, 
          y: coords.startY 
        },
        properties: {
          radius: 6,
          fillColor: '#ef4444',
          strokeColor: '#dc2626',
          strokeWidth: 1
        },
        animation: {
          type: 'move',
          from: { x: coords.startX, y: coords.startY },
          to: { x: coords.endX + i * 20, y: coords.endY + i * 5 },
          duration: 2000,
          easing: 'ease-out'
        }
      })
    }
    
    return molecules
  }
  
  private createLeaf(position: { x: number; y: number }): CanvasElement {
    return {
      id: `leaf_${Date.now()}`,
      type: 'path',
      position,
      properties: {
        path: this.getLeafPath(),
        fillColor: '#22c55e',
        strokeColor: '#16a34a',
        strokeWidth: 2
      },
      animation: {
        type: 'scale',
        from: { scale: 0 },
        to: { scale: 1 },
        duration: 1000,
        easing: 'ease-out'
      }
    }
  }
  
  private createReactionEquation(position: { x: number; y: number }): CanvasElement {
    return {
      id: `equation_${Date.now()}`,
      type: 'rectangle',
      position,
      properties: {
        width: 400,
        height: 80,
        fillColor: '#fef3c7',
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        borderRadius: 8
      },
      animation: {
        type: 'scale',
        from: { scale: 0 },
        to: { scale: 1 },
        duration: 1000,
        easing: 'ease-out'
      }
    }
  }
  
  private createEnergyBurst(position: { x: number; y: number }): CanvasElement {
    return {
      id: `energy_${Date.now()}`,
      type: 'circle',
      position,
      properties: {
        radius: 50,
        fillColor: 'none',
        strokeColor: '#fbbf24',
        strokeWidth: 4,
        opacity: 0.7
      },
      animation: {
        type: 'scale',
        from: { scale: 0 },
        to: { scale: 2 },
        duration: 2000,
        easing: 'ease-out'
      }
    }
  }
  
  private createGlucose(position: { x: number; y: number }): CanvasElement {
    return {
      id: `glucose_${Date.now()}`,
      type: 'rectangle',
      position,
      properties: {
        width: 60,
        height: 30,
        fillColor: '#fde68a',
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        borderRadius: 15
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1500,
        easing: 'ease-in-out'
      }
    }
  }
  
  private createLabel(text: string, position: { x: number; y: number }): CanvasElement {
    return {
      id: `label_${Date.now()}`,
      type: 'text',
      position,
      properties: {
        text,
        fontSize: 14,
        color: '#374151',
        textAlign: 'center'
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1000,
        easing: 'ease-in-out'
      }
    }
  }
  
  private createGenericProcess(position: { x: number; y: number }): CanvasElement {
    return {
      id: `process_${Date.now()}`,
      type: 'rectangle',
      position,
      properties: {
        width: 200,
        height: 100,
        fillColor: '#e5e7eb',
        strokeColor: '#6b7280',
        strokeWidth: 2,
        borderRadius: 8
      },
      animation: {
        type: 'fade',
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 1000,
        easing: 'ease-in-out'
      }
    }
  }
  
  // SVG path helpers
  private getPlantPath(): string {
    return 'M 0,-100 Q -20,-80 -15,-50 L -10,0 L -5,50 Q -3,80 0,100 Q 3,80 5,50 L 10,0 L 15,-50 Q 20,-80 0,-100'
  }
  
  private getRootPath(): string {
    return 'M 0,0 Q -30,20 -40,40 M 0,0 Q 0,25 -10,45 M 0,0 Q 30,20 40,40 M 0,0 Q 0,25 10,45'
  }
  
  private getLeafPath(): string {
    return 'M 0,0 Q -15,-10 -20,0 Q -15,10 0,5 Q 15,10 20,0 Q 15,-10 0,0'
  }
}