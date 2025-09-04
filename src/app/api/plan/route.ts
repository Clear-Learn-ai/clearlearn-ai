import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const plan = req.cookies.get('plan')?.value || (process.env.DEFAULT_PLAN_TIER || 'free')
  return NextResponse.json({ success: true, plan })
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()
    if (!['free', 'pro', 'pro-max'].includes(plan)) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
    }
    const res = NextResponse.json({ success: true, plan })
    res.cookies.set('plan', plan, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}


