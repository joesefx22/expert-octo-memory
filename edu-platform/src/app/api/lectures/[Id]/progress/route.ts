import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { seconds } = await req.json()
  if (typeof seconds !== 'number') return NextResponse.json({ message: 'الرجاء إرسال الثواني' }, { status: 400 })

  await prisma.watchProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
    update: { seconds },
    create: { userId: session.user.id, lessonId: params.lessonId, seconds },
  })

  return NextResponse.json({ success: true })
}

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const progress = await prisma.watchProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
    select: { seconds: true },
  })

  return NextResponse.json({ seconds: progress?.seconds || 0 })
}