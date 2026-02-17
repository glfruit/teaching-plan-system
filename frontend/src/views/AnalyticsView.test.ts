import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AnalyticsView from './AnalyticsView.vue'

const pushMock = vi.fn()
const logoutMock = vi.fn()
const getAnalyticsMock = vi.fn()
const linearGradientMock = vi.fn(() => ({}))
const echartsInitMock = vi.fn(() => ({
  setOption: vi.fn(),
  dispose: vi.fn(),
  resize: vi.fn(),
}))
function LinearGradientMock(...args: unknown[]) {
  linearGradientMock(...args)
  return {}
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('../stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      id: 'u-1',
      username: 'testteacher',
      email: 'testteacher@example.com',
      role: 'TEACHER',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    logout: logoutMock,
  }),
}))

vi.mock('../api/analytics', () => ({
  getAnalytics: (...args: unknown[]) => getAnalyticsMock(...args),
}))

vi.mock('echarts/core', () => ({
  init: (...args: unknown[]) => echartsInitMock(...args),
  use: vi.fn(),
  graphic: {
    LinearGradient: LinearGradientMock,
  },
}))

vi.mock('echarts/charts', () => ({
  LineChart: {},
}))

vi.mock('echarts/components', () => ({
  GridComponent: {},
  TooltipComponent: {},
}))

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: {},
}))

vi.mock('../components/layout/NavBar.vue', () => ({
  default: {
    name: 'NavBar',
    template: '<div class="nav-bar-stub" />',
  },
}))

describe('AnalyticsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAnalyticsMock.mockResolvedValue({
      workload: [{ teacherId: 't-1', name: '教师A', planCount: 2 }],
      execution: [{ status: 'completed' }, { status: 'draft' }],
      quality: [],
      trend: [
        { date: '2026-02-01', count: 1 },
        { date: '2026-02-02', count: 2 },
      ],
    })
  })

  it('renders analytics page title and navbar', async () => {
    const wrapper = mount(AnalyticsView)
    await flushPromises()

    expect(wrapper.find('.nav-bar-stub').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('数据分析')
  })

  it('fetches analytics on mount and initializes chart', async () => {
    mount(AnalyticsView)
    await flushPromises()

    expect(getAnalyticsMock).toHaveBeenCalledTimes(1)
    expect(echartsInitMock).toHaveBeenCalledTimes(1)
  })

  it('shows loading state while analytics request is pending', async () => {
    let resolveRequest: ((value: unknown) => void) | null = null
    getAnalyticsMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    const wrapper = mount(AnalyticsView)
    await nextTick()

    expect(wrapper.text()).toContain('加载中...')

    resolveRequest?.({
      workload: [],
      execution: [],
      quality: [],
      trend: [],
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('加载中...')
  })

  it('renders computed summary blocks from analytics data', async () => {
    const wrapper = mount(AnalyticsView)
    await flushPromises()

    expect(wrapper.text()).toContain('总教案数')
    expect(wrapper.text()).toContain('发布率')
    expect(wrapper.text()).toContain('已发布')
    expect(wrapper.text()).toContain('(50%)')
  })

  it('falls back to empty-state cards when api request fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getAnalyticsMock.mockRejectedValueOnce(new Error('network failed'))

    const wrapper = mount(AnalyticsView)
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('加载分析数据失败:', expect.any(Error))
    expect(wrapper.text()).toContain('暂无数据')
    errorSpy.mockRestore()
  })

  it('shows trend empty placeholder when there is no trend data', async () => {
    getAnalyticsMock.mockResolvedValueOnce({
      workload: [],
      execution: [],
      quality: [],
      trend: [],
    })

    const wrapper = mount(AnalyticsView)
    await flushPromises()

    expect(wrapper.text()).toContain('暂无趋势数据')
  })
})
