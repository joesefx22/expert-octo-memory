import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, 5) // 5 محاولات في الدقيقة
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { name, email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ message: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 12)
    // الدور دائمًا STUDENT، لا يمكن اختياره
    await prisma.user.create({
      data: { name, email, password: hashed, role: 'STUDENT' },
    })
    return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'خطأ داخلي' }, { status: 500 })
  }
}