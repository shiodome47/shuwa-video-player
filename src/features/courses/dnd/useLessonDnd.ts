import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useRef, useState } from 'react'
import type { Lesson } from '../../../types'
import { useCourseStore, selectLessonsBySection } from '../store'
import {
  type LessonDragData,
  parseLessonSortableId,
  parseDropZoneId,
} from './types'
import { lessonCollisionDetection } from './collisionDetection'

const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 4 } } as const
const TOUCH_SENSOR_OPTIONS = { activationConstraint: { delay: 200, tolerance: 5 } } as const

/** 折りたたみセクション自動展開の遅延 (ms) */
const AUTO_EXPAND_DELAY = 500

export function useLessonDnd() {
  const { reorderLessons, moveLesson, expandedSectionIds, toggleSectionExpanded } = useCourseStore()
  const state = useCourseStore()

  const [activeDragLesson, setActiveDragLesson] = useState<Lesson | null>(null)
  const [dropTargetSectionId, setDropTargetSectionId] = useState<string | null>(null)

  // 自動展開タイマー
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expandTargetRef = useRef<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
  )

  const clearExpandTimer = useCallback(() => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current)
      expandTimerRef.current = null
    }
    expandTargetRef.current = null
  }, [])

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as LessonDragData | undefined
      if (data?.type !== 'lesson') return
      const lesson = state.lessons.find((l) => l.id === data.lessonId)
      if (lesson) setActiveDragLesson(lesson)
    },
    [state.lessons],
  )

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      if (!over) {
        setDropTargetSectionId(null)
        clearExpandTimer()
        return
      }

      // ドロップ先のセクションIDを特定
      let targetSectionId: string | null = null

      const dropZoneSectionId = parseDropZoneId(over.id)
      if (dropZoneSectionId) {
        targetSectionId = dropZoneSectionId
      } else {
        const lessonId = parseLessonSortableId(over.id)
        if (lessonId) {
          const targetLesson = state.lessons.find((l) => l.id === lessonId)
          if (targetLesson) targetSectionId = targetLesson.sectionId
        }
      }

      setDropTargetSectionId(targetSectionId)

      // 折りたたみセクションの自動展開
      if (targetSectionId && !expandedSectionIds.includes(targetSectionId)) {
        if (expandTargetRef.current !== targetSectionId) {
          clearExpandTimer()
          expandTargetRef.current = targetSectionId
          expandTimerRef.current = setTimeout(() => {
            toggleSectionExpanded(targetSectionId!)
            expandTargetRef.current = null
          }, AUTO_EXPAND_DELAY)
        }
      } else {
        clearExpandTimer()
      }
    },
    [state.lessons, expandedSectionIds, toggleSectionExpanded, clearExpandTimer],
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveDragLesson(null)
      setDropTargetSectionId(null)
      clearExpandTimer()

      if (!over) return

      const dragData = active.data.current as LessonDragData | undefined
      if (dragData?.type !== 'lesson') return

      const sourceSectionId = dragData.sectionId
      const draggedLessonId = dragData.lessonId

      // ドロップゾーンの場合: 空セクションへの移動
      const dropZoneSectionId = parseDropZoneId(over.id)
      if (dropZoneSectionId) {
        if (dropZoneSectionId !== sourceSectionId) {
          void moveLesson(draggedLessonId, dropZoneSectionId, 0)
        }
        return
      }

      // レッスン上へのドロップ
      const overLessonId = parseLessonSortableId(over.id)
      if (!overLessonId) return

      const overLesson = state.lessons.find((l) => l.id === overLessonId)
      if (!overLesson) return

      const targetSectionId = overLesson.sectionId

      if (sourceSectionId === targetSectionId) {
        // 同一セクション内の並び替え
        if (draggedLessonId === overLessonId) return
        const sectionLessons = selectLessonsBySection(state, sourceSectionId)
        const oldIndex = sectionLessons.findIndex((l) => l.id === draggedLessonId)
        const newIndex = sectionLessons.findIndex((l) => l.id === overLessonId)
        if (oldIndex === -1 || newIndex === -1) return
        void reorderLessons(arrayMove(sectionLessons, oldIndex, newIndex).map((l) => l.id))
      } else {
        // 別セクションへの移動
        const targetLessons = selectLessonsBySection(state, targetSectionId)
        const targetIndex = targetLessons.findIndex((l) => l.id === overLessonId)
        void moveLesson(draggedLessonId, targetSectionId, targetIndex === -1 ? 0 : targetIndex)
      }
    },
    [state, reorderLessons, moveLesson, clearExpandTimer],
  )

  const onDragCancel = useCallback(() => {
    setActiveDragLesson(null)
    setDropTargetSectionId(null)
    clearExpandTimer()
  }, [clearExpandTimer])

  return {
    sensors,
    collisionDetection: lessonCollisionDetection,
    activeDragLesson,
    dropTargetSectionId,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  }
}
