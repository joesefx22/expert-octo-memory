'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Label from './ui/Label'

export default function GenerateCodesModal({ lectureId, lectureTitle }: { lectureId: string; lectureTitle: string }) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (count < 1 || count > 200) {
      setError('العدد يجب أن يكون بين 1 و 200')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, count }),
      })
      if (!res.ok) throw new Error('فشل في التوليد')
      // Now download PDF
      const pdfRes = await fetch(`/api/codes/pdf?lectureId=${lectureId}`)
      if (pdfRes.ok) {
        const blob = await pdfRes.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        router.refresh()
      } else {
        setError('تم التوليد لكن فشل تحميل PDF')
      }
    } catch {
      setError('حدث خطأ ما')
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm">
        🎟️ توليد أكواد
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`توليد أكواد لـ ${lectureTitle}`}>
        <div className="space-y-4">
          <div>
            <Label>عدد الأكواد</Label>
            <Input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {pdfUrl && (
            <div>
              <a
                href={pdfUrl}
                download={`codes-${lectureTitle}.pdf`}
                className="text-primary-600 underline block mt-2"
              >
                📥 تحميل ملف PDF
              </a>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'جارٍ التوليد...' : 'توليد'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}