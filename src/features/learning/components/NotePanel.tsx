import { FileText, Pencil, Plus, Trash2, Check, X, Clock } from 'lucide-react'
import { useState } from 'react'
import { seekPlayer, usePlayerStore } from '../../player/store'
import { useLearningStore } from '../store'
import { formatTime } from '../../../utils/time'
import { cn } from '../../../utils/cn'
import type { Note } from '../../../types'

/**
 * メモ一覧 + 追加 / 編集 / 削除 UI。
 *
 * - タイムスタンプ付きメモ: 動画の現在位置に紐づく
 * - 一般メモ: タイムスタンプなし
 * 表示順: タイムスタンプ付き（時刻順）→ 一般メモ（作成日時順）
 */
export function NotePanel({ lessonId }: { lessonId: string }) {
  const { notes, addNote, updateNote, deleteNote } = useLearningStore()
  const currentTime = usePlayerStore((s) => s.currentTime)

  const [addMode, setAddMode] = useState<'timestamp' | 'general' | null>(null)

  // タイムスタンプ付き（時刻昇順）→ 一般（作成日時順）
  const sorted = [...notes].sort((a, b) => {
    if (a.positionSeconds != null && b.positionSeconds != null)
      return a.positionSeconds - b.positionSeconds
    if (a.positionSeconds != null) return -1
    if (b.positionSeconds != null) return 1
    return a.createdAt.localeCompare(b.createdAt)
  })

  return (
    <div className="flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          メモ
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAddMode('timestamp')}
            disabled={addMode !== null}
            title="現在の再生位置に紐づくメモを追加"
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300 disabled:opacity-40"
          >
            <Clock className="h-3 w-3" />
            時刻付き
          </button>
          <button
            onClick={() => setAddMode('general')}
            disabled={addMode !== null}
            title="タイムスタンプなしのメモを追加"
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300 disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
            一般
          </button>
        </div>
      </div>

      {/* 追加フォーム */}
      {addMode !== null && (
        <AddNoteForm
          positionSeconds={addMode === 'timestamp' ? currentTime : undefined}
          onAdd={async (content) => {
            await addNote(
              lessonId,
              content,
              addMode === 'timestamp' ? currentTime : undefined,
            )
            setAddMode(null)
          }}
          onCancel={() => setAddMode(null)}
        />
      )}

      {/* リスト */}
      {sorted.length === 0 && addMode === null ? (
        <div className="px-4 py-8 text-center">
          <FileText className="mx-auto mb-2 h-7 w-7 text-neutral-800" />
          <p className="text-xs text-neutral-600">メモがありません</p>
          <p className="mt-1 text-[11px] text-neutral-700">
            「時刻付き」で動画の特定位置にメモを残せます
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-800/40 pb-2">
          {sorted.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onSeek={note.positionSeconds != null ? () => seekPlayer(note.positionSeconds!) : undefined}
              onSave={(content) => updateNote(note.id, content)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 追加フォーム ────────────────────────────────────────────────

function AddNoteForm({
  positionSeconds,
  onAdd,
  onCancel,
}: {
  positionSeconds?: number
  onAdd: (content: string) => Promise<void>
  onCancel: () => void
}) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    await onAdd(content.trim())
    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-3 mb-2 rounded-lg border border-neutral-700 bg-neutral-900 p-3"
    >
      {positionSeconds != null && (
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-accent-400">
            {formatTime(positionSeconds)}
          </span>
          <span className="text-[11px] text-neutral-600">のメモ</span>
        </div>
      )}
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={positionSeconds != null ? 'このシーンのメモを入力…' : '一般メモを入力…'}
        rows={3}
        className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 outline-none focus:border-accent-600"
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
          disabled={saving || !content.trim()}
          className="rounded-md bg-accent-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-accent-600 disabled:opacity-50"
        >
          保存
        </button>
      </div>
    </form>
  )
}

// ─── メモ行 ─────────────────────────────────────────────────────

function NoteItem({
  note,
  onSeek,
  onSave,
  onDelete,
}: {
  note: Note
  onSeek?: () => void
  onSave: (content: string) => Promise<void>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)

  const handleSave = async () => {
    if (!editContent.trim()) return
    await onSave(editContent.trim())
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setEditContent(note.content); setEditing(false) }
  }

  return (
    <div className={cn('group px-4 py-2.5', editing && 'bg-neutral-900/50')}>
      {/* タイムスタンプ */}
      {note.positionSeconds != null && (
        <div className="mb-1">
          <button
            onClick={onSeek}
            className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-accent-400 transition-colors hover:bg-neutral-700"
            title="この位置にシーク"
          >
            {formatTime(note.positionSeconds)}
          </button>
        </div>
      )}

      {/* 内容 or 編集 */}
      {editing ? (
        <>
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 outline-none focus:border-accent-600"
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <button
              onClick={handleSave}
              disabled={!editContent.trim()}
              className="flex items-center gap-1 rounded-md bg-accent-700 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-accent-600 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> 保存
            </button>
            <button
              onClick={() => { setEditContent(note.content); setEditing(false) }}
              className="rounded-md px-2 py-0.5 text-[11px] text-neutral-500 hover:text-neutral-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-2">
          <p className="flex-1 whitespace-pre-wrap text-xs leading-relaxed text-neutral-400">
            {note.content}
          </p>
          <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => setEditing(true)} title="編集" className="rounded p-0.5 text-neutral-600 hover:text-neutral-300">
              <Pencil className="h-3 w-3" />
            </button>
            <button onClick={onDelete} title="削除" className="rounded p-0.5 text-neutral-600 hover:text-red-400">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
