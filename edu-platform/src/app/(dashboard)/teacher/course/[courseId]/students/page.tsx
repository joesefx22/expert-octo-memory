import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

export default async function CourseStudentsPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') redirect('/')

  const course = await prisma.course.findUnique({ where: { id: params.courseId } })
  if (!course) notFound()
  if (session.user.role !== 'ADMIN' && course.teacherId !== session.user.id) redirect('/')

  const students = await prisma.code.findMany({
    where: { courseId: params.courseId, isUsed: true },
    include: { usedBy: { select: { id: true, name: true, email: true } } },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">طلاب {course.title}</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right">الطالب</th>
              <th className="px-6 py-3 text-right">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right">تاريخ الشراء</th>
              <th className="px-6 py-3 text-right">حالة الصلاحية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4">{s.usedBy?.name || '—'}</td>
                <td className="px-6 py-4">{s.usedBy?.email}</td>
                <td className="px-6 py-4">{s.purchasedAt ? new Date(s.purchasedAt).toLocaleDateString('ar-EG') : '—'}</td>
                <td className="px-6 py-4">
                  {s.purchasedAt && new Date() > new Date(s.purchasedAt.getTime() + 7*24*60*60*1000) ? 'منتهية' : 'سارية'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}