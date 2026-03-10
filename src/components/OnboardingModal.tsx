import { BookmarkPlus, FolderOpen, HardDrive, RotateCcw, Shield } from 'lucide-react'
import { useState } from 'react'
import { Dialog } from './ui/Dialog'

export const ONBOARDING_KEY = 'shuwa-onboarding-done'

export function hasSeenOnboarding(): boolean {
  return !!localStorage.getItem(ONBOARDING_KEY)
}

export function clearOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY)
}

const STEPS = [
  {
    icon: FolderOpen,
    title: 'コースとレッスンを作成',
    desc: 'サイドバーの「＋」からコース → セクション → レッスンを作成します。',
  },
  {
    icon: HardDrive,
    title: '動画を追加',
    desc: 'レッスンを開き「動画を追加」から ローカル・YouTube・外部URL を登録できます。',
  },
  {
    icon: BookmarkPlus,
    title: 'ブックマーク・メモで記録',
    desc: 'プレイヤー下のタブから、時刻付きブックマークやメモを残せます。',
  },
  {
    icon: RotateCcw,
    title: '振り返り画面で復習',
    desc: 'ナビの「振り返り」から全レッスンのブックマーク・メモを一覧できます。',
  },
  {
    icon: Shield,
    title: 'バックアップを忘れずに',
    desc: '学習データはこのブラウザ内に保存されます。設定 → JSONエクスポートで定期バックアップ推奨。',
  },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(() => !hasSeenOnboarding())

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setOpen(false)
  }

  return (
    <Dialog isOpen={open} onClose={handleClose} title="はじめかた" size="sm">
      <div className="space-y-3">
        {STEPS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
            <div>
              <p className="text-xs font-medium text-neutral-200">{title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleClose}
          className="rounded-lg bg-accent-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
        >
          はじめる
        </button>
      </div>
    </Dialog>
  )
}
