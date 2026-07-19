import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const { title, description, isFree, price } = await req.json()
  const course = await prisma.course.create({
    data: {
      title,
      description,
      isFree,
      price: isFree ? null : price,
      teacherId: session.user.id,
    },
  })
  return NextResponse.json(course, { status: 201 })
}