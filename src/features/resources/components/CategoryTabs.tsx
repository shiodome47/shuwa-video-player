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
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ResourceCategory } from '../../../types'
import { cn } from '../../../utils/cn'
import { makeCategorySortableId, parseCategorySortableId } from '../dnd/types'

interface CategoryTabsProps {
  categories: ResourceCategory[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onEditCategory?: (category: ResourceCategory) => void
  onDeleteCategory?: (category: ResourceCategory) => void
  onReorder?: (orderedIds: string[]) => void
}

const tabBase =
  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500'
const tabActive = 'bg-neutral-800 text-neutral-100'
const tabInactive = 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60'

// ── SortableCategoryTab ─────────────────────────────────────

interface SortableCategoryTabProps {
  category: ResourceCategory
  isSelected: boolean
  onSelect: () => void
  onEdit?: (category: ResourceCategory) => void
  onDelete?: (category: ResourceCategory) => void
}

function SortableCategoryTab({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: SortableCategoryTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: makeCategorySortableId(category.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative flex-shrink-0 flex items-center">
      {/* ドラッグハンドル */}
      <span
        className="mr-0.5 flex cursor-grab items-center text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </span>

      <button
        onClick={onSelect}
        className={cn(tabBase, 'pr-1', isSelected ? tabActive : tabInactive)}
      >
        {category.name}
        {(onEdit || onDelete) && (
          <span
            className="ml-1.5 inline-flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <span
                role="button"
                title="カテゴリを編集"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(category)
                }}
                className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded text-neutral-500 hover:text-neutral-200"
              >
                <Pencil className="h-2.5 w-2.5" />
              </span>
            )}
            {onDelete && (
              <span
                role="button"
                title="カテゴリを削除"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(category)
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
  )
}

// ── CategoryTabs ────────────────────────────────────────────

export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
  onEditCategory,
  onDeleteCategory,
  onReorder,
}: CategoryTabsProps) {
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const sortableIds = sorted.map((c) => makeCategorySortableId(c.id))

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeCategory = activeId
    ? sorted.find((c) => c.id === parseCategorySortableId(activeId))
    : null

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

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

    const reordered = arrayMove(sorted, oldIndex, newIndex)
    onReorder?.(reordered.map((c) => c.id))
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-800 px-4 py-2">
      {/* 「すべて」タブ（固定） */}
      <button
        onClick={() => onSelect(null)}
        className={cn(tabBase, selectedId === null ? tabActive : tabInactive)}
      >
        すべて
      </button>

      {/* ソート可能カテゴリタブ */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
          {sorted.map((cat) => (
            <SortableCategoryTab
              key={cat.id}
              category={cat}
              isSelected={selectedId === cat.id}
              onSelect={() => onSelect(cat.id)}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
            />
          ))}
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeCategory && (
            <div className={cn(tabBase, tabActive, 'shadow-lg shadow-black/40')}>
              {activeCategory.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
