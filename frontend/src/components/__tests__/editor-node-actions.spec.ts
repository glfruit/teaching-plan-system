import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'

describe('teaching layout node actions', () => {
  it('shows copy/delete/move actions in node view', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
      content: '<p></p>',
    })

    editor.commands.insertContent({ type: 'lessonTimeline' })
    const html = editor.getHTML()

    expect(html).toContain('data-action="copy"')
    expect(html).toContain('data-action="delete"')
    expect(html).toContain('data-action="move-up"')
    expect(html).toContain('data-action="move-down"')
    expect(html).toContain('示例')
  })
})
