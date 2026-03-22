"use client"

import type { Editor } from "@tiptap/react"
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Rows3,
  Columns3,
  XCircle,
} from "lucide-react"

interface TableMenuProps {
  editor: Editor
}

export function TableMenu({ editor }: TableMenuProps) {
  const items = [
    {
      section: "Satır",
      actions: [
        {
          icon: ArrowUpToLine,
          label: "Üste satır ekle",
          action: () => editor.chain().focus().addRowBefore().run(),
        },
        {
          icon: ArrowDownToLine,
          label: "Alta satır ekle",
          action: () => editor.chain().focus().addRowAfter().run(),
        },
        {
          icon: Rows3,
          label: "Satırı sil",
          action: () => editor.chain().focus().deleteRow().run(),
          destructive: true,
        },
      ],
    },
    {
      section: "Sütun",
      actions: [
        {
          icon: ArrowLeftToLine,
          label: "Sola sütun ekle",
          action: () => editor.chain().focus().addColumnBefore().run(),
        },
        {
          icon: ArrowRightToLine,
          label: "Sağa sütun ekle",
          action: () => editor.chain().focus().addColumnAfter().run(),
        },
        {
          icon: Columns3,
          label: "Sütunu sil",
          action: () => editor.chain().focus().deleteColumn().run(),
          destructive: true,
        },
      ],
    },
  ]

  return (
    <div className="animate-scale-in flex items-center gap-0.5 rounded-xl border border-border/50 bg-popover p-1 shadow-xl">
      {items.map((group, gi) => (
        <div key={group.section} className="flex items-center gap-0.5">
          {gi > 0 && <div className="mx-0.5 h-5 w-px bg-border/60" />}
          {group.actions.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={(e) => {
                  e.preventDefault()
                  item.action()
                }}
                onMouseDown={(e) => e.preventDefault()}
                title={item.label}
                className={`rounded-lg p-1.5 transition-all duration-150 ${
                  item.destructive
                    ? "text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      ))}

      {/* Ayırıcı */}
      <div className="mx-0.5 h-5 w-px bg-border/60" />

      {/* Tabloyu sil */}
      <button
        onClick={(e) => {
          e.preventDefault()
          editor.chain().focus().deleteTable().run()
        }}
        onMouseDown={(e) => e.preventDefault()}
        title="Tabloyu sil"
        className="rounded-lg p-1.5 text-destructive/70 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}
