import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: {
    id: string
    title: string
    thumbnail?: string | null
    isFree: boolean
    price?: number | null
    teacher: { name: string | null }
    _count: { modules: number }
    studentCount?: number
    averageProgress?: number
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition flex flex-col">
      <div className="h-40 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-4xl">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span>📚</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-1">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{course.teacher.name || 'مدرس'}</p>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{course._count.modules} وحدات</span>
          <span>{course.studentCount ?? 0} طالب</span>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            course.isFree ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          )}>
            {course.isFree ? 'مجاني' : `$${course.price}`}
          </span>
          {course.averageProgress !== undefined && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {course.averageProgress}%
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}