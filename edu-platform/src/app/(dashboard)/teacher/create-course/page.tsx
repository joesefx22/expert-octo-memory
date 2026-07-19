'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

export default function CreateCoursePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', isFree: false, price: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        isFree: form.isFree,
        price: form.isFree ? null : parseFloat(form.price),
      }),
    })
    if (res.ok) {
      router.push('/teacher')
    } else {
      alert('فشل إنشاء الكورس')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">إنشاء كورس جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <Label>العنوان</Label>
          <Input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <Label>الوصف</Label>
          <Input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({...form, isFree: e.target.checked})} />
          <Label>مجاني</Label>
        </div>
        {!form.isFree && (
          <div>
            <Label>السعر</Label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
          </div>
        )}
        <Button type="submit" disabled={loading}>{loading ? 'جارٍ...' : 'إنشاء'}</Button>
      </form>
    </div>
  )
}