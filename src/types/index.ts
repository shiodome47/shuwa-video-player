// ============================================================
// Shuwa Learning Platform — Global Type Definitions
// Phase 2 以降で Dexie スキーマと同期する
// ============================================================

// --- コース階層 ---

export interface Course {
  id: string
  title: string
  description: string
  coverImageUrl?: string
  order: number
  createdAt: string // ISO 8601
  updatedAt: string
}

export interface Section {
  id: string
  courseId: string
  title: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  sectionId: string
  courseId: string // 集計用に非正規化
  title: string
  description: string
  order: number
  tags: string[]
  isFavorited: boolean
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

// --- 動画ソース ---

/**
 * 対応する動画ソースのタイプ。
 * 将来: 'dropbox' | 'gdrive' | 's3' を追加する場合は VideoSourceAdapter を実装するだけでよい。
 */
export type VideoSourceType = 'local' | 'remote' | 'youtube'

export interface VideoSource {
  id: string
  lessonId: string
  type: VideoSourceType

  /**
   * type === 'local': ファイル名（表示用）。実体は localFileHandleKey で参照。
   * type === 'remote': 外部動画 URL（https://example.com/video.mp4）
   * type === 'youtube': YouTube URL（https://www.youtube.com/watch?v=xxxxx）
   */
  src: string

  /** type === 'local' のときのみ使用。IndexedDB に保存した FileSystemFileHandle のキー */
  localFileHandleKey?: string

  /** UI 上の表示名。省略時は src から自動生成 */
  displayName?: string

  /** 取得できた場合に記録する動画の長さ（秒） */
  durationSeconds?: number

  createdAt: string
  updatedAt: string
}

// --- 再生状態 ---

export interface PlaybackState {
  lessonId: string // PK（レッスンごとに 1 件）
  positionSeconds: number // 後方互換: activeSourceId のソース位置
  playbackRate: number // デフォルト 1.0
  updatedAt: string
  // ── 複数ソース対応（省略可・既存データは undefined のまま） ──
  /** 最後に再生していた VideoSource の id */
  activeSourceId?: string
  /** ソース単位の再生位置マップ { sourceId: positionSeconds } */
  sourcePositions?: Record<string, number>
}

/**
 * A-B リピートはセッション中のみ保持するため、Zustand のみで管理。
 * Dexie には保存しない。
 */
export interface ABRepeat {
  pointA: number | null // 秒数
  pointB: number | null
  isActive: boolean
}

export interface Progress {
  lessonId: string // PK
  courseId: string // 集計用
  isCompleted: boolean
  completedAt?: string
  totalWatchedSeconds: number
  updatedAt: string
}

// --- ブックマーク・メモ（Phase 6） ---

export interface Bookmark {
  id: string
  lessonId: string
  positionSeconds: number
  label: string
  createdAt: string
}

export interface Note {
  id: string
  lessonId: string
  /** undefined = タイムスタンプなし（一般メモ） */
  positionSeconds?: number
  content: string
  createdAt: string
  updatedAt: string
}

// --- リソースハブ ---

export interface ResourceCategory {
  id: string
  name: string
  description: string
  /** Tailwind カラー名 or hex（例: 'teal', '#14b8a6'）*/
  color?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface ResourceLink {
  id: string
  categoryId: string
  title: string
  url: string
  description: string
  tags: string[]
  isFavorited: boolean
  /** ホーム画面固定表示用（Phase 7） */
  isPinned: boolean
  lastAccessedAt?: string
  createdAt: string
  updatedAt: string
}
