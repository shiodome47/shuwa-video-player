import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

/**
 * スタイル済みテキストエリア。
 * フォームの説明欄等で使用する。
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2',
        'text-sm text-neutral-100 placeholder:text-neutral-600',
        'transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)

Textarea.displayName = 'Textarea'
