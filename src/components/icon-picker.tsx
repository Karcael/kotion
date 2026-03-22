"use client"

import { useEffect, useRef, useState } from "react"

const EMOJI_CATEGORIES: Record<string, string[]> = {
  "Sık Kullanılan": [
    "📝", "📄", "📋", "📌", "📎", "🔖", "💡", "⭐", "🎯", "🚀",
    "💻", "🖥️", "📊", "📈", "📉", "🗂️", "📁", "📂", "🏠", "🏢",
  ],
  Yüzler: [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊",
    "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋",
  ],
  "El Hareketleri": [
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
    "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎",
  ],
  Doğa: [
    "🌸", "🌺", "🌻", "🌹", "🌷", "🌱", "🌿", "☘️", "🍀", "🌳",
    "🌲", "⛰️", "🏔️", "🌊", "🔥", "⚡", "☀️", "🌙", "⭐", "🌈",
  ],
  Nesneler: [
    "📱", "💻", "⌨️", "🖨️", "📷", "🔑", "🔒", "📦", "🎁", "🛠️",
    "⚙️", "🔧", "📐", "📏", "✏️", "🖊️", "📕", "📗", "📘", "📙",
  ],
  Semboller: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💯", "✅",
    "❌", "⭕", "🔴", "🟢", "🔵", "⚠️", "ℹ️", "❓", "❗", "💬",
  ],
}

interface IconPickerProps {
  onSelect: (icon: string) => void
  onClose: () => void
}

export function IconPicker({ onSelect, onClose }: IconPickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="animate-scale-in absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border/50 bg-popover shadow-2xl"
    >
      <div className="p-3 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Emoji ara..."
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
          autoFocus
        />
      </div>
      <div className="max-h-64 overflow-y-auto px-3 pb-2">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => {
          const filtered = search
            ? emojis.filter(() =>
                category.toLowerCase().includes(search.toLowerCase())
              )
            : emojis

          if (filtered.length === 0) return null

          return (
            <div key={category} className="mb-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {category}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {filtered.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => onSelect(emoji)}
                    className="flex items-center justify-center rounded-lg p-1.5 text-xl transition-all duration-100 hover:bg-foreground/5 hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="border-t border-border/60 p-2">
        <button
          onClick={() => onSelect("")}
          className="w-full rounded-xl py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          İkonu Kaldır
        </button>
      </div>
    </div>
  )
}
