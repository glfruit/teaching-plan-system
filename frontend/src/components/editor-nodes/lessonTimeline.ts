import { mergeAttributes, Node } from '@tiptap/core'

export const lessonTimeline = Node.create({
  name: 'lessonTimeline',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      title: {
        default: '时间轴',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({ 'data-title': attributes.title }),
      },
      minutes: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute('data-minutes') ?? 0),
        renderHTML: (attributes) => ({ 'data-minutes': String(attributes.minutes) }),
      },
      starter: {
        default: '示例：导入 10 分钟，讲解 20 分钟，练习 10 分钟',
        parseHTML: (element) => element.getAttribute('data-starter') ?? '',
        renderHTML: (attributes) => ({ 'data-starter': attributes.starter }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="lessonTimeline"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-node-type': 'lessonTimeline' }),
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
