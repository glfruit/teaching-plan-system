import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore()
      
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Getters', () => {
    it('should return false for isAuthenticated when no token', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return false for isAdmin when user is TEACHER', () => {
      const store = useAuthStore()
      store.user = {
        id: '1',
        username: 'test',
        email: 'test@test.com',
        role: 'TEACHER',
        createdAt: '2026-01-01'
      }
      expect(store.isAdmin).toBe(false)
      expect(store.isTeacher).toBe(true)
    })

    it('should return true for isAdmin when user is ADMIN', () => {
      const store = useAuthStore()
      store.user = {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        role: 'ADMIN',
        createdAt: '2026-01-01'
      }
      expect(store.isAdmin).toBe(true)
      expect(store.isTeacher).toBe(false)
    })
  })

  describe('initUser', () => {
    it('should load user from localStorage', () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: 'TEACHER',
        createdAt: '2026-01-01'
      }
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      const store = useAuthStore()
      store.initUser()

      expect(store.token).toBe('mock-token')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should handle invalid localStorage data', () => {
      localStorage.setItem('user', 'invalid-json')
      localStorage.setItem('token', 'token')

      const store = useAuthStore()
      store.initUser()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user and token', () => {
      const store = useAuthStore()
      store.user = {
        id: '1',
        username: 'test',
        email: 'test@test.com',
        role: 'TEACHER',
        createdAt: '2026-01-01'
      }
      store.token = 'token'
      localStorage.setItem('token', 'token')
      localStorage.setItem('user', '{}')

      store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error message', () => {
      const store = useAuthStore()
      store.error = 'Some error'
      
      store.clearError()
      
      expect(store.error).toBeNull()
    })
  })
})
