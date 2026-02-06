import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除登录状态
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface TeachingPlan {
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
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt?: string
  updatedAt?: string
  teacher?: {
    id: string
    username: string
    department: string
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * 教案状态管理 Store
 */
export const usePlanStore = defineStore('plan', () => {
  // State
  const plans = ref<TeachingPlan[]>([])
  const currentPlan = ref<TeachingPlan | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasPlans = computed(() => plans.value.length > 0)
  const isDraft = computed(() => currentPlan.value?.status === 'DRAFT')
  const isPublished = computed(() => currentPlan.value?.status === 'PUBLISHED')

  // Actions

  /**
   * 获取教案列表
   */
  const fetchPlans = async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    courseName?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.search) queryParams.append('search', params.search)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.courseName) queryParams.append('courseName', params.courseName)

      const response = await api.get(`/teaching-plans?${queryParams.toString()}`)
      
      if (response.data.success) {
        plans.value = response.data.data.items
        pagination.value = response.data.data.pagination
      }
      
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取教案列表失败'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单个教案
   */
  const fetchPlan = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/teaching-plans/${id}`)
      
      if (response.data.success) {
        currentPlan.value = response.data.data
      }
      
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取教案失败'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建教案
   */
  const createPlan = async (data: Partial<TeachingPlan>) => {
    isSaving.value = true
    error.value = null

    try {
      const response = await api.post('/teaching-plans', data)
      
      if (response.data.success) {
        currentPlan.value = response.data.data
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建教案失败'
      throw error.value
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 更新教案
   */
  const updatePlan = async (id: string, data: Partial<TeachingPlan>) => {
    isSaving.value = true
    error.value = null

    try {
      const response = await api.put(`/teaching-plans/${id}`, data)
      
      if (response.data.success) {
        currentPlan.value = response.data.data
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新教案失败'
      throw error.value
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 删除教案
   */
  const deletePlan = async (id: string) => {
    try {
      const response = await api.delete(`/teaching-plans/${id}`)
      
      if (response.data.success) {
        // 从列表中移除
        const index = plans.value.findIndex(p => p.id === id)
        if (index > -1) {
          plans.value.splice(index, 1)
        }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '删除教案失败'
      throw error.value
    }
  }

  /**
   * 发布教案
   */
  const publishPlan = async (id: string) => {
    try {
      const response = await api.patch(`/teaching-plans/${id}/publish`)
      
      if (response.data.success) {
        if (currentPlan.value?.id === id) {
          currentPlan.value.status = 'PUBLISHED'
        }
      }
      
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '发布教案失败'
      throw error.value
    }
  }

  /**
   * 归档教案
   */
  const archivePlan = async (id: string) => {
    try {
      const response = await api.patch(`/teaching-plans/${id}/archive`)
      
      if (response.data.success) {
        if (currentPlan.value?.id === id) {
          currentPlan.value.status = 'ARCHIVED'
        }
      }
      
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '归档教案失败'
      throw error.value
    }
  }

  /**
   * 重置当前教案
   */
  const resetCurrentPlan = () => {
    currentPlan.value = null
    error.value = null
  }

  return {
    // State
    plans,
    currentPlan,
    pagination,
    isLoading,
    isSaving,
    error,
    // Getters
    hasPlans,
    isDraft,
    isPublished,
    // Actions
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    publishPlan,
    archivePlan,
    resetCurrentPlan,
  }
})
