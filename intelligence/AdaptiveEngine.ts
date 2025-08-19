import { 
  ContentModality, 
  UserInteraction, 
  AdaptationEvent,
  ConceptAnalysis,
  GeneratedContent,
  LearningQuery
} from '@/core/types'
import { UserModel } from './UserModel'
import { BayesianPredictor } from './BayesianPredictor'
import { SmartContentGenerator } from '@/generators/SmartContentGenerator'
import { ProgressiveDepthEngine } from './ProgressiveDepthEngine'

export class AdaptiveEngine {
  private userModels: Map<string, UserModel> = new Map()
  private bayesianPredictors: Map<string, BayesianPredictor> = new Map()
  private smartContentGenerator: SmartContentGenerator
  private progressiveDepthEngine: ProgressiveDepthEngine
  private adaptationEvents: AdaptationEvent[] = []
  private fallbackTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.smartContentGenerator = new SmartContentGenerator()
    this.progressiveDepthEngine = new ProgressiveDepthEngine()
  }

  /**
   * Get or create user model and predictor for a user
   */
  private getUserModel(userId: string): UserModel {
    if (!this.userModels.has(userId)) {
      const userModel = new UserModel(userId)
      const predictor = new BayesianPredictor(userModel)
      
      this.userModels.set(userId, userModel)
      this.bayesianPredictors.set(userId, predictor)
      
      console.log('🆕 Created new user model for:', userId)
    }
    
    return this.userModels.get(userId)!
  }

  private getBayesianPredictor(userId: string): BayesianPredictor {
    this.getUserModel(userId) // Ensure both exist
    return this.bayesianPredictors.get(userId)!
  }

  /**
   * Get intelligent modality recommendation using Bayesian prediction
   */
  getRecommendedModality(
    concept: string,
    conceptAnalysis: ConceptAnalysis,
    userId?: string
  ): ContentModality {
    if (!userId) {
      console.log('🤖 No user ID, using analysis-based selection')
      return this.fallbackToAnalysis(conceptAnalysis)
    }

    const predictor = this.getBayesianPredictor(userId)
    const recommendation = predictor.predictBestModality(concept, conceptAnalysis)
    
    console.log(`🎯 Bayesian recommendation for ${userId}: ${recommendation.recommendedModality}`)
    console.log(`📊 Confidence: ${(recommendation.confidence * 100).toFixed(1)}%`)
    console.log(`🧠 Reasoning: ${recommendation.reasoning}`)
    
    return recommendation.recommendedModality
  }

  /**
   * Generate content with intelligent fallback and timeout handling
   */
  async generateAdaptiveContent(
    query: LearningQuery,
    analysis: ConceptAnalysis,
    userId?: string
  ): Promise<GeneratedContent> {
    const primaryModality = this.getRecommendedModality(query.text, analysis, userId)
    const fallbackChain = this.getFallbackChain(primaryModality, userId)
    
    console.log('🔄 Starting adaptive content generation with fallback chain:', fallbackChain)
    
    for (let i = 0; i < fallbackChain.length; i++) {
      const currentModality = fallbackChain[i]
      const isLastAttempt = i === fallbackChain.length - 1
      
      try {
        console.log(`🎨 Attempting generation with ${currentModality} (attempt ${i + 1}/${fallbackChain.length})`)
        
        const content = await this.generateWithTimeout(
          query,
          analysis,
          currentModality,
          30000 // 30 second timeout
        )
        
        // Record successful generation
        if (userId && i > 0) {
          this.recordAdaptationEvent({
            timestamp: new Date(),
            trigger: 'system_suggestion',
            fromModality: primaryModality,
            toModality: currentModality,
            concept: analysis.topic,
            userId,
            successful: true
          })
        }
        
        return content
        
      } catch (error) {
        console.warn(`❌ ${currentModality} generation failed:`, error.message)
        
        if (userId) {
          this.recordAdaptationEvent({
            timestamp: new Date(),
            trigger: 'system_suggestion',
            fromModality: primaryModality,
            toModality: currentModality,
            concept: analysis.topic,
            userId,
            successful: false
          })
        }
        
        if (isLastAttempt) {
          throw new Error(`All modalities failed for concept: ${analysis.topic}`)
        }
      }
    }
    
    throw new Error('Adaptive generation failed completely')
  }

  /**
   * Start automatic modality switching based on user behavior
   */
  startAdaptiveSession(userId: string, contentId: string): void {
    console.log('⏰ Starting adaptive session timer for user:', userId)
    
    // Set timeout for automatic modality switch if user doesn't interact
    const timeout = setTimeout(() => {
      this.triggerConfusionDetection(userId, contentId)
    }, 45000) // 45 seconds of inactivity
    
    this.fallbackTimeouts.set(`${userId}_${contentId}`, timeout)
  }

  /**
   * Stop adaptive session (user understood or moved on)
   */
  stopAdaptiveSession(userId: string, contentId: string): void {
    const timeoutKey = `${userId}_${contentId}`
    const timeout = this.fallbackTimeouts.get(timeoutKey)
    
    if (timeout) {
      clearTimeout(timeout)
      this.fallbackTimeouts.delete(timeoutKey)
      console.log('✅ Stopped adaptive session for:', userId)
    }
  }

  /**
   * Record user interaction and update models
   */
  recordUserInteraction(interaction: UserInteraction): void {
    const userModel = this.getUserModel(interaction.userId)
    const predictor = this.getBayesianPredictor(interaction.userId)
    
    // Record in user model
    userModel.recordInteraction(interaction)
    
    // Update Bayesian beliefs
    predictor.updateBeliefsAfterInteraction(interaction)
    
    // If user switched modality manually, record adaptation event
    if (interaction.switchedModality) {
      this.recordAdaptationEvent({
        timestamp: interaction.timestamp,
        trigger: 'manual_switch',
        fromModality: 'animation', // Would need to track previous modality
        toModality: interaction.modality,
        concept: interaction.contentId,
        userId: interaction.userId,
        successful: interaction.understood
      })
    }
    
    // Stop adaptive session if user understood
    if (interaction.understood) {
      this.stopAdaptiveSession(interaction.userId, interaction.contentId)
    }
  }

  /**
   * Get learning analytics for a user
   */
  getUserAnalytics(userId: string): any {
    const userModel = this.getUserModel(userId)
    const predictor = this.getBayesianPredictor(userId)
    
    return {
      progress: userModel.getCurrentProgress(),
      patterns: userModel.getLearningPatterns(),
      beliefs: userModel.getBayesianBeliefs(),
      adaptationEvents: this.adaptationEvents.filter(e => e.userId === userId),
      recommendations: predictor.getRankedModalityRecommendations('general', {
        topic: 'general',
        complexity: 'intermediate',
        keywords: [],
        suggestedModality: 'animation',
        prerequisites: []
      })
    }
  }

  /**
   * Suggest alternative modality when user is struggling
   */
  async suggestAlternativeModality(
    userId: string,
    currentModality: ContentModality,
    concept: string,
    conceptAnalysis: ConceptAnalysis
  ): Promise<{ modality: ContentModality; reasoning: string }> {
    const predictor = this.getBayesianPredictor(userId)
    const recommendations = predictor.getRankedModalityRecommendations(concept, conceptAnalysis)
    
    // Find the best alternative (not the current modality)
    const alternative = recommendations.find(r => r.recommendedModality !== currentModality)
    
    if (!alternative) {
      return {
        modality: 'text', // Fallback to text
        reasoning: 'No better alternative found, trying simplified text explanation'
      }
    }
    
    this.recordAdaptationEvent({
      timestamp: new Date(),
      trigger: 'confusion_detected',
      fromModality: currentModality,
      toModality: alternative.recommendedModality,
      concept,
      userId,
      successful: false // Will be updated when user responds
    })
    
    return {
      modality: alternative.recommendedModality,
      reasoning: alternative.reasoning
    }
  }

  /**
   * Generate content with progressive depth
   */
  async generateProgressiveContent(
    concept: string,
    modality: ContentModality,
    depth: number = 0,
    userId?: string
  ): Promise<GeneratedContent> {
    console.log(`📚 Generating progressive content for ${concept} at depth ${depth}`)
    
    // Initialize progressive depth if not exists
    const progressiveDepth = await this.progressiveDepthEngine.initializeConceptDepth(concept)
    
    // Suggest optimal depth if user provided
    let targetDepth = depth
    if (userId) {
      const userModel = this.getUserModel(userId)
      const suggestedDepth = this.progressiveDepthEngine.suggestOptimalDepth(concept, userModel)
      
      // Use suggested depth if no specific depth requested
      if (depth === 0) {
        targetDepth = suggestedDepth
        console.log(`🎯 Using suggested depth ${suggestedDepth} for user ${userId}`)
      }
    }
    
    return this.progressiveDepthEngine.getContentAtDepth(concept, targetDepth, modality, userId)
  }

  /**
   * Get ELI5 explanation
   */
  async getELI5Explanation(concept: string, modality: ContentModality = 'animation'): Promise<GeneratedContent> {
    console.log('👶 Generating ELI5 explanation for:', concept)
    return this.progressiveDepthEngine.getELI5(concept, modality)
  }

  /**
   * Get advanced explanation
   */
  async getAdvancedExplanation(concept: string, modality: ContentModality): Promise<GeneratedContent> {
    console.log('🎓 Generating advanced explanation for:', concept)
    return this.progressiveDepthEngine.getAdvanced(concept, modality)
  }

  /**
   * Progress to deeper level
   */
  async progressDeeper(
    concept: string,
    modality: ContentModality,
    userId?: string,
    userPerformance?: {
      timeSpent: number
      understood: boolean
      rating: number
    }
  ): Promise<GeneratedContent | null> {
    // Check if user can progress (if performance provided)
    if (userPerformance && !this.progressiveDepthEngine.canProgressDeeper(concept, userPerformance)) {
      console.log('⚠️ User performance suggests not ready for deeper level')
      return null
    }
    
    const result = await this.progressiveDepthEngine.goDeeper(concept, modality, userId)
    
    if (result && userId) {
      // Record depth progression event
      this.recordAdaptationEvent({
        timestamp: new Date(),
        trigger: 'go_deeper',
        fromModality: modality,
        toModality: modality,
        concept,
        userId,
        successful: true
      })
    }
    
    return result
  }

  /**
   * Go to simpler level
   */
  async goSimpler(
    concept: string,
    modality: ContentModality,
    userId?: string
  ): Promise<GeneratedContent | null> {
    const result = await this.progressiveDepthEngine.goSimpler(concept, modality, userId)
    
    if (result && userId) {
      // Record simplification event
      this.recordAdaptationEvent({
        timestamp: new Date(),
        trigger: 'simplify',
        fromModality: modality,
        toModality: modality,
        concept,
        userId,
        successful: true
      })
    }
    
    return result
  }

  /**
   * Get depth progression information
   */
  getDepthProgression(concept: string): any {
    return {
      levels: this.progressiveDepthEngine.getDepthProgression(concept),
      currentDepth: this.progressiveDepthEngine.getCurrentDepth?.(concept) || 0
    }
  }

  private async generateWithTimeout(
    query: LearningQuery,
    analysis: ConceptAnalysis,
    modality: ContentModality,
    timeout: number
  ): Promise<GeneratedContent> {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout: ${modality} generation took longer than ${timeout}ms`))
      }, timeout)
      
      try {
        // Try smart content generation first
        const smartContent = await this.smartContentGenerator.generateModalityContent(
          analysis.topic,
          modality,
          this.complexityToNumber(analysis.complexity)
        )
        
        clearTimeout(timer)
        
        const content: GeneratedContent = {
          id: this.generateContentId(),
          queryId: query.id,
          modality,
          data: smartContent,
          metadata: {
            title: `Understanding ${analysis.topic}`,
            description: `${modality} explanation of ${analysis.topic}`,
            estimatedDuration: this.estimateDuration(modality),
            difficulty: this.complexityToNumber(analysis.complexity),
            tags: analysis.keywords
          }
        }
        
        resolve(content)
        
      } catch (error) {
        clearTimeout(timer)
        reject(error)
      }
    })
  }

  private getFallbackChain(primaryModality: ContentModality, userId?: string): ContentModality[] {
    if (userId) {
      const predictor = this.getBayesianPredictor(userId)
      const recommendations = predictor.getRankedModalityRecommendations('fallback', {
        topic: 'fallback',
        complexity: 'intermediate',
        keywords: [],
        suggestedModality: primaryModality,
        prerequisites: []
      })
      
      // Use top 4 recommendations as fallback chain
      return recommendations.slice(0, 4).map(r => r.recommendedModality)
    }
    
    // Default fallback chains
    const fallbackChains: Record<ContentModality, ContentModality[]> = {
      'animation': ['animation', 'simulation', 'diagram', 'text'],
      'simulation': ['simulation', 'animation', '3d', 'diagram'],
      '3d': ['3d', 'animation', 'simulation', 'diagram'],
      'concept-map': ['concept-map', 'diagram', 'animation', 'text'],
      'diagram': ['diagram', 'animation', 'text'],
      'interactive': ['simulation', 'animation', '3d', 'diagram'],
      'text': ['text', 'diagram']
    }
    
    return fallbackChains[primaryModality] || ['animation', 'text']
  }

  private fallbackToAnalysis(analysis: ConceptAnalysis): ContentModality {
    // Simple analysis-based selection when no user data available
    const topic = analysis.topic.toLowerCase()
    
    if (topic.includes('network') || topic.includes('system')) return 'concept-map'
    if (topic.includes('structure') || topic.includes('dna')) return '3d'
    if (topic.includes('process') || topic.includes('cycle')) return 'animation'
    if (topic.includes('gravity') || topic.includes('simulation')) return 'simulation'
    
    return 'animation' // Default
  }

  private triggerConfusionDetection(userId: string, contentId: string): void {
    console.log('🤔 Confusion detected for user:', userId, 'content:', contentId)
    
    // This would typically trigger UI notification to suggest alternative modality
    // For now, we just log it
    console.log('💡 System suggests trying a different learning modality')
    
    // Could emit event for UI to handle
    // this.emit('confusion-detected', { userId, contentId })
  }

  private recordAdaptationEvent(event: AdaptationEvent): void {
    this.adaptationEvents.push(event)
    console.log('📝 Recorded adaptation event:', event.trigger, event.fromModality, '→', event.toModality)
  }

  private complexityToNumber(complexity: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (complexity) {
      case 'beginner': return 3
      case 'intermediate': return 6
      case 'advanced': return 9
      default: return 5
    }
  }

  private estimateDuration(modality: ContentModality): number {
    const durations: Record<ContentModality, number> = {
      'animation': 45,
      'simulation': 120,
      '3d': 90,
      'concept-map': 180,
      'diagram': 30,
      'interactive': 90,
      'text': 15
    }
    
    return durations[modality] || 60
  }

  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}