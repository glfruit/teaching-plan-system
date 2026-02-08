<template>
  <div class="analytics-view p-6">
    <h1 class="text-2xl font-bold mb-6">Analytics Dashboard</h1>
    
    <div v-if="store.loading" class="loading text-center p-10">
      Loading analytics data...
    </div>

    <div v-else-if="store.error" class="error text-red-500 p-10 text-center">
      Error: {{ store.error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-4">Teacher Workload</h2>
        <WorkloadChart :data="store.data.workload" />
      </div>

      <div class="card bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-4">Execution Status</h2>
        <ExecutionChart :data="store.data.execution" />
      </div>

      <div class="card bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-4">Quality Metrics</h2>
        <QualityChart :data="store.data.quality" />
      </div>

      <div class="card bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-4">Plan Trends</h2>
        <TrendChart :data="store.data.trend" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analytics'
import {
  WorkloadChart,
  ExecutionChart,
  QualityChart,
  TrendChart
} from '../components/analytics'

const store = useAnalyticsStore()

onMounted(() => {
  store.fetchAnalyticsData()
})
</script>
