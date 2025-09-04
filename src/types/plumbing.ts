export type PlumbingMaterial = 'copper' | 'pvc' | 'abs' | 'pex' | 'cast-iron' | 'steel' | 'other'

export interface PlumbingComponent {
  id: string
  type?: string
  material: PlumbingMaterial
  diameter?: number
  name?: string
  category?: string
  size?: string
  description?: string
  commonUses?: string[]
  codeReferences?: string[]
  modelPath?: string
}

export interface PlumbingInstallation {
  id: string
  name: string
  components: PlumbingComponent[]
  materials: any[]
}

export interface PlumbingTool {
  id: string
  name: string
  purpose?: string
}

export interface PlumbingSystem {
  id: string
  name: string
  components: PlumbingComponent[]
  type?: string
  pressureRequirements?: { min: number; max: number; unit: string }
}

export const PLUMBING_TERMINOLOGY: Record<string, string> = {
  flange: 'A toilet flange connects the toilet to the drainpipe and anchors it to the floor.',
  trap: 'A curved section of pipe that traps water to block sewer gases from entering buildings.'
}

