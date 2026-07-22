import { randomBytes } from 'crypto'

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// توليد كود عشوائي آمن باستخدام مكتبة التشفير الأصلية
export function generateRandomCode(length = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase()
}