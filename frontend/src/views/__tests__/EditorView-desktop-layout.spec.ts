import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const editorViewPath = resolve(__dirname, '..', 'EditorView.vue')
const editorViewSource = readFileSync(editorViewPath, 'utf-8')

describe('EditorView desktop two-column layout', () => {
  it('uses responsive two-column shell with a fixed-width template sidebar', () => {
    expect(editorViewSource).toContain('editor-layout-shell')
    expect(editorViewSource).toContain('lg:grid-cols-[minmax(0,1fr)_320px]')
    expect(editorViewSource).toContain('lg:justify-items-center')
  })

  it('renders template workspace in a sticky sidebar on desktop', () => {
    expect(editorViewSource).toContain('aria-label="模板工作台"')
    expect(editorViewSource).toContain('editor-template-panel')
    expect(editorViewSource).toContain('lg:sticky lg:top-24')
  })

  it('centers the main editor form when template sidebar is collapsed', () => {
    expect(editorViewSource).toContain("showTemplatePanel ? '' : 'w-full max-w-4xl'")
    expect(editorViewSource).toContain("showTemplatePanel ? '' : 'mx-auto w-full max-w-4xl'")
  })

  it('keeps header title and draft status within navbar bounds', () => {
    expect(editorViewSource).toContain('flex min-w-0 items-center gap-3 sm:gap-4')
    expect(editorViewSource).toContain('text-base sm:text-lg font-semibold text-slate-800 truncate')
    expect(editorViewSource).toContain('hidden lg:block')
    expect(editorViewSource).toContain('hidden xl:block')
  })

  it('uses icon-first buttons for template and draft actions in header', () => {
    expect(editorViewSource).toContain("class=\"inline-flex items-center gap-1.5 px-4 py-2")
    expect(editorViewSource).toContain("<span>{{ showTemplatePanel ? '收起模板' : '模板库' }}</span>")
    expect(editorViewSource).toContain('>草稿箱</span>')
  })

  it('adds an icon to the writing assistant title', () => {
    expect(editorViewSource).toContain('inline-flex items-center gap-2 text-base font-semibold text-slate-800')
    expect(editorViewSource).toContain('>编写助手</span>')
  })

  it('provides keyboard shortcut help entry and dialog', () => {
    expect(editorViewSource).toContain('快捷键')
    expect(editorViewSource).toContain('showShortcutDialog = ref(false)')
    expect(editorViewSource).toContain('常用快捷键')
    expect(editorViewSource).toContain('Ctrl / Cmd + S')
  })
})
