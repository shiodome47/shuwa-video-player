# UI Structure — 画面・コンポーネント設計

## レイアウト選定

### 案A: 動画中心（採用）

```
┌─────────────────────────────────────────────────┐
│  🤟 Shuwa          [学習]  [リソース]          ▣ │
├────────────┬────────────────────────────────────┤
│            │                                    │
│  コース    │         動画プレイヤー              │
│  ▾ コース1 │   ┌──────────────────────────┐    │
│    ▾ S1   │   │                          │    │
│      L1   │   │    ████████████████      │    │
│      L2 ✓ │   │                          │    │
│    ▾ S2   │   └──────────────────────────┘    │
│      L3 ● │   ──●──────────────── 02:34/08:12 │
│      L4   │   ▶ ↺5 ↺10  A  B  ─── ♪ 1.0x    │
│            │                                    │
│  ▾ コース2 │   ─────────────────────────────    │
│    ...    │   レッスン: おはようございます        │
│            │   説明: 朝の挨拶の手話              │
│  [+コース] │                                    │
└────────────┴────────────────────────────────────┘
```

**案Bとの比較・選択理由:**
- 案B（ホームダッシュボード）は情報密度が高いが、「学習を始める」までに1クリック余分に必要
- 案Aはアプリを開いた瞬間から学習モードに入れる（摩擦ゼロ原則に合致）
- Phase 6でホームダッシュボードを追加する際も、タブ切り替えで自然に組み込める

---

## ルーティング設計

```
/                    → 学習ビュー（デフォルト）
  /lesson/:lessonId  → 特定レッスンを選択した状態
/resources           → リソースハブ
  /resources/:categoryId → カテゴリで絞り込んだ状態

# Phase 6以降
/home                → ホームダッシュボード
/settings            → 設定（テーマ・バックアップ等）
```

---

## コンポーネントツリー

```
App
├── AppProvider（Zustand・Dexie初期化）
└── RouterProvider
    └── AppShell
        ├── TopBar
        │   ├── AppLogo
        │   ├── NavTabs（[学習] [リソース]）
        │   └── GlobalActions（将来: 設定・検索）
        │
        └── MainLayout
            ├── Sidebar（学習ビュー時のみ表示）
            │   ├── SidebarHeader（タイトル + コース追加ボタン）
            │   ├── CourseTree
            │   │   └── CourseNode（繰り返し）
            │   │       ├── CourseHeader（展開トグル・編集・削除）
            │   │       └── SectionNode（繰り返し）
            │   │           ├── SectionHeader（編集・削除）
            │   │           └── LessonItem（繰り返し）
            │   │               # 完了アイコン・現在再生中インジケーター
            │   └── SidebarFooter
            │
            └── ViewContainer
                ├── LearningView（/ および /lesson/:id）
                │   ├── VideoArea
                │   │   ├── VideoPlayer（local/remote の場合）
                │   │   │   ├── VideoElement（<video>）
                │   │   │   ├── VideoOverlay（ローディング・エラー表示）
                │   │   │   ├── SeekBar
                │   │   │   │   ├── ProgressFill
                │   │   │   │   └── ABRepeatHighlight
                │   │   │   └── PlayerControls
                │   │   │       ├── PlayPauseButton
                │   │   │       ├── SkipButtons（5s/10s）
                │   │   │       ├── ABRepeatControl（A点・B点・解除）
                │   │   │       ├── VolumeControl（スライダー+ミュート）
                │   │   │       ├── SpeedControl（プリセット選択）
                │   │   │       └── TimeDisplay（現在時刻/総時間）
                │   │   └── YouTubePlayer（youtubeソースの場合）
                │   │       └── <iframe> ラッパー
                │   │
                │   ├── LessonPanel
                │   │   ├── LessonHeader（タイトル・編集ボタン）
                │   │   ├── VideoSourceManager（ソース表示・変更ボタン）
                │   │   └── LessonEmptyState（動画未設定の場合）
                │   │
                │   └── CourseTreeEmptyState（コースが0件の場合）
                │
                └── ResourceHubView（/resources）
                    ├── ResourceHubHeader（タイトル + カテゴリ追加・リソース追加）
                    ├── CategoryTabs（全て | カテゴリA | カテゴリB | ...）
                    ├── ResourceGrid
                    │   └── ResourceCard（繰り返し）
                    │       ├── FavoriteToggle
                    │       ├── ResourceTitle + URL
                    │       ├── Description
                    │       ├── CategoryBadge
                    │       └── Actions（開く・編集・削除）
                    └── ResourceEmptyState（リソースが0件の場合）

# ダイアログ群（Portal でマウント）
├── CourseCrudDialog（作成・編集）
├── SectionCrudDialog
├── LessonCrudDialog
├── VideoSourceCrudDialog（local/remote/youtube 選択 + 入力）
├── ResourceCategoryCrudDialog
└── ResourceLinkCrudDialog
```

---

## 状態管理の責務分割

### Zustand Stores

| Store | 責務 | 永続化 |
|---|---|---|
| `useCourseStore` | コース・セクション・レッスンのCRUD・ツリー展開状態 | Dexie（課題データ） |
| `usePlayerStore` | 再生状態（速度・音量・ABリピート・現在再生中レッスンID） | 音量のみlocalStorage |
| `usePlaybackPositionStore` | レッスンごとの再生位置記憶 | Dexie |
| `useResourceStore` | リソースリンク・カテゴリのCRUD | Dexie |
| `useUIStore` | サイドバー開閉・現在タブ・アクティブなダイアログ | なし（セッション中のみ） |

### ローカルのUI状態（useState）

- ダイアログの開閉（ダイアログコンポーネント内）
- フォームの入力値
- ドロップダウンの開閉

---

## エンプティステート設計

データがない状態を分かりやすく案内し、UIから追加できることを伝える。

```
コースが0件の場合:
┌──────────────────────────────────┐
│  🎓                              │
│  まだコースがありません           │
│  最初のコースを追加して          │
│  学習をはじめましょう            │
│                                  │
│       [ + コースを追加 ]         │
└──────────────────────────────────┘

レッスンに動画が未設定の場合:
┌──────────────────────────────────┐
│  🎬                              │
│  動画が登録されていません         │
│                                  │
│       [ 動画を追加する ]         │
└──────────────────────────────────┘
```

---

## モバイル対応方針（Phase 8）

| 要素 | デスクトップ | モバイル |
|---|---|---|
| サイドバー | 常時表示（固定幅） | ドロワー（ハンバーガーメニュー） |
| 動画プレイヤー | 右メインエリア | 全幅・縦スクロール |
| プレイヤーコントロール | 動画下部に常時表示 | タップで表示・自動非表示 |
| リソースハブ | グリッド（3〜4列） | リスト（1列） |
| タブナビゲーション | TopBar | BottomNavigation |

---

## デザイントークン方針（Tailwind）

```
カラーパレット:
  background: neutral-950（ほぼ黒）
  surface:    neutral-900（カード・サイドバー）
  border:     neutral-800
  text:       neutral-100（メイン）/ neutral-400（サブ）
  accent:     teal-500（アクション・現在位置ハイライト）
  danger:     red-500（削除ボタン）
  success:    green-500（完了マーク）

フォント: システムフォント（-apple-system / Segoe UI）
動画エリア: 黒背景（#000）で映像に集中できる環境
```

落ち着いた・学習の邪魔をしない・暗めのUIをデフォルトとする。
