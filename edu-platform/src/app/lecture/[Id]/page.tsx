import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AccessChecker from '@/components/AccessChecker'

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      teacher: { select: { name: true } },
      modules: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { modules: true } },
    },
  })
  if (!course) notFound()

  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session
  const role = session?.user.role

  // إجمالي عدد الدروس
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)

  // إذا كان المستخدم طالبًا، نتحقق من الصلاحية والتقدم
  let purchased = false
  let progressPercent = 0
  let lastLessonId: string | null = null

  if (isLoggedIn && role === 'STUDENT') {
    // هل اشترى الكورس؟ (عن طريق كود أو أنه مجاني)
    const access = await prisma.code.findFirst({
      where: { courseId: course.id, userId: session.user.id, isUsed: true },
    })
    // إذا كان الكورس مجانيًا فيعتبر مفعّلًا تلقائياً
    purchased = access ? true : course.isFree

    if (purchased) {
      const completed = await prisma.progress.count({
        where: { userId: session.user.id, courseId: course.id, completed: true },
      })
      progressPercent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

      // آخر درس لم يكتمل (لزر "أكمل الدراسة")
      const lastProgress = await prisma.progress.findFirst({
        where: { userId: session.user.id, courseId: course.id },
        orderBy: { completedAt: 'desc' },
        include: { lesson: { select: { id: true, order: true } } },
      })

      if (lastProgress) {
        // البحث عن الدرس التالي
        const allLessons = course.modules.flatMap(m => m.lessons).sort((a,b) => a.order - b.order)
        const nextLesson = allLessons.find(l => l.order > lastProgress.lesson.order)
        lastLessonId = nextLesson ? nextLesson.id : lastProgress.lesson.id
      } else {
        // لم يبدأ بعد، أول درس
        if (totalLessons > 0) {
          const firstMod = course.modules[0]
          if (firstMod) lastLessonId = firstMod.lessons[0]?.id
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الشريط الجانبي الأيمن: تفاصيل الكورس */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-gray-500 mt-2">{course.teacher.name || 'مدرس'}</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>المدة</span>
                <span>{totalLessons} درس</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الوحدات</span>
                <span>{course._count.modules}</span>
              </div>
              <div className="text-2xl font-bold text-center text-primary-600">
                {course.isFree ? 'مجاني' : `$${course.price}`}
              </div>

              {isLoggedIn && role === 'STUDENT' ? (
                purchased ? (
                  <div>
                    <Link href={`/learn/${course.id}`} className="block w-full py-3 bg-primary-600 text-white text-center rounded-xl font-bold hover:bg-primary-700 transition">
                      أكمل الدراسة
                    </Link>
                    {progressPercent > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        تقدمك: {progressPercent}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href={`/code?courseId=${course.id}`} className="block w-full py-3 bg-emerald-600 text-white text-center rounded-xl font-bold hover:bg-emerald-700 transition">
                      إدخال كود شراء
                    </Link>
                  </div>
                )
              ) : (
                <Link href="/login" className="block w-full py-3 bg-primary-600 text-white text-center rounded-xl font-bold">
                  سجل الدخول للشراء
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي: وصف ومحتويات الكورس */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-3">وصف الكورس</h2>
            <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">محتويات الكورس</h2>
            {course.modules.map((mod) => (
              <details key={mod.id} className="group mb-2 border border-gray-200 rounded-xl p-3">
                <summary className="cursor-pointer font-semibold text-gray-800 list-none flex justify-between items-center">
                  {mod.title}
                  <span className="text-xs text-gray-500">{mod.lessons.length} دروس</span>
                </summary>
                <ul className="mt-3 space-y-2 pr-4">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-primary-500">{lesson.type === 'VIDEO' ? '🎥' : lesson.type === 'QUIZ' ? '❓' : '📄'}</span>
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import MCQForm from '@/components/MCQForm'
import QuestionBox from '@/components/QuestionBox'
import AccessStatus from '@/components/AccessStatus'
import { checkAccess } from '@/lib/access'

export default async function LecturePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const lecture = await prisma.lecture.findUnique({
    where: { id: params.id },
    include: { assignments: true },
  })
  if (!lecture) notFound()

  // التحقق من الصلاحية باستخدام الدالة الموحدة
  const access = await checkAccess(lecture, session.user.id, session.user.role)

  // إذا كان الطالب غير مسموح له، نعرض له رسالة مناسبة
  if (!access.allowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">غير مصرح</h2>
          <p className="text-gray-600 mb-6">{access.reason || 'لا يمكنك مشاهدة هذه المحاضرة'}</p>
          <a
            href="/code"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition"
          >
            إدخال كود الشراء
          </a>
        </div>
      </div>
    )
  }

  // إذا كان الطالب قد اشترى المحاضرة وكانت المدة المتبقية محددة
  let remainingSeconds = access.remainingSeconds

  // جلب التسليمات السابقة (للطلاب)
  let submissions: any[] = []
  if (session.user.role === 'STUDENT') {
    const assignmentIds = lecture.assignments.map(a => a.id)
    submissions = await prisma.submission.findMany({
      where: { studentId: session.user.id, assignmentId: { in: assignmentIds } },
      include: { assignment: true },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* عنوان المحاضرة + حالة الوصول */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lecture.title}</h1>
          {lecture.description && <p className="mt-2 text-gray-600">{lecture.description}</p>}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span>المدة: {Math.floor(lecture.duration / 60)} دقيقة</span>
            {/* عرض حالة الوصول للطالب */}
            {session.user.role === 'STUDENT' && !lecture.isFree && (
              <AccessStatus remainingSeconds={remainingSeconds} />
            )}
          </div>
        </div>

        {/* مشغل الفيديو (فاخر مثل يوتيوب) */}
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
          <VideoPlayer lectureId={lecture.id} />
        </div>

        {/* أدوات المدرس السريعة */}
        {(session.user.role === 'TEACHER' || session.user.role === 'ADMIN') && (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap gap-4">
            <h3 className="w-full text-lg font-bold">أدوات المدرس</h3>
            <GenerateCodesModal lectureId={lecture.id} lectureTitle={lecture.title} />
            <AddAssignmentModal lectureId={lecture.id} />
          </div>
        )}

        {/* الواجبات */}
        {session.user.role === 'STUDENT' && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">الواجبات والاختبارات</h2>
            {lecture.assignments.map((assignment) => {
              const existing = submissions.find(s => s.assignmentId === assignment.id)
              return (
                <MCQForm
                  key={assignment.id}
                  assignment={assignment}
                  existingSubmission={existing}
                />
              )
            })}
            {lecture.assignments.length === 0 && (
              <p className="text-gray-500">لا توجد واجبات لهذه المحاضرة بعد.</p>
            )}
          </section>
        )}

        {/* صندوق الأسئلة */}
        {session.user.role === 'STUDENT' && (
          <QuestionBox lectureId={lecture.id} />
        )}
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import MCQForm from '@/components/MCQForm'
import QuestionBox from '@/components/QuestionBox'
import GenerateCodesModal from '@/components/GenerateCodesModal'
import AddAssignmentModal from '@/components/AddAssignmentModal'

async function getLecture(id: string) {
  return prisma.lecture.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          submissions: {
            where: { studentId: 'session.user.id' }, // will override later
          },
        },
      },
    },
  })
}

export default async function LecturePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const lecture = await prisma.lecture.findUnique({
    where: { id: params.id },
    include: {
      assignments: true,
    },
  })

  if (!lecture) notFound()

  // Verify access: either free, or user has purchased code for this lecture
  const hasAccess = lecture.isFree || (session.user.role !== 'STUDENT') ||
    (await prisma.code.findFirst({
      where: { lectureId: lecture.id, userId: session.user.id, isUsed: true },
    }))

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">غير مصرح</h2>
          <p className="text-gray-600 mb-6">يجب شراء كود للوصول إلى هذه المحاضرة.</p>
          <a href="/code" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
            إدخال كود الشراء
          </a>
        </div>
      </div>
    )
  }

  // Fetch submissions separately for student
  let submissions: any[] = []
  if (session.user.role === 'STUDENT') {
    const assignmentIds = lecture.assignments.map(a => a.id)
    submissions = await prisma.submission.findMany({
      where: {
        studentId: session.user.id,
        assignmentId: { in: assignmentIds },
      },
      include: { assignment: true },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* عنوان المحاضرة */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lecture.title}</h1>
          {lecture.description && <p className="mt-2 text-gray-600">{lecture.description}</p>}
          <div className="mt-2 text-sm text-gray-500">
            المدة: {Math.floor(lecture.duration / 60)} دقيقة
          </div>
        </div>

        {/* مشغل الفيديو */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
          <VideoPlayer lectureId={lecture.id} />
        </div>

        {/* الواجبات (MCQ) */}
        {session.user.role === 'STUDENT' && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">الواجبات والاختبارات</h2>
            {lecture.assignments.map((assignment) => {
              const existing = submissions.find(s => s.assignmentId === assignment.id)
              return (
                <MCQForm
                  key={assignment.id}
                  assignment={assignment}
                  existingSubmission={existing}
                />
              )
            })}
            {lecture.assignments.length === 0 && (
              <p className="text-gray-500">لا توجد واجبات لهذه المحاضرة بعد.</p>
            )}
          </section>
        )}

        {/* صندوق الأسئلة للطلاب */}
        {session.user.role === 'STUDENT' && (
          <QuestionBox lectureId={lecture.id} />
        )}
      </div>
    </div>
  )
}

// ... الكود الموجود ...

// بعد جزء "مشغل الفيديو" وقبل "الواجبات"، أضف:
{(session.user.role === 'TEACHER' || session.user.role === 'ADMIN') && (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap gap-4">
    <h3 className="w-full text-lg font-bold mb-2">أدوات المدرس</h3>
    <GenerateCodesModal lectureId={lecture.id} lectureTitle={lecture.title} />
    <AddAssignmentModal lectureId={lecture.id} />
  </div>
)}


2. إظهار المدة الإجمالية للكورس في صفحة الكورس (/courses/[courseId])
في صفحة الكورس، نضيف حساب مجموع duration لكل الدروس:

ts
const totalDuration = course.modules.reduce(
  (sum, mod) => sum + mod.lessons.reduce((s, les) => s + (les.duration || 0), 0),
  0
)
const totalHours = Math.floor(totalDuration / 3600)
const totalMinutes = Math.floor((totalDuration % 3600) / 60)
ثم نعرض في قسم "المدة" مثلاً: totalHours > 0 ?
t
o
t
a
l
H
o
u
r
s
س
totalHoursس{totalMinutes}د:${totalMinutes} دقيقة``.

أضف هذا السطر في ملف src/app/courses/[courseId]/page.tsx ضمن البيانات.