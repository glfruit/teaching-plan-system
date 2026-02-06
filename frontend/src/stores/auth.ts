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

export interface User {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'TEACHER'
  department?: string
  createdAt: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  role?: 'ADMIN' | 'TEACHER'
  department?: string
}

/**
 * 用户认证状态管理 Store
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isTeacher = computed(() => user.value?.role === 'TEACHER')

  // Initialize user from localStorage
  const initUser = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      } catch {
        logout()
      }
    }
  }

  /**
   * 用户登录
   */
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { user: userData, accessToken } = response.data.data
        
        // 保存到状态
        user.value = userData
        token.value = accessToken
        
        // 保存到 localStorage
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // 设置 axios 默认 header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        return userData
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败，请检查用户名和密码'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (data: RegisterData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', data)
      
      if (response.data.success) {
        const { user: userData, accessToken } = response.data.data
        
        user.value = userData
        token.value = accessToken
        
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        return userData
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '注册失败'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    delete api.defaults.headers.common['Authorization']
  }

  /**
   * 清除错误信息
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isTeacher,
    // Actions
    initUser,
    login,
    register,
    logout,
    clearError,
  }
})

// Export api for use in other stores
export { api }
