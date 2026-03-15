// ============================================================
// リソースハブ DnD — Sortable ID ヘルパー
// ============================================================

const CATEGORY_PREFIX = 'res-cat::'
const LINK_PREFIX = 'res-link::'

export function makeCategorySortableId(id: string): string {
  return `${CATEGORY_PREFIX}${id}`
}

export function parseCategorySortableId(sortableId: string): string {
  return sortableId.slice(CATEGORY_PREFIX.length)
}

export function makeLinkSortableId(id: string): string {
  return `${LINK_PREFIX}${id}`
}

export function parseLinkSortableId(sortableId: string): string {
  return sortableId.slice(LINK_PREFIX.length)
}
