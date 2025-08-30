import { NextRequest, NextResponse } from 'next/server'
import { MultiAIOrchestrator } from '@/lib/ai/orchestrator'
import { validateConfig } from '@/lib/ai/config'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    const configValidation = validateConfig()
    if (!configValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Missing required API keys', 
          missing: configValidation.missing 
        },
        { status: 500 }
      )
    }

    const orchestrator = new MultiAIOrchestrator()
    const result = await orchestrator.orchestrateResponse(query)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Multi-AI orchestration error:', error)
    
    return NextResponse.json(
      { 
        error: 'Multi-AI orchestration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const orchestrator = new MultiAIOrchestrator()
    const healthCheck = await orchestrator.healthCheck()

    return NextResponse.json({
      success: true,
      services: healthCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}