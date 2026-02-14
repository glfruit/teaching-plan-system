import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'
import {
  copyCurrentTeachingNode,
  deleteCurrentTeachingNode,
  moveCurrentTeachingNodeDown,
  moveCurrentTeachingNodeUp,
} from '../editor-nodes/commands'

const findNodePosByType = (editor: Editor, type: string): number => {
  let found = -1
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === type && found === -1) {
      found = pos
    }
  })
  return found
}

describe('teaching layout node actions', () => {
  it('supports copy/delete/move actions on current teaching node', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
      content: '<p></p>',
    })

    editor.commands.insertContent({
      type: 'lessonTimeline',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }],
    })
    editor.commands.setTextSelection(3)

    expect(copyCurrentTeachingNode(editor)).toBe(true)
    let json = editor.getJSON()
    const copiedCount = json.content?.filter((n) => n.type === 'lessonTimeline').length
    expect(copiedCount).toBe(2)

    expect(deleteCurrentTeachingNode(editor)).toBe(true)
    json = editor.getJSON()
    expect(json.content?.filter((n) => n.type === 'lessonTimeline').length).toBe(1)

    editor.commands.setTextSelection(editor.state.doc.content.size)
    editor.commands.insertContent({
      type: 'activityStepCard',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }],
    })
    const activityPos = findNodePosByType(editor, 'activityStepCard')
    editor.commands.setNodeSelection(activityPos)

    expect(moveCurrentTeachingNodeUp(editor)).toBe(true)
    json = editor.getJSON()
    expect(json.content?.[0]?.type).toBe('activityStepCard')

    expect(moveCurrentTeachingNodeDown(editor)).toBe(true)
    json = editor.getJSON()
    expect(json.content?.[0]?.type).toBe('lessonTimeline')
  })
})
