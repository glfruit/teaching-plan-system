import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workbenchViewPath = resolve(__dirname, '..', 'AcademicWorkbenchView.vue')
const workbenchViewSource = readFileSync(workbenchViewPath, 'utf-8')

describe('AcademicWorkbench teaching plan book fields', () => {
  it('covers teaching plan book info-table fields', () => {
    expect(workbenchViewSource).toContain('selectedBookCourseName')
    expect(workbenchViewSource).toContain('授课科目（自动）')
    expect(workbenchViewSource).toContain('v-model="bookForm.teacherName"')
    expect(workbenchViewSource).toContain('v-model="bookForm.teacherTitle"')
    expect(workbenchViewSource).toContain('v-model="bookForm.teacherUnit"')
    expect(workbenchViewSource).toContain('v-model="bookForm.periodStart"')
    expect(workbenchViewSource).toContain('v-model="bookForm.periodEnd"')
    expect(workbenchViewSource).toContain('v-model="bookForm.totalHours"')
    expect(workbenchViewSource).toContain('v-model="bookForm.theoryHours"')
    expect(workbenchViewSource).toContain('v-model="bookForm.practicalHours"')
    expect(workbenchViewSource).toContain('v-model="bookForm.weeklyHours"')
    expect(workbenchViewSource).toContain('v-model="bookForm.assessmentMethod"')
    expect(workbenchViewSource).toContain('v-model="bookForm.targetUnit"')
    expect(workbenchViewSource).toContain('v-model="bookForm.targetClass"')
    expect(workbenchViewSource).toContain('v-model="bookForm.researchReview"')
    expect(workbenchViewSource).toContain('v-model="bookForm.deptReview"')
  })

  it('supports create-then-save workflow for teaching plan book', () => {
    expect(workbenchViewSource).toContain('const handleSaveBook = async () => {')
    expect(workbenchViewSource).toContain('await updateTeachingPlanBook(selectedBookId.value')
    expect(workbenchViewSource).toContain('保存信息表')
  })
})
