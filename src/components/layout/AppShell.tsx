import { Outlet, useLocation } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useScrollLock } from '../../hooks/useScrollLock'
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
 * シアターモード:
 *   TopBar / Sidebar を非表示にし、メインコンテンツが全画面を占有する。
 *   背景スクロールも無効化する。
 */
export function AppShell() {
  const isMobile = useIsMobile()
  const { isSidebarOpen, closeSidebar, layoutMode } = useUIStore()
  const location = useLocation()
  const isTheater = layoutMode === 'theater'

  // シアターモード中は背景スクロールを無効化
  useScrollLock(isTheater)

  // ホーム・学習のみサイドバーを表示する（シアター中は非表示）
  const showSidebar =
    !isTheater && (location.pathname === '/' || location.pathname.startsWith('/lesson'))

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden bg-neutral-950',
        isTheater ? 'theater-container' : 'h-screen',
      )}
    >
      {/* シアターモード中は TopBar を非表示 */}
      {!isTheater && <TopBar />}

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
        <main className={cn('flex-1', !isTheater && 'overflow-y-auto')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
