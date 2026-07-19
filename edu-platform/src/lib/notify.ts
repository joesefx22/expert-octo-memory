import { prisma } from './prisma'

export async function sendNotification(userId: string, message: string) {
  await prisma.notification.create({
    data: { userId, message },
  })
}