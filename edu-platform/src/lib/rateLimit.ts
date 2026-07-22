import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const ratelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
}) : null

export async function checkRateLimit(req: Request, actionNamespace: string) {
  if (!ratelimit) return null

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  const identifier = `${ip}_${actionNamespace}`
  const { success } = await ratelimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { message: 'لقد تجاوزت الحد المسموح به من المحاولات. الرجاء المحاولة لاحقاً.' },
      { status: 429 }
    )
  }

  return null
}