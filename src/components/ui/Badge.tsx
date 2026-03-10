import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: ReactNode
  className?: string
}

/**
 * カテゴリラベル等に使う小さなバッジ。
 */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium',
        'bg-neutral-800 text-neutral-400 ring-1 ring-inset ring-neutral-700/50',
        className,
      )}
    >
      {children}
    </span>
  )
}
