import TableHeader from "@tiptap/extension-table-header"

export const TableHeaderExtended = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: "left",
        parseHTML: (element) => element.style.textAlign || "left",
        renderHTML: (attributes) => {
          if (attributes.textAlign === "left") return {}
          return { style: `text-align: ${attributes.textAlign}` }
        },
      },
      verticalAlign: {
        default: "top",
        parseHTML: (element) => element.style.verticalAlign || "top",
        renderHTML: (attributes) => {
          if (attributes.verticalAlign === "top") return {}
          return { style: `vertical-align: ${attributes.verticalAlign}` }
        },
      },
    }
  },
})
