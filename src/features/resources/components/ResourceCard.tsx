import { ExternalLink, GripVertical, Pencil, Star, Trash2 } from 'lucide-react'
import { forwardRef } from 'react'
import type { ResourceCategory, ResourceLink } from '../../../types'
import { getDomain } from '../../../utils/url'
import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import { useResourceStore } from '../store'

interface ResourceCardProps {
  link: ResourceLink
  category?: ResourceCategory
  onEdit: (link: ResourceLink) => void
  onDelete: (link: ResourceLink) => void
  style?: React.CSSProperties
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export const ResourceCard = forwardRef<HTMLDivElement, ResourceCardProps>(
  function ResourceCard({ link, category, onEdit, onDelete, style, dragHandleProps, ...rest }, ref) {
    const { updateLink, recordAccess } = useResourceStore()

    const handleOpen = async () => {
      window.open(link.url, '_blank', 'noopener,noreferrer')
      await recordAccess(link.id)
    }

    const handleFavoriteToggle = async () => {
      await updateLink(link.id, { isFavorited: !link.isFavorited })
    }

    return (
      <div
        ref={ref}
        style={style}
        className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
        {...rest}
      >
        {/* ヘッダー: ドラッグハンドル + お気に入り + カテゴリ */}
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1">
            {dragHandleProps && (
              <span
                className="flex cursor-grab items-center text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 touch-none"
                {...dragHandleProps}
              >
                <GripVertical className="h-3.5 w-3.5" />
              </span>
            )}
            <button
              onClick={handleFavoriteToggle}
              className={cn(
                'transition-colors',
                link.isFavorited ? 'text-amber-400' : 'text-neutral-700 hover:text-neutral-400',
              )}
              aria-label={link.isFavorited ? 'お気に入りを解除' : 'お気に入りに追加'}
              title={link.isFavorited ? 'お気に入りを解除' : 'お気に入りに追加'}
            >
              <Star className={cn('h-3.5 w-3.5', link.isFavorited && 'fill-amber-400')} />
            </button>
          </div>

          {category && <Badge>{category.name}</Badge>}
        </div>

        {/* タイトル */}
        <p className="mb-0.5 line-clamp-1 text-sm font-medium text-neutral-200">
          {link.title}
        </p>

        {/* ドメイン */}
        <p className="mb-2 text-[11px] text-neutral-600">{getDomain(link.url)}</p>

        {/* 説明 */}
        {link.description && (
          <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-neutral-500">
            {link.description}
          </p>
        )}

        {/* アクション */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <button
            onClick={handleOpen}
            className="flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
          >
            <ExternalLink className="h-3 w-3" />
            開く
          </button>

          {/* 編集・削除（ホバーで表示）*/}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit(link)}
              title="編集"
              className="rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(link)}
              title="削除"
              className="rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    )
  },
)
