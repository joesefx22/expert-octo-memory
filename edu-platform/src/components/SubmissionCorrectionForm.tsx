'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmissionCorrectionForm({ submission }: { submission: any }) {
  const router = useRouter()
  const [score, setScore] = useState(submission.score ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const questions = submission.assignment.questions as any[]
  const answers = submission.answers as Record<number, number>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (score === '' || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      setMessage('الرجاء إدخال درجة صحيحة بين 0 و 100')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Number(score),
          feedback,
        }),
      })
      if (res.ok) {
        setMessage('تم حفظ التصحيح بنجاح')
        router.refresh()
      } else {
        setMessage('حدث خطأ أثناء الحفظ')
      }
    } catch {
      setMessage('فشل الاتصال')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">إجابات الطالب</h2>
      <div className="space-y-4">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4">
            <p className="font-medium">{idx + 1}. {q.question}</p>
            <div className="mt-2 space-y-1">
              {q.options.map((opt: string, optIdx: number) => (
                <div
                  key={optIdx}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    answers[idx] === optIdx
                      ? 'bg-primary-100 border border-primary-300 font-semibold text-primary-800'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {optIdx === q.correctIndex && <span className="text-emerald-600 ml-2">✔</span>}
                  {answers[idx] === optIdx && <span className="text-primary-600 ml-2">← اختيار الطالب</span>}
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full md:w-32 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات للطالب</label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500"
            placeholder="مثلاً: إجابة جيدة ولكن يرجى مراجعة الدرس..."
          />
        </div>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition disabled:opacity-50"
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ التصحيح'}
          </button>
        </div>
      </form>
    </div>
  )
}