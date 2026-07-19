'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RedeemCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const [courseTitle, setCourseTitle] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (courseId) {
      fetch(`/api/courses/${courseId}`)
        .then(res => res.json())
        .then(data => setCourseTitle(data.title || ''))
    }
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !courseId) return
    setLoading(true)
    setMessage('')
    setStatus('idle')
    const res = await fetch('/api/codes/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase().trim(), courseId }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('تم تفعيل الكود بنجاح! جارٍ تحويلك إلى الكورس...')
      setStatus('success')
      setTimeout(() => router.push(`/learn/${courseId}`), 2000)
    } else {
      setMessage(data.message || 'كود غير صالح')
      setStatus('error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full" dir="rtl">
        <h1 className="text-2xl font-bold text-center mb-2">تفعيل كود الكورس</h1>
        {courseTitle && <p className="text-center text-gray-600 mb-4">الكورس: {courseTitle}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="أدخل الكود"
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-wider focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
          <button
            type="submit"
            disabled={loading || !code || !courseId}
            className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'جارٍ التحقق...' : 'تفعيل'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center font-medium ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}