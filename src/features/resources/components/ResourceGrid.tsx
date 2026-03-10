import type { ResourceCategory, ResourceLink } from '../../../types'
import { ResourceCard } from './ResourceCard'

interface ResourceGridProps {
  links: ResourceLink[]
  categories: ResourceCategory[]
  onEditLink: (link: ResourceLink) => void
  onDeleteLink: (link: ResourceLink) => void
}

/**
 * リソースカードのグリッドレイアウト。
 * Phase 3: 編集・削除ハンドラを受け取り ResourceCard に渡す。
 */
export function ResourceGrid({
  links,
  categories,
  onEditLink,
  onDeleteLink,
}: ResourceGridProps) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {links.map((link) => (
        <ResourceCard
          key={link.id}
          link={link}
          category={categories.find((c) => c.id === link.categoryId)}
          onEdit={onEditLink}
          onDelete={onDeleteLink}
        />
      ))}
    </div>
  )
}
