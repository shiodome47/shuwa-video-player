import { create } from 'zustand'
import { storage } from '../../storage/db'
import type { ResourceCategory, ResourceLink } from '../../types'

// ============================================================
// 入力型定義（Phase 3 の CRUD UI がそのまま使う）
// ============================================================

export interface CreateCategoryInput {
  name: string
  description?: string
  /** Tailwind カラー名 or hex。例: 'teal' / '#14b8a6' */
  color?: string
}

export interface UpdateCategoryInput {
  name?: string
  description?: string
  color?: string
}

export interface CreateLinkInput {
  categoryId: string
  title: string
  url: string
  description?: string
  tags?: string[]
}

export interface UpdateLinkInput {
  categoryId?: string
  title?: string
  url?: string
  description?: string
  tags?: string[]
  isFavorited?: boolean
  isPinned?: boolean
}

// ============================================================
// ストア型定義
// ============================================================

interface ResourceState {
  // --- データ ---
  categories: ResourceCategory[]
  links: ResourceLink[]

  // --- UI 状態 ---
  /** null = 「すべて」表示 */
  selectedCategoryId: string | null

  // --- 初期化 ---
  loadAll: () => Promise<void>

  // --- UI アクション ---
  selectCategory: (categoryId: string | null) => void

  // --- Category CRUD ---
  addCategory: (data: CreateCategoryInput) => Promise<ResourceCategory>
  updateCategory: (id: string, data: UpdateCategoryInput) => Promise<void>
  /** 配下のリンクをカスケード削除する */
  deleteCategory: (id: string) => Promise<void>

  // --- Link CRUD ---
  addLink: (data: CreateLinkInput) => Promise<ResourceLink>
  updateLink: (id: string, data: UpdateLinkInput) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  /** 最終アクセス日時を更新する（リンクを開いたときに呼ぶ） */
  recordAccess: (id: string) => Promise<void>

  // --- 並べ替え ---
  reorderCategories: (orderedIds: string[]) => Promise<void>
  reorderLinks: (orderedIds: string[]) => Promise<void>
}

// ============================================================
// ストア実装
// ============================================================

export const useResourceStore = create<ResourceState>((set, get) => ({
  categories: [],
  links: [],
  selectedCategoryId: null,

  // ─── 初期化 ───────────────────────────────────────────────

  loadAll: async () => {
    const [categories, links] = await Promise.all([
      storage.getAll<ResourceCategory>('resourceCategories'),
      storage.getAll<ResourceLink>('resourceLinks'),
    ])
    set({ categories, links })
  },

  // ─── UI アクション ────────────────────────────────────────

  selectCategory: (categoryId) => set({ selectedCategoryId: categoryId }),

  // ─── Category CRUD ───────────────────────────────────────

  addCategory: async (data) => {
    const now = new Date().toISOString()
    const category: ResourceCategory = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description ?? '',
      color: data.color,
      order: get().categories.length,
      createdAt: now,
      updatedAt: now,
    }
    await storage.put('resourceCategories', category)
    set((s) => ({ categories: [...s.categories, category] }))
    return category
  },

  updateCategory: async (id, data) => {
    const existing = get().categories.find((c) => c.id === id)
    if (!existing) return
    const updated: ResourceCategory = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await storage.put('resourceCategories', updated)
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? updated : c)),
    }))
  },

  deleteCategory: async (id) => {
    const linkIds = get().links.filter((l) => l.categoryId === id).map((l) => l.id)

    await storage.transaction(async () => {
      await Promise.all([
        ...linkIds.map((lId) => storage.delete('resourceLinks', lId)),
        storage.delete('resourceCategories', id),
      ])
    })

    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      links: s.links.filter((l) => !linkIds.includes(l.id)),
    }))
  },

  // ─── Link CRUD ───────────────────────────────────────────

  addLink: async (data) => {
    const now = new Date().toISOString()
    const order = get().links.filter((l) => l.categoryId === data.categoryId).length
    const link: ResourceLink = {
      id: crypto.randomUUID(),
      categoryId: data.categoryId,
      title: data.title,
      url: data.url,
      description: data.description ?? '',
      tags: data.tags ?? [],
      isFavorited: false,
      isPinned: false,
      order,
      createdAt: now,
      updatedAt: now,
    }
    await storage.put('resourceLinks', link)
    set((s) => ({ links: [...s.links, link] }))
    return link
  },

  updateLink: async (id, data) => {
    const existing = get().links.find((l) => l.id === id)
    if (!existing) return
    const updated: ResourceLink = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await storage.put('resourceLinks', updated)
    set((s) => ({ links: s.links.map((l) => (l.id === id ? updated : l)) }))
  },

  deleteLink: async (id) => {
    await storage.delete('resourceLinks', id)
    set((s) => ({ links: s.links.filter((l) => l.id !== id) }))
  },

  recordAccess: async (id) => {
    const existing = get().links.find((l) => l.id === id)
    if (!existing) return
    const updated: ResourceLink = {
      ...existing,
      lastAccessedAt: new Date().toISOString(),
    }
    await storage.put('resourceLinks', updated)
    set((s) => ({ links: s.links.map((l) => (l.id === id ? updated : l)) }))
  },

  // ─── 並べ替え ──────────────────────────────────────────

  reorderCategories: async (orderedIds) => {
    const now = new Date().toISOString()
    const updated = orderedIds.map((id, index) => ({
      ...get().categories.find((c) => c.id === id)!,
      order: index,
      updatedAt: now,
    }))
    set((s) => ({ categories: s.categories.map((c) => updated.find((u) => u.id === c.id) ?? c) }))
    await Promise.all(updated.map((c) => storage.put('resourceCategories', c)))
  },

  reorderLinks: async (orderedIds) => {
    const now = new Date().toISOString()
    const updated = orderedIds.map((id, index) => ({
      ...get().links.find((l) => l.id === id)!,
      order: index,
      updatedAt: now,
    }))
    set((s) => ({ links: s.links.map((l) => updated.find((u) => u.id === l.id) ?? l) }))
    await Promise.all(updated.map((l) => storage.put('resourceLinks', l)))
  },
}))

// ============================================================
// セレクター
// ============================================================

/**
 * 選択中カテゴリでフィルタし、order 昇順に並べたリンク一覧。
 *
 * 使い方（コンポーネント内）:
 *   const filteredLinks = useResourceStore(selectFilteredLinks)
 *
 * Zustand のセレクターとして使うため、引数は ResourceState 全体。
 */
export function selectFilteredLinks(state: ResourceState): ResourceLink[] {
  const filtered = state.selectedCategoryId
    ? state.links.filter((l) => l.categoryId === state.selectedCategoryId)
    : state.links

  return [...filtered].sort((a, b) => a.order - b.order)
}
