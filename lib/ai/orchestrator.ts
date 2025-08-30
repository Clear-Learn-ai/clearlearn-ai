import { 
  MediaGenerationRequest, 
  OrchestrationPlan, 
  OrchestrationResult, 
  GeneratedMedia, 
  ProgressUpdate,
  MediaType,
  AIProvider 
} from './types'
import { getAIConfigs, getServiceForMediaType, getFallbackProviders } from './config'
import { TripoClient } from './services/tripoClient'
import { RunwayClient } from './services/runwayClient'
import { ElevenLabsClient } from './services/elevenlabsClient'
import { OpenAIClient } from './services/openaiClient'

export class MultiAIOrchestrator {
  private clients: Map<AIProvider, any> = new Map()
  private progressCallback?: (update: ProgressUpdate) => void

  constructor(progressCallback?: (update: ProgressUpdate) => void) {
    this.progressCallback = progressCallback
    this.initializeClients()
  }

  private initializeClients() {
    const configs = getAIConfigs()

    if (configs.tripo?.apiKey) {
      this.clients.set('tripo', new TripoClient(configs.tripo))
    }
    if (configs.runway?.apiKey) {
      this.clients.set('runway', new RunwayClient(configs.runway))
    }
    if (configs.elevenlabs?.apiKey) {
      this.clients.set('elevenlabs', new ElevenLabsClient(configs.elevenlabs))
    }
    if (configs.openai?.apiKey) {
      this.clients.set('openai', new OpenAIClient(configs.openai))
    }
  }

  async orchestrateResponse(query: string): Promise<OrchestrationResult> {
    const startTime = Date.now()
    
    this.emitProgress({
      stage: 'planning',
      progress: 10,
      message: 'Analyzing query and planning generation...'
    })

    const plan = await this.createPlan(query)
    
    this.emitProgress({
      stage: 'generating',
      progress: 20,
      message: 'Starting media generation...'
    })

    const results: GeneratedMedia[] = []
    const errors: Array<{ provider: AIProvider; error: string }> = []

    const mediaRequests = this.createMediaRequests(query, plan.mediaTypes)
    
    if (plan.parallel) {
      const promises = mediaRequests.map(async (request, index) => {
        try {
          const provider = plan.services[request.type] || getServiceForMediaType(request.type)
          const media = await this.generateMedia(request, provider)
          
          const progress = 20 + ((index + 1) / mediaRequests.length) * 60
          this.emitProgress({
            stage: 'generating',
            provider,
            mediaType: request.type,
            progress,
            message: `Generated ${request.type} content`
          })
          
          return media
        } catch (error) {
          const provider = plan.services[request.type] || getServiceForMediaType(request.type)
          errors.push({
            provider,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          const fallbacks = getFallbackProviders(provider)
          for (const fallback of fallbacks) {
            try {
              const media = await this.generateMedia(request, fallback)
              return media
            } catch (fallbackError) {
              errors.push({
                provider: fallback,
                error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
              })
            }
          }
          return null
        }
      })

      const generatedMedia = await Promise.all(promises)
      results.push(...generatedMedia.filter(Boolean) as GeneratedMedia[])
    } else {
      for (let i = 0; i < mediaRequests.length; i++) {
        const request = mediaRequests[i]
        try {
          const provider = plan.services[request.type] || getServiceForMediaType(request.type)
          const media = await this.generateMedia(request, provider)
          results.push(media)
          
          const progress = 20 + ((i + 1) / mediaRequests.length) * 60
          this.emitProgress({
            stage: 'generating',
            provider,
            mediaType: request.type,
            progress,
            message: `Generated ${request.type} content`
          })
        } catch (error) {
          const provider = plan.services[request.type] || getServiceForMediaType(request.type)
          errors.push({
            provider,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    this.emitProgress({
      stage: 'composing',
      progress: 90,
      message: 'Composing final response...'
    })

    this.emitProgress({
      stage: 'complete',
      progress: 100,
      message: 'Multi-AI response complete!'
    })

    return {
      query,
      media: results,
      totalTime: Date.now() - startTime,
      errors,
      plan
    }
  }

  private async createPlan(query: string): Promise<OrchestrationPlan> {
    const mediaTypes = this.determineMediaTypes(query)
    const services: { [key in MediaType]?: AIProvider } = {}
    
    for (const mediaType of mediaTypes) {
      services[mediaType] = getServiceForMediaType(mediaType)
    }

    return {
      query,
      mediaTypes,
      services,
      parallel: true,
      fallbacks: this.buildFallbackMap(services)
    }
  }

  private determineMediaTypes(query: string): MediaType[] {
    const types: MediaType[] = ['text']
    
    const query_lower = query.toLowerCase()
    
    if (query_lower.includes('show') || query_lower.includes('diagram') || query_lower.includes('picture')) {
      types.push('image')
    }
    
    if (query_lower.includes('3d') || query_lower.includes('model') || query_lower.includes('pipe') || query_lower.includes('fitting')) {
      types.push('3d-model')
    }
    
    if (query_lower.includes('video') || query_lower.includes('install') || query_lower.includes('step')) {
      types.push('video')
    }
    
    if (query_lower.includes('explain') || query_lower.includes('tell me') || query_lower.includes('how')) {
      types.push('audio')
    }
    
    if (query_lower.includes('cross-section') || query_lower.includes('schematic') || query_lower.includes('blueprint')) {
      types.push('diagram')
    }

    return types
  }

  private createMediaRequests(query: string, mediaTypes: MediaType[]): MediaGenerationRequest[] {
    return mediaTypes.map(type => ({
      prompt: this.adaptPromptForMediaType(query, type),
      type,
      options: this.getOptionsForMediaType(type)
    }))
  }

  private adaptPromptForMediaType(query: string, mediaType: MediaType): string {
    const basePrompt = `Plumbing education: ${query}`
    
    switch (mediaType) {
      case 'image':
        return `Create a detailed technical diagram for: ${query}. Show clear labels, cross-sections, and educational details for plumbing apprentices.`
      case '3d-model':
        return `Generate a 3D model for plumbing education: ${query}. Make it detailed and suitable for hands-on learning.`
      case 'video':
        return `Create step-by-step installation video for: ${query}. Focus on proper techniques and safety for apprentices.`
      case 'audio':
        return `Provide clear, professional narration explaining: ${query}. Use simple language suitable for plumbing apprentices learning on the job.`
      case 'diagram':
        return `Create a technical schematic diagram for: ${query}. Include dimensions, materials, and code requirements.`
      default:
        return basePrompt
    }
  }

  private getOptionsForMediaType(mediaType: MediaType) {
    switch (mediaType) {
      case 'image':
        return { width: 1024, height: 1024, quality: 'high' as const }
      case 'video':
        return { width: 1280, height: 720, duration: 30 }
      case '3d-model':
        return { quality: 'standard' as const, format: 'glb' }
      default:
        return {}
    }
  }

  private buildFallbackMap(services: { [key in MediaType]?: AIProvider }) {
    const fallbacks: { [key in AIProvider]?: AIProvider[] } = {}
    
    Object.values(services).forEach(provider => {
      if (provider) {
        fallbacks[provider] = getFallbackProviders(provider)
      }
    })
    
    return fallbacks
  }

  private async generateMedia(request: MediaGenerationRequest, provider: AIProvider): Promise<GeneratedMedia> {
    const client = this.clients.get(provider)
    if (!client) {
      throw new Error(`No client available for provider: ${provider}`)
    }

    switch (request.type) {
      case 'image':
      case 'diagram':
        if (provider === 'openai') {
          return await client.generateImage(request)
        }
        throw new Error(`Provider ${provider} doesn't support image generation`)
      
      case '3d-model':
        if (provider === 'tripo') {
          return await client.generate3DModel(request)
        }
        throw new Error(`Provider ${provider} doesn't support 3D model generation`)
      
      case 'video':
        if (provider === 'runway') {
          return await client.generateVideo(request)
        }
        throw new Error(`Provider ${provider} doesn't support video generation`)
      
      case 'audio':
        if (provider === 'elevenlabs') {
          return await client.generateAudio(request)
        }
        throw new Error(`Provider ${provider} doesn't support audio generation`)
      
      case 'text':
        if (provider === 'openai') {
          return await client.generateText(request)
        }
        throw new Error(`Provider ${provider} doesn't support text generation`)
      
      default:
        throw new Error(`Unsupported media type: ${request.type}`)
    }
  }

  private emitProgress(update: ProgressUpdate) {
    if (this.progressCallback) {
      this.progressCallback(update)
    }
  }

  async healthCheck(): Promise<{ [key in AIProvider]?: boolean }> {
    const results: { [key in AIProvider]?: boolean } = {}
    
    for (const [provider, client] of this.clients) {
      try {
        results[provider] = await client.testConnection()
      } catch {
        results[provider] = false
      }
    }
    
    return results
  }
}