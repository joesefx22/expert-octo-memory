import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'

export default async function TeacherProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">ملفي الشخصي</h1>
      <ProfileForm user={session.user} />
    </div>
  )
}