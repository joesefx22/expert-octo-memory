import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [totalStudents, totalTeachers, totalLectures, totalCodes, totalSubmissions] =
    await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.lecture.count(),
      prisma.code.count(),
      prisma.submission.count(),
    ])

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800">لوحة الإدارة</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="الطلاب" value={totalStudents} color="blue" />
        <StatCard title="المدرسين" value={totalTeachers} color="amber" />
        <StatCard title="المحاضرات" value={totalLectures} color="emerald" />
        <StatCard title="أكواد البيع" value={totalCodes} color="purple" />
        <StatCard title="الواجبات المسلمة" value={totalSubmissions} color="rose" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">آخر المستخدمين المسجلين</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الاسم</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">البريد</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدور</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name || '—'}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'ADMIN' ? 'مدير' : user.role === 'TEACHER' ? 'مدرس' : 'طالب'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: 'blue'|'amber'|'emerald'|'purple'|'rose' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    rose: 'from-rose-500 to-rose-600',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-5 text-white`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-white/80 text-sm mt-1">{title}</div>
    </div>
  )
}