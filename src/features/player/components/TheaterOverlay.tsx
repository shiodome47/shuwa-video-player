import { ArrowLeft, Bookmark, FileText, Info } from 'lucide-react'
import { cn } from '../../../utils/cn'

export type DrawerTab = 'bookmarks' | 'notes' | 'detail'

interface TheaterOverlayProps {
  /** 表示 / 非表示（auto-hide 制御） */
  visible: boolean
  /** レッスンのタイトル（上部バーに表示） */
  lessonTitle: string
  /** シアターモードを抜ける */
  onExit: () => void
  /** ActionRail のボタンクリック時 */
  onOpenDrawer: (tab: DrawerTab) => void
  /** 現在開いているドロワータブ（ハイライト用） */
  activeDrawerTab: DrawerTab | null
}

/**
 * シアターモードのオーバーレイ UI。
 *
 * - 上部: 戻るボタン + レッスン名
 * - 右端: ActionRail（ブックマーク / メモ / 詳細）
 *
 * auto-hide の visible に応じてフェードイン / アウトする。
 * pointer-events は非表示時に none にして動画操作を邪魔しない。
 */
export function TheaterOverlay({
  visible,
  lessonTitle,
  onExit,
  onOpenDrawer,
  activeDrawerTab,
}: TheaterOverlayProps) {
  return (
    <>
      {/* ── 上部バー ─────────────────────────────────────────── */}
      <div
        className={cn(
          'absolute top-0 right-0 left-0 z-20 bg-gradient-to-b from-black/70 to-transparent',
          'flex items-center gap-3 px-4 pt-[max(0.75rem,var(--safe-top))] pb-8',
          'transition-opacity duration-300',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <button
          onClick={onExit}
          className="rounded-full p-1.5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
          title="シアターモードを終了"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="truncate text-sm font-medium text-neutral-200">
          {lessonTitle}
        </span>
      </div>

      {/* ── 右側 ActionRail ──────────────────────────────────── */}
      <div
        className={cn(
          'absolute top-1/2 right-0 z-20 -translate-y-1/2',
          'flex flex-col gap-1 pr-[max(0.5rem,var(--safe-right))]',
          'transition-opacity duration-300',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ActionRailButton
          icon={<Bookmark className="h-4 w-4" />}
          label="ブックマーク"
          active={activeDrawerTab === 'bookmarks'}
          onClick={() => onOpenDrawer('bookmarks')}
        />
        <ActionRailButton
          icon={<FileText className="h-4 w-4" />}
          label="メモ"
          active={activeDrawerTab === 'notes'}
          onClick={() => onOpenDrawer('notes')}
        />
        <ActionRailButton
          icon={<Info className="h-4 w-4" />}
          label="詳細"
          active={activeDrawerTab === 'detail'}
          onClick={() => onOpenDrawer('detail')}
        />
      </div>
    </>
  )
}

// ─── ActionRail ボタン ─────────────────────────────────────────

function ActionRailButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'rounded-lg p-2 transition-colors',
        active
          ? 'bg-accent-600/80 text-white'
          : 'text-neutral-400 hover:bg-white/10 hover:text-white',
      )}
    >
      {icon}
    </button>
  )
}
