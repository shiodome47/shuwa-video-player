import { Menu, Settings, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useUIStore } from '../../stores/ui'
import { cn } from '../../utils/cn'

/**
 * アプリ上部の固定ナビゲーションバー。
 * - ロゴ
 * - タブナビ（学習 / リソース / 振り返り）
 * - 右端: 設定アイコン
 * - モバイル: ハンバーガーメニューボタン
 */
export function TopBar() {
  const isMobile = useIsMobile()
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()

  // 「ホーム」タブは / および /lesson/* でアクティブ（学習の起点）
  const isLearningActive =
    location.pathname === '/' || location.pathname.startsWith('/lesson')

  const tabBase =
    'px-3.5 py-1.5 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500'
  const tabActive = 'bg-neutral-800 text-neutral-100'
  const tabInactive = 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 z-20">
      {/* モバイル: ハンバーガーボタン */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
          aria-label={isSidebarOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* ロゴ */}
      <div className="flex items-center gap-2 select-none">
        <span className="text-xl leading-none" aria-hidden="true">🤟</span>
        <span className="text-sm font-semibold text-neutral-200 hidden sm:block tracking-wide">
          手話学習
        </span>
      </div>

      {/* タブナビゲーション */}
      <nav className="ml-2 flex items-center gap-1" aria-label="メインナビゲーション">
        {/* ホームタブ: / と /lesson/* でアクティブ（学習の起点） */}
        <NavLink
          to="/"
          className={cn(tabBase, isLearningActive ? tabActive : tabInactive)}
          aria-current={isLearningActive ? 'page' : undefined}
        >
          ホーム
        </NavLink>

        <NavLink
          to="/resources"
          className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
        >
          リソース
        </NavLink>

        <NavLink
          to="/review"
          className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
        >
          振り返り
        </NavLink>
      </nav>

      {/* 設定アイコン（右端） */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'ml-auto rounded-lg p-1.5 transition-colors',
            isActive
              ? 'text-accent-300'
              : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300',
          )
        }
        title="設定"
        aria-label="設定"
      >
        <Settings className="h-4 w-4" />
      </NavLink>
    </header>
  )
}
