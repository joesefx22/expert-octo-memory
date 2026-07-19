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

سنضيف استعلامات لتجميع البيانات، ثم نمررها إلى الكارت. بدلاً من تعديل المكون الخادم ليصبح عميل، سنقوم بجلب هذه الأرقام في الصفحة الأم (الرئيسية أو صفحة الكورسات) وإرسالها.

تحديث src/app/page.tsx و src/app/courses/page.tsx:
في الصفحتين، عدّل استعلام prisma.course.findMany ليتضمن:

ts
include: {
  teacher: { select: { name: true } },
  _count: { select: { modules: true } },
  codes: {
    where: { isUsed: true },
    select: { userId: true, purchasedAt: true }
  }
}
ثم قم بمعالجة البيانات لاستخراج عدد الطلاب (عدد userId الفريد) ونسبة الإكمال (يمكن حسابها من جدول Progress لكنها عملية مكلفة لكل كورس، لذلك MVP سنعتمد على عدد المشتريات فقط، أو نعرض عبارة "طلاب مسجلين"). سنعرض عدد الطلاب الذين اشتروا الكورس فقط، ونسبة الإكمال سنتركها للمرحلة الثانية (أو نعرض "—"). إذا أردت نسبة الإكمال فعلاً، نحتاج إلى استعلام مجمع، لكني سأضيفه للتوضيح.

سأقوم بإنشاء مكون CourseCard يقبل خصائص إضافية: studentCount و averageProgress (اختياري). وفي الصفحة نمررها.

const coursesWithCount = await Promise.all(
  courses.map(async (course) => {
    const studentCount = await prisma.code.count({
      where: { courseId: course.id, isUsed: true, userId: { not: null } }
    })
    return { ...course, studentCount }
  })
)