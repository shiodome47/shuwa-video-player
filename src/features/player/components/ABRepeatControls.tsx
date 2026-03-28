import { X } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface ABRepeatControlsProps {
  abA: number | null
  abB: number | null
  onSetA: () => void
  onSetB: () => void
  onClear: () => void
  isTheater?: boolean
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/**
 * A-B リピートの操作 UI。
 * SeekBar の直下、PlayerControls の上に配置する。
 *
 * 状態ごとの表示:
 * - 未設定     : [A] [B] — B は無効
 * - A のみ設定 : [A: 0:30] [B] — B が有効になる
 * - 両方設定   : [A: 0:30] [B: 1:45] [✕] + ループ中バッジ
 *
 * シアターモード（黒グラデーション上）では全要素を白系に引き上げる。
 */
export function ABRepeatControls({
  abA,
  abB,
  onSetA,
  onSetB,
  onClear,
  isTheater = false,
}: ABRepeatControlsProps) {
  const isActive = abA !== null && abB !== null
  const btnBase =
    'rounded px-2 py-0.5 text-[11px] font-medium transition-colors'

  // 未設定時のボタン色
  const unsetColor = isTheater
    ? 'text-white/70 hover:bg-white/10 hover:text-white'
    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'

  return (
    <div className={cn(
      'flex items-center gap-1.5 border-t px-3 py-1',
      isTheater ? 'border-white/10' : 'border-neutral-900',
    )}>
      {/* A ボタン */}
      <button
        onClick={onSetA}
        title="A地点を設定（ショートカット: a）"
        className={cn(
          btnBase,
          abA !== null
            ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
            : unsetColor,
        )}
      >
        A{abA !== null ? `: ${fmt(abA)}` : ''}
      </button>

      {/* 区間矢印（両方設定時） */}
      {isActive && (
        <span className={cn('text-[10px]', isTheater ? 'text-white/50' : 'text-neutral-400')}>→</span>
      )}

      {/* B ボタン */}
      <button
        onClick={onSetB}
        disabled={abA === null}
        title={
          abA === null
            ? 'A地点を先に設定してください'
            : 'B地点を設定（ショートカット: b）'
        }
        className={cn(
          btnBase,
          abA === null && (isTheater ? 'cursor-not-allowed opacity-50' : 'cursor-not-allowed opacity-30'),
          abB !== null
            ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
            : unsetColor,
          abA !== null && abB === null && (isTheater ? 'text-white/80' : 'text-neutral-300'),
        )}
      >
        B{abB !== null ? `: ${fmt(abB)}` : ''}
      </button>

      {/* ループ中バッジ */}
      {isActive && (
        <span className="rounded bg-accent-900/40 px-1.5 py-0.5 text-[10px] font-medium text-accent-400">
          ↻ ループ中
        </span>
      )}

      {/* 解除ボタン */}
      {(abA !== null || abB !== null) && (
        <button
          onClick={onClear}
          title="A-Bリピートを解除（ショートカット: Esc）"
          className={cn(
            'ml-1 rounded p-0.5 transition-colors',
            isTheater
              ? 'text-white/60 hover:text-white'
              : 'text-neutral-400 hover:text-neutral-200',
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* 未設定時のヒント */}
      {abA === null && abB === null && (
        <span className={cn('ml-auto text-[10px]', isTheater ? 'text-white/60' : 'text-neutral-500')}>
          A → B でリピート区間を設定
        </span>
      )}
    </div>
  )
}
