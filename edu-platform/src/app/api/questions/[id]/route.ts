import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const question = await prisma.question.findUnique({ where: { id: params.id }, include: { lecture: true } })
  if (!question) return NextResponse.json({ message: 'غير موجود' }, { status: 404 })
  if (question.lecture?.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { reply } = await req.json()
  const updated = await prisma.question.update({ where: { id: params.id }, data: { reply } })
  return NextResponse.json(updated)
}