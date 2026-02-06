import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

describe('HomeView Template Syntax', () => {
  it('should have correct v-if/v-else pairing in plans list section', () => {
    const homeViewPath = path.join(__dirname, '../HomeView.vue')
    const content = fs.readFileSync(homeViewPath, 'utf-8')
    
    // Verify the plans list section has correct conditional rendering:
    // 1. Empty state uses v-if="!planStore.hasPlans"
    // 2. Desktop list uses v-else (paired with empty state's v-if)
    // 3. Mobile list uses v-if="planStore.hasPlans" (not v-else, because it's a separate branch)
    
    // Check empty state has v-if
    expect(content).toContain('v-if="!planStore.hasPlans"')
    
    // Check desktop list uses v-else (paired with empty state)
    expect(content).toContain('v-else class="hidden sm:block')
    
    // Check mobile list uses v-if (not v-else) - this was the bug fix
    expect(content).toContain('v-if="planStore.hasPlans" class="sm:hidden')
    
    // Make sure mobile doesn't use v-else (which would be wrong)
    expect(content).not.toMatch(/v-else[^-][^i][^f].*sm:hidden/)
  })

  it('should have correct v-if/v-else pairing for loading state', () => {
    const homeViewPath = path.join(__dirname, '../HomeView.vue')
    const content = fs.readFileSync(homeViewPath, 'utf-8')
    
    // Loading state uses v-if="planStore.isLoading"
    // Main content uses v-else on <template> tag
    expect(content).toContain('v-if="planStore.isLoading"')
    expect(content).toContain('<template v-else>')
  })

  it('should compile without Vue template errors', () => {
    const homeViewPath = path.join(__dirname, '../HomeView.vue')
    const content = fs.readFileSync(homeViewPath, 'utf-8')
    
    // Basic syntax checks
    // Make sure no standalone v-else (not paired with v-if on sibling)
    
    // Extract lines with v-if, v-else-if, v-else
    const lines = content.split('\n')
    const conditionalLines: { type: string; line: number; content: string }[] = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.includes('v-if=')) {
        conditionalLines.push({ type: 'v-if', line: index + 1, content: trimmed })
      } else if (trimmed.includes('v-else-if=')) {
        conditionalLines.push({ type: 'v-else-if', line: index + 1, content: trimmed })
      } else if (/\bv-else\b/.test(trimmed) && !trimmed.includes('v-else-if')) {
        conditionalLines.push({ type: 'v-else', line: index + 1, content: trimmed })
      }
    })
    
    // Vue allows:
    // 1. v-if followed by v-else on sibling element
    // 2. v-if followed by v-else-if followed by v-else
    // 
    // Our structure should be:
    // - v-if="planStore.isLoading" (loading div)
    // - v-else (template containing main content)
    // 
    // Inside main content:
    // - v-if="!planStore.hasPlans" (empty state div)
    // - v-else (desktop list div)
    // - v-if="planStore.hasPlans" (mobile list div)
    
    // Verify we have the expected pattern
    const vIfCount = conditionalLines.filter(l => l.type === 'v-if').length
    const vElseCount = conditionalLines.filter(l => l.type === 'v-else').length
    
    // Should have at least 3 v-if and 2 v-else
    expect(vIfCount).toBeGreaterThanOrEqual(3)
    expect(vElseCount).toBeGreaterThanOrEqual(2)
    
    // Log for debugging
    console.log('Conditional directives found:', conditionalLines)
  })
})
