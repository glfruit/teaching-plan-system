import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const appPath = resolve(__dirname, '..', 'App.vue')
const mainPath = resolve(__dirname, '..', 'main.ts')
const variablesPath = resolve(__dirname, '..', 'styles', 'variables.css')

const appSource = readFileSync(appPath, 'utf-8')
const mainSource = readFileSync(mainPath, 'utf-8')
const variablesSource = readFileSync(variablesPath, 'utf-8')

describe('app transition and design system foundation', () => {
  it('wraps RouterView with page transition classes', () => {
    expect(appSource).toContain('<Transition')
    expect(appSource).toContain('mode="out-in"')
    expect(appSource).toContain('enter-active-class="transition-all duration-300 ease-out"')
  })

  it('imports design tokens stylesheet from main entry', () => {
    expect(mainSource).toContain("import './styles/variables.css'")
  })

  it('defines required warm design tokens', () => {
    expect(variablesSource).toContain('--color-primary-600')
    expect(variablesSource).toContain('--text-primary')
    expect(variablesSource).toContain('--bg-cream')
    expect(variablesSource).toContain('--shadow-warm')
    expect(variablesSource).toContain('--font-display')
  })
})
