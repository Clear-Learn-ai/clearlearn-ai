import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { AIProvider, MediaType } from './types'

export type PlanTier = 'free' | 'pro' | 'pro-max'

export function getPlanFromRequest(req: NextRequest): PlanTier {
  const headerPlan = req.headers.get('x-plan-tier') as PlanTier | null
  const cookiePlan = req.cookies.get('plan')?.value as PlanTier | undefined
  const envDefault = (process.env.DEFAULT_PLAN_TIER as PlanTier) || 'free'
  return headerPlan || cookiePlan || envDefault
}

export function getProviderOverridesForPlan(plan: PlanTier): Partial<Record<MediaType, AIProvider>> {
  switch (plan) {
    case 'pro-max':
      return {
        text: 'anthropic',
        image: 'openai',
        video: 'runway',
        audio: 'elevenlabs',
        '3d-model': 'tripo',
        diagram: 'openai',
      }
    case 'pro':
      return {
        text: 'openai',
        image: 'openai',
        video: 'runway',
        audio: 'elevenlabs',
        diagram: 'openai',
      }
    default:
      return {
        text: 'openai',
        image: 'openai',
        diagram: 'openai',
      }
  }
}

export function getAllowedTypesForPlan(plan: PlanTier, allowVideo: boolean): MediaType[] {
  if (plan === 'pro-max') return ['text', 'image', 'video', 'audio', '3d-model', 'diagram']
  if (plan === 'pro') return ['text', 'image', 'video', 'audio', 'diagram']
  const base: MediaType[] = ['text', 'image', 'diagram']
  return allowVideo ? [...base, 'video'] : base
}

export function shouldAllowOneFreeVideo(req: NextRequest): { allow: boolean; cookieName: string } {
  const cookieName = 'free_video_used'
  const used = req.cookies.get(cookieName)?.value === '1'
  return { allow: !used, cookieName }
}

