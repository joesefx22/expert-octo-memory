import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Layouts/Navbar'
import Sidebar from '@/components/Layouts/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar user={session.user} />
      <div className="flex max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 gap-4">
        <Sidebar role={session.user.role as any} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}