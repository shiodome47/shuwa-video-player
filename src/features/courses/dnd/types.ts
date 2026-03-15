// ドラッグ種別とソータブル ID のプレフィックス管理

// ─── ドラッグデータ型 ────────────────────────────────────────────

export interface CourseDragData {
  type: 'course'
  courseId: string
}

export interface SectionDragData {
  type: 'section'
  sectionId: string
  courseId: string
}

export interface LessonDragData {
  type: 'lesson'
  lessonId: string
  sectionId: string
  courseId: string
}

export type DragData = CourseDragData | SectionDragData | LessonDragData

// ─── ID プレフィックス ───────────────────────────────────────────

const COURSE_PREFIX = 'course::'
const SECTION_PREFIX = 'section::'
const LESSON_PREFIX = 'lesson::'
const SECTION_DROP_ZONE_PREFIX = 'section-drop-zone::'
const COURSE_DROP_ZONE_PREFIX = 'course-drop-zone::'

// Course
export function makeCourseSortableId(courseId: string): string {
  return `${COURSE_PREFIX}${courseId}`
}
export function parseCourseSortableId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(COURSE_PREFIX) ? s.slice(COURSE_PREFIX.length) : null
}

// Section
export function makeSectionSortableId(sectionId: string): string {
  return `${SECTION_PREFIX}${sectionId}`
}
export function parseSectionSortableId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(SECTION_PREFIX) ? s.slice(SECTION_PREFIX.length) : null
}

// Lesson
export function makeLessonSortableId(lessonId: string): string {
  return `${LESSON_PREFIX}${lessonId}`
}
export function parseLessonSortableId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(LESSON_PREFIX) ? s.slice(LESSON_PREFIX.length) : null
}

// Section drop zone (空セクションへのレッスンドロップ用)
export function makeSectionDropZoneId(sectionId: string): string {
  return `${SECTION_DROP_ZONE_PREFIX}${sectionId}`
}
export function parseSectionDropZoneId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(SECTION_DROP_ZONE_PREFIX) ? s.slice(SECTION_DROP_ZONE_PREFIX.length) : null
}

// Course drop zone (空コースへのセクションドロップ用)
export function makeCourseDropZoneId(courseId: string): string {
  return `${COURSE_DROP_ZONE_PREFIX}${courseId}`
}
export function parseCourseDropZoneId(id: string | number): string | null {
  const s = String(id)
  return s.startsWith(COURSE_DROP_ZONE_PREFIX) ? s.slice(COURSE_DROP_ZONE_PREFIX.length) : null
}
