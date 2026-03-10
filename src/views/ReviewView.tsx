import { Bookmark, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '../features/courses/store'
import { usePlayerStore } from '../features/player/store'
import { db } from '../storage/db'
import type { Bookmark as BookmarkType, Note } from '../types'
import { formatTime } from '../utils/time'
import { cn } from '../utils/cn'

type Tab = 'bookmarks' | 'notes'

/**
 * 振り返り画面（Phase 5B）。
 * 全レッスンのブックマーク・メモを一覧表示する。
 * タイムスタンプをクリックするとレッスン画面に遷移してシークする。
 */
export function ReviewView() {
  const [active, setActive] = useState<Tab>('bookmarks')

  const tabBase = 'px-3.5 py-1.5 text-sm rounded-lg transition-colors'
  const tabActive = 'bg-neutral-800 text-neutral-100'
  const tabInactive = 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'

  return (
    <div className="flex h-full flex-col">
      {/* タブバー */}
      <div className="flex flex-shrink-0 items-center gap-1 border-b border-neutral-800 px-4 py-2">
        <button
          onClick={() => setActive('bookmarks')}
          className={cn(tabBase, active === 'bookmarks' ? tabActive : tabInactive)}
        >
          ブックマーク
        </button>
        <button
          onClick={() => setActive('notes')}
          className={cn(tabBase, active === 'notes' ? tabActive : tabInactive)}
        >
          メモ
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">
        {active === 'bookmarks' ? <AllBookmarks /> : <AllNotes />}
      </div>
    </div>
  )
}

// ─── 全ブックマーク ────────────────────────────────────────────

function AllBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void db.bookmarks
      .toArray()
      .then((rows) => {
        setBookmarks(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingPlaceholder />

  if (bookmarks.length === 0) {
    return (
      <EmptyPlaceholder
        icon={<Bookmark className="h-8 w-8 text-neutral-800" />}
        message="ブックマークがありません"
        sub="学習中に「現在位置に追加」で記録できます"
      />
    )
  }

  return (
    <div className="divide-y divide-neutral-800/40">
      {bookmarks.map((bm) => (
        <BookmarkRow key={bm.id} bookmark={bm} />
      ))}
    </div>
  )
}

function BookmarkRow({ bookmark }: { bookmark: BookmarkType }) {
  const lessons = useCourseStore((s) => s.lessons)
  const lesson = lessons.find((l) => l.id === bookmark.lessonId)
  const navigate = useNavigate()
  const setPendingSeekTarget = usePlayerStore((s) => s.setPendingSeekTarget)

  const handleClick = () => {
    setPendingSeekTarget(bookmark.positionSeconds)
    navigate(`/lesson/${bookmark.lessonId}`)
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5">
      <button
        onClick={handleClick}
        className="flex-shrink-0 rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-accent-400 transition-colors hover:bg-neutral-700"
        title="この位置で開く"
      >
        {formatTime(bookmark.positionSeconds)}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-neutral-400">
          {bookmark.label || <span className="text-neutral-700">（ラベルなし）</span>}
        </p>
        <p className="truncate text-[10px] text-neutral-600">{lesson?.title ?? bookmark.lessonId}</p>
      </div>
    </div>
  )
}

// ─── 全メモ ───────────────────────────────────────────────────

function AllNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void db.notes
      .toArray()
      .then((rows) => {
        setNotes(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingPlaceholder />

  if (notes.length === 0) {
    return (
      <EmptyPlaceholder
        icon={<FileText className="h-8 w-8 text-neutral-800" />}
        message="メモがありません"
        sub="学習中に「時刻付き」または「一般」でメモを追加できます"
      />
    )
  }

  return (
    <div className="divide-y divide-neutral-800/40">
      {notes.map((note) => (
        <NoteRow key={note.id} note={note} />
      ))}
    </div>
  )
}

function NoteRow({ note }: { note: Note }) {
  const lessons = useCourseStore((s) => s.lessons)
  const lesson = lessons.find((l) => l.id === note.lessonId)
  const navigate = useNavigate()
  const setPendingSeekTarget = usePlayerStore((s) => s.setPendingSeekTarget)

  const handleSeek = () => {
    if (note.positionSeconds == null) return
    setPendingSeekTarget(note.positionSeconds)
    navigate(`/lesson/${note.lessonId}`)
  }

  return (
    <div className="px-4 py-2.5">
      <div className="mb-1 flex items-center gap-2">
        {note.positionSeconds != null && (
          <button
            onClick={handleSeek}
            className="flex-shrink-0 rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-accent-400 transition-colors hover:bg-neutral-700"
            title="この位置で開く"
          >
            {formatTime(note.positionSeconds)}
          </button>
        )}
        <span className="truncate text-[10px] text-neutral-600">{lesson?.title ?? note.lessonId}</span>
      </div>
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-neutral-400">{note.content}</p>
    </div>
  )
}

// ─── 共通 ─────────────────────────────────────────────────────

function LoadingPlaceholder() {
  return <div className="px-4 py-8 text-center text-xs text-neutral-600">読み込み中…</div>
}

function EmptyPlaceholder({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode
  message: string
  sub: string
}) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="mx-auto mb-2 w-fit">{icon}</div>
      <p className="text-xs text-neutral-600">{message}</p>
      <p className="mt-1 text-[11px] text-neutral-700">{sub}</p>
    </div>
  )
}
