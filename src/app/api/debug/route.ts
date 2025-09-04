import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY
    const youtubeApiKey = process.env.YOUTUBE_API_KEY

    // Check API key status without exposing the keys
    const debugInfo = {
      anthropic: {
        exists: !!anthropicApiKey,
        length: anthropicApiKey?.length || 0,
        startsWithSkAnt: anthropicApiKey?.startsWith('sk-ant-') || false,
        startsWithSk: anthropicApiKey?.startsWith('sk-') || false,
        isDemoMode: anthropicApiKey === 'demo_mode_enabled',
        prefix: anthropicApiKey?.substring(0, 12) || 'none',
        isValid: anthropicApiKey && 
          anthropicApiKey !== 'demo_mode_enabled' && 
          anthropicApiKey.trim().length > 10 &&
          (anthropicApiKey.startsWith('sk-ant-') || anthropicApiKey.startsWith('sk-'))
      },
      openai: {
        exists: !!openaiApiKey,
        length: openaiApiKey?.length || 0,
        startsWithSk: openaiApiKey?.startsWith('sk-') || false,
        isDemoMode: openaiApiKey === 'demo_mode_enabled',
        prefix: openaiApiKey?.substring(0, 8) || 'none',
        isValid: openaiApiKey && 
          openaiApiKey !== 'demo_mode_enabled' && 
          openaiApiKey.trim().length > 10 &&
          openaiApiKey.startsWith('sk-')
      },
      youtube: {
        exists: !!youtubeApiKey,
        length: youtubeApiKey?.length || 0,
        isDemoMode: youtubeApiKey === 'demo_mode_enabled',
        prefix: youtubeApiKey?.substring(0, 8) || 'none'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasEnvFile: process.env.ANTHROPIC_API_KEY !== undefined
      }
    }

    return NextResponse.json({
      status: 'debug',
      keys: debugInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug endpoint failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}