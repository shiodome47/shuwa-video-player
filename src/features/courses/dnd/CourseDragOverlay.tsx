import { BookOpen, GripVertical } from 'lucide-react'
import type { Course } from '../../../types'

export function CourseDragOverlay({ course }: { course: Course }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-neutral-800 px-1 py-2 shadow-lg ring-1 ring-accent-500/40">
      <span className="flex-shrink-0 p-0.5 text-neutral-700">
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-neutral-500" />
      <span className="truncate text-xs font-medium text-neutral-300">
        {course.title}
      </span>
    </div>
  )
}
