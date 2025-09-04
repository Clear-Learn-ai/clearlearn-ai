import { AIServiceConfig, GeneratedMedia, MediaGenerationRequest } from '../types'

export class TripoClient {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  async generate3DModel(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'text_to_model',
          text: request.prompt,
          quality: request.options?.quality || 'standard',
          format: request.options?.format || 'glb'
        })
      })

      if (!response.ok) {
        throw new Error(`Tripo API error: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        id: result.id || `tripo_${Date.now()}`,
        type: '3d-model',
        url: result.model_urls?.glb || result.model_url,
        data: result.model_data,
        metadata: {
          provider: 'tripo',
          model: 'tripo-sr',
          generationTime: Date.now() - startTime,
          tokens: result.usage?.tokens,
          cost: this.calculateCost(result.usage)
        }
      }
    } catch (error) {
      throw new Error(`Tripo generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async checkStatus(taskId: string): Promise<{ status: string; result?: any }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Tripo status check failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateCost(usage?: any): number {
    if (!usage) return 0
    return (usage.tokens || 1) * 0.001
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}