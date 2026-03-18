import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type LayoutMode = 'normal' | 'theater'

interface UIState {
  /** モバイル時のサイドバー開閉状態。デスクトップでは常時表示のため無視される。 */
  isSidebarOpen: boolean
  /** アプリのテーマ設定。localStorage に保存される。 */
  theme: Theme
  /** レイアウトモード。theater 時は動画を全画面風に表示する。 */
  layoutMode: LayoutMode

  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  setTheme: (theme: Theme) => void
  enterTheater: () => void
  exitTheater: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      theme: 'system',
      layoutMode: 'normal',

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      setTheme: (theme) => set({ theme }),
      enterTheater: () => set({ layoutMode: 'theater' }),
      exitTheater: () => set({ layoutMode: 'normal' }),
    }),
    {
      name: 'shuwa-ui-prefs',
      // layoutMode は永続化しない（毎回 normal で開始）
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
