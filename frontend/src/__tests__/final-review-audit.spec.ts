import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf-8')

const loginView = read('views/LoginView.vue')
const homeView = read('views/HomeView.vue')
const analyticsView = read('views/AnalyticsView.vue')
const editorView = read('views/EditorView.vue')
const baseButton = read('components/ui/BaseButton.vue')
const baseCard = read('components/ui/BaseCard.vue')
const baseInput = read('components/ui/BaseInput.vue')
const indexHtml = read('../index.html')
const variablesCss = read('styles/variables.css')

describe('final review audit', () => {
  it('applies warm palette in key pages', () => {
    expect(loginView).toContain('amber-')
    expect(homeView).toContain('amber-')
    expect(analyticsView).toContain('amber-')
    expect(editorView).toContain('amber-')
  })

  it('loads and defines required font system', () => {
    expect(indexHtml).toContain('Noto+Serif+SC')
    expect(indexHtml).toContain('Inter')
    expect(variablesCss).toContain('--font-display')
    expect(variablesCss).toContain('--font-body')
  })

  it('keeps core interaction effects', () => {
    expect(baseButton).toContain('active:scale-95')
    expect(baseCard).toContain('hover:-translate-y-1')
    expect(baseInput).toContain('focus:ring-2')
  })

  it('keeps responsive classes in key pages', () => {
    expect(loginView).toContain('sm:')
    expect(homeView).toContain('sm:')
    expect(analyticsView).toContain('sm:')
    expect(editorView).toContain('sm:')
  })
})
