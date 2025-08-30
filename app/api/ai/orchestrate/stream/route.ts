import { NextRequest, NextResponse } from 'next/server'
import { MultiAIOrchestrator } from '@/lib/ai/orchestrator'
import { validateConfig } from '@/lib/ai/config'
import { ProgressUpdate } from '@/lib/ai/types'

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

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const orchestrator = new MultiAIOrchestrator((progress: ProgressUpdate) => {
          const data = `data: ${JSON.stringify({
            type: 'progress',
            data: progress
          })}\n\n`
          controller.enqueue(encoder.encode(data))
        })

        orchestrator.orchestrateResponse(query)
          .then(result => {
            const data = `data: ${JSON.stringify({
              type: 'complete',
              data: result
            })}\n\n`
            controller.enqueue(encoder.encode(data))
            controller.close()
          })
          .catch(error => {
            const data = `data: ${JSON.stringify({
              type: 'error',
              data: {
                message: error instanceof Error ? error.message : 'Unknown error'
              }
            })}\n\n`
            controller.enqueue(encoder.encode(data))
            controller.close()
          })
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

  } catch (error) {
    console.error('Multi-AI orchestration stream error:', error)
    
    return NextResponse.json(
      { 
        error: 'Multi-AI orchestration stream failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}