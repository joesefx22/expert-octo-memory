import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAccess } from '@/lib/access'
import { generateBunnyToken } from '@/lib/bunny'

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

  // إضافة واترمارك باسم المستخدم وتاريخ اليوم
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })
  const watermark = {
    text: `${user?.name || user?.email || 'طالب'} - ${new Date().toLocaleDateString('ar-EG')}`,
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.7,
  }

  const url = generateBunnyToken(lesson.videoId, clientIp, watermark)
  return NextResponse.json({ url })
}
// ... داخل GET
const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })
const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
const watermarkText = `${user?.name || 'طالب'} | ${user?.email || ''} | ${today}`

// إحداثيات عشوائية بسيطة (يتغير كل ساعة)
const randomX = Math.floor(Math.random() * 80) + 10 // 10% to 90%
const randomY = Math.floor(Math.random() * 80) + 10
const watermark = {
  text: watermarkText,
  color: '#ffffff',
  fontSize: 14,
  opacity: 0.6,
  x: randomX,
  y: randomY,
  // Bunny يدعم أيضًا rotation (زاوية عشوائية)
  rotation: Math.floor(Math.random() * 30) - 15, // بين -15 و +15 درجة
}
import crypto from 'crypto'

function hashUserToPosition(userId: string) {
  const hash = crypto.createHash('sha256').update(userId).digest('hex')
  // استخرج قيم عددية من الـ hash
  const num1 = parseInt(hash.substring(0, 8), 16) // 0 - 0xFFFFFFFF
  const num2 = parseInt(hash.substring(8, 16), 16)
  const x = (num1 % 70) + 15 // 15% to 85%
  const y = (num2 % 70) + 15
  const rotation = ((num1 + num2) % 30) - 15 // -15 to +15
  return { x, y, rotation }
}

// ... داخل GET
const pos = hashUserToPosition(session.user.id)
const watermark = {
  text: watermarkText,
  color: '#ffffffCC',
  fontSize: 14,
  opacity: 0.65,
  x: pos.x,
  y: pos.y,
  rotation: pos.rotation,
}