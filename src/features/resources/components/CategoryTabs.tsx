import { Pencil, Trash2 } from 'lucide-react'
import type { ResourceCategory } from '../../../types'
import { cn } from '../../../utils/cn'

interface CategoryTabsProps {
  categories: ResourceCategory[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Phase 3 で追加: カテゴリ編集・削除ハンドラ */
  onEditCategory?: (category: ResourceCategory) => void
  onDeleteCategory?: (category: ResourceCategory) => void
}

/**
 * リソースハブのカテゴリフィルタタブ。
 * 「すべて」タブ + 各カテゴリタブ。
 * 各カテゴリタブにはホバーで編集・削除ボタンが表示される。
 */
export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
  onEditCategory,
  onDeleteCategory,
}: CategoryTabsProps) {
  const tabBase =
    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500'
  const tabActive = 'bg-neutral-800 text-neutral-100'
  const tabInactive = 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60'

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-800 px-4 py-2">
      {/* 「すべて」タブ */}
      <button
        onClick={() => onSelect(null)}
        className={cn(tabBase, selectedId === null ? tabActive : tabInactive)}
      >
        すべて
      </button>

      {/* 各カテゴリタブ */}
      {[...categories].sort((a, b) => a.order - b.order).map((cat) => (
        <div key={cat.id} className="group relative flex-shrink-0">
          <button
            onClick={() => onSelect(cat.id)}
            className={cn(
              tabBase,
              'pr-1',
              selectedId === cat.id ? tabActive : tabInactive,
            )}
          >
            {cat.name}
            {/* 編集・削除ボタン（ホバーで表示）*/}
            {(onEditCategory || onDeleteCategory) && (
              <span
                className="ml-1.5 inline-flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                {onEditCategory && (
                  <span
                    role="button"
                    title="カテゴリを編集"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditCategory(cat)
                    }}
                    className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded text-neutral-500 hover:text-neutral-200"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </span>
                )}
                {onDeleteCategory && (
                  <span
                    role="button"
                    title="カテゴリを削除"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteCategory(cat)
                    }}
                    className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </span>
                )}
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
