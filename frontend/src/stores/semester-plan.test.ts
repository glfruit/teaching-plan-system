import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSemesterPlanStore } from './semester-plan'

describe('Semester Plan Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useSemesterPlanStore()
      
      expect(store.plans).toEqual([])
      expect(store.currentPlan).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.isSaving).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should return false for hasPlans when empty', () => {
      const store = useSemesterPlanStore()
      expect(store.hasPlans).toBe(false)
    })

    it('should return true for hasPlans when has items', () => {
      const store = useSemesterPlanStore()
      store.plans = [
        {
          id: '1',
          courseName: 'Test Course',
          semester: '2025-1',
          totalWeeks: 18,
          weeklyHours: 4,
          startDate: '2025-09-01',
          status: 'DRAFT',
          weeklyPlans: []
        }
      ]
      expect(store.hasPlans).toBe(true)
    })

    it('should return correct isDraft status', () => {
      const store = useSemesterPlanStore()
      expect(store.isDraft).toBe(false)

      store.currentPlan = {
        id: '1',
        courseName: 'Test',
        semester: '2025-1',
        totalWeeks: 18,
        weeklyHours: 4,
        status: 'DRAFT',
        weeklyPlans: []
      } as any

      expect(store.isDraft).toBe(true)
      expect(store.isActive).toBe(false)
    })

    it('should return correct isActive status', () => {
      const store = useSemesterPlanStore()
      store.currentPlan = {
        id: '1',
        courseName: 'Test',
        semester: '2025-1',
        totalWeeks: 18,
        weeklyHours: 4,
        status: 'ACTIVE',
        weeklyPlans: []
      } as any

      expect(store.isActive).toBe(true)
      expect(store.isDraft).toBe(false)
    })
  })

  describe('resetCurrentPlan', () => {
    it('should reset current plan and error', () => {
      const store = useSemesterPlanStore()
      store.currentPlan = { id: '1' } as any
      store.error = 'Some error'

      store.resetCurrentPlan()

      expect(store.currentPlan).toBeNull()
      expect(store.error).toBeNull()
    })
  })
})
