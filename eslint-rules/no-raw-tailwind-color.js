// Flags Tailwind's built-in color-palette utility classes (bg-red-500,
// text-gray-200, border-slate-300, ...). This project's colors all come
// from --brand-* tokens (app/assets/css/main.css), applied via arbitrary
// value syntax, e.g. bg-[var(--brand-danger)] — never a stock palette class.
const PROPERTIES = [
  'bg', 'text', 'border', 'ring', 'ring-offset', 'fill', 'stroke', 'divide',
  'outline', 'decoration', 'placeholder', 'caret', 'accent', 'from', 'via', 'to', 'shadow',
]
const COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]
const SHADE_RE = '(?:-(?:50|100|200|300|400|500|600|700|800|900|950))?'
const CLASS_RE = new RegExp(
  `\\b(?:${PROPERTIES.join('|')})-(?:${COLORS.join('|')})${SHADE_RE}\\b`,
  'g',
)

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind default color-palette utility classes — use a --brand-* token via arbitrary value syntax instead.',
    },
    schema: [],
    messages: {
      rawColor: 'Tailwind palette class "{{cls}}" is not allowed. Use bg-[var(--brand-xxx)] (or the matching text/border/etc. token) instead.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.sourceCode
        const text = sourceCode.getText()
        const commentRanges = sourceCode.getAllComments().map(c => c.range)

        let match
        CLASS_RE.lastIndex = 0
        while ((match = CLASS_RE.exec(text)) !== null) {
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
            messageId: 'rawColor',
            data: { cls: match[0] },
          })
        }
      },
    }
  },
}
