import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const statCardPath = resolve(__dirname, '..', 'StatCard.vue')
const statCardSource = readFileSync(statCardPath, 'utf-8')

describe('StatCard visual style', () => {
  it('uses refined accent instead of oversized top-right orb decoration', () => {
    expect(statCardSource).not.toContain('-top-8 -right-8 h-24 w-24 rounded-full')
    expect(statCardSource).toContain('absolute inset-x-0 top-0 h-0.5')
    expect(statCardSource).toContain('accentClass')
  })
})

