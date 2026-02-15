import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanStore, normalizeTeachingLayoutHtml, normalizeTeachingPlanContent } from './plan'

describe('Plan Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = usePlanStore()
      
      expect(store.plans).toEqual([])
      expect(store.currentPlan).toBeNull()
      expect(store.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      })
      expect(store.isLoading).toBe(false)
      expect(store.isSaving).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should return false for hasPlans when empty', () => {
      const store = usePlanStore()
      expect(store.hasPlans).toBe(false)
    })

    it('should return true for hasPlans when has items', () => {
      const store = usePlanStore()
      store.plans = [
        {
          id: '1',
          title: 'Test Plan',
          courseName: 'Test Course',
          className: 'Test Class',
          duration: 90,
          objectives: '',
          keyPoints: '',
          process: '',
          blackboard: '',
          reflection: '',
          methods: '',
          resources: '',
          htmlContent: '',
          status: 'DRAFT',
        }
      ]
      expect(store.hasPlans).toBe(true)
    })

    it('should return correct isDraft status', () => {
      const store = usePlanStore()
      expect(store.isDraft).toBe(false)

      store.currentPlan = {
        id: '1',
        title: 'Test',
        courseName: 'Course',
        className: 'Class',
        duration: 90,
        status: 'DRAFT',
      } as any

      expect(store.isDraft).toBe(true)
      expect(store.isPublished).toBe(false)
    })

    it('should return correct isPublished status', () => {
      const store = usePlanStore()
      store.currentPlan = {
        id: '1',
        title: 'Test',
        courseName: 'Course',
        className: 'Class',
        duration: 90,
        status: 'PUBLISHED',
      } as any

      expect(store.isPublished).toBe(true)
      expect(store.isDraft).toBe(false)
    })
  })

  describe('resetCurrentPlan', () => {
    it('should reset current plan and error', () => {
      const store = usePlanStore()
      store.currentPlan = { id: '1' } as any
      store.error = 'Some error'

      store.resetCurrentPlan()

      expect(store.currentPlan).toBeNull()
      expect(store.error).toBeNull()
    })
  })

  describe('teaching layout compatibility', () => {
    it('keeps data-node-type markers in html payload', () => {
      const html = '<div data-node-type="lessonTimeline" data-minutes="10"></div>'
      expect(normalizeTeachingLayoutHtml(html)).toContain('data-node-type="lessonTimeline"')
    })

    it('normalizes rich text fields while keeping layout blocks', () => {
      const normalized = normalizeTeachingPlanContent({
        process: '<div data-node-type="goalActivityAssessmentGrid"></div>',
      })
      expect(normalized.process).toContain('data-node-type="goalActivityAssessmentGrid"')
    })

    it('converts unknown contentJson node to readonly placeholder and preserves raw payload', () => {
      const normalized = normalizeTeachingPlanContent({
        contentJson: {
          process: {
            type: 'doc',
            content: [
              {
                type: 'unknownTeachingNode',
                attrs: { title: '保留文本', score: 1 },
                content: [{ type: 'text', text: '原始内容' }],
              },
            ],
          } as any,
        },
      })

      const processJson = normalized.contentJson?.process as any
      expect(processJson.content?.[0]?.type).toBe('unknownNodePlaceholder')
      expect(processJson.content?.[0]?.attrs?.originalType).toBe('unknownTeachingNode')
      expect(processJson.content?.[0]?.attrs?.summary).toContain('保留文本')
      expect(JSON.parse(processJson.content?.[0]?.attrs?.rawJson)).toMatchObject({
        type: 'unknownTeachingNode',
        attrs: { title: '保留文本', score: 1 },
      })
    })
  })
})
