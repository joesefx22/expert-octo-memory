import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getProgress(courseId: string, userId: string) {
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } },
  })
  const completed = await prisma.progress.count({
    where: { userId, courseId, completed: true },
  })
  return { totalLessons, completed }
}

export default async function CourseProgressCard({
  course,
  userId,
}: {
  course: any
  userId: string
}) {
  const { totalLessons, completed } = await getProgress(course.id, userId)
  const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

  return (
    <Link
      href={`/learn/${course.id}`}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col"
    >
      <h3 className="font-bold text-lg mb-1">{course.title}</h3>
      <div className="text-sm text-gray-500 mb-3">{totalLessons} درس</div>
      <div className="mt-auto">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">{percent}% مكتمل</div>
      </div>
    </Link>
  )
}