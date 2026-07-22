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

  // ✅ Paymob HMAC: تجميع الحقول المطلوبة بالترتيب الأبجدي
  const hmacString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ].join('')

  const calculatedHmac = crypto.createHmac('sha256', secret).update(hmacString).digest('hex')

  // مقارنة آمنة لمنع هجمات التوقيت
  const calculatedBuffer = Buffer.from(calculatedHmac)
  const receivedBuffer = Buffer.from(receivedHmac)
  if (receivedBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
  }

  if (obj.success === true) {
    const paymobOrderId = obj.order.id.toString()
    const payment = await prisma.payment.findFirst({ where: { paymobOrderId } })

    if (payment && payment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      })

      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        update: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        create: {
          userId: payment.userId,
          courseId: payment.courseId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

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