import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const homeViewPath = resolve(__dirname, '..', 'HomeView.vue')
const homeViewSource = readFileSync(homeViewPath, 'utf-8')

describe('HomeView workbench context shortcut', () => {
  it('opens workbench with plan traceability context when compatibility fields exist', () => {
    expect(homeViewSource).toContain('hasWorkbenchContext(plan)')
    expect(homeViewSource).toContain('openPlanWorkbench(plan.id!')
    expect(homeViewSource).toContain("source: 'home-plan-context'")
    expect(homeViewSource).toContain("path: '/workbench'")
    expect(homeViewSource).toContain('query.deliveryPlanId = deliveryPlanId')
  })
})
