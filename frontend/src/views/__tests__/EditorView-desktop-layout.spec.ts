import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const editorViewPath = resolve(__dirname, '..', 'EditorView.vue')
const editorViewSource = readFileSync(editorViewPath, 'utf-8')

describe('EditorView desktop two-column layout', () => {
  it('uses responsive two-column shell with a fixed-width template sidebar', () => {
    expect(editorViewSource).toContain('editor-layout-shell')
    expect(editorViewSource).toContain('lg:grid-cols-[minmax(0,1fr)_320px]')
  })

  it('renders template workspace in a sticky sidebar on desktop', () => {
    expect(editorViewSource).toContain('aria-label="模板工作台"')
    expect(editorViewSource).toContain('editor-template-panel')
    expect(editorViewSource).toContain('lg:sticky lg:top-24')
  })
})
