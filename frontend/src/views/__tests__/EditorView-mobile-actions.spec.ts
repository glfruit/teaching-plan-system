import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const editorViewPath = resolve(__dirname, '..', 'EditorView.vue')
const editorViewSource = readFileSync(editorViewPath, 'utf-8')

describe('EditorView mobile quick actions', () => {
  it('renders a sticky mobile action bar with primary actions', () => {
    expect(editorViewSource).toContain('mobile-quick-actions')
    expect(editorViewSource).toContain('sm:hidden fixed bottom-0')
    expect(editorViewSource).toContain('模板库')
    expect(editorViewSource).toContain('保存草稿')
    expect(editorViewSource).toContain('草稿箱')
    expect(editorViewSource).toContain('更多操作')
  })

  it('provides local draft center dialog with history restore controls', () => {
    expect(editorViewSource).toContain('本地草稿箱')
    expect(editorViewSource).toContain('共 {{ localDraftHistory.length }} 条本地草稿')
    expect(editorViewSource).toContain('恢复草稿')
    expect(editorViewSource).toContain('清空草稿')
  })

  it('uses a mobile-safe two-row layout for quick actions', () => {
    expect(editorViewSource).toContain('px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] grid grid-cols-1 gap-2')
  })

  it('keeps unsaved-draft protection hooks for navigation and refresh', () => {
    expect(editorViewSource).toContain('onBeforeRouteLeave')
    expect(editorViewSource).toContain("window.addEventListener('beforeunload', handleBeforeUnload)")
    expect(editorViewSource).toContain("window.removeEventListener('beforeunload', handleBeforeUnload)")
    expect(editorViewSource).toContain('当前教案有未保存更改，确定离开吗？')
    expect(editorViewSource).toContain('persistLocalDraftBeforeLeave')
    expect(editorViewSource).toContain('shouldPersistLocalDraftOnLeave')
  })
})
