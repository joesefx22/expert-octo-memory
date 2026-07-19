'use client'

import Link from 'next/link'
import GenerateCodesModal from './GenerateCodesModal'
import AddAssignmentModal from './AddAssignmentModal'

interface Lecture {
  id: string
  title: string
  duration: number
  isFree: boolean
  _count: { assignments: number; codes: number }
}

export default function TeacherLecturesList({ lectures }: { lectures: Lecture[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lectures.map((lecture) => (
        <div key={lecture.id} className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-blue-300 flex flex-col">
          <Link href={`/lecture/${lecture.id}`} className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{lecture.title}</h3>
            <div className="text-sm text-gray-600 mt-1">
              {Math.floor(lecture.duration / 60)} دقيقة · {lecture.isFree ? 'مجاني' : 'مدفوع'}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>{lecture._count.assignments} واجب</span>
              <span>{lecture._count.codes} كود</span>
            </div>
          </Link>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <GenerateCodesModal lectureId={lecture.id} lectureTitle={lecture.title} />
            <AddAssignmentModal lectureId={lecture.id} />
          </div>
        </div>
      ))}
    </div>
  )
}