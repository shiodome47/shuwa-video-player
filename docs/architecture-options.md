# Architecture Options — 技術構成比較

## 比較対象

### Option A: React + Vite + IndexedDB（ピュアブラウザ SPA）
### Option B: Next.js + Supabase（フルスタック）
### Option C: Electron / Tauri（デスクトップアプリ）
### Option D: React + Vite + ローカルサーバー（推奨の変形案）

---

## 比較表

| 評価観点 | A: React+Vite+IDB | B: Next.js+Supabase | C: Electron/Tauri | D: +ローカルサーバー |
|---|---|---|---|---|
| **ローカル動画との相性** | ○ File System Access API | △ サーバー経由が複雑 | ◎ ネイティブアクセス | ◎ |
| **学習開始までの摩擦** | ◎ ブラウザで即起動 | △ ネット必須・認証あり | ◎ | ○ サーバー起動が必要 |
| **外部URL動画の再生** | ◎ | ◎ | ◎ | ◎ |
| **オフライン利用** | ◎ | ✕ | ◎ | ○ ネット不要だがサーバー必要 |
| **保守性** | ◎ シンプル | △ インフラ管理も必要 | △ ビルドが複雑 | ○ |
| **初期開発難易度** | ◎ 低 | △ 中〜高 | △ 中 | ○ 低〜中 |
| **将来のクラウド移行** | ○ 抽象化次第 | ◎ すでにクラウド | △ 困難 | ○ |
| **モバイル対応** | ◎ レスポンシブ | ◎ | ✕ | ◎ |
| **個人開発の持続性** | ◎ | △ コスト・複雑さ | △ | ◎ |
| **データ永続化の信頼性** | ○ IndexedDB | ◎ DB | ◎ ファイルシステム | ○ |
| **型安全・開発体験** | ◎ | ◎ | ○ | ◎ |

---

## 各オプションの詳細評価

### Option A: React + Vite + IndexedDB ★推奨

**構成**: React + TypeScript + Vite + Zustand + Dexie.js + File System Access API

**メリット**:
- サーバー不要。ブラウザを開けばすぐ使える
- File System Access API でローカル動画に直接アクセス可能
- IndexedDB（Dexie.js）で十分な容量・型安全なデータ保存
- 将来の Supabase 移行は StorageAdapter の差し替えで対応可能
- モバイル対応はレスポンシブCSSのみ

**デメリット**:
- File System Access API は Safari 非対応（Chrome/Edge 必須）
- ローカルファイルへのアクセス権限はブラウザの制限を受ける（再起動後の再認証）
- IndexedDB データはブラウザのデータに依存（バックアップが重要）

**向いているケース**: このプロジェクト ✓

---

### Option B: Next.js + Supabase

**メリット**:
- クラウド同期・マルチデバイスが最初から対応
- 認証・API・DBがセットで揃う

**デメリット**:
- インターネット依存（オフライン学習不可）
- Supabase の月額コスト（無料枠あるが制限あり）
- ローカル動画の扱いが複雑（アップロードが必要）
- 個人プロジェクトにしては過剰

**向いているケース**: 最初からマルチデバイス・クラウド同期が必要な場合

---

### Option C: Electron / Tauri

**メリット**:
- ネイティブファイルシステムアクセス（制限なし）
- macOS ネイティブアプリとして配布可能

**デメリット**:
- Electron: バンドルサイズ巨大（100MB+）
- Tauri: Rust の知識が必要
- ビルド・配布が複雑
- Web 技術として応用できない

**向いているケース**: ファイルシステムへの完全アクセスが必須な場合

---

### Option D: React + Vite + ローカルサーバー

**構成**: フロントエンドは Option A と同じ。動画ファイルは Express/Hono のローカルサーバーで配信。

**メリット**:
- Safari でも動作する
- 動画フォルダを指定するだけで自動スキャン可能

**デメリット**:
- アプリ使用のたびにサーバー起動が必要（摩擦増）
- 別プロセス管理が必要

**向いているケース**: Safari 必須 または フォルダ自動スキャンが必要な場合

---

## 結論

**Option A を採用**。

理由:
1. 使用ブラウザが Chrome 系であるため File System Access API が使える
2. サーバー不要で摩擦ゼロの起動体験を実現できる
3. StorageAdapter 抽象化により、将来の Supabase 移行のリスクが低い
4. 個人プロジェクトとして最も持続可能なシンプルさ

→ 詳細は [recommended-architecture.md](./recommended-architecture.md) を参照
