import { NextRequest, NextResponse } from 'next/server'
import { MultiAIOrchestrator } from '@/lib/ai/orchestrator'
import { validateConfig } from '@/lib/ai/config'
import { getPlanFromRequest, getAllowedTypesForPlan, shouldAllowOneFreeVideo } from '@/lib/ai/plans'
import { searchVideoContent } from '@/lib/video/searchVideoContent'
import { jsonError, toApiError } from '@/lib/errors'

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

    const plan = getPlanFromRequest(request)
    const { allow: allowFreeVideo, cookieName } = shouldAllowOneFreeVideo(request)
    const orchestrator = new MultiAIOrchestrator()
    const result = await orchestrator.orchestrateResponse(query)

    // Filter media by plan tier
    const allowedTypes = getAllowedTypesForPlan(plan, allowFreeVideo)
    result.media = result.media.filter(m => allowedTypes.includes(m.type))

    // For free plan without video access, provide suggested YouTube videos
    let suggestedVideos: any[] = []
    if (plan === 'free' && !allowedTypes.includes('video')) {
      try {
        const suggestions = await searchVideoContent({ query, subject: 'plumbing' as any, maxResults: 3 })
        suggestedVideos = suggestions.videos
      } catch {}
    }

    const resBody = {
      success: true,
      data: { ...result, suggestedVideos }
    }

    const response = NextResponse.json(resBody)
    if (plan === 'free' && allowFreeVideo && result.media.some(m => m.type === 'video')) {
      response.cookies.set(cookieName, '1', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    }
    return response

  } catch (error) {
    console.error('Multi-AI orchestration error:', error)
    const apiErr = toApiError(error)
    return jsonError('INTERNAL_ERROR', apiErr.message, 500)
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