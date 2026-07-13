// Flags raw hex color literals anywhere in a .vue file (template, script, or
// style block). Design tokens live in app/assets/css/main.css as --brand-*
// custom properties — every color in a component must reference one of
// those via bg-[var(--brand-xxx)] / text-[var(--brand-xxx)] / etc.
const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hex color literals in .vue files — use a --brand-* token from main.css instead.',
    },
    schema: [],
    messages: {
      hexColor: 'Hex color "{{hex}}" is not allowed in .vue files. Add/use a --brand-* token in app/assets/css/main.css instead.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.sourceCode
        const text = sourceCode.getText()
        const commentRanges = sourceCode.getAllComments().map(c => c.range)

        let match
        HEX_RE.lastIndex = 0
        while ((match = HEX_RE.exec(text)) !== null) {
          const start = match.index
          const end = start + match[0].length
          const inComment = commentRanges.some(([cs, ce]) => start >= cs && end <= ce)
          if (inComment) continue

          context.report({
            node,
            loc: {
              start: sourceCode.getLocFromIndex(start),
              end: sourceCode.getLocFromIndex(end),
            },
            messageId: 'hexColor',
            data: { hex: match[0] },
          })
        }
      },
    }
  },
}
