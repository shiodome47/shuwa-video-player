import {
  closestCenter,
  type CollisionDetection,
} from '@dnd-kit/core'
import { parseLessonSortableId, parseDropZoneId } from './types'

/**
 * レッスンアイテムとセクションドロップゾーンのみを有効ターゲットとする衝突検出。
 * セクションやコースのソータブルアイテムは対象外にフィルタリングする。
 */
export const lessonCollisionDetection: CollisionDetection = (args) => {
  // 有効なターゲット（lesson:: / drop-zone:: プレフィックス付き）のみに絞る
  const filtered = {
    ...args,
    droppableContainers: args.droppableContainers.filter((container) => {
      const id = container.id
      return parseLessonSortableId(id) !== null || parseDropZoneId(id) !== null
    }),
  }
  return closestCenter(filtered)
}
