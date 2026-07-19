import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { title, courseId } = await req.json()
  if (!title || !courseId) return NextResponse.json({ message: 'العنوان ومعرف الكورس مطلوبان' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ message: 'الكورس غير موجود' }, { status: 404 })
  if (session.user.role !== 'ADMIN' && course.teacherId !== session.user.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  // تحديد الترتيب التالي
  const maxOrder = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const nextOrder = (maxOrder?.order ?? 0) + 1

  const mod = await prisma.module.create({
    data: { title, courseId, order: nextOrder },
  })

  return NextResponse.json(mod, { status: 201 })
}