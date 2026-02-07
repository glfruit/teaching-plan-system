import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QualityChart from './QualityChart.vue'
import * as echarts from 'echarts'

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  use: vi.fn()
}))

describe('QualityChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(QualityChart, {
      props: {
        data: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('initializes echarts', () => {
    mount(QualityChart, {
      props: {
        data: []
      }
    })
    expect(echarts.init).toHaveBeenCalled()
  })

  it('updates on data change', async () => {
    const wrapper = mount(QualityChart, {
      props: {
        data: []
      }
    })
    const mockChart = (echarts.init as any).mock.results[0].value
    
    await wrapper.setProps({
      data: [{ metric: 'Completeness', score: 90 }]
    })
    
    expect(mockChart.setOption).toHaveBeenCalled()
  })
})
