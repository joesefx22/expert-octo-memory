import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnalyticsCharts from '@/components/teacher/AnalyticsCharts'

export default async function TeacherAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') redirect('/')

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/teacher`, {
    headers: { Cookie: req.headers.get('cookie') || '' },
  })
  const data = await res.json()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحليلات</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">الكورسات</h3>
          <p className="text-4xl font-bold text-primary-600">{data.totalCourses}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">الطلاب</h3>
          <p className="text-4xl font-bold text-primary-600">{data.totalStudents}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">الدروس</h3>
          <p className="text-4xl font-bold text-primary-600">{data.totalLessons}</p>
        </div>
      </div>
      <AnalyticsCharts data={data} />
    </div>
  )
}