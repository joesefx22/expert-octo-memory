import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ModuleList from '@/components/teacher/ModuleList'
import AddModuleModal from '@/components/teacher/AddModuleModal'
import AddLessonModal from '@/components/teacher/AddLessonModal'
import GenerateCodesModal from '@/components/GenerateCodesModal'
import Link from 'next/link'

export default async function TeacherCoursePage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) redirect('/')

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
  if (session.user.role !== 'ADMIN' && course.teacherId !== session.user.id) redirect('/')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-500">{course.isFree ? 'مجاني' : `$${course.price}`}</p>
        </div>
        <div className="flex gap-3">
          <GenerateCodesModal courseId={course.id} courseTitle={course.title} />
          <AddModuleModal courseId={course.id} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">الوحدات والدروس</h2>
        {course.modules.length === 0 ? (
          <p className="text-gray-500">لا توجد وحدات بعد. أضف واحدة.</p>
        ) : (
          course.modules.map(mod => (
            <div key={mod.id} className="border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{mod.title}</h3>
                <AddLessonModal moduleId={mod.id} moduleTitle={mod.title} />
              </div>
              {mod.lessons.length === 0 ? (
                <p className="text-gray-400 text-sm mt-2">لا توجد دروس في هذه الوحدة</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {mod.lessons.map(lesson => (
                    <li key={lesson.id} className="flex items-center gap-2 text-sm">
                      <span>{lesson.type === 'VIDEO' ? '🎥' : lesson.type === 'QUIZ' ? '❓' : '📄'}</span>
                      <span>{lesson.title}</span>
                      {lesson.type === 'VIDEO' && lesson.videoId && (
                        <span className="text-green-600 text-xs">(فيديو مرفوع)</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}