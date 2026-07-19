import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { title, moduleId, type, videoId, duration } = await req.json()
  if (!title || !moduleId || !type) return NextResponse.json({ message: 'بيانات ناقصة' }, { status: 400 })

  const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } })
  if (!mod) return NextResponse.json({ message: 'الوحدة غير موجودة' }, { status: 404 })
  if (session.user.role !== 'ADMIN' && mod.course.teacherId !== session.user.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const maxOrder = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const nextOrder = (maxOrder?.order ?? 0) + 1

  const lesson = await prisma.lesson.create({
    data: {
      title,
      moduleId,
      type,
      videoId: type === 'VIDEO' ? videoId : null,
      duration: type === 'VIDEO' ? duration : null,
      order: nextOrder,
    },
  })

  return NextResponse.json(lesson, { status: 201 })
}