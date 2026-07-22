import { prisma } from './prisma'
import crypto from 'crypto'

export async function generateCertificate(userId: string, courseId: string) {
  // تحقق من إكمال الكورس
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } },
  })
  const completedLessons = await prisma.progress.count({
    where: {
      userId,
      courseId,
      completed: true,
    },
  })

  if (completedLessons < totalLessons || totalLessons === 0) {
    return null
  }

  // تحقق من وجود شهادة سابقة
  const existing = await prisma.certificate.findFirst({
    where: { userId, courseId },
  })
  if (existing) return existing

  const code = crypto.randomBytes(8).toString('hex').toUpperCase()
  const certificate = await prisma.certificate.create({
    data: {
      userId,
      courseId,
      code,
    },
  })

  // إرسال إشعار
  await prisma.notification.create({
    data: {
      userId,
      message: `🎉 تهانينا! لقد حصلت على شهادة إتمام الكورس`,
    },
  })

  return certificate
}

export async function verifyCertificate(code: string) {
  return prisma.certificate.findUnique({
    where: { code },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  })
}