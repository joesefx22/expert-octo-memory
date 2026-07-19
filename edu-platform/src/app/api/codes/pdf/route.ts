import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import CodePDF from '@/components/CodePDF'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ message: 'courseId مطلوب' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ message: 'كورس غير موجود' }, { status: 404 })
  if (session.user.role !== 'ADMIN' && course.teacherId !== session.user.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  const codes = await prisma.code.findMany({
    where: { courseId, isUsed: false },
    select: { code: true },
  })

  const codeList = codes.map(c => c.code)
  const buffer = await renderToBuffer(<CodePDF codes={codeList} courseTitle={course.title} />)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="codes-${course.title}.pdf"`,
    },
  })
}