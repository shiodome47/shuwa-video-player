import type { ReactNode } from 'react'

interface EmptyStateProps {
  /** アイコン要素（Lucide コンポーネント等） */
  icon?: ReactNode
  title: string
  description?: string
  /** アクションボタン（例: "コースを追加"） */
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * データが空のときに表示する案内コンポーネント。
 * 「ここから始められる」という感覚を与え、アクションへ誘導する。
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 text-neutral-600 [&>svg]:h-12 [&>svg]:w-12">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-neutral-500">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-500"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
