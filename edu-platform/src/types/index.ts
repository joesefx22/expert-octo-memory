import { Role } from '@prisma/client'

export type UserSession = {
  id: string
  email: string
  name?: string
  role: Role
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