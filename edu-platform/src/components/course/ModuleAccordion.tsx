'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { LockIcon } from 'lucide-react' // افتراض استخدام lucide-react

interface Lesson {
  id: string
  title: string
  type: string
  order: number
  lockConfig?: any
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export default function ModuleAccordion({
  module,
  completedLessonIds,
}: {
  module: Module
  completedLessonIds: Set<string>
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-white rounded-2xl shadow mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition"
      >
        <h3 className="font-bold text-gray-800">{module.title}</h3>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {module.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/learn/${module.id.replace(/-/g, '')}/lesson/${lesson.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition"
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  completedLessonIds.has(lesson.id)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {completedLessonIds.has(lesson.id) ? '✓' : lesson.order}
              </span>
              <span className="text-gray-700">{lesson.title}</span>
              {lesson.lockConfig && (
                <LockIcon className="w-4 h-4 text-gray-400 mr-2" />
              )}
              <span className="mr-auto text-gray-400 text-sm">
                {lesson.type === 'VIDEO' ? '🎥' : lesson.type === 'QUIZ' ? '❓' : '📄'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}