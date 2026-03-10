import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { cn } from '../../../utils/cn'
import type { VideoControls } from '../types'
import { ShortcutHelp } from './ShortcutHelp'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

interface PlayerControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  isBuffering: boolean
  volume: number
  isMuted: boolean
  playbackRate: number
  controls: VideoControls
  onVolumeChange: (v: number) => void
  onMuteToggle: () => void
  onSpeedChange: (v: number) => void
}

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/**
 * 動画コントロールバー。
 * [◀5s] [▶/⏸] [10s▶]  時刻      速度  🔊────
 */
export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  isBuffering,
  volume,
  isMuted,
  playbackRate,
  controls,
  onVolumeChange,
  onMuteToggle,
  onSpeedChange,
}: PlayerControlsProps) {
  const btnBase = 'rounded p-1 text-neutral-400 transition-colors hover:text-neutral-100'

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {/* 5秒戻す */}
      <button onClick={() => controls.skip(-5)} title="5秒戻す" className={btnBase}>
        <SkipBack className="h-4 w-4" />
      </button>

      {/* 再生 / 一時停止 */}
      <button
        onClick={() => controls.togglePlayPause()}
        title={isPlaying ? '一時停止' : '再生'}
        disabled={isBuffering}
        className={cn(
          'rounded-full p-1.5 transition-colors',
          isBuffering
            ? 'cursor-wait text-neutral-600'
            : 'text-neutral-100 hover:bg-neutral-700',
        )}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 fill-current" />
        )}
      </button>

      {/* 10秒進む */}
      <button onClick={() => controls.skip(10)} title="10秒進む" className={btnBase}>
        <SkipForward className="h-4 w-4" />
      </button>

      {/* 時刻表示 */}
      <span className="tabular-nums text-xs text-neutral-500">
        {formatTime(currentTime)}
        <span className="mx-1 text-neutral-700">/</span>
        {formatTime(duration)}
      </span>

      {/* スペーサー */}
      <div className="flex-1" />

      {/* 再生速度 */}
      <select
        value={playbackRate}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        title="再生速度"
        className="cursor-pointer appearance-none border-none bg-transparent py-0.5 text-xs text-neutral-400 outline-none hover:text-neutral-200"
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s} className="bg-neutral-900 text-neutral-200">
            ×{s}
          </option>
        ))}
      </select>

      {/* ミュートトグル */}
      <button onClick={onMuteToggle} title={isMuted ? 'ミュート解除' : 'ミュート'} className={btnBase}>
        {isMuted || volume === 0 ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* 音量スライダー */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={isMuted ? 0 : volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-16 accent-teal-500"
        title="音量"
      />

      {/* ショートカットヘルプ */}
      <ShortcutHelp />
    </div>
  )
}
