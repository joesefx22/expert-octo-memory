import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCertificate } from '@/lib/certificate'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const { courseId } = await req.json()
  const certificate = await generateCertificate(session.user.id, courseId)
  if (!certificate) {
    return NextResponse.json({ message: 'لم تكمل الكورس بعد' }, { status: 400 })
  }

  return NextResponse.json(certificate, { status: 201 })
}