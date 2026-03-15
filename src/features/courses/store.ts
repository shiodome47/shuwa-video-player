import { create } from 'zustand'
import { storage } from '../../storage/db'
import type { Course, Lesson, Section, VideoSource, VideoSourceType } from '../../types'

// ============================================================
// 入力型定義（Phase 3 の CRUD UI がそのまま使う）
// ============================================================

export interface CreateCourseInput {
  title: string
  description?: string
  coverImageUrl?: string
}

export interface UpdateCourseInput {
  title?: string
  description?: string
  coverImageUrl?: string
}

export interface CreateSectionInput {
  courseId: string
  title: string
}

export interface UpdateSectionInput {
  title?: string
}

export interface CreateLessonInput {
  sectionId: string
  courseId: string
  title: string
  description?: string
  tags?: string[]
}

export interface UpdateLessonInput {
  title?: string
  description?: string
  tags?: string[]
  isFavorited?: boolean
  isCompleted?: boolean
}

export interface CreateVideoSourceInput {
  lessonId: string
  type: VideoSourceType
  /** local: ファイル名 / remote: 外部 URL / youtube: YouTube URL */
  src: string
  displayName?: string
}

export interface UpdateVideoSourceInput {
  type?: VideoSourceType
  src?: string
  /** type === 'local' のときのファイルハンドルキー（Phase 4B）*/
  localFileHandleKey?: string
  displayName?: string
  durationSeconds?: number
}

// ============================================================
// ストア型定義
// ============================================================

interface CourseState {
  // --- データ ---
  courses: Course[]
  sections: Section[]
  lessons: Lesson[]
  videoSources: VideoSource[]

  // --- UI 状態 ---
  expandedCourseIds: string[]
  expandedSectionIds: string[]

  // --- 初期化 ---
  /** DB から全データをロードしてストアに反映する。App 起動時に一度だけ呼ぶ。 */
  loadAll: () => Promise<void>

  // --- UI アクション ---
  toggleCourseExpanded: (courseId: string) => void
  toggleSectionExpanded: (sectionId: string) => void

  // --- Course CRUD ---
  addCourse: (data: CreateCourseInput) => Promise<Course>
  updateCourse: (id: string, data: UpdateCourseInput) => Promise<void>
  /** 配下のセクション・レッスン・動画ソースをカスケード削除する */
  deleteCourse: (id: string) => Promise<void>

  // --- Section CRUD ---
  addSection: (data: CreateSectionInput) => Promise<Section>
  updateSection: (id: string, data: UpdateSectionInput) => Promise<void>
  /** 配下のレッスン・動画ソースをカスケード削除する */
  deleteSection: (id: string) => Promise<void>

  // --- Lesson CRUD ---
  addLesson: (data: CreateLessonInput) => Promise<Lesson>
  updateLesson: (id: string, data: UpdateLessonInput) => Promise<void>
  /** 配下の動画ソースをカスケード削除する */
  deleteLesson: (id: string) => Promise<void>

  // --- VideoSource CRUD ---
  addVideoSource: (data: CreateVideoSourceInput) => Promise<VideoSource>
  updateVideoSource: (id: string, data: UpdateVideoSourceInput) => Promise<void>
  deleteVideoSource: (id: string) => Promise<void>

  // --- 並び替え ---
  reorderCourses: (orderedIds: string[]) => Promise<void>
  reorderSections: (orderedIds: string[]) => Promise<void>
  reorderLessons: (orderedIds: string[]) => Promise<void>

  // --- セクション間移動 ---
  /** レッスンを別のセクションの指定位置に移動する */
  moveLesson: (lessonId: string, targetSectionId: string, targetIndex: number) => Promise<void>
}

// ============================================================
// ストア実装
// ============================================================

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  sections: [],
  lessons: [],
  videoSources: [],
  expandedCourseIds: [],
  expandedSectionIds: [],

  // ─── 初期化 ───────────────────────────────────────────────

  loadAll: async () => {
    const [courses, sections, lessons, videoSources] = await Promise.all([
      storage.getAll<Course>('courses'),
      storage.getAll<Section>('sections'),
      storage.getAll<Lesson>('lessons'),
      storage.getAll<VideoSource>('videoSources'),
    ])
    set({ courses, sections, lessons, videoSources })
  },

  // ─── UI アクション ────────────────────────────────────────

  toggleCourseExpanded: (courseId) =>
    set((s) => ({
      expandedCourseIds: s.expandedCourseIds.includes(courseId)
        ? s.expandedCourseIds.filter((id) => id !== courseId)
        : [...s.expandedCourseIds, courseId],
    })),

  toggleSectionExpanded: (sectionId) =>
    set((s) => ({
      expandedSectionIds: s.expandedSectionIds.includes(sectionId)
        ? s.expandedSectionIds.filter((id) => id !== sectionId)
        : [...s.expandedSectionIds, sectionId],
    })),

  // ─── Course CRUD ─────────────────────────────────────────

  addCourse: async (data) => {
    const now = new Date().toISOString()
    const course: Course = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description ?? '',
      coverImageUrl: data.coverImageUrl,
      order: get().courses.length,
      createdAt: now,
      updatedAt: now,
    }
    await storage.put('courses', course)
    set((s) => ({ courses: [...s.courses, course] }))
    return course
  },

  updateCourse: async (id, data) => {
    const existing = get().courses.find((c) => c.id === id)
    if (!existing) return
    const updated: Course = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await storage.put('courses', updated)
    set((s) => ({ courses: s.courses.map((c) => (c.id === id ? updated : c)) }))
  },

  deleteCourse: async (id) => {
    const state = get()
    const sectionIds = state.sections.filter((s) => s.courseId === id).map((s) => s.id)
    const lessonIds = state.lessons.filter((l) => l.courseId === id).map((l) => l.id)
    const vsIds = state.videoSources.filter((vs) => lessonIds.includes(vs.lessonId)).map((vs) => vs.id)

    // 原子的に削除（整合性保証）
    await storage.transaction(async () => {
      await Promise.all([
        ...vsIds.map((vsId) => storage.delete('videoSources', vsId)),
        ...lessonIds.map((lId) => storage.delete('lessons', lId)),
        ...sectionIds.map((sId) => storage.delete('sections', sId)),
        storage.delete('courses', id),
      ])
    })

    set((s) => ({
      courses: s.courses.filter((c) => c.id !== id),
      sections: s.sections.filter((sec) => !sectionIds.includes(sec.id)),
      lessons: s.lessons.filter((l) => !lessonIds.includes(l.id)),
      videoSources: s.videoSources.filter((vs) => !vsIds.includes(vs.id)),
    }))
  },

  // ─── Section CRUD ─────────────────────────────────────────

  addSection: async (data) => {
    const now = new Date().toISOString()
    const siblingCount = get().sections.filter((s) => s.courseId === data.courseId).length
    const section: Section = {
      id: crypto.randomUUID(),
      courseId: data.courseId,
      title: data.title,
      order: siblingCount,
      createdAt: now,
      updatedAt: now,
    }
    await storage.put('sections', section)
    set((s) => ({ sections: [...s.sections, section] }))
    return section
  },

  updateSection: async (id, data) => {
    const existing = get().sections.find((s) => s.id === id)
    if (!existing) return
    const updated: Section = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await storage.put('sections', updated)
    set((s) => ({ sections: s.sections.map((sec) => (sec.id === id ? updated : sec)) }))
  },

  deleteSection: async (id) => {
    const state = get()
    const lessonIds = state.lessons.filter((l) => l.sectionId === id).map((l) => l.id)
    const vsIds = state.videoSources.filter((vs) => lessonIds.includes(vs.lessonId)).map((vs) => vs.id)

    await storage.transaction(async () => {
      await Promise.all([
        ...vsIds.map((vsId) => storage.delete('videoSources', vsId)),
        ...lessonIds.map((lId) => storage.delete('lessons', lId)),
        storage.delete('sections', id),
      ])
    })

    set((s) => ({
      sections: s.sections.filter((sec) => sec.id !== id),
      lessons: s.lessons.filter((l) => !lessonIds.includes(l.id)),
      videoSources: s.videoSources.filter((vs) => !vsIds.includes(vs.id)),
    }))
  },

  // ─── Lesson CRUD ─────────────────────────────────────────

  addLesson: async (data) => {
    const now = new Date().toISOString()
    const siblingCount = get().lessons.filter((l) => l.sectionId === data.sectionId).length
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      sectionId: data.sectionId,
      courseId: data.courseId,
      title: data.title,
      description: data.description ?? '',
      order: siblingCount,
      tags: data.tags ?? [],
      isFavorited: false,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    }
    await storage.put('lessons', lesson)
    set((s) => ({ lessons: [...s.lessons, lesson] }))
    return lesson
  },

  updateLesson: async (id, data) => {
    const existing = get().lessons.find((l) => l.id === id)
    if (!existing) return
    const updated: Lesson = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await storage.put('lessons', updated)
    set((s) => ({ lessons: s.lessons.map((l) => (l.id === id ? updated : l)) }))
  },

  deleteLesson: async (id) => {
    const vsIds = get().videoSources.filter((vs) => vs.lessonId === id).map((vs) => vs.id)

    await storage.transaction(async () => {
      await Promise.all([
        ...vsIds.map((vsId) => storage.delete('videoSources', vsId)),
        storage.delete('lessons', id),
      ])
    })

    set((s) => ({
      lessons: s.lessons.filter((l) => l.id !== id),
      videoSources: s.videoSources.filter((vs) => !vsIds.includes(vs.id)),
    }))
  },

  // ─── VideoSource CRUD ────────────────────────────────────

  addVideoSource: async (data) => {
    const now = new Date().toISOString()
    const videoSource: VideoSource = {
      id: crypto.randomUUID(),
      lessonId: data.lessonId,
      type: data.type,
      src: data.src,
      displayName: data.displayName,
      createdAt: now,
      updatedAt: now,
    }
    await storage.put('videoSources', videoSource)
    set((s) => ({ videoSources: [...s.videoSources, videoSource] }))
    return videoSource
  },

  updateVideoSource: async (id, data) => {
    const existing = get().videoSources.find((vs) => vs.id === id)
    if (!existing) return
    const updated: VideoSource = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await storage.put('videoSources', updated)
    set((s) => ({
      videoSources: s.videoSources.map((vs) => (vs.id === id ? updated : vs)),
    }))
  },

  deleteVideoSource: async (id) => {
    await storage.delete('videoSources', id)
    set((s) => ({ videoSources: s.videoSources.filter((vs) => vs.id !== id) }))
  },

  // ─── 並び替え ─────────────────────────────────────────────

  reorderCourses: async (orderedIds) => {
    const now = new Date().toISOString()
    const updated = orderedIds.map((id, index) => ({
      ...get().courses.find((c) => c.id === id)!,
      order: index,
      updatedAt: now,
    }))
    set((s) => ({ courses: s.courses.map((c) => updated.find((u) => u.id === c.id) ?? c) }))
    await Promise.all(updated.map((c) => storage.put('courses', c)))
  },

  reorderSections: async (orderedIds) => {
    const now = new Date().toISOString()
    const updated = orderedIds.map((id, index) => ({
      ...get().sections.find((s) => s.id === id)!,
      order: index,
      updatedAt: now,
    }))
    set((s) => ({ sections: s.sections.map((sec) => updated.find((u) => u.id === sec.id) ?? sec) }))
    await Promise.all(updated.map((s) => storage.put('sections', s)))
  },

  reorderLessons: async (orderedIds) => {
    const now = new Date().toISOString()
    const updated = orderedIds.map((id, index) => ({
      ...get().lessons.find((l) => l.id === id)!,
      order: index,
      updatedAt: now,
    }))
    set((s) => ({ lessons: s.lessons.map((l) => updated.find((u) => u.id === l.id) ?? l) }))
    await Promise.all(updated.map((l) => storage.put('lessons', l)))
  },

  // ─── セクション間移動 ──────────────────────────────────────

  moveLesson: async (lessonId, targetSectionId, targetIndex) => {
    const state = get()
    const lesson = state.lessons.find((l) => l.id === lessonId)
    if (!lesson) return

    const sourceSectionId = lesson.sectionId
    const targetSection = state.sections.find((s) => s.id === targetSectionId)
    if (!targetSection) return

    const now = new Date().toISOString()
    const targetCourseId = targetSection.courseId

    // 移動元セクションのレッスン（移動対象を除外して order 詰め直し）
    const sourceLessons = state.lessons
      .filter((l) => l.sectionId === sourceSectionId && l.id !== lessonId)
      .sort((a, b) => a.order - b.order)
      .map((l, i) => ({ ...l, order: i, updatedAt: now }))

    // 移動先セクションのレッスン（挿入位置に追加して order 再インデックス）
    const targetLessonsOld = state.lessons
      .filter((l) => l.sectionId === targetSectionId && l.id !== lessonId)
      .sort((a, b) => a.order - b.order)

    const clampedIndex = Math.min(Math.max(0, targetIndex), targetLessonsOld.length)
    const movedLesson: Lesson = {
      ...lesson,
      sectionId: targetSectionId,
      courseId: targetCourseId,
      updatedAt: now,
      order: 0, // 仮値、下で再インデックス
    }

    const targetLessonsNew = [
      ...targetLessonsOld.slice(0, clampedIndex),
      movedLesson,
      ...targetLessonsOld.slice(clampedIndex),
    ].map((l, i) => ({ ...l, order: i, updatedAt: now }))

    // 全変更対象のレッスン
    const allUpdated = [...sourceLessons, ...targetLessonsNew]

    // Zustand state を一括更新
    set((s) => ({
      lessons: s.lessons.map((l) => allUpdated.find((u) => u.id === l.id) ?? l),
    }))

    // DB に原子的に永続化
    await storage.transaction(async () => {
      await Promise.all(allUpdated.map((l) => storage.put('lessons', l)))
    })
  },
}))

// ============================================================
// セレクター（コンポーネントで使う派生データ）
// ============================================================

/** 指定コースに属するセクションを order 順で返す */
export function selectSectionsByCourse(state: CourseState, courseId: string): Section[] {
  return state.sections
    .filter((s) => s.courseId === courseId)
    .sort((a, b) => a.order - b.order)
}

/** 指定セクションに属するレッスンを order 順で返す */
export function selectLessonsBySection(state: CourseState, sectionId: string): Lesson[] {
  return state.lessons
    .filter((l) => l.sectionId === sectionId)
    .sort((a, b) => a.order - b.order)
}

/** 指定レッスンに紐づく動画ソース一覧を返す */
export function selectVideoSourcesByLesson(
  state: CourseState,
  lessonId: string,
): VideoSource[] {
  return state.videoSources.filter((vs) => vs.lessonId === lessonId)
}
