import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  // جلب courseId من قاعدة البيانات بدلاً من الوثوق بالعميل
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { module: { include: { course: true } } }
  })

  if (!lesson) {
    return NextResponse.json({ message: 'درس غير صالح' }, { status: 404 })
  }

  const course = lesson.module.course

  // ✅ حماية IDOR: التحقق من الاشتراك إذا كان الكورس مدفوعاً
  if (!course.isFree) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    })

    if (!enrollment || (enrollment.expiresAt && new Date() > enrollment.expiresAt)) {
      return NextResponse.json({ message: 'غير مصرح بالوصول لهذا الكورس' }, { status: 403 })
    }
  }

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: session.user.id,
      lessonId: params.lessonId,
      courseId: course.id,
      completed: true,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}