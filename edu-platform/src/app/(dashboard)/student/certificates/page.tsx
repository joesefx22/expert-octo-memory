import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CertificateCard from '@/components/student/CertificateCard'

export default async function StudentCertificatesPage() {
  const session = await getServerSession(authOptions)
  const certificates = await prisma.certificate.findMany({
    where: { userId: session?.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { issueDate: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">شهاداتي</h1>
      {certificates.length === 0 ? (
        <p className="text-gray-500">لا توجد شهادات بعد</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  )
}