'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function QuestionBox({ lectureId }: { lectureId: string }) {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/questions?lectureId=${lectureId}`)
      .then(res => res.json())
      .then(setQuestions)
  }, [lectureId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: question, lectureId }),
    })
    setQuestion('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">اسأل المدرس</h2>
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="اكتب سؤالك هنا..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 shadow">
          إرسال
        </button>
      </form>
      <div className="space-y-4">
        {questions.map(q => (
          <div key={q.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">سؤالك</span>
              <span className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleString('ar-EG')}</span>
            </div>
            <p className="text-gray-700 mt-2">{q.content}</p>
            {q.reply && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">رد المدرس:</span>
                <p className="text-blue-800 mt-1">{q.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}