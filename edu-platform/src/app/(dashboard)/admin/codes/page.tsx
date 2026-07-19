import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminCodesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const codes = await prisma.code.findMany({
    include: { course: { select: { title: true } }, usedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة الأكواد</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right">الكود</th>
              <th className="px-4 py-3 text-right">الكورس</th>
              <th className="px-4 py-3 text-right">مستخدم؟</th>
              <th className="px-4 py-3 text-right">المستخدم</th>
              <th className="px-4 py-3 text-right">تاريخ الشراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {codes.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono">{c.code}</td>
                <td className="px-4 py-3">{c.course.title}</td>
                <td className="px-4 py-3">{c.isUsed ? 'نعم' : 'لا'}</td>
                <td className="px-4 py-3">{c.usedBy?.name || '—'}</td>
                <td className="px-4 py-3">{c.purchasedAt ? new Date(c.purchasedAt).toLocaleDateString('ar-EG') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}