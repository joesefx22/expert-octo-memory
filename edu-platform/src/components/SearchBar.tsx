'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/courses?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن كورس..."
        className="flex-1 border-2 border-gray-200 rounded-xl px-5 py-3 text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition shadow-lg"
      >
        بحث
      </button>
    </form>
  )
}