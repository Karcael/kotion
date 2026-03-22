"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { SearchCommand } from "@/components/search-command"
import { useSidebar } from "@/stores/use-sidebar"

interface MainLayoutProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  children: React.ReactNode
}

export function MainLayout({ user, children }: MainLayoutProps) {
  const { isOpen, width } = useSidebar()

  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <main
        className="flex-1 overflow-y-auto transition-[margin-left] duration-200"
        style={{ marginLeft: isOpen ? `${width}px` : 0 }}
      >
        <SearchCommand />
        {children}
      </main>
    </div>
  )
}
