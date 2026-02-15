import { test, expect } from 'bun:test'

test('vitest suite passes', async () => {
  const proc = Bun.spawn(['bun', 'run', 'test'], {
    cwd: `${import.meta.dir}/..`,
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  if (code !== 0) {
    throw new Error(`vitest failed with exit code ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`)
  }

  expect(code).toBe(0)
})
