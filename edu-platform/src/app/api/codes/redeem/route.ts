import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 })

  // ✅ حماية من التخمين الآلي
  const rateLimitRes = await checkRateLimit(req, 'code_redemption')
  if (rateLimitRes) return rateLimitRes

  const { code, courseId } = await req.json()
  if (!code || !courseId) return NextResponse.json({ message: 'الكود ومعرف الكورس مطلوبان' }, { status: 400 })

  const normalized = code.toUpperCase().trim()

  // ✅ تحديث ذري يمنع الـ Race Condition تماماً
  const updateResult = await prisma.code.updateMany({
    where: {
      code: normalized,
      courseId: courseId,
      isUsed: false, // لن يتم التحديث إلا لو كان الكود صالحاً وغير مستخدم
    },
    data: {
      isUsed: true,
      userId: session.user.id,
      purchasedAt: new Date(),
    },
  })

  if (updateResult.count === 0) {
    return NextResponse.json({ message: 'الكود غير صالح أو مستخدم بالفعل' }, { status: 400 })
  }

  // الآن نمنح التسجيل
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId: courseId } },
    update: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    create: {
      userId: session.user.id,
      courseId: courseId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return NextResponse.json({ message: 'تم تفعيل الكود بنجاح', courseId })
}