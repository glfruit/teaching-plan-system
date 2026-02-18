import { describe, it, expect, afterEach } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'

const editors: Editor[] = []

afterEach(() => {
  while (editors.length > 0) {
    const editor = editors.pop()
    editor?.destroy()
  }
})

const createEditor = (options: ConstructorParameters<typeof Editor>[0]): Editor => {
  const editor = new Editor(options)
  editors.push(editor)
  return editor
}

describe('teaching layout node serialization', () => {
  it('can insert editable timeline and keep attrs', () => {
    const editor = createEditor({
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

  it('does not output static data-action buttons in html', () => {
    const editor = createEditor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
      content: {
        type: 'doc',
        content: [
          {
            type: 'activityStepCard',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '步骤内容' }] }],
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).not.toContain('data-action=')
    expect(html).toContain('data-node-type="activityStepCard"')
  })
})
