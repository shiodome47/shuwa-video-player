import { useCallback, useRef } from 'react'
import { cn } from '../../../utils/cn'
import type { VideoControls } from '../types'

interface SeekBarProps {
  currentTime: number
  duration: number
  controls: VideoControls
  isBuffering?: boolean
  /** A-B リピートの A 地点（秒）。null = 未設定 */
  abA?: number | null
  /** A-B リピートの B 地点（秒）。null = 未設定 */
  abB?: number | null
}

/**
 * クリック可能なシークバー。
 * A-B マーカーと区間ハイライトをオーバーレイ表示する。
 */
export function SeekBar({
  currentTime,
  duration,
  controls,
  isBuffering,
  abA,
  abB,
}: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current || duration <= 0) return
      const rect = trackRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      controls.seekTo(ratio * duration)
    },
    [controls, duration],
  )

  const toPercent = (s: number) => `${Math.min(100, (s / duration) * 100)}%`

  return (
    <div
      ref={trackRef}
      className="group relative h-1 w-full cursor-pointer transition-[height] duration-100 hover:h-2"
      style={{ backgroundColor: 'rgb(64 64 64)' }}
      onClick={handleClick}
    >
      {/* A-B 区間ハイライト */}
      {abA != null && abB != null && duration > 0 && (
        <div
          className="absolute top-0 h-full bg-accent-500/20"
          style={{
            left: toPercent(abA),
            width: `${Math.min(100, ((abB - abA) / duration) * 100)}%`,
          }}
        />
      )}

      {/* 再生進捗 */}
      <div
        className={cn('h-full', isBuffering ? 'bg-neutral-500' : 'bg-accent-500')}
        style={{ width: `${pct}%` }}
      />

      {/* A マーカー */}
      {abA != null && duration > 0 && (
        <div
          className="absolute top-0 h-full w-px bg-green-400"
          style={{ left: toPercent(abA) }}
        />
      )}

      {/* B マーカー */}
      {abB != null && duration > 0 && (
        <div
          className="absolute top-0 h-full w-px bg-red-400"
          style={{ left: toPercent(abB) }}
        />
      )}

      {/* サム（ホバー時に表示）*/}
      <div
        className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
        style={{ left: `${pct}%` }}
      />
    </div>
  )
}
