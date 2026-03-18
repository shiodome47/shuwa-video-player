import { useEffect, useState } from 'react'
import { cn } from '../../../utils/cn'
import { BookmarkPanel } from './BookmarkPanel'
import { LessonDetailPanel } from './LessonDetailPanel'
import { NotePanel } from './NotePanel'

export type Tab = 'bookmarks' | 'notes' | 'detail'

const TABS: { id: Tab; label: string }[] = [
  { id: 'bookmarks', label: 'ブックマーク' },
  { id: 'notes', label: 'メモ' },
  { id: 'detail', label: '詳細' },
]

interface LessonTabsProps {
  lessonId: string
  /** 外部からアクティブタブを指定（ドロワー用）。undefined なら内部管理。 */
  activeTab?: Tab
  /** コンパクト表示（ドロワー用：タブバー非表示）。 */
  compact?: boolean
}

/**
 * 動画下のタブパネル。
 * ブックマーク・メモ・詳細（レッスン情報 + 進捗 + 動画ソース）を切り替える。
 *
 * compact=true の場合:
 * - タブバーを非表示にする（外部から activeTab で制御される前提）
 * - ドロワー内での使用を想定
 */
export function LessonTabs({ lessonId, activeTab, compact = false }: LessonTabsProps) {
  const [internalActive, setInternalActive] = useState<Tab>('bookmarks')
  const active = activeTab ?? internalActive

  // 外部から activeTab が変わったら追従
  useEffect(() => {
    if (activeTab) setInternalActive(activeTab)
  }, [activeTab])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* タブバー（compact 時は非表示） */}
      {!compact && (
        <div className="flex flex-shrink-0 border-b border-neutral-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInternalActive(tab.id)}
              className={cn(
                'flex-1 py-2.5 text-xs font-medium transition-colors',
                active === tab.id
                  ? 'border-b-2 border-accent-500 text-accent-300'
                  : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* タブ内容（スクロール可） */}
      <div className="flex-1 overflow-y-auto">
        {active === 'bookmarks' && <BookmarkPanel lessonId={lessonId} />}
        {active === 'notes' && <NotePanel lessonId={lessonId} />}
        {active === 'detail' && <LessonDetailPanel lessonId={lessonId} />}
      </div>
    </div>
  )
}
