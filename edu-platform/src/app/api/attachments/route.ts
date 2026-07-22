import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 ميجابايت

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

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

  // ✅ حد أقصى للحجم (يمنع استهلاك الذاكرة)
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' }, { status: 400 })
  }

  const extension = getFileExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json({ message: 'نوع الملف غير مسموح به' }, { status: 400 })
  }

  const fileType = extension === '.pdf' ? 'PDF' : 'IMAGE'

  // ⚠️ يُفضّل استخدام Presigned URLs للرفع مباشرة إلى BunnyCDN بدلاً من المرور بالخادم
  const fileName = `attachments/${Date.now()}-${file.name}`
  // const uploadedUrl = await uploadToBunnyStorage(file, fileName)
  const uploadedUrl = 'https://storage.bunnycdn.com/...' // افتراضي

  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      url: uploadedUrl,
      type: fileType,
      size: file.size,
      lessonId: lessonId || null,
      moduleId: moduleId || null,
      courseId: courseId || null,
      uploadedBy: session.user.id,
    },
  })

  return NextResponse.json(attachment, { status: 201 })
}