import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workbenchViewPath = resolve(__dirname, '..', 'AcademicWorkbenchView.vue')
const workbenchViewSource = readFileSync(workbenchViewPath, 'utf-8')

describe('AcademicWorkbench delivery plan fields', () => {
  it('covers template-required weekly columns in delivery form', () => {
    expect(workbenchViewSource).toContain('selectedDeliveryCourseName')
    expect(workbenchViewSource).toContain('课程名称（自动）')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.sequenceNo"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.weekNo"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.hours"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.grouping"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.teachingMode"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.unitOrTask"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.ideologicalElements"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.integrationMethod"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.theoreticalPoints"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.practiceProject"')
    expect(workbenchViewSource).toContain('v-model="deliveryForm.practiceInstructor"')
    expect(workbenchViewSource).toContain('关联课程标准条目')
    expect(workbenchViewSource).toContain('deliveryForm.linkedStandardTopicIds')
    expect(workbenchViewSource).toContain('handleToggleDeliveryStandardTopic(topic.id)')
    expect(workbenchViewSource).toContain('handleSelectAllDeliveryStandardTopics')
    expect(workbenchViewSource).toContain('handleClearDeliveryStandardTopics')
    expect(workbenchViewSource).toContain('handleQueueDeliveryWeekDraft')
    expect(workbenchViewSource).toContain('同步周次队列')
  })

  it('supports staged editing with meta save and week queue sync', () => {
    expect(workbenchViewSource).toContain('contentJson: buildDeliveryTemplateMetaFromForm()')
    expect(workbenchViewSource).toContain('const handleSaveDeliveryPlanMeta = async () => {')
    expect(workbenchViewSource).toContain('const handleSyncDeliveryWeekDrafts = async () => {')
    expect(workbenchViewSource).toContain('await updateDeliveryPlanWeeks(')
    expect(workbenchViewSource).toContain('已关联课程标准时，每周需至少关联 1 个条目')
  })
})
