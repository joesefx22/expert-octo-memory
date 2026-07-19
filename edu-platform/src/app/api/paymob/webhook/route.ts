import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json()
  const { order, success } = body.obj // يعتمد على هيكل Paymob الحقيقي

  if (success) {
    // تحديث حالة الدفع إلى COMPLETED
    await prisma.payment.updateMany({
      where: { paymobOrderId: order.id.toString() },
      data: { status: 'COMPLETED' },
    })

    // إنشاء كود تلقائي للطالب (أو تسجيله في Progress)
    const payment = await prisma.payment.findFirst({ where: { paymobOrderId: order.id.toString() } })
    if (payment) {
      await prisma.code.create({
        data: {
          code: `PAY-${payment.id}`,
          courseId: payment.courseId,
          isUsed: true,
          userId: payment.userId,
          purchasedAt: new Date(),
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
// في api/paymob/webhook/route.ts بعد التأكد من signature
await prisma.enrollment.upsert({
  where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
  update: {}, // أو تمديد
  create: {
    userId: payment.userId,
    courseId: payment.courseId,
    // يمكن وضع expiresAt إذا كان الاشتراك بمدة معينة
  },
})
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.text()
  const receivedHmac = req.headers.get('x-hmac-sha256')

  // تحقق من التوقيع (ضع المفتاح السري من حساب Paymob هنا)
  const secret = process.env.PAYMOB_HMAC_SECRET!
  const calculatedHmac = crypto.createHmac('sha256', secret).update(body).digest('hex')

  if (receivedHmac !== calculatedHmac) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
  }

  const parsedBody = JSON.parse(body)
  const { obj } = parsedBody // obj.order.id, obj.success

  if (obj.success === true) {
    const paymobOrderId = obj.order.id.toString()
    const payment = await prisma.payment.findFirst({
      where: { paymobOrderId },
    })

    if (payment && payment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      })

      // تسجيل الطالب في الكورس
      await prisma.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      })

      // إرسال إشعار للطالب
      await sendNotification(payment.userId, 'تم شراء الكورس بنجاح! 🎉')
    }
  }

  return NextResponse.json({ received: true })
}
import crypto from 'crypto'

// ... داخل POST بعد الحصول على body و receivedHmac

const secret = process.env.PAYMOB_HMAC_SECRET!
const calculatedHmac = crypto.createHmac('sha256', secret).update(body).digest('hex')

// استخدام timing safe comparison
const calculatedBuffer = Buffer.from(calculatedHmac)
const receivedBuffer = Buffer.from(receivedHmac || '')
if (receivedBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)) {
  return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
}