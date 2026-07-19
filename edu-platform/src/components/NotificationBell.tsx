'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch('/api/notifications')
      .then(res => res.json())
      .then(setNotifications)
  }, [session])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border z-50 max-h-80 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 p-4">لا توجد إشعارات</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg mb-2 ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('ar-EG')}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
// داخل NotificationBell
useEffect(() => {
  if (open) {
    // بعد 3 ثواني من الفتح، نعلم الكل كمقروء
    const timer = setTimeout(() => {
      fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
        .then(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))))
    }, 3000)
    return () => clearTimeout(timer)
  }
}, [open])