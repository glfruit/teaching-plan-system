import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TrendChart from './TrendChart.vue'
import * as echarts from 'echarts'

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  use: vi.fn()
}))

describe('TrendChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(TrendChart, {
      props: {
        data: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('initializes echarts', () => {
    mount(TrendChart, {
      props: {
        data: []
      }
    })
    expect(echarts.init).toHaveBeenCalled()
  })

  it('updates on data change', async () => {
    const wrapper = mount(TrendChart, {
      props: {
        data: []
      }
    })
    const mockChart = (echarts.init as any).mock.results[0].value
    
    await wrapper.setProps({
      data: [{ date: '2023-01-01', value: 10 }]
    })
    
    expect(mockChart.setOption).toHaveBeenCalled()
  })
})
