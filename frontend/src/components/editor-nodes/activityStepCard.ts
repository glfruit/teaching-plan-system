import { mergeAttributes, Node } from '@tiptap/core'

export const activityStepCard = Node.create({
  name: 'activityStepCard',
  group: 'block',
  atom: true,
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
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="activityStepCard"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-node-type': 'activityStepCard' })]
  },
})
