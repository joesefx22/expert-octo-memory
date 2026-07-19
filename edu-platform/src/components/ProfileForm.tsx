'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Input from './ui/Input'
import Label from './ui/Label'

export default function ProfileForm({ user }: { user: any }) {
  const { update } = useSession()
  const router = useRouter()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('تم تحديث الملف الشخصي بنجاح')
        update()
        router.refresh()
      } else {
        setError(data.message || 'خطأ في التحديث')
      }
    } catch {
      setError('فشل الاتصال')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xl">
      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <Label>الاسم</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" />
        </div>
        <div>
          <Label>البريد الإلكتروني</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" />
        </div>
        <hr className="my-4" />
        <p className="text-sm text-gray-500">اترك الحقول فارغة إذا لم ترغب في تغيير كلمة المرور</p>
        <div>
          <Label>كلمة المرور الحالية</Label>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} dir="ltr" />
        </div>
        <div>
          <Label>كلمة المرور الجديدة</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} dir="ltr" />
        </div>
        {message && <p className="text-emerald-600 text-sm">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </div>
  )
}