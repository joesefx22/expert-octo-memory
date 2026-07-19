'use client'

import { useState } from 'react'
import Button from './ui/Button'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: string
  options: string[]
}

interface Quiz {
  id: string
  questions: Question[]
}

export default function QuizForm({ quiz, lessonId }: { quiz: Quiz; lessonId: string }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  const handleSubmit = async () => {
    const res = await fetch(`/api/lessons/${lessonId}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    setScore(data.score)
    setSubmitted(true)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">امتحان الدرس</h2>
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="mb-4">
          <p className="font-medium">{idx + 1}. {q.text}</p>
          {q.type === 'MCQ' && (
            <div className="mt-2 space-y-1">
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    value={optIdx.toString()}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    disabled={submitted}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === 'TRUE_FALSE' && (
            <div className="mt-2 space-y-1">
              {['true', 'false'].map((val) => (
                <label key={val} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    value={val}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    disabled={submitted}
                  />
                  {val === 'true' ? 'صح' : 'خطأ'}
                </label>
              ))}
            </div>
          )}
          {q.type === 'NUMBER' && (
            <input
              type="number"
              className="border rounded px-2 py-1 mt-1"
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              disabled={submitted}
            />
          )}
        </div>
      ))}
      {!submitted && (
        <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>
          تسليم الإجابات
        </Button>
      )}
      {submitted && score !== null && (
        <p className="text-lg font-bold mt-4">
          النتيجة: {score} / {quiz.questions.length}
        </p>
      )}
    </div>
  )
}