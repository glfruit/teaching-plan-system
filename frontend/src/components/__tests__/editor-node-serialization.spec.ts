import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'

describe('teaching layout node serialization', () => {
  it('can insert editable timeline and keep attrs', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
      content: '<p></p>',
    })
    editor.commands.insertContent({
      type: 'lessonTimeline',
      attrs: { title: '导入', minutes: 10 },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '环节一' }] }],
    })
    const json = editor.getJSON()
    expect(JSON.stringify(json)).toContain('lessonTimeline')
    expect(JSON.stringify(json)).toContain('minutes')
    expect(JSON.stringify(json)).toContain('环节一')
  })
})
