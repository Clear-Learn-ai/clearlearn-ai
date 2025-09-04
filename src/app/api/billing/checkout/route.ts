import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()
    if (!['pro', 'pro-max'].includes(plan)) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
    }
    // Stub a redirect URL (replace with Stripe Checkout)
    const checkoutUrl = `/pricing?startedCheckout=${encodeURIComponent(plan)}`
    return NextResponse.json({ success: true, url: checkoutUrl })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}


