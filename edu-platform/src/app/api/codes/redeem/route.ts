import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 })

  const { code, courseId } = await req.json()
  if (!code || !courseId) return NextResponse.json({ message: 'الكود ومعرف الكورس مطلوبان' }, { status: 400 })

  const normalized = code.toUpperCase().trim()
  const codeRecord = await prisma.code.findUnique({ where: { code: normalized } })
  if (!codeRecord) return NextResponse.json({ message: 'كود غير صالح' }, { status: 404 })
  if (codeRecord.isUsed) return NextResponse.json({ message: 'هذا الكود مستخدم بالفعل' }, { status: 400 })
  if (codeRecord.courseId !== courseId) return NextResponse.json({ message: 'الكود لا يخص هذا الكورس' }, { status: 400 })

  // تحديث الكود
  await prisma.code.update({
    where: { id: codeRecord.id },
    data: {
      isUsed: true,
      userId: session.user.id,
      purchasedAt: new Date(),
    },
  })

  // إنشاء أو تحديث التسجيل (Enrollment)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId: codeRecord.courseId } },
    update: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    create: {
      userId: session.user.id,
      courseId: codeRecord.courseId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // إرسال بريد إلكتروني (اختياري، يمكن إضافته لاحقاً)

  return NextResponse.json({ message: 'تم تفعيل الكود بنجاح', courseId: codeRecord.courseId })
}