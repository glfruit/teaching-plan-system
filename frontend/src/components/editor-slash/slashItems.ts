import type { Editor } from '@tiptap/core'
import {
  insertLessonTimeline,
  insertActivityStepCard,
  insertGoalActivityAssessmentGrid,
} from '../editor-nodes'

export type TeachingSlashItem = {
  key: 'timeline' | 'stepCard' | 'grid'
  label: string
  command: (editor: Editor) => boolean
}

export const teachingSlashItems: TeachingSlashItem[] = [
  {
    key: 'timeline',
    label: '/时间轴',
    command: insertLessonTimeline,
  },
  {
    key: 'stepCard',
    label: '/步骤卡',
    command: insertActivityStepCard,
  },
  {
    key: 'grid',
    label: '/三栏块',
    command: insertGoalActivityAssessmentGrid,
  },
]

export const filterTeachingSlashItems = (query: string): TeachingSlashItem[] =>
  teachingSlashItems.filter((item) => item.label.toLowerCase().includes(`/${query}`.toLowerCase()))
