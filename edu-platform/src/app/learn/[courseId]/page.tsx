import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import ModuleAccordion from '@/components/ModuleAccordion'

export default async function LearnPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') redirect('/login')

  // التحقق من امتلاك الكورس
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })
  if (!course) notFound()

  // صلاحية الوصول
  const access = course.isFree
    ? true
    : !!(await prisma.code.findFirst({
        where: { courseId: course.id, userId: session.user.id, isUsed: true },
      }))

  if (!access) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold">غير مصرح</h2>
          <p className="text-gray-600">يجب شراء الكورس أولاً.</p>
        </div>
      </div>
    )
  }

  // تقدم الطالب
  const progresses = await prisma.progress.findMany({
    where: { userId: session.user.id, courseId: course.id },
  })
  const completedLessonIds = new Set(progresses.filter(p => p.completed).map(p => p.lessonId))

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{course.title}</h1>
        {course.modules.map((mod) => (
          <ModuleAccordion
            key={mod.id}
            module={mod}
            completedLessonIds={completedLessonIds}
          />
        ))}
      </div>
    </div>
  )
}