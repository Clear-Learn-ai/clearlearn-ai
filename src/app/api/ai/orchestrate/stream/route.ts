import { NextRequest, NextResponse } from 'next/server'
import { MultiAIOrchestrator } from '@/lib/ai/orchestrator'
import { validateConfig } from '@/lib/ai/config'
import { ProgressUpdate } from '@/lib/ai/types'
import { getPlanFromRequest, getAllowedTypesForPlan, shouldAllowOneFreeVideo } from '@/lib/ai/plans'
import { searchVideoContent } from '@/lib/video/searchVideoContent'
import { jsonError } from '@/lib/errors'

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
          .then(async result => {
            const plan = getPlanFromRequest(request)
            const { allow: allowFreeVideo } = shouldAllowOneFreeVideo(request)
            const allowedTypes = getAllowedTypesForPlan(plan, allowFreeVideo)
            result.media = result.media.filter(m => allowedTypes.includes(m.type))
            let suggestedVideos: any[] = []
            const hasVideo = result.media.some(m => m.type === 'video')
            if (plan === 'free' && (!allowedTypes.includes('video') || !hasVideo)) {
              try {
                const suggestions = await searchVideoContent({ query, subject: 'plumbing' as any, maxResults: 3 })
                suggestedVideos = suggestions.videos
              } catch {}
            }
            const data = `data: ${JSON.stringify({
              type: 'complete',
              data: { ...result, suggestedVideos }
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
    return jsonError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error', 500)
  }
}