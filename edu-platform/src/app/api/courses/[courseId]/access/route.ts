import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAccess } from '@/lib/access'

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const course = await prisma.course.findUnique({ where: { id: params.courseId } })
  if (!course) return NextResponse.json({ message: 'غير موجود' }, { status: 404 })

  const access = await checkAccess(course, session.user.id, session.user.role)
  return NextResponse.json(access)
}