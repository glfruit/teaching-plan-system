import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const editorViewPath = resolve(__dirname, '..', 'EditorView.vue')
const editorViewSource = readFileSync(editorViewPath, 'utf-8')
const tipTapEditorPath = resolve(__dirname, '..', '..', 'components', 'TipTapEditor.vue')
const tipTapEditorSource = readFileSync(tipTapEditorPath, 'utf-8')

describe('EditorView form and editor visual system', () => {
  it('uses BaseInput for core metadata fields in basic info card', () => {
    expect(editorViewSource).toContain("import BaseInput from '../components/ui/BaseInput.vue'")
    expect(editorViewSource).toContain('<BaseInput')
    expect(editorViewSource).toContain('v-model="form.title"')
    expect(editorViewSource).toContain('v-model="form.courseName"')
    expect(editorViewSource).toContain('v-model="form.className"')
    expect(editorViewSource).toContain('v-model="durationText"')
    expect(editorViewSource).toContain('v-model="form.methods"')
    expect(editorViewSource).toContain('v-model="form.resources"')
  })

  it('uses warm themed shell classes for TipTap editor container', () => {
    expect(tipTapEditorSource).toContain('tiptap-warm-shell')
    expect(tipTapEditorSource).toContain('tiptap-warm-toolbar')
    expect(tipTapEditorSource).toContain('tiptap-warm-content')
  })
})
