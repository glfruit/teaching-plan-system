import { describe, it, expect } from 'vitest'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'

describe('editor nodes exports', () => {
  it('exports three teaching layout nodes', () => {
    expect(lessonTimeline.name).toBe('lessonTimeline')
    expect(activityStepCard.name).toBe('activityStepCard')
    expect(goalActivityAssessmentGrid.name).toBe('goalActivityAssessmentGrid')
  })
})
