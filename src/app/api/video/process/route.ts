import { NextRequest, NextResponse } from 'next/server'

interface ProcessVideoRequest {
  videoUrl: string
  sessionId?: string
}

interface ProcessVideoResponse {
  success: boolean
  data?: any
  error?: string
  processingTime?: number
}

// Mock video processor for production stability
class MockVideoProcessor {
  async processVideo(videoUrl: string) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: `mock_${Date.now()}`,
      title: 'Mock Processed Video',
      description: 'This is a mock processed video for demonstration purposes',
      url: videoUrl,
      thumbnail: '/api/placeholder/320/180',
      duration: '10:30',
      source: 'youtube',
      plumbingSteps: [
        {
          id: 'step_1',
          title: 'Safety Check',
          description: 'Ensure proper safety equipment is worn',
          startTime: 0,
          endTime: 30,
          tools: ['safety glasses', 'gloves'],
          materials: [],
          difficulty: 'beginner'
        },
        {
          id: 'step_2',
          title: 'Preparation',
          description: 'Gather all necessary tools and materials',
          startTime: 30,
          endTime: 90,
          tools: ['wrench', 'screwdriver'],
          materials: ['pipe', 'fittings'],
          difficulty: 'beginner'
        }
      ],
      keyFrames: [
        { timestamp: 0, isKeyFrame: true, description: 'Start of video' },
        { timestamp: 30, isKeyFrame: true, description: 'Safety demonstration' },
        { timestamp: 90, isKeyFrame: true, description: 'Tool preparation' }
      ],
      transcript: 'Mock transcript for demonstration purposes...',
      metadata: {
        processingTime: 1000,
        quality: 'mock',
        version: '1.0.0'
      }
    }
  }

  async searchVideos(query: string, filters?: any) {
    return [
      {
        id: 'mock_search_1',
        title: `Mock Video for: ${query}`,
        description: 'This is a mock search result',
        url: 'https://youtube.com/watch?v=mock1',
        thumbnail: '/api/placeholder/320/180',
        duration: '8:45',
        source: 'youtube',
        relevanceScore: 0.85
      }
    ]
  }
}

const processor = new MockVideoProcessor()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ProcessVideoRequest = await request.json()
    const { videoUrl, sessionId: _sessionId } = body

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

    // Process the video
    const processedVideo = await processor.processVideo(videoUrl)
    const processingTime = Date.now() - startTime

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

    const _filters = {
      ...(skillLevel && { skillLevel }),
      ...(category && { category }),
      ...(channel && { channel })
    }

    const results = await processor.searchVideos(query, _filters)

    return NextResponse.json({
      success: true,
      data: results,
      totalResults: results.length,
      searchQuery: query,
      _filters
    }, { status: 200 })

  } catch (error) {
    console.error('[Video Search] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    }, { status: 500 })
  }
}