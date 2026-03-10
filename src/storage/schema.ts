import Dexie, { type Table } from 'dexie'
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
} from '../types'

/**
 * File System Access API の FileSystemFileHandle は JSON シリアライズ不可のため、
 * IndexedDB の専用テーブルに保存する。
 * Phase 4 で LocalVideoAdapter を実装する際に使用する。
 */
interface FileHandleRecord {
  key: string
  handle: FileSystemFileHandle
}

/**
 * アプリケーションの IndexedDB スキーマ。
 *
 * Dexie のスキーマ文字列の構文:
 *   'id' → プライマリキー
 *   'field' → インデックス（クエリ・ソートで使用するフィールドを指定）
 *
 * ここに列挙されていないフィールドも保存されるが、検索・ソートには使えない。
 * Phase 追加時は version を上げてマイグレーションを追加する。
 */
export class ShuwaDB extends Dexie {
  courses!: Table<Course>
  sections!: Table<Section>
  lessons!: Table<Lesson>
  videoSources!: Table<VideoSource>
  fileHandles!: Table<FileHandleRecord>
  playbackStates!: Table<PlaybackState>
  progresses!: Table<Progress>
  bookmarks!: Table<Bookmark>
  notes!: Table<Note>
  resourceCategories!: Table<ResourceCategory>
  resourceLinks!: Table<ResourceLink>

  constructor() {
    super('ShuwaDB')

    /**
     * Version 1: 初回スキーマ。
     * フィールドを追加する場合は version(2).stores({...}) を追加し、
     * version(1) の stores は変更しない（Dexie のマイグレーション仕様）。
     */
    /**
     * ⚠ Dexie の orderBy() / where() はここに列挙したフィールドのみ使用可。
     * 列挙されていないフィールド（createdAt, updatedAt 等）で orderBy すると
     * 実行時例外になるため、JS 側でソートすること。
     *
     * orderBy 可能なフィールド一覧:
     *   courses        : id, order
     *   sections       : id, courseId, order
     *   lessons        : id, sectionId, courseId, order, isCompleted, isFavorited
     *   videoSources   : id, lessonId, type
     *   fileHandles    : key
     *   playbackStates : lessonId  ← updatedAt は NG → JS ソート
     *   progresses     : lessonId, courseId, isCompleted
     *   bookmarks      : id, lessonId, positionSeconds  ← createdAt は NG → JS ソート
     *   notes          : id, lessonId  ← createdAt は NG → JS ソート
     *   resourceCategories : id, order
     *   resourceLinks  : id, categoryId, isFavorited, isPinned
     */
    this.version(1).stores({
      courses: 'id, order',
      sections: 'id, courseId, order',
      lessons: 'id, sectionId, courseId, order, isCompleted, isFavorited',
      videoSources: 'id, lessonId, type',
      fileHandles: 'key',
      playbackStates: 'lessonId',
      progresses: 'lessonId, courseId, isCompleted',
      bookmarks: 'id, lessonId, positionSeconds',
      notes: 'id, lessonId',
      resourceCategories: 'id, order',
      resourceLinks: 'id, categoryId, isFavorited, isPinned',
    })
  }
}
