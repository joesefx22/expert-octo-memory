'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AddModuleModal({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, courseId }),
    })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm">+ وحدة</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="إضافة وحدة جديدة">
        <div className="space-y-4">
          <div>
            <Label>عنوان الوحدة</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: الأساسيات" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={loading || !title.trim()}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}