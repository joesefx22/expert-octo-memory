import { prisma } from './prisma'

interface AccessResult {
  allowed: boolean
  reason?: string // reason for denial
  remainingSeconds?: number // if allowed, remaining time in seconds
}

export async function checkAccess(
  lecture: { id: string; isFree: boolean },
  userId: string,
  userRole: string
): Promise<AccessResult> {
  // المدرسون والمديرون يمكنهم المشاهدة دائمًا
  if (userRole !== 'STUDENT') return { allowed: true }

  // المحاضرات المجانية متاحة
  if (lecture.isFree) return { allowed: true }

  // البحث عن كود شراء مستخدم لهذا الطالب وهذه المحاضرة
  const code = await prisma.code.findFirst({
    where: {
      lectureId: lecture.id,
      userId,
      isUsed: true,
    },
  })

  if (!code) {
    return { allowed: false, reason: 'يجب شراء كود للوصول إلى هذه المحاضرة' }
  }

  if (!code.purchasedAt) {
    // بيانات غير مكتملة - نسمح بالوصول (لأسباب أمان)
    return { allowed: true }
  }

  // صلاحية أسبوع واحد فقط من تاريخ الشراء
  const expiry = new Date(code.purchasedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
  const now = new Date()

  if (now > expiry) {
    return {
      allowed: false,
      reason: 'انتهت صلاحية الوصول (أسبوع واحد). يرجى شراء كود جديد.',
    }
  }

  const remainingSeconds = Math.floor((expiry.getTime() - now.getTime()) / 1000)
  return { allowed: true, remainingSeconds }
}
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

  const code = await prisma.code.findFirst({
    where: {
      courseId: course.id,
      userId,
      isUsed: true,
    },
  })

  if (!code) {
    return { allowed: false, reason: 'يجب شراء كود للوصول إلى هذا الكورس' }
  }

  if (code.purchasedAt) {
    const expiry = new Date(code.purchasedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    if (new Date() > expiry) {
      return { allowed: false, reason: 'انتهت صلاحية الوصول (أسبوع واحد).' }
    }
    const remainingSeconds = Math.floor((expiry.getTime() - Date.now()) / 1000)
    return { allowed: true, remainingSeconds }
  }

  return { allowed: true }
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
    // لا يوجد تسجيل -> الكورس غير مشترى
    return { allowed: false, reason: 'يجب شراء الكورس للوصول إليه' }
  }

  if (enrollment.expiresAt && new Date() > enrollment.expiresAt) {
    return { allowed: false, reason: 'انتهت صلاحية اشتراكك في هذا الكورس' }
  }

  return { allowed: true }
}