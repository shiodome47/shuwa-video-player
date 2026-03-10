# Development Roadmap — 開発ロードマップ

## フェーズ一覧

| フェーズ | 名称 | 目標 |
|---|---|---|
| Phase 0 | 設計・雛形 | ドキュメント完成・プロジェクト初期化・型定義・DBスキーマ |
| Phase 1 | 基本レイアウト | AppShell・ルーティング・デザイントークン |
| Phase 2 | データ層 | Dexie実装・Zustand stores・StorageAdapter・VideoSourceAdapter |
| Phase 3 | CRUD UI | 全エンティティの追加・編集・削除をUIから操作可能に |
| Phase 4 | 動画再生 | カスタムプレイヤー・A-Bリピート・再生位置記憶・キーボードショートカット |
| Phase 5 | リソースハブ表示 | カテゴリタブ・ResourceCard・お気に入り |
| Phase 6 | 学習支援機能 | タイムスタンプメモ・ブックマーク・学習進捗・お気に入りレッスン |
| Phase 7 | UI洗練 | ホームダッシュボード・ダークモード・アニメーション |
| Phase 8 | モバイル対応 | レスポンシブ・ドロワー・BottomNav |
| Phase 9 | データ管理 | エクスポート・インポート・バックアップ |
| Phase 10+ | クラウド化（任意） | Supabase移行・認証・マルチデバイス |

---

## Phase 0: 設計・雛形

**目標:** コードを書く前の設計を完成させ、プロジェクトの骨格を作る。

### 成果物
- [x] `docs/product-overview.md`
- [x] `docs/requirements.md`
- [x] `docs/architecture-options.md`
- [x] `docs/recommended-architecture.md`
- [x] `docs/mvp-scope.md`
- [x] `docs/ui-structure.md`
- [x] `docs/data-model.md`
- [x] `docs/resource-hub.md`
- [x] `docs/roadmap.md`
- [ ] Vite + React + TypeScript プロジェクト初期化
- [ ] Tailwind CSS 設定（デザイントークン定義）
- [ ] `src/types/index.ts` — 全エンティティの型定義
- [ ] `src/storage/schema.ts` + `src/storage/db.ts` — Dexieスキーマ
- [ ] `src/video/VideoSourceAdapter.ts` — interface定義のみ
- [ ] ディレクトリ構成の作成（空ファイルで構造を確定）

---

## Phase 1: 基本レイアウト

**目標:** アプリの骨格となる画面を作る。データは仮のもので OK。

### タスク
- [ ] `AppShell`（TopBar + MainLayout）
- [ ] `TopBar`（ロゴ + ナビゲーションタブ）
- [ ] `Sidebar`（固定幅・スクロール可能）
- [ ] `ViewContainer`（タブ切り替え用）
- [ ] React Router のルーティング設定
- [ ] Tailwind テーマ設定（カラー・フォント・spacing）
- [ ] ダークテーマ（背景 neutral-950 系）の基本スタイル
- [ ] モバイル時のサイドバー非表示（Phase 8の準備として分岐だけ入れる）

### 完了基準
- アプリが起動し、学習ビューとリソースハブをタブで切り替えられる
- サイドバーと右メインエリアのレイアウトが崩れない

---

## Phase 2: データ層

**目標:** 永続化・状態管理の基盤を完成させる。UIへの結合はまだしない。

### タスク
- [ ] `DexieAdapter` の実装（StorageAdapterインターフェースを満たす）
- [ ] `ShuwaDB` クラス（全テーブルのDexie定義）
- [ ] `useCourseStore`（Zustand）— Course/Section/Lesson の CRUD メソッド
- [ ] `useResourceStore`（Zustand）— ResourceCategory/ResourceLink の CRUD メソッド
- [ ] `usePlayerStore`（Zustand）— 再生状態の管理
- [ ] `usePlaybackPositionStore`（Zustand + Dexie）— 再生位置の読み書き
- [ ] `LocalVideoAdapter`（File System Access API）
- [ ] `RemoteVideoAdapter`（外部URL）
- [ ] `YouTubeAdapter`（YouTube embed URL変換）
- [ ] `VideoSourceResolver`（type でAdapterを選択）
- [ ] FileSystemFileHandle の IndexedDB 保存・取得・権限確認ロジック

### 完了基準
- DevTools から直接 store の CRUD メソッドを呼び、IndexedDB にデータが入ることを確認
- ローカルファイル・外部URL・YouTube URL が ResolvedVideoSource に変換できることをユニットテストで確認

---

## Phase 3: CRUD UI

**目標:** アプリのデータをすべて UI から管理できるようにする。
これが完了した時点で、実際の学習データを投入して使い始められる。

### タスク

#### コース・レッスン管理
- [ ] `CourseTree` コンポーネント（階層表示・展開/折りたたみ）
- [ ] `CourseNode`（コース行 + 編集・削除ボタン）
- [ ] `SectionNode`（セクション行 + 編集・削除ボタン）
- [ ] `LessonItem`（レッスン行 + 選択・編集・削除）
- [ ] `CourseCrudDialog`（コース 作成/編集）
- [ ] `SectionCrudDialog`（セクション 作成/編集）
- [ ] `LessonCrudDialog`（レッスン 作成/編集）
- [ ] `VideoSourceCrudDialog`（local/remote/youtube 選択 + 入力）
- [ ] 並び替え（上/下ボタン、将来はDnD）
- [ ] エンプティステート（コースが0件の場合の案内）

#### リソースハブ管理
- [ ] `ResourceCategoryCrudDialog`（カテゴリ 作成/編集）
- [ ] `ResourceLinkCrudDialog`（リソース 作成/編集）
- [ ] リソースの編集・削除ボタン
- [ ] URL入力時のバリデーション（https://... チェック）

#### 共通UI部品
- [ ] `Button`（primary/secondary/danger バリアント）
- [ ] `Input`・`Textarea`・`Select`
- [ ] `Dialog`（ポータルでマウント）
- [ ] `ConfirmDialog`（削除確認）
- [ ] `Badge`（カテゴリタグ表示）

### 完了基準
- コース・セクション・レッスン・動画ソースを UI から追加・編集・削除できる
- リソースカテゴリ・リンクを UI から追加・編集・削除できる
- データがアプリ再起動後も保持されている
- JSON 手編集・フォルダ操作が不要

---

## Phase 4: 動画再生

**目標:** 学習に特化したカスタム動画プレイヤーを完成させる。

### タスク
- [ ] `VideoPlayer` コンポーネント（local/remote ソース用）
- [ ] `VideoElement`（`<video>` ラッパー・イベントハンドリング）
- [ ] `SeekBar`（クリック・ドラッグ・A-Bリピート表示）
- [ ] `ABRepeatControl`（A点・B点設定・解除・ループ処理）
- [ ] `PlayerControls`（再生・一時停止・スキップ・速度・音量）
- [ ] `SpeedControl`（0.5x〜2x プリセット）
- [ ] `VolumeControl`（スライダー + ミュートトグル）
- [ ] `TimeDisplay`（現在時刻 / 総時間）
- [ ] `YouTubePlayer`（YouTube埋め込み用 iframe ラッパー）
- [ ] `useKeyboardShortcuts` フック
- [ ] `LessonPanel`（レッスン情報表示・動画ソース切り替えボタン）
- [ ] 再生位置の自動保存（5秒ごと + アンマウント時）
- [ ] 再生位置の復元（レッスン選択時）
- [ ] ローカルファイル権限失効時の再許可UI

### 完了基準
- ローカル動画・外部URL動画・YouTube が再生できる
- A-Bリピートが動作する
- 再生速度・音量が変更できる
- スペースキー・J/L キー等のショートカットが動作する
- アプリを閉じて再度開いても前回位置から再開される

---

## Phase 5: リソースハブ表示

**目標:** リソースハブを使いやすい表示画面として完成させる。
（CRUD は Phase 3 で完了済み。Phase 5 では表示・UX を整える）

### タスク
- [ ] `ResourceHubView`（カテゴリタブ + グリッド）
- [ ] `CategoryTabs`（カテゴリ選択・「すべて」タブ）
- [ ] `ResourceGrid`（カード一覧）
- [ ] `ResourceCard`（タイトル・URL・説明・お気に入り・開く）
- [ ] お気に入りトグル（即時反映）
- [ ] お気に入り優先ソート
- [ ] リソースエンプティステート
- [ ] `lastAccessedAt` の更新（開くたびに記録）

### 完了基準
- リソースが視覚的に整理されて表示される
- カテゴリタブで絞り込みができる
- お気に入りが設定・解除できる

---

## Phase 6: 学習支援機能

**目標:** 動画学習をより深くできる補助機能を追加する。

### タスク
- [ ] `NoteEditor`（タイムスタンプ付きメモ入力）
- [ ] `NoteList`（メモ一覧・クリックで動画の該当時刻にジャンプ）
- [ ] `BookmarkList`（ブックマーク一覧・クリックでジャンプ）
- [ ] レッスン完了マーク（UI操作 + 動画終了時の自動候補）
- [ ] `ProgressIndicator`（コース・セクションの完了率）
- [ ] お気に入りレッスン表示（サイドバーでハイライト）

---

## Phase 7: UI 洗練

**目標:** 日常的に使いたいと思えるUIの完成度に仕上げる。

### タスク
- [ ] ホームダッシュボード画面（続きから・お気に入り・最近使ったリンク）
- [ ] ダークモード / ライトモード切り替え（Tailwind の `dark:` クラス活用）
- [ ] トランジション・アニメーション（ダイアログ・タブ切り替え）
- [ ] Toast 通知（保存成功・エラー）
- [ ] ローディングスケルトン
- [ ] キーボードフォーカス管理の整備

---

## Phase 8: モバイル対応

**目標:** スマートフォンでも快適に使える。

### タスク
- [ ] サイドバーをドロワー化（ハンバーガーメニュー）
- [ ] BottomNavigation（モバイル時のタブ）
- [ ] 動画プレイヤーのタッチ操作対応（タップで再生/一時停止・スワイプシーク）
- [ ] リソースハブのリスト表示（モバイル時はグリッドからリストへ）
- [ ] 各ダイアログのモバイル最適化

---

## Phase 9: データ管理

**目標:** データを安全に管理・移行できる。

### タスク
- [ ] 全データのJSONエクスポート
- [ ] JSONインポート（上書き or マージ選択）
- [ ] バックアップ日時の表示
- [ ] データクリア（確認ダイアログ付き）

---

## Phase 10+: クラウド化（任意・将来）

**目標:** マルチデバイス対応・クラウドバックアップ。

### 方針
- `SupabaseAdapter`（StorageAdapterインターフェースの実装）を追加
- `DexieAdapter` は残し、設定でどちらを使うか選択できる
- 動画ソースは Supabase Storage または Dropbox API 経由へ移行
- 認証（Supabase Auth）

---

## 実装順序の考え方

```
Phase 0（設計）
    → Phase 1（見た目の骨格）
        → Phase 2（データ基盤）
            → Phase 3（CRUD = 実データを入れられる状態）
                → Phase 4（動画が見られる = MVPコア完成）
                    → Phase 5（リソースハブ = MCP完成）
                        → 実際に日常使いを開始
                            → Phase 6〜 は使いながら育てる
```

**Phase 3 完了時点で「日常使いを始める」ことを目標にする。**
動画再生（Phase 4）が完成した時点で MVP が完成する。
