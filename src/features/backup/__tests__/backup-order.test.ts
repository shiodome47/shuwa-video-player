/**
 * backup の export/import を通じて Course・Section・Lesson の
 * order フィールドが保持されるかを確認するテスト。
 *
 * fake-indexeddb/auto を最初にインポートすることで、
 * storage/db のシングルトン (db) も偽 IndexedDB 上で動作する。
 */
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../../../storage/db'
import { exportBackup, importBackup, parseBackupJson } from '../backupUtils'
import type { Course, Section, Lesson } from '../../../types'

beforeEach(async () => {
  // テストごとに全テーブルをリセット
  await Promise.all([
    db.courses.clear(),
    db.sections.clear(),
    db.lessons.clear(),
    db.videoSources.clear(),
    db.bookmarks.clear(),
    db.notes.clear(),
    db.progresses.clear(),
    db.playbackStates.clear(),
    db.resourceCategories.clear(),
    db.resourceLinks.clear(),
  ])
})

const now = '2024-01-01T00:00:00Z'

const c = (id: string, order: number): Course => ({
  id, order, title: `Course ${id}`, description: '',
  createdAt: now, updatedAt: now,
})

const s = (id: string, order: number): Section => ({
  id, order, courseId: 'c1', title: `Section ${id}`,
  createdAt: now, updatedAt: now,
})

const l = (id: string, order: number): Lesson => ({
  id, order, courseId: 'c1', sectionId: 's1', title: `Lesson ${id}`,
  description: '', tags: [], isFavorited: false, isCompleted: false,
  createdAt: now, updatedAt: now,
})

describe('export: JSON に order が含まれる', () => {
  it('Course.order', async () => {
    await db.courses.bulkPut([c('c1', 3), c('c2', 7)])
    const parsed = parseBackupJson(JSON.stringify(await exportBackup()))
    expect(parsed.data.courses.find((x) => x.id === 'c1')?.order).toBe(3)
    expect(parsed.data.courses.find((x) => x.id === 'c2')?.order).toBe(7)
  })

  it('Section.order', async () => {
    await db.sections.bulkPut([s('s1', 1), s('s2', 5)])
    const parsed = parseBackupJson(JSON.stringify(await exportBackup()))
    expect(parsed.data.sections.find((x) => x.id === 's1')?.order).toBe(1)
    expect(parsed.data.sections.find((x) => x.id === 's2')?.order).toBe(5)
  })

  it('Lesson.order', async () => {
    await db.lessons.bulkPut([l('l1', 2), l('l2', 9)])
    const parsed = parseBackupJson(JSON.stringify(await exportBackup()))
    expect(parsed.data.lessons.find((x) => x.id === 'l1')?.order).toBe(2)
    expect(parsed.data.lessons.find((x) => x.id === 'l2')?.order).toBe(9)
  })
})

describe('import: DB に order が復元される', () => {
  it('Course.order', async () => {
    await db.courses.bulkPut([c('c1', 2), c('c2', 0)])
    const backup = parseBackupJson(JSON.stringify(await exportBackup()))
    await db.courses.clear()
    await importBackup(backup)
    const rows = await db.courses.toArray()
    expect(rows.find((x) => x.id === 'c1')?.order).toBe(2)
    expect(rows.find((x) => x.id === 'c2')?.order).toBe(0)
  })

  it('Section.order', async () => {
    await db.sections.bulkPut([s('s1', 4), s('s2', 1)])
    const backup = parseBackupJson(JSON.stringify(await exportBackup()))
    await db.sections.clear()
    await importBackup(backup)
    const rows = await db.sections.toArray()
    expect(rows.find((x) => x.id === 's1')?.order).toBe(4)
    expect(rows.find((x) => x.id === 's2')?.order).toBe(1)
  })

  it('Lesson.order', async () => {
    await db.lessons.bulkPut([l('l1', 6), l('l2', 3)])
    const backup = parseBackupJson(JSON.stringify(await exportBackup()))
    await db.lessons.clear()
    await importBackup(backup)
    const rows = await db.lessons.toArray()
    expect(rows.find((x) => x.id === 'l1')?.order).toBe(6)
    expect(rows.find((x) => x.id === 'l2')?.order).toBe(3)
  })
})
