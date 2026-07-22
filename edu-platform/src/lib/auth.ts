import NextAuth, { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { Role } from '@prisma/client'
import { checkRateLimit } from './rateLimit'
import { headers } from 'next/headers'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
  interface User {
    role: Role
  }
}

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const requestHeaders = new Headers()
        const clientIp = headers().get('x-forwarded-for') || '127.0.0.1'
        requestHeaders.set('x-forwarded-for', clientIp)
        const mockReq = new Request('http://localhost', { headers: requestHeaders })

        const rateLimitRes = await checkRateLimit(mockReq, 'login')
        if (rateLimitRes) {
          throw new Error('تم تجاوز الحد المسموح. حاول لاحقاً.')
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('بيانات غير صالحة')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) throw new Error('بيانات غير صالحة')

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error('بيانات غير صالحة')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export default NextAuth(authOptions)