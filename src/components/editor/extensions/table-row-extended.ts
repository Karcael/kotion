import TableRow from "@tiptap/extension-table-row"

export const TableRowExtended = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element) => {
          const h = element.style.height
          return h ? parseInt(h, 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {}
          return { style: `height: ${attributes.height}px` }
        },
      },
    }
  },
})
