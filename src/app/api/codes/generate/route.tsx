import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRandomCode } from '@/lib/utils'
import { renderToBuffer } from '@react-pdf/renderer'
import CodePDF from '@/components/CodePDF'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { courseId, count } = await req.json()
  if (!courseId || !count || count < 1 || count > 500) {
    return NextResponse.json({ message: 'معطيات خاطئة' }, { status: 400 })
  }

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

  // استخدام CodePDF كدالة مباشرة (بدون JSX)
  const pdfBuffer = await renderToBuffer(
    CodePDF({ codes, courseTitle: course.title })
  )

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="codes-${course.title}.pdf"`,
    },
  })
}
