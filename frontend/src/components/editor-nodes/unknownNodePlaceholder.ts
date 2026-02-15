import { mergeAttributes, Node } from '@tiptap/core'

export const unknownNodePlaceholder = Node.create({
  name: 'unknownNodePlaceholder',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() {
    return {
      originalType: {
        default: 'unknown',
        parseHTML: (element) => element.getAttribute('data-original-type') ?? 'unknown',
        renderHTML: (attributes) => ({ 'data-original-type': attributes.originalType }),
      },
      summary: {
        default: '未识别内容',
        parseHTML: (element) => element.getAttribute('data-summary') ?? '未识别内容',
        renderHTML: (attributes) => ({ 'data-summary': attributes.summary }),
      },
      rawJson: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-raw-json') ?? '',
        renderHTML: (attributes) => ({ 'data-raw-json': attributes.rawJson }),
      },
      readonly: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-readonly') !== 'false',
        renderHTML: (attributes) => ({ 'data-readonly': attributes.readonly ? 'true' : 'false' }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="unknownNodePlaceholder"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    const originalType = String(HTMLAttributes.originalType || 'unknown')
    const summary = String(HTMLAttributes.summary || '未识别内容')

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'unknown-node-placeholder rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800',
        'data-node-type': 'unknownNodePlaceholder',
        contenteditable: 'false',
      }),
      ['div', { class: 'font-semibold' }, `未识别节点：${originalType}`],
      ['div', { class: 'text-xs' }, '只读，可删除'],
      ['div', { class: 'mt-1 opacity-80' }, summary],
    ]
  },
})
