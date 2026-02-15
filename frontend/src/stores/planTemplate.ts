import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { JSONContent } from '@tiptap/core'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface PlanTemplate {
  id?: string
  title: string
  courseName: string
  className: string
  duration: number
  objectives: string
  keyPoints: string
  process: string
  blackboard: string
  reflection: string
  methods: string
  resources: string
  htmlContent: string
  contentJson?: Partial<
    Record<'objectives' | 'keyPoints' | 'process' | 'blackboard' | 'reflection', JSONContent>
  >
  tags?: string[]
  teacherId?: string
  createdAt?: string
  updatedAt?: string
}

export const normalizeTemplateTags = (tags?: string[]) =>
  Array.from(new Set((tags || []).map((item) => item.trim()).filter((item) => item.length > 0)))

export const usePlanTemplateStore = defineStore('planTemplate', () => {
  const templates = ref<PlanTemplate[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const fetchTemplates = async (params?: {
    page?: number
    limit?: number
    search?: string
    tag?: string
  }) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.search) queryParams.append('search', params.search)
      if (params?.tag) queryParams.append('tag', params.tag)
      const query = queryParams.toString()
      const response = await api.get(`/plan-templates${query ? `?${query}` : ''}`)
      if (response.data.success) {
        templates.value = response.data.data.items
      }
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取模板失败'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const createTemplate = async (payload: PlanTemplate) => {
    isSaving.value = true
    error.value = null
    try {
      const response = await api.post('/plan-templates', {
        ...payload,
        tags: normalizeTemplateTags(payload.tags),
      })
      if (response.data.success) {
        templates.value.unshift(response.data.data)
        return response.data.data as PlanTemplate
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建模板失败'
      throw error.value
    } finally {
      isSaving.value = false
    }
  }

  const fetchTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/plan-templates/${id}`)
      return response.data.data as PlanTemplate
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取模板详情失败'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const updateTemplate = async (id: string, payload: Partial<PlanTemplate>) => {
    isSaving.value = true
    error.value = null
    try {
      const response = await api.patch(`/plan-templates/${id}`, {
        ...payload,
        tags: payload.tags ? normalizeTemplateTags(payload.tags) : undefined,
      })
      if (response.data.success) {
        const index = templates.value.findIndex((item) => item.id === id)
        if (index >= 0) {
          templates.value[index] = response.data.data
        }
        return response.data.data as PlanTemplate
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新模板失败'
      throw error.value
    } finally {
      isSaving.value = false
    }
  }

  const deleteTemplate = async (id: string) => {
    error.value = null
    try {
      const response = await api.delete(`/plan-templates/${id}`)
      if (response.data.success) {
        templates.value = templates.value.filter((item) => item.id !== id)
      }
      return response.data.success
    } catch (err: any) {
      error.value = err.response?.data?.message || '删除模板失败'
      throw error.value
    }
  }

  return {
    templates,
    isLoading,
    isSaving,
    error,
    fetchTemplates,
    createTemplate,
    fetchTemplate,
    updateTemplate,
    deleteTemplate,
  }
})
