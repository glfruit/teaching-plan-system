import { defineStore } from 'pinia'
import { getAnalytics } from '../api/analytics'

export interface AnalyticsData {
  workload: any[]
  execution: any[]
  quality: any[]
  trend: any[]
}

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    loading: false,
    error: null as string | null,
    data: {
      workload: [],
      execution: [],
      quality: [],
      trend: []
    } as AnalyticsData
  }),
  actions: {
    async fetchAnalyticsData() {
      this.loading = true
      this.error = null
      try {
        const data = await getAnalytics()
        this.data = data
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})
