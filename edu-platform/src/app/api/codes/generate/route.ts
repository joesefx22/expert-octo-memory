import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRandomCode } from '@/lib/utils'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { courseId, count } = await req.json()
  if (!courseId || !count || count < 1 || count > 500) {
    return NextResponse.json({ message: 'معطيات خاطئة' }, { status: 400 })
  }

  // التحقق من ملكية الكورس (للمدرس)
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ message: 'الكورس غير موجود' }, { status: 404 })
  if (session.user.role !== 'ADMIN' && course.teacherId !== session.user.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    let code = generateRandomCode(8)
    while (await prisma.code.findUnique({ where: { code } })) {
      code = generateRandomCode(8)
    }
    await prisma.code.create({ data: { code, courseId } })
    codes.push(code)
  }

  // توليد PDF (اختياري)
  const pdfBuffer = await generateCodesPDF(course.title, codes) // سننشئ هذه الدالة لاحقًا

  return NextResponse.json({ codes, pdfUrl: `/api/codes/pdf?courseId=${courseId}` }, { status: 201 })
}

// سنحتاج إلى دالة generateCodesPDF، لكن يمكنك استخدام مكون CodePDF القديم مع تعديل بسيط
// سأضيف مسار pdf لاحقًا