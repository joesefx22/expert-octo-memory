import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { assignmentId, answers } = await req.json()
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) return NextResponse.json({ message: 'الواجب غير موجود' }, { status: 404 })

  // Check for existing submission
  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId: session.user.id },
  })
  if (existing) return NextResponse.json({ message: 'تم التسليم مسبقاً' }, { status: 400 })

  // Auto-score if teacher want? We'll leave score null for teacher review.
  const submission = await prisma.submission.create({
    data: { assignmentId, studentId: session.user.id, answers },
  })

  return NextResponse.json(submission, { status: 201 })
}