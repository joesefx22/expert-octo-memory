import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AnalyticsCharts from '@/components/teacher/AnalyticsCharts'

export default async function TeacherAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') redirect('/')

  const cookieStore = cookies()
  const cookieString = cookieStore.toString()

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/teacher`, {
    headers: { Cookie: cookieString },
  })
  const data = await res.json()

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">لوحة التحليلات</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="الكورسات" value={data.totalCourses} color="blue" />
        <StatCard title="الطلاب" value={data.totalStudents} color="amber" />
        <StatCard title="الدروس" value={data.totalLessons} color="emerald" />
      </div>
      <AnalyticsCharts data={data} />
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-6 text-white`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-white/80 text-sm mt-1">{title}</div>
    </div>
  )
}