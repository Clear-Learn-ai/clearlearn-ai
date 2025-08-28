import { NextRequest, NextResponse } from 'next/server'
// import { YouTubeVideoProcessor } from '@/lib/video/youtubeProcessor'

// const processor = new YouTubeVideoProcessor()

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Video processing temporarily disabled for production deployment'
  }, { status: 503 })
}