'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Label from './ui/Label'
import Textarea from './ui/Textarea'

interface Question {
  question: string
  options: string[]
  correctIndex: number
}

export default function AddAssignmentModal({ lectureId }: { lectureId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctIndex: 0 },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }])
  }

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === 'question') {
      updated[idx].question = value
    } else if (field.startsWith('option')) {
      const optIdx = parseInt(field.split('-')[1])
      updated[idx].options[optIdx] = value
    } else if (field === 'correctIndex') {
      updated[idx].correctIndex = parseInt(value)
    }
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('يرجى إدخال عنوان الواجب')
      return
    }
    for (const q of questions) {
      if (!q.question.trim()) { setError('جميع الأسئلة يجب أن تحتوي على نص'); return }
      if (q.options.some(o => !o.trim())) { setError('جميع الخيارات مطلوبة لكل سؤال'); return }
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, title, questions }),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message || 'فشل الإضافة')
      }
    } catch {
      setError('فشل الاتصال')
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm">
        ➕ إضافة واجب
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="إضافة واجب جديد" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label>عنوان الواجب</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: اختبار الفصل الأول" />
          </div>
          {questions.map((q, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <Label>السؤال {idx + 1}</Label>
              <Input
                value={q.question}
                onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                placeholder="نص السؤال"
              />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => (
                  <Input
                    key={optIdx}
                    value={opt}
                    onChange={(e) => updateQuestion(idx, `option-${optIdx}`, e.target.value)}
                    placeholder={`الخيار ${optIdx + 1}`}
                  />
                ))}
              </div>
              <div>
                <Label>الإجابة الصحيحة</Label>
                <select
                  value={q.correctIndex}
                  onChange={(e) => updateQuestion(idx, 'correctIndex', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500"
                >
                  {q.options.map((_, i) => (
                    <option key={i} value={i}>{`الخيار ${i + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="text-primary-600 hover:text-primary-800 font-medium text-sm"
          >
            + إضافة سؤال آخر
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : 'حفظ الواجب'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}