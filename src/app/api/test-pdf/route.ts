import { NextRequest, NextResponse } from 'next/server'
// import { ContentIntegrator } from '@/lib/pdf/contentIntegrator'

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'PDF testing temporarily disabled for production deployment'
  }, { status: 503 })
}