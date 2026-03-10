/**
 * Dexie スキーマの orderBy 安全性テスト。
 *
 * 再発防止対象:
 *   非インデックスフィールドで orderBy() すると実行時例外になる問題。
 *
 * fake-indexeddb を使うことで実際の Dexie 動作を検証する。
 * このテストが通る = toArray() で取得できる = 画面がフリーズしない。
 */
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { ShuwaDB } from '../../storage/schema'
import type { Bookmark, PlaybackState } from '../../types'

let db: ShuwaDB

beforeEach(async () => {
  // テストごとに新しい DB インスタンスを作る
  db = new ShuwaDB()
  await db.open()
})

describe('db.bookmarks', () => {
  it('toArray() が解決する（createdAt でJSソートすることが前提）', async () => {
    const rows = await db.bookmarks.toArray()
    expect(Array.isArray(rows)).toBe(true)
  })

  it('createdAt でのJSソートが動作する', async () => {
    const bm1: Bookmark = { id: 'b1', lessonId: 'l1', positionSeconds: 10, label: 'A', createdAt: '2024-01-01T00:00:00Z' }
    const bm2: Bookmark = { id: 'b2', lessonId: 'l1', positionSeconds: 20, label: 'B', createdAt: '2024-06-01T00:00:00Z' }
    await db.bookmarks.bulkPut([bm1, bm2])

    const rows = await db.bookmarks.toArray()
    const sorted = rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    expect(sorted[0].id).toBe('b2') // 新しい方が先頭
  })
})

describe('db.notes', () => {
  it('toArray() が解決する', async () => {
    const rows = await db.notes.toArray()
    expect(Array.isArray(rows)).toBe(true)
  })
})

describe('db.playbackStates', () => {
  it('toArray() が解決する（updatedAt でJSソートすることが前提）', async () => {
    const rows = await db.playbackStates.toArray()
    expect(Array.isArray(rows)).toBe(true)
  })

  it('updatedAt でのJSソートが動作する', async () => {
    const ps1: PlaybackState = { lessonId: 'l1', positionSeconds: 10, playbackRate: 1, updatedAt: '2024-01-01T00:00:00Z' }
    const ps2: PlaybackState = { lessonId: 'l2', positionSeconds: 20, playbackRate: 1, updatedAt: '2024-06-01T00:00:00Z' }
    await db.playbackStates.bulkPut([ps1, ps2])

    const rows = await db.playbackStates.toArray()
    const sorted = rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    expect(sorted[0].lessonId).toBe('l2') // 新しい方が先頭
  })
})
