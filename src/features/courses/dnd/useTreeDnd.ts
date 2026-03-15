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
import type { Course, Lesson, Section } from '../../../types'
import {
  useCourseStore,
  selectSectionsByCourse,
  selectLessonsBySection,
} from '../store'
import {
  type DragData,
  type CourseDragData,
  type SectionDragData,
  type LessonDragData,
  parseCourseSortableId,
  parseSectionSortableId,
  parseLessonSortableId,
  parseSectionDropZoneId,
  parseCourseDropZoneId,
} from './types'
import { treeCollisionDetection } from './collisionDetection'

const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 4 } } as const
const TOUCH_SENSOR_OPTIONS = { activationConstraint: { delay: 200, tolerance: 5 } } as const

/** 折りたたみ自動展開の遅延 (ms) */
const AUTO_EXPAND_DELAY = 500

export interface ActiveDrag {
  type: 'course' | 'section' | 'lesson'
  course?: Course
  section?: Section
  lesson?: Lesson
}

export function useTreeDnd() {
  const state = useCourseStore()
  const {
    reorderCourses,
    reorderSections,
    reorderLessons,
    moveSection,
    moveLesson,
    expandedCourseIds,
    expandedSectionIds,
    toggleCourseExpanded,
    toggleSectionExpanded,
  } = useCourseStore()

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const [dropTargetSectionId, setDropTargetSectionId] = useState<string | null>(null)
  const [dropTargetCourseId, setDropTargetCourseId] = useState<string | null>(null)

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

  const resetState = useCallback(() => {
    setActiveDrag(null)
    setDropTargetSectionId(null)
    setDropTargetCourseId(null)
    clearExpandTimer()
  }, [clearExpandTimer])

  // ─── onDragStart ───────────────────────────────────────────

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragData | undefined
      if (!data) return

      switch (data.type) {
        case 'course': {
          const course = state.courses.find((c) => c.id === data.courseId)
          if (course) setActiveDrag({ type: 'course', course })
          break
        }
        case 'section': {
          const section = state.sections.find((s) => s.id === data.sectionId)
          if (section) setActiveDrag({ type: 'section', section })
          break
        }
        case 'lesson': {
          const lesson = state.lessons.find((l) => l.id === data.lessonId)
          if (lesson) setActiveDrag({ type: 'lesson', lesson })
          break
        }
      }
    },
    [state.courses, state.sections, state.lessons],
  )

  // ─── onDragOver ────────────────────────────────────────────

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      const data = event.active.data.current as DragData | undefined

      if (!over || !data) {
        setDropTargetSectionId(null)
        setDropTargetCourseId(null)
        clearExpandTimer()
        return
      }

      if (data.type === 'section') {
        // セクションドラッグ: ターゲットコースをハイライト
        let targetCourseId: string | null = null

        const dropZoneCourseId = parseCourseDropZoneId(over.id)
        if (dropZoneCourseId) {
          targetCourseId = dropZoneCourseId
        } else {
          const sectionId = parseSectionSortableId(over.id)
          if (sectionId) {
            const targetSection = state.sections.find((s) => s.id === sectionId)
            if (targetSection) targetCourseId = targetSection.courseId
          } else {
            const courseId = parseCourseSortableId(over.id)
            if (courseId) targetCourseId = courseId
          }
        }

        setDropTargetCourseId(targetCourseId)
        setDropTargetSectionId(null)

        // 折りたたまれたコースの自動展開
        if (targetCourseId && !expandedCourseIds.includes(targetCourseId)) {
          if (expandTargetRef.current !== targetCourseId) {
            clearExpandTimer()
            expandTargetRef.current = targetCourseId
            expandTimerRef.current = setTimeout(() => {
              toggleCourseExpanded(targetCourseId!)
              expandTargetRef.current = null
            }, AUTO_EXPAND_DELAY)
          }
        } else {
          clearExpandTimer()
        }
      } else if (data.type === 'lesson') {
        // レッスンドラッグ: ターゲットセクションをハイライト
        let targetSectionId: string | null = null

        const dropZoneSectionId = parseSectionDropZoneId(over.id)
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
        setDropTargetCourseId(null)

        // 折りたたまれたセクションの自動展開
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
      } else {
        // コースドラッグ: 特別なハイライトなし
        setDropTargetSectionId(null)
        setDropTargetCourseId(null)
        clearExpandTimer()
      }
    },
    [
      state.sections,
      state.lessons,
      expandedCourseIds,
      expandedSectionIds,
      toggleCourseExpanded,
      toggleSectionExpanded,
      clearExpandTimer,
    ],
  )

  // ─── onDragEnd ─────────────────────────────────────────────

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      resetState()

      if (!over) return

      const data = active.data.current as DragData | undefined
      if (!data) return

      switch (data.type) {
        case 'course':
          handleCourseDrop(data, over.id)
          break
        case 'section':
          handleSectionDrop(data, over.id)
          break
        case 'lesson':
          handleLessonDrop(data, over.id)
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, reorderCourses, reorderSections, reorderLessons, moveSection, moveLesson, resetState],
  )

  // ─── ドロップハンドラー ────────────────────────────────────

  function handleCourseDrop(data: CourseDragData, overId: string | number) {
    const overCourseId = parseCourseSortableId(overId)
    if (!overCourseId || overCourseId === data.courseId) return

    const sorted = [...state.courses].sort((a, b) => a.order - b.order)
    const oldIndex = sorted.findIndex((c) => c.id === data.courseId)
    const newIndex = sorted.findIndex((c) => c.id === overCourseId)
    if (oldIndex === -1 || newIndex === -1) return

    void reorderCourses(arrayMove(sorted, oldIndex, newIndex).map((c) => c.id))
  }

  function handleSectionDrop(data: SectionDragData, overId: string | number) {
    // 空コースのドロップゾーンへ
    const dropZoneCourseId = parseCourseDropZoneId(overId)
    if (dropZoneCourseId) {
      if (dropZoneCourseId !== data.courseId) {
        void moveSection(data.sectionId, dropZoneCourseId, 0)
      }
      return
    }

    // コースヘッダーへのドロップ（折りたたみコースの末尾に追加）
    const overCourseId = parseCourseSortableId(overId)
    if (overCourseId) {
      if (overCourseId !== data.courseId) {
        const targetSections = selectSectionsByCourse(state, overCourseId)
        void moveSection(data.sectionId, overCourseId, targetSections.length)
      }
      return
    }

    // 他セクション上へのドロップ
    const overSectionId = parseSectionSortableId(overId)
    if (!overSectionId) return

    const overSection = state.sections.find((s) => s.id === overSectionId)
    if (!overSection) return

    const targetCourseId = overSection.courseId

    if (data.courseId === targetCourseId) {
      // 同一コース内の並び替え
      if (data.sectionId === overSectionId) return
      const courseSections = selectSectionsByCourse(state, targetCourseId)
      const oldIndex = courseSections.findIndex((s) => s.id === data.sectionId)
      const newIndex = courseSections.findIndex((s) => s.id === overSectionId)
      if (oldIndex === -1 || newIndex === -1) return
      void reorderSections(arrayMove(courseSections, oldIndex, newIndex).map((s) => s.id))
    } else {
      // 別コースへの移動
      const targetSections = selectSectionsByCourse(state, targetCourseId)
      const targetIndex = targetSections.findIndex((s) => s.id === overSectionId)
      void moveSection(data.sectionId, targetCourseId, targetIndex === -1 ? 0 : targetIndex)
    }
  }

  function handleLessonDrop(data: LessonDragData, overId: string | number) {
    // 空セクションのドロップゾーンへ
    const dropZoneSectionId = parseSectionDropZoneId(overId)
    if (dropZoneSectionId) {
      if (dropZoneSectionId !== data.sectionId) {
        void moveLesson(data.lessonId, dropZoneSectionId, 0)
      }
      return
    }

    // 他レッスン上へのドロップ
    const overLessonId = parseLessonSortableId(overId)
    if (!overLessonId) return

    const overLesson = state.lessons.find((l) => l.id === overLessonId)
    if (!overLesson) return

    const targetSectionId = overLesson.sectionId

    if (data.sectionId === targetSectionId) {
      // 同一セクション内の並び替え
      if (data.lessonId === overLessonId) return
      const sectionLessons = selectLessonsBySection(state, targetSectionId)
      const oldIndex = sectionLessons.findIndex((l) => l.id === data.lessonId)
      const newIndex = sectionLessons.findIndex((l) => l.id === overLessonId)
      if (oldIndex === -1 || newIndex === -1) return
      void reorderLessons(arrayMove(sectionLessons, oldIndex, newIndex).map((l) => l.id))
    } else {
      // 別セクションへの移動
      const targetLessons = selectLessonsBySection(state, targetSectionId)
      const targetIndex = targetLessons.findIndex((l) => l.id === overLessonId)
      void moveLesson(data.lessonId, targetSectionId, targetIndex === -1 ? 0 : targetIndex)
    }
  }

  return {
    sensors,
    collisionDetection: treeCollisionDetection,
    activeDrag,
    dropTargetSectionId,
    dropTargetCourseId,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel: resetState,
  }
}
