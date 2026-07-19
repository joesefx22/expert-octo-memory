import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import SubmissionCorrectionForm from '@/components/SubmissionCorrectionForm'

async function getSubmission(id: string, teacherId: string) {
  return prisma.submission.findFirst({
    where: {
      id,
      assignment: {
        lecture: {
          teacherId,
        },
      },
    },
    include: {
      student: true,
      assignment: {
        include: {
          lecture: true,
        },
      },
    },
  })
}

export default async function SubmissionCorrectionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') redirect('/')

  const submission = await getSubmission(params.id, session.user.id)

  if (!submission) {
    // allow admin to access any
    if (session.user.role !== 'ADMIN') notFound()
    // admin: fetch without teacher filter
    const anySub = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        assignment: { include: { lecture: true } },
      },
    })
    if (!anySub) notFound()
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">تصحيح الواجب (مدير)</h1>
          <SubmissionCorrectionForm submission={anySub} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2">تصحيح الواجب</h1>
        <p className="text-gray-600 mb-6">
          الطالب: {submission.student.name || submission.student.email}
          <br />
          المحاضرة: {submission.assignment.lecture.title}
          <br />
          الواجب: {submission.assignment.title}
        </p>
        <SubmissionCorrectionForm submission={submission} />
      </div>
    </div>
  )
}