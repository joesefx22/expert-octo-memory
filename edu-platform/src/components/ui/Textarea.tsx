import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 transition placeholder:text-gray-400',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
export default Textarea