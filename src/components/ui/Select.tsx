import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

/**
 * スタイル済み select 要素。
 * カテゴリ選択など、選択肢が固定の場合に使用する。
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full cursor-pointer appearance-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2',
        'text-sm text-neutral-100',
        'transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)

Select.displayName = 'Select'
