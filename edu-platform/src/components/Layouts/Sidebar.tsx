'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const studentLinks = [
  { href: '/student', label: 'لوحة التحكم', icon: '📊' },
  { href: '/student/profile', label: 'ملفي الشخصي', icon: '👤' },
  { href: '/code', label: 'تفعيل كود', icon: '🎟️' },
]

const teacherLinks = [
  { href: '/teacher', label: 'لوحة التحكم', icon: '📊' },
  { href: '/teacher/profile', label: 'ملفي الشخصي', icon: '👤' },
]

const adminLinks = [
  { href: '/admin', label: 'لوحة التحكم', icon: '📊' },
  { href: '/admin/users', label: 'إدارة المستخدمين', icon: '👥' },
]

export default function Sidebar({ role }: { role: 'STUDENT' | 'TEACHER' | 'ADMIN' }) {
  const pathname = usePathname()
  let links: { href: string; label: string; icon: string }[] = []
  if (role === 'STUDENT') links = studentLinks
  else if (role === 'TEACHER') links = teacherLinks
  else links = adminLinks

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-xl rounded-l-2xl ml-4 p-6">
      <div className="text-2xl font-bold text-primary-600 mb-8">Edu Platform</div>
      <nav className="flex-1 space-y-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition',
              pathname === link.href && 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
            )}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
const teacherLinks = [
  { href: '/teacher', label: 'كورساتي', icon: '📚' },
  { href: '/teacher/create-course', label: 'إضافة كورس', icon: '➕' },
]

const adminLinks = [
  { href: '/admin', label: 'لوحة التحكم', icon: '📊' },
  { href: '/admin/users', label: 'المستخدمين', icon: '👥' },
  { href: '/admin/courses', label: 'الكورسات', icon: '📚' },
  { href: '/admin/codes', label: 'الأكواد', icon: '🎟️' },
]