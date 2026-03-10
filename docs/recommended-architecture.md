# Recommended Architecture — 推奨技術構成

## 採用スタック

| 役割 | 技術 | 理由 |
|---|---|---|
| UIフレームワーク | React 18 + TypeScript | 型安全・エコシステム・長期安定 |
| ビルドツール | Vite | 高速HMR・設定シンプル |
| 状態管理 | Zustand | Redux より軽量・TypeScript親和性◎・スライス設計しやすい |
| データ永続化 | Dexie.js (IndexedDB) | 型安全・マイグレーション対応・localStorage の容量制限を解消 |
| スタイリング | Tailwind CSS v3 | デザイントークンによる一貫性・学習コスト低・JSXと相性良 |
| アイコン | Lucide React | シンプル・tree-shakeable・TypeScript型付き |
| ルーティング | React Router v6 | SPA標準・型安全なルート定義 |
| 動画プレイヤー | HTML5 `<video>` + カスタム実装 | ライブラリでは困難なA-Bリピート等の学習特化操作に対応 |
| ローカル動画アクセス | File System Access API | Chrome/Edge でサーバーなし動画再生を実現 |

### 動画プレイヤーをライブラリ（Plyr・Video.js）ではなくカスタム実装にする理由
- A-Bリピートはほぼどのライブラリも公式サポートしていない
- タイムスタンプ付きブックマーク・メモの表示をシークバーに重ねる必要がある
- UIのデザインをアプリの全体トーンに合わせるためカスタムが必要
- `<video>` の API は十分に標準化されており、独自実装のコストは許容範囲

---

## 抽象化レイヤー設計

### 1. StorageAdapter（データ永続化の抽象化）

将来的に IndexedDB から Supabase へ移行する際、ビジネスロジックを変更せずに済む。

```typescript
// src/storage/StorageAdapter.ts

export interface StorageAdapter {
  getAll<T>(table: string): Promise<T[]>
  get<T>(table: string, id: string): Promise<T | undefined>
  put<T extends { id: string }>(table: string, item: T): Promise<void>
  delete(table: string, id: string): Promise<void>
  query<T>(table: string, predicate: (item: T) => boolean): Promise<T[]>
}

// MVP実装: DexieAdapter（IndexedDB）
// 将来実装: SupabaseAdapter（同一インターフェース）
```

### 2. VideoSourceAdapter（動画ソースの抽象化）

動画ソースのタイプ（local/remote/youtube）ごとに異なる取得処理を隠蔽する。
将来の Dropbox・Google Drive 対応も、新しい Adapter を追加するだけで対応できる。

```typescript
// src/video/VideoSourceAdapter.ts

export type VideoSourceType = 'local' | 'remote' | 'youtube'
// 将来拡張: 'dropbox' | 'gdrive' | 's3'

export interface ResolvedVideoSource {
  type: 'blob-url' | 'direct-url' | 'youtube-embed'
  url: string
  cleanup?: () => void  // blob URL の revoke 等
}

export interface VideoSourceAdapter {
  readonly type: VideoSourceType
  canHandle(source: VideoSource): boolean
  resolve(source: VideoSource): Promise<ResolvedVideoSource>
}

// 登録された Adapter を type で選択するリゾルバ
export class VideoSourceResolver {
  private adapters: Map<VideoSourceType, VideoSourceAdapter>

  resolve(source: VideoSource): Promise<ResolvedVideoSource> {
    const adapter = this.adapters.get(source.type)
    if (!adapter) throw new Error(`Unsupported video source type: ${source.type}`)
    return adapter.resolve(source)
  }
}
```

**各 Adapter の実装概要:**

| Adapter | 処理内容 |
|---|---|
| `LocalVideoAdapter` | FileSystemFileHandle から Blob URL を生成して返す |
| `RemoteVideoAdapter` | 外部URL（mp4等）をそのまま `<video src>` に渡す |
| `YouTubeAdapter` | YouTube URL から embed URL を生成し `<iframe>` で表示 |
| `DropboxAdapter`（将来）| Dropbox API で一時DLリンクを取得して返す |

---

## ディレクトリ構成

```
shuwa-video-player/
├── docs/                          # 設計ドキュメント（このファイル群）
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx                # ルートコンポーネント・Provider初期化
│   │   └── router.tsx             # React Router ルート定義
│   │
│   ├── components/                # アプリ共通の汎用UIコンポーネント
│   │   ├── ui/                    # プリミティブ（Button, Input, Dialog, Select...）
│   │   └── layout/                # AppShell, TopBar, Sidebar
│   │
│   ├── features/                  # 機能単位のモジュール
│   │   ├── courses/               # コース・セクション・レッスン管理
│   │   │   ├── components/        # CourseTree, LessonItem, CourseCrudDialog...
│   │   │   ├── store.ts           # Zustand store
│   │   │   └── types.ts
│   │   │
│   │   ├── player/                # 動画プレイヤー
│   │   │   ├── components/        # VideoPlayer, SeekBar, PlayerControls...
│   │   │   ├── store.ts           # 再生状態（速度・音量・ABリピート）
│   │   │   └── hooks/             # useKeyboardShortcuts, useABRepeat...
│   │   │
│   │   ├── resources/             # リソースハブ
│   │   │   ├── components/        # ResourceHub, ResourceCard, ResourceCrudDialog...
│   │   │   ├── store.ts
│   │   │   └── types.ts
│   │   │
│   │   └── progress/              # 学習進捗・メモ・ブックマーク（Phase 6）
│   │       ├── store.ts
│   │       └── types.ts
│   │
│   ├── storage/                   # データ永続化レイヤー
│   │   ├── StorageAdapter.ts      # interface定義
│   │   ├── DexieAdapter.ts        # IndexedDB実装
│   │   ├── schema.ts              # Dexieスキーマ・マイグレーション定義
│   │   └── db.ts                  # Dexieインスタンスのシングルトン
│   │
│   ├── video/                     # 動画ソース抽象化レイヤー
│   │   ├── VideoSourceAdapter.ts  # interface + ResolvedVideoSource型
│   │   ├── LocalVideoAdapter.ts   # File System Access API実装
│   │   ├── RemoteVideoAdapter.ts  # 外部URL実装
│   │   ├── YouTubeAdapter.ts      # YouTube埋め込み実装
│   │   └── VideoSourceResolver.ts # Adapterのルーティング
│   │
│   ├── hooks/                     # グローバル共通カスタムフック
│   ├── types/
│   │   └── index.ts               # グローバル型定義（全entityのinterface）
│   └── utils/
│       ├── time.ts                # 秒数フォーマット等
│       └── url.ts                 # URL検証・サニタイズ
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 主要な依存パッケージ（予定）

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "zustand": "^4",
    "dexie": "^3",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "latest",
    "tailwindcss": "^3",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

UIコンポーネントライブラリは **使わない**（Radix UI の Primitive は必要に応じて追加可）。
シンプルで落ち着いたUIを自前で作ることで、デザインの一貫性を保つ。

---

## データフロー

```
UIコンポーネント
    ↓ action
Zustand Store（インメモリ状態）
    ↓ persist
StorageAdapter（DexieAdapter）
    ↓
IndexedDB（ブラウザ永続化）

動画再生フロー:
Lesson選択 → VideoSource取得 → VideoSourceResolver → 各Adapter → playable URL → <video>
```

---

## 将来のクラウド移行パス

```
現在: DexieAdapter（IndexedDB）
         ↓ StorageAdapterインターフェースの差し替えのみ
将来: SupabaseAdapter（Supabase Postgres + Storage）
```

Zustand の store・React コンポーネント・ビジネスロジックは変更不要。

同様に動画ソースも:
```
現在: LocalVideoAdapter / RemoteVideoAdapter / YouTubeAdapter
         ↓ VideoSourceAdapterを追加実装するだけ
将来: DropboxAdapter / GDriveAdapter / S3Adapter
```
