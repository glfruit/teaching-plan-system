import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const editorViewPath = resolve(__dirname, '..', 'EditorView.vue')
const editorViewSource = readFileSync(editorViewPath, 'utf-8')

describe('EditorView shortcut config dialog', () => {
  it('renders configurable shortcut actions and key options', () => {
    expect(editorViewSource).toContain('SHORTCUT_ACTIONS')
    expect(editorViewSource).toContain('SHORTCUT_KEY_OPTIONS')
    expect(editorViewSource).toContain("id: 'insertTable'")
    expect(editorViewSource).toContain("id: 'deleteTable'")
    expect(editorViewSource).toContain(':shortcut-config="tiptapShortcutConfig"')
    expect(editorViewSource).toContain('v-model="shortcutDraftConfig[action.id].key"')
    expect(editorViewSource).toContain('v-model="shortcutDraftConfig[action.id].shift"')
    expect(editorViewSource).toContain('formatShortcutDisplay(shortcutDraftConfig[action.id])')
  })

  it('shows conflict warning and blocks saving when shortcuts collide', () => {
    expect(editorViewSource).toContain('hasShortcutConflicts')
    expect(editorViewSource).toContain('检测到快捷键冲突')
    expect(editorViewSource).toContain('shortcutConflictGroups')
    expect(editorViewSource).toContain('isShortcutActionConflicted(action.id)')
    expect(editorViewSource).toContain("border-red-200 bg-red-50/60")
    expect(editorViewSource).toContain(':disabled="hasShortcutConflicts"')
    expect(editorViewSource).toContain('存在快捷键冲突，请先调整后再保存。')
  })

  it('persists shortcut config into local storage and reloads on mount', () => {
    expect(editorViewSource).toContain('EDITOR_SHORTCUT_STORAGE_KEY')
    expect(editorViewSource).toContain('loadShortcutConfigFromStorage()')
    expect(editorViewSource).toContain('window.localStorage.getItem(EDITOR_SHORTCUT_STORAGE_KEY)')
    expect(editorViewSource).toContain('window.localStorage.setItem(EDITOR_SHORTCUT_STORAGE_KEY')
    expect(editorViewSource).toContain('normalizeShortcutConfig')
  })
})
