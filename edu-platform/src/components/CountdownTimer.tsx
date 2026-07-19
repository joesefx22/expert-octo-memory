'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(remaining / (24 * 3600))
  const hours = Math.floor((remaining % (24 * 3600)) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const secs = remaining % 60

  if (remaining <= 0) return <span className="text-red-500 font-semibold">انتهت الصلاحية</span>

  return (
    <span className="font-mono">
      {days > 0 && `${days}ي `}
      {hours > 0 && `${hours}س `}
      {minutes > 0 && `${minutes}د `}
      {`${secs}ث`}
    </span>
  )
}