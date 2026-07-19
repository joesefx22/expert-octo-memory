import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const { courseId } = await req.json()
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.isFree) return NextResponse.json({ message: 'كورس غير متاح' }, { status: 400 })

  // هنا يتم استدعاء Paymob API لإنشاء طلب دفع
  // سنقوم بمحاكاة بسيطة: إنشاء Payment بحالة PENDING وإرجاع رابط وهمي
  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      amount: course.price!,
      status: 'PENDING',
      paymobOrderId: 'simulated-order-123',
    },
  })

  const redirectUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/123456?payment_token=simulated_token`

  return NextResponse.json({ redirectUrl, paymentId: payment.id })
}