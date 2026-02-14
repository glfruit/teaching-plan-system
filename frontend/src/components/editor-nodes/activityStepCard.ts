import { mergeAttributes, Node } from '@tiptap/core'

export const activityStepCard = Node.create({
  name: 'activityStepCard',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      title: {
        default: '步骤卡',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({ 'data-title': attributes.title }),
      },
      steps: {
        default: '[]',
        parseHTML: (element) => element.getAttribute('data-steps') ?? '[]',
        renderHTML: (attributes) => ({ 'data-steps': attributes.steps }),
      },
      starter: {
        default: '示例：步骤1 观察，步骤2 讨论，步骤3 汇报',
        parseHTML: (element) => element.getAttribute('data-starter') ?? '',
        renderHTML: (attributes) => ({ 'data-starter': attributes.starter }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="activityStepCard"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-node-type': 'activityStepCard' }),
      [
        'div',
        { 'data-node-actions': 'true' },
        ['button', { 'data-action': 'copy' }, '复制'],
        ['button', { 'data-action': 'delete' }, '删除'],
        ['button', { 'data-action': 'move-up' }, '上移'],
        ['button', { 'data-action': 'move-down' }, '下移'],
      ],
      ['div', { 'data-node-content': 'true' }, 0],
    ]
  },
})
