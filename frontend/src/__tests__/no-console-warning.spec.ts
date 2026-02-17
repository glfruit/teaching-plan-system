import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const srcRoot = resolve(__dirname, '..')

const collectSourceFiles = (dir: string): string[] => {
  const entries = readdirSync(dir)
  const files: string[] = []

  for (const entry of entries) {
    if (entry === '__tests__' || entry.endsWith('.test.ts') || entry.endsWith('.spec.ts')) {
      continue
    }

    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(fullPath))
      continue
    }

    if (fullPath.endsWith('.ts') || fullPath.endsWith('.vue')) {
      files.push(fullPath)
    }
  }

  return files
}

describe('console warning hygiene', () => {
  it('does not contain debug console.log or console.warn in application source files', () => {
    const files = collectSourceFiles(srcRoot)

    for (const file of files) {
      const content = readFileSync(file, 'utf-8')
      expect(content).not.toContain('console.log(')
      expect(content).not.toContain('console.warn(')
    }
  })
})
