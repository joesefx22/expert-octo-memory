import { prisma } from './prisma'
export async function checkAccess(course: any, userId: string, userRole: string) {
  if (userRole !== 'STUDENT' || course.isFree) return { allowed: true }
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } })
  if (!enrollment || (enrollment.expiresAt && new Date() > enrollment.expiresAt)) return { allowed: false }
  return { allowed: true }
}
