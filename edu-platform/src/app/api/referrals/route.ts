import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })

  const referralCode = crypto.createHash('sha256').update(session.user.id).digest('hex').substring(0, 8).toUpperCase()

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    include: { referee: { select: { name: true } } },
  })

  const referralUrl = `${process.env.NEXTAUTH_URL}/register?ref=${referralCode}`

  return NextResponse.json({ referralCode, referralUrl, referrals })
}