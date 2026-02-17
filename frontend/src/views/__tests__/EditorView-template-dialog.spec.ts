import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const editorViewPath = resolve(__dirname, '..', 'EditorView.vue')
const editorViewSource = readFileSync(editorViewPath, 'utf-8')

const templateDialogSection = editorViewSource.match(
  /v-if="showTemplateEditDialog"[\s\S]*?<!-- Basic Info -->/
)?.[0]

describe('EditorView template edit dialog fields', () => {
  it('contains full template form bindings for plan metadata', () => {
    expect(templateDialogSection).toBeTruthy()

    const requiredBindings = [
      'v-model="templateEditTitle"',
      'v-model="templateEditForm.courseName"',
      'v-model="templateEditForm.className"',
      'v-model.number="templateEditForm.duration"',
      'v-model="templateEditForm.methods"',
      'v-model="templateEditForm.resources"',
    ]

    for (const binding of requiredBindings) {
      expect(templateDialogSection).toContain(binding)
    }
  })

  it('contains full template form bindings for rich-text sections', () => {
    expect(templateDialogSection).toBeTruthy()

    const requiredRichBindings = [
      'v-model="templateEditForm.objectives"',
      'v-model="templateEditForm.keyPoints"',
      'v-model="templateEditForm.process"',
      'v-model="templateEditForm.blackboard"',
      'v-model="templateEditForm.reflection"',
    ]

    for (const binding of requiredRichBindings) {
      expect(templateDialogSection).toContain(binding)
    }
  })
})
