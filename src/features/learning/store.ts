import { create } from 'zustand'
import { db } from '../../storage/db'
import type { Bookmark, Note, Progress } from '../../types'
import { useCourseStore } from '../courses/store'

/**
 * 学習支援ストア（Phase 5A）。
 * ブックマーク・メモ・進捗を一元管理する。
 *
 * 設計方針:
 * - データはレッスン選択時に Dexie からロードする（loadForLesson）
 * - Progress / Bookmark / Note はいずれも PK が id or lessonId のため
 *   StorageAdapter の制約を避けて db に直接アクセスする
 * - 完了トグルは Lesson.isCompleted と Progress.isCompleted を同期させる
 */
interface LearningStore {
  currentLessonId: string | null
  bookmarks: Bookmark[]
  notes: Note[]
  progress: Progress | null
  isLoading: boolean

  loadForLesson: (lessonId: string) => Promise<void>

  // ─── ブックマーク ─────────────────────────────────────────────
  addBookmark: (lessonId: string, positionSeconds: number, label: string) => Promise<void>
  updateBookmark: (id: string, label: string) => Promise<void>
  deleteBookmark: (id: string) => Promise<void>

  // ─── メモ ─────────────────────────────────────────────────────
  addNote: (lessonId: string, content: string, positionSeconds?: number) => Promise<void>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  // ─── 進捗 ─────────────────────────────────────────────────────
  /** 完了フラグを反転させ、Lesson.isCompleted と Progress を同期する */
  toggleCompletion: (lessonId: string, courseId: string) => Promise<void>
  /** 視聴時間を加算する（useProgressTracking から呼ぶ） */
  addWatchTime: (lessonId: string, courseId: string, seconds: number) => Promise<void>
}

export const useLearningStore = create<LearningStore>()((set, get) => ({
  currentLessonId: null,
  bookmarks: [],
  notes: [],
  progress: null,
  isLoading: false,

  loadForLesson: async (lessonId) => {
    if (get().currentLessonId === lessonId) return
    set({ isLoading: true, currentLessonId: lessonId, bookmarks: [], notes: [], progress: null })
    const [bookmarks, notes, progress] = await Promise.all([
      db.bookmarks.where('lessonId').equals(lessonId).sortBy('positionSeconds'),
      db.notes.where('lessonId').equals(lessonId).toArray(),
      db.progresses.get(lessonId),
    ])
    set({ bookmarks, notes, progress: progress ?? null, isLoading: false })
  },

  // ─── ブックマーク ─────────────────────────────────────────────
  addBookmark: async (lessonId, positionSeconds, label) => {
    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      lessonId,
      positionSeconds,
      label,
      createdAt: new Date().toISOString(),
    }
    await db.bookmarks.put(bookmark)
    set((s) => ({
      bookmarks: [...s.bookmarks, bookmark].sort((a, b) => a.positionSeconds - b.positionSeconds),
    }))
  },

  updateBookmark: async (id, label) => {
    await db.bookmarks.update(id, { label })
    set((s) => ({
      bookmarks: s.bookmarks.map((b) => (b.id === id ? { ...b, label } : b)),
    }))
  },

  deleteBookmark: async (id) => {
    await db.bookmarks.delete(id)
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }))
  },

  // ─── メモ ─────────────────────────────────────────────────────
  addNote: async (lessonId, content, positionSeconds) => {
    const now = new Date().toISOString()
    const note: Note = {
      id: crypto.randomUUID(),
      lessonId,
      content,
      positionSeconds,
      createdAt: now,
      updatedAt: now,
    }
    await db.notes.put(note)
    set((s) => ({ notes: [...s.notes, note] }))
  },

  updateNote: async (id, content) => {
    const updatedAt = new Date().toISOString()
    await db.notes.update(id, { content, updatedAt })
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, content, updatedAt } : n)),
    }))
  },

  deleteNote: async (id) => {
    await db.notes.delete(id)
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
  },

  // ─── 進捗 ─────────────────────────────────────────────────────
  toggleCompletion: async (lessonId, courseId) => {
    const existing = await db.progresses.get(lessonId)
    const isCompleted = !(existing?.isCompleted ?? false)
    const updated: Progress = {
      lessonId,
      courseId,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      totalWatchedSeconds: existing?.totalWatchedSeconds ?? 0,
      updatedAt: new Date().toISOString(),
    }
    await db.progresses.put(updated)
    // Lesson.isCompleted を同期（CourseTree の表示に即時反映）
    await useCourseStore.getState().updateLesson(lessonId, { isCompleted })
    set({ progress: updated })
  },

  addWatchTime: async (lessonId, courseId, seconds) => {
    if (seconds <= 0) return
    const existing = await db.progresses.get(lessonId)
    const newTotal = (existing?.totalWatchedSeconds ?? 0) + seconds
    const updated: Progress = {
      lessonId,
      courseId,
      isCompleted: existing?.isCompleted ?? false,
      completedAt: existing?.completedAt,
      totalWatchedSeconds: newTotal,
      updatedAt: new Date().toISOString(),
    }
    await db.progresses.put(updated)
    if (get().currentLessonId === lessonId) {
      set((s) => ({
        progress: s.progress ? { ...s.progress, totalWatchedSeconds: newTotal } : updated,
      }))
    }
  },
}))
