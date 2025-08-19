import { 
  ContentModality, 
  ModalityRecommendation, 
  BayesianBeliefs,
  UserInteraction,
  ConceptAnalysis
} from '@/core/types'
import { UserModel } from './UserModel'

export class BayesianPredictor {
  private userModel: UserModel
  private priors: Record<ContentModality, number>
  private conceptTypeWeights: Record<string, Record<ContentModality, number>>

  constructor(userModel: UserModel) {
    this.userModel = userModel
    this.priors = this.initializePriors()
    this.conceptTypeWeights = this.initializeConceptTypeWeights()
  }

  /**
   * Predict the best modality for a new concept using Bayesian inference
   */
  predictBestModality(
    concept: string, 
    conceptAnalysis: ConceptAnalysis,
    userContext?: any
  ): ModalityRecommendation {
    console.log('🧠 Bayesian prediction for concept:', concept)
    
    const beliefs = this.userModel.getBayesianBeliefs()
    const modalityProbabilities = this.calculateModalityProbabilities(
      concept,
      conceptAnalysis,
      beliefs,
      userContext
    )

    // Sort by probability
    const sortedModalities = Object.entries(modalityProbabilities)
      .sort(([,a], [,b]) => b - a)

    const bestModality = sortedModalities[0]
    const fallbacks = sortedModalities.slice(1, 4).map(([modality]) => modality as ContentModality)

    const recommendation: ModalityRecommendation = {
      concept,
      recommendedModality: bestModality[0] as ContentModality,
      confidence: bestModality[1],
      reasoning: this.generateReasoning(
        bestModality[0] as ContentModality,
        bestModality[1],
        conceptAnalysis,
        beliefs
      ),
      fallbacks
    }

    console.log(`🎯 Recommended: ${recommendation.recommendedModality} (${(recommendation.confidence * 100).toFixed(1)}%)`)
    console.log(`📝 Reasoning: ${recommendation.reasoning}`)

    return recommendation
  }

  /**
   * Update beliefs after observing user interaction
   */
  updateBeliefsAfterInteraction(interaction: UserInteraction): void {
    console.log('📊 Updating Bayesian beliefs after interaction')
    
    const modality = interaction.modality
    const success = interaction.understood
    const timeSpent = interaction.timeSpent

    // Update the user model (which contains Bayesian beliefs)
    this.userModel.recordInteraction(interaction)

    // Additional Bayesian updating based on performance metrics
    this.updateConceptTypeWeights(interaction)
    
    console.log(`✅ Beliefs updated: ${modality} performance = ${success ? 'positive' : 'negative'}`)
  }

  /**
   * Get confidence interval for a modality recommendation
   */
  getConfidenceInterval(modality: ContentModality): { lower: number; upper: number } {
    const successRate = this.userModel.getModalitySuccessRate(modality)
    const interactionCount = this.getModalityInteractionCount(modality)
    
    // Calculate confidence interval using Wilson score
    if (interactionCount === 0) {
      return { lower: 0.2, upper: 0.8 } // Wide interval for no data
    }

    const z = 1.96 // 95% confidence
    const n = interactionCount
    const p = successRate

    const center = p + (z * z) / (2 * n)
    const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)
    const denominator = 1 + (z * z) / n

    return {
      lower: Math.max(0, (center - margin) / denominator),
      upper: Math.min(1, (center + margin) / denominator)
    }
  }

  /**
   * Predict learning outcome for a given modality
   */
  predictLearningOutcome(
    concept: string,
    modality: ContentModality,
    complexityLevel: number
  ): {
    successProbability: number
    expectedTime: number
    confidenceLevel: 'high' | 'medium' | 'low'
  } {
    const beliefs = this.userModel.getBayesianBeliefs()
    const modalityPreference = beliefs.modalityPreferences[modality]
    const successRate = this.userModel.getModalitySuccessRate(modality)
    const avgTime = this.userModel.getAverageTimeToUnderstand(modality)
    
    // Adjust for complexity
    const complexityFactor = Math.max(0.1, 1 - Math.abs(complexityLevel - beliefs.complexityPreference) / 10)
    
    const successProbability = (modalityPreference * 0.4 + successRate * 0.6) * complexityFactor
    const expectedTime = avgTime * (1 + (complexityLevel - 5) / 10)

    const interactionCount = this.getModalityInteractionCount(modality)
    let confidenceLevel: 'high' | 'medium' | 'low'
    
    if (interactionCount >= 10) confidenceLevel = 'high'
    else if (interactionCount >= 3) confidenceLevel = 'medium'
    else confidenceLevel = 'low'

    return {
      successProbability,
      expectedTime,
      confidenceLevel
    }
  }

  /**
   * Get all modality recommendations ranked by probability
   */
  getRankedModalityRecommendations(
    concept: string,
    conceptAnalysis: ConceptAnalysis
  ): ModalityRecommendation[] {
    const beliefs = this.userModel.getBayesianBeliefs()
    const modalityProbabilities = this.calculateModalityProbabilities(
      concept,
      conceptAnalysis,
      beliefs
    )

    return Object.entries(modalityProbabilities)
      .sort(([,a], [,b]) => b - a)
      .map(([modality, probability]) => ({
        concept,
        recommendedModality: modality as ContentModality,
        confidence: probability,
        reasoning: this.generateReasoning(
          modality as ContentModality,
          probability,
          conceptAnalysis,
          beliefs
        ),
        fallbacks: []
      }))
  }

  private initializePriors(): Record<ContentModality, number> {
    // Based on general learning effectiveness research
    return {
      'animation': 0.25,      // Good for processes
      'simulation': 0.20,     // Great for interactive learning
      '3d': 0.15,            // Excellent for spatial concepts
      'concept-map': 0.15,   // Good for relationships
      'diagram': 0.15,       // Good for static information
      'interactive': 0.05,   // Depends on implementation
      'text': 0.05          // Baseline fallback
    }
  }

  private initializeConceptTypeWeights(): Record<string, Record<ContentModality, number>> {
    return {
      'process': {
        'animation': 0.4,
        'simulation': 0.3,
        '3d': 0.1,
        'concept-map': 0.1,
        'diagram': 0.05,
        'interactive': 0.03,
        'text': 0.02
      },
      'structure': {
        '3d': 0.4,
        'diagram': 0.25,
        'animation': 0.2,
        'concept-map': 0.1,
        'simulation': 0.03,
        'interactive': 0.01,
        'text': 0.01
      },
      'system': {
        'concept-map': 0.4,
        'simulation': 0.3,
        'diagram': 0.15,
        'animation': 0.1,
        '3d': 0.03,
        'interactive': 0.01,
        'text': 0.01
      },
      'relationship': {
        'concept-map': 0.45,
        'diagram': 0.25,
        'animation': 0.15,
        'simulation': 0.1,
        '3d': 0.03,
        'interactive': 0.01,
        'text': 0.01
      }
    }
  }

  private calculateModalityProbabilities(
    concept: string,
    conceptAnalysis: ConceptAnalysis,
    beliefs: BayesianBeliefs,
    userContext?: any
  ): Record<ContentModality, number> {
    const modalities: ContentModality[] = ['animation', 'simulation', '3d', 'concept-map', 'diagram', 'interactive', 'text']
    const probabilities: Record<ContentModality, number> = {} as any

    modalities.forEach(modality => {
      // Start with prior probability
      let probability = this.priors[modality]

      // Factor 1: User's historical preference (Bayesian belief)
      const userPreference = beliefs.modalityPreferences[modality]
      probability *= (1 + userPreference) // Weight by user preference

      // Factor 2: Concept type suitability
      const conceptType = this.inferConceptType(conceptAnalysis)
      const conceptWeight = this.conceptTypeWeights[conceptType]?.[modality] || 0.1
      probability *= (1 + conceptWeight)

      // Factor 3: Complexity match
      const complexityMatch = this.calculateComplexityMatch(
        conceptAnalysis.complexity,
        beliefs.complexityPreference,
        modality
      )
      probability *= complexityMatch

      // Factor 4: Success rate adjustment
      const successRate = this.userModel.getModalitySuccessRate(modality)
      const successWeight = 0.5 + successRate // 0.5 to 1.5 multiplier
      probability *= successWeight

      // Factor 5: Time efficiency (prefer faster modalities if user is fast learner)
      const timeEfficiency = this.calculateTimeEfficiency(modality, beliefs.learningSpeed)
      probability *= timeEfficiency

      probabilities[modality] = probability
    })

    // Normalize probabilities to sum to 1
    const total = Object.values(probabilities).reduce((sum, p) => sum + p, 0)
    modalities.forEach(modality => {
      probabilities[modality] /= total
    })

    return probabilities
  }

  private inferConceptType(analysis: ConceptAnalysis): string {
    const keywords = analysis.keywords.map(k => k.toLowerCase())
    const topic = analysis.topic.toLowerCase()

    // Check for process indicators
    if (keywords.some(k => ['process', 'flow', 'cycle', 'reaction', 'synthesis'].some(p => k.includes(p))) ||
        topic.includes('how') || topic.includes('work')) {
      return 'process'
    }

    // Check for structure indicators
    if (keywords.some(k => ['structure', 'anatomy', 'molecule', 'dna', 'cell', 'organ'].some(s => k.includes(s))) ||
        topic.includes('structure')) {
      return 'structure'
    }

    // Check for system indicators
    if (keywords.some(k => ['system', 'network', 'organization', 'framework'].some(s => k.includes(s))) ||
        topic.includes('system') || topic.includes('network')) {
      return 'system'
    }

    // Check for relationship indicators
    if (keywords.some(k => ['relationship', 'connection', 'cause', 'effect', 'correlation'].some(r => k.includes(r)))) {
      return 'relationship'
    }

    return 'process' // Default
  }

  private calculateComplexityMatch(
    conceptComplexity: 'beginner' | 'intermediate' | 'advanced',
    userPreference: number,
    modality: ContentModality
  ): number {
    const conceptLevel = conceptComplexity === 'beginner' ? 3 : 
                        conceptComplexity === 'intermediate' ? 6 : 9

    // Some modalities handle complexity better
    const modalityComplexityBonus: Record<ContentModality, number> = {
      'text': 0.9,           // Simple concepts
      'diagram': 0.95,       // Medium complexity
      'animation': 1.0,      // Good for all levels
      'simulation': 1.1,     // Better for complex
      '3d': 1.05,           // Good for spatial complexity
      'concept-map': 1.15,   // Excellent for complex relationships
      'interactive': 1.0     // Neutral
    }

    const levelDifference = Math.abs(conceptLevel - userPreference)
    const match = Math.max(0.3, 1 - levelDifference / 10) // Penalty for mismatch
    
    return match * modalityComplexityBonus[modality]
  }

  private calculateTimeEfficiency(modality: ContentModality, learningSpeed: number): number {
    // Base time expectations for each modality (in seconds)
    const baseTime: Record<ContentModality, number> = {
      'text': 15,
      'diagram': 30,
      'animation': 45,
      '3d': 90,
      'interactive': 90,
      'simulation': 120,
      'concept-map': 180
    }

    const modalityTime = baseTime[modality]
    
    // If user learns fast, prefer faster modalities
    // If user learns slow, don't penalize slower modalities as much
    if (learningSpeed > 1.2) { // Fast learner
      return Math.max(0.5, 2 - modalityTime / 60) // Prefer < 60s modalities
    } else if (learningSpeed < 0.8) { // Slow learner
      return Math.min(1.5, 0.5 + modalityTime / 120) // Prefer more detailed modalities
    }
    
    return 1.0 // Normal learner - no preference
  }

  private generateReasoning(
    modality: ContentModality,
    confidence: number,
    analysis: ConceptAnalysis,
    beliefs: BayesianBeliefs
  ): string {
    const successRate = this.userModel.getModalitySuccessRate(modality)
    const avgTime = this.userModel.getAverageTimeToUnderstand(modality)
    const userPreference = beliefs.modalityPreferences[modality]

    const reasons = []

    if (successRate > 0.7) {
      reasons.push(`High success rate (${(successRate * 100).toFixed(0)}%)`)
    }

    if (userPreference > 0.2) {
      reasons.push(`Strong user preference (${(userPreference * 100).toFixed(0)}%)`)
    }

    if (avgTime < 60) {
      reasons.push(`Quick understanding (avg ${avgTime.toFixed(0)}s)`)
    }

    if (analysis.complexity === 'advanced' && ['concept-map', 'simulation'].includes(modality)) {
      reasons.push('Handles complex concepts well')
    }

    if (analysis.complexity === 'beginner' && ['animation', 'diagram'].includes(modality)) {
      reasons.push('Good for introductory concepts')
    }

    if (reasons.length === 0) {
      reasons.push('Based on general effectiveness for this concept type')
    }

    return reasons.join(', ')
  }

  private getModalityInteractionCount(modality: ContentModality): number {
    // This would typically access the user model's interaction history
    // For now, we'll estimate based on success rate confidence
    const successRate = this.userModel.getModalitySuccessRate(modality)
    
    // If success rate is exactly 0.5, it's likely the default (no interactions)
    if (successRate === 0.5) return 0
    
    // Otherwise estimate based on how far from 0.5 the rate is
    const deviation = Math.abs(successRate - 0.5)
    return Math.floor(deviation * 20) + 1 // Rough estimation
  }

  private updateConceptTypeWeights(interaction: UserInteraction): void {
    // This could implement online learning to adjust concept type weights
    // based on user performance. For now, we keep them static.
    console.log('📈 Concept type weights could be updated based on interaction performance')
  }
}