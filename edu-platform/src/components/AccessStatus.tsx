'use client'

import CountdownTimer from './CountdownTimer'

interface AccessStatusProps {
  remainingSeconds?: number // إذا وجدت، فهي تعني أن الوصول لا يزال ساريًا
}

export default function AccessStatus({ remainingSeconds }: AccessStatusProps) {
  if (remainingSeconds === undefined) {
    // لا توجد صلاحية زمنية (محاضرة مجانية أو مدرس)
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">متاح</span>
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
        تم الشراء
      </span>
      <span className="text-gray-500">
        المتبقي: <CountdownTimer seconds={remainingSeconds} />
      </span>
    </div>
  )
}