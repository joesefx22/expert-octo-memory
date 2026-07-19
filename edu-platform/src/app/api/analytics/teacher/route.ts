import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT')
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })

  const teacherId = session.user.id

  // إحصائيات عامة
  const [totalCourses, totalStudents, totalLessons] = await Promise.all([
    prisma.course.count({ where: { teacherId } }),
    prisma.enrollment.count({
      where: { course: { teacherId } },
    }),
    prisma.lesson.count({
      where: { module: { course: { teacherId } } },
    }),
  ])

  // أكثر 5 كورسات التحاقًا
  const topCourses = await prisma.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      title: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { enrollments: { _count: 'desc' } },
    take: 5,
  })

  // متوسط إكمال الكورسات
  const coursesWithProgress = await prisma.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      title: true,
      modules: {
        select: {
          lessons: { select: { id: true } },
        },
      },
    },
  })

  // حساب متوسط التقدم (مبسط)
  const courseProgress = await Promise.all(
    coursesWithProgress.map(async (course) => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
      const completedCount = await prisma.progress.count({
        where: {
          courseId: course.id,
          completed: true,
        },
      })
      const studentCount = await prisma.enrollment.count({ where: { courseId: course.id } })
      const avgProgress = studentCount > 0
        ? Math.round((completedCount / (totalLessons * studentCount)) * 100)
        : 0

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalLessons,
        studentCount,
        avgProgress,
      }
    })
  )

  return NextResponse.json({
    totalCourses,
    totalStudents,
    totalLessons,
    topCourses,
    courseProgress,
  })
}