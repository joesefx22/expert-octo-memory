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
    return NextResponse.json({ message: 'معطيات خاطئة: الحد الأقصى 500 كود' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, teacherId: true, title: true }
  })
  if (!course) return NextResponse.json({ message: 'الكورس غير موجود' }, { status: 404 })
  if (session.user.role !== 'ADMIN' && course.teacherId !== session.user.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
  }

  // 1. توليد الأكواد الفريدة في الذاكرة
  const newCodes = new Set<string>()
  while (newCodes.size < count) {
    newCodes.add(generateRandomCode(8))
  }
  let codesArray = Array.from(newCodes)

  // 2. استعلام واحد لمعرفة الأكواد الموجودة مسبقاً
  const existingCodes = await prisma.code.findMany({
    where: { code: { in: codesArray } },
    select: { code: true }
  })
  const existingSet = new Set(existingCodes.map(c => c.code))
  codesArray = codesArray.filter(c => !existingSet.has(c))

  // 3. تعويض الأكواد المكررة (إن وجدت)
  while (codesArray.length < count) {
    const fallback = generateRandomCode(8)
    if (!existingSet.has(fallback) && !codesArray.includes(fallback)) {
      codesArray.push(fallback)
    }
  }

  // 4. إدراج جماعي
  await prisma.code.createMany({
    data: codesArray.map(code => ({ code, courseId })),
    skipDuplicates: true
  })

  return NextResponse.json({
    message: 'تم توليد الأكواد بنجاح',
    count,
    courseId,
    codes: codesArray // يمكن استخدامها لإنشاء PDF في الواجهة الأمامية
  }, { status: 201 })
}