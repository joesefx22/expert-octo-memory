import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ========== تنظيف جميع البيانات بترتيب يحترم العلاقات ==========
  await prisma.contestEntry.deleteMany()
  await prisma.contest.deleteMany()
  await prisma.videoBookmark.deleteMany()
  await prisma.watchProgress.deleteMany()
  await prisma.quizAnswer.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.document.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.code.deleteMany()
  await prisma.question.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.questionBank.deleteMany()
  await prisma.courseStats.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  // ========== إنشاء مستخدمين ==========
  const adminPass = await bcrypt.hash('admin123', 12)
  const teacherPass = await bcrypt.hash('teacher123', 12)
  const studentPass = await bcrypt.hash('student123', 12)

  const admin = await prisma.user.create({
    data: { name: 'مدير النظام', email: 'admin@edu.com', password: adminPass, role: 'ADMIN' },
  })

  const teacher = await prisma.user.create({
    data: { name: 'أستاذ أحمد', email: 'teacher@edu.com', password: teacherPass, role: 'TEACHER' },
  })

  const student = await prisma.user.create({
    data: { name: 'طالب محمد', email: 'student@edu.com', password: studentPass, role: 'STUDENT' },
  })

  // ========== إنشاء كورس جديد (Course → Module → Lesson → Quiz) ==========
  const course = await prisma.course.create({
    data: {
      title: 'React.js من الصفر',
      description: 'دورة شاملة لتعلم React.js خطوة بخطوة',
      price: 29.99,
      isFree: false,
      teacherId: teacher.id,
    },
  })

  const module1 = await prisma.module.create({
    data: { title: 'أساسيات React', order: 1, courseId: course.id },
  })

  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'مقدمة في React',
      videoId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      duration: 600,
      order: 1,
      type: 'VIDEO',
      moduleId: module1.id,
    },
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'اختبار صغير',
      order: 2,
      type: 'QUIZ',
      moduleId: module1.id,
    },
  })

  const quiz = await prisma.quiz.create({
    data: { lessonId: lesson2.id },
  })

  await prisma.quizQuestion.create({
    data: {
      text: 'ما هو React؟',
      type: 'MCQ',
      options: ['مكتبة', 'إطار عمل', 'لغة برمجة'],
      answer: '0',
      quizId: quiz.id,
    },
  })

  // كود شراء للكورس (الحقل courseId فقط)
  await prisma.code.create({
    data: {
      code: 'REACT123',
      courseId: course.id,
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.progress.create({
    data: {
      userId: student.id,
      lessonId: lesson1.id,
      courseId: course.id,
      completed: false,
    },
  })

  await prisma.notification.create({
    data: {
      userId: student.id,
      message: 'مرحباً بك في المنصة!',
    },
  })

  console.log('✅ تم إنشاء بيانات البذرة بنجاح')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })