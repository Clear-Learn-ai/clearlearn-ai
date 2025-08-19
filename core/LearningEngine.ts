import { 
  LearningQuery, 
  ConceptAnalysis, 
  GeneratedContent, 
  ContentModality,
  UserProgress,
  SessionMetrics,
  FeedbackData 
} from './types'
import { AdaptiveEngine } from '@/intelligence/AdaptiveEngine'
import { globalRequestQueue } from '@/intelligence/RequestQueueEngine'

export class LearningEngine {
  private sessionId: string
  private startTime: Date
  private queriesProcessed: number = 0
  private feedbackReceived: FeedbackData[] = []
  private adaptiveEngine: AdaptiveEngine

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = new Date()
    this.adaptiveEngine = new AdaptiveEngine()
  }

  /**
   * Core method to process a learning query with performance optimization
   * Orchestrates the entire learning pipeline with adaptive intelligence and request queuing
   */
  async processQuery(queryText: string, userId?: string): Promise<GeneratedContent> {
    console.log('🚀 Processing query with performance optimization:', queryText)
    
    // Queue the request for optimal performance
    return globalRequestQueue.enqueue({
      concept: queryText,
      userId,
      priority: userId ? 7 : 5, // Higher priority for logged-in users
      estimatedDuration: 2000,
      processor: async () => {
        try {
          // 1. Create query object
          const query = this.createQuery(queryText, userId)
          
          // 2. Parse and analyze the concept
          const analysis = await this.parseConceptFromQuery(query)
          
          // 3. Use adaptive engine for intelligent content generation
          const content = await this.adaptiveEngine.generateAdaptiveContent(query, analysis, userId)
          
          // 4. Start adaptive session if user ID provided
          if (userId) {
            this.adaptiveEngine.startAdaptiveSession(userId, content.id)
          }
          
          // 5. Track session metrics
          this.updateSessionMetrics(query, analysis)
          
          console.log('✅ Generated adaptive content:', content.modality)
          return content
        } catch (error) {
          console.error('Error processing query:', error)
          
          // Fallback to original generation method
          console.log('🔄 Falling back to original generation method')
          return this.processQueryFallback(queryText, userId)
        }
      }
    })
  }

  /**
   * Fallback method using original generation logic
   */
  private async processQueryFallback(queryText: string, userId?: string): Promise<GeneratedContent> {
    try {
      const query = this.createQuery(queryText, userId)
      const analysis = await this.parseConceptFromQuery(query)
      const modality = this.selectModalityForConcept(analysis)
      const content = await this.generateContent(query, analysis, modality)
      this.updateSessionMetrics(query, analysis)
      return content
    } catch (error) {
      console.error('Fallback generation failed:', error)
      throw new Error('Failed to process learning query')
    }
  }

  /**
   * Parses natural language query to extract learning concepts
   */
  private async parseConceptFromQuery(query: LearningQuery): Promise<ConceptAnalysis> {
    const text = query.text.toLowerCase()
    
    // Simple concept extraction (in production, would use NLP/LLM)
    const keywords = this.extractKeywords(text)
    const topic = this.extractMainTopic(text)
    const complexity = this.assessComplexity(text, keywords)
    const prerequisites = this.identifyPrerequisites(topic, keywords)
    
    return {
      topic,
      complexity,
      keywords,
      suggestedModality: this.suggestModalityFromKeywords(keywords),
      prerequisites
    }
  }

  /**
   * Selects the best modality for presenting the concept with intelligent routing
   */
  private selectModalityForConcept(analysis: ConceptAnalysis): ContentModality {
    const { topic, complexity, keywords } = analysis
    const topicLower = topic.toLowerCase()
    
    console.log('🎯 Selecting modality for:', topicLower, 'Keywords:', keywords)
    
    // Rule 1: Complex systems and networks → concept maps
    if (this.isSystemConcept(keywords) || 
        topicLower.includes('network') || 
        topicLower.includes('system') ||
        topicLower.includes('internet') ||
        topicLower.includes('democracy') ||
        topicLower.includes('economy') ||
        topicLower.includes('neural')) {
      console.log('✅ Selected: concept-map')
      return 'concept-map'
    }
    
    // Rule 2: 3D structures and anatomy → 3D models
    if (this.isStructuralConcept(keywords) || 
        topicLower.includes('dna') ||
        topicLower.includes('molecule') ||
        topicLower.includes('atom') ||
        topicLower.includes('cell') ||
        topicLower.includes('organ') ||
        topicLower.includes('anatomy') ||
        topicLower.includes('structure')) {
      console.log('✅ Selected: 3d')
      return '3d'
    }
    
    // Rule 3: Interactive phenomena and simulations → simulations
    if (this.isInteractiveConcept(keywords) ||
        topicLower.includes('gravity') ||
        topicLower.includes('ecosystem') ||
        topicLower.includes('population') ||
        topicLower.includes('economy') ||
        topicLower.includes('climate') ||
        topicLower.includes('cycle') ||
        (complexity === 'advanced' && this.hasVariableConcepts(keywords))) {
      console.log('✅ Selected: simulation')
      return 'simulation'
    }
    
    // Rule 4: Process-based concepts → animations
    if (this.isProcessConcept(keywords)) {
      console.log('✅ Selected: animation')
      return 'animation'
    }
    
    // Rule 5: Static information → diagrams
    if (this.isInformationalConcept(keywords)) {
      console.log('✅ Selected: diagram')
      return 'diagram'
    }
    
    // Default fallback: animation for engaging visualization
    console.log('✅ Selected: animation (default)')
    return 'animation'
  }

  /**
   * Generates content using the appropriate generator with fallback chain
   */
  private async generateContent(
    query: LearningQuery, 
    analysis: ConceptAnalysis, 
    modality: ContentModality
  ): Promise<GeneratedContent> {
    const contentId = this.generateContentId()
    const fallbackChain = this.getFallbackChain(modality)
    
    for (const currentModality of fallbackChain) {
      try {
        const data = await this.generateContentForModality(analysis, currentModality)
        
        return {
          id: contentId,
          queryId: query.id,
          modality: currentModality,
          data,
          metadata: {
            title: this.generateTitle(analysis.topic),
            description: this.generateDescription(analysis.topic, currentModality),
            estimatedDuration: this.estimateDuration(currentModality),
            difficulty: this.complexityToNumber(analysis.complexity),
            tags: analysis.keywords
          }
        }
      } catch (error) {
        console.warn(`Failed to generate ${currentModality} content:`, error)
        // Continue to next fallback
      }
    }
    
    throw new Error(`Failed to generate content for ${modality} and all fallbacks`)
  }
  
  /**
   * Defines fallback chain for each modality
   */
  private getFallbackChain(primaryModality: ContentModality): ContentModality[] {
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
  
  /**
   * Generates content for a specific modality
   */
  private async generateContentForModality(
    analysis: ConceptAnalysis, 
    modality: ContentModality
  ): Promise<any> {
    console.log('🎨 Generating content for modality:', modality, 'Topic:', analysis.topic)
    
    switch (modality) {
      case 'animation':
        const { AnimatedDiagramGenerator } = await import('@/generators/AnimatedDiagramGenerator')
        const animationGenerator = new AnimatedDiagramGenerator()
        return await animationGenerator.generate(analysis)
      
      case 'simulation':
        const { InteractiveSimulationGenerator } = await import('@/generators/InteractiveSimulationGenerator')
        const simulationGenerator = new InteractiveSimulationGenerator()
        return await simulationGenerator.generate(analysis)
      
      case '3d':
        const { Model3DGenerator } = await import('@/generators/Model3DGenerator')
        const model3DGenerator = new Model3DGenerator()
        return await model3DGenerator.generate(analysis)
      
      case 'concept-map':
        const { ConceptMapGenerator } = await import('@/generators/ConceptMapGenerator')
        const conceptMapGenerator = new ConceptMapGenerator()
        return await conceptMapGenerator.generate(analysis)
      
      case 'diagram':
        // Simple diagram fallback (could be enhanced later)
        return {
          type: 'diagram',
          nodes: [
            {
              id: 'main',
              label: analysis.topic,
              position: { x: 400, y: 200 },
              style: { shape: 'rectangle', color: '#3b82f6', size: { width: 120, height: 60 } }
            }
          ],
          connections: []
        }
      
      case 'text':
        // Simple text fallback
        return {
          type: 'text',
          content: `${analysis.topic}: ${analysis.keywords.join(', ')}`,
          formatting: { highlights: [], structure: 'paragraph' }
        }
      
      default:
        throw new Error(`Unsupported modality: ${modality}`)
    }
  }

  /**
   * Records user feedback for content improvement and adaptive learning
   */
  recordFeedback(feedback: FeedbackData, userId?: string, modality?: ContentModality): void {
    this.feedbackReceived.push(feedback)
    
    // Record interaction in adaptive engine if user ID available
    if (userId && modality) {
      const interaction = {
        userId,
        sessionId: this.sessionId,
        contentId: feedback.contentId,
        timestamp: feedback.timestamp,
        action: {
          type: 'feedback' as const,
          value: feedback.rating
        },
        timeSpent: 60, // Default time, would be tracked more accurately in production
        modality,
        understood: feedback.understood,
        switchedModality: false,
        depth: 1
      }
      
      this.adaptiveEngine.recordUserInteraction(interaction)
      
      // Stop adaptive session if user understood
      if (feedback.understood) {
        this.adaptiveEngine.stopAdaptiveSession(userId, feedback.contentId)
      }
    }
    
    console.log('💬 Feedback recorded:', feedback.understood ? '👍' : '👎', feedback.rating)
  }

  /**
   * Get user analytics from adaptive engine
   */
  getUserAnalytics(userId: string): any {
    return this.adaptiveEngine.getUserAnalytics(userId)
  }

  /**
   * Suggest alternative modality when user is struggling
   */
  async suggestAlternativeModality(
    userId: string,
    currentModality: ContentModality,
    concept: string
  ): Promise<{ modality: ContentModality; reasoning: string }> {
    // Create a simple concept analysis for the suggestion
    const conceptAnalysis = {
      topic: concept,
      complexity: 'intermediate' as const,
      keywords: concept.split(' '),
      suggestedModality: currentModality,
      prerequisites: []
    }
    
    return this.adaptiveEngine.suggestAlternativeModality(
      userId, 
      currentModality, 
      concept, 
      conceptAnalysis
    )
  }

  /**
   * Generate content with progressive depth (ELI5 → Advanced)
   */
  async generateProgressiveContent(
    concept: string,
    modality: ContentModality,
    depth: number = 0,
    userId?: string
  ): Promise<GeneratedContent> {
    console.log(`📚 Generating progressive content: ${concept} at depth ${depth}`)
    return this.adaptiveEngine.generateProgressiveContent(concept, modality, depth, userId)
  }

  /**
   * Get ELI5 (Explain Like I'm 5) explanation
   */
  async getELI5Explanation(concept: string, modality: ContentModality = 'animation'): Promise<GeneratedContent> {
    console.log('👶 Getting ELI5 explanation for:', concept)
    return this.adaptiveEngine.getELI5Explanation(concept, modality)
  }

  /**
   * Get advanced explanation
   */
  async getAdvancedExplanation(concept: string, modality: ContentModality): Promise<GeneratedContent> {
    console.log('🎓 Getting advanced explanation for:', concept)
    return this.adaptiveEngine.getAdvancedExplanation(concept, modality)
  }

  /**
   * Progress to deeper understanding level
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
    console.log('🔽 Progressing to deeper level for:', concept)
    return this.adaptiveEngine.progressDeeper(concept, modality, userId, userPerformance)
  }

  /**
   * Go to simpler explanation
   */
  async goSimpler(
    concept: string,
    modality: ContentModality,
    userId?: string
  ): Promise<GeneratedContent | null> {
    console.log('🔼 Going to simpler level for:', concept)
    return this.adaptiveEngine.goSimpler(concept, modality, userId)
  }

  /**
   * Get depth progression information for a concept
   */
  getDepthProgression(concept: string): any {
    return this.adaptiveEngine.getDepthProgression(concept)
  }

  /**
   * Get performance statistics including queue status
   */
  getPerformanceStats(): any {
    return {
      queue: globalRequestQueue.getStats(),
      queueStatus: globalRequestQueue.getQueueStatus(),
      session: this.getSessionMetrics()
    }
  }

  /**
   * Set priority for user requests (VIP users, etc.)
   */
  setUserPriority(userId: string, priority: number): void {
    globalRequestQueue.setPriorityForUser(userId, priority)
  }

  /**
   * Gets current session metrics
   */
  getSessionMetrics(): SessionMetrics {
    const conceptsCovered = this.feedbackReceived
      .map(f => f.contentId)
      .filter((value, index, self) => self.indexOf(value) === index)
    
    const averageRating = this.feedbackReceived.length > 0
      ? this.feedbackReceived.reduce((sum, f) => sum + f.rating, 0) / this.feedbackReceived.length
      : 0

    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: undefined,
      queriesCount: this.queriesProcessed,
      feedbackProvided: this.feedbackReceived.length,
      averageRating,
      conceptsCovered
    }
  }

  // Private helper methods
  private createQuery(text: string, userId?: string): LearningQuery {
    return {
      id: this.generateQueryId(),
      text,
      timestamp: new Date(),
      userId
    }
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, would use NLP)
    const commonWords = ['how', 'what', 'why', 'when', 'where', 'is', 'are', 'does', 'do', 'the', 'a', 'an']
    return text
      .split(/\\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word.toLowerCase()))
      .slice(0, 10)
  }

  private extractMainTopic(text: string): string {
    // Simple topic extraction
    const topicPatterns = [
      /how (?:does|do) ([^?]+) work/i,
      /what is ([^?]+)/i,
      /explain ([^?]+)/i,
      /understand ([^?]+)/i
    ]
    
    for (const pattern of topicPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return text.split(' ').slice(0, 3).join(' ')
  }

  private assessComplexity(text: string, keywords: string[]): 'beginner' | 'intermediate' | 'advanced' {
    const complexIndicators = ['molecular', 'quantum', 'advanced', 'detailed', 'comprehensive']
    const hasComplexTerms = keywords.some(keyword => 
      complexIndicators.some(indicator => keyword.includes(indicator))
    )
    
    if (hasComplexTerms) return 'advanced'
    if (keywords.length > 5) return 'intermediate'
    return 'beginner'
  }

  private identifyPrerequisites(topic: string, keywords: string[]): string[] {
    // Simple prerequisite mapping (in production, would use knowledge graph)
    const prerequisiteMap: Record<string, string[]> = {
      'photosynthesis': ['basic chemistry', 'plant biology'],
      'cellular respiration': ['cell structure', 'basic chemistry'],
      'dna replication': ['molecular biology', 'genetics'],
    }
    
    return prerequisiteMap[topic.toLowerCase()] || []
  }

  private suggestModalityFromKeywords(keywords: string[]): ContentModality {
    const animationKeywords = ['process', 'flow', 'steps', 'cycle', 'reaction']
    const diagramKeywords = ['structure', 'anatomy', 'system', 'organization']
    
    if (keywords.some(k => animationKeywords.some(ak => k.includes(ak)))) {
      return 'animation'
    }
    
    if (keywords.some(k => diagramKeywords.some(dk => k.includes(dk)))) {
      return 'diagram'
    }
    
    return 'animation'
  }

  private isProcessConcept(keywords: string[]): boolean {
    const processWords = ['process', 'flow', 'steps', 'cycle', 'reaction', 'synthesis', 'breakdown']
    return keywords.some(keyword => 
      processWords.some(process => keyword.includes(process))
    )
  }

  private isStructuralConcept(keywords: string[]): boolean {
    const structureWords = ['structure', 'anatomy', 'system', 'organization', 'layout', 'diagram', 'molecule', 'atom', 'cell', 'organ']
    return keywords.some(keyword => 
      structureWords.some(structure => keyword.includes(structure))
    )
  }
  
  private isSystemConcept(keywords: string[]): boolean {
    const systemWords = ['system', 'network', 'connection', 'relationship', 'hierarchy', 'organization', 'framework']
    return keywords.some(keyword => 
      systemWords.some(system => keyword.includes(system))
    )
  }
  
  private isInteractiveConcept(keywords: string[]): boolean {
    const interactiveWords = ['interaction', 'variable', 'parameter', 'control', 'adjust', 'manipulate', 'change', 'effect']
    return keywords.some(keyword => 
      interactiveWords.some(interactive => keyword.includes(interactive))
    )
  }
  
  private hasVariableConcepts(keywords: string[]): boolean {
    const variableWords = ['rate', 'speed', 'level', 'amount', 'quantity', 'force', 'pressure', 'temperature']
    return keywords.some(keyword => 
      variableWords.some(variable => keyword.includes(variable))
    )
  }
  
  private isInformationalConcept(keywords: string[]): boolean {
    const infoWords = ['definition', 'explanation', 'description', 'overview', 'summary', 'list', 'facts']
    return keywords.some(keyword => 
      infoWords.some(info => keyword.includes(info))
    )
  }

  private updateSessionMetrics(query: LearningQuery, analysis: ConceptAnalysis): void {
    this.queriesProcessed++
  }

  private generateTitle(topic: string): string {
    return `Understanding ${topic.charAt(0).toUpperCase() + topic.slice(1)}`
  }
  
  private generateDescription(topic: string, modality: ContentModality): string {
    const modalityDescriptions: Record<ContentModality, string> = {
      'animation': 'Animated step-by-step explanation',
      'simulation': 'Interactive simulation you can manipulate',
      '3d': 'Explorable 3D model',
      'concept-map': 'Interactive knowledge graph',
      'diagram': 'Visual diagram',
      'interactive': 'Interactive learning experience',
      'text': 'Text-based explanation'
    }
    
    return `${modalityDescriptions[modality] || 'Visual explanation'} of ${topic}`
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

  private complexityToNumber(complexity: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (complexity) {
      case 'beginner': return 3
      case 'intermediate': return 6
      case 'advanced': return 9
      default: return 5
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}