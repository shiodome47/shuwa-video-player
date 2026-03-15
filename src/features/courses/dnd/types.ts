// ドラッグ種別とソータブル ID のプレフィックス管理

export interface LessonDragData {
  type: 'lesson'
  lessonId: string
  sectionId: string
  courseId: string
}

const LESSON_PREFIX = 'lesson::'
const DROP_ZONE_PREFIX = 'drop-zone::'

export function makeLessonSortableId(lessonId: string): string {
  return `${LESSON_PREFIX}${lessonId}`
}

export function parseLessonSortableId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(LESSON_PREFIX) ? s.slice(LESSON_PREFIX.length) : null
}

export function makeDropZoneId(sectionId: string): string {
  return `${DROP_ZONE_PREFIX}${sectionId}`
}

export function parseDropZoneId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(DROP_ZONE_PREFIX) ? s.slice(DROP_ZONE_PREFIX.length) : null
}
