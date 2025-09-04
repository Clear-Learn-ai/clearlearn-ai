import { AIServiceConfig, GeneratedMedia, MediaGenerationRequest } from '../types'

export class ElevenLabsClient {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  async generateAudio(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    const startTime = Date.now()
    
    try {
      const voiceId = 'EXAVITQu4vr4xnSDxMaL'
      
      const response = await fetch(`${this.config.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: request.prompt,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      
      return {
        id: `elevenlabs_${Date.now()}`,
        type: 'audio',
        data: `data:audio/mpeg;base64,${base64Audio}`,
        metadata: {
          provider: 'elevenlabs',
          model: 'eleven_multilingual_v2',
          generationTime: Date.now() - startTime,
          cost: this.calculateCost(request.prompt.length)
        }
      }
    } catch (error) {
      throw new Error(`ElevenLabs generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getVoices(): Promise<Array<{ voice_id: string; name: string }>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`)
      }

      const result = await response.json()
      return result.voices || []
    } catch (error) {
      throw new Error(`Voice fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateCost(textLength: number): number {
    const charactersPerDollar = 1000
    return textLength / charactersPerDollar
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/voices`, {
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