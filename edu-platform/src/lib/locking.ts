import { prisma } from './prisma'

interface LockStatus {
  isLocked: boolean
  reason?: string
  requiredLessonId?: string
  requiredModuleId?: string
  progressNeeded?: number // 0-100
  currentProgress?: number
}

export async function getLessonLockStatus(
  lessonId: string,
  userId: string,
  courseId: string
): Promise<LockStatus> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  })
  if (!lesson) return { isLocked: true, reason: 'الدرس غير موجود' }

  // تحقق من قفل الدرس نفسه
  if (lesson.lockConfig) {
    const config = lesson.lockConfig as any
    if (config.prerequisiteType === 'LESSON_COMPLETION') {
      const requiredProgress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: config.requiredLessonId,
          },
        },
      })
      if (!requiredProgress?.completed) {
        return {
          isLocked: true,
          reason: 'يجب إكمال الدرس السابق أولاً',
          requiredLessonId: config.requiredLessonId,
          progressNeeded: 100,
          currentProgress: requiredProgress ? 0 : 0,
        }
      }
    } else if (config.prerequisiteType === 'QUIZ_PASSED') {
      const requiredProgress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: config.requiredLessonId,
          },
        },
      })
      if (!requiredProgress?.completed) {
        return {
          isLocked: true,
          reason: `يجب اجتياز الاختبار بنسبة ${config.minScore}% على الأقل`,
          requiredLessonId: config.requiredLessonId,
          progressNeeded: config.minScore || 60,
          currentProgress: 0,
        }
      }
    }
  }

  // تحقق من قفل الوحدة
  if (lesson.module.lockConfig) {
    const config = lesson.module.lockConfig as any
    if (config.prerequisiteType === 'MODULE_COMPLETION') {
      // ✅ جلب الوحدة السابقة مع الحقول المطلوبة (بما فيها lockConfig)
      const prevModule = await prisma.module.findFirst({
        where: {
          courseId,
          order: { lt: lesson.module.order },
        },
        orderBy: { order: 'desc' },
        select: {
          id: true,
          title: true,
          lockConfig: true,       // 👈 تمت إضافته لإصلاح الخطأ
          lessons: {
            select: { id: true }
          }
        }
      })

      if (prevModule) {
        const lessonIds = prevModule.lessons.map(l => l.id)
        const completedCount = await prisma.progress.count({
          where: {
            userId,
            lessonId: { in: lessonIds },
            completed: true,
          },
        })
        if (completedCount < lessonIds.length) {
          return {
            isLocked: true,
            reason: `يجب إكمال وحدة "${prevModule.title}" أولاً`,
            requiredModuleId: prevModule.id,
            progressNeeded: 100,
            currentProgress: Math.round((completedCount / lessonIds.length) * 100),
          }
        }
      }
    }
  }

  return { isLocked: false }
}