import { Bookmark, Pencil, Plus, Trash2, Check, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { seekPlayer, usePlayerStore } from '../../player/store'
import { useLearningStore } from '../store'
import { formatTime } from '../../../utils/time'
import { cn } from '../../../utils/cn'

/**
 * ブックマーク一覧 + 追加 / 編集 / 削除 UI。
 *
 * 操作フロー:
 * - 「+ 現在位置に追加」→ インライン追加フォームが開く（ラベル任意）
 * - タイムスタンプをクリック → その位置にシーク
 * - 鉛筆アイコン → インライン編集モード
 */
export function BookmarkPanel({ lessonId }: { lessonId: string }) {
  const { bookmarks, addBookmark, updateBookmark, deleteBookmark } = useLearningStore()
  const currentTime = usePlayerStore((s) => s.currentTime)

  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          ブックマーク
        </span>
        <button
          onClick={() => setShowAdd(true)}
          disabled={showAdd}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300 disabled:opacity-40"
        >
          <Plus className="h-3 w-3" />
          現在位置に追加
        </button>
      </div>

      {/* 追加フォーム */}
      {showAdd && (
        <AddBookmarkForm
          positionSeconds={currentTime}
          onAdd={async (label) => {
            await addBookmark(lessonId, currentTime, label)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* リスト */}
      {bookmarks.length === 0 && !showAdd ? (
        <div className="px-4 py-8 text-center">
          <Bookmark className="mx-auto mb-2 h-7 w-7 text-neutral-800" />
          <p className="text-xs text-neutral-600">ブックマークがありません</p>
          <p className="mt-1 text-[11px] text-neutral-700">
            再生中に「現在位置に追加」で記録できます
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-800/40 pb-2">
          {bookmarks.map((bm) => (
            <BookmarkItem
              key={bm.id}
              label={bm.label}
              positionSeconds={bm.positionSeconds}
              onSeek={() => seekPlayer(bm.positionSeconds)}
              onSave={(label) => updateBookmark(bm.id, label)}
              onDelete={() => deleteBookmark(bm.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 追加フォーム ────────────────────────────────────────────────

function AddBookmarkForm({
  positionSeconds,
  onAdd,
  onCancel,
}: {
  positionSeconds: number
  onAdd: (label: string) => Promise<void>
  onCancel: () => void
}) {
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onAdd(label.trim())
    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-3 mb-2 rounded-lg border border-neutral-700 bg-neutral-900 p-3"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-accent-400">
          {formatTime(positionSeconds)}
        </span>
        <span className="text-[11px] text-neutral-600">に追加</span>
      </div>
      <input
        ref={inputRef}
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="ラベル（任意）"
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 outline-none focus:border-accent-600"
      />
      <div className="mt-2 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2.5 py-1 text-[11px] text-neutral-500 hover:text-neutral-300"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-accent-600 disabled:opacity-50"
        >
          追加
        </button>
      </div>
    </form>
  )
}

// ─── ブックマーク行 ──────────────────────────────────────────────

function BookmarkItem({
  label,
  positionSeconds,
  onSeek,
  onSave,
  onDelete,
}: {
  label: string
  positionSeconds: number
  onSeek: () => void
  onSave: (label: string) => Promise<void>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(label)

  const handleSave = async () => {
    await onSave(editLabel.trim())
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleSave()
    if (e.key === 'Escape') { setEditLabel(label); setEditing(false) }
  }

  return (
    <div className={cn('group flex items-center gap-2 px-4 py-2', editing && 'bg-neutral-900/50')}>
      {/* タイムスタンプ（クリックでシーク）*/}
      <button
        onClick={onSeek}
        className="flex-shrink-0 rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-accent-400 transition-colors hover:bg-neutral-700"
        title="この位置にシーク"
      >
        {formatTime(positionSeconds)}
      </button>

      {/* ラベル or 編集フィールド */}
      {editing ? (
        <input
          autoFocus
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200 outline-none focus:border-accent-600"
        />
      ) : (
        <span className="flex-1 truncate text-xs text-neutral-400">
          {label || <span className="text-neutral-700">（ラベルなし）</span>}
        </span>
      )}

      {/* アクション */}
      {editing ? (
        <div className="flex items-center gap-0.5">
          <button onClick={handleSave} title="保存" className="rounded p-0.5 text-accent-500 hover:text-accent-300">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setEditLabel(label); setEditing(false) }} title="キャンセル" className="rounded p-0.5 text-neutral-600 hover:text-neutral-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => setEditing(true)} title="編集" className="rounded p-0.5 text-neutral-600 hover:text-neutral-300">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={onDelete} title="削除" className="rounded p-0.5 text-neutral-600 hover:text-red-400">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
