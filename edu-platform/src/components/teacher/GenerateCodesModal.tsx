'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import Label from './ui/Label'

export default function GenerateCodesModal({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, count }),
      })
      if (!res.ok) throw new Error('فشل التوليد')
      setPdfUrl(`/api/codes/pdf?courseId=${courseId}`)
      router.refresh()
    } catch {
      setError('حدث خطأ')
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm">
        🎟️ توليد أكواد
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`توليد أكواد لـ ${courseTitle}`}>
        <div className="space-y-4">
          <div>
            <Label>عدد الأكواد</Label>
            <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {pdfUrl && (
            <a href={pdfUrl} download className="text-primary-600 underline block">
              📥 تحميل PDF
            </a>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleGenerate} disabled={loading}>توليد</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}