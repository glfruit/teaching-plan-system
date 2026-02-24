import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const adminCenterPath = resolve(__dirname, '..', 'AdminCenterView.vue')
const adminCenterSource = readFileSync(adminCenterPath, 'utf-8')

describe('AdminCenter offering workbench shortcut', () => {
  it('provides a direct action to open workbench with offering context', () => {
    expect(adminCenterSource).toContain('openWorkbenchForOffering')
    expect(adminCenterSource).toContain('进入链路')
    expect(adminCenterSource).toContain("path: '/workbench'")
    expect(adminCenterSource).toContain("source: 'admin-offering'")
    expect(adminCenterSource).toContain("courseOfferingId: offeringId")
  })
})
