'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import QuestionBankPicker from '@/components/teacher/QuestionBankPicker'

export default function CreateContestPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    courseId: '',
    startDate: '',
    endDate: '',
    type: 'DAILY',
  })
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await fetch('/api/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, questions: selectedQuestions }),
    })
    setLoading(false)
    router.push('/teacher/contests')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">إنشاء مسابقة</h1>
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <Label>عنوان المسابقة</Label>
          <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <Label>الكورس</Label>
          <select className="w-full border border-gray-300 rounded-xl px-4 py-2" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
            <option value="">اختر الكورس</option>
            {/* قائمة الكورسات */}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>تاريخ البداية</Label>
            <Input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
          </div>
          <div>
            <Label>تاريخ النهاية</Label>
            <Input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
          </div>
        </div>
        <div>
          <Label>الأسئلة المختارة ({selectedQuestions.length})</Label>
          <QuestionBankPicker
            courseId={form.courseId}
            onSelect={(questions) => setSelectedQuestions(questions.map(q => q.id))}
          />
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          إنشاء المسابقة
        </Button>
      </div>
    </div>
  )
}