"use client"

import { useEffect, useState } from "react"
import { X, UserPlus, Trash2, Crown, Pencil, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ShareDialogProps {
  documentId: string
  onClose: () => void
}

interface CollaboratorInfo {
  id: string
  userId: string
  name: string
  email: string
  role: "EDITOR" | "VIEWER"
}

interface PendingInvitation {
  id: string
  email: string
  role: "EDITOR" | "VIEWER"
  status: string
}

export function ShareDialog({ documentId, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR")
  const [sending, setSending] = useState(false)
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([])
  const [pending, setPending] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCollaborators = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/collaborators`)
      if (res.ok) {
        const data = await res.json()
        setCollaborators(data.collaborators)
        setPending(data.pendingInvitations)
      }
    } catch (error) {
      console.error("Failed to fetch collaborators:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollaborators()
  }, [documentId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSending(true)
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, email: email.trim(), role }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Davet gönderilemedi")
        return
      }

      toast.success(`${email} adresine davet gönderildi`)
      setEmail("")
      fetchCollaborators()
    } catch {
      toast.error("Davet gönderilirken hata oluştu")
    } finally {
      setSending(false)
    }
  }

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`${name} kişisini kaldırmak istediğinize emin misiniz?`)) return

    try {
      const res = await fetch(
        `/api/documents/${documentId}/collaborators?userId=${userId}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        toast.success(`${name} kaldırıldı`)
        fetchCollaborators()
      }
    } catch {
      toast.error("Kaldırma başarısız")
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh]">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="animate-scale-in relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-popover shadow-2xl">
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <h3 className="text-sm font-semibold">Sayfayı Paylaş</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Davet formu */}
        <form onSubmit={handleInvite} className="border-b border-border/60 p-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresi"
              required
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
              className="rounded-xl border border-input bg-background px-2 py-2 text-xs outline-none"
            >
              <option value="EDITOR">Düzenleyici</option>
              <option value="VIEWER">İzleyici</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Davet Gönder
              </>
            )}
          </button>
        </form>

        {/* İşbirlikçiler ve bekleyen davetler */}
        <div className="max-h-64 overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-foreground/5"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Aktif işbirlikçiler */}
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-foreground/[0.03]"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent"
                  >
                    {collab.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{collab.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{collab.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {collab.role === "EDITOR" ? (
                        <><Pencil className="h-3 w-3" /> Düzenleyici</>
                      ) : (
                        <><Eye className="h-3 w-3" /> İzleyici</>
                      )}
                    </span>
                    <button
                      onClick={() => handleRemove(collab.userId, collab.name)}
                      className="rounded-lg p-1 text-destructive/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Bekleyen davetler */}
              {pending.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 opacity-60"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    ?
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate">{inv.email}</p>
                    <p className="text-[11px] text-muted-foreground">Davet bekleniyor...</p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {inv.role === "EDITOR" ? "Düzenleyici" : "İzleyici"}
                  </span>
                </div>
              ))}

              {collaborators.length === 0 && pending.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Henüz kimseyle paylaşılmadı
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
