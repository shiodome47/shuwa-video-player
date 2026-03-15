import {
  closestCenter,
  type CollisionDetection,
} from '@dnd-kit/core'
import {
  type DragData,
  parseCourseSortableId,
  parseSectionSortableId,
  parseLessonSortableId,
  parseSectionDropZoneId,
  parseCourseDropZoneId,
} from './types'

/**
 * ドラッグ中のアイテムの種別に応じて、有効なドロップターゲットのみをフィルタリングする統合衝突検出。
 *
 * - course ドラッグ → course:: ターゲットのみ
 * - section ドラッグ → section:: / course-drop-zone:: / course::（自動展開・空コースドロップ用）
 * - lesson ドラッグ → lesson:: / section-drop-zone:: ターゲットのみ
 */
export const treeCollisionDetection: CollisionDetection = (args) => {
  const dragData = args.active.data.current as DragData | undefined

  const filtered = {
    ...args,
    droppableContainers: args.droppableContainers.filter((container) => {
      const id = container.id
      switch (dragData?.type) {
        case 'course':
          return parseCourseSortableId(id) !== null
        case 'section':
          return (
            parseSectionSortableId(id) !== null ||
            parseCourseDropZoneId(id) !== null ||
            parseCourseSortableId(id) !== null
          )
        case 'lesson':
          return parseLessonSortableId(id) !== null || parseSectionDropZoneId(id) !== null
        default:
          return false
      }
    }),
  }
  return closestCenter(filtered)
}
