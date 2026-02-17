import { describe, expect, test } from 'bun:test'
import { resolvePort } from './server-config'

describe('resolvePort', () => {
  test('uses default port when env is empty', () => {
    expect(resolvePort(undefined)).toBe(3000)
    expect(resolvePort('')).toBe(3000)
  })

  test('returns configured port when valid', () => {
    expect(resolvePort('12368')).toBe(12368)
  })

  test('falls back to default when port is invalid', () => {
    expect(resolvePort('abc')).toBe(3000)
    expect(resolvePort('0')).toBe(3000)
    expect(resolvePort('70000')).toBe(3000)
  })
})
