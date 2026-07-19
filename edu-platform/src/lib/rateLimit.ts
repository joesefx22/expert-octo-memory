import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// استخدم Upstash إذا توفرت متغيرات البيئة، وإلا استخدم الحل المحلي
let limiter: any

if (process.env.UPSTASH_REDIS_REST_URL) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
  })
} else {
  // fallback إلى الميموري للبيئات الصغيرة
  const { RateLimiter } = require('next-rate-limit')
  limiter = new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
  })
}

export async function checkRateLimit(req: NextRequest, limit: number = 5) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous'

  try {
    if (typeof limiter.limit === 'function') {
      // Upstash style
      const result = await limiter.limit(ip, { limit })
      if (!result.success) {
        return NextResponse.json({ message: 'تجاوز الحد الأقصى' }, { status: 429 })
      }
    } else {
      // old memory style
      await limiter.check(limit, ip)
    }
    return null
  } catch {
    return NextResponse.json({ message: 'تجاوز الحد الأقصى' }, { status: 429 })
  }
}