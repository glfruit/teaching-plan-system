import { defineStore } from 'pinia'
import { ref } from 'vue'
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

export interface CourseSchedule {
  id: string
  courseName: string
  className: string
  dayOfWeek: number
  period: number
  classroom?: string
  semester: string
}

export const useCourseScheduleStore = defineStore('courseSchedule', () => {
  const schedules = ref<CourseSchedule[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchedules = async (semester?: string) => {
    isLoading.value = true
    try {
      const response = await api.get('/course-schedules', { params: { semester } })
      if (response.data.success) {
        schedules.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const createSchedule = async (data: Omit<CourseSchedule, 'id'>) => {
    isLoading.value = true
    try {
      const response = await api.post('/course-schedules', data)
      if (response.data.success) {
        schedules.value.push(response.data.data)
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const deleteSchedule = async (id: string) => {
    isLoading.value = true
    try {
      await api.delete(`/course-schedules/${id}`)
      const index = schedules.value.findIndex(s => s.id === id)
      if (index > -1) schedules.value.splice(index, 1)
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    schedules,
    isLoading,
    error,
    fetchSchedules,
    createSchedule,
    deleteSchedule
  }
})
