import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const homeViewPath = resolve(__dirname, '..', 'HomeView.vue')
const homeViewSource = readFileSync(homeViewPath, 'utf-8')

describe('HomeView component system usage', () => {
  it('uses shared layout and ui components', () => {
    expect(homeViewSource).toContain('PageHeader')
    expect(homeViewSource).toContain('StatCard')
    expect(homeViewSource).toContain('BaseCard')
    expect(homeViewSource).toContain('BaseBadge')
  })

  it('keeps touch targets at least 44px in mobile actions', () => {
    expect(homeViewSource).toContain('min-h-[44px]')
  })

  it('contains export preview dialog structure', () => {
    expect(homeViewSource).toContain('导出前预检')
    expect(homeViewSource).toContain('继续导出')
    expect(homeViewSource).toContain('isExportPreviewVisible')
  })

  it('provides quick status actions for publish and archive', () => {
    expect(homeViewSource).toContain('发布')
    expect(homeViewSource).toContain('归档')
    expect(homeViewSource).toContain('publishPlan')
    expect(homeViewSource).toContain('archivePlan')
  })

  it('supports duplicating plan from list actions', () => {
    expect(homeViewSource).toContain('复制')
    expect(homeViewSource).toContain('duplicatePlan')
  })
})
