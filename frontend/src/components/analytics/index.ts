import { defineAsyncComponent } from 'vue'
import ChartLoader from './ChartLoader.vue'

export const WorkloadChart = defineAsyncComponent({
  loader: () => import('./WorkloadChart.vue'),
  loadingComponent: ChartLoader,
  delay: 200,
  timeout: 10000,
})

export const ExecutionChart = defineAsyncComponent({
  loader: () => import('./ExecutionChart.vue'),
  loadingComponent: ChartLoader,
  delay: 200,
  timeout: 10000,
})

export const QualityChart = defineAsyncComponent({
  loader: () => import('./QualityChart.vue'),
  loadingComponent: ChartLoader,
  delay: 200,
  timeout: 10000,
})

export const TrendChart = defineAsyncComponent({
  loader: () => import('./TrendChart.vue'),
  loadingComponent: ChartLoader,
  delay: 200,
  timeout: 10000,
})
