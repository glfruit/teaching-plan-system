import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const adminCenterPath = resolve(__dirname, '..', 'AdminCenterView.vue')
const adminCenterSource = readFileSync(adminCenterPath, 'utf-8')

describe('AdminCenter migration queue controls', () => {
  it('renders editable mapping confirmation parameters', () => {
    expect(adminCenterSource).toContain('getMappingDraft(mapping.id).courseOfferingId')
    expect(adminCenterSource).toContain('getMappingDraft(mapping.id).semesterId')
    expect(adminCenterSource).toContain('getMappingDraft(mapping.id).note')
    expect(adminCenterSource).toContain('setMappingDraftCourseOffering')
    expect(adminCenterSource).toContain('setMappingDraftSemester')
    expect(adminCenterSource).toContain('setMappingDraftNote')
  })

  it('submits selected manual parameters when confirming or rejecting mappings', () => {
    expect(adminCenterSource).toContain('const mappingDrafts = ref<Record<string, MappingDraft>>({})')
    expect(adminCenterSource).toContain('confirmLegacyMapping(mapping.id, {')
    expect(adminCenterSource).toContain('courseOfferingId: draft.courseOfferingId || undefined')
    expect(adminCenterSource).toContain('semesterId: draft.semesterId || undefined')
    expect(adminCenterSource).toContain('note: draft.note || undefined')
    expect(adminCenterSource).toContain('rejectLegacyMapping(mapping.id, draft.note || undefined)')
  })

  it('supports migration queue status filter and shows legacy plan context', () => {
    expect(adminCenterSource).toContain('v-model="mappingStatusFilter"')
    expect(adminCenterSource).toContain("status: mappingStatusFilter.value === 'ALL' ? undefined : mappingStatusFilter.value")
    expect(adminCenterSource).toContain('mapping.legacyTeachingPlan?.title')
    expect(adminCenterSource).toContain('mapping.legacyTeachingPlan?.courseName')
    expect(adminCenterSource).toContain('mapping.legacyTeachingPlan?.className')
  })
})
