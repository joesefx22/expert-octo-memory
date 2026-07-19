'use client'

import { LockIcon } from '@/components/ui/LockIcon'
import Link from 'next/link'

interface PrerequisiteLockProps {
  isLocked: boolean
  reason?: string
  requiredLessonId?: string
  requiredModuleId?: string
  progressNeeded?: number
  currentProgress?: number
}

export default function PrerequisiteLock({
  isLocked,
  reason,
  requiredLessonId,
  requiredModuleId,
  progressNeeded,
  currentProgress,
}: PrerequisiteLockProps) {
  if (!isLocked) return null

  const progress = currentProgress || 0
  const needed = progressNeeded || 100
  const percent = Math.round((progress / needed) * 100)

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full text-center space-y-4">
        <div className="text-6xl">🔒</div>
        <h3 className="text-xl font-bold text-gray-800">درس مقفل</h3>
        <p className="text-gray-600">{reason || 'يجب إكمال المتطلبات أولاً'}</p>

        {progressNeeded !== undefined && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              تقدمك: {progress}% من {needed}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {requiredLessonId && (
          <Link
            href={`/learn/${requiredLessonId}`}
            className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
          >
            اذهب للدرس المطلوب
          </Link>
        )}
        {requiredModuleId && (
          <Link
            href={`/learn/${requiredModuleId}`}
            className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
          >
            اذهب للوحدة المطلوبة
          </Link>
        )}
      </div>
    </div>
  )
}