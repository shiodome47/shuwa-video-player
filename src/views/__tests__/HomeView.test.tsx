/**
 * ホームダッシュボードのリグレッションテスト。
 *
 * 再発防止対象:
 *   db.playbackStates / db.bookmarks / db.notes で orderBy() に非インデックスフィールドを
 *   使うと例外になり、「読み込み中」のまま固まる問題。
 */
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomeView } from '../HomeView'

// ── db モック ────────────────────────────────────────────────
vi.mock('../../storage/db', () => ({
  db: {
    playbackStates: { toArray: vi.fn().mockResolvedValue([]) },
    progresses: { toArray: vi.fn().mockResolvedValue([]) },
    bookmarks: { toArray: vi.fn().mockResolvedValue([]) },
    notes: { toArray: vi.fn().mockResolvedValue([]) },
  },
}))

// ── Zustand ストアモック ──────────────────────────────────────
// HomeView は useCourseStore() と useCourseStore(selector) の両方で呼ぶため
// セレクタなしの場合はオブジェクトをそのまま返す
const courseState = { courses: [], sections: [], lessons: [] }
vi.mock('../../features/courses/store', () => ({
  useCourseStore: (selector?: (s: typeof courseState) => unknown) =>
    selector ? selector(courseState) : courseState,
}))

const resourceState = { links: [] }
vi.mock('../../features/resources/store', () => ({
  useResourceStore: (selector?: (s: typeof resourceState) => unknown) =>
    selector ? selector(resourceState) : resourceState,
}))

const playerState = { setPendingSeekTarget: vi.fn() }
vi.mock('../../features/player/store', () => ({
  usePlayerStore: (selector?: (s: typeof playerState) => unknown) =>
    selector ? selector(playerState) : playerState,
}))

// ── テスト ────────────────────────────────────────────────────

function renderHome() {
  return render(
    <MemoryRouter>
      <HomeView />
    </MemoryRouter>,
  )
}

describe('HomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('「読み込み中」が表示されずレンダリングが完了する（データなし時）', async () => {
    renderHome()

    // データなしの場合は各セクションが非表示になるだけで固まらない
    await waitFor(() => {
      expect(screen.queryByText('読み込み中…')).not.toBeInTheDocument()
    })
  })

  it('db の toArray() が全て呼ばれる', async () => {
    const { db } = await import('../../storage/db')
    renderHome()

    await waitFor(() => {
      expect(db.playbackStates.toArray).toHaveBeenCalled()
      expect(db.bookmarks.toArray).toHaveBeenCalled()
      expect(db.notes.toArray).toHaveBeenCalled()
    })
  })
})
