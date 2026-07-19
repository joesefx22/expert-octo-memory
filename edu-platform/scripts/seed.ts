import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ... إنشاء المستخدمين كما في السابق
  // إضافة كورس مع وحدات ودروس
  const course = await prisma.course.create({
    data: {
      title: 'دورة React.js الشاملة',
      description: 'تعلم React من الصفر حتى الاحتراف مع مشاريع عملية.',
      isFree: false,
      price: 49.99,
      teacherId: teacher.id,
    },
  })

  const module1 = await prisma.module.create({
    data: { title: 'المقدمة', order: 1, courseId: course.id },
  })

  await prisma.lesson.create({
    data: {
      title: 'ما هو React؟',
      videoId: 'your-video-guid-here',
      duration: 600,
      order: 1,
      moduleId: module1.id,
      type: 'VIDEO',
    },
  })

  // يمكن إضافة المزيد ...
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // تنظيف البيانات القديمة
  await prisma.submission.deleteMany()
  await prisma.code.deleteMany()
  await prisma.question.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.lecture.deleteMany()
  await prisma.user.deleteMany()

  const adminPass = await bcrypt.hash('admin123', 12)
  const teacherPass = await bcrypt.hash('teacher123', 12)
  const studentPass = await bcrypt.hash('student123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'المدير العام',
      email: 'admin@edu.com',
      password: adminPass,
      role: 'ADMIN',
    },
  })

  const teacher = await prisma.user.create({
    data: {
      name: 'أستاذ أحمد',
      email: 'teacher@edu.com',
      password: teacherPass,
      role: 'TEACHER',
    },
  })

  const student = await prisma.user.create({
    data: {
      name: 'طالب محمد',
      email: 'student@edu.com',
      password: studentPass,
      role: 'STUDENT',
    },
  })

  // إضافة محاضرة تجريبية
  const lecture = await prisma.lecture.create({
    data: {
      title: 'مقدمة في البرمجة',
      description: 'تعلم أساسيات البرمجة بلغة TypeScript',
      videoId: '7f9e3b2c-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // ضع GUID حقيقي بعد رفع الفيديو
      duration: 3600, // 60 دقيقة
      isFree: true,
      teacherId: teacher.id,
    },
  })

  // كود شراء للمحاضرة المدفوعة
  const lecturePaid = await prisma.lecture.create({
    data: {
      title: 'React.js المتقدم',
      description: 'تعلم React.js من الصفر للاحتراف',
      videoId: '7f9e3b2c-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
      duration: 4800,
      isFree: false,
      price: 10,
      teacherId: teacher.id,
    },
  })

  await prisma.code.create({
    data: {
      code: 'A1B2C3D4',
      lectureId: lecturePaid.id,
      isUsed: false,
    },
  })

  console.log('تمت البذرة بنجاح')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // تنظيف
  await prisma.quizAnswer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.document.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.code.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  // المستخدمون
  const admin = await prisma.user.create({ data: { name: 'مدير', email: 'admin@edu.com', password: await bcrypt.hash('admin123', 12), role: 'ADMIN' } })
  const teacher = await prisma.user.create({ data: { name: 'أستاذ أحمد', email: 'teacher@edu.com', password: await bcrypt.hash('teacher123', 12), role: 'TEACHER' } })
  const student = await prisma.user.create({ data: { name: 'طالب محمد', email: 'student@edu.com', password: await bcrypt.hash('student123', 12), role: 'STUDENT' } })

  // كورس
  const course = await prisma.course.create({
    data: { title: 'React.js من الصفر', description: 'دورة شاملة', isFree: false, price: 29.99, teacherId: teacher.id },
  })

  // وحدة ودروس
  const mod1 = await prisma.module.create({ data: { title: 'أساسيات React', order: 1, courseId: course.id } })
  const lesson1 = await prisma.lesson.create({ data: { title: 'مقدمة', videoId: 'xxx-guid', duration: 600, order: 1, moduleId: mod1.id, type: 'VIDEO' } })
  const lesson2 = await prisma.lesson.create({ data: { title: 'اختبار صغير', order: 2, moduleId: mod1.id, type: 'QUIZ' } })
  const quiz = await prisma.quiz.create({ data: { lessonId: lesson2.id } })
  await prisma.question.create({
    data: {
      text: 'ما هو React؟',
      type: 'MCQ',
      options: ['مكتبة', 'إطار عمل', 'لغة'],
      answer: '0',
      quizId: quiz.id,
    },
  })

  // أكواد
  await prisma.code.create({ data: { code: 'REACT123', courseId: course.id } })

  console.log('تمت البذرة بنجاح')
}
main().catch(console.error).finally(() => prisma.$disconnect())