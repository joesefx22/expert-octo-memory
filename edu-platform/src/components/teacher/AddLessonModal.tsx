'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AddLessonModal({ moduleId, moduleTitle }: { moduleId: string; moduleTitle: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'VIDEO' as string,
    videoId: '',
    duration: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        moduleId,
        duration: form.duration ? parseInt(form.duration) * 60 : null,
      }),
    })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="ghost" size="sm">+ درس</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`إضافة درس إلى ${moduleTitle}`}>
        <div className="space-y-4">
          <div>
            <Label>عنوان الدرس</Label>
            <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <Label>النوع</Label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            >
              <option value="VIDEO">فيديو</option>
              <option value="QUIZ">امتحان</option>
              <option value="DOCUMENT">مستند</option>
            </select>
          </div>
          {form.type === 'VIDEO' && (
            <>
              <div>
                <Label>معرف الفيديو في Bunny Stream</Label>
                <Input value={form.videoId} onChange={(e) => setForm({...form, videoId: e.target.value})} placeholder="GUID" />
              </div>
              <div>
                <Label>المدة بالدقائق</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={loading || !form.title.trim()}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}