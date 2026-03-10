import { X } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface ABRepeatControlsProps {
  abA: number | null
  abB: number | null
  onSetA: () => void
  onSetB: () => void
  onClear: () => void
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
 */
export function ABRepeatControls({
  abA,
  abB,
  onSetA,
  onSetB,
  onClear,
}: ABRepeatControlsProps) {
  const isActive = abA !== null && abB !== null
  const btnBase =
    'rounded px-2 py-0.5 text-[11px] font-medium transition-colors'

  return (
    <div className="flex items-center gap-1.5 border-t border-neutral-900 px-3 py-1">
      {/* A ボタン */}
      <button
        onClick={onSetA}
        title="A地点を設定（ショートカット: a）"
        className={cn(
          btnBase,
          abA !== null
            ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
            : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300',
        )}
      >
        A{abA !== null ? `: ${fmt(abA)}` : ''}
      </button>

      {/* 区間矢印（両方設定時） */}
      {isActive && (
        <span className="text-[10px] text-neutral-600">→</span>
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
          abA === null && 'cursor-not-allowed opacity-30',
          abB !== null
            ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
            : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300',
          abA !== null && abB === null && 'text-neutral-400',
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
          className="ml-1 rounded p-0.5 text-neutral-600 transition-colors hover:text-neutral-300"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* 未設定時のヒント */}
      {abA === null && abB === null && (
        <span className="ml-auto text-[10px] text-neutral-700">
          A → B でリピート区間を設定
        </span>
      )}
    </div>
  )
}
