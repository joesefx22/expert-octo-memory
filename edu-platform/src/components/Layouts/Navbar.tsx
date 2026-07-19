'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Edu Platform
            </Link>
            {user.role === 'STUDENT' && (
              <Link href="/code" className="text-sm text-gray-600 hover:text-primary-600">
                تفعيل كود
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${user.role === 'ADMIN' ? 'admin' : user.role === 'TEACHER' ? 'teacher' : 'student'}/profile`}
              className="text-sm text-gray-700 hover:text-primary-600"
            >
              {user.name || user.email}
            </Link>
            <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded">
              {user.role === 'TEACHER' ? 'مدرس' : user.role === 'ADMIN' ? 'مدير' : 'طالب'}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}