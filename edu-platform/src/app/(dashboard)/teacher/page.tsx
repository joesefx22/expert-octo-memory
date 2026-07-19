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