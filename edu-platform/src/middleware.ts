import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (path.startsWith('/teacher') && token?.role !== 'TEACHER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (path.startsWith('/learn') && token?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if ((path.startsWith('/student') || path.startsWith('/teacher') || path.startsWith('/admin')) && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
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