import { prisma } from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'
import CourseCard from '@/components/CourseCard'

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { modules: true } },
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir="rtl">
      <header className="py-16 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 mb-6">
          منصة التعلم الذكية
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          استكشف كورسات احترافية مع محاضرات وامتحانات تفاعلية وتتبع تقدمك.
        </p>
        <SearchBar />
      </header>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">أحدث الكورسات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {courses.length === 0 && (
          <p className="text-center text-gray-500">لا توجد كورسات حالياً.</p>
        )}
      </section>
    </div>
  )
}