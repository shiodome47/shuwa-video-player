import type {
  Bookmark,
  Course,
  Lesson,
  Note,
  PlaybackState,
  Progress,
  ResourceCategory,
  ResourceLink,
  Section,
  VideoSource,
} from '../../types'
import { db } from '../../storage/db'
import { useCourseStore } from '../courses/store'
import { useResourceStore } from '../resources/store'
import { useLearningStore } from '../learning/store'

/**
 * バックアップファイルの形式（version 1）。
 *
 * 注意: fileHandles テーブルは File System Access API の FileSystemFileHandle を
 * 保持しており JSON シリアライズ不可のため除外する。
 * インポート後、ローカル動画ソースは手動で再リンクが必要。
 */
export interface ShuwaBackup {
  version: 1
  exportedAt: string
  data: {
    courses: Course[]
    sections: Section[]
    lessons: Lesson[]
    videoSources: VideoSource[]
    resourceCategories: ResourceCategory[]
    resourceLinks: ResourceLink[]
    bookmarks: Bookmark[]
    notes: Note[]
    progresses: Progress[]
    playbackStates: PlaybackState[]
  }
}

/** 全テーブルを読み出して ShuwaBackup を返す */
export async function exportBackup(): Promise<ShuwaBackup> {
  const [
    courses,
    sections,
    lessons,
    videoSources,
    resourceCategories,
    resourceLinks,
    bookmarks,
    notes,
    progresses,
    playbackStates,
  ] = await Promise.all([
    db.courses.toArray(),
    db.sections.toArray(),
    db.lessons.toArray(),
    db.videoSources.toArray(),
    db.resourceCategories.toArray(),
    db.resourceLinks.toArray(),
    db.bookmarks.toArray(),
    db.notes.toArray(),
    db.progresses.toArray(),
    db.playbackStates.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      courses,
      sections,
      lessons,
      videoSources,
      resourceCategories,
      resourceLinks,
      bookmarks,
      notes,
      progresses,
      playbackStates,
    },
  }
}

/** バックアップ JSON をダウンロードさせる */
export function downloadBackupJson(backup: ShuwaBackup): void {
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `shuwa-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** JSON テキストをパースして ShuwaBackup として返す。不正な場合は Error を投げる */
export function parseBackupJson(json: string): ShuwaBackup {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('JSON の解析に失敗しました。ファイルが壊れている可能性があります。')
  }

  if (typeof parsed !== 'object' || parsed === null) throw new Error('不正なフォーマットです。')
  const obj = parsed as Record<string, unknown>

  if (obj.version !== 1) throw new Error(`未対応のバージョンです (version=${String(obj.version)})。`)
  if (typeof obj.exportedAt !== 'string') throw new Error('exportedAt フィールドがありません。')
  if (typeof obj.data !== 'object' || obj.data === null) throw new Error('data フィールドがありません。')

  const data = obj.data as Record<string, unknown>
  const requiredKeys = [
    'courses', 'sections', 'lessons', 'videoSources',
    'resourceCategories', 'resourceLinks',
    'bookmarks', 'notes', 'progresses', 'playbackStates',
  ]
  for (const key of requiredKeys) {
    if (!Array.isArray(data[key])) throw new Error(`data.${key} が配列ではありません。`)
  }

  return parsed as ShuwaBackup
}

/**
 * バックアップを Dexie に書き込む（全置換）。
 * 1. 各テーブルを clear()
 * 2. バックアップデータを bulkPut()
 * 3. Zustand ストアをリロード
 *
 * fileHandles テーブルはバックアップに含まれないためそのまま残す
 * （ローカル動画の再リンクには手動操作が必要）。
 */
export async function importBackup(backup: ShuwaBackup): Promise<void> {
  const { data } = backup

  await db.transaction(
    'rw',
    [
      db.courses, db.sections, db.lessons, db.videoSources,
      db.resourceCategories, db.resourceLinks,
      db.bookmarks, db.notes, db.progresses, db.playbackStates,
    ],
    async () => {
      await Promise.all([
        db.courses.clear(),
        db.sections.clear(),
        db.lessons.clear(),
        db.videoSources.clear(),
        db.resourceCategories.clear(),
        db.resourceLinks.clear(),
        db.bookmarks.clear(),
        db.notes.clear(),
        db.progresses.clear(),
        db.playbackStates.clear(),
      ])

      await Promise.all([
        db.courses.bulkPut(data.courses),
        db.sections.bulkPut(data.sections),
        db.lessons.bulkPut(data.lessons),
        db.videoSources.bulkPut(data.videoSources),
        db.resourceCategories.bulkPut(data.resourceCategories),
        db.resourceLinks.bulkPut(data.resourceLinks),
        db.bookmarks.bulkPut(data.bookmarks),
        db.notes.bulkPut(data.notes),
        db.progresses.bulkPut(data.progresses),
        db.playbackStates.bulkPut(data.playbackStates),
      ])
    },
  )

  // Zustand ストアをリロード
  await Promise.all([
    useCourseStore.getState().loadAll(),
    useResourceStore.getState().loadAll(),
  ])

  // 学習ストアはレッスンをまたぐ状態なので初期値にリセット
  useLearningStore.setState({
    currentLessonId: null,
    bookmarks: [],
    notes: [],
    progress: null,
  })
}
