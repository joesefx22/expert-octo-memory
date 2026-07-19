'use client'

import { useEffect } from 'react'

export default function ProgressUpdater({
  lessonId,
  courseId,
  alreadyCompleted,
}: {
  lessonId: string
  courseId: string
  alreadyCompleted: boolean
}) {
  useEffect(() => {
    if (alreadyCompleted) return
    const timer = setTimeout(() => {
      fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
    }, 5000) // يسجل بعد 5 ثوانٍ من الفتح
    return () => clearTimeout(timer)
  }, [lessonId, courseId, alreadyCompleted])

  return null
}