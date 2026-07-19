import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAccess } from '@/lib/access'
import { generateBunnyToken } from '@/lib/bunny'
import crypto from 'crypto'

function hashUserToPosition(userId: string, courseId: string) {
  const hash = crypto.createHash('sha256').update(userId + courseId).digest('hex')
  const num1 = parseInt(hash.substring(0, 8), 16)
  const num2 = parseInt(hash.substring(8, 16), 16)
  const x = (num1 % 70) + 15   // 15% to 85%
  const y = (num2 % 70) + 15
  const rotation = ((num1 + num2) % 30) - 15 // -15 to +15 degrees
  return { x, y, rotation }
}

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { module: { include: { course: true } } },
  })
  if (!lesson?.videoId) return NextResponse.json({ message: 'لا يوجد فيديو' }, { status: 404 })

  const course = lesson.module.course
  const access = await checkAccess(course, session.user.id, session.user.role)
  if (!access.allowed) return NextResponse.json({ message: access.reason }, { status: 403 })

  const forwarded = req.headers.get('x-forwarded-for')
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : undefined

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })
  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  const watermarkText = `${user?.name || 'طالب'} | ${user?.email || ''} | ${today}`

  const pos = hashUserToPosition(session.user.id, course.id)
  const watermark = {
    text: watermarkText,
    color: '#ffffffCC',
    fontSize: 14,
    opacity: 0.65,
    x: pos.x,
    y: pos.y,
    rotation: pos.rotation,
  }

  const url = generateBunnyToken(lesson.videoId, clientIp, watermark)
  return NextResponse.json({ url })
}