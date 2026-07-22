import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const bookmarks = await prisma.videoBookmark.findMany({
    where: { userId: session.user.id, lessonId: params.lessonId },
    orderBy: { timestamp: 'asc' },
  })

  return NextResponse.json(bookmarks)
}

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const { timestamp, note } = await req.json()

  const bookmark = await prisma.videoBookmark.create({
    data: {
      userId: session.user.id,
      lessonId: params.lessonId,
      timestamp,
      note,
    },
  })

  return NextResponse.json(bookmark, { status: 201 })
}