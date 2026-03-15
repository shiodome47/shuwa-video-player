import { CheckCircle2, Circle, GripVertical } from 'lucide-react'
import type { Lesson } from '../../../types'

export function LessonDragOverlay({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-neutral-800 px-1 py-1.5 shadow-lg ring-1 ring-accent-500/40">
      <span className="flex-shrink-0 p-0.5 text-neutral-700">
        <GripVertical className="h-3 w-3" />
      </span>
      <span className="flex items-center gap-2">
        {lesson.isCompleted ? (
          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-accent-500" />
        ) : (
          <Circle className="h-3 w-3 flex-shrink-0 text-neutral-600" />
        )}
        <span className="truncate text-[11px] text-neutral-300">{lesson.title}</span>
      </span>
    </div>
  )
}
