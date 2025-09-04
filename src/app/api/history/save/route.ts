import { NextRequest, NextResponse } from 'next/server'
import { createChatSession, saveMessage } from '@/lib/supabase'
import { jsonError } from '@/lib/errors'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userMessage, assistantMessage, videoResults } = await request.json()

    if (!sessionId || !userMessage || !assistantMessage) {
      return jsonError('BAD_REQUEST', 'sessionId, userMessage, and assistantMessage are required', 400)
    }

    // Minimal persistence: use provided sessionId; create session row if not exists
    // Using anonymous user for now; adjust to real auth when integrated
    try {
      await createChatSession('anonymous', 'Plumbing chat')
    } catch {}

    await saveMessage(sessionId, 'user', userMessage)
    await saveMessage(sessionId, 'assistant', assistantMessage, videoResults)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History save error:', error)
    return jsonError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error', 500)
  }
}

