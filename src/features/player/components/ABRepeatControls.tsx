import { X } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface ABRepeatControlsProps {
  abA: number | null
  abB: number | null
  /** A ボタンのトグル（未設定→設定、設定済み→解除） */
  onToggleA: () => void
  /** B ボタンのトグル（未設定→設定、設定済み→解除） */
  onToggleB: () => void
  /** A 地点を delta 秒移動する */
  onAdjustA: (delta: number) => void
  /** B 地点を delta 秒移動する */
  onAdjustB: (delta: number) => void
  /** A/B を全解除する */
  onClear: () => void
  isTheater?: boolean
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const STEP = 0.5

/**
 * A-B リピートの操作 UI。
 *
 * 2つのモード:
 *   初期状態（A/B 未設定）: [A] [B] + ヒントテキスト — コンパクト
 *   編集モード（A or B 設定済み）: [A: 0:03] → [B: 0:04] [A-][A+] [B-][B+] [×] — 拡張
 *
 * 編集モードでは行の高さを増やし、タップしやすいボタンサイズにする。
 * 未設定側の微調整ボタンは非表示（スマホ横幅の節約）。
 * A/B すべて解除で初期状態に戻る。
 */
export function ABRepeatControls({
  abA,
  abB,
  onToggleA,
  onToggleB,
  onAdjustA,
  onAdjustB,
  onClear,
  isTheater = false,
}: ABRepeatControlsProps) {
  const isActive = abA !== null && abB !== null
  const editing = abA !== null || abB !== null

  // ── 色定義 ──────────────────────────────────────────────────
  const unsetColor = isTheater
    ? 'text-white/70 hover:bg-white/10 hover:text-white'
    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'

  // 編集モード時の微調整ボタン — タップしやすいサイズ
  const adjustBtn = cn(
    'rounded px-2 py-1 text-[11px] font-medium transition-colors',
    isTheater
      ? 'text-white/60 hover:bg-white/10 hover:text-white active:bg-white/20'
      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 active:bg-neutral-700',
  )

  // A/B トグルボタンの共通サイズ（編集モード時は大きめ）
  const toggleBtnSize = editing
    ? 'rounded px-2.5 py-1 text-xs font-medium transition-colors'
    : 'rounded px-2 py-0.5 text-[11px] font-medium transition-colors'

  return (
    <div className={cn(
      'flex items-center gap-1.5 border-t px-3 transition-[padding]',
      editing ? 'py-2' : 'py-1',
      isTheater ? 'border-white/10' : 'border-neutral-900',
    )}>
      {/* A ボタン（トグル） */}
      <button
        onClick={onToggleA}
        title={abA !== null ? 'A地点を解除（ショートカット: a）' : 'A地点を設定（ショートカット: a）'}
        className={cn(
          toggleBtnSize,
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

      {/* B ボタン（トグル） */}
      <button
        onClick={onToggleB}
        disabled={abA === null && abB === null}
        title={
          abB !== null
            ? 'B地点を解除（ショートカット: b）'
            : abA === null
              ? 'A地点を先に設定してください'
              : 'B地点を設定（ショートカット: b）'
        }
        className={cn(
          toggleBtnSize,
          abA === null && abB === null && 'cursor-not-allowed',
          abA === null && abB === null && (isTheater ? 'opacity-50' : 'opacity-30'),
          abB !== null
            ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
            : abA !== null
              ? (isTheater ? 'text-white/80' : 'text-neutral-300')
              : unsetColor,
        )}
      >
        B{abB !== null ? `: ${fmt(abB)}` : ''}
      </button>

      {/* ── 編集モード: 微調整ボタン群 ── */}
      {editing && (
        <>
          {/* A 微調整（A 設定時のみ表示） */}
          {abA !== null && (
            <div className="ml-1 flex items-center gap-0.5">
              <button onClick={() => onAdjustA(-STEP)} title="A を 0.5秒前に" className={adjustBtn}>
                A-
              </button>
              <button onClick={() => onAdjustA(STEP)} title="A を 0.5秒後に" className={adjustBtn}>
                A+
              </button>
            </div>
          )}

          {/* B 微調整（B 設定時のみ表示） */}
          {abB !== null && (
            <div className="flex items-center gap-0.5">
              <button onClick={() => onAdjustB(-STEP)} title="B を 0.5秒前に" className={adjustBtn}>
                B-
              </button>
              <button onClick={() => onAdjustB(STEP)} title="B を 0.5秒後に" className={adjustBtn}>
                B+
              </button>
            </div>
          )}

          {/* × 全解除（間隔を空けて誤タップ防止） */}
          <button
            onClick={onClear}
            title="A-Bリピートを解除（ショートカット: Esc）"
            className={cn(
              'ml-4 rounded p-1 transition-colors',
              isTheater
                ? 'text-white/40 hover:text-white'
                : 'text-neutral-500 hover:text-neutral-200',
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {/* 初期状態のヒント */}
      {!editing && (
        <span className={cn('ml-auto text-[10px]', isTheater ? 'text-white/60' : 'text-neutral-500')}>
          A → B でリピート区間を設定
        </span>
      )}
    </div>
  )
}
