export interface LearningQuery {
  id: string
  text: string
  timestamp: Date
  userId?: string
}

export interface ConceptAnalysis {
  topic: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
  keywords: string[]
  suggestedModality: ContentModality
  prerequisites: string[]
}

export type ContentModality = 'animation' | '3d' | 'diagram' | 'interactive' | 'text' | 'simulation' | 'concept-map'

export interface GeneratedContent {
  id: string
  queryId: string
  modality: ContentModality
  data: AnimationData | DiagramData | InteractiveData | TextData | SimulationData | ConceptMapData | Model3DData
  metadata: ContentMetadata
}

export interface ContentMetadata {
  title: string
  description: string
  estimatedDuration: number // in seconds
  difficulty: number // 1-10
  tags: string[]
}

export interface AnimationData {
  type: 'animation'
  steps: AnimationStep[]
  duration: number
  canvas: {
    width: number
    height: number
    backgroundColor: string
  }
}

export interface AnimationStep {
  id: string
  duration: number
  elements: CanvasElement[]
  narration?: string
}

export interface CanvasElement {
  id: string
  type: 'circle' | 'rectangle' | 'arrow' | 'text' | 'path' | 'ellipse'
  position: { x: number; y: number }
  properties: Record<string, any>
  animation?: ElementAnimation
}

export interface ElementAnimation {
  type: 'fade' | 'move' | 'scale' | 'rotate'
  from: Record<string, any>
  to: Record<string, any>
  duration: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface DiagramData {
  type: 'diagram'
  nodes: DiagramNode[]
  connections: DiagramConnection[]
}

export interface DiagramNode {
  id: string
  label: string
  position: { x: number; y: number }
  style: NodeStyle
}

export interface DiagramConnection {
  id: string
  from: string
  to: string
  label?: string
  style: ConnectionStyle
}

export interface NodeStyle {
  shape: 'circle' | 'rectangle' | 'ellipse'
  color: string
  size: { width: number; height: number }
}

export interface ConnectionStyle {
  type: 'arrow' | 'line'
  color: string
  width: number
}

export interface InteractiveData {
  type: 'interactive'
  components: InteractiveComponent[]
}

export interface InteractiveComponent {
  id: string
  type: 'button' | 'slider' | 'input' | 'toggle'
  properties: Record<string, any>
  actions: ComponentAction[]
}

export interface ComponentAction {
  trigger: string
  effect: string
  target: string
}

export interface TextData {
  type: 'text'
  content: string
  formatting: TextFormatting
}

export interface TextFormatting {
  highlights: TextHighlight[]
  structure: 'paragraph' | 'list' | 'steps'
}

export interface TextHighlight {
  start: number
  end: number
  type: 'important' | 'definition' | 'example'
}

export interface UserProgress {
  userId: string
  sessionsCompleted: number
  conceptsLearned: string[]
  averageComprehension: number
  preferredModality: ContentModality
  learningSpeed: 'slow' | 'normal' | 'fast'
  modalitySuccessRates: Record<ContentModality, number>
  averageTimeToUnderstand: Record<ContentModality, number>
  complexityPreference: number // 1-10 scale
  lastUpdated: Date
}

export interface FeedbackData {
  contentId: string
  understood: boolean
  rating: number // 1-5
  comments?: string
  timestamp: Date
}

export interface SessionMetrics {
  sessionId: string
  startTime: Date
  endTime?: Date
  queriesCount: number
  feedbackProvided: number
  averageRating: number
  conceptsCovered: string[]
}

// New content types for Day 2
export interface SimulationData {
  type: 'simulation'
  simulationType: 'physics' | 'chemical' | 'biological' | 'economic'
  parameters: SimulationParameter[]
  initialState: Record<string, number>
  constraints: SimulationConstraint[]
  visualElements: SimulationVisual[]
  updateInterval: number
}

export interface SimulationParameter {
  id: string
  name: string
  description: string
  min: number
  max: number
  default: number
  unit: string
  category: 'input' | 'output' | 'derived'
}

export interface SimulationConstraint {
  id: string
  description: string
  formula: string
  active: boolean
}

export interface SimulationVisual {
  id: string
  type: 'bar' | 'line' | 'scatter' | 'particle' | 'flow'
  position: { x: number; y: number }
  size: { width: number; height: number }
  dataBinding: string[]
  style: VisualStyle
}

export interface VisualStyle {
  color: string
  opacity: number
  strokeWidth?: number
  fill?: boolean
}

export interface Model3DData {
  type: '3d'
  modelType: 'molecular' | 'anatomical' | 'mechanical' | 'architectural' | 'astronomical'
  geometry: GeometryDefinition
  materials: MaterialDefinition[]
  animations: Model3DAnimation[]
  interactions: InteractionDefinition[]
  camera: CameraSettings
  lighting: LightingSetup
}

export interface GeometryDefinition {
  type: 'primitive' | 'imported' | 'procedural'
  data: any // Geometry data - could be vertices, URL, or generation parameters
  scale: { x: number; y: number; z: number }
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
}

export interface MaterialDefinition {
  id: string
  type: 'basic' | 'standard' | 'physical'
  properties: {
    color?: string
    opacity?: number
    metalness?: number
    roughness?: number
    texture?: string
  }
}

export interface Model3DAnimation {
  id: string
  target: string
  property: 'position' | 'rotation' | 'scale' | 'material'
  keyframes: AnimationKeyframe[]
  duration: number
  loop: boolean
}

export interface AnimationKeyframe {
  time: number
  value: any
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface InteractionDefinition {
  type: 'click' | 'hover' | 'drag'
  target: string
  action: InteractionAction
}

export interface InteractionAction {
  type: 'highlight' | 'animate' | 'showInfo' | 'changeCamera'
  parameters: Record<string, any>
}

export interface CameraSettings {
  type: 'perspective' | 'orthographic'
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
  fov?: number
  near: number
  far: number
}

export interface LightingSetup {
  ambient: { color: string; intensity: number }
  directional: DirectionalLight[]
  point: PointLight[]
}

export interface DirectionalLight {
  color: string
  intensity: number
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
}

export interface PointLight {
  color: string
  intensity: number
  position: { x: number; y: number; z: number }
  distance: number
}

export interface ConceptMapData {
  type: 'concept-map'
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  layout: LayoutSettings
  interactions: MapInteraction[]
  styling: ConceptMapStyle
}

export interface ConceptNode {
  id: string
  label: string
  type: 'concept' | 'process' | 'entity' | 'property'
  level: number
  position?: { x: number; y: number }
  size: { width: number; height: number }
  data: {
    description: string
    examples?: string[]
    relatedConcepts?: string[]
    expandable: boolean
  }
  style: NodeStyle
}

export interface ConceptEdge {
  id: string
  from: string
  to: string
  label?: string
  type: 'causes' | 'contains' | 'requires' | 'produces' | 'relates-to'
  weight: number
  style: EdgeStyle
}

export interface EdgeStyle {
  color: string
  width: number
  dashed?: boolean
  arrow?: 'to' | 'from' | 'both' | 'none'
}

export interface LayoutSettings {
  algorithm: 'force-directed' | 'hierarchical' | 'radial' | 'manual'
  spacing: number
  iterations?: number
  nodeRepulsion?: number
  edgeLength?: number
}

export interface MapInteraction {
  type: 'click' | 'hover' | 'expand' | 'collapse'
  target: 'node' | 'edge' | 'background'
  action: MapAction
}

export interface MapAction {
  type: 'expand' | 'highlight' | 'filter' | 'navigate' | 'showDetails'
  parameters: Record<string, any>
}

export interface ConceptMapStyle {
  backgroundColor: string
  nodeDefaults: NodeStyle
  edgeDefaults: EdgeStyle
  highlightColor: string
  selectionColor: string
}

// Day 3: Intelligence Layer Types

export interface SmartContentRequest {
  concept: string
  targetModality: ContentModality
  complexityLevel: number // 1-10
  userContext?: UserLearningContext
  previousAttempts?: string[]
}

export interface UserLearningContext {
  userId: string
  knownConcepts: string[]
  preferredComplexity: number
  successfulModalities: ContentModality[]
  struggledConcepts: string[]
}

export interface LLMGeneratedContent {
  explanation: string
  animationScript?: AnimationScript
  simulationConfig?: SimulationConfig
  conceptBreakdown?: ConceptBreakdown
  metadata: LLMContentMetadata
}

export interface AnimationScript {
  steps: ScriptStep[]
  totalDuration: number
  narration: string[]
}

export interface ScriptStep {
  timestamp: number
  action: string
  description: string
  visualElements: string[]
}

export interface SimulationConfig {
  variables: SimulationVariable[]
  relationships: VariableRelationship[]
  scenarios: SimulationScenario[]
}

export interface SimulationVariable {
  name: string
  type: 'input' | 'output' | 'derived'
  range: [number, number]
  unit: string
  description: string
}

export interface VariableRelationship {
  formula: string
  description: string
  variables: string[]
}

export interface SimulationScenario {
  name: string
  description: string
  initialValues: Record<string, number>
  expectedOutcome: string
}

export interface ConceptBreakdown {
  mainConcept: string
  prerequisites: string[]
  subConcepts: SubConcept[]
  progressionPath: string[]
}

export interface SubConcept {
  name: string
  description: string
  difficulty: number
  estimatedTime: number
  requiredFor: string[]
}

export interface LLMContentMetadata {
  provider: 'openai' | 'anthropic'
  model: string
  tokensUsed: number
  generationTime: number
  complexity: number
  confidence: number
}

export interface UserInteraction {
  userId: string
  sessionId: string
  contentId: string
  timestamp: Date
  action: InteractionAction
  timeSpent: number
  modality: ContentModality
  understood: boolean
  switchedModality: boolean
  depth: number
}

export interface InteractionAction {
  type: 'view' | 'interact' | 'feedback' | 'switch_modality' | 'go_deeper' | 'simplify'
  target?: string
  value?: any
}

export interface LearningPattern {
  userId: string
  patterns: PatternInsight[]
  recommendations: ModalityRecommendation[]
  lastAnalyzed: Date
}

export interface PatternInsight {
  pattern: string
  confidence: number
  examples: string[]
  recommendation: string
}

export interface ModalityRecommendation {
  concept: string
  recommendedModality: ContentModality
  confidence: number
  reasoning: string
  fallbacks: ContentModality[]
}

export interface BayesianBeliefs {
  modalityPreferences: Record<ContentModality, number>
  complexityPreference: number
  conceptualStrengths: Record<string, number>
  learningSpeed: number
  lastUpdated: Date
}

export interface AdaptationEvent {
  timestamp: Date
  trigger: 'time_threshold' | 'confusion_detected' | 'manual_switch' | 'system_suggestion'
  fromModality: ContentModality
  toModality: ContentModality
  concept: string
  userId: string
  successful: boolean
}

export interface ProgressiveDepth {
  concept: string
  levels: DepthLevel[]
  currentLevel: number
  maxLevel: number
}

export interface DepthLevel {
  level: number
  title: string
  description: string
  complexity: number
  prerequisites: string[]
  content: any // Modality-specific content
}

export interface LearningAnalytics {
  userId: string
  totalSessions: number
  conceptsMastered: number
  averageSessionDuration: number
  modalityDistribution: Record<ContentModality, number>
  masteryProgression: MasteryPoint[]
  struggleAreas: StruggleArea[]
  adaptationEvents: AdaptationEvent[]
  currentStreak: number
  longestStreak: number
}

export interface MasteryPoint {
  concept: string
  timestamp: Date
  modality: ContentModality
  attemptsNeeded: number
  finalComplexity: number
}

export interface StruggleArea {
  concept: string
  attempts: number
  modalitiesTried: ContentModality[]
  timeSpent: number
  finallyUnderstood: boolean
  helpfulModality?: ContentModality
}