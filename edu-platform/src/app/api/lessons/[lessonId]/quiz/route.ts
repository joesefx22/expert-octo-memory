import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLessonLockStatus } from '@/lib/locking'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { answers } = await req.json()
  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 400 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      quiz: { include: { questions: true } },
      module: {
        select: {
          courseId: true,
          course: { select: { isFree: true } },
        },
      },
    },
  })

  if (!lesson?.quiz) {
    return NextResponse.json({ message: 'لا يوجد امتحان' }, { status: 404 })
  }

  const actualCourseId = lesson.module.courseId

  // IDOR Protection
  if (!lesson.module.course.isFree) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: actualCourseId } },
    })
    if (!enrollment || (enrollment.expiresAt && new Date() > enrollment.expiresAt)) {
      return NextResponse.json({ message: 'غير مصرح بالوصول لهذا الكورس' }, { status: 403 })
    }
  }

  // فحص قفل الدرس
  const lockStatus = await getLessonLockStatus(params.lessonId, session.user.id, actualCourseId)
  if (lockStatus.isLocked) {
    return NextResponse.json({ message: 'هذا الدرس مقفل. يجب إكمال الدروس السابقة أولاً.' }, { status: 403 })
  }

  let correctCount = 0
  const upsertPromises = []

  for (const q of lesson.quiz.questions) {
    const userAnswer = answers[q.id]
    if (userAnswer === undefined) continue

    const isCorrect = String(userAnswer) === String(q.answer)
    if (isCorrect) correctCount++

    upsertPromises.push(
      prisma.quizAnswer.upsert({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId: q.id,
          },
        },
        update: { answer: String(userAnswer), isCorrect },
        create: {
          userId: session.user.id,
          questionId: q.id,
          answer: String(userAnswer),
          isCorrect,
        },
      })
    )
  }

  await prisma.$transaction(upsertPromises)

  return NextResponse.json({
    score: correctCount,
    total: lesson.quiz.questions.length,
  })
}