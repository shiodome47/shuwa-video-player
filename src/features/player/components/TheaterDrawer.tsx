import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '../../../utils/cn'
import { LessonTabs } from '../../learning/components/LessonTabs'
import type { Tab } from '../../learning/components/LessonTabs'

const TAB_LABELS: Record<Tab, string> = {
  bookmarks: 'ブックマーク',
  notes: 'メモ',
  detail: '詳細',
}

interface TheaterDrawerProps {
  /** 現在のタブ（null = 閉じている） */
  activeTab: Tab | null
  /** 閉じるコールバック */
  onClose: () => void
  /** レッスン ID */
  lessonId: string
}

/**
 * シアターモードの右ドロワー。
 *
 * - 動画サイズを変えず、上にオーバーレイで重ねる
 * - スライドインアニメーション
 * - 中身は LessonTabs（compact モード）を再利用
 * - Escape / 外側クリックで閉じる（TheaterLayout が管理）
 */
export function TheaterDrawer({ activeTab, onClose, lessonId }: TheaterDrawerProps) {
  const isOpen = activeTab !== null
  const drawerRef = useRef<HTMLDivElement>(null)

  // 外側クリックでドロワーを閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // mousedown で閉じる（クリック完了を待つと動画への操作と競合する可能性がある）
    // setTimeout で現在のイベントループを避ける（開くクリックで即閉じ防止）
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen, onClose])

  return (
    <div
      ref={drawerRef}
      className={cn(
        'absolute top-0 right-0 bottom-0 z-30 w-80 max-w-[85vw]',
        'flex flex-col bg-neutral-900/95 backdrop-blur-sm',
        'border-l border-neutral-800',
        'transition-transform duration-300 ease-in-out',
        'pr-[var(--safe-right)]',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* ヘッダー */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-2.5">
        <span className="text-xs font-semibold text-neutral-300">
          {activeTab ? TAB_LABELS[activeTab] : ''}
        </span>
        <button
          onClick={onClose}
          className="rounded p-1 text-neutral-500 transition-colors hover:text-neutral-200"
          title="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* タブコンテンツ（LessonTabs を compact で再利用） */}
      <div className="flex-1 overflow-hidden">
        {activeTab && (
          <LessonTabs
            lessonId={lessonId}
            activeTab={activeTab}
            compact
          />
        )}
      </div>
    </div>
  )
}
