import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CourseProgressCard from '@/components/student/CourseProgressCard'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id!

  // جلب الكورسات المشتراة (عبر الأكواد) والمجانية
  const purchasedCodes = await prisma.code.findMany({
    where: { userId, isUsed: true },
    include: { course: { include: { modules: { include: { lessons: true } } } } },
  })

  // كورسات مجانية
  const freeCourses = await prisma.course.findMany({
    where: { isFree: true },
    include: { modules: { include: { lessons: true } } },
  })

  // دمج القوائم مع إزالة التكرار
  const purchasedCourses = purchasedCodes.map(c => c.course)
  const allCourses = [...purchasedCourses, ...freeCourses.filter(c => !purchasedCourses.some(p => p.id === c.id))]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">كورساتي</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCourses.map(course => (
          <CourseProgressCard key={course.id} course={course} userId={userId} />
        ))}
        {allCourses.length === 0 && <p className="text-gray-500">لا توجد كورسات حالياً.</p>}
      </div>
    </div>
  )
}
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id!

  // المحاضرات التي يمكن الوصول إليها (مجانية أو مشتراة وسارية)
  const userCodes = await prisma.code.findMany({
    where: { userId, isUsed: true },
    include: { lecture: true },
  })

  // المحاضرات المجانية
  const freeLectures = await prisma.lecture.findMany({
    where: { isFree: true },
  })

  // فلترة المشتريات السارية فقط
  const now = new Date()
  const activeCodes = userCodes.filter(code => {
    if (!code.purchasedAt) return true
    const expiry = new Date(code.purchasedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    return now <= expiry
  })

  const accessibleLectures = [
    ...activeCodes.map(c => c.lecture),
    ...freeLectures.filter(l => !activeCodes.some(c => c.lectureId === l.id)),
  ]

  // جلب قائمة المشتريات (للصلاحية)
  const purchases = userCodes.map(code => {
    let remainingSeconds = 0
    if (code.purchasedAt) {
      const expiry = new Date(code.purchasedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      remainingSeconds = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000))
    }
    return {
      ...code,
      remainingSeconds,
      expired: code.purchasedAt ? now > new Date(code.purchasedAt.getTime() + 7 * 24 * 60 * 60 * 1000) : false,
    }
  })

  // ... باقي الكود كما هو ...

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة الطالب</h1>

      {/* مشترياتي (صلاحية المحاضرات) */}
      {purchases.length > 0 && (
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">محاضراتي المشتراة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {purchases.map((p) => (
              <div key={p.id} className={`p-4 rounded-xl border ${p.expired ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-200'}`}>
                <Link href={`/lecture/${p.lecture.id}`} className="font-semibold text-gray-800">{p.lecture.title}</Link>
                <div className="text-sm mt-1">
                  {p.expired ? (
                    <span className="text-red-500">منتهية الصلاحية</span>
                  ) : (
                    <span className="text-blue-600">متبقي: <CountdownTimer seconds={p.remainingSeconds} /></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* محاضراتي المتاحة */}
      <section>
        <h2 className="text-xl font-semibold mb-3">محاضرات متاحة الآن</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessibleLectures.map((lecture) => (
            <Link key={lecture.id} href={`/lecture/${lecture.id}`}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-bold text-lg">{lecture.title}</h3>
              <p className="text-sm text-gray-500">{Math.floor(lecture.duration / 60)} دقيقة</p>
            </Link>
          ))}
          {accessibleLectures.length === 0 && <p className="text-gray-500">لا توجد محاضرات متاحة حالياً</p>}
        </div>
      </section>

      {/* نتائج الواجبات (كما هي) ... */}
    </div>
  )
}
import CountdownTimer from '@/components/CountdownTimer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  // Fetch lectures user has access to (via codes or free)
  const userCodes = await prisma.code.findMany({
    where: { userId },
    include: { lecture: true },
  })

  const freeLectures = await prisma.lecture.findMany({
    where: { isFree: true },
  })

  const accessibleLectures = [
    ...userCodes.map((c) => c.lecture),
    ...freeLectures.filter((l) => !userCodes.some((c) => c.lectureId === l.id)),
  ]

  // Submissions with feedback
  const submissions = await prisma.submission.findMany({
    where: { studentId: userId },
    include: { assignment: { include: { lecture: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة الطالب</h1>

      <section>
        <h2 className="text-xl font-semibold mb-3">محاضراتي</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessibleLectures.map((lecture) => (
            <Link
              key={lecture.id}
              href={`/lecture/${lecture.id}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg">{lecture.title}</h3>
              <p className="text-sm text-gray-500">
                {Math.floor(lecture.duration / 60)} دقيقة
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">نتائج الواجبات</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الواجب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحاضرة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النتيجة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.assignment.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.assignment.lecture.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.score != null ? `${sub.score}%` : 'غير مصحح'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.feedback || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
