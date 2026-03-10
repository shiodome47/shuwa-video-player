/**
 * 振り返り画面のリグレッションテスト。
 *
 * 再発防止対象:
 *   Dexie の orderBy() に非インデックスフィールド（createdAt）を渡すと
 *   実行時例外になり .then() が呼ばれず「読み込み中」のまま固まる問題。
 */
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReviewView } from '../ReviewView'

// ── db モック ────────────────────────────────────────────────
vi.mock('../../storage/db', () => ({
  db: {
    bookmarks: { toArray: vi.fn().mockResolvedValue([]) },
    notes: { toArray: vi.fn().mockResolvedValue([]) },
  },
}))

// ── Zustand ストアモック ──────────────────────────────────────
vi.mock('../../features/courses/store', () => ({
  useCourseStore: (selector: (s: { lessons: [] }) => unknown) =>
    selector({ lessons: [] }),
}))

vi.mock('../../features/player/store', () => ({
  usePlayerStore: (selector: (s: { setPendingSeekTarget: () => void }) => unknown) =>
    selector({ setPendingSeekTarget: vi.fn() }),
}))

// ── テスト ────────────────────────────────────────────────────

function renderReview() {
  return render(
    <MemoryRouter>
      <ReviewView />
    </MemoryRouter>,
  )
}

describe('ReviewView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('「読み込み中」が消えてブックマーク空状態が表示される', async () => {
    renderReview()

    // 初期は「読み込み中」
    expect(screen.getByText('読み込み中…')).toBeInTheDocument()

    // db.bookmarks.toArray() が解決されたら空状態になる
    await waitFor(() => {
      expect(screen.queryByText('読み込み中…')).not.toBeInTheDocument()
    })
    expect(screen.getByText('ブックマークがありません')).toBeInTheDocument()
  })

  it('メモタブでも「読み込み中」が消える', async () => {
    const { getByText } = renderReview()

    // メモタブに切り替え（act でラップして state 更新警告を抑制）
    await waitFor(() => getByText('メモ').click())

    await waitFor(() => {
      expect(screen.queryByText('読み込み中…')).not.toBeInTheDocument()
    })
    expect(screen.getByText('メモがありません')).toBeInTheDocument()
  })
})
