import { ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export const LESSON_HINT_KEY = 'shuwa-lesson-hint-done'

// キーの値:
//   null      → 初回（展開表示）
//   'seen'    → 一度見た（折りたたみ表示）
//   'dismissed' → 閉じた（非表示）

export function clearLessonHint(): void {
  localStorage.removeItem(LESSON_HINT_KEY)
}

const HINTS = [
  '動画追加: プレイヤーの「動画を追加」から ローカル・YouTube・外部URL を登録',
  'A-B リピート: コントロールバーの [A][B] ボタンで区間繰り返し',
  'ブックマーク: 下タブの「ブックマーク」から時刻付きでマーク',
  'メモ: 下タブの「メモ」に自由記述を保存',
  '振り返り: ナビの「振り返り」で全レッスンのメモ・ブックマークを確認',
]

export function LessonHintBar() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem(LESSON_HINT_KEY) !== 'dismissed',
  )
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem(LESSON_HINT_KEY) === null,
  )

  // 初回表示時に 'seen' としてマーク（次回以降は折りたたみ）
  useEffect(() => {
    if (localStorage.getItem(LESSON_HINT_KEY) === null) {
      localStorage.setItem(LESSON_HINT_KEY, 'seen')
    }
  }, [])

  if (!visible) return null

  return (
    <div className="border-b border-neutral-800 bg-neutral-950 text-xs">
      <div className="flex items-center">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-1.5 px-3 py-1.5 text-neutral-600 hover:text-neutral-400"
        >
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">使い方ヒント</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => {
            localStorage.setItem(LESSON_HINT_KEY, 'dismissed')
            setVisible(false)
          }}
          aria-label="ヒントを閉じる"
          className="px-2 py-1.5 text-neutral-700 hover:text-neutral-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <ul className="space-y-1 border-t border-neutral-800/60 px-4 pb-2.5 pt-2 text-neutral-500">
          {HINTS.map((h) => (
            <li key={h} className="leading-relaxed">
              · {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
