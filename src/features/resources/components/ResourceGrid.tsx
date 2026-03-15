import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { ResourceCategory, ResourceLink } from '../../../types'
import { makeLinkSortableId, parseLinkSortableId } from '../dnd/types'
import { ResourceCard } from './ResourceCard'

interface ResourceGridProps {
  links: ResourceLink[]
  categories: ResourceCategory[]
  onEditLink: (link: ResourceLink) => void
  onDeleteLink: (link: ResourceLink) => void
  onReorder?: (orderedIds: string[]) => void
}

// ── SortableResourceCard ────────────────────────────────────

interface SortableResourceCardProps {
  link: ResourceLink
  category?: ResourceCategory
  onEdit: (link: ResourceLink) => void
  onDelete: (link: ResourceLink) => void
}

function SortableResourceCard({ link, category, onEdit, onDelete }: SortableResourceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: makeLinkSortableId(link.id) })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <ResourceCard
      ref={setNodeRef}
      style={style}
      link={link}
      category={category}
      onEdit={onEdit}
      onDelete={onDelete}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  )
}

// ── ResourceGrid ────────────────────────────────────────────

export function ResourceGrid({
  links,
  categories,
  onEditLink,
  onDeleteLink,
  onReorder,
}: ResourceGridProps) {
  const dndEnabled = !!onReorder

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeLink = activeId
    ? links.find((l) => l.id === parseLinkSortableId(activeId))
    : null

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const sortableIds = links.map((l) => makeLinkSortableId(l.id))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(links, oldIndex, newIndex)
    onReorder?.(reordered.map((l) => l.id))
  }

  // DnD 無効時はシンプルなグリッドを表示
  if (!dndEnabled) {
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {links.map((link) => (
            <SortableResourceCard
              key={link.id}
              link={link}
              category={categories.find((c) => c.id === link.categoryId)}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeLink && (
          <div className="w-64 rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-lg shadow-black/40">
            <p className="line-clamp-1 text-sm font-medium text-neutral-200">
              {activeLink.title}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
