import { ChevronRight, GripVertical } from 'lucide-react'
import type { Section } from '../../../types'

export function SectionDragOverlay({ section }: { section: Section }) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-neutral-800 px-1 py-1.5 shadow-lg ring-1 ring-accent-500/40">
      <span className="flex-shrink-0 p-0.5 text-neutral-700">
        <GripVertical className="h-3 w-3" />
      </span>
      <ChevronRight className="h-3 w-3 flex-shrink-0 text-neutral-600" />
      <span className="truncate text-[11px] font-medium text-neutral-400">
        {section.title}
      </span>
    </div>
  )
}
