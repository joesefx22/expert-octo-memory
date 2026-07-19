'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TeacherAnswerQuestion({ questionId }: { questionId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    })
    if (res.ok) {
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm shadow">
        رد
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">الرد على السؤال</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea required rows={4} value={reply} onChange={e => setReply(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2" placeholder="اكتب ردك هنا..." />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700">إلغاء</button>
                <button type="submit" disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl disabled:opacity-50">
                  {loading ? 'جارٍ الإرسال...' : 'إرسال الرد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}