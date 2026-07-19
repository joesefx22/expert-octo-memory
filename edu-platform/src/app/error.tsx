'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">عذراً، حدث خطأ ما</h2>
        <p className="text-gray-600">{error.message || 'حاول مرة أخرى لاحقاً'}</p>
        <Button onClick={reset} variant="primary">إعادة المحاولة</Button>
      </div>
    </div>
  )
}