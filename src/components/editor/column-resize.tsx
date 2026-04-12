"use client"

import { useEffect, useCallback, useRef } from "react"
import type { Editor } from "@tiptap/react"

const EDGE_THRESHOLD = 12

interface ColumnResizeProps {
  editor: Editor
}

export function ColumnResize({ editor }: ColumnResizeProps) {
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const layoutRef = useRef<HTMLElement | null>(null)
  const colIndexRef = useRef(-1)
  const startWidthsRef = useRef<number[]>([])
  const hoverLayoutRef = useRef<HTMLElement | null>(null)
  const hoverIndexRef = useRef(-1)

  const getColumns = (layout: HTMLElement) =>
    Array.from(layout.children).filter((el) =>
      el.classList.contains("column-block"),
    ) as HTMLElement[]

  const getWidthPcts = (layout: HTMLElement): number[] => {
    const cols = getColumns(layout)
    const total = cols.reduce((s, c) => s + c.offsetWidth, 0)
    return cols.map((c) => (c.offsetWidth / total) * 100)
  }

  const findGapIndex = (layout: HTMLElement, clientX: number, clientY: number): number => {
    const cols = getColumns(layout)
    for (let i = 0; i < cols.length - 1; i++) {
      const rect = cols[i].getBoundingClientRect()
      const nextRect = cols[i + 1].getBoundingClientRect()
      const gapCenter = (rect.right + nextRect.left) / 2
      const top = Math.min(rect.top, nextRect.top)
      const bottom = Math.max(rect.bottom, nextRect.bottom)

      if (
        Math.abs(clientX - gapCenter) < EDGE_THRESHOLD &&
        clientY >= top &&
        clientY <= bottom
      ) {
        return i
      }
    }
    return -1
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // During drag: update widths live
      if (draggingRef.current && layoutRef.current) {
        const layout = layoutRef.current
        const cols = getColumns(layout)
        const totalWidth = cols.reduce((s, c) => s + c.offsetWidth, 0) || 1

        const deltaX = e.clientX - startXRef.current
        const deltaPct = (deltaX / totalWidth) * 100
        const idx = colIndexRef.current
        const widths = [...startWidthsRef.current]
        const minPct = 10

        const newLeft = widths[idx] + deltaPct
        const newRight = widths[idx + 1] - deltaPct

        if (newLeft >= minPct && newRight >= minPct) {
          widths[idx] = newLeft
          widths[idx + 1] = newRight
          layout.style.gridTemplateColumns = widths.map((w) => `${w}%`).join(" ")
        }
        return
      }

      // Not dragging: detect hover near column gap
      const target = e.target as HTMLElement
      const layout = target.closest(".columns-layout") as HTMLElement ||
        (target.closest(".column-block")?.parentElement?.classList.contains("columns-layout")
          ? target.closest(".column-block")!.parentElement as HTMLElement
          : null)

      if (!layout) {
        hoverLayoutRef.current = null
        hoverIndexRef.current = -1
        document.body.style.cursor = ""
        return
      }

      const idx = findGapIndex(layout, e.clientX, e.clientY)

      if (idx >= 0) {
        hoverLayoutRef.current = layout
        hoverIndexRef.current = idx
        document.body.style.cursor = "col-resize"
      } else {
        hoverLayoutRef.current = null
        hoverIndexRef.current = -1
        document.body.style.cursor = ""
      }
    },
    [],
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (hoverIndexRef.current < 0 || !hoverLayoutRef.current) return

      e.preventDefault()
      e.stopPropagation()

      draggingRef.current = true
      startXRef.current = e.clientX
      layoutRef.current = hoverLayoutRef.current
      colIndexRef.current = hoverIndexRef.current
      startWidthsRef.current = getWidthPcts(hoverLayoutRef.current)
      document.body.style.userSelect = "none"
    },
    [],
  )

  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current || !layoutRef.current) return

    const layout = layoutRef.current
    const widths = getWidthPcts(layout)
    draggingRef.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""

    // Persist to ProseMirror
    try {
      const view = editor.view
      const pos = view.posAtDOM(layout, 0)
      if (pos < 0) return
      const resolved = view.state.doc.resolve(pos)
      for (let depth = resolved.depth; depth >= 0; depth--) {
        if (resolved.node(depth).type.name === "columns") {
          const nodePos = resolved.before(depth)
          const node = view.state.doc.nodeAt(nodePos)
          if (node) {
            const rounded = widths.map((w) => Math.round(w * 10) / 10)
            const tr = view.state.tr.setNodeMarkup(nodePos, undefined, {
              ...node.attrs,
              widths: rounded,
            })
            view.dispatch(tr)
          }
          break
        }
      }
    } catch {
      // Ignore position errors
    }

    layoutRef.current = null
  }, [editor])

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDown, true)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mousedown", handleMouseDown, true)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseDown, handleMouseUp])

  return null
}
