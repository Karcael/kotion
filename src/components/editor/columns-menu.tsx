"use client"

import type { Editor } from "@tiptap/react"
import { Plus, Minus, Columns2, Columns3, Columns4, XCircle } from "lucide-react"

interface ColumnsMenuProps {
  editor: Editor
}

export function ColumnsMenu({ editor }: ColumnsMenuProps) {
  const getColumnsNode = () => {
    const { $from } = editor.state.selection
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)
      if (node.type.name === "columns") {
        return { node, pos: $from.before(depth) }
      }
    }
    return null
  }

  const currentCount = () => {
    const found = getColumnsNode()
    return found ? found.node.childCount : 0
  }

  const setColumnCount = (count: number) => {
    const found = getColumnsNode()
    if (!found) return

    const { node, pos } = found
    const { tr } = editor.state
    const currentChildren = node.childCount

    if (count > currentChildren && count <= 4) {
      // Sütun ekle
      for (let i = currentChildren; i < count; i++) {
        const newColumn = editor.state.schema.nodes.column.createAndFill()
        if (newColumn) {
          const insertPos = pos + node.nodeSize - 1
          tr.insert(insertPos, newColumn)
        }
      }
      tr.setNodeMarkup(pos, undefined, { count })
      editor.view.dispatch(tr)
    } else if (count < currentChildren && count >= 2) {
      // Son sütunları sil
      let endPos = pos + node.nodeSize - 1
      for (let i = currentChildren - 1; i >= count; i--) {
        const child = node.child(i)
        const childStart = endPos - child.nodeSize
        tr.delete(childStart, endPos)
        endPos = childStart
      }
      tr.setNodeMarkup(pos, undefined, { count })
      editor.view.dispatch(tr)
    }
  }

  const removeColumns = () => {
    const found = getColumnsNode()
    if (!found) return

    const { node, pos } = found
    // Sütun içeriklerini düz bloklar olarak çıkar
    const contents: any[] = []
    node.forEach((column) => {
      column.forEach((block) => {
        contents.push(block.toJSON())
      })
    })

    editor
      .chain()
      .focus()
      .insertContentAt(
        { from: pos, to: pos + node.nodeSize },
        contents
      )
      .run()
  }

  const count = currentCount()

  const layouts = [
    { count: 2, icon: Columns2, label: "2 Sütun" },
    { count: 3, icon: Columns3, label: "3 Sütun" },
    { count: 4, icon: Columns4, label: "4 Sütun" },
  ]

  return (
    <div className="animate-scale-in flex items-center gap-0.5 rounded-xl border border-border/50 bg-popover p-1 shadow-xl">
      {layouts.map((layout) => {
        const Icon = layout.icon
        return (
          <button
            key={layout.count}
            onClick={(e) => {
              e.preventDefault()
              setColumnCount(layout.count)
            }}
            onMouseDown={(e) => e.preventDefault()}
            title={layout.label}
            className={`rounded-lg p-1.5 transition-all duration-150 ${
              count === layout.count
                ? "bg-accent/15 text-accent"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}

      <div className="mx-0.5 h-5 w-px bg-border/60" />

      {/* Sütun ekle */}
      <button
        onClick={(e) => {
          e.preventDefault()
          if (count < 4) setColumnCount(count + 1)
        }}
        onMouseDown={(e) => e.preventDefault()}
        title="Sütun ekle"
        disabled={count >= 4}
        className="rounded-lg p-1.5 text-muted-foreground transition-all duration-150 hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Sütun çıkar */}
      <button
        onClick={(e) => {
          e.preventDefault()
          if (count > 2) setColumnCount(count - 1)
        }}
        onMouseDown={(e) => e.preventDefault()}
        title="Sütun çıkar"
        disabled={count <= 2}
        className="rounded-lg p-1.5 text-muted-foreground transition-all duration-150 hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>

      <div className="mx-0.5 h-5 w-px bg-border/60" />

      {/* Sütunları kaldır */}
      <button
        onClick={(e) => {
          e.preventDefault()
          removeColumns()
        }}
        onMouseDown={(e) => e.preventDefault()}
        title="Sütunları kaldır"
        className="rounded-lg p-1.5 text-destructive/70 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}
