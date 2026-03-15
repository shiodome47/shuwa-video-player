import { Outlet, useLocation } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useUIStore } from '../../stores/ui'
import { cn } from '../../utils/cn'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/**
 * アプリ全体のレイアウト骨格。
 *
 * デスクトップ（md 以上）:
 *   TopBar（固定高さ）+ [Sidebar（固定幅）| メインコンテンツ（残余幅）]
 *
 * モバイル（md 未満）:
 *   TopBar + メインコンテンツ（全幅）
 *   サイドバーはドロワーとして TopBar の下から出現する
 *
 * Sidebar の位置・アニメーション・オーバーレイをここで制御する。
 * Sidebar コンポーネント自身はコンテンツ責務のみを持つ。
 */
export function AppShell() {
  const isMobile = useIsMobile()
  const { isSidebarOpen, closeSidebar } = useUIStore()
  const location = useLocation()

  // ホーム・学習のみサイドバーを表示する
  const showSidebar =
    location.pathname === '/' || location.pathname.startsWith('/lesson')

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-950">
      <TopBar />

      <div className="relative flex flex-1 overflow-hidden">
        {/* モバイル: サイドバー展開時のオーバーレイ */}
        {isMobile && showSidebar && isSidebarOpen && (
          <div
            className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* サイドバー */}
        {showSidebar && (
          <aside
            className={cn(
              'flex-shrink-0 border-r border-neutral-800 bg-neutral-900',
              // デスクトップ: 固定幅・常時表示
              'md:relative md:w-sidebar',
              // モバイル: ドロワー（TopBar の下から出る）
              isMobile && 'fixed top-14 bottom-0 left-0 z-40 w-sidebar',
              isMobile && 'transition-transform duration-300 ease-in-out',
              isMobile && (isSidebarOpen ? 'translate-x-0' : '-translate-x-full'),
            )}
            aria-label="コース一覧"
          >
            <Sidebar />
          </aside>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
