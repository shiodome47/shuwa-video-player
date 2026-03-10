import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface UIState {
  /** モバイル時のサイドバー開閉状態。デスクトップでは常時表示のため無視される。 */
  isSidebarOpen: boolean
  /** アプリのテーマ設定。localStorage に保存される。 */
  theme: Theme

  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      theme: 'system',

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'shuwa-ui-prefs',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
