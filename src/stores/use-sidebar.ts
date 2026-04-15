import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarStore {
  isOpen: boolean
  isResizing: boolean
  width: number
  refreshKey: number
  titleOverrides: Record<string, string>
  open: () => void
  close: () => void
  toggle: () => void
  setIsResizing: (isResizing: boolean) => void
  setWidth: (width: number) => void
  refresh: () => void
  setTitleOverride: (id: string, title: string) => void
  clearTitleOverride: (id: string) => void
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      isResizing: false,
      width: 240,
      refreshKey: 0,
      titleOverrides: {},
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsResizing: (isResizing) => set({ isResizing }),
      setWidth: (width) => set({ width }),
      refresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
      setTitleOverride: (id, title) =>
        set((state) => ({
          titleOverrides: { ...state.titleOverrides, [id]: title },
        })),
      clearTitleOverride: (id) =>
        set((state) => {
          const next = { ...state.titleOverrides }
          delete next[id]
          return { titleOverrides: next }
        }),
    }),
    {
      name: "kotion-sidebar",
      partialize: (state) => ({ width: state.width }),
    },
  ),
)
