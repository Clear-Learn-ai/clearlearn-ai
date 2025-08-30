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
    'text': 'anthropic',
    'image': 'openai',
    'video': 'runway',
    'audio': 'elevenlabs',
    '3d-model': 'tripo',
    'diagram': 'openai'
  }
  
  return mappings[mediaType] || 'openai'
}

export const getFallbackProviders = (provider: AIProvider): AIProvider[] => {
  const fallbacks: Record<AIProvider, AIProvider[]> = {
    'openai': ['groq', 'google'],
    'anthropic': ['openai', 'groq'],
    'google': ['groq', 'openai'],
    'groq': ['openai', 'google'],
    'tripo': ['meshy', 'luma'],
    'meshy': ['tripo', 'luma'],
    'luma': ['tripo', 'meshy'],
    'runway': ['pika'],
    'pika': ['runway'],
    'elevenlabs': [],
    'midjourney': ['stable-diffusion', 'openai'],
    'stable-diffusion': ['openai', 'midjourney']
  }
  
  return fallbacks[provider] || []
}

export const validateConfig = (): { valid: boolean; missing: string[] } => {
  const required = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'TRIPO_API_KEY',
    'ELEVENLABS_API_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  return {
    valid: missing.length === 0,
    missing
  }
}