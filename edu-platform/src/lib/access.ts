import { prisma } from './prisma'
import { Course, Role } from '@prisma/client'

export async function checkAccess(
  course: Pick<Course, 'id' | 'isFree'>,
  userId: string,
  userRole: Role | string
) {
  if (userRole !== 'STUDENT' || course.isFree) {
    return { allowed: true }
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: course.id },
    },
  })

  if (!enrollment || (enrollment.expiresAt && new Date() > enrollment.expiresAt)) {
    return { allowed: false, reason: 'يجب شراء الكورس أو الاشتراك منتهي' }
  }

  const remainingSeconds = enrollment.expiresAt
    ? Math.max(0, Math.floor((enrollment.expiresAt.getTime() - Date.now()) / 1000))
    : undefined

  return { allowed: true, remainingSeconds }
}