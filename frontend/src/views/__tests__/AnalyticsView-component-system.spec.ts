import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const analyticsViewPath = resolve(__dirname, '..', 'AnalyticsView.vue')
const analyticsViewSource = readFileSync(analyticsViewPath, 'utf-8')

describe('AnalyticsView component system usage', () => {
  it('uses shared page and card components', () => {
    expect(analyticsViewSource).toContain('PageHeader')
    expect(analyticsViewSource).toContain('BaseCard')
  })

  it('uses slate/blue palette for trend chart and stat accents', () => {
    expect(analyticsViewSource).toContain('bg-slate-500')
    expect(analyticsViewSource).toContain('text-slate-800')
  })
})
