import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanStore } from './plan'

describe('Plan Store', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {}
    
    const mockStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = String(value)
      }),
      removeItem: vi.fn((key) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        for (const key in store) {
          delete store[key]
        }
      }),
      length: 0,
      key: vi.fn(),
    } as any

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true
    })

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
})
