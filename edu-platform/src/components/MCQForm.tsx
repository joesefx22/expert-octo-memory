'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Assignment {
  id: string
  title: string
  questions: { question: string; options: string[]; correctIndex: number }[]
  dueDate?: string
}

interface Submission {
  id: string
  answers: Record<number, number>
  score?: number
  feedback?: string
}

export default function MCQForm({ assignment, existingSubmission }: { assignment: Assignment; existingSubmission?: Submission }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, number>>(
    existingSubmission ? existingSubmission.answers : {}
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const questions = assignment.questions as any[]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          answers,
        }),
      })
      if (res.ok) {
        setMessage('تم تسليم الواجب بنجاح!')
        router.refresh()
      } else {
        const data = await res.json()
        setMessage(data.message || 'خطأ')
      }
    } catch {
      setMessage('فشل الاتصال')
    }
    setLoading(false)
  }

  if (existingSubmission && existingSubmission.score != null) {
    return (
      <div className="bg-white rounded-xl shadow p-6 border border-emerald-200">
        <h3 className="font-bold text-lg mb-2">{assignment.title}</h3>
        <p className="text-emerald-700 font-semibold">النتيجة: {existingSubmission.score}%</p>
        {existingSubmission.feedback && (
          <p className="text-gray-600 mt-1">ملاحظات المدرس: {existingSubmission.feedback}</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-xl text-gray-800 mb-4">{assignment.title}</h3>
      {existingSubmission && existingSubmission.score == null && (
        <p className="text-amber-600 mb-4">تم التسليم، بانتظار التصحيح.</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4">
            <p className="font-medium text-gray-900 mb-3">{idx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt: string, optIdx: number) => (
                <label key={optIdx} className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={optIdx}
                    checked={answers[idx] === optIdx}
                    onChange={() => setAnswers({ ...answers, [idx]: optIdx })}
                    disabled={!!existingSubmission}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {!existingSubmission && (
          <button type="submit" disabled={loading || Object.keys(answers).length !== questions.length}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'جارٍ التسليم...' : 'تسليم الواجب'}
          </button>
        )}
        {message && <p className="text-center text-sm text-emerald-600">{message}</p>}
      </form>
    </div>
  )
}