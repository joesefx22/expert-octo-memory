import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const [students, teachers, lectures, codes, submissions] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.lecture.count(),
    prisma.code.count(),
    prisma.submission.count(),
  ])

  return NextResponse.json({ students, teachers, lectures, codes, submissions })
}