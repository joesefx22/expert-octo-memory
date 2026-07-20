export function cn(...classes: (string | false | null | undefined)[]) { return classes.filter(Boolean).join(' ') }
export function generateRandomCode(length = 8) { return Math.random().toString(36).slice(2, 2+length).toUpperCase() }
