import { BookOpen, Bookmark, Clock, ExternalLink, FileText, Play, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCourseStore } from '../features/courses/store'
import { usePlayerStore } from '../features/player/store'
import { useResourceStore } from '../features/resources/store'
import { db } from '../storage/db'
import type { Bookmark as BookmarkType, Lesson, Note, PlaybackState, Progress } from '../types'
import { formatTime } from '../utils/time'

/**
 * ホームダッシュボード（Phase 6）。
 * 「アプリを開いた瞬間に次の学習行動へ自然に入れること」を目的とする。
 *
 * セクション構成:
 * 1. 続きから再開（最後に再生したレッスン）
 * 2. コース進捗サマリー
 * 3. お気に入りリソース
 * 4. 最近のブックマーク / メモ
 */
import { OnboardingModal } from '../components/OnboardingModal'

export function HomeView() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <OnboardingModal />
      <ResumeSection />
      <CourseProgressSection />
      <FavoriteResourcesSection />
      <RecentActivitySection />
    </div>
  )
}

// ─── 1. 続きから再開 ──────────────────────────────────────────

function ResumeSection() {
  const [states, setStates] = useState<PlaybackState[]>([])
  const lessons = useCourseStore((s) => s.lessons)
  const navigate = useNavigate()
  const setPendingSeekTarget = usePlayerStore((s) => s.setPendingSeekTarget)

  useEffect(() => {
    void db.playbackStates
      .toArray()
      .then((rows) =>
        setStates(rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)),
      )
  }, [])

  const recent = states
    .map((ps) => ({ ps, lesson: lessons.find((l) => l.id === ps.lessonId) }))
    .filter((x): x is { ps: PlaybackState; lesson: Lesson } => x.lesson !== undefined)

  if (recent.length === 0) return null

  const [top, ...rest] = recent

  const handleResume = (ps: PlaybackState) => {
    if (ps.positionSeconds > 3) {
      setPendingSeekTarget(ps.positionSeconds)
    }
    navigate(`/lesson/${ps.lessonId}`)
  }

  return (
    <section>
      <SectionHeading icon={<Play className="h-3.5 w-3.5" />} label="続きから" />

      {/* プライマリカード */}
      <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <LessonMeta lessonId={top.lesson.id} />
            <p className="mt-0.5 truncate text-sm font-medium text-neutral-100">{top.lesson.title}</p>
            {top.ps.positionSeconds > 3 && (
              <p className="mt-1 text-[11px] text-neutral-600">
                <Clock className="mr-0.5 inline h-3 w-3" />
                {formatTime(top.ps.positionSeconds)} まで視聴済み
              </p>
            )}
          </div>
          <button
            onClick={() => handleResume(top.ps)}
            className="flex-shrink-0 rounded-lg bg-accent-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600"
          >
            再生
          </button>
        </div>
      </div>

      {/* 最近の他レッスン（小さめ） */}
      {rest.length > 0 && (
        <div className="mt-2 divide-y divide-neutral-800/40 rounded-xl border border-neutral-800 bg-neutral-900/40">
          {rest.map(({ ps, lesson }) => (
            <button
              key={ps.lessonId}
              onClick={() => handleResume(ps)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-800/40"
            >
              <Play className="h-3 w-3 flex-shrink-0 text-neutral-600" />
              <span className="flex-1 truncate text-xs text-neutral-400">{lesson.title}</span>
              {ps.positionSeconds > 3 && (
                <span className="flex-shrink-0 font-mono text-[10px] text-neutral-600">
                  {formatTime(ps.positionSeconds)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 2. コース進捗サマリー ────────────────────────────────────

function CourseProgressSection() {
  const { courses, lessons } = useCourseStore()
  const [progresses, setProgresses] = useState<Progress[]>([])

  useEffect(() => {
    void db.progresses.toArray().then(setProgresses)
  }, [])

  if (courses.length === 0) return null

  return (
    <section>
      <SectionHeading icon={<BookOpen className="h-3.5 w-3.5" />} label="コース進捗" />
      <div className="mt-2 space-y-2">
        {courses.map((course) => {
          const courseLessons = lessons.filter((l) => l.courseId === course.id)
          const total = courseLessons.length
          const completed = courseLessons.filter((l) => l.isCompleted).length
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0
          const watchSecs = progresses
            .filter((p) => courseLessons.some((l) => l.id === p.lessonId))
            .reduce((sum, p) => sum + (p.totalWatchedSeconds ?? 0), 0)

          return (
            <div
              key={course.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium text-neutral-200">{course.title}</p>
                <span className="flex-shrink-0 text-[11px] text-neutral-500">
                  {completed}/{total} レッスン
                </span>
              </div>
              {/* 進捗バー */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-accent-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-neutral-600">
                <span>{pct}% 完了</span>
                {watchSecs > 0 && <span>合計視聴 {formatWatchTime(watchSecs)}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── 3. お気に入りリソース ────────────────────────────────────

function FavoriteResourcesSection() {
  const links = useResourceStore((s) => s.links)
  const favs = links.filter((l) => l.isFavorited).slice(0, 5)

  if (favs.length === 0) return null

  return (
    <section>
      <SectionHeading icon={<Star className="h-3.5 w-3.5" />} label="お気に入りリソース" />
      <div className="mt-2 divide-y divide-neutral-800/40 rounded-xl border border-neutral-800 bg-neutral-900/40">
        {favs.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-800/40"
          >
            <span className="flex-1 truncate text-xs text-neutral-300">{link.title}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0 text-neutral-700" />
          </a>
        ))}
      </div>
      <Link
        to="/resources"
        className="mt-1.5 block text-right text-[11px] text-neutral-600 hover:text-neutral-400"
      >
        すべてのリソース →
      </Link>
    </section>
  )
}

// ─── 4. 最近のブックマーク・メモ ────────────────────────────

function RecentActivitySection() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const lessons = useCourseStore((s) => s.lessons)
  const navigate = useNavigate()
  const setPendingSeekTarget = usePlayerStore((s) => s.setPendingSeekTarget)

  useEffect(() => {
    void Promise.all([
      db.bookmarks.toArray().then((r) => r.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)),
      db.notes.toArray().then((r) => r.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)),
    ]).then(([bms, ns]) => {
      setBookmarks(bms)
      setNotes(ns)
    })
  }, [])

  if (bookmarks.length === 0 && notes.length === 0) return null

  const handleSeek = (lessonId: string, positionSeconds: number) => {
    setPendingSeekTarget(positionSeconds)
    navigate(`/lesson/${lessonId}`)
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <SectionHeading
          icon={<Bookmark className="h-3.5 w-3.5" />}
          label="最近のブックマーク・メモ"
        />
        <Link
          to="/review"
          className="text-[11px] text-neutral-600 hover:text-neutral-400"
        >
          すべて見る →
        </Link>
      </div>

      <div className="mt-2 divide-y divide-neutral-800/40 rounded-xl border border-neutral-800 bg-neutral-900/40">
        {bookmarks.map((bm) => {
          const lesson = lessons.find((l) => l.id === bm.lessonId)
          return (
            <button
              key={bm.id}
              onClick={() => handleSeek(bm.lessonId, bm.positionSeconds)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-800/40"
            >
              <Bookmark className="h-3 w-3 flex-shrink-0 text-neutral-600" />
              <span className="flex-1 truncate text-xs text-neutral-400">
                {bm.label || '（ラベルなし）'}
              </span>
              <span className="flex-shrink-0 font-mono text-[10px] text-accent-600">
                {formatTime(bm.positionSeconds)}
              </span>
              {lesson && (
                <span className="flex-shrink-0 max-w-[100px] truncate text-[10px] text-neutral-600">
                  {lesson.title}
                </span>
              )}
            </button>
          )
        })}
        {notes.map((note) => {
          const lesson = lessons.find((l) => l.id === note.lessonId)
          return (
            <button
              key={note.id}
              onClick={() =>
                note.positionSeconds != null
                  ? handleSeek(note.lessonId, note.positionSeconds)
                  : navigate(`/lesson/${note.lessonId}`)
              }
              className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-800/40"
            >
              <FileText className="mt-0.5 h-3 w-3 flex-shrink-0 text-neutral-600" />
              <p className="flex-1 truncate text-xs text-neutral-400">{note.content}</p>
              {note.positionSeconds != null && (
                <span className="flex-shrink-0 font-mono text-[10px] text-accent-600">
                  {formatTime(note.positionSeconds)}
                </span>
              )}
              {lesson && (
                <span className="flex-shrink-0 max-w-[100px] truncate text-[10px] text-neutral-600">
                  {lesson.title}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ─── 共通コンポーネント ────────────────────────────────────────

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
      {icon}
      {label}
    </div>
  )
}

/** レッスンのコース名・セクション名を小さく表示 */
function LessonMeta({ lessonId }: { lessonId: string }) {
  const { courses, sections, lessons } = useCourseStore()
  const lesson = lessons.find((l) => l.id === lessonId)
  if (!lesson) return null
  const section = sections.find((s) => s.id === lesson.sectionId)
  const course = courses.find((c) => c.id === lesson.courseId)
  const parts = [course?.title, section?.title].filter(Boolean)
  if (parts.length === 0) return null
  return (
    <p className="truncate text-[10px] text-neutral-600">{parts.join(' › ')}</p>
  )
}

/** 秒数を「X時間Y分」形式に変換 */
function formatWatchTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}時間${m > 0 ? `${m}分` : ''}`
  if (m > 0) return `${m}分`
  return `${seconds}秒`
}
