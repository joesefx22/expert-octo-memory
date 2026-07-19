import { prisma } from './prisma'

interface AccessResult {
  allowed: boolean
  reason?: string
  remainingSeconds?: number
}

export async function checkAccess(
  course: { id: string; isFree: boolean },
  userId: string,
  userRole: string
): Promise<AccessResult> {
  if (userRole !== 'STUDENT') return { allowed: true }
  if (course.isFree) return { allowed: true }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })

  if (!enrollment) {
    return { allowed: false, reason: 'يجب شراء الكورس للوصول إليه' }
  }

  if (enrollment.expiresAt && new Date() > enrollment.expiresAt) {
    return { allowed: false, reason: 'انتهت صلاحية اشتراكك في هذا الكورس' }
  }

  // حساب الوقت المتبقي إن وجد
  const remainingSeconds = enrollment.expiresAt
    ? Math.max(0, Math.floor((enrollment.expiresAt.getTime() - Date.now()) / 1000))
    : undefined

  return { allowed: true, remainingSeconds }
}