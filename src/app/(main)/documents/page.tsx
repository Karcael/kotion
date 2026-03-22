"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useSidebar } from "@/stores/use-sidebar"
import { Logo } from "@/components/logo"

export default function DocumentsPage() {
  const router = useRouter()
  const refreshRef = { current: useSidebar.getState().refresh }

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Adsız" }),
      })

      if (res.ok) {
        const doc = await res.json()
        refreshRef.current()
        router.push(`/documents/${doc.id}`)
      }
    } catch (error) {
      console.error("Failed to create document:", error)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center animate-fade-in">
      <div className="space-y-6 text-center">
        <div className="flex justify-center opacity-40">
          <Logo size={72} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Kotion&apos;a Hoş Geldiniz
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            Notlarınızı, fikirlerinizi ve projelerinizi tek bir yerde organize
            edin.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-md shadow-accent/20 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Yeni Sayfa Oluştur
        </button>
      </div>
    </div>
  )
}
