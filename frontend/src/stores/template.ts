import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from './auth'

export interface TeachingTemplate {
  id: string
  name: string
  description?: string
  category: string
  structure: any
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<TeachingTemplate[]>([])
  const currentTemplate = ref<TeachingTemplate | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const systemTemplates = computed(() => 
    templates.value.filter(t => t.isSystem)
  )
  
  const myTemplates = computed(() => 
    templates.value.filter(t => !t.isSystem)
  )
  
  const templatesByCategory = computed(() => {
    const grouped: Record<string, TeachingTemplate[]> = {}
    templates.value.forEach(t => {
      if (!grouped[t.category]) {
        grouped[t.category] = []
      }
      grouped[t.category].push(t)
    })
    return grouped
  })
  
  // Actions
  const fetchTemplates = async (category?: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const params = category ? { category } : {}
      const response = await api.get('/templates', { params })
      
      if (response.data.success) {
        templates.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch templates'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  const fetchTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/templates/${id}`)
      
      if (response.data.success) {
        currentTemplate.value = response.data.data
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch template'
      console.error(err)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  const createTemplate = async (data: Partial<TeachingTemplate>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/templates', data)
      
      if (response.data.success) {
        templates.value.unshift(response.data.data)
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create template'
      console.error(err)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  const updateTemplate = async (id: string, data: Partial<TeachingTemplate>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/templates/${id}`, data)
      
      if (response.data.success) {
        // Update local state
        const index = templates.value.findIndex(t => t.id === id)
        if (index !== -1) {
          templates.value[index] = { ...templates.value[index], ...data }
        }
        if (currentTemplate.value?.id === id) {
          currentTemplate.value = { ...currentTemplate.value, ...data }
        }
        return true
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update template'
      console.error(err)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  const deleteTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.delete(`/templates/${id}`)
      
      if (response.data.success) {
        templates.value = templates.value.filter(t => t.id !== id)
        if (currentTemplate.value?.id === id) {
          currentTemplate.value = null
        }
        return true
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete template'
      console.error(err)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    templates,
    currentTemplate,
    isLoading,
    error,
    systemTemplates,
    myTemplates,
    templatesByCategory,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
})
