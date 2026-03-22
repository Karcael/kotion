"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react"
import { PageIcon } from "@/components/page-icon"

function PageLinkView({ node }: ReactNodeViewProps) {
  const { pageId, title, icon } = node.attrs

  return (
    <NodeViewWrapper data-type="page-link" className="page-link-block">
      <a
        href={`/documents/${pageId}`}
        className="page-link-inner"
        data-page-navigate={pageId}
      >
        <span className="page-link-icon">
          <PageIcon icon={icon} size={18} />
        </span>
        <span className="page-link-title">{title || "Adsız"}</span>
        <span className="page-link-arrow">{"\u2192"}</span>
      </a>
    </NodeViewWrapper>
  )
}

export const PageLink = Node.create({
  name: "pageLink",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      pageId: { default: null },
      title: { default: "Adsız" },
      icon: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="page-link"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { pageId, title, icon } = HTMLAttributes

    // İkon: emoji veya fallback metin
    const iconContent =
      icon && !icon.startsWith("/") && !icon.startsWith("http") && !icon.startsWith("lucide:")
        ? icon
        : "📄"

    // Görsel ikon için ayrı element
    const iconEl: any =
      icon && (icon.startsWith("/") || icon.startsWith("http"))
        ? [
            "img",
            {
              src: icon,
              alt: "",
              style:
                "width:18px;height:18px;border-radius:3px;object-fit:cover;display:block;",
            },
          ]
        : iconContent

    return [
      "div",
      mergeAttributes(
        { "data-type": "page-link", class: "page-link-block" },
        { "data-page-id": pageId }
      ),
      [
        "a",
        {
          href: `/documents/${pageId}`,
          class: "page-link-inner",
          "data-page-navigate": pageId,
        },
        ["span", { class: "page-link-icon" }, iconEl],
        ["span", { class: "page-link-title" }, title || "Adsız"],
        ["span", { class: "page-link-arrow" }, "\u2192"],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageLinkView)
  },
})
