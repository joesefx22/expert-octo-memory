import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.text()
  const receivedHmac = req.headers.get('x-hmac-sha256')
  const secret = process.env.PAYMOB_HMAC_SECRET

  if (!secret || !receivedHmac) {
    return NextResponse.json({ message: 'Missing signature or secret' }, { status: 400 })
  }

  const calculatedHmac = crypto.createHmac('sha256', secret).update(body).digest('hex')

  // استخدام timing safe comparison
  const calculatedBuffer = Buffer.from(calculatedHmac)
  const receivedBuffer = Buffer.from(receivedHmac)
  if (receivedBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
  }

  let parsedBody: any
  try {
    parsedBody = JSON.parse(body)
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { obj } = parsedBody
  if (!obj || !obj.order) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  if (obj.success === true) {
    const paymobOrderId = obj.order.id.toString()
    const payment = await prisma.payment.findFirst({ where: { paymobOrderId } })

    if (payment && payment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      })

      // إنشاء Enrollment للطالب
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        update: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        create: {
          userId: payment.userId,
          courseId: payment.courseId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      // إرسال إشعار داخلي للطالب
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          message: 'تم شراء الكورس بنجاح! 🎉',
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}