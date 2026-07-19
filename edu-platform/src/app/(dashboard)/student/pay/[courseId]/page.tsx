'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function PayPage({ params }: { params: { courseId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/paymob/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.courseId }),
      })
      if (res.ok) {
        const data = await res.json()
        // redirect to Paymob iframe URL
        window.location.href = data.redirectUrl
      } else {
        alert('فشل بدء الدفع')
      }
    } catch {
      alert('خطأ في الاتصال')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">الدفع الإلكتروني</h1>
        <p className="text-gray-600 mb-6">سيتم توجيهك إلى بوابة الدفع الآمنة</p>
        <Button onClick={handlePay} disabled={loading} className="w-full">
          {loading ? 'جارٍ...' : 'ادفع الآن'}
        </Button>
      </div>
    </div>
  )
}