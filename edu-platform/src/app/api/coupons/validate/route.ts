import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  // ✅ حماية من التخمين الآلي للكوبونات
  const rateLimitRes = await checkRateLimit(req, 'coupon_validation')
  if (rateLimitRes) return rateLimitRes

  const { code, courseId, amount } = await req.json()

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.isActive) return NextResponse.json({ message: 'كوبون غير صالح' }, { status: 404 })
  if (coupon.currentUses >= coupon.maxUses) return NextResponse.json({ message: 'انتهى عدد مرات الاستخدام' }, { status: 400 })
  if (new Date() > coupon.validUntil) return NextResponse.json({ message: 'انتهت صلاحية الكوبون' }, { status: 400 })
  if (coupon.courseId && coupon.courseId !== courseId) return NextResponse.json({ message: 'الكوبون لا يخص هذا الكورس' }, { status: 400 })
  if (coupon.minPurchase && amount < coupon.minPurchase) return NextResponse.json({ message: 'الحد الأدنى للشراء غير محقق' }, { status: 400 })

  const discountedAmount = coupon.discountType === 'PERCENTAGE'
    ? amount * (1 - coupon.discountValue / 100)
    : amount - coupon.discountValue

  return NextResponse.json({
    valid: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    originalAmount: amount,
    discountedAmount: Math.max(0, discountedAmount),
  })
}