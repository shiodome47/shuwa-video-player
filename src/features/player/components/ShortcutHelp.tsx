import { Keyboard, X } from 'lucide-react'
import { useState } from 'react'

const SHORTCUTS = [
  { key: 'Space', desc: '再生 / 一時停止' },
  { key: '← / →', desc: '5秒 戻し / 送り' },
  { key: 'J / L', desc: '10秒 戻し / 送り' },
  { key: '[ / ]', desc: '速度 下げる / 上げる' },
  { key: 'A', desc: 'A地点を設定（リピート開始）' },
  { key: 'B', desc: 'B地点を設定（リピート終了）' },
  { key: 'Esc', desc: 'A-B リピートを解除' },
] as const

/**
 * キーボードショートカット一覧を表示するヘルプボタン。
 * PlayerControls の右端に配置する。
 */
export function ShortcutHelp() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="キーボードショートカット"
        className="rounded p-1 text-neutral-600 transition-colors hover:text-neutral-300"
      >
        <Keyboard className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          {/* 背景クリックで閉じる */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-8 right-0 z-50 w-64 rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                ショートカット
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-neutral-600 hover:text-neutral-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <table className="w-full">
              <tbody>
                {SHORTCUTS.map(({ key, desc }) => (
                  <tr key={key}>
                    <td className="py-0.5 pr-3 font-mono text-[11px] text-accent-400 whitespace-nowrap">
                      {key}
                    </td>
                    <td className="py-0.5 text-[11px] text-neutral-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[10px] text-neutral-700">
              入力欄にフォーカス中は無効
            </p>
          </div>
        </>
      )}
    </div>
  )
}
