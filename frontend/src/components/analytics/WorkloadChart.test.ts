import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkloadChart from './WorkloadChart.vue'
import * as echarts from 'echarts'

// Mock echarts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  use: vi.fn()
}))

describe('WorkloadChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(WorkloadChart, {
      props: {
        data: []
      }
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('initializes echarts on mount', () => {
    mount(WorkloadChart, {
      props: {
        data: []
      }
    })
    expect(echarts.init).toHaveBeenCalled()
  })

  it('updates chart when data changes', async () => {
    const wrapper = mount(WorkloadChart, {
      props: {
        data: []
      }
    })
    
    const mockChart = (echarts.init as any).mock.results[0].value
    
    await wrapper.setProps({
      data: [{ teacherId: 't1', name: 'Teacher 1', planCount: 5 }]
    })

    expect(mockChart.setOption).toHaveBeenCalled()
  })
})
