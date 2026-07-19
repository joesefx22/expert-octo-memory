import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { lectureId, title, questions, dueDate } = await req.json()
  if (!lectureId || !title || !questions) {
    return NextResponse.json({ message: 'بيانات ناقصة' }, { status: 400 })
  }

  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } })
  if (!lecture || (lecture.teacherId !== session.user.id && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const assignment = await prisma.assignment.create({
    data: { lectureId, title, questions, dueDate: dueDate ? new Date(dueDate) : null },
  })
  return NextResponse.json(assignment, { status: 201 })
}