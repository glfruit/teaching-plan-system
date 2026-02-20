import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const analyticsViewPath = resolve(__dirname, '..', 'AnalyticsView.vue')
const analyticsViewSource = readFileSync(analyticsViewPath, 'utf-8')

describe('AnalyticsView mobile layout', () => {
  it('uses mobile-safe spacing and responsive grid structures', () => {
    expect(analyticsViewSource).toContain('max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12')
    expect(analyticsViewSource).toContain('flex-col sm:flex-row')
    expect(analyticsViewSource).toContain('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')
  })

  it('keeps export controls touch-friendly on mobile', () => {
    expect(analyticsViewSource).toContain('min-h-[44px]')
    expect(analyticsViewSource).toContain('w-full sm:w-auto')
  })
})
