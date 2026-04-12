import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarStore {
  isOpen: boolean
  isResizing: boolean
  width: number
  refreshKey: number
  open: () => void
  close: () => void
  toggle: () => void
  setIsResizing: (isResizing: boolean) => void
  setWidth: (width: number) => void
  refresh: () => void
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      isResizing: false,
      width: 240,
      refreshKey: 0,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsResizing: (isResizing) => set({ isResizing }),
      setWidth: (width) => set({ width }),
      refresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
    }),
    {
      name: "kotion-sidebar",
      partialize: (state) => ({ width: state.width }),
    },
  ),
)
