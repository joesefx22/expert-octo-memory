'use client'

import { useState } from 'react'
import videojs from 'video.js'

export default function VideoBookmark({ lessonId, player }: { lessonId: string; player: any }) {
  const [showForm, setShowForm] = useState(false)
  const [note, setNote] = useState('')

  const addBookmark = async () => {
    const currentTime = Math.floor(player.currentTime())
    await fetch(`/api/lessons/${lessonId}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: currentTime, note }),
    })
    setShowForm(false)
    setNote('')
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-sm font-medium shadow-lg hover:bg-white transition z-20"
      >
        📌 إشارة مرجعية
      </button>
      {showForm && (
        <div className="absolute top-16 right-4 bg-white rounded-2xl shadow-2xl p-4 w-72 z-30">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="ملاحظة (اختياري)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={addBookmark}
              className="flex-1 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium"
            >
              حفظ
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  )
}