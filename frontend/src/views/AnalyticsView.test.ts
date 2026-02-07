import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AnalyticsView from './AnalyticsView.vue'
import { useAnalyticsStore } from '../stores/analytics'

// Mock chart components
vi.mock('../components/analytics/WorkloadChart.vue', () => ({
  default: { template: '<div class="workload-chart"></div>' }
}))
vi.mock('../components/analytics/ExecutionChart.vue', () => ({
  default: { template: '<div class="execution-chart"></div>' }
}))
vi.mock('../components/analytics/QualityChart.vue', () => ({
  default: { template: '<div class="quality-chart"></div>' }
}))
vi.mock('../components/analytics/TrendChart.vue', () => ({
  default: { template: '<div class="trend-chart"></div>' }
}))

describe('AnalyticsView', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    wrapper = mount(AnalyticsView, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            analytics: {
              loading: false,
              error: null,
              data: {
                workload: [],
                execution: [],
                quality: [],
                trend: []
              }
            }
          }
        })]
      }
    })
    store = useAnalyticsStore()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('Analytics Dashboard')
  })

  it('fetches data on mount', () => {
    expect(store.fetchAnalyticsData).toHaveBeenCalled()
  })

  it('renders all charts', () => {
    expect(wrapper.find('.workload-chart').exists()).toBe(true)
    expect(wrapper.find('.execution-chart').exists()).toBe(true)
    expect(wrapper.find('.quality-chart').exists()).toBe(true)
    expect(wrapper.find('.trend-chart').exists()).toBe(true)
  })

  it('shows loading state', async () => {
    store.loading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('shows error state', async () => {
    store.error = 'Failed to fetch'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.error').text()).toContain('Failed to fetch')
  })
})
