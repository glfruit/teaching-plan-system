import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { mockGet, mockPost, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

import { usePlanTemplateStore } from './planTemplate'

describe('PlanTemplate Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  it('fetches templates and stores list', async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [{ id: 't-1', title: '模板A' }],
        },
      },
    })
    const store = usePlanTemplateStore()

    await store.fetchTemplates({ page: 1, limit: 10, search: '模板' })

    expect(mockGet).toHaveBeenCalledWith('/plan-templates?page=1&limit=10&search=%E6%A8%A1%E6%9D%BF')
    expect(store.templates).toHaveLength(1)
    expect(store.templates[0].title).toBe('模板A')
  })

  it('creates template and prepends into list', async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: { id: 't-2', title: '模板B' },
      },
    })
    const store = usePlanTemplateStore()

    const result = await store.createTemplate({
      title: '模板B',
      courseName: '语文',
      className: '三年级',
      duration: 40,
      objectives: '<p>obj</p>',
      keyPoints: '<p>key</p>',
      process: '<p>proc</p>',
      blackboard: '<p>bb</p>',
      reflection: '<p>rf</p>',
      methods: '',
      resources: '',
      htmlContent: '<p>proc</p>',
      contentJson: {},
    })

    expect(result?.id).toBe('t-2')
    expect(store.templates[0].id).toBe('t-2')
  })

  it('deletes template and updates list', async () => {
    mockDelete.mockResolvedValue({
      data: { success: true },
    })
    const store = usePlanTemplateStore()
    store.templates = [
      {
        id: 't-del',
        title: '待删除',
        courseName: '语文',
        className: '三年级',
        duration: 40,
        objectives: '<p>obj</p>',
        keyPoints: '<p>key</p>',
        process: '<p>proc</p>',
        blackboard: '<p>bb</p>',
        reflection: '<p>rf</p>',
        methods: '',
        resources: '',
        htmlContent: '<p>proc</p>',
      },
    ]

    await store.deleteTemplate('t-del')
    expect(mockDelete).toHaveBeenCalledWith('/plan-templates/t-del')
    expect(store.templates).toHaveLength(0)
  })

  it('fetches template detail and updates template', async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: { id: 't-3', title: '详情模板' },
      },
    })
    mockPatch.mockResolvedValue({
      data: {
        success: true,
        data: { id: 't-3', title: '已更新模板' },
      },
    })
    const store = usePlanTemplateStore()
    store.templates = [
      {
        id: 't-3',
        title: '详情模板',
        courseName: '语文',
        className: '三年级',
        duration: 40,
        objectives: '<p>obj</p>',
        keyPoints: '<p>key</p>',
        process: '<p>proc</p>',
        blackboard: '<p>bb</p>',
        reflection: '<p>rf</p>',
        methods: '',
        resources: '',
        htmlContent: '<p>proc</p>',
      },
    ]

    const detail = await store.fetchTemplate('t-3')
    expect(detail.title).toBe('详情模板')

    await store.updateTemplate('t-3', { title: '已更新模板' })
    expect(mockPatch).toHaveBeenCalledWith('/plan-templates/t-3', { title: '已更新模板' })
    expect(store.templates[0].title).toBe('已更新模板')
  })
})
