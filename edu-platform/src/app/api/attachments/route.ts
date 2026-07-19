import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const lessonId = formData.get('lessonId') as string
  const moduleId = formData.get('moduleId') as string
  const courseId = formData.get('courseId') as string

  if (!file) return NextResponse.json({ message: 'ملف مطلوب' }, { status: 400 })

  // رفع الملف إلى Bunny Storage (أو VPS)
  // هذا مثال مبسط، سنحتاج إلى تنفيذ الرفع الفعلي
  const fileName = `attachments/${Date.now()}-${file.name}`
  // const uploadedUrl = await uploadToBunnyStorage(file, fileName)
  const uploadedUrl = 'https://storage.bunnycdn.com/...' // افتراضي

  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      url: uploadedUrl,
      type: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
      size: file.size,
      lessonId: lessonId || null,
      moduleId: moduleId || null,
      courseId: courseId || null,
      uploadedBy: session.user.id,
    },
  })

  return NextResponse.json(attachment, { status: 201 })
}