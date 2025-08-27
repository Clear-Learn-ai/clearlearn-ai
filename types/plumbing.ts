// Plumbing-specific types for TradeAI Tutor

export interface PlumbingComponent {
  id: string
  name: string
  category: 'pipe' | 'fitting' | 'fixture' | 'tool' | 'valve'
  material: 'copper' | 'pvc' | 'abs' | 'pex' | 'cast-iron' | 'steel' | 'other'
  size: string // e.g., "1/2", "3/4", "1", "1-1/4"
  description: string
  codeReferences?: string[]
  commonUses: string[]
  installationSteps?: string[]
  visualModel?: PlumbingModel3D
}

export interface PlumbingModel3D {
  modelPath: string
  scale: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  animations?: PlumbingAnimation[]
}

export interface PlumbingAnimation {
  name: string
  type: 'rotation' | 'translation' | 'scale' | 'color' | 'opacity'
  duration: number
  keyframes: AnimationKeyframe[]
}

export interface AnimationKeyframe {
  time: number // 0-1
  value: number | [number, number, number] | string
}

export interface PlumbingInstallation {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeEstimate: string // e.g., "2-4 hours"
  tools: PlumbingTool[]
  materials: PlumbingComponent[]
  steps: InstallationStep[]
  codeRequirements: CodeRequirement[]
  safetyWarnings: string[]
  commonMistakes: string[]
}

export interface InstallationStep {
  id: string
  title: string
  description: string
  visualType: '3d-model' | 'diagram' | 'photo' | 'video'
  visualContent: string
  tools?: string[]
  materials?: string[]
  tips?: string[]
  warnings?: string[]
  codeNotes?: string[]
}

export interface PlumbingTool {
  id: string
  name: string
  category: 'cutting' | 'joining' | 'measuring' | 'safety' | 'specialty'
  description: string
  uses: string[]
  safetyNotes: string[]
  visualModel?: PlumbingModel3D
}

export interface CodeRequirement {
  jurisdiction: 'IPC' | 'UPC' | 'local' | 'canadian' | 'ontario'
  section: string
  requirement: string
  rationale: string
  violations?: string[]
}

export interface PlumbingProblem {
  id: string
  symptom: string
  possibleCauses: string[]
  diagnosticSteps: string[]
  solutions: PlumbingSolution[]
  preventionTips: string[]
}

export interface PlumbingSolution {
  id: string
  title: string
  difficulty: 'easy' | 'moderate' | 'professional'
  estimatedTime: string
  tools: PlumbingTool[]
  materials: PlumbingComponent[]
  steps: InstallationStep[]
  cost: 'low' | 'medium' | 'high'
}

export interface PlumbingSystem {
  id: string
  name: string
  type: 'supply' | 'waste' | 'vent' | 'gas' | 'mixed'
  components: PlumbingComponent[]
  flowDiagram: string
  pressureRequirements?: {
    min: number
    max: number
    unit: 'psi' | 'kPa'
  }
  codeRequirements: CodeRequirement[]
}

export interface PlumbingLearningContent {
  id: string
  title: string
  category: 'installation' | 'repair' | 'troubleshooting' | 'code' | 'safety' | 'tools'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  contentType: '3d-visualization' | 'step-by-step' | 'interactive-diagram' | 'video' | 'code-reference'
  learningObjectives: string[]
  prerequisites?: string[]
  estimatedTime: string
  content: PlumbingInstallation | PlumbingProblem | PlumbingComponent | PlumbingSystem
}

// Sample questions for different skill levels
export const SAMPLE_PLUMBING_QUESTIONS = {
  beginner: [
    "What are the different types of pipes used in plumbing?",
    "How do I identify pipe sizes?",
    "What tools do I need as a plumbing apprentice?",
    "What's the difference between supply and waste lines?",
    "How do I read a plumbing diagram?"
  ],
  intermediate: [
    "How do I install a toilet flange?",
    "What size pipe for kitchen sink?",
    "How to fix a P-trap leak?",
    "Show me different joint types",
    "How do I install a water heater?",
    "What's the proper venting for a bathroom?",
    "How do I size a drain line?",
    "What are the slope requirements for waste pipes?"
  ],
  advanced: [
    "How do I design a whole house plumbing system?",
    "What are the code requirements for backflow prevention?",
    "How do I calculate pipe friction loss?",
    "What's involved in a sewer line replacement?",
    "How do I install a grease trap?",
    "What are the requirements for medical gas systems?"
  ]
}

export const PLUMBING_TERMINOLOGY = {
  // Basic terms
  "flange": "A flat circular plate with holes for bolts, used to connect pipes or secure fixtures",
  "p-trap": "A U-shaped pipe trap that prevents sewer gases from entering buildings",
  "coupling": "A fitting used to connect two pipes of the same diameter",
  "reducer": "A fitting that connects pipes of different sizes",
  "elbow": "A pipe fitting that changes the direction of the pipe",
  "tee": "A T-shaped fitting that allows connection of three pipes",
  "union": "A fitting that allows pipes to be disconnected without cutting",
  
  // Tools
  "pipe wrench": "An adjustable wrench designed to grip and turn threaded pipes and fittings",
  "channel locks": "Adjustable pliers with serrated jaws for gripping pipes",
  "tubing cutter": "A tool for making clean, square cuts in pipes",
  "reamer": "A tool for removing burrs from the inside of cut pipes",
  "flux": "A chemical compound used to prepare surfaces for soldering",
  
  // Materials
  "sweated joint": "A soldered copper pipe connection",
  "threaded joint": "A connection using threaded pipes and fittings",
  "compression fitting": "A fitting that seals using a compressed ferrule or ring",
  "solvent welding": "Joining PVC pipes using solvent cement",
  
  // Code terms
  "fixture unit": "A unit of measure for the load-producing effects of plumbing fixtures",
  "water hammer": "A pressure surge caused by sudden stopping of water flow",
  "backflow": "The unwanted reversal of water flow in a plumbing system",
  "cross connection": "A connection between potable and non-potable water systems"
}

export type PlumbingSkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type PlumbingContentType = '3d-model' | 'step-by-step' | 'interactive-diagram' | 'video' | 'code-reference'