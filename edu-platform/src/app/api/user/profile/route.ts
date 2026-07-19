import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true } })
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const { name, email, currentPassword, newPassword } = await req.json()
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ message: 'مستخدم غير موجود' }, { status: 404 })

  // إذا كان يريد تغيير كلمة المرور
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ message: 'كلمة المرور الحالية مطلوبة' }, { status: 400 })
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return NextResponse.json({ message: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })
  }

  // تحديث الاسم والبريد
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  })
  return NextResponse.json({ name: updated.name, email: updated.email })
}