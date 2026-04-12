"use client"

import { useEffect, useCallback, useRef } from "react"
import type { Editor } from "@tiptap/react"

const EDGE_THRESHOLD = 5

interface TableRowResizeProps {
  editor: Editor
}

export function TableRowResize({ editor }: TableRowResizeProps) {
  const resizingRef = useRef(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)
  const targetRowRef = useRef<HTMLTableRowElement | null>(null)
  const rowPosRef = useRef<number | null>(null)
  const activeCellRef = useRef<HTMLElement | null>(null)

  const findRowPos = useCallback(
    (tr: HTMLTableRowElement): number | null => {
      try {
        const view = editor.view
        if (!view || view.isDestroyed || !view.dom.contains(tr)) return null
        const firstCell = tr.querySelector("td, th")
        if (!firstCell || !view.dom.contains(firstCell)) return null
        const pos = view.posAtDOM(firstCell, 0)
        if (pos < 0 || pos >= view.state.doc.content.size) return null
        const resolved = view.state.doc.resolve(pos)
        for (let depth = resolved.depth; depth > 0; depth--) {
          if (resolved.node(depth).type.name === "tableRow") {
            const before = resolved.before(depth)
            return before >= 0 ? before : null
          }
        }
      } catch {
        // Ignore
      }
      return null
    },
    [editor],
  )

  const clearActive = useCallback(() => {
    if (activeCellRef.current) {
      activeCellRef.current.classList.remove("row-resize-active")
      activeCellRef.current = null
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizingRef.current && targetRowRef.current) {
        const deltaY = e.clientY - startYRef.current
        const newHeight = Math.max(32, startHeightRef.current + deltaY)
        targetRowRef.current.style.height = `${newHeight}px`
        return
      }

      // Skip during column resize
      if (editor.view.dom.classList.contains("resize-cursor")) {
        clearActive()
        return
      }

      const target = e.target as HTMLElement
      const cell = target.closest("td, th") as HTMLElement | null

      if (!cell || !cell.closest(".ProseMirror")) {
        clearActive()
        return
      }

      const rect = cell.getBoundingClientRect()
      const nearBottom = e.clientY > rect.bottom - EDGE_THRESHOLD

      if (nearBottom) {
        if (activeCellRef.current !== cell) {
          clearActive()
          cell.classList.add("row-resize-active")
          activeCellRef.current = cell
        }
      } else {
        clearActive()
      }
    },
    [clearActive],
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!activeCellRef.current) return

      const cell = activeCellRef.current
      const tr = cell.closest("tr") as HTMLTableRowElement
      if (!tr) return

      e.preventDefault()

      resizingRef.current = true
      targetRowRef.current = tr
      startYRef.current = e.clientY
      startHeightRef.current = tr.offsetHeight
      rowPosRef.current = findRowPos(tr)

      tr.classList.add("row-resizing")
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
    },
    [findRowPos],
  )

  const handleMouseUp = useCallback(() => {
    if (!resizingRef.current || !targetRowRef.current) return

    const newHeight = targetRowRef.current.offsetHeight

    // Persist height
    if (rowPosRef.current !== null && rowPosRef.current >= 0) {
      try {
        const { state } = editor
        const node = state.doc.nodeAt(rowPosRef.current)
        if (node && node.type.name === "tableRow") {
          const tr = state.tr.setNodeMarkup(rowPosRef.current, undefined, {
            ...node.attrs,
            height: newHeight,
          })
          editor.view.dispatch(tr)
        }
      } catch {
        // Ignore - position may have changed
      }
    }

    targetRowRef.current.classList.remove("row-resizing")
    resizingRef.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
    targetRowRef.current = null
    rowPosRef.current = null
    clearActive()
  }, [editor, clearActive])

  useEffect(() => {
    const editorEl = editor.view.dom

    editorEl.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      editorEl.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [editor, handleMouseMove, handleMouseDown, handleMouseUp])

  return null
}
