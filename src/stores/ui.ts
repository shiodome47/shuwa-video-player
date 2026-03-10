import { create } from 'zustand'

interface UIState {
  /** モバイル時のサイドバー開閉状態。デスクトップでは常時表示のため無視される。 */
  isSidebarOpen: boolean

  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
}))
