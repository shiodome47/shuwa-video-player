import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-600 text-white hover:bg-accent-500 focus-visible:ring-accent-500',
  secondary:
    'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus-visible:ring-neutral-600',
  ghost:
    'bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-neutral-600',
  danger:
    'bg-red-950/60 text-red-400 hover:bg-red-950 hover:text-red-300 focus-visible:ring-red-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-md gap-1',
  md: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
        'disabled:pointer-events-none disabled:opacity-40',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
