import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const courses = await prisma.course.findMany({
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة الكورسات</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right">الكورس</th>
              <th className="px-6 py-3 text-right">المدرس</th>
              <th className="px-6 py-3 text-right">السعر</th>
              <th className="px-6 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id}>
                <td className="px-6 py-4">{course.title}</td>
                <td className="px-6 py-4">{course.teacher.name || '—'}</td>
                <td className="px-6 py-4">{course.isFree ? 'مجاني' : `$${course.price}`}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/courses/${course.id}`} className="text-primary-600 hover:underline">
                    إدارة
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}