'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface Question {
  id: string
  text: string
  type: string
  tags: string[]
  difficulty: number
}

export default function QuestionBankPicker({
  courseId,
  onSelect,
}: {
  courseId?: string
  onSelect: (questions: Question[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) {
      fetch(`/api/question-bank?courseId=${courseId || ''}`)
        .then(res => res.json())
        .then(setQuestions)
    }
  }, [open, courseId])

  const toggleQuestion = (id: string) => {
    const newSet = new Set(selected)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelected(newSet)
  }

  const handleAdd = () => {
    const selectedQuestions = questions.filter(q => selected.has(q.id))
    onSelect(selectedQuestions)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm">
        📚 من بنك الأسئلة
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="اختيار من بنك الأسئلة" size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <input
            type="text"
            placeholder="بحث..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {questions
            .filter(q => q.text.includes(search))
            .map(q => (
              <div
                key={q.id}
                className={`p-3 rounded-xl cursor-pointer border-2 transition ${
                  selected.has(q.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleQuestion(q.id)}
              >
                <p className="font-medium">{q.text}</p>
                <div className="flex gap-2 mt-1 text-xs text-gray-500">
                  {q.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                  <span>صعوبة: {'⭐'.repeat(q.difficulty)}</span>
                </div>
              </div>
            ))}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleAdd} disabled={selected.size === 0}>
            إضافة {selected.size} أسئلة
          </Button>
        </div>
      </Modal>
    </>
  )
}