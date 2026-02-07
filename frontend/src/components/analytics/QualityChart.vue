<template>
  <div class="quality-chart" ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { metric: string; score: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    updateChart()
  }
}

const updateChart = () => {
  if (!chart) return

  const option = {
    title: {
      text: 'Quality Metrics'
    },
    tooltip: {},
    radar: {
      indicator: props.data.map(item => ({
        name: item.metric,
        max: 100 // Assuming score is out of 100
      }))
    },
    series: [
      {
        name: 'Quality Score',
        type: 'radar',
        data: [
          {
            value: props.data.map(item => item.score),
            name: 'Current Plan'
          }
        ]
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  initChart()
})

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
})
</script>
