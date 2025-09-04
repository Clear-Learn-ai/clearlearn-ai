import { NextRequest, NextResponse } from 'next/server'
import { jsonError } from '@/lib/errors'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(_request: NextRequest) {
  try {
    return NextResponse.json({ success: true, message: 'Video upload stub' })
  } catch (error) {
    return jsonError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error', 500)
  }
}

