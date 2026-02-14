import type { Editor } from '@tiptap/core'

export const insertLessonTimeline = (editor: Editor): boolean =>
  editor.chain().focus().insertContent({ type: 'lessonTimeline' }).run()

export const insertActivityStepCard = (editor: Editor): boolean =>
  editor.chain().focus().insertContent({ type: 'activityStepCard' }).run()

export const insertGoalActivityAssessmentGrid = (editor: Editor): boolean =>
  editor.chain().focus().insertContent({ type: 'goalActivityAssessmentGrid' }).run()
