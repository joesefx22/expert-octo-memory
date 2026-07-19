'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TeacherAddLecture() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoId: '',
    duration: '',
    isFree: false,
    price: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          videoId: form.videoId,
          duration: parseInt(form.duration) * 60, // convert minutes to seconds
          isFree: form.isFree,
          price: form.isFree ? null : parseFloat(form.price),
        }),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message || 'خطأ في الإضافة')
      }
    } catch {
      setError('فشل الاتصال')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="ml-2">+</span> إضافة محاضرة جديدة
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">محاضرة جديدة</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                       className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2 h-24 focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  معرف الفيديو في Bunny Stream (GUID)
                </label>
                <input required value={form.videoId} onChange={e => setForm({...form, videoId: e.target.value})}
                       className="w-full border border-gray-300 rounded-xl px-4 py-2 font-mono text-sm" />
                <p className="text-xs text-gray-500 mt-1">ارفع الفيديو على Bunny Stream أولاً ثم الصق المعرف هنا</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
                  <input required type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                         className="w-full border border-gray-300 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر ($)</label>
                  <input type="number" step="0.01" disabled={form.isFree} value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                         className="w-full border border-gray-300 rounded-xl px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="free" checked={form.isFree} onChange={e => setForm({...form, isFree: e.target.checked})}
                       className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <label htmlFor="free" className="text-sm text-gray-700">مجاني</label>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">إلغاء</button>
                <button type="submit" disabled={loading}
                        className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition shadow-md">
                  {loading ? 'جارٍ الإضافة...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}