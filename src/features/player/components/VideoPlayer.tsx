import { ChevronLeft, ChevronRight, Film, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store'
import type { VideoSource } from '../../../types'
import { cn } from '../../../utils/cn'
import { LocalPlayer } from './LocalPlayer'
import { NativePlayer } from './NativePlayer'
import { YouTubePlayer } from './YouTubePlayer'
import { VideoSourceCrudDialog } from '../../courses/components/VideoSourceCrudDialog'

interface VideoPlayerProps {
  lessonId: string
  sources: VideoSource[]
  activeIndex: number
  onSelectIndex: (i: number) => void
}

/**
 * 動画ソースの type に応じてプレイヤーをルーティングする。
 * 複数 source がある場合は PlaylistNav を表示してレッスン内プレイリストを提供する。
 */
export function VideoPlayer({ lessonId, sources, activeIndex, onSelectIndex }: VideoPlayerProps) {
  const safeIndex = sources.length > 0 ? Math.min(activeIndex, sources.length - 1) : 0
  const primary = sources[safeIndex]

  // ── Auto-advance バナー ──────────────────────────────────────
  const [showBanner, setShowBanner] = useState(false)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  // 再生が始まったらバナーを消す（NativePlayer 系）
  useEffect(() => {
    if (isPlaying && showBanner) {
      setShowBanner(false)
      if (bannerTimer.current) clearTimeout(bannerTimer.current)
    }
  }, [isPlaying, showBanner])

  // ── 現在の動画が終了したら次の source へ進む ─────────────────
  const handleEnded = useCallback(() => {
    if (safeIndex < sources.length - 1) {
      onSelectIndex(safeIndex + 1)
      // 8秒後に自動消去（YouTube など isPlaying が更新されないケース用）
      setShowBanner(true)
      if (bannerTimer.current) clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setShowBanner(false), 8000)
    }
  }, [safeIndex, sources.length, onSelectIndex])

  if (!primary) {
    return <NoSourceState lessonId={lessonId} />
  }

  return (
    <div className="flex flex-col">
      {/* プレイヤー本体 */}
      {primary.type === 'local' && (
        <LocalPlayer key={primary.id} lessonId={lessonId} source={primary} onEnded={handleEnded} />
      )}
      {primary.type === 'youtube' && (
        <YouTubePlayer key={primary.id} source={primary} onEnded={handleEnded} />
      )}
      {primary.type === 'remote' && (
        <NativePlayer key={primary.id} lessonId={lessonId} source={primary} onEnded={handleEnded} />
      )}

      {/* プレイリストナビ（2件以上の時のみ表示） */}
      {sources.length > 1 && (
        <PlaylistNav
          sources={sources}
          activeIndex={safeIndex}
          onSelectIndex={onSelectIndex}
        />
      )}

      {/* 自動再生失敗バナー */}
      {showBanner && (
        <div className="flex items-center justify-between gap-2 border-t border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-400">
          <span>次の動画に切り替わりました。再生ボタンを押してください。</span>
          <button
            onClick={() => setShowBanner(false)}
            className="shrink-0 text-neutral-600 hover:text-neutral-400"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

// ─── プレイリストナビ ──────────────────────────────────────────

function PlaylistNav({
  sources,
  activeIndex,
  onSelectIndex,
}: {
  sources: VideoSource[]
  activeIndex: number
  onSelectIndex: (i: number) => void
}) {
  const canPrev = activeIndex > 0
  const canNext = activeIndex < sources.length - 1
  const btnBase = 'rounded p-1 transition-colors'

  return (
    <div className="flex items-center gap-2 border-t border-neutral-800 bg-neutral-950 px-3 py-1.5">
      {/* 前へ */}
      <button
        onClick={() => onSelectIndex(activeIndex - 1)}
        disabled={!canPrev}
        title="前の動画"
        className={cn(btnBase, canPrev ? 'text-neutral-400 hover:text-neutral-100' : 'cursor-not-allowed text-neutral-700')}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* カウンター */}
      <span className="min-w-[2.5rem] text-center text-xs tabular-nums text-neutral-500">
        {activeIndex + 1} / {sources.length}
      </span>

      {/* 次へ */}
      <button
        onClick={() => onSelectIndex(activeIndex + 1)}
        disabled={!canNext}
        title="次の動画"
        className={cn(btnBase, canNext ? 'text-neutral-400 hover:text-neutral-100' : 'cursor-not-allowed text-neutral-700')}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* ソース一覧（直接選択） */}
      <div className="ml-1 flex flex-1 gap-1 overflow-x-auto">
        {sources.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelectIndex(i)}
            title={s.displayName ?? s.src}
            className={cn(
              'flex-shrink-0 max-w-[140px] truncate rounded px-1.5 py-0.5 text-[11px] transition-colors',
              i === activeIndex
                ? 'bg-accent-900/40 text-accent-400'
                : 'text-neutral-600 hover:text-neutral-300',
            )}
          >
            {s.displayName ?? s.src.split('/').pop() ?? `動画${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 空状態：動画を追加 ──────────────────────────────────────

function NoSourceState({ lessonId }: { lessonId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div
        className="flex w-full flex-col items-center justify-center gap-3 bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        <Film className="h-12 w-12 text-neutral-800" />
        <p className="text-sm text-neutral-500">動画が登録されていません</p>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
        >
          <Plus className="h-4 w-4" />
          動画を追加
        </button>
        <p className="text-[11px] text-neutral-600">
          ローカル / YouTube / 外部URL を追加できます
        </p>
      </div>

      <VideoSourceCrudDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        lessonId={lessonId}
      />
    </>
  )
}
