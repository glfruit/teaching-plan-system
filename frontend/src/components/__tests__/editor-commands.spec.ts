import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'
import {
  insertLessonTimeline,
  insertActivityStepCard,
  insertGoalActivityAssessmentGrid,
} from '../editor-nodes/commands'

describe('teaching layout commands', () => {
  it('inserts timeline node', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
    })
    try {
      const ok = insertLessonTimeline(editor)
      expect(ok).toBe(true)
      expect(editor.getJSON().content?.[0]?.type).toBe('lessonTimeline')
    } finally {
      editor.destroy()
    }
  })

  it('inserts step card node', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
    })
    try {
      const ok = insertActivityStepCard(editor)
      expect(ok).toBe(true)
      expect(editor.getJSON().content?.[0]?.type).toBe('activityStepCard')
    } finally {
      editor.destroy()
    }
  })

  it('inserts goal-activity-assessment grid node', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
    })
    try {
      const ok = insertGoalActivityAssessmentGrid(editor)
      expect(ok).toBe(true)
      expect(editor.getJSON().content?.[0]?.type).toBe('goalActivityAssessmentGrid')
    } finally {
      editor.destroy()
    }
  })
})
