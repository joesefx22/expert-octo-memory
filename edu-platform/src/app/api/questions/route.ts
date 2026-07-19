import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }
  const { content, lectureId } = await req.json()
  if (!content) return NextResponse.json({ message: 'المحتوى مطلوب' }, { status: 400 })

  const question = await prisma.question.create({
    data: { content, lectureId, studentId: session.user.id },
  })
  return NextResponse.json(question, { status: 201 })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lectureId = searchParams.get('lectureId')
  if (!lectureId) return NextResponse.json({ message: 'lectureId مطلوب' }, { status: 400 })

  const questions = await prisma.question.findMany({
    where: { lectureId },
    include: { student: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(questions)
}