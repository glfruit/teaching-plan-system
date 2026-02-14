import { mergeAttributes, Node } from '@tiptap/core'

export const goalActivityAssessmentGrid = Node.create({
  name: 'goalActivityAssessmentGrid',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      goal: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-goal') ?? '',
        renderHTML: (attributes) => ({ 'data-goal': attributes.goal }),
      },
      activity: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-activity') ?? '',
        renderHTML: (attributes) => ({ 'data-activity': attributes.activity }),
      },
      assessment: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-assessment') ?? '',
        renderHTML: (attributes) => ({ 'data-assessment': attributes.assessment }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="goalActivityAssessmentGrid"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-node-type': 'goalActivityAssessmentGrid' })]
  },
})
