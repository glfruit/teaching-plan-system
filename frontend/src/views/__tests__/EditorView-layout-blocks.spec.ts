import { describe, it, expect } from 'vitest'
import { buildPlanPayload, mapFetchedPlanToForm } from '../EditorView.vue'
import type { JSONContent } from '@tiptap/core'

describe('EditorView teaching layout persistence', () => {
  it('keeps teaching layout blocks after save and reload', () => {
    const block = '<div data-node-type="lessonTimeline" data-minutes="10"></div>'
    const processJson: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'lessonTimeline',
          attrs: {
            title: '导入',
            minutes: 10,
          },
        },
      ],
    }

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
      contentJson: {
        process: processJson,
      },
    })

    expect(payload.contentJson?.process).toEqual(processJson)
    expect(payload.htmlContent).toContain('data-node-type="lessonTimeline"')

    const restored = mapFetchedPlanToForm({
      process: payload.process,
      contentJson: payload.contentJson,
    })
    expect(restored.contentJson?.process).toEqual(processJson)
  })
})
