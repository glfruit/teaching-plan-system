import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

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

export interface WeeklyPlan {
  id: string
  semesterPlanId: string
  weekNumber: number
  startDate: string
  endDate: string
  plannedContent?: string
  actualContent?: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ADJUSTED'
  teachingPlanId?: string
  teachingPlan?: { id: string, title: string }
  notes?: string
}

export interface SemesterPlan {
  id?: string
  courseName: string
  semester: string
  startDate?: string
  totalWeeks: number
  weeklyHours: number
  description?: string
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  createdAt?: string
  updatedAt?: string
  weeklyPlans?: WeeklyPlan[]
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

export const useSemesterPlanStore = defineStore('semesterPlan', () => {
  // State
  const plans = ref<SemesterPlan[]>([])
  const currentPlan = ref<SemesterPlan | null>(null)
  const currentWeeklyPlan = ref<WeeklyPlan | null>(null)
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
  const isActive = computed(() => currentPlan.value?.status === 'ACTIVE')

  // Actions
  const fetchPlans = async (params?: {
    page?: number
    limit?: number
    semester?: string
    status?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.semester) queryParams.append('semester', params.semester)
      if (params?.status) queryParams.append('status', params.status)

      const response = await api.get(`/semester-plans?${queryParams.toString()}`)
      
      if (response.data.success) {
        plans.value = response.data.data.items
        pagination.value = response.data.data.pagination
      }
      
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch semester plans'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlan = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/semester-plans/${id}`)
      
      if (response.data.success) {
        currentPlan.value = response.data.data
      }
      
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch semester plan'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const createPlan = async (data: Partial<SemesterPlan>) => {
    isSaving.value = true
    error.value = null

    try {
      const response = await api.post('/semester-plans', data)
      
      if (response.data.success) {
        currentPlan.value = response.data.data
        // Optionally add to list if applicable
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create semester plan'
      throw error.value
    } finally {
      isSaving.value = false
    }
  }

  const updatePlan = async (id: string, data: Partial<SemesterPlan>) => {
    isSaving.value = true
    error.value = null

    try {
      const response = await api.put(`/semester-plans/${id}`, data)
      
      if (response.data.success) {
        currentPlan.value = response.data.data
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update semester plan'
      throw error.value
    } finally {
      isSaving.value = false
    }
  }

  const deletePlan = async (id: string) => {
    try {
      const response = await api.delete(`/semester-plans/${id}`)
      
      if (response.data.success) {
        const index = plans.value.findIndex(p => p.id === id)
        if (index > -1) {
          plans.value.splice(index, 1)
        }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete semester plan'
      throw error.value
    }
  }

  const updateWeeklyPlan = async (id: string, data: Partial<WeeklyPlan>) => {
    isSaving.value = true
    error.value = null
    try {
        const response = await api.put(`/weekly-plans/${id}`, data);
        if (response.data.success) {
            // Update currentWeeklyPlan
            currentWeeklyPlan.value = response.data.data;
            if (currentPlan.value && currentPlan.value.weeklyPlans) {
                // Update local state in semester plan if exists
                const index = currentPlan.value.weeklyPlans.findIndex(wp => wp.id === id);
                if (index > -1) {
                    // Merge updates
                    Object.assign(currentPlan.value.weeklyPlans[index], response.data.data);
                }
            }
        }
        return response.data.data;
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to update weekly plan';
        throw error.value;
    } finally {
        isSaving.value = false;
    }
  }

  const fetchWeeklyPlan = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await api.get(`/weekly-plans/${id}`);
        if (response.data.success) {
            currentWeeklyPlan.value = response.data.data;
        }
        return response.data.data;
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to fetch weekly plan';
        throw error.value;
    } finally {
        isLoading.value = false;
    }
  }

  const resetCurrentPlan = () => {
    currentPlan.value = null
    currentWeeklyPlan.value = null
    error.value = null
  }

  return {
    plans,
    currentPlan,
    currentWeeklyPlan,
    pagination,
    isLoading,
    isSaving,
    error,
    hasPlans,
    isDraft,
    isActive,
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    updateWeeklyPlan,
    fetchWeeklyPlan,
    resetCurrentPlan,
  }
})
