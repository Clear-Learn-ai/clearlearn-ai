import { NextRequest, NextResponse } from 'next/server'
import { YouTubeVideoProcessor } from '@/lib/video/youtubeProcessor'

const processor = new YouTubeVideoProcessor()

export async function GET(request: NextRequest) {
  try {
    const channels = processor.getTargetChannels()
    
    return NextResponse.json({
      success: true,
      data: channels,
      totalChannels: channels.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Video Channels] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve channels'
    }, { status: 500 })
  }
}