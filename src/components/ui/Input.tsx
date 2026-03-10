import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

/**
 * スタイル済みテキスト入力。
 * フォームの全 CRUD ダイアログで共通使用する。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2',
        'text-sm text-neutral-100 placeholder:text-neutral-600',
        'transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
