import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const navBarPath = resolve(__dirname, '..', 'NavBar.vue')
const navBarSource = readFileSync(navBarPath, 'utf-8')

describe('NavBar mobile layout', () => {
  it('provides a dedicated mobile action row and menu drawer', () => {
    expect(navBarSource).toContain('md:hidden')
    expect(navBarSource).toContain('mobile-action-row')
    expect(navBarSource).toContain('mobile-user-drawer')
    expect(navBarSource).toContain('打开导航菜单')
    expect(navBarSource).toContain('退出登录')
  })

  it('does not allow the brand area to occupy the full row on mobile', () => {
    expect(navBarSource).not.toContain('min-w-0 flex-1')
  })

  it('keeps mobile menu trigger in normal flow to avoid edge clipping', () => {
    expect(navBarSource).not.toContain('ml-auto h-9 w-9')
  })
})
