import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import MCQForm from '@/components/MCQForm'
import QuestionBox from '@/components/QuestionBox'
import GenerateCodesModal from '@/components/GenerateCodesModal'
import AddAssignmentModal from '@/components/AddAssignmentModal'

export default async function LecturePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const lecture = await prisma.lecture.findUnique({
    where: { id: params.id },
    include: { assignments: true },
  })
  if (!lecture) notFound()

  const hasAccess = lecture.isFree || session.user.role !== 'STUDENT' ||
    (await prisma.code.findFirst({
      where: { lectureId: lecture.id, userId: session.user.id, isUsed: true },
    }))

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">غير مصرح</h2>
          <p className="text-gray-600 mb-6">يجب شراء كود للوصول إلى هذه المحاضرة.</p>
          <a href="/code" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
            إدخال كود الشراء
          </a>
        </div>
      </div>
    )
  }

  let submissions: any[] = []
  if (session.user.role === 'STUDENT') {
    const assignmentIds = lecture.assignments.map(a => a.id)
    submissions = await prisma.submission.findMany({
      where: { studentId: session.user.id, assignmentId: { in: assignmentIds } },
      include: { assignment: true },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lecture.title}</h1>
          {lecture.description && <p className="mt-2 text-gray-600">{lecture.description}</p>}
          <div className="mt-2 text-sm text-gray-500">
            المدة: {Math.floor(lecture.duration / 60)} دقيقة
          </div>
        </div>

        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
          <VideoPlayer lectureId={lecture.id} />
        </div>

        {(session.user.role === 'TEACHER' || session.user.role === 'ADMIN') && (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap gap-4">
            <h3 className="w-full text-lg font-bold mb-2">أدوات المدرس</h3>
            <GenerateCodesModal lectureId={lecture.id} lectureTitle={lecture.title} />
            <AddAssignmentModal lectureId={lecture.id} />
          </div>
        )}

        {session.user.role === 'STUDENT' && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">الواجبات والاختبارات</h2>
            {lecture.assignments.map((assignment) => {
              const existing = submissions.find(s => s.assignmentId === assignment.id)
              return (
                <MCQForm
                  key={assignment.id}
                  assignment={assignment}
                  existingSubmission={existing}
                />
              )
            })}
            {lecture.assignments.length === 0 && (
              <p className="text-gray-500">لا توجد واجبات لهذه المحاضرة بعد.</p>
            )}
          </section>
        )}

        {session.user.role === 'STUDENT' && (
          <QuestionBox lectureId={lecture.id} />
        )}
      </div>
    </div>
  )
}