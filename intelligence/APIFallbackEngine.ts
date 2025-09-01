import { SmartContentRequest, LLMGeneratedContent, ContentModality } from '@/core/types'

interface APIProvider {
  name: string
  enabled: boolean
  priority: number
  maxRetries: number
  timeout: number
  rateLimit: {
    requestsPerMinute: number
    currentCount: number
    resetTime: Date
  }
  generateContent(request: SmartContentRequest): Promise<LLMGeneratedContent>
}

interface FallbackStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  providerUsage: Record<string, number>
  averageResponseTime: number
  fallbackTriggered: number
}

interface APIError {
  provider: string
  error: string
  timestamp: Date
  request: SmartContentRequest
  retryAttempt: number
}

export class APIFallbackEngine {
  private providers: APIProvider[] = []
  private stats: FallbackStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    providerUsage: {},
    averageResponseTime: 0,
    fallbackTriggered: 0
  }
  private recentErrors: APIError[] = []
  private maxErrorHistory: number = 100

  constructor() {
    this.initializeProviders()
    console.log('🔄 API Fallback Engine initialized')
  }

  /**
   * Generate content with automatic fallback
   */
  async generateContentWithFallback(request: SmartContentRequest): Promise<LLMGeneratedContent> {
    this.stats.totalRequests++
    const startTime = Date.now()
    
    console.log('🚀 Starting content generation with fallback for:', request.concept)
    
    // Sort providers by priority and availability
    const availableProviders = this.getAvailableProviders()
    
    if (availableProviders.length === 0) {
      throw new Error('No API providers available')
    }
    
    let lastError: Error | null = null
    
    for (let i = 0; i < availableProviders.length; i++) {
      const provider = availableProviders[i]
      
      console.log(`🎯 Trying provider: ${provider.name} (priority ${provider.priority})`)
      
      try {
        // Check rate limit
        if (this.isRateLimited(provider)) {
          console.log(`⏰ Provider ${provider.name} is rate limited, trying next`)
          continue
        }
        
        const content = await this.generateWithProvider(provider, request)
        
        // Success!
        this.recordSuccess(provider, Date.now() - startTime)
        console.log(`✅ Content generated successfully with ${provider.name}`)
        
        return content
        
      } catch (error) {
        lastError = error as Error
        this.recordError(provider, error as Error, request)
        
        console.warn(`❌ Provider ${provider.name} failed:`, error instanceof Error ? error.message : 'Unknown error')
        
        // If this was the last provider, don't trigger fallback yet
        if (i < availableProviders.length - 1) {
          this.stats.fallbackTriggered++
          console.log('🔄 Falling back to next provider')
        }
      }
    }
    
    // All providers failed
    this.stats.failedRequests++
    console.error('💥 All API providers failed')
    
    // Try static fallback content
    const fallbackContent = this.generateStaticFallback(request)
    if (fallbackContent) {
      console.log('📝 Using static fallback content')
      return fallbackContent
    }
    
    throw new Error(`API generation failed: ${lastError?.message}`)
  }

  /**
   * Check provider health
   */
  checkProviderHealth(): Record<string, any> {
    const health: Record<string, any> = {}
    
    for (const provider of this.providers) {
      const recentErrors = this.recentErrors
        .filter(e => e.provider === provider.name)
        .filter(e => Date.now() - e.timestamp.getTime() < 5 * 60 * 1000) // Last 5 minutes
      
      health[provider.name] = {
        enabled: provider.enabled,
        priority: provider.priority,
        rateLimited: this.isRateLimited(provider),
        recentErrors: recentErrors.length,
        usage: this.stats.providerUsage[provider.name] || 0,
        status: this.getProviderStatus(provider, recentErrors.length)
      }
    }
    
    return health
  }

  /**
   * Get fallback statistics
   */
  getStats(): FallbackStats {
    return { ...this.stats }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): APIError[] {
    return this.recentErrors.slice(-count).reverse()
  }

  /**
   * Enable/disable a provider
   */
  setProviderEnabled(providerName: string, enabled: boolean): void {
    const provider = this.providers.find(p => p.name === providerName)
    if (provider) {
      provider.enabled = enabled
      console.log(`${enabled ? '✅' : '❌'} Provider ${providerName} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  /**
   * Update provider priority
   */
  setProviderPriority(providerName: string, priority: number): void {
    const provider = this.providers.find(p => p.name === providerName)
    if (provider) {
      provider.priority = priority
      console.log(`🔄 Provider ${providerName} priority set to ${priority}`)
    }
  }

  /**
   * Reset rate limits for all providers
   */
  resetRateLimits(): void {
    for (const provider of this.providers) {
      provider.rateLimit.currentCount = 0
      provider.rateLimit.resetTime = new Date(Date.now() + 60000) // Reset in 1 minute
    }
    console.log('🔄 Rate limits reset for all providers')
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.recentErrors = []
    console.log('🗑️ Error history cleared')
  }

  private initializeProviders(): void {
    // Mock OpenAI provider
    this.providers.push({
      name: 'OpenAI',
      enabled: true,
      priority: 1,
      maxRetries: 3,
      timeout: 30000,
      rateLimit: {
        requestsPerMinute: 60,
        currentCount: 0,
        resetTime: new Date(Date.now() + 60000)
      },
      generateContent: async (request: SmartContentRequest) => {
        // Simulate API call with occasional failures
        if (Math.random() < 0.1) { // 10% failure rate for testing
          throw new Error('OpenAI API rate limit exceeded')
        }
        
        await this.simulateDelay(1000, 3000) // 1-3 second delay
        
        return this.generateMockContent(request, 'OpenAI')
      }
    })

    // Mock Anthropic provider
    this.providers.push({
      name: 'Anthropic',
      enabled: true,
      priority: 2,
      maxRetries: 2,
      timeout: 25000,
      rateLimit: {
        requestsPerMinute: 50,
        currentCount: 0,
        resetTime: new Date(Date.now() + 60000)
      },
      generateContent: async (request: SmartContentRequest) => {
        // Simulate different failure patterns
        if (Math.random() < 0.05) { // 5% failure rate
          throw new Error('Anthropic API temporarily unavailable')
        }
        
        await this.simulateDelay(800, 2500)
        
        return this.generateMockContent(request, 'Anthropic')
      }
    })

    // Mock Local LLM provider (most reliable but lower quality)
    this.providers.push({
      name: 'LocalLLM',
      enabled: true,
      priority: 3,
      maxRetries: 1,
      timeout: 15000,
      rateLimit: {
        requestsPerMinute: 200,
        currentCount: 0,
        resetTime: new Date(Date.now() + 60000)
      },
      generateContent: async (request: SmartContentRequest) => {
        // Local LLM rarely fails
        if (Math.random() < 0.01) { // 1% failure rate
          throw new Error('Local LLM out of memory')
        }
        
        await this.simulateDelay(500, 1500)
        
        return this.generateMockContent(request, 'LocalLLM')
      }
    })

    console.log(`🔧 Initialized ${this.providers.length} API providers`)
  }

  private getAvailableProviders(): APIProvider[] {
    return this.providers
      .filter(p => p.enabled)
      .filter(p => !this.isProviderInCooldown(p))
      .sort((a, b) => a.priority - b.priority)
  }

  private isRateLimited(provider: APIProvider): boolean {
    const now = new Date()
    
    // Reset count if reset time has passed
    if (now >= provider.rateLimit.resetTime) {
      provider.rateLimit.currentCount = 0
      provider.rateLimit.resetTime = new Date(now.getTime() + 60000)
    }
    
    return provider.rateLimit.currentCount >= provider.rateLimit.requestsPerMinute
  }

  private isProviderInCooldown(provider: APIProvider): boolean {
    // Put provider in cooldown if too many recent errors
    const recentErrors = this.recentErrors
      .filter(e => e.provider === provider.name)
      .filter(e => Date.now() - e.timestamp.getTime() < 2 * 60 * 1000) // Last 2 minutes
    
    return recentErrors.length >= 5 // 5 errors in 2 minutes = cooldown
  }

  private async generateWithProvider(
    provider: APIProvider, 
    request: SmartContentRequest
  ): Promise<LLMGeneratedContent> {
    // Update rate limit
    provider.rateLimit.currentCount++
    
    // Generate content with timeout
    const content = await Promise.race([
      provider.generateContent(request),
      this.createTimeout(provider.timeout)
    ])
    
    return content
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    })
  }

  private recordSuccess(provider: APIProvider, responseTime: number): void {
    this.stats.successfulRequests++
    this.stats.providerUsage[provider.name] = (this.stats.providerUsage[provider.name] || 0) + 1
    
    // Update average response time
    const totalTime = this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + responseTime
    this.stats.averageResponseTime = totalTime / this.stats.successfulRequests
  }

  private recordError(provider: APIProvider, error: Error, request: SmartContentRequest): void {
    const apiError: APIError = {
      provider: provider.name,
      error: error.message,
      timestamp: new Date(),
      request,
      retryAttempt: 0 // Would track retry attempts in full implementation
    }
    
    this.recentErrors.push(apiError)
    
    // Keep only recent errors
    if (this.recentErrors.length > this.maxErrorHistory) {
      this.recentErrors = this.recentErrors.slice(-this.maxErrorHistory)
    }
  }

  private getProviderStatus(provider: APIProvider, recentErrorCount: number): string {
    if (!provider.enabled) return 'disabled'
    if (this.isRateLimited(provider)) return 'rate_limited'
    if (this.isProviderInCooldown(provider)) return 'cooldown'
    if (recentErrorCount > 3) return 'unstable'
    if (recentErrorCount > 0) return 'degraded'
    return 'healthy'
  }

  private generateStaticFallback(request: SmartContentRequest): LLMGeneratedContent | null {
    console.log('📝 Generating static fallback content for:', request.concept)
    
    // Simple static fallback based on concept
    const concept = request.concept.toLowerCase()
    
    if (concept.includes('photosynthesis')) {
      return {
        explanation: "Photosynthesis is the process by which plants make food from sunlight, water, and carbon dioxide. Plants use chlorophyll to capture light energy and convert it into chemical energy stored in glucose.",
        metadata: {
          provider: 'static' as any,
          model: 'fallback-v1',
          tokensUsed: 150,
          generationTime: 0,
          complexity: 4,
          confidence: 0.7
        }
      }
    }
    
    if (concept.includes('gravity')) {
      return {
        explanation: "Gravity is a force that pulls objects toward each other. The more massive an object is, the stronger its gravitational pull. On Earth, gravity pulls everything toward the center of the planet.",
        metadata: {
          provider: 'static' as any,
          model: 'fallback-v1',
          tokensUsed: 130,
          generationTime: 0,
          complexity: 3,
          confidence: 0.7
        }
      }
    }
    
    // Generic fallback
    return {
      explanation: `${request.concept} is an important concept that involves multiple interconnected ideas. Understanding this topic requires breaking it down into smaller, manageable parts and exploring how they relate to each other.`,
      metadata: {
        provider: 'static' as any,
        model: 'fallback-v1',
        tokensUsed: 100,
        generationTime: 0,
        complexity: 5,
        confidence: 0.5
      }
    }
  }

  private generateMockContent(request: SmartContentRequest, provider: string): LLMGeneratedContent {
    const concept = request.concept
    
    return {
      explanation: `${concept} explained by ${provider}: This is a comprehensive explanation that covers the key aspects of ${concept}. The complexity has been adjusted to level ${request.complexityLevel}.`,
      animationScript: {
        steps: [
          {
            timestamp: 0,
            action: 'introduce',
            description: `Introduction to ${concept}`,
            visualElements: ['main_concept']
          },
          {
            timestamp: 2000,
            action: 'explain',
            description: `Core mechanism of ${concept}`,
            visualElements: ['mechanism', 'process']
          }
        ],
        totalDuration: 4000,
        narration: [`Welcome to ${concept}`, 'Let me explain how this works']
      },
      conceptBreakdown: {
        mainConcept: concept,
        prerequisites: ['basic understanding'],
        subConcepts: [
          {
            name: 'fundamentals',
            description: `Basic principles of ${concept}`,
            difficulty: request.complexityLevel - 1,
            estimatedTime: 180,
            requiredFor: ['advanced topics']
          }
        ],
        progressionPath: ['fundamentals', 'applications']
      },
      metadata: {
        provider: provider.toLowerCase() as any,
        model: `${provider.toLowerCase()}-gpt-4`,
        tokensUsed: 250 + Math.floor(Math.random() * 100),
        generationTime: 1500 + Math.floor(Math.random() * 2000),
        complexity: request.complexityLevel,
        confidence: 0.85 + Math.random() * 0.1
      }
    }
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = min + Math.random() * (max - min)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}