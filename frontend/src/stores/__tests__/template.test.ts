import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTemplateStore } from '../template'
import { api } from '../auth'

vi.mock('../auth', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Template Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches templates successfully', async () => {
    const store = useTemplateStore()
    const mockTemplates = [
      { id: '1', name: 'Test Template', isSystem: true, category: 'THEORY' },
      { id: '2', name: 'User Template', isSystem: false, category: 'PRACTICE' },
    ]
    
    // @ts-ignore
    api.get.mockResolvedValue({
      data: { success: true, data: mockTemplates }
    })
    
    await store.fetchTemplates()
    
    expect(store.templates).toHaveLength(2)
    expect(store.systemTemplates).toHaveLength(1)
    expect(store.myTemplates).toHaveLength(1)
    expect(api.get).toHaveBeenCalledWith('/templates', { params: {} })
  })

  it('creates a template', async () => {
    const store = useTemplateStore()
    const newTemplate = { name: 'New Template', category: 'THEORY' }
    const createdTemplate = { ...newTemplate, id: '3', isSystem: false }
    
    // @ts-ignore
    api.post.mockResolvedValue({
      data: { success: true, data: createdTemplate }
    })
    
    await store.createTemplate(newTemplate)
    
    expect(store.templates).toContainEqual(createdTemplate)
    expect(api.post).toHaveBeenCalledWith('/templates', newTemplate)
  })
})
