import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CourseProgressCard from '@/components/student/CourseProgressCard'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id!

  // جلب التسجيلات (Enrollments) للطالب
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: { include: { lessons: true } },
          teacher: { select: { name: true } },
        },
      },
    },
  })

  // جلب الكورسات المجانية
  const freeCourses = await prisma.course.findMany({
    where: { isFree: true },
    include: {
      modules: { include: { lessons: true } },
      teacher: { select: { name: true } },
    },
  })

  // دمج الكورسات المشتراة والمجانية مع إزالة التكرار
  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId))
  const courses = [
    ...enrollments.map(e => e.course),
    ...freeCourses.filter(c => !enrolledCourseIds.has(c.id))
  ]

  // جلب نتائج الواجبات (إن وجدت) - يمكن تعديلها لاحقاً
  const submissions = await prisma.quizAnswer.findMany({
    where: { userId },
    include: { question: { include: { quiz: { include: { lesson: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">كورساتي</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseProgressCard key={course.id} course={course} userId={userId} />
        ))}
        {courses.length === 0 && <p className="text-gray-500">لا توجد كورسات حالياً.</p>}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">نتائج الاختبارات الأخيرة</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">السؤال</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدرس</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">إجابتك</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">صحيحة؟</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td className="px-4 py-3">{sub.question.text}</td>
                  <td className="px-4 py-3">{sub.question.quiz.lesson.title}</td>
                  <td className="px-4 py-3">{sub.answer}</td>
                  <td className="px-4 py-3">{sub.isCorrect ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}