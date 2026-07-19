import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import CourseCard from '@/components/CourseCard'

export default async function HomePage() {
  // نجلب بعض الكورسات المميزة (آخر 6)
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