import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { answers } = await req.json() // { questionId: answer }
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { quiz: { include: { questions: true } } },
  })
  if (!lesson?.quiz) return NextResponse.json({ message: 'لا يوجد امتحان' }, { status: 404 })

  let correctCount = 0
  for (const q of lesson.quiz.questions) {
    const userAnswer = answers[q.id]
    if (userAnswer == undefined) continue
    // تخزين الإجابة
    await prisma.quizAnswer.create({
      data: {
        userId: session.user.id,
        questionId: q.id,
        answer: userAnswer,
        isCorrect: userAnswer === q.answer,
      },
    })
    if (userAnswer === q.answer) correctCount++
  }
  return NextResponse.json({ score: correctCount, total: lesson.quiz.questions.length })
}