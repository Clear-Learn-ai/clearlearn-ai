import { 
  ProgressiveDepth, 
  DepthLevel, 
  ContentModality,
  ConceptAnalysis,
  LearningQuery,
  GeneratedContent
} from '@/core/types'
import { SmartContentGenerator } from '@/generators/SmartContentGenerator'
import { UserModel } from './UserModel'

export class ProgressiveDepthEngine {
  private smartContentGenerator: SmartContentGenerator
  private conceptDepths: Map<string, ProgressiveDepth> = new Map()
  private userDepthPreferences: Map<string, number> = new Map()

  constructor() {
    this.smartContentGenerator = new SmartContentGenerator()
  }

  /**
   * Initialize progressive depth for a concept
   */
  async initializeConceptDepth(
    concept: string,
    initialComplexity: number = 1,
    maxDepth: number = 5
  ): Promise<ProgressiveDepth> {
    console.log('🔍 Initializing progressive depth for:', concept)
    
    const progressiveDepth: ProgressiveDepth = {
      concept,
      levels: await this.generateDepthLevels(concept, maxDepth),
      currentLevel: 0,
      maxLevel: maxDepth - 1
    }
    
    this.conceptDepths.set(concept, progressiveDepth)
    console.log(`📚 Created ${maxDepth} depth levels for ${concept}`)
    
    return progressiveDepth
  }

  /**
   * Get content at specific depth level
   */
  async getContentAtDepth(
    concept: string,
    level: number,
    modality: ContentModality,
    userId?: string
  ): Promise<GeneratedContent> {
    console.log(`📖 Getting content at depth ${level} for ${concept}`)
    
    let progressiveDepth = this.conceptDepths.get(concept)
    
    if (!progressiveDepth) {
      progressiveDepth = await this.initializeConceptDepth(concept)
    }
    
    const targetLevel = Math.min(Math.max(level, 0), progressiveDepth.maxLevel)
    const depthLevel = progressiveDepth.levels[targetLevel]
    
    if (!depthLevel) {
      throw new Error(`Depth level ${targetLevel} not available for ${concept}`)
    }
    
    // Update user's depth preference
    if (userId) {
      this.userDepthPreferences.set(userId, targetLevel)
    }
    
    // Generate content using smart content generator with appropriate complexity
    const content = await this.smartContentGenerator.generateModalityContent(
      concept,
      modality,
      depthLevel.complexity
    )
    
    // Enhance content with depth-specific information
    const enhancedContent = this.enhanceContentWithDepth(content, depthLevel, modality)
    
    // Update current level
    progressiveDepth.currentLevel = targetLevel
    
    return {
      id: this.generateContentId(),
      queryId: `depth_${concept}_${level}`,
      modality,
      data: enhancedContent,
      metadata: {
        title: depthLevel.title,
        description: depthLevel.description,
        estimatedDuration: this.estimateDurationByDepth(modality, targetLevel),
        difficulty: depthLevel.complexity,
        tags: [concept, `depth-${targetLevel}`, `complexity-${depthLevel.complexity}`]
      }
    }
  }

  /**
   * Get next deeper level content
   */
  async goDeeper(
    concept: string,
    modality: ContentModality,
    userId?: string
  ): Promise<GeneratedContent | null> {
    const progressiveDepth = this.conceptDepths.get(concept)
    
    if (!progressiveDepth) {
      console.log('⚠️ No progressive depth initialized for:', concept)
      return null
    }
    
    const nextLevel = progressiveDepth.currentLevel + 1
    
    if (nextLevel > progressiveDepth.maxLevel) {
      console.log('🎯 Already at maximum depth for:', concept)
      return null
    }
    
    console.log(`🔽 Going deeper: ${concept} level ${nextLevel}`)
    return this.getContentAtDepth(concept, nextLevel, modality, userId)
  }

  /**
   * Get simpler level content
   */
  async goSimpler(
    concept: string,
    modality: ContentModality,
    userId?: string
  ): Promise<GeneratedContent | null> {
    const progressiveDepth = this.conceptDepths.get(concept)
    
    if (!progressiveDepth) {
      console.log('⚠️ No progressive depth initialized for:', concept)
      return null
    }
    
    const simpler = progressiveDepth.currentLevel - 1
    
    if (simpler < 0) {
      console.log('🎯 Already at simplest level for:', concept)
      return null
    }
    
    console.log(`🔼 Going simpler: ${concept} level ${simpler}`)
    return this.getContentAtDepth(concept, simpler, modality, userId)
  }

  /**
   * Get ELI5 (Explain Like I'm 5) version
   */
  async getELI5(concept: string, modality: ContentModality = 'animation'): Promise<GeneratedContent> {
    console.log('👶 Generating ELI5 explanation for:', concept)
    
    const eli5Explanation = await this.smartContentGenerator.generateELI5Explanation(concept)
    
    // Create simple content for ELI5
    const content = await this.smartContentGenerator.generateModalityContent(
      concept,
      modality,
      1 // Simplest complexity
    )
    
    return {
      id: this.generateContentId(),
      queryId: `eli5_${concept}`,
      modality,
      data: this.enhanceContentForELI5(content, eli5Explanation),
      metadata: {
        title: `${concept} - Explained Simply`,
        description: eli5Explanation.slice(0, 100) + '...',
        estimatedDuration: 30, // Shorter for ELI5
        difficulty: 1,
        tags: [concept, 'eli5', 'beginner']
      }
    }
  }

  /**
   * Get advanced explanation
   */
  async getAdvanced(concept: string, modality: ContentModality): Promise<GeneratedContent> {
    console.log('🎓 Generating advanced explanation for:', concept)
    
    let progressiveDepth = this.conceptDepths.get(concept)
    
    if (!progressiveDepth) {
      progressiveDepth = await this.initializeConceptDepth(concept, 1, 5)
    }
    
    return this.getContentAtDepth(concept, progressiveDepth.maxLevel, modality)
  }

  /**
   * Suggest optimal depth based on user model
   */
  suggestOptimalDepth(concept: string, userModel?: UserModel): number {
    if (!userModel) {
      return 1 // Start simple for new users
    }
    
    const beliefs = userModel.getBayesianBeliefs()
    const progress = userModel.getCurrentProgress()
    
    // Base depth on complexity preference and learning speed
    let suggestedDepth = Math.round(beliefs.complexityPreference / 2) // 1-5 scale
    
    // Adjust based on learning speed
    if (progress.learningSpeed === 'fast') {
      suggestedDepth += 1
    } else if (progress.learningSpeed === 'slow') {
      suggestedDepth -= 1
    }
    
    // Check if user has mastered similar concepts
    const relatedConcepts = progress.conceptsLearned.filter(learned => 
      learned.toLowerCase().includes(concept.toLowerCase()) ||
      concept.toLowerCase().includes(learned.toLowerCase())
    )
    
    if (relatedConcepts.length > 0) {
      suggestedDepth += 1 // Can handle more complexity
    }
    
    return Math.min(Math.max(suggestedDepth, 0), 4) // Keep within bounds
  }

  /**
   * Get depth progression path for a concept
   */
  getDepthProgression(concept: string): DepthLevel[] {
    const progressiveDepth = this.conceptDepths.get(concept)
    return progressiveDepth?.levels || []
  }

  /**
   * Check if user can progress to next depth
   */
  canProgressDeeper(concept: string, userPerformance: {
    timeSpent: number
    understood: boolean
    rating: number
  }): boolean {
    const progressiveDepth = this.conceptDepths.get(concept)
    
    if (!progressiveDepth || progressiveDepth.currentLevel >= progressiveDepth.maxLevel) {
      return false
    }
    
    // Criteria for progression:
    // 1. User understood current level
    // 2. Good rating (4+)
    // 3. Reasonable time spent (not rushed, not stuck)
    const currentLevel = progressiveDepth.levels[progressiveDepth.currentLevel]
    const expectedTime = this.estimateDurationByDepth('animation', progressiveDepth.currentLevel)
    
    return (
      userPerformance.understood &&
      userPerformance.rating >= 4 &&
      userPerformance.timeSpent >= expectedTime * 0.5 && // Not rushed
      userPerformance.timeSpent <= expectedTime * 3      // Not stuck
    )
  }

  private async generateDepthLevels(concept: string, maxDepth: number): Promise<DepthLevel[]> {
    const levels: DepthLevel[] = []
    
    // Define depth templates
    const depthTemplates = [
      {
        level: 0,
        title: `${concept} - Basic Introduction`,
        description: `Simple overview of ${concept} with basic concepts`,
        complexity: 1,
        titleSuffix: 'Simple Overview'
      },
      {
        level: 1,
        title: `${concept} - Core Concepts`,
        description: `Understanding the main ideas behind ${concept}`,
        complexity: 3,
        titleSuffix: 'Core Understanding'
      },
      {
        level: 2,
        title: `${concept} - Detailed Explanation`,
        description: `In-depth exploration of ${concept} mechanisms`,
        complexity: 5,
        titleSuffix: 'Detailed Analysis'
      },
      {
        level: 3,
        title: `${concept} - Advanced Topics`,
        description: `Advanced aspects and applications of ${concept}`,
        complexity: 7,
        titleSuffix: 'Advanced Concepts'
      },
      {
        level: 4,
        title: `${concept} - Expert Level`,
        description: `Expert-level understanding with cutting-edge research`,
        complexity: 9,
        titleSuffix: 'Expert Mastery'
      }
    ]
    
    for (let i = 0; i < maxDepth; i++) {
      const template = depthTemplates[i] || depthTemplates[depthTemplates.length - 1]
      
      // Generate prerequisites based on previous levels
      const prerequisites = i > 0 ? [`${concept} - Level ${i - 1}`] : []
      
      const level: DepthLevel = {
        level: i,
        title: template.title,
        description: template.description,
        complexity: template.complexity,
        prerequisites,
        content: null // Will be generated on demand
      }
      
      levels.push(level)
    }
    
    return levels
  }

  private enhanceContentWithDepth(content: any, depthLevel: DepthLevel, modality: ContentModality): any {
    // Add depth-specific enhancements based on modality
    switch (modality) {
      case 'animation':
        return {
          ...content,
          depthEnhancements: {
            complexity: depthLevel.complexity,
            narrationDepth: this.getDepthNarration(depthLevel.level),
            visualComplexity: Math.min(depthLevel.complexity / 2, 5)
          }
        }
      
      case 'simulation':
        return {
          ...content,
          parameters: content.parameters?.map((param: any) => ({
            ...param,
            advanced: depthLevel.level >= 2,
            expertMode: depthLevel.level >= 3
          })) || [],
          depthLevel: depthLevel.level
        }
      
      case 'concept-map':
        return {
          ...content,
          nodes: content.nodes?.map((node: any) => ({
            ...node,
            expandable: depthLevel.level < 3, // More expansion at deeper levels
            showDetails: depthLevel.level >= 2
          })) || []
        }
      
      default:
        return {
          ...content,
          depthMetadata: {
            level: depthLevel.level,
            complexity: depthLevel.complexity,
            prerequisites: depthLevel.prerequisites
          }
        }
    }
  }

  private enhanceContentForELI5(content: any, eli5Explanation: string): any {
    return {
      ...content,
      eli5: {
        explanation: eli5Explanation,
        simplified: true,
        ageGroup: '5-8',
        vocabulary: 'simple'
      }
    }
  }

  private getDepthNarration(level: number): string {
    const narrationStyles = [
      'Simple, friendly language with basic vocabulary',
      'Clear explanations with some technical terms',
      'Detailed descriptions with proper terminology',
      'Advanced concepts with scientific precision',
      'Expert-level analysis with research references'
    ]
    
    return narrationStyles[level] || narrationStyles[0]
  }

  private estimateDurationByDepth(modality: ContentModality, level: number): number {
    const baseDurations: Record<ContentModality, number> = {
      'animation': 30,
      'simulation': 60,
      '3d': 45,
      'concept-map': 90,
      'diagram': 20,
      'interactive': 60,
      'text': 10
    }
    
    const base = baseDurations[modality] || 30
    const complexityMultiplier = 1 + (level * 0.5) // Each level adds 50% more time
    
    return Math.round(base * complexityMultiplier)
  }

  private generateContentId(): string {
    return `progressive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}