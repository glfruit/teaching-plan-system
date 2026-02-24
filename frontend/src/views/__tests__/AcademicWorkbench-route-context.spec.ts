import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workbenchViewPath = resolve(__dirname, '..', 'AcademicWorkbenchView.vue')
const workbenchViewSource = readFileSync(workbenchViewPath, 'utf-8')

describe('AcademicWorkbench route context', () => {
  it('accepts editor warning query context and applies tab/form routing', () => {
    expect(workbenchViewSource).toContain('useRoute')
    expect(workbenchViewSource).toContain('applyWorkbenchRouteContext')
    expect(workbenchViewSource).toContain("resolveTabFromQuery(route.query.tab)")
    expect(workbenchViewSource).toContain("routeContextSource.value === 'editor-lesson-warning'")
    expect(workbenchViewSource).toContain("routeContextSource.value === 'admin-offering'")
    expect(workbenchViewSource).toContain("routeContextSource.value === 'home-plan-context'")
    expect(workbenchViewSource).toContain('routeContextDeliveryPlanId')
    expect(workbenchViewSource).toContain('routeContextBookId')
    expect(workbenchViewSource).toContain('routeContextCourseOfferingId')
    expect(workbenchViewSource).toContain('routeContextWeekNo')
    expect(workbenchViewSource).toContain('routeContextLessonId')
    expect(workbenchViewSource).toContain('clearWorkbenchContext')
    expect(workbenchViewSource).toContain("path: '/workbench'")
  })

  it('defines section anchors for contextual scrolling', () => {
    expect(workbenchViewSource).toContain('workbench-section-standards')
    expect(workbenchViewSource).toContain('workbench-section-delivery')
    expect(workbenchViewSource).toContain('workbench-section-books')
    expect(workbenchViewSource).toContain('workbench-section-lessons')
    expect(workbenchViewSource).toContain('workbench-section-courseware')
    expect(workbenchViewSource).toContain('workbench-section-templates')
    expect(workbenchViewSource).toContain('workbench-section-traceability')
    expect(workbenchViewSource).toContain('scrollToWorkbenchSection')
  })
})
