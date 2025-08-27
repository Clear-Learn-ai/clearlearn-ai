import { NextRequest, NextResponse } from 'next/server'
import { YouTubeVideoProcessor, ProcessedVideo } from '@/lib/video/youtubeProcessor'

interface ProcessVideoRequest {
  videoUrl: string
  sessionId?: string
}

interface ProcessVideoResponse {
  success: boolean
  data?: ProcessedVideo
  error?: string
  processingTime?: number
}

const processor = new YouTubeVideoProcessor()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ProcessVideoRequest = await request.json()
    const { videoUrl, sessionId } = body

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    const isValidUrl = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(videoUrl)
    if (!isValidUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL format' },
        { status: 400 }
      )
    }

    console.log(`[Video Processing] Starting processing for: ${videoUrl}`)

    // Process the video
    const processedVideo = await processor.processVideo(videoUrl)
    const processingTime = Date.now() - startTime

    console.log(`[Video Processing] Completed in ${processingTime}ms`)
    console.log(`[Video Processing] Found ${processedVideo.plumbingSteps.length} steps`)
    console.log(`[Video Processing] Extracted ${processedVideo.keyFrames.filter(f => f.isKeyFrame).length} key frames`)

    const response: ProcessVideoResponse = {
      success: true,
      data: processedVideo,
      processingTime
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('[Video Processing] Error:', error)
    
    const processingTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    const response: ProcessVideoResponse = {
      success: false,
      error: errorMessage,
      processingTime
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const skillLevel = searchParams.get('skillLevel') as 'beginner' | 'intermediate' | 'advanced' | null
  const category = searchParams.get('category') as 'installation' | 'repair' | 'troubleshooting' | 'maintenance' | 'inspection' | null
  const channel = searchParams.get('channel')

  try {
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    const filters = {
      ...(skillLevel && { skillLevel }),
      ...(category && { category }),
      ...(channel && { channel })
    }

    const results = await processor.searchVideos(query, filters)

    return NextResponse.json({
      success: true,
      data: results,
      totalResults: results.length,
      searchQuery: query,
      filters
    }, { status: 200 })

  } catch (error) {
    console.error('[Video Search] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    }, { status: 500 })
  }
}