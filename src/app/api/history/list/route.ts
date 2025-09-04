import { NextRequest, NextResponse } from 'next/server'
import { getMessages } from '@/lib/supabase'
import { jsonError } from '@/lib/errors'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) {
      return jsonError('BAD_REQUEST', 'sessionId is required', 400)
    }
    const messages = await getMessages(sessionId)
    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    console.error('History list error:', error)
    return jsonError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error', 500)
  }
}

