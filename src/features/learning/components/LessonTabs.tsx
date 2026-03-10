import { useState } from 'react'
import { cn } from '../../../utils/cn'
import { BookmarkPanel } from './BookmarkPanel'
import { LessonDetailPanel } from './LessonDetailPanel'
import { NotePanel } from './NotePanel'

type Tab = 'bookmarks' | 'notes' | 'detail'

const TABS: { id: Tab; label: string }[] = [
  { id: 'bookmarks', label: 'ブックマーク' },
  { id: 'notes', label: 'メモ' },
  { id: 'detail', label: '詳細' },
]

/**
 * 動画下のタブパネル。
 * ブックマーク・メモ・詳細（レッスン情報 + 進捗 + 動画ソース）を切り替える。
 */
export function LessonTabs({ lessonId }: { lessonId: string }) {
  const [active, setActive] = useState<Tab>('bookmarks')

  return (
    <div className="flex flex-col overflow-hidden">
      {/* タブバー */}
      <div className="flex flex-shrink-0 border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
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

      {/* タブ内容（スクロール可） */}
      <div className="flex-1 overflow-y-auto">
        {active === 'bookmarks' && <BookmarkPanel lessonId={lessonId} />}
        {active === 'notes' && <NotePanel lessonId={lessonId} />}
        {active === 'detail' && <LessonDetailPanel lessonId={lessonId} />}
      </div>
    </div>
  )
}
