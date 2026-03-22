import { Node, mergeAttributes } from "@tiptap/core"

// Sütun kapsayıcı düğümü
export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2,4}",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      count: {
        default: 2,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-columns") || "2", 10),
        renderHTML: (attributes) => ({
          "data-columns": attributes.count,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "columns",
        class: "columns-layout",
      }),
      0,
    ]
  },
})

// Tek sütun düğümü
export const Column = Node.create({
  name: "column",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }]
  },

  renderHTML() {
    return ["div", { "data-type": "column", class: "column-block" }, 0]
  },
})

// Sütun oluşturma yardımcısı
export function createColumnsContent(count: number) {
  const columns = []
  for (let i = 0; i < count; i++) {
    columns.push({
      type: "column",
      content: [{ type: "paragraph" }],
    })
  }
  return {
    type: "columns",
    attrs: { count },
    content: columns,
  }
}
