'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    })
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl p-4 z-50 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">الإشعارات</h3>
            <button onClick={markAllRead} className="text-xs text-blue-600">تعليم الكل مقروء</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">لا توجد إشعارات</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-2 rounded mb-2 text-sm ${n.read ? 'bg-gray-50' : 'bg-blue-50 font-medium'}`}>
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}