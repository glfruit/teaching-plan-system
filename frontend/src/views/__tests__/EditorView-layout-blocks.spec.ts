import { describe, it, expect } from 'vitest'
import { buildPlanPayload, mapFetchedPlanToForm } from '../EditorView.vue'

describe('EditorView teaching layout persistence', () => {
  it('keeps teaching layout blocks after save and reload', () => {
    const block = '<div data-node-type="lessonTimeline" data-minutes="10"></div>'
    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: block,
      blackboard: '<p></p>',
      reflection: '<p></p>',
    })

    expect(payload.process).toContain('data-node-type="lessonTimeline"')
    expect(payload.htmlContent).toContain('data-node-type="lessonTimeline"')

    const restored = mapFetchedPlanToForm({ process: payload.process })
    expect(restored.process).toContain('data-node-type="lessonTimeline"')
  })
})
