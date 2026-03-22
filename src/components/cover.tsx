"use client"

import { ImageIcon, X } from "lucide-react"

interface CoverProps {
  url: string
  onRemove: () => void
}

export function Cover({ url, onRemove }: CoverProps) {
  return (
    <div className="group relative h-[35vh] w-full overflow-hidden">
      <img
        src={url}
        alt="Kapak görseli"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
        <button
          onClick={onRemove}
          className="flex items-center gap-1.5 rounded-xl bg-background/80 px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-all hover:bg-background"
        >
          <X className="h-3.5 w-3.5" />
          Kapağı Kaldır
        </button>
      </div>
    </div>
  )
}
