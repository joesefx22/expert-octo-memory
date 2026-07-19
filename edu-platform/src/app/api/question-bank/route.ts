import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const tag = searchParams.get('tag')
  const difficulty = searchParams.get('difficulty')

  const where: any = { teacherId: session.user.id }
  if (courseId) where.courseId = courseId
  if (tag) where.tags = { has: tag }
  if (difficulty) where.difficulty = parseInt(difficulty)

  const questions = await prisma.questionBank.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(questions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { text, type, options, answer, tags, difficulty, courseId } = await req.json()

  const question = await prisma.questionBank.create({
    data: {
      text,
      type,
      options: options || [],
      answer,
      tags: tags || [],
      difficulty: difficulty || 1,
      teacherId: session.user.id,
      courseId: courseId || null,
    },
  })

  return NextResponse.json(question, { status: 201 })
}