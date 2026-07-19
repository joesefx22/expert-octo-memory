import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { score, feedback } = await req.json()
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { assignment: { include: { lecture: true } } },
  })
  if (!submission) return NextResponse.json({ message: 'غير موجود' }, { status: 404 })
  if (submission.assignment.lecture.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const updated = await prisma.submission.update({
    where: { id: params.id },
    data: { score, feedback },
  })
  return NextResponse.json(updated)
}