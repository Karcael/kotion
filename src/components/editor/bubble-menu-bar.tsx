"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Link,
} from "lucide-react"

interface BubbleMenuBarProps {
  editor: Editor
}

export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const toggleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt("URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const items = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      title: "Kalın",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      title: "İtalik",
    },
    {
      icon: Underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      title: "Altı Çizili",
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      title: "Üstü Çizili",
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
      title: "Kod",
    },
    {
      icon: Highlighter,
      action: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive("highlight"),
      title: "Vurgula",
    },
    {
      icon: Link,
      action: toggleLink,
      active: editor.isActive("link"),
      title: "Bağlantı",
    },
  ]

  return (
    <div className="animate-scale-in flex items-center gap-0.5 rounded-xl border border-border/50 bg-popover p-1 shadow-xl">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.title}
            onClick={item.action}
            title={item.title}
            className={`rounded-lg p-1.5 transition-all duration-150 ${
              item.active
                ? "bg-accent/15 text-accent"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={item.active ? 2.5 : 2} />
          </button>
        )
      })}
    </div>
  )
}
