import { 
  UserProgress, 
  UserInteraction, 
  LearningPattern, 
  BayesianBeliefs,
  ContentModality,
  AdaptationEvent
} from '@/core/types'

export class UserModel {
  private userId: string
  private interactions: UserInteraction[] = []
  private progress: UserProgress
  private beliefs: BayesianBeliefs
  private lastUpdated: Date = new Date()

  constructor(userId: string) {
    this.userId = userId
    this.progress = this.initializeProgress()
    this.beliefs = this.initializeBayesianBeliefs()
  }

  /**
   * Record a user interaction and update the model
   */
  recordInteraction(interaction: UserInteraction): void {
    console.log('📊 Recording interaction:', interaction.action.type, 'for concept:', interaction.contentId)
    
    this.interactions.push(interaction)
    this.updateProgress(interaction)
    this.updateBayesianBeliefs(interaction)
    this.lastUpdated = new Date()
  }

  /**
   * Get success rate for a specific modality
   */
  getModalitySuccessRate(modality: ContentModality): number {
    const modalityInteractions = this.interactions.filter(i => i.modality === modality)
    if (modalityInteractions.length === 0) return 0.5 // Neutral prior
    
    const successful = modalityInteractions.filter(i => i.understood).length
    return successful / modalityInteractions.length
  }

  /**
   * Get average time to understand for a modality
   */
  getAverageTimeToUnderstand(modality: ContentModality): number {
    const successfulInteractions = this.interactions.filter(
      i => i.modality === modality && i.understood
    )
    
    if (successfulInteractions.length === 0) return 60 // Default 60 seconds
    
    const totalTime = successfulInteractions.reduce((sum, i) => sum + i.timeSpent, 0)
    return totalTime / successfulInteractions.length
  }

  /**
   * Count how many modality switches were needed for concepts
   */
  getAverageModalitySwitches(): number {
    // Group interactions by concept (contentId prefix before timestamp)
    const conceptGroups = new Map<string, UserInteraction[]>()
    
    this.interactions.forEach(interaction => {
      // Extract concept identifier from contentId (assuming format: concept_timestamp_random)
      const conceptKey = interaction.contentId.split('_')[0] || interaction.contentId
      if (!conceptGroups.has(conceptKey)) {
        conceptGroups.set(conceptKey, [])
      }
      conceptGroups.get(conceptKey)!.push(interaction)
    })

    let totalSwitches = 0
    let conceptsWithSwitches = 0

    conceptGroups.forEach(interactions => {
      // Count unique modalities used for this concept
      const uniqueModalities = new Set(interactions.map(i => i.modality))
      if (uniqueModalities.size > 1) {
        totalSwitches += uniqueModalities.size - 1
        conceptsWithSwitches++
      }
    })

    return conceptsWithSwitches > 0 ? totalSwitches / conceptsWithSwitches : 0
  }

  /**
   * Get concept difficulty ratings based on time spent and switches
   */
  getConceptDifficultyRating(concept: string): number {
    const conceptInteractions = this.interactions.filter(i => 
      i.contentId.includes(concept.toLowerCase().replace(/\s+/g, '_'))
    )
    
    if (conceptInteractions.length === 0) return 5 // Neutral difficulty
    
    const avgTimeSpent = conceptInteractions.reduce((sum, i) => sum + i.timeSpent, 0) / conceptInteractions.length
    const hadToSwitch = conceptInteractions.some(i => i.switchedModality)
    const finallyUnderstood = conceptInteractions.some(i => i.understood)
    
    // Calculate difficulty: more time + switches = higher difficulty
    let difficulty = Math.min(Math.max(avgTimeSpent / 30, 1), 10) // Base on 30s = 1 difficulty point
    if (hadToSwitch) difficulty += 2
    if (!finallyUnderstood) difficulty += 3
    
    return Math.min(difficulty, 10)
  }

  /**
   * Get current learning patterns and insights
   */
  getLearningPatterns(): LearningPattern {
    const patterns: any[] = []
    const recommendations: any[] = []

    // Pattern 1: Modality preferences
    const modalityPrefs = this.analyzeModalityPreferences()
    if (modalityPrefs.confidence > 0.7) {
      patterns.push({
        pattern: `Prefers ${modalityPrefs.preferred} modality`,
        confidence: modalityPrefs.confidence,
        examples: modalityPrefs.examples,
        recommendation: `Continue using ${modalityPrefs.preferred} as primary modality`
      })
    }

    // Pattern 2: Complexity preferences
    const complexityPref = this.analyzeComplexityPreference()
    patterns.push({
      pattern: `Works best with complexity level ${complexityPref.level}`,
      confidence: complexityPref.confidence,
      examples: complexityPref.examples,
      recommendation: `Start with complexity ${complexityPref.level} and adapt based on performance`
    })

    // Pattern 3: Learning speed
    const speedPattern = this.analyzeSpeed()
    patterns.push({
      pattern: `${speedPattern.speed} learner`,
      confidence: speedPattern.confidence,
      examples: [`Average time per concept: ${speedPattern.avgTime}s`],
      recommendation: speedPattern.recommendation
    })

    return {
      userId: this.userId,
      patterns,
      recommendations,
      lastAnalyzed: new Date()
    }
  }

  /**
   * Get recommended modality for a new concept
   */
  getRecommendedModality(concept: string): { modality: ContentModality; confidence: number; reasoning: string } {
    // Get Bayesian probability for each modality
    const modalityScores = Object.entries(this.beliefs.modalityPreferences)
      .map(([modality, preference]) => ({
        modality: modality as ContentModality,
        score: preference,
        successRate: this.getModalitySuccessRate(modality as ContentModality),
        avgTime: this.getAverageTimeToUnderstand(modality as ContentModality)
      }))
      .sort((a, b) => b.score - a.score)

    const best = modalityScores[0]
    
    return {
      modality: best.modality,
      confidence: best.score,
      reasoning: `Based on ${(best.successRate * 100).toFixed(0)}% success rate and ${best.avgTime.toFixed(0)}s average time to understand`
    }
  }

  /**
   * Get current user progress
   */
  getCurrentProgress(): UserProgress {
    return { ...this.progress }
  }

  /**
   * Get Bayesian beliefs
   */
  getBayesianBeliefs(): BayesianBeliefs {
    return { ...this.beliefs }
  }

  private initializeProgress(): UserProgress {
    return {
      userId: this.userId,
      sessionsCompleted: 0,
      conceptsLearned: [],
      averageComprehension: 0,
      preferredModality: 'animation',
      learningSpeed: 'normal',
      modalitySuccessRates: {
        'animation': 0.5,
        'simulation': 0.5,
        '3d': 0.5,
        'concept-map': 0.5,
        'diagram': 0.5,
        'interactive': 0.5,
        'text': 0.5
      },
      averageTimeToUnderstand: {
        'animation': 45,
        'simulation': 120,
        '3d': 90,
        'concept-map': 180,
        'diagram': 30,
        'interactive': 90,
        'text': 15
      },
      complexityPreference: 5,
      lastUpdated: new Date()
    }
  }

  private initializeBayesianBeliefs(): BayesianBeliefs {
    return {
      modalityPreferences: {
        'animation': 0.2,
        'simulation': 0.15,
        '3d': 0.15,
        'concept-map': 0.1,
        'diagram': 0.15,
        'interactive': 0.15,
        'text': 0.1
      },
      complexityPreference: 5,
      conceptualStrengths: {},
      learningSpeed: 1.0,
      lastUpdated: new Date()
    }
  }

  private updateProgress(interaction: UserInteraction): void {
    // Update modality success rates
    const modality = interaction.modality
    const currentRate = this.progress.modalitySuccessRates[modality]
    const currentCount = this.interactions.filter(i => i.modality === modality).length
    
    // Moving average update
    const newRate = ((currentRate * (currentCount - 1)) + (interaction.understood ? 1 : 0)) / currentCount
    this.progress.modalitySuccessRates[modality] = newRate

    // Update time to understand
    if (interaction.understood) {
      const currentTime = this.progress.averageTimeToUnderstand[modality]
      const successfulCount = this.interactions.filter(i => i.modality === modality && i.understood).length
      const newTime = ((currentTime * (successfulCount - 1)) + interaction.timeSpent) / successfulCount
      this.progress.averageTimeToUnderstand[modality] = newTime
    }

    // Update preferred modality
    const bestModality = Object.entries(this.progress.modalitySuccessRates)
      .sort(([,a], [,b]) => b - a)[0][0] as ContentModality
    this.progress.preferredModality = bestModality

    // Update learning speed
    const avgTime = Object.values(this.progress.averageTimeToUnderstand)
      .reduce((sum, time) => sum + time, 0) / 7
    
    if (avgTime < 45) this.progress.learningSpeed = 'fast'
    else if (avgTime > 90) this.progress.learningSpeed = 'slow'
    else this.progress.learningSpeed = 'normal'

    this.progress.lastUpdated = new Date()
  }

  private updateBayesianBeliefs(interaction: UserInteraction): void {
    const modality = interaction.modality
    const understood = interaction.understood
    
    // Update modality preferences using Bayesian updating
    const currentBelief = this.beliefs.modalityPreferences[modality]
    const learningRate = 0.1 // How quickly beliefs update
    
    if (understood) {
      // Positive evidence increases belief
      this.beliefs.modalityPreferences[modality] = Math.min(
        currentBelief + learningRate * (1 - currentBelief), 
        1.0
      )
    } else {
      // Negative evidence decreases belief
      this.beliefs.modalityPreferences[modality] = Math.max(
        currentBelief - learningRate * currentBelief,
        0.01
      )
    }

    // Normalize preferences to sum to 1
    const total = Object.values(this.beliefs.modalityPreferences).reduce((sum, val) => sum + val, 0)
    Object.keys(this.beliefs.modalityPreferences).forEach(key => {
      this.beliefs.modalityPreferences[key as ContentModality] /= total
    })

    // Update complexity preference based on performance
    if (understood && interaction.timeSpent < 60) {
      // Quick understanding suggests we could increase complexity
      this.beliefs.complexityPreference = Math.min(this.beliefs.complexityPreference + 0.1, 10)
    } else if (!understood || interaction.switchedModality) {
      // Difficulty suggests we should decrease complexity
      this.beliefs.complexityPreference = Math.max(this.beliefs.complexityPreference - 0.1, 1)
    }

    this.beliefs.lastUpdated = new Date()
  }

  private analyzeModalityPreferences(): { preferred: ContentModality; confidence: number; examples: string[] } {
    const modalityStats = Object.entries(this.progress.modalitySuccessRates)
      .map(([modality, rate]) => ({
        modality: modality as ContentModality,
        rate,
        count: this.interactions.filter(i => i.modality === modality).length
      }))
      .filter(stat => stat.count >= 2) // Need at least 2 interactions
      .sort((a, b) => b.rate - a.rate)

    if (modalityStats.length === 0) {
      return { preferred: 'animation', confidence: 0, examples: [] }
    }

    const best = modalityStats[0]
    const examples = [`Success rate: ${(best.rate * 100).toFixed(0)}%`, `Used ${best.count} times`]

    return {
      preferred: best.modality,
      confidence: best.rate,
      examples
    }
  }

  private analyzeComplexityPreference(): { level: number; confidence: number; examples: string[] } {
    const avgTime = this.interactions.length > 0 
      ? this.interactions.reduce((sum, i) => sum + i.timeSpent, 0) / this.interactions.length
      : 60

    const preferredLevel = Math.max(1, Math.min(10, this.beliefs.complexityPreference))
    
    return {
      level: Math.round(preferredLevel),
      confidence: 0.8,
      examples: [`Average time per concept: ${avgTime.toFixed(0)}s`]
    }
  }

  private analyzeSpeed(): { speed: string; confidence: number; avgTime: number; recommendation: string } {
    const avgTime = this.interactions.length > 0 
      ? this.interactions.reduce((sum, i) => sum + i.timeSpent, 0) / this.interactions.length
      : 60

    let speed: string
    let recommendation: string

    if (avgTime < 45) {
      speed = 'fast'
      recommendation = 'Can handle more complex concepts and faster pacing'
    } else if (avgTime > 90) {
      speed = 'slow'
      recommendation = 'Benefit from more detailed explanations and practice time'
    } else {
      speed = 'normal'
      recommendation = 'Current pacing works well, continue with balanced approach'
    }

    return {
      speed,
      confidence: 0.8,
      avgTime,
      recommendation
    }
  }
}