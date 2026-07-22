import { Role } from '@prisma/client'

// نوع موحد للأدوار (للاستخدام في مكونات العميل)
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type UserSession = {
  id: string
  email: string
  name?: string
  role: UserRole
}

export type MCQQuestion = {
  question: string
  options: string[]
  correctIndex: number
}

export type AssignmentData = {
  title: string
  questions: MCQQuestion[]
  dueDate?: string
}

export type SubmissionAnswers = Record<number, number>

// أنواع للدروس والاختبارات
export type LessonType = 'VIDEO' | 'QUIZ' | 'DOCUMENT'
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'NUMBER'