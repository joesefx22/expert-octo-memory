import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import QuizForm from '@/components/QuizForm'
import ProgressUpdater from '@/components/ProgressUpdater'
import PrerequisiteLock from '@/components/course/PrerequisiteLock'
import { getLessonLockStatus } from '@/lib/locking'

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') redirect('/login')

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: { include: { course: true } },
      quiz: { include: { questions: true } },
      documents: true,
    },
  })
  if (!lesson) notFound()

  const course = lesson.module.course
  // التحقق من الصلاحية (إما مجاني أو لديه كود مستخدم)
  const access = course.isFree
    ? true
    : !!(await prisma.code.findFirst({
        where: { courseId: course.id, userId: session.user.id, isUsed: true },
      }))
  if (!access) redirect(`/courses/${course.id}`)

  // حالة القفل
  const lockStatus = await getLessonLockStatus(params.lessonId, session.user.id, params.courseId)

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>

        {lockStatus.isLocked ? (
          <PrerequisiteLock {...lockStatus} />
        ) : (
          <>
            {lesson.type === 'VIDEO' && lesson.videoId && (
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
                <VideoPlayer lessonId={lesson.id} />
              </div>
            )}

            {lesson.documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="font-bold mb-2">الملفات المرفقة</h3>
                <ul className="space-y-2">
                  {lesson.documents.map(doc => (
                    <li key={doc.id}>
                      <a href={doc.url} target="_blank" className="text-primary-600 underline">{doc.url}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.type === 'QUIZ' && lesson.quiz && (
              <QuizForm quiz={lesson.quiz} lessonId={lesson.id} />
            )}

            <ProgressUpdater
              lessonId={lesson.id}
              courseId={course.id}
              alreadyCompleted={progress?.completed ?? false}
            />
          </>
        )}
      </div>
    </div>
  )
}