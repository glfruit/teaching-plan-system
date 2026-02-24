import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workbenchViewPath = resolve(__dirname, '..', 'AcademicWorkbenchView.vue')
const workbenchViewSource = readFileSync(workbenchViewPath, 'utf-8')

describe('AcademicWorkbench course standard fields', () => {
  it('covers template sections and topic mapping fields', () => {
    expect(workbenchViewSource).toContain('v-model="standardForm.courseNature"')
    expect(workbenchViewSource).toContain('v-model="standardForm.courseTask"')
    expect(workbenchViewSource).toContain('v-model="standardForm.coreLiteracy"')
    expect(workbenchViewSource).toContain('v-model="standardForm.overallGoal"')
    expect(workbenchViewSource).toContain('v-model="standardForm.qualityGoal"')
    expect(workbenchViewSource).toContain('v-model="standardForm.abilityGoal"')
    expect(workbenchViewSource).toContain('v-model="standardForm.knowledgeGoal"')
    expect(workbenchViewSource).toContain('表1 教学选择建议')
    expect(workbenchViewSource).toContain('表2 学时分配建议')
    expect(workbenchViewSource).toContain('v-model="standardForm.majorLabelOne"')
    expect(workbenchViewSource).toContain('v-model="standardForm.majorLabelTwo"')
    expect(workbenchViewSource).toContain('v-model="standardForm.majorLabelThree"')
    expect(workbenchViewSource).toContain('v-model="standardForm.selectionRemark"')
    expect(workbenchViewSource).toContain('v-model="standardForm.hourRemark"')
    expect(workbenchViewSource).toContain('v-model="standardForm.hourTotalMajorOne"')
    expect(workbenchViewSource).toContain('v-model="standardForm.hourTotalMajorTwo"')
    expect(workbenchViewSource).toContain('v-model="standardForm.hourTotalMajorThree"')
    expect(workbenchViewSource).toContain('v-model="standardForm.topicRecommendedHours"')
    expect(workbenchViewSource).toContain('v-model="standardForm.topicIdeologicalElements"')
    expect(workbenchViewSource).toContain('v-model="standardForm.topicIntegrationMethods"')
    expect(workbenchViewSource).toContain('v-model="standardForm.topicApplicableMajors"')
    expect(workbenchViewSource).toContain('v-model="standardForm.topicObjectiveMapping"')
  })

  it('supports create-then-save workflow for template-aligned standard', () => {
    expect(workbenchViewSource).toContain('contentJson: buildStandardTemplateContentFromForm()')
    expect(workbenchViewSource).toContain('htmlContent: createCourseStandardTemplateHtml(buildStandardTemplateContentFromForm())')
    expect(workbenchViewSource).toContain('modules: buildStandardModulesFromForm()')
    expect(workbenchViewSource).toContain('const handleSaveStandard = async () => {')
    expect(workbenchViewSource).toContain('await updateCourseStandard(selectedStandardId.value')
    expect(workbenchViewSource).toContain('hasMajorCellMeaningfulValue')
    expect(workbenchViewSource).toContain('parseMaxHoursFromMajorCells')
  })
})
