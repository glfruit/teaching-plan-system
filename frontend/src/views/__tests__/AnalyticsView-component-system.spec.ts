import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const analyticsViewPath = resolve(__dirname, '..', 'AnalyticsView.vue')
const analyticsViewSource = readFileSync(analyticsViewPath, 'utf-8')

describe('AnalyticsView component system usage', () => {
  it('uses shared page and card components', () => {
    expect(analyticsViewSource).toContain('PageHeader')
    expect(analyticsViewSource).toContain('BaseCard')
    expect(analyticsViewSource).toContain('BaseButton')
  })

  it('uses slate/blue palette for trend chart and stat accents', () => {
    expect(analyticsViewSource).toContain('bg-slate-500')
    expect(analyticsViewSource).toContain('text-slate-800')
  })

  it('provides analytics export controls', () => {
    expect(analyticsViewSource).toContain('导出数据')
    expect(analyticsViewSource).toContain('analytics-export-format')
    expect(analyticsViewSource).toContain('analytics-export-button')
  })

  it('provides teaching-chain consistency section with dimension filters', () => {
    expect(analyticsViewSource).toContain('教学链路一致性')
    expect(analyticsViewSource).toContain('chainFilterSemesterId')
    expect(analyticsViewSource).toContain('chainFilterCourseId')
    expect(analyticsViewSource).toContain('chainFilterWeekNo')
    expect(analyticsViewSource).toContain('refreshTeachingChainByFilter')
    expect(analyticsViewSource).toContain('一致性得分')
  })
})
