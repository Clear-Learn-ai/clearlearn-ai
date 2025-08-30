import { AIServiceConfig, GeneratedMedia, MediaGenerationRequest } from '../types'

export class RunwayClient {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  async generateVideo(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.config.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: request.prompt,
          duration: request.options?.duration || 3,
          resolution: `${request.options?.width || 1280}x${request.options?.height || 720}`,
          model: 'runway-gen3'
        })
      })

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.status}`)
      }

      const result = await response.json()
      
      let videoUrl = result.video_url
      if (!videoUrl && result.task_id) {
        videoUrl = await this.pollForCompletion(result.task_id)
      }

      return {
        id: result.task_id || `runway_${Date.now()}`,
        type: 'video',
        url: videoUrl,
        metadata: {
          provider: 'runway',
          model: 'runway-gen3',
          generationTime: Date.now() - startTime,
          cost: this.calculateCost(request.options?.duration || 3)
        }
      }
    } catch (error) {
      throw new Error(`Runway generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async pollForCompletion(taskId: string): Promise<string> {
    const maxAttempts = 60
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.config.baseUrl}/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        })

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`)
        }

        const status = await response.json()
        
        if (status.status === 'completed' && status.video_url) {
          return status.video_url
        }
        
        if (status.status === 'failed') {
          throw new Error('Video generation failed')
        }

        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        throw error
      }
    }

    throw new Error('Video generation timed out')
  }

  private calculateCost(duration: number): number {
    return duration * 0.05
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/account`, {
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