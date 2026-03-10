import { Link, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { CategoryCrudDialog } from '../features/resources/components/CategoryCrudDialog'
import { CategoryTabs } from '../features/resources/components/CategoryTabs'
import { LinkCrudDialog } from '../features/resources/components/LinkCrudDialog'
import { ResourceGrid } from '../features/resources/components/ResourceGrid'
import { selectFilteredLinks, useResourceStore } from '../features/resources/store'
import type { ResourceCategory, ResourceLink } from '../types'

/**
 * リソースハブビュー。
 *
 * Phase 3 変更点:
 * - カテゴリ CRUD ダイアログを接続
 * - リンク CRUD ダイアログを接続
 * - カテゴリ削除の ConfirmDialog を追加
 */
export function ResourceHubView() {
  const { categories, selectedCategoryId, selectCategory, deleteCategory } =
    useResourceStore()
  const filteredLinks = useResourceStore(selectFilteredLinks)

  // ─── ダイアログ状態 ───────────────────────────────────────
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ResourceCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<ResourceCategory | null>(null)

  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<ResourceLink | null>(null)
  const [deletingLink, setDeletingLink] = useState<ResourceLink | null>(null)

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-neutral-800 px-6 py-3">
        <h1 className="text-sm font-semibold text-neutral-200">リソースハブ</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAddCategoryOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            カテゴリ
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddLinkOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            リソースを追加
          </Button>
        </div>
      </div>

      {/* カテゴリタブ */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={selectCategory}
          onEditCategory={setEditingCategory}
          onDeleteCategory={setDeletingCategory}
        />
      )}

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">
        {filteredLinks.length === 0 ? (
          <EmptyState
            icon={<Link />}
            title="リソースがありません"
            description={
              categories.length === 0
                ? 'まずカテゴリを作成してから、よく使う学習リンクを追加しましょう'
                : 'このカテゴリにはまだリソースがありません'
            }
            action={{ label: 'リソースを追加', onClick: () => setAddLinkOpen(true) }}
          />
        ) : (
          <ResourceGrid
            links={filteredLinks}
            categories={categories}
            onEditLink={setEditingLink}
            onDeleteLink={setDeletingLink}
          />
        )}
      </div>

      {/* ─── ダイアログ群 ───────────────────────────────────── */}

      {/* カテゴリ追加 */}
      <CategoryCrudDialog
        isOpen={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
      />

      {/* カテゴリ編集 */}
      <CategoryCrudDialog
        isOpen={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        category={editingCategory ?? undefined}
      />

      {/* カテゴリ削除 */}
      <ConfirmDialog
        isOpen={deletingCategory !== null}
        onClose={() => setDeletingCategory(null)}
        onConfirm={async () => {
          if (deletingCategory) {
            await deleteCategory(deletingCategory.id)
            setDeletingCategory(null)
          }
        }}
        title="カテゴリを削除"
        description={`「${deletingCategory?.name}」を削除しますか？\nこのカテゴリのリソースリンクもすべて削除されます。この操作は取り消せません。`}
      />

      {/* リンク追加 */}
      <LinkCrudDialog
        isOpen={addLinkOpen}
        onClose={() => setAddLinkOpen(false)}
        defaultCategoryId={selectedCategoryId ?? undefined}
      />

      {/* リンク編集 */}
      <LinkCrudDialog
        isOpen={editingLink !== null}
        onClose={() => setEditingLink(null)}
        link={editingLink ?? undefined}
      />

      {/* リンク削除 */}
      <ConfirmDialog
        isOpen={deletingLink !== null}
        onClose={() => setDeletingLink(null)}
        onConfirm={async () => {
          if (deletingLink) {
            await useResourceStore.getState().deleteLink(deletingLink.id)
            setDeletingLink(null)
          }
        }}
        title="リソースを削除"
        description={`「${deletingLink?.title}」を削除しますか？この操作は取り消せません。`}
      />
    </div>
  )
}
