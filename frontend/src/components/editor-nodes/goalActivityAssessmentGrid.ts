import { mergeAttributes, Node } from '@tiptap/core'

export const goalActivityAssessmentGrid = Node.create({
  name: 'goalActivityAssessmentGrid',
  group: 'block',
  content: 'block+',
  defining: true,
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
      starter: {
        default: '示例：目标-识记概念，活动-小组实验，评价-口头反馈',
        parseHTML: (element) => element.getAttribute('data-starter') ?? '',
        renderHTML: (attributes) => ({ 'data-starter': attributes.starter }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-node-type="goalActivityAssessmentGrid"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-node-type': 'goalActivityAssessmentGrid' }),
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
