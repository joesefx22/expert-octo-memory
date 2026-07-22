'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'

type User = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersTable({ users }: { users: User[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleChange = async (userId: string) => {
    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setEditingId(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسجيل</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">{user.name || '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === user.id ? (
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="border border-gray-300 rounded-xl px-2 py-1 text-sm"
                  >
                    <option value="STUDENT">طالب</option>
                    <option value="TEACHER">مدرس</option>
                    <option value="ADMIN">مدير</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'مدير' : user.role === 'TEACHER' ? 'مدرس' : 'طالب'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('ar-EG')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === user.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRoleChange(user.id)} disabled={loading}>
                      حفظ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => { setEditingId(user.id); setNewRole(user.role) }}>
                    تغيير الدور
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}