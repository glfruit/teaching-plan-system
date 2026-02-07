import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExecutionChart from './ExecutionChart.vue'
import * as echarts from 'echarts'

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  use: vi.fn()
}))

describe('ExecutionChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(ExecutionChart, {
      props: {
        data: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('initializes echarts', () => {
    mount(ExecutionChart, {
      props: {
        data: []
      }
    })
    expect(echarts.init).toHaveBeenCalled()
  })

  it('updates on data change', async () => {
    const wrapper = mount(ExecutionChart, {
      props: {
        data: []
      }
    })
    const mockChart = (echarts.init as any).mock.results[0].value
    
    await wrapper.setProps({
      data: [{ status: 'completed', count: 10 }]
    })
    
    expect(mockChart.setOption).toHaveBeenCalled()
  })
})
