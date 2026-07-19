import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { role } = await req.json()
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) return NextResponse.json({ message: 'دور غير صالح' }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role },
  })
  return NextResponse.json(updated)
}