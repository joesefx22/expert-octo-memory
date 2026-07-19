import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  videoId: z.string().min(1),
  duration: z.number().int().positive(),
  isFree: z.boolean().default(false),
  price: z.number().positive().nullable().optional(),
})

export async function GET() {
  const lectures = await prisma.lecture.findMany({
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(lectures)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)
    const lecture = await prisma.lecture.create({
      data: {
        ...data,
        teacherId: session.user.id,
      },
    })
    return NextResponse.json(lecture, { status: 201 })
  } catch (e) {
    return NextResponse.json({ message: 'بيانات غير صحيحة' }, { status: 400 })
  }
}

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