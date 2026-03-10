# Data Model — データモデル設計

## 全エンティティ一覧

```
Course ──< Section ──< Lesson ──< VideoSource
                                      │
                                      ▼
                               PlaybackState（レッスンごとに1件）
                               Progress（レッスンごとに1件）
                               Bookmark（1レッスンに複数）
                               Note（1レッスンに複数）

ResourceCategory ──< ResourceLink
```

---

## TypeScript 型定義

### コース階層

```typescript
// src/types/index.ts

export interface Course {
  id: string                  // UUID
  title: string
  description: string
  coverImageUrl?: string      // 将来: アイキャッチ画像URL
  order: number               // 表示順（0始まり）
  createdAt: string           // ISO 8601
  updatedAt: string
}

export interface Section {
  id: string
  courseId: string            // FK: Course.id
  title: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  sectionId: string           // FK: Section.id
  courseId: string            // 検索・集計の便宜上非正規化
  title: string
  description: string
  order: number
  tags: string[]              // 将来: タグ検索用
  isFavorited: boolean
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}
```

### 動画ソース

```typescript
export type VideoSourceType = 'local' | 'remote' | 'youtube'
// 将来拡張: 'dropbox' | 'gdrive' | 's3'

export interface VideoSource {
  id: string
  lessonId: string            // FK: Lesson.id

  type: VideoSourceType

  // type === 'local':
  //   src = ファイル名（表示用）
  //   localFileHandleKey = IndexedDB に別途保存したFileSystemFileHandleのキー
  // type === 'remote':
  //   src = 外部動画URL（https://example.com/video.mp4）
  // type === 'youtube':
  //   src = YouTube URL（https://www.youtube.com/watch?v=xxxxx）
  src: string
  localFileHandleKey?: string

  // メタデータ（任意・後から取得可能な情報）
  displayName?: string        // UI上の表示名（省略時はファイル名やURLから自動生成）
  durationSeconds?: number    // 取得できた場合に記録

  createdAt: string
  updatedAt: string
}

// Adapterが返す「再生可能な状態」
export interface ResolvedVideoSource {
  type: 'blob-url' | 'direct-url' | 'youtube-embed'
  url: string
  cleanup?: () => void        // blob URL revoke 等
}
```

### 再生状態・進捗

```typescript
export interface PlaybackState {
  lessonId: string            // PK（レッスンごとに1件）
  positionSeconds: number     // 前回再生位置
  playbackRate: number        // 再生速度（デフォルト 1.0）
  updatedAt: string
}

// A-Bリピートはセッション中のみ → Zustand のみで管理、永続化しない
export interface ABRepeat {
  pointA: number | null       // 秒数
  pointB: number | null
  isActive: boolean
}

export interface Progress {
  lessonId: string            // PK
  courseId: string            // 集計用
  isCompleted: boolean
  completedAt?: string
  totalWatchedSeconds: number // 累計視聴秒数（将来の進捗集計用）
  updatedAt: string
}
```

### ブックマーク・メモ（Phase 6）

```typescript
export interface Bookmark {
  id: string
  lessonId: string
  positionSeconds: number
  label: string               // 空文字許容
  createdAt: string
}

export interface Note {
  id: string
  lessonId: string
  positionSeconds?: number    // undefined = タイムスタンムなし（一般メモ）
  content: string
  createdAt: string
  updatedAt: string
}
```

### リソースハブ

```typescript
export interface ResourceCategory {
  id: string
  name: string                // 例: 単語検索 / YouTube / 参考資料
  description: string
  color?: string              // Tailwind カラークラス名 or hex
  order: number
  createdAt: string
  updatedAt: string
}

export interface ResourceLink {
  id: string
  categoryId: string          // FK: ResourceCategory.id
  title: string               // 例: 手話単語検索アプリ
  url: string                 // https://...
  description: string         // 例: 手話単語を調べるために頻繁に使うアプリ
  tags: string[]              // 将来の検索・フィルタ用
  isFavorited: boolean
  isPinned: boolean           // ホーム画面固定表示用（Phase 7）
  lastAccessedAt?: string     // 最後に開いた日時
  createdAt: string
  updatedAt: string
}
```

---

## Dexie スキーマ定義

```typescript
// src/storage/schema.ts

import Dexie, { type Table } from 'dexie'
import type {
  Course, Section, Lesson, VideoSource,
  PlaybackState, Progress, Bookmark, Note,
  ResourceCategory, ResourceLink
} from '../types'

export class ShuwaDB extends Dexie {
  courses!: Table<Course>
  sections!: Table<Section>
  lessons!: Table<Lesson>
  videoSources!: Table<VideoSource>
  fileHandles!: Table<{ key: string; handle: FileSystemFileHandle }>
  playbackStates!: Table<PlaybackState>
  progresses!: Table<Progress>
  bookmarks!: Table<Bookmark>
  notes!: Table<Note>
  resourceCategories!: Table<ResourceCategory>
  resourceLinks!: Table<ResourceLink>

  constructor() {
    super('ShuwaDB')
    this.version(1).stores({
      courses:           'id, order',
      sections:          'id, courseId, order',
      lessons:           'id, sectionId, courseId, order, isFavorited, isCompleted',
      videoSources:      'id, lessonId, type',
      fileHandles:       'key',
      playbackStates:    'lessonId',
      progresses:        'lessonId, courseId, isCompleted',
      bookmarks:         'id, lessonId, positionSeconds',
      notes:             'id, lessonId',
      resourceCategories:'id, order',
      resourceLinks:     'id, categoryId, isFavorited, isPinned',
    })
  }
}

export const db = new ShuwaDB()
```

---

## StorageAdapter インターフェース

```typescript
// src/storage/StorageAdapter.ts

export interface StorageAdapter {
  // 基本CRUD
  getAll<T>(table: string): Promise<T[]>
  get<T>(table: string, id: string): Promise<T | undefined>
  put<T extends { id: string }>(table: string, item: T): Promise<void>
  delete(table: string, id: string): Promise<void>

  // クエリ
  query<T>(table: string, index: string, value: unknown): Promise<T[]>

  // トランザクション（複数テーブルの整合性保証）
  transaction<T>(fn: () => Promise<T>): Promise<T>
}
```

---

## データ整合性ルール

| 操作 | 整合性要件 |
|---|---|
| Course 削除 | 配下の Section・Lesson・VideoSource・PlaybackState・Progress を cascade 削除 |
| Section 削除 | 配下の Lesson・VideoSource・PlaybackState・Progress を cascade 削除 |
| Lesson 削除 | 配下の VideoSource・PlaybackState・Progress・Bookmark・Note を cascade 削除 |
| ResourceCategory 削除 | 配下の ResourceLink を cascade 削除 |

これらは StorageAdapter の `transaction` で実現し、部分削除によるデータ不整合を防ぐ。

---

## ローカルファイルハンドルの扱い

File System Access API の `FileSystemFileHandle` はシリアライズできないため、IndexedDB の特別なオブジェクトストアに保存する。

```typescript
// キーの生成: `file-handle-${videoSourceId}`
// 保存: await db.fileHandles.put({ key, handle })
// 取得: await db.fileHandles.get(key) → handle
// 再生前: await handle.queryPermission() で権限を確認
//         権限がなければ await handle.requestPermission() で再取得を促す
```

File System Access API は Chrome セッションをまたぐと権限が切れることがある。
その場合、UIで「ファイルへのアクセスを再許可」ボタンを表示し、ユーザーが1クリックで再取得できるようにする。

---

## 初期データ

サンプルデータは提供しない。初回起動時は全テーブルが空の状態。

ただし、開発・テスト用に `src/storage/seed.ts` を用意し、
開発環境でのみ `npm run seed` で初期データを流し込めるようにする。
