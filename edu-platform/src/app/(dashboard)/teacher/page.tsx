import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import GenerateCodesModal from '@/components/GenerateCodesModal'

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)
  const teacherId = session?.user.id!

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: { _count: { select: { modules: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">كورساتي</h1>
        <Link href="/teacher/create-course" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl shadow hover:bg-primary-700">
          ➕ كورس جديد
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow p-6 flex flex-col">
            <h3 className="font-bold text-lg mb-2">{course.title}</h3>
            <p className="text-sm text-gray-500">{course._count.modules} وحدات</p>
            <div className="mt-4 flex gap-2">
              <Link href={`/teacher/course/${course.id}`} className="flex-1 py-2 bg-primary-100 text-primary-700 text-center rounded-lg text-sm font-medium">
                إدارة
              </Link>
              <GenerateCodesModal courseId={course.id} courseTitle={course.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TeacherAddLecture from '@/components/TeacherAddLecture'
import TeacherAnswerQuestion from '@/components/TeacherAnswerQuestion'
import GenerateCodesModal from '@/components/GenerateCodesModal'
import AddAssignmentModal from '@/components/AddAssignmentModal'
import TeacherLecturesList from '@/components/TeacherLecturesList'

// داخل الصفحة بعد جلب البيانات:
<section className="bg-white rounded-2xl shadow-lg p-6">
  <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">محاضراتك</h2>
  {lectures.length === 0 ? (
    <p className="text-gray-500">لا توجد محاضرات بعد</p>
  ) : (
    <TeacherLecturesList lectures={lectures} />
  )}
</section>


// في teacher/page.tsx، داخل الخريطة على lectures:
<div key={lecture.id} className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-blue-300 flex flex-col">
  <Link href={`/lecture/${lecture.id}`} className="flex-1">
    <h3 className="font-semibold text-gray-900 text-lg truncate">{lecture.title}</h3>
    <div className="text-sm text-gray-600 mt-1">
      {Math.floor(lecture.duration / 60)} دقيقة · {lecture.isFree ? 'مجاني' : 'مدفوع'}
    </div>
    <div className="flex gap-4 mt-2 text-xs text-gray-500">
      <span>{lecture._count.assignments} واجب</span>
      <span>{lecture._count.codes} كود</span>
    </div>
  </Link>
  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
    <GenerateCodesModal lectureId={lecture.id} lectureTitle={lecture.title} />
    <AddAssignmentModal lectureId={lecture.id} />
  </div>
</div>



export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)
  const teacherId = session?.user.id!

  // إحصائيات
  const lectureCount = await prisma.lecture.count({ where: { teacherId } })
  const studentCount = await prisma.submission.groupBy({
    by: ['studentId'],
    where: { assignment: { lecture: { teacherId } } },
  }).then(rows => rows.length)

  // المحاضرات
  const lectures = await prisma.lecture.findMany({
    where: { teacherId },
    include: {
      _count: { select: { assignments: true, codes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // الأسئلة غير المجاب عليها
  const unansweredQuestions = await prisma.question.findMany({
    where: { lecture: { teacherId }, reply: null },
    include: { student: true, lecture: true },
    orderBy: { createdAt: 'desc' },
  })

  // آخر الواجبات المسلمة
  const submissions = await prisma.submission.findMany({
    where: { assignment: { lecture: { teacherId } } },
    include: { student: true, assignment: { include: { lecture: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          أهلاً بك، أستاذ {session?.user.name}
        </h1>
        <TeacherAddLecture />
      </div>

      {/* بطاقات إحصائية فاخرة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{lectureCount}</div>
          <div className="text-blue-800 font-medium">محاضرة مسجلة</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-lg p-6 border border-amber-200">
          <div className="text-3xl font-bold text-amber-600">{studentCount}</div>
          <div className="text-amber-800 font-medium">طالب شاهدوا محاضراتك</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-lg p-6 border border-emerald-200">
          <div className="text-3xl font-bold text-emerald-600">{submissions.length}</div>
          <div className="text-emerald-800 font-medium">تسليم واجب حديث</div>
        </div>
      </div>

      {/* المحاضرات الخاصة بك */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">محاضراتك</h2>
        {lectures.length === 0 ? (
          <p className="text-gray-500">لا توجد محاضرات بعد</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lectures.map((lecture) => (
              <Link key={lecture.id} href={`/lecture/${lecture.id}`}
                    className="block bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-blue-300">
                <h3 className="font-semibold text-gray-900 text-lg truncate">{lecture.title}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  {Math.floor(lecture.duration / 60)} دقيقة · {lecture.isFree ? 'مجاني' : 'مدفوع'}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{lecture._count.assignments} واجب</span>
                  <span>{lecture._count.codes} كود شراء</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* أسئلة الطلاب بانتظار الرد */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">أسئلة بانتظار ردك</h2>
        {unansweredQuestions.length === 0 ? (
          <p className="text-gray-500">لا توجد أسئلة معلقة</p>
        ) : (
          <div className="space-y-4">
            {unansweredQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">{q.student.name || 'طالب'}</span>
                    <span className="text-xs text-gray-500">{q.lecture?.title}</span>
                  </div>
                  <p className="text-gray-700 mt-1">{q.content}</p>
                </div>
                <TeacherAnswerQuestion questionId={q.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* آخر التصحيحات */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">آخر تسليمات الواجبات</h2>
        {submissions.length === 0 ? (
          <p className="text-gray-500">لا توجد تسليمات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الطالب</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الواجب</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">المحاضرة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">التقييم</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الإجراء</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{sub.student.name}</td>
                    <td className="px-4 py-3">{sub.assignment.title}</td>
                    <td className="px-4 py-3">{sub.assignment.lecture.title}</td>
                    <td className="px-4 py-3">
                      {sub.score != null ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sub.score}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          غير مصحح
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/teacher/submissions/${sub.id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        تصحيح ✨
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}