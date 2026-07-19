import { prisma } from '@/lib/prisma'
import CourseCard from '@/components/CourseCard'
import SearchBar from '@/components/SearchBar'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { search?: string }
}) {
  const search = searchParams?.search || ''
  const where = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {}

  const courses = await prisma.course.findMany({
    where,
    include: {
      teacher: { select: { name: true } },
      _count: { select: { modules: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">الكورسات</h1>
        <div className="mb-8">
          <SearchBar />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {courses.length === 0 && (
          <p className="text-center text-gray-500">لا توجد كورسات تطابق بحثك.</p>
        )}
      </div>
    </div>
  )
}