import { mergeAttributes, Node } from '@tiptap/core'

export const lessonTimeline = Node.create({
  name: 'lessonTimeline',
  group: 'block',
  atom: true,
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
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="lessonTimeline"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-node-type': 'lessonTimeline' })]
  },
})
