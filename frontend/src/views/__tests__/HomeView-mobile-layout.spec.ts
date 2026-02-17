import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const homeViewPath = resolve(__dirname, '..', 'HomeView.vue')
const homeViewSource = readFileSync(homeViewPath, 'utf-8')

describe('HomeView mobile layout', () => {
  it('uses mobile-safe grid and search layout to avoid horizontal overflow', () => {
    expect(homeViewSource).toContain('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')
    expect(homeViewSource).toContain('flex-col sm:flex-row')
    expect(homeViewSource).toContain('w-full sm:w-auto')
  })

  it('provides mobile quick actions for core operations', () => {
    expect(homeViewSource).toContain('mobile-quick-actions')
    expect(homeViewSource).toContain('新建教案')
    expect(homeViewSource).toContain('分析看板')
    expect(homeViewSource).toContain('退出登录')
  })
})
