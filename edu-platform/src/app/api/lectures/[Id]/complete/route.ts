import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { courseId } = await req.json()
  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: session.user.id,
      lessonId: params.lessonId,
      courseId,
      completed: true,
      completedAt: new Date(),
    },
  })
  return NextResponse.json({ success: true })
}