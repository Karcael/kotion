"use client"

import { useEffect, useState } from "react"
import { useSidebar } from "./use-sidebar"

export interface DocumentMeta {
  title: string
  icon: string | null
}

const cache = new Map<string, DocumentMeta>()
const pending = new Map<string, Promise<DocumentMeta | null>>()

async function fetchMeta(id: string): Promise<DocumentMeta | null> {
  const existing = pending.get(id)
  if (existing) return existing

  const p = (async () => {
    try {
      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) return null
      const data = await res.json()
      const meta: DocumentMeta = {
        title: data.title ?? "",
        icon: data.icon ?? null,
      }
      cache.set(id, meta)
      return meta
    } catch {
      return null
    } finally {
      pending.delete(id)
    }
  })()

  pending.set(id, p)
  return p
}

/**
 * Returns live title/icon for a document, refreshed whenever the sidebar
 * refreshKey changes. Falls back to the provided static values until the
 * first fetch resolves.
 */
export function useDocumentMeta(
  id: string | null | undefined,
  fallback: DocumentMeta,
): DocumentMeta {
  const refreshKey = useSidebar((s) => s.refreshKey)
  const titleOverride = useSidebar((s) =>
    id ? s.titleOverrides[id] : undefined,
  )

  const [meta, setMeta] = useState<DocumentMeta>(() => {
    if (!id) return fallback
    return cache.get(id) ?? fallback
  })

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const cached = cache.get(id)
    if (cached) setMeta(cached)

    fetchMeta(id).then((m) => {
      if (!cancelled && m) setMeta(m)
    })

    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  return {
    title: titleOverride ?? meta.title,
    icon: meta.icon,
  }
}
