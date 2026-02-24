import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const loginView = readFileSync(resolve(__dirname, '..', 'LoginView.vue'), 'utf-8')
const homeView = readFileSync(resolve(__dirname, '..', 'HomeView.vue'), 'utf-8')
const analyticsView = readFileSync(resolve(__dirname, '..', 'AnalyticsView.vue'), 'utf-8')
const editorView = readFileSync(resolve(__dirname, '..', 'EditorView.vue'), 'utf-8')

describe('tablet breakpoint layout', () => {
  it('keeps LoginView stacked on mobile and split on large screens', () => {
    expect(loginView).toContain('grid-cols-1')
    expect(loginView).toContain('lg:grid-cols-[1.05fr_0.95fr]')
    expect(loginView).toContain('sm:p-10')
  })

  it('keeps HomeView and AnalyticsView tablet-safe spacing and grids', () => {
    expect(homeView).toContain('px-4 sm:px-8 lg:px-12')
    expect(homeView).toContain('sm:grid-cols-2 lg:grid-cols-4')
    expect(homeView).toContain('sm:flex-row')

    expect(analyticsView).toContain('px-4 sm:px-8 lg:px-12')
    expect(analyticsView).toContain('sm:grid-cols-2 lg:grid-cols-4')
    expect(analyticsView).toContain('sm:flex-row')
  })

  it('keeps EditorView single-column on tablet and two-column on desktop', () => {
    expect(editorView).toContain('editor-layout-shell grid grid-cols-1 gap-4 lg:gap-6')
    expect(editorView).toContain("shouldRenderTemplatePanel ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1 lg:justify-items-center'")
    expect(editorView).toContain('sm:p-6')
  })
})
