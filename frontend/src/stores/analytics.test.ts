import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAnalyticsStore } from './analytics'

// Properly mock the API module
const { mockGetAnalytics } = vi.hoisted(() => ({
  mockGetAnalytics: vi.fn()
}))

vi.mock('../api/analytics', () => ({
  getAnalytics: mockGetAnalytics
}))

describe('Analytics Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockGetAnalytics.mockReset()
  })

  it('initializes with default state', () => {
    const store = useAnalyticsStore()
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.data).toEqual({
      workload: [],
      execution: [],
      quality: [],
      trend: []
    })
  })

  it('fetchAnalyticsData sets loading state correctly', async () => {
    const store = useAnalyticsStore()
    mockGetAnalytics.mockResolvedValue({
      workload: [],
      execution: [],
      quality: [],
      trend: []
    })

    const promise = store.fetchAnalyticsData()
    // It runs synchronously up to await, so loading should be true immediately
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
  })

  it('fetchAnalyticsData updates data on success', async () => {
    const store = useAnalyticsStore()
    const mockData = {
      workload: [{ teacherId: 't1', name: 'Teacher 1', planCount: 5 }],
      execution: [{ status: 'completed', count: 10 }],
      quality: [{ metric: 'pass_rate', value: 0.95 }],
      trend: [{ date: '2024-01-01', created: 2, completed: 1 }]
    }
    mockGetAnalytics.mockResolvedValue(mockData)

    await store.fetchAnalyticsData()
    
    expect(store.data).toEqual(mockData)
    expect(store.error).toBe(null)
  })

  it('fetchAnalyticsData handles errors', async () => {
    const store = useAnalyticsStore()
    const errorMsg = 'Network Error'
    mockGetAnalytics.mockRejectedValue(new Error(errorMsg))

    await store.fetchAnalyticsData()
    
    expect(store.error).toBe(errorMsg)
    expect(store.loading).toBe(false)
    // Data should remain empty or previous state
    expect(store.data).toEqual({
      workload: [],
      execution: [],
      quality: [],
      trend: []
    })
  })
})
