import { AIServiceConfig, AIProvider } from './types'

interface AIServiceConfigs {
  [key: string]: AIServiceConfig
}

export const getAIConfigs = (): AIServiceConfigs => {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
      baseUrl: 'https://api.openai.com/v1',
      timeout: 30000
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
      baseUrl: 'https://api.anthropic.com/v1',
      timeout: 30000
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY!,
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      timeout: 30000
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY!,
      baseUrl: 'https://api.groq.com/openai/v1',
      timeout: 15000
    },
    tripo: {
      apiKey: process.env.TRIPO_API_KEY!,
      baseUrl: 'https://api.tripo3d.ai/v1',
      timeout: 60000
    },
    meshy: {
      apiKey: process.env.MESHY_API_KEY!,
      baseUrl: 'https://api.meshy.ai/v1',
      timeout: 60000
    },
    luma: {
      apiKey: process.env.LUMA_API_KEY!,
      baseUrl: 'https://api.lumalabs.ai/v1',
      timeout: 120000
    },
    runway: {
      apiKey: process.env.RUNWAY_API_KEY!,
      baseUrl: 'https://api.runwayml.com/v1',
      timeout: 180000
    },
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY!,
      baseUrl: 'https://api.elevenlabs.io/v1',
      timeout: 30000
    }
  }
}

export const getServiceForMediaType = (mediaType: string): AIProvider => {
  const mappings: Record<string, AIProvider> = {
    'text': 'openai',
    'image': 'openai',
    'video': 'runway',
    'audio': 'elevenlabs',
    '3d-model': 'tripo',
    'diagram': 'openai'
  }
  
  return mappings[mediaType] || 'openai'
}

export const getFallbackProviders = (provider: AIProvider): AIProvider[] => {
  // Limit fallbacks to implemented providers only
  const fallbacks: Record<AIProvider, AIProvider[]> = {
    'openai': [],
    'anthropic': [],
    'google': [],
    'groq': [],
    'tripo': [],
    'meshy': [],
    'luma': [],
    'runway': [],
    'pika': [],
    'elevenlabs': [],
    'midjourney': [],
    'stable-diffusion': []
  }
  
  return fallbacks[provider] || []
}

export const validateConfig = (): { valid: boolean; missing: string[] } => {
  // For baseline operation, require OpenAI for text generation.
  // Other providers are optional and will be attempted if configured.
  const required: string[] = ['OPENAI_API_KEY']
  const optional: string[] = ['TRIPO_API_KEY', 'ELEVENLABS_API_KEY', 'RUNWAY_API_KEY', 'ANTHROPIC_API_KEY']

  const missing = required.filter(key => !process.env[key])
  const missingOptional = optional.filter(key => !process.env[key])

  // Keep the same return shape but include optional info in missing for visibility without failing validity
  return {
    valid: missing.length === 0,
    missing: [...missingOptional]
  }
}