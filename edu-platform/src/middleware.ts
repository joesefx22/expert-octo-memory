import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Teacher routes
    if (path.startsWith('/teacher') && token?.role !== 'TEACHER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Learn routes (only for students who purchased)
    if (path.startsWith('/learn') && token?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Protected dashboard routes
    if (path.startsWith('/student') || path.startsWith('/teacher') || path.startsWith('/admin')) {
      if (!token) return NextResponse.redirect(new URL('/login', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*', '/learn/:path*', '/code/:path*'],
}

// في src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from './lib/rateLimit'

export async function middleware(req: NextRequest) {
  // تطبيق Rate Limiting على مسارات API الحساسة
  if (req.nextUrl.pathname.startsWith('/api/auth') || req.nextUrl.pathname === '/api/register') {
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown'
    // هنا يمكن استخدام limiter خاص بكل IP
    // بسبب تعقيد دمج next-rate-limit مع Next.js middleware، نلجأ لاستخدام headers
    // سنفعل ذلك من خلال API route مباشرة
  }
  // باقي المنطق الموجود...
}