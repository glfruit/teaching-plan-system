import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const loginViewPath = resolve(__dirname, '..', 'LoginView.vue')
const loginViewSource = readFileSync(loginViewPath, 'utf-8')

describe('LoginView mobile layout', () => {
  it('uses stacked-on-mobile and split-on-desktop structure', () => {
    expect(loginViewSource).toContain('grid-cols-1')
    expect(loginViewSource).toContain('lg:grid-cols')
  })

  it('uses shared form components and full-width submit button', () => {
    expect(loginViewSource).toContain('BaseInput')
    expect(loginViewSource).toContain('BaseButton')
    expect(loginViewSource).toContain('full-width')
  })
})
