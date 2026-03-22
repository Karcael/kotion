"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GripVertical } from "lucide-react"
import type { Editor } from "@tiptap/react"

interface DragHandleProps {
  editor: Editor
  containerRef: React.RefObject<HTMLDivElement | null>
}

function getBlockElements(editor: Editor): HTMLElement[] {
  const editorDom = editor.view.dom
  return Array.from(editorDom.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  )
}

function getDropIndex(blocks: HTMLElement[], clientY: number): number {
  for (let i = 0; i < blocks.length; i++) {
    const rect = blocks[i].getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    if (clientY < mid) return i
  }
  return blocks.length
}

export function DragHandleReact({ editor, containerRef }: DragHandleProps) {
  const [visible, setVisible] = useState(false)
  const [handlePos, setHandlePos] = useState({ top: 0, left: 0 })
  const [indicatorPos, setIndicatorPos] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const sourceIndexRef = useRef<number | null>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  // Bloğa göre handle konumunu güncelle
  const updateHandleForBlock = useCallback(
    (blockEl: HTMLElement, index: number) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const blockRect = blockEl.getBoundingClientRect()

      setHandlePos({
        top: blockRect.top - containerRect.top + 2,
        left: blockRect.left - containerRect.left - 30,
      })
      setVisible(true)
      sourceIndexRef.current = index
    },
    [containerRef]
  )

  // Mouse move: hangi bloğun üzerindeyiz?
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) return

      // Handle üzerindeyse gizleme
      if (handleRef.current?.contains(e.target as Node)) return

      const blocks = getBlockElements(editor)
      let found = -1

      for (let i = 0; i < blocks.length; i++) {
        const rect = blocks[i].getBoundingClientRect()
        if (e.clientY >= rect.top - 2 && e.clientY <= rect.bottom + 2) {
          found = i
          break
        }
      }

      if (found >= 0) {
        updateHandleForBlock(blocks[found], found)
      } else {
        setVisible(false)
        sourceIndexRef.current = null
      }
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (isDragging) return
      const related = e.relatedTarget as HTMLElement | null
      if (handleRef.current?.contains(related)) return
      setVisible(false)
    }

    container.addEventListener("mousemove", onMouseMove)
    container.addEventListener("mouseleave", onMouseLeave)

    return () => {
      container.removeEventListener("mousemove", onMouseMove)
      container.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [editor, containerRef, isDragging, updateHandleForBlock])

  // Sürükleme başlat
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (sourceIndexRef.current === null) return

      setIsDragging(true)
      const srcIdx = sourceIndexRef.current

      // Kaynak bloğu vurgula
      const blocks = getBlockElements(editor)
      blocks[srcIdx]?.classList.add("dragging-block")

      const onMove = (me: MouseEvent) => {
        const container = containerRef.current
        if (!container) return

        const blocks = getBlockElements(editor)
        const dropIdx = getDropIndex(blocks, me.clientY)
        const containerRect = container.getBoundingClientRect()

        let y: number
        if (dropIdx < blocks.length) {
          y = blocks[dropIdx].getBoundingClientRect().top - containerRect.top
        } else if (blocks.length > 0) {
          const last = blocks[blocks.length - 1]
          y = last.getBoundingClientRect().bottom - containerRect.top
        } else {
          return
        }

        setIndicatorPos(y)
      }

      const onUp = (me: MouseEvent) => {
        document.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseup", onUp)
        document.body.style.cursor = ""

        // Temizlik
        const blocks = getBlockElements(editor)
        blocks[srcIdx]?.classList.remove("dragging-block")
        setIsDragging(false)
        setIndicatorPos(null)
        setVisible(false)

        // Hedef hesapla
        const dropIdx = getDropIndex(blocks, me.clientY)

        // Aynı yere bırakma
        if (dropIdx === srcIdx || dropIdx === srcIdx + 1) return

        // JSON ile taşı
        const json = editor.getJSON()
        if (!json.content) return

        const content = [...json.content]
        const [moved] = content.splice(srcIdx, 1)
        const insertIdx = dropIdx > srcIdx ? dropIdx - 1 : dropIdx
        content.splice(insertIdx, 0, moved)

        editor.commands.setContent({ type: "doc", content })
      }

      document.body.style.cursor = "grabbing"
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", onUp)
    },
    [editor, containerRef]
  )

  if (!editor.isEditable) return null

  return (
    <>
      {/* Sürükleme tutamacı */}
      <div
        ref={handleRef}
        onMouseDown={onMouseDown}
        className="drag-handle"
        style={{
          position: "absolute",
          top: handlePos.top,
          left: handlePos.left,
          zIndex: 10,
          opacity: visible || isDragging ? 1 : 0,
          pointerEvents: visible || isDragging ? "auto" : "none",
        }}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Bırakma göstergesi */}
      {indicatorPos !== null && (
        <div
          className="drop-indicator"
          style={{
            position: "absolute",
            top: indicatorPos,
            left: 54,
            right: 0,
            zIndex: 10,
          }}
        />
      )}
    </>
  )
}
