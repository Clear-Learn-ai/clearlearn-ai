import { AIServiceConfig, GeneratedMedia, MediaGenerationRequest } from '../types'

export class OpenAIClient {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  async generateImage(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.config.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: request.prompt,
          n: 1,
          size: `${request.options?.width || 1024}x${request.options?.height || 1024}`,
          quality: request.options?.quality === 'high' ? 'hd' : 'standard',
          style: request.options?.style || 'natural'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || response.status}`)
      }

      const result = await response.json()
      const imageData = result.data[0]
      
      return {
        id: `openai_image_${Date.now()}`,
        type: 'image',
        url: imageData.url,
        data: imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : undefined,
        metadata: {
          provider: 'openai',
          model: 'dall-e-3',
          generationTime: Date.now() - startTime,
          cost: request.options?.quality === 'high' ? 0.080 : 0.040
        }
      }
    } catch (error) {
      throw new Error(`OpenAI image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateText(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert plumbing instructor creating educational content for apprentices.'
            },
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || response.status}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content
      
      return {
        id: `openai_text_${Date.now()}`,
        type: 'text',
        data: content,
        metadata: {
          provider: 'openai',
          model: 'gpt-4o',
          generationTime: Date.now() - startTime,
          tokens: result.usage?.total_tokens || 0,
          cost: this.calculateTextCost(result.usage)
        }
      }
    } catch (error) {
      throw new Error(`OpenAI text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateTextCost(usage?: any): number {
    if (!usage) return 0
    const inputCost = (usage.prompt_tokens || 0) * 0.000005
    const outputCost = (usage.completion_tokens || 0) * 0.000015
    return inputCost + outputCost
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
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