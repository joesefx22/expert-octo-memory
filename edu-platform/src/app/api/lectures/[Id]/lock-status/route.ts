import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLessonLockStatus } from '@/lib/locking'

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ message: 'courseId مطلوب' }, { status: 400 })

  const status = await getLessonLockStatus(params.lessonId, session.user.id, courseId)
  return NextResponse.json(status)
}