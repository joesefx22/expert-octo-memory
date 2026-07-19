import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="text-xl text-gray-600">الصفحة غير موجودة</p>
        <Link href="/" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}